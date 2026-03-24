/**
 * Scentmap Homepage Search
 * Provides the dropdown search functionality for the landing page.
 */

let CAT = [], NI = [], BRANDS = [], CAT_MAP = {};
let searchIdx = -1;
let currentWrap = null;

async function initHomeSearch() {
  const homeInput = document.querySelector('input[name="q"]');
  const navInput = document.querySelector('.nav-search-input');
  
  const resultsWrap = document.createElement('div');
  resultsWrap.id = 'home-search-results';
  resultsWrap.className = 'us-results-container'; 
  resultsWrap.hidden = true;
  
  // Create a second results wrap for nav if needed, or just one that moves
  const navResultsWrap = resultsWrap.cloneNode(true);
  navResultsWrap.id = 'nav-search-results';

  if (homeInput) {
    homeInput.closest('form').style.position = 'relative';
    homeInput.closest('form').appendChild(resultsWrap);
    setupInput(homeInput, resultsWrap);
  }

  if (navInput) {
    const bar = navInput.closest('.nav-search-bar');
    if (bar) {
      bar.style.position = 'absolute'; // Ensure relative/absolute for dropdown
      bar.appendChild(navResultsWrap);
      setupInput(navInput, navResultsWrap);
    }
  }

  // Load data
  try {
    const [scents, notes, houses] = await Promise.all([
      fetch('/data/scents-flat.json').then(r => r.json()),
      fetch('/data/notes.json').then(r => r.json()),
      fetch('/data/brands.json').then(r => r.json())
    ]);
    CAT = scents;
    NI = notes;
    BRANDS = houses;
    CAT.forEach(f => {
      CAT_MAP[f.id] = f;
      f._nameN = f.name.toLowerCase();
      f._brandN = f.brand.toLowerCase();
      f._nAllN = (f.notes_all || []).map(n => n.toLowerCase());
    });
  } catch(e) { console.error('Failed to load search data', e); }
}

function setupInput(input, wrap) {
  input.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (q.length < 1) {
      wrap.hidden = true;
      return;
    }
    currentWrap = wrap;
    renderResults(q, wrap);
  });

  input.addEventListener('keydown', (e) => {
    const items = wrap.querySelectorAll('.list-item--search');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      searchIdx = Math.min(searchIdx + 1, items.length - 1);
      highlightItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      searchIdx = Math.max(searchIdx - 1, 0);
      highlightItem(items);
    } else if (e.key === 'Enter' && searchIdx >= 0) {
      e.preventDefault();
      items[searchIdx].click();
    } else if (e.key === 'Escape') {
      wrap.hidden = true;
    }
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !wrap.contains(e.target)) {
      wrap.hidden = true;
    }
  });
}

function renderResults(q, wrap) {
  const normQStr = q.toLowerCase();
  const fragMatches = CAT.filter(f => matchFrag(f, normQStr)).slice(0, 12);
  const noteMatches = (NI || []).filter(n => 
    n.name.toLowerCase().includes(normQStr)
  ).slice(0, 5);
  const brandMatches = (BRANDS || []).filter(b => 
    b.name.toLowerCase().includes(normQStr)
  ).slice(0, 3);
  
  if (!fragMatches.length && !noteMatches.length && !brandMatches.length) {
    wrap.innerHTML = `<div class="us-empty">No results for "${q}"</div>`;
    wrap.hidden = false;
    return;
  }

  let html = '';
  let rowIdx = 0;

  const highlight = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="note-match">$1</mark>');
  };

  if (fragMatches.length) {
    html += `<div class="us-section-hdr">Fragrances</div>`;
    html += fragMatches.map(f => `
      <button class="list-item list-item--search" data-row-idx="${rowIdx++}" onclick="window.location.href='/app.html#frag=${f.id}'">
        <span class="list-item-dot" style="--fam-bg: var(--fam-${f.family.toLowerCase().replace(/\s/g, '-')})"></span>
        <span class="list-item-body">
          <span class="list-item-label">${highlight(f.name, q)}</span>
          <span class="list-item-sublabel">${highlight(f.brand, q)}</span>
        </span>
      </button>
    `).join('');
  }

  if (noteMatches.length) {
    html += `<div class="us-section-hdr">Notes</div>`;
    html += noteMatches.map(n => `
      <button class="list-item list-item--search" data-row-idx="${rowIdx++}" onclick="window.location.href='/app.html#notes?q=${encodeURIComponent(n.name)}'">
        <span class="list-item-icon">🌿</span>
        <span class="list-item-body">
          <span class="list-item-label">${highlight(n.name, q)}</span>
        </span>
      </button>
    `).join('');
  }

  if (brandMatches.length) {
    html += `<div class="us-section-hdr">Houses</div>`;
    html += brandMatches.map(b => `
      <button class="list-item list-item--search" data-row-idx="${rowIdx++}" onclick="window.location.href='/app.html#catalog?brand=${encodeURIComponent(b.name)}'">
        <span class="list-item-icon">🏛</span>
        <span class="list-item-body">
          <span class="list-item-label">${highlight(b.name, q)}</span>
        </span>
      </button>
    `).join('');
  }

  wrap.innerHTML = html;
  wrap.hidden = false;
  searchIdx = 0; 
  highlightItem(wrap.querySelectorAll('.list-item--search'));
}

function highlightItem(items) {
  items.forEach((item, i) => {
    const isSelected = i === searchIdx;
    item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    // Ensure the CSS handles [aria-selected="true"]
  });
}

function matchFrag(f, q) {
  return f._nameN.includes(q) || f._brandN.includes(q) || f._nAllN.some(n => n.includes(q));
}

document.addEventListener('DOMContentLoaded', initHomeSearch);
