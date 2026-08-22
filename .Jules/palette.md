## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2026-08-22 - Dynamic Input Placeholder ARIA Sync
**Learning:** When dynamically updating an input's `placeholder` via JavaScript, screen readers relying on `aria-label` will fall out of sync if the ARIA attribute is not updated simultaneously. Placeholders are visually helpful but are unreliable or insufficient for accessibility on their own.
**Action:** When modifying an input's `placeholder` dynamically, always set `input.setAttribute('aria-label', ...)` to match or expand upon the placeholder text, ensuring screen readers receive the correct, up-to-date context.
