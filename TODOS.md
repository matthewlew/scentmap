# Scentmap — Design & Product TODOs

Tracked design debt, deferred features, and engineering notes from design reviews.
Each item includes enough context to be picked up cold.

---

## Search Improvements

### Diacritic normalization + fuzzy matching + keyboard navigation
**What:** Three search improvements: (1) diacritic stripping so `xinu` matches `xinú`, (2) Levenshtein fuzzy fallback so `diptique` matches `diptyque`, (3) full arrow-key navigation from the search input through catalog results.

**Why:** Users typing accented brand/fragrance names without diacritics (e.g. `xinu` for `Xinú`) get zero results. Typos in brand names (e.g. `diptique`) also return nothing. Enter key currently does nothing useful after typing a query.

**Pros:** Fixes the #1 silent failure mode in search. Covers all 3 search contexts (catalog, ⌘K modal, compare picker) consistently via a shared helper. Arrow nav meets WCAG keyboard accessibility expectations.

**Cons:** Adds ~90 lines to app.js. Fuzzy only activates as fallback (when substring match has no hits) and is gated to queries ≥ 4 chars to avoid false positives.

**Context:** Reviewed in plan-eng-review session 2026-03-18. Full implementation plan below. Run `runSearchTests()` in browser console to verify after shipping.

**Depends on:** Nothing. Self-contained change to `store.js` + `app.js` + `styles/components.css`.

Implementation plan (complete, ready to execute in a fresh session):

1. **`js/store.js`** — add to the fragrance preprocessing loop (after line 139):
   ```js
   const norm = s => (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
   f._nameN  = norm(f.name);
   f._brandN = norm(f.brand);
   f._nAllN  = [...f._nTop,...f._nMid,...f._nBase].map(norm);
   ```
   Also add to note preprocessing: `n._nameN = norm(n.name)` (for notes browser fix).

2. **`js/app.js`** — add these helpers near the top of the file (after utility functions):
   ```js
   // Normalize a search query (strip diacritics + lowercase)
   function normQ(s){ return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }

   // Levenshtein edit distance
   function levenshtein(a,b){
     const m=a.length,n=b.length;
     const dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i||j));
     for(let i=1;i<=m;i++) for(let j=1;j<=n;j++)
       dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
     return dp[m][n];
   }

   // Fuzzy: check if query is within threshold of any word token in phrase
   function wordFuzzy(q,phrase,threshold){
     if(levenshtein(q,phrase)<=threshold) return true;
     return phrase.split(/\s+/).some(w=>w.length>=q.length-1&&levenshtein(q,w)<=threshold);
   }

   // Tiered fragrance match: substring → fuzzy name (≤2) → fuzzy brand (≤1)
   // Fuzzy only activates when q.length >= 4
   function matchFrag(f,q){
     if(!q) return true;
     if(f._nameN.includes(q)||f._brandN.includes(q)||f._nAllN.some(n=>n.includes(q))) return true;
     if(q.length<4) return false;
     return wordFuzzy(q,f._nameN,2)||wordFuzzy(q,f._brandN,1);
   }
   ```

3. **`js/app.js` — catalog search** (replace lines 2009-2011):
   ```js
   const normSearch = normQ(search);
   if(normSearch) visibleCat = visibleCat.filter(f => matchFrag(f, normSearch));
   ```
   After rows render at the end of `buildCatalog`, add `.search-first` class to first result:
   ```js
   if(normSearch){
     const firstRow = body.querySelector('.list-item');
     if(firstRow) firstRow.classList.add('search-first');
   }
   ```

4. **`js/app.js` — ⌘K universal search** (replace lines 2796-2800):
   ```js
   const normQStr = normQ(q);
   const fragMatches = CAT.filter(f => matchFrag(f, normQStr)).slice(0, 6);
   ```

5. **`js/app.js` — compare picker** (replace lines 2739-2742):
   ```js
   const normQStr = normQ(q);
   frags = frags.filter(f => {
     if (_usContext && f.id === ((_usContext.slot==='a'?CMP_B:CMP_A)||{}).id) return false;
     return !normQStr || matchFrag(f, normQStr);
   });
   ```

6. **`js/app.js` — notes browser search** (line 2482, replace `n.name.toLowerCase()` check):
   ```js
   const matchesQuery = !sq || n._nameN.includes(normQ(sq));
   ```

7. **`js/app.js` — keyboard nav** in `initCatalogControls`, extend the existing keydown handler on `searchEl`:
   ```js
   if(e.key==='Enter'){
     const first=document.querySelector('#cat-body .list-item');
     if(first){first.click();e.preventDefault();}
   }
   if(e.key==='ArrowDown'){
     e.preventDefault();
     const first=document.querySelector('#cat-body .list-item');
     if(first) first.focus();
   }
   ```
   Add a keydown listener on `#cat-body` (the catalog body element, captured as `body` in `buildCatalog`):
   ```js
   body.addEventListener('keydown',e=>{
     if(!['ArrowDown','ArrowUp','Escape'].includes(e.key)) return;
     e.preventDefault();
     const rows=[...body.querySelectorAll('.list-item')];
     const idx=rows.indexOf(document.activeElement);
     if(e.key==='Escape'){ searchEl.focus(); return; }
     if(e.key==='ArrowUp'){
       if(idx<=0) searchEl.focus();
       else{ rows[idx-1].focus(); rows[idx-1].scrollIntoView({block:'nearest'}); }
     }
     if(e.key==='ArrowDown'&&idx<rows.length-1){
       rows[idx+1].focus(); rows[idx+1].scrollIntoView({block:'nearest'});
     }
   });
   ```

8. **`js/app.js` — `runSearchTests()`** — add near the bottom of the file (dev utility):
   ```js
   function runSearchTests(){
     const pass=[],fail=[];
     const chk=(label,got,exp)=>(got===exp?pass:fail).push({label,got,exp});
     // Levenshtein
     chk('lev same word',levenshtein('diptyque','diptyque'),0);
     chk('lev 1 edit',levenshtein('diptique','diptyque'),1);
     chk('lev empty',levenshtein('','test'),4);
     // matchFrag helpers
     const mockFrag={_nameN:'gypsy water',_brandN:'byredo',_nAllN:['bergamot','rose','vanilla']};
     chk('exact brand',matchFrag(mockFrag,'byredo'),true);
     chk('exact name substring',matchFrag(mockFrag,'gypsy'),true);
     chk('diacritic: xinu matches xinú note',matchFrag({_nameN:'xinu',_brandN:'brand',_nAllN:[]},normQ('xinú')),true);
     chk('fuzzy brand byedo→byredo',matchFrag(mockFrag,'byedo'),true);
     chk('fuzzy name diptique→diptyque',matchFrag({_nameN:'something',_brandN:'diptyque',_nAllN:[]},'diptique'),true);
     chk('short query no fuzzy (by)',matchFrag({_nameN:'xyz brand',_brandN:'abc',_nAllN:[]},'by'),false);
     chk('note match',matchFrag(mockFrag,'rose'),true);
     pass.forEach(t=>console.log(`%cPASS%c ${t.label}`,'color:green',''));
     fail.forEach(t=>console.error(`FAIL ${t.label}: got ${t.got}, expected ${t.exp}`));
     console.log(`${pass.length} passed, ${fail.length} failed`);
   }
   window.runSearchTests=runSearchTests;
   ```

9. **`styles/components.css`** — add `.search-first` style near `.list-item:hover`:
   ```css
   .list-item.search-first { background: var(--bg-secondary); }
   ```

**Test checklist (manual QA after shipping):**
- `xinu` in catalog → Xinú results (if in catalog)
- `diptique` in catalog → Diptyque fragrances appear
- `byedo` → Byredo fragrances appear
- `by` → no false fuzzy positives (< 4 char gate)
- Down arrow from search → first result gets focus ring
- Up arrow from first result → focus returns to search input
- Enter in search with results → first result opens
- `runSearchTests()` in console → all PASS

---

## Scent DNA Card

### Analytics Events
**What:** Add event stubs for the DNA Card feature after it ships.
**Why:** Without this, there's no way to know if the feature gets used or which personas are most common.
**Pros:** Forward-compatible when analytics infrastructure is added. 30-minute task.
**Cons:** None — event stubs are zero-cost to add.
**Context:** The CEO review (2026-03-18) flagged the full app has no analytics events. DNA Card is the right moment to establish the pattern.
**Depends on:** DNA Card feature shipping.

Events to track:
- `dna_tab_viewed`
- `dna_persona_assigned { persona: string }`
- `dna_gap_cta_clicked { family: string }`
- `dna_share_url_clicked`
- `dna_share_image_downloaded`

---

## Dupe Lab

**What:** A "Find Dupes" entry point from the fragrance detail panel that runs `scoreSimilarity()` against all 183 fragrances and returns a ranked list with diff breakdowns.
**Why:** "What's a dupe for X?" is the #1 question on r/fragrance. The compare tool answers it but requires knowing the second scent. The Dupe Lab flips this.
**Pros:** High SEO value, directly serves r/fragrance use case, all algorithmic work already exists (`scoreSimilarity()`). Potential for shareable "I found a dupe" moments.
**Cons:** Rendering 183 similarity scores on click requires a debounce/worker strategy if performance is a concern (though 183 comparisons is fast in practice).
**Context:** Sketched in plan-design-review session 2026-03-18. Full design spec available: ranked list UI, diff breakdown panel, "Why this matches" math expansion, entry points from detail panel + landing page.
**Depends on:** Nothing. Additive to existing architecture.

Key design decisions (from sketch):
- Entry: "Find Dupes" button in fragrance detail panel
- Output: ranked list, top 5, each with note overlap bar + one-line diff
- "Why this matches" expander: shows the scoring breakdown (family pts + note pts + sillage pts)
- Shareable: "I ran Santal 33 through the Dupe Lab" TikTok/Reddit moment

---

## Astro Scent Quiz

**What:** A zodiac-mapped fragrance quiz at `/quiz/astro-scent`. Each sign gets a sensory profile target (Warmth/Complexity/Intensity targets), matched against the catalog via the existing profile engine. Result is a specific fragrance + shareable card.
**Why:** Astrology fragrance content gets massive engagement on TikTok and Pinterest. Scentmap's version is credible because it shows the math — not just "Scorpios should wear oud."
**Pros:** Viral/shareable, new SEO surface, fits existing quiz architecture, "See the math" link keeps it on-brand with PRINCIPLES.md Reddit Rule.
**Cons:** Requires defining sensory targets for all 12 signs (design/editorial work, ~2 hours). Risk of feeling gimmicky if copy isn't sharp.
**Context:** Sketched in plan-design-review session 2026-03-18. Full design spec: sign picker UI → optional depth (Sun/Rising/Moon+Venus) → result card with sensory profile + "See why" math expansion. Shareable as canvas PNG.
**Depends on:** Existing quiz infrastructure at `/quiz/`. Canvas share card (could share implementation with DNA Card share).

Zodiac → sensory target mapping defined in review (see session notes or re-derive from archetypes).
Entry points: landing page quiz card, `/quiz/astro-scent`, fragrance detail "Is this a ♏ Scorpio scent?" badge.

---

## Dupe Lab — Share Card

**What:** Canvas-rendered share image for Dupe Lab results. "I ran Santal 33 through the Dupe Lab — here's what Scentmap found." Downloadable PNG for Reddit, TikTok, Instagram.
**Why:** The Dupe Lab result is inherently shareable ("dupe for X" is one of the most viral fragrance formats on social media) but without a share card the moment evaporates.
**Pros:** Massive virality unlock. Low effort once DNA Card's canvas renderer exists — reuse the same infrastructure. Drives inbound traffic back to scentmap.co.
**Cons:** None after DNA Card ships. Before DNA Card, would require building the canvas share system from scratch.
**Context:** Decided in plan-eng-review scope expansion session 2026-03-18. DNA Card will establish the canvas share pattern (PNG rendering + URL share); Dupe Lab share card reuses it with a different layout: source frag name + top 3 matches + match scores.
**Depends on:** DNA Card share mechanism shipping first (canvas renderer + OG meta pattern).

---

## Layering Studio

**What:** A feature that takes two fragrances from your wardrobe and generates a layering compatibility score + guide. "Apply X first, wait 10 min, layer Y on pulse points — 84% compatibility."
**Why:** "How to layer fragrances" is a growing TikTok/Reddit trend. Scentmap already has `scoreLayeringPair()` implemented — this is mostly UI + editorial copy for layer ordering rules.
**Pros:** High novelty (nothing like it exists on any fragrance site). Inherently shareable ("my two fragrances score 84% — here's the guide"). Directly answers the 'how to layer' question in the scope expansion brief.
**Cons:** Requires writing layer-guide copy rules (family pair → ordering advice, ~20 pairs). Not as high SEO value as Dupe Lab. Best as a mobile-first sheet experience.
**Context:** New concept proposed in plan-eng-review scope expansion session 2026-03-18. Not in original roadmap. `scoreLayeringPair(a, b)` already exists in app.js (lines 371–383) — returns 0–75 compatibility score based on family affinity + sillage difference + unique note count.
**Depends on:** Nothing. Can be built independently after Dupe Lab ships.

Implementation starting point:
- Entry: "Layer with..." picker in fragrance detail panel (reuse `dc-cmp-ctas` pattern)
- Or: standalone "Layering Studio" tab/panel
- Core: `scoreLayeringPair(a, b)` → compatibility score already done
- New: `layeringGuide(a, b)` → rule-based text (which to apply first, timing, where)
- Share: "My layering combo" canvas card (after DNA Card share infrastructure exists)
