# Scentmap — Design System Reference

This is the single source of truth for component inventory, token rules, and the pre-PR checklist. Every AI agent and engineer must read this before modifying any UI component.

---

## Component Inventory

| Component | CSS Class | File : Lines | Variants | Usage Rule |
|-----------|-----------|-------------|----------|------------|
| Section Label | `.sec-label` | `styles/layout.css:293` | — | All filter/section headings. Never use raw `font-size` or `text-transform` inline. |
| Tab / Filter Button | `.tab` | `styles/components.css:121` | `.tab.active` | All filter bars, state tabs, role tabs. Must have `aria-pressed`. |
| Search Input | `.cat-search-input` | `styles/components.css:657` | — | Catalog and notes search. Global focus ring applies. |
| Settings Menu Item | `.settings-menu-item` | `styles/components.css:72` | — | Dropdown nav items only. `min-height: var(--touch-target)`. |
| Button | `.btn` | `styles/components.css` | `.btn.active`, `.btn--spread` | All action buttons and CTA links. `.btn.active` = filled dark state (owned/saved). `.btn--spread` = full-width with space-between (compare slot, buy links). |
| ↳ Button icon | `.btn-icon` | — | — | Leading icon inside `.btn`. fs-body size. |
| ↳ Button row | `.btn-row` | — | — | Flex row container for a group of `.btn` elements. gap: sp-sm. |
| ↳ Button stack | `.btn-stack` | — | — | Flex column container for stacked `.btn` elements. gap: sp-xs. |
| ↳ Link button | `.link-btn` | — | — | Text-only ghost button (no border, no bg). Cursor pointer, color transition on hover. Use for inline brand/name links. |
| Panel Title | `.panel-title` | `styles/components.css` | — | Large display heading (Archivo Black, fs-heading) for any detail or full-panel view. |
| Panel Eyebrow | `.panel-eyebrow` | `styles/components.css` | — | Small caps label above or below a panel title. DM Sans, fs-meta, uppercase, letter-spaced. |
| Eyebrow | `.eyebrow` | `styles/components.css` | — | Section-level eyebrow label. DM Sans, fs-meta, uppercase. |
| Callout | `.callout` | `styles/components.css` | — | Tinted block quote / story box. bg-secondary, border-subtle, rounded. |
| Description | `.description` | `styles/components.css` | — | Body-length descriptive text. fs-body, text-secondary. |
| Badge | `.badge` | `styles/components.css` | `.badge.contrasts`, `.badge.complements` | Small label chip. DM Sans, fs-meta, 600. Variants for relationship type. |
| State Badge | `.state-badge` | `styles/components.css` | `.is-owned` | Inline status indicator (Owned, etc). bg-tertiary when owned. |
| Tag | `.tag` | `styles/components.css` | `.tag.shared` | Note/keyword pill. Use for note names on compare grids, note detail rows. `.tag.shared` = highlighted shared note. |
| Divider | `.divider` | `styles/components.css` | — | 1px horizontal rule. bg-border-standard. |
| Metric Bar | `.bar` | `styles/components.css` | — | 2px height track for numeric scores. Always paired with `.bar-fill` inside. |
| ↳ Bar fill | `.bar-fill` | — | — | Filled portion of `.bar`. Width set via `style="width: ${pct}%"` (data-driven exception). |
| ↳ Bar label | `.bar-label` | — | — | Value label below a `.bar` (e.g. "7 / 10"). fs-meta, text-secondary. |
| Stat Grid | `.stat-grid` | `styles/components.css` | — | 2-col grid of `.stat-card` elements. |
| Stat Card | `.stat-card` | `styles/components.css` | — | Individual metric cell. bg-tertiary, rounded, padding sm/md. |
| Note Row | `.note-row` | `styles/components.css` | — | Flex row in the notes pyramid (Top / Mid / Base). Border-bottom separator. |
| ↳ Note tier | `.note-tier` | — | — | Tier label (TOP / MID / BASE). 40px fixed-width, DM Sans, uppercase. |
| ↳ Note values | `.note-values` | — | — | Flex-wrap chip container for note names within a tier row. |
| Card Body | `.card-body` | `styles/components.css` | — | Flex-column body content of a similarity/card row. flex:1, min-width:0. |
| Card Title | `.card-title` | `styles/components.css` | — | Primary name text in a card. fs-body, 500, text-primary. |
| Card Subtitle | `.card-subtitle` | `styles/components.css` | — | Secondary text in a card. text-secondary, 400. |
| Card Meta | `.card-meta` | `styles/components.css` | — | Tertiary meta line in a card. fs-meta, text-secondary. |
| Chip Row | `.chip-row` | `styles/components.css` | — | Flex-wrap row of `.chip` elements. gap: sp-xs. |
| Label | `.label` | `styles/components.css` | — | Small inline label. fs-meta, 600, text-secondary. |
| State Wrap | `.state-wrap` | `styles/components.css` | — | Wrapper for the owned/wish state tab bar. Excluded from global tab deactivation. |
| Compare Frag Card | `.cmp-frag-card` | `styles/components.css:1800` | — | Compare slot picker buttons. Layout-only wrapper — typography uses `.panel-title` / `.panel-eyebrow` inside. |
| ↳ Slot name | `.slot-name` | — | `.slot-name--empty` | Truncated fragrance name inside compare slot. `.slot-name--empty` = placeholder state. |
| ↳ Slot vs | `.slot-vs` | — | — | "vs" divider label between slot names. |
| ↳ Slot arrow | `.slot-arrow` | — | — | Trailing arrow indicator on compare slot button. |
| ↳ Slot inner | `.slot-inner` | — | — | Inner flex wrapper for slot content alignment. |
| Carousel Card | `.carousel-card` | `styles/components.css:3208` | `.carousel-card--wide` | Golden pairs and discovery carousels. No inline width/font overrides. |
| DNA Card | `.dna-card` | `styles/components.css:3748` | `.dna-grid`, `.dna-headline`, `.dna-sub`, `.dna-stats`, `.dna-bar`, `.dna-badge`, `.dna-notes` | Personalization summary. Sub-elements for card layout only. |
| Dot Indicator | `.dot` | `styles/components.css` | `.dot--md` | 8px color circle. `.dot--md` = 10px. Background via `style="background: var(--fam-woody)"`. Never create component-specific dot classes. |
| ⚠️ Deprecated | `.list-item--compact`, `.list-item--flat`, `.cmp-sug-card`, `.dc-sim-shelf`, `.list-item-content`, `.list-item-name`, `.list-item-sub`, `.list-item-meta`, all `dc-*` classes | — | — | Do not use. All `dc-` prefixed classes have been renamed to generic equivalents — see table above. |

---

## Token Rules

These rules are absolute. No exceptions without explicit discussion.

### Colors
- **Never** use raw hex (`#0E0C09`) or `rgb()`/`rgba()` — use semantic tokens (`var(--ink)`, `var(--text-primary)`, `var(--bg-secondary)`)
- **Never** use primitive tokens (`var(--g700)`) in component or layout CSS — semantic tokens only
- Use `var(--wish)` for wishlist/rose states, `var(--resin)` for owned/amber states

### Family Colors
- All 10 family accent tokens live in `design-system.css` as `--fam-{family}` (woody, floral, amber, citrus, leather, oud, green, chypre, gourmand, default).
- Each has a paired `--fam-{family}-subdued` computed via `color-mix(in srgb, var(--fam-{family}) 18%, var(--paper))` — opacity-derived, never hand-picked.
- In JS, use `getCmpFam(family)` → `{accent, accentHex, subdued}`. Use `accent` (CSS var string) in HTML `style=""` attributes; use `accentHex` (raw hex via `getComputedStyle`) for Canvas 2D or SVG presentation attributes which cannot resolve CSS variables.
- **Never** hardcode family hex values in JS. The old `CMP_FAM` object has been deleted.

### Spacing
- All margins, paddings, and gaps must use the 4px grid tokens: `--sp-xs` (4px) → `--sp-4xl` (48px)
- `--sp-micro: 2px` is an **optical-only** exception below the grid. Use only for fine alignment nudges (e.g. `margin-top: var(--sp-micro)` on an icon to optically center against text). **Never** use for layout spacing.
- **Never** write `margin: 16px` — write `margin: var(--sp-lg)`
- **Never** use magic numbers like `6px`, `15px`, `22px`
- **Parent-Managed Spacing:** Vertical spacing between sections in detail containers (`.detail-inner`, `.sheet-content`, `.note-popup`) MUST be handled by the parent's `gap` property. Do NOT add `margin-top` or `margin-bottom` to top-level children in these containers. If elements require tighter grouping, wrap them in a `div`.

### Typography
- Font sizes via tokens only: `--fs-label` (12px), `--fs-caption` (12px), `--fs-body-sm` (13px), `--fs-meta` (14px), `--fs-body` (16px), `--fs-ui` (18px), `--fs-title` (24px), `--fs-heading` (32px)
- Font families: `var(--font-serif)` (Source Serif 4), `var(--font-sans)` (DM Sans), `var(--font-display)` (Archivo Black)
- **Never** write `font-size: 14px` inline in JS template literals
- Use `var(--link-underline-offset)` (3px) for `text-underline-offset` — never hardcode
- **No italics** — `font-style: italic` is not accessible (reduced legibility for low-vision users and some dyslexic readers). Never apply `font-style: italic` in any CSS class, inline style, or JS template literal. Use the generic type styles set by the design system; do not add ad-hoc styling to communicate emphasis or mood.

### Border & Border Radius
- Border widths: `var(--border-width)` (1px) for standard borders; `var(--border-width-heavy)` (3px) for data surfaces (compare cards, score meters, metric bars) where visual weight is intentional.
- Use scoped radii: `--radius-micro` (2px), `--radius-small` (3px), `--radius-sm` (5px), `--radius` (6px), `--radius-lg` (8px), `--radius-xl` (10px), `--radius-pill` (20px), `--radius-circle` (50%)
- **Never** hardcode border widths like `1.5px` or `2px` — pick from the token scale

### Interactive Elements
- **All** clickable/tappable controls must have `min-height: var(--touch-target)` (44px) — WCAG 2.5.5
- Applies to: `.tab`, `.settings-menu-item`, `.list-item`, `.cmp-frag-card`, any `<button>` or `role="button"` element

### Focus
- Global `:focus-visible` in `design-system.css` is the **single canonical focus pattern**: double box-shadow (paper gap + resin ring). **Never** override with `outline: none` on a base style, and never add per-component focus overrides that replace the ring with a border-swap or inset-outline.
- The only exception: elements where a visible border is the primary interactive affordance may suppress the box-shadow and set `border-color` instead — but this must be documented per-component and not used for lists or general controls.

### Inline Styles in JS
- **Never** use `style="font-size: ..."`, `style="color: ..."`, `style="padding: ..."` in JS template literals
- Data-driven values are the only exception: `style="width: ${pct}%"` for bar fills, `style="background: var(--fam-${f})"` for dynamic family color props
- If a component needs a visual variant, add a CSS modifier class (e.g. `.carousel-card--wide`) — not inline styles

### Dot Indicators
- Use `.dot` (8px circle, `var(--radius-circle)`, `flex-shrink: 0`) for all inline family/color indicator dots.
- Use `.dot--md` (10px) for larger picker-row dots.
- Set background color via inline `style="background: var(--fam-woody)"` (data-driven exception).
- **Never** create component-specific dot classes (`.fam-dot`, `.nf-dot`, etc.). All legacy names have been removed.

---

## Visual Composition Rules

These rules govern how components are assembled into screens. They answer the three most common consistency questions: how cards work, how sections are spaced, and how list text is typed.

---

### Card Taxonomy

**The rule: the parent surface color determines whether a card uses a border.**

Contrast alone separates a card from its background when the surfaces differ. A border only becomes necessary when they are too similar to separate visually.

| Situation | Card background | Border | Padding | Border radius |
|---|---|---|---|---|
| Card sits on `--bg-primary` (white page bg) | `--bg-secondary` | **None** — contrast does the work | `var(--sp-lg)` (16px) | `var(--radius-lg)` (12px) |
| Card sits on `--bg-secondary` (off-white) | `--bg-primary` | `1px solid var(--border-standard)` | `var(--sp-lg)` (16px) | `var(--radius-lg)` (12px) |
| Interactive / clickable card | `--bg-primary` | `1px solid var(--border-subtle)` + hover: `--border-strong` | `var(--sp-lg)` (16px) | `var(--radius-lg)` (12px) |

**Additional card rules:**
- Internal section spacing within a card: `gap: var(--sp-md)` (12px) on the flex container
- Use `var(--radius-xl)` (16px) only for large hero/feature cards — not standard content cards
- **Never** mix `margin-bottom` on card children with `gap` on the card itself — pick one approach, always prefer `gap`

---

### Section Spacing

**The rule: sections are spaced by the parent's `gap`, never by the child's `margin`.**

A section is a top-level block within a panel, sheet, or detail container. The parent flex container sets `gap: var(--sp-2xl)` (24px) and children carry no `margin-top` or `margin-bottom`. This makes re-ordering sections safe and keeps spacing source-of-truth in one place.

**Section spacing hierarchy:**

| Scale | Token | Value | Use |
|---|---|---|---|
| Between major panel sections | `--sp-2xl` | 24px | Parent `gap` in `.detail-inner`, `.sheet-content`, `.cmp-results` |
| Between items within a section | `--sp-md` | 12px | Parent `gap` in cards, info blocks |
| Between tightly grouped label + value pairs | `--sp-xs` | 4px | Parent `gap` in stat rows, meta lines |

**Section header (`.sec-label`) rule:** do not add `margin-bottom` to `.sec-label` itself. Group the section label and its content inside a `<div>` with `display: flex; flex-direction: column; gap: var(--sp-md)` so the parent's `gap` separates sections, and the internal gap separates the label from the content below it.

**Containers that must use `gap` (never child margins):**
`.detail-inner`, `.sheet-content`, `.note-popup`, `.cmp-results`, any panel child layout container.

---

### List Item Slot Contract

Every component that renders a name plus secondary text **must** use the `.list-item` slot structure. Do not invent per-component text class equivalents (e.g. `.dc-name`, `.nf-name`, `.cmp-frag-card-name`).

#### Structure

```
.list-item [--compact | --search]
  ├── .list-item-leading  ← flex, align-items: center, flex-shrink: 0
  │     ├── .list-item-dot    (background set via inline style — data-driven exception)
  │     └── .list-item-icon   (emoji/glyph alternative to dot)
  ├── .list-item-body     ← flex: 1; min-width: 0
  │     ├── .list-item-label
  │     ├── .list-item-sublabel
  │     └── .list-item-detail
  └── .list-item-trail    ← flex-shrink: 0
        ├── .list-item-badge
        └── .list-item-trailing-label
```

#### Locked Slot Typography

**Rule**: modifier classes (`--compact`, `--ghost`, `--search`) and state classes (`--owned`, `--wish`) may **never** override `font-size`, `font-weight`, `color`, or `line-height` on a slot. State is communicated through `.list-item-badge` only.

| Slot | Class | Font | Size | Weight | Color |
|---|---|---|---|---|---|
| Label | `.list-item-label` | `--font-sans` | `--fs-body` | 600 | `--text-primary` |
| Sublabel | `.list-item-sublabel` | `--font-serif` | `--fs-caption` | 400 | `--text-secondary` |
| Detail | `.list-item-detail` | `--font-serif` | `--fs-caption` | 400 | `--text-tertiary` |
| Badge | `.list-item-badge` | `--font-sans` | `--fs-caption` | 600 | `--text-tertiary` |
| Trailing label | `.list-item-trailing-label` | `--font-sans` | `--fs-meta` | 700 | `--accent-primary` |

These values are immutable — no exceptions for any modifier or state class.

#### Separator rule

Use thin-space + middot + thin-space for all dot-separated strings in slot text:
```html
<span class="list-item-sublabel">Le Labo&thinsp;&middot;&thinsp;Woody</span>
```
Never use a plain space around `·`.

#### Variant guide

| Variant | Class | Use case |
|---|---|---|
| Default | `.list-item` | Catalog rows, notes rows, quiz results, house rows — compact padding is the default |
| Search | `.list-item--search` | Universal search modal rows |

#### Display heading exception

Detail panel headings (`.panel-title`, `.panel-eyebrow`, `.card-title`) are display-scale headings for full-bleed detail views — they are not list rows and do not use the slot contract. The test: **if it is inside a scrolling list or collection, use slots. If it is the main heading of a detail panel, use a display heading class.**

---

## Pre-PR Checklist

Run through this before every commit that touches UI:

- [ ] **No hardcoded colors** — Inspect Element on modified components; confirm all colors show as `var(--*)` in DevTools
- [ ] **No magic numbers** — all spacing/sizing uses `--sp-*` or `--radius-*` tokens
- [ ] **Parent-managed spacing** — Detail views and cards use `gap` instead of child `margin` for section spacing; use `gap: var(--sp-2xl)` between major sections
- [ ] **Card taxonomy followed** — cards on `--bg-primary` use `--bg-secondary` + no border; cards on `--bg-secondary` use `--bg-primary` + `--border-standard`; interactive cards use `--border-subtle` + hover `--border-strong`
- [ ] **List slot contract** — name/brand/desc text uses `.list-item-label` / `.list-item-sublabel` / `.list-item-detail`; no per-component text class equivalents; no modifier/state class overrides slot typography
- [ ] **Touch targets ≥44px** — interactive elements have `min-height: var(--touch-target)`
- [ ] **No inline style for typography/color** — JS template literals use class names, not style attributes for visual properties
- [ ] **No italics** — `font-style: italic` must not appear anywhere in new or modified CSS/JS; use design system type styles only
- [ ] **New components documented** — if you added a new CSS class, add it to the Component Inventory table above

---

## Accessibility Personas

Every UI decision should be tested against at least one of these personas:

### Nadia, 28 — Low Vision, Keyboard-First
- Visual acuity: 20/80 corrected. Uses keyboard Tab/Enter/Space for all navigation. Relies on focus rings and screen reader announcements.
- **Drives:** Global `:focus-visible` double ring system; `#cat-live` aria-live region; `min-height: var(--touch-target)` on all interactive elements; `aria-pressed` on filter tabs; `aria-label` on icon-only buttons.

### Miguel, 59 — Essential Tremor / Arthritis
- Imprecise cursor and touch input. Fat-finger taps. Cannot reliably swipe.
- **Drives:** `min-height: var(--touch-target)` (44px); `.tab:hover` background fill for visual confirmation; swipe actions disabled on desktop (`@media (hover: none)`); adequate spacing between tap targets.
