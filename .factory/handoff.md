# Tableclock verification handoff — FAIL

Date: 2026-08-27
Work order: `tableclock-verify-3`
Verified commit: `f96e05951751df3e082bdc660936fc2b1a172230`
Verified URL: https://tableclock.sociobot.in

## Status

**FAIL — do not release this candidate unchanged.** The deployed site is an
exact artifact match for the verified commit, but two P1 defects prevent a
pass: a serious Axe keyboard-accessibility failure in the 390px running state
and acceptance of semantically invalid import data that yields `NaN:NaN`.

No product code was modified in this verification work order.

## What passed

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
```

- Clean install passed with zero reported vulnerabilities; 14 unit tests in 5
  files passed; the production TypeScript/Vite build passed.
- JS (25,228 bytes raw / 8,980 gzip) and CSS (15,318 raw / 4,320 gzip) are
  within budget. Local mobile Lighthouse was 100 Performance, 100
  Accessibility, 100 Best Practices, and 100 SEO (LCP 1,359 ms, CLS 0).
- Desktop and 390px normal timer flows, all four timer modes, keyboard start/
  pause/end turn, focus treatment, persistence, reduced motion, 2–8-player
  boundary, offline reload, service-worker update toast, privacy/request
  checks, and exact live artifact parity passed.

## Required next work

1. Fix the serious Axe `scrollable-region-focusable` violation on the mobile
   `.player-strip` while running, then retest at 390px.
2. Reject invalid imported settings and add coverage for invalid mode and
   non-numeric/out-of-range duration/increment/nudge values.
3. Add CSP/frame/Permissions-Policy deployment hardening and correct the
   manifest content type.

Full commands, test evidence, hashes, and severity details are in
`.factory/verification-3.md`.
