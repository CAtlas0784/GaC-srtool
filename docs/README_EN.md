# GaCy-Srtool

<div align="center">

[English](README_EN.md) | [ภาษาไทย](../README.md) | [简体中文](README_ZH.md)

</div>

An account tool for Honkai: Star Rail private servers, kept open beside the running game: adjust characters, light cones and relics, push them to the server, check the result in game, and come back to tweak.

Use it at [gacy-srtool.vercel.app](https://gacy-srtool.vercel.app/), then open **Settings** to pick your server and enter the URL of the SDK you run. Everything runs in the browser; there is nothing to install.

---

## Supported servers

- **GaCy GO:** reads and writes over the REST API (`/api/...`). Everything is available: characters, equipment, items, monsters, save files, Ex-Rank, Damage Analyst and the GM Console.
- **FireflyGo:** push only, over `POST /sync`. Characters, equipment, Endgame rooms, FireflyGo controls (extra_data) and the JSON editor.
- **RobinSR:** push only, over `POST /srtools`. Characters, equipment, Endgame rooms and the JSON editor.

Tabs the selected server does not support are hidden automatically.

## Sync status

Every edit shows whether the server has received it:

- **The stamp in the header** reads *sending*, *received · time* or *failed* with a Retry button. The last received time is remembered per server mode.
- **Characters edited but not yet received** carry an orange "Not sent" tag, and the Characters page counts how many are waiting.
- A success message only appears after the server answers.

---

## Features by tab

### Characters
- The first screen. Search by name or ID, and filter by element, rarity, path and favorites.
- **Favorites:** tap the star on a card to keep that character at the top. Saved in the browser.
- **Full-page editor:** level, ascension and Eidolon stay in view at the top; skills, traces, light cone and relics sit in sub-tabs, and Save stays pinned at the bottom.
- **Build guide:** the light cones, relic sets and main stats players use most, from Prydwen's endgame data.
- **Account-wide menu:** set everyone to E0S1 or Max E6, with each character's signature light cone.

### Light Cones & Relics
- The equipment inventory as cards showing the full name, rarity, a relic's main stat and who wears it.
- A detail panel beside the grid: equip, unequip, level, ascension, Superimposition (S1-S5) and substats.
- **Substat editor:** pick four rows, set roll counts (up to 5 per piece, as in the game), see real stat values, avoid duplicates of the main stat, and use 5 presets: crit, break, speed, DoT, and defence/sustain.

### Dashboard & Team
- A 4-slot team showing each character's level and Eidolon. Click a slot, or use the keyboard, to change who is in it.
- Server status, the latest battle summary, and the GM Console (GaCy GO).

### Damage Analyst (GaCy GO)
- Fetch the latest battle report from the game, or import/export it as JSON.
- Total damage, cycles, turns, duration and each team member's share of the damage.
- Per character: normal, skill, ultimate, break, follow-up and DoT damage, plus shields, healing and damage taken.
- Cards follow `report.avatars[].slot` from the real battle, not the overworld team.

### Inventory (GaCy GO)
- **Item book:** search names or IDs to see each item's icon, type and description from the game tables. Items marked "GaCy supported" can have their count changed; the rest are for reference.
- **Bag counts:** edit many items and save them once. Unsaved rows are marked in orange, and an empty field means the server default. Only item counts in `freesr-data.json` are written, through `/api/inventory/materials`; log in again to see them in game.

### Monster Settings
- **GaCy GO:** view the stages and waves of Memory of Chaos, Pure Fiction, Apocalyptic Shadow and Anomaly Arbitration from the client resources for the version the server runs (read only). Aha's Help has its own tab, separate from AA.
- **Custom Enemy:** Golden / Crimson Calyx only. Search monsters by name or ID. "Use Client stages" clears your custom waves. Weekly Boss, Stagnant Shadow, Cavern of Corrosion, Endgame and Simulated Universe do not take waves from this page.
- **FireflyGo / RobinSR:** pick an Endgame room and its waves, written into `battle_config`.

### Save manager (GaCy GO)
- Trailblazer gender and element, and March 7th's path.
- **Camera:** choose Freecam or FaceCam and FaceCam's default distance. After saving, press Tab in game to turn it on or off; the mouse wheel changes the distance for that session.
- Global switches for Silver Wolf, Castorice and Aha.

### Ex-Rank (GaCy GO)
- Turn Ex-Rank on or off per character with a switch, or for everyone at once. If the request fails, the switch goes back.

### JSON
- Edit `freesr-data.json` (and `persistent` on GaCy GO) directly: format, upload and save to the server.
- **Download this file:** saves what is in the editor right now, including edits not yet sent. The file is named after the real file and the time, for example `freesr-data-2026-11-17-1530.json`.
- **Create from Enka:** enter a game UID, or paste JSON from enka.network, to build `freesr-data.json`, merged with your data or replacing it. Works in every mode.

### FireflyGo controls (FireflyGo)
- The `extra_data` sent with every sync: Trailblazer and March 7th Multi-Path, Censorship, Hide UI, invasion percent, Challenge Peak, Theory Craft and a Lua script.
- `cm` and `first_person` do not exist in the game, so they are not on this page. The values the server already holds are sent back unchanged.

### Settings
- Server mode, API URL, connection test, language and display options.
- Clear the browser cache, and reset everything to defaults.

### GM Console (GaCy GO)
- Send GM commands to the server and read the replies.
- Command assistant: previews the command and explains the argument you are typing. ↑/↓ move through the list, Tab fills the choice and moves to the next field, Shift+Tab goes back, Esc closes, and Enter or Run sends. Tab never sends.
- Items, planes, floors and CW entries come from the SDK's `GET /api/command-completions`.
- **Unstuck:** the Unstuck button or `/unstuck` clears a UI stuck waiting for a packet, without deleting the CW save or changing the map. The game must be running and the SDK must support `/api/client/unstuck`.
- **CW commands:** `/cw status`, `/cw gold <total>`, `/cw hp <total>` affect only the active CW run. Values are queued and applied during Preparation (they wait while fighting). Gold sets the total rather than adding to it, and hp must fit the run's limit. Check the server's `CW_GM applied` log to confirm.

### Languages
13 languages, switched instantly without a reload: ไทย, English, 简体中文, 繁體中文, 日本語, 한국어, Tiếng Việt, Bahasa Indonesia, Español, Français, Deutsch, Русский, Português

---

# THERES ONLY DARK MODE IF U ASK FOR LIGHT GO AWAY FROM ME

## Running locally

The site loads game data from `assets/data`, so it needs a local server (opening `index.html` straight from the file system does not work).

```bash
npm run dev:proxy
```

Then open `http://localhost:5173`. This one includes the proxy that makes the Enka import work. Without Enka, this is enough:

```bash
npm run serve
```

Run all tests:

```bash
npm test
```

---

## GaCy GO API

- `GET` `/api/status`: server status, team, characters and position
- `GET POST` `/api/freesr`: read or write `freesr-data.json`
- `GET POST` `/api/freesr/avatars`: read or write character data
- `GET POST` `/api/inventory/materials`: read the client item catalog and save item counts without touching other data
- `GET POST` `/api/persistent`: read or write the `persistent` file
- `GET POST` `/api/battle_report`: the latest battle report
- `POST` `/api/battle_report/reset`: clear the battle history
- `POST` `/api/exrank/toggle`: turn Ex-Rank on or off
- `POST` `/api/avatar/rank`: change Eidolon
- `POST` `/api/avatar/max_all`: set everyone to Max E6 with full skills
- `POST` `/api/command`: send a GM command
- `GET` `/api/command-completions`: lists for the command assistant
- `POST GET` `/api/client/unstuck`: clear a stuck UI (POST sends it, GET waits for the game's reply)

Saving from the character editor sends the whole character through `/api/freesr` in one request, including the traces in `data.skills` and `data.skills_by_anchor_type`, so the server cannot sync level or Eidolon before the traces are saved. If the server answers with an error, the editor says the save failed.

---

## Data and sources

### Build guide
Numbers in the build guide are usage shares within an endgame sample, not a ranking or official advice. Each character shows the mode, sample size and collection date. Characters without a sample link to Prydwen's guide instead.

The data in `js/build-guides-data.js` comes from the MIT-licensed dataset [LvlUrArti/MocDataProcessed](https://huggingface.co/datasets/LvlUrArti/MocDataProcessed), processed from the Prydwen website. Please credit LvlUrArti when you publish or analyse it further. Update it with:

```bash
npm run sync-build-guides
```

### Signature light cones and recommended builds
`assets/data/builds.json` is generated by `scripts/sync-data.mjs`. Values in `scripts/data/overrides.json` always win; otherwise the game's own recommendation, adjusted by usage data, is used. A signature light cone must share its character's path, which `tests/signature-lightcones.test.cjs` checks. Update it with:

```bash
npm run sync-data
```

### Item book
Built from every `ItemConfig` table in the pinned game-data revision: 26 tables checked, 18 with item rows, 5,414 IDs in total. The "GaCy supported" tag comes from the Go server's `InventoryItemConfig.json`.

Names and descriptions come from the game TextMap and the StarRailRes indexes in all 13 languages (5,150 of 5,414 have a name in the game's own language; the rest use English or the ID). Icons come from the pinned StarRailRes revision for 5,261 entries; the other 153 live in the client's encrypted `.block` files and show as missing. The quantity in the detail dialog stays in that dialog and is not sent to the server.

Rebuild `assets/item-catalog.json` from the catalog the Go server uses:

```bash
python tools/build-item-catalog.py --inventory-config <path-to-GaC-hkrpg-go>/resources/InventoryItemConfig.json
```

### Design
The site's design system (colours, type, components and rules) is in [DESIGN.md](../DESIGN.md). Every string the site shows lives in `js/i18n.js`.

---

## License & Attribution Notice

This project is made available in accordance with the **Apache License 2.0** and **GNU General Public License v3 (GPL-3.0)** frameworks, strictly enforcing **Attribution** and **State Changes Notices**.

If you use, fork, modify, redistribute, or create derivative works from any part of this repository, you **MUST** strictly comply with the following conditions:

1. **Mandatory Attribution (Credit the Original Source):**
   - You must provide prominent credit and include a direct link back to this original repository.
   - You must retain all existing copyright notices, developer credits, and original license headers in all copies or substantial portions of the software.

2. **Explicit State Changes Requirement (Document All Modifications):**
   - In accordance with Section 4(b) of Apache 2.0 and Section 5(a) of GPL v3, any files that you modify **must carry prominent notices stating clearly that you changed the files, what modifications were made, and the date of modification**.
   - You must not claim modified versions as wholly original works, nor remove attribution to obscure the software origin.

3. **Non-Commercial Educational Purpose:**
   - This project is provided strictly for academic research, protocol analysis, and educational purposes. Commercial exploitation, sale, or paywalling of this project or its derivatives is strictly prohibited.
