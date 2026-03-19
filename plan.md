# Universal Search — Implementation Plan

Designed in plan-design-review session 2026-03-18.
Replaces the dual-column drum rolodex picker and the `openGlobalSearch()` stub
with a single, context-aware search modal that works everywhere in the app.

---

## What We're Building

A single search modal triggered by ⌘K, Ctrl+K, or `/` from anywhere in the app.
In normal mode it navigates to a fragrance, note, or house detail panel.
In compare mode (opened by clicking a slot card) it fills that compare slot,
with live similarity scores shown when the other slot is already filled.

The drum roller (`#frag-picker` and all related code) is removed entirely.

---

## Layout Spec

### Desktop modal (centered overlay, max-width 560px, fixed positioning)

```
┌─────────────────────────────────────────────────────┐
│  [context banner — only in compare mode]            │
│  "Selecting Fragrance B  ↔  Santal 33"              │
├─────────────────────────────────────────────────────┤
│  🔍  Search fragrances, notes, brands...       [✕]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  RECENTLY OPENED                                    │
│  ● Santal 33           Le Labo  ·  Woody   [Owned]  │
│  ● Gypsy Water         Byredo   ·  Woody            │
│                                                     │
│  POPULAR                                            │
│  ○ Bleu de Chanel      Chanel   ·  Woody            │
│  ○ Bal d'Afrique       Byredo   ·  Floral           │
│  ○ Rose 31             Le Labo  ·  Floral           │
│                                                     │
│  ↵ open  ·  ↑↓ navigate  ·  esc close              │
└─────────────────────────────────────────────────────┘
```

### Normal search results (query = "cedar")

```
┌─────────────────────────────────────────────────────┐
│  🔍  cedar                                     [✕]  │
├─────────────────────────────────────────────────────┤
│  FRAGRANCES                                         │
│  ● Santal 33           Le Labo  ·  Woody   [Owned]  │
│  ○ Bal d'Afrique       Byredo   ·  Floral           │
│  ○ Gypsy Water         Byredo   ·  Woody            │
│                                                     │
│  NOTES                                              │
│  🌿 Cedar              Base  ·  Woody               │
│  🌿 Cedarwood          Base  ·  Woody               │
│                                                     │
│  HOUSES                                             │
│  🏛 Le Labo            17 fragrances                │
└─────────────────────────────────────────────────────┘
```

### Compare mode (slot A = Santal 33, selecting B, no query)

```
┌─────────────────────────────────────────────────────┐
│  Selecting Fragrance B  ↔  Santal 33                │
│  🔍  Search to compare...                      [✕]  │
├─────────────────────────────────────────────────────┤
│  ○ Another 13          Le Labo  ·  Woody       88%  │
│  ○ Gypsy Water         Byredo   ·  Woody       78%  │
│  ○ Mojave Ghost        Byredo   ·  Woody       72%  │
│  ○ Santal Blush        Tom Ford ·  Woody       69%  │
│  ○ Bal d'Afrique       Byredo   ·  Floral      31%  │
│  ○ Rose 31             Le Labo  ·  Floral      28%  │
└─────────────────────────────────────────────────────┘
Note: sorted by similarity score to slot A. Query filters this list
but keeps scores live. Similarity is pre-computed once on open using
scoreSimilarity(slotA, eachFrag) over all 183 CAT entries.
```

### Mobile (bottom sheet, <768px)

Same states as desktop but rendered as a bottom sheet using existing `pushSheet()`.
Input at top, results scrollable above system keyboard.
Min-height 44px (`var(--touch-target)`) on all result rows.

---

## Interaction States

| State | What user sees |
|-------|----------------|
| Open (no query) | Input auto-focused. Recents (2–5, sessionStorage key `sm_recent`) + Popular (hardcoded 5 popular IDs). |
| Typing (≥1 char) | Live filter. FRAGRANCES (max 6) · NOTES (max 3) · HOUSES (max 2). No debounce needed. |
| No results | "Nothing matches '…'" in `--text-secondary` `--font-serif`. Below: example search hints. No button needed — just warmth. |
| Keyboard navigate | Arrow ↓↑ moves highlight row by row, crossing sections. Highlighted row: `var(--bg-secondary)` bg. Enter selects. |
| Compare mode, both slots empty | No context banner. Show Popular fragrances. |
| Compare mode, one slot filled | Context banner with slot name and existing frag name. Results sorted by similarity. Scores shown. |
| After compare selection | Modal closes. `_fillCard(slot, frag)` called. If other slot is empty, that card gets a single pulse animation (CSS keyframe, 600ms). |
| Loading (catalog not ready) | Skeleton rows: 5 × 44px, `var(--bg-secondary)` background, shimmer animation. Input still usable. |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘K (Mac) / Ctrl+K (Win/Linux) | Opens universal search modal in normal mode |
| / (when no input focused) | Opens universal search modal (replaces old catalog-focus behavior) |
| Arrow ↓ / ↑ | Navigate results |
| Enter | Select highlighted result |
| Tab | Same as Arrow ↓ (stays within modal) |
| Esc | Close modal, return focus to `_lastFocusedEl` |

---

## Context Modes

### Normal mode
Triggered by: ⌘K, Ctrl+K, `/`, or nav search button click from any page.

Behavior:
- Shows fragrances + notes + houses (grouped by type)
- Selecting a fragrance → `openFragDetail(frag)` (or navigate to detail panel)
- Selecting a note → `openNoteFloat(note)` or navigate to notes panel
- Selecting a house → `openHouseDetail(brand)`
- No context banner

### Compare mode
Triggered by: clicking a compare slot card (`cmp-card-a` or `cmp-card-b`).

Behavior:
- `openUniversalSearch({ context: 'compare', slot: 'a' | 'b' })`
- Context banner: "Selecting Fragrance A" (or B)
- If other slot is filled: "↔ [Name]" appended to banner
- If other slot is filled: pre-compute similarities, sort results by score desc
- Results: fragrances only (flat list, no type grouping)
- Selecting: `_selectFragForSlot(slot, frag)` → close modal

---

## Result Row Formats

### Fragrance row
```
[family-dot] [Name]         [Brand] · [Family]    [Owned?]   [Score%?]
```
- family-dot: 10px circle, `getCmpFam(f.family).accent` background
- Name: `frag-picker-item-name` (existing class)
- Brand + Family: `frag-picker-item-brand` (existing class), `--text-secondary`
- [Owned]: shown only if `isOwned(f.id)` — small badge, `--text-tertiary`, `--fs-sm`
- [Score%]: shown only in compare mode with one slot filled — right-aligned, `--font-sans`, bold
- Owned/wishlist dot on the family circle: `isOwned` → filled dot; `isWish` → outlined dot

### Note row
```
🌿 [Name]     [Tier] · [Family]
```
- Emoji or family-dot for notes (consistent with existing note display)
- Tier: "Base", "Mid", "Top"

### House row
```
🏛 [Brand]    [N] fragrances
```
- Count of fragrances in that brand from CAT

---

## What Gets Removed

- `#frag-picker` overlay HTML (the dual-column picker)
- All `frag-picker-col`, `frag-picker-list`, `frag-picker-search-a/b` elements
- `_renderPickerList()`, `_renderPickerLists()`, `_initPickerDrumScroll()`, `_initPickerSortSwipe()`, `_updatePickerSort()`, `_initPickerKeyNav()` functions
- `_openFragPicker()`, `_closeFragPicker()` — replaced by `openUniversalSearch()`
- All `.frag-picker-col`, `.frag-picker-list`, `.frag-picker-sort-*` CSS rules
- `PICKER_ITEM_H` constant, `_pickerSlot`, `_pickerSort` state vars

The `#frag-picker` HTML block in `app/index.html` (lines ~187–207) is removed.
The JS block in `app.js` (~lines 3716–4076) is removed.

---

## What Gets Kept / Reused

- `frag-picker-item`, `frag-picker-item-name`, `frag-picker-item-brand`, `frag-picker-dot` CSS — these classes are used elsewhere (DNA card picker, journal picker, etc.) — keep the CSS, just don't use them in the new search
- `_selectFragForSlot(slot, frag)` — keep, called from new search
- `_fillCard(slot, frag)` — keep
- `_updateOtherSelMarking()` — keep
- `openFragDetail()`, `openHouseDetail()` — unchanged
- Note selection: `openDetail(c => renderNoteDetail(c, note), note.name)` — consistent with all existing note-open call sites; `openNoteFloat` does not exist, `openNotePopup` requires a DOM anchor
- `scoreSimilarity()` — called once on compare modal open
- `getCmpFam()` — unchanged, used for family dots
- `isOwned()`, `isWish()` — used for badges
- `openGlobalSearch()` — rewrite its body; export signature unchanged
- Existing `.cat-search-input` CSS — reuse for the search input styling
- Bottom sheet system — reuse for mobile

---

## sessionStorage Recents

Key: `sm_recent` (JSON array of fragrance IDs, max 5, most recent first).
Written to on every `openFragDetail()` call.
Read on universal search open to populate the "Recently Opened" section.
On first visit (no recents): show only Popular section.

---

## Accessibility

- Modal: `role="dialog"` `aria-modal="true"` `aria-label="Search fragrances, notes, and houses"`
- Input: `aria-controls="us-results"` `aria-autocomplete="list"` `aria-activedescendant` updated on highlight change
- Results container: `id="us-results"` `role="listbox"`
- Each row: `role="option"` `aria-selected` (true when highlighted)
- Section headers: `role="presentation"` (decorative)
- Context banner: `aria-live="polite"` so screen readers announce compare mode
- Focus trapped inside modal while open (existing `_trapFocus()`)
- Esc returns focus via `_returnFocus()`
- Touch targets: 44px min-height on all rows (`var(--touch-target)`)

---

## HTML to Add (in app/index.html)

```html
<!-- Universal Search Modal -->
<div id="universal-search" class="us-overlay" role="dialog" aria-modal="true"
     aria-label="Search fragrances, notes, and houses" hidden>
  <div class="us-backdrop"></div>
  <div class="us-modal">
    <div id="us-context" class="us-context" aria-live="polite" hidden></div>
    <div class="us-input-wrap">
      <svg class="us-search-icon" ...></svg>
      <input id="us-input" type="text" class="us-input cat-search-input"
             placeholder="Search fragrances, notes, brands..."
             autocomplete="off" aria-controls="us-results" aria-autocomplete="list">
      <button id="us-close" class="us-close" aria-label="Close search">✕</button>
    </div>
    <div id="us-results" class="us-results" role="listbox"></div>
    <div class="us-hint" aria-hidden="true">↵ open · ↑↓ navigate · esc close</div>
  </div>
</div>
```

---

## Implementation Steps (in order)

1. Add `#universal-search` HTML to `app/index.html`
2. Write `openUniversalSearch(opts)` function in `app.js`:
   - `opts`: `{ context?: 'compare', slot?: 'a'|'b' }`
   - Sets context banner, pre-computes scores if compare+slot filled
   - Renders default state (recents + popular)
   - Focuses input
3. Write `_renderUsResults(query)`:
   - No query: render recents + popular groups
   - With query: filter CAT, NI, BRANDS; render grouped results
   - Compare mode: flat fragrance list sorted by score
4. Wire keyboard nav (arrow, enter, tab, esc) on the modal
5. Wire ⌘K / Ctrl+K in the global keydown handler (replaces `openGlobalSearch()` body)
6. Wire `/` in the global keydown handler (replaces catalog-focus behavior)
7. Update compare slot wiring (two places):
   - `initCompare()`: replace all `_openFragPicker(slot)` calls with `openUniversalSearch({ context: 'compare', slot })`
   - Sticky slot listener (~line 3704): `el.addEventListener('click', () => openUniversalSearch({ context: 'compare', slot: el.dataset.slotSticky }))`
8. Update `openFragDetail()` to write sessionStorage recents with try/catch:
   ```js
   try {
     const recent = JSON.parse(sessionStorage.getItem('sm_recent') || '[]');
     const next = [frag.id, ...recent.filter(id => id !== frag.id)].slice(0, 5);
     sessionStorage.setItem('sm_recent', JSON.stringify(next));
   } catch(e) { /* storage unavailable — silently skip */ }
   ```
9. Remove drum roller HTML from `app/index.html`
10. Remove drum roller JS from `app.js` (~350 lines)
11. Remove drum roller CSS from `components.css`
12. Add CSS for `.us-overlay`, `.us-modal`, `.us-context`, `.us-results`, `.us-row`, `.us-section-header`, `.us-hint`

---

## Popular Fragrances (hardcoded for default state)

```js
const US_POPULAR = ['santal-33', 'bleu-de-chanel', 'bal-dafrique', 'gypsy-water', 'rose-31'];
// Always null-guard before render:
const popularFrags = US_POPULAR.map(id => CAT_MAP[id]).filter(Boolean);
```
