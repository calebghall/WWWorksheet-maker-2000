/* ---------- Shapes, Measures and Data (module id: vis), part A: drawing helpers, counting, patterns, coins, comparing, measuring ----------
   Pictures are SVG drawn at 100 units per inch. A problem stores only parameters (never markup); visHtml() draws it, in red on the answer key.
   Size hints: win/hin = picture size in inches, hfs = em of text around the picture (prompt, blanks), bw = width in em of the widest blank row. */
const VINK = 'var(--ink)', VKEY = 'var(--key)', VFILL = ['var(--c0)', 'var(--c1)', 'var(--c2)', 'var(--c3)'];
const vsvg = (w, h, inner, label) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}in" height="${h}in" viewBox="0 0 ${Math.round(w * 100)} ${Math.round(h * 100)}" role="img" aria-label="${esc(label)}" style="display:block">${inner}</svg>`;
const vtxt = (x, y, t, o) => `<text x="${x}" y="${y}" font-size="${(o && o.s) || 13}" text-anchor="${(o && o.a) || 'middle'}" fill="${(o && o.c) || VINK}"${o && o.b ? ' font-weight="700"' : ''}>${esc(t)}</text>`;
const vline = (x1, y1, x2, y2, c, w) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c || VINK}" stroke-width="${w || 2}" stroke-linecap="round"/>`;
const vrect = (x, y, w, h, fill, o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill || 'none'}" stroke="${(o && o.c) || VINK}" stroke-width="${(o && o.w) || 2}"${o && o.r ? ` rx="${o.r}"` : ''}${o && o.d ? ` stroke-dasharray="${o.d}"` : ''}/>`;
const vring = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="${VKEY}" stroke-width="3"/>`;
const vpoly = (pts, fill, rot, cx, cy, stroke) => `<polygon points="${pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="${fill}" stroke="${stroke || VINK}" stroke-width="2" stroke-linejoin="round"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
const vreg = (n, cx, cy, r, off) => Array.from({ length: n }, (_, i) => { const a = (off || 0) + i * 2 * Math.PI / n - Math.PI / 2; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
/* Flat shapes. s = size in units. Polygons name their side counts in V_SIDES. */
const V_SIDES = { triangle: 3, square: 4, rectangle: 4, rhombus: 4, trapezoid: 4, pentagon: 5, hexagon: 6 };
const V_POLY = { triangle: 'triangle', square: 'quadrilateral', rectangle: 'quadrilateral', rhombus: 'quadrilateral', trapezoid: 'quadrilateral', pentagon: 'pentagon', hexagon: 'hexagon' };
function vshape(k, cx, cy, s, fill, rot, stroke) {
  const r = s / 2;
  switch (k) {
    case 'circle': return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke || VINK}" stroke-width="2"/>`;
    case 'square': return vpoly([[cx - r, cy - r], [cx + r, cy - r], [cx + r, cy + r], [cx - r, cy + r]], fill, rot, cx, cy, stroke);
    case 'rectangle': return vpoly([[cx - s * .75, cy - s * .4], [cx + s * .75, cy - s * .4], [cx + s * .75, cy + s * .4], [cx - s * .75, cy + s * .4]], fill, rot, cx, cy, stroke);
    case 'triangle': return vpoly([[cx, cy - r], [cx + r * 1.1, cy + r * .8], [cx - r * 1.1, cy + r * .8]], fill, rot, cx, cy, stroke);
    case 'hexagon': return vpoly(vreg(6, cx, cy, r * 1.05, 0), fill, rot, cx, cy, stroke);
    case 'pentagon': return vpoly(vreg(5, cx, cy, r * 1.05, 0), fill, rot, cx, cy, stroke);
    case 'rhombus': return vpoly([[cx, cy - r], [cx + r * .7, cy], [cx, cy + r], [cx - r * .7, cy]], fill, rot, cx, cy, stroke);
    default: return vpoly([[cx - r * .55, cy - r * .7], [cx + r * .55, cy - r * .7], [cx + r * 1.1, cy + r * .7], [cx - r * 1.1, cy + r * .7]], fill, rot, cx, cy, stroke);   // trapezoid
  }
}
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
const vp = (type, prompt, f, win, hin, hfs, bw) => Object.assign({ mod: 'vis', type, prompt, win, hin, hfs, bw: bw || 0 }, f);
const vcap = n => String(n);
const VNUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const vpl = (shape, n) => n === 1 ? shape : shape + 's';
const vopts = (arr, ans, key) => arr.map(o => `<span class="opt${key && ans === o ? ' on' : ''}" style="min-width:0">${o}</span>`).join('');

/* ----- K.CC.A.3, K.CC.B.5, K.CC.B.6: counting objects in a line, array, circle or scatter; draw a number of objects; write a number word as a numeral ----- */
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

/* ----- K.CC.A.4: repeating patterns. Next shape, or the length of the core. ----- */
const V_PCORE = { AB: [0, 1], AAB: [0, 0, 1], ABB: [0, 1, 1], ABC: [0, 1, 2] };
const V_TOK = [{ k: 'circle', f: VFILL[0] }, { k: 'square', f: VFILL[1] }, { k: 'triangle', f: VFILL[2] }];
function visPat(rng, L) {
  const name = L === 1 ? 'AB' : pick(rng, ['AAB', 'ABB', 'ABC', 'AB']), core = V_PCORE[name], tk = shuffle(rng, [0, 1, 2]), seqOf = n => Array.from({ length: n }, (_, i) => tk[core[i % core.length]]);
  if (L === 3 && rng() < 0.45) { const reps = core.length === 2 ? 4 : 3, seq = seqOf(core.length * reps);
    return vp('pat', 'How long is the core (repeating part)?', { variant: 'core', name, seq, ans: String(core.length), sig: `pc${name}${seq}` }, 3.3, 0.5, 3.4, 6); }
  const seq = seqOf(6), nxt = seqOf(7)[6], order = shuffle(rng, [0, 1, 2]);
  return vp('pat', 'Circle the shape that comes next.', { variant: 'next', name, seq, order, ans: String(order.indexOf(nxt)), sig: `pn${name}${seq}${order}` }, 2.7, 1.15, 1.9);
}
function visPatHtml(p, key, x) {
  const sh = (t, cx, cy) => vshape(V_TOK[t].k, cx, cy, 28, V_TOK[t].f, 0);
  if (p.variant === 'core') return vsvg(3.3, 0.5, p.seq.map((t, i) => sh(t, 22 + 36 * i, 25)).join(''), 'Pattern') + `<div>${x(p.ans, 2.4)}</div>`;
  let o = p.seq.map((t, i) => sh(t, 22 + 36 * i, 24)).join('') + vrect(22 + 36 * 6 - 16, 24 - 16, 32, 32, 'none', { d: '4 3', r: 4 });
  o += vline(10, 56, 260, 56, '#b6c0d0', 1);
  o += p.order.map((t, i) => sh(t, 50 + 60 * i, 90)).join('');
  if (key) o += vring(50 + 60 * +p.ans - 26, 90 - 26, 52, 52);
  return vsvg(2.7, 1.15, o, 'Pattern with a missing shape and three choices');
}

/* ----- K.OA.A.1: show addition and subtraction with pictures ----- */
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

/* ----- K.MD.B.3, 2.MD.C.8: coins. The artwork (V_COIN, vcoin) lives in coins.js. ----- */
const VCOIN_GAP = 10, VCOIN_PAD = 6;
function vcoinRow(order) {
  let x = VCOIN_PAD; const at = order.map(k => { const d = V_COIN[k].d; const c = x + d / 2; x += d + VCOIN_GAP; return c; });
  return { at, w: x - VCOIN_GAP + VCOIN_PAD, h: 100 };
}
function visCoin(rng, L) {
  const names = Object.keys(V_COIN);
  if (L === 3) { const k = pick(rng, names); return vp('coin', 'Name the coin and write its value.', { variant: 'id', coin: k, ans: k, val: V_COIN[k].v, sig: `ci${k}` }, 2.4, 1.0, 3.4, 12); }
  const order = shuffle(rng, names), k = pick(rng, names), byVal = L === 2, row = vcoinRow(order);
  return vp('coin', byVal ? `Circle the coin worth ${V_COIN[k].v}¢.` : `Circle the ${k}.`, { variant: byVal ? 'value' : 'name', order, coin: k, ans: String(order.indexOf(k)), sig: `cf${byVal}${order}${k}` }, row.w / 100, 1.0, 1.9);
}
function visCoinHtml(p, key, x) {
  if (p.variant === 'id') return vsvg(2.4, 1.0, vcoin(p.coin, 120, 50), 'A coin') + `<div>${x(p.coin, 4.4)} ${x(p.val, 2)}¢</div>`;
  const row = vcoinRow(p.order);
  let o = p.order.map((k, i) => vcoin(k, row.at[i], 50)).join('');
  if (key) { const r = V_COIN[p.order[+p.ans]].d / 2 + 5; o += `<circle cx="${row.at[+p.ans]}" cy="50" r="${r}" fill="none" stroke="var(--key)" stroke-width="3"/>`; }
  return vsvg(row.w / 100, 1.0, o, 'Four coins');
}

/* ----- K.MD.A.1, K.MD.A.2: compare length, height and weight; 1.MD.A.1: order three objects ----- */
const V_LET = ['A', 'B', 'C'];
function visCmpm(rng, L) {
  const kind = pick(rng, L === 1 ? ['long', 'tall'] : ['long', 'tall', 'heavy']), cnt = kind === 'heavy' ? 2 : L === 1 ? 2 : 3;
  const vals = shuffle(rng, [1, 2, 3, 4, 5, 6]).slice(0, cnt), big = rng() < 0.5, ans = vals.indexOf(big ? Math.max(...vals) : Math.min(...vals));
  const word = kind === 'long' ? (cnt === 2 ? (big ? 'longer' : 'shorter') : (big ? 'longest' : 'shortest')) : kind === 'tall' ? (cnt === 2 ? (big ? 'taller' : 'shorter') : (big ? 'tallest' : 'shortest')) : (big ? 'heavier' : 'lighter');
  const noun = kind === 'long' ? 'pencil' : kind === 'tall' ? 'tree' : 'object';
  return vp('cmpm', `Circle the ${word} ${noun}.`, { kind, vals, ans: String(ans), sig: kind === 'heavy' ? `cmheavy${vals[0] > vals[1]}${big}` : `cm${kind}${vals}${big}` }, kind === 'heavy' ? 2.2 : 2.6, kind === 'long' ? 0.15 + 0.38 * cnt : kind === 'tall' ? 1.45 : 1.05, 1.9);
}
function visCmpmHtml(p, key) {
  const n = p.vals.length; let o = '', h = p.hin * 100;
  if (p.kind === 'long') {
    p.vals.forEach((v, i) => { const y = 10 + 38 * i, len = 30 + 24 * v;
      o += vtxt(14, y + 18, V_LET[i], { b: 1 }) + vrect(34, y + 4, len, 22, VFILL[3]) + vpoly([[34 + len, y + 4], [34 + len + 22, y + 15], [34 + len, y + 26]], 'var(--tip)', 0, 0, 0);
      if (key && i === +p.ans) o += vring(26, y - 2, len + 36, 34); });
    return vsvg(2.6, p.hin, o, 'Pencils');
  }
  if (p.kind === 'tall') {
    p.vals.forEach((v, i) => { const x = 36 + 80 * i, th = 20 + 17 * v;
      o += vrect(x - 7, 118 - 24 - th + 24 - 24, 14, 24, 'var(--wood)') + vpoly([[x, 118 - 24 - th - 6], [x + 26, 118 - 24 - th + 40], [x - 26, 118 - 24 - th + 40]], VFILL[2], 0, 0, 0) + vtxt(x, 138, V_LET[i], { b: 1 });
      if (key && i === +p.ans) o += vring(x - 34, 118 - 24 - th - 14, 68, th + 60); });
    return vsvg(2.6, 1.45, o, 'Trees');
  }
  const heavy = p.vals[0] > p.vals[1] ? 0 : 1, tilt = heavy === 0 ? 10 : -10, bx = 110, by = 38, L = 78, dy = Math.sin(tilt * Math.PI / 180) * L, lx = bx - L * Math.cos(tilt * Math.PI / 180), rx = bx + L * Math.cos(tilt * Math.PI / 180);
  o += vpoly([[bx, by], [bx + 14, 98], [bx - 14, 98]], '#c9cdd3', 0, 0, 0) + vline(lx, by - dy, rx, by + dy, VINK, 3);
  [[lx, by - dy, 0], [rx, by + dy, 1]].forEach(([px, py, i]) => { o += vline(px, py, px - 22, py + 18, VINK, 1.5) + vline(px, py, px + 22, py + 18, VINK, 1.5) + `<path d="M${px - 26} ${py + 18}H${px + 26}" stroke="${VINK}" stroke-width="3"/>` + vrect(px - 14, py - 8, 28, 26, VFILL[i === 0 ? 1 : 0]) + vtxt(px, py + 11, V_LET[i], { b: 1 });
    if (key && i === +p.ans) o += vring(px - 20, py - 14, 40, 38); });
  return vsvg(2.2, 1.05, o, 'Balance scale');
}
/* ans for heavy: index of the object asked about. The heavier is the larger value; vals holds weights. */

function visOrd3(rng, L) {
  if (L === 1 || (L === 3 && rng() < 0.4)) { const vals = shuffle(rng, [1, 2, 3, 4, 5, 6]).slice(0, 3), ord = [0, 1, 2].sort((a, b) => vals[a] - vals[b]).map(i => V_LET[i]);
    return vp('ord3', 'Shortest to longest: write A, B, C.', { variant: 'dir', vals, ord, ans: ord.join(' '), sig: `o3${vals}` }, 2.6, 1.1, 3.4, 12); }
  const nm = shuffle(rng, ['Ben', 'Cam', 'Dee', 'Eli', 'Fay', 'Gus']).slice(0, 3), kind = rng() < 0.5 ? 'taller' : 'older', ask = rng() < 0.5;
  return { mod: 'vis', type: 'ord3', prompt: 'Read and answer.', variant: 'ind', names: nm, word: kind, lines: [`${nm[0]} is ${kind} than ${nm[1]}.`, `${nm[1]} is ${kind} than ${nm[2]}.`],
    qtext: ask ? `Is ${nm[0]} ${kind} than ${nm[2]}?` : `Is ${nm[2]} ${kind} than ${nm[0]}?`, ans: ask ? 'yes' : 'no', sig: `o3i${nm}${kind}${ask}`, ew: 14, eh: 1.1 + 3 * 1.5 + 0.5 };
}
function visOrd3Html(p, key, x) {
  if (p.variant === 'ind') return `<div>${esc(p.lines[0])}</div><div>${esc(p.lines[1])}</div><div>${esc(p.qtext)}&emsp;${vopts(['yes', 'no'], p.ans, key)}</div>`;
  const o = p.vals.map((v, i) => { const y = 8 + 32 * i, len = 30 + 24 * v; return vtxt(14, y + 18, V_LET[i], { b: 1 }) + vrect(34, y + 4, len, 20, VFILL[3]) + vpoly([[34 + len, y + 4], [34 + len + 20, y + 14], [34 + len, y + 24]], 'var(--tip)', 0, 0, 0); }).join('');
  return vsvg(2.6, 1.1, o, 'Three pencils') + `<div>${['', '', ''].map((_, i) => x(p.ord[i], 1.8)).join(' ,&ensp;')}</div>`;
}

/* ----- measurement: 1.MD.A.2 unit tiles, 2.MD.A.1 ruler, 2.MD.A.2 two units, 2.MD.A.3 estimate, 2.MD.A.4 how much longer ----- */
const V_OBJ = ['pencil', 'crayon', 'straw', 'ribbon', 'stick'];
function visMunit(rng, L) {
  const unit = pick(rng, ['cubes', 'clips']), obj = pick(rng, V_OBJ), n = ri(rng, 2, L === 1 ? 8 : 10), st = L === 3 ? ri(rng, 1, 12 - n > 1 ? Math.min(4, 12 - n) : 1) : 0;
  return vp('munit', `How many ${unit} long is the ${obj}?`, { unit, obj, n, st, strip: L > 1 ? 12 : n, ans: String(n), sig: `mu${unit}${obj}${n}${st}${L}` }, Math.max(0.9, (L > 1 ? 12 : n) * 0.22 + 0.3), 0.85, 3.4, 10);
}
function visMunitHtml(p, key, x) {
  const T = 22, x0 = 12, N = p.strip;
  let o = vrect(x0 + p.st * T, 6, p.n * T, 22, VFILL[3]) + vpoly([[x0 + (p.st + p.n) * T, 6], [x0 + (p.st + p.n) * T + 20, 17], [x0 + (p.st + p.n) * T, 28]], 'var(--tip)', 0, 0, 0);
  for (let i = 0; i < N; i++) o += vrect(x0 + i * T + 1, 44, T - 2, 26, p.unit === 'cubes' ? VFILL[1] : '#dfe3ea', { r: p.unit === 'cubes' ? 2 : 11 });
  return vsvg(Math.max(0.9, N * 0.22 + 0.3), 0.85, o, 'Object above a row of units') + `<div>${x(p.ans, 2.6)} ${p.unit}</div>`;
}
function vruler(unit, max, sc, x0, y, key) {
  const cm = unit === 'cm', w = max * sc;
  let o = vrect(x0, y, w, 30, 'var(--ruler)');
  for (let i = 0; i <= max; i++) { const xx = x0 + i * sc; o += vline(xx, y, xx, y + (i % 1 === 0 ? 14 : 8), VINK, 1.5) + vtxt(xx, y + 27, String(i), { s: 11 }); }
  return o + vtxt(x0 + w + 18, y + 27, cm ? 'cm' : 'in', { a: 'start', s: 11 });
}
function visRuler(rng, L) {
  const unit = pick(rng, ['in', 'cm']), max = L === 1 ? 6 : L === 2 ? 10 : 12, sc = L === 1 ? 40 : L === 2 ? 24 : 21, len = ri(rng, 2, max - (L === 3 ? 2 : 0)), st = L === 3 ? ri(rng, 1, max - len) : 0, obj = pick(rng, V_OBJ);
  const w = max * sc / 100 + 0.7;
  return vp('ruler', `How long is the ${obj}?`, { unit, max, sc, len, st, obj, ans: String(len), sig: `rl${unit}${max}${len}${st}${obj}` }, w, 0.95, 3.4, 11);
}
function visRulerHtml(p, key, x) {
  const x0 = 12, w = p.max * p.sc / 100 + 0.7;
  let o = vrect(x0 + p.st * p.sc, 6, p.len * p.sc, 20, VFILL[3]) + vpoly([[x0 + (p.st + p.len) * p.sc, 6], [x0 + (p.st + p.len) * p.sc + 16, 16], [x0 + (p.st + p.len) * p.sc, 26]], 'var(--tip)', 0, 0, 0);
  o += vruler(p.unit, p.max, p.sc, x0, 40, key);
  return vsvg(w, 0.95, o, 'Object above a ruler') + `<div>${x(p.ans, 2.6)} ${p.unit === 'in' ? 'inches' : 'centimeters'}</div>`;
}
function visMtwo(rng) {
  const b = pick(rng, [2, 3, 4]), m = ri(rng, 2, Math.floor(12 / b)), n = m * b;
  return vp('mtwo', 'Count the small and big tiles.', { b, m, n, ans: `${n} ${m}`, sig: `m2${b}${m}` }, 3.1, 1.0, 5.7, 12);
}
function visMtwoHtml(p, key, x) {
  const T = 24, x0 = 12;
  let o = vrect(x0, 6, p.n * T, 20, VFILL[3]), s = '';
  for (let i = 0; i < p.n; i++) o += vrect(x0 + i * T + 1, 36, T - 2, 20, VFILL[1]);
  for (let i = 0; i < p.m; i++) o += vrect(x0 + i * T * p.b + 1, 62, T * p.b - 2, 20, VFILL[0]);
  return vsvg(3.1, 1.0, o, 'A bar measured with small tiles and big tiles') + `<div>Small ${x(p.n, 1.8)}&ensp;Big ${x(p.m, 1.8)}</div><div>More tiles? ${vopts(['small', 'big'], p.n > p.m ? 'small' : 'big', key)}</div>`;
}
function visMdiff(rng, L) {
  const max = L === 1 ? 10 : 12, a = ri(rng, 3, max), b = ri(rng, 1, a - 1), unit = pick(rng, ['in', 'cm']), swap = rng() < 0.5;
  return vp('mdiff', 'How much longer is the longer bar?', { a: swap ? b : a, b: swap ? a : b, max, unit, ans: String(Math.abs(a - b)), sig: `md${a}${b}${swap}${unit}` }, 3.2, 1.05, 3.4, 12);
}
function visMdiffHtml(p, key, x) {
  const sc = 20, x0 = 28;
  const o = vtxt(8, 20, 'A', { b: 1, a: 'start' }) + vrect(x0, 6, p.a * sc, 20, VFILL[3]) + vtxt(8, 48, 'B', { b: 1, a: 'start' }) + vrect(x0, 34, p.b * sc, 20, VFILL[1]) + vruler(p.unit, p.max, sc, x0, 64, key);
  return vsvg(3.2, 1.05, o, 'Two bars above a ruler') + `<div>${x(p.ans, 2.6)} ${p.unit === 'in' ? 'inches' : 'centimeters'}</div>`;
}
const V_EST = [['a pencil', 'inches', 7], ['a crayon', 'inches', 4], ['a paper clip', 'centimeters', 3], ['a door', 'feet', 7], ['a bed', 'feet', 6], ['a classroom', 'meters', 9], ['a soccer field', 'yards', 100], ['a school bus', 'meters', 12], ['a ladybug', 'centimeters', 1], ['a car', 'feet', 14], ['a sidewalk block', 'feet', 4], ['a hallway', 'yards', 20], ['a pencil case', 'inches', 9], ['a thumb', 'inches', 2], ['a swimming pool', 'meters', 25], ['a couch', 'feet', 7], ['a giraffe', 'feet', 16], ['a bike', 'feet', 5], ['a fingernail', 'centimeters', 1], ['a playground', 'yards', 30], ['a book', 'inches', 10], ['a table', 'feet', 5],
  ['an eraser', 'inches', 2], ['a ruler', 'inches', 12], ['a stapler', 'inches', 6], ['a shoe', 'inches', 10], ['a penny', 'centimeters', 2], ['a pencil sharpener', 'centimeters', 4],
  ['a bathtub', 'feet', 5], ['a refrigerator', 'feet', 6], ['a skateboard', 'inches', 30], ['a garden hose', 'feet', 50], ['a tennis court', 'yards', 26], ['a basketball court', 'meters', 28], ['a park bench', 'feet', 6], ['a bedroom', 'meters', 4]];
function visMest(rng) {
  const [thing, unit, v] = pick(rng, V_EST), units = shuffle(rng, ['inches', 'feet', 'yards', 'centimeters', 'meters'].filter(u => u !== unit)).slice(0, 2).concat(unit), opts = shuffle(rng, units);
  return { mod: 'vis', type: 'mest', prompt: `How long is ${thing}?`, thing, unit, v, opts, ans: `${v} ${unit}`, sig: `me${thing}`, win: 3.1, hin: 0.25, hfs: 2.8, bw: 0 };
}
function visMestHtml(p, key) {
  return `<div>${p.opts.map(u => `<span class="opt${key && u === p.unit ? ' on' : ''}" style="min-width:0">${p.v} ${u.replace('inches', 'in').replace('feet', 'ft').replace('yards', 'yd').replace('centimeters', 'cm').replace('meters', 'm')}</span>`).join('')}</div>`;
}

/* ----- 2.MD.B.6: number line jumps ----- */
function visNline(rng, L) {
  const tens = L === 2 || (L === 3 && rng() < 0.5), lo = tens ? 0 : 0, hi = tens ? 100 : 20, st = tens ? 10 : 1, add = rng() < 0.6;
  let a, b;
  if (add) { a = st * ri(rng, tens ? 1 : 2, tens ? 6 : 12); b = st * ri(rng, tens ? 1 : 2, Math.min(tens ? 9 : 9, (hi - a) / st)); }
  else { a = st * ri(rng, tens ? 4 : 8, hi / st); b = st * ri(rng, tens ? 1 : 2, Math.min(a / st - (tens ? 0 : 1), tens ? 6 : 9)); }
  const res = add ? a + b : a - b;
  return vp('nline', 'Write the answer.', { add, a, b, lo, hi, st, tens, ans: String(res), sig: `nl${add}${a}${b}${tens}` }, 3.05, 0.95, 3.4, 12);
}
function visNlineHtml(p, key, x) {
  const x0 = 22, W = 260, X = v => x0 + W * (v - p.lo) / (p.hi - p.lo), y = 62;
  let o = vline(x0 - 8, y, x0 + W + 8, y, VINK, 2);
  for (let v = p.lo; v <= p.hi; v += p.st) { const big = p.tens || v % 5 === 0; o += vline(X(v), y - (big ? 8 : 5), X(v), y + (big ? 8 : 5), VINK, 1.5); if (p.tens ? true : v % 5 === 0) o += vtxt(X(v), y + 22, String(v), { s: 11 }); }
  const end = p.add ? p.a + p.b : p.a - p.b, mx = (X(p.a) + X(end)) / 2, top = 14;
  o += `<path d="M${X(p.a)} ${y - 4}Q${mx} ${top} ${X(end)} ${y - 4}" fill="none" stroke="${key ? VKEY : VINK}" stroke-width="2.2"/>`;
  const ex = X(end), dir = end > p.a ? -1 : 1;
  o += vpoly([[ex, y - 4], [ex + dir * 9 - 0, y - 14], [ex + dir * 1, y - 16]], key ? VKEY : VINK, 0, 0, 0, key ? VKEY : VINK);
  o += `<circle cx="${X(p.a)}" cy="${y}" r="5" fill="${VINK}"/>` + (key ? `<circle cx="${ex}" cy="${y}" r="5" fill="${VKEY}"/>` : '');
  return vsvg(3.05, 0.95, o, 'Number line with a jump') + `<div>${p.a} ${p.add ? '+' : '−'} ${p.b} = ${x(p.ans, 2.6)}</div>`;
}

const VGEN_A = { cnt: visCnt, pat: visPat, picop: visPicop, coin: visCoin, cmpm: visCmpm, ord3: visOrd3, munit: visMunit, ruler: visRuler, mtwo: visMtwo, mdiff: visMdiff, mest: visMest, nline: visNline };
const VHTML_A = { cnt: visCntHtml, pat: visPatHtml, picop: visPicopHtml, coin: visCoinHtml, cmpm: visCmpmHtml, ord3: visOrd3Html, munit: visMunitHtml, ruler: visRulerHtml, mtwo: visMtwoHtml, mdiff: visMdiffHtml, mest: visMestHtml, nline: visNlineHtml };
