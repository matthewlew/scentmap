const { readFileSync } = require('fs');
const { join } = require('path');
const SCENTS = Object.fromEntries(require('../data/scents.json').map(f => [f.id, f]));

const SITE = 'https://scentmap.vercel.app';

const QUIZ_META = {
  'find-your-scent': {
    title: 'Find Your Perfect Fragrance — Quiz | Scentmap',
    description: 'Answer 5 quick questions to discover your ideal fragrance match from 180+ niche and designer perfumes. Data-driven recommendations, not marketing.',
    ogTitle: 'What Fragrance Matches Your Personality?',
    questionCount: 5,
    noscriptPopular: ['gypsy-water', 'santal-33', 'bleu-de-chanel', 'bal-dafrique', 'sauvage'],
  },
  'best-perfume-to-gift-2026': {
    title: 'Best Perfume to Gift in 2026 — Quiz | Scentmap',
    description: 'Not sure what perfume to buy as a gift? Answer 4 questions about the recipient and we\'ll recommend the perfect fragrance gift for any occasion in 2026.',
    ogTitle: 'Find the Perfect Fragrance Gift — 2026 Edition',
    questionCount: 4,
    noscriptPopular: ['gypsy-water', 'santal-33', 'bal-dafrique', 'bleu-de-chanel', 'mojave-ghost'],
  },
  'best-perfume-for-men-2026': {
    title: 'Best Perfume for Men 2026 — Quiz | Scentmap',
    description: 'Find the best men\'s fragrance for 2026. Our data-driven quiz analyzes your style, season, and occasion to recommend your perfect scent from 180+ options.',
    ogTitle: 'Best Perfume for Men 2026 — Find Your Match',
    questionCount: 4,
    noscriptPopular: ['bleu-de-chanel', 'sauvage', 'santal-33', 'gypsy-water', 'another-13'],
  },
  'best-perfume-for-women-2026': {
    title: 'Best Perfume for Women 2026 — Quiz | Scentmap',
    description: 'Discover the best women\'s perfume for 2026. Take our quick quiz and get personalized recommendations from 180+ designer and niche fragrances.',
    ogTitle: 'Best Perfume for Women 2026 — Find Your Match',
    questionCount: 4,
    noscriptPopular: ['bal-dafrique', 'blanche', 'rose-31', 'tf-rose-prick', 'mojave-ghost'],
  },
  'find-your-byredo': {
    title: 'Find Your Byredo — Quiz | Scentmap',
    description: 'Which Byredo fragrance is your match? 3 quick questions to find your signature scent from Byredo\'s full lineup.',
    ogTitle: 'Which Byredo Is Right for You?',
    questionCount: 3,
    noscriptPopular: ['gypsy-water', 'bal-dafrique', 'mojave-ghost', 'blanche', 'eleventh-hour'],
  },
};

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

let _appHtml;
function getAppHtml() {
  if (!_appHtml) _appHtml = readFileSync(join(process.cwd(), 'app.html'), 'utf8');
  return _appHtml;
}

module.exports = function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean);

  if (parts.length < 2 || parts[0] !== 'quiz') {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const slug = parts[1];
  const meta = QUIZ_META[slug];

  if (!meta) {
    // Unknown quiz slug — serve app.html as fallback
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(getAppHtml());
    return;
  }

  const canonicalUrl = `${SITE}/quiz/${slug}`;
  const ogImageUrl = `${SITE}/api/og-quiz?quiz=${slug}`;

  // Check for results query param
  const resultsParam = url.searchParams.get('results');
  let resultFrags = [];
  if (resultsParam) {
    resultFrags = resultsParam.split(',').map(id => SCENTS[id]).filter(Boolean).slice(0, 3);
  }

  let titleText, descText, ogTitleText;

  if (resultFrags.length > 0) {
    // Result-specific meta tags
    const names = resultFrags.map(f => f.name);
    const namesStr = names.length === 3 ? `${names[0]}, ${names[1]} & ${names[2]}` : names.join(' & ');
    titleText = `Your Match: ${namesStr} | Scentmap`;
    descText = `Quiz results: ${resultFrags.map(f => `${f.brand} ${f.name} (${f.family})`).join(', ')}. Take the quiz to find your perfect fragrance from 180+ options.`;
    ogTitleText = `My Fragrance Match: ${namesStr}`;
  } else {
    titleText = meta.title;
    descText = meta.description;
    ogTitleText = meta.ogTitle;
  }

  const title = escHtml(titleText);
  const description = escHtml(descText);
  const ogTitle = escHtml(ogTitleText);

  const resultOgParam = resultsParam && resultFrags.length > 0 ? `&results=${resultsParam}` : '';

  // JSON-LD structured data
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Quiz",
    "name": meta.title.replace(' | Scentmap', '').replace(' — Quiz', ''),
    "description": meta.description,
    "url": canonicalUrl,
    "provider": {
      "@type": "Organization",
      "name": "Scentmap",
      "url": SITE,
    },
    "about": {
      "@type": "Thing",
      "name": "Perfume",
    },
    "numberOfQuestions": meta.questionCount,
  });

  // Noscript content for crawlers
  const popularList = meta.noscriptPopular
    .map(id => SCENTS[id])
    .filter(Boolean)
    .map(f => `<li><strong>${escHtml(f.brand)} ${escHtml(f.name)}</strong> — ${escHtml(f.family)}. ${escHtml(f.description)}</li>`)
    .join('\n');

  const quizName = meta.title.replace(' | Scentmap', '').replace(' — Quiz', '');

  const noscriptContent = `<noscript>
<article>
<h1>${escHtml(quizName)}</h1>
<p>${escHtml(meta.description)}</p>
<h2>How It Works</h2>
<p>Answer ${meta.questionCount} quick questions about your preferences. Our algorithm analyzes your answers against a database of 180+ niche and designer fragrances, scoring each on family match, note profile, sillage, and role compatibility to find your perfect match.</p>
<h2>Popular Results</h2>
<ul>
${popularList}
</ul>
<p><a href="${SITE}/app">Explore all fragrances on Scentmap</a></p>
</article>
</noscript>`;

  const metaTags = `<title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonicalUrl}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${ogTitle}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${ogImageUrl}${resultOgParam}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:site_name" content="Scentmap">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${ogTitle}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${ogImageUrl}${resultOgParam}">
    <script type="application/ld+json">${jsonLd}</script>`;

  let html = getAppHtml();
  // Remove existing default meta/OG tags
  html = html.replace(/<title>[^<]*<\/title>/, '');
  html = html.replace(/<meta name="description"[^>]*>/g, '');
  html = html.replace(/<link rel="canonical"[^>]*>/g, '');
  html = html.replace(/<meta property="og:[^>]*>/g, '');
  html = html.replace(/<meta name="twitter:[^>]*>/g, '');
  // Inject quiz-specific tags after <meta charset>
  html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n' + metaTags);
  html = html.replace('<body>', '<body>' + noscriptContent);
  // Remove WebHaptics module (blocks DOMContentLoaded on quiz pages)
  html = html.replace(/<script type="module">[\s\S]*?<\/script>/, '');
  // Remove Supabase SDK (not needed for quiz)
  html = html.replace(/<script src="https:\/\/cdn\.jsdelivr\.net[^"]*supabase[^"]*"><\/script>/, '');
  // Swap app.js for quiz.js
  html = html.replace(/js\/app\.js\?v=[^"']+/, 'js/quiz.js?v=20260317c');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.end(html);
};
