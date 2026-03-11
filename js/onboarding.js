// ── onboarding.js ────────────────────────────────────────────────────
// First-run onboarding flow: welcome → collection picker → taste reveal.

import { CAT, FAM } from './data.js';
import { setState, isOwned } from './state.js';
import { buildProfileData } from './renderers.js';

const OB_SEL = new Set();

export function showOnboard() {
  if (localStorage.getItem('sm_onboarded')) return;
  document.getElementById('onboard-overlay').style.display = 'flex';
  renderOnboardWelcome();
}

export function closeOnboard() {
  localStorage.setItem('sm_onboarded', '1');
  document.getElementById('onboard-overlay').style.display = 'none';
}

export function renderOnboardWelcome() {
  document.getElementById('onboard-card').innerHTML = `
    <div class="onb-title">Welcome to ScentMap</div>
    <div class="onb-sub">Your personal fragrance wardrobe. How do you want to start?</div>
    <div class="onb-paths">
      <button class="onb-path" id="ob-own">
        <span class="onb-path-icon">✓</span>
        <div><div class="onb-path-label">I own fragrances</div><div class="onb-path-desc">Add your collection and discover what it says about your taste</div></div>
      </button>
      <button class="onb-path" id="ob-discover">
        <span class="onb-path-icon">◎</span>
        <div><div class="onb-path-label">I'm just discovering</div><div class="onb-path-desc">Browse the full catalog and find something new</div></div>
      </button>
      <button class="onb-path" id="ob-learn">
        <span class="onb-path-icon">✦</span>
        <div><div class="onb-path-label">I want to learn about scents</div><div class="onb-path-desc">Explore fragrance families and the notes that define them</div></div>
      </button>
    </div>
    <button class="onb-skip-link" id="ob-skip">Skip for now</button>
  `;
  document.getElementById('ob-own').onclick     = renderOnboardCollect;
  document.getElementById('ob-discover').onclick = () => { closeOnboard(); window.go?.('catalog', null); };
  document.getElementById('ob-learn').onclick    = () => { closeOnboard(); window.go?.('notes', null); };
  document.getElementById('ob-skip').onclick     = closeOnboard;
}

function renderOnboardCollect() {
  const brands = {};
  CAT.forEach(f => { if (!brands[f.brand]) brands[f.brand] = []; brands[f.brand].push(f); });
  const brandNames = Object.keys(brands).sort();

  function refreshCTA() {
    const cnt = document.getElementById('ob-sel-count');
    const btn = document.getElementById('ob-reveal-btn');
    if (cnt) cnt.textContent = `${OB_SEL.size} selected`;
    if (btn) btn.disabled = OB_SEL.size < 1;
  }

  document.getElementById('onboard-card').innerHTML = `
    <div class="onb-title">Your collection</div>
    <div class="onb-sub">Tap the fragrances you own. You can add more later.</div>
    ${brandNames.map(b => `
      <div class="onb-brand">
        <div class="onb-brand-name">${b}</div>
        <div class="onb-frags">
          ${brands[b].map(f => `
            <div class="onb-frag${OB_SEL.has(f.id) ? ' selected' : ''}" data-id="${f.id}">
              <div class="onb-frag-dot" style="background:${FAM[f.family]?.color || '#888'}"></div>
              <div class="onb-frag-name">${f.name}</div>
              <div class="onb-frag-check">✓</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
    <div class="onb-cta">
      <button class="onb-skip-link" style="margin:0" id="ob-back">← Back</button>
      <span class="onb-count" id="ob-sel-count">${OB_SEL.size} selected</span>
      <button class="onb-btn" id="ob-reveal-btn" ${OB_SEL.size < 1 ? 'disabled' : ''}>See my taste →</button>
    </div>
  `;

  document.querySelectorAll('.onb-frag').forEach(el => {
    el.onclick = () => {
      const id = el.dataset.id;
      OB_SEL.has(id) ? OB_SEL.delete(id) : OB_SEL.add(id);
      el.classList.toggle('selected', OB_SEL.has(id));
      refreshCTA();
    };
  });
  document.getElementById('ob-back').onclick = () => { OB_SEL.clear(); renderOnboardWelcome(); };
  document.getElementById('ob-reveal-btn').onclick = () => {
    OB_SEL.forEach(id => setState(id, 'owned'));
    renderOnboardReveal();
  };
}

function renderOnboardReveal() {
  const ids = [...OB_SEL];
  const { famSorted, notesSorted } = buildProfileData(ids);
  const maxFam = famSorted[0]?.[1] || 1;
  document.getElementById('onboard-card').innerHTML = `
    <div class="onb-title">Your taste profile</div>
    <div class="onb-sub">Based on ${ids.length} fragrance${ids.length !== 1 ? 's' : ''} you own</div>
    <div class="onb-section-label">Family breakdown</div>
    <div class="onb-fam-bars">
      ${famSorted.map(([fam, cnt]) => `
        <div class="onb-fam-bar">
          <div class="onb-fam-label">${FAM[fam]?.label || fam}</div>
          <div class="onb-fam-track"><div class="onb-fam-fill" style="width:${Math.round(cnt / maxFam * 100)}%;background:${FAM[fam]?.color || '#888'}"></div></div>
          <div class="onb-fam-count">${cnt}</div>
        </div>
      `).join('')}
    </div>
    <div class="onb-section-label">Recurring notes</div>
    <div class="onb-notes-row">
      ${notesSorted.map(([note], i) => `<span class="onb-note-chip${i < 3 ? ' hi' : ''}">${note}</span>`).join('')}
    </div>
    <div class="onb-reveal-actions">
      <button class="onb-reveal-btn primary" id="ob-go-catalog">Explore similar fragrances →</button>
      <button class="onb-reveal-btn secondary" id="ob-go-roles">Set up my capsule</button>
    </div>
  `;
  document.getElementById('ob-go-catalog').onclick  = () => { closeOnboard(); window.buildCatalog?.(); window.go?.('catalog', null); };
  document.getElementById('ob-go-roles').onclick    = () => { closeOnboard(); window.autoAssignFromOwned?.(); window.buildCapsule?.(); window.buildRoles?.(); window.go?.('scentmap', null); };
}
