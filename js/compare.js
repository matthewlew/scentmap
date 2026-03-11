// ── compare.js ───────────────────────────────────────────────────────
// Renders the Compare panel. Matches the static HTML in index.html:
//   #cmp-card-a / #cmp-card-b  — slot tap targets
//   #cmp-results               — comparison output
//   #frag-picker               — dual-column picker overlay
//     #frag-picker-list-a/b    — per-slot frag lists
//     #frag-picker-search-a/b  — per-slot search inputs
//     #frag-picker-sort-bar    — sort pill buttons
//     #frag-picker-close       — Done button

import { CAT, CAT_MAP, FAM, ROLES } from './data.js';
import { isOwned, isWish } from './state.js';
import { scoreSimilarity, scoreLayeringPair } from './scoring.js';
import { _selectFragForSlot, getCmpFam, SW, LW, openFragDetail } from './renderers.js';
import * as Renderers from './renderers.js';

// ── Sort state ─────────────────────────────────────────────────────
let _sortKey = 'brand'; // 'brand' | 'name' | 'family'

function _sorted(list) {
  return [...list].sort((a, b) => {
    if (_sortKey === 'name')   return a.name.localeCompare(b.name);
    if (_sortKey === 'family') return a.family.localeCompare(b.family) || a.name.localeCompare(b.name);
    return a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name); // brand (default)
  });
}

// ── Picker helpers ────────────────────────────────────────────────
function _openPicker() {
  document.getElementById('frag-picker')?.classList.add('open');
}

function _closePicker() {
  document.getElementById('frag-picker')?.classList.remove('open');
}

function _fillList(slot, query) {
  const el = document.getElementById(`frag-picker-list-${slot}`);
  if (!el) return;
  const q = (query || '').toLowerCase().trim();
  let matches = q
    ? CAT.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.brand.toLowerCase().includes(q) ||
        [...f.top, ...f.mid, ...f.base].some(n => n.toLowerCase().includes(q))
      )
    : CAT;
  matches = _sorted(matches);

  const currentId = slot === 'a' ? Renderers.CMP_A?.id : Renderers.CMP_B?.id;

  el.innerHTML = '';
  matches.forEach(frag => {
    const fc = getCmpFam(frag.family);
    const btn = document.createElement('button');
    btn.className = 'frag-picker-item' + (frag.id === currentId ? ' selected' : '');
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', frag.id === currentId ? 'true' : 'false');
    btn.innerHTML = `
      <div class="frag-picker-dot" style="background:${fc.accent}"></div>
      <div>
        <div class="frag-picker-item-name">${frag.name}</div>
        <div class="frag-picker-item-brand">${frag.brand}</div>
      </div>`;
    btn.addEventListener('click', () => {
      _selectFragForSlot(slot, frag);
      _updateSlotCard(slot, frag);
      _fillList(slot, ''); // refresh to show new selection highlight
      buildCompare();
    });
    el.appendChild(btn);
  });
}

function _updateSlotCard(slot, frag) {
  const card = document.getElementById(`cmp-card-${slot}`);
  if (!card) return;
  const fc = getCmpFam(frag.family);
  card.innerHTML = `
    <div class="cmp-card-filled">
      <div class="cmp-card-dot" style="background:${fc.accent}"></div>
      <div class="cmp-card-info">
        <div class="cmp-card-name">${frag.name}</div>
        <div class="cmp-card-brand">${frag.brand}</div>
      </div>
    </div>
    <span class="cmp-card-chevron" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
}

function _resetSlotCard(slot) {
  const card = document.getElementById(`cmp-card-${slot}`);
  if (!card) return;
  const labels = { a: 'Fragrance One', b: 'Fragrance Two' };
  card.innerHTML = `
    <div class="cmp-card-empty">
      <div class="cmp-card-empty-lbl">${labels[slot]}</div>
      <div class="cmp-card-empty-hint">Tap to select</div>
    </div>
    <span class="cmp-card-chevron" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
}

// ── Init (called once from main.js after DOMContentLoaded) ───────────
export function initComparePicker() {
  // Sort pill buttons
  const sortBar = document.getElementById('frag-picker-sort-bar');
  const pill    = document.getElementById('frag-picker-sort-pill');
  if (sortBar) {
    sortBar.querySelectorAll('.frag-picker-sort-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _sortKey = btn.dataset.sort;
        sortBar.querySelectorAll('.frag-picker-sort-btn').forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        if (pill) {
          pill.style.left  = btn.offsetLeft + 'px';
          pill.style.width = btn.offsetWidth + 'px';
        }
        _fillList('a', document.getElementById('frag-picker-search-a')?.value || '');
        _fillList('b', document.getElementById('frag-picker-search-b')?.value || '');
      });
    });
    // Init pill position
    const activeBtn = sortBar.querySelector('.frag-picker-sort-btn.active');
    if (pill && activeBtn) {
      pill.style.left  = activeBtn.offsetLeft + 'px';
      pill.style.width = activeBtn.offsetWidth + 'px';
    }
  }

  // Search inputs
  ['a', 'b'].forEach(slot => {
    document.getElementById(`frag-picker-search-${slot}`)?.addEventListener('input', e => {
      _fillList(slot, e.target.value);
    });
  });

  // Close / Done button
  document.getElementById('frag-picker-close')?.addEventListener('click', _closePicker);

  // Slot card tap targets
  ['a', 'b'].forEach(slot => {
    const card = document.getElementById(`cmp-card-${slot}`);
    if (!card) return;
    const open = () => {
      _fillList('a', '');
      _fillList('b', '');
      // Clear search inputs
      const sa = document.getElementById('frag-picker-search-a');
      const sb = document.getElementById('frag-picker-search-b');
      if (sa) sa.value = '';
      if (sb) sb.value = '';
      _openPicker();
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });

  // Populate lists on first init so they're ready
  _fillList('a', '');
  _fillList('b', '');
}

// ── Main render ──────────────────────────────────────────────────────
export function buildCompare() {
  const results = document.getElementById('cmp-results');
  if (!results) return;

  // Read live values synchronously via namespace import
  const fragA = Renderers.CMP_A;
  const fragB = Renderers.CMP_B;

  // Sync slot cards with current state
  if (fragA) _updateSlotCard('a', fragA); else _resetSlotCard('a');
  if (fragB) _updateSlotCard('b', fragB); else _resetSlotCard('b');

  results.innerHTML = '';

  if (!fragA && !fragB) {
    _renderEmpty(results);
    return;
  }

  if (!fragA || !fragB) {
    const hint = document.createElement('div');
    hint.className = 'cmp-hint';
    hint.textContent = `Now pick ${!fragA ? 'Fragrance One' : 'Fragrance Two'} to compare.`;
    results.appendChild(hint);
    return;
  }

  _renderComparison(results, fragA, fragB);
}

function _renderEmpty(results) {
  const hint = document.createElement('div');
  hint.className = 'cmp-hint';
  hint.textContent = 'Select two fragrances above to compare them.';
  results.appendChild(hint);

  // Suggest best layering pair from owned
  const owned = CAT.filter(f => isOwned(f.id));
  if (owned.length < 2) return;
  let best = null, bestScore = 0;
  for (let i = 0; i < owned.length; i++) {
    for (let j = i + 1; j < owned.length; j++) {
      const s = scoreLayeringPair(owned[i], owned[j]);
      if (s > bestScore) { bestScore = s; best = [owned[i], owned[j]]; }
    }
  }
  if (!best) return;
  const sugLbl = document.createElement('div');
  sugLbl.className = 'cmp-sug-lbl';
  sugLbl.textContent = 'Try comparing';
  results.appendChild(sugLbl);
  const sugWrap = document.createElement('div');
  sugWrap.className = 'cmp-sug-wrap';
  best.forEach((f, i) => {
    const fc = getCmpFam(f.family);
    const card = document.createElement('button');
    card.className = 'cmp-sug-card';
    card.style.borderColor = fc.accent + '44';
    card.innerHTML = `
      <div class="cmp-sug-dot" style="background:${fc.accent}"></div>
      <div><div class="cmp-sug-name">${f.name}</div><div class="cmp-sug-brand">${f.brand}</div></div>
      <div class="cmp-sug-score" style="color:${fc.accent}">${bestScore}</div>`;
    card.addEventListener('click', () => {
      _selectFragForSlot(i === 0 ? 'a' : 'b', f);
      buildCompare();
    });
    sugWrap.appendChild(card);
  });
  results.appendChild(sugWrap);
}

function _renderComparison(results, fragA, fragB) {
  const fcA = getCmpFam(fragA.family);
  const fcB = getCmpFam(fragB.family);
  const simScore   = scoreSimilarity(fragA, fragB);
  const layerScore = scoreLayeringPair(fragA, fragB);

  // Scores
  const scoreRow = document.createElement('div');
  scoreRow.className = 'cmp-score-row';
  scoreRow.innerHTML = `
    <div class="cmp-score-block">
      <div class="cmp-score-num">${simScore}</div>
      <div class="cmp-score-lbl">Similarity</div>
    </div>
    <div class="cmp-score-block">
      <div class="cmp-score-num">${layerScore}</div>
      <div class="cmp-score-lbl">Layering</div>
    </div>`;
  results.appendChild(scoreRow);

  // Stats table
  const statsTable = document.createElement('div');
  statsTable.className = 'cmp-table';
  function statRow(label, valA, valB, pctA, pctB) {
    const row = document.createElement('div');
    row.className = 'cmp-trow';
    row.innerHTML = `
      <div class="cmp-tcell a">
        <div class="cmp-tbar-wrap"><div class="cmp-tbar" style="width:${pctA}%;background:${fcA.accent}"></div></div>
        <div class="cmp-tval">${valA}</div>
      </div>
      <div class="cmp-tlbl">${label}</div>
      <div class="cmp-tcell b">
        <div class="cmp-tval">${valB}</div>
        <div class="cmp-tbar-wrap"><div class="cmp-tbar" style="width:${pctB}%;background:${fcB.accent}"></div></div>
      </div>`;
    return row;
  }
  statsTable.appendChild(statRow('Family',
    (FAM[fragA.family] || {}).label || fragA.family,
    (FAM[fragB.family] || {}).label || fragB.family,
    100, 100
  ));
  statsTable.appendChild(statRow('Sillage', SW[fragA.sillage], SW[fragB.sillage], fragA.sillage * 10, fragB.sillage * 10));
  statsTable.appendChild(statRow('Structure', LW[fragA.layering], LW[fragB.layering], fragA.layering * 10, fragB.layering * 10));
  results.appendChild(statsTable);

  // Notes
  const notesSec = document.createElement('div');
  notesSec.className = 'cmp-notes-sec';
  function notesBlock(frag, fc, side) {
    const block = document.createElement('div');
    block.className = `cmp-notes-block ${side}`;
    ['top', 'mid', 'base'].forEach(tier => {
      const tierRow = document.createElement('div');
      tierRow.className = 'cmp-notes-tier';
      const other = side === 'a' ? fragB : fragA;
      const shared = frag[tier].filter(n => other[tier].map(s => s.toLowerCase()).includes(n.toLowerCase()));
      const chips = frag[tier].map(n => {
        const isShared = shared.map(s => s.toLowerCase()).includes(n.toLowerCase());
        return `<span class="cmp-note-chip${isShared ? ' shared' : ''}" style="${isShared ? `border-color:${fc.accent};color:${fc.accent}` : ''}">${n}</span>`;
      }).join('');
      tierRow.innerHTML = `<span class="cmp-tier-lbl">${tier[0].toUpperCase()}</span>${chips}`;
      block.appendChild(tierRow);
    });
    return block;
  }
  const notesGrid = document.createElement('div');
  notesGrid.className = 'cmp-notes-grid';
  notesGrid.appendChild(notesBlock(fragA, fcA, 'a'));
  const vsDiv = document.createElement('div'); vsDiv.className = 'cmp-notes-div'; vsDiv.textContent = 'vs';
  notesGrid.appendChild(vsDiv);
  notesGrid.appendChild(notesBlock(fragB, fcB, 'b'));
  notesSec.appendChild(notesGrid);
  results.appendChild(notesSec);

  // Roles
  const rolesRow = document.createElement('div');
  rolesRow.className = 'cmp-roles-row';
  const sharedRoles = fragA.roles.filter(r => fragB.roles.includes(r));
  const rolesA = fragA.roles.map(r => { const role = ROLES.find(x => x.id === r); return `<span class="cmp-role-chip${sharedRoles.includes(r) ? ' shared' : ''}">${role?.sym || ''} ${role?.name || r}</span>`; }).join('');
  const rolesB = fragB.roles.map(r => { const role = ROLES.find(x => x.id === r); return `<span class="cmp-role-chip${sharedRoles.includes(r) ? ' shared' : ''}">${role?.sym || ''} ${role?.name || r}</span>`; }).join('');
  rolesRow.innerHTML = `
    <div class="cmp-roles-side a">${rolesA}</div>
    <div class="cmp-roles-lbl">Roles</div>
    <div class="cmp-roles-side b">${rolesB}</div>`;
  results.appendChild(rolesRow);

  // Detail links
  const detailBtns = document.createElement('div');
  detailBtns.className = 'cmp-detail-btns';
  [{ frag: fragA, fc: fcA }, { frag: fragB, fc: fcB }].forEach(({ frag, fc }) => {
    const btn = document.createElement('button');
    btn.className = 'cmp-detail-btn';
    btn.innerHTML = `<span class="cmp-detail-dot" style="background:${fc.accent}"></span> ${frag.name} detail →`;
    btn.addEventListener('click', () => openFragDetail(frag));
    detailBtns.appendChild(btn);
  });
  results.appendChild(detailBtns);
}
