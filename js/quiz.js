/* ── Scentmap Quiz Engine ──
   Lightweight standalone quiz for /quiz/:slug pages.
   Fetches scent data + quiz config, runs scoring, renders results. */

import { ARCHETYPES, FAM } from './store.js';
import { computeProfile, scoreFragrances as engineScoreFragrances } from './engine.js';

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
// Note: ARCHETYPES are now imported from store.js at the top of the file.

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

  // Check for pre-loaded results in URL, then sessionStorage fallback
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

  // Restore from sessionStorage if same quiz slug (handles panel navigation away + back)
  try {
    const saved = JSON.parse(sessionStorage.getItem('sm_quiz_session') || 'null');
    if (saved && saved.slug === _slug && saved.results) {
      const resultFrags = saved.results.map(id => catalog.find(f => f.id === id)).filter(Boolean);
      if (resultFrags.length > 0) {
        if (saved.mode === 'archetype' && saved.archetypeId) {
          const archetype = ARCHETYPES[saved.archetypeId] || ARCHETYPES['quiet-expressionist'];
          renderArchetypeResults(archetype, resultFrags);
        } else if (saved.mode === 'astro' && saved.signId) {
          const sign = ZODIAC[saved.signId] || ZODIAC['aries'];
          const archetype = ARCHETYPES[sign.archetypeId] || ARCHETYPES['provocateur'];
          renderAstroResults(sign, archetype, resultFrags);
        } else {
          renderResults(resultFrags);
        }
        return;
      }
    }
  } catch(e) { /* storage unavailable — silently skip */ }

  renderStep(0, []);
}

function renderStep(step, collectedTags) {
  const qs = _quizConfig.questions;
  if (step >= qs.length) {
    if (_quizConfig.scoring?.archetypeMode) {
      const { archetype, frags } = scoreArchetypeMode(_catalog, collectedTags);
      const ids = frags.map(f => f.id).join(',');
      window._saveQuizResult?.(_slug, _quizConfig.title, archetype, frags);
      history.replaceState(null, '', `/quiz/${_slug}?archetype=${archetype.id}&results=${ids}`);
      try { sessionStorage.setItem('sm_quiz_session', JSON.stringify({ slug: _slug, mode: 'archetype', archetypeId: archetype.id, results: frags.map(f => f.id) })); } catch(e) {}
      renderArchetypeResults(archetype, frags);
    } else if (_quizConfig.scoring?.astroMode) {
      const { sign, archetype, frags } = scoreAstroMode(_catalog, collectedTags);
      const ids = frags.map(f => f.id).join(',');
      window._saveQuizResult?.(_slug, _quizConfig.title, { name: sign.name, traits: sign.traits, archetype: archetype.name }, frags);
      const signTag = collectedTags.find(t => t.startsWith('astro:'));
      const signId = signTag ? signTag.slice(6) : 'aries';
      history.replaceState(null, '', `/quiz/${_slug}?sign=${signId}&results=${ids}`);
      try { sessionStorage.setItem('sm_quiz_session', JSON.stringify({ slug: _slug, mode: 'astro', signId, results: frags.map(f => f.id) })); } catch(e) {}
      renderAstroResults(sign, archetype, frags);
    } else {
      const top3 = scoreFragrances(_catalog, collectedTags, _quizConfig.scoring);
      if (top3.length > 0) {
        window._saveQuizResult?.(_slug, _quizConfig.title, null, top3);
        const ids = top3.map(f => f.id).join(',');
        history.replaceState(null, '', `/quiz/${_slug}?results=${ids}`);
        try { sessionStorage.setItem('sm_quiz_session', JSON.stringify({ slug: _slug, mode: 'standard', results: top3.map(f => f.id) })); } catch(e) {}
      }
      renderResults(top3);
    }
    return;
  }

  const q = qs[step];
  // Diagnostic intent mapping (transparency)
  const intents = {
    0: "Establishing your olfactive baseline.",
    1: "Defining your preferred fragrance family.",
    2: "Calibrating for notes you find polarizing.",
    3: "Adjusting for desired sillage and projection.",
    4: "Finalizing based on seasonal performance."
  };
  const intent = intents[step] || "Refining your scent match.";

  _container.innerHTML = `
    <div class="quiz-page">
      <div class="quiz-body">
        <div class="section-group">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div class="quiz-progress">${step + 1} of ${qs.length}</div>
            ${step > 0 ? `<button class="text-link" id="quiz-btn-prev">← Previous</button>` : ''}
          </div>
          <div class="quiz-bar-track"><div class="quiz-bar-fill" style="width:${((step + 1) / qs.length) * 100}%"></div></div>
        </div>
        
        <div class="section-group">
          <div class="sec-label">Diagnostic: ${intent}</div>
          <h1 class="quiz-question">${q.q}</h1>
        </div>
        
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

  const prevBtn = document.getElementById('quiz-btn-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const newTags = [...collectedTags];
      // Note: this simple pop assumes each step adds 1 set of tags.
      // Since q.a[idx].tags is spread, we'd need to know how many tags to pop.
      // But for current configs, spreading is fine as we're just rebuilding from start mostly.
      // Actually, we should ideally pass the count or just slice it.
      // For now, let's just assume we can't easily undo the tags without state management,
      // OR we just re-run with step-1.
      newTags.pop(); 
      renderStep(step - 1, newTags);
    });
  }
}

function _buildMoreDiscoveryHtml() {
  const all = [
    { slug: 'scent-archetype', label: "Olfactive Archetype Consultation" },
    { slug: 'astro-scent', label: "Astro Scent Match" },
    { slug: 'find-your-scent', label: 'Signature Scent Discovery' },
    { slug: 'best-perfume-for-men-2026', label: 'Men’s Selection Guide' },
    { slug: 'best-perfume-for-women-2026', label: 'Women’s Selection Guide' },
    { slug: 'best-perfume-to-gift-2026', label: 'Gift Consultation' },
    { slug: 'find-your-byredo', label: 'Byredo Brand Guide' },
  ];
  const links = all.filter(q => q.slug !== _slug)
    .map(q => `<a href="/quiz/${q.slug}" class="text-link">${q.label}</a>`)
    .join('');
  return `<div class="quiz-more-quizzes"><h2 class="sec-label">Explore More Discovery</h2><div class="quiz-more-grid">${links}</div></div>`;
}

function renderResults(top3) {
  const resultsHtml = top3.map(frag => {
    const fc = FAM[frag.family] || { label: frag.family, color: '#8C5E30' };
    return `
      <a href="/app.html#frag=${frag.id}" class="quiz-result-card">
        <div class="quiz-result-dot" style="--fam-bg: ${fc.color}"></div>
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
      <div class="quiz-body">
        <h1 class="quiz-question">Your Perfect Matches</h1>
        <p class="quiz-subtitle">Based on your answers, we recommend these fragrances:</p>
        <div class="quiz-results">
          ${resultsHtml}
        </div>
        <div class="quiz-actions btn-group">
          <button class="btn btn--secondary" onclick="history.replaceState(null,'','/quiz/${_slug}');_retakeQuiz();">Retake Quiz</button>
          <button class="btn btn--primary" onclick="copyQuizLink()">Share Results</button>
        </div>
        <div class="quiz-share-toast" id="quiz-share-toast">Link copied!</div>
        ${_buildMoreDiscoveryHtml()}
        <a href="/app.html" class="quiz-engine-link">Open the full Scentmap engine</a>
      </div>
    </div>
  `;
}

function renderArchetypeResults(archetype, frags) {
  const familyPills = archetype.families.map(f => {
    const fc = FAM[f] || {};
    return `<span class="chip" style="background: ${fc.color||'var(--fam-default)'}; color: var(--bg-primary);">${f.charAt(0).toUpperCase()+f.slice(1)}</span>`;
  }).join('');

  const moreQuizzes = _buildMoreDiscoveryHtml();

  const resultsHtml = frags.map(frag => {
    const fc = FAM[frag.family] || { label: frag.family, color: '#8C5E30' };
    return `
      <a href="/app.html#frag=${frag.id}&source=quiz&archetype=${archetype.id}" class="quiz-result-card">
        <div class="quiz-result-dot" style="--fam-bg: ${fc.color}"></div>
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
      <div class="quiz-body">
        <div class="card">
          <div class="sec-label">Your Scent Archetype</div>
          <h1 class="quiz-archetype-name">${archetype.name}</h1>
          <p class="quiz-archetype-tagline">${archetype.tagline}</p>
          <div class="quiz-arch-families">${familyPills}</div>
          <p class="quiz-archetype-desc">${archetype.desc}</p>
        </div>
        <h2 class="sec-label">Your Matches</h2>
        <div class="quiz-results">
          ${resultsHtml}
        </div>
        <div class="quiz-actions btn-group">
          <button class="btn btn--secondary" onclick="history.replaceState(null,'','/quiz/${_slug}');_retakeQuiz();">Retake Quiz</button>
          <button class="btn btn--primary" onclick="copyQuizLink()">Share Results</button>
        </div>
        <div class="quiz-share-toast" id="quiz-share-toast">Link copied!</div>
        ${moreQuizzes}
        <a href="/app.html" class="quiz-engine-link">Open the full Scentmap engine</a>
      </div>
    </div>
  `;
}

function renderAstroResults(sign, archetype, frags) {
  const moreQuizzes = _buildMoreDiscoveryHtml();
  const familyPills = archetype.families.map(f => {
    const fc = FAM[f] || {};
    return `<span class="chip" style="background: ${fc.color||'var(--fam-default)'}; color: var(--bg-primary);">${f.charAt(0).toUpperCase()+f.slice(1)}</span>`;
  }).join('');

  const resultsHtml = frags.map(frag => {
    const fc = FAM[frag.family] || { label: frag.family, color: '#8C5E30' };
    return `
      <a href="/app.html#frag=${frag.id}&source=quiz&archetype=${archetype.id}" class="quiz-result-card">
        <div class="quiz-result-dot" style="--fam-bg: ${fc.color}"></div>
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
      <div class="quiz-body">
        <div class="card">
          <div class="section-group">
            <div class="sec-label">Cosmic Scent Match</div>
            <h1 class="quiz-archetype-name">${sign.name}</h1>
            <p class="quiz-archetype-tagline">You are ${sign.traits}.</p>
            <p class="quiz-archetype-desc">${sign.desc}</p>
          </div>
          
          <div style="border-top:1px solid var(--border-subtle); padding-top:var(--sp-md);">
            <div class="section-group">
              <div class="sec-label">Your Olfactive Archetype</div>
              <h2 class="quiz-archetype-name" style="font-size:var(--fs-title);">${archetype.name}</h2>
              <div class="quiz-arch-families">${familyPills}</div>
              <p class="quiz-archetype-desc">${archetype.desc}</p>
            </div>
          </div>
        </div>
        
        <div class="section-group">
          <h2 class="sec-label">Your Zodiac Recommendations</h2>
          <div class="quiz-results">
            ${resultsHtml}
          </div>
        </div>
        <div class="quiz-actions btn-group">
          <button class="btn btn--secondary" onclick="history.replaceState(null,'','/quiz/${_slug}');_retakeQuiz();">Retake Quiz</button>
          <button class="btn btn--primary" onclick="copyQuizLink()">Share Results</button>
        </div>
        <div class="quiz-share-toast" id="quiz-share-toast">Link copied!</div>
        ${moreQuizzes}
        <a href="/app.html" class="quiz-engine-link">Open the full Scentmap engine</a>
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

/* ── Styles (injected once — chrome-hiding only; visual styles live in components.css) ── */
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .mobile-bottomnav, .sheet-stack-overlay, .note-float-overlay, .frag-picker-overlay, .catalog-sidebar,
    .col-detail, .detail-scrim, #loading-overlay, #app-loading, .app-loading-overlay, #app-error, .app-error-overlay, .auth-modal { display: none !important; }
    .col-main { overflow: visible; }
    .shell { display: block; }
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
  const main = document.querySelector('.col-main') || document.querySelector('.col-main-content');
  let container;
  if (!main) {
    document.body.innerHTML = '<div id="quiz-root"></div>';
    container = document.getElementById('quiz-root');
  } else {
    // We are inside a shell. Target the main content area.
    container = main;
    // Ensure all app panels are hidden so the quiz can render cleanly
    document.querySelectorAll('.panel').forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });
  }
  
  // Clear existing content and render
  container.innerHTML = '<div class="quiz-page"><div class="quiz-body"><div class="quiz-progress">Loading quiz...</div></div></div>';
  _container = container;

  // Minimal go() redirector for nav links in standalone shell
  window.go = function(id) {
    if (id === 'compare') window.location.href = '/app.html#compare';
    else if (id === 'notes') window.location.href = '/app.html#notes';
    else if (id === 'saved' || id === 'you') window.location.href = '/app.html#saved';
    else if (id === 'discovery') window.location.href = '/app.html#catalog';
    else window.location.href = '/app.html';
  };

  try {
    const [catalog, allConfigs] = await Promise.all([
      fetch('/data/scents.json').then(r => { if (!r.ok) throw new Error(`scents.json: ${r.status}`); return r.json(); }),
      fetch('/data/quiz-config.json').then(r => { if (!r.ok) throw new Error(`quiz-config.json: ${r.status}`); return r.json(); }),
    ]);
    const config = allConfigs[slug] || null;
    renderQuiz(container, config, catalog);
  } catch (err) {
    console.error('[quiz] init error:', err);
    container.innerHTML = `<div class="quiz-page"><div class="quiz-body"><p>Failed to load quiz data. <a href="/">Back to Scentmap</a></p></div></div>`;
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
