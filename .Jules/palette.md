## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-10-25 - Dynamic Input Label Synchronization
**Learning:** For standalone inputs where visual placeholders act as labels (e.g. `placeholder="Search..."`), providing a static `aria-label` isn't enough when JavaScript dynamically updates the `placeholder`. Screen readers will get out of sync with the visual state.
**Action:** When creating or modifying inputs relying on placeholders, explicitly set `aria-label`, and if the `placeholder` updates dynamically, always use `input.setAttribute('aria-label', newText)` synchronously with `input.placeholder = newText`.
