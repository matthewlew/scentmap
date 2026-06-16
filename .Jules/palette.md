## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2024-03-14 - Search Input Accessibility
**Learning:** Text inputs that rely solely on visual `placeholder` text (like `.input` or `.input--inline` search fields) fail to announce their purpose reliably to screen readers when the user starts typing, as the placeholder disappears.
**Action:** Always provide an explicit, descriptive `aria-label` for search and text inputs. Furthermore, when dynamically changing an input's `placeholder` via JavaScript, always simultaneously update its `aria-label` attribute to ensure screen readers remain synchronized with the input's current context.
