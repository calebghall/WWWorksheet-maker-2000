/* ---------- area: shapes { cols, rows, cells: [[c, r], ...] } ---------- */
function rectShape(w, h) { const cells = []; for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) cells.push([c, r]); return { cols: w, rows: h, cells }; }
function lShape(W, H, cw, ch, corner) {
  const x0 = corner.includes('r') ? W - cw : 0, y0 = corner.includes('b') ? H - ch : 0, cells = [];
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (!(c >= x0 && c < x0 + cw && r >= y0 && r < y0 + ch)) cells.push([c, r]);
  return { cols: W, rows: H, cells };
}
function polyShape(rng, n, cols, rows) {
  const seen = new Set(), list = [];
  let c = ri(rng, 0, cols - 1), r = ri(rng, 0, rows - 1);
  seen.add(c + ',' + r); list.push([c, r]);
  let guard = 0;
  while (list.length < n && guard++ < 800) {
    const [bc, br] = pick(rng, list), d = pick(rng, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
    const nc = bc + d[0], nr = br + d[1];
    if (nc < 0 || nr < 0 || nc >= cols || nr >= rows || seen.has(nc + ',' + nr)) continue;
    seen.add(nc + ',' + nr); list.push([nc, nr]);
  }
  const minC = Math.min(...list.map(a => a[0])), minR = Math.min(...list.map(a => a[1]));
  const maxC = Math.max(...list.map(a => a[0])), maxR = Math.max(...list.map(a => a[1]));
  return { cols: maxC - minC + 1, rows: maxR - minR + 1, cells: list.map(([c, r]) => [c - minC, r - minR]) };
}

/* ---------- area: problem generators ---------- */
function genCount(rng, L) {
  const P = LEVELS[L];
  if (rng() < (L === 1 ? 0.5 : 0.4)) {
    const s = polyShape(rng, ri(rng, P.poly.minN, P.poly.maxN), P.poly.cols, P.poly.rows);
    return { type: 'count', kind: 'poly', shape: s, area: s.cells.length };
  }
  let w, h, g = 0;
  do { w = ri(rng, P.rect.min, P.rect.max); h = ri(rng, P.rect.min, P.rect.max); g++; } while ((w * h > P.rect.area || w * h < 4) && g < 80);
  if (w * h > P.rect.area || w * h < 4) { w = 3; h = 2; }
  return { type: 'count', kind: 'rect', shape: rectShape(w, h), area: w * h };
}
function genMult(rng, L) {
  const P = LEVELS[L].mult;
  let w, h, g = 0;
  do { w = ri(rng, P.min, P.max); h = ri(rng, P.min, P.max); g++; } while (w === h && rng() < 0.7 && g < 20);
  if (h > w && rng() < 0.6) { const t = w; w = h; h = t; }
  return { type: 'mult', w, h, area: w * h, grid: P.grid };
}
function genDraw(rng, L) {
  const P = LEVELS[L].draw;
  let w, h, g = 0;
  do { w = ri(rng, 2, P.cols); h = ri(rng, 2, P.rows); g++; } while (w * h > P.maxArea && g < 100);
  if (w * h > P.maxArea) { w = 3; h = 4; }
  return { type: 'draw', cols: P.cols, rows: P.rows, area: w * h, sample: { w, h, ox: ri(rng, 0, P.cols - w), oy: ri(rng, 0, P.rows - h) } };
}
function genLsh(rng, L) {
  const P = LEVELS[L].lsh;
  const W = ri(rng, P.min, P.max), H = ri(rng, P.min, P.max);
  const cwMax = Math.max(1, W - 2), chMax = Math.max(1, H - 2);
  const cw = ri(rng, Math.min(L === 3 ? 2 : 1, cwMax), cwMax), ch = ri(rng, Math.min(L === 3 ? 2 : 1, chMax), chMax);
  const corner = pick(rng, ['tl', 'tr', 'bl', 'br']);
  return { type: 'lsh', W, H, cw, ch, corner, shape: lShape(W, H, cw, ch, corner), area: W * H - cw * ch, labels: P.labels };
}
function genCmp(rng, L) {
  const P = LEVELS[L].cmp;
  const mkRect = (w, h) => ({ shape: rectShape(w, h), area: w * h });
  const mkAny = () => {
    if (P.max >= 3 && rng() < 0.3) {
      const W = ri(rng, Math.max(3, P.min), P.max), H = ri(rng, Math.max(3, P.min), P.max);
      const s = lShape(W, H, ri(rng, 1, Math.max(1, W - 2)), ri(rng, 1, Math.max(1, H - 2)), pick(rng, ['tl', 'tr', 'bl', 'br']));
      return { shape: s, area: s.cells.length };
    }
    return mkRect(ri(rng, P.min, P.max), ri(rng, P.min, P.max));
  };
  let A, B;
  if (rng() < 0.25) {
    const byArea = {};
    for (let w = P.min; w <= P.max; w++) for (let h = w; h <= P.max; h++) (byArea[w * h] = byArea[w * h] || []).push([w, h]);
    const areas = Object.keys(byArea).filter(a => +a >= 4 && byArea[a].length >= 2);
    if (areas.length) {
      const pairs = shuffle(rng, byArea[pick(rng, areas)]);
      const o = ([w, h]) => rng() < 0.5 ? [w, h] : [h, w];
      const a = o(pairs[0]), b = o(pairs[1]);
      A = mkRect(a[0], a[1]); B = mkRect(b[0], b[1]);
    }
  }
  if (!A) {
    for (let i = 0; i < 80; i++) {
      const a = mkAny(), b = mkAny(), d = Math.abs(a.area - b.area);
      if (a.area >= 4 && b.area >= 4 && d >= 1 && d <= Math.max(4, Math.round(a.area * 0.3))) { A = a; B = b; break; }
    }
    if (!A) { A = mkRect(3, 4); B = mkRect(2, 5); }
  }
  return { type: 'cmp', a: A, b: B, ans: A.area === B.area ? 'S' : (A.area > B.area ? 'A' : 'B') };
}
const GEN = { count: genCount, mult: genMult, draw: genDraw, cmp: genCmp, lsh: genLsh };

function sig(p) {
  switch (p.type) {
    case 'count': return 'c' + p.shape.cols + 'x' + p.shape.rows + ':' + p.area + p.kind;
    case 'mult': return 'm' + Math.min(p.w, p.h) + 'x' + Math.max(p.w, p.h);
    case 'draw': return 'd' + p.area;
    case 'cmp': return 'p' + p.a.area + '/' + p.b.area;
    default: return 'l' + p.W + 'x' + p.H + ':' + p.cw + 'x' + p.ch;
  }
}

function genAreaN(rng, st, n, chunk) {
  const ids = TYPE_IDS.filter(id => st.types[id]);
  return genMixed(rng, ids.length ? ids : ['count'], n, chunk, (id, r) => GEN[id](r, st.level), sig);
}
/* ---------- area: drawing ---------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function padsFor(labels) {
  const p = { l: 5, t: 5, r: 5, b: 5 };
  for (const L of labels || []) {
    const tw = L.text.length * 7.6;
    if (L.side === 'top') p.t = 32;
    if (L.side === 'bottom') p.b = 32;
    if (L.side === 'left') p.l = Math.max(p.l, 22 + tw);
    if (L.side === 'right') p.r = Math.max(p.r, 22 + tw);
  }
  return p;
}
function fitCell(cols, rows, maxWin, maxHin, pads, cap) {
  const mw = maxWin * 96 - pads.l - pads.r, mh = maxHin * 96 - pads.t - pads.b;
  return Math.max(10, Math.floor(Math.min((cap || 0.4) * 96, mw / cols, mh / rows)));
}
function dim(x1, y1, x2, y2) {
  const horiz = y1 === y2, t = 3.5;
  const d = horiz ? `M${x1} ${y1}H${x2}M${x1} ${y1 - t}V${y1 + t}M${x2} ${y1 - t}V${y1 + t}` : `M${x1} ${y1}V${y2}M${x1 - t} ${y1}H${x1 + t}M${x1 - t} ${y2}H${x1 + t}`;
  return `<path d="${d}" stroke="var(--ink)" stroke-width="1.2" fill="none"/>`;
}
function svg(o) {
  const cols = o.cols, rows = o.rows, cpx = o.cpx, pads = padsFor(o.labels);
  const W = cols * cpx, H = rows * cpx, vbW = W + pads.l + pads.r, vbH = H + pads.t + pads.b;
  const cells = o.cells || [], set = new Set(cells.map(([c, r]) => c + ',' + r));
  const key = o.tone === 'key', fillCol = key ? 'var(--keyfill)' : 'var(--fill)', edgeCol = key ? 'var(--key)' : 'var(--ink)';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${(vbW / 96).toFixed(3)}in" height="${(vbH / 96).toFixed(3)}in" viewBox="${-pads.l} ${-pads.t} ${vbW} ${vbH}" role="img" aria-label="${esc(o.aria || 'Grid of squares')}">`;
  if (o.shade !== false && cells.length) {
    let f = ''; for (const [c, r] of cells) f += `M${c * cpx} ${r * cpx}h${cpx}v${cpx}h${-cpx}z`;
    s += `<path d="${f}" fill="${fillCol}" shape-rendering="crispEdges"/>`;
  }
  if (o.grid !== false) {
    let g = ''; for (let i = 0; i <= cols; i++) g += `M${i * cpx} 0V${H}`; for (let j = 0; j <= rows; j++) g += `M0 ${j * cpx}H${W}`;
    s += `<path d="${g}" stroke="var(--grid)" stroke-width="1" fill="none"/>`;
    s += `<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="var(--grid2)" stroke-width="1.2"/>`;
  }
  let e = '';
  for (const [c, r] of cells) {
    const x = c * cpx, y = r * cpx;
    if (!set.has(c + ',' + (r - 1))) e += `M${x} ${y}h${cpx}`;
    if (!set.has(c + ',' + (r + 1))) e += `M${x} ${y + cpx}h${cpx}`;
    if (!set.has((c - 1) + ',' + r)) e += `M${x} ${y}v${cpx}`;
    if (!set.has((c + 1) + ',' + r)) e += `M${x + cpx} ${y}v${cpx}`;
  }
  if (e) s += `<path d="${e}" stroke="${edgeCol}" stroke-width="2.4" stroke-linecap="square" fill="none"/>`;
  for (const L of o.labels || []) {
    const t = esc(L.text);
    if (L.side === 'top') s += dim(0, -9, W, -9) + `<text class="lab" x="${W / 2}" y="-15" text-anchor="middle">${t}</text>`;
    if (L.side === 'bottom') s += dim(0, H + 9, W, H + 9) + `<text class="lab" x="${W / 2}" y="${H + 24}" text-anchor="middle">${t}</text>`;
    if (L.side === 'left') s += dim(-9, 0, -9, H) + `<text class="lab" x="-15" y="${H / 2}" text-anchor="end" dominant-baseline="central">${t}</text>`;
    if (L.side === 'right') s += dim(W + 9, 0, W + 9, H) + `<text class="lab" x="${W + 15}" y="${H / 2}" text-anchor="start" dominant-baseline="central">${t}</text>`;
  }
  for (const n of o.notes || []) s += `<text class="lab" x="${n.x * cpx}" y="${n.y * cpx}" text-anchor="${n.anchor || 'middle'}" dominant-baseline="central">${esc(n.text)}</text>`;
  return s + '</svg>';
}

/* ---------- area: problems ---------- */
const blank = (v, cls) => `<span class="blank ${cls || ''}">${v === '' || v == null ? '&nbsp;' : v}</span>`;

function renderProblem(p, n, ctx) {
  const U = ctx.U, key = ctx.key;
  let q = '', fig = '', ans = '', work = '', cls = '';
  if (p.type === 'count') {
    const s = p.shape, cpx = fitCell(s.cols, s.rows, ctx.figW, ctx.figH, padsFor([]));
    fig = svg({ cols: s.cols, rows: s.rows, cpx, cells: s.cells, shade: ctx.shade, aria: `Shape on a grid, ${s.cols} squares wide and ${s.rows} tall` });
    q = 'Count the squares to find the area.';
    ans = `Area = ${blank(key ? p.area : '')} ${U.area}`;
  } else if (p.type === 'mult') {
    const labels = [{ side: 'top', text: `${p.w} ${U.len}` }, { side: 'left', text: `${p.h} ${U.len}` }];
    const cpx = fitCell(p.w, p.h, ctx.figW, ctx.figH - 0.12, padsFor(labels));
    fig = svg({ cols: p.w, rows: p.h, cpx, cells: rectShape(p.w, p.h).cells, grid: p.grid, shade: ctx.shade, labels, aria: `Rectangle ${p.w} by ${p.h}` });
    q = 'Find the area of this rectangle.';
    ans = `Area = ${blank(key ? p.w : '', 's')} × ${blank(key ? p.h : '', 's')} = ${blank(key ? p.area : '', 's')} ${U.area}`;
  } else if (p.type === 'draw') {
    const cpx = fitCell(p.cols, p.rows, ctx.figW, ctx.figH, padsFor([]));
    const sm = p.sample, cells = [];
    if (key) for (let r = 0; r < sm.h; r++) for (let c = 0; c < sm.w; c++) cells.push([sm.ox + c, sm.oy + r]);
    fig = svg({ cols: p.cols, rows: p.rows, cpx, cells, tone: 'key', shade: ctx.shade, aria: `Blank grid, ${p.cols} squares wide and ${p.rows} tall` });
    q = `Draw a rectangle that has an area of ${p.area} ${U.area}.`;
    if (key) ans = `<span style="color:var(--key);font-weight:700">One answer: ${sm.w} × ${sm.h} = ${p.area}</span>`;
  } else if (p.type === 'cmp') {
    const fw = (ctx.figW - 0.25) / 2, fh = ctx.figH - 0.26, pads = padsFor([]);
    const cpx = Math.min(fitCell(p.a.shape.cols, p.a.shape.rows, fw, fh, pads, 0.3), fitCell(p.b.shape.cols, p.b.shape.rows, fw, fh, pads, 0.3));
    const mk = (x, name) => `<figure><figcaption>${name}</figcaption>${svg({ cols: x.shape.cols, rows: x.shape.rows, cpx, cells: x.shape.cells, shade: ctx.shade, aria: `Shape ${name}, ${x.shape.cols} squares wide and ${x.shape.rows} tall` })}</figure>`;
    fig = mk(p.a, 'A') + mk(p.b, 'B'); cls = ' cmp';
    q = 'Which shape has the greater area? Circle your answer.';
    const opt = (id, t) => `<span class="opt${key && p.ans === id ? ' on' : ''}">${t}</span>`;
    ans = opt('A', 'A') + opt('B', 'B') + opt('S', 'Same');
    if (key) work = `A = ${p.a.area} · B = ${p.b.area} ${U.area}`;
  } else {
    const s = p.shape, hasLab = p.labels;
    const isT = p.corner.includes('t'), isR = p.corner.includes('r');
    let labels = [], notes = [];
    if (hasLab) {
      labels = [{ side: isT ? 'bottom' : 'top', text: `${p.W} ${U.len}` }, { side: isR ? 'left' : 'right', text: `${p.H} ${U.len}` }];
      const x0 = isR ? p.W - p.cw : 0, y0 = p.corner.includes('b') ? p.H - p.ch : 0;
      notes = [
        { x: x0 + p.cw / 2, y: isT ? p.ch - 0.5 : p.H - p.ch + 0.5, text: String(p.cw) },
        { x: isR ? p.W - p.cw + 0.3 : p.cw - 0.3, y: y0 + p.ch / 2, text: String(p.ch), anchor: isR ? 'start' : 'end' }
      ];
    }
    const cpx = fitCell(s.cols, s.rows, ctx.figW, ctx.figH - 0.1, padsFor(labels));
    fig = svg({ cols: s.cols, rows: s.rows, cpx, cells: s.cells, grid: !hasLab, shade: ctx.shade, labels, notes, aria: `L-shaped figure, ${s.cols} squares wide and ${s.rows} tall` });
    q = hasLab ? 'Find the area of this L-shaped figure.' : 'Find the area of this L-shaped figure. Count the squares, or split it into two rectangles.';
    ans = `Area = ${blank(key ? p.area : '')} ${U.area}`;
    if (key) work = `${p.W} × ${p.H} − ${p.cw} × ${p.ch} = ${p.area}`;
  }
  return `<section class="prob"><div class="p-head"><span class="p-num">${n}</span><p class="p-q">${esc(q)}</p></div><div class="p-fig${cls}">${fig}</div>${ans ? `<div class="p-ans">${ans}</div>` : ''}${work ? `<div class="p-work">${work}</div>` : ''}</section>`;
}

function geom(paper, perPage) {
  const P = PAPER[paper], rows = perPage / 2, gridH = P.h - 2.4, gap = 0.15;
  return { P, rows, boxW: (P.w - 1.1 - 0.18) / 2, boxH: (gridH - gap * (rows - 1)) / rows };
}

function renderAreaSheet(st, probs, pageIdx, key, G, base) {
  const ctx = Object.assign({}, base, { key, figH: G.boxH - 1.0 - (key ? 0.18 : 0) });
  const body = probs.map((p, i) => renderProblem(p, pageIdx * st.perPage + i + 1, ctx)).join('');
  return sheetShell(st, key, pageIdx, UNITS[st.unit].intro, `<div class="sh-grid" style="--rows:${G.rows}">${body}</div>`);
}

REG.area = {
  name: 'Area Squares', counts: [2, 4, 6, 8], n0: 4,
  plan(st, n, seed) {
    const P = PAPER[st.paper], boxW = (P.w - 1.1 - 0.18) / 2, rowH = 2.4, U = UNITS[st.unit];
    return {
      sub: U.intro, probs: genAreaN(rngFrom(seed), st, n, n), cols: 2, rowH, gap: 0.15, cls: 'area', style: '',
      cell: (p, num, key) => renderProblem(p, num, { U, shade: st.shade, figW: boxW - 0.32, figH: rowH - 1.0 - (key ? 0.18 : 0), key })
    };
  }
};
