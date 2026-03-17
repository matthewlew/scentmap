/* ══ DATA (populated by fetch at startup) ════════════════════════ */
let ROLES=[], RM={}, CAT=[], CAT_MAP={}, NI=[], NI_MAP={}, BRANDS=[], BRANDS_MAP={};


const FAM={
  citrus:  {label:'Citrus',  color:'#9A6800', desc:'Bright and fleeting. Pressed from rinds — bergamot, lemon, grapefruit. Often the first thing you smell, and the first to fade. Works in heat; rarely works alone.'},
  green:   {label:'Green',   color:'#1A6030', desc:'Crisp, alive, and vegetal — cut grass, fig leaf, violet leaf. The smell of growing things rather than flowering ones. Fresh but rooted.'},
  floral:  {label:'Floral',  color:'#902050', desc:'Derived from flowers — rose, jasmine, tuberose, iris. The broadest family. Ranges from powdery and romantic to bright and dewy. The backbone of most commercial perfumery.'},
  woody:   {label:'Woody',   color:'#6E3210', desc:'Dry, earthy warmth from woods and roots — cedar, sandalwood, vetiver, patchouli. A broad family spanning cool dry cedar to rich creamy sandalwood.'},
  amber:   {label:'Amber',   color:'#984000', desc:'Warm, resinous, and slightly sweet. Labdanum, benzoin, vanilla, resins. Rich base materials that linger for hours. The classic "oriental" register.'},
  chypre:  {label:'Chypre',  color:'#285438', desc:'A structured accord: bergamot up top, labdanum at the base, oakmoss in the heart. Earthy, sophisticated, mossy. Named after Cyprus; backbone of classic perfumery.'},
  aquatic: {label:'Aquatic', color:'#0A4880', desc:'Marine, watery, ozonic. Invented in the 1990s. The smell of imagined sea air — ozone, salt, and calone — rather than actual ocean. Fresh and weightless.'},
  leather: {label:'Leather', color:'#42200E', desc:'Reconstructed from birch tar, labdanum, and castoreum. Dry, dark, slightly smoky. Evokes tanned hides, saddles, and worn books. Difficult to wear casually.'},
  gourmand:{label:'Gourmand',color:'#7C4C00', desc:'Edible-smelling notes — vanilla, caramel, tonka, praline. Emerged in the 1990s. Warm, sweet, and comforting. Fragrance as food memory.'},
  oud:     {label:'Oud',     color:'#4A1850', desc:'Dark, animalic resin from infected agarwood. Deep, smoky, and complex. The most prized raw material in Arabian perfumery — priced by weight, not volume. Polarising.'},
};
const FAM_ORDER=['floral','amber','citrus','woody','chypre','gourmand','green','oud','leather','aquatic'];

const FAM_COMPAT={
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

/* ── Utility: debounce ── */
function debounce(fn, delay) {
  let timer;
  return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); };
}

/* State */
let ST;
try { ST = JSON.parse(localStorage.getItem('scentmap_st') || '{}') || {}; }
catch(e) { ST = {}; try { localStorage.removeItem('scentmap_st'); } catch(_){} }
function gst(id){return ST[id]||'none'}
function setState(id,s){
  if(s==='none') delete ST[id];
  else ST[id]=s;
  localStorage.setItem('scentmap_st', JSON.stringify(ST));
}
function isOwned(id){return gst(id)==='owned'}
function isWish(id){return gst(id)==='wish'}
function cycleState(id){const c=gst(id);setState(id,c==='none'?'wish':c==='wish'?'owned':'none')}
function isNoteSaved(name){return gst('n_' + name.toLowerCase())==='saved'}
function toggleNoteSaved(name){setState('n_' + name.toLowerCase(), isNoteSaved(name)?'none':'saved')}
function isBrandSaved(id){return gst('b_'+id.toLowerCase())==='saved'}
function toggleBrandSave(id){setState('b_'+id.toLowerCase(),isBrandSaved(id)?'none':'saved')}

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
      row.className = row.className.replace('frag-picker-item', '').trim();
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

window.renderSaved = function() {
  const container = document.getElementById('saved-list');
  if (!container) return;
  container.innerHTML = '';

  // Copy button + aria-live toast
  const copyRow = document.createElement('div');
  copyRow.style.display = 'flex';
  copyRow.style.alignItems = 'center';
  copyRow.style.marginBottom = 'var(--sp-xl)';
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-collection-btn';
  copyBtn.textContent = 'Copy Collection';
  const toastEl = document.createElement('span');
  toastEl.className = 'copy-toast';
  toastEl.setAttribute('aria-live', 'polite');
  copyBtn.addEventListener('click', () => copyCollectionToClipboard(toastEl));
  copyRow.appendChild(copyBtn);
  copyRow.appendChild(toastEl);
  container.appendChild(copyRow);

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

  renderCollectionSection(container, 'Owned', owned, 'frags');
  renderCollectionSection(container, 'Wishlist', wished, 'frags');
  renderCollectionSection(container, 'Saved Notes', notes, 'notes');
  renderCollectionSection(container, 'Saved Brands', brands, 'brands');
};

/* Similarity scoring: 0–100 across family, notes, sillage, roles */
const _simCache={};
function scoreSimilarity(a,b){
  if(a.id===b.id)return 0;
  const k=a.id<b.id?a.id+'~'+b.id:b.id+'~'+a.id;
  if(_simCache[k]!==undefined)return _simCache[k];
  const famScore=(FAM_COMPAT[a.family]?.[b.family]??0.5)*40;
  const shBase=a._nBase.filter(n=>b._nBase.includes(n)).length;
  const shMid=a._nMid.filter(n=>b._nMid.includes(n)).length;
  const shTop=a._nTop.filter(n=>b._nTop.includes(n)).length;
  const noteScore=Math.min(30,shBase*5+shMid*3+shTop*2);
  const sillDiff=Math.abs(a.sillage-b.sillage);
  const sillScore=sillDiff<=2?10:sillDiff<=4?5:0;
  const shRoles=a.roles.filter(r=>b.roles.includes(r)).length;
  const roleScore=Math.min(20,shRoles*7);
  const result=Math.round(famScore+noteScore+sillScore+roleScore);
  _simCache[k]=result;
  return result;
}

/* Layering compatibility score: higher = better layering pair (different sillage + complementary families + unique notes) */
const _layCache={};
function scoreLayeringPair(a,b){
  const k=a.id<b.id?a.id+'~'+b.id:b.id+'~'+a.id;
  if(_layCache[k]!==undefined)return _layCache[k];
  const famComp=FAM_COMPAT[a.family]?.[b.family]??0.5;
  const famScore=famComp*35;
  const sillDiff=Math.abs(a.sillage-b.sillage);
  const sillScore=sillDiff>=3?20:sillDiff>=1?10:0;
  const shared=a._nAll.filter(n=>b._nAll.includes(n)).length;
  const noteScore=shared===0?20:shared<=2?12:shared<=4?5:0;
  const result=Math.round(famScore+sillScore+noteScore);
  _layCache[k]=result;
  return result;
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
const RA={};
function getAssigned(roleId){return RA[roleId]||[]}
function getPrimary(roleId){return getAssigned(roleId)[0]||null}
function assignFrag(roleId,fragId){
  if(!RA[roleId])RA[roleId]=[];
  // Remove if already present
  const idx=RA[roleId].indexOf(fragId);
  if(idx!==-1){RA[roleId].splice(idx,1);return}
  // Otherwise add (push to end if not primary, or prepend to make primary)
  RA[roleId].push(fragId);
}
function makePrimary(roleId,fragId){
  if(!RA[roleId])RA[roleId]=[];
  const idx=RA[roleId].indexOf(fragId);
  if(idx===-1)RA[roleId].unshift(fragId);
  else{RA[roleId].splice(idx,1);RA[roleId].unshift(fragId);}
}
function removeFromRole(roleId,fragId){
  if(!RA[roleId])return;
  RA[roleId]=RA[roleId].filter(id=>id!==fragId);
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

// Defaults
['casual','gypsy-water'],['signature','endeavour'],['cold','eleventh-hour'],['creative','oronardo']
  .forEach(([r,f])=>{if(!RA[r])RA[r]=[];RA[r].push(f)});



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
function _renderDeskDetail(animateIn){
  const top=detailStack[detailStack.length-1];if(!top)return;
  const inner=document.getElementById('detail-inner');
  inner.classList.remove('slide');
  inner.innerHTML='';
  top(inner);
  document.getElementById('detail-back').classList.toggle('visible',detailStack.length>1);
  if(animateIn){inner.offsetWidth;inner.classList.add('slide')}
}
function closeDesktopDetail(){
  const len=detailStack.length;
  detailStack.length=0;
  document.getElementById('col-detail').classList.remove('open');
  document.getElementById('detail-scrim').classList.remove('open');
  for(let i=0;i<len;i++)_returnFocus();
}
function popDesktopDetail(){
  if(detailStack.length<=1){closeDesktopDetail();return}
  detailStack.pop();_renderDeskDetail();
  _returnFocus();
}
document.getElementById('detail-back').addEventListener('click',popDesktopDetail);
document.getElementById('detail-close-btn').addEventListener('click',closeDesktopDetail);
document.getElementById('detail-scrim').addEventListener('click',closeDesktopDetail);

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
    el.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
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
function pushDetail(renderFn,title){
  if(isDesktop()||isTablet())pushDesktopDetail(renderFn);
  else pushSheet(c=>renderFn(c),title);
}

/* ══ SHARED RENDERERS ══════════════════════════════════════════════ */
const SW=['','Skin','Skin','Subtle','Subtle','Moderate','Moderate','Strong','Strong','Enveloping','Enormous'];
const LW=['','Linear','Linear','Simple','Simple','Balanced','Balanced','Layered','Layered','Complex','Deep'];

function linkNotes(arr){
  return arr.map(n=>{
    const key=n.toLowerCase();const note=NI_MAP[key];
    const savedMark = note && isNoteSaved(note.name) ? ' <span style="color:var(--accent);margin-left:2px;font-size:0.85em;text-decoration:none;display:inline-block;">★</span>' : '';
    return note?`<button class="cmp-note-pill" data-note="${n}">${n}${savedMark}</button>`: `<span class="cmp-note-pill">${n}</span>`;
  }).join('');
}

function renderFragDetail(container,frag){
  const fm=FAM[frag.family]||{label:frag.family,color:'#888'};

  container.innerHTML=`

    <div class="dc-name">${frag.name}</div>
    <button class="dc-brand-btn">${frag.brand}</button>
    <div class="chip" style="background:${fm.color}; margin-bottom: var(--sp-xl);">
      <span style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.3);display:inline-block;flex-shrink:0"></span>
      ${fm.label}
    </div>
    <div class="dc-collect-row" id="dc-collect-${frag.id}"></div>
    ${frag.description?`<div class="dc-description">${frag.description}</div>`:''}
    ${frag.story?`<div class="dc-story" style="margin-top:var(--sp-md); padding:var(--sp-md); background:var(--g50); border-radius:6px; font-size:var(--fs-body-sm); color:var(--g600); border:1px solid var(--g200);">${frag.story}</div>`:''}
    ${frag.url?`<a href="${frag.url}" target="_blank" rel="noopener" class="dc-collect-btn" style="display:flex; justify-content:center; margin-top:var(--sp-md); background:var(--black); color:var(--paper); border:none;">Buy from ${frag.brand}</a>`:''}
    <div class="dc-cmp-cta-label">Compare with</div>
    <div class="dc-cmp-ctas" id="dc-ctas-${frag.id}"></div>
    <div class="dc-stats">
      <div class="dc-stat"><div class="dc-slbl">Sillage</div><div class="dc-bar"><div class="dc-fill" style="width:${frag.sillage*10}%"></div></div><div class="dc-sval">${SW[frag.sillage]}</div></div>
      <div class="dc-stat"><div class="dc-slbl">Structure</div><div class="dc-bar"><div class="dc-fill" style="width:${frag.layering*10}%"></div></div><div class="dc-sval">${LW[frag.layering]}</div></div>
    </div>
    <div class="dc-div"></div>
    <div class="dc-nlbl" style="margin-bottom:var(--sp-xs);">Sensory Profile</div>
    <div style="display:flex; flex-direction:column; gap:var(--sp-sm); margin-bottom:var(--sp-2xl);">
      ${(() => {
        const p = computeProfile(frag);
        const bar = (label, val, color) => `
          <div style="display:flex; align-items:center; gap:var(--sp-sm);">
            <div style="width:60px; font-size:var(--fs-caption); font-family:var(--font-sans); font-weight:600; text-transform:uppercase; color:var(--text-tertiary);">${label}</div>
            <div style="flex:1; height:4px; background:var(--border-subtle); border-radius:var(--radius-micro); position:relative;">
              <div style="position:absolute; top:0; left:0; height:100%; width:${Math.round(val*100)}%; background:${color}; border-radius:var(--radius-micro);"></div>
            </div>
          </div>`;
        return bar('Fresh', p.freshness, 'var(--fam-citrus)') +
               bar('Sweet', p.sweetness, 'var(--fam-floral)') +
               bar('Warm', p.warmth, 'var(--fam-amber)');
      })()}
    </div>

    <div class="dc-nlbl" style="margin-bottom:var(--sp-md);">Scent Journey</div>
    <div style="border-left: 2px solid var(--border-standard); margin-left: 6px; padding-left: var(--sp-lg); display:flex; flex-direction:column; gap:var(--sp-lg);">
      <div style="position:relative;">
        <div style="position:absolute; left:calc(-1 * var(--sp-lg) - 7px); top:4px; width:10px; height:10px; border-radius:50%; background:var(--bg-primary); border:2px solid var(--border-strong);"></div>
        <div class="dc-nt" style="margin-bottom:var(--sp-xs); width:auto; color:var(--text-primary);">Opening <span style="color:var(--text-tertiary);font-weight:400;text-transform:none;">(Top Notes)</span></div>
        <div class="dc-nv" style="margin-bottom:0;">${linkNotes(frag.top)}</div>
      </div>
      <div style="position:relative;">
        <div style="position:absolute; left:calc(-1 * var(--sp-lg) - 7px); top:4px; width:10px; height:10px; border-radius:50%; background:var(--bg-primary); border:2px solid var(--border-strong);"></div>
        <div class="dc-nt" style="margin-bottom:var(--sp-xs); width:auto; color:var(--text-primary);">Heart <span style="color:var(--text-tertiary);font-weight:400;text-transform:none;">(Mid Notes)</span></div>
        <div class="dc-nv" style="margin-bottom:0;">${linkNotes(frag.mid)}</div>
      </div>
      <div style="position:relative;">
        <div style="position:absolute; left:calc(-1 * var(--sp-lg) - 7px); top:4px; width:10px; height:10px; border-radius:50%; background:var(--border-strong);"></div>
        <div class="dc-nt" style="margin-bottom:var(--sp-xs); width:auto; color:var(--text-primary);">Dry Down <span style="color:var(--text-tertiary);font-weight:400;text-transform:none;">(Base Notes)</span></div>
        <div class="dc-nv" style="margin-bottom:0;">${linkNotes(frag.base)}</div>
      </div>
    </div>
    <p class="dc-notes-caveat" style="margin-top:var(--sp-xl);">Key materials only — simplified pyramid</p>`;

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
    wishBtn.innerHTML=`<span class="dc-collect-icon">${st==='wish'?'♥':'♡'}</span> Wishlist`;
    wishBtn.addEventListener('click',e=>{e.stopPropagation();setState(frag.id,st==='wish'?'none':'wish');refreshAfterStateChange(frag.id);renderCollectRow();});
    const ownBtn=document.createElement('button');
    ownBtn.className='dc-collect-btn'+(st==='owned'?' active':'');
    ownBtn.innerHTML=`<span class="dc-collect-icon">${st==='owned'?'✓':''}</span> ${st==='owned'?'Owned':'Mark owned'}`;
    ownBtn.addEventListener('click',e=>{e.stopPropagation();setState(frag.id,st==='owned'?'none':'owned');refreshAfterStateChange(frag.id);renderCollectRow();});
    el.appendChild(wishBtn);el.appendChild(ownBtn);
  }
  renderCollectRow();

  // Compare CTAs
  _buildCompareCTAs(frag,container.querySelector(`#dc-ctas-${frag.id}`));

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
    lbl.className='dc-sim-lbl';lbl.textContent='More like this';
    container.appendChild(lbl);
    const shelf=document.createElement('div');shelf.className='dc-sim-shelf';

    scored.forEach(({f})=>{
      const fm2=FAM[f.family]||{color:'#888'};
      const famLabel2=(FAM[f.family]||{label:f.family}).label;
      const reason=getSwapReason(frag,f);
      const badge=classifyDiscovery(frag,f);
      const row=document.createElement('button');
      row.className='scent-row scent-row--flat cmp-sug-card';
      row.innerHTML=`
        <div class="scent-row-content" style="border-left-color: ${fm2.color}">
          <div class="frag-picker-dot" style="background:${fm2.color}"></div>
          <div class="frag-picker-info" style="flex:1;text-align:left;">
            <div class="frag-picker-item-name">${f.name}</div>
            <div class="frag-picker-item-brand">${f.brand} · ${famLabel2}</div>
            ${reason ? `<div class="dc-sim-reason">${reason}</div>` : ''}
          </div>
          ${badge?`<div style="flex-shrink:0"><span class="dc-badge ${badge.type}">${badge.label}</span></div>`:''}
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
  lbl.className='dc-sim-lbl';lbl.textContent='Layer with what you own';
  container.appendChild(lbl);
  const shelf=document.createElement('div');shelf.className='dc-sim-shelf';
  candidates.forEach(({f,score})=>{
    const fm2=FAM[f.family]||{color:'#888'};
    const reason=layerReason(frag,f);
    const row=document.createElement('button');
    row.className='scent-row scent-row--flat';
    row.innerHTML=`
      <div class="scent-row-content" style="border-left-color: ${fm2.color}">
        <div class="frag-picker-dot" style="background:${fm2.color}"></div>
        <div class="frag-picker-info" style="flex:1">
          <div class="frag-picker-item-name">${f.name} <span class="dc-sim-brand-btn" style="color:var(--text-secondary);font-size:var(--fs-meta);font-weight:normal">· ${f.brand}</span></div>
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
    <div class="np-name">${note.name}</div>
    <div class="np-family">${fm.label}</div>
    <div class="np-desc">${note.desc}</div>
    <div id="${saveId}" style="margin-top:var(--sp-md);"></div>
    ${note.extraction_method?`<div style="margin-top:var(--sp-sm); font-size:var(--fs-caption); color:var(--g500);"><strong>Extraction:</strong> ${note.extraction_method}</div>`:''}
    ${note.insider_fact?`<div style="margin-top:var(--sp-sm); padding:var(--sp-sm); background:var(--g50); border-radius:var(--radius); font-size:var(--fs-caption); color:var(--g600); border:1px solid var(--g200);"><strong style="display:block; margin-bottom:var(--sp-xs); color:var(--g900);">Perfumer's Insight</strong>${note.insider_fact}</div>`:''}
    ${inf.length?`<div class="np-frags" style="margin-top:var(--sp-md)"><div class="dc-nlbl" style="margin:0 0 var(--sp-xs)">In catalog (${inf.length})</div><div id="_nfl" style="border:1px solid var(--g200);border-radius:var(--radius-lg);overflow:hidden"></div></div>`:''}`;

  renderNoteSaveBtn(container.querySelector(`#${saveId}`), note);

  if(inf.length){
    const span=container.querySelector('#_nfl');
    [...inf].sort((a,b)=>a.name.localeCompare(b.name)).forEach(f=>{
      const fc=getCmpFam(f.family);
      const btn=document.createElement('button');btn.className='frag-picker-item';
      btn.innerHTML=`<div class="frag-picker-dot" style="background:${fc.accent}"></div><div><div class="frag-picker-item-name">${f.name}</div><div class="frag-picker-item-brand">${f.brand}</div></div>`;
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

function openFragDetail(frag){openDetail(c=>renderFragDetail(c,frag),frag.name)}

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
  const legendHTML = famStats.map(f => `<div style="display:inline-flex; align-items:center; margin-right:var(--sp-md); margin-bottom:var(--sp-xs); font-size:var(--fs-meta); color:var(--text-secondary);"><span style="display:inline-block; width:8px; height:8px; border-radius:var(--radius-circle); background:${f.color}; margin-right:var(--sp-xs);"></span>${f.label}</div>`).join('');

  let topCount = 0;
  if (frags.length >= 10) topCount = 5;
  else if (frags.length >= 5) topCount = 3;
  else if (frags.length >= 1) topCount = 2;

  // We'll just take the first N fragrances in the sorted array
  const topFrags = frags.slice(0, topCount);

  container.innerHTML=`<div class="house-detail-wrap">
    <div class="house-detail-name">${brand}</div>
    ${houseData && houseData.desc ? `<div class="dc-description" style="margin-top:var(--sp-sm);">${houseData.desc}</div>` : ''}
    <div id="house-brand-save-wrap" style="margin-top:var(--sp-md);"></div>
    ${houseData && houseData.url ? `<a href="${houseData.url}" target="_blank" rel="noopener" class="dc-collect-btn" style="display:flex; justify-content:center; margin-top:var(--sp-md); background:var(--black); color:var(--paper); border:none;">Visit ${brand} Website</a>` : ''}
    ${brand.toLowerCase() === 'byredo' ? `<button class="dc-collect-btn byredo-quiz-btn" style="display:flex; justify-content:center; margin-top:var(--sp-md); background:var(--g100); color:var(--g900); border:1px solid var(--g300);">Find Your Byredo (Concierge Quiz)</button>` : ''}

    <div style="margin:var(--sp-xl) 0;">
      <div class="dc-slbl">Fragrance Families</div>
      <div style="height:var(--sp-sm); width:100%; display:flex; border-radius:var(--radius); overflow:hidden; margin-bottom:var(--sp-sm);">${barHTML}</div>
      <div style="display:flex; flex-wrap:wrap;">${legendHTML}</div>
    </div>

    ${topFrags.length > 0 ? `
    <div class="house-known-for" style="margin-bottom:var(--sp-xl);">
      <div class="dc-slbl" style="margin-bottom:var(--sp-md);">Known For</div>
      <div class="carousel-wrap">
        <div class="carousel" id="house-known-for-carousel"></div>
      </div>
    </div>
    ` : ''}

    <div class="house-detail-count">${frags.length} fragrance${frags.length!==1?'s':''}</div>
    <div class="house-detail-list" id="house-list-${brand.replace(/\s+/g,'-')}"></div>
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
      card.innerHTML = `<div class="carousel-card-name">${frag.name}</div>
        <div class="carousel-card-brand">${frag.brand}</div>
        <div class="carousel-card-family"><div class="fam-dot" style="background:${fm.color}"></div><span style="font-size:.6rem;color:var(--g500)">${fm.label}</span></div>`;
      card.addEventListener('click', e => { e.stopPropagation(); pushDetail(c => renderFragDetail(c, frag), frag.name); });
      carousel.appendChild(card);
    });
  }

  const list=container.querySelector('.house-detail-list');
  frags.forEach(frag=>{
    const fc=getCmpFam(frag.family);
    const btn=document.createElement('button');
    btn.className='frag-picker-item';
    btn.innerHTML=`<div class="frag-picker-dot" style="background:${fc.accent}"></div>
      <div>
        <div class="frag-picker-item-name">${frag.name}</div>
        <div class="frag-picker-item-brand">${(FAM[frag.family]||{}).label||frag.family}</div>
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
      btn.className = 'frag-picker-item';
      btn.innerHTML = `<div class="frag-picker-dot" style="background:${fc.accent}"></div>
        <div>
          <div class="frag-picker-item-name">${frag.name}</div>
          <div class="frag-picker-item-brand">${(FAM[frag.family] || {}).label || frag.family}</div>
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
      btn.className = 'frag-picker-item';
      btn.innerHTML = `<div class="frag-picker-dot" style="background:${fc.accent}"></div>
        <div>
          <div class="frag-picker-item-name">${frag.name}</div>
          <div class="frag-picker-item-brand">${frag.brand} · ${(FAM[frag.family] || {}).label || frag.family}</div>
        </div>`;
      btn.addEventListener('click', () => { window.haptic?.('light'); pushDetail(c => renderFragDetail(c, frag), frag.name); });
      list.appendChild(btn);
    });
  }

  renderStep();
}

function refreshAfterStateChange(id){
  const row=document.querySelector(`.scent-row[data-id="${id}"]`);
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
    const lbl=document.createElement('div');lbl.className='dc-nlbl';lbl.style.marginBottom='6px';lbl.textContent=`In catalog (${sortedInf.length})`;
    fe.appendChild(lbl);
    const list=document.createElement('div');list.style.cssText='border:1px solid var(--g200);border-radius:8px;overflow:hidden';
    sortedInf.forEach(f=>{
      const fc=getCmpFam(f.family);
      const btn=document.createElement('button');btn.className='frag-picker-item';
      btn.innerHTML=`<div class="frag-picker-dot" style="background:${fc.accent}"></div><div><div class="frag-picker-item-name">${f.name}</div><div class="frag-picker-item-brand">${f.brand}</div></div>`;
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
        <div class="carousel-card-family"><div class="fam-dot" style="background:${fm.color}"></div><span style="font-size:.6rem;color:var(--g500)">${fm.label}</span></div>`;
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
  document.querySelectorAll('.scent-row').forEach(row=>{
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
  if(CAT_BRAND_FILTER)visibleCat=visibleCat.filter(f=>f.brand===CAT_BRAND_FILTER);
  if(CAT_STATE_FILTER==='owned')visibleCat=visibleCat.filter(f=>isOwned(f.id));
  else if(CAT_STATE_FILTER==='wish')visibleCat=visibleCat.filter(f=>isWish(f.id));
  if(search)visibleCat=visibleCat.filter(f=>
    f._nameL.includes(search)||
    f._brandL.includes(search)||
    f._nAll.some(n=>n.includes(search))
  );

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
      const row=e.target.closest('.scent-row');if(!row)return;
      // Prevent click if we swiped
      const content = row.querySelector('.scent-row-content');
      if(content && content.style.transform && content.style.transform !== 'translateX(0px)') return;

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

    // Long press logic
    list.addEventListener('touchstart', e=>{
      const row=e.target.closest('.scent-row');if(!row)return;
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
    btn.textContent=label;
    btn.addEventListener('click',()=>{
      CAT_STATE_FILTER=val;
      allStateBtns.forEach(b=>b.classList.toggle('active',b.dataset.val===(val===null?'':val)));
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
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentNoteTier = tab.dataset.tier;
        buildNotes(currentNoteQuery, currentNoteTier);
      });
    });
  }

  // Helper: build brand tabs into a container; allBrandBtns for sync
  const allBrandBtns=[];
  function makeBrandBtn(label,val,html,container){
    const btn=document.createElement('button');
    btn.className='tab'+(CAT_BRAND_FILTER===val?' active':'');
    btn.innerHTML=html;
    btn.dataset.brand=val===null?'':val;
    btn.addEventListener('click',()=>{
      CAT_BRAND_FILTER=val;
      allBrandBtns.forEach(b=>b.classList.toggle('active',b.dataset.brand===(val===null?'':val)));
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
  row.className=`scent-row frag-picker-item s-${st}`;
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
      notesHtml=`<div class="frag-picker-item-notes">${rendered}</div>`;
    } else if(midIdx!==-1||baseIdx!==-1){
      // Replace notes line with a "why matched" badge
      const tier=midIdx!==-1?'Mid':'Base';
      const note=midIdx!==-1?frag.mid[midIdx]:frag.base[baseIdx];
      notesHtml=`<div class="frag-picker-item-notes"><span class="match-badge">↳ ${tier} · ${note}</span></div>`;
    } else {
      // Name or brand match — show top notes as normal
      const topNotes=(frag.top||[]).slice(0,3).join(', ');
      if(topNotes)notesHtml=`<div class="frag-picker-item-notes">${topNotes}</div>`;
    }
  } else {
    const topNotes=(frag.top||[]).slice(0,3).join(', ');
    if(topNotes)notesHtml=`<div class="frag-picker-item-notes">${topNotes}</div>`;
  }

  row.draggable = true;
  row.innerHTML=`
    <div class="scent-row-actions">
      <button class="scent-row-action compare" data-id="${frag.id}">Compare</button>
      <button class="scent-row-action wishlist" data-id="${frag.id}">${st==='wish'?'Unwish':'Wish'}</button>
    </div>
    <div class="scent-row-content">
      <div class="frag-picker-dot" style="background:${fm.color}"></div>
      <div class="frag-picker-info">
        <div class="frag-picker-item-name">${frag.name}</div>
        <div class="frag-picker-item-brand">${frag.brand} · ${famLabel}</div>
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

  // Swipe to action logic
  const content = row.querySelector('.scent-row-content');
  if(!content) return;
  let sx=0, sy=0, swiping=false, swiped=false;
  content.addEventListener('touchstart', e=>{
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
    swiping = true;
    content.style.transition = 'none';
  }, {passive:true});
  content.addEventListener('touchmove', e=>{
    if(!swiping) return;
    const dx = e.touches[0].clientX - sx;
    const dy = e.touches[0].clientY - sy;
    if(Math.abs(dx) > Math.abs(dy) && dx < 0) { // dragging left
      content.style.transform = `translateX(${Math.max(-160, dx)}px)`;
      e.preventDefault(); // prevent vertical scroll if panning horizontally
    }
  });
  content.addEventListener('touchend', e=>{
    swiping = false;
    content.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    const dx = e.changedTouches[0].clientX - sx;
    if(dx < -60) {
      content.style.transform = `translateX(-160px)`;
      swiped = true;
      window.haptic?.('light');
    } else {
      content.style.transform = `translateX(0)`;
      swiped = false;
    }
  });

  // Action listeners
  row.querySelector('.scent-row-action.compare')?.addEventListener('click', e=>{
    e.stopPropagation();
    window.haptic?.('success');
    _selectFragForSlot(CMP_A ? 'b' : 'a', frag);
    go('compare', document.querySelector('.mbn-btn[onclick*="compare"]'));
    closeAllSheets?.();
  });
  row.querySelector('.scent-row-action.wishlist')?.addEventListener('click', e=>{
    e.stopPropagation();
    window.haptic?.('success');
    setState(frag.id, st==='wish'?'none':'wish');
    refreshAfterStateChange(frag.id);
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
  if(el)el.textContent=[o&&`${o} owned`,w&&`${w} wished`].filter(Boolean).join(' · ');
}

/* ══ BUILD NOTES ════════════════════════════════════════════════════ */
let notesSearchQuery = '';
let notesSortMode = 'family'; // 'family' or 'az'
let notesTierMode = 'all';

window.setNotesTab = function(mode) {
  notesSortMode = mode;
  document.getElementById('notes-tab-family').classList.toggle('active', mode === 'family');
  document.getElementById('notes-tab-az').classList.toggle('active', mode === 'az');
  buildNotes();
};

function buildNotes(searchQuery, currentTier){
  if (searchQuery !== undefined) notesSearchQuery = searchQuery;
  if (currentTier !== undefined) notesTierMode = currentTier;

  const body=document.getElementById('notes-body');body.innerHTML='';

  // Filter notes by search query and tier
  const sq = notesSearchQuery.toLowerCase().trim();
  const filteredNotes = NI.filter(n => {
    const matchesQuery = n.name.toLowerCase().includes(sq);
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
    cardBody.style.marginTop = 'var(--sp-lg)';

    const sorted = [...filteredNotes].sort((a,b)=>a.name.localeCompare(b.name));

    sorted.forEach(note => {
      const fm = FAM[note.family] || {color: '#888'};
      const btn = document.createElement('button');
      btn.className = 'note-pill';
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
      header.innerHTML=`<div class="nf-dot" style="background:${fm.color}"></div><div><div class="nf-name">${fm.label}</div>${fm.desc?`<div class="nf-desc">${fm.desc}</div>`:''}</div>`;

      const cardBody=document.createElement('div');cardBody.className='notes-card-body';
      grouped[fk].forEach(note=>{
        const btn=document.createElement('button');btn.className='note-pill';
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
      <div class="dc-nlbl" style="margin-top:0">Notes</div>
      <div class="dc-note"><span class="dc-nt">Top</span><span class="dc-nv">${linkNotes(frag.top)}</span></div>
      <div class="dc-note"><span class="dc-nt">Mid</span><span class="dc-nv">${linkNotes(frag.mid)}</span></div>
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
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab:not(.dc-state-wrap .tab):not(.picker-row .tab):not(.cat-state-bar .tab):not(.cat-brand-bar .tab):not(.cat-state-bar-m .tab):not(.cat-brand-bar-m .tab):not(.roles-brand-bar .tab)').forEach(t=>t.classList.remove('active'));
  document.getElementById('p-'+id).classList.add('active');
  if(btn)btn.classList.add('active');
  closeDesktopDetail();

}

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
function goMobile(id,btn){
  document.querySelectorAll('.mbn-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  go(id,null);
}
function openMoreSheet(btn){
  document.querySelectorAll('.mbn-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const items=[
    {id:'saved',icon:'★', label:'My Collection', action:"closeAllSheets();goMobile('saved',document.querySelector('.mbn-more'))"},
    {id:'changelog',icon:'↩', label:'Changelog', action:"closeAllSheets();goMobile('changelog',document.querySelector('.mbn-more'))"},
    {id:'playground',icon:'❖', label:'Design System', action:"window.open('playground.html', '_blank')"}
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

// 5-dim profile: freshness, sweetness, warmth, intensity, complexity
// [freshness, sweetness, warmth] family anchors; intensity from sillage; complexity from structure
const FAM_PROFILE_BASE={
  citrus:  [0.90,0.28,0.10],
  green:   [0.82,0.18,0.20],
  aquatic: [0.92,0.10,0.08],
  floral:  [0.62,0.58,0.40],
  chypre:  [0.58,0.30,0.50],
  woody:   [0.30,0.30,0.72],
  amber:   [0.18,0.72,0.88],
  gourmand:[0.10,0.92,0.80],
  leather: [0.18,0.20,0.82],
  oud:     [0.08,0.40,1.00],
};
// Per-note sensory profiles [freshness, sweetness, warmth] 0–1
// Blended into computeProfile() at 60% weight; family base anchors at 40%
const NOTE_PROFILE={
  'agarwood':          [0.10,0.22,0.90],
  'aldehydes':         [0.72,0.20,0.38],
  'almond':            [0.10,0.85,0.60],
  'amber':             [0.10,0.62,0.90],
  'ambergris':         [0.20,0.35,0.65],
  'ambrette':          [0.32,0.50,0.52],
  'apple':             [0.65,0.55,0.12],
  'atlas cedar':       [0.35,0.10,0.65],
  'basil':             [0.72,0.10,0.30],
  'benzoin':           [0.10,0.65,0.80],
  'bergamot':          [0.92,0.25,0.10],
  'birch tar':         [0.15,0.10,0.75],
  'black currant':     [0.68,0.42,0.22],
  'black orchid':      [0.20,0.50,0.60],
  'black pepper':      [0.50,0.10,0.55],
  'blood orange':      [0.80,0.48,0.12],
  'caramel':           [0.05,0.90,0.70],
  'cardamom':          [0.42,0.28,0.78],
  'casablanca lily':   [0.52,0.38,0.30],
  'castoreum':         [0.10,0.22,0.80],
  'cedar':             [0.32,0.10,0.65],
  'cedarwood':         [0.32,0.10,0.65],
  'cinnamon':          [0.22,0.50,0.82],
  'cistus':            [0.25,0.30,0.72],
  'clove':             [0.20,0.35,0.85],
  'coconut':           [0.15,0.80,0.55],
  'coffee':            [0.18,0.50,0.72],
  'cyclamen':          [0.65,0.28,0.20],
  'cypriol':           [0.18,0.15,0.75],
  'driftwood':         [0.35,0.05,0.52],
  'elemi':             [0.38,0.12,0.68],
  'eucalyptus':        [0.80,0.05,0.15],
  'fig':               [0.42,0.50,0.38],
  'fir':               [0.58,0.05,0.40],
  'frankincense':      [0.32,0.20,0.75],
  'freesia':           [0.70,0.35,0.22],
  'galbanum':          [0.70,0.05,0.22],
  'gardenia':          [0.42,0.50,0.40],
  'geranium':          [0.65,0.20,0.35],
  'ginger':            [0.55,0.20,0.65],
  'grapefruit':        [0.90,0.20,0.05],
  'grass':             [0.80,0.10,0.12],
  'green tea':         [0.75,0.15,0.22],
  'guaiac wood':       [0.22,0.15,0.70],
  'heliotrope':        [0.30,0.70,0.50],
  'honey':             [0.10,0.85,0.65],
  'honeysuckle':       [0.55,0.55,0.30],
  'hyacinth':          [0.60,0.30,0.22],
  'incense':           [0.25,0.15,0.80],
  'iris':              [0.48,0.32,0.38],
  'jasmine':           [0.40,0.52,0.55],
  'labdanum':          [0.10,0.42,0.90],
  'lapsang':           [0.20,0.10,0.72],
  'lavender':          [0.70,0.15,0.35],
  'leather':           [0.10,0.10,0.75],
  'lemon':             [0.92,0.20,0.05],
  'lily':              [0.55,0.30,0.30],
  'lily of the valley':[0.72,0.25,0.20],
  'lime':              [0.88,0.15,0.05],
  'magnolia':          [0.52,0.38,0.30],
  'mandarin':          [0.82,0.45,0.15],
  'mate':              [0.60,0.10,0.30],
  'mimosa':            [0.55,0.50,0.40],
  'mint':              [0.85,0.10,0.10],
  'musk':              [0.25,0.30,0.50],
  'myrrh':             [0.15,0.28,0.85],
  'narcissus':         [0.42,0.38,0.45],
  'neroli':            [0.75,0.35,0.30],
  'nutmeg':            [0.30,0.30,0.75],
  'oakmoss':           [0.30,0.10,0.60],
  'orange blossom':    [0.60,0.52,0.40],
  'orchid':            [0.40,0.45,0.42],
  'oud':               [0.05,0.38,0.95],
  'palisander':        [0.22,0.18,0.70],
  'papyrus':           [0.42,0.10,0.35],
  'patchouli':         [0.10,0.28,0.85],
  'peach':             [0.55,0.72,0.20],
  'peony':             [0.60,0.42,0.30],
  'pepper':            [0.50,0.10,0.55],
  'pine':              [0.55,0.05,0.45],
  'pineapple':         [0.65,0.68,0.12],
  'pink pepper':       [0.58,0.18,0.50],
  'praline':           [0.05,0.90,0.65],
  'rose':              [0.50,0.50,0.45],
  'rosemary':          [0.68,0.08,0.35],
  'rosewood':          [0.35,0.22,0.60],
  'saffron':           [0.22,0.30,0.80],
  'sandalwood':        [0.20,0.32,0.78],
  'smoke':             [0.15,0.08,0.72],
  'suede':             [0.22,0.22,0.60],
  'tea':               [0.62,0.12,0.28],
  'tiare':             [0.45,0.55,0.50],
  'tobacco':           [0.12,0.40,0.78],
  'tonka bean':        [0.10,0.80,0.70],
  'tuberose':          [0.35,0.55,0.60],
  'tulip':             [0.60,0.30,0.25],
  'vanilla':           [0.05,0.90,0.70],
  'vetiver':           [0.25,0.10,0.72],
  'violet':            [0.50,0.30,0.35],
  'violet leaf':       [0.65,0.15,0.20],
  'waterlily':         [0.80,0.20,0.12],
  'white musk':        [0.32,0.35,0.42],
  'ylang-ylang':       [0.30,0.60,0.65],
  'yuzu':              [0.88,0.20,0.08],
};
function computeProfile(frag){
  if(frag._profile)return frag._profile;
  const b=FAM_PROFILE_BASE[frag.family]||[0.5,0.5,0.5];
  // Collect notes with tier weights: top=0.5, mid=1.0, base=1.5
  const weighted=[
    ...(frag._nTop||[]).map(n=>({n,w:0.5})),
    ...(frag._nMid||[]).map(n=>({n,w:1.0})),
    ...(frag._nBase||[]).map(n=>({n,w:1.5})),
  ].filter(({n})=>NOTE_PROFILE[n]);
  if(weighted.length===0){
    frag._profile={freshness:b[0],sweetness:b[1],warmth:b[2],intensity:(frag.sillage||5)/10,complexity:(frag.layering||5)/10};
    return frag._profile;
  }
  const totalW=weighted.reduce((s,{w})=>s+w,0);
  const avg=weighted.reduce((acc,{n,w})=>{const p=NOTE_PROFILE[n];acc[0]+=p[0]*w;acc[1]+=p[1]*w;acc[2]+=p[2]*w;return acc;},[0,0,0]).map(v=>v/totalW);
  // 60% note-derived, 40% family anchor
  frag._profile={
    freshness:avg[0]*0.6+b[0]*0.4,
    sweetness:avg[1]*0.6+b[1]*0.4,
    warmth:   avg[2]*0.6+b[2]*0.4,
    intensity:(frag.sillage||5)/10,
    complexity:(frag.layering||5)/10,
  };
  return frag._profile;
}

/* ── Swap Reason Helper ── */
function getSwapReason(anchor, candidate){
  const pa = computeProfile(anchor);
  const pc = computeProfile(candidate);

  const dInt = pc.intensity - pa.intensity;
  const dCpx = pc.complexity - pa.complexity;
  const dSwt = pc.sweetness - pa.sweetness;
  const dFrs = pc.freshness - pa.freshness;
  const dWrm = pc.warmth - pa.warmth;

  const famA = (FAM[anchor.family]||{label:anchor.family}).label;
  const famC = (FAM[candidate.family]||{label:candidate.family}).label;
  const sameFam = anchor.family === candidate.family;

  const sharedNotes = anchor._nAll.filter(n => candidate._nAll.includes(n));
  const shNote = sharedNotes.length > 0 ? sharedNotes[0].charAt(0).toUpperCase() + sharedNotes[0].slice(1) : null;

  // Thresholds
  const TH = 0.15;
  const TH_LG = 0.3;

  // Hierarchy of reasons
  if (dInt > TH_LG) return `A bolder, stronger ${sameFam ? 'take' : 'alternative'}${shNote ? ` sharing ${shNote}` : ''}`;
  if (dInt < -TH_LG) return `A more subtle, intimate ${sameFam ? 'take' : 'alternative'}${shNote ? ` sharing ${shNote}` : ''}`;

  if (dCpx > TH_LG) return `A more complex and layered ${sameFam ? famA : famC}`;
  if (dCpx < -TH_LG) return `An easier-to-wear, simpler ${sameFam ? famA : famC}`;

  if (dSwt > TH) return `A sweeter, more gourmand approach to ${sameFam ? famA : 'this profile'}`;
  if (dFrs > TH) return `A fresher, brighter take${sameFam ? ' on '+famA : ''}`;
  if (dWrm > TH) return `A warmer, cozier alternative${sameFam ? ' on '+famA : ''}`;

  if (dSwt < -TH) return `A less sweet, drier alternative`;
  if (dFrs < -TH) return `A deeper, less fresh take`;

  // Fallbacks if profiles are very similar
  if (shNote && sameFam) return `A very similar ${famA} focused on ${shNote}`;
  if (sameFam) return `A closely related ${famA} to try`;
  if (shNote) return `A ${famC} alternative sharing ${shNote}`;

  return `An alternative from the ${famC} family`;
}

/* ── Scoring helpers ── */
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
      <desc>Radar chart comparing ${fa.name} and ${fb.name} across five dimensions: freshness, sweetness, warmth, intensity, and depth.</desc>
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
      ${noteRow('Mid',onlyAMid,shMid,onlyBMid)}
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
    return`<button class="scent-row scent-row--flat cmp-sug-card" data-fid="${frag.id}">
      <div class="scent-row-content" style="border-left-color: ${fc.accent}">
        <div class="frag-picker-dot" style="background:${fc.accent}"></div>
        <div class="frag-picker-info" style="flex:1;text-align:left;">
          <div class="frag-picker-item-name">${frag.name}</div>
          <div class="frag-picker-item-brand">${frag.brand} · ${famLabel}</div>
          <div class="dc-sim-reason">${reason}</div>
          ${topNotes?`<div class="frag-picker-item-notes">${topNotes}</div>`:''}
        </div>
      </div>
    </button>`;
  }
  const sugsA=getSugs(fa,fb),sugsB=getSugs(fb,fa);
  const shortA=fa.name.split(' ').slice(0,2).join(' ');
  const shortB=fb.name.split(' ').slice(0,2).join(' ');
  return`<div class="cmp-sug-v2">
    <div class="cmp-sug-v2-label">Swap suggestions</div>
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
      const info = NI_MAP[n.toLowerCase()];
      if (!info) return false;
      const t = info.tags || [];
      if (dimKey === 'freshness') return t.includes('citrus') || t.includes('green') || t.includes('aquatic');
      if (dimKey === 'sweetness') return t.includes('sweet') || t.includes('floral') || t.includes('fruity');
      if (dimKey === 'warmth') return t.includes('warm') || t.includes('spicy') || t.includes('woody') || t.includes('amber');
      return false; // Intensity/complexity don't map directly to single notes
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
          <div class="cmp-edu-title">Character Details</div>
        </div>
        <button class="cmp-edu-close" aria-label="Close" onclick="document.getElementById('cmp-edu-overlay').classList.remove('open')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
        </button>
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
    bodyContent = `
      <div class="cmp-edu-intro">How is this score calculated, and what does it mean for this pair?</div>
      <div class="cmp-edu-grid">
        ${quads.map(q=>`<div class="cmp-edu-quad${q.hi?' highlight':''}"><div class="cmp-edu-quad-tag">${q.tag}</div><div class="cmp-edu-quad-title">${q.title}</div><div class="cmp-edu-quad-desc">${q.desc}</div></div>`).join('')}
      </div>`;
  } else {
    const famComp=FAM_COMPAT[fa.family]?.[fb.family]??0.5;
    const famScore=famComp*35;
    const sillDiff=Math.abs(fa.sillage-fb.sillage);
    const sillScore=sillDiff>=3?20:sillDiff>=1?10:0;
    const shared=fa._nAll.filter(n=>fb._nAll.includes(n)).length;
    const noteScore=shared===0?20:shared<=2?12:shared<=4?5:0;
    const rawScore = famScore + sillScore + noteScore;

    bodyContent = `
      <div class="dc-name" style="margin-top:var(--sp-md);">Mathematical Breakdown</div>
      <div class="dc-description">How is this score calculated? A strong pairing relies on compatible families (up to 35 pts), contrasting sillage so they don't compete (up to 20 pts), and distinct note profiles to create depth (up to 20 pts). The final raw score is scaled to 100%.</div>

      <div class="dc-note">
        <div class="dc-nt" style="width: 48px; text-align: right;">${Math.round(famScore)}/35</div>
        <div class="dc-nv" style="flex-direction: column; gap: 0;">
          <div class="dc-slbl" style="color: var(--ink);">Family Compatibility</div>
        </div>
      </div>

      <div class="dc-note">
        <div class="dc-nt" style="width: 48px; text-align: right;">${Math.round(sillScore)}/20</div>
        <div class="dc-nv" style="flex-direction: column; gap: 0;">
          <div class="dc-slbl" style="color: var(--ink);">Sillage Contrast</div>
        </div>
      </div>

      <div class="dc-note">
        <div class="dc-nt" style="width: 48px; text-align: right;">${Math.round(noteScore)}/20</div>
        <div class="dc-nv" style="flex-direction: column; gap: 0;">
          <div class="dc-slbl" style="color: var(--ink);">Note Independence</div>
        </div>
      </div>

      <div class="dc-note" style="border-top: 1px solid var(--border-strong); border-bottom: none; margin-top: var(--sp-sm); padding-top: var(--sp-sm);">
        <div class="dc-nt" style="width: 48px; text-align: right; color: var(--ink); font-size: var(--fs-body);">${Math.round(rawScore)}/75</div>
        <div class="dc-nv" style="flex-direction: column; gap: 0;">
          <div class="dc-slbl" style="color: var(--ink); font-weight: 700; font-size: var(--fs-body);">Raw Score</div>
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

function renderCompareResults(fa,fb){
  const res=document.getElementById('cmp-results');
  if(!res)return;
  window.haptic?.('success');
  const ca=getCmpFam(fa.family),cb=getCmpFam(fb.family);
  const famLabelA=(FAM[fa.family]||{label:fa.family}).label;
  const famLabelB=(FAM[fb.family]||{label:fb.family}).label;
  const matchPct=Math.round(scoreSimilarity(fa,fb));
  const layerPct=scoreLayeringPct(fa,fb);
  const verdict=getVerdict(matchPct,layerPct,fa,fb);
  const matchColor=matchPct>=60?ca.accent:matchPct>=30?'var(--g700)':'var(--g500)';
  const layerColor=layerPct>=60?cb.accent:layerPct>=30?'var(--g700)':'var(--g500)';

  const famComp=FAM_COMPAT[fa.family]?.[fb.family]??0.5;
  const famScore=famComp*35;
  const sillDiff=Math.abs(fa.sillage-fb.sillage);
  const sillScore=sillDiff>=3?20:sillDiff>=1?10:0;
  const shared=fa._nAll.filter(n=>fb._nAll.includes(n)).length;
  const noteScore=shared===0?20:shared<=2?12:shared<=4?5:0;
  const rawScore = famScore + sillScore + noteScore;

  // Update permanent header cards
  _fillCard('a',fa);_fillCard('b',fb);

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

    <div class="cmp-pair-card">
      <button class="cmp-pair-card-left" id="cmp-score-character">
        <div class="cmp-pair-card-radar">${drawCombinedRadarSvg(fa,fb,ca.accent,cb.accent)}</div>
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
            <div class="cmp-edu-math" style="margin-top:var(--sp-sm); padding-top:var(--sp-sm); border-top:1px dashed var(--border-standard); width:100%; display:flex; flex-direction:column; gap:4px; font-family:var(--font-mono); font-size:var(--fs-caption); color:var(--g600);">
              <div style="display:flex; justify-content:space-between;"><span>Fam Compat</span><span>${Math.round(famScore)}/35</span></div>
              <div style="display:flex; justify-content:space-between;"><span>Sillage Contrast</span><span>${Math.round(sillScore)}/20</span></div>
              <div style="display:flex; justify-content:space-between;"><span>Note Independence</span><span>${Math.round(noteScore)}/20</span></div>
              <div style="display:flex; justify-content:space-between; margin-top:2px; font-weight:700; color:var(--text-primary);"><span>Raw Score</span><span>${Math.round(rawScore)}/75</span></div>
            </div>
            <div class="cmp-score-tap" style="margin-top:var(--sp-sm);">Tap to learn more ↗</div>
          </button>
        </div>
      </div>
    </div>

    ${render3x3Notes(fa,fb,ca.accent,cb.accent)}
    ${drawScatterSvg(fa,fb,ca.accent,cb.accent)}
    ${renderSuggestionsV2(fa,fb,ca,cb)}
  `;

  // Wire score taps
  document.getElementById('cmp-score-character')?.addEventListener('click',()=>{
    window.haptic?.('selection');
    openCharacterEdu(fa, fb, ca, cb);
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
    el.addEventListener('click',()=>_openFragPicker(el.dataset.slotSticky,el));
  });

  // Start sticky scroll observer
  _initStickyScroll();

  // Initialize chart haptics
  setTimeout(() => {
    _setupChartHaptics('.cmp-radar-v2-wrap svg', 'circle');
    _setupChartHaptics('.cmp-scatter-v2-wrap svg', 'circle');
  }, 100);
}

/* ── Fragrance picker — dual-column drum rolodex ── */
let _pickerSlot=null;
let _pickerSort='brand'; // 'brand' | 'name' | 'family'
const PICKER_ITEM_H=48; // must match CSS --picker-item-h

function _openFragPicker(slot){
  window.haptic?.('light');
  _pickerSlot=slot;
  // Each column has its own search; render each with its own current query
  ['a','b'].forEach(s=>{
    const q=document.getElementById(`frag-picker-search-${s}`)?.value.trim()||'';
    _renderPickerList(q,s);
  });
  // Highlight the initiating column
  document.getElementById('frag-picker-col-a')?.classList.toggle('active',slot==='a');
  document.getElementById('frag-picker-col-b')?.classList.toggle('active',slot==='b');
  // Position wrap below the header on desktop; use sticky bar if header is scrolled off screen
  const overlay=document.getElementById('frag-picker');
  const wrap=overlay?.querySelector('.frag-picker-wrap');
  if(wrap&&window.innerWidth>=768){
    const header=document.getElementById('cmp-header');
    const stickyBar=document.getElementById('cmp-sticky-bar');
    const headerRect=header?.getBoundingClientRect();
    const anchor=(headerRect&&headerRect.bottom>0)?header:stickyBar;
    if(anchor){
      const r=anchor.getBoundingClientRect();
      wrap.style.top=(r.bottom+6)+'px';
      wrap.style.left=r.left+'px';
      wrap.style.width=r.width+'px';
      wrap.style.right='auto';
    }
  }
  overlay?.classList.add('open');
  requestAnimationFrame(()=>_updatePickerSort());
  // Focus the search input for the initiating slot
  setTimeout(()=>document.getElementById(`frag-picker-search-${slot}`)?.focus(),120);
}

function _closeFragPicker(){
  window.haptic?.('light');
  document.getElementById('frag-picker')?.classList.remove('open');
  _pickerSlot=null;
}

/* Re-render both columns keeping each slot's own search query (used after sort change) */
function _renderPickerLists(){
  ['a','b'].forEach(s=>{
    const q=document.getElementById(`frag-picker-search-${s}`)?.value.trim()||'';
    _renderPickerList(q,s);
  });
}

function _renderPickerList(q,slot){
  const list=document.getElementById(`frag-picker-list-${slot}`);
  if(!list)return;
  const lower=q.toLowerCase();
  let frags=q.length<1?[...CAT]:CAT.filter(f=>{
    return f._nameL.includes(lower)||
      f._brandL.includes(lower)||
      f._nAll.some(n=>n.includes(lower));
  });
  if(_pickerSort==='name'){
    frags.sort((a,b)=>a.name.localeCompare(b.name));
  } else if(_pickerSort==='family'){
    frags.sort((a,b)=>a.family.localeCompare(b.family)||a.name.localeCompare(b.name));
  } else {
    frags.sort((a,b)=>a.brand.localeCompare(b.brand)||a.name.localeCompare(b.name));
  }
  const curFrag=slot==='a'?CMP_A:CMP_B;
  const otherFrag=slot==='a'?CMP_B:CMP_A;
  // Suppress scroll events (and haptic) triggered by innerHTML reset / scrollTop change
  list.dataset.scrolling='1';
  list.innerHTML=frags.map(f=>{
    const fc=getCmpFam(f.family);
    const isOther=otherFrag&&otherFrag.id===f.id;
    let sub;
    if(_pickerSort==='name') sub=`${f.brand} · ${(FAM[f.family]||{}).label||f.family}`;
    else if(_pickerSort==='family') sub=f.brand;
    else sub=f.brand;
    return`<div class="frag-picker-item${isOther?' other-sel':''}" data-id="${f.id}" role="option" aria-selected="false">
      <div class="frag-picker-dot" style="background:${fc.accent}"></div>
      <div class="frag-picker-item-text">
        <div class="frag-picker-item-name">${f.name}</div>
        <div class="frag-picker-item-brand">${sub}</div>
      </div>
    </div>`;
  }).join('');
  // Tapping an item smooth-scrolls it to center — scroll handler finalises selection
  list.querySelectorAll('.frag-picker-item').forEach((item,i)=>{
    item.addEventListener('click',()=>{
      list.scrollTo({top:i*PICKER_ITEM_H,behavior:'smooth'});
    });
  });
  // Scroll to current selection, or top; mark the centered item immediately
  requestAnimationFrame(()=>{
    const items=Array.from(list.querySelectorAll('.frag-picker-item'));
    let targetIdx=0;
    if(curFrag){
      const found=items.findIndex(it=>it.dataset.id===curFrag.id);
      if(found>=0)targetIdx=found;
    }
    list.scrollTop=targetIdx*PICKER_ITEM_H;
    items.forEach((it,i)=>it.classList.toggle('centered',i===targetIdx));
    // Keep flag set until after scroll events settle
    setTimeout(()=>{ delete list.dataset.scrolling; },150);
  });
}

/* Per-list drum scroll: auto-selects the centered item, fires haptic per tick */
function _initPickerDrumScroll(listEl,slot){
  let _lastIdx=-1,_snapTimer=null;
  let lastScrollTop = 0, lastScrollTime = 0;
  listEl.addEventListener('scroll',()=>{
    const items=Array.from(listEl.querySelectorAll('.frag-picker-item'));
    if(!items.length)return;
    const idx=Math.max(0,Math.min(Math.round(listEl.scrollTop/PICKER_ITEM_H),items.length-1));
    // Always update visual centering
    items.forEach((it,i)=>it.classList.toggle('centered',i===idx));
    // Haptic + selection only on user-initiated scrolls
    if(listEl.dataset.scrolling)return;

    // Calculate velocity for dynamic haptics
    const now = Date.now();
    const dt = now - lastScrollTime;
    const dy = Math.abs(listEl.scrollTop - lastScrollTop);
    const velocity = dt > 0 ? dy / dt : 0;
    lastScrollTop = listEl.scrollTop;
    lastScrollTime = now;

    if(idx!==_lastIdx){
      _lastIdx=idx;
      if (velocity > 1.5) {
        window.haptic?.('light'); // Fast scroll -> light ticks
      } else {
        window.haptic?.('selection'); // Slow scroll -> heavier clicks
      }
    }
    clearTimeout(_snapTimer);
    _snapTimer=setTimeout(()=>{
      const f=items[idx]?CAT_MAP[items[idx].dataset.id]:null;
      const curFrag=slot==='a'?CMP_A:CMP_B;
      if(f&&f.id!==curFrag?.id){
        _selectFragForSlot(slot,f);
        _updateOtherSelMarking(slot);
      }
    },180);
  },{passive:true});
}

/* Lightweight: update only the other-sel class on the opposite list */
function _updateOtherSelMarking(slot){
  const newFrag=slot==='a'?CMP_A:CMP_B;
  const otherList=document.getElementById(`frag-picker-list-${slot==='a'?'b':'a'}`);
  if(!otherList)return;
  otherList.querySelectorAll('.frag-picker-item').forEach(it=>{
    it.classList.toggle('other-sel',!!(newFrag&&it.dataset.id===newFrag.id));
  });
}

/* Sort bar buttons + horizontal swipe to cycle sort modes */
function _initPickerSortSwipe(){
  const sorts=['brand','name','family'];
  document.querySelectorAll('.frag-picker-sort-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      _pickerSort=btn.dataset.sort;
      window.haptic?.('selection');
      _updatePickerSort();
      _renderPickerLists();
    });
  });
  const cols=document.getElementById('frag-picker-cols');
  if(!cols)return;
  let _sx=0,_sy=0;
  cols.addEventListener('touchstart',e=>{
    _sx=e.touches[0].clientX;
    _sy=e.touches[0].clientY;
  },{passive:true});
  cols.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-_sx;
    const dy=e.changedTouches[0].clientY-_sy;
    if(Math.abs(dx)>44&&Math.abs(dy)<36){
      const idx=sorts.indexOf(_pickerSort);
      _pickerSort=dx<0
        ?sorts[(idx+1)%sorts.length]
        :sorts[(idx-1+sorts.length)%sorts.length];
      window.haptic?.('medium');
      _updatePickerSort();
      _renderPickerLists();
    }
  },{passive:true});
}

/* Slide the sort pill to the active button */
function _updatePickerSort(){
  const bar=document.getElementById('frag-picker-sort-bar');
  const pill=document.getElementById('frag-picker-sort-pill');
  if(!bar||!pill)return;
  document.querySelectorAll('.frag-picker-sort-btn').forEach(btn=>{
    const active=btn.dataset.sort===_pickerSort;
    btn.classList.toggle('active',active);
    btn.setAttribute('aria-pressed',active?'true':'false');
    if(active){
      const r=btn.getBoundingClientRect();
      const barR=bar.getBoundingClientRect();
      pill.style.left=(r.left-barR.left)+'px';
      pill.style.width=r.width+'px';
    }
  });
}

/* Arrow keys scroll the drum; Escape closes */
function _initPickerKeyNav(listEl,slot){
  listEl.addEventListener('keydown',e=>{
    const items=Array.from(listEl.querySelectorAll('.frag-picker-item'));
    if(!items.length)return;
    const curIdx=Math.max(0,Math.min(Math.round(listEl.scrollTop/PICKER_ITEM_H),items.length-1));
    if(e.key==='ArrowDown'){
      e.preventDefault();
      listEl.scrollTo({top:Math.min(curIdx+1,items.length-1)*PICKER_ITEM_H,behavior:'smooth'});
    } else if(e.key==='ArrowUp'){
      e.preventDefault();
      listEl.scrollTo({top:Math.max(curIdx-1,0)*PICKER_ITEM_H,behavior:'smooth'});
    } else if(e.key==='Enter'){
      e.preventDefault();
      const f=items[curIdx]?CAT_MAP[items[curIdx].dataset.id]:null;
      if(f){
        _selectFragForSlot(slot,f);
        _updateOtherSelMarking(slot);
      }
      _closeFragPicker();
    } else if(e.key==='Escape'){
      e.preventDefault();
      _closeFragPicker();
    }
  });
}

function _selectFragForSlot(slot,frag){
  if(slot==='a')CMP_A=frag;else CMP_B=frag;
  _fillCard(slot,frag);
  // Note: click/keydown listeners on cards are wired once in initCompare(); do not add here to avoid accumulation
  if(CMP_A&&CMP_B)renderCompareResults(CMP_A,CMP_B);
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
      card.addEventListener('click',()=>_openFragPicker(slot));
      card.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){
          e.preventDefault();
          _openFragPicker(slot);
        }
      });
    }
    const search=document.getElementById(`frag-picker-search-${slot}`);
    if(search)search.addEventListener('input',()=>_renderPickerList(search.value.trim(),slot));
    const list=document.getElementById(`frag-picker-list-${slot}`);
    if(list){
      _initPickerKeyNav(list,slot);
      _initPickerDrumScroll(list,slot);
    }
  });
  const closeBtn=document.getElementById('frag-picker-close');
  if(closeBtn)closeBtn.addEventListener('click',_closeFragPicker);
  const overlay=document.getElementById('frag-picker');
  if(overlay)overlay.addEventListener('click',e=>{if(e.target===overlay)_closeFragPicker();});
  _initPickerSortSwipe();
  _setupDragAndDropDropzones();
}
window.clearCmpSlot=function(slot){
  window.haptic?.('nudge')||window.haptic?.('selection');
  if(slot==='a')CMP_A=null;else CMP_B=null;
  _resetCard(slot);
  const res=document.getElementById('cmp-results');
  if(res)res.innerHTML='';
  if(window._cmpStickyObs)window._cmpStickyObs.disconnect();
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

// Global Escape key handler — closes topmost open modal/overlay
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape')return;
  // Score edu overlay (highest z-index)
  const edu=document.getElementById('cmp-edu-overlay');
  if(edu&&edu.classList.contains('open')){closeScoreEdu();return;}
  // Fragrance picker
  const picker=document.getElementById('frag-picker');
  if(picker&&picker.classList.contains('open')){_closeFragPicker();_returnFocus();return;}
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
// Load data from JSON files
const _nc={cache:'no-store'};
Promise.all([
  fetch('data/roles.json',_nc).then(r=>r.json()),
  fetch('data/scents-index.json',_nc).then(r=>r.json()).then(idx=>
    Promise.all(idx.brands.map(b=>fetch(`data/scents/${b}.json`,_nc).then(r=>r.json())))
      .then(arrays=>arrays.flat())
  ),
  fetch('data/notes.json',_nc).then(r=>r.json()),
  fetch('data/brands.json',_nc).then(r=>r.json())
]).then(([roles, scents, notes, brands])=>{
  // Hide loading overlay
  const loadingEl=document.getElementById('app-loading');
  if(loadingEl){loadingEl.style.opacity='0';setTimeout(()=>loadingEl.hidden=true,250);}
  ROLES=roles;
  CAT=scents.map(f=>{
    f._nTop=(f.top||[]).map(n=>n.toLowerCase().trim());
    f._nMid=(f.mid||[]).map(n=>n.toLowerCase().trim());
    f._nBase=(f.base||[]).map(n=>n.toLowerCase().trim());
    f._nAll=[...f._nTop,...f._nMid,...f._nBase];
    f._nameL=f.name.toLowerCase();
    f._brandL=f.brand.toLowerCase();
    return f;
  });
  NI=notes;
  // Rebuild derived objects
  RM=Object.fromEntries(ROLES.map(r=>[r.id,r]));
  CAT_MAP=Object.fromEntries(CAT.map(f=>[f.id,f]));
  NI_MAP=Object.fromEntries(NI.map(n=>[n.name.toLowerCase(),n]));
  BRANDS=brands;
  BRANDS_MAP=Object.fromEntries(BRANDS.map(b=>[b.name.toLowerCase(),b]));
  // Re-expose populated arrays to window for tests
  window.CAT = CAT; window.CAT_MAP = CAT_MAP; window.NI = NI; window.NI_MAP = NI_MAP;
  window.ROLES = ROLES; window.RM = RM; window.BRANDS = BRANDS; window.BRANDS_MAP = BRANDS_MAP;
  window.computeProfile = computeProfile; window.scoreSimilarity = scoreSimilarity; window.scoreLayeringPair = scoreLayeringPair;

  window.computeNoteTiers = function() {
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
  };

  computeNoteTiers();
  // Now initialize
  buildCatalog();buildNotes();initCatalogControls();initCompare();if(window.renderSaved)window.renderSaved();

  // Init notes search
  const notesSearchEl = document.getElementById('notes-search');
  const notesSearchClearEl = document.getElementById('notes-search-clear');
  if (notesSearchEl) {
    notesSearchEl.addEventListener('input', e => {
      buildNotes(e.target.value, notesTierMode);
      if (notesSearchClearEl) notesSearchClearEl.style.display = notesSearchQuery ? 'block' : 'none';
    });
  }
  if (notesSearchClearEl) {
    notesSearchClearEl.addEventListener('click', () => {
      buildNotes('', notesTierMode);
      if (notesSearchEl) notesSearchEl.value = '';
      notesSearchClearEl.style.display = 'none';
    });
  }

  // Init notes tier bar
  const notesTierBar = document.getElementById('notes-tier-bar');
  if (notesTierBar) {
    const tabs = notesTierBar.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        buildNotes(notesSearchQuery, tab.dataset.tier);
      });
    });
  }
  // Pre-fill a high-layering pair so compare isn't blank on load
  // Deferred to idle to avoid blocking the main thread on first paint
  const _doPreFill = () => {
    const sample=CAT.slice(0,40);
    let bestScore=-1,bestA=null,bestB=null;
    for(let i=0;i<sample.length;i++){
      for(let j=i+1;j<sample.length;j++){
        const s=scoreLayeringPair(sample[i],sample[j]);
        if(s>bestScore){bestScore=s;bestA=sample[i];bestB=sample[j];}
      }
    }
    if(bestA&&bestB){_selectFragForSlot('a',bestA);_selectFragForSlot('b',bestB);}
  };
  if(typeof requestIdleCallback==='function'){
    requestIdleCallback(_doPreFill, {timeout:2000});
  } else {
    setTimeout(_doPreFill, 0);
  }

  // Read hash for deep-linking from landing page
  const hash = window.location.hash.replace('#', '');
  if (hash === 'notes') {
    go('notes', document.querySelector('.nav-notes-btn[onclick*="notes"]'));
  } else if (hash === 'catalog') {
    go('catalog', null); // Mobile button will be updated if below
  } else if (hash === 'saved') {
    go('saved', document.querySelector('.nav-notes-btn[onclick*="saved"]'));
  } else if (hash.startsWith('search=')) {
    const query = decodeURIComponent(hash.split('=')[1]);
    go('catalog', null);
    const searchInput = document.getElementById('cat-search');
    if (searchInput) {
      searchInput.value = query;
      searchInput.dispatchEvent(new Event('input'));
    }
  } else {
    // MVP: default to compare
    go('compare', document.querySelector('.mbn-btn[onclick*="compare"]'));
  }

  // Global horizontal swipe between main tabs
  let globalSx = 0, globalSy = 0;
  document.body.addEventListener('touchstart', e => {
    // Don't intercept if an overlay/sheet is open
    if(document.getElementById('sheet-stack')?.classList.contains('has-sheets') ||
       document.getElementById('col-detail')?.classList.contains('open') ||
       document.getElementById('frag-picker')?.classList.contains('open') ||
       document.getElementById('note-float-overlay')?.classList.contains('open') ||
       document.getElementById('quick-peek-overlay')?.classList.contains('open')) return;

    // Don't intercept if swiping horizontally inside a carousel
    if(e.target.closest('.carousel') || e.target.closest('.scent-row-content')) return;

    globalSx = e.touches[0].clientX;
    globalSy = e.touches[0].clientY;
  }, {passive:true});

  document.body.addEventListener('touchend', e => {
    if(globalSx === 0) return;
    const dx = e.changedTouches[0].clientX - globalSx;
    const dy = e.changedTouches[0].clientY - globalSy;
    globalSx = 0; globalSy = 0;

    if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 80) {
      // Horizontal swipe detected
      const tabs = ['catalog', 'compare'];
      const currentTab = document.querySelector('.panel.active')?.id.replace('p-', '');
      const idx = tabs.indexOf(currentTab);
      if(idx === -1) return;

      if(dx < 0 && idx < tabs.length - 1) { // Swipe left -> go right
        window.haptic?.('selection');
        goMobile(tabs[idx + 1], document.querySelector(`.mbn-btn[onclick*="${tabs[idx + 1]}"]`));
      } else if(dx > 0 && idx > 0) { // Swipe right -> go left
        window.haptic?.('selection');
        goMobile(tabs[idx - 1], document.querySelector(`.mbn-btn[onclick*="${tabs[idx - 1]}"]`));
      }
    }
  }, {passive:true});
}).catch(err=>{
  console.error('Scentmap data load failed:', err);
  const loadingEl=document.getElementById('app-loading');
  if(loadingEl)loadingEl.hidden=true;
  const errorEl=document.getElementById('app-error');
  if(errorEl)errorEl.hidden=false;
});

// Load and render changelog
fetch('CHANGELOG.md').then(r=>r.text()).then(md=>{
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
