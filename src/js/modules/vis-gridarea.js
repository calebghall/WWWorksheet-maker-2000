/* ---------- Shapes, Measures and Data: area on grids (the Area Squares problems as grid cells) ----------
   Count the squares, multiply the sides, draw a rectangle, compare two shapes and find the area of an L-shape. These were the Area Squares
   module's own card layout; here they are ordinary cells (size hints win/hin), so they share the grid and flow layouts with every other type.
   The shapes and generators are the Area Squares ones (area.js). Units and shading are worksheet settings (state.unit, state.shade); the generator
   reads them from GRID_CTX, which genGeomN and the legacy paths set before generating, and bakes them into the problem. */
const GRID_CTX = { unit: 'units', shade: true };
const GA_W = 3.0, GA_H = 1.65;   // the figure box, in inches
const gaUnit = p => UNITS[p.unit || 'units'];
function gaBase(id, raw, prompt, o) {
  const pads = padsFor(o.labels || []), cpx = fitCell(o.cols, o.rows, o.fw || GA_W, o.fh || GA_H, pads, o.cap);
  const w = (o.cols * cpx + pads.l + pads.r) / 96, h = (o.rows * cpx + pads.t + pads.b) / 96;
  return Object.assign({ mod: 'vis', prompt, win: o.win || w, hin: o.hin || h + (o.extra || 0), hfs: 0, bw: o.bw || 0, unit: GRID_CTX.unit, shade: GRID_CTX.shade, cpx, sig: sig(raw) + GRID_CTX.unit }, raw, { type: id });
}
function gaCount(rng, L) {
  const r = genCount(rng, L), s = r.shape;
  return gaBase('acount', r, 'Count the squares to find the area.', { cols: s.cols, rows: s.rows, bw: 17, extra: 0.46 });
}
function gaCountHtml(p, key, x) {
  const s = p.shape, U = gaUnit(p);
  return svg({ cols: s.cols, rows: s.rows, cpx: p.cpx, cells: s.cells, shade: p.shade, aria: `Shape on a grid, ${s.cols} squares wide and ${s.rows} tall` }) + `<div>Area = ${x(p.area, 2.4)} ${U.area}</div>`;
}
const gaMultLabels = (p, U) => [{ side: 'top', text: `${p.w} ${U.len}` }, { side: 'left', text: `${p.h} ${U.len}` }];
function gaMult(rng, L) {
  const r = genMult(rng, L), U = UNITS[GRID_CTX.unit];
  return gaBase('amult', r, 'Find the area of this rectangle.', { cols: r.w, rows: r.h, labels: gaMultLabels(r, U), fh: GA_H - 0.1, bw: 19, extra: 0.46 });
}
function gaMultHtml(p, key, x) {
  const U = gaUnit(p), labels = gaMultLabels(p, U);
  return svg({ cols: p.w, rows: p.h, cpx: p.cpx, cells: rectShape(p.w, p.h).cells, grid: p.grid, shade: p.shade, labels, aria: `Rectangle ${p.w} by ${p.h}` })
    + `<div>Area = ${x(p.w, 1.4)} × ${x(p.h, 1.4)} = ${x(p.area, 2)} ${U.area}</div>`;
}
function gaDraw(rng, L) {
  const r = genDraw(rng, L), U = UNITS[GRID_CTX.unit], sm = r.sample;
  /* The blank grid varies a little in size (one column or row fewer when the sample rectangle still fits), so the same area is not always the same drawing. */
  if (ri(rng, 0, 1) && sm.ox + sm.w <= r.cols - 1) r.cols--;
  if (ri(rng, 0, 1) && sm.oy + sm.h <= r.rows - 1) r.rows--;
  const p = gaBase('adraw', r, `Draw a rectangle of area ${r.area} ${U.area}.`, { cols: r.cols, rows: r.rows, bw: 14, extra: 0.46 });
  p.sig = `d${r.area}${GRID_CTX.unit}${r.cols}x${r.rows}`; return p;
}
function gaDrawHtml(p, key, x) {
  const sm = p.sample, cells = [];
  if (key) for (let r = 0; r < sm.h; r++) for (let c = 0; c < sm.w; c++) cells.push([sm.ox + c, sm.oy + r]);
  return svg({ cols: p.cols, rows: p.rows, cpx: p.cpx, cells, tone: 'key', shade: p.shade, aria: `Blank grid, ${p.cols} squares wide and ${p.rows} tall` })
    + (key ? `<div style="color:var(--key);font-weight:700">One answer: ${sm.w} × ${sm.h} = ${p.area}</div>` : '');
}
function gaCmp(rng, L) {
  const r = genCmp(rng, L), fw = (GA_W - 0.25) / 2, fh = GA_H - 0.26, pads = padsFor([]);
  const cpx = Math.min(fitCell(r.a.shape.cols, r.a.shape.rows, fw, fh, pads, 0.3), fitCell(r.b.shape.cols, r.b.shape.rows, fw, fh, pads, 0.3));
  const wa = (r.a.shape.cols * cpx + 10) / 96, wb = (r.b.shape.cols * cpx + 10) / 96, hh = (Math.max(r.a.shape.rows, r.b.shape.rows) * cpx + 10) / 96;
  const p = gaBase('acmp', r, 'Which shape has the greater area?', { cols: 1, rows: 1, win: wa + wb + 0.25, hin: hh + 0.3 + 0.82, bw: 19 });
  p.cpx = cpx; return p;
}
function gaCmpHtml(p, key, x) {
  const mk = (s, name) => `<figure><figcaption>${name}</figcaption>${svg({ cols: s.shape.cols, rows: s.shape.rows, cpx: p.cpx, cells: s.shape.cells, shade: p.shade, aria: `Shape ${name}, ${s.shape.cols} squares wide and ${s.shape.rows} tall` })}</figure>`;
  const opt = (id, t) => `<span class="opt${key && p.ans === id ? ' on' : ''}" style="min-width:0">${t}</span>`;
  return `<div class="p-fig cmp ga">${mk(p.a, 'A')}${mk(p.b, 'B')}</div><div>${opt('A', 'A')}${opt('B', 'B')}${opt('S', 'Same')}</div>`
    + (key ? `<div style="font-size:.85em">A = ${p.a.area} · B = ${p.b.area} ${gaUnit(p).area}</div>` : '');
}
function gaLsh(rng, L) {
  const r = genLsh(rng, L), U = UNITS[GRID_CTX.unit], g = gaLshParts(r, U);
  return gaBase('alsh', r, 'Find the area of this L-shaped figure.',
    { cols: r.shape.cols, rows: r.shape.rows, labels: g.labels, fh: GA_H - 0.1, bw: 17, extra: 0.74 });
}
function gaLshParts(p, U) {
  let labels = [], notes = [];
  if (p.labels) {
    const isT = p.corner.includes('t'), isR = p.corner.includes('r'), x0 = isR ? p.W - p.cw : 0, y0 = p.corner.includes('b') ? p.H - p.ch : 0;
    labels = [{ side: isT ? 'bottom' : 'top', text: `${p.W} ${U.len}` }, { side: isR ? 'left' : 'right', text: `${p.H} ${U.len}` }];
    notes = [
      { x: x0 + p.cw / 2, y: isT ? p.ch - 0.5 : p.H - p.ch + 0.5, text: String(p.cw) },
      { x: isR ? p.W - p.cw + 0.3 : p.cw - 0.3, y: y0 + p.ch / 2, text: String(p.ch), anchor: isR ? 'start' : 'end' }
    ];
  }
  return { labels, notes };
}
function gaLshHtml(p, key, x) {
  const U = gaUnit(p), g = gaLshParts(p, U), s = p.shape;
  return svg({ cols: s.cols, rows: s.rows, cpx: p.cpx, cells: s.cells, grid: !p.labels, shade: p.shade, labels: g.labels, notes: g.notes, aria: `L-shaped figure, ${s.cols} squares wide and ${s.rows} tall` })
    + `<div>Area = ${x(p.area, 2.4)} ${U.area}</div>` + (key ? `<div style="font-size:.85em">${p.W} × ${p.H} − ${p.cw} × ${p.ch} = ${p.area}</div>` : '');
}
defTypes("vis", "Area on grids", [
  { id: "acount", label: "Count squares for area", blurb: "Count the unit squares in a shape on a grid.", on: false, gen: gaCount, html: gaCountHtml },
  { id: "amult", label: "Area of a rectangle", blurb: "Multiply the side lengths of a labeled rectangle on a grid.", on: false, gen: gaMult, html: gaMultHtml },
  { id: "adraw", label: "Draw a rectangle with a given area", blurb: "Draw a rectangle on a blank grid.", on: false, gen: gaDraw, html: gaDrawHtml },
  { id: "acmp", label: "Compare areas on grids", blurb: "Which of two shapes has the greater area.", on: false, gen: gaCmp, html: gaCmpHtml },
  { id: "alsh", label: "Area of an L-shaped figure", blurb: "Count squares or split into two rectangles.", on: false, gen: gaLsh, html: gaLshHtml }
]);
