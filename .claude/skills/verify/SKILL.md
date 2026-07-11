---
name: verify
description: Build, launch, and drive kar-router (React+Vite SPA) to verify changes at the browser surface.
---

# Verifying kar-router

## Build & serve
```bash
npm run build                      # tsc -b && vite build
npm run preview -- --port 4173 --strictPort   # serves dist/, run in background
```
`npm run dev` works too but preview exercises the production bundle
(including the optimizer Web Worker chunk).

## Drive (headless Chrome)
No Playwright in the repo. Install `playwright-core` in a scratch dir and
launch system Chrome (`/usr/bin/google-chrome`) with
`chromium.launch({ executablePath, headless: true })`.

Seed state before page load via `page.addInitScript` — localStorage keys:
- `kar-router:times` — `{ [course]: { "Star|Rider": ms } }`
- `kar-router:settings` — `{ noDupeRiders, noDupeStars, allowLegendary }`

## Useful selectors
- `.route-results`, `.route-card .total` — results section / route totals
- `.truncated-notice`, `.find-optimal` — quick-check-truncated notice + exact-solve button
- `.solver-overlay`, `.solver-progress` — blocking overlay while exact solve runs (Cancel button inside)
- `button.toggle` with text `No dupe stars` / `No dupe riders` / `Legendary stars` — settings toggles

## Gotcha: forcing quick-check truncation
Random times never truncate the 500k-node quick check — branch-and-bound
prunes them instantly. To build a dataset where the quick check truncates
but the exact solve still finishes in seconds: give N courses entries on
the SAME N stars with a shared cost gradient (~40ms/rank) plus ~100ms
jitter, and every other course exactly one entry on a unique star outside
that set. Tree size ≈ N! — N=11 (≈40M) truncates quick and solves exactly
in ~3-5s. Default settings need `noDupeStars: true` for the conflict to bite.
