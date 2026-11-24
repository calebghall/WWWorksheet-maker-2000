/* ---------- Shapes, Measures and Data: shapes and solids ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

/* Flat shapes. s = size in units. Polygons name their side counts in V_SIDES. */
const V_SIDES = { triangle: 3, square: 4, rectangle: 4, rhombus: 4, trapezoid: 4, pentagon: 5, hexagon: 6 };

const V_POLY = { triangle: 'triangle', square: 'quadrilateral', rectangle: 'quadrilateral', rhombus: 'quadrilateral', trapezoid: 'quadrilateral', pentagon: 'pentagon', hexagon: 'hexagon' };

/* Solids: cube, cylinder, cone, sphere. */
function vsolid(k, cx, cy, s) {
  const r = s / 2, st = `stroke="${VINK}" stroke-width="2" stroke-linejoin="round"`;
  if (k === 'cube') { const a = s * .62, d = s * .26, x = cx - a / 2 - d / 2, y = cy - a / 2 + d / 2;
    return `<polygon points="${x},${y} ${x + d},${y - d} ${x + a + d},${y - d} ${x + a},${y}" fill="${VFILL[1]}" ${st}/><polygon points="${x + a},${y} ${x + a + d},${y - d} ${x + a + d},${y + a - d} ${x + a},${y + a}" fill="var(--c1d)" ${st}/><rect x="${x}" y="${y}" width="${a}" height="${a}" fill="${VFILL[1]}" ${st}/>`; }
  if (k === 'cylinder') { const rx = r * .7, ry = r * .22, h = s * .8, t = cy - h / 2 + ry;
    return `<path d="M${cx - rx} ${t}V${t + h - 2 * ry}A${rx} ${ry} 0 0 0 ${cx + rx} ${t + h - 2 * ry}V${t}" fill="${VFILL[3]}" ${st}/><ellipse cx="${cx}" cy="${t}" rx="${rx}" ry="${ry}" fill="var(--c3l)" ${st}/>`; }
  if (k === 'cone') { const rx = r * .7, ry = r * .22, b = cy + s * .35 - ry;
    return `<path d="M${cx} ${cy - s * .42}L${cx + rx} ${b}A${rx} ${ry} 0 0 1 ${cx - rx} ${b}Z" fill="${VFILL[0]}" ${st}/>`; }
  return `<circle cx="${cx}" cy="${cy}" r="${r * .85}" fill="${VFILL[2]}" ${st}/><path d="M${cx - r * .5} ${cy - r * .35}A${r * .6} ${r * .6} 0 0 1 ${cx - r * .1} ${cy - r * .65}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
}

/* ,: name shapes, circle all of a kind, count sides, draw a shape */
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

/*: flat or solid; solids that roll */
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

/* positions */
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

/*: composite figures built from squares and triangles */
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

/* in front of, behind, beside, next to */
function visPos2(rng) {
  const word = pick(rng, ['behind', 'in front of', 'beside', 'next to']), order = shuffle(rng, ['front', 'behind', 'beside']), want = word === 'in front of' ? 'front' : word === 'behind' ? 'behind' : 'beside';
  return vp('pos2', `Circle: the ball is ${word} the box.`, { word, order, ans: String(order.indexOf(want)), sig: `p2${word}${order}` }, 2.95, 1.0, 1.9);
}

function visPos2Html(p, key) {
  const box = (x, y) => vrect(x, y, 40, 40, VFILL[1]), ball = (x, y) => `<circle cx="${x}" cy="${y}" r="14" fill="${VFILL[0]}" stroke="${VINK}" stroke-width="2"/>`;
  let o = '';
  p.order.forEach((k, i) => { const cx = 50 + 98 * i;
    o += vrect(cx - 44, 4, 88, 88, 'none', { c: 'var(--grid2)', w: 1.2, d: '4 3', r: 6 });
    o += k === 'front' ? box(cx - 20, 14) + ball(cx + 10, 58) : k === 'behind' ? ball(cx - 8, 30) + box(cx - 12, 36) : box(cx - 36, 30) + ball(cx + 24, 56);
    if (key && i === +p.ans) o += vring(cx - 46, 2, 92, 92); });
  return vsvg(2.95, 1.0, o, 'Three pictures of a ball and a box');
}

/* count sides and corners; equal sides; solids that cannot roll */
const V_EQSIDES = { square: 'yes', rectangle: 'no', hexagon: 'yes', pentagon: 'yes', rhombus: 'yes', trapezoid: 'no' };

function visShcmp(rng, L) {
  const v = pick(rng, L === 1 ? ['counts', 'equal'] : ['counts', 'equal', 'roll']);
  if (v === 'counts') { const k = pick(rng, ['triangle', 'square', 'rectangle', 'pentagon', 'hexagon']); return vp('shcmp', 'Count the sides and corners.', { variant: v, shape: k, n: V_SIDES[k], ans: `${V_SIDES[k]} ${V_SIDES[k]}`, sig: `sc${k}` }, 2.4, 0.95, 3.4); }
  if (v === 'equal') { const k = pick(rng, Object.keys(V_EQSIDES)); return vp('shcmp', 'Are all the sides the same length?', { variant: v, shape: k, ans: V_EQSIDES[k], sig: `se${k}` }, 2.6, 0.95, 1.9); }
  const list = shuffle(rng, shuffle(rng, ['sphere', 'cylinder', 'cone']).slice(0, 2).concat('cube'));
  return vp('shcmp', 'Circle the solid that cannot roll.', { variant: v, list, ans: String(list.indexOf('cube')), sig: `sr${list}` }, 2.9, 1.1, 1.9);
}

function visShcmpHtml(p, key, x) {
  if (p.variant === 'counts') return vsvg(1.2, 0.95, vshape(p.shape, 60, 48, 66, V_SHFILL(p.shape), 0), 'A flat shape') + `<div>sides ${x(p.n, 1.8)}&ensp;corners ${x(p.n, 1.8)}</div>`;
  if (p.variant === 'equal') return `<div style="display:flex;align-items:center;gap:.5em">${vsvg(1.2, 0.95, vshape(p.shape, 60, 48, 66, V_SHFILL(p.shape), 0), 'A flat shape')}<div>${vopts(['yes', 'no'], p.ans, key)}</div></div>`;
  let o = p.list.map((k, i) => vsolid(k, 50 + 92 * i, 45, 66) + vtxt(50 + 92 * i, 102, V_LET[i], { b: 1, s: 12 })).join('');
  if (key) o += vring(50 + 92 * +p.ans - 40, 4, 80, 80);
  return vsvg(2.9, 1.1, o, 'Three solids');
}

/* shapes built from sticks */
function visShbuild(rng, L) {
  const n = pick(rng, L === 1 ? [3, 4] : [3, 4, 5, 6]), shape = { 3: 'triangle', 4: 'square', 5: 'pentagon', 6: 'hexagon' }[n], rot = ri(rng, 0, 2);
  return vp('shbuild', 'Count the sticks. Name the shape.', { n, shape, rot, ans: `${n} ${shape}`, sig: `sb${n}${rot}` }, 1.7, 1.05, 4.5, 12);
}

function visShbuildHtml(p, key, x) {
  const off = p.rot * 0.35 + (p.n === 4 ? Math.PI / 4 : 0), pts = vreg(p.n, 65, 52, 42, off); let o = '';
  for (let i = 0; i < p.n; i++) { const a = pts[i], b = pts[(i + 1) % p.n]; o += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="var(--wood)" stroke-width="8" stroke-linecap="round"/>`; }
  for (const a of pts) o += `<circle cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="5.5" fill="var(--tip)" stroke="${VINK}" stroke-width="1.5"/>`;
  return vsvg(1.3, 1.05, o, 'A shape built from sticks') + `<div>Sticks ${x(p.n, 1.8)}</div><div>Shape ${x(p.shape, 5.2)}</div>`;
}

/*: draw lines to cut a figure into shapes */
const V_SPLITS = [
  { id: 'sq2t', fig: 'sq', lines: 1, n: 2, piece: 'triangles', L: 1 }, { id: 're2t', fig: 're', lines: 1, n: 2, piece: 'triangles', L: 1 },
  { id: 'sq2r', fig: 'sq', lines: 1, n: 2, piece: 'rectangles', L: 1 }, { id: 're2s', fig: 're', lines: 1, n: 2, piece: 'squares', L: 1 },
  { id: 'hx2t', fig: 'hx', lines: 1, n: 2, piece: 'trapezoids', L: 2 }, { id: 'sq4s', fig: 'sq', lines: 2, n: 4, piece: 'squares', L: 2 }, { id: 're3s', fig: 'r3', lines: 2, n: 3, piece: 'squares', L: 2 }
];

function vsplitGeom(id, ori) {
  const cx = 85, cy = 55, wide = ori === 0;
  const box = (w, h) => [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
  let b, cuts;
  switch (id) {
    case 'sq2t': b = box(80, 80); cuts = [[b[0], b[1], b[2], b[3]]]; break;
    case 'sq2r': b = box(80, 80); cuts = [[cx, b[1], cx, b[3]]]; break;
    case 'sq4s': b = box(84, 84); cuts = [[cx, b[1], cx, b[3]], [b[0], cy, b[2], cy]]; break;
    case 're2t': b = wide ? box(110, 64) : box(64, 110); cuts = [[b[0], b[1], b[2], b[3]]]; break;
    case 're2s': b = wide ? box(100, 50) : box(50, 100); cuts = wide ? [[cx, b[1], cx, b[3]]] : [[b[0], cy, b[2], cy]]; break;
    case 're3s': b = box(150, 50); cuts = [[b[0] + 50, b[1], b[0] + 50, b[3]], [b[0] + 100, b[1], b[0] + 100, b[3]]]; break;
    default: { const pts = vreg(6, cx, cy, 46, 0); return { pts, cuts: [[pts[0][0], pts[0][1], pts[3][0], pts[3][1]]] }; }
  }
  return { pts: [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]], cuts };
}

function visSplit(rng, L) {
  const k = pick(rng, V_SPLITS.filter(s => s.L <= L)), ori = ['re', 'r3'].includes(k.fig) && k.id !== 're3s' ? ri(rng, 0, 1) : 0;
  return vp('split', `Draw ${k.lines} line${k.lines > 1 ? 's' : ''} to make ${k.n} ${k.piece}.`, { id: k.id, ori, lines: k.lines, n: k.n, piece: k.piece, cuts: vsplitGeom(k.id, ori).cuts, ans: k.id, sig: `sp${k.id}${ori}` }, 1.8, 1.1, 1.9);
}

function visSplitHtml(p, key) {
  const g = vsplitGeom(p.id, p.ori); let o = vpoly(g.pts, '#fff', 0, 0, 0);
  if (key) for (const c of g.cuts) o += vline(c[0], c[1], c[2], c[3], VKEY, 3.5);
  return vsvg(1.7, 1.1, o, 'A figure to cut into shapes');
}

/* -----: quadrilaterals and their subcategories ----- */
const G3_SH = { square: ['quad', 'rect', 'rhom', 'sq'], rectangle: ['quad', 'rect'], rhombus: ['quad', 'rhom'], trapezoid: ['quad'], triangle: [], pentagon: [], hexagon: [], circle: [] };

const G3_CATN = { quad: 'quadrilateral', rect: 'rectangle', rhom: 'rhombus', sq: 'square' };

const G3_BOTH = [{ q: 'Circle the shape that is a rhombus and a rectangle.', t: s => G3_SH[s].includes('rhom') && G3_SH[s].includes('rect'), L: 2 }, { q: 'Circle the quadrilateral that is not a rectangle or a rhombus.', t: s => G3_SH[s].includes('quad') && !G3_SH[s].includes('rect') && !G3_SH[s].includes('rhom'), L: 2 }, { q: 'Circle the rectangle that is not a square.', t: s => G3_SH[s].includes('rect') && !G3_SH[s].includes('sq'), L: 3 }];

const G3_QUAD = ['square', 'rectangle', 'rhombus', 'trapezoid'];

function g3Gcat(rng, L) {
  const v = pick(rng, L === 1 ? ['is', 'group'] : L === 2 ? ['is', 'both', 'group'] : ['is', 'both', 'is']);
  if (v === 'is') { const shape = pick(rng, L === 1 ? ['square', 'rectangle', 'rhombus', 'trapezoid', 'triangle', 'pentagon', 'hexagon'] : Object.keys(G3_SH)), cat = pick(rng, L === 1 ? ['quad'] : L === 2 ? ['quad', 'rect'] : ['quad', 'rect', 'rhom', 'sq']), rot = pick(rng, [0, 0, 15, 30, 45]) * (shape === 'circle' ? 0 : 1);
    return vp('gcat', `Is this shape a ${G3_CATN[cat]}?`, { variant: v, shape, cat, rot, ans: G3_SH[shape].includes(cat) ? 'yes' : 'no', sig: `gi${shape}${cat}${rot}` }, 2.6, 0.95, 1.9); }
  if (v === 'both') { const k = pick(rng, G3_BOTH.filter(b => b.L <= L)), list = shuffle(rng, G3_QUAD), ans = list.findIndex(k.t);
    return vp('gcat', 'Circle the shape.', { variant: v, q: k.q, list, ans: String(ans), sig: `gb${k.q.length}${list}` }, 3.0, 1.0 + Math.max(0, vwrapH(k.q, 3.0) - 0.3), 4.9, 24); }
  const list = shuffle(rng, G3_QUAD).slice(0, 3), opts = shuffle(rng, ['quadrilaterals', 'rectangles', 'rhombuses']);
  return vp('gcat', 'Name the group.', { variant: v, list, opts, ans: 'quadrilaterals', sig: `gg${list}${opts}` }, 2.7, 0.9, 4.9, 20);
}

function g3GcatHtml(p, key, x) {
  const fl = k => vshape(k, 0, 0, 44, V_SHFILL(k), 0);
  if (p.variant === 'is') return `<div style="display:flex;align-items:center;gap:.5em">${vsvg(1.2, 0.95, vshape(p.shape, 60, 48, 62, V_SHFILL(p.shape), p.rot), 'A shape')}<div>${vopts(['yes', 'no'], p.ans, key)}</div></div>`;
  if (p.variant === 'both') { let o = p.list.map((k, i) => vshape(k, 40 + 72 * i, 50, 44, V_SHFILL(k), 0)).join(''); if (key) o += vring(40 + 72 * +p.ans - 36, 12, 72, 76); return vwrap(p.q, 3.0) + vsvg(3.0, 1.0, o, 'Four shapes'); }
  return vsvg(2.7, 0.9, p.list.map((k, i) => vshape(k, 45 + 90 * i, 45, 46, V_SHFILL(k), 0)).join(''), 'Three shapes') + `<div>These shapes are all</div><div>${vopts(p.opts, p.ans, key)}</div>`;
}

/* -----: is it a polygon? ----- */
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

defTypes("vis", "Shapes and solids", [
  { id: "shname", label: "Name shapes", blurb: "Names, sides and corners.", on: true, gen: visShname, html: visShnameHtml },
  { id: "shall", label: "Circle all of a shape", blurb: "Shapes of different sizes and turns.", on: true, gen: visShall, html: visShallHtml },
  { id: "shdraw", label: "Draw a shape", blurb: "Draw a named shape or one with given sides.", on: false, gen: visShdraw, html: visShdrawHtml },
  { id: "solid", label: "Flat and solid", blurb: "Flat shapes versus solids.", on: false, gen: visSolid, html: visSolidHtml },
  { id: "pos", label: "Positions", blurb: "Above, below, between.", on: false, gen: visPos, html: visPosHtml },
  { id: "pos2", label: "Position words, more", blurb: "In front of, behind, beside, next to.", on: false, gen: visPos2, html: visPos2Html },
  { id: "shcmp", label: "Compare shapes", blurb: "Sides and corners, equal sides, solids that cannot roll.", on: false, gen: visShcmp, html: visShcmpHtml },
  { id: "shbuild", label: "Shapes from sticks", blurb: "Count the sticks and name the shape.", on: false, gen: visShbuild, html: visShbuildHtml },
  { id: "comp", label: "Composite figures", blurb: "Count squares and triangles in a figure.", on: false, gen: visComp, html: visCompHtml },
  { id: "split", label: "Cut a figure into shapes", blurb: "Draw lines to make triangles, squares or trapezoids.", on: false, gen: visSplit, html: visSplitHtml },
  { id: "gcat", label: "Quadrilateral categories", blurb: "Rectangles, rhombuses, squares and larger groups.", on: false, gen: g3Gcat, html: g3GcatHtml },
  { id: "gpoly", label: "Is it a polygon?", blurb: "Choose the polygons among closed, open and curved figures.", on: false, gen: g3Gpoly, html: g3GpolyHtml }
]);
