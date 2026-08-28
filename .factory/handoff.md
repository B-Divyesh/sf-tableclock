# Tableclock review 4 handoff

Date: 2026-08-28
Work order: tableclock-review-4
Review commit: pending

## Done

Performed the requested adversarial first-read review without modifying product code. The result is **PASS** with zero findings. See .factory/review-4.md.

## Verified

- Cold live checks at 390 × 844 and 1440 × 900: job, audience, and first action were clear before scrolling.
- Live demo: one-click running four-player sample, banner, reset, Start for real, separate real/demo IndexedDB state, h1 focus, and offline reload/turn change.
- Fresh clone: npm ci, npm test (32 tests), and npm run build passed. All 31 commands in claims.json were run independently; Playwright reported passed with no failed tests.
- Live metadata, routes, link crawl, 404, site shell, mobile Axe, and prior-finding regression checks passed.
- No product files were changed.

## Run

    npm ci
    npm test
    npm run build
    npm run test:e2e -- --workers=1

Run each visitor claim using its command in .factory/claims.json.

## Known gaps

None for this reviewed release. Cross-phone sync is intentionally out of scope and disclosed before setup; it is not presented as available.
