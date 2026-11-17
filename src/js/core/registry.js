const REG = {};
/* Arithmetic section: pack mixed-size problems with flowPack so short items don't inherit tall row heights;
   otherwise pick the biggest type size and column count for a uniform grid. */
function arithPlan(st, mod, probs) {
  const horiz = modFormat(st, mod) === 'horizontal', cw = PAPER[st.paper].w - 1.1;
  const sizes = horiz ? [15, 13, 11.5, 10] : [16, 14, 12, 10.5, 9], colsList = horiz ? [3, 2, 1] : [6, 5, 4, 3, 2];
  let pick_ = null;
  for (const fs of sizes) { for (const cols of colsList) {
    const cellW = (cw - 0.15 * (cols - 1)) / cols;
    if (probs.every(p => needSize(p, fs, horiz)[0] <= cellW)) { pick_ = { fs, cols }; break; }
  } if (pick_) break; }
  if (!pick_) pick_ = { fs: sizes[sizes.length - 1], cols: 2 };
  const heights = probs.map(p => needSize(p, pick_.fs, horiz)[1]);
  const mixed = probs.length > 1 && (Math.max(...heights) - Math.min(...heights) > 0.35 || pick_.cols === 1);
  if (mixed && typeof flowPack === 'function') {
    let fs = 10, fSizes = null;
    for (const cand of horiz ? [11, 10] : [12, 11, 10]) {
      const raw = probs.map(p => {
        const [w, h] = needSize(p, cand, horiz), key = (p.mod || mod) + ':' + p.type + (!horiz && (mod === 'addsub' || mod === 'muldiv') ? ':v' : '');
        const [rw, rh] = (typeof FLOW_FIT !== 'undefined' && FLOW_FIT[key]) || [1, 1];
        const rawW = rw === 1 ? w + 0.02 : w * Math.min(1, 1.06 / rw);
        const fitH = rh === 1 ? h : h * Math.min(1, 1.06 / rh);
        return { rawW, w: Math.min(rawW, cw), h: Math.ceil(fitH * 20) / 20 };
      });
      if (cand === 10 || raw.every(s => s.rawW <= cw)) { fs = cand; fSizes = raw; break; }
    }
    const rows = flowPack(fSizes, rngFrom((st.seed || '') + '|flow|' + mod), cw, Infinity, 0.15, 0.1)[0].rows;
    const rowFrom = []; let c = 0;
    for (const r of rows) { rowFrom.push(c); c += r.idx.length; }
    return {
      sub: arSub(st, mod, probs), probs, flowRows: rows, gap: 0.1, fs,
      cell: (p, num, key) => renderArithCell(p, num, horiz, key),
      flowHtml: (a, b, start, key) => rows.slice(a, b).map((r, k) =>
        `<div class="fl-row" style="height:${r.h}in">` + r.idx.map((i, j) =>
          `<div class="fl-c" style="grid-column:span ${r.span[j]}">${renderArithCell(probs[i], start + rowFrom[a + k] + j, horiz, key)}</div>`
        ).join('') + '</div>'
      ).join('')
    };
  }
  const rowH = Math.ceil(Math.max(...heights) * 20) / 20;
  return {
    sub: arSub(st, mod, probs), probs, cols: pick_.cols, rowH, gap: 0.1, cls: 'ar', style: `--fs:${pick_.fs}pt`,
    cell: (p, num, key) => renderArithCell(p, num, horiz, key)
  };
}
