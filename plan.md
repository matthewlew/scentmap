1. **Modify `js/engine.js` (scoreLayeringPair function)**
   - Update `scoreLayeringPair` to return `{ total, famScore, sillScore, noteScore }` instead of a primitive total.

2. **Modify `js/app.js` (Layering logic & Cache removal)**
   - Remove `_layCache`.
   - Update `scoreLayeringPair(a, b)` wrapper to return the engine object.
   - Update line 121 in `js/app.js` to use `.total`.
   - Update line 4391 in `js/app.js` to use `.total`.
   - Update line 5050 in `js/app.js` to use `.total`.

3. **Modify `js/app.js` (Layering Detail Panel UI)**
   - Update the mapping around line 1890: `.map(f => { const br = scoreLayeringPair(frag, f); return { f, score: br.total, breakdown: br }; })`.
   - Update the HTML generation in `candidates.forEach` to include: `<div class="dc-description">Family: ${breakdown.famScore} | Sillage: ${breakdown.sillScore} | Notes: ${breakdown.noteScore}</div>` alongside or beneath the reason text.

4. **Modify `tests.html`**
   - Update the four assertions for `W.scoreLayeringPair(a, b)` to access `.total`.

5. **Automated Testing and Frontend Verification**
   - Run Node.js unit tests and Playwright test script to visually capture the layered UI change and ensure no errors.
   - Terminate background server and remove logs/temp scripts.

6. **Complete Pre Commit Steps**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

7. **Submit PR**
   - Submit via `submit` tool.
