/* ---------- Shapes, Measures and Data: the coordinate plane (first quadrant) ----------
   cpGrid draws the grid, axes and points and is shared with the Number Sense two-rule patterns.
   cplane: read, plot and shift ordered pairs. cpword: graph and read a real-world rate table.
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions. */

/* A first-quadrant grid Nx by Ny with cell size c (svg units; 100 per inch). pts: [{ x, y, l, key }] drawn as dots with optional letters; key points use the key colour.
   o.named: axis names (xl, yl) centred below and beside the axes; otherwise "x" and "y" at the arrow ends. Returns { svg, W, H }. */
function cpGrid(Nx, Ny, c, pts, o) {
  o = o || {};
  const lm = o.named ? 44 : 34, tm = 16, bm = o.named ? 40 : 30, rm = 26, ox = lm, oy = tm + Ny * c, W = lm + Nx * c + rm, H = oy + bm, f = n => n.toFixed(1);
  let g = '';
  for (let i = 0; i <= Nx; i++) g += `M${f(ox + i * c)} ${oy}V${f(oy - Ny * c)}`;
  for (let j = 0; j <= Ny; j++) g += `M${ox} ${f(oy - j * c)}H${f(ox + Nx * c)}`;
  let s = `<path d="${g}" stroke="${VINK}" stroke-opacity="0.28" stroke-width="0.7" fill="none"/>`;
  s += `<path d="M${ox} ${oy}H${f(ox + Nx * c + 12)}M${ox} ${oy}V${f(oy - Ny * c - 12)}" stroke="${VINK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M${f(ox + Nx * c + 12)} ${oy}l-7 -4v8zM${ox} ${f(oy - Ny * c - 12)}l-4 7h8z" fill="${VINK}"/>`;
  for (let i = 0; i <= Nx; i++) s += vtxt(f(ox + i * c), oy + 15, String(i), { s: 11 });
  for (let j = 1; j <= Ny; j++) s += vtxt(ox - 7, f(oy - j * c + 4), String(j), { s: 11, a: 'end' });
  if (o.named) {
    s += vtxt(f(ox + Nx * c / 2), oy + 34, o.xl, { b: 1, s: 12 }) + `<text transform="translate(12 ${f(oy - Ny * c / 2)}) rotate(-90)" font-size="12" font-weight="700" text-anchor="middle" fill="${VINK}">${esc(o.yl)}</text>`;
  } else {
    s += vtxt(f(ox + Nx * c + 16), oy + 18, 'x', { b: 1, s: 13, c: VINK }) + vtxt(ox - 12, f(oy - Ny * c - 12), 'y', { b: 1, s: 13 });
  }
  for (const p of pts || []) {
    const cx = ox + p.x * c, cy = oy - p.y * c;
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${p.key ? 5.2 : 4.6}" fill="${p.key ? VKEY : VINK}" stroke="${p.key ? VKEY : VINK}" stroke-width="1"/>`;
    if (p.l) s += vtxt(f(cx + 8), f(cy - 7), p.l, { b: 1, s: 13, a: 'start', c: p.key ? VKEY : VINK });
  }
  return { svg: s, W, H };
}

const CP_LET = ['A', 'B', 'C', 'D'];

/* distinct points, no two on a row or column (so each is easy to read), all away from the axes unless zero is allowed */
function cpPoints(rng, n, N, zero) {
  const xs = shuffle(rng, Array.from({ length: N + 1 }, (_, i) => i).filter(i => zero || i > 0)), ys = shuffle(rng, Array.from({ length: N + 1 }, (_, i) => i).filter(i => zero || i > 0));
  return Array.from({ length: n }, (_, i) => ({ x: xs[i], y: ys[i], l: CP_LET[i] }));
}

/* ordered pairs in the first quadrant. L1 a 6 by 6 grid reading and plotting, L2 an 8 by 8 grid with the meaning of the coordinates,
   L3 a 10 by 10 grid with points on the axes and moves along the axes. */
function vCplane(rng, L) {
  const N = L === 1 ? 6 : L === 2 ? 8 : 10, c = N <= 6 ? 30 : N <= 8 ? 26 : 22, kind = pick(rng, L === 1 ? ['read', 'plot'] : L === 2 ? ['read', 'plot', 'plot', 'axes'] : ['read', 'plot', 'axes', 'shift']);
  if (kind === 'axes') {
    const x = ri(rng, 1, N), y = ri(rng, 1, N), which = pick(rng, ['x', 'y']), ask = which === 'x' ? 'x-coordinate' : 'y-coordinate';
    return vtext('cplane', 'Parts of an ordered pair.', { kind, x, y, which, text: which === 'x' ? `In the ordered pair (${x}, ${y}), the ${ask} tells how many units to move right along the x-axis. What is the ${ask}?` : `In the ordered pair (${x}, ${y}), the ${ask} tells how many units to move up. What is the ${ask}?`, ans: String(which === 'x' ? x : y), sig: `cpa${x}${y}${which}` }, 21, 1.1 + 2 * 1.45 + 1.7 + 0.6, true);
  }
  if (kind === 'shift') {
    const x = ri(rng, 1, N - 2), y = ri(rng, 1, N - 2), dir = pick(rng, ['right', 'up']), d = ri(rng, 1, N - (dir === 'right' ? x : y)), nx = dir === 'right' ? x + d : x, ny = dir === 'up' ? y + d : y;
    return vtext('cplane', 'Move a point.', { kind, x, y, dir, d, nx, ny, text: `Point P is at (${x}, ${y}). Point Q is ${d} unit${d === 1 ? '' : 's'} ${dir} from P. Write the ordered pair for Q.`, ans: `${nx}, ${ny}`, sig: `cps${x}${y}${dir}${d}` }, 21, 1.1 + 2 * 1.45 + 1.7 + 0.6, true);
  }
  const n = kind === 'read' ? ri(rng, 2, 3) : ri(rng, 2, 3), pts = cpPoints(rng, n, N, L === 3), g = cpGrid(N, N, c, kind === 'read' ? pts : []), gk = cpGrid(N, N, c, pts.map(p => Object.assign({}, p, { key: true })));
  return vp('cplane', kind === 'read' ? 'Write each ordered pair.' : 'Plot and label each point.', { kind, N, pts, svg: g.svg, svgKey: gk.svg, sw: g.W, sh: g.H, sig: `cp${kind}${N}${pts.map(p => p.x + '.' + p.y).join('_')}` }, g.W / 100, g.H / 100, kind === 'read' ? 0.3 + n * 1.5 : 1.9, 0);
}

function vCplaneHtml(p, key, x) {
  if (p.kind === 'axes') return `<div class="wt">${esc(p.text)}</div><div>${x(p.ans, 2.4)}</div>`;
  if (p.kind === 'shift') return `<div class="wt">${esc(p.text)}</div><div>Q = (${x(String(p.nx), 2)}, ${x(String(p.ny), 2)})</div>`;
  const fig = vsvg(p.sw / 100, p.sh / 100, p.kind === 'plot' && key ? p.svgKey : p.svg, 'First quadrant coordinate grid');
  if (p.kind === 'read') return fig + p.pts.map(q => `<div>${q.l} = (${x(String(q.x), 2)}, ${x(String(q.y), 2)})</div>`).join('');
  return fig + `<div>${p.pts.map(q => `${q.l}(${q.x}, ${q.y})`).join(' &nbsp; ')}</div>`;
}

/* graphs from a rate: a table of ordered pairs, plotting them, and reading the graph in context.
   L1 rates 1 to 3 over 4 steps, L2 adds rates up to 5, L3 adds the difference between two points and what a point means. */
const CP_CTX = [
  ['Hours', 'Miles', nm => `${nm} bikes the same number of miles each hour.`, 'miles', 'hours', 'hour'],
  ['Weeks', 'Dollars', nm => `${nm} saves the same amount of money each week.`, 'dollars', 'weeks', 'week'],
  ['Minutes', 'Pages', nm => `${nm} reads the same number of pages each minute.`, 'pages', 'minutes', 'minute'],
  ['Boxes', 'Pencils', () => 'Each box holds the same number of pencils.', 'pencils', 'boxes', 'box']
];

const CP_TW = 2.8;   // inches of wrapped text beside/below a drawn graph
function vCpword(rng, L) {
  const [m, xmax] = pick(rng, [[1, 5], [1, 4], [2, 3], [2, 4], [2, 5], [3, 3], [3, 2], [4, 2], [5, 2]].filter(q => q[0] <= (L === 1 ? 2 : L === 2 ? 3 : 5))), Ny = Math.max(6, m * xmax + (m * xmax % 2)), [xl, yl, mk, yu, xu, xs] = pick(rng, CP_CTX), nm = pick(rng, NS_NAMES);
  const Nx = xmax + 1, c = Math.min(30, Math.floor(210 / Nx), Math.floor(190 / Ny));
  const pts = Array.from({ length: xmax }, (_, i) => ({ x: i + 1, y: m * (i + 1) })), grid = (pp) => cpGrid(Nx, Ny, c, pp, { named: true, xl, yl });
  const kind = pick(rng, L === 1 ? ['plot', 'read'] : L === 2 ? ['plot', 'read', 'read'] : ['plot', 'read', 'diff', 'mean']);
  const story = mk(nm), tab = `<div>${xl}: ${pts.map(q => q.x).join(', ')}</div><div>${yl}: ${pts.map(q => q.y).join(', ')}</div>`, base = { kind, m, xl, yl, yu, xu, xs, pts, Nx, Ny, story };
  const lines = (t) => Math.ceil(t.length / 24), hh = (g, t, extra) => g.H / 100 + 0.3 * lines(t) + extra, ww = (g) => Math.max(g.W / 100, CP_TW);
  if (kind === 'plot') {
    const g = grid([]), gk = grid(pts.map(q => Object.assign({ key: true }, q)));
    return vp('cpword', 'Graph the table.', Object.assign(base, { tab, svg: g.svg, svgKey: gk.svg, sw: g.W, sh: g.H, ans: 'plot', sig: `cw${kind}${m}${xl}${xmax}` }), ww(g), hh(g, story, 0.75), 0, 0);
  }
  const g = grid(pts), k = ri(rng, 1, xmax);
  const mkq = (q, a, extra, sg) => vp('cpword', kind === 'mean' ? 'What does the point mean?' : 'Use the graph.', Object.assign(base, { svg: g.svg, sw: g.W, sh: g.H, k, q, ans: a, sig: sg }, extra), ww(g), hh(g, q, 0.75), 0, 0);
  if (kind === 'read') return mkq(`${story} How many ${yu} after ${k} ${k === 1 ? xs : xu}?`, String(m * k), {}, `cw${kind}${m}${xl}${xmax}${k}`);
  if (kind === 'diff') { const a = ri(rng, 1, xmax - 1), b = ri(rng, a + 1, xmax);
    return mkq(`${story} How many more ${yu} after ${b} ${xu} than after ${a} ${a === 1 ? xs : xu}?`, String(m * (b - a)), { a, b }, `cw${kind}${m}${xl}${xmax}${a}${b}`); }
  return mkq(`${story} The point (${k}, ${m * k}) is on the graph.`, `${k}, ${m * k}`, {}, `cw${kind}${m}${xl}${xmax}${k}`);
}

const cpWrap = (t) => vwrap(t, CP_TW);
function vCpwordHtml(p, key, x) {
  const fig = vsvg(p.sw / 100, p.sh / 100, p.kind === 'plot' && key ? p.svgKey : p.svg, `Graph of ${p.yl} against ${p.xl}`);
  if (p.kind === 'plot') return `${cpWrap(p.story)}${p.tab}${fig}`;
  if (p.kind === 'mean') return `${fig}${cpWrap(p.q)}<div>After ${x(String(p.k), 1.8)} ${p.xu}, there are ${x(String(p.m * p.k), 2)} ${p.yu}.</div>`;
  return `${fig}${cpWrap(p.q)}<div>Answer: ${x(p.ans, 2.4)}</div>`;
}

/* scatterplots of discrete paired data. L1 plot four pairs from a table (8 by 8 grid), L2 plot five pairs or read one value from a scatterplot,
   L3 plot six pairs (10 by 10 grid) or say how one measure changes as the other goes up. */
const SC_CTX = [['Hours practiced', 'Goals scored', 'hours', 'goals'], ['Days of rain', 'Plants that grew', 'days', 'plants'], ['Weeks in the club', 'Badges earned', 'weeks', 'badges'],
  ['Minutes jogged', 'Laps run', 'minutes', 'laps'], ['Pages read', 'Minutes spent', 'pages', 'minutes'], ['Players on the team', 'Cheers heard', 'players', 'cheers']];
function vScatter(rng, L) {
  const N = L === 3 ? 10 : 8, c = L === 3 ? 22 : 26, n = L === 1 ? 4 : L === 2 ? 5 : 6, [xl, yl, xu, yu] = pick(rng, SC_CTX);
  const kind = L === 1 ? 'plot' : L === 2 ? pick(rng, ['plot', 'read']) : pick(rng, ['plot', 'trend']);
  const xs = shuffle(rng, Array.from({ length: N }, (_, i) => i + 1)).slice(0, n).sort((a, b) => a - b);
  let ys, dir = null;
  if (kind === 'trend') {
    dir = rng() < 0.5 ? 'up' : 'down';
    const ramp = Array.from({ length: n }, (_, i) => Math.min(N - 1, 1 + i + (rng() < 0.4 ? 1 : 0)));
    ys = dir === 'up' ? ramp : ramp.map(v => N + 1 - v - (rng() < 0.4 ? 0 : 0));
    ys = ys.map(v => Math.max(1, Math.min(N, v)));
  } else ys = shuffle(rng, Array.from({ length: N }, (_, i) => i + 1)).slice(0, n);
  const pts = xs.map((x, i) => ({ x, y: ys[i] })), grid = pp => cpGrid(N, N, c, pp, { named: true, xl, yl });
  const base = { kind, xl, yl, xu, yu, pts, N, sw: 0, sh: 0 }, tab = `<div>${esc(xl)}: ${xs.join(', ')}</div><div>${esc(yl)}: ${ys.join(', ')}</div>`, data = pts.map(q => q.x + '.' + q.y).join('_');
  if (kind === 'plot') {
    const g = grid([]), gk = grid(pts.map(q => Object.assign({ key: true }, q)));
    return vp('scatter', 'Make a scatterplot of the table.', Object.assign(base, { tab, svg: g.svg, svgKey: gk.svg, sw: g.W, sh: g.H, ans: 'plot', sig: `sc${kind}${xl}${data}` }), Math.max(g.W / 100, 2.8), g.H / 100 + 0.65, 0, 0);
  }
  const g = grid(pts);
  if (kind === 'read') { const q = pick(rng, pts); return vp('scatter', 'Use the scatterplot.', Object.assign(base, { svg: g.svg, sw: g.W, sh: g.H, q, ans: String(q.y), sig: `sc${kind}${xl}${data}${q.x}` }), Math.max(g.W / 100, 2.8), g.H / 100 + 0.95, 0, 0); }
  return vp('scatter', 'Use the scatterplot.', Object.assign(base, { svg: g.svg, sw: g.W, sh: g.H, dir, ans: dir === 'up' ? 'go up' : 'go down', opts: ['go up', 'go down'], sig: `sc${kind}${xl}${data}` }), Math.max(g.W / 100, 2.8), g.H / 100 + 1.4, 0, 0);
}
function vScatterHtml(p, key, x) {
  const fig = vsvg(p.sw / 100, p.sh / 100, p.kind === 'plot' && key ? p.svgKey : p.svg, `Scatterplot of ${p.yl} against ${p.xl}`);
  if (p.kind === 'plot') return `${p.tab}${fig}`;
  if (p.kind === 'read') return `${fig}${vwrap(`How many ${p.yu} are shown for ${p.q.x} ${p.xu}?`, 2.8)}<div>Answer: ${x(p.ans, 2)}</div>`;
  return `${fig}${vwrap(`As the number of ${p.xu} goes up, the number of ${p.yu} tends to`, 2.8)}<div>${vopts(p.opts, p.ans, key)}</div>`;
}

defTypes("vis", "Coordinate plane", [
  { id: "cplane", label: "Ordered pairs", blurb: "Read and plot points in the first quadrant, parts of an ordered pair, and moves along the axes.", on: false, gen: vCplane, html: vCplaneHtml },
  { id: "cpword", label: "Graphs of real-world tables", blurb: "Plot a table of ordered pairs, read the graph, and say what a point means.", on: false, gen: vCpword, html: vCpwordHtml },
  { id: "scatter", label: "Scatterplots of paired data", blurb: "Plot a table of paired data on a scatterplot, read a value, and say how one measure changes as the other goes up.", on: false, gen: vScatter, html: vScatterHtml }
]);
