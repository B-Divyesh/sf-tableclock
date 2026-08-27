# Tableclock v1 handoff

## Independent verification status — **FAIL**

Verified on 2026-08-27 against commit
`c1b91148f240dd4a709a2da46eee251f844862a0` and
`https://tableclock.sociobot.in`. The live bytes match this candidate, but it
is **not approved for handoff**: hashed assets have only `max-age=30` caching
(not immutable), and the multi-phone room endpoint returns HTTP 503. See
[`verification.md`](./verification.md) for exact commands, hashes, passed
functional coverage, and remediation. No product code was changed during this
verification.

Date: 2026-08-27

Work order: `tableclock-build-1`

Deploy target: static `dist/`

## What shipped

- A responsive two-to-eight-player clock with count-up, time-bank, Fischer-increment, and fixed-per-turn modes.
- Large table-readable active-player surface; tap/Space/Enter to end a turn; P to pause; explicit pause, reverse, and out/back-in controls.
- Per-player cumulative time, wall-clock-based drift resistance, timeout handling, optional AP nudge, local audio cues, vibration, and best-effort screen wake lock.
- IndexedDB persistence for setup and an unfinished running game, including correct elapsed time after a refresh or sleeping display.
- Shareable URL presets plus JSON export/import. No accounts, analytics, or third-party runtime requests.
- Optional four-letter room UI, same-device `BroadcastChannel` mirroring, and a small last-write-wins WebSocket relay protocol configured with `VITE_SYNC_URL`.
- Installable PWA manifest, original maskable/standard icons, a versioned service worker, first-load app-shell precaching, offline navigation fallback, and update feedback.
- Direct-load `/privacy/` and `/terms/` pages, README, MIT license, robots/sitemap/llms metadata, and a product-specific design record.
- Original generated halftone table illustration in AVIF (20 KB) and WebP (36 KB), with source and generation provenance in `assets/src/` and `.factory/design.md`.

## Verification

- Clean install: `npm ci` — passed, 0 vulnerabilities.
- Unit tests: `npm test` — 9 passed across 2 files.
- Production build: `npm run build` — passed; `dist/index.html` is present.
- Initial production assets: JS 27.39 KB raw / 9.71 KB gzip; CSS 15.58 KB raw / 4.37 KB gzip; hero AVIF 19.81 KB.
- Playwright at 390 × 844: setup → start → run → end turn passed; keyboard Space advanced the turn; active player survived online reload; offline navigation restored the running clock under service-worker control; no page or console errors.
- Axe scans: setup, running clock, privacy, and terms — 0 violations.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.6 s, TBT 60 ms, CLS 0.
- Desktop visual check at 1440 × 1000 and mobile visual checks at 390 × 844 showed no horizontal overflow.

## Run and deploy

```sh
npm ci
npm test
npm run build
npm run preview
```

Publish the contents of `dist/`. Configure the host to fall back to `index.html` for unknown app routes. HTTPS is required for install, service workers, wake lock, and secure WebSockets.

## Known gaps and next steps

- The requested deployment class is static, so this repository cannot itself host a cross-device WebSocket relay. The client and documented protocol are complete, but production multi-phone rooms require the factory to provide an ephemeral relay and set `VITE_SYNC_URL`; without it, the app clearly reports that room sync is unavailable and the local/offline timer remains fully functional.
- iOS can suspend browser work when the screen is locked despite wake lock. The engine derives display time from timestamps, so it catches up accurately when foregrounded, but a cue cannot sound while the OS has suspended the page.
- No payment path was added because the brief explicitly defines v1 as free.
