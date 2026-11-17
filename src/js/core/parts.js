/* ---------- Parts: several configurations of one worksheet, each with its own module and settings ----------
   A part is { m, n, label, <settings key>: settings }. The settings key and shape match a standards preset
   (see standards.js), so a single-module preset is a part without n. A part without a settings key uses the
   module's own panel settings, which is how a Combined Worksheet without parts is read (partsOf derives them).
   Settings keys: addsub as, muldiv md, fdp fd, ns ns, tm tm, vis vis, area area, mix mix. */
const PART_KEY = { addsub: 'as', muldiv: 'md', fdp: 'fd', ns: 'ns', tm: 'tm', vis: 'vis', area: 'area', mix: 'mix', num: 'num', oa: 'oa', frac: 'frac', time: 'time', meas: 'meas', geom: 'geom' };
const PART_MAX = 16;
/* Set of problem signatures shared by the parts of one module while they generate, so two parts of the same
   module do not print an identical problem. null (the default) leaves generation exactly as it was. */
let SIG_SCOPE = null;

const inEnum = (v, list, d) => list.includes(v) ? v : d;

/* Writes a preset-shaped settings object (s.m, s.<key>) into st: the module's settings only. */
function applyModSettings(st, s) {
  const m = s.m;
  if (m === 'addsub') st.as = Object.assign({}, s.as);
  else if (m === 'muldiv') st.md = Object.assign({}, s.md);
  else if (m === 'fdp') st.fd = { types: stdMap(s.fd.types, FD_TYPES), level: s.fd.level };
  else if (m === 'ns') st.ns = { types: stdMap(s.ns.types, NS_TYPES), level: s.ns.level };
  else if (m === 'vis') st.vis = { types: stdMap(s.vis.types, VIS_TYPES), level: s.vis.level };
  else if (m === 'tm') st.tm = { types: stdMap(s.tm.types, Object.keys(TGEN)), level: s.tm.level };
  else if (m === 'area') {
    st.types = stdMap(s.area.types, TYPE_IDS); st.level = s.area.level;
    if (s.area.unit) st.unit = s.area.unit;
    if (s.area.shade != null) st.shade = !!s.area.shade;
  } else if (m === 'mix') st.mix = { mods: stdMap(s.mix.mods, MIX_MODS) };
  else if (isStrand(m)) {
    st[m] = { types: stdMap(s[m].types, STRAND_REFS[m]), level: s[m].level };
    if (m === 'geom') { st.geom.unit = s.geom.unit || 'units'; st.geom.shade = s.geom.shade == null ? true : !!s.geom.shade; }
  }
  return st;
}

/* The state a part runs with: the worksheet state plus the part's own module settings. */
function partState(st, part) {
  if (!part[PART_KEY[part.m]]) return st;
  return applyModSettings(Object.assign({}, st, { module: part.m }), part);
}

const enabledIds = o => Object.keys(o).filter(k => o[k]);
/* The current panel settings of a module, as part settings. */
function captureSettings(st, mod) {
  const key = PART_KEY[mod], o = {};
  if (mod === 'addsub') o.as = Object.assign({}, st.as);
  else if (mod === 'muldiv') o.md = Object.assign({}, st.md);
  else if (mod === 'area') o.area = { types: enabledIds(st.types), level: st.level, unit: st.unit, shade: !!st.shade };
  else if (mod === 'mix') o.mix = { mods: enabledIds(st.mix.mods) };
  else if (key) {
    o[key] = { types: enabledIds(st[key].types), level: st[key].level };
    if (mod === 'geom') { o.geom.unit = st.geom.unit; o.geom.shade = !!st.geom.shade; }
  }
  return o;
}
function makePart(st, mod, n, label) {
  return Object.assign({ m: mod, n: n != null ? n : REG[mod].n0, label: label || '' }, captureSettings(st, mod));
}

/* The parts of a worksheet: st.parts when set, otherwise one part for each Combined section that is on, in module order. */
function partsOf(st) {
  if (Array.isArray(st.parts) && st.parts.length) return st.parts;
  const out = [];
  for (const id of Object.keys(REG)) { const c = st.combo && st.combo[id]; if (c && c.on) out.push({ m: id, n: c.n }); }
  return out;
}

/* Clamps every module's settings in place (saved values from older versions or from a hand-edited file). */
function clampMod(out) {
  out.level = inEnum(+out.level, [1, 2, 3], 2);
  out.unit = inEnum(out.unit, Object.keys(UNITS), 'units');
  out.as.d1 = inEnum(+out.as.d1, [1, 2, 3, 4, 5, 6], 2);
  out.as.d2 = inEnum(+out.as.d2, [1, 2, 3, 4, 5, 6], 2);
  out.as.addends = inEnum(+out.as.addends, [2, 3, 4], 2);
  out.as.cap = inEnum(+out.as.cap, [0, 10, 20, 30, 100, 1000, 1000000], 0);
  out.as.second = inEnum(out.as.second, ['digits', 'tens', 'mix'], 'digits');
  out.as.regroup = inEnum(out.as.regroup, ['any', 'required', 'none'], 'any');
  out.as.format = inEnum(out.as.format, ['vertical', 'horizontal'], 'vertical');
  out.md.mode = inEnum(out.md.mode, ['facts', 'digits'], 'facts');
  out.md.da = inEnum(+out.md.da, [1, 2, 3, 4], 2);
  out.md.db = inEnum(+out.md.db, [1, 2, 3], 1);
  out.md.alt = !!out.md.alt;
  out.md.da2 = inEnum(+out.md.da2, [1, 2, 3, 4], 2);
  out.md.db2 = inEnum(+out.md.db2, [1, 2, 3], 2);
  out.md.na = inEnum(+out.md.na, [2, 3, 4, 5], 3);
  out.md.nb = inEnum(+out.md.nb, [1, 2], 1);
  out.md.tables = inEnum(+out.md.tables, [5, 9, 10, 12], 10);
  out.md.focus = inEnum(+out.md.focus, [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 0);
  out.md.format = inEnum(out.md.format, ['vertical', 'horizontal'], 'vertical');
  out.fd.level = inEnum(+out.fd.level, [1, 2, 3], 2);
  out.ns.level = inEnum(+out.ns.level, [1, 2, 3], 2);
  out.tm.level = inEnum(+out.tm.level, [1, 2, 3], 2);
  out.vis.level = inEnum(+out.vis.level, [1, 2, 3], 2);
  if (!Object.values(out.vis.types).some(Boolean)) out.vis.types.cnt = true;
  if (!Object.values(out.fd.types).some(Boolean)) out.fd.types.simp = true;
  if (!Object.values(out.ns.types).some(Boolean)) out.ns.types.place = true;
  if (!Object.values(out.mix.mods).some(Boolean)) out.mix.mods.addsub = true;
  for (const M of STRAND_IDS) {
    const o = out[M]; o.level = inEnum(+o.level, [1, 2, 3], 2);
    for (const k of Object.keys(o.types)) if (!STRAND_REFS[M].includes(k)) delete o.types[k];
    if (!Object.values(o.types).some(Boolean)) o.types[STRAND_META[M].def] = true;
  }
  out.geom.unit = inEnum(out.geom.unit, Object.keys(UNITS), 'units'); out.geom.shade = out.geom.shade !== false;
  if (!Object.values(out.tm.types).some(Boolean)) out.tm.types.coins = true;
  if (!out.as.add && !out.as.sub) out.as.add = true;
  if (!out.md.mul && !out.md.div) out.md.mul = true;
  if (!Object.values(out.types).some(Boolean)) out.types.count = true;
  return out;
}

/* A part read from saved settings or a file: unknown module drops the part; counts and settings are clamped. */
function normPart(part) {
  if (!part || typeof part !== 'object' || !REG[part.m]) return null;
  const m = part.m, key = PART_KEY[m], out = { m, n: inEnum(+part.n, REG[m].counts, REG[m].n0), label: String(part.label || '').slice(0, 60) };
  const given = part[key];
  if (!given || typeof given !== 'object') return out;
  const tmp = defaults(); tmp.module = m;
  const list = v => Array.isArray(v) ? v.map(String) : [];
  const s = { m };
  if (m === 'addsub') s.as = Object.assign(tmp.as, given);
  else if (m === 'muldiv') s.md = Object.assign(tmp.md, given);
  else if (m === 'area') s.area = { types: list(given.types), level: given.level, unit: given.unit, shade: given.shade };
  else if (m === 'geom') s.geom = { types: list(given.types), level: given.level, unit: given.unit, shade: given.shade };
  else if (m === 'mix') s.mix = { mods: list(given.mods) };
  else s[key] = { types: list(given.types), level: given.level };
  applyModSettings(tmp, s); clampMod(tmp);
  return Object.assign(out, captureSettings(tmp, m));
}
function normParts(arr) {
  const out = Array.isArray(arr) ? arr.slice(0, PART_MAX).map(normPart).filter(Boolean) : [];
  return out.length ? out : null;
}
