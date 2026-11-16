/* Type map, tags, grade ranges and grade bands (Phase 5.2). Every registry type has a planned home, every mapped key names a real type,
   the module counts match the plan, and the band filter keeps checked/unranged types and follows the framework's own bands. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'WWWorksheet-maker-2000.html'), 'utf8');
const js = html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx = { Math, console, globalThis: null }; ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(js, ctx);
const SP = ctx.__SP, bad = []; let checks = 0; const ok = (c, m) => { checks++; if (!c) bad.push(m); };

/* 1. registry <-> map */
const reg = []; for (const mod of ['ns', 'vis']) for (const d of SP.TYPE_DEFS[mod]) reg.push(mod + '.' + d.id);
ok(reg.length === 133, 'registry size ' + reg.length);
for (const k of reg) ok(SP.TYPE_HOME[k], 'unmapped registry type ' + k);
const hard = new Set(); for (const m of ['fd', 'tm']) for (const v of html.matchAll(new RegExp('name="' + m + '_type" value="(\\w+)"', 'g'))) hard.add((m === 'fd' ? 'fdp.' : 'tm.') + v[1]);
for (const id of ['count', 'mult', 'draw', 'cmp', 'lsh']) hard.add('area.' + id);
for (const k of Object.keys(SP.TYPE_HOME)) ok(reg.includes(k) || hard.has(k), 'mapped key is not a type: ' + k);
for (const k of hard) ok(SP.TYPE_HOME[k], 'unmapped hard-coded type ' + k);
ok(Object.keys(SP.TYPE_HOME).length === 158, 'map size ' + Object.keys(SP.TYPE_HOME).length);

/* 2. modules stay within the cap of about 30 types and 5 groups (ns is the largest at 38 by plan) */
const by = {}; for (const [k, [m, g]] of Object.entries(SP.TYPE_HOME)) { (by[m] = by[m] || {})[g] = (by[m][g] || 0) + 1; }
for (const [m, gs] of Object.entries(by)) { const n = Object.values(gs).reduce((a, b) => a + b, 0); ok(Object.keys(gs).length <= 5, m + ' groups'); ok(n <= 38, m + ' types ' + n); }

/* 3. tags */
const word = SP.TYPE_DEFS.ns.concat(SP.TYPE_DEFS.vis).filter(d => SP.typeTags('', d).includes('word')).map(d => d.id);
ok(['wadd', 'wlen', 'wmul', 'wcmp', 'wstep', 'west', 'mword', 'fword6'].every(i => word.includes(i)), 'word tags ' + word);
ok(!word.includes('pos2'), 'pos2 is not a word problem');

/* 4. grade ranges and bands */
const gr = SP.typeGradeRanges();
ok(gr['vis.cnt'] && gr['vis.cnt'][0] === 0, 'cnt starts in kindergarten');
ok(gr['vis.cplane'] && gr['vis.cplane'][0] === 5, 'cplane is grade 5');
for (const [k, r] of Object.entries(gr)) ok(r[0] <= r[1] && r[0] >= 0 && r[1] <= 5, 'range ' + k);
const bands = SP.frameworkBands();
ok(bands.length >= 1 && bands.every(b => b.id && b.grades.length), 'bands shape');
const k2 = bands.find(b => b.id === 'k2'), g35 = bands.find(b => b.id === '35');
ok(SP.typeInBand('vis', 'cnt', k2) && !SP.typeInBand('vis', 'cnt', g35), 'cnt only in K to 2');
ok(!SP.typeInBand('vis', 'cplane', k2) && SP.typeInBand('vis', 'cplane', g35), 'cplane only in 3 to 5');
ok(SP.typeInBand('ns', 'no_such_type', k2) && SP.typeInBand('vis', 'cnt', null), 'unranged type and no band always show');
const odd = { id: 'odd', label: 'x', grades: [1, 2, 3] };
const in2 = Object.entries(gr).find(([k, r]) => r[0] <= 2 && r[1] >= 2 && k.startsWith('vis.'));
ok(in2 && SP.typeInBand('vis', in2[0].slice(4), odd) && !SP.typeInBand('vis', 'cplane', odd) && !SP.typeInBand('vis', 'cnt', odd), 'custom band overlap');
ok(SP.stdInBand('K.CC.A.1', k2) && !SP.stdInBand('4.NBT.A.1', k2) && SP.stdInBand('4.NBT.A.1', g35) && SP.stdInBand('1.OA.A.1', null), 'standard bands');
/* every standard falls in exactly one framework band */
for (const s of SP.STANDARDS) ok(bands.filter(b => SP.stdInBand(s.c, b)).length === 1, 'standard band ' + s.c);

console.log('typemap ' + checks + ' checks; issues', JSON.stringify(bad.slice(0, 10)));
process.exit(bad.length ? 1 : 0);
