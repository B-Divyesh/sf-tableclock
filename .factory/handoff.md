# Tableclock polish round 3 handoff

Date: 2026-08-28
Work order: `tableclock-polish-3`
Repair commit: `414f18848484478a33424d3f562a91f2e807e6a9`
Deployment: `cf802a9c-8015-4382-bcbe-8985d299f738` via `/opt/fleet/lib/deploy-static.sh tableclock dist`
Live URL: https://tableclock.sociobot.in

## Done

Closed the sole round-three finding, `F-3-1`: the **Back to the clock** link
on both legal pages is now an inline-flex 44 px touch target, with padding
that preserves the rules-sheet visual language. A focused 390 px browser test
measures the link on `/privacy` and `/terms` so the regression cannot return.

The release retains and rechecks all earlier work: the job-first first screen,
one-click isolated `/demo` and `?demo=1` sample, banner/reset/real exit,
local-only persistence, all claim tests, route metadata/focus/history/404,
common site shell, mobile layout, privacy/legal pages, static PWA hardening,
and the one-shared-phone scope. The catalog sentence is now verb-first and
47 characters: “Time every board-game turn on one shared phone.”

`.factory/polish-3.md` maps every prior review finding to its repair and
evidence. `.factory/copy-audit.md` was refreshed for this round.

## Exact verification evidence

Clean clone: `/tmp/tableclock-polish3-clean.kxY7yV` at
`414f18848484478a33424d3f562a91f2e807e6a9`.

- `npm ci`: passed, 61 packages installed, 0 vulnerabilities.
- `npm test`: passed, 9 files / 32 tests.
- `npm run build`: passed and created `dist/index.html`; JavaScript is 32.94
  KB raw / 11.09 KB gzip and CSS is 19.56 KB raw / 5.08 KB gzip.
- `npm run test:e2e -- --workers=1`: passed, 38/38 browser tests, including
  the 390 px legal target, keyboard, routes, offline, privacy, and Axe flows.
- Every `.factory/claims.json` command was run separately from that clean
  clone: 31/31 passed (`demo-seed`, `demo-isolation`, `demo-reset`,
  `demo-exit`, `offline-reload`, `player-range`, `free-use`, `local-storage`,
  `same-origin`, `no-account`, `no-analytics`, `setup-link-roundtrip`,
  `setup-link-local`, `mode-count-up`, `mode-time-bank`, `mode-increment`,
  `mode-per-turn`, `keyboard-reorder`, `keyboard-tab-order`, `setup-export`,
  `setup-import`, `one-shared-device`, `no-scorekeeping`, `no-cross-phone`,
  `turn-flow`, `pause-resume`, `reverse-order`, `player-status`,
  `local-sound`, `turn-vibration`, and `pwa-install`).
- Production-preview `verify-url.sh` passed for `/` and `/demo`: title,
  `lang=en`, exactly one h1, main landmark, image alt, labelled buttons, and
  no console/page errors.

Cold production recheck after deployment:

- The live HTML serves `assets/index-WVm0Utfa.js` and
  `assets/index-B6pKlCLr.css`; `/` last changed at 14:08 UTC.
- `PLAYWRIGHT_BASE_URL=https://tableclock.sociobot.in npm run test:e2e --
  --workers=1`: passed 38/38.
- `/opt/fleet/lib/verify-url.sh` passed for live `/` and `/demo`, with no
  console/page errors and all basic semantic checks present.
- Fresh 390 px Axe checks found zero serious/critical issues on `/`, `/demo`,
  `/privacy`, `/terms`, and `/not-a-real-route`; the expected HTTP 404 is not
  treated as an application error.
- Live legal-link measurements: `/privacy` 189.77 × 44 px and `/terms`
  189.77 × 44 px.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 928.06 ms, CLS 0, transfer 18,007 bytes.
- Live hashed JavaScript has `Cache-Control: public, max-age=31536000,
  immutable`; the manifest is `application/manifest+json` and documents
  revalidate as configured.
- Visual evidence is at `.factory/evidence/polish-3/live-home-mobile.png`,
  `live-demo-mobile.png`, `live-privacy-mobile.png`, `live-terms-mobile.png`,
  and `live-404-mobile.png` (ignored build evidence, not source assets).

## Run and deploy

```sh
npm ci
npm test
npm run build
npm run test:e2e -- --workers=1
```

For static deployment, build `dist/` and run:

```sh
/opt/fleet/lib/deploy-static.sh tableclock dist
```

## Known gaps

None. The live site, clean clone, every registered claim, and the cumulative
review findings are all rechecked and passing.
