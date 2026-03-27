# Scentmap — Design System Reference

Single source of truth for component inventory, token rules, and the pre-PR checklist. Read this before modifying any UI component.

Live component demos: [`designsystem.html`](./designsystem.html)

---

## Component Inventory

| Component | CSS Class | File | Variants | Usage Rule |
|-----------|-----------|------|----------|------------|
| Button | `.btn` | `styles/components.css` | `.btn--primary`, `.btn--secondary` | All action buttons. Never use inline styles for appearance. See Button System below. |
| Button Group | `.btn-group` | `styles/components.css` | `.btn-group--stack`, `.btn-group--responsive` | Wraps 2+ sibling buttons; each child gets `flex: 1`. |
| Text Link | `.text-link` | `styles/components.css` | — | Inline text/underline button. No border, no background. Use for fragrance name links and quiz navigation. |
| Section Label | `.sec-label` | `styles/layout.css` | — | All filter/section/eyebrow headings. Never use raw `font-size` or `text-transform` inline. |
| Banner | `.banner` | `styles/components.css` | — | Hero CTAs. Use `.banner-head` for layout. Typography must use `.text-title` and `.text-meta`. |
| Card | `.card` | `styles/components.css` | `.card--secondary`, `.card--interactive` | Standard container. All cards must have a 1px border. Padding is baked-in as `--sp-lg`. |
| Stat Card | `.stat-card` | `styles/components.css` | — | Used for metrics (Sillage, Structure, Sensory). Includes border and `--sp-lg` padding. |
| Chip | `.chip` | `styles/components.css` | `.chip--accent`, `.chip--xs`, `.chip--outline` | Pill-shaped status/category labels. Height: 24px (18px for `--xs`). Family chips: plain `.chip` with `style="background: ${color}; color: var(--bg-primary);"` — no variant class needed. |
| Tag | `.tag` | `styles/components.css` | `.tag.shared` | Rectangular metadata labels. Typography must use `.text-meta`. |
| Grid | `.grid` | `styles/components.css` | — | Auto-filling responsive grid (`minmax(280px, 1fr)`). Use for directory views. |
| Shelf | `.list-view` | `styles/components.css` | — | Vertical list of `.list-item` with separators. |
| Tab / Filter Button | `.tab` | `styles/components.css` | `.tab.active` | All filter bars, state tabs, role tabs. Must have `aria-pressed`. |
| List Item | `.list-item` | `styles/components.css` | — | All catalog/saved/suggestion/search rows AND selectable option lists. Use slot sub-elements below. Typography must be applied via utility classes. |
| ↳ Slot: leading | `.list-item-leading` | — | — | Holds dot or icon. flex, align-items:center, flex-shrink:0. |
| ↳ Slot: dot | `.list-item-dot` | — | — | Layout container for indicator (unified 8x8px). Place a `.dot` inside it. |
| ↳ Slot: body | `.list-item-body` | — | — | flex:1, min-width:0. Wraps by default. |
| ↳ Slot: label | `.list-item-label` | — | — | Primary name. Apply `.text-ui-strong`. Truncates to 1 line. |
| ↳ Slot: sublabel | `.list-item-sublabel` | — | — | Brand / category. Apply `.text-meta`. Wraps up to 3 lines. |
| ↳ Slot: detail | `.list-item-detail` | — | — | Notes / context. Apply `.text-caption`. Wraps up to 3 lines. |
| ↳ Slot: trail | `.list-item-trail` | — | — | Trailing cluster: chip + score. |

---

## Button System

### Base + Variants

```
.btn                       base — centered, hug width, DM Sans fs-meta 600
  .btn--primary            solid ink background, paper text
  .btn--secondary          outline, secondary text; .active = inverted (primary appearance)

.btn-group                 horizontal row; each .btn child gets flex: 1
  .btn-group--stack        always vertical
  .btn-group--responsive   stacks on mobile (≤767px)
```

### Width

Buttons are **hug by default** (`inline-flex`). Width is controlled by context:

- `u-w-full` — fills its container
- `.btn-group` — all children fill equally (`flex: 1`)
- Inline `style="flex: 1"` — acceptable for one-off flex siblings (e.g. emoji rate buttons)

### Active / Toggle State

Use `.btn--secondary` with `.active` (or `aria-pressed="true"`) for toggleable actions:

```js
btn.className = 'btn btn--secondary' + (isActive ? ' active' : '');
btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
```

### Compare Picker Button

The compare slot picker uses `.btn.btn--secondary` with `justify-content: space-between` applied inline. Internal child classes `.dc-cmp-btn-name`, `.dc-cmp-btn-vs`, `.dc-cmp-btn-arrow` handle slot layout.

### Text Link

`.text-link` is for inline fragrance name links and quiz back/navigation — no border, no radius, underline only. It is **not** a button variant.

---

## Quiz Page

The standalone quiz page (`js/quiz.js`) uses the design system. Visual classes live in `styles/components.css` under `/* ── QUIZ PAGE ──`.

### What uses shared components

| Quiz element | Component |
|---|---|
| Answer options | `.quiz-ans-btn` (full-width serif card, `aria-selected`) |
| Result cards | `.quiz-result-card` (card + flex slots) |
| Archetype card | `.card` |
| Family pills | `.chip` with `style="background: ${color}; color: var(--bg-primary);"` |
| Section headings | `.sec-label` |
| More discovery links | `.text-link` |
| Back button | `.text-link` |
| Action row | `.btn-group` with `.btn--primary` / `.btn--secondary` |

### `injectStyles()` scope

Only contains chrome-hiding overrides (hides app nav, panels, sidebar). All visual styles are in `components.css`.

---

## Token Rules

### Typography
- **Baked-in Rule:** Generic content containers (`.banner`, `.card`, `.chip`, `.tag`) must not redefine typography. Apply `.text-title`, `.text-meta`, `.text-body`, or `.text-caption` to child elements.
- Buttons and interactive controls set their own typography internally via the `.btn` base.
- Font sizes via tokens only: `--fs-label` (12px), `--fs-caption` (12px), `--fs-meta` (14px), `--fs-body` (16px), `--fs-ui` (18px), `--fs-title` (24px), `--fs-heading` (32px)
- Font families: `var(--font-serif)` (Source Serif 4), `var(--font-sans)` (DM Sans), `var(--font-display)` (Archivo Black)

### Family Colors
- All 10 family accent tokens live in `design-system.css` as `--fam-{family}`.
- **Family chip:** plain `.chip` with `style="background: var(--fam-{x}); color: var(--bg-primary);"`. No variant class.

### Spacing
- All margins, paddings, and gaps must use the 4px grid tokens: `--sp-xs` (4px) → `--sp-4xl` (48px).
- **Parent-Managed Spacing:** Vertical spacing between sections MUST be handled by the parent's `gap`. No child `margin-top`.

---

## List Item Slot Contract

Every component rendering a name plus secondary text must use `.list-item` slot structure. Also used for selectable option lists (`role="option"`, `aria-selected`).

```
.list-item
  ├── .list-item-leading
  │     └── .list-item-dot        (indicator only, 8x8px)
  ├── .list-item-body
  │     ├── .list-item-label      (requires .text-ui-strong)
  │     ├── .list-item-sublabel   (requires .text-meta)
  │     └── .list-item-detail     (requires .text-caption)
  └── .list-item-trail
        ├── .list-item-badge
        └── .list-item-trailing-label
```

---

## Deprecated

Do not use in new code. Migrate to the components above.

| Old class | Replacement |
|-----------|-------------|
| `.dc-collect-btn` | `.btn.btn--secondary` |
| `.dc-cmp-btn` | `.btn.btn--secondary` + inline `justify-content: space-between` |
| `.s-name-btn` | `.text-link` |
| `.quiz-btn-primary` | `.btn.btn--primary` |
| `.quiz-btn-secondary` | `.btn.btn--secondary` |
| `.badge`, `.dc-badge` | `.chip` |
| `.landing-card`, `.notes-grid`, `.notes-card`, `.notes-card-header` | `.card`, `.grid`, `.list-item` |

---

## Pre-PR Checklist

- [ ] **No hardcoded colors** — semantic tokens only.
- [ ] **No magic numbers** — all spacing/sizing uses `--sp-*` tokens.
- [ ] **Parent-managed spacing** — no child `margin-top`; use parent `gap`.
- [ ] **List slot contract** — name/brand/desc text uses slot classes.
- [ ] **Touch targets ≥44px** — interactive elements meet `min-height: var(--touch-target)`.
- [ ] **No inline style for typography/color** — use class names for visual properties. Layout/structural inline styles are acceptable.
- [ ] **Button system** — use `.btn--primary` or `.btn--secondary`; no product-specific button classes.
- [ ] **Button groups** — sibling buttons wrapped in `.btn-group`; no manual `flex: 1` on individual buttons except one-off flex siblings.
