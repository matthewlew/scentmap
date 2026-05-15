## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-05-18 - Input aria-label and dynamic placeholder sync
**Learning:** Screen readers do not reliably announce placeholders for text inputs, so an `aria-label` is always required. When placeholders are dynamically updated via JS (e.g. changing from general search to a specific context), the `aria-label` must also be synchronized simultaneously using `setAttribute`.
**Action:** Always provide an explicit `aria-label` for inputs that rely on visual placeholders, and manually sync `aria-label` whenever dynamically altering a placeholder property via JS.
