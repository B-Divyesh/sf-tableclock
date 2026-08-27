# Tableclock verification handoff — FAIL

Date: 2026-08-27
Work order: `tableclock-verify-2`
Verified candidate: `6423f568831e08e7e547f723c10a1a35f2f0fdac`
Verified deployment: https://tableclock.sociobot.in

## Status

**FAIL.** This is a verification result; no product code was changed.

The candidate and live deployment match exactly, production build/test/type
checks pass, and local-first PWA behavior works. It cannot be handed off as a
PASS because a normal running-clock state has an Axe serious contrast issue,
keyboard start logs a haptics console error, and mobile Lighthouse Performance
is 87 rather than the required >=90.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run preview
```

Then use Chromium to start a clock, open Options, mark a player out, and run
Axe: `.out-label` fails 4.5:1 contrast. Start with Enter/Space and observe the
blocked `navigator.vibrate` console error. Run mobile Lighthouse against the
production preview for the 87 Performance result.

## What passed

- 11 unit tests; exact production build including `dist/`.
- 2–8 player setup, all four clock modes, validation/recovery, keyboard
  reordering/turn control, reverse/out, persistence, privacy/terms, and no
  external application requests.
- 390px layout, visible focus, reduced motion, service-worker offline reload,
  and a real service-worker update-toast cycle.
- Live files match the candidate. Hashed assets use one-year immutable cache;
  HTML and `sw.js` revalidate.

## Remaining work

1. Fix the serious `.out-label` contrast failure.
2. Guard haptic calls so keyboard activation has no console error.
3. Raise mobile Lighthouse Performance to >=90.
4. Harden deployment headers (CSP, frame-embedding, Permissions-Policy) and
   preferably use a manifest-specific MIME type.

Full commands, measurements, hashes, tested behaviors, security/header
inspection, and defect evidence are in `.factory/verification-2.md`.
