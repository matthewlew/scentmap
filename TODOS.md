# Scentmap — TODOs

Updated 2026-03-22.

**Product direction:** Help people discover fragrances that complete their wardrobe.

**Scope rule:** No new features until P2 ships. Ideas go in the Ideas section, not here.

Read `DESIGN.md` and `CLAUDE.md` before starting any task.

---

## Design System — Audit Violations

~~**Scheduled audit (2026-03-23)** found 15+ violations. All items fixed 2026-03-23.~~

### ✅ FIXED (2026-03-23 scheduled task)
- Magic numbers: `font-size:10px` → `var(--fs-caption)`; `color:var(--g500)` → `var(--text-tertiary)` (4 sites)
- `.saved-mark` utility class added; 3 inline spans replaced
- `.callout--attribution` + `.callout-icon` added; 9 inline styles stripped from attribution box
- `.s-name-btn` deleted; all usages migrated to `.link-btn.link-btn--primary`
- `.dupe-breakdown` / `.dupe-breakdown-row` redundant inline styles stripped (CSS already defined them)
- `.quiz-step` class added; 4× inline padding replaced
- `.btn--block` + `.btn--ghost` added; inline width/bg styles replaced
- `.text-title--accent` modifier added; inline color override replaced
- `.score-display` + `.score-meter-*` canonical aliases added; `.cmp-score-*` kept as legacy aliases

### Won't fix for now
- **Score meter full rename** — `.cmp-score-pct` → `.score-display` in JS call sites (30+ sites). CSS aliases added; full rename deferred until Compare panel is refactored.
- **Dupe breakdown class rename** — `.dupe-breakdown` → `.callout` structure change. Current CSS is correct; structural rename risks visual regression. Deferred.
- **`.cmp-card-detail-btn`** — Still in use in Compare panel. Migrate to `.link-btn.link-btn--primary` when Compare panel is refactored.

---

## NOW: Phase 0 — Gift Intelligence Wedge

**This blocks P1/P2/P3. Ship these items before continuing anything else.**
**Full plan + eng review:** `~/.gstack/projects/matthewlew-scentmap/ceo-plans/2026-03-21-gift-intelligence-wedge.md`

### TODO: Gift Intelligence — Ship the wedge
**What (in order):**
1. ~~Delete `gift-intelligence` entry from `data/quiz-config.json`~~ — **DEFERRED** (see deferred TODO below)
2. ~~Add `gift-intelligence` to `QUIZ_META` in `api/quiz.js` with SEO title, description, and `noscriptPopular: ['gypsy-water','santal-33','bal-dafrique','rose-31','mojave-ghost']`~~ — **DONE by /qa 2026-03-23** (also added to `data/quiz-config.json`; quiz was showing "Quiz not found.")
3. ~~Add `btn.disabled = true` double-tap guard~~ — **DONE** (simplify 2026-03-22)
4. Call `engine.getSwapReason(top3[0], top3[1], FAM)` in `renderResult()` when `top3.length >= 2` — show 1-sentence narrative between subtitle and first card; apply to **both** `app.js` and `quiz.js renderResults()`
5. Add `history.replaceState(null,'','?results=' + top3.map(f=>f.id).join(','))` on result render in `app.js`; restore from `?results=` param on load (quiz.js already handles this)
6. Wrap all `sessionStorage` reads/writes in try/catch (iOS private mode throws)
7. ~~Show honest empty-state copy when fallback fires~~ — **DONE** (simplify 2026-03-22). ~~Skip `quiz_complete` event when fallback fires~~ — **DONE** (simplify 2026-03-22)
8. ~~Extract inline styles to `.gift-result-card`, `.gift-sample-link`, `.gift-view-btn`, `.gift-quiz-restart` in `components.css`~~ — **DONE** (simplify 2026-03-22)
9. Wire `trackEvent()` to Supabase inserts in **both** `app.js` and `quiz.js` — `if (!_sb) return;` null-guard required; `.catch(e => console.warn('[analytics]', e))` on each insert. **Gate:** confirm `events` table exists first (schema: `id uuid pk, name text, props jsonb, ts timestamptz default now()`, anon INSERT RLS enabled)
10. Add "Try a sample →" CTA to `quiz.js renderResults()` when `config.scoring?.giftMode` is true — fire `sample_link_click` event; success gate depends on this path
**Why:** Gifter is the highest-intent acquisition wedge. Analytics gate everything else.
**Success gate:** `sample_link_click > 0` in Supabase within week 1.
**Effort:** S (~1.5 hrs remaining) · **Reviews:** CEO CLEARED (9/10) + Eng CLEARED (`main`, 2026-03-21)

---

## P2 — Active (ship after Phase 0, in order by effort)

### XS — Quick wins (≤15 min each)

### TODO: Brand Card Hover Affordance
**What:** Increase brand discovery card hover state from `--border-subtle` to `--border-strong` + light background shift.
**Why:** Current subtle border change is invisible for imprecise cursor users (Miguel).
**Effort:** XS (CSS only, ~5 min) · **Depends on:** `.carousel-card` in `components.css`.

---

### TODO: Gift-mode-aware heading in quiz.js renderResults()
**What:** When `config.scoring?.giftMode` is true, render `"Three gifts worth giving."` and `"Curated from N fragrances across N prestige houses. Each one says something."` instead of the generic `"Your Perfect Matches"` copy.
**Why:** The standalone page is the primary gifter touchpoint and first SEO contact. Generic copy weakens the gift framing on the page most likely to be shared.
**Effort:** XS (2-line conditional in `renderResults()`)

---

### TODO: DNA Card Profile Bars — ARIA
**What:** Replace visual-only profile bars on the DNA Card with `<meter>` elements (`min="0"` `max="100"` `value="{n}"` `aria-label="Freshness: {n}%"`).
**Why:** Screen readers skip the current bars entirely — a11y obligation for a shipped feature.
**Effort:** XS (~10 min) · **Depends on:** DNA card markup in `app.js`.

---

### TODO: Golden Pairs Carousel — Keyboard Nav
**What:** Call `initCarouselKeyNav()` on the `pairWrap` element after `pairSec` is built (~line 1252). Apply `role="list"`, `aria-label`, and roving tabindex — same pattern as Brand Discovery carousel.
**Why:** A11y obligation — `initCarouselKeyNav()` was never called on Golden Pairs at render time.
**Effort:** XS (~10 min)

---

### TODO: State Bar Collection Count Text
**What:** Add "N items" text beside the active state tab (Owned/Wishlist) in the catalog filter bar.
**Why:** Users want to know collection size without scanning the list.
**Effort:** XS (~10 min) · **Depends on:** `CAT_STATE_FILTER`, owned/wish counts from `ST{}`.

---

### TODO: Carousel Focus Restoration After Detail Close
**What:** Push `document.activeElement` when a carousel card triggers `openDesktopDetail()` or a mobile sheet. Pop + restore focus on close. Use a focus stack (`_focusStack = []`) to handle nested carousels.
**Why:** Keyboard focus jumps to page top after detail close — breaks Nadia's flow every session.
**Effort:** XS (~15 min) · **Depends on:** `openDesktopDetail()`, `closeDesktopDetail()`, sheet stack.

---

### S — Standard tasks (20–30 min each)

### ~~TODO: Quiz Result Persistence~~ — **FIXED by /qa 2026-03-23**
~~**What:** Store quiz results in `sessionStorage` key `sm_quiz_session`; back-navigation returns to results, not catalog.~~
**Fixed:** Session was already being saved but `results` was stored as a comma-joined string. `renderSessionResults` crashed with `.map is not a function`. Fixed in `js/quiz.js` by normalising to array on read. Back-navigation now correctly restores results.
**Remaining tech debt (minor):** `saveQuizSession` still passes `ids.join(',')` as a string; the fix is in the consumer (`renderSessionResults`). A cleaner fix would pass the array directly — low priority.

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

### TODO: Carousel Prev/Next Buttons
**What:** Add `<button class="carousel-prev/next">` to all carousels. Click: `carousel.scrollBy({left: ±300, behavior:'smooth'})`. Buttons hide at scroll start/end. Desktop only (≥1100px).
**Why:** Miguel (tremor) cannot use horizontal scroll — arrow keys exist but require keyboard-first mode.
**Effort:** S (~25 min) · **Depends on:** `initCarouselKeyNav()`.

---

### TODO: Playwright test — standalone gift quiz flow
**What:** Extend `run_playwright_tests.py` with a test for `/quiz/gift-intelligence`: page loads → 5 answers → results page renders 3 frag cards → "Try a sample" CTA present.
**Why:** Zero automated coverage for the quiz.js standalone path. Success gate (`sample_link_click`) depends on this path working correctly. Manual testing only right now.
**Effort:** S (~30 min) · **Depends on:** quiz dev server at `localhost:3001`

---

### TODO: Playwright test — dupe page
**What:** Extend `run_playwright_tests.py` with a test for `/dupes/santal-33/`: page loads → anchor card renders → 3+ dupe cards render → Ladder strip visible → funnel CTA present.
**Why:** Zero automated coverage for the dupe page. Add before any SEO/domain work.
**Effort:** S (~20 min) · **Gate:** Add before going beyond prototype stage.

---

### TODO: Extract note-diff logic into engine.js
**What:** Move the note comparison function (currently reimplemented inline in `js/dupes.js`) into `js/engine.js` as an exported `renderNoteGrid(fa, fb, anchorAccent, dupeAccent, opts)`. Remove `NI_MAP` / `isNoteSaved` dependencies so the function is importable from standalone modules without app.js globals.
**Why:** `app.js:render3x3Notes()` and `js/dupes.js` now contain two copies of the same ~45-line note-diffing + grid-rendering logic. A 3rd standalone consumer (e.g. gift guide pages, individual fragrance pages) would require a 3rd copy.
**When:** After the dupe prototype validates AND a 2nd standalone consumer exists.
**Effort:** S (~20 min) · **Depends on:** `app.js:3900 render3x3Notes()`, `js/dupes.js:renderNoteGrid()`.

---

### M — Larger tasks (45+ min)

### TODO: List Item Component Consolidation
**What:** Migrate all list-item render sites from legacy multi-variant system to canonical slot structure in `DESIGN.md` Option B. Class rename map and ~15–20 render sites documented in previous version of this file (git history: before 2026-03-21 simplification commit).
**Why:** 4 inconsistent variants, dead inner wrapper, mixin anti-pattern, typography violations.
**Effort:** M (~45 min) · **Depends on:** `designsystem.html` Option B demo.

---

### TODO: Sillage & Layering Data Quality Audit
**What:** Verify sillage (0–10) and layering (0–10) scores across the 213-frag dataset. Scores are LLM-generated and may be miscalibrated or clustered in a narrow range (e.g. 3–9). Audit: (1) plot score distributions; (2) compare against known references (Santal 33 ≈ high sillage; a skin scent ≈ low). (3) Based on distribution, decide whether to keep the 0–10 display scale, collapse to 3-level (Low/Medium/High), or 5-level (Very Low→Very High). Update score rendering in detail panel and compare metric bars accordingly.
**Why:** If the scale is unreliable, showing numeric bars misleads users. Display granularity should match data reliability.
**Effort:** M (data + UI) · **Blocks:** Any future score-based filtering or sorting.

---

## Strategic Roadmap (CEO Review 2026-03-21)

**Mode:** SCOPE EXPANSION · **Full vision doc:** `~/.gstack/projects/matthewlew-scentmap/ceo-plans/2026-03-21-product-positioning-trust.md`

**Positioning:** "Your fragrance wardrobe, mapped." Not reviews, not encyclopedia, not marketplace. Wardrobe intelligence with transparent math.

**Scope rule:** Phase 0 ships first. P2 ships second. These phases layer on top.

---

### Phase 1 — Foundation (after Phase 0 ships)

#### TODO: Brand Positioning & Manifesto
**What:** Produce `BRAND.md` — positioning statement, beliefs, refusals, voice guidelines. Update `<meta description>` across all HTML entry points (index.html, app.html, quiz/*/index.html, compare/*/index.html).
**Why:** Zero articulated positioning. Everything else builds on this — trust, content, monetization all need a brand filter.
**Effort:** S (~20 min)

---

#### TODO: Custom Supabase Event Analytics
**What:** Wire existing `trackEvent()` stubs in `js/app.js:14` to Supabase inserts. Table: `events(event_name TEXT, properties JSONB, created_at TIMESTAMPTZ)`. Events: `quiz_complete`, `compare_search`, `frag_owned`, `frag_wished`, `frag_detail_open`, `share_click`, `page_view`. Supabase anon-key already in client code.
**Why:** Zero analytics. Can't measure engagement, quiz conversion, or feature usage. No PII, no cookies.
**Effort:** S (~15 min) · **Depends on:** Supabase project table creation.

---

### Phase 2 — Trust + Product

#### TODO: Trust Architecture — "Show Your Math"
**What:** (1) "How It Works" page explaining scoring in plain English. (2) Expandable "Why this score?" on compare results — show shared notes count, family compatibility, sillage proximity. (3) Data provenance statement. (4) "No Affiliate Bias" pledge.
**Why:** The anti-AI-slop play. Every score should be auditable. Moat against generated listicle sites.
**Effort:** M (~45 min) · **Prereq:** Audit `scoreSimilarity()` in `js/engine.js:170` and `computeProfile()` in `js/engine.js:130` for explainability.

---

#### TODO: Compare Stories — "Why This, Not That"
**What:** New `getCompareNarrative(a, b)` in `js/engine.js`, extending `getSwapReason()` pattern (line 207). Template-based (NOT LLM-generated): profile delta variables drive sentence selection. 2-3 sentences displayed above Venn diagram.
**Why:** Turns compare from a dashboard into a conversation. People decide between fragrances based on stories, not scores.
**Effort:** S (~30 min)

---

#### TODO: Zero-State First Visit Experience
**What:** Expand existing Zero-Owned TODO: (1) You tab: "Start with something you know" + 5 landmark frags (Santal 33, Bleu de Chanel, Acqua di Gio, Black Opium, Chanel No. 5). (2) Brand Discovery: CTA replacing empty carousel. (3) After first mark: immediate wardrobe intelligence.
**Why:** First 60 seconds determine bounce vs. user. Zero-owned users see empty personalization.
**Effort:** S (~25 min) · **Note:** Supersedes P2 "Zero-Owned State" TODO — this is the expanded version.

---

### Phase 3 — SEO Content

#### TODO: Brand Gift Guide Pages
**What:** `/api/brand` serverless route. 12 brand pages (e.g. `/brand/byredo`). Content: brand intro, top picks by gifter intent, gift occasion framing, link to gift quiz pre-filtered for that brand. Same Vercel pattern as `/api/compare`. Generate `sitemap.xml` entry for each.
**Why:** "[brand] gift guide" and "best [brand] fragrance gift" are lower-competition, higher-gifter-intent queries. Primary SEO entry point for the gift wedge.
**Effort:** S (~30 min) · **Depends on:** Phase 0 gift quiz shipped.

---

#### TODO: Individual Fragrance Pages
**What:** Vercel serverless route `/api/fragrance` following existing `/api/compare` pattern. Rewrite in `vercel.json`: `/fragrance/:id -> /api/fragrance`. Content: notes by tier, sensory profile, top 5 similar, role badges, "What to get someone who loves [frag]" gifter CTA. JSON-LD Product schema. Noscript fallback. Generate `sitemap.xml` covering all 213 URLs.
**Why:** "What to get someone who loves [frag]" and "[fragrance name] gift" queries — gifter intent, not encyclopedia queries.
**Effort:** M (~1 hr) · **Depends on:** `/api/compare` pattern, Brand Gift Guide pages (shared template).

---

### Phase 4 — Monetization (after trust layer ships)

#### TODO: Sampling Partnership Infrastructure
**What:** Add `sampleUrl` field to fragrance JSON (manual curation). "Try a sample" link on detail pages — clearly labeled external. Candidate services: MicroPerfumes, DecantX, Luckyscent.
**Why:** Aligned incentives: $4 samples, not $300 bottles. No financial incentive to recommend one fragrance over another.
**Effort:** S-M (~30 min code, ongoing curation) · **Activate when:** Supabase events show >500 monthly quiz/compare sessions.

---

## Deferred (blocked — do not start)

### TODO: Delete gift-intelligence from quiz-config.json
**What:** Delete the `gift-intelligence` entry from `data/quiz-config.json`.
**Why blocked:** The standalone `/quiz/gift-intelligence` page (quiz.js) reads this config — deleting it causes "Quiz not found." Safe to delete only after quiz.js migration ships the real curated questions.
**Depends on:** quiz.js migration (currently deferred).
**Effort:** XS (1-line deletion + smoke test)

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

## Infrastructure

### TODO: Scent Data Consolidation
**What:** Replace 14 scent data files (`scents-flat.json`, `scents-index.json`, `data/scents/*.json`) with a single `data/scents.json` flat array. Reduces startup from 16 HTTP requests (waterfall) to 4 (parallel). Full plan: `data/MIGRATION-SCENTS.md`.
**Why:** Two parallel schemas in sync, 12-file waterfall on every load, `quiz.js` working from a stale copy missing `url` and `story` fields.
**Effort:** S (~30 min) · **Gate:** Can start any time, independent of P2.

---

## Ideas Parking Lot

- Shareable Fragrance Identity / Archetype Cards — collection-based archetype + OG share card (viral mechanic, needs audience first) *(CEO Review 2026-03-21)*
- Description Rewrite — all 213 descriptions in distinctive Scentmap voice, not AI slop (do incrementally as fragrance pages launch) *(CEO Review 2026-03-21)*
- Blind Buy Oracle (confidence score)
- "Smells like..." evocative descriptions (needs copywriter for 213 frags)
- Shareable gap card
- "Surprise Me" Random Compare
- Collection milestones / gamification
- Mood/Vibe Quiz — image-based personality variant
- Quiz-to-Compare Bridge (pre-fill Compare from quiz results)

---

## Already Shipped

- **Fragrance Ladder Dupe Prototype** — `/dupes/santal-33/` — 4 curated Santal 33 alternatives, Fragrance Ladder strip, 3-col note grids, score badges, savings-per-oz, funnel CTA (2026-03-22)
- **Gift Intelligence Quiz** — `/quiz/gift-intelligence` standalone + in-app path, 5 curated questions, sample CTA (2026-03-22)
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
