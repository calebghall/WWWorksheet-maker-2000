/* ---------- time and money ---------- */
const tpad = n => String(n).padStart(2, '0');
const centsD = c => (c / 100).toFixed(2);                                   // 345 -> "3.45"
const amt = (c, unit) => unit === 'c' ? `${c}¢` : `$${centsD(c)}`;           // display text for an amount in cents
const amtVal = (c, unit) => unit === 'c' ? String(c) : centsD(c);           // value written in the blank
const moneyBlank = (c, unit, key, w) => `${unit === 'd' ? '$' : ''}${ablank(amtVal(c, unit), key, w)}${unit === 'c' ? '¢' : ''}`;
/* Minutes since midnight to a 12-hour clock string. */
const tfmt = m => { const h = Math.floor(m / 60) % 24; return `${h % 12 || 12}:${tpad(m % 60)} ${h >= 12 ? 'PM' : 'AM'}`; };

/* Coins and bills, listed from the largest value down. */
const COIN_DEF = [
  ['b5', 500, n => `${n} $5 bill${n > 1 ? 's' : ''}`],
  ['b1', 100, n => `${n} $1 bill${n > 1 ? 's' : ''}`],
  ['q', 25, n => `${n} quarter${n > 1 ? 's' : ''}`],
  ['d', 10, n => `${n} dime${n > 1 ? 's' : ''}`],
  ['n', 5, n => `${n} nickel${n > 1 ? 's' : ''}`],
  ['p', 1, n => n > 1 ? `${n} pennies` : '1 penny']
];
function tmCoins(rng, L) {
  const pool = L === 1 ? ['q', 'd', 'n', 'p'] : L === 2 ? ['b1', 'q', 'd', 'n', 'p'] : ['b5', 'b1', 'q', 'd', 'n', 'p'];
  const maxK = L === 1 ? 3 : 4, maxN = L === 1 ? 3 : L === 2 ? 4 : 5, unit = L === 1 ? 'c' : 'd';
  let items, total, g = 0;
  do {
    const kinds = shuffle(rng, pool).slice(0, ri(rng, 2, maxK));
    items = COIN_DEF.filter(c => kinds.includes(c[0])).map(c => ({ id: c[0], cents: c[1], n: ri(rng, 1, maxN), txt: c[2] }));
    total = items.reduce((a, it) => a + it.cents * it.n, 0);
  } while (g++ < 500 && (L === 1 ? total >= 100 : total < 100));
  const texts = items.map(it => it.txt(it.n)), lines = [texts.slice(0, 2).join(', ')];
  if (texts.length > 2) lines.push(texts.slice(2).join(', '));
  return { mod: 'tm', type: 'coins', prompt: 'Count the money.', items: items.map(it => ({ id: it.id, cents: it.cents, n: it.n })), lines, unit, ans: amtVal(total, unit), total,
    sig: `co${items.map(it => it.id + it.n).join('')}`, ew: Math.max(12, Math.max(...lines.map(l => l.length)) * 0.58 + 1), eh: 1.1 + 1.5 * (lines.length + 1) + 0.2 };
}
function tmMadd(rng, L) {
  const unit = L === 1 ? 'c' : 'd', op = rng() < 0.5 ? '+' : '−';
  let nums;
  if (L === 1) {
    if (op === '+') { const a = 5 * ri(rng, 2, 17); nums = [a, 5 * ri(rng, 1, Math.floor((99 - a) / 5))]; }
    else { const a = 5 * ri(rng, 3, 19); nums = [a, 5 * ri(rng, 1, a / 5 - 1)]; }
  } else if (L === 2) {
    if (op === '+') nums = [5 * ri(rng, 20, 199), 5 * ri(rng, 20, 199)];
    else { const a = 5 * ri(rng, 40, 199); nums = [a, 5 * ri(rng, 10, a / 5 - 5)]; }
  } else if (op === '+') nums = Array.from({ length: rng() < 0.4 ? 3 : 2 }, () => ri(rng, 500, 3999));
  else { const a = ri(rng, 1000, 9999); nums = [a, ri(rng, 100, a - 1)]; }
  const res = op === '+' ? nums.reduce((a, b) => a + b, 0) : nums[0] - nums[1];
  const expr = nums.map(n => amt(n, unit)).join(` ${op} `);
  return { mod: 'tm', type: 'madd', prompt: op === '+' ? 'Add.' : 'Subtract.', nums, op, unit, expr, ans: amtVal(res, unit), res,
    sig: `ma${nums.join(op)}`, ew: expr.length * 0.6 + 6.5, eh: 1.1 + 1.6 };
}
function tmChange(rng, L) {
  let cost, paid;
  if (L === 1) { paid = 100; cost = 5 * ri(rng, 1, 19); }
  else if (L === 2) { paid = pick(rng, [500, 1000]); cost = 5 * ri(rng, 10, paid / 5 - 5); }
  else { paid = pick(rng, [1000, 2000, 5000]); cost = ri(rng, 100, paid - 1); }
  const unit = L === 1 ? 'c' : 'd', res = paid - cost;
  return { mod: 'tm', type: 'change', prompt: 'Find the change.', cost, paid, unit, ans: amtVal(res, unit), res, sig: `ch${cost}|${paid}`,
    ew: 22, eh: 1.1 + 1.5 * 2 + 0.2 };
}
function clockSvg(h, m, minor, hands) {   // hands: undefined/'ink' = ink, 'key' = answer color, false = blank face
  const pt = (len, deg) => { const a = deg * Math.PI / 180; return [(50 + len * Math.sin(a)).toFixed(2), (50 - len * Math.cos(a)).toFixed(2)]; };
  let t = '';
  for (let i = 0; i < 60; i++) {
    if (i % 5 && !minor) continue;
    const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 43 : 40;
    t += `M${(50 + r1 * Math.sin(a)).toFixed(2)} ${(50 - r1 * Math.cos(a)).toFixed(2)}L${(50 + 46 * Math.sin(a)).toFixed(2)} ${(50 - 46 * Math.cos(a)).toFixed(2)}`;
  }
  let nums = '';
  for (let i = 1; i <= 12; i++) { const [x, y] = pt(32, i * 30); nums += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="700" fill="var(--ink)">${i}</text>`; }
  const [hx, hy] = pt(20, (h % 12) * 30 + m * 0.5), [mx, my] = pt(30, m * 6);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1.1in" height="1.1in" viewBox="0 0 100 100" role="img" aria-label="Analog clock">`
    + `<circle cx="50" cy="50" r="48" fill="none" stroke="var(--ink)" stroke-width="2"/><path d="${t}" stroke="var(--ink)" stroke-width="1.2" fill="none"/>${nums}`
    + (hands === false ? '' : `<line class="hh" x1="50" y1="50" x2="${hx}" y2="${hy}" stroke="${hands === 'key' ? 'var(--key)' : 'var(--ink)'}" stroke-width="4.5" stroke-linecap="round"/>`
    + `<line class="mh" x1="50" y1="50" x2="${mx}" y2="${my}" stroke="${hands === 'key' ? 'var(--key)' : 'var(--ink)'}" stroke-width="2.6" stroke-linecap="round"/>`)
    + `<circle cx="50" cy="50" r="3" fill="var(--ink)"/></svg>`;
}
function tmClock(rng, L) {
  const h = ri(rng, 1, 12), m = L === 1 ? pick(rng, [0, 30]) : L === 2 ? 5 * ri(rng, 0, 11) : ri(rng, 0, 59);
  return { mod: 'tm', type: 'clock', prompt: 'What time is shown?', svg: clockSvg(h, m, L === 3), h, m, ans: `${h}:${tpad(m)}`, sig: `ck${h}:${m}`,
    win: 2.1, hin: 1.2, ew: 14, eh: 1 };
}
function tmElapsed(rng, L) {
  let s, d;
  if (L === 1) { s = 30 * ri(rng, 12, 32); d = 30 * ri(rng, 2, 8); }
  else if (L === 2) { s = 5 * ri(rng, 72, 192); d = 5 * ri(rng, 3, 48); }
  else { s = ri(rng, 360, 959); d = ri(rng, 20, 480); }
  const e = s + d, hh = Math.floor(d / 60), mm = d % 60;
  return { mod: 'tm', type: 'elapsed', prompt: 'How much time passes?', from: tfmt(s), to: tfmt(e), s, e, hh, mm, sig: `el${s}|${e}`, ew: 17, eh: 1.1 + 1.5 * 2 + 0.2 };
}

/* ----- 1.MD.B.3, 2.MD.C.7: digital time to analog hands and to words ----- */
function tmWords(h, m) {
  const nx = h % 12 + 1;
  return m === 0 ? `${h} o'clock` : m === 15 ? `quarter past ${h}` : m === 30 ? `half past ${h}` : m === 45 ? `quarter to ${nx}` : m < 30 ? `${m} minutes past ${h}` : `${60 - m} minutes to ${nx}`;
}
function tmDclock(rng, L) {
  const h = ri(rng, 1, 12), m = L === 1 ? pick(rng, [0, 30]) : 5 * ri(rng, 0, 11), draw = rng() < 0.5;
  return draw
    ? { mod: 'tm', type: 'dclock', variant: 'draw', prompt: 'Draw the hands on the clock.', h, m, ans: `${h}:${tpad(m)}`, sig: `dcd${h}:${m}`, win: 2.2, hin: 1.2, ew: 14, eh: 1 }
    : { mod: 'tm', type: 'dclock', variant: 'words', prompt: 'Write the time in words.', h, m, ans: tmWords(h, m), sig: `dcw${h}:${m}`, ew: 14, eh: 1.1 + 1.5 * 2 + 0.2 };
}
/* ----- 2.MD.C.7: a.m. and p.m. ----- */
const TM_EVENTS = [   // [event, earliest, latest] in minutes after midnight
  ['wake up', 330, 540], ['eat breakfast', 390, 570], ['get to school', 450, 540], ['eat a morning snack', 570, 660], ['see the sunrise', 330, 420],
  ['eat lunch', 735, 780], ['play after school', 900, 1050], ['eat dinner', 1020, 1170], ['take a bath', 1110, 1230], ['go to bed', 1170, 1320], ['look at the stars', 1200, 1350]
];
function tmAmpm(rng, L) {
  const [ev, lo, hi] = pick(rng, TM_EVENTS), step = L === 1 ? 30 : 5;
  const t = step * ri(rng, Math.ceil(lo / step), Math.floor(hi / step)), h24 = Math.floor(t / 60), m = t % 60, pm = h24 >= 12;
  const txt = `${ev[0].toUpperCase()}${ev.slice(1)} at ${h24 % 12 || 12}:${tpad(m)}`;
  return { mod: 'tm', type: 'ampm', prompt: 'Circle a.m. or p.m.', txt, ans: pm ? 'p.m.' : 'a.m.', sig: `ap${txt}`, ew: Math.max(13, txt.length * 0.6 + 1), eh: 1.1 + 1.5 * 2 + 0.2 };
}
/* ----- 1.MD.B.4, 2.MD.C.8: pictured coins (like coins, mixed coins and bills) and money stories ----- */
const TM_COIN = { q: 'quarter', d: 'dime', n: 'nickel', p: 'penny' }, TM_COIN_V = { q: 25, d: 10, n: 5, p: 1 };
/* Coins laid out left to right, wrapping so that no row is wider than 3.2 in. */
function tmCoinPic(list, key) {
  const rows = [[]], LIM = 320;
  for (const k of list) {
    const cur = rows[rows.length - 1], used = cur.reduce((a, c) => a + V_COIN[c].d, 0) + VCOIN_GAP * Math.max(0, cur.length - 1) + 2 * VCOIN_PAD;
    if (cur.length && used + VCOIN_GAP + V_COIN[k].d > LIM) rows.push([k]); else cur.push(k);
  }
  const w = Math.max(...rows.map(r => vcoinRow(r).w));
  const inner = rows.map((r, i) => { const row = vcoinRow(r); return r.map((k, j) => vcoin(k, row.at[j], 50 + 90 * i)).join(''); }).join('');
  return vsvg(w / 100, (rows.length * 90 + 10) / 100, inner, 'Coins');
}
const tmCoinDims = list => { const rows = [[]]; for (const k of list) { const cur = rows[rows.length - 1], used = cur.reduce((a, c) => a + V_COIN[c].d, 0) + VCOIN_GAP * Math.max(0, cur.length - 1) + 2 * VCOIN_PAD; if (cur.length && used + VCOIN_GAP + V_COIN[k].d > 320) rows.push([k]); else cur.push(k); }
  return [Math.max(...rows.map(r => vcoinRow(r).w)) / 100, (rows.length * 90 + 10) / 100]; };
function tmLike(rng, L) {
  const k = pick(rng, L === 1 ? ['p', 'n', 'd'] : ['p', 'n', 'd', 'q']), n = k === 'q' ? ri(rng, 2, 3) : ri(rng, 2, L === 1 ? 6 : 8);
  const list = Array(n).fill(k).map(c => TM_COIN[c]), [w, h] = tmCoinDims(list), total = n * TM_COIN_V[k];
  return { mod: 'tm', type: 'like', prompt: 'Count the coins.', list, unit: 'c', ans: String(total), total, sig: `lk${k}${n}`, win: Math.max(w, 2.2), hin: h + 0.45, ew: 14, eh: 1 };
}
function tmCpic(rng, L) {
  let list, total, bills, g = 0;
  do {
    const kinds = shuffle(rng, ['q', 'd', 'n', 'p']).slice(0, ri(rng, 2, L === 1 ? 3 : 4)), ids = [];
    for (const id of ['q', 'd', 'n', 'p']) if (kinds.includes(id)) for (let i = ri(rng, 1, 3); i > 0; i--) ids.push(id);
    list = ids; bills = [];
    if (L === 2 && rng() < 0.6) bills = [['b1', ri(rng, 1, 2)]];
    if (L === 3) bills = rng() < 0.5 ? [['b5', 1], ['b1', ri(rng, 1, 3)]] : [['b1', ri(rng, 1, 3)]];
    total = list.reduce((a, c) => a + TM_COIN_V[c], 0) + bills.reduce((a, b) => a + (b[0] === 'b5' ? 500 : 100) * b[1], 0);
  } while (g++ < 500 && (list.length > 8 || list.length < 3 || (L === 1 && total >= 100)));
  const unit = bills.length || total >= 100 ? 'd' : 'c', names = list.map(c => TM_COIN[c]), [w, h] = tmCoinDims(names);
  const billTxt = bills.map(([id, c]) => COIN_DEF.find(d => d[0] === id)[2](c)).join(' and ');
  return { mod: 'tm', type: 'cpic', prompt: 'Count the money.', list: names, billTxt, unit, ans: amtVal(total, unit), total, sig: `cp${list.join('')}|${billTxt}`,
    win: Math.max(w, 2.4), hin: h + 0.45 + (billTxt ? 0.35 : 0), ew: 14, eh: 1 };
}
const TM_NAMES = ['Mia', 'Sam', 'Ava', 'Ben', 'Zoe', 'Leo', 'Ivy', 'Max', 'Kai', 'Eli'];
const TM_BUYS = ['a sticker', 'a pencil', 'an apple', 'a ball', 'an eraser', 'a card', 'a balloon', 'a book', 'a toy car', 'a cookie', 'a notebook'];
function tmCstory(rng, L) {
  const unit = L === 1 || (L === 2 && rng() < 0.4) ? 'c' : 'd', c5 = (lo, hi) => 5 * ri(rng, Math.ceil(lo / 5), Math.floor(hi / 5));
  const [hLo, hHi, cLo] = unit === 'c' ? [50, 95, 10] : L === 2 ? [200, 995, 50] : [1000, 4000, 100];
  const nm = pick(rng, TM_NAMES), it = pick(rng, TM_BUYS), it2 = pick(rng, TM_BUYS.filter(x => x !== it));
  const kind = pick(rng, ['left', 'more', 'total', 'need', 'enough']), A = a => amt(a, unit);
  let text, res, yn = null;
  if (kind === 'left') { const have = c5(hLo, hHi), cost = c5(cLo, have - 5); res = have - cost; text = `${nm} has ${A(have)}. ${nm} buys ${it} for ${A(cost)}. How much money is left?`; }
  else if (kind === 'more') { const a = c5(hLo - 20, unit === 'c' ? 60 : hHi - cLo), b = c5(cLo, unit === 'c' ? 95 - a : hHi - a); res = a + b; text = `${nm} has ${A(a)}. Then ${nm} finds ${A(b)} more. How much money does ${nm} have now?`; }
  else if (kind === 'total') { const a = c5(cLo, unit === 'c' ? 45 : hHi / 2), b = c5(cLo, unit === 'c' ? 50 : hHi / 2); res = a + b; text = `${it[0].toUpperCase()}${it.slice(1)} costs ${A(a)}. ${it2[0].toUpperCase()}${it2.slice(1)} costs ${A(b)}. How much do they cost together?`; }
  else if (kind === 'need') { const have = c5(hLo / 5, hHi - 30), cost = c5(have + 5, Math.min(have + (unit === 'c' ? 40 : 300), unit === 'c' ? 95 : hHi)); res = cost - have; text = `${nm} has ${A(have)}. ${it[0].toUpperCase()}${it.slice(1)} costs ${A(cost)}. How much more money does ${nm} need?`; }
  else {
    let have, own;
    if (unit === 'c') { const d = ri(rng, 1, 6), n = ri(rng, 1, 4); have = 10 * d + 5 * n; own = `${d} dime${d > 1 ? 's' : ''} and ${n} nickel${n > 1 ? 's' : ''}`; }
    else { const b = ri(rng, 1, 4), q = ri(rng, 1, 3); have = 100 * b + 25 * q; own = `${b} $1 bill${b > 1 ? 's' : ''} and ${q} quarter${q > 1 ? 's' : ''}`; }
    let cost; do cost = have + 5 * ri(rng, -4, 4); while (cost === have || cost < 5);
    yn = have >= cost; res = have; text = `${nm} has ${own}. ${it[0].toUpperCase()}${it.slice(1)} costs ${A(cost)}. Does ${nm} have enough money?`;
  }
  return { mod: 'tm', type: 'cstory', prompt: 'Read and solve.', kind, text, unit, res, yn, ans: yn === null ? amtVal(res, unit) : yn ? 'yes' : 'no', wide: true,
    sig: `cs${text}`, ew: 21, eh: 1.1 + Math.ceil(text.length / 36) * 1.45 + 1.7 + 0.6 };
}

const UNIT_NAME = { s: ['second', 'seconds'], min: ['minute', 'minutes'], h: ['hour', 'hours'], day: ['day', 'days'], week: ['week', 'weeks'] };
const uTxt = (u, v) => `${v} ${UNIT_NAME[u][Number(v) === 1 ? 0 : 1]}`;
function tmConv(rng, L) {
  const U = (u, v) => ({ u, v: String(v) });
  const k = (a, b) => ri(rng, a, b);
  const T = {
    1: [() => { const n = k(1, 5); return [[U('h', n)], [U('min', 60 * n)]]; }, () => { const n = k(1, 5); return [[U('min', 60 * n)], [U('h', n)]]; },
      () => { const n = k(1, 4); return [[U('day', n)], [U('h', 24 * n)]]; }, () => { const n = k(1, 5); return [[U('week', n)], [U('day', 7 * n)]]; },
      () => { const n = k(1, 5); return [[U('min', n)], [U('s', 60 * n)]]; }],
    2: [() => { const h = k(1, 4), m = 5 * k(1, 11); return [[U('h', h), U('min', m)], [U('min', 60 * h + m)]]; },
      () => { const h = k(1, 4), m = 5 * k(1, 11); return [[U('min', 60 * h + m)], [U('h', h), U('min', m)]]; },
      () => { const n = k(2, 9); return [[U('day', n)], [U('h', 24 * n)]]; }, () => { const n = k(2, 6); return [[U('h', 24 * n)], [U('day', n)]]; },
      () => { const n = k(2, 9); return [[U('week', n)], [U('day', 7 * n)]]; }, () => { const n = k(2, 9); return [[U('min', n)], [U('s', 60 * n)]]; }],
    3: [() => { const m = k(2, 9), s = 5 * k(1, 11); return [[U('min', m), U('s', s)], [U('s', 60 * m + s)]]; },
      () => { const m = k(2, 9), s = 5 * k(1, 11); return [[U('s', 60 * m + s)], [U('min', m), U('s', s)]]; },
      () => { const d = k(1, 4), h = k(1, 23); return [[U('day', d), U('h', h)], [U('h', 24 * d + h)]]; },
      () => { const w = k(1, 6), d = k(1, 6); return [[U('week', w), U('day', d)], [U('day', 7 * w + d)]]; },
      () => { const h = k(2, 9), m = k(1, 59); return [[U('h', h), U('min', m)], [U('min', 60 * h + m)]]; },
      () => { const h = k(2, 9), m = k(1, 59); return [[U('min', 60 * h + m)], [U('h', h), U('min', m)]]; }]
  };
  const [from, to] = pick(rng, T[L])();
  const lhs = from.map(p => uTxt(p.u, p.v)).join(' ');
  return { mod: 'tm', type: 'conv', prompt: 'Convert.', from, to, lhs, sig: `cv${lhs}>${to.map(p => p.u)}`,
    ew: lhs.length * 0.6 + 4 + to.reduce((a, p) => a + 3.6 + UNIT_NAME[p.u][1].length * 0.58, 0), eh: 1.1 + 1.6 };
}

function tmHtml(p, key) {
  const x = (v, w) => ablank(v, key, w);
  switch (p.type) {
    case 'coins': return p.lines.map(l => `<div>${l}</div>`).join('') + `<div>Total = ${moneyBlank(p.total, p.unit, key, 3.4)}</div>`;
    case 'madd': return `${p.expr} = ${moneyBlank(p.res, p.unit, key, 3.6)}`;
    case 'change': return `<div>Cost ${amt(p.cost, p.unit)}&emsp;Paid $${centsD(p.paid)}</div><div>Change = ${moneyBlank(p.res, p.unit, key, 3.4)}</div>`;
    case 'clock': return `<div class="clk">${p.svg}<span>${x(p.ans, 3.4)}</span></div>`;
    case 'dclock': return p.variant === 'draw'
      ? `<div class="clk">${clockSvg(p.h, p.m, false, key ? 'key' : false)}<span class="dgt">${p.h}:${tpad(p.m)}</span></div>`
      : `<div><span class="dgt">${p.h}:${tpad(p.m)}</span></div><div>${x(p.ans, 11.5)}</div>`;
    case 'ampm': return `<div>${esc(p.txt)}</div><div>${vopts(['a.m.', 'p.m.'], p.ans, key)}</div>`;
    case 'like': return tmCoinPic(p.list) + `<div>Total = ${moneyBlank(p.total, 'c', key, 3.4)}</div>`;
    case 'cpic': return (p.billTxt ? `<div>${p.billTxt}</div>` : '') + tmCoinPic(p.list) + `<div>Total = ${moneyBlank(p.total, p.unit, key, 3.6)}</div>`;
    case 'cstory': return `<div class="wt">${esc(p.text)}</div><div>Answer: ${p.yn === null ? moneyBlank(p.res, p.unit, key, 3.6) : vopts(['yes', 'no'], p.ans, key)}</div>`;
    case 'elapsed': return `<div>${p.from} to ${p.to}</div><div>${x(p.hh, 2.2)} h&ensp;${x(p.mm, 2.2)} min</div>`;
    default: return `${esc(p.lhs)} = ${p.to.map(t => `${x(t.v, 3)} ${UNIT_NAME[t.u][1]}`).join(' ')}`;
  }
}

const TGEN = { coins: tmCoins, madd: tmMadd, change: tmChange, clock: tmClock, elapsed: tmElapsed, conv: tmConv, dclock: tmDclock, ampm: tmAmpm, like: tmLike, cpic: tmCpic, cstory: tmCstory };
const TM_TYPES = Object.keys(TGEN);
function genTmN(rng, st, n, chunk) {
  const ids = TM_TYPES.filter(id => st.tm.types[id]);
  return genMixed(rng, ids.length ? ids : ['coins'], n, chunk, (id, r) => TGEN[id](r, st.tm.level), p => p.sig);
}

REG.tm = {
  name: 'Time and Money', counts: [5, 10, 15, 20, 30], n0: 10, on0: false,
  plan(st, n, seed) { return arithPlan(st, 'tm', genTmN(rngFrom(seed), st, n, n)); }
};
