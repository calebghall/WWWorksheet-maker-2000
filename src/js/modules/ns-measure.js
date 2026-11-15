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

defTypes("ns", "Measurement and perimeter", [
  { id: "perim", label: "Perimeter", blurb: "From side lengths, an unknown side, or same perimeter and same area.", on: false, gen: nsxPerim, html: nsPerimHtml },
{ id: "convm", label: "Convert measurement units", blurb: "Length, mass, liquid volume and time, larger unit to smaller.", on: false, gen: nsxConvM, html: nsConvMHtml },
{ id: "rectf", label: "Rectangle area and perimeter", blurb: "Area, perimeter and unknown sides in real-world problems.", on: false, gen: nsxRectF, html: nsRectFHtml },
{ id: "lineplot", label: "Line plots with fractions", blurb: "Read line plots marked in halves, fourths and eighths: counts, comparisons, spread and totals.", on: false, gen: nsxLinePlot, html: nsLinePlotHtml }
]);
