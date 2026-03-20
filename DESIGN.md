# Scentmap — Design System Reference

This is the single source of truth for component inventory, token rules, and the pre-PR checklist. Every AI agent and engineer must read this before modifying any UI component.

---

## Component Inventory

| Component | CSS Class | File : Lines | Variants | Usage Rule |
|-----------|-----------|-------------|----------|------------|
| Section Label | `.sec-label` | `styles/layout.css:293` | — | All filter/section headings. Never use raw `font-size` or `text-transform` inline. |
| Tab / Filter Button | `.tab` | `styles/components.css:121` | `.tab.active` | All filter bars, state tabs, role tabs. Must have `aria-pressed`. |
| Search Input | `.cat-search-input` | `styles/components.css:672` | — | Catalog and notes search. Uses border-based focus (not ring). |
| Settings Menu Item | `.settings-menu-item` | `styles/components.css:72` | — | Dropdown nav items only. `min-height: var(--touch-target)`. |
| List Item | `.list-item` | `styles/components.css:829` | `--compact`, `--ghost`, `--search`, `--owned`, `--wish` | All catalog/saved/suggestion/search rows. Always use slot sub-element classes below. |
| ↳ Slot: inner wrapper | `.list-item-inner` | — | — | Wraps leading/body/trail. Handles padding + hover-bg transition. |
| ↳ Slot: leading | `.list-item-leading` | — | — | Holds dot or icon. flex, align-items:center, flex-shrink:0. |
| ↳ Slot: dot | `.list-item-dot` | — | — | 8px circle, background set via inline `style`. |
| ↳ Slot: icon | `.list-item-icon` | — | — | Emoji/glyph leading. 18px, text-tertiary. |
| ↳ Slot: body | `.list-item-body` | — | — | flex:1, min-width:0 text truncation container. |
| ↳ Slot: label | `.list-item-label` | — | — | Primary name. DM Sans, fs-body, 600, text-primary. |
| ↳ Slot: sublabel | `.list-item-sublabel` | — | — | Brand / category. Source Serif, fs-caption, 400, text-secondary. |
| ↳ Slot: detail | `.list-item-detail` | — | — | Notes / context. Source Serif, fs-caption, 400, text-tertiary. |
| ↳ Slot: trail | `.list-item-trail` | — | — | Trailing cluster: badge + score. |
| ↳ Slot: badge | `.list-item-badge` | — | — | State label (Owned, Wish). DM Sans, fs-caption, 600, text-tertiary. |
| ↳ Slot: score | `.list-item-score` | — | — | Similarity %. DM Sans, fs-meta, 700, accent-primary. |
| ↳ Slot: actions | `.list-item-actions` | — | — | Full-height action zone outside __inner. Buttons/CTAs. |
| List Shelf | `.list-shelf` | — | — | Column container with border + radius. Use instead of .dc-sim-shelf. |
| ⚠️ Deprecated | `.list-item--flat`, `.list-item--compact`, `.cmp-sug-card`, `.dc-sim-shelf`, `.list-item-content`, `.list-item-name`, `.list-item-sub`, `.list-item-meta` | — | — | Do not use in new code. Migrate to .list-item slot structure above. |
| Compare Frag Card | `.cmp-frag-card` | `styles/components.css:1800` | `.cmp-frag-card-name` (layout only), `.cmp-frag-card-brand` (layout only) | Compare slot picker buttons. Typography uses `.list-item-name` / `.list-item-sub` inside layout wrappers. Never inline padding on children. |
| Carousel Card | `.carousel-card` | `styles/components.css:3208` | `.carousel-card-name` (layout only), `.carousel-card-brand` (layout only), `.carousel-card-family` | Golden pairs, horizontal scrolling lists. Typography uses `.list-item-name` / `.list-item-sub` inside layout wrappers. No inline width/font overrides. |
| DNA Card | `.dna-card` | `styles/components.css:3748` | `.dna-grid`, `.dna-headline`, `.dna-sub`, `.dna-stats`, `.dna-bar`, `.dna-badge`, `.dna-notes` | Personalization summary on the You panel. Sub-elements defined for card layout only. |

---

## Token Rules

These rules are absolute. No exceptions without explicit discussion.

### Colors
- **Never** use raw hex (`#0E0C09`) or `rgb()`/`rgba()` — use semantic tokens (`var(--ink)`, `var(--text-primary)`, `var(--bg-secondary)`)
- **Never** use primitive tokens (`var(--g700)`) in component or layout CSS — semantic tokens only
- Use `var(--wish)` for wishlist/rose states, `var(--resin)` for owned/amber states

### Spacing
- All margins, paddings, and gaps must use the 4px grid tokens: `--sp-micro` (2px) → `--sp-4xl` (48px)
- **Never** write `margin: 16px` — write `margin: var(--sp-lg)`
- **Never** use magic numbers like `6px`, `15px`, `22px`
- **Parent-Managed Spacing:** Vertical spacing between sections in detail containers (`.detail-inner`, `.sheet-content`, `.note-popup`) MUST be handled by the parent's `gap` property. Do NOT add `margin-top` or `margin-bottom` to top-level children in these containers. If elements require tighter grouping, wrap them in a `div`.

### Typography
- Font sizes via tokens only: `--fs-label` (12px), `--fs-meta` (13px), `--fs-body` (15px), `--fs-title` (20px), `--fs-heading` (32px)
- Font families: `var(--font-serif)` (Source Serif 4), `var(--font-sans)` (DM Sans), `var(--font-display)` (Archivo Black)
- **Never** write `font-size: 14px` inline in JS template literals

### Border Radius
- Use scoped tokens: `--radius-micro` (2px), `--radius-sm` (4px), `--radius` (8px), `--radius-lg` (12px), `--radius-xl` (16px), `--radius-circle` (50%)
- **Never** use unscoped `var(--radius)` in new code — pick a specific scale value

### Interactive Elements
- **All** clickable/tappable controls must have `min-height: var(--touch-target)` (44px) — WCAG 2.5.5
- Applies to: `.tab`, `.settings-menu-item`, `.list-item`, `.cmp-frag-card`, any `<button>` or `role="button"` element

### Focus
- Global `:focus-visible` double ring is defined in `design-system.css` — **never** override with `outline: none` on a base style
- Input-style focus (border, no ring) allowed only via explicit `:focus-visible` override in the component

### Inline Styles in JS
- **Never** use `style="font-size: ..."`, `style="color: ..."`, `style="padding: ..."` in JS template literals
- Data-driven values are the only exception: `style="width: ${pct}%"` for bar fills, `style="--family-color: ${color}"` for dynamic color props
- If a component needs a visual variant, add a CSS modifier class (e.g. `.carousel-card--wide`) — not inline styles

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

#### Structure (Option B — Shell + Inner Wrapper)

```
.list-item [--compact | --ghost | --search]
  └── .list-item-inner          ← padding + hover-bg transition
        ├── .list-item-leading  ← flex-shrink: 0
        │     └── .list-item-dot  (or .list-item-icon)
        ├── .list-item-body     ← flex: 1; min-width: 0
        │     ├── .list-item-label
        │     ├── .list-item-sublabel
        │     └── .list-item-detail
        └── .list-item-trail    ← flex-shrink: 0
              ├── .list-item-badge
              └── .list-item-score
  └── .list-item-actions        ← outside __inner; full-height action zone
```

Container: `.list-shelf` (bordered column, replaces `.dc-sim-shelf`)

#### Locked Slot Typography

**Rule**: modifier classes (`--compact`, `--ghost`, `--search`) and state classes (`--owned`, `--wish`) may **never** override `font-size`, `font-weight`, `color`, or `line-height` on a slot. State is communicated through `.list-item-badge` only.

| Slot | Class | Font | Size | Weight | Color |
|---|---|---|---|---|---|
| Label | `.list-item-label` | `--font-sans` | `--fs-body` | 600 | `--text-primary` |
| Sublabel | `.list-item-sublabel` | `--font-serif` | `--fs-caption` | 400 | `--text-secondary` |
| Detail | `.list-item-detail` | `--font-serif` | `--fs-caption` | 400 | `--text-tertiary` |
| Badge | `.list-item-badge` | `--font-sans` | `--fs-caption` | 600 | `--text-tertiary` |
| Score | `.list-item-score` | `--font-sans` | `--fs-meta` | 700 | `--accent-primary` |

These values are immutable — no exceptions for any modifier or state class.

#### Separator rule

Use thin-space + middot + thin-space for all dot-separated strings in slot text:
```html
<span class="list-item-sublabel">Le Labo&thinsp;&middot;&thinsp;Woody</span>
```
Never use a plain space around `·`.

#### Variant guide

| Variant | Class | Use case | Replaces |
|---|---|---|---|
| Default | `.list-item` | Catalog rows, detail rows | `.list-item` (base) |
| Compact | `.list-item--compact` | Notes rows, quiz results, house rows | `.list-item--compact` (no DOM change) |
| Ghost | `.list-item--ghost` | Suggestion cards, search-in-shelf | `.list-item--flat` + `.cmp-sug-card` |
| Search | `.list-item--search` | Universal search modal rows | `.list-item--search` (no DOM change) |

#### Display heading exception

Detail panel headings (`.dc-name`, `.np-name`, `.cmp-frag-card-name`) are display-scale headings for full-bleed detail views — they are not list rows and do not use the slot contract. The test: **if it is inside a scrolling list or collection, use slots. If it is the main heading of a detail panel, use a display heading class.**

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
