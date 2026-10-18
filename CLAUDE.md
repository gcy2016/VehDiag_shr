# 给 Claude 的说明

**当前仓库：VehDiag_shr（Share 分享版）**——给有一定专业能力的同事查看报文。两个功能：① 报文查看：打开 .blf / .asc 看原始报文（按 ID 筛选、“仅诊断报文”一键筛选、多选报文复制给 AI 助手），不带 DBC，不做信号或诊断解析；② 故障码查询：和 GNL 一样，诊断问卷 Excel 由使用者自己上传（只存在本机浏览器），仓库里不放真实问卷。公开、不需要密码。

- 文件：`index.html`（页面）、`canlog.js`（BLF / ASC 读取）、`ai.js`（AI 助手，和 SEF / GNL 共用同一份，改了要同步）、`qn.js` 与 `lib/xlsx.full.min.js`（问卷解析，GNL 的副本，改了要同步）、`诊断问卷模板.xlsx`（与 GNL 相同，只有通用示例码）。
- 故障码查询部分的页面代码与 GNL `index.html` 的“故障码查询”一致，改一个就同步另一个。
- 不要往这里加解析功能，除非用户明确要求。

## 四个仓库的定位（同一个用户 gcy2016 的售后诊断工具系列）
| 仓库 | 含义 | 定位 | 网址 |
|---|---|---|---|
| VehDiag_pub | Public 公共版 | 给非专业人员自助查询故障码；没有报文解析和数据分析功能。打开即用，无密码 | https://gcy2016.github.io/VehDiag_pub/ |
| VehDiag_sef | Self 自用版 | 用户自己用；功能最多，加密内容也最多（网站数据用 6 位网站密码，原始 DBC / 问卷用长的原始文件密码） | https://gcy2016.github.io/VehDiag_sef/ |
| VehDiag_shr | Share 分享版 | 给有一定专业能力的人查看报文；只能看原始报文（另有 AI 助手），不带 DBC、不做解析；另有故障码查询（诊断问卷由使用者自己上传，同 GNL）。无密码 | https://gcy2016.github.io/VehDiag_shr/ |
| VehDiag_gnl | General 通用版 | 功能和自用版一致，但仓库里只有代码，DBC、诊断问卷都由使用者自己上传。无密码 | https://gcy2016.github.io/VehDiag_gnl/ |

## 通用规则（四个仓库相同）
- 仓库都是公开的：不要把任何密码写进文件、提交或 issue。
- 用户已同意四个仓库都可以直接推送到 `main`（推送前先在本地测试），不必走 PR。
- 需要在 GitHub 网页上操作时（改设置、Pages 等）交给 Muse（Meta 的 AI，用 gcy2016 账号操作）：在相关仓库开 issue，标题以“muse：”开头，写清楚逐步操作，请 muse 完成后回复并关闭；不要写 `@muse`（那是无关的陌生账号）。
- 用户偏好：功能够用就行，别做成大而全的 CANalyzer；配色以主题蓝为主；手机和电脑都要适配（手机不超出屏幕宽度、输入框字号 ≥16px，电脑布局合理）。能选报文的仓库（SEF、SHR、GNL）交互保持一致，改一个就同步改其他。
- 更完整的说明（报文分析流程、待办）见 VehDiag_sef 仓库的 CLAUDE.md。

@AI_TEAM.md
