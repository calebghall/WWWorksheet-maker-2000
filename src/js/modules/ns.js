/* ---------- number sense ---------- */
const INT_PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];
const DEC_PLACES = ['tenths', 'hundredths', 'thousandths'];
/* Digit string html for a number given as int digits and decimal digits, underlining one position. */
function digitsHtml(ints, decs, ul) {
  let h = '';
  const n = ints.length;
  ints.forEach((ch, i) => {
    const c = ul && ul.part === 'i' && ul.i === i ? `<u>${ch}</u>` : ch;
    h += c; if (n >= 5 && i < n - 1 && (n - 1 - i) % 3 === 0) h += ',';
  });
  if (decs.length) { h += '.'; decs.forEach((ch, i) => { h += ul && ul.part === 'd' && ul.i === i ? `<u>${ch}</u>` : ch; }); }
  return h;
}
const rdigits = (rng, n, zeros) => {
  const a = [ri(rng, 1, 9)];
  for (let i = 1; i < n; i++) a.push(zeros && rng() < 0.2 ? 0 : ri(rng, 1, 9));
  return a;
};
function nsPlace(rng, L) {
  const dec = L === 3 && rng() < 0.45, variant = pick(rng, dec ? ['digit', 'which'] : (L === 1 ? ['digit', 'which', 'expand'] : ['digit', 'which', 'expand', 'standard']));
  let ints, decs = [];
  if (dec) { ints = rdigits(rng, ri(rng, 1, 2)); decs = rdigits(rng, ri(rng, 2, 3)); }
  else ints = rdigits(rng, L === 1 ? 3 : L === 2 ? ri(rng, 4, 5) : 6, variant === 'expand' || variant === 'standard');
  if (variant === 'standard' && ints.length > 4) ints = ints.slice(0, 4);
  const num = Number(ints.join(''));
  if (variant === 'expand' || variant === 'standard') {
    const terms = []; ints.forEach((dg, i) => { if (dg) terms.push(cnum(dg * P10(ints.length - 1 - i))); });
    const expd = terms.join(' + '), std = cnum(num), shown = digitsHtml(ints.map(String), [], null);
    return { mod: 'ns', type: 'place', prompt: variant === 'expand' ? 'Write in expanded form:' : 'Write in standard form:', variant, shown, expd, std, sig: `pl${variant}${std}`,
      ew: variant === 'expand' ? 12 : Math.max(expd.length * 0.62 + BW + 1.2, 10), eh: variant === 'expand' ? 1.1 + 1.6 + (expd.length > 22 ? 3.2 : 2.2) : 1.1 + 1.6 };
  }
  const pool = [];
  ints.forEach((dg, i) => { if (dg) pool.push({ part: 'i', i }); });
  decs.forEach((dg, i) => { if (dg) pool.push({ part: 'd', i }); });
  const t = pick(rng, pool), dg = t.part === 'i' ? ints[t.i] : decs[t.i];
  const place = t.part === 'i' ? INT_PLACES[ints.length - 1 - t.i] : DEC_PLACES[t.i];
  const val = t.part === 'i' ? cnum(dg * P10(ints.length - 1 - t.i)) : dstr(dg, t.i + 1);
  const shownU = digitsHtml(ints.map(String), decs.map(String), variant === 'digit' ? t : null);
  return { mod: 'ns', type: 'place', prompt: variant === 'digit' ? 'Value of the underlined digit:' : `Digit in the ${place} place:`, variant,
    shown: variant === 'digit' ? shownU : digitsHtml(ints.map(String), decs.map(String), null), ans: variant === 'digit' ? val : String(dg),
    sig: `pl${variant}${shownU}${place}`, ew: Math.max(12.5, (ints.length + decs.length + 2) * 0.62 + BW + 1.2), eh: 1.1 + 1.6 };
}
function nsCompare(rng, L) {
  let a, b;
  if (L === 3) {
    const dp = ri(rng, 1, 3), m = ri(rng, P10(dp) + 1, 9 * P10(dp) - 1);
    const sa = dstr(m, dp);
    const mode = rng();
    if (mode < 0.15) b = sa.includes('.') ? sa + '0' : sa;                 // equal, extra zero
    else if (mode < 0.55) b = dstr(m + pick(rng, [-1, 1, 10, -10]), dp);   // close
    else { const dp2 = ri(rng, 1, 3); b = dstr(ri(rng, P10(dp2) + 1, 9 * P10(dp2) - 1), dp2); }
    a = sa; if (rng() < 0.5) { const t = a; a = b; b = t; }
  } else {
    const n = L === 1 ? 3 : ri(rng, 4, 5), x = rdigits(rng, n, true), y = x.slice(), i = ri(rng, 0, n - 1);
    y[i] = (y[i] + ri(rng, 1, 8)) % 10; if (i === 0 && y[0] === 0) y[0] = 9;
    if (rng() < 0.3 && n > 2) { const j = ri(rng, 1, n - 1); const t = y[j]; y[j] = y[j - 1]; y[j - 1] = t; }
    a = String(Number(x.join(''))); b = String(Number(y.join('')));
    if (rng() < 0.08) b = a;
  }
  const va = Number(a), vb = Number(b), f = s => s.includes('.') ? s : cnum(Number(s));
  return { mod: 'ns', type: 'compare', prompt: 'Write <, > or =.', a: f(a), b: f(b), ans: sgn(va, vb), sig: `cp${a}|${b}`, ew: (a.length + b.length) * 0.62 + 4.6, eh: 1.1 + 1.8 };
}
function nsOrder(rng, L) {
  const cnt = L === 1 ? 3 : L === 2 ? 4 : 4, set = new Set(), vals = [];
  let g = 0;
  while (vals.length < cnt && g++ < 100) {
    let s;
    if (L === 3) { const dp = ri(rng, 1, 3); s = dstr(ri(rng, P10(dp - 1) + 1, 9 * P10(dp) - 1), dp); if (rng() < 0.4) s = '0.' + s.split('.')[1]; }
    else s = String(L === 1 ? ri(rng, 100, 999) : ri(rng, 1000, 9999));
    if (!set.has(Number(s))) { set.add(Number(s)); vals.push(s); }
  }
  const asc = rng() < 0.6, sorted = vals.slice().sort((x, y) => asc ? Number(x) - Number(y) : Number(y) - Number(x));
  const f = s => s.includes('.') ? s : cnum(Number(s));
  const shown = vals.map(f), ans = sorted.map(f);
  return { mod: 'ns', type: 'order', prompt: asc ? 'Order least to greatest:' : 'Order greatest to least:', shown, ans, sig: `or${vals.join(',')}${asc}`,
    ew: Math.max(shown.reduce((a, s) => a + s.length * 0.62 + 1.3, 0), ans.reduce((a, s) => a + s.length * 0.62 + 2.4, 0), 12), eh: 1.1 + 1.45 * 2 + 0.8 };
}
function nsRound(rng, L) {
  let n, unit, name, dp = 0;
  if (L === 1) { const big = rng() < 0.4; n = big ? ri(rng, 101, 999) : ri(rng, 11, 99); unit = 10; name = 'ten'; }
  else if (L === 2) { const k = pick(rng, [[10, 'ten', 101, 999], [100, 'hundred', 101, 9999], [1000, 'thousand', 1001, 9999]]); unit = k[0]; name = k[1]; n = ri(rng, k[2], k[3]); }
  else if (rng() < 0.5) { const k = pick(rng, [[1000, 'thousand'], [10000, 'ten thousand']]); unit = k[0]; name = k[1]; n = ri(rng, 10001, 999999); }
  else { dp = pick(rng, [1, 2, 3]); const q = pick(rng, dp === 1 ? [0] : dp === 2 ? [0, 1] : [0, 1, 2]);
    const m = ri(rng, 2 * P10(dp), 99 * P10(dp)), u = P10(dp - q), r = Math.floor((m + u / 2) / u);
    const nm = ['whole number', 'tenth', 'hundredth'][q];
    return { mod: 'ns', type: 'round', prompt: `Round to the nearest ${nm}:`, shown: dstr(m, dp), ans: q === 0 ? String(r) : dstr(r, q), sig: `rd${m}${dp}${q}`,
      ew: Math.max(13, (dstr(m, dp).length + 4) * 0.62 + BW + 1.6), eh: 1.1 + 1.6 };
  }
  if (n % unit === 0) n += ri(rng, 1, unit - 1);
  return { mod: 'ns', type: 'round', prompt: `Round to the nearest ${name}:`, shown: cnum(n), ans: cnum(rndTo(n, unit)), sig: `rd${n}${unit}`,
    ew: Math.max(13, (String(n).length + 4) * 0.62 + BW + 1.6), eh: 1.1 + 1.6 };
}
function nsSkip(rng, L) {
  let step, start, dec = false;
  if (L === 1) { step = pick(rng, [2, 5, 10]); start = step * ri(rng, 0, 4); }
  else if (L === 2) { step = pick(rng, [3, 4, 6, 7, 8, 9, 25]); start = step * ri(rng, 1, 6); if (rng() < 0.35) { step = -step; start += 6 * -step; } }
  else {
    dec = rng() < 0.5;
    if (dec) { step = pick(rng, [50, 25, 10, 20]); start = step * ri(rng, 0, 6); if (rng() < 0.3) { step = -step; start += 6 * -step; } }
    else { step = pick(rng, [12, 15, 25, 50, 250]); start = step * ri(rng, 1, 8); if (rng() < 0.3) { step = -step; start += 6 * -step; } }
  }
  const vals = Array.from({ length: 6 }, (_, i) => start + i * step);
  const f = v => dec ? trimZ(dstr(v, 2)) : cnum(v);
  const terms = vals.map(f), idx = shuffle(rng, [1, 2, 3, 4, 5]).slice(0, 2).sort((a, b) => a - b);
  return { mod: 'ns', type: 'skip', prompt: 'Fill in the missing numbers:', terms, idx, sig: `sk${terms.join(',')}${idx}`,
    ew: terms.reduce((a, s, i) => a + Math.max(s.length * 0.62 + 0.9, idx.includes(i) ? 3.0 : 0), 0) + 1, eh: 1.1 + 1.6 };
}
function nsParity(rng, L) {
  const nd = L === 1 ? 2 : L === 2 ? ri(rng, 3, 4) : ri(rng, 4, 6), num = () => Number(rdigits(rng, nd).join(''));
  if (rng() < 0.5) {
    const n = num();
    return { mod: 'ns', type: 'parity', prompt: 'Circle even or odd:', single: true, n: cnum(n), ans: n % 2 ? 'odd' : 'even', sig: `pa${n}`, ew: Math.max(12, String(n).length * 0.62 + 9), eh: 1.1 + 1.8 };
  }
  const want = rng() < 0.5 ? 0 : 1, list = [];
  let g = 0;
  const want_n = nd <= 3 ? 6 : nd === 4 ? 5 : 4;
  while (list.length < want_n && g++ < 200) { const n = num(); if (!list.includes(n) && (list.filter(x => x % 2 === want).length < Math.ceil(want_n / 2) || n % 2 !== want)) list.push(n); }
  if (!list.some(n => n % 2 === want)) list[0] = list[0] % 2 === want ? list[0] : list[0] + 1;
  return { mod: 'ns', type: 'parity', prompt: want ? 'Circle the odd numbers:' : 'Circle the even numbers:', single: false, list: list.map(cnum), on: list.map(n => n % 2 === want), sig: `pa${list}${want}`,
    ew: Math.max(12, list.reduce((a, n) => a + String(n).length * 0.62 + 1.4, 0)), eh: 1.1 + 1.8 };
}
function lineSvg(lo, hi, div, k) {
  const W = 270, x0 = 20, x1 = 250, y = 32, xs = i => x0 + (x1 - x0) * i / div, f = v => trimZ(dstr(v, 2));
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="2.7in" height="0.72in" viewBox="0 0 ${W} 72" role="img" aria-label="Number line from ${f(lo)} to ${f(hi)} with an arrow">`
    + `<path d="M${x0 - 10} ${y}H${x1 + 10}" stroke="var(--ink)" stroke-width="2" fill="none"/>`;
  let t = '';
  for (let i = 0; i <= div; i++) { const h = (i === 0 || i === div) ? 9 : 5; t += `M${xs(i)} ${y - h}V${y + h}`; }
  s += `<path d="${t}" stroke="var(--ink)" stroke-width="1.6" fill="none"/>`;
  s += `<text class="lab" x="${x0}" y="${y + 27}" text-anchor="middle">${f(lo)}</text><text class="lab" x="${x1}" y="${y + 27}" text-anchor="middle">${f(hi)}</text>`;
  const ax = xs(k);
  s += `<path d="M${ax} 4V19" stroke="var(--ink)" stroke-width="2" fill="none"/><path d="M${ax - 6} 15L${ax} 26L${ax + 6} 15Z" fill="var(--ink)"/>`;
  return s + '</svg>';
}
function nsLine(rng, L) {
  const cfg = L === 1 ? [[0, 10, 1]] : L === 2 ? [[0, 20, 2], [0, 50, 5], [0, 100, 10], [100, 200, 10]] : [[0, 1, 0.1], [0, 2, 0.2], [1, 2, 0.1], [0, 5, 0.5]];
  const [lo, hi] = pick(rng, cfg), lo100 = Math.round(lo * 100), hi100 = Math.round(hi * 100), div = 10, k = ri(rng, 1, div - 1);
  const v100 = lo100 + k * (hi100 - lo100) / div, ans = trimZ(dstr(Math.round(v100), 2));
  return { mod: 'ns', type: 'line', prompt: 'What number does the arrow show?', svg: lineSvg(lo100, hi100, div, k), ans, sig: `ln${lo100}${hi100}${k}`, win: 2.75, hin: 0.72 + 0.1, hfs: 1.7, ew: 14, eh: 1 };
}
function nsEst(rng, L) {
  let a, b, unit, name, op;
  if (L === 1) { unit = 10; name = 'ten'; op = rng() < 0.5 ? '+' : '−'; a = ri(rng, 12, 98); b = ri(rng, 12, 98); }
  else if (L === 2) { unit = 100; name = 'hundred'; op = rng() < 0.5 ? '+' : '−'; a = ri(rng, 120, 989); b = ri(rng, 120, 989); }
  else if (rng() < 0.5) { unit = 1000; name = 'thousand'; op = rng() < 0.5 ? '+' : '−'; a = ri(rng, 1200, 9890); b = ri(rng, 1200, 9890); }
  else { unit = 10; name = 'ten'; op = '×'; a = ri(rng, 12, 98); b = ri(rng, 12, 98); }
  if (op === '−' && a < b) { const t = a; a = b; b = t; }
  const ra = rndTo(a, unit), rb = rndTo(b, unit), r = op === '+' ? ra + rb : op === '−' ? ra - rb : ra * rb;
  return { mod: 'ns', type: 'est', prompt: `Estimate to the nearest ${name}:`, expr: `${cnum(a)} ${op} ${cnum(b)}`, ans: cnum(r), sig: `es${a}${op}${b}${unit}`,
    ew: (`${cnum(a)} ${op} ${cnum(b)} ≈`.length) * 0.62 + BW + 0.8, eh: 1.1 + 1.6 };
}
const NGEN = Object.assign({ place: nsPlace, compare: nsCompare, order: nsOrder, round: nsRound, skip: nsSkip, parity: nsParity, line: nsLine, est: nsEst }, NGEN_EXT);
const NS_TYPES = Object.keys(NGEN);

function genNsN(rng, st, n, chunk) {
  const ids = NS_TYPES.filter(id => st.ns.types[id]);
  return genMixed(rng, ids.length ? ids : ['place'], n, chunk, (id, r) => NGEN[id](r, st.ns.level), p => p.sig);
}

REG.ns = {
  name: 'Number Sense', counts: [5, 10, 15, 20, 30], n0: 10, on0: false,
  plan(st, n, seed) { return arithPlan(st, 'ns', genNsN(rngFrom(seed), st, n, n)); }
};
