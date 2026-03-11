// ── design.js ────────────────────────────────────────────────────────
// Design System panel builder. Dynamically imported the first time
// the Design System panel is opened — keeps the main bundle lean.
// Usage: const { buildDesign } = await import('./js/design.js');

export function buildDesign() {
  const el = document.getElementById('design-body');
  if (!el || el.dataset.built) return;
  el.dataset.built = '1';

  function lum(h) {
    const r = parseInt(h.slice(1,3),16)/255, g = parseInt(h.slice(3,5),16)/255, b = parseInt(h.slice(5,7),16)/255;
    const f = c => c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
    return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
  }
  function cr(a, b) { const la=lum(a), lb=lum(b); return (Math.max(la,lb)+0.05)/(Math.min(la,lb)+0.05); }
  function crBadge(fg, bg) {
    const r=cr(fg,bg), s=r.toFixed(1);
    const [cls,lbl] = r>=4.5?['ds-cr-ok','AA ✓']:r>=3?['ds-cr-w','AA Large']:['ds-cr-f','Fail ✗'];
    return `<span class="ds-cr ${cls}">${s}:1 ${lbl}</span>`;
  }
  const BG = '#F5F2EC';
  function sec(id,num,title,content){ return `<div class="ds-section" id="${id}"><div class="ds-section-hd"><span class="ds-section-n">§${num}</span><span class="ds-section-t">${title}</span></div>${content}</div>`; }
  function sublbl(t){ return `<div class="ds-sub-lbl">${t}</div>`; }
  function demo(lbl,content){ return `<div class="ds-demo"><div class="ds-demo-lbl">${lbl}</div>${content}</div>`; }

  const PAL = [
    ['--paper','#F5F2EC','Page background'],['--ink','#0E0C09','Primary text'],
    ['--stone','#EAE6DE','Secondary backgrounds'],['--g700','#2E2A22','Near-black headings'],
    ['--g600','#50493C','Secondary headings'],['--g500','#6B6356','Secondary text — minimum for body'],
    ['--g450','#7C7468','⚠ 3.7:1 — avoid for text'],['--g400','#9A9180','⚠ 2.7:1 — borders only'],
    ['--g300','#C4BC9E','Decorative borders'],['--g200','#DDD8CE','Standard borders'],
    ['--g100','#EAE6DE','Subtle separators'],['--resin','#8C5E30','Save/wishlist accent'],
  ];

  el.innerHTML = `
    <div class="ds-hero">
      <div class="ds-hero-title">Design System</div>
      <div class="ds-hero-sub">Single source of truth for tokens, components, and interaction patterns.</div>
    </div>
    ${sec('ds-foundations','1','Foundations',`
      <div class="ds-section" id="ds-colors">
        <div class="ds-section-hd"><span class="ds-section-n">§1.1</span><span class="ds-section-t">Colors</span></div>
        ${sublbl('Neutral Palette')}
        <div class="ds-swatches">
          ${PAL.map(([name,hex,role]) => `<div class="ds-sw">
            <div class="ds-sw-color" style="background:${hex}"></div>
            <div class="ds-sw-name">${name}</div>
            <div class="ds-sw-hex">${hex}</div>
            <div class="ds-sw-role">${role}</div>
            ${crBadge(hex,BG)}
          </div>`).join('')}
        </div>
      </div>
    `)}
  `;
}
