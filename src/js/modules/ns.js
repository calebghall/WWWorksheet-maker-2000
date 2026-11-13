/* ---------- Number Sense (module id: ns) ----------
   The problem types live in the ns-*.js family files and register themselves with defTypes (core/types.js). */

function genNsN(rng, st, n, chunk) {
  const ids = NS_TYPES.filter(id => st.ns.types[id]);
  return genMixed(rng, ids.length ? ids : ['place'], n, chunk, (id, r) => NGEN[id](r, st.ns.level), p => p.sig);
}


REG.ns = {
  name: 'Number Sense', counts: [5, 10, 15, 20, 30], n0: 10, on0: false,
  plan(st, n, seed) { return arithPlan(st, 'ns', genNsN(rngFrom(seed), st, n, n)); }
};

