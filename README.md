# VehDiag_shr — CAN 报文查看

网页打开 Vector **.blf / .asc** 报文，按 ID 筛选查看原始报文（时间、通道、ID、方向、长度、数据）。

- 网址：https://gcy2016.github.io/VehDiag_shr/
- 文件只在本机浏览器内读取，不会上传；电脑、手机都能用
- 筛选：输入 ID（如 `788 7DF`）或范围（如 `700-7FF`），留空显示全部；“仅诊断报文”一键筛出 700-7FF 诊断 ID；点一行查看完整数据，↑ ↓ 键切换

- 🤖 AI 助手：接入任意大模型（DeepSeek / 通义千问 / Kimi / 智谱 / 豆包 / OpenAI / Claude，或任意 OpenAI 兼容接口），在“设置”里自备 API Key（只存在本机浏览器）；可在报文列表里挑选报文（Shift / Ctrl 点击，手机用“多选”），提问时附带选取的原始报文（未挑选时附带选中行前后的报文），发送前可查看修改；没有 Key 可“📋 复制”粘贴到其他 AI

本仓库不含 DBC、诊断问卷，也不在网页里解析报文。

文件：`index.html` 页面；`canlog.js` BLF（含压缩容器、CAN FD）/ ASC 读取；`ai.js` AI 助手。
