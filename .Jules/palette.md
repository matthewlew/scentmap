## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-03-22 - Dynamic Emoji and Icon Button Accessibility
**Learning:** When using map() to generate rating buttons with emojis, or using decorative symbols inside template literals (like '✕' or '⤓'), screen readers cannot interpret their intent automatically. These dynamically generated icon-only buttons often slip through static accessibility checks.
**Action:** Always include an explicit aria-label with descriptive context (e.g., aria-label="Rate ${v} out of 5" or aria-label="Export recipe") whenever creating emoji or icon-based buttons, especially inside JavaScript string templates.
