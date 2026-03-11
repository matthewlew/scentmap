// ── state.js ─────────────────────────────────────────────────────────
// Collection state (owned / wish) and role assignment state.
// All mutations go through these functions — never write ST or RA directly.

import { ROLES } from './data.js';

// ── Collection state ──────────────────────────────────────────────────
const ST = {};

export function gst(id)           { return ST[id] || 'none'; }
export function setState(id, s)   { ST[id] = s; }
export function isOwned(id)       { return gst(id) === 'owned'; }
export function isWish(id)        { return gst(id) === 'wish'; }
export function cycleState(id) {
  const c = gst(id);
  setState(id, c === 'none' ? 'wish' : c === 'wish' ? 'owned' : 'none');
}

// ── Role assignment state ─────────────────────────────────────────────
// RA: roleId → ordered array of fragId (index 0 = primary)
const RA = {};

export function getAssigned(roleId)  { return RA[roleId] || []; }
export function getPrimary(roleId)   { return getAssigned(roleId)[0] || null; }

export function assignFrag(roleId, fragId) {
  if (!RA[roleId]) RA[roleId] = [];
  const idx = RA[roleId].indexOf(fragId);
  if (idx !== -1) { RA[roleId].splice(idx, 1); return; }
  RA[roleId].push(fragId);
}

export function makePrimary(roleId, fragId) {
  if (!RA[roleId]) RA[roleId] = [];
  const idx = RA[roleId].indexOf(fragId);
  if (idx === -1) RA[roleId].unshift(fragId);
  else { RA[roleId].splice(idx, 1); RA[roleId].unshift(fragId); }
}

export function removeFromRole(roleId, fragId) {
  if (!RA[roleId]) return;
  RA[roleId] = RA[roleId].filter(id => id !== fragId);
}

export function getFragRoleStatus(fragId, roleId) {
  const arr = getAssigned(roleId);
  const idx = arr.indexOf(fragId);
  if (idx === -1) return 'none';
  if (idx === 0)  return 'primary';
  return idx + 1; // numeric position
}

export function getAllRolesForFrag(fragId) {
  const result = {};
  ROLES.forEach(r => {
    const s = getFragRoleStatus(fragId, r.id);
    if (s !== 'none') result[r.id] = s;
  });
  return result;
}

// ── Seed defaults ─────────────────────────────────────────────────────
// Called after data is ready so CAT_MAP is populated.
export function seedDefaults() {
  [['casual','gypsy-water'],['signature','endeavour'],['cold','eleventh-hour'],['creative','oronardo']]
    .forEach(([r, f]) => { if (!RA[r]) RA[r] = []; RA[r].push(f); });

  ['gypsy-water','eleventh-hour','oronardo','endeavour','alerce'].forEach(id => setState(id, 'owned'));
}
