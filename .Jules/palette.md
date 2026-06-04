## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-03-24 - Dynamic Input Placeholders Need ARIA Sync
**Learning:** When using input fields that rely solely on `placeholder` text for context, screen readers might not announce their purpose reliably. Furthermore, when the `placeholder` is updated dynamically by JavaScript based on context (e.g., universal search vs. compare search), the `aria-label` must be explicitly synchronized.
**Action:** Ensure all visual `placeholder` elements have a static or dynamically matching `aria-label` attribute applied concurrently via `setAttribute`.
