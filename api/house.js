const { readFileSync } = require('fs');
const { join } = require('path');
const BRANDS = require('../data/brands.json');
const SCENTS = require('../data/scents-flat.json');

// Build id→brand lookup
const BRAND_MAP = {};
BRANDS.forEach(b => { BRAND_MAP[b.id] = b; });

// Build brand→fragrances lookup
const BRAND_FRAGS = {};
for (const [id, frag] of Object.entries(SCENTS)) {
  const key = frag.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!BRAND_FRAGS[key]) BRAND_FRAGS[key] = [];
  BRAND_FRAGS[key].push({ id, ...frag });
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const SITE = 'https://scentmap.co';

let _appHtml;
function getAppHtml() {
  if (!_appHtml) _appHtml = readFileSync(join(process.cwd(), 'app.html'), 'utf8');
  return _appHtml;
}

module.exports = function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean);

  if (parts.length < 2 || parts[0] !== 'house') {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const id = parts[1];
  const brand = BRAND_MAP[id];

  if (!brand) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(getAppHtml());
    return;
  }

  const canonicalUrl = `${SITE}/house/${id}`;
  const frags = BRAND_FRAGS[id] || [];
  const fragNames = frags.slice(0, 5).map(f => f.name).join(', ');

  const titleText = `${brand.name} Fragrances | Scentmap`;
  const descText = `${brand.desc} Browse ${frags.length} ${brand.name} fragrances${frags.length > 0 ? ` including ${fragNames}` : ''}. Compare notes, sillage, and find your perfect scent.`;
  const ogTitle = `${brand.name} — Fragrance House`;

  const title = escHtml(titleText);
  const description = escHtml(descText.slice(0, 300));
  const ogTitleEsc = escHtml(ogTitle);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": brand.name,
    "description": brand.desc,
    "url": canonicalUrl,
    ...(brand.url ? { "sameAs": brand.url } : {}),
    "makesOffer": frags.slice(0, 20).map(f => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Product",
        "name": f.name,
        "url": `${SITE}/fragrance/${f.id}`,
        "category": "Eau de Parfum"
      }
    }))
  });

  // Build noscript fragrance list
  const fragList = frags.map(f =>
    `<li><a href="/fragrance/${f.id}">${escHtml(f.name)}</a> — ${escHtml(f.family)}</li>`
  ).join('\n');

  const noscriptSummary = `<noscript>
<article>
<h1>${escHtml(brand.name)}</h1>
<p>${escHtml(brand.desc)}</p>
<h2>${frags.length} Fragrances</h2>
<ul>${fragList}</ul>
</article>
</noscript>`;

  const metaTags = `<title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonicalUrl}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${ogTitleEsc}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:site_name" content="Scentmap">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${ogTitleEsc}">
    <meta name="twitter:description" content="${description}">
    <script type="application/ld+json">${jsonLd}</script>`;

  let html = getAppHtml();
  html = html.replace(/<title>[^<]*<\/title>/, '');
  html = html.replace(/<meta name="description"[^>]*>/g, '');
  html = html.replace(/<link rel="canonical"[^>]*>/g, '');
  html = html.replace(/<meta property="og:[^>]*>/g, '');
  html = html.replace(/<meta name="twitter:[^>]*>/g, '');
  html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n' + metaTags);
  html = html.replace('<body>', '<body>' + noscriptSummary);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.end(html);
};
