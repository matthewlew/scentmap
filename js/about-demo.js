/*
 * Interactive Demo Logic for about.html
 */

// We re-implement a minimal version of the getVerdict function to show live results.
// The actual logic is identical to js/app.js:getVerdict.

const FAM = {
  woody: { label: 'Woody', color: '#6E3210' },
  floral: { label: 'Floral', color: '#902050' },
  citrus: { label: 'Citrus', color: '#9A6800' },
  amber: { label: 'Amber', color: '#984000' }
};

function getVerdict(matchPct, layerPct, fa, fb) {
  const shortA = fa.name.split(' ')[0], shortB = fb.name.split(' ')[0];
  const sameFam = fa.family === fb.family;
  const famLabel = (FAM[fa.family] || {label: fa.family}).label;

  if (matchPct >= 70 && layerPct >= 65) return `${shortA} and ${shortB} are genuinely kindred spirits — they share DNA at the note level and project beautifully together.`;
  if (matchPct >= 70) return `${shortA} and ${shortB} smell remarkably alike. Better as alternates than a layering pair — their overlap is too high for interesting contrast.`;
  if (layerPct >= 65 && matchPct < 50) {
    if (sameFam) return `${shortA} and ${shortB} share a ${famLabel} character but diverge enough in their notes to layer with real depth.`;
    return `${shortA} and ${shortB} pair well. Their contrast in character and sillage creates depth without competing.`;
  }
  if (matchPct >= 50 && layerPct >= 50) return `A solid pairing. ${shortA} and ${shortB} share enough character to feel cohesive, with enough contrast to layer interestingly.`;
  if (matchPct < 35 && layerPct < 35) {
    if (sameFam) return `${shortA} and ${shortB} share a ${famLabel} family but express it very differently — they may feel like distant cousins rather than a natural pair.`;
    return `${shortA} and ${shortB} are quite different — they may feel unrelated or clash if layered.`;
  }
  if (matchPct >= 50) return `${shortA} and ${shortB} share similar character and work well as alternates. They won't layer in unexpected ways but feel consistent.`;
  if (sameFam) return `${shortA} and ${shortB} sit within the same ${famLabel} family but express it differently — interesting to compare, not obvious to layer.`;
  return `${shortA} and ${shortB} are distinct enough to explore separately. Treat them as contrasts rather than complements.`;
}

// UI State
let state = {
  matchPct: 50,
  layerPct: 50,
  sameFamily: false
};

function renderDemo() {
  const root = document.getElementById('demo-root');
  if (!root) return;

  const fa = { name: "Fragrance A", family: "woody" };
  const fb = { name: "Fragrance B", family: state.sameFamily ? "woody" : "floral" };

  const verdictText = getVerdict(state.matchPct, state.layerPct, fa, fb);

  // Helper for color coding the scores
  const getMatchColor = (pct) => pct >= 60 ? 'var(--blue)' : pct >= 30 ? 'var(--g700)' : 'var(--g500)';
  const getLayerColor = (pct) => pct >= 60 ? 'var(--green)' : pct >= 30 ? 'var(--g700)' : 'var(--g500)';

  root.innerHTML = `
    <style>
      .demo-wrap {
        background: #fff;
        border: 1px solid var(--g200);
        border-radius: 12px;
        padding: 24px;
        margin-top: 24px;
        font-family: var(--font-base);
      }
      .demo-controls {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 32px;
      }
      .demo-control-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .demo-label {
        font-weight: 600;
        font-size: .9rem;
        color: var(--black);
        display: flex;
        justify-content: space-between;
      }
      input[type=range] {
        width: 100%;
        accent-color: var(--black);
      }
      .demo-toggle-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: .9rem;
        font-weight: 500;
        margin-top: 8px;
        color: var(--black);
      }
      .demo-toggle {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
        background-color: var(--g300);
        border-radius: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .demo-toggle.active {
        background-color: var(--black);
      }
      .demo-toggle-knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background-color: #fff;
        border-radius: 50%;
        transition: transform 0.2s;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }
      .demo-toggle.active .demo-toggle-knob {
        transform: translateX(20px);
      }
      .demo-result-card {
        background: var(--bg-body);
        border: 1px solid var(--g200);
        border-radius: 8px;
        padding: 20px;
      }
      .demo-result-title {
        font-family: var(--font-display);
        font-size: 1.1rem;
        margin-bottom: 12px;
        color: var(--g600);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .demo-verdict {
        font-size: 1.15rem;
        line-height: 1.5;
        font-weight: 500;
        color: var(--black);
      }
      .demo-explanation {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--g200);
        font-size: .9rem;
        color: var(--g600);
      }
    </style>

    <div class="demo-wrap">
      <div class="demo-controls">
        <div class="demo-control-group">
          <label class="demo-label">
            Similarity (Match)
            <span style="color:${getMatchColor(state.matchPct)}; font-weight:700">${state.matchPct}%</span>
          </label>
          <input type="range" id="match-slider" min="0" max="100" value="${state.matchPct}">
          <div style="display:flex; justify-content:space-between; font-size:.7rem; color:var(--g500);">
            <span>0% (Clashing)</span>
            <span>100% (Identical)</span>
          </div>
        </div>

        <div class="demo-control-group">
          <label class="demo-label">
            Layering Compatibility
            <span style="color:${getLayerColor(state.layerPct)}; font-weight:700">${state.layerPct}%</span>
          </label>
          <input type="range" id="layer-slider" min="0" max="100" value="${state.layerPct}">
          <div style="display:flex; justify-content:space-between; font-size:.7rem; color:var(--g500);">
            <span>0% (Muddy/Bad)</span>
            <span>100% (Perfect Pair)</span>
          </div>
        </div>

        <div class="demo-toggle-wrap">
          <div id="fam-toggle" class="demo-toggle ${state.sameFamily ? 'active' : ''}">
            <div class="demo-toggle-knob"></div>
          </div>
          <span>Both fragrances belong to the same olfactive family (e.g., Woody)</span>
        </div>
      </div>

      <div class="demo-result-card">
        <div class="demo-result-title">System Verdict</div>
        <div class="demo-verdict">"${verdictText}"</div>
        <div class="demo-explanation">
          <strong>Why this verdict?</strong>
          ${state.matchPct >= 70 ? 'High similarity means these share heavy DNA overlap.' : state.matchPct < 35 ? 'Low similarity means these scents have almost nothing in common.' : 'Moderate similarity means they share some character but remain distinct.'}
          ${state.layerPct >= 65 ? 'High layering means their sillage and distinct notes complement each other beautifully.' : state.layerPct < 35 ? 'Low layering means they will likely fight for dominance or muddy each other.' : 'Moderate layering means they are a safe, if unremarkable, pair.'}
          ${state.sameFamily ? 'Because they are in the same family, their underlying structure provides a built-in baseline of cohesion.' : 'Coming from different families means they rely entirely on structural contrast to succeed.'}
        </div>
      </div>
    </div>
  `;

  // Attach Listeners
  document.getElementById('match-slider').addEventListener('input', (e) => {
    state.matchPct = parseInt(e.target.value, 10);
    renderDemo();
  });

  document.getElementById('layer-slider').addEventListener('input', (e) => {
    state.layerPct = parseInt(e.target.value, 10);
    renderDemo();
  });

  document.getElementById('fam-toggle').addEventListener('click', () => {
    state.sameFamily = !state.sameFamily;
    renderDemo();
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', renderDemo);