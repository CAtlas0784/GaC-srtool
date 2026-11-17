# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

An international community of Honkai: Star Rail private-server players who run or join a GaCy GO, FireflyGo or RobinSR server. They use GaCy-srtool to set up characters, light cones, relics, teams and save files without editing JSON by hand. Thai is the first locale, and the README and AGENTS.md are written in Thai first, but the audience is not limited to Thai speakers. The UI ships in all 13 official Star Rail languages, and any language the tool doesn't translate falls back to English.

## Product Purpose

GaCy-srtool is a companion dashboard and FreeSR tool for private Star Rail servers. Players use it to change their account (character level, ascension, Eidolons, traces, light cones, relic main stats and substats, lineups, Ex-Ranks, inventory, monster and endgame settings) and send those changes to the server. On GaCy GO it also reads results back, such as live battle reports. It succeeds when a change made in the browser shows up correctly in the game, with nothing to install and no hand-edited JSON.

## Positioning

GaCy GO is the server it's built around. Only GaCy GO has a live two-way link: connection status and ping, read-back of the lineup and scene, the real-time Damage Analyst (`/api/battle_report`), the GM Command Console, Unstuck, the save manager, Ex-Ranks, inventory and monster settings. FireflyGo and RobinSR are supported as push-only targets (`js/modes.js` `MODE_CAPABILITIES`): they get editing and the endgame room picker, but nothing comes back from the server. New features should work fully on GaCy GO first. On the other servers they can be hidden, as long as nothing breaks.

## Operating Context

- Most use happens beside the running game: a desktop browser on a second monitor or tabbed alongside it. Players push a change, look at the result in-game, then return to the tool. Round trips are short and repeated, and the game window is the other half of the workflow.
- Everything runs in the browser, with no backend of its own. The tool talks to the user's server SDK over HTTP (for example `/api/...` and `POST /srtools`) and imports characters from Enka.Network through the `/api/enka/:uid` rewrite.
- It is hosted at gacy-srtool.vercel.app (`vercel.json`, `scripts/build-vercel.cjs`) and on GitHub Pages (`.github/workflows/deploy.yml`). The header shows the current Git branch.
- Files it works with: `freesr-data.json`, the `persistent` save, and FireflyGo's `data-in-game.json`.

## Capabilities and Constraints

- Server modes: `gac` (GaCy GO), `firefly` (FireflyGo), `robin` (RobinSR). Which features appear depends on `MODE_CAPABILITIES`. In FireflyGo mode only owned characters are shown.
- Tabs: Dashboard, Avatars, Equipment, Inventory, Ex-Rank, Damage Analyst, Monster Settings, Quick Gen, JSON, Persistent, Settings.
- Relic rules follow the game: at most 5 substat rolls per piece, and no substat may repeat the main stat or another substat. There are five substat presets: Crit, Break, SPD, DoT and Sustain.
- Build guides come from endgame sample data, link to the full Prydwen guide, and show the mode, sample size and collection date.
- Localization is mandatory (AGENTS.md): every user-facing string goes through `js/i18n.js` with both `th` and `en` keys, dynamic content refreshes when the language changes, and imports share one `?v=` query string.
- Cache busting: bump the `?v=` on `css/styles.css` and `js/app.js` in `index.html` whenever either file changes.
- Plain static HTML/CSS/JS with ES modules. There is no framework; `index.html` is the single entry point. Tests run with `node --test`.

## Brand Commitments

- The product is called GaCy-srtool (package name `gac-srtool`), and its home server is GaCy GO.
- Game terms (Eidolon, Traces, Ascension, Break, Super Break, DoT, Ex-Rank) follow the official Star Rail terminology for each locale.

## Evidence on Hand

- Character avatar images: `assets/avatars/*.png`
- Game and equipment data: `js/game-data.js`, `js/avatars-data.js`, `js/equipment-data.js`, `js/item-catalog.js`
- Endgame build-guide data: `js/build-guides-data.js`, `js/endgame.js`
- There are no user counts, testimonials or community size figures. Future work must not make any up.

## Product Principles

1. **The game is the source of truth.** A change only counts once it shows up correctly in-game, so the tool should confirm what the server actually received rather than assume it.
2. **GaCy GO first, the others never broken.** The full two-way experience lives on GaCy GO. Push-only servers get a smaller feature set, but not a broken one.
3. **Made for the round trip beside the game.** Optimize for short, repeated loops: tweak, push, check in-game, come back.
4. **Speak the player's language.** Every string is localized, and terminology matches the official game in each locale.
5. **Nothing to install.** Everything happens in the browser, with no setup beyond pointing it at a server.
