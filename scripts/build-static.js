const fs = require('fs');
const path = require('path');

const SCENTS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'scents-flat.json'), 'utf8'));

const QUIZ_META = {
  'find-your-scent': {
    title: 'Find Your Perfect Fragrance — Quiz | Scentmap',
    description: 'Answer 5 quick questions to discover your ideal fragrance match from 180+ niche and designer perfumes. Data-driven recommendations, not marketing.',
    ogTitle: 'What Fragrance Matches Your Personality?',
  },
  'best-perfume-to-gift-2026': {
    title: 'Best Perfume to Gift in 2026 — Quiz | Scentmap',
    description: 'Not sure what perfume to buy as a gift? Answer 4 questions about the recipient and we\'ll recommend the perfect fragrance gift for any occasion in 2026.',
    ogTitle: 'Find the Perfect Fragrance Gift — 2026 Edition',
  },
  'best-perfume-for-men-2026': {
    title: 'Best Perfume for Men 2026 — Quiz | Scentmap',
    description: 'Find the best men\'s fragrance for 2026. Our data-driven quiz analyzes your style, season, and occasion to recommend your perfect scent from 180+ options.',
    ogTitle: 'Best Perfume for Men 2026 — Find Your Match',
  },
  'best-perfume-for-women-2026': {
    title: 'Best Perfume for Women 2026 — Quiz | Scentmap',
    description: 'Discover the best women\'s perfume for 2026. Take our quick quiz and get personalized recommendations from 180+ designer and niche fragrances.',
    ogTitle: 'Best Perfume for Women 2026 — Find Your Match',
  },
  'find-your-byredo': {
    title: 'Find Your Byredo — Quiz | Scentmap',
    description: 'Which Byredo fragrance is your match? 3 quick questions to find your signature scent from Byredo\'s full lineup.',
    ogTitle: 'Which Byredo Is Right for You?',
  },
  'scent-archetype': {
    title: 'What\'s Your Scent Archetype? — Quiz | Scentmap',
    description: 'Discover your fragrance identity. 5 questions to uncover which of the 8 scent archetypes best describes your olfactive personality.',
    ogTitle: 'What\'s Your Scent Archetype?',
  },
  'astro-scent': {
    title: 'Astro Scent Match — Quiz | Scentmap',
    description: 'Find your signature fragrance based on your zodiac sign. 1 question to discover the scent that aligns with your astrological sun sign.',
    ogTitle: 'Find Your Astro Scent Match',
  },
};

const POPULAR_COMPARISONS = [
  ['bleu-de-chanel', 'sauvage'],
  ['santal-33', 'another-13'],
  ['bal-dafrique', 'gypsy-water'],
  ['rose-31', 'tf-rose-prick'],
  ['santal-33', 'tf-santal-blush'],
];

const appHtml = fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8');

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function buildPage(outPath, titleText, descText, ogTitleText, canonicalUrl, ogImageUrl, isQuiz = false) {
  let html = appHtml;
  const title = escHtml(titleText);
  const description = escHtml(descText);
  const ogTitle = escHtml(ogTitleText);

  const metaTags = `<title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonicalUrl}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:site_name" content="Scentmap">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${ogTitle}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${ogImageUrl}">`;

  // Remove existing default meta/OG tags
  html = html.replace(/<title>[^<]*<\/title>/, '');
  html = html.replace(/<meta name="description"[^>]*>/g, '');
  html = html.replace(/<link rel="canonical"[^>]*>/g, '');
  html = html.replace(/<meta property="og:[^>]*>/g, '');
  html = html.replace(/<meta name="twitter:[^>]*>/g, '');
  
  // Inject tags
  html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n' + metaTags);

  if (isQuiz) {
    // Remove WebHaptics and Supabase, swap app.js for quiz.js
    html = html.replace(/<script type="module">[\s\S]*?<\/script>/, '');
    html = html.replace(/<script src="https:\/\/cdn\.jsdelivr\.net[^"]*supabase[^"]*"><\/script>/, '');
    html = html.replace(/js\/app\.js\?v=[^"']+/, 'js/quiz.js?v=20260317c');
  }

  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, html);
  console.log(`Wrote ${outPath}`);
}

// 1. /app/index.html
buildPage(
  path.join(__dirname, '..', 'app', 'index.html'),
  'Scentmap — Compare Fragrances',
  'Compare fragrances side-by-side with data-driven analysis. See similarity scores, shared notes, radar charts, and layering compatibility.',
  'Scentmap — Compare Fragrances',
  'https://scentmap.co/app',
  'https://scentmap.co/api/og'
);

// 2. Quiz pages
for (const [slug, meta] of Object.entries(QUIZ_META)) {
  buildPage(
    path.join(__dirname, '..', 'quiz', slug, 'index.html'),
    meta.title,
    meta.description,
    meta.ogTitle,
    `https://scentmap.co/quiz/${slug}`,
    `https://scentmap.co/api/og-quiz?quiz=${slug}`,
    true
  );
}

// 3. Popular comparisons
for (const [idA, idB] of POPULAR_COMPARISONS) {
  const fa = SCENTS[idA], fb = SCENTS[idB];
  const titleText = `${fa.name} vs ${fb.name} | Scentmap`;
  const descText = `Compare ${fa.brand} ${fa.name} and ${fb.brand} ${fb.name}. Data-driven breakdown with radar chart and note analysis.`;
  buildPage(
    path.join(__dirname, '..', 'compare', idA, idB, 'index.html'),
    titleText,
    descText,
    titleText,
    `https://scentmap.co/compare/${idA}/${idB}`,
    `https://scentmap.co/api/og?a=${idA}&b=${idB}`
  );
}
