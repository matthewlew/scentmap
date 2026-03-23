## 2026-03-23 (2)

### Changed
- **Design system consolidation** — Resolved 15+ one-off inline style and single-use class violations found in the 2026-03-23 audit:
  - Added `.callout--attribution` + `.callout-icon` — replaces 9 inline styles on the quiz-source attribution box in detail panels
  - Added `.saved-mark` — replaces 3× repeated inline `★` spans in note pill renders (`linkNotes`, `renderNoteDetail`, `render3x3Notes`)
  - Added `.link-btn--primary` — replaces deprecated `.s-name-btn`; migrated all 3 call sites (carousel shop link, dupe lab, catalog brand header); deleted `.s-name-btn` from `components.css`
  - Added `.quiz-step` — replaces 4× `style="padding:var(--sp-lg) 0;"` in quiz renders (Byredo quiz step, result; global quiz step, result)
  - Added `.btn--block` + `.btn--ghost` — replaces inline `width:100%;justify-content:center` and bg/border overrides (find-dupes btn, share comparison btn, retake quiz btn)
  - Added `.text-title--accent` to `design-system.css` — replaces `style="color:var(--accent-primary)"` on `.text-title` in DNA Card persona render
  - Added `.score-display` + `.score-meter-*` canonical aliases to `components.css` — `.cmp-score-*` kept as legacy aliases; full rename deferred
  - Fixed `font-size:10px` magic number → `var(--fs-caption)` (golden pairs card-meta)
  - Fixed `color:var(--g500)` → `color:var(--text-tertiary)` at 4 sites (saves empty state, note extraction, quiz step counters)
  - Stripped redundant inline styles from `.dupe-breakdown` / `.dupe-breakdown-row` (CSS already defined them)
- **designsystem.html** — Updated Buttons section: removed stale `.s-name-btn` demo, added `.link-btn` + `.link-btn--primary`, `.btn--block` + `.btn--ghost`, `.quiz-step`, `.callout--attribution`, and `.saved-mark` live demos; added `.text-title--accent` to Typography

---

## 2026-03-23

### Fixed
- **Gift Intelligence quiz "Quiz not found"** — Added `gift-intelligence` to both `data/quiz-config.json` (client-side quiz rendering) and `QUIZ_META` in `api/quiz.js` (Vercel SSR/SEO). Root cause: config entries were never added when the quiz page was created.
- **Quiz session restore crash** — `renderSessionResults` now normalises `session.results` to an array before calling `.map()`. Previously, quiz completion stored results as a comma-joined string (`ids.join(',')`); back-navigation then threw `session.results.map is not a function`.
- **`getSwapReason` crash in quiz.js context** — `engine.js::getSwapReason` accessed `anchor._nAll` directly. `quiz.js` builds its catalog from `scents-flat.json` without running through `store.js` normalisation (which computes `_nAll`). Fixed by falling back to `[...anchor.top, ...anchor.mid, ...anchor.base]` when `_nAll` is absent.
- **Quiz cache busting** — Updated `quiz.js?v=` query string from `20260317c` → `20260323a` across all 8 standalone quiz pages to force browsers to load the patched code.

---

## 2026-03-22 (2)

### Added
- **Fragrance Ladder dupe prototype** — `/dupes/santal-33/` standalone page. Anchor card (Santal 33 full profile + price/oz + sillage bar), Fragrance Ladder strip (4 price tiers: Entry/Mid/Prestige/Niche, pills scroll-link to cards), 4 curated alternatives (ALT Crystal 33 68%, Dossier Woody Sandalwood 68%, Commodity Sandalwood 67%, Lattafa Raghba 53%), 3-column note comparison grid reusing `.cmp-*` CSS classes, similarity score badge, savings-per-oz callout, buy buttons + "Link coming soon" fallback, funnel CTA → scentmap.co. Self-contained with no imports from `app.js` or `engine.js`.
- **`data/dupes/santal-33.json`** — Manually curated dupe data. Anchor + dupe entries embed price, size_ml, tier, pre-computed similarity scores with `_score_method` comment documenting the formula. Scores computed using `engine.js scoreSimilarity` algorithm.
- **`js/dupes.js`** — Vanilla ES module. Single fetch, try/catch covers both network and JSON parse errors. Family colors via CSS custom properties (`var(--fam-woody)` etc.), not hardcoded hex.
- **`styles/dupes.css`** — Dupe-page-specific styles using design tokens only. No hard-coded values. Ladder collapses to 2×2 grid on mobile.

---

## 2026-03-22

### Added
- **Gift Intelligence SEO** — `gift-intelligence` entry added to `QUIZ_META` in `api/quiz.js` with title, description, OG tags, and `noscriptPopular` for crawler-friendly fallback content.
- **Swap narrative** — 1-sentence compare reason (via `engine.getSwapReason`) shown between subtitle and first result card in both `app.js` and `quiz.js` gift quiz results. Styled as `.gift-swap-reason` (italic, tertiary).
- **Shareable result URLs (app.js)** — `history.replaceState` writes `?results=id1,id2,id3` on gift quiz completion; restored on re-open so shared links show results directly.
- **"Try a sample →" CTA in quiz.js** — gift-mode result cards now show sample link (microperfumes.com) and "View details" link, with `sample_link_click` event tracking.
- **`quiz_complete` event in quiz.js** — fires on successful scoring (skipped on fallback) for all standard-mode quizzes including gift-intelligence.
- **Analytics wired to Supabase** — `trackEvent()` in `app.js` now inserts into `events` table when `_sb` client is available; null-guarded with `.catch()` for resilience.
- **`trackEvent()` stub in quiz.js** — console-only (Supabase SDK not loaded on standalone quiz pages).

### Fixed
- **Quiz double-click race guard** — `inFlight` flag in `renderGlobalQuiz` prevents two rapid answer-button taps from both pushing tags and incrementing `step` twice (shared mutable state).
- **Quiz fallback no longer pins to first 3 Byredo fragrances** — `renderGlobalQuiz` fallback now uses `bestFrags.filter(x => x.score >= 0).map(x => x.frag).slice(0, 3)` so non-blacklisted frags sorted by score are used instead of positional catalog entries.
- **`blacklist_gourmand` scoring bug** — "avoid sweet/food-like scents" was pushing `'gourmand'` and `'sweet'` to `blacklistRoles` (no-op; roles are lifestyle tags not family names) and blacklisting `'amber'` instead of `'gourmand'`; fixed to `blacklistFamilies.push('gourmand', 'amber')` in `renderGlobalQuiz`.
- **Dead CSS removed** — `.gift-empty-state` rule deleted from `components.css` (class never referenced in any template).
- **Gift quiz restart clears URL** — "Start over" button now calls `history.replaceState` to strip `?results=` param, preventing stale results on retake.
- **Quiz result persistence** — Store quiz session in `sessionStorage` (key `sm_quiz_session`) with schema `{quizId, timestamp, answers, results, mode, [archetypeId|signId]}`. Back-navigation from result detail now returns to results screen (not Q1). Retake button clears session. Prevents UX bug where users lost quiz progress.
- **Quiz standalone pages load quiz.js** — All 8 quiz `index.html` files were loading `app.js` (which rendered the Compare panel), now correctly load `quiz.js` for a clean quiz-only experience.

### Changed
- **Design system pattern migration** — 4 inline-style violations extracted into reusable CSS classes (CSS-only, no behavior change):
  - `.chart-legend-item` added to `components.css`; `legendHTML` in DNA card family breakdown migrated from fully-inline `div` to class + `.dot`.
  - `.dc-badge--xs` modifier added to `components.css`; Golden Pairs badge `font-size:9px` removed.
  - `.tab--xs` + `.tab--xs.active` added to `components.css` and `responsive.css`; role picker Remove/Add button `style.cssText` assignments removed.
  - `.chip-dot` class fixed to use `var(--sp-xs)` + new `--scrim-dot` token (replaces `width:6px; rgba(255,255,255,.3)` inline span in frag detail chip).
- **`--scrim-dot` token** added to `design-system.css` overlay group — `rgba(255,255,255,.3)` for decorative dots on family-color chips.

---

## 2026-03-21 (Gift Intelligence)

### Added
- **Gift Intelligence quiz** — new `/quiz/gift-intelligence` route with 5 recipient-focused questions. Asks about the recipient's house preferences, personal style, desired scent mood, avoidances, and occasion. Results: 3 curated fragrance picks with description, top notes, and a "Try a sample" CTA that tracks `sample_link_click` events.
- **`renderGiftQuiz(container)`** in `app.js` — gift-mode scoring: boosts moderate sillage (4–7) for gifting safety, full blacklist/family/profile matching from existing engine, `trackEvent('quiz_complete', ...)` on result, event-delegated sample link click tracking.
- **`quiz/gift-intelligence/index.html`** — standalone quiz page with gift-first OG meta, canonical URL, and Twitter card.
- **`gift-intelligence` in `quiz-config.json`** — 5 questions with recipient-focused framing, `giftMode: true` + `giftIntelligence: true` scoring flags.
- **Gift Intelligence in `quiz.js` discovery list** — appears first in the "Explore More Discovery" section on all quiz result pages.

---

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
