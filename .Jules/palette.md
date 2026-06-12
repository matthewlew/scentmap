## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.

## 2024-06-12 - Exposing Algorithm Math to Build Trust
**Learning:** For Scentmap users driven by transparency (e.g., the Elias persona), black box recommendation scores create friction and distrust. Multi-factor scoring systems should expose the individual factors contributing to the final score to explain "why".
**Action:** When implementing or modifying complex multi-factor scoring systems (like similarity or layering calculations), engine functions should return detailed breakdown objects instead of single aggregate numbers, enabling the UI to expose the math and increase transparency.