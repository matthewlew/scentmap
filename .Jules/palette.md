## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-04-21 - Accessible Placeholders vs Labels
**Learning:** Inputs that rely solely on `placeholder` text (like `.input` or `.input--inline` in the codebase) do not consistently announce their purpose to screen readers, especially once text is entered and the placeholder disappears. Similarly, '✕' or SVG icon-only buttons often lack `aria-label`s, causing screen readers to read confusing symbols out loud.
**Action:** Always ensure search/text inputs and icon-only buttons have an explicit, descriptive `aria-label` even if visually descriptive placeholder text or familiar icons are present.
