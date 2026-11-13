/* TEMPLATE for a new cell-based module (not included in the build; copy to modules/<id>.js and add it to src/index.html).
   Replace "demo" with the module id. Wiring checklist is in CLAUDE.md. */

/* 1. Generators. Each takes (rng, level-or-settings) and returns a problem object:
      { mod: 'demo', type, prompt, sig, ew, eh, ... }
   mod = module id, sig = string used to avoid duplicate problems, ew/eh = estimated answer-area size in em. */
function dGen1(rng, lvl) {
  const a = ri(rng, 2, 9 * lvl), b = ri(rng, 2, 9 * lvl);
  return { mod: 'demo', type: 'g1', prompt: `${a} + ${b} =`, ans: a + b, sig: `g1:${a}:${b}`, ew: 3, eh: 1.4 };
}
const DGEN = { g1: dGen1 };
const DEMO_TYPES = Object.keys(DGEN);

function genDemoN(rng, st, n, chunk) {
  const ids = DEMO_TYPES.filter(id => st.demo.types[id]);
  return genMixed(rng, ids.length ? ids : ['g1'], n, chunk, (id, r) => DGEN[id](r, st.demo.level), p => p.sig);
}

/* 2. Drawing: add a `case` for each type in modHtml() (core/cellkit.js) that returns the answer area html.
      Use ablank(value, isKey, widthEm) for a write-in blank that shows the value in red on the key. */

/* 3. Registration. arithPlan() picks font size and columns so every problem fits; counts = choices in the combined sheet. */
REG.demo = {
  name: 'Demo Module', counts: [5, 10, 15, 20, 30], n0: 10, on0: false,
  plan(st, n, seed) { return arithPlan(st, 'demo', genDemoN(rngFrom(seed), st, n, n)); }
};
