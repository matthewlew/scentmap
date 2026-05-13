## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2026-05-13 - Input ARIA State Synchronization
**Learning:** When dynamic input elements use javascript to modify their `placeholder` text (such as switching search modes), screen readers will not announce this purpose change if the `placeholder` is the only visual context. We must explicitly bind and sync `aria-label` to the input's current visual representation.
**Action:** If a script modifies `input.placeholder = ...`, immediately follow it with `input.setAttribute('aria-label', ...)` to ensure visual text and screen reader announcements remain synchronized.
