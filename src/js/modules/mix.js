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
/* total problems from the chosen topics, split evenly and interleaved */
function mixItemsN(st, mods, total, seed) {
  const lists = mods.map((m, i) => mixGen(st, m, Math.floor(total / mods.length) + (i < total % mods.length ? 1 : 0), seed + '|mix|' + m));
  const out = [];
  for (let k = 0; out.length < total; k++) for (const l of lists) if (k < l.length) out.push(l[k]);
  return out;
}
const mixItems = st => mixItemsN(st, mixOn(st), st.arPerPage * st.pages, st.seed);
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
function mixSub(st) {
  const on = mixOn(st);
  return 'Solve each problem.' + (on.includes('fdp') ? ' Write fractions in simplest form.' : '') + (on.includes('muldiv') && st.md.div && st.md.rem ? ' Write remainders with R.' : '');
}
function renderMix(st) {
  const L = mixLayout(st), st2 = Object.assign({}, st, { pages: L.pages.length }), num = new Map();
  let n = 0;
  for (const pg of L.pages) for (const r of pg.rows) for (const i of r.idx) num.set(i, ++n);
  const make = key => L.pages.map((pg, pi) => {
    const rows = pg.rows.map(r => mixRowHtml(r, L.items, L.sizes, i => num.get(i), key)).join('');
    return sheetShell(st2, key, pi, mixSub(st), `<div class="flow" style="--fs:${L.fs}pt">${rows}</div>`);
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
