// ── compare.js ───────────────────────────────────────────────────────
// Renders the Compare panel. Lazy-loaded by main.js on nav to 'compare'.

import { CAT, CAT_MAP, FAM, FAM_COMPAT, ROLES, NI_MAP } from './data.js';
import { gst, isOwned, isWish } from './state.js';
import { scoreSimilarity, scoreLayeringPair } from './scoring.js';
import {
  CMP_A, CMP_B, setCmpA, setCmpB, _selectFragForSlot,
  getCmpFam, SW, LW,
  openFragDetail, renderFragDetail,
} from './renderers.js';
import { openDetail, pushDetail, closeDesktopDetail, closeAllSheets } from './ui.js';

// ── Picker state ─────────────────────────────────────────────────────
let _pickerSlot = null; // 'a' | 'b' | null

export function initComparePicker() {
  // Wire up frag picker overlay if it exists in the HTML
  const overlay = document.getElementById('cmp-picker-overlay');
  if (!overlay) return;
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeComparePicker();
  });
  document.getElementById('cmp-picker-close')?.addEventListener('click', closeComparePicker);
  document.getElementById('cmp-picker-search')?.addEventListener('input', e => {
    renderPickerList(e.target.value.toLowerCase().trim());
  });
}

function openComparePicker(slot) {
  _pickerSlot = slot;
  const overlay = document.getElementById('cmp-picker-overlay');
  if (!overlay) {
    // Fallback: open detail sheet with a frag list
    openDetail(c => renderPickerSheet(c, slot));
    return;
  }
  overlay.classList.add('open');
  const searchEl = document.getElementById('cmp-picker-search');
  if (searchEl) { searchEl.value = ''; searchEl.focus(); }
  renderPickerList('');
}

function closeComparePicker() {
  _pickerSlot = null;
  document.getElementById('cmp-picker-overlay')?.classList.remove('open');
}

function renderPickerList(query) {
  const el = document.getElementById('cmp-picker-list');
  if (!el) return;
  const matches = query
    ? CAT.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.brand.toLowerCase().includes(query) ||
        [...f.top, ...f.mid, ...f.base].some(n => n.toLowerCase().includes(query))
      )
    : CAT;
  el.innerHTML = '';
  matches.forEach(frag => {
    const fc = getCmpFam(frag.family);
    const btn = document.createElement('button');
    btn.className = 'frag-picker-item';
    btn.innerHTML = `<div class="frag-picker-dot" style="background:${fc.accent}"></div>
      <div>
        <div class="frag-picker-item-name">${frag.name}</div>
        <div class="frag-picker-item-brand">${frag.brand}</div>
      </div>`;
    btn.addEventListener('click', () => {
      _selectFragForSlot(_pickerSlot, frag);
      closeComparePicker();
      buildCompare();
    });
    el.appendChild(btn);
  });
}

// Sheet-based fallback picker (no overlay HTML required)
function renderPickerSheet(container, slot) {
  container.innerHTML = `<div style="padding:4px 0 10px;font-size:.88rem;font-weight:600;color:var(--g700)">Choose fragrance ${slot.toUpperCase()}</div>`;
  const search = document.createElement('input');
  search.placeholder = 'Search…';
  search.style.cssText = 'width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid var(--g200);border-radius:8px;font-size:.88rem;font-family:inherit;margin-bottom:10px;background:var(--paper)';
  container.appendChild(search);
  const list = document.createElement('div');
  list.style.cssText = 'border:1px solid var(--g200);border-radius:8px;overflow:hidden';
  container.appendChild(list);

  function fill(q) {
    list.innerHTML = '';
    const matches = q ? CAT.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.brand.toLowerCase().includes(q)
    ) : CAT;
    matches.forEach(frag => {
      const fc = getCmpFam(frag.family);
      const btn = document.createElement('button');
      btn.className = 'frag-picker-item';
      btn.innerHTML = `<div class="frag-picker-dot" style="background:${fc.accent}"></div>
        <div>
          <div class="frag-picker-item-name">${frag.name}</div>
          <div class="frag-picker-item-brand">${frag.brand}</div>
        </div>`;
      btn.addEventListener('click', () => {
        _selectFragForSlot(slot, frag);
        closeAllSheets();
        buildCompare();
      });
      list.appendChild(btn);
    });
  }
  fill('');
  search.addEventListener('input', e => fill(e.target.value.toLowerCase().trim()));
}

// ── Main render ──────────────────────────────────────────────────────
export function buildCompare() {
  const panel = document.getElementById('p-compare');
  if (!panel) return;

  // Re-read live values from renderers module (they're mutable lets)
  import('./renderers.js').then(r => {
    const fragA = r.CMP_A;
    const fragB = r.CMP_B;
    _render(panel, fragA, fragB);
  });
}

function _render(panel, fragA, fragB) {
  panel.innerHTML = '';

  // ── Header
  const hdr = document.createElement('div');
  hdr.className = 'cmp-hdr';
  hdr.innerHTML = `<div class="cmp-title">Compare</div>`;
  panel.appendChild(hdr);

  // ── Slot pickers
  const slots = document.createElement('div');
  slots.className = 'cmp-slots';

  ['a', 'b'].forEach(slot => {
    const frag = slot === 'a' ? fragA : fragB;
    const fc = frag ? getCmpFam(frag.family) : null;
    const btn = document.createElement('button');
    btn.className = 'cmp-slot' + (frag ? ' filled' : ' empty');
    if (frag) {
      btn.innerHTML = `
        <span class="cmp-slot-dot" style="background:${fc.accent}"></span>
        <span class="cmp-slot-info">
          <span class="cmp-slot-name">${frag.name}</span>
          <span class="cmp-slot-brand">${frag.brand}</span>
        </span>
        <span class="cmp-slot-change">change</span>`;
    } else {
      btn.innerHTML = `<span class="cmp-slot-plus">+</span><span class="cmp-slot-label">Choose fragrance ${slot.toUpperCase()}</span>`;
    }
    btn.addEventListener('click', () => openComparePicker(slot));
    slots.appendChild(btn);
  });
  panel.appendChild(slots);

  if (!fragA || !fragB) {
    const hint = document.createElement('div');
    hint.className = 'cmp-hint';
    hint.textContent = 'Select two fragrances to compare them side by side.';
    panel.appendChild(hint);

    // Suggestions: most similar pairs from owned
    const owned = CAT.filter(f => isOwned(f.id));
    if (owned.length >= 2) {
      let best = null, bestScore = 0;
      for (let i = 0; i < owned.length; i++) {
        for (let j = i + 1; j < owned.length; j++) {
          const s = scoreLayeringPair(owned[i], owned[j]);
          if (s > bestScore) { bestScore = s; best = [owned[i], owned[j]]; }
        }
      }
      if (best) {
        const sugLbl = document.createElement('div');
        sugLbl.className = 'cmp-sug-lbl';
        sugLbl.textContent = 'Try comparing';
        panel.appendChild(sugLbl);
        const sugWrap = document.createElement('div');
        sugWrap.className = 'cmp-sug-wrap';
        best.forEach((f, i) => {
          const fc = getCmpFam(f.family);
          const card = document.createElement('button');
          card.className = 'cmp-sug-card';
          card.style.borderColor = fc.accent + '44';
          card.innerHTML = `<div class="cmp-sug-dot" style="background:${fc.accent}"></div>
            <div><div class="cmp-sug-name">${f.name}</div><div class="cmp-sug-brand">${f.brand}</div></div>
            <div class="cmp-sug-score" style="color:${fc.accent}">${bestScore}</div>`;
          card.addEventListener('click', () => {
            _selectFragForSlot(i === 0 ? 'a' : 'b', f);
            buildCompare();
          });
          sugWrap.appendChild(card);
        });
        panel.appendChild(sugWrap);
      }
    }
    return;
  }

  // ── Both slots filled — render comparison
  const fcA = getCmpFam(fragA.family);
  const fcB = getCmpFam(fragB.family);
  const simScore = scoreSimilarity(fragA, fragB);
  const layerScore = scoreLayeringPair(fragA, fragB);

  // Score bar
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
  panel.appendChild(scoreRow);

  // Stats comparison table
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
  statsTable.appendChild(statRow('Sillage',
    SW[fragA.sillage], SW[fragB.sillage],
    fragA.sillage * 10, fragB.sillage * 10
  ));
  statsTable.appendChild(statRow('Structure',
    LW[fragA.layering], LW[fragB.layering],
    fragA.layering * 10, fragB.layering * 10
  ));
  panel.appendChild(statsTable);

  // Notes comparison
  const notesSec = document.createElement('div');
  notesSec.className = 'cmp-notes-sec';

  function notesBlock(frag, fc, side) {
    const block = document.createElement('div');
    block.className = `cmp-notes-block ${side}`;
    ['top', 'mid', 'base'].forEach(tier => {
      const tierRow = document.createElement('div');
      tierRow.className = 'cmp-notes-tier';
      const shared = frag[tier].filter(n =>
        (side === 'a' ? fragB : fragA)[tier].map(s => s.toLowerCase()).includes(n.toLowerCase())
      );
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
  const notesDiv = document.createElement('div');
  notesDiv.className = 'cmp-notes-div';
  notesDiv.textContent = 'vs';
  notesGrid.appendChild(notesDiv);
  notesGrid.appendChild(notesBlock(fragB, fcB, 'b'));
  notesSec.appendChild(notesGrid);
  panel.appendChild(notesSec);

  // Roles comparison
  const rolesRow = document.createElement('div');
  rolesRow.className = 'cmp-roles-row';
  const sharedRoles = fragA.roles.filter(r => fragB.roles.includes(r));
  const rolesA = fragA.roles.map(r => {
    const role = ROLES.find(x => x.id === r);
    return `<span class="cmp-role-chip${sharedRoles.includes(r) ? ' shared' : ''}">${role?.sym || ''} ${role?.name || r}</span>`;
  }).join('');
  const rolesB = fragB.roles.map(r => {
    const role = ROLES.find(x => x.id === r);
    return `<span class="cmp-role-chip${sharedRoles.includes(r) ? ' shared' : ''}">${role?.sym || ''} ${role?.name || r}</span>`;
  }).join('');
  rolesRow.innerHTML = `
    <div class="cmp-roles-side a">${rolesA}</div>
    <div class="cmp-roles-lbl">Roles</div>
    <div class="cmp-roles-side b">${rolesB}</div>`;
  panel.appendChild(rolesRow);

  // Open detail buttons
  const detailBtns = document.createElement('div');
  detailBtns.className = 'cmp-detail-btns';
  [{ frag: fragA, fc: fcA }, { frag: fragB, fc: fcB }].forEach(({ frag, fc }) => {
    const btn = document.createElement('button');
    btn.className = 'cmp-detail-btn';
    btn.innerHTML = `<span class="cmp-detail-dot" style="background:${fc.accent}"></span> ${frag.name} detail →`;
    btn.addEventListener('click', () => openFragDetail(frag));
    detailBtns.appendChild(btn);
  });
  panel.appendChild(detailBtns);
}
