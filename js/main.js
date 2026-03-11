// ── main.js ──────────────────────────────────────────────────────────
// Entry point. Imports all modules, initialises data, then boots the UI.

import { initData, CAT } from './data.js';
import { seedDefaults } from './state.js';
import { initUI } from './ui.js';
import { initNav, registerGoHook, go } from './nav.js';
import {
  buildCapsule, buildRoles, buildCatalog, buildNotes,
  buildProfile, initCatalogControls, getCmpFam,
  buildCompare, initComparePicker,
} from './renderers.js';
import { showOnboard } from './onboarding.js';

window.go = go; // expose for inline onclick attributes still in HTML

registerGoHook(id => {
  if (id === 'profile')  buildProfile();
  if (id === 'design')   import('./design.js').then(m => m.buildDesign());
  // 'map' panel removed — 3D map code deleted
});

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load catalog data
  await initData();

  // 2. Seed default states + role assignments
  seedDefaults();

  // 3. Wire up persistent UI listeners
  initUI();
  initNav();

  // 4. Build initial panels
  buildCapsule();
  buildRoles();
  buildCatalog(null);
  buildNotes();
  initCatalogControls();
  initComparePicker();

  // 5. Onboarding (skipped if already seen)
  showOnboard();
});
