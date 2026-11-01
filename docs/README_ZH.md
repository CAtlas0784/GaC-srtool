# GaCy-Srtool 🌌

<div align="center">

**专为 GaCy GO 及 FreeSR 生态打造的现代化高性能 Web 仪表盘与管理工具**

[English](README_EN.md) | [ภาษาไทย](../README.md) | [简体中文](README_ZH.md)

</div>

---

网页端在线访问：[Vercel 部署版 GaCy Srtool](https://gacy-srtool.vercel.app/)。打开设置页面即可连接正在运行的本地或远程服务端 SDK。

在 GaCy 模式下的 **角色设置 / 特殊系统开关** 页面，可选择开启 Freecam（自由视角）或 FaceCam（面部跟随视角），并预设 FaceCam 的初始视距。保存后在游戏内按下 `Tab` 键即可开启或关闭镜头；鼠标滚轮可临时调节视距，重新开启时将恢复设定值。

## Unstuck / 紧急解卡（解除转圈卡死）

连接 GaCy GO 服务端后，可直接在 GM 命令控制台点击 **Unstuck** 按钮或输入 `/unstuck` 指令。网页端会等待客户端响应确认后提示成功。此操作需在游戏运行且连接服务端时生效。该指令通过心跳机制安全清除等待网络数据包的全屏 UI 阻断，不重置 CW 进度、不切换地图，也不会伪造通关状态；主要用于解救协议等待导致的 UI 卡死。服务端需支持 `/api/client/unstuck` 接口。

本工具为 100% 纯客户端运行的 Web 应用，可直接通过浏览器访问，无需在本地安装额外的复杂依赖环境。支持管理角色数据、配队编排、遗器/光锥属性定制、实战伤害分析，以及深度编辑管理 **GaCy GO**（及标准 FreeSR）的存档文件（`freesr-data.json`, `persistent`）。

---

## ⚡ 核心功能 (Features)

### 📊 1. 实时仪表盘与编队管理 (Live Dashboard & Lineup)
- **实时连接状态监测:** 实时检测与服务端的连通状态，并展示低延迟 Ping 监控指示条。
- **4 人队伍编排管理:** 直观展示当前队伍成员的星魂阶数、专属武器、等级及在大世界场景中的坐标位置。
- **动态 Git 分支显示:** 在页面顶栏与浏览器标头中准确展示当前运行的服务端/前端分支名称（如 `main`, `test-gay`）。
- **资产概览统计:** 统计并展示仓库内的角色总数、光锥储备及遗器收藏规模。

### ⚔️ 2. 实战伤害分析系统 (Real-time Damage Analyst)
- **实时拉取战斗报告:** 从服务端直接获取最新一轮战斗统计日志 (`/api/battle_report`)。
- **核心伤害维度统揽:** 全队总伤害 (Total DMG)、每秒平均伤害 (DPS)、总行动轮次与行动频次 (Action Count)。
- **伤害流派深度解析:**
  - 常规伤害 (Normal DMG)
  - 弱点击破伤害 (Break DMG)
  - 超击破伤害 (Super Break DMG)
  - 持续伤害 (DoT / Damage over Time)
- **暴击与期望分析:** 统计单角色的实际暴击率 (CRIT Rate) 与暴击伤害 (CRIT DMG) 表现。
- **可视化图表与队员贡献比:** 柱状图直观呈现各角色的伤害占比。

### 👤 3. 角色全属性检视 (Character Inspector)
- **真实面板属性计算:** 计算并展示基础属性与遗器/光锥加成后的综合面板（生命上限、攻击力、防御力、速度、双暴、效果命中、击破特攻等）。
- **行迹与技能等级调整:** 完整支持普攻、战技、终结技、天赋以及额外能力分支等级的检视与调节。
- **一键极品配置:** 提供一键满级、满命座 (E6) 及满行迹的便捷配装通道。

### 🛡️ 4. 遗器与光锥深度定制 (Relic & Light Cone Customizer)
- **遗器属性自选打造:** 自由选择遗器套装、主词条与副词条组合，并支持自定义副词条强化点数。
- **光锥叠影与等级配置:** 自由设定光锥等级与叠影等阶 (S1–S5)。

### 🌌 5. 差分宇宙 / 模拟宇宙系统扩展
- 祝福图鉴与奇物库检视，支持直接为当前存档写入特定玩法增益。

### 🎒 6. 背包材料与怪物配置 (Monster Setting & Materials)
- **背包道具批量调整:** 支持直接从服务端提取的客户端道具目录中搜索物品 ID，批量设定数量后单次提交保存。
- **数据安全隔离:** 仅修改 `freesr-data.json` 中的 `materials` 字段，不破坏或覆盖已有的角色、光锥、遗器与战斗配置。
- **怪物场景与波次自选 (Monster Setting):**
  - 支持分别查看混沌回忆 (MoC)、虚构叙事 (PF)、末日幻影 (AS) 与幽影歧路 / 裁决之巅 (AA) 的关卡/怪物图鉴与数据。
  - 支持在黄金之茧与赤红之茧 (Calyx) 中自定义敌人波次。
  - 历战余响、凝滞虚影、侵蚀隧洞及常规高难本保持官方资源配置，避免非法波次导致逻辑紊乱。

### 💾 7. GaCy 专属持久化与存档管理 (Persistent & FreeSR Data)
- **主角开拓者定制:** 自由切换性别（星 Stelle / 穹 Caelus）与命途属性（物理、火、虚数、记忆）。
- **三月七命途切换:** 随时切换存护（冰）与巡猎（虚数）形态。
- **EX 星魂特权开关:** 管理特定角色（如景元 [1204]、丹恒·饮月 [1213]、黄泉 [1308]）的专属 EX 扩展星魂能力。
- **原始 JSON 在线编辑器:** 实时查看、格式化校验、修改并导出 `freesr-data.json` 及 `persistent` 存档。

### 💻 8. GM 调试控制台 (GM Command Console)
- 网页内集成交互式 GM 指令输入框，支持直接向服务端发送管理调试命令并查看实时响应回执。

### 🌐 9. 全球 13 种语言国际化支持 (Multi-Language Support)
- 无需刷新页面即可即时切换语言：中文（简体/繁体）、英语、泰语、日语、韩语、越南语、印尼语、西班牙语、法语、德语、俄语、葡萄牙语。

---

# THERES ONLY DARK MODE IF U ASK FOR LIGHT GO AWAY FROM ME

## 💻 本地运行指南 (Local Usage)

1. **直接双击运行:** 直接使用现代浏览器打开项目根目录下的 `index.html` 即可。
2. **或通过本地静态服务器启动:**
   ```bash
   npx serve .
   ```
   或使用 Python 内置 HTTP 服务：
   ```bash
   python -m http.server 3000
   ```

---

## 🔗 与 GaCy GO 服务端连接机制

GaCy-Srtool 通过 REST API 与 GaCy GO 服务端保持通讯：

| 接口端点 (Endpoint) | 请求方法 | 作用说明 |
| --- | --- | --- |
| `/api/status` | GET | 获取服务状态、当前队伍、角色信息及场景坐标 |
| `/api/freesr` | GET, POST | 读取或完整写入更新 `freesr-data.json` |
| `/api/inventory/materials` | GET, POST | 读取客户端物品清单并指定更新材料数量（不覆盖其他字段） |
| `/api/freesr/avatars` | GET, POST | 查询或保存角色数据与养成状态 |
| `/api/persistent` | GET, POST | 读取或持久化写入 `persistent` 扩展存档 |
| `/api/battle_report` | GET, POST | 获取实时战斗伤害报告与历史战斗结果 |
| `/api/battle_report/reset` | POST | 清空当前已记录的战斗数据统计 |
| `/api/exrank/toggle` | POST | 开启或关闭 EX-Rank 特权扩展状态 |
| `/api/avatar/rank` | POST | 变更指定角色的星魂阶数 |
| `/api/avatar/max_all` | POST | 一键将全角色设为满命 (E6) 及全技能满级 |
| `/api/command` | POST | 派发 GM 调试指令至游戏服务器 |

### 角色与行迹数据保存机制

伤害分析模块根据真实战斗回执中的 `report.avatars[].slot` 对角色卡片进行排序，不跟随大世界预设队伍顺序变动。包含欢愉伤害、真实伤害等细分维度的统计需配合服务端 SDK 及注入了 `StatisticsComponent` 的 `damage_analyst_live.lua` 探针脚本共同使用。

在角色详情页面进行保存时，会通过 `/api/freesr` 单次请求打包提交整套角色数据，包括行迹树对应的 `data.skills` 与 `data.skills_by_anchor_type`，避免行迹数据写入中途被服务端的星魂同步打断。

### 配装推荐与数据来源说明

角色详情中的 **配装指南 / 推荐方案** 展示了基于 Prydwen 统计的当期深渊实战高频配装、遗器主副词条取向，并标注了样本采集日期。该数值代表高难环境中的实用占比统计，并非绝对强度的官方定义。

`js/build-guides-data.js` 内置数据基于 MIT 协议引用自 [LvlUrArti/MocDataProcessed](https://huggingface.co/datasets/LvlUrArti/MocDataProcessed)。使用或二次分发时请保留对 LvlUrArti 的致谢。可通过执行 `npm run sync-build-guides` 自动拉取上游最新发布版本并与本地 `js/avatars-data.js` 的角色 ID 进行索引对齐。

---

## 📖 物品图鉴 (Item Book)

**Item Book** 深度扫描了固定游戏数据版本中所有带 `ItemConfig` 命名的定义数据表。在当前版本中，扫描了 26 个候选表并成功解析出 18 个包含物品定义的表：共计 5,472 行数据对应 5,414 个独立物品 ID。带有 **GaCy supported** 徽标的物品直接与 Go 服务端的 `InventoryItemConfig.json` 保持联动；其余条目仅供图鉴浏览。

点击物品图标可唤起详情弹窗，查看其专属 ID、来源数据表、类别分类、游戏内原版文本描述以及数量选择器。在图鉴弹窗内选择的数量属于本地交互，不会自动调用服务端或直接增发物品。若原版数据表定义了 `PileLimit`（堆叠上限），选择器将严格受限于该上限值。

物品的名称与描述文本覆盖了 Srtool 支持的全部 13 种本地化语言。图标资产直接引用自对齐版本的 StarRailRes 索引库。

可通过以下命令根据 Go 服务端的库存配置重新生成 `assets/item-catalog.json`：

```bash
python tools/build-item-catalog.py --inventory-config <path-to-GaC-hkrpg-go>/resources/InventoryItemConfig.json
```

---

## ⚔️ 货币战争 (CW) GM 调试指令

在已连接的 GM 控制台中，支持输入：`/cw status`, `/cw gold <总额>`, `/cw hp <总额>`。
修改值仅对当前正在进行的 CW 局内生效。指令会被放入队列并在 Preparation（备战）阶段统一消费执行；战斗期间将保持等待。金币指令会直接设定当前总额，而非循环递增。HP 设定值不得超出当局关卡上限。可在服务端日志中确认 `CW_GM applied` 确认下发状态，或通过控制台输入 `/help` 与联想提示进行查看。

---

## ⌨️ GM 智能命令助手 (Command Assistant)

控制台输入框内置了指令实时语法预览与参数即时提示功能。完整支持官方 GM 命令、`/unstuck`、`/faketime` 以及当前 SDK 支持的所有 `/cw` 子命令：
- 使用 ↑ / ↓ 键可在候选联想列表中导航。
- 按 `Tab` 键可自动补全当前高亮参数并跳转至下一参数位。
- 按 `Shift + Tab` 可回退列表选择，按 `Esc` 键可快速关闭补全提示。
- 也可直接使用鼠标点击补全项填充。
- `Tab` 仅用于补全，需按下 `Enter` 回车键或点击 `Run` 按钮发送命令。

输入角色名称或数字 ID 即可模糊检索对应角色。物品清单、大地图 Plane 与 Floor 索引以及 CW 专属数据均实时拉取自 SDK 的 `GET /api/command-completions` 接口。CW 角色星级也会根据已选定的 Role 动态收窄过滤范围。

无游戏运行时单元测试命令：`node --test tools/command-assistant.test.mjs`


---

## 📜 许可证与修改声明要求 (License & Attribution Notice)

本项目遵循 **Apache License 2.0** 与 **GNU General Public License v3 (GPL-3.0)** 许可证规范，严格执行 **原始出处署名 (Attribution)** 与 **修改内容声明 (State Changes Notice)** 要求。

任何个人或组织若引用、Fork、修改、二次开发或重新分发本项目的任何代码、脚本或工具组件，**必须严格遵守以下条款**：

1. **强制保留原作者署名与原始出处 (Attribution)：**
   - 必须在项目显著位置明确注明本项目名称，并附带指向本原始仓库的有效链接。
   - 必须在源码及所有副本中完整保留原有的版权声明、作者名单及原始许可证声明文件。

2. **必须明确注明修改内容与变更记录 (State Changes Notice)：**
   - 依照 Apache-2.0 第 4(b) 条及 GPL-3.0 第 5(a) 条之规定，**凡对原有文件或代码进行过任何修改、增删、重构或补充的部分，必须在相关文件中附带显著的修改通知（Prominent Notice），明确说明修改了哪些内容及修改时间**。
   - 严禁隐瞒原作者出处、抹除原作者信息或谎称修改后的衍生版本为独立原创作品。

3. **非商业用途与免责声明 (Non-Commercial Purpose)：**
   - 本项目仅供网络协议逆向、学术研究与个人学习交流使用，严禁用于任何商业牟利、付费打包或转售行为。
