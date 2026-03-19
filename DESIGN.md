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
| List Item (full) | `.list-item` | `styles/components.css:812` | `--compact`, `--flat`, `--search`, `--owned`, `--wish` | Standard catalog/saved rows. Always use sub-element classes below. |
| ↳ Sub-elements | `.list-item-name`, `.list-item-body`, `.list-item-sub`, `.list-item-meta`, `.list-item-icon`, `.list-item-trail`, `.list-item-badge`, `.list-item-score` | `styles/components.css:1474–1545` | — | Never inline font-size/color on these. |
| List Item — Compact | `.list-item--compact` | `styles/components.css:940` | — | Notes rows, quiz results, house detail rows. |
| List Item — Flat | `.list-item--flat` | `styles/components.css:924` | — | Compare suggestion cards. Transparent bg, no border. |
| List Item — Search | `.list-item--search` | `styles/components.css:959` | — | Universal search result rows only. |
| Compare Frag Card | `.cmp-frag-card` | `styles/components.css:1800` | `.cmp-frag-card-name`, `.cmp-frag-card-brand` | Compare slot picker buttons. Never inline padding on children. |
| Carousel Card | `.carousel-card` | `styles/components.css:3208` | `.carousel-card-name`, `.carousel-card-brand`, `.carousel-card-family` | Golden pairs, horizontal scrolling lists. No inline width/font overrides. |
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

## Pre-PR Checklist

Run through this before every commit that touches UI:

- [ ] **No hardcoded colors** — Inspect Element on modified components; confirm all colors show as `var(--*)` in DevTools
- [ ] **No magic numbers** — all spacing/sizing uses `--sp-*` or `--radius-*` tokens
- [ ] **Parent-managed spacing** — Detail views use `gap` instead of child `margin` for section spacing
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
