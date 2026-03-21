# Scentmap — TODOs

Updated 2026-03-20. CEO v1.2.0 user research reviewed 2026-03-20 — added P2 items from persona interviews. Full plan: `~/.gstack/projects/matthewlew-scentmap/ceo-plans/2026-03-20-v120-user-research.md`

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

### ~~TODO: Wardrobe Gap — Specific Fragrance Suggestions~~ ✅ Shipped 2026-03-20
`computeGapSuggestions()` added. `renderWardrobeGap()` updated to render 2–3 `.carousel-card` items inside `.carousel-wrap` / `.carousel` when ≥2 suggestions available. Cards ranked by `scoreSimilarity()` to owned collection, filtered to gap target families, excluding owned/wishlisted. Each card: family dot (gap axis color) + axis short label ("Sweet", "Fresh", etc.) + frag name + brand. "Browse [family]" CTA moves below shelf. Falls back to button-only if <2 recs. Keyboard nav via `initCarouselKeyNav()`. QA verified: carousel renders, cards open detail panel on click.

---

### ~~TODO: Collection Context in Detail Panel~~ ✅ Shipped 2026-03-20
"In your collection: X (89%)" row below action buttons in detail panel. Uses `scoreSimilarity()` against `ST{}` owned set. Shipped in commit `9d63a80`. TODOS.md updated retroactively.

---

### TODO: Quiz Result Persistence
**What:** Store quiz results in `sessionStorage` key `sm_quiz_session`; back-navigation returns to results, not catalog.
**Why:** UX bug — losing state on back-nav from detail breaks every gift-giver and casual-shopper session. Sarah hits this every use.
**Schema:** `{quizId: string, timestamp: number, answers: string[], results: string[]}`. Session-only (browser close clears — acceptable for v1).
**Effort:** S (CC: ~20 min)
**Depends on:** Quiz routes (fixed 2026-03-19).

---

## P2 — v1.3.0 Cycle (persona research 2026-03-20)

**Gate:** Do not start until all prior P2 items are shipped and QA-verified. Full research report: `~/.gstack/projects/matthewlew-scentmap/ceo-plans/2026-03-20-v120-user-research.md`

**Sequenced order — ship in this order:**

### P2-A: a11y Obligations (ship as single commit — these are obligations for shipped features)

---

### TODO: DNA Card Profile Bars — ARIA Accessibility
**What:** Replace visual-only profile bars on the DNA Card with `<meter>` HTML elements (`min="0"` `max="100"` `value="{n}"` `aria-label="Freshness: {n}%"`). Screen readers skip the current bars entirely.
**Why:** Nadia (low vision) cannot hear her own profile — the bars are invisible to VoiceOver/NVDA. Accessibility obligation for a shipped feature.
**Effort:** XS (CC: ~10 min)
**Depends on:** DNA card markup in `app.js`.

---

### TODO: Carousel Focus Restoration After Detail Close
**What:** When a user opens a detail panel from a carousel card, save the originating element. On detail close, restore focus to that card.
**Why:** Nadia keyboard-navigates the carousel, opens a detail, closes it — focus jumps to the top of the page. This breaks her flow every session.
**Implementation:** Use a focus stack (`_focusStack = []`). Push `document.activeElement` when any carousel card triggers `openDesktopDetail()` or a mobile sheet. Pop + restore focus on detail/sheet close. Prevents overwrites when nested carousels are open.
**Effort:** XS (CC: ~15 min)
**Depends on:** `openDesktopDetail()`, `closeDesktopDetail()`, sheet stack.

---

### TODO: State Bar Collection Count Text
**What:** Add "N items" text beside the active state tab (Owned/Wishlist) in the catalog filter bar.
**Why:** Nadia wants to know her collection size without scanning the list. Emma also noted the wishlist is unranked and uncounted. Pure text, no new component.
**Effort:** XS (CC: ~10 min)
**Depends on:** `CAT_STATE_FILTER`, existing owned/wish counts from `ST{}`.

---

### TODO: Brand Card Hover Affordance
**What:** Increase brand discovery card hover state from `--border-subtle` to `--border-strong` + light background shift.
**Why:** Miguel (tremor) can't reliably tell if his cursor is hovering a card before clicking. Current subtle border change is invisible for imprecise cursor users.
**Effort:** XS (CSS only — CC: ~5 min)
**Depends on:** `.carousel-card` in `components.css`.

---

### P2-B: Bug-Class Fixes (ship after P2-A)

*(Quiz Result Persistence TODO above is P2-B — already listed.)*

---

### P2-C: Loop Closers (ship after P2-B)

---

### TODO: Carousel Prev/Next Buttons
**What:** Add `<button class="carousel-prev">` and `<button class="carousel-next">` overlay elements to all carousels. On click: `carousel.scrollBy({left: ±300, behavior: 'smooth'})`. Buttons hide at scroll start/end via `scroll` event listener. Desktop only (≥1100px) — CSS media query hides below breakpoint.
**Why:** Miguel (tremor) cannot use horizontal scroll with his trackball. Both the Brand Discovery and Wardrobe Gap carousels are inaccessible to him with mouse. Arrow keys exist but require keyboard-first mode.
**Effort:** S (CC: ~25 min)
**Depends on:** `initCarouselKeyNav()` (arrow keys are separate — no conflict; buttons are independent tabstops).

---

### TODO: Smart Wishlist Priority ("Next Buy" Flag)
**What:** Add a "next buy" toggle to wishlist rows. Tap any wishlisted frag to flag it. `sm_wish_priority` localStorage key stores one ID. Flagged row shows `★` badge.
**Why:** Emma has 7 unranked wishlist fragrances and uses a separate note app to track purchase priority. This closes that loop with a single-tap toggle.
**Effort:** S (CC: ~20 min)
**Depends on:** `ST{}`, wishlist row rendering in `renderCatRow`.

**Design spec (2026-03-20):**
- Visual: `.list-item-trailing-label` ("★ Next") when flagged — DM Sans, fs-meta, 700, accent-primary. No badge; trailing-label has the accent emphasis needed to stand out. Unflagged rows: no trailing element (clean).
- Behavior: One flag at a time. Tapping another wishlisted item moves the flag automatically. Tapping the same item clears it.
- Touch zone: Wrap the trailing-label in a `<button>` with `min-height: var(--touch-target)` and `aria-label="Mark {name} as next buy"` + `aria-pressed={bool}`.
- Detail panel: Show "★ Next buy" row below action buttons when the frag is wishlisted. Matches collection-context row treatment (`.sec-label` + toggle). Toggle from detail also updates wishlist rows.
- **Pushback on "★ badge":** Badge typography is text-tertiary (no emphasis). Trailing-label gives accent-primary color needed to signal priority. Changed accordingly.

---

### TODO: "More Like This" Diversity Boost
**What:** Replace rank 5 of the 5-result "More Like This" block with a family-diverse "wildcard." After computing top-5 similarity results: identify the family least represented vs. the viewed frag (lowest note overlap). Find highest-`scoreSimilarity()` frag from that family not already in ranks 1–4 and not owned/wishlisted. Replace rank 5. Label with `data-wildcard="true"` + "Something different →" prefix.
**Why:** Jake finds the current suggestions too samey — "5 citrus-woody results for a citrus-woody frag." Surprise discovery is half the value of recommendations.
**Effort:** S (CC: ~20 min)
**Depends on:** `scoreSimilarity()`, note overlap logic, family data on `CAT[]`.

---

### TODO: Zero-Owned State — Onboarding Prompt + You Tab Fallback
**What:** Two pieces, shipped together:
1. **Brand Discovery**: if `owned.length === 0`, replace carousel with a CTA card: "Mark one fragrance you love to unlock personalized recommendations." Tap opens catalog. Carousel appears only after first frag owned.
2. **You Tab**: if `owned.length === 0`, show "Start with a fragrance you know" + a hardcoded family-balanced 5-frag sample. Designer provides specific list (1 citrus, 1 woody, 1 floral, 1 amber, 1 other). Both pieces disappear once any frag is marked owned.
**Why:** Jake (0 owned) opens the app and sees empty personalization. Sarah (0 owned, gifting) has an empty You tab. The app's best features are invisible to new users. This is a growth/retention gap.
**Effort:** S (CC: ~25 min)
**Depends on:** `ST{}` owned count, Brand Discovery and You tab render functions.

**Design spec (2026-03-20):**
- Brand Discovery CTA card: `.carousel-card` with `data-family="default"`. Content: 5 small family-colored dots in a mini flex row (use `--fam-citrus`, `--fam-floral`, `--fam-woody`, `--fam-amber`, `--fam-green` as inline `background` — data-driven color exception) + `.carousel-card-name` "Mark a fragrance you love" + `.carousel-card-brand` "Unlock personalized picks". Background: `var(--bg-secondary)`. Border: `1px solid var(--border-subtle)` (interactive card rule). Touch target ≥44px. Tap → `go('catalog', ...)`.
- You tab empty shelf: `.sec-label` "Start with something you know" + `.list-shelf` containing 5 `.list-item--compact` rows. Each row: `.list-item-dot` (family color), `.list-item-label` (name), `.list-item-sublabel` (brand · family). Tap → `openFragDetail(frag)`.
- Hardcoded 5-frag list (landmark frags, family-balanced): Acqua di Gio — Giorgio Armani (Citrus), Santal 33 — Le Labo (Woody), Chloé Eau de Parfum — Chloé (Floral), Black Opium — YSL (Amber), Terre d'Hermès — Hermès (other). Look up IDs at runtime via brand+name match against `CAT[]` — do not hardcode IDs.
- Both surfaces disappear once `Object.keys(ST).filter(id => ST[id] === 'owned').length > 0`.
- **Pushback on "designer provides specific list":** List provided above. No additional design deliverable needed — this is ready for engineering.

---

### P2-D: Big Loop Closers (require design attention before starting)

---

## Design Review — 5 Prototype Candidates (2026-03-20)

Design sketches completed for 5 open TODOs. All follow existing design system patterns — no new components or 1-offs. Engineering selects Feature A and Feature B. Remaining 3 become P2/P3 backlog.

**Recommended non-overlapping Feature A + Feature B:**
- **Feature A: Saved Comparisons** — Highest return-visit signal (Miguel has rebuilt same compare 12+ times). Contained to Compare screen. M effort. Design spec below removes the "designer required" gate.
- **Feature B: Smart Wishlist Priority** — Closes Emma's wishlist loop cleanly. Contained to Catalog/Wishlist views. S effort.

**Other 3 sketched (P2/P3 backlog — ship after A/B):**
- **Zero-Owned State Onboarding** — High retention value; touches 2 surfaces. Assign solo after A/B ships.
- **Season Wardrobe** — P3, You tab only. Spec below removes the "designer required" gate.
- **Compare Keyboard Shortcuts + Hint** — P3, Compare screen. Do not assign to same engineer as Feature A (same surface).

**Killed from this round (with reasoning):**
- Compare Gift Card Generator: requires canvas/screenshot API — outside design system scope. Deferred to v2.0.
- Layering Lab: UX overlap with Compare (dual-select). Confusion risk until brand identity is stronger.
- Zodiac Quiz Integration: blocked on content deliverable (36 curated frag picks across 12 signs).

---

### ~~TODO: Saved Comparisons~~ ✅ Shipped 2026-03-20
`saveCmpPair()` stores last 5 pairs in `sm_compares` localStorage after every `renderCompareResults()`. `renderSavedCompares()` called in `initCompare()` draws a `.list-shelf` of `.list-item--ghost` rows above picker cards when ≥2 valid pairs exist. Remove (×) button per row. Tapping a row fills both slots and runs compare. Pairs deduplicated by sorted ID key. Stale IDs silently discarded on load. New components added to `components.css`: `.list-shelf`, `.list-item--ghost`, `.list-item-inner`, `.list-item-actions`.

**QA checklist (Feature A — Saved Comparisons):**
- [ ] With 0 saved pairs: `#cmp-saved` is hidden, no "Recent" heading visible
- [ ] With 1 saved pair: `#cmp-saved` is still hidden (section requires ≥2)
- [ ] With ≥2 saved pairs: "Recent" `.sec-label` and bordered `.list-shelf` appear above picker cards
- [ ] Each row shows "Frag A vs Frag B" label and "Brand A · Brand B" sublabel (thin-space + middot separator)
- [ ] Tapping a row fills both picker slots and renders compare results
- [ ] URL updates to `/compare/<id-a>/<id-b>` after tapping a row
- [ ] × button removes the pair; section hides once <2 pairs remain
- [ ] Running a new comparison auto-saves the pair (without duplicate if same sorted key)
- [ ] Max 5 pairs stored — 6th compare pushes out the oldest
- [ ] Invalid/deleted frag IDs are silently discarded on load (not rendered)
- [ ] `role="list"` on shelf, `role="listitem"` on each row, `aria-label` on each row button
- [ ] × button `min-height: var(--touch-target)` (44px) — inspect in DevTools
- [ ] Focus ring visible on `.list-item-inner` button via keyboard Tab

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

---

## P3 — Engagement & Identity Layer (unprioritized — v1.3.0+ candidates)

**Gate:** Do not start P3 until P2 cycle is complete. These items require designer specs and/or content deliverables before engineering can begin.

**CEO Reviews:** Engagement expansion (`2026-03-20-engagement-expansion.md`), v1.2.0 user research (`2026-03-20-v120-user-research.md`).

**The gap:** Scentmap's analytical tools are strong but the fun/identity/social layer is thin. Fragrance is an identity category — the app helps you *decide* but doesn't help you *identify*. Quizzes bring organic traffic but don't convert visitors into app users.

**Sequencing note from v1.2.0 persona research:** Quiz-to-App bridge and Scent Persona sharing both scored high-signal from personas Emma + Jake + Sarah. Recommended order within P3: Quiz-to-App bridge → Scent Persona sharing → DNA archetype deep-link → Layering Lab. Zodiac Quiz Integration is valid but lower urgency than the general quiz bridge.

**Designer/content prerequisites (must be ready before engineering starts):**
- Scent Persona sharing: share card visual layout
- DNA archetype deep-link: 16 archetype descriptions (~200 words each)
- Note glossary tooltips: 177 note 1-sentence descriptions
- Compare → Gift card: gift-framing visual spec

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

### TODO: Compare → Gift Card Generator
**What:** "Share as gift" button on Compare results. Generates a gift-friendly visual summary (frag name, family, metric labels in gift copy, why it's great) for saving/sharing.
**Why:** Sarah uses Compare as her gifting research tool. The output is already beautiful — she just needs a gift-framing share action to close the loop.
**Effort:** M (CC: ~40 min)
**Designer required:** Gift-framing visual spec + copy tone decision.
**Depends on:** Compare results, metric label copy.

---

### TODO: Compare Keyboard Shortcuts
**What:** `X` to swap fragrance A/B positions; `Backspace`/`Delete` to clear active slot.
**Why:** Nadia (keyboard-first) takes 20+ keystrokes per compare session to manage slots. These shortcuts would halve her interaction cost.
**Effort:** S (CC: ~20 min)
**Depends on:** Compare slot state in `initCompare()`.

**Design spec (2026-03-20):**
- Shortcuts: `X` swaps slots. `Backspace`/`Delete` clears the slot that was last interacted with (track last active slot index with a module-scope variable).
- Discoverability: Static hint line below the two picker cards, desktop only (`@media (min-width: 1100px)`). Use `<p>` with `.sec-label` class + `color: var(--text-tertiary); text-align: center`. Text: "Keyboard: X to swap · ⌫ to clear". No tooltip — tooltips require hover detection and positioning logic that doesn't exist in the current design system.
- Announce slot changes to an `aria-live="polite"` region: "Swapped: [Frag A] and [Frag B]" or "[Slot 1 cleared]". Reuse `#cat-live` pattern or a second live region in the Compare panel.
- Guard: `if (document.querySelector('#p-compare.active') && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')` before handling any keydown.
- **Pushback on "tooltip" approach:** Resolved — static visible hint is simpler, always discoverable, works with Nadia's screen magnification. No designer prerequisite remains.

---

### TODO: Season Wardrobe
**What:** Map owned frags to 4 seasons based on family + sillage. On You tab: "This [season]" section showing which owned frags fit the current season.
**Why:** Miguel wants to know what to grab in the morning. The data for seasonal appropriateness (family + sillage + warmth axis) already exists.
**Effort:** M (CC: ~35 min)
**Depends on:** `computeProfile()`, owned collection, calendar date.

**Design spec (2026-03-20):**
- Placement: You tab, new section below DNA card, above Wardrobe Gap. `.sec-label` "This [season]" (e.g. "This Spring").
- Season detection: `new Date().getMonth()` → Spring 2–4, Summer 5–7, Fall 8–10, Winter 11 + 0–1.
- Season affinity scoring (family weights — add together for a score, then sillage tiebreak):
  - **Spring:** Citrus +3, Floral +3, Green +2, Chypre +1, Gourmand −1
  - **Summer:** Citrus +3, Green +3, Floral +1, Chypre +1, Amber −1, Leather −1
  - **Fall:** Woody +3, Amber +3, Leather +2, Gourmand +1, Citrus −1
  - **Winter:** Oud +3, Amber +3, Leather +3, Gourmand +2, Woody +2, Citrus −1
  - Sillage bonus: Spring/Summer prefer sillage ≤ 6 (+1 if in range). Fall/Winter prefer sillage ≥ 5 (+1 if in range).
- Show top 3 owned frags by score. Ties broken by sillage proximity to season midpoint.
- UI: `.carousel-wrap` + `.carousel` of `.carousel-card` items — same pattern as Wardrobe Gap suggestions. Card content: family dot, frag name, brand. No season label on card (section header carries it).
- Empty state (owned ≥1 but none match season): `.list-shelf` with single `.list-item--ghost` row, `.list-item-sublabel` "None of your collection fits this season — yet." text-tertiary.
- Zero owned: hide section entirely (zero-owned state handled by Onboarding Prompt).
- **Pushback on "designer required":** Seasonal mapping rules provided above. UI placement is clear. No additional design deliverable — ready for engineering.

---

### TODO: Note Glossary Tooltips
**What:** 1-sentence description on note name hover/tap in the notes browser. "Vetiver: an earthy, smoky grass root from Java with a dry, woody base."
**Why:** Jake (new user) doesn't know what 60% of the note names mean. The notes browser is a list of words without meaning for non-experts.
**Effort:** M (CC: ~30 min after content)
**Content required:** 177 note descriptions (~1 sentence each). This is a content deliverable that blocks engineering.
**Depends on:** `NI[]` note index, notes panel render.

---

## Ideas Parking Lot

These are ideas, not commitments. They stay here until there's evidence they should be built.

- Blind Buy Oracle (confidence score)
- "Smells like..." evocative descriptions (needs copywriter for 183 frags)
- Shareable gap card
- "Surprise Me" Random Compare
- Collection milestones / gamification
- Mood/Vibe Quiz — image-based personality variant
- Quiz-to-Compare Bridge (pre-fill Compare from quiz results)

### Killed (not coming back)

- **Dupe Finder** — strategic positioning unresolved after 3 review cycles. Killed 2026-03-20.
- **Dupe Lab Share Card** — depends on killed Dupe Finder
- **The Nose Knows (Daily Game)** — retention mechanic, massive scope, different product entirely. ✓ Removed 2026-03-20
- **Daily A11y Pass for Nose Knows** — depends on killed game. ✓ Removed 2026-03-20
- **Fragrance-level Retailer Links** — data work for 183 frags, unclear value
