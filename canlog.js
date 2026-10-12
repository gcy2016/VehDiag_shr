// 报文读取：BLF / ASC → 帧表。浏览器和 Node（自测）通用。
const CanLog = (() => {
  const EXT = 0x80000000;

  // ---- 帧表：按列存放，省内存 ----
  class Frames {
    constructor() {
      this.n = 0; this.cap = 0; this.dlen = 0;
      this.grow(1 << 14);
      this.data = new Uint8Array(1 << 20);
    }
    grow(cap) {
      const re = (A, old) => { const a = new A(cap); if (old) a.set(old.subarray(0, this.n)); return a; };
      this.t = re(Float64Array, this.t); this.id = re(Uint32Array, this.id); this.off = re(Uint32Array, this.off);
      this.len = re(Uint8Array, this.len); this.ch = re(Uint8Array, this.ch); this.fl = re(Uint8Array, this.fl);
      this.cap = cap;
    }
    // fl：1=发送 2=CAN FD 4=远程帧
    push(t, id, ch, fl, bytes) {
      if (this.n === this.cap) this.grow(this.cap * 2);
      if (this.dlen + bytes.length > this.data.length) {
        const d = new Uint8Array(this.data.length * 2); d.set(this.data.subarray(0, this.dlen)); this.data = d;
      }
      const i = this.n++;
      this.t[i] = t; this.id[i] = id; this.ch[i] = ch; this.fl[i] = fl;
      this.len[i] = bytes.length; this.off[i] = this.dlen;
      this.data.set(bytes, this.dlen); this.dlen += bytes.length;
    }
    bytes(i) { return this.data.subarray(this.off[i], this.off[i] + this.len[i]); }
    // 结束读取：时间从 0 开始、按时间排序（多通道 BLF 偶有乱序）、建 ID 索引
    finish() {
      const n = this.n;
      for (const k of ['t', 'id', 'off', 'len', 'ch', 'fl']) this[k] = this[k].slice(0, n);
      this.data = this.data.slice(0, this.dlen);
      let sorted = true;
      for (let i = 1; i < n; i++) if (this.t[i] < this.t[i - 1]) { sorted = false; break; }
      if (!sorted) {
        const ord = Uint32Array.from({ length: n }, (_, i) => i).sort((a, b) => this.t[a] - this.t[b]);
        for (const k of ['t', 'id', 'off', 'len', 'ch', 'fl']) {
          const src = this[k], a = new src.constructor(n);
          for (let i = 0; i < n; i++) a[i] = src[ord[i]];
          this[k] = a;
        }
      }
      this.t0 = n ? this.t[0] : 0;
      for (let i = 0; i < n; i++) this.t[i] -= this.t0;
      this.dur = n ? this.t[n - 1] : 0;
      const cnt = new Map();
      for (let i = 0; i < n; i++) cnt.set(this.id[i], (cnt.get(this.id[i]) || 0) + 1);
      this.byId = new Map();
      for (const [id, c] of cnt) this.byId.set(id, new Uint32Array(c));
      const pos = new Map();
      for (let i = 0; i < n; i++) {
        const id = this.id[i], p = pos.get(id) || 0;
        this.byId.get(id)[p] = i; pos.set(id, p + 1);
      }
      return this;
    }
  }

  // ---- BLF（Vector 二进制日志）----
  const td = new TextDecoder('latin1');
  const sig4 = (u8, p) => td.decode(u8.subarray(p, p + 4));

  async function inflate(u8) {
    const ds = new DecompressionStream('deflate');    // BLF 用 zlib 封装，对应 'deflate'
    const out = new Response(new Blob([u8]).stream().pipeThrough(ds));
    return new Uint8Array(await out.arrayBuffer());
  }

  function findLOBJ(u8, p) {
    for (const end = u8.length - 3; p < end; p++)
      if (u8[p] === 0x4C && u8[p + 1] === 0x4F && u8[p + 2] === 0x42 && u8[p + 3] === 0x4A) return p;
    return -1;
  }

  // 解析一段（解压后的）对象流；返回未完整的尾部起点
  function blfObjects(u8, fr) {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    let p = 0;
    for (;;) {
      p = findLOBJ(u8, p);
      if (p < 0 || p + 16 > u8.length) return p < 0 ? Math.max(0, u8.length - 3) : p;
      const hsize = dv.getUint16(p + 4, true);
      const osize = dv.getUint32(p + 8, true), type = dv.getUint32(p + 12, true);
      if (osize < 16) { p += 4; continue; }
      if (p + osize > u8.length) return p;
      const flags = dv.getUint32(p + 16, true);
      const ts = Number(dv.getBigUint64(p + 24, true));       // V1 / V2 对象头的时间戳都在偏移 24
      const t = ts * (flags === 1 ? 1e-5 : 1e-9);
      const b = p + hsize;
      if (type === 1 || type === 86) {                          // CAN_MESSAGE / CAN_MESSAGE2
        const ch = dv.getUint16(b, true), f = u8[b + 2], dlc = u8[b + 3], id = dv.getUint32(b + 4, true);
        const n = Math.min(dlc, 8);
        fr.push(t, id, ch, (f & 1) | (f & 0x80 ? 4 : 0), f & 0x80 ? new Uint8Array(0) : u8.subarray(b + 8, b + 8 + n));
      } else if (type === 100) {                                // CAN_FD_MESSAGE
        const ch = dv.getUint16(b, true), f = u8[b + 2], id = dv.getUint32(b + 4, true);
        const fdf = u8[b + 13], n = Math.min(u8[b + 14], 64);
        fr.push(t, id, ch, (f & 1) | (fdf & 1 ? 2 : 0) | (f & 0x80 ? 4 : 0), u8.subarray(b + 20, b + 20 + n));
      } else if (type === 101) {                                // CAN_FD_MESSAGE_64
        const ch = u8[b], n = Math.min(u8[b + 2], 64), id = dv.getUint32(b + 4, true);
        const f = dv.getUint32(b + 12, true), dir = u8[b + 34];
        fr.push(t, id, ch, (dir === 1 ? 1 : 0) | (f & 0x1000 ? 2 : 0) | (f & 0x10 ? 4 : 0), u8.subarray(b + 40, b + 40 + n));
      }
      p += osize;
    }
  }

  async function readBLF(buf, progress) {
    const u8 = new Uint8Array(buf), dv = new DataView(buf);
    if (sig4(u8, 0) !== 'LOGG') throw new Error('不是有效的 BLF 文件');
    const fr = new Frames();
    let p = dv.getUint32(4, true), tail = new Uint8Array(0), k = 0;
    while (p + 16 <= u8.length) {
      if (sig4(u8, p) !== 'LOBJ') { const q = findLOBJ(u8, p + 1); if (q < 0) break; p = q; continue; }
      const osize = dv.getUint32(p + 8, true), type = dv.getUint32(p + 12, true);
      if (osize < 16 || p + osize > u8.length) break;
      if (type === 10) {                                        // LOG_CONTAINER
        const method = dv.getUint16(p + 16, true);
        let body = u8.subarray(p + 32, p + osize);
        if (method === 2) body = await inflate(body);
        else if (method !== 0) body = null;
        if (body) {
          const all = new Uint8Array(tail.length + body.length);
          all.set(tail); all.set(body, tail.length);
          tail = all.slice(blfObjects(all, fr));
        }
      } else {                                                  // 未打包的对象
        blfObjects(u8.subarray(p, p + osize), fr);
      }
      p += osize + (osize % 4);
      if (progress && (++k & 31) === 0) { progress(p / u8.length); await new Promise(r => setTimeout(r)); }
    }
    return fr.finish();
  }

  // ---- ASC（Vector 文本日志）----
  async function readASC(text, progress) {
    const fr = new Frames();
    let hex = true, rel = false, last = 0;
    const lines = text.split(/\r?\n/);
    const b = new Uint8Array(64);
    for (let li = 0; li < lines.length; li++) {
      const s = lines[li].trim();
      if (!s) continue;
      if (/^base\s/i.test(s)) { hex = /^base\s+hex/i.test(s); rel = /timestamps\s+relative/i.test(s); continue; }
      if (!/^\d/.test(s)) continue;
      const tk = s.split(/\s+/);
      let t = parseFloat(tk[0]);
      if (!isFinite(t)) continue;
      if (rel) { t += last; last = t; }
      const pid = v => {
        const ext = /x$/i.test(v), id = parseInt(ext ? v.slice(0, -1) : v, hex ? 16 : 10);
        return isNaN(id) ? -1 : (ext ? (id | EXT) >>> 0 : id);
      };
      if (/^CANFD$/i.test(tk[1])) {
        // t CANFD ch Rx|Tx id [报文名] brs esi dlc 长度 数据...
        const ch = +tk[2], dir = tk[3], id = pid(tk[4]);
        let k = 5;
        if (!/^[01]$/.test(tk[k])) k++;
        const n = parseInt(tk[k + 3], 10);
        if (id < 0 || !(n >= 0) || n > 64) continue;
        for (let i = 0; i < n; i++) b[i] = parseInt(tk[k + 4 + i], 16);
        fr.push(t, id, ch, (/^tx/i.test(dir) ? 1 : 0) | 2, b.subarray(0, n));
      } else if (/^\d+$/.test(tk[1]) && /^(rx|tx)$/i.test(tk[3])) {
        // t ch id Rx|Tx d|r dlc 数据...
        const ch = +tk[1], id = pid(tk[2]);
        if (id < 0) continue;
        if (/^r$/i.test(tk[4])) { fr.push(t, id, ch, (/^tx/i.test(tk[3]) ? 1 : 0) | 4, b.subarray(0, 0)); continue; }
        if (!/^d$/i.test(tk[4])) continue;
        const n = Math.min(parseInt(tk[5], 16), 8);
        for (let i = 0; i < n; i++) b[i] = parseInt(tk[6 + i], 16);
        fr.push(t, id, ch, /^tx/i.test(tk[3]) ? 1 : 0, b.subarray(0, n));
      }
      if (progress && (li & 0xFFFF) === 0) { progress(li / lines.length); await new Promise(r => setTimeout(r)); }
    }
    return fr.finish();
  }

  async function read(name, buf, progress) {
    if (/\.blf$/i.test(name)) return readBLF(buf, progress);
    if (/\.asc$/i.test(name)) return readASC(new TextDecoder('latin1').decode(buf), progress);
    throw new Error('只支持 .blf 和 .asc 文件');
  }

  return { read, EXT };
})();
if (typeof module !== 'undefined') module.exports = CanLog;
