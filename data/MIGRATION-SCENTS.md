# Migration: Consolidate Scent Data Files

**Status:** Planned — not started
**Effort:** S (~30 min) · Engineering review complete

---

## What changes

| | Before | After |
|---|---|---|
| HTTP requests at startup | 16 (waterfall) | 4 (parallel) |
| Source of truth for scents | 12 per-brand files + scents-flat.json | `data/scents.json` |
| Files deleted | — | `scents-flat.json`, `scents-index.json`, `data/scents/` (14 files) |
| Files added | — | `data/scents.json` (~110KB flat array) |
| JS files changed | — | `store.js`, `quiz.js` |

---

## Step 1 — Generate `scents.json`

Run once before any code changes:

```js
const fs = require('fs');
const idx = JSON.parse(fs.readFileSync('data/scents-index.json'));
const frags = idx.brands.flatMap(b =>
  JSON.parse(fs.readFileSync(`data/scents/${b}.json`)).map(f => ({
    id: f.id, brand: f.brand, name: f.name, family: f.family,
    sillage: f.sillage, layering: f.layering,
    top: f.top, mid: f.mid, base: f.base,
    roles: f.roles || [],
    description: f.description || '',
    url: f.url || '',
    story: f.story || '',
  }))
);
fs.writeFileSync('data/scents.json', JSON.stringify(frags, null, 2));
console.log('Written:', frags.length, 'fragrances');
// Expected: 213
```

Verify: count is 213, zero duplicate ids, `top`/`mid`/`base` are arrays on all entries.

---

## Step 2 — `store.js` change

Replace the two-phase waterfall in `initialize()` (lines 170–185):

```js
// BEFORE
const [roles, notes, brands, scentsIdx] = await Promise.all([...4 fetches...]);
const scentArrays = await Promise.all(
  scentsIdx.brands.map(b => fetch(`/data/scents/${b}.json`, _nc).then(r => r.json()))
);
_CAT = scentArrays.flat();

// AFTER
const [roles, notes, brands, scents] = await Promise.all([
  fetch('/data/roles.json', _nc).then(r => r.json()),
  fetch('/data/notes.json', _nc).then(r => r.json()),
  fetch('/data/brands.json', _nc).then(r => r.json()),
  fetch('/data/scents.json', _nc).then(r => r.json()),
]);
_CAT = scents;
```

Everything downstream (`_CAT` pre-processing loop, `getData()`, all `app.js` variable proxies) is untouched.

---

## Step 3 — `quiz.js` change

```js
// BEFORE: fetches dict, reconstructs ids
const scentsMap = await fetch('/data/scents-flat.json').then(r => r.json());
const catalog = Object.entries(scentsMap).map(([id, f]) => ({ ...f, id }));

// AFTER: fetches array, id already present
const catalog = await fetch('/data/scents.json').then(r => r.json());
```

Delete the entire fallback `catch` inner try/catch (lines 706–730) — it re-did the 12-file waterfall which will 404 once those files are deleted. Replace with a simple error UI:

```js
} catch (err) {
  console.error('[quiz] init error:', err);
  container.innerHTML = `<div class="quiz-page"><div class="quiz-body"><p>Failed to load quiz data. <a href="/">Back to Scentmap</a></p></div></div>`;
}
```

Bonus: `frag.url` is now available in quiz result cards (was always `undefined` with `scents-flat.json`).

---

## Step 4 — Static subpages

No changes needed. Every `/compare/` and `/quiz/` subpage loads only `app.js` — no direct data fetches.

---

## Deployment order

Do NOT delete old files until production is verified:

1. Add `data/scents.json`
2. Deploy updated `store.js` + `quiz.js`
3. Verify in production (checklist below)
4. Delete `scents-flat.json`, `scents-index.json`, `data/scents/`

**Rollback during window:** `git revert` the two JS files — old data files are still present so the app recovers immediately.

---

## Verification checklist

**Network**
- [ ] DevTools shows exactly 4 fetches at startup — no `scents-flat.json`, no `scents/*.json`
- [ ] `scents.json` returns HTTP 200, ~110KB

**Catalog**
- [ ] 213 frags load; per-brand counts correct (Byredo 30, Le Labo 29, Diptyque 25…)
- [ ] Search, filter, owned/wishlist state all work
- [ ] `window.CAT[0].url` in console returns a string (not `undefined`)

**Detail + Compare**
- [ ] Fragrance detail sheet: notes render correctly
- [ ] Compare deep-link `/compare/santal-33/another-13/` resolves both frags
- [ ] Brand detail sheet populates

**Quiz**
- [ ] All 5 quiz pages complete and show results
- [ ] Shared results URL (`?results=...`) pre-loads correctly
- [ ] Byredo quiz results show non-empty `frag.url`
- [ ] DevTools shows `scents.json` fetched — not `scents-flat.json`

---

## Risk summary

| Risk | Likelihood | Severity | Notes |
|---|---|---|---|
| `url`/`story` sparse data breaks renders | None | — | All renders guard with `if (frag.url)` |
| Entry count mismatch | None | — | Pre-verified: both sources have identical 213 ids |
| `top`/`mid`/`base` comma-strings | None | — | Pre-verified: all 12 files use arrays |
| No quiz fallback path after deletion | Low | Medium | Static file 404 only if `scents.json` not deployed — deployment checklist catches this |
| Stale browser cache | Low | Low | Use `?v=<timestamp>` cache-bust per CLAUDE.md |
