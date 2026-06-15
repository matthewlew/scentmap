## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.

## 2026-06-15 - Expose Layering Math Transparency
**Learning:** Elias (The Utilitarian Loyalist) found the layering recommendation score to be a "black box," lacking transparency into why two fragrances were matched (e.g., contrasting notes vs. sillage difference). Providing just a percentage match without exposing the underlying criteria breeds distrust.
**Action:** Modified `scoreLayeringPair` to return a detailed breakdown object containing individual sub-scores (`famScore`, `sillScore`, `noteScore`) and updated the "Layer Together" Golden Pairs UI to display these exact numbers as small tags, providing transparent "math" behind the recommendation. Removed `_layCache` to prevent mutation bugs.
