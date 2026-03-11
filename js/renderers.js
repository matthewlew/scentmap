import { FAM, FAM_ORDER, FAM_COMPAT, ROLES, RM, CAT, CAT_MAP, NI_MAP } from './data.js';
import { gst, setState, isOwned, isWish, getAssigned, getPrimary, assignFrag, makePrimary, removeFromRole, getFragRoleStatus, getAllRolesForFrag } from './state.js';
import { scoreSimilarity, scoreLayeringPair, classifyDiscovery } from './scoring.js';
import { openDetail, pushDetail, closeDesktopDetail, closeAllSheets } from './ui.js';

export const SW = ['','Skin','Skin','Subtle','Subtle','Moderate','Moderate','Strong','Strong','Enveloping','Enormous'];
export const LW = ['','Linear','Linear','Simple','Simple','Balanced','Balanced','Layered','Layered','Complex','Deep'];

// Compare slots — managed here so renderers can reference them
export let CMP_A = null;
export let CMP_B = null;
export function setCmpA(f) { CMP_A = f; }
export function setCmpB(f) { CMP_B = f; }
export function _selectFragForSlot(slot, frag) {
  if (slot === 'a') CMP_A = frag;
  else CMP_B = frag;
}

// Family color helper used in Compare
export function getCmpFam(family) {
  const fm = FAM[family] || { color: '#888', label: family };
  return { accent: fm.color, label: fm.label };
}

// Catalog filter state
export let CAT_ROLE_FILTER = null;
export let CAT_STATE_FILTER = null;
export let CAT_BRAND_FILTER = null;
export let ROLES_BRAND_FILTER = null;
export function setCatRoleFilter(v) { CAT_ROLE_FILTER = v; }
export function setCatStateFilter(v) { CAT_STATE_FILTER = v; }
export function setCatBrandFilter(v) { CAT_BRAND_FILTER = v; }
export function setRolesBrandFilter(v) { ROLES_BRAND_FILTER = v; }

/* ── Link notes helper ── */
export function linkNotes(arr) {
  return arr.map(n => {
    const key = n.toLowerCase();
    const note = NI_MAP[key];
    return note ? `<button class="note-link" data-note="${n}">${n}</button>` : n;
  }).join(', ');
}

/* ── refreshAfterStateChange ── */
export function refreshAfterStateChange(id) {
  buildCapsule();
  buildRoles();
  const row = document.querySelector(`.scent-row[data-id="${id}"]`);
  if (row) { const f = CAT_MAP[id]; renderCatRow(row, f, FAM[f.family] || { color: '#888' }); }
  syncDots(id);
  const brands = [...new Set(CAT.map(f => f.brand))];
  brands.forEach(b => updBC(b, b.replace(/\s+/g, '-')));
  updCC();
}

export function syncDots(id) {
  document.querySelectorAll(`.dot[data-id="${id}"]`).forEach(d => d.className = `dot s-${gst(id)}`);
}

export function updBC(brand, key) {
  const frags = CAT.filter(f => f.brand === brand);
  const o = frags.filter(f => isOwned(f.id)).length, w = frags.filter(f => isWish(f.id)).length;
  const el = document.getElementById(`bc-${key}`);
  if (el) el.textContent = [o && `${o} owned`, w && `${w} wished`].filter(Boolean).join(' · ');
}

export function updCC() {
  const o = CAT.filter(f => isOwned(f.id)).length, w = CAT.filter(f => isWish(f.id)).length;
  const el = document.getElementById('cat-count');
  if (el) el.textContent = [o && `${o} owned`, w && `${w} wished`].filter(Boolean).join(' · ');
}

/* ══ NOTE FLOAT POPUP ══════════════════════════════════════════════ */
export function openNotePopup(note, triggerEl) {
  const fm = FAM[note.family] || { label: note.family, color: '#888' };
  const nl = note.name.toLowerCase();
  const inf = CAT.filter(f => [...f.top, ...f.mid, ...f.base].some(n => n.toLowerCase() === nl));
  document.getElementById('np-name').textContent = note.name;
  document.getElementById('np-family').textContent = fm.label;
  document.getElementById('np-desc').textContent = note.desc;
  const sortedInf = [...inf].sort((a, b) => a.name.localeCompare(b.name));
  const fe = document.getElementById('np-frags'); fe.innerHTML = '';
  if (sortedInf.length) {
    const lbl = document.createElement('div'); lbl.className = 'dc-nlbl'; lbl.style.marginBottom = '6px'; lbl.textContent = `In catalog (${sortedInf.length})`;
    fe.appendChild(lbl);
    const list = document.createElement('div'); list.style.cssText = 'border:1px solid var(--g200);border-radius:8px;overflow:hidden';
    sortedInf.forEach(f => {
      const fc = getCmpFam(f.family);
      const btn = document.createElement('button'); btn.className = 'frag-picker-item';
      btn.innerHTML = `<div class="frag-picker-dot" style="background:${fc.accent}"></div><div><div class="frag-picker-item-name">${f.name}</div><div class="frag-picker-item-brand">${f.brand}</div></div>`;
      btn.addEventListener('click', e => { e.stopPropagation(); closeNotePopup(); openFragDetail(f); });
      list.appendChild(btn);
    });
    fe.appendChild(list);
  }
  const popup = document.getElementById('note-popup');
  const rect = triggerEl.getBoundingClientRect();
  let left = rect.left, top = rect.bottom + 8;
  if (left + 248 > window.innerWidth - 12) left = window.innerWidth - 248 - 12;
  if (left < 8) left = 8;
  if (top + 220 > window.innerHeight) top = rect.top - 220;
  if (top < 8) top = 8;
  popup.style.left = left + 'px'; popup.style.top = top + 'px';
  document.getElementById('note-float-overlay').classList.add('open');
}

export function closeNotePopup() {
  document.getElementById('note-float-overlay').classList.remove('open');
}

/* ══ FRAG DETAIL ════════════════════════════════════════════════════ */
export function renderFragDetail(container, frag) {
  const fm = FAM[frag.family] || { label: frag.family, color: '#888' };

  container.innerHTML = `
    <div class="dc-name">${frag.name}</div>
    <div class="dc-brand">${frag.brand}</div>
    <div class="dc-ftag" style="background:${fm.color}">
      <span style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.3);display:inline-block;flex-shrink:0"></span>
      ${fm.label}
    </div>
    <div class="dc-collect-row" id="dc-collect-${frag.id}"></div>
    ${frag.description ? `<div class="dc-description">${frag.description}</div>` : ''}
    <div class="dc-cmp-cta-label">Compare with</div>
    <div class="dc-cmp-ctas" id="dc-ctas-${frag.id}"></div>
    <div class="dc-stats">
      <div class="dc-stat"><div class="dc-slbl">Sillage</div><div class="dc-bar"><div class="dc-fill" style="width:${frag.sillage * 10}%"></div></div><div class="dc-sval">${SW[frag.sillage]}</div></div>
      <div class="dc-stat"><div class="dc-slbl">Structure</div><div class="dc-bar"><div class="dc-fill" style="width:${frag.layering * 10}%"></div></div><div class="dc-sval">${LW[frag.layering]}</div></div>
    </div>
    <div class="dc-div"></div>
    <div class="dc-nlbl">Notes</div>
    <div class="dc-note"><span class="dc-nt">Top</span><span class="dc-nv">${linkNotes(frag.top)}</span></div>
    <div class="dc-note"><span class="dc-nt">Mid</span><span class="dc-nv">${linkNotes(frag.mid)}</span></div>
    <div class="dc-note"><span class="dc-nt">Base</span><span class="dc-nv">${linkNotes(frag.base)}</span></div>
    <p class="dc-notes-caveat">Key materials only — simplified pyramid</p>`;

  // Note links
  container.querySelectorAll('.note-link').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const note = NI_MAP[btn.dataset.note.toLowerCase()];
      if (note) pushDetail(c => renderNoteDetail(c, note));
    });
  });

  // Collection action row
  function renderCollectRow() {
    const el = container.querySelector(`#dc-collect-${frag.id}`); if (!el) return;
    const st = gst(frag.id);
    el.innerHTML = '';
    const wishBtn = document.createElement('button');
    wishBtn.className = 'dc-collect-btn' + (st === 'wish' ? ' active' : '');
    wishBtn.innerHTML = `<span class="dc-collect-icon">${st === 'wish' ? '♥' : '♡'}</span> Wishlist`;
    wishBtn.addEventListener('click', e => { e.stopPropagation(); setState(frag.id, st === 'wish' ? 'none' : 'wish'); refreshAfterStateChange(frag.id); renderCollectRow(); });
    const ownBtn = document.createElement('button');
    ownBtn.className = 'dc-collect-btn' + (st === 'owned' ? ' active' : '');
    ownBtn.innerHTML = `<span class="dc-collect-icon">${st === 'owned' ? '✓' : ''}</span> ${st === 'owned' ? 'Owned' : 'Mark owned'}`;
    ownBtn.addEventListener('click', e => { e.stopPropagation(); setState(frag.id, st === 'owned' ? 'none' : 'owned'); refreshAfterStateChange(frag.id); renderCollectRow(); });
    el.appendChild(wishBtn); el.appendChild(ownBtn);
  }
  renderCollectRow();

  // Compare CTAs
  _buildCompareCTAs(frag, container.querySelector(`#dc-ctas-${frag.id}`));

  // Similar shelf
  const scored = CAT
    .filter(f => f.id !== frag.id)
    .map(f => ({ f, score: scoreSimilarity(frag, f) }))
    .filter(x => x.score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (scored.length) {
    const lbl = document.createElement('div');
    lbl.className = 'dc-sim-lbl'; lbl.textContent = 'More like this';
    container.appendChild(lbl);
    const shelf = document.createElement('div'); shelf.className = 'dc-sim-shelf';

    function simReason(a, b) {
      const shBase = a.base.filter(n => b.base.map(s => s.toLowerCase()).includes(n.toLowerCase()));
      if (shBase.length) return `Shared base: ${shBase.slice(0, 2).join(', ')}`;
      if ((FAM_COMPAT[a.family]?.[b.family] ?? 0) >= .8) return `${a.family[0].toUpperCase() + a.family.slice(1)} × ${b.family}`;
      return '';
    }

    scored.forEach(({ f }) => {
      const fm2 = FAM[f.family] || { color: '#888' };
      const reason = simReason(frag, f);
      const badge = classifyDiscovery(frag, f);
      const row = document.createElement('button'); row.className = 'dc-sim-row';
      const namePart = reason
        ? `<span class="dc-sim-name">${f.name}<span class="dc-sim-name-brand"> · ${f.brand}</span></span><span class="dc-sim-reason">${reason}</span>`
        : `<span class="dc-sim-name">${f.name}</span><span class="dc-sim-brand">${f.brand}</span>`;
      row.innerHTML = `<span class="dc-sim-dot" style="background:${fm2.color}"></span>
        <span class="dc-sim-info">${namePart}</span>
        ${badge ? `<span class="dc-badge ${badge.type}">${badge.label}</span>` : ''}`;
      row.addEventListener('click', e => { e.stopPropagation(); pushDetail(c => renderFragDetail(c, f)); });
      shelf.appendChild(row);
    });
    container.appendChild(shelf);
  }

  // Layer suggestions
  buildLayerSuggestions(frag, container);

  // Role chips
  const roleLbl = document.createElement('div'); roleLbl.className = 'dc-sim-lbl'; roleLbl.textContent = 'Roles';
  container.appendChild(roleLbl);
  const chipsEl = document.createElement('div'); chipsEl.className = 'dc-role-chips';
  container.appendChild(chipsEl);
  buildRoleChips(frag, chipsEl);
}

/* ── Compare CTAs in detail panel ── */
function _buildCompareCTAs(frag, container) {
  if (!container) return;
  function makeBtn(existingFrag, targetSlot) {
    const fcSelf = getCmpFam(frag.family);
    const fcOther = existingFrag ? getCmpFam(existingFrag.family) : null;
    const btn = document.createElement('button');
    btn.className = 'dc-cmp-btn';
    const inner = existingFrag
      ? `<span class="dc-cmp-btn-dot" style="background:${fcSelf.accent}"></span>
        <span class="dc-cmp-btn-name">${frag.name}</span>
        <span class="dc-cmp-btn-vs">vs</span>
        <span class="dc-cmp-btn-dot" style="background:${fcOther.accent}"></span>
        <span class="dc-cmp-btn-name">${existingFrag.name}</span>`
      : `<span class="dc-cmp-btn-dot" style="background:${fcSelf.accent}"></span>
        <span class="dc-cmp-btn-name dc-cmp-btn-empty">Compare with ${frag.name}</span>`;
    btn.innerHTML = `
      <span class="dc-cmp-btn-text" style="display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden">${inner}</span>
      <span class="dc-cmp-btn-arrow">→</span>`;
    btn.addEventListener('click', () => {
      window.haptic?.('medium');
      if (existingFrag) {
        const otherSlot = targetSlot === 'a' ? 'b' : 'a';
        _selectFragForSlot(otherSlot, frag);
      } else {
        _selectFragForSlot(targetSlot, frag);
      }
      import('./nav.js').then(({ go }) => go('compare', null));
      closeDesktopDetail?.();
      closeAllSheets?.();
    });
    return btn;
  }
  container.appendChild(makeBtn(CMP_A, 'a'));
  container.appendChild(makeBtn(CMP_B, 'b'));
}

/* ── Layer suggestions in frag detail ── */
function buildLayerSuggestions(frag, container) {
  const owned = CAT.filter(f => isOwned(f.id) && f.id !== frag.id);
  if (!owned.length) return;
  function layerReason(a, b) {
    const sillDiff = b.sillage - a.sillage;
    if (Math.abs(sillDiff) >= 3) return sillDiff > 0 ? `Wear ${b.name} over — projects further` : `Wear ${b.name} under — anchors the blend`;
    const allA = [...a.top, ...a.mid, ...a.base].map(n => n.toLowerCase());
    const uniqueB = [...b.base, ...b.mid].find(n => !allA.includes(n.toLowerCase()));
    if (uniqueB) return `Adds ${uniqueB}`;
    return `${FAM[b.family]?.label || b.family} × ${FAM[a.family]?.label || a.family}`;
  }
  const candidates = owned
    .map(f => ({ f, score: scoreLayeringPair(frag, f) }))
    .filter(x => x.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
  if (!candidates.length) return;
  const lbl = document.createElement('div');
  lbl.className = 'dc-sim-lbl'; lbl.textContent = 'Layer with what you own';
  container.appendChild(lbl);
  const shelf = document.createElement('div'); shelf.className = 'dc-sim-shelf';
  candidates.forEach(({ f, score }) => {
    const fm2 = FAM[f.family] || { color: '#888' };
    const reason = layerReason(frag, f);
    const row = document.createElement('button'); row.className = 'dc-sim-row';
    const namePart = reason
      ? `<span class="dc-sim-name">${f.name}<span class="dc-sim-name-brand"> · ${f.brand}</span></span><span class="dc-sim-reason">${reason}</span>`
      : `<span class="dc-sim-name">${f.name}</span><span class="dc-sim-brand">${f.brand}</span>`;
    row.innerHTML = `<span class="dc-sim-dot" style="background:${fm2.color}"></span>
      <span class="dc-sim-info">${namePart}</span>
      <span class="dc-layer-score-badge">${score}</span>
      <span class="dc-sim-state is-owned">Owned</span>`;
    row.addEventListener('click', e => { e.stopPropagation(); pushDetail(c => renderFragDetail(c, f)); });
    shelf.appendChild(row);
  });
  container.appendChild(shelf);
}

/* ── Role chips ── */
export function buildRoleChips(frag, chipsEl) {
  if (!chipsEl) return;
  chipsEl.innerHTML = '';
  ROLES.forEach(role => {
    const status = getFragRoleStatus(frag.id, role.id);
    const isPrimary = status === 'primary';
    const isSecondary = typeof status === 'number';
    const chip = document.createElement('button');
    chip.className = 'dc-role-chip' + (isPrimary ? ' assigned-primary' : isSecondary ? ' assigned-secondary' : '');
    let orderLabel = '';
    if (isPrimary) orderLabel = '<span class="chip-order">✓</span>';
    else if (isSecondary) orderLabel = `<span class="chip-order">${status}</span>`;
    const addIcon = (!isPrimary && !isSecondary) ? '<span class="chip-add">+</span>' : '';
    chip.innerHTML = `<span class="chip-sym">${role.sym}</span> ${role.name}${orderLabel}${addIcon}`;
    chip.title = isPrimary ? `Remove ${frag.name} from ${role.name}`
      : isSecondary ? `Make ${frag.name} primary for ${role.name}`
        : `Assign ${frag.name} to ${role.name}`;
    chip.addEventListener('click', e => {
      e.stopPropagation();
      if (isPrimary) removeFromRole(role.id, frag.id);
      else if (isSecondary) makePrimary(role.id, frag.id);
      else { assignFrag(role.id, frag.id); window.haptic?.('success'); }
      buildRoleChips(frag, chipsEl);
      buildCapsule(); buildRoles();
    });
    chipsEl.appendChild(chip);
  });
}

/* ══ NOTE DETAIL ════════════════════════════════════════════════════ */
export function renderNoteDetail(container, note) {
  const fm = FAM[note.family] || { label: note.family, color: '#888' };
  const nl = note.name.toLowerCase();
  const inf = CAT.filter(f => [...f.top, ...f.mid, ...f.base].some(n => n.toLowerCase() === nl));
  container.innerHTML = `<div class="np-name">${note.name}</div>
    <div class="np-family">${fm.label}</div>
    <div class="np-desc">${note.desc}</div>
    ${inf.length ? `<div class="np-frags" style="margin-top:14px"><div class="dc-nlbl" style="margin:0 0 6px">In catalog (${inf.length})</div><div id="_nfl" style="border:1px solid var(--g200);border-radius:8px;overflow:hidden"></div></div>` : ''}`;
  if (inf.length) {
    const span = container.querySelector('#_nfl');
    [...inf].sort((a, b) => a.name.localeCompare(b.name)).forEach(f => {
      const fc = getCmpFam(f.family);
      const btn = document.createElement('button'); btn.className = 'frag-picker-item';
      btn.innerHTML = `<div class="frag-picker-dot" style="background:${fc.accent}"></div><div><div class="frag-picker-item-name">${f.name}</div><div class="frag-picker-item-brand">${f.brand}</div></div>`;
      btn.addEventListener('click', e => { e.stopPropagation(); pushDetail(c => renderFragDetail(c, f)); });
      span.appendChild(btn);
    });
  }
}

/* ══ OPEN HELPERS ═══════════════════════════════════════════════════ */
export function openFragDetail(frag) { openDetail(c => renderFragDetail(c, frag)); }

/* ══ HOUSE DETAIL ═══════════════════════════════════════════════════ */
export function renderHouseDetail(container, brand) {
  const frags = CAT.filter(f => f.brand === brand).sort((a, b) => a.name.localeCompare(b.name));
  container.innerHTML = `<div class="house-detail-wrap">
    <div class="house-detail-name">${brand}</div>
    <div class="house-detail-count">${frags.length} fragrance${frags.length !== 1 ? 's' : ''}</div>
    <div class="house-detail-list" id="house-list-${brand.replace(/\s+/g, '-')}"></div>
  </div>`;
  const list = container.querySelector('.house-detail-list');
  frags.forEach(frag => {
    const fc = getCmpFam(frag.family);
    const btn = document.createElement('button');
    btn.className = 'frag-picker-item';
    btn.innerHTML = `<div class="frag-picker-dot" style="background:${fc.accent}"></div>
      <div>
        <div class="frag-picker-item-name">${frag.name}</div>
        <div class="frag-picker-item-brand">${(FAM[frag.family] || {}).label || frag.family}</div>
      </div>`;
    btn.addEventListener('click', () => { window.haptic?.('light'); pushDetail(c => renderFragDetail(c, frag)); });
    list.appendChild(btn);
  });
}
export function openHouseDetail(brand) { openDetail(c => renderHouseDetail(c, brand)); }

/* ══ PICKER ══════════════════════════════════════════════════════════ */
export function openPicker(roleId) { openDetail(c => renderPicker(c, roleId)); }

export function renderPicker(container, roleId) {
  const role = RM[roleId];
  const assigned = getAssigned(roleId);
  const primaryId = assigned[0] || null;
  const primaryFrag = primaryId ? CAT_MAP[primaryId] : null;
  const secondaries = assigned.slice(1).map(id => CAT_MAP[id]).filter(Boolean);

  const hdr = document.createElement('div'); hdr.className = 'picker-header';
  hdr.innerHTML = `<div class="picker-title">${role.sym} ${role.name}</div><div class="picker-sub">${role.desc}</div>`;
  container.appendChild(hdr);

  const hero = document.createElement('div'); hero.className = 'picker-hero';
  if (!primaryFrag) {
    hero.innerHTML = `<div class="picker-hero-empty">
      <div class="picker-hero-sym-empty">${role.sym}</div>
      <div class="picker-hero-empty-label">No fragrance assigned</div>
      <div class="picker-hero-empty-desc">${role.long.split('.')[0]}.</div>
    </div>
    <div class="picker-role-sym-line">${role.symLine}</div>`;
  } else {
    const fm = FAM[primaryFrag.family] || { color: '#888' };
    const isW = isWish(primaryFrag.id) && !isOwned(primaryFrag.id);
    let secHTML = '';
    if (secondaries.length) {
      secHTML = `<div class="picker-hero-secondary">
        <div class="picker-hero-sec-label">Also assigned</div>
        ${secondaries.map((f, i) => `<div class="picker-hero-sec-row">
          <span class="picker-hero-sec-idx">${i + 2}</span>
          <span class="picker-hero-sec-name${isWish(f.id) && !isOwned(f.id) ? ' is-wish' : ''}">${f.name}</span>
        </div>`).join('')}
      </div>`;
    }
    hero.innerHTML = `<div class="picker-hero-filled">
      <div class="picker-hero-sym" style="color:${fm.color}">${role.sym}</div>
      <div class="picker-hero-info">
        <div class="picker-hero-name${isW ? ' is-wish' : ''}">${primaryFrag.name}</div>
        <div class="picker-hero-brand">${primaryFrag.brand}</div>
        <div class="picker-hero-notes"><strong>Top</strong>${primaryFrag.top.join(', ')}</div>
      </div>
    </div>
    ${secHTML}
    <div class="picker-role-sym-line">${role.symLine}</div>`;
  }
  container.appendChild(hero);

  const carousel = CAT.filter(f => f.roles.includes(roleId) && gst(f.id) === 'none' && !assigned.includes(f.id));
  const ownedTagged = CAT.filter(f => f.roles.includes(roleId) && isOwned(f.id) && !assigned.includes(f.id));
  const ownedOther = CAT.filter(f => !f.roles.includes(roleId) && isOwned(f.id) && !assigned.includes(f.id));
  const wishedTagged = CAT.filter(f => f.roles.includes(roleId) && isWish(f.id) && !assigned.includes(f.id));
  const wishedOther = CAT.filter(f => !f.roles.includes(roleId) && isWish(f.id) && !assigned.includes(f.id));
  const wished = [...wishedTagged, ...wishedOther];

  if (assigned.length) {
    const lbl = document.createElement('div'); lbl.className = 'picker-sec-lbl'; lbl.textContent = 'Assigned to this role'; container.appendChild(lbl);
    const list = document.createElement('div'); list.className = 'picker-list';
    assigned.forEach((fid, i) => {
      const f = CAT_MAP[fid]; if (!f) return;
      const fm = FAM[f.family] || { color: '#888' };
      const row = document.createElement('div'); row.className = 'picker-row' + (i === 0 ? ' is-primary' : '');
      const badge = document.createElement('span');
      badge.className = 'picker-order-badge' + (i === 0 ? ' primary-badge' : '');
      badge.textContent = i === 0 ? 'Primary' : `#${i + 1}`;
      const nameBtn = document.createElement('button'); nameBtn.className = 'picker-name-btn' + (isWish(f.id) && !isOwned(f.id) ? ' is-wish' : ''); nameBtn.textContent = f.name;
      nameBtn.addEventListener('click', e => { e.stopPropagation(); pushDetail(c => renderFragDetail(c, f)); });
      const info = document.createElement('div'); info.className = 'picker-info';
      info.appendChild(nameBtn);
      const br = document.createElement('div'); br.className = 'picker-brand-row'; br.textContent = f.brand; info.appendChild(br);
      const fdot = document.createElement('div'); fdot.className = 'picker-fdot'; fdot.style.background = fm.color;
      const removeBtn = document.createElement('button'); removeBtn.className = 'tab'; removeBtn.style.cssText = 'font-size:.65rem;padding:3px 7px'; removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', e => {
        e.stopPropagation();
        removeFromRole(roleId, fid);
        buildCapsule(); buildRoles();
        container.innerHTML = ''; renderPicker(container, roleId);
      });
      row.appendChild(fdot); row.appendChild(info); row.appendChild(badge); row.appendChild(removeBtn);
      list.appendChild(row);
    });
    container.appendChild(list);
  }

  if (carousel.length) {
    const lbl = document.createElement('div'); lbl.className = 'picker-sec-lbl'; lbl.textContent = `Explore for this role (${carousel.length})`; container.appendChild(lbl);
    const wrap = document.createElement('div'); wrap.className = 'carousel-wrap';
    const row = document.createElement('div'); row.className = 'carousel';
    carousel.forEach(frag => {
      const fm = FAM[frag.family] || { color: '#888' };
      const card = document.createElement('div'); card.className = 'carousel-card';
      card.innerHTML = `<div class="carousel-card-name">${frag.name}</div>
        <div class="carousel-card-brand">${frag.brand}</div>
        <div class="carousel-card-family"><div class="fam-dot" style="background:${fm.color}"></div><span style="font-size:.6rem;color:var(--g500)">${fm.label}</span></div>`;
      card.addEventListener('click', e => { e.stopPropagation(); pushDetail(c => renderFragDetail(c, frag)); });
      row.appendChild(card);
    });
    wrap.appendChild(row); container.appendChild(wrap);
  }

  function makeRow(frag) {
    const fm = FAM[frag.family] || { color: '#888' };
    const w = isWish(frag.id) && !isOwned(frag.id);
    const row = document.createElement('div'); row.className = 'picker-row';
    const nameBtn = document.createElement('button'); nameBtn.className = 'picker-name-btn' + (w ? ' is-wish' : ''); nameBtn.textContent = frag.name;
    nameBtn.addEventListener('click', e => { e.stopPropagation(); pushDetail(c => renderFragDetail(c, frag)); });
    const info = document.createElement('div'); info.className = 'picker-info';
    info.appendChild(nameBtn);
    const br = document.createElement('div'); br.className = 'picker-brand-row'; br.textContent = frag.brand; info.appendChild(br);
    const fdot = document.createElement('div'); fdot.className = 'picker-fdot'; fdot.style.background = fm.color;
    const addBtn = document.createElement('button'); addBtn.className = 'tab active'; addBtn.style.cssText = 'font-size:.65rem;padding:3px 7px;background:var(--black);color:#fff;box-shadow:none'; addBtn.textContent = 'Add';
    addBtn.addEventListener('click', e => {
      e.stopPropagation();
      assignFrag(roleId, frag.id);
      window.haptic?.('success');
      buildCapsule(); buildRoles();
      container.innerHTML = ''; renderPicker(container, roleId);
    });
    row.appendChild(fdot); row.appendChild(info); row.appendChild(addBtn);
    return row;
  }

  if (ownedTagged.length) {
    const lbl = document.createElement('div'); lbl.className = 'picker-sec-lbl'; lbl.textContent = `Matches this role — owned (${ownedTagged.length})`; container.appendChild(lbl);
    const list = document.createElement('div'); list.className = 'picker-list'; ownedTagged.forEach(f => list.appendChild(makeRow(f))); container.appendChild(list);
  }
  if (ownedOther.length) {
    const lbl = document.createElement('div'); lbl.className = 'picker-sec-lbl'; lbl.textContent = `Other owned (${ownedOther.length})`; container.appendChild(lbl);
    const list = document.createElement('div'); list.className = 'picker-list'; ownedOther.forEach(f => list.appendChild(makeRow(f))); container.appendChild(list);
  }
  if (!ownedTagged.length && !ownedOther.length && !assigned.length) {
    const roleAll = CAT.filter(f => f.roles.includes(roleId));
    if (roleAll.length) {
      const lbl = document.createElement('div'); lbl.className = 'picker-sec-lbl';
      lbl.innerHTML = `All fragrances for this role <span style="color:var(--g400);font-weight:400">(${roleAll.length})</span>`;
      container.appendChild(lbl);
      const hint = document.createElement('div'); hint.style.cssText = 'font-size:.68rem;color:var(--g400);margin-bottom:10px;line-height:1.5';
      hint.textContent = 'Tap a fragrance to learn more, or add directly to your capsule.';
      container.appendChild(hint);
      const list = document.createElement('div'); list.className = 'picker-list';
      roleAll.forEach(f => list.appendChild(makeRow(f)));
      container.appendChild(list);
    } else {
      const msg = document.createElement('div'); msg.className = 'picker-empty'; msg.textContent = 'No fragrances found for this role.'; container.appendChild(msg);
    }
  }
  if (wished.length) {
    const lbl = document.createElement('div'); lbl.className = 'picker-sec-lbl'; lbl.textContent = `Wishlist (${wished.length})`; container.appendChild(lbl);
    const list = document.createElement('div'); list.className = 'picker-list'; wished.forEach(f => list.appendChild(makeRow(f))); container.appendChild(list);
  }
}

/* ══ AUTO-ASSIGN ════════════════════════════════════════════════════ */
export function autoAssignFromOwned() {
  ROLES.forEach(r => {
    if (getPrimary(r.id)) return;
    const candidates = CAT
      .filter(f => f.roles.includes(r.id) && isOwned(f.id))
      .sort((a, b) => b.layering - a.layering);
    if (candidates[0]) assignFrag(r.id, candidates[0].id);
  });
}

/* ══ HIGHLIGHT ROWS ═════════════════════════════════════════════════ */
export function highlightRows(attrKey, matchVal) {
  document.querySelectorAll('.scent-row').forEach(row => {
    if (matchVal === null) { row.classList.remove('fam-dim'); return; }
    let match;
    if (attrKey === 'roles') {
      const roles = row.dataset.roles || '';
      match = roles.split(' ').includes(matchVal);
    } else {
      match = row.dataset[attrKey] === matchVal;
    }
    row.classList.toggle('fam-dim', !match);
  });
}

/* ══ BUILD CAPSULE ══════════════════════════════════════════════════ */
export function buildCapsule() {
  const scentmapPanel = document.getElementById('p-scentmap');
  let autoBtn = document.getElementById('capsule-auto-btn');
  if (!autoBtn) {
    autoBtn = document.createElement('button');
    autoBtn.id = 'capsule-auto-btn';
    autoBtn.className = 'capsule-auto-btn';
    autoBtn.textContent = 'Auto-fill from collection ▸';
    autoBtn.addEventListener('click', () => { autoAssignFromOwned(); buildCapsule(); buildRoles(); });
    const grid = document.getElementById('capsule-grid');
    scentmapPanel.insertBefore(autoBtn, grid);
  }
  const hasOwned = CAT.some(f => isOwned(f.id));
  const hasEmpty = ROLES.some(r => !getPrimary(r.id));
  autoBtn.style.display = (hasOwned && hasEmpty) ? 'block' : 'none';

  const grid = document.getElementById('capsule-grid'); grid.innerHTML = '';
  ROLES.forEach(role => {
    const assigned = getAssigned(role.id);
    const primaryId = assigned[0] || null;
    const primaryFrag = primaryId ? CAT_MAP[primaryId] : null;
    const fm = primaryFrag ? FAM[primaryFrag.family] : null;
    const symColor = fm ? fm.color : '';
    const cell = document.createElement('div');
    cell.className = 'cap-cell ' + (primaryFrag ? 'filled' : 'empty');
    let inner = `<div class="cap-role">${role.name}</div>
      <div class="cap-desc-short" style="opacity:${primaryFrag ? .55 : .45}">${role.desc}</div>
      <div class="cap-sym" style="${symColor ? `color:${symColor}` : ''}">${role.sym}</div>`;
    if (primaryFrag) {
      const isW = isWish(primaryFrag.id) && !isOwned(primaryFrag.id);
      inner += `<div class="cap-frag-wrap">
        <div class="cap-primary${isW ? ' is-wish' : ''}">${primaryFrag.name}</div>
        <div class="cap-frag-brand">${primaryFrag.brand}</div>`;
      if (assigned.length > 1) inner += `<div class="cap-more">+${assigned.length - 1} more</div>`;
      inner += `</div>`;
    } else {
      inner += `<div class="cap-assign-cta"><div class="cap-plus">+</div><span>Assign</span></div>`;
    }
    if (assigned.length > 1) inner += `<div class="cap-count">${assigned.length}</div>`;
    cell.innerHTML = inner;
    cell.addEventListener('click', () => openPicker(role.id));
    grid.appendChild(cell);
  });

  let legend = document.getElementById('cap-role-legend');
  if (!legend) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'cap-legend-toggle';
    toggleBtn.id = 'cap-legend-toggle';
    toggleBtn.textContent = 'What are these roles? ▾';
    legend = document.createElement('div');
    legend.className = 'cap-legend';
    legend.id = 'cap-role-legend';
    legend.innerHTML = ROLES.map(r => `
      <div class="cap-legend-row">
        <div class="cap-legend-sym">${r.sym}</div>
        <div class="cap-legend-text">
          <div class="cap-legend-name">${r.name}</div>
          <div class="cap-legend-desc">${r.long || r.desc}</div>
        </div>
      </div>`).join('');
    toggleBtn.addEventListener('click', e => {
      e.stopPropagation();
      legend.classList.toggle('open');
      toggleBtn.textContent = legend.classList.contains('open') ? 'Hide roles ▴' : 'What are these roles? ▾';
    });
    scentmapPanel.appendChild(toggleBtn);
    scentmapPanel.appendChild(legend);
  }
}

/* ══ BUILD ROLES ════════════════════════════════════════════════════ */
export function buildRoles() {
  const body = document.getElementById('roles-body'); body.innerHTML = '';

  const brandBar = document.createElement('div'); brandBar.className = 'roles-brand-bar';
  const allBrands = [...new Set(CAT.map(f => f.brand))].sort();
  const allRoleBtn = document.createElement('button');
  allRoleBtn.className = 'tab' + (ROLES_BRAND_FILTER === null ? ' active' : '');
  allRoleBtn.textContent = 'All brands';
  allRoleBtn.addEventListener('click', () => {
    ROLES_BRAND_FILTER = null;
    brandBar.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === allRoleBtn));
    buildRoles();
  });
  brandBar.appendChild(allRoleBtn);
  allBrands.forEach(brand => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (ROLES_BRAND_FILTER === brand ? ' active' : '');
    btn.textContent = brand;
    btn.addEventListener('click', () => {
      ROLES_BRAND_FILTER = brand;
      brandBar.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === btn));
      buildRoles();
    });
    brandBar.appendChild(btn);
  });
  body.appendChild(brandBar);

  ROLES.forEach(role => {
    let frags = CAT.filter(f => f.roles.includes(role.id));
    if (ROLES_BRAND_FILTER) frags = frags.filter(f => f.brand === ROLES_BRAND_FILTER);
    const assigned = getAssigned(role.id);
    const oc = frags.filter(f => isOwned(f.id)).length;
    const wc = frags.filter(f => isWish(f.id)).length;
    const ac = assigned.length;
    const meta = [ac && `${ac} assigned`, oc && `${oc} owned`, wc && `${wc} wished`].filter(Boolean).join(' · ') || `${frags.length} catalogued`;
    const sec = document.createElement('div'); sec.className = 'rs';
    sec.innerHTML = `<div class="rs-head"><span class="rs-sym">${role.sym}</span><span class="rs-name">${role.name}</span><span class="rs-meta">${meta}</span></div>
      <div class="rs-tagline">${role.desc}</div>
      <div class="rs-body">${role.long}</div>`;
    if (!frags.length) { sec.innerHTML += `<div style="font-size:.76rem;color:var(--g450);padding:3px 0">No fragrances catalogued for this role.</div>`; body.appendChild(sec); return; }

    const fk = [...new Set(frags.map(f => f.family))];
    const fr = document.createElement('div'); fr.className = 'fam-chips';
    fk.forEach(k => { const fm = FAM[k]; if (!fm) return; const ch = document.createElement('div'); ch.className = 'fam-chip'; ch.dataset.fam = k; ch.style.background = fm.color; ch.textContent = fm.label; fr.appendChild(ch); });
    sec.appendChild(fr);

    const chartSec = document.createElement('div'); chartSec.className = 'chart-section';
    const outer = document.createElement('div'); outer.className = 'chart-outer';
    outer.innerHTML = `<div class="y-title">Layering</div>
      <div class="y-labels"><div class="y-lbl">Complex</div><div class="y-lbl">Layered</div><div class="y-lbl">Balanced</div><div class="y-lbl">Single</div></div>`;
    const ca = document.createElement('div'); ca.className = 'chart-area';

    const placed = [];
    function getOffset(px, py) {
      if (!placed.some(p => Math.abs(p.x - px) < 9 && Math.abs(p.y - py) < 9)) { placed.push({ x: px, y: py }); return { x: px, y: py }; }
      for (let r = 12; r <= 48; r += 12) for (let a = 0; a < 360; a += 45) {
        const nx = Math.max(2, Math.min(98, px + Math.cos(a * Math.PI / 180) * r));
        const ny = Math.max(2, Math.min(98, py + Math.sin(a * Math.PI / 180) * r));
        if (!placed.some(p => Math.abs(p.x - nx) < 9 && Math.abs(p.y - ny) < 9)) { placed.push({ x: nx, y: ny }); return { x: nx, y: ny }; }
      }
      const fb = { x: Math.min(98, px + 16), y: py }; placed.push(fb); return fb;
    }
    const lblRects = [];
    function placeLabel(px, py, text) {
      const w = text.length * 5 + 8, h = 12, gap = 8;
      const preferred = py < 50 ? ['lbl-below', 'lbl-right', 'lbl-left', 'lbl-above'] : ['lbl-above', 'lbl-right', 'lbl-left', 'lbl-below'];
      const rects = {
        'lbl-above': { x: px - w / 2 * 0.3, y: py + gap * 0.4, w: w * 0.3, h: h * 0.4 },
        'lbl-below': { x: px - w / 2 * 0.3, y: py - gap * 0.4 - h * 0.4, w: w * 0.3, h: h * 0.4 },
        'lbl-right': { x: px + gap * 0.3, y: py - h / 2 * 0.4, w: w * 0.3, h: h * 0.4 },
        'lbl-left': { x: px - gap * 0.3 - w * 0.3, y: py - h / 2 * 0.4, w: w * 0.3, h: h * 0.4 },
      };
      function ov(r1, r2) { return !(r1.x + r1.w < r2.x || r2.x + r2.w < r1.x || r1.y + r1.h < r2.y || r2.y + r2.h < r1.y); }
      for (const cls of preferred) {
        const rect = rects[cls];
        if (!lblRects.some(r => ov(r, rect))) { lblRects.push(rect); return cls; }
      }
      lblRects.push(rects[preferred[0]]); return preferred[0];
    }

    const sorted = [...frags].sort((a, b) => b.layering - a.layering);
    sorted.forEach(frag => {
      const fm = FAM[frag.family] || { color: '#888' };
      const st = gst(frag.id);
      const { x: px, y: py } = getOffset(frag.sillage * 10, frag.layering * 10);
      const dot = document.createElement('div');
      dot.className = `dot s-${st}`; dot.dataset.id = frag.id;
      dot.style.cssText = `left:${px}%;bottom:${py}%`;
      const dotStyle = st === 'wish' ? `background:#fff;box-shadow:0 0 0 2px ${fm.color};border:2px solid ${fm.color};`
        : `background:${fm.color};border:2px solid rgba(255,255,255,.85);box-shadow:0 0 0 1px rgba(0,0,0,.2);`;
      const suffix = st === 'owned' ? ' ✓' : '';
      const labelText = frag.name + suffix;
      const lblCls = placeLabel(px, py, labelText);
      dot.innerHTML = `<div class="dot-c" style="${dotStyle}"></div><div class="dot-lbl ${lblCls}">${labelText}</div>`;
      dot.addEventListener('click', e => { e.stopPropagation(); openFragDetail(frag); });
      ca.appendChild(dot);
    });

    outer.appendChild(ca);
    outer.innerHTML += `<div class="x-labels"><span>Skin</span><span>Moderate</span><span>Enormous</span></div><div class="x-title">Sillage</div>`;
    chartSec.appendChild(outer); sec.appendChild(chartSec); body.appendChild(sec);
  });
}

/* ══ ROLE-FIRST LANDING ═════════════════════════════════════════════ */
export function buildRoleLanding() {
  const body = document.getElementById('cat-body'); body.innerHTML = '';
  const wrap = document.createElement('div'); wrap.className = 'role-landing';
  const lbl = document.createElement('div'); lbl.className = 'sec-label';
  lbl.innerHTML = '<span>What are you wearing it for?</span><span class="sub">Pick a role to explore</span>';
  wrap.appendChild(lbl);
  const grid = document.createElement('div'); grid.className = 'role-landing-grid';
  ROLES.forEach(role => {
    const frags = CAT.filter(f => f.roles.includes(role.id));
    const card = document.createElement('button'); card.className = 'role-landing-card';
    card.innerHTML = `<div class="rlc-sym">${role.sym}</div>
      <div class="rlc-name">${role.name}</div>
      <div class="rlc-desc">${role.desc}</div>
      <div class="rlc-count">${frags.length} fragrances</div>`;
    card.addEventListener('click', () => {
      document.getElementById('cat-role-filter')?.remove();
      buildCatalog(role.id);
    });
    grid.appendChild(card);
  });
  wrap.appendChild(grid); body.appendChild(wrap);
}

/* ══ BUILD CATALOG ══════════════════════════════════════════════════ */
export function buildCatalog(roleFilter) {
  CAT_ROLE_FILTER = (roleFilter === undefined ? CAT_ROLE_FILTER : roleFilter);
  roleFilter = CAT_ROLE_FILTER;
  const body = document.getElementById('cat-body'); body.innerHTML = '';

  const filterBar = document.createElement('div'); filterBar.className = 'cat-filter-bar';
  const allBtn = document.createElement('button');
  allBtn.className = 'tab' + (roleFilter === null ? ' active' : '');
  allBtn.textContent = 'All';
  allBtn.addEventListener('click', () => buildCatalog(null));
  filterBar.appendChild(allBtn);
  ROLES.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (roleFilter === r.id ? ' active' : '');
    btn.innerHTML = `${r.sym} ${r.name}`;
    btn.addEventListener('click', () => buildCatalog(r.id));
    btn.addEventListener('mouseenter', () => highlightRows('roles', r.id));
    btn.addEventListener('mouseleave', () => highlightRows('roles', null));
    filterBar.appendChild(btn);
  });
  body.appendChild(filterBar);

  const search = (document.getElementById('cat-search')?.value || '').toLowerCase().trim();
  let visibleCat = roleFilter ? CAT.filter(f => f.roles.includes(roleFilter)) : CAT;
  if (CAT_BRAND_FILTER) visibleCat = visibleCat.filter(f => f.brand === CAT_BRAND_FILTER);
  if (CAT_STATE_FILTER === 'owned') visibleCat = visibleCat.filter(f => isOwned(f.id));
  else if (CAT_STATE_FILTER === 'wish') visibleCat = visibleCat.filter(f => isWish(f.id));
  if (search) visibleCat = visibleCat.filter(f =>
    f.name.toLowerCase().includes(search) ||
    f.brand.toLowerCase().includes(search) ||
    [...(f.top || []), ...(f.mid || []), ...(f.base || [])].some(n => n.toLowerCase().includes(search))
  );

  if (!visibleCat.length) {
    const empty = document.createElement('div'); empty.className = 'cat-empty';
    empty.textContent = search ? `No matches for "${search}"` : 'No fragrances in this view.';
    body.appendChild(empty);
    updCC(); return;
  }

  const brands = [...new Set(visibleCat.map(f => f.brand))].sort((a, b) => a.localeCompare(b));
  brands.forEach(brand => {
    const frags = visibleCat.filter(f => f.brand === brand).sort((a, b) => a.name.localeCompare(b.name));
    const key = brand.replace(/\s+/g, '-') + (roleFilter || '');
    const sec = document.createElement('div'); sec.className = 'cat-section';
    sec.innerHTML = `<div class="brand-hdr"><button class="brand-n brand-hdr-btn" data-brand="${brand}">${brand}<span class="brand-total">${frags.length}</span></button><div class="brand-c" id="bc-${key}"></div></div>`;
    sec.querySelector('.brand-hdr-btn')?.addEventListener('click', () => openHouseDetail(brand));
    const list = document.createElement('div'); list.className = 'scent-list';
    list.addEventListener('click', e => {
      const row = e.target.closest('.scent-row'); if (!row) return;
      const id = row.dataset.id; const frag = CAT_MAP[id]; if (!frag) return;
      openFragDetail(frag);
    });
    frags.forEach(frag => {
      const fm = FAM[frag.family] || { color: '#888' };
      const row = document.createElement('div'); row.dataset.id = frag.id;
      renderCatRow(row, frag, fm, search); list.appendChild(row);
    });
    sec.appendChild(list); body.appendChild(sec);
    const bcEl = document.getElementById(`bc-${key}`);
    if (bcEl) { const o = frags.filter(f => isOwned(f.id)).length, w = frags.filter(f => isWish(f.id)).length; bcEl.textContent = [o && `${o} owned`, w && `${w} wished`].filter(Boolean).join(' · '); }
  });
  updCC();
  let sel = document.getElementById('cat-role-filter');
  if (!sel) { sel = document.createElement('select'); sel.id = 'cat-role-filter'; sel.style.display = 'none'; document.body.appendChild(sel); }
  sel.value = roleFilter || '';
}

export function initCatalogControls() {
  const stateBar = document.getElementById('cat-state-bar');
  const stateBarM = document.getElementById('cat-state-bar-m');
  const brandBar = document.getElementById('cat-brand-bar');
  const brandBarM = document.getElementById('cat-brand-bar-m');
  const brands = [...new Set(CAT.map(f => f.brand))].sort();

  const allStateBtns = [];
  function makeStateBtn(label, val, container) {
    const btn = document.createElement('button');
    btn.className = 'tab' + (CAT_STATE_FILTER === val ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      CAT_STATE_FILTER = val;
      allStateBtns.forEach(b => b.classList.toggle('active', b.dataset.val === (val === null ? '' : val)));
      buildCatalog();
    });
    btn.dataset.val = val === null ? '' : val;
    allStateBtns.push(btn);
    container.appendChild(btn);
    return btn;
  }
  [['All', null], ['Owned', 'owned'], ['Wishlist', 'wish']].forEach(([label, val]) => {
    makeStateBtn(label, val, stateBar);
    if (stateBarM) makeStateBtn(label, val, stateBarM);
  });

  const allBrandBtns = [];
  function makeBrandBtn(label, val, html, container) {
    const btn = document.createElement('button');
    btn.className = 'tab' + (CAT_BRAND_FILTER === val ? ' active' : '');
    btn.innerHTML = html;
    btn.dataset.brand = val === null ? '' : val;
    btn.addEventListener('click', () => {
      CAT_BRAND_FILTER = val;
      allBrandBtns.forEach(b => b.classList.toggle('active', b.dataset.brand === (val === null ? '' : val)));
      buildCatalog();
    });
    if (val) {
      btn.addEventListener('mouseenter', () => highlightRows('brand', val));
      btn.addEventListener('mouseleave', () => highlightRows('brand', null));
    }
    allBrandBtns.push(btn);
    container.appendChild(btn);
    return btn;
  }
  const allHtml = `All<span class="brand-count-chip">${CAT.length}</span>`;
  makeBrandBtn('All', null, allHtml, brandBar);
  if (brandBarM) makeBrandBtn('All', null, allHtml, brandBarM);
  brands.forEach(brand => {
    const count = CAT.filter(f => f.brand === brand).length;
    const html = `${brand}<span class="brand-count-chip">${count}</span>`;
    makeBrandBtn(brand, brand, html, brandBar);
    if (brandBarM) makeBrandBtn(brand, brand, html, brandBarM);
  });

  const searchEl = document.getElementById('cat-search');
  const clearBtn = document.getElementById('cat-search-clear');
  searchEl.addEventListener('input', () => {
    clearBtn.classList.toggle('visible', searchEl.value.length > 0);
    buildCatalog();
  });
  clearBtn.addEventListener('click', () => {
    searchEl.value = ''; clearBtn.classList.remove('visible'); buildCatalog();
  });

  const toggleBtn = document.getElementById('frag-filter-toggle');
  const mobilePanel = document.getElementById('frag-mobile-panel');
  if (toggleBtn && mobilePanel) {
    toggleBtn.addEventListener('click', () => mobilePanel.classList.toggle('open'));
  }
}

export function renderCatRow(row, frag, fm, search) {
  const st = gst(frag.id);
  row.className = `scent-row frag-picker-item s-${st}`;
  row.dataset.family = frag.family;
  row.dataset.brand = frag.brand;
  row.dataset.roles = frag.roles.join(' ');
  const famLabel = (FAM[frag.family] || { label: frag.family }).label;

  let notesHtml = '';
  if (search) {
    const q = search.toLowerCase();
    const topMatch = (frag.top || []).find(n => n.toLowerCase().includes(q));
    const midMatch = (frag.mid || []).find(n => n.toLowerCase().includes(q));
    const baseMatch = (frag.base || []).find(n => n.toLowerCase().includes(q));
    if (topMatch) {
      const rendered = (frag.top || []).slice(0, 3).map(n =>
        n.toLowerCase().includes(q) ? `<mark class="note-match">${n}</mark>` : n
      ).join(', ');
      notesHtml = `<div class="frag-picker-item-notes">${rendered}</div>`;
    } else if (midMatch || baseMatch) {
      const tier = midMatch ? 'Mid' : 'Base';
      const note = midMatch || baseMatch;
      notesHtml = `<div class="frag-picker-item-notes"><span class="match-badge">↳ ${tier} · ${note}</span></div>`;
    } else {
      const topNotes = (frag.top || []).slice(0, 3).join(', ');
      if (topNotes) notesHtml = `<div class="frag-picker-item-notes">${topNotes}</div>`;
    }
  } else {
    const topNotes = (frag.top || []).slice(0, 3).join(', ');
    if (topNotes) notesHtml = `<div class="frag-picker-item-notes">${topNotes}</div>`;
  }

  row.innerHTML = `<div class="frag-picker-dot" style="background:${fm.color}"></div>
    <div class="frag-picker-info">
      <div class="frag-picker-item-name">${frag.name}</div>
      <div class="frag-picker-item-brand">${frag.brand} · ${famLabel}</div>
      ${notesHtml}
    </div>`;
}

/* ══ BUILD NOTES ════════════════════════════════════════════════════ */
export function buildNotes() {
  const body = document.getElementById('notes-body'); body.innerHTML = '';
  const grouped = {};
  import('./data.js').then(({ NI }) => {
    NI.forEach(n => { if (!grouped[n.family]) grouped[n.family] = []; grouped[n.family].push(n); });
    Object.values(grouped).forEach(arr => arr.sort((a, b) => a.name.localeCompare(b.name)));
    FAM_ORDER.forEach(fk => {
      if (!grouped[fk]?.length) return;
      const fm = FAM[fk]; if (!fm) return;
      const row = document.createElement('div'); row.className = 'notes-family-row';
      const left = document.createElement('div'); left.className = 'nf-left';
      left.innerHTML = `<div class="nf-dot" style="background:${fm.color}"></div><div class="nf-name">${fm.label}</div>${fm.desc ? `<div class="nf-desc">${fm.desc}</div>` : ''}`;
      const right = document.createElement('div'); right.className = 'nf-right';
      grouped[fk].forEach(note => {
        const btn = document.createElement('button'); btn.className = 'note-link'; btn.textContent = note.name;
        btn.addEventListener('click', e => { e.stopPropagation(); openNotePopup(note, btn); });
        right.appendChild(btn);
      });
      row.appendChild(left); row.appendChild(right); body.appendChild(row);
    });
    document.getElementById('notes-count').textContent = `${NI.length} notes`;
  });
}

/* ══ PROFILE ════════════════════════════════════════════════════════ */
export function buildProfileData(ids) {
  const frags = ids.map(id => CAT_MAP[id]).filter(Boolean);
  const famCount = {};
  frags.forEach(f => { famCount[f.family] = (famCount[f.family] || 0) + 1; });
  const famSorted = Object.entries(famCount).sort((a, b) => b[1] - a[1]);
  const noteCount = {};
  frags.forEach(f => {
    f.base.forEach(n => { noteCount[n] = (noteCount[n] || 0) + 3; });
    f.mid.forEach(n => { noteCount[n] = (noteCount[n] || 0) + 2; });
    f.top.forEach(n => { noteCount[n] = (noteCount[n] || 0) + 1; });
  });
  const notesSorted = Object.entries(noteCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const roleCounts = {};
  frags.forEach(f => f.roles.forEach(r => { roleCounts[r] = (roleCounts[r] || 0) + 1; }));
  const avgSillage = frags.length ? Math.round(frags.reduce((s, f) => s + f.sillage, 0) / frags.length) : 0;
  return { frags, famSorted, notesSorted, roleCounts, avgSillage };
}

export function buildProfile() {
  const owned = CAT.filter(f => isOwned(f.id));
  const el = document.getElementById('profile-body');
  if (!owned.length) {
    el.innerHTML = `
      <div class="sec-label">Profile</div>
      <div class="prof-empty">
        <div class="prof-empty-icon">◎</div>
        <div class="prof-empty-text">Add fragrances you own to see your taste profile.</div>
        <button class="prof-empty-btn" onclick="localStorage.removeItem('sm_onboarded');OB_SEL.clear();renderOnboardWelcome();document.getElementById('onboard-overlay').style.display='flex'">Add my collection</button>
      </div>
    `;
    return;
  }
  const { famSorted, notesSorted, roleCounts, avgSillage } = buildProfileData(owned.map(f => f.id));
  const maxFam = famSorted[0]?.[1] || 1;
  const sillPct = Math.round((avgSillage / 10) * 100);
  const sillLabel = avgSillage <= 3 ? 'Quiet' : avgSillage <= 5 ? 'Moderate' : avgSillage <= 7 ? 'Assertive' : 'Enormous';
  el.innerHTML = `
    <div class="sec-label">Profile <span class="sub">${owned.length} owned</span></div>
    <div class="prof-section">
      <div class="prof-section-label">Family breakdown</div>
      <div class="prof-fam-bars">
        ${famSorted.map(([fam, cnt]) => `
          <div class="prof-fam-bar">
            <div class="prof-fam-dot" style="background:${FAM[fam]?.color || '#888'}"></div>
            <div class="prof-fam-name">${FAM[fam]?.label || fam}</div>
            <div class="prof-fam-track"><div class="prof-fam-fill" style="width:${Math.round(cnt / maxFam * 100)}%;background:${FAM[fam]?.color || '#888'}"></div></div>
            <div class="prof-fam-count">${cnt}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="prof-section">
      <div class="prof-section-label">Recurring notes</div>
      <div class="prof-notes">
        ${notesSorted.map(([note], i) => `<span class="prof-note${i < 3 ? ' hi' : ''}">${note}</span>`).join('')}
      </div>
    </div>
    <div class="prof-section">
      <div class="prof-section-label">Role coverage</div>
      <div class="prof-roles">
        ${ROLES.map(r => `
          <div class="prof-role${roleCounts[r.id] ? ' filled' : ''}">
            <span class="prof-role-sym">${r.sym}</span>
            <span class="prof-role-name">${r.name}</span>
            ${roleCounts[r.id] ? `<span class="prof-role-count">${roleCounts[r.id]}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
    <div class="prof-section">
      <div class="prof-section-label">Sillage sweet spot · avg ${avgSillage}/10 — ${sillLabel}</div>
      <div class="prof-sill-track">
        <div class="prof-sill-fill" style="width:${sillPct}%"></div>
        <div class="prof-sill-marker" style="left:${sillPct}%"></div>
      </div>
      <div class="prof-sill-labels"><span>Skin-level</span><span>Moderate</span><span>Enormous</span></div>
    </div>
  `;

  if (owned.length >= 1) {
    const layerSorted = [...owned].sort((a, b) => b.layering - a.layering).slice(0, 5);
    const profEl = document.getElementById('profile-body');
    const layerSec = document.createElement('div'); layerSec.className = 'prof-section';
    layerSec.innerHTML = `<div class="prof-section-label">Best for layering</div>`;
    const list = document.createElement('div'); list.className = 'prof-layer-list';
    layerSorted.forEach((f, i) => {
      const row = document.createElement('div'); row.className = 'prof-layer-row';
      row.innerHTML = `<div class="prof-layer-rank">${i + 1}</div>
        <div class="prof-layer-name">${f.name}</div>
        <div class="prof-layer-bar-wrap"><div class="prof-layer-bar" style="width:${f.layering * 10}%"></div></div>
        <div class="prof-layer-lbl">${LW[f.layering] || ''}</div>`;
      list.appendChild(row);
    });
    layerSec.appendChild(list);
    profEl.appendChild(layerSec);
  }

  if (owned.length >= 2) {
    let bestSimScore = 0, bestSimPair = null;
    let bestLayerScore = 0, bestLayerPair = null;
    for (let i = 0; i < owned.length; i++) {
      for (let j = i + 1; j < owned.length; j++) {
        const a = owned[i], b = owned[j];
        const ss = scoreSimilarity(a, b);
        const ls = scoreLayeringPair(a, b);
        if (ss > bestSimScore) { bestSimScore = ss; bestSimPair = [a, b]; }
        if (ls > bestLayerScore) { bestLayerScore = ls; bestLayerPair = [a, b]; }
      }
    }
    const pairSec = document.createElement('div'); pairSec.className = 'prof-section';
    pairSec.innerHTML = `<div class="prof-section-label">Collection pairings</div>`;
    const cards = document.createElement('div'); cards.className = 'prof-pair-cards';
    if (bestSimPair) {
      const [a, b] = bestSimPair;
      const shFam = a.family === b.family;
      const shBase = [...a.base].filter(n => b.base.includes(n));
      const why = shFam ? `Same ${FAM[a.family]?.label || a.family} family`
        : shBase.length ? `Shared base: ${shBase.slice(0, 2).join(', ')}`
          : `Compatible families`;
      const card = document.createElement('div'); card.className = 'prof-pair-card';
      card.innerHTML = `<div class="prof-pair-tag">Most similar</div>
        <div class="prof-pair-names">${a.name} + ${b.name}</div>
        <div class="prof-pair-why">${why} · score ${bestSimScore}</div>`;
      cards.appendChild(card);
    }
    if (bestLayerPair && !(bestLayerPair[0].id === bestSimPair?.[0].id && bestLayerPair[1].id === bestSimPair?.[1].id)) {
      const [a, b] = bestLayerPair;
      const complexity = `${LW[a.layering] || a.layering} + ${LW[b.layering] || b.layering}`;
      const card = document.createElement('div'); card.className = 'prof-pair-card';
      card.innerHTML = `<div class="prof-pair-tag">Best layering</div>
        <div class="prof-pair-names">${a.name} + ${b.name}</div>
        <div class="prof-pair-why">Apply ${a.layering > b.layering ? a.name : b.name} first · ${complexity}</div>`;
      cards.appendChild(card);
    } else if (bestLayerPair && cards.children.length < 2) {
      const [a, b] = bestLayerPair;
      const card = document.createElement('div'); card.className = 'prof-pair-card';
      card.innerHTML = `<div class="prof-pair-tag">Best layering</div>
        <div class="prof-pair-names">${a.name} + ${b.name}</div>
        <div class="prof-pair-why">${LW[a.layering] || a.layering} meets ${LW[b.layering] || b.layering}</div>`;
      cards.appendChild(card);
    }
    if (cards.children.length) {
      pairSec.appendChild(cards);
      document.getElementById('profile-body').appendChild(pairSec);
    }
  }

  const clSec = document.createElement('div');
  clSec.className = 'prof-section';
  clSec.style.cssText = 'margin-top:24px;border-top:1px solid var(--g200);padding-top:16px';
  clSec.innerHTML = `<div class="prof-section-label">What's new</div>
    <button style="background:none;border:none;cursor:pointer;font-size:.78rem;color:var(--resin);padding:0;font-family:inherit;font-weight:600" onclick="import('./nav.js').then(({go})=>go('changelog',null))">View changelog →</button>`;
  document.getElementById('profile-body').appendChild(clSec);
}
