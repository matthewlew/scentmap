## 2026-04-13 - Expose Layering Math

**Learning:** Hiding mathematical logic behind single aggregate scores (like "75% Match") reduces user trust, particularly for analytical personas who desire transparency regarding the "why" behind an algorithm's output.
**Action:** When implementing scoring functions, return detailed breakdown objects (`{total, famScore, sillScore, noteScore}`) to enable the UI to explicitly display these underlying metrics to the user.
