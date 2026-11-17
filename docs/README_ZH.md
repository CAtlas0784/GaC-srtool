# GaCy-Srtool

<div align="center">

[English](README_EN.md) | [ภาษาไทย](../README.md) | [简体中文](README_ZH.md)

</div>

面向《崩坏：星穹铁道》私服的账号管理工具，适合开在游戏旁边使用：调整角色、光锥和遗器，推送到服务器，进游戏查看效果，再回来继续调整。

直接打开 [gacy-srtool.vercel.app](https://gacy-srtool.vercel.app/) 即可使用，在 **设置** 页选择服务器并填写所用 SDK 的地址。全部在浏览器中运行，无需安装。

---

## 支持的服务器

| 模式 | 数据传输方式 | 可用功能 |
| --- | --- | --- |
| **GaCy GO** | 通过 REST API（`/api/...`）读写 | 全部功能：角色、装备、物品、怪物、存档、Ex-Rank、Damage Analyst、GM 控制台 |
| **FireflyGo** | 仅推送，`POST /sync` | 角色、装备、终局关卡、FireflyGo 控制（extra_data）、JSON 编辑器 |
| **RobinSR** | 仅推送，`POST /srtools` | 角色、装备、终局关卡、JSON 编辑器 |

所选服务器不支持的标签页会自动隐藏。

## 同步状态

每次修改都会明确显示服务器是否已收到：

- **页头的印章** 显示 *发送中*、*已收到 · 时间* 或 *发送失败*（附重试按钮）。最近一次收到的时间按服务器模式分别记录。
- **已修改但服务器尚未收到的角色** 带有橙色的“未发送”标记，角色页会统计待发送的数量。
- 只有在服务器回应之后才会显示成功提示。

---

## 各标签页功能

### 角色
- 打开网站的第一页。可按名称或 ID 搜索，按属性、星级、命途和收藏筛选。
- **收藏：** 点击卡片上的星标，让该角色排在最前。保存在浏览器中。
- **全页编辑器：** 等级、晋阶和星魂始终显示在顶部；技能、行迹、光锥和遗器在子标签页中，保存按钮固定在底部。
- **配装参考：** 来自 Prydwen 终局数据中玩家最常用的光锥、遗器套装和主词条。
- **全账号菜单：** 将所有角色设为 E0S1 或满星魂 E6，并装备各自的专属光锥。

### 光锥与遗器
- 以卡片展示装备库，显示完整名称、星级、遗器主词条及穿戴者。
- 网格旁的详情面板：装备、卸下、等级、晋阶、叠影（S1-S5）和副词条。
- **副词条编辑：** 选择 4 条副词条，设置强化次数（每件最多 5 次，与游戏一致），显示实际数值，避免与主词条重复，并提供 5 种预设：暴击、击破、速度、持续伤害、防御/生存。

### 仪表盘与编队
- 4 人编队，显示每个角色的等级和星魂。点击槽位或使用键盘即可更换角色。
- 服务器状态、最近一场战斗摘要和 GM 控制台（GaCy GO）。

### Damage Analyst（GaCy GO）
- 从游戏中获取最近一次战斗报告，或以 JSON 导入/导出。
- 总伤害、轮次、回合、战斗时长及队伍中每个成员的伤害占比。
- 按角色区分普攻、战技、终结技、击破、追加攻击和持续伤害，并显示护盾、治疗和承受伤害。
- 卡片顺序按真实战斗中的 `report.avatars[].slot` 排列，而不是大世界编队。

### 背包物品（GaCy GO）
- **物品图鉴：** 按名称或 ID 搜索，查看游戏表中物品的图标、类型和描述。标有“GaCy 支持”的物品可以修改数量，其余仅供查询。
- **数量管理：** 一次修改多个物品后统一保存。未保存的行以橙色标记，留空表示使用服务器默认值。只通过 `/api/inventory/materials` 写入 `freesr-data.json` 中的物品数量；重新登录游戏后生效。

### 怪物设置
- **GaCy GO：** 按服务器所用版本，从客户端资源查看混沌回忆、虚构叙事、末日幻影和异相仲裁的关卡与波次（只读）。Aha's Help 有独立标签页，与异相仲裁分开。
- **自定义敌人：** 仅适用于 Golden / Crimson Calyx。可按名称或 ID 搜索怪物。“使用客户端关卡”会清除自定义波次。历战余响、凝滞虚影、侵蚀隧洞、终局关卡和模拟宇宙不使用本页的波次。
- **FireflyGo / RobinSR：** 选择终局关卡和波次，写入 `battle_config`。

### 存档管理（GaCy GO）
- 开拓者的性别与属性，以及三月七的命途。
- **镜头：** 选择 Freecam 或 FaceCam，以及 FaceCam 的默认距离。保存后在游戏中按 Tab 开关；鼠标滚轮可临时调整距离。
- 银狼、遐蝶和阿哈的全局开关。

### Ex-Rank（GaCy GO）
- 用开关逐个角色开启或关闭 Ex-Rank，或一次全部开关。请求失败时开关会自动复原。

### JSON 管理
- 直接编辑 `freesr-data.json`（GaCy GO 下还有 `persistent`）：格式化、上传并保存到服务器。
- **下载此文件：** 保存编辑器中当前的内容，包括尚未发送的修改。文件名为真实文件名加时间，例如 `freesr-data-2026-11-17-1530.json`。
- **从 Enka 创建：** 输入游戏 UID，或粘贴来自 enka.network 的 JSON，生成 `freesr-data.json`，可与现有数据合并或全部替换。所有模式均可使用。

### FireflyGo 控制（FireflyGo）
- 每次同步时一同发送的 `extra_data`：开拓者与三月七的多命途、Censorship、隐藏 UI、入侵百分比、Challenge Peak、Theory Craft 和 Lua 脚本。
- 游戏中不存在 `cm` 和 `first_person`，因此本页不提供。服务器已保存的值会原样发回。

### 设置
- 服务器模式、API 地址、连接测试、语言和显示选项。
- 清除浏览器缓存，以及将所有设置恢复为默认值。

### GM 控制台（GaCy GO）
- 向服务器发送 GM 命令并查看回复。
- 命令助手：预览命令并说明正在输入的参数。↑/↓ 移动列表，Tab 填入所选项并跳到下一个参数，Shift+Tab 返回，Esc 关闭，按 Enter 或 Run 发送。Tab 不会发送命令。
- 物品、Plane、Floor 和 CW 条目来自 SDK 的 `GET /api/command-completions`。
- **Unstuck：** Unstuck 按钮或 `/unstuck` 可解除因等待数据包而卡住的界面，不会删除 CW 存档或切换地图。需要游戏正在运行，且 SDK 支持 `/api/client/unstuck`。
- **CW 命令：** `/cw status`、`/cw gold <total>`、`/cw hp <total>` 只影响当前进行中的 CW。数值会排队，在准备阶段生效（战斗中会等待）。gold 设定总数而不是累加，hp 不能超过本局上限。可在服务器的 `CW_GM applied` 日志中确认。

### 语言
支持 13 种语言，无需刷新即可切换：ไทย、English、简体中文、繁體中文、日本語、한국어、Tiếng Việt、Bahasa Indonesia、Español、Français、Deutsch、Русский、Português

---

# THERES ONLY DARK MODE IF U ASK FOR LIGHT GO AWAY FROM ME

## 本地运行

网站需要从 `assets/data` 加载游戏数据，因此必须通过本地服务器打开（直接从文件打开 `index.html` 无法使用）。

```bash
npm run dev:proxy
```

然后打开 `http://localhost:5173`。此方式包含让 Enka 导入可用的代理。不需要 Enka 时，使用以下命令即可：

```bash
npm run serve
```

运行全部测试：

```bash
npm test
```

---

## GaCy GO API

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/status` | GET | 服务器状态、编队、角色和位置 |
| `/api/freesr` | GET, POST | 读取或写入 `freesr-data.json` |
| `/api/freesr/avatars` | GET, POST | 读取或写入角色数据 |
| `/api/inventory/materials` | GET, POST | 读取客户端物品目录，并只保存物品数量 |
| `/api/persistent` | GET, POST | 读取或写入 `persistent` 文件 |
| `/api/battle_report` | GET, POST | 最近一次战斗报告 |
| `/api/battle_report/reset` | POST | 清除战斗记录 |
| `/api/exrank/toggle` | POST | 开启或关闭 Ex-Rank |
| `/api/avatar/rank` | POST | 修改星魂 |
| `/api/avatar/max_all` | POST | 将所有角色设为满星魂 E6 并满技能 |
| `/api/command` | POST | 发送 GM 命令 |
| `/api/command-completions` | GET | 命令助手使用的列表 |
| `/api/client/unstuck` | POST, GET | 解除卡住的界面（POST 发送，GET 等待游戏回应） |

在角色编辑器中保存时，会通过 `/api/freesr` 一次性发送整个角色，包括 `data.skills` 和 `data.skills_by_anchor_type` 中的行迹，避免服务器在行迹保存前同步等级或星魂。服务器返回错误时，编辑器会提示保存失败。

---

## 数据与来源

### 配装参考
配装参考中的数字是终局样本中的使用占比，并非排名或官方建议。每个角色都标明模式、样本数量和采集日期。没有样本的角色会改为链接到 Prydwen 的攻略。

`js/build-guides-data.js` 的数据来自 MIT 许可的数据集 [LvlUrArti/MocDataProcessed](https://huggingface.co/datasets/LvlUrArti/MocDataProcessed)，该数据由 Prydwen 网站处理而来。发布或进一步分析时请注明 LvlUrArti。更新命令：

```bash
npm run sync-build-guides
```

### 专属光锥与推荐配装
`assets/data/builds.json` 由 `scripts/sync-data.mjs` 生成。`scripts/data/overrides.json` 中的值始终优先；否则使用游戏自带的推荐，并结合使用数据调整。专属光锥必须与角色命途相同，由 `tests/signature-lightcones.test.cjs` 检查。更新命令：

```bash
npm run sync-data
```

### 物品图鉴
由固定版本游戏数据中所有 `ItemConfig` 表生成：检查了 26 张表，其中 18 张包含物品数据，共 5,414 个 ID。“GaCy 支持”标记来自 Go 服务器的 `InventoryItemConfig.json`。

名称和描述来自游戏 TextMap 与 StarRailRes 索引，覆盖全部 13 种语言（5,414 个中有 5,150 个具有游戏原生语言名称，其余使用英文或 ID）。图标来自固定版本的 StarRailRes，共 5,261 个；另外 153 个存放在客户端加密的 `.block` 文件中，因此显示为缺失。详情窗口中的数量只在该窗口内有效，不会发送到服务器。

根据 Go 服务器所用目录重新生成 `assets/item-catalog.json`：

```bash
python tools/build-item-catalog.py --inventory-config <path-to-GaC-hkrpg-go>/resources/InventoryItemConfig.json
```

### 设计
网站的设计系统（颜色、字体、组件和规则）见 [DESIGN.md](../DESIGN.md)。网站显示的所有文字都在 `js/i18n.js` 中。

---

## 许可证与修改声明要求 (License & Attribution Notice)

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
