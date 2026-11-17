---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: GaCy-srtool app (index.html)

Scope: the whole single-page app, every tab. Visitor mode: Operate.
Audience and job: private-server Star Rail players editing characters, relics, teams and saves on a second monitor beside the running game, in short tweak → push → check-in-game loops.
Constraints: every string through js/i18n.js (th + en), ?v= cache busting, standard web controls, Thai script must read well, game art (avatars, element/path icons, relic images) stays prominent, never slower than today.
Rollout: redesign the shared system and shell first, then rework each tab's layout one at a time.
Open decisions: tab-by-tab order after Characters; whether the Dashboard survives as its own tab or folds into Team & Battle.

## Direction contract

THESIS: The account as a planner kept beside the game: entries you edit, highlighted by element, and stamped with the time the server received them. It refuses the glowing gamer-dashboard of equal-weight neon cards.

OWN-WORLD: Black planner paper (#16161b) with a faint dot grid, white gel-pen ink (#ecebe4) in three values, element colours used as flat highlighter bands, one reserved pending highlighter (#ffb347) for edits the server has not received, a rotated rubber-stamp mark for received pushes. One-pixel rules, 6-8px radii, no glows, no gradients. Anuphan for UI and Thai, Chakra Petch for names, stats and stamps.

STORY: The player opens straight onto their characters, picks one, changes it, pushes, and sees the stamp move to "received 16:52"; anything still unsent stays highlighted until it lands.

FIRST VIEWPORT: Header with brand, server mode, language, connection and the received stamp. Left rail of planner index tabs, Characters first. Characters fills the centre as a 3-column grid of entries (portrait, name, element highlighter band, LV·E·S line, light cone), with search, element chips and a Bulk menu above. Signature move: the push stamp plus pending highlighter, tied to the real sync tracker.

FORM: Pull Planner, candidate 7 of 7 on the ordered list, seed:7fd64d21645e179d.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
