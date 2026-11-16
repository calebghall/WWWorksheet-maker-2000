/* Parts: a worksheet as a list of parts, each with its own module settings.
   Checks that parts derived from the Combined settings render exactly as before, that parts of one module run
   with their own settings and do not repeat each other's problems, that the worksheet state is not changed by
   generating, and that saved or hand-edited parts are clamped. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'WWWorksheet-maker-2000.html'), 'utf8');
const js = html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx = { Math, console, globalThis: null }; ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(js, ctx);
const SP = ctx.__SP, bad = [], D = () => SP.defaults(), J = JSON.stringify;
let checks = 0; const ok = (c, m) => { checks++; if (!c) bad.push(m); };

/* 1. explicit parts equal to the derived list render identically to the legacy Combined settings */
for (let i = 0; i < 8; i++) {
  const a = D(); Object.assign(a, { module: 'combo', seed: 'P' + i, paper: i % 2 ? 'a4' : 'letter' });
  Object.keys(a.combo).forEach((id, k) => { a.combo[id].on = (i + k) % 3 !== 0; a.combo[id].n = SP.REG[id].counts[(i + k) % SP.REG[id].counts.length]; });
  const b = JSON.parse(J(a)); b.parts = SP.partsOf(a).map(p => ({ m: p.m, n: p.n }));
  ok(SP.renderAll(a) === SP.renderAll(b), 'derived parts differ from combo ' + i);
  /* parts that carry the panel settings give the same sheet as parts that read the panel */
  const c = JSON.parse(J(a)); c.parts = SP.partsOf(a).map(p => SP.makePart(a, p.m, p.n));
  ok(SP.renderAll(a) === SP.renderAll(c), 'captured parts differ from combo ' + i);
}

/* 2. two parts of one module: own settings, own seeds, letters, numbering, no repeated problem */
{
  const st = D(); Object.assign(st, { module: 'combo', seed: 'Q1', key: true });
  st.parts = [{ m: 'fdp', n: 10, label: 'Add decimals', fd: { types: ['decadd'], level: 2 } },
              { m: 'fdp', n: 10, label: 'Convert', fd: { types: ['conv'], level: 2 } },
              { m: 'ns', n: 10, ns: { types: ['place'], level: 2 } },
              { m: 'ns', n: 10, ns: { types: ['place'], level: 2 } }];
  const before = J(st), secs = SP.comboSections(st);
  ok(secs.length === 4 && secs.map(s => s.letter).join('') === 'ABCD', 'part letters');
  ok(secs[0].plan.probs.every(p => p.type === 'decadd') && secs[1].plan.probs.every(p => p.type === 'conv'), 'part types');
  ok(secs[0].name === 'Add decimals' && secs[2].name === SP.REG.ns.name, 'part names');
  ok(secs.map(s => s.start).join() === '1,11,21,31', 'part numbering');
  const s2 = new Set(secs[2].plan.probs.map(p => p.sig));
  ok(secs[3].plan.probs.every(p => !s2.has(p.sig)), 'second ns part repeats a problem of the first');
  ok(J(st) === before, 'comboSections changed the state');
  const out = SP.renderAll(st);
  ok(SP.META.problems === 40 && /Add decimals/.test(out) && /Part D/.test(out) && !/NaN|undefined/.test(out), 'render of parts');
}
/* the first part of a module keeps the seed a plain section has */
{
  const a = D(); Object.assign(a, { module: 'combo', seed: 'Q2' }); Object.keys(a.combo).forEach(id => { a.combo[id].on = id === 'muldiv'; a.combo[id].n = SP.REG[id].n0; });
  const b = JSON.parse(J(a)); b.parts = [{ m: 'muldiv', n: SP.REG.muldiv.n0 }, { m: 'muldiv', n: 5 }];
  ok(J(SP.comboSections(a)[0].plan.probs) === J(SP.comboSections(b)[0].plan.probs), 'first part seed');
}

/* 3. a part's settings do not leak into the worksheet's panels */
{
  const st = D(); st.module = 'combo'; st.parts = [{ m: 'addsub', n: 5, as: { add: true, sub: false, d1: 4, d2: 4, addends: 2, regroup: 'any', format: 'horizontal', cap: 0, second: 'digits' } }];
  const before = J(st.as); const p = SP.comboSections(st)[0].plan.probs;
  ok(J(st.as) === before && p.every(q => q.type === 'add' && String(q.nums[0]).length === 4), 'part settings leak or ignored');
}

/* 4. normalizing saved or hand-edited parts */
{
  const n = SP.normParts([{ m: 'nope' }, null, 7, { m: 'ns', n: 999, label: 'x'.repeat(200), ns: { types: ['place', 'bogus'], level: 9 } },
    { m: 'fdp', n: 10, fd: { types: [], level: 1 } }, { m: 'addsub', n: 10, as: { d1: 99, add: false, sub: false } }, { m: 'tm', n: 5 }]);
  ok(n.length === 4, 'unknown parts kept: ' + n.length);
  ok(n[0].n === SP.REG.ns.n0 && n[0].label.length === 60 && J(n[0].ns) === J({ types: ['place'], level: 2 }), 'ns part clamp ' + J(n[0]));
  ok(J(n[1].fd.types) === '["simp"]' && n[1].fd.level === 1, 'empty types fall back ' + J(n[1]));
  ok(n[2].as.d1 === 2 && n[2].as.add === true, 'addsub clamp ' + J(n[2].as));
  ok(n[3].m === 'tm' && !('tm' in n[3]), 'part without settings');
  ok(SP.normParts([]) === null && SP.normParts('x') === null && SP.normParts(null) === null, 'empty parts');
  ok(SP.normParts(new Array(40).fill({ m: 'fdp', n: 5 })).length === 12, 'part limit');
  const again = SP.normParts(n); ok(J(again) === J(n), 'normalizing twice changes parts');
}
/* 5. every module's captured settings normalize to themselves and apply to a fresh state */
for (const mod of Object.keys(SP.REG)) {
  const st = D(); const part = SP.makePart(st, mod);
  ok(J(SP.normPart(part)) === J(part), 'capture round trip ' + mod);
  ok(SP.REG[mod].plan(SP.partState(st, part), part.n, 'Z').probs.length > 0, 'plan from part ' + mod);
}

/* 6. presets with parts: set the parts and the Combined view, leave the module panels alone, and a single-module preset clears the parts */
{
  const st = D(); const panels = J([st.as, st.md, st.fd, st.ns, st.tm, st.vis]);
  SP.applyStandard(st, '5.NBT.B.7');
  ok(st.module === 'combo' && st.parts && st.parts.length === 2 && st.parts[0].m === 'fdp' && st.parts[1].m === 'ns', 'parts preset ' + J(st.parts));
  ok(J([st.as, st.md, st.fd, st.ns, st.tm, st.vis]) === panels, 'parts preset changed the module panels');
  ok(J(SP.normParts(st.parts)) === J(st.parts), 'preset parts are already normalized');
  const secs = SP.comboSections(st);
  ok(secs.length === 2 && secs[0].plan.probs.every(p => ['decadd', 'decmul'].includes(p.type)) && secs[1].plan.probs.every(p => p.type === 'decrsn'), '5.NBT.B.7 sections');
  SP.applyStandard(st, '3.OA.A.1'); ok(st.parts === null && st.module !== 'combo', 'single preset keeps parts');
  /* the preset objects themselves are not shared with the state */
  SP.applyStandard(st, '4.NBT.B.5'); st.parts[0].n = 30; SP.applyStandard(st, '4.NBT.B.5'); ok(st.parts[0].n === 10, 'preset parts shared with state');
}
/* 7. the bug report keeps the parts when the whole state is too long */
{
  const st = D(); st.module = 'combo'; st.seed = 'BR1'; st.parts = SP.normParts(Array.from({ length: 6 }, (_, i) => SP.makePart(st, ['ns', 'vis', 'fdp', 'ns', 'vis', 'tm'][i])));
  const u = new URL(SP.bugReportUrl(st, 'agent')), back = JSON.parse(u.searchParams.get('settings'));
  ok(u.href.length <= 6000 && J(back.parts) === J(st.parts), 'bug report with 6 parts: ' + u.href.length);
}

/* 8. Mixed Practice from parts */
{
  /* explicit equal parts for the checked topics give the same sheet as the topic checkboxes */
  for (let i = 0; i < 4; i++) {
    const a = D(); Object.assign(a, { module: 'mix', seed: 'MX' + i, pages: 1 + i % 2, arPerPage: [12, 20, 30][i % 3] });
    const b = JSON.parse(J(a)); b.parts = ['addsub', 'muldiv', 'ns', 'tm'].map(m => ({ m, n: 5 }));
    ok(SP.renderAll(a) === SP.renderAll(b), 'mix parts differ from checkboxes ' + i);
  }
  /* weights: sizes follow the parts' n, totals are exact, and each part uses its own settings */
  const st = D(); Object.assign(st, { module: 'mix', seed: 'MY', pages: 1, arPerPage: 20 });
  const md = (da, db) => ({ mul: true, div: false, mode: 'digits', tables: 10, focus: 0, rem: false, da, db, alt: false, da2: 2, db2: 2, na: 3, nb: 1, format: 'vertical' });
  st.parts = [{ m: 'muldiv', n: 15, label: 'Big', md: md(4, 1) }, { m: 'muldiv', n: 5, label: 'Small', md: md(2, 2) }, { m: 'vis', n: 5, vis: { types: ['cnt'], level: 1 } }];
  const items = SP.mixItems(st), big = items.filter(it => it.p.a >= 1000), small = items.filter(it => it.p.a < 100);
  ok(items.length === 20 && big.length === 15 && small.length === 5, 'mix weights ' + items.length + '/' + big.length + '/' + small.length);
  ok(items.every(it => it.mod === 'muldiv') && new Set(items.map(it => it.p.a + 'x' + it.p.b)).size === 20, 'vis part left out, no repeats');
  const out = SP.renderAll(st); ok(!/NaN|undefined/.test(out) && SP.META.problems === 20, 'mix render');
  /* largest remainder: 20 across 3, 3, 1 is 8.6, 8.6, 2.9, so 9, 8, 3 */
  st.parts = [{ m: 'addsub', n: 3 }, { m: 'ns', n: 3 }, { m: 'tm', n: 1 }];
  const by = {}; SP.mixItems(st).forEach(it => { by[it.mod] = (by[it.mod] || 0) + 1; });
  ok(by.addsub + by.ns + by.tm === 20 && by.addsub === 9 && by.ns === 8 && by.tm === 3, 'largest remainder ' + J(by));
  /* parts that Mixed cannot hold fall back to the topic checkboxes */
  st.parts = [{ m: 'vis', n: 5 }, { m: 'area', n: 4 }]; const fb = SP.mixItems(st); ok(fb.length === 20 && fb.every(it => ['addsub', 'muldiv', 'ns', 'tm'].includes(it.mod)), 'unmixable parts fall back');
  /* remainder wording follows the parts */
  st.parts = [{ m: 'muldiv', n: 5, md: Object.assign(md(3, 1), { div: true, rem: true, na: 3, nb: 1 }) }, { m: 'addsub', n: 5 }];
  ok(/remainders with R/.test(SP.renderAll(st)), 'mix subtitle remainder');
}
console.log('parts', checks, 'checks; issues', J(bad));
process.exit(bad.length ? 1 : 0);
