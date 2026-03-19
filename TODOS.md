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
**Status:** ✅ SHIPPED (2026-03-19, changelog entry 7).

---

## Phase 1.5: Collection Intelligence (before DNA Card)
**Status:** ✅ SHIPPED (2026-03-19, changelog entry 7).

---

## Phase 2: Scent DNA Card
**Status:** ✅ SHIPPED (2026-03-19, changelog entry 7).

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
