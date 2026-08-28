# Tableclock polish handoff — round 1

## Delivered

- Reworked the first screen around the plain job: **Time every player’s turn**, its audience, an above-fold sample action, the real setup step, and three scoped facts.
- Added `/demo` and `?demo=1`: a running Maya/Lionel/Priya/Sora Bank-with-increment sample in the separate `tableclock-demo` IndexedDB database. The banner has working Reset demo and Start for real controls; real games stay in `tableclock-local`.
- Added the claim contract, demo notes, copy audit, seven clean-context browser claim tests, corrected terminology, and a verb-first catalog line.
- Replaced the multi-phone implication with a one-shared-phone CSS spot-print while retaining the warm-paper, offset-ink identity. Added an icon-derived 1200×630 social image.
- Added consistent SPA legal shells, route titles/metadata/canonical/OG/Twitter/apple-touch metadata, focus and live announcements on navigation, an in-product Tableclock 404, sitemap entries, and static security headers.
- Improved 390 px layout and 44 px header/footer link targets. Removed divergent standalone legal documents so direct legal paths use the same renderer.

## Verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run build
npm run test:e2e -- --workers=1
```

This repair's clean-clone evidence (`/tmp/tableclock-clean.y68ui1`, cloned from `fcdfce1ccf2fd8b7761c8596526caa01c779fcaf`):

- `npm test`: 28 tests passed.
- `npm run build`: passed; `dist/index.html` exists; initial JS is 10.72 KB gzip and CSS is 4.97 KB gzip.
- `npm run test:e2e -- --workers=1`: 8 passed, including Axe with no serious or critical violations, 390 px touch targets, route focus/404, privacy interception, and offline reload.
- Every command in `.factory/claims.json` passed individually against `/demo`: `demo-sandbox`, `offline-reload`, `player-range`, `local-private`, `setup-link`, `one-shared-device`, and `turn-flow`. The complete clean-clone browser suite also passed: 8/8.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/demo ...`: HTTP 200; no console errors; `lang=en`; one h1; main landmark; no missing image alt or unlabeled buttons. Its JSON and screenshots are in `.factory/evidence/verify-demo/` in the worker.
- Lighthouse mobile on `/demo`: Performance 100, Accessibility 100, LCP 1354 ms, CLS 0. The JSON is `.factory/evidence/lighthouse-demo.json` in the worker.

## Deployment

Artifact remains a static Vite PWA. Deploy `dist/` using the static work-order target; `dist/staticwebapp.config.json` contains the SPA fallback, static 404 override, cache policy, CSP, and security headers. No repository work-order deployment credential or command was provided, so no external deployment was attempted.

## Known gaps

None for the review acceptance work. Cross-phone sync remains intentionally unavailable and is stated clearly above the fold. The public site still returned the prior shell immediately after the Git push; the repository contains no deploy workflow or credential, so the factory deployment runner must publish `dist/`.
