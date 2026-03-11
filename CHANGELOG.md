# Changelog

All notable changes to Scentmap are documented here.

---

## 2026-03-11 (fix: cmp-sticky-bar ghost space and scroll trigger)

### Fixed
- **cmp-sticky-bar ghost space** — bar was `opacity:0` but still occupied ~50px of height; replaced with `max-height:0; overflow:hidden; padding:0; margin-bottom:0` collapsed state so no layout space is consumed when not visible.
- **cmp-sticky-bar hidden behind nav** — bar used `top:0` but `.col-main-nav` is also sticky at `top:0` with `z-index:50`; added `--col-nav-h: 50px` layout token to `design-system.css` and set `top: var(--col-nav-h)` so the bar sticks just below the nav when visible.

## 2026-03-11 (fix: spacing consistency — mobile margins, design token coverage)

### Fixed
- **Critical mobile wide-margin bug.** `responsive.css` was using a 2-value `padding` shorthand (`16px calc(80px + env(...))`) which applied the 80 px nav-clearance value to *both* left and right sides, leaving only 215 px of usable content width on a 375 px screen. Fixed to 3-value shorthand: `var(--sp-md) var(--sp-lg) calc(80px + ...)` — content is now 343 px wide.
- **Detail panel excessive horizontal padding.** `.detail-inner` had `padding: 16px 60px`; corrected to `var(--sp-lg) var(--sp-2xl)` (16 px / 24 px).
- **Off-grid spacing values snapped to 4px scale.** Replaced 28 px, 30 px, 6 px, 5 px, 10 px values throughout `components.css` with adjacent design tokens (`--sp-3xl`, `--sp-md`, `--sp-sm`, `--sp-xs`).
- **Token coverage.** Converted ~60 inline `px` spacing values across `components.css` and `responsive.css` to use design-system tokens (`--sp-*`), eliminating drift between components.

## 2026-03-11 (ux: drum-roller picker — independent columns, auto-select on center)

### Changed
- **Redesigned picker as a true drum-roller.** Each column now scrolls independently and auto-selects the item centred in the groove — no tap required. The centre selection zone is rendered as a fixed 300 px drum window with a `::before` groove (border lines + `--bg-secondary` fill) and `::after` top/bottom fade-out gradients, giving the physical feeling of a wheel stopping on a choice. Items use `scroll-snap-align: center` with symmetric `padding-top/bottom: 120px` so the first and last items can reach the groove.
- **Haptic tick per item.** `window.haptic('selection')` fires each time the centred index changes, matching one physical "click" per notch of the wheel. Selection is debounced 180 ms so the comparison only updates once scrolling settles.
- **Per-column independent search inputs** restored. Each side has its own search field so users can filter the two drums entirely independently (e.g. search "le labo" on the left and "byredo" on the right simultaneously).
- **Tap-to-centre.** Tapping any item smooth-scrolls it to the groove centre; the scroll handler then finalises the selection — consistent behaviour whether the user scrolls or taps.
- **Live comparison update.** As soon as a new item snaps to centre and the debounce fires, `renderCompareResults` reruns and the scores/radar update in real time without closing the picker.
- **Other-slot dimming.** An item already selected in the opposite column renders at 22 % opacity by default; if it is also the centred item it renders at 55 % with a distinct visual cue.

## 2026-03-11 (ux: rolodex picker — sync scroll, sort bar, haptic ticks)

### Added
- **Rolodex-style fragrance picker.** Both columns now scroll in synchrony — scrolling either list moves the other, so users can browse the full catalog side-by-side without losing their place. Items snap to a fixed 52 px height via `scroll-snap-type: y mandatory`, giving each scroll unit a physical "tick" feel. Haptic feedback fires on each tick crossing via `window.haptic('selection')`.
- **Horizontal-swipe sort.** A three-mode sort bar (Brand / Name / Family) replaces the per-column search headers. Swiping left/right on the list area cycles through sort modes; tapping a button jumps directly. A CSS spring-animated pill slides behind the active button. Subtitle text adapts per sort mode to avoid repeating the primary sort key.
- **Shared search input.** A single search field above both columns filters both lists simultaneously, replacing the previous per-column inputs.
- **Cross-column dim.** An item already selected in the opposite column is rendered at 38% opacity so users instantly see which fragrances are in use.
- **Fade-edge rolodex effect.** Top and bottom gradient overlays on each list column create the visual illusion of items entering and leaving a "window," reinforcing the scroll-wheel metaphor.

## 2026-03-11 (ux: search match context in catalog rows)

### Changed
- **Catalog search now shows where a match was found.** When a query matches a top note, that note is highlighted in accent colour inline with the other top notes. When the match is in a mid or base note (previously invisible), the notes line is replaced with `↳ Mid · NoteName` or `↳ Base · NoteName` so users understand exactly why a result appeared. Name and brand matches continue to show top notes normally. Implemented by passing `search` into `renderCatRow()` and adding `.note-match` / `.match-badge` CSS rules.

---

## 2026-03-11 (accuracy: note-level radar + label clarity + data confidence)

### Changed
- **Radar chart now derived from actual notes** — `computeProfile()` previously returned identical shapes for all fragrances in the same family (pure family-lookup). Now blends a 100-entry `NOTE_PROFILE` table (60% weight, tier-weighted: base×1.5, mid×1.0, top×0.5) with the family anchor (40%). Four woody fragrances now produce four distinct radar polygons.
- **"Layering" → "Structure" in the detail panel** — the per-fragrance stat describes structural complexity (Linear → Deep), not pairwise blend compatibility. Renamed to avoid confusion with the Compare panel's Pairing score.
- **"Layering" → "Pairing" in the compare panel** — the pairwise blend score is now labelled accurately. Descriptor text updated throughout: "Great together" → "Good pairing", "Don't layer" → "Poor pairing", etc. Edu-overlay quad labels and `getVerdict()` sentences updated to match.
- **Structure score explainer updated** in Roles Pairer — clarifies that the score reflects a fragrance's internal complexity, not compatibility with a specific partner.

### Added
- **Data confidence caption** — a small italic line ("Key materials only — simplified pyramid") appears below the TOP/MID/BASE note pyramid in every fragrance detail panel, signalling that note data is curated rather than exhaustive.

---

## 2026-03-11 (UX: collection quick-actions + top notes preview)

### Added
- **Collection quick-actions in detail panel** — Wishlist and Mark owned buttons now appear directly in the fragrance detail panel (below the family tag). Buttons toggle between inactive (outlined) and active (filled) states and immediately update catalog counts, dots, and capsule. Previously there was no way to add fragrances to owned/wishlist from the detail view.
- **Top notes preview on catalog rows** — Each fragrance row in the catalog now shows up to 3 top notes as a third line in a muted caption style. Provides at-a-glance context without opening the detail panel.

---

## 2026-03-11 (picker, carousel, role-landing, modifier CSS)

### Fixed
- **Picker panel missing CSS** — `picker-header`, `picker-title`, `picker-sub`, `picker-hero`, `picker-hero-sym-empty`, `picker-role-sym-line`, `picker-hero-sec-row/idx/name`, `picker-sec-lbl`, `picker-list`, `picker-row`, `picker-fdot`, `picker-info`, `picker-name-btn`, `picker-brand-row`, `picker-order-badge`, `primary-badge`, `picker-empty` all had no styles; picker panel now shows styled role header, empty/filled hero state, assigned list with Primary badge, and Remove buttons
- **Carousel missing CSS** — `carousel-wrap`, `carousel` (horizontal scroll snap), `carousel-card`, `carousel-card-name/brand/family`, `fam-dot` had no styles; "Explore for this role" carousel now renders as horizontally scrollable cards with family color dots
- **Role-landing missing CSS** — `role-landing`, `role-landing-grid` (2-col), `role-landing-card`, `rlc-sym/name/desc/count` had no styles; catalog landing (no role filter selected) now shows a styled 2×4 role grid with symbol, name, description, and fragrance count
- **Modifier/chip classes** — `dc-role-chip`, `assigned-primary`, `assigned-secondary`, `chip-sym`, `chip-order`, `chip-add`, `is-wish` had no styles; role assignment chips in detail panel now render as styled interactive badges with primary (filled), secondary (outlined), and unassigned states

---

## 2026-03-11 (capsule/scentmap panel CSS)

### Fixed
- **Capsule panel missing CSS** — `capsule-tagline`, `capsule-auto-btn`, `cap-frag-wrap`, `cap-more`, `cap-count`, `cap-legend-toggle`, `cap-legend` (collapsible), `cap-legend-row/sym/text/name/desc` all had no styles; scentmap panel now shows styled tagline, auto-fill button, count badge on filled cells, and collapsible role legend

---

## 2026-03-11 (house detail + note popup CSS)

### Fixed
- **House detail panel** — `house-detail-wrap`, `house-detail-name`, `house-detail-count`, `house-detail-list` had no CSS; panel now shows brand in display type, uppercase count, and a bordered fragrance list
- **Note popup** — `note-float-overlay`, `note-float-bg`, `note-popup`, `nfp-header`, `nfp-close`, `np-name`, `np-family`, `np-desc`, `np-frags` had no CSS; popup now renders as a positioned floating card (248px) with border, shadow, and catalog list; also styles `np-*` classes reused in note detail push view

---

## 2026-03-11 (profile panel CSS)

### Fixed
- **Profile panel CSS** — all `prof-*` classes were unstyled; added: `prof-section` (with dividers), `prof-section-label`, `prof-empty` (empty state with CTA), `prof-fam-bars` (colored bar chart), `prof-notes` with `.hi` highlighted chips, `prof-roles` grid (filled vs empty states), `prof-sill-track` with marker dot, `prof-layer-list` (ranked bars), `prof-pair-cards` (insight cards for most-similar and best-layering pairs)

---

## 2026-03-11 (onboarding CSS)

### Fixed
- **Onboarding overlay CSS** — `onboard-overlay` and `onboard-card` had no CSS (rendered in-flow as a transparent static element); added full stylesheet: overlay is now a fixed full-screen modal with dark scrim; card has border-radius, shadow, and scroll
- **Onboarding all screens** — all `onb-*` classes were unstyled; added CSS for: `onb-title`, `onb-sub`, `onb-paths`, `onb-path` (with icon/label/desc), `onb-skip-link`; collection screen: `onb-brand`, `onb-frag` (selected state + checkmark), `onb-cta` (sticky bottom bar), `onb-btn` (primary action); reveal screen: `onb-fam-bars` (colored bar chart), `onb-note-chip` (`.hi` highlighted chips), `onb-reveal-btn` (primary/secondary variants)

---

## 2026-03-11 (detail panel CSS + catalog layout)

### Fixed
- **Detail panel missing CSS** — `dc-description`, `dc-cmp-cta-label`, `dc-cmp-ctas`, `dc-cmp-btn` (and variants: dot, name, empty, vs, arrow, text), `dc-sim-lbl`, `dc-sim-shelf`, `dc-sim-row`, `dc-sim-dot`, `dc-sim-info`, `dc-sim-name`, `dc-sim-name-brand`, `dc-sim-reason`, `dc-sim-brand`, `dc-sim-state`, `dc-badge` (similar/contrasts/complements) all had no CSS rules; detail panel now shows description, compare CTAs, and similar-fragrance shelf with discovery badges

---

## 2026-03-11 (catalog layout CSS + filter sidebar)

### Fixed
- **Catalog layout CSS** — `frag-layout`, `frag-sidebar`, `frag-main`, `frag-main-top`, `frag-title-row`, `frag-mobile-panel`, `frag-filter-toggle`, `cat-search-wrap`, `brand-hdr-btn`, `brand-count-chip`, `brand-n`, `brand-c`, `cat-empty`, `frag-picker-dot`, `frag-picker-item-name`, `frag-picker-item-brand` all had no CSS; the catalog panel now renders a proper two-column layout with sidebar filters on desktop
- **Sidebar filter tabs** — `cat-state-bar` and `cat-brand-bar` inside `frag-sidebar` are overridden to stack vertically (vs horizontal pill row) with transparent background
- **Brand count chip spacing** — added `margin-left: 3px` to `brand-count-chip` so counts no longer run directly into brand names

### Added
- **Responsive catalog filters** — `frag-sidebar` hidden on mobile; `frag-filter-toggle` button visible; `frag-mobile-panel` shows All/Owned/Wishlist + brand tabs on toggle

---

## 2026-03-11 (accessibility + compare CSS)

### Fixed
- **Compare panel v2 CSS** — the compare panel was redesigned (new HTML/JS) but CSS was never written; added full stylesheet for all new classes: `cmp-header-v2`, `cmp-frag-card`, `cmp-score-card`, `cmp-score-meter`, `cmp-sticky-bar`, `cmp-notes-v2`, `cmp-grid-3x3`, `cmp-note-pill`, `cmp-sug-v2`, `cmp-edu-overlay` and all variants; the compare panel now renders correctly on desktop and mobile
- **Accessibility: aria-labels** — added `aria-label` to all icon-only buttons: note popup close (✕), compare slot clear buttons (✕), fragrance picker close; dynamically-generated clear buttons set label to "Remove [fragrance name]"
- **Accessibility: dialog roles** — added `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`/`aria-label` to note float overlay, fragrance picker modal, and onboarding overlay
- **Accessibility: decorative SVGs** — added `aria-hidden="true"` to all purely decorative SVG icons (back arrow, chevrons, sheet handle)
- **Accessibility: nav landmark** — added `role="navigation"` and `aria-label="Main navigation"` to mobile bottom nav; icon spans marked `aria-hidden="true"`
- **Compare card role** — compare slot cards (`div[role=button]`) now have `aria-label` describing their state ("Select fragrance one" / "Name by Brand — tap to change")
- **Fragrance picker search** — added `aria-label` and `role="listbox"` to picker list

### Added
- **Escape key closes modals** — global `keydown` handler dismisses topmost open overlay on Escape: score edu overlay → fragrance picker → note popup → mobile sheet stack → desktop detail panel; closes in priority order so nested overlays close one at a time
- **Focus management** — `_trapFocus()` moves keyboard focus into modals when opened; `_returnFocus()` restores focus to the trigger element on close; note popup close (button + backdrop) now returns focus
- **Mobile score layout** — on `<768px`, score cards stack in a 2-column row and the character radar moves below full-width; removes overflow/clipping of the layering score card
- **Mobile fragrance card** — description text hidden on mobile (`display:none`) to keep cards compact; minimum card height reduced to 100px

---

## 2026-03-10 (pass 7 — CSS consolidation)

### Changed
- **One dot component** — 6 separate dot class definitions (`.cmp-dd-dot`, `.cmp-chip-dot`, `.cmp-sug-dot`, `.picker-fdot`, `.s-fdot`, `.nf-dot`) collapsed into one shared 8×8px rule; size normalized to 8px across all uses
- **One search input** — removed dead `.cmp-search` / `.cmp-search-wrap` (old compare UI, only referenced in design system demo); `.cat-search-input` is the sole search pattern
- **One list row base** — `display:flex; align-items:center; gap:var(--sp-sm); cursor:pointer` extracted into a single shared selector for `.scent-row`, `.picker-row`, `.cmp-dd-item`; each class now only declares its unique properties
- **Letter-spacing standardised** — all hardcoded `0.06em` and `0.08em` values in uppercase label classes replaced with `var(--ls-wide)` (`.cmp-notes-col-head`, `.cmp-note-layer`, `.cmp-radar-label`, `.dc-nt`, `.dc-ftag`, `.dc-slbl`, `.rlc-count`)
- **Duplicate rules removed** — `.sec-label`, `.sec-label .sub`, `.brand-hdr`, `.brand-hdr-title`, `.brand-total` removed from `components.css`; authoritative definitions kept in `layout.css`
- **4px grid fixes** — `.tabs { padding: 3px }` → `var(--sp-xs)` (4px); `.brand-hdr { padding-bottom: 7px }` → `var(--sp-sm)` (8px) in both `layout.css` and `components.css`
- **components.css reduced** by ~95 lines (1174 → 1079)

---

## 2026-03-10 (pass 6 — CSS cleanup)

### Changed
- **11-token semantic type scale** — all 69 unique `font-size` values replaced with `var(--fs-*)` tokens (`--fs-caption` through `--fs-hero`) defined in `:root`; rem values chosen so the responsive base (16/17/18px) scales all text automatically
- **Font-family standardised** — two DM Sans fallback variants collapsed to `"DM Sans",system-ui,sans-serif`; Archivo Black fallback changed from `"DM Sans",sans-serif` to `"Archivo Black",sans-serif` (no secondary face)
- **4px grid enforced** — all `padding`, `margin`, and `gap` values now divisible by 4; micro-adjustments (2px, 3px) snapped to 0 or nearest 4px step; off-grid values 5px, 6px, 14px, 18px corrected
- **Duplicate `.cmp-slot-name` rule merged** — two separate declarations for the same selector merged into one; `display:flex;align-items:center;gap:8px` folded into the primary rule
- **Dead `color:var(--g400)` removed from `.cmp-slot-vs`** — property was immediately overridden on the next line by `color:var(--g300)`
- **Dead `--col-capsule` variable and `.col-capsule` rule removed** — element no longer exists in HTML

---

## 2026-03-10 (pass 5)

### Added
- **Fragrance 1 / Fragrance 2 labels** — persistent uppercase labels above the picker cards so context is always visible, even after a fragrance is selected

### Changed
- **cmp-frag-card-name size** — increased from `1.1rem` to `1.4rem` (responsive fallback raised from `.98rem` to `1.15rem`)
- **"Layers Well" → "Layering"** — score card label and edu overlay updated to the clearer term
- **Notes grid now uses pills** — all notes in the 3×3 comparison grid render as `.cmp-note-pill` chips (consistent shape/size); notes in the index are tappable buttons, others are non-interactive spans — replaces the previous mixed `note-link` / plain-text pattern
- **Radar "Character" label centered** — `text-align:center` added to `.cmp-radar-v2-label`
- **Score cards vertically centered** — added `justify-content:center` to `.cmp-score-card` flex column

### Fixed
- **Same fragrance blocked in both slots** — `_renderPickerList` now filters out whichever fragrance is already selected in the other slot
- **Verdict family awareness** — `getVerdict` now checks `fa.family === fb.family`; branches that previously hardcoded "differences in family" now produce contextually correct copy when both fragrances share a family
- **cmp-sticky-bar ghost space** — bar was `opacity:0` but still occupied ~50px of height; replaced with `max-height:0; overflow:hidden; padding:0` approach so no layout space is consumed when not visible

---

## 2026-03-10 (pass 4)

### Fixed
- **Picker dropdown width** — picker panel now inherits the exact pixel width of its anchor element (card or sticky slot) instead of a hardcoded 320px, so it always aligns flush with the selector
- **Picker `maxHeight` constrained** — available viewport height below the anchor is calculated at open time (`window.innerHeight − anchor.bottom − 12`); prevents picker from rendering off-screen at shorter viewport heights
- **Picker anchors to source element** — `_openFragPicker` now accepts a `sourceEl` argument; card clicks and sticky-slot taps both pass their own element, so the dropdown anchors to whichever trigger is visible (the card when at top, the sticky slot when scrolled)
- **Sticky scroll observer** — `_initStickyScroll` was observing the removed `#cmp-slots-bar` element; updated to observe `#cmp-header` (the persistent card row), restoring the sticky-bar show/hide behaviour on scroll

---

## 2026-03-10 (pass 3)

### Added
- **Colored dot before slot name** — each filled slot in the compare slot bar now shows a family-accent dot before the fragrance name (matches the dot shown in the brand row)
- **Radar between score cards** — character radar chart moved from below the notes grid to a center column between the Similarity and Layers Well score cards; stacks cleanly at any width
- **Picker anchored to column (≥768px)** — at tablet/desktop widths the fragrance picker drops down as a fixed 320px panel anchored below the clicked slot: left-aligned for slot A, right-aligned for slot B; mobile keeps full-screen centered overlay
- **Design system §2.6 Compare Components** — new section documents: score meter, 3-col notes grid, frag-picker-item, house detail panel, mini radar in swap suggestions

### Changed
- **"vs" divider** — slot bar "VS" changed to lowercase "vs", DM Sans 400 weight, `--g400` color (lighter, less dominant)
- **"Similar" → "Similarity"** — score card label updated for grammatical consistency; edu overlay title updated to match
- **Similarity meter range labels** — updated to plain-language scale: 0–25 "Very different", 26–50 "Notably different", 51–75 "Fairly similar", 76–100 "Nearly identical"
- **Note-link underline in compare grid** — `text-decoration-color` changed from `--g200` (invisible) to `--g400` (visible); hover matches detail sheet (`--black`)
- **Slot bar at 480px** — removed `flex-direction:column` from `@media(max-width:767px)` so the slot bar stays horizontal at all widths; added `@media(max-width:480px)` padding reduction to `14px 12px`

---

## 2026-03-10 (pass 2)

### Added
- **Default pair on load** — compare page pre-fills a high-layering-compatibility pair on first load instead of showing blank slots (samples first 40 fragrances, picks max `scoreLayeringPair`)
- **Score meter** — each score card now shows a thin track with a dot indicator at the exact percentage and tick marks at 25 / 50 / 75%; fills in the accent color
- **Range labels** — category label beneath each meter; Similar: "Very different / Contrast well / Related / Almost the same"; Layers Well: "Don't layer / Not ideal / Ok together / Great together"
- **House detail view** — clicking any brand name in catalog opens a detail panel: brand name, fragrance count, alphabetical list of all house fragrances in frag-picker-item style
- **Slot chevron** — small ▾ indicator in bottom-right of each slot card signals it's tappable
- **Note-links in compare** — notes in the 3×3 grid are now `<button class="note-link">` hyperlinks; clicking opens the note detail panel (same as fragrance detail sheet)

### Changed
- **Score card label** — "Match" renamed to "Similar" for clearer plain-language meaning
- **Notes grid** — removed 42px row-label column; Top/Mid/Base labels moved into the shared center column as inline section headers; all cells center-aligned
- **Swap suggestions** — removed ≈ Similar / ↑ Different / ≠ Contrasting attribute groups; replaced with family name + top 3 notes + mini radar polygon (56×56 SVG); mini radar opacity lifts on hover
- **Detail compare CTAs** — removed "Fragrance One / Fragrance Two" labels; buttons now read "Frag vs [CMP_A.name]" / "Frag vs [CMP_B.name]" with actual fragrance names
- **Catalog rows** — `renderCatRow` now outputs `frag-picker-item` structure (round dot, name, brand · family); removed top-note chips and role symbols from list view
- **Catalog sort** — brands sorted alphabetically; fragrances within each brand sorted alphabetically
- **Back/close buttons** — ← replaced with SVG chevron-left `<path d="M9 3L5 7l4 4">`; sheet and detail close buttons read "Close" (not "✕")
- **Verdict font** — increased slightly to 1.05rem
- **`.cmp-slots-bar` margin** — removed top/bottom margin (was `20px 0 28px`)
- **Frag picker item height** — padding reduced to `10px 18px`; brand margin-top removed → ~64px row height

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
