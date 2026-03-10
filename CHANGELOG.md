# Changelog

All notable changes to Scentmap are documented here.

---

## 2026-03-10

### Added
- **Score cards** — replaced Venn diagram with two tappable score cards: `Match %` and `Layers Well %`; tap either to open an educational overlay explaining 4 score ranges with the current pair's range highlighted
- **3×3 notes grid** — replaced flat note columns with a structured grid (rows = Top/Mid/Base, columns = Frag A only / Shared / Frag B only); "shared" is strict same-note same-layer; shared notes use a filled dark pill
- **Overlapping radar chart** — single unified pentagon showing both fragrances; Frag A = solid fill + solid stroke, Frag B = dashed stroke + lighter fill; legend below with first-word labels
- **Scatter plot** — Sillage × Layering 2-axis chart with 4 named quadrant zones (Skin scent / Personal journey / Statement / Room presence); each fragrance shown as a colored dot with name label
- **Swap suggestions v2** — two-column layout ("Swap Frag A" | "Swap Frag B"); each card shows attribute groups ≈ Similar / ↑ Different / ≠ Contrasting; no score, purely qualitative
- **Sticky compare bar** — `position:sticky; top:0` bar with `● Name VS Name ●` appears when the slot picker cards scroll out of view; tapping either slot opens the picker; IntersectionObserver-driven
- **Plain-language verdict** — sentence below score cards synthesising match and layering scores into plain English
- **Educational score overlay** — full-screen bottom sheet with 4 quadrant explanations; current pair's range highlighted; opened by tapping either score card
- **Haptics** — 9 new moments: picker open (light), picker close (light), fragrance selected (medium), both slots filled (success), slot cleared (nudge), sticky bar appears (selection), score card tapped (selection), suggestion tapped (light), detail compare CTA tapped (medium)

### Changed
- **Detail panel redesigned** — removed all ownership UI (state tabs, scentmap CTAs, layering-with-owned section); description now always visible below family chip; new "Compare with" section showing two explicit CTAs to compare current frag with whichever fragrance is in slot A or B
- **Family colors updated** — Chypre: `#1E5A30` → `#2A5C50` (teal-moss); Gourmand: `#7C3E00` → `#6B2030` (burgundy)
- **Design system additions** — typescale classes (`.t-display` through `.t-label`); button system (`.btn-primary`, `.btn-ghost`); corner radius scale: 4px micro / 8px inputs+cards / 12px slot cards+notes / 24px modals+sheets; `em,i` no longer italic in Source Serif 4
- **Similar shelf simplified** — removed "In your collection" owned section from detail panel; shows top 5 by similarity score with classifyDiscovery badge

---

## 2026-03-09 (MVP)

### Changed
- **Compare-only MVP** — stripped app down to a single-focus compare tool; all other tabs (Map, Scentmap, Fragrances, Roles, Notes, Profile) archived in DOM for future use; no visible tab nav
- **Countrast-inspired picker UI** — replaced search-box compare pickers with large clickable fragrance slots; clicking a slot opens a full-screen modal browser sorted alphabetically by brand
- **Fragrance picker modal** — full-screen overlay with search (name, brand, note), scrollable list with family dot + brand label, close button at bottom center; matches Countrast country-list UX pattern
- **Minimal nav bar** — replaced 9-tab nav with logo + settings gear (⚙) icon; shown on all breakpoints; mobile bottom nav removed
- **Settings menu** — gear icon opens a popover with Design System and Changelog links; "← Compare" back button appears in nav when viewing settings pages
- All fragrance data, render functions, and archived panels preserved intact

---

## 2026-03-09

### Changed (design system pass)
- **Mobile nav consolidated to 3 tabs** — Fragrances, Compare, More; secondary destinations (Map, Capsule, Roles, Notes, Profile, Changelog) moved into a "More" bottom sheet accessed via the ⋯ tab; default landing on mobile changed from Map to Fragrances; mobile nav label font bumped to `.65rem` for legibility
- **Family chips unified** — `.fam-chip` now uses filled pill style (solid family accent color background, white text, uppercase, `.65rem`) matching the Compare panel's `cmp-frag-fam-chip`; dot indicator removed; applied everywhere family is displayed
- **Role chips refined** — `.dc-role-chip` border thickened to `1.5px`, uses `var(--paper)` background (was `#fff`), muted unassigned state; assigned-secondary now uses `var(--stone)` fill
- **Border radius consolidated to 5 semantic values** — `2px` micro (badges, status labels), `6px` tabs/tooltips/inputs, `8px` standard cards, `16px` sheets/modals, `20px`/`50%` pills; eliminated 7px, 5px, 14px, 3px intermediate values
- **Card and sheet borders unified** — all card containers switched from `var(--black)` to `var(--g200)` (`.carousel-card`, `.picker-list`, `.pairer-result`, `.scent-list`); sheets softened to `var(--g300)`; note popup gains box-shadow elevation instead of heavy border
- **Search inputs unified** — `.cmp-search` updated to match `.cat-search-input`: `padding:9px 14px`, `font-size:.84rem`, `border:1.5px solid var(--g200)`, `border-radius:8px`; one pattern now used everywhere
- **Font sizes consolidated** — 62 occurrences of near-identical micro sizes (`.61`–`.64rem`) merged to `.65rem`; `.66`/`.67rem` merged to `.68rem`; reduces distinct values from 30+ toward the 8-step scale
- **`--warm-mid` token removed** — dead duplicate of `--g300` (#C4BC9E) removed from `:root`; 2 usages replaced with `var(--g300)`

### Added
- **Design System page** — new "Design" tab (desktop nav) with sticky sidebar navigation; documents all design tokens, components, and interactions in a single living reference page; includes live WCAG contrast-ratio badges computed from actual palette hex values; sidebar scrollspy highlights active section
- **Foundations section** — full neutral palette (13 tokens) + family accent palette (9 tokens) with pass/fail contrast badges; 8-step type scale table (proposed consolidation from 30+ current sizes); 4px spacing grid; 7 border patterns; border-radius inventory (9 current values) with proposed consolidation to 5
- **Components section** — live demos of all button variants (primary, secondary, ghost, danger, icon, pill), tag/chip variants, card patterns (catalog row, scent card, note card, role card), form inputs, and navigation components (desktop tabs, mobile bottom bar, sheet stack); each demo annotated with inline inconsistency callouts
- **Issues tracker** — 8 numbered issues with Hi/Mid/Lo priority: WCAG AA contrast failures on `--g400` (2.7:1) and `--g450` (3.7:1), 30+ unscoped font-size values, 9 border-radius values needing consolidation, missing sticky sheet headers, nav-bar height inconsistency across sheet levels, bottom-nav overlap of sheet content, inconsistent card border patterns, form input sizing variance
- **Team guidelines** — do/don't/note rules for: color (always use palette tokens, never raw hex), typography (3-font-family rule, font-size from scale only), spacing (4px grid, named tokens), borders (2 approved styles), components (composition over custom), and accessibility (WCAG AA floor)
- **Compare tab** — new panel (desktop nav + mobile bottom nav) for side-by-side fragrance comparison; search autocomplete for both slots with family-color-coded results; selected fragrances shown as dismissible chips
- **Venn diagram** — SVG visualization showing the match score (0–100) between two fragrances; circle sizes and overlap reflect computed similarity; family accent colors for each fragrance
- **Notes breakdown** — three-column grid showing notes unique to each fragrance vs. shared notes; each note tagged with layer badge (T = top, H = heart, B = base)
- **Fragrance fingerprint** — SVG radar/spider chart per fragrance across 5 dimensions (freshness, sweetness, warmth, intensity, depth) derived from family profile and sillage/layering values; two fingerprints shown side-by-side for direct visual comparison
- **Key metrics bars** — mirrored horizontal bars comparing sillage and layering values; shared roles highlighted in accent color
- **Suggestions** — 4 "you might also like" cards below each comparison, ranked by maximum similarity score to either selected fragrance
- **Archivo Black font** — added for display headings in the Compare panel; bold editorial feel per v2 design direction

## 2026-03-08 (4)

### Added
- **Fragrance Map** — full-screen pan/zoom canvas replaces the note constellation; all 183 fragrances plotted in family clusters arranged in a ring (9 families, sillage × layering scatter within each); drag to pan, scroll/pinch to zoom, hover shows a tooltip with name, brand, top notes, and up to 3 similarity-connection lines; click a dot closes the map and opens the fragrance detail; minimap in the bottom-right corner shows the full world with a viewport indicator; launched from a new "✦ Open Fragrance Map" button at the top of the Notes tab
- **Detail panel capsule CTA** — static "Assigned to roles" label replaced with a dynamic `"Add to your scentmap"` (shown in accent red, uppercase, when no role is assigned) / `"In your scentmap"` (muted, when at least one role chip is active); unassigned role chips now display a `+` icon to signal they are tappable
- **Picker: new-user flow** — when a user has nothing owned and clicks a role slot, the picker now shows a "Browse all for this role" section listing all tagged fragrances with direct "Add" buttons, plus a hint line; previously showed an unhelpful "mark fragrances as owned first" dead-end
- **Picker: carousel Add buttons** — each card in the "Explore for this role" horizontal carousel now has a "+ Add to capsule" button so users can add directly from the carousel without opening the detail panel
- **Catalog: clickable top notes** — top-note pills in every catalog row are now `<button>` elements; clicking a note opens the floating note popup (showing description and all fragrances that contain it)

### Changed
- `buildConstellation()` repurposed: body reduced to inserting the map launch button; full canvas rendering delegated to new `openFragMap()` / `closeFragMap()` / `_fmDraw()` / `_fmDrawMini()` module-level functions
- Carousel cards changed from `<button>` to `<div>` to allow nested Add `<button>` elements (avoids invalid HTML nesting)
- `renderCatRow()` — `.s-meta` now renders `<button class="s-meta-note">` elements joined by `<span class="s-meta-sep">` for comma separators; note click handlers wired inline after `innerHTML`

## 2026-03-08 (3)

### Added
- **Layering education** — complexity chip (`Balanced` / `Layered` / `Complex` / `Deep`) appears on any catalog row with a layering score ≥ 6, giving instant visual feedback on blending potential; Layering Pairer now opens with a 3-sentence explainer: High = complex structure that layers well; Low = clean linear, best solo
- **Auto-fill Scentmap** — new `autoAssignFromOwned()` assigns the best-scoring owned fragrance (by layering score) to each empty role slot silently; wired to the onboarding "Set up my capsule" CTA and to a persistent "Auto-fill from collection ▸" button in the Scentmap header (hidden once all 8 slots are filled or no owned frags)
- **Capsule role legend** — collapsible "What are these roles? ▾" toggle below the capsule grid expands a full legend showing each role's symbol, name, and long description; hides again with "Hide roles ▴"
- **Capsule role descriptions** — `.cap-desc-short` now renders at legible opacity (0.45–0.55) so the one-line tagline is visible in both empty and filled cells
- **Profile: Best for Layering** — new ranked list (top 5 owned frags by layering score) with proportional bars and Linear→Deep labels; appears whenever ≥1 fragrance is owned
- **Profile: Collection Pairings** — two side-by-side cards: "Most Similar" (highest `scoreSimilarity` pair) and "Best Layering" (highest `scoreLayeringPair`), each with a one-line reason; appears when ≥2 frags are owned
- **Family / brand / role hover highlight** — hovering the coloured family dot (`.s-fdot`) on any catalog row dims all non-matching rows; hovering a brand pill in the brand bar highlights rows for that brand; hovering a role pill in the filter bar highlights rows for that role; all restore on mouse-out
- **Roles: brand filter bar** — horizontally scrollable pill row at the top of the Roles tab filters every role's scatter chart to a single brand; "All brands" pill resets; persists as user scrolls through roles
- **`scoreLayeringPair(a,b)`** — extracted as a module-level scoring function (mirrors the local `scoreLayering` inside the detail panel) for use in Profile comparisons

### Changed
- `renderCatRow()` now sets `data-brand` and `data-roles` attributes on each row for hover-highlight targeting
- `go()` nav selector updated to exclude `.roles-brand-bar .tab` from deactivation sweep

---

## 2026-03-08 (2)

### Added
- **Tom Ford** — 24 fragrances: Tobacco Vanille, Tuscan Leather, Oud Wood, Noir de Noir, Rose Prick, Neroli Portofino, Soleil Blanc, Costa Azzurra, Sole di Positano, Ombré Leather, Santal Blush, White Suede, Coffee Rose, Fucking Fabulous, Lost Cherry, Tobacco Oud, Amber Absolute, Italian Cypress, Lavender Extreme, Beau de Jour, Noir Extreme, Black Orchid, Velvet Orchid, Grey Vetiver
- **Replica (Maison Margiela)** — 21 fragrances: Lazy Sunday Morning, Flower Market, Beach Walk, Sailing Day, At the Barber's, Lipstick On, Jazz Club, By the Fireplace, When the Rain Breaks, Whispers in the Library, On a Date, Across Sands, Under the Lemon Trees, Car Leather 1957, Autumn Vibes, Coffee Break, On the Beach, Matcha Meditation, Summer on the Terrace, From the Garden, Spring/Summer in a Bottle
- **Fueguia 1833 Endeavour** — the missing flagship entry now restored; top: Pink Pepper, Lemon / mid: Hinoki, Mint, Geranium / base: Palisander, Cedar
- **81 new notes** in notes.json (and the Notes constellation): Almond, Amberwood, Apple, Artemisia, Bay Leaf, Beeswax, Benzoin, Bitter Almond, Black Cherry, Black Grape, Black Orchid, Black Pepper, Black Tea, Blackberry, Cacao, Caramel, Casablanca Lily, Cashmere, Cashew, Cashmeran, Chestnut, Chinese Pepper, Cinnamon, Clary Sage, Cocoa, Coconut, Coconut Milk, Coffee, Cumin, Cypriol, Dried Fruits, Elemi, Eucalyptus, Fir Balsam, Frankincense, Gardenia, Grass, Green Leaves, Guaiac Wood, Hay, Heliotrope, Honey, Iso E Super, Italian Cypress, Juniper Berry, Lavender Absolute, Lily, Marine Accord, Mastic, Matcha, Mineral Accord, Moss, Myrrh, Night-Blooming Jasmine, Nutmeg, Orange, Orchid, Palo Santo, Paperwhite Accord, Petrichor, Pine Resin, Rain Accord, Raspberry, Rosemary, Sage, Salt, Sea Salt, Shiso, Smoke, Spearmint, Styrax, Suede, Thorns, Tiare, Tobacco Blossom, Tobacco Flower, Tobacco Leaf, Tomato Leaf, Tulip, White Rose, White Tea
- **Brand filter bar** — horizontally scrollable pill row in the Catalog showing each brand with fragrance count (e.g. "Tom Ford 24", "Byredo 30"); click any pill to filter the catalog to that brand; "All 183" resets; composable with state and role filters

### Changed
- **Expanded existing collections**: Byredo 18→30 (+12), Diptyque 10→25 (+15), Le Labo 12→29 (+17), Aesop 10→15 (+5), Fueguia 1833 7→24 (+17 including Endeavour)
- **Note name normalisation**: `Tonka Bean` → `Tonka`, `Gaiac Wood` → `Guaiac Wood`, `Aldehyde` → `Aldehydes`, `Cloves` → `Clove` across all brand JSON files for consistency
- **JSON data fetches use `cache: 'no-store'`** to prevent stale brand/notes data being served from browser cache after updates
- **Catalog total**: 47 → 183 fragrances across 9 brands; Notes: 97 → 177

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
