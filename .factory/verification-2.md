# Independent verification 2 — FAIL

Date: 2026-08-27
Work order: `tableclock-verify-2`
Candidate commit: `6423f568831e08e7e547f723c10a1a35f2f0fdac` (`6423f56`)
Deployment: https://tableclock.sociobot.in

## Verdict

**FAIL.** The live static deployment is an exact match for the candidate and
the useful local/offline clock flow works, but the candidate does not satisfy
the required quality bar. The running-clock state has an Axe **serious**
color-contrast violation. In addition, a keyboard-only start produces a
Chromium console error via `navigator.vibrate`, and the reproducible mobile
Lighthouse Performance score is 87, below the required 90.

The brief's multi-device sync is described as optional. This candidate has
explicitly scoped it out, removes the old WebSocket implementation, and says
so in the setup, running clock, legal pages, and README. It is not counted as
a defect in this verification.

## Candidate / deployment identity

- Started from a clean worktree on `main`; `git rev-parse HEAD` was exactly
  `6423f568831e08e7e547f723c10a1a35f2f0fdac`.
- `origin/main` was the same commit.
- A fresh exact build produced `dist/` with:
  `assets/index-XyuD-B3l.js` and `assets/index-BthEpW2j.css`.
- SHA-256 matched between the generated `dist/` and the live URL for the app
  shell, JS, CSS, `sw.js`, manifest, offline page, icons, and AVIF/WebP art.
  Examples: `index.html` =
  `9182deee16155d823218c9874bf7b7d8bd1667d04ebb656823195ffe23a8fa52`;
  JS = `2bfd8e952aff578fcaf1d50b212de6301d66fc54c135d56bbf7b9629ca4c5a8b`;
  CSS = `4f15f50bb4c6560ffa6688cb2973f7c8feca1d1e28461fb20556939929159d40`.

## Commands and automated checks

```sh
npm ci
npm test
npm run build
npm run preview
```

- `npm ci`: passed; 54 packages audited, 0 vulnerabilities.
- `npm test`: passed — 11 tests in 3 files.
- `npm run build`: passed (`tsc --noEmit && vite build`) and produced `dist/`.
- No separate lint script or type-check script exists. The production build's
  `tsc --noEmit` is the repository's available type check.
- Build budget: initial JS 25,017 bytes raw / 8,848 bytes gzip; CSS 15,266
  bytes raw / 4,313 bytes gzip; AVIF 19,811 bytes. The initial JS and CSS
  budgets pass.
- Mobile Lighthouse (local exact production preview, Lighthouse 13.4.1):
  Performance **87**, Accessibility 100, Best Practices 100, SEO 100; LCP
  1,556 ms; CLS 0; total transferred bytes 85,575. The 87 Performance score
  fails the stated >=90 quality gate.

## End-to-end evidence

Chromium/Playwright checks were run against both local `vite preview` and the
live deployment. The same functional results and two defects reproduced on
both.

- Setup: 3 players renamed and keyboard-reordered; focus remained on the
  moved name field; first-player Arrow Up was a safe no-op. Five additions
  reached the 8-player boundary and disabled Add player.
- Malformed JSON import (`{not json`) displayed the actionable recovery
  message and retained a usable setup. A URL preset restored four players and
  fixed-per-turn mode.
- Boundary validation rejected a 4-second time bank with “Choose a starting
  time between 5 and 86,400 seconds.” Correcting it to 5 seconds started the
  clock.
- Keyboard-only operation: Enter started, Space ended a turn, and P paused;
  a visible focus outline was present. Reverse and Mark out were also
  exercised. The unfinished game survived reload.
- All timer modes ran end-to-end with a 5-second value: count-up advanced;
  bank decremented; Fischer returned the finished player to 0:07 after about
  0.25 s from 0:05 with a +3 increment; fixed-per-turn gave the next player a
  fresh ~0:05.
- At 390 x 844 the document and body were 390px wide (no horizontal
  overflow). Reduced-motion emulation set transition and animation duration
  to `1e-05s`.
- The service worker controlled the production page and an offline reload
  rendered the clock from cache. A separate same-origin temporary static
  server served the unmodified candidate, then a byte-different `sw.js`; a
  real `registration.update()` produced the in-app “A fresh version is ready”
  toast without an error. This verifies the candidate's update lifecycle
  without changing product files.
- Axe on setup, privacy, and terms: zero violations. The running state has
  the serious violation below.

## Defects

### P1 — serious accessibility failure in running state

Axe found one **serious** `color-contrast` violation after marking a player
out. `.out-label` is rendered at 11px bold with computed foreground `#8f7773`
on `#151310`, a 4.46:1 ratio where Axe requires 4.5:1. This violates the
accessibility quality gate and is directly visible in a normal game action.

### P2 — keyboard start logs a browser console error

Starting the timer through the documented keyboard flow causes the following
console error in local and live Chromium:

```text
Blocked call to navigator.vibrate because user hasn't tapped on the frame or
any embedded frame yet: https://www.chromestatus.com/feature/5644273861001216.
```

The app calls vibration as part of the start/turn cue even when keyboard
activation does not grant the browser's required haptic activation. This
breaks the no-console-errors quality gate for keyboard users. There were no
page exceptions and no console errors on initial load.

### P2 — mobile Lighthouse Performance below required threshold

The exact local production build scored **87**, below the factory's >=90
mobile Performance gate, although LCP (1.56 s), CLS (0), and byte budgets
were within target.

### P3 — security hardening headers are incomplete

The live host correctly serves HSTS (`max-age=10886400; includeSubDomains;
preload`), `Referrer-Policy: same-origin`, and `X-Content-Type-Options:
nosniff`; it uses HTTPS. It does not send `Content-Security-Policy`,
`Permissions-Policy`, or `X-Frame-Options` / a CSP `frame-ancestors`
equivalent. The static application has no observed third-party requests, but
these missing defense-in-depth headers should be added at deploy time.

## Privacy, requests, and deployment checks

- Browser request capture found no outbound requests from the app. Source scan
  found no analytics, tracking, CDN fonts/scripts, payment code, WebSocket,
  BroadcastChannel, or sync relay client. State is in IndexedDB and JSON
  import/export is local.
- The privacy and terms pages are present and correctly state local storage,
  no tracking, and no cross-phone sync. `/`, `/privacy`, `/terms`, their
  slash forms, and the PWA routes returned 200.
- HTML and `sw.js` are `Cache-Control: public, max-age=0, must-revalidate`.
  Hashed JS/CSS/art are `public, max-age=31536000, immutable`. This fixes the
  asset-cache failure recorded in verification 1.
- The manifest is valid JSON with standalone display, 192/512/maskable icons,
  colors, and a versioned start URL. The live host serves it as
  `application/octet-stream` rather than a manifest/JSON media type; Chromium
  still registered the service worker and passed offline testing, but serving
  `application/manifest+json` is advisable.

## Required remediation before PASS

1. Raise `.out-label` contrast to at least 4.5:1 in every running-state
   player color/background combination; rerun Axe after marking a player out.
2. Do not invoke vibration when the browser does not allow haptic activation,
   or otherwise avoid the console error for Enter/Space flows.
3. Improve and re-measure mobile performance until Lighthouse Performance is
   at least 90 under the same production-preview run.
4. Add an appropriate CSP, frame-embedding protection, and a restrictive
   Permissions-Policy at the deployment layer; serve the manifest with a
   manifest/JSON content type if the platform permits.
