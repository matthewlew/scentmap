## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-03-24 - Dynamic Emoji Button Accessibility
**Learning:** Emoji-based rating buttons inside dynamic JavaScript templates (like the test bench 1-5 scale) can be completely opaque to screen readers if not properly labeled, leading to generic announcements or confusing unicode descriptions.
**Action:** When dynamically generating button arrays that rely on emojis or visual scales, always inject a clear, descriptive `aria-label` (e.g., `aria-label="Rate ${v} out of 5"`) directly into the template string to guarantee screen reader context regardless of the inner HTML.
