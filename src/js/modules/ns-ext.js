/* ---------- number sense extensions: unknown-number equations, properties, mental math, factors, perimeter, word problems ----------
   Included before ns.js; ns.js merges NGEN_EXT into NGEN. Each generator takes (rng, level) like the others in ns.js.
   Equation-style problems carry `tok`: an array of strings and { u: value } entries (the unknown parts), so cells and tests share one source. */
const U = v => ({ u: String(v) });
const tokVal = t => t.map(s => typeof s === 'object' ? s.u : s).join('');
const tokW = t => t.reduce((a, s) => a + (typeof s === 'object' ? Math.max(s.u.length * 0.62 + 1.2, 2.6) : String(s).length * 0.6), 0);
const tokHtml = (t, key, x) => t.map(s => typeof s === 'object' ? x(s.u, Math.max(s.u.length * 0.62 + 1.2, 2.6)) : esc(s)).join('');
const NS_NAMES = ['Ava', 'Ben', 'Cora', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana', 'Ivan', 'Jo', 'Kai', 'Lena', 'Max', 'Nia', 'Omar', 'Pia'];
const NS_THINGS = ['stickers', 'marbles', 'books', 'apples', 'pencils', 'cards', 'shells', 'stamps', 'beads', 'coins'];
const tokProb = (type, prompt, tok, extra) => Object.assign({ mod: 'ns', type, prompt, tok, sig: type + tokVal(tok) + (extra && extra.sigx || ''), ew: tokW(tok) + 1, eh: 1.1 + 1.6 }, extra);

/* K.OA.A.3, K.OA.A.4, K.NBT.A.1: number bonds. L1 decompose within 10, L2 make ten, L3 teen numbers as ten and some ones. */
function nsxBond(rng, L) {
  if (L === 1) { const n = ri(rng, 3, 10), a = ri(rng, 1, n - 1); return tokProb('bond', 'Write the missing number:', rng() < 0.5 ? [`${n} = ${a} + `, U(n - a)] : [`${a} + `, U(n - a), ` = ${n}`]); }
  if (L === 2) { const a = ri(rng, 1, 9); return tokProb('bond', 'What makes 10?', rng() < 0.5 ? [`${a} + `, U(10 - a), ' = 10'] : ['10 = ', U(10 - a), ` + ${a}`]); }
  const n = ri(rng, 11, 19); return tokProb('bond', 'Write the missing number:', rng() < 0.5 ? [`${n} = 10 + `, U(n - 10)] : ['10 + ', U(n - 10), ` = ${n}`]);
}

/* 1.OA.D.8, 3.OA.A.4: unknown in any position. L1 add/sub within 20, L2 within 100, L3 multiply and divide within 100. */
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

/* 1.OA.D.7: meaning of the equal sign. True or false, or find the number that balances. */
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

/* 1.OA.B.3 (L1 addition), 3.OA.B.5 (L2 multiplication, L3 distributive). */
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

/* 1.OA.B.4 (L1), 3.OA.B.6 (L2): relate an operation to its inverse. L3 mixes both. */
function nsxRel(rng, L) {
  const kind = L === 3 ? pick(rng, [1, 2]) : L;
  if (kind === 1) { const a = ri(rng, 2, 10), b = ri(rng, 1, 10), t = a + b; return tokProb('rel', 'Use the addition fact to subtract:', [`${a} + `, U(b), ` = ${t},`], { tok2: [`${t} − ${a} = `, U(b)], sigx: 'r1', ew: tokW([`${a} + `, U(b), ` = ${t},`]) + tokW([`${t} − ${a} = `, U(b)]) + 3 }); }
  const a = ri(rng, 2, 10), b = ri(rng, 2, 10), t = a * b;
  return tokProb('rel', 'Use the multiplication fact to divide:', [`${a} × `, U(b), ` = ${t},`], { tok2: [`${t} ÷ ${a} = `, U(b)], sigx: 'r2', ew: tokW([`${a} × `, U(b), ` = ${t},`]) + tokW([`${t} ÷ ${a} = `, U(b)]) + 3 });
}

/* 1.NBT.C.6 (L1), 2.NBT.B.8 (L2), L3 extends to thousands. */
function nsxMore(rng, L) {
  const amt = pick(rng, L === 1 ? [10] : L === 2 ? [10, 100] : [1, 10, 100, 1000]), more = rng() < 0.5;
  const lo = L === 1 ? 10 : L === 2 ? 100 : 1000, hi = L === 1 ? 99 : L === 2 ? 999 : 9999;
  const base = more ? ri(rng, lo, hi - amt) : ri(rng, lo + amt, hi), ans = more ? base + amt : base - amt;
  return { mod: 'ns', type: 'more', prompt: 'Think in your head. Write the number.', base, amt, more, ans: cnum(ans), sig: `mo${base}${amt}${more}`, ew: `${amt} more than ${cnum(base)} =`.length * 0.6 + BW + 1, eh: 1.1 + 1.6 };
}

/* 1.NBT.C.7: subtract a multiple of 10 from a number 10 to 99. */
function nsxSub10(rng) {
  const a = ri(rng, 20, 99), b = 10 * ri(rng, 1, Math.floor(a / 10)); return tokProb('sub10', 'Subtract the tens:', [`${a} − ${b} = `, U(a - b)]);
}
/* 3.NBT.A.3: one-digit number times a multiple of 10. */
function nsxMul10(rng) {
  const a = ri(rng, 2, 9), b = 10 * ri(rng, 1, 9); return tokProb('mul10', 'Multiply:', rng() < 0.5 ? [`${a} × ${b} = `, U(a * b)] : [`${b} × ${a} = `, U(a * b)]);
}

/* 1.NBT.B.3: tens and ones. L1 standard, L2 flexible regrouping, L3 mixes both. */
function nsxTens(rng, L) {
  const kind = L === 3 ? pick(rng, [1, 2]) : L, n = ri(rng, 11, 99);
  if (kind === 1) {
    const t = Math.floor(n / 10), o = n % 10;
    return tokProb('tens', 'Write the tens and ones:', rng() < 0.55 ? [`${n} = `, U(t), ' tens ', U(o), ' ones'] : [`${t} tens ${o} ones = `, U(n)]);
  }
  const t = ri(rng, 0, Math.floor(n / 10) - 1);
  return tokProb('tens', 'Write the missing ones:', [`${n} = ${t} tens and `, U(n - 10 * t), ' ones']);
}

/* K.CC.A.2 (L1 count on from any number), L2 count back from 20, 1.NBT.A.1 (L3 by ones, twos or fives to 120). */
function nsxCount(rng, L) {
  let step = 1, start, prompt = 'Count on. Fill in the missing numbers:';
  if (L === 1) start = ri(rng, 1, 94);
  else if (L === 2) { step = -1; start = ri(rng, 12, 20); prompt = 'Count back. Fill in the missing numbers:'; }
  else { step = pick(rng, [1, 2, 5]); start = step * ri(rng, 0, Math.floor((120 - 5 * step) / step)); }
  const vals = Array.from({ length: 6 }, (_, i) => start + i * step), terms = vals.map(String), idx = shuffle(rng, [1, 2, 3, 4, 5]).slice(0, 2).sort((a, b) => a - b);
  return { mod: 'ns', type: 'cfwd', prompt, terms, idx, step, sig: `cf${terms}${idx}`, ew: terms.reduce((a, s, i) => a + Math.max(s.length * 0.62 + 0.9, idx.includes(i) ? 3.0 : 0), 0) + 1, eh: 1.1 + 1.6 };
}

/* 4.OA.A.1: multiplicative comparison statements. */
function nsxMcomp(rng, L) {
  const mx = L === 1 ? 6 : 10, k = ri(rng, 2, mx), b = ri(rng, 2, mx), p = k * b;
  if (rng() < 0.5) return tokProb('mcomp', 'Complete the comparison:', [`${p} is `, U(k), ` times as many as ${b}.`], { sigx: 'a' });
  if (rng() < 0.5) return tokProb('mcomp', 'Complete the comparison:', [`${k} times as many as ${b} is `, U(p), '.'], { sigx: 'b' });
  return tokProb('mcomp', 'Write the multiplication equation:', [`${p} is ${k} times as many as ${b}.  `, `${k} × ${b} = `, U(p)], { sigx: 'c' });
}

/* 4.NF.C.5: denominators 10 and 100. L1 rename tenths as hundredths, L2 add tenths and hundredths, L3 both. */
function nsxF100(rng, L) {
  const kind = L === 3 ? pick(rng, [1, 2]) : L;
  if (kind === 1) { const a = ri(rng, 1, 9); return { mod: 'ns', type: 'f100', prompt: 'Write an equivalent fraction:', kind: 1, a, ans: String(a * 10), sig: `f1${a}`, ew: 11, eh: 1.1 + 2.6 }; }
  const a = ri(rng, 1, 9), b = ri(rng, 1, Math.min(40, 99 - a * 10));
  return { mod: 'ns', type: 'f100', prompt: 'Add. Write the sum with denominator 100:', kind: 2, a, b, ans: String(a * 10 + b), sig: `f2${a}.${b}`, ew: 15, eh: 1.1 + 2.6 };
}

/* 4.OA.B.4: factors, multiples, primes. */
const NS_PRIMES = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]);
function nsxFact(rng, L) {
  const mx = L === 1 ? 50 : 100, kind = pick(rng, ['isf', 'mult', 'prime', 'pairs']);
  if (kind === 'pairs') {
    let n, f; let g = 0;
    do { n = ri(rng, 12, L === 1 ? 36 : 100); f = []; for (let i = 1; i * i <= n; i++) if (n % i === 0) f.push(i); } while (g++ < 200 && f.length < 3);
    const tok = [`1 × ${n},  `, `${f[1]} × `, U(n / f[1]), ',  ', `${f[2]} × `, U(n / f[2])];
    return tokProb('fact', `Complete the factor pairs for ${n}:`, tok, { kind: 'pairs', n, sigx: 'p' });
  }
  if (kind === 'prime') {
    const n = ri(rng, 2, mx), pr = NS_PRIMES.has(n);
    return { mod: 'ns', type: 'fact', prompt: 'Circle prime or composite:', kind: 'prime', n, ans: pr ? 'prime' : 'composite', sig: `fp${n}`, ew: 15, eh: 1.1 + 1.8 };
  }
  const d = ri(rng, 2, 9), n = rng() < 0.5 ? d * ri(rng, 2, Math.floor(mx / d)) : ri(rng, 12, mx);
  const yes = kind === 'isf' ? n % d === 0 : n % d === 0;
  return { mod: 'ns', type: 'fact', prompt: kind === 'isf' ? `Is ${d} a factor of ${n}?` : `Is ${n} a multiple of ${d}?`, kind, n, d, ans: yes ? 'yes' : 'no', sig: `f${kind}${n}.${d}`, ew: 15, eh: 1.1 + 1.8 };
}

/* 3.MD.D.8: rectangles with the same perimeter and different areas (samep), or the same area and different perimeters (samea). */
function nsxPerimSame(rng, u) {
  const unit = u;
  if (rng() < 0.5) {
    const l = ri(rng, 4, 12), w = ri(rng, 2, l - 1), w2 = ri(rng, 1, l + w - 1), l2 = l + w - w2;
    if (w2 === w || w2 === l) return nsxPerimSame(rng, unit);
    return { mod: 'ns', type: 'perim', prompt: 'Same perimeter, different area.', kind: 'samep', l, w, w2, unit, eq: `${l} + ${w} − ${w2}`, ans: String(l2),
      text: `Rectangle A is ${l} ${unit} long and ${w} ${unit} wide. Rectangle B has the same perimeter as A and is ${w2} ${unit} wide. How long is Rectangle B?`, wide: true, sig: `ps2${l}.${w}.${w2}${unit}`, ew: 21, eh: 1.1 + 4 * 1.45 + 1.7 + 0.6 };
  }
  const area = pick(rng, [12, 16, 18, 20, 24, 30, 36, 48]), f = [];
  for (let i = 1; i * i <= area; i++) if (area % i === 0) f.push([area / i, i]);
  const sh = shuffle(rng, f), [l1, w1] = sh[0], [l2, w2] = sh[1], P1 = 2 * (l1 + w1), P2 = 2 * (l2 + w2);
  return { mod: 'ns', type: 'perim', prompt: 'Same area, different perimeter.', kind: 'samea', l1, w1, l2, w2, unit: '', eq: `A: 2 × (${l1} + ${w1}) = ${P1}; B: 2 × (${l2} + ${w2}) = ${P2}`, ans: P1 > P2 ? 'A' : 'B',
    text: `Rectangle A is ${l1} ${unit} by ${w1} ${unit}. Rectangle B is ${l2} ${unit} by ${w2} ${unit}. Both have an area of ${area} square ${u}. Which rectangle has the greater perimeter? Write A or B.`, wide: true, sig: `pa2${l1}.${w1}.${l2}.${w2}${unit}`, ew: 21, eh: 1.1 + 5 * 1.45 + 1.7 + 0.6 };
}
/* 3.MD.D.8 perimeter, L1 from side lengths, L2 unknown side, L3 polygons and same-perimeter or same-area comparisons. */
function nsxPerim(rng, L) {
  if (L === 3 && rng() < 0.4) L = pick(rng, [1, 2]);
  const unit = pick(rng, ['cm', 'm', 'in', 'ft']);
  if (L === 1) {
    if (rng() < 0.7) { const l = ri(rng, 3, 15), w = ri(rng, 2, l - 1 || 2); return { mod: 'ns', type: 'perim', prompt: 'Find the perimeter.', kind: 'rect', l, w, unit, eq: `2 × (${l} + ${w})`, ans: String(2 * (l + w)), text: `A rectangle is ${l} ${unit} long and ${w} ${unit} wide. What is its perimeter?`, wide: true, sig: `pr${l}.${w}${unit}`, ew: 21, eh: 1.1 + 2 * 1.45 + 1.7 + 0.6 }; }
    const s = ri(rng, 3, 14); return { mod: 'ns', type: 'perim', prompt: 'Find the perimeter.', kind: 'square', s, unit, eq: `4 × ${s}`, ans: String(4 * s), text: `A square has sides of ${s} ${unit}. What is its perimeter?`, wide: true, sig: `ps${s}${unit}`, ew: 21, eh: 1.1 + 2 * 1.45 + 1.7 + 0.6 };
  }
  if (L === 2) {
    const l = ri(rng, 4, 15), w = ri(rng, 2, l - 1), P = 2 * (l + w);
    return { mod: 'ns', type: 'perim', prompt: 'Find the unknown side.', kind: 'rectu', P, l, w, unit, eq: `(${P} − 2 × ${l}) ÷ 2`, ans: String(w), text: `A rectangle has a perimeter of ${P} ${unit} and a length of ${l} ${unit}. What is its width?`, wide: true, sig: `pu${P}.${l}${unit}`, ew: 21, eh: 1.1 + 3 * 1.45 + 1.7 + 0.6 };
  }
  if (rng() < 0.4) return nsxPerimSame(rng, unit);
  const n = pick(rng, [3, 5, 6]), name = { 3: 'triangle', 5: 'pentagon', 6: 'hexagon' }[n], sides = Array.from({ length: n - 1 }, () => ri(rng, 3, 12)), x = ri(rng, 3, 12), P = sides.reduce((a, b) => a + b, x);
  if (rng() < 0.5) { const all = sides.concat(x); return { mod: 'ns', type: 'perim', prompt: 'Find the perimeter.', kind: 'poly', sides: all, unit, eq: all.join(' + '), ans: String(P), text: `The sides of a ${name} are ${all.join(', ')} ${unit}. What is its perimeter?`, wide: true, sig: `pp${all}${unit}`, ew: 21, eh: 1.1 + 3 * 1.45 + 1.7 + 0.6 }; }
  return { mod: 'ns', type: 'perim', prompt: 'Find the unknown side.', kind: 'polyu', sides, P, unit, eq: `${P} − (${sides.join(' + ')})`, ans: String(x), text: `A ${name} has a perimeter of ${P} ${unit}. Its known sides are ${sides.join(', ')} ${unit}. What is the length of the last side?`, wide: true, sig: `pq${sides}.${P}${unit}`, ew: 21, eh: 1.1 + 4 * 1.45 + 1.7 + 0.6 };
}

/* Word problems.
   wadd (1.OA.A.1, 2.OA.A.1), wlen (2.MD.B.5): add to / take from / put together / compare, unknown in any position. L1 within 20, L2 within 100 with two-step, L3 within 1000.
   wmul (3.OA.A.3, 3.OA.D.8, 4.OA.A.2, 4.OA.A.3): equal groups, arrays, measurement; L1 one-step within 100, L2 two-step, L3 comparison and multi-step. */
const wordProb = (type, kind, nums, text, eq, ans, unit, extra) => Object.assign({ mod: 'ns', type, prompt: 'Read and solve.', kind, nums, text, eq: type === 'wadd' || type === 'wlen' ? eq.replace(/\?/g, '□') : eq, ans: String(ans), unit, wide: true,
  draw: type === 'wadd' || type === 'wlen',   // 1.OA.A.1, 2.OA.A.1, 2.MD.B.5: room to draw, and a box for the unknown
  sig: type + kind + nums.join('.') + text.length, ew: 21, eh: 1.1 + Math.ceil(text.length / 36) * 1.45 + 1.6 + 1.7 + 0.6 + (type === 'wadd' || type === 'wlen' ? 3.4 : 0) }, extra || {});
function nsxWadd(rng, L) {
  const sym = L === 3 ? 'n' : '□', mx = L === 1 ? 20 : L === 2 ? 99 : 999, lo = L === 1 ? 2 : L === 2 ? 11 : 101;
  const nm = pick(rng, NS_NAMES), nm2 = pick(rng, NS_NAMES.filter(x => x !== nm)), th = pick(rng, NS_THINGS);
  const kinds = L === 1 ? ['addR', 'addC', 'addS', 'subR', 'subC', 'subS', 'put', 'apart', 'cmpD', 'cmpB'] : ['addR', 'addC', 'addS', 'subR', 'subC', 'subS', 'put', 'apart', 'cmpD', 'cmpB', 'two', 'two'];
  const kind = pick(rng, kinds), sum = () => { const c = ri(rng, lo + 1, mx), a = ri(rng, Math.min(lo, c - 1), c - 1); return [a, c - a, c]; };
  const [a, b, c] = sum();
  switch (kind) {
    case 'addR': return wordProb('wadd', kind, [a, b, c], `${nm} had ${a} ${th}. Then ${nm} got ${b} more. How many ${th} does ${nm} have now?`, `${a} + ${b} = ${sym}`, c, th);
    case 'addC': return wordProb('wadd', kind, [a, b, c], `${nm} had ${a} ${th}. Then ${nm} got some more. Now ${nm} has ${c} ${th}. How many did ${nm} get?`, `${a} + ${sym} = ${c}`, b, th);
    case 'addS': return wordProb('wadd', kind, [a, b, c], `${nm} had some ${th}. Then ${nm} got ${b} more. Now ${nm} has ${c} ${th}. How many did ${nm} have at first?`, `${sym} + ${b} = ${c}`, a, th);
    case 'subR': return wordProb('wadd', kind, [c, b, a], `${nm} had ${c} ${th}. ${nm} gave ${b} to ${nm2}. How many ${th} does ${nm} have left?`, `${c} − ${b} = ${sym}`, a, th);
    case 'subC': return wordProb('wadd', kind, [c, b, a], `${nm} had ${c} ${th}. ${nm} gave some to ${nm2}. Now ${nm} has ${a} ${th}. How many did ${nm} give away?`, `${c} − ${sym} = ${a}`, b, th);
    case 'subS': return wordProb('wadd', kind, [c, b, a], `${nm} had some ${th}. ${nm} gave ${b} to ${nm2}. Now ${nm} has ${a} left. How many did ${nm} have at first?`, `${sym} − ${b} = ${a}`, c, th);
    case 'put': return wordProb('wadd', kind, [a, b, c], `${nm} has ${a} red ${th} and ${b} blue ${th}. How many ${th} does ${nm} have in all?`, `${a} + ${b} = ${sym}`, c, th);
    case 'apart': return wordProb('wadd', kind, [a, b, c], `${nm} has ${c} ${th}. ${a} of them are red and the rest are blue. How many are blue?`, `${a} + ${sym} = ${c}`, b, th);
    case 'cmpD': return wordProb('wadd', kind, [c, a, b], `${nm} has ${c} ${th}. ${nm2} has ${a} ${th}. How many more ${th} does ${nm} have than ${nm2}?`, `${c} − ${a} = ${sym}`, b, th);
    case 'cmpB': return wordProb('wadd', kind, [a, b, c], `${nm} has ${a} ${th}. ${nm2} has ${b} more ${th} than ${nm}. How many ${th} does ${nm2} have?`, `${a} + ${b} = ${sym}`, c, th);
    default: {
      const a2 = ri(rng, lo, mx - 1), b2 = ri(rng, 1, Math.min(a2 - 1, mx - a2)), c2 = ri(rng, 1, mx - a2 + b2 > 1 ? Math.min(mx - a2 + b2, 40) : 1), res = a2 - b2 + c2;
      return wordProb('wadd', 'two', [a2, b2, c2], `${nm} had ${a2} ${th}. ${nm} gave ${b2} to ${nm2}, then found ${c2} more. How many ${th} does ${nm} have now?`, `${a2} − ${b2} + ${c2} = ${sym}`, res, th);
    }
  }
}
/* 2.MD.B.5: add and subtract lengths within 100, unknown in any position. */
function nsxWlen(rng) {
  const unit = pick(rng, ['inches', 'feet', 'centimeters', 'meters']), nm = pick(rng, NS_NAMES), c = ri(rng, 12, 99), a = ri(rng, 5, c - 4), b = c - a, kind = pick(rng, ['tot', 'diff', 'left', 'grew', 'start']);
  switch (kind) {
    case 'tot': return wordProb('wlen', kind, [a, b, c], `${nm} has one ribbon that is ${a} ${unit} long and another that is ${b} ${unit} long. How long are the two ribbons together?`, `${a} + ${b} = ?`, c, unit);
    case 'diff': return wordProb('wlen', kind, [c, a, b], `A rope is ${c} ${unit} long. A shorter rope is ${a} ${unit} long. How much longer is the first rope?`, `${c} − ${a} = ?`, b, unit);
    case 'left': return wordProb('wlen', kind, [c, a, b], `A board is ${c} ${unit} long. ${nm} cuts off ${a} ${unit}. How long is the piece that is left?`, `${c} − ${a} = ?`, b, unit);
    case 'grew': return wordProb('wlen', kind, [a, b, c], `A plant was ${a} ${unit} tall. It grew some more and is now ${c} ${unit} tall. How much did it grow?`, `${a} + ? = ${c}`, b, unit);
    default: return wordProb('wlen', kind, [a, b, c], `${nm} cut ${b} ${unit} off a string. The string that is left is ${a} ${unit} long. How long was the string at first?`, `? − ${b} = ${a}`, c, unit);
  }
}
/* 3.OA.A.3 (L1, L2 one-step), 3.OA.D.8 (L3 two-step): equal groups, arrays, measurement, area. */
function nsxWmul(rng, L) {
  const sym = L === 1 ? '?' : 'n', nm = pick(rng, NS_NAMES), th = pick(rng, NS_THINGS), nm2 = pick(rng, NS_NAMES.filter(x => x !== nm));
  const g = ri(rng, 2, 9), k = ri(rng, 2, Math.min(9, Math.floor(99 / g))), t = g * k;
  const kind = pick(rng, L === 3 ? ['two1', 'two2', 'two3'] : ['prod', 'size', 'count', 'array', 'meas', 'areaP', 'areaW']);
  switch (kind) {
    case 'prod': return wordProb('wmul', kind, [g, k, t], `${nm} has ${g} bags. Each bag has ${k} ${th}. How many ${th} does ${nm} have in all?`, `${g} × ${k} = ${sym}`, t, th);
    case 'size': return wordProb('wmul', kind, [t, g, k], `${nm} shares ${t} ${th} equally among ${g} friends. How many ${th} does each friend get?`, `${t} ÷ ${g} = ${sym}`, k, th);
    case 'count': return wordProb('wmul', kind, [t, k, g], `${nm} has ${t} ${th}. ${nm} puts ${k} ${th} in each box. How many boxes does ${nm} fill?`, `${sym} × ${k} = ${t}`, g, 'boxes');
    case 'array': return wordProb('wmul', kind, [g, k, t], `A garden has ${g} rows of plants with ${k} plants in each row. How many plants are in the garden?`, `${g} × ${k} = ${sym}`, t, 'plants');
    case 'meas': return wordProb('wmul', kind, [t, k, g], `A rope is ${t} feet long. ${nm} cuts it into pieces that are ${k} feet long. How many pieces are there?`, `${t} ÷ ${k} = ${sym}`, g, 'pieces');
    case 'areaP': { const u = pick(rng, ['feet', 'meters', 'inches', 'centimeters']); return wordProb('wmul', kind, [g, k, t], `A rectangle is ${g} ${u} long and ${k} ${u} wide. What is its area in square ${u}?`, `${g} × ${k} = ${sym}`, t, `square ${u}`); }
    case 'areaW': { const u = pick(rng, ['feet', 'meters', 'inches', 'centimeters']); return wordProb('wmul', kind, [g, k, t], `A rectangle has an area of ${t} square ${u}. It is ${g} ${u} long. How wide is it?`, `${g} × ${sym} = ${t}`, k, u); }
    case 'two1': { const x = ri(rng, 2, Math.floor(80 / g)); return wordProb('wmul', kind, [g, k, x], `${nm} buys ${g} packs of ${th} with ${k} in each pack, and ${x} more ${th} alone. How many ${th} does ${nm} buy in all?`, `(${g} × ${k}) + ${x} = ${sym}`, g * k + x, th); }
    case 'two2': { const take = ri(rng, 1, t - 1); return wordProb('wmul', kind, [g, k, take], `${nm} has ${g} boxes with ${k} ${th} in each box. ${nm} gives away ${take} ${th}. How many ${th} are left?`, `(${g} × ${k}) − ${take} = ${sym}`, t - take, th); }
    default: { const s2 = ri(rng, 2, 5), x = s2 * ri(rng, 2, 9), y = s2 * ri(rng, 1, 9); return wordProb('wmul', 'two3', [x, y, s2], `${nm} has ${x} ${th} and ${nm2} has ${y} ${th}. They put all of them into ${s2} equal groups. How many ${th} are in each group?`, `(${x} + ${y}) ÷ ${s2} = ${sym}`, (x + y) / s2, th); }
  }
}
/* 4.OA.A.2: multiplicative comparison, and telling it apart from additive comparison. */
function nsxWcmp(rng) {
  const nm = pick(rng, NS_NAMES), nm2 = pick(rng, NS_NAMES.filter(x => x !== nm)), th = pick(rng, NS_THINGS), a = ri(rng, 3, 12), m = ri(rng, 2, 9), kind = pick(rng, ['mcmp', 'mcmpU', 'mcmpK', 'addvm']);
  switch (kind) {
    case 'mcmp': return wordProb('wcmp', kind, [a, m, a * m], `${nm} has ${a} ${th}. ${nm2} has ${m} times as many ${th} as ${nm}. How many ${th} does ${nm2} have?`, `${a} × ${m} = n`, a * m, th);
    case 'mcmpU': return wordProb('wcmp', kind, [a, m, a * m], `${nm2} has ${a * m} ${th}. That is ${m} times as many as ${nm} has. How many ${th} does ${nm} have?`, `${a * m} ÷ ${m} = n`, a, th);
    case 'mcmpK': return wordProb('wcmp', kind, [a, m, a * m], `${nm} has ${a} ${th}. ${nm2} has ${a * m} ${th}. How many times as many ${th} does ${nm2} have as ${nm}?`, `${a * m} ÷ ${a} = n`, m, 'times');
    default: return wordProb('wcmp', kind, [a, m, a * m - a], `A pen costs $${a}. A marker costs ${m} times as much as the pen. How many more dollars does the marker cost than the pen?`, `(${a} × ${m}) − ${a} = n`, a * m - a, 'dollars');
  }
}
/* 4.OA.A.3: multi-step problems, including remainders that must be interpreted. */
function nsxWstep(rng) {
  const nm = pick(rng, NS_NAMES), nm2 = pick(rng, NS_NAMES.filter(x => x !== nm)), th = pick(rng, NS_THINGS), kind = pick(rng, ['rem', 'ceil', 'multi', 'multi2']);
  const d = ri(rng, 3, 9), q = ri(rng, 4, 12), r = ri(rng, 1, d - 1), n = d * q + r;
  switch (kind) {
    case 'rem': return wordProb('wstep', kind, [n, d, q, r], `${nm} has ${n} ${th} and puts ${d} in each box. How many full boxes does ${nm} make?`, `${n} ÷ ${d} = ${q} R ${r}, so n = ${q}`, q, 'boxes', { noeval: true });
    case 'ceil': return wordProb('wstep', kind, [n, d, q + 1, r], `A van holds ${d} students. ${n} students need a ride. How many vans are needed?`, `${n} ÷ ${d} = ${q} R ${r}, so n = ${q + 1}`, q + 1, 'vans', { noeval: true });
    case 'multi2': { const g = ri(rng, 3, 9), p = ri(rng, 12, 45), x = ri(rng, 20, 99); return wordProb('wstep', kind, [g, p, x], `${nm} buys ${g} shirts for $${p} each and a hat for $${x}. How many dollars does ${nm} spend in all?`, `(${g} × ${p}) + ${x} = n`, g * p + x, 'dollars'); }
    default: { const a = ri(rng, 12, 60), b = ri(rng, 2, 9), c = ri(rng, 2, 9), e = ri(rng, 10, a + b * c - 1); return wordProb('wstep', 'multi', [a, b, c, e], `${nm} has ${a} ${th}. ${nm2} gives ${nm} ${b} bags with ${c} ${th} in each bag. Then ${nm} gives away ${e} ${th}. How many ${th} does ${nm} have now?`, `${a} + (${b} × ${c}) − ${e} = n`, a + b * c - e, th); }
  }
}

/* 3.OA.D.8: estimate by rounding to the nearest ten, then solve a two-step problem and compare. */
const rnd10 = v => Math.round(v / 10) * 10;
function nsxWest(rng) {
  const nm = pick(rng, NS_NAMES), nm2 = pick(rng, NS_NAMES.filter(x => x !== nm)), th = pick(rng, NS_THINGS);
  let p;
  if (rng() < 0.5) {
    const a = ri(rng, 21, 99), b = ri(rng, 21, 99), c = ri(rng, 11, a + b - 20), est = rnd10(a) + rnd10(b) - rnd10(c);
    p = wordProb('west', 'eadd', [a, b, c], `${nm} had ${a} ${th}. ${nm} got ${b} more. Then ${nm} gave ${c} to ${nm2}. How many ${th} does ${nm} have now?`, `${a} + ${b} − ${c} = n`, a + b - c, th, { est: String(est) });
  } else {
    const g = ri(rng, 2, 9), k = ri(rng, 12, 49), x = ri(rng, 11, 99), est = g * rnd10(k) + rnd10(x);
    p = wordProb('west', 'emul', [g, k, x], `${nm} buys ${g} boxes with ${k} ${th} in each box. ${nm} also has ${x} ${th} already. How many ${th} does ${nm} have in all?`, `(${g} × ${k}) + ${x} = n`, g * k + x, th, { est: String(est) });
  }
  p.prompt = 'Estimate, then solve. Is your answer reasonable?'; p.eh += 1.7; p.sig += 'E';
  return p;
}

/* 3.NBT.A.1: round to the nearest 10 (L1) or 100 (L2) with a number line; L3 mixes both and plain problems. */
function nsxRnd3(rng, L) {
  const unit = L === 1 ? 10 : L === 2 ? 100 : pick(rng, [10, 100]), name = unit === 10 ? 'ten' : 'hundred';
  if (L === 3 && rng() < 0.5) {
    let n = unit === 10 ? ri(rng, 11, 999) : ri(rng, 101, 999); if (n % unit === 0) n++;
    return { mod: 'ns', type: 'rnd3', prompt: `Round to the nearest ${name}:`, kind: 'plain', unit, n, shown: cnum(n), ans: cnum(rndTo(n, unit)), sig: `r3p${n}${unit}`, ew: 13, eh: 1.1 + 1.6 };
  }
  const lo = unit * (unit === 10 ? ri(rng, 1, 99) : ri(rng, 1, 9)), k = ri(rng, 1, 9), n = lo + k * unit / 10;
  return { mod: 'ns', type: 'rnd3', prompt: `Use the number line to round ${cnum(n)} to the nearest ${name}:`, kind: 'line', unit, n, lo, k, svg: lineSvg(lo * 100, (lo + unit) * 100, 10, k), shown: cnum(n), ans: cnum(rndTo(n, unit)),
    sig: `r3l${n}${unit}`, win: 2.75, hin: 0.72 + 0.45, hfs: 3.2, ew: 14, eh: 1 };
}

const NS_EXT_TYPES = ['bond', 'eqn', 'equal', 'prop', 'rel', 'more', 'sub10', 'mul10', 'tens', 'cfwd', 'mcomp', 'f100', 'fact', 'perim', 'wadd', 'wlen', 'wmul', 'wcmp', 'wstep', 'west', 'rnd3'];
const NGEN_EXT = { bond: nsxBond, eqn: nsxEqn, equal: nsxEqual, prop: nsxProp, rel: nsxRel, more: nsxMore, sub10: nsxSub10, mul10: nsxMul10, tens: nsxTens, cfwd: nsxCount, mcomp: nsxMcomp, f100: nsxF100, fact: nsxFact, perim: nsxPerim, wadd: nsxWadd, wlen: nsxWlen, wmul: nsxWmul, wcmp: nsxWcmp, wstep: nsxWstep, west: nsxWest, rnd3: nsxRnd3 };

/* Cell bodies for the new types (called from modHtml). */
const wordCell = (p, key, x) => `<div class="wt">${esc(p.text)}</div>${p.draw ? '<div class="dbox"></div>' : ''}${p.est !== undefined ? `<div>Estimate (nearest ten): ${x(p.est, 3.6)}</div>` : ''}<div>Equation: <span class="blank" style="min-width:9em">${key ? esc(p.eq) : '&nbsp;'}</span></div><div>Answer: ${x(p.ans, 3.6)}${p.unit ? ' ' + esc(p.unit) : ''}</div>`;
const opts = (a, ans, key) => a.map(o => `<span class="opt${key && ans === o ? ' on' : ''}">${o}</span>`).join('');
function nsxHtml(p, key, x) {
  if (NSK_HTML[p.type]) return NSK_HTML[p.type](p, key, x);
  switch (p.type) {
    case 'bond': case 'eqn': case 'sub10': case 'mul10': case 'tens': case 'mcomp': case 'prop': return tokHtml(p.tok, key, x);
    case 'rel': return `${tokHtml(p.tok, key, x)}&ensp;${tokHtml(p.tok2, key, x)}`;
    case 'equal': return p.kind === 'tf' ? `${esc(p.eq)}&emsp;${opts(['true', 'false'], p.ans, key)}` : tokHtml(p.tok, key, x);
    case 'more': return `${p.amt} ${p.more ? 'more' : 'less'} than ${cnum(p.base)} = ${x(p.ans, BW)}`;
    case 'cfwd': case 'kseq': case 'cseq': return p.terms.map((t, i) => p.idx.includes(i) ? `<span class="blank" style="min-width:${(t.length * 0.62 + 1).toFixed(1)}em">${key ? esc(t) : '&nbsp;'}</span>` : esc(t)).join(',&ensp;');
    case 'f100': return p.kind === 1 ? `${frH(p.a, 10)} = ${frBox(p.ans, 100, 'n', key)}` : `${frH(p.a, 10)} + ${frH(p.b, 100)} = ${frBox(p.ans, 100, 'n', key)}`;
    case 'fact': return p.kind === 'pairs' ? tokHtml(p.tok, key, x) : p.kind === 'prime' ? `${p.n}&emsp;${opts(['prime', 'composite'], p.ans, key)}` : opts(['yes', 'no'], p.ans, key);
    case 'rnd3': return p.kind === 'line' ? `${p.svg}<div>${p.shown} ≈ ${x(p.ans, 3.2)}</div>` : `${p.shown} ≈ ${x(p.ans, 3.2)}`;
    default: return wordCell(p, key, x);
  }
}
