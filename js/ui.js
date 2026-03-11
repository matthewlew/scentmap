// ── ui.js ─────────────────────────────────────────────────────────────
// Layout primitives: scroll lock, desktop detail stack, mobile sheet
// stack, and the unified openDetail / pushDetail helpers.

// ── Viewport helpers ─────────────────────────────────────────────────
export function isDesktop() { return window.innerWidth >= 1100; }
export function isTablet()  { return window.innerWidth >= 768 && window.innerWidth < 1100; }

// ── Body scroll lock (iOS-compatible) ────────────────────────────────
let _scrollLocked = false;
let _lockY = 0;

export function lockBodyScroll() {
  if (_scrollLocked) return;
  _lockY = window.scrollY;
  document.body.style.cssText += `;position:fixed;top:-${_lockY}px;width:100%;overflow-y:scroll`;
  _scrollLocked = true;
}

export function unlockBodyScroll() {
  if (!_scrollLocked) return;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflowY = '';
  window.scrollTo(0, _lockY);
  _scrollLocked = false;
}

// ── Desktop detail stack ─────────────────────────────────────────────
const detailStack = [];

export function openDesktopDetail(renderFn) {
  detailStack.length = 0;
  detailStack.push(renderFn);
  _renderDeskDetail();
  document.getElementById('col-detail').classList.add('open');
  if (isTablet()) document.getElementById('detail-scrim').classList.add('open');
}

export function pushDesktopDetail(renderFn) {
  detailStack.push(renderFn);
  _renderDeskDetail(true);
}

function _renderDeskDetail(animateIn) {
  const top = detailStack[detailStack.length - 1];
  if (!top) return;
  const inner = document.getElementById('detail-inner');
  inner.classList.remove('slide');
  inner.innerHTML = '';
  top(inner);
  document.getElementById('detail-back').classList.toggle('visible', detailStack.length > 1);
  if (animateIn) { inner.offsetWidth; inner.classList.add('slide'); }
}

export function closeDesktopDetail() {
  detailStack.length = 0;
  document.getElementById('col-detail').classList.remove('open');
  document.getElementById('detail-scrim').classList.remove('open');
}

export function popDesktopDetail() {
  if (detailStack.length <= 1) { closeDesktopDetail(); return; }
  detailStack.pop();
  _renderDeskDetail();
}

// ── Mobile sheet stack ────────────────────────────────────────────────
const sheetStack = [];

export function pushSheet(renderFn) {
  const isSubNav = sheetStack.length > 0;
  if (!sheetStack.length) lockBodyScroll();
  const overlay = document.getElementById('sheet-stack');
  const el = document.createElement('div');
  el.className = 'sheet' + (isSubNav ? ' nav' : '');
  el.innerHTML = `<div class="sheet-inner"><div class="sheet-handle" aria-hidden="true"></div>
    <div class="sheet-topbar">
      <button class="sheet-back hidden"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="vertical-align:-2px;margin-right:2px" aria-hidden="true"><path d="M9 3L5 7l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>Back</button>
      <button class="sheet-close" aria-label="Close">Close</button>
    </div>
    <div class="sheet-content"></div></div>`;

  const handle = el.querySelector('.sheet-handle');
  let ds = null;
  handle.addEventListener('touchstart', e => { ds = e.touches[0].clientY; }, { passive: true });
  handle.addEventListener('touchmove',  e => { if (ds === null) return; const dy = e.touches[0].clientY - ds; if (dy > 0) el.style.transform = `translateY(${dy}px)`; }, { passive: true });
  handle.addEventListener('touchend',   e => { const dy = e.changedTouches[0].clientY - (ds || 0); el.style.transform = ''; if (dy > 80) popSheet(); ds = null; });

  el.querySelector('.sheet-close').addEventListener('click', closeAllSheets);
  el.querySelector('.sheet-back').addEventListener('click', popSheet);

  overlay.appendChild(el);
  sheetStack.push(el);
  _updateSheetPos();
  requestAnimationFrame(() => { el.classList.add('visible'); overlay.classList.add('has-sheets'); });
  renderFn(el.querySelector('.sheet-content'));
  _updateSheetBacks();
}

export function popSheet() {
  if (!sheetStack.length) return;
  const top = sheetStack.pop();
  top.classList.remove('visible');
  top.addEventListener('transitionend', () => top.remove(), { once: true });
  _updateSheetPos();
  _updateSheetBacks();
  if (!sheetStack.length) {
    document.getElementById('sheet-stack').classList.remove('has-sheets');
    unlockBodyScroll();
  }
}

export function closeAllSheets() {
  const all = [...sheetStack];
  sheetStack.length = 0;
  all.forEach(s => { s.classList.remove('visible'); s.addEventListener('transitionend', () => s.remove(), { once: true }); });
  document.getElementById('sheet-stack').classList.remove('has-sheets');
  unlockBodyScroll();
}

function _updateSheetPos() {
  sheetStack.forEach((s, i) => {
    const top = i === sheetStack.length - 1;
    s.classList.toggle('visible', top);
    s.classList.toggle('under', !top);
  });
}

function _updateSheetBacks() {
  sheetStack.forEach((s, i) => s.querySelector('.sheet-back').classList.toggle('hidden', i === 0));
}

// ── Unified open helpers ──────────────────────────────────────────────
export function openDetail(renderFn) {
  if (isDesktop() || isTablet()) openDesktopDetail(renderFn);
  else pushSheet(c => renderFn(c));
}

export function pushDetail(renderFn) {
  if (isDesktop() || isTablet()) pushDesktopDetail(renderFn);
  else pushSheet(c => renderFn(c));
}

// ── Wire up persistent UI listeners ──────────────────────────────────
export function initUI() {
  document.getElementById('detail-back').addEventListener('click', popDesktopDetail);
  document.getElementById('detail-close-btn').addEventListener('click', closeDesktopDetail);
  document.getElementById('detail-scrim').addEventListener('click', closeDesktopDetail);
  document.getElementById('sheet-backdrop').addEventListener('click', closeAllSheets);
}
