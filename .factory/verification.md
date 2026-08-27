# Independent verification — FAIL

Date: 2026-08-27  
Work order: `tableclock-verify-1`  
Candidate: `c1b91148f240dd4a709a2da46eee251f844862a0`  
Deployment checked: `https://tableclock.sociobot.in`

## Verdict

**FAIL.** The deployed files are exactly the candidate and the local timer/PWA
works well, but the Standard deployment does not meet the product contract:

1. Fingerprinted production JS and CSS are served with
   `Cache-Control: public, must-revalidate, max-age=30`, rather than long-lived
   immutable caching. This fails the static/PWA caching requirement.
2. The advertised multi-phone room flow is not usable on the deployment. Joining
   room `ABCD` attempts `wss://tableclock.sociobot.in/sync`, receives HTTP 503,
   emits `WebSocket connection ... Unexpected response code: 503` in the browser
   console, and displays “This host does not have room sync enabled.” The brief's
   smallest useful product includes optional room sync; the UI/error copy is
   honest, but the capability is unavailable on the shipped host.

The design record also specifies arrow-key player movement in setup. With focus
on the first player name, `ArrowDown` left Player 1 first and Player 2 second;
there is no selected-player arrow-key operation. Reorder buttons remain usable
with keyboard focus, so the core local clock is keyboard-operable, but this
specified shortcut is missing.

## Candidate and deployment identity

- `git rev-parse HEAD` returned exactly
  `c1b91148f240dd4a709a2da46eee251f844862a0`.
- The SHA-256 hashes of local `dist/` and the live response matched for
  `index.html`, hashed JS/CSS, `sw.js`, manifest, offline page, privacy/terms,
  icon SVG, and AVIF/WebP artwork. For example, both `index.html` hashes were
  `107555f9ecbc50be31304706c8c16ec9f3acc0a3af83f94354d39d91b6a5a815` and
  both JS hashes were
  `5f05341512796a38c3edcca9616f98b981a8ea795a56e48733be6fc1e2b3cc1e`.

## Local verification (passed)

- Clean `npm ci`: passed; 54 packages audited, 0 vulnerabilities.
- `npm test`: passed — 9 tests in 2 files.
- `npm run build`: passed and produced `dist/`.
- Production payloads: JS 27.39 KB raw / 9.71 KB gzip; CSS 15.58 KB raw /
  4.37 KB gzip; hero AVIF 19.81 KB. Initial JS is below the 200 KB budget.
- Local Playwright at 1440px exercised 3→8 participants, blank-name and
  invalid-duration validation, start, keyboard Space turn change, P
  pause/resume, reverse, mark-out, reset confirmation, malformed-import error,
  nudge, timeout/pause, and saved-game reload. Fischer increment produced
  0:06 after about one second from a 5-second bank with +3 increment; fixed
  per-turn began the next player at 0:05.0.
- A background-tab check advanced 0:00.4 to 0:01.8 after returning to the
  running tab, showing timestamp-based catch-up rather than timer drift.
- Service-worker controlled offline reload succeeded locally and on the live
  host. Both displayed the setup clock while network emulation was offline.
- At 390×844 the document and body widths were both 390px (no horizontal
  overflow); the deliberate small-phone illustration drop was active.
- Reduced-motion browser emulation gave the running clock `transition-duration`
  and `animation-duration` of `1e-05s` (the authored `.01ms` reduction rule).
- Axe serious/critical findings: 0 on setup, running clock, and privacy.
  Local and initial live loads had no console or page errors.
- Lighthouse mobile against local production preview: Performance 91,
  Accessibility 100, Best Practices 100, SEO 100; LCP 1.6 s, CLS 0.
- Privacy and terms routes have titles, `lang`, one h1/main, and the stated
  local-first/no-analytics content. Runtime inspection found no third-party
  font/script requests.

## Live headers and error-state evidence

- `/`, hashed JS/CSS, `sw.js`, `/privacy/`, and `/terms/` returned HTTP 200.
- HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and
  `X-Content-Type-Options: nosniff` are present.
- Hashed asset cache header was exactly
  `cache-control: public, must-revalidate, max-age=30`; it is not immutable and
  does not supply the required long-lived static-asset caching.
- The valid-room error state is clear and preserves the local clock, but the
  503 and resulting console error prove cross-device room sync is not deployed.

## Required remediation before a PASS

1. Configure immutable, long-lived caching for fingerprinted `/assets/*` (for
   example `public, max-age=31536000, immutable`), while retaining short
   revalidation for HTML and the service worker.
2. Deploy an ephemeral WebSocket room relay and configure `VITE_SYNC_URL`, or
   explicitly remove multi-device room sync from the product contract and UI.
3. Implement and test the documented setup arrow-key reorder shortcut.

