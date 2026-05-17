## 2026-05-17

### Added
- **Transparency in Scoring:** Exposed mathematical breakdowns for similarity scores and layering suggestions directly in the UI. Similarity features now display detailed family, notes, sillage, and roles scores. Layering suggestions detail family, sillage, and unique notes scoring. This eliminates the "black box" feel behind app recommendations.

## 2026-04-13

### Changed
- **Landing page** — Removed `.landing-card-head` class and redundant inline `font-family`/`letter-spacing`/`margin` overrides from feature cards. Rely on `text-ui-strong` defaults.
- **Responsive CSS** — Removed `.brand-n` and `.brand-c` font-size overrides (unnecessary downsizing no longer needed).
- **Settings panel** — Added `text-ui-strong` to `.list-item-label` in changelog and design system nav items.

### Fixed
- **Chip layout** — Added `align-self: flex-start` to `.chip` base rule so family chips never stretch to full row width inside flex-column containers (e.g. frag detail header, note detail header).
- **Mobile compare cards** — Carousel was collapsing to 24px (suggestions div consumed all panel height). Fixed by giving `.cmp-mobile-cards` an explicit `height: calc(100svh - 130px)` and `align-items: stretch` so cards fill the viewport and card body scrolls within each card.
- **Compare description cell** — `class="text-body cmp-m-desc"` replaced with `class="text-body"`. Feature typography class removed. Layout handled via `[data-row="description"]` CSS attribute selector instead of `:has(.cmp-m-desc)` hack.
- **Mobile card description** — `class="text-meta cmp-m-card-desc"` replaced with `class="text-meta"`. `cmp-m-card-desc` CSS rule removed.
- **Brand chips in Saved panel** — `saved-brand-chip` custom class migrated to `.btn.btn--secondary`. CSS rule removed.

### Changed
- **`_renderRowCell`** — Cell `<div>` now includes `data-row="${rowId}"` attribute, enabling CSS targeting by row type without brittle class selectors.

## 2026-04-10

### Changed
- **House Detail panel** — Brand name changed from centered uppercase `.house-detail-name` to left-aligned `.dc-name` (display font, consistent with fragrance detail). Fragrance count label migrated to `.sec-label`. Full fragrance list container migrated from `.house-detail-list` (custom bordered wrapper) to `.list-view` with inline structural styles. Known For carousel cards updated to show family dot + label at top-left, fragrance name below — matches container-demos proximity hierarchy.
- **Note Detail panel** — "Defining Fragrance" migrated from broken `card card--interactive list-item` class combo (conflicting flex directions and padding) to a clean `.list-item` inside a bordered `.list-view` wrapper. Also made the reference fragrance button tappable (navigates to frag detail on click).
- **Notes Explore — Family cards** — Removed redundant `.section-group` from `card section-group` (`.card` already has `flex-column gap-md`); inner layout uses direct children per card container rules.
- **Notes Explore — Reference Scent** — Removed the `style="padding:0; border:none; background:transparent;"` hack on `.list-item`. Now uses a proper bordered `.list-view` container with a full `.list-item` button. Click handler added to navigate to the reference fragrance detail.
- **Notes Explore — Quiz CTA** — Removed `card--interactive` and `section-group` from the quiz card (card is not itself the clickable element; the button inside is). Inner redundant `section-group` wrapper removed; card gap drives spacing.
- **Notes Explore — Power Pairs** — `card card--secondary section-group` → `card card--secondary`. Inner `section-group` wrappers removed. "Example Evidence" replaced hacked `.list-item` with a `.callout` block.
- **Byredo / Global quiz results** — `house-detail-list` class → `.list-view` with inline border/radius; selectors updated to use element IDs.
- **CSS cleanup** — Removed dead `.house-detail-name`, `.house-detail-count`, `.house-detail-list` CSS blocks (~20 lines).

## 2026-04-09

### Changed
- **Container standardization** — Adopted 4 consolidated rules across all panels: universal left-alignment (`align-items: flex-start; text-align: left` baked into `.card` and `.banner`), standardized padding (`--sp-md` for carousel/interactive, `--sp-lg` for static), design system typography (`text-ui-strong`, `text-meta`), and proximity logic (`--sp-xs` for tight groups).
- **Carousel cards** — Width updated 136px → 160px; padding reduced to `--sp-md` via `.carousel-card.card` specificity rule; dead class names (`carousel-card-family`, `carousel-card-name`, `carousel-card-brand`) replaced with design system utility classes.
- **Dupe Lab** — Outer class changed from `.dupe-card` to `.list-item`; interior slot structure was already correct.
- **Quiz attribution callout** — `.quiz-attribution` → `.callout`; duplicate CSS removed.
- **Quiz result cards** — Migrated from `.quiz-result-card` bespoke component to `.card.card--interactive` with inline flex layout; 8 dead CSS rules removed.
- **DESIGN.md** — Added Container Rules section documenting the 4 consolidated rules; deprecated table updated with all migrated classes.

### Changed
- **Compare: icon buttons** — Swap (⇄) and Remove (×) buttons in column headers now use SVG icons (`arrowsLeftRight`, `trash`) consistent with the rest of the icon system. Sort direction indicators also use SVG arrows instead of ↑↓ glyphs.
- **Compare: larger mini radar** — Mini radar charts in mobile cards increased from 80px to 110px, with axis labels scaled up from 4.5px to 7px for legibility.
- **Quiz: session key migration** — Quiz session storage now uses `quizId` instead of `slug` for the key field, and includes `timestamp` and `answers` alongside results. Existing sessions with the old key restore correctly via fallback.
- **Static pages: search input markup** — Quiz and compare static pages updated to use the shared `cat-search-icon` + `.input` markup pattern matching `app.html`.
- **HTML: removed orphaned compare containers** — `#cmp-below-matrix`, `#cmp-shared-notes`, `#cmp-best-pairings` placeholders removed from `app.html`; functionality is now inline in the matrix render.

### Fixed
- **Compare: panel visible on all pages** — `#p-compare { display: flex }` in `components.css` (and a duplicate in the responsive.css desktop block) used ID specificity to override `.panel { display: none }`, making the compare panel always visible regardless of active state. Removed the offending `display` declarations so the standard `.panel` / `.panel.active` visibility system applies.
- **Compare: mobile carousel blocked** — `overflow-x: hidden` on `#p-compare.active` in the mobile breakpoint was removed; the panel now scrolls only vertically (`overflow-y: auto`), leaving the `.cmp-mobile-cards` horizontal carousel unclipped.

## 2026-04-06 (3)

### Added
- **Compare: suggestions section** — Scrolling below the matrix reveals "Similar to compare" and "Try layering with" recommendation rows. Each suggestion shows family dot, name, brand, and an Add button to pull it directly into an empty compare slot.

### Changed
- **Compare: drag-to-reorder columns** — Replaced ← → arrow move buttons with HTML5 drag-and-drop. Dragging a column header swaps it with the drop target. Dragging column is visually dimmed; drop target gets an accent outline.
- **Compare: sort controls moved inline** — Sillage and Structure sort buttons now appear inline next to their respective row labels in the sidebar, not in the header corner.
- **Compare: notes rows cohesion** — Removed border between Top, Heart, and Base note rows so the three rows read as a single grouped section.
- **Compare: description font size** — "About" description now uses `.text-body` (16px) instead of `.text-meta` (14px), matching the visual weight of the primary fragrance copy.
- **Compare: compact column headers** — Removed star button and arrow move buttons. Header is now a 2-line layout: name + ⇄/× actions on top row, brand · chip on second row.
- **Compare: pairs badge specificity** — Badge only shows "Pairs with [name]" when the named partner is actually present in the current comparison. No percentage shown.

### Fixed
- **Compare: matrix compressed by suggestions** — `#cmp-suggestions` appended as a flex sibling of `#cmp-matrix` inside the fixed-height `overflow: hidden` panel caused the matrix to shrink to ~210px. Fixed by changing desktop `#p-compare` to `overflow-y: auto` and adding `flex-shrink: 0` to `#cmp-matrix`, so the matrix holds its content height and the panel scrolls.

## 2026-04-06 (2)

### Added
- **Compare: sensory radar legend** — Sidebar for the Sensory row now shows a numbered 1–5 key (Freshness, Sweetness, Warmth, Intensity, Complexity). Each pentagon's vertices carry matching tiny "1"–"5" labels in the fragrance's family accent color.
- **Compare: role chip explanations** — Role chips (Casual, Intimate, etc.) are now tappable buttons. Clicking opens a detail panel with the role's symbol, short description, and full definition from `data/roles.json`. Works on both desktop matrix and mobile cards.
- **Compare: sort by metric** — Sort buttons appear inline next to Sillage and Structure row labels. First click = descending (↓), second = ascending (↑), third = unsorted. Uses `.tab` pattern with `aria-pressed`.

### Changed
- **Compare: header swap vs. detail split** — Clicking the fragrance name/brand now opens the fragrance detail panel. A dedicated "⇄ Switch" button in the header opens the swap search.
- **Compare: consistent Add button label** — "Add fragrance" now appears identically on desktop and mobile.

## 2026-04-06

### Changed
- **Compare: removed below-matrix section** — `#cmp-below-matrix` (Shared Notes + Best Pairings) removed from `app.html`, all 5 static compare pages, and all associated JS/CSS. The section consumed too much vertical space and blocked matrix content.
- **Compare: inline pairing badge** — When two fragrances score ≥60% similarity, a "Pairs well · XX%" badge now appears inline in each column header instead of a separate sheet below.

### Fixed
- **Compare description row truncated** — "About" row description text was visually cut off due to a flex/CSS Grid intrinsic-sizing interaction where wrapped text height wasn't propagated to the grid row. Fixed by switching the description cell to `display: block`, ensuring the row auto-sizes to the full text height.

## 2026-04-05

### Fixed
- **Compare matrix grid cascade** — Grid rows shifted by 1 and cascaded whenever any slot was unfilled (`showAdd = false`). Root cause: `--cmp-add-width: 0px` left a phantom 0px column track in the CSS grid; auto-placement flowed cells into it, misaligning every subsequent row. Fix: `renderMatrix()` now sets `grid-template-columns` directly via JS, omitting the add-column track entirely when not needed. Responsive sidebar width handled via new `--cmp-sidebar-w` CSS variable (160px default, 180px at ≥1100px).
- **Compare fragrance switching broken** — `closeUniversalSearch()` was nulling `_usContext` before the selection handler could read it. Fixed by capturing `_usContext` into a local `ctx` variable before calling close, so the slot index is never lost.
- **Shared notes not highlighted** — Matrix note tag cells now compute a `sharedNoteSet` across all filled slots and apply `.tag.shared` to any note appearing in 2+ fragrances. Same logic applied to mobile card carousel.
- **+ Add button redundant with empty slots** — "+ Add" column now only appears when every current slot is filled. Previously it showed alongside empty "Select a fragrance" placeholders, creating two competing affordances for the same action.

### Changed
- **Family row removed from matrix** — Family is already shown as a colored chip in each column header; the dedicated attribute row was a duplicate.
- **Description row added to matrix** — New "About" row shows the fragrance description text. Also shown in mobile cards above the notes sections.
- **Sillage/Structure label moved left** — Score (`7/10`) now appears to the left of the bar so it reads with the row label before scanning the bar. Fixed-width `2.8em` right-aligned so values stack cleanly.
- **Roles chips capitalized** — First letter of each role chip is now uppercased via `charAt(0).toUpperCase() + r.slice(1)` in both matrix and mobile cards.
- **Top color bar removed** — `.cmp-m-col-top-bar` (4px family-color stripe at top of each column header) removed from both desktop matrix columns and mobile cards. Family color is conveyed by the chip instead.
- **Inline `style="opacity:0.4"` replaced** — All placeholder dash/em values now use `.cmp-m-empty-val` utility class. Removed from `_renderRowCell` and `_renderMobileCards`.

## 2026-04-04

### Added
- **Multi-fragrance compare matrix** — Replaced 2-frag 3-rail compare with an Audubon-style CSS Grid matrix that scales to 2–5 fragrances. Desktop: sticky left sidebar of attribute rows (Family, Top/Heart/Base Notes, Sillage, Structure, Sensory Profile, Roles) + horizontally scrollable fragrance columns. Ghost "+ Add" column always visible up to 5 slots; disappears when all 5 are filled.
- **`CMP_SLOTS[]` state array** — Primary compare state is now an array of up to 5 frags. `CMP_A`/`CMP_B` kept as compat aliases reflecting `CMP_SLOTS[0]`/`[1]`. New setters: `setCmpSlot(idx, frag)`, `removeCmpSlot(idx)`, `openCmpSlot(idx)`, `addCmpSlot()`.
- **Per-column mini-radar** — 80×80px SVG shape per fragrance column (freshness/sweetness/warmth/intensity/complexity). Shape-only, no axis labels. `role="img"` with `aria-label` enumerating all 5 axis values for screen readers.
- **Shared Notes callout** — Below-matrix section showing notes appearing in 2+ selected fragrances as a tag cloud with `×N` count chips. Hidden when no notes are shared.
- **Best Pairings** — Below-matrix section computing all C(n,2) pairwise scores, filtering ≥60, showing top 2 with a 1-sentence narrative summary. Hidden entirely when no pair reaches 60%.
- **Mobile card carousel** — Separate `_renderMobileCards()` renders full-content snap cards on mobile (`scroll-snap-type: x mandatory`). Matrix grid hidden; carousel shown. Navigation dots and keyboard arrow key support via `initCarouselKeyNav`.
- **N-slot URL schema** — `/compare/id1/id2/id3` (up to 5 IDs). Backward-compatible with all existing `/compare/id1/id2` URLs. URL updates on slot add/remove.
- **`_simCache` memoization** — `scoreSimilarity()` now reads/writes a keyed cache (`id1:id2` alphabetical) so repeated pairwise calls during matrix render are O(1) after the first computation.

### Changed
- **3-rail compare layout retired** — `.cmp-layout-3col`, SVG Venn diagram, narrative/verdict text, back-to-back performance bars, overlaid 2-polygon radar, and discovery rails removed. All replaced by the matrix.
- **Universal search** — Updated `openUniversalSearch` to accept `{slotIdx: N}` for matrix slot targeting (alongside legacy `{slot: 'a'|'b'}`). Results exclude all currently-filled slots.
- **5 static compare pages updated** — All `/compare/*/index.html` files updated to the new matrix panel HTML structure.

## 2026-04-03 (continued)

### Fixed
- **Compare content cut-off** — `height: calc(100vh - var(--col-nav-h))` and `overflow: hidden` moved from the base `.cmp-layout-3col` style to the `@media (min-width: 1100px)` block only. Non-desktop viewports no longer get a fixed-height container that truncates content; the parent panel scrolls instead.
- **Compare card brand label centered** — Added `text-align: left` to the brand `div` in `_fillCard()` so the brand name is flush-left under the fragrance title.
- **Compare card title inline override** — Removed `style="font-size: var(--fs-title);"` from the title div in `_fillCard()`. Title now uses `.text-ui-strong` as defined in the design system, no inline override.
- **"Best For" chips using 1-off component** — Swapped `.frag-ctx-chip` / `.frag-ctx-chips` for the design system `.tag.text-meta` class. Removed custom `.frag-ctx-chips`, `.frag-ctx-chip`, `.frag-ctx-chip--neutral` CSS.
- **Narrative abbreviated names** — `getCompareNarrative()` was using `fa.name.split(' ')[0]` for short names. Changed to full `fa.name` / `fb.name` so fragrance names are never truncated in the decision text.

### Changed
- `.tabs.tab--xs .tab` — Added cascade rule so when `tab--xs` is applied to a `.tabs` container (rather than individual buttons), child `.tab` elements correctly inherit the compact size (`fs-caption`, micro padding, no min-height).

## 2026-04-03

### Fixed
- **Compare stat block card styling** — Added `.cmp-stat-block`, `.cmp-stat-header`, `.cmp-stat-label`, `.cmp-stat-value`, `.cmp-block-content` CSS. Previously these classes had zero styles so each block in the middle rail rendered as unstyled floating content.
- **Notes grid no gridlines** — Added `.cmp-notes-grid`, `.cmp-notes-row`, `.cmp-notes-col--shared` CSS and updated `render3x3Notes()` to emit these classes. Row dividers and shared-column borders now visible.
- **Discovery rail edge bleed** — `.cmp-rail-discovery` desktop padding changed from `var(--sp-sm) 0` to `var(--sp-sm) var(--sp-lg)` so content is no longer flush against the container edge.
- **Compare panel cut-off height** — `.shell` changed to `height: 100vh; overflow: hidden` to create a fixed scroll context. Added `flex: 1; min-height: 0` to `.col-main`, `col-main-content`, `#p-compare`, `#p-catalog`. On mobile `#p-compare.active` now has `overflow-y: auto` so the full scrollable compare stack is reachable.
- **Compare panel bleeding into Notes page** — Removed `display: flex` from `#p-compare` in the mobile `@media (max-width: 767px)` block. The selector is now `#p-compare.active` so the panel only activates when actually navigated to.

### Changed
- `content-row` flex alignment changed from `flex-start` to `stretch` so `.col-main` fills the full viewport height.
- `.cmp-stats-scroll` mobile override now uses `overflow: visible` (parent panel scrolls); desktop keeps `overflow-y: auto` inside the capped 3-rail layout.

## 2026-04-02

### Fixed
- **Static compare pages** — All 5 `/compare/*/index.html` files updated to the new 3-rail layout (`cmp-layout-3col`). Pages now load and render compare results correctly. Previously broken since the 3-rail migration.

### Added
- **Compare Stories** — `getCompareNarrative(a, b)` produces 2–3 decision sentences rendered above the compare metrics in `#cmp-stats-scroll`. Answers "what makes A different from B" using profile deltas from `computeProfile()`. Template-based, not LLM.
- **"Best For" context chips** — `getBestFor(frag)` derives Season / Occasion / Projection chips from existing `family` and `sillage` data. Rendered as `.frag-ctx-chips` row in the detail panel, below More Like This.
- **More Like This elevation** — Section moved above the stat grid in `renderFragDetail()`. Swap-reason labels reformatted as `"Name — distinguishing trait"` sentence style.
- **Compare CTA reframe** — Empty slot button copy updated to "Trying to decide? Compare [name]".

### Changed
- `renderFragDetail()` restructured: More Like This + Best For chips now appear before the stat grid / sensory profile / scent journey sections.
- Added `.frag-ctx-chips`, `.frag-ctx-chip`, `.frag-ctx-chip--neutral`, `.cmp-decision-framing` to `styles/components.css`.

## 2026-03-28

### Changed
- **Scents API migration complete** — updated `api/fragrance.js`, `api/compare.js`, `api/quiz.js`, `api/og.jsx`, `api/og-quiz.jsx`, `test/fragrance-api.test.js`, `scripts/build-static.js`, `scripts/build-sitemap.js`, and `validate.js` to use `data/scents.json` instead of `data/scents-flat.json`. All 16 tests pass.

### Removed
- Deleted `data/scents-flat.json`, `data/scents-index.json`, `data/scents/` (12 brand files), `scripts/build-flat-scents.js`, `data/MIGRATION-SCENTS.md`, and `styles/layout.css_temp` — 16 files removed. `data/scents.json` is now the single source of truth for all consumers.

## 2026-03-28

### Changed
- **Design system token audit** — Added 3 undefined tokens referenced throughout `components.css`: `--g50` (lightest gray, #F0EDE5), `--fs-sm` (13px), `--fs-body-sm` (15px).
- **Undefined token refs fixed** — `var(--lh-body)` (8 uses) → `var(--lh-relaxed)`; `var(--radius-md)` (2 uses) → `var(--radius-lg)`; `font-size: var(--fs-sm)` (3 uses) → `var(--fs-meta)`; `var(--text-xs, 10px)` → `var(--fs-caption)`.
- **Duplicate CSS blocks removed** — Merged duplicate definitions for `.stat-grid`/`.stat-card`, `.picker-header`/`.picker-hero`, `.picker-list`/`.picker-row`, `.cmp-frag-card-name-row`, `.cmp-frag-card-brand` (5 duplicate blocks → single canonical definitions).
- **Dead CSS removed** — `.dc-eyebrow`, `.dc-brand-btn:hover`, `.cmp-brand-btn`, `.cmp-brand-btn:hover` deleted (no references in HTML or JS).
- **Catalog empty state** — Migrated `.cat-empty-clear` button → `.btn.btn--secondary` in `app.js`; removed 1-off CSS class from `components.css`.
- **Won't-fix documented** — `.gap-cta`, `.picker-sec-lbl`, `.frag-sb-label`, `.dc-stat`/`.dc-stats` added to TODOS.md "Design System — Won't Fix" table with rationale.

## 2026-03-27

### Changed
- **Compare card touch targets** — Swap chevron moved inline with the fragrance name (was `position:absolute` at bottom-right). Name + icon form a single clear "tap to change" row. Removed family accent `border-color` from filled card state — the family chip already communicates membership.
- **Nested button removed** — Brand name inside tappable compare card was an accessibility violation (nested interactive elements). Brand is now non-interactive `text-meta` inside the card; brand link and "Details ↗" move to the action area below the card as `.text-link` buttons.
- **Score cards stacked vertically** — Side-by-side layout implied the cards belonged to left/right fragrances respectively. Now full-width, stacked, unambiguous.
- **Score label consistency** — `_simLabel` unified with edu sheet language: "Different worlds" / "Distinct contrast" / "Good match" / "Kindred spirits". `_layLabel` likewise: "Better as alternates" / "Possible, with care" / "Works together" / "Complementary pair".
- **Score education sheet** — Custom header (emoji close, `cmp-edu-header`) replaced with standard `.sheet-topbar` / `.sheet-title` / `.sheet-close` using `ICONS.close`. Custom element-level `cmp-edu-*` typography classes removed; replaced with design system classes (`text-meta`, `text-ui-strong`, `text-body`). Score math breakdown replaced with `.list-view` / `.list-item` rows.
- **Character map heading** — "Character" label now uses `.sec-label` for correct eyebrow typography. Mobile: SVG centered via flex on `.cmp-radar-v2-wrap`.
- **Character map radar** — Polygon B dashed stroke removed; color alone differentiates the two fragrances. Labels pulled ~8% closer to polygon edge (radius 1.22 from 1.32).
- **Social proof integrated** — Shared note count no longer appears as an orphan paragraph. Woven into the verdict sentence ("They share N notes — more overlap than X% of cross-brand pairs.").
- **Share Comparison button removed** — No clear sharing destination; cut.
- **Notes grid column headers** — Fragrance name columns now use `.sec-label`; Top/Heart/Base layer label uses `.text-meta`.
- **CSS cleanup** — Deleted `cmp-edu-header`, `cmp-edu-intro`, `cmp-edu-quad-tag/title`, `cmp-edu-card-title/desc`, `cmp-edu-card-notes-frag/list`, `cmp-edu-suggestion-label/name`, `cmp-edu-math*`, absolute chevron rule, dashed legend line, and filled card border-color rule.

## 2026-03-25

### Changed
- **Panel spacing standardization** — Global padding moved from `.col-main-content` to individual `.panel` elements. Panels now use `display: flex; flex-direction: column; gap: var(--sp-3xl)` (32px) for consistent top-level section spacing.
- **`.section-group` component** — New canonical wrapper for `.sec-label` and its content. Enforces `gap: var(--sp-md)` (12px) for proximity while letting the parent panel's larger gap handle inter-group spacing.
- **Saved panel hierarchy refactor** — "Your Profile" title standardized to `.text-heading`. "Your Olfactive DNA", "Shop Your Stash", and "Your Journal" sections now use the `.section-group` pattern, eliminating all magic margin numbers and inline styles.
- **Quiz result & question refactor** — Standardized spacing in both Byredo and Global quizzes. Questions and results now follow the `.section-group` pattern for consistent visual weight.
- **Compare results standardization** — Notes grid, Scatter plot, and Suggestions sections wrapped in `.section-group`. Removed redundant bottom margins from swap columns.
- **Note popup & gallery cleanup** — Removed all remaining inline magic margins from the note popup and family cards. Wrapped "In catalog" and "Extraction/Fact" sections in `.section-group`.
- **Spacing system: section label proximity** — `.sec-label` margin-bottom reduced from 16px → 8px (`--sp-lg` → `--sp-sm`). Labels now sit closer to the content they title, satisfying gestalt proximity.
- **`.detail-section` grouping container** — New CSS rule converts `.detail-section` from a bottom-margin pattern to a flex column with `gap: var(--sp-sm)` (8px label-to-content). Overrides `.sec-label margin-bottom` to zero inside groupings. Parent `.detail-inner gap: var(--sp-2xl)` (24px) now drives all inter-section spacing.
- **`renderFragDetail` spacing refactor** — Wrapped "Compare with", "Sensory Profile", and "Scent Journey" sections in `.detail-section`. Removed all inline `style="margin-bottom:var(--sp-*)"` from direct children (eliminated double-spacing with parent gap). Removed redundant `.dc-div` divider.
- **`renderHouseDetail` spacing refactor** — Wrapped "Fragrance Families", "Known For", "Similar From This House", and "Fragrances" sections in `.detail-section`. Removed `margin-bottom:var(--sp-3xl)` inline wrappers (was adding 32px on top of parent 20px gap = 52px total).
- **`renderNoteDetail` spacing refactor** — Removed all inline `margin-bottom` from header, description, save-btn, and metadata divs. Wrapped "In catalog (n)" section in `.detail-section`.

## 2026-03-24

### Added
- **State bar collection counts** — Owned and Wishlist tabs now show live counts: "Owned (2)", "Wishlist (1)". Updates on every catalog rebuild.
- **Quiz result persistence** — Quiz results saved to `sessionStorage` key `sm_quiz_session`; navigating away and back restores results without re-taking the quiz.
- **Carousel keyboard activation** — Enter/Space now activates the focused carousel card in addition to ArrowLeft/ArrowRight navigation.
- **Golden Pairs keyboard nav** — `initCarouselKeyNav` wired to the Golden Pairs carousel; all carousels now have roving tabindex + keyboard activation.

### Changed
- **"More Like This" diversity** — 5th suggestion is now a family-diverse wildcard (different family from top 4) instead of purely rank-5 by similarity.
- **Profile bar ARIA** — Sensory Profile bars now include a visually-hidden `<meter>` element with `aria-label` for screen readers. Visual appearance unchanged.
- **Brand card hover** — `.carousel-card--brand` now has an explicit `:hover`/`:focus-visible` state (background + border) for imprecise-cursor users.

### Fixed
- **Inline style violations** — `padding:2px` → `var(--sp-xs)`, `marginBottom:6px` → `var(--sp-xs)` (off-grid values); `.cmp-score-meter` margin-top consolidated into base CSS rule.

## v1.3.1 — Stable Release (2026-03-24)

Design system QA pass, discovery shelf bug fixes, and fragrance detail stat grid repair.

### Fixed
- **Discovery shelf badges** — `.chip.contrasts` and `.chip.complements` CSS added; Contrasts/Complements badges in Brand Discovery now render with correct accent colors.
- **Fragrance detail stat grid** — `stat-grid` and `stat-card` CSS classes added; Sillage, Structure, and Sensory Profile metrics now have proper layout and spacing.
- **Deep-link col-main restore** — `closeDesktopDetail` now restores `.col-main` visibility after `/fragrance/:id` entry; navigating away from a deep-linked fragrance no longer hides the catalog column.
- **DESIGN.md accuracy** — removed phantom `--owned`/`--wish` list-item variants; replaced nonexistent `.list-item-chip` with `.list-item-badge` in slot contract diagram.
- **`aria-pressed` on role filter tabs** — `makeFeelBtn()` now sets and toggles `aria-pressed`, matching all other filter bars.
- **Migrated `.cmp-note-pill` → `.tag`** — Compare notes and detail note links use the generic `.tag` component; 30 lines of deprecated CSS removed.

### Added
- **designsystem.html demos** — `.list-item--compact`, `.list-item--search`, and full slot structure demos added to the Lists section.
- **CSS comments** — annotated intentional off-grid px values in components.css and layout.css.

---

## v1.3.0 — Stable Release (2026-03-23)

Fragrance detail pages (213 URLs), deep-link routing, consolidated scent data (scents.json), and design system refinement.

---

## 2026-03-23

### Added
- **Individual fragrance pages** — `/fragrance/:id` serverless route (213 URLs). SEO meta tags, JSON-LD Product schema, FAQ structured data targeting gift-intent queries ("What to get someone who loves [frag]", "Is [frag] a good gift?"), noscript fallback with full note pyramid and gifter CTA. Reuses `app.html` shell + existing `openFragDetail()` client-side renderer.
- **Fragrance deep-link routing** — `handleInitialNavigation` now handles `/fragrance/:id` pathname, auto-opens detail panel for the matched fragrance.
- **Sitemap expanded** — 213 fragrance URLs added (`/fragrance/{id}`, priority 0.7). Total indexable URLs: ~230.
- **Fragrance API test suite** — `test/fragrance-api.test.js` (16 assertions): valid/invalid IDs, XSS prevention, JSON-LD integrity, all 213 fragrances render, sitemap coverage check. Run with `node test/fragrance-api.test.js`.
- **Browser integration tests** — new "Fragrance page deep-link" suite in `tests.html`: regex validation, `openFragDetail` renders detail + similar shelf.

### Changed
- **Scent data consolidated** — replaced `scents-flat.json` + `scents-index.json` + 12 per-brand files with a single `data/scents.json` flat array (213 fragrances). Startup HTTP requests reduced from 16 (waterfall) to 4 (parallel).
- **`store.js`** — two-phase waterfall fetch replaced with single `Promise.all` fetching `scents.json` directly.
- **`quiz.js`** — primary fetch updated to `scents.json`; removed 20-line fallback that re-did the per-brand waterfall. Quiz result cards now have access to `frag.url`.

### Added
- **`data/scents.json`** — canonical 213-fragrance flat array with `id`, `brand`, `name`, `family`, `sillage`, `layering`, `top[]`, `mid[]`, `base[]`, `roles[]`, `description`, `url`, `story` fields.

## 2026-03-21 (Project Hygiene)

### Changed
- **CHANGELOG.md simplified** — 1,189 lines → 108. Collapsed 40+ micro-commits into 6 dated summaries. Stripped token sweeps, class rename minutiae, and routing hotfix chains.
- **TODOS.md simplified** — ~500 lines → ~170. Removed all shipped ~~TODO~~ entries, stripped verbose design specs from active items, flattened P2-A/B/C/D sub-structure, collapsed P3 into a table. Added Infrastructure section with scent data consolidation TODO.
- **DESIGN.md fixes** — Removed `.list-item--compact` from deprecated list (conflicted with Variant guide). Added `.list-item-leading` wrapper to slot structure diagram.
- **CLAUDE.md fixes** — Port corrected 3000 → 3001; `app.js` line count corrected ~5,100 → ~5,000.
- **testing-personas.md** — Stripped stale Gemini CLI action flows; kept 3 persona profiles with "What breaks for X" framing.

### Added
- **`data/MIGRATION-SCENTS.md`** — Engineering plan for consolidating 14 scent data files into a single `scents.json`. Reduces startup from 16 HTTP requests (waterfall) to 4 parallel. Includes generation script, exact diffs for `store.js` + `quiz.js`, deployment order, and verification checklist.

### Removed
- **`GEMINI.md`** — Stale duplicate of `CLAUDE.md` for Gemini CLI. Wrong port, wrong frag count, references deleted architecture.
- **`agents.md`** — Old UI Refactoring Agent prompt template. Work shipped in design system audit.
- **`design-fixes.md`** — Self-marked deprecated since 2026-03-19. All 9 findings shipped.

---

## v1.2.0 — Stable Release (2026-03-20)

Wardrobe Gap suggestions, collection context in detail panels, and design system consolidation.

---

## 2026-03-21

### Added
- **Saved Comparisons** — Compare screen remembers last 5 sessions. "Recent" section appears above picker cards once 2+ valid pairs exist. Tapping a row fills both slots and runs. Auto-deduplicates; stale IDs silently discarded on load.

### Changed
- **Family color system** — deleted hardcoded `CMP_FAM` object. `getCmpFam()` now reads from `--fam-*` CSS tokens via `getComputedStyle`, returning `{accent, accentHex, subdued}`. Canvas/SVG uses `accentHex`; HTML inline styles use `accent`. Five families that previously fell back to gray (citrus, leather, oud, green, chypre) now resolved correctly.
- **Dot classes unified** — single canonical `.dot` (8px) and `.dot--md` (10px) in CSS. Seven duplicate 8px circle definitions removed.
- **Focus ring unified** — single double-box-shadow pattern (`paper gap + resin ring`) for all interactive elements. Per-component border-swap overrides removed from search input and catalog rows.
- **Auth modal dead code removed** — ~190 lines of `.auth-*` CSS and 5 auth functions deleted. Feature was never shipped.

### Fixed
- **notes-card-header text overflow** — added `min-width: 0` to text wrapper so long descriptions no longer extend beyond card boundaries.

---

## 2026-03-20

### Added
- **Wardrobe Gap suggestions** — gap card now shows 2–3 carousel cards (specific fragrances ranked by similarity to collection, filtered to gap families). Falls back to button-only when fewer than 2 suggestions available.
- **Collection context in detail panel** — "In your collection" section below action buttons shows closest owned match (≥30% similarity) with score. Hidden when viewing an owned frag or no close matches exist.
- **Brand Detail — "Similar From This House"** — top 3 fragrances from a brand ranked by `scoreSimilarity()` against collection. Only renders when ≥1 frag owned.
- **Carousel keyboard navigation** — roving tabindex + ArrowLeft/Right on Brand Discovery carousel. Carousel gets `role="list"` + `aria-label`; cards get `role="listitem"`. (a11y P1)
- **Gap CTA screen reader announcement** — `#cat-live` overridden with gap-specific message after tab switch so context change is announced. (a11y P1)

### Changed
- **Plain-language metric labels** — sillage and structure scores show readable descriptions ("Strong — fills a room") alongside numerical value.
- **Brand Discovery** — list rows replaced by horizontal carousel with "Because you like…" personalized reasoning per brand.
- **Notes A-Z view** — redesigned from pills to `.list-item--compact` rows with family dot and label for better scanability.

### Fixed
- **Note layer badge size** — bumped from hardcoded `9px` to `var(--fs-label)` (12px). (a11y P1)
- **Golden pairs copy "undefined"** — `getSwapReason` was reading `.label` on compatibility score objects (always `undefined`); now uses `anchor.family` / `candidate.family` directly.
- **Brand detail sheet empty** — `renderHouseDetail` referenced `ST` (private store variable); replaced with `CAT.filter(f => gst(f.id) === 'owned')`.

---

## 2026-03-19

### Added
- **Universal Search** — ⌘K / `/` opens context-aware modal. Idle state: recently viewed + popular. Typing filters across Fragrances, Notes, and Houses. Compare mode shows live similarity scores against the filled slot. Full keyboard navigation (↑↓ arrows, Enter, Escape).
- **Wardrobe Gap Analysis** — aggregates `computeProfile()` across owned frags, identifies lowest sensory axis, generates natural-language headline + browse CTA. Hidden at 0 owned.
- **Brand Discovery Panel** — up to 6 unexplored brands ranked by similarity to collection. Hidden at 0 owned.
- **Scent DNA Persona Mapping** — collection stats map to one of 8 fragrance archetypes (The Minimalist, The Provocateur, etc.).
- **Global Undo Toast** — 3-second undo window after any owned/wishlist state change.
- **Share Comparison** — uses native share sheet on mobile, clipboard fallback on desktop.
- **Dupe Lab** — similarity scores across full 183-frag database, accessible from fragrance detail panels.
- **Search: diacritic normalization + fuzzy matching** — `xinu` matches `Xinú`; `byedo` finds Byredo (Levenshtein threshold ≤1 for brands, ≤2 for names).
- **Arrow key navigation in catalog rows** — ArrowDown/Up moves focus between adjacent rows.

### Changed
- **Drum-roller fragrance picker removed** — replaced entirely by Universal Search. ~240 lines JS + ~283 lines CSS deleted.
- **List-item design system consolidation** — unified to single `.list-item` component across all 15+ render sites. Old variants (`.list-item-content`, `.list-item--flat`, `.cmp-sug-card`, `.dc-sim-shelf`) removed. Slot renames: `list-item-name` → `list-item-label`, `list-item-sub` → `list-item-sublabel`, `list-item-meta` → `list-item-detail`.
- **DESIGN.md** — Visual Composition Rules added: card taxonomy, section spacing hierarchy, list slot contract with locked typography.

### Fixed
- **Compare URL hard-refresh** — deep-linked `/compare/<id-a>/<id-b>` now always loads both fragrances on refresh.
- **Detail panel layout** — `.col-detail` was collapsing to 0px on desktop due to missing flex wrapper in `app/index.html`; fixed flex structure across all breakpoints.
- **Catalog rows: ARIA + keyboard** — `role="button"`, `tabindex="0"`, `aria-label`, and Enter/Space keydown handlers added to all catalog rows.

---

## 2026-03-18

### Added
- **Scent Archetype Quiz** — 5 questions map to 8 archetypes at `/quiz/scent-archetype`. Shareable result URL.
- **Notes 2.0 — Educational Exploratorium** — three-tab notes panel: Explore (olfactory pyramid, family deep-dives), Search & A-Z, My Notes.
- **"You" dashboard** — Olfactive DNA card (sensory profile bars, archetype), quiz history, recently viewed, collection gap.
- **Golden Pairs** — horizontal carousel of curated same-profile pairs.
- **Role assignments persist** — `RA` saved to `localStorage` (`scentmap_ra`); survives page refresh.

### Fixed
- Various layout, font loading, and routing stability fixes (shell flex structure, Google Fonts loading, Compare auto-select, mobile nav icons).

---

## 2026-03-17

### Added
- **SEO quiz pages** — 5 standalone quizzes at `/quiz/:slug` with dedicated URLs, OG images, and JSON-LD structured data.
- **Shareable compare URLs** — `/compare/<id-a>/<id-b>` with Vercel serverless function for SSR meta tags and OG image generation.
- **Popular Comparisons** — curated pairs grid in compare empty state from `data/popular-comparisons.json`.
- **Static build engine** — `npm run build` generates physical `index.html` files for all quiz and compare routes.
- **Sitemap** — 2,200+ URLs auto-generated by `scripts/build-sitemap.js`.

### Fixed
- Quiz infinite recursion crash (`window.renderQuiz` override).
- Quiz pages stuck on loading (WebHaptics + Supabase SDK were blocking `DOMContentLoaded`).

---

## 2026-03-16

### Added
- **Compare feature** — side-by-side fragrance comparison with SVG Venn overlap (match score), 3-col notes grid (only-A / shared / only-B), mirrored metric bars, role chips, and "More Like This" suggestions.
- **My Collection panel** — Owned, Wishlist, Saved Notes, Saved Brands sections. Copy collection to clipboard.
- **Profile panel** — avatar → profile sheet with collection stats, export, sign out.

### Changed
- **App moved to `/app`** — landing page at `/`; app at `/app`.
- **Desktop nav** — Fragrances, Compare, Notes, Collection tabs; logo wordmark.
- **Mobile bottom nav** — Lucide SVG icons; More sheet for overflow items (Notes, Changelog).
