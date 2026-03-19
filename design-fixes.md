# Design Fixes — Ship-Ready Polish

Audit of spacing, border-radius, padding, and layout consistency issues.
Goal: professional, harmonious UI with design-system-driven spacing.

---

## FINDING-001: `landing-card` has no CSS class (You panel CTA)
**Impact:** High
**Location:** `js/app.js:611` → rendered in `#you-journal-cta`
**Problem:** "Trying scents on?" card uses a nonexistent `.landing-card` class with inline `border-color` and `background`. No `border-radius`, no `padding` — content touches the edge. Looks like an unstyled `<div>`.
**Fix:** Add `.landing-card` CSS class with `border-radius: var(--radius-lg)`, `padding: var(--sp-lg)`, proper border, and background.

---

## FINDING-002: Swap suggestion cards have no border-radius
**Impact:** High
**Location:** `js/app.js:3594`, `styles/components.css:235`
**Problem:** `.cmp-sug-card` (`.list-item--flat`) renders as flat rectangles with `bg-secondary` background but no `border-radius`. They sit inside `.cmp-sug-col-items` which also has no radius. Cards look like flat bars, not contained surfaces.
**Fix:** Add `border-radius: var(--radius-lg)` and `overflow: hidden` to `.cmp-sug-card`. Add `border: 1px solid var(--border-standard)` for containment.

---

## FINDING-003: Olfactive DNA card is 100% inline styles
**Impact:** High
**Location:** `js/app.js:642–668`
**Problem:** The DNA card reuses `.dc-sim-shelf` (a list container) with inline `padding` and `marginBottom` overrides. All child elements use inline styles: `font-size:32px`, `font-size:10px`, `opacity:0.8`, `margin-bottom:4px`. Profile bars use inline widths with `dc-stat` having no visual boundary clarity.
**Fix:** Create dedicated `.dna-card`, `.dna-stat-label`, `.dna-section-divider` classes. Remove inline style overrides, let the card's own padding handle spacing.

---

## FINDING-004: Detail panel sensory bars are all inline styles
**Impact:** Medium
**Location:** `js/app.js:1075–1088`
**Problem:** "Sensory Profile" section builds bars with raw inline styles: `display:flex`, `width:60px`, `height:4px`, `position:relative`. Each bar is a nested div soup with no reusable class.
**Fix:** Create `.sensory-bar-row`, `.sensory-bar-label`, `.sensory-bar-track`, `.sensory-bar-fill` classes matching the design system tokens.

---

## FINDING-005: Detail panel scent journey timeline is all inline styles
**Impact:** Medium
**Location:** `js/app.js:1092–1108`
**Problem:** The timeline (Opening → Heart → Dry Down) uses extensive inline styles: `border-left: 2px solid`, `margin-left: 6px`, `padding-left: var(--sp-lg)`, absolute-positioned dots with `left:calc(-1 * var(--sp-lg) - 7px)`. Each layer is a `<div style="position:relative;">` block.
**Fix:** Create `.journey-timeline`, `.journey-step`, `.journey-dot`, `.journey-dot--filled` classes.

---

## FINDING-006: Compare frag card padding is inconsistent
**Impact:** Medium
**Location:** `styles/components.css:1682, 1736, 1743`
**Problem:** `.cmp-frag-card-name-row` has `padding: var(--sp-sm) var(--sp-sm) 2px var(--sp-md)` — mixed values with a magic `2px`. `.cmp-frag-card-name` has `padding: var(--sp-sm) var(--sp-md) 2px`. `.cmp-frag-card-brand` has `padding: 0 var(--sp-md) var(--sp-xs)`. Each child manages its own horizontal padding instead of the card body.
**Fix:** Add a `.cmp-frag-card-body` wrapper with consistent `padding: var(--sp-md)` and remove individual horizontal padding from children. Use `gap` for vertical spacing.

---

## FINDING-007: Collection section spacing — parent vs child padding
**Impact:** Medium
**Location:** `js/app.js:327–370`, `styles/components.css:3562`
**Problem:** `.collection-section` has `margin-bottom: var(--sp-xl)` but the saved panel has `padding: var(--sp-lg)` (inline on `#p-saved`). The `.scent-list` inside gets its own border but no margin from the section header. Spacing between "OWNED 1" header and the card below is tight.
**Fix:** Increase `.collection-section` gap. Add `margin-top: var(--sp-sm)` to `.scent-list` within collection sections. Move panel padding to CSS.

---

## FINDING-008: `cmp-sug-v2-label` doesn't use sec-label
**Impact:** Polish
**Location:** `js/app.js:3610`
**Problem:** "Swap suggestions" heading uses `.cmp-sug-v2-label` which is noted as "migrated to .sec-label" in CSS but the JS still renders the old class.
**Fix:** Change JS to use `sec-label` class on the heading.

---

## FINDING-009: Dupe lab items are 100% inline styles
**Impact:** Medium
**Location:** `js/app.js:985–1026`
**Problem:** Each dupe item is a `<div>` with ~8 inline styles: border, radius, padding, background, margin. The score breakdown uses inline flex. None use design-system classes.
**Fix:** Create `.dupe-item` CSS class. Reuse existing `.dc-*` patterns for score, brand, and description.

---

## FINDING-010: `#p-saved` and `#p-changelog` use inline padding
**Impact:** Polish
**Location:** `app/index.html:58, 147`
**Problem:** `style="padding: var(--sp-lg);"` — panel padding is inline instead of in CSS. Other panels use `.col-main-content` padding.
**Fix:** Add `.panel--padded` class or scope padding to `#p-saved`, `#p-changelog` in layout.css.

---

## Summary

| # | Finding | Impact | Type |
|---|---------|--------|------|
| 001 | Landing card unstyled | High | Missing CSS |
| 002 | Swap cards no radius | High | Radius |
| 003 | DNA card inline styles | High | Inline → CSS |
| 004 | Sensory bars inline | Medium | Inline → CSS |
| 005 | Journey timeline inline | Medium | Inline → CSS |
| 006 | Frag card padding mess | Medium | Padding |
| 007 | Collection section spacing | Medium | Spacing |
| 008 | Sug label wrong class | Polish | Class name |
| 009 | Dupe lab inline styles | Medium | Inline → CSS |
| 010 | Panel inline padding | Polish | Inline → CSS |
