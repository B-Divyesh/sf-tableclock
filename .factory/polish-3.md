# Tableclock polish round 3 — cumulative finding closure

Date: 2026-08-28  
Reviewed candidate: `91f71e3f61c0e68e4e53a287bf1964e60e253dca` and all earlier review/polish records  
Repair scope: `F-3-1` plus a fresh regression check of every earlier finding  
Live URL: https://tableclock.sociobot.in

## Evidence key

- `claims`: every command in `.factory/claims.json`, run separately from a fresh clone.
- `full`: `npm test`, `npm run build`, and `npm run test:e2e -- --workers=1`.
- `routes`: Playwright `route titles, metadata, focus, scroll restoration, legal links, and the styled 404 work`.
- `shell`: Playwright `the one-click demo keeps the site shell and hands focus to the game heading`.
- `mobile`: Playwright `390px first screen and running state fit, expose touch targets, and pass Axe`.
- `legal-target`: Playwright `390px legal routes keep the return link as a 44px touch target`.
- `local-check`: `/opt/fleet/lib/verify-url.sh` against production preview for `/` and `/demo`.
- `live`: `PLAYWRIGHT_BASE_URL=https://tableclock.sociobot.in npm run test:e2e -- --workers=1` (38/38).
- `live-axe`: cold 390 px Axe checks for `/`, `/demo`, `/privacy`, `/terms`, and `/not-a-real-route`; zero serious/critical issues.
- Screenshots: `.factory/evidence/polish-3/local-home-mobile.png`, `local-demo-mobile.png`, `local-privacy-mobile.png`, and `local-terms-mobile.png`.

Every map row was rechecked by the cold live suite after deployment. The live
screenshots are `.factory/evidence/polish-3/live-home-mobile.png`,
`live-demo-mobile.png`, `live-privacy-mobile.png`, `live-terms-mobile.png`,
and `live-404-mobile.png`; the successful URLs are respectively `/`, `/demo`,
`/privacy`, `/terms`, and `/not-a-real-route` (404 by design).

## Finding map

| Finding id | Change made | Evidence |
| --- | --- | --- |
| B1 | Kept the job-first headline, audience, sample action, real setup action, result note, and three facts above the fold. | `@claim:demo-seed`; `mobile`; local home screenshot; live cold `/`. |
| B2 | Kept `/demo` and `?demo=1` isolated in `tableclock-demo`, seeded with the running four-player sample, banner, reset, exit, and offline path. | `@claim:demo-seed`, `demo-isolation`, `demo-reset`, `demo-exit`, `offline-reload`; local demo screenshot; live cold `/demo`. |
| B3 | Kept `.factory/claims.json` and the exact one-tag-per-claim contract. | Vitest `claim contract`; `claims`. |
| B4 | Kept explicit application routes and the Tableclock 404 response override. | `routes`; static host hardening test; live cold unknown route. |
| B5 | Kept the one-phone print illustration and visible no-sync scope. | `@claim:one-shared-device`; `@claim:no-cross-phone`; local home screenshot. |
| S1 | Kept route-specific titles, descriptions, canonical, OG/Twitter metadata, social art, favicon, and Apple icon. | `routes`; static host hardening test; live route metadata check. |
| S2 | Kept unified rendering, focused/announced headings, and scroll restoration. | `routes`; `shell`; live home→legal→back check. |
| S3 | Kept the shared header/footer, landing structure, steps, scope section, attribution, and build id in setup and game states. | `shell`; `mobile`; local home/demo screenshots. |
| S4 | Kept 44 px navigation/footer/control targets and added the missed legal-body measurement. | `mobile`; `legal-target`; local legal screenshots. |
| S5 | Kept the rules-sheet paper, ink, halftone, slab type, and one-device art direction. | Visual check; local screenshots; `.factory/design.md`. |
| C-L01 | Kept “Time every player’s turn.” | `routes`; local home screenshot. |
| C-L02 | Kept precise two-to-eight player wording. | `@claim:player-range`; `copy-audit.md`. |
| C-L03 | Kept the shared-phone caption and one-phone illustration. | `@claim:one-shared-device`; local home screenshot. |
| C-L04 | Kept the four consistent mode names and explanations. | Four `@claim:mode-*` tests; `copy-audit.md`. |
| C-L05 | Kept “Create a setup link.” | `@claim:setup-link-roundtrip`. |
| C-L06 | Kept scoped install/offline wording without a longevity promise. | `@claim:pwa-install`; `@claim:offline-reload`. |
| C-L07 | Kept precise browser-local data wording. | `@claim:local-storage`; `@claim:same-origin`. |
| C-L08 | Kept the functional footer rather than provenance jargon. | `shell`; local screenshots. |
| C-L09 | Kept the dialog heading “Reuse this setup.” | `@claim:setup-link-roundtrip`. |
| C-L10 | Kept the result-naming “Close” action. | `keyboard controls, dialog focus, reduced motion, and console stay clean`. |
| C-R01 | Kept “players” throughout the README. | `copy-audit.md`; `@claim:player-range`. |
| C-R02 | Kept README mode names aligned with the interface. | `copy-audit.md`; four `@claim:mode-*` tests. |
| C-R03 | Kept the short, non-speculative README introduction. | `copy-audit.md`. |
| C-R04 | Kept the plain local-server instruction. | `copy-audit.md`; fresh-clone README review. |
| C-R05 | Kept direct build and preview instructions. | Fresh-clone `npm run build`. |
| C-R06 | Kept plain test instructions instead of implementation jargon. | Fresh-clone `npm test`; `claims`. |
| C-R07 | Kept a plain browser-suite description. | Fresh-clone `npm run test:e2e -- --workers=1`. |
| C-R08 | Kept short Arrow-key reorder instructions. | `@claim:keyboard-reorder`. |
| C-R09 | Kept browser-local privacy wording. | `@claim:local-storage`. |
| C-R10 | Kept the precise same-origin/no-analytics privacy wording. | `@claim:same-origin`; `@claim:no-analytics`. |
| C-R11 | Kept user-result import, export, and setup-link wording. | `@claim:setup-export`; `@claim:setup-import`; `@claim:setup-link-roundtrip`. |
| C-R12 | Kept provenance in the design record, not visitor copy. | `copy-audit.md`; repository check. |
| C-R13 | Kept concise deploy/cache wording. | Static host hardening test; live response-header check. |
| C-R14 | Kept unsupported platform-detail copy removed. | `copy-audit.md`; keyboard browser test. |
| U01 | Kept the tested two-to-eight range claim. | `@claim:player-range`. |
| U02 | Kept free, account-free, score-free, and offline claims split and tested. | `@claim:free-use`; `no-account`; `no-scorekeeping`; `offline-reload`. |
| U03 | Kept one-device and no-score scope clear. | `@claim:one-shared-device`; `@claim:no-scorekeeping`. |
| U04 | Kept app-store longevity copy removed. | `copy-audit.md`. |
| U05 | Kept offline behaviour as a separately exercised promise. | `@claim:offline-reload`. |
| U06 | Kept no-cross-phone scope visible and tested. | `@claim:no-cross-phone`. |
| U07 | Kept fragment setup links and round-trip rule restoration. | `@claim:setup-link-roundtrip`. |
| U08 | Kept the non-upload promise scoped to fragment/same-origin behavior. | `@claim:setup-link-local`; `@claim:same-origin`. |
| U09 | Kept broad privacy footer copy removed. | `@claim:free-use`; `local-storage`; `same-origin`. |
| U10 | Kept every timer mode independently observable. | Four `@claim:mode-*` tests. |
| U11 | Kept local resume and offline flow separate. | `@claim:one-shared-device`; `local-storage`; `offline-reload`. |
| U12 | Kept Node support explicit. | Static host hardening test; fresh-clone `npm ci`. |
| U13 | Kept build/test statements as executable gates. | Fresh-clone `npm run build`; `full`. |
| U14 | Kept reorder, focus, pointer equivalent, and Tab claim coverage. | `@claim:keyboard-reorder`; `@claim:keyboard-tab-order`. |
| U15 | Kept real-namespace persistence covered. | `@claim:local-storage`. |
| U16 | Kept account, analytics, origin, and payment scope covered. | `@claim:no-account`; `no-analytics`; `same-origin`; static host hardening test. |
| U17 | Kept export, import, and link outcomes independently covered. | `@claim:setup-export`; `setup-import`; `setup-link-roundtrip`. |
| U18 | Kept provenance claims out of product copy. | `copy-audit.md`; repository check. |
| U19 | Kept cache, direct routes, 404, and manifest policy covered. | Static host hardening test; `routes`; live headers. |
| U20 | Kept the MIT statement backed by `LICENSE` and removed unsupported platform claims. | Static host hardening test; `LICENSE`. |
| F-2-1 | Kept compact running-game header/nav and ordinary footer. | `shell`; `mobile`; local demo screenshot. |
| F-2-2 | Kept full-navigation focus intent and polite heading announcement. | `shell`; `@claim:demo-seed`. |
| F-2-3 | Kept “Open clock options” and a real wordmark home link. | `shell`; `@claim:setup-export`; `@claim:player-status`. |
| F-2-4 | Kept the narrowed Tab statement and exact claim test. | `@claim:keyboard-tab-order`; `copy-audit.md`. |
| F-3-1 | Made `.legal-page .text-link` an inline-flex target with 44 px minimum height and horizontal hit padding; added a route-by-route 390 px browser measurement. | `legal-target`; local privacy/terms screenshots; live cold `/privacy` and `/terms` measurement. |

## Earlier verification regressions

| Earlier finding | Retained resolution | Evidence |
| --- | --- | --- |
| verification-1 cache | Fingerprinted assets remain immutable; documents and service worker revalidate. | Static host hardening test; live headers. |
| verification-1 unavailable sync | Cross-phone rooms remain absent and plainly excluded. | `@claim:no-cross-phone`; local home/demo screenshots. |
| verification-1 Arrow reorder | Focused player names reorder with Arrow keys and equivalent buttons. | `@claim:keyboard-reorder`. |
| verification-2 P1 contrast | Out marker color stays above AA contrast. | Vitest `running clock accessibility state`; mobile Axe. |
| verification-2 P2 keyboard vibration | Vibration only occurs after pointer activation. | `keyboard controls, dialog focus, reduced motion, and console stay clean`; `@claim:turn-vibration`. |
| verification-2 P2 performance | Built payload remains below static budgets. | `npm run build`: JS 32.94 KB raw / 11.09 KB gzip; CSS 19.56 KB raw / 5.08 KB gzip. |
| verification-2/3 P3 security | Static deployment configuration carries CSP, framing, permissions, cache, and manifest MIME policies. | Vitest `static host hardening`; live headers. |
| verification-3 P1 strip | Overflowing player strip is focusable and Arrow-scrollable. | Vitest `running player strip regressions`; mobile Axe. |
| verification-3 P1 import | Invalid mode/numeric imports are rejected before start. | Vitest validation tests; browser setup-recovery test. |

## Result

No cumulative review finding remains open. Deployment `cf802a9c-8015-4382-bcbe-8985d299f738` serves the repaired `index-WVm0Utfa.js` build. The round-three change closes the only outstanding target-size gap without changing the product’s tabletop rules-sheet visual system or its static local-first PWA deployment class.
