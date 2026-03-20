## 2026-03-20 (23)

### Added
- **Wardrobe Gap Analysis:** Compact insight block at the top of the Owned catalog tab. Aggregates `computeProfile()` across owned fragrances and identifies the lowest sensory axis. Generates a natural-language headline ("Your wardrobe leans warm and sweet. You're missing a light, airy contrast.") with a CTA button that switches to the All tab and pre-fills search with the gap family. Complete state shows signature axis when no gap is found. Hidden when 0 owned. Accessible via `#cat-live` announcements.
- **Brand Discovery Panel:** "Brands to Explore" section at the top of the All catalog tab. Surfaces up to 6 brands the user hasn't explored (< 2 owned), ranked by average `scoreSimilarity()` against the user's collection. Each row shows the brand name, the closest owned fragrance match with score, and an overall match percentage. Brands with a `url` in `brands.json` get a "Shop →" link (`target="_blank" rel="noopener"`). Hidden when 0 owned; shows "Add more to improve recommendations" when < 3 owned. Full keyboard/a11y support with `role="button"`, `tabindex="0"`, and `aria-label`.
- **New functions:** `computeWardrobeGap()`, `renderWardrobeGap()`, `computeBrandScores()`, `renderBrandDiscovery()` in `js/app.js`
- **New CSS:** `.dna-card--gap`, `.dna-headline`, `.dna-sub`, `.gap-cta`, `.brand-discovery`, `.list-item-shop` in `styles/components.css` — all using design system tokens, no hardcoded values

### Changed
- **Swipe-to-reveal actions removed from catalog rows:** Removed swipe-to-reveal Compare/Wish tray from `.list-item`. Eliminated ~107 lines of swipe CSS (`.list-item-actions`, `.list-item-action`, `--wishlist`, `--compare`, swipe hint `::after`, 4 media query blocks) and all corresponding touch event handlers (`touchstart`/`touchmove`/`touchend`) from `renderCatRow`. Swipe click guard removed from `buildCatalog`. Alternatives remain: double-tap to wish, drag to compare (desktop), detail panel CTAs.
- **`data/brands.json`:** Added `url` field to all 10 existing brands. Added two new brand entries: Tom Ford and Replica (Maison Margiela).

## 2026-03-19 (22)

### Added
- **Visual Composition Rules in DESIGN.md:** Added `## Visual Composition Rules` section codifying three previously undocumented design patterns:
  - **Card taxonomy** — surface color determines border usage: cards on `--bg-primary` use `--bg-secondary` + no border; cards on `--bg-secondary` use `--bg-primary` + `--border-standard`; interactive cards use `--border-subtle` + hover `--border-strong`
  - **Section spacing** — `gap: var(--sp-2xl)` (24px) on the parent flex container for major sections, with a full hierarchy down to `--sp-xs` for tight label+value pairs
  - **List item typography contract** — `.list-item-name` / `.list-item-sub` / `.list-item-meta` are the only permitted classes for name+description text in list rows and cards; display heading exception documented for `.dc-name`, `.np-name`, `.cmp-frag-card-name`
- **Pre-PR checklist extended** with card taxonomy, section spacing, and list typography checks

### Changed
- **`.cmp-frag-card` background:** Changed from `transparent` to `var(--bg-primary)` to match interactive card taxonomy rule (`components.css`)
- **`.dc-description`, `.np-desc`:** Fixed primitive token `var(--g600)` → `var(--text-secondary)` (`components.css`)
- **Parent-managed spacing for compare results:** `#cmp-results` is now a flex column with `gap: var(--sp-3xl)`; removed `margin-bottom` from `.cmp-pair-card`, `.cmp-scatter-v2`, `.cmp-notes-v2`, `.cmp-sug-v2`, `.cmp-social-proof`
- **Parent-managed spacing for catalog:** `#cat-body` is now a flex column with `gap: var(--sp-3xl)`; removed `margin-bottom` from `.cat-section`
- **`.cmp-header` margin → padding:** Changed `margin-bottom` to `padding-bottom` to avoid collapsing margin in the compare panel header
- **Notes body top spacing:** Added `padding-top: var(--sp-lg)` to `#notes-body`; removed `margin-top` from `.notes-grid` and inline `style.marginTop` in the A-Z sort mode
- **`.carousel-card-name` / `.carousel-card-brand`:** Converted to dual-class approach — JS templates now add `.list-item-name` / `.list-item-sub`; component CSS retains only layout overrides (letter-spacing, margin-bottom)
- **`.nf-name` / `.nf-desc`:** Consolidated to `.list-item-name` / `.list-item-sub` in JS templates; orphaned CSS rules removed

### Added (CSS classes)
- **`.dc-story`** — callout/story block in detail panel (`components.css`); replaces inline `style` on `frag.story` template; uses `var(--bg-secondary)`, `var(--border-subtle)`, `var(--text-secondary)`
- **`.np-insight`** — Perfumer's Insight callout block in note detail (`components.css`); replaces inline `style`; matching visual treatment to `.dc-story`
- **`.np-frags-list`** — container for in-catalog list in note popup; replaces inline `style="border:1px solid var(--g200)..."`

## 2026-03-19 (21)

### Fixed
- **Compare search selection bug:** Fixed an issue in `js/app.js` (`_usSelectRow`) where selecting a fragrance from the Universal Search in compare mode would throw a `TypeError`. This occurred because `_usContext` was being cleared by `closeUniversalSearch()` before its `slot` property was read.

## 2026-03-19 (20)

### Fixed
- **Local Dev Server Routing:** Fixed an issue where refreshing the app on localhost resulted in 404 errors or a broken UI. 
  - Restored `app.html` as the primary application shell and updated the Ruby local dev server sync command in `GEMINI.md` to include it.
  - Updated `handleInitialNavigation` and `go()` in `js/app.js` to fallback to hash-based routing (`#compare/a/b`) specifically when running on `localhost` or `127.0.0.1`, bypassing the need for pre-rendered directories during local development.
  - Standardized all navigation links in `index.html` and `js/quiz.js` to use `/app.html#...` instead of `/app#...` for consistent behavior across both local dev and production.
  - Updated `app.html` to include the `universal-search` modal, replacing the deprecated `frag-picker` component.

## 2026-03-19 (19)

### Fixed
- **Compare page refresh:** Regenerated all static pages in `/compare/` and `/quiz/` to match the new `app.html` layout structure, fixing broken CSS and "unfinished" look on refresh.
- **Deep-link rendering:** Fixed a `ReferenceError` in `renderCompareResults` where score variables (`matchPct`, `layerPct`, etc.) were used before definition, which prevented content from rendering on deep-link refreshes.
- **Compare selection state:** Updated `_selectFragForSlot` in `js/app.js` to ensure the URL updates immediately when fragrances are selected, even when already on a comparison page.
- **Redundant renders:** Added guards to `handleInitialNavigation` to prevent state loops when navigating between comparison pairs.
- **Universal Search selection:** Improved selection flow in Compare mode to ensure UI and URL stay in sync.

## 2026-03-19 (18)

### Changed
- **Global detail spacing refactor** — Standardized vertical spacing across all detail views (Fragrance, Note, House, Fragrance Family). Replaced section-level `margin-top` and `margin-bottom` with a container-level `display: flex; flex-direction: column; gap: var(--sp-xl);` strategy.
- **Unified container layout** — Added flexbox and gap to `.detail-inner` (desktop) and `.sheet-content` (mobile) to ensure consistent Section-to-Section breathing room without child-level overrides.
- **Surgical margin removal** — Removed inconsistent margins from 12+ CSS classes (`.dc-name`, `.dc-brand`, `.dc-description`, `.dc-collect-row`, `.np-family`, `.np-desc`, etc.) and 20+ inline style attributes in `js/app.js`.
- **Closer element grouping** — Introduced logical grouping for Name/Brand and Name/Family pairings to maintain tight visual proximity within the larger global gap.

## 2026-03-19 (17)

### Fixed
- **Discovery feel hash routing** (P0-005) — Implemented mapping between user-friendly "feelings" (solar, grounded, romantic, mysterious) and internal Role IDs (heat, work, intimate, cold). Updated `handleInitialNavigation` to prefer `dataset.val` (ID) matching for filter buttons, ensuring deep-links from the landing page correctly activate catalog filters.
- **Scent Journal deep-linking** (P0-006) — Fixed `#journal` hash navigation. The `go` function now correctly maps `journal` to the `p-saved` panel, and `handleInitialNavigation` triggers a smooth scroll to `#journal-content`. Resolved a `ReferenceError` where `go('journal')` attempted to call a non-existent `renderJournal` function.
- **State change aria-live announcements** (P0-007) — Added assertive screen reader announcements to `setState()` in `js/app.js`. When a user wishlists, owns, or removes a fragrance, the `#cat-live` region is updated with a descriptive message (e.g., "Santal 33 added to wishlist"), providing essential feedback for low-vision and keyboard-first users (Nadia persona).
- **Reduced-motion accessibility** (P0-008) — Catalog row swipe actions now respect `prefers-reduced-motion`. For users with tremor (Miguel persona), lateral swipe gestures are disabled in `js/app.js`, and action buttons (Wishlist/Compare) are rendered inline below the content via `styles/components.css`, ensuring full functionality without precise motor requirements.

## 2026-03-19 (16)

### Fixed
- **Compare frag-card padding & layout** (P4-006) — Reverted to original padding to avoid creating new `.cmp-frag-card-body` component. Padding is now consistent with original spec. All spacing is now managed by a single container and standard `gap: var(--sp-xs)`.
- **Collection section spacing** (P4-007) — Resolved tight vertical spacing in the "My Collection" sections. Ensured `.collection-section-hdr` and `.scent-list` have proper breathing room through `var(--sp-md)` and `var(--sp-sm)` margins respectively. Consolidated panel padding for `#p-saved` and `#p-changelog` into `styles/layout.css`, removing inline styles.
- **Swap suggestions header class** (P4-008) — Migrated the "Swap suggestions" heading in `renderSuggestionsV2` from the deprecated `.cmp-sug-v2-label` to the canonical `.sec-label` class for visual consistency with all other section headers.
- **Dupe Lab style extraction** (P4-009) — Refactored to reuse canonical `.cmp-sug-card` and `.list-item` patterns. Removed 30+ inline style attributes. Uses `.list-item-score` and `.list-item-name` for typography. Dupe Lab items now use a consistent `var(--bg-secondary)` background and follow the 4px grid for all internal spacing.

## 2026-03-19 (15)

### Fixed
- **Sensory profile & Dupe meter consolidation** (P4-004) — Consolidated redundant `sensory-bar-*` and `dupe-meter-*` classes into the canonical `.cmp-score-meter-track` and `.cmp-score-meter-fill` patterns. Sensory bars in the detail panel now use the stacked `.dc-stat` and `.sec-label` layout for visual consistency with sillage meters. Removed ~40 lines of duplicate CSS.
- **Scent journey timeline style extraction** (P4-005) — Removed 10+ inline `style=""` attributes from the scent journey timeline in `js/app.js`. Added `.journey-step-title`, `.journey-step-meta`, and `.journey-caveat` classes to `styles/components.css`. Refactored "You might also like" suggestions to use the standard `.cmp-sug-card` pattern.

## 2026-03-19 (14)

### Fixed
- **Olfactive DNA card inline style extraction** (P4-003) — Extracted 10+ inline `style=""` attributes from the Olfactive DNA card in `js/app.js` into specialized CSS classes in `styles/components.css`. Added `.dna-grid`, `.dna-headline--accent`, `.dna-persona-divider`, `.dna-tagline`, `.dna-section-label--mt`, `.dna-gap-info`, `.dna-gap-card`, `.dna-gap-brand`, `.dna-export-btn`, `.dna-bar`, and `.dna-fill`. The DNA card now follows design system tokens for all layout and typography.

## 2026-03-19 (13)

### Fixed
- **Swap suggestion card borders & radius** (P4-002) — Updated `.cmp-sug-card` in `styles/components.css` with `!important` flags for `border`, `border-radius`, and `background` to ensure they override `.list-item` and `.list-item--flat` defaults. Cards now have visible `var(--radius-lg)` corners and a `var(--border-standard)` subtle border.
- **Layering suggestion card consistency** — Added `.cmp-sug-card` class to "Layer with what you own" suggestion rows in `js/app.js` (`buildLayerSuggestions`) to ensure consistent visual treatment across all suggestion components.

## 2026-03-19 (12)

### Fixed
- **.landing-card CSS class** (P4-001) — Added `.landing-card` to `styles/components.css` with proper border-radius (`var(--radius-lg)`), padding (`var(--sp-lg)`), border, and background. Moved `margin-bottom: var(--sp-2xl)` from inline styles to the class definition.
- **Inline style removal (You panel)** — Removed 15+ occurrences of inline `margin-bottom` from the `#you-journal-cta` container and `.landing-card` div across `js/app.js`, `app/index.html`, `app.html`, and all standalone `compare` and `quiz` pages.

## 2026-03-19 (11)

### Fixed
- **Compare URL hard-refresh race condition** — `renderPopularComparisons()` was called inside the `popular-comparisons.json` fetch callback even when `handleInitialNavigation()` had already populated `CMP_A`/`CMP_B`, overwriting the pre-loaded comparison with popular suggestions. Fixed with `if (CMP_A || CMP_B) return;` guard at top of fetch `.then()`. Hard-refreshing `/compare/<id-a>/<id-b>/` now always loads both fragrances.
- **List-item swipe tray visible on desktop click** — `focus-within` CSS rule was applying `transform: translateX(-120px)` on the catalog row when a user clicked it on desktop (click → focus triggers `focus-within`). Wrapped the reveal rule in `@media (hover: none), (pointer: coarse)`. Added `@media (hover: hover) and (pointer: fine) { .list-item-actions { display: none; } }` to completely hide swipe actions on pointer devices.
- **Catalog sidebar missing layout CSS** — `.catalog-shell`, `.catalog-sidebar`, `.catalog-main`, `.cat-sidebar-section` had zero CSS definitions. The sidebar showed as an unstyled vertically-stacked block on all viewports. Added proper flex-row shell, 220px fixed sidebar, flex-grow main content, and `display: none` on mobile (<768px) in `styles/layout.css`.

### Changed
- **settings-menu-item token alignment** — Added `min-height: var(--touch-target)` (44px, WCAG 2.5.5). Changed `border-radius: var(--radius)` → `var(--radius-sm)` (explicit scoped token).
- **carousel-card family label** — Replaced `<span style="font-size:.6rem;color:var(--g500)">` inline style with `.carousel-card-family-label` CSS class (`--fs-label` + `--text-tertiary`). Added `.carousel-card--wide` CSS variant (240px) for golden-pairs cards; removed `card.style.width = '240px'` inline override.

### Added
- **DESIGN.md** — Component inventory (9 components with file:line refs), token rules, pre-PR checklist, and accessibility persona descriptions. Referenced from `CLAUDE.md`.
- **TODOS.md Phase 3 + Phase 4** — Phase 3 documents all QA fixes with root causes. Phase 4 has 9 self-contained design debt tasks from `design-fixes.md` audit, written as Gemini-ready prompts with model assignments.

## 2026-03-19 (10)

### Fixed
- **App Module Crash (root cause)** — removed duplicate `function` declarations for `scoreSimilarity`, `scoreLayeringPair`, and `renderStandaloneQuiz` in `app.js`. In ES module strict mode, these duplicates caused a `SyntaxError` that silently prevented the entire module from loading — blocking all navigation, search, and fragrance opens.
- **Quiz Duplicate Nav Bar** — quiz.js was injecting a second `<nav class="global-nav">` into `.col-main-content`, creating a nested nav bar below the shell's existing nav. Removed the embedded navs from all 4 quiz render functions (`renderStep`, `renderResults`, `renderArchetypeResults`, `renderAstroResults`).
- **CHANGELOG Fetch Path** — changed `fetch('CHANGELOG.md')` to `fetch('/CHANGELOG.md')` so the changelog loads correctly from any path (e.g. `/app/`, `/compare/`).

## 2026-03-19 (9)

### Fixed
- **Standalone Compare URLs** — fixed deep-linked fragrance pre-loading by making ID lookup more robust (case-insensitive) and improving regex to support all valid fragrance slugs.
- **Standalone Quiz Logic** — fixed a critical syntax error in `quiz.js` that prevented the quiz from loading on standalone pages.
- **SPA Quiz Fallback** — implemented `renderStandaloneQuiz` in `app.js` to handle quiz routes when the main app shell is loaded via a Single Page App configuration.
- **Navigation Stability** — refined `go()` redirect logic to prevent unnecessary resets to `/app` when on a valid deep-linked comparison route.

## 2026-03-19 (8)

### Fixed
- **Phase 0 Routing and Navigation** — resolved critical issues where standalone `/compare/` and `/quiz/` URLs wouldn't correctly load or display data.
- **Missing "Feelings" (Role) Filters** — the Catalog sidebar now correctly populates the Feeling/Role filter bar (`cat-feel-bar`) using `ROLES` data, enabling `#feel=solar` style deep-links.
- **Standalone Quiz Rendering** — `quiz.js` now correctly identifies `.col-main-content` and renders inside the shell without breaking the navigation or blowing away the `document.body`.
- **Global Navigation on Quiz Pages** — added a `window.go` redirector to `quiz.js` so navigation buttons (Compare, Notes, You) work from standalone quiz pages.
- **Hash-based Routing Improvements** — `app.js` now handles `#you`, `#journal`, and robustly parses `pathname` for standalone entry points.
- **ReferenceError: renderStandaloneQuiz** — implemented the missing function in `app.js` to ensure stability when navigating to quiz paths.

### Added
- **Scent DNA Persona Mapping** — collection stats now identify users as one of 8 fragrance archetypes (e.g. The Minimalist, The Provocateur) based on their average sensory profile.
- **Collection Gap Analysis** — the "You" dashboard now identifies weak points in a user's collection (e.g. low freshness) and suggests a specific fragrance to fill the gap.
- **Global Undo Toast** — after any wishlist or owned state change, a floating toast appears with a 3-second "Undo" window. Allows users to immediately revert accidental clicks without re-cycling through states.
- **Share Comparison** — added a "Share Comparison" button to the Compare results. Uses native device sharing on mobile and clipboard copy on desktop.
- **Recommendations in Detail View** — fragrance detail panels now include a "You might also like" section showing the top 3 most mathematically similar fragrances.
- **Plain-language metric labels** — sillage and structure scores now show human-readable descriptions (e.g. "Strong - fills a room") alongside the numerical value.

### Fixed
- **Phase 0 Routing** — resolved critical bugs where standalone `/compare/` and `/quiz/` URLs wouldn't load data or rendered the wrong page.
- **Sidebar Leaking** — hidden the catalog sidebar on standalone pages to prevent visual pollution.
- **Engine Deduplication** — removed ~300 lines of duplicated profile computation and constants across `app.js` and `quiz.js`, centralizing them in `engine.js` and `store.js`.

## 2026-03-19 (6)

### Added
- **Nav search bar** — replaced the bare icon button with a Spotify-style pill showing "Search... ⌘K", making it immediately obvious the app has a search function. On tablet/mobile it collapses back to the icon only.
- **Search placeholder** — universal search input now has placeholder text "Search fragrances, notes, brands…" so users know what they can search for.

### Fixed
- **Fuzzy prefix matching** — search now uses word-prefix fuzzy matching: typing "dipti" surfaces all Diptyque fragrances (lev("dipti","dipty")=1), "byrd" surfaces Byredo, and any 3+ char query that is within 1 edit of the start of a word in brand or name will match. Previously the user had to type an exact substring.
- **Detail panel scroll** — opening a fragrance or note detail panel from search (or any trigger) now scrolls the detail column back to the top. Previously it could open scrolled to the middle of the previous content.

## 2026-03-19 (5)

### Fixed
- **Navigation on standalone comparison pages** — fixed broken navigation links in `compare/**/index.html` by replacing absolute `a` tag redirects with local `onclick="go(...)"` button handlers. This prevents unnecessary page reloads and allows users to switch to the Notes or You dashboard while maintaining their current deep-linked comparison context.
- **Hash-based routing recovery** — restored the `hashchange` event listener in `js/app.js` (which was lost during a previous code restoration) to ensure the UI stays in sync when the URL anchor changes (e.g., when clicking shareable links or navigating via the browser back/forward buttons).
- **Catalog rows: missing ARIA attributes** — `renderCatRow` now sets `role="button"`, `tabindex="0"`, and `aria-label="<name> by <brand>[— Owned/On wishlist]"` on every catalog row. Without these, keyboard users and screen reader users could not interact with the list at all.
- **Catalog rows: keyboard activation** — added `keydown` handler on each `.scent-list` so Enter and Space open the fragrance detail panel when a row has focus (in addition to click).
- **Focus ring clipped by overflow:hidden** — catalog rows use `overflow: hidden` which clips the global `box-shadow` focus ring. Added `.list-item:focus-visible` override with an inset `outline` so the focus indicator is always visible for keyboard navigation.
- **Note layer hints: no accessible label** — `<span class="note-layer-hint">H</span>` and `…B…` now carry `aria-label="Heart note:"` / `aria-label="Base note:"` so screen readers announce them meaningfully.

### Added
- **Arrow key navigation in catalog** — when focus is on a catalog row, `ArrowDown`/`ArrowUp` moves to the adjacent row across all brand sections, matching the expected keyboard pattern for lists.
- **Share button on fragrance detail** — a "↗ Share" button appears in the collect action row. Clicking it copies a `#frag=<id>` deep-link URL to the clipboard and shows a brief "✓ Copied" confirmation. The `#frag=<id>` hash was already parsed by `handleInitialNavigation`, so links work end-to-end.

## 2026-03-19 (4)

### Added
- **The Nose Knows — daily fragrance trivia game** — 5-round daily quiz with deterministic questions (same for all users each day). Five question types: note identification (4 MC), sillage comparison (binary), family classification (4 MC), note description (4 MC), and shared notes (free text with fuzzy matching). Entry row appears at top of catalog. Also accessible from More sheet. Results screen with emoji grid (🟩🟨🟥), streak tracking, and clipboard share in Wordle-style format. All state persisted in localStorage.
- **Search: diacritic normalization** — queries like `xinu` now match `Xinú`, `diptique` matches `Diptyque`. Normalized fields (`_nameN`, `_brandN`, `_nAllN`) added to store preprocessing. Applied to catalog search, universal search (⌘K), compare picker, and notes browser.
- **Search: fuzzy matching** — Levenshtein-based fallback activates when substring match returns no results and query is ≥4 characters. `byedo` finds Byredo (threshold ≤1 for brands), `diptique` finds Diptyque (threshold ≤2 for names).
- **Search: keyboard navigation** — Arrow Down from search input focuses first catalog result. Arrow Up/Down navigates between results. Escape returns focus to search. Enter on search input opens first result. First result highlighted with `.search-first` background.
- **`runSearchTests()` dev utility** — 10 unit tests for search helpers, callable from browser console.

### Changed
- **Engineering review for Phase 2** — added complete implementation plan for The Nose Knows to TODOS.md with architecture decisions, data flow, edge cases, and test plan.
- **More sheet** — added "Daily Challenge" entry with 🧠 icon as first item.

## 2026-03-19 (3)

### Fixed
- **Detail panel layout on desktop** — `app/index.html` was missing the `.col-main` flex wrapper and the two-level shell structure, causing `.col-detail` to collapse to 0px width instead of sitting beside the main content. Restructured `layout.css` to use a column-direction shell (`flex-direction: column`) with a new `.content-row` flex row that holds `.col-main` + `.col-detail` side by side. All three breakpoints now behave correctly:
  - Desktop (≥1100px): detail panel slides in on the right, compressing main content width
  - Tablet (768–1099px): detail panel is a fixed overlay with scrim, unchanged
  - Mobile (<768px): detail panel hidden; bottom sheets used for all detail types

## 2026-03-19 (2)

### Changed
- **List row design system consolidation** — replaced four parallel implementations (`.scent-row`, `.frag-picker-item`, `.us-row`, and `s-wish`/`s-owned` state modifiers) with a single canonical `.list-item` component and modifier variants:
  - `.list-item` (default) — swipeable catalog rows with `.list-item-content`, `.list-item-actions`, and `.list-item-action--compare` / `.list-item-action--wishlist`
  - `.list-item--compact` — note detail, house detail, and quiz result rows (replaces context-scoped `.frag-picker-item` selectors)
  - `.list-item--search` — universal search modal rows (replaces `.us-row` and all `.us-row-*` sub-elements)
  - `.list-item--flat` — compare suggestion cards (renamed from `.scent-row--flat`)
  - `.list-item--wish` / `.list-item--owned` — state modifiers (renamed from `.s-wish`/`.s-owned`; dead child selectors removed)
- **Unified body sub-elements** — all contexts now use `.list-item-dot` (8px plain dot), `.list-item-dot--lg` (18px with family abbreviation, catalog only), `.list-item-body`, `.list-item-name`, `.list-item-sub`, `.list-item-meta`, `.list-item-icon`, `.list-item-badge`, `.list-item-score`
- **Fixed duplicate `.frag-picker-dot` definition** — two conflicting global rules (18px and 8px) were silently overriding each other; replaced with properly scoped `--lg` variant
- **Removed dead CSS** — deleted `.house-detail-list .frag-picker-item`, `.np-frags .frag-picker-item`, and all `.us-row`/`.us-row-*` rule blocks (now covered by canonical classes); dropped dead state rules targeting `.s-name-btn` and `.s-sym` which had no matching elements

## 2026-03-19

### Fixed
- **Detail panels broken** — restored `SW` (sillage label array) and `LW` (layering label array) that were removed during the store.js refactor but still referenced in `renderFragDetail`. Missing definitions caused a `ReferenceError` on every detail open, silently preventing fragrance, note, and house details from rendering.
- **House detail empty** — restored `BRANDS_MAP` (keyed by lowercase brand name) built from the `BRANDS` array after data loads. `renderHouseDetail` was referencing `BRANDS_MAP[brand.toLowerCase()]` which was `undefined`, causing the container to render blank.

### Added
- **Universal Search** — ⌘K / Ctrl+K / `/` now opens a context-aware search modal (max-width 560px, `z-index 400`) that works from any page. Idle state shows Recently Opened (sessionStorage `sm_recent`, max 5) and Popular fragrances. Typing filters across Fragrances (max 6), Notes (max 3), and Houses (max 2) grouped by type. Keyboard nav: ↑↓ arrows + Tab move the highlight; Enter selects; Esc closes and returns focus via `_trapFocus`/`_returnFocus`.
- **Compare mode in universal search** — clicking a compare slot card (or sticky bar chip) opens the modal in compare mode with a context banner ("Selecting Fragrance B ↔ Santal 33"). When the other slot is filled, all fragrances are pre-sorted by `scoreSimilarity()` with live scores shown right-aligned in the result row. Selecting a frag fills the slot and pulses the other empty card (600ms CSS keyframe).
- **Session recents** — `openFragDetail()` now writes to `sessionStorage['sm_recent']` (JSON array of IDs, max 5, most-recent-first) so the search modal can show recently viewed fragrances.

### Removed
- **Drum-roller fragrance picker** — replaced entirely by universal search. Removed ~240 lines of JS (`_openFragPicker`, `_closeFragPicker`, `_renderPickerList`, `_renderPickerLists`, `_initPickerDrumScroll`, `_initPickerSortSwipe`, `_updatePickerSort`, `_initPickerKeyNav`, `PICKER_ITEM_H`, `_pickerSlot`, `_pickerSort`) and ~283 lines of CSS (`.frag-picker-overlay` through `.frag-picker-item-text` mobile override). `#frag-picker` HTML block removed from `app/index.html`.

---

## 2026-03-18

### Fixed
- **Compare Panel CSS** — added missing `.cmp-header`, `.cmp-pair-row`, `.cmp-card-wrap`, and `.cmp-vs` base styles; the HTML used these classes but only `.cmp-header-v2` existed in CSS, causing the compare cards to render with no layout.
- **Notes Tab Switching** — wired click handlers to the Explore / Search & A-Z / My Notes tab buttons in the notes panel; extracted `initNotesNav()` as a standalone init function and replaced the broken `setNotesTab()` which referenced non-existent DOM elements.
- **Mobile Bottom Nav Icons** — replaced emoji icons (magnifying glass, arrows, clipboard, person) with Lucide-style SVGs (compass, maximize, apple, user) for consistency with the design system; added the mobile bottom nav to `app/index.html` which was missing it entirely.
- **Nav Button Borders** — added `background: none; border: none; cursor: pointer` reset to `.global-nav-link` to eliminate default button chrome on the Compare, Notes, and You nav buttons.
- **Mobile Compare Stacking** — added `flex-direction: column` to `.cmp-pair-row` on mobile (`<768px`) so fragrance cards stack vertically with the "vs" label centered between them.
- **Shell Layout** — added `flex-wrap: wrap` to `.shell` and `flex: 0 0 100%` to `.global-nav` so the sticky nav takes full width instead of becoming a narrow flex column sibling.
- **Missing Google Fonts** — added `<link>` tags for Source Serif 4, DM Sans, and Archivo Black to `app.html` and `app/index.html`; fonts were defined in CSS tokens but never loaded.
- **Compare Auto-Select** — the first popular comparison pair (Gypsy Water vs Bal d'Afrique) now auto-loads on Compare so users never see empty placeholder cards.
- **Missing `FAM_ABBR` Import** — added `FAM_ABBR` to the destructured import from `store.js` in `app.js`; its absence caused `renderCatRow()` to crash silently inside `async init()`, which prevented `buildCatalog()`, `initCompare()`, and all downstream UI initialization from completing — breaking the Catalog, Compare, and Notes pages.
- **Detail Panel Crash** — restored missing `#detail-back`, `#detail-inner`, and `#detail-scrim` DOM elements across all HTML pages (`app.html`, `app/index.html`, 5 compare pages, 7 quiz pages); their absence caused `app.js` to throw on page load when adding event listeners to null elements.
- **Global Search Button** — defined `openGlobalSearch()` (switches to catalog panel and focuses search input); previously called by the nav search icon but never implemented, causing a `ReferenceError` on click.
- **Desktop Detail Close** — exposed `closeDesktopDetail()` on `window` so the `onclick` handler in HTML can reach it from ES module scope.
- **Null-safe Detail Panel** — added optional chaining (`?.`) to `getElementById` calls in the detail stack so pages without the full detail DOM don't crash.
- **Trailing-slash Route** — added `/app/` → `app.html` rewrite in `vercel.json` to prevent serving the stale `app/index.html` static fallback.

### Added
- **"You" Dashboard Refactor** — Restructured dashboard widgets to use canonical `.dc-sim-shelf` and `.settings-menu-item` patterns instead of custom inline flexboxes.
- **Olfactive DNA Integration** — Stats now use the native `.dc-stats`, `.dc-stat`, `.dc-bar`, and `.dc-fill` components from the design system.
- **Golden Pairs** — Integrated seamlessly into the native `.carousel` and `.carousel-card` patterns for a unified UI feel.
- **Journal CTA** — Uses the established `.landing-card` component for brand-consistent presentation.
- **Redundancy Alert** — The warning slide-up for duplicate notes/scents now leverages the standard `.detail-inner` layout structure.
- **Global Navigation Bar** — implemented a unified navigation component across the landing page, fragrance engine, and quiz engine; features consistent branding with the Scentmap logo and contextual active states for "Fragrances", "Compare", "Notes", "Quizzes", and "Collection"; uses design system tokens for background, typography, and spacing.
- **Notes 2.0: Educational Exploratorium** — transformed the Notes directory into a curated learning experience with three tabs: **Explore** (educational content), **Search & A-Z** (refined directory), and **My Notes** (saved favorites).
- **Interactive Olfactory Pyramid** — added a visual educational component to the Notes page explaining fragrance evaporation tiers (Top, Heart, Base), with integrated filtering.
- **Fragrance Family Deep-Dives** — implemented rich cards for each olfactory family featuring sensory descriptions and key note previews.
- **Quizzes Landing Section** — added a dedicated section on the homepage for discovering data-driven quizzes, linked directly from the global navigation bar.

### Changed
- **Mobile Sticky Offsets** — adjusted mobile sticky positions for the fragrance catalog header and comparison bar to account for the new global navigation bar, ensuring no element overlap on small screens.
- **Navigation Logic** — updated `js/app.js` and `js/quiz.js` to automatically synchronize the navigation active state based on the current page or tool.

---

## 2026-03-19

### Added
- **Dupe Lab feature** — new "Find Dupes in Catalog" entry point added to fragrance detail panels; calculates similarity scores across the entire 183-scent database using the multi-factor similarity algorithm; ranked results show match percentage, note overlap bar, and "Why this matches" math expansion (family/note/sillage/role breakdown); "View Details" allows deep-linking to matched fragrances
- **Astro Scent Match Quiz — Archetype Integration** — zodiac-mapped quiz now integrates with the Scent Archetype framework; each sun sign maps to a core archetype (e.g., Aries to "The Provocateur", Virgo to "The Minimalist"); results page provides dual personality-to-fragrance rationale; added multi-step refinement questions (Climate, Mystery) for personalized cosmic pairings
- **Enhanced "My Collection" (Saved) dashboard** — transformed the static list into a personalized hub using canonical design system components:
  - **Olfactive DNA card** — visual summary of owned fragrances using standard `.dc-bar` and `.dc-fill` metric patterns; displays average sensory profile, dominant note families, and core notes
  - **Quiz History** — logged history of completed quizzes with results and archetypes; supports deep-linking with full attribution
  - **Recently Viewed** — integrated tracking via the standard `.carousel` component
  - **Design System Alignment** — removed all custom inline grid/flex layouts in favor of existing component classes (`.sec-label`, `.chip`, `.dc-stats`, `.carousel`) to ensure visual consistency across the engine
- **Quiz result attribution banner** — added personalized context when deep-linking from quiz results to the fragrance engine; detail panels now display a "From your scent archetype: [Name]" banner when arrived via a quiz result link
- **Analytics event stubs** — added `trackEvent()` helper to `js/app.js` with initial instrumentation for `dupe_lab_opened` and `dupe_clicked` events; establishing the pattern for planned DNA Card analytics

### Added
- **Dedicated Scent Journal Panel** — separated scent tracking into a distinct experience from the general collection:
  - **Quick Track Search** — start a trial directly from the Journal by searching for any fragrance, bypassing the full catalog
  - **Active Map** — real-time dashboard for in-store testing, mapping sprays to specific body locations (Left Wrist, Neck, etc.)
  - **Trial History** — permanent log of all fragrance tests with date, time, location, and a 3-step evolution rating (Initial → 15m → 1h)
  - **Landing Page Entry** — added a prominent "Scent Journal" call-to-action on the home page for quick access during retail exploration
- **Navigation system recovery** — fixed broken links across all pages by unifying header structures; integrated hash-based routing in `js/app.js` to ensure the correct panel (Catalog, Compare, Notes, Journal, Collection) activates when arriving via external links (e.g., `/app#journal`); added `hashchange` listener to keep UI in sync with URL changes
- **`dc-cmp-btn` typography and readability** — reduced letter-spacing to `0.00em` for better legibility; removed `max-width`, `overflow: hidden`, and `text-overflow: ellipsis` from `.dc-cmp-btn-name` to ensure fragrance names are fully readable in the compare slot buttons
- **Double sitemap footer removed** — deleted redundant legacy `sitemap-footer` block from `index.html`; main sitemap is now exclusively handled by the `landing-footer` grid, which has been updated to include the new Scent Archetype and Astro Scent Match quizzes
- **`dc-collect-btn` rendering** — removed conflicting inline styles (`background:var(--black); color:var(--paper); border:none;`) that were overriding the default button CSS class; "Buy from" and "Visit brand" links now render with proper `.dc-collect-btn` styling

### Changed
- **Design system consolidation — playground updated** — `playground.html` rewritten to show post-consolidation canonical patterns only; old audit/storybook tables removed; Migration Summary section added documenting all 8 completed consolidations
- **Tab bars converged to sliding-pill pattern** — `.tabs` and `.cat-state-bar` now share CSS with `.frag-picker-sort-bar`; new `.tab-pill` element slides behind the active tab; 16 section-label class variants (`.dc-nlbl`, `.dc-slbl`, `.dc-sim-lbl`, etc.) merged to single `.sec-label`
- **List row simplified** — `border-left: 3px solid transparent` family indicator removed from `.scent-row-content`; all 9 family border-color overrides and `.scent-row.fam-dim` removed; flat variant `border-left: none` override also removed
- **Search clear button restyled** — `.cat-search-clear` is now a 20×20px circular pill (`border-radius: var(--radius-circle)`) using `--bg-tertiary` background; displayed as flex when `.visible` class is present
- **Sheet nav title centered** — `.sheet-back` and `.sheet-close` get `width: 56px; flex-shrink: 0` so the sheet title is always centered regardless of asymmetric left/right button content
- **Text link converged** — `.cmp-card-detail-btn` converged to `.s-name-btn` style (serif, underline, primary color); 1-off pattern removed
- **Removed unused CSS** — `.role-landing-card` and all `.rlc-*` sub-classes deleted (no references in app)

## 2026-03-18

### Added
- **Scent Archetype Quiz** — new quiz at `/quiz/scent-archetype`; 5 questions map answers to one of 8 fragrance archetypes (The Quiet Expressionist, The Sensory Hedonist, The Urban Intellectual, The Sun Chaser, The Romantic, The Provocateur, The Naturalist, The Minimalist); result page shows archetype name, tagline, family pills, description, and 3 matched fragrances; shareable URL encodes both archetype ID and result fragrance IDs; pre-load from URL on direct link
- **`ARCHETYPES` constant in `quiz.js`** — 8 archetype definitions with name, tagline, desc, families, and scoring tags; `scoreArchetypeMode()` tallies `arch:` prefixed tags from quiz answers, identifies dominant archetype, merges archetype tags with user's family tags for fragrance scoring
- **`renderArchetypeResults()` in `quiz.js`** — rich result card with archetype name (Archivo Black), italic serif tagline, color-coded family pills, and prose description; distinct from standard `renderResults()` flow
- **`_buildMoreQuizzesHtml()` helper in `quiz.js`** — DRY refactor; both `renderResults()` and `renderArchetypeResults()` now use shared helper for "More Quizzes" section; new Scent Archetype quiz included in the list

### Fixed
- **`aria-selected` on picker drum items** — compare fragrance picker now sets `aria-selected="true"` on the currently centered/selected item in each drum column; was always `"false"` regardless of selection state; also updates live as the drum scrolls so screen readers track the active option
- **`aria-pressed` on Wishlist / Mark Owned buttons** — detail panel collect-row buttons now carry correct `aria-pressed` state so assistive technology announces toggle state without relying on visual-only cues

### Added
- **Role assignments now persist across sessions** — fragrance role assignments (`RA`) are saved to `localStorage` (`scentmap_ra`) and restored on load; assignments survived neither page refresh nor revisit before this change; defaults (casual → Gypsy Water, etc.) are only applied when no saved data exists
- **Escape clears catalog search** — pressing Escape while the search field has text clears the query, dismisses the clear button, rebuilds the catalog, and blurs the input; natural keyboard behaviour previously missing

## 2026-03-17h

### Added
- **Family Filter Pills section in playground** — new storybook section for `.fam-pill` / `.fam-pill-dot` components added in ux-update; shows vertical sidebar layout, all three states (default / active / no-dot), and mobile horizontal strip demo

### Changed
- **Inputs section in playground** — updated `.cat-search-input` description to reflect recent changes (rounded to `radius-lg`, secondary background at rest, background transition on focus); added `.cat-search-clear` variant and `.cat-result-count` demo

---

## 2026-03-17g

### Added
- **Static Build Engine** (`/scripts/build-static.js`) — generated physical `index.html` files for `/app`, all `/quiz/:slug`, and popular `/compare/:a/:b` routes; this ensures the footer sitemap links work on simple static dev servers (like WEBrick) that don't support dynamic rewrites
- **`npm run build` command** — added to `package.json` to automate static page generation

### Changed
- **Sitemap link color fix** — reset `sitemap-link` color from browser-default blue to `var(--text-secondary)` (normal) and `var(--text-primary)` (hover) to match the project's design system
- **Root-relative styles in landing page** — updated `index.html` to use root-relative asset paths for consistency across subdirectories
- **Dev sync update** — updated `CLAUDE.md` and `GEMINI.md` sync instructions to include the newly built `/app`, `/quiz`, and `/compare` directories

---

## 2026-03-17f

### Added
- **Structured sitemap footer** — added a comprehensive sitemap to the `index.html` landing page footer with four columns (Engine, Quizzes, Brands, Popular Comparisons); improves navigation for users and link depth for SEO crawlers
- **Footer redesign** — moved "Ready to explore?" CTA into a dedicated section above the sitemap; added a clean bottom bar with copyright and DM Sans wordmark; refined mobile layout to stack sitemap columns in 2x2 grid

---

## 2026-03-17e

### Fixed
- **Compare shareable URL** — `go()` now syncs the URL to `/compare/<id-a>/<id-b>` immediately when switching to the compare tab (if both slots are filled), and resets to `/app` when switching away; previously the URL only updated when `renderCompareResults` rendered, causing stale hashes like `app#catalog` to persist

---

## 2026-03-17d

### Fixed
- **Quiz infinite recursion crash** — `window.renderQuiz = function() { renderQuiz(...) }` was overriding the top-level `renderQuiz` function declaration in global scope, causing every call to `renderQuiz()` (including from `init()`) to recurse infinitely and throw `Maximum call stack size exceeded`. Fixed by renaming the global to `window._retakeQuiz` and updating the Retake button onclick to match.

---

## 2026-03-17c

### Fixed
- **Quiz pages stuck on loading** — removed WebHaptics module script and Supabase SDK from quiz page HTML (both blocked `DOMContentLoaded`, preventing quiz init from firing)
- **Quiz init robustness** — replaced `DOMContentLoaded`-only listener with `document.readyState` check + 5s safety timeout so init runs even if external scripts block
- **Quiz data loading fallback** — if `scents-flat.json` fetch fails, quiz now falls back to loading per-brand files via `scents-index.json` (same path as the main app)
- **Loading overlay** — explicitly hide `#app-loading` via JS in quiz init (belt-and-suspenders with CSS `display:none`)
- **Fetch error handling** — added `response.ok` checks with descriptive error messages and `console.error` logging

---

## 2026-03-17b

### Added
- **SEO quiz pages** — 5 standalone quiz pages at `/quiz/:slug` with dedicated URLs, SSR meta tags, OG images, and structured data:
  - `/quiz/find-your-scent` — general 5-question fragrance match
  - `/quiz/best-perfume-for-men-2026` — masculine-leaning 4-question quiz
  - `/quiz/best-perfume-for-women-2026` — feminine-leaning 4-question quiz
  - `/quiz/best-perfume-to-gift-2026` — gift-oriented 4-question quiz
  - `/quiz/find-your-byredo` — Byredo-specific 3-question concierge
- **Quiz SSR serverless function** (`/api/quiz`) — serves `app.html` with quiz-specific `<title>`, meta description, OG tags, JSON-LD (`Quiz` schema), and `<noscript>` content with popular results for crawlers
- **Quiz OG image generation** (`/api/og-quiz`) — promo cards showing quiz title + CTA, or results cards showing 3 recommended fragrances with family dots
- **Client-side quiz engine** (`/js/quiz.js`) — lightweight standalone JS with ported scoring logic, progress bar, step-by-step questions, shareable result URLs via `?results=id1,id2,id3`
- **Quiz config data** (`/data/quiz-config.json`) — all 5 quiz variants with questions, answers, tags, and scoring configuration
- **Shareable quiz results** — completing a quiz updates the URL with result IDs; sharing the link shows result-specific OG tags and loads directly to results
- **"More Quizzes" section** on results page with links to all other quiz variants

### Changed
- **Landing page redesign** — `/` now serves `index.html` (previously went straight to app); features hero with search + "Take the Quiz" CTA, feature cards (Compare, Notes, Quiz), quiz promo section with all 4 keyword-targeted quizzes, popular comparisons grid, and footer CTA
- **App moved to `/app`** — main application now served at `/app` instead of `/`; all internal links updated
- **Sitemap expanded** — 2,203 URLs (added 5 quiz pages + `/app`)

---

## 2026-03-17

### Added
- **Shareable compare URLs** — comparisons now generate clean URLs at `/compare/<id-a>/<id-b>` (alphabetically canonicalized); refreshing or sharing the URL loads the same pair
- **Vercel serverless function for SEO** — `/api/compare` serves `app.html` with dynamically injected `<title>`, `<meta name="description">`, Open Graph tags, Twitter Card tags, and JSON-LD structured data for each comparison pair; social crawlers and AI search see rich content without executing JS
- **OG image generation** — `/api/og?a=<id>&b=<id>` generates branded 1200x630 preview images on-demand using `@vercel/og` (Satori); shows fragrance names, brands, family color dots, match percentage, and shared notes on a paper-colored background
- **`<noscript>` comparison summaries** — injected by the serverless function so AI crawlers (Perplexity, ChatGPT Browse) see full fragrance names, descriptions, notes, and similarity score without JS
- **Popular Comparisons** — curated pairs grid shown in the compare empty state (when both slots are cleared); tapping a card loads both fragrances; data from `data/popular-comparisons.json`
- **Social proof labels** — computed data-driven insights shown between score cards and notes grid: note overlap percentile ("shares 4 notes — more than 90% of cross-brand pairs"), sillage percentile ("projects louder than 82% of our library")
- **JSON-LD structured data** — `Product` schema with brand for each fragrance in comparison pages; `WebSite` schema with `SearchAction` on the landing page
- **Open Graph + Twitter Card tags** — static tags on `index.html` and `app.html`; dynamically overridden per comparison by the serverless function
- **`sitemap.xml`** — 2,197 URLs: all same-brand pairs + curated popular pairs; auto-generated by `scripts/build-sitemap.js`
- **`robots.txt`** — allows all crawlers, points to sitemap

### Changed
- **Root-relative asset paths** — all CSS `href`, JS `src`, and `fetch()` calls in `app.js` now use root-relative paths (`/styles/...`, `/js/...`, `/data/...`) so the app works correctly when served from `/compare/<a>/<b>` URLs
- **Compare URL rewrite** — `vercel.json` routes `/compare/:a/:b` to the `api/compare` serverless function instead of raw `app.html`

---

## 2026-03-16 (10)

### Fixed
- **Catalog rows: removed `.frag-picker-item` class from catalog rows** — this rolodex picker class was forcing `height: 48px` and `opacity: 0.32` onto every catalog row, causing content overflow/overlap and washed-out text; catalog rows now use only `.scent-row` and state classes
- **Catalog rows: removed double padding** — `.scent-row` outer padding was redundant (`.scent-row-content` has its own padding); removing the outer padding eliminates the visible bg-secondary frame around each row and cleans up the list appearance

### Changed
- **Catalog rows: dot alignment** — changed `.scent-row-content` from `align-items: center` to `align-items: flex-start` so the family color dot anchors to the fragrance name (top line) rather than the brand line (middle of 3 lines); added `margin-top: 4px` to optically center the dot with the name cap-height
- **Catalog rows: name weight** — `.frag-picker-item-name` bumped from `font-weight: 500` to `600` and set to `font-family: var(--font-sans)` for clearer name/brand contrast
- **Mobile filter panel: section labels** — added "COLLECTION" and "BRAND" uppercase labels above each filter group so users know what each row filters
- **Mobile filter panel: brand bar** — brand filter chips now use pill style with horizontal scroll (`.tab` chips with border-radius-pill, overflow-x: auto) instead of a raw tab group; easier to scan on narrow screens
- **Mobile bottom nav: Lucide SVG icons** — replaced unicode symbols (`≡`, `⊕`, `✿`, `⋯`) with proper Lucide SVGs: search for Fragrances, layers-2 for Compare, flower for Notes, menu for More
- **More sheet: Lucide SVG icons** — replaced emoji (★, ↩, ❖) with Lucide SVGs: star for My Collection, megaphone for Changelog, library for Design System
- **Filter toggle button: icon** — replaced `⊞` symbol with a Lucide list-filter SVG icon

## 2026-03-16 (9)

### Changed
- **Nav: added Fragrances and Compare tabs to desktop nav** — desktop nav now mirrors mobile bottom nav order: Fragrances → Compare → Notes → Collection; avatar and settings remain on the far right
- **Nav: logo wordmark** — applied existing `.logo` class to `app.html` nav text (`SCENTMAP` uppercase, DM Sans, letter-spacing); was previously unstyled
- **Nav: fixed avatar spacing** — added `gap: var(--sp-md)` to `.nav-right` and removed per-button `margin-right` from `.nav-notes-btn`; avatar no longer butts against adjacent nav items
- **Profile panel: removed delete account** — simplified to identity header, collection stats, export, and sign out
- **Profile panel: fixed padding** — removed redundant outer wrapper; panel now inherits `detail-inner` padding on desktop and `sheet-inner` padding on mobile, consistent with all other detail content

## 2026-03-16 (8)

### Added
- **Profile panel** — tapping the signed-in avatar now opens a profile panel (desktop detail panel / mobile sheet) instead of signing out directly; panel shows avatar initial, display name, email, owned + wishlist counts, "Export collection" button, "Sign out" action, and "Delete account" danger action (rose-colored, separated by a divider); all UI reuses existing classes (`copy-collection-btn`, `auth-guest-link`, `sec-label`, `bg-secondary` stat tiles)

### Changed
- **Nav avatar click** — when signed in, avatar opens `openProfilePanel()` instead of immediately calling `signOut`; `aria-label` updated to "Open profile." accordingly

## 2026-03-16 (7)

### Changed
- **Auth: replaced Google/Apple SSO with email magic link** — modal now shows an email input + "Send magic link" button; calls `supabase.auth.signInWithOtp()`; inline validation error on bad/empty email; transitions to "Check your inbox" confirmation state on success with "← Use a different email" back link; Supabase not configured falls back to mock sent state; CSS replaced `.auth-btn-sso`/`.auth-modal-actions` with `.auth-email-form`, `.auth-email-input`, `.auth-btn-primary`, `.auth-sent-icon`

## 2026-03-16 (6)

### Changed
- **Auth: replaced mock with Supabase** — `supabaseSignIn()` calls `supabase.auth.signInWithOAuth()` with `redirectTo` for Google and Apple; `initSupabaseAuth()` restores session on load and wires `onAuthStateChange`; empty `SUPABASE_URL`/`SUPABASE_ANON_KEY` constants fall back to mock for local dev; signed-in avatar click now calls `supabase.auth.signOut()`

## 2026-03-16 (5)

### Added
- **My Collection panel** — overhauled "Saved Scents" (renamed "My Collection") to show four distinct sections: Owned Scents, Wishlist, Saved Notes, and Saved Brands; each section only renders if it has items; global empty state shown when nothing is saved
- **Brand save** — "Save Brand" button in house detail panel (mirrors existing "Save Note" pattern); `isBrandSaved()` / `toggleBrandSave()` state helpers added; brand state keys use `b_` prefix in localStorage
- **Copy Collection to Clipboard** — button at top of My Collection panel generates a clean markdown text list of all saved items; `aria-live="polite"` toast confirms copy success
- **Auth modal** — centered brutalist overlay with "Save your olfactive wardrobe." headline, Google and Apple SSO buttons (SVG icons), "Continue as Guest" link; focus trapping (Tab wraps, Escape closes); `aria-modal="true"`, `aria-labelledby`
- **Sign In nav button** — new pill button in desktop top nav; after mock sign-in transitions to circular avatar showing user initial; accessible `aria-label` updates on state change
- **Mock SSO flow** — clicking Google/Apple shows 1.2s loading state then resolves `currentUser`, updates nav avatar, closes modal; no real backend required (frontend-only sprint)
- **My Collection in mobile More sheet** — "★ My Collection" added as first item in the More overflow sheet so mobile users can reach the panel

### Changed
- Desktop nav "Saved" label renamed to "Collection"

## 2026-03-16 (4)

### Fixed
- **Consistent recommendation components** — "More Like This" (frag detail) and "Swap Suggestions" (compare) now use identical 3-line structure: Name / Brand · Family / Reason; "More Like This" previously used inline truncated `Name · Brand` which broke at short widths
- **Double padding on swap suggestion cards** — `.cmp-sug-card` had `padding: 12px 20px` stacked on top of `.scent-row-content`'s inner `padding: 8px 12px`; removed outer padding from `.cmp-sug-card` so single-level spacing applies
- **Hard-coded pixel values** — replaced `padding: 8px 12px` in `.scent-row-content` and `padding: 0 16px` in `.scent-row-action` with CSS token equivalents (`var(--sp-sm) var(--sp-md)` and `0 var(--sp-lg)`)
- **Implicit border color on `.cmp-sug-card`** — `border: 1.5px solid` with no color defaulted to `currentColor` (full ink); changed to `var(--border-standard)` for consistent light border

## 2026-03-16 (3)

### Changed
- **Compare card description + detail button moved outside cards** — description (`cmp-card-meta-desc`) and "Details ↗" button now live in a `.cmp-card-meta-row` below the picker cards, each column aligned to its fragrance; cards are now purely swap targets with no distracting inner content
- **Clear touch target separation** — card tap = swap fragrance; description/details area is spatially distinct with no overlap; applies correctly on both desktop and mobile (2-column layout maintained throughout)

## 2026-03-16 (2)

### Fixed
- **Compare card family chip** — `cmp-frag-fam-chip` replaced with the canonical `.chip` component class; chip now renders correctly using the shared pill style instead of invisible unstyled markup
- **Compare card detail button** — `cmp-card-detail-btn` now has full button styles (text-link style, tertiary color, underline on hover, 44px touch target); was previously unstyled
- **Compare card swap affordance** — swap chevron moved inline with the fragrance name (forming a picker-style name row) so it's clear the card title is a select control; "Details ↗" is now visually distinct as a secondary action

## 2026-03-16

**Under-the-hood reliability and UX polish pass 🛠️**
A comprehensive set of bug fixes and UX improvements targeting shippability: silent data-load failures now show a recovery screen, swipe-to-dismiss sheets work correctly again, double-tapping a fragrance now shows a brief confirmation toast, and dozens of CSS inconsistencies were resolved.
*(User Impact: Medium)*

<details>
<summary>Detailed Changelog</summary>

### Fixed
- **Data load failure recovery**: App now shows a loading overlay on startup and replaces it with an error screen (with Retry button) if any data fetch fails. Previously the app silently rendered blank on network errors.
- **localStorage crash guard**: `JSON.parse` on corrupted `scentmap_st` data now resets to an empty object instead of throwing an unhandled exception.
- **Sheet swipe-to-dismiss velocity calculation**: Swipe velocity was always near-zero due to `DOMHighResTimeStamp` being used as a wall-clock time. Fixed by tracking `Date.now()` on touchstart and computing `dy / elapsed` correctly. Sheets now dismiss correctly on a fast swipe.
- **Long-press timer cleared on sheet close**: Long-press timer is now stored at module level and cleared in `closeAllSheets()` to prevent stale timer firing after sheet dismissal.
- **Compare slot listener accumulation**: `_selectFragForSlot` was adding a new click listener to the card element on every fragrance selection. Removed the duplicate — listeners are now wired once in `initCompare()`.
- **Missing CSS custom property tokens**: `var(--shadow-sm)`, `var(--shadow-md)`, `var(--shadow-lg)` were used in `components.css` but were only defined as utility classes, not as `:root` variables — causing silent rendering failures. Fixed by adding them to the semantic tokens block.
- **Missing font-size tokens**: `var(--fs-label)`, `var(--fs-caption)`, `var(--fs-body-sm)` were used throughout but never defined. Added to typography tokens.
- **Missing `--dur-xslow` token**: Used in compare metric bar animations but undefined. Added as `0.6s`.
- **Missing `.sr-only` utility class**: Referenced in CLAUDE.md and used for `#cat-live` aria-live region but never defined in CSS. Added to `design-system.css`.
- **Z-index collision**: `.cmp-dd` (compare dropdown) had `z-index: 200`, colliding with `.sheet-stack-overlay`. Fixed to `210`.
- **Detail back button layout gap**: Changed `.detail-back` from `visibility: hidden` to `opacity: 0; pointer-events: none` so it preserves layout without showing an empty gap.
- **Sheet topbar scrolls away**: `.sheet-topbar` is now `position: sticky; top: 0` so the Close button stays reachable on tall sheet content.
- **Desktop tab touch targets**: Moved `min-height: var(--touch-target)` to base `.tab` rule (was mobile-only). All filter/nav tabs now meet WCAG 2.5.5 minimum.

### Changed
- **Catalog search debounced**: Input handler now uses `debounce(buildCatalog, 160)` to prevent full DOM rebuilds on every keystroke.
- **Pre-fill compare deferred**: Similarity pre-calculation (40×40 matrix) is now deferred via `requestIdleCallback` (with `setTimeout` fallback for Safari) to avoid blocking the main thread on init.
- **State toast on double-tap**: Double-tapping a catalog row to cycle owned/wishlist state now shows a brief overlay toast ("Added to wishlist", "Marked as owned", "Removed") with `aria-live="polite"`.
- **Empty state improved**: Zero-result search state now includes a "Clear search" button inline.
- **Swipe actions keyboard-accessible**: Catalog row swipe actions (wish/compare) are now revealed via `:focus-within` CSS, making them keyboard-accessible without requiring a swipe gesture.
- **`#cat-live` announcements**: `buildCatalog` now writes the result count to the `#cat-live` aria-live region on every render for screen reader users.
- **SVG charts accessible**: Radar and scatter SVGs now include `role="img"`, `<title>`, and `<desc>` elements for screen reader support.
- **Hardcoded durations tokenized**: All `0.6s` durations in compare metric bars replaced with `var(--dur-xslow)`.
- **`.quick-peek-card` shadow tokenized**: Was hardcoded; now uses `var(--shadow-xl)`.

### Removed
- ~200 lines of dead Compare V1 CSS: `.cmp-hero*`, `.cmp-picker*` (old picker, not the current one), `.cmp-vs-badge`, various dead `.cmp-chip*`, `.cmp-header-row`, `.cmp-venn-wrap`, `.cmp-section-label`, `.cmp-notes-grid*`, `.cmp-metrics-row`, `.cmp-radar-wrap`, `.cmp-metric-bars*`, `.cmp-bar-wrap`, `.cmp-bar`, `.cmp-metric-nums`, `.cmp-roles-row`, `.cmp-sug-grid`. Compare V2 classes are unaffected.

</details>

---

## 2026-03-13

**Under-the-hood optimization! 🛠️**
We cleaned up some redundant code behind the scenes. This doesn't change anything you see or do, but keeps the app running smoothly and makes it easier for us to maintain.
*(User Impact: None)*

<details>
<summary>Detailed Changelog</summary>

### Fixed
- Duplicated code in `buildLayerSuggestions`: removed redundant inner `scoreLayering` function and used global `scoreLayeringPair` instead.

</details>

---

## 2026-03-12

**A massive wave of UX polish for mobile and compare! ✨**
We've smoothed out how things feel when you use the app on your phone. Bottom sheets now scroll perfectly without hiding the close button, note details are clear and readable, and comparing fragrances is much more intuitive with combined score cards and clearer labels. Plus, the compare picker dropdown now correctly follows you as you scroll!
*(User Impact: Major)*

<details>
<summary>Detailed Changelog</summary>

### Fixed (compare picker anchors to sticky bar when scrolled)
- When the compare page is scrolled and the condensed sticky bar is visible, opening the fragrance picker dropdown now positions the rolodex below the sticky bar instead of the (off-screen) main header. Previously `_openFragPicker` always anchored to `#cmp-header`; now it checks `cmp-header.getBoundingClientRect().bottom` and falls back to `#cmp-sticky-bar` when the header has scrolled out of view.

### Fixed (note detail catalog list opacity)
- Note detail "In Catalog" list items were rendering at `opacity: 0.32` — the `.frag-picker-item` base style targets the drum/rolodex picker where non-centered items are dimmed. Added `.np-frags .frag-picker-item { opacity: 1 }` override (plus proper padding, border-row dividers, hover state) so the static list is fully visible
- Same fix applied to house detail list (`.house-detail-list .frag-picker-item { opacity: 1 }`)
- Note pill taps in Compare notes grid now pass the note name as the sheet topbar title

### Fixed (mobile sheet UX — height, titles, close access)
- Mobile bottom sheets now have `max-height: calc(100svh - 44px)` — prevents sheets from extending above the viewport and making the Close button unreachable
- Sheet `display: flex` added so `overflow-y: auto` on `.sheet-content` activates correctly for internal scrolling (was requiring whole-page scroll)
- Note detail sheet no longer appears faded — underlying fragrance detail sheet no longer peeks above the note sheet
- Fragrance detail now always shows a reachable Close button after returning from a note detail

### Changed (mobile sheet UX)
- Sheet topbar now displays the fragrance/note/brand name as a sticky title (Archivo Black, centered) — title is always visible regardless of scroll position
- `.dc-name` (fragrance detail title) updated to Archivo Black display font, matching the compare picker card treatment
- `.np-name` (note detail title) updated to Archivo Black display font

### Fixed (compare UX improvements)
- Note pills in compare results now correctly open the detail panel (was calling `pushDetail` before panel opened; changed to `openDetail`)
- Mobile sheet scroll now contained within sheet — added `overscroll-behavior: contain` to `.sheet-content` to prevent background compare panel from scrolling

### Changed (compare UX improvements)
- Fragrance cards in compare header: replaced ✕ clear button with "Details ↗" button that opens the fragrance detail panel
- Radar legend and scatter plot labels now show full fragrance names instead of first word only
- Similarity and Pairing score cards combined into a single pair card (with radar and verdict) to emphasise they describe the pair, not individual fragrances

</details>

---

## 2026-03-11 (fix: picker UX polish)

### Fixed
- Haptic feedback no longer fires spuriously when typing in picker search — set `dataset.scrolling` guard before `innerHTML` rebuild and extended flag lifetime with `setTimeout(150ms)` to cover scroll-event settling
- Brand names now visible in picker sub-text when sorting by Brand (was showing family label instead)
- Both "Fragrance 1" and "Fragrance 2" column labels now render the same colour (removed active-state accent override)

### Changed
- Picker item height reduced from 60px → 48px (JS constant + CSS groove + padding updated); shows ~6 items instead of 5
- Drum fade gradients reduced from 32% → 20% coverage; more items readable at edges
- Picker search input enlarged to match catalog search sizing (`padding: 8px 12px`, `bg-primary` background)
- Sort bar now shows "Sort by" label prefix; button labels renamed to "Brand", "Fragrance Title", "Note Family"

---

## 2026-03-11 (refactor: extract JS, clean up project structure)

### Changed
- Extracted ~2,076 lines of inline JS from `index.html` to `js/app.js` — `index.html` is now HTML-only (~180 lines)
- Removed 246 lines of dead inline data arrays (`ROLES[]`, `CAT[]`, `NI[]`) — data is loaded exclusively from JSON files at startup
- Removed dev seed `setState` call that pre-populated owned state in-memory
- Updated `CLAUDE.md` to reflect new structure, corrected data format notes and state persistence docs

### Removed
- Root `app.js` (3,947-line stale extraction attempt, never linked to the page)
- Empty directories `src/`, `css/`, `design-system/` from an abandoned restructure
- `data/scents.json` (72-entry flat file superseded by `data/scents/` per-brand files with 183 total entries)

---

## 2026-03-11 (refactor: remove unused panels and dead code)

### Removed
- **Panels**: p-map (3D fragrance map), p-scentmap (capsule), p-roles (scatter chart), p-profile (analytics), p-design (design system), onboarding overlay — removed from HTML, JS, and all CSS.
- **JS functions**: `buildCapsule`, `buildRoles`, `buildRoleLanding`, `buildProfile`, `buildProfileData`, `renderOnboardReveal`, `dsGo`, `buildDesign`, `_fm2*` (2D map), `_fm3*` (3D map), `buildPairer`, `autoAssignFromOwned`, `syncDots` — ~1,847 lines removed.
- **Dead CSS**: capsule grid, chart/visualization containers, role section, design system page layout, onboarding overlay, profile panel, capsule/scentmap component, role landing, DS sidebar/main responsive overrides — removed across all four CSS files.

### Changed
- Init block simplified to `buildCatalog(); buildNotes(); initCatalogControls(); initCompare();`
- "More" sheet now shows only Notes and Changelog (was 6 items)
- `go()` function cleaned of removed-panel branches

---

## 2026-03-11 (style: cmp-frag-card-name display small)

### Changed
- **cmp-frag-card-name** — switched from `--fs-body` / `font-weight:700` to `--font-display` (Archivo Black) at `--fs-title` (1.4rem) with `--lh-tight` and `--ls-tight` for an editorial display-small treatment.

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
