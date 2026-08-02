## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.

## 2026-08-02 - Placeholder Accessibility for Search Inputs
**Learning:** Text inputs that rely solely on visual `placeholder` text (like `.input` and `.input--inline` in Scentmap) do not reliably announce their purpose to screen readers, especially when the placeholder changes dynamically.
**Action:** Always provide an explicit, descriptive `aria-label` for search and text inputs. When updating the `placeholder` dynamically via JavaScript, always simultaneously update its `aria-label` attribute using `setAttribute('aria-label', ...)` to keep screen readers synchronized with the current state.