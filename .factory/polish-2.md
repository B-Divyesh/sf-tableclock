# Tableclock polish round 2 — finding closure

Date: 2026-08-28  
Base reviewed: `eb89279e5a0b1347994100bbed84c449a80eceb0` / `.factory/review-2.md`  
Repair commit: recorded in `.factory/handoff.md` after push  
Live URL: https://tableclock.sociobot.in

## Evidence key

- `shell-focus`: Playwright `the one-click demo keeps the site shell and hands focus to the game heading`.
- `tab-order`: Playwright `@claim:keyboard-tab-order tabs through each setup control without a trap`.
- `claims`: every command in `.factory/claims.json`, including all existing 30 and `keyboard-tab-order`.
- `full`: `npm test`, `npm run build`, and `npm run test:e2e`.
- `live-home`: `.factory/evidence/polish-2/live-home-desktop.png` and `live-home-mobile.png`.
- `live-demo`: `.factory/evidence/polish-2/live-demo-desktop.png` and `live-demo-mobile.png`.
- `live-404`: `.factory/evidence/polish-2/live-404.png`.

The live URL was rechecked cold after deployment for each grouped confirmation below. `live-home`, `live-demo`, and `live-404` are the captured evidence paths.

## Round-2 findings

| Finding id | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | The running clock now has a compact ink game header with a wordmark home link and visible Privacy/Terms links. It also renders the ordinary footer with the product one-liner, legal links, Param Factory attribution, and build id. | `shell-focus`; mobile touch-target/Axe test; `live-demo`; cold live `/demo`. |
| F-2-2 | Full navigations set a one-use session focus intent. Boot consumes it, focuses `main h1`, and fills the polite route announcer for home→demo and demo→real transitions. | `shell-focus`; `@claim:demo-seed`; cold live `/demo`. |
| F-2-3 | The ambiguous dock label is now **Open clock options**. The former wordmark menu button is a real home link. | `shell-focus`; `@claim:setup-export`, `@claim:player-status`; `live-demo`; cold live `/demo`. |
| F-2-4 | The broad sentence was narrowed to “Tab moves to the next setup control.” It is registered as `keyboard-tab-order` and tested through each tabbable setup control into the footer. | `tab-order`; `claims`; `live-home`; cold live `/`. |

## Cumulative review findings

| Finding id | Change retained and rechecked | Evidence |
| --- | --- | --- |
| B1 | Plain job-first headline, audience, visible sample and real paths, result note, and three first-screen facts remain above the fold. | `@claim:demo-seed`; mobile test; `live-home`; cold live `/`. |
| B2 | `/demo` and `?demo=1` seed a running four-player game in `tableclock-demo`, with banner, reset, exit, and offline support. | `@claim:demo-seed`, `demo-isolation`, `demo-reset`, `demo-exit`, `offline-reload`; `live-demo`; cold live `/demo`. |
| B3 | Claims manifest is checked for exactly one matching tagged browser test per claim. | Vitest `claim contract`; `claims`; repository check. |
| B4 | Explicit static routes and the designed response override retain a real HTTP 404. | route/404 test; `live-404`; cold live `/not-a-real-route`. |
| B5 | One-phone print art and the explicit no-sync scope replace the unsupported multi-phone implication. | `@claim:one-shared-device`, `no-cross-phone`; `live-home`; cold live `/`. |
| S1 | Route-specific title, description, canonical, Open Graph/Twitter metadata, social image, favicon, and Apple icon remain on every route. | route metadata test; static-hardening test; cold live `/`, `/demo`, `/privacy`, `/terms`. |
| S2 | Unified renderer, focused/announced route headings, and scroll restoration cover SPA navigation; F-2-2 closes the last full-navigation exception. | route test; `shell-focus`; cold live legal/back flow. |
| S3 | Header, first screen, setup, steps, limitations, and footer remain present; F-2-1 closes the running-state shell gap. | `shell-focus`; mobile test; `live-home` and `live-demo`. |
| S4 | Header, footer, banner, game header, and enabled controls keep 44 px targets at 390 px. | mobile test; `live-demo-mobile`; cold live mobile check. |
| S5 | The rules-sheet paper/spot-ink identity and one-phone illustration remain product-specific. | visual cold check; `live-home`; `.factory/design.md`. |
| C-L01 | Job-first h1 remains “Time every player’s turn.” | route test; `live-home`. |
| C-L02 | Player range wording remains precise. | `@claim:player-range`; `live-home`. |
| C-L03 | One shared-phone illustration and caption remain. | `@claim:one-shared-device`; `live-home`. |
| C-L04 | Four timing modes use the reviewed consistent names. | four `@claim:mode-*` tests; `live-home`. |
| C-L05 | Setup-link action remains result-named. | `@claim:setup-link-roundtrip`; cold live `/demo`. |
| C-L06 | Install wording makes no longevity promise. | `@claim:pwa-install`; `live-home`. |
| C-L07 | Privacy wording remains specific to browser-local names. | `@claim:local-storage`; cold live `/privacy`. |
| C-L08 | Footer uses scope, legal, attribution, and build wording. | `shell-focus`; `live-demo`. |
| C-L09 | Dialog heading remains “Reuse this setup.” | `@claim:setup-link-roundtrip`; cold live `/demo`. |
| C-L10 | Dialog action remains “Close.” | keyboard/dialog test; cold live `/demo`. |
| C-R01–C-R14 | README retains the plain player/mode/local data/import-export/build/deploy rewrites, with no long or unsupported marketing claims. | `.factory/copy-audit.md`; `claims`; clean-clone test/build. |
| U01–U20 | Every retained visitor claim remains individually registered and covered; removed claims stay absent. | all `claims`; static-hardening; cold live copy review. |
| verification-1 cache policy | Fingerprinted assets remain immutable while documents and service worker revalidate. | static-hardening; live response headers. |
| verification-1 unavailable sync | Unsupported rooms remain absent and clearly scoped out. | `@claim:no-cross-phone`; `live-home`/`live-demo`. |
| verification-1 Arrow reorder | Arrow reorder, retained focus, and move-button equivalent remain. | `@claim:keyboard-reorder`; cold live `/demo`. |
| verification-2 P1 | Running out-state contrast remains free of serious/critical Axe findings. | mobile Axe test; live Axe `/demo`. |
| verification-2 P2 console | Keyboard turn changes still gate vibration correctly and produce no console error. | keyboard/console test; cold live `/demo`. |
| verification-2 P2 performance | Payload remains below static budgets and is remeasured after deployment. | build sizes; live Lighthouse in handoff. |
| verification-2 P3 | CSP, framing, permissions, cache, and manifest MIME policies remain configured. | static-hardening; live header checks. |
| verification-3 P1 strip | The mobile player strip remains focusable and Arrow-scrollable. | mobile test; live Axe `/demo`. |
| verification-3 P1 import | Malformed modes and non-finite/out-of-range values remain rejected before start. | validation tests; setup recovery browser test. |
| verification-3 P3 | Deployment security/MIME hardening remains configured. | static-hardening; live header checks. |

## Result

No review finding remains open. The repaired game shell preserves the product’s tabletop rules-sheet identity; it does not substitute a generic landing template.
