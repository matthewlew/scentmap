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

const SITE = 'https://scentmap.co';
const dataDir = path.join(__dirname, '..', 'data');
const scents = JSON.parse(fs.readFileSync(path.join(dataDir, 'scents-flat.json'), 'utf8'));
const popular = JSON.parse(fs.readFileSync(path.join(dataDir, 'popular-comparisons.json'), 'utf8'));

const urls = new Set();

// Static pages
urls.add(SITE + '/');

// Popular curated pairs
for (const p of popular) {
  const [a, b] = [p.a, p.b].sort();
  urls.add(`${SITE}/compare/${a}/${b}`);
}

// Same-brand pairs (highest search volume — "X vs Y same brand")
const byBrand = {};
for (const [id, s] of Object.entries(scents)) {
  if (!byBrand[s.brand]) byBrand[s.brand] = [];
  byBrand[s.brand].push(id);
}
for (const ids of Object.values(byBrand)) {
  ids.sort();
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      urls.add(`${SITE}/compare/${ids[i]}/${ids[j]}`);
    }
  }
}

// Build XML
const today = new Date().toISOString().split('T')[0];
let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

for (const url of urls) {
  const priority = url === SITE + '/' ? '1.0' : '0.6';
  const changefreq = url === SITE + '/' ? 'weekly' : 'monthly';
  xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
}

xml += '</urlset>\n';

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outPath, xml);
console.log(`Wrote ${urls.size} URLs to ${outPath}`);
