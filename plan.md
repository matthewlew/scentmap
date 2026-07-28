1. **Refactor `scoreLayeringPair` in `js/engine.js`**
   - Modify the function to return `{ total, famScore, sillScore, noteScore }` where `total` is the previous rounded integer score.

2. **Update `js/app.js` to handle the new object return format**
   - In `getGoldenPairs`, use `.total` when checking scores and storing them.
   - Remove `_layCache` completely.
   - Update `scoreLayeringPair` in `js/app.js` to return the new detailed object and update its callers if necessary. Wait, if we return the full object, all callers need to be checked.
   - Let's check callers of `scoreLayeringPair` in `js/app.js`:
     - Line 121 in `getGoldenPairs`: `const res = scoreLayeringPair(...); const score = res.total;`
     - Line 1283 in `js/app.js`: `function scoreLayeringPair(a,b) { return engine.scoreLayeringPair(a, b, store.FAM_COMPAT); }`
     - Line 1920 in `buildLayerSuggestions`: `.map(f=>({f, ...scoreLayeringPair(frag,f)}))` -> `.filter(x=>x.total>=40)`. Or `.map(f=>{ const res = scoreLayeringPair(frag,f); return {f, score: res.total, ...res}; })`
     - Line 4422 in `scoreLayeringPct`: `function scoreLayeringPct(a,b){return Math.round(Math.min(100,scoreLayeringPair(a,b).total/75*100));}`
     - Line 5081 in `js/app.js`: `maxLay = Math.max(maxLay, scoreLayeringPair(s, f).total);`
   - Expose the math in the layering UI `buildLayerSuggestions` (Line ~1910). Right now `layerReason` is returning a simple text. We should modify it to show the math: e.g. "Family +30, Notes +20...". Let's check the Persona metric. "Enhance the scoreLayeringPair UI to explicitly show the "math" behind the recommendation (e.g., sillage difference, family compatibility)." We can update the UI HTML in `buildLayerSuggestions` to include a pill or text showing `score.total` and breakdown.
   - Wait, `layerReason` in `buildLayerSuggestions` is used as the reason string. The evaluation says: "Enhance the scoreLayeringPair UI to explicitly show the "math" behind the recommendation (e.g., sillage difference, family compatibility)." So instead of or in addition to the text reason, show the scores. We'll append a breakdown like `(Family: ${score.famScore}, Sillage: ${score.sillScore})`.

3. **Update `tests.html`**
   - Update the `scoreLayeringPair` suite to access `.total` property for assertions instead of comparing the whole return value.

4. **Verify changes visually**
   - Start local Python server, navigate to layering UI using Playwright, capture screenshot, stop server.

5. **Complete pre-commit steps**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

6. **Submit PR**
   - Submit the PR with the necessary details.
