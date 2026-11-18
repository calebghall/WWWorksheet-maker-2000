/* Set-code regression: the same set code and settings must keep producing the same worksheets.
   Hashes the rendered pages (and the generated problems) for fixed seeds across every module, Combined and Mixed
   variants, and every standards preset, then compares them with tests/golden-sets.json.
   Usage: node tests/logic-setcodes.js            compare with the golden file
          node tests/logic-setcodes.js --update   rewrite the golden file (only for an announced output change) */
const fs = require('fs'), vm = require('vm'), path = require('path'), crypto = require('crypto');
const html = fs.readFileSync(path.join(__dirname, '..', 'WWWorksheet-maker-2000.html'), 'utf8');
const js = html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx = { Math, console, globalThis: null }; ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(js, ctx);
const SP = ctx.__SP, GOLDEN = path.join(__dirname, 'golden-sets.json');
const h = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
const clone = o => JSON.parse(JSON.stringify(o));
const allOn = o => { for (const k of Object.keys(o.types)) o.types[k] = true; return o; };

const got = {};
function put(key, st) {
  let out = SP.renderAll(st), extra = '';
  if (st.module === 'combo') extra = JSON.stringify(SP.comboSections(st).map(s => [s.id, s.letter, s.start, s.plan.probs.map(p => p.sig)]));
  else if (st.module === 'mix') extra = JSON.stringify(SP.mixItems(st).map(it => it.p.sig));
  else if (st.module !== 'area') extra = JSON.stringify(SP.generateSet(st).map(p => p.sig));
  got[key] = h(out + '\n' + extra + '\n' + JSON.stringify(SP.META));
}
const STRANDS = ['num', 'oa', 'frac', 'time', 'meas', 'geom'], LEGACY_REG = id => !STRANDS.includes(id);
const MODS = ['area', 'addsub', 'muldiv', 'fdp', 'ns', 'tm', 'vis', 'mix', 'combo'].concat(STRANDS);
for (const mod of MODS) for (const seed of ['S1', 'S2', 'S3']) for (const paper of ['letter', 'a4']) {
  const st = SP.defaults(); Object.assign(st, { module: mod, seed, paper, pages: 2 });
  put(`default|${mod}|${seed}|${paper}`, st);
}
/* every problem type on, at each level */
for (const mod of ['fdp', 'ns', 'tm', 'vis'].concat(STRANDS)) for (const level of [1, 2, 3]) {
  const st = SP.defaults(), key = mod === 'fdp' ? 'fd' : mod; Object.assign(st, { module: mod, seed: 'T' + level, pages: 2 });
  allOn(st[key]); st[key].level = level; put(`alltypes|${mod}|${level}`, st);
}
for (const [mod, o] of [['addsub', { d1: 4, d2: 3, regroup: 'required', format: 'horizontal' }], ['addsub', { add: false, sub: true, d1: 3, d2: 3, regroup: 'none' }], ['addsub', { addends: 4, cap: 20, d1: 1, d2: 1 }],
  ['muldiv', { mode: 'digits', da: 3, db: 2, na: 4, nb: 2, rem: true }], ['muldiv', { mode: 'digits', alt: true, da: 4, db: 1, da2: 2, db2: 2, div: false }], ['muldiv', { focus: 7, format: 'horizontal' }]]) {
  const st = SP.defaults(); Object.assign(st, { module: mod, seed: 'M1', pages: 2 }); Object.assign(st[mod === 'addsub' ? 'as' : 'md'], o);
  put(`custom|${mod}|${JSON.stringify(o)}`, st);
}
for (const lvl of [1, 2, 3]) { const st = SP.defaults(); Object.assign(st, { module: 'area', seed: 'A' + lvl, level: lvl, pages: 2 }); allOn(st); put(`area|${lvl}`, st); }
/* Combined: every section on at each count, and a mix of on/off patterns */
for (let i = 0; i < 6; i++) {
  const st = SP.defaults(); Object.assign(st, { module: 'combo', seed: 'C' + i, paper: i % 2 ? 'a4' : 'letter' });
  /* the sections that existed before the strand modules; the strand modules have their own entries above */
  Object.keys(st.combo).filter(LEGACY_REG).forEach((id, k) => { st.combo[id].on = (i + k) % 3 !== 0; st.combo[id].n = SP.REG[id].counts[(i + k) % SP.REG[id].counts.length]; });
  put(`combo|${i}`, st);
}
/* Mixed: each topic subset, standalone */
for (const mods of [['addsub'], ['muldiv', 'fdp'], ['addsub', 'muldiv', 'fdp', 'ns', 'tm'], ['ns', 'tm']]) {
  const st = SP.defaults(); Object.assign(st, { module: 'mix', seed: 'X1', pages: 2 });
  for (const k of Object.keys(st.mix.mods)) st.mix.mods[k] = mods.includes(k);
  put(`mix|${mods.join('+')}`, st);
}
/* every standards preset */
/* keyed by the Tennessee code, through the crosswalk, as before the canonical ids */
for (const code of Object.keys(SP.STD_XW.tn)) if (SP.stdPreset(code)) for (const seed of ['A', 'B']) {
  const st = SP.defaults(); Object.assign(st, { seed, pages: 2 }); SP.applyStandard(st, code);
  put(`std|${code}|${seed}`, st);
}

if (process.argv.includes('--update')) {
  fs.writeFileSync(GOLDEN, JSON.stringify(got, null, 0).replace(/,"/g, ',\n"') + '\n');
  console.log('golden file written:', Object.keys(got).length, 'entries'); process.exit(0);
}
const gold = JSON.parse(fs.readFileSync(GOLDEN, 'utf8')), bad = [];
for (const k of Object.keys(gold)) if (got[k] !== gold[k]) bad.push(k + (got[k] ? ' changed' : ' missing'));
const extra = Object.keys(got).filter(k => !(k in gold));
console.log('set-code regression', Object.keys(gold).length, 'sheets compared; changed', bad.length, '; not in golden', extra.length);
if (bad.length) console.log(bad.slice(0, 20));
if (extra.length) console.log('new entries (run with --update after announcing the change):', extra.slice(0, 10));
process.exit(bad.length || extra.length ? 1 : 0);
