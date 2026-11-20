/* ---------- Shapes, Measures and Data: number lines ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

/* -----: number line jumps -----
   The student copy never draws where the jump lands. kind 'draw': only the start is marked, the equation is given and the student draws the jump
   and writes the answer. kind 'write': the jump is drawn and the student writes the equation it shows (operation, both numbers and the result). */
function visNline(rng, L) {
  const tens = L === 2 || (L === 3 && rng() < 0.5), lo = 0, hi = tens ? 100 : 20, st = tens ? 10 : 1, add = rng() < 0.6, kind = rng() < 0.6 ? 'draw' : 'write';
  let a, b;
  if (add) { a = st * ri(rng, tens ? 1 : 2, tens ? 6 : 12); b = st * ri(rng, tens ? 1 : 2, Math.min(tens ? 9 : 9, (hi - a) / st)); }
  else { a = st * ri(rng, tens ? 4 : 8, hi / st); b = st * ri(rng, tens ? 1 : 2, Math.min(a / st - (tens ? 0 : 1), tens ? 6 : 9)); }
  const res = add ? a + b : a - b;
  return vp('nline', kind === 'draw' ? 'Draw the jump. Write the answer.' : 'Write the equation for the jump.', { kind, add, a, b, lo, hi, st, tens, ans: String(res), sig: `nl${kind}${add}${a}${b}${tens}` }, 3.05, 0.95, 3.4, 12);
}

function visNlineHtml(p, key, x) {
  const x0 = 22, W = 260, X = v => x0 + W * (v - p.lo) / (p.hi - p.lo), y = 62, draw = p.kind === 'draw';
  let o = vline(x0 - 8, y, x0 + W + 8, y, VINK, 2);
  for (let v = p.lo; v <= p.hi; v += p.st) { const big = p.tens || v % 5 === 0; o += vline(X(v), y - (big ? 8 : 5), X(v), y + (big ? 8 : 5), VINK, 1.5); if (p.tens ? true : v % 5 === 0) o += vtxt(X(v), y + 22, String(v), { s: 11 }); }
  const end = p.add ? p.a + p.b : p.a - p.b, mx = (X(p.a) + X(end)) / 2, top = y - 4 - Math.min(46, 12 + 0.12 * Math.abs(X(end) - X(p.a))), ex = X(end);
  if (!draw || key) {
    o += `<path d="M${X(p.a)} ${y - 4}Q${mx} ${top} ${ex} ${y - 4}" fill="none" stroke="${key && draw ? VKEY : VINK}" stroke-width="2.2"/>`;
    /* arrowhead on the end of the curve: tip at the end point, pointing along the curve's end tangent (control point to end point) */
    const tx = ex - mx, ty = (y - 4) - top, tl = Math.hypot(tx, ty), ux = tx / tl, uy = ty / tl, hl = 11, hw = 5, bx = ex - ux * hl, by = y - 4 - uy * hl, col = key && draw ? VKEY : VINK;
    o += vpoly([[ex, y - 4], [bx - uy * hw, by + ux * hw], [bx + uy * hw, by - ux * hw]], col, 0, 0, 0, col);
  }
  o += draw ? `<circle cx="${X(p.a)}" cy="${y}" r="5" fill="${VINK}"/>` + (key ? `<circle cx="${ex}" cy="${y}" r="5" fill="${VKEY}"/>` : '') : '';
  const body = draw ? `${p.a} ${p.add ? '+' : '\u2212'} ${p.b} = ${x(p.ans, 2.6)}` : `${x(String(p.a), 2)} ${x(p.add ? '+' : '\u2212', 1.2)} ${x(String(p.b), 2)} = ${x(p.ans, 2)}`;
  return vsvg(3.05, 0.95, o, draw ? 'Number line with a start point' : 'Number line with a jump') + `<div>${body}</div>`;
}

/* -----: fractions on a number line ----- */
function g3Fline(rng, L) {
  const b = pick(rng, L === 1 ? [2, 3, 4] : [2, 3, 4, 6, 8]), top = L === 3 && rng() < 0.5 ? 2 : 1, v = pick(rng, L === 1 ? ['read', 'mark', 'unit'] : ['read', 'read', 'mark', 'unit']);
  let k = ri(rng, 1, top * b - 1); while (top === 2 && k === b) k = ri(rng, 1, top * b - 1);
  if (v === 'unit') return vp('fline', 'Name the length of one part.', { variant: v, b, top: 1, k: 1, ans: `1/${b}`, sig: `flu${b}` }, 3.0, 0.7, 4.5);
  if (v === 'mark') return vp('fline', `Mark ${k}/${b} on the number line.`, { variant: v, b, top, k, ans: `${k}/${b}`, sig: `flm${b}${top}${k}` }, 3.0, 0.7, 1.9);
  return vp('fline', 'What fraction does the point show?', { variant: v, b, top, k, ans: `${k}/${b}`, sig: `flr${b}${top}${k}` }, 3.0, 0.7, 4.5);
}

function g3FlineHtml(p, key, x) {
  const x0 = 20, W = 260, n = p.top * p.b, xs = i => x0 + W * i / n; let o = vline(x0 - 8, 36, x0 + W + 8, 36, VINK, 2);
  for (let i = 0; i <= n; i++) { const whole = i % p.b === 0; o += vline(xs(i).toFixed(1), whole ? 26 : 30, xs(i).toFixed(1), whole ? 46 : 42, VINK, whole ? 2 : 1.5); if (whole) o += vtxt(xs(i).toFixed(1), 62, String(i / p.b), { s: 13 }); }
  if (p.variant === 'read') o += `<circle cx="${xs(p.k).toFixed(1)}" cy="36" r="6.5" fill="${VFILL[1]}" stroke="${VINK}" stroke-width="2"/>`;
  if (p.variant === 'mark' && key) o += `<circle cx="${xs(p.k).toFixed(1)}" cy="36" r="6.5" fill="${VKEY}" stroke="${VKEY}" stroke-width="2"/>`;
  const g = vsvg(3.0, 0.7, o, 'Number line');
  if (p.variant === 'mark') return g;
  return g + `<div>${p.variant === 'unit' ? 'Each part is ' : 'The point is at '}${ansTpl({ w: 0, n: p.variant === 'unit' ? 1 : p.k, d: p.b }, key)}</div>`;
}

defTypes("vis", "Number lines", [
  { id: "nline", label: "Number line jumps", blurb: "Draw a jump to add or subtract, or write the equation a jump shows.", on: false, gen: visNline, html: visNlineHtml },
  { id: "fline", label: "Fractions on a number line", blurb: "Read and mark fractions; length of one part.", on: false, gen: g3Fline, html: g3FlineHtml }
]);
