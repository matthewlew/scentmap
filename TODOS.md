# Scentmap — TODOs

Updated 2026-03-28.

**Product direction:** Help people discover fragrances that complete their wardrobe.

**Scope rule:** No new features until P2 ships. Ideas go in the Ideas section, not here.

Read `DESIGN.md` and `CLAUDE.md` before starting any task.

---

## Bugs — Fix Before Shipping (found by /qa 2026-03-28)

### [DONE] BUG [CRITICAL]: Static compare pages show empty results
**Fixed:** Updated all 5 `compare/*/index.html` files to the new 3-rail layout (2026-04-02).

---

### BUG [MEDIUM]: Quiz result persistence not working in standalone quiz pages
**What:** Completing a quiz at `/quiz/*/` does not save results to `sessionStorage`. Back-navigating from results returns to quiz start instead of results. All standalone quizzes show the same 5 hardcoded questions from `renderGlobalQuiz` instead of their quiz-config.json questions (scent-archetype, astro-scent, best-perfume-* all show "What are we looking for today?").
**Why:** `renderStandaloneQuiz()` routes all non-Byredo quizzes to `renderGlobalQuiz()` which: (1) doesn't save sessionStorage, (2) ignores quiz-config.json questions, (3) doesn't update URL with `?results=...`. `quiz.js` (which has the full persistence + archetype implementation) is never imported by `app.js` or loaded by quiz pages.
**Fix:** Import `quiz.js` in `app.js` and update `renderStandaloneQuiz` to route archetype/astro/standard quiz slugs to `renderQuiz(container, config, catalog)` from `quiz.js`.
**Effort:** S (~25 min)

---

### BUG [MEDIUM]: CHANGELOG.md 404 on every page load + missing from sync script
**What:** `app.js` fetches `/CHANGELOG.md` on init but it's not in the CLAUDE.md sync script. Also `app.html` is not in the sync script (copy it manually or changelog panel won't show and new compare layout won't be visible in dev).
**Fix:** Add to CLAUDE.md sync: `cp .../CHANGELOG.md /tmp/scentmap-copy/CHANGELOG.md` and `cp .../app.html /tmp/scentmap-copy/app.html`
**Effort:** XS (~2 min)

---

### BUG [MEDIUM]: URL double-hash on compare slot card click
**What:** After popular pair auto-loads (URL = `/compare/X/Y`), clicking a slot card to change the fragrance results in URL `/compare/X/Y#compare/X/Y`.
**Why:** `handleInitialNavigation` is being triggered by the hashchange event or by slot card interaction, appending the compare hash on top of an already-path-based URL.
**Fix:** Investigate and remove duplicate hash append in compare slot click handler.
**Effort:** XS (~10 min)

---

## P2 — Active (ship in order)

### [DONE] Golden Pairs Carousel — Keyboard Nav
**What:** Call `initCarouselKeyNav()` on the `pairWrap` element after `pairSec` is built (~line 1252). Apply `role="list"`, `aria-label`, and roving tabindex — same pattern as Brand Discovery carousel.
**Why:** A11y obligation — `initCarouselKeyNav()` was never called on Golden Pairs at render time.
**Effort:** XS (~10 min)

---

### [DONE] Quiz Result Persistence
**What:** Store quiz results in `sessionStorage` key `sm_quiz_session`; back-navigation returns to results, not catalog.
**Schema:** `{quizId: string, timestamp: number, answers: string[], results: string[]}`.
**Why:** UX bug — losing state on back-nav from detail breaks every gift-giver and casual-shopper session.
**Effort:** S (~20 min) · **Depends on:** Quiz routes.

---

### [DONE] DNA Card Profile Bars — ARIA
**What:** Replace visual-only profile bars on the DNA Card with `<meter>` elements (`min="0"` `max="100"` `value="{n}"` `aria-label="Freshness: {n}%"`).
**Why:** Screen readers skip the current bars entirely — a11y obligation for a shipped feature.
**Effort:** XS (~10 min) · **Depends on:** DNA card markup in `app.js`.

---

### [DONE] Carousel Focus Restoration After Detail Close
**What:** Push `document.activeElement` when a carousel card triggers `openDesktopDetail()` or a mobile sheet. Pop + restore focus on close. Use a focus stack (`_focusStack = []`) to handle nested carousels.
**Why:** Keyboard focus jumps to page top after detail close — breaks Nadia's flow every session.
**Effort:** XS (~15 min) · **Depends on:** `openDesktopDetail()`, `closeDesktopDetail()`, sheet stack.

---

### [DONE] State Bar Collection Count Text
**What:** Add "N items" text beside the active state tab (Owned/Wishlist) in the catalog filter bar.
**Why:** Users want to know collection size without scanning the list.
**Effort:** XS (~10 min) · **Depends on:** `CAT_STATE_FILTER`, owned/wish counts from `ST{}`.

---

### [DONE] Brand Card Hover Affordance
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


### TODO: Design System Anti-Pattern Cleanup
**What:** Audit documented in `playground.html`. Remove ~120 lines of 1-off CSS and migrate ~20 render sites in `app.js` to canonical components. Key changes:
- `dc-sim-*` family → `.list-item` slot structure (4 classes removed)
- `cmp-sug-*` family → `.list-item` + `.list-item-trailing-label` (3 classes removed)
- `cat-empty-clear` → `.btn.btn--secondary` (delete 20-line duplicate)
- 5 `.sec-label` duplicates (`.dc-roles-lbl`, `.picker-sec-lbl`, `.frag-sb-label`, `.cmp-stat-label`, `.dc-eyebrow`) → `.sec-label`
- `picker-row` system → `.list-item` slot structure (~50 lines removed)
- `cmp-edu-card` / `cmp-edu-quad` → `.card` / `.card--secondary`
- `brand-n` / `brand-c` → `.text-ui-strong` / `.text-meta`
- `dc-div` / `dc-desc` / `dc-roles-lbl` → remove/replace with semantics
- Add 1 new utility: `.section-top-rule` (border-top divider pattern used 6× inline)
- **New (2026-03-29):** `.house-detail-name/.house-detail-count` → `.dc-name/.dc-brand` (exact duplicate, delete both CSS classes, update 2 render sites)
- **New (2026-03-29):** `.us-section-hdr` → `.sec-label` + padding inline style (delete class, update 4 render sites in search modal)
- **New (2026-03-29):** `.dc-notes-caveat` → `.text-caption` (delete class, update 1 render site)
- **New (2026-03-29):** `.cmp-edu-wrap border-radius: 16px` → `var(--radius-xl)` (1-line fix)
- **New (2026-03-29):** `.brand-count-chip margin-left: 3px` → `var(--sp-micro)` or remove
- **New (2026-03-29):** `.frag-picker-wrap` + `.note-popup` hardcoded box-shadow → `var(--shadow-lg)`
- **New (2026-03-29):** All `.dot` render sites: `style="background:${color}"` → `style="--fam-bg:${color}"` (~15 sites)
- **New (2026-03-29):** Note location inline styles (app.js:1011,1041) → add `.text-label--accent` utility to design-system.css
- **New (2026-03-29):** `style="font-size: 64px"` compare score → add `.text-display` utility + `--fs-display` token
**Why:** ~9 parallel or duplicate component definitions; violates pre-PR checklist (inline styles for appearance, non-system classes). Full audit with before/after demos in `playground.html`.
**Effort:** M (~75 min) · **Depends on:** Read `playground.html` before starting.

---

### TODO: List Item Component Consolidation
**What:** Migrate all list-item render sites from legacy multi-variant system to canonical slot structure in `DESIGN.md` Option B. Class rename map and ~15–20 render sites documented in previous version of this file (git history: before 2026-03-21 simplification commit).
**Why:** 4 inconsistent variants, dead inner wrapper, mixin anti-pattern, typography violations.
**Effort:** M (~45 min) · **Depends on:** `designsystem.html` Option B demo. **Note:** Overlaps with Anti-Pattern Cleanup above — consider doing both in one pass.

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

#### TODO: Occasion-Based Gift Quiz Filtering
**What:** Add Season/Occasion filter questions to gift quiz flow. "Is this for day or evening wear?" → filters toward sillage range. "What season?" → filters toward family. Derived from `getBestFor()` chip logic (shipped 2026-04-02).
**Why:** Closes the loop from Best For chips to quiz decisioning. Gifters get contextually relevant results without knowing fragrance vocabulary.
**Effort:** M · **Depends on:** Gift quiz shipping + Best For chips (shipped)

---

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

## Design System — Won't Fix (Documented)

Items reviewed during design system audit (2026-03-28). Not migrating because:

| Class | Why Not Migrating |
|---|---|
| `.gap-cta` | Accent-colored (`--accent-primary` / resin) CTA. Distinct from `.btn--primary` (ink). Migration requires new `.btn--accent` variant — new component, out of scope. |
| `.picker-sec-lbl` | Section headers inside picker panel. Uses `--fs-meta` (14px) vs `.sec-label`'s `--fs-label` (12px) + picker-specific padding (`0 sp-xl sp-sm`). Visual regression to swap. |
| `.frag-sb-label` | Sidebar section label. Same semantics as `.sec-label` but in sidebar layout context with different padding. Requires HTML changes to migrate. |
| `.dc-stat` / `.dc-stats` | Fragrance detail stat grid (pre `.stat-card`). Different layout (2-col) and padding from `.stat-card`. Used in `openFragDetail` render. |

---

### TODO: Compare — `getCompareNarrative()` short-form for Best Pairings
**What:** `getCompareNarrative(fa, fb)` generates 2–3 sentences. Best Pairings currently uses `split('. ')[0]` to get the first sentence. Refactor `getCompareNarrative` to also expose a dedicated 1-sentence path: prioritize the decision-closer (sillage/choose-between sentence) which is the most useful for layering decisions.
**Why:** The full narrative's structure (freshness → warmth → sillage) means the first sentence is sometimes a character description, not the gifter-facing decision summary. P2 polish.
**Effort:** S (~20 min) · **Depends on:** `getCompareNarrative()` in `app.js`, `renderBestPairings()`.

---

### TODO: Compare — Mini-radar hover/focus tooltip for axis labels
**What:** The 80×80 mini-radar shows shape only (no axis labels). The `aria-label` on the SVG provides values for screen readers. Add a CSS `title` tooltip or JS popover showing axis names+values on hover/focus for sighted users with low vision.
**Why:** Closes the accessibility gap for low-vision sighted users (Nadia persona) who can read the shape but want label confirmation. P2 polish.
**Effort:** S (~20 min) · **Depends on:** `_drawMiniRadarSvg()` in `app.js`, `.cmp-m-mini-radar` CSS.

---

### TODO: Compare — `_simCache` memoization review
**What:** `_simCache` is wired up in `scoreSimilarity()` keyed by `id1:id2`. Verify it correctly prevents duplicate computation across the `C(n,2)` pairwise calls in `renderBestPairings()` and any other callers. Add a dev-mode counter to measure hit rate during a 5-frag compare session.
**Why:** Performance hygiene — ensures the cache is actually working and not silently bypassed. P2 verification.
**Effort:** XS (~10 min) · **Depends on:** `scoreSimilarity()`, `_simCache` in `app.js`.

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
