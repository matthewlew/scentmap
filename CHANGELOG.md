# Changelog

All notable changes to Scentmap are documented here.

---

## 2026-03-08

### Added
- **Onboarding flow** — welcome screen on first visit with three entry paths: add your collection, browse the catalog, or explore notes; collection builder lets users mark owned fragrances by role; completes to catalog or scentmap view
- **Taste Profile tab** — new desktop/mobile tab showing owned-collection analysis: family breakdown bar chart, recurring notes, role coverage grid, and sillage sweet-spot indicator; updates live as collection changes
- **Complement/Contrast badges on Discover shelf** — fragrance detail cards in the discover shelf now show family-relationship badges (Complements / Contrasts) based on fragrance family proximity
- **Layering suggestions in fragrance detail** — detail view includes a "Works well with" section surfacing fragrances that layer well based on shared or complementary note families
- **Catalog search** — full-text search bar filtering across fragrance name, brand, and all notes (top/mid/base); includes clear button; filters in real-time as you type
- **Catalog state filter tabs** — All / Owned / Wishlist tabs above the search bar for quick collection views; state persists across catalog role-filter navigation
- **Scentmap as a desktop tab** — removed the fixed left sidebar; Scentmap is now a first-class tab in the main navigation on both desktop and mobile, consistent with all other views
- **23 new fragrances** across three houses, expanding the catalog from 24 to 47 entries:
  - **Byredo** (+14): 1996 Inez & Vinoodh, Pulp, Lil Fleur, Sellier, Inflorescence, Seven Veils, Black Saffron, Baudelaire, Tulipe, Sunday Cologne, Oud Neroli, Rose Noir, Sundazed, Slow Dance
  - **Diptyque** (+8): Eau Rose, Fleur de Peau, Oyedo, Geranium pour Monsieur, Vetyverio, Eau des Sens, Olene, Eau Capitale
  - **Fueguia 1833** (+1): Buenos Aires
- **21 new fragrance notes** added to `data/notes.json` (alphabetically integrated): Angelica, Basil, Blood Orange, Coriander, Fig, Freesia, Honeysuckle, Hyacinth, Lily of the Valley, Lychee, Mimosa, Narcissus, Oakmoss, Pear, Peony, Rhubarb, Saffron, Tangerine, Thyme, Ylang-Ylang, Yuzu

### Changed
- **Bottom sheet animations** — sheets now animate consistently: first sheet slides up from bottom, sub-navigation sheets slide in from the right (`.sheet.nav`); stacked-behind state uses `brightness` filter instead of `scale` for visual consistency
- **Desktop detail panel slide-in** — navigating to a fragrance or note on desktop now triggers a `translateX` fade-in animation instead of an instant content swap

### Fixed
- **Note Constellation crash on init** — `buildConstellation()` was calling `.split(',')` on note fields that are arrays in the JSON, throwing a `TypeError` and silently halting the rest of the init chain (preventing catalog state tabs from wiring up); fixed all three call sites to iterate arrays directly

---

## 2026-03-06

### Fixed
- **JSON data not rendering after externalization** — three bugs introduced when data was forked from inline arrays into external JSON files:
  - Corrupted `NI_MAP` declaration: a stray line number artifact (`1390`) split the assignment in two, and the `const NI_MAP` fragment was accidentally fused onto `function isTablet()`, breaking both
  - `const RM` changed to `let` — was declared `const` but the fetch init block reassigns it after loading `data/roles.json`, causing a silent `TypeError`
  - `const CAT_MAP` changed to `let` — same issue as above for `data/scents.json`

### Added
- `data/scents.json` — fragrance catalog (24 entries) extracted from inline JavaScript in `index.html`
- `data/notes.json` — notes reference index (75 entries) extracted from inline JavaScript in `index.html`
- `data/roles.json` — roles definition (8 entries) extracted from inline JavaScript in `index.html`
- `.claude/launch.json` — dev server configuration for local preview

### Changed
- `index.html` now loads all data via `fetch()` from the three external JSON files instead of hardcoded inline arrays, enabling data to be managed independently of the app logic

---

## 2026-03-06 — Initial

- Renamed `scentmap_7.html` to `index.html`
- Initial app: single-file fragrance capsule tool with 24 scents across Byredo, Fueguia 1833, Xinú, and Diptyque; 8 roles; 75 notes
