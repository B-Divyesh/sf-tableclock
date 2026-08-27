# Tableclock

Tableclock is a free, installable turn timer for two to eight people around a board-game table. It handles count-up, shared-style time banks, Fischer increments, and fresh per-turn limits. It is intentionally not a scorekeeper or play log.

The app is designed for families and groups who need turns to keep moving without depending on an app-store timer that may disappear. It works on one shared phone, persists an unfinished game locally, and keeps working offline after the first load. Cross-phone sync is not included in this release.

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
npm run test:e2e
```

The unit suite covers elapsed-time accounting, pause/resume, increments, reverse order, skipped/out players, time formatting, and malformed setup/preset rejection. The production-browser suite exercises the 1440px desktop keyboard timer flow, the 390px scrollable player strip with Axe, and an offline service-worker reload. Install Chromium once with `npx playwright install chromium` before running `npm run test:e2e`.

## Player order keyboard shortcut

In setup, focus a player-name field and press Arrow Up or Arrow Down to move that player one place in the turn order. Focus stays on that player field after the move, while Tab continues through the normal controls. The adjacent move buttons provide the same action for pointer and keyboard users.

## Privacy and ownership

Player names, preferences, and the current clock are stored in IndexedDB on the device. There are no accounts, analytics, third-party fonts, runtime CDNs, or payment code. Setup JSON export/import and URL-encoded presets keep users in control of their data.

The dithered setup illustration was generated specifically for this project; its prompt and provenance are in `.factory/design.md` and `assets/src/`. All runtime assets ship from this repository.

## Deploy

Publish `dist/` to Azure Static Web Apps. The generated build root includes `staticwebapp.config.json`: fingerprinted `/assets/*` use one-year immutable caching, while HTML and `sw.js` revalidate. Standalone `/privacy/` and `/terms/` documents are included as direct-load fallbacks. HTTPS is required for service workers, install prompts, and wake lock.

Licensed under the MIT License.
