## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2026-03-20 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Multiple utility icon-only buttons (like '✕' for clearing search/removing items, or '⤓' for exporting) lacked `aria-label` attributes, leaving screen reader users without context. This is a common pattern in the codebase that needs to be actively monitored, particularly for dynamically generated elements in JavaScript.
**Action:** When creating new components or using existing utility buttons (like `.settings-btn` or `.cat-search-clear`), always include an explicit `aria-label` to describe the action.
