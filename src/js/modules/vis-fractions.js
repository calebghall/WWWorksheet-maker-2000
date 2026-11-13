/* ---------- Shapes, Measures and Data: equal parts and fractions ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

/*: equal shares of circles and rectangles */
function vpart(shape, n, equal, ang, fills, key) {
  const cx = 60, cy = 50, R = 40; let o = '';
  const w = 110, h = 74, x0 = 8, y0 = 8;
  if (shape === 'circle') {
    const cuts = equal ? Array.from({ length: n }, (_, i) => ang + 360 * i / n) : Array.from({ length: n }, (_, i) => ang + [0, 40, 150, 250][i] % 360);
    if (n === 2 && !equal) cuts[1] = ang + 120;
    const pt = a => [cx + R * Math.sin(a * Math.PI / 180), cy - R * Math.cos(a * Math.PI / 180)];
    const secs = n;
    for (let i = 0; i < secs; i++) { const a1 = cuts[i], a2 = cuts[(i + 1) % secs] + (i + 1 === secs ? 360 : 0), p1 = pt(a1), p2 = pt(a2), big = (a2 - a1) > 180 ? 1 : 0;
      o += `<path d="M${cx} ${cy}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}A${R} ${R} 0 ${big} 1 ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}Z" fill="${fills.includes(i) ? (key ? VKEY : 'var(--c0)') : '#fff'}" fill-opacity="${fills.includes(i) && key ? .35 : 1}" stroke="${VINK}" stroke-width="2"/>`; }
    return o;
  }
  const cuts = equal ? Array.from({ length: n - 1 }, (_, i) => (i + 1) / n) : (n === 2 ? [0.3] : n === 3 ? [0.22, 0.5] : [0.15, 0.5, 0.7]), horiz = ang % 2 === 1, W = horiz ? h : w, H = horiz ? w : h;
  const edges = [0].concat(cuts, [1]);
  for (let i = 0; i < n; i++) { const a = edges[i], b = edges[i + 1];
    o += horiz ? vrect(x0, y0 + h * a, w, h * (b - a), fills.includes(i) ? (key ? 'var(--keyfill)' : 'var(--c0)') : '#fff', { c: VINK, w: 2 }) : vrect(x0 + w * a, y0, w * (b - a), h, fills.includes(i) ? (key ? 'var(--keyfill)' : 'var(--c0)') : '#fff', { c: VINK, w: 2 }); }
  return o;
}

const V_SHARE = { 2: ['halves', 'half'], 3: ['thirds', 'third'], 4: ['fourths', 'fourth'] };

function visPart(rng, L) {
  const n = pick(rng, L === 1 ? [2, 4] : [2, 3, 4]), shape = pick(rng, ['circle', 'rectangle']), ang = shape === 'circle' ? ri(rng, 0, 60) : ri(rng, 0, 9), as = shape === 'circle' ? ang : ang % 2, kind = pick(rng, L === 1 ? ['eq', 'name'] : ['eq', 'name', 'shade']);
  if (kind === 'eq') { const equal = rng() < 0.5; return vp('part', 'Are the parts equal shares?', { kind, shape, n, equal, ang, fills: [], opts: ['yes', 'no'], ans: equal ? 'yes' : 'no', sig: `pe${shape}${n}${equal}${as}` }, 2.6, 0.95, 2.8); }
  if (kind === 'name') return vp('part', 'Name the equal shares.', { kind, shape, n, equal: true, ang, fills: [], opts: ['halves', 'thirds', 'fourths'], ans: V_SHARE[n][0], sig: `pn${shape}${n}${as}` }, 2.8, 0.95, 2.8);
  return vp('part', `Shade one ${V_SHARE[n][1]}.`, { kind, shape, n, equal: true, ang, fills: [0], ans: '1', sig: `ps${shape}${n}${as}` }, 1.4, 0.95, 1.9);
}

function visPartHtml(p, key) {
  const g = vsvg(1.25, 0.95, vpart(p.shape, p.n, p.equal, p.ang, p.kind === 'shade' ? (key ? [0] : []) : [], key), 'A partitioned shape');
  return p.kind === 'shade' ? g : `<div style="display:flex;align-items:center;gap:.5em">${g}<div>${vopts(p.opts, p.ans, key)}</div></div>`;
}

/* halves and fourths by name (word quarter), the whole as shares */
function visPartw(rng, L) {
  const kind = pick(rng, ['name', 'whole', 'shade']), shape = pick(rng, ['circle', 'rectangle']), ang = shape === 'circle' ? ri(rng, 0, 60) : ri(rng, 0, 9), as = shape === 'circle' ? ang : ang % 2;
  if (kind === 'shade') { const two = rng() < 0.4; return vp('partw', two ? 'Shade 2 fourths.' : 'Shade one quarter.', { kind, shape, n: 4, ang, fills: two ? [0, 1] : [0], ans: two ? '2' : '1', sig: `pq${shape}${as}${two}` }, 1.4, 0.95, 1.9); }
  const n = pick(rng, [2, 4]);
  if (kind === 'whole') return vp('partw', 'How many shares make the whole?', { kind, shape, n, ang, fills: [], ans: String(n), sig: `pw${shape}${n}${as}` }, 1.8, 0.95, 1.9, 12);
  return vp('partw', 'Circle the name of one share.', { kind, shape, n, ang, fills: [], opts: ['half', 'quarter'], ans: n === 2 ? 'half' : 'quarter', sig: `pm${shape}${n}${as}` }, 2.8, 0.95, 2.8);
}

function visPartwHtml(p, key, x) {
  const g = vsvg(1.25, 0.95, vpart(p.shape, p.n, true, p.ang, p.kind === 'shade' ? (key ? p.fills : []) : [], key && p.kind === 'shade'), 'A shape in equal shares');
  if (p.kind === 'shade') return g;
  if (p.kind === 'whole') return g + `<div>The whole is ${x(p.n, 1.6)} ${p.n === 2 ? 'halves' : 'fourths'}.</div>`;
  return `<div style="display:flex;align-items:center;gap:.5em">${g}<div>${vopts(p.opts, p.ans, key)}</div></div>`;
}

/* draw lines to show equal shares */
function visPdraw(rng, L) {
  const n = pick(rng, L === 1 ? [2, 4] : [2, 3, 4]), shape = pick(rng, ['circle', 'rectangle', 'square']);
  return vp('pdraw', `Draw lines to make ${V_SHARE[n][0]}.`, { shape, n, ans: String(n), sig: `pd${shape}${n}` }, 1.4, 0.95, 1.9);
}

function visPdrawHtml(p, key) {
  const cx = 62, cy = 48, R = 40, n = p.n; let o, cuts = '';
  const L = (x1, y1, x2, y2) => vline(x1.toFixed(1), y1.toFixed(1), x2.toFixed(1), y2.toFixed(1), VKEY, 3);
  if (p.shape === 'circle') {
    o = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff" stroke="${VINK}" stroke-width="2"/>`;
    if (key) { const ang = n === 2 ? [0] : n === 3 ? [0, 120, 240] : [0, 90]; for (const a of ang) { const r = a * Math.PI / 180; cuts += n === 3 ? L(cx, cy, cx + R * Math.sin(r), cy - R * Math.cos(r)) : L(cx - R * Math.sin(r), cy + R * Math.cos(r), cx + R * Math.sin(r), cy - R * Math.cos(r)); } }
  } else {
    const w = p.shape === 'square' ? 76 : 110, h = 76, x0 = cx - w / 2, y0 = cy - h / 2;
    o = vrect(x0, y0, w, h, '#fff');
    if (key) { if (p.shape === 'square' && n === 4) cuts += L(cx, y0, cx, y0 + h) + L(x0, cy, x0 + w, cy); else for (let i = 1; i < n; i++) cuts += L(x0 + w * i / n, y0, x0 + w * i / n, y0 + h); }
  }
  return vsvg(1.25, 0.95, o + cuts, 'A shape to divide into equal shares');
}

/* -----: a fraction as parts of a whole (unit fractions and a/b) ----- */
function g3Fmodel(rng, L) {
  const n = pick(rng, L === 1 ? [2, 3, 4] : [2, 3, 4, 6, 8]), shape = pick(rng, ['circle', 'rectangle']), ang = shape === 'circle' ? ri(rng, 0, 60) : ri(rng, 0, 9), as = shape === 'circle' ? ang : ang % 2;
  const v = pick(rng, L === 1 ? ['name', 'shade', 'unit'] : n >= 3 ? ['name', 'shade', 'unit', 'many'] : ['name', 'shade', 'unit']), k = ri(rng, 1, n - 1);
  if (v === 'name') return vp('fmodel', 'What fraction is shaded?', { variant: v, shape, n, k, ang, ans: `${k}/${n}`, sig: `fmn${shape}${n}${k}${as}` }, 2.6, 0.95, 1.9);
  if (v === 'shade') return vp('fmodel', `Shade ${k}/${n} of the shape.`, { variant: v, shape, n, k, ang, ans: `${k}/${n}`, sig: `fms${shape}${n}${k}${as}` }, 1.4, 0.95, 1.9);
  if (v === 'unit') return vp('fmodel', 'Name one equal part.', { variant: v, shape, n, k: 1, ang, ans: `1/${n}`, sig: `fmu${shape}${n}${as}` }, 2.8, 0.95, 4.5);
  const m = ri(rng, 2, n - 1);
  return vtext('fmodel', 'Count the parts.', { variant: v, n, k: m, ans: `${m}/${n}`, sig: `fmm${m}${n}` }, 17, 5.6, true);
}

function g3FmodelHtml(p, key, x) {
  if (p.variant === 'many') return `<div class="wt">${p.k} parts, each ${frH(1, p.n)} of the whole.</div><div>Together: ${ansTpl({ w: 0, n: p.k, d: p.n }, key)} of the whole</div>`;
  const fills = p.variant === 'name' ? Array.from({ length: p.k }, (_, i) => i) : p.variant === 'unit' ? [0] : key ? Array.from({ length: p.k }, (_, i) => i) : [];
  const g = vsvg(1.25, 0.95, vpart(p.shape, p.n, true, p.ang, fills, key && p.variant === 'shade'), 'A shape in equal parts');
  if (p.variant === 'shade') return g;
  if (p.variant === 'name') return `<div style="display:flex;align-items:center;gap:.5em">${g}<div>${ansTpl({ w: 0, n: p.k, d: p.n }, key)}</div></div>`;
  return g + `<div>Each part is ${ansTpl({ w: 0, n: 1, d: p.n }, key)} of the whole.</div>`;
}

/* -----: equal areas, unit fractions, equal shares with different shapes ----- */
function g3Cuts(shape, n) {
  const w = shape === 'square' ? 76 : 110, h = 76, x0 = 62 - w / 2, y0 = 48 - h / 2, V = i => [x0 + w * i / (n === 6 ? 3 : n === 8 ? 4 : n), y0, x0 + w * i / (n === 6 ? 3 : n === 8 ? 4 : n), y0 + h], c = [];
  if (n === 4 && shape === 'square') return { w, h, x0, y0, cuts: [[x0 + w / 2, y0, x0 + w / 2, y0 + h], [x0, y0 + h / 2, x0 + w, y0 + h / 2]] };
  const vs = n === 6 ? 2 : n === 8 ? 3 : n - 1; for (let i = 1; i <= vs; i++) c.push(V(i));
  if (n === 6 || n === 8) c.push([x0, y0 + h / 2, x0 + w, y0 + h / 2]);
  return { w, h, x0, y0, cuts: c };
}

const G3_SAME = [{ n: 2, A: 'v', B: 'd' }, { n: 2, A: 'h', B: 'd' }, { n: 4, A: 'strips', B: 'quad' }, { n: 4, A: 'quad', B: 'tri' }, { n: 4, A: 'strips', B: 'tri' }];

function g3Gpart(rng, L) {
  const v = pick(rng, L === 1 ? ['draw', 'eqpick'] : L === 2 ? ['draw', 'eqpick', 'same'] : ['draw', 'same', 'same', 'eqpick']);
  if (v === 'draw') { const n = pick(rng, L === 1 ? [2, 3, 4] : L === 2 ? [2, 3, 4, 6] : [2, 3, 4, 6, 8]), shape = pick(rng, ['square', 'rectangle']);
    return vp('gpart', `Draw lines to make ${n} equal parts.`, { variant: v, shape, n, ans: `1/${n}`, sig: `gd${shape}${n}` }, 1.5, 0.95, 4.5); }
  if (v === 'same') { const k = pick(rng, G3_SAME.filter(s => L === 3 || s.n === 2)), flip = rng() < 0.5;
    return vp('gpart', 'Name the shaded part.', { variant: v, n: k.n, A: flip ? k.B : k.A, B: flip ? k.A : k.B, ans: `1/${k.n}`, sig: `gs${k.A}${k.B}${flip}` }, 2.95, 1.0, 4.5); }
  const n = pick(rng, [2, 3, 4]), shape = pick(rng, ['circle', 'rectangle']), ang = shape === 'circle' ? ri(rng, 0, 60) : ri(rng, 0, 9), as = shape === 'circle' ? ang : ang % 2, first = pick(rng, ['A', 'B']);
  return vp('gpart', 'Which shows equal parts?', { variant: v, n, shape, ang, first, ans: first, sig: `ge${shape}${n}${as}${first}` }, 2.95, 1.0, 3.4);
}

function g3Whole(kind, ox) {
  const x0 = ox, y0 = 8, s = 82, x1 = x0 + s, y1 = y0 + s, cx = x0 + s / 2, cy = y0 + s / 2, f = VFILL[0], L = (a, b, c, d) => vline(a, b, c, d, VINK, 2);
  let sh, ln;
  if (kind === 'v') { sh = [[x0, y0], [cx, y0], [cx, y1], [x0, y1]]; ln = L(cx, y0, cx, y1); }
  else if (kind === 'h') { sh = [[x0, y0], [x1, y0], [x1, cy], [x0, cy]]; ln = L(x0, cy, x1, cy); }
  else if (kind === 'd') { sh = [[x0, y0], [x1, y1], [x0, y1]]; ln = L(x0, y0, x1, y1); }
  else if (kind === 'strips') { sh = [[x0, y0], [x0 + s / 4, y0], [x0 + s / 4, y1], [x0, y1]]; ln = [1, 2, 3].map(i => L(x0 + s * i / 4, y0, x0 + s * i / 4, y1)).join(''); }
  else if (kind === 'quad') { sh = [[x0, y0], [cx, y0], [cx, cy], [x0, cy]]; ln = L(cx, y0, cx, y1) + L(x0, cy, x1, cy); }
  else { sh = [[cx, cy], [x0, y0], [x1, y0]]; ln = L(x0, y0, x1, y1) + L(x1, y0, x0, y1); }
  return vpoly(sh, f, 0, 0, 0, 'none') + vrect(x0, y0, s, s, 'none') + ln;
}

function g3GpartHtml(p, key, x) {
  const fr = `<div>Each ${p.variant === 'draw' ? 'part' : 'shaded part'} is ${ansTpl({ w: 0, n: 1, d: p.n }, key)} of the whole.</div>`;
  if (p.variant === 'draw') { const g = g3Cuts(p.shape, p.n); let o = vrect(g.x0, g.y0, g.w, g.h, '#fff'); if (key) g.cuts.forEach(c => { o += vline(c[0].toFixed(1), c[1].toFixed(1), c[2].toFixed(1), c[3].toFixed(1), VKEY, 3); }); return vsvg(1.5, 0.95, o, 'A shape to divide') + fr; }
  if (p.variant === 'same') return vsvg(2.95, 1.0, g3Whole(p.A, 20) + g3Whole(p.B, 170) + vtxt(61, 100, 'A', { b: 1, s: 11 }) + vtxt(211, 100, 'B', { b: 1, s: 11 }), 'Two equal wholes cut in different ways') + fr;
  const part = (eq) => vpart(p.shape, p.n, eq, p.ang, [], false);
  return vsvg(2.95, 1.0, `<g>${part(p.first === 'A')}</g><g transform="translate(150 0)">${part(p.first !== 'A')}</g>` + vtxt(63, 98, 'A', { b: 1, s: 11 }) + vtxt(213, 98, 'B', { b: 1, s: 11 }), 'Two shapes cut into parts') + `<div>${vopts(['A', 'B'], p.ans, key)}</div>`;
}

defTypes("vis", "Equal parts and fractions", [
  { id: "part", label: "Equal shares", blurb: "Halves, thirds, fourths.", on: false, gen: visPart, html: visPartHtml },
  { id: "partw", label: "Halves and quarters", blurb: "Name one share, whole as shares, shade quarters.", on: false, gen: visPartw, html: visPartwHtml },
  { id: "pdraw", label: "Draw equal shares", blurb: "Draw lines to make halves, thirds or fourths.", on: false, gen: visPdraw, html: visPdrawHtml },
  { id: "gpart", label: "Equal areas and unit fractions", blurb: "Draw equal parts, name the unit fraction.", on: false, gen: g3Gpart, html: g3GpartHtml },
  { id: "fmodel", label: "Fraction models", blurb: "Name, shade and count equal parts of a whole.", on: false, gen: g3Fmodel, html: g3FmodelHtml }
]);
