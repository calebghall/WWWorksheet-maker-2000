/* ---------- Shapes, Measures and Data: measuring ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

function visCmpm(rng, L) {
  const kind = pick(rng, L === 1 ? ['long', 'tall'] : ['long', 'tall', 'heavy']), cnt = kind === 'heavy' ? 2 : L === 1 ? 2 : 3;
  const vals = shuffle(rng, [1, 2, 3, 4, 5, 6]).slice(0, cnt), big = rng() < 0.5, ans = vals.indexOf(big ? Math.max(...vals) : Math.min(...vals));
  const word = kind === 'long' ? (cnt === 2 ? (big ? 'longer' : 'shorter') : (big ? 'longest' : 'shortest')) : kind === 'tall' ? (cnt === 2 ? (big ? 'taller' : 'shorter') : (big ? 'tallest' : 'shortest')) : (big ? 'heavier' : 'lighter');
  const noun = kind === 'long' ? 'pencil' : kind === 'tall' ? 'tree' : 'object';
  return vp('cmpm', `Circle the ${word} ${noun}.`, { kind, vals, ans: String(ans), sig: kind === 'heavy' ? `cmheavy${vals[0] > vals[1]}${big}` : `cm${kind}${vals}${big}` }, kind === 'heavy' ? 2.2 : 2.6, kind === 'long' ? 0.15 + 0.38 * cnt : kind === 'tall' ? 1.45 : 1.05, 1.9);
}

function visCmpmHtml(p, key) {
  const n = p.vals.length; let o = '', h = p.hin * 100;
  if (p.kind === 'long') {
    p.vals.forEach((v, i) => { const y = 10 + 38 * i, len = 30 + 24 * v;
      o += vtxt(14, y + 18, V_LET[i], { b: 1 }) + vrect(34, y + 4, len, 22, VFILL[3]) + vpoly([[34 + len, y + 4], [34 + len + 22, y + 15], [34 + len, y + 26]], 'var(--tip)', 0, 0, 0);
      if (key && i === +p.ans) o += vring(26, y - 2, len + 36, 34); });
    return vsvg(2.6, p.hin, o, 'Pencils');
  }
  if (p.kind === 'tall') {
    p.vals.forEach((v, i) => { const x = 36 + 80 * i, th = 20 + 17 * v;
      o += vrect(x - 7, 118 - 24 - th + 24 - 24, 14, 24, 'var(--wood)') + vpoly([[x, 118 - 24 - th - 6], [x + 26, 118 - 24 - th + 40], [x - 26, 118 - 24 - th + 40]], VFILL[2], 0, 0, 0) + vtxt(x, 138, V_LET[i], { b: 1 });
      if (key && i === +p.ans) o += vring(x - 34, 118 - 24 - th - 14, 68, th + 60); });
    return vsvg(2.6, 1.45, o, 'Trees');
  }
  const heavy = p.vals[0] > p.vals[1] ? 0 : 1, tilt = heavy === 0 ? 10 : -10, bx = 110, by = 38, L = 78, dy = Math.sin(tilt * Math.PI / 180) * L, lx = bx - L * Math.cos(tilt * Math.PI / 180), rx = bx + L * Math.cos(tilt * Math.PI / 180);
  o += vpoly([[bx, by], [bx + 14, 98], [bx - 14, 98]], '#c9cdd3', 0, 0, 0) + vline(lx, by - dy, rx, by + dy, VINK, 3);
  [[lx, by - dy, 0], [rx, by + dy, 1]].forEach(([px, py, i]) => { o += vline(px, py, px - 22, py + 18, VINK, 1.5) + vline(px, py, px + 22, py + 18, VINK, 1.5) + `<path d="M${px - 26} ${py + 18}H${px + 26}" stroke="${VINK}" stroke-width="3"/>` + vrect(px - 14, py - 8, 28, 26, VFILL[i === 0 ? 1 : 0]) + vtxt(px, py + 11, V_LET[i], { b: 1 });
    if (key && i === +p.ans) o += vring(px - 20, py - 14, 40, 38); });
  return vsvg(2.2, 1.05, o, 'Balance scale');
}

/* ans for heavy: index of the object asked about. The heavier is the larger value; vals holds weights. */
function visOrd3(rng, L) {
  if (L === 1 || (L === 3 && rng() < 0.4)) { const vals = shuffle(rng, [1, 2, 3, 4, 5, 6]).slice(0, 3), ord = [0, 1, 2].sort((a, b) => vals[a] - vals[b]).map(i => V_LET[i]);
    return vp('ord3', 'Shortest to longest: write A, B, C.', { variant: 'dir', vals, ord, ans: ord.join(' '), sig: `o3${vals}` }, 2.6, 1.1, 3.4, 12); }
  const nm = shuffle(rng, ['Ben', 'Cam', 'Dee', 'Eli', 'Fay', 'Gus']).slice(0, 3), kind = rng() < 0.5 ? 'taller' : 'older', ask = rng() < 0.5;
  return { mod: 'vis', type: 'ord3', prompt: 'Read and answer.', variant: 'ind', names: nm, word: kind, lines: [`${nm[0]} is ${kind} than ${nm[1]}.`, `${nm[1]} is ${kind} than ${nm[2]}.`],
    qtext: ask ? `Is ${nm[0]} ${kind} than ${nm[2]}?` : `Is ${nm[2]} ${kind} than ${nm[0]}?`, ans: ask ? 'yes' : 'no', sig: `o3i${nm}${kind}${ask}`, ew: 14, eh: 1.1 + 3 * 1.5 + 0.5 };
}

function visOrd3Html(p, key, x) {
  if (p.variant === 'ind') return `<div>${esc(p.lines[0])}</div><div>${esc(p.lines[1])}</div><div>${esc(p.qtext)}&emsp;${vopts(['yes', 'no'], p.ans, key)}</div>`;
  const o = p.vals.map((v, i) => { const y = 8 + 32 * i, len = 30 + 24 * v; return vtxt(14, y + 18, V_LET[i], { b: 1 }) + vrect(34, y + 4, len, 20, VFILL[3]) + vpoly([[34 + len, y + 4], [34 + len + 20, y + 14], [34 + len, y + 24]], 'var(--tip)', 0, 0, 0); }).join('');
  return vsvg(2.6, 1.1, o, 'Three pencils') + `<div>${['', '', ''].map((_, i) => x(p.ord[i], 1.8)).join(' ,&ensp;')}</div>`;
}

/* ----- measurement: unit tiles, ruler, two units, estimate, how much longer ----- */
const V_OBJ = ['pencil', 'crayon', 'straw', 'ribbon', 'stick'];

function visMunit(rng, L) {
  const unit = pick(rng, ['cubes', 'clips']), obj = pick(rng, V_OBJ), n = ri(rng, 2, L === 1 ? 8 : 10), st = L === 3 ? ri(rng, 1, 12 - n > 1 ? Math.min(4, 12 - n) : 1) : 0;
  return vp('munit', `How many ${unit} long is the ${obj}?`, { unit, obj, n, st, strip: L > 1 ? 12 : n, ans: String(n), sig: `mu${unit}${obj}${n}${st}${L}` }, Math.max(0.9, (L > 1 ? 12 : n) * 0.22 + 0.3), 0.85, 3.4, 10);
}

function visMunitHtml(p, key, x) {
  const T = 22, x0 = 12, N = p.strip;
  let o = vrect(x0 + p.st * T, 6, p.n * T, 22, VFILL[3]) + vpoly([[x0 + (p.st + p.n) * T, 6], [x0 + (p.st + p.n) * T + 20, 17], [x0 + (p.st + p.n) * T, 28]], 'var(--tip)', 0, 0, 0);
  for (let i = 0; i < N; i++) o += vrect(x0 + i * T + 1, 44, T - 2, 26, p.unit === 'cubes' ? VFILL[1] : '#dfe3ea', { r: p.unit === 'cubes' ? 2 : 11 });
  return vsvg(Math.max(0.9, N * 0.22 + 0.3), 0.85, o, 'Object above a row of units') + `<div>${x(p.ans, 2.6)} ${p.unit}</div>`;
}

function vruler(unit, max, sc, x0, y, key) {
  const cm = unit === 'cm', w = max * sc;
  let o = vrect(x0, y, w, 30, 'var(--ruler)');
  for (let i = 0; i <= max; i++) { const xx = x0 + i * sc; o += vline(xx, y, xx, y + (i % 1 === 0 ? 14 : 8), VINK, 1.5) + vtxt(xx, y + 27, String(i), { s: 11 }); }
  return o + vtxt(x0 + w + 18, y + 27, cm ? 'cm' : 'in', { a: 'start', s: 11 });
}

function visRuler(rng, L) {
  const unit = pick(rng, ['in', 'cm']), max = L === 1 ? 6 : L === 2 ? 10 : 12, sc = L === 1 ? 40 : L === 2 ? 24 : 21, len = ri(rng, 2, max - (L === 3 ? 2 : 0)), st = L === 3 ? ri(rng, 1, max - len) : 0, obj = pick(rng, V_OBJ);
  const w = max * sc / 100 + 0.7;
  return vp('ruler', `How long is the ${obj}?`, { unit, max, sc, len, st, obj, ans: String(len), sig: `rl${unit}${max}${len}${st}${obj}` }, w, 0.95, 3.4, 11);
}

function visRulerHtml(p, key, x) {
  const x0 = 12, w = p.max * p.sc / 100 + 0.7;
  let o = vrect(x0 + p.st * p.sc, 6, p.len * p.sc, 20, VFILL[3]) + vpoly([[x0 + (p.st + p.len) * p.sc, 6], [x0 + (p.st + p.len) * p.sc + 16, 16], [x0 + (p.st + p.len) * p.sc, 26]], 'var(--tip)', 0, 0, 0);
  o += vruler(p.unit, p.max, p.sc, x0, 40, key);
  return vsvg(w, 0.95, o, 'Object above a ruler') + `<div>${x(p.ans, 2.6)} ${p.unit === 'in' ? 'inches' : 'centimeters'}</div>`;
}

function visMtwo(rng) {
  const b = pick(rng, [2, 3, 4]), m = ri(rng, 2, Math.floor(12 / b)), n = m * b;
  return vp('mtwo', 'Count the small and big tiles.', { b, m, n, ans: `${n} ${m}`, sig: `m2${b}${m}` }, 3.1, 1.0, 5.7, 12);
}

function visMtwoHtml(p, key, x) {
  const T = 24, x0 = 12;
  let o = vrect(x0, 6, p.n * T, 20, VFILL[3]), s = '';
  for (let i = 0; i < p.n; i++) o += vrect(x0 + i * T + 1, 36, T - 2, 20, VFILL[1]);
  for (let i = 0; i < p.m; i++) o += vrect(x0 + i * T * p.b + 1, 62, T * p.b - 2, 20, VFILL[0]);
  return vsvg(3.1, 1.0, o, 'A bar measured with small tiles and big tiles') + `<div>Small ${x(p.n, 1.8)}&ensp;Big ${x(p.m, 1.8)}</div><div>More tiles? ${vopts(['small', 'big'], p.n > p.m ? 'small' : 'big', key)}</div>`;
}

function visMdiff(rng, L) {
  const max = L === 1 ? 10 : 12, a = ri(rng, 3, max), b = ri(rng, 1, a - 1), unit = pick(rng, ['in', 'cm']), swap = rng() < 0.5;
  return vp('mdiff', 'How much longer is the longer bar?', { a: swap ? b : a, b: swap ? a : b, max, unit, ans: String(Math.abs(a - b)), sig: `md${a}${b}${swap}${unit}` }, 3.2, 1.05, 3.4, 12);
}

function visMdiffHtml(p, key, x) {
  const sc = 20, x0 = 28;
  const o = vtxt(8, 20, 'A', { b: 1, a: 'start' }) + vrect(x0, 6, p.a * sc, 20, VFILL[3]) + vtxt(8, 48, 'B', { b: 1, a: 'start' }) + vrect(x0, 34, p.b * sc, 20, VFILL[1]) + vruler(p.unit, p.max, sc, x0, 64, key);
  return vsvg(3.2, 1.05, o, 'Two bars above a ruler') + `<div>${x(p.ans, 2.6)} ${p.unit === 'in' ? 'inches' : 'centimeters'}</div>`;
}

const V_EST = [['a pencil', 'inches', 7], ['a crayon', 'inches', 4], ['a paper clip', 'centimeters', 3], ['a door', 'feet', 7], ['a bed', 'feet', 6], ['a classroom', 'meters', 9], ['a soccer field', 'yards', 100], ['a school bus', 'meters', 12], ['a ladybug', 'centimeters', 1], ['a car', 'feet', 14], ['a sidewalk block', 'feet', 4], ['a hallway', 'yards', 20], ['a pencil case', 'inches', 9], ['a thumb', 'inches', 2], ['a swimming pool', 'meters', 25], ['a couch', 'feet', 7], ['a giraffe', 'feet', 16], ['a bike', 'feet', 5], ['a fingernail', 'centimeters', 1], ['a playground', 'yards', 30], ['a book', 'inches', 10], ['a table', 'feet', 5],
  ['an eraser', 'inches', 2], ['a ruler', 'inches', 12], ['a stapler', 'inches', 6], ['a shoe', 'inches', 10], ['a penny', 'centimeters', 2], ['a pencil sharpener', 'centimeters', 4],
  ['a bathtub', 'feet', 5], ['a refrigerator', 'feet', 6], ['a skateboard', 'inches', 30], ['a garden hose', 'feet', 50], ['a tennis court', 'yards', 26], ['a basketball court', 'meters', 28], ['a park bench', 'feet', 6], ['a bedroom', 'meters', 4]];

function visMest(rng) {
  const [thing, unit, v] = pick(rng, V_EST), units = shuffle(rng, ['inches', 'feet', 'yards', 'centimeters', 'meters'].filter(u => u !== unit)).slice(0, 2).concat(unit), opts = shuffle(rng, units);
  return { mod: 'vis', type: 'mest', prompt: `How long is ${thing}?`, thing, unit, v, opts, ans: `${v} ${unit}`, sig: `me${thing}`, win: 3.1, hin: 0.25, hfs: 2.8, bw: 0 };
}

function visMestHtml(p, key) {
  return `<div>${p.opts.map(u => `<span class="opt${key && u === p.unit ? ' on' : ''}" style="min-width:0">${p.v} ${u.replace('inches', 'in').replace('feet', 'ft').replace('yards', 'yd').replace('centimeters', 'cm').replace('meters', 'm')}</span>`).join('')}</div>`;
}

/* name the attribute that is measured */
const V_ATTR = { length: 'how long it is', height: 'how tall it is', weight: 'how heavy it is' };

const V_ATTRW = [['longer', 'length'], ['longest', 'length'], ['taller', 'height'], ['tallest', 'height'], ['heavier', 'weight'], ['lighter', 'weight'], ['heaviest', 'weight'], ['lightest', 'weight']];

function visMattr(rng, L) {
  if (L === 1 || rng() < 0.5) { const k = pick(rng, Object.keys(V_ATTR)); return vtext('mattr', 'Which word tells it?', { variant: 'clue', text: V_ATTR[k], ans: k, sig: `ma${k}` }, 22, 1.1 + 1.6 * 2 + 0.2); }
  const [w, k] = pick(rng, V_ATTRW); return vtext('mattr', 'Which attribute does the word tell?', { variant: 'cmp', text: w, ans: k, sig: `mw${w}` }, 22, 1.1 + 1.6 * 2 + 0.2);
}

const visMattrHtml = (p, key) => `<div>${esc(p.text)}</div><div>${vopts(['length', 'height', 'weight'], p.ans, key)}</div>`;

/* choose the measuring tool */
const V_TOOLS = ['ruler', 'yardstick', 'meter stick', 'measuring tape'];

const V_MT = [['the length of a pencil', 'ruler'], ['the width of a book', 'ruler'], ['the length of a crayon', 'ruler'], ['a paper clip, in centimeters', 'ruler'],
  ['the width of a door, in feet', 'yardstick'], ['the length of a table, in feet', 'yardstick'], ['a bulletin board, in yards', 'yardstick'],
  ['the length of a hallway, in meters', 'meter stick'], ['the height of a bookcase, in meters', 'meter stick'], ['a wall of the gym, in meters', 'meter stick'],
  ['the distance around a pumpkin', 'measuring tape'], ['the distance around your head', 'measuring tape'], ['the distance around a tree trunk', 'measuring tape']];

function visMtool(rng) {
  const [text, tool] = pick(rng, V_MT), others = tool === 'measuring tape' ? V_TOOLS.filter(t => t !== tool) : V_TOOLS.filter(t => t !== tool && t !== 'measuring tape');
  const opts = shuffle(rng, [tool].concat(shuffle(rng, others).slice(0, 2)));
  return vtext('mtool', 'Circle the best tool to use.', { text, opts, ans: tool, sig: `mt${text}${opts}` }, 21, 1.1 + 2 * 1.45 + 2 * 1.7 + 0.6, true);
}

const visMtoolHtml = (p, key) => `<div class="wt">Measure ${esc(p.text)}.</div><div>${vopts(p.opts, p.ans, key)}</div>`;

/* measure the same object in inches and in centimeters */
function visMrule2(rng) {
  const n = ri(rng, 2, 9), obj = pick(rng, V_OBJ);
  return vp('mrule2', `How long is the ${obj}?`, { n, obj, cm: Math.round(n * 2.54), ans: `${n} ${Math.round(n * 2.54)}`, sig: `mr${n}${obj}` }, 3.3, 0.92, 4.9, 19);
}

function visMrule2Html(p, key, x) {
  const x0 = 12, S = 23, w = 12 * S; let o = vrect(x0, 4, p.n * S, 20, VFILL[3]) + vpoly([[x0 + p.n * S, 4], [x0 + p.n * S + 16, 14], [x0 + p.n * S, 24]], 'var(--tip)', 0, 0, 0);
  o += vrect(x0, 34, w, 50, 'var(--ruler)');
  for (let i = 0; i <= 12; i++) o += vline(x0 + i * S, 34, x0 + i * S, 46, VINK, 1.5) + vtxt(x0 + i * S, 59, String(i), { s: 10 });
  for (let c = 0; c <= 30; c++) { const xx = x0 + c * S / 2.54; if (xx > x0 + w + 0.5) break; o += vline(xx.toFixed(1), 84, xx.toFixed(1), c % 5 ? 77 : 74, VINK, 1.2); if (c % 5 === 0) o += vtxt(xx.toFixed(1), 72, String(c), { s: 9 }); }
  o += vtxt(x0 + w + 6, 46, 'in', { a: 'start', s: 10 }) + vtxt(x0 + w + 6, 82, 'cm', { a: 'start', s: 10 });
  return vsvg(3.1, 0.92, o, 'Object above a ruler with inches and centimeters') + `<div>${x(p.n, 1.8)} inches&ensp;about ${x(p.cm, 1.8)} centimeters</div><div>Which number is greater?</div><div>${vopts(['inches', 'centimeters'], 'centimeters', key)}</div>`;
}

/* -----: mass and liquid volume: read a dial scale or a beaker, choose a unit, estimate with a benchmark, solve one-step problems ----- */
const G3_UNITS = [
  ['mass', 'g', 'a crayon'], ['mass', 'g', 'a paper clip'], ['mass', 'g', 'a strawberry'], ['mass', 'g', 'a slice of bread'], ['mass', 'g', 'an egg'],
  ['mass', 'kg', 'a backpack of books'], ['mass', 'kg', 'a watermelon'], ['mass', 'kg', 'a large dog'], ['mass', 'kg', 'a bag of potatoes'], ['mass', 'kg', 'a bicycle'],
  ['liquid', 'mL', 'a spoon'], ['liquid', 'mL', 'a cup'], ['liquid', 'mL', 'a juice box'], ['liquid', 'mL', 'a small glue bottle'],
  ['liquid', 'L', 'a bathtub'], ['liquid', 'L', 'a fish tank'], ['liquid', 'L', 'a bucket'], ['liquid', 'L', 'a kitchen sink']];

const G3_BENCH = [['A nickel has a mass of about 5 g.', 'nickels', 5, 'g', 'mass'], ['A large paper clip has a mass of about 1 g.', 'paper clips', 1, 'g', 'mass'], ['A juice box holds about 200 mL.', 'juice boxes', 200, 'mL', 'liquid'],
  ['A bag of flour has a mass of about 2 kg.', 'bags of flour', 2, 'kg', 'mass'], ['A pitcher holds about 2 L.', 'pitchers', 2, 'L', 'liquid'], ['An apple has a mass of about 200 g.', 'apples', 200, 'g', 'mass']];

const G3_WORD = {
  add: { mass: (a, b, u) => `A box has a mass of ${a} ${u}. A bag has a mass of ${b} ${u}. What is the total mass?`, liquid: (a, b, u) => `A jug holds ${a} ${u}. A pot holds ${b} ${u}. How much do they hold in all?` },
  sub: { mass: (a, b, u) => `A pack has a mass of ${a} ${u}. ${b} ${u} is taken out. What is the mass left?`, liquid: (a, b, u) => `A tank has ${a} ${u} of water. ${b} ${u} is poured out. How much water is left?` },
  mul: { mass: (a, b, u) => `Each bag of rice has a mass of ${a} ${u}. What is the mass of ${b} bags?`, liquid: (a, b, u) => `Each bottle holds ${a} ${u}. How much do ${b} bottles hold?` },
  div: { mass: (a, b, u) => `${a} ${u} of sand is shared equally into ${b} pails. What is the mass in each pail?`, liquid: (a, b, u) => `${a} ${u} of juice is poured equally into ${b} jugs. How much is in each jug?` }
};

const g3Pt = (N, i, r, cx, cy) => { const t = (-135 + 270 * i / N) * Math.PI / 180; return [cx + r * Math.sin(t), cy - r * Math.cos(t)]; };

function g3Mvol(rng, L) {
  const v = pick(rng, L === 1 ? ['dial', 'beaker', 'unit'] : L === 2 ? ['dial', 'beaker', 'unit', 'word', 'bench'] : ['dial', 'beaker', 'unit', 'word', 'word', 'bench']);
  if (v === 'dial') { const unit = pick(rng, ['kg', 'g']), step = unit === 'kg' ? 1 : 100, i = L === 1 ? pick(rng, [2, 4, 6, 8]) : ri(rng, 1, 9);
    return vp('mvol', 'Read the scale.', { variant: v, unit, step, N: 10, i, ans: String(i * step), sig: `mvd${unit}${i}` }, 1.7, 1.25, 3.4, 8); }
  if (v === 'beaker') { const unit = pick(rng, ['L', 'mL']), step = unit === 'L' ? 1 : 100, N = L === 1 ? 5 : 10, i = ri(rng, 1, N - 1);
    return vp('mvol', 'Read the liquid level.', { variant: v, unit, step, N, i, ans: String(i * step), sig: `mvb${unit}${N}${i}` }, 1.7, 1.25, 3.4, 8); }
  if (v === 'unit') { const it = pick(rng, G3_UNITS), opts = it[0] === 'mass' ? ['g', 'kg'] : ['mL', 'L'], text = it[0] === 'mass' ? `Find the mass of ${it[2]}.` : `How much liquid does ${it[2]} hold?`;
    return vtext('mvol', 'Circle the best unit.', { variant: v, kind: it[0], thing: it[2], text, opts, ans: it[1], sig: `mvu${it[2]}` }, 21, g3eh([text.length], g3optLen(opts)), true); }
  if (v === 'bench') { const it = pick(rng, G3_BENCH), n = it[2] === 1 ? pick(rng, [20, 50, 100]) : ri(rng, 2, 10), text = `${it[0]} ${it[4] === 'mass' ? `About what is the mass of ${n} ${it[1]}?` : `About how much do ${n} ${it[1]} hold?`}`;
    return vtext('mvol', 'Estimate with a benchmark.', { variant: v, bench: it[0], per: it[2], unit: it[3], noun: it[1], n, text, ans: String(n * it[2]), sig: `mvk${it[1]}${n}` }, 21, g3eh([text.length], 0, 1.7), true); }
  const op = pick(rng, L === 2 ? ['add', 'sub'] : ['add', 'sub', 'mul', 'div']), kind = pick(rng, ['mass', 'liquid']), unit = kind === 'mass' ? pick(rng, L === 1 ? ['kg'] : ['kg', 'g']) : pick(rng, ['L', 'mL']), small = unit === 'kg' || unit === 'L';
  let a, b, ans;
  if (op === 'add') { a = small ? ri(rng, 5, 60) : ri(rng, 2, 9) * 50 + ri(rng, 0, 4) * 10; b = small ? ri(rng, 5, 60) : ri(rng, 2, 9) * 50; ans = a + b; }
  else if (op === 'sub') { b = small ? ri(rng, 5, 40) : ri(rng, 2, 9) * 50; a = b + (small ? ri(rng, 5, 50) : ri(rng, 2, 9) * 50); ans = a - b; }
  else if (op === 'mul') { a = small ? ri(rng, 2, 12) : ri(rng, 2, 9) * 10; b = ri(rng, 2, 9); ans = a * b; }
  else { b = ri(rng, 2, 9); ans = small ? ri(rng, 2, 12) : ri(rng, 2, 9) * 10; a = b * ans; }
  const text = G3_WORD[op][kind](a, b, unit);
  return vtext('mvol', 'Solve the problem.', { variant: v, op, kind, unit, a, b, text, ans: String(ans), sig: `mvw${op}${kind}${unit}${a}${b}` }, 21, g3eh([text.length], 0, 1.7), true);
}

function g3MvolHtml(p, key, x) {
  if (p.variant === 'dial') {
    const cx = 62, cy = 62; let o = `<circle cx="${cx}" cy="${cy}" r="54" fill="#fff" stroke="${VINK}" stroke-width="2.5"/>`;
    for (let i = 0; i <= p.N; i++) { const a = g3Pt(p.N, i, 54, cx, cy), b = g3Pt(p.N, i, i % 2 ? 47 : 43, cx, cy); o += vline(a[0].toFixed(1), a[1].toFixed(1), b[0].toFixed(1), b[1].toFixed(1), VINK, i % 2 ? 1.2 : 2);
      if (i % 2 === 0) { const t = g3Pt(p.N, i, 32, cx, cy); o += vtxt(t[0].toFixed(1), (t[1] + 3.5).toFixed(1), String(i * p.step), { s: 9.5 }); } }
    const n = g3Pt(p.N, p.i, 40, cx, cy); o += vline(cx, cy, n[0].toFixed(1), n[1].toFixed(1), VINK, 2.5) + `<circle cx="${cx}" cy="${cy}" r="4" fill="${VINK}"/>` + vtxt(cx, cy + 22, p.unit, { s: 10 });
    return vsvg(1.25, 1.25, o, 'A dial scale') + `<div>${x(p.ans, 2.6)} ${p.unit}</div>`;
  }
  if (p.variant === 'beaker') {
    const x0 = 16, x1 = 66, yb = 112, h = 100, lvl = h * p.i / p.N; let o = `<rect x="${x0}" y="${yb - lvl}" width="${x1 - x0}" height="${lvl}" fill="${VFILL[3]}"/>` + vline(x0, yb - h - 6, x0, yb, VINK, 2.5) + vline(x1, yb - h - 6, x1, yb, VINK, 2.5) + vline(x0, yb, x1, yb, VINK, 2.5);
    for (let i = 0; i <= p.N; i++) { const y = (yb - h * i / p.N).toFixed(1), lab = p.N === 5 || i % 2 === 0; o += vline(x1, y, x1 + (lab ? 9 : 5), y, VINK, lab ? 1.8 : 1.2); if (lab) o += vtxt(x1 + 12, (yb - h * i / p.N + 3.5).toFixed(1), String(i * p.step), { a: 'start', s: 10 }); }
    return vsvg(1.25, 1.25, o, 'A measuring beaker') + `<div>${x(p.ans, 2.6)} ${p.unit}</div>`;
  }
  if (p.variant === 'unit') return `<div class="wt">${esc(p.text)}</div><div>${vopts(p.opts, p.ans, key)}</div>`;
  return `<div class="wt">${esc(p.text)}</div><div>${x(p.ans, 3)} ${p.unit}</div>`;
}

function g3Rulq(rng, L) {
  const den = L === 1 ? 2 : 4, q = den === 2 ? 2 * ri(rng, 1, 10) : ri(rng, 3, 20), draw = L >= 2 && rng() < 0.4;
  if (draw) return vp('rulq', `Draw a line ${vmx(q)} in long.`, { variant: 'draw', den, q, ans: vmx(q), sig: `rqd${q}` }, 3.1, 0.95, 1.9);
  return vp('rulq', 'How long is the object?', { variant: 'read', den, q, ans: vmx(q), sig: `rqr${den}${q}` }, 3.1, 0.95, 3.4, 10);
}

function g3RulqHtml(p, key, x) {
  const x0 = 14, S = 56; let o = '';
  if (p.variant === 'read') o += vrect(x0, 6, p.q * S / 4, 22, VFILL[3], { r: 3 });
  else { o += vline(x0, 17, x0 + 5 * S, 17, '#b6c0d0', 2) + vline(x0, 8, x0, 26, VINK, 2); if (key) o += vline(x0, 17, x0 + p.q * S / 4, 17, VKEY, 4.5) + vline(x0 + p.q * S / 4, 9, x0 + p.q * S / 4, 25, VKEY, 3); }
  o += vrect(x0 - 4, 34, 5 * S + 8, 50, 'var(--ruler)');
  for (let i = 0; i <= 20; i += p.den === 2 ? 2 : 1) { const xx = x0 + i * S / 4, h = i % 4 === 0 ? 22 : i % 2 === 0 ? 16 : 10; o += vline(xx, 34, xx, 34 + h, VINK, i % 4 === 0 ? 1.8 : 1.2); if (i % 4 === 0) o += vtxt(xx, 70, String(i / 4), { s: 12 }); }
  const g = vsvg(3.1, 0.95, o, p.variant === 'read' ? 'An object above a ruler' : 'A ruler and a guide line');
  return p.variant === 'read' ? g + `<div>Length: ${x(p.ans, 2.4)} in</div>` : g;
}

defTypes("vis", "Measuring", [
  { id: "cmpm", label: "Compare objects", blurb: "Longer, taller, heavier.", on: false, gen: visCmpm, html: visCmpmHtml },
  { id: "ord3", label: "Order three objects", blurb: "Order by length, and compare through a third object.", on: false, gen: visOrd3, html: visOrd3Html },
  { id: "munit", label: "Measure with unit tiles", blurb: "Cubes and paper clips.", on: false, gen: visMunit, html: visMunitHtml },
  { id: "ruler", label: "Measure with a ruler", blurb: "Inches and centimeters.", on: true, gen: visRuler, html: visRulerHtml },
  { id: "mtwo", label: "Two units", blurb: "Measure with small and big tiles.", on: false, gen: visMtwo, html: visMtwoHtml },
  { id: "mdiff", label: "How much longer", blurb: "Two bars on a ruler.", on: false, gen: visMdiff, html: visMdiffHtml },
  { id: "mest", label: "Estimate length", blurb: "Pick the sensible unit.", on: false, gen: visMest, html: visMestHtml },
  { id: "mattr", label: "Measurable attributes", blurb: "Length, height or weight: name the attribute.", on: false, gen: visMattr, html: visMattrHtml },
  { id: "mtool", label: "Choose a measuring tool", blurb: "Ruler, yardstick, meter stick or measuring tape.", on: false, gen: visMtool, html: visMtoolHtml },
  { id: "mrule2", label: "Inches and centimeters", blurb: "Measure one object with two units.", on: false, gen: visMrule2, html: visMrule2Html },
  { id: "rulq", label: "Ruler: halves and fourths", blurb: "Measure or draw to the quarter inch.", on: false, gen: g3Rulq, html: g3RulqHtml },
  { id: "mvol", label: "Mass and liquid volume", blurb: "Dial scales, beakers, units, benchmarks, word problems.", on: false, gen: g3Mvol, html: g3MvolHtml }
]);
