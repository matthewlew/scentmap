const { readFileSync } = require('fs');
const { join } = require('path');
const NOTES = require('../data/notes.json');
const SCENTS = require('../data/scents-flat.json');

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Build slug→note lookup
const NOTE_MAP = {};
NOTES.forEach(n => { NOTE_MAP[slugify(n.name)] = n; });

// Build note→fragrances lookup (lowercase note name → array of {id, name, brand, tier})
const NOTE_FRAGS = {};
for (const [id, frag] of Object.entries(SCENTS)) {
  const addNote = (noteName, tier) => {
    const key = noteName.toLowerCase();
    if (!NOTE_FRAGS[key]) NOTE_FRAGS[key] = [];
    NOTE_FRAGS[key].push({ id, name: frag.name, brand: frag.brand, tier });
  };
  (frag.top || []).forEach(n => addNote(n, 'top'));
  (frag.mid || []).forEach(n => addNote(n, 'heart'));
  (frag.base || []).forEach(n => addNote(n, 'base'));
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

  if (parts.length < 2 || parts[0] !== 'note') {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const slug = parts[1];
  const note = NOTE_MAP[slug];

  if (!note) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(getAppHtml());
    return;
  }

  const canonicalUrl = `${SITE}/note/${slug}`;
  const frags = NOTE_FRAGS[note.name.toLowerCase()] || [];

  const titleText = `${note.name} — Fragrance Note | Scentmap`;
  const fragNames = frags.slice(0, 5).map(f => f.name).join(', ');
  const descText = `${note.name} is a ${note.family} note. ${note.desc}${frags.length > 0 ? ` Found in ${frags.length} fragrances including ${fragNames}.` : ''}`;
  const ogTitle = `${note.name} — ${note.family} Note`;

  const title = escHtml(titleText);
  const description = escHtml(descText.slice(0, 300));
  const ogTitleEsc = escHtml(ogTitle);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": note.name,
    "description": note.desc,
    "url": canonicalUrl,
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Fragrance Notes",
      "url": `${SITE}/app#notes`
    }
  });

  // Build noscript fragrance list
  const fragList = frags.map(f =>
    `<li><a href="/fragrance/${f.id}">${escHtml(f.name)}</a> by ${escHtml(f.brand)} (${f.tier})</li>`
  ).join('\n');

  const noscriptSummary = `<noscript>
<article>
<h1>${escHtml(note.name)}</h1>
<p><strong>Family:</strong> ${escHtml(note.family)}</p>
<p>${escHtml(note.desc)}</p>
${note.extraction_method ? `<p><strong>Extraction:</strong> ${escHtml(note.extraction_method)}</p>` : ''}
${note.insider_fact ? `<p><strong>Perfumer's Insight:</strong> ${escHtml(note.insider_fact)}</p>` : ''}
${frags.length > 0 ? `<h2>Found in ${frags.length} fragrances</h2><ul>${fragList}</ul>` : ''}
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
