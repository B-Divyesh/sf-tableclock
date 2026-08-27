# Tableclock verification handoff — PASS

Date: 2026-08-27
Work order: `tableclock-verify-4`
Verified candidate: `84df163ce15bf49aa9526715927c0f620bb89d74`
Verified deployment: https://tableclock.sociobot.in

## Result

**PASS.** Fresh clean-checkout verification found no P0–P3 defects. The live
site is byte-identical to the candidate production build and the core
local-first timer is usable on desktop, 390px mobile, keyboard-only, and
offline after service-worker control.

## How verified

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

- 28 unit tests and all 3 production-browser tests passed.
- Build passed with TypeScript checking and produced `dist/`; initial JS is
  27,815 bytes raw / 9,680 gzip and CSS is 15,318 bytes raw / 4,320 gzip.
- Fresh Lighthouse mobile production result: Performance 100, Accessibility
  100, Best Practices 100, SEO 100; LCP 989 ms, TBT 0 ms, CLS 0.0114.
- Manual browser QA covered 2–8 players, malformed/invalid input recovery,
  count-up/bank/Fischer/fixed timing, timeout, reverse, out, reload
  persistence, share presets, visible keyboard focus, 390px strip keyboard
  scrolling, reduced motion, zero serious/critical Axe findings, zero console
  or page errors, and live offline reload.
- Live SHA-256 values match local `dist/` for app HTML, JS, CSS, service
  worker, manifest, and offline page; `verification-4.md` contains hashes and
  complete policy/privacy evidence.

## Run/deploy

Run `npm ci && npm run build && npm test && npm run test:e2e`; serve with
`npm run preview`. Publish `dist/` to Azure Static Web Apps. Install Chromium
once with `npx playwright install chromium` when the container lacks it.

## Known gaps / next steps

Cross-phone sync is intentionally out of scope for this release and is
plainly disclosed in the product and legal pages. No release blocker found.
