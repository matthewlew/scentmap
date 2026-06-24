## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-06-24 - Input Placeholders and ARIA Labels
**Learning:** Screen readers do not reliably announce `placeholder` text as a label. Search inputs that use only a visual placeholder without a dedicated `<label>` element must have an explicit `aria-label` attribute.
**Action:** When creating or modifying an input element's `placeholder`, always ensure it has a corresponding `aria-label` attribute. If the `placeholder` is updated dynamically via JavaScript, simultaneously update the `aria-label` using `setAttribute('aria-label', ...)`.
