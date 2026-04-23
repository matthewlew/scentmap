## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-05-14 - Search Input Placeholder Accessibility
**Learning:** Search input fields that rely solely on visual `placeholder` text (like `Search fragrances...`) do not reliably announce their purpose to screen readers, leaving visually impaired users without context for the input field.
**Action:** Always provide an explicit, descriptive `aria-label` for search and text inputs (e.g., `<input aria-label="Search fragrances">`) even when a visual placeholder is present.
