/**
 * Scentmap Data Store
 * Centralized state management and data fetching.
 */

// --- 1. CONFIGURATION & CONSTANTS ---
export const FAM = {
  citrus:  {label:'Citrus',  color:'var(--fam-citrus)',  colorHex:'#7A8A00', desc:'Bright and fleeting. Pressed from rinds — bergamot, lemon, grapefruit. Often the first thing you smell, and the first to fade. Works in heat; rarely works alone.'},
  green:   {label:'Green',   color:'var(--fam-green)',   colorHex:'#1A6030', desc:'Crisp, alive, and vegetal — cut grass, fig leaf, violet leaf. The smell of growing things rather than flowering ones. Fresh but rooted.'},
  floral:  {label:'Floral',  color:'var(--fam-floral)',  colorHex:'#B5366E', desc:'Derived from flowers — rose, jasmine, tuberose, iris. The broadest family. Ranges from powdery and romantic to bright and dewy. The backbone of most commercial perfumery.'},
  woody:   {label:'Woody',   color:'var(--fam-woody)',   colorHex:'#8B4513', desc:'Dry, earthy warmth from woods and roots — cedar, sandalwood, vetiver, patchouli. A broad family spanning cool dry cedar to rich creamy sandalwood.'},
  amber:   {label:'Amber',   color:'var(--fam-amber)',   colorHex:'#B86A00', desc:'Warm, resinous, and slightly sweet. Labdanum, benzoin, vanilla, resins. Rich base materials that linger for hours. The classic "oriental" register.'},
  chypre:  {label:'Chypre',  color:'var(--fam-chypre)',  colorHex:'#2A5C50', desc:'A structured accord: bergamot up top, labdanum at the base, oakmoss in the heart. Earthy, sophisticated, mossy. Named after Cyprus; backbone of classic perfumery.'},
  aquatic: {label:'Aquatic', color:'var(--fam-aquatic)', colorHex:'#0A4880', desc:'Marine, watery, ozonic. Invented in the 1990s. The smell of imagined sea air — ozone, salt, and calone — rather than actual ocean. Fresh and weightless.'},
  leather: {label:'Leather', color:'var(--fam-leather)', colorHex:'#5A2D0C', desc:'Reconstructed from birch tar, labdanum, and castoreum. Dry, dark, slightly smoky. Evokes tanned hides, saddles, and worn books. Difficult to wear casually.'},
  gourmand:{label:'Gourmand',color:'var(--fam-gourmand)',colorHex:'#7C4C00', desc:'Edible-smelling notes — vanilla, caramel, tonka, praline. Emerged in the 1990s. Warm, sweet, and comforting. Fragrance as food memory.'},
  oud:     {label:'Oud',     color:'var(--fam-oud)',     colorHex:'#6E2080', desc:'Dark, animalic resin from infected agarwood. Deep, smoky, and complex. The most prized raw material in Arabian perfumery — priced by weight, not volume. Polarising.'},
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
  'quiet-expressionist': {
    id: 'quiet-expressionist',
    name: 'The Quiet Expressionist',
    tagline: 'You let your presence speak before your words do.',
    desc: 'Understated but unforgettable. You gravitate toward scents that reveal complexity only to those who pay attention — woody, green, and contemplative. Your fragrance is a second language.',
    families: ['woody', 'green', 'chypre'],
    tags: ['woody', 'green', 'chypre'],
  },
  'sensory-hedonist': {
    id: 'sensory-hedonist',
    name: 'The Sensory Hedonist',
    tagline: 'You collect pleasures the way others collect ideas.',
    desc: 'Warm, enveloping, and unapologetically indulgent. Amber, vanilla, and rich balsamic notes feel like home to you. You wear fragrance to feel, not to impress.',
    families: ['amber', 'gourmand', 'floral'],
    tags: ['amber', 'gourmand', 'warmth'],
  },
  'urban-intellectual': {
    id: 'urban-intellectual',
    name: 'The Urban Intellectual',
    tagline: "Complexity in a bottle. You've read the footnotes.",
    desc: "Chypre, iris, and leather. You find comfort in the unconventional and the cerebral — scents that require a second read and reward patience. You're not interested in crowd-pleasers.",
    families: ['chypre', 'leather', 'woody'],
    tags: ['chypre', 'leather', 'woody'],
  },
  'sun-chaser': {
    id: 'sun-chaser',
    name: 'The Sun Chaser',
    tagline: 'Perpetually mid-journey. The next destination is always better.',
    desc: 'Fresh, citric, and kinetic. You wear your scent like sunscreen — a signal that the day has started and anything is possible. Bergamot, lime, and the idea of open air.',
    families: ['citrus', 'aquatic', 'green'],
    tags: ['citrus', 'aquatic', 'freshness'],
  },
  'romantic': {
    id: 'romantic',
    name: 'The Romantic',
    tagline: "You feel things fully and you're not sorry about it.",
    desc: "Floral and amber, soft and deep at once. You're drawn to scents that smell like memories you want to keep — rose, jasmine, warm skin. Fragrance is emotional for you.",
    families: ['floral', 'amber', 'gourmand'],
    tags: ['floral', 'amber', 'intimate'],
  },
  'provocateur': {
    id: 'provocateur',
    name: 'The Provocateur',
    tagline: 'You make an entrance. You meant to.',
    desc: 'Oud, incense, and smoke. You wear fragrance as a declaration — something that commands a room and defies easy categorization. Subtlety is a choice you rarely make.',
    families: ['oud', 'leather', 'amber'],
    tags: ['oud', 'leather', 'intensity'],
  },
  'naturalist': {
    id: 'naturalist',
    name: 'The Naturalist',
    tagline: 'Roots, earth, something growing. This is your element.',
    desc: "Green, woody, and grounded. You're most yourself outdoors, and your scent reflects it — vetiver, pine, fresh air, and the memory of soil after rain.",
    families: ['green', 'woody', 'citrus'],
    tags: ['green', 'woody', 'freshness'],
  },
  'minimalist': {
    id: 'minimalist',
    name: 'The Minimalist',
    tagline: 'Nothing superfluous. Every molecule earned its place.',
    desc: 'Clean, precise, and quietly confident. Aquatic, citrus, and white musk. You prefer scents that feel like a second skin — barely there but impossible to forget.',
    families: ['aquatic', 'citrus', 'woody'],
    tags: ['aquatic', 'citrus', 'intimate'],
  },
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
    const [roles, notes, brands, scents] = await Promise.all([
      fetch('/data/roles.json', _nc).then(r => r.json()),
      fetch('/data/notes.json', _nc).then(r => r.json()),
      fetch('/data/brands.json', _nc).then(r => r.json()),
      fetch('/data/scents.json', _nc).then(r => r.json()),
    ]);

    _ROLES = roles;
    _NI = notes;
    _NI.forEach(n => _NI_MAP[n.name.toLowerCase()] = n);
    _BRANDS = brands;
    _CAT = scents;
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
