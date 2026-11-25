/* ---------- Visual: frequency tables and stem-and-leaf plots ----------
   Texas 3.8A/B, 4.9A/B, 5.9A/C. Both are text tables inside the cell (HTML, not SVG).
   ftable  L1 count a list of answers into a frequency table, L2 read a table (total and how many more), L3 two-step questions on a table
   stem    L1 read a stem-and-leaf plot (how many values, greatest value), L2 build the plot from a list, L3 solve (range, how many at least, most common) */

const FT_CTX = [['Favorite fruit', ['Apples', 'Grapes', 'Pears', 'Plums']], ['Pets at home', ['Dogs', 'Cats', 'Fish', 'Birds']], ['Favorite sport', ['Soccer', 'Tennis', 'Swimming', 'Baseball']],
  ['Lunch choices', ['Pizza', 'Salad', 'Soup', 'Tacos']], ['Favorite season', ['Spring', 'Summer', 'Fall', 'Winter']], ['Books checked out', ['Mystery', 'Science', 'Poems', 'Comics']]];
const ST_CTX = [['Quiz scores', 'points'], ['Minutes spent reading', 'minutes'], ['Plant heights', 'centimeters'], ['Laps run', 'laps'], ['Jumps with a rope', 'jumps'], ['Pages read', 'pages']];
const vtCell = 'border:1px solid #8d99ad;padding:.02in .08in';

function visFtable(rng, L) {
  const [title, all] = pick(rng, FT_CTX), n = L === 1 ? 3 : 4, cats = all.slice(0, n), tot = L === 1 ? ri(rng, 9, 12) : 0;
  let cnt;
  if (L === 1) { cnt = cats.map(() => 1); for (let i = cnt.length; i < tot; i++) cnt[ri(rng, 0, n - 1)]++; }
  else { do { cnt = cats.map(() => ri(rng, 3, 15)); } while (new Set(cnt).size < n); }
  if (L === 1) {
    const data = shuffle(rng, cats.flatMap((c, i) => Array(cnt[i]).fill(c)));
    return vp('ftable', 'Make a frequency table.', { mode: 'count', title, cats, cnt, data, tot: cnt.reduce((a, b) => a + b, 0), ans: cnt.join(' ') + ' ' + cnt.reduce((a, b) => a + b, 0), sig: `ft1${title}${data}` }, 3.2, 0.5 + vwrapH(data.join(', '), 3.1) + (n + 2) * 0.3, 0);
  }
  const hi = cnt.indexOf(Math.max(...cnt)), lo = cnt.indexOf(Math.min(...cnt));
  if (L === 2) return vp('ftable', 'Read the frequency table.', { mode: 'read', title, cats, cnt, hi, lo, ans: `${cnt.reduce((a, b) => a + b, 0)} ${cnt[hi] - cnt[lo]}`, sig: `ft2${title}${cnt}` }, 3.2, 0.5 + (n + 1) * 0.3 + 1.2, 0);
  const idx = shuffle(rng, [0, 1, 2, 3]), a = idx[0], b = idx[1], c = idx[2], kind = pick(rng, ['sum2', 'more2']);
  if (kind === 'more2' && cnt[a] + cnt[b] <= cnt[c]) return visFtable(rng, L);
  const val = kind === 'sum2' ? cnt[a] + cnt[b] : cnt[a] + cnt[b] - cnt[c];
  return vp('ftable', 'Read the frequency table.', { mode: kind, title, cats, cnt, a, b, c, ans: String(val), sig: `ft3${title}${cnt}${kind}${a}${b}${c}` }, 3.2, 0.5 + (n + 1) * 0.3 + 1.4, 0);
}
function visFtableHtml(p, key, x) {
  const th = `<tr><th style="${vtCell};background:#e8eef7">${esc(p.title)}</th><th style="${vtCell};background:#e8eef7">Number</th></tr>`;
  const tbl = rows => `<table style="border-collapse:collapse;margin-top:.04in;width:2.6in">${th}${rows}</table>`, td = (c, v) => `<tr><td style="${vtCell}">${esc(c)}</td><td style="${vtCell};text-align:center">${v}</td></tr>`;
  if (p.mode === 'count') return vwrap(p.data.join(', '), 3.1) + tbl(p.cats.map((c, i) => td(c, x(p.cnt[i], 1.6))).join('') + td('Total', x(p.tot, 1.6)));
  const t = tbl(p.cats.map((c, i) => td(c, p.cnt[i])).join('')), nm = i => esc(p.cats[i]);
  if (p.mode === 'read') return t + `<div>How many in all? ${x(p.cnt.reduce((a, b) => a + b, 0), 2)}</div>` + vwrap(`How many more ${p.cats[p.hi]} than ${p.cats[p.lo]}?`, 3.1) + `<div>${x(p.cnt[p.hi] - p.cnt[p.lo], 2)}</div>`;
  if (p.mode === 'sum2') return t + vwrap(`How many in all chose ${p.cats[p.a]} or ${p.cats[p.b]}?`, 3.1) + `<div>${x(p.ans, 2)}</div>`;
  return t + vwrap(`How many more chose ${p.cats[p.a]} and ${p.cats[p.b]} together than chose ${p.cats[p.c]}?`, 3.1) + `<div>${x(p.ans, 2)}</div>`;
}

function stSet(rng, n, lo, hi, repeat) {
  const vals = [];
  while (vals.length < n) { const v = ri(rng, lo, hi); if (repeat || !vals.includes(v)) vals.push(v); }
  return vals;
}
const stLeaves = (vals, s) => vals.filter(v => Math.floor(v / 10) === s).map(v => v % 10).sort((a, b) => a - b);
function visStem(rng, L) {
  const [title, unit] = pick(rng, ST_CTX), lo = ri(rng, 1, 3) * 10, hiStem = lo / 10 + (L === 2 ? 2 : 3);
  let vals;
  for (let g = 0; g < 300; g++) {
    vals = stSet(rng, L === 2 ? ri(rng, 8, 10) : ri(rng, 10, 13), lo, hiStem * 10 + 9, L === 3);
    const stems = []; for (let s = lo / 10; s <= hiStem; s++) stems.push(s);
    if (!stems.every(s => stLeaves(vals, s).length >= 1)) continue;
    if (L === 3) { const f = {}; vals.forEach(v => { f[v] = (f[v] || 0) + 1; }); const m = Math.max(...Object.values(f)); if (m < 2 || Object.values(f).filter(c => c === m).length !== 1) continue; }
    break;
  }
  const stems = []; for (let s = lo / 10; s <= hiStem; s++) stems.push(s);
  const sorted = vals.slice().sort((a, b) => a - b), rows = stems.map(s => [s, stLeaves(vals, s)]), base = { title, unit, vals, rows, sorted };
  if (L === 1) return vp('stem', 'Read the stem-and-leaf plot.', Object.assign(base, { mode: 'read', ans: `${vals.length} ${sorted[sorted.length - 1]}`, sig: `st1${title}${vals}` }), 3.2, 0.5 + (rows.length + 2) * 0.3 + 1.0, 0);
  if (L === 2) return vp('stem', 'Make a stem-and-leaf plot.', Object.assign(base, { mode: 'make', ans: rows.map(r => r[1].join(' ')).join(' / '), sig: `st2${title}${vals}` }), 3.2, 0.5 + vwrapH(vals.join(', '), 3.1) + (rows.length + 1) * 0.3 + 0.9, 0);
  const kind = pick(rng, ['range', 'least', 'mode']), t = pick(rng, sorted.slice(2, sorted.length - 2));
  let q, ans;
  if (kind === 'range') { q = `What is the range of the ${unit}?`; ans = sorted[sorted.length - 1] - sorted[0]; }
  else if (kind === 'least') { q = `How many values are ${t} or more?`; ans = vals.filter(v => v >= t).length; }
  else { q = `Which number of ${unit} shows up most often?`; const f = {}; vals.forEach(v => { f[v] = (f[v] || 0) + 1; }); ans = Number(Object.keys(f).sort((a, b) => f[b] - f[a])[0]); }
  return vp('stem', 'Use the stem-and-leaf plot.', Object.assign(base, { mode: 'solve', kind, t, q, ans: String(ans), sig: `st3${title}${vals}${kind}${t}` }), 3.2, 0.5 + (rows.length + 2) * 0.3 + vwrapH(q, 3.1) + 0.75, 0);
}
function visStemHtml(p, key, x) {
  const cs = 'padding:.01in .08in;font-variant-numeric:tabular-nums', leaves = r => r[1].join(' ');
  const body = p.rows.map(r => `<tr><td style="${cs};text-align:right;border-right:2px solid #1b2b4a">${r[0]}</td><td style="${cs};letter-spacing:.08em">${p.mode === 'make' ? x(leaves(r), Math.max(4, r[1].length * 1.5 + 2)) : leaves(r)}</td></tr>`).join('');
  const tbl = `<div style="font-size:.9em">${esc(p.title)}</div><table style="border-collapse:collapse"><tr><th style="${cs};text-align:right">Stem</th><th style="${cs};text-align:left">Leaves</th></tr>${body}</table>`;
  const k = vwrap(`Key: ${p.rows[0][0]} | ${p.rows[0][1][0]} means ${p.rows[0][0] * 10 + p.rows[0][1][0]} ${p.unit}.`, 3.1);
  if (p.mode === 'make') return vwrap(p.vals.join(', '), 3.1) + tbl + vwrap(`Key: 3 | 4 means 34 ${p.unit}. Write the leaves in order.`, 3.1);
  if (p.mode === 'read') return tbl + k + `<div>How many values? ${x(p.vals.length, 2)}</div><div>Greatest value? ${x(p.sorted[p.sorted.length - 1], 2)}</div>`;
  return tbl + k + vwrap(p.q, 3.1) + `<div>${x(p.ans, 2)}</div>`;
}

defTypes("vis", "Data displays", [
  { id: "ftable", label: "Frequency tables", blurb: "Count answers into a table, read a table, and solve one- and two-step questions.", on: false, gen: visFtable, html: visFtableHtml },
  { id: "stem", label: "Stem-and-leaf plots", blurb: "Read a plot, make one from a list, and answer questions about range and counts.", on: false, gen: visStem, html: visStemHtml }
]);
