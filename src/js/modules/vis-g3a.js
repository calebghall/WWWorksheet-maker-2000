/* ---------- Shapes, Measures and Data: grade 3 additions, part A ----------
   Included after vis-k2.js; merged into VGEN, VHTML and VIS_TYPES at the bottom of vis-g3b.js. Same conventions as vis-a.js (100 SVG units per inch, palette tokens only,
   `sig` only from printed content, size hints win/hin/hfs/bw or ew/eh). Answer keys draw in the key color.
   mfac (3.OA.A.1), dint (3.OA.A.2), mchart (3.OA.D.9), fmodel (3.NF.A.1), fline (3.NF.A.2), mvol (3.MD.A.2). */
const VIS_G3A = ['mfac', 'dint', 'mchart', 'fmodel', 'fline', 'mvol'];
/* Stacked fraction in SVG: numerator over a bar over the denominator, bar at y. */
const vfrac = (x, y, n, d, o) => {
  const s = (o && o.s) || 12, c = (o && o.c) || VINK, w = Math.max(String(n).length, String(d).length) * s * 0.62 + 4;
  return vtxt(x, y - 3, String(n), { s, c, b: o && o.b }) + vline(x - w / 2, y, x + w / 2, y, c, 1.2) + vtxt(x, y + s * 0.85, String(d), { s, c, b: o && o.b });
};
/* Height in em of a wrapped text cell: prompt, wrapped text lines (about 34 characters per line), an options row, and any extra lines. */
const g3eh = (lens, optLen, extra) => 1.1 + lens.reduce((a, n) => a + Math.ceil(n / 34), 0) * 1.45 + (optLen ? Math.ceil(optLen / 18) * 1.7 : 0) + 0.6 + (extra || 0);
const g3optLen = arr => arr.reduce((a, o) => a + String(o).length * 0.6 + 1, 0);

/* ----- 3.OA.A.1: interpret factors and products (groups of objects, equal strings) ----- */
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

/* ----- 3.OA.A.2: interpret dividend, divisor and quotient ----- */
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

/* ----- 3.OA.D.9: patterns in the multiplication chart ----- */
function g3Mchart(rng, L) {
  const kind = pick(rng, L === 1 ? ['fill', 'comm'] : L === 2 ? ['fill', 'comm', 'row'] : ['fill', 'comm', 'row', 'plus']), top = L === 1 ? 3 : L === 2 ? 6 : 7;
  if (kind === 'fill') { const r0 = ri(rng, 1, top), c0 = ri(rng, 1, top), bl = shuffle(rng, Array.from({ length: 16 }, (_, i) => i)).slice(0, 3).sort((a, b) => a - b);
    return vp('mchart', 'Fill in the missing products.', { kind, r0, c0, blanks: bl, cells: [], ans: bl.map(b => (r0 + Math.floor(b / 4)) * (c0 + b % 4)).join(' '), sig: `mcf${r0}${c0}${bl}` }, 2.5, 1.55, 1.9); }
  if (kind === 'comm') { const s = ri(rng, 1, top), i = ri(rng, 1, 3), j = ri(rng, 0, i - 1);
    return vp('mchart', 'Why? Circle the best reason.', { kind, r0: s, c0: s, cells: [[i, j], [j, i]], q: 'Why are the shaded numbers the same?', opts: ['any order', 'adding 0', 'doubling'], ans: 'any order', sig: `mcc${s}${i}${j}` }, 3.3, 1.55, 4.9, 24); }
  if (kind === 'row') { const f = pick(rng, [2, 4, 5, 6, 8, 10].filter(q => q <= top + 3)), r0 = ri(rng, Math.max(1, f - 3), Math.min(top, f)), c0 = ri(rng, 1, top), i = f - r0;
    const q = f === 5 ? 'What are the last digits of the shaded products?' : f === 10 ? 'What is the last digit of each shaded product?' : 'Are the shaded products even or odd?', opts = f === 5 ? ['0 or 5', '0 or 2'] : f === 10 ? ['0', '5'] : ['even', 'odd'];
    return vp('mchart', 'Look at the shaded row.', { kind, f, r0, c0, cells: [0, 1, 2, 3].map(j => [i, j]), q, opts, ans: opts[0], sig: `mcr${f}${r0}${c0}` }, 3.3, 1.55, 4.9, 24); }
  const r0 = ri(rng, 1, top), c0 = ri(rng, 1, top), i = ri(rng, 0, 2), j = ri(rng, 0, 3), c = c0 + j, r = r0 + i;
  return vp('mchart', 'Look at the shaded numbers.', { kind, r0, c0, cells: [[i, j], [i + 1, j]], r, c, ans: String(c), sig: `mcp${r0}${c0}${i}${j}` }, 3.3, 1.55, 3.4, 24);
}
function g3MchartHtml(p, key, x) {
  const cw = 46, ch = 30; let o = '';
  const cell = (i, j, txt, head, shade, blank) => { const xx = 8 + cw * j, yy = 6 + ch * i;
    return vrect(xx, yy, cw, ch, head ? '#e8eef7' : shade ? VFILL[0] : blank ? '#fff' : 'none', { c: '#8d99ad', w: 1.3 }) + (blank ? (key ? vtxt(xx + cw / 2, yy + 20, String(txt), { s: 14, b: 1, c: VKEY }) : '') : vtxt(xx + cw / 2, yy + 20, String(txt), { s: 14, b: head })); };
  for (let j = 0; j < 5; j++) o += cell(0, j, j ? p.c0 + j - 1 : '×', true);
  for (let i = 1; i < 5; i++) for (let j = 0; j < 5; j++) {
    if (j === 0) o += cell(i, 0, p.r0 + i - 1, true);
    else { const r = p.r0 + i - 1, c = p.c0 + j - 1, idx = (i - 1) * 4 + (j - 1); o += cell(i, j, r * c, false, p.cells.some(q => q[0] === i - 1 && q[1] === j - 1), p.kind === 'fill' && p.blanks.includes(idx)); } }
  const g = vsvg(2.5, 1.55, o, 'Multiplication chart');
  if (p.kind === 'fill') return g;
  if (p.kind === 'plus') return g + `<div>${p.r + 1} × ${p.c} is one more group of ${x(p.c, 1.6)} than ${p.r} × ${p.c}.</div>`;
  return g + `<div>${esc(p.q)}</div><div>${vopts(p.opts, p.ans, key)}</div>`;
}

/* ----- 3.NF.A.1: a fraction as parts of a whole (unit fractions and a/b) ----- */
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

/* ----- 3.NF.A.2: fractions on a number line ----- */
function g3Fline(rng, L) {
  const b = pick(rng, L === 1 ? [2, 3, 4] : [2, 3, 4, 6, 8]), top = L === 3 && rng() < 0.5 ? 2 : 1, v = pick(rng, L === 1 ? ['read', 'mark', 'unit'] : ['read', 'read', 'mark', 'unit']);
  let k = ri(rng, 1, top * b - 1); while (top === 2 && k === b) k = ri(rng, 1, top * b - 1);
  if (v === 'unit') return vp('fline', 'Name the length of one part.', { variant: v, b, top: 1, k: 1, ans: `1/${b}`, sig: `flu${b}` }, 3.0, 0.7, 4.5);
  if (v === 'mark') return vp('fline', `Mark ${k}/${b} on the number line.`, { variant: v, b, top, k, ans: `${k}/${b}`, sig: `flm${b}${top}${k}` }, 3.0, 0.7, 1.9);
  return vp('fline', 'What fraction does the point show?', { variant: v, b, top, k, ans: `${k}/${b}`, sig: `flr${b}${top}${k}` }, 3.0, 0.7, 4.5);
}
function g3FlineHtml(p, key, x) {
  const x0 = 20, W = 260, n = p.top * p.b, xs = i => x0 + W * i / n; let o = vline(x0 - 8, 36, x0 + W + 8, 36, VINK, 2);
  for (let i = 0; i <= n; i++) { const whole = i % p.b === 0; o += vline(xs(i).toFixed(1), whole ? 26 : 30, xs(i).toFixed(1), whole ? 46 : 42, VINK, whole ? 2 : 1.5); if (whole) o += vtxt(xs(i).toFixed(1), 62, String(i / p.b), { s: 13 }); }
  if (p.variant === 'read') o += `<circle cx="${xs(p.k).toFixed(1)}" cy="36" r="6.5" fill="${VFILL[1]}" stroke="${VINK}" stroke-width="2"/>`;
  if (p.variant === 'mark' && key) o += `<circle cx="${xs(p.k).toFixed(1)}" cy="36" r="6.5" fill="${VKEY}" stroke="${VKEY}" stroke-width="2"/>`;
  const g = vsvg(3.0, 0.7, o, 'Number line');
  if (p.variant === 'mark') return g;
  return g + `<div>${p.variant === 'unit' ? 'Each part is ' : 'The point is at '}${ansTpl({ w: 0, n: p.variant === 'unit' ? 1 : p.k, d: p.b }, key)}</div>`;
}

/* ----- 3.MD.A.2: mass and liquid volume: read a dial scale or a beaker, choose a unit, estimate with a benchmark, solve one-step problems ----- */
const G3_UNITS = [
  ['mass', 'g', 'a crayon'], ['mass', 'g', 'a paper clip'], ['mass', 'g', 'a strawberry'], ['mass', 'g', 'a slice of bread'], ['mass', 'g', 'an egg'],
  ['mass', 'kg', 'a backpack of books'], ['mass', 'kg', 'a watermelon'], ['mass', 'kg', 'a large dog'], ['mass', 'kg', 'a bag of potatoes'], ['mass', 'kg', 'a bicycle'],
  ['liquid', 'mL', 'a spoon'], ['liquid', 'mL', 'a cup'], ['liquid', 'mL', 'a juice box'], ['liquid', 'mL', 'a small glue bottle'],
  ['liquid', 'L', 'a bathtub'], ['liquid', 'L', 'a fish tank'], ['liquid', 'L', 'a bucket'], ['liquid', 'L', 'a kitchen sink']];
const G3_BENCH = [['A nickel has a mass of about 5 g.', 'nickels', 5, 'g', 'mass'], ['A large paper clip has a mass of about 1 g.', 'paper clips', 1, 'g', 'mass'], ['A juice box holds about 200 mL.', 'juice boxes', 200, 'mL', 'liquid'],
  ['A bag of flour has a mass of about 2 kg.', 'bags of flour', 2, 'kg', 'mass'], ['A pitcher holds about 2 L.', 'pitchers', 2, 'L', 'liquid'], ['An apple has a mass of about 200 g.', 'apples', 200, 'g', 'mass']];
const G3_WORD = {
  add: { mass: (a, b, u) => `A box has a mass of ${a} ${u}. A bag has a mass of ${b} ${u}. What is the total mass?`, liquid: (a, b, u) => `A jug holds ${a} ${u}. A pot holds ${b} ${u}. How much do they hold in all?` },
  sub: { mass: (a, b, u) => `A pack has a mass of ${a} ${u}. ${b} ${u} is taken out. What is the mass left?`, liquid: (a, b, u) => `A tank has ${a} ${u} of water. ${b} ${u} is poured out. How much water is left?` },
  mul: { mass: (a, b, u) => `Each bag of rice has a mass of ${a} ${u}. What is the mass of ${b} bags?`, liquid: (a, b, u) => `Each bottle holds ${a} ${u}. How much do ${b} bottles hold?` },
  div: { mass: (a, b, u) => `${a} ${u} of sand is shared equally into ${b} pails. What is the mass in each pail?`, liquid: (a, b, u) => `${a} ${u} of juice is poured equally into ${b} jugs. How much is in each jug?` }
};
const g3Pt = (N, i, r, cx, cy) => { const t = (-135 + 270 * i / N) * Math.PI / 180; return [cx + r * Math.sin(t), cy - r * Math.cos(t)]; };
function g3Mvol(rng, L) {
  const v = pick(rng, L === 1 ? ['dial', 'beaker', 'unit'] : L === 2 ? ['dial', 'beaker', 'unit', 'word', 'bench'] : ['dial', 'beaker', 'unit', 'word', 'word', 'bench']);
  if (v === 'dial') { const unit = pick(rng, ['kg', 'g']), step = unit === 'kg' ? 1 : 100, i = L === 1 ? pick(rng, [2, 4, 6, 8]) : ri(rng, 1, 9);
    return vp('mvol', 'Read the scale.', { variant: v, unit, step, N: 10, i, ans: String(i * step), sig: `mvd${unit}${i}` }, 1.7, 1.25, 3.4, 8); }
  if (v === 'beaker') { const unit = pick(rng, ['L', 'mL']), step = unit === 'L' ? 1 : 100, N = L === 1 ? 5 : 10, i = ri(rng, 1, N - 1);
    return vp('mvol', 'Read the liquid level.', { variant: v, unit, step, N, i, ans: String(i * step), sig: `mvb${unit}${N}${i}` }, 1.7, 1.25, 3.4, 8); }
  if (v === 'unit') { const it = pick(rng, G3_UNITS), opts = it[0] === 'mass' ? ['g', 'kg'] : ['mL', 'L'], text = it[0] === 'mass' ? `Find the mass of ${it[2]}.` : `How much liquid does ${it[2]} hold?`;
    return vtext('mvol', 'Circle the best unit.', { variant: v, kind: it[0], thing: it[2], text, opts, ans: it[1], sig: `mvu${it[2]}` }, 21, g3eh([text.length], g3optLen(opts)), true); }
  if (v === 'bench') { const it = pick(rng, G3_BENCH), n = it[2] === 1 ? pick(rng, [20, 50, 100]) : ri(rng, 2, 10), text = `${it[0]} ${it[4] === 'mass' ? `About what is the mass of ${n} ${it[1]}?` : `About how much do ${n} ${it[1]} hold?`}`;
    return vtext('mvol', 'Estimate with a benchmark.', { variant: v, bench: it[0], per: it[2], unit: it[3], noun: it[1], n, text, ans: String(n * it[2]), sig: `mvk${it[1]}${n}` }, 21, g3eh([text.length], 0, 1.7), true); }
  const op = pick(rng, L === 2 ? ['add', 'sub'] : ['add', 'sub', 'mul', 'div']), kind = pick(rng, ['mass', 'liquid']), unit = kind === 'mass' ? pick(rng, L === 1 ? ['kg'] : ['kg', 'g']) : pick(rng, ['L', 'mL']), small = unit === 'kg' || unit === 'L';
  let a, b, ans;
  if (op === 'add') { a = small ? ri(rng, 5, 60) : ri(rng, 2, 9) * 50 + ri(rng, 0, 4) * 10; b = small ? ri(rng, 5, 60) : ri(rng, 2, 9) * 50; ans = a + b; }
  else if (op === 'sub') { b = small ? ri(rng, 5, 40) : ri(rng, 2, 9) * 50; a = b + (small ? ri(rng, 5, 50) : ri(rng, 2, 9) * 50); ans = a - b; }
  else if (op === 'mul') { a = small ? ri(rng, 2, 12) : ri(rng, 2, 9) * 10; b = ri(rng, 2, 9); ans = a * b; }
  else { b = ri(rng, 2, 9); ans = small ? ri(rng, 2, 12) : ri(rng, 2, 9) * 10; a = b * ans; }
  const text = G3_WORD[op][kind](a, b, unit);
  return vtext('mvol', 'Solve the problem.', { variant: v, op, kind, unit, a, b, text, ans: String(ans), sig: `mvw${op}${kind}${unit}${a}${b}` }, 21, g3eh([text.length], 0, 1.7), true);
}
function g3MvolHtml(p, key, x) {
  if (p.variant === 'dial') {
    const cx = 62, cy = 62; let o = `<circle cx="${cx}" cy="${cy}" r="54" fill="#fff" stroke="${VINK}" stroke-width="2.5"/>`;
    for (let i = 0; i <= p.N; i++) { const a = g3Pt(p.N, i, 54, cx, cy), b = g3Pt(p.N, i, i % 2 ? 47 : 43, cx, cy); o += vline(a[0].toFixed(1), a[1].toFixed(1), b[0].toFixed(1), b[1].toFixed(1), VINK, i % 2 ? 1.2 : 2);
      if (i % 2 === 0) { const t = g3Pt(p.N, i, 32, cx, cy); o += vtxt(t[0].toFixed(1), (t[1] + 3.5).toFixed(1), String(i * p.step), { s: 9.5 }); } }
    const n = g3Pt(p.N, p.i, 40, cx, cy); o += vline(cx, cy, n[0].toFixed(1), n[1].toFixed(1), VINK, 2.5) + `<circle cx="${cx}" cy="${cy}" r="4" fill="${VINK}"/>` + vtxt(cx, cy + 22, p.unit, { s: 10 });
    return vsvg(1.25, 1.25, o, 'A dial scale') + `<div>${x(p.ans, 2.6)} ${p.unit}</div>`;
  }
  if (p.variant === 'beaker') {
    const x0 = 16, x1 = 66, yb = 112, h = 100, lvl = h * p.i / p.N; let o = `<rect x="${x0}" y="${yb - lvl}" width="${x1 - x0}" height="${lvl}" fill="${VFILL[3]}"/>` + vline(x0, yb - h - 6, x0, yb, VINK, 2.5) + vline(x1, yb - h - 6, x1, yb, VINK, 2.5) + vline(x0, yb, x1, yb, VINK, 2.5);
    for (let i = 0; i <= p.N; i++) { const y = (yb - h * i / p.N).toFixed(1), lab = p.N === 5 || i % 2 === 0; o += vline(x1, y, x1 + (lab ? 9 : 5), y, VINK, lab ? 1.8 : 1.2); if (lab) o += vtxt(x1 + 12, (yb - h * i / p.N + 3.5).toFixed(1), String(i * p.step), { a: 'start', s: 10 }); }
    return vsvg(1.25, 1.25, o, 'A measuring beaker') + `<div>${x(p.ans, 2.6)} ${p.unit}</div>`;
  }
  if (p.variant === 'unit') return `<div class="wt">${esc(p.text)}</div><div>${vopts(p.opts, p.ans, key)}</div>`;
  return `<div class="wt">${esc(p.text)}</div><div>${x(p.ans, 3)} ${p.unit}</div>`;
}
