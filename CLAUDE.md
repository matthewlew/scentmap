# Scentmap — Developer Guide for Claude

This file describes the development workflow and conventions for the Scentmap project. **Follow these instructions on every session.**

---

## Project structure

```
index.html          HTML structure and inline JS
styles/
  design-system.css Design tokens (colors, spacing, typography, breakpoints)
  components.css    Component styles
  layout.css        Layout and panel styles
  responsive.css    Responsive design overrides
data/
  roles.json        8 fragrance roles (id, name, sym, desc)
  notes.json        Note reference index (~96 entries)
  scents-index.json Brand list used to fan out scent fetches
  scents/
    byredo.json     Per-brand fragrance arrays
    diptyque.json
    ...
CHANGELOG.md        Feature log — updated on every commit
CLAUDE.md           This file
.claude/
  launch.json       Dev server config (Ruby WEBrick on port 3000)
```

---

## Dev server

The preview server serves from `/tmp/scentmap-copy/` on port 3000.

**Sync after every edit before testing:**
```bash
cp /Users/matthewlewair/Documents/scentmap/index.html /tmp/scentmap-copy/index.html
cp -r /Users/matthewlewair/Documents/scentmap/styles /tmp/scentmap-copy/
```

**Cache-bust the browser after syncing:**
```
http://localhost:3000/?v=<timestamp>
```

Use `preview_eval` with `location.href = 'http://localhost:3000/?v=' + Date.now()` to force a fresh load.

---

## Commit workflow

**Every commit must include a CHANGELOG.md update.** No exceptions.

1. Make and test changes in `index.html` and/or `styles/`
2. Sync to dev server:
   ```bash
   cp /Users/matthewlewair/Documents/scentmap/index.html /tmp/scentmap-copy/index.html
   cp -r /Users/matthewlewair/Documents/scentmap/styles /tmp/scentmap-copy/
   ```
3. Cache-bust and verify in preview (screenshot + functional checks)
4. **Update `CHANGELOG.md`** — add entries under a dated `## YYYY-MM-DD` section:
   - `### Added` for new features
   - `### Changed` for behaviour/visual changes
   - `### Fixed` for bug fixes
5. Commit changed files (`index.html`, `styles/*`, `CHANGELOG.md`)

---

## Architecture notes

- **HTML + separate CSS** — `index.html` contains HTML structure and inline JS. All styling is in `styles/` directory organized by concern (design system, components, layout, responsive).
- **CSS organization** — See "CSS conventions" below for design tokens. Use semantic variables instead of hard-coded values. Consolidate duplicate rules using CSS custom properties.
- **Data is arrays** — `f.top`, `f.mid`, `f.base` in scent objects are string arrays, not comma-separated strings. Use `(f.top||[]).forEach(...)` not `.split(',')`.
- **Sheet stack** — mobile bottom sheets use `pushSheet(renderFn)` / `popSheet()` / `closeAllSheets()`. First sheet slides up from bottom; subsequent (sub-nav) sheets get class `.nav` and slide in from the right.
- **Desktop detail panel** — `pushDesktopDetail(renderFn)` / `openDesktopDetail(renderFn)` / `closeDesktopDetail()`. Use `_renderDeskDetail(true)` to animate on push.
- **Nav** — `go(id, btn)` for desktop tab navigation; `goMobile(id, btn)` for mobile bottom nav. Both activate the corresponding `#p-{id}` panel.
- **Catalog controls** — `initCatalogControls()` must be called once during init (after data loads) to wire up All/Owned/Wishlist tabs and the search input. State is tracked in `CAT_STATE_FILTER` and `CAT_ROLE_FILTER`.
- **Persistence** — `localStorage` keys: `sm_owned` (owned set), `sm_wish` (wishlist set), `sm_roles` (role assignments), `sm_onboarded` (onboarding flag).
- **go() tab selector** — the `.tab` deactivation selector excludes `.dc-state-wrap .tab`, `.picker-row .tab`, and `.cat-state-bar .tab` to avoid clearing filter UI on nav.

---

## CSS conventions

**Design tokens (in `styles/design-system.css`):**
- Palette variables: `--paper`, `--ink`, `--stone`, `--black`, `--g700`…`--g100`, `--resin`, `--wish`
- Family colors: `--fam-woody`, `--fam-floral`, etc.
- Spacing scale: 4px grid (`--sp-xs`, `--sp-sm`, `--sp-md`, `--sp-lg`, etc.)
- Typography: `--font-serif`, `--font-sans`, with semantic sizes (`--text-sm`, `--text-md`, `--text-lg`)
- Transitions: `--ease-spring: cubic-bezier(.16,1,.3,1)` at `--dur-sm` (0.28s), `--dur-md` (0.36s), `--dur-lg` (0.48s)
- Breakpoints: mobile `<768px`, tablet `768–1099px`, desktop `≥1100px`

**Guidelines:**
- Always use CSS custom properties instead of hard-coded values
- Define all colors, spacing, sizing, and timing in design-system.css
- Use semantic variable names (e.g., `--text-label` instead of `--font-11px`)
- Consolidate duplicate rules — if a style appears multiple times, extract to a reusable class or variable
- No magic numbers — all dimensions should relate to the 4px grid or defined scale
