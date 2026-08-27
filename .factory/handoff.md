# Tableclock repair handoff

Date: 2026-08-27
Work order: `tableclock-repair-2`
Base: `339c76c2afe5f1066642cfb794f83391850e70ca`

## Status

The three requested verifier-2 product blockers are repaired and the local
production build is verified. This is intentionally a focused repair: the
local-only scope, timer modes/semantics, setup arrow-key reordering, PWA
offline/update flow, and static cache configuration remain intact.

## Changes

- The running clock no longer applies opacity to an out player. The explicit
  `Out` label is `#FFD4CF` on the `#151310` running strip (13.75:1 contrast),
  so the normal 11px marker exceeds WCAG AA rather than inheriting a dimmed
  effective colour.
- Vibration is now restricted to a pointer-activated turn action. Keyboard
  start/end-turn, timer nudges, and expiry states do not invoke
  `navigator.vibrate`, preventing Chromium's blocked-haptics console error.
- The decorative setup print is omitted from the mobile DOM (as already
  intended by the phone layout) and decoded asynchronously on larger screens.
  This removes the off-screen image from the mobile critical path.
- Added exact state regressions: the haptics tests cover pointer, keyboard,
  nudge, expiry, and disabled states; the running-state test asserts the
  opaque out-player treatment and WCAG-AA contrast token pair.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
```

Verification completed against the clean production preview:

- `npm test`: 14 tests in 5 files passed.
- `npm run build`: passed; `dist/` produced. Initial JS is 25.23 KB raw / 8.98
  KB gzip and CSS is 15.32 KB raw / 4.32 KB gzip.
- Playwright/axe smoke on desktop (1440×900) and mobile (390×844): setup
  Arrow Up reordering retained focus/order; keyboard `P` start and Space
  end-turn generated zero console errors; a player was marked out and Axe had
  zero serious/critical issues; both layouts had no horizontal overflow; a
  service-worker-controlled offline reload rendered the app successfully.
- Mobile Lighthouse production-preview reruns (simulated throttling):
  Performance **100/100**, Accessibility **100/100** both times. Run 1:
  FCP/LCP 908 ms, TBT 0 ms, 15,065 transferred bytes. Run 2: FCP/LCP 905 ms,
  TBT 0 ms, 15,065 transferred bytes.

## Live baseline / deployment note

The existing live site was read-only checked before handoff. It still serves
the prior candidate asset names (`index-XyuD-B3l.js`, `index-BthEpW2j.css`),
so it cannot yet be byte-identical to this un-deployed repair. Its truthful
local-only Privacy and Terms copy remains live, and the existing
`Cache-Control`, HSTS, `Referrer-Policy`, and `X-Content-Type-Options`
headers remain unchanged. Deployment should publish this commit, then rerun
the same live Lighthouse/browser parity checks against the new hashed assets.

The deployment-level CSP/frame/Permissions-Policy recommendation in
`verification-2.md` remains factory infrastructure work and was not changed
by this focused static-app repair.
