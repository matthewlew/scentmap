const { readFileSync } = require('fs');
const { join } = require('path');
const SCENTS = require('../data/scents-flat.json');

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

  if (parts.length < 2 || parts[0] !== 'fragrance') {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const id = parts[1];
  const frag = SCENTS[id];

  if (!frag) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(getAppHtml());
    return;
  }

  const canonicalUrl = `${SITE}/fragrance/${id}`;
  const allNotes = [...frag.top, ...frag.mid, ...frag.base];
  const noteStr = allNotes.slice(0, 5).join(', ');

  const titleText = `${frag.name} by ${frag.brand} | Scentmap`;
  const descText = `${frag.brand} ${frag.name} — a ${frag.family} fragrance. Top notes: ${frag.top.join(', ')}. Heart: ${frag.mid.join(', ')}. Base: ${frag.base.join(', ')}. ${frag.description}`;
  const ogTitle = `${frag.name} by ${frag.brand}`;

  const title = escHtml(titleText);
  const description = escHtml(descText.slice(0, 300));
  const ogTitleEsc = escHtml(ogTitle);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": frag.name,
    "brand": { "@type": "Brand", "name": frag.brand },
    "category": "Eau de Parfum",
    "description": frag.description,
    "url": canonicalUrl,
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "Family", "value": frag.family },
      { "@type": "PropertyValue", "name": "Top Notes", "value": frag.top.join(', ') },
      { "@type": "PropertyValue", "name": "Heart Notes", "value": frag.mid.join(', ') },
      { "@type": "PropertyValue", "name": "Base Notes", "value": frag.base.join(', ') },
      { "@type": "PropertyValue", "name": "Sillage", "value": `${frag.sillage}/10` },
      { "@type": "PropertyValue", "name": "Structure", "value": `${frag.layering}/10` }
    ]
  });

  const noscriptSummary = `<noscript>
<article>
<h1>${escHtml(frag.name)} by ${escHtml(frag.brand)}</h1>
<p><strong>Family:</strong> ${escHtml(frag.family)}</p>
<p>${escHtml(frag.description)}</p>
<p><strong>Top notes:</strong> ${escHtml(frag.top.join(', '))}</p>
<p><strong>Heart notes:</strong> ${escHtml(frag.mid.join(', '))}</p>
<p><strong>Base notes:</strong> ${escHtml(frag.base.join(', '))}</p>
<p><strong>Sillage:</strong> ${frag.sillage}/10 · <strong>Structure:</strong> ${frag.layering}/10</p>
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
