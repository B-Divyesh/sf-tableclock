# Tableclock polish round 1 — finding closure

Date: 2026-08-28  
Reviewed report: `.factory/review-1.md` from `cc837f8ee52e44a554af3fcab38a1f028f01e65e`  
Released candidate: `6e77c7a3f26d92105df53e69519bb56169b22205`  
Repair commits: `9246604`, `f434ff8`, `1c908a7`  
Live URL: https://tableclock.sociobot.in

## Evidence key

- `H-desk`: `.factory/evidence/polish-1/live-home/screenshot-desktop.png`
- `H-mobile`: `.factory/evidence/polish-1/live-home/screenshot-mobile.png`
- `D-desk`: `.factory/evidence/polish-1/live-demo/screenshot-desktop.png`
- `D-mobile`: `.factory/evidence/polish-1/live-demo/screenshot-mobile.png`
- `404`: `.factory/evidence/polish-1/live-404.png`
- `routes`: Playwright test `route titles, metadata, focus, scroll restoration, legal links, and the styled 404 work`
- `mobile`: Playwright test `390px first screen and running state fit, expose touch targets, and pass Axe`
- `keyboard`: Playwright test `keyboard controls, dialog focus, reduced motion, and console stay clean`
- `static`: Vitest suite `static host hardening`
- `claims`: the named `@claim:*` Playwright test from `.factory/claims.json`

Every live check below was repeated in a new Playwright context against `https://tableclock.sociobot.in`. The final live suite passed 34/34. Direct requests returned 200 for `/`, `/demo`, `/?demo=1`, `/privacy`, `/privacy/`, `/terms`, and `/terms/`; `/not-a-real-route` returned 404.

## Blocking and severity findings

| ID | Change made | Evidence |
| --- | --- | --- |
| B1 | Replaced the pun with “Time every player’s turn,” named board-game groups, placed both first actions and their result above the fold, and added three scoped facts. | `@claim:demo-seed`; `mobile`; H-desk and H-mobile; live `/` 200 with the action visible at 390 × 844. |
| B2 | Added `/demo` and `?demo=1`, seeded a running Maya/Lionel/Priya/Sora game with two completed turns, isolated it in `tableclock-demo`, and added persistent Reset demo and Start for real controls. Exit clears demo storage. | `@claim:demo-seed`, `@claim:demo-isolation`, `@claim:demo-reset`, `@claim:demo-exit`, `@claim:offline-reload`; D-desk and D-mobile; live `/demo` and `/?demo=1` 200. |
| B3 | Added `.factory/claims.json`, a manifest-integrity test, and exactly one observable browser test for each of 30 claims. | Vitest `claim contract`; all 30 manifest commands passed separately from a clean clone; final live claim suite 30/30. |
| B4 | Replaced the catch-all rewrite with explicit application routes and a Tableclock 404 response override. Added styled static and in-app 404 states. | `routes`; `static`; 404 screenshot; live `/not-a-real-route` returned HTTP 404 with “This table has no page.” |
| B5 | Replaced the five-phone implication with the one-phone CSS print and put the shared-device/no-sync scope above the fold. | `@claim:one-shared-device`, `@claim:no-cross-phone`; H-desk and H-mobile; live `/` and `/demo` verified. |
| S1 | Added descriptive route titles, descriptions, canonical URLs, OG/Twitter fields, a 1200 × 630 social image, favicon, and 180 × 180 Apple icon. Demo query and path entries canonicalize to `/demo`. | `routes`; `static`; H-desk, D-desk, and 404; live metadata and asset requests returned 200. |
| S2 | Unified home, demo, privacy, and terms under one renderer. Push/pop navigation resets or restores scroll, focuses the new h1 without scrolling it away, and announces the route. | `routes`; H-desk; live `/privacy`, `/privacy/`, `/terms`, and `/terms/` all 200 with route-specific titles. |
| S3 | Added the required header/navigation, first-screen actions/facts, live product, three-step section, limitation/privacy copy, and footer attribution/build id. | `mobile`; H-desk and H-mobile; cold live `/` visual check. |
| S4 | Increased header, footer, banner, and legal link hit areas to at least 44 px. | `mobile` measures every visible header/footer link and enabled button; H-mobile and D-mobile; live 390 px pass. |
| S5 | Preserved the paper, spot-ink, halftone, slab-serif system while replacing only the misleading multi-phone subject. | `@claim:one-shared-device`; H-desk and 404; cold live visual review. |

## Landing copy findings

| ID | Change made | Evidence |
| --- | --- | --- |
| C-L01 | Headline is “Time every player’s turn.” | `routes`; H-desk/H-mobile; live `/`. |
| C-L02 | Replaced “one clear clock” with the precise two-to-eight-player sentence and scoped facts. | `@claim:player-range`; H-mobile; live `/`. |
| C-L03 | Replaced five-phone art/copy with one shared phone and “Pass one shared phone around the table.” | `@claim:one-shared-device`; H-desk; live `/`. |
| C-L04 | Standardized modes to Count up, Time bank, Bank with increment, and Per-turn limit. | `@claim:mode-count-up`, `@claim:mode-time-bank`, `@claim:mode-increment`, `@claim:mode-per-turn`; H-mobile; live `/`. |
| C-L05 | Renamed “Share this setup” to “Create a setup link.” | `@claim:setup-link-roundtrip`; H-mobile; live `/`. |
| C-L06 | Removed the app-store longevity claim; the page now says “Install it from this site.” | `@claim:pwa-install`; H-desk; live `/`. |
| C-L07 | Replaced broad “private” wording with “Player names stay in this browser.” | `@claim:local-storage`, `@claim:same-origin`; H-mobile; live `/privacy`. |
| C-L08 | Removed footer provenance jargon; the footer now provides product scope, legal links, factory attribution, and build id. | `routes`; H-desk; live `/`. |
| C-L09 | Renamed the dialog heading to “Reuse this setup.” | `@claim:setup-link-roundtrip`; H-mobile plus browser dialog flow; live `/`. |
| C-L10 | Replaced “Done” with “Close.” | `keyboard`; browser dialog flow; live `/demo`. |

## README copy findings

| ID | Change made | Evidence |
| --- | --- | --- |
| C-R01 | Uses “players” consistently. | `.factory/copy-audit.md`; `@claim:player-range`; live `/`. |
| C-R02 | Uses the same four plain mode names as the interface. | Copy audit and four `@claim:mode-*` tests; live `/`. |
| C-R03 | Removed the 23-word speculative app-store sentence. | Copy audit: no sentence exceeds 22 words; live install copy at `/`. |
| C-R04 | Says “The development server prints a local URL.” | Clean-clone run support text review; README. |
| C-R05 | Replaced compressed install/offline instructions with direct build and preview commands. | Clean-clone `npm run build`; README. |
| C-R06 | Replaced the jargon-heavy unit-test inventory with direct test commands and claim contract. | Clean-clone `npm test` 32/32; README. |
| C-R07 | Replaced browser-test jargon with a plain list of covered behaviors. | Clean-clone and live Playwright 34/34; README. |
| C-R08 | Split keyboard reorder guidance into short sentences. | `@claim:keyboard-reorder`; copy audit; live `/`. |
| C-R09 | Replaced implementation jargon with “stay in this browser.” | `@claim:local-storage`; live `/privacy`. |
| C-R10 | Replaced CDN jargon with the precise no-server-data statement. | `@claim:same-origin`, `@claim:no-analytics`, `static`; live `/privacy`. |
| C-R11 | Describes export, import, and setup links by user result. | `@claim:setup-export`, `@claim:setup-import`, `@claim:setup-link-roundtrip`; live `/demo`. |
| C-R12 | Removed the unnecessary art-generation sentence from README; provenance remains in the design record. | Static repository review; H-desk; live `/`. |
| C-R13 | Replaced cache jargon with a short deployment-policy sentence. | `static`; live root revalidates and hashed CSS is one-year immutable. |
| C-R14 | Removed the unexplained HTTPS/wake-lock sentence. | Copy audit; `keyboard` covers the remaining recovery message; live `/demo`. |

## Previously unlisted claims

| ID | Change made | Evidence |
| --- | --- | --- |
| U01 | Registered two-to-eight support and now starts valid clocks at both bounds while UI controls reject one and nine. | `@claim:player-range`; H-mobile; live `/`. |
| U02 | Split free, account-free, score-free, and offline statements into scoped claims. | `@claim:free-use`, `@claim:no-account`, `@claim:no-scorekeeping`, `@claim:offline-reload`; live `/demo`. |
| U03 | Replaced ambiguous device copy and retained the score limitation in a labelled scope section. | `@claim:one-shared-device`, `@claim:no-scorekeeping`; H-desk; live `/`. |
| U04 | Removed the untestable app-store longevity claim. | Copy audit; H-desk; live `/`. |
| U05 | Registered offline reload and proves a turn can end after a network-blocked reload. | `@claim:offline-reload`; D-mobile; live `/demo` offline test passed. |
| U06 | Registered the no-cross-phone scope and checks setup and running states for absent room/sync actions. | `@claim:no-cross-phone`; H-mobile/D-mobile; live `/` and `/demo`. |
| U07 | Setup links now use URL fragments and restore all four names, mode, duration, increment, and nudge. | `@claim:setup-link-roundtrip`; live `/demo`. |
| U08 | Registered the no-upload promise; request capture proves the fragment/payload never appears in a URL or body. | `@claim:setup-link-local`, `@claim:same-origin`; live `/demo`. |
| U09 | Removed broad footer privacy copy and registered precise free/local/network claims. | `@claim:free-use`, `@claim:local-storage`, `@claim:same-origin`; H-desk; live `/`. |
| U10 | Registered and behavior-tested every timing mode. | Four `@claim:mode-*` tests; live `/demo`. |
| U11 | Split shared-device, local resume, and offline behavior into separate tests. | `@claim:one-shared-device`, `@claim:local-storage`, `@claim:offline-reload`; live `/demo`. |
| U12 | Declared Node `>=20` in package engines and verifies that support policy statically. | `static`; clean-clone `npm ci` and `npm test`. |
| U13 | Build output and named test coverage are executable gates rather than unsupported prose. | Clean-clone `npm run build` created `dist/index.html`; unit 32/32 and browser 34/34. |
| U14 | Registered keyboard reorder, focus retention, next Tab target, and equivalent pointer button. | `@claim:keyboard-reorder`; `keyboard`; live `/`. |
| U15 | Registered real-namespace persistence and inspects `tableclock-local` for names, settings, and unfinished running state after reopening. | `@claim:local-storage`; live `/`. |
| U16 | Registered account, analytics, origin, and free-use claims; captures complete demo and real flows and statically rejects external runtime URLs. | `@claim:no-account`, `@claim:no-analytics`, `@claim:same-origin`, `@claim:free-use`, `static`; live suite. |
| U17 | Split export, import, and setup-link behavior into observable value assertions. | `@claim:setup-export`, `@claim:setup-import`, `@claim:setup-link-roundtrip`; live `/demo`. |
| U18 | Removed the README provenance claim; the design record retains source provenance without marketing it. | Static repository review; H-desk; live `/`. |
| U19 | Tests cache policy, exact real-route rewrites, a 404 response override, manifest MIME, and direct legal loads. | `static`; `routes`; live header/status checks. |
| U20 | Removed the platform-support claim and backs the remaining MIT statement with the repository license. | `static`; live `/terms`; `LICENSE`. |

## Historical regression checks

The earlier verification documents were also re-read. Their resolved issues remain covered: out-label contrast and the focusable mobile player strip by `mobile`; keyboard-safe vibration by `keyboard` and `@claim:turn-vibration`; malformed import rejection by unit validation and `setup errors explain what happened…`; CSP/cache/MIME headers by `static` and live headers; performance by the live Lighthouse result below.

## Final verification

- Clean clone `/tmp/tableclock-polish-clean.JkZGNN`: `npm ci` passed with zero vulnerabilities; `npm test` passed 32/32; `npm run build` passed; `npm run test:e2e -- --workers=1` passed 34/34; all 30 `.factory/claims.json` commands passed separately.
- Current tree after host-route normalization: `npm test` 32/32, build passed, local browser suite 34/34.
- Production: live browser suite 34/34; all 30 claim-tagged tests passed in fresh contexts.
- `/opt/fleet/lib/verify-url.sh` passed live `/` and `/demo` with no console errors, `lang=en`, one h1, a main landmark, no missing alt, and no unlabeled buttons.
- Axe CLI 4.13.0 found 0 violations on live `/`, `/demo`, `/privacy`, and `/terms`.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 936 ms, CLS 0, total transfer 20,638 bytes.
- Built payload: JavaScript 32.76 KB raw / 11.03 KB gzip; CSS 19.27 KB raw / 5.06 KB gzip.
- SHA-256 matched between `dist/` and live for `index.html`, hashed JS, hashed CSS, `sw.js`, `manifest.webmanifest`, and `404.html`.
- Deployment `45c7ba38-1d62-48ea-ac6e-bde09b291f78` completed successfully. No review finding remains open.
