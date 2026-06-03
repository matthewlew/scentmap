1. **Update `app.html` for `.notes-nav-btn`**
   - Add `aria-pressed="true"` to the `explore` button (which has `active`).
   - Add `aria-pressed="false"` to the `search` and `saved` buttons.

2. **Update `js/app.js` for `notes-nav-btn` click handler (`switchNotesTab`)**
   - When toggling the `active` class on `notes-nav-btn`, also update `aria-pressed` to `'true'` or `'false'`.

3. **Update `js/app.js` for `.notes-nav-btn` states during search filter logic (around line 3462)**
   - When updating the `notes-nav-btn` states to active/inactive during initial state setup for note search, also update the `aria-pressed` attribute.

4. **Add UX Journal Entry**
   - Append to `.Jules/palette.md` to document the learning about syncing visual state (`active` class) with accessibility state (`aria-pressed`) on custom tabbed navigation buttons.

5. **Verify UX Journal Entry**
   - Verify the `.Jules/palette.md` file contents using `cat`.

6. **Run Tests**
   - Run the Node.js unit tests (`node test/fragrance-api.test.js`) and Playwright tests (`python3 -m http.server 8000 & sleep 5 && python3 run_playwright_tests.py && kill %1`) to ensure no regressions were introduced.

7. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
