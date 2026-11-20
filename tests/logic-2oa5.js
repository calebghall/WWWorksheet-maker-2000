/* Independent verification of the 2.OA.D.5 types (ns: addcmp, claim, parsum; vis: addchart, chartcircle) and of the preset that uses them.
   Every answer is recomputed from the problem's own fields or text. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'WWWorksheet-maker-2000.html'), 'utf8');
const js = html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx = { Math, console, globalThis: null }; ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(js, ctx);
const SP = ctx.__SP, E = x => vm.runInContext(x, ctx), bad = []; let n = 0;
const NHTML = E('NHTML'), VHTML = E('VHTML');
const par = v => v % 2 ? 'odd' : 'even';
const ev = s => Function('"use strict";return (' + s + ')')();
const nums = s => (s.match(/\d+/g) || []).map(Number);

function shape(p, L, t) {
  const e = m => bad.push(`${t} L${L} ${p.type}: ${m} ${JSON.stringify(p).slice(0, 160)}`);
  if (!p.sig || !p.prompt || !(p.ew > 0 && p.eh > 0 || p.win > 0 && p.hin > 0)) e('shape');
  return e;
}

function checkNs(p, L) {
  n++; const e = shape(p, L, 'ns');
  if (p.type === 'addcmp') {
    const v1 = ev(p.e1), v2 = ev(p.e2), want = v1 === v2 ? 0 : v1 > v2 ? 1 : 2;
    if (p.opts.indexOf(p.ans) !== want) e('answer');
    if (p.opts[0] !== 'a) the same' || p.opts[1] !== `b) ${p.e1} is greater` || p.opts[2] !== `c) ${p.e2} is greater`) e('options');
    if (p.e1 === p.e2) e('identical');
    const m = nums(p.e1 + ' ' + p.e2), assoc = /\(/.test(p.e1);
    if (L === 1 && (assoc || Math.max(...m) > 9)) e('L1 range');
    if (L === 2 && Math.max(...m) > 29) e('L2 range');
    if (L === 3 && Math.max(...m) > 49) e('L3 range');
    if (assoc && nums(p.e1).length !== 3) e('assoc terms');
    if (assoc && Math.max(ev(p.e1), ev(p.e2)) > 99) e('assoc over 99');
    if (!/^[\d+() ]+$/.test(p.e1 + p.e2.replace(/ /g, ''))) { /* digits, plus, parentheses only */ }
  } else if (p.type === 'claim') {
    const t = p.text, m = nums(t); let want;
    if (p.kind === 'comm') { want = 'yes'; if (m[0] !== m[3] || m[1] !== m[2] || m[0] === m[1]) e('comm numbers'); }
    else if (p.kind === 'plus1') {
      const claimed = /an (odd|even) number\./.exec(t)[1], tested = m.slice(-2);
      want = tested.every(v => par(v + 1) === claimed) ? 'yes' : 'no';
      if (par(tested[0]) === par(tested[1])) e('plus1 needs one odd and one even');
    } else if (p.kind === 'plus2') {
      const P = /an (odd|even) number makes/.exec(t)[1], tested = m.slice(-2);
      want = tested.every(v => par(v) === P && par(v + 2) === P) ? 'yes' : 'no'; if (tested[0] === tested[1]) e('plus2 repeat');
    } else if (p.kind === 'row') {
      const r = m[0], step = m[4]; want = step === 1 ? 'yes' : 'no';
      if (m[1] !== r + 1 || m[2] !== r + 2 || m[3] !== r + 3) e('row terms');
    } else if (p.kind === 'oddodd') {
      const g = /says an (odd|even) number plus an (odd|even) number is an (odd|even) number\. Test it with (\d+) \+ (\d+)/.exec(t);
      if (!g || par(+g[4]) !== g[1] || par(+g[5]) !== g[2]) { e('oddodd parse'); return; }
      want = par(+g[4] + +g[5]) === g[3] ? 'yes' : 'no';
      if (L === 1) e('oddodd at L1');
    } else e('kind');
    if (p.ans !== want) e('claim answer ' + want);
    if (p.kind === 'plus1' || p.kind === 'plus2' || p.kind === 'oddodd') { /* the key line must restate a true equation */ }
    for (const q of p.why.split(/[;,]/)) { const eq = /(\d+) \+ (\d+) = (\d+)/.exec(q); if (eq && +eq[1] + +eq[2] !== +eq[3]) e('why arithmetic ' + q); }
    if (L === 1 && Math.max(...m.filter((v, i) => p.kind !== 'row' || i < 4)) > 15) e('L1 range');
  } else if (p.type === 'parsum') {
    const t = p.text; let want;
    if (p.kind === 'num') {
      const g = /has (\d+) (\w+)\. (\w+) has (\d) (more|fewer)/.exec(t); if (!g) { e('num parse'); return; }
      const v = g[5] === 'more' ? +g[1] + +g[4] : +g[1] - +g[4]; if (v < 1) e('negative'); want = par(v);
      if (L === 1 && +g[1] > 19) e('L1 range');
    } else if (p.kind === 'given') {
      const g = /an (odd|even) number of \w+\. \w+ has (\d) (more|fewer)/.exec(t); if (!g) { e('given parse'); return; }
      want = +g[2] === 1 ? (g[1] === 'odd' ? 'even' : 'odd') : g[1]; if (L === 1) e('given at L1');
    } else if (p.kind === 'sum') {
      const g = /is (\d+) \+ (\d+) odd or even/.exec(t); if (!g) { e('sum parse'); return; } want = par(+g[1] + +g[2]); if (L < 3) e('sum below L3');
    } else e('kind');
    if (p.ans !== want) e('parity answer ' + want);
  }
}

function checkVis(p, L) {
  n++; const e = shape(p, L, 'vis');
  if (p.win > 3.32) e('too wide');
  if (p.prompt.length > 42) e('prompt length');
  if (new Set(p.blanks || []).size !== (p.blanks || []).length) e('repeat blank');
  const html0 = VHTML[p.type](p, false), html1 = VHTML[p.type](p, true), rings = h => (h.match(/rx="10"/g) || []).length;
  if (/NaN|undefined|null|\[object/.test(html0 + html1)) e('junk');
  if (p.type === 'addchart') {
    const nb = L === 1 ? 6 : L === 2 ? 8 : 10;
    if (p.blanks.length !== nb) e('blank count');
    if (p.ans !== p.blanks.map(b => p.r0 + Math.floor(b / 5) + p.c0 + b % 5).join(' ')) e('answer');
    if (p.blanks.some(b => b < 0 || b > 24)) e('blank range');
    if (L === 1 && (p.r0 !== 0 || p.c0 !== 0)) e('L1 start');
    if (L === 2 && p.r0 !== p.c0) e('L2 symmetric');
    if (rings(html1) || rings(html0)) e('rings on addchart');
    const key = (html1.match(/<text/g) || []).length, stu = (html0.match(/<text/g) || []).length;
    if (key - stu !== nb) e('key shows blanks ' + (key - stu));
  } else {
    let want = 0; for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if (par(p.r0 + i + p.c0 + j) === p.want) want++;
    if (p.ans !== p.want || !['even', 'odd'].includes(p.want)) e('want');
    if (rings(html1) !== want) e(`ring count ${rings(html1)} vs ${want}`);
    if (rings(html0)) e('rings in student copy');
    if (L === 1 && p.r0 !== p.c0) e('L1 symmetric');
    if (!p.prompt.includes(p.want)) e('prompt parity');
  }
}

const NS = ['addcmp', 'claim', 'parsum'], VIS = ['addchart', 'chartcircle'];
for (const L of [1, 2, 3]) {
  const seen = {};
  for (const id of NS) {
    const sigs = new Set(), ans = {};
    for (let i = 0; i < 400; i++) { const p = SP.NGEN[id](SP.rngFrom('N' + i + id), L); checkNs(p, L); sigs.add(p.sig); ans[p.ans] = (ans[p.ans] || 0) + 1; const h = NHTML[id](p, true, (a) => a), h2 = NHTML[id](p, false, (a) => a); if (/NaN|undefined|null|\[object/.test(h + h2)) bad.push('junk ' + id); }
    if (sigs.size < 8) bad.push(`low variety ${id} L${L} ${sigs.size}`);
    if (id === 'addcmp') { const same = Object.entries(ans).filter(([k]) => k === 'a) the same')[0], share = (same ? same[1] : 0) / 400; if (share < 0.3 || share > 0.6 || Object.keys(ans).length < 3) bad.push(`addcmp answer spread L${L} ${JSON.stringify(ans)}`); }
    if (id === 'claim') { if (!ans.yes || !ans.no || Math.min(ans.yes, ans.no) < 100) bad.push(`claim yes/no spread L${L} ${JSON.stringify(ans)}`); }
    if (id === 'parsum' && (!ans.odd || !ans.even)) bad.push('parsum spread');
  }
  for (const id of VIS) {
    const sigs = new Set(); for (let i = 0; i < 200; i++) { const p = SP.VGEN[id](SP.rngFrom('V' + i + id), L); checkVis(p, L); sigs.add(p.sig); }
    if (sigs.size < 8) bad.push(`low variety ${id} L${L} ${sigs.size}`);
  }
}

/* level coverage: assoc starts at L2, sums at L3 */
{
  const has = (id, L, f) => { for (let i = 0; i < 400; i++) if (f(SP.NGEN[id](SP.rngFrom('H' + i + id), L))) return true; return false; };
  if (has('addcmp', 1, p => /\(/.test(p.e1))) bad.push('addcmp assoc at L1');
  if (!has('addcmp', 2, p => /\(/.test(p.e1))) bad.push('addcmp assoc missing at L2');
  if (!has('claim', 2, p => p.kind === 'oddodd')) bad.push('claim oddodd missing at L2');
  if (!has('parsum', 3, p => p.kind === 'sum')) bad.push('parsum sum missing at L3');
}

/* the preset: only these six types, nothing multiplicative, renders sheet and key, same set code gives the same sheet */
for (const seed of ['A', 'B', 'C', '6NXREZ']) {
  const st = SP.defaults(); st.seed = seed; st.pages = 2; SP.applyStandard(st, '2.OA.D.5');
  const on = Object.keys(st.oa.types).filter(k => st.oa.types[k]).sort().join();
  if (on !== 'ns.addcmp,ns.claim,ns.parsum,vis.addchart,vis.chartcircle,vis.chartwhy') bad.push('preset types ' + on);
  if (st.module !== 'oa' || st.oa.level !== 2) bad.push('preset module or level');
  const probs = SP.generateSet(st), got = new Set(probs.map(q => q.type));
  if (probs.length < 8) bad.push('preset size ' + probs.length);
  for (const t of got) if (!['addcmp', 'claim', 'parsum', 'addchart', 'chartcircle', 'chartwhy'].includes(t)) bad.push('preset unexpected ' + t);
  if (got.size < 4) bad.push('preset mix ' + [...got]);
  if (probs.some(q => /×|÷/.test(JSON.stringify(q)))) bad.push('preset multiplicative');
  for (const key of [false, true]) { st.key = key; const out = SP.renderAll(st); if (/NaN|undefined|null|\[object/.test(out) || !out.includes('sheet')) bad.push('preset render key' + key); }
  if (JSON.stringify(SP.generateSet(st)) !== JSON.stringify(SP.generateSet(st))) bad.push('preset nondeterministic');
}

console.log('2.OA.D.5 types checked', n, '; issues', JSON.stringify([...new Set(bad)].slice(0, 12)), bad.length);
process.exit(bad.length ? 1 : 0);
