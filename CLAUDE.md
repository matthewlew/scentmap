# Scentmap — Developer Guide for Claude

This file describes the development workflow and conventions for the Scentmap project. **Follow these instructions on every session.**

**Component inventory, token rules, and the pre-PR checklist are in [`DESIGN.md`](./DESIGN.md). Read it before modifying any UI. Live component demos are in [`designsystem.html`](./designsystem.html).**

---

## Project structure

```
index.html          HTML structure only (~180 lines, no inline JS)
js/
  app.js            All application logic (~5,000 lines)
styles/
  design-system.css Design tokens (colors, spacing, typography, breakpoints)
  components.css    Component styles
  layout.css        Layout and panel styles
  responsive.css    Responsive design overrides
data/
  roles.json        8 fragrance roles (id, name, sym, desc)
  notes.json        Note reference index (177 entries)
  scents-index.json Brand list used to fan out scent fetches
  scents/
    byredo.json     Per-brand fragrance arrays (183 total across all brands)
    diptyque.json
    ...
CHANGELOG.md        Feature log — updated on every commit
CLAUDE.md           This file
.claude/
  launch.json       Dev server config (Ruby WEBrick on port 3001)
```

---

## Dev server

The preview server serves from `/tmp/scentmap-copy/` on port 3001.

**Sync after every edit before testing:**
```bash
cp /Users/matthewlewair/Documents/scentmap/index.html /tmp/scentmap-copy/index.html
cp -r /Users/matthewlewair/Documents/scentmap/styles /tmp/scentmap-copy/
cp -r /Users/matthewlewair/Documents/scentmap/js /tmp/scentmap-copy/
cp -r /Users/matthewlewair/Documents/scentmap/app /tmp/scentmap-copy/
cp -r /Users/matthewlewair/Documents/scentmap/quiz /tmp/scentmap-copy/
cp -r /Users/matthewlewair/Documents/scentmap/compare /tmp/scentmap-copy/
```

**Cache-bust the browser after syncing:**
```
http://localhost:3001/?v=<timestamp>
```

Use `preview_eval` with `location.href = 'http://localhost:3001/?v=' + Date.now()` to force a fresh load.

---

## Commit workflow

**Every commit must include a CHANGELOG.md update.** No exceptions.

1. Make and test changes in `index.html`, `js/app.js`, and/or `styles/`
2. Sync to dev server using the full sync command in the **Dev server** section above
3. Cache-bust and verify in preview (screenshot + functional checks)
4. **Update `CHANGELOG.md`** — add entries under a dated `## YYYY-MM-DD` section:
   - `### Added` for new features
   - `### Changed` for behaviour/visual changes
   - `### Fixed` for bug fixes
5. Commit changed files (`index.html`, `js/app.js`, `styles/*`, `CHANGELOG.md`)

---

## Architecture notes

- **HTML + JS + CSS separated** — `index.html` is HTML structure only (~180 lines). All JS is in `js/app.js`. All styling is in `styles/` organized by concern (design system, components, layout, responsive).
- **CSS organization** — See "CSS conventions" below for design tokens. Use semantic variables instead of hard-coded values. Consolidate duplicate rules using CSS custom properties.
- **Data is fetched from JSON** — on startup, `js/app.js` fetches `data/roles.json`, `data/notes.json`, and per-brand files from `data/scents/` (via `data/scents-index.json`). `f.top`, `f.mid`, `f.base` are comma-separated strings; split them with `.split(',').map(s=>s.trim())` when you need arrays.
- **Sheet stack** — mobile bottom sheets use `pushSheet(renderFn)` / `popSheet()` / `closeAllSheets()`. First sheet slides up from bottom; subsequent (sub-nav) sheets get class `.nav` and slide in from the right.
- **Desktop detail panel** — `pushDesktopDetail(renderFn)` / `openDesktopDetail(renderFn)` / `closeDesktopDetail()`. Use `_renderDeskDetail(true)` to animate on push.
- **Nav** — `go(id, btn)` for desktop tab navigation; `goMobile(id, btn)` for mobile bottom nav. Both activate the corresponding `#p-{id}` panel.
- **Catalog controls** — `initCatalogControls()` must be called once during init (after data loads) to wire up All/Owned/Wishlist tabs and the search input. State is tracked in `CAT_STATE_FILTER` and `CAT_ROLE_FILTER`.
- **State** — Fragrance state (owned/wishlist) is tracked in `ST{}` via `gst(id)` / `setState(id, s)` / `cycleState(id)`. Role assignments in `RA{}`. Persisted to `localStorage` keys: `sm_owned`, `sm_wish`, `sm_roles`.
- **go() tab selector** — the `.tab` deactivation selector excludes `.dc-state-wrap .tab`, `.picker-row .tab`, and `.cat-state-bar .tab` to avoid clearing filter UI on nav.

---

## CSS conventions

Full token reference, component inventory, and pre-PR checklist are in **[`DESIGN.md`](./DESIGN.md)** — read it before modifying any UI. Live demos: **[`designsystem.html`](./designsystem.html)**.

**Hard rules (enforced on every change):**
- Use CSS custom properties only — no hard-coded colors, sizes, or timing values
- No raw `rgba()` — use overlay/transparency tokens from `design-system.css`
- Never `outline: none` on a base style — only in `:focus-visible` overrides where border-based focus replaces the ring
- All dimensions on the 4px grid (`--sp-*` scale)
