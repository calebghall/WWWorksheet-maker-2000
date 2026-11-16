/* ---------- combined worksheet ---------- */
function comboSections(st) {
  const secs = [], parts = partsOf(st), total = {}, used = {}, scope = {}; let num = 1;
  for (const p of parts) total[p.m] = (total[p.m] || 0) + 1;
  for (let i = 0; i < parts.length; i++) {
    const group = [parts[i]];
    while (i + 1 < parts.length && parts[i + 1].mix && MIX_MODS.includes(group[0].m) && MIX_MODS.includes(parts[i + 1].m)) {
      group.push(parts[++i]);
    }
    const letter = String.fromCharCode(65 + secs.length);
    if (group.length > 1) {
      for (const p of group) used[p.m] = (used[p.m] || 0) + 1;
      const plan = mixRunPlan(st, group, st.seed + '|mixrun|' + secs.length, scope);
      secs.push({ id: 'mix', name: group[0].label || 'Mixed Practice', plan, start: num, letter, part: group[0], parts: group });
      num += plan.probs.length;
      continue;
    }
    const p = group[0], id = p.m, k = used[id] = (used[id] || 0) + 1;
    /* The first part of a module keeps the seed an unsplit section always had; later parts add their position. */
    const seed = st.seed + '|' + id + (k > 1 ? '|' + k : '');
    if (total[id] > 1) SIG_SCOPE = scope[id] || (scope[id] = new Set());
    let plan;
    try { plan = REG[id].plan(partState(st, p), p.n, seed); } finally { SIG_SCOPE = null; }
    secs.push({ id, name: p.label || REG[id].name, plan, start: num, letter, part: p });
    num += plan.probs.length;
  }
  return secs;
}
/* Packs section rows onto pages in order. A section that does not fit continues on the next page. */
function comboPages(st, secs) {
  const bodyH = PAPER[st.paper].h - 2.22, HEAD = 0.36, SECG = 0.16, pages = [];
  let cur = null;
  const fresh = () => { cur = { h: 0, parts: [] }; pages.push(cur); };
  for (const sec of secs) {
    if (sec.plan.flowRows) {
      /* Row-based section (Mixed Practice): rows have their own heights. */
      const rows = sec.plan.flowRows, gap = sec.plan.gap;
      let i = 0, first = true;
      while (i < rows.length) {
        if (!cur) fresh();
        const used = cur.h + (cur.parts.length ? SECG : 0) + HEAD;
        let k = 0, h = 0;
        while (i + k < rows.length) { const add = (k ? gap : 0) + rows[i + k].h; if (used + h + add > bodyH + 1e-9) break; h += add; k++; }
        if (k < 1) { if (cur.parts.length) { fresh(); continue; } k = 1; h = rows[i].h; }
        cur.parts.push({ sec, fromRow: i, toRow: i + k, cont: !first });
        cur.h = used + h; i += k; first = false;
      }
      continue;
    }
    const { cols, rowH, gap } = sec.plan, n = sec.plan.probs.length;
    let i = 0, first = true;
    while (i < n) {
      if (!cur) fresh();
      const used = cur.h + (cur.parts.length ? SECG : 0) + HEAD;
      let k = Math.floor((bodyH - used + gap) / (rowH + gap));
      if (k < 1) { if (cur.parts.length) { fresh(); continue; } k = 1; }
      k = Math.min(k, Math.ceil((n - i) / cols));
      const cnt = Math.min(n - i, k * cols);
      cur.parts.push({ sec, from: i, to: i + cnt, cont: !first });
      cur.h = used + k * rowH + (k - 1) * gap;
      i += cnt; first = false;
    }
  }
  return pages;
}
function renderCombo(st) {
  const secs = comboSections(st);
  if (!secs.length) { META.problems = 0; META.pages = 0; META.note = ''; return '<p class="empty">Select at least one section.</p>'; }
  const pages = comboPages(st, secs), st2 = Object.assign({}, st, { pages: pages.length });
  const make = key => pages.map((pg, i) => {
    const body = pg.parts.map(pt => {
      const pl = pt.sec.plan, head = `<div class="sec-h"><span class="sec-l">Part ${pt.sec.letter}</span><b>${esc(pt.sec.name)}${pt.cont ? ' (continued)' : ''}</b><span class="sec-i">${esc(pl.sub)}</span></div>`;
      if (pl.flowRows) return `<section class="sec">${head}<div class="flow" style="--fs:${pl.fs}pt">${pl.flowHtml(pt.fromRow, pt.toRow, pt.sec.start, key)}</div></section>`;
      const cells = pl.probs.slice(pt.from, pt.to).map((p, j) => pl.cell(p, pt.sec.start + pt.from + j, key)).join('');
      return `<section class="sec">${head}`
        + `<div class="sh-grid sec-grid ${pl.cls}" style="--cols:${pl.cols};--rh:${pl.rowH}in;--gap:${pl.gap}in;${pl.style}">${cells}</div></section>`;
    }).join('');
    return sheetShell(st2, key, i, 'Complete every part.', `<div class="secs">${body}</div>`);
  }).join('');
  META.problems = secs.reduce((a, s) => a + s.plan.probs.length, 0); META.pages = pages.length; META.note = '';
  return make(false) + (st.key ? make(true) : '');
}

