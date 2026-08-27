# Tableclock

Tableclock is a free, installable turn timer for two to eight people around a board-game table. It handles count-up, shared-style time banks, Fischer increments, and fresh per-turn limits. It is intentionally not a scorekeeper or play log.

The app is designed for families and groups who need turns to keep moving without depending on an app-store timer that may disappear. It works on one phone, persists an unfinished game locally, and keeps working offline after the first load. A room relay can be configured to mirror the clock across phones; sync is never required for the local clock.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Vite prints the local URL. To exercise install/offline behavior, make a production build and serve it:

```sh
npm run build
npm run preview
```

The exact production build command is `npm run build`. Its static output is `dist/`, with `dist/index.html` at the root.

## Test

```sh
npm test
npm run build
```

The unit suite covers elapsed-time accounting, pause/resume, increments, reverse order, skipped/out players, and time formatting.

## Optional room relay

Set `VITE_SYNC_URL` at build time to a WebSocket endpoint. The browser protocol is intentionally small:

- Client → relay: `{type:"join", room, clientId, state}` or `{type:"state", room, clientId, state}`.
- Relay → clients in that room: `{type:"state", state}`.

The relay should keep room state in memory only, use its own receipt timestamp for ordering, cap messages and rooms, and expire inactive rooms. When no relay is configured, Tableclock tries the same-origin `/sync` path, reports a clear error if unavailable, and continues locally. Tabs on the same device also mirror through `BroadcastChannel`.

## Privacy and ownership

Player names, preferences, and the current clock are stored in IndexedDB on the device. There are no accounts, analytics, third-party fonts, runtime CDNs, or payment code. Setup JSON export/import and URL-encoded presets keep users in control of their data.

The dithered setup illustration was generated specifically for this project; its prompt and provenance are in `.factory/design.md` and `assets/src/`. All runtime assets ship from this repository.

## Deploy

Publish `dist/` to any static host. Configure SPA fallbacks to `index.html` for app navigation; standalone `/privacy/` and `/terms/` documents are included as direct-load fallbacks. HTTPS is required for service workers, install prompts, wake lock, and production WebSockets.

Licensed under the MIT License.
