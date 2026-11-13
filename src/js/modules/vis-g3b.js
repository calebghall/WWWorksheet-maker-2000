/* ---------- Shapes, Measures and Data: grade 3 additions, part B ----------
   pictg, barg (3.MD.B.3), rulq, lplotq (3.MD.B.4), acon (3.MD.C.5), gcat (3.G.A.1), gpart (3.G.A.2), gpoly (3.G.A.3), pera (3.MD.D.8). Registers all grade 3 types. */
const VIS_G3B = ['pictg', 'barg', 'rulq', 'lplotq', 'acon', 'gcat', 'gpart', 'gpoly', 'pera'];
const VIS_G3 = VIS_G3A.concat(VIS_G3B);

/* ----- 3.MD.B.3: scaled pictograph and scaled bar graph, five categories ----- */
const G3_CATS = [['Soccer', 'Tennis', 'Chess', 'Swim', 'Golf'], ['Cats', 'Dogs', 'Fish', 'Birds', 'Mice'], ['Apples', 'Pears', 'Plums', 'Grapes', 'Kiwis'], ['Red', 'Blue', 'Green', 'Yellow', 'Pink'], ['Pizza', 'Tacos', 'Soup', 'Salad', 'Pasta'], ['Rain', 'Sun', 'Cloud', 'Snow', 'Wind']];
const vhalf = (cx, cy, s, fill, stroke) => `<path d="M${cx} ${cy - s / 2}A${s / 2} ${s / 2} 0 0 0 ${cx} ${cy + s / 2}Z" fill="${fill}" stroke="${stroke || VINK}" stroke-width="2" stroke-linejoin="round"/>`;
function g3Graph(rng, L, bar) {
  const step = pick(rng, L === 1 ? [2] : L === 2 ? [2, 5] : [2, 5, 10]), g = bar ? (step === 5 ? 5 : L === 1 ? 2 : step === 2 ? 1 : 5) : (L >= 2 && step % 2 === 0 ? step / 2 : step), nc = L === 1 ? 4 : 5;
  const vals = []; for (let v = g; v <= (bar ? 7 : 6) * step; v += g) vals.push(v);
  const cats = pick(rng, G3_CATS).slice(0, nc), cnt = shuffle(rng, vals).slice(0, nc), make = L === 3 && rng() < 0.6, q = vQs(cats, cnt);
  let two = null;
  if (L === 3 && !make && rng() < 0.5) { const c = q.lo, o = shuffle(rng, [0, 1, 2, 3, 4].slice(0, nc).filter(i => i !== c)).slice(0, 2); two = { a: o[0], b: o[1], c, ans: cnt[o[0]] + cnt[o[1]] - cnt[c] }; }
  return { step, g, cats, cnt, make, two, q };
}
function g3Pictg(rng, L) {
  const d = g3Graph(rng, L, false), p = vp('pictg', d.make ? 'Draw the pictograph.' : 'Read the pictograph.', Object.assign({ half: d.step % 2 === 0 && L >= 2, ans: d.make ? d.cnt.join(' ') : `${d.q.tot} ${d.q.diff}`, sig: `pg${d.cats}${d.cnt}${d.step}${d.make}${d.two ? d.two.a + '' + d.two.b : ''}` }, d, d.q), 2.95, 1.5, d.make ? 5.5 : d.two ? 7.7 : 6.2, 15);
  return p;
}
function g3Qhtml(p, x) { return vQHtml(p, x) + (p.two ? `<div>How many more ${esc(p.cats[p.two.a])} and ${esc(p.cats[p.two.b])} than ${esc(p.cats[p.two.c])}? ${x(p.two.ans, 2)}</div>` : ''); }
function g3PictgHtml(p, key, x) {
  let o = '';
  p.cats.forEach((c, i) => { const y = 6 + 28 * i; o += vtxt(4, y + 18, c, { a: 'start', s: 12 }) + vline(72, y + 26, 285, y + 26, '#d4dbe6', 1);
    const full = Math.floor(p.cnt[i] / p.step), hf = p.cnt[i] % p.step ? 1 : 0, col = p.make ? 'none' : VFILL[i % 4], st = p.make ? VKEY : VINK;
    if (!p.make || key) { for (let j = 0; j < full; j++) o += vshape('circle', 86 + 28 * j, y + 13, 20, col, 0, st); if (hf) o += vhalf(86 + 28 * full, y + 13, 20, col, st); } });
  const legend = `Each ● = ${p.step}${p.half ? `, half ● = ${p.step / 2}` : ''}`, g = vsvg(2.95, 1.5, o, 'Pictograph');
  if (p.make) return `<div style="font-size:.85em">${legend}</div><div style="font-size:.85em">${p.cats.slice(0, 3).map((c, i) => `${esc(c)} ${p.cnt[i]}`).join(' · ')}</div><div style="font-size:.85em">${p.cats.slice(3).map((c, i) => `${esc(c)} ${p.cnt[i + 3]}`).join(' · ')}</div>` + g;
  return `<div style="font-size:.85em">${legend}</div>` + g + g3Qhtml(p, x);
}
function g3Barg(rng, L) {
  const d = g3Graph(rng, L, true);
  return vp('barg', d.make ? 'Draw the bar graph.' : 'Read the bar graph.', Object.assign({ ans: d.make ? d.cnt.join(' ') : `${d.q.tot} ${d.q.diff}`, sig: `bg${d.cats}${d.cnt}${d.step}${d.make}${d.two ? d.two.a + '' + d.two.b : ''}` }, d, d.q), 2.95, 1.75, d.make ? 5.5 : d.two ? 6.2 : 4.7, 15);
}
function g3BargHtml(p, key, x) {
  const x0 = 36, y0 = 130, uh = 15, s = p.step; let o = vline(x0, y0, x0, y0 - 7 * uh - 4, VINK, 2) + vline(x0, y0, 290, y0, VINK, 2);
  for (let v = 0; v <= 7; v++) { o += vline(x0 - 4, y0 - v * uh, x0, y0 - v * uh, VINK, 1.2) + vtxt(x0 - 7, y0 - v * uh + 3.5, String(v * s), { a: 'end', s: 10 }); if (v) o += vline(x0, y0 - v * uh, 290, y0 - v * uh, '#e3e8f0', 1); }
  p.cats.forEach((c, i) => { const bx = 50 + 48 * i, h = p.cnt[i] / s * uh; o += vtxt(bx + 16, y0 + 14, c, { s: 9.5 }); if (!p.make || key) o += vrect(bx, y0 - h, 32, h, p.make ? 'none' : VFILL[i % 4], { c: p.make ? VKEY : VINK, w: p.make ? 3 : 2 }); });
  const g = vsvg(2.95, 1.75, o, 'Bar graph');
  return p.make ? `<div style="font-size:.85em">${p.cats.slice(0, 3).map((c, i) => `${esc(c)} ${p.cnt[i]}`).join(' · ')}</div><div style="font-size:.85em">${p.cats.slice(3).map((c, i) => `${esc(c)} ${p.cnt[i + 3]}`).join(' · ')}</div>` + g : g + g3Qhtml(p, x);
}

/* ----- 3.MD.B.4: rulers marked in halves and fourths of an inch; line plots with halves and fourths ----- */
function vmx(q) { const w = Math.floor(q / 4), r = q % 4, f = r === 0 ? '' : r === 2 ? '½' : r === 1 ? '¼' : '¾'; return w || !f ? `${w}${f}` : f; }
function g3Rulq(rng, L) {
  const den = L === 1 ? 2 : 4, q = den === 2 ? 2 * ri(rng, 1, 10) : ri(rng, 3, 20), draw = L >= 2 && rng() < 0.4;
  if (draw) return vp('rulq', `Draw a line ${vmx(q)} in long.`, { variant: 'draw', den, q, ans: vmx(q), sig: `rqd${q}` }, 3.1, 0.95, 1.9);
  return vp('rulq', 'How long is the object?', { variant: 'read', den, q, ans: vmx(q), sig: `rqr${den}${q}` }, 3.1, 0.95, 3.4, 10);
}
function g3RulqHtml(p, key, x) {
  const x0 = 14, S = 56; let o = '';
  if (p.variant === 'read') o += vrect(x0, 6, p.q * S / 4, 22, VFILL[3], { r: 3 });
  else { o += vline(x0, 17, x0 + 5 * S, 17, '#b6c0d0', 2) + vline(x0, 8, x0, 26, VINK, 2); if (key) o += vline(x0, 17, x0 + p.q * S / 4, 17, VKEY, 4.5) + vline(x0 + p.q * S / 4, 9, x0 + p.q * S / 4, 25, VKEY, 3); }
  o += vrect(x0 - 4, 34, 5 * S + 8, 50, 'var(--ruler)');
  for (let i = 0; i <= 20; i += p.den === 2 ? 2 : 1) { const xx = x0 + i * S / 4, h = i % 4 === 0 ? 22 : i % 2 === 0 ? 16 : 10; o += vline(xx, 34, xx, 34 + h, VINK, i % 4 === 0 ? 1.8 : 1.2); if (i % 4 === 0) o += vtxt(xx, 70, String(i / 4), { s: 12 }); }
  const g = vsvg(3.1, 0.95, o, p.variant === 'read' ? 'An object above a ruler' : 'A ruler and a guide line');
  return p.variant === 'read' ? g + `<div>Length: ${x(p.ans, 2.4)} in</div>` : g;
}
function g3Lplotq(rng, L) {
  const den = L === 1 ? 2 : L === 2 ? pick(rng, [2, 4]) : 4, stepQ = 4 / den, pos = []; for (let q = 4; q <= 16; q += stepQ) pos.push(q);
  const data = []; let guard = 0; while (data.length < 8 && guard++ < 200) { const v = pick(rng, pos); if (data.filter(t => t === v).length < 3) data.push(v); } data.sort((a, b) => a - b);
  const make = L === 3 ? rng() < 0.6 : L === 2 && rng() < 0.4, qk = !make && L === 3 && rng() < 0.4 ? 'diff' : 'count', ask = pick(rng, data);
  const ans = make ? data.map(vmx).join(' ') : qk === 'diff' ? vmx(data[7] - data[0]) : String(data.filter(v => v === ask).length);
  return vp('lplotq', make ? 'Make a line plot of the data.' : 'Read the line plot.', { make, den, data, qk, ask, ans, sig: `lq${den}${data}${make}${make ? '' : qk + (qk === 'count' ? ask : '')}` }, 3.0, 1.4, make ? 4.5 : 3.4, 12);
}
function g3LplotqHtml(p, key, x) {
  const x0 = 26, t = 21, y = 92; let o = vline(x0 - 8, y, x0 + 12 * t + 8, y, VINK, 2);
  for (let q = 4; q <= 16; q += 4 / p.den) { const xx = x0 + (q - 4) * t, lab = q % 2 === 0; o += vline(xx, y - (q % 4 === 0 ? 7 : 5), xx, y + (q % 4 === 0 ? 7 : 5), VINK, 1.5); if (lab) o += vtxt(xx, y + 21, vmx(q), { s: 11 }); }
  const cnt = {}; p.data.forEach(v => { cnt[v] = (cnt[v] || 0) + 1; });
  if (!p.make || key) Object.keys(cnt).forEach(v => { for (let j = 0; j < cnt[v]; j++) o += vtxt(x0 + (v - 4) * t, y - 12 - 15 * j, '×', { s: 17, b: 1, c: p.make ? VKEY : VINK }); });
  o += vtxt(x0 + 6 * t, y + 38, 'inches', { s: 11 });
  const g = vsvg(3.0, 1.4, o, 'Line plot');
  if (p.make) return `<div style="font-size:.85em">${p.data.slice(0, 4).map(vmx).join(', ')},</div><div style="font-size:.85em">${p.data.slice(4).map(vmx).join(', ')} in</div>` + g;
  return g + (p.qk === 'diff' ? `<div>Longest − shortest: ${x(p.ans, 2.4)} in</div>` : `<div>How many measure ${vmx(p.ask)} in? ${x(p.ans, 2)}</div>`);
}

/* ----- 3.MD.C.5: area concepts with unit squares ----- */
function g3Poly(rng, n, cols, rows) {
  const has = new Set(), cur = [[ri(rng, 0, cols - 1), ri(rng, 0, rows - 1)]]; has.add(cur[0] + ''); let g = 0;
  while (cur.length < n && g++ < 600) { const [c, r] = pick(rng, cur), [dc, dr] = pick(rng, [[1, 0], [-1, 0], [0, 1], [0, -1]]), nc = c + dc, nr = r + dr; if (nc < 0 || nr < 0 || nc >= cols || nr >= rows || has.has([nc, nr] + '')) continue; has.add([nc, nr] + ''); cur.push([nc, nr]); }
  return cur.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}
const G3_AUNIT = [['unit squares', 'square units', ''], ['squares, each 1 cm by 1 cm,', 'square centimeters', ''], ['squares, each 1 inch by 1 inch,', 'square inches', ''], ['squares, each 1 foot by 1 foot,', 'square feet', '']];
function g3Acon(rng, L) {
  const v = pick(rng, L === 1 ? ['which', 'defn'] : ['which', 'tile', 'defn']);
  if (v === 'which') { const lo = L === 1 ? 3 : L === 2 ? 5 : 8, hi = L === 1 ? 8 : L === 2 ? 12 : 16, na = ri(rng, lo, hi); let nb = ri(rng, lo, hi);
    if (L > 1 && rng() < (L === 2 ? 0.25 : 0.35)) nb = na; else while (nb === na) nb = ri(rng, lo, hi);
    const A = g3Poly(rng, na, 5, 4); let B = g3Poly(rng, nb, 5, 4), t = 0; while (nb === na && B + '' === A + '' && t++ < 20) B = g3Poly(rng, nb, 5, 4);
    return vp('acon', 'Which has the greater area?', { variant: v, A, B, ans: na > nb ? 'A' : nb > na ? 'B' : 'same', sig: `ac${A.map(c => c.join(''))}|${B.map(c => c.join(''))}` }, 2.95, 1.25, 4.7, 12); }
  if (v === 'tile') { const w = ri(rng, 3, 5), h = ri(rng, 2, 3), flaw = pick(rng, ['gap', 'shift']), at = ri(rng, 0, w * h - 1), first = pick(rng, ['A', 'B']);
    return vp('acon', 'Which has no gaps or overlaps?', { variant: v, w, h, flaw, at, first, ans: first, sig: `at${w}${h}${flaw}${at}${first}` }, 2.95, 1.25, 3.4, 12); }
  const n = ri(rng, L === 1 ? 4 : 6, L === 1 ? 12 : L === 2 ? 30 : 60), u = pick(rng, L === 1 ? [G3_AUNIT[0]] : G3_AUNIT), text = `A figure is covered by ${n} ${u[0]} with no gaps or overlaps. What is its area?`;
  return vtext('acon', 'Area from unit squares.', { variant: v, n, unit: u[1], text, ans: String(n), sig: `ad${n}${u[1]}` }, 21, g3eh([text.length], 0, 1.7), true);
}
function g3AconHtml(p, key, x) {
  if (p.variant === 'defn') return `<div class="wt">${esc(p.text)}</div><div>${x(p.ans, 2.4)} ${p.unit}</div>`;
  const u = 22; let o = '';
  const panel = (ox, cells, fill, lab) => { cells.forEach(c => { o += vrect(ox + c[0] * u, 4 + c[1] * u, u, u, fill, { w: 1.5 }); }); o += vtxt(ox + 55, 112, lab, { b: 1, s: 14 }); };
  if (p.variant === 'which') { panel(10, p.A, VFILL[0], 'A'); panel(165, p.B, VFILL[1], 'B'); return vsvg(2.95, 1.25, o, 'Two figures made of squares') + `<div style="font-size:.85em">Each square is 1 square unit.</div><div>${vopts(['A', 'B', 'same'], p.ans, key)}</div>`; }
  const fig = (ox, good, lab) => { o += vrect(ox, 4, p.w * u, p.h * u, 'none', { d: '4 3', w: 1.2 });
    for (let i = 0; i < p.w * p.h; i++) { const c = i % p.w, r = Math.floor(i / p.w); if (good) o += vrect(ox + c * u, 4 + r * u, u, u, VFILL[1], { w: 1.5 }); else if (i !== p.at) o += vrect(ox + c * u, 4 + r * u, u, u, VFILL[1], { w: 1.5 }); }
    if (!good && p.flaw === 'shift') { const c = p.at % p.w, r = Math.floor(p.at / p.w); o += vrect(ox + c * u + (c === p.w - 1 ? -u / 2 : u / 2), 4 + r * u, u, u, VFILL[2], { w: 1.5 }); } o += vtxt(ox + p.w * u / 2, 4 + p.h * u + 18, lab, { b: 1, s: 14 }); };
  fig(14, p.first === 'A', 'A'); fig(165, p.first !== 'A', 'B');
  return vsvg(2.95, 1.25, o, 'Two figures covered with squares') + `<div>${vopts(['A', 'B'], p.ans, key)}</div>`;
}

/* ----- 3.G.A.1: quadrilaterals and their subcategories ----- */
const G3_SH = { square: ['quad', 'rect', 'rhom', 'sq'], rectangle: ['quad', 'rect'], rhombus: ['quad', 'rhom'], trapezoid: ['quad'], triangle: [], pentagon: [], hexagon: [], circle: [] };
const G3_CATN = { quad: 'quadrilateral', rect: 'rectangle', rhom: 'rhombus', sq: 'square' };
const G3_BOTH = [{ q: 'Circle the shape that is a rhombus and a rectangle.', t: s => G3_SH[s].includes('rhom') && G3_SH[s].includes('rect'), L: 2 }, { q: 'Circle the quadrilateral that is not a rectangle or a rhombus.', t: s => G3_SH[s].includes('quad') && !G3_SH[s].includes('rect') && !G3_SH[s].includes('rhom'), L: 2 }, { q: 'Circle the rectangle that is not a square.', t: s => G3_SH[s].includes('rect') && !G3_SH[s].includes('sq'), L: 3 }];
const G3_QUAD = ['square', 'rectangle', 'rhombus', 'trapezoid'];
function g3Gcat(rng, L) {
  const v = pick(rng, L === 1 ? ['is', 'group'] : L === 2 ? ['is', 'both', 'group'] : ['is', 'both', 'is']);
  if (v === 'is') { const shape = pick(rng, L === 1 ? ['square', 'rectangle', 'rhombus', 'trapezoid', 'triangle', 'pentagon', 'hexagon'] : Object.keys(G3_SH)), cat = pick(rng, L === 1 ? ['quad'] : L === 2 ? ['quad', 'rect'] : ['quad', 'rect', 'rhom', 'sq']), rot = pick(rng, [0, 0, 15, 30, 45]) * (shape === 'circle' ? 0 : 1);
    return vp('gcat', `Is this shape a ${G3_CATN[cat]}?`, { variant: v, shape, cat, rot, ans: G3_SH[shape].includes(cat) ? 'yes' : 'no', sig: `gi${shape}${cat}${rot}` }, 2.6, 0.95, 1.9); }
  if (v === 'both') { const k = pick(rng, G3_BOTH.filter(b => b.L <= L)), list = shuffle(rng, G3_QUAD), ans = list.findIndex(k.t);
    return vp('gcat', 'Circle the shape.', { variant: v, q: k.q, list, ans: String(ans), sig: `gb${k.q.length}${list}` }, 3.0, 1.0, 4.9, 24); }
  const list = shuffle(rng, G3_QUAD).slice(0, 3), opts = shuffle(rng, ['quadrilaterals', 'rectangles', 'rhombuses']);
  return vp('gcat', 'Name the group.', { variant: v, list, opts, ans: 'quadrilaterals', sig: `gg${list}${opts}` }, 2.7, 0.9, 4.9, 20);
}
function g3GcatHtml(p, key, x) {
  const fl = k => vshape(k, 0, 0, 44, V_SHFILL(k), 0);
  if (p.variant === 'is') return `<div style="display:flex;align-items:center;gap:.5em">${vsvg(1.2, 0.95, vshape(p.shape, 60, 48, 62, V_SHFILL(p.shape), p.rot), 'A shape')}<div>${vopts(['yes', 'no'], p.ans, key)}</div></div>`;
  if (p.variant === 'both') { let o = p.list.map((k, i) => vshape(k, 40 + 72 * i, 50, 44, V_SHFILL(k), 0)).join(''); if (key) o += vring(40 + 72 * +p.ans - 36, 12, 72, 76); return `<div class="wt">${esc(p.q)}</div>` + vsvg(3.0, 1.0, o, 'Four shapes'); }
  return vsvg(2.7, 0.9, p.list.map((k, i) => vshape(k, 45 + 90 * i, 45, 46, V_SHFILL(k), 0)).join(''), 'Three shapes') + `<div>These shapes are all</div><div>${vopts(p.opts, p.ans, key)}</div>`;
}

/* ----- 3.G.A.2: equal areas, unit fractions, equal shares with different shapes ----- */
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

/* ----- 3.G.A.3: is it a polygon? ----- */
const G3_POLY = { tri: [[0, -26], [28, 24], [-28, 24]], quad: [[-26, -14], [10, -24], [28, 12], [-18, 24]], rect: [[-30, -18], [30, -18], [30, 18], [-30, 18]], trap: [[-14, -20], [14, -20], [30, 20], [-30, 20]],
  lsh: [[-24, -24], [-4, -24], [-4, 4], [24, 4], [24, 24], [-24, 24]], arrow: [[-28, -8], [4, -8], [4, -24], [28, 0], [4, 24], [4, 8], [-28, 8]] };
const G3_NONP = ['circle', 'oval', 'semi', 'wave', 'open', 'open2'];
const g3IsPoly = id => id === 'pent' || id === 'hex' || !!G3_POLY[id];
function g3Fig(id, cx, cy, fill) {
  const P = a => a.map(q => [cx + q[0], cy + q[1]]), ink = `stroke="${VINK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
  if (id === 'pent') return vpoly(vreg(5, cx, cy + 2, 29, 0), fill, 0, 0, 0);
  if (id === 'hex') return vpoly(vreg(6, cx, cy, 29, 0), fill, 0, 0, 0);
  if (G3_POLY[id]) return vpoly(P(G3_POLY[id]), fill, 0, 0, 0);
  if (id === 'circle') return `<circle cx="${cx}" cy="${cy}" r="26" fill="${fill}" ${ink}/>`;
  if (id === 'oval') return `<ellipse cx="${cx}" cy="${cy}" rx="29" ry="19" fill="${fill}" ${ink}/>`;
  if (id === 'semi') return `<path d="M${cx - 28} ${cy + 12}A28 28 0 0 1 ${cx + 28} ${cy + 12}Z" fill="${fill}" ${ink}/>`;
  if (id === 'wave') return `<path d="M${cx - 26} ${cy - 14}Q${cx - 13} ${cy - 28} ${cx} ${cy - 14}T${cx + 26} ${cy - 14}L${cx + 26} ${cy + 22}L${cx - 26} ${cy + 22}Z" fill="${fill}" ${ink}/>`;
  if (id === 'open') return `<polyline points="${P([[-28, 20], [-14, -20], [0, 20], [14, -20], [28, 20]]).map(q => q.join(',')).join(' ')}" fill="none" ${ink}/>`;
  return `<polyline points="${P([[-24, -22], [-24, 22], [24, 22], [24, -22]]).map(q => q.join(',')).join(' ')}" fill="none" ${ink}/>`;
}
function g3Gpoly(rng, L) {
  const pp = L === 1 ? ['tri', 'rect', 'pent', 'hex', 'trap'] : L === 2 ? ['tri', 'rect', 'pent', 'hex', 'trap', 'quad'] : ['tri', 'rect', 'pent', 'hex', 'trap', 'quad', 'lsh', 'arrow'], np = L === 1 ? ['circle', 'oval', 'semi', 'open'] : G3_NONP;
  if (L > 1 && rng() < 0.3) { const id = pick(rng, pp.concat(np)); return vp('gpoly', 'Is this figure a polygon?', { variant: 'one', id, ans: g3IsPoly(id) ? 'yes' : 'no', sig: `go${id}` }, 2.6, 0.75, 1.9); }
  const k = ri(rng, 2, 3), ids = shuffle(rng, shuffle(rng, pp).slice(0, k).concat(shuffle(rng, np).slice(0, 5 - k)));
  return vp('gpoly', 'Circle every polygon.', { variant: 'set', ids, ans: ids.map((d, i) => g3IsPoly(d) ? i : -1).filter(i => i >= 0).join(' '), sig: `gp${ids}` }, 3.0, 0.75, 1.9);
}
function g3GpolyHtml(p, key, x) {
  if (p.variant === 'one') return `<div style="display:flex;align-items:center;gap:.5em">${vsvg(0.95, 0.75, g3Fig(p.id, 48, 37, VFILL[1]), 'A figure')}<div>${vopts(['yes', 'no'], p.ans, key)}</div></div>`;
  let o = p.ids.map((d, i) => g3Fig(d, 30 + 60 * i, 37, VFILL[i % 4])).join('');
  if (key) p.ids.forEach((d, i) => { if (g3IsPoly(d)) o += vring(60 * i + 1, 2, 58, 70); });
  return vsvg(3.0, 0.75, o, 'Five figures');
}

/* ----- 3.MD.D.8: rectangles with the same perimeter or the same area ----- */
const G3_SAMEA = [12, 16, 18, 20, 24, 30, 36];
function g3Pera(rng, L) {
  const kind = L === 1 || rng() < 0.5 ? 'perim' : 'area';
  let a, b;
  if (kind === 'perim') { const s = ri(rng, L === 1 ? 6 : L === 2 ? 8 : 9, L === 1 ? 8 : L === 2 ? 10 : 12), hs = shuffle(rng, Array.from({ length: Math.floor(s / 2) }, (_, i) => i + 1)).slice(0, 2); a = [s - hs[0], hs[0]]; b = [s - hs[1], hs[1]]; }
  else { const ar = pick(rng, G3_SAMEA.filter(v => L === 2 ? v <= 24 : true)), prs = []; for (let h = 1; h * h <= ar; h++) if (ar % h === 0 && ar / h <= 11) prs.push([ar / h, h]); const two = shuffle(rng, prs).slice(0, 2); a = two[0]; b = two[1]; }
  const per = r => 2 * (r[0] + r[1]), area = r => r[0] * r[1], f = kind === 'perim' ? area : per, ans = f(a) > f(b) ? 'A' : 'B';
  return vp('pera', kind === 'perim' ? 'Same perimeter. Which area is greater?' : 'Same area. Which perimeter is greater?', { kind, a, b, ans, sig: `pe${kind}${a}${b}` }, 3.1, 1.1, 4.9, 22);
}
function g3PeraHtml(p, key, x) {
  const u = 11; let o = '';
  const rect = (ox, r, lab) => { o += vrect(ox, 22, r[0] * u, r[1] * u, VFILL[lab === 'A' ? 0 : 1], { w: 1.5 }) + vtxt(ox + r[0] * u / 2, 16, String(r[0]), { s: 11 }) + vtxt(ox - 6, 22 + r[1] * u / 2 + 4, String(r[1]), { a: 'end', s: 11 }) + vtxt(ox + r[0] * u / 2, 104, lab, { b: 1, s: 13 });
    for (let i = 1; i < r[0]; i++) o += vline(ox + i * u, 22, ox + i * u, 22 + r[1] * u, '#fff', 1); for (let j = 1; j < r[1]; j++) o += vline(ox, 22 + j * u, ox + r[0] * u, 22 + j * u, '#fff', 1); };
  rect(30, p.a, 'A'); rect(172, p.b, 'B');
  const f = p.kind === 'perim' ? r => r[0] * r[1] : r => 2 * (r[0] + r[1]), w = p.kind === 'perim' ? 'Area' : 'Perimeter';
  return vsvg(3.1, 1.1, o, 'Two rectangles with side lengths') + `<div>${w} of A ${x(f(p.a), 1.8)}&ensp;${w} of B ${x(f(p.b), 1.8)}</div><div>Greater: ${vopts(['A', 'B'], p.ans, key)}</div>`;
}

Object.assign(VGEN, { mfac: g3Mfac, dint: g3Dint, mchart: g3Mchart, fmodel: g3Fmodel, fline: g3Fline, mvol: g3Mvol, pictg: g3Pictg, barg: g3Barg, rulq: g3Rulq, lplotq: g3Lplotq, acon: g3Acon, gcat: g3Gcat, gpart: g3Gpart, gpoly: g3Gpoly, pera: g3Pera });
Object.assign(VHTML, { mfac: g3MfacHtml, dint: g3DintHtml, mchart: g3MchartHtml, fmodel: g3FmodelHtml, fline: g3FlineHtml, mvol: g3MvolHtml, pictg: g3PictgHtml, barg: g3BargHtml, rulq: g3RulqHtml, lplotq: g3LplotqHtml, acon: g3AconHtml, gcat: g3GcatHtml, gpart: g3GpartHtml, gpoly: g3GpolyHtml, pera: g3PeraHtml });
VIS_TYPES.push(...VIS_G3);
