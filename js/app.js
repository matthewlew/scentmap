import * as store from './store.js';
import * as engine from './engine.js';

// Proxy data from store for backward compatibility during transition
let { ROLES, CAT, CAT_MAP, NI, NI_MAP, BRANDS } = store.getData();
let RM = {};
let BRANDS_MAP = {};
const { FAM, FAM_ORDER, FAM_COMPAT, FAM_ABBR } = store;

const SW=['','Skin','Skin','Subtle','Subtle','Moderate','Moderate','Strong','Strong','Enveloping','Enormous'];
const LW=['','Linear','Linear','Simple','Simple','Balanced','Balanced','Layered','Layered','Complex','Deep'];

// Analytics stubs
function trackEvent(name, props) {
  console.log(`[analytics] ${name}`, props);
}

/* ── Utility: debounce ── */
function debounce(fn, delay) {
  let timer;
  return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); };
}

/* ── Search helpers: diacritic normalization + fuzzy matching ── */
function normQ(s){ return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }

function levenshtein(a,b){
  const m=a.length,n=b.length;
  const dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i||j));
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++)
    dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[m][n];
}

function wordFuzzy(q,phrase,threshold){
  if(levenshtein(q,phrase)<=threshold) return true;
  return phrase.split(/\s+/).some(w=>w.length>=q.length-1&&levenshtein(q,w)<=threshold);
}

function matchFrag(f,q){
  if(!q) return true;
  if(f._nameN.includes(q)||f._brandN.includes(q)||f._nAllN.some(n=>n.includes(q))) return true;
  // Word-prefix: "dip" → Diptyque, "san" → Santal 33
  const ws=(f._nameN+' '+f._brandN).split(/\s+/);
  if(ws.some(w=>w.startsWith(q))) return true;
  // Fuzzy prefix: "dipti" → diptyque (lev("dipti","dipty")=1), "byrd" → byredo
  if(q.length>=3&&ws.some(w=>{const p=w.slice(0,q.length);return p.length===q.length&&levenshtein(q,p)<=1;})) return true;
  if(q.length<4) return false;
  return wordFuzzy(q,f._nameN,2)||wordFuzzy(q,f._brandN,1);
}

/* State */
function gst(id){return store.getState(id)}
window.checkRedundancy = function(fragId) {
  const frag = CAT_MAP[fragId];
  const owned = CAT.filter(f => isOwned(f.id));
  for (const o of owned) {
    const sim = scoreSimilarity(frag, o);
    if (sim >= 85) return { match: o, score: Math.round(sim) };
  }
  return null;
};

window.getGoldenPairs = function(owned) {
  if (owned.length < 2) return [];
  const pairs = [];
  for (let i = 0; i < owned.length; i++) {
    for (let j = i + 1; j < owned.length; j++) {
      const score = scoreLayeringPair(owned[i], owned[j]);
      if (score >= 50) { 
        pairs.push({ a: owned[i], b: owned[j], score: Math.round(score / 75 * 100) });
      }
    }
  }
  return pairs.sort((a, b) => b.score - a.score).slice(0, 5);
};

function showUndoToast(msg, onUndo) {
  let toast = document.getElementById('global-undo-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-undo-toast';
    toast.className = 'global-toast';
    toast.innerHTML = `
      <span class="global-toast-msg"></span>
      <button class="global-toast-undo">Undo</button>
    `;
    document.body.appendChild(toast);
  }
  
  toast.querySelector('.global-toast-msg').textContent = msg;
  const undoBtn = toast.querySelector('.global-toast-undo');
  
  const newUndoBtn = undoBtn.cloneNode(true);
  undoBtn.parentNode.replaceChild(newUndoBtn, undoBtn);
  
  newUndoBtn.addEventListener('click', () => {
    onUndo();
    toast.classList.remove('visible');
  });

  toast.classList.add('visible');
  
  if (toast._timeout) clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

function setState(id,s){
  const oldState = store.getState(id);
  if(s==='wish'){
    const redun = window.checkRedundancy(id);
    if(redun){
      pushSheet(c => {
        const frag = CAT_MAP[id];
        c.innerHTML = `
          <div class="detail-inner" style="text-align:center;">
            <div style="font-size:32px; margin-bottom:var(--sp-md);">⚖️</div>
            <div class="sec-label" style="justify-content:center;">Redundancy Alert</div>
            <div class="dc-name" style="margin-bottom:var(--sp-md);">Wait, you might not need this.</div>
            <p class="text-body" style="font-family:var(--font-serif); color:var(--text-secondary); margin-bottom:var(--sp-xl); line-height:1.5;">
              <strong>${frag.name}</strong> is a <strong>${redun.score}% mathematical match</strong> to <strong>${redun.match.name}</strong> which you already own.
            </p>
            <div style="display:flex; flex-direction:column; gap:var(--sp-sm);">
              <button class="dc-collect-btn active" style="width:100%; justify-content:center; padding:var(--sp-md);" onclick="popSheet()">Actually, skip it</button>
              <button class="dc-collect-btn" style="width:100%; justify-content:center; padding:var(--sp-md); border:none;" id="force-wish">Save anyway</button>
            </div>
          </div>
        `;
        c.querySelector('#force-wish').onclick = () => {
          store.setState(id, 'wish');
          refreshAfterStateChange(id);
          popSheet();
          showUndoToast('Added to wishlist', () => {
            store.setState(id, oldState);
            refreshAfterStateChange(id);
          });
        };
      });
      return; 
    }
  }
  
  store.setState(id,s);
  
  const frag = CAT_MAP[id];
  const name = frag ? frag.name : 'Fragrance';
  let msg = '';
  if (s === 'owned') msg = 'Marked as owned';
  else if (s === 'wish') msg = 'Added to wishlist';
  else msg = 'Removed from collection';

  // State change aria-live announcement
  const liveEl = document.getElementById('cat-live');
  if (liveEl) {
    liveEl.textContent = `${name} ${msg.toLowerCase()}`;
    setTimeout(() => { if (liveEl.textContent === `${name} ${msg.toLowerCase()}`) liveEl.textContent = ''; }, 3000);
  }
  
  showUndoToast(msg, () => {
    store.setState(id, oldState);
    refreshAfterStateChange(id);
  });
}
function isOwned(id){return store.isOwned(id)}
function isWish(id){return store.isWish(id)}
function cycleState(id){ store.cycleState(id); }
function isNoteSaved(name){return store.isNoteSaved(name)}
function toggleNoteSaved(name){ store.toggleNoteSaved(name); }
function isBrandSaved(id){return store.getState('b_'+id.toLowerCase())==='saved'}
function toggleBrandSave(id){
  const key = 'b_'+id.toLowerCase();
  store.setState(key, store.getState(key)==='saved'?'none':'saved');
}

/* ── Auth (Supabase) ─────────────────────────────────────────────── */
// Fill these in after creating your Supabase project:
//   Authentication → URL Configuration → set Site URL to your app URL
//   Authentication → Providers → enable Google and/or Apple
const SUPABASE_URL      = 'https://ttbywijzemzqtelxkffn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ApGoKsgSewzitLprbBWzHw_dSWColPV';

let currentUser = null;
let _sb = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function initSupabaseAuth() {
  if (!_sb) return;
  // Restore session (also handles the OAuth redirect fragment automatically)
  const { data: { session } } = await _sb.auth.getSession();
  if (session?.user) _applyUser(session.user);
  _sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) _applyUser(session.user);
    else if (event === 'SIGNED_OUT') { currentUser = null; updateNavForUser(); }
  });
}

function _applyUser(user) {
  currentUser = {
    name:  user.user_metadata?.full_name || user.user_metadata?.name || user.email,
    email: user.email
  };
  updateNavForUser();
}

function _authTrapFocus(modal) {
  const focusable = Array.from(modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => !el.disabled);
  const first = focusable[0], last = focusable[focusable.length - 1];
  function handler(e) {
    if (e.key === 'Escape') { closeAuthModal(); return; }
    if (e.key !== 'Tab') return;
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
  }
  modal._trapHandler = handler;
  modal.addEventListener('keydown', handler);
}

function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  // Reset to entry state
  document.getElementById('auth-modal-body-enter').hidden = false;
  document.getElementById('auth-modal-body-sent').hidden  = true;
  const inp = document.getElementById('auth-email-input');
  const err = document.getElementById('auth-email-error');
  const btn = document.getElementById('auth-btn-send');
  if (inp) { inp.value = ''; inp.disabled = false; }
  if (err) { err.hidden = true; err.textContent = ''; }
  if (btn) { btn.disabled = false; btn.textContent = 'Send magic link'; }
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('open'));
  setTimeout(() => { inp ? inp.focus() : document.getElementById('auth-modal-close')?.focus(); }, 50);
  _authTrapFocus(modal);
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.remove('open');
  if (modal._trapHandler) modal.removeEventListener('keydown', modal._trapHandler);
  modal.addEventListener('transitionend', () => { modal.hidden = true; }, {once: true});
  document.getElementById('nav-signin-btn')?.focus();
}

function updateNavForUser() {
  const btn = document.getElementById('nav-signin-btn');
  if (!btn) return;
  if (currentUser) {
    btn.textContent = currentUser.name.charAt(0).toUpperCase();
    btn.classList.add('signed-in');
    btn.setAttribute('aria-label', `Signed in as ${currentUser.name}. Open profile.`);
    btn.title = currentUser.name;
    btn.onclick = openProfilePanel;
  } else {
    btn.textContent = 'Sign In';
    btn.classList.remove('signed-in');
    btn.setAttribute('aria-label', 'Sign in to your account');
    btn.removeAttribute('title');
    btn.onclick = openAuthModal;
  }
}

function openProfilePanel() {
  function renderProfile(container) {
    const owned  = CAT.filter(f => isOwned(f.id));
    const wished = CAT.filter(f => isWish(f.id));
    const initial = currentUser.name.charAt(0).toUpperCase();

    // detail-inner already provides padding: var(--sp-lg) var(--sp-2xl)
    // sheet-inner already provides padding: 0 var(--sp-lg)
    // so no outer wrapper needed — use margins on sections only
    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:var(--sp-md);padding-bottom:var(--sp-xl);margin-bottom:var(--sp-xl);border-bottom:1px solid var(--border-standard);">
        <div style="width:44px;height:44px;flex-shrink:0;background:var(--text-primary);color:var(--bg-primary);border-radius:var(--radius-circle);display:flex;align-items:center;justify-content:center;font-family:var(--font-sans);font-size:var(--fs-ui);font-weight:700;" aria-hidden="true">${initial}</div>
        <div style="min-width:0;overflow:hidden;">
          <div style="font-family:var(--font-sans);font-size:var(--fs-body);font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${currentUser.name}</div>
          <div style="font-family:var(--font-sans);font-size:var(--fs-body-sm);color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${currentUser.email}</div>
        </div>
      </div>

      <div class="sec-label" style="margin-bottom:var(--sp-md);">Collection</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-sm);margin-bottom:var(--sp-xl);">
        <div style="background:var(--bg-secondary);border-radius:var(--radius-lg);padding:var(--sp-md);">
          <div style="font-family:var(--font-display);font-size:var(--fs-title);color:var(--text-primary);line-height:1;">${owned.length}</div>
          <div style="font-family:var(--font-sans);font-size:var(--fs-body-sm);color:var(--text-secondary);margin-top:var(--sp-xs);">Owned</div>
        </div>
        <div style="background:var(--bg-secondary);border-radius:var(--radius-lg);padding:var(--sp-md);">
          <div style="font-family:var(--font-display);font-size:var(--fs-title);color:var(--text-primary);line-height:1;">${wished.length}</div>
          <div style="font-family:var(--font-sans);font-size:var(--fs-body-sm);color:var(--text-secondary);margin-top:var(--sp-xs);">Wishlist</div>
        </div>
      </div>

      <button class="copy-collection-btn" id="profile-copy-btn" style="width:100%;justify-content:center;">Export collection</button>
      <span id="profile-copy-toast" aria-live="polite" style="display:block;margin-top:var(--sp-xs);font-family:var(--font-sans);font-size:var(--fs-meta);color:var(--text-secondary);min-height:1.2em;"></span>

      <div style="margin-top:var(--sp-2xl);border-top:1px solid var(--border-standard);padding-top:var(--sp-xl);">
        <button class="auth-guest-link" id="profile-signout-btn">Sign out</button>
      </div>
    `;

    container.querySelector('#profile-copy-btn').addEventListener('click', () => {
      copyCollectionToClipboard(container.querySelector('#profile-copy-toast'));
    });

    container.querySelector('#profile-signout-btn').addEventListener('click', async () => {
      if (isDesktop() || isTablet()) closeDesktopDetail();
      else closeAllSheets();
      if (_sb) await _sb.auth.signOut();
      else { currentUser = null; updateNavForUser(); }
    });
  }

  if (isDesktop() || isTablet()) {
    openDesktopDetail(renderProfile);
  } else {
    pushSheet(renderProfile, 'Profile');
  }
}

async function sendMagicLink(email) {
  const sendBtn = document.getElementById('auth-btn-send');
  const errEl   = document.getElementById('auth-email-error');
  const inp     = document.getElementById('auth-email-input');

  // Basic validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (errEl) { errEl.textContent = 'Please enter a valid email address.'; errEl.hidden = false; }
    inp?.focus();
    return;
  }
  if (errEl) errEl.hidden = true;

  if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = 'Sending…'; }
  if (inp)     inp.disabled = true;

  if (!_sb) {
    // Supabase not configured — mock the sent state
    setTimeout(() => _showMagicLinkSent(email), 800);
    return;
  }

  const { error } = await _sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname }
  });

  if (error) {
    if (errEl) { errEl.textContent = error.message; errEl.hidden = false; }
    if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = 'Send magic link'; }
    if (inp)     inp.disabled = false;
    inp?.focus();
  } else {
    _showMagicLinkSent(email);
  }
}

function _showMagicLinkSent(email) {
  document.getElementById('auth-modal-body-enter').hidden = true;
  document.getElementById('auth-modal-body-sent').hidden  = false;
  const sentEmail = document.getElementById('auth-sent-email');
  if (sentEmail) sentEmail.textContent = email;
  document.getElementById('auth-btn-back')?.focus();
}

function copyCollectionToClipboard(toastEl) {
  const owned  = CAT.filter(f => isOwned(f.id));
  const wished = CAT.filter(f => isWish(f.id));
  const notes  = NI.filter(n => isNoteSaved(n.name));
  const brands = BRANDS.filter(b => isBrandSaved(b.id));
  const lines = ['My Scentmap Collection', '======================'];
  if (owned.length)  { lines.push('', `Owned (${owned.length})`);   owned.forEach(f  => lines.push(`- ${f.name} — ${f.brand}`)); }
  if (wished.length) { lines.push('', `Wishlist (${wished.length})`);wished.forEach(f  => lines.push(`- ${f.name} — ${f.brand}`)); }
  if (notes.length)  { lines.push('', `Saved Notes (${notes.length})`); lines.push('- ' + notes.map(n => n.name).join(', ')); }
  if (brands.length) { lines.push('', `Saved Brands (${brands.length})`); lines.push('- ' + brands.map(b => b.name).join(', ')); }
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    if (toastEl) { toastEl.textContent = 'Copied to clipboard!'; setTimeout(() => { toastEl.textContent = ''; }, 3000); }
  });
}

function renderCollectionSection(container, label, items, type) {
  if (!items.length) return;
  const section = document.createElement('div');
  section.className = 'collection-section';
  const hdr = document.createElement('div');
  hdr.className = 'collection-section-hdr';
  hdr.innerHTML = `<span>${label}</span><span class="collection-section-count">${items.length}</span>`;
  section.appendChild(hdr);

  if (type === 'frags') {
    const list = document.createElement('div');
    list.className = 'scent-list';
    items.forEach(frag => {
      const row = document.createElement('div');
      renderCatRow(row, frag, FAM[frag.family] || {color:'#888'});
      row.className = row.className.replace('list-item--compact', '').trim();
      row.addEventListener('click', () => openFragDetail(frag));
      list.appendChild(row);
    });
    section.appendChild(list);
  } else if (type === 'notes') {
    const wrap = document.createElement('div');
    wrap.className = 'collection-notes-wrap';
    items.forEach(note => {
      const btn = document.createElement('button');
      btn.className = 'cmp-note-pill';
      btn.textContent = note.name;
      btn.addEventListener('click', e => { e.stopPropagation(); openNotePopup(note, btn); });
      wrap.appendChild(btn);
    });
    section.appendChild(wrap);
  } else if (type === 'brands') {
    const wrap = document.createElement('div');
    wrap.className = 'collection-brands-wrap';
    items.forEach(brand => {
      const btn = document.createElement('button');
      btn.className = 'saved-brand-chip';
      btn.textContent = brand.name;
      btn.addEventListener('click', () => openHouseDetail(brand.name));
      wrap.appendChild(btn);
    });
    section.appendChild(wrap);
  }
  container.appendChild(section);
}

let TRIALS = [];
try { TRIALS = JSON.parse(localStorage.getItem('scentmap_trials') || '[]'); } catch(e) { TRIALS = []; }
function _saveTrials() { try { localStorage.setItem('scentmap_trials', JSON.stringify(TRIALS)); } catch(e) {} }

function startTrial(fragId, location) {
  const trial = { id: fragId, location, timestamp: Date.now(), rating: null, status: 'active' };
  TRIALS = [trial, ...TRIALS];
  _saveTrials();
  if (window.renderSaved) window.renderSaved();
}

function updateTrial(fragId, timestamp, data) {
  const trial = TRIALS.find(t => t.id === fragId && t.timestamp === timestamp);
  if (trial) {
    Object.assign(trial, data);
    if (data.rating !== null) trial.status = 'completed';
    _saveTrials();
    if (window.renderSaved) window.renderSaved();
  }
}

function deleteTrial(fragId, timestamp) {
  TRIALS = TRIALS.filter(t => !(t.id === fragId && t.timestamp === timestamp));
  _saveTrials();
  if (window.renderSaved) window.renderSaved();
}

window.openTrialSheet = function(fragId) {
  const frag = CAT_MAP[fragId];
  if (!frag) return;
  pushSheet(container => {
    container.innerHTML = `
      <div class="detail-inner">
        <div class="sec-label">New Test Bench Entry</div>
        <div class="dc-name">${frag.name}</div>
        <div class="dc-brand">${frag.brand}</div>
        
        <div class="sec-label" style="margin-top:var(--sp-xl);">Where did you spray it?</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--sp-sm); margin-bottom:var(--sp-xl);">
          ${['Left Wrist', 'Right Wrist', 'Left Elbow', 'Right Elbow', 'Neck', 'Chest', 'Paper Strip'].map(loc => `
            <button class="dc-collect-btn trial-loc-btn" data-loc="${loc}" style="justify-content:center;">${loc}</button>
          `).join('')}
        </div>

        <div class="sec-label">Initial Impression</div>
        <div style="display:flex; gap:var(--sp-sm); margin-bottom:var(--sp-xl);">
          ${[1, 2, 3, 4, 5].map(v => `
            <button class="dc-collect-btn trial-rate-btn" data-val="${v}" style="flex:1; justify-content:center; font-size:var(--fs-title);">${v === 1 ? '🙁' : v === 3 ? '😐' : v === 5 ? '😍' : v}</button>
          `).join('')}
        </div>

        <button class="dc-collect-btn active" id="save-trial-btn" disabled style="width:100%; justify-content:center; padding:var(--sp-md);">Add to Test Bench</button>
      </div>
    `;

    let selectedLoc = null, selectedRate = null;
    const updateBtn = () => { container.querySelector('#save-trial-btn').disabled = !(selectedLoc && selectedRate); };

    container.querySelectorAll('.trial-loc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.trial-loc-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedLoc = btn.dataset.loc;
        updateBtn();
      });
    });

    container.querySelectorAll('.trial-rate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.trial-rate-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedRate = parseInt(btn.dataset.val);
        updateBtn();
      });
    });

    container.querySelector('#save-trial-btn').addEventListener('click', () => {
      startTrial(fragId, selectedLoc);
      updateTrial(fragId, TRIALS[0].timestamp, { rating: selectedRate });
      popSheet();
      window.haptic?.('success');
    });
  });
};

window.openTrialUpdateSheet = function(fragId, timestamp) {
  const frag = CAT_MAP[fragId];
  if (!frag) return;
  pushSheet(container => {
    container.innerHTML = `
      <div class="detail-inner">
        <div class="sec-label">Final Review</div>
        <div class="dc-name">${frag.name}</div>
        
        <p class="text-body" style="font-family:var(--font-serif); margin-bottom:var(--sp-xl); color:var(--text-secondary);">How has the scent developed? Give it another sniff and rate it again.</p>

        <div class="sec-label">New Rating</div>
        <div style="display:flex; gap:var(--sp-sm); margin-bottom:var(--sp-xl);">
          ${[1, 2, 3, 4, 5].map(v => `
            <button class="dc-collect-btn update-rate-btn" data-val="${v}" style="flex:1; justify-content:center; font-size:var(--fs-title);">${v === 1 ? '🙁' : v === 3 ? '😐' : v === 5 ? '😍' : v}</button>
          `).join('')}
        </div>

        <button class="dc-collect-btn active" id="update-trial-btn" disabled style="width:100%; justify-content:center; padding:var(--sp-md);">Complete Review</button>
      </div>
    `;

    let selectedRate = null;
    container.querySelectorAll('.update-rate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.update-rate-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedRate = parseInt(btn.dataset.val);
        container.querySelector('#update-trial-btn').disabled = false;
      });
    });

    container.querySelector('#update-trial-btn').addEventListener('click', () => {
      updateTrial(fragId, timestamp, { rating: selectedRate });
      popSheet();
      window.haptic?.('success');
    });
  });
};

function getCollectionStats(frags) {
  if (!frags.length) return null;
  const famCounts = {}; const noteCounts = {}; const profiles = [];
  frags.forEach(f => {
    famCounts[f.family] = (famCounts[f.family] || 0) + 1;
    f._nAll.forEach(n => { noteCounts[n] = (noteCounts[n] || 0) + 1; });
    profiles.push(engine.computeProfile(f));
  });
  const avgProfile = {
    freshness: profiles.reduce((s, p) => s + p.freshness, 0) / frags.length,
    sweetness: profiles.reduce((s, p) => s + p.sweetness, 0) / frags.length,
    warmth: profiles.reduce((s, p) => s + p.warmth, 0) / frags.length,
    intensity: profiles.reduce((s, p) => s + p.intensity, 0) / frags.length,
    complexity: profiles.reduce((s, p) => s + p.complexity, 0) / frags.length,
  };
  const topFamilies = Object.entries(famCounts).sort((a,b) => b[1] - a[1]);
  const topNotes = Object.entries(noteCounts).sort((a,b) => b[1] - a[1]).slice(0, 10);
  return { avgProfile, topFamilies, topNotes, count: frags.length };
}

/* ── Wardrobe Gap Analysis ─────────────────────────────────────── */
const GAP_AXIS_LABELS = {
  freshness: ['fresh', 'freshness'],
  sweetness: ['sweet', 'sweetness'],
  warmth:    ['warm', 'warmth'],
  intensity: ['bold', 'intensity'],
  complexity:['complex', 'complexity'],
};

function computeWardrobeGap() {
  const owned = CAT.filter(f => isOwned(f.id));
  if (!owned.length) return null;

  const stats = getCollectionStats(owned);
  const p = stats.avgProfile;

  // Find the two dominant axes (highest values)
  const axes = Object.entries(p).sort((a, b) => b[1] - a[1]);
  const dominant = axes.slice(0, 2).map(([k]) => GAP_AXIS_LABELS[k][0]);

  // Check each axis against thresholds to find the gap
  if (p.freshness < 0.3) {
    return {
      dominant,
      gapLabel: 'a light, airy contrast',
      ctaFamilies: ['Citrus', 'Green'],
      ctaSearch: 'citrus',
      count: owned.length,
    };
  }
  if (p.sweetness < 0.3) {
    return {
      dominant,
      gapLabel: 'sweetness',
      ctaFamilies: ['Gourmand', 'Floral'],
      ctaSearch: 'gourmand',
      count: owned.length,
    };
  }
  if (p.warmth < 0.3) {
    return {
      dominant,
      gapLabel: 'warmth and depth',
      ctaFamilies: ['Amber', 'Woody', 'Oud'],
      ctaSearch: 'amber',
      count: owned.length,
    };
  }
  if (p.complexity < 0.4) {
    return {
      dominant,
      gapLabel: 'complexity',
      ctaFamilies: ['Chypre', 'Leather'],
      ctaSearch: 'chypre',
      count: owned.length,
    };
  }
  if (p.intensity < 0.3) {
    return {
      dominant,
      gapLabel: 'presence and projection',
      ctaFamilies: [],
      ctaSearch: '',
      count: owned.length,
    };
  }

  // No gap — complete collection
  const signatureAxis = axes[0][0];
  return {
    dominant,
    gapLabel: null,
    signatureAxis: GAP_AXIS_LABELS[signatureAxis][1],
    count: owned.length,
  };
}

function renderWardrobeGap(container) {
  const gap = computeWardrobeGap();
  if (!gap) return;

  const el = document.createElement('div');
  el.className = 'dna-card dna-card--gap';

  const disclaimer = gap.count <= 2
    ? `<p class="dna-sub" style="opacity:0.7">Based on ${gap.count} fragrance${gap.count === 1 ? '' : 's'} — add more to refine.</p>`
    : '';

  if (gap.gapLabel) {
    const ctaHtml = gap.ctaSearch
      ? `<button class="gap-cta" aria-label="Browse ${gap.ctaFamilies.join(' and ')} fragrances to fill your collection gap">Browse ${gap.ctaFamilies.join(' & ')}</button>`
      : '';
    el.innerHTML = `
      <p class="dna-headline">Your wardrobe leans ${gap.dominant.join(' and ')}. You're missing ${gap.gapLabel}.</p>
      ${disclaimer}
      ${ctaHtml}
    `;
    const cta = el.querySelector('.gap-cta');
    if (cta) {
      cta.addEventListener('click', () => {
        // Switch to All tab and search for gap family
        CAT_STATE_FILTER = null;
        const allStateBtns = document.querySelectorAll('#cat-state-bar .tab, #cat-state-bar-m .tab');
        allStateBtns.forEach(b => {
          const isAll = b.dataset.val === '';
          b.classList.toggle('active', isAll);
          b.setAttribute('aria-pressed', isAll ? 'true' : 'false');
        });
        const searchEl = document.getElementById('cat-search');
        if (searchEl) {
          searchEl.value = gap.ctaSearch;
          document.getElementById('cat-search-clear')?.classList.add('visible');
        }
        buildCatalog();
      });
    }
  } else {
    el.innerHTML = `<p class="dna-headline">Your collection covers all the major sensory dimensions. ${gap.signatureAxis.charAt(0).toUpperCase() + gap.signatureAxis.slice(1)} is your signature.</p>${disclaimer}`;
  }

  container.appendChild(el);

  // Announce to screen readers
  const liveEl = document.getElementById('cat-live');
  if (liveEl) {
    liveEl.textContent = gap.gapLabel
      ? `Your wardrobe gap: missing ${gap.gapLabel}.`
      : 'Your collection covers all sensory dimensions.';
  }
}

/* ── Brand Discovery ───────────────────────────────────────────── */
function computeBrandScores() {
  const owned = CAT.filter(f => isOwned(f.id));
  if (!owned.length) return [];

  const ownedStats = getCollectionStats(owned);
  const userTopFams = ownedStats.topFamilies.slice(0, 3).map(([f]) => f);
  const avgProfile = ownedStats.avgProfile;
  const userAvgSillage = owned.reduce((s, f) => s + f.sillage, 0) / owned.length;

  // Group catalog by brand
  const brandGroups = {};
  CAT.forEach(f => {
    if (!brandGroups[f.brand]) brandGroups[f.brand] = [];
    brandGroups[f.brand].push(f);
  });

  const results = [];
  for (const [brand, frags] of Object.entries(brandGroups)) {
    const ownedInBrand = frags.filter(f => isOwned(f.id)).length;
    if (ownedInBrand >= 2) continue; // Already explored

    // Average similarity to each owned frag
    let totalScore = 0;
    let bestMatch = null;
    let bestMatchScore = 0;

    for (const ownedFrag of owned) {
      let brandBest = 0;
      for (const brandFrag of frags) {
        const sim = scoreSimilarity(ownedFrag, brandFrag);
        totalScore += sim;
        if (sim > brandBest) brandBest = sim;
      }
      if (brandBest > bestMatchScore) {
        bestMatchScore = brandBest;
        bestMatch = ownedFrag;
      }
    }

    const avgScore = Math.round(totalScore / (owned.length * frags.length));
    const brandData = BRANDS.find(b => b.name === brand);

    // Dominant family
    const famCounts = {};
    frags.forEach(f => { famCounts[f.family] = (famCounts[f.family] || 0) + 1; });
    const brandTopFams = Object.entries(famCounts).sort((a, b) => b[1] - a[1]);
    const domFamily = brandTopFams[0]?.[0] || 'woody';

    // Build "Because you like…" reasons from collection overlap
    const reasons = [];
    const overlappingFams = brandTopFams
      .filter(([fam]) => userTopFams.includes(fam))
      .slice(0, 2)
      .map(([fam]) => FAM[fam]?.label?.toLowerCase() || fam);
    reasons.push(...overlappingFams);

    if (reasons.length < 2) {
      const brandAvgSillage = frags.reduce((s, f) => s + f.sillage, 0) / frags.length;
      if (userAvgSillage >= 6.5 && brandAvgSillage >= 6.5) reasons.push('high sillage');
    }
    if (reasons.length < 2 && avgProfile.sweetness > 0.5) reasons.push('sweet fragrances');
    if (reasons.length < 2 && avgProfile.warmth > 0.55) reasons.push('warm scents');
    if (!reasons.length) reasons.push(FAM[domFamily]?.label?.toLowerCase() || domFamily);

    results.push({
      brand,
      score: avgScore,
      bestMatch,
      bestMatchScore: Math.round(bestMatchScore),
      fragCount: frags.length,
      url: brandData?.url || null,
      domFamily,
      reasons,
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 6);
}

function renderBrandDiscovery(container) {
  const owned = CAT.filter(f => isOwned(f.id));
  if (!owned.length) return;

  const brands = computeBrandScores();
  if (!brands.length) {
    const el = document.createElement('div');
    el.className = 'dna-card dna-card--gap';
    el.innerHTML = '<p class="dna-headline">You\'ve explored every brand in our catalog.</p>';
    container.appendChild(el);
    return;
  }

  const sec = document.createElement('div');
  sec.className = 'brand-discovery';

  const hdr = document.createElement('div');
  hdr.className = 'sec-label';
  hdr.textContent = 'Brands to Explore';
  sec.appendChild(hdr);

  if (owned.length < 3) {
    const note = document.createElement('p');
    note.className = 'dna-sub';
    note.textContent = 'Add more to improve recommendations.';
    sec.appendChild(note);
  }

  const wrap = document.createElement('div');
  wrap.className = 'carousel-wrap';
  const carousel = document.createElement('div');
  carousel.className = 'carousel';

  brands.forEach(b => {
    const card = document.createElement('div');
    card.className = 'carousel-card carousel-card--brand';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Explore ${b.brand} — ${b.score}% match with your collection`);

    const famColor = FAM[b.domFamily]?.color || '#888';
    const famLabel = FAM[b.domFamily]?.label || b.domFamily;
    const reasonText = b.reasons.length >= 2
      ? `Because you like ${b.reasons[0]} and ${b.reasons[1]}`
      : b.reasons.length === 1
        ? `Because you like ${b.reasons[0]}`
        : '';

    card.innerHTML = `
      <div class="carousel-card-family">
        <div class="fam-dot" style="background:${famColor}" aria-hidden="true"></div>
        <span class="carousel-card-family-label">${famLabel}</span>
      </div>
      <div class="carousel-card-name list-item-name">${b.brand}</div>
      ${reasonText ? `<div class="carousel-card-reason">${reasonText}</div>` : ''}
      ${b.url ? `<a class="s-name-btn carousel-card-shop" href="${b.url}" target="_blank" rel="noopener noreferrer" aria-label="Shop ${b.brand} — opens official website">Shop →</a>` : ''}
    `;

    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      openHouseDetail(b.brand);
    });
    card.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === card) {
        e.preventDefault();
        openHouseDetail(b.brand);
      }
    });

    carousel.appendChild(card);
  });

  wrap.appendChild(carousel);
  sec.appendChild(wrap);
  container.appendChild(sec);

  const liveEl = document.getElementById('cat-live');
  if (liveEl) liveEl.textContent = `Showing ${brands.length} brands to explore based on your collection.`;
}

window.exportAuraCard = function() {
  const owned = CAT.filter(f => isOwned(f.id)); if (!owned.length) return;
  const stats = getCollectionStats(owned); const profile = stats.avgProfile;
  const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
  canvas.width = 1080; canvas.height = 1920;
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height); grad.addColorStop(0, '#FDFCFB'); grad.addColorStop(1, '#E2D1C3');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0E0C09'; ctx.font = '700 48px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SCENTMAP', canvas.width / 2, 160);
  ctx.font = '400 32px Georgia, serif'; ctx.fillText('Your Olfactive Identity', canvas.width / 2, 210);
  const cx = canvas.width / 2; const cy = 850; const r = 350;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.5);
  const primaryFam = stats.topFamilies[0][0]; const primaryColor = FAM[primaryFam]?.color || '#8B4513';
  glow.addColorStop(0, primaryColor + '22'); glow.addColorStop(1, 'transparent'); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2); ctx.fill();
  const dims = [{ l: 'FRESH', v: profile.freshness }, { l: 'SWEET', v: profile.sweetness }, { l: 'WARM', v: profile.warmth }, { l: 'BOLD', v: profile.intensity }, { l: 'DEEP', v: profile.complexity }];
  const n = dims.length;
  ctx.strokeStyle = '#0E0C0911'; ctx.lineWidth = 2;
  [0.25, 0.5, 0.75, 1.0].forEach(rv => { ctx.beginPath(); for (let i = 0; i <= n; i++) { const a = (Math.PI * 2 * i / n) - Math.PI / 2; const x = cx + r * rv * Math.cos(a); const y = cy + r * rv * Math.sin(a); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); });
  ctx.beginPath(); ctx.fillStyle = primaryColor + '44'; ctx.strokeStyle = primaryColor; ctx.lineWidth = 8;
  for (let i = 0; i <= n; i++) { const d = dims[i % n]; const a = (Math.PI * 2 * i / n) - Math.PI / 2; const val = Math.max(0.1, d.v); const x = cx + r * val * Math.cos(a); const y = cy + r * val * Math.sin(a); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#0E0C09'; ctx.font = '700 28px Inter, sans-serif';
  dims.forEach((d, i) => { const a = (Math.PI * 2 * i / n) - Math.PI / 2; const x = cx + (r + 60) * Math.cos(a); const y = cy + (r + 60) * Math.sin(a); ctx.textAlign = x < cx - 10 ? 'right' : x > cx + 10 ? 'left' : 'center'; ctx.fillText(d.l, x, y); });
  ctx.textAlign = 'left'; ctx.font = '700 36px Inter, sans-serif'; ctx.fillText('TOP FAMILIES', 120, 1350);
  ctx.font = '400 32px Inter, sans-serif'; stats.topFamilies.slice(0, 3).forEach(([fam, count], i) => { ctx.fillText(`${i + 1}. ${FAM[fam]?.label || fam}`, 120, 1410 + (i * 50)); });
  ctx.font = '700 36px Inter, sans-serif'; ctx.fillText('SIGNATURE NOTES', 580, 1350);
  ctx.font = '400 32px Inter, sans-serif'; stats.topNotes.slice(0, 5).forEach((n, i) => { ctx.fillText(`• ${n[0]}`, 580, 1410 + (i * 50)); });
  ctx.textAlign = 'center'; ctx.font = '700 120px Inter, sans-serif'; ctx.fillText(owned.length.toString(), canvas.width / 2, 1720);
  ctx.font = '400 28px Inter, sans-serif'; ctx.fillStyle = '#6B6356'; ctx.fillText('FRAGRANCES IN WARDROBE', canvas.width / 2, 1770);
  const link = document.createElement('a'); link.download = `scentmap-aura-${Date.now()}.png`; link.href = canvas.toDataURL('image/png'); link.click();
};

window.exportLayeringRecipe = function(idA, idB, score) {
  const fa = CAT_MAP[idA]; const fb = CAT_MAP[idB]; if (!fa || !fb) return;
  const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
  canvas.width = 1080; canvas.height = 1080;
  const grad = ctx.createLinearGradient(0, 0, 1080, 1080); grad.addColorStop(0, '#FFFFFF'); grad.addColorStop(1, '#F5F2EC');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0E0C09'; ctx.font = '700 32px Inter, sans-serif'; ctx.textAlign = 'left'; ctx.fillText('SCENTMAP', 80, 100);
  ctx.font = '400 24px Georgia, serif'; ctx.fillText('Layering Recipe', 80, 140);
  const bx = 850, by = 100, br = 80; ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fillStyle = '#0E0C09'; ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.font = '700 42px Inter, sans-serif'; ctx.fillText(`${score}%`, bx, by + 10);
  ctx.font = '700 14px Inter, sans-serif'; ctx.fillText('MATCH', bx, by + 35);
  const ca = getCmpFam(fa.family); ctx.textAlign = 'left'; ctx.fillStyle = ca.accent; ctx.font = '700 56px Inter, sans-serif'; ctx.fillText(fa.name.toUpperCase(), 80, 350);
  ctx.font = '400 32px Inter, sans-serif'; ctx.fillStyle = '#6B6356'; ctx.fillText(fa.brand, 80, 400);
  ctx.fillStyle = '#0E0C0922'; ctx.font = '400 120px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('+', canvas.width / 2, 530);
  const cb = getCmpFam(fb.family); ctx.textAlign = 'right'; ctx.fillStyle = cb.accent; ctx.font = '700 56px Inter, sans-serif'; ctx.fillText(fb.name.toUpperCase(), 1000, 680);
  ctx.font = '400 32px Inter, sans-serif'; ctx.fillStyle = '#6B6356'; ctx.fillText(fb.brand, 1000, 730);
  ctx.beginPath(); ctx.roundRect(80, 820, 920, 180, 20); ctx.fillStyle = '#0E0C0908'; ctx.fill();
  ctx.textAlign = 'center'; ctx.fillStyle = '#0E0C09'; ctx.font = '700 24px Inter, sans-serif'; ctx.fillText('WHY IT WORKS', canvas.width / 2, 875);
  ctx.font = 'italic 36px Georgia, serif'; ctx.fillStyle = '#4A453E'; ctx.fillText(engine.getSwapReason(fa, fb, store.FAM_COMPAT).replace('An alternative', 'This pair layers well'), canvas.width / 2, 940);
  const link = document.createElement('a'); link.download = `scentmap-recipe-${idA}-${idB}.png`; link.href = canvas.toDataURL('image/png'); link.click();
};

function renderJournalContent(container) {
  if (!container) return; container.innerHTML = '';
  const activeTrials = TRIALS.filter(t => t.status === 'active');
  if (activeTrials.length > 0) {
    const trialSec = document.createElement('div'); trialSec.style.marginBottom = 'var(--sp-3xl)';
    trialSec.innerHTML = `<div class="sec-label">Test Bench (Active)</div>`;
    const trialWrap = document.createElement('div'); trialWrap.className = 'dc-sim-shelf';
    activeTrials.forEach(t => {
      const frag = CAT_MAP[t.id]; const row = document.createElement('div');
      row.className = 'settings-menu-item'; row.style.cursor = 'default';
      row.innerHTML = `<div style="flex:1;"><div style="display:flex; justify-content:space-between; align-items:flex-start;"><div><div style="font-weight:600;">${frag.name}</div><div style="font-size:10px; color:var(--accent-primary); font-weight:700; text-transform:uppercase;">${t.location}</div></div><div style="display:flex; gap:var(--sp-xs);"><button class="dc-collect-btn active" style="padding:4px 12px; font-size:10px;" onclick="window.openTrialUpdateSheet('${t.id}', ${t.timestamp})">Final Review</button><button class="settings-btn" style="padding:4px;" onclick="deleteTrial('${t.id}', ${t.timestamp});" aria-label="Remove trial">✕</button></div></div></div>`;
      trialWrap.appendChild(row);
    });
    trialSec.appendChild(trialWrap); container.appendChild(trialSec);
  }
  const completedTrials = TRIALS.filter(t => t.status === 'completed');
  if (completedTrials.length > 0) {
    const journalSec = document.createElement('div'); journalSec.style.marginBottom = 'var(--sp-3xl)';
    journalSec.innerHTML = `<div class="sec-label">Test History</div>`;
    const journalWrap = document.createElement('div'); journalWrap.className = 'dc-sim-shelf';
    completedTrials.forEach(t => {
      const frag = CAT_MAP[t.id]; const row = document.createElement('button');
      row.className = 'settings-menu-item';
      const date = new Date(t.timestamp).toLocaleDateString(undefined, { month:'short', day:'numeric' });
      const stars = v => '★'.repeat(v) + '☆'.repeat(5-v);
      row.innerHTML = `<div style="flex:1;"><div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;"><div style="font-weight:600;">${frag.name}</div><div style="font-size:10px; color:var(--text-tertiary);">${date}</div></div><div style="display:flex; align-items:center; gap:var(--sp-sm);"><div style="font-size:10px; color:var(--accent-primary); font-weight:700; text-transform:uppercase;">${t.location}</div><div style="font-size:12px; color:var(--amber-600); letter-spacing:1px;">${stars(t.rating || 0)}</div></div></div>`;
      row.addEventListener('click', () => openFragDetail(frag));
      journalWrap.appendChild(row);
    });
    journalSec.appendChild(journalWrap); container.appendChild(journalSec);
  }
}

function computeCollectionArchetype(stats) {
  const p = stats.avgProfile;
  if (p.intensity > 0.65 && p.warmth > 0.65) return 'provocateur';
  if (p.freshness > 0.65 && p.complexity < 0.45) return 'minimalist';
  if (p.freshness > 0.65 && p.complexity > 0.55) return 'naturalist';
  if (p.sweetness > 0.55 && p.warmth > 0.55) return 'sensory-hedonist';
  if (p.complexity > 0.65 && p.intensity < 0.55) return 'quiet-expressionist';
  if (p.freshness > 0.55) return 'sun-chaser';
  if (p.sweetness > 0.45) return 'romantic';
  return 'urban-intellectual';
}

function getGapRecommendation(stats) {
  const p = stats.avgProfile;
  const dimensions = [
    { key: 'freshness', label: 'freshness' },
    { key: 'sweetness', label: 'sweetness' },
    { key: 'warmth', label: 'warmth' },
    { key: 'intensity', label: 'boldness' }
  ];
  
  const gap = dimensions.sort((a, b) => p[a.key] - p[b.key])[0];
  if (p[gap.key] > 0.5) return null; // No major gaps

  const candidates = CAT.filter(f => !isOwned(f.id) && !isWish(f.id));
  const best = candidates.sort((a, b) => {
    const pa = engine.computeProfile(a);
    const pb = engine.computeProfile(b);
    return pb[gap.key] - pa[gap.key];
  })[0];
  
  return { label: gap.label, frag: best };
}

window.renderSaved = function() {
  const container = document.getElementById('saved-list');
  const ctaWrap = document.getElementById('you-journal-cta');
  const journalWrap = document.getElementById('journal-content');
  if (!container) return;
  
  if (ctaWrap) {
    ctaWrap.innerHTML = `
      <div class="landing-card">
        <div class="landing-card-head">
          <span class="picker-fdot" style="background:var(--accent-primary);"></span>
          <h3 class="landing-card-title">Trying scents on?</h3>
        </div>
        <p class="landing-card-desc">Start tracking to see how they evolve over time.</p>
        <button class="landing-card-cta" onclick="go('catalog')">Find a scent to track</button>
      </div>
    `;
  }
  
  if (journalWrap) { renderJournalContent(journalWrap); }

  container.innerHTML = '';

  const owned  = CAT.filter(f => isOwned(f.id));
  const wished = CAT.filter(f => isWish(f.id));
  const notes  = NI.filter(n => isNoteSaved(n.name));
  const brands = BRANDS.filter(b => isBrandSaved(b.id));

  if (!owned.length && !wished.length && !notes.length && !brands.length) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:var(--sp-lg);color:var(--g500);font-family:var(--font-serif);';
    empty.textContent = 'Nothing saved yet. Swipe a fragrance to wishlist it, or open a note or brand to save it.';
    container.appendChild(empty);
    return;
  }

  // ── 1. OLFACTIVE DNA ──
  if (owned.length > 0) {
    const stats = getCollectionStats(owned);
    const dnaSec = document.createElement('div');
    dnaSec.className = 'dna-card';
    const profile = stats.avgProfile;
    const bars = [{ l: 'Fresh', v: profile.freshness, c: 'var(--fam-citrus)' }, { l: 'Sweet', v: profile.sweetness, c: 'var(--fam-floral)' }, { l: 'Warm', v: profile.warmth, c: 'var(--fam-amber)' }, { l: 'Bold', v: profile.intensity, c: 'var(--fam-oud)' }];
    
    const topNote = stats.topNotes[0] ? stats.topNotes[0][0] : 'None';
    const avgSillage = Math.round(owned.reduce((s,f)=>s+f.sillage,0)/owned.length * 10) / 10;
    
    let personaHtml = '';
    if (owned.length >= 3) {
      const archId = computeCollectionArchetype(stats);
      const arch = store.ARCHETYPES[archId];
      personaHtml = `
        <div class="dna-divider">
          <div class="sec-label">Your Olfactive Persona</div>
          <div class="text-title" style="color:var(--accent-primary);">${arch.name}</div>
          <div class="text-meta" style="font-family:var(--font-serif); opacity:0.8;">${arch.tagline}</div>
        </div>
      `;
    }

    const gapRec = getGapRecommendation(stats);
    let gapHtml = '';
    if (gapRec) {
      gapHtml = `
        <div class="sec-label" style="margin-top:var(--sp-xl);">Collection Gap</div>
        <div class="text-meta" style="font-family:var(--font-serif); margin-bottom:var(--sp-sm);">
          Your collection is currently low on <strong>${gapRec.label}</strong>. Consider exploring:
        </div>
        <button class="list-item list-item--compact cmp-sug-card" style="margin-top:var(--sp-sm);" onclick="openFragDetail(CAT_MAP['${gapRec.frag.id}'])">
          <div class="picker-fdot" style="background:${(FAM[gapRec.frag.family]||{}).color}"></div>
          <div class="list-item-body">
            <div class="list-item-name">${gapRec.frag.name}</div>
            <div class="list-item-meta">${gapRec.frag.brand} · To fill the gap</div>
          </div>
        </button>
      `;
    }

    dnaSec.innerHTML = `
      <div class="sec-label" style="display:flex; justify-content:space-between; align-items:center;">
        Your Olfactive DNA
        <button class="nav-notes-btn" style="font-size:var(--fs-caption);" onclick="window.exportAuraCard()">Export</button>
      </div>
      <div class="cmp-sug-columns">
        <div>
          <div class="cmp-score-pct">${owned.length}</div>
          <div class="sec-label">Fragrances Owned</div>
        </div>
        <div>
          <div class="cmp-score-pct">${avgSillage}<span class="text-meta" style="font-weight:400; color:var(--text-tertiary);">/10</span></div>
          <div class="sec-label">Average Sillage</div>
        </div>
      </div>
      
      ${personaHtml}

      <div class="dna-stats">
        ${bars.map(b => `
          <div class="dna-stat">
            <div class="sec-label">${b.l}</div>
            <div class="cmp-score-meter">
              <div class="cmp-score-meter-track">
                <div class="cmp-score-meter-fill" style="width:${Math.round(b.v*100)}%; background:${b.c};"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="dna-divider">
        <div class="sec-label">Dominant Families</div>
        <div class="dna-families">
          ${stats.topFamilies.slice(0, 3).map(([fam, count]) => `
            <div class="chip" style="background:${FAM[fam]?.color||'#888'};">
              ${FAM[fam]?.label||fam} (${count})
            </div>
          `).join('')}
        </div>
        <div class="sec-label">Signature Material</div>
        <div class="dna-notes">
          You frequently gravitate towards <strong>${topNote}</strong>. Other core notes in your collection include ${stats.topNotes.slice(1, 5).map(n => n[0]).join(', ')}.
        </div>
        
        ${gapHtml}
      </div>
    `;
    container.appendChild(dnaSec);
  }

  // ── 2. SHOP YOUR STASH ──
  if (owned.length >= 2) {
    const pairs = window.getGoldenPairs(owned);
    if (pairs.length > 0) {
      const pairSec = document.createElement('div'); pairSec.style.marginBottom = 'var(--sp-3xl)';
      pairSec.innerHTML = `<div class="sec-label">Shop Your Stash (Golden Pairs)</div>`;
      const pairWrap = document.createElement('div'); pairWrap.className = 'carousel';
      pairs.forEach(p => {
        const card = document.createElement('div'); card.className = 'carousel-card carousel-card--wide';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--sp-sm);">
            <div class="dc-badge" style="background:var(--accent-primary); color:var(--paper); font-size:9px;">${p.score}% LAYER MATCH</div>
            <button class="settings-btn" style="padding:2px; opacity:0.6;" onclick="event.stopPropagation(); window.exportLayeringRecipe('${p.a.id}', '${p.b.id}', ${p.score})" aria-label="Export layering recipe">⤓</button>
          </div>
          <div class="dc-sim-name">${p.a.name}</div>
          <div class="dc-sim-brand" style="font-size:10px; margin-bottom:var(--sp-xs);">+ ${p.b.name}</div>
          <div class="dc-sim-reason" style="font-family:var(--font-serif); line-height:1.3;">${engine.getSwapReason(p.a, p.b, store.FAM_COMPAT).replace('An alternative', 'Layers well')}</div>
        `;
        card.onclick = () => { _selectFragForSlot('a', p.a); _selectFragForSlot('b', p.b); go('compare'); };
        pairWrap.appendChild(card);
      });
      const cw = document.createElement('div'); cw.className = 'carousel-wrap'; cw.appendChild(pairWrap);
      pairSec.appendChild(cw); container.appendChild(pairSec);
    }
  }

  renderCollectionSection(container, 'Owned', owned, 'frags');
  renderCollectionSection(container, 'Wishlist', wished, 'frags');
  renderCollectionSection(container, 'Saved Notes', notes, 'notes');
  renderCollectionSection(container, 'Saved Brands', brands, 'brands');
};

/* Similarity scoring: 0–100 across family, notes, sillage, roles */
const _simCache={};
function scoreSimilarity(a,b){
  return engine.scoreSimilarity(a, b, store.FAM_COMPAT);
}

/* Layering compatibility score: higher = better layering pair (different sillage + complementary families + unique notes) */
const _layCache={};
function scoreLayeringPair(a,b){
  return engine.scoreLayeringPair(a, b, store.FAM_COMPAT);
}

/* Classify how a candidate relates to a source frag for discover shelf */
function classifyDiscovery(source,candidate){
  const compat=FAM_COMPAT[source.family]?.[candidate.family]??0.5;
  const score=scoreSimilarity(source,candidate);
  if(compat>=0.7&&score>=55)return{type:'similar',label:'Similar'};
  if(compat<0.45)return{type:'contrasts',label:'Contrasts'};
  return{type:'complements',label:'Complements'};
}

/* Role assignments: roleId → ordered array of fragId (index 0 = primary) */
let RA={};
try { RA=JSON.parse(localStorage.getItem('scentmap_ra')||'{}') || {}; }
catch(e){ RA={}; try{localStorage.removeItem('scentmap_ra')}catch(_){} }
function _saveRA(){try{localStorage.setItem('scentmap_ra',JSON.stringify(RA));}catch(_){}}
function getAssigned(roleId){return RA[roleId]||[]}
function getPrimary(roleId){return getAssigned(roleId)[0]||null}
function assignFrag(roleId,fragId){
  if(!RA[roleId])RA[roleId]=[];
  // Remove if already present
  const idx=RA[roleId].indexOf(fragId);
  if(idx!==-1){RA[roleId].splice(idx,1);_saveRA();return}
  // Otherwise add (push to end if not primary, or prepend to make primary)
  RA[roleId].push(fragId);_saveRA();
}
function makePrimary(roleId,fragId){
  if(!RA[roleId])RA[roleId]=[];
  const idx=RA[roleId].indexOf(fragId);
  if(idx===-1)RA[roleId].unshift(fragId);
  else{RA[roleId].splice(idx,1);RA[roleId].unshift(fragId);}
  _saveRA();
}
function removeFromRole(roleId,fragId){
  if(!RA[roleId])return;
  RA[roleId]=RA[roleId].filter(id=>id!==fragId);
  _saveRA();
}
function getFragRoleStatus(fragId,roleId){
  const arr=getAssigned(roleId);
  const idx=arr.indexOf(fragId);
  if(idx===-1)return'none';
  if(idx===0)return'primary';
  return idx+1; // numeric position
}
function getAllRolesForFrag(fragId){
  const result={};
  ROLES.forEach(r=>{
    const s=getFragRoleStatus(fragId,r.id);
    if(s!=='none')result[r.id]=s;
  });
  return result;
}

// Defaults (only applied when no saved assignments exist)
if(!Object.keys(RA).length){
  [['casual','gypsy-water'],['signature','endeavour'],['cold','eleventh-hour'],['creative','oronardo']]
    .forEach(([r,f])=>{if(!RA[r])RA[r]=[];RA[r].push(f)});
  _saveRA();
}



/* ══ DESKTOP DETAIL STACK ══════════════════════════════════════════ */
function isDesktop(){return window.innerWidth>=1100}
function isTablet(){return window.innerWidth>=768&&window.innerWidth<1100}

const detailStack=[];
function openDesktopDetail(renderFn){
  detailStack.length=0;
  detailStack.push(renderFn);
  _renderDeskDetail();
  document.getElementById('col-detail').classList.add('open');
  if(isTablet())document.getElementById('detail-scrim').classList.add('open');
  _trapFocus(document.getElementById('col-detail'));
}
function pushDesktopDetail(renderFn){
  detailStack.push(renderFn);
  _renderDeskDetail(true);
  _trapFocus(document.getElementById('col-detail'));
}
function _renderDeskDetail(animateIn, animClass){
  const top=detailStack[detailStack.length-1];if(!top)return;
  const inner=document.getElementById('detail-inner');
  if(!inner)return;
  inner.classList.remove('slide');
  if(animClass){inner.classList.remove('slide-left','slide-right');}
  inner.innerHTML='';
  top(inner);
  // Scroll to top on every new detail render
  const col=document.getElementById('col-detail');
  if(col) col.scrollTop=0;
  document.getElementById('detail-back')?.classList.toggle('visible',detailStack.length>1);
  if(animateIn){inner.offsetWidth;inner.classList.add('slide')}
  if(animClass){inner.offsetWidth;inner.classList.add(animClass)}
}
function closeDesktopDetail(){
  const len=detailStack.length;
  detailStack.length=0;
  document.getElementById('col-detail')?.classList.remove('open');
  document.getElementById('detail-scrim')?.classList.remove('open');
  for(let i=0;i<len;i++)_returnFocus();
}
function popDesktopDetail(){
  if(detailStack.length<=1){closeDesktopDetail();return}
  detailStack.pop();_renderDeskDetail();
  _returnFocus();
}
document.getElementById('detail-back')?.addEventListener('click',popDesktopDetail);
document.getElementById('detail-close-btn')?.addEventListener('click',closeDesktopDetail);
document.getElementById('detail-scrim')?.addEventListener('click',closeDesktopDetail);

/* ══ BODY SCROLL LOCK (iOS-compatible) ════════════════════════════ */
let _scrollLocked=false,_lockY=0;
function lockBodyScroll(){
  if(_scrollLocked)return;
  _lockY=window.scrollY;
  document.body.style.cssText+=`;position:fixed;top:-${_lockY}px;width:100%;overflow-y:scroll`;
  _scrollLocked=true;
}
function unlockBodyScroll(){
  if(!_scrollLocked)return;
  document.body.style.position='';
  document.body.style.top='';
  document.body.style.width='';
  document.body.style.overflowY='';
  window.scrollTo(0,_lockY);
  _scrollLocked=false;
}

/* ══ MOBILE SHEET STACK ════════════════════════════════════════════ */
let _globalLongPressTimer = null; // module-level so closeAllSheets can clear it
const sheetStack=[];
function pushSheet(renderFn,title){
  const isSubNav=sheetStack.length>0;
  if(!sheetStack.length)lockBodyScroll();
  const overlay=document.getElementById('sheet-stack');
  const el=document.createElement('div');
  el.className='sheet'+(isSubNav?' nav':'');
  el.innerHTML=`<div class="sheet-inner"><div class="sheet-handle" aria-hidden="true"></div>
    <div class="sheet-topbar">
      <button class="sheet-back hidden"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="vertical-align:-2px;margin-right:2px" aria-hidden="true"><path d="M9 3L5 7l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>Back</button>
      ${title?`<div class="sheet-title">${title}</div>`:''}
      <button class="sheet-close" aria-label="Close">Close</button>
    </div>
    <div class="sheet-content"></div></div>`;
  const handle=el.querySelector('.sheet-topbar'); // Drag from the whole topbar
  let ds=null;
  let _swipeStartTime = 0;
  handle.addEventListener('touchstart',e=>{
    ds=e.touches[0].clientY;
    _swipeStartTime = Date.now();
    el.style.transition = 'none';
  },{passive:true});
  handle.addEventListener('touchmove',e=>{
    if(ds===null)return;
    const dy=e.touches[0].clientY-ds;
    if(dy>0) {
      el.style.transform=`translateY(${dy}px)`;
    } else {
      // Rubber-band resistance if pulled up
      el.style.transform=`translateY(${dy * 0.25}px)`;
    }
  },{passive:true});
  handle.addEventListener('touchend',e=>{
    const dy=e.changedTouches[0].clientY-(ds||0);
    const elapsed = Date.now() - _swipeStartTime;
    const velocity = elapsed > 0 ? dy / elapsed : 0; // px/ms
    el.style.transition = 'transform 0.28s var(--ease-spring)';
    if(dy > 80 || velocity > 0.3) {
      el.style.transform='translateY(100%)';
      popSheet();
    } else {
      el.style.transform='';
    }
    ds=null;
  });
  el.querySelector('.sheet-close').addEventListener('click',closeAllSheets);
  el.querySelector('.sheet-back').addEventListener('click',popSheet);
  overlay.appendChild(el);sheetStack.push(el);
  updateSheetPos();
  requestAnimationFrame(()=>{el.classList.add('visible');overlay.classList.add('has-sheets')});
  renderFn(el.querySelector('.sheet-content'));
  updateSheetBacks();
  _trapFocus(el);
}
function popSheet(){
  if(!sheetStack.length)return;
  const top=sheetStack.pop();
  top.classList.remove('visible');
  top.classList.remove('under');
  top.addEventListener('transitionend',()=>top.remove(),{once:true});
  updateSheetPos();updateSheetBacks();
  if(!sheetStack.length){
    document.getElementById('sheet-stack').classList.remove('has-sheets');
    unlockBodyScroll();
  }
  _returnFocus();
}
function closeAllSheets(){
  // Clear any pending long-press timer to prevent ghost opens
  if(_globalLongPressTimer){clearTimeout(_globalLongPressTimer);_globalLongPressTimer=null;}
  const all=[...sheetStack];sheetStack.length=0;
  all.forEach(s=>{
    s.style.transform='translateY(100%)';
    s.classList.remove('visible');
    s.classList.remove('under');
    s.addEventListener('transitionend',()=>s.remove(),{once:true});
  });
  document.getElementById('sheet-stack').classList.remove('has-sheets');
  unlockBodyScroll();
  // Return focus for each sheet closed, since we trap per-sheet
  all.forEach(() => _returnFocus());
}
function updateSheetPos(){sheetStack.forEach((s,i)=>{const t=i===sheetStack.length-1;s.classList.toggle('visible',t);s.classList.toggle('under',!t)})}
function updateSheetBacks(){sheetStack.forEach((s,i)=>s.querySelector('.sheet-back').classList.toggle('hidden',i===0))}
document.getElementById('sheet-backdrop').addEventListener('click',closeAllSheets);

/* ══ OPEN HELPERS ══════════════════════════════════════════════════ */
function openDetail(renderFn,title){
  if(isDesktop()||isTablet())openDesktopDetail(renderFn);
  else pushSheet(c=>renderFn(c),title);
}
window.openDetail = openDetail;

function pushDetail(renderFn,title){
  if(isDesktop()||isTablet())pushDesktopDetail(renderFn);
  else pushSheet(c=>renderFn(c),title);
}
window.pushDetail = pushDetail;

function openFragDetail(frag){
  // Write to sessionStorage recents for universal search
  try {
    const recent = JSON.parse(sessionStorage.getItem('sm_recent') || '[]');
    const next = [frag.id, ...recent.filter(id => id !== frag.id)].slice(0, 5);
    sessionStorage.setItem('sm_recent', JSON.stringify(next));
  } catch(e) { /* storage unavailable — silently skip */ }
  openDetail(c=>renderFragDetail(c,frag),frag.name);
}
window.openFragDetail = openFragDetail;

function linkNotes(arr){
  return arr.map(n=>{
    const key=n.toLowerCase();const note=NI_MAP[key];
    const savedMark = note && isNoteSaved(note.name) ? ' <span style="color:var(--accent);margin-left:2px;font-size:0.85em;text-decoration:none;display:inline-block;">★</span>' : '';
    return note?`<button class="cmp-note-pill" data-note="${n}">${n}${savedMark}</button>`: `<span class="cmp-note-pill">${n}</span>`;
  }).join('');
}

function openDupeLab(anchor) {
  trackEvent('dupe_lab_opened', { source: anchor.id });
  openDetail(container => renderDupeLab(container, anchor), `Dupes for ${anchor.name}`);
}

function renderDupeLab(container, anchor) {
  const dupes = CAT
    .filter(f => f.id !== anchor.id)
    .map(f => ({ f, score: scoreSimilarity(anchor, f) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  container.innerHTML = `
    <div class="dc-name">Dupe Lab</div>
    <div class="dc-brand" style="margin-bottom:var(--sp-xl);">Finding matches for ${anchor.name}</div>
    
    <div class="dupe-list" style="display: flex; flex-direction: column; gap: var(--sp-md);">
      ${dupes.map(({f, score}) => {
        const fm = FAM[f.family] || {label: f.family, color:'#888'};
        const reason = getSwapReason(anchor, f);
        return `
          <div class="list-item list-item--flat cmp-sug-card dupe-item" style="display: block; padding: var(--sp-md); cursor: default;">
            <div class="dupe-item-head" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--sp-xs);">
              <div class="list-item-name" style="font-size: var(--fs-body);">${f.name}</div>
              <div class="list-item-score">${score}%</div>
            </div>
            <div class="list-item-sub" style="margin-bottom: var(--sp-sm);">${f.brand} · ${fm.label}</div>

            <div class="cmp-score-meter" style="margin-bottom: var(--sp-sm);">
              <div class="cmp-score-meter-track">
                <div class="cmp-score-meter-fill" style="width:${score}%; background:var(--accent-primary);"></div>
              </div>
            </div>

            <div class="list-item-meta" style="margin-bottom: var(--sp-sm); line-height: var(--lh-normal); color: var(--text-secondary);">${reason}</div>

            <details style="margin-bottom: var(--sp-sm);">
              <summary style="font-size: var(--fs-caption); font-family: var(--font-sans); font-weight: 600; color: var(--text-tertiary); cursor: pointer; list-style: none; display: flex; align-items: center; gap: var(--sp-xs);">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                Why this matches
              </summary>
              <div class="dupe-breakdown" style="margin-top: var(--sp-sm); padding-top: var(--sp-sm); border-top: 1px dashed var(--border-subtle); font-size: var(--fs-caption); color: var(--text-tertiary); display: flex; flex-direction: column; gap: var(--sp-xs);">
                ${(() => {
                  const famScore = (FAM_COMPAT[anchor.family]?.[f.family] ?? 0.5) * 40;
                  const shBase = anchor._nBase.filter(n => f._nBase.includes(n)).length;
                  const shMid = anchor._nMid.filter(n => f._nMid.includes(n)).length;
                  const shTop = anchor._nTop.filter(n => f._nTop.includes(n)).length;
                  const noteScore = Math.min(30, shBase * 5 + shMid * 3 + shTop * 2);
                  const sillDiff = Math.abs(anchor.sillage - f.sillage);
                  const sillScore = sillDiff <= 2 ? 10 : sillDiff <= 4 ? 5 : 0;
                  const shRoles = anchor.roles.filter(r => f.roles.includes(r)).length;
                  const roleScore = Math.min(20, shRoles * 7);

                  return `
                    <div class="dupe-breakdown-row" style="display: flex; justify-content: space-between;"><span>Family match</span><span>${Math.round(famScore)}/40</span></div>
                    <div class="dupe-breakdown-row" style="display: flex; justify-content: space-between;"><span>Note overlap</span><span>${Math.round(noteScore)}/30</span></div>
                    <div class="dupe-breakdown-row" style="display: flex; justify-content: space-between;"><span>Sillage proximity</span><span>${sillScore}/10</span></div>
                    <div class="dupe-breakdown-row" style="display: flex; justify-content: space-between;"><span>Role alignment</span><span>${roleScore}/20</span></div>
                  `;
                })()}
              </div>
            </details>

            <button class="s-name-btn" style="font-size: var(--fs-meta);" onclick="event.stopPropagation(); trackEvent('dupe_clicked', { source: '${anchor.id}', target: '${f.id}', score: ${score} }); pushDetail(c => renderFragDetail(c, CAT_MAP['${f.id}']), '${f.name.replace(/'/g, "\\'")}')">View Details →</button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderFragDetail(container,frag){
  const fm=FAM[frag.family]||{label:frag.family,color:'#888'};

  // Handle quiz attribution
  let quizAttribution = '';
  const hash = window.location.hash;
  if (hash.includes('source=quiz')) {
    const archMatch = hash.match(/archetype=([a-z0-9-]+)/);
    if (archMatch && archMatch[1]) {
      const arch = ARCHETYPES[archMatch[1]];
      if (arch) {
        quizAttribution = `
          <div class="dc-quiz-attribution" style="padding:var(--sp-sm) var(--sp-md); background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-md); font-family:var(--font-sans); font-size:var(--fs-meta); color:var(--text-secondary); display:flex; align-items:center; gap:var(--sp-xs);">
            <span style="font-size:1.2em;">✨</span> From your scent archetype: <strong style="color:var(--text-primary);">${arch.name}</strong>
          </div>`;
      }
    }
  }

  container.innerHTML=`
    ${quizAttribution}
    <div>
      <div class="dc-name">${frag.name}</div>
      <button class="dc-brand-btn" style="margin-bottom: var(--sp-sm);">${frag.brand}</button>
      <br>
      <div class="chip" style="background:${fm.color};">
        <span style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.3);display:inline-block;flex-shrink:0"></span>
        ${fm.label}
      </div>
    </div>
    <div class="dc-collect-row" id="dc-collect-${frag.id}"></div>
    ${frag.description?`<div class="dc-description">${frag.description}</div>`:''}
    ${frag.story?`<div class="dc-story">${frag.story}</div>`:''}
    ${frag.url?`<a href="${frag.url}" target="_blank" rel="noopener" class="dc-collect-btn">Buy from ${frag.brand}</a>`:''}
    <div class="sec-label">Compare with</div>
    <div class="dc-cmp-ctas" id="dc-ctas-${frag.id}"></div>
    <button class="dc-collect-btn" id="find-dupes-${frag.id}" style="width:100%; justify-content:center;">
      <span class="dc-collect-icon">🔍</span> Find Dupes in Catalog
    </button>
    <div class="dc-stats">
      <div class="dc-stat"><div class="sec-label">Sillage</div><div class="dc-bar"><div class="dc-fill" style="width:${frag.sillage*10}%"></div></div><div class="dc-sval">${frag.sillage}/10 — ${SW[frag.sillage]}</div></div>
      <div class="dc-stat"><div class="sec-label">Structure</div><div class="dc-bar"><div class="dc-fill" style="width:${frag.layering*10}%"></div></div><div class="dc-sval">${frag.layering}/10 — ${LW[frag.layering]}</div></div>
    </div>
    <div class="dc-div"></div>
    <div class="sec-label">Sensory Profile</div>
    <div class="dc-stats">
      ${(() => {
        const p = computeProfile(frag);
        const bar = (label, val, color) => `
          <div class="dc-stat">
            <div class="sec-label">${label}</div>
            <div class="cmp-score-meter">
              <div class="cmp-score-meter-track">
                <div class="cmp-score-meter-fill" style="width:${Math.round(val*100)}%; background:${color};"></div>
              </div>
            </div>
          </div>`;
        return bar('Fresh', p.freshness, 'var(--fam-citrus)') +
               bar('Sweet', p.sweetness, 'var(--fam-floral)') +
               bar('Warm', p.warmth, 'var(--fam-amber)');
      })()}
    </div>

    <div class="sec-label">Scent Journey</div>
    <div>
      <div class="journey-timeline">
        <div class="journey-step">
          <div class="journey-dot"></div>
          <div class="journey-step-title">Opening <span class="journey-step-meta">(Top Notes)</span></div>
          <div class="dc-nv">${linkNotes(frag.top)}</div>
        </div>
        <div class="journey-step">
          <div class="journey-dot"></div>
          <div class="journey-step-title">Heart <span class="journey-step-meta">(Mid Notes)</span></div>
          <div class="dc-nv">${linkNotes(frag.mid)}</div>
        </div>
        <div class="journey-step">
          <div class="journey-dot journey-dot--filled"></div>
          <div class="journey-step-title">Dry Down <span class="journey-step-meta">(Base Notes)</span></div>
          <div class="dc-nv">${linkNotes(frag.base)}</div>
        </div>
      </div>
      <p class="journey-caveat">Key materials only — simplified pyramid</p>
    </div>`;

  // Note links
  const brandBtn=container.querySelector('.dc-brand-btn');
  if(brandBtn)brandBtn.addEventListener('click',e=>{e.stopPropagation();openHouseDetail(frag.brand);});
  container.querySelectorAll('.cmp-note-pill[data-note]').forEach(btn=>{
    btn.addEventListener('click',e=>{e.stopPropagation();const note=NI_MAP[btn.dataset.note.toLowerCase()];if(note)pushDetail(c=>renderNoteDetail(c,note),note.name)});
  });

  // Collection action row
  function renderCollectRow(){
    const el=container.querySelector(`#dc-collect-${frag.id}`);if(!el)return;
    const st=gst(frag.id);
    el.innerHTML='';
    const wishBtn=document.createElement('button');
    wishBtn.className='dc-collect-btn'+(st==='wish'?' active':'');
    wishBtn.setAttribute('aria-pressed',st==='wish'?'true':'false');
    wishBtn.innerHTML=`<span class="dc-collect-icon">${st==='wish'?'♥':'♡'}</span> Wishlist`;
    wishBtn.addEventListener('click',e=>{e.stopPropagation();setState(frag.id,st==='wish'?'none':'wish');refreshAfterStateChange(frag.id);renderCollectRow();});
    const ownBtn=document.createElement('button');
    ownBtn.className='dc-collect-btn'+(st==='owned'?' active':'');
    ownBtn.setAttribute('aria-pressed',st==='owned'?'true':'false');
    ownBtn.innerHTML=`<span class="dc-collect-icon">${st==='owned'?'✓':''}</span> ${st==='owned'?'Owned':'Mark owned'}`;
    ownBtn.addEventListener('click',e=>{e.stopPropagation();setState(frag.id,st==='owned'?'none':'owned');refreshAfterStateChange(frag.id);renderCollectRow();});
    
    const trialBtn=document.createElement('button');
    trialBtn.className='dc-collect-btn';
    trialBtn.innerHTML=`<span class="dc-collect-icon">⏱</span> Track Trial`;
    trialBtn.addEventListener('click',e=>{e.stopPropagation();window.openTrialSheet(frag.id);});

    const shareBtn=document.createElement('button');
    shareBtn.className='dc-collect-btn';
    shareBtn.setAttribute('aria-label','Copy shareable link to this fragrance');
    shareBtn.innerHTML=`<span class="dc-collect-icon">↗</span> Share`;
    shareBtn.addEventListener('click',e=>{
      e.stopPropagation();
      const url=location.origin+location.pathname+'#frag='+frag.id;
      navigator.clipboard.writeText(url).then(()=>{
        shareBtn.innerHTML=`<span class="dc-collect-icon">✓</span> Copied`;
        shareBtn.classList.add('active');
        setTimeout(()=>{shareBtn.innerHTML=`<span class="dc-collect-icon">↗</span> Share`;shareBtn.classList.remove('active');},2000);
      });
    });

    el.appendChild(wishBtn);el.appendChild(ownBtn);el.appendChild(trialBtn);el.appendChild(shareBtn);
  }
  renderCollectRow();

  // Compare CTAs
  _buildCompareCTAs(frag,container.querySelector(`#dc-ctas-${frag.id}`));

  // Find Dupes button
  const dupeBtn = container.querySelector(`#find-dupes-${frag.id}`);
  if(dupeBtn) dupeBtn.addEventListener('click', e => {
    e.stopPropagation();
    openDupeLab(frag);
  });

  // Similar shelf
  const scored=CAT
    .filter(f=>f.id!==frag.id)
    .map(f=>({f,score:scoreSimilarity(frag,f)}))
    .filter(x=>x.score>=30)
    .sort((a,b)=>b.score-a.score)
    .slice(0,5);

  _setupDetailSwipe(container, frag);

  if(scored.length){
    const lbl=document.createElement('div');
    lbl.className='sec-label';lbl.textContent='More like this';
    container.appendChild(lbl);
    const shelf=document.createElement('div');shelf.className='dc-sim-shelf';

    scored.forEach(({f})=>{
      const fm2=FAM[f.family]||{color:'#888'};
      const famLabel2=(FAM[f.family]||{label:f.family}).label;
      const reason=getSwapReason(frag,f);
      const badge=classifyDiscovery(frag,f);
      const row=document.createElement('button');
      row.className='list-item list-item--flat cmp-sug-card';
      row.innerHTML=`
        <div class="list-item-content">
          <div class="list-item-dot" style="background:${fm2.color}"></div>
          <div class="list-item-body" style="flex:1;text-align:left;">
            <div class="list-item-name">${f.name}</div>
            <div class="list-item-sub">${f.brand} · ${famLabel2}</div>
            ${reason ? `<div class="dc-sim-reason">${reason}</div>` : ''}
          </div>
          ${badge&&badge.type!=='similar'?`<div style="flex-shrink:0"><span class="dc-badge ${badge.type}">${badge.label}</span></div>`:''}
        </div>`;
      row.addEventListener('click',e=>{e.stopPropagation();pushDetail(c=>renderFragDetail(c,f),f.name);});
      shelf.appendChild(row);
    });
    container.appendChild(shelf);
  }
}

/* ── Compare CTAs in detail panel ── */
function _buildCompareCTAs(frag,container){
  if(!container)return;
  function makeBtn(existingFrag,targetSlot){
    const fcSelf=getCmpFam(frag.family);
    const fcOther=existingFrag?getCmpFam(existingFrag.family):null;
    const btn=document.createElement('button');
    btn.className='dc-collect-btn dc-cmp-btn';
    const inner=existingFrag
      ?`<span class="dc-cmp-btn-dot" style="background:${fcSelf.accent}"></span>
        <span class="dc-cmp-btn-name">${frag.name}</span>
        <span class="dc-cmp-btn-vs">vs</span>
        <span class="dc-cmp-btn-dot" style="background:${fcOther.accent}"></span>
        <span class="dc-cmp-btn-name">${existingFrag.name}</span>`
      :`<span class="dc-cmp-btn-dot" style="background:${fcSelf.accent}"></span>
        <span class="dc-cmp-btn-name dc-cmp-btn-empty">Compare with ${frag.name}</span>`;
    btn.innerHTML=`
      <span class="dc-cmp-btn-text" style="display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden">${inner}</span>
      <span class="dc-cmp-btn-arrow"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2L10 7l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
    btn.addEventListener('click',()=>{
      window.haptic?.('medium');
      if(existingFrag){
        const otherSlot=targetSlot==='a'?'b':'a';
        _selectFragForSlot(otherSlot,frag);
      }else{
        _selectFragForSlot(targetSlot,frag);
      }
      go('compare',null);
      closeDesktopDetail?.();
      closeAllSheets?.();
    });
    return btn;
  }
  container.appendChild(makeBtn(CMP_A,'a'));
  container.appendChild(makeBtn(CMP_B,'b'));
}

function buildLayerSuggestions(frag,container){
  const owned=CAT.filter(f=>isOwned(f.id)&&f.id!==frag.id);
  if(!owned.length)return;
  function layerReason(a,b){
    const sillDiff=b.sillage-a.sillage;
    if(Math.abs(sillDiff)>=3)return sillDiff>0?`Wear ${b.name} over — projects further`:`Wear ${b.name} under — anchors the blend`;
    const allA=a._nAll;
    const uniqueB=[...b.base,...b.mid].find((n,i)=>!allA.includes(i<b.base.length?b._nBase[i]:b._nMid[i-b.base.length]));
    if(uniqueB)return`Adds ${uniqueB}`;
    return`${FAM[b.family]?.label||b.family} × ${FAM[a.family]?.label||a.family}`;
  }
  const candidates=owned
    .map(f=>({f,score:scoreLayeringPair(frag,f)}))
    .filter(x=>x.score>=40)
    .sort((a,b)=>b.score-a.score)
    .slice(0,2);
  if(!candidates.length)return;
  const lbl=document.createElement('div');
  lbl.className='sec-label';lbl.textContent='Layer with what you own';
  container.appendChild(lbl);
  const shelf=document.createElement('div');shelf.className='dc-sim-shelf';
  candidates.forEach(({f,score})=>{
    const fm2=FAM[f.family]||{color:'#888'};
    const reason=layerReason(frag,f);
    const row=document.createElement('button');
    row.className='list-item list-item--flat cmp-sug-card';
    row.innerHTML=`
      <div class="list-item-content">
        <div class="list-item-dot" style="background:${fm2.color}"></div>
        <div class="list-item-body" style="flex:1">
          <div class="list-item-name">${f.name} <span class="dc-sim-brand-btn" style="color:var(--text-secondary);font-size:var(--fs-meta);font-weight:normal">· ${f.brand}</span></div>
          ${reason ? `<div class="dc-sim-reason" style="margin-bottom: 2px">${reason}</div>` : ''}
        </div>
        <div style="flex-shrink:0; display:flex; align-items:center; gap: 4px;">
          <span class="dc-layer-score-badge">${score}</span>
          <span class="dc-sim-state is-owned">Owned</span>
        </div>
      </div>`;
    row.addEventListener('click',e=>{e.stopPropagation();pushDetail(c=>renderFragDetail(c,f),f.name);});
    shelf.appendChild(row);
  });
  container.appendChild(shelf);
  container.querySelectorAll('.dc-sim-brand-btn').forEach(btn => {
    btn.addEventListener('click',e=>{e.stopPropagation();openHouseDetail(btn.textContent.replace(' · ','').trim());});
  });
}

function buildRoleChips(frag,chipsEl){
  if(!chipsEl)return;
  chipsEl.innerHTML='';
  ROLES.forEach(role=>{
    const status=getFragRoleStatus(frag.id,role.id);
    const isPrimary=status==='primary';
    const isSecondary=typeof status==='number';
    const chip=document.createElement('button');
    chip.className='chip chip--outline'+(isPrimary?' assigned-primary':isSecondary?' assigned-secondary':'');
    let orderLabel='';
    if(isPrimary)orderLabel='<span class="chip-order">✓</span>';
    else if(isSecondary)orderLabel=`<span class="chip-order">${status}</span>`;
    const addIcon=(!isPrimary&&!isSecondary)?'<span class="chip-add">+</span>':'';
    chip.innerHTML=`<span class="chip-sym">${role.sym}</span> ${role.name}${orderLabel}${addIcon}`;
    chip.title=isPrimary?`Remove ${frag.name} from ${role.name}`
      :isSecondary?`Make ${frag.name} primary for ${role.name}`
      :`Assign ${frag.name} to ${role.name}`;

    chip.addEventListener('click',e=>{
      e.stopPropagation();
      if(isPrimary){
        // Remove from role entirely
        removeFromRole(role.id,frag.id);
      } else if(isSecondary){
        // Promote to primary
        makePrimary(role.id,frag.id);
      } else {
        // Add (as last)
        assignFrag(role.id,frag.id);
        window.haptic?.('success');
      }
      buildRoleChips(frag,chipsEl);
    });
    chipsEl.appendChild(chip);
  });
}

function renderNoteSaveBtn(container, note) {
  if (!container) return;
  const isSaved = isNoteSaved(note.name);
  container.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'dc-collect-btn' + (isSaved ? ' active' : '');
  btn.style.marginTop = '0';
  btn.innerHTML = `<span class="dc-collect-icon">${isSaved ? '★' : '☆'}</span> ${isSaved ? 'Saved Note' : 'Save Note'}`;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    toggleNoteSaved(note.name);
    window.haptic?.('success');
    renderNoteSaveBtn(container, note);
    if (window.buildNotes) buildNotes();
  });
  container.appendChild(btn);
}

function renderNoteDetail(container,note){
  const fm=FAM[note.family]||{label:note.family,color:'#888'};
  const nl=note.name.toLowerCase();
  const inf=CAT.filter(f=>f._nAll.includes(nl));
  const saveId = `nd-save-${note.name.replace(/\s+/g,'-')}`;
  container.innerHTML=`
    <div>
      <div class="np-name">${note.name}</div>
      <div class="np-family">${fm.label}</div>
    </div>
    <div class="np-desc">${note.desc}</div>
    <div id="${saveId}"></div>
    ${note.extraction_method?`<div style="font-size:var(--fs-caption); color:var(--g500);"><strong>Extraction:</strong> ${note.extraction_method}</div>`:''}
    ${note.insider_fact?`<div class="np-insight"><strong>Perfumer's Insight</strong>${note.insider_fact}</div>`:''}
    ${inf.length?`<div class="np-frags"><div class="sec-label">In catalog (${inf.length})</div><div id="_nfl" class="np-frags-list"></div></div>`:''}`;

  renderNoteSaveBtn(container.querySelector(`#${saveId}`), note);

  if(inf.length){
    const span=container.querySelector('#_nfl');
    [...inf].sort((a,b)=>a.name.localeCompare(b.name)).forEach(f=>{
      const fc=getCmpFam(f.family);
      const btn=document.createElement('button');btn.className='list-item list-item--compact';
      btn.innerHTML=`<div class="list-item-dot" style="background:${fc.accent}"></div><div class="list-item-body"><div class="list-item-name">${f.name}</div><div class="list-item-sub">${f.brand}</div></div>`;
      btn.addEventListener('click',e=>{e.stopPropagation();pushDetail(c=>renderFragDetail(c,f),f.name);});
      span.appendChild(btn);
    });
  }
}

function renderBrandSaveBtn(container, brandData) {
  if (!container) return;
  container.innerHTML = '';
  const saved = isBrandSaved(brandData.id);
  const btn = document.createElement('button');
  btn.className = 'dc-collect-btn' + (saved ? ' active' : '');
  btn.innerHTML = `<span class="dc-collect-icon">${saved ? '★' : '☆'}</span> ${saved ? 'Saved Brand' : 'Save Brand'}`;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    toggleBrandSave(brandData.id);
    window.haptic?.('success');
    renderBrandSaveBtn(container, brandData);
    if (window.renderSaved) window.renderSaved();
  });
  container.appendChild(btn);
}

function renderHouseDetail(container,brand){
  const frags=CAT.filter(f=>f.brand===brand).sort((a,b)=>a.name.localeCompare(b.name));
  const houseData = BRANDS_MAP[brand.toLowerCase()];

  // Calculate family percentages
  const famCounts = {};
  frags.forEach(f => {
    famCounts[f.family] = (famCounts[f.family] || 0) + 1;
  });
  const famStats = Object.entries(famCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .map(([fam, count]) => ({
      family: fam,
      label: FAM[fam]?.label || fam,
      color: FAM[fam]?.color || '#888',
      pct: (count / frags.length) * 100
    }));

  const barHTML = famStats.map(f => `<div style="height:100%; width:${f.pct}%; background:${f.color};" title="${f.label} (${Math.round(f.pct)}%)"></div>`).join('');
  const legendHTML = famStats.map(f => `<div style="display:inline-flex; align-items:center; margin-right:var(--sp-md); font-size:var(--fs-meta); color:var(--text-secondary);"><span style="display:inline-block; width:8px; height:8px; border-radius:var(--radius-circle); background:${f.color}; margin-right:var(--sp-xs);"></span>${f.label}</div>`).join('');

  let topCount = 0;
  if (frags.length >= 10) topCount = 5;
  else if (frags.length >= 5) topCount = 3;
  else if (frags.length >= 1) topCount = 2;

  // We'll just take the first N fragrances in the sorted array
  const topFrags = frags.slice(0, topCount);

  container.innerHTML=`<div class="house-detail-wrap" style="display:flex; flex-direction:column; gap:var(--sp-xl);">
    <div class="house-detail-name">${brand}</div>
    ${houseData && houseData.desc ? `<div class="dc-description">${houseData.desc}</div>` : ''}
    <div id="house-brand-save-wrap"></div>
    ${houseData && houseData.url ? `<a href="${houseData.url}" target="_blank" rel="noopener" class="dc-collect-btn">Visit ${brand} Website</a>` : ''}
    ${brand.toLowerCase() === 'byredo' ? `<button class="dc-collect-btn byredo-quiz-btn" style="display:flex; justify-content:center; background:var(--g100); color:var(--g900); border:1px solid var(--g300);">Find Your Byredo (Concierge Quiz)</button>` : ''}

    <div>
      <div class="sec-label">Fragrance Families</div>
      <div style="height:var(--sp-sm); width:100%; display:flex; border-radius:var(--radius); overflow:hidden; margin-bottom:var(--sp-sm);">${barHTML}</div>
      <div style="display:flex; flex-wrap:wrap; gap:var(--sp-xs);">${legendHTML}</div>
    </div>

    ${topFrags.length > 0 ? `
    <div class="house-known-for">
      <div class="sec-label">Known For</div>
      <div class="carousel-wrap">
        <div class="carousel" id="house-known-for-carousel"></div>
      </div>
    </div>
    ` : ''}

    <div>
      <div class="house-detail-count">${frags.length} fragrance${frags.length!==1?'s':''}</div>
      <div class="house-detail-list" id="house-list-${brand.replace(/\s+/g,'-')}"></div>
    </div>
  </div>`;

  const brandSaveWrap = container.querySelector('#house-brand-save-wrap');
  if (brandSaveWrap) {
    const bd = houseData || {id: brand.toLowerCase().replace(/\s+/g,'-'), name: brand};
    renderBrandSaveBtn(brandSaveWrap, bd);
  }

  if (topFrags.length > 0) {
    const carousel = container.querySelector('#house-known-for-carousel');
    topFrags.forEach(frag => {
      const fm = FAM[frag.family] || {color: '#888'};
      const card = document.createElement('div');
      card.className = 'carousel-card';
      card.innerHTML = `<div class="carousel-card-name list-item-name">${frag.name}</div>
        <div class="carousel-card-brand list-item-sub">${frag.brand}</div>
        <div class="carousel-card-family"><div class="fam-dot" style="background:${fm.color}"></div><span class="carousel-card-family-label">${fm.label}</span></div>`;
      card.addEventListener('click', e => { e.stopPropagation(); pushDetail(c => renderFragDetail(c, frag), frag.name); });
      carousel.appendChild(card);
    });
  }

  const list=container.querySelector('.house-detail-list');
  frags.forEach(frag=>{
    const fc=getCmpFam(frag.family);
    const btn=document.createElement('button');
    btn.className='list-item list-item--compact';
    btn.innerHTML=`<div class="list-item-dot" style="background:${fc.accent}"></div>
      <div class="list-item-body">
        <div class="list-item-name">${frag.name}</div>
        <div class="list-item-sub">${(FAM[frag.family]||{}).label||frag.family}</div>
      </div>`;
    btn.addEventListener('click',()=>{window.haptic?.('light');pushDetail(c=>renderFragDetail(c,frag),frag.name);});
    list.appendChild(btn);
  });

  const quizBtn = container.querySelector('.byredo-quiz-btn');
  if (quizBtn) {
    quizBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.haptic?.('medium');
      pushDetail(c => renderByredoQuiz(c), 'Find Your Byredo');
    });
  }
}
function openHouseDetail(brand){openDetail(c=>renderHouseDetail(c,brand),brand)}

function renderByredoQuiz(container) {
  const qs = [
    {
      q: "What is your ideal weekend?",
      a: [
        { label: "Exploring the city / Gallery hopping", tags: ["floral", "chypre", "creative"] },
        { label: "Relaxing in nature / Hiking", tags: ["green", "woody", "casual"] },
        { label: "Reading a book by the fire", tags: ["amber", "oud", "cold"] }
      ]
    },
    {
      q: "What fabric do you wear most?",
      a: [
        { label: "Crisp Cotton / Linen", tags: ["citrus", "aquatic", "heat"] },
        { label: "Leather / Denim", tags: ["leather", "woody", "signature"] },
        { label: "Silk / Cashmere", tags: ["amber", "floral", "intimate"] }
      ]
    },
    {
      q: "Do you prefer to blend in or stand out?",
      a: [
        { label: "Quiet luxury (Blend in)", tags: ["casual", "intimate", "work"] },
        { label: "Make a statement (Stand out)", tags: ["signature", "formal", "creative"] }
      ]
    }
  ];

  let step = 0;
  let collectedTags = [];

  function renderStep() {
    if (step >= qs.length) {
      renderResult();
      return;
    }
    const q = qs[step];
    container.innerHTML = `
      <div style="padding:var(--sp-lg) 0;">
        <div style="font-size:var(--fs-meta); color:var(--g500); margin-bottom:var(--sp-xs);">Question ${step + 1} of ${qs.length}</div>
        <div class="dc-name" style="margin-bottom:var(--sp-xl);">${q.q}</div>
        <div style="display:flex; flex-direction:column; gap:var(--sp-md);">
          ${q.a.map((ans, i) => `
            <button class="dc-collect-btn quiz-ans-btn" data-idx="${i}" style="justify-content:flex-start; font-weight:normal;">${ans.label}</button>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.quiz-ans-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        window.haptic?.('light');
        const ansIdx = parseInt(e.target.dataset.idx, 10);
        collectedTags.push(...q.a[ansIdx].tags);
        step++;
        renderStep();
      });
    });
  }

  function renderResult() {
    const byredoFrags = CAT.filter(f => f.brand.toLowerCase() === 'byredo');

    // Score each fragrance based on collected tags
    let bestFrags = byredoFrags.map(f => {
      let score = 0;
      collectedTags.forEach(tag => {
        if (f.family === tag) score += 3; // strong match
        if (f.roles.includes(tag)) score += 2; // medium match
      });
      return { f, score };
    }).sort((a, b) => b.score - a.score);

    // Get top 3
    let top3 = bestFrags.filter(x => x.score > 0).map(x => x.f).slice(0, 3);

    // Fallback if scoring failed
    if (top3.length === 0) {
      top3 = [CAT_MAP['gypsy-water'], CAT_MAP['bal-dafrique'], CAT_MAP['mojave-ghost']].filter(Boolean);
    }

    container.innerHTML = `
      <div style="padding:var(--sp-lg) 0;">
        <div class="dc-name" style="margin-bottom:var(--sp-xl);">Your Byredo Signatures</div>
        <div class="dc-description" style="margin-bottom:var(--sp-xl);">Based on your preferences, we recommend exploring these fragrances next time you are at a Byredo counter:</div>
        <div class="house-detail-list"></div>
      </div>
    `;

    const list = container.querySelector('.house-detail-list');
    top3.forEach(frag => {
      const fc = getCmpFam(frag.family);
      const btn = document.createElement('button');
      btn.className = 'list-item list-item--compact';
      btn.innerHTML = `<div class="list-item-dot" style="background:${fc.accent}"></div>
        <div class="list-item-body">
          <div class="list-item-name">${frag.name}</div>
          <div class="list-item-sub">${(FAM[frag.family] || {}).label || frag.family}</div>
        </div>`;
      btn.addEventListener('click', () => { window.haptic?.('light'); pushDetail(c => renderFragDetail(c, frag), frag.name); });
      list.appendChild(btn);
    });
  }

  renderStep();
}

function renderGlobalQuiz(container) {
  const qs = [
    {
      q: "What are we looking for today?",
      a: [
        { label: "A fresh start / A new signature", tags: ["all"] },
        { label: "Something light and easy for every day", tags: ["citrus", "green", "freshness"] },
        { label: "A powerful scent for special nights", tags: ["amber", "oud", "oriental", "intensity"] }
      ]
    },
    {
      q: "What vibe speaks to you the most?",
      a: [
        { label: "Clean, crisp, and put-together", tags: ["citrus", "aquatic"] },
        { label: "Dark, mysterious, and complex", tags: ["woody", "leather"] },
        { label: "Cozy, warm, and inviting", tags: ["amber", "gourmand"] },
        { label: "Bright, floral, and romantic", tags: ["floral"] }
      ]
    },
    {
      q: "Are there any notes you absolutely avoid?",
      a: [
        { label: "Heavy florals (Rose, Jasmine)", tags: ["blacklist_floral"] },
        { label: "Sweet or food-like scents (Vanilla, Caramel)", tags: ["blacklist_gourmand"] },
        { label: "Strong, smoky, or earthy woods (Oud, Patchouli)", tags: ["blacklist_woody", "blacklist_leather"] },
        { label: "I'm open to anything!", tags: ["neutral"] }
      ]
    },
    {
      q: "How do you want it to project?",
      a: [
        { label: "I want people to smell me when I enter a room", tags: ["intensity"] },
        { label: "I want it to be a secret just for someone who leans in", tags: ["intimate"] },
        { label: "Something right in the middle", tags: ["neutral"] }
      ]
    },
    {
      q: "What climate will you wear this in most?",
      a: [
        { label: "Warm or humid weather", tags: ["freshness"] },
        { label: "Cold or crisp weather", tags: ["warmth"] },
        { label: "All year round", tags: ["neutral"] }
      ]
    }
  ];

  let step = 0;
  let collectedTags = [];

  function renderStep() {
    if (step >= qs.length) {
      renderResult();
      return;
    }
    const q = qs[step];
    container.innerHTML = `
      <div style="padding:var(--sp-lg) 0;">
        <div style="font-size:var(--fs-meta); color:var(--g500); margin-bottom:var(--sp-xs);">Question ${step + 1} of ${qs.length}</div>
        <div class="dc-name" style="margin-bottom:var(--sp-xl);">${q.q}</div>
        <div style="display:flex; flex-direction:column; gap:var(--sp-md);">
          ${q.a.map((ans, i) => `
            <button class="dc-collect-btn quiz-ans-btn" data-idx="${i}" style="justify-content:flex-start; font-weight:normal; text-align:left;">${ans.label}</button>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.quiz-ans-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        window.haptic?.('light');
        const ansIdx = parseInt(e.target.dataset.idx, 10);
        collectedTags.push(...q.a[ansIdx].tags);
        step++;
        renderStep();
      });
    });
  }

  function renderResult() {
    // Parse tags into structured preferences
    const prefs = {
      boostFamilies: [],
      boostFreshness: false,
      boostWarmth: false,
      boostIntensity: false,
      penalizeIntensity: false,
      blacklistFamilies: [],
      blacklistRoles: []
    };

    collectedTags.forEach(tag => {
      if (tag === 'all') { /* base points applied later */ }
      else if (tag === 'freshness') prefs.boostFreshness = true;
      else if (tag === 'warmth') prefs.boostWarmth = true;
      else if (tag === 'intensity') prefs.boostIntensity = true;
      else if (tag === 'intimate') prefs.penalizeIntensity = true;
      else if (tag.startsWith('blacklist_')) {
        const bl = tag.replace('blacklist_', '');
        if (bl === 'gourmand') {
          prefs.blacklistRoles.push('gourmand', 'sweet');
          prefs.blacklistFamilies.push('amber'); // Often overlap
        } else {
          prefs.blacklistFamilies.push(bl);
        }
      }
      else if (tag !== 'neutral') {
        prefs.boostFamilies.push(tag);
      }
    });

    let bestFrags = CAT.map(frag => {
      let score = 0;

      // Blacklist strict check
      if (prefs.blacklistFamilies.includes(frag.family)) {
        return { frag, score: -100 };
      }
      if (prefs.blacklistRoles.some(r => frag.roles.includes(r))) {
         return { frag, score: -100 };
      }

      // Base points if "all" was selected
      if (collectedTags.includes('all')) score += 1;

      // Family/Vibe Match
      if (prefs.boostFamilies.includes(frag.family)) score += 5;
      prefs.boostFamilies.forEach(bf => {
        if (frag.roles.includes(bf)) score += 2;
      });

      // Profile Match (Freshness, Warmth, Intensity)
      const prof = computeProfile(frag);

      if (prefs.boostFreshness && prof.freshness > 0.6) score += 3;
      if (prefs.boostWarmth && prof.warmth > 0.6) score += 3;

      if (prefs.boostIntensity && prof.intensity > 0.6) score += 3;
      if (prefs.penalizeIntensity) {
        if (prof.intensity < 0.4) score += 3;
        else if (prof.intensity > 0.6) score -= 3;
      }

      return { frag, score };
    }).filter(x => x.score > -50).sort((a, b) => b.score - a.score);

    // Get top 3
    let top3 = bestFrags.filter(x => x.score > 0).map(x => x.frag).slice(0, 3);

    // Fallback if scoring failed
    if (top3.length === 0 && CAT.length > 2) {
      top3 = [CAT[0], CAT[1], CAT[2]];
    }

    container.innerHTML = `
      <div style="padding:var(--sp-lg) 0;">
        <div class="dc-name" style="margin-bottom:var(--sp-xl);">Your Perfect Matches</div>
        <div class="dc-description" style="margin-bottom:var(--sp-xl);">Based on your unique scent profile, we highly recommend exploring these three fragrances:</div>
        <div class="house-detail-list"></div>
        <button class="dc-collect-btn" onclick="pushDetail(c => renderGlobalQuiz(c), 'Fragrance Match')" style="margin-top:var(--sp-2xl); width:100%; justify-content:center; background:var(--bg-secondary); color:var(--text-secondary); border:1px solid var(--border-strong);">Retake Quiz</button>
      </div>
    `;

    const list = container.querySelector('.house-detail-list');
    top3.forEach(frag => {
      const fc = getCmpFam(frag.family);
      const btn = document.createElement('button');
      btn.className = 'list-item list-item--compact';
      btn.innerHTML = `<div class="list-item-dot" style="background:${fc.accent}"></div>
        <div class="list-item-body">
          <div class="list-item-name">${frag.name}</div>
          <div class="list-item-sub">${frag.brand} · ${(FAM[frag.family] || {}).label || frag.family}</div>
        </div>`;
      btn.addEventListener('click', () => { window.haptic?.('light'); pushDetail(c => renderFragDetail(c, frag), frag.name); });
      list.appendChild(btn);
    });
  }

  renderStep();
}

function refreshAfterStateChange(id){
  const row=document.querySelector(`.list-item[data-id="${id}"]`);
  if(row){const f=CAT_MAP[id];renderCatRow(row,f,FAM[f.family]||{color:'#888'})}
  const brands=[...new Set(CAT.map(f=>f.brand))];
  brands.forEach(b=>updBC(b,b.replace(/\s+/g,'-')));
  updCC();
  if(window.renderSaved)window.renderSaved();
}

/* ══ NOTE FLOAT POPUP (Notes tab) ══════════════════════════════════ */
function openNotePopup(note,triggerEl){
  const fm=FAM[note.family]||{label:note.family,color:'#888'};
  const nl=note.name.toLowerCase();
  const inf=CAT.filter(f=>f._nAll.includes(nl));
  document.getElementById('np-name').textContent=note.name;
  document.getElementById('np-family').textContent=fm.label;
  document.getElementById('np-desc').textContent=note.desc;

  const saveEl = document.getElementById('np-save');
  if (saveEl) renderNoteSaveBtn(saveEl, note);

  const extEl = document.getElementById('np-extraction');
  if(note.extraction_method) {
    document.getElementById('np-extraction-text').textContent = note.extraction_method;
    extEl.style.display = 'block';
  } else {
    extEl.style.display = 'none';
  }

  const factEl = document.getElementById('np-fact');
  if(note.insider_fact) {
    document.getElementById('np-fact-text').textContent = note.insider_fact;
    factEl.style.display = 'block';
  } else {
    factEl.style.display = 'none';
  }

  const sortedInf=[...inf].sort((a,b)=>a.name.localeCompare(b.name));
  const fe=document.getElementById('np-frags');fe.innerHTML='';
  if(sortedInf.length){
    const lbl=document.createElement('div');lbl.className='sec-label';lbl.style.marginBottom='6px';lbl.textContent=`In catalog (${sortedInf.length})`;
    fe.appendChild(lbl);
    const list=document.createElement('div');list.style.cssText='border:1px solid var(--g200);border-radius:8px;overflow:hidden';
    sortedInf.forEach(f=>{
      const fc=getCmpFam(f.family);
      const btn=document.createElement('button');btn.className='list-item list-item--compact';
      btn.innerHTML=`<div class="list-item-dot" style="background:${fc.accent}"></div><div class="list-item-body"><div class="list-item-name">${f.name}</div><div class="list-item-sub">${f.brand}</div></div>`;
      btn.addEventListener('click',e=>{e.stopPropagation();closeNotePopup();openFragDetail(f)});
      list.appendChild(btn);
    });
    fe.appendChild(list);
  }
  const popup=document.getElementById('note-popup');
  const rect=triggerEl.getBoundingClientRect();
  let left=rect.left,top=rect.bottom+8;
  if(left+248>window.innerWidth-12)left=window.innerWidth-248-12;
  if(left<8)left=8;if(top+220>window.innerHeight)top=rect.top-220;if(top<8)top=8;
  popup.style.left=left+'px';popup.style.top=top+'px';
  document.getElementById('note-float-overlay').classList.add('open');
}
function closeNotePopup(){document.getElementById('note-float-overlay').classList.remove('open')}
document.getElementById('note-float-bg').addEventListener('click',closeNotePopup);
document.getElementById('nfp-close').addEventListener('click',closeNotePopup);

/* ══ PICKER ═════════════════════════════════════════════════════════ */
function openPicker(roleId){openDetail(c=>renderPicker(c,roleId),RM[roleId]?.name || 'Role')}

function renderPicker(container,roleId){
  const role=RM[roleId];
  const assigned=getAssigned(roleId); // ordered array
  const primaryId=assigned[0]||null;
  const primaryFrag=primaryId?CAT_MAP[primaryId]:null;
  const secondaries=assigned.slice(1).map(id=>CAT_MAP[id]).filter(Boolean);

  // Header
  const hdr=document.createElement('div');hdr.className='picker-header';
  hdr.innerHTML=`
    <div class="picker-title">${role.sym} ${role.name}</div><div class="picker-sub">${role.desc}</div>`;
  container.appendChild(hdr);

  // Hero
  const hero=document.createElement('div');hero.className='picker-hero';
  if(!primaryFrag){
    hero.innerHTML=`<div class="picker-hero-empty">
      <div class="picker-hero-sym-empty">${role.sym}</div>
      <div class="picker-hero-empty-label">No fragrance assigned</div>
      <div class="picker-hero-empty-desc">${role.long.split('.')[0]}.</div>
    </div>
    <div class="picker-role-sym-line">${role.symLine}</div>`;
  } else {
    const fm=FAM[primaryFrag.family]||{color:'#888'};
    const isW=isWish(primaryFrag.id)&&!isOwned(primaryFrag.id);
    let secHTML='';
    if(secondaries.length){
      secHTML=`<div class="picker-hero-secondary">
        <div class="picker-hero-sec-label">Also assigned</div>
        ${secondaries.map((f,i)=>`<div class="picker-hero-sec-row">
          <span class="picker-hero-sec-idx">${i+2}</span>
          <span class="picker-hero-sec-name${isWish(f.id)&&!isOwned(f.id)?' is-wish':''}">${f.name}</span>
        </div>`).join('')}
      </div>`;
    }
    hero.innerHTML=`<div class="picker-hero-filled">
      <div class="picker-hero-sym" style="color:${fm.color}">${role.sym}</div>
      <div class="picker-hero-info">
        <div class="picker-hero-name${isW?' is-wish':''}">${primaryFrag.name}</div>
        <div class="picker-hero-brand">${primaryFrag.brand}</div>
        <div class="picker-hero-notes"><strong>Top</strong>${primaryFrag.top.join(', ')}</div>
      </div>
    </div>
    ${secHTML}
    <div class="picker-role-sym-line">${role.symLine}</div>`;
  }
  container.appendChild(hero);

  // Sections
  const carousel=CAT.filter(f=>f.roles.includes(roleId)&&gst(f.id)==='none'&&!assigned.includes(f.id));
  const ownedTagged=CAT.filter(f=>f.roles.includes(roleId)&&isOwned(f.id)&&!assigned.includes(f.id));
  const ownedOther=CAT.filter(f=>!f.roles.includes(roleId)&&isOwned(f.id)&&!assigned.includes(f.id));
  const wishedTagged=CAT.filter(f=>f.roles.includes(roleId)&&isWish(f.id)&&!assigned.includes(f.id));
  const wishedOther=CAT.filter(f=>!f.roles.includes(roleId)&&isWish(f.id)&&!assigned.includes(f.id));
  const wished=[...wishedTagged,...wishedOther];

  // Assigned list at top (if any)
  if(assigned.length){
    const lbl=document.createElement('div');lbl.className='picker-sec-lbl';lbl.textContent='Assigned to this role';container.appendChild(lbl);
    const list=document.createElement('div');list.className='picker-list';
    assigned.forEach((fid,i)=>{
      const f=CAT_MAP[fid];if(!f)return;
      const fm=FAM[f.family]||{color:'#888'};
      const row=document.createElement('div');row.className='picker-row'+(i===0?' is-primary':'');
      const badge=document.createElement('span');
      badge.className='picker-order-badge'+(i===0?' primary-badge':'');
      badge.textContent=i===0?'Primary':`#${i+1}`;
      const nameBtn=document.createElement('button');nameBtn.className='picker-name-btn'+(isWish(f.id)&&!isOwned(f.id)?' is-wish':'');nameBtn.textContent=f.name;
      nameBtn.addEventListener('click',e=>{e.stopPropagation();pushDetail(c=>renderFragDetail(c,f),f.name)});
      const info=document.createElement('div');info.className='picker-info';
      info.appendChild(nameBtn);
      const br=document.createElement('div');br.className='picker-brand-row';br.textContent=f.brand;info.appendChild(br);
      const fdot=document.createElement('div');fdot.className='picker-fdot';fdot.style.background=fm.color;
      const removeBtn=document.createElement('button');removeBtn.className='tab';removeBtn.style.cssText='font-size:.65rem;padding:3px 7px';removeBtn.textContent='Remove';
      removeBtn.addEventListener('click',e=>{
        e.stopPropagation();
        removeFromRole(roleId,fid);
        container.innerHTML='';renderPicker(container,roleId);
      });
      row.appendChild(fdot);row.appendChild(info);row.appendChild(badge);row.appendChild(removeBtn);
      list.appendChild(row);
    });
    container.appendChild(list);
  }

  // Explore carousel
  if(carousel.length){
    const lbl=document.createElement('div');lbl.className='picker-sec-lbl';lbl.textContent=`Explore for this role (${carousel.length})`;container.appendChild(lbl);
    const wrap=document.createElement('div');wrap.className='carousel-wrap';
    const row=document.createElement('div');row.className='carousel';
    carousel.forEach(frag=>{
      const fm=FAM[frag.family]||{color:'#888'};
      const card=document.createElement('div');card.className='carousel-card';
      card.innerHTML=`<div class="carousel-card-name">${frag.name}</div>
        <div class="carousel-card-brand">${frag.brand}</div>
        <div class="carousel-card-family"><div class="fam-dot" style="background:${fm.color}"></div><span class="carousel-card-family-label">${fm.label}</span></div>`;
      card.addEventListener('click',e=>{e.stopPropagation();pushDetail(c=>renderFragDetail(c,frag),frag.name)});
      row.appendChild(card);
    });
    wrap.appendChild(row);container.appendChild(wrap);
  }

  function makeRow(frag){
    const fm=FAM[frag.family]||{color:'#888'};
    const w=isWish(frag.id)&&!isOwned(frag.id);
    const row=document.createElement('div');row.className='picker-row';
    const nameBtn=document.createElement('button');nameBtn.className='picker-name-btn'+(w?' is-wish':'');nameBtn.textContent=frag.name;
    nameBtn.addEventListener('click',e=>{e.stopPropagation();pushDetail(c=>renderFragDetail(c,frag),frag.name)});
    const info=document.createElement('div');info.className='picker-info';
    info.appendChild(nameBtn);
    const br=document.createElement('div');br.className='picker-brand-row';br.textContent=frag.brand;info.appendChild(br);
    const fdot=document.createElement('div');fdot.className='picker-fdot';fdot.style.background=fm.color;
    const addBtn=document.createElement('button');addBtn.className='tab active';addBtn.style.cssText='font-size:.65rem;padding:3px 7px;background:var(--black);color:#fff;box-shadow:none';addBtn.textContent='Add';
    addBtn.addEventListener('click',e=>{
      e.stopPropagation();
      assignFrag(roleId,frag.id);
      window.haptic?.('success');
      container.innerHTML='';renderPicker(container,roleId);
    });
    row.appendChild(fdot);row.appendChild(info);row.appendChild(addBtn);
    return row;
  }

  if(ownedTagged.length){
    const lbl=document.createElement('div');lbl.className='picker-sec-lbl';lbl.textContent=`Matches this role — owned (${ownedTagged.length})`;container.appendChild(lbl);
    const list=document.createElement('div');list.className='picker-list';ownedTagged.forEach(f=>list.appendChild(makeRow(f)));container.appendChild(list);
  }
  if(ownedOther.length){
    const lbl=document.createElement('div');lbl.className='picker-sec-lbl';lbl.textContent=`Other owned (${ownedOther.length})`;container.appendChild(lbl);
    const list=document.createElement('div');list.className='picker-list';ownedOther.forEach(f=>list.appendChild(makeRow(f)));container.appendChild(list);
  }
  if(!ownedTagged.length&&!ownedOther.length&&!assigned.length){
    // New user: show all frags for this role with Add buttons so they can build their capsule
    const roleAll=CAT.filter(f=>f.roles.includes(roleId));
    if(roleAll.length){
      const lbl=document.createElement('div');lbl.className='picker-sec-lbl';
      lbl.innerHTML=`All fragrances for this role <span style="color:var(--g400);font-weight:400">(${roleAll.length})</span>`;
      container.appendChild(lbl);
      const hint=document.createElement('div');hint.style.cssText='font-size:var(--fs-label);color:var(--text-tertiary);margin-bottom:var(--sp-md);line-height:var(--lh-normal)';
      hint.textContent='Tap a fragrance to learn more, or add directly to your capsule.';
      container.appendChild(hint);
      const list=document.createElement('div');list.className='picker-list';
      roleAll.forEach(f=>list.appendChild(makeRow(f)));
      container.appendChild(list);
    } else {
      const msg=document.createElement('div');msg.className='picker-empty';msg.textContent='No fragrances found for this role.';container.appendChild(msg);
    }
  }
  if(wished.length){
    const lbl=document.createElement('div');lbl.className='picker-sec-lbl';lbl.textContent=`Wishlist (${wished.length})`;container.appendChild(lbl);
    const list=document.createElement('div');list.className='picker-list';wished.forEach(f=>list.appendChild(makeRow(f)));container.appendChild(list);
  }
}

/* ══ ROW HIGHLIGHT HELPER (family / brand / role hover) ════════════ */
function highlightRows(attrKey,matchVal){
  document.querySelectorAll('.list-item').forEach(row=>{
    if(matchVal===null){row.classList.remove('fam-dim');return;}
    let match;
    if(attrKey==='roles'){
      const roles=row.dataset.roles||'';
      match=roles.split(' ').includes(matchVal);
    } else {
      match=row.dataset[attrKey]===matchVal;
    }
    row.classList.toggle('fam-dim',!match);
  });
}


/* ══ BUILD CATALOG ══════════════════════════════════════════════════ */
let CAT_ROLE_FILTER=null;
let CAT_STATE_FILTER=null;
let CAT_BRAND_FILTER=null;
let CAT_FAM_FILTER=null;
let CAT_FAM_HOVER=null;

function buildCatalog(roleFilter){
  CAT_ROLE_FILTER=(roleFilter===undefined?CAT_ROLE_FILTER:roleFilter);
  roleFilter=CAT_ROLE_FILTER;
  const body=document.getElementById('cat-body');body.innerHTML='';

  // Role filter bar
  /*
  const filterBar=document.createElement('div');filterBar.className='cat-state-bar';
  const allBtn=document.createElement('button');
  allBtn.className='tab'+(roleFilter===null?' active':'');
  allBtn.textContent='All';
  allBtn.addEventListener('click',()=>buildCatalog(null));
  filterBar.appendChild(allBtn);
  ROLES.forEach(r=>{
    const btn=document.createElement('button');
    btn.className='tab'+(roleFilter===r.id?' active':'');
    btn.innerHTML=`${r.sym} ${r.name}`;
    btn.addEventListener('click',()=>buildCatalog(r.id));
    btn.addEventListener('mouseenter',()=>highlightRows('roles',r.id));
    btn.addEventListener('mouseleave',()=>highlightRows('roles',null));
    filterBar.appendChild(btn);
  });
  body.appendChild(filterBar);
  */

  // Apply filters: brand + state + search
  const search=(document.getElementById('cat-search')?.value||'').toLowerCase().trim();
  let visibleCat=roleFilter?CAT.filter(f=>f.roles.includes(roleFilter)):CAT;
  if(CAT_FAM_FILTER)visibleCat=visibleCat.filter(f=>f.family===CAT_FAM_FILTER);
  if(CAT_BRAND_FILTER)visibleCat=visibleCat.filter(f=>f.brand===CAT_BRAND_FILTER);
  if(CAT_STATE_FILTER==='owned')visibleCat=visibleCat.filter(f=>isOwned(f.id));
  else if(CAT_STATE_FILTER==='wish')visibleCat=visibleCat.filter(f=>isWish(f.id));
  const normSearch = normQ(search);
  if(normSearch) visibleCat = visibleCat.filter(f => matchFrag(f, normSearch));

  if(!visibleCat.length){
    const empty=document.createElement('div');empty.className='cat-empty';
    if(search){
      empty.innerHTML=`<div class="cat-empty-msg">No matches for <strong>"${search}"</strong></div><button class="cat-empty-clear" onclick="document.getElementById('cat-search').value='';document.getElementById('cat-search-clear').classList.remove('visible');buildCatalog()">Clear search</button>`;
    } else {
      empty.innerHTML=`<div class="cat-empty-msg">No fragrances in this view.</div>`;
    }
    body.appendChild(empty);
    const liveEl=document.getElementById('cat-live');if(liveEl)liveEl.textContent='No fragrances found.';
    updCC();return;
  }
  // Announce result count to screen readers
  const liveEl=document.getElementById('cat-live');if(liveEl)liveEl.textContent=`${visibleCat.length} fragrance${visibleCat.length!==1?'s':''}`;


  // Nose Knows entry row (always visible at top, no gate)
  if(!normSearch&&!CAT_FAM_FILTER&&!CAT_BRAND_FILTER&&CAT_STATE_FILTER!=='owned'&&CAT_STATE_FILTER!=='wish'){
    const noseEl=document.createElement('div');
    noseEl.innerHTML=_noseEntryHtml();
    const noseBtn=noseEl.firstElementChild;
    noseBtn.addEventListener('click',()=>_openNoseGame());
    noseBtn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();_openNoseGame();}});
    body.appendChild(noseBtn);
  }

  // Brand Discovery section — top of All tab, no filters active
  if(!normSearch&&!CAT_FAM_FILTER&&!CAT_BRAND_FILTER&&CAT_STATE_FILTER!=='owned'&&CAT_STATE_FILTER!=='wish'){
    renderBrandDiscovery(body);
  }

  // Wardrobe Gap Analysis — top of Owned tab
  if(CAT_STATE_FILTER==='owned'&&!normSearch){
    renderWardrobeGap(body);
  }

  const brands=[...new Set(visibleCat.map(f=>f.brand))].sort((a,b)=>a.localeCompare(b));
  brands.forEach(brand=>{
    const frags=visibleCat.filter(f=>f.brand===brand).sort((a,b)=>a.name.localeCompare(b.name));
    const key=brand.replace(/\s+/g,'-')+(roleFilter||'');
    const sec=document.createElement('div');sec.className='cat-section';
    sec.innerHTML=`<div class="brand-hdr"><button class="brand-n s-name-btn" data-brand="${brand}">${brand}<span class="brand-total">${frags.length}</span></button><div class="brand-c" id="bc-${key}"></div></div>`;
    // Brand header → house detail
    sec.querySelector('.s-name-btn')?.addEventListener('click',()=>openHouseDetail(brand));
    const list=document.createElement('div');list.className='scent-list';
    const lastTapMap = new Map();
    let touchStartX = 0;
    let touchStartY = 0;

    list.addEventListener('click',e=>{
      const row=e.target.closest('.list-item');if(!row)return;
      const id=row.dataset.id;const frag=CAT_MAP[id];if(!frag)return;

      // Double tap logic
      const now = Date.now();
      const lastTap = lastTapMap.get(id) || 0;

      if(now - lastTap < 300) {
        // Double tap on the same item!
        window.haptic?.('success');
        const st=gst(frag.id);
        const nextSt = st==='wish'?'none':'wish';
        setState(frag.id, nextSt);
        refreshAfterStateChange(frag.id);
        lastTapMap.set(id, 0); // Reset
        // Show brief state toast
        const toastMsg = nextSt==='wish'?'Added to wishlist':nextSt==='owned'?'Marked as owned':'Removed';
        const toast=document.createElement('div');toast.className='state-toast';toast.setAttribute('aria-live','polite');
        toast.textContent=toastMsg;row.appendChild(toast);
        setTimeout(()=>toast.remove(),1250);
      } else {
        lastTapMap.set(id, now);
        // Single tap - immediately open detail to stay responsive
        openFragDetail(frag);
      }
    });

    // Keyboard: Enter/Space opens detail; ArrowUp/Down navigates across all visible rows
    list.addEventListener('keydown', e=>{
      const row=e.target.closest('.list-item');if(!row||e.target!==row)return;
      if(e.key==='Enter'||e.key===' '){
        e.preventDefault();
        const frag=CAT_MAP[row.dataset.id];if(frag)openFragDetail(frag);
      } else if(e.key==='ArrowDown'||e.key==='ArrowUp'){
        e.preventDefault();
        const allRows=[...body.querySelectorAll('.list-item[tabindex="0"]')];
        const idx=allRows.indexOf(row);
        const next=e.key==='ArrowDown'?allRows[idx+1]:allRows[idx-1];
        next?.focus();
      }
    });

    // Long press logic
    list.addEventListener('touchstart', e=>{
      const row=e.target.closest('.list-item');if(!row)return;
      const id=row.dataset.id;const frag=CAT_MAP[id];if(!frag)return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      if(_globalLongPressTimer){clearTimeout(_globalLongPressTimer);_globalLongPressTimer=null;}
      _globalLongPressTimer = setTimeout(()=>{
        _globalLongPressTimer = null;
        window.haptic?.('medium');
        openQuickPeek(frag);
      }, 500);
    }, {passive:true});

    list.addEventListener('touchmove', e=>{
      if(_globalLongPressTimer) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        if(Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          clearTimeout(_globalLongPressTimer);
          _globalLongPressTimer = null;
        }
      }
    }, {passive:true});

    list.addEventListener('touchend', ()=>{
      if(_globalLongPressTimer) {
        clearTimeout(_globalLongPressTimer);
        _globalLongPressTimer = null;
      }
    }, {passive:true});

    frags.forEach(frag=>{
      const fm=FAM[frag.family]||{color:'#888'};
      const row=document.createElement('div');row.dataset.id=frag.id;
      renderCatRow(row,frag,fm,search);list.appendChild(row);
    });
    sec.appendChild(list);body.appendChild(sec);
    // update brand count
    const bcEl=document.getElementById(`bc-${key}`);
    if(bcEl){const o=frags.filter(f=>isOwned(f.id)).length,w=frags.filter(f=>isWish(f.id)).length;bcEl.textContent=[o&&`${o} owned`,w&&`${w} wished`].filter(Boolean).join(' · ')}
  });
  if(normSearch){
    const firstRow = body.querySelector('.list-item');
    if(firstRow) firstRow.classList.add('search-first');
  }
  updCC();
  // hidden select for filter state (used by role landing)
  let sel=document.getElementById('cat-role-filter');
  if(!sel){sel=document.createElement('select');sel.id='cat-role-filter';sel.style.display='none';document.body.appendChild(sel);}
  sel.value=roleFilter||'';
}

function initCatalogControls(){
  const stateBar=document.getElementById('cat-state-bar');
  const stateBarM=document.getElementById('cat-state-bar-m');
  const brandBar=document.getElementById('cat-brand-bar');
  const brandBarM=document.getElementById('cat-brand-bar-m');
  const brands=[...new Set(CAT.map(f=>f.brand))].sort();

  // Helper: build state tabs into a container; allStateButtons tracks all for sync
  const allStateBtns=[];
  function makeStateBtn(label,val,container){
    const btn=document.createElement('button');
    btn.className='tab'+(CAT_STATE_FILTER===val?' active':'');
    btn.setAttribute('aria-pressed', CAT_STATE_FILTER===val ? 'true' : 'false');
    btn.textContent=label;
    btn.addEventListener('click',()=>{
      CAT_STATE_FILTER=val;
      allStateBtns.forEach(b=>{
        const isActive=b.dataset.val===(val===null?'':val);
        b.classList.toggle('active',isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      buildCatalog();
    });
    btn.dataset.val=val===null?'':val;
    allStateBtns.push(btn);
    container.appendChild(btn);
    return btn;
  }
  [['All',null],['Owned','owned'],['Wishlist','wish']].forEach(([label,val])=>{
    makeStateBtn(label,val,stateBar);
    if(stateBarM)makeStateBtn(label,val,stateBarM);
  });

  const notesSearch = document.getElementById('notes-search');
  const notesSearchClear = document.getElementById('notes-search-clear');
  const notesTierBar = document.getElementById('notes-tier-bar');
  let currentNoteQuery = '';
  let currentNoteTier = 'all';

  if (notesSearch) {
    notesSearch.addEventListener('input', (e) => {
      currentNoteQuery = e.target.value;
      notesSearchClear.style.display = currentNoteQuery ? 'block' : 'none';
      buildNotes(currentNoteQuery, currentNoteTier);
    });
  }

  if (notesSearchClear) {
    notesSearchClear.addEventListener('click', () => {
      currentNoteQuery = '';
      notesSearch.value = '';
      notesSearchClear.style.display = 'none';
      buildNotes(currentNoteQuery, currentNoteTier);
    });
  }

  if (notesTierBar) {
    const tabs = notesTierBar.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-pressed', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-pressed', 'true');
        currentNoteTier = tab.dataset.tier;
        buildNotes(currentNoteQuery, currentNoteTier);
      });
    });
  }

  // Helper: build family filter pills
  const familyBar=document.getElementById('cat-family-bar');
  const familyBarM=document.getElementById('cat-family-bar-m');
  const allFamBtns=[];
  function makeFamBtn(label,val,color,container){
    const btn=document.createElement('button');
    btn.className='fam-pill'+(CAT_FAM_FILTER===val?' active':'');
    btn.setAttribute('aria-pressed', CAT_FAM_FILTER===val ? 'true' : 'false');
    const dot=val?`<span class="fam-pill-dot" style="background:${color}"></span>`:'';
    btn.innerHTML=`${dot}${label}`;
    btn.dataset.fam=val===null?'':val;
    btn.addEventListener('click',()=>{
      CAT_FAM_FILTER=val;
      allFamBtns.forEach(b=>{
        const isActive=b.dataset.fam===(val===null?'':val);
        b.classList.toggle('active',isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      buildCatalog();
    });
    allFamBtns.push(btn);
    container.appendChild(btn);
    return btn;
  }
  if(familyBar){
    makeFamBtn('All',null,null,familyBar);
    FAM_ORDER.forEach(fam=>{
      const f=FAM[fam];if(!f)return;
      const count=CAT.filter(fr=>fr.family===fam).length;
      if(count)makeFamBtn(f.label,fam,f.color,familyBar);
    });
  }
  if(familyBarM){
    makeFamBtn('All',null,null,familyBarM);
    FAM_ORDER.forEach(fam=>{
      const f=FAM[fam];if(!f)return;
      const count=CAT.filter(fr=>fr.family===fam).length;
      if(count)makeFamBtn(f.label,fam,f.color,familyBarM);
    });
  }

  // Helper: build brand tabs into a container; allBrandBtns for sync
  const allBrandBtns=[];
  function makeBrandBtn(label,val,html,container){
    const btn=document.createElement('button');
    btn.className='tab'+(CAT_BRAND_FILTER===val?' active':'');
    btn.setAttribute('aria-pressed', CAT_BRAND_FILTER===val ? 'true' : 'false');
    btn.innerHTML=html;
    btn.dataset.brand=val===null?'':val;
    btn.addEventListener('click',()=>{
      CAT_BRAND_FILTER=val;
      allBrandBtns.forEach(b=>{
        const isActive=b.dataset.brand===(val===null?'':val);
        b.classList.toggle('active',isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      buildCatalog();
    });
    if(val){
      btn.addEventListener('mouseenter',()=>highlightRows('brand',val));
      btn.addEventListener('mouseleave',()=>highlightRows('brand',null));
    }
    allBrandBtns.push(btn);
    container.appendChild(btn);
    return btn;
  }
  const allHtml=`All<span class="brand-count-chip">${CAT.length}</span>`;
  makeBrandBtn('All',null,allHtml,brandBar);
  if(brandBarM)makeBrandBtn('All',null,allHtml,brandBarM);
  brands.forEach(brand=>{
    const count=CAT.filter(f=>f.brand===brand).length;
    const html=`${brand}<span class="brand-count-chip">${count}</span>`;
    makeBrandBtn(brand,brand,html,brandBar);
    if(brandBarM)makeBrandBtn(brand,brand,html,brandBarM);
  });

  // Populate Feelings (Roles)
  const feelBar = document.getElementById('cat-feel-bar');
  const feelBarM = document.getElementById('cat-feel-bar-m');
  const allFeelBtns = [];
  function makeFeelBtn(label, val, sym, container) {
    const btn = document.createElement('button');
    btn.className = 'tab' + (CAT_ROLE_FILTER === val ? ' active' : '');
    btn.innerHTML = `${sym} ${label}`;
    btn.dataset.val = val === null ? '' : val;
    btn.addEventListener('click', () => {
      CAT_ROLE_FILTER = val;
      allFeelBtns.forEach(b => {
        const isActive = b.dataset.val === (val === null ? '' : val);
        b.classList.toggle('active', isActive);
      });
      buildCatalog();
    });
    allFeelBtns.push(btn);
    container.appendChild(btn);
    return btn;
  }
  if (feelBar) {
    makeFeelBtn('All', null, '◈', feelBar);
    ROLES.forEach(r => makeFeelBtn(r.name, r.id, r.sym, feelBar));
  }
  if (feelBarM) {
    makeFeelBtn('All', null, '◈', feelBarM);
    ROLES.forEach(r => makeFeelBtn(r.name, r.id, r.sym, feelBarM));
  }

  // Search (debounced to avoid rebuilding DOM on every keystroke)
  const searchEl=document.getElementById('cat-search');
  const clearBtn=document.getElementById('cat-search-clear');
  const _debouncedBuildCatalog = debounce(buildCatalog, 160);
  searchEl.addEventListener('input',()=>{
    clearBtn.classList.toggle('visible',searchEl.value.length>0);
    _debouncedBuildCatalog();
  });
  clearBtn.addEventListener('click',()=>{
    searchEl.value='';clearBtn.classList.remove('visible');buildCatalog();
  });
  searchEl.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&searchEl.value.length>0){
      e.stopPropagation();
      searchEl.value='';clearBtn.classList.remove('visible');buildCatalog();searchEl.blur();
    }
    if(e.key==='Enter'){
      const first=document.querySelector('#cat-body .list-item');
      if(first){first.click();e.preventDefault();}
    }
    if(e.key==='ArrowDown'){
      e.preventDefault();
      const first=document.querySelector('#cat-body .list-item');
      if(first) first.focus();
    }
  });
  const catBody=document.getElementById('cat-body');
  if(catBody){
    catBody.addEventListener('keydown',e=>{
      if(!['ArrowDown','ArrowUp','Escape'].includes(e.key)) return;
      e.preventDefault();
      const rows=[...catBody.querySelectorAll('.list-item')];
      const idx=rows.indexOf(document.activeElement);
      if(e.key==='Escape'){ searchEl.focus(); return; }
      if(e.key==='ArrowUp'){
        if(idx<=0) searchEl.focus();
        else{ rows[idx-1].focus(); rows[idx-1].scrollIntoView({block:'nearest'}); }
      }
      if(e.key==='ArrowDown'&&idx<rows.length-1){
        rows[idx+1].focus(); rows[idx+1].scrollIntoView({block:'nearest'});
      }
    });
  }

  // Mobile filter toggle
  const toggleBtn=document.getElementById('frag-filter-toggle');
  const mobilePanel=document.getElementById('frag-mobile-panel');
  if(toggleBtn&&mobilePanel){
    toggleBtn.addEventListener('click',()=>{
      const isOpen=mobilePanel.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded',isOpen);
    });
  }
}

function renderCatRow(row,frag,fm,search){
  const st=gst(frag.id);
  row.className=`list-item${st!=='default'?' list-item--'+st:''}`;
  row.setAttribute('role','button');
  row.setAttribute('tabindex','0');
  const _stLabel=st==='owned'?' — Owned':st==='wish'?' — On wishlist':'';
  row.setAttribute('aria-label',`${frag.name} by ${frag.brand}${_stLabel}`);
  row.dataset.family=frag.family;
  row.dataset.brand=frag.brand;
  row.dataset.roles=frag.roles.join(' ');
  const famLabel=(FAM[frag.family]||{label:frag.family}).label;

  // Build notes line — when searching, surface WHERE the match lives
  let notesHtml='';
  if(search){
    const q=search.toLowerCase();
    const topIdx=(frag._nTop||[]).findIndex(n=>n.includes(q));
    const midIdx=(frag._nMid||[]).findIndex(n=>n.includes(q));
    const baseIdx=(frag._nBase||[]).findIndex(n=>n.includes(q));
    if(topIdx!==-1){
      // Highlight the matching top note, show others normally
      const rendered=(frag.top||[]).slice(0,3).map((n,i)=>
        (i===topIdx||frag._nTop[i].includes(q))?`<mark class="note-match">${n}</mark>`:n
      ).join(', ');
      notesHtml=`<div class="list-item-meta">${rendered}</div>`;
    } else if(midIdx!==-1||baseIdx!==-1){
      // Replace notes line with a "why matched" badge
      const tier=midIdx!==-1?'Mid':'Base';
      const note=midIdx!==-1?frag.mid[midIdx]:frag.base[baseIdx];
      notesHtml=`<div class="list-item-meta"><span class="match-badge">↳ ${tier} · ${note}</span></div>`;
    } else {
      // Name or brand match — show top notes as normal
      const topNotes=(frag.top||[]).slice(0,3).join(', ');
      if(topNotes)notesHtml=`<div class="list-item-meta">${topNotes}</div>`;
    }
  } else {
    const topNotes=(frag.top||[]).slice(0,3).join(', ');
    const midNote=(frag.mid||[])[0];
    const baseNote=(frag.base||[])[0];
    const parts=[];
    if(topNotes)parts.push(topNotes);
    if(midNote)parts.push(`<span class="note-layer-hint" aria-label="Heart note:">H</span> ${midNote}`);
    if(baseNote)parts.push(`<span class="note-layer-hint" aria-label="Base note:">B</span> ${baseNote}`);
    if(parts.length)notesHtml=`<div class="list-item-meta">${parts.join(' · ')}</div>`;
  }

  row.draggable = true;
  row.innerHTML=`
    <div class="list-item-content">
      <div class="list-item-dot--lg" style="background:${fm.color}" aria-hidden="true"><span class="fam-abbr">${FAM_ABBR[frag.family]||''}</span></div>
      <div class="list-item-body">
        <div class="list-item-name">${frag.name}</div>
        <div class="list-item-sub">${frag.brand} · ${famLabel}</div>
        ${notesHtml}
      </div>
    </div>`;

  // Drag to Compare
  row.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', frag.id);
    e.dataTransfer.effectAllowed = 'copy';
    row.classList.add('dragging');
    window.haptic?.('selection');
  });
  row.addEventListener('dragend', () => {
    row.classList.remove('dragging');
  });
}
function updBC(brand,key){
  const frags=CAT.filter(f=>f.brand===brand);
  const o=frags.filter(f=>isOwned(f.id)).length,w=frags.filter(f=>isWish(f.id)).length;
  const el=document.getElementById(`bc-${key}`);
  if(el)el.textContent=[o&&`${o} owned`,w&&`${w} wished`].filter(Boolean).join(' · ');
}
function updCC(){
  const o=CAT.filter(f=>isOwned(f.id)).length,w=CAT.filter(f=>isWish(f.id)).length;
  const el=document.getElementById('cat-count');
  if(el){
    const parts=[];
    if(o)parts.push(`${o} owned`);
    if(w)parts.push(`${w} wishlist`);
    el.textContent=parts.length?parts.join(' · '):'';
  }
}

/* ══ NOTES NAV ═════════════════════════════════════════════════════ */
function initNotesNav() {
  const notesNavBar = document.getElementById('notes-nav-bar');
  if (!notesNavBar) return;
  notesNavBar.querySelectorAll('.notes-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchNotesTab(btn.dataset.tab));
  });
}

/* ══ BUILD NOTES ════════════════════════════════════════════════════ */
let notesSearchQuery = '';
let notesSortMode = 'family'; // 'family' or 'az'
let notesTierMode = 'all';

let _notesActiveTab = 'explore'; // 'explore' | 'search' | 'saved'

function switchNotesTab(tab) {
  _notesActiveTab = tab;
  // Update button active states
  document.querySelectorAll('#notes-nav-bar .notes-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  // Show/hide search controls
  const searchWrap = document.getElementById('notes-search-wrap');
  const tierWrap = document.getElementById('notes-tier-filter-wrap');
  if (tab === 'explore') {
    notesSortMode = 'family';
    notesTierMode = 'all';
    if (searchWrap) searchWrap.style.display = 'none';
  } else if (tab === 'search') {
    notesSortMode = 'az';
    notesTierMode = 'all';
    if (searchWrap) searchWrap.style.display = '';
    if (tierWrap) tierWrap.style.display = '';
  } else if (tab === 'saved') {
    notesSortMode = 'az';
    notesTierMode = 'saved';
    if (searchWrap) searchWrap.style.display = '';
    if (tierWrap) tierWrap.style.display = 'none';
  }
  buildNotes();
}

function buildNotes(searchQuery, currentTier){
  if (searchQuery !== undefined) notesSearchQuery = searchQuery;
  if (currentTier !== undefined) notesTierMode = currentTier;

  const body=document.getElementById('notes-body');body.innerHTML='';

  // Filter notes by search query and tier
  const sq = notesSearchQuery.toLowerCase().trim();
  const filteredNotes = NI.filter(n => {
    const matchesQuery = !sq || (n._nameN ? n._nameN.includes(normQ(sq)) : n.name.toLowerCase().includes(sq));
    let matchesTier = false;
    if (notesTierMode === 'all') matchesTier = true;
    else if (notesTierMode === 'saved') matchesTier = isNoteSaved(n.name);
    else matchesTier = n._tier === notesTierMode;
    return matchesQuery && matchesTier;
  });

  const countEl = document.getElementById('notes-count');
  if(countEl) countEl.textContent = `${filteredNotes.length} notes`;

  if(filteredNotes.length === 0) {
    body.innerHTML = `<div style="text-align:center; padding:var(--sp-2xl); color:var(--text-tertiary);">No notes found matching "${notesSearchQuery}"</div>`;
    return;
  }

  if (notesSortMode === 'az') {
    const cardBody = document.createElement('div');
    cardBody.className = 'notes-card-body';

    const sorted = [...filteredNotes].sort((a,b)=>a.name.localeCompare(b.name));

    sorted.forEach(note => {
      const fm = FAM[note.family] || {color: '#888'};
      const btn = document.createElement('button');
      btn.className = 'cmp-note-pill';
      const savedMark = isNoteSaved(note.name) ? ' <span style="color:var(--accent);margin-left:4px;font-size:0.85em;text-decoration:none;display:inline-block;">★</span>' : '';
      btn.innerHTML = `<span class="nf-dot" style="background:${fm.color}; display:inline-block; vertical-align:middle; margin-right:6px; margin-top:-2px;"></span>${note.name}${savedMark}`;
      btn.addEventListener('click', e => { e.stopPropagation(); openDetail(c => renderNoteDetail(c,note), note.name); });
      cardBody.appendChild(btn);
    });
    body.appendChild(cardBody);

  } else {
    // Group by family
    const grid = document.createElement('div');
    grid.className = 'notes-grid';

    const grouped={};
    filteredNotes.forEach(n=>{if(!grouped[n.family])grouped[n.family]=[];grouped[n.family].push(n)});
    Object.values(grouped).forEach(arr=>arr.sort((a,b)=>a.name.localeCompare(b.name)));

    FAM_ORDER.forEach(fk=>{
      if(!grouped[fk]?.length)return;
      const fm=FAM[fk];if(!fm)return;

      const card=document.createElement('div');card.className='notes-card';

      const header=document.createElement('div');header.className='notes-card-header';
      header.innerHTML=`<div class="nf-dot" style="background:${fm.color}"></div><div><div class="list-item-name">${fm.label}</div>${fm.desc?`<div class="list-item-sub">${fm.desc}</div>`:''}</div>`;

      const cardBody=document.createElement('div');cardBody.className='notes-card-body';
      grouped[fk].forEach(note=>{
        const btn=document.createElement('button');btn.className='cmp-note-pill';
        const savedMark = isNoteSaved(note.name) ? ' <span style="color:var(--accent);margin-left:4px;font-size:0.85em;text-decoration:none;display:inline-block;">★</span>' : '';
        btn.innerHTML = `${note.name}${savedMark}`;
        btn.addEventListener('click',e=>{e.stopPropagation();openDetail(c=>renderNoteDetail(c,note),note.name)});
        cardBody.appendChild(btn);
      });

      card.appendChild(header);
      card.appendChild(cardBody);
      grid.appendChild(card);
    });

    body.appendChild(grid);
  }

  // Inject Global Quiz button at the bottom of the notes directory
  const quizBtnWrap = document.createElement('div');
  quizBtnWrap.style.marginTop = 'var(--sp-2xl)';
  quizBtnWrap.style.textAlign = 'center';
  quizBtnWrap.innerHTML = `<button class="dc-collect-btn global-quiz-btn" style="display:inline-flex; justify-content:center; background:var(--g100); color:var(--g900); border:1px solid var(--g300);">Find Your Perfect Fragrance (Quiz)</button>`;
  body.appendChild(quizBtnWrap);

  quizBtnWrap.querySelector('.global-quiz-btn').addEventListener('click', (e) => {
    window.haptic?.('medium');
    pushDetail(c => renderGlobalQuiz(c), 'Fragrance Match');
  });
}

/* ── QUICK PEEK ── */
function openQuickPeek(frag){
  let overlay=document.getElementById('quick-peek-overlay');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='quick-peek-overlay';
    overlay.className='quick-peek-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e=>{
      if(e.target === overlay) closeQuickPeek();
    });
  }

  const fm=FAM[frag.family]||{label:frag.family,color:'#888'};
  overlay.innerHTML=`
    <div class="quick-peek-card">
      <div class="dc-name">${frag.name}</div>
      <div class="dc-brand">${frag.brand}</div>
      <div class="chip" style="background:${fm.color}; margin-bottom: var(--sp-xl);">
        <span style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.3);display:inline-block;flex-shrink:0"></span>
        ${fm.label}
      </div>
      <div class="sec-label" style="margin-top:0">Notes</div>
      <div class="dc-note"><span class="dc-nt">Top</span><span class="dc-nv">${linkNotes(frag.top)}</span></div>
      <div class="dc-note"><span class="dc-nt">Heart</span><span class="dc-nv">${linkNotes(frag.mid)}</span></div>
      <div class="dc-note"><span class="dc-nt">Base</span><span class="dc-nv">${linkNotes(frag.base)}</span></div>
      <div style="display:flex;gap:var(--sp-md);margin-top:var(--sp-2xl)">
        <button class="dc-collect-btn" style="flex:1;justify-content:center" onclick="closeQuickPeek();openFragDetail(CAT_MAP['${frag.id}'])">Full details</button>
      </div>
    </div>
  `;
  requestAnimationFrame(() => overlay.classList.add('open'));
}

function closeQuickPeek(){
  const overlay=document.getElementById('quick-peek-overlay');
  if(overlay) overlay.classList.remove('open');
}

/* ══ NAV ════════════════════════════════════════════════════════════ */
function go(id,btn){
  let panelId = id;
  if (id === 'journal') panelId = 'saved';

  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab:not(.dc-state-wrap .tab):not(.picker-row .tab):not(.cat-state-bar .tab):not(.cat-brand-bar .tab):not(.cat-state-bar-m .tab):not(.cat-brand-bar-m .tab):not(.roles-brand-bar .tab), .global-nav-link, .mbn-btn').forEach(t=>t.classList.remove('active'));
  
  const panel = document.getElementById('p-'+panelId);
  if(panel) panel.classList.add('active');
  
  if (panelId === 'saved') renderSaved();

  // Find and activate the matching global nav link or button
  if (btn) {
    btn.classList.add('active');
  } else {
    // If no btn provided, try to find one by onclick or href
    const navLinks = document.querySelectorAll('.global-nav-link, .mbn-btn');
    navLinks.forEach(l => {
      const oc = l.getAttribute('onclick') || '';
      const href = l.getAttribute('href') || '';
      // Map 'saved' panel to 'You' nav label or #saved hash
      if (oc.includes(`go('${id}'`) || href.endsWith(`#${id}`) || (id==='saved' && (oc.includes("go('saved'") || href.endsWith('#saved')))) {
        l.classList.add('active');
      }
    });
  }

  closeDesktopDetail();
  // Sync URL with compare tab state
  if(id==='compare'){
    if(CMP_A&&CMP_B){
      const[a,b]=[CMP_A.id,CMP_B.id].sort();
      // On localhost (static dev server), use hashes to avoid 404s on refresh for non-rendered comparison pages.
      // Production (Vercel) handles /compare/a/b paths via serverless functions.
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const newHash = '#compare/'+a+'/'+b;
        if (window.location.hash !== newHash) history.replaceState(null, '', newHash);
      } else {
        const newPath = '/compare/'+a+'/'+b;
        if (window.location.pathname !== newPath) history.replaceState(null,'',newPath);
      }
    } else {
      // Only redirect away from /compare/ paths if we are explicitly on one and have no comparison active
      if (window.location.pathname.startsWith('/compare/') && !CMP_A && !CMP_B) {
        history.replaceState(null,'','/app.html');
      }
    }
  } else if(window.location.pathname.startsWith('/compare/')){
    history.replaceState(null,'','/app.html');
  }
}
window.go = go;
window.closeDesktopDetail = closeDesktopDetail;

/* ══ UNIVERSAL SEARCH ═══════════════════════════════════════════════ */

const US_POPULAR = ['santal-33', 'bleu-de-chanel', 'bal-dafrique', 'gypsy-water', 'rose-31'];

let _usContext = null; // null | { context: 'compare', slot: 'a'|'b' }
let _usScores = null;  // Map<fragId, score> — pre-computed in compare mode
let _usHighlight = -1; // index of highlighted row

function openUniversalSearch(opts = {}) {
  _usContext = opts.context === 'compare' ? opts : null;
  _usHighlight = -1;
  _usScores = null;

  // Pre-compute similarity scores when one compare slot is filled
  if (_usContext) {
    const other = _usContext.slot === 'a' ? CMP_B : CMP_A;
    if (other) {
      _usScores = new Map();
      CAT.forEach(f => _usScores.set(f.id, scoreSimilarity(other, f)));
    }
  }

  const overlay = document.getElementById('universal-search');
  const input = document.getElementById('us-input');
  const ctx = document.getElementById('us-context');

  // Context banner
  if (_usContext) {
    const slotLabel = _usContext.slot === 'a' ? 'Fragrance A' : 'Fragrance B';
    const other = _usContext.slot === 'a' ? CMP_B : CMP_A;
    ctx.innerHTML = `Selecting <span class="us-context-name">${slotLabel}</span>` +
      (other ? ` &nbsp;↔&nbsp; <span class="us-context-name">${other.name}</span>` : '');
    ctx.hidden = false;
    input.placeholder = 'Search to compare...';
  } else {
    ctx.hidden = true;
    input.placeholder = 'Search fragrances, notes, brands...';
  }

  overlay.hidden = false;
  input.value = '';
  _renderUsResults('');

  _trapFocus(overlay);

  // Backdrop closes modal
  overlay.querySelector('.us-backdrop').onclick = closeUniversalSearch;
  document.getElementById('us-close').onclick = closeUniversalSearch;

  input.addEventListener('input', _onUsInput);
}
window.openUniversalSearch = openUniversalSearch;

// Keep backward-compatible stub
function openGlobalSearch() { openUniversalSearch(); }
window.openGlobalSearch = openGlobalSearch;

function closeUniversalSearch() {
  const overlay = document.getElementById('universal-search');
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  const input = document.getElementById('us-input');
  input.removeEventListener('input', _onUsInput);
  _usContext = null;
  _usScores = null;
  _returnFocus();
}
window.closeUniversalSearch = closeUniversalSearch;

function _onUsInput(e) {
  _usHighlight = -1;
  _renderUsResults(e.target.value.trim());
}

function _renderUsResults(query) {
  const results = document.getElementById('us-results');
  if (!results) return;

  // Loading state — catalog not ready yet
  if (!CAT || !CAT.length) {
    results.innerHTML = Array.from({length: 5}, () =>
      `<div class="us-skeleton">
        <div class="us-skeleton-dot"></div>
        <div class="us-skeleton-line" style="width:${40 + Math.random()*40|0}%"></div>
      </div>`
    ).join('');
    return;
  }

  const q = query.toLowerCase();

  /* ── COMPARE MODE ── */
  if (_usContext) {
    let frags = CAT.filter(f => {
      // Exclude the frag already in the other slot
      const other = _usContext.slot === 'a' ? CMP_B : CMP_A;
      if (other && f.id === other.id) return false;
      if (!q) return true;
      return matchFrag(f, normQ(q));
    });

    if (_usScores) {
      frags.sort((a, b) => (_usScores.get(b.id)||0) - (_usScores.get(a.id)||0));
    } else {
      frags.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (!frags.length) {
      results.innerHTML = _usEmptyHtml(query);
      return;
    }

    results.innerHTML = frags.slice(0, 10).map((f, i) =>
      _usFragRowHtml(f, i, _usScores ? `${_usScores.get(f.id)||0}%` : null)
    ).join('');
    _wireUsRows(results);
    return;
  }

  /* ── NORMAL MODE — no query: recents + popular ── */
  if (!q) {
    let html = '';
    let rowIdx = 0;

    // Recents
    try {
      const recentIds = JSON.parse(sessionStorage.getItem('sm_recent') || '[]');
      const recentFrags = recentIds.map(id => CAT_MAP[id]).filter(Boolean);
      if (recentFrags.length) {
        html += `<div class="us-section-hdr" role="presentation">Recently Opened</div>`;
        html += recentFrags.map((f, i) => _usFragRowHtml(f, rowIdx++)).join('');
      }
    } catch(e) { /* sessionStorage unavailable */ }

    // Popular
    const popularFrags = US_POPULAR.map(id => CAT_MAP[id]).filter(Boolean);
    if (popularFrags.length) {
      html += `<div class="us-section-hdr" role="presentation">Popular</div>`;
      html += popularFrags.map(f => _usFragRowHtml(f, rowIdx++)).join('');
    }

    results.innerHTML = html || _usEmptyHtml('');
    _wireUsRows(results);
    return;
  }

  /* ── NORMAL MODE — with query ── */
  let html = '';
  let rowIdx = 0;

  // Fragrances (max 6)
  const normQStr = normQ(q);
  const fragMatches = CAT.filter(f => matchFrag(f, normQStr)).slice(0, 6);

  if (fragMatches.length) {
    html += `<div class="us-section-hdr" role="presentation">Fragrances</div>`;
    html += fragMatches.map(f => _usFragRowHtml(f, rowIdx++)).join('');
  }

  // Notes (max 3)
  const noteMatches = (NI || []).filter(n =>
    n._nameN ? n._nameN.includes(normQStr) : n.name.toLowerCase().includes(q)
  ).slice(0, 3);

  if (noteMatches.length) {
    html += `<div class="us-section-hdr" role="presentation">Notes</div>`;
    html += noteMatches.map(n => {
      const tier = n._tier ? (n._tier === 'top' ? 'Top' : n._tier === 'mid' ? 'Heart' : 'Base') : '';
      const sub = [tier, n.family].filter(Boolean).join(' · ');
      return `<button class="list-item list-item--search" role="option" aria-selected="false" id="us-row-${rowIdx}" data-us-type="note" data-us-id="${n.name}" data-row-idx="${rowIdx++}">
        <span class="list-item-icon">🌿</span>
        <span class="list-item-body">
          <span class="list-item-name">${n.name}</span>
          ${sub ? `<span class="list-item-sub">${sub}</span>` : ''}
        </span>
      </button>`;
    }).join('');
  }

  // Houses (max 2) — BRANDS is array of {id, name, desc, url}
  const brandMatches = (BRANDS || []).filter(b =>
    b.name.toLowerCase().includes(q)
  ).slice(0, 2);

  if (brandMatches.length) {
    html += `<div class="us-section-hdr" role="presentation">Houses</div>`;
    html += brandMatches.map(b => {
      const count = CAT.filter(f => f.brand === b.name).length;
      return `<button class="list-item list-item--search" role="option" aria-selected="false" id="us-row-${rowIdx}" data-us-type="house" data-us-id="${b.name}" data-row-idx="${rowIdx++}">
        <span class="list-item-icon">🏛</span>
        <span class="list-item-body">
          <span class="list-item-name">${b.name}</span>
          <span class="list-item-sub">${count} fragrance${count !== 1 ? 's' : ''}</span>
        </span>
      </button>`;
    }).join('');
  }

  results.innerHTML = html || _usEmptyHtml(query);
  _wireUsRows(results);

  // Announce result count to screen readers (Braille display / JAWS users)
  const rowCount = results.querySelectorAll('.list-item--search').length;
  const statusEl = document.getElementById('us-status');
  if (statusEl) {
    statusEl.textContent = rowCount
      ? `${rowCount} result${rowCount !== 1 ? 's' : ''}${query ? ` for "${query}"` : ''}`
      : query ? `No results for "${query}"` : '';
  }
}

function _usFragRowHtml(f, rowIdx, scoreLabel) {
  const fc = getCmpFam(f.family);
  const famLabel = (FAM[f.family]||{label:f.family}).label;
  const owned = isOwned(f.id);
  const wished = isWish(f.id);
  const badge = owned ? 'Owned' : wished ? 'Wishlist' : '';
  return `<button class="list-item list-item--search" role="option" aria-selected="false"
    id="us-row-${rowIdx}" data-us-type="frag" data-us-id="${f.id}" data-row-idx="${rowIdx}">
    <span class="list-item-dot" style="background:${fc.accent}"></span>
    <span class="list-item-body">
      <span class="list-item-name">${f.name}</span>
      <span class="list-item-sub">${f.brand} · ${famLabel}</span>
    </span>
    ${badge ? `<span class="list-item-badge">${badge}</span>` : ''}
    ${scoreLabel ? `<span class="list-item-score">${scoreLabel}</span>` : ''}
  </button>`;
}

function _usEmptyHtml(query) {
  return `<div class="us-empty">
    ${query ? `Nothing matches "<em>${query}</em>"` : 'Start typing to search'}
    <div class="us-empty-hint">Try a fragrance name, note, or house</div>
  </div>`;
}

function _wireUsRows(container) {
  container.querySelectorAll('.list-item--search').forEach(row => {
    row.addEventListener('click', () => _usSelectRow(row));
  });
  // Restore highlight if any
  if (_usHighlight >= 0) _usSetHighlight(_usHighlight);
}

function _usSelectRow(row) {
  const type = row.dataset.usType;
  const id = row.dataset.usId;

  if (type === 'frag') {
    const frag = CAT_MAP[id];
    if (!frag) return;
    if (_usContext) {
      // Compare mode: fill slot and pulse the other empty slot
      const currentSlot = _usContext.slot;
      const otherSlot = currentSlot === 'a' ? 'b' : 'a';
      closeUniversalSearch();
      _selectFragForSlot(currentSlot, frag);
      const otherCard = document.getElementById(`cmp-card-${otherSlot}`);
      if (otherCard && !otherCard.classList.contains('filled')) {
        otherCard.classList.add('us-slot-pulse');
        otherCard.addEventListener('animationend', () => otherCard.classList.remove('us-slot-pulse'), { once: true });
      }
    } else {
      closeUniversalSearch();
      openFragDetail(frag);
    }
  } else if (type === 'note') {
    const note = (NI || []).find(n => n.name === id);
    if (!note) return;
    closeUniversalSearch();
    openDetail(c => renderNoteDetail(c, note), note.name);
  } else if (type === 'house') {
    closeUniversalSearch();
    openHouseDetail(id);
  }
}

// Keyboard navigation within the modal
document.getElementById('universal-search').addEventListener('keydown', function(e) {
  const overlay = this;
  if (overlay.hidden) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    closeUniversalSearch();
    return;
  }

  const rows = Array.from(document.querySelectorAll('#us-results .list-item--search'));
  if (!rows.length) return;

  if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
    e.preventDefault();
    _usHighlight = Math.min(_usHighlight + 1, rows.length - 1);
    _usSetHighlight(_usHighlight);
  } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
    e.preventDefault();
    _usHighlight = Math.max(_usHighlight - 1, 0);
    _usSetHighlight(_usHighlight);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (_usHighlight >= 0 && rows[_usHighlight]) {
      _usSelectRow(rows[_usHighlight]);
    }
  }
});

function _usSetHighlight(idx) {
  const rows = Array.from(document.querySelectorAll('#us-results .list-item--search'));
  rows.forEach((r, i) => {
    const active = i === idx;
    r.setAttribute('aria-selected', active ? 'true' : 'false');
    if (active) {
      r.scrollIntoView({ block: 'nearest' });
      document.getElementById('us-input').setAttribute('aria-activedescendant', r.id || '');
    }
  });
}

function goMobile(id,btn){
  document.querySelectorAll('.mbn-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  go(id,null);
}
window.goMobile = goMobile;

/* ── Detail Pagination ── */
function _setupDetailSwipe(container, currentFrag) {
  let sx=0, sy=0;
  container.addEventListener('touchstart', e=>{
    // Ignore horizontal scrolls in carousels
    if(e.target.closest('.carousel')) return;
    sx=e.touches[0].clientX; sy=e.touches[0].clientY;
  }, {passive:true});

  container.addEventListener('touchend', e=>{
    if(sx===0) return;
    const dx=e.changedTouches[0].clientX-sx;
    const dy=e.changedTouches[0].clientY-sy;
    sx=0; sy=0;
    if(Math.abs(dx)>Math.abs(dy) && Math.abs(dx)>60) {
      // Find current index in CAT
      const idx = CAT.findIndex(f => f.id === currentFrag.id);
      if(idx === -1) return;

      let targetFrag = null;
      let animClass = '';
      if(dx < 0 && idx < CAT.length - 1) { // Swipe left -> Next
        targetFrag = CAT[idx + 1];
        animClass = 'slide-left';
      } else if(dx > 0 && idx > 0) { // Swipe right -> Prev
        targetFrag = CAT[idx - 1];
        animClass = 'slide-right';
      }

      if(targetFrag) {
        window.haptic?.('light');
        if(isDesktop() || isTablet()) {
          // Replace top of stack
          detailStack[detailStack.length - 1] = c => renderFragDetail(c, targetFrag);
          _renderDeskDetail(false, animClass);
        } else {
          // Mobile: push a new sheet
          pushSheet(c => renderFragDetail(c, targetFrag), targetFrag.name);
        }
      }
    }
  }, {passive:true});
}

/* ── Settings button ── */
window.settingsGo=function(id){
  const menu=document.getElementById('settings-menu');
  if(menu){
    menu.hidden=true;
    const btn=document.getElementById('settings-btn');
    if(btn)btn.setAttribute('aria-expanded', 'false');
  }
  const backBtn=document.getElementById('nav-back-btn');
  if(backBtn)backBtn.hidden=false;
  go(id,null);
};
window.navBack=function(){
  const backBtn=document.getElementById('nav-back-btn');
  if(backBtn)backBtn.hidden=true;
  go('compare',null);
};
document.addEventListener('DOMContentLoaded',function(){
  const settingsBtn=document.getElementById('settings-btn');
  const settingsMenu=document.getElementById('settings-menu');
  if(settingsBtn&&settingsMenu){
    settingsBtn.addEventListener('click',function(e){
      e.stopPropagation();
      settingsMenu.hidden=!settingsMenu.hidden;
      settingsBtn.setAttribute('aria-expanded', !settingsMenu.hidden);
    });
    document.addEventListener('click',function(){
      if(settingsMenu){
        settingsMenu.hidden=true;
        settingsBtn.setAttribute('aria-expanded', 'false');
      }
    });
    settingsMenu.addEventListener('click',function(e){e.stopPropagation();});
  }

  // Auth modal wiring
  document.getElementById('auth-modal-scrim')?.addEventListener('click', closeAuthModal);
  document.getElementById('auth-modal-close')?.addEventListener('click', closeAuthModal);
  document.getElementById('auth-btn-guest')?.addEventListener('click', closeAuthModal);
  document.getElementById('auth-email-form')?.addEventListener('submit', e => {
    e.preventDefault();
    sendMagicLink(document.getElementById('auth-email-input')?.value.trim());
  });
  document.getElementById('auth-btn-back')?.addEventListener('click', openAuthModal);
  // nav-signin-btn click is managed by updateNavForUser() (toggles between openAuthModal / signOut)
  updateNavForUser();
  initSupabaseAuth();
});
function openMoreSheet(btn){
  document.querySelectorAll('.mbn-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const _ico={
    star:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    megaphone:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/><path d="M8 6v8"/></svg>`,
    library:`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>`,
  };
  const items=[
    {id:'daily',icon:'<span style="font-size:18px;line-height:18px">🧠</span>', label:'Daily Challenge', action:"closeAllSheets();_openNoseGame()"},
    {id:'saved',icon:_ico.star, label:'My Collection', action:"closeAllSheets();goMobile('saved',document.querySelector('.mbn-more'))"},
    {id:'changelog',icon:_ico.megaphone, label:'Changelog', action:"closeAllSheets();goMobile('changelog',document.querySelector('.mbn-more'))"},
    {id:'playground',icon:_ico.library, label:'Design System', action:"window.open('/playground.html', '_blank')"}
  ];
  pushSheet(el=>{
    el.innerHTML=`<div style="padding:var(--sp-lg) 0 var(--sp-sm)">
      <div style="font-size:var(--fs-label);font-weight:700;letter-spacing:var(--ls-wide);text-transform:uppercase;color:var(--text-secondary);padding:0 var(--sp-lg) var(--sp-md)">More</div>
      ${items.map(it=>`
        <button class="settings-menu-item" onclick="${it.action}">
          <span class="settings-menu-icon">${it.icon}</span>
          ${it.label}
        </button>`).join('')}
    </div>`;
  });
}

/* ══ COMPARE ════════════════════════════════════════════════════════ */
let CMP_A=null,CMP_B=null;

const CMP_FAM={
  woody:   {accent:'#8B4513',light:'#FDF5EE'},
  floral:  {accent:'#B5366E',light:'#FFF4F9'},
  amber:   {accent:'#B86A00',light:'#FFFBF0'},
  citrus:  {accent:'#7A8A00',light:'#FAFDE8'},
  leather: {accent:'#5A2D0C',light:'#FAF5F0'},
  oud:     {accent:'#6E2080',light:'#F8F0FC'},
  green:   {accent:'#1A6030',light:'#F0FAF2'},
  chypre:  {accent:'#2A5C50',light:'#EEF8F5'},
  gourmand:{accent:'#6B2030',light:'#FAF0F2'},
  aquatic: {accent:'#004A80',light:'#EEF8FF'},
};
function getCmpFam(fam){return CMP_FAM[fam]||{accent:'#6B6356',light:'#F5F2EC'};}

/* ── Scoring helpers ── */
function computeProfile(frag){ return engine.computeProfile(frag); }
function getSwapReason(anchor, candidate){ return engine.getSwapReason(anchor, candidate, FAM); }

function scoreLayeringPct(a,b){return Math.round(Math.min(100,scoreLayeringPair(a,b)/75*100));}
function _simLabel(pct){if(pct<26)return'Very different';if(pct<51)return'Notably different';if(pct<76)return'Fairly similar';return'Nearly identical';}
function _layLabel(pct){if(pct<25)return'Poor pairing';if(pct<50)return'Uneasy together';if(pct<75)return'Workable pair';return'Good pairing';}

function getVerdict(matchPct,layerPct,fa,fb){
  const shortA=fa.name.split(' ')[0],shortB=fb.name.split(' ')[0];
  const sameFam=fa.family===fb.family;
  const famLabel=(FAM[fa.family]||{label:fa.family}).label;
  if(matchPct>=70&&layerPct>=65)return`${shortA} and ${shortB} are genuinely kindred spirits — they share DNA at the note level and project beautifully together.`;
  if(matchPct>=70)return`${shortA} and ${shortB} smell remarkably alike. Better as alternates than a layering pair — their overlap is too high for interesting contrast.`;
  if(layerPct>=65&&matchPct<50){
    if(sameFam)return`${shortA} and ${shortB} share a ${famLabel} character but diverge enough in their notes to layer with real depth.`;
    return`${shortA} and ${shortB} pair well. Their contrast in character and sillage creates depth without competing.`;
  }
  if(matchPct>=50&&layerPct>=50)return`A solid pairing. ${shortA} and ${shortB} share enough character to feel cohesive, with enough contrast to layer interestingly.`;
  if(matchPct<35&&layerPct<35){
    if(sameFam)return`${shortA} and ${shortB} share a ${famLabel} family but express it very differently — they may feel like distant cousins rather than a natural pair.`;
    return`${shortA} and ${shortB} are quite different — they may feel unrelated or clash if layered.`;
  }
  if(matchPct>=50)return`${shortA} and ${shortB} share similar character and work well as alternates. They won't layer in unexpected ways but feel consistent.`;
  if(sameFam)return`${shortA} and ${shortB} sit within the same ${famLabel} family but express it differently — interesting to compare, not obvious to layer.`;
  return`${shortA} and ${shortB} are distinct enough to explore separately. Treat them as contrasts rather than complements.`;
}

/* ── Combined radar (solid + dashed overlay) ── */
function _setupChartHaptics(containerSelector, pointSelector) {
  // Shared helper to trigger haptic ticks when dragging over chart points
  const res = document.getElementById('cmp-results');
  if(!res) return;
  const charts = res.querySelectorAll(containerSelector);
  charts.forEach(chart => {
    let lastHovered = null;
    chart.addEventListener('touchmove', e => {
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if(target && target.matches(pointSelector)) {
        if(target !== lastHovered) {
          window.haptic?.('selection');
          lastHovered = target;
        }
      } else {
        lastHovered = null;
      }
    }, {passive:true});
    // Add simple mousemove equivalent for desktop
    chart.addEventListener('mousemove', e => {
      if(e.target && e.target.matches(pointSelector)) {
        if(e.target !== lastHovered) {
          window.haptic?.('selection');
          lastHovered = e.target;
        }
      } else {
        lastHovered = null;
      }
    }, {passive:true});
  });
}

function drawCombinedRadarSvg(fa,fb,caAccent,cbAccent){
  const dims=['freshness','sweetness','warmth','intensity','complexity'];
  const labels=['Fresh','Sweet','Warm','Intensity','Depth'];
  const pa=computeProfile(fa),pb=computeProfile(fb);
  const cx=110,cy=110,r=76,n=5;
  function ap(i,val){const a=(Math.PI*2*i/n)-Math.PI/2;return{x:cx+r*val*Math.cos(a),y:cy+r*val*Math.sin(a)};}
  const rings=[0.25,0.5,0.75,1.0].map(rv=>{
    const pts=dims.map((_,i)=>ap(i,rv));
    return`<polygon points="${pts.map(pt=>`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ')}" fill="none" stroke="#0E0C0912" stroke-width="1"/>`;
  }).join('');
  const axes=dims.map((_,i)=>{const e=ap(i,1);return`<line x1="${cx}" y1="${cy}" x2="${e.x.toFixed(1)}" y2="${e.y.toFixed(1)}" stroke="#0E0C0912" stroke-width="1"/>`;}).join('');
  const polyA=dims.map((d,i)=>{const pt=ap(i,pa[d]);return`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;}).join(' ');
  const polyB=dims.map((d,i)=>{const pt=ap(i,pb[d]);return`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;}).join(' ');
  const dotsA=dims.map((d,i)=>{const pt=ap(i,pa[d]);return`<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="3" fill="${caAccent}"/>`;}).join('');
  const dotsB=dims.map((d,i)=>{const pt=ap(i,pb[d]);return`<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="3" fill="${cbAccent}"/>`;}).join('');
  const lbls=dims.map((_,i)=>{
    const lp=ap(i,1.32);const anch=lp.x<cx-4?'end':lp.x>cx+4?'start':'middle';
    return`<text x="${lp.x.toFixed(1)}" y="${lp.y.toFixed(1)}" text-anchor="${anch}" dominant-baseline="middle" font-size="8.5" fill="#6B635699" font-family="DM Sans,system-ui,sans-serif" font-weight="700" letter-spacing="0.04em">${labels[i]}</text>`;
  }).join('');
  return`<div class="cmp-radar-v2">
    <div class="cmp-radar-v2-label">Character</div>
    <div class="cmp-radar-v2-wrap"><svg viewBox="-18 -8 256 246" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="radar-title-${fa.id}-${fb.id}">
      <title id="radar-title-${fa.id}-${fb.id}">Fragrance profile comparison</title>
      <desc>Radar chart comparing ${fa.name} (${dims.map((d,i)=>`${labels[i]}: ${Math.round(pa[d]*100)}%`).join(', ')}) versus ${fb.name} (${dims.map((d,i)=>`${labels[i]}: ${Math.round(pb[d]*100)}%`).join(', ')}).</desc>
      ${rings}${axes}
      <polygon points="${polyA}" fill="${caAccent}20" stroke="${caAccent}" stroke-width="1.8" stroke-linejoin="round"/>
      <polygon points="${polyB}" fill="${cbAccent}18" stroke="${cbAccent}" stroke-width="1.8" stroke-linejoin="round" stroke-dasharray="5,3"/>
      ${dotsA}${dotsB}${lbls}
    </svg></div>
    <div class="cmp-radar-legend">
      <div class="cmp-radar-legend-item"><div class="cmp-radar-legend-line" style="background:${caAccent}"></div><span>${fa.name}</span></div>
      <div class="cmp-radar-legend-item"><div class="cmp-radar-legend-line dashed" style="border-color:${cbAccent}"></div><span>${fb.name}</span></div>
    </div>
  </div>`;
}

/* ── Scatter plot: sillage × layering with 4 zones ── */
function drawScatterSvg(fa,fb,caAccent,cbAccent){
  const W=300,H=260,padL=50,padB=40,padT=14,padR=22;
  const pw=W-padL-padR,ph=H-padB-padT;
  const ox=padL,oy=H-padB;
  const px=v=>ox+(v-1)/9*pw,py=v=>oy-(v-1)/9*ph;
  const xA=px(fa.sillage||5),yA=py(fa.layering||5);
  const xB=px(fb.sillage||5),yB=py(fb.layering||5);
  const qx=ox+pw/2,qy=oy-ph/2;
  const zones=[
    {x:ox,y:padT,w:pw/2,h:ph/2,label:'Personal',sub:'journey'},
    {x:qx,y:padT,w:pw/2,h:ph/2,label:'Room',sub:'presence'},
    {x:ox,y:qy,w:pw/2,h:ph/2,label:'Skin',sub:'scent'},
    {x:qx,y:qy,w:pw/2,h:ph/2,label:'Statement',sub:''},
  ];
  const zRects=zones.map(z=>`<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" fill="#0E0C09" opacity="0.035"/>`).join('');
  const zLabels=zones.map(z=>`<text x="${(z.x+z.w/2).toFixed(1)}" y="${(z.y+11).toFixed(1)}" text-anchor="middle" font-size="7" fill="#0E0C0945" font-family="DM Sans,sans-serif" font-weight="700" letter-spacing="0.06em">${z.label}</text>${z.sub?`<text x="${(z.x+z.w/2).toFixed(1)}" y="${(z.y+20).toFixed(1)}" text-anchor="middle" font-size="7" fill="#0E0C0945" font-family="DM Sans,sans-serif" font-weight="700" letter-spacing="0.06em">${z.sub}</text>`:''}`).join('');
  const grid=`<line x1="${qx.toFixed(1)}" y1="${padT}" x2="${qx.toFixed(1)}" y2="${oy}" stroke="#0E0C0918" stroke-width="1" stroke-dasharray="3,3"/><line x1="${ox}" y1="${qy.toFixed(1)}" x2="${(ox+pw)}" y2="${qy.toFixed(1)}" stroke="#0E0C0918" stroke-width="1" stroke-dasharray="3,3"/>`;
  const axes=`<line x1="${ox}" y1="${oy}" x2="${ox+pw}" y2="${oy}" stroke="#0E0C0928" stroke-width="1.2"/><line x1="${ox}" y1="${oy}" x2="${ox}" y2="${padT}" stroke="#0E0C0928" stroke-width="1.2"/>`;
  const xLbl=`<text x="${(ox+pw/2).toFixed(1)}" y="${H-6}" text-anchor="middle" font-size="7.5" fill="#6B6356" font-family="DM Sans,sans-serif" font-weight="700" letter-spacing="0.06em">SILLAGE →</text>`;
  const yLbl=`<text x="14" y="${(oy-ph/2).toFixed(1)}" text-anchor="middle" font-size="7.5" fill="#6B6356" font-family="DM Sans,sans-serif" font-weight="700" letter-spacing="0.06em" transform="rotate(-90,14,${(oy-ph/2).toFixed(1)})">STRUCTURE</text>`;
  const close=Math.abs(xA-xB)<18&&Math.abs(yA-yB)<18;
  const ptA=`<circle cx="${xA.toFixed(1)}" cy="${yA.toFixed(1)}" r="8" fill="${caAccent}" opacity="0.88"/>`;
  const ptB=`<circle cx="${xB.toFixed(1)}" cy="${yB.toFixed(1)}" r="8" fill="${cbAccent}" opacity="0.88"/>`;
  const lA=`<text x="${(xA+11).toFixed(1)}" y="${yA.toFixed(1)}" dominant-baseline="middle" font-size="7.5" fill="${caAccent}" font-family="DM Sans,sans-serif" font-weight="700">${fa.name}</text>`;
  const lBY=close?(yB-14):yB;
  const lB=`<text x="${(xB+11).toFixed(1)}" y="${lBY.toFixed(1)}" dominant-baseline="middle" font-size="7.5" fill="${cbAccent}" font-family="DM Sans,sans-serif" font-weight="700">${fb.name}</text>`;
  return`<div class="cmp-scatter-v2">
    <div class="cmp-scatter-v2-label">Sillage &amp; Complexity</div>
    <div class="cmp-scatter-v2-wrap"><svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="scatter-title-${fa.id}-${fb.id}">
      <title id="scatter-title-${fa.id}-${fb.id}">Sillage and complexity plot</title>
      <desc>${fa.name} has sillage ${fa.sillage||5}/10 and complexity ${fa.layering||5}/10. ${fb.name} has sillage ${fb.sillage||5}/10 and complexity ${fb.layering||5}/10.</desc>
      ${zRects}${zLabels}${grid}${axes}${xLbl}${yLbl}${ptA}${ptB}${lA}${lB}
    </svg></div>
  </div>`;
}

/* ── 3×3 notes grid (rows=Top/Mid/Base, cols=A only|Shared|B only) ── */
function render3x3Notes(fa,fb,caAccent,cbAccent){
  const aTop=fa._nTop||[],aMid=fa._nMid||[],aBase=fa._nBase||[];
  const bTop=fb._nTop||[],bMid=fb._nMid||[],bBase=fb._nBase||[];
  const shTop=aTop.filter(n=>bTop.includes(n));
  const shMid=aMid.filter(n=>bMid.includes(n));
  const shBase=aBase.filter(n=>bBase.includes(n));
  const cap=n=>n.charAt(0).toUpperCase()+n.slice(1);
  const shortA=fa.name.split(' ').slice(0,2).join(' ');
  const shortB=fb.name.split(' ').slice(0,2).join(' ');
  const onlyATop=aTop.filter(n=>!bTop.includes(n)),onlyAMid=aMid.filter(n=>!bMid.includes(n)),onlyABase=aBase.filter(n=>!bBase.includes(n));
  const onlyBTop=bTop.filter(n=>!aTop.includes(n)),onlyBMid=bMid.filter(n=>!aMid.includes(n)),onlyBBase=bBase.filter(n=>!aBase.includes(n));
  // Render notes as pills — consistent presentation; clickable if in NI_MAP
  const pill=(n,isSh=false)=>{
    const ni=NI_MAP[n];
    const cls=`cmp-note-pill${isSh?' shared':''}`;
    const savedMark = isNoteSaved(n) ? ' <span style="color:var(--accent);margin-left:2px;font-size:0.85em;text-decoration:none;display:inline-block;">★</span>' : '';
    return ni?`<button class="${cls}" data-note="${cap(n)}">${cap(n)}${savedMark}</button>`
             :`<span class="${cls}">${cap(n)}</span>`;
  };
  const links=(notes,isSh=false)=>notes.length
    ?notes.map(n=>pill(n,isSh)).join('')
    :'<span class="cmp-grid-empty">—</span>';
  function noteRow(layerLabel,onlyA,shared,onlyB){
    return`<div class="cmp-grid-row three">
      <div class="cmp-grid-cell cmp-grid-cell-a">${links(onlyA)}</div>
      <div class="cmp-grid-cell cell-center">
        <div class="cmp-grid-layer-lbl">${layerLabel}</div>
        ${links(shared,true)}
      </div>
      <div class="cmp-grid-cell cmp-grid-cell-b">${links(onlyB)}</div>
    </div>`;
  }
  return`<div class="cmp-notes-v2">
    <div class="cmp-notes-v2-label">Notes</div>
    <div class="cmp-grid-col-heads three">
      <div class="cmp-grid-col-head" style="color:${caAccent}">${shortA}</div>
      <div class="cmp-grid-col-head" style="color:var(--g400)">Shared</div>
      <div class="cmp-grid-col-head" style="color:${cbAccent}">${shortB}</div>
    </div>
    <div class="cmp-grid-3x3">
      ${noteRow('Top',onlyATop,shTop,onlyBTop)}
      ${noteRow('Heart',onlyAMid,shMid,onlyBMid)}
      ${noteRow('Base',onlyABase,shBase,onlyBBase)}
    </div>
  </div>`;
}

/* ── Mini radar SVG for swap suggestions ── */
function _miniRadarSvg(frag,accent){
  const dims=['freshness','sweetness','warmth','intensity','complexity'];
  const p=computeProfile(frag);
  const cx=28,cy=28,r=20,n=5;
  function ap(i,val){const a=(Math.PI*2*i/n)-Math.PI/2;return{x:cx+r*val*Math.cos(a),y:cy+r*val*Math.sin(a)};}
  const ring=dims.map((_,i)=>ap(i,1));
  const ringPts=ring.map(pt=>`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
  const midPts=dims.map((_,i)=>ap(i,0.5)).map(pt=>`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
  const polyPts=dims.map((d,i)=>{const pt=ap(i,p[d]);return`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;}).join(' ');
  return`<svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <polygon points="${midPts}" fill="none" stroke="#0E0C0918" stroke-width="0.8"/>
    <polygon points="${ringPts}" fill="none" stroke="#0E0C0918" stroke-width="0.8"/>
    <polygon points="${polyPts}" fill="${accent}28" stroke="${accent}" stroke-width="1.4" stroke-linejoin="round"/>
  </svg>`;
}

/* ── Suggestions v2: two columns, family + notes + mini radar ── */
function renderSuggestionsV2(fa,fb,ca,cb){
  function getSugs(anchor,other){
    return CAT.filter(f=>f.id!==anchor.id&&f.id!==other.id)
      .map(f=>({f,score:scoreSimilarity(anchor,f)}))
      .sort((a,b)=>b.score-a.score).slice(0,3);
  }
  function sugCard(frag, anchor, accent){
    const fc=getCmpFam(frag.family);
    const famLabel=(FAM[frag.family]||{label:frag.family}).label;
    const topNotes=[...(frag.top||[])].slice(0,3).join(', ');
    const reason=getSwapReason(anchor, frag);
    return`<button class="list-item list-item--flat cmp-sug-card" data-fid="${frag.id}">
      <div class="list-item-content">
        <div class="list-item-dot" style="background:${fc.accent}"></div>
        <div class="list-item-body" style="flex:1;text-align:left;">
          <div class="list-item-name">${frag.name}</div>
          <div class="list-item-sub">${frag.brand} · ${famLabel}</div>
          <div class="dc-sim-reason">${reason}</div>
          ${topNotes?`<div class="list-item-meta">${topNotes}</div>`:''}
        </div>
      </div>
    </button>`;
  }
  const sugsA=getSugs(fa,fb),sugsB=getSugs(fb,fa);
  const shortA=fa.name.split(' ').slice(0,2).join(' ');
  const shortB=fb.name.split(' ').slice(0,2).join(' ');
  return`<div class="cmp-sug-v2">
    <div class="sec-label">Swap suggestions</div>
    <div class="cmp-sug-columns">
      <div>
        <div class="cmp-sug-col-head" style="color:${ca.accent}">Swap ${shortA}</div>
        <div class="cmp-sug-col-items">${sugsA.map(({f})=>sugCard(f,fa,ca.accent)).join('')}</div>
      </div>
      <div>
        <div class="cmp-sug-col-head" style="color:${cb.accent}">Swap ${shortB}</div>
        <div class="cmp-sug-col-items">${sugsB.map(({f})=>sugCard(f,fb,cb.accent)).join('')}</div>
      </div>
    </div>
  </div>`;
}

/* ── Score educational overlay ── */
function openCharacterEdu(fa, fb, ca, cb) {
  let overlay = document.getElementById('cmp-edu-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'cmp-edu-overlay';
    overlay.className = 'cmp-edu-overlay';
    document.body.appendChild(overlay);
  }

  const dims = [
    { key: 'freshness', label: 'Fresh', desc: 'Bright, uplifting notes like citrus, green leaves, and aquatic elements.' },
    { key: 'sweetness', label: 'Sweet', desc: 'Sugary, floral, or gourmand notes like vanilla, fruit, and sweet resins.' },
    { key: 'warmth', label: 'Warm', desc: 'Cozy, deep notes like woods, spices, amber, and musk.' },
    { key: 'intensity', label: 'Intensity', desc: 'How powerful the scent feels right away (projection/sillage).' },
    { key: 'complexity', label: 'Depth', desc: 'How many different types of notes evolve over time.' }
  ];

  const pa = computeProfile(fa);
  const pb = computeProfile(fb);

  // Helper to find contributing notes for a dimension
  const getNoteContributors = (frag, dimKey) => {
    const allNotes = [...(frag._nTop || []), ...(frag._nMid || []), ...(frag._nBase || [])];
    const matching = allNotes.filter(n => {
      const profile = NOTE_PROFILE[n.toLowerCase()]; // [freshness, sweetness, warmth]
      if (!profile) return false;
      if (dimKey === 'freshness') return profile[0] > 0.55;
      if (dimKey === 'sweetness') return profile[1] > 0.55;
      if (dimKey === 'warmth') return profile[2] > 0.55;
      return false;
    });
    return [...new Set(matching)].slice(0, 3);
  };

  // Find a suggestion for a dimension (someone who might want more of this)
  const getSwapSuggestion = (dimKey) => {
    const sorted = Object.values(CAT_MAP).map(f => ({ f, p: computeProfile(f) })).sort((a, b) => b.p[dimKey] - a.p[dimKey]);
    const topScorers = sorted.filter(x => x.f.id !== fa.id && x.f.id !== fb.id).slice(0, 10);
    if (topScorers.length === 0) return null;
    return topScorers[Math.floor(Math.random() * topScorers.length)].f;
  };

  const cap = n => n.charAt(0).toUpperCase() + n.slice(1);

  const html = `
    <div class="cmp-edu-wrap">
      <div class="cmp-edu-header">
        <div class="cmp-edu-header-left">
          <div class="cmp-edu-label">Character</div>
          <div class="cmp-edu-num">Map</div>
        </div>
        <button class="cmp-edu-close" aria-label="Close" onclick="document.getElementById('cmp-edu-overlay').classList.remove('open')">✕ Close</button>
      </div>
      <div class="cmp-edu-content">
        <p class="cmp-edu-intro">The Character Map compares five key sensory dimensions. Here&rsquo;s what they mean and which notes drive them.</p>

        <div class="cmp-edu-grid">
          ${dims.map(dim => {
            const isNoteDriven = ['freshness', 'sweetness', 'warmth'].includes(dim.key);
            const notesA = isNoteDriven ? getNoteContributors(fa, dim.key) : [];
            const notesB = isNoteDriven ? getNoteContributors(fb, dim.key) : [];
            const suggestion = getSwapSuggestion(dim.key);

            return `
              <div class="cmp-edu-card">
                <div class="cmp-edu-card-title">${dim.label}</div>
                <div class="cmp-edu-card-desc">${dim.desc}</div>

                ${isNoteDriven ? `
                  <div class="cmp-edu-card-notes">
                    <div class="cmp-edu-card-notes-row">
                      <span class="cmp-edu-card-notes-frag" style="color:${ca.accent}">${fa.name}</span>
                      <span class="cmp-edu-card-notes-list">${notesA.length ? notesA.map(cap).join(', ') : '—'}</span>
                    </div>
                    <div class="cmp-edu-card-notes-row">
                      <span class="cmp-edu-card-notes-frag" style="color:${cb.accent}">${fb.name}</span>
                      <span class="cmp-edu-card-notes-list">${notesB.length ? notesB.map(cap).join(', ') : '—'}</span>
                    </div>
                  </div>
                ` : `
                  <div class="cmp-edu-card-notes">
                    <div class="cmp-edu-card-notes-row">
                      <span class="cmp-edu-card-notes-frag" style="color:${ca.accent}">${fa.name}</span>
                      <span class="cmp-edu-card-notes-list">${Math.round(pa[dim.key]*100)}%</span>
                    </div>
                    <div class="cmp-edu-card-notes-row">
                      <span class="cmp-edu-card-notes-frag" style="color:${cb.accent}">${fb.name}</span>
                      <span class="cmp-edu-card-notes-list">${Math.round(pb[dim.key]*100)}%</span>
                    </div>
                  </div>
                `}

                ${suggestion ? `
                  <div class="cmp-edu-suggestion" onclick="openScent('${suggestion.id}')">
                    <div class="cmp-edu-suggestion-label">Want more ${dim.label}?</div>
                    <div class="cmp-edu-suggestion-name"><strong>${suggestion.name}</strong> by ${BRANDS_MAP[suggestion.brand] || suggestion.brand}</div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  overlay.innerHTML = html;

  // Transition in
  requestAnimationFrame(() => overlay.classList.add('open'));

  // Handle cleanup on transition out
  const wrap = overlay.querySelector('.cmp-edu-wrap');
  wrap.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'transform' && !overlay.classList.contains('open')) {
      overlay.remove();
    }
  });

  // Close on scrim click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
    }
  });
}

function openScoreEdu(type,matchPct,layerPct,fa,fb){
  let overlay=document.getElementById('cmp-edu-overlay');
  if(!overlay){overlay=document.createElement('div');overlay.id='cmp-edu-overlay';overlay.className='cmp-edu-overlay';document.body.appendChild(overlay);}
  const isMatch=type==='match';
  const pct=isMatch?matchPct:layerPct;
  const label=isMatch?'Similarity':'Pairing';
  const quads=isMatch?[
    {tag:'High match ≥ 70',title:'Kindred spirits',desc:'Same family, many shared notes. Great as alternates for the same occasion.',hi:matchPct>=70},
    {tag:'Good match 50–69',title:'Cohesive pair',desc:'Enough DNA in common to feel related. Alternate or layer lightly.',hi:matchPct>=50&&matchPct<70},
    {tag:'Low match 30–49',title:'Distinct contrast',desc:'Different enough to complement. Explore separately or layer for depth.',hi:matchPct>=30&&matchPct<50},
    {tag:'Very low < 30',title:'Different worlds',desc:'Little in common. May feel jarring together but powerful as a contrast.',hi:matchPct<30},
  ]:[
    {tag:'Good pairing ≥ 65',title:'Complementary pair',desc:'Different sillage + compatible families + unique note sets. Wear together with confidence.',hi:layerPct>=65},
    {tag:'Workable 45–64',title:'Works together',desc:'Some contrast in projection and notes. Interesting but not always balanced.',hi:layerPct>=45&&layerPct<65},
    {tag:'Uneasy 25–44',title:'Possible, with care',desc:'Similar sillage or competing notes. Layer sparingly to avoid muddiness.',hi:layerPct>=25&&layerPct<45},
    {tag:'Poor pairing < 25',title:'Better as alternates',desc:'Very similar projection or note profiles. Better worn separately.',hi:layerPct<25},
  ];
  let bodyContent = '';
  if (isMatch) {
    const famScore=(FAM_COMPAT[fa.family]?.[fb.family]??0.5)*40;
    const shBase=fa._nBase.filter(n=>fb._nBase.includes(n)).length;
    const shMid=fa._nMid.filter(n=>fb._nMid.includes(n)).length;
    const shTop=fa._nTop.filter(n=>fb._nTop.includes(n)).length;
    const noteScore=Math.min(30,shBase*5+shMid*3+shTop*2);
    const sillDiff=Math.abs(fa.sillage-fb.sillage);
    const sillScore=sillDiff<=2?10:sillDiff<=4?5:0;
    const shRoles=fa.roles.filter(r=>fb.roles.includes(r)).length;
    const roleScore=Math.min(20,shRoles*7);
    const rawScore = famScore + noteScore + sillScore + roleScore;

    bodyContent = `
      <div class="cmp-edu-intro">How is this score calculated, and what does it mean for this pair?</div>
      <div class="cmp-edu-grid">
        ${quads.map(q=>`<div class="cmp-edu-quad${q.hi?' highlight':''}"><div class="cmp-edu-quad-tag">${q.tag}</div><div class="cmp-edu-quad-title">${q.title}</div><div class="cmp-edu-quad-desc">${q.desc}</div></div>`).join('')}
      </div>
      <div class="cmp-edu-math">
        <div class="cmp-edu-math-title">Similarity Math</div>
        <div class="cmp-edu-math-row">
          <span class="cmp-edu-math-label">Family Match</span>
          <span class="cmp-edu-math-score">${Math.round(famScore)}/40</span>
        </div>
        <div class="cmp-edu-math-row">
          <span class="cmp-edu-math-label">Shared Notes</span>
          <span class="cmp-edu-math-score">${Math.round(noteScore)}/30</span>
        </div>
        <div class="cmp-edu-math-row">
          <span class="cmp-edu-math-label">Sillage Match</span>
          <span class="cmp-edu-math-score">${Math.round(sillScore)}/10</span>
        </div>
        <div class="cmp-edu-math-row">
          <span class="cmp-edu-math-label">Role Overlap</span>
          <span class="cmp-edu-math-score">${Math.round(roleScore)}/20</span>
        </div>
        <div class="cmp-edu-math-row total">
          <span class="cmp-edu-math-label">Raw Similarity Score</span>
          <span class="cmp-edu-math-score">${Math.round(rawScore)}/100</span>
        </div>
      </div>
    `;
  } else {
    const famComp=FAM_COMPAT[fa.family]?.[fb.family]??0.5;
    const famScore=famComp*35;
    const sillDiff=Math.abs(fa.sillage-fb.sillage);
    const sillScore=sillDiff>=3?20:sillDiff>=1?10:0;
    const shared=fa._nAll.filter(n=>fb._nAll.includes(n)).length;
    const noteScore=shared===0?20:shared<=2?12:shared<=4?5:0;
    const rawScore = famScore + sillScore + noteScore;

    bodyContent = `
      <div class="cmp-edu-intro">How is this score calculated, and what does it mean for this pair?</div>
      <div class="cmp-edu-grid">
        ${quads.map(q=>`<div class="cmp-edu-quad${q.hi?' highlight':''}"><div class="cmp-edu-quad-tag">${q.tag}</div><div class="cmp-edu-quad-title">${q.title}</div><div class="cmp-edu-quad-desc">${q.desc}</div></div>`).join('')}
      </div>
      <div class="cmp-edu-math">
        <div class="cmp-edu-math-title">Layering Math</div>
        <div class="cmp-edu-math-row">
          <span class="cmp-edu-math-label">Family Compatibility</span>
          <span class="cmp-edu-math-score">${Math.round(famScore)}/35</span>
        </div>
        <div class="cmp-edu-math-row">
          <span class="cmp-edu-math-label">Sillage Contrast</span>
          <span class="cmp-edu-math-score">${Math.round(sillScore)}/20</span>
        </div>
        <div class="cmp-edu-math-row">
          <span class="cmp-edu-math-label">Note Independence</span>
          <span class="cmp-edu-math-score">${Math.round(noteScore)}/20</span>
        </div>
        <div class="cmp-edu-math-row total">
          <span class="cmp-edu-math-label">Raw Layering Score</span>
          <span class="cmp-edu-math-score">${Math.round(rawScore)}/75</span>
        </div>
      </div>
    `;
  }

  overlay.innerHTML=`<div class="cmp-edu-wrap">
    <div class="cmp-edu-header">
      <div class="cmp-edu-header-left">
        <div class="cmp-edu-label">${label}</div>
        <div class="cmp-edu-num">${pct}%</div>
      </div>
      <button class="cmp-edu-close" id="cmp-edu-close">✕ Close</button>
    </div>
    <div class="cmp-edu-body">
      ${bodyContent}
    </div>
  </div>`;
  overlay.classList.add('open');
  overlay.addEventListener('click',e=>{if(e.target===overlay)closeScoreEdu();});
  document.getElementById('cmp-edu-close')?.addEventListener('click',closeScoreEdu);
}
function closeScoreEdu(){const o=document.getElementById('cmp-edu-overlay');if(o)o.classList.remove('open');}

/* ── Sticky bar scroll watcher ── */
function _initStickyScroll(){
  const header=document.getElementById('cmp-header');
  const stickyBar=document.getElementById('cmp-sticky-bar');
  if(!header||!stickyBar)return;
  if(window._cmpStickyObs)window._cmpStickyObs.disconnect();
  window._cmpStickyObs=new IntersectionObserver(entries=>{
    const visible=entries[0].isIntersecting;
    if(!visible){
      stickyBar.classList.add('visible');
      if(!stickyBar._hapticDone){window.haptic?.('selection');stickyBar._hapticDone=true;}
    }else{
      stickyBar.classList.remove('visible');
      stickyBar._hapticDone=false;
    }
  },{threshold:0.1});
  window._cmpStickyObs.observe(header);
}

/* ── Popular Comparisons (shown when compare results area is empty) ── */
let _popularPairs = [];
function renderPopularComparisons() {
  const res = document.getElementById('cmp-results');
  if (!res || !_popularPairs.length) return;
  // Don't overwrite actual results
  if (CMP_A && CMP_B) return;

  const cards = _popularPairs.map(p => {
    const fa = CAT_MAP[p.a], fb = CAT_MAP[p.b];
    if (!fa || !fb) return '';
    const matchPct = Math.round(scoreSimilarity(fa, fb));
    const colorA = FAM[fa.family]?.color || 'var(--resin)';
    const colorB = FAM[fb.family]?.color || 'var(--resin)';
    return `<button class="pop-cmp-card" role="button" tabindex="0"
      data-a="${fa.id}" data-b="${fb.id}"
      aria-label="Compare ${fa.name} by ${fa.brand} with ${fb.name} by ${fb.brand}">
      <span class="pop-cmp-label">${p.label}</span>
      <span class="pop-cmp-pair">
        <span class="pop-cmp-frag">
          <span class="picker-fdot" style="background:${colorA}"></span>
          <span class="pop-cmp-name">${fa.name}</span>
          <span class="pop-cmp-brand">${fa.brand}</span>
        </span>
        <span class="pop-cmp-vs">${matchPct}%</span>
        <span class="pop-cmp-frag">
          <span class="picker-fdot" style="background:${colorB}"></span>
          <span class="pop-cmp-name">${fb.name}</span>
          <span class="pop-cmp-brand">${fb.brand}</span>
        </span>
      </span>
    </button>`;
  }).filter(Boolean);

  res.innerHTML = `
    <div class="pop-cmp-section">
      <h3 class="pop-cmp-heading">Popular Comparisons</h3>
      <p class="pop-cmp-subhead">Tap a pair to see the full data-driven breakdown</p>
      <div class="pop-cmp-grid">${cards.join('')}</div>
    </div>`;

  // Wire click handlers
  res.querySelectorAll('.pop-cmp-card').forEach(card => {
    const handler = () => {
      const fa = CAT_MAP[card.dataset.a], fb = CAT_MAP[card.dataset.b];
      if (fa && fb) {
        _selectFragForSlot('a', fa);
        _selectFragForSlot('b', fb);
      }
    };
    card.addEventListener('click', handler);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
  });
}

/* ── Social proof helpers (computed from data, no analytics needed) ── */
function computeNoteOverlapPercentile(fa, fb) {
  const sharedCount = fa._nAll.filter(n => fb._nAll.includes(n)).length;
  // Compare against a sample of cross-brand pairs
  let betterThan = 0, total = 0;
  const sample = CAT.slice(0, 60);
  for (let i = 0; i < sample.length; i++) {
    for (let j = i + 1; j < sample.length; j++) {
      if (sample[i].brand === sample[j].brand) continue;
      const s = sample[i]._nAll.filter(n => sample[j]._nAll.includes(n)).length;
      if (sharedCount > s) betterThan++;
      total++;
    }
  }
  return total > 0 ? Math.round((betterThan / total) * 100) : 50;
}

function computeSillagePercentile(frag) {
  const lower = CAT.filter(f => f.sillage < frag.sillage).length;
  return Math.round((lower / CAT.length) * 100);
}

function _renderSocialProof(fa, fb) {
  const shared = fa._nAll.filter(n => fb._nAll.includes(n));
  const pct = computeNoteOverlapPercentile(fa, fb);
  const items = [];
  if (shared.length > 0 && pct > 50) {
    items.push(`This pair shares ${shared.length} note${shared.length > 1 ? 's' : ''} — more overlap than ${pct}% of cross-brand pairs`);
  } else if (shared.length === 0) {
    items.push('Zero shared notes — a completely different scent experience');
  }
  const sillA = computeSillagePercentile(fa);
  const sillB = computeSillagePercentile(fb);
  if (Math.abs(fa.sillage - fb.sillage) >= 4) {
    const loud = fa.sillage > fb.sillage ? fa : fb;
    const quiet = fa.sillage > fb.sillage ? fb : fa;
    items.push(`${loud.name} projects louder than ${computeSillagePercentile(loud)}% of our library; ${quiet.name} stays closer to the skin`);
  }
  if (!items.length) return '';
  return `<div class="cmp-social-proof">
    ${items.map(t => `<p class="cmp-social-proof-item">↳ ${t}</p>`).join('')}
  </div>`;
}

function renderCompareResults(fa,fb){
  const res=document.getElementById('cmp-results');
  if(!res)return;
  
  // NOTE: URL and Card fills are now handled by _selectFragForSlot
  window.haptic?.('success');
  const ca=getCmpFam(fa.family),cb=getCmpFam(fb.family);
  const matchPct=Math.round(scoreSimilarity(fa,fb));
  const layerPct=scoreLayeringPct(fa,fb);
  const verdict=getVerdict(matchPct,layerPct,fa,fb);
  const matchColor=matchPct>=60?ca.accent:matchPct>=30?'var(--g700)':'var(--g500)';
  const layerColor=layerPct>=60?cb.accent:layerPct>=30?'var(--g700)':'var(--g500)';

  res.innerHTML=`
    <div id="cmp-sticky-bar">
      <div class="cmp-sticky-slot" data-slot-sticky="a">
        <span class="cmp-sticky-dot" style="background:${ca.accent}"></span>
        <span class="cmp-sticky-name">${fa.name}</span>
      </div>
      <span class="cmp-sticky-vs">VS</span>
      <div class="cmp-sticky-slot" data-slot-sticky="b" style="justify-content:flex-end">
        <span class="cmp-sticky-name">${fb.name}</span>
        <span class="cmp-sticky-dot" style="background:${cb.accent}"></span>
      </div>
    </div>

    <div class="sr-only" role="region" aria-label="Comparison summary">
      ${fa.name} versus ${fb.name}: ${matchPct}% similarity, ${layerPct}% layering compatibility.
      ${fa.name} sillage ${fa.sillage}/10, depth ${fa.layering}/10.
      ${fb.name} sillage ${fb.sillage}/10, depth ${fb.layering}/10.
    </div>
    <div class="cmp-pair-card">
      <button class="cmp-pair-card-left" id="cmp-score-character">
        <div class="cmp-pair-card-radar">${drawCombinedRadarSvg(fa,fb,ca.accent,cb.accent)}</div>
        <div class="cmp-char-metrics">
          <div class="cmp-char-metric-row">
            <div class="cmp-char-metric-track left"><div class="cmp-char-metric-fill" style="width:${fa.sillage*10}%;background:${ca.accent}"></div></div>
            <span class="cmp-char-metric-lbl">Sillage</span>
            <div class="cmp-char-metric-track right"><div class="cmp-char-metric-fill" style="width:${fb.sillage*10}%;background:${cb.accent}"></div></div>
          </div>
          <div class="cmp-char-metric-row">
            <div class="cmp-char-metric-track left"><div class="cmp-char-metric-fill" style="width:${fa.layering*10}%;background:${ca.accent}"></div></div>
            <span class="cmp-char-metric-lbl">Depth</span>
            <div class="cmp-char-metric-track right"><div class="cmp-char-metric-fill" style="width:${fb.layering*10}%;background:${cb.accent}"></div></div>
          </div>
        </div>
      </button>
      <div class="cmp-pair-card-right">
        <div class="cmp-pair-card-verdict">${verdict}</div>
        <div class="cmp-pair-card-scores">
          <button class="cmp-score-card" id="cmp-score-match">
            <div class="cmp-score-pct" style="color:${matchColor}">${matchPct}%</div>
            <div class="cmp-score-label">Similarity</div>
            <div class="cmp-score-meter">
              <div class="cmp-score-meter-track">
                <div class="cmp-score-meter-fill" style="width:${matchPct}%;background:${matchColor}"></div>
                <div class="cmp-score-meter-dot" style="left:${Math.max(4,Math.min(96,matchPct))}%;background:${matchColor}"></div>
                <div class="cmp-score-meter-tick" style="left:25%"></div>
                <div class="cmp-score-meter-tick" style="left:50%"></div>
                <div class="cmp-score-meter-tick" style="left:75%"></div>
              </div>
            </div>
            <div class="cmp-score-range">${_simLabel(matchPct)}</div>
            <div class="cmp-score-tap">Tap to learn more ↗</div>
          </button>
          <button class="cmp-score-card" id="cmp-score-layer">
            <div class="cmp-score-pct" style="color:${layerColor}">${layerPct}%</div>
            <div class="cmp-score-label">Pairing</div>
            <div class="cmp-score-meter">
              <div class="cmp-score-meter-track">
                <div class="cmp-score-meter-fill" style="width:${layerPct}%;background:${layerColor}"></div>
                <div class="cmp-score-meter-dot" style="left:${Math.max(4,Math.min(96,layerPct))}%;background:${layerColor}"></div>
                <div class="cmp-score-meter-tick" style="left:25%"></div>
                <div class="cmp-score-meter-tick" style="left:50%"></div>
                <div class="cmp-score-meter-tick" style="left:75%"></div>
              </div>
            </div>
            <div class="cmp-score-range">${_layLabel(layerPct)}</div>
            <div class="cmp-score-tap">Tap to learn more ↗</div>
          </button>
        </div>
        <button id="cmp-share-btn" class="dc-collect-btn active" style="width:100%;justify-content:center;">Share Comparison</button>
      </div>
    </div>

    ${_renderSocialProof(fa, fb)}
    ${render3x3Notes(fa,fb,ca.accent,cb.accent)}
    ${renderSuggestionsV2(fa,fb,ca,cb)}
  `;

  // Wire score taps
  document.getElementById('cmp-score-character')?.addEventListener('click',()=>{
    window.haptic?.('selection');
    openCharacterEdu(fa, fb, ca, cb);
  });

  document.getElementById('cmp-share-btn')?.addEventListener('click', async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Scentmap: ${fa.name} vs ${fb.name}`, url });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      navigator.clipboard.writeText(url).then(() => {
        showUndoToast('Link copied to clipboard!', () => {});
      });
    }
  });

  document.getElementById('cmp-score-match')?.addEventListener('click',()=>{
    window.haptic?.('selection');
    openScoreEdu('match',matchPct,layerPct,fa,fb);
  });
  document.getElementById('cmp-score-layer')?.addEventListener('click',()=>{
    window.haptic?.('selection');
    openScoreEdu('layer',matchPct,layerPct,fa,fb);
  });

  // Wire note pill taps in notes grid
  res.querySelectorAll('.cmp-notes-v2 button[data-note]').forEach(btn=>{
    btn.addEventListener('click',e=>{e.stopPropagation();const note=NI_MAP[btn.dataset.note.toLowerCase()];if(note)openDetail(c=>renderNoteDetail(c,note),note.name);});
  });

  // Wire suggestion taps
  res.querySelectorAll('.cmp-sug-card').forEach(card=>{
    card.addEventListener('click',()=>{
      window.haptic?.('light');
      const f=CAT_MAP[card.dataset.fid];
      if(f)openFragDetail(f);
    });
  });

  // Wire sticky slot taps — pass el as sourceEl so picker anchors below it
  res.querySelectorAll('[data-slot-sticky]').forEach(el=>{
    el.addEventListener('click',()=>openUniversalSearch({context:'compare',slot:el.dataset.slotSticky}));
  });

  // Start sticky scroll observer
  _initStickyScroll();

  // Initialize chart haptics
  setTimeout(() => {
    _setupChartHaptics('.cmp-radar-v2-wrap svg', 'circle');
  }, 100);
}


function _selectFragForSlot(slot,frag){
  if(slot==='a')CMP_A=frag;else CMP_B=frag;
  _fillCard(slot,frag);

  // Update URL for partial or full comparison state
  if (CMP_A && CMP_B) {
    const [idFirst, idSecond] = [CMP_A.id, CMP_B.id].sort();
    const newPath = '/compare/' + idFirst + '/' + idSecond;
    if (window.location.pathname !== newPath) {
      history.replaceState(null, '', newPath);
    }
    renderCompareResults(CMP_A, CMP_B);
  } else if (CMP_A || CMP_B) {
    // We don't have a canonical URL for a single-fragrance compare yet, 
    // but we can clear the deep link if we are on one but only one slot is filled.
    if (window.location.pathname.startsWith('/compare/')) {
      history.replaceState(null, '', '/app.html');
    }
  }
}

function _fillCard(slot,frag){
  const card=document.getElementById(`cmp-card-${slot}`);
  if(!card)return;
  const fc=getCmpFam(frag.family);
  const famLabel=(FAM[frag.family]||{label:frag.family}).label;
  card.classList.add('filled');
  card.style.borderColor=`${fc.accent}40`;
  card.setAttribute('aria-label',`${frag.name} by ${frag.brand} — tap to change`);
  card.innerHTML=`
    <div class="chip" style="background:${fc.accent}; align-self: flex-start; margin: var(--sp-md) var(--sp-md) 0;">${famLabel}</div>
    <div class="cmp-frag-card-name-row">
      <div class="cmp-frag-card-name">${frag.name}</div>
      <span class="cmp-card-chevron" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></span>
    </div>
    <button class="cmp-frag-card-brand cmp-brand-btn">${frag.brand}</button>`;
  card.querySelector('.cmp-brand-btn')?.addEventListener('click',e=>{e.stopPropagation();openHouseDetail(frag.brand);});
  const meta=document.getElementById(`cmp-meta-${slot}`);
  if(meta){
    meta.innerHTML=`
      ${frag.description?`<p class="cmp-card-meta-desc">${frag.description}</p>`:''}
      <button class="cmp-card-detail-btn" aria-label="View details for ${frag.name}">Details ↗</button>`;
    meta.querySelector('.cmp-card-detail-btn')?.addEventListener('click',()=>openFragDetail(frag));
  }
}

function _resetCard(slot){
  const card=document.getElementById(`cmp-card-${slot}`);
  if(!card)return;
  card.classList.remove('filled');
  card.style.borderColor='';
  const label=slot==='a'?'Fragrance One':'Fragrance Two';
  card.setAttribute('aria-label',`Select ${label}`);
  card.innerHTML=`
    <div class="cmp-card-empty"><div class="cmp-card-empty-lbl">${label}</div><div class="cmp-card-empty-hint">Tap to select</div></div>
    <span class="cmp-card-chevron" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
  const meta=document.getElementById(`cmp-meta-${slot}`);
  if(meta)meta.innerHTML='';
}

function _setupDragAndDropDropzones() {
  const cmpBtn = document.querySelector('.mbn-btn[onclick*="compare"]');
  if(cmpBtn) {
    cmpBtn.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      cmpBtn.classList.add('drag-over');
    });
    cmpBtn.addEventListener('dragleave', () => cmpBtn.classList.remove('drag-over'));
    cmpBtn.addEventListener('drop', e => {
      e.preventDefault();
      cmpBtn.classList.remove('drag-over');
      const fid = e.dataTransfer.getData('text/plain');
      const frag = CAT_MAP[fid];
      if(frag) {
        window.haptic?.('success');
        _selectFragForSlot(CMP_A ? 'b' : 'a', frag);
        go('compare', cmpBtn);
      }
    });
  }

  ['a','b'].forEach(slot => {
    const card = document.getElementById(`cmp-card-${slot}`);
    if(card) {
      card.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        card.style.boxShadow = '0 0 0 2px var(--accent-primary)';
      });
      card.addEventListener('dragleave', () => card.style.boxShadow = '');
      card.addEventListener('drop', e => {
        e.preventDefault();
        card.style.boxShadow = '';
        const fid = e.dataTransfer.getData('text/plain');
        const frag = CAT_MAP[fid];
        if(frag) {
          window.haptic?.('success');
          _selectFragForSlot(slot, frag);
        }
      });
    }
  });
}

function initCompare(){
  ['a','b'].forEach(slot=>{
    const card=document.getElementById(`cmp-card-${slot}`);
    if(card){
      card.addEventListener('click',()=>openUniversalSearch({context:'compare',slot}));
      card.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){
          e.preventDefault();
          openUniversalSearch({context:'compare',slot});
        }
      });
    }
  });
  _setupDragAndDropDropzones();
}
window.clearCmpSlot=function(slot){
  window.haptic?.('nudge')||window.haptic?.('selection');
  if(slot==='a')CMP_A=null;else CMP_B=null;
  _resetCard(slot);
  const res=document.getElementById('cmp-results');
  if(res)res.innerHTML='';
  if(window._cmpStickyObs)window._cmpStickyObs.disconnect();
  // Reset URL when a compare slot is cleared
  if(window.location.pathname.startsWith('/compare/'))history.replaceState(null,'','/');
  // Show popular comparisons when both slots are empty
  if(!CMP_A && !CMP_B) renderPopularComparisons();
};

/* ══ KEYBOARD & FOCUS MANAGEMENT ═══════════════════════════════════ */
// Track last focused element before opening overlays, for focus return
const _focusStack=[];

function _trapFocus(el){
  _focusStack.push(document.activeElement);
  const focusable=el.querySelectorAll('button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
  if(!focusable.length)return;
  focusable[0].focus();
}
function _returnFocus(){
  const lastFocusedEl=_focusStack.pop();
  if(lastFocusedEl&&typeof lastFocusedEl.focus==='function'){
    lastFocusedEl.focus();
  }
}

// Augment open/close functions to manage focus
const _origOpenNotePopup=window.openNoteFloat;
const _origCloseNotePopup=closeNotePopup;

// Patch note popup to trap focus and return on close
(function(){
  const nfpClose=document.getElementById('nfp-close');
  const orig=nfpClose._closeHandler;
  // Override closeNotePopup to also return focus
  const _origClose=closeNotePopup;
  window.closeNotePopup=function(){
    _origClose();
    _returnFocus();
  };
  nfpClose.removeEventListener('click',_origClose);
  nfpClose.addEventListener('click',window.closeNotePopup);
  document.getElementById('note-float-bg').removeEventListener('click',_origClose);
  document.getElementById('note-float-bg').addEventListener('click',window.closeNotePopup);
})();

/* ══ THE NOSE KNOWS — Daily Fragrance Trivia ═══════════════════════ */

function _noseSeed(dateStr){
  let h=0;
  for(const c of dateStr) h=((h<<5)-h+c.charCodeAt(0))|0;
  return Math.abs(h);
}
function _noseRng(seed){
  const next=(seed*1664525+1013904223)&0x7fffffff;
  return {seed:next, val:next/0x7fffffff};
}
function _noseShuffle(arr,seed){
  const c=[...arr];
  for(let i=c.length-1;i>0;i--){
    const r=_noseRng(seed+i);seed=r.seed;
    const j=Math.floor(r.val*(i+1));
    [c[i],c[j]]=[c[j],c[i]];
  }
  return c;
}
function _nosePick(arr,seed,n){return _noseShuffle(arr,seed).slice(0,n);}
function _noseToday(){return new Date().toISOString().slice(0,10);}

function _noseGenQuestions(){
  const date=_noseToday();
  const seed=_noseSeed(date);
  const questions=[];

  // R1: NOTE_ID — "Which fragrance contains X, Y, Z?"
  (()=>{
    const pool=_noseShuffle(CAT.filter(f=>f._nAll.length>=3),seed+1);
    const frag=pool[0]; if(!frag)return;
    const notes=_nosePick(frag._nAll,seed+10,3).map(n=>n.charAt(0).toUpperCase()+n.slice(1));
    const distractors=_noseShuffle(CAT.filter(f=>f.id!==frag.id&&f.family===frag.family),seed+11).slice(0,3);
    if(distractors.length<3){
      distractors.push(..._noseShuffle(CAT.filter(f=>f.id!==frag.id&&!distractors.some(d=>d.id===f.id)),seed+12).slice(0,3-distractors.length));
    }
    const choices=[frag,...distractors.slice(0,3)];
    const shuffled=_noseShuffle(choices,seed+13);
    questions.push({
      type:'note_id',
      prompt:`Which fragrance contains ${notes.slice(0,-1).join(', ')} and ${notes[notes.length-1]}?`,
      choices:shuffled.map(f=>`${f.name}`),
      correctIdx:shuffled.indexOf(frag),
      explanation:`${frag.name} by ${frag.brand} features all three notes across its pyramid.`,
      fragRef:frag
    });
  })();

  // R2: SILLAGE — "Higher sillage: A or B?"
  (()=>{
    const pool=_noseShuffle(CAT,seed+2);
    let pair=null;
    for(let i=0;i<pool.length-1;i++){
      for(let j=i+1;j<pool.length;j++){
        if(Math.abs(pool[i].sillage-pool[j].sillage)>=2){
          pair=[pool[i],pool[j]];break;
        }
      }
      if(pair)break;
    }
    if(!pair)pair=[pool[0],pool[1]];
    const shuffled=_noseShuffle(pair,seed+20);
    const correctIdx=shuffled[0].sillage>=shuffled[1].sillage?0:1;
    const winner=shuffled[correctIdx];
    questions.push({
      type:'sillage',
      prompt:`Which has higher sillage?`,
      choices:shuffled.map(f=>`${f.name} — ${f.brand}`),
      correctIdx,
      explanation:`${winner.name} has sillage ${winner.sillage}/10 vs ${shuffled[1-correctIdx].name} at ${shuffled[1-correctIdx].sillage}/10.`,
      fragRef:winner
    });
  })();

  // R3: FAMILY — "What family is X?"
  (()=>{
    const frag=_noseShuffle(CAT,seed+3)[0]; if(!frag)return;
    const correct=frag.family;
    const others=_noseShuffle(FAM_ORDER.filter(f=>f!==correct),seed+30).slice(0,3);
    const choices=[correct,...others];
    const shuffled=_noseShuffle(choices,seed+31);
    questions.push({
      type:'family',
      prompt:`What fragrance family is ${frag.name}?`,
      choices:shuffled.map(f=>FAM[f]?.label||f),
      correctIdx:shuffled.indexOf(correct),
      explanation:`${frag.name} by ${frag.brand} belongs to the ${FAM[correct]?.label||correct} family.`,
      fragRef:frag,
      _families:shuffled
    });
  })();

  // R4: NOTE_DESC — "Which note is described as '...'?"
  (()=>{
    const withDesc=NI.filter(n=>n.desc&&n.desc.length>20);
    const pool=_noseShuffle(withDesc,seed+4);
    const note=pool[0]; if(!note)return;
    const desc=note.desc.length>80?note.desc.slice(0,80).replace(/\s+\S*$/,'')+'…':note.desc;
    const others=_noseShuffle(withDesc.filter(n=>n.name!==note.name),seed+40).slice(0,3);
    const choices=[note,...others];
    const shuffled=_noseShuffle(choices,seed+41);
    questions.push({
      type:'note_desc',
      prompt:`Which note is described as "${desc}"`,
      choices:shuffled.map(n=>n.name),
      correctIdx:shuffled.indexOf(note),
      explanation:`${note.name} — ${note.desc.slice(0,100)}${note.desc.length>100?'…':''}`,
      fragRef:null
    });
  })();

  // R5: SHARED — "These two share N notes. Name one."
  (()=>{
    const pool=_noseShuffle(CAT,seed+5);
    let found=null;
    for(let i=0;i<Math.min(pool.length,50);i++){
      for(let j=i+1;j<Math.min(pool.length,50);j++){
        const shared=pool[i]._nAll.filter(n=>pool[j]._nAll.includes(n));
        if(shared.length>=2){found={a:pool[i],b:pool[j],shared};break;}
      }
      if(found)break;
    }
    if(!found)return;
    questions.push({
      type:'shared',
      prompt:`${found.a.name} and ${found.b.name} share ${found.shared.length} note${found.shared.length>1?'s':''}. Name one.`,
      choices:null,
      sharedNotes:found.shared.map(n=>n.toLowerCase()),
      correctIdx:null,
      explanation:`The shared notes are ${found.shared.map(n=>n.charAt(0).toUpperCase()+n.slice(1)).join(', ')}.`,
      fragRef:found.a
    });
  })();

  return questions;
}

// -- Nose state --
let _noseState=null;

function _noseLoadState(){
  try{
    const saved=localStorage.getItem('sm_nose_today');
    if(saved){
      const parsed=JSON.parse(saved);
      if(parsed.date===_noseToday())return parsed;
    }
  }catch(e){}
  return null;
}

function _noseSaveState(){
  if(!_noseState)return;
  try{
    localStorage.setItem('sm_nose_today',JSON.stringify({
      date:_noseState.date,
      answers:_noseState.answers,
      currentRound:_noseState.currentRound
    }));
    // Streak
    const played=localStorage.getItem('sm_nose_played');
    if(played!==_noseState.date){
      localStorage.setItem('sm_nose_played',_noseState.date);
      const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
      const yStr=yesterday.toISOString().slice(0,10);
      let streak=parseInt(localStorage.getItem('sm_nose_streak')||'0',10);
      if(played===yStr) streak++;
      else streak=1;
      localStorage.setItem('sm_nose_streak',String(streak));
      const best=parseInt(localStorage.getItem('sm_nose_best')||'0',10);
      if(streak>best)localStorage.setItem('sm_nose_best',String(streak));
    }
  }catch(e){}
}

function _noseAlreadyPlayed(){
  const saved=_noseLoadState();
  return saved&&saved.answers&&saved.answers.length>=5;
}

function _noseResultEmoji(answers){
  return(answers||[]).map(a=>a==='correct'?'🟩':a==='close'?'🟨':'🟥').join('');
}

function _noseScore(answers){
  return(answers||[]).filter(a=>a==='correct').length;
}

// -- Nose UI --
function _openNoseGame(){
  const isMobile=window.innerWidth<768;
  const saved=_noseLoadState();
  if(saved&&saved.answers&&saved.answers.length>=5){
    // Already played — show results
    _noseState={date:_noseToday(),questions:_noseGenQuestions(),answers:saved.answers,currentRound:5};
    if(isMobile)pushSheet(c=>_renderNoseResults(c),'The Nose Knows');
    else openDesktopDetail(c=>_renderNoseResults(c));
    return;
  }
  _noseState={
    date:_noseToday(),
    questions:_noseGenQuestions(),
    answers:saved?.answers||[],
    currentRound:saved?.currentRound||0
  };
  if(isMobile)pushSheet(c=>_renderNoseRound(c),'The Nose Knows');
  else openDesktopDetail(c=>_renderNoseRound(c));
}
window._openNoseGame=_openNoseGame;

function _renderNoseRound(container){
  const q=_noseState.questions[_noseState.currentRound];
  if(!q){_renderNoseResults(container);return;}
  const round=_noseState.currentRound;
  const total=_noseState.questions.length;

  const dots=_noseState.questions.map((_,i)=>{
    let cls='nose-dot';
    if(i<_noseState.answers.length){
      cls+=' '+_noseState.answers[i];
    }else if(i===round){
      cls+=' current';
    }
    return `<span class="${cls}"></span>`;
  }).join('');

  let choicesHtml='';
  if(q.type==='shared'){
    choicesHtml=`<div class="nose-input-wrap">
      <input type="text" class="nose-text-input" placeholder="Type a note name..." aria-label="Type a note name" aria-describedby="nose-q-text">
      <button class="dc-collect-btn active nose-submit-btn">Submit</button>
    </div>`;
  }else{
    const cols=q.choices.length===2?'nose-grid-2':'nose-grid-4';
    choicesHtml=`<div class="nose-answers ${cols}" role="radiogroup" aria-label="Answer choices">
      ${q.choices.map((c,i)=>`<button class="nose-answer" role="radio" aria-checked="false" aria-label="${c}" data-idx="${i}">${c}</button>`).join('')}
    </div>`;
  }

  container.innerHTML=`
    <div class="nose-game" role="main" aria-label="The Nose Knows daily quiz">
      <div class="nose-header">
        <div class="nose-title">The Nose Knows</div>
        <div class="nose-round-label">Round ${round+1} of ${total}</div>
      </div>
      <div class="nose-dots" role="progressbar" aria-valuenow="${round+1}" aria-valuemax="${total}">${dots}</div>
      <div class="nose-question" id="nose-q-text" role="heading" aria-level="2">${q.prompt}</div>
      ${choicesHtml}
      <div class="nose-feedback" id="nose-feedback" hidden></div>
      <button class="dc-collect-btn active nose-next-btn" hidden>Next round →</button>
    </div>`;

  // Wire up interactions
  const fb=container.querySelector('#nose-feedback');
  const nextBtn=container.querySelector('.nose-next-btn');

  if(q.type==='shared'){
    const input=container.querySelector('.nose-text-input');
    const submit=container.querySelector('.nose-submit-btn');
    const doSubmit=()=>{
      const val=normQ(input.value.trim());
      if(!val)return;
      submit.disabled=true;input.disabled=true;
      const exact=q.sharedNotes.some(n=>n===val);
      const fuzzy=!exact&&q.sharedNotes.some(n=>levenshtein(val,n)<=2);
      // Check if it's a note in either frag but not shared
      const allNotes=[...(q.fragRef?._nAll||[])];
      const inFragButNotShared=!exact&&!fuzzy&&allNotes.some(n=>n.toLowerCase()===val||levenshtein(val,n.toLowerCase())<=2);

      let result;
      if(exact||fuzzy){
        result='correct';
        const matchedNote=fuzzy?q.sharedNotes.find(n=>levenshtein(val,n)<=2):val;
        fb.innerHTML=`<span class="nose-fb-icon correct">✓</span> ${fuzzy?`Close enough! We'll take "${input.value}" for "${matchedNote}".`:'Correct!'} ${q.explanation}`;
      }else if(inFragButNotShared){
        result='close';
        fb.innerHTML=`<span class="nose-fb-icon close">~</span> Close! That note is in one of them, but not shared. ${q.explanation}`;
      }else{
        result='wrong';
        fb.innerHTML=`<span class="nose-fb-icon wrong">✗</span> Not a match. ${q.explanation}`;
      }
      fb.hidden=false;
      _noseState.answers.push(result);
      _noseSaveState();
      nextBtn.hidden=false;
      if(_noseState.currentRound>=_noseState.questions.length-1)nextBtn.textContent='See results →';
    };
    submit.addEventListener('click',doSubmit);
    input.addEventListener('keydown',e=>{if(e.key==='Enter')doSubmit();});
  }else{
    container.querySelectorAll('.nose-answer').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const idx=parseInt(btn.dataset.idx,10);
        const isCorrect=idx===q.correctIdx;

        // Determine "close" for MC
        let result='wrong';
        if(isCorrect){
          result='correct';
        }else if(q.type==='family'&&q._families){
          // Same broad group = close
          const correctFam = q._families[q.correctIdx];
          const guessedFam = q._families[idx];
          const groups = [
            ['woody', 'oud', 'leather'],
            ['citrus', 'green'],
            ['amber', 'gourmand'],
            ['floral', 'chypre']
          ];
          const isClose = groups.some(g => g.includes(correctFam) && g.includes(guessedFam));
          if(isClose) result = 'close';
        }else if(q.type==='sillage'){
          // Within 2 points = close (though sillage is binary in this game, so this only applies if we had more choices)
          // Actually, in sillage round, it's a binary choice between two frags. 
          // So 'close' doesn't really apply to the binary choice itself, 
          // but we could mark it close if the silage difference was very small (<= 2).
          // However, the question gen ensures difference >= 2.
          result='wrong';
        }

        // Mark all buttons disabled
        container.querySelectorAll('.nose-answer').forEach(b=>{
          b.setAttribute('aria-disabled','true');
          b.style.pointerEvents='none';
          if(parseInt(b.dataset.idx,10)===q.correctIdx){
            b.classList.add('correct');
            b.setAttribute('aria-label',b.textContent+' — correct answer');
          }
        });
        if(!isCorrect){
          btn.classList.add(result==='close'?'close':'wrong');
        }
        btn.setAttribute('aria-checked','true');

        if(isCorrect){
          fb.innerHTML=`<span class="nose-fb-icon correct">✓</span> Correct! ${q.explanation}`;
        }else if(result==='close'){
          fb.innerHTML=`<span class="nose-fb-icon close">~</span> Close! ${q.explanation}`;
        }else{
          fb.innerHTML=`<span class="nose-fb-icon wrong">✗</span> Not quite. ${q.explanation}`;
        }
        fb.hidden=false;

        _noseState.answers.push(result);
        _noseSaveState();
        nextBtn.hidden=false;
        if(_noseState.currentRound>=_noseState.questions.length-1)nextBtn.textContent='See results →';
      });
    });
  }

  nextBtn.addEventListener('click',()=>{
    _noseState.currentRound++;
    _noseSaveState();
    if(_noseState.currentRound>=_noseState.questions.length){
      _renderNoseResults(container);
    }else{
      _renderNoseRound(container);
    }
  });
}

function _renderNoseResults(container){
  const answers=_noseState.answers;
  const score=_noseScore(answers);
  const emoji=_noseResultEmoji(answers);
  const streak=parseInt(localStorage.getItem('sm_nose_streak')||'0',10);
  const best=parseInt(localStorage.getItem('sm_nose_best')||'0',10);
  const perfect=score===_noseState.questions.length;

  const roundTypes=['Note identification','Sillage comparison','Family classification','Note description','Shared notes'];
  const breakdown=answers.map((a,i)=>{
    const icon=a==='correct'?'✓':a==='close'?'~':'✗';
    const label=a==='correct'?'':a==='close'?' close!':' wrong';
    return `<div class="nose-breakdown-row ${a}"><span class="nose-fb-icon ${a}">${icon}</span> ${roundTypes[i]||'Round '+(i+1)}${label}</div>`;
  }).join('');

  const shareText=`${emoji} The Nose Knows — ${score}/${_noseState.questions.length}${streak>1?' — Day '+streak+' 🔥':''}\nscentmap.co/daily`;

  container.innerHTML=`
    <div class="nose-results">
      <div class="nose-results-label">Today's Results</div>
      ${perfect?'<div class="nose-perfect">Flawless nose today.</div>':''}
      <div class="nose-emoji">${emoji}</div>
      <div class="nose-score-big">${score}/${_noseState.questions.length}</div>
      <div class="nose-streak-row">
        ${streak>1?`<span>🔥 Streak: ${streak} day${streak>1?'s':''}</span>`:''}
        ${best>1?`<span>📊 Best: ${best} day${best>1?'s':''}</span>`:''}
      </div>
      <div class="nose-breakdown">${breakdown}</div>
      <div class="nose-results-ctas">
        <button class="dc-collect-btn active nose-share-btn">Share score</button>
        ${_noseState.questions[0]?.fragRef?`<button class="dc-collect-btn nose-explore-btn">Explore ${_noseState.questions[0].fragRef.name} →</button>`:''}
      </div>
    </div>`;

  container.querySelector('.nose-share-btn')?.addEventListener('click',()=>{
    navigator.clipboard.writeText(shareText).then(()=>{
      const btn=container.querySelector('.nose-share-btn');
      btn.textContent='Copied!';
      setTimeout(()=>{btn.textContent='Share score';},1500);
    }).catch(()=>{});
  });

  container.querySelector('.nose-explore-btn')?.addEventListener('click',()=>{
    const frag=_noseState.questions[0].fragRef;
    if(frag)openFragDetail(frag);
  });

  // Rebuild catalog to update entry row
  buildCatalog();
}

// -- Nose entry row in catalog --
function _noseEntryHtml(){
  if(_noseAlreadyPlayed()){
    const saved=_noseLoadState();
    const emoji=_noseResultEmoji(saved.answers);
    const score=_noseScore(saved.answers);
    return `<button class="list-item nose-entry" role="button" tabindex="0" aria-label="Today's score: ${score} out of 5">
      <span class="list-item-content"><span class="nose-entry-icon">🧠</span><span class="list-item-body"><span class="list-item-name">Today's Score: ${emoji} ${score}/5</span><span class="list-item-sub">The Nose Knows · Tap to review</span></span></span>
    </button>`;
  }
  return `<button class="list-item nose-entry" role="button" tabindex="0" aria-label="Today's Challenge — The Nose Knows">
    <span class="list-item-content"><span class="nose-entry-icon">🧠</span><span class="list-item-body"><span class="list-item-name">Today's Challenge</span><span class="list-item-sub">The Nose Knows · 5 rounds · tap to play</span></span></span>
  </button>`;
}

// Dev utility: search tests (run in console with runSearchTests())
function runSearchTests(){
  const pass=[],fail=[];
  const chk=(label,got,exp)=>(got===exp?pass:fail).push({label,got,exp});
  chk('lev same word',levenshtein('diptyque','diptyque'),0);
  chk('lev 1 edit',levenshtein('diptique','diptyque'),1);
  chk('lev empty',levenshtein('','test'),4);
  const mockFrag={_nameN:'gypsy water',_brandN:'byredo',_nAllN:['bergamot','rose','vanilla']};
  chk('exact brand',matchFrag(mockFrag,'byredo'),true);
  chk('exact name substring',matchFrag(mockFrag,'gypsy'),true);
  chk('diacritic: xinu matches xinu note',matchFrag({_nameN:'xinu',_brandN:'brand',_nAllN:[]},normQ('xinú')),true);
  chk('fuzzy brand byedo→byredo',matchFrag(mockFrag,'byedo'),true);
  chk('fuzzy name diptique→diptyque',matchFrag({_nameN:'something',_brandN:'diptyque',_nAllN:[]},'diptique'),true);
  chk('short query no fuzzy (by)',matchFrag({_nameN:'xyz brand',_brandN:'abc',_nAllN:[]},'by'),false);
  chk('note match',matchFrag(mockFrag,'rose'),true);
  pass.forEach(t=>console.log(`%cPASS%c ${t.label}`,'color:green',''));
  fail.forEach(t=>console.error(`FAIL ${t.label}: got ${t.got}, expected ${t.exp}`));
  console.log(`${pass.length} passed, ${fail.length} failed`);
}
window.runSearchTests=runSearchTests;

// Global keyboard shortcuts — ⌘K / Ctrl+K / `/` opens universal search
document.addEventListener('keydown',function(e){
  // ⌘K or Ctrl+K
  if((e.metaKey||e.ctrlKey)&&e.key==='k'){
    e.preventDefault();
    const us=document.getElementById('universal-search');
    if(us&&!us.hidden){closeUniversalSearch();return;}
    openUniversalSearch();
    return;
  }
  // `/` when no input is focused — opens universal search
  if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){
    e.preventDefault();
    const us=document.getElementById('universal-search');
    if(!us||us.hidden)openUniversalSearch();
    return;
  }
});

// Global Escape key handler — closes topmost open modal/overlay
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape')return;
  // Score edu overlay (highest z-index)
  const edu=document.getElementById('cmp-edu-overlay');
  if(edu&&edu.classList.contains('open')){closeScoreEdu();return;}
  // Universal search (handled by its own keydown, but guard here too)
  const us=document.getElementById('universal-search');
  if(us&&!us.hidden){closeUniversalSearch();return;}
  // Note popup
  const noteOverlay=document.getElementById('note-float-overlay');
  if(noteOverlay&&noteOverlay.classList.contains('open')){
    (window.closeNotePopup||closeNotePopup)();return;
  }
  // Mobile sheet stack
  if(sheetStack.length>0){popSheet();return;}
  // Desktop detail panel
  const detail=document.getElementById('col-detail');
  if(detail&&detail.classList.contains('open')){closeDesktopDetail();return;}
});

/* ══ INIT ═══════════════════════════════════════════════════════════ */
async function init() {
  const success = await store.initialize();
  if (!success) {
    const loadingEl = document.getElementById('app-loading');
    if (loadingEl) loadingEl.hidden = true;
    const errorEl = document.getElementById('app-error');
    if (errorEl) errorEl.hidden = false;
    return;
  }

  // Update proxy data references
  const data = store.getData();
  ROLES = data.roles;
  CAT = data.catalog;
  CAT_MAP = data.catalogMap;
  NI = data.notes;
  NI_MAP = data.notesMap;
  BRANDS = data.brands;
  BRANDS_MAP = Object.fromEntries(BRANDS.map(b => [b.name.toLowerCase(), b]));
  RM = Object.fromEntries(ROLES.map(r => [r.id, r]));

  // Hide loading overlay
  const loadingEl = document.getElementById('app-loading');
  if (loadingEl) {
    loadingEl.style.opacity = '0';
    setTimeout(() => loadingEl.hidden = true, 250);
  }

  // Re-expose for backward compatibility/debugging
  window.CAT = CAT; window.CAT_MAP = CAT_MAP; window.NI = NI; window.NI_MAP = NI_MAP;
  window.ROLES = ROLES; window.BRANDS = BRANDS;

  computeNoteTiers();

  // Now initialize UI
  buildCatalog();
  buildNotes();
  initCatalogControls();
  initNotesNav();
  initCompare();
  if (window.renderSaved) window.renderSaved();

  // Load popular comparisons and auto-select first pair as default
  fetch('/data/popular-comparisons.json')
    .then(r => r.json())
    .then(pairs => {
      _popularPairs = pairs;
      // Don't overwrite a comparison that handleInitialNavigation() already loaded
      if (CMP_A || CMP_B) return;
      // Auto-select first pair if no comparison is active
      if (pairs.length) {
        const fa = CAT_MAP[pairs[0].a], fb = CAT_MAP[pairs[0].b];
        if (fa && fb) {
          _selectFragForSlot('a', fa);
          _selectFragForSlot('b', fb);
          return; // renderCompareResults is called by _selectFragForSlot
        }
      }
      renderPopularComparisons();
    })
    .catch(() => {});

  handleInitialNavigation();
  window.addEventListener('hashchange', handleInitialNavigation);
}

function computeNoteTiers() {
  const counts = {};
  CAT.forEach(f => {
    (f._nTop || []).forEach(n => { if (!counts[n]) counts[n] = {top:0, mid:0, base:0}; counts[n].top++; });
    (f._nMid || []).forEach(n => { if (!counts[n]) counts[n] = {top:0, mid:0, base:0}; counts[n].mid++; });
    (f._nBase || []).forEach(n => { if (!counts[n]) counts[n] = {top:0, mid:0, base:0}; counts[n].base++; });
  });
  NI.forEach(note => {
    const key = note.name.toLowerCase();
    const c = counts[key];
    if (c) {
      if (c.top >= c.mid && c.top >= c.base) note._tier = 'top';
      else if (c.mid >= c.top && c.mid >= c.base) note._tier = 'mid';
      else note._tier = 'base';
    } else {
      note._tier = 'base';
    }
  });
}


function handleInitialNavigation() {
  const hash = window.location.hash.replace('#', '');
  const pathname = window.location.pathname;
  // More robust regex for compare routes, allowing for alphanumeric and dashes/underscores
  const _cmpMatch = pathname.match(/^\/compare\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)\/?(?:index\.html)?$/);
  const _quizMatch = pathname.match(/^\/quiz\/([a-zA-Z0-9_-]+)\/?(?:index\.html)?$/);
  let _deepLinkedCompare = false;

  const data = store.getData();
  const currentCatMap = data.catalogMap;

  // Standalone page? Hide unneeded elements
  if (pathname.startsWith('/compare/') || pathname.startsWith('/quiz/')) {
    const sidebar = document.querySelector('.catalog-sidebar');
    if (sidebar) sidebar.style.display = 'none';
  }

  if (_cmpMatch) {
    const idA = _cmpMatch[1].toLowerCase();
    const idB = _cmpMatch[2].toLowerCase();
    
    // Skip if current state already matches this pair to prevent loops
    if (CMP_A && CMP_B) {
      const [curA, curB] = [CMP_A.id, CMP_B.id].sort();
      const [reqA, reqB] = [idA, idB].sort();
      if (curA === reqA && curB === reqB) return;
    }
    
    const fragA = currentCatMap[idA], fragB = currentCatMap[idB];
    if (fragA && fragB) {
      _deepLinkedCompare = true;
      _selectFragForSlot('a', fragA);
      _selectFragForSlot('b', fragB);
    }
  }

  if (_deepLinkedCompare) {
    go('compare', document.querySelector('.mbn-btn[onclick*="compare"], .global-nav-link[onclick*="compare"]'));
  } else if (_quizMatch) {
    renderStandaloneQuiz(_quizMatch[1]);
  } else if (hash === 'notes') {
    go('notes', document.querySelector('.global-nav-link[onclick*="notes"], .mbn-btn[onclick*="notes"]'));
  } else if (hash === 'catalog') {
    go('catalog', null);
  } else if (hash === 'saved' || hash === 'journal' || hash === 'you') {
    go('saved', document.querySelector('.global-nav-link[onclick*="saved"], .mbn-btn[onclick*="saved"]'));
    if (hash === 'journal') {
      setTimeout(() => {
        const j = document.getElementById('journal-content');
        if (j) j.scrollIntoView({ behavior: 'smooth' });
      }, 350);
    }
  } else if (hash === 'open-search') {
    go('compare', document.querySelector('.mbn-btn[onclick*="compare"]'));
    setTimeout(() => openUniversalSearch(), 350);
  } else if (hash.startsWith('feel=')) {
    let feel = decodeURIComponent(hash.split('=')[1]).toLowerCase();
    const feelMap = { 'solar':'heat', 'grounded':'work', 'romantic':'intimate', 'mysterious':'cold' };
    if (feelMap[feel]) feel = feelMap[feel];
    go('catalog', null);
    setTimeout(() => {
      const btns = Array.from(document.querySelectorAll('.cat-feel-bar .tab, .cat-feel-bar-m .tab'));
      let btn = btns.find(b => b.dataset.val === feel);
      if (!btn) btn = btns.find(b => b.textContent.toLowerCase().includes(feel));
      if (btn) btn.click();
    }, 200);
  } else if (hash.startsWith('search=')) {
    const query = decodeURIComponent(hash.split('=')[1]);
    go('catalog', null);
    const searchInput = document.getElementById('cat-search');
    if (searchInput) {
      searchInput.value = query;
      searchInput.dispatchEvent(new Event('input'));
    }
  } else if (hash.startsWith('frag=')) {
    const params = new URLSearchParams(hash.replace('frag=', 'id='));
    const fragId = params.get('id');
    const frag = CAT_MAP[fragId];
    if (frag) {
      go('catalog', null);
      openFragDetail(frag);
    }
  } else if (hash === 'compare' || hash.startsWith('compare/')) {
    if (hash.startsWith('compare/')) {
      const parts = hash.split('/');
      if (parts.length >= 3) {
        const idA = parts[1].toLowerCase();
        const idB = parts[2].toLowerCase();
        const fragA = currentCatMap[idA], fragB = currentCatMap[idB];
        if (fragA && fragB) {
          _deepLinkedCompare = true;
          _selectFragForSlot('a', fragA);
          _selectFragForSlot('b', fragB);
        }
      }
    }
    go('compare', document.querySelector('.mbn-btn[onclick*="compare"], .global-nav-link[onclick*="compare"]'));
  } else if (pathname === '/app' || pathname === '/app/' || pathname === '/app.html' || pathname === '/app/index.html' || pathname === '/' || pathname === '/index.html') {
    go('compare', document.querySelector('.mbn-btn[onclick*="compare"], .global-nav-link[onclick*="compare"]'));
  }
}

async function renderStandaloneQuiz(slug) {
  // Try to use full quiz logic if available (by loading quiz config)
  try {
    const res = await fetch('/data/quiz-config.json');
    const allConfigs = await res.json();
    const config = allConfigs[slug];
    if (config) {
      // For now, render the Global Quiz or Byredo Quiz if it matches
      const container = document.getElementById('p-compare'); // Re-use panel for quiz if in standalone shell
      if (slug === 'find-your-byredo') {
        go('compare', null); // Hide results, show panel
        openDetail(c => renderByredoQuiz(c), config.title);
      } else {
        go('compare', null);
        openDetail(c => renderGlobalQuiz(c), config.title);
      }
    }
  } catch (e) {
    console.warn('[app] renderStandaloneQuiz failed:', e);
  }
}

// Kick off
init();

// Load and render changelog
fetch('/CHANGELOG.md').then(r=>r.text()).then(md=>{
  const el=document.getElementById('changelog-body');
  // Minimal Markdown → HTML renderer (supports ## h2, ### h3, - lists, nested  - lists, **bold**, `code`, ---)
  function inlineFmt(s){
    return s
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/`([^`]+)`/g,'<code style="font-family:monospace;font-size:.82em;background:var(--g100);padding:1px 4px;border-radius:3px">$1</code>');
  }
  const lines=md.split('\n');
  let out='',inUL=false,inSubUL=false;
  function closeSubUL(){if(inSubUL){out+='</ul></li>';inSubUL=false;}}
  function closeUL(){closeSubUL();if(inUL){out+='</ul>';inUL=false;}}
  lines.forEach(raw=>{
    const line=raw.trimEnd();
    if(/^# /.test(line)){return;}
    if(/^## /.test(line)){closeUL();out+=`<h2>${inlineFmt(line.slice(3))}</h2>`;return;}
    if(/^### /.test(line)){closeUL();out+=`<h3>${inlineFmt(line.slice(4))}</h3>`;return;}
    if(/^---$/.test(line)){closeUL();out+='<hr>';return;}
    if(/^  - /.test(line)){
      if(!inSubUL){out+='<ul style="margin-top:4px">';inSubUL=true;}
      out+=`<li>${inlineFmt(line.slice(4))}</li>`;return;
    }
    if(/^- /.test(line)){
      closeSubUL();
      if(!inUL){out+='<ul>';inUL=true;}
      else out+='</li>';
      out+=`<li>${inlineFmt(line.slice(2))}`;return;
    }
    if(line.trim()===''){closeUL();return;}
    closeUL();out+=`<p>${inlineFmt(line)}</p>`;
  });
  closeUL();
  el.innerHTML=out;
}).catch(()=>{
  document.getElementById('changelog-body').innerHTML='<p>Changelog not found.</p>';
});
