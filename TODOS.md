# Scentmap — TODOs

Updated 2026-03-20. CEO scope reduction reviewed 2026-03-20. List item consolidation design reviewed 2026-03-20 (eng review on branch `claude-proposal`).

**Product direction:** Help people discover fragrances that complete their wardrobe. That's it — not a game platform, not a social app, not a quiz factory.

**Scope rule:** No new features until P1 ships. No P2 work until P1 is QA-verified. Ideas go in the Ideas section, not here.

Read `DESIGN.md` and `CLAUDE.md` before starting any task.

---

## P1 — Ship Now (a11y obligations for shipped features)

### ~~TODO: Carousel Keyboard Navigation~~ ✅ Shipped 2026-03-20
`initCarouselKeyNav()` added. Carousel gets `role="list"` + `aria-label="Brand Discovery"`. Cards get `role="listitem"`. Roving tabindex + ArrowRight/Left keydown handler. QA verified: arrow keys move focus, tabindex updates correctly.

---

### ~~TODO: Gap CTA — Post-Navigation Screen Reader Announcement~~ ✅ Shipped 2026-03-20
`#cat-live` overridden after `buildCatalog()` with gap-specific message. QA verified.

---

### ~~TODO: Note Layer Badge Size Fix~~ ✅ Shipped 2026-03-20
`.note-layer-hint` changed from `9px` to `var(--fs-label)` + `padding: 0 var(--sp-xs)`. QA verified: 13.5px computed at mobile viewport.

---

## P2 — Next Cycle (only after P1 ships + QA passes)

**Gate:** Do not start P2 until all 3 P1 items are shipped, QA-verified, and committed. These 3 remaining items close loops in existing shipped features — they do not open new surface area.

### ~~TODO: Brand Detail — Best Matches for Your Collection~~ ✅ Shipped 2026-03-20
Top 3 fragrances from a brand ranked by `scoreSimilarity()` against owned collection, shown in house detail as "Similar From This House" section. Uses `.list-item--compact` + `.list-shelf` components. QA verified.

---

### TODO: Wardrobe Gap — Specific Fragrance Suggestions
**What:** 2-3 specific fragrance recs below the gap headline, ranked by gap coverage + collection similarity.
**Why:** "Browse Citrus & Green" dumps users in a 40-item list. Specific recs close the gap→decision loop.
**Effort:** S-M (CC: ~30 min)
**Depends on:** `computeWardrobeGap()`, `scoreSimilarity()`, `computeProfile()` — all exist.

**Design spec (design review 2026-03-20):**

*Presentation:* Horizontal carousel shelf with 2–3 `.carousel-card` suggestions (reusing Brand Discovery layout). Ranking: gap-fill priority (best matches for gap axis), then similarity to owned collection as tiebreaker. "Browse [family]" CTA moves below shelf as secondary fallback. Card hidden if <2 recs available.

*Cards:* Family color dot + name + brand + single-axis label ("Fresh", "Airy", "Bright" — no "recommendation" suffix). Clickable → open detail panel via `openFragDetail()`. No state badges (Owned/Wishlist).

*Interaction:* Mobile shelf scrolls with snap-to-edges, 44px min-height. Desktop: 3 cards visible, no scroll. Keyboard: tab through cards, focus ring via global `:focus-visible`. A11y: `role="list"` on shelf, each card has `aria-label="[Name] [Brand], [reason] recommendation"`.

*Components:* Reuse `.carousel-card` (Brand Discovery), new `.carousel-shelf` shared container class, `--fam-*` tokens for dots, all spacing/typography via semantic tokens (no hard-codes).

*Files:* `js/app.js` `renderWardrobeGap()` (~40 lines), `styles/components.css` `.carousel-shelf` + responsive scroll-snap, `CHANGELOG.md` Added section.

*Full spec:* `/Users/matthewlewair/.claude/plans/peppy-gathering-sketch.md` (all 7 design passes with rationale + QA checklist).

---

### TODO: Collection Context in Detail Panel
**What:** "Most similar in your collection: X (87%)" inline in fragrance detail.
**Why:** Eliminates manual Compare round-trips to see how a frag relates to what you own.
**Effort:** S (CC: ~20 min)
**Depends on:** `scoreSimilarity()`, `ST{}`.

---

### TODO: Quiz Result Persistence
**What:** Store quiz results in `sessionStorage`; back-navigation returns to results, not catalog.
**Why:** This is a UX bug, not a feature. Losing state on back-nav is broken behavior.
**Effort:** S (CC: ~20 min)
**Depends on:** Quiz routes (fixed 2026-03-19).

---

## Design System — Refactor Queue

These are structural refactors that reduce maintenance debt. They do not add features. Each is safe to pick up in a single session independent of P2.

**Gate:** Can be started any time after P1 ships. Does not block or depend on P2.

---

### TODO: List Item Component Consolidation

**What:** Migrate all list-item render sites in `app.js` and `components.css` from the legacy multi-variant system to the canonical Option B slot structure documented in `DESIGN.md`.

**Why:** The current system has 4 inconsistent variants (`--flat`, `--compact`, `--search`, base), a dead inner wrapper (`.list-item-content` left over from swipe-reveal era), a mixin anti-pattern (`.cmp-sug-card` applied alongside other classes), and typography violations where modifier classes override slot font-weight. Consolidating to one component means one block of CSS to maintain, one pattern to remember, and zero modifier conflicts.

**Effort:** M (human: ~1 day / CC: ~45 min)

**Design spec:** `playground.html` → `#list-item-proposals` section. Option B demo is the source of truth for the new structure.

**Class rename map:**

| Old class | New class | Action |
|---|---|---|
| `.list-item-content` | `.list-item-inner` | Rename in all JS template strings |
| `.list-item-name` | `.list-item-label` | Rename |
| `.list-item-sub` | `.list-item-sublabel` | Rename + change font to `--font-serif` |
| `.list-item-meta` | `.list-item-detail` | Rename + change font to `--font-serif` |
| `.list-item--flat` | `.list-item--ghost` | Rename variant |
| `.cmp-sug-card` | *(remove, absorbed into `--ghost`)* | Delete class from all JS |
| `.dc-sim-shelf` | `.list-shelf` | Rename container class |
| *(missing)* | `.list-item-leading` | Add new wrapper slot in JS template strings |

**Typography violations to fix (in `components.css`):**
- Remove `.list-item--search .list-item-name { font-weight: 500 }` — violates typography lock
- Remove `.list-item--wish .list-item-name { font-weight: 600 }` — violates typography lock
- Remove `.list-item--owned .list-item-name { font-weight: 700 }` — violates typography lock

**Migration strategy (CSS-first to avoid broken states):**
1. Add new slot CSS in `components.css` alongside old classes
2. Update `app.js` render calls one context at a time (catalog rows → compact rows → flat/ghost rows → search rows)
3. Remove old CSS classes once all render sites are updated
4. QA: screenshot all four row contexts before and after; verify keyboard nav and focus rings

**Render sites to update in `app.js` (~15–20 call sites):**
- `renderCatRow` — catalog list (base `.list-item`)
- `renderCompare` suggestion shelf — `.list-item--flat .cmp-sug-card` × 2 locations (~lines 1686, 1766, 3956)
- Gap CTA suggestion row — `.list-item--compact .cmp-sug-card` (~line 1100)
- Notes panel rows — `.list-item--compact` (~lines 1865, 1971, 2084, 2264, 2323)
- Universal search results — `.list-item--search` (~lines 3485+)
- `dc-sim-shelf` container — 3 instances (~lines 971, 984, 1678, 1761)

**Depends on:** `playground.html` Option B demo (done ✓), `DESIGN.md` slot contract (done ✓).

**QA verification checklist:**
- [ ] Catalog rows render with correct dot, label, sublabel, badge/score/state
- [ ] Compare suggestion shelf rows render with ghost surface (no border, rounded hover)
- [ ] Universal search modal rows render with correct height and aria-selected state
- [ ] Compact rows (notes, house detail) render correctly
- [ ] Keyboard focus ring visible on all row types (inset outline)
- [ ] Touch target ≥44px on all row types
- [ ] No typography violations: inspect `.list-item-label` in DevTools — must show `font-weight: 600` regardless of owned/wish state

---

## Already Shipped

- **Plain-Language Metric Labels** — shipped 2026-03-20 (`946ea91`)
- **Share Button on Compare** — `navigator.share()` + clipboard fallback
- **"More Like This" in Detail View** — 5 similarity-ranked suggestions
- **Olfactive DNA Card on You Tab** — profile bars, persona archetype, gap rec
- **Brand Discovery Panel** — carousel with personalized reasons
- **Wardrobe Gap Analysis** — sensory gap headline + family CTA

---

## Engagement Expansion — Identity, Play, and Social Layers

**CEO Review 2026-03-20 (Scope Expansion).** Full plan: `~/.gstack/projects/matthewlew-scentmap/ceo-plans/2026-03-20-engagement-expansion.md`

**The gap:** Scentmap's analytical tools are strong but the fun/identity/social layer is thin. Fragrance is an identity category — the app helps you *decide* but doesn't help you *identify*. Quizzes bring organic traffic but don't convert visitors into app users.

**Recommended build order:** Zodiac Quiz Integration → Scent Persona → Layering Lab

---

### TODO: Scent Persona — Identity Card + Shareable Profile

**What:** Generate a shareable identity card from the user's collection. "You're a Velvet Architect — drawn to structured woody compositions with hidden sweetness." Includes archetype badge, dominant/secondary personality axes, top 3 pillar fragrances, signature note, avg sillage, and "missing frontier" teaser from wardrobe gap data.

**Why:** Creates emotional investment in the collection, drives return visits (add a fragrance → persona evolves), and generates viral sharing. Natural growth loop: friend sees card → wants their own → marks fragrances → becomes a user.

**Effort:** M (human: ~3 days / CC: ~45 min)

**Reuses:** `computeProfile()` for 5-axis personality, role system for personality mapping, Olfactive DNA card UI pattern, wardrobe gap data.

**Archetype system:** 16 archetypes from dominant axis pairs (e.g., High warmth + high complexity → "Velvet Architect", High freshness + low complexity → "Clean Minimalist"). Requires ≥3 owned fragrances.

**Depends on:** Olfactive DNA card (shipped). Follow-up: canvas/OG share image.

---

### TODO: Layering Lab — Creative Fragrance Mixing Tool

**What:** Pick two fragrances → see compatibility %, combined profile radar overlay, merged note timeline (top→mid→base with time markers), and a "recipe card" with application instructions.

**Why:** No major fragrance site has a layering tool. Transforms Scentmap from reference tool to creative tool. Drives repeat engagement and produces shareable recipe cards.

**Effort:** M (human: ~3 days / CC: ~45 min)

**Reuses:** `scoreLayeringPair()` + `FAM_COMPAT` for compatibility, `computeProfile()` for combined radar, Compare dual-select UI, note pyramid data.

**Compatibility tiers:** Perfect Harmony (90-100%) → Complementary (70-89%) → Adventurous (50-69%) → Experimental (30-49%) → Clash (0-29%), each with specific application instructions.

**Depends on:** Compare infrastructure (shipped).

---

### TODO: Zodiac Quiz Integration — Quiz→App Bridge

**What:** Upgrade existing `/quiz/astro-scent` into a full zodiac-to-fragrance experience that bridges back into the main app. Pick your sign → personality reading → 3 matched fragrances → "Add to My Collection" button that seeds app state → "Explore in Catalog" opens main app pre-filtered.

**Why:** Bridges the biggest current gap: quiz pages bring organic traffic but visitors leave without becoming app users. The "Add to Collection" button is the missing link. Low-commitment entry for zero-owned users (zodiac sign requires no fragrance knowledge). Zodiac content has proven viral engagement.

**Effort:** M (human: ~3 days / CC: ~45 min)

**Reuses:** Existing `/quiz/astro-scent` page, quiz HTML/CSS, role system, `computeProfile()` axes.

**Zodiac → Family mapping:** Fire signs → Bold (Leather/Amber/Woody), Earth → Grounded (Woody/Green/Chypre), Air → Light (Citrus/Floral/Green), Water → Deep (Floral/Oud/Gourmand). Each sign gets 3 matched fragrances with zodiac-specific copy + fun stats.

**Key feature:** "Add to My Collection" button writes to `localStorage` (`sm_owned`/`sm_wish`), bridging quiz→app state.

**Depends on:** Quiz routing (fixed 2026-03-19). Follow-up: OG share image for results.

---

## Ideas Parking Lot

These are ideas, not commitments. They stay here until there's evidence they should be built.

- Carousel prev/next buttons (mouse users) — needs new CSS component
- Zero-owned onboarding prompt — needs design spec
- Smart Wishlist Priority ("next buy" toggle)
- Quiz-to-Compare Bridge
- Season Wardrobe ("your 4-fragrance year")
- Saved Comparisons (last 5 pairs)
- Blind Buy Oracle (confidence score)
- Compare keyboard shortcuts (X to swap, Backspace to clear)
- "Smells like..." evocative descriptions (needs copywriter)
- Fragrance gift/share card
- Shareable gap card
- "Surprise Me" Random Compare
- Collection milestones / gamification
- Note glossary tooltips (177 note descriptions)
- Mood/Vibe Quiz — image-based personality variant

### Killed (not coming back)

- **Dupe Finder** — strategic positioning unresolved after 3 review cycles. Killed 2026-03-20.
- **Dupe Lab Share Card** — depends on killed Dupe Finder
- **The Nose Knows (Daily Game)** — retention mechanic, massive scope, different product entirely
- **Daily A11y Pass for Nose Knows** — depends on killed game
- **Fragrance-level Retailer Links** — data work for 183 frags, unclear value
