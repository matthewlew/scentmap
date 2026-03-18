const { readFileSync } = require('fs');
const { join } = require('path');
const SCENTS = require('../data/scents-flat.json');

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

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const SITE = 'https://scentmap.co';

// Cache app.html in memory (cold start reads once)
let _appHtml;
function getAppHtml() {
  if (!_appHtml) _appHtml = readFileSync(join(process.cwd(), 'app.html'), 'utf8');
  return _appHtml;
}

module.exports = function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean);

  if (parts.length < 3 || parts[0] !== 'compare') {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const idA = parts[1], idB = parts[2];
  const fa = SCENTS[idA], fb = SCENTS[idB];

  if (!fa || !fb) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(getAppHtml());
    return;
  }

  // Canonical: alphabetical ID order
  const [canA, canB] = [idA, idB].sort();
  const canonicalUrl = `${SITE}/compare/${canA}/${canB}`;
  const ogImageUrl = `${SITE}/api/og?a=${canA}&b=${canB}`;

  const matchPct = scoreSimilarity(fa, fb);
  const shared = getSharedNotes(fa, fb);
  const sharedStr = shared.length > 0 ? shared.slice(0, 4).join(', ') : 'no shared notes';

  const titleText = `${fa.name} vs ${fb.name} — ${matchPct}% Match | Scentmap`;
  const descText = `Compare ${fa.brand} ${fa.name} and ${fb.brand} ${fb.name}. ${matchPct}% similarity${shared.length > 0 ? `, shared notes: ${sharedStr}` : ''}. Data-driven breakdown with radar chart, note analysis, and layering score.`;
  const ogTitle = `${fa.name} vs ${fb.name} — ${matchPct}% Match`;

  const title = escHtml(titleText);
  const description = escHtml(descText);
  const ogTitleEsc = escHtml(ogTitle);

  // Compute data for FAQ
  const onlyA = [...fa.top, ...fa.mid, ...fa.base].filter(n => ![...fb.top, ...fb.mid, ...fb.base].includes(n));
  const onlyB = [...fb.top, ...fb.mid, ...fb.base].filter(n => ![...fa.top, ...fa.mid, ...fa.base].includes(n));
  const sillDesc = s => s <= 3 ? 'intimate (skin scent)' : s <= 6 ? 'moderate (arm\'s length)' : 'powerful (room-filling)';
  const layerVerdict = FAM_COMPAT[fa.family]?.[fb.family] ?? 0.5;
  const layerText = layerVerdict >= 0.7 ? 'excellent' : layerVerdict >= 0.5 ? 'decent' : 'challenging';

  // JSON-LD structured data
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${fa.name} vs ${fb.name} Fragrance Comparison`,
    "description": descText,
    "url": canonicalUrl,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": 2,
      "itemListElement": [
        {
          "@type": "Product",
          "position": 1,
          "name": fa.name,
          "brand": { "@type": "Brand", "name": fa.brand },
          "category": "Eau de Parfum",
          "description": fa.description
        },
        {
          "@type": "Product",
          "position": 2,
          "name": fb.name,
          "brand": { "@type": "Brand", "name": fb.brand },
          "category": "Eau de Parfum",
          "description": fb.description
        }
      ]
    }
  });

  // FAQ JSON-LD — targets "People Also Ask" and AI citations
  const faqLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Is ${fa.name} similar to ${fb.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${fa.brand} ${fa.name} and ${fb.brand} ${fb.name} have a ${matchPct}% similarity score. ${shared.length > 0 ? `They share ${shared.length} note${shared.length > 1 ? 's' : ''}: ${shared.join(', ')}.` : 'They share no common notes.'} ${fa.name} is a ${fa.family} fragrance while ${fb.name} is ${fb.family}.`
        }
      },
      {
        "@type": "Question",
        "name": `What notes do ${fa.name} and ${fb.name} share?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": shared.length > 0
            ? `${fa.name} and ${fb.name} share ${shared.length} note${shared.length > 1 ? 's' : ''}: ${shared.join(', ')}. Notes unique to ${fa.name}: ${onlyA.slice(0, 5).join(', ') || 'none'}. Notes unique to ${fb.name}: ${onlyB.slice(0, 5).join(', ') || 'none'}.`
            : `${fa.name} and ${fb.name} share no common notes. ${fa.name} features ${fa.top.slice(0, 2).join(', ')} on top with ${fa.base.slice(0, 2).join(', ')} in the base. ${fb.name} features ${fb.top.slice(0, 2).join(', ')} on top with ${fb.base.slice(0, 2).join(', ')} in the base.`
        }
      },
      {
        "@type": "Question",
        "name": `Which is stronger, ${fa.name} or ${fb.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": fa.sillage === fb.sillage
            ? `${fa.name} and ${fb.name} have the same sillage rating of ${fa.sillage}/10 — both are ${sillDesc(fa.sillage)}.`
            : `${fa.sillage > fb.sillage ? fa.name : fb.name} projects stronger with a sillage of ${Math.max(fa.sillage, fb.sillage)}/10 (${sillDesc(Math.max(fa.sillage, fb.sillage))}), compared to ${fa.sillage < fb.sillage ? fa.name : fb.name} at ${Math.min(fa.sillage, fb.sillage)}/10 (${sillDesc(Math.min(fa.sillage, fb.sillage))}).`
        }
      },
      {
        "@type": "Question",
        "name": `Can you layer ${fa.name} with ${fb.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Layering ${fa.name} (${fa.family}) with ${fb.name} (${fb.family}) is ${layerText}. ${fa.family}–${fb.family} combinations have a ${Math.round(layerVerdict * 100)}% compatibility score. ${layerVerdict >= 0.7 ? 'These families complement each other well and create interesting contrasts.' : layerVerdict >= 0.5 ? 'This combination can work but requires careful application.' : 'These families can clash — try applying one lightly if you want to experiment.'}`
        }
      }
    ]
  });

  const noscriptSummary = `<noscript>
<article>
<h1>${escHtml(fa.name)} vs ${escHtml(fb.name)}</h1>
<p><strong>${escHtml(fa.brand)} ${escHtml(fa.name)}</strong>: ${escHtml(fa.description)}</p>
<p><strong>${escHtml(fb.brand)} ${escHtml(fb.name)}</strong>: ${escHtml(fb.description)}</p>
<h2>Similarity Score</h2>
<p>${escHtml(fa.name)} and ${escHtml(fb.name)} have a <strong>${matchPct}% match</strong>. ${shared.length > 0 ? `They share ${shared.length} note${shared.length > 1 ? 's' : ''}: ${escHtml(shared.join(', '))}.` : 'They share no common notes.'}</p>
<h2>Note Comparison</h2>
<p><strong>${escHtml(fa.name)} notes:</strong> Top: ${escHtml(fa.top.join(', '))} · Heart: ${escHtml(fa.mid.join(', '))} · Base: ${escHtml(fa.base.join(', '))}</p>
<p><strong>${escHtml(fb.name)} notes:</strong> Top: ${escHtml(fb.top.join(', '))} · Heart: ${escHtml(fb.mid.join(', '))} · Base: ${escHtml(fb.base.join(', '))}</p>
${onlyA.length > 0 ? `<p><strong>Unique to ${escHtml(fa.name)}:</strong> ${escHtml(onlyA.join(', '))}</p>` : ''}
${onlyB.length > 0 ? `<p><strong>Unique to ${escHtml(fb.name)}:</strong> ${escHtml(onlyB.join(', '))}</p>` : ''}
<h2>Projection &amp; Sillage</h2>
<p>${escHtml(fa.name)} sillage: ${fa.sillage}/10 (${sillDesc(fa.sillage)}). ${escHtml(fb.name)} sillage: ${fb.sillage}/10 (${sillDesc(fb.sillage)}).</p>
<h2>Layering Compatibility</h2>
<p>Layering ${escHtml(fa.name)} (${escHtml(fa.family)}) with ${escHtml(fb.name)} (${escHtml(fb.family)}) is ${layerText} — ${Math.round(layerVerdict * 100)}% family compatibility.</p>
<p><a href="${SITE}/app">Compare more fragrances on Scentmap</a></p>
</article>
</noscript>`;

  const metaTags = `<title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonicalUrl}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${ogTitleEsc}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:site_name" content="Scentmap">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${ogTitleEsc}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${ogImageUrl}">
    <script type="application/ld+json">${jsonLd}</script>
    <script type="application/ld+json">${faqLd}</script>`;

  let html = getAppHtml();
  // Remove existing default meta/OG tags that the compare function replaces
  html = html.replace(/<title>[^<]*<\/title>/, '');
  html = html.replace(/<meta name="description"[^>]*>/g, '');
  html = html.replace(/<link rel="canonical"[^>]*>/g, '');
  html = html.replace(/<meta property="og:[^>]*>/g, '');
  html = html.replace(/<meta name="twitter:[^>]*>/g, '');
  // Inject our compare-specific tags after <meta charset>
  html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n' + metaTags);
  html = html.replace('<body>', '<body>' + noscriptSummary);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.end(html);
};
