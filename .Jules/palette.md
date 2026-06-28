## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-03-21 - Accessible Search Input States
**Learning:** Dynamically updating a search input's `placeholder` text (e.g., when switching from "Search all" to "Search to compare") does not automatically announce the new purpose to screen readers.
**Action:** When modifying an input's `placeholder` dynamically via JavaScript, always simultaneously update its `aria-label` attribute to ensure screen readers remain synchronized with the input's current purpose.
