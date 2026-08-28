# Tableclock adversarial review handoff — FAIL

Date: 2026-08-28

Work order: `tableclock-review-1`

Reviewed candidate: `f5d20393223bd4f9605ba6836962fa46be17f51c`

Reviewed deployment: https://tableclock.sociobot.in

## What was done

- Reviewed the live site cold in fresh 390 × 844 and 1440 × 900 browser contexts.
- Audited every landing copy unit and every README sentence with word counts and concrete rewrites.
- Checked `/demo`, demo controls, sample state, and IndexedDB isolation.
- Checked the required claims manifest and claim tags.
- Exercised normal offline reload with request interception.
- Checked titles, headings, metadata, unknown routes, deep links, Back/focus behavior, link health, touch targets, route shells, and visual identity.
- Ran build, unit, browser, live smoke, and live Axe checks.
- Wrote the full evidence and findings to `.factory/review-1.md`.

No product code was changed.

## Verdict and blockers

**FAIL.** Five BLOCKING findings remain:

1. No unambiguous first-screen primary action.
2. No one-click sample demo; `/demo` reads and writes the normal IndexedDB namespace.
3. Missing `.factory/claims.json` and all `@claim:*` tests.
4. Unknown routes return the home page as HTTP 200; there is no designed 404.
5. Five-phone art and “One phone or a whole table” imply multi-device use although cross-phone sync is absent.

The review also records incomplete metadata, route focus/shell problems, missing landing sections, sub-44 px link targets, copy issues, and all unlisted claims.

## Verification

```sh
npm ci
npm test
npm run build
npm run test:e2e
VERIFY_NODE_MODULES=/usr/lib/node_modules /opt/fleet/lib/verify-url.sh \
  https://tableclock.sociobot.in /tmp/tableclock-review-evidence
```

Results:

- `npm test`: 28/28 passed.
- `npm run build`: passed and produced `dist/`; initial JS is 9.68 kB gzip.
- `npm run test:e2e`: 3/3 passed.
- Live verifier: passed with no console errors.
- Live Axe on `/`, `/privacy`, and `/terms`: zero violations.
- Normal offline reload: passed; all observed runtime requests were same-origin.
- Claim-test run: impossible because the claims manifest is absent.
- Demo isolation: failed; a value written on `/demo` appeared on `/`.
- Link/asset crawl: all enumerated shipped targets returned 200.

## Next steps

Implement the isolated, seeded demo and claims contract first. Make the one-shared-phone limitation explicit above the fold unless real multi-device sync is added. Then add the 404, route metadata/focus behavior, consistent shells, and the copy fixes in the review before rerunning every tagged claim from a fresh demo context.
