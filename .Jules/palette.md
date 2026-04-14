## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2026-04-14 - Icon-Only Buttons in JS Template Literals
**Learning:** Symbol-only buttons dynamically generated via JS template literals (e.g. `✕` or `⤓` in string templates) are often overlooked for ARIA labels because they aren't static HTML. These buttons will be read as meaningless symbols (like "Multiplication X") by screen readers unless explicitly labelled.
**Action:** Always scan for `<button` inside JavaScript string templates (e.g. in `.innerHTML` assignments) to ensure icon-only buttons receive a clear, descriptive `aria-label` attribute alongside the rest of the HTML structure.
