## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.

## 2025-01-20 - Placeholder Text as Accessible Label
**Learning:** Adding a placeholder text is often insufficient for screen readers as they may not correctly announce it, or the placeholder might disappear when the user begins typing, leaving no accessible label for the input.
**Action:** Always provide an explicit, descriptive `aria-label` for search and text inputs that rely solely on visual `placeholder` text (e.g., .input or .input--inline), as placeholders do not reliably announce their purpose to screen readers. Ensure dynamic placeholders update the aria-label as well.
