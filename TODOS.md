# Scentmap — TODOs

Updated 2026-03-20. Eng review completed 2026-03-20 against current HEAD (`79b9cca`).

**Product direction:** Beautiful scent discovery for completing your wardrobe, making smart choices before spending time on fragrance discovery, and surfacing new brands. Dupe features are under strategic review — risk of diluting the premium brand experience.

Read `DESIGN.md` and `CLAUDE.md` before starting any task.

---

## Engineering Review — 2026-03-20

### Status of designer-sketched features

The design review (2026-03-20) wrote sketches for 5 features believed to be unbuilt. **Code audit found 3 of 5 are already shipped:**

| Feature | Status | Evidence |
|---------|--------|----------|
| Share Button on Compare | **Already shipped** | `app.js:4370` renders `#cmp-share-btn` with `.dc-collect-btn`; line 4385 wires `navigator.share` + clipboard fallback |
| "If You Like X" Similarity Recs | **Already shipped** | `app.js:1608-1645` — "More like this" section, 5 `.list-item--flat` buttons with family dots, `pushDetail()` on click |
| Collection Stats Mini-Card | **Already shipped (richer)** | `app.js:1012-1050` — Olfactive DNA card with profile bars, persona archetype (≥3 owned), gap recommendation. Exceeds designer's simpler 3-stat spec |
| Plain-Language Metric Labels | **Not shipped** | `app.js:1507-1508` still renders single-word `SW[]`/`LW[]` labels. `SWD[]`/`LWD[]` arrays don't exist |
| Carousel Keyboard Nav + Buttons | **Not shipped** | No keyboard handler on `.carousel`. Nav buttons require new `.carousel-nav-btn` CSS class |

**XS items audit:**
- Gap CTA SR announcement — **valid, ship it**
- "You Might Also Like" label fix — **MOOT**: current label is "Swap suggestions" (line 3916), not "You might also like"
- Note layer badge size — **valid**: `.note-layer-hint` is 9px (components.css:1515), needs bump to `--fs-label`

### Eng pushback on designer

1. **3 stale sketches.** Share Button, Similarity Recs, and Collection Stats all shipped before the design review was written. Designer should audit `app.js` before writing specs.
2. **Carousel nav buttons require a new component** (`.carousel-nav-btn` + `.carousel-wrap`) — this violates the absolute "no new components" constraint. **Decision: ship keyboard nav only (JS-only, no new CSS). Defer prev/next buttons to P2** when the component constraint is relaxed and the buttons can be designed + documented properly.
3. **"You Might Also Like" label XS** is a ghost bug — the label was changed to "Swap suggestions" (similarity-based, factual) before the design review was written.

### P1 feature assignments

**P1 — Feature A: Plain-Language Metric Labels**
**P1 — Feature B: Carousel Keyboard Navigation (keyboard-only, buttons deferred)**

Both are self-contained, use zero new components, and can be built in parallel by different engineers.

---

## P1 — Feature A: Plain-Language Metric Labels

**What:** Add behavioral description lines below the sillage and structure (layering) score bars in `renderFragDetail()`.

**Why:** Sarah (gift giver) and Jake (new shopper) have no frame of reference for "Sillage: 7/10 — Strong". A sentence like "Confident presence — fills a small room" gives them a lived-experience anchor.

**Effort:** S (CC: ~15 min)

**Depends on:** `SW[]`, `LW[]` arrays at `app.js:10-11`. No new infrastructure.

**Implementation steps:**

1. **Add data arrays** — after `SW`/`LW` at `app.js:11`, add `SWD[]` and `LWD[]` (11 entries each, index 0 unused):

```js
const SWD = [
  '',
  'Barely detectable — skin-close only',
  'Barely detectable — skin-close only',
  'Soft presence — close contact only',
  'Soft presence — close contact only',
  'Moderate projection — noticeable arm\'s length away',
  'Moderate projection — noticeable arm\'s length away',
  'Confident presence — fills a small room',
  'Confident presence — fills a small room',
  'Enveloping — noticeable on entry from across the room',
  'Statement sillage — announces arrival, lingers after'
];
const LWD = [
  '',
  'Single-note — what you spray is what you get',
  'Single-note — what you spray is what you get',
  'Simple arc — opens and settles, little evolution',
  'Simple arc — opens and settles, little evolution',
  'Balanced journey — distinct opening, heart, and dry down',
  'Balanced journey — distinct opening, heart, and dry down',
  'Layered — opening and base feel like different fragrances',
  'Layered — opening and base feel like different fragrances',
  'Complex — notable evolution across all three stages',
  'Deep transformation — hours of evolving character'
];
```

2. **Edit `renderFragDetail()` at line 1507** — add `.list-item-meta` line after each `dc-sval`:

Current (line 1507):
```html
<div class="dc-stat"><div class="sec-label">Sillage</div><div class="dc-bar"><div class="dc-fill" style="width:${frag.sillage*10}%"></div></div><div class="dc-sval">${frag.sillage}/10 — ${SW[frag.sillage]}</div></div>
```

Replace with:
```html
<div class="dc-stat"><div class="sec-label">Sillage</div><div class="dc-bar"><div class="dc-fill" style="width:${frag.sillage*10}%"></div></div><div class="dc-sval">${frag.sillage}/10 — ${SW[frag.sillage]}</div><div class="list-item-meta">${SWD[frag.sillage]}</div></div>
```

Apply same pattern to line 1508 (Structure/layering) using `LWD[frag.layering]`.

**Components used:** `.list-item-meta` (existing — `--fs-meta`, `--text-tertiary`). No new classes.

**Token compliance:** All tokens from design system. No inline styles added.

**Status: SHIPPED (2026-03-20)**

**QA Tests:**
- [ ] Open any fragrance detail (e.g. Gypsy Water). Confirm a description line appears below the score value for both Sillage and Structure (e.g. "Soft presence — close contact only" / "Balanced journey — distinct opening, heart, and dry down").
- [ ] Open a fragrance with sillage 9 or 10. Confirm "Enveloping — noticeable on entry from across the room" or "Statement sillage — announces arrival, lingers after" appears.
- [ ] Open a fragrance with layering 9 or 10. Confirm "Complex — notable evolution across all three stages" or "Deep transformation — hours of evolving character" appears.
- [ ] Resize to mobile (<768px). Confirm description text wraps cleanly without overflow.
- [ ] Inspect `.dc-stat .list-item-meta` — confirm computed color is `--text-tertiary` (muted, lighter than `dc-sval`).

---

## P1 — Feature B: Carousel Keyboard Navigation (Keyboard-Only)

**What:** Add arrow-key navigation (roving tabindex) + ARIA roles to the Brand Discovery carousel. No prev/next buttons in this cycle.

**Why:** Nadia (keyboard-first, low vision) must Tab through all 6+ brand cards sequentially. Arrow keys are the expected ARIA carousel pattern. Shipping keyboard nav alone is zero-CSS, JS-only.

**Effort:** S (CC: ~15 min)

**Depends on:** `.carousel` + `.carousel-card--brand` already shipped. `renderBrandDiscovery()` in `app.js`.

**Scope cut (eng pushback):** The designer spec includes prev/next chevron buttons requiring new `.carousel-nav-btn` CSS class + `.carousel-wrap` wrapper. This is a **new component** — deferred to P2 per the "no new components" constraint. Keyboard nav alone closes Nadia's a11y gap without new CSS.

**Implementation steps:**

1. **Add ARIA roles** — in `renderBrandDiscovery()`, after carousel element is created:
   - Set `role="list"` and `aria-label="Brand Discovery"` on the `.carousel` element
   - Set `role="listitem"` on each `.carousel-card--brand`

2. **Add roving tabindex** — after cards are appended to carousel:
```js
function initCarouselKeyNav(carouselEl) {
  const cards = Array.from(carouselEl.querySelectorAll('.carousel-card'));
  if (!cards.length) return;

  // Roving tabindex: first card tabbable, rest removed from tab order
  cards.forEach((c, i) => c.setAttribute('tabindex', i === 0 ? '0' : '-1'));

  carouselEl.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const current = carouselEl.querySelector('[tabindex="0"]');
    const idx = cards.indexOf(current);
    let next = -1;
    if (e.key === 'ArrowRight') next = Math.min(idx + 1, cards.length - 1);
    if (e.key === 'ArrowLeft') next = Math.max(idx - 1, 0);
    if (next === -1 || next === idx) return;
    e.preventDefault();
    cards[idx].setAttribute('tabindex', '-1');
    cards[next].setAttribute('tabindex', '0');
    cards[next].focus();
    cards[next].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
}
```

3. **Wire up** — call `initCarouselKeyNav(carouselEl)` after the carousel is populated in `renderBrandDiscovery()`.

**Components used:** None new. All changes are JS + ARIA attributes on existing elements.

**A11y:** Roving tabindex is the WAI-ARIA carousel pattern. Screen readers announce "list, N items" on focus. Arrow keys move between cards. `scrollIntoView` keeps focused card visible.

**Test:** Tab to the carousel. Press ArrowRight — focus moves to next card, card scrolls into view. ArrowLeft moves back. Verify VoiceOver announces card content on focus. Verify Tab exits the carousel normally (doesn't trap).

---

## P1 — XS Fixes (ship when convenient)

### TODO: Gap CTA — Post-Navigation Screen Reader Announcement
**What:** After the Wardrobe Gap CTA fires (switching to All tab + pre-filling search), announce the new context via `#cat-live`.
**Why:** Nadia activates the CTA and the tab switches silently — disorientation for keyboard-first users.
**Effort:** XS (CC: ~5 min)
**Fix location:** `renderWardrobeGap()` at `app.js:665-680`. After `buildCatalog()` on line 679, the `#cat-live` region gets the generic count from `buildCatalog`. Override it immediately after:
```js
buildCatalog();
// Override generic count with gap-specific announcement
const liveEl = document.getElementById('cat-live');
if (liveEl) liveEl.textContent = `Now showing All fragrances — results for ${gap.ctaFamilies.join(' and ')}`;
```
**Note:** `buildCatalog()` sets `#cat-live` to the result count. The override must come after `buildCatalog()` returns, on the same tick (no `setTimeout` needed since `buildCatalog` is synchronous).

---

### TODO: Note Layer Badge Size Fix
**What:** Increase `.note-layer-hint` font size from 9px to `--fs-label` (12px).
**Why:** 9px fails WCAG AA for Miguel (essential tremor, low vision). The designer's spec says minimum `--fs-label` with `var(--sp-xs)` horizontal padding.
**Effort:** XS (CC: ~5 min)
**Fix location:** `styles/components.css:1515`. Change `font-size: 9px` to `font-size: var(--fs-label)`. Optionally add `padding: 0 var(--sp-xs)` for readability.

---

### ~~TODO: 'You Might Also Like' Label Fix~~ — MOOT
**Reason:** Current label is "Swap suggestions" (`app.js:3916`), not "You might also like". The designer's spec references a label that doesn't exist in the codebase. No action needed.

---

## Already Shipped (removed from active work)

### ~~TODO: Share Button on Compare Results~~ ✅ Shipped
`renderCompareResults()` at `app.js:4370` renders "Share Comparison" button. Line 4385 wires `navigator.share()` with clipboard fallback. Uses `.dc-collect-btn` per design spec.

### ~~TODO: "If You Like X" Recommendations in Detail View~~ ✅ Shipped
`renderFragDetail()` at `app.js:1608-1645` shows "More like this" section with 5 `.list-item--flat` buttons. Each shows name, brand, family dot. Tappable → `pushDetail()`. Note: label is "More like this" (not designer's "Fragrances like this") and shows 5 items (not 3).

### ~~TODO: Collection Stats Mini-Card on 'You' Tab~~ ✅ Shipped (richer than spec)
`app.js:1012-1050` — Olfactive DNA card with: 4 profile bars (Fresh/Sweet/Warm/Bold), signature note, avg sillage, olfactive persona (≥3 owned), gap recommendation. This exceeds the designer's simpler 3-stat (owned/family/note) spec.

### ~~TODO: Brand Discovery Panel~~ ✅ Shipped 2026-03-20

### ~~TODO: Wardrobe Gap Analysis~~ ✅ Shipped 2026-03-20

---

## P2 — Next-Next Cycle

**Focus:** Discovery depth. Features that need designer spec, new components, or depend on P1 items completing. Build after P1 ships and has usage data.

### TODO: Carousel Prev/Next Buttons (deferred from P1)
**What:** Prev/next chevron buttons flanking the Brand Discovery carousel for mouse/tremor users (Miguel).
**Why:** Miguel (essential tremor) finds horizontal scroll unreliable with a trackball. Arrow key nav (P1 Feature B) helps keyboard users but not mouse-only users.
**Effort:** S (CC: ~20 min)
**Blocked by:** Requires new `.carousel-nav-btn` CSS component + `.carousel-wrap` wrapper element. Must be designed, documented in DESIGN.md Component Inventory, and added to playground.html before shipping.
**Design notes from designer sketch (carry forward):**
- Desktop ≥768px only (hide on mobile — swipe is native)
- 44px × 44px circular ghost buttons (`--radius-circle`, `--border-standard`)
- `visibility: hidden` (not `display: none`) at boundary + `aria-disabled="true"`
- Chevron SVG icons, not emoji or text characters

---

### TODO: Brand Detail 'Best Matches for Your Collection'
**What:** When a user opens a brand's detail sheet from Brand Discovery, show a "Best matches for you" section at the top: the 3 fragrances from that brand with the highest `scoreSimilarity()` against the user's collection, ranked.
**Why:** Emma taps a brand card from Discovery and gets an alphabetical list. The discovery leads her in, then drops her off. With `scoreSimilarity()` already running to rank brands, ranking their individual fragrances is the same computation one level deeper.
**Effort:** S-M (human: ~2 days / CC: ~30 min)
**Depends on:** `scoreSimilarity()`, existing house detail render path. Needs designer to spec layout change.
**Note:** Only show when user has ≥1 owned fragrance.

---

### TODO: Wardrobe Gap → Specific Frag Suggestions
**What:** Below the gap headline, before the CTA, show 2-3 specific fragrance recommendations that fill the identified gap — ranked by: (1) gap axis coverage, (2) similarity to existing collection.
**Why:** Emma knows her gap is "missing citrus freshness" but "Browse Citrus & Green" dumps her in a 40-item list. The specific recommendation closes the discovery→decision gap in one step.
**Effort:** M (human: ~2 days / CC: ~30 min)
**Depends on:** `computeWardrobeGap()`, `scoreSimilarity()`, `computeProfile()` — all shipped. Needs designer to spec the suggestion cards inside the gap card.
**Design note:** Suggestions should appear as `.list-item--flat` rows inside the `.dna-card` gap container, before the "Browse all" CTA. Max 3 frags. Each shows: name, brand, "Fills your freshness gap" label.

---

### TODO: Collection Context in Detail Panel
**What:** "Most similar in your collection: X (87%)" shown inline on the fragrance detail panel, plus a one-line gap note ("Adds a fresh top you don't own yet").
**Why:** Emma manually runs 3-5 Compare round-trips per shopping session to see how a new frag relates to what she owns. This surfaces the answer without leaving the detail view.
**Effort:** S (human: ~1 day / CC: ~20 min)
**Depends on:** `scoreSimilarity()`, `ST{}` — both exist. Best after Collection Stats ships.

---

### TODO: Zero-Owned Onboarding Prompt in Discovery Area
**What:** When the user has 0 owned fragrances and the Brand Discovery section would be hidden, show a friendly prompt instead: "Mark one fragrance you own or love — we'll personalize everything." With a CTA that pre-fills catalog search.
**Why:** Jake (new shopper, 0 owned) is the user who most needs guidance. Currently all personalization features are invisible to him. This creates a path into the personalization funnel without forcing a formal onboarding flow.
**Effort:** S (human: ~1 day / CC: ~20 min)
**Depends on:** Designer to specify placement and copy tone (encouraging, not guilt-inducing).

---

### TODO: Smart Wishlist Priority
**What:** "Next buy" vs "someday" toggle on wishlist items, with a "ready to buy?" prompt that resurfaces top-priority items.
**Why:** Complements wardrobe gap analysis — makes the wishlist actionable rather than a passive list.
**Effort:** S (human: ~1 day / CC: ~20 min)
**Depends on:** `ST{}`, `sm_wish` localStorage

---

### TODO: Quiz Result Persistence
**What:** Store the last quiz result set in `sessionStorage` so navigating to a fragrance detail and pressing back returns to quiz results, not the catalog.
**Why:** Sarah took the gift quiz, tapped a result to see detail, and lost her quiz context entirely. She had to retake the quiz. Back-navigation from detail to quiz is a basic UX expectation.
**Effort:** S (human: ~1 day / CC: ~20 min)
**Depends on:** Quiz routes working (fixed 2026-03-19). Cross-page state is tricky — needs careful audit of the detail→back flow.

---

### TODO: Quiz-to-Compare Bridge
**What:** "Compare your top 2" button after quiz results pre-fills the Compare panel with the top two quiz matches.
**Why:** Short path from discovery (quiz) to decision (compare). Logical next action after quiz completes.
**Effort:** S (human: ~4 hours / CC: ~15 min)
**Depends on:** Quiz routes working (fixed 2026-03-19), quiz result persistence (above recommended first).

---

### TODO: Scent DNA Profile Page
**What:** Persistent identity page: "Your scent DNA is 60% Woody, 25% Amber, 15% Citrus" with owned collection stats, top roles, and signature note cloud.
**Why:** Identity layer that makes users feel invested. Shareable. Drives return visits.
**Effort:** L (human: ~1 week / CC: ~1 hr)
**Depends on:** Olfactive DNA card (shipped) validates the data model. `computeProfile()` already exists.

---

### TODO: Season Wardrobe
**What:** "Your 4-fragrance year" — maps owned fragrances to seasons using warmth/freshness scores, surfaces what to reach for today.
**Why:** Natural extension of the "completing your wardrobe" direction. Roles system (Summer/Winter) already provides the substrate.
**Effort:** S (human: ~1 day / CC: ~20 min)
**Depends on:** `computeProfile()`, roles data

---

### TODO: Saved Comparisons
**What:** Persist last 5 comparison pairs in localStorage, show as "Recent" chips above the compare cards.
**Why:** Miguel compares Santal 33 vs Gypsy Water repeatedly — re-selecting both every session is painful with essential tremor.
**Effort:** M (human: ~2 days / CC: ~30 min)
**Depends on:** Compare URL persistence (already works).

---

### TODO: Blind Buy Oracle
**What:** Personalized "should I blind buy this?" confidence score based on similarity to owned fragrances, family overlap, and role coverage.
**Why:** Directly addresses "making smart choices when spending time discovering fragrances." Reduces buyer anxiety.
**Effort:** M (human: ~3 days / CC: ~45 min)
**Depends on:** `scoreSimilarity()`, `computeProfile()`, Collection Context in Detail Panel (above) ships first.

---

### TODO: Layering Lab
**What:** Pick two fragrances → compatibility %, combined profile radar, merged note timeline, recipe card with application instructions.
**Why:** Transforms Scentmap from reference tool to creative tool. Highly shareable.
**Effort:** M (human: ~3 days / CC: ~45 min)
**Depends on:** `scoreLayeringPair()`, `computeProfile()`, `FAM_COMPAT` (all exist)

---

## P3 — Backlog (revisit with usage data)

One-line summaries. Full specs written when promoted to active work.

- **Zodiac Scent Quiz** — Zodiac-to-family mapping quiz. Shareable result page. High viral potential, low depth. (M effort)
- **Shareable Result Cards** — Canvas/OG image generation for quiz results and DNA card. Engagement multiplier. Depends on Scent DNA Profile.
- **Mood/Vibe Quiz** — Image-based personality quiz variant of the zodiac quiz.
- **"Surprise Me" Random Compare** — Random pair button on Compare page. 30-min implementation.
- **Compare Keyboard Shortcuts** — `X` to swap fragrances, `Backspace` to clear slot. Persona: Nadia.
- **"Smells like..." Descriptions** — 1-sentence evocative descriptions for all 183 entries. Needs copywriting.
- **Dupe Finder** -- Strategic positioning unresolved. High SEO value vs. premium brand risk.
- **Dupe Lab Share Card** — Canvas share image for dupe results. Depends on Dupe Finder shipping.
- **Fragrance Gift/Share Card** — Single-fragrance shareable summary. Simpler than DNA Card. Persona: Sarah (gift giver).
- **Fragrance-level Retailer Links** — `retailers[]` optional array in scent JSON, rendered in detail panel. Needs data work for 183 frags.
- **Shareable Gap Card** — Gap analysis result as shareable image. (After Wardrobe Gap matures with usage data.)
- **Daily A11y Pass (Nose Knows)** — Focus management, keyboard-only playability. Blocks shipping to Nadia persona.
- **The Nose Knows (Daily Game)** — Wordle-style fragrance trivia. Retention mechanic. (L effort)

---

## Strategic Questions (unresolved — needs decision before building)

1. **Dupe positioning:** Frame as "inspired by" (premium) or "cheaper alternatives" (mass)? The answer changes the entire UI tone and SEO strategy.
