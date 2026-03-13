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

/* State */
const ST={};
function gst(id){return ST[id]||'none'}
function setState(id,s){ST[id]=s}
function isOwned(id){return gst(id)==='owned'}
function isWish(id){return gst(id)==='wish'}
function cycleState(id){const c=gst(id);setState(id,c==='none'?'wish':c==='wish'?'owned':'none')}

/* Similarity scoring: 0–100 across family, notes, sillage, roles */
function scoreSimilarity(a,b){
  if(a.id===b.id)return 0;
  const famScore=(FAM_COMPAT[a.family]?.[b.family]??0.5)*40;
  const shBase=a._nBase.filter(n=>b._nBase.includes(n)).length;
  const shMid=a._nMid.filter(n=>b._nMid.includes(n)).length;
  const shTop=a._nTop.filter(n=>b._nTop.includes(n)).length;
  const noteScore=Math.min(30,shBase*5+shMid*3+shTop*2);
  const sillDiff=Math.abs(a.sillage-b.sillage);
  const sillScore=sillDiff<=2?10:sillDiff<=4?5:0;
  const shRoles=a.roles.filter(r=>b.roles.includes(r)).length;
  const roleScore=Math.min(20,shRoles*7);
  return Math.round(famScore+noteScore+sillScore+roleScore);
}

/* Layering compatibility score: higher = better layering pair (different sillage + complementary families + unique notes) */
function scoreLayeringPair(a,b){
  const famComp=FAM_COMPAT[a.family]?.[b.family]??0.5;
  const famScore=famComp*35;
  const sillDiff=Math.abs(a.sillage-b.sillage);
  const sillScore=sillDiff>=3?20:sillDiff>=1?10:0;
  const shared=a._nAll.filter(n=>b._nAll.includes(n)).length;
  const noteScore=shared===0?20:shared<=2?12:shared<=4?5:0;
  return Math.round(famScore+sillScore+noteScore);
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
}
function pushDesktopDetail(renderFn){
  detailStack.push(renderFn);
  _renderDeskDetail(true);
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
  detailStack.length=0;
  document.getElementById('col-detail').classList.remove('open');
  document.getElementById('detail-scrim').classList.remove('open');
}
function popDesktopDetail(){
  if(detailStack.length<=1){closeDesktopDetail();return}
  detailStack.pop();_renderDeskDetail();
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
  handle.addEventListener('touchstart',e=>{
    ds=e.touches[0].clientY;
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
    el.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    // Allow momentum dismissal
    if(dy>80 || (e.changedTouches[0].clientY > ds + 20 && e.changedTouches[0].clientY - ds > (Date.now() - (e.changedTouches[0].timeStamp || Date.now())) * 0.5)) {
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
}
function closeAllSheets(){
  const all=[...sheetStack];sheetStack.length=0;
  all.forEach(s=>{
    s.style.transform='translateY(100%)';
    s.classList.remove('visible');
    s.classList.remove('under');
    s.addEventListener('transitionend',()=>s.remove(),{once:true});
  });
  document.getElementById('sheet-stack').classList.remove('has-sheets');
  unlockBodyScroll();
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
    return note?`<button class="note-link" data-note="${n}">${n}</button>`:n;
  }).join(', ');
}

function renderFragDetail(container,frag){
  const fm=FAM[frag.family]||{label:frag.family,color:'#888'};

  container.innerHTML=`

    <div class="dc-name">${frag.name}</div>
    <button class="dc-brand-btn">${frag.brand}</button>
    <div class="dc-ftag" style="background:${fm.color}">
      <span style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.3);display:inline-block;flex-shrink:0"></span>
      ${fm.label}
    </div>
    <div class="dc-collect-row" id="dc-collect-${frag.id}"></div>
    ${frag.description?`<div class="dc-description">${frag.description}</div>`:''}
    <div class="dc-cmp-cta-label">Compare with</div>
    <div class="dc-cmp-ctas" id="dc-ctas-${frag.id}"></div>
    <div class="dc-stats">
      <div class="dc-stat"><div class="dc-slbl">Sillage</div><div class="dc-bar"><div class="dc-fill" style="width:${frag.sillage*10}%"></div></div><div class="dc-sval">${SW[frag.sillage]}</div></div>
      <div class="dc-stat"><div class="dc-slbl">Structure</div><div class="dc-bar"><div class="dc-fill" style="width:${frag.layering*10}%"></div></div><div class="dc-sval">${LW[frag.layering]}</div></div>
    </div>
    <div class="dc-div"></div>
    <div class="dc-nlbl">Notes</div>
    <div class="dc-note"><span class="dc-nt">Top</span><span class="dc-nv">${linkNotes(frag.top)}</span></div>
    <div class="dc-note"><span class="dc-nt">Mid</span><span class="dc-nv">${linkNotes(frag.mid)}</span></div>
    <div class="dc-note"><span class="dc-nt">Base</span><span class="dc-nv">${linkNotes(frag.base)}</span></div>
    <p class="dc-notes-caveat">Key materials only — simplified pyramid</p>`;

  // Note links
  const brandBtn=container.querySelector('.dc-brand-btn');
  if(brandBtn)brandBtn.addEventListener('click',e=>{e.stopPropagation();openHouseDetail(frag.brand);});
  container.querySelectorAll('.note-link').forEach(btn=>{
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
      const reason=getSwapReason(frag,f);
      const badge=classifyDiscovery(frag,f);
      const row=document.createElement('button');row.className='dc-sim-row';
      const namePart=reason
        ?`<span class="dc-sim-name">${f.name}<span class="dc-sim-name-brand dc-sim-brand-btn"> · ${f.brand}</span></span><span class="dc-sim-reason">${reason}</span>`
        :`<span class="dc-sim-name">${f.name}</span><span class="dc-sim-brand dc-sim-brand-btn">${f.brand}</span>`;
      row.innerHTML=`<span class="dc-sim-dot" style="background:${fm2.color}"></span>
        <span class="dc-sim-info">${namePart}</span>
        ${badge?`<span class="dc-badge ${badge.type}">${badge.label}</span>`:''}`;
      row.addEventListener('click',e=>{e.stopPropagation();pushDetail(c=>renderFragDetail(c,f),f.name);});
      shelf.appendChild(row);
    });
    container.appendChild(shelf);
  }
  container.querySelectorAll('.dc-sim-brand-btn').forEach(btn => {
    btn.addEventListener('click',e=>{e.stopPropagation();openHouseDetail(btn.textContent.replace(' · ','').trim());});
  });
}

/* ── Compare CTAs in detail panel ── */
function _buildCompareCTAs(frag,container){
  if(!container)return;
  function makeBtn(existingFrag,targetSlot){
    const fcSelf=getCmpFam(frag.family);
    const fcOther=existingFrag?getCmpFam(existingFrag.family):null;
    const btn=document.createElement('button');
    btn.className='dc-cmp-btn';
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
      <span class="dc-cmp-btn-arrow">→</span>`;
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
    const row=document.createElement('button');row.className='dc-sim-row';
    const namePart=reason
      ?`<span class="dc-sim-name">${f.name}<span class="dc-sim-name-brand dc-sim-brand-btn"> · ${f.brand}</span></span><span class="dc-sim-reason">${reason}</span>`
      :`<span class="dc-sim-name">${f.name}</span><span class="dc-sim-brand dc-sim-brand-btn">${f.brand}</span>`;
    row.innerHTML=`<span class="dc-sim-dot" style="background:${fm2.color}"></span>
      <span class="dc-sim-info">${namePart}</span>
      <span class="dc-layer-score-badge">${score}</span>
      <span class="dc-sim-state is-owned">Owned</span>`;
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
    chip.className='dc-role-chip'+(isPrimary?' assigned-primary':isSecondary?' assigned-secondary':'');
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

function renderNoteDetail(container,note){
  const fm=FAM[note.family]||{label:note.family,color:'#888'};
  const nl=note.name.toLowerCase();
  const inf=CAT.filter(f=>f._nAll.includes(nl));
  container.innerHTML=`
    <div class="np-name">${note.name}</div>
    <div class="np-family">${fm.label}</div>
    <div class="np-desc">${note.desc}</div>
    ${note.extraction_method?`<div style="margin-top:10px; font-size:12px; color:var(--g500);"><strong>Extraction:</strong> ${note.extraction_method}</div>`:''}
    ${note.insider_fact?`<div style="margin-top:8px; padding:10px; background:var(--g50); border-radius:6px; font-size:12px; color:var(--g600); border:1px solid var(--g200);"><strong style="display:block; margin-bottom:4px; color:var(--g900);">Perfumer's Insight</strong>${note.insider_fact}</div>`:''}
    ${inf.length?`<div class="np-frags" style="margin-top:14px"><div class="dc-nlbl" style="margin:0 0 6px">In catalog (${inf.length})</div><div id="_nfl" style="border:1px solid var(--g200);border-radius:8px;overflow:hidden"></div></div>`:''}`;
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

  container.innerHTML=`<div class="house-detail-wrap">
    <div class="house-detail-name">${brand}</div>
    ${houseData && houseData.desc ? `<div class="dc-description" style="margin-top:var(--sp-sm);">${houseData.desc}</div>` : ''}

    <div style="margin:var(--sp-xl) 0;">
      <div class="dc-slbl">Fragrance Families</div>
      <div style="height:var(--sp-sm); width:100%; display:flex; border-radius:var(--radius); overflow:hidden; margin-bottom:var(--sp-sm);">${barHTML}</div>
      <div style="display:flex; flex-wrap:wrap;">${legendHTML}</div>
    </div>

    <div class="house-detail-count">${frags.length} fragrance${frags.length!==1?'s':''}</div>
    <div class="house-detail-list" id="house-list-${brand.replace(/\s+/g,'-')}"></div>
  </div>`;
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
}
function openHouseDetail(brand){openDetail(c=>renderHouseDetail(c,brand),brand)}

function refreshAfterStateChange(id){
  const row=document.querySelector(`.scent-row[data-id="${id}"]`);
  if(row){const f=CAT_MAP[id];renderCatRow(row,f,FAM[f.family]||{color:'#888'})}
  const brands=[...new Set(CAT.map(f=>f.brand))];
  brands.forEach(b=>updBC(b,b.replace(/\s+/g,'-')));
  updCC();
}

/* ══ NOTE FLOAT POPUP (Notes tab) ══════════════════════════════════ */
function openNotePopup(note,triggerEl){
  const fm=FAM[note.family]||{label:note.family,color:'#888'};
  const nl=note.name.toLowerCase();
  const inf=CAT.filter(f=>f._nAll.includes(nl));
  document.getElementById('np-name').textContent=note.name;
  document.getElementById('np-family').textContent=fm.label;
  document.getElementById('np-desc').textContent=note.desc;

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
      const hint=document.createElement('div');hint.style.cssText='font-size:.68rem;color:var(--g400);margin-bottom:10px;line-height:1.5';
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
  const filterBar=document.createElement('div');filterBar.className='cat-filter-bar';
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
    f.name.toLowerCase().includes(search)||
    f.brand.toLowerCase().includes(search)||
    f._nAll.some(n=>n.includes(search))
  );

  if(!visibleCat.length){
    const empty=document.createElement('div');empty.className='cat-empty';
    empty.textContent=search?`No matches for "${search}"`:'No fragrances in this view.';
    body.appendChild(empty);
    updCC();return;
  }

  const brands=[...new Set(visibleCat.map(f=>f.brand))].sort((a,b)=>a.localeCompare(b));
  brands.forEach(brand=>{
    const frags=visibleCat.filter(f=>f.brand===brand).sort((a,b)=>a.name.localeCompare(b.name));
    const key=brand.replace(/\s+/g,'-')+(roleFilter||'');
    const sec=document.createElement('div');sec.className='cat-section';
    sec.innerHTML=`<div class="brand-hdr"><button class="brand-n brand-hdr-btn" data-brand="${brand}">${brand}<span class="brand-total">${frags.length}</span></button><div class="brand-c" id="bc-${key}"></div></div>`;
    // Brand header → house detail
    sec.querySelector('.brand-hdr-btn')?.addEventListener('click',()=>openHouseDetail(brand));
    const list=document.createElement('div');list.className='scent-list';
    const lastTapMap = new Map();
    let longPressTimer = null;
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
        setState(frag.id, st==='wish'?'none':'wish');
        refreshAfterStateChange(frag.id);
        lastTapMap.set(id, 0); // Reset
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
      longPressTimer = setTimeout(()=>{
        window.haptic?.('medium');
        openQuickPeek(frag);
      }, 500); // 500ms long press
    }, {passive:true});

    list.addEventListener('touchmove', e=>{
      if(longPressTimer) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        // Cancel if user moved too far
        if(Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }
    }, {passive:true});

    list.addEventListener('touchend', ()=>{
      if(longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
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

  // Search
  const searchEl=document.getElementById('cat-search');
  const clearBtn=document.getElementById('cat-search-clear');
  searchEl.addEventListener('input',()=>{
    clearBtn.classList.toggle('visible',searchEl.value.length>0);
    buildCatalog();
  });
  clearBtn.addEventListener('click',()=>{
    searchEl.value='';clearBtn.classList.remove('visible');buildCatalog();
  });

  // Mobile filter toggle
  const toggleBtn=document.getElementById('frag-filter-toggle');
  const mobilePanel=document.getElementById('frag-mobile-panel');
  if(toggleBtn&&mobilePanel){
    toggleBtn.addEventListener('click',()=>mobilePanel.classList.toggle('open'));
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
function buildNotes(){
  const body=document.getElementById('notes-body');body.innerHTML='';

  const grid = document.createElement('div');
  grid.className = 'notes-grid';

  const grouped={};
  NI.forEach(n=>{if(!grouped[n.family])grouped[n.family]=[];grouped[n.family].push(n)});
  Object.values(grouped).forEach(arr=>arr.sort((a,b)=>a.name.localeCompare(b.name)));

  FAM_ORDER.forEach(fk=>{
    if(!grouped[fk]?.length)return;
    const fm=FAM[fk];if(!fm)return;

    const card=document.createElement('div');card.className='notes-card';

    const header=document.createElement('div');header.className='notes-card-header';
    header.innerHTML=`<div class="nf-dot" style="background:${fm.color}"></div><div><div class="nf-name">${fm.label}</div>${fm.desc?`<div class="nf-desc">${fm.desc}</div>`:''}</div>`;

    const cardBody=document.createElement('div');cardBody.className='notes-card-body';
    grouped[fk].forEach(note=>{
      const btn=document.createElement('button');btn.className='note-pill';btn.textContent=note.name;
      btn.addEventListener('click',e=>{e.stopPropagation();openDetail(c=>renderNoteDetail(c,note),note.name)});
      cardBody.appendChild(btn);
    });

    card.appendChild(header);
    card.appendChild(cardBody);
    grid.appendChild(card);
  });

  body.appendChild(grid);
  document.getElementById('notes-count').textContent=`${NI.length} notes`;
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
      <div class="dc-ftag" style="background:${fm.color}">
        <span style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.3);display:inline-block;flex-shrink:0"></span>
        ${fm.label}
      </div>
      <div class="dc-nlbl" style="margin-top:0">Notes</div>
      <div class="dc-note"><span class="dc-nt">Top</span><span class="dc-nv">${frag.top.join(', ')}</span></div>
      <div class="dc-note"><span class="dc-nt">Mid</span><span class="dc-nv">${frag.mid.join(', ')}</span></div>
      <div class="dc-note"><span class="dc-nt">Base</span><span class="dc-nv">${frag.base.join(', ')}</span></div>
      <div style="display:flex;gap:10px;margin-top:24px">
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
    {id:'changelog',icon:'↩', label:'Changelog'},
  ];
  pushSheet(el=>{
    el.innerHTML=`<div style="padding:16px 0 8px">
      <div style="font-size:.65rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--g500);padding:0 16px 10px">More</div>
      ${items.map(it=>`
        <button onclick="closeAllSheets();goMobile('${it.id}',document.querySelector('.mbn-more'))" style="display:flex;align-items:center;gap:14px;width:100%;background:none;border:none;padding:14px 16px;cursor:pointer;font-family:inherit;font-size:.88rem;color:var(--black);border-bottom:1px solid var(--g200);text-align:left">
          <span style="font-size:1.2rem;width:24px;text-align:center;flex-shrink:0">${it.icon}</span>
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
  const b=FAM_PROFILE_BASE[frag.family]||[0.5,0.5,0.5];
  // Collect notes with tier weights: top=0.5, mid=1.0, base=1.5
  const weighted=[
    ...(frag._nTop||[]).map(n=>({n,w:0.5})),
    ...(frag._nMid||[]).map(n=>({n,w:1.0})),
    ...(frag._nBase||[]).map(n=>({n,w:1.5})),
  ].filter(({n})=>NOTE_PROFILE[n]);
  if(weighted.length===0){
    return{freshness:b[0],sweetness:b[1],warmth:b[2],intensity:(frag.sillage||5)/10,complexity:(frag.layering||5)/10};
  }
  const totalW=weighted.reduce((s,{w})=>s+w,0);
  const avg=weighted.reduce((acc,{n,w})=>{const p=NOTE_PROFILE[n];acc[0]+=p[0]*w;acc[1]+=p[1]*w;acc[2]+=p[2]*w;return acc;},[0,0,0]).map(v=>v/totalW);
  // 60% note-derived, 40% family anchor
  return{
    freshness:avg[0]*0.6+b[0]*0.4,
    sweetness:avg[1]*0.6+b[1]*0.4,
    warmth:   avg[2]*0.6+b[2]*0.4,
    intensity:(frag.sillage||5)/10,
    complexity:(frag.layering||5)/10,
  };
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
    <div class="cmp-radar-v2-wrap"><svg viewBox="-18 -8 256 246" xmlns="http://www.w3.org/2000/svg">
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
    <div class="cmp-scatter-v2-wrap"><svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
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
    return ni?`<button class="${cls}" data-note="${cap(n)}">${cap(n)}</button>`
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
    return`<button class="cmp-sug-card-v2" data-fid="${frag.id}">
      <div class="cmp-sug-mini-radar">${_miniRadarSvg(frag,fc.accent)}</div>
      <div class="cmp-sug-card-info">
        <div class="cmp-sug-card-name">${frag.name}</div>
        <div class="cmp-sug-card-brand">${frag.brand}</div>
        <div class="cmp-sug-card-reason">${reason}</div>
        <div class="cmp-sug-card-fam">${famLabel}</div>
        ${topNotes?`<div class="cmp-sug-card-notes">${topNotes}</div>`:''}
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
  overlay.innerHTML=`<div class="cmp-edu-wrap">
    <div class="cmp-edu-header">
      <div class="cmp-edu-header-left">
        <div class="cmp-edu-label">${label}</div>
        <div class="cmp-edu-num">${pct}%</div>
      </div>
      <button class="cmp-edu-close" id="cmp-edu-close">✕ Close</button>
    </div>
    <div class="cmp-edu-body">
      <div class="cmp-edu-intro">How is this score calculated, and what does it mean for this pair?</div>
      <div class="cmp-edu-grid">
        ${quads.map(q=>`<div class="cmp-edu-quad${q.hi?' highlight':''}"><div class="cmp-edu-quad-tag">${q.tag}</div><div class="cmp-edu-quad-title">${q.title}</div><div class="cmp-edu-quad-desc">${q.desc}</div></div>`).join('')}
      </div>
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
            <div class="cmp-score-tap">Tap to learn more ↗</div>
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
  res.querySelectorAll('.cmp-sug-card-v2').forEach(card=>{
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
    return f.name.toLowerCase().includes(lower)||
      f.brand.toLowerCase().includes(lower)||
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
    } else if(e.key==='Escape'){
      e.preventDefault();
      _closeFragPicker();
    }
  });
}

function _selectFragForSlot(slot,frag){
  if(slot==='a')CMP_A=frag;else CMP_B=frag;
  _fillCard(slot,frag);
  const card=document.getElementById(`cmp-card-${slot}`);
  if(card)card.addEventListener('click',()=>_openFragPicker(slot));
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
    <div class="cmp-frag-card-fam" style="background:${fc.accent}">
      <span class="cmp-frag-card-dot" aria-hidden="true"></span>${famLabel}
    </div>
    <div class="cmp-frag-card-name">${frag.name}</div>
    <button class="cmp-frag-card-brand cmp-brand-btn">${frag.brand}</button>
    ${frag.description?`<div class="cmp-frag-card-desc">${frag.description}</div>`:''}
    <button class="cmp-card-detail-btn" data-slot="${slot}" aria-label="View details for ${frag.name}">Details ↗</button>
    <span class="cmp-card-chevron" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
  card.querySelector('.cmp-card-detail-btn')?.addEventListener('click',e=>{e.stopPropagation();openFragDetail(frag);});
  card.querySelector('.cmp-brand-btn')?.addEventListener('click',e=>{e.stopPropagation();openHouseDetail(frag.brand);});
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
    if(card)card.addEventListener('click',()=>_openFragPicker(slot));
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
let _lastFocusedEl=null;

function _trapFocus(el){
  const focusable=el.querySelectorAll('button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
  if(!focusable.length)return;
  _lastFocusedEl=document.activeElement;
  focusable[0].focus();
}
function _returnFocus(){
  if(_lastFocusedEl&&typeof _lastFocusedEl.focus==='function'){
    _lastFocusedEl.focus();
    _lastFocusedEl=null;
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
  ROLES=roles;
  CAT=scents.map(f=>{
    f._nTop=(f.top||[]).map(n=>n.toLowerCase().trim());
    f._nMid=(f.mid||[]).map(n=>n.toLowerCase().trim());
    f._nBase=(f.base||[]).map(n=>n.toLowerCase().trim());
    f._nAll=[...f._nTop,...f._nMid,...f._nBase];
    return f;
  });
  NI=notes;
  // Rebuild derived objects
  RM=Object.fromEntries(ROLES.map(r=>[r.id,r]));
  CAT_MAP=Object.fromEntries(CAT.map(f=>[f.id,f]));
  NI_MAP=Object.fromEntries(NI.map(n=>[n.name.toLowerCase(),n]));
  BRANDS=brands;
  BRANDS_MAP=Object.fromEntries(BRANDS.map(b=>[b.name.toLowerCase(),b]));
  // Now initialize
  buildCatalog();buildNotes();initCatalogControls();initCompare();
  // Pre-fill a high-layering pair so compare isn't blank on load
  (function(){
    const sample=CAT.slice(0,40);
    let bestScore=-1,bestA=null,bestB=null;
    for(let i=0;i<sample.length;i++){
      for(let j=i+1;j<sample.length;j++){
        const s=scoreLayeringPair(sample[i],sample[j]);
        if(s>bestScore){bestScore=s;bestA=sample[i];bestB=sample[j];}
      }
    }
    if(bestA&&bestB){_selectFragForSlot('a',bestA);_selectFragForSlot('b',bestB);}
  })();
  // MVP: default to compare
  go('compare',null);

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
