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

defTypes("ns", "Perimeter", [
  { id: "perim", label: "Perimeter", blurb: "From side lengths, an unknown side, or same perimeter and same area.", on: false, gen: nsxPerim, html: nsPerimHtml }
]);
