/* ---------- Shapes, Measures and Data (module id: vis) ----------
   The problem types live in the vis-*.js family files and register themselves with defTypes (core/types.js). */

REG.vis = {
  name: 'Shapes, Measures and Data', counts: [4, 6, 8, 12], n0: 6, on0: false,
  plan(st, n, seed) { return arithPlan(st, 'vis', genVisN(rngFrom(seed), st, n, n)); }
};


function visHtml(p, key, x) { return VHTML[p.type](p, key, x); }


function genVisN(rng, st, count, perPage) {
  const types = VIS_TYPES.filter(t => st.vis.types[t]); if (!types.length) types.push('cnt');
  const out = [], seen = SIG_SCOPE || new Set(); let g = 0;
  while (out.length < count && g++ < count * 60) { const p = VGEN[pick(rng, types)](rng, st.vis.level); if (seen.has(p.sig)) continue; seen.add(p.sig); out.push(p); }
  while (out.length < count) out.push(VGEN[pick(rng, types)](rng, st.vis.level));
  return out;
}

