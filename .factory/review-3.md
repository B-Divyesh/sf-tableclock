# Adversarial first-read review 3 — Tableclock

Date: 2026-08-28
Work order: `tableclock-review-3`
Candidate reviewed: `91f71e3f61c0e68e4e53a287bf1964e60e253dca`
Live site: https://tableclock.sociobot.in

## Verdict

**FAIL.** One minor finding remains. The product is clear, tryable, honest, and all registered claims passed, but the legal routes leave one touch target below the required 44 px minimum. This review uses the attached plain-words, demo-sandbox, claims, site-structure, AI-features, and accessibility checks.

## Findings

### F-3-1 — Minor: the legal-page return link is too small for touch

- Exact location and measurement: `/privacy` and `/terms`, link text **“Back to the clock”**. In a fresh 390 × 844 browser it measures **174 × 21 px**.
- Why this matters: it is the explicit recovery action on the legal pages, but its 21 px height is difficult to hit on a phone and does not meet the supplied 44 px target rule.
- Concrete fix: give `.legal-page .text-link` an inline-flex or block hit area with `min-height: 44px`, vertical alignment, and sufficient padding. Add a browser test that measures this link on both legal routes at 390 px.

## Cold first read

Both runs used a new browser context with no prior storage, no scroll, and no existing service-worker state.

| Viewport | What it does | For whom | What to click first |
| --- | --- | --- | --- |
| 390 × 844 | A turn timer that changes to the next player when the current player ends a turn. | Board-game groups of two to eight people sharing one phone. | **Try it with sample data** to see a running four-player timer. |
| 1440 × 900 | A turn timer for a board-game table. | Board-game groups of two to eight players using one shared phone. | **Try it with sample data** to load the running example; **Set up your own clock** is the real path. |

The first screen supplies the exact supporting text needed to reach those answers: “Time every player’s turn”; “For board-game groups of two to eight players who want turns to keep moving.”; “Try it with sample data”; and “Loads a four-player game with a running clock.” No cold-read blocking finding.

## Copy audit

Counts treat contractions and hyphenated compounds as one word. I read the current landing route and `README.md`, including headings and actions needed to understand the page. No sentence exceeds 22 words; no banned marketing word, unexplained jargon, inconsistent timer term, contextless heading, or non-result-naming action was found. “Bank with increment” is paired with the plain explanation “Budget with time back,” so it is not left as unexplained clock jargon.

### Landing page inventory

| Copy | Words | Result |
| --- | ---: | --- |
| A turn timer for the whole table | 7 | pass |
| Time every player’s turn | 4 | pass |
| For board-game groups of two to eight players who want turns to keep moving. | 14 | pass |
| Try it with sample data | 5 | pass |
| Set up your own clock | 5 | pass |
| Loads a four-player game with a running clock. | 8 | pass |
| Free. | 1 | pass |
| Works offline after the first visit. | 6 | pass |
| Player names stay in this browser. | 6 | pass |
| Runs on one shared phone. | 5 | pass |
| Cross-phone sync is not included. | 5 | pass |
| Pass one shared phone around the table. | 7 | pass |
| Who’s playing? | 2 | pass |
| Select a player name, then use Arrow Up or Arrow Down to move that player in the turn order. | 19 | pass |
| Tab moves to the next setup control. | 7 | pass |
| How should time work? | 4 | pass |
| Clock mode | 2 | pass |
| Count up — Track time used | 6 | pass |
| Time bank — One budget each | 6 | pass |
| Bank with increment — Budget with time back | 8 | pass |
| Per-turn limit — Fresh limit every turn | 7 | pass |
| Gentle nudge after | 3 | pass |
| Start the clock | 3 | pass |
| Create a setup link | 4 | pass |
| Keep turns moving in three steps | 6 | pass |
| Name the players. | 3 | pass |
| Put them in turn order. | 5 | pass |
| Choose a clock. | 3 | pass |
| Pick the timing rule your table uses. | 7 | pass |
| Tap the active field. | 4 | pass |
| The next player starts. | 4 | pass |
| What this timer does not do | 6 | pass |
| It does not track scores. | 5 | pass |
| It does not connect phones. | 5 | pass |
| Everyone uses the same device at the table. | 8 | pass |
| Install it from this site. | 5 | pass |
| The demo keeps working without a connection after your first visit. | 11 | pass |
| Import a setup | 3 | pass |
| One shared-device turn timer for board-game tables. | 7 | pass |

The repeated player labels (“Player 1 name”), movement labels, unit labels, navigation labels, and footer/legal labels are fragments rather than sentences. They use the same terms: **player**, **turn timer**, **setup**, **Count up**, **Time bank**, **Bank with increment**, and **Per-turn limit**.

### README inventory

| Sentence | Words | Result |
| --- | ---: | --- |
| Tableclock is a turn timer for two to eight players around a board-game table. | 14 | pass |
| Everyone uses one shared phone. | 5 | pass |
| Try it with sample data. | 5 | pass |
| The isolated demo starts a running four-player game. | 8 | pass |
| It cannot read or change real games. | 7 | pass |
| Choose Count up, Time bank, Bank with increment, or Per-turn limit. | 11 | pass |
| Tap the active field to start the next player’s turn. | 10 | pass |
| Tableclock does not track scores. | 5 | pass |
| It does not connect phones. | 5 | pass |
| Development requires Node.js 20 or newer. | 6 | pass |
| The development server prints a local URL. | 7 | pass |
| The static output is `dist/`, with `dist/index.html` at its root. | 11 | pass |
| Run each visitor-facing claim from a clean browser context with the commands in `.factory/claims.json`. | 14 | pass |
| The browser suite includes keyboard, mobile, route, accessibility, privacy, and offline checks. | 11 | pass |
| In setup, focus a player’s name. | 6 | pass |
| Press Arrow Up or Arrow Down to move that player. | 10 | pass |
| Focus stays on the moved field. | 6 | pass |
| The adjacent buttons perform the same moves. | 7 | pass |
| Player names, preferences, and unfinished clocks stay in this browser. | 9 | pass |
| The app sends no game data to another origin. | 9 | pass |
| Export a setup file, import it later, or create a setup link. | 11 | pass |
| Setup links keep names and rules in the URL fragment, which browsers do not send to the server. | 17 | pass |
| Publish `dist/` to the static work-order target. | 7 | pass |
| The included host configuration sets cache, route, 404, MIME, and security-header policies. | 11 | pass |
| Licensed under the MIT License. | 5 | pass |

## Demo and sandbox behaviour

The first-screen action is one click. It changed the URL to `/demo` and immediately displayed a running Bank-with-increment sample: Maya and Lionel had completed turns, Priya was active on turn three, and Sora followed. The persistent banner read **“Demo — sample data, nothing is saved”** and exposed **Reset demo** and **Start for real**.

`Reset demo` restored Priya/turn three. The isolation claim test saved a real player in `tableclock-local`, advanced the demo in `tableclock-demo`, exited, and confirmed the real player was unchanged and the demo namespace was cleared. `src/storage.ts` switches those namespaces explicitly. The offline and no-network claim tests also passed using browser offline mode and request interception.

## Claims and quality gates

I made a fresh clone at `/tmp/tableclock-review-AY6cRZ`, ran `npm ci`, `npm test` (9 files / 32 tests), and `npm run build` (created `dist/`). I then executed every command in `.factory/claims.json` separately. **All 31/31 passed.**

| Claim IDs with passing registered tests | Result |
| --- | --- |
| `demo-seed`, `demo-isolation`, `demo-reset`, `demo-exit`, `offline-reload` | PASS |
| `player-range`, `free-use`, `local-storage`, `same-origin`, `no-account`, `no-analytics` | PASS |
| `setup-link-roundtrip`, `setup-link-local`, `mode-count-up`, `mode-time-bank`, `mode-increment`, `mode-per-turn` | PASS |
| `keyboard-reorder`, `keyboard-tab-order`, `setup-export`, `setup-import` | PASS |
| `one-shared-device`, `no-scorekeeping`, `no-cross-phone`, `turn-flow`, `pause-resume`, `reverse-order` | PASS |
| `player-status`, `local-sound`, `turn-vibration`, `pwa-install` | PASS |

Each manifest entry has exactly one tagged test, enforced by the unit claim-contract test. The live landing and README claims map to entries in that manifest; no unlisted claim was found. In particular, offline, local storage, no server upload, no account/analytics, import/export, setup links, the four timing modes, and the one-device/no-score/no-sync scope all have named tests.

## Structure, accessibility, and visual checks

- `/`, `/demo`, `/privacy`, and `/terms` returned 200 and each has the expected route title, one h1, description, canonical URL, Open Graph/Twitter metadata, favicon, apple-touch icon, header, main, and footer. `/not-a-real-route` returned a designed 404 with HTTP 404 and “Return to Tableclock.” The social image is a real 1200 × 630 PNG.
- Internal-link crawl found only `/`, `/demo`, `/privacy`, and `/terms`; all returned 200. Fragment links stay on their page. `robots.txt`, `sitemap.xml`, and the static-host configuration are present. Hashed assets are configured for immutable one-year caching; HTML and `sw.js` revalidate.
- A home → Privacy → Back run focused the new h1 on each route and restored the home route with its h1 focused. The polite route announcer is present. The demo/real transition has the same focus intent in code.
- Axe found zero serious or critical issues on home, demo, privacy, terms, and 404 at 390 px. No application console or page errors occurred on the successful routes. The 404 navigation naturally logs its own HTTP 404 resource status, which is not an application exception.
- The rules-sheet identity is distinct and matches `.factory/design.md`: warm paper, ink/spot colour, printed offset controls, slab display type, halftone ground, and a one-phone tabletop illustration. It is not a generic SaaS template. Reduced-motion rules are present in the source.
- No missed leverage finding: export/import and local setup links cover the useful portability expectation. The brief makes cross-phone sync optional, while the product clearly says it is absent. An AI feature would not improve a straightforward shared-device timer and would conflict with its offline/local-first job.

## Earlier-review regression check

Every earlier finding was rechecked on the live site and in the current source, not accepted merely from its status note.

| Earlier ID | Current confirmation |
| --- | --- |
| B1 | Both cold viewports show the job-first h1, audience sentence, sample action, real action, result note, and three facts before the setup. |
| B2 | `/demo` and `?demo=1` seed the running four-player sample; banner, reset, exit, storage isolation, and offline reload passed. |
| B3 | `claims.json` exists; the exact tag contract and all 31 listed commands passed from a fresh clone. |
| B4 | An arbitrary route returns the designed 404 with HTTP 404. |
| B5 / S5 | One-phone art and repeated no-sync scope no longer imply cross-phone play. |
| S1 | Route-specific title/description/canonical/OG/Twitter/favicon/apple metadata verified live. |
| S2 | Live forward/back navigation focused the h1, announced the route, and restored the expected route state. |
| S3 | Header, first-screen facts/actions, live setup, three steps, limitations, and full footer are present. |
| S4 | Header/footer controls meet 44 px; F-3-1 identifies the separate legal-body link missed by the earlier target sweep. |
| F-2-1 | Running demo has a compact game header plus the standard footer and legal links. |
| F-2-2 | Home-to-demo and legal navigation focus the destination h1; `focusIntentKey` covers full navigations. |
| F-2-3 | The control says “Open clock options,” which names the result. |
| F-2-4 | The setup sentence is narrowed to “Tab moves to the next setup control,” registered and tested as `keyboard-tab-order`. |

## What would make this perfect

Make the legal-page return link a 44 px touch target and add its mobile measurement test. Then repeat the full touch-target sweep and this review; that would remove the only remaining finding.
