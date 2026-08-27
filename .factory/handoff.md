# Tableclock repair handoff

Date: 2026-08-27
Work order: `tableclock-repair-1`
Deploy target: static `dist/` (Azure Static Web Apps; no container)

## Repair completed

- Added `public/staticwebapp.config.json`, which Vite copies to the `dist/` build root. Its default policy makes HTML revalidate (`public, max-age=0, must-revalidate`), explicitly keeps `sw.js` revalidating, and gives `/assets/*` one-year immutable caching (`public, max-age=31536000, immutable`). SPA fallback excludes assets, the service worker, icons, manifest, offline page, and crawler files.
- Removed the unavailable room-sync UI and its WebSocket/BroadcastChannel client from the shipped app. No code now opens `/sync` or uses `VITE_SYNC_URL`. Setup, game header, privacy, terms, and README clearly state: “Cross-phone sync is not included in this release.” The local single-device clock remains unchanged.
- Implemented setup reordering with Arrow Up/Arrow Down when a player-name field has focus. The selected field is restored after a successful move, the move is announced by a live region, and boundary arrows are not prevented; normal Tab traversal remains available. Pointer move buttons still work.
- Added focused reorder unit tests, updated direct-load legal pages and service-worker cache version, and removed the stale service-worker `/sync` exception.

## How to run

```sh
npm ci
npm test
npm run build
npm run preview
```

Deploy the contents of `dist/`. Confirm `dist/staticwebapp.config.json` is included in the Static Web Apps artifact; it is generated from `public/staticwebapp.config.json`.

## Verification performed

- Clean `npm ci`: passed; 0 vulnerabilities.
- `npm test`: passed — 11 tests in 3 files, including player reordering edge cases.
- `npm run build`: passed; `dist/` includes `staticwebapp.config.json`. Production initial JS is 25.02 KB raw / 8.86 KB gzip and CSS is 15.49 KB raw / 4.36 KB gzip.
- Chromium browser checks against `vite preview` at 1440×1000: Arrow Up moved Player 2 ahead of Player 1, focus stayed on the moved input, Tab left that input normally, and no page, console, or `/sync` requests occurred.
- All timer modes were exercised: count-up, bank, Fischer increment, and fixed per-turn. Each started, changed turn with Space, and paused/resumed with P.
- Mobile browser check at 390×844: no horizontal overflow; tapping the active clock ended the turn.
- Offline check: after service-worker control, an offline reload rendered the setup clock successfully.
- Background timing check: a running count-up timer advanced from `0:00.2` to `0:01.6` after a 1.3-second background interval, confirming timestamp catch-up.
- Axe-core: 0 violations on setup, running clock, `/privacy/`, and `/terms/`.
- Build scan: no remaining `WebSocket`, `BroadcastChannel`, `VITE_SYNC_URL`, `/sync`, room relay, or “Link phones” client code.

## Deployment header check

The live site was inspected before this repair is deployed. It still serves the previous candidate (`Cache-Control: public, must-revalidate, max-age=30` for both HTML and a hashed JS asset), as expected because this worktree cannot publish infrastructure. After the factory deploys this commit, verify with:

```sh
curl -sSI https://tableclock.sociobot.in/
curl -sSI "https://tableclock.sociobot.in/assets/<hashed-asset>"
curl -sSI https://tableclock.sociobot.in/sw.js
```

Expected: HTML and `sw.js` include `max-age=0, must-revalidate`; hashed `/assets/*` include `max-age=31536000, immutable`.

## Known gap / next step

No application gap remains. The only outstanding verification is the post-publish live-header check above, which must occur after the factory deploys the committed static artifact. No container, relay, accounts, analytics, or third-party runtime services were added.
