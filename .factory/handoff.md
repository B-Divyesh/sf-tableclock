# Tableclock polish handoff — round 1

## Delivered

All findings in `.factory/review-1.md`, including every copy and previously unlisted-claim item, are closed. The product now has a plain first screen, a one-click isolated running demo at `/demo` and `?demo=1`, 30 individually tested claims, complete route metadata/focus behavior, a real HTTP 404, unified legal pages, and a 390 px timer layout. The rules-sheet paper-and-spot-ink identity remains intact.

The product commits are `9246604` (repair), `f434ff8` (Azure route normalization), and `1c908a7` (origin-independent production checks). Deployment `45c7ba38-1d62-48ea-ac6e-bde09b291f78` succeeded at https://tableclock.sociobot.in.

## Verification evidence

- Clean clone `/tmp/tableclock-polish-clean.JkZGNN`: `npm ci` found zero vulnerabilities; `npm test` passed 32/32; `npm run build` passed; Playwright passed 34/34; every one of the 30 claim commands passed separately.
- Final current tree: unit/static 32/32, build passed, local Playwright 34/34, and live Playwright 34/34.
- Live direct routes: `/`, `/demo`, `/?demo=1`, `/privacy`, `/privacy/`, `/terms`, `/terms/` returned 200. `/not-a-real-route` returned 404.
- Live URL verifier: `/` and `/demo` passed with no console errors, `lang=en`, one h1, main, complete alt text, and labelled buttons.
- Live Axe CLI 4.13.0: zero violations on home, demo, privacy, and terms.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 936 ms; CLS 0; 20,638 bytes transferred.
- Output budget: JS 32.76 KB raw / 11.03 KB gzip; CSS 19.27 KB raw / 5.06 KB gzip.
- Live headers include CSP with `frame-ancestors 'none'`, HSTS, DENY framing, restrictive Permissions-Policy, no-sniff, revalidating HTML, immutable hashed assets, and `application/manifest+json`.
- Local/live SHA-256 matches: `index.html`, hashed JS/CSS, `sw.js`, manifest, and `404.html`.
- Screenshots and detailed mapping: `.factory/evidence/polish-1/` and `.factory/polish-1.md`.

Run the full verification locally:

```sh
npm ci
npm test
npm run build
npm run test:e2e -- --workers=1
```

## Known gaps and next steps

None for the reviewed release. Cross-phone sync remains intentionally outside this one-shared-phone release and is stated above the fold, in the timer, in legal copy, and in README.
