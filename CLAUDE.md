# Scentmap — Developer Guide for Claude

This file describes the development workflow and conventions for the Scentmap project. **Follow these instructions on every session.**

---

## Project structure

```
index.html          Single-file app (all HTML, CSS, JS inline)
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
```

**Cache-bust the browser after syncing:**
```
http://localhost:3000/?v=<timestamp>
```

Use `preview_eval` with `location.href = 'http://localhost:3000/?v=' + Date.now()` to force a fresh load.

---

## Commit workflow

**Every commit must include a CHANGELOG.md update.** No exceptions.

1. Make and test changes in `index.html`
2. Sync to dev server: `cp index.html /tmp/scentmap-copy/index.html`
3. Verify in preview (screenshot + functional checks)
4. **Update `CHANGELOG.md`** — add entries under a dated `## YYYY-MM-DD` section:
   - `### Added` for new features
   - `### Changed` for behaviour/visual changes
   - `### Fixed` for bug fixes
5. Commit both `index.html` and `CHANGELOG.md` together

---

## Architecture notes

- **Single HTML file** — all CSS and JS are inline in `index.html`. Do not split into separate files.
- **Data is arrays** — `f.top`, `f.mid`, `f.base` in scent objects are string arrays, not comma-separated strings. Use `(f.top||[]).forEach(...)` not `.split(',')`.
- **Sheet stack** — mobile bottom sheets use `pushSheet(renderFn)` / `popSheet()` / `closeAllSheets()`. First sheet slides up from bottom; subsequent (sub-nav) sheets get class `.nav` and slide in from the right.
- **Desktop detail panel** — `pushDesktopDetail(renderFn)` / `openDesktopDetail(renderFn)` / `closeDesktopDetail()`. Use `_renderDeskDetail(true)` to animate on push.
- **Nav** — `go(id, btn)` for desktop tab navigation; `goMobile(id, btn)` for mobile bottom nav. Both activate the corresponding `#p-{id}` panel.
- **Catalog controls** — `initCatalogControls()` must be called once during init (after data loads) to wire up All/Owned/Wishlist tabs and the search input. State is tracked in `CAT_STATE_FILTER` and `CAT_ROLE_FILTER`.
- **Persistence** — `localStorage` keys: `sm_owned` (owned set), `sm_wish` (wishlist set), `sm_roles` (role assignments), `sm_onboarded` (onboarding flag).
- **go() tab selector** — the `.tab` deactivation selector excludes `.dc-state-wrap .tab`, `.picker-row .tab`, and `.cat-state-bar .tab` to avoid clearing filter UI on nav.

---

## CSS conventions

- Palette variables: `--paper`, `--ink`, `--stone`, `--black`, `--g700`…`--g100`, `--resin`, `--wish`
- Family colors: `--fam-woody`, `--fam-floral`, etc.
- Breakpoints: mobile `<768px`, tablet `768–1099px`, desktop `≥1100px`
- All transitions use `cubic-bezier(.16,1,.3,1)` (spring-like) at `.28s`–`.48s`
