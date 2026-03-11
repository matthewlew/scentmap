// ── scoring.js ───────────────────────────────────────────────────────
// Pure scoring functions — no DOM, no state side-effects.

import { FAM_COMPAT } from './data.js';

export function scoreSimilarity(a, b) {
  if (a.id === b.id) return 0;
  const famScore = (FAM_COMPAT[a.family]?.[b.family] ?? 0.5) * 40;
  const al = { top: a.top.map(n => n.toLowerCase()), mid: a.mid.map(n => n.toLowerCase()), base: a.base.map(n => n.toLowerCase()) };
  const bl = { top: b.top.map(n => n.toLowerCase()), mid: b.mid.map(n => n.toLowerCase()), base: b.base.map(n => n.toLowerCase()) };
  const shBase = al.base.filter(n => bl.base.includes(n)).length;
  const shMid  = al.mid.filter(n => bl.mid.includes(n)).length;
  const shTop  = al.top.filter(n => bl.top.includes(n)).length;
  const noteScore = Math.min(30, shBase * 5 + shMid * 3 + shTop * 2);
  const sillDiff  = Math.abs(a.sillage - b.sillage);
  const sillScore = sillDiff <= 2 ? 10 : sillDiff <= 4 ? 5 : 0;
  const shRoles   = a.roles.filter(r => b.roles.includes(r)).length;
  const roleScore = Math.min(20, shRoles * 7);
  return Math.round(famScore + noteScore + sillScore + roleScore);
}

export function scoreLayeringPair(a, b) {
  const famComp  = FAM_COMPAT[a.family]?.[b.family] ?? 0.5;
  const famScore = famComp * 35;
  const sillDiff  = Math.abs(a.sillage - b.sillage);
  const sillScore = sillDiff >= 3 ? 20 : sillDiff >= 1 ? 10 : 0;
  const allA   = [...a.top, ...a.mid, ...a.base].map(n => n.toLowerCase());
  const allB   = [...b.top, ...b.mid, ...b.base].map(n => n.toLowerCase());
  const shared = allA.filter(n => allB.includes(n)).length;
  const noteScore = shared === 0 ? 20 : shared <= 2 ? 12 : shared <= 4 ? 5 : 0;
  return Math.round(famScore + sillScore + noteScore);
}

export function classifyDiscovery(source, candidate) {
  const compat = FAM_COMPAT[source.family]?.[candidate.family] ?? 0.5;
  const score  = scoreSimilarity(source, candidate);
  if (compat >= 0.7 && score >= 55) return { type:'similar',     label:'Similar' };
  if (compat < 0.45)                return { type:'contrasts',   label:'Contrasts' };
  return                                   { type:'complements', label:'Complements' };
}
