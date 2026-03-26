## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2026-03-26 - Syncing ARIA attributes with visual states
**Learning:** When using custom tab groups and active classes (like .active), it is essential to synchronize the visual state with ARIA attributes (e.g., aria-pressed) for screen reader accessibility.
**Action:** Always pair class toggling (.active) with setting semantic attributes (aria-pressed or aria-selected) on custom interactive elements.
