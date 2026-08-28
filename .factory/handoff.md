# Tableclock repair handoff — polish round 2

## Delivered

- Repaired every finding recorded through `.factory/review-2.md`.
- Added the compact running-clock site shell: wordmark home link, Privacy and Terms links, full footer, and 44 px targets.
- Added full-navigation focus intent so one-click demo entry and demo exit focus and announce the destination heading.
- Renamed the dock action to **Open clock options** and changed the former wordmark menu control to a real home link.
- Narrowed and proved the setup Tab wording with the new `keyboard-tab-order` claim/test.
- Released the consistent `1.1.0-polish-2` build id in the app footer, 404 footer, and service-worker cache version.

Repair commits: `d484aff60f25b4e42ddb180137a46a154a9b3a28` and `e344c9c7694902803d23e2161dbef58f292b67fd`.

## Verification

Final clean clone: `/tmp/tableclock-polish2-final.rat2Eg` at `e344c9c`.

- `npm ci`: passed, 0 vulnerabilities.
- `npm test`: passed, 9 files / 32 tests.
- `npm run build`: passed; `dist/index.html` created.
- `npm run test:e2e -- --workers=1`: passed, 37/37.
- Every one of the 31 `.factory/claims.json` commands passed separately against the clean clone’s built preview in a fresh browser context.
- Local Lighthouse: Performance 94, Accessibility 100, Best Practices 100, SEO 100; LCP 1,352 ms, CLS 0. Evidence: `.factory/evidence/polish-2/lighthouse-local.json`.
- Final build payload: JS 32.94 KB raw / 11.09 KB gzip; CSS 19.44 KB raw / 5.06 KB gzip.

Production deployment used the static work-order target `sf-tableclock` and `dist/`. The live and local `index.html` SHA-256 matched after deploy:

`000ef84d1063f178640dced59c7129b29bf564d75867f2c59a14d37e171595b4`

Cold live checks at https://tableclock.sociobot.in:

- `verify-url.sh` passed for `/` and `/demo`: 200, correct title/lang, one h1, main landmark, no missing image alt or unlabeled buttons, and no console errors.
- Live targeted Playwright regression suite passed 5/5: demo seed/focus, Tab order, route metadata/focus/404, running shell, mobile targets, and embedded Axe checks.
- The full live Playwright suite passed 37/37 before the final build-label-only deploy; the targeted live suite was repeated after it.
- Header policy and manifest checks passed: self-only CSP, framing denial, restrictive permissions policy, immutable hashed assets, and `application/manifest+json`.
- Screenshots and verifier JSON are in `.factory/evidence/polish-2/` (ignored work-order evidence): home/demo desktop and mobile, 404, and verify reports.

## Run and deploy

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Deploy `dist/` through the Static Web Apps work-order target. The included `public/staticwebapp.config.json` supplies route, MIME, cache, and security-header policy.

## Known gaps

None. The standalone Axe CLI could not launch its Selenium Chrome binary in this container; the repository’s Playwright Axe integration ran successfully on the live home and running mobile screens.
