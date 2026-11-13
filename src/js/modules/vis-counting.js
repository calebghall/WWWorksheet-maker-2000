/* ---------- Shapes, Measures and Data: counting and arrays ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

const VNUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

/* -----,: counting objects in a line, array, circle or scatter; draw a number of objects; write a number word as a numeral ----- */
function vcPos(rng, kind, n) {
  if (kind === 'line') { const rows = Math.ceil(n / 10); return { w: 2.95, h: rows === 1 ? 0.55 : 0.95, s: 24, pts: Array.from({ length: n }, (_, i) => [24 + 28 * (i % 10), 28 + 40 * Math.floor(i / 10)]) }; }
  if (kind === 'array') { let c = [2, 3, 4, 5].filter(v => n % v === 0 && n / v >= 2 && n / v <= 5); const cols = c.length ? Math.max(...c) : 5, rows = Math.ceil(n / cols);
    return { w: cols * 0.38 + 0.2, h: rows * 0.38 + 0.2, s: 26, pts: Array.from({ length: n }, (_, i) => [29 + 38 * (i % cols), 29 + 38 * Math.floor(i / cols)]) }; }
  if (kind === 'circle') { const R = 62, s = Math.min(28, Math.floor(2 * Math.PI * R * 0.78 / n)); return { w: 1.5, h: 1.5, s, pts: Array.from({ length: n }, (_, i) => [75 + R * Math.sin(2 * Math.PI * i / n), 75 - R * Math.cos(2 * Math.PI * i / n)]) }; }
  const pts = []; let g = 0;
  while (pts.length < n && g++ < 4000) { const p = [ri(rng, 22, 238), ri(rng, 22, 88)]; if (pts.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) >= 38)) pts.push(p); }
  return { w: 2.6, h: 1.1, s: 24, pts: pts.length === n ? pts : Array.from({ length: n }, (_, i) => [24 + 40 * (i % 6), 28 + 40 * Math.floor(i / 6)]) };
}

function visCnt(rng, L) {
  const variant = L === 3 ? pick(rng, ['count', 'count', 'draw', 'word']) : L === 2 ? pick(rng, ['count', 'count', 'count', 'draw']) : 'count', shape = pick(rng, ['circle', 'square', 'triangle']), fill = pick(rng, VFILL);
  if (variant === 'word') { const n = ri(rng, 0, 20); return vp('cnt', 'Write the number.', { variant, n, shape, fill, ans: String(n), sig: `cw${n}` }, 2.2, 0.3, 3.6, 8); }
  if (variant === 'draw') { const n = ri(rng, 1, 20), P = vcPos(rng, 'line', n); return vp('cnt', `Draw ${n} ${vpl(shape, n)}.`, { variant, n, shape, fill, kind: 'line', pts: P.pts, bw: 0, sig: `cd${n}${shape}`, bh: P.h, ans: String(n) }, 2.95, P.h, 1.9); }
  const kinds = L === 1 ? ['line', 'scatter'] : ['line', 'array', 'circle', 'scatter'], kind = pick(rng, kinds);
  const n = kind === 'array' ? pick(rng, [4, 6, 8, 9, 10, 12, 15, 16, 20]) : kind === 'scatter' || L === 1 ? ri(rng, 1, 10) : ri(rng, 6, 20), P = vcPos(rng, kind, n);
  return vp('cnt', 'How many?', { variant, n, shape, fill, kind, pts: P.pts, s: P.s, ans: String(n), sig: `cc${kind}${n}${shape}${P.pts.length}${P.pts[P.pts.length - 1]}` }, Math.max(P.w, 2.2), P.h, 3.4, 8);
}

function visCntHtml(p, key, x) {
  if (p.variant === 'word') return `<div style="font-size:1.25em;margin:.2em 0">${VNUMW[p.n]}</div><div>${x(p.ans, 2.6)}</div>`;
  if (p.variant === 'draw') {
    const rows = Math.ceil(p.n / 10), h = p.bh, ink = key ? p.pts.map(q => vshape(p.shape, q[0], q[1], 24, 'none', 0, VKEY)).join('') : '';
    return vsvg(2.95, h, vrect(2, 2, 291, h * 100 - 4, 'none', { d: '5 4', r: 8 }) + ink, 'Drawing box');
  }
  const o = p.pts.map(q => vshape(p.shape, q[0], q[1], p.s, p.fill, 0)).join(''), w = p.kind === 'line' ? 2.95 : p.kind === 'array' ? p.pts.reduce((a, q) => Math.max(a, q[0]), 0) / 100 + 0.29 : p.kind === 'circle' ? 1.5 : 2.6;
  return vsvg(w, p.hin, o, `${p.n} objects`) + `<div>${x(p.ans, 2.6)}</div>`;
}

/* -----: show addition and subtraction with pictures ----- */
function visPicop(rng, L) {
  const mx = L === 1 ? 5 : 10;
  if (rng() < 0.55) { const a = ri(rng, 1, mx - 1), b = ri(rng, 1, mx - a);
    return vp('picop', 'Write the equation for the picture.', { op: 'add', a, b, ans: String(a + b), sig: `pa${a}+${b}` }, Math.max((a + b) * 0.26 + 0.7, 2.4), 0.5, 3.4, 9); }
  const n = ri(rng, 2, mx), k = ri(rng, 1, n - 1);
  return vp('picop', 'Write the equation for the picture.', { op: 'sub', a: n, b: k, ans: String(n - k), sig: `ps${n}-${k}` }, Math.max(n * 0.26 + 0.4, 2.4), 0.5, 3.4, 9);
}

function visPicopHtml(p, key, x) {
  let o = '', w;
  if (p.op === 'add') { for (let i = 0; i < p.a; i++) o += vshape('circle', 16 + 26 * i, 25, 22, VFILL[0]); const g = 16 + 26 * p.a + 12; for (let i = 0; i < p.b; i++) o += vshape('square', g + 26 * i, 25, 20, VFILL[1]); w = (g + 26 * p.b) / 100 + 0.1; }
  else { for (let i = 0; i < p.a; i++) { o += vshape('circle', 16 + 26 * i, 25, 22, VFILL[0]); if (i >= p.a - p.b) o += vline(7 + 26 * i, 16, 25 + 26 * i, 34, VINK, 2.5) + vline(25 + 26 * i, 16, 7 + 26 * i, 34, VINK, 2.5); } w = (16 + 26 * p.a) / 100 + 0.1; }
  const sign = p.op === 'add' ? '+' : '−', res = p.op === 'add' ? p.a + p.b : p.a - p.b;
  return vsvg(w, 0.5, o, 'Picture') + `<div>${x(p.a, 1.8)} ${sign} ${x(p.b, 1.8)} = ${x(res, 1.8)}</div>`;
}

/* arrays and repeated addition */
function visArray(rng, L) {
  const r = ri(rng, 2, L === 1 ? 3 : 5), c = ri(rng, 2, L === 1 ? 4 : 5);
  return vp('array', 'Write the equation for the array.', { r, c, ans: String(r * c), sig: `ar${r}x${c}` }, Math.max(c * 0.3 + 0.3, 1.5), r * 0.3 + 0.15, 3.4, r * 2.2 + 3.5);
}

function visArrayHtml(p, key, x) {
  let o = ''; for (let i = 0; i < p.r; i++) for (let j = 0; j < p.c; j++) o += vshape('circle', 20 + 30 * j, 18 + 30 * i, 22, VFILL[1], 0);
  return vsvg(p.c * 0.3 + 0.2, p.r * 0.3 + 0.15, o, `${p.r} rows of ${p.c}`) + `<div>${Array.from({ length: p.r }, () => x(p.c, 1.1)).join(' + ')} = ${x(p.r * p.c, 1.8)}</div>`;
}

/* count and write the number names in order under each object */
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

/* draw to show an addition or subtraction */
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

/* -----: interpret factors and products (groups of objects, equal strings) ----- */
const G3_GRP = [['bag', 'bags', 'apple', 'apples'], ['box', 'boxes', 'crayon', 'crayons'], ['vase', 'vases', 'flower', 'flowers'], ['plate', 'plates', 'cookie', 'cookies'], ['jar', 'jars', 'marble', 'marbles'], ['shelf', 'shelves', 'book', 'books']];

const G3_ROLE = ['groups', 'in each group', 'in all'];

/* a boxes with b dots each, wrapped to at most about 3 inches. */
function g3Groups(a, b) {
  const dc = b <= 3 ? b : Math.ceil(b / 2), dr = b <= 3 ? 1 : 2, w = dc * 14 + 8, h = dr * 14 + 8, per = Math.max(1, Math.floor(300 / (w + 8))), rows = Math.ceil(a / per);
  return { dc, w, h, per, rows, W: Math.min(a, per) * (w + 8) + 4, H: rows * (h + 8) + 4 };
}

function g3Mfac(rng, L) {
  const v = pick(rng, L === 1 ? ['pic', 'mean'] : ['pic', 'mean', 'name']);
  if (v === 'pic') {
    const a = ri(rng, 2, L === 1 ? 4 : 6), b = ri(rng, 2, L === 1 ? 5 : 6), fi = ri(rng, 0, 3), G = g3Groups(a, b);
    return vp('mfac', 'Write the groups as multiplication.', { variant: v, a, b, fi, ans: `${a} ${b} ${a * b}`, sig: `mfp${a}x${b}${fi}` }, 3.1, G.H / 100, 4.9, 14);
  }
  const mx = L === 1 ? 5 : 10;
  let a = ri(rng, 2, mx), b = ri(rng, 2, mx);
  if (v === 'name') { while (a === b) b = ri(rng, 2, mx); const opts = shuffle(rng, [a, b, a * b].map(String));
    return vtext('mfac', `In ${a} × ${b} = ${a * b}, circle the product.`, { variant: v, a, b, opts, ans: String(a * b), sig: `mfn${a}x${b}${opts}` }, 17, g3eh([], g3optLen(opts)), true); }
  while (a === b) b = ri(rng, 2, mx);
  const c = pick(rng, G3_GRP), meas = L === 3 && rng() < 0.5, role = pick(rng, [0, 1, 2]), num = [a, b, a * b][role];
  const text = meas ? `${a} strings are ${b} inches long.` : `${a} ${c[1]} with ${b} ${c[3]} in each ${c[0]}.`;
  return vtext('mfac', 'What does the number tell?', { variant: v, a, b, meas, role, num, text, ctx: meas ? 'str' : c[0], ans: G3_ROLE[role], sig: `mfm${a}x${b}${meas ? 's' : c[0]}${role}` }, 21, g3eh([text.length, `In ${a} × ${b} = ${a * b}, the ${num} tells`.length], g3optLen(G3_ROLE)), true);
}

function g3MfacHtml(p, key, x) {
  if (p.variant === 'pic') {
    const G = g3Groups(p.a, p.b); let o = '';
    for (let i = 0; i < p.a; i++) { const gx = 4 + (i % G.per) * (G.w + 8), gy = 4 + Math.floor(i / G.per) * (G.h + 8); o += vrect(gx, gy, G.w, G.h, 'none', { r: 6, w: 1.5, d: '4 3' });
      for (let j = 0; j < p.b; j++) o += vshape('circle', gx + 4 + 7 + 14 * (j % G.dc), gy + 4 + 7 + 14 * Math.floor(j / G.dc), 10, VFILL[p.fi], 0); }
    return vsvg(Math.max(G.W, 100) / 100, G.H / 100, o, `${p.a} groups of ${p.b}`) + `<div>${x(p.a, 1.6)} groups of ${x(p.b, 1.6)}</div><div>${x(p.a, 1.6)} × ${x(p.b, 1.6)} = ${x(p.a * p.b, 2)}</div>`;
  }
  if (p.variant === 'name') return `<div>${vopts(p.opts, p.ans, key)}</div>`;
  return `<div class="wt">${esc(p.text)}</div><div class="wt">In ${p.a} × ${p.b} = ${p.a * p.b}, the ${p.num} tells</div><div>${vopts(G3_ROLE, p.ans, key)}</div>`;
}

/* -----: interpret dividend, divisor and quotient ----- */
const G3_DIV = [['shell', 'shells', 'bag', 'bags'], ['pencil', 'pencils', 'box', 'boxes'], ['sticker', 'stickers', 'page', 'pages'], ['marble', 'marbles', 'jar', 'jars'], ['cookie', 'cookies', 'plate', 'plates'], ['flower', 'flowers', 'vase', 'vases']];

const G3_DNAME = ['dividend', 'divisor', 'quotient'];

function g3Dint(rng, L) {
  const mx = L === 1 ? 5 : 10, v = pick(rng, L === 1 ? ['name', 'share', 'share'] : ['name', 'share', 'group']), c = pick(rng, G3_DIV);
  let d = ri(rng, 2, mx); const q = ri(rng, 2, mx);
  if (v === 'name') { while (d === q) d = ri(rng, 2, mx); const n = d * q, ask = pick(rng, G3_DNAME), opts = shuffle(rng, [n, d, q].map(String)), ans = String([n, d, q][G3_DNAME.indexOf(ask)]);
    return vtext('dint', `In ${n} ÷ ${d} = ${q}, circle the ${ask}.`, { variant: v, n, d, q, ask, opts, ans, sig: `din${n}${d}${ask}${opts}` }, 17, g3eh([], g3optLen(opts)), true); }
  const n = d * q, text = v === 'share' ? `${n} ${c[1]} are shared equally into ${d} ${c[3]}. How many ${c[1]} in each ${c[2]}?` : `${n} ${c[1]} are put ${d} in each ${c[2]}. How many ${c[3]} are filled?`;
  return vtext('dint', v === 'share' ? 'Share equally.' : 'Make equal groups.', { variant: v, n, d, q, text, ans: String(q), sig: `di${v}${n}${d}${c[0]}` }, 21, g3eh([text.length], 0, 1.7), true);
}

const g3DintHtml = (p, key, x) => p.variant === 'name' ? `<div>${vopts(p.opts, p.ans, key)}</div>` : `<div class="wt">${esc(p.text)}</div><div>${p.n} ÷ ${p.d} = ${x(p.q, 2.4)}</div>`;

defTypes("vis", "Counting and arrays", [
  { id: "cnt", label: "Counting pictures", blurb: "Count objects, draw a number of objects, write number words.", on: true, gen: visCnt, html: visCntHtml },
  { id: "cntn", label: "Count and label", blurb: "Write a number under each object as you count.", on: false, gen: visCntn, html: visCntnHtml },
  { id: "picop", label: "Picture equations", blurb: "Addition and subtraction shown with objects.", on: false, gen: visPicop, html: visPicopHtml },
  { id: "showop", label: "Draw to show", blurb: "Draw and write an addition or subtraction.", on: false, gen: visShowop, html: visShowopHtml },
  { id: "array", label: "Arrays", blurb: "Rows and columns as repeated addition.", on: false, gen: visArray, html: visArrayHtml },
  { id: "mfac", label: "Factors and products", blurb: "Groups of objects as multiplication; what each number tells.", on: false, gen: g3Mfac, html: g3MfacHtml },
  { id: "dint", label: "Dividend, divisor, quotient", blurb: "Name the parts of a division; sharing and grouping.", on: false, gen: g3Dint, html: g3DintHtml }
]);
