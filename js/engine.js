/**
 * Scentmap Core Engine
 * Pure mathematical functions for fragrance similarity, layering, and discovery.
 */

export const FAM_PROFILE_BASE = {
  citrus:  [0.90,0.28,0.10],
  green:   [0.82,0.18,0.20],
  aquatic: [0.92,0.10,0.08],
  floral:  [0.62,0.58,0.40],
  chypre:  [0.58,0.30,0.50],
  woody:   [0.30,0.30,0.72],
  amber:   [0.18,0.72,0.88],
  gourmand:[0.10,0.92,0.80],
  leather: [0.18,0.20,0.82],
  oud:     [0.08,0.40,1.00],
};

export const NOTE_PROFILE = {
  'agarwood':          [0.10,0.22,0.90],
  'aldehydes':         [0.72,0.20,0.38],
  'almond':            [0.10,0.85,0.60],
  'amber':             [0.10,0.62,0.90],
  'ambergris':         [0.20,0.35,0.65],
  'ambrette':          [0.32,0.50,0.52],
  'apple':             [0.65,0.55,0.12],
  'atlas cedar':       [0.35,0.10,0.65],
  'basil':             [0.72,0.10,0.30],
  'benzoin':           [0.10,0.65,0.80],
  'bergamot':          [0.92,0.25,0.10],
  'birch tar':         [0.15,0.10,0.75],
  'black currant':     [0.68,0.42,0.22],
  'black orchid':      [0.20,0.50,0.60],
  'black pepper':      [0.50,0.10,0.55],
  'blood orange':      [0.80,0.48,0.12],
  'caramel':           [0.05,0.90,0.70],
  'cardamom':          [0.42,0.28,0.78],
  'casablanca lily':   [0.52,0.38,0.30],
  'castoreum':         [0.10,0.22,0.80],
  'cedar':             [0.32,0.10,0.65],
  'cedarwood':         [0.32,0.10,0.65],
  'cinnamon':          [0.22,0.50,0.82],
  'cistus':            [0.25,0.30,0.72],
  'clove':             [0.20,0.35,0.85],
  'coconut':           [0.15,0.80,0.55],
  'coffee':            [0.18,0.50,0.72],
  'cyclamen':          [0.65,0.28,0.20],
  'cypriol':           [0.18,0.15,0.75],
  'driftwood':         [0.35,0.05,0.52],
  'elemi':             [0.38,0.12,0.68],
  'eucalyptus':        [0.80,0.05,0.15],
  'fig':               [0.42,0.50,0.38],
  'fir':               [0.58,0.05,0.40],
  'frankincense':      [0.32,0.20,0.75],
  'freesia':           [0.70,0.35,0.22],
  'galbanum':          [0.70,0.05,0.22],
  'gardenia':          [0.42,0.50,0.40],
  'geranium':          [0.65,0.20,0.35],
  'ginger':            [0.55,0.20,0.65],
  'grapefruit':        [0.90,0.20,0.05],
  'grass':             [0.80,0.10,0.12],
  'green tea':         [0.75,0.15,0.22],
  'guaiac wood':       [0.22,0.15,0.70],
  'heliotrope':        [0.30,0.70,0.50],
  'honey':             [0.10,0.85,0.65],
  'honeysuckle':       [0.55,0.55,0.30],
  'hyacinth':          [0.60,0.30,0.22],
  'incense':           [0.25,0.15,0.80],
  'iris':              [0.48,0.32,0.38],
  'jasmine':           [0.40,0.52,0.55],
  'labdanum':          [0.10,0.42,0.90],
  'lapsang':           [0.20,0.10,0.72],
  'lavender':          [0.70,0.15,0.35],
  'leather':           [0.10,0.10,0.75],
  'lemon':             [0.92,0.20,0.05],
  'lily':              [0.55,0.30,0.30],
  'lily of the valley':[0.72,0.25,0.20],
  'lime':              [0.88,0.15,0.05],
  'magnolia':          [0.52,0.38,0.30],
  'mandarin':          [0.82,0.45,0.15],
  'mate':              [0.60,0.10,0.30],
  'mimosa':            [0.55,0.50,0.40],
  'mint':              [0.85,0.10,0.10],
  'musk':              [0.25,0.30,0.50],
  'myrrh':             [0.15,0.28,0.85],
  'narcissus':         [0.42,0.38,0.45],
  'neroli':            [0.75,0.35,0.30],
  'nutmeg':            [0.30,0.30,0.75],
  'oakmoss':           [0.30,0.10,0.60],
  'orange blossom':    [0.60,0.52,0.40],
  'orchid':            [0.40,0.45,0.42],
  'oud':               [0.05,0.38,0.95],
  'palisander':        [0.22,0.18,0.70],
  'papyrus':           [0.42,0.10,0.35],
  'patchouli':         [0.10,0.28,0.85],
  'peach':             [0.55,0.72,0.20],
  'peony':             [0.60,0.42,0.30],
  'pepper':            [0.50,0.10,0.55],
  'pine':              [0.55,0.05,0.45],
  'pineapple':         [0.65,0.68,0.12],
  'pink pepper':       [0.58,0.18,0.50],
  'praline':           [0.05,0.90,0.65],
  'rose':              [0.50,0.50,0.45],
  'rosemary':          [0.68,0.08,0.35],
  'rosewood':          [0.35,0.22,0.60],
  'saffron':           [0.22,0.30,0.80],
  'sandalwood':        [0.20,0.32,0.78],
  'smoke':             [0.15,0.08,0.72],
  'suede':             [0.22,0.22,0.60],
  'tea':               [0.62,0.12,0.28],
  'tiare':             [0.45,0.55,0.50],
  'tobacco':           [0.12,0.40,0.78],
  'tonka bean':        [0.10,0.80,0.70],
  'tuberose':          [0.35,0.55,0.60],
  'tulip':             [0.60,0.30,0.25],
  'vanilla':           [0.05,0.90,0.70],
  'vetiver':           [0.25,0.10,0.72],
  'violet':            [0.50,0.30,0.35],
  'violet leaf':       [0.65,0.15,0.20],
  'waterlily':         [0.80,0.20,0.12],
  'white musk':        [0.32,0.35,0.42],
  'ylang-ylang':       [0.30,0.60,0.65],
  'yuzu':              [0.88,0.20,0.08],
};

/**
 * Computes a normalized sensory profile for a fragrance.
 * Blends note profiles (60%) with family anchors (40%).
 */
export function computeProfile(frag) {
  if (frag._profile) return frag._profile;
  const b = FAM_PROFILE_BASE[frag.family] || [0.5, 0.5, 0.5];
  
  const weighted = [
    ...(frag._nTop || []).map(n => ({ n, w: 0.5 })),
    ...(frag._nMid || []).map(n => ({ n, w: 1.0 })),
    ...(frag._nBase || []).map(n => ({ n, w: 1.5 })),
  ].filter(({ n }) => NOTE_PROFILE[n]);

  if (weighted.length === 0) {
    frag._profile = { 
      freshness: b[0], sweetness: b[1], warmth: b[2], 
      intensity: (frag.sillage || 5) / 10, complexity: (frag.layering || 5) / 10 
    };
    return frag._profile;
  }

  const totalW = weighted.reduce((s, { w }) => s + w, 0);
  const avg = weighted.reduce((acc, { n, w }) => {
    const p = NOTE_PROFILE[n];
    acc[0] += p[0] * w;
    acc[1] += p[1] * w;
    acc[2] += p[2] * w;
    return acc;
  }, [0, 0, 0]).map(v => v / totalW);

  frag._profile = {
    freshness:  avg[0] * 0.6 + b[0] * 0.4,
    sweetness:  avg[1] * 0.6 + b[1] * 0.4,
    warmth:     avg[2] * 0.6 + b[2] * 0.4,
    intensity:  (frag.sillage || 5) / 10,
    complexity: (frag.layering || 5) / 10,
  };
  return frag._profile;
}

/**
 * Calculates a similarity score (0-100) between two fragrances and returns the detailed components.
 */
export function getSimilarityDetails(a, b, FAM_COMPAT) {
  if (a.id === b.id) return { famScore: 0, noteScore: 0, sillScore: 0, roleScore: 0, total: 0 };

  const famScore = (FAM_COMPAT[a.family]?.[b.family] ?? 0.5) * 40;
  
  const shBase = a._nBase.filter(n => b._nBase.includes(n)).length;
  const shMid  = a._nMid.filter(n => b._nMid.includes(n)).length;
  const shTop  = a._nTop.filter(n => b._nTop.includes(n)).length;
  const noteScore = Math.min(30, shBase * 5 + shMid * 3 + shTop * 2);
  
  const sillDiff = Math.abs(a.sillage - b.sillage);
  const sillScore = sillDiff <= 2 ? 10 : sillDiff <= 4 ? 5 : 0;
  
  const shRoles = a.roles.filter(r => b.roles.includes(r)).length;
  const roleScore = Math.min(20, shRoles * 7);
  
  const total = Math.round(famScore + noteScore + sillScore + roleScore);

  return { famScore, noteScore, sillScore, roleScore, total };
}

/**
 * Calculates a similarity score (0-100) between two fragrances.
 */
export function scoreSimilarity(a, b, FAM_COMPAT) {
  return getSimilarityDetails(a, b, FAM_COMPAT).total;
}

/**
 * Calculates a layering compatibility score (0-100) between two fragrances and returns the detailed components.
 */
export function getLayeringDetails(a, b, FAM_COMPAT) {
  const famComp = FAM_COMPAT[a.family]?.[b.family] ?? 0.5;
  const famScore = famComp * 35;
  
  const sillDiff = Math.abs(a.sillage - b.sillage);
  const sillScore = sillDiff >= 3 ? 20 : sillDiff >= 1 ? 10 : 0;
  
  const shared = a._nAll.filter(n => b._nAll.includes(n)).length;
  const noteScore = shared === 0 ? 20 : shared <= 2 ? 12 : shared <= 4 ? 5 : 0;
  
  const total = Math.round(famScore + sillScore + noteScore);

  return { famScore, sillScore, noteScore, total };
}

/**
 * Calculates a layering compatibility score (0-100) between two fragrances.
 */
export function scoreLayeringPair(a, b, FAM_COMPAT) {
  return getLayeringDetails(a, b, FAM_COMPAT).total;
}

/**
 * Generates a human-readable reason for a fragrance recommendation.
 */
export function getSwapReason(anchor, candidate, FAM) {
  const pa = computeProfile(anchor);
  const pc = computeProfile(candidate);

  const dInt = pc.intensity - pa.intensity;
  const dCpx = pc.complexity - pa.complexity;
  const dSwt = pc.sweetness - pa.sweetness;
  const dFrs = pc.freshness - pa.freshness;
  const dWrm = pc.warmth - pa.warmth;

  const famA = anchor.family;
  const famC = candidate.family;
  const sameFam = anchor.family === candidate.family;

  const sharedNotes = anchor._nAll.filter(n => candidate._nAll.includes(n));
  const shNote = sharedNotes.length > 0 ? sharedNotes[0].charAt(0).toUpperCase() + sharedNotes[0].slice(1) : null;

  const TH = 0.15;
  const TH_LG = 0.3;

  if (dInt > TH_LG) return `A bolder, stronger ${sameFam ? 'take' : 'alternative'}${shNote ? ` sharing ${shNote}` : ''}`;
  if (dInt < -TH_LG) return `A more subtle, intimate ${sameFam ? 'take' : 'alternative'}${shNote ? ` sharing ${shNote}` : ''}`;
  if (dCpx > TH_LG) return `A more complex and layered ${sameFam ? famA : famC}`;
  if (dCpx < -TH_LG) return `An easier-to-wear, simpler ${sameFam ? famA : famC}`;
  if (dSwt > TH) return `A sweeter, more gourmand approach to ${sameFam ? famA : 'this profile'}`;
  if (dFrs > TH) return `A fresher, brighter take${sameFam ? ' on ' + famA : ''}`;
  if (dWrm > TH) return `A warmer, cozier alternative${sameFam ? ' on ' + famA : ''}`;
  if (dSwt < -TH) return `A less sweet, drier alternative`;
  if (dFrs < -TH) return `A deeper, less fresh take`;
  if (shNote && sameFam) return `A very similar ${famA} focused on ${shNote}`;
  if (sameFam) return `A closely related ${famA} to try`;
  if (shNote) return `A ${famC} alternative sharing ${shNote}`;

  return `An alternative from the ${famC} family`;
}

/**
 * Multi-factor ranking for discovery/quizzes.
 */
export function scoreFragrances(catalog, collectedTags, config = {}) {
  return catalog.map(f => {
    let score = 0;
    const allNotes = f._nAll || [];
    
    collectedTags.forEach(tag => {
      if (f.family === tag) score += 5;
      if (allNotes.includes(tag)) score += 3;
      if (f.roles && f.roles.includes(tag)) score += 2;
      
      if (tag.startsWith('blacklist_')) {
        const bl = tag.replace('blacklist_', '');
        if (f.family === bl || allNotes.includes(bl)) score -= 50;
      }
    });

    if (collectedTags.includes('intensity') && f.sillage > 7) score += 5;
    if (collectedTags.includes('intimate') && f.sillage < 4) score += 5;
    if (collectedTags.includes('freshness') && (f.family === 'citrus' || f.family === 'aquatic' || f.family === 'green')) score += 3;
    if (collectedTags.includes('warmth') && (f.family === 'amber' || f.family === 'oud' || f.family === 'woody')) score += 3;

    return { f, score };
  })
  .filter(x => x.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(x => x.f)
  .slice(0, config.limit || 3);
}
