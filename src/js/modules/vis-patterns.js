/* ---------- Shapes, Measures and Data: patterns and charts ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

/* -----: repeating patterns. Next shape, or the length of the core. ----- */
const V_PCORE = { AB: [0, 1], AAB: [0, 0, 1], ABB: [0, 1, 1], ABC: [0, 1, 2] };

const V_TOK = [{ k: 'circle', f: VFILL[0] }, { k: 'square', f: VFILL[1] }, { k: 'triangle', f: VFILL[2] }];

function visPat(rng, L) {
  const name = L === 1 ? 'AB' : pick(rng, ['AAB', 'ABB', 'ABC', 'AB']), core = V_PCORE[name], tk = shuffle(rng, [0, 1, 2]), seqOf = n => Array.from({ length: n }, (_, i) => tk[core[i % core.length]]);
  if (L === 3 && rng() < 0.45) { const reps = core.length === 2 ? 4 : 3, seq = seqOf(core.length * reps);
    return vp('pat', 'How long is the core (repeating part)?', { variant: 'core', name, seq, ans: String(core.length), sig: `pc${name}${seq}` }, 3.3, 0.5, 3.4, 6); }
  const seq = seqOf(6), nxt = seqOf(7)[6], order = shuffle(rng, [0, 1, 2]);
  return vp('pat', 'Circle the shape that comes next.', { variant: 'next', name, seq, order, ans: String(order.indexOf(nxt)), sig: `pn${name}${seq}${order}` }, 2.7, 1.15, 1.9);
}

function visPatHtml(p, key, x) {
  const sh = (t, cx, cy) => vshape(V_TOK[t].k, cx, cy, 28, V_TOK[t].f, 0);
  if (p.variant === 'core') return vsvg(3.3, 0.5, p.seq.map((t, i) => sh(t, 22 + 36 * i, 25)).join(''), 'Pattern') + `<div>${x(p.ans, 2.4)}</div>`;
  let o = p.seq.map((t, i) => sh(t, 22 + 36 * i, 24)).join('') + vrect(22 + 36 * 6 - 16, 24 - 16, 32, 32, 'none', { d: '4 3', r: 4 });
  o += vline(10, 56, 260, 56, '#b6c0d0', 1);
  o += p.order.map((t, i) => sh(t, 50 + 60 * i, 90)).join('');
  if (key) o += vring(50 + 60 * +p.ans - 26, 90 - 26, 52, 52);
  return vsvg(2.7, 1.15, o, 'Pattern with a missing shape and three choices');
}

/* patterns in hundreds charts and addition charts */
function visChart(rng, L) {
  const kind = L === 1 ? 'hund' : L === 2 ? 'add' : pick(rng, ['hund', 'add', 'rule']);
  if (kind === 'add') { const r0 = ri(rng, 0, 5), c0 = ri(rng, 0, 5), blanks = shuffle(rng, Array.from({ length: 16 }, (_, i) => i)).slice(0, 3);
    return vp('chart', 'Fill in the addition chart.', { kind, r0, c0, blanks, ans: blanks.map(b => (r0 + Math.floor(b / 4)) + (c0 + b % 4)).join(' '), sig: `ca${r0}-${c0}-${[...blanks].sort((a, b) => a - b)}` }, 2.5, 1.8, 1.9); }
  const row = ri(rng, 0, 5), col = ri(rng, 1, 6), blanks = shuffle(rng, Array.from({ length: 20 }, (_, i) => i)).slice(0, kind === 'rule' ? 0 : 4);
  if (kind === 'rule') return vp('chart', 'Look at the chart. Fill in the rule.', { kind, row, col, blanks, ans: '1 10', sig: `cr${row}${col}` }, 2.5, 1.3, 4.9, 12);
  return vp('chart', 'Fill in the missing numbers.', { kind, row, col, blanks, ans: blanks.map(b => (row + Math.floor(b / 5)) * 10 + col + b % 5).join(' '), sig: `ch${row}${col}${blanks}` }, 2.5, 1.55, 1.9);
}

function visChartHtml(p, key, x) {
  const cw = 46, ch = 30; let o = '';
  const cell = (i, j, txt, blank, head) => { const xx = 8 + cw * j, yy = 6 + ch * i; return vrect(xx, yy, cw, ch, head ? '#e8eef7' : 'none', { c: '#8d99ad', w: 1.3 }) + (blank ? (key ? vtxt(xx + cw / 2, yy + 20, String(txt), { s: 14, b: 1, c: VKEY }) : '') : vtxt(xx + cw / 2, yy + 20, String(txt), { s: 14, b: head })); };
  if (p.kind === 'add') { for (let j = 0; j < 5; j++) o += cell(0, j, j ? p.c0 + j - 1 : '+', false, true); for (let i = 1; i < 5; i++) for (let j = 0; j < 5; j++) { const b = (i - 1) * 4 + (j - 1); o += j === 0 ? cell(i, 0, p.r0 + i - 1, false, true) : cell(i, j, (p.r0 + i - 1) + (p.c0 + j - 1), p.blanks.includes(b)); } return vsvg(2.5, 1.8, o.replace(/(<rect[^>]*)(\/>)/, '$1$2'), 'Addition chart').replace('height="1.8in"', 'height="1.8in"'); }
  const rows = p.kind === 'rule' ? 4 : 4;
  for (let i = 0; i < rows; i++) for (let j = 0; j < 5; j++) { const v = (p.row + i) * 10 + p.col + j, b = i * 5 + j; o += cell(i, j, v, p.kind === 'hund' && p.blanks.includes(b)); }
  const g = vsvg(2.5, 1.3, o, 'Part of a hundreds chart').replace('height="1.55in"', 'height="1.3in"');
  return g + (p.kind === 'rule' ? `<div>Moving right adds ${x(1, 1.8)}</div><div>Moving down adds ${x(10, 1.8)}</div>` : '');
}

/* make a repeating pattern in the empty boxes */
const V_PM = { AB: [0, 1], AAB: [0, 0, 1], ABB: [0, 1, 1], ABC: [0, 1, 2] };

function visPatmake(rng, L) {
  const name = L === 1 ? 'AB' : pick(rng, L === 2 ? ['AAB', 'ABB', 'AB'] : ['AAB', 'ABB', 'ABC', 'AB']), core = V_PM[name], tk = shuffle(rng, [0, 1, 2]).slice(0, name === 'ABC' ? 3 : 2);
  const seq = Array.from({ length: 8 }, (_, i) => tk[core[i % core.length]]);
  return vp('patmake', `Make an ${name} pattern.`, { name, tk, seq, ans: seq.join(''), sig: `pm${name}${tk}` }, 2.95, 0.95, 1.9);
}

function visPatmakeHtml(p, key) {
  let o = '';
  p.tk.forEach((t, i) => { o += vtxt(14 + 85 * i, 23, 'ABC'[i] + ' =', { a: 'start', s: 14, b: 1 }) + vshape(V_TOK[t].k, 70 + 85 * i, 18, 24, V_TOK[t].f, 0); });
  for (let i = 0; i < 8; i++) { o += vrect(8 + 36 * i, 46, 32, 32, 'none', { d: '4 3', r: 4 }); if (key) o += vshape(V_TOK[p.seq[i]].k, 24 + 36 * i, 62, 24, 'none', 0, VKEY); }
  return vsvg(2.95, 0.95, o, 'Legend and eight empty boxes');
}

/* Free-response "Why are the shaded numbers the same?" for a chart with two mirrored shaded cells. Every such problem has the same sig, so a worksheet
   keeps one and draws a different kind for the rest. The student writes on three lines; the key shows a model answer split across them. */
const V_EXPLAIN_SIG = 'chartexplain';
function vExplainAns(add, a, b) {
  const sym = add ? '+' : '\u00d7', t = `${a} ${sym} ${b} and ${b} ${sym} ${a} both equal ${add ? a + b : a * b} because the order of the ${add ? 'addends' : 'factors'} does not change the ${add ? 'sum' : 'product'}.`, w = t.split(' ');
  const lim = Math.ceil(t.length / 3) + 2, out = ['']; for (const x of w) { if (out[out.length - 1] && (out[out.length - 1] + ' ' + x).length > lim && out.length < 3) out.push(''); out[out.length - 1] += (out[out.length - 1] ? ' ' : '') + x; }
  return out;
}
const vExplainHtml = (lines, key) => lines.map(t => `<div><span class="blank" style="min-width:21em;text-align:left;font-weight:600">${key ? esc(t) : '&nbsp;'}</span></div>`).join('');

/* why does the chart pattern work? Finish the sentence that names the property. */
function visChartwhy(rng) {
  const kind = pick(rng, ['explain', 'next', 'next']), r0 = ri(rng, 0, 4);
  if (kind === 'explain') {
    const i = ri(rng, 1, 3), j = ri(rng, 0, i - 1), lines = vExplainAns(true, r0 + i, r0 + j);
    return vp('chartwhy', 'Write why the shaded numbers are the same.', { kind, r0, cells: [[i, j], [j, i]], lines, ans: lines.join(' '), sig: V_EXPLAIN_SIG }, 3.3, 1.5, 7.4, 22);
  }
  /* two shaded cells d steps apart in one row or one column: the second number is d more than the first */
  const d = ri(rng, 1, 3), row = rng() < 0.5, i = ri(rng, 0, row ? 3 : 3 - d), j = ri(rng, 0, row ? 3 - d : 3), c2 = row ? [i, j + d] : [i + d, j];
  const a = r0 + i + r0 + j, b = r0 + c2[0] + r0 + c2[1];
  return vp('chartwhy', 'Use the shaded cells. Fill in the blank.', { kind, r0, cells: [[i, j], c2], a, b, d, row, ans: String(d), sig: `cw${r0}${i}${j}${d}${row}` }, 3.3, 1.5, 4.9, 22);
}

function visChartwhyHtml(p, key, x) {
  const cw = 46, ch = 30; let o = '';
  const cell = (i, j, txt, head, shade) => { const xx = 8 + cw * j, yy = 6 + ch * i; return vrect(xx, yy, cw, ch, head ? '#e8eef7' : shade ? VFILL[0] : 'none', { c: '#8d99ad', w: 1.3 }) + vtxt(xx + cw / 2, yy + 20, String(txt), { s: 14, b: head }); };
  for (let j = 0; j < 5; j++) o += cell(0, j, j ? p.r0 + j - 1 : '+', true);
  for (let i = 1; i < 5; i++) for (let j = 0; j < 5; j++) o += j === 0 ? cell(i, 0, p.r0 + i - 1, true) : cell(i, j, (p.r0 + i - 1) + (p.r0 + j - 1), false, p.cells.some(c => c[0] === i - 1 && c[1] === j - 1));
  const svg = vsvg(2.5, 1.55, o, 'Addition chart with shaded cells');
  if (p.kind === 'explain') return svg + vExplainHtml(p.lines, key);
  return svg + `<div>${p.a} and ${p.b} are ${p.d === 1 ? 'next to each other' : p.d + ' cells apart'} in the ${p.row ? 'row' : 'column'}.</div><div>The second number is ${x(p.ans, 2)} more than the first.</div>`;
}

/* -----: patterns in the multiplication chart ----- */
function g3Mchart(rng, L) {
  const kind = pick(rng, L === 1 ? ['fill', 'explain'] : L === 2 ? ['fill', 'explain', 'row'] : ['fill', 'explain', 'row', 'plus']), top = L === 1 ? 3 : L === 2 ? 6 : 7;
  if (kind === 'fill') { const r0 = ri(rng, 1, top), c0 = ri(rng, 1, top), bl = shuffle(rng, Array.from({ length: 16 }, (_, i) => i)).slice(0, 3).sort((a, b) => a - b);
    return vp('mchart', 'Fill in the missing products.', { kind, r0, c0, blanks: bl, cells: [], ans: bl.map(b => (r0 + Math.floor(b / 4)) * (c0 + b % 4)).join(' '), sig: `mcf${r0}${c0}${bl}` }, 2.5, 1.55, 1.9); }
  if (kind === 'explain') { const s = ri(rng, 1, top), i = ri(rng, 1, 3), j = ri(rng, 0, i - 1), lines = vExplainAns(false, s + i, s + j);
    return vp('mchart', 'Write why the shaded numbers are the same.', { kind, r0: s, c0: s, cells: [[i, j], [j, i]], q: '', lines, ans: lines.join(' '), sig: V_EXPLAIN_SIG }, 3.3, 1.55, 7.4, 22); }
  if (kind === 'row') { const f = pick(rng, [2, 4, 5, 6, 8, 10].filter(q => q <= top + 3)), r0 = ri(rng, Math.max(1, f - 3), Math.min(top, f)), c0 = ri(rng, 1, top), i = f - r0;
    const q = f === 5 ? 'What are the last digits of the shaded products?' : f === 10 ? 'What is the last digit of each shaded product?' : 'Are the shaded products even or odd?', opts = f === 5 ? ['0 or 5', '0 or 2'] : f === 10 ? ['0', '5'] : ['even', 'odd'];
    return vp('mchart', 'Look at the shaded row.', { kind, f, r0, c0, cells: [0, 1, 2, 3].map(j => [i, j]), q, opts, ans: opts[0], sig: `mcr${f}${r0}${c0}` }, 3.3, 1.55, 4.9, 24); }
  const r0 = ri(rng, 1, top), c0 = ri(rng, 1, top), i = ri(rng, 0, 2), j = ri(rng, 0, 3), c = c0 + j, r = r0 + i;
  return vp('mchart', 'Look at the shaded numbers.', { kind, r0, c0, cells: [[i, j], [i + 1, j]], r, c, ans: String(c), sig: `mcp${r0}${c0}${i}${j}` }, 3.3, 1.55, 3.4, 24);
}

function g3MchartHtml(p, key, x) {
  const cw = 46, ch = 30; let o = '';
  const cell = (i, j, txt, head, shade, blank) => { const xx = 8 + cw * j, yy = 6 + ch * i;
    return vrect(xx, yy, cw, ch, head ? '#e8eef7' : shade ? VFILL[0] : blank ? '#fff' : 'none', { c: '#8d99ad', w: 1.3 }) + (blank ? (key ? vtxt(xx + cw / 2, yy + 20, String(txt), { s: 14, b: 1, c: VKEY }) : '') : vtxt(xx + cw / 2, yy + 20, String(txt), { s: 14, b: head })); };
  for (let j = 0; j < 5; j++) o += cell(0, j, j ? p.c0 + j - 1 : '×', true);
  for (let i = 1; i < 5; i++) for (let j = 0; j < 5; j++) {
    if (j === 0) o += cell(i, 0, p.r0 + i - 1, true);
    else { const r = p.r0 + i - 1, c = p.c0 + j - 1, idx = (i - 1) * 4 + (j - 1); o += cell(i, j, r * c, false, p.cells.some(q => q[0] === i - 1 && q[1] === j - 1), p.kind === 'fill' && p.blanks.includes(idx)); } }
  const g = vsvg(2.5, 1.55, o, 'Multiplication chart');
  if (p.kind === 'fill') return g;
  if (p.kind === 'plus') return g + `<div>${p.r + 1} × ${p.c} is one more group of ${x(p.c, 1.6)} than ${p.r} × ${p.c}.</div>`;
  if (p.kind === 'explain') return g + vExplainHtml(p.lines, key);
  return g + `<div>${esc(p.q)}</div><div>${vopts(p.opts, p.ans, key)}</div>`;
}

/* -----: addition chart, 5 by 5 sums under row and column headers (2.OA.D.5). Fill the blanks, or circle the even or odd sums. ----- */
function vAcSvg(r0, c0, body) {
  const cw = 46, ch = 30; let o = '';
  const hd = (i, j, t) => vrect(8 + cw * j, 6 + ch * i, cw, ch, '#e8eef7', { c: '#8d99ad', w: 1.3 }) + vtxt(8 + cw * j + cw / 2, 6 + ch * i + 20, String(t), { s: 14, b: 1 });
  o += hd(0, 0, '+');
  for (let j = 1; j <= 5; j++) o += hd(0, j, c0 + j - 1);
  for (let i = 1; i <= 5; i++) o += hd(i, 0, r0 + i - 1);
  for (let i = 1; i <= 5; i++) for (let j = 1; j <= 5; j++) o += body(i, j, 8 + cw * j, 6 + ch * i, r0 + i - 1 + c0 + j - 1);
  return vsvg(2.95, 1.9, o, 'Addition chart');
}

const vAcStart = (rng, L, lo0) => { const r0 = L === 1 ? lo0 : ri(rng, 0, L === 3 ? 9 : 5); return [r0, L === 1 ? lo0 : L === 2 ? r0 : ri(rng, 0, 9)]; };

function visAddchart(rng, L) {
  const [r0, c0] = vAcStart(rng, L, 0), nb = L === 1 ? 6 : L === 2 ? 8 : 10, blanks = shuffle(rng, Array.from({ length: 25 }, (_, i) => i)).slice(0, nb).sort((a, b) => a - b);
  return vp('addchart', 'Finish the addition chart.', { r0, c0, blanks, ans: blanks.map(b => r0 + Math.floor(b / 5) + c0 + b % 5).join(' '), sig: `ad${r0}.${c0}.${blanks}` }, 2.95, 1.9, 1.9);
}

function visAddchartHtml(p, key) {
  return vAcSvg(p.r0, p.c0, (i, j, x, y, v) => vrect(x, y, 46, 30, 'none', { c: '#8d99ad', w: 1.3 }) + (p.blanks.includes((i - 1) * 5 + j - 1) ? (key ? vtxt(x + 23, y + 20, String(v), { s: 14, b: 1, c: VKEY }) : '') : vtxt(x + 23, y + 20, String(v), { s: 14 })));
}

function visChartcircle(rng, L) {
  let r0, c0; if (L === 1) { r0 = c0 = ri(rng, 0, 5); } else { r0 = ri(rng, 0, L === 3 ? 9 : 5); c0 = ri(rng, 0, L === 3 ? 9 : 5); }
  const want = pick(rng, ['even', 'odd']);
  return vp('chartcircle', `Circle all the ${want} sums.`, { r0, c0, want, ans: want, sig: `cc${r0}.${c0}${want}` }, 2.95, 1.9, 1.9);
}

function visChartcircleHtml(p, key) {
  return vAcSvg(p.r0, p.c0, (i, j, x, y, v) => vrect(x, y, 46, 30, 'none', { c: '#8d99ad', w: 1.3 }) + vtxt(x + 23, y + 20, String(v), { s: 14 }) + (key && (v % 2 ? 'odd' : 'even') === p.want ? vring(x + 3, y + 3, 40, 24) : ''));
}

defTypes("vis", "Patterns and charts", [
  { id: "pat", label: "Repeating patterns", blurb: "What comes next, and how long is the core.", on: true, gen: visPat, html: visPatHtml },
  { id: "patmake", label: "Make a pattern", blurb: "Draw your own AB, AAB, ABB or ABC pattern.", on: false, gen: visPatmake, html: visPatmakeHtml },
  { id: "chart", label: "Number charts", blurb: "Hundreds chart and addition chart patterns.", on: false, gen: visChart, html: visChartHtml },
  { id: "chartwhy", label: "Why the chart pattern works", blurb: "Read the shaded cells, and explain why mirrored cells match.", on: false, gen: visChartwhy, html: visChartwhyHtml },
  { id: "mchart", label: "Multiplication chart patterns", blurb: "Fill the chart, even and odd products, one more group.", on: false, gen: g3Mchart, html: g3MchartHtml },
  { id: "addchart", label: "Finish the addition chart", blurb: "Fill in the missing sums in a 5 by 5 addition chart.", on: false, gen: visAddchart, html: visAddchartHtml },
  { id: "chartcircle", label: "Circle even or odd sums", blurb: "Circle the even or the odd sums in an addition chart.", on: false, gen: visChartcircle, html: visChartcircleHtml }
]);
