## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-03-24 - Icon-only button ARIA labels in dynamic HTML
**Learning:** Icon-only buttons rendered dynamically via JavaScript template literals (like delete or export buttons) often miss accessibility attributes compared to static HTML.
**Action:** When implementing utility icon-only buttons (like `.settings-btn` containing symbols like '✕' or '⤓') inside JS strings, always explicitly include an `aria-label` to describe the action for screen readers.
