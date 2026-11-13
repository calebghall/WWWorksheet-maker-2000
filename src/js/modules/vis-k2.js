/* ---------- Shapes, Measures and Data: kindergarten to grade 2 additions ----------
   Included after vis-b.js; merged into VGEN, VHTML and VIS_TYPES at the bottom. Same conventions as vis-a.js (100 SVG units per inch, palette tokens only,
   `sig` only from printed content, size hints win/hin/hfs/bw or ew/eh). Answer keys draw in the key color.
   patmake (K.CC.A.4), cntn (K.CC.B.5), showop (K.OA.A.1), mattr (K.MD.A.1), pos2 (K.G.A.1), shcmp (K.G.B.4), shbuild (K.G.B.5), split (K.G.B.6, 1.G.A.2),
   partw (1.G.A.3), pdraw (2.G.A.3), mtool (2.MD.A.1), mrule2 (2.MD.A.2), pict4 and bar4 (2.MD.D.10), chartwhy (2.OA.D.5). */
const VIS_K2 = ['patmake', 'cntn', 'showop', 'mattr', 'pos2', 'shcmp', 'shbuild', 'split', 'partw', 'pdraw', 'mtool', 'mrule2', 'pict4', 'bar4', 'chartwhy'];
const vtext = (type, prompt, f, ew, eh, wide) => Object.assign({ mod: 'vis', type, prompt, ew, eh, wide: !!wide }, f);

/* K.CC.A.4: make a repeating pattern in the empty boxes */
const V_PM = { AB: [0, 1], AAB: [0, 0, 1], ABB: [0, 1, 1], ABC: [0, 1, 2] };
function visPatmake(rng, L) {
  const name = L === 1 ? 'AB' : pick(rng, L === 2 ? ['AAB', 'ABB', 'AB'] : ['AAB', 'ABB', 'ABC', 'AB']), core = V_PM[name], tk = shuffle(rng, [0, 1, 2]).slice(0, name === 'ABC' ? 3 : 2);
  const seq = Array.from({ length: 8 }, (_, i) => tk[core[i % core.length]]);
  return vp('patmake', `Make an ${name} pattern.`, { name, tk, seq, ans: seq.join(''), sig: `pm${name}${tk}` }, 2.95, 0.95, 1.9);
}
function visPatmakeHtml(p, key) {
  let o = '';
  p.tk.forEach((t, i) => { o += vtxt(14 + 85 * i, 23, 'ABC'[i] + ' =', { a: 'start', s: 14, b: 1 }) + vshape(V_TOK[t].k, 70 + 85 * i, 18, 24, V_TOK[t].f, 0); });
  for (let i = 0; i < 8; i++) { o += vrect(8 + 36 * i, 46, 32, 32, 'none', { d: '4 3', r: 4 }); if (key) o += vshape(V_TOK[p.seq[i]].k, 24 + 36 * i, 62, 24, 'none', 0, VKEY); }
  return vsvg(2.95, 0.95, o, 'Legend and eight empty boxes');
}
/* K.CC.B.5: count and write the number names in order under each object */
function visCntn(rng, L) {
  const n = L === 1 ? ri(rng, 3, 8) : L === 2 ? ri(rng, 4, 10) : ri(rng, 11, 20), shape = pick(rng, ['circle', 'square', 'triangle']), fi = ri(rng, 0, 3);
  return vp('cntn', 'Count. Write a number under each one.', { n, shape, fi, ans: String(n), sig: `cn${n}${shape}${fi}` }, 2.95, Math.ceil(n / 10) * 0.72, 1.9);
}
function visCntnHtml(p, key, x) {
  let o = '';
  for (let i = 0; i < p.n; i++) { const cx = 24 + 28 * (i % 10), y0 = 72 * Math.floor(i / 10);
    o += vshape(p.shape, cx, y0 + 16, 24, VFILL[p.fi], 0) + vrect(cx - 12, y0 + 34, 24, 24, 'none', { w: 1.5 }) + (key ? vtxt(cx, y0 + 52, String(i + 1), { s: 13, b: 1, c: VKEY }) : ''); }
  return vsvg(2.95, Math.ceil(p.n / 10) * 0.72, o, `${p.n} objects, each with a box`) + `<div>How many? ${x(p.ans, 2.4)}</div>`;
}
/* K.OA.A.1: draw to show an addition or subtraction */
function visShowop(rng, L) {
  const mx = L === 1 ? 5 : 10, add = rng() < 0.55; let a, b;
  if (add) { a = ri(rng, 1, mx - 1); b = ri(rng, 1, mx - a); } else { a = ri(rng, 2, mx); b = ri(rng, 1, a - 1); }
  return vp('showop', `Draw to show ${a} ${add ? '+' : '−'} ${b}.`, { op: add ? 'add' : 'sub', a, b, ans: String(add ? a + b : a - b), sig: `sw${a}${add}${b}` }, 2.95, 0.7, 3.4);
}
function visShowopHtml(p, key, x) {
  let o = vrect(2, 2, 291, 66, 'none', { d: '5 4', r: 8 });
  if (key) for (let i = 0; i < (p.op === 'add' ? p.a + p.b : p.a); i++) { const cx = 20 + 27 * i; o += vshape('circle', cx, 35, 22, 'none', 0, VKEY); if (p.op === 'sub' && i >= p.a - p.b) o += vline(cx - 8, 27, cx + 8, 43, VKEY, 2.5) + vline(cx - 8, 43, cx + 8, 27, VKEY, 2.5); }
  return `<div style="font-size:.85em">Use fingers or objects first.</div>` + vsvg(2.95, 0.7, o, 'Drawing box') + `<div>${p.a} ${p.op === 'add' ? '+' : '−'} ${p.b} = ${x(p.ans, 2)}</div>`;
}
/* K.MD.A.1: name the attribute that is measured */
const V_ATTR = { length: 'how long it is', height: 'how tall it is', weight: 'how heavy it is' };
const V_ATTRW = [['longer', 'length'], ['longest', 'length'], ['taller', 'height'], ['tallest', 'height'], ['heavier', 'weight'], ['lighter', 'weight'], ['heaviest', 'weight'], ['lightest', 'weight']];
function visMattr(rng, L) {
  if (L === 1 || rng() < 0.5) { const k = pick(rng, Object.keys(V_ATTR)); return vtext('mattr', 'Which word tells it?', { variant: 'clue', text: V_ATTR[k], ans: k, sig: `ma${k}` }, 22, 1.1 + 1.6 * 2 + 0.2); }
  const [w, k] = pick(rng, V_ATTRW); return vtext('mattr', 'Which attribute does the word tell?', { variant: 'cmp', text: w, ans: k, sig: `mw${w}` }, 22, 1.1 + 1.6 * 2 + 0.2);
}
const visMattrHtml = (p, key) => `<div>${esc(p.text)}</div><div>${vopts(['length', 'height', 'weight'], p.ans, key)}</div>`;
/* K.G.A.1: in front of, behind, beside, next to */
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
/* K.G.B.4: count sides and corners; equal sides; solids that cannot roll */
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
/* K.G.B.5: shapes built from sticks */
function visShbuild(rng, L) {
  const n = pick(rng, L === 1 ? [3, 4] : [3, 4, 5, 6]), shape = { 3: 'triangle', 4: 'square', 5: 'pentagon', 6: 'hexagon' }[n], rot = ri(rng, 0, 2);
  return vp('shbuild', 'Count the sticks. Name the shape.', { n, shape, rot, ans: `${n} ${shape}`, sig: `sb${n}${rot}` }, 1.7, 1.05, 3.4, 12);
}
function visShbuildHtml(p, key, x) {
  const off = p.rot * 0.35 + (p.n === 4 ? Math.PI / 4 : 0), pts = vreg(p.n, 65, 52, 42, off); let o = '';
  for (let i = 0; i < p.n; i++) { const a = pts[i], b = pts[(i + 1) % p.n]; o += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="var(--wood)" stroke-width="8" stroke-linecap="round"/>`; }
  for (const a of pts) o += `<circle cx="${a[0].toFixed(1)}" cy="${a[1].toFixed(1)}" r="5.5" fill="var(--tip)" stroke="${VINK}" stroke-width="1.5"/>`;
  return vsvg(1.3, 1.05, o, 'A shape built from sticks') + `<div>Sticks ${x(p.n, 1.8)}</div><div>Shape ${x(p.shape, 5.2)}</div>`;
}
/* K.G.B.6, 1.G.A.2: draw lines to cut a figure into shapes */
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
/* 1.G.A.3: halves and fourths by name (word quarter), the whole as shares */
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
/* 2.G.A.3: draw lines to show equal shares */
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
/* 2.MD.A.1: choose the measuring tool */
const V_TOOLS = ['ruler', 'yardstick', 'meter stick', 'measuring tape'];
const V_MT = [['the length of a pencil', 'ruler'], ['the width of a book', 'ruler'], ['the length of a crayon', 'ruler'], ['a paper clip, in centimeters', 'ruler'],
  ['the width of a door, in feet', 'yardstick'], ['the length of a table, in feet', 'yardstick'], ['a bulletin board, in yards', 'yardstick'],
  ['the length of a hallway, in meters', 'meter stick'], ['the height of a bookcase, in meters', 'meter stick'], ['a wall of the gym, in meters', 'meter stick'],
  ['the distance around a pumpkin', 'measuring tape'], ['the distance around your head', 'measuring tape'], ['the distance around a tree trunk', 'measuring tape']];
function visMtool(rng) {
  const [text, tool] = pick(rng, V_MT), others = tool === 'measuring tape' ? V_TOOLS.filter(t => t !== tool) : V_TOOLS.filter(t => t !== tool && t !== 'measuring tape');
  const opts = shuffle(rng, [tool].concat(shuffle(rng, others).slice(0, 2)));
  return vtext('mtool', 'Circle the best tool to use.', { text, opts, ans: tool, sig: `mt${text}${opts}` }, 21, 1.1 + 2 * 1.45 + 2 * 1.7 + 0.6, true);
}
const visMtoolHtml = (p, key) => `<div class="wt">Measure ${esc(p.text)}.</div><div>${vopts(p.opts, p.ans, key)}</div>`;
/* 2.MD.A.2: measure the same object in inches and in centimeters */
function visMrule2(rng) {
  const n = ri(rng, 2, 9), obj = pick(rng, V_OBJ);
  return vp('mrule2', `How long is the ${obj}?`, { n, obj, cm: Math.round(n * 2.54), ans: `${n} ${Math.round(n * 2.54)}`, sig: `mr${n}${obj}` }, 3.3, 0.92, 4.9, 19);
}
function visMrule2Html(p, key, x) {
  const x0 = 12, S = 23, w = 12 * S; let o = vrect(x0, 4, p.n * S, 20, VFILL[3]) + vpoly([[x0 + p.n * S, 4], [x0 + p.n * S + 16, 14], [x0 + p.n * S, 24]], 'var(--tip)', 0, 0, 0);
  o += vrect(x0, 34, w, 50, 'var(--ruler)');
  for (let i = 0; i <= 12; i++) o += vline(x0 + i * S, 34, x0 + i * S, 46, VINK, 1.5) + vtxt(x0 + i * S, 59, String(i), { s: 10 });
  for (let c = 0; c <= 30; c++) { const xx = x0 + c * S / 2.54; if (xx > x0 + w + 0.5) break; o += vline(xx.toFixed(1), 84, xx.toFixed(1), c % 5 ? 77 : 74, VINK, 1.2); if (c % 5 === 0) o += vtxt(xx.toFixed(1), 72, String(c), { s: 9 }); }
  o += vtxt(x0 + w + 6, 46, 'in', { a: 'start', s: 10 }) + vtxt(x0 + w + 6, 82, 'cm', { a: 'start', s: 10 });
  return vsvg(3.1, 0.92, o, 'Object above a ruler with inches and centimeters') + `<div>${x(p.n, 1.8)} inches&ensp;about ${x(p.cm, 1.8)} centimeters</div><div>Which number is greater?</div><div>${vopts(['inches', 'centimeters'], 'centimeters', key)}</div>`;
}
/* 2.MD.D.10: picture graph and bar graph with four categories (picture symbols worth 1, 2, 5 or 10; bar scale of one) */
const V_CATS4 = [['Cats', 'Dogs', 'Fish', 'Birds'], ['Apples', 'Pears', 'Plums', 'Grapes'], ['Soccer', 'Tennis', 'Chess', 'Swim'], ['Red', 'Blue', 'Green', 'Yellow'], ['Rain', 'Sun', 'Cloud', 'Snow'], ['Pizza', 'Tacos', 'Soup', 'Salad']];
function visPict4(rng, L) {
  const step = pick(rng, L === 1 ? [1, 2] : L === 2 ? [1, 2, 5] : [2, 5, 10]), cats = pick(rng, V_CATS4).slice(), cnt = shuffle(rng, [1, 2, 3, 4, 5, 6].map(i => i * step)).slice(0, 4), make = L === 3 && rng() < 0.6, q = vQs(cats, cnt);
  return vp('pict4', make ? 'Draw the pictograph.' : 'Read the pictograph.', Object.assign({ cats, cnt, step, make, sig: `p4${cats}${cnt}${step}${make}` }, q, { ans: make ? cnt.join(' ') : `${q.tot} ${q.diff}` }), 2.9, 1.3, make ? 2.8 : 4.5, make ? 14 : 15);
}
function visPict4Html(p, key, x) {
  let o = '';
  p.cats.forEach((c, i) => { const y = 8 + 30 * i; o += vtxt(4, y + 18, c, { a: 'start', s: 13 }) + vline(78, y + 28, 280, y + 28, '#d4dbe6', 1);
    const n = p.cnt[i] / p.step; if (!p.make || key) for (let j = 0; j < n; j++) o += vshape('circle', 92 + 30 * j, y + 14, 22, p.make ? 'none' : VFILL[i], 0, p.make ? VKEY : VINK); });
  const legend = `Each ● = ${p.step}`, g = vsvg(2.9, 1.3, o, 'Pictograph');
  return p.make ? `<div style="font-size:.85em">${p.cats.map((c, i) => `${esc(c)} ${p.cnt[i]}`).join(' · ')}&emsp;${legend}</div>` + g : `<div style="font-size:.85em">${legend}</div>` + g + vQHtml(p, x);
}
function visBar4(rng, L) {
  const cats = pick(rng, V_CATS4).slice(), cnt = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4), make = L === 3 && rng() < 0.6, q = vQs(cats, cnt);
  return vp('bar4', make ? 'Draw the bar graph.' : 'Read the bar graph.', Object.assign({ cats, cnt, make, sig: `b4${cats}${cnt}${make}` }, q, { ans: make ? cnt.join(' ') : `${q.tot} ${q.diff}` }), 2.9, 1.65, make ? 2.8 : 4.5, make ? 14 : 15);
}
function visBar4Html(p, key, x) {
  const x0 = 30, y0 = 140, uh = 11.5; let o = vline(x0, y0, x0, y0 - 9 * uh - 4, VINK, 2) + vline(x0, y0, 280, y0, VINK, 2);
  for (let v = 0; v <= 9; v++) { o += vline(x0 - 4, y0 - v * uh, x0, y0 - v * uh, VINK, 1.2) + vtxt(x0 - 7, y0 - v * uh + 3.5, String(v), { a: 'end', s: 10 }); if (v) o += vline(x0, y0 - v * uh, 280, y0 - v * uh, '#e3e8f0', 1); }
  p.cats.forEach((c, i) => { const bx = 50 + 58 * i; o += vtxt(bx + 20, y0 + 15, c, { s: 11 }); if (!p.make || key) o += vrect(bx, y0 - p.cnt[i] * uh, 40, p.cnt[i] * uh, p.make ? 'none' : VFILL[i], { c: p.make ? VKEY : VINK, w: p.make ? 3 : 2 }); });
  const gr = vsvg(2.9, 1.65, o, 'Bar graph');
  return p.make ? `<div style="font-size:.85em">${p.cats.map((c, i) => `${esc(c)} ${p.cnt[i]}`).join(' · ')}</div>` + gr : gr + vQHtml(p, x);
}
/* 2.OA.D.5: why does the chart pattern work? Choose the property. */
function visChartwhy(rng) {
  const kind = pick(rng, ['comm', 'zero', 'plus1']), r0 = kind === 'zero' ? 0 : ri(rng, 0, 4);
  let cells, q, ans;
  if (kind === 'comm') { const i = ri(rng, 1, 3), j = ri(rng, 0, i - 1); cells = [[i, j], [j, i]]; q = 'Why are the shaded numbers the same?'; ans = 'any order'; }
  else if (kind === 'zero') { const i = 0; cells = [0, 1, 2, 3].map(j => [i, j]); q = 'Why is the shaded row like the top row?'; ans = 'adding 0'; }
  else { const i = ri(rng, 0, 3), j = ri(rng, 0, 2); cells = [[i, j], [i, j + 1]]; q = 'Why does the shaded number go up by 1?'; ans = 'adding 1'; }
  return vp('chartwhy', 'Why? Circle the best reason.', { kind, r0, cells, q, ans, sig: `cw${kind}${r0}${cells}` }, 3.3, 1.5, 4.9, 24);
}
function visChartwhyHtml(p, key) {
  const cw = 46, ch = 30; let o = '';
  const cell = (i, j, txt, head, shade) => { const xx = 8 + cw * j, yy = 6 + ch * i; return vrect(xx, yy, cw, ch, head ? '#e8eef7' : shade ? VFILL[0] : 'none', { c: '#8d99ad', w: 1.3 }) + vtxt(xx + cw / 2, yy + 20, String(txt), { s: 14, b: head }); };
  for (let j = 0; j < 5; j++) o += cell(0, j, j ? p.r0 + j - 1 : '+', true);
  for (let i = 1; i < 5; i++) for (let j = 0; j < 5; j++) o += j === 0 ? cell(i, 0, p.r0 + i - 1, true) : cell(i, j, (p.r0 + i - 1) + (p.r0 + j - 1), false, p.cells.some(c => c[0] === i - 1 && c[1] === j - 1));
  return vsvg(2.5, 1.55, o, 'Addition chart with shaded cells') + `<div>${esc(p.q)}</div><div>${vopts(['any order', 'adding 0', 'adding 1'], p.ans, key)}</div>`;
}

Object.assign(VGEN, { patmake: visPatmake, cntn: visCntn, showop: visShowop, mattr: visMattr, pos2: visPos2, shcmp: visShcmp, shbuild: visShbuild, split: visSplit, partw: visPartw, pdraw: visPdraw, mtool: visMtool, mrule2: visMrule2, pict4: visPict4, bar4: visBar4, chartwhy: visChartwhy });
Object.assign(VHTML, { patmake: visPatmakeHtml, cntn: visCntnHtml, showop: visShowopHtml, mattr: visMattrHtml, pos2: visPos2Html, shcmp: visShcmpHtml, shbuild: visShbuildHtml, split: visSplitHtml, partw: visPartwHtml, pdraw: visPdrawHtml, mtool: visMtoolHtml, mrule2: visMrule2Html, pict4: visPict4Html, bar4: visBar4Html, chartwhy: visChartwhyHtml });
VIS_TYPES.push(...VIS_K2);
