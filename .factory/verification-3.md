# Independent verification 3 — FAIL

Date: 2026-08-27
Work order: `tableclock-verify-3`
Candidate commit: `f96e05951751df3e082bdc660936fc2b1a172230` (`f96e059`)
Deployment: https://tableclock.sociobot.in

## Verdict

**FAIL.** The production deployment is an exact artifact match for the
candidate and the main local-first turn-clock flow works on desktop and at
390px. It does not meet the release bar because the 390px running state has
an Axe **serious** keyboard-accessibility violation, and a structurally
plausible but semantically malformed imported setup is accepted and starts an
unusable `NaN:NaN` clock. No product files were changed during this audit.

The researched brief describes cross-phone sync as optional. This release
plainly and consistently scopes it out; it is therefore not a verification
defect.

## Candidate and live identity

The audit started from a clean checkout at exactly
`f96e05951751df3e082bdc660936fc2b1a172230`. `npm ci` followed by the exact
production command (`npm run build`) generated the same files served live.
SHA-256 matches include:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `281870a692eb0f02bd1342613edc48086618917073b3d230c94d6b056aaa61b7` |
| `assets/index-Bo0xOs_Q.js` | `113886ef88a6177d8a815e460c309d5d43a21f02dcb31de6f3e246c9fd94830b` |
| `assets/index-u62NYBUo.css` | `856d1ebc94b217277808a1d3dde9dfe4c617a2be859d9fcfe017d5d9bcf60589` |
| `sw.js` | `2fde4da1a1a42e6f73148652905980066169d8e3c62202dc9830bc5b279e3c0f` |
| `manifest.webmanifest` | `21ca41d9df1c9ec30a260f91dabb8c64c180cc355000b95d740258c6b72331d7` |
| `offline.html` | `c040fd61a2cdb05155d9b0d17ed7da9da54cc5f93ea7d6a1f4f53102dd610a41` |
| `privacy/index.html` | `3023719f7a76238ce961de6938efc4bc1a8e9ab14226ba6eb5866cf9c55cfad6` |
| `terms/index.html` | `ed422f43df09baaf2f33081cf36b3415cffc997c3c70c82ec5ce06cc12d13027` |
| `icons/icon-192.png` | `53ef819095861495e9f00ec9667f54a1fa0c623a7ee2950cab59db1df34cd7ae` |
| `assets/table-gathering.avif` | `cba1e2455556bc97f2064bb3243ddb2dfd93c419c22b12fc4af3451405dfb352` |

## Checks run

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
```

- `npm ci`: passed; 54 packages audited, 0 vulnerabilities.
- `npm test`: passed; 14 tests in 5 files.
- `npm run build`: passed (`tsc --noEmit && vite build`) and created `dist/`.
  There is no separate lint or type-check script; the production build is the
  repository's available TypeScript check.
- Initial JS: 25,228 bytes raw / 8,980 bytes gzip. CSS: 15,318 bytes raw /
  4,320 bytes gzip. Both meet the static-product budgets.
- Lighthouse 13.4.0 against the local production preview (mobile simulated
  throttling): Performance **100**, Accessibility **100**, Best Practices
  **100**, SEO **100**; FCP 1,046 ms, LCP 1,359 ms, TBT 63 ms, CLS 0, and
  65,627 bytes transferred.

## End-to-end evidence

Browser checks used Chromium/Playwright on a 1440×900 desktop and a 390×844
touch viewport, against both the local production preview and the live URL.

- Setup starts with three players; Arrow Up reorders a focused player, keeps
  focus on its name field, and safely no-ops at the first position. Five
  additions reach the eight-player boundary and disable Add player.
- A four-second bank is rejected with “Choose a starting time between 5 and
  86,400 seconds.” Correcting it to five seconds starts normally. Invalid
  JSON (`{not json`) is rejected with an actionable import error.
- Count-up advances, bank decrements, Fischer returns the completed player to
  `0:07` after a five-second bank plus three-second increment, and fixed
  per-turn gives the next player a fresh roughly five seconds. Reverse and
  Mark out work; the unfinished game survives reload.
- Keyboard-only operation worked: Tab exposes the skip link/focus treatment,
  `P` starts/pauses, Space ends a running turn, and no page errors or console
  errors occurred. At 390px document/body/client width were all 390px.
  Reduced-motion emulation changes transition and animation duration to
  `1e-05s`.
- Axe had zero serious/critical findings on setup. The running-state failure
  below reproduced on both local and live.
- Live and local PWA pages became service-worker controlled and successfully
  reloaded offline. A separate copy of the unmodified build was served, its
  service worker changed only to simulate a new deployment, and a real
  `registration.update()` displayed “A fresh version is ready. Reload when
  this turn is done.” with no console errors.
- Request capture found no outbound application requests. Source inspection
  found no analytics, tracking, third-party font/CDN, payment, WebSocket, or
  sync client. State uses IndexedDB; privacy and terms accurately describe
  this local-only behavior.

## Defects

### P1 — mobile running player strip has an Axe serious violation

At 390px, the running game renders `.player-strip` as a horizontally
scrollable `ol` (`overflow-x: auto`) but does not make the region keyboard
focusable. Axe 4.11.1 reports `scrollable-region-focusable` with **serious**
impact (one node) after starting a clock and marking a player out. Keyboard
users cannot reliably reach the off-screen players in that strip. This fails
the accessibility quality gate.

### P1 — semantically invalid setup import is accepted and breaks the clock

Importing this JSON is claimed to succeed:

```json
{"version":1,"players":[{"name":"A"},{"name":"B"}],"settings":{"mode":"nonsense","durationSec":"not-a-number","incrementSec":-99,"nudgeSec":"x"}}
```

After Start, the game screen says `Turn 1 · undefined` and displays
`NaN:NaN`. There is no page exception, but the user cannot run a usable
clock. Import validation currently checks only broad object shape, not mode
or numeric ranges/types. This fails malformed-input recovery for a supported
data-import feature.

### P3 — live security headers are incomplete

The live host correctly sends HSTS, `Referrer-Policy: same-origin`, and
`X-Content-Type-Options: nosniff`; HTML and `sw.js` revalidate and hashed
assets are one-year immutable. It does not send a Content-Security-Policy,
Permissions-Policy, or frame-embedding protection (`X-Frame-Options` or CSP
`frame-ancestors`). The manifest is served as `application/octet-stream`
rather than a manifest/JSON media type. These are deployment hardening items;
no third-party traffic was observed.

## Required remediation before PASS

1. Make the mobile player strip keyboard-accessible (or remove its horizontal
   overflow) and rerun Axe in the populated running state at 390px.
2. Fully validate imported settings and player fields before accepting an
   import; reject invalid modes and non-finite/out-of-range timing values with
   the existing actionable recovery pattern. Add a regression test for this
   input.
3. At deployment, add a CSP with appropriate `frame-ancestors`, a restrictive
   Permissions-Policy, and serve the manifest with a manifest/JSON MIME type.
