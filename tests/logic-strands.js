/* Strand modules (Phase 5.2b): every type generates at every level, a strand module with types from one origin produces the problems the legacy module made,
   legacy saved states migrate to the right strand module, and group-level mixing follows the flags. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'WWWorksheet-maker-2000.html'), 'utf8');
const js = html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx = { Math, console, globalThis: null }; ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(js, ctx);
const SP = ctx.__SP, bad = []; let checks = 0; const ok = (c, m) => { checks++; if (!c) bad.push(m); };
const D = () => SP.defaults(), J = JSON.stringify, sigs = ps => ps.map(p => p.sig || p.type);
const STORE = { ns: 'ns', vis: 'vis', fdp: 'fd', tm: 'tm' };

/* 1. every ref, every level: generates, carries a signature and a module, and the module renders */
let refs = 0;
for (const M of SP.STRAND_IDS) {
  for (const ref of SP.STRAND_REFS[M]) for (const L of [1, 2, 3]) {
    refs++;
    const st = D(); st.module = M; st.seed = 'Q' + L; st.pages = 1;
    for (const k of Object.keys(st[M].types)) st[M].types[k] = k === ref; st[M].level = L;
    let ps; try { ps = SP.generateSet(st); } catch (e) { ok(false, `${M} ${ref} L${L} threw ${e.message}`); continue; }
    ok(ps.length > 0 && ps.every(p => p.sig && p.mod), `${M} ${ref} L${L} problems`);
  }
  const st = D(); st.module = M; st.seed = 'R1'; st.pages = 2; st[M].level = 2; for (const k of Object.keys(st[M].types)) st[M].types[k] = true;
  try { const out = SP.renderAll(st); ok(out.includes('sheet'), M + ' renders'); } catch (e) { ok(false, M + ' render threw ' + e.message); }
}
ok(refs === 3 * 158, 'ref count ' + refs);

/* 2. one origin: the strand module makes the legacy module's problems for the same types, level and seed */
{
  const subsets = { ns: [['place'], ['kseq', 'cfwd'], ['bond', 'eqn', 'exeval'], ['fadd5', 'fdiv5', 'f100']], vis: [['cnt'], ['shname', 'solid'], ['cmpm', 'ruler', 'mtwo']], fdp: [['simp'], ['decadd', 'pct']], tm: [['coins', 'change'], ['clock']] };
  for (const [o, lists] of Object.entries(subsets)) for (const ids of lists) for (const L of [1, 2, 3]) {
    const legacy = D(); legacy.module = o; legacy.seed = 'Z' + L; legacy.pages = 2;
    for (const k of Object.keys(legacy[STORE[o]].types)) legacy[STORE[o]].types[k] = ids.includes(k); legacy[STORE[o]].level = L;
    const homes = ids.map(i => SP.TYPE_HOME[o + '.' + i][0]);
    const st = D(); Object.assign(st, { seed: 'Z' + L, pages: 2 });
    for (const M of new Set(homes.map(h => ({ ns: 'num', oa: 'oa', fdp: 'frac', tm: 'time', meas: 'meas', geom: 'geom' }[h])))) {
      const mine = ids.filter(i => ({ ns: 'num', oa: 'oa', fdp: 'frac', tm: 'time', meas: 'meas', geom: 'geom' }[SP.TYPE_HOME[o + '.' + i][0]]) === M);
      st.module = M; for (const k of Object.keys(st[M].types)) st[M].types[k] = mine.map(i => o + '.' + i).includes(k); st[M].level = L;
      const lg = D(); Object.assign(lg, { module: o, seed: 'Z' + L, pages: 2 });
      for (const k of Object.keys(lg[STORE[o]].types)) lg[STORE[o]].types[k] = mine.includes(k); lg[STORE[o]].level = L;
      ok(J(sigs(SP.generateSet(st))) === J(sigs(SP.generateSet(lg))), `${o} ${mine} L${L} differs from the legacy module`);
    }
  }
}

/* 3. migration of saved states */
{
  const a = D(); a.module = 'area'; a.seed = 'M1'; a.level = 3; a.unit = 'cm'; a.shade = false; a.types = { count: true, mult: false, draw: true, cmp: false, lsh: true };
  ok(SP.migrateLegacyState(a) && a.module === 'geom' && a.geom.level === 3 && a.geom.unit === 'cm' && a.geom.shade === false, 'area state to geom ' + a.module);
  ok(J(Object.keys(a.geom.types).filter(k => a.geom.types[k])) === J(['vis.acount', 'vis.adraw', 'vis.alsh']), 'area types to refs ' + J(a.geom.types));
  const n = D(); n.module = 'ns'; n.seed = 'M2'; for (const k of Object.keys(n.ns.types)) n.ns.types[k] = ['place', 'bond'].includes(k); n.ns.level = 1;
  ok(SP.migrateLegacyState(n) && n.module === 'combo' && n.parts.length === 2 && n.parts[0].m === 'num' && n.parts[1].m === 'oa', 'ns state spanning strands becomes parts ' + n.module);
  const v = D(); v.module = 'vis'; for (const k of Object.keys(v.vis.types)) v.vis.types[k] = k === 'ruler'; const g0 = sigs(SP.generateSet(v));
  ok(SP.migrateLegacyState(v) && v.module === 'meas' && J(sigs(SP.generateSet(v))) === J(g0), 'vis state to meas keeps its problems');
  const ap = SP.migrateParts(D(), [{ m: 'fdp', n: 10, label: 'x', fd: { types: ['simp', 'decadd'], level: 2 } }]);
  ok(ap.length === 1 && ap[0].m === 'frac' && ap[0].frac.types.length === 2, 'fdp part to frac');
}

/* 4. group-level mixing */
{
  const st = D();
  const part = (m, types) => ({ m, n: 5, label: '', [m]: { types, level: 2 } });
  ok(SP.partMixable(st, part('num', ['ns.place'])) && SP.partMixable(st, part('geom', ['vis.acount', 'vis.perim'].filter(x => SP.TYPE_HOME[x]))), 'num and area on grids mix');
  ok(!SP.partMixable(st, part('geom', ['vis.shname'])) && !SP.partMixable(st, part('meas', ['vis.bar'])) && !SP.partMixable(st, part('geom', ['vis.cplane'])), 'drawing groups do not mix');
  ok(SP.partMixable(st, { m: 'addsub', n: 5 }) && !SP.partMixable(st, { m: 'area', n: 5 }) && !SP.partMixable(st, { m: 'vis', n: 5 }), 'legacy mix flags unchanged');
  const mx = D(); Object.assign(mx, { module: 'mix', seed: 'X9', pages: 1, parts: [part('num', ['ns.place', 'ns.round']), part('frac', ['fdp.simp']), part('geom', ['vis.acount', 'vis.amult', 'vis.acmp'])] });
  let items; try { items = SP.mixItems(mx); } catch (e) { ok(false, 'mix threw ' + e.message); items = []; }
  ok(items.length >= 15 && items.every(i => i.p.sig) && ['ns', 'fdp', 'vis'].every(o => items.some(i => i.p.mod === o)), 'mixed items ' + items.length);
  try { ok(SP.renderAll(mx).includes('sheet'), 'mix renders'); } catch (e) { ok(false, 'mix render ' + e.message); }
}
console.log('strands ' + checks + ' checks; issues', J(bad.slice(0, 12)));
process.exit(bad.length ? 1 : 0);
