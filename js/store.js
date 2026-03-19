/**
 * Scentmap Data Store
 * Centralized state management and data fetching.
 */

// --- 1. CONFIGURATION & CONSTANTS ---
export const FAM = {
  citrus:  {label:'Citrus',  color:'#9A6800', desc:'Bright and fleeting. Pressed from rinds — bergamot, lemon, grapefruit. Often the first thing you smell, and the first to fade. Works in heat; rarely works alone.'},
  green:   {label:'Green',   color:'#1A6030', desc:'Crisp, alive, and vegetal — cut grass, fig leaf, violet leaf. The smell of growing things rather than flowering ones. Fresh but rooted.'},
  floral:  {label:'Floral',  color:'#902050', desc:'Derived from flowers — rose, jasmine, tuberose, iris. The broadest family. Ranges from powdery and romantic to bright and dewy. The backbone of most commercial perfumery.'},
  woody:   {label:'Woody',   color:'#6E3210', desc:'Dry, earthy warmth from woods and roots — cedar, sandalwood, vetiver, patchouli. A broad family spanning cool dry cedar to rich creamy sandalwood.'},
  amber:   {label:'Amber',   color:'#984000', desc:'Warm, resinous, and slightly sweet. Labdanum, benzoin, vanilla, resins. Rich base materials that linger for hours. The classic "oriental" register.'},
  chypre:  {label:'Chypre',  color:'#285438', desc:'A structured accord: bergamot up top, labdanum at the base, oakmoss in the heart. Earthy, sophisticated, mossy. Named after Cyprus; backbone of classic perfumery.'},
  aquatic: {label:'Aquatic', color:'#0A4880', desc:'Marine, watery, ozonic. Invented in the 1990s. The smell of imagined sea air — ozone, salt, and calone — rather than actual ocean. Fresh and weightless.'},
  leather: {label:'Leather', color:'#42200E', desc:'Reconstructed from birch tar, labdanum, and castoreum. Dry, dark, slightly smoky. Evokes tanned hides, saddles, and worn books. Difficult to wear casually.'},
  gourmand:{label:'Gourmand',color:'#7C4C00', desc:'Edible-smelling notes — vanilla, caramel, tonka, praline. Emerged in the 1990s. Warm, sweet, and comforting. Fragrance as food memory.'},
  oud:     {label:'Oud',     color:'#4A1850', desc:'Dark, animalic resin from infected agarwood. Deep, smoky, and complex. The most prized raw material in Arabian perfumery — priced by weight, not volume. Polarising.'},
};

export const FAM_COMPAT = {
  woody:   {woody:.7,floral:.8,amber:.9,citrus:.6,leather:.8,oud:.9,green:.6,chypre:.7,gourmand:.5},
  floral:  {woody:.8,floral:.5,amber:.7,citrus:.7,leather:.5,oud:.6,green:.8,chypre:.8,gourmand:.5},
  amber:   {woody:.9,floral:.7,amber:.5,citrus:.4,leather:.8,oud:.9,green:.4,chypre:.6,gourmand:.8},
  citrus:  {woody:.6,floral:.7,amber:.4,citrus:.4,leather:.4,oud:.3,green:.9,chypre:.7,gourmand:.3},
  leather: {woody:.8,floral:.5,amber:.8,citrus:.4,leather:.4,oud:.9,green:.5,chypre:.7,gourmand:.4},
  oud:     {woody:.9,floral:.6,amber:.9,citrus:.3,leather:.9,oud:.3,green:.3,chypre:.5,gourmand:.6},
  green:   {woody:.6,floral:.8,amber:.4,citrus:.9,leather:.5,oud:.3,green:.4,chypre:.9,gourmand:.3},
  chypre:  {woody:.7,floral:.8,amber:.6,citrus:.7,leather:.7,oud:.5,green:.9,chypre:.4,gourmand:.4},
  gourmand:{woody:.5,floral:.5,amber:.8,citrus:.3,leather:.4,oud:.6,green:.3,chypre:.4,gourmand:.4},
};

export const FAM_ORDER = ['floral','amber','citrus','woody','chypre','gourmand','green','oud','leather','aquatic'];
export const FAM_ABBR = {citrus:'C',green:'G',floral:'F',woody:'W',amber:'A',chypre:'Ch',aquatic:'Aq',leather:'L',gourmand:'Go',oud:'O'};

export const ARCHETYPES = {
  'quiet-expressionist': { name: 'The Quiet Expressionist' },
  'sensory-hedonist': { name: 'The Sensory Hedonist' },
  'urban-intellectual': { name: 'The Urban Intellectual' },
  'sun-chaser': { name: 'The Sun Chaser' },
  'romantic': { name: 'The Romantic' },
  'provocateur': { name: 'The Provocateur' },
  'naturalist': { name: 'The Naturalist' },
  'minimalist': { name: 'The Minimalist' },
};

// --- 2. CORE DATA (Internal) ---
let _CAT = [];
let _CAT_MAP = {};
let _NI = [];
let _NI_MAP = {};
let _BRANDS = [];
let _ROLES = [];

// --- 3. STATE (Internal) ---
let _ST = {};
const _subscribers = new Set();

// Initialize state from LocalStorage
try {
  _ST = JSON.parse(localStorage.getItem('scentmap_st') || '{}') || {};
} catch(e) {
  _ST = {};
}

// --- 4. ACCESSORS ---
export const getData = () => ({
  catalog: _CAT,
  catalogMap: _CAT_MAP,
  notes: _NI,
  notesMap: _NI_MAP,
  brands: _BRANDS,
  roles: _ROLES
});

export const getState = (id) => _ST[id] || 'none';

export const isOwned = (id) => getState(id) === 'owned';
export const isWish = (id) => getState(id) === 'wish';
export const isNoteSaved = (name) => getState('n_' + name.toLowerCase()) === 'saved';

// --- 5. MUTATORS ---
export const setState = (id, s) => {
  if (s === 'none') delete _ST[id];
  else _ST[id] = s;
  localStorage.setItem('scentmap_st', JSON.stringify(_ST));
  _notify();
};

export const cycleState = (id) => {
  const current = getState(id);
  const next = current === 'none' ? 'wish' : current === 'wish' ? 'owned' : 'none';
  setState(id, next);
};

export const toggleNoteSaved = (name) => {
  const id = 'n_' + name.toLowerCase();
  setState(id, getState(id) === 'saved' ? 'none' : 'saved');
};

// --- 6. PUB/SUB ---
export const subscribe = (fn) => {
  _subscribers.add(fn);
  return () => _subscribers.delete(fn);
};

const _notify = () => {
  _subscribers.forEach(fn => fn(_ST));
};

// --- 7. DATA FETCHING ---
export const initialize = async () => {
  const _nc = { cache: 'no-cache' };
  try {
    const [roles, notes, brands, scentsIdx] = await Promise.all([
      fetch('/data/roles.json', _nc).then(r => r.json()),
      fetch('/data/notes.json', _nc).then(r => r.json()),
      fetch('/data/brands.json', _nc).then(r => r.json()),
      fetch('/data/scents-index.json', _nc).then(r => r.json())
    ]);

    const scentArrays = await Promise.all(
      scentsIdx.brands.map(b => fetch(`/data/scents/${b}.json`, _nc).then(r => r.json()))
    );

    _ROLES = roles;
    _NI = notes;
    _NI.forEach(n => _NI_MAP[n.name.toLowerCase()] = n);
    _BRANDS = brands;
    _CAT = scentArrays.flat();
    const _norm = s => (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    _CAT.forEach(f => {
      _CAT_MAP[f.id] = f;
      // Pre-process for search
      f._nameL = f.name.toLowerCase();
      f._brandL = f.brand.toLowerCase();
      const _split = v => Array.isArray(v) ? v.map(s => s.trim().toLowerCase()) : (v || '').split(',').map(s => s.trim().toLowerCase());
      f._nTop = _split(f.top);
      f._nMid = _split(f.mid);
      f._nBase = _split(f.base);
      f._nAll = [...f._nTop, ...f._nMid, ...f._nBase];
      // Diacritic-normalized fields for fuzzy search
      f._nameN = _norm(f.name);
      f._brandN = _norm(f.brand);
      f._nAllN = f._nAll.map(_norm);
    });
    _NI.forEach(n => { n._nameN = _norm(n.name); });

    return true;
  } catch (err) {
    console.error("Store initialization failed:", err);
    return false;
  }
};
