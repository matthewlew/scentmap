# Scentmap — TODOs

Scope-reduced 2026-03-19 (CEO review, scope reduction mode).
Updated 2026-03-19 (CEO selective expansion — persona research).
Only items actively planned for the next 2 shipping cycles.

---

## Phase 0: Fix Broken Routes (do first)

### CRITICAL: Standalone `/compare/` URLs don't pre-load fragrances
**Repro:** Visit `http://localhost:3001/compare/bleu-de-chanel/sauvage` directly.
**Impact:** All 6 "Popular Comparisons" links from the homepage footer are broken.
**Where:** `compare/` directory HTML + JS init logic that should parse `window.location.pathname`.

### CRITICAL: Standalone `/quiz/` URLs render Compare page instead of quiz
**Repro:** Visit `http://localhost:3001/quiz/find-your-scent`.
**Impact:** All quiz links from homepage navigate to a broken page.
**Where:** Quiz page HTML files in `quiz/` + JS init logic in `app.js`.

### MEDIUM: Unstyled catalog sidebar elements on `/compare/` and `/quiz/` pages
**Repro:** Visit any `/compare/` or `/quiz/` URL and scroll down.
**Impact:** Visual pollution — catalog filter elements leaking into visible area.
**Where:** `.catalog-sidebar` HTML in the shared shell — not hidden on standalone pages.

### LOW: `#feel=solar` and other feel hashes don't activate discovery filtering
**Repro:** Navigate to `http://localhost:3001/app#feel=solar`.
**Impact:** "Discovery by Feeling" homepage cards are non-functional.
**Where:** Hash routing in `app.js` — `#feel=*` pattern not handled.

### LOW: `#journal` hash doesn't navigate to journal view
**Repro:** Navigate to `http://localhost:3001/app#journal`.
**Impact:** Scent Journal linked from homepage is not accessible via URL.
**Where:** Hash routing in `app.js`.

### LOW: State change aria-live announcements missing
**What:** When a user marks a fragrance as owned/wishlist/removed, no screen reader announcement fires. Keyboard users get zero feedback.
**Why:** Persona: Nadia (low vision, keyboard-first). Currently silent — she has to navigate away and back to confirm the action worked.
**Where:** `setState()` in `app.js` should write to `#cat-live` or a dedicated `aria-live="assertive"` region.
**Effort:** S (CC: ~10 min)

### LOW: Swipe-to-action triggers on reduced-motion / imprecise input
**What:** Catalog row swipe actions fire accidentally for users with tremor. Respect `prefers-reduced-motion` to disable swipe gestures and show action buttons inline instead.
**Why:** Persona: Miguel (essential tremor). Lateral hand movement triggers swipe when he means to scroll.
**Where:** Swipe handler in `app.js` catalog rows + `styles/components.css` for inline button variant.
**Effort:** S (CC: ~10 min)

---

## Phase 1: Search Improvements + Quick Wins

### Diacritic normalization + fuzzy matching + keyboard navigation
**What:** (1) Diacritic stripping so `xinu` matches `xinú`, (2) Levenshtein fuzzy fallback so `diptique` matches `diptyque`, (3) arrow-key navigation from search input through catalog results.
**Why:** #1 silent failure mode in search. Covers catalog, ⌘K modal, and compare picker.
**Depends on:** Nothing. Self-contained change to `store.js` + `app.js` + `styles/components.css`.
**Status:** ✅ SHIPPED (2026-03-19, changelog entry 4).
**Effort:** S (CC: ~15 min)

### Undo toast for state changes
**What:** After any owned/wish/remove action, show a 3-second toast with "Undo" button. If tapped, reverts the state change.
**Why:** Persona: Miguel (essential tremor). Accidentally cycles state frequently due to imprecise clicking. No way to revert without cycling through all 3 states again.
**Where:** `setState()` in `app.js`. Toast component in `components.css`.
**Depends on:** Nothing. Self-contained.
**Effort:** S (CC: ~15 min)

### Share button on Compare results
**What:** Add a share/copy button to the Compare results section. Uses `navigator.share()` on mobile, clipboard copy on desktop. Compare URLs (`#compare/<id-a>/<id-b>`) already work via `history.replaceState`.
**Why:** Persona: Jake (in-store shopper). Wants to share comparisons with friends. The URLs exist but there's no UI to copy them.
**Where:** `renderCompareResults()` in `app.js`.
**Effort:** S (CC: ~10 min)

### "If you like X" recommendations in detail view
**What:** At the bottom of `renderFragDetail()`, show "You might also like" with top 3 most similar fragrances (via `scoreSimilarity()`). Each row is a clickable `.list-item--compact`.
**Why:** Persona: Jake (curious shopper). Arrives via one comparison, sees one fragrance detail, then dead-ends. This keeps exploration going.
**Where:** `renderFragDetail()` in `app.js`. `scoreSimilarity()` already exists.
**Effort:** S (CC: ~15 min)

### Plain-language metric labels in detail view
**What:** Next to sillage and layering scores, show the human-readable label. e.g., "7/10 — Strong (fills a room)" instead of just "7/10". The `SW[]` and `LW[]` arrays already exist with these labels.
**Why:** Persona: Sarah (gift giver). "Sillage 7/10" means nothing to non-enthusiasts. The labels exist in code but aren't displayed.
**Where:** `renderFragDetail()` in `app.js`. Just concatenate `SW[score]` / `LW[score]`.
**Effort:** S (CC: ~5 min)

---

## Phase 1.5: Collection Intelligence (before DNA Card)

### Basic collection stats on 'You' tab
**What:** Above the flat fragrance list on the 'You' / saved panel, show: total owned count, family breakdown (horizontal pill bar), average sillage, most common note across collection.
**Why:** Persona: Emma (collector, 15 fragrances). Currently the 'You' tab is a dumb list. Even basic stats create collection awareness and prime users for DNA Card.
**Where:** `buildSavedPanel()` or equivalent in `app.js`. `computeProfile()` can be aggregated across owned fragrances.
**Depends on:** Nothing. Uses existing functions.
**Effort:** S (CC: ~20 min)

---

## Phase 2: Scent DNA Card

**What:** Wardrobe-derived identity profile. When user has ≥3 owned fragrances, aggregates `computeProfile()` across collection → persona + sensory bars + family breakdown + gap recommendation + shareable card.
**Why:** The emotional hook. Turns wardrobe data into identity. Creates collection investment and share moments.
**Status:** Design-complete. Full spec in memory (`project_scent_dna_card.md`).
**Depends on:** Nothing. Additive feature.
**Effort:** M (CC: ~30 min)

When shipping DNA Card, also do:
- Deduplicate `computeProfile()` / `NOTE_PROFILE{}` between app.js and engine.js (~130 lines of exact duplication)
- Add analytics event stubs (`dna_tab_viewed`, `dna_persona_assigned`, etc.)

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
