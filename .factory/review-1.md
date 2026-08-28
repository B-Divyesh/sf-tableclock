# Adversarial first-read review 1 — Tableclock

Date: 2026-08-28

Work order: `tableclock-review-1`

Candidate: `f5d20393223bd4f9605ba6836962fa46be17f51c`

Live site: https://tableclock.sociobot.in

## Verdict

**FAIL.** The review found five BLOCKING failures. Tableclock cannot pass with a missing one-click demo, no demo sandbox, no claims manifest, an ambiguous first action, and broken unknown-route handling. The desktop first screen also suggests a multi-phone product although the implementation explicitly has no cross-phone sync.

The core one-phone timer itself worked in the exercised flows. That does not override the acceptance criteria above.

## Cold first screen

Both checks used a new browser context with no prior site storage and no scrolling.

| Viewport | What does it do? | For whom? | What should I click first? |
| --- | --- | --- | --- |
| 390 × 844 | A turn timer. This is inferable from “A turn timer for the whole table” and “Two to eight players, one clear clock.” | Two to eight players at one table. | **Cannot answer.** There is no primary action in the viewport. The first controls are under “Who’s playing?” and the only instruction is “Select a player name, then use Arrow Up or Arrow Down…” |
| 1440 × 900 | A turn timer. | Two to eight players at one table. | **Cannot answer.** The setup begins at the bottom of the viewport, but no primary action is visible. “Start the clock” is below the fold. |

The `<h1>` itself is “Take turns. Not forever.” It is a pun rather than the job, so the eyebrow and supporting sentence have to repair it.

## Findings, ordered by severity

### B1 — BLOCKING: the first screen does not say what to do first

- Quote: “Take turns. Not forever.” / “Who’s playing?” / “Select a player name, then use Arrow Up or Arrow Down to move that player in the turn order.”
- Why this loses a visitor: neither viewport shows a primary action or says what the first click will produce. The headline also does not name a timer or board-game use without surrounding copy.
- Concrete fix: use `<h1>Time every player’s turn</h1>`, followed by “For board-game groups of two to eight players who want turns to keep moving.” Put `Try it with sample data` above the fold with “Loads a four-player game with a running clock.” Beside it, show the real first step, `Set up your own clock`.

### B2 — BLOCKING: there is no demo, and `/demo` uses real storage

- Quote/evidence: there is no “Try it with sample data” action. `/demo` renders the ordinary home setup, with no “Demo — sample data, nothing is saved” banner, `Reset demo`, or `Start for real`.
- Sandbox proof: in a fresh context, the normal setup was changed to `REAL ALICE`. Opening `/demo` displayed `REAL ALICE`. Changing it there to `DEMO EVE` and returning to `/` displayed `DEMO EVE`. Both paths use the `tableclock-local` IndexedDB database and `state` store.
- Why this misleads a visitor: `/demo` looks like a supported route because the SPA fallback returns HTTP 200, but it is neither seeded nor isolated. A visitor cannot try the product safely, and any purported demo operation changes normal data.
- Concrete fix: implement `/demo` (and optionally `?demo=1`) with a separate `tableclock-demo` namespace. Seed four realistic names, a selected timing mode, elapsed history, and an already running turn. Add the persistent demo banner, working reset, and start-for-real exit. Ensure the seeded demo reloads offline and document it in `.factory/demo.md`.

### B3 — BLOCKING: the required claims manifest and claim-tagged tests do not exist

- Quote/evidence: `.factory/claims.json` is absent and `rg '@claim:' .` returns no matches. There were therefore no listed claim commands to run.
- Why this misleads a visitor: claims such as “No data is uploaded” and “keeps working without a connection” have no required clean-sandbox test contract. Passing general tests is not equivalent to registering and testing each claim.
- Concrete fix: add `.factory/claims.json`; give every claim below exactly one `@claim:<id>` test; run each command against `/demo` in a clean context. Split compound claims so each observable promise is asserted.

### B4 — BLOCKING: unknown routes silently render the product as HTTP 200

- Quote/evidence: `/not-a-real-route` returned HTTP 200 with title “Tableclock — take turns, not forever” and the home `<h1>`. No designed 404 exists.
- Why this loses a visitor: a mistyped or stale link gives no indication that the route is invalid, and crawlers index duplicate home pages.
- Concrete fix: route unknown paths to a Tableclock-styled 404 with a clear “Return to Tableclock” link. Configure hosting so the dedicated 404 is served for unknown documents while valid SPA deep links still load.

### B5 — BLOCKING: the desktop first screen implies multi-phone use that is not available

- Quote: the illustration shows five phones and is captioned “One phone or a whole table.” The README instead says “It works on one shared phone” and “Cross-phone sync is not included in this release.”
- Why this misleads a visitor: the product brief and visual suggest multiple devices at the table, while the shipped timer is one-device only. The limitation appears below the setup and outside the cold desktop viewport.
- Concrete fix: either ship isolated room sync and test it, or replace the multi-phone art/caption. Put “Runs on one shared phone; cross-phone sync is not included” among the three first-screen facts.

### S1 — Major: required route metadata is incomplete

- Quote/evidence: `/` has a description and SVG favicon, but no canonical URL, Open Graph fields, Twitter card, 1200 × 630 social image, or apple-touch icon. `/privacy` and `/terms` have no meta description and none of those fields. The home title’s suffix, “take turns, not forever,” is not a plain description of what the product does.
- Why this matters: shared links and search results do not identify the product consistently, and route identity is incomplete.
- Concrete fix: use `Tableclock — turn timer for board-game groups` and route-specific legal titles/descriptions. Add canonical, OG, Twitter, 1200 × 630 product art, and apple-touch metadata to every served document.

### S2 — Major: route focus, scroll, and shells are inconsistent

- Quote/evidence: after the in-app Privacy link, focus was on `<body>`, not the new `<h1>`, and the legal page retained a scrolled position. Back navigation also left focus on `<body>`. Direct `/privacy` and `/terms` requests serve standalone documents with different copy, header, and footer from in-app navigation.
- Why this loses a visitor: keyboard and screen-reader users receive no route-change focus cue, and the same URL has two presentations depending on how it was opened.
- Concrete fix: use one renderer per route, focus a `tabindex="-1"` `<h1>` on push/pop navigation, announce the title in a polite live region, reset forward navigation to the top, and restore the prior position on Back.

### S3 — Major: the standard landing structure is incomplete

- Quote/evidence: the page moves from the intro directly into a long setup form. There is no demo action, three explicit fact lines, three-step “How it works,” clear limitations/privacy section, or consistent site navigation. Footers omit “Built by Param Factory” and a version/build id.
- Why this loses a visitor: the product is usable only after discovering controls by scrolling, while limitations and ownership details are scattered.
- Concrete fix: retain the live setup, but precede it with the required first-screen actions/facts. Follow it with three short use steps and a plain limitations/privacy section. Use one header/footer across all routes with Demo, Privacy, Terms, factory attribution, and build id.

### S4 — Major: several link targets are shorter than 44 px

- Quote/evidence at 390 px: the home wordmark link measured 28 px high; home footer Privacy and Terms links measured 16 px; legal-page links measured 19 px.
- Why this matters: these targets are harder to activate by touch and fail the supplied 44 px target rule.
- Concrete fix: give header and footer links at least 44 × 44 px hit areas using padding or block-level wrappers without reducing visible focus.

### S5 — Minor: the visual identity is distinct, but the product promise and art diverge

- Verification: warm paper, spot inks, halftone texture, slab-serif display type, printed offset shadows, and the tabletop illustration visibly match `.factory/design.md`; this is not a generic SaaS template.
- Remaining fix: preserve that system while replacing the five-phone implication described in B5.

## Copy audit

Counts treat a contraction or hyphenated compound as one word. The landing inventory includes headings, labels, actions, helper text, dialog copy, alt text, and accessibility-only control names, not just grammatical sentences. Complete landing sentences average 6.9 words and none exceeds 22. README sentences average 13.4 words; two exceed 22.

### Landing page: every copy unit

| # | Exact copy | Words | Flag |
| ---: | --- | ---: | --- |
| 1 | Skip to timer | 3 | — |
| 2 | Tableclock | 1 | — |
| 3 | Online | 1 | — |
| 4 | Install app | 2 | — |
| 5 | A turn timer for the whole table | 7 | — |
| 6 | Take turns. | 2 | C-L01 |
| 7 | Not forever. | 2 | C-L01 |
| 8 | Two to eight players, one clear clock. | 7 | C-L02 |
| 9 | No account, no scorekeeping, and no signal required. | 8 | U02 |
| 10 | One phone or a whole table. | 6 | C-L03, U03 |
| 11 | Who’s playing? | 2 | — |
| 12 | Select a player name, then use Arrow Up or Arrow Down to move that player in the turn order. | 19 | — |
| 13 | Tab still moves through every control. | 6 | U14 |
| 14 | Player 1 name | 3 | — |
| 15 | Player 2 name | 3 | — |
| 16 | Player 3 name | 3 | — |
| 17 | Add player | 2 | — |
| 18 | How should time work? | 4 | — |
| 19 | Clock mode | 2 | — |
| 20 | Count up | 2 | — |
| 21 | Track time used | 3 | — |
| 22 | Time bank | 2 | — |
| 23 | One budget each | 3 | — |
| 24 | Bank + increment | 2 | C-L04 |
| 25 | Budget + time back | 4 | C-L04 |
| 26 | Each turn | 2 | C-L04 |
| 27 | Fresh limit every turn | 4 | C-L04 |
| 28 | Gentle nudge after | 3 | — |
| 29 | seconds | 1 | — |
| 30 | 0 off | 2 | — |
| 31 | Start the clock | 3 | — |
| 32 | Share this setup | 3 | C-L05 |
| 33 | Made to outlast app stores. | 5 | C-L06, U04 |
| 34 | Install it once and the clock keeps working without a connection. | 11 | U05 |
| 35 | Cross-phone sync is not included in this release. | 8 | U06 |
| 36 | Import a setup | 3 | — |
| 37 | Free, private, and made for the table. | 7 | C-L07, U09 |
| 38 | Privacy | 1 | — |
| 39 | Terms | 1 | — |
| 40 | Original AI-assisted print | 3 | C-L08 |
| 41 | Preset link | 2 | — |
| 42 | Bring this setup back | 4 | C-L09 |
| 43 | Player names and clock rules are encoded in the link. | 10 | U07 |
| 44 | No data is uploaded. | 4 | U08 |
| 45 | Share link | 2 | — |
| 46 | Copy link | 2 | — |
| 47 | Done | 1 | C-L10 |
| 48 | Five abstract phones arranged around a printed board-game table | 9 | C-L03 |
| 49 | Move Player 1 earlier / later | 4 each | —; repeated for Players 2 and 3 |
| 50 | Remove Player 1 | 3 | —; repeated for Players 2 and 3 |
| 51 | Choose a Tableclock setup file | 6 | — |
| 52 | Close | 1 | — |

### README: every sentence

| # | Exact sentence | Words | Flag |
| ---: | --- | ---: | --- |
| 1 | Tableclock is a free, installable turn timer for two to eight people around a board-game table. | 16 | C-R01, U01 |
| 2 | It handles count-up, shared-style time banks, Fischer increments, and fresh per-turn limits. | 12 | C-R02, U10 |
| 3 | It is intentionally not a scorekeeper or play log. | 9 | U03 |
| 4 | The app is designed for families and groups who need turns to keep moving without depending on an app-store timer that may disappear. | 23 | C-R03, U04 |
| 5 | It works on one shared phone, persists an unfinished game locally, and keeps working offline after the first load. | 19 | U11 |
| 6 | Cross-phone sync is not included in this release. | 8 | U06 |
| 7 | Requires Node.js 20 or newer. | 6 | U12 |
| 8 | Vite prints the local URL. | 5 | C-R04, U13 |
| 9 | To exercise install/offline behavior, make a production build and serve it: | 12 | C-R05 |
| 10 | The exact production build command is `npm run build`. | 9 | — |
| 11 | Its static output is `dist/`, with `dist/index.html` at the root. | 12 | U13 |
| 12 | The unit suite covers elapsed-time accounting, pause/resume, increments, reverse order, skipped/out players, time formatting, and malformed setup/preset rejection. | 21 | C-R06, U13 |
| 13 | The production-browser suite exercises the 1440px desktop keyboard timer flow, the 390px scrollable player strip with Axe, and an offline service-worker reload. | 22 | C-R07, U13 |
| 14 | Install Chromium once with `npx playwright install chromium` before running `npm run test:e2e`. | 14 | — |
| 15 | In setup, focus a player-name field and press Arrow Up or Arrow Down to move that player one place in the turn order. | 23 | C-R08, U14 |
| 16 | Focus stays on that player field after the move, while Tab continues through the normal controls. | 16 | U14 |
| 17 | The adjacent move buttons provide the same action for pointer and keyboard users. | 13 | U14 |
| 18 | Player names, preferences, and the current clock are stored in IndexedDB on the device. | 14 | C-R09, U15 |
| 19 | There are no accounts, analytics, third-party fonts, runtime CDNs, or payment code. | 12 | C-R10, U16 |
| 20 | Setup JSON export/import and URL-encoded presets keep users in control of their data. | 14 | C-R11, U17 |
| 21 | The dithered setup illustration was generated specifically for this project; its prompt and provenance are in `.factory/design.md` and `assets/src/`. | 22 | C-R12, U18 |
| 22 | All runtime assets ship from this repository. | 7 | U18 |
| 23 | Publish `dist/` to Azure Static Web Apps. | 7 | — |
| 24 | The generated build root includes `staticwebapp.config.json`: fingerprinted `/assets/*` use one-year immutable caching, while HTML and `sw.js` revalidate. | 20 | C-R13, U19 |
| 25 | Standalone `/privacy/` and `/terms/` documents are included as direct-load fallbacks. | 10 | U19 |
| 26 | HTTPS is required for service workers, install prompts, and wake lock. | 11 | C-R14, U20 |
| 27 | Licensed under the MIT License. | 5 | U20 |

README headings and counts: “Tableclock” (1), “Run locally” (2), “Test” (1), “Player order keyboard shortcut” (4), “Privacy and ownership” (3), and “Deploy” (1). They make sense in README context. The landing headings “Take turns. Not forever.” and “Bring this setup back” are flagged below because they do not.

### Copy findings and proposed rewrites

Each row is one flagged finding.

| ID | Problem | Concrete rewrite |
| --- | --- | --- |
| C-L01 | The `<h1>` is a pun and does not name the job. | “Time every player’s turn” |
| C-L02 | “clear” is an unmeasured marketing adjective. | “Two to eight players share one clock.” |
| C-L03 | The caption and five-phone alt text imply unsupported multi-device use. | Show one phone and use “Pass one shared phone around the table.” |
| C-L04 | Mode terms vary within the UI and differ again in README. | Use “Count up,” “Time bank,” “Bank with increment,” and “Per-turn limit” everywhere; explain each once. |
| C-L05 | “Share this setup” opens a dialog rather than naming its result. | “Create a setup link” |
| C-L06 | “Made to outlast app stores” is vague marketing and untestable. | “Install it from this site.” Keep the separate tested offline fact. |
| C-L07 | “private” is a broad adjective with no scope. | “Free. Player names stay in this browser.” Add the corresponding tests. |
| C-L08 | “AI-assisted print” is provenance jargon in the footer, not useful navigation. | “Original Tableclock artwork” |
| C-L09 | “Bring this setup back” is vague out of context. | “Reuse this setup” |
| C-L10 | `Done` is not a result-naming verb. | “Close” |
| C-R01 | README switches from “players” to “people.” | “…for two to eight players around a board-game table.” |
| C-R02 | “shared-style,” “Fischer,” and “fresh per-turn” are jargon and do not match UI labels. | “Choose Count up, Time bank, Bank with increment, or Per-turn limit.” |
| C-R03 | The sentence is 23 words and speculates that another app “may disappear.” | “Tableclock keeps turns moving for families and board-game groups. It does not depend on an app-store listing.” |
| C-R04 | “Vite” is unexplained in the first run instruction. | “The development server prints the local URL.” |
| C-R05 | “install/offline behavior” and “production build” are compressed technical terms. | “To test installation and use without a network, build the app and serve `dist/`.” |
| C-R06 | The test summary stacks internal terms such as elapsed-time accounting and setup/preset rejection. | “Unit tests cover all four timers, pausing, player order, formatting, and invalid imported setups.” |
| C-R07 | “production-browser,” “Axe,” and “service-worker” are unexplained. | “Browser tests cover desktop keyboard use, the 390 px player list, accessibility checks, and reloads without a network.” |
| C-R08 | The sentence is 23 words. | “In setup, focus a player’s name. Press Arrow Up or Arrow Down to move that player.” |
| C-R09 | “IndexedDB” is implementation jargon in the privacy summary. | “The browser stores player names, preferences, and the current clock on this device.” |
| C-R10 | “runtime CDNs” is unexplained. | “The app loads no fonts, scripts, or services from other sites.” |
| C-R11 | “JSON” and “URL-encoded” obscure the user result. | “Export a setup file, import it later, or copy a setup link.” |
| C-R12 | “dithered” and “provenance” are unnecessary here. | “The original setup illustration and its generation record are in `.factory/design.md` and `assets/src/`.” |
| C-R13 | “fingerprinted,” “immutable caching,” and “revalidate” need deployment context. | “Versioned assets cache for one year. HTML and `sw.js` check for updates on each visit.” |
| C-R14 | “wake lock” is unexplained. | “HTTPS is required to install the app, cache it for offline use, and keep the screen awake.” |

Terminology to standardize:

| Concept | Use everywhere | Current variants |
| --- | --- | --- |
| Participant | player | people, players |
| Product | turn timer | timer, clock, app |
| Saved configuration | setup | setup, preset |
| Mode 1 | Count up | count-up, Count up |
| Mode 2 | Time bank | shared-style time banks, Time bank |
| Mode 3 | Bank with increment | Fischer increments, Bank + increment |
| Mode 4 | Per-turn limit | fresh per-turn limits, Each turn |

## Unlisted claims

Because `.factory/claims.json` is missing, every claim-like sentence below is unlisted. Each row is a finding. Duplicated wording is grouped only when one claim entry could cover every listed location.

| ID | Exact claim-like copy and location | Required fix |
| --- | --- | --- |
| U01 | Landing: “A turn timer for the whole table”; “Two to eight players, one clear clock.” README sentence 1. | Add tests that start valid clocks with 2 and 8 players and reject 1 and 9; verify install manifest separately. |
| U02 | Landing: “No account, no scorekeeping, and no signal required.” | Split into account, feature-scope, and offline claims. Test the full demo flow with no authentication and after network blocking. |
| U03 | Landing: “One phone or a whole table.” README: “It is intentionally not a scorekeeper or play log.” | Replace the ambiguous phone sentence as in B5. Keep the limitation in a clearly labelled “Does not” section; test absence only if it remains a registered claim. |
| U04 | Landing: “Made to outlast app stores.” README sentence 4. | Remove the untestable speculation and use the concrete install/offline statements only. |
| U05 | Landing: “Install it once and the clock keeps working without a connection.” | Register `offline-reload`; enter through `/demo`, gain service-worker control, block the network, reload, and complete a turn. |
| U06 | Landing and README: “Cross-phone sync is not included in this release.” | Keep this visible above the fold and add a regression check that no sync control or remote clock request is presented until the feature ships. |
| U07 | Dialog: “Player names and clock rules are encoded in the link.” | Add a setup-link round-trip test that checks every name and rule after opening the copied URL. |
| U08 | Dialog: “No data is uploaded.” | Intercept the entire demo share flow and assert that no non-same-origin request occurs and no request carries setup data. |
| U09 | Footer: “Free, private, and made for the table.” | Replace “private” with scoped facts. Test no payment path and the precise local-storage/network promise. |
| U10 | README: “It handles count-up, shared-style time banks, Fischer increments, and fresh per-turn limits.” | Add one tagged observable timing test for each mode, or split this into four claims and four tagged tests. |
| U11 | README: “It works on one shared phone, persists an unfinished game locally, and keeps working offline after the first load.” | Split and test local resume after browser restart plus the demo offline flow. |
| U12 | README: “Requires Node.js 20 or newer.” | Enforce the declared engine in CI and add the tested environment to the claim record or support policy. |
| U13 | README sentences 8, 11, 12, and 13 describe development output and test coverage. | Add a documentation/CI check for the dev server and `dist/index.html`; make the named browser scenarios tagged tests. |
| U14 | Landing keyboard helper and README sentences 15–17 promise reorder, focus retention, Tab order, and equivalent buttons. | Add a tagged keyboard test asserting order, focused player, and subsequent Tab target, plus the button equivalent. |
| U15 | README: “Player names, preferences, and the current clock are stored in IndexedDB on the device.” | Test the database name/store and restored values in an isolated context. Do not run this test through the future demo namespace. |
| U16 | README: “There are no accounts, analytics, third-party fonts, runtime CDNs, or payment code.” | Intercept a complete real and demo flow; assert allowed origins; statically check emitted URLs and absence of auth/payment controls. |
| U17 | README: “Setup JSON export/import and URL-encoded presets keep users in control of their data.” | Split into tagged export, import, and preset round-trip tests that assert values, not button presence. |
| U18 | README sentences 21–22 claim original provenance and repository-local assets. | Add a provenance/file-integrity check or narrow the copy to verifiable file locations. |
| U19 | README sentences 24–25 claim cache policy and direct-load fallbacks. | Test built headers/config and direct requests to both legal routes in the deployed sandbox. |
| U20 | README: “HTTPS is required for service workers, install prompts, and wake lock.” / “Licensed under the MIT License.” | Link the platform statement to support documentation and keep the license statement backed by the repository `LICENSE`; register only product promises in claims.json if the claims policy explicitly excludes legal/build facts. |

## Demo, privacy, offline, and behavior evidence

- No sample-data path exists. Starting the ordinary default setup uses generic `Player 1`, `Player 2`, and `Player 3`; it is not a labelled demo and starts paused.
- The `/demo` storage isolation test failed as described in B2.
- A normal live flow made requests only to `https://tableclock.sociobot.in` (9 requests observed). No third-party request was observed.
- After service-worker control, the context was put offline, reloaded, and retained the running game at Player 1 with no navigation error. This verifies the existing normal flow, not the required demo claim test.
- All crawled links and shipped assets returned 200: `/`, `/privacy`, `/terms`, their trailing-slash forms, `/offline.html`, manifest, robots, sitemap, three PNG icons, SVG icon, and both illustration formats.

## Structure and accessibility matrix

| Check | Result | Evidence |
| --- | --- | --- |
| `<title>` pattern | Partial | Legal titles pass. Home suffix is a slogan, not “what it does.” Unknown routes reuse it. |
| One `<h1>` and `<main>` | Pass | Exactly one `<h1>` and a main landmark on checked routes. |
| `lang`, alt text, labels | Pass | `lang="en"`; no missing image alt or unlabeled button in the live verifier. |
| Description | Partial | Home has one; direct Privacy and Terms do not. |
| Canonical / OG / Twitter / apple-touch | Fail | All absent on checked routes. SVG favicon exists. |
| Designed 404 | **BLOCKING fail** | Unknown route returns the home page as 200. |
| Deep links | Partial | Legal deep links return 200, but direct and in-app shells differ. `/demo` is not implemented. |
| Back/focus | Fail | Route change and Back leave focus on `<body>`; forward legal navigation does not reset scroll. |
| Dead links | Pass | All crawled first-party links/assets returned 200. |
| Header/footer | Fail | Route shells differ; no Demo nav, factory attribution, or build id. |
| Visual identity | Pass | Rules-sheet/punchboard identity is distinct and matches the design thesis. |
| Reduced motion | Pass by inspection | The stylesheet reduces animation/transition duration and disables smooth scrolling. |
| Serious/critical Axe issues | Pass | Live `/`, `/privacy`, and `/terms` had zero Axe violations. |
| Touch targets | Fail | Several header/footer links are 16–28 px high. |
| Console/load smoke test | Pass | `verify-url.sh` found no console/page errors; title/lang/main/alt/button checks passed. |
| First-load JS | Pass | Build output is 27.82 kB raw / 9.68 kB gzip. |

## Commands and results

```text
npm ci
  PASS — 58 packages installed, 0 vulnerabilities

npm test
  PASS — 8 files, 28 tests

npm run build
  PASS — dist/ produced; JS 27.82 kB raw / 9.68 kB gzip

npm run test:e2e
  PASS — 3 tests, including desktop, 390 px + Axe, and offline reload

VERIFY_NODE_MODULES=/usr/lib/node_modules /opt/fleet/lib/verify-url.sh \
  https://tableclock.sociobot.in /tmp/tableclock-review-evidence
  PASS — HTTP 200, no console errors, title/lang/h1/main/alt/button smoke checks

live AxeBuilder checks on /, /privacy, /terms
  PASS — zero violations on each route

claims manifest commands
  NOT RUN — .factory/claims.json is missing; this is B3, not a pass
```

## Acceptance path

Resolve B1–B5 first. Then register and run every claim from a clean `/demo` sandbox, repair route metadata/focus/shell consistency, and repeat this review in fresh phone and desktop contexts. The verdict can be PASS only with zero BLOCKING findings and no more than three minor findings.
