# Independent verification 4 — PASS

Date: 2026-08-27
Work order: `tableclock-verify-4`
Candidate commit: `84df163ce15bf49aa9526715927c0f620bb89d74` (`84df163`)
Deployment: https://tableclock.sociobot.in

## Verdict

**PASS.** This fresh, independent audit found the deployed static artifact to
be byte-identical to a clean production build of the candidate. The complete
local-first turn-clock flow works on desktop and 390px mobile, including all
four timing modes, validation/recovery, keyboard controls, persistence, and
offline reload. No P0–P3 defects were found.

Cross-device rooms are deliberately not shipped in this local-first release.
The README, setup/running UI, privacy page, and terms say so consistently;
the researched brief calls the room feature optional, so this is not treated
as a defect.

## Clean checkout and quality gates

Started at the requested commit with a clean worktree. Commands run:

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

- `npm ci` passed: 59 packages audited, 0 vulnerabilities.
- `npm test` passed: 8 files, 28 tests.
- `npm run build` passed (`tsc --noEmit && vite build`) and created `dist/`.
  There is no separate lint script; the build contains the repository's
  available TypeScript check.
- `npm run test:e2e` passed: all 3 Chromium production-browser tests. The
  initial attempt correctly reported the container's missing browser binary;
  after the documented Playwright browser install, all tests passed.
- Output budget: initial JS is 27,815 bytes raw / 9,680 bytes gzip and CSS is
  15,318 bytes raw / 4,320 bytes gzip. Both are well below the 200 KB JS and
  50 KB CSS static-product limits. The largest shipped setup art is 36,852
  bytes WebP (27,815 bytes AVIF).
- Fresh mobile Lighthouse 13.4.1 against production scored **100** for
  Performance, Accessibility, Best Practices, and SEO; LCP 989 ms, TBT 0 ms,
  CLS 0.0114, and 66,201 bytes transferred.

## Product and browser evidence

Independent Playwright runs covered both the exact local production preview
and the deployed HTTPS URL.

- Desktop (1440×900): added from 3 to the 8-player boundary and confirmed
  Add player disables; blank name and a four-second duration are rejected with
  specific recovery copy, then a corrected setup starts. Invalid JSON import
  is rejected without losing the usable setup. A generated share preset opens
  as a clean setup in another browser context.
- Core clock: count-up advanced to `0:00.3`; five-second bank decremented to
  `0:04.7`; Fischer (5 s + 3 s) returned the completed player to `0:07`; fixed
  per-turn started the next player with a fresh approximately five seconds.
  Five-second expiry paused the clock and announced the actionable out-of-time
  state. Reverse and Mark out work, and an unfinished game restored after
  reload.
- Keyboard: the first Tab exposes a visible skip link; Space advances the
  focused running clock; ArrowRight scrolls the named player region; setup
  reordering and native dialog controls remain keyboard-operable. No keyboard
  test produced a console or page error.
- Mobile (390×844): setup and running pages remained exactly 390px wide;
  the four-player strip intentionally overflows, is focusable, and ArrowRight
  scrolls it (26px observed). Reduced-motion emulation yielded no active
  animation in the setup view and the authored reduced-motion rule applies to
  transitions/animations. Axe found zero serious or critical findings on
  desktop and mobile running views.
- PWA: manifest has standalone display, 192/512/maskable icons, matching
  colors, and a versioned start URL. On the live HTTPS deployment the page
  became service-worker controlled; after `context.setOffline(true)`, reload
  rendered the cached clock successfully. The worker uses a versioned cache,
  `skipWaiting`, `clientsClaim`, navigation fallback, and the app has an
  `updatefound` listener that announces a ready update.

## Deployment identity, privacy, and policies

The freshly generated and live SHA-256 values match for every sampled
artifact:

| Path | SHA-256 |
| --- | --- |
| `/` / `dist/index.html` | `e73ea58de073f76910d71520693d6fd63d95ec526317f82c3649d033e7ea4fed` |
| `/assets/index-DL7KfkuC.js` | `5edb96ffa8c070bac90b569d8a23a768525fbe3ba0a78d23dae5eefcee9eab13` |
| `/assets/index-u62NYBUo.css` | `856d1ebc94b217277808a1d3dde9dfe4c617a2be859d9fcfe017d5d9bcf60589` |
| `/sw.js` | `2fde4da1a1a42e6f73148652905980066169d8e3c62202dc9830bc5b279e3c0f` |
| `/manifest.webmanifest` | `21ca41d9df1c9ec30a260f91dabb8c64c180cc355000b95d740258c6b72331d7` |
| `/offline.html` | `c040fd61a2cdb05155d9b0d17ed7da9da54cc5f93ea7d6a1f4f53102dd610a41` |

- Live `/`, JS, CSS, service worker, manifest, offline page, privacy, and
  terms returned 200. Privacy/terms direct pages are present and accurately
  disclose IndexedDB-only player/setup/current-clock storage, no accounts,
  tracking, analytics, CDN assets, or sync.
- Browser request capture on local and live runs observed only the respective
  same origin. Source/runtime review found no analytics, ads, payment code,
  third-party fonts/scripts, WebSocket, or sync relay client.
- Live headers include HTTPS/HSTS, `Referrer-Policy: same-origin`,
  `X-Content-Type-Options: nosniff`, CSP with self-only resources and
  `frame-ancestors 'none'`, `X-Frame-Options: DENY`, and a restrictive
  Permissions-Policy. Manifest content type is `application/manifest+json`.
  HTML and `sw.js` revalidate (`max-age=0, must-revalidate`); fingerprinted
  assets are one-year immutable (`max-age=31536000, immutable`).
- Document semantics pass: `lang`, title, one h1, main landmark, descriptive
  image alt, labels, focus styling, and no zoom restriction. No browser
  console/page errors were observed during the audited live flows.

## Defects

None found (P0–P3).
