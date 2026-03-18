/* ── Scentmap Quiz Engine ──
   Lightweight standalone quiz for /quiz/:slug pages.
   Fetches scent data + quiz config, runs scoring, renders results. */

const FAM = {
  citrus:  { label: 'Citrus',   color: '#9A6800' },
  green:   { label: 'Green',    color: '#1A6030' },
  floral:  { label: 'Floral',   color: '#902050' },
  woody:   { label: 'Woody',    color: '#6E3210' },
  amber:   { label: 'Amber',    color: '#984000' },
  chypre:  { label: 'Chypre',   color: '#285438' },
  aquatic: { label: 'Aquatic',  color: '#0A4880' },
  leather: { label: 'Leather',  color: '#42200E' },
  gourmand:{ label: 'Gourmand', color: '#7C4C00' },
  oud:     { label: 'Oud',      color: '#4A1850' },
};

const FAM_PROFILE_BASE = {
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

const NOTE_PROFILE = {
  'agarwood':[0.10,0.22,0.90],'aldehydes':[0.72,0.20,0.38],'almond':[0.10,0.85,0.60],
  'amber':[0.10,0.62,0.90],'ambergris':[0.20,0.35,0.65],'ambrette':[0.32,0.50,0.52],
  'apple':[0.65,0.55,0.12],'atlas cedar':[0.35,0.10,0.65],'basil':[0.72,0.10,0.30],
  'benzoin':[0.10,0.65,0.80],'bergamot':[0.92,0.25,0.10],'birch tar':[0.15,0.10,0.75],
  'black currant':[0.68,0.42,0.22],'black orchid':[0.20,0.50,0.60],'black pepper':[0.50,0.10,0.55],
  'blood orange':[0.80,0.48,0.12],'caramel':[0.05,0.90,0.70],'cardamom':[0.42,0.28,0.78],
  'casablanca lily':[0.52,0.38,0.30],'castoreum':[0.10,0.22,0.80],'cedar':[0.32,0.10,0.65],
  'cedarwood':[0.32,0.10,0.65],'cinnamon':[0.22,0.50,0.82],'cistus':[0.25,0.30,0.72],
  'clove':[0.20,0.35,0.85],'coconut':[0.15,0.80,0.55],'coffee':[0.18,0.50,0.72],
  'cyclamen':[0.65,0.28,0.20],'cypriol':[0.18,0.15,0.75],'driftwood':[0.35,0.05,0.52],
  'elemi':[0.38,0.12,0.68],'eucalyptus':[0.80,0.05,0.15],'fig':[0.42,0.50,0.38],
  'fir':[0.58,0.05,0.40],'frankincense':[0.32,0.20,0.75],'freesia':[0.70,0.35,0.22],
  'galbanum':[0.70,0.05,0.22],'gardenia':[0.42,0.50,0.40],'geranium':[0.65,0.20,0.35],
  'ginger':[0.55,0.20,0.65],'grapefruit':[0.90,0.20,0.05],'grass':[0.80,0.10,0.12],
  'green tea':[0.75,0.15,0.22],'guaiac wood':[0.22,0.15,0.70],'heliotrope':[0.30,0.70,0.50],
  'honey':[0.10,0.85,0.65],'honeysuckle':[0.55,0.55,0.30],'hyacinth':[0.60,0.30,0.22],
  'incense':[0.25,0.15,0.80],'iris':[0.48,0.32,0.38],'jasmine':[0.40,0.52,0.55],
  'labdanum':[0.10,0.42,0.90],'lapsang':[0.20,0.10,0.72],'lavender':[0.70,0.15,0.35],
  'leather':[0.10,0.10,0.75],'lemon':[0.92,0.20,0.05],'lily':[0.55,0.30,0.30],
  'lily of the valley':[0.72,0.25,0.20],'lime':[0.88,0.15,0.05],'magnolia':[0.52,0.38,0.30],
  'mandarin':[0.82,0.45,0.15],'mate':[0.60,0.10,0.30],'mimosa':[0.55,0.50,0.40],
  'mint':[0.85,0.10,0.10],'musk':[0.25,0.30,0.50],'myrrh':[0.15,0.28,0.85],
  'narcissus':[0.42,0.38,0.45],'neroli':[0.75,0.35,0.30],'nutmeg':[0.30,0.30,0.75],
  'oakmoss':[0.30,0.10,0.60],'orange blossom':[0.60,0.52,0.40],'orchid':[0.40,0.45,0.42],
  'oud':[0.05,0.38,0.95],'palisander':[0.22,0.18,0.70],'papyrus':[0.42,0.10,0.35],
  'patchouli':[0.10,0.28,0.85],'peach':[0.55,0.72,0.20],'peony':[0.60,0.42,0.30],
  'pepper':[0.50,0.10,0.55],'pine':[0.55,0.05,0.45],'pineapple':[0.65,0.68,0.12],
  'pink pepper':[0.58,0.18,0.50],'praline':[0.05,0.90,0.65],'rose':[0.50,0.50,0.45],
  'rosemary':[0.68,0.08,0.35],'rosewood':[0.35,0.22,0.60],'saffron':[0.22,0.30,0.80],
  'sandalwood':[0.20,0.32,0.78],'smoke':[0.15,0.08,0.72],'suede':[0.22,0.22,0.60],
  'tea':[0.62,0.12,0.28],'tiare':[0.45,0.55,0.50],'tobacco':[0.12,0.40,0.78],
  'tonka bean':[0.10,0.80,0.70],'tuberose':[0.35,0.55,0.60],'tulip':[0.60,0.30,0.25],
  'vanilla':[0.05,0.90,0.70],'vetiver':[0.25,0.10,0.72],'violet':[0.50,0.30,0.35],
  'violet leaf':[0.65,0.15,0.20],'waterlily':[0.80,0.20,0.12],'white musk':[0.32,0.35,0.42],
  'ylang-ylang':[0.30,0.60,0.65],'yuzu':[0.88,0.20,0.08],
};

/* ── Profile computation (ported from app.js) ── */
function computeProfile(frag) {
  if (frag._profile) return frag._profile;
  const b = FAM_PROFILE_BASE[frag.family] || [0.5, 0.5, 0.5];
  const weighted = [
    ...(frag.top || []).map(n => ({ n: n.toLowerCase(), w: 0.5 })),
    ...(frag.mid || []).map(n => ({ n: n.toLowerCase(), w: 1.0 })),
    ...(frag.base || []).map(n => ({ n: n.toLowerCase(), w: 1.5 })),
  ].filter(({ n }) => NOTE_PROFILE[n]);
  if (weighted.length === 0) {
    frag._profile = { freshness: b[0], sweetness: b[1], warmth: b[2], intensity: (frag.sillage || 5) / 10, complexity: (frag.layering || 5) / 10 };
    return frag._profile;
  }
  const totalW = weighted.reduce((s, { w }) => s + w, 0);
  const avg = weighted.reduce((acc, { n, w }) => { const p = NOTE_PROFILE[n]; acc[0] += p[0] * w; acc[1] += p[1] * w; acc[2] += p[2] * w; return acc; }, [0, 0, 0]).map(v => v / totalW);
  frag._profile = {
    freshness: avg[0] * 0.6 + b[0] * 0.4,
    sweetness: avg[1] * 0.6 + b[1] * 0.4,
    warmth: avg[2] * 0.6 + b[2] * 0.4,
    intensity: (frag.sillage || 5) / 10,
    complexity: (frag.layering || 5) / 10,
  };
  return frag._profile;
}

/* ── Scoring ── */
function scoreFragrances(catalog, collectedTags, scoringConfig) {
  const brandFilter = scoringConfig?.brandFilter;
  const genderBias = scoringConfig?.genderBias;
  const giftMode = scoringConfig?.giftMode;

  let pool = catalog;
  if (brandFilter) {
    pool = catalog.filter(f => f.brand.toLowerCase() === brandFilter);
  }

  // If brand-scoped (like Byredo), use simpler scoring
  if (brandFilter) {
    return pool.map(f => {
      let score = 0;
      collectedTags.forEach(tag => {
        if (f.family === tag) score += 3;
        if (f.roles.includes(tag)) score += 2;
      });
      return { frag: f, score };
    }).sort((a, b) => b.score - a.score)
      .filter(x => x.score > 0)
      .map(x => x.frag)
      .slice(0, 3);
  }

  // Full scoring (global quiz logic)
  const prefs = {
    boostFamilies: [],
    boostFreshness: false,
    boostWarmth: false,
    boostIntensity: false,
    penalizeIntensity: false,
    blacklistFamilies: [],
    blacklistRoles: [],
  };

  collectedTags.forEach(tag => {
    if (tag === 'all') { /* base points */ }
    else if (tag === 'freshness') prefs.boostFreshness = true;
    else if (tag === 'warmth') prefs.boostWarmth = true;
    else if (tag === 'intensity') prefs.boostIntensity = true;
    else if (tag === 'intimate') prefs.penalizeIntensity = true;
    else if (tag.startsWith('blacklist_')) {
      const bl = tag.replace('blacklist_', '');
      if (bl === 'gourmand') {
        prefs.blacklistRoles.push('gourmand', 'sweet');
        prefs.blacklistFamilies.push('amber');
      } else {
        prefs.blacklistFamilies.push(bl);
      }
    }
    else if (tag !== 'neutral' && tag !== 'crowd-pleaser' && tag !== 'safe') {
      prefs.boostFamilies.push(tag);
    }
  });

  let scored = pool.map(frag => {
    let score = 0;

    if (prefs.blacklistFamilies.includes(frag.family)) return { frag, score: -100 };
    if (prefs.blacklistRoles.some(r => frag.roles.includes(r))) return { frag, score: -100 };

    if (collectedTags.includes('all')) score += 1;

    // Family/vibe match
    if (prefs.boostFamilies.includes(frag.family)) score += 5;
    prefs.boostFamilies.forEach(bf => {
      if (frag.roles.includes(bf)) score += 2;
    });

    // Profile match
    const prof = computeProfile(frag);
    if (prefs.boostFreshness && prof.freshness > 0.6) score += 3;
    if (prefs.boostWarmth && prof.warmth > 0.6) score += 3;
    if (prefs.boostIntensity && prof.intensity > 0.6) score += 3;
    if (prefs.penalizeIntensity) {
      if (prof.intensity < 0.4) score += 3;
      else if (prof.intensity > 0.6) score -= 3;
    }

    // Gender bias (soft signal)
    if (genderBias === 'masculine') {
      if (['woody', 'leather', 'oud', 'citrus'].includes(frag.family)) score += 2;
    } else if (genderBias === 'feminine') {
      if (['floral', 'gourmand', 'chypre', 'amber'].includes(frag.family)) score += 2;
    }

    // Gift mode: boost crowd-pleasers (moderate sillage, broad appeal)
    if (giftMode) {
      if (frag.sillage >= 4 && frag.sillage <= 7) score += 2;
      if (collectedTags.includes('crowd-pleaser') || collectedTags.includes('safe')) {
        if (['woody', 'citrus', 'floral'].includes(frag.family)) score += 2;
      }
    }

    return { frag, score };
  }).filter(x => x.score > -50).sort((a, b) => b.score - a.score);

  let top3 = scored.filter(x => x.score > 0).map(x => x.frag).slice(0, 3);
  if (top3.length === 0 && pool.length > 2) {
    top3 = pool.slice(0, 3);
  }
  return top3;
}

/* ── Archetypes ── */
const ARCHETYPES = {
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

/* ── Zodiac Traits ── */
const ZODIAC = {
  'aries': {
    name: 'Aries',
    traits: 'bold, energetic, and pioneering',
    archetypeId: 'provocateur',
    desc: 'As a fire sign, you need a scent that matches your high-octane energy. You gravitate toward intense, woody, and amber profiles that command attention.'
  },
  'taurus': {
    name: 'Taurus',
    traits: 'sensual, grounded, and indulgent',
    archetypeId: 'sensory-hedonist',
    desc: 'You appreciate the finer things and natural beauty. Green, floral, and warm balsamic notes reflect your love for earthy luxury and comfort.'
  },
  'gemini': {
    name: 'Gemini',
    traits: 'witty, versatile, and curious',
    archetypeId: 'sun-chaser',
    desc: 'Your dual nature demands a scent that is as multifaceted as you are. Bright citrus and dewy florals keep up with your fast-paced, social lifestyle.'
  },
  'cancer': {
    name: 'Cancer',
    traits: 'intuitive, nurturing, and emotive',
    archetypeId: 'romantic',
    desc: 'Fragrance is personal and nostalgic for you. You prefer intimate skin scents, soft florals, and aquatic notes that feel like a protective, watery embrace.'
  },
  'leo': {
    name: 'Leo',
    traits: 'radiant, confident, and dramatic',
    archetypeId: 'provocateur',
    desc: 'You were born to stand out. Only the most regal ambers and boldest florals will do for someone who naturally takes center stage.'
  },
  'virgo': {
    name: 'Virgo',
    traits: 'precise, analytical, and elegant',
    archetypeId: 'minimalist',
    desc: 'You value clarity and craftsmanship. Crisp green notes and polished woods appeal to your desire for a scent that is clean, intentional, and perfectly balanced.'
  },
  'libra': {
    name: 'Libra',
    traits: 'harmonious, romantic, and charming',
    archetypeId: 'romantic',
    desc: 'Ruled by Venus, you seek beauty and balance. Sophisticated chypres and airy florals provide the aesthetic harmony you crave.'
  },
  'scorpio': {
    name: 'Scorpio',
    traits: 'intense, mysterious, and powerful',
    archetypeId: 'urban-intellectual',
    desc: 'You are drawn to the shadows and the deep. Dark oud, smoky leather, and rich spices reflect your magnetic and transformative presence.'
  },
  'sagittarius': {
    name: 'Sagittarius',
    traits: 'adventurous, optimistic, and free-spirited',
    archetypeId: 'sun-chaser',
    desc: 'The explorer of the zodiac needs a scent that travels well. Fresh woods and bright, open-air citruses match your quest for the next big horizon.'
  },
  'capricorn': {
    name: 'Capricorn',
    traits: 'ambitious, disciplined, and timeless',
    archetypeId: 'quiet-expressionist',
    desc: 'You play the long game. Classic leather, sturdy woods, and warm ambers reflect your resilience and your respect for tradition and quality.'
  },
  'aquarius': {
    name: 'Aquarius',
    traits: 'original, independent, and visionary',
    archetypeId: 'urban-intellectual',
    desc: 'You defy convention. Unconventional aquatics and electric citruses appeal to your forward-thinking and rebellious spirit.'
  },
  'pisces': {
    name: 'Pisces',
    traits: 'dreamy, compassionate, and ethereal',
    archetypeId: 'minimalist',
    desc: 'As the mystic of the zodiac, you drift between worlds. Soft aquatics and dewy, romantic florals capture your poetic and imaginative essence.'
  }
};

function scoreArchetypeMode(catalog, collectedTags) {
  // Tally arch: tags to find dominant archetype
  const counts = {};
  collectedTags.forEach(tag => {
    if (tag.startsWith('arch:')) {
      const a = tag.slice(5);
      counts[a] = (counts[a] || 0) + 1;
    }
  });
  const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'quiet-expressionist';
  const archetype = ARCHETYPES[topId] || ARCHETYPES['quiet-expressionist'];

  // Score fragrances using archetype's preferred tags + user's family tags
  const userFamilyTags = collectedTags.filter(t => !t.startsWith('arch:'));
  const merged = [...new Set([...userFamilyTags, ...archetype.tags])];
  const frags = scoreFragrances(catalog, merged, {});
  return { archetype, frags };
}

function scoreAstroMode(catalog, collectedTags) {
  // Find the selected zodiac sign
  const signTag = collectedTags.find(t => t.startsWith('astro:'));
  const signId = signTag ? signTag.slice(6) : 'aries';
  const sign = ZODIAC[signId] || ZODIAC['aries'];
  const archetype = ARCHETYPES[sign.archetypeId] || ARCHETYPES['provocateur'];

  // Filter out the astro tag for scoring
  const userTags = collectedTags.filter(t => !t.startsWith('astro:'));
  
  // Merge user's climate/vibe tags with archetype's core tags
  const mergedTags = [...new Set([...userTags, ...archetype.tags])];
  const frags = scoreFragrances(catalog, mergedTags, {});
  
  return { sign, archetype, frags };
}

/* ── UI Rendering ── */
let _container;
let _quizConfig;
let _catalog;
let _slug;

function getSlug() {
  const m = window.location.pathname.match(/^\/quiz\/([a-z0-9-]+)/);
  return m ? m[1] : null;
}

function renderQuiz(container, config, catalog) {
  _container = container;
  _quizConfig = config;
  _catalog = catalog;
  _slug = getSlug();

  if (!config) {
    container.innerHTML = '<div style="padding:var(--sp-xl);text-align:center;"><p>Quiz not found.</p><a href="/">Back to Scentmap</a></div>';
    return;
  }

  // Check for pre-loaded results in URL
  const urlParams = new URLSearchParams(window.location.search);
  const resultsParam = urlParams.get('results');
  if (resultsParam) {
    const ids = resultsParam.split(',');
    const resultFrags = ids.map(id => catalog.find(f => f.id === id)).filter(Boolean).slice(0, 3);
    if (resultFrags.length > 0) {
      if (config.scoring?.archetypeMode) {
        const archetypeId = urlParams.get('archetype') || 'quiet-expressionist';
        const archetype = ARCHETYPES[archetypeId] || ARCHETYPES['quiet-expressionist'];
        renderArchetypeResults(archetype, resultFrags);
      } else if (config.scoring?.astroMode) {
        const signId = urlParams.get('sign') || 'aries';
        const sign = ZODIAC[signId] || ZODIAC['aries'];
        const archetype = ARCHETYPES[sign.archetypeId] || ARCHETYPES['provocateur'];
        renderAstroResults(sign, archetype, resultFrags);
      } else {
        renderResults(resultFrags);
      }
      return;
    }
  }

  renderStep(0, []);
}

function renderStep(step, collectedTags) {
  const qs = _quizConfig.questions;
  if (step >= qs.length) {
      const { archetype, frags } = scoreArchetypeMode(_catalog, collectedTags);
      const ids = frags.map(f => f.id).join(',');
      window._saveQuizResult?.(_slug, _quizConfig.title, archetype, frags);
      history.replaceState(null, '', `/quiz/${_slug}?archetype=${archetype.id}&results=${ids}`);
      renderArchetypeResults(archetype, frags);
    } else if (_quizConfig.scoring?.astroMode) {
      const { sign, archetype, frags } = scoreAstroMode(_catalog, collectedTags);
      const ids = frags.map(f => f.id).join(',');
      window._saveQuizResult?.(_slug, _quizConfig.title, { name: sign.name, traits: sign.traits, archetype: archetype.name }, frags);
      const signTag = collectedTags.find(t => t.startsWith('astro:'));
      const signId = signTag ? signTag.slice(6) : 'aries';
      history.replaceState(null, '', `/quiz/${_slug}?sign=${signId}&results=${ids}`);
      renderAstroResults(sign, archetype, frags);
    } else {
      const top3 = scoreFragrances(_catalog, collectedTags, _quizConfig.scoring);
      if (top3.length > 0) {
        window._saveQuizResult?.(_slug, _quizConfig.title, null, top3);
        const ids = top3.map(f => f.id).join(',');
        history.replaceState(null, '', `/quiz/${_slug}?results=${ids}`);
      }
      renderResults(top3);
    }
    return;
  }

  const q = qs[step];
  _container.innerHTML = `
    <div class="quiz-page">
      <nav class="global-nav">
        <div class="global-nav-left">
          <a href="/" class="global-nav-logo">Scentmap</a>
          <div class="global-nav-links">
            <a href="/app#catalog" class="global-nav-link">Fragrances</a>
            <a href="/app#compare" class="global-nav-link">Compare</a>
            <a href="/app#notes" class="global-nav-link">Notes</a>
            <a href="/#quizzes" class="global-nav-link active">Quizzes</a>
          </div>
        </div>
        <div class="global-nav-right">
          <span class="quiz-title-small">${_quizConfig.title}</span>
        </div>
      </nav>
      <div class="quiz-body">
        <div class="quiz-progress">${step + 1} of ${qs.length}</div>
        <div class="quiz-bar-track"><div class="quiz-bar-fill" style="width:${((step + 1) / qs.length) * 100}%"></div></div>
        <h1 class="quiz-question">${q.q}</h1>
        <div class="quiz-answers">
          ${q.a.map((ans, i) => `
            <button class="quiz-ans-btn" data-idx="${i}">${ans.label}</button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  _container.querySelectorAll('.quiz-ans-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.idx, 10);
      const newTags = [...collectedTags, ...q.a[idx].tags];
      renderStep(step + 1, newTags);
    });
  });
}

function _buildMoreQuizzesHtml() {
  const all = [
    { slug: 'scent-archetype', label: "What's Your Scent Archetype?" },
    { slug: 'astro-scent', label: "Find Your Astro Scent Match" },
    { slug: 'find-your-scent', label: 'Find Your Perfect Fragrance' },
    { slug: 'best-perfume-for-men-2026', label: 'Best Perfume for Men 2026' },
    { slug: 'best-perfume-for-women-2026', label: 'Best Perfume for Women 2026' },
    { slug: 'best-perfume-to-gift-2026', label: 'Best Perfume to Gift 2026' },
    { slug: 'find-your-byredo', label: 'Find Your Byredo' },
  ];
  const links = all.filter(q => q.slug !== _slug)
    .map(q => `<a href="/quiz/${q.slug}" class="quiz-more-link">${q.label}</a>`)
    .join('');
  return `<div class="quiz-more-quizzes"><h2 class="quiz-more-title">More Quizzes</h2><div class="quiz-more-grid">${links}</div></div>`;
}

function renderResults(top3) {
  const resultsHtml = top3.map(frag => {
    const fc = FAM[frag.family] || { label: frag.family, color: '#8C5E30' };
    return `
      <a href="/app#frag=${frag.id}" class="quiz-result-card">
        <div class="quiz-result-dot" style="background:${fc.color}"></div>
        <div class="quiz-result-info">
          <div class="quiz-result-name">${frag.name}</div>
          <div class="quiz-result-brand">${frag.brand} &middot; ${fc.label}</div>
          ${frag.description ? `<div class="quiz-result-desc">${frag.description}</div>` : ''}
        </div>
        <svg class="quiz-result-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    `;
  }).join('');

  _container.innerHTML = `
    <div class="quiz-page">
      <nav class="global-nav">
        <div class="global-nav-left">
          <a href="/" class="global-nav-logo">Scentmap</a>
          <div class="global-nav-links">
            <a href="/app#catalog" class="global-nav-link">Fragrances</a>
            <a href="/app#compare" class="global-nav-link">Compare</a>
            <a href="/app#notes" class="global-nav-link">Notes</a>
            <a href="/#quizzes" class="global-nav-link active">Quizzes</a>
          </div>
        </div>
        <div class="global-nav-right">
          <span class="quiz-title-small">${_quizConfig.title}</span>
        </div>
      </nav>
      <div class="quiz-body">
        <h1 class="quiz-question">Your Perfect Matches</h1>
        <p class="quiz-subtitle">Based on your answers, we recommend these fragrances:</p>
        <div class="quiz-results">
          ${resultsHtml}
        </div>
        <div class="quiz-actions">
          <button class="quiz-btn-secondary" onclick="history.replaceState(null,'','/quiz/${_slug}');_retakeQuiz();">Retake Quiz</button>
          <button class="quiz-btn-primary" onclick="copyQuizLink()">Share Results</button>
        </div>
        <div class="quiz-share-toast" id="quiz-share-toast">Link copied!</div>
        ${_buildMoreQuizzesHtml()}
        <a href="/app" class="quiz-engine-link">Open the full Scentmap engine</a>
      </div>
    </div>
  `;
}

function renderArchetypeResults(archetype, frags) {
  const famColors = { woody:'#6E3210', green:'#1A6030', chypre:'#285438', citrus:'#9A6800', floral:'#902050', amber:'#984000', oud:'#4A1850', leather:'#42200E', gourmand:'#7C4C00', aquatic:'#0A4880' };
  const familyPills = archetype.families.map(f => {
    const color = famColors[f] || '#8C5E30';
    return `<span class="quiz-arch-fam" style="background:${color}18;color:${color};border-color:${color}30">${f.charAt(0).toUpperCase()+f.slice(1)}</span>`;
  }).join('');

  const moreQuizzes = _buildMoreQuizzesHtml();

  const resultsHtml = frags.map(frag => {
    const fc = FAM[frag.family] || { label: frag.family, color: '#8C5E30' };
    return `
      <a href="/app#frag=${frag.id}&source=quiz&archetype=${archetype.id}" class="quiz-result-card">
        <div class="quiz-result-dot" style="background:${fc.color}"></div>
        <div class="quiz-result-info">
          <div class="quiz-result-name">${frag.name}</div>
          <div class="quiz-result-brand">${frag.brand} &middot; ${fc.label}</div>
          ${frag.description ? `<div class="quiz-result-desc">${frag.description}</div>` : ''}
        </div>
        <svg class="quiz-result-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    `;
  }).join('');

  _container.innerHTML = `
    <div class="quiz-page">
      <nav class="global-nav">
        <div class="global-nav-left">
          <a href="/" class="global-nav-logo">Scentmap</a>
          <div class="global-nav-links">
            <a href="/app#catalog" class="global-nav-link">Fragrances</a>
            <a href="/app#compare" class="global-nav-link">Compare</a>
            <a href="/app#notes" class="global-nav-link">Notes</a>
            <a href="/#quizzes" class="global-nav-link active">Quizzes</a>
          </div>
        </div>
        <div class="global-nav-right">
          <span class="quiz-title-small">${_quizConfig.title}</span>
        </div>
      </nav>
      <div class="quiz-body">
        <div class="quiz-archetype-card">
          <div class="quiz-archetype-eyebrow">Your Scent Archetype</div>
          <h1 class="quiz-archetype-name">${archetype.name}</h1>
          <p class="quiz-archetype-tagline">${archetype.tagline}</p>
          <div class="quiz-arch-families">${familyPills}</div>
          <p class="quiz-archetype-desc">${archetype.desc}</p>
        </div>
        <h2 class="quiz-section-title">Your Matches</h2>
        <div class="quiz-results">
          ${resultsHtml}
        </div>
        <div class="quiz-actions">
          <button class="quiz-btn-secondary" onclick="history.replaceState(null,'','/quiz/${_slug}');_retakeQuiz();">Retake Quiz</button>
          <button class="quiz-btn-primary" onclick="copyQuizLink()">Share Results</button>
        </div>
        <div class="quiz-share-toast" id="quiz-share-toast">Link copied!</div>
        ${moreQuizzes}
        <a href="/app" class="quiz-engine-link">Open the full Scentmap engine</a>
      </div>
    </div>
  `;
}

function renderAstroResults(sign, archetype, frags) {
  const moreQuizzes = _buildMoreQuizzesHtml();
  const famColors = { woody:'#6E3210', green:'#1A6030', chypre:'#285438', citrus:'#9A6800', floral:'#902050', amber:'#984000', oud:'#4A1850', leather:'#42200E', gourmand:'#7C4C00', aquatic:'#0A4880' };
  const familyPills = archetype.families.map(f => {
    const color = famColors[f] || '#8C5E30';
    return `<span class="quiz-arch-fam" style="background:${color}18;color:${color};border-color:${color}30">${f.charAt(0).toUpperCase()+f.slice(1)}</span>`;
  }).join('');

  const resultsHtml = frags.map(frag => {
    const fc = FAM[frag.family] || { label: frag.family, color: '#8C5E30' };
    return `
      <a href="/app#frag=${frag.id}&source=quiz&archetype=${archetype.id}" class="quiz-result-card">
        <div class="quiz-result-dot" style="background:${fc.color}"></div>
        <div class="quiz-result-info">
          <div class="quiz-result-name">${frag.name}</div>
          <div class="quiz-result-brand">${frag.brand} &middot; ${fc.label}</div>
          ${frag.description ? `<div class="quiz-result-desc">${frag.description}</div>` : ''}
        </div>
        <svg class="quiz-result-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    `;
  }).join('');

  _container.innerHTML = `
    <div class="quiz-page">
      <nav class="global-nav">
        <div class="global-nav-left">
          <a href="/" class="global-nav-logo">Scentmap</a>
          <div class="global-nav-links">
            <a href="/app#catalog" class="global-nav-link">Fragrances</a>
            <a href="/app#compare" class="global-nav-link">Compare</a>
            <a href="/app#notes" class="global-nav-link">Notes</a>
            <a href="/#quizzes" class="global-nav-link active">Quizzes</a>
          </div>
        </div>
        <div class="global-nav-right">
          <span class="quiz-title-small">${_quizConfig.title}</span>
        </div>
      </nav>
      <div class="quiz-body">
        <div class="quiz-archetype-card">
          <div class="quiz-archetype-eyebrow">Cosmic Scent Match</div>
          <h1 class="quiz-archetype-name">${sign.name}</h1>
          <p class="quiz-archetype-tagline">You are ${sign.traits}.</p>
          <p class="quiz-archetype-desc" style="margin-bottom:var(--sp-lg);">${sign.desc}</p>
          
          <div style="border-top:1px solid var(--border-subtle); padding-top:var(--sp-md); margin-top:var(--sp-md);">
            <div class="quiz-archetype-eyebrow">Your Olfactive Archetype</div>
            <h2 class="quiz-archetype-name" style="font-size:var(--fs-title);">${archetype.name}</h2>
            <div class="quiz-arch-families" style="margin-bottom:var(--sp-sm);">${familyPills}</div>
            <p class="quiz-archetype-desc">${archetype.desc}</p>
          </div>
        </div>
        
        <h2 class="quiz-section-title">Your Zodiac Recommendations</h2>
        <div class="quiz-results">
          ${resultsHtml}
        </div>
        <div class="quiz-actions">
          <button class="quiz-btn-secondary" onclick="history.replaceState(null,'','/quiz/${_slug}');_retakeQuiz();">Retake Quiz</button>
          <button class="quiz-btn-primary" onclick="copyQuizLink()">Share Results</button>
        </div>
        <div class="quiz-share-toast" id="quiz-share-toast">Link copied!</div>
        ${moreQuizzes}
        <a href="/app" class="quiz-engine-link">Open the full Scentmap engine</a>
      </div>
    </div>
  `;
}

function copyQuizLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const toast = document.getElementById('quiz-share-toast');
    if (toast) {
      toast.classList.add('visible');
      setTimeout(() => toast.classList.remove('visible'), 2000);
    }
  }).catch(() => {
    // Fallback: select and copy
    const ta = document.createElement('textarea');
    ta.value = window.location.href;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    const toast = document.getElementById('quiz-share-toast');
    if (toast) {
      toast.classList.add('visible');
      setTimeout(() => toast.classList.remove('visible'), 2000);
    }
  });
}

/* ── Styles (injected once) ── */
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .quiz-page { min-height: 100vh; min-height: 100dvh; background: var(--bg-secondary, #F5F2EC); }
    .quiz-title-small { font-family: var(--font-sans, 'DM Sans', sans-serif); font-size: var(--fs-sm, 13px); color: var(--text-tertiary, #B0A898); }
    .quiz-body { max-width: 600px; margin: 0 auto; padding: var(--sp-3xl, 36px) var(--sp-xl, 24px); }
    .quiz-progress { font-family: var(--font-sans, 'DM Sans', sans-serif); font-size: var(--fs-sm, 13px); color: var(--text-tertiary, #B0A898); margin-bottom: var(--sp-xs, 4px); }
    .quiz-bar-track { height: 3px; background: var(--border-subtle, #E8E4DC); border-radius: 2px; margin-bottom: var(--sp-xl, 24px); }
    .quiz-bar-fill { height: 100%; background: var(--text-primary, #0E0C09); border-radius: 2px; transition: width 0.3s cubic-bezier(.16,1,.3,1); }
    .quiz-question { font-family: var(--font-display, 'Archivo Black', sans-serif); font-size: clamp(24px, 5vw, 36px); line-height: 1.15; letter-spacing: -0.02em; color: var(--text-primary, #0E0C09); margin: 0 0 var(--sp-xl, 24px); }
    .quiz-subtitle { font-family: var(--font-serif, 'Source Serif 4', serif); font-size: var(--fs-body, 15px); color: var(--text-secondary, #8C8070); margin: calc(-1 * var(--sp-sm, 8px)) 0 var(--sp-xl, 24px); line-height: var(--lh-body, 1.6); }
    .quiz-answers { display: flex; flex-direction: column; gap: var(--sp-md, 12px); }
    .quiz-ans-btn {
      display: block; width: 100%; text-align: left; padding: var(--sp-lg, 20px); border: 1px solid var(--border-standard, #DDD8D0);
      border-radius: var(--radius-lg, 12px); background: var(--bg-primary, #FAF8F4); font-family: var(--font-serif, 'Source Serif 4', serif);
      font-size: var(--fs-body, 15px); color: var(--text-primary, #0E0C09); cursor: pointer; line-height: var(--lh-body, 1.6);
      transition: border-color 0.15s, background 0.15s, transform 0.15s cubic-bezier(.16,1,.3,1);
    }
    .quiz-ans-btn:hover { border-color: var(--border-strong, #C4BFAF); background: var(--bg-secondary, #F5F2EC); transform: translateY(-1px); }
    .quiz-ans-btn:active { transform: translateY(0); }
    .quiz-results { display: flex; flex-direction: column; gap: var(--sp-md, 12px); margin-bottom: var(--sp-2xl, 32px); }
    .quiz-result-card {
      display: flex; align-items: center; gap: var(--sp-md, 12px); padding: var(--sp-lg, 20px); border: 1px solid var(--border-standard, #DDD8D0);
      border-radius: var(--radius-lg, 12px); background: var(--bg-primary, #FAF8F4); text-decoration: none; color: inherit;
      transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s cubic-bezier(.16,1,.3,1);
    }
    .quiz-result-card:hover { border-color: var(--border-strong, #C4BFAF); box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,.08)); transform: translateY(-1px); }
    .quiz-result-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .quiz-result-info { flex: 1; min-width: 0; }
    .quiz-result-name { font-family: var(--font-display, 'Archivo Black', sans-serif); font-size: var(--fs-ui, 14px); letter-spacing: -0.01em; }
    .quiz-result-brand { font-family: var(--font-sans, 'DM Sans', sans-serif); font-size: var(--fs-sm, 13px); color: var(--text-secondary, #8C8070); margin-top: 2px; }
    .quiz-result-desc { font-family: var(--font-serif, 'Source Serif 4', serif); font-size: var(--fs-sm, 13px); color: var(--text-tertiary, #B0A898); margin-top: var(--sp-xs, 4px); line-height: 1.5; }
    .quiz-result-arrow { color: var(--text-tertiary, #B0A898); flex-shrink: 0; }
    .quiz-actions { display: flex; gap: var(--sp-md, 12px); margin-bottom: var(--sp-xl, 24px); }
    .quiz-btn-primary {
      flex: 1; padding: var(--sp-md, 12px); border: none; border-radius: var(--radius-md, 8px);
      background: var(--text-primary, #0E0C09); color: var(--bg-primary, #FAF8F4); font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: var(--fs-ui, 14px); font-weight: 600; cursor: pointer; transition: opacity 0.15s;
    }
    .quiz-btn-primary:hover { opacity: 0.85; }
    .quiz-btn-secondary {
      flex: 1; padding: var(--sp-md, 12px); border: 1px solid var(--border-strong, #C4BFAF); border-radius: var(--radius-md, 8px);
      background: transparent; color: var(--text-primary, #0E0C09); font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: var(--fs-ui, 14px); font-weight: 600; cursor: pointer; transition: background 0.15s;
    }
    .quiz-btn-secondary:hover { background: var(--bg-secondary, #F5F2EC); }
    .quiz-share-toast {
      text-align: center; font-family: var(--font-sans, 'DM Sans', sans-serif); font-size: var(--fs-sm, 13px);
      color: var(--text-secondary, #8C8070); opacity: 0; transition: opacity 0.3s; margin-bottom: var(--sp-xl, 24px);
    }
    .quiz-share-toast.visible { opacity: 1; }
    .quiz-more-quizzes { border-top: 1px solid var(--border-subtle, #E8E4DC); padding-top: var(--sp-xl, 24px); margin-bottom: var(--sp-xl, 24px); }
    .quiz-more-title { font-family: var(--font-sans, 'DM Sans', sans-serif); font-size: var(--fs-ui, 14px); font-weight: 600; color: var(--text-secondary, #8C8070); margin: 0 0 var(--sp-md, 12px); }
    .quiz-more-grid { display: flex; flex-direction: column; gap: var(--sp-sm, 8px); }
    .quiz-more-link {
      font-family: var(--font-sans, 'DM Sans', sans-serif); font-size: var(--fs-ui, 14px); color: var(--text-primary, #0E0C09);
      text-decoration: underline; text-underline-offset: 3px;
    }
    .quiz-more-link:hover { color: var(--text-secondary, #8C8070); }
    .quiz-engine-link {
      display: block; text-align: center; font-family: var(--font-sans, 'DM Sans', sans-serif); font-size: var(--fs-sm, 13px);
      color: var(--text-tertiary, #B0A898); text-decoration: underline; text-underline-offset: 3px; padding-bottom: var(--sp-4xl, 48px);
    }

    /* Archetype result card */
    .quiz-archetype-card { border: 1px solid var(--border-standard, #DDD8D0); border-radius: var(--radius-lg, 12px); background: var(--bg-primary, #FAF8F4); padding: var(--sp-xl, 24px); margin-bottom: var(--sp-xl, 24px); }
    .quiz-archetype-eyebrow { font-family: var(--font-sans, 'DM Sans', sans-serif); font-size: var(--fs-sm, 13px); color: var(--text-tertiary, #B0A898); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; margin-bottom: var(--sp-sm, 8px); }
    .quiz-archetype-name { font-family: var(--font-display, 'Archivo Black', sans-serif); font-size: clamp(22px, 5vw, 32px); line-height: 1.1; letter-spacing: -0.02em; color: var(--text-primary, #0E0C09); margin: 0 0 var(--sp-sm, 8px); }
    .quiz-archetype-tagline { font-family: var(--font-serif, 'Source Serif 4', serif); font-size: var(--fs-body, 15px); font-style: italic; color: var(--text-secondary, #8C8070); margin: 0 0 var(--sp-md, 12px); line-height: 1.5; }
    .quiz-arch-families { display: flex; flex-wrap: wrap; gap: var(--sp-xs, 4px); margin-bottom: var(--sp-md, 12px); }
    .quiz-arch-fam { font-family: var(--font-sans, 'DM Sans', sans-serif); font-size: var(--fs-sm, 13px); font-weight: 600; padding: 3px 10px; border-radius: 20px; border: 1px solid transparent; }
    .quiz-archetype-desc { font-family: var(--font-serif, 'Source Serif 4', serif); font-size: var(--fs-body, 15px); color: var(--text-secondary, #8C8070); margin: 0; line-height: 1.6; }
    .quiz-section-title { font-family: var(--font-sans, 'DM Sans', sans-serif); font-size: var(--fs-ui, 14px); font-weight: 600; color: var(--text-secondary, #8C8070); margin: 0 0 var(--sp-md, 12px); }

    /* Hide app chrome on quiz pages */
    .mobile-bottomnav, .sheet-stack-overlay, .note-float-overlay, .frag-picker-overlay,
    .col-detail, .detail-scrim, #loading-overlay, #app-loading, .app-loading-overlay, #app-error, .app-error-overlay, .auth-modal, .frag-picker-overlay { display: none !important; }
    .col-main { overflow: visible; }
    .shell { display: block; }
    /* Hide all panels */
    .panel { display: none !important; }
  `;
  document.head.appendChild(style);
}

/* ── Init ── */
async function init() {
  // Immediately hide app chrome via JS (belt-and-suspenders with CSS)
  const loadingEl = document.getElementById('app-loading');
  if (loadingEl) loadingEl.style.display = 'none';

  injectStyles();

  const slug = getSlug();
  if (!slug) {
    window.location.href = '/';
    return;
  }

  // Find or create container
  const main = document.querySelector('.col-main');
  if (!main) {
    document.body.innerHTML = '<div id="quiz-root"></div>';
  }
  const container = main || document.getElementById('quiz-root');
  // Clear existing content
  container.innerHTML = '<div class="quiz-page"><div class="quiz-body"><div class="quiz-progress">Loading quiz...</div></div></div>';

  try {
    const [scentsRes, configRes] = await Promise.all([
      fetch('/data/scents-flat.json'),
      fetch('/data/quiz-config.json'),
    ]);

    if (!scentsRes.ok) throw new Error(`Scents fetch failed: ${scentsRes.status}`);
    if (!configRes.ok) throw new Error(`Config fetch failed: ${configRes.status}`);

    const scentsMap = await scentsRes.json();
    const allConfigs = await configRes.json();

    // Convert scents map to array with IDs
    const catalog = Object.entries(scentsMap).map(([id, f]) => ({ ...f, id }));
    const config = allConfigs[slug] || null;

    renderQuiz(container, config, catalog);
  } catch (err) {
    console.error('[quiz] init error:', err);
    // Fallback: try loading from per-brand files
    try {
      const idxRes = await fetch('/data/scents-index.json');
      if (!idxRes.ok) throw new Error('index fetch failed');
      const idx = await idxRes.json();
      const brandArrays = await Promise.all(
        idx.brands.map(b => fetch(`/data/scents/${b}.json`).then(r => r.json()))
      );
      const catalog = brandArrays.flat().map(f => ({
        ...f,
        top: typeof f.top === 'string' ? f.top.split(',').map(s => s.trim()) : f.top,
        mid: typeof f.mid === 'string' ? f.mid.split(',').map(s => s.trim()) : f.mid,
        base: typeof f.base === 'string' ? f.base.split(',').map(s => s.trim()) : f.base,
        roles: f.roles || [],
      }));
      const cfgRes = await fetch('/data/quiz-config.json');
      const allConfigs = cfgRes.ok ? await cfgRes.json() : {};
      const config = allConfigs[slug] || null;
      renderQuiz(container, config, catalog);
    } catch (fallbackErr) {
      console.error('[quiz] fallback error:', fallbackErr);
      container.innerHTML = `<div class="quiz-page"><div class="quiz-body"><p>Failed to load quiz data. <a href="/">Back to Scentmap</a></p></div></div>`;
    }
  }
}

// Make functions available globally for onclick handlers
// NOTE: do NOT expose renderQuiz itself on window — that would override the top-level
// function declaration and cause infinite recursion when init() calls renderQuiz().
window._retakeQuiz = function() { renderQuiz(_container, _quizConfig, _catalog); };
window.copyQuizLink = copyQuizLink;

// Run init as soon as DOM is ready — don't wait for module scripts
if (document.readyState === 'loading') {
  // DOM not ready yet — wait for it, but use a timeout safety net
  document.addEventListener('DOMContentLoaded', init);
  // Safety: if DOMContentLoaded doesn't fire within 5s (blocked module?), force init
  setTimeout(() => { if (!_container) init(); }, 5000);
} else {
  // DOM already ready (interactive or complete) — run immediately
  init();
}
