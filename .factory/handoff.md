# Tableclock repair handoff — PASS

Date: 2026-08-27
Work order: `tableclock-repair-3`
Base reviewed: `42e5a0a78f0ca4a325b219c12502fa73760dea81`
Deployment: https://tableclock.sociobot.in (Azure Static Web Apps, Standard)

## What changed

- Made the mobile running `.player-strip` a named, keyboard-focusable region. Left/Right Arrow scrolls it without taking over Space/Enter or `P` timer controls. The 390px Axe `scrollable-region-focusable` finding is gone.
- Added a single validation boundary for JSON imports, URL presets, setup starts, and restored IndexedDB state. Modes must be one of the four supported values; duration is a finite whole number from 5–86,400 seconds; increment and nudge are finite whole numbers from 0–3,600 seconds; names are non-empty strings of at most 24 characters. Corrupt state is discarded rather than rendered, and time formatting has a finite-value fallback.
- Added production regression coverage for the exact 1440×900 desktop keyboard flow and 390×844 running/out-player strip, including Axe serious/critical assertions. The PWA service-worker offline reload is also covered.
- Added Static Web Apps CSP, `frame-ancestors 'none'`, `X-Frame-Options: DENY`, restrictive Permissions-Policy, and the `.webmanifest` `application/manifest+json` MIME mapping.

## Verification

Clean verification was run after `npm ci`:

```sh
npm test
npm run build
npm run test:e2e
```

- Unit suite: **28 tests passed**.
- Production build: passed; `dist/` created. Initial JS is **27.82 kB raw / 9.68 kB gzip** and CSS is **15.32 kB raw / 4.32 kB gzip**.
- Browser suite: **3 passed**. At desktop it verifies Space ends a turn and the player grid does not scroll. At 390px it verifies the region has horizontal overflow, focuses it, scrolls with ArrowRight, marks a player out, keeps the Space timer flow, and returns zero serious/critical Axe violations. It also reloads the service-worker-controlled app offline.
- The same browser suite passed against the deployed URL. `/opt/fleet/lib/verify-url.sh` passed against production: HTTP 200, title/lang/h1/main/alt checks, and zero console/page errors (753 ms load in that smoke run).
- Live response checks confirm CSP, Permissions-Policy, `X-Frame-Options: DENY`, and `Content-Type: application/manifest+json` for `/manifest.webmanifest`.

## Run and deploy

```sh
npm ci
npm run build
npm run preview
npm test
npm run test:e2e
```

Install the browser once for the browser suite with `npx playwright install chromium` before running `npm run test:e2e`. Deploy `dist/` as an Azure Static Web Apps Standard static artifact; `public/staticwebapp.config.json` is copied into `dist/` by Vite.

## Known gaps / next steps

No release blockers found. Cross-phone sync remains intentionally out of scope; the app is local-first and its privacy/terms pages state that clearly.
