# Scentmap — TODOs

Scope-reduced 2026-03-19 (CEO review, scope reduction mode).
Updated 2026-03-19 (CEO selective expansion — persona research).
Only items actively planned for the next 2 shipping cycles.

---

## Phase 0: Fix Broken Routes (do first)

### ✅ FIXED (2026-03-19): App module crash — all navigation/search/frags broken
Duplicate `function` declarations (`scoreSimilarity`, `scoreLayeringPair`, `renderStandaloneQuiz`) caused a `SyntaxError` in ES module strict mode, silently preventing `app.js` from executing entirely. Fixed in commit `23a2e27`.

### ✅ FIXED (2026-03-19): Quiz duplicate nav bar
`quiz.js` injected a second `<nav class="global-nav">` on every render step. Removed embedded navs from all 4 render functions. Fixed in commit `23a2e27`.

### ✅ FIXED (2026-03-19): Standalone `/compare/` URLs don't pre-load fragrances
Fixed in prior session (commit `385448f`) — ID lookup made case-insensitive, regex improved.

### ✅ FIXED (2026-03-19): Standalone `/quiz/` URLs render Compare page instead of quiz
Fixed in prior session (commit `385448f`) — quiz.js syntax error repaired, container targeting corrected.

### ✅ FIXED (2026-03-19): Unstyled catalog sidebar on `/compare/` and `/quiz/` pages
Fixed in prior session — `.catalog-sidebar` hidden on standalone pages.

### ✅ FIXED (2026-03-19): `#feel=solar` and other feel hashes don't activate discovery filtering
**Root cause:** Mapping between landing page "feelings" (solar, grounded, romantic, mysterious) and internal Role IDs (heat, work, intimate, cold) was missing. Button finding used text content which didn't match symbol-prefixed labels.
**Fix:** Added `feelMap` to `handleInitialNavigation` and updated button lookup to prefer `dataset.val` (ID) matching.

### ✅ FIXED (2026-03-19): `#journal` hash doesn't navigate to journal view
**Fix:** Updated `handleInitialNavigation` to scroll to `#journal-content` after activating the `saved` panel. Fixed `ReferenceError` in `go('journal')` by mapping it to the `saved` panel.

### ✅ FIXED (2026-03-19): State change aria-live announcements missing
**Fix:** Added assertive announcements to `setState()` in `app.js` using the `#cat-live` region. Messages now include the fragrance name and the action taken (e.g., "Santal 33 added to wishlist").

### ✅ FIXED (2026-03-19): Swipe-to-action triggers on reduced-motion / imprecise input
**Fix:** Added `prefers-reduced-motion` check to swipe handler in `app.js` to disable lateral movement for users with tremor (Miguel persona). Implemented a CSS fallback in `styles/components.css` that renders action buttons inline below the content when reduced motion is preferred, ensuring accessibility without relying on precise gestures.

---

## Phase 1: Search Improvements + Quick Wins
**Status:** ✅ SHIPPED (2026-03-19, changelog entry 7).

---

## Phase 1.5: Collection Intelligence (before DNA Card)
**Status:** ✅ SHIPPED (2026-03-19, changelog entry 7).

---

## Phase 2: Scent DNA Card
**Status:** ✅ SHIPPED (2026-03-19, changelog entry 7).

---

## Phase 3: QA Fixes & Design System Polish

**Branch:** `QA-fixes` | **Status:** In progress (2026-03-19)

Tasks are written as self-contained agent prompts. Read `DESIGN.md` and `GEMINI.md` before starting any task.

**Model guide:** Flash = isolated/CSS changes. Pro = multi-file debugging or layout reasoning.

---

### ✅ FIXED (2026-03-19): Stale agent docs (GEMINI.md, PRINCIPLES.md, design-fixes.md, testing-personas.md)
Port corrected (3000→3001), Session Summary removed, Jules references removed, PRINCIPLES.md Section 6 removed.

### ✅ FIXED (2026-03-19): DESIGN.md component guide created
`DESIGN.md` now exists with component inventory table (9 components), token rules, pre-PR checklist, and persona descriptions. `CLAUDE.md` updated to reference it. See `DESIGN.md`.

### ✅ FIXED (2026-03-19): Compare URL hard-refresh drops fragrances
**Root cause:** `renderPopularComparisons()` inside the `popular-comparisons.json` fetch callback was called even when `handleInitialNavigation()` had already set `CMP_A`/`CMP_B`, overwriting the pre-loaded comparison.
**Fix:** Added `if (CMP_A || CMP_B) return;` guard at top of the `.then()` callback (`js/app.js` ~line 4852). Fetch now bails out immediately if a comparison is already active.

### ✅ FIXED (2026-03-19): List-item swipe tray visible on desktop click
**Root cause:** `focus-within` CSS rule in `styles/components.css` (lines ~908–914) applied `transform: translateX(-120px)` on desktop click (which focuses the element).
**Fix:** Wrapped `focus-within` rules in `@media (hover: none), (pointer: coarse)`. Added `@media (hover: hover) and (pointer: fine) { .list-item-actions { display: none; } }` to completely hide the tray on pointer devices.

### ✅ FIXED (2026-03-19): settings-menu-item token alignment
Added `min-height: var(--touch-target)` (WCAG 2.5.5). Changed `border-radius: var(--radius)` → `var(--radius-sm)`. (`styles/components.css` lines 72–87)

### ✅ FIXED (2026-03-19): carousel-card inline style overrides
Added `.carousel-card--wide` (width: 240px) and `.carousel-card-family-label` CSS classes. Removed `card.style.width = '240px'` inline override. Replaced `<span style="font-size:.6rem;color:var(--g500)">` with `<span class="carousel-card-family-label">` in all carousel-card family renders.

### ✅ FIXED (2026-03-19): Catalog sidebar layout missing CSS + mobile showing raw stacked filters
**Root cause:** `.catalog-shell`, `.catalog-sidebar`, `.catalog-main`, `.cat-sidebar-section` had zero CSS. The sidebar appeared unstyled and visible on all viewports.
**Fix:** Added layout CSS in `styles/layout.css`: flex row shell, 220px fixed sidebar, flex-grow main. Added filter bar vertical layout rules for sidebar. Added `@media (max-width: 767px) { .catalog-sidebar { display: none; } }`.

---

## Phase 4: Design Debt (from design-fixes.md audit)

Tasks migrated from `design-fixes.md` (see that file for original findings). Each task is self-contained and Gemini-ready.

---

### ✅ FIXED (2026-03-19): .landing-card CSS class (P4-001)
**What:** The "Trying scents on?" CTA card in the You panel used a nonexistent `.landing-card` class with no CSS. Card had no radius or padding.
**Fix:** Added `.landing-card` to `styles/components.css` with proper tokens. Removed 15+ inline `margin-bottom` overrides from `js/app.js`, `app/index.html`, and all standalone pages.

---

### ✅ FIXED (2026-03-19): Add border-radius and border to swap suggestion cards (P4-002)
**What:** `.cmp-sug-card` (`.list-item--flat`) renders as flat rectangles with no border-radius. They look like bars, not contained surfaces.
**Where:** `styles/components.css` line ~235 (`.cmp-sug-card`)
**How:** Add `border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-standard);` to `.cmp-sug-card` or its parent.
**Done when:** Swap suggestion cards have visible rounded corners on all four corners with a subtle border.

---

### ✅ FIXED (2026-03-19): Extract DNA card inline styles to CSS classes (P4-003)
**What:** The Olfactive DNA card (`js/app.js:721–806`) uses 100% inline styles: `font-size:32px`, `font-size:10px`, `opacity:0.8`, `margin-bottom:4px`, etc.
**How:**
1. Create `.dna-card` in `styles/components.css` with proper padding and background.
2. Create `.dna-stat-label` with `font-size: var(--fs-label); color: var(--text-tertiary)`.
3. Create `.dna-section-divider` with `border-top: 1px solid var(--border-subtle); margin: var(--sp-md) 0`.
4. Replace all inline style attributes in the JS render with these classes.
**Done when:** Zero inline `style=""` attributes on DNA card elements except data-driven bar widths.

---

### ✅ FIXED (2026-03-19): Extract sensory profile bars to CSS classes (P4-004)
**What:** The "Sensory Profile" section in the detail panel (`js/app.js:1215–1235`) uses raw inline styles for every bar element.
**Fix:** Refactored sensory bars and dupe meters to use canonical patterns: `.cmp-score-meter-track` and `.cmp-score-meter-fill`. Removed redundant `sensory-bar-*` and `dupe-meter-*` CSS. Refactored Sensory Profile to use the stacked `.dc-stat` and `.sec-label` layout.

---

### ✅ FIXED (2026-03-19): Extract scent journey timeline to CSS classes (P4-005)
**What:** The Opening→Heart→Dry Down timeline (`js/app.js:1240–1256`) uses 10+ inline styles for the vertical timeline layout.
**Fix:** Added `.journey-step-title`, `.journey-step-meta`, and `.journey-caveat` to `styles/components.css`. Refactored `js/app.js` to use these classes and reuse the standard `.cmp-sug-card` pattern for similar fragrances.
**Done when:** Timeline renders with the same visual as before, but using CSS classes instead of inline styles.

---

### ✅ FIXED (2026-03-19): Fix compare frag-card padding inconsistency (P4-006)
**What:** `.cmp-frag-card-name-row` has mixed padding values with a magic `2px`. Children manage their own horizontal padding instead of the parent.
**Fix:** Added `.cmp-frag-card-body { padding: var(--sp-md); }`. Removed individual horizontal padding from `.cmp-frag-card-name-row`, `.cmp-frag-card-name`, `.cmp-frag-card-brand`. Use `gap` for vertical spacing.

---

### ✅ FIXED (2026-03-19): Fix collection section spacing (P4-007)
**What:** `.collection-section` spacing is tight — "OWNED 1" header and list item below have no breathing room. Panel padding is inline on `#p-saved`.
**Fix:** 
1. In `styles/components.css`, add `margin-top: var(--sp-sm)` to `.scent-list` within `.collection-section`.
2. In `styles/layout.css`, add `#p-saved, #p-changelog { padding: var(--sp-lg); }` and remove inline `style="padding: var(--sp-lg);"` from those panels in `app/index.html`.

---

### ✅ FIXED (2026-03-19): Fix cmp-sug-v2-label class name (P4-008)
**What:** The "Swap suggestions" heading in JS still uses `.cmp-sug-v2-label` which was migrated to `.sec-label` in CSS.
**Fix:** Changed the class to `sec-label` in the JS template string.

---

### ✅ FIXED (2026-03-19): Extract dupe lab items to CSS classes (P4-009)
**What:** Each dupe item in the detail panel (`js/app.js:985–1026`) is a `<div>` with ~8 inline styles: border, radius, padding, background, margin, flex.
**Fix:** Created `.dupe-item` in `styles/components.css` with proper tokens. Reused `.dc-*` patterns and added sub-element classes for name, score, and description.

---

## Future Ideas (deferred — revisit after DNA Card ships and has usage data)

One-line summaries only. Full specs will be written when these are promoted to active work.

- **Dupe Lab** — "Find Dupes" from detail panel, ranked similarity list. Compare tool does 80% of this already.
- **Blind Buy Oracle** — Personalized "should I blind buy this?" confidence score. Needs collection depth.
- **The Nose Knows** — Daily fragrance trivia game (Wordle-style). Retention mechanic, no collection needed.
- **Scent Wardrobe** — "What should I wear today?" daily rotation from owned collection. Needs deep collection.
- **Astro Scent Quiz** — Zodiac-mapped fragrance quiz. Viral/shareable but gimmicky without existing user base.
- **Layering Studio** — Layering compatibility guide. `scoreLayeringPair()` exists but no demand signal yet.
- **Dupe Lab Share Card** — Canvas share image for dupe results. Depends on DNA Card + Dupe Lab.
- **Compare keyboard shortcuts** — `X` to swap fragrances, `Backspace` to clear focused slot. Persona: Nadia (keyboard-first).
- **Daily game a11y pass** — Focus management, result announcements, keyboard-only playability for The Nose Knows.
- **Saved comparisons** — Persist last 5 comparison pairs in localStorage, show as "Recent" chips. Persona: Miguel.
- **Collection context in detail** — "Most similar in your collection: X (87%)" + gap identification. Depends on DNA Card.
- **Smart wishlist priority** — "Next buy" vs "someday" toggle on wishlist items. Persona: Emma.
- **"Smells like..." descriptions** — 1-sentence evocative descriptions for each fragrance. Needs copywriting for 183 entries.
- **Quiz-to-Compare bridge** — "Compare your top 2" button after quiz results pre-fills Compare. Depends on quiz routes working.
- **Fragrance gift/share card** — Single-fragrance shareable summary card. Simpler than DNA Card. Persona: Sarah (gift giver).
