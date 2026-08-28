# Tableclock visual thesis

## Direction: the rules-sheet clock

Tableclock looks like the spot-colour instruction sheet and punchboard from a well-loved tabletop game: warm uncoated paper, dense ink, registration marks, clipped corners, and visible halftone. That visual language belongs at a table, stays readable across one, and avoids both faux hardware skeuomorphism and generic app chrome. Decoration is concentrated in the setup illustration and quiet dot fields; once a clock is running, time is the graphic.

The treatment is deliberately single-mode. A painted warm-paper ground prevents a surprise white splash when installed, while the running surface becomes darker and higher contrast. There is no cosmetic dark-mode toggle: in a timed game, an identical shared colour language on every phone is more useful than per-device theming.

## Tokens

- `paper #F3EBD6` / `paper-deep #DED2B5`: the stock and recessed controls.
- `ink #201D19` / `ink-soft #5D554A`: primary and supporting print ink.
- `tomato #B73527`: the press-button accent; white text passes AA.
- `blue #175A70`, `plum #67405D`, `forest #2F6249`, `ochre #8A5A10`, `brick #84372E`, `navy #334868`, `olive #53632D`, `slate #50585D`: player fields, each paired with white and a non-colour label/turn number.
- `cream #FFF9EA`: active-clock text.
- `success #286143`, `warning #805208`, `danger #9A2E24`: state feedback.

Contrast is designed to meet 4.5:1 for normal copy. Player colours never communicate status alone: active position is also named, enlarged, patterned, and announced.

## Type and spacing

Display type uses the locally available slab-serif stack `Rockwell, Roboto Slab, Georgia, serif`, evoking a rulebook title. Utility copy uses `Avenir Next, Inter, Segoe UI, system-ui, sans-serif`. No network fonts are fetched. Time uses tabular figures and the utility face for unambiguous numerals.

The scale is 14 / 16 / 20 / 28 / fluid 40–88 px. Body copy never falls below 16 px. The 4 px base rhythm produces 8, 12, 16, 24, 32, and 48 px gaps. The setup column is capped at 760 px; the running board deliberately occupies the viewport and drops the setup illustration and descriptive copy on phones.

## Interaction grammar

- A solid tomato lozenge is the single primary action. Secondary controls are paper buttons with an ink outline and a 3 px printed offset shadow.
- Presses move down by 2 px like a cardboard counter. Focus is a 3 px cream/tomato double ring, never an absent outline.
- The active player is the biggest field. Tapping anywhere in it ends the turn. Running controls live in a separate ink strip so accidental taps are less likely.
- Settings open as a native semantic dialog with focus return. Destructive reset names its effect and requires confirmation.
- Keyboard: Space/Enter ends a turn; P pauses/resumes; arrows move a selected player in setup; Escape closes dialogs.

## Motion

State changes use 180–240 ms transform and opacity: the departing field compresses slightly and the next turn settles from 6 px away, following the direction of play. A short single pulse marks an AP nudge. Nothing loops. Under `prefers-reduced-motion`, transforms and smooth scrolling are removed and changes are immediate; audio and haptics remain user-controlled.

## Original asset plan and provenance

The landing illustration is a hand-authored CSS print: one shared blue phone, three numbered cardboard markers, registration rings, and a paper grid. It keeps the spot-colour rules-sheet world while making the shipped one-device scope unmistakable. App icons are hand-authored SVG/PNG: a circular turn arrow around four table spots, using the same inks. The social preview is derived from that icon on the warm paper ground.

The earlier generated five-phone artwork remains in `assets/src/` only as a retained source record; it is no longer presented in the product because it implied unsupported cross-phone play. Its original prompt sidecar is preserved for provenance. The current CSS illustration and icons are original Tableclock work, released under the project MIT license.
