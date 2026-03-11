// ── nav.js ───────────────────────────────────────────────────────────
// Top-level navigation: panel switching, settings menu, mobile nav,
// and the "More" bottom sheet.

import { closeDesktopDetail } from './ui.js';
import { pushSheet, closeAllSheets } from './ui.js';

let _goHook = null; // set by main.js so nav can trigger panel builders

export function registerGoHook(fn) { _goHook = fn; }

export function go(id, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll(
    '.tab:not(.dc-state-wrap .tab):not(.picker-row .tab):not(.cat-state-bar .tab):not(.cat-brand-bar .tab):not(.cat-state-bar-m .tab):not(.cat-brand-bar-m .tab):not(.roles-brand-bar .tab)'
  ).forEach(t => t.classList.remove('active'));
  document.getElementById('p-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  closeDesktopDetail();
  if (_goHook) _goHook(id);
}

export function goMobile(id, btn) {
  document.querySelectorAll('.mbn-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  go(id, null);
}

export function openMoreSheet(btn) {
  document.querySelectorAll('.mbn-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const items = [
    { id:'map',       icon:'✦', label:'Fragrance Map' },
    { id:'scentmap',  icon:'◉', label:'My Capsule' },
    { id:'roles',     icon:'♥', label:'Roles' },
    { id:'notes',     icon:'✿', label:'Notes' },
    { id:'profile',   icon:'◈', label:'Profile' },
    { id:'changelog', icon:'↩', label:'Changelog' },
  ];
  pushSheet(el => {
    el.innerHTML = `<div style="padding:16px 0 8px">
      <div style="font-size:.65rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--g500);padding:0 16px 10px">More</div>
      ${items.map(it => `
        <button onclick="closeAllSheets();goMobile('${it.id}',document.querySelector('.mbn-more'))" style="display:flex;align-items:center;gap:14px;width:100%;background:none;border:none;padding:14px 16px;cursor:pointer;font-family:inherit;font-size:.88rem;color:var(--black);border-bottom:1px solid var(--g200);text-align:left">
          <span style="font-size:1.2rem;width:24px;text-align:center;flex-shrink:0">${it.icon}</span>
          ${it.label}
        </button>`).join('')}
    </div>`;
  });
}

export function settingsGo(id) {
  const menu = document.getElementById('settings-menu');
  if (menu) menu.hidden = true;
  const backBtn = document.getElementById('nav-back-btn');
  if (backBtn) backBtn.hidden = false;
  go(id, null);
}

export function navBack() {
  const backBtn = document.getElementById('nav-back-btn');
  if (backBtn) backBtn.hidden = true;
  go('compare', null);
}

export function initNav() {
  const settingsBtn  = document.getElementById('settings-btn');
  const settingsMenu = document.getElementById('settings-menu');
  if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener('click', e => { e.stopPropagation(); settingsMenu.hidden = !settingsMenu.hidden; });
    document.addEventListener('click', () => { if (settingsMenu) settingsMenu.hidden = true; });
    settingsMenu.addEventListener('click', e => e.stopPropagation());
  }
  // Expose to inline onclick handlers still in HTML
  window.goMobile   = goMobile;
  window.openMoreSheet = openMoreSheet;
  window.settingsGo = settingsGo;
  window.navBack    = navBack;
  window.closeAllSheets = closeAllSheets;
}
