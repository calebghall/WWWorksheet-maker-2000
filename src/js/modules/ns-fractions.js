/* ---------- Number Sense: fraction operations (adding, sharing, multiplying and dividing fractions and mixed numbers) ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   Types are registered at the bottom with defTypes. Fractions are [whole, numerator, denominator] triples; answers are { w, n, d }
   (whole part, remainder numerator and denominator) in simplest form, drawn with ansTpl.
   fadd5: add and subtract with unlike denominators and mixed numbers. fctx: addition and subtraction word problems with estimates.
   fdiv5: a fraction as division. fmul5: multiply by a whole number or a fraction, with area models. fscale: multiplication as scaling.
   fword6: multiplication word problems with fractions and mixed numbers. fdiv7: divide unit fractions and whole numbers. */

/* [w, n, d] as html: a whole number, a fraction or a mixed number */
const fvH = a => a[1] ? (a[0] ? `<span class="mw">${a[0]}</span>` : '') + frH(a[1], a[2]) : String(a[0]);

/* the same value as plain text */
const fvT = a => a[1] ? (a[0] ? `${a[0]} ` : '') + `${a[1]}/${a[2]}` : String(a[0]);

/* width in em of fvH */
const fvW = a => a[1] ? (a[0] ? 1.2 : 0) + frW(a[1], a[2]) : String(a[0]).length * 0.62;

/* improper numerator of [w, n, d] */
const fvN = a => a[0] * a[2] + a[1];

/* answer slot like ansTpl, but a zero answer shows as 0 */
const ansT = (a, key) => !a.w && !a.n ? (key ? '<span class="ak"><span class="mw">0</span></span>' : '<span class="mw bl">&nbsp;</span>') : ansTpl(a, key);

/* a random proper fraction with denominator d */
const fvProper = (rng, d) => [0, ri(rng, 1, d - 1), d];

/* a template-sized answer for a number of halves, rounded: nearest 1/2 of n/d */
const nearHalf = (n, d) => mixedOf(Math.round(2 * n / d), 2);

/* add and subtract fractions with unlike denominators. L1 one denominator a multiple of the other, L2 any unlike denominators (sums can pass 1),
   L3 mixed numbers (subtraction may need regrouping). */
function nsxFadd5(rng, L) {
  const op = rng() < 0.5 ? 'add' : 'sub';
  let a, b, g = 0;
  do {
    g++;
    if (L === 1) { const d1 = pick(rng, [2, 3, 4, 5, 6]), d2 = d1 * ri(rng, 2, Math.max(2, Math.floor(12 / d1))); a = fvProper(rng, d1); b = fvProper(rng, d2); if (rng() < 0.5) { const t = a; a = b; b = t; } }
    else {
      let d1, d2; do { d1 = ri(rng, 2, 9); d2 = ri(rng, 2, 9); } while (d1 === d2 || lcm(d1, d2) > 36 || (L === 2 && (d1 % d2 === 0 || d2 % d1 === 0)));
      a = fvProper(rng, d1); b = fvProper(rng, d2);
      if (L === 3) { a[0] = ri(rng, 1, 5); b[0] = ri(rng, 1, 4); }
    }
    if (op === 'sub' && fvN(a) * b[2] < fvN(b) * a[2]) { const t = a; a = b; b = t; }
  } while (g < 80 && op === 'sub' && fvN(a) * b[2] === fvN(b) * a[2]);
  const Lc = lcm(a[2], b[2]), r = fvN(a) * (Lc / a[2]) + (op === 'add' ? 1 : -1) * fvN(b) * (Lc / b[2]), ans = mixedOf(r, Lc);
  return { mod: 'ns', type: 'fadd5', prompt: op === 'add' ? 'Add. Write the sum in simplest form.' : 'Subtract. Write the difference in simplest form.', op, a, b, ans, sig: `f5${op}${a}|${b}`, ew: fvW(a) + fvW(b) + 4.4 + tplW(ans), eh: 4.2 };
}

const nsFadd5Html = (p, key, x) => `${fvH(p.a)} ${p.op === 'add' ? '+' : '−'} ${fvH(p.b)} = ${ansT(p.ans, key)}`;

/* word problems with the same whole: add or subtract, estimate to the nearest 1/2 first, and judge a claimed sum with a benchmark.
   L1 one denominator a multiple of the other, L2 unlike denominators, L3 mixed numbers. */
const FC_ADD = [
  (nm, A, B) => ({ t: `${nm} ran ${A} mile on Saturday and ${B} mile on Sunday. How many miles did ${nm} run in all?`, u: 'miles' }),
  (nm, A, B) => ({ t: `${nm} poured ${A} cup of juice and then ${B} cup of water into a pitcher. How many cups are in the pitcher?`, u: 'cups' }),
  (nm, A, B) => ({ t: `${nm} bought ${A} pound of apples and ${B} pound of pears. How many pounds of fruit did ${nm} buy?`, u: 'pounds' })
];
const FC_SUB = [
  (nm, A, B) => ({ t: `${nm} had ${A} yards of ribbon and used ${B} yard for a gift. How many yards are left?`, u: 'yards' }),
  (nm, A, B) => ({ t: `A jug held ${A} gallon of water. ${nm} used ${B} gallon. How many gallons are left?`, u: 'gallons' }),
  (nm, A, B) => ({ t: `${nm} had a rope ${A} meters long and cut off ${B} meter. How many meters are left?`, u: 'meters' })
];

function nsxFctx(rng, L) {
  const kind = pick(rng, L === 1 ? ['add', 'sub'] : ['add', 'sub', 'check']), nm = pick(rng, NS_NAMES);
  let d1, d2;
  do { d1 = ri(rng, 2, L === 1 ? 6 : 9); d2 = L === 1 ? d1 * ri(rng, 2, Math.max(2, Math.floor(12 / d1))) : ri(rng, 2, 9); } while (d1 === d2 || (L > 1 && lcm(d1, d2) > 36));
  const sub = kind === 'sub';
  let a, b, g = 0;
  do {
    a = fvProper(rng, d1); b = fvProper(rng, d2);
    if (L === 3 && kind !== 'check') { a[0] = ri(rng, 1, 4); b[0] = ri(rng, 1, 3); }
    if (sub && fvN(a) * b[2] < fvN(b) * a[2]) { const t = a; a = b; b = t; }
    g++;
  } while (sub && fvN(a) * b[2] === fvN(b) * a[2] && g < 100);
  const Lc = lcm(a[2], b[2]), r = fvN(a) * (Lc / a[2]) + (sub ? -1 : 1) * fvN(b) * (Lc / b[2]), ans = mixedOf(r, Lc);
  if (kind === 'check') {
    const ok = rng() < 0.4, wrong = mixedOf(a[1] + b[1], a[2] + b[2]), shown = ok ? ans : wrong;
    if (!ok && wrong.w === ans.w && wrong.n === ans.n && wrong.d === ans.d) return nsxFctx(rng, L);
    return { mod: 'ns', type: 'fctx', prompt: 'Is the answer reasonable?', kind, a, b, shown, ans: ok ? 'reasonable' : 'not reasonable', opts: ['reasonable', 'not reasonable'], right: ans, wide: true,
      html: `${nm} says ${fvH(a)} + ${fvH(b)} = ${fvH([shown.w, shown.n, shown.d])}. Use 1/2 or 1 to check.`, sig: `fck${a}|${b}${ok}`, ew: 21, eh: 1.1 + 2 * 2.4 + 1.6 + 1.5 };
  }
  const ctx = (sub ? pick(rng, FC_SUB) : pick(rng, FC_ADD))(nm, '\u0001A', '\u0001B'), html = esc(ctx.t).replace('\u0001A', fvH(a)).replace('\u0001B', fvH(b)), est = nearHalf(r, Lc);
  return { mod: 'ns', type: 'fctx', prompt: 'Estimate, then solve.', kind, a, b, ans, est, unit: ctx.u, wide: true, html, sig: `fc${kind}${a}|${b}${ctx.u}`, ew: 21, eh: 1.1 + 2 * 2.4 + 1.6 + 2 * 2.5 };
}

const nsFctxHtml = (p, key, x) => p.kind === 'check' ? `<div class="wt">${p.html}</div><div>${opts(p.opts, p.ans, key)}</div><div>Why? <span class="blank" style="min-width:12em">${key ? (p.ans === 'reasonable' ? 'It matches the sum.' : 'It is less than one of the fractions.') : '&nbsp;'}</span></div>`
  : `<div class="wt">${p.html}</div><div>Estimate to the nearest ½: ${ansT(p.est, key)}</div><div>Answer: ${ansT(p.ans, key)} ${p.unit}</div>`;

/* a fraction is a division. L1 a ÷ b as a proper fraction, L2 as a mixed number, L3 sharing word problems and the two whole numbers the answer lies between. */
const FD_SHARE = [
  (m, b) => `${m} sheets of paper are shared equally among ${b} people. How many sheets does each person get?`,
  (m, b) => `${m} pounds of rice are poured equally into ${b} bags. How many pounds are in each bag?`,
  (m, b) => `${m} feet of rope are cut into ${b} equal pieces. How long is each piece, in feet?`
];

function nsxFdiv5(rng, L) {
  if (L < 3) {
    let a, b;
    do { b = ri(rng, 2, 9); a = L === 1 ? ri(rng, 1, b - 1) : ri(rng, b + 1, 4 * b); } while (gcd(a % b || a, b) !== 1 || (L === 2 && a % b === 0));
    const ans = L === 1 ? { w: 0, n: a, d: b } : mixedOf(a, b);
    return { mod: 'ns', type: 'fdiv5', prompt: L === 1 ? 'Write the quotient as a fraction.' : 'Write the quotient as a mixed number.', kind: 'eq', a, b, ans, sig: `fq${a}/${b}`, ew: `${a} ÷ ${b} =`.length * 0.62 + 2.6 + 1.6, eh: 4.0 };
  }
  let a, b;
  do { b = ri(rng, 3, 9); a = ri(rng, b + 1, 6 * b); } while (gcd(a % b || a, b) !== 1 || a % b === 0);
  const ans = mixedOf(a, b), text = pick(rng, FD_SHARE)(a, b);
  return { mod: 'ns', type: 'fdiv5', prompt: 'Read and solve.', kind: 'word', a, b, ans, text, between: [ans.w, ans.w + 1], wide: true, sig: `fqw${a}/${b}${text.length}`, ew: 21, eh: 1.1 + Math.ceil(text.length / 36) * 1.45 + 2.6 + 1.7 };
}

const nsFdiv5Html = (p, key, x) => p.kind === 'eq' ? `${p.a} ÷ ${p.b} = ${ansT(p.ans, key)}`
  : `<div class="wt">${esc(p.text)}</div><div>${p.a} ÷ ${p.b} = ${ansT(p.ans, key)}</div><div>Between ${x(p.between[0], 2)} and ${x(p.between[1], 2)}</div>`;

/* A unit square cut into d1 columns and d2 rows with the n1 × n2 overlap shaded: a picture of n1/d1 × n2/d2. */
function fmModel(n1, d1, n2, d2) {
  const S = 130, x0 = 4, y0 = 4, cw = S / d1, ch = S / d2;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1.4in" height="1.4in" viewBox="0 0 ${S + 8} ${S + 8}" role="img" aria-label="Unit square cut into ${d1} columns and ${d2} rows; ${n1} columns by ${n2} rows shaded" style="display:block">`;
  for (let i = 0; i < n1; i++) for (let j = 0; j < n2; j++) s += `<rect x="${(x0 + i * cw).toFixed(1)}" y="${(y0 + j * ch).toFixed(1)}" width="${cw.toFixed(1)}" height="${ch.toFixed(1)}" fill="var(--c0)"/>`;
  let t = '';
  for (let i = 1; i < d1; i++) t += `M${(x0 + i * cw).toFixed(1)} ${y0}V${y0 + S}`;
  for (let j = 1; j < d2; j++) t += `M${x0} ${(y0 + j * ch).toFixed(1)}H${x0 + S}`;
  s += `<path d="${t}" stroke="var(--ink)" stroke-width="1" fill="none"/><rect x="${x0}" y="${y0}" width="${S}" height="${S}" fill="none" stroke="var(--ink)" stroke-width="2.4"/>`;
  return s + '</svg>';
}

/* multiply a fraction by a whole number or by a fraction. L1 whole numbers, L2 adds fractions, models and the "partition then multiply" form, L3 fractions to ninths, models and areas. */
function nsxFmul5(rng, L) {
  const kind = pick(rng, L === 1 ? ['whole'] : L === 2 ? ['whole', 'frac', 'model', 'interp'] : ['frac', 'frac', 'model', 'area', 'interp']), dm = L === 3 ? 9 : 6;
  if (kind === 'whole') {
    const d = ri(rng, 2, 6), n = ri(rng, 1, d - 1), W = ri(rng, 2, L === 1 ? 9 : 12), first = rng() < 0.5, ans = mixedOf(n * W, d);
    return { mod: 'ns', type: 'fmul5', prompt: 'Multiply. Write the product in simplest form.', kind, n, d, W, first, ans, sig: `fx${n}/${d}x${W}${first}`, ew: frW(n, d) + String(W).length * 0.62 + 4.4 + tplW(ans), eh: 4.0 };
  }
  if (kind === 'interp') {
    const d = ri(rng, 3, 6), n = ri(rng, 2, d - 1), q = d * ri(rng, 2, 6), res = n * q / d;
    return { mod: 'ns', type: 'fmul5', prompt: 'Fill in the blanks.', kind, n, d, q, ans: String(res), sig: `fxi${n}/${d}x${q}`, ew: 24, eh: 4.0 };
  }
  let d1, d2, n1, n2;
  do { d1 = ri(rng, 2, dm); d2 = ri(rng, 2, dm); n1 = ri(rng, 1, d1 - 1); n2 = ri(rng, 1, d2 - 1); } while (L === 3 && kind === 'model' && d1 * d2 > 36);
  if (kind === 'model') { const m = mixedOf(n1 * n2, d1 * d2); return { mod: 'ns', type: 'fmul5', prompt: 'The shaded part is a product. Write it.', kind, n1, d1, n2, d2, ans: m, svg: fmModel(n1, d1, n2, d2), sig: `fxm${n1}/${d1}x${n2}/${d2}`, win: 1.5, hin: 1.4 + 0.7, ew: 14, eh: 1 }; }
  const ans = mixedOf(n1 * n2, d1 * d2);
  if (kind === 'area') {
    const unit = pick(rng, ['meter', 'foot', 'inch', 'mile']);
    return { mod: 'ns', type: 'fmul5', prompt: 'Find the area.', kind, n1, d1, n2, d2, unit, ans, wide: true, html: `A rectangle is ${frH(n1, d1)} ${unit} long and ${frH(n2, d2)} ${unit} wide. What is its area?`, sig: `fxa${n1}/${d1}x${n2}/${d2}${unit}`, ew: 21, eh: 1.1 + 2 * 2.4 + 2.6 + 0.6 };
  }
  return { mod: 'ns', type: 'fmul5', prompt: 'Multiply. Write the product in simplest form.', kind, n1, d1, n2, d2, ans, sig: `fxf${n1}/${d1}x${n2}/${d2}`, ew: frW(n1, d1) + frW(n2, d2) + 4.4 + tplW(ans), eh: 4.0 };
}

const nsFmul5Html = (p, key, x) => p.kind === 'whole' ? (p.first ? `${frH(p.n, p.d)} × ${p.W}` : `${p.W} × ${frH(p.n, p.d)}`) + ` = ${ansT(p.ans, key)}`
  : p.kind === 'frac' ? `${frH(p.n1, p.d1)} × ${frH(p.n2, p.d2)} = ${ansT(p.ans, key)}`
    : p.kind === 'interp' ? `${frH(p.n, p.d)} × ${p.q} = ${p.n} × (${p.q} ÷ ${x(p.d, 2)}) = ${x(p.ans, 2.8)}`
      : p.kind === 'model' ? `${p.svg}<div>${frH(p.n1, p.d1)} × ${frH(p.n2, p.d2)} = ${ansT(p.ans, key)}</div>`
        : `<div class="wt">${p.html}</div><div>Area: ${ansT(p.ans, key)} square ${p.unit}s</div>`;

/* multiplication as scaling: compare a product with one factor without calculating, and multiply by a fraction equal to 1.
   L1 whole numbers and fractions less than 1, L2 adds fractions equal to or greater than 1 and the equivalent-fraction kind, L3 adds mixed numbers. */
function nsxFscale(rng, L) {
  if (L > 1 && rng() < 0.35) {
    const d = ri(rng, 2, 6), n = ri(rng, 1, d - 1), k = ri(rng, 2, 6);
    return { mod: 'ns', type: 'fscale', prompt: 'Write the fraction equal to 1.', kind: 'eq1', n, d, k, ans: { w: 0, n: k, d: k }, sig: `fs1${n}/${d}x${k}`, ew: frW(n, d) + frW(n * k, d * k) + 3.8 + 2.6, eh: 4.2 };
  }
  const t = pick(rng, L === 1 ? ['less', 'less', 'whole'] : L === 2 ? ['less', 'whole', 'more', 'equal'] : ['less', 'more', 'mixed', 'equal', 'whole']), W = ri(rng, 2, 20);
  let f, rel;
  if (t === 'less') { const d = ri(rng, 2, 9); f = [0, ri(rng, 1, d - 1), d]; rel = 'less than'; }
  else if (t === 'whole') { f = [ri(rng, 2, 9), 0, 1]; rel = 'greater than'; }
  else if (t === 'more') { const d = ri(rng, 2, 8); f = [0, ri(rng, d + 1, 2 * d), d]; rel = 'greater than'; }
  else if (t === 'mixed') { const d = ri(rng, 2, 8); f = [ri(rng, 1, 3), ri(rng, 1, d - 1), d]; rel = 'greater than'; }
  else { const d = ri(rng, 2, 9); f = [0, d, d]; rel = 'equal to'; }
  const first = rng() < 0.5, o = ['greater than', 'less than', 'equal to'];
  return { mod: 'ns', type: 'fscale', prompt: 'Do not multiply. Circle the answer.', kind: 'cmp', f, W, first, opts: o, ans: rel, sig: `fsc${f}x${W}${f[1] === 0 && f[0] === W ? '' : first}`, ew: 22, eh: 1.1 + 2 * 1.5 + 4.0 + 0.4 };
}

const nsFscaleHtml = (p, key, x) => p.kind === 'eq1' ? `${frH(p.n, p.d)} × ${ansT(p.ans, key)} = ${frH(p.n * p.k, p.d * p.k)}`
  : `<div>${p.first ? `${fvH(p.f)} × ${p.W}` : `${p.W} × ${fvH(p.f)}`} is</div><div>${opts(p.opts, p.ans, key)}</div><div>${p.W}</div>`;

/* multiplication word problems. L1 a fraction of a whole number, L2 a fraction of a fraction and areas, L3 mixed numbers. */
const FW_NAMES = ['stickers', 'marbles', 'cards', 'pencils', 'cookies', 'stamps'];

function nsxFword6(rng, L) {
  const nm = pick(rng, NS_NAMES);
  if (L === 1) {
    const d = ri(rng, 2, 6), n = ri(rng, 1, d - 1), W = d * ri(rng, 2, 6), thing = pick(rng, FW_NAMES), ans = mixedOf(n * W, d);
    const text = `${nm} has ${W} ${thing}. ${frH(n, d)} of them are shiny. How many shiny ${thing} does ${nm} have?`;
    return { mod: 'ns', type: 'fword6', prompt: 'Read and solve.', kind: 'part', html: text, eq: `${n}/${d} × ${W}`, ans, unit: '', wide: true, sig: `fw1${n}/${d}x${W}${thing}`, ew: 21, eh: 1.1 + 2 * 2.4 + 1.7 + 2.6 + 0.6 };
  }
  const mixed = L === 3;
  let a, b;
  do {
    const d1 = ri(rng, 2, 6), d2 = ri(rng, 2, 6);
    a = fvProper(rng, d1); b = fvProper(rng, d2);
    if (mixed) { a[0] = ri(rng, 1, 3); if (rng() < 0.6) b[0] = ri(rng, 1, 2); }
  } while (a[2] === b[2] && a[1] === b[1]);
  const ans = mixedOf(fvN(a) * fvN(b), a[2] * b[2]), kind = pick(rng, ['recipe', 'area', 'drink']), u = pick(rng, ['meter', 'foot', 'yard']);
  const text = kind === 'recipe' ? `A recipe needs ${fvH(a)} cups of flour. ${nm} makes ${fvH(b)} of the recipe. How many cups of flour does ${nm} need?`
    : kind === 'area' ? `A garden is ${fvH(a)} ${u}s long and ${fvH(b)} ${u}s wide. What is the area of the garden, in square ${u}s?`
      : `A bottle holds ${fvH(a)} liters of water. ${nm} drinks ${fvH(b)} of the bottle. How many liters does ${nm} drink?`;
  return { mod: 'ns', type: 'fword6', prompt: 'Read and solve.', kind, a, b, html: text, eq: `${fvT(a)} × ${fvT(b)}`, ans, unit: kind === 'recipe' ? 'cups' : kind === 'area' ? `square ${u}s` : 'liters', wide: true,
    sig: `fw${L}${kind}${a}|${b}`, ew: 21, eh: 1.1 + 2 * 2.5 + 1.7 + 2.6 + 0.6 + (mixed ? 0.8 : 0) };
}

const nsFword6Html = (p, key, x) => `<div class="wt">${p.html}</div><div>Equation: <span class="blank" style="min-width:9em">${key ? esc(p.eq) : '&nbsp;'}</span></div><div>Answer: ${ansT(p.ans, key)} ${p.unit}</div>`;

/* divide unit fractions by whole numbers and whole numbers by unit fractions.
   L1 plain division, L2 adds the multiplication check and word problems, L3 adds whole numbers divided by fractions that are not unit fractions (whole-number quotients). */
const FD7_UW = [
  (W, d) => `${W} people share ${frH(1, d)} pound of chocolate equally. How much chocolate does each person get?`,
  (W, d) => `${frH(1, d)} of a pizza is left. ${W} friends share it equally. What fraction of the whole pizza does each friend get?`
];
const FD7_WU = [
  (W, d) => `How many ${frH(1, d)}-cup servings are in ${W} cups of raisins?`,
  (W, d) => `${W} yards of ribbon are cut into pieces that are each ${frH(1, d)} yard long. How many pieces are there?`
];
const FD7_WN = [
  (W, n, d) => `How many ${frH(n, d)}-cup servings are in ${W} cups of nuts?`,
  (W, n, d) => `${W} yards of rope are cut into pieces that are each ${frH(n, d)} yard long. How many pieces are there?`
];

function nsxFdiv7(rng, L) {
  const kind = pick(rng, L === 1 ? ['uw', 'wu'] : L === 2 ? ['uw', 'wu', 'rel', 'ctxuw', 'ctxwu'] : ['uw', 'wu', 'rel', 'ctxuw', 'ctxwu', 'ctxwn', 'ctxwn']), d = ri(rng, 2, 8), W = ri(rng, 2, kind === 'wu' || kind === 'ctxwu' ? 9 : 6);
  const tag = { mod: 'ns', type: 'fdiv7' };
  if (kind === 'uw') return Object.assign(tag, { prompt: 'Divide.', kind, d, W, ans: { w: 0, n: 1, d: d * W }, sig: `f7uw${d}/${W}`, ew: frW(1, d) + frW(1, d * W) + 6, eh: 4.0 });
  if (kind === 'wu') return Object.assign(tag, { prompt: 'Divide.', kind, d, W, ans: { w: W * d, n: 0, d: 1 }, sig: `f7wu${W}/${d}`, ew: frW(1, d) + 6 + 3.2, eh: 4.0 });
  if (kind === 'rel') return Object.assign(tag, { prompt: 'Divide. Check with multiplication.', kind, d, W, ans: { w: 0, n: 1, d: d * W }, sig: `f7r${d}/${W}`, ew: frW(1, d) + frW(1, d * W) * 2 + 12, eh: 4.0 });
  const ctx = (t, text, ans, extra) => Object.assign(tag, { prompt: 'Read and solve.', kind, d, W, text, ans, unit: t, wide: true, ew: 21 }, extra);
  if (kind === 'ctxuw') { const text = pick(rng, FD7_UW)(W, d); return ctx(text.includes('pizza') ? 'of the pizza' : 'pound', text, { w: 0, n: 1, d: d * W }, { sig: `f7cuw${d}/${W}${text.length}`, eh: 1.1 + 2 * 2.4 + 1.7 + 2.6 + 0.6 }); }
  if (kind === 'ctxwu') { const text = pick(rng, FD7_WU)(W, d); return ctx(text.includes('pieces') ? 'pieces' : 'servings', text, { w: W * d, n: 0, d: 1 }, { sig: `f7cwu${W}/${d}${text.length}`, eh: 1.1 + 2 * 2.4 + 1.7 + 2.6 + 0.6 }); }
  let dd, n, q, g = 0;
  do { dd = ri(rng, 3, 8); n = ri(rng, 2, dd - 1); q = ri(rng, 2, 6); g++; } while (g < 200 && (gcd(n, dd) !== 1 || (q * dd) % n !== 0 || (q * dd) / n < 2));
  const WW = q, tx = pick(rng, FD7_WN)(WW, n, dd), res = WW * dd / n;
  return ctx(tx.includes('pieces') ? 'pieces' : 'servings', tx, { w: res, n: 0, d: 1 }, { n, d: dd, W: WW, sig: `f7cwn${WW}/${n}/${dd}${tx.length}`, eh: 1.1 + 2 * 2.4 + 1.7 + 2.6 + 0.6 });
}

const nsFdiv7Html = (p, key, x) => p.kind === 'uw' ? `${frH(1, p.d)} ÷ ${p.W} = ${ansT(p.ans, key)}`
  : p.kind === 'wu' ? `${p.W} ÷ ${frH(1, p.d)} = ${ansT(p.ans, key)}`
    : p.kind === 'rel' ? `${frH(1, p.d)} ÷ ${p.W} = ${ansT(p.ans, key)}, because ${ansT(p.ans, key)} × ${p.W} = ${frH(1, p.d)}`
      : `<div class="wt">${p.text}</div><div>Answer: ${ansT(p.ans, key)} ${p.unit}</div>`;

defTypes("ns", "Fraction operations", [
  { id: "fadd5", label: "Add and subtract fractions, unlike denominators", blurb: "Unlike denominators and mixed numbers, answers in simplest form.", on: false, gen: nsxFadd5, html: nsFadd5Html },
  { id: "fctx", label: "Fraction addition and subtraction problems", blurb: "Word problems with an estimate to the nearest half, and checking a sum against a benchmark.", on: false, gen: nsxFctx, html: nsFctxHtml },
  { id: "fdiv5", label: "A fraction is a division", blurb: "a ÷ b as a fraction or mixed number, and sharing problems.", on: false, gen: nsxFdiv5, html: nsFdiv5Html },
  { id: "fmul5", label: "Multiply fractions", blurb: "A fraction times a whole number or a fraction, area models and rectangle areas.", on: false, gen: nsxFmul5, html: nsFmul5Html },
  { id: "fscale", label: "Multiplication as scaling", blurb: "Compare a product with a factor without multiplying; multiply by a fraction equal to 1.", on: false, gen: nsxFscale, html: nsFscaleHtml },
  { id: "fword6", label: "Fraction multiplication problems", blurb: "Fractions of whole numbers, fractions of fractions and mixed numbers.", on: false, gen: nsxFword6, html: nsFword6Html },
  { id: "fdiv7", label: "Divide unit fractions", blurb: "A unit fraction divided by a whole number, a whole number divided by a unit fraction, and word problems.", on: false, gen: nsxFdiv7, html: nsFdiv7Html }
]);
