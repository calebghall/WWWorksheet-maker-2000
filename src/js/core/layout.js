/* Smallest space a problem needs, in inches, at font size fs (pt). */
function needSize(p, fs, horiz) {
  if (p.mod) return modNeed(p, fs);
  const f = fs / 72;
  if (horiz) {
    const ansLen = cnum(p.type === 'div' ? p.q : p.ans).length, bw = (p.type === 'div' && p.rem) ? 1.9 + 0.1 * Math.max(0, ansLen - 4) : Math.max(1.0, (ansLen + 1) * 0.6 * f);
    return [(hText(p).length + 3) * 0.6 * f + bw + 0.45, f * 1.7 + 0.2];
  }
  let w, rowsEm;
  if (p.type === 'div') {
    const dl = cnum(p.d).length, nl = cnum(p.n).length, qs = cnum(p.q).length + (p.rem ? 4 + cnum(p.r).length - 1 : 0);
    w = Math.max(dl + nl + 1.6, qs + 1) * DGW * f + 0.2;
    rowsEm = 3.5 + nl * 0.9;
  } else {
    let cells;
    if (p.type === 'add') { cells = Math.max(String(p.ans).length, ...p.nums.map(x => String(x).length)); rowsEm = p.nums.length + 1.6; }
    else if (p.type === 'sub') { cells = String(p.a).length; rowsEm = 3.6; }
    else { cells = String(p.ans).length; rowsEm = p.pp ? String(p.b).length + 4 : 3.6; }
    w = (cells * DGW + Math.floor((cells - 1) / 3) * 0.3 + OPW) * f + 0.2;
  }
  return [w, rowsEm * ROWH * f + 0.3];
}

/* Single-module layout. Tries the requested problems per page first, then fewer when the problems are too big to fit. */
const AR_TOTALS = [30, 20, 12, 8, 6, 4];
const AR_COLS = {
  vertical: { 30: [6, 5], 20: [5, 4], 12: [4, 3], 8: [4, 2], 6: [3, 2], 4: [2] },
  horizontal: { 30: [3, 2], 20: [2], 12: [2], 8: [2, 1], 6: [2, 1], 4: [2, 1] }
};
function arLayout(st, probs, mod) {
  mod = mod || st.module;
  const horiz = modFormat(st, mod) === 'horizontal', fmt = horiz ? 'horizontal' : 'vertical';
  const P = PAPER[st.paper], cw = P.w - 1.1, chh = P.h - 2.4;
  const sizes = horiz ? [15, 13, 11.5, 10] : [16, 14, 12, 10.5, 9];
  for (const total of AR_TOTALS.filter(t => t <= st.arPerPage)) {
    for (const fs of sizes) for (const cols of AR_COLS[fmt][total]) {
      const rows = total / cols, cellW = (cw - 0.15 * (cols - 1)) / cols, cellH = (chh - 0.1 * (rows - 1)) / rows;
      if (probs.every(p => { const [nw, nh] = needSize(p, fs, horiz); return nw <= cellW && nh <= cellH; })) return { cols, rows, fs, horiz, total, fits: true };
    }
  }
  return { cols: 2, rows: 2, fs: sizes[sizes.length - 1], horiz, total: 4, fits: false };
}
function arSub(st, mod) {
  mod = mod || st.module;
  if (mod === 'addsub' || mod === 'ns' || mod === 'tm') return 'Solve each problem.';
  if (mod === 'vis') return 'Look at each picture and answer.';
  if (mod === 'fdp') return 'Solve each problem. Write fractions in simplest form.';
  return st.md.div && st.md.rem ? 'Solve each problem. Write remainders with R.' : 'Solve each problem.';
}
const META = { problems: 0, pages: 0, note: '' };
function renderArithAll(st) {
  const probs = generateSet(st), lay = arLayout(st, probs), total = lay.total;
  const sheet = (key, i) => {
    const slice = probs.slice(i * total, (i + 1) * total);
    const cells = slice.map((p, k) => renderArithCell(p, i * total + k + 1, lay.horiz, key)).join('');
    return sheetShell(st, key, i, arSub(st), `<div class="sh-grid ar" style="--cols:${lay.cols};--rows:${lay.rows};--fs:${lay.fs}pt">${cells}</div>`);
  };
  let out = '';
  for (let i = 0; i < st.pages; i++) out += sheet(false, i);
  if (st.key) for (let i = 0; i < st.pages; i++) out += sheet(true, i);
  META.problems = total * st.pages; META.pages = st.pages;
  META.note = total < st.arPerPage ? `${total} per page, the most that fit at this size` : '';
  return out;
}

