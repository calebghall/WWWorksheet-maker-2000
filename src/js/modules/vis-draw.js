/* ---------- Shapes, Measures and Data: SVG drawing helpers and shared data ----------
   Helpers shared by more than one family file. Included before the family files. */

const VINK = 'var(--ink)', VKEY = 'var(--key)', VFILL = ['var(--c0)', 'var(--c1)', 'var(--c2)', 'var(--c3)'];

const vsvg = (w, h, inner, label) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}in" height="${h}in" viewBox="0 0 ${Math.round(w * 100)} ${Math.round(h * 100)}" role="img" aria-label="${esc(label)}" style="display:block">${inner}</svg>`;

const vtxt = (x, y, t, o) => `<text x="${x}" y="${y}" font-size="${(o && o.s) || 13}" text-anchor="${(o && o.a) || 'middle'}" fill="${(o && o.c) || VINK}"${o && o.b ? ' font-weight="700"' : ''}>${esc(t)}</text>`;

const vline = (x1, y1, x2, y2, c, w) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c || VINK}" stroke-width="${w || 2}" stroke-linecap="round"/>`;

const vrect = (x, y, w, h, fill, o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill || 'none'}" stroke="${(o && o.c) || VINK}" stroke-width="${(o && o.w) || 2}"${o && o.r ? ` rx="${o.r}"` : ''}${o && o.d ? ` stroke-dasharray="${o.d}"` : ''}/>`;

const vring = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="${VKEY}" stroke-width="3"/>`;

const vpoly = (pts, fill, rot, cx, cy, stroke) => `<polygon points="${pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="${fill}" stroke="${stroke || VINK}" stroke-width="2" stroke-linejoin="round"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;

const vreg = (n, cx, cy, r, off) => Array.from({ length: n }, (_, i) => { const a = (off || 0) + i * 2 * Math.PI / n - Math.PI / 2; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });

function vshape(k, cx, cy, s, fill, rot, stroke) {
  const r = s / 2;
  switch (k) {
    case 'circle': return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke || VINK}" stroke-width="2"/>`;
    case 'square': return vpoly([[cx - r, cy - r], [cx + r, cy - r], [cx + r, cy + r], [cx - r, cy + r]], fill, rot, cx, cy, stroke);
    case 'rectangle': return vpoly([[cx - s * .75, cy - s * .4], [cx + s * .75, cy - s * .4], [cx + s * .75, cy + s * .4], [cx - s * .75, cy + s * .4]], fill, rot, cx, cy, stroke);
    case 'triangle': return vpoly([[cx, cy - r], [cx + r * 1.1, cy + r * .8], [cx - r * 1.1, cy + r * .8]], fill, rot, cx, cy, stroke);
    case 'hexagon': return vpoly(vreg(6, cx, cy, r * 1.05, 0), fill, rot, cx, cy, stroke);
    case 'pentagon': return vpoly(vreg(5, cx, cy, r * 1.05, 0), fill, rot, cx, cy, stroke);
    case 'rhombus': return vpoly([[cx, cy - r], [cx + r * .7, cy], [cx, cy + r], [cx - r * .7, cy]], fill, rot, cx, cy, stroke);
    default: return vpoly([[cx - r * .55, cy - r * .7], [cx + r * .55, cy - r * .7], [cx + r * 1.1, cy + r * .7], [cx - r * 1.1, cy + r * .7]], fill, rot, cx, cy, stroke);   // trapezoid
  }
}

const vp = (type, prompt, f, win, hin, hfs, bw) => Object.assign({ mod: 'vis', type, prompt, win, hin, hfs, bw: bw || 0 }, f);

const vcap = n => String(n);

const vpl = (shape, n) => n === 1 ? shape : shape + 's';

const vopts = (arr, ans, key) => arr.map(o => `<span class="opt${key && ans === o ? ' on' : ''}" style="min-width:0">${o}</span>`).join('');

/* ----- ,: compare length, height and weight;: order three objects ----- */
const V_LET = ['A', 'B', 'C'];

const vtext = (type, prompt, f, ew, eh, wide) => Object.assign({ mod: 'vis', type, prompt, ew, eh, wide: !!wide }, f);

/* Stacked fraction in SVG: numerator over a bar over the denominator, bar at y. */
const vfrac = (x, y, n, d, o) => {
  const s = (o && o.s) || 12, c = (o && o.c) || VINK, w = Math.max(String(n).length, String(d).length) * s * 0.62 + 4;
  return vtxt(x, y - 3, String(n), { s, c, b: o && o.b }) + vline(x - w / 2, y, x + w / 2, y, c, 1.2) + vtxt(x, y + s * 0.85, String(d), { s, c, b: o && o.b });
};

/* Height in em of a wrapped text cell: prompt, wrapped text lines (about 34 characters per line), an options row, and any extra lines. */
const g3eh = (lens, optLen, extra) => 1.1 + lens.reduce((a, n) => a + Math.ceil(n / 34), 0) * 1.45 + (optLen ? Math.ceil(optLen / 18) * 1.7 : 0) + 0.6 + (extra || 0);

const g3optLen = arr => arr.reduce((a, o) => a + String(o).length * 0.6 + 1, 0);

/* -----: rulers marked in halves and fourths of an inch; line plots with halves and fourths ----- */
function vmx(q) { const w = Math.floor(q / 4), r = q % 4, f = r === 0 ? '' : r === 2 ? '½' : r === 1 ? '¼' : '¾'; return w || !f ? `${w}${f}` : f; }
