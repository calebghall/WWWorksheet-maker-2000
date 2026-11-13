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
  { id: "mcomp", label: "Multiplicative comparison", blurb: "\"__ times as many as\" statements.", on: false, gen: nsxMcomp, html: nsMcompHtml }
]);
