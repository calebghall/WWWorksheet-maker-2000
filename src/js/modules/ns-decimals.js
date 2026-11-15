/* ---------- Number Sense: decimals and powers of ten ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   Types are registered at the bottom with defTypes.
   tenxd: ten times and one tenth with decimals. pow10: powers of 10 as exponents. decrw: read and write decimals to thousandths.
   rnddec: round decimals with number lines. decrsn: divide a whole number by a decimal, and check an answer for reasonableness. */

/* A decimal string with commas in its whole-number part, trailing zeros removed. */
const ndc = s => trimZ(s).replace(/^\d+/, m => cnum(Number(m)));

/* A random decimal as { m, dp }: mantissa m (no trailing zero when dp > 0) with dp decimal places and a whole part of wi digits. */
function ndRand(rng, wi, dp) {
  if (dp === 0) return { m: wi === 1 ? ri(rng, 2, 9) : ri(rng, P10(wi - 1), P10(wi) - 1), dp };
  let m;
  do { m = ri(rng, P10(wi - 1) * P10(dp) + 1, P10(wi) * P10(dp) - 1); } while (m % 10 === 0);
  return { m, dp };
}

/* ten times as much and one tenth as much. L1 whole numbers, L2 tenths and hundredths, L3 up to thousandths. */
function nsxTenxD(rng, L) {
  const kind = pick(rng, ['dig', 'dig', 'x10', 'div10']);
  if (kind === 'dig') {
    const ni = L === 1 ? ri(rng, 3, 5) : ri(rng, 1, 3), nd = L === 1 ? 0 : L === 2 ? ri(rng, 1, 2) : ri(rng, 1, 3), len = ni + nd;
    const i = ri(rng, 0, len - 2), d = ri(rng, 1, 9), dg = Array.from({ length: len }, () => ri(rng, 0, 9));
    dg[0] = Math.max(1, dg[0]); dg[i] = d; dg[i + 1] = d; if (nd && dg[len - 1] === 0) dg[len - 1] = ri(rng, 1, 9);
    const dir = L === 1 ? 'left' : pick(rng, ['left', 'right']);
    let shown = '';
    dg.forEach((c, j) => {
      shown += (j === i || j === i + 1) ? `<u>${c}</u>` : String(c);
      if (j < ni - 1 && ni >= 4 && (ni - 1 - j) % 3 === 0) shown += ',';
      if (j === ni - 1 && nd) shown += '.';
    });
    return { mod: 'ns', type: 'tenxd', prompt: 'Compare the underlined digits:', kind, dir, shown, ans: dir === 'left' ? '10' : '1/10', sig: `txd${dg.join('')}${ni}${i}${dir}`, ew: (len + 18) * 0.62 + 4, eh: 1.1 + 1.6 };
  }
  const dp = L === 1 ? 0 : L === 2 ? ri(rng, 1, 2) : ri(rng, 1, 3), r = ndRand(rng, L === 1 ? ri(rng, 2, 3) : ri(rng, 1, 2), dp), a = dstr(r.m, dp);
  if (kind === 'x10') {
    const ans = dp ? ndc(dstr(r.m, dp - 1)) : cnum(r.m * 10);
    return { mod: 'ns', type: 'tenxd', prompt: 'Write 10 times as much:', kind, a: ndc(a), ans, sig: `txx${a}`, ew: (a.length + ans.length + 4) * 0.62 + BW + 1, eh: 1.1 + 1.6 };
  }
  const ans = ndc(dstr(r.m, dp + 1));
  return { mod: 'ns', type: 'tenxd', prompt: 'Write one tenth as much:', kind, a: ndc(a), ans, sig: `txv${a}`, ew: (a.length + ans.length + 4) * 0.62 + BW + 1, eh: 1.1 + 1.6 };
}

const nsTenxDHtml = (p, key, x) => p.kind === 'dig'
  ? (p.dir === 'left' ? `${p.shown}&emsp;left = ${x(p.ans, 2.8)} × right` : `${p.shown}&emsp;right = ${x(p.ans, 3.2)} × left`)
  : p.kind === 'x10' ? `10 × ${p.a} = ${x(p.ans, 4)}` : `${p.a} ÷ 10 = ${x(p.ans, 4)}`;

/* powers of 10: values of 10 to a whole-number exponent, and multiplying or dividing by a power of 10.
   L1 whole numbers and exponents to 3, L2 adds decimals, L3 exponents to 5 and thousandths. */
function nsxPow10(rng, L) {
  const kind = pick(rng, ['val', 'mulp', 'mulp', 'divp']), kmax = L === 1 ? 3 : L === 2 ? 4 : 5;
  if (kind === 'val') { const k = ri(rng, 2, kmax); return { mod: 'ns', type: 'pow10', prompt: 'Write the number:', kind, k, ans: cnum(P10(k)), sig: `pw${k}`, ew: 8 * 0.62 + BW + 1, eh: 1.1 + 1.6 }; }
  const dp = L === 1 ? 0 : pick(rng, L === 2 ? [0, 1, 2] : [0, 1, 2, 3]), r = ndRand(rng, ri(rng, 1, 2), dp), k = ri(rng, 1, kmax), a = dstr(r.m, dp);
  let ans;
  if (kind === 'mulp') ans = k >= dp ? cnum(r.m * P10(k - dp)) : ndc(dstr(r.m, dp - k)); else ans = ndc(dstr(r.m, dp + k));
  return { mod: 'ns', type: 'pow10', prompt: kind === 'mulp' ? 'Multiply:' : 'Divide:', kind, a: ndc(a), k, ans, sig: `pw${kind}${a}${k}`, ew: (a.length + ans.length + 8) * 0.62 + BW + 1, eh: 1.1 + 1.6 };
}

const nsPow10Html = (p, key, x) => p.kind === 'val' ? `10<sup>${p.k}</sup> = ${x(p.ans, 5)}`
  : `${p.a} ${p.kind === 'mulp' ? '×' : '÷'} 10<sup>${p.k}</sup> = ${x(p.ans, 4.6)}`;

/* number words below 1000 */
const ndWord = n => n < 100 ? numWord(n) : NK_ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numWord(n % 100) : '');

const ND_PLACE = ['tenth', 'hundredth', 'thousandth'];

/* read and write decimals to thousandths in standard form, word form and expanded notation.
   L1 tenths and hundredths, L2 to thousandths, L3 thousandths with zeros inside. */
function nsxDecRw(rng, L) {
  const kind = pick(rng, L === 1 ? ['exp', 'std'] : ['exp', 'std', 'w2s', 's2w']), dp = L === 1 ? ri(rng, 1, 2) : L === 2 ? ri(rng, 2, 3) : 3;
  const ni = L === 1 ? ri(rng, 1, 2) : ri(rng, 1, 3), ints = rdigits(rng, ni, L === 3), decs = [];
  for (let i = 0; i < dp; i++) decs.push(i === dp - 1 ? ri(rng, 1, 9) : (L === 3 && rng() < 0.35 ? 0 : ri(rng, 1, 9)));
  const iv = Number(ints.join('')), fv = Number(decs.join('')), std = ndc(dstr(iv * P10(dp) + fv, dp));
  const terms = [];
  ints.forEach((dg, i) => { if (dg) terms.push(`(${dg} × ${cnum(P10(ni - 1 - i))})`); });
  decs.forEach((dg, i) => { if (dg) terms.push(`(${dg} × 1/${cnum(P10(i + 1))})`); });
  const expd = terms.join(' + '), fw = fv ? `${ndWord(fv)} ${ND_PLACE[dp - 1]}${fv === 1 ? '' : 's'}` : '', word = iv ? (fv ? `${ndWord(iv)} and ${fw}` : ndWord(iv)) : fw;
  const base = { mod: 'ns', type: 'decrw', kind, std, expd, word, wide: true, sig: `drw${kind}${std}` };
  const lines = t => Math.ceil(t.length / 36);
  if (kind === 'exp') return Object.assign(base, { prompt: 'Write in expanded form:', ans: expd, ew: 21, eh: 1.1 + 1.45 + lines(expd) * 1.5 + 0.9 });
  if (kind === 'std') return Object.assign(base, { prompt: 'Write in standard form:', ans: std, ew: 21, eh: 1.1 + lines(expd) * 1.45 + 1.7 + 0.6 });
  if (kind === 'w2s') return Object.assign(base, { prompt: 'Write the number:', ans: std, ew: 21, eh: 1.1 + lines(word) * 1.45 + 1.7 + 0.6 });
  return Object.assign(base, { prompt: 'Write the number in words:', ans: word, ew: 21, eh: 1.1 + 1.45 + lines(word) * 1.5 + 0.9 });
}

const nsDecRwHtml = (p, key, x) => p.kind === 'exp' ? `<div>${p.std}</div><div class="wl">${key ? esc(p.ans) : '&nbsp;'}</div>`
  : p.kind === 'std' ? `<div class="wt">${esc(p.expd)}</div><div>= ${x(p.ans, 5)}</div>`
  : p.kind === 'w2s' ? `<div class="wt">${esc(p.word)}</div><div>= ${x(p.ans, 5)}</div>`
  : `<div>${p.std}</div><div class="wl">${key ? esc(p.ans) : '&nbsp;'}</div>`;

/* round decimals to the nearest whole number, tenth or hundredth, with and without a number line.
   L1 nearest whole number, L2 adds tenths, L3 adds hundredths. A number line zooms in on the two nearest places. */
function nsxRndDec(rng, L) {
  const q = pick(rng, L === 1 ? [0, 0, 1] : L === 2 ? [0, 1, 1] : [0, 1, 2]), name = ['whole number', 'tenth', 'hundredth'][q], line = rng() < 0.55;
  if (line) {
    const dp = q + 1, wi = q === 0 ? ri(rng, 1, 2) : 1, lo = ri(rng, P10(wi - 1) * P10(q), P10(wi) * P10(q) - 1), k = ri(rng, 1, 9), n = lo * 10 + k;
    const r = k >= 5 ? lo + 1 : lo, shown = ndc2(dstr(n, dp)), ans = q === 0 ? String(r) : dstr(r, q);
    return { mod: 'ns', type: 'rnddec', prompt: `Use the number line to round ${shown} to the nearest ${name}:`, kind: 'line', shown, ans, svg: lineSvg(lo * 10, lo * 10 + 10, 10, k, dp), sig: `rdl${n}${q}`, win: 2.75, hin: 0.72 + 0.45, hfs: 3.2, ew: 14, eh: 1 };
  }
  const dp = q + ri(rng, 1, 2), wi = L === 1 ? ri(rng, 1, 2) : ri(rng, 1, 3);
  let r = ndRand(rng, wi, dp); while (r.m % P10(dp - q) === 0) r = ndRand(rng, wi, dp);
  const u = P10(dp - q), rr = Math.floor((r.m + u / 2) / u), shown = ndc2(dstr(r.m, dp)), ans = q === 0 ? cnum(rr) : ndc2(dstr(rr, q));
  return { mod: 'ns', type: 'rnddec', prompt: `Round to the nearest ${name}:`, kind: 'plain', shown, ans, sig: `rdp${r.m}${dp}${q}`, ew: Math.max(13, (shown.length + 4) * 0.62 + BW + 1.6), eh: 1.1 + 1.6 };
}

/* comma in the whole-number part, trailing zeros kept */
const ndc2 = s => s.replace(/^\d+/, m => cnum(Number(m)));

const nsRndDecHtml = (p, key, x) => p.kind === 'line' ? `${p.svg}<div>${p.shown} ≈ ${x(p.ans, 3.6)}</div>` : `${p.shown} ≈ ${x(p.ans, 3.6)}`;

/* A whole number divided by a decimal, and a check of whether an answer is reasonable.
   wdiv: 6 ÷ 0.5. reason: estimate with whole numbers, then say whether the written answer is reasonable (the wrong answers misplace the decimal point). */
function nsxDecRsn(rng, L) {
  if (rng() < 0.35) {
    const ds = L === 1 ? [[1, 10], [5, 10], [25, 100]] : [[1, 10], [2, 10], [4, 10], [5, 10], [25, 100], [5, 100], [75, 100]];
    const [dn, dd] = pick(rng, ds), unit = dd === 10 ? 1 : 2;
    let N, g = 0; do { N = ri(rng, 2, L === 1 ? 12 : 30); g++; } while ((N * dd) % dn !== 0 && g < 400);
    if ((N * dd) % dn !== 0) { N = dn; }
    const div = dstr(dn, unit), q = N * dd / dn;
    return { mod: 'ns', type: 'decrsn', prompt: 'Divide:', kind: 'wdiv', expr: `${N} ÷ ${div}`, ans: cnum(q), sig: `drd${N}/${dn}/${dd}`, ew: (`${N} ÷ ${div} =`.length + 4) * 0.62 + BW + 1, eh: 1.1 + 1.6 };
  }
  const op = pick(rng, L === 1 ? ['+', '−'] : L === 2 ? ['+', '−', '×'] : ['−', '×', '×']), dpA = L === 1 ? 1 : 2, dpB = op === '×' ? 1 : dpA;
  let a, b, A, B, tries = 0;
  do {
    a = ndRand(rng, ri(rng, 1, 2), dpA); b = ndRand(rng, 1, dpB); tries++;
    A = a.m / P10(dpA); B = b.m / P10(dpB);
  } while (tries < 300 && ((op === '−' && A <= B) || Math.round(A) === 0 || Math.round(B) === 0 || (op !== '×' && Math.abs(Math.round(A) - Math.round(B)) < 1 && op === '−')));
  const dp = op === '×' ? dpA + dpB : dpA, m = op === '+' ? a.m + b.m : op === '−' ? a.m - b.m : a.m * b.m, est = op === '+' ? Math.round(A) + Math.round(B) : op === '−' ? Math.round(A) - Math.round(B) : Math.round(A) * Math.round(B);
  const good = rng() < 0.5;
  let shownM = m, shownDp = dp;
  if (!good) { const sh = pick(rng, [1, 2]), up = rng() < 0.5; if (up) shownM = m * P10(sh); else shownDp = dp + sh; }
  const total = dstr(shownM, shownDp), shown = ndc2(total);
  return { mod: 'ns', type: 'decrsn', prompt: 'Estimate. Is the answer reasonable?', kind: 'reason', expr: `${ndc2(dstr(a.m, dpA))} ${op} ${ndc2(dstr(b.m, dpB))} = ${shown}`, est: cnum(est), ans: good ? 'yes' : 'no', opts: ['yes', 'no'],
    sig: `drr${a.m}${op}${b.m}${shown}`, ew: 24, eh: 1.1 + 1.45 + 1.6 + 1.4 };
}

const nsDecRsnHtml = (p, key, x) => p.kind === 'wdiv' ? `${p.expr} = ${x(p.ans, 4)}` : `<div>${p.expr}</div><div>Estimate: ${x(p.est, 3.4)}</div><div>${opts(p.opts, p.ans, key)}</div>`;

defTypes("ns", "Decimals and powers of ten", [
  { id: "tenxd", label: "Ten times and one tenth, decimals", blurb: "Compare digits in neighboring places, then write 10 times or one tenth as much.", on: false, gen: nsxTenxD, html: nsTenxDHtml },
  { id: "pow10", label: "Powers of 10", blurb: "Exponents of 10, and multiplying or dividing by a power of 10.", on: false, gen: nsxPow10, html: nsPow10Html },
  { id: "decrw", label: "Read and write decimals", blurb: "Standard form, word form and expanded notation to thousandths.", on: false, gen: nsxDecRw, html: nsDecRwHtml },
  { id: "rnddec", label: "Round decimals", blurb: "To the nearest whole number, tenth or hundredth, with number lines.", on: false, gen: nsxRndDec, html: nsRndDecHtml },
  { id: "decrsn", label: "Decimal division and reasonableness", blurb: "A whole number divided by a decimal; is a decimal answer reasonable?", on: false, gen: nsxDecRsn, html: nsDecRsnHtml }
]);
