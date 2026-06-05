## 2026-06-05 - Icon-only search clear button
**Learning:** Icon-only buttons used for clearing text inputs (e.g., `✕` or `✖`) often lack an accessible name, causing screen readers to read the raw symbol (e.g., "multiplication X") which is confusing contextually.
**Action:** Always add an explicit `aria-label` (e.g., `aria-label="Clear search"`) to icon-only close/clear buttons, particularly in dynamic search UI elements.
