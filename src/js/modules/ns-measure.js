/* ---------- Number Sense: perimeter ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

/* rectangles with the same perimeter and different areas (samep), or the same area and different perimeters (samea). */
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

/* perimeter, L1 from side lengths, L2 unknown side, L3 polygons and same-perimeter or same-area comparisons. */
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

const nsPerimHtml = (p, key, x) => wordCell(p, key, x);

/* Convert a larger unit to a smaller one in the same system: length, mass, liquid volume and time.
   L1 small tables, L2 every pair, L3 also mixed units such as 3 m 25 cm. */
const NS_CONV = [['km', 'm', 1000], ['m', 'cm', 100], ['kg', 'g', 1000], ['L', 'mL', 1000], ['yd', 'ft', 3], ['ft', 'in', 12], ['lb', 'oz', 16],
  ['gal', 'qt', 4], ['qt', 'pt', 2], ['pt', 'c', 2], ['hr', 'min', 60], ['min', 's', 60]];

function nsxConvM(rng, L) {
  const pool = L === 1 ? NS_CONV.filter(r => ['m', 'yd', 'ft', 'lb', 'gal', 'qt', 'pt'].includes(r[0])) : NS_CONV, [big, small, f] = pick(rng, pool);
  if (L === 3 && rng() < 0.5 && f >= 10) {
    const a = ri(rng, 2, 9), b = f === 1000 ? 50 * ri(rng, 1, 19) : ri(rng, 1, f - 1), ans = a * f + b;
    return { mod: 'ns', type: 'convm', prompt: 'Write the total in the smaller unit:', kind: 'mix', a, b, big, small, ans: cnum(ans), sig: `cvm${a}${big}${b}${small}`, ew: (`${a} ${big} ${b} ${small} = `.length + 6) * 0.62 + BW + 1, eh: 1.1 + 1.6 };
  }
  const n = ri(rng, 2, f >= 1000 ? 9 : 12), ans = n * f;
  return { mod: 'ns', type: 'convm', prompt: 'Write in the smaller unit:', kind: 'one', n, big, small, ans: cnum(ans), sig: `cv${n}${big}${small}`, ew: (`${n} ${big} = `.length + 5) * 0.62 + BW + 1, eh: 1.1 + 1.6 };
}

const nsConvMHtml = (p, key, x) => p.kind === 'mix' ? `${p.a} ${p.big} ${p.b} ${p.small} = ${x(p.ans, 4)} ${p.small}` : `${p.n} ${p.big} = ${x(p.ans, 4)} ${p.small}`;

/* Area and perimeter of rectangles, including an unknown side. L1 area or perimeter, L2 adds unknown sides, L3 larger numbers. */
function nsxRectF(rng, L) {
  const unit = pick(rng, ['cm', 'in', 'ft', 'm', 'yd']), thing = pick(rng, ['garden', 'rug', 'poster', 'playground', 'patio', 'banner']), mx = L === 1 ? 12 : L === 2 ? 20 : 50;
  const kind = pick(rng, L === 1 ? ['area', 'perim'] : L === 2 ? ['area', 'perim', 'unkA', 'unkP'] : ['area', 'perim', 'unkA', 'unkA', 'unkP', 'unkP']);
  const l = ri(rng, 4, mx), w = ri(rng, 2, l - 1), A = l * w, P = 2 * (l + w), isW = rng() < 0.5, known = isW ? 'length' : 'width', ask = isW ? 'width' : 'length', kv = isW ? l : w, ansv = isW ? w : l;
  let prompt, text, eq, ans;
  if (kind === 'area') { prompt = 'Find the area.'; text = `A rectangular ${thing} is ${l} ${unit} long and ${w} ${unit} wide. What is its area in square ${unit}?`; eq = `${l} × ${w}`; ans = A; }
  else if (kind === 'perim') { prompt = 'Find the perimeter.'; text = `A rectangular ${thing} is ${l} ${unit} long and ${w} ${unit} wide. What is its perimeter in ${unit}?`; eq = `2 × (${l} + ${w})`; ans = P; }
  else if (kind === 'unkA') { prompt = 'Find the unknown side.'; text = `A rectangular ${thing} has an area of ${A} square ${unit} and a ${known} of ${kv} ${unit}. What is its ${ask}?`; eq = `${A} ÷ ${kv}`; ans = ansv; }
  else { prompt = 'Find the unknown side.'; text = `A rectangular ${thing} has a perimeter of ${P} ${unit} and a ${known} of ${kv} ${unit}. What is its ${ask}?`; eq = `(${P} − 2 × ${kv}) ÷ 2`; ans = ansv; }
  return { mod: 'ns', type: 'rectf', prompt, kind, l, w, unit, eq, ans: String(ans), text, wide: true, sig: `rf${kind}${l}.${w}${unit}${thing}${kind[0] === 'u' ? ask : ''}`, ew: 21, eh: nsWordEh(text) };
}

const nsRectFHtml = (p, key, x) => wordCell(p, key, x);

/* Line plots with fractional units (halves, fourths, eighths) from 0 to 1.
   Questions: how many at one length, how many are longer than a length, the spread in units of 1/n, and the total of the pieces at one length (answer over the unit denominator).
   L1 halves and fourths, counts and "longer than"; L2 fourths and eighths, adds the spread; L3 adds totals. */
const NS_LP_ITEMS = [['pieces of ribbon', 'long', 'inch', 'inches'], ['pencils', 'long', 'inch', 'inches'], ['leaves', 'long', 'inch', 'inches'], ['seedlings', 'tall', 'foot', 'feet']];
const nsLpGcd = (a, b) => b ? nsLpGcd(b, a % b) : a;
const nsLpTxt = (k, den) => k === 0 ? '0' : k === den ? '1' : `${k / nsLpGcd(k, den)}/${den / nsLpGcd(k, den)}`;
const nsLpHtml = (k, den) => k === 0 ? '0' : k === den ? '1' : frH(k / nsLpGcd(k, den), den / nsLpGcd(k, den));

function nsLinePlotSvg(counts, den, thing) {
  const W = 270, H = 104, x0 = 20, x1 = 250, y = 80, xs = i => x0 + (x1 - x0) * i / den, fs = den === 8 ? ' style="font-size:10.5px"' : '';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="2.7in" height="${(H * 2.7 / W).toFixed(2)}in" viewBox="0 0 ${W} ${H}" role="img" aria-label="Line plot of ${thing}: ${counts.map((c, i) => `${c} at ${nsLpTxt(i, den)}`).join(', ')}">`
    + `<path d="M10 ${y}H260" stroke="var(--ink)" stroke-width="2" fill="none"/>`;
  let t = '';
  for (let i = 0; i <= den; i++) t += `M${xs(i)} ${y - 6}V${y + 6}`;
  s += `<path d="${t}" stroke="var(--ink)" stroke-width="1.6" fill="none"/>`;
  for (let i = 0; i <= den; i++) s += `<text class="lab"${fs} x="${xs(i)}" y="${y + 22}" text-anchor="middle">${nsLpTxt(i, den)}</text>`;
  counts.forEach((c, i) => { for (let j = 0; j < c; j++) { const cx = xs(i), cy = y - 12 - j * 12; s += `<path class="px" d="M${cx - 4} ${cy - 4}L${cx + 4} ${cy + 4}M${cx + 4} ${cy - 4}L${cx - 4} ${cy + 4}" stroke="var(--ink)" stroke-width="1.8" fill="none"/>`; } });
  return s + '</svg>';
}

function nsxLinePlot(rng, L) {
  const p = nsxLinePlot0(rng, L), len = p.q.replace(/<[^>]*>/g, '').length;   // question lines at the narrowest layout (about 22 characters per line), plus the answer line and the fraction's extra height
  p.hfs = 1.5 * Math.ceil(len / 22) + 1.7 + 0.5 + (p.kind === 'total' ? 1.4 : 0);   // the answer fraction box is two lines tall
  return p;
}

function nsxLinePlot0(rng, L) {
  const den = L === 1 ? pick(rng, [2, 4]) : pick(rng, [4, 8]), kind = pick(rng, L === 1 ? ['count', 'more'] : L === 2 ? ['count', 'more', 'diff'] : ['count', 'more', 'diff', 'total', 'total']);
  const [thing, adj, u1, u2] = pick(rng, NS_LP_ITEMS), need = Math.min(3, den + 1);
  let counts;
  for (;;) {
    counts = Array.from({ length: den + 1 }, () => ri(rng, 0, 4));
    const tot = counts.reduce((a, b) => a + b, 0);
    if (tot >= 6 && tot <= 14 && counts.filter(c => c > 0).length >= need && (kind !== 'total' || counts.slice(1, den).some(c => c >= 2))) break;
  }
  const svg = nsLinePlotSvg(counts, den, thing), base = { mod: 'ns', type: 'lineplot', prompt: `Use the line plot of ${thing}.`, kind, counts, den, thing, svg, wide: true, win: 2.7, hin: kind === 'diff' || kind === 'total' ? 1.34 : 1.04, ew: 22, eh: 1 };
  if (kind === 'count') {
    const ks = counts.map((c, i) => i).filter(i => i > 0 && i < den && counts[i] > 0), k = pick(rng, ks.length ? ks : [counts.findIndex(c => c > 0)]);
    return { ...base, k, q: `How many ${thing} are exactly ${nsLpHtml(k, den)} ${u1} ${adj}?`, ans: String(counts[k]), sig: `lp${den}c${counts.join('')}k${k}` };
  }
  if (kind === 'more') {
    const ks = counts.map((c, i) => i).filter(i => i > 0 && i < den && counts.slice(i + 1).some(c => c > 0)), k = pick(rng, ks.length ? ks : [0]);
    return { ...base, k, q: `How many ${thing} are ${adj === 'long' ? 'longer' : 'taller'} than ${nsLpHtml(k, den)} ${u1}?`, ans: String(counts.slice(k + 1).reduce((a, b) => a + b, 0)), sig: `lp${den}m${counts.join('')}k${k}` };
  }
  if (kind === 'diff') {
    const nz = counts.map((c, i) => c > 0 ? i : -1).filter(i => i >= 0), lo = nz[0], hi = nz[nz.length - 1];
    return { ...base, q: `The ${adj === 'long' ? 'longest' : 'tallest'} is how many ${frH(1, den)}-${u1} units ${adj === 'long' ? 'longer' : 'taller'} than the shortest?`, ans: String(hi - lo), sig: `lp${den}d${counts.join('')}` };
  }
  const ks = counts.map((c, i) => i).filter(i => i > 0 && i < den && counts[i] >= 2), k = pick(rng, ks.length ? ks : [counts.findIndex((c, i) => i > 0 && c > 0)]);
  const c = counts[k];
  return { ...base, k, q: `The ${c} ${thing} at ${nsLpHtml(k, den)} ${u1} are put end to end. How many ${u2} in all?`, ans: `${c * k}/${den}`, num: c * k, sig: `lp${den}t${counts.join('')}k${k}` };
}

const nsLinePlotHtml = (p, key, x) => `${p.svg}<div class="wt">${p.q}</div><div>Answer: ${p.kind === 'total' ? frBox(p.num, p.den, 'n', key) : x(p.ans, 2.4)}</div>`;

/* ---------- grade 5 measurement: unit conversion with decimals and fractions, and line plots with operations ---------- */

/* Larger-to-smaller conversions within one system: [big, small, factor, system]. */
const NS_CONV5 = [['km', 'm', 1000, 'm'], ['m', 'cm', 100, 'm'], ['cm', 'mm', 10, 'm'], ['kg', 'g', 1000, 'm'], ['g', 'mg', 1000, 'm'], ['L', 'mL', 1000, 'm'],
  ['yd', 'ft', 3, 'c'], ['ft', 'in', 12, 'c'], ['lb', 'oz', 16, 'c'], ['gal', 'qt', 4, 'c'], ['qt', 'pt', 2, 'c'], ['pt', 'c', 2, 'c'], ['hr', 'min', 60, 't'], ['min', 's', 60, 't'], ['day', 'hr', 24, 't']];

/* simple fractions whose product with the factor is a whole number */
const nsFracFor = (rng, f) => pick(rng, [[1, 2], [1, 4], [3, 4], [1, 3], [2, 3], [1, 5], [3, 5], [1, 8]].filter(([n, d]) => (n * f) % d === 0));

/* Convert with decimals and fractions, and combine measurements in multi-step problems.
   L1 metric decimals to tenths and halves in customary and time units, L2 hundredths, other fractions and money, L3 adds multi-step word problems. */
function nsxConv5(rng, L) {
  const nm = pick(rng, NS_NAMES);
  if (L === 3 && rng() < 0.7) {
    const k = pick(rng, ['liq', 'rope', 'board', 'movie', 'flour']), tag = { mod: 'ns', type: 'conv5', prompt: 'Read and solve.', kind: 'multi', mkind: k, wide: true };
    if (k === 'liq') {
      const a = ri(rng, 11, 79) / 10, b = ri(rng, 11, 79) / 10, ans = Math.round((a + b) * 1000), text = `${nm} mixed ${a} L of lemonade with ${b} L of juice. How many milliliters of drink is that in all?`;
      return Object.assign(tag, { html: esc(text), eq: `(${a} + ${b}) × 1,000`, ans: cnum(ans), unit: 'mL', sig: `c5l${a}${b}`, ew: 21, eh: nsWordEh(text) + 0.6 });
    }
    if (k === 'rope') {
      const a = ri(rng, 21, 59) / 10, b = 5 * ri(rng, 2, 30), ans = Math.round(a * 100 - b), text = `A rope is ${a} m long. ${nm} cuts off ${b} cm. How many centimeters of rope are left?`;
      return Object.assign(tag, { html: esc(text), eq: `${a} × 100 − ${b}`, ans: cnum(ans), unit: 'cm', sig: `c5r${a}${b}`, ew: 21, eh: nsWordEh(text) + 0.6 });
    }
    if (k === 'board') {
      const w = ri(rng, 2, 6), [n, d] = pick(rng, [[1, 2], [1, 4], [3, 4], [1, 3], [2, 3]]), tot = (w * d + n) * 12 / d, cut = ri(rng, 5, Math.floor(tot / 2));
      const html = `A board is ${fvH([w, n, d])} feet long. ${esc(nm)} cuts off ${cut} inches. How many inches of board are left?`;
      return Object.assign(tag, { html, eq: `(${w} + ${n}/${d}) × 12 − ${cut}`, ans: cnum(tot - cut), unit: 'in', sig: `c5b${w}${n}${d}${cut}`, ew: 21, eh: nsWordEh(html.replace(/<[^>]*>/g, '')) + 2.4 });
    }
    if (k === 'movie') {
      const w = ri(rng, 1, 2), [n, d] = pick(rng, [[1, 2], [1, 4], [3, 4], [1, 3], [2, 3]]), pre = 5 * ri(rng, 2, 8), tot = (w * d + n) * 60 / d + pre;
      const html = `A movie is ${fvH([w, n, d])} hours long. ${esc(nm)} also watches ${pre} minutes of previews. How many minutes is that in all?`;
      return Object.assign(tag, { html, eq: `(${w} + ${n}/${d}) × 60 + ${pre}`, ans: cnum(tot), unit: 'min', sig: `c5m${w}${n}${d}${pre}`, ew: 21, eh: nsWordEh(html.replace(/<[^>]*>/g, '')) + 2.4 });
    }
    const a = ri(rng, 15, 40) / 10, b = 50 * ri(rng, 2, 12), ans = Math.round(a * 1000 - b), text = `A bag of flour has a mass of ${a} kg. ${nm} uses ${b} g. How many grams of flour are left?`;
    return Object.assign(tag, { html: esc(text), eq: `${a} × 1,000 − ${b}`, ans: cnum(ans), unit: 'g', sig: `c5f${a}${b}`, ew: 21, eh: nsWordEh(text) + 0.6 });
  }
  if (L > 1 && rng() < 0.15) {
    const c = ri(rng, 105, 999), v = c / 100;
    return { mod: 'ns', type: 'conv5', prompt: 'Write in the smaller unit:', kind: 'one', big: 'dollar', small: 'cents', f: 100, system: 'money', shown: `$${dstr(c, 2)}`, v, ans: cnum(c), sig: `c5$${c}`, ew: 22, eh: 1.1 + 1.6 };
  }
  const pool = NS_CONV5.filter(r => (L === 1 ? r[3] === 'm' && r[2] >= 100 : true)), [big, small, f, system] = pick(rng, pool);
  const useFrac = system !== 'm' || (L > 1 && rng() < 0.2 && f > 10);
  if (!useFrac) {
    const dp = L === 1 ? 1 : pick(rng, f === 10 ? [1] : [1, 2]), shown = dstr(ri(rng, 11, 199), dp), v = Number(shown);
    return { mod: 'ns', type: 'conv5', prompt: 'Write in the smaller unit:', kind: 'one', big, small, f, system, shown, v, ans: cnum(Math.round(v * f)), sig: `c5d${shown}${big}`, ew: (shown.length + big.length + small.length + 8) * 0.62 + BW + 1, eh: 1.1 + 1.6 };
  }
  const w = ri(rng, 1, L === 1 ? 5 : 9), [n, d] = nsFracFor(rng, f), ans = (w * d + n) * f / d, frac = [w, n, d];
  return { mod: 'ns', type: 'conv5', prompt: 'Write in the smaller unit:', kind: 'one', big, small, f, system, frac, v: w + n / d, ans: cnum(ans), sig: `c5f${w}.${n}/${d}${big}`, ew: (big.length + small.length + 8) * 0.62 + 3 + BW + 1, eh: 4.0 };
}

const nsConv5Html = (p, key, x) => p.kind === 'multi' ? `<div class="wt">${p.html}</div><div>Equation: <span class="blank" style="min-width:9em">${key ? esc(p.eq) : '&nbsp;'}</span></div><div>Answer: ${x(p.ans, 4)} ${p.unit}</div>`
  : p.frac ? `${fvH(p.frac)} ${p.big} = ${x(p.ans, 4)} ${p.small}` : p.system === 'money' ? `${p.shown} = ${x(p.ans, 4)} cents` : `${p.shown} ${p.big} = ${x(p.ans, 4)} ${p.small}`;

/* Line plots in halves, fourths and eighths of a unit, with operations on the data.
   make: plot a list of measurements. total: add. diff: subtract. level: share the total equally (redistribute).
   L1 halves and fourths, plotting and totals; L2 fourths and eighths, adds differences; L3 adds sharing equally. */
const NS_LP5_ITEMS = [['beakers of water', 'cup', 'cups'], ['jars of juice', 'cup', 'cups'], ['pails of sand', 'gallon', 'gallons']];

function nsxLinePlot5(rng, L) {
  const den = L === 1 ? pick(rng, [2, 4]) : pick(rng, [4, 8]), kind = pick(rng, L === 1 ? ['make', 'total'] : L === 2 ? ['make', 'total', 'diff'] : ['make', 'total', 'diff', 'level', 'level']);
  const [thing, u1, u2] = pick(rng, NS_LP5_ITEMS);
  let counts, N, g = 0, sumK, nz;
  for (;;) {
    counts = Array.from({ length: den + 1 }, () => ri(rng, 0, 3));
    N = counts.reduce((a, b) => a + b, 0); sumK = counts.reduce((a, c, i) => a + c * i, 0); nz = counts.filter(c => c > 0).length;
    g++;
    const ok = N >= 4 && N <= 9 && nz >= 3 && (kind !== 'level' || (red(sumK, den * N)[1] <= 16 && N >= 3 && N <= 8));
    if (ok || g > 2000) break;
  }
  const svgFull = nsLinePlotSvg(counts, den, thing), svgBlank = nsLinePlotSvg(counts.map(() => 0), den, thing);
  const vals = []; counts.forEach((c, i) => { for (let j = 0; j < c; j++) vals.push(i); });
  const base = { mod: 'ns', type: 'lplot5', kind, counts, den, N, thing, svgFull, svgBlank, wide: true, win: 2.7, hin: 1.04, ew: 22, eh: 1 };
  const cap = `${N} ${thing}`;
  let q, ans, plainLen;
  if (kind === 'make') {
    const sh = shuffle(rng, vals.slice());
    return Object.assign(base, { prompt: 'Make a line plot.', list: sh, ans: 'plot', q: `${cap} hold these amounts, in ${u2}: ${sh.map(k => nsLpHtml(k, den)).join(', ')}.`, sig: `l5m${den}${sh.join('')}`, hfs: 1.5 * Math.ceil((N * 4 + 40) / 22) + 0.8 + 1.4 });
  }
  if (kind === 'total') { ans = mixedOf(sumK, den); q = `The line plot shows the amount in each of ${cap}, in ${u2}. How many ${u2} are there in all?`; }
  else if (kind === 'diff') { const hi = Math.max(...vals), lo = Math.min(...vals); ans = mixedOf(hi - lo, den); q = `The line plot shows the amount in each of ${cap}, in ${u2}. How much more is in the fullest than in the emptiest?`; }
  else { ans = mixedOf(sumK, den * N); q = `The line plot shows the amount in each of ${cap}, in ${u2}. If all the ${thing.split(' ')[0]} are poured together and shared equally, how many ${u2} will each have?`; }
  return Object.assign(base, { prompt: 'Use the line plot.', q, ans, sumK, sig: `l5${kind}${den}${counts.join('')}`, hfs: 1.5 * Math.ceil(q.length / 22) + 1.7 + 0.5 + 1.4 });
}

const nsLinePlot5Html = (p, key, x) => p.kind === 'make' ? `<div class="wt">${p.q}</div>${key ? p.svgFull : p.svgBlank}`
  : `${p.svgFull}<div class="wt">${esc(p.q)}</div><div>Answer: ${ansTpl(p.ans, key)}</div>`;

defTypes("ns", "Measurement and perimeter", [
  { id: "perim", label: "Perimeter", blurb: "From side lengths, an unknown side, or same perimeter and same area.", on: false, gen: nsxPerim, html: nsPerimHtml },
{ id: "convm", label: "Convert measurement units", blurb: "Length, mass, liquid volume and time, larger unit to smaller.", on: false, gen: nsxConvM, html: nsConvMHtml },
{ id: "rectf", label: "Rectangle area and perimeter", blurb: "Area, perimeter and unknown sides in real-world problems.", on: false, gen: nsxRectF, html: nsRectFHtml },
{ id: "lineplot", label: "Line plots with fractions", blurb: "Read line plots marked in halves, fourths and eighths: counts, comparisons, spread and totals.", on: false, gen: nsxLinePlot, html: nsLinePlotHtml },
  { id: "conv5", label: "Convert units, decimals and fractions", blurb: "Larger to smaller units with decimals, fractions and money, and multi-step problems.", on: false, gen: nsxConv5, html: nsConv5Html },
  { id: "lplot5", label: "Line plots and operations", blurb: "Plot measurements in halves, fourths and eighths; add, subtract and share equally.", on: false, gen: nsxLinePlot5, html: nsLinePlot5Html }
]);
