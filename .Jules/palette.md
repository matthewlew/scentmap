## 2024-03-14 - Mobile Filter Toggle ARIA State Management
**Learning:** Even simple toggle buttons that show/hide panels using standard CSS classes (like `open`) need explicit ARIA state synchronization (`aria-expanded` and `aria-controls`) to communicate their function and state to screen readers.
**Action:** When implementing show/hide toggles via JavaScript `classList.toggle`, always capture the returned boolean state and immediately sync it to the triggering button's `aria-expanded` attribute. Also, remember that `aria-controls` should be hardcoded in HTML to establish the relationship.
## 2026-05-19 - Transparency in Recommendation Algorithms
**Learning:** Users who value utility and transparency (like Elias) lose trust in recommendations when the underlying math is hidden. Presenting an aggregate score without a breakdown feels like a 'black box' and marketing fluff.
**Action:** Surfaced the algorithmic components (Family Match, Sillage Contrast, Note Overlap) directly beneath each layering suggestion in the UI, transforming a generic recommendation into an actionable, data-driven insight.
