## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-03-24 - Dynamic Input Placeholder ARIA State Management
**Learning:** Placeholders provide visual hints but do not reliably announce their purpose to screen readers. When an input's `placeholder` is updated dynamically via JavaScript, the accessible name can fall out of sync if an `aria-label` isn't updated alongside it.
**Action:** When updating an input element's `placeholder` dynamically via JavaScript, always simultaneously update its `aria-label` attribute using `setAttribute('aria-label', ...)` to ensure screen readers remain synchronized with the input's current purpose.
