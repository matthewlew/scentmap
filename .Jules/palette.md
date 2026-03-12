## Scentmap UX Journal

## 2024-05-24 - Accessible Menu Toggles
**Learning:** Adding `aria-label` to icon-only buttons isn't enough when the button toggles a menu or popup. Screen readers won't know it's a menu toggle without `aria-haspopup` and `aria-expanded` attributes. A static `aria-expanded` doesn't work either; it must be updated dynamically when the element is toggled to keep screen readers properly informed.
**Action:** When creating toggleable popup menus or dropdowns, ensure the toggle button has `aria-haspopup="true"` and an `aria-expanded` attribute that is dynamically updated via JavaScript to reflect the actual visibility state of the menu (e.g., when clicking outside or making a selection).
## 2026-03-12 - Feng Shui UI Spacing
**Learning:** Feng Shui principles (breathing room, guiding flow, reduced clutter) perfectly map to concrete UI adjustments: increasing padding/margins around dense data (notes grids, detail text) and balancing component sizes (compare cards on mobile) significantly improves visual harmony and reduces user overwhelm without removing functional elements.
**Action:** When asked to address information density or 'clutter', prioritize adjusting whitespace (padding, margin, line-height) and responsive breakpoints in the CSS before considering removing data.
