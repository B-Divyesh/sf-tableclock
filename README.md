# Tableclock

Tableclock is a turn timer for two to eight players around a board-game table. Everyone uses one shared phone.

[Try it with sample data](https://tableclock.sociobot.in/demo). The isolated demo starts a running four-player game. It cannot read or change real games.

Choose Count up, Time bank, Bank with increment, or Per-turn limit. Tap the active field to start the next player’s turn. Tableclock does not track scores. It does not connect phones.

## Run locally

Development requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

The development server prints a local URL. Build the deployable PWA with:

```sh
npm run build
npm run preview
```

The static output is `dist/`, with `dist/index.html` at its root.

## Test

```sh
npm test
npm run build
npm run test:e2e
```

Run each visitor-facing claim from a clean browser context with the commands in `.factory/claims.json`. The browser suite includes keyboard, mobile, route, accessibility, privacy, and offline checks.

In setup, focus a player’s name. Press Arrow Up or Arrow Down to move that player. Focus stays on the moved field. The adjacent buttons perform the same moves.

## Data and privacy

Player names, preferences, and unfinished clocks stay in this browser. The app sends no game data to another origin.

Export a setup file, import it later, or create a setup link. Setup links keep names and rules in the URL fragment, which browsers do not send to the server.

See [the demo notes](.factory/demo.md), [Privacy](https://tableclock.sociobot.in/privacy), and [Terms](https://tableclock.sociobot.in/terms).

## Deploy

Publish `dist/` to the static work-order target. The included host configuration sets cache, route, 404, MIME, and security-header policies.

Licensed under the MIT License.
