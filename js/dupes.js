/* ── dupes.js — Fragrance Ladder (Wirecutter layout)
   Standalone vanilla ES module. No imports from app.js or engine.js.
   Similarity scores are pre-computed in the JSON data.

   Score formula (engine.js scoreSimilarity):
     famScore = FAM_COMPAT[a.family][b.family] * 40
     noteScore = min(30, sharedBase*5 + sharedMid*3 + sharedTop*2)
     roleScore = min(20, sharedRoles * 7)
── */

/* ── Utilities ── */
function pricePerOz(price, size_ml) {
  return Math.round((price / size_ml) * 29.574);
}

function normNotes(arr) {
  return (arr || []).map(n => n.trim().toLowerCase());
}

const cap = n => n.charAt(0).toUpperCase() + n.slice(1);

/* ── Note layer strip (right panel) ── */
function renderNoteLayer(label, notes) {
  if (!notes.length) return '';
  return `<div style="display:flex;flex-direction:column;gap:var(--sp-xs)" data-layer="${label.toLowerCase()}">
    <div class="sec-label">${label}</div>
    <div style="display:flex;flex-wrap:wrap;gap:var(--sp-xs)">
      ${notes.map(n => `<span class="tag" data-note="${n}">${cap(n)}</span>`).join('')}
    </div>
  </div>`;
}

/* ── Notes panel (right column, sticky) ── */
function renderNotesPanel(anchor, sortedDupes) {
  const anchorShort = anchor.name.split(' ').slice(0, 2).join(' ');
  const tabs = [
    { id: 'anchor', label: anchorShort },
    ...sortedDupes.map(d => ({ id: d.id, label: d.brand }))
  ];

  return `<div class="dupes-notes-col">
    <div style="display:flex;flex-direction:column;gap:var(--sp-md)">
      <div class="sec-label">Notes</div>
      <div class="tabs" id="notes-tabs">
        ${tabs.map((t, i) => `<button class="tab${i === 0 ? ' active' : ''}" data-frag-id="${t.id}" aria-pressed="${i === 0 ? 'true' : 'false'}">${t.label}</button>`).join('')}
      </div>
    </div>
    <div id="notes-pills" style="display:flex;flex-direction:column;gap:var(--sp-lg)">
      ${renderNoteLayer('Top',   normNotes(anchor.top))}
      ${renderNoteLayer('Heart', normNotes(anchor.mid))}
      ${renderNoteLayer('Base',  normNotes(anchor.base))}
    </div>
  </div>`;
}

/* ── Anchor hero ── */
function renderAnchorHero(anchor) {
  const ppoz = pricePerOz(anchor.price, anchor.size_ml);
  return `<section class="dupes-hero" data-frag-target="anchor">
    <div class="sec-label dupes-family-color" data-family="${anchor.family}">The Original</div>
    <h1 class="text-heading">${anchor.name}</h1>
    <div class="list-item-sublabel dupes-family-color" data-family="${anchor.family}">${anchor.brand}&thinsp;&middot;&thinsp;$${anchor.price} / ${anchor.size_ml}ml&thinsp;&middot;&thinsp;$${ppoz}/oz</div>
    <p class="description">${anchor.description}</p>
  </section>`;
}

/* ── Summary picks list (Wirecutter "at a glance") ── */
function renderSummaryList(sortedDupes) {
  const rows = sortedDupes.map((d, i) => `
    <a class="list-item" href="#dupe-${d.id}" style="text-decoration:none">
      <div class="list-item-leading">
        <div class="list-item-icon">${i + 1}</div>
      </div>
      <div class="list-item-body">
        <div class="list-item-label">${d.name}</div>
        <div class="list-item-sublabel">${d.brand}&thinsp;&middot;&thinsp;$${d.price}</div>
      </div>
      <div class="list-item-trail">
        <span class="list-item-trailing-label">${d.similarity_score}%</span>
      </div>
    </a>`).join('');

  return `<div style="display:flex;flex-direction:column;gap:var(--sp-md)">
    <div class="sec-label">Our picks at a glance</div>
    ${rows}
  </div>`;
}

/* ── Individual fragrance section (spacing only — no card) ── */
function renderArticleSection(anchor, dupe, index) {
  const ppoz        = pricePerOz(dupe.price, dupe.size_ml);
  const anchorPpoz  = pricePerOz(anchor.price, anchor.size_ml);
  const savingsPerOz = anchorPpoz - ppoz;

  const savingsEl = savingsPerOz > 0
    ? `&thinsp;&middot;&thinsp;<span class="list-item-trailing-label">Save $${savingsPerOz}/oz</span>`
    : '';

  const buyEl = dupe.buy_url
    ? `<a class="gap-cta" href="${dupe.buy_url}" target="_blank" rel="noopener noreferrer">Buy &middot; $${dupe.price}</a>`
    : `<span class="list-item-detail">Link coming soon</span>`;

  return `<section class="dupes-frag-section" id="dupe-${dupe.id}" data-frag-target="${dupe.id}">
    <div class="dupes-frag-header">
      <div style="display:flex;flex-direction:column;gap:var(--sp-xs)">
        <div class="text-title">${index + 1}&ensp;&mdash;&ensp;${dupe.name}</div>
        <div class="list-item-sublabel dupes-family-color" data-family="${dupe.family}">${dupe.brand}&thinsp;&middot;&thinsp;$${dupe.price} / ${dupe.size_ml}ml&thinsp;&middot;&thinsp;$${ppoz}/oz${savingsEl}</div>
      </div>
      <span class="list-item-trailing-label">${dupe.similarity_score}%</span>
    </div>
    <p class="description">${dupe.similarity_notes}</p>
    ${buyEl}
  </section>`;
}

/* ── Full page render ── */
function renderPage(data) {
  const { anchor, dupes } = data;
  const sorted = [...dupes].sort((a, b) => b.similarity_score - a.similarity_score);

  const sections = sorted
    .map((d, i) => renderArticleSection(anchor, d, i))
    .join('');

  return `<div class="dupes-container">
    ${renderAnchorHero(anchor)}
    <div class="dupes-article-layout">
      <div class="dupes-article-col">
        ${renderSummaryList(sorted)}
        <div class="dupes-list">
          ${sections}
        </div>
        <div class="dupes-cta">
          <div class="text-ui">Discovered your fragrance world?</div>
          <p class="description">Explore 213 prestige fragrances — mapped by how they smell, not how they're marketed.</p>
          <a class="gap-cta" href="https://scentmap.co">Open Scentmap &rarr;</a>
        </div>
      </div>
      ${renderNotesPanel(anchor, sorted)}
    </div>
  </div>`;
}

/* ── Interactivity: tab switch + scroll-linked ── */
function initInteractivity(anchor, dupes) {
  const tabsEl = document.getElementById('notes-tabs');
  if (!tabsEl) return;

  /* Pre-build note lookup — avoids recomputing on every tab click */
  const fragNotes = {
    anchor: {
      top:  normNotes(anchor.top),
      mid:  normNotes(anchor.mid),
      base: normNotes(anchor.base)
    }
  };
  dupes.forEach(d => {
    fragNotes[d.id] = {
      top:  normNotes(d.top),
      mid:  normNotes(d.mid),
      base: normNotes(d.base)
    };
  });

  /* data-layer value → frag note key */
  const layerKey = { top: 'top', heart: 'mid', base: 'base' };

  function setActiveTab(fragId) {
    /* 1. Update tab aria + active class */
    tabsEl.querySelectorAll('.tab').forEach(tab => {
      const on = tab.dataset.fragId === fragId;
      tab.classList.toggle('active', on);
      tab.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    /* 2. Update note pill disabled state */
    const frag = fragNotes[fragId];
    if (!frag) return;

    document.querySelectorAll('#notes-pills .tag').forEach(pill => {
      const note    = pill.dataset.note;
      const layerEl = pill.closest('[data-layer]');
      if (!layerEl) return;
      const key     = layerKey[layerEl.dataset.layer];
      const present = key ? frag[key].includes(note) : true;
      pill.setAttribute('aria-disabled', present ? 'false' : 'true');
    });
  }

  /* Tab click */
  tabsEl.addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    setActiveTab(tab.dataset.fragId);
  });

  /* Scroll-linked: switch tab as sections enter the upper viewport zone */
  const targets = document.querySelectorAll('[data-frag-target]');
  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    /* Take the topmost element that just became visible */
    const entering = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (entering.length) {
      setActiveTab(entering[0].target.dataset.fragTarget);
    }
  }, {
    /* Trigger zone: the band from 15% to 40% from the top of the viewport */
    rootMargin: '-15% 0px -60% 0px',
    threshold: 0
  });

  targets.forEach(el => observer.observe(el));
}

/* ── Init ── */
async function init() {
  const main = document.getElementById('dupes-main');
  if (!main) return;

  try {
    const res = await fetch('/data/dupes/santal-33.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    main.innerHTML = renderPage(data);
    initInteractivity(data.anchor, data.dupes);
  } catch (_) {
    main.innerHTML = '<div class="dupes-error">Couldn\'t load dupe data. Try refreshing.</div>';
  }
}

init();
