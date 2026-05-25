## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-10-24 - Emoji Rating Accessibility
**Learning:** Raw emojis on rating scale buttons (e.g., 🙁, 😐, 😍) are read inconsistently by screen readers and don't communicate the scale or purpose (e.g., "frowning face" instead of "Rate 1 out of 5").
**Action:** Always provide explicit, contextual `aria-label` attributes on emoji-based buttons (like `aria-label="Rate ${v} out of 5"`) to ensure the intent of the button is communicated rather than just the literal symbol.
