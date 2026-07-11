# CLAUDE.md

## Project overview

MischMasch is a German-French vocabulary flashcard PWA deployed on GitHub Pages.

## Architecture

- **No build step**: `index.html` with React 18 + Babel standalone from CDN
- **Core** (`index.html`): shared helpers, CSS, the primary views (Home, Add,
  Practice, Stats), the Übungen hub, and the `window.MischMasch` runtime
- **Practice modules** (`modules/*.js`): each grammar exercise is a
  self-contained `type="text/babel"` file that pulls shared helpers off
  `window.MischMasch` and calls `register({ id, icon, label, component })`.
  They load as `<script>` tags *after* the core script and self-register;
  the bottom nav stays fixed while the Übungen hub grows automatically
- **Storage**: localStorage under key `vocab-de-fr`; per-module progress
  under `vocab-de-fr-<id>-stats`
- **PWA**: manifest.json + service-worker.js (cache-first strategy)
- **Icons**: static PNGs generated with Python PIL (not part of the app)

## Key files

- `index.html` — core app: shared runtime, CSS, primary views, module registry
- `modules/<id>.js` — one self-registering practice module each
  (copy `modules/time.js` as the template)
- `words/*.tsv` + `words/index.json` — vocabulary categories
- `manifest.json` — PWA manifest
- `service-worker.js` — offline caching (list new files in `ASSETS` and bump
  `CACHE_NAME` to invalidate)
- `icon-192.png` / `icon-512.png` — app icons

## Adding a practice module

1. Create `modules/<id>.js` (template: `modules/time.js`) — an IIFE that
   destructures what it needs from `window.MischMasch`, defines the view, and
   calls `register(...)` at the end.
2. Add `<script type="text/babel" src="./modules/<id>.js">` after the core
   script in `index.html`.
3. List the file in `service-worker.js` `ASSETS` and bump `CACHE_NAME`.

No core UI changes are needed — the Übungen hub card, nav highlighting, and
routing all derive from the registry.

### Joining Auto-Mode (optional)

Add an `sr` object to the `register(...)` call to opt a module into the
unified spaced-repetition Auto-Modus:

```
register({ id, icon, label, component, sr: {
  items: () => ["<id>:foo", "<id>:bar"],     // schedulable skill ids
  generateRound: (itemId) => ({ kind, ... }) // a declarative round spec
}})
```

`generateRound` returns a spec of `kind` `"typed"`, `"choice"`, or `"tokens"`
(see the presenters in `index.html`). The core scheduler (`srOverdue`, due-date
Leitner) picks the most-overdue item across all modules + vocabulary, records
per-item stats under `vocab-de-fr-sr`, and renders the spec. Modules stay pure
— no persistence or scheduling of their own.

## Development

Open `index.html` directly in a browser or serve with `python3 -m http.server`.
Service worker requires HTTPS or localhost to register.

## Deployment

Push to `master` branch. GitHub Pages serves from root of `master`.
