# Scentmap — TODOs

Updated 2026-03-24 (QA pass — `add-fragrances` branch).

**Product direction:** Help people discover fragrances that complete their wardrobe.

**Scope rule:** No new features until P2 ships. Ideas go in the Ideas section, not here.

Read `DESIGN.md` and `CLAUDE.md` before starting any task.

---

## P2 — Active (ship in order)

### ~~TODO: Golden Pairs Carousel — Missing ARIA Roles~~
**Status: Shipped (2026-03-24).** `role="list/listitem"` and `aria-label` logic added to `js/app.js` line 1160. **QA 2026-03-24:** confirmed.

---

### TODO: Quiz Result Persistence
**What:** Store quiz results in `sessionStorage` key `sm_quiz_session`; back-navigation returns to results, not catalog.
**Schema:** `{quizId: string, timestamp: number, answers: string[], results: string[]}`.
**Why:** UX bug — losing state on back-nav from detail breaks every gift-giver and casual-shopper session.
**Effort:** S (~20 min) · **Depends on:** Quiz routes. · **QA 2026-03-24:** confirmed not done. Completed quiz at `/quiz/best-perfume-for-men-2026/` — zero `sm_quiz_session` in sessionStorage after completion. App also navigated to compare URL after quiz finished.

---

### TODO: DNA Card Profile Bars — ARIA
**What:** Replace visual-only profile bars on the DNA Card with `<meter>` elements (`min="0"` `max="100"` `value="{n}"` `aria-label="Freshness: {n}%"`).
**Why:** Screen readers skip the current bars entirely — a11y obligation for a shipped feature.
**Effort:** XS (~10 min) · **Depends on:** DNA card markup in `app.js`. · **QA 2026-03-24:** confirmed zero `<meter>` elements in DOM; bars use `div.cmp-score-meter > .cmp-score-meter-fill`.

---

### TODO: Carousel Focus Restoration After Detail Close
**What:** Push `document.activeElement` when a carousel card triggers `openDesktopDetail()` or a mobile sheet. Pop + restore focus on close. Use a focus stack (`_focusStack = []`) to handle nested carousels.
**Why:** Keyboard focus jumps to page top after detail close — breaks Nadia's flow every session.
**Effort:** XS (~15 min) · **Depends on:** `openDesktopDetail()`, `closeDesktopDetail()`, sheet stack. · **QA 2026-03-24:** confirmed — after sheet close, `document.activeElement` = `<body>` (no class, no id). Not done.

---

### ~~TODO: State Bar Collection Count Text~~
**Status: Shipped (equivalent).** Tabs now render as "Owned (5)" / "Wishlist (2)" inline — counts visible at all times regardless of which tab is active. Original spec said "beside active tab" but inline-in-label is cleaner. **QA 2026-03-24:** confirmed.

---

### ~~TODO: Brand Card Hover Affordance~~
**Status: Shipped.** `.carousel-card--brand:hover` now sets `border-color: var(--border-strong)` + `background: var(--bg-secondary)`. **QA 2026-03-24:** confirmed in `components.css` line 3154.

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
**Effort:** S (~20 min) · **Depends on:** `scoreSimilarity()`, family data on `CAT[]`. · **QA 2026-03-24:** confirmed not done. Tobacco Vanille (Gourmand) shows 6 results: 4 are Amber family, all detail text reads "A less sweet, drier alternative" — no family diversity, no "Something different →" label.

---

### TODO: Zero-Owned State — Onboarding Prompt
**What:** Two pieces: (1) Brand Discovery: if `owned.length === 0`, replace carousel with a CTA card → opens catalog. (2) You Tab: show "Start with something you know" + 5 hardcoded landmark frags (Acqua di Gio, Santal 33, Chloé EDP, Black Opium, Terre d'Hermès) — look up IDs via brand+name match against `CAT[]`. Both disappear once any frag is owned.
**Why:** Zero-owned users see empty personalization — the app's best features are invisible to new users.
**Effort:** S (~25 min) · **Depends on:** `ST{}` owned count, Brand Discovery and You tab render functions. · **QA 2026-03-24:** confirmed not done. Zero-owned state shows "Nothing saved yet. Swipe a fragrance to wishlist it…" — no landmark frags shown, no CTA.

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

### ~~TODO: List Item Component Consolidation~~
**Status: Shipped (2026-03-24).** Base `.list-item` handles all contexts; `.list-item--compact` removed; dot sizing and alignment unified. **QA 2026-03-24:** confirmed.

---

### TODO: Sillage & Layering Data Quality Audit
**What:** Verify sillage (0–10) and layering (0–10) scores across the 213-frag dataset. Scores are LLM-generated and may be miscalibrated or clustered in a narrow range (e.g. 3–9). Audit: (1) plot score distributions; (2) compare against known references (Santal 33 ≈ high sillage; a skin scent ≈ low). (3) Based on distribution, decide whether to keep the 0–10 display scale, collapse to 3-level (Low/Medium/High), or 5-level (Very Low→Very High). Update score rendering in detail panel and compare metric bars accordingly.
**Why:** If the scale is unreliable, showing numeric bars misleads users. Display granularity should match data reliability.
**Effort:** M (data + UI) · **Blocks:** Any future score-based filtering or sorting.

---

## Strategic Roadmap (CEO Review 2026-03-21)

**Mode:** SCOPE EXPANSION · **Full vision doc:** `~/.gstack/projects/matthewlew-scentmap/ceo-plans/2026-03-21-product-positioning-trust.md`

**Positioning:** "Your fragrance wardrobe, mapped." Not reviews, not encyclopedia, not marketplace. Wardrobe intelligence with transparent math.

**Scope rule:** P2 ships first. These items layer on top, sequenced by phase.

---

### Phase 1 — Foundation (do first)

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
**What:** Expand existing Zero-Owned TODO: (1) You tab: "Start with something you know" + 5 landmark frags (Santal 33, Bleu de Chanel, Acqua di Gio, Black Opium, Chanel No. 5). (2) Brand Discovery: CTA replacing empty carousel. (3) After first mark: immediate wardrobe intelligence. The emotional moment: the first time the app tells you something about yourself.
**Why:** First 60 seconds determine bounce vs. user. Zero-owned users see empty personalization.
**Effort:** S (~25 min) · **Note:** Supersedes P2 "Zero-Owned State" TODO — this is the expanded version.

---

### Phase 3 — SEO Content

#### TODO: Individual Fragrance Pages
**What:** Vercel serverless route `/api/fragrance` following existing `/api/compare` pattern. Rewrite in `vercel.json`: `/fragrance/:id -> /api/fragrance`. Content: notes by tier, sensory profile (from `computeProfile()`), top 5 similar (from `scoreSimilarity()`), role badges. JSON-LD Product schema. Noscript fallback. Generate `sitemap.xml` covering all 213 URLs.
**Why:** Highest-ROI SEO move. Every fragrance becomes an indexable URL. "[fragrance name] notes" and "[fragrance name] similar" are real search queries.
**Effort:** M (~1 hr) · **Depends on:** `vercel.json` rewrite, existing `/api/compare` pattern.

---

#### TODO: Family & Brand Landing Pages
**What:** `/api/family` and `/api/brand` serverless routes. 9 family pages + 12 brand pages = 21 URLs. Content: description, fragrance count, top picks, links to individual fragrance pages. Same Vercel pattern.
**Why:** "Best woody fragrances" and "Byredo best sellers" are high-intent search queries.
**Effort:** S (~30 min) · **Depends on:** Fragrance pages template (shared pattern).

---

### Phase 4 — Monetization (after trust layer ships)

#### TODO: Sampling Partnership Infrastructure
**What:** Add `sampleUrl` field to fragrance JSON (manual curation). "Try a sample" link on detail pages — clearly labeled external. Candidate services: MicroPerfumes, DecantX, Luckyscent.
**Why:** Aligned incentives: $4 samples, not $300 bottles. No financial incentive to recommend one fragrance over another.
**Effort:** S-M (~30 min code, ongoing curation) · **Activate when:** Supabase events show >500 monthly quiz/compare sessions.

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

---

## QA Findings — 2026-03-24 (`add-fragrances` branch)

**Branch summary:** 7 new fragrances added. UI refactor for list items, sticky search, and universal search shortcuts. Full domain migration to `scentmap.vercel.app`.

### ~~BUG: `app.html` catalog search not moved~~
**Status: Fixed (2026-03-24).** `app.html` search layout synced with `app/index.html` (sticky `catalog-main-search`). **QA 2026-03-24:** confirmed.

### ~~OBSERVATION: `/` shortcut opens universal search, not `#cat-search`~~
**Status: Fixed (2026-03-24).** `/` now focuses `#cat-search` if the catalog panel is active, matching the intended behavior. **QA 2026-03-24:** confirmed.

### ~~OBSERVATION: `app.html` canonical URL uses `scentmap.co`~~
**Status: Fixed (2026-03-24).** All canonical and OG URLs migrated to `scentmap.vercel.app` across all files. **QA 2026-03-24:** confirmed.

### BUG: Quiz navigates away from results to compare URL
**What:** After completing `/quiz/best-perfume-for-men-2026/`, the app pushed history to `/compare/bal-dafrique/gypsy-water` — the previously-saved compare pair. The quiz results page was overwritten.
**Root cause:** App init reads the `sm_compares` localStorage and may auto-navigate on load, or the compare hash redirect fires on top of the quiz results.
**Impact:** Every quiz completion is at risk of being hijacked by a saved compare URL.
**Effort:** S (~20 min) · investigate init flow in `app.js` and quiz page JS.

---

## Already Shipped

- **Unified List Items & Sticky Search** — Base component handles all contexts; search moved to main header (2026-03-24, `add-fragrances` branch)
- **Production Domain Migration** — All 2,400+ URLs migrated to `scentmap.vercel.app` (2026-03-24, `add-fragrances` branch)
- **7 New Fragrances** — Comme des Garçons ×2, Hermès, L'Artisan Parfumeur, Lalique, Serge Lutens, Viktor&Rolf (2026-03-24, `add-fragrances` branch) · all data fields verified clean
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
