# Scentmap — Design System Reference

This is the single source of truth for component inventory, token rules, and the pre-PR checklist. Every AI agent and engineer must read this before modifying any UI component.

---

## Component Inventory

| Component | CSS Class | File : Lines | Variants | Usage Rule |
|-----------|-----------|-------------|----------|------------|
| Section Label | `.sec-label` | `styles/layout.css` | — | All filter/section headings. Never use raw `font-size` or `text-transform` inline. |
| Banner | `.banner` | `styles/components.css` | — | Hero CTAs (e.g. Journal prompt). Use `.banner-head` for layout. Typography must use `.text-title` and `.text-meta`. |
| Card | `.card` | `styles/components.css` | `.card--secondary`, `.card--interactive` | Standard container. No explicit internal margins; use `gap: var(--sp-md)`. |
| Chip | `.chip` | `styles/components.css` | `.chip--family`, `.chip--accent`, `.chip--xs`, `.chip--outline` | Pill-shaped status/category labels. Replaces legacy `.badge`. Always height: 24px (18px for `--xs`). |
| Tag | `.tag` | `styles/components.css` | `.tag.shared` | Rectangular metadata labels (e.g. notes directory). Typography must use `.text-meta`. |
| Grid | `.grid` | `styles/components.css` | — | Auto-filling responsive grid (`minmax(280px, 1fr)`). Use for directory views. |
| Shelf | `.list-view` | `styles/components.css` | — | Vertical list of `.list-item` with separators. |
| Tab / Filter Button | `.tab` | `styles/components.css` | `.tab.active` | All filter bars, state tabs, role tabs. Must have `aria-pressed`. |
| List Item | `.list-item` | `styles/components.css` | `--compact`, `--truncate`, `--search`, `--owned`, `--wish` | All catalog/saved/suggestion/search rows. Always use slot sub-element classes below. |
| ↳ Slot: leading | `.list-item-leading` | — | — | Holds dot or icon. flex, align-items:center, flex-shrink:0. |
| ↳ Slot: dot | `.list-item-dot` | — | — | Layout container for leading dot or icon (18px default, 8px compact). Place a `.dot` inside it for the color indicator. |
| ↳ Slot: body | `.list-item-body` | — | — | flex:1, min-width:0. Allows wrapping by default unless parent has `--truncate`. |
| ↳ Slot: label | `.list-item-label` | — | — | Primary name. DM Sans, fs-body, 600, text-primary. |
| ↳ Slot: sublabel | `.list-item-sublabel` | — | — | Brand / category. Source Serif, fs-caption, 400, text-secondary. |
| ↳ Slot: detail | `.list-item-detail` | — | — | Notes / context. Source Serif, fs-caption, 400, text-tertiary. |
| ↳ Slot: trail | `.list-item-trail` | — | — | Trailing cluster: chip + score. |
| ⚠️ Deprecated | `.badge`, `.dc-badge`, `.landing-card`, `.notes-grid`, `.notes-card`, `.notes-card-header`, `.cmp-note-pill` | — | — | Do not use in new code. Migrate to generic components above. |

---

## Token Rules

### Typography
- **Baked-in Rule:** Generic components (`.banner`, `.card`, `.chip`, `.tag`) should not redefine typography. Apply `.text-title`, `.text-meta`, `.text-body`, or `.text-caption` directly to the HTML elements within the component.
- Font sizes via tokens only: `--fs-label` (12px), `--fs-caption` (12px), `--fs-body-sm` (13px), `--fs-meta` (14px), `--fs-body` (16px), `--fs-ui` (18px), `--fs-title` (24px), `--fs-heading` (32px)
- Font families: `var(--font-serif)` (Source Serif 4), `var(--font-sans)` (DM Sans), `var(--font-display)` (Archivo Black)

### Family Colors
- All 10 family accent tokens live in `design-system.css` as `--fam-{family}`.
- **Subdued Chip Pattern:** Use `style="--fam-bg: ${fm.color}20; --fam-color: ${fm.color};"` on `.chip--family` for a consistent tinted background.

### Spacing
- All margins, paddings, and gaps must use the 4px grid tokens: `--sp-xs` (4px) → `--sp-4xl` (48px)
- **Parent-Managed Spacing:** Vertical spacing between sections in detail containers MUST be handled by the parent's `gap` property.

---

### List Item Slot Contract

Every component that renders a name plus secondary text **must** use the `.list-item` slot structure.

#### Structure

```
.list-item [--compact | --search | --truncate]
  ├── .list-item-leading
  │     ├── .list-item-dot
  │     └── .list-item-icon
  ├── .list-item-body
  │     ├── .list-item-label
  │     ├── .list-item-sublabel
  │     └── .list-item-detail
  └── .list-item-trail
        ├── .list-item-chip
        └── .list-item-trailing-label
```

#### Wrapped vs Truncated Sublabels
- **Default:** `.list-item-sublabel` wraps to ensure full text is visible (e.g. Note Detail, Directory).
- **Truncated:** Add `.list-item--truncate` to the parent `.list-item` for single-line truncation with ellipsis (e.g. Catalog lists, Search).

---

## Pre-PR Checklist

- [ ] **No hardcoded colors** — semantic tokens only.
- [ ] **No magic numbers** — all spacing/sizing uses tokens.
- [ ] **Parent-managed spacing** — cards use `gap` instead of child `margin`.
- [ ] **List slot contract** — name/brand/desc text uses slot classes.
- [ ] **Touch targets ≥44px** — interactive elements have `min-height: var(--touch-target)`.
- [ ] **No inline style for typography/color** — use class names for visual properties.
