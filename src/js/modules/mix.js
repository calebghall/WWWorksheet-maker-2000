/* ---------- mixed practice: problems from several topics, flow layout ---------- */
const MIX_MODS = ['addsub', 'muldiv', 'fdp', 'ns', 'tm'];
const MIX_GX = 0.15, MIX_GY = 0.1, MIX_SIZES = [14, 13, 12, 11, 10];
/* Measured ratios of the size hints (needSize) to the real rendered size, smallest over many samples at 10 to 14 pt: [width, height].
   The hints are deliberately generous so grid cells never clip; flow packing trims them back, keeping 6% spare. */
const FLOW_FIT = {
  'addsub:add': [1.32, 1.43], 'addsub:sub': [1.32, 1.43], 'addsub:add:v': [1.12, 1.13], 'addsub:sub:v': [1.14, 1.16],
  'muldiv:mul': [1.37, 1.43], 'muldiv:div': [1.38, 1.43], 'muldiv:mul:v': [1.11, 1.16], 'muldiv:div:v': [1.46, 1.76],
  'fdp:equiv': [1.22, 1.21], 'fdp:fadd': [1.36, 1.21], 'fdp:simp': [1.16, 1.21], 'fdp:decadd': [1.26, 1.1], 'fdp:cmp': [1.26, 1.22], 'fdp:pct': [1.17, 1.17], 'fdp:conv': [1.08, 1.21],
  'ns:compare': [1.31, 1.19], 'ns:round': [1.1, 1.17], 'ns:place': [1.17, 1.17], 'ns:skip': [1.12, 1.17], 'ns:order': [1.19, 1.17], 'ns:est': [1.15, 1.17],
  'tm:coins': [1.39, 1.13], 'tm:change': [1.82, 1.16], 'tm:conv': [1.25, 1.17], 'tm:madd': [1.23, 1.17], 'tm:elapsed': [1.67, 1.16]
};
/* Space item it needs at type size fs, in inches, capped to the page width cw. */
function mixSize(it, fs, cw) {
  const [w, h] = needSize(it.p, fs, it.horiz), key = it.mod + ':' + it.p.type + (!it.horiz && (it.mod === 'addsub' || it.mod === 'muldiv') ? ':v' : '');
  const [rw, rh] = FLOW_FIT[key] || [1, 1];
  return { w: Math.min(w * Math.min(1, 1.06 / rw), cw), h: Math.ceil(h * Math.min(1, 1.06 / rh) * 20) / 20 };
}
const mixOn = st => { const on = MIX_MODS.filter(id => st.mix.mods[id]); return on.length ? on : [MIX_MODS[0]]; };

/* Problems from one topic, using that topic's own settings. Returns items { p, mod, horiz }. */
function mixGen(st, mod, n, seed) {
  const s2 = Object.assign({}, st, { module: mod }), rng = rngFrom(seed);
  const ps = mod === 'fdp' ? genFdpN(rng, s2, n, n) : mod === 'ns' ? genNsN(rng, s2, n, n) : mod === 'tm' ? genTmN(rng, s2, n, n) : genArithN(rng, s2, mod, n, n);
  const horiz = modFormat(st, mod) === 'horizontal';
  return ps.map(p => ({ p, mod, horiz }));
}
/* Splits total problems across parts by weight (the parts' n). Equal weights split evenly, the first parts taking the extra
   problems, which is how topics have always been split; otherwise largest remainder. */
function mixSplit(weights, total) {
  const k = weights.length;
  if (weights.every(w => w === weights[0])) return weights.map((w, i) => Math.floor(total / k) + (i < total % k ? 1 : 0));
  const sum = weights.reduce((a, b) => a + b, 0), raw = weights.map(w => total * w / sum), cnt = raw.map(Math.floor);
  let left = total - cnt.reduce((a, b) => a + b, 0);
  raw.map((r, i) => [r - cnt[i], i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).forEach(([, i]) => { if (left-- > 0) cnt[i]++; });
  return cnt;
}
/* The parts Mixed Practice draws from: the worksheet's parts that use a mixable topic, otherwise one part per checked topic. */
function mixPartsOf(st) {
  const given = Array.isArray(st.parts) ? st.parts.filter(p => MIX_MODS.includes(p.m)) : [];
  return given.length ? given : mixOn(st).map(m => ({ m, n: 1 }));
}
/* total problems from the parts, split by weight and interleaved; each part runs with its own settings */
function mixItemsP(st, parts, total, seed) {
  const counts = mixSplit(parts.map(p => p.n), total), used = {}, tot = {}, scope = {};
  for (const p of parts) tot[p.m] = (tot[p.m] || 0) + 1;
  const lists = parts.map((p, i) => {
    const k = used[p.m] = (used[p.m] || 0) + 1;
    if (tot[p.m] > 1) SIG_SCOPE = scope[p.m] || (scope[p.m] = new Set());
    try { return mixGen(partState(st, p), p.m, counts[i], seed + '|mix|' + p.m + (k > 1 ? '|' + k : '')); } finally { SIG_SCOPE = null; }
  });
  const out = [];
  for (let k = 0; out.length < total; k++) for (const l of lists) if (k < l.length) out.push(l[k]);
  return out;
}
const mixItemsN = (st, mods, total, seed) => mixItemsP(st, mods.map(m => ({ m, n: 1 })), total, seed);
const mixItems = st => mixItemsP(st, mixPartsOf(st), st.arPerPage * st.pages, st.seed);
/* HTML for one flow row. numOf(i) gives the problem number of item i. */
function mixRowHtml(r, items, sizes, numOf, key) {
  return `<div class="fl-row" style="height:${r.h}in">` + r.idx.map((i, k) =>
    `<div class="fl-c" style="grid-column:span ${r.span[k]}">${renderArithCell(items[i].p, numOf(i), items[i].horiz, key)}</div>`).join('') + '</div>';
}
/* Largest type size at which everything fits within the requested pages; the smallest size when none does. */
function mixLayout(st) {
  const P = PAPER[st.paper], cw = P.w - 1.1, bodyH = P.h - 2.25, items = mixItems(st);
  let last = null;
  for (const fs of MIX_SIZES) {
    const sizes = items.map(it => mixSize(it, fs, cw));
    const pages = flowPack(sizes, rngFrom(st.seed + '|flow'), cw, bodyH, MIX_GX, MIX_GY);
    last = { fs, items, sizes, pages };
    if (pages.length <= st.pages) break;
  }
  return last;
}
function mixSub(st, parts) {
  parts = parts || mixOn(st).map(m => ({ m, n: 1 }));
  const rem = parts.some(p => { if (p.m !== 'muldiv') return false; const s = partState(st, p); return s.md.div && s.md.rem; });
  return 'Solve each problem.' + (parts.some(p => p.m === 'fdp') ? ' Write fractions in simplest form.' : '') + (rem ? ' Write remainders with R.' : '');
}
function renderMix(st) {
  const L = mixLayout(st), st2 = Object.assign({}, st, { pages: L.pages.length }), num = new Map();
  let n = 0;
  for (const pg of L.pages) for (const r of pg.rows) for (const i of r.idx) num.set(i, ++n);
  const make = key => L.pages.map((pg, pi) => {
    const rows = pg.rows.map(r => mixRowHtml(r, L.items, L.sizes, i => num.get(i), key)).join('');
    return sheetShell(st2, key, pi, mixSub(st, mixPartsOf(st)), `<div class="flow" style="--fs:${L.fs}pt">${rows}</div>`);
  }).join('');
  META.problems = L.items.length; META.pages = L.pages.length;
  META.note = L.pages.length < st.pages ? `fits on ${L.pages.length} page${L.pages.length === 1 ? '' : 's'}` : '';
  return make(false) + (st.key ? make(true) : '');
}

/* As a section of the Combined Worksheet: one block of flow rows that comboPages splits across pages by row height. */
const MIX_COMBO_FS = 12;
REG.mix = {
  name: 'Mixed Practice', counts: [10, 15, 20, 30], n0: 10, on0: false,
  plan(st, n, seed) {
    const cw = PAPER[st.paper].w - 1.1, items = mixItemsN(st, mixOn(st), n, seed);
    const sizes = items.map(it => mixSize(it, MIX_COMBO_FS, cw));
    const rows = flowPack(sizes, rngFrom(seed + '|flow'), cw, Infinity, MIX_GX, MIX_GY)[0].rows;
    const rowFrom = []; let c = 0;
    for (const r of rows) { rowFrom.push(c); c += r.idx.length; }
    return {
      sub: mixSub(st), probs: items.map(it => it.p), flowRows: rows, gap: MIX_GY, fs: MIX_COMBO_FS,
      flowHtml: (a, b, start, key) => rows.slice(a, b).map((r, k) => mixRowHtml(r, items, sizes, i => start + rowFrom[a + k] + r.idx.indexOf(i), key)).join('')
    };
  }
};
