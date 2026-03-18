# Scentmap — Design & Product TODOs

Tracked design debt, deferred features, and engineering notes from design reviews.
Each item includes enough context to be picked up cold.

---

## Scent DNA Card

### Analytics Events
**What:** Add event stubs for the DNA Card feature after it ships.
**Why:** Without this, there's no way to know if the feature gets used or which personas are most common.
**Pros:** Forward-compatible when analytics infrastructure is added. 30-minute task.
**Cons:** None — event stubs are zero-cost to add.
**Context:** The CEO review (2026-03-18) flagged the full app has no analytics events. DNA Card is the right moment to establish the pattern.
**Depends on:** DNA Card feature shipping.

Events to track:
- `dna_tab_viewed`
- `dna_persona_assigned { persona: string }`
- `dna_gap_cta_clicked { family: string }`
- `dna_share_url_clicked`
- `dna_share_image_downloaded`

---

## Dupe Lab

**What:** A "Find Dupes" entry point from the fragrance detail panel that runs `scoreSimilarity()` against all 183 fragrances and returns a ranked list with diff breakdowns.
**Why:** "What's a dupe for X?" is the #1 question on r/fragrance. The compare tool answers it but requires knowing the second scent. The Dupe Lab flips this.
**Pros:** High SEO value, directly serves r/fragrance use case, all algorithmic work already exists (`scoreSimilarity()`). Potential for shareable "I found a dupe" moments.
**Cons:** Rendering 183 similarity scores on click requires a debounce/worker strategy if performance is a concern (though 183 comparisons is fast in practice).
**Context:** Sketched in plan-design-review session 2026-03-18. Full design spec available: ranked list UI, diff breakdown panel, "Why this matches" math expansion, entry points from detail panel + landing page.
**Depends on:** Nothing. Additive to existing architecture.

Key design decisions (from sketch):
- Entry: "Find Dupes" button in fragrance detail panel
- Output: ranked list, top 5, each with note overlap bar + one-line diff
- "Why this matches" expander: shows the scoring breakdown (family pts + note pts + sillage pts)
- Shareable: "I ran Santal 33 through the Dupe Lab" TikTok/Reddit moment

---

## Astro Scent Quiz

**What:** A zodiac-mapped fragrance quiz at `/quiz/astro-scent`. Each sign gets a sensory profile target (Warmth/Complexity/Intensity targets), matched against the catalog via the existing profile engine. Result is a specific fragrance + shareable card.
**Why:** Astrology fragrance content gets massive engagement on TikTok and Pinterest. Scentmap's version is credible because it shows the math — not just "Scorpios should wear oud."
**Pros:** Viral/shareable, new SEO surface, fits existing quiz architecture, "See the math" link keeps it on-brand with PRINCIPLES.md Reddit Rule.
**Cons:** Requires defining sensory targets for all 12 signs (design/editorial work, ~2 hours). Risk of feeling gimmicky if copy isn't sharp.
**Context:** Sketched in plan-design-review session 2026-03-18. Full design spec: sign picker UI → optional depth (Sun/Rising/Moon+Venus) → result card with sensory profile + "See why" math expansion. Shareable as canvas PNG.
**Depends on:** Existing quiz infrastructure at `/quiz/`. Canvas share card (could share implementation with DNA Card share).

Zodiac → sensory target mapping defined in review (see session notes or re-derive from archetypes).
Entry points: landing page quiz card, `/quiz/astro-scent`, fragrance detail "Is this a ♏ Scorpio scent?" badge.

---

## Dupe Lab — Share Card

**What:** Canvas-rendered share image for Dupe Lab results. "I ran Santal 33 through the Dupe Lab — here's what Scentmap found." Downloadable PNG for Reddit, TikTok, Instagram.
**Why:** The Dupe Lab result is inherently shareable ("dupe for X" is one of the most viral fragrance formats on social media) but without a share card the moment evaporates.
**Pros:** Massive virality unlock. Low effort once DNA Card's canvas renderer exists — reuse the same infrastructure. Drives inbound traffic back to scentmap.co.
**Cons:** None after DNA Card ships. Before DNA Card, would require building the canvas share system from scratch.
**Context:** Decided in plan-eng-review scope expansion session 2026-03-18. DNA Card will establish the canvas share pattern (PNG rendering + URL share); Dupe Lab share card reuses it with a different layout: source frag name + top 3 matches + match scores.
**Depends on:** DNA Card share mechanism shipping first (canvas renderer + OG meta pattern).

---

## Layering Studio

**What:** A feature that takes two fragrances from your wardrobe and generates a layering compatibility score + guide. "Apply X first, wait 10 min, layer Y on pulse points — 84% compatibility."
**Why:** "How to layer fragrances" is a growing TikTok/Reddit trend. Scentmap already has `scoreLayeringPair()` implemented — this is mostly UI + editorial copy for layer ordering rules.
**Pros:** High novelty (nothing like it exists on any fragrance site). Inherently shareable ("my two fragrances score 84% — here's the guide"). Directly answers the 'how to layer' question in the scope expansion brief.
**Cons:** Requires writing layer-guide copy rules (family pair → ordering advice, ~20 pairs). Not as high SEO value as Dupe Lab. Best as a mobile-first sheet experience.
**Context:** New concept proposed in plan-eng-review scope expansion session 2026-03-18. Not in original roadmap. `scoreLayeringPair(a, b)` already exists in app.js (lines 371–383) — returns 0–75 compatibility score based on family affinity + sillage difference + unique note count.
**Depends on:** Nothing. Can be built independently after Dupe Lab ships.

Implementation starting point:
- Entry: "Layer with..." picker in fragrance detail panel (reuse `dc-cmp-ctas` pattern)
- Or: standalone "Layering Studio" tab/panel
- Core: `scoreLayeringPair(a, b)` → compatibility score already done
- New: `layeringGuide(a, b)` → rule-based text (which to apply first, timing, where)
- Share: "My layering combo" canvas card (after DNA Card share infrastructure exists)
