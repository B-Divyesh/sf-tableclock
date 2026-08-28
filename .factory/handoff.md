# Review 3 handoff — Tableclock

Date: 2026-08-28
Work order: `tableclock-review-3`

## Done

Performed an adversarial, non-code-changing review of `https://tableclock.sociobot.in` and committed the result in `.factory/review-3.md`.

The review used fresh live browser contexts at 390 × 844 and 1440 × 900, checked the demo sandbox and real/demo IndexedDB separation, read all previous review/polish/handoff records, crawled internal links, checked routes and metadata, ran Axe on every public route, and checked the product against the attached copy, demo, claims, structure, AI-leverage, and accessibility criteria.

## Verification

From a fresh clone at `/tmp/tableclock-review-AY6cRZ`:

```sh
npm ci
npm test
npm run build
# every command listed in .factory/claims.json, separately
```

- `npm test`: passed, 9 files / 32 tests.
- `npm run build`: passed and produced `dist/`.
- All 31 registered claim commands passed.
- Live `/`, `/demo`, `/privacy`, and `/terms` returned 200; an unknown route returned the designed HTTP 404.
- Axe found no serious or critical violation on home, demo, privacy, terms, or 404 at 390 px.

## Known gap

The review verdict is **FAIL** with one minor issue: on `/privacy` and `/terms`, “Back to the clock” is 174 × 21 px at 390 px, below the 44 px mobile target requirement. The requested repair is to give that return link a 44 px hit area and add a mobile measurement test. No product code was changed by this review.

## Next step

Repair `F-3-1`, run the normal quality gates plus every claim command, and repeat the adversarial first-read review. The review report contains the exact measurement and suggested test.
