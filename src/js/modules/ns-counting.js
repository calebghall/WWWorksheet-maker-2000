/* ---------- Number Sense: counting and number lines ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

/* Count on and back. L1 count on from any number, L2 count back from 20, L3 by ones, twos or fives to 120. */
function nsxCount(rng, L) {
  let step = 1, start, prompt = 'Count on. Fill in the missing numbers:';
  if (L === 1) start = ri(rng, 1, 94);
  else if (L === 2) { step = -1; start = ri(rng, 12, 20); prompt = 'Count back. Fill in the missing numbers:'; }
  else { step = pick(rng, [1, 2, 5]); start = step * ri(rng, 0, Math.floor((120 - 5 * step) / step)); }
  const vals = Array.from({ length: 6 }, (_, i) => start + i * step), terms = vals.map(String), idx = shuffle(rng, [1, 2, 3, 4, 5]).slice(0, 2).sort((a, b) => a - b);
  return { mod: 'ns', type: 'cfwd', prompt, terms, idx, step, sig: `cf${terms}${idx}`, ew: terms.reduce((a, s, i) => a + Math.max(s.length * 0.62 + 0.9, idx.includes(i) ? 3.0 : 0), 0) + 1, eh: 1.1 + 1.6 };
}

const seqProb = (type, prompt, vals, rng) => {
  const terms = vals.map(cnum), idx = shuffle(rng, [1, 2, 3, 4, 5]).slice(0, 2).sort((a, b) => a - b);
  return { mod: 'ns', type, prompt, terms, idx, sig: `${type}${terms}${idx}`, ew: terms.reduce((a, s, i) => a + Math.max(s.length * 0.62 + 0.9, idx.includes(i) ? 3.0 : 0), 0) + 1, eh: 1.1 + 1.6 };
};

/* count to 100 by ones, fives and tens (L2 and L3 also count back from 10). */
function nsxKseq(rng, L) {
  const kind = pick(rng, L === 1 ? ['t', 'f', 'o'] : ['t', 'f', 'o', 'b']);
  if (kind === 'f') { const s = 5 * ri(rng, 0, 14); return seqProb('kseq', 'Count by fives. Fill in the blanks:', Array.from({ length: 6 }, (_, i) => s + 5 * i), rng); }
  if (kind === 't') { const s = 10 * ri(rng, 0, 5); return seqProb('kseq', 'Count by tens. Fill in the blanks:', Array.from({ length: 6 }, (_, i) => s + 10 * i), rng); }
  if (kind === 'o') { const s = ri(rng, 1, L === 3 ? 95 : 94); return seqProb('kseq', 'Count on. Fill in the missing numbers:', Array.from({ length: 6 }, (_, i) => s + i), rng); }
  const s = ri(rng, 5, 10); return seqProb('kseq', 'Count back. Fill in the missing numbers:', Array.from({ length: 6 }, (_, i) => s - i), rng);
}

/* count within 1000 by 5s, 10s and 100s. */
function nsxCseq(rng, L) {
  const step = pick(rng, [5, 10, 100]), back = L > 1 && rng() < 0.3, lo = step === 100 ? 1 : step === 10 ? 10 : 20, hi = (step === 100 ? 5 : step === 10 ? 94 : 190);
  let s = step * ri(rng, lo, hi);
  const vals = Array.from({ length: 6 }, (_, i) => back ? s + 5 * step - i * step : s + i * step);
  return seqProb('cseq', `Count by ${step}s${back ? ' back' : ''}. Fill in the blanks:`, vals, rng);
}

/* odd and even within 20: pair the objects, then say even or odd; write an even number as two equal addends. */
function nsxPar20(rng, L) {
  const v = pick(rng, L === 1 ? ['pic', 'pic', 'one'] : ['pic', 'one', 'eq', 'eq']);
  if (v === 'one') { const n = ri(rng, 1, 20); return { mod: 'ns', type: 'parity', prompt: 'Circle even or odd:', single: true, n: String(n), ans: n % 2 ? 'odd' : 'even', sig: `pa${n}`, ew: 12, eh: 1.1 + 1.8 }; }
  if (v === 'eq') { const n = 2 * ri(rng, 1, 10), tok = [`${n} = `, U(n / 2), ' + ', U(n / 2)]; return { mod: 'ns', type: 'par20', variant: 'eq', prompt: 'Write the number as two equal addends.', n, tok, sig: `pe${n}`, ew: tokW(tok) + 1, eh: 1.1 + 1.6 }; }
  const n = ri(rng, 2, 20), cols = Math.ceil(n / 2), w = cols * 28 + 8;
  return { mod: 'ns', type: 'par20', variant: 'pic', prompt: 'Circle pairs. Even or odd?', n, ans: n % 2 ? 'odd' : 'even', sig: `pp${n}`, win: Math.max(w / 100, 2.4), hin: 0.7 + 0.4, ew: 14, eh: 1 };
}

const nsPar20Html = (p, key, x) => {
  if (p.variant === 'eq') return tokHtml(p.tok, key, x);
  const cols = Math.ceil(p.n / 2), w = cols * 28 + 8; let s = '';
  for (let i = 0; i < p.n; i++) s += nkDot(18 + Math.floor(i / 2) * 28, 18 + (i % 2) * 28, 1);
  if (key) for (let c = 0; c < Math.floor(p.n / 2); c++) s += `<rect x="${6 + c * 28}" y="3" width="24" height="58" rx="12" fill="none" stroke="var(--key)" stroke-width="2.5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w / 100}in" height="0.7in" viewBox="0 0 ${w} 70" role="img" aria-label="Counters" style="display:block">${s}</svg><div>${opts(['even', 'odd'], p.ans, key)}</div>`;
};

function nsSkip(rng, L) {
  let step, start, dec = false;
  if (L === 1) { step = pick(rng, [2, 5, 10]); start = step * ri(rng, 0, 4); }
  else if (L === 2) { step = pick(rng, [3, 4, 6, 7, 8, 9, 25]); start = step * ri(rng, 1, 6); if (rng() < 0.35) { step = -step; start += 6 * -step; } }
  else {
    dec = rng() < 0.5;
    if (dec) { step = pick(rng, [50, 25, 10, 20]); start = step * ri(rng, 0, 6); if (rng() < 0.3) { step = -step; start += 6 * -step; } }
    else { step = pick(rng, [12, 15, 25, 50, 250]); start = step * ri(rng, 1, 8); if (rng() < 0.3) { step = -step; start += 6 * -step; } }
  }
  const vals = Array.from({ length: 6 }, (_, i) => start + i * step);
  const f = v => dec ? trimZ(dstr(v, 2)) : cnum(v);
  const terms = vals.map(f), idx = shuffle(rng, [1, 2, 3, 4, 5]).slice(0, 2).sort((a, b) => a - b);
  return { mod: 'ns', type: 'skip', prompt: 'Fill in the missing numbers:', terms, idx, sig: `sk${terms.join(',')}${idx}`,
    ew: terms.reduce((a, s, i) => a + Math.max(s.length * 0.62 + 0.9, idx.includes(i) ? 3.0 : 0), 0) + 1, eh: 1.1 + 1.6 };
}

function nsParity(rng, L) {
  const nd = L === 1 ? 2 : L === 2 ? ri(rng, 3, 4) : ri(rng, 4, 6), num = () => Number(rdigits(rng, nd).join(''));
  if (rng() < 0.5) {
    const n = num();
    return { mod: 'ns', type: 'parity', prompt: 'Circle even or odd:', single: true, n: cnum(n), ans: n % 2 ? 'odd' : 'even', sig: `pa${n}`, ew: Math.max(12, String(n).length * 0.62 + 9), eh: 1.1 + 1.8 };
  }
  const want = rng() < 0.5 ? 0 : 1, list = [];
  let g = 0;
  const want_n = nd <= 3 ? 6 : nd === 4 ? 5 : 4;
  while (list.length < want_n && g++ < 200) { const n = num(); if (!list.includes(n) && (list.filter(x => x % 2 === want).length < Math.ceil(want_n / 2) || n % 2 !== want)) list.push(n); }
  if (!list.some(n => n % 2 === want)) list[0] = list[0] % 2 === want ? list[0] : list[0] + 1;
  return { mod: 'ns', type: 'parity', prompt: want ? 'Circle the odd numbers:' : 'Circle the even numbers:', single: false, list: list.map(cnum), on: list.map(n => n % 2 === want), sig: `pa${list}${want}`,
    ew: Math.max(12, list.reduce((a, n) => a + String(n).length * 0.62 + 1.4, 0)), eh: 1.1 + 1.8 };
}

function nsLine(rng, L) {
  const cfg = L === 1 ? [[0, 10, 1]] : L === 2 ? [[0, 20, 2], [0, 50, 5], [0, 100, 10], [100, 200, 10]] : [[0, 1, 0.1], [0, 2, 0.2], [1, 2, 0.1], [0, 5, 0.5]];
  const [lo, hi] = pick(rng, cfg), lo100 = Math.round(lo * 100), hi100 = Math.round(hi * 100), div = 10, k = ri(rng, 1, div - 1);
  const v100 = lo100 + k * (hi100 - lo100) / div, ans = trimZ(dstr(Math.round(v100), 2));
  return { mod: 'ns', type: 'line', prompt: 'What number does the arrow show?', svg: lineSvg(lo100, hi100, div, k), ans, sig: `ln${lo100}${hi100}${k}`, win: 2.75, hin: 0.72 + 0.1, hfs: 1.7, ew: 14, eh: 1 };
}

const nsSkipHtml = (p, key, x) => nsSeqHtml(p, key, x);

const nsCfwdHtml = (p, key, x) => nsSeqHtml(p, key, x);

const nsKseqHtml = (p, key, x) => nsSeqHtml(p, key, x);

const nsCseqHtml = (p, key, x) => nsSeqHtml(p, key, x);

function nsParityHtml(p, key, x) {
  if (p.single) return `${p.n}&emsp;<span class="opt${key && p.ans === 'even' ? ' on' : ''}">even</span><span class="opt${key && p.ans === 'odd' ? ' on' : ''}">odd</span>`;
  return p.list.map((n, i) => `<span class="cn${key && p.on[i] ? ' on' : ''}">${n}</span>`).join(' ');
}

const nsLineHtml = (p, key, x) => p.svg;

const nsSeqHtml = (p, key, x) => p.terms.map((t, i) => p.idx.includes(i) ? `<span class="blank" style="min-width:${(t.length * 0.62 + 1).toFixed(1)}em">${key ? esc(t) : '&nbsp;'}</span>` : esc(t)).join(',&ensp;');

/* Patterns that follow a rule: write the next terms, find the rule, spot a feature (even or odd), and shape patterns made of squares. */
const NS_RULE_FN = { add: (v, d) => v + d, sub: (v, d) => v - d, mul: (v, d) => v * d };
const nsRuleText = (op, d) => op === 'add' ? `add ${d}` : op === 'sub' ? `subtract ${d}` : `multiply by ${d}`;
const nsRuleSeq = (op, d, a0, n) => { const s = [a0]; for (let i = 1; i < n; i++) s.push(NS_RULE_FN[op](s[i - 1], d)); return s; };

function nsRuleSquares(counts) {
  const cell = 15, W = 300, H = counts.length * 22 + 8;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="2.6in" height="${(H * 2.6 / 300 ).toFixed(2)}in" viewBox="0 0 ${W} ${H}" role="img" aria-label="Figures ${counts.map((c, i) => `${i + 1} has ${c} squares`).join(', ')}">`;
  counts.forEach((c, r) => {
    const y = 4 + r * 22;
    s += `<text class="lab" x="2" y="${y + 13}">Figure ${r + 1}</text>`;
    for (let j = 0; j < c; j++) s += `<rect x="${62 + j * cell}" y="${y}" width="${cell - 2}" height="${cell - 2}" fill="var(--c1)" stroke="var(--ink)" stroke-width="1.4"/>`;
  });
  return { svg: s + '</svg>', H };
}

function nsxRulePat(rng, L) {
  const kind = pick(rng, L === 1 ? ['next', 'rule'] : ['next', 'rule', 'feat', 'shape']);
  const ruleOps = L === 1 ? [['add', pick(rng, [2, 3, 4, 5, 10])]]
    : L === 2 ? [pick(rng, [['add', pick(rng, [3, 4, 6, 7, 8, 9, 11, 12, 15, 25])], ['sub', pick(rng, [3, 4, 5, 6, 7, 8, 9, 11, 12])]])]
      : [pick(rng, [['add', pick(rng, [6, 7, 8, 9, 12, 15, 25, 50])], ['sub', pick(rng, [6, 7, 9, 12, 15, 25])], ['mul', pick(rng, [2, 3, 5])]])];
  const [op, d] = ruleOps[0], a0 = op === 'sub' ? 4 * d + ri(rng, 1, 12) : op === 'mul' ? ri(rng, 1, 4) : ri(rng, 1, L === 1 ? 9 : 20);
  const seq = nsRuleSeq(op, d, a0, 5);
  if (kind === 'next') return tokProb('rulepat', `Rule: ${nsRuleText(op, d)}. Start at ${a0}.`, [`${a0}, `, U(seq[1]), ', ', U(seq[2]), ', ', U(seq[3]), ', ', U(seq[4])], { kind, sigx: `${op}${d}` });
  if (kind === 'shape') {
    const sd = ri(rng, 2, 4), s0 = ri(rng, 1, 4), counts = [s0, s0 + sd, s0 + 2 * sd], g = nsRuleSquares(counts);
    return { mod: 'ns', type: 'rulepat', prompt: `Rule: add ${sd} squares each time.`, kind, counts, svg: g.svg, ans: String(s0 + 4 * sd), sig: `rps${s0}.${sd}`, win: 2.6, hin: g.H * 2.6 / 300 + 0.45, ew: 14, eh: 1 };
  }
  if (kind === 'feat') {
    const dd = ri(rng, 2, 9), s = ri(rng, 1, 12), sq = nsRuleSeq('add', dd, s, 5), ev = sq.filter(v => v % 2 === 0).length;
    const ans = ev === 5 ? 'all even' : ev === 0 ? 'all odd' : 'even and odd', o = ['all even', 'all odd', 'even and odd'];
    return { mod: 'ns', type: 'rulepat', prompt: `Rule: add ${dd}. Start at ${s}. The numbers are:`, kind, seq: sq, opts: o, ans, sig: `rpf${s}.${dd}`, ew: 24, eh: 1.1 + 1.45 + 1.4 };
  }
  const taken = new Set([nsRuleText(op, d)]);
  const cand = [['add', d - 1], ['add', d + 1], ['add', d + 2], ['sub', d], ['mul', 2], ['mul', 3], ['add', 2 * d]].filter(([o2, d2]) => {
    const t = nsRuleText(o2, d2);
    if ((o2 === 'add' && d2 <= 0) || taken.has(t) || nsRuleSeq(o2, d2, a0, 5).join() === seq.join()) return false;
    taken.add(t); return true;   // each wrong rule appears once and none fits the numbers
  });
  const wrong = shuffle(rng, cand).slice(0, 2).map(([o2, d2]) => nsRuleText(o2, d2)), ans = nsRuleText(op, d), o = shuffle(rng, [ans].concat(wrong));
  return { mod: 'ns', type: 'rulepat', prompt: 'What is the rule? Circle one.', kind, seq, opts: o, ans, sig: `rpr${seq.join('.')}${o.join('|')}`, ew: 24, eh: 1.1 + 1.45 + 1.4 };
}

const nsRulePatHtml = (p, key, x) => p.kind === 'next' ? tokHtml(p.tok, key, x) : p.kind === 'shape' ? `${p.svg}<div>Figure 5: ${x(p.ans, 3)} squares</div>` : `<div>${p.seq.join(',&ensp;')}</div><div>${opts(p.opts, p.ans, key)}</div>`;

/* Two numerical patterns from two rules. L1 and L2: both start at 0 and the second rule adds a multiple of the first (B is k times A).
   L3 also uses equal rules with different starts (B is A plus c). kind: fill in the terms, name the relationship, write ordered pairs. */
function nsxRule2(rng, L) {
  const kind = pick(rng, L === 1 ? ['terms', 'relate'] : ['terms', 'relate', 'pairs']), mult = L < 3 || rng() < 0.4;
  const d = ri(rng, L === 1 ? 1 : 2, L === 1 ? 5 : 9), k = ri(rng, 2, L === 1 ? 3 : 5), c = ri(rng, 1, 9);
  const dA = d, dB = mult ? d * k : d, aS = mult ? 0 : ri(rng, 0, 4), bS = mult ? 0 : aS + c, A = nsRuleSeq('add', dA, aS, 5), B = nsRuleSeq('add', dB, bS, 5);
  const rel = mult ? k : c, base = { mod: 'ns', type: 'rule2', kind, mult, dA, dB, aS, bS, rel, A, B, wide: true, sig: `r2${kind}${dA}.${dB}.${aS}.${bS}`, ew: 21 };
  const ruleA = `Pattern A: ${nsRuleText('add', dA)}, start at ${aS}`, ruleB = `Pattern B: ${nsRuleText('add', dB)}, start at ${bS}`;
  if (kind === 'terms') return Object.assign(base, { prompt: 'Write the next terms of each pattern.', lines: [ruleA, ruleB], tokA: [`${A[0]}, `, U(A[1]), ', ', U(A[2]), ', ', U(A[3]), ', ', U(A[4])], tokB: [`${B[0]}, `, U(B[1]), ', ', U(B[2]), ', ', U(B[3]), ', ', U(B[4])], ans: '', eh: 1.1 + 4 * 1.5 + 0.5 });
  if (kind === 'relate') return Object.assign(base, { prompt: 'Compare the matching terms.', lines: [ruleA, ruleB], ans: String(rel), unitw: mult ? 'times' : 'more', eh: 1.1 + 5 * 1.5 + 0.6 });
  return Object.assign(base, { prompt: 'Write the ordered pairs (A, B).', lines: [ruleA, ruleB], ans: A.slice(0, 4).map((a, i) => `(${a}, ${B[i]})`).join(', '), eh: 1.1 + 5 * 1.5 + 1.2 });
}

const nsRule2Html = (p, key, x) => {
  const row = (t, s, tok) => `<div>${t}</div><div>${tok ? tokHtml(tok, key, x) : p[s].join(', ')}</div>`;
  if (p.kind === 'terms') return row(p.lines[0], 'A', p.tokA) + row(p.lines[1], 'B', p.tokB);
  const head = row(p.lines[0], 'A') + row(p.lines[1], 'B');
  if (p.kind === 'relate') return head + `<div>Each term in B is ${x(p.ans, 2.4)} ${p.unitw} ${p.mult ? 'the matching term in A' : 'than the matching term in A'}.</div>`;
  return head + `<div class="wl">${key ? esc(p.ans) : '&nbsp;'}</div>`;
};

/* Graph the ordered pairs from two rule patterns (5.OA.B.3). The grid comes from the coordinate-plane family (cpGrid in vis-plane.js).
   Values stay small enough for a first-quadrant grid: at most 12 on the B axis for "times" patterns, 11 for "plus" patterns. */
function nsxRule2g(rng, L) {
  const mult = L < 3 || rng() < 0.4, [d, k] = pick(rng, [[1, 2], [1, 3], [1, 4], [2, 2]]), c = ri(rng, 1, 3);
  const dA = mult ? d : ri(rng, 1, 2), dB = mult ? d * k : dA, aS = mult ? 0 : ri(rng, 0, 2), bS = mult ? 0 : aS + c, A = nsRuleSeq('add', dA, aS, 4), B = nsRuleSeq('add', dB, bS, 4);
  const Nx = Math.max(...A), Ny = Math.max(...B), cs = Math.min(26, Math.floor(220 / (Nx + 1)), Math.floor(170 / Ny));
  const pts = A.map((a, i) => ({ x: a, y: B[i] })), g = cpGrid(Nx, Ny, cs, [], { named: true, xl: 'Pattern A', yl: 'Pattern B' }), gk = cpGrid(Nx, Ny, cs, pts.map(q => Object.assign({ key: true }, q)), { named: true, xl: 'Pattern A', yl: 'Pattern B' });
  const lines = [`Pattern A: ${nsRuleText('add', dA)}, start at ${aS}`, `Pattern B: ${nsRuleText('add', dB)}, start at ${bS}`], tab = `A: ${A.join(', ')}`, tabB = `B: ${B.join(', ')}`;
  const nlines = lines.reduce((a, t) => a + Math.ceil(t.length / 24), 0) + 2 + Math.ceil('Graph the ordered pairs (A, B).'.length / 24);
  return { mod: 'ns', type: 'rule2g', prompt: 'Graph the ordered pairs.', mult, dA, dB, aS, bS, A, B, pts, lines, tab, tabB, svg: g.svg, svgKey: gk.svg, sw: g.W, sh: g.H, ans: pts.map(q => `(${q.x}, ${q.y})`).join(', '), sig: `r2g${dA}.${dB}.${aS}.${bS}`, win: Math.max(g.W / 100, 2.9), hin: g.H / 100 + 0.3 * nlines + 0.2, hfs: 0, bw: 0 };
}
const nsRule2gHtml = (p, key) => `${vwrap(p.lines[0], 2.9)}${vwrap(p.lines[1], 2.9)}<div>${esc(p.tab)}</div><div>${esc(p.tabB)}</div>${vwrap('Graph the ordered pairs (A, B).', 2.9)}${vsvg(p.sw / 100, p.sh / 100, key ? p.svgKey : p.svg, 'Coordinate grid for two patterns')}`;

defTypes("ns", "Counting and number lines", [
  { id: "skip", label: "Skip counting and patterns", blurb: "Fill in the missing numbers.", on: true, gen: nsSkip, html: nsSkipHtml },
  { id: "cfwd", label: "Count on or back", blurb: "Count from any number, back from 20, or by 1, 2, 5 to 120.", on: false, gen: nsxCount, html: nsCfwdHtml },
  { id: "kseq", label: "Count to 100", blurb: "Count by ones and tens, or back from 10.", on: false, gen: nsxKseq, html: nsKseqHtml },
  { id: "cseq", label: "Count to 1000", blurb: "Count by 5s, 10s and 100s.", on: false, gen: nsxCseq, html: nsCseqHtml },
  { id: "parity", label: "Even and odd", blurb: "Circle even or odd, or pick out numbers in a list.", on: false, gen: nsParity, html: nsParityHtml },
  { id: "par20", label: "Odd and even to 20", blurb: "Pair the objects, or write an even number as two equal addends.", on: false, gen: nsxPar20, html: nsPar20Html },
  { id: "line", label: "Number lines", blurb: "Read the number the arrow shows.", on: true, gen: nsLine, html: nsLineHtml },
{ id: "rulepat", label: "Rule patterns", blurb: "Next terms, find the rule, even or odd features, and shape patterns.", on: false, gen: nsxRulePat, html: nsRulePatHtml }
,
  { id: "rule2", label: "Two rule patterns", blurb: "Two patterns from two rules: terms, how matching terms are related, and ordered pairs.", on: false, gen: nsxRule2, html: nsRule2Html },
  { id: "rule2g", label: "Graph two patterns", blurb: "Graph the ordered pairs made from the matching terms of two rule patterns.", on: false, gen: nsxRule2g, html: nsRule2gHtml }
]);
