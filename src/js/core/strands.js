/* ---------- Strand modules: the worksheet topics the person picks (notes/roadmap.md, Phase 5.2) ----------
   num (Number Sense), oa (Operations and Algebraic Thinking), frac (Fractions, Decimals and Percents), time (Time and Money),
   meas (Measurement and Data) and geom (Geometry, Area and Volume), next to addsub and muldiv.
   A strand module is a list of problem types taken from the generators that already exist. A type is named by a ref "<origin>.<id>":
   origin ns and vis are the type registry (types.js), fdp and tm are the Fractions and Time and Money generators.
   TYPE_HOME (typemeta.js) says which strand and group each ref belongs to. Settings: st[M] = { types: { ref: bool }, level }, plus unit and shade for geom.
   The older modules (ns, vis, area, fdp, tm) stay as legacy modules: they still generate and render exactly as before, so saved settings keep their sheets.
   When every checked type of a strand module comes from one origin, the origin's own generator runs with those types, so the problems are the ones
   the legacy module made for the same types, level and seed. */
const STRAND_IDS = ['num', 'oa', 'frac', 'time', 'meas', 'geom'];
const LEGACY_IDS = ['ns', 'vis', 'area', 'fdp', 'tm'];
const STRAND_OF_PLAN = { ns: 'num', oa: 'oa', fdp: 'frac', tm: 'time', meas: 'meas', geom: 'geom' };
const isStrand = m => STRAND_IDS.includes(m);
const refOrigin = r => r.slice(0, r.indexOf('.')), refId = r => r.slice(r.indexOf('.') + 1);
const STRAND_META = {
  num: { name: 'Number Sense', blurb: 'Counting, place value, comparing, rounding, factors and word problems.', counts: [5, 10, 15, 20, 30], n0: 10, def: 'ns.place', note: 'Number Sense' },
  oa: { name: 'Operations and Algebraic Thinking', blurb: 'Number bonds, equations, properties, order of operations and patterns.', counts: [5, 10, 15, 20, 30], n0: 10, def: 'ns.bond' },
  frac: { name: 'Fractions, Decimals and Percents', blurb: 'Models, comparing, operations, decimals and percents.', counts: [5, 10, 15, 20, 30], n0: 10, def: 'fdp.simp' },
  time: { name: 'Time and Money', blurb: 'Coins, change, clocks, elapsed time and conversions.', counts: [5, 10, 15, 20, 30], n0: 10, def: 'tm.coins' },
  meas: { name: 'Measurement and Data', blurb: 'Measuring, units, graphs, tallies and line plots.', counts: [4, 6, 8, 12], n0: 6, def: 'vis.cmpm' },
  geom: { name: 'Geometry, Area and Volume', blurb: 'Shapes, solids, angles, area and perimeter, volume and the coordinate plane.', counts: [4, 6, 8, 12], n0: 6, def: 'vis.shname' }
};
/* Groups whose cells are large drawings: they are left out of Mixed Practice (a part that has one of their types checked is sections only). */
const STRAND_NOMIX = new Set(['Shapes, solids and symmetry', 'Space and coordinates', 'Graphs and line plots']);
/* Labels of the types that are written into the Fractions and Time and Money panels rather than registered with defTypes. */
const HARD_TYPES = {
  'fdp.simp': ['Simplify fractions', 'Write a fraction in lowest terms.'], 'fdp.equiv': ['Equivalent fractions', 'Fill in the missing numerator or denominator.'],
  'fdp.cmp': ['Compare fractions', 'Write <, > or = between two fractions.'], 'fdp.fadd': ['Add and subtract fractions', 'Like and unlike denominators.'],
  'fdp.fmul': ['Multiply and divide fractions', 'Fraction of a number, products and quotients.'], 'fdp.decadd': ['Add and subtract decimals', 'Stacked with the decimal points lined up.'],
  'fdp.decmul': ['Multiply and divide decimals', 'Whole-number factors, decimal factors, powers of ten.'], 'fdp.conv': ['Convert fractions, decimals, percents', 'Six conversions between the three forms.'],
  'fdp.pct': ['Percent of a number', 'Such as 25% of 80.'],
  'tm.coins': ['Count the money', 'Add up coins and bills.'], 'tm.madd': ['Add and subtract money', 'Cents or dollars and cents.'], 'tm.change': ['Making change', 'Cost and amount paid, find the change.'],
  'tm.clock': ['Read the clock', 'Analog clock face, write the time.'], 'tm.dclock': ['Digital time', 'Draw the hands for a digital time, or write it in words.'],
  'tm.ampm': ['a.m. and p.m.', 'Choose a.m. or p.m. for an everyday event.'], 'tm.like': ['Count like coins', 'Pictured pennies, nickels, dimes or quarters.'],
  'tm.cpic': ['Count pictured money', 'Pictured coins, plus bills at Medium and Hard.'], 'tm.cstory': ['Money word problems', 'Money left, how much more, together, enough?'],
  'tm.elapsed': ['Elapsed time', 'Start and end time, find the time that passes.'], 'tm.conv': ['Time conversions', 'Seconds, minutes, hours, days and weeks.']
};
/* STRAND_GROUPS[M] = [{ family, defs: [{ id: ref, ref, origin, label, blurb, tags }] }] in TYPE_HOME order; STRAND_REFS[M] = every ref of M. */
const STRAND_GROUPS = {}, STRAND_REFS = {};
(function buildStrands() {
  const byRef = {};
  for (const o of ['ns', 'vis']) for (const d of TYPE_DEFS[o]) byRef[o + '.' + d.id] = Object.assign({ origin: o }, d);
  for (const M of STRAND_IDS) { STRAND_GROUPS[M] = []; STRAND_REFS[M] = []; }
  for (const [ref, [planMod, group]] of Object.entries(TYPE_HOME)) {
    const M = STRAND_OF_PLAN[planMod], h = HARD_TYPES[ref], o = refOrigin(ref);
    const d = byRef[ref] ? { id: ref, ref, origin: o, label: byRef[ref].label, blurb: byRef[ref].blurb, tags: typeTags(o, byRef[ref]) }
      : { id: ref, ref, origin: o, label: h[0], blurb: h[1], tags: typeTags(o, { id: refId(ref), label: h[0] }) };
    let g = STRAND_GROUPS[M].find(x => x.family === group); if (!g) STRAND_GROUPS[M].push(g = { family: group, defs: [] });
    g.defs.push(d); STRAND_REFS[M].push(ref);
  }
})();
const strandDefaults = M => ({ types: Object.fromEntries(STRAND_REFS[M].map(r => [r, r === STRAND_META[M].def])), level: 2 });

/* Problems for a strand module. */
const ORIGIN_STORE = { ns: 'ns', vis: 'vis', fdp: 'fd', tm: 'tm' };
function strandRefs(st, M) {
  const t = st[M].types, on = STRAND_REFS[M].filter(r => t[r]);
  return on.length ? on : [STRAND_META[M].def];
}
function genStrandN(rng, st, M, n, chunk) {
  const refs = strandRefs(st, M), s = st[M], L = s.level, origins = [...new Set(refs.map(refOrigin))];
  const unit = M === 'geom' && s.unit ? s.unit : 'units', shade = M === 'geom' ? s.shade !== false : true;
  if (origins.length === 1) {
    const o = origins[0], N = { ns: genNsN, vis: genVisN, fdp: genFdpN, tm: genTmN }[o];
    const s2 = Object.assign({}, st, { module: o, unit, shade, [ORIGIN_STORE[o]]: { types: Object.fromEntries(refs.map(r => [refId(r), true])), level: L } });
    return N(rng, s2, n, chunk);
  }
  GRID_CTX.unit = unit; GRID_CTX.shade = shade;
  const G = { ns: NGEN, vis: VGEN, fdp: FGEN, tm: TGEN };
  return genMixed(rng, refs, n, chunk, (r, rr) => G[refOrigin(r)][refId(r)](rr, L), p => p.sig);
}
for (const M of STRAND_IDS) {
  const m = STRAND_META[M];
  REG[M] = { name: m.name, counts: m.counts, n0: m.n0, on0: false, plan(st, n, seed) { return arithPlan(st, M, genStrandN(rngFrom(seed), st, M, n, n)); } };
}
CELL_MODS.push(...STRAND_IDS);
/* The module list: Mixed and Combined first (they are filtered out of the single-topic list), then the picker order, then the legacy modules, which the picker hides. */
(function orderModules() {
  const old = Object.assign({}, MODULES); for (const k of Object.keys(MODULES)) delete MODULES[k];
  const strands = Object.fromEntries(STRAND_IDS.map(M => [M, { name: STRAND_META[M].name, blurb: STRAND_META[M].blurb }]));
  const legacy = Object.fromEntries(LEGACY_IDS.map(k => [k, Object.assign({ legacy: true }, old[k])]));
  Object.assign(MODULES, { mix: old.mix, combo: old.combo, addsub: old.addsub, muldiv: old.muldiv }, strands, legacy);
})();

/* ---------- legacy settings to strand settings ----------
   A preset-shaped legacy setting { m, ns|vis|fd|tm|area: { types, level } } becomes one entry per strand module the types belong to:
   [{ m: <strand>, <strand>: { types: [refs], level, (unit, shade) } }]. Used for the standards presets, for saved worksheets and for saved parts. */
function legacyRefs(m, s) {
  const o = { ns: 'ns', vis: 'vis', fdp: 'fdp', tm: 'tm' }[m];
  if (o) return (s[{ ns: 'ns', vis: 'vis', fdp: 'fd', tm: 'tm' }[m]].types || []).map(i => o + '.' + i);
  if (m === 'area') return (s.area.types || []).map(i => 'vis.a' + i);
  return null;
}
function strandsFromLegacy(m, s) {
  const refs = legacyRefs(m, s); if (!refs) return null;
  const level = m === 'area' ? s.area.level : s[{ ns: 'ns', vis: 'vis', fdp: 'fd', tm: 'tm' }[m]].level, out = [];
  for (const r of refs) {
    const M = STRAND_OF_PLAN[TYPE_HOME[r][0]];
    let e = out.find(x => x.m === M);
    if (!e) { e = { m: M, [M]: { types: [], level } }; if (m === 'area') { if (s.area.unit) e[M].unit = s.area.unit; if (s.area.shade != null) e[M].shade = !!s.area.shade; } out.push(e); }
    e[M].types.push(r);
  }
  return out;
}
/* A whole worksheet state with a legacy module, turned into the strand module it belongs to. Returns false when nothing changed.
   When the checked types span several strand modules, the sheet becomes a Combined Worksheet with one part for each. */
function migrateLegacyState(st) {
  const m = st.module;
  if (!LEGACY_IDS.includes(m)) return false;
  const s = m === 'area' ? { area: { types: Object.keys(st.types).filter(k => st.types[k]), level: st.level, unit: st.unit, shade: st.shade } }
    : { [{ ns: 'ns', vis: 'vis', fdp: 'fd', tm: 'tm' }[m]]: { types: Object.keys(st[{ ns: 'ns', vis: 'vis', fdp: 'fd', tm: 'tm' }[m]].types).filter(k => st[{ ns: 'ns', vis: 'vis', fdp: 'fd', tm: 'tm' }[m]].types[k]), level: st[{ ns: 'ns', vis: 'vis', fdp: 'fd', tm: 'tm' }[m]].level } };
  const list = strandsFromLegacy(m, s);
  if (!list || !list.length) return false;
  const title = st.titles && st.titles[m];
  if (list.length === 1) {
    const M = list[0].m; st[M] = Object.assign(strandDefaults(M), { types: stdMap(list[0][M].types, STRAND_REFS[M]), level: list[0][M].level });
    if (M === 'geom') { st.geom.unit = list[0].geom.unit || st.unit; st.geom.shade = list[0].geom.shade != null ? list[0].geom.shade : st.shade; }
    st.module = M; if (title && st.titles) st.titles[M] = title;
    return true;
  }
  st.parts = list.map(e => Object.assign({ m: e.m, n: REG[e.m].n0, label: '' }, { [e.m]: e[e.m] }));
  st.module = 'combo'; return true;
}
/* Saved parts that use a legacy module become parts of the strand modules their types belong to (one part, or several when the types span strands).
   A part without its own settings takes the legacy module's current settings from st. */
function migrateParts(st, parts) {
  const out = [];
  for (const p of parts) {
    if (!LEGACY_IDS.includes(p.m)) { out.push(p); continue; }
    const key = PART_KEY[p.m], s = p[key] ? p : captureSettings(st, p.m);
    const list = strandsFromLegacy(p.m, s);
    if (!list || !list.length) { out.push(p); continue; }
    list.forEach((e, i) => {
      const counts = REG[e.m].counts, want = p.n / list.length;
      const n = list.length === 1 && counts.includes(p.n) ? p.n : counts.reduce((a, c) => Math.abs(c - want) < Math.abs(a - want) ? c : a, counts[0]);
      const np = { m: e.m, n, label: p.label || '', [e.m]: e[e.m] };
      if (p.mix && i === 0) np.mix = true;
      out.push(np);
    });
  }
  return out;
}
/* A part can join a Mixed Practice flow when its module is mixable and none of its checked types is in a group of large drawings. */
function partMixable(st, p) {
  if (!MIX_MODS.includes(p.m)) return false;
  if (!isStrand(p.m)) return true;
  const own = p[p.m] && p[p.m].types, refs = Array.isArray(own) ? own : (st && st[p.m] ? STRAND_REFS[p.m].filter(r => st[p.m].types[r]) : []);
  return !refs.some(r => STRAND_NOMIX.has(TYPE_HOME[r][1]));
}
