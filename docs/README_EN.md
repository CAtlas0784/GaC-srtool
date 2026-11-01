# GaCy-Srtool 🌌

<div align="center">

**Modern, High-Performance Web Dashboard & Management Tool for the GaCy Ecosystem**

[English](README_EN.md) | [ภาษาไทย](../README.md) | [简体中文](README_ZH.md)

</div>

---

Online web application available at [GaCy Srtool on Vercel](https://gacy-srtool.vercel.app/). Open Settings to connect to your running local or remote server SDK.

In GaCy mode under **Character Settings / Special System Switches**, configure Freecam or FaceCam mode and set the initial FaceCam zoom distance. After saving, press `Tab` in-game to toggle the camera; the mouse scroll wheel temporarily adjusts zoom distance, resetting to the configured default upon reactivation.

## Unstuck / Emergency UI Unfreeze

When connected to a GaCy GO server, click the **Unstuck** button in the GM Command Console or type `/unstuck`. The web interface waits for game client confirmation before displaying success. The game must be running and actively connected to the server. This command safely clears full-screen UI blocks waiting on network packets via the heartbeat cycle without wiping CW progress, changing scenes, or fabricating gameplay results; it does not replace fixing missing protocol handlers. Requires an SDK server supporting `/api/client/unstuck`.

A 100% client-side web dashboard and management tool designed for character data configuration, lineup management, relic and light cone customization, real-time battle damage analysis, and save file management (`freesr-data.json`, `persistent`) for **GaCy GO** (and standard FreeSR) servers.

Runs entirely in your web browser with zero local dependencies or installations required.

---

## ⚡ Key Features

### 📊 1. Live Dashboard & Lineup
- **Live Connection Status:** Real-time server connectivity detection with a live ping latency monitor.
- **4-Slot Lineup Management:** Displays team members alongside their Eidolon rank, equipped signature light cone, level, and world scene coordinates.
- **Dynamic Git Branch Indicator:** Accurately displays the active server/frontend branch (e.g. `main`, `test-gay`) in the header and browser title bar.
- **Resource Summary:** Total counts of owned characters, light cones, and relics in inventory.

### ⚔️ 2. Real-Time Damage Analyst
- **Live Server Battle Reports:** Fetches the most recent combat statistics directly from `/api/battle_report`.
- **Comprehensive DMG Overview:** Total DMG, Damage Per Second (DPS), and total action count.
- **Damage Category Breakdown:**
  - Normal DMG
  - Weakness Break DMG
  - Super Break DMG
  - Damage over Time (DoT)
- **CRIT Performance Analysis:** Evaluates actual in-combat CRIT Rate and CRIT DMG per character.
- **Visual Analytics:** Interactive bar charts illustrating each character's overall damage contribution.

### 👤 3. Character Inspector
- **Real Stat Calculations:** Calculates base stats plus relic/light cone bonuses (HP, ATK, DEF, SPD, CRIT Rate, CRIT DMG, Effect Hit Rate, Break Effect).
- **Trace Tree Skill Levels:** Inspect and modify skill levels for Basic ATK, Skill, Ultimate, Talent, and bonus ability nodes.
- **One-Click Max Build:** Instantly configure max levels, max Eidolons (E6), and fully unlocked Traces.

### 🛡️ 4. Relic & Light Cone Customizer
- **Custom Relic Crafting:** Freely select relic sets, main stats, and sub-stats with customized roll distribution.
- **Light Cone Superimposition:** Configure light cone levels and superimposition ranks (S1–S5).

### 🌌 5. Simulated Universe / Divergent Universe
- Browse blessings and curios, with direct support for writing gameplay buffs into persistent saves.

### 🎒 6. Inventory Materials & Monster Setting
- **Batch Inventory Adjustment:** Search item catalog IDs extracted directly from the game client and update multiple quantities in a single transaction.
- **Isolated Safe Writes:** Modifies only the `materials` field in `freesr-data.json` without overwriting characters, light cones, relics, or battle configs.
- **Monster Setting & Wave Customization:**
  - View stages, monsters, levels, and waves for Memory of Chaos (MoC), Pure Fiction (PF), Apocalyptic Shadow (AS), and Anomaly Arbitration (AA) using Nanoka metadata matching the server's `client_version`.
  - Customize monster waves for Golden and Crimson Calyx nodes.
  - Weekly Bosses, Stagnant Shadows, Caverns of Corrosion, and endgame challenges retain verified official assets.

### 💾 7. GaCy Persistent & FreeSR Save Management
- **Trailblazer Configurator:** Switch gender (Caelus / Stelle) and damage Path (Physical, Fire, Imaginary, Remembrance).
- **March 7th Path Switcher:** Toggle between Preservation (Ice) and The Hunt (Imaginary).
- **EX-Rank Special Switches:** Enable/disable special EX rank abilities for supported characters (Jing Yuan [1204], Dan Heng • IL [1213], Acheron [1308]).
- **Raw JSON Editor:** Inspect, format, edit, and backup `freesr-data.json` and `persistent` files directly.

### 💻 8. GM Command Console
- Integrated web command prompt to send GM instructions directly to the server with real-time response output.

### 🌐 9. Multi-Language Support (13 Languages)
- Instant, client-side language switching without page reload:
  - 🇹🇭 Thai
  - 🇺🇸 English
  - 🇨🇳 Simplified Chinese
  - 🇹🇼 Traditional Chinese
  - 🇯🇵 Japanese
  - 🇰🇷 Korean
  - 🇻🇳 Vietnamese
  - 🇮🇩 Indonesian
  - 🇪🇸 Spanish
  - 🇫🇷 French
  - 🇩🇪 German
  - 🇷🇺 Russian
  - 🇵🇹 Portuguese

---

# THERES ONLY DARK MODE IF U ASK FOR LIGHT GO AWAY FROM ME

## 💻 Local Usage

1. **Direct Browser Execution:** Double-click and open `index.html` in any modern web browser.
2. **Or run via local HTTP server:**
   ```bash
   npx serve .
   ```
   Or with Python:
   ```bash
   python -m http.server 3000
   ```

---

## 🔗 GaCy GO Server Integration

GaCy-Srtool communicates with the GaCy GO server through its REST API:

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/status` | GET | Retrieve server status, active lineup, character stats, and player position |
| `/api/freesr` | GET, POST | Fetch or overwrite `freesr-data.json` |
| `/api/inventory/materials` | GET, POST | Read client item catalog and modify specific item counts without touching other data |
| `/api/freesr/avatars` | GET, POST | Read or update character statistics and progression |
| `/api/persistent` | GET, POST | Fetch or update `persistent` save records |
| `/api/battle_report` | GET, POST | Retrieve real-time combat damage logs and latest battle results |
| `/api/battle_report/reset` | POST | Clear logged battle statistics |
| `/api/exrank/toggle` | POST | Toggle EX-Rank special capabilities |
| `/api/avatar/rank` | POST | Modify a character's Eidolon rank |
| `/api/avatar/max_all` | POST | Set all owned avatars to E6 and max trace levels |
| `/api/command` | POST | Dispatch GM commands to the game server |

### Character & Trace Persistence

The Damage Analyst orders character cards according to `report.avatars[].slot` from the actual battle payload rather than the overworld lineup. Live data streaming requires the server SDK and `damage_analyst_live.lua` script reading the combat `StatisticsComponent`.

Saving from the character detail panel dispatches the complete avatar payload through `/api/freesr` in a single request, including `data.skills` and `data.skills_by_anchor_type` for Traces, preventing partial synchronization from disrupting Trace data.

### Build Guides & Data Sources

The **Character Details → Build Guides** section displays high-usage endgame equipment and main stat recommendations derived from Prydwen sample data, indicating player sample proportions and capture dates.

Prebuilt data in `js/build-guides-data.js` is licensed under MIT from [LvlUrArti/MocDataProcessed](https://huggingface.co/datasets/LvlUrArti/MocDataProcessed). Please credit LvlUrArti when redistributing. Update snapshots using `npm run sync-build-guides`, matching characters by ID against `js/avatars-data.js`.

---

## 📖 Item Book

The **Item Book** scans the pinned game-data revision across all `ItemConfig`-named tables containing item definitions. In this revision, 26 candidate tables were evaluated and 18 supplied item rows: 5,472 total rows resolving to 5,414 unique item IDs. Items badged **GaCy supported** are linked to the Go server's `InventoryItemConfig.json`; other entries are browse-only.

Click any item icon to open its details dialog, showing its ID, source table, item category, official localized in-game description, and a quantity selector. Selected quantities are local to the dialog and do not directly modify server state. Where the game data defines a `PileLimit`, the selector enforces that ceiling.

Item names and descriptions cover all 13 supported languages. Icons are loaded from the aligned StarRailRes asset repository.

Regenerate `assets/item-catalog.json` from the server inventory config:

```bash
python tools/build-item-catalog.py --inventory-config <path-to-GaC-hkrpg-go>/resources/InventoryItemConfig.json
```

---

## ⚔️ Currency Wars (CW) GM Commands

In the connected GM Console, enter: `/cw status`, `/cw gold <total>`, `/cw hp <total>`.
Values apply strictly to the active CW run. Commands are queued and processed during the Preparation phase; they wait while in combat. Gold sets the absolute total rather than incrementing. HP must remain within the stage ceiling. Check server logs for `CW_GM applied` or use `/help` in the console.

---

## ⌨️ GM Command Assistant

The console input field includes a real-time command preview and argument hint system supporting standard GM commands, `/unstuck`, `/faketime`, and all `/cw` subcommands:
- Use ↑ / ↓ arrow keys to navigate suggestions.
- Press `Tab` to autocomplete the highlighted candidate and proceed to the next argument.
- Press `Shift + Tab` to reverse candidate selection, or `Esc` to close suggestions.
- Click any suggestion item to autofill.
- `Tab` only autocompletes; press `Enter` or click `Run` to execute.

Filter characters by typing names or numeric IDs. Items, Maps, Planes, Floors, and CW assets are fetched dynamically from SDK's `GET /api/command-completions`. CW star options dynamically filter based on the chosen Role.

Run headless verification tests: `node --test tools/command-assistant.test.mjs`
