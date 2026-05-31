## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-05-31 - [Elias: Layering UI Transparency]
**Learning:** Utilitarian users (like Elias) distrust aggregate scores without underlying mathematical breakdowns. The single layering score lacks transparency regarding family compatibility, sillage difference, and note overlap.
**Action:** Implemented `getLayeringDetails` and `getSimilarityDetails` in `js/engine.js` to return breakdown objects. Updated `js/app.js` to display these details.
