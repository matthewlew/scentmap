## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-05-02 - Dynamic Placeholder ARIA Sync
**Learning:** When modifying an input's `placeholder` attribute dynamically via JavaScript (e.g., swapping between 'Search to compare' and 'Search all'), screen readers often do not announce the new placeholder text, leading to context loss.
**Action:** When dynamically updating a `placeholder`, always simultaneously update the input's `aria-label` attribute using `setAttribute` to ensure the screen reader context remains perfectly synchronized with the visual UI state.
