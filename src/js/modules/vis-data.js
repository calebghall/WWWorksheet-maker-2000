/* ---------- Shapes, Measures and Data: data displays ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

/* Width in em of the one-line caption above a drawn graph (the cell text never wraps). */
const vmk = (cats, cnt) => Math.max(14, (cats.map((c, i) => `${c} ${cnt[i]}`).join(' · ').length + 12) * 0.45);
const V_CATS = [['Cats', 'Dogs', 'Fish'], ['Apples', 'Pears', 'Plums'], ['Soccer', 'Tennis', 'Chess'], ['Red', 'Blue', 'Green'], ['Rain', 'Sun', 'Cloud']];

function vdataSet(rng, L, max, step) {
  const cats = pick(rng, V_CATS).slice(), cnt = shuffle(rng, Array.from({ length: max / step }, (_, i) => (i + 1) * step)).slice(0, 3);
  return { cats, cnt };
}

/* Two questions for any display: how many in all, and how many more in the larger group than a smaller one. */
function vQs(cats, cnt) {
  const hi = cnt.indexOf(Math.max(...cnt)), lo = cnt.indexOf(Math.min(...cnt));
  return { tot: cnt.reduce((a, b) => a + b, 0), hi, lo, diff: cnt[hi] - cnt[lo] };
}

const vQHtml = (p, x) => `<div>How many in all? ${x(p.tot, 2.2)}</div><div>More ${esc(p.cats[p.hi])} than ${esc(p.cats[p.lo])}? ${x(p.diff, 2.2)}</div>`;

/* sort objects into categories and compare */
function visSort(rng, L) {
  const mx = L === 1 ? 6 : L === 2 ? 8 : 10; let a = ri(rng, 2, mx), b;
  do { b = ri(rng, 2, mx); } while (b === a);
  const kinds = shuffle(rng, ['circle', 'square', 'triangle']).slice(0, 2), all = [];
  for (let i = 0; i < a; i++) all.push(0); for (let i = 0; i < b; i++) all.push(1);
  const items = shuffle(rng, all), pts = items.map((_, i) => [22 + 34 * (i % 8), 22 + 38 * Math.floor(i / 8)]), rows = Math.ceil(items.length / 8);
  return vp('sort', 'Count. Circle the group with more.', { kinds, items, pts, a, b, rows, ans: a > b ? kinds[0] : kinds[1], sig: `so${kinds}${items.join('')}`.slice(0, 60) }, 2.9, rows * 0.38 + 0.1, 4.5, 14);
}

function visSortHtml(p, key, x) {
  const o = p.items.map((k, i) => vshape(p.kinds[k], p.pts[i][0], p.pts[i][1], 24, VFILL[k === 0 ? 0 : 1], 0)).join('');
  return vsvg(2.9, p.rows * 0.38 + 0.1, o, 'Mixed shapes') + `<div>${p.kinds.map((k, i) => `${vpl(k, 2)} ${x(i ? p.b : p.a, 1.9)}`).join('&emsp;')}</div><div>${vopts(p.kinds.map(k => vpl(k, 2)), vpl(p.ans, 2), key)}</div>`;
}

/* tally chart */
function visTally(rng, L) {
  const { cats, cnt } = vdataSet(rng, L, L === 1 ? 6 : 12, 1), q = vQs(cats, cnt);
  return vp('tally', 'Read the tally chart.', Object.assign({ cats, cnt, sig: `ta${cats}${cnt}` }, q, { ans: `${q.tot} ${q.diff}` }), 2.9, 1.0, 4.5, 15);
}

function visTallyHtml(p, key, x) {
  let o = '';
  p.cats.forEach((c, i) => { const y = 8 + 30 * i; o += vtxt(4, y + 18, c, { a: 'start', s: 13 }); let cx = 78, n = p.cnt[i];
    while (n > 0) { const k = Math.min(5, n); for (let j = 0; j < Math.min(k, 4); j++) o += vline(cx + 7 * j, y + 2, cx + 7 * j, y + 24, VINK, 2.2); if (k === 5) o += vline(cx - 4, y + 20, cx + 25, y + 6, VINK, 2.2); cx += 40; n -= k; } });
  return vsvg(2.9, 1.0, o, 'Tally chart') + vQHtml(p, x);
}

/* Pictograph: read it or draw it. */
function visPict(rng, L) {
  const step = L === 1 ? 1 : L === 2 ? 2 : pick(rng, [2, 5]), { cats, cnt } = vdataSet(rng, L, step * 6, step), make = L === 3 && rng() < 0.6, q = vQs(cats, cnt);
  return vp('pict', make ? 'Draw the pictograph.' : 'Read the pictograph.', Object.assign({ cats, cnt, step, make, sig: `pi${cats}${cnt}${step}${make}` }, q, { ans: make ? cnt.join(' ') : `${q.tot} ${q.diff}` }), 2.9, make ? 1.25 : 1.2, make ? 2.8 : 4.5, make ? vmk(cats, cnt) : 15);
}

function visPictHtml(p, key, x) {
  let o = '';
  p.cats.forEach((c, i) => { const y = 8 + 30 * i; o += vtxt(4, y + 18, c, { a: 'start', s: 13 }) + vline(78, y + 28, 280, y + 28, '#d4dbe6', 1);
    const n = p.cnt[i] / p.step; if (!p.make || key) for (let j = 0; j < n; j++) o += vshape('circle', 92 + 30 * j, y + 14, 22, p.make ? 'none' : VFILL[i], 0, p.make ? VKEY : VINK); });
  const legend = `Each ● = ${p.step}`;
  if (p.make) return `<div style="font-size:.85em">${p.cats.map((c, i) => `${esc(c)} ${p.cnt[i]}`).join(' · ')}&emsp;${legend}</div>` + vsvg(2.9, 1.0, o, 'Empty pictograph');
  return `<div style="font-size:.85em">${legend}</div>` + vsvg(2.9, 1.0, o, 'Pictograph') + vQHtml(p, x);
}

/* Bar graph with a scale of one: read it or draw it. */
function visBar(rng, L) {
  const { cats, cnt } = vdataSet(rng, L, 9, 1), make = L === 3 && rng() < 0.6, q = vQs(cats, cnt);
  return vp('bar', make ? 'Draw the bar graph.' : 'Read the bar graph.', Object.assign({ cats, cnt, make, sig: `ba${cats}${cnt}${make}` }, q, { ans: make ? cnt.join(' ') : `${q.tot} ${q.diff}` }), 2.9, 1.65, make ? 2.8 : 4.5, make ? vmk(cats, cnt) : 15);
}

function visBarHtml(p, key, x) {
  const x0 = 30, y0 = 140, uh = 11.5; let o = vline(x0, y0, x0, y0 - 9 * uh - 4, VINK, 2) + vline(x0, y0, 280, y0, VINK, 2);
  for (let v = 0; v <= 9; v++) { o += vline(x0 - 4, y0 - v * uh, x0, y0 - v * uh, VINK, 1.2); if (v % 2 === 0) o += vtxt(x0 - 8, y0 - v * uh + 4, String(v), { a: 'end', s: 11 }); if (v) o += vline(x0, y0 - v * uh, 280, y0 - v * uh, '#e3e8f0', 1); }
  p.cats.forEach((c, i) => { const bx = 62 + 76 * i; o += vtxt(bx + 22, y0 + 15, c, { s: 12 }); if (!p.make || key) o += vrect(bx, y0 - p.cnt[i] * uh, 44, p.cnt[i] * uh, p.make ? 'none' : VFILL[i], { c: p.make ? VKEY : VINK, w: p.make ? 3 : 2 }); });
  const gr = vsvg(2.9, 1.65, o, 'Bar graph');
  return p.make ? `<div style="font-size:.85em">${p.cats.map((c, i) => `${esc(c)} ${p.cnt[i]}`).join(' · ')}</div>` + gr : gr + vQHtml(p, x);
}

/* line plot from measurement data */
function visLplot(rng, L) {
  const make = L === 3 ? rng() < 0.6 : L === 2, n = 8, data = Array.from({ length: n }, () => ri(rng, 2, 7)).sort((a, b) => a - b), ask = pick(rng, data);
  return vp('lplot', make ? 'Make a line plot of the data.' : 'Read the line plot.', { make, data, ask, ans: make ? data.join(' ') : String(data.filter(v => v === ask).length), unit: pick(rng, ['inches', 'centimeters']), sig: `lp${data}${make}${make ? '' : ask}` }, 2.9, 1.15, 3.4, 12);
}

function visLplotHtml(p, key, x) {
  const x0 = 24, sc = 36, y = 76; let o = vline(x0 - 6, y, x0 + 7 * sc + 8, y, VINK, 2);
  for (let v = 1; v <= 8; v++) { const xx = x0 + (v - 1) * sc; o += vline(xx, y - 5, xx, y + 5, VINK, 1.5) + vtxt(xx, y + 20, String(v), { s: 12 }); }
  const cnt = {}; p.data.forEach(v => { cnt[v] = (cnt[v] || 0) + 1; });
  if (!p.make || key) Object.keys(cnt).forEach(v => { for (let j = 0; j < cnt[v]; j++) o += vtxt(x0 + (v - 1) * sc, y - 12 - 16 * j, '×', { s: 17, b: 1, c: p.make ? VKEY : VINK }); });
  o += vtxt(x0 + 3.5 * sc, y + 38, p.unit, { s: 11 });
  const gr = vsvg(2.9, 1.15, o, 'Line plot');
  return p.make ? `<div style="font-size:.85em">${p.data.join(', ')}</div>` + gr : gr + `<div>How many measure ${p.ask}? ${x(p.ans, 2.2)}</div>`;
}

/* picture graph and bar graph with four categories (picture symbols worth 1, 2, 5 or 10; bar scale of one) */
const V_CATS4 = [['Cats', 'Dogs', 'Fish', 'Birds'], ['Apples', 'Pears', 'Plums', 'Grapes'], ['Soccer', 'Tennis', 'Chess', 'Swim'], ['Red', 'Blue', 'Green', 'Yellow'], ['Rain', 'Sun', 'Cloud', 'Snow'], ['Pizza', 'Tacos', 'Soup', 'Salad']];

function visPict4(rng, L) {
  const step = pick(rng, L === 1 ? [1, 2] : L === 2 ? [1, 2, 5] : [2, 5, 10]), cats = pick(rng, V_CATS4).slice(), cnt = shuffle(rng, [1, 2, 3, 4, 5, 6].map(i => i * step)).slice(0, 4), make = L === 3 && rng() < 0.6, q = vQs(cats, cnt);
  return vp('pict4', make ? 'Draw the pictograph.' : 'Read the pictograph.', Object.assign({ cats, cnt, step, make, sig: `p4${cats}${cnt}${step}${make}` }, q, { ans: make ? cnt.join(' ') : `${q.tot} ${q.diff}` }), 2.9, 1.3, make ? 2.8 : 4.5, make ? vmk(cats, cnt) : 15);
}

function visPict4Html(p, key, x) {
  let o = '';
  p.cats.forEach((c, i) => { const y = 8 + 30 * i; o += vtxt(4, y + 18, c, { a: 'start', s: 13 }) + vline(78, y + 28, 280, y + 28, '#d4dbe6', 1);
    const n = p.cnt[i] / p.step; if (!p.make || key) for (let j = 0; j < n; j++) o += vshape('circle', 92 + 30 * j, y + 14, 22, p.make ? 'none' : VFILL[i], 0, p.make ? VKEY : VINK); });
  const legend = `Each ● = ${p.step}`, g = vsvg(2.9, 1.3, o, 'Pictograph');
  return p.make ? `<div style="font-size:.85em">${p.cats.map((c, i) => `${esc(c)} ${p.cnt[i]}`).join(' · ')}&emsp;${legend}</div>` + g : `<div style="font-size:.85em">${legend}</div>` + g + vQHtml(p, x);
}

function visBar4(rng, L) {
  const cats = pick(rng, V_CATS4).slice(), cnt = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4), make = L === 3 && rng() < 0.6, q = vQs(cats, cnt);
  return vp('bar4', make ? 'Draw the bar graph.' : 'Read the bar graph.', Object.assign({ cats, cnt, make, sig: `b4${cats}${cnt}${make}` }, q, { ans: make ? cnt.join(' ') : `${q.tot} ${q.diff}` }), 2.9, 1.65, make ? 2.8 : 4.5, make ? vmk(cats, cnt) : 15);
}

function visBar4Html(p, key, x) {
  const x0 = 30, y0 = 140, uh = 11.5; let o = vline(x0, y0, x0, y0 - 9 * uh - 4, VINK, 2) + vline(x0, y0, 280, y0, VINK, 2);
  for (let v = 0; v <= 9; v++) { o += vline(x0 - 4, y0 - v * uh, x0, y0 - v * uh, VINK, 1.2) + vtxt(x0 - 7, y0 - v * uh + 3.5, String(v), { a: 'end', s: 10 }); if (v) o += vline(x0, y0 - v * uh, 280, y0 - v * uh, '#e3e8f0', 1); }
  p.cats.forEach((c, i) => { const bx = 50 + 58 * i; o += vtxt(bx + 20, y0 + 15, c, { s: 11 }); if (!p.make || key) o += vrect(bx, y0 - p.cnt[i] * uh, 40, p.cnt[i] * uh, p.make ? 'none' : VFILL[i], { c: p.make ? VKEY : VINK, w: p.make ? 3 : 2 }); });
  const gr = vsvg(2.9, 1.65, o, 'Bar graph');
  return p.make ? `<div style="font-size:.85em">${p.cats.map((c, i) => `${esc(c)} ${p.cnt[i]}`).join(' · ')}</div>` + gr : gr + vQHtml(p, x);
}

/* -----: scaled pictograph and scaled bar graph, five categories ----- */
const G3_CATS = [['Soccer', 'Tennis', 'Chess', 'Swim', 'Golf'], ['Cats', 'Dogs', 'Fish', 'Birds', 'Mice'], ['Apples', 'Pears', 'Plums', 'Grapes', 'Kiwis'], ['Red', 'Blue', 'Green', 'Yellow', 'Pink'], ['Pizza', 'Tacos', 'Soup', 'Salad', 'Pasta'], ['Rain', 'Sun', 'Cloud', 'Snow', 'Wind']];

const vhalf = (cx, cy, s, fill, stroke) => `<path d="M${cx} ${cy - s / 2}A${s / 2} ${s / 2} 0 0 0 ${cx} ${cy + s / 2}Z" fill="${fill}" stroke="${stroke || VINK}" stroke-width="2" stroke-linejoin="round"/>`;

function g3Graph(rng, L, bar) {
  const step = pick(rng, L === 1 ? [2] : L === 2 ? [2, 5] : [2, 5, 10]), g = bar ? (step === 5 ? 5 : L === 1 ? 2 : step === 2 ? 1 : 5) : (L >= 2 && step % 2 === 0 ? step / 2 : step), nc = L === 1 ? 4 : 5;
  const vals = []; for (let v = g; v <= (bar ? 7 : 6) * step; v += g) vals.push(v);
  const cats = pick(rng, G3_CATS).slice(0, nc), cnt = shuffle(rng, vals).slice(0, nc), make = L === 3 && rng() < 0.6, q = vQs(cats, cnt);
  let two = null;
  if (L === 3 && !make && rng() < 0.5) { const c = q.lo, o = shuffle(rng, [0, 1, 2, 3, 4].slice(0, nc).filter(i => i !== c)).slice(0, 2); two = { a: o[0], b: o[1], c, ans: cnt[o[0]] + cnt[o[1]] - cnt[c] }; }
  return { step, g, cats, cnt, make, two, q };
}

function g3Pictg(rng, L) {
  const d = g3Graph(rng, L, false), p = vp('pictg', d.make ? 'Draw the pictograph.' : 'Read the pictograph.', Object.assign({ half: d.step % 2 === 0 && L >= 2, ans: d.make ? d.cnt.join(' ') : `${d.q.tot} ${d.q.diff}`, sig: `pg${d.cats}${d.cnt}${d.step}${d.make}${d.two ? d.two.a + '' + d.two.b : ''}` }, d, d.q), 2.95, 1.5, d.make ? 5.5 : d.two ? 7.7 : 6.2, 15);
  return p;
}

function g3Qhtml(p, x) { return vQHtml(p, x) + (p.two ? `<div>How many more ${esc(p.cats[p.two.a])} and ${esc(p.cats[p.two.b])} than ${esc(p.cats[p.two.c])}? ${x(p.two.ans, 2)}</div>` : ''); }

function g3PictgHtml(p, key, x) {
  let o = '';
  p.cats.forEach((c, i) => { const y = 6 + 28 * i; o += vtxt(4, y + 18, c, { a: 'start', s: 12 }) + vline(72, y + 26, 285, y + 26, '#d4dbe6', 1);
    const full = Math.floor(p.cnt[i] / p.step), hf = p.cnt[i] % p.step ? 1 : 0, col = p.make ? 'none' : VFILL[i % 4], st = p.make ? VKEY : VINK;
    if (!p.make || key) { for (let j = 0; j < full; j++) o += vshape('circle', 86 + 28 * j, y + 13, 20, col, 0, st); if (hf) o += vhalf(86 + 28 * full, y + 13, 20, col, st); } });
  const legend = `Each ● = ${p.step}${p.half ? `, half ● = ${p.step / 2}` : ''}`, g = vsvg(2.95, 1.5, o, 'Pictograph');
  if (p.make) return `<div style="font-size:.85em">${legend}</div><div style="font-size:.85em">${p.cats.slice(0, 3).map((c, i) => `${esc(c)} ${p.cnt[i]}`).join(' · ')}</div><div style="font-size:.85em">${p.cats.slice(3).map((c, i) => `${esc(c)} ${p.cnt[i + 3]}`).join(' · ')}</div>` + g;
  return `<div style="font-size:.85em">${legend}</div>` + g + g3Qhtml(p, x);
}

function g3Barg(rng, L) {
  const d = g3Graph(rng, L, true);
  return vp('barg', d.make ? 'Draw the bar graph.' : 'Read the bar graph.', Object.assign({ ans: d.make ? d.cnt.join(' ') : `${d.q.tot} ${d.q.diff}`, sig: `bg${d.cats}${d.cnt}${d.step}${d.make}${d.two ? d.two.a + '' + d.two.b : ''}` }, d, d.q), 2.95, 1.75, d.make ? 5.5 : d.two ? 6.2 : 4.7, 15);
}

function g3BargHtml(p, key, x) {
  const x0 = 36, y0 = 130, uh = 15, s = p.step; let o = vline(x0, y0, x0, y0 - 7 * uh - 4, VINK, 2) + vline(x0, y0, 290, y0, VINK, 2);
  for (let v = 0; v <= 7; v++) { o += vline(x0 - 4, y0 - v * uh, x0, y0 - v * uh, VINK, 1.2) + vtxt(x0 - 7, y0 - v * uh + 3.5, String(v * s), { a: 'end', s: 10 }); if (v) o += vline(x0, y0 - v * uh, 290, y0 - v * uh, '#e3e8f0', 1); }
  p.cats.forEach((c, i) => { const bx = 50 + 48 * i, h = p.cnt[i] / s * uh; o += vtxt(bx + 16, y0 + 14, c, { s: 9.5 }); if (!p.make || key) o += vrect(bx, y0 - h, 32, h, p.make ? 'none' : VFILL[i % 4], { c: p.make ? VKEY : VINK, w: p.make ? 3 : 2 }); });
  const g = vsvg(2.95, 1.75, o, 'Bar graph');
  return p.make ? `<div style="font-size:.85em">${p.cats.slice(0, 3).map((c, i) => `${esc(c)} ${p.cnt[i]}`).join(' · ')}</div><div style="font-size:.85em">${p.cats.slice(3).map((c, i) => `${esc(c)} ${p.cnt[i + 3]}`).join(' · ')}</div>` + g : g + g3Qhtml(p, x);
}

function g3Lplotq(rng, L) {
  const den = L === 1 ? 2 : L === 2 ? pick(rng, [2, 4]) : 4, stepQ = 4 / den, pos = []; for (let q = 4; q <= 16; q += stepQ) pos.push(q);
  const data = []; let guard = 0; while (data.length < 8 && guard++ < 200) { const v = pick(rng, pos); if (data.filter(t => t === v).length < 3) data.push(v); } data.sort((a, b) => a - b);
  const make = L === 3 ? rng() < 0.6 : L === 2 && rng() < 0.4, qk = !make && L === 3 && rng() < 0.4 ? 'diff' : 'count', ask = pick(rng, data);
  const ans = make ? data.map(vmx).join(' ') : qk === 'diff' ? vmx(data[7] - data[0]) : String(data.filter(v => v === ask).length);
  return vp('lplotq', make ? 'Make a line plot of the data.' : 'Read the line plot.', { make, den, data, qk, ask, ans, sig: `lq${den}${data}${make}${make ? '' : qk + (qk === 'count' ? ask : '')}` }, 3.0, 1.4, make ? 4.5 : 3.4, 12);
}

function g3LplotqHtml(p, key, x) {
  const x0 = 26, t = 21, y = 92; let o = vline(x0 - 8, y, x0 + 12 * t + 8, y, VINK, 2);
  for (let q = 4; q <= 16; q += 4 / p.den) { const xx = x0 + (q - 4) * t, lab = q % 2 === 0; o += vline(xx, y - (q % 4 === 0 ? 7 : 5), xx, y + (q % 4 === 0 ? 7 : 5), VINK, 1.5); if (lab) o += vtxt(xx, y + 21, vmx(q), { s: 11 }); }
  const cnt = {}; p.data.forEach(v => { cnt[v] = (cnt[v] || 0) + 1; });
  if (!p.make || key) Object.keys(cnt).forEach(v => { for (let j = 0; j < cnt[v]; j++) o += vtxt(x0 + (v - 4) * t, y - 12 - 15 * j, '×', { s: 17, b: 1, c: p.make ? VKEY : VINK }); });
  o += vtxt(x0 + 6 * t, y + 38, 'inches', { s: 11 });
  const g = vsvg(3.0, 1.4, o, 'Line plot');
  if (p.make) return `<div style="font-size:.85em">${p.data.slice(0, 4).map(vmx).join(', ')},</div><div style="font-size:.85em">${p.data.slice(4).map(vmx).join(', ')} in</div>` + g;
  return g + (p.qk === 'diff' ? `<div>Longest − shortest: ${x(p.ans, 2.4)} in</div>` : `<div>How many measure ${vmx(p.ask)} in? ${x(p.ans, 2)}</div>`);
}

defTypes("vis", "Data displays", [
  { id: "sort", label: "Sort and compare", blurb: "Count two groups and say which has more.", on: true, gen: visSort, html: visSortHtml },
  { id: "tally", label: "Tally chart", blurb: "Read a tally chart.", on: false, gen: visTally, html: visTallyHtml },
  { id: "pict", label: "Pictograph", blurb: "Read, or draw from a table.", on: false, gen: visPict, html: visPictHtml },
  { id: "bar", label: "Bar graph", blurb: "Read, or draw from a table.", on: false, gen: visBar, html: visBarHtml },
  { id: "lplot", label: "Line plot", blurb: "Read, or make from measurements.", on: false, gen: visLplot, html: visLplotHtml },
  { id: "pict4", label: "Pictograph, four categories", blurb: "Symbols worth 1, 2, 5 or 10.", on: false, gen: visPict4, html: visPict4Html },
  { id: "bar4", label: "Bar graph, four categories", blurb: "Scale of one; read or draw.", on: false, gen: visBar4, html: visBar4Html },
  { id: "pictg", label: "Scaled pictograph", blurb: "Symbols worth 2, 5 or 10, with half symbols.", on: false, gen: g3Pictg, html: g3PictgHtml },
  { id: "barg", label: "Scaled bar graph", blurb: "Scales of 2, 5 or 10; one- and two-step questions.", on: false, gen: g3Barg, html: g3BargHtml },
  { id: "lplotq", label: "Line plot: halves and fourths", blurb: "Read or make a line plot of measurements.", on: false, gen: g3Lplotq, html: g3LplotqHtml }
]);
