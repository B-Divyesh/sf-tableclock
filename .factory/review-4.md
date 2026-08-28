# Adversarial first-read review 4 — Tableclock

Date: 2026-08-28
Work order: tableclock-review-4
Repository commit reviewed: 035cdc0038a93ff6f9e76832b655917501367714
Live site: https://tableclock.sociobot.in

## Verdict

**PASS.** No blocking, major, or minor findings remain. This round repeated the cold-read, copy, demo, sandbox, claims, history, route, accessibility, visual-identity, and missed-leverage checks.

## Cold first read

Each live check used a fresh Chromium context with no storage or service worker and no scroll before recording the answer.

| Viewport | What it does | For whom | First click | Result |
| --- | --- | --- | --- | --- |
| 390 × 844 | A turn timer that moves a board-game table to the next player. | Board-game groups of two to eight players sharing one phone. | Try it with sample data. | Clear; the 58 px action is visible at y=320 and says it loads a running four-player game. |
| 1440 × 900 | A turn timer for a board-game table. | The same two-to-eight-player shared-phone group. | Try it with sample data; Set up your own clock is the real path. | Clear. |

First-screen evidence: “Time every player’s turn”; “For board-game groups of two to eight players who want turns to keep moving.”; “Try it with sample data”; and “Loads a four-player game with a running clock.” The same screen plainly limits scope: “Runs on one shared phone. Cross-phone sync is not included.” No cold-read blocking finding.

## Copy audit

Counts treat contractions and hyphenated compounds as one word. The tables list every grammatical sentence on the default landing route and README. No sentence exceeds 22 words. No banned marketing term, unexplained product jargon, inconsistent terminology, contextless heading, or non-result-naming action was found.

### Landing page

| Copy | Words | Audit |
| --- | ---: | --- |
| A turn timer for the whole table | 7 | Clear context |
| Time every player’s turn | 4 | Verb-first h1 |
| For board-game groups of two to eight players who want turns to keep moving. | 14 | Clear audience |
| Loads a four-player game with a running clock. | 8 | demo-seed |
| Free. | 1 | free-use |
| Works offline after the first visit. | 6 | offline-reload |
| Player names stay in this browser. | 6 | local-storage |
| Runs on one shared phone. | 5 | one-shared-device |
| Cross-phone sync is not included. | 5 | no-cross-phone |
| Pass one shared phone around the table. | 7 | Clear instruction |
| Select a player name, then use Arrow Up or Arrow Down to move that player in the turn order. | 19 | keyboard-reorder |
| Tab moves to the next setup control. | 7 | keyboard-tab-order |
| Track time used | 3 | Count-up explanation |
| One budget each | 3 | Time-bank explanation |
| Budget with time back | 4 | Increment explanation |
| Fresh limit every turn | 4 | Per-turn explanation |
| Name the players. | 3 | Clear step |
| Put them in turn order. | 5 | Clear step |
| Choose a clock. | 3 | Clear step |
| Pick the timing rule your table uses. | 7 | Clear step |
| Tap the active field. | 4 | Clear step |
| The next player starts. | 4 | turn-flow |
| It does not track scores. | 5 | no-scorekeeping |
| It does not connect phones. | 5 | no-cross-phone |
| Everyone uses the same device at the table. | 8 | one-shared-device |
| Install it from this site. | 5 | pwa-install |
| The demo keeps working without a connection after your first visit. | 11 | offline-reload |

The headings Who’s playing?, How should time work?, Keep turns moving in three steps, and What this timer does not do retain meaning out of context. All visible actions name their outcome: Try it with sample data, Set up your own clock, Add player, Start the clock, Create a setup link, Import a setup, Reset demo, Start for real, Pause, Reverse, Open clock options, Export setup, and End game and return to setup.

### README

| Sentence | Words | Audit |
| --- | ---: | --- |
| Tableclock is a turn timer for two to eight players around a board-game table. | 14 | player-range |
| Everyone uses one shared phone. | 5 | one-shared-device |
| Try it with sample data. | 5 | Clear action |
| The isolated demo starts a running four-player game. | 8 | demo-seed |
| It cannot read or change real games. | 7 | demo-isolation |
| Choose Count up, Time bank, Bank with increment, or Per-turn limit. | 11 | Four mode claims |
| Tap the active field to start the next player’s turn. | 10 | turn-flow |
| Tableclock does not track scores. | 5 | no-scorekeeping |
| It does not connect phones. | 5 | no-cross-phone |
| Development requires Node.js 20 or newer. | 6 | Repository requirement; package engines |
| The development server prints a local URL. | 7 | Run instruction |
| The static output is dist/, with dist/index.html at its root. | 11 | Verified build result |
| Run each visitor-facing claim from a clean browser context with the commands in .factory/claims.json. | 14 | Verification instruction |
| The browser suite includes keyboard, mobile, route, accessibility, privacy, and offline checks. | 11 | Test-suite description |
| In setup, focus a player’s name. | 6 | Clear instruction |
| Press Arrow Up or Arrow Down to move that player. | 10 | keyboard-reorder |
| Focus stays on the moved field. | 6 | keyboard-reorder |
| The adjacent buttons perform the same moves. | 7 | keyboard-reorder |
| Player names, preferences, and unfinished clocks stay in this browser. | 9 | local-storage |
| The app sends no game data to another origin. | 9 | same-origin |
| Export a setup file, import it later, or create a setup link. | 11 | Export/import/link claims |
| Setup links keep names and rules in the URL fragment, which browsers do not send to the server. | 17 | setup-link-local |
| Publish dist/ to the static work-order target. | 7 | Deployment instruction |
| The included host configuration sets cache, route, 404, MIME, and security-header policies. | 11 | Static-hardening result |
| Licensed under the MIT License. | 5 | Repository legal fact |

Terminology is consistently player, turn timer, setup, Count up, Time bank, Bank with increment, and Per-turn limit. The development/legal instructions are repository facts rather than visitor-facing product claims; package.json, the successful build, static-hardening tests, and LICENSE verify them. Every visitor-facing reliance claim maps to claims.json. No unlisted-claim finding.

## Demo and sandbox behaviour

- One click changed the URL to /demo and immediately showed a running four-player game: Maya and Lionel had completed turns, Priya was active on Turn 3, Sora followed, and Bank with increment was visible.
- The persistent banner read exactly “Demo — sample data, nothing is saved” and included Reset demo and Start for real.
- In a fresh live context, ending Priya’s turn made Sora active. Reset demo restored Priya, Turn 3, and the seeded history. Start for real returned to / with an intentionally saved real name, Real Ada, unchanged.
- Source and browser inspection confirm separate IndexedDB databases: tableclock-demo and tableclock-local. The demo-exit claim clears the demo database.
- After service-worker control, offline reload of /demo showed the banner and Priya; ending a turn changed to Sora. The same-origin and no-analytics tests intercepted the complete flow and passed with no XHR, fetch, cross-origin request, or uploaded game data.

## Claims and quality gates

Fresh clone used: /tmp/tableclock-review4-clean.WopQgc/repo.

| Check | Result |
| --- | --- |
| npm ci | PASS; 0 vulnerabilities reported |
| npm test | PASS; 9 files, 32 tests |
| npm run build | PASS; produced dist/ |
| Full local browser suite | PASS; all claim cases completed |
| Every claims.json command separately | PASS; 31/31; Playwright final state passed with no failed tests |

The independently run claim IDs were demo-seed, demo-isolation, demo-reset, demo-exit, offline-reload, player-range, free-use, local-storage, same-origin, no-account, no-analytics, setup-link-roundtrip, setup-link-local, mode-count-up, mode-time-bank, mode-increment, mode-per-turn, keyboard-reorder, keyboard-tab-order, setup-export, setup-import, one-shared-device, no-scorekeeping, no-cross-phone, turn-flow, pause-resume, reverse-order, player-status, local-sound, turn-vibration, and pwa-install. The claim-contract test confirms exactly one matching claim tag per manifest entry.

## Structure, accessibility, and identity

- Live /, /demo, /?demo=1, /privacy, and /terms returned 200. Each has lang=en, one h1, main, route title, description, canonical, OG/Twitter metadata, favicon, and Apple touch icon. The own-art social PNG is 1200 × 630.
- /not-a-real-route returned HTTP 404 with the designed heading “This table has no page” and Return to Tableclock. The internal-link crawl found only valid public routes or same-page fragments. robots.txt, sitemap.xml, and static hosting configuration are present.
- Home-to-demo focused main h1, Game clock, and announced it. Route tests also check legal navigation/Back focus and scroll restoration. All routes retain header/footer, Privacy/Terms, product one-liner, Param Factory attribution, and build identifier.
- Axe on live 390 px /, /demo, /privacy, /terms, and 404 returned no serious or critical violations. Successful routes produced no application console/page error. Legal recovery links measure at least 44 px high.
- The warm paper, spot ink, halftone, printed-offset controls, slab display face, one-phone art, and clock-first running surface match design.md. This is a distinct tabletop rules-sheet identity, not a generic SaaS template. Reduced-motion is covered in browser tests.

## Earlier findings: live and source regression confirmation

Every earlier finding below was rechecked, not accepted from a status label.

| Earlier ID | Confirmation |
| --- | --- |
| B1 | Cold first screen is clear at both viewports. |
| B2 | Isolated demo, banner, reset, exit, and offline flow all work. |
| B3 | Manifest and all 31 individually run claim tests exist and pass. |
| B4 | Unknown route is a designed HTTP 404. |
| B5 | One-phone art/copy match the shipped scope. |
| S1 | Route metadata and icons are live. |
| S2 | Focus, live announcement, Back, and scroll restoration work. |
| S3 | Header, first screen, live setup, steps, scope, and footer are present. |
| S4 | Mobile interactive targets, including legal recovery, meet 44 px. |
| S5 | Product-specific tabletop identity is retained. |
| C-L01 | Job-first h1 retained. |
| C-L02 | Precise player-range copy retained. |
| C-L03 | One-phone illustration/caption retained. |
| C-L04 | Four mode names remain standardized. |
| C-L05 | Setup-link action names result. |
| C-L06 | Unsupported app-store durability claim remains removed. |
| C-L07 | Browser-local privacy wording is precise. |
| C-L08 | Footer uses scope/legal/attribution/build copy. |
| C-L09 | Dialog heading is Reuse this setup. |
| C-L10 | Dialog action is Close. |
| C-R01 | README says players consistently. |
| C-R02 | README mode names match UI. |
| C-R03 | Long speculative sentence remains removed. |
| C-R04 | Local-server instruction is plain. |
| C-R05 | Build/preview instructions are direct. |
| C-R06 | Test instructions are plain. |
| C-R07 | Browser suite description is plain. |
| C-R08 | Reorder guidance is short. |
| C-R09 | Storage wording avoids implementation jargon. |
| C-R10 | Privacy wording is scoped to tested behaviour. |
| C-R11 | Import/export/link copy names user outcomes. |
| C-R12 | Provenance remains in design record, not visitor copy. |
| C-R13 | Deploy/cache wording and hardening are verified. |
| C-R14 | Unsupported platform-detail wording remains removed. |
| U01 | Player range has its exact observable claim. |
| U02 | Account, score, and offline claims are split/tested. |
| U03 | One-phone/no-score scope is explicit/tested. |
| U04 | Untestable durability wording is gone. |
| U05 | Offline reload completes a demo turn. |
| U06 | No sync control/action is asserted. |
| U07 | Setup links restore names/rules. |
| U08 | Setup payload stays local to URL fragment. |
| U09 | Free/local-browser wording is scoped/tested. |
| U10 | Each timer mode has an observable test. |
| U11 | Restore/offline claims are independently tested. |
| U12 | Node 20 is declared in engines; documented support path passed clean-clone install/build. |
| U13 | Build output and browser scenarios are present/passing. |
| U14 | Reorder, focus, equivalent buttons, and Tab traversal are tested. |
| U15 | IndexedDB restoration is asserted. |
| U16 | Same-origin, account, analytics, and static hardening tests pass. |
| U17 | Export, import, and link round-trip each have a test. |
| U18 | README provenance promise is removed; design record remains. |
| U19 | Static hardening and direct route checks cover host/fallbacks. |
| U20 | Platform-detail copy is removed; LICENSE is present. |
| F-2-1 | Running demo has compact nav and ordinary footer/legal information. |
| F-2-2 | Home-to-demo focuses and announces Game clock. |
| F-2-3 | Control says Open clock options; wordmark is home link. |
| F-2-4 | Tab copy is narrowed, registered, and tested. |
| F-3-1 | Both legal return links are verified 44 px targets. |

Prior independent verification concerns remain closed: immutable assets are configured, no undeployed room-sync flow is exposed, Arrow-key reordering works, malformed imports are rejected, player-strip keyboard access exists, and current headers/MIME are configured.

## Missed leverage

No finding. Setup import/export and local setup links provide the useful portability path. Cross-phone sync is optional in the brief and plainly excluded before setup and while running, so it is not implied as available. AI would be decorative for a deterministic shared-device timer; source inspection found no AI runtime, provider key, or remote model call.

## What would make this perfect

Keep this verification contract green on every product change: rerun each claim command, cold 390 px/desktop checks, route/link crawl, and live offline/privacy checks whenever copy, storage, or routing changes. No product change is required for this release.

