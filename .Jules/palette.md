## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-03-24 - Input Placeholder Accessibility
**Learning:** Placeholders alone are insufficient for screen readers and do not reliably announce the purpose of an input field. When modifying an input's `placeholder` dynamically via JS, screen readers can fall out of sync.
**Action:** Always provide an explicit, descriptive `aria-label` for search and text inputs that rely solely on visual `placeholder` text. Furthermore, when dynamically updating the `placeholder` property in JS, simultaneously update its `aria-label` attribute to ensure screen readers remain synchronized.
