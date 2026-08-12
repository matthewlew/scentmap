const path = require('path');
const { renderPng } = require('./lib/og-render');

const SCENTS_ARR = require('../data/scents.json');
const SCENTS = Object.fromEntries(SCENTS_ARR.map(f => [f.id, f]));

const FAM_COMPAT = {
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

const FAM_COLORS = {
  citrus: '#9A6800', green: '#1A6030', floral: '#902050', woody: '#6E3210',
  amber: '#984000', chypre: '#285438', aquatic: '#0A4880', leather: '#42200E',
  gourmand: '#7C4C00', oud: '#4A1850',
};

const QUIZ_DISPLAY = {
  'find-your-scent': { title: 'Find Your Perfect Fragrance', questions: '5 questions' },
  'best-perfume-to-gift-2026': { title: 'Best Perfume to Gift in 2026', questions: '4 questions' },
  'best-perfume-for-men-2026': { title: 'Best Perfume for Men 2026', questions: '4 questions' },
  'best-perfume-for-women-2026': { title: 'Best Perfume for Women 2026', questions: '4 questions' },
  'find-your-byredo': { title: 'Find Your Byredo', questions: '3 questions' },
  'scent-archetype': { title: 'What\'s Your Scent Archetype?', questions: '5 questions' },
  'astro-scent': { title: 'Astro Scent Match', questions: '1 question' },
};

function scoreSimilarity(a, b) {
  const famScore = (FAM_COMPAT[a.family]?.[b.family] ?? 0.5) * 40;
  const shBase = a.base.filter(n => b.base.includes(n)).length;
  const shMid = a.mid.filter(n => b.mid.includes(n)).length;
  const shTop = a.top.filter(n => b.top.includes(n)).length;
  const noteScore = Math.min(30, shBase * 5 + shMid * 3 + shTop * 2);
  const sillDiff = Math.abs(a.sillage - b.sillage);
  const sillScore = sillDiff <= 2 ? 10 : sillDiff <= 4 ? 5 : 0;
  const shRoles = a.roles.filter(r => b.roles.includes(r)).length;
  const roleScore = Math.min(20, shRoles * 7);
  return Math.round(famScore + noteScore + sillScore + roleScore);
}

function getSharedNotes(a, b) {
  const all_a = [...a.top, ...a.mid, ...a.base];
  const all_b = [...b.top, ...b.mid, ...b.base];
  return all_a.filter(n => all_b.includes(n));
}

// Plain-object stand-in for JSX — satori accepts {type, props:{style, children}}
function el(type, style, children) {
  return { type, props: { style, children } };
}

function frame(children) {
  return el('div', {
    width: '1200px', height: '630px', display: 'flex', flexDirection: 'column',
    backgroundColor: '#F5F2EC', fontFamily: 'Noto Sans', position: 'relative',
  }, children);
}

function header(rightLabel) {
  return el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 48px 0' }, [
    el('div', { fontSize: '24px', fontWeight: 900, color: '#0E0C09', letterSpacing: '-0.02em' }, 'Scentmap'),
    el('div', { fontSize: '16px', color: '#8C8070' }, rightLabel),
  ]);
}

function bottomBar(pathLabel) {
  return el('div', { display: 'flex', justifyContent: 'center', padding: '16px 48px', borderTop: '1px solid #DDD8D0', backgroundColor: '#EDEAE4' }, [
    el('span', { fontSize: '14px', color: '#8C8070' }, pathLabel),
  ]);
}

function compareImage(fa, fb) {
  const matchPct = scoreSimilarity(fa, fb);
  const shared = getSharedNotes(fa, fb);
  const colorA = FAM_COLORS[fa.family] || '#8C5E30';
  const colorB = FAM_COLORS[fb.family] || '#8C5E30';

  const fragBlock = (frag, color) => el('div', { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }, [
    el('div', { display: 'flex', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: color, marginBottom: '12px' }, []),
    el('div', { fontSize: '36px', fontWeight: 900, color: '#0E0C09', textAlign: 'center', lineHeight: 1.1, letterSpacing: '-0.02em' }, frag.name),
    el('div', { fontSize: '18px', color: '#8C8070', marginTop: '8px' }, frag.brand),
  ]);

  const main = el('div', { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: '48px', padding: '0 48px' }, [
    fragBlock(fa, colorA),
    el('div', { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }, [
      el('div', { width: '140px', height: '140px', borderRadius: '50%', border: '4px solid #0E0C09', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, [
        el('div', { fontSize: '48px', fontWeight: 900, color: '#0E0C09', lineHeight: 1 }, `${matchPct}%`),
      ]),
      el('div', { fontSize: '14px', fontWeight: 700, color: '#8C8070', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }, 'Match'),
    ]),
    fragBlock(fb, colorB),
  ]);

  const sharedStrip = shared.length > 0
    ? el('div', { display: 'flex', justifyContent: 'center', gap: '12px', padding: '0 48px 32px', flexWrap: 'wrap' }, [
        el('span', { fontSize: '13px', color: '#8C8070', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginRight: '4px' }, 'Shared notes:'),
        ...shared.slice(0, 5).map(note => el('span', { fontSize: '14px', color: '#0E0C09', backgroundColor: '#EAE6DE', padding: '4px 12px', borderRadius: '12px' }, note)),
      ])
    : null;

  return frame([
    header('The Mathematical Fragrance Engine'),
    main,
    ...(sharedStrip ? [sharedStrip] : []),
    bottomBar(`scentmap.vercel.app/compare/${[fa.id, fb.id].sort().join('/')}`),
  ]);
}

function quizPromoImage(quizInfo, slug) {
  return frame([
    header(quizInfo.title),
    el('div', { display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 48px' }, [
      el('div', { fontSize: '56px', fontWeight: 900, color: '#0E0C09', textAlign: 'center', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '800px' }, quizInfo.title),
      el('div', { display: 'flex', alignItems: 'center', gap: '16px', marginTop: '32px' }, [
        el('div', { fontSize: '20px', color: '#8C8070' }, `${quizInfo.questions} · 180+ fragrances · Your match`),
      ]),
      el('div', { marginTop: '40px', padding: '16px 48px', backgroundColor: '#0E0C09', color: '#F5F2EC', borderRadius: '12px', fontSize: '20px', fontWeight: 700 }, 'Take the Quiz'),
    ]),
    bottomBar(`scentmap.vercel.app/quiz/${slug}`),
  ]);
}

function brandImage() {
  return frame([
    header('The Mathematical Fragrance Engine'),
    el('div', { display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 48px' }, [
      el('div', { fontSize: '64px', fontWeight: 900, color: '#0E0C09', textAlign: 'center', lineHeight: 1.1, letterSpacing: '-0.02em' }, 'Scentmap'),
      el('div', { fontSize: '22px', color: '#8C8070', marginTop: '20px', textAlign: 'center' }, 'Compare fragrances side-by-side with data-driven analysis'),
    ]),
    bottomBar('scentmap.vercel.app'),
  ]);
}

const POPULAR_COMPARISONS = [
  ['bleu-de-chanel', 'sauvage'],
  ['santal-33', 'another-13'],
  ['bal-dafrique', 'gypsy-water'],
  ['rose-31', 'tf-rose-prick'],
  ['santal-33', 'tf-santal-blush'],
];

async function main() {
  const outDir = path.join(__dirname, '..', 'og');

  await renderPng(brandImage(), path.join(outDir, 'default.png'));

  for (const [slug, quizInfo] of Object.entries(QUIZ_DISPLAY)) {
    await renderPng(quizPromoImage(quizInfo, slug), path.join(outDir, `quiz-${slug}.png`));
  }

  for (const [idA, idB] of POPULAR_COMPARISONS) {
    const fa = SCENTS[idA], fb = SCENTS[idB];
    await renderPng(compareImage(fa, fb), path.join(outDir, `compare-${idA}-${idB}.png`));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
