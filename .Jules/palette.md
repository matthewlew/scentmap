## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-06-25 - ARIA Labels for Search Inputs
**Learning:** Text inputs that rely solely on visual `placeholder` attributes (like the search inputs across the site) do not consistently announce their purpose to screen reader users. The placeholder text often disappears upon focusing or typing, leaving users without context.
**Action:** Always provide an explicit `aria-label` that mirrors or elaborates on the placeholder text for any input field that lacks a visible `<label>` element, ensuring clear and persistent context for screen readers.
