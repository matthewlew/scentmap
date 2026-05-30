## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.

## 2025-02-12 - Inputs relying on visual placeholders
**Learning:** Screen readers do not reliably announce the placeholder text of `input` elements, meaning that `input` elements utilizing solely `placeholder` for visual context lack accessibility.
**Action:** Always provide an explicit `aria-label` synchronized to the placeholder string. If the `placeholder` updates dynamically, simultaneously call `setAttribute('aria-label', ...)` to keep them matching.
