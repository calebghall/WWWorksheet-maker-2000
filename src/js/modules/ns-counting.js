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
  const terms = vals.map(String), idx = shuffle(rng, [1, 2, 3, 4, 5]).slice(0, 2).sort((a, b) => a - b);
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

defTypes("ns", "Counting and number lines", [
  { id: "skip", label: "Skip counting and patterns", blurb: "Fill in the missing numbers.", on: true, gen: nsSkip, html: nsSkipHtml },
  { id: "cfwd", label: "Count on or back", blurb: "Count from any number, back from 20, or by 1, 2, 5 to 120.", on: false, gen: nsxCount, html: nsCfwdHtml },
  { id: "kseq", label: "Count to 100", blurb: "Count by ones and tens, or back from 10.", on: false, gen: nsxKseq, html: nsKseqHtml },
  { id: "cseq", label: "Count to 1000", blurb: "Count by 5s, 10s and 100s.", on: false, gen: nsxCseq, html: nsCseqHtml },
  { id: "parity", label: "Even and odd", blurb: "Circle even or odd, or pick out numbers in a list.", on: false, gen: nsParity, html: nsParityHtml },
  { id: "par20", label: "Odd and even to 20", blurb: "Pair the objects, or write an even number as two equal addends.", on: false, gen: nsxPar20, html: nsPar20Html },
  { id: "line", label: "Number lines", blurb: "Read the number the arrow shows.", on: true, gen: nsLine, html: nsLineHtml }
]);
