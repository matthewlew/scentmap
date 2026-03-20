# Scentmap — TODOs

Updated 2026-03-20. CEO scope reduction review completed 2026-03-20.

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

**Gate:** Do not start P2 until all 3 P1 items are shipped, QA-verified, and committed. These 4 items close loops in existing shipped features — they do not open new surface area.

### TODO: Brand Detail — Best Matches for Your Collection
**What:** Top 3 fragrances from a brand ranked by `scoreSimilarity()` against owned collection, shown in house detail sheet.
**Why:** Brand Discovery leads users into a house and drops them at an alphabetical list. This closes the discovery→action gap.
**Effort:** S (CC: ~30 min)
**Depends on:** `scoreSimilarity()`, house detail render path. Only show when ≥1 owned.

---

### TODO: Wardrobe Gap — Specific Fragrance Suggestions
**What:** 2-3 specific fragrance recs below the gap headline, ranked by gap coverage + collection similarity.
**Why:** "Browse Citrus & Green" dumps users in a 40-item list. Specific recs close the gap→decision loop.
**Effort:** S-M (CC: ~30 min)
**Depends on:** `computeWardrobeGap()`, `scoreSimilarity()`, `computeProfile()` — all exist.

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
