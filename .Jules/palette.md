## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2026-06-16 - Exposing Layering Math (Elias Metric)
**Learning:** Users (especially the Utilitarian Loyalist) lose trust when recommendations feel like a black box. Aggregate scores are not enough; the underlying math must be exposed to empower the user.
**Action:** Enhanced `scoreLayeringPair` to return a detailed breakdown (`famScore`, `sillScore`, `noteScore`) and updated the UI to display these individual metrics, satisfying the Elias Metric for transparency.
