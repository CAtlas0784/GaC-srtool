---
name: GaCy-srtool
description: A Star Rail private-server planner kept beside the running game, where each edit is marked pending until the server receives it.
colors:
  paper: "#16161b"
  paper-raised: "#1d1d23"
  paper-hover: "#222229"
  paper-sunk: "#111115"
  rule: "#2c2c33"
  rule-strong: "#43434c"
  dot: "#303038"
  ink: "#ecebe4"
  ink-2: "#a9a8a0"
  hl-fire: "#ff9b85"
  hl-ice: "#9ed8f0"
  hl-lightning: "#c8a6ff"
  hl-wind: "#9fe3b8"
  hl-quantum: "#a7a3ff"
  hl-imaginary: "#ffe28a"
  hl-physical: "#d4d3cc"
  pending: "#ffb347"
  received: "#9fe3b8"
  danger: "#ff8a80"
typography:
  headline:
    fontFamily: "Chakra Petch, Anuphan, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "Chakra Petch, Anuphan, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Anuphan, Noto Sans Thai, Noto Sans JP, Noto Sans KR, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Anuphan, Noto Sans Thai, Noto Sans JP, Noto Sans KR, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 500
    letterSpacing: "0em"
  mark:
    fontFamily: "Chakra Petch, Anuphan, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    letterSpacing: "0.04em"
    fontFeature: "tnum"
rounded:
  mark: "2px"
  stamp: "4px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  full: "999px"
spacing:
  xs: "0.35rem"
  sm: "0.6rem"
  md: "0.75rem"
  lg: "1.25rem"
  xl: "1.75rem"
  dot-grid: "22px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.15rem"
  button-primary-hover:
    backgroundColor: "#ffffff"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.15rem"
  button-secondary-hover:
    backgroundColor: "{colors.paper-raised}"
  button-success:
    backgroundColor: "{colors.received}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.15rem"
  button-gold:
    backgroundColor: "{colors.hl-imaginary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.15rem"
  input:
    backgroundColor: "{colors.paper-sunk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.65rem 0.85rem"
  card:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "1.25rem"
  planner-entry:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.75rem 0.9rem 0.75rem 0.75rem"
  planner-entry-hover:
    backgroundColor: "{colors.paper-hover}"
  element-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.full}"
    padding: "0 0.7rem"
    height: "36px"
  element-chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  pending-mark:
    backgroundColor: "{colors.pending}"
    textColor: "{colors.paper}"
    typography: "{typography.mark}"
    rounded: "{rounded.mark}"
    padding: "1px 8px"
  push-stamp-received:
    backgroundColor: "transparent"
    textColor: "{colors.received}"
    typography: "{typography.mark}"
    rounded: "{rounded.stamp}"
    padding: "0.4rem 0.85rem"
  index-tab:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    padding: "0.7rem 1.25rem 0.7rem 1.6rem"
  index-tab-active:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.danger}"
    rounded: "{rounded.sm}"
    padding: "0.6rem 1.15rem"
  button-danger-hover:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.paper}"
  favorite-star:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    size: "32px"
  favorite-star-on:
    textColor: "{colors.hl-imaginary}"
  switch:
    backgroundColor: "{colors.rule-strong}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
  switch-on:
    backgroundColor: "{colors.received}"
    textColor: "{colors.paper}"
  segmented-switch:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "3px"
  segmented-switch-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  editor-strip:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "1rem 1.25rem"
  eidolon-pip-current:
    backgroundColor: "{colors.hl-imaginary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    height: "38px"
  equipment-tile:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.65rem 0.75rem 0.75rem"
  lineup-slot-empty:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "2.4rem 1rem 1rem"
  lineup-slot-filled:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  metrics-row:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.mark}"
    rounded: "{rounded.lg}"
    padding: "1rem 1.25rem"
  settings-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "0.85rem 0"
---

# Design System: GaCy-srtool

## Overview

**Creative North Star: "The Pull Planner"**

The account is a planner kept on the desk beside the game. Each character is an entry written in white gel pen on black planner paper. A flat band in that character's element colour marks the entry, and a rubber stamp in the header records when the server last received a push. The interface reads as one notebook in one material, not as a wall of glowing tiles. This world replaced the earlier glowing navy dashboard. It was chosen for this project and not seeded from a catalog world.

The density suits short, repeated round trips: tweak an entry, push it, check the game, come back. Entries are compact rows in a responsive grid. Status is never a decoration. Pending orange means the server has not received something yet, and the green stamp means it has. Game art (portraits, element and path icons) is the only full-colour imagery. The ink stays neutral so the art and the highlighters can carry the colour.

The world refuses the gamer dashboard of equal-weight neon cards: no glows, no glass, no gradient fills, no tracked uppercase labels. Its depth comes from three paper tones and one-pixel rules. Only floating layers cast a shadow.

**Key Characteristics:**
- Black planner paper with a faint 22px dot grid, the only background image.
- Gel-pen ink in two working values (`ink`, `ink-2`) on three paper tones.
- Element colours applied as flat highlighter bands, never as glows or fills behind text.
- One reserved pending highlighter, plus a received stamp tied to the real sync tracker.
- Anuphan for UI and Thai text. Chakra Petch for names, stats, titles and stamps.
- One-pixel rules and small radii (2 to 10px). Pills are kept for chips and circles for portraits.

## Colors

The palette is a neutral, nearly black paper with warm white ink, plus a set of pastel highlighters that come from the game's seven elements.

### Primary
- **Gel-Pen White** (`ink`): Primary text, the primary button fill, the selected chip and the focus ring. Its hover state is pure white (#ffffff).
- **Faded Ink** (`ink-2`): Secondary text, form labels, placeholders, the stats and light-cone lines on entries, inactive index tabs and chip text.

### Secondary
The element highlighters are the colour identity of each entry, set per entry through the `--entry-hl` custom property from the character's element.
- **Fire Highlighter** (`hl-fire`), **Ice Highlighter** (`hl-ice`), **Lightning Highlighter** (`hl-lightning`), **Wind Highlighter** (`hl-wind`), **Quantum Highlighter** (`hl-quantum`), **Physical Highlighter** (`hl-physical`): used only as the element band on an entry.
- **Imaginary Highlighter** (`hl-imaginary`): the element band for Imaginary characters. It also serves as the planner's general marker: the active index-tab bar, text selection and the gold button. The 5-star rarity colour uses the same hex, and the 4-star rarity colour reuses Lightning.

### Tertiary
- **Pending Highlighter** (`pending`): Reserved. It marks edits the server has not received: the "not sent" tag and border on an entry, the pending stamp and dot, and the pending count in the page summary. Nothing else uses it.
- **Stamp Green** (`received`): The received stamp and success outlines (success toast, success button). It has the same hex as the Wind highlighter, but its role is "the server has this".
- **Correction Red** (`danger`): The error toast outline and offline or failed text.

### Neutral
- **Planner Paper** (`paper`): The page, header, rail and dialog surface. It is also the text colour on filled buttons, chips and marks.
- **Raised Page** (`paper-raised`): Cards, entries, menus, toasts, and the active or hover tab.
- **Pressed Page** (`paper-hover`): The entry hover surface.
- **Sunk Page** (`paper-sunk`): Inputs, selects and the portrait well.
- **Ruled Line** (`rule`): Default one-pixel borders and dividers between the header, rail and page.
- **Strong Rule** (`rule-strong`): Borders on interactive controls (inputs, secondary buttons, chips, the connection pill) and on floating layers.
- **Dot** (`dot`): The 1px dots of the paper grid.

### Named Rules
**The Reserved Highlighter Rule.** `pending` means "the server has not received this" and nothing else. Never use it for warnings, emphasis or decoration. If it appears, the stamp and at least one entry must agree.

**The Highlighter Not Glow Rule.** Element colour goes on a flat band, a chip icon or a rarity mark. It never becomes a glow, a gradient, a tinted card background, or the colour of body text.

## Typography

**Display Font:** Chakra Petch (with Anuphan, system-ui)
**Body Font:** Anuphan (with Noto Sans Thai, Noto Sans JP, Noto Sans KR, system-ui)

**Character:** Anuphan is a calm, legible Thai and Latin sans for everything a player reads. Chakra Petch is a squared, slightly technical face kept for what a player scans: names, numbers, titles and the stamp. Both load from Google Fonts at the weights the build uses (Anuphan 400 to 700, Chakra Petch 500 to 700).

### Hierarchy
- **Headline** (Chakra Petch 700, 2rem, 1.15; 1.6rem at 480px and below): The page title at the head of each tab.
- **Title** (Chakra Petch 700, 1.05rem, 1.2): Entry names, which truncate with an ellipsis on one line. The brand wordmark also uses Chakra Petch 700.
- **Body** (Anuphan 400, 15px, 1.5): Base text and the page summary (0.9rem, `ink-2`).
- **Label** (Anuphan 500, 0.82rem, no tracking, sentence case): Form labels, stat labels and chip text. Buttons use Anuphan 600 at 0.875rem.
- **Mark** (Chakra Petch 600, 0.8rem, 0.04em, tabular numbers): The `LV · E · S` stats line, stat numbers and the push stamp. The pending tag tightens to 0.72rem 700 with 0.06em tracking.

### Named Rules
**The Two Hands Rule.** Anuphan writes and Chakra Petch marks. If a string is read as a sentence, it is Anuphan. If it is scanned as a name, number or status, it is Chakra Petch.

**The Sentence Case Rule.** UI labels are sentence case with no added tracking, so Thai and Latin sit at the same weight. Only Chakra Petch marks carry tracking (0.04 to 0.06em).

## Layout

On wide screens (1025px and up) the page is a two-column grid. The sticky header runs across the top (64px minimum). A 220px left rail holds the planner index tabs, sticky below the header at full viewport height. The main column has no maximum width. It fills the screen, with `1.75rem clamp(2rem, 2.5vw, 3.5rem) 3rem` padding, so a wider screen gets more columns rather than an empty band beside a fixed-width page.

Below 1025px the index tabs run along the top edge as a horizontally scrolling strip, and the active tab gets a 3px bottom bar in place of the rail's 4px left bar.

The Characters page stacks a page head (title and summary on one baseline), then a roster toolbar (search, rarity and path selects, element chips on their own row, Reload and the Bulk menu on the right), then the entry grid. The grid is `auto-fill` with a 280px minimum and a 0.75rem gap. It shows three columns at the reviewed desktop width, and the column count follows the available width rather than a fixed three.

At 768px and below, the header controls become a single scrolling row with the connection pill and stamp first. Rarity, path and element chips share one scrolling facet row, and Reload and Bulk split the full width. At 480px and below, the grid collapses to one column.

Every tab opens with the same page head: an `h1.page-title` in Headline type, with an optional `.page-summary` or count line on the same baseline. No tab adds a kicker above it. Each tab's grid fills the width with `auto-fit` or `auto-fill`.
- **Light Cones & Relics:** A toolbar with a segmented switch, the filters and actions, then a two-column layout. The tile grid uses `auto-fill`, minimum 200px. A 360px detail column is always reserved and sticky at 80px. When nothing is selected it shows a dashed placeholder. Below 1100px the detail stacks under the grid, and at 768px and below the tiles drop to two columns.
- **Dashboard & Team:** A one-line count summary in the page head. Next comes the team panel, whose slots use `auto-fit`, minimum 190px, so the team always spans the width. Below it is a session row: server and battle panels on the left, the console on the right. The session row stacks below 1100px, and the team drops to two columns at 640px.
- **Damage Analyst:** An intro line, a toolbar, a four-cell metrics row (two by two below 900px), the team share panel, then character sheets in an `auto-fit` grid with a 320px minimum (one column at 480px), then an enemies panel.
- **Settings:** Sections in an `auto-fit` grid with a 420px minimum. That gives four columns on very wide screens and two at 1440px. At 520px and below there is one column.
- **Character editor:** A full page, not a dialog. On wide screens it covers the content area beside the rail and below the header (`top: 64px; left: 220px`), so the index stays visible. It uses the same clamp gutter as the main column.

Spacing works in rem steps (0.35, 0.6, 0.75, 1.25 and 1.75rem). The paper's 22px dot grid sets the background rhythm.

## Elevation & Depth

Surfaces are flat at rest. Depth comes from paper tone (sunk, paper, raised) and one-pixel rules, never from glows or blur. Hover lifts a surface by tone or rule strength, not by shadow or translate. Only layers that float over the page cast a shadow.

### Shadow Vocabulary
- **Floating sheet** (`box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45)`): Toasts and the Bulk menu.
- **Dialog** (`box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6)`): Modal content, over a flat `rgba(8, 8, 10, 0.78)` scrim with no blur. The character editor is the exception: it is a page, so it has no shadow, no scrim and no radius, and it sits on the dotted paper.

### Named Rules
**The Flat Page Rule.** Nothing that sits in the page flow casts a shadow, including on hover. A shadow means the layer floats above the planner.

## Shapes

Corners are small and practical. Controls use 6px, menus, toasts and entries 8px, and cards and dialogs 10px. Highlighter bands and the pending tag use 2px, so they read as ink marks rather than pills. The push stamp uses 4px with a 2px border. Two silhouettes are exceptions: element chips and switches are full pills (999px), and portraits are circles. The header has no logo mark. The wordmark is type only, and `assets/logo.png` serves as the favicon and as the fallback for any image that fails to load. Borders are one pixel throughout. Only the received stamp and the 2px focus outline are heavier.

## Components

### Buttons
Flat ink and highlighter fills with no glow.
- **Shape:** Gently squared (6px), 0.6rem 1.15rem padding, Anuphan 600 at 0.875rem.
- **Primary:** Gel-pen white fill with paper text. Hover goes to pure white.
- **Secondary:** Transparent with a strong rule border and ink text. Hover fills with raised paper and the border moves to `ink-2`.
- **Success / Gold:** `received` or `hl-imaginary` fill with paper text. Hover brightens by 6%.
- **Danger:** Transparent with a `danger` border and text. Hover fills with `danger` and paper text. It is used only for destructive resets, and it sits apart from other actions below a rule.
- **Disabled:** 45% opacity with a not-allowed cursor.
- **Focus:** A 2px `ink` outline with a 2px offset, global to all focusable elements.

### Chips
- **Style:** Element filter chips are 36px tall pills with a strong rule border and `ink-2` text, holding the game's 22px element icon or the "all elements" label.
- **State:** Hover moves the border and text to ink. The selected chip (`aria-pressed="true"`) inverts to an ink fill with paper text. On phones the chips scroll in one row.

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** Raised paper, with no blur.
- **Shadow Strategy:** None (see the Flat Page Rule). Hover strengthens the rule only.
- **Border:** 1px `rule`.
- **Internal Padding:** 1.25rem.

### Inputs / Fields
- **Style:** Sunk paper, 1px strong rule border, 6px radius, 0.65rem 0.85rem padding, 0.9rem ink text, `ink-2` placeholder.
- **Focus:** The border turns ink, with a 1px ink ring (`0 0 0 1px`).

### Navigation
- **Style:** Planner index tabs in Anuphan 500, `ink-2`. Hover shows ink text on raised paper. The active tab is ink at 600 weight on raised paper, marked with an Imaginary highlighter bar: 4px on the left edge of the rail, or 3px along the bottom on narrow screens. Characters is the first tab and the landing page. Tabs follow the connection's capabilities: the FireflyGo controls tab (extra_data) appears just before Settings only in FireflyGo mode, and a hidden active tab falls back to Characters. The rail carries no branch or build status.

### Planner Entry (signature)
A character is a `div.planner-entry` that holds two sibling buttons, never one button nested in another. The main button, `.entry-main`, opens the editor. It is laid out as a three-column row: a 64px circular portrait on sunk paper, a body, and a meta column.
- The body stacks the name (Title), a 56 by 7px element highlighter band (2px radius), the Mark-style `LV · E · S` line, and the light cone in `ink-2` at 0.78rem.
- The meta column holds the rarity, drawn as an inline SVG star and digit in the rarity colour, above the game's 18px element and path icons.
- Hover changes only the surface (`paper-hover`) and border (`rule-strong`), with no translate. Pressing it returns the surface to paper.
- **Favorite star:** A separate 32px `.entry-fav` button in the top-right corner. It is an inline SVG star outlined in `ink-2` and carries `aria-pressed`. When on, it fills with `hl-imaginary`. Favorites sort to the top of the roster. A star toggle in the facet row (`.favorite-filter`, filled while active) shows favorites only. Favorites persist per browser in `localStorage` under `gacy.favoriteAvatars`.
- The same entry vocabulary (portrait, Title name, `.entry-hl` band, Mark stats) is reused wherever a character appears: lineup slots, analyst sheets and equipment wearers.

### Pending Mark and Push Stamp (signature)
The system's signature move. It is driven by the real sync tracker, not by decoration.
- **Pending mark:** An entry whose build (level, promotion, data, equipped light cones and relics) differs from the last received snapshot gets a `pending` border and a full-width "not sent" tag in Mark type, paper on `pending`. The page summary turns `pending` and counts them.
- **Push stamp:** A header element with five states.
  - **Received:** `received` text and a 2px border, rotated -2deg like a rubber stamp, reading "received · HH:MM". The time is localized and gains a date when it is not today. It is remembered per server mode, so it stays on the page at rest.
  - **Pending:** `pending` text and border with a pulsing dot (opacity 1 to 0.35, 1s, stopped under reduced motion).
  - **Failed:** Danger text with an underlined Retry.
  - **None and Local:** A dashed border with no rotation.
  - The rotation eases in over 0.24s with `cubic-bezier(0.22, 1, 0.36, 1)`, with no transition under reduced motion.

### Bulk Menu
Account-wide overwrites sit behind one secondary-button disclosure, so they are never the loudest control. The caret is a CSS chevron. The menu is a 220px floating sheet (raised paper, strong rule, 8px radius, floating-sheet shadow) of borderless secondary buttons that hover to paper. The menu closes once an action is chosen.

### Character Editor
- **Header:** A secondary "Back to roster" button (a CSS chevron, then the label) and the character name in Chakra Petch 600 `ink-2`.
- **Strip:** Level, ascension and Eidolon are the edits made most often, so they stay in view above the sub-tabs. They sit in a raised-paper strip (10px radius, 1rem 1.25rem padding) split 2fr / 3fr. Below 900px the strip stacks into one column.
- **Eidolon pips:** 44 by 38px squared buttons in Chakra Petch 700. Unlocked pips have a 14% Imaginary tint and Imaginary text. The current pip is filled with Imaginary and has paper text, plus `aria-pressed`.
- **Sub-tabs:** Plain tabs. The open tab has ink text and a 2px ink underline, with no fill. Relic set names wrap instead of truncating.
- **Action bar:** A sticky bar at the bottom of the page on paper behind a top rule. It holds Save and the other actions, right-aligned. Its buttons fill the width at 480px and below.
- Closing the editor re-renders the roster, so pending marks reflect the edit at once.

### Segmented Switch
Used to pick between two views of one list, such as Light cones or Relics. It is a 3px-padded strip with an 8px radius and a strong rule border. Options are borderless `ink-2` text. The active option inverts to an ink fill with paper text, and each option shows its count in Mark type at 75% opacity. On phones it spans the full width and the options share it equally.

### Equipment Tile
Each light cone or relic is a real `<button>`.
- **Shape:** Raised paper, 1px rule, 8px radius.
- **Art:** On top, over sunk paper. Light cones are 4:5 and cropped from the top. Relics are 16:10, contained and padded.
- **Slot mark:** For relics, a paper tag in Mark type in the art's top-left corner.
- **Body:** The full name in Chakra Petch 700, up to two lines. A relic's main stat follows in `hl-imaginary` at 0.82rem 600. Then a Mark stats line with an inline SVG rarity star, and finally the wearer: a 22px portrait and name, or "free" in `ink-2`.
- **States:** Hover strengthens the rule and moves the surface to `paper-hover`. The selected tile gets an ink border plus a 1px ink ring.
- **Detail panel:** Raised paper with a strong rule. It has a 32px close button (an SVG cross) and an SVG rarity star, and set bonuses sit under a sentence-case subhead.

### Lineup Slot
- **Empty:** A dashed strong-rule outline on transparent paper with a CSS-drawn plus and `ink-2` text.
- **Filled:** A solid rule on `paper`, with an 84px portrait (64px on phones), the name in Title type, the entry highlighter band, a Mark `LV · E` line and the element and path icons.
- **Number tag:** The slot number is a raised-paper tag in Mark type, top-left.
- **Remove:** A 28px squared button with an SVG cross. Hover turns it `danger`.
- Slots are keyboard-operable (`role="button"`, Enter and Space) and show the global focus ring.

### Metrics Row
Battle numbers are written as one ruled row, not as coloured boxes. It has four cells divided by 1px rules. Each cell has a 0.85rem `ink-2` label, a value in Chakra Petch 700 with tabular numbers, and an optional 0.8rem note. On the dashboard it sits between top and bottom rules inside a panel. In the analyst it is a raised-paper band with a 10px radius. Small section labels inside panels use `.dash-subhead`: 0.85rem 600 `ink-2`, in sentence case.

### Damage Share
- **Share bar:** Team damage share is one 14px bar of element highlighters, one segment per character in its `--entry-hl` colour, with 2px paper gaps between segments.
- **Legend:** Each item pairs a 14 by 7px swatch with a 24px portrait, the name, the share in Mark type and the damage in `ink-2`.
- **Character sheets:** Each sheet is a card containing:
  - a portrait with a small element disc;
  - the name and a Mark stats line;
  - the share percentage, large on the right;
  - a 7px share track;
  - a `dl` of totals and of breakdown rows (label `ink-2` left, value in Mark type right, ruled between);
  - a footer of turns, shield, healing and damage taken with game stat icons.
- **Enemies:** Listed as ruled rows.

### Settings Row and Switch
- **Row:** A title (Anuphan 600, 0.95rem) and a description (0.84rem `ink-2`) on the left, with the control on the right. Rows are separated by 1px rules, and the first row has none.
- **Note:** An informational note in a section is a dashed strong-rule box, set apart from the rows.
- **Switch:** Off is a `rule-strong` track with an ink knob. On is a `received` track with a paper knob. It transitions over 0.18s, with no transition under reduced motion. The real checkbox is visually hidden, so `input:focus-visible + .slider` draws the 2px ink focus ring on the track.
- **Actions:** Save is the primary button and fills the action row. Clearing the cache and resetting everything sit below a rule as a separate danger group.

## Do's and Don'ts

### Do:
- **Do** keep the page on `paper` with the 22px `dot` grid as its only background image.
- **Do** colour an entry through `--entry-hl` from its element, as one flat 7px band.
- **Do** keep `pending` tied to `pendingAvatarIds` / `setSyncStatus`. When the server receives a push, the stamp turns `received` and the marks clear together.
- **Do** separate surfaces with paper tone and 1px `rule` / `rule-strong` lines. Hover changes tone or rule, never position.
- **Do** set names, stats, titles and stamps in Chakra Petch, and everything read as prose in Anuphan, in sentence case.
- **Do** route every visible string, including stamp and pending labels, through `js/i18n.js` (th and en), and bump the `?v=` query when CSS or JS changes.
- **Do** draw icons as inline SVG or use the game's own element, path and avatar art.
- **Do** open every tab with `.page-head` and let its grid fill the width. Never cap a tab in a fixed-width centred column.
- **Do** make every clickable tile, slot or entry a real button (or `role="button"` with Enter and Space), with the global focus ring. Put secondary actions such as the favorite star in sibling buttons.
- **Do** colour a character wherever it appears (entry, lineup slot, analyst sheet, share segment) with the same `--entry-hl` element highlighter.
- **Do** set a translated label from JS through `setI18nText(node, key)` or `t()`, so a language switch re-renders it.

### Don't:
- **Don't** add glows, glass or blur, or gradient fills. The dot grid is the one native gradient.
- **Don't** put a shadow on anything in the page flow. Shadows belong only to toasts, menus and dialogs.
- **Don't** use `pending` orange for anything but unsent edits, or show it without the sync tracker behind it.
- **Don't** set UI labels in tracked uppercase, or add kickers or eyebrows above titles.
- **Don't** use emoji or text glyphs as icons.
- **Don't** tint whole cards or text with element colours. The highlighter band carries the identity.
- **Don't** confirm a push with a success toast before the server answers. Gate the toast on the tracked push result.
- **Don't** add inline `style=""` layout to the markup. Give it a class in the planner layer of `css/styles.css`.
- **Don't** reintroduce the logo mark or branch status in the header or rail.
