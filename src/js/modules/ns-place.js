/* ---------- Number Sense: place value, comparing and rounding ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

/* Mentally add or subtract 10 or 100. L1 tens, L2 tens and hundreds, L3 extends to thousands. */
function nsxMore(rng, L) {
  const amt = pick(rng, L === 1 ? [10] : L === 2 ? [10, 100] : [1, 10, 100, 1000]), more = rng() < 0.5;
  const lo = L === 1 ? 10 : L === 2 ? 100 : 1000, hi = L === 1 ? 99 : L === 2 ? 999 : 9999;
  const base = more ? ri(rng, lo, hi - amt) : ri(rng, lo + amt, hi), ans = more ? base + amt : base - amt;
  return { mod: 'ns', type: 'more', prompt: 'Think in your head. Write the number.', base, amt, more, ans: cnum(ans), sig: `mo${base}${amt}${more}`, ew: `${amt} more than ${cnum(base)} =`.length * 0.6 + BW + 1, eh: 1.1 + 1.6 };
}

/* tens and ones. L1 standard, L2 flexible regrouping, L3 mixes both. */
function nsxTens(rng, L) {
  const kind = L === 3 ? pick(rng, [1, 2]) : L, n = ri(rng, 11, 99);
  if (kind === 1) {
    const t = Math.floor(n / 10), o = n % 10;
    return tokProb('tens', 'Write the tens and ones:', rng() < 0.55 ? [`${n} = `, U(t), ' tens ', U(o), ' ones'] : [`${t} tens ${o} ones = `, U(n)]);
  }
  const t = ri(rng, 0, Math.floor(n / 10) - 1);
  return tokProb('tens', 'Write the missing ones:', [`${n} = ${t} tens and `, U(n - 10 * t), ' ones']);
}

/* denominators 10 and 100. L1 rename tenths as hundredths, L2 add tenths and hundredths, L3 both. */
function nsxF100(rng, L) {
  const kind = L === 3 ? pick(rng, [1, 2]) : L;
  if (kind === 1) { const a = ri(rng, 1, 9); return { mod: 'ns', type: 'f100', prompt: 'Write an equivalent fraction:', kind: 1, a, ans: String(a * 10), sig: `f1${a}`, ew: 11, eh: 1.1 + 2.6 }; }
  const a = ri(rng, 1, 9), b = ri(rng, 1, Math.min(40, 99 - a * 10));
  return { mod: 'ns', type: 'f100', prompt: 'Add. Write the sum with denominator 100:', kind: 2, a, b, ans: String(a * 10 + b), sig: `f2${a}.${b}`, ew: 15, eh: 1.1 + 2.6 };
}

/* round to the nearest 10 (L1) or 100 (L2) with a number line; L3 mixes both and plain problems. */
function nsxRnd3(rng, L) {
  const unit = L === 1 ? 10 : L === 2 ? 100 : pick(rng, [10, 100]), name = unit === 10 ? 'ten' : 'hundred';
  if (L === 3 && rng() < 0.5) {
    let n = unit === 10 ? ri(rng, 11, 999) : ri(rng, 101, 999); if (n % unit === 0) n++;
    return { mod: 'ns', type: 'rnd3', prompt: `Round to the nearest ${name}:`, kind: 'plain', unit, n, shown: cnum(n), ans: cnum(rndTo(n, unit)), sig: `r3p${n}${unit}`, ew: 13, eh: 1.1 + 1.6 };
  }
  const lo = unit * (unit === 10 ? ri(rng, 1, 99) : ri(rng, 1, 9)), k = ri(rng, 1, 9), n = lo + k * unit / 10;
  return { mod: 'ns', type: 'rnd3', prompt: `Use the number line to round ${cnum(n)} to the nearest ${name}:`, kind: 'line', unit, n, lo, k, svg: lineSvg(lo * 100, (lo + unit) * 100, 10, k), shown: cnum(n), ans: cnum(rndTo(n, unit)),
    sig: `r3l${n}${unit}`, win: 2.75, hin: 0.72 + 0.45, hfs: 3.2, ew: 14, eh: 1 };
}

/* read and write numbers to 120 (L1 to 20, L2 to 99, L3 to 120). */
const NK_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

const NK_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

const numWord = n => n < 20 ? NK_ONES[n] : n < 100 ? NK_TENS[Math.floor(n / 10)] + (n % 10 ? '-' + NK_ONES[n % 10] : '') : n === 100 ? 'one hundred' : 'one hundred ' + numWord(n - 100);

function nkBlocks(n) {
  const h = Math.floor(n / 100), t = Math.floor(n % 100 / 10), o = n % 10, RW = 12, RG = 4, RH = 60;
  let x = 4, s = '';
  if (h) { s += `<rect x="${x}" y="2" width="${RW * 10}" height="${RH}" fill="var(--c2)" stroke="var(--ink)" stroke-width="1.5"/>`; for (let i = 1; i < 10; i++) s += `<path d="M${x + i * RW} 2V${RH + 2}M${x} ${2 + i * 6}H${x + RW * 10}" stroke="var(--ink)" stroke-width=".6"/>`; x += RW * 10 + 10; }
  for (let i = 0; i < t; i++) { s += `<rect x="${x}" y="2" width="${RW}" height="${RH}" fill="var(--c0)" stroke="var(--ink)" stroke-width="1.5"/>`; for (let j = 1; j < 10; j++) s += `<path d="M${x} ${2 + j * 6}H${x + RW}" stroke="var(--ink)" stroke-width=".6"/>`; x += RW + RG; }
  x += o ? 8 : 0;
  for (let i = 0; i < o; i++) s += `<rect x="${x + (i % 5) * 16}" y="${2 + Math.floor(i / 5) * 16}" width="12" height="12" fill="var(--c1)" stroke="var(--ink)" stroke-width="1.5"/>`;
  const w = x + (o ? Math.min(o, 5) * 16 : 0) + 4;
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${w / 100}in" height="${(RH + 4) / 100}in" viewBox="0 0 ${w} ${RH + 4}" role="img" aria-label="Base-ten blocks" style="display:block">${s}</svg>`, w: w / 100 };
}

function nsxNumrw(rng, L) {
  const mx = L === 1 ? 20 : L === 2 ? 99 : 120, n = ri(rng, L === 1 ? 1 : 10, mx), v = pick(rng, L === 1 ? ['w2n', 'n2w', 'blocks'] : ['w2n', 'n2w', 'blocks', 'to']);
  const base = { mod: 'ns', type: 'numrw', variant: v, n, sig: `nr${v}${n}` };
  if (v === 'w2n') return Object.assign(base, { prompt: 'Write the number.', word: numWord(n), ans: String(n), ew: numWord(n).length * 0.6 + BW + 2, eh: 1.1 + 1.6 });
  if (v === 'n2w') return Object.assign(base, { prompt: 'Write the number in words.', ans: numWord(n), ew: Math.max(14, numWord(n).length * 0.6 + 2), eh: 1.1 + 1.6 * 2 });
  if (v === 'to') { const t = Math.floor(n / 10), o = n % 10; return Object.assign(base, { prompt: 'Write the number.', t, o, ans: String(n), ew: 17, eh: 1.1 + 1.6 }); }
  const b = nkBlocks(n);
  return Object.assign(base, { prompt: 'Write the number.', ans: String(n), win: Math.max(b.w, 1.8), hin: 0.64 + 0.4, ew: 14, eh: 1 });
}

const nsNumrwHtml = (p, key, x) => p.variant === 'w2n' ? `${esc(p.word)} = ${x(p.ans, 3.4)}`
  : p.variant === 'n2w' ? `<div>${p.n}</div><div><span class="blank" style="min-width:${Math.max(12, p.ans.length * 0.6 + 1).toFixed(1)}em">${key ? esc(p.ans) : '&nbsp;'}</span></div>`
  : p.variant === 'to' ? `${p.t} ${p.t === 1 ? 'ten' : 'tens'} ${p.o} ${p.o === 1 ? 'one' : 'ones'} = ${x(p.ans, 3.4)}`
  : nkBlocks(p.n).svg + `<div>${x(p.ans, 3.4)}</div>`;

/* compare two-digit numbers (L1 different tens, L2 any, L3 with equal numbers). */
function nsxCmp2(rng, L) {
  let a, b;
  for (let g = 0; g < 200; g++) {
    a = ri(rng, 10, 99); b = L === 1 || (L === 2 && rng() < 0.4) ? ri(rng, 10, 99) : Math.max(10, Math.min(99, a + ri(rng, -9, 9)));
    if (L === 3 && rng() < 0.1) b = a;
    if ((L === 1 && Math.floor(a / 10) === Math.floor(b / 10)) || (a === b && L < 3)) continue;
    break;
  }
  return { mod: 'ns', type: 'compare', prompt: 'Write <, > or =.', a: String(a), b: String(b), ans: sgn(a, b), sig: `cp${a}|${b}`, ew: 4 * 0.62 + 4.6, eh: 1.1 + 1.8 };
}

/* 10 more or 10 less, with the explanation line. */
function nsxMoreExp(rng, L) {
  const more = rng() < 0.5, base = more ? ri(rng, 10, 89) : ri(rng, 20, 99), ans = more ? base + 10 : base - 10;
  return { mod: 'ns', type: 'moreexp', prompt: 'Write the number. Then explain.', base, more, ans: String(ans), sig: `me${base}${more}`, ew: 22, eh: 1.1 + 1.6 * 3 };
}

const nsMoreexpHtml = (p, key, x) => `<div>10 ${p.more ? 'more' : 'less'} than ${cnum(p.base)} = ${x(p.ans, BW)}</div><div>How do you know?</div><div><span class="blank" style="min-width:20em">${key ? `The tens digit ${p.more ? 'goes up' : 'goes down'} by 1.` : '&nbsp;'}</span></div>`;

const INT_PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];

const DEC_PLACES = ['tenths', 'hundredths', 'thousandths'];

/* Digit string html for a number given as int digits and decimal digits, underlining one position. */
function digitsHtml(ints, decs, ul) {
  let h = '';
  const n = ints.length;
  ints.forEach((ch, i) => {
    const c = ul && ul.part === 'i' && ul.i === i ? `<u>${ch}</u>` : ch;
    h += c; if (n >= 4 && i < n - 1 && (n - 1 - i) % 3 === 0) h += ',';
  });
  if (decs.length) { h += '.'; decs.forEach((ch, i) => { h += ul && ul.part === 'd' && ul.i === i ? `<u>${ch}</u>` : ch; }); }
  return h;
}

function nsPlace(rng, L, whole) {
  const dec = !whole && L === 3 && rng() < 0.45, variant = pick(rng, dec ? ['digit', 'which'] : (L === 1 ? ['digit', 'which', 'expand'] : ['digit', 'which', 'expand', 'standard']));
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

function nsPlaceHtml(p, key, x) {
  if (p.variant === 'expand') return `${p.shown} =<span class="wl">${key ? esc(p.expd) : '&nbsp;'}</span>`;
  if (p.variant === 'standard') return `${p.expd} = ${x(p.std, 3.4)}`;
  return `${p.shown} ${p.variant === 'digit' ? '=' : '→'} ${x(p.ans, 3.2)}`;
}

const nsCompareHtml = (p, key, x) => `${p.a}<span class="cb">${key ? esc(p.ans) : '&nbsp;'}</span>${p.b}`;

const nsOrderHtml = (p, key, x) => `<div>${p.shown.join(',&ensp;')}</div><div class="ol">${p.ans.map(a => `<span class="blank" style="min-width:${(a.length * 0.62 + 1.4).toFixed(1)}em">${key ? esc(a) : '&nbsp;'}</span>`).join(' ')}</div>`;

const nsRoundHtml = (p, key, x) => `${p.shown} ≈ ${x(p.ans, 3.2)}`;

const nsRnd3Html = (p, key, x) => p.kind === 'line' ? `${p.svg}<div>${p.shown} ≈ ${x(p.ans, 3.2)}</div>` : `${p.shown} ≈ ${x(p.ans, 3.2)}`;

const nsEstHtml = (p, key, x) => `${esc(p.expr)} ≈ ${x(p.ans, 3.4)}`;

const nsMoreHtml = (p, key, x) => `${cnum(p.amt)} ${p.more ? 'more' : 'less'} than ${cnum(p.base)} = ${x(p.ans, BW)}`;

const nsTensHtml = (p, key, x) => tokHtml(p.tok, key, x);

const nsF100Html = (p, key, x) => p.kind === 1 ? `${frH(p.a, 10)} = ${frBox(p.ans, 100, 'n', key)}` : `${frH(p.a, 10)} + ${frH(p.b, 100)} = ${frBox(p.ans, 100, 'n', key)}`;

/* Place value with whole numbers only (up to 999,999): the "place" problems without the decimal mix. */
const nsxPlaceW = (rng, L) => nsPlace(rng, L, true);

/* Round a whole number to the nearest ten, hundred, thousand, ten thousand or hundred thousand.
   L1 tens and hundreds, L2 up to thousands, L3 from hundreds up to hundred thousands. */
function nsxRoundW(rng, L) {
  const places = [[10, 'ten'], [100, 'hundred'], [1000, 'thousand'], [10000, 'ten thousand'], [100000, 'hundred thousand']];
  const [unit, name] = pick(rng, L === 1 ? places.slice(0, 2) : L === 2 ? places.slice(0, 3) : places.slice(1));
  const lo = Math.max(unit + 1, L === 1 ? 101 : L === 2 ? 1001 : 10001), hi = L === 1 ? 9999 : L === 2 ? 99999 : 999999;
  let n = ri(rng, lo, hi);
  if (n % unit === 0) n += ri(rng, 1, unit - 1);
  return { mod: 'ns', type: 'round', prompt: `Round to the nearest ${name}:`, shown: cnum(n), ans: cnum(rndTo(n, unit)), sig: `rd${n}${unit}`,
    ew: Math.max(13, (String(n).length + 4) * 0.62 + BW + 1.6), eh: 1.1 + 1.6 };
}

/* Tenths and hundredths: fraction to decimal, decimal to fraction, and decimals on a number line.
   L1 tenths, L2 hundredths, L3 both. The hundredths number line zooms in on one tenth. */
function nsxFdec(rng, L) {
  const kind = pick(rng, L === 1 ? ['f2d', 'd2f'] : ['f2d', 'd2f', 'line']), den = L === 1 ? 10 : L === 2 ? 100 : pick(rng, [10, 100]), dp = den === 10 ? 1 : 2;
  if (kind === 'line') {
    const k = ri(rng, 1, 9), lo = den === 10 ? 0 : 10 * ri(rng, 0, 9), m = den === 10 ? k : lo + k;
    return { mod: 'ns', type: 'fdec', prompt: 'Write the decimal the arrow points to:', kind, m, den, dec: dstr(m, dp), ans: dstr(m, dp), svg: den === 10 ? lineSvg(0, 100, 10, k) : lineSvg(lo, lo + 10, 10, k),
      sig: `fdl${m}/${den}`, win: 2.75, hin: 0.72 + 0.45, hfs: 3.2, ew: 14, eh: 1 };
  }
  let m = ri(rng, 1, den === 10 ? 9 : 99);
  while (den === 100 && m % 10 === 0) m = ri(rng, 1, 99);
  const dec = dstr(m, dp);
  return { mod: 'ns', type: 'fdec', prompt: kind === 'f2d' ? 'Write as a decimal:' : 'Write as a fraction:', kind, m, den, dec, ans: kind === 'f2d' ? dec : String(m), sig: `fd${kind}${m}/${den}`, ew: 11, eh: 1.1 + 2.6 };
}

const nsFdecHtml = (p, key, x) => p.kind === 'f2d' ? `${frH(p.m, p.den)} = ${x(p.dec, 3.4)}` : p.kind === 'd2f' ? `${p.dec} = ${frBox(p.m, p.den, 'n', key)}` : `${p.svg}<div>Decimal: ${x(p.dec, 3.4)}</div>`;

/* The ten-times relationship between places: compare two equal digits side by side, 10 times as much, one tenth as much. */
function nsxTenx(rng, L) {
  const kind = pick(rng, L === 1 ? ['x10', 'div10'] : ['x10', 'div10', 'dig', 'dig']), bd = L === 1 ? 2 : L === 2 ? 3 : 5;
  if (kind === 'dig') {
    const len = L === 2 ? ri(rng, 3, 5) : ri(rng, 4, 6), i = ri(rng, 0, len - 2), d = ri(rng, 1, 9);
    const dg = Array.from({ length: len }, () => ri(rng, 0, 9)); dg[0] = Math.max(1, dg[0]); dg[i] = d; dg[i + 1] = d;
    const shown = dg.map((c, j) => (j === i || j === i + 1 ? `<u>${c}</u>` : String(c)) + (len >= 4 && j < len - 1 && (len - 1 - j) % 3 === 0 ? ',' : '')).join('');
    return { mod: 'ns', type: 'tenx', prompt: 'Compare the underlined digits:', kind, shown, ans: '10', sig: `txd${dg.join('')}${i}`, ew: (len + 16) * 0.62 + 4, eh: 1.1 + 1.6 };
  }
  if (kind === 'x10') {
    const a = ri(rng, P10(bd - 1) + 1, P10(bd) - 1);
    return { mod: 'ns', type: 'tenx', prompt: 'Write 10 times as much:', kind, a, ans: cnum(a * 10), sig: `tx1${a}`, ew: (String(a).length + 6) * 0.62 + BW + 1, eh: 1.1 + 1.6 };
  }
  const a = 10 * ri(rng, Math.max(2, P10(bd - 2)), P10(bd - 1) - 1);
  return { mod: 'ns', type: 'tenx', prompt: 'Write one tenth as much:', kind, a, ans: cnum(a / 10), sig: `tx2${a}`, ew: (String(a).length + 6) * 0.62 + BW + 1, eh: 1.1 + 1.6 };
}

const nsTenxHtml = (p, key, x) => p.kind === 'dig' ? `${p.shown}&emsp;left = ${x(p.ans, 2.8)} × right` : p.kind === 'x10' ? `10 × ${cnum(p.a)} = ${x(p.ans, 4)}` : `${cnum(p.a)} ÷ 10 = ${x(p.ans, 3.6)}`;

/* Compare two numerals up to 10 in words: greater than, less than or equal to. L1 numerals 1 to 5, never equal; L2 and L3 numerals 0 to 10, sometimes equal. */
function nsxCmpw(rng, L) {
  const lo = L === 1 ? 1 : 0, hi = L === 1 ? 5 : 10, a = ri(rng, lo, hi); let b = ri(rng, lo, hi);
  if (L === 1 || rng() >= 0.2) { while (b === a) b = ri(rng, lo, hi); } else b = a;
  return { mod: 'ns', type: 'cmpw', prompt: 'Circle the answer.', a, b, ans: a > b ? 'greater than' : a < b ? 'less than' : 'equal to', sig: `cmw${a}|${b}`, ew: 22, eh: 1.1 + 3 * 1.5 };
}

const nsCmpwHtml = (p, key, x) => `<div>${p.a} is</div><div>${opts(['greater than', 'less than', 'equal to'], p.ans, key)}</div><div>${p.b}</div>`;

/* Read and write numbers to 1000 in standard, word and expanded form. L1 words and numerals only; L2 adds expanded form;
   L3 adds numbers with zeros in the tens or ones place and 1000. */
const nsW3 = n => n === 1000 ? 'one thousand' : n < 100 ? numWord(n) : NK_ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + numWord(n % 100) : '');
const nsExp3 = n => [Math.floor(n / 100) * 100, Math.floor(n / 10) % 10 * 10, n % 10].filter(v => v > 0).join(' + ');

function nsxNumrw3(rng, L) {
  let v = pick(rng, L === 1 ? ['w2n', 'n2w'] : ['w2n', 'n2w', 'e2s', 's2e']);
  let n = ri(rng, 100, 999);
  if (L === 3) { const r = rng(); if (r < 0.08) { n = 1000; if (v === 'e2s' || v === 's2e') v = rng() < 0.5 ? 'w2n' : 'n2w'; } else if (r < 0.55) n = ri(rng, 1, 9) * 100 + (rng() < 0.5 ? 0 : ri(rng, 1, 9) * 10) + (rng() < 0.5 ? 0 : ri(rng, 1, 9)); }
  else if (L < 3) { while (n % 10 === 0 || Math.floor(n / 10) % 10 === 0) n = ri(rng, 100, 999); }
  const base = { mod: 'ns', type: 'numrw3', variant: v, n, sig: `n3${v}${n}` };
  const w = nsW3(n), e = n === 1000 ? '1,000' : nsExp3(n);
  if (v === 'w2n') return Object.assign(base, { prompt: 'Write the number.', word: w, ans: cnum(n), ew: w.length * 0.6 + BW + 2, eh: 1.1 + 1.6 });
  if (v === 'n2w') return Object.assign(base, { prompt: 'Write the number in words.', ans: w, ew: Math.max(14, w.length * 0.6 + 2), eh: 1.1 + 1.6 * 2 });
  if (v === 'e2s') return Object.assign(base, { prompt: 'Write the number.', exp: e, ans: cnum(n), ew: e.length * 0.62 + BW + 2, eh: 1.1 + 1.6 });
  return Object.assign(base, { prompt: 'Write the number in expanded form.', ans: n === 1000 ? '1,000' : e, ew: Math.max(14, e.length * 0.62 + 2), eh: 1.1 + 1.6 * 2 });
}

const nsNumrw3Html = (p, key, x) => p.variant === 'w2n' ? `${esc(p.word)} = ${x(p.ans, 3.4)}`
  : p.variant === 'e2s' ? `${esc(p.exp)} = ${x(p.ans, 3.4)}`
  : `<div>${cnum(p.n)}</div><div><span class="blank" style="min-width:${Math.max(12, p.ans.length * 0.6 + 1).toFixed(1)}em">${key ? esc(p.ans) : '&nbsp;'}</span></div>`;

defTypes("ns", "Place value, comparing and rounding", [
  { id: "place", label: "Place value", blurb: "Underlined digit, digit in a place, expanded and standard form.", on: true, gen: nsPlace, html: nsPlaceHtml },
  { id: "compare", label: "Compare numbers", blurb: "Write <, > or = between two numbers.", on: true, gen: nsCompare, html: nsCompareHtml },
  { id: "cmp2", label: "Compare two-digit numbers", blurb: "Write <, > or = between numbers 10 to 99.", on: false, gen: nsxCmp2 },
  { id: "order", label: "Order numbers", blurb: "Least to greatest or greatest to least.", on: true, gen: nsOrder, html: nsOrderHtml },
  { id: "round", label: "Rounding", blurb: "Whole numbers and decimals.", on: true, gen: nsRound, html: nsRoundHtml },
  { id: "rnd3", label: "Round to 10 or 100", blurb: "Plain problems and number lines.", on: false, gen: nsxRnd3, html: nsRnd3Html },
  { id: "est", label: "Estimation", blurb: "Round each number, then add, subtract or multiply.", on: true, gen: nsEst, html: nsEstHtml },
  { id: "numrw", label: "Read and write numbers", blurb: "Number words, tens and ones, and base-ten blocks, to 120.", on: false, gen: nsxNumrw, html: nsNumrwHtml },
  { id: "more", label: "Mentally add or subtract 10 or 100", blurb: "10 more or less, 100 more or less.", on: false, gen: nsxMore, html: nsMoreHtml },
  { id: "moreexp", label: "10 more or less, explained", blurb: "Write the number and say how you know.", on: false, gen: nsxMoreExp, html: nsMoreexpHtml },
  { id: "tens", label: "Tens and ones", blurb: "Write a number as tens and ones.", on: false, gen: nsxTens, html: nsTensHtml },
  { id: "f100", label: "Tenths and hundredths", blurb: "Rename tenths as hundredths and add.", on: false, gen: nsxF100, html: nsF100Html },
{ id: "placew", label: "Place value, whole numbers", blurb: "Place value, expanded form and standard form with whole numbers to 999,999.", on: false, gen: nsxPlaceW },
{ id: "roundw", label: "Round whole numbers", blurb: "To any place from tens to hundred thousands.", on: false, gen: nsxRoundW },
{ id: "fdec", label: "Fractions and decimals", blurb: "Tenths and hundredths: fraction to decimal, decimal to fraction, decimals on a number line.", on: false, gen: nsxFdec, html: nsFdecHtml },
{ id: "tenx", label: "Ten times as much", blurb: "How much a digit is worth next to the same digit, 10 times and one tenth.", on: false, gen: nsxTenx, html: nsTenxHtml },
{ id: "cmpw", label: "Compare numerals to 10 in words", blurb: "Is one numeral greater than, less than or equal to another? Numerals 0 to 10.", on: false, gen: nsxCmpw, html: nsCmpwHtml },
{ id: "numrw3", label: "Read and write numbers to 1000", blurb: "Standard form, word form and expanded form, 100 to 1,000.", on: false, gen: nsxNumrw3, html: nsNumrw3Html }
]);
