/* ===== Flow layout =====
   Packs problems of mixed sizes onto pages on a 12-column grid, so cell edges line up from row to row.
   sizes[i] = { w, h } in inches (the space problem i needs).
   1. Each problem gets a column span: the narrowest of FLOW_SPANS that is wide enough.
   2. Problems are shuffled, then ordered by height band (tallest first), so each row holds problems of similar height.
   3. A row is filled until its spans reach 12; a look-ahead picks the later problem that fills the most of the gap.
      Spare columns widen cells to the next span size (at most 1.5 times their need), so rows end nearly flush at the right edge.
   4. Rows are shuffled, then placed on the first page with room, so topics stay interspersed across the page.
   Returns pages: [{ h, rows: [{ h, idx: [problem indexes], span: [column spans] }] }]. */
const FLOW_COLS = 12, FLOW_SPANS = [2, 3, 4, 6, 8, 12], FLOW_BAND = 0.25, FLOW_LOOK = 14;
const flowSpanW = (s, cw, gx) => s * ((cw - (FLOW_COLS - 1) * gx) / FLOW_COLS) + (s - 1) * gx;   // width of s columns
function flowSpan(w, cw, gx) { return FLOW_SPANS.find(s => flowSpanW(s, cw, gx) >= w - 0.02) || FLOW_COLS; }
function flowPack(sizes, rng, cw, bodyH, gx, gy) {
  const band = i => Math.round(sizes[i].h / FLOW_BAND), sp = sizes.map(s => flowSpan(s.w, cw, gx));
  const rest = shuffle(rng, sizes.map((s, i) => i)).sort((a, b) => band(b) - band(a));
  const rows = [];
  while (rest.length) {
    const idx = [rest.shift()], b0 = band(idx[0]);
    let used = sp[idx[0]];
    while (used < FLOW_COLS) {
      let best = -1;
      for (let k = 0; k < rest.length && k < FLOW_LOOK; k++) {
        if (used >= 8 && band(rest[k]) < b0 - 1) break;   // a mostly empty row may take shorter problems of any height
        if (sp[rest[k]] <= FLOW_COLS - used && (best < 0 || sp[rest[k]] > sp[rest[best]])) best = k;
      }
      if (best < 0) break;
      const j = rest.splice(best, 1)[0]; idx.push(j); used += sp[j];
    }
    /* widen the cells into the spare columns, widest cell first */
    const span = idx.map(i => sp[i]);
    for (let spare = FLOW_COLS - used, again = true; spare > 0 && again;) {
      again = false;
      for (const k of span.map((s, k) => k).sort((a, b) => span[b] - span[a])) {
        const nx = FLOW_SPANS.find(s => s > span[k]);
        if (nx && nx - span[k] <= spare && nx <= sp[idx[k]] * 1.5) { spare -= nx - span[k]; span[k] = nx; again = true; break; }
      }
    }
    rows.push({ idx, span, h: Math.max(...idx.map(i => sizes[i].h)) });
  }
  const pages = [];
  for (const r of shuffle(rng, rows)) {
    let pg = pages.find(p => p.h + (p.rows.length ? gy : 0) + r.h <= bodyH + 1e-9);
    if (!pg) { pg = { h: 0, rows: [] }; pages.push(pg); }
    pg.h += (pg.rows.length ? gy : 0) + r.h; pg.rows.push(r);
  }
  return pages;
}
