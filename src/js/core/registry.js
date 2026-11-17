/* ===== Module registry =====
   REG maps a module id to { name, counts, n0, [on0], plan(st, n, seed) }. Each module file registers itself with REG.<id> = {...}.
   plan(st, n, seed) returns { sub, probs, cols, rowH, gap, cls, style, cell(problem, number, isKey) }.
   See CLAUDE.md for the full checklist for adding a module. */
const REG = {};
/* Arithmetic section: pick the biggest type size and column count where every problem fits the width; rows take the height they need. */
function arithPlan(st, mod, probs) {
  const horiz = modFormat(st, mod) === 'horizontal', cw = PAPER[st.paper].w - 1.1;
  const sizes = horiz ? [15, 13, 11.5, 10] : [16, 14, 12, 10.5, 9], colsList = horiz ? [3, 2, 1] : [6, 5, 4, 3, 2];
  let pick_ = null;
  for (const fs of sizes) { for (const cols of colsList) {
    const cellW = (cw - 0.15 * (cols - 1)) / cols;
    if (probs.every(p => needSize(p, fs, horiz)[0] <= cellW)) { pick_ = { fs, cols }; break; }
  } if (pick_) break; }
  if (!pick_) pick_ = { fs: sizes[sizes.length - 1], cols: 2 };
  const rowH = Math.ceil(Math.max(...probs.map(p => needSize(p, pick_.fs, horiz)[1])) * 20) / 20;
  return {
    sub: arSub(st, mod, probs), probs, cols: pick_.cols, rowH, gap: 0.1, cls: 'ar', style: `--fs:${pick_.fs}pt`,
    cell: (p, num, key) => renderArithCell(p, num, horiz, key)
  };
}

