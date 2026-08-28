# Tableclock

Tableclock is a turn timer for two to eight players around a board-game table. It runs on one shared phone. Cross-phone sync is not included.

Try the isolated sample at `/demo`. It starts a running four-player game. Demo data uses its own browser database, so it cannot change real games. After the first visit, the demo works without a connection.

## Run locally

Use Node.js 20 or newer.

```sh
npm ci
npm run dev
```

The development server prints a local URL. Build the deployable PWA with:

```sh
npm run build
npm run preview
```

The static deploy output is `dist/`, with `dist/index.html` at its root.

## Test

```sh
npm test
npm run build
npm run test:e2e
```

Run each visitor-facing claim from a clean browser context with the commands in `.factory/claims.json`. The browser suite includes keyboard, mobile, route, accessibility, privacy, and offline checks.

## Data and privacy

Player names stay in this browser. The app sends no requests to other sites. A setup link includes player names and clock rules without uploading them.

See [the demo notes](.factory/demo.md), [Privacy](/privacy), and [Terms](/terms). The original Tableclock artwork and its generation record are in `.factory/design.md` and `assets/src/`.

## Deploy

Publish `dist/` to the static work-order target. `staticwebapp.config.json` ships the cache and security-header policy.

Licensed under the MIT License.
