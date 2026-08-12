#!/usr/bin/env node
/**
 * Generates public/sitemap.xml with:
 * - Landing page and app page
 * - All same-brand fragrance pairs (most searched comparison type)
 * - Curated popular comparison pairs
 *
 * Run: node scripts/build-sitemap.js
 */
const fs = require('fs');
const path = require('path');

// GitHub Pages project-page base — keep in sync with scripts/build-static.js.
const SITE = 'https://matthewlew.github.io/scentmap';
const dataDir = path.join(__dirname, '..', 'data');
const scentsArr = JSON.parse(fs.readFileSync(path.join(dataDir, 'scents.json'), 'utf8'));
const scents = Object.fromEntries(scentsArr.map(f => [f.id, f]));

const urls = new Set();

// Static pages
urls.add(SITE + '/');
urls.add(SITE + '/app.html');

// Quiz pages
const quizSlugs = [
  'find-your-scent',
  'best-perfume-to-gift-2026',
  'best-perfume-for-men-2026',
  'best-perfume-for-women-2026',
  'find-your-byredo',
  'scent-archetype',
  'astro-scent',
];
for (const slug of quizSlugs) {
  urls.add(`${SITE}/quiz/${slug}`);
}

// GitHub Pages is static-only — only the curated popular pairs are actually
// pre-rendered (see scripts/build-static.js), so only those belong here.
// (The old Vercel deploy could serve any /compare/:a/:b on demand via a
// serverless rewrite; a full same-brand-pairs sitemap would now 404.)
const POPULAR_COMPARISONS = [
  ['bleu-de-chanel', 'sauvage'],
  ['santal-33', 'another-13'],
  ['bal-dafrique', 'gypsy-water'],
  ['rose-31', 'tf-rose-prick'],
  ['santal-33', 'tf-santal-blush'],
];
for (const [idA, idB] of POPULAR_COMPARISONS) {
  const [a, b] = [idA, idB].sort();
  urls.add(`${SITE}/compare/${a}/${b}`);
}

// Individual fragrance detail pages
for (const id of Object.keys(scents)) {
  urls.add(`${SITE}/fragrance/${id}`);
}

// Build XML
const today = new Date().toISOString().split('T')[0];
let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

for (const url of urls) {
  const isHome = url === SITE + '/';
  const isQuiz = url.includes('/quiz/');
  const isApp = url === SITE + '/app';
  const isFrag = url.includes('/fragrance/');
  const priority = isHome ? '1.0' : isApp ? '0.9' : isQuiz ? '0.8' : isFrag ? '0.7' : '0.6';
  const changefreq = isHome || isApp ? 'weekly' : 'monthly';
  xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
}

xml += '</urlset>\n';

const outPath = path.join(__dirname, '..', 'sitemap.xml');
fs.writeFileSync(outPath, xml);
console.log(`Wrote ${urls.size} URLs to ${outPath}`);
