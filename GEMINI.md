# Scentmap — Developer Guide for Gemini CLI

This file describes the development workflow and conventions for the Scentmap project. **Follow these instructions on every session.**

---

## Project structure

```
index.html          HTML structure only (~180 lines, no inline JS)
js/
  app.js            All application logic (~1,950 lines)
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
GEMINI.md           This file
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
cp -r /Users/matthewlewair/Documents/scentmap/js /tmp/scentmap-copy/
cp -r /Users/matthewlewair/Documents/scentmap/app /tmp/scentmap-copy/
cp -r /Users/matthewlewair/Documents/scentmap/quiz /tmp/scentmap-copy/
cp -r /Users/matthewlewair/Documents/scentmap/compare /tmp/scentmap-copy/
```

**Cache-bust the browser after syncing:**
```
http://localhost:3000/?v=<timestamp>
```

Use `location.href = 'http://localhost:3000/?v=' + Date.now()` to force a fresh load in the browser.

---

## Commit workflow

**Every commit must include a CHANGELOG.md update.** No exceptions.

1. Make and test changes in `index.html`, `js/app.js`, and/or `styles/`
2. Sync to dev server:
   ```bash
   cp /Users/matthewlewair/Documents/scentmap/index.html /tmp/scentmap-copy/index.html
   cp -r /Users/matthewlewair/Documents/scentmap/styles /tmp/scentmap-copy/
   cp -r /Users/matthewlewair/Documents/scentmap/js /tmp/scentmap-copy/
   ```
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
- **Catalog controls** — `initCatalogControls()` must be called once during init (after data loads) to wire up All/Owned/Wishlist tabs, the search input, and the **Feelings/Role filter bar (`cat-feel-bar`)**.
- **Deep Linking** — `handleInitialNavigation()` parses the URL hash (e.g., `#notes`, `#saved`, `#feel=solar`) and path (e.g., `/compare/a/b`, `/quiz/slug`) to activate the correct state and pre-load data on startup.
- **Standalone Engines** — Sub-pages like `/quiz/` use `js/quiz.js`, which renders into `.col-main-content`. It includes a `window.go` redirector to ensure navigation links in the shared shell remain functional.

---

## Session Summary (2026-03-19)

### Accomplishments
- **Phase 0 Routing Hotfix**: Resolved critical issues where standalone `/compare/` and `/quiz/` URLs failed to load data or rendered incorrectly.
- **Standalone Compare URLs**: Fixed deep-linked fragrance pre-loading by making ID lookup more robust (case-insensitive) and improving regex to support all valid fragrance slugs.
- **Standalone Quiz Logic**: Fixed a critical syntax error in `quiz.js` and updated container targeting to `.col-main-content`.
- **SPA Quiz Fallback**: Implemented `renderStandaloneQuiz` in `app.js` to handle quiz routes when the main app shell is loaded via a Single Page App configuration.
- **Navigation Recovery**: Fixed broken "Feelings" (Role) filters in the Catalog sidebar and ensured navigation links on standalone quiz pages redirect correctly to the main app.
- **Architecture Stabilization**: Improved `handleInitialNavigation` to robustly handle `#you`, `#journal`, and standalone paths. Refined `go()` redirect logic to prevent unnecessary resets to `/app`.
- **Visual Cleanup**: Hid `.catalog-sidebar` on standalone pages to prevent visual pollution.
- **gstack Upgrade**: Upgraded the agent stack to v0.8.5 for improved platform-agnostic review templates and better shipping gates.

### Unresolved / Next Steps
- **Engineering Review**: Detailed review of architecture, data flow, and test coverage is ongoing for the `QA-fixes` branch.
- **Unified Navigation**: Consider refactoring `onclick` handlers to event listeners to avoid the need for `window` exposure in ES modules.

---

## CSS conventions

**Design tokens (in `styles/design-system.css`):**
- Palette variables: `--paper`, `--ink`, `--stone`, `--black`, `--g700`…`--g100`, `--resin`, `--wish`
- Family colors: `--fam-woody`, `--fam-floral`, etc.
- Spacing scale: 4px grid (`--sp-xs`, `--sp-sm`, `--sp-md`, `--sp-lg`, etc.)
- Typography: `--font-serif`, `--font-sans`, with semantic sizes (`--text-sm`, `--text-md`, `--text-lg`)
- Transitions: `--ease-spring: cubic-bezier(.16,1,.3,1)` at `--dur-sm` (0.28s), `--dur-md` (0.36s), `--dur-lg` (0.48s)
- Breakpoints: mobile `<768px`, tablet `768–1099px`, desktop `≥1100px`

**Focus & accessibility tokens:**
- `--focus-ring-color` (`var(--accent-primary)`), `--focus-ring-width` (2px), `--focus-ring-offset` (3px)
- Global `:focus-visible` in `design-system.css` uses `box-shadow` double-ring (bg gap + accent ring) — respects `border-radius`
- Inputs override with border-based focus: `outline: none; box-shadow: none; border-color: var(--border-strong)`
- On-dark overlay tokens: `--on-dark-text`, `--on-dark-subtle`, `--scrim-control`, `--scrim-control-hover`, `--scrim-control-text`
- State color: `--wish: var(--fam-floral)` (rose/pink wishlist indicator)

**Accessibility persona (Nadia, 28):**
Low vision (20/80 corrected), keyboard-first navigator. Relies on Tab/Enter, needs strong focus rings. This persona drives the focus ring system and minimum tap target sizing decisions.

**Guidelines:**
- Always use CSS custom properties instead of hard-coded values
- Define all colors, spacing, sizing, and timing in `design-system.css`
- Use semantic variable names (e.g., `--text-label` instead of `--font-11px`)
- Consolidate duplicate rules — if a style appears multiple times, extract to a reusable class or variable
- No magic numbers — all dimensions should relate to the 4px grid or defined scale
- Never use raw `rgba()` — use the overlay/transparency tokens from `design-system.css`
- Never use `outline: none` on a base style — use `:focus-visible` overrides only where border-based focus replaces the ring
