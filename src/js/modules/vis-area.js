/* ---------- Shapes, Measures and Data: area and perimeter ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

/* -----: area concepts with unit squares ----- */
function g3Poly(rng, n, cols, rows) {
  const has = new Set(), cur = [[ri(rng, 0, cols - 1), ri(rng, 0, rows - 1)]]; has.add(cur[0] + ''); let g = 0;
  while (cur.length < n && g++ < 600) { const [c, r] = pick(rng, cur), [dc, dr] = pick(rng, [[1, 0], [-1, 0], [0, 1], [0, -1]]), nc = c + dc, nr = r + dr; if (nc < 0 || nr < 0 || nc >= cols || nr >= rows || has.has([nc, nr] + '')) continue; has.add([nc, nr] + ''); cur.push([nc, nr]); }
  return cur.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

const G3_AUNIT = [['unit squares', 'square units', ''], ['squares, each 1 cm by 1 cm,', 'square centimeters', ''], ['squares, each 1 inch by 1 inch,', 'square inches', ''], ['squares, each 1 foot by 1 foot,', 'square feet', '']];

function g3Acon(rng, L) {
  const v = pick(rng, L === 1 ? ['which', 'defn'] : ['which', 'tile', 'defn']);
  if (v === 'which') { const lo = L === 1 ? 3 : L === 2 ? 5 : 8, hi = L === 1 ? 8 : L === 2 ? 12 : 16, na = ri(rng, lo, hi); let nb = ri(rng, lo, hi);
    if (L > 1 && rng() < (L === 2 ? 0.25 : 0.35)) nb = na; else while (nb === na) nb = ri(rng, lo, hi);
    const A = g3Poly(rng, na, 5, 4); let B = g3Poly(rng, nb, 5, 4), t = 0; while (nb === na && B + '' === A + '' && t++ < 20) B = g3Poly(rng, nb, 5, 4);
    return vp('acon', 'Which has the greater area?', { variant: v, A, B, ans: na > nb ? 'A' : nb > na ? 'B' : 'same', sig: `ac${A.map(c => c.join(''))}|${B.map(c => c.join(''))}` }, 2.95, 1.25, 4.7, 12); }
  if (v === 'tile') { const w = ri(rng, 3, 5), h = ri(rng, 2, 3), flaw = pick(rng, ['gap', 'shift']), at = ri(rng, 0, w * h - 1), first = pick(rng, ['A', 'B']);
    return vp('acon', 'Which has no gaps or overlaps?', { variant: v, w, h, flaw, at, first, ans: first, sig: `at${w}${h}${flaw}${at}${first}` }, 2.95, 1.25, 3.4, 12); }
  const n = ri(rng, L === 1 ? 4 : 6, L === 1 ? 12 : L === 2 ? 30 : 60), u = pick(rng, L === 1 ? [G3_AUNIT[0]] : G3_AUNIT), text = `A figure is covered by ${n} ${u[0]} with no gaps or overlaps. What is its area?`;
  return vtext('acon', 'Area from unit squares.', { variant: v, n, unit: u[1], text, ans: String(n), sig: `ad${n}${u[1]}` }, 21, g3eh([text.length], 0, 1.7), true);
}

function g3AconHtml(p, key, x) {
  if (p.variant === 'defn') return `<div class="wt">${esc(p.text)}</div><div>${x(p.ans, 2.4)} ${p.unit}</div>`;
  const u = 22; let o = '';
  const panel = (ox, cells, fill, lab) => { cells.forEach(c => { o += vrect(ox + c[0] * u, 4 + c[1] * u, u, u, fill, { w: 1.5 }); }); o += vtxt(ox + 55, 112, lab, { b: 1, s: 14 }); };
  if (p.variant === 'which') { panel(10, p.A, VFILL[0], 'A'); panel(165, p.B, VFILL[1], 'B'); return vsvg(2.95, 1.25, o, 'Two figures made of squares') + `<div style="font-size:.85em">Each square is 1 square unit.</div><div>${vopts(['A', 'B', 'same'], p.ans, key)}</div>`; }
  const fig = (ox, good, lab) => { o += vrect(ox, 4, p.w * u, p.h * u, 'none', { d: '4 3', w: 1.2 });
    for (let i = 0; i < p.w * p.h; i++) { const c = i % p.w, r = Math.floor(i / p.w); if (good) o += vrect(ox + c * u, 4 + r * u, u, u, VFILL[1], { w: 1.5 }); else if (i !== p.at) o += vrect(ox + c * u, 4 + r * u, u, u, VFILL[1], { w: 1.5 }); }
    if (!good && p.flaw === 'shift') { const c = p.at % p.w, r = Math.floor(p.at / p.w); o += vrect(ox + c * u + (c === p.w - 1 ? -u / 2 : u / 2), 4 + r * u, u, u, VFILL[2], { w: 1.5 }); } o += vtxt(ox + p.w * u / 2, 4 + p.h * u + 18, lab, { b: 1, s: 14 }); };
  fig(14, p.first === 'A', 'A'); fig(165, p.first !== 'A', 'B');
  return vsvg(2.95, 1.25, o, 'Two figures covered with squares') + `<div>${vopts(['A', 'B'], p.ans, key)}</div>`;
}

/* -----: rectangles with the same perimeter or the same area ----- */
const G3_SAMEA = [12, 16, 18, 20, 24, 30, 36];

function g3Pera(rng, L) {
  const kind = L === 1 || rng() < 0.5 ? 'perim' : 'area';
  let a, b;
  if (kind === 'perim') { const s = ri(rng, L === 1 ? 6 : L === 2 ? 8 : 9, L === 1 ? 8 : L === 2 ? 10 : 12), hs = shuffle(rng, Array.from({ length: Math.floor(s / 2) }, (_, i) => i + 1)).slice(0, 2); a = [s - hs[0], hs[0]]; b = [s - hs[1], hs[1]]; }
  else { const ar = pick(rng, G3_SAMEA.filter(v => L === 2 ? v <= 24 : true)), prs = []; for (let h = 1; h * h <= ar; h++) if (ar % h === 0 && ar / h <= 11) prs.push([ar / h, h]); const two = shuffle(rng, prs).slice(0, 2); a = two[0]; b = two[1]; }
  const per = r => 2 * (r[0] + r[1]), area = r => r[0] * r[1], f = kind === 'perim' ? area : per, ans = f(a) > f(b) ? 'A' : 'B';
  return vp('pera', kind === 'perim' ? 'Same perimeter. Which area is greater?' : 'Same area. Which perimeter is greater?', { kind, a, b, ans, sig: `pe${kind}${a}${b}` }, 3.1, 1.1, 4.9, 22);
}

function g3PeraHtml(p, key, x) {
  const u = 11; let o = '';
  const rect = (ox, r, lab) => { o += vrect(ox, 22, r[0] * u, r[1] * u, VFILL[lab === 'A' ? 0 : 1], { w: 1.5 }) + vtxt(ox + r[0] * u / 2, 16, String(r[0]), { s: 11 }) + vtxt(ox - 6, 22 + r[1] * u / 2 + 4, String(r[1]), { a: 'end', s: 11 }) + vtxt(ox + r[0] * u / 2, 104, lab, { b: 1, s: 13 });
    for (let i = 1; i < r[0]; i++) o += vline(ox + i * u, 22, ox + i * u, 22 + r[1] * u, '#fff', 1); for (let j = 1; j < r[1]; j++) o += vline(ox, 22 + j * u, ox + r[0] * u, 22 + j * u, '#fff', 1); };
  rect(30, p.a, 'A'); rect(172, p.b, 'B');
  const f = p.kind === 'perim' ? r => r[0] * r[1] : r => 2 * (r[0] + r[1]), w = p.kind === 'perim' ? 'Area' : 'Perimeter';
  return vsvg(3.1, 1.1, o, 'Two rectangles with side lengths') + `<div>${w} of A ${x(f(p.a), 1.8)}&ensp;${w} of B ${x(f(p.b), 1.8)}</div><div>Greater: ${vopts(['A', 'B'], p.ans, key)}</div>`;
}

defTypes("vis", "Area and perimeter", [
  { id: "acon", label: "Area concepts", blurb: "Compare areas, tiling without gaps, unit squares.", on: false, gen: g3Acon, html: g3AconHtml },
  { id: "pera", label: "Compare rectangles", blurb: "Same perimeter or same area, which is greater.", on: false, gen: g3Pera, html: g3PeraHtml }
]);
