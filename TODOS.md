# Scentmap — TODOs

Updated 2026-03-19. All completed phases removed. Scope decisions from CEO review (2026-03-18) merged and prioritized against new product direction.

**New product direction (2026-03-19):** Beautiful scent discovery for completing your wardrobe, making smart choices before spending time on fragrance discovery, and surfacing new brands. Dupe features are under strategic review — risk of diluting the premium brand experience.

Read `DESIGN.md` and `CLAUDE.md` before starting any task.

---

## P1 — Next Shipping Cycle

These directly serve the new product direction: wardrobe completion and brand exposure. Design review complete (2026-03-19) — ready for eng review.

### ~~TODO: Brand Discovery Panel~~ ✅ Shipped 2026-03-20
**Design review:** Complete (2026-03-19) — ready for eng review
**What:** "Brands to Explore" section at the top of the All catalog tab. Surfaces brands the user has zero or few fragrances from, ranked by similarity to their owned collection. Each row includes a brand website link ("Shop →") so users can find where to buy.
**Why:** Core to the new direction ("surface new brands"). Currently the catalog only reflects what you search for. The "Shop →" link closes the loop from discovery to purchase.
**Location:** Section inside the "All" catalog tab, above the fragrance list. Hidden when 0 owned.
**Effort:** M (human: ~3 days / CC: ~45 min)
**Depends on:** `scoreSimilarity()`, `CAT[]`, `ST{}`, `gst(id)`, `pushSheet()`

**Algorithm:**
- For each brand not yet owned (or owned < 2 frags): brandScore = average `scoreSimilarity(ownedFrag, brandFrag)` across all brand frags
- Rank descending. Show top 6.
- Rationale copy: "Similar to [top owned frag by name] — [score]% match" — must name specific frag, never "based on preferences"

**Data change:** Add optional `website` field to per-brand JSON files in `data/scents/`. Rows without a URL silently omit the Shop link.

**Interaction states:**
- 0 owned → section hidden (no empty state clutter)
- 1–2 owned → section shows with "Add more to improve recommendations" note
- ≥3 owned → ranked list, max 6 rows
- All brands explored → "You've explored every brand in our catalog."

**Design system:**
- Rows: `.list-item` + `.list-item-name` / `.list-item-meta` / `.list-item-score` / `.list-item-trail`
- Card taxonomy: rows on `--bg-primary` → no border
- Touch targets: `min-height: var(--touch-target)` on all rows
- Shop link: `target="_blank" rel="noopener"`, `aria-label="Shop [Brand] — opens official website"`

**A11y:**
- `role="button"` + `tabindex="0"` + `aria-label="Explore [Brand] — [score]% match with your collection"` on each row
- `#cat-live` announces: "Showing 6 brands to explore based on your collection."
- Keyboard: Enter/Space opens brand detail; Tab reaches Shop link independently

**Responsive:**
- Desktop (≥1100px): Compact section in catalog panel (~360px), max 6 rows
- Mobile (<768px): Same section; brand row tap → `pushSheet(renderBrandDetail)`
- Tablet: Same as desktop

**New functions needed:** `renderBrandDiscovery()`, `renderBrandDetail(brand)`
**Wire into:** `buildCatalog()` All-tab render path

---

### ~~TODO: Wardrobe Gap Analysis~~ ✅ Shipped 2026-03-20
**Design review:** Complete (2026-03-19) — ready for eng review
**What:** Compact block at the top of the Owned tab. Reads the user's collection via `computeProfile()` and generates a sensory-language insight: "Your wardrobe leans warm and resinous. You're missing a light, airy contrast." Includes a CTA to browse the gap family in the catalog.
**Why:** Turns passive collection ownership into a purposeful next-buy decision. Directly expresses "completing your wardrobe."
**Location:** Section at the top of the "Owned" catalog tab, above the owned fragrance list. Hidden when 0 owned.
**Effort:** M (human: ~2 days / CC: ~30 min)
**Depends on:** `computeProfile()`, `gst(id)`, `go()`, `#cat-search`

**Algorithm (`computeWardrobeGap`):**
- Aggregate `computeProfile()` across all frags where `gst(id) === 'owned'`
- Identify lowest axis among [freshness, sweetness, warmth, intensity, complexity]
- `freshness < 3` → "light + airy contrast" → CTA: Browse Citrus, Green
- `sweetness < 3` → "sweetness" → CTA: Browse Gourmand, Floral
- `warmth < 3` → "warmth and depth" → CTA: Browse Amber, Woody, Oud
- `complexity < 4` → "complexity" → CTA: Browse Chypre, Leather
- `intensity < 3` → "presence and projection" → CTA: Browse high-sillage frags
- No axis below threshold → "complete" state
- Headline template: "Your wardrobe leans [top 2 dominant axes]. You're missing [gap language]."

**Gap CTA:** `go('catalog')` + pre-fill `#cat-search` with gap family name

**Interaction states:**
- 0 owned → section hidden
- 1 owned → shows with "Based on 1 fragrance — add more to refine" disclaimer
- Gap found → headline + CTA
- No gap ("complete") → "Your collection covers all the major sensory dimensions. [Top axis] is your signature." (no CTA)

**Design system:**
- Container: `.dna-card` gap callout pattern — `--bg-secondary` on `--bg-primary`, `--radius-lg`, `var(--sp-lg)` padding, no border
- Headline: `.dna-headline` — `--font-serif`, `--fs-title`, `--text-primary`
- Description: `.dna-sub` — `--font-sans`, `--fs-body`, `--text-secondary`
- CTA: existing button style — `--accent-primary`, `min-height: var(--touch-target)`

**A11y:**
- `#cat-live` announces "Your wardrobe gap updated." when collection changes
- CTA: `<button>`, `aria-label="Browse [gap family] fragrances to fill your collection gap"`
- Complete state: `#cat-live` announces "Your collection covers all sensory dimensions."

**Responsive:**
- Desktop + Mobile: Compact block (~90px), same layout both viewports
- No separate sheet needed — CTA navigates to existing All tab

**New functions needed:** `computeWardrobeGap()`, `renderWardrobeGap()`
**Wire into:** Owned-tab render path in `buildCatalog()`

---

## P2 — Next-Next Cycle

Valuable features from CEO review scope decisions and existing roadmap. Build after P1 has usage data.

### TODO: Blind Buy Oracle
**What:** Personalized "should I blind buy this?" confidence score based on similarity to owned fragrances, family overlap, and role coverage.
**Why:** Directly addresses "making smart choices when spending time discovering fragrances." Reduces buyer anxiety.
**Effort:** M (human: ~3 days / CC: ~45 min)
**Depends on:** `scoreSimilarity()`, `computeProfile()`, collection depth — best after wardrobe gap analysis ships

### TODO: Collection Context in Detail Panel
**What:** "Most similar in your collection: X (87%)" shown inline on the fragrance detail panel, plus a one-line gap note ("Adds a fresh top you don't own yet").
**Why:** Makes every detail view actionable — users see immediately how a new fragrance fits their wardrobe.
**Effort:** S (human: ~1 day / CC: ~20 min)
**Depends on:** `scoreSimilarity()`, `ST{}`

### TODO: Dupe Finder ⚠️ Strategic Question Unresolved
**What:** "Find alternatives to X" — ranked similarity list using `scoreSimilarity()` with filters (same family, different brand, price tier).
**Why:** SEO goldmine for "alternatives to Santal 33" queries. High demand signal from users.
**Strategic risk:** May dilute the premium brand experience. Needs a positioning decision before building — frame as "inspired by" not "cheaper than."
**Effort:** M (human: ~2 days / CC: ~30 min)
**Depends on:** `scoreSimilarity()` (already exists)

### TODO: Layering Lab
**What:** Pick two fragrances → compatibility %, combined profile radar, merged note timeline, recipe card with application instructions.
**Why:** Transforms Scentmap from reference tool to creative tool. Highly shareable.
**Effort:** M (human: ~3 days / CC: ~45 min)
**Depends on:** `scoreLayeringPair()`, `computeProfile()`, `FAM_COMPAT` (all exist)

### TODO: Smart Wishlist Priority
**What:** "Next buy" vs "someday" toggle on wishlist items, with a "ready to buy?" prompt that resurfaces top-priority items.
**Why:** Complements wardrobe gap analysis — makes the wishlist actionable rather than a passive list.
**Effort:** S (human: ~1 day / CC: ~20 min)
**Depends on:** `ST{}`, `sm_wish` localStorage

### TODO: Scent DNA Profile Page
**What:** Persistent identity page: "Your scent DNA is 60% Woody, 25% Amber, 15% Citrus" with owned collection stats, top roles, and signature note cloud.
**Why:** Identity layer that makes users feel invested. Shareable. Drives return visits.
**Effort:** L (human: ~1 week / CC: ~1 hr)
**Depends on:** Collection depth, `computeProfile()`. Best after Wardrobe Gap ships and has data.

### TODO: Season Wardrobe
**What:** "Your 4-fragrance year" — maps owned fragrances to seasons using warmth/freshness scores, surfaces what to reach for today.
**Why:** Natural extension of the "completing your wardrobe" direction. Roles system (Summer/Winter) already provides the substrate.
**Effort:** S (human: ~1 day / CC: ~20 min)
**Depends on:** `computeProfile()`, roles data

### TODO: Quiz-to-Compare Bridge
**What:** "Compare your top 2" button after quiz results pre-fills the Compare panel with the top two quiz matches.
**Why:** Short path from discovery (quiz) to decision (compare). Logical next action after quiz completes.
**Effort:** S (human: ~4 hours / CC: ~15 min)
**Depends on:** Quiz routes working (fixed 2026-03-19)

### TODO: The Nose Knows (Daily Game)
**What:** Daily fragrance trivia game (Wordle-style). "Guess the fragrance from 3 note clues."
**Why:** Retention mechanic. No collection depth required — works for new users.
**Effort:** L (human: ~1 week / CC: ~1 hr)
**Depends on:** Nothing. Self-contained.

---

## P3 — Backlog (revisit with usage data)

One-line summaries. Full specs written when promoted to active work.

- **Zodiac Scent Quiz** — Zodiac-to-family mapping quiz. Shareable result page. High viral potential, low depth. (CEO plan: SKETCHED — M effort)
- **Shareable Result Cards** — Canvas/OG image generation for quiz results and DNA card. Engagement multiplier. Depends on Scent DNA Profile. (CEO plan: DEFERRED)
- **Mood/Vibe Quiz** — Image-based personality quiz variant of the zodiac quiz. (CEO plan: DEFERRED)
- **"Surprise Me" Random Compare** — Random pair button on Compare page. 30-min implementation. (CEO plan: DEFERRED)
- **Saved Comparisons** — Persist last 5 comparison pairs in localStorage, show as "Recent" chips. Persona: Miguel.
- **Compare Keyboard Shortcuts** — `X` to swap fragrances, `Backspace` to clear slot. Persona: Nadia.
- **"Smells like..." Descriptions** — 1-sentence evocative descriptions for all 183 entries. Needs copywriting.
- **Dupe Lab Share Card** — Canvas share image for dupe results. Depends on Dupe Finder shipping.
- **Fragrance Gift/Share Card** — Single-fragrance shareable summary. Simpler than DNA Card. Persona: Sarah (gift giver).
- **Daily A11y Pass (Nose Knows)** — Focus management, keyboard-only playability. Blocks shipping to Nadia persona.

---

## Strategic Questions (unresolved — needs decision before building)

1. **Dupe positioning:** Frame as "inspired by" (premium) or "cheaper alternatives" (mass)? The answer changes the entire UI tone and SEO strategy.
