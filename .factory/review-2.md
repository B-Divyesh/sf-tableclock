# Adversarial first-read review 2 — Tableclock

Date: 2026-08-28

Work order: `tableclock-review-2`  
Reviewed live site: https://tableclock.sociobot.in  
Repository commit reviewed: `eb89279e5a0b1347994100bbed84c449a80eceb0`

## Verdict

**FAIL.** The cold explanation, demo data, local isolation, privacy/offline
behaviour, metadata, visual identity, and all 30 declared claim commands are
substantively working. Three remaining findings prevent a PASS: the running
demo discards the site shell that is required on every route/state, the
landing-to-demo route change leaves focus on `body`, and one broad keyboard
claim has no corresponding claim entry/test.

## Cold first read

I used new Chromium contexts with no existing site storage, made no scroll
before recording these answers, and checked 390 × 844 and 1440 × 900.

| Viewport | What it does | For whom | First click | Result |
| --- | --- | --- | --- | --- |
| 390 × 844 | A shared-phone timer that moves a board-game table to the next player's turn. | Board-game groups with two to eight players. | “Try it with sample data.” | Clear. The action was visible at `y=320`, and “Loads a four-player game with a running clock.” states the result. |
| 1440 × 900 | The same turn timer. | The same two-to-eight-player board-game groups. | “Try it with sample data.” | Clear. |

The first-screen text that supports this is: “Time every player’s turn,” “For
board-game groups of two to eight players who want turns to keep moving,” and
“Try it with sample data.” No cold-read blocking finding is raised.

## Findings

### F-2-1 — Major: the first demo screen omits the required consistent header and footer

- Exact location/evidence: after clicking “Try it with sample data,” live
  `/demo` immediately renders the seeded running game. Its `<header
  class="game-header">` contains only the `Tableclock` menu button and “Sync
  not included.” It has no navigation links, no `.site-header`, no `.site-nav`,
  and no `<footer>`. Thus Privacy and Terms, the product one-liner, Param
  Factory attribution, and build id disappear from the first useful demo
  screen.
- Why this matters: this is the one-click evaluation state, yet a visitor has
  no visible route to the legal/privacy information or the ordinary product
  navigation. It also fails the stated site-shell requirement for a consistent
  wordmark-to-home header and footer on every route/state.
- Concrete fix: keep a compact, 44 px-target game header with a wordmark link
  to `/` and visible Privacy/Terms navigation (or an explicitly named,
  keyboard-accessible navigation control), and retain the required footer in
  the running state without covering the clock controls. Add a browser test
  that opens `/demo` from a fresh context and asserts the wordmark home link,
  Privacy, Terms, footer one-liner, factory attribution, and build id are
  present.

### F-2-2 — Minor: the primary demo route change does not move focus to its heading

- Exact location/evidence: activating the visible home button “Try it with
  sample data” performs `location.assign('/demo')` in `src/main.ts`. On the
  live `/demo` result, `document.activeElement` is `<body>`, not the sole
  `<h1>Game clock</h1>`. In contrast, the tested in-app Privacy link and Back
  navigation correctly focus their new `<h1>` and announce it.
- Why this matters: a keyboard or screen-reader visitor who takes the primary
  route-changing action receives no focus cue for the new page/state. This is
  a regression from the route-focus contract even though the visual running
  sample is clear.
- Concrete fix: carry an explicit navigation-focus intent through the
  home-to-demo and demo-to-real full navigations, then focus the new `main h1`
  and populate the polite route announcer after boot. Add a browser test that
  clicks “Try it with sample data” and asserts `/demo`, focused `main h1`, and
  the “Game clock” announcement.

### F-2-3 — Minor: “Options” is not a result-naming button label

- Exact location: the live running clock's control dock has a button labelled
  “Options” (`data-action="game-menu"`). The game wordmark is also a button
  with the accessible name “Tableclock Menu.”
- Why this matters: “Options” names neither the action nor the result; it
  makes the primary control discovery less precise and fails the supplied
  plain-words button rule.
- Concrete fix: label the dock button “Open clock options” and make the
  wordmark a home link. If a menu remains, name its control “Open clock menu.”

### F-2-4 — Minor: an on-page keyboard claim is broader than its declared claim contract

- Exact quote/location: the landing setup helper says “Tab still moves through
  every control.” `.factory/claims.json` has no claim for tab traversal. Its
  nearest entry, `keyboard-reorder`, promises only that arrow keys reorder,
  retain focus, and match the move buttons; its test checks one next-Tab
  destination, not every enabled control.
- Why this matters: this is a visitor-facing universal accessibility claim
  without an exact sandbox proof, contrary to the claims contract.
- Concrete fix: add `keyboard-tab-order` to `.factory/claims.json`, located at
  the setup helper, with a clean-context test that tabs through every enabled
  setup control in visible order and confirms no trap. Alternatively narrow
  the copy to the one tested next control.

## Copy audit

Counts treat hyphenated compounds and contractions as one word. The following
is the independent inventory of every landing sentence or equivalent visible
copy unit, followed by every README sentence. No entry exceeds 22 words;
apart from F-2-3 and F-2-4, I found no jargon, banned marketing adjective,
inconsistent term, unclear heading, or non-result-naming button.

### Landing page

| Copy | Words | Audit |
| --- | ---: | --- |
| Skip to timer | 3 | clear action |
| Tableclock | 1 | wordmark |
| Demo / Privacy / Terms | 1 each | clear links |
| Online / Offline-ready | 1 each | state, not a claim sentence |
| Install app | 2 | verb/action |
| A turn timer for the whole table | 7 | clear context |
| Time every player’s turn | 4 | plain, verb-first h1 |
| For board-game groups of two to eight players who want turns to keep moving. | 14 | clear audience/result |
| Try it with sample data | 5 | clear primary action |
| Set up your own clock | 5 | clear real-path action |
| Loads a four-player game with a running clock. | 8 | `demo-seed` |
| Free. | 1 | `free-use` |
| Works offline after the first visit. | 6 | `offline-reload` |
| Player names stay in this browser. | 6 | `local-storage` |
| Runs on one shared phone. | 5 | `one-shared-device` |
| Cross-phone sync is not included. | 5 | `no-cross-phone` |
| Pass one shared phone around the table. | 7 | clear instruction |
| Who’s playing? | 2 | clear h2 |
| Select a player name, then use Arrow Up or Arrow Down to move that player in the turn order. | 19 | clear keyboard guidance |
| Tab still moves through every control. | 6 | F-2-4 |
| Player [number] name | 3 | bound label |
| Move [player] earlier / later | 3 each | result-naming controls |
| Remove [player] / Add player | 2 each | result-naming controls |
| How should time work? | 4 | clear h2 |
| Count up — Track time used | 6 | `mode-count-up` |
| Time bank — One budget each | 6 | `mode-time-bank` |
| Bank with increment — Budget with time back | 8 | `mode-increment` |
| Per-turn limit — Fresh limit every turn | 7 | `mode-per-turn` |
| Starting bank / Per turn / Increment / Gentle nudge after | 1–3 | clear field labels |
| seconds / seconds · 0 off | 1–3 | clear units |
| Start the clock | 3 | result-naming action |
| Create a setup link | 4 | result-naming action |
| Keep turns moving in three steps | 6 | clear h2 |
| Name the players. | 3 | clear step |
| Put them in turn order. | 5 | clear step |
| Choose a clock. | 3 | clear step |
| Pick the timing rule your table uses. | 7 | clear step |
| Tap the active field. | 4 | clear step |
| The next player starts. | 4 | `turn-flow` |
| What this timer does not do | 6 | clear h2 |
| It does not track scores. | 5 | `no-scorekeeping` |
| It does not connect phones. | 5 | `no-cross-phone` |
| Everyone uses the same device at the table. | 8 | `one-shared-device` |
| Install it from this site. | 5 | `pwa-install` |
| The demo keeps working without a connection after your first visit. | 11 | `offline-reload` |
| Import a setup | 3 | result-naming action |
| One shared-device turn timer for board-game tables. | 7 | precise footer scope |
| Built by Param Factory | 4 | attribution |
| build [identifier] | 2 | build label |

### README

| Sentence | Words | Audit |
| --- | ---: | --- |
| Tableclock is a turn timer for two to eight players around a board-game table. | 14 | clear |
| Everyone uses one shared phone. | 5 | `one-shared-device` |
| Try it with sample data. | 5 | clear action |
| The isolated demo starts a running four-player game. | 8 | `demo-seed` |
| It cannot read or change real games. | 7 | `demo-isolation` |
| Choose Count up, Time bank, Bank with increment, or Per-turn limit. | 11 | four mode claims |
| Tap the active field to start the next player’s turn. | 10 | `turn-flow` |
| Tableclock does not track scores. | 5 | `no-scorekeeping` |
| It does not connect phones. | 5 | `no-cross-phone` |
| Development requires Node.js 20 or newer. | 6 | repository support fact |
| The development server prints a local URL. | 7 | run instruction |
| The static output is `dist/`, with `dist/index.html` at its root. | 11 | build result |
| Run each visitor-facing claim from a clean browser context with the commands in `.factory/claims.json`. | 14 | verification instruction |
| The browser suite includes keyboard, mobile, route, accessibility, privacy, and offline checks. | 11 | verification instruction |
| In setup, focus a player’s name. | 6 | clear instruction |
| Press Arrow Up or Arrow Down to move that player. | 10 | `keyboard-reorder` |
| Focus stays on the moved field. | 6 | `keyboard-reorder` |
| The adjacent buttons perform the same moves. | 7 | `keyboard-reorder` |
| Player names, preferences, and unfinished clocks stay in this browser. | 9 | `local-storage` |
| The app sends no game data to another origin. | 9 | `same-origin` |
| Export a setup file, import it later, or create a setup link. | 11 | setup import/export/link claims |
| Setup links keep names and rules in the URL fragment, which browsers do not send to the server. | 17 | `setup-link-local` |
| Publish `dist/` to the static work-order target. | 7 | deploy instruction |
| The included host configuration sets cache, route, 404, MIME, and security-header policies. | 11 | static configuration fact |
| Licensed under the MIT License. | 5 | legal fact |

Terms are consistent: **player**, **turn timer**, **setup**, **Count up**,
**Time bank**, **Bank with increment**, and **Per-turn limit**. The product
does not need an AI feature: timing a board-game turn is deterministic, and
an AI feature here would be decorative. Setup import/export is already
available. Cross-phone sync is an optional brief capability that is honestly
and prominently excluded, so it is not recorded as missed leverage.

## Demo and sandbox checks

- The first-screen one-click button opens `/demo`, where a realistic running
  four-player sample appears immediately: Maya and Lionel have completed
  turns, Priya is active on turn three, and the 15-minute bank with a
  30-second increment is visible in the live timer behaviour.
- The persistent banner reads “Demo — sample data, nothing is saved” and has
  working “Reset demo” and “Start for real” actions. Reset returned the live
  sample from Sora to Priya. Start for real returned the real setup.
- A real saved first name `Real Ada` in `tableclock-local` remained `Real Ada`
  after demo entry, a demo turn, reset, and exit. Source inspection confirms
  separate `tableclock-demo` and `tableclock-local` IndexedDB databases.
- On the live site, after service-worker control and `context.setOffline(true)`,
  `/demo` reloaded offline and an active turn advanced from Priya to Sora.
- Request capture across demo and real flows observed same-origin GET document,
  script, and stylesheet requests only; no XHR/fetch or cross-origin request
  appeared. Source inspection found no analytics, payment code, WebSocket,
  runtime CDN, or provider key.

## Claims and quality evidence

From the clean clone at `/tmp/tableclock-review2-clean`:

- `npm ci` passed with 0 vulnerabilities.
- `npm test` passed: 9 files, 32 tests.
- `npm run build` passed and generated `dist/`; initial JS was 32.76 KB raw /
  11.03 KB gzip.
- `npm run test:e2e -- --workers=1` passed: 34 tests.
- Every command named by all 30 `.factory/claims.json` entries was run
  separately and passed. This included demo isolation/reset/exit, offline
  reload, all four modes, bounds, import/export, setup links, local storage,
  request interception, sound/vibration, keyboard reorder, and PWA install.

The only unlisted claim found is F-2-4. All other visitor-facing claims map to
their stated entry and the matching tagged browser test.

## Structure, accessibility, and route checks

- `/`, `/demo`, `/privacy`, and `/terms` each returned 200 with one h1, a main
  landmark, route-specific title, plain description, canonical URL, OG/Twitter
  fields, favicon, and Apple touch icon. Titles were respectively “Tableclock
  — turn timer for board-game groups,” “Demo — Tableclock,” “Privacy —
  Tableclock,” and “Terms — Tableclock.”
- `/not-a-real-route` returned a designed static 404 with HTTP 404, title
  “Page not found — Tableclock,” h1 “This table has no page,” and a return
  link. All discovered internal link destinations returned their expected
  successful status, except the 404 page’s own skip target, which correctly
  retains its 404 response.
- Privacy forward navigation and Back both focused the h1, announced the new
  heading, and restored the previous scroll position. F-2-2 is the remaining
  exception for the primary full-navigation demo action.
- Live mobile Axe found no serious or critical violations in home or running
  demo state. The 390 px first-screen primary action is 58 px high; the visual
  system is distinct and matches the documented warm-paper, spot-ink,
  halftone rules-sheet thesis rather than a generic SaaS template.
- The live host serves the manifest as `application/manifest+json`, a
  self-only CSP with `frame-ancestors 'none'`, DENY framing,
  Permissions-Policy, no-sniff, and HTTPS/HSTS. There were no console errors
  during cold home, demo, reset, offline, or route checks.

## Earlier findings: live and code confirmation

Every prior finding was rechecked from scratch rather than accepted from its
status label. The entries below are fixed; none is repeated as a regression.

| Earlier IDs | Confirmation |
| --- | --- |
| B1 | Live 390 and desktop show the plain h1, audience sentence, sample action, real-path action, result note, and three fact lines above the setup. |
| B2 | `/demo`/`?demo=1` seed the running four-player isolated sample; reset/exit and offline reload passed. `storage.ts` uses `tableclock-demo` separately from `tableclock-local`. |
| B3 | `.factory/claims.json` exists; the unit contract enforces exactly one tag per entry; all 30 listed commands passed individually. |
| B4 | The explicit host routes and 404 override return the designed 404 with HTTP 404. |
| B5 | The desktop art is a one-phone CSS illustration and first-screen copy explicitly says cross-phone sync is not included. |
| S1 | Route metadata, canonical, OG/Twitter social image, favicon, and Apple icon are present live. |
| S2 | Legal forward/Back focus, announcement, and scroll restoration work live; F-2-2 records the separate full-navigation gap. |
| S3 | Header, first screen, live setup, three steps, limitations, and ordinary footer exist on the setup/legal shell; F-2-1 records the running-state exception. |
| S4 | Visible ordinary header/footer links and enabled controls meet 44 px in the 390 px browser test. |
| S5 | The one-phone art, paper/ink palette, and timer instrument surface retain the product-specific identity without the former promise/art mismatch. |
| C-L01 through C-L10 | The h1, player count copy, one-device art, mode names, setup-link action, install wording, scoped privacy wording, footer, dialog heading, and Close action match the round-one rewrites. |
| C-R01 through C-R14 | README uses the repaired player/mode/local-storage/import-export language, short keyboard sentences, plain build instructions, and no former provenance, CDN, wake-lock, or app-store jargon. |
| U01 through U20 | Player range, free/account/score/offline, one-device/no-sync, local storage, modes, setup links, import/export, browser reorder, network privacy, static routing/cache/MIME, and license claims are either individually registered/tested or are repository/legal instructions, as verified above. |
| verification-1: cache policy | Hashed `/assets/*` are configured immutable while HTML and the service worker revalidate. |
| verification-1: unavailable sync | No room/sync flow remains; the optional capability is transparently out of scope. |
| verification-1: Arrow reorder | The live setup field reorders with Arrow Up/Down, retains focus, and has equivalent move buttons. |
| verification-2: out-label contrast | Live running-demo Axe had no serious/critical violation after normal demo checks; the reviewed color constant/test covers the former label contrast defect. |
| verification-2: keyboard vibration console error | The source gates vibration by pointer activation; no console error occurred in the reviewed keyboard/demo flows. |
| verification-2: mobile performance | The current payload is well under budget and the prior 100 mobile result has not regressed in the exercised live view. |
| verification-2/3: missing headers/MIME | Current live headers include CSP, framing policy, Permissions-Policy, and manifest JSON MIME. |
| verification-3: mobile player strip | The strip has `tabindex="0"`, descriptive help, and Left/Right arrow scrolling; the current Axe check passed. |
| verification-3: malformed import | `parseImportedSetup` validation and its unit tests reject invalid modes/non-finite/out-of-range settings before a game can start. |

## What would make this perfect

Close F-2-1 through F-2-4: preserve legal/site navigation and footer in the
running demo, transfer focus and announcement through the primary demo route
change, name the menu action by its result, and either prove or narrow the
universal Tab claim. Then rerun the individual claim commands plus the new
route-focus, running-shell, and tab-order tests. Only then would this review
be eligible for PASS.
