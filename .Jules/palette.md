## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2026-06-17 - ARIA Labels on Template Literal & Hidden UI Icon Buttons
**Learning:** Icon-only buttons embedded deep within JavaScript template literals (e.g., dynamic layering pairs or test bench entries) or hidden HTML elements (like clear search input icons) frequently miss accessibility attributes during rapid feature iterations.
**Action:** Always verify `aria-label` is present on any button containing only an icon (`✕`, `⤓`, etc.), especially when creating new components or rendering dynamic DOM trees using template literals.
