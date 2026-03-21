# Scentmap — TODOs

Updated 2026-03-21.

**Product direction:** Help people discover fragrances that complete their wardrobe.

**Scope rule:** No new features until P2 ships. Ideas go in the Ideas section, not here.

Read `DESIGN.md` and `CLAUDE.md` before starting any task.

---

## P2 — Active (ship in order)

### TODO: Golden Pairs Carousel — Keyboard Nav
**What:** Call `initCarouselKeyNav()` on the `pairWrap` element after `pairSec` is built (~line 1252). Apply `role="list"`, `aria-label`, and roving tabindex — same pattern as Brand Discovery carousel.
**Why:** A11y obligation — `initCarouselKeyNav()` was never called on Golden Pairs at render time.
**Effort:** XS (~10 min)

---

### TODO: Quiz Result Persistence
**What:** Store quiz results in `sessionStorage` key `sm_quiz_session`; back-navigation returns to results, not catalog.
**Schema:** `{quizId: string, timestamp: number, answers: string[], results: string[]}`.
**Why:** UX bug — losing state on back-nav from detail breaks every gift-giver and casual-shopper session.
**Effort:** S (~20 min) · **Depends on:** Quiz routes.

---

### TODO: DNA Card Profile Bars — ARIA
**What:** Replace visual-only profile bars on the DNA Card with `<meter>` elements (`min="0"` `max="100"` `value="{n}"` `aria-label="Freshness: {n}%"`).
**Why:** Screen readers skip the current bars entirely — a11y obligation for a shipped feature.
**Effort:** XS (~10 min) · **Depends on:** DNA card markup in `app.js`.

---

### TODO: Carousel Focus Restoration After Detail Close
**What:** Push `document.activeElement` when a carousel card triggers `openDesktopDetail()` or a mobile sheet. Pop + restore focus on close. Use a focus stack (`_focusStack = []`) to handle nested carousels.
**Why:** Keyboard focus jumps to page top after detail close — breaks Nadia's flow every session.
**Effort:** XS (~15 min) · **Depends on:** `openDesktopDetail()`, `closeDesktopDetail()`, sheet stack.

---

### TODO: State Bar Collection Count Text
**What:** Add "N items" text beside the active state tab (Owned/Wishlist) in the catalog filter bar.
**Why:** Users want to know collection size without scanning the list.
**Effort:** XS (~10 min) · **Depends on:** `CAT_STATE_FILTER`, owned/wish counts from `ST{}`.

---

### TODO: Brand Card Hover Affordance
**What:** Increase brand discovery card hover state from `--border-subtle` to `--border-strong` + light background shift.
**Why:** Current subtle border change is invisible for imprecise cursor users (Miguel).
**Effort:** XS (CSS only, ~5 min) · **Depends on:** `.carousel-card` in `components.css`.

---

### TODO: Carousel Prev/Next Buttons
**What:** Add `<button class="carousel-prev/next">` to all carousels. Click: `carousel.scrollBy({left: ±300, behavior:'smooth'})`. Buttons hide at scroll start/end. Desktop only (≥1100px).
**Why:** Miguel (tremor) cannot use horizontal scroll — arrow keys exist but require keyboard-first mode.
**Effort:** S (~25 min) · **Depends on:** `initCarouselKeyNav()`.

---

### TODO: Smart Wishlist Priority ("Next Buy" Flag)
**What:** Single-tap toggle on wishlist rows sets a "next buy" flag (`sm_wish_priority` localStorage, one ID). Flagged row shows `★ Next` trailing label. Also shown in detail panel when wishlisted. One flag at a time — tapping another moves the flag.
**Why:** Users track purchase priority in a separate note app — this closes that loop.
**Effort:** S (~20 min) · **Depends on:** `ST{}`, `renderCatRow`.

---

### TODO: "More Like This" Diversity Boost
**What:** Replace rank 5 of the 5-result block with a family-diverse wildcard — highest `scoreSimilarity()` frag from the least-represented family, labelled "Something different →".
**Why:** Current suggestions are too samey for same-family frags.
**Effort:** S (~20 min) · **Depends on:** `scoreSimilarity()`, family data on `CAT[]`.

---

### TODO: Zero-Owned State — Onboarding Prompt
**What:** Two pieces: (1) Brand Discovery: if `owned.length === 0`, replace carousel with a CTA card → opens catalog. (2) You Tab: show "Start with something you know" + 5 hardcoded landmark frags (Acqua di Gio, Santal 33, Chloé EDP, Black Opium, Terre d'Hermès) — look up IDs via brand+name match against `CAT[]`. Both disappear once any frag is owned.
**Why:** Zero-owned users see empty personalization — the app's best features are invisible to new users.
**Effort:** S (~25 min) · **Depends on:** `ST{}` owned count, Brand Discovery and You tab render functions.

---

### TODO: Design System — 1-Off Pattern Migration
**What:** Extract 8 inline-style violations in `app.js` into CSS classes (single CSS-only commit, no behavior change):
1. `.quiz-attribution` — replaces fully-inline `.dc-quiz-attribution` (~line 1580)
2. `.stat-cell` / `.stat-cell-value` / `.stat-cell-label` — inline profile stats (~lines 278–285)
3. `.dc-badge--xs` modifier — replace `style="font-size:9px"` (~line 1216)
4. Move `font-size` into `.dc-sim-brand` rule — remove `style="font-size:10px"` (~line 1220)
5. `var(--scrim-dot)` token — replace `rgba(255,255,255,.3)` (~line 1594)
6. `.tab--xs` modifier — replace `style.cssText` on removeBtn/addBtn (~lines 2536, 2575)
7. `.chart-legend-item` — replace fully-inline family legend HTML (~line 1984)
8. `.dupe-card` — remove `.list-item` from dupe finder results that use `display:block` override (~line 1518)
**Why:** Inline-style violations block future refactors and make the system inconsistent.
**Effort:** S (~30 min)

---

### TODO: List Item Component Consolidation
**What:** Migrate all list-item render sites from legacy multi-variant system to canonical slot structure in `DESIGN.md` Option B. Class rename map and ~15–20 render sites documented in previous version of this file (git history: before 2026-03-21 simplification commit).
**Why:** 4 inconsistent variants, dead inner wrapper, mixin anti-pattern, typography violations.
**Effort:** M (~45 min) · **Depends on:** `designsystem.html` Option B demo.

---

### TODO: Sillage & Layering Data Quality Audit
**What:** Verify sillage (0–10) and layering (0–10) scores across the 183-frag dataset. Scores are LLM-generated and may be miscalibrated or clustered in a narrow range (e.g. 3–9). Audit: (1) plot score distributions; (2) compare against known references (Santal 33 ≈ high sillage; a skin scent ≈ low). (3) Based on distribution, decide whether to keep the 0–10 display scale, collapse to 3-level (Low/Medium/High), or 5-level (Very Low→Very High). Update score rendering in detail panel and compare metric bars accordingly.
**Why:** If the scale is unreliable, showing numeric bars misleads users. Display granularity should match data reliability.
**Effort:** M (data + UI) · **Blocks:** Any future score-based filtering or sorting.

---

## P3 — Backlog (unprioritized, do not start until P2 ships)

Require designer specs and/or content deliverables before engineering.

| Item | What | Effort | Blocker |
|---|---|---|---|
| **Scent Persona** | Shareable identity card from collection; 16 archetypes from profile axes | M | Share card layout |
| **Scentscape** | Daily 3-tap mood picker recommends from owned collection | M | — |
| **Season Wardrobe** | Map owned frags to current season via family + sillage scoring | M | — |
| **Zodiac Quiz Bridge** | Upgrade `/quiz/astro-scent`; Add to Collection button seeds app state | M | — |
| **Big Three Astro** | Sun + Moon + Rising composite match; 1,728 combinations | M | 36 copy lines |
| **Layering Lab** | Pick 2 frags → compatibility %, combined radar, recipe card | M | — |
| **Compare → Gift Card** | Gift-framing share output from Compare results | M | Visual spec |
| **Compare Keyboard Shortcuts** | `X` to swap, `Backspace` to clear; static hint line; aria-live announce | S | — |
| **Note Glossary Tooltips** | 1-sentence description on note name hover | M | 177 note descriptions |
| **Fragrance Memory Journal** | ≤140-char memory note per frag; occasion/person/season tags | M | — |

---

## Ideas Parking Lot

- Blind Buy Oracle (confidence score)
- "Smells like..." evocative descriptions (needs copywriter for 183 frags)
- Shareable gap card
- "Surprise Me" Random Compare
- Collection milestones / gamification
- Mood/Vibe Quiz — image-based personality variant
- Quiz-to-Compare Bridge (pre-fill Compare from quiz results)

---

## Already Shipped

- **Saved Comparisons** — last 5 pairs in `sm_compares`, row tap fills both slots (2026-03-21)
- **Collection Context in Detail Panel** — "In your collection: X (89%)" below action buttons (`9d63a80`)
- **Wardrobe Gap — Specific Frag Suggestions** — 2–3 carousel cards per gap axis (`9d63a80`)
- **Brand Detail — Best Matches** — top 3 from that house by similarity (`3709ddb`)
- **Plain-Language Metric Labels** — shipped 2026-03-20 (`946ea91`)
- **Carousel Keyboard Navigation** — roving tabindex, arrow keys (`c405391`)
- **Note Layer Badge Size Fix** — `var(--fs-label)` + padding (`c405391`)
- **Gap CTA Post-Navigation Announcement** — `#cat-live` after tab switch (`c405391`)
- **Share Button on Compare** — `navigator.share()` + clipboard fallback
- **"More Like This" in Detail View** — 5 similarity-ranked suggestions
- **Olfactive DNA Card on You Tab** — profile bars, persona archetype, gap rec
- **Brand Discovery Panel** — carousel with personalized reasons
- **Wardrobe Gap Analysis** — sensory gap headline + family CTA
