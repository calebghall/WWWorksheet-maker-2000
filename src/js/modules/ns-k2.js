/* ---------- number sense: kindergarten to grade 2 additions ----------
   Included after ns-ext.js; merges into NGEN_EXT and NS_EXT_TYPES, and adds cell bodies through NSK_HTML (called first by nsxHtml).
   kseq (K.CC.A.1), cseq (2.NBT.A.2), numrw (1.NBT.A.1), bondp (K.OA.A.3, K.OA.A.4, K.NBT.A.1), substr (1.OA.B.3), cmp2 (1.NBT.B.4),
   par20 (2.OA.C.3), moreexp (1.NBT.C.6). */
const NSK_HTML = {};
const seqProb = (type, prompt, vals, rng) => {
  const terms = vals.map(String), idx = shuffle(rng, [1, 2, 3, 4, 5]).slice(0, 2).sort((a, b) => a - b);
  return { mod: 'ns', type, prompt, terms, idx, sig: `${type}${terms}${idx}`, ew: terms.reduce((a, s, i) => a + Math.max(s.length * 0.62 + 0.9, idx.includes(i) ? 3.0 : 0), 0) + 1, eh: 1.1 + 1.6 };
};
/* K.CC.A.1: count to 100 by ones, fives and tens (L2 and L3 also count back from 10). */
function nsxKseq(rng, L) {
  const kind = pick(rng, L === 1 ? ['t', 'f', 'o'] : ['t', 'f', 'o', 'b']);
  if (kind === 'f') { const s = 5 * ri(rng, 0, 14); return seqProb('kseq', 'Count by fives. Fill in the blanks:', Array.from({ length: 6 }, (_, i) => s + 5 * i), rng); }
  if (kind === 't') { const s = 10 * ri(rng, 0, 5); return seqProb('kseq', 'Count by tens. Fill in the blanks:', Array.from({ length: 6 }, (_, i) => s + 10 * i), rng); }
  if (kind === 'o') { const s = ri(rng, 1, L === 3 ? 95 : 94); return seqProb('kseq', 'Count on. Fill in the missing numbers:', Array.from({ length: 6 }, (_, i) => s + i), rng); }
  const s = ri(rng, 5, 10); return seqProb('kseq', 'Count back. Fill in the missing numbers:', Array.from({ length: 6 }, (_, i) => s - i), rng);
}
/* 2.NBT.A.2: count within 1000 by 5s, 10s and 100s. */
function nsxCseq(rng, L) {
  const step = pick(rng, [5, 10, 100]), back = L > 1 && rng() < 0.3, lo = step === 100 ? 1 : step === 10 ? 10 : 20, hi = (step === 100 ? 5 : step === 10 ? 94 : 190);
  let s = step * ri(rng, lo, hi);
  const vals = Array.from({ length: 6 }, (_, i) => back ? s + 5 * step - i * step : s + i * step);
  return seqProb('cseq', `Count by ${step}s${back ? ' back' : ''}. Fill in the blanks:`, vals, rng);
}
/* 1.NBT.A.1: read and write numbers to 120 (L1 to 20, L2 to 99, L3 to 120). */
const NK_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const NK_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const numWord = n => n < 20 ? NK_ONES[n] : n < 100 ? NK_TENS[Math.floor(n / 10)] + (n % 10 ? '-' + NK_ONES[n % 10] : '') : n === 100 ? 'one hundred' : 'one hundred ' + numWord(n - 100);
function nkBlocks(n) {
  const h = Math.floor(n / 100), t = Math.floor(n % 100 / 10), o = n % 10, RW = 12, RG = 4, RH = 60;
  let x = 4, s = '';
  if (h) { s += `<rect x="${x}" y="2" width="${RW * 10}" height="${RH}" fill="var(--c2)" stroke="var(--ink)" stroke-width="1.5"/>`; for (let i = 1; i < 10; i++) s += `<path d="M${x + i * RW} 2V${RH + 2}M${x} ${2 + i * 6}H${x + RW * 10}" stroke="var(--ink)" stroke-width=".6"/>`; x += RW * 10 + 10; }
  for (let i = 0; i < t; i++) { s += `<rect x="${x}" y="2" width="${RW}" height="${RH}" fill="var(--c0)" stroke="var(--ink)" stroke-width="1.5"/>`; for (let j = 1; j < 10; j++) s += `<path d="M${x} ${2 + j * 6}H${x + RW}" stroke="var(--ink)" stroke-width=".6"/>`; x += RW + RG; }
  x += o ? 8 : 0;
  for (let i = 0; i < o; i++) s += `<rect x="${x + (i % 5) * 16}" y="${2 + Math.floor(i / 5) * 16}" width="12" height="12" fill="var(--c1)" stroke="var(--ink)" stroke-width="1.5"/>`;
  const w = x + (o ? Math.min(o, 5) * 16 : 0) + 4;
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${w / 100}in" height="${(RH + 4) / 100}in" viewBox="0 0 ${w} ${RH + 4}" role="img" aria-label="Base-ten blocks" style="display:block">${s}</svg>`, w: w / 100 };
}
function nsxNumrw(rng, L) {
  const mx = L === 1 ? 20 : L === 2 ? 99 : 120, n = ri(rng, L === 1 ? 1 : 10, mx), v = pick(rng, L === 1 ? ['w2n', 'n2w', 'blocks'] : ['w2n', 'n2w', 'blocks', 'to']);
  const base = { mod: 'ns', type: 'numrw', variant: v, n, sig: `nr${v}${n}` };
  if (v === 'w2n') return Object.assign(base, { prompt: 'Write the number.', word: numWord(n), ans: String(n), ew: numWord(n).length * 0.6 + BW + 2, eh: 1.1 + 1.6 });
  if (v === 'n2w') return Object.assign(base, { prompt: 'Write the number in words.', ans: numWord(n), ew: Math.max(14, numWord(n).length * 0.6 + 2), eh: 1.1 + 1.6 * 2 });
  if (v === 'to') { const t = Math.floor(n / 10), o = n % 10; return Object.assign(base, { prompt: 'Write the number.', t, o, ans: String(n), ew: 17, eh: 1.1 + 1.6 }); }
  const b = nkBlocks(n);
  return Object.assign(base, { prompt: 'Write the number.', ans: String(n), win: Math.max(b.w, 1.8), hin: 0.64 + 0.4, ew: 14, eh: 1 });
}
NSK_HTML.numrw = (p, key, x) => p.variant === 'w2n' ? `${esc(p.word)} = ${x(p.ans, 3.4)}`
  : p.variant === 'n2w' ? `<div>${p.n}</div><div><span class="blank" style="min-width:${Math.max(12, p.ans.length * 0.6 + 1).toFixed(1)}em">${key ? esc(p.ans) : '&nbsp;'}</span></div>`
  : p.variant === 'to' ? `${p.t} ${p.t === 1 ? 'ten' : 'tens'} ${p.o} ${p.o === 1 ? 'one' : 'ones'} = ${x(p.ans, 3.4)}`
  : nkBlocks(p.n).svg + `<div>${x(p.ans, 3.4)}</div>`;
/* K.OA.A.3, K.OA.A.4, K.NBT.A.1: number bonds with counters. L1 two colors within 10, L2 a ten-frame (make ten), L3 teen numbers on two ten-frames. */
const nkDot = (cx, cy, c) => `<circle cx="${cx}" cy="${cy}" r="11" fill="var(--c${c})" stroke="var(--ink)" stroke-width="1.5"/>`;
const nkFrame = (x0, filled) => { let s = `<rect x="${x0}" y="2" width="150" height="60" fill="none" stroke="var(--ink)" stroke-width="2"/><path d="M${x0} 32H${x0 + 150}${[1, 2, 3, 4].map(i => `M${x0 + i * 30} 2V62`).join('')}" stroke="var(--ink)" stroke-width="1.2"/>`;
  for (let i = 0; i < filled; i++) s += nkDot(x0 + 15 + (i % 5) * 30, 17 + Math.floor(i / 5) * 30, 0); return s; };
function nsxBondp(rng, L) {
  let tok, svg, w, h;
  if (L === 1) {
    const n = ri(rng, 3, 10), a = ri(rng, 1, n - 1), b = n - a;
    svg = Array.from({ length: n }, (_, i) => nkDot(16 + i * 28 + (i >= a ? 12 : 0), 16, i < a ? 0 : 1)).join(''); w = n * 28 + 12 + 4; h = 32;
    tok = [U(a), ' + ', U(b), ` = ${n}`];
    return { mod: 'ns', type: 'bondp', prompt: 'How many of each color?', tok, svg, a, n, sig: `bp1${a}${n}`, win: Math.max(w / 100, 2.2), hin: h / 100 + 0.4, svgw: w, svgh: h, ew: 14, eh: 1 };
  }
  if (L === 2) { const a = ri(rng, 1, 9); svg = nkFrame(2, a); w = 154; h = 64; tok = [`${a} + `, U(10 - a), ' = 10']; return { mod: 'ns', type: 'bondp', prompt: 'How many more make 10?', tok, svg, a, n: 10, sig: `bp2${a}`, win: 2.2, hin: 0.64 + 0.4, svgw: w, svgh: h, ew: 14, eh: 1 }; }
  const n = ri(rng, 11, 19), b = n - 10;
  svg = nkFrame(2, 10) + `<g transform="translate(160 0)">${nkFrame(2, 0).replace(/<circle[^>]*>/g, '')}</g>`;
  let d = ''; for (let i = 0; i < b; i++) d += nkDot(160 + 17 + (i % 5) * 30, 17 + Math.floor(i / 5) * 30, 1);
  svg += d; w = 316; h = 64; tok = ['10 + ', U(b), ` = ${n}`];
  return { mod: 'ns', type: 'bondp', prompt: 'Write the missing number.', tok, svg, a: 10, n, sig: `bp3${n}`, win: 3.3, hin: 0.64 + 0.4, svgw: w, svgh: h, ew: 14, eh: 1 };
}
NSK_HTML.bondp = (p, key, x) => `<svg xmlns="http://www.w3.org/2000/svg" width="${p.svgw / 100}in" height="${p.svgh / 100}in" viewBox="0 0 ${p.svgw} ${p.svgh}" role="img" aria-label="Counters" style="display:block">${p.svg}</svg><div>${tokHtml(p.tok, key, x)}</div>`;
/* 1.OA.B.3: subtraction strategies within 20. */
function nsxSubstr(rng, L) {
  const kind = pick(rng, L === 1 ? ['add', 'back'] : ['add', 'ten', 'back', 'ten']);
  let tok, sx;
  if (kind === 'add') { const a = ri(rng, 6, 18), b = ri(rng, 2, Math.min(9, a - 1)); tok = [`Think addition: ${b} + `, U(a - b), ` = ${a}, so ${a} − ${b} = `, U(a - b)]; sx = `${a}-${b}`; }
  else if (kind === 'ten') { const a = ri(rng, 11, 18), t = a - 10, b = ri(rng, t + 1, 9); tok = [`${a} − ${b}:  ${a} − ${t} = `, U(10), `, then 10 − ${b - t} = `, U(a - b)]; sx = `${a}-${b}`; }
  else { const a = ri(rng, 6, 20), b = ri(rng, 2, 4); tok = [`${a} − ${b}: ${a}, `]; for (let i = 1; i <= b; i++) tok.push(U(a - i), i < b ? ', ' : ''); tok.push(`. So ${a} − ${b} = `, U(a - b)); sx = `${a}-${b}`; }
  return { mod: 'ns', type: 'substr', prompt: kind === 'add' ? 'Use addition to subtract.' : kind === 'ten' ? 'Make a ten to subtract.' : 'Count back to subtract.', kind, tok, sig: `ss${kind}${sx}`, ew: tokW(tok) * (kind === 'back' ? 1.3 : 1.1) + 1, eh: 1.1 + 1.6 };
}
NSK_HTML.substr = (p, key, x) => tokHtml(p.tok, key, x);
/* 1.NBT.B.4: compare two-digit numbers (L1 different tens, L2 any, L3 with equal numbers). */
function nsxCmp2(rng, L) {
  let a, b;
  for (let g = 0; g < 200; g++) {
    a = ri(rng, 10, 99); b = L === 1 || (L === 2 && rng() < 0.4) ? ri(rng, 10, 99) : Math.max(10, Math.min(99, a + ri(rng, -9, 9)));
    if (L === 3 && rng() < 0.1) b = a;
    if ((L === 1 && Math.floor(a / 10) === Math.floor(b / 10)) || (a === b && L < 3)) continue;
    break;
  }
  return { mod: 'ns', type: 'compare', prompt: 'Write <, > or =.', a: String(a), b: String(b), ans: sgn(a, b), sig: `cp${a}|${b}`, ew: 4 * 0.62 + 4.6, eh: 1.1 + 1.8 };
}
/* 2.OA.C.3: odd and even within 20: pair the objects, then say even or odd; write an even number as two equal addends. */
function nsxPar20(rng, L) {
  const v = pick(rng, L === 1 ? ['pic', 'pic', 'one'] : ['pic', 'one', 'eq', 'eq']);
  if (v === 'one') { const n = ri(rng, 1, 20); return { mod: 'ns', type: 'parity', prompt: 'Circle even or odd:', single: true, n: String(n), ans: n % 2 ? 'odd' : 'even', sig: `pa${n}`, ew: 12, eh: 1.1 + 1.8 }; }
  if (v === 'eq') { const n = 2 * ri(rng, 1, 10), tok = [`${n} = `, U(n / 2), ' + ', U(n / 2)]; return { mod: 'ns', type: 'par20', variant: 'eq', prompt: 'Write the number as two equal addends.', n, tok, sig: `pe${n}`, ew: tokW(tok) + 1, eh: 1.1 + 1.6 }; }
  const n = ri(rng, 2, 20), cols = Math.ceil(n / 2), w = cols * 28 + 8;
  return { mod: 'ns', type: 'par20', variant: 'pic', prompt: 'Circle pairs. Even or odd?', n, ans: n % 2 ? 'odd' : 'even', sig: `pp${n}`, win: Math.max(w / 100, 2.4), hin: 0.7 + 0.4, ew: 14, eh: 1 };
}
NSK_HTML.par20 = (p, key, x) => {
  if (p.variant === 'eq') return tokHtml(p.tok, key, x);
  const cols = Math.ceil(p.n / 2), w = cols * 28 + 8; let s = '';
  for (let i = 0; i < p.n; i++) s += nkDot(18 + Math.floor(i / 2) * 28, 18 + (i % 2) * 28, 1);
  if (key) for (let c = 0; c < Math.floor(p.n / 2); c++) s += `<rect x="${6 + c * 28}" y="3" width="24" height="58" rx="12" fill="none" stroke="var(--key)" stroke-width="2.5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w / 100}in" height="0.7in" viewBox="0 0 ${w} 70" role="img" aria-label="Counters" style="display:block">${s}</svg><div>${opts(['even', 'odd'], p.ans, key)}</div>`;
};
/* 1.NBT.C.6: 10 more or 10 less, with the explanation line. */
function nsxMoreExp(rng, L) {
  const more = rng() < 0.5, base = more ? ri(rng, 10, 89) : ri(rng, 20, 99), ans = more ? base + 10 : base - 10;
  return { mod: 'ns', type: 'moreexp', prompt: 'Write the number. Then explain.', base, more, ans: String(ans), sig: `me${base}${more}`, ew: 22, eh: 1.1 + 1.6 * 3 };
}
NSK_HTML.moreexp = (p, key, x) => `<div>10 ${p.more ? 'more' : 'less'} than ${p.base} = ${x(p.ans, BW)}</div><div>How do you know?</div><div><span class="blank" style="min-width:20em">${key ? `The tens digit ${p.more ? 'goes up' : 'goes down'} by 1.` : '&nbsp;'}</span></div>`;

Object.assign(NGEN_EXT, { kseq: nsxKseq, cseq: nsxCseq, numrw: nsxNumrw, bondp: nsxBondp, substr: nsxSubstr, cmp2: nsxCmp2, par20: nsxPar20, moreexp: nsxMoreExp });
NS_EXT_TYPES.push('kseq', 'cseq', 'numrw', 'bondp', 'substr', 'par20', 'moreexp');   // cmp2 returns the core 'compare' type
