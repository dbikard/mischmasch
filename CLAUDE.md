# CLAUDE.md

## Project overview

MischMasch is a German-French vocabulary flashcard PWA deployed on GitHub Pages.

## Architecture

- **No build step**: single `index.html` with React 18 + Babel standalone from CDN
- **Storage**: localStorage under key `vocab-de-fr`
- **PWA**: manifest.json + service-worker.js (cache-first strategy)
- **Icons**: static PNGs generated with Python PIL (not part of the app)

## Key files

- `index.html` — entire app (React components, CSS, logic)
- `manifest.json` — PWA manifest
- `service-worker.js` — offline caching (bump `CACHE_NAME` version to invalidate)
- `icon-192.png` / `icon-512.png` — app icons

## Development

Open `index.html` directly in a browser or serve with `python3 -m http.server`.
Service worker requires HTTPS or localhost to register.

## Deployment

Push to `master` branch. GitHub Pages serves from root of `master`.
