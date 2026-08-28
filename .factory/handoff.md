# Tableclock review handoff — round 2

## Delivered

This reviewer made no product-code changes. The committed review is
`.factory/review-2.md`.

## Verification

- Fresh clone `/tmp/tableclock-review2-clean`: `npm ci` passed with 0
  vulnerabilities; `npm test` passed 32/32; `npm run build` generated `dist/`;
  full Playwright passed 34/34.
- Every one of the 30 commands declared in `.factory/claims.json` was run
  separately from that clean clone and passed.
- Live 390 px and desktop cold reads, demo reset/isolation, live service-worker
  offline reload, request interception, metadata/404, link crawl, Axe smoke
  check, headers, and historical regression checks are documented in the
  review.

## Known gaps

The review verdict is **FAIL** with four remaining findings:

1. The `/demo` running state drops normal header navigation and the required
   footer.
2. The primary landing-to-demo route change leaves focus on `body`.
3. The running-state “Options” button does not name a result.
4. “Tab still moves through every control” lacks an exact claims entry/test.

Run after a repair:

```sh
npm ci
npm test
npm run build
npm run test:e2e -- --workers=1
```
