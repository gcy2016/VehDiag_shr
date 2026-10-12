# VehDiag_shr — CAN 报文查看

网页打开 Vector **.blf / .asc** 报文，按 ID 筛选查看原始报文（时间、通道、ID、方向、长度、数据）。

- 网址：https://gcy2016.github.io/VehDiag_shr/
- 文件只在本机浏览器内读取，不会上传；电脑、手机都能用
- 筛选：输入 ID（如 `788 7DF`）或范围（如 `700-7FF`），留空显示全部；点一行查看完整数据，↑ ↓ 键切换

本仓库只有报文查看功能，不含 DBC、诊断问卷或报文解析。

文件：`index.html` 页面；`canlog.js` BLF（含压缩容器、CAN FD）/ ASC 读取。
