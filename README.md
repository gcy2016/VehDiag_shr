# VehDiag_shr — CAN 报文查看 · 故障码查询

页面上方选择功能：

## 📄 报文查看
网页打开 Vector **.blf / .asc** 报文，按 ID 筛选查看原始报文（时间、通道、ID、方向、长度、数据）。

- 网址：https://gcy2016.github.io/VehDiag_shr/
- 文件只在本机浏览器内读取，不会上传；电脑、手机都能用
- 筛选：输入 ID（如 `788 7DF`）或范围（如 `700-7FF`），留空显示全部；“仅诊断报文”一键筛出 700-7FF 诊断 ID；点一行查看完整数据，↑ ↓ 键切换

- 🤖 AI 助手：接入任意大模型（DeepSeek / 通义千问 / Kimi / 智谱 / 豆包 / OpenAI / Claude，或任意 OpenAI 兼容接口），在“设置”里自备 API Key（只存在本机浏览器）；可在报文列表里挑选报文（Shift / Ctrl 点击，手机用“多选”），提问时附带选取的原始报文（未挑选时附带选中行前后的报文），发送前可查看修改；没有 Key 可“📋 复制”粘贴到其他 AI

## 🔍 故障码查询
- 先加载诊断问卷 Excel（.xlsx，只在本机浏览器内读取，加载后记在本机，下次不用重选）；有多个 Sheet 时选择对应的车型 / 配置
- 输入显示码或高中低字节，查故障描述、可能原因、维修建议；AI 助手会附带查询的故障码和问卷内容
- 问卷格式与通用版（VehDiag_gnl）相同，见 `诊断问卷模板.xlsx`：表头含 `DTC Number`（右边两列为高中字节、低字节）、`Faults Types`、`Possible Fault`、`Corrective`（各占中文、英文两列）

本仓库不含 DBC、真实诊断问卷，也不在网页里解析报文。

文件：`index.html` 页面；`canlog.js` BLF（含压缩容器、CAN FD）/ ASC 读取；`ai.js` AI 助手；`qn.js` 问卷解析；`lib/xlsx.full.min.js` Excel 读取组件（SheetJS，Apache-2.0，见 `lib/xlsx.LICENSE`）。
