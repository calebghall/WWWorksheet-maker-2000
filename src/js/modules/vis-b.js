/* ---------- Shapes, Measures and Data, part B: data displays, shapes and solids, partitions, arrays, charts; module registration ---------- */
const V_CATS = [['Cats', 'Dogs', 'Fish'], ['Apples', 'Pears', 'Plums'], ['Soccer', 'Tennis', 'Chess'], ['Red', 'Blue', 'Green'], ['Rain', 'Sun', 'Cloud']];
function vdataSet(rng, L, max, step) {
  const cats = pick(rng, V_CATS).slice(), cnt = shuffle(rng, Array.from({ length: max / step }, (_, i) => (i + 1) * step)).slice(0, 3);
  return { cats, cnt };
}
/* Two questions for any display: how many in all, and how many more in the larger group than a smaller one. */
function vQs(cats, cnt) {
  const hi = cnt.indexOf(Math.max(...cnt)), lo = cnt.indexOf(Math.min(...cnt));
  return { tot: cnt.reduce((a, b) => a + b, 0), hi, lo, diff: cnt[hi] - cnt[lo] };
}
const vQHtml = (p, x) => `<div>How many in all? ${x(p.tot, 2.2)}</div><div>More ${esc(p.cats[p.hi])} than ${esc(p.cats[p.lo])}? ${x(p.diff, 2.2)}</div>`;

/* K.MD.C.4: sort objects into categories and compare */
function visSort(rng, L) {
  const mx = L === 1 ? 6 : L === 2 ? 8 : 10; let a = ri(rng, 2, mx), b;
  do { b = ri(rng, 2, mx); } while (b === a);
  const kinds = shuffle(rng, ['circle', 'square', 'triangle']).slice(0, 2), all = [];
  for (let i = 0; i < a; i++) all.push(0); for (let i = 0; i < b; i++) all.push(1);
  const items = shuffle(rng, all), pts = items.map((_, i) => [22 + 34 * (i % 8), 22 + 38 * Math.floor(i / 8)]), rows = Math.ceil(items.length / 8);
  return vp('sort', 'Count. Circle the group with more.', { kinds, items, pts, a, b, rows, ans: a > b ? kinds[0] : kinds[1], sig: `so${kinds}${items.join('')}`.slice(0, 60) }, 2.9, rows * 0.38 + 0.1, 4.5, 14);
}
function visSortHtml(p, key, x) {
  const o = p.items.map((k, i) => vshape(p.kinds[k], p.pts[i][0], p.pts[i][1], 24, VFILL[k === 0 ? 0 : 1], 0)).join('');
  return vsvg(2.9, p.rows * 0.38 + 0.1, o, 'Mixed shapes') + `<div>${p.kinds.map((k, i) => `${vpl(k, 2)} ${x(i ? p.b : p.a, 1.9)}`).join('&emsp;')}</div><div>${vopts(p.kinds.map(k => vpl(k, 2)), vpl(p.ans, 2), key)}</div>`;
}

/* 1.MD.C.5: tally chart */
function visTally(rng, L) {
  const { cats, cnt } = vdataSet(rng, L, L === 1 ? 6 : 12, 1), q = vQs(cats, cnt);
  return vp('tally', 'Read the tally chart.', Object.assign({ cats, cnt, sig: `ta${cats}${cnt}` }, q, { ans: `${q.tot} ${q.diff}` }), 2.9, 1.0, 4.5, 15);
}
function visTallyHtml(p, key, x) {
  let o = '';
  p.cats.forEach((c, i) => { const y = 8 + 30 * i; o += vtxt(4, y + 18, c, { a: 'start', s: 13 }); let cx = 78, n = p.cnt[i];
    while (n > 0) { const k = Math.min(5, n); for (let j = 0; j < Math.min(k, 4); j++) o += vline(cx + 7 * j, y + 2, cx + 7 * j, y + 24, VINK, 2.2); if (k === 5) o += vline(cx - 4, y + 20, cx + 25, y + 6, VINK, 2.2); cx += 40; n -= k; } });
  return vsvg(2.9, 1.0, o, 'Tally chart') + vQHtml(p, x);
}

/* 1.MD.C.5 (read), 2.MD.D.10 (draw): pictograph */
function visPict(rng, L) {
  const step = L === 1 ? 1 : L === 2 ? 2 : pick(rng, [2, 5]), { cats, cnt } = vdataSet(rng, L, step * 6, step), make = L === 3 && rng() < 0.6, q = vQs(cats, cnt);
  return vp('pict', make ? 'Draw the pictograph.' : 'Read the pictograph.', Object.assign({ cats, cnt, step, make, sig: `pi${cats}${cnt}${step}${make}` }, q, { ans: make ? cnt.join(' ') : `${q.tot} ${q.diff}` }), 2.9, make ? 1.25 : 1.2, make ? 2.8 : 4.5, make ? 14 : 15);
}
function visPictHtml(p, key, x) {
  let o = '';
  p.cats.forEach((c, i) => { const y = 8 + 30 * i; o += vtxt(4, y + 18, c, { a: 'start', s: 13 }) + vline(78, y + 28, 280, y + 28, '#d4dbe6', 1);
    const n = p.cnt[i] / p.step; if (!p.make || key) for (let j = 0; j < n; j++) o += vshape('circle', 92 + 30 * j, y + 14, 22, p.make ? 'none' : VFILL[i], 0, p.make ? VKEY : VINK); });
  const legend = `Each ● = ${p.step}`;
  if (p.make) return `<div style="font-size:.85em">${p.cats.map((c, i) => `${esc(c)} ${p.cnt[i]}`).join(' · ')}&emsp;${legend}</div>` + vsvg(2.9, 1.0, o, 'Empty pictograph');
  return `<div style="font-size:.85em">${legend}</div>` + vsvg(2.9, 1.0, o, 'Pictograph') + vQHtml(p, x);
}

/* 1.MD.C.5 (read), 2.MD.D.10 (draw): bar graph with a scale of one */
function visBar(rng, L) {
  const { cats, cnt } = vdataSet(rng, L, 9, 1), make = L === 3 && rng() < 0.6, q = vQs(cats, cnt);
  return vp('bar', make ? 'Draw the bar graph.' : 'Read the bar graph.', Object.assign({ cats, cnt, make, sig: `ba${cats}${cnt}${make}` }, q, { ans: make ? cnt.join(' ') : `${q.tot} ${q.diff}` }), 2.9, 1.65, make ? 2.8 : 4.5, make ? 14 : 15);
}
function visBarHtml(p, key, x) {
  const x0 = 30, y0 = 140, uh = 11.5; let o = vline(x0, y0, x0, y0 - 9 * uh - 4, VINK, 2) + vline(x0, y0, 280, y0, VINK, 2);
  for (let v = 0; v <= 9; v++) { o += vline(x0 - 4, y0 - v * uh, x0, y0 - v * uh, VINK, 1.2); if (v % 2 === 0) o += vtxt(x0 - 8, y0 - v * uh + 4, String(v), { a: 'end', s: 11 }); if (v) o += vline(x0, y0 - v * uh, 280, y0 - v * uh, '#e3e8f0', 1); }
  p.cats.forEach((c, i) => { const bx = 62 + 76 * i; o += vtxt(bx + 22, y0 + 15, c, { s: 12 }); if (!p.make || key) o += vrect(bx, y0 - p.cnt[i] * uh, 44, p.cnt[i] * uh, p.make ? 'none' : VFILL[i], { c: p.make ? VKEY : VINK, w: p.make ? 3 : 2 }); });
  const gr = vsvg(2.9, 1.65, o, 'Bar graph');
  return p.make ? `<div style="font-size:.85em">${p.cats.map((c, i) => `${esc(c)} ${p.cnt[i]}`).join(' · ')}</div>` + gr : gr + vQHtml(p, x);
}

/* 2.MD.D.9: line plot from measurement data */
function visLplot(rng, L) {
  const make = L === 3 ? rng() < 0.6 : L === 2, n = 8, data = Array.from({ length: n }, () => ri(rng, 2, 7)).sort((a, b) => a - b), ask = pick(rng, data);
  return vp('lplot', make ? 'Make a line plot of the data.' : 'Read the line plot.', { make, data, ask, ans: make ? data.join(' ') : String(data.filter(v => v === ask).length), unit: pick(rng, ['inches', 'centimeters']), sig: `lp${data}${make}${make ? '' : ask}` }, 2.9, 1.15, 3.4, 12);
}
function visLplotHtml(p, key, x) {
  const x0 = 24, sc = 36, y = 76; let o = vline(x0 - 6, y, x0 + 7 * sc + 8, y, VINK, 2);
  for (let v = 1; v <= 8; v++) { const xx = x0 + (v - 1) * sc; o += vline(xx, y - 5, xx, y + 5, VINK, 1.5) + vtxt(xx, y + 20, String(v), { s: 12 }); }
  const cnt = {}; p.data.forEach(v => { cnt[v] = (cnt[v] || 0) + 1; });
  if (!p.make || key) Object.keys(cnt).forEach(v => { for (let j = 0; j < cnt[v]; j++) o += vtxt(x0 + (v - 1) * sc, y - 12 - 16 * j, '×', { s: 17, b: 1, c: p.make ? VKEY : VINK }); });
  o += vtxt(x0 + 3.5 * sc, y + 38, p.unit, { s: 11 });
  const gr = vsvg(2.9, 1.15, o, 'Line plot');
  return p.make ? `<div style="font-size:.85em">${p.data.join(', ')}</div>` + gr : gr + `<div>How many measure ${p.ask}? ${x(p.ans, 2.2)}</div>`;
}

/* K.G.A.2, K.G.B.4, 1.G.A.1, 2.G.A.1: name shapes, circle all of a kind, count sides, draw a shape */
const V_K2D = ['circle', 'square', 'triangle', 'rectangle', 'hexagon'], V_POLYNAMES = ['triangle', 'quadrilateral', 'pentagon', 'hexagon'];
const V_SHFILL = k => VFILL[(V_K2D.concat(['rhombus', 'trapezoid', 'pentagon']).indexOf(k) + 4) % 4];
function visShname(rng, L) {
  const rot = ri(rng, 0, 359), size = ri(rng, 46, 64);
  if (L === 1) { const k = pick(rng, V_K2D), opts = shuffle(rng, V_K2D.filter(v => v !== k)).slice(0, 2).concat(k); return vp('shname', 'Name this shape.', { variant: 'k', shape: k, rot, size, opts: shuffle(rng, opts), ans: k, sig: `sn${k}${k === 'circle' ? 0 : rot}${size}` }, 3.0, 1.45, 2.8, 20); }
  const k = pick(rng, ['triangle', 'square', 'rectangle', 'rhombus', 'trapezoid', 'pentagon', 'hexagon']);
  if (L === 3 && rng() < 0.5) return vp('shname', 'How many sides does it have?', { variant: 'sides', shape: k, rot, size, ans: String(V_SIDES[k]), sig: `ss${k}${rot}` }, 2.5, 0.95, 3.4, 12);
  return vp('shname', 'What kind of polygon is this?', { variant: 'poly', shape: k, rot, size, opts: shuffle(rng, V_POLYNAMES.filter(n => n !== V_POLY[k])).slice(0, 1).concat(V_POLY[k]).sort((a, b) => V_POLYNAMES.indexOf(a) - V_POLYNAMES.indexOf(b)), ans: V_POLY[k], sig: `sp${k}${rot}${size}` }, 3.0, 1.45, 2.8, 20);
}
function visShnameHtml(p, key, x) {
  const sh = vshape(p.shape, 50, 45, p.size, V_SHFILL(p.shape), p.rot);
  if (p.variant === 'sides') return vsvg(1.0, 0.95, sh, 'A polygon') + `<div>Sides ${x(p.ans, 2)}&emsp;Corners ${x(p.ans, 2)}</div>`;
  return vsvg(1.0, 0.95, sh, 'A shape') + `<div>${vopts(p.opts, p.ans, key)}</div>`;
}
function visShall(rng, L) {
  const target = pick(rng, L === 1 ? V_K2D : ['triangle', 'quadrilateral', 'pentagon', 'hexagon']), pool = L === 1 ? V_K2D : ['triangle', 'square', 'rectangle', 'rhombus', 'trapezoid', 'pentagon', 'hexagon'];
  const isT = k => L === 1 ? k === target : V_POLY[k] === target, yes = pool.filter(isT), no = pool.filter(k => !isT(k));
  const ny = ri(rng, 2, 3), list = shuffle(rng, Array.from({ length: ny }, () => pick(rng, yes)).concat(Array.from({ length: 6 - ny }, () => pick(rng, no)))), rots = list.map(() => ri(rng, 0, 359)), sizes = list.map(() => ri(rng, 30, 44));
  return vp('shall', L === 1 ? `Circle all the ${vpl(target, 2)}.` : `Circle all the shapes with ${V_SIDES[target === 'quadrilateral' ? 'square' : target]} sides.`, { list, rots, sizes, target, ans: list.map((k, i) => isT(k) ? i : -1).filter(i => i >= 0).join(' '), sig: `sa${target}${list}${rots}` }, 2.9, 0.95, 1.9);
}
function visShallHtml(p, key) {
  const t = k => (p.target === 'quadrilateral' ? V_POLY[k] === 'quadrilateral' : k === p.target);
  let o = '';
  p.list.forEach((k, i) => { const cx = 28 + 46 * i, cy = 40; o += vshape(k, cx, cy, p.sizes[i], V_SHFILL(k), p.rots[i]); if (key && t(k)) o += vring(cx - 24, cy - 28, 48, 56); });
  return vsvg(2.9, 0.95, o, 'Six shapes');
}
const V_DRAWQ = [['circle', 'Draw a circle.'], ['square', 'Draw a square.'], ['triangle', 'Draw a triangle.'], ['rectangle', 'Draw a rectangle.'], ['hexagon', 'Draw a hexagon.']];
function visShdraw(rng, L) {
  if (L === 1) { const [k, t] = pick(rng, V_DRAWQ); return vp('shdraw', t, { shape: k, sig: `sd${k}`, ans: k }, 1.5, 1.25, 1.9); }
  const n = pick(rng, [3, 4, 5, 6]), by = rng() < 0.5 ? 'sides' : 'corners', k = { 3: 'triangle', 4: 'rectangle', 5: 'pentagon', 6: 'hexagon' }[n];
  return vp('shdraw', `Draw a shape with ${n} ${by}.`, { shape: k, n, sig: `sd${n}${by}`, ans: k }, 1.5, 1.25, 1.9);
}
function visShdrawHtml(p, key) { return vsvg(1.5, 1.25, vrect(2, 2, 146, 121, 'none', { d: '5 4', r: 8 }) + (key ? vshape(p.shape, 75, 62, 70, 'none', 0, VKEY) : ''), 'Drawing box'); }

/* K.G.A.3, K.G.B.4: flat or solid; solids that roll */
const V_SOL = ['cube', 'cylinder', 'cone', 'sphere'];
function visSolid(rng, L) {
  if (L === 1 || rng() < 0.4) { const solid = rng() < 0.5, k = solid ? pick(rng, V_SOL) : pick(rng, V_K2D);
    return vp('solid', 'Circle flat or solid.', { variant: 'dim', kind: k, solid, opts: ['flat', 'solid'], ans: solid ? 'solid' : 'flat', sig: `sl${k}` }, 2.6, 0.95, 2.8); }
  const three = shuffle(rng, V_SOL).slice(0, 3), q = pick(rng, [['has no flat faces', 'sphere'], ['has only flat faces', 'cube']]);
  if (!three.includes(q[1])) three[0] = q[1];
  const list = shuffle(rng, three);
  return vp('solid', `Circle the solid ${q[0] === 'has no flat faces' ? 'with no flat faces' : 'with only flat faces'}.`, { variant: 'pick', list, ans: String(list.indexOf(q[1])), sig: `sp${list}${q[0]}` }, 2.9, 1.1, 1.9);
}
function visSolidHtml(p, key) {
  if (p.variant === 'dim') return `<div style="display:flex;align-items:center;gap:.5em">${vsvg(0.95, 0.9, p.solid ? vsolid(p.kind, 48, 45, 66) : vshape(p.kind, 48, 45, 56, V_SHFILL(p.kind), 0), 'An object')}<div>${vopts(p.opts, p.ans, key)}</div></div>`;
  let o = p.list.map((k, i) => vsolid(k, 50 + 92 * i, 45, 66) + vtxt(50 + 92 * i, 102, V_LET[i], { b: 1, s: 12 })).join('');
  if (key) o += vring(50 + 92 * +p.ans - 40, 4, 80, 80);
  return vsvg(2.9, 1.1, o, 'Three solids');
}

/* K.G.A.1: positions */
function visPos(rng, L) {
  const three = shuffle(rng, ['circle', 'square', 'triangle']), word = pick(rng, ['above', 'below', 'between']);
  let ans, t;
  if (word === 'above') { const i = ri(rng, 1, 2); t = `Circle the shape above the ${three[i]}.`; ans = i - 1; }
  else if (word === 'below') { const i = ri(rng, 0, 1); t = `Circle the shape below the ${three[i]}.`; ans = i + 1; }
  else { t = 'Circle the shape between the other two.'; ans = 1; }
  return vp('pos', t, { three, ans: String(ans), sig: `po${three}${word}${t.length}` }, 1.2, 1.5, 1.9);
}
function visPosHtml(p, key) {
  let o = p.three.map((k, i) => vshape(k, 40, 24 + 44 * i, 34, V_SHFILL(k), 0)).join('');
  if (key) o += vring(10, 2 + 44 * +p.ans, 60, 44);
  return vsvg(0.8, 1.5, o, 'Three shapes stacked');
}

/* 1.G.A.3, 2.G.A.3: equal shares of circles and rectangles */
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

/* K.G.B.6, 1.G.A.2: composite figures built from squares and triangles */
function visComp(rng, L) {
  const cols = L === 1 ? 3 : 4, rows = 2, cells = []; let sq = 0, tr = 0;
  for (let i = 0; i < cols * rows; i++) { const r = rng(); if (r < 0.4) { cells.push(1); sq++; } else if (r < 0.75) { cells.push(2 + ri(rng, 0, 3)); tr += 2; } else cells.push(0); }
  if (!sq) { cells[0] = 1; if (cells[0] > 1) tr -= 2; sq = cells.filter(c => c === 1).length; tr = 2 * cells.filter(c => c >= 2).length; } if (!tr) { cells[cells.length - 1] = 2; sq = cells.filter(c => c === 1).length; tr = 2 * cells.filter(c => c >= 2).length; }
  return vp('comp', 'How many of each shape do you see?', { cols, rows, cells, sq, tr, ans: `${sq} ${tr}`, sig: `co${cells.map(c => c < 2 ? c : 2 + (c % 2))}` }, 2.6, rows * 0.55 + 0.1, 3.4, 12);
}
function visCompHtml(p, key, x) {
  const S = 52; let o = '';
  p.cells.forEach((c, i) => { const cx = 10 + S * (i % p.cols), cy = 6 + S * Math.floor(i / p.cols);
    if (c === 1) o += vrect(cx, cy, S, S, VFILL[1]);
    else if (c >= 2) { const d = c - 2, A = [[cx, cy], [cx + S, cy], [cx + S, cy + S], [cx, cy + S]];
      const t1 = d % 2 ? [A[0], A[1], A[2]] : [A[1], A[2], A[3]], t2 = d % 2 ? [A[0], A[2], A[3]] : [A[0], A[1], A[3]];
      o += vpoly(t1, VFILL[0], 0, 0, 0) + vpoly(t2, VFILL[2], 0, 0, 0); } });
  return vsvg(2.6, p.rows * 0.55 + 0.1, o, 'A figure made of squares and triangles') + `<div>squares ${x(p.sq, 2)}&emsp;triangles ${x(p.tr, 2)}</div>`;
}

/* 2.OA.C.4: arrays and repeated addition */
function visArray(rng, L) {
  const r = ri(rng, 2, L === 1 ? 3 : 5), c = ri(rng, 2, L === 1 ? 4 : 5);
  return vp('array', 'Write the equation for the array.', { r, c, ans: String(r * c), sig: `ar${r}x${c}` }, Math.max(c * 0.3 + 0.3, 1.5), r * 0.3 + 0.15, 3.4, r * 2.2 + 3.5);
}
function visArrayHtml(p, key, x) {
  let o = ''; for (let i = 0; i < p.r; i++) for (let j = 0; j < p.c; j++) o += vshape('circle', 20 + 30 * j, 18 + 30 * i, 22, VFILL[1], 0);
  return vsvg(p.c * 0.3 + 0.2, p.r * 0.3 + 0.15, o, `${p.r} rows of ${p.c}`) + `<div>${Array.from({ length: p.r }, () => x(p.c, 1.1)).join(' + ')} = ${x(p.r * p.c, 1.8)}</div>`;
}

/* 2.OA.D.5: patterns in hundreds charts and addition charts */
function visChart(rng, L) {
  const kind = L === 1 ? 'hund' : L === 2 ? 'add' : pick(rng, ['hund', 'add', 'rule']);
  if (kind === 'add') { const r0 = ri(rng, 0, 5), c0 = ri(rng, 0, 5), blanks = shuffle(rng, Array.from({ length: 16 }, (_, i) => i)).slice(0, 3);
    return vp('chart', 'Fill in the addition chart.', { kind, r0, c0, blanks, ans: blanks.map(b => (r0 + Math.floor(b / 4)) + (c0 + b % 4)).join(' '), sig: `ca${r0}-${c0}-${[...blanks].sort((a, b) => a - b)}` }, 2.5, 1.8, 1.9); }
  const row = ri(rng, 0, 5), col = ri(rng, 1, 6), blanks = shuffle(rng, Array.from({ length: 20 }, (_, i) => i)).slice(0, kind === 'rule' ? 0 : 4);
  if (kind === 'rule') return vp('chart', 'Look at the chart. Fill in the rule.', { kind, row, col, blanks, ans: '1 10', sig: `cr${row}${col}` }, 2.5, 1.3, 4.9, 12);
  return vp('chart', 'Fill in the missing numbers.', { kind, row, col, blanks, ans: blanks.map(b => (row + Math.floor(b / 5)) * 10 + col + b % 5).join(' '), sig: `ch${row}${col}${blanks}` }, 2.5, 1.55, 1.9);
}
function visChartHtml(p, key, x) {
  const cw = 46, ch = 30; let o = '';
  const cell = (i, j, txt, blank, head) => { const xx = 8 + cw * j, yy = 6 + ch * i; return vrect(xx, yy, cw, ch, head ? '#e8eef7' : 'none', { c: '#8d99ad', w: 1.3 }) + (blank ? (key ? vtxt(xx + cw / 2, yy + 20, String(txt), { s: 14, b: 1, c: VKEY }) : '') : vtxt(xx + cw / 2, yy + 20, String(txt), { s: 14, b: head })); };
  if (p.kind === 'add') { for (let j = 0; j < 5; j++) o += cell(0, j, j ? p.c0 + j - 1 : '+', false, true); for (let i = 1; i < 5; i++) for (let j = 0; j < 5; j++) { const b = (i - 1) * 4 + (j - 1); o += j === 0 ? cell(i, 0, p.r0 + i - 1, false, true) : cell(i, j, (p.r0 + i - 1) + (p.c0 + j - 1), p.blanks.includes(b)); } return vsvg(2.5, 1.8, o.replace(/(<rect[^>]*)(\/>)/, '$1$2'), 'Addition chart').replace('height="1.8in"', 'height="1.8in"'); }
  const rows = p.kind === 'rule' ? 4 : 4;
  for (let i = 0; i < rows; i++) for (let j = 0; j < 5; j++) { const v = (p.row + i) * 10 + p.col + j, b = i * 5 + j; o += cell(i, j, v, p.kind === 'hund' && p.blanks.includes(b)); }
  const g = vsvg(2.5, 1.3, o, 'Part of a hundreds chart').replace('height="1.55in"', 'height="1.3in"');
  return g + (p.kind === 'rule' ? `<div>Moving right adds ${x(1, 1.8)}</div><div>Moving down adds ${x(10, 1.8)}</div>` : '');
}

const VGEN_B = { sort: visSort, tally: visTally, pict: visPict, bar: visBar, lplot: visLplot, shname: visShname, shall: visShall, shdraw: visShdraw, solid: visSolid, pos: visPos, part: visPart, comp: visComp, array: visArray, chart: visChart };
const VHTML_B = { sort: visSortHtml, tally: visTallyHtml, pict: visPictHtml, bar: visBarHtml, lplot: visLplotHtml, shname: visShnameHtml, shall: visShallHtml, shdraw: visShdrawHtml, solid: visSolidHtml, pos: visPosHtml, part: visPartHtml, comp: visCompHtml, array: visArrayHtml, chart: visChartHtml };

const VGEN = Object.assign({}, VGEN_A, VGEN_B), VHTML = Object.assign({}, VHTML_A, VHTML_B), VIS_TYPES = Object.keys(VGEN);
REG.vis = {
  name: 'Shapes, Measures and Data', counts: [4, 6, 8, 12], n0: 6, on0: false,
  plan(st, n, seed) { return arithPlan(st, 'vis', genVisN(rngFrom(seed), st, n, n)); }
};
function visHtml(p, key, x) { return VHTML[p.type](p, key, x); }
function genVisN(rng, st, count, perPage) {
  const types = VIS_TYPES.filter(t => st.vis.types[t]); if (!types.length) types.push('cnt');
  const out = [], seen = new Set(); let g = 0;
  while (out.length < count && g++ < count * 60) { const p = VGEN[pick(rng, types)](rng, st.vis.level); if (seen.has(p.sig)) continue; seen.add(p.sig); out.push(p); }
  while (out.length < count) out.push(VGEN[pick(rng, types)](rng, st.vis.level));
  return out;
}
