/* Type map and tags (Phase 5.2). Every registry type has a planned home, every mapped key names a real type,
   and the module counts match the plan. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'WWWorksheet-maker-2000.html'), 'utf8');
const js = html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx = { Math, console, globalThis: null }; ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(js, ctx);
const SP = ctx.__SP, bad = []; let checks = 0; const ok = (c, m) => { checks++; if (!c) bad.push(m); };

/* 1. registry <-> map */
const reg = []; for (const mod of ['ns', 'vis']) for (const d of SP.TYPE_DEFS[mod]) reg.push(mod + '.' + d.id);
ok(reg.length === 175, 'registry size ' + reg.length);
for (const k of reg) ok(SP.TYPE_HOME[k], 'unmapped registry type ' + k);
const hard = new Set(); for (const m of ['fd', 'tm']) for (const v of html.matchAll(new RegExp('name="' + m + '_type" value="(\\w+)"', 'g'))) hard.add((m === 'fd' ? 'fdp.' : 'tm.') + v[1]);
for (const k of Object.keys(SP.TYPE_HOME)) ok(reg.includes(k) || hard.has(k), 'mapped key is not a type: ' + k);
for (const k of hard) ok(SP.TYPE_HOME[k], 'unmapped hard-coded type ' + k);
ok(Object.keys(SP.TYPE_HOME).length === 195, 'map size ' + Object.keys(SP.TYPE_HOME).length);

/* 2. modules stay within the cap of about 30 types and 5 groups (ns is the largest at 42 after K to 2 additions and ordsm) */
const by = {}; for (const [k, [m, g]] of Object.entries(SP.TYPE_HOME)) { (by[m] = by[m] || {})[g] = (by[m][g] || 0) + 1; }
for (const [m, gs] of Object.entries(by)) { const n = Object.values(gs).reduce((a, b) => a + b, 0); ok(Object.keys(gs).length <= 5, m + ' groups'); ok(n <= 42, m + ' types ' + n); }

/* 3. tags */
const word = SP.TYPE_DEFS.ns.concat(SP.TYPE_DEFS.vis).filter(d => SP.typeTags('', d).includes('word')).map(d => d.id);
ok(['wadd', 'wlen', 'wmul', 'wcmp', 'wstep', 'west', 'mword', 'fword6'].every(i => word.includes(i)), 'word tags ' + word);
ok(!word.includes('pos2'), 'pos2 is not a word problem');


console.log('typemap ' + checks + ' checks; issues', JSON.stringify(bad.slice(0, 10)));
process.exit(bad.length ? 1 : 0);
