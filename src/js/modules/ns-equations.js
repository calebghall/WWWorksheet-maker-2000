/* ---------- Number Sense: equations, properties and facts ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

/*: number bonds. L1 decompose within 10, L2 make ten, L3 teen numbers as ten and some ones. */
function nsxBond(rng, L) {
  if (L === 1) { const n = ri(rng, 3, 10), a = ri(rng, 1, n - 1); return tokProb('bond', 'Write the missing number:', rng() < 0.5 ? [`${n} = ${a} + `, U(n - a)] : [`${a} + `, U(n - a), ` = ${n}`]); }
  if (L === 2) { const a = ri(rng, 1, 9); return tokProb('bond', 'What makes 10?', rng() < 0.5 ? [`${a} + `, U(10 - a), ' = 10'] : ['10 = ', U(10 - a), ` + ${a}`]); }
  const n = ri(rng, 11, 19); return tokProb('bond', 'Write the missing number:', rng() < 0.5 ? [`${n} = 10 + `, U(n - 10)] : ['10 + ', U(n - 10), ` = ${n}`]);
}

/*: unknown in any position. L1 add/sub within 20, L2 within 100, L3 multiply and divide within 100. */
function nsxEqn(rng, L) {
  let a, b, c, op;
  if (L === 3) {
    if (rng() < 0.5) { a = ri(rng, 2, 10); b = ri(rng, 2, 10); c = a * b; op = '×'; }
    else { b = ri(rng, 2, 10); c = ri(rng, 2, 10); a = b * c; op = '÷'; }
  } else {
    const m = L === 1 ? 20 : 99;
    if (rng() < 0.5) { a = ri(rng, L === 1 ? 1 : 10, m - 1); b = ri(rng, 1, m - a); c = a + b; op = '+'; }
    else { a = ri(rng, L === 1 ? 2 : 11, m); b = ri(rng, 1, a - 1); c = a - b; op = '−'; }
  }
  const v = [a, b, c], u = ri(rng, 0, 2), s = i => i === u ? U(v[i]) : String(v[i]);
  const tok = rng() < 0.35 ? [s(2), ' = ', s(0), ` ${op} `, s(1)] : [s(0), ` ${op} `, s(1), ' = ', s(2)];
  return tokProb('eqn', 'Find the unknown number:', tok);
}

/* meaning of the equal sign. True or false, or find the number that balances. */
function nsxEqual(rng, L) {
  const mx = L === 1 ? 10 : 20;
  const expr = (v, flat) => {
    const r = rng();
    if (v < 2 || (flat && r < 0.3)) return String(v);
    if (r < 0.7 || v + 1 > mx) { const a = ri(rng, 1, v - 1); return `${a} + ${v - a}`; }
    const b = ri(rng, 1, Math.min(mx - v, 9)); return `${v + b} − ${b}`;
  };
  const v = ri(rng, 2, mx);
  if (rng() < 0.55) {
    const truth = rng() < 0.5; let w = v;
    if (!truth) { w = v + pick(rng, [-2, -1, 1, 2]); if (w < 1 || w > mx) w = v - 1; }
    const eq = `${expr(v, true)} = ${expr(w, false)}`;
    return { mod: 'ns', type: 'equal', prompt: 'Circle true or false.', kind: 'tf', eq, ans: truth ? 'true' : 'false', sig: 'eqtf' + eq, ew: eq.length * 0.62 + 12, eh: 1.1 + 1.8 };
  }
  const V = Math.max(v, 5), a = ri(rng, 1, V - 1), c = ri(rng, 1, V - 1);
  const tok = rng() < 0.5 ? [`${a} + `, U(V - a), ` = ${c} + ${V - c}`] : [`${c} + ${V - c} = ${a} + `, U(V - a)];
  return tokProb('equal', 'Find the number that makes the equation true:', tok, { kind: 'fill' });
}

/* Properties of operations. L1 addition, L2 multiplication, L3 distributive. */
function nsxProp(rng, L) {
  if (L === 3 && rng() < 0.65) L = 2;
  if (L === 1) {
    const a = ri(rng, 1, 9), b = ri(rng, 1, 9), c = ri(rng, 1, 9), r = rng();
    if (a + b + c <= 20 && r < 0.45) return tokProb('prop', 'Use the properties to fill in the blank:', [`(${a} + ${b}) + ${c} = ${a} + (`, U(b), ` + ${c})`]);
    return tokProb('prop', 'Use the properties to fill in the blank:', r < 0.8 ? [`${a} + ${b} = `, U(b), ` + ${a}`] : [`${a} + `, U(0), ` = ${a}`]);
  }
  if (L === 2) {
    const a = ri(rng, 2, 9), b = ri(rng, 2, 9);
    if (rng() < 0.55) return tokProb('prop', 'Use the properties to fill in the blank:', [`${a} × ${b} = `, U(b), ` × ${a}`]);
    const c = ri(rng, 2, 5); return tokProb('prop', 'Use the properties to fill in the blank:', [`(${a} × ${b}) × ${c} = ${a} × (`, U(b), ` × ${c})`]);
  }
  const a = ri(rng, 3, 9), b = ri(rng, 2, 6), c = ri(rng, 2, 4);
  return tokProb('prop', 'Break apart to fill in the blank:', rng() < 0.5 ? [`${a} × ${b + c} = (${a} × ${b}) + (${a} × `, U(c), ')'] : [`${a} × ${b + c} = (${a} × `, U(b), `) + (${a} × ${c})`]);
}

/* Related facts: relate an operation to its inverse. L1 addition and subtraction, L2 multiplication and division, L3 mixes both. */
function nsxRel(rng, L) {
  const kind = L === 3 ? pick(rng, [1, 2]) : L;
  if (kind === 1) { const a = ri(rng, 2, 10), b = ri(rng, 1, 10), t = a + b; return tokProb('rel', 'Use the addition fact to subtract:', [`${a} + `, U(b), ` = ${t},`], { tok2: [`${t} − ${a} = `, U(b)], sigx: 'r1', ew: tokW([`${a} + `, U(b), ` = ${t},`]) + tokW([`${t} − ${a} = `, U(b)]) + 3 }); }
  const a = ri(rng, 2, 10), b = ri(rng, 2, 10), t = a * b;
  return tokProb('rel', 'Use the multiplication fact to divide:', [`${a} × `, U(b), ` = ${t},`], { tok2: [`${t} ÷ ${a} = `, U(b)], sigx: 'r2', ew: tokW([`${a} × `, U(b), ` = ${t},`]) + tokW([`${t} ÷ ${a} = `, U(b)]) + 3 });
}

/* subtract a multiple of 10 from a number 10 to 99. */
function nsxSub10(rng) {
  const a = ri(rng, 20, 99), b = 10 * ri(rng, 1, Math.floor(a / 10)); return tokProb('sub10', 'Subtract the tens:', [`${a} − ${b} = `, U(a - b)]);
}

/* one-digit number times a multiple of 10. */
function nsxMul10(rng) {
  const a = ri(rng, 2, 9), b = 10 * ri(rng, 1, 9); return tokProb('mul10', 'Multiply:', rng() < 0.5 ? [`${a} × ${b} = `, U(a * b)] : [`${b} × ${a} = `, U(a * b)]);
}

/* multiplicative comparison statements. */
function nsxMcomp(rng, L) {
  const mx = L === 1 ? 6 : 10, k = ri(rng, 2, mx), b = ri(rng, 2, mx), p = k * b;
  if (rng() < 0.5) return tokProb('mcomp', 'Complete the comparison:', [`${p} is `, U(k), ` times as many as ${b}.`], { sigx: 'a' });
  if (rng() < 0.5) return tokProb('mcomp', 'Complete the comparison:', [`${k} times as many as ${b} is `, U(p), '.'], { sigx: 'b' });
  return tokProb('mcomp', 'Write the multiplication equation:', [`${p} is ${k} times as many as ${b}.  `, `${k} × ${b} = `, U(p)], { sigx: 'c' });
}

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

const nsBondpHtml = (p, key, x) => `<svg xmlns="http://www.w3.org/2000/svg" width="${p.svgw / 100}in" height="${p.svgh / 100}in" viewBox="0 0 ${p.svgw} ${p.svgh}" role="img" aria-label="Counters" style="display:block">${p.svg}</svg><div>${tokHtml(p.tok, key, x)}</div>`;

/* subtraction strategies within 20. */
function nsxSubstr(rng, L) {
  const kind = pick(rng, L === 1 ? ['add', 'back'] : ['add', 'ten', 'back', 'ten']);
  let tok, sx;
  if (kind === 'add') { const a = ri(rng, 6, 18), b = ri(rng, 2, Math.min(9, a - 1)); tok = [`Think addition: ${b} + `, U(a - b), ` = ${a}, so ${a} − ${b} = `, U(a - b)]; sx = `${a}-${b}`; }
  else if (kind === 'ten') { const a = ri(rng, 11, 18), t = a - 10, b = ri(rng, t + 1, 9); tok = [`${a} − ${b}:  ${a} − ${t} = `, U(10), `, then 10 − ${b - t} = `, U(a - b)]; sx = `${a}-${b}`; }
  else { const a = ri(rng, 6, 20), b = ri(rng, 2, 3); tok = [`${a} − ${b}: ${a}, `]; for (let i = 1; i <= b; i++) tok.push(U(a - i), i < b ? ', ' : ''); tok.push(`. So ${a} − ${b} = `, U(a - b)); sx = `${a}-${b}`; }
  return { mod: 'ns', type: 'substr', prompt: kind === 'add' ? 'Use addition to subtract.' : kind === 'ten' ? 'Make a ten to subtract.' : 'Count back to subtract.', kind, tok, sig: `ss${kind}${sx}`, ew: tokW(tok) * (kind === 'back' ? 0.9 : 1.1) + 1, eh: 1.1 + 1.6 };
}

const nsSubstrHtml = (p, key, x) => tokHtml(p.tok, key, x);

const nsBondHtml = (p, key, x) => tokHtml(p.tok, key, x);

const nsEqnHtml = (p, key, x) => tokHtml(p.tok, key, x);

const nsSub10Html = (p, key, x) => tokHtml(p.tok, key, x);

const nsMul10Html = (p, key, x) => tokHtml(p.tok, key, x);

const nsMcompHtml = (p, key, x) => tokHtml(p.tok, key, x);

const nsPropHtml = (p, key, x) => tokHtml(p.tok, key, x);

const nsRelHtml = (p, key, x) => `${tokHtml(p.tok, key, x)}&ensp;${tokHtml(p.tok2, key, x)}`;

const nsEqualHtml = (p, key, x) => p.kind === 'tf' ? `${esc(p.eq)}&emsp;${opts(['true', 'false'], p.ans, key)}` : tokHtml(p.tok, key, x);

/* ---------- numerical expressions (grade 5): grouping symbols, order of operations, writing and interpreting expressions ---------- */

/* Evaluates an expression string of whole numbers with + − × ÷ and ( ) [ ] in the usual order.
   Returns NaN unless every division is exact and no subtraction goes below zero. */
function exEval(s) {
  const t = s.match(/\d+|[+−×÷()[\]]/g); let i = 0;
  const expr = () => { let v = term(); while (t[i] === '+' || t[i] === '−') { const o = t[i++], r = term(); v = o === '+' ? v + r : v - r; if (v < 0) return NaN; } return v; };
  const term = () => { let v = fac(); while (t[i] === '×' || t[i] === '÷') { const o = t[i++], r = fac(); if (o === '×') v *= r; else { if (!r || v % r) return NaN; v /= r; } } return v; };
  const fac = () => { const c = t[i++]; if (c === '(' || c === '[') { const v = expr(); i++; return v; } return Number(c); };
  const v = expr();
  return i === t.length ? v : NaN;
}

/* Evaluate an expression with parentheses and brackets. L1 one pair of parentheses, L2 parentheses with more operations, L3 brackets around parentheses. */
function nsxExEval(rng, L) {
  const T = L === 1 ? [(a, b, c) => `(${a} + ${b}) × ${c}`, (a, b, c) => `${a} × (${b} + ${c})`, (a, b, c) => `(${a} − ${b}) × ${c}`, (a, b, c) => `${a} − (${b} + ${c})`, (a, b, c) => `(${a} + ${b}) ÷ ${c}`, (a, b, c) => `${a} + ${b} × ${c}`]
    : L === 2 ? [(a, b, c, d) => `${a} + ${b} × (${c} − ${d})`, (a, b, c, d) => `(${a} + ${b}) × ${c} − ${d}`, (a, b, c, d) => `${a} × (${b} + ${c}) ÷ ${d}`, (a, b, c, d) => `(${a} − ${b}) × (${c} + ${d})`, (a, b, c, d) => `${a} + (${b} + ${c}) × ${d}`, (a, b, c, d) => `${a} × ${b} − (${c} + ${d})`]
      : [(a, b, c, d) => `${a} × [${b} + (${c} − ${d})]`, (a, b, c, d, e) => `[(${a} + ${b}) × ${c} − ${d}] ÷ ${e}`, (a, b, c, d) => `${a} + [${b} × (${c} + ${d})]`, (a, b, c, d) => `[${a} − (${b} + ${c})] × ${d}`, (a, b, c, d) => `[${a} × (${b} − ${c})] + ${d}`, (a, b, c, d) => `${a} × [(${b} + ${c}) ÷ ${d}]`];
  const mx = L === 1 ? 12 : L === 2 ? 15 : 20, f = pick(rng, T);
  let s, v = NaN, g = 0;
  do { s = f(ri(rng, 2, mx), ri(rng, 2, mx), ri(rng, 2, mx), ri(rng, 2, mx), ri(rng, 2, mx)); v = exEval(s); g++; } while ((!(v >= 1 && v <= 999) || Number.isNaN(v)) && g < 500);
  return { mod: 'ns', type: 'exeval', prompt: 'Evaluate:', expr: s, ans: cnum(v), sig: `xe${s}`, ew: (s.length + 3) * 0.62 + BW + 1, eh: 1.1 + 1.6 };
}

const nsExEvalHtml = (p, key, x) => `${esc(p.expr)} = ${x(p.ans, 3.6)}`;

/* Write an expression for words, and interpret an expression without calculating it. */
const EX_WRITE = [
  (a, b, c) => ({ w: `Add ${a} and ${b}, then multiply by ${c}.`, e: `${c} × (${a} + ${b})` }),
  (a, b, c) => ({ w: `Subtract ${b} from ${a}, then multiply by ${c}.`, e: `${c} × (${a} − ${b})` }),
  (a, b, c) => ({ w: `Add ${a} and ${b}, then divide by ${c}.`, e: `(${a} + ${b}) ÷ ${c}` }),
  (a, b, c) => ({ w: `Multiply ${a} by ${b}, then subtract ${c}.`, e: `${a} × ${b} − ${c}` }),
  (a, b, c) => ({ w: `Add ${c} to the product of ${a} and ${b}.`, e: `${a} × ${b} + ${c}` }),
  (a, b, c) => ({ w: `Subtract ${c} from the sum of ${a} and ${b}.`, e: `(${a} + ${b}) − ${c}` }),
  (a, b, c) => ({ w: `Multiply the sum of ${a} and ${b} by ${c}.`, e: `(${a} + ${b}) × ${c}` }),
  (a, b, c) => ({ w: `Divide the difference of ${a} and ${b} by ${c}.`, e: `(${a} − ${b}) ÷ ${c}` })
];

function nsxExWrite(rng, L) {
  const kind = pick(rng, L === 1 ? ['write', 'write', 'times'] : ['write', 'times', 'which']), big = L === 1 ? 9 : L === 2 ? 40 : 90;
  if (kind === 'write') {
    let r, g = 0;
    do { r = pick(rng, EX_WRITE)(ri(rng, 2, big), ri(rng, 2, big), ri(rng, 2, L === 1 ? 9 : 12)); g++; } while (Number.isNaN(exEval(r.e)) && g < 300);
    const eh = 1.1 + Math.ceil(r.w.length / 34) * 1.45 + 1.7 + 0.6;
    return { mod: 'ns', type: 'exwrite', prompt: 'Write an expression. Do not solve.', kind, text: r.w, ans: r.e, wide: true, sig: `xw${r.w}`, ew: 21, eh };
  }
  const A = L === 1 ? ri(rng, 12, 99) : L === 2 ? ri(rng, 120, 9999) : ri(rng, 1200, 99999), B = L === 1 ? ri(rng, 12, 99) : L === 2 ? ri(rng, 120, 999) : ri(rng, 120, 9999), sum = `(${cnum(A)} + ${cnum(B)})`;
  if (kind === 'times') {
    const k = ri(rng, 2, 9);
    return { mod: 'ns', type: 'exwrite', prompt: 'Do not calculate. Write the number.', kind, text: `${k} × ${sum} is ____ times as large as ${sum}.`, k, A, B, ans: String(k), wide: true, sig: `xt${k}${A}${B}`, ew: 21, eh: 1.1 + 1.45 * 2 + 1.7 + 0.6 };
  }
  let k1 = ri(rng, 2, 9), k2; do { k2 = ri(rng, 2, 9); } while (k2 === k1);
  const o = [`${k1} × ${sum}`, `${k2} × ${sum}`], ans = o[k1 > k2 ? 0 : 1];
  return { mod: 'ns', type: 'exwrite', prompt: 'Do not calculate. Circle the greater.', kind, text: 'Which is greater?', k1, k2, A, B, opts: o, ans, wide: true, sig: `xg${k1}${k2}${A}${B}`, ew: 21, eh: 1.1 + 1.45 + 1.45 * 2 + 0.6 };
}

const nsExWriteHtml = (p, key, x) => p.kind === 'write' ? `<div class="wt">${esc(p.text)}</div><div>Expression: <span class="blank" style="min-width:9em">${key ? esc(p.ans) : '&nbsp;'}</span></div>`
  : p.kind === 'times' ? `<div class="wt">${esc(p.text).replace('____', x(p.ans, 2.4))}</div>`
    : `<div>${p.text}</div><div>${opts(p.opts, p.ans, key)}</div>`;

/* Compare two sums without adding (2.OA.D.5). L1 swapped addends or one changed addend, L2 adds regrouped three-addend sums, L3 two-digit numbers. */
function nsxAddcmp(rng, L) {
  const assoc = L > 1 && rng() < 0.5, same = rng() < 0.45;
  const lo = assoc ? (L === 3 ? 10 : 2) : L === 1 ? 2 : 11, hi = assoc ? (L === 3 ? 30 : 9) : L === 1 ? 9 : L === 2 ? 29 : 49;
  const other = x => { let t; do { t = ri(rng, lo, hi); } while (t === x); return t; };
  const a = ri(rng, lo, hi), b = other(a);
  let e1, e2, v1, v2;
  if (assoc) {
    const c = ri(rng, lo, hi), c2 = same ? c : other(c);
    e1 = `(${a} + ${b}) + ${c}`; e2 = `${a} + (${b} + ${c2})`; v1 = a + b + c; v2 = a + b + c2;
  } else if (same) { e1 = `${a} + ${b}`; e2 = `${b} + ${a}`; v1 = v2 = a + b; }
  else {
    const keep = rng() < 0.5 ? a : b, gone = keep === a ? b : a, d = other(gone);
    e1 = `${a} + ${b}`; e2 = rng() < 0.5 ? `${keep} + ${d}` : `${d} + ${keep}`; v1 = a + b; v2 = keep + d;
  }
  const o = ['a) the same', `b) ${e1} is greater`, `c) ${e2} is greater`], ans = v1 === v2 ? o[0] : v1 > v2 ? o[1] : o[2];
  return { mod: 'ns', type: 'addcmp', prompt: 'Do not add. Circle the best answer.', text: `${e1} and ${e2}`, e1, e2, opts: o, ans, wide: true, sig: `ac${e1}|${e2}`, ew: 21, eh: 1.1 + 1.45 + 3 * 1.7 + 0.6 };
}

const nsAddcmpHtml = (p, key) => `<div class="wt">${p.text}</div>${p.opts.map(o => `<div>${opts([o], p.ans, key)}</div>`).join('')}`;

/* Test a claim (2.OA.D.5): swapping addends, adding 1 or 2, a row of the addition chart, odd and even sums. L1 single digits, L2 adds odd and even sums, L3 two-digit numbers. */
function nsxClaim(rng, L) {
  const nm = pick(rng, NS_NAMES), hi = L === 3 ? 49 : L === 2 ? 19 : 9;
  const evenN = () => 2 * ri(rng, 1, Math.floor(hi / 2)), oddN = () => 2 * ri(rng, 1, Math.floor((hi - 1) / 2)) + 1;
  const numOf = par => par === 'odd' ? oddN() : evenN();
  const kind = pick(rng, L === 1 ? ['comm', 'plus1', 'plus2', 'row'] : ['comm', 'plus1', 'plus2', 'row', 'oddodd', 'oddodd']);
  let text, ans, why;
  if (kind === 'comm') {
    const lo = L === 3 ? 11 : 2; let a, b; do { a = ri(rng, lo, hi); b = ri(rng, lo, hi); } while (a === b);
    text = `${nm} says ${a} + ${b} and ${b} + ${a} have the same sum.`; ans = 'yes'; why = `${a} + ${b} = ${a + b} and ${b} + ${a} = ${a + b}`;
  } else if (kind === 'plus1') {
    const e = evenN(), o = oddN(), P = pick(rng, ['odd', 'even']), t = rng() < 0.5 ? [e, o] : [o, e];
    text = `${nm} says adding 1 to a number always makes an ${P} number. Test it with ${t[0]} and ${t[1]}.`; ans = 'no'; why = `${e} + 1 = ${e + 1} (odd); ${o} + 1 = ${o + 1} (even)`;
  } else if (kind === 'plus2') {
    const P = pick(rng, ['odd', 'even']); let n1, n2; do { n1 = numOf(P); n2 = numOf(P); } while (n1 === n2);
    text = `${nm} says adding 2 to an ${P} number makes an ${P} number. Test it with ${n1} and ${n2}.`; ans = 'yes'; why = `${n1} + 2 = ${n1 + 2}; ${n2} + 2 = ${n2 + 2}`;
  } else if (kind === 'row') {
    const r = ri(rng, 1, Math.min(hi, 15)), step = rng() < 0.5 ? 1 : 2;
    text = `Part of a row in an addition chart is ${r}, ${r + 1}, ${r + 2}, ${r + 3}. ${nm} says each number is ${step} more than the number before it.`;
    ans = step === 1 ? 'yes' : 'no'; why = step === 1 ? `${r} + 1 = ${r + 1}; ${r + 1} + 1 = ${r + 2}` : `${r} + 2 = ${r + 2}, not ${r + 1}`;
  } else {
    const px = pick(rng, ['odd', 'even']), py = pick(rng, ['odd', 'even']), cl = pick(rng, ['odd', 'even']), a = numOf(px), b = numOf(py), act = (a + b) % 2 ? 'odd' : 'even';
    text = `${nm} says an ${px} number plus an ${py} number is an ${cl} number. Test it with ${a} + ${b}.`; ans = cl === act ? 'yes' : 'no'; why = `${a} + ${b} = ${a + b}, which is ${act}`;
  }
  return { mod: 'ns', type: 'claim', prompt: 'Is the claim right? Circle yes or no.', kind, text, ans, why, wide: true, sig: `cl${text}`, ew: 21, eh: nsWordEh(text) + 1.45 + (why.length > 30 ? 2.9 : 1.45) };
}

const nsClaimHtml = (p, key) => `<div class="wt">${esc(p.text)}</div><div>${opts(['yes', 'no'], p.ans, key)}</div><div>Show your test:</div><div><span class="blank" style="min-width:18em">${key ? esc(p.why) : '&nbsp;'}</span></div>`;

/* Odd and even after adding (2.OA.D.5). L1 a number and 1 or 2 more, L2 adds odd or even without the number, L3 odd or even sums of two-digit numbers. */
function nsxParsum(rng, L) {
  const A = pick(rng, NS_NAMES); let B; do { B = pick(rng, NS_NAMES); } while (B === A);
  const th = pick(rng, NS_THINGS), par = n => n % 2 ? 'odd' : 'even', d = ri(rng, 1, 2), more = rng() < 0.65;
  const kind = L === 1 ? 'num' : pick(rng, L === 2 ? ['num', 'given', 'given'] : ['given', 'sum', 'sum']), cmpw = `${d} ${more ? 'more' : 'fewer'} ${th} than ${A}`;
  let text, ans;
  if (kind === 'num') {
    const n = ri(rng, more ? 3 : d + 2, L === 1 ? 19 : 49);
    text = `${A} has ${n} ${th}. ${B} has ${cmpw}. Does ${B} have an odd or even number of ${th}?`; ans = par(more ? n + d : n - d);
  } else if (kind === 'given') {
    const P = pick(rng, ['odd', 'even']);
    text = `${A} has an ${P} number of ${th}. ${B} has ${cmpw}. Does ${B} have an odd or even number?`; ans = d === 1 ? (P === 'odd' ? 'even' : 'odd') : P;
  } else {
    const a = ri(rng, 11, 49), b = ri(rng, 11, 49);
    text = `Without adding, is ${a} + ${b} odd or even?`; ans = par(a + b);
  }
  return { mod: 'ns', type: 'parsum', prompt: 'Circle odd or even.', kind, text, ans, wide: true, sig: `pq${text}`, ew: 21, eh: nsWordEh(text) };
}

const nsParsumHtml = (p, key) => `<div class="wt">${esc(p.text)}</div><div>${opts(['odd', 'even'], p.ans, key)}</div>`;

defTypes("ns", "Equations, properties and facts", [
  { id: "bond", label: "Number bonds", blurb: "Decompose to 10, make ten, teen numbers as ten and ones.", on: false, gen: nsxBond, html: nsBondHtml },
  { id: "bondp", label: "Number bonds with pictures", blurb: "Two-color counters and ten-frames.", on: false, gen: nsxBondp, html: nsBondpHtml },
  { id: "eqn", label: "Unknown in an equation", blurb: "Find the missing number in any position.", on: false, gen: nsxEqn, html: nsEqnHtml },
  { id: "equal", label: "Equal sign", blurb: "True or false equations and balancing both sides.", on: false, gen: nsxEqual, html: nsEqualHtml },
  { id: "prop", label: "Properties of operations", blurb: "Commutative, associative and distributive.", on: false, gen: nsxProp, html: nsPropHtml },
  { id: "rel", label: "Related facts", blurb: "Subtraction as unknown addend, division as unknown factor.", on: false, gen: nsxRel, html: nsRelHtml },
  { id: "substr", label: "Subtraction strategies", blurb: "Think addition, make a ten, count back.", on: false, gen: nsxSubstr, html: nsSubstrHtml },
  { id: "sub10", label: "Subtract tens", blurb: "Subtract a multiple of 10 from a two-digit number.", on: false, gen: nsxSub10, html: nsSub10Html },
  { id: "mul10", label: "Multiply by multiples of 10", blurb: "One digit times 10 to 90.", on: false, gen: nsxMul10, html: nsMul10Html },
  { id: "mcomp", label: "Multiplicative comparison", blurb: "\"__ times as many as\" statements.", on: false, gen: nsxMcomp, html: nsMcompHtml },
  { id: "exeval", label: "Evaluate expressions", blurb: "Parentheses, brackets and the order of operations.", on: false, gen: nsxExEval, html: nsExEvalHtml },
  { id: "exwrite", label: "Write and interpret expressions", blurb: "Words to expressions, and times as large without calculating.", on: false, gen: nsxExWrite, html: nsExWriteHtml },
  { id: "addcmp", label: "Compare sums without adding", blurb: "Same or greater: swapped addends and regrouped sums.", on: false, gen: nsxAddcmp, html: nsAddcmpHtml },
  { id: "claim", label: "Test a claim about sums", blurb: "Decide if a claim about adding is right, and show a test.", on: false, gen: nsxClaim, html: nsClaimHtml },
  { id: "parsum", label: "Odd and even after adding", blurb: "Odd or even after adding 1, adding 2, or adding two numbers.", on: false, gen: nsxParsum, html: nsParsumHtml }
]);
