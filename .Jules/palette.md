## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-06-14 - Dynamic Icon-only Buttons ARIA Labels
**Learning:** Icon-only buttons or buttons consisting solely of emojis (like rating buttons or '✕'/ '⤓' utility icons) injected via JavaScript template literals often miss essential `aria-label`s, causing them to be unreadable or confusing to screen readers.
**Action:** When creating or modifying dynamic template literals containing buttons without visible descriptive text, always explicitly include an `aria-label` attribute describing the button's function (e.g., `aria-label="Rate 5 out of 5"` or `aria-label="Export layering recipe"`).
