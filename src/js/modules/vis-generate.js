/* ---------- Shapes, Measures and Data: build instead of read ----------
   genset    K.2E: a group of up to 20 counters is shown; the student draws a group with more, fewer or the same number. The key draws one example.
   openline  2.2E: an open number line (only the ends and sometimes the middle are labeled); the student marks a given number, or reads a marked point. */

function visGenset(rng, L) {
  const rel = pick(rng, L === 1 ? ['more', 'fewer'] : ['more', 'fewer', 'same']), hiN = L === 1 ? 10 : 20;
  const n = rel === 'more' ? ri(rng, 1, hiN - 2) : rel === 'fewer' ? ri(rng, 3, hiN) : ri(rng, 2, hiN);
  const ex = rel === 'more' ? ri(rng, n + 1, Math.min(20, n + 3)) : rel === 'fewer' ? ri(rng, Math.max(1, n - 3), n - 1) : n;
  const prompt = rel === 'same' ? 'Draw a group with the same number.' : `Draw a group with ${rel} counters.`;
  return vp('genset', prompt, { rel, n, ex, ans: String(ex), sig: `gs${rel}${n}` }, 3.05, 1.6, 0);
}
function visGensetHtml(p, key, x) {
  const dots = (cnt, y0, fill, stroke) => Array.from({ length: cnt }, (_, i) => vshape('circle', 22 + (i % 10) * 28, y0 + Math.floor(i / 10) * 28, 22, fill, 0, stroke)).join('');
  let o = dots(p.n, 14, VFILL[1], VINK);
  const top = 14 + Math.ceil(p.n / 10) * 28 + 2, bh = 70;
  o += `<rect x="4" y="${top}" width="296" height="${bh}" rx="6" fill="none" stroke="${VINK}" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  if (key) o += dots(p.ex, top + 20, VKEY, VKEY);
  return vsvg(3.05, (top + bh + 6) / 100, o, 'Group of counters and a drawing box');
}

function visOpenline(rng, L) {
  const cfg = L === 1 ? [[0, 100, 50], [0, 20, 10]] : L === 2 ? [[0, 100, 50], [0, 500, 250], [0, 200, 100]] : [[0, 1000, 500], [0, 1000, 0], [0, 1200, 600], [100, 200, 150], [0, 500, 0]];
  const [lo, hi, mid] = pick(rng, cfg), span = hi - lo, st = span >= 500 ? 10 : span >= 100 ? 5 : 1;
  const mark = rng() < 0.65;
  let n;
  for (let g = 0; g < 100; g++) {
    n = lo + st * ri(rng, Math.ceil(span * 0.08 / st), Math.floor(span * 0.92 / st));
    if (n !== mid && (!mark ? Math.abs(n - mid) >= span * 0.2 : true)) break;
  }
  n = nrClampV(n, lo, hi);
  if (mark) return vp('openline', `Mark ${cnum(n)} on the number line.`, { variant: 'mark', lo, hi, mid, n, ans: String(n), sig: `ol${lo}${hi}${mid}${n}m` }, 3.05, 0.9, 0);
  const f = (n - lo) / span, near = [n], offs = [0.25, -0.25, 0.4, -0.4, 0.5, -0.5];
  for (const o of offs) { const v = Math.round((n + o * span) / st) * st; if (v > lo && v < hi && !near.includes(v) && near.every(w => Math.abs(w - v) >= span * 0.15)) near.push(v); if (near.length === 3) break; }
  if (near.length < 3) return visOpenline(rng, L);
  const opts = shuffle(rng, near.slice()).map(cnum);
  return vp('openline', 'Which number does the point show?', { variant: 'read', lo, hi, mid, n, opts, ans: cnum(n), sig: `ol${lo}${hi}${mid}${n}r` }, 3.05, 1.2, 0);
}
const nrClampV = (v, lo, hi) => Math.max(lo + 1, Math.min(hi - 1, v));
function visOpenlineHtml(p, key, x) {
  const x0 = 22, W = 260, y = 36, X = v => x0 + W * (v - p.lo) / (p.hi - p.lo);
  let o = vline(x0 - 8, y, x0 + W + 8, y, VINK, 2);
  const labs = [p.lo, p.hi].concat(p.mid ? [p.mid] : []);
  for (const v of labs) { o += vline(X(v).toFixed(1), y - 9, X(v).toFixed(1), y + 9, VINK, 2); o += vtxt(X(v).toFixed(1), y + 28, cnum(v)); }
  if (p.variant === 'read') o += `<circle cx="${X(p.n).toFixed(1)}" cy="${y}" r="6.5" fill="${VFILL[1]}" stroke="${VINK}" stroke-width="2"/>`;
  if (p.variant === 'mark' && key) { o += `<circle cx="${X(p.n).toFixed(1)}" cy="${y}" r="6.5" fill="${VKEY}" stroke="${VKEY}" stroke-width="2"/>`; o += vtxt(X(p.n).toFixed(1), y - 16, cnum(p.n), { c: VKEY, b: 1 }); }
  const g = vsvg(3.05, p.variant === 'mark' ? 0.9 : 0.75, o, 'Open number line');
  return p.variant === 'mark' ? g : g + `<div style="white-space:normal">${vopts(p.opts, p.ans, key)}</div>`;
}

defTypes("vis", "Counting and arrays", [
  { id: "genset", label: "Draw a group with more, fewer or the same", blurb: "Draw a group that has more, fewer or the same number of counters as the one shown, up to 20.", on: false, gen: visGenset, html: visGensetHtml }
]);
defTypes("vis", "Number lines", [
  { id: "openline", label: "Open number lines", blurb: "Mark a number on an open line, or read a point, with only the ends and middle labeled.", on: false, gen: visOpenline, html: visOpenlineHtml }
]);
