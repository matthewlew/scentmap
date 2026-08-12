const SCENTS_ARR = require('../../data/scents.json');
const SCENTS = Object.fromEntries(SCENTS_ARR.map(f => [f.id, f]));
const ROLES_DATA = require('../../data/roles.json');

const ROLE_MAP = {};
ROLES_DATA.forEach(r => { ROLE_MAP[r.id] = r; });

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

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const ALL_FRAGS = Object.entries(SCENTS);

const FAM_LABELS = {
  woody:'Woody',floral:'Floral',amber:'Amber',citrus:'Citrus',
  leather:'Leather',oud:'Oud',green:'Green',chypre:'Chypre',gourmand:'Gourmand',
  aquatic:'Aquatic'
};

const SILL_DESC = s => s <= 3 ? 'intimate (skin scent)' : s <= 6 ? 'moderate (arm\'s length)' : 'powerful (room-filling)';

// Builds the SEO payload (title/description/JSON-LD/noscript) for one fragrance,
// mirroring the logic that used to live in the Vercel serverless api/fragrance.js.
function buildFragranceSEO(id, SITE) {
  const frag = SCENTS[id];
  if (!frag) return null;

  const canonicalUrl = `${SITE}/fragrance/${id}`;
  const famLabel = FAM_LABELS[frag.family] || frag.family;
  const allNotes = [...frag.top, ...frag.mid, ...frag.base];

  const similar = ALL_FRAGS
    .filter(([k]) => k !== id)
    .map(([, f]) => ({ f, score: scoreSimilarity(frag, f) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const roleLabels = frag.roles.map(r => ROLE_MAP[r]?.name || r).join(', ');

  const titleText = `${frag.name} by ${frag.brand} — ${famLabel} | Scentmap`;
  const descText = `${frag.brand} ${frag.name}: ${famLabel.toLowerCase()} fragrance with ${frag.top.slice(0, 2).join(', ')} opening into ${frag.base.slice(0, 2).join(', ')}. Sillage ${frag.sillage}/10. ${similar.length > 0 ? `Similar to ${similar[0].f.name}.` : ''} See notes, sensory profile, and gift ideas.`;

  const title = escHtml(titleText);
  const description = escHtml(descText);
  const ogTitle = escHtml(`${frag.name} by ${frag.brand} — ${famLabel} Fragrance`);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": frag.name,
    "brand": { "@type": "Brand", "name": frag.brand },
    "category": "Eau de Parfum",
    "description": frag.description,
    "url": canonicalUrl,
    "keywords": allNotes.join(', '),
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "Family", "value": famLabel },
      { "@type": "PropertyValue", "name": "Sillage", "value": `${frag.sillage}/10` },
      { "@type": "PropertyValue", "name": "Top Notes", "value": frag.top.join(', ') },
      { "@type": "PropertyValue", "name": "Heart Notes", "value": frag.mid.join(', ') },
      { "@type": "PropertyValue", "name": "Base Notes", "value": frag.base.join(', ') },
    ]
  });

  const faqLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What does ${frag.name} smell like?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${frag.brand} ${frag.name} is a ${famLabel.toLowerCase()} fragrance. It opens with ${frag.top.join(', ')}, develops into ${frag.mid.join(', ')} at the heart, and settles on ${frag.base.join(', ')} in the base. Sillage is ${frag.sillage}/10 — ${SILL_DESC(frag.sillage)}.${frag.description ? ' ' + frag.description : ''}`
        }
      },
      {
        "@type": "Question",
        "name": `What fragrances are similar to ${frag.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": similar.length > 0
            ? `The top 5 fragrances similar to ${frag.name}: ${similar.map(s => `${s.f.brand} ${s.f.name} (${s.score}% match)`).join(', ')}.`
            : `${frag.name} has a unique profile. Browse the Scentmap catalog to explore fragrances with similar notes.`
        }
      },
      {
        "@type": "Question",
        "name": `Is ${frag.name} a good gift?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${frag.name} works well as a gift for someone who appreciates ${famLabel.toLowerCase()} fragrances${roleLabels ? ` — it fits the ${roleLabels.toLowerCase()} role${frag.roles.length > 1 ? 's' : ''}` : ''}. Sillage is ${SILL_DESC(frag.sillage)}, so ${frag.sillage <= 3 ? 'it\'s a personal, close-wear scent — ideal for someone who prefers understated fragrance' : frag.sillage <= 6 ? 'it\'s noticeable without being overpowering — a safe gift for most people' : 'it projects strongly — best for someone who loves bold fragrance'}.${similar.length > 0 ? ` If they already own ${frag.name}, consider ${similar[0].f.brand} ${similar[0].f.name} (${similar[0].score}% match) as an alternative.` : ''}`
        }
      },
      {
        "@type": "Question",
        "name": `What to get someone who loves ${frag.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": similar.length >= 3
            ? `If someone loves ${frag.name}, they\'ll likely enjoy: ${similar.slice(0, 3).map(s => `${s.f.brand} ${s.f.name} (${s.score}% similar)`).join(', ')}. All share ${famLabel.toLowerCase()} qualities${similar[0].f.family !== frag.family ? ` with some variety across families` : ''}. Use Scentmap\'s Gift Intelligence quiz for a personalized recommendation.`
            : `Someone who loves ${frag.name} appreciates ${famLabel.toLowerCase()} fragrances. Try Scentmap\'s Gift Intelligence quiz for personalized gift recommendations from 213 curated fragrances.`
        }
      }
    ]
  });

  const similarHtml = similar.length > 0
    ? `<h2>Similar Fragrances</h2>
<ul>
${similar.map(s => `<li><strong>${escHtml(s.f.brand)} ${escHtml(s.f.name)}</strong> — ${escHtml(FAM_LABELS[s.f.family] || s.f.family)}, ${s.score}% match</li>`).join('\n')}
</ul>`
    : '';

  const noscriptContent = `<noscript>
<article>
<h1>${escHtml(frag.name)} by ${escHtml(frag.brand)}</h1>
<p>${escHtml(famLabel)} fragrance${roleLabels ? ` · ${escHtml(roleLabels)}` : ''}</p>
${frag.description ? `<p>${escHtml(frag.description)}</p>` : ''}
<h2>Notes</h2>
<p><strong>Top:</strong> ${escHtml(frag.top.join(', '))}</p>
<p><strong>Heart:</strong> ${escHtml(frag.mid.join(', '))}</p>
<p><strong>Base:</strong> ${escHtml(frag.base.join(', '))}</p>
<h2>Projection</h2>
<p>Sillage: ${frag.sillage}/10 (${SILL_DESC(frag.sillage)}). Structure: ${frag.layering}/10.</p>
${similarHtml}
<h2>Gift This Fragrance</h2>
<p>Know someone who loves ${escHtml(famLabel.toLowerCase())} scents? ${escHtml(frag.name)} ${frag.sillage <= 3 ? 'is a personal, intimate wear' : frag.sillage <= 6 ? 'strikes the right balance for everyday' : 'makes a bold statement'}. <a href="${SITE}/quiz/gift-intelligence">Take the Gift Intelligence quiz</a> for a personalized recommendation.</p>
<p><a href="${SITE}/app">Explore all fragrances on Scentmap</a></p>
</article>
</noscript>`;

  return { titleText, descText, ogTitle: `${frag.name} by ${frag.brand} — ${famLabel} Fragrance`, canonicalUrl, jsonLd, faqLd, noscriptContent };
}

module.exports = { buildFragranceSEO, SCENTS, SCENTS_ARR };
