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
