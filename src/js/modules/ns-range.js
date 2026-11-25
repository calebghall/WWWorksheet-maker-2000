/* ---------- Number Sense: larger number ranges ----------
   Texas extends several skills past the ranges the earlier types cover. Each type here keeps one skill and lets the level choose the range:
   cmprng  compare two numbers: L1 to 120 (1.2E), L2 to 1,200 (2.2D), L3 to 100,000 (3.2D)
   ordrng  order numbers: L1 to 1,200 (2.2D), L2 to 100,000 (3.2D), L3 six to nine digits (4.2C)
   numrw12 standard, word and expanded form to 1,200 (2.2B)
   bign    compare and place value with six to nine digits (4.2B, 4.2C)
   par40   odd and even to 40 (2.7A) */

const NR_PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions', 'ten millions', 'hundred millions'];
const nrClamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const nrW = n => n >= 1000 ? 'one thousand' + (n % 1000 ? ' ' + (n % 1000 < 100 ? numWord(n % 1000) : nsW3(n % 1000)) : '') : nsW3(n);
const nrExp = n => [n >= 1000 ? 1000 : 0, Math.floor(n % 1000 / 100) * 100, Math.floor(n / 10) % 10 * 10, n % 10].filter(v => v > 0).map(cnum).join(' + ');

/* A number close to another one with the same number of digits: one digit changes, or two neighbors swap. */
function nrNear(rng, n) {
  const d = String(n).split('').map(Number), i = ri(rng, 0, d.length - 1);
  if (rng() < 0.3 && d.length > 2) { const j = ri(rng, 1, d.length - 1); const t = d[j]; d[j] = d[j - 1]; d[j - 1] = t; }
  else d[i] = (d[i] + ri(rng, 1, 8)) % 10;
  if (d[0] === 0) d[0] = ri(rng, 1, 9);
  return Number(d.join(''));
}

function nsCmpRng(rng, L) {
  let a, b;
  for (let g = 0; g < 200; g++) {
    if (L === 1) {
      if (rng() < 0.4) { a = ri(rng, 90, 99); b = ri(rng, 100, 120); } else { a = ri(rng, 10, 120); b = rng() < 0.5 ? nrClamp(a + ri(rng, -12, 12), 10, 120) : ri(rng, 10, 120); }
    } else if (L === 2) {
      a = ri(rng, 100, 1200); b = rng() < 0.7 ? nrClamp(nrNear(rng, a), 100, 1200) : ri(rng, 100, 1200);
      if (rng() < 0.2) { a = ri(rng, 900, 999); b = ri(rng, 1000, 1200); }
    } else {
      a = ri(rng, 10000, 99999); b = rng() < 0.75 ? nrNear(rng, a) : ri(rng, 10000, 99999);
      if (rng() < 0.12) { a = 100000; b = ri(rng, 99000, 99999); }
    }
    if (rng() < 0.1) b = a;
    if (a !== b || rng() < 0.1) break;
  }
  if (rng() < 0.5) { const t = a; a = b; b = t; }
  return { mod: 'ns', type: 'compare', prompt: 'Write <, > or =.', a: cnum(a), b: cnum(b), ans: sgn(a, b), sig: `cr${a}|${b}`, ew: (cnum(a).length + cnum(b).length) * 0.62 + 4.6, eh: 1.1 + 1.8 };
}

function nsOrdRng(rng, L) {
  const cnt = L === 1 ? 3 : 4, set = new Set(), vals = [], d = L === 3 ? ri(rng, 6, 9) : 0;
  const lo = L === 1 ? 100 : L === 2 ? 10000 : Math.pow(10, d - 1), hi = L === 1 ? 1200 : L === 2 ? 99999 : Math.pow(10, d) - 1;
  let base = ri(rng, lo, hi);
  for (let g = 0; vals.length < cnt && g < 300; g++) {
    const n = vals.length === 0 ? base : (rng() < 0.65 ? nrClamp(base + ri(rng, -Math.pow(10, Math.max(2, String(base).length - 3)), Math.pow(10, Math.max(2, String(base).length - 3))), lo, hi) : ri(rng, lo, hi));
    if (!set.has(n)) { set.add(n); vals.push(n); }
  }
  if (L === 2 && rng() < 0.15) vals[vals.length - 1] = 100000;
  const asc = rng() < 0.6, sorted = vals.slice().sort((x, y) => asc ? x - y : y - x), shown = vals.map(cnum), ans = sorted.map(cnum);
  return { mod: 'ns', type: 'ordrng', prompt: asc ? 'Order least to greatest:' : 'Order greatest to least:', shown, ans, sig: `oq${vals.join(',')}${asc}`,
    ew: Math.min(22, Math.max(shown.reduce((a, s) => a + s.length * 0.62 + 1.3, 0), ans.reduce((a, s) => a + s.length * 0.62 + 2.4, 0), 12)),
    eh: 1.1 + 1.45 * (nrLines(shown) + nrLines(ans)) + 0.8 };
}
/* Lines needed when numbers wrap in a cell about 20 characters wide; measured wide so that wider fonts still fit. */
function nrLines(list) { const per = Math.max(1, Math.floor(20 / (Math.max(...list.map(s => s.length)) * 0.7 + 1.6))); return Math.ceil(list.length / per); }
const nsOrdRngHtml = (p, key, x) => `<div style="display:flex;flex-wrap:wrap;gap:.1em .8em">${p.shown.map(v => `<span style="white-space:nowrap">${v}</span>`).join('')}</div><div style="display:flex;flex-wrap:wrap;gap:.35em .6em;max-width:100%">${p.ans.map(a => `<span class="blank" style="min-width:${(a.length * 0.58 + 1.2).toFixed(1)}em;max-width:100%">${key ? esc(a) : '&nbsp;'}</span>`).join('')}</div>`;

/* Read and write numbers to 1,200. L1 100 to 999 in words and numerals; L2 adds expanded form and 1,000 to 1,200; L3 adds zeros in the tens or ones place. */
function nsNumrw12(rng, L) {
  let v = pick(rng, L === 1 ? ['w2n', 'n2w'] : ['w2n', 'n2w', 'e2s', 's2e']), n = ri(rng, 100, 999);
  if (L >= 2 && rng() < 0.45) n = ri(rng, 1000, 1200);
  if (L < 3) { while (n % 10 === 0 || Math.floor(n / 10) % 10 === 0) n = L === 1 ? ri(rng, 100, 999) : (rng() < 0.45 ? ri(rng, 1000, 1200) : ri(rng, 100, 999)); }
  else { const r = rng(); if (r < 0.5) n = pick(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) * 100 + (rng() < 0.5 ? 0 : ri(rng, 1, 9) * 10) + (rng() < 0.5 ? 0 : ri(rng, 1, 9)); if (n > 1200) n = 1200; }
  const base = { mod: 'ns', type: 'numrw3', variant: v, n, sig: `n12${v}${n}` }, w = nrW(n), e = nrExp(n);
  if (v === 'w2n') return Object.assign(base, { prompt: 'Write the number.', word: w, ans: cnum(n), ew: w.length * 0.6 + BW + 2, eh: 1.1 + 1.6 + (w.length > 30 ? 1.6 : 0) });
  if (v === 'n2w') return Object.assign(base, { prompt: 'Write the number in words.', ans: w, ew: Math.max(14, w.length * 0.6 + 2), eh: 1.1 + 1.6 * 2 });
  if (v === 'e2s') return Object.assign(base, { prompt: 'Write the number.', exp: e, ans: cnum(n), ew: e.length * 0.62 + BW + 2, eh: 1.1 + 1.6 });
  return Object.assign(base, { prompt: 'Write the number in expanded form.', ans: e, ew: Math.max(14, e.length * 0.62 + 2), eh: 1.1 + 1.6 * 2 });
}

/* Six to nine digits: compare, value of a digit, digit in a place, expanded form. Level sets the size: 6 to 7 digits, 8, 9 (and 1,000,000,000 in comparisons). */
function nsBign(rng, L) {
  const d = L === 1 ? ri(rng, 6, 7) : L === 2 ? 8 : 9, v = pick(rng, ['cmp', 'cmp', 'digit', 'which', 'expand']);
  if (v === 'cmp') {
    let a = ri(rng, Math.pow(10, d - 1), Math.pow(10, d) - 1), b = rng() < 0.8 ? nrNear(rng, a) : ri(rng, Math.pow(10, d - 1), Math.pow(10, d) - 1);
    if (L === 3 && rng() < 0.12) { a = 1000000000; b = ri(rng, 990000000, 999999999); }
    if (rng() < 0.08) b = a; if (rng() < 0.5) { const t = a; a = b; b = t; }
    return { mod: 'ns', type: 'compare', prompt: 'Write <, > or =.', a: cnum(a), b: cnum(b), ans: sgn(a, b), sig: `bc${a}|${b}`, ew: (cnum(a).length + cnum(b).length) * 0.62 + 4.6, eh: 1.1 + 1.8, big: true };
  }
  const ints = rdigits(rng, d, v === 'expand');
  if (v === 'expand') {
    const keep = [0].concat(shuffle(rng, ints.map((_, i) => i).slice(1)).slice(0, 3));
    ints.forEach((dg, i) => { if (!keep.includes(i)) ints[i] = 0; else if (!dg) ints[i] = ri(rng, 1, 9); });
    const terms = []; ints.forEach((dg, i) => { if (dg) terms.push(cnum(dg * Math.pow(10, d - 1 - i))); });
    const expd = terms.join(' + '), shown = digitsHtml(ints.map(String), [], null);
    return { mod: 'ns', type: 'place', prompt: 'Write in expanded form:', variant: 'expand', shown, expd, sig: `bp${v}${ints.join('')}`, ew: Math.max(14, expd.length * 0.55 + 2), eh: 1.1 + 1.6 + (expd.length > 22 ? (expd.length > 44 ? 4.8 : 3.2) : 2.2) };
  }
  const pool = []; ints.forEach((dg, i) => { if (dg) pool.push(i); });
  const i = pick(rng, pool), dg = ints[i], place = NR_PLACES[d - 1 - i], val = cnum(dg * Math.pow(10, d - 1 - i));
  const ul = digitsHtml(ints.map(String), [], { part: 'i', i }), plain = digitsHtml(ints.map(String), [], null);
  return { mod: 'ns', type: 'place', prompt: v === 'digit' ? 'Value of the underlined digit:' : `Digit in the ${place} place:`, variant: v, shown: v === 'digit' ? ul : plain, ans: v === 'digit' ? val : String(dg),
    sig: `bp${v}${ints.join('')}${i}`, ew: Math.max(12.5, (d + 4) * 0.62 + BW + 1.2), eh: 1.1 + 1.6 };
}
const nsBignHtml = (p, key, x) => p.type === 'compare' ? nsCompareHtml(p, key, x) : nsPlaceHtml(p, key, x);

/* Odd and even to 40: a number, two equal addends, or pairs of counters (21 to 40 in rows of ten pairs). */
function nsPar40(rng, L) {
  const v = pick(rng, L === 1 ? ['one', 'pic'] : L === 2 ? ['one', 'eq', 'pic'] : ['one', 'eq', 'eq', 'pic']);
  if (v === 'one') { const n = ri(rng, L === 1 ? 21 : 11, 40); return { mod: 'ns', type: 'parity', prompt: 'Circle even or odd:', single: true, n: String(n), ans: n % 2 ? 'odd' : 'even', sig: `p4${n}`, ew: 12, eh: 1.1 + 1.8 }; }
  if (v === 'eq') { const n = 2 * ri(rng, 11, 20), tok = [`${n} = `, U(n / 2), ' + ', U(n / 2)]; return { mod: 'ns', type: 'par20', variant: 'eq', prompt: 'Write the number as two equal addends.', n, tok, sig: `p4e${n}`, ew: tokW(tok) + 1, eh: 1.1 + 1.6 }; }
  const n = ri(rng, 21, 40);
  return { mod: 'ns', type: 'par40', variant: 'pic40', prompt: 'Circle pairs. Even or odd?', n, ans: n % 2 ? 'odd' : 'even', sig: `p4p${n}`, win: 2.9, hin: 1.45 + 0.4, ew: 14, eh: 1 };
}
const nsPar40Html = (p, key, x) => {
  if (p.variant !== 'pic40') return nsPar20Html(p, key, x);
  let s = '';
  for (let i = 0; i < p.n; i++) s += nkDot(18 + (Math.floor(i / 2) % 10) * 28, 18 + (i % 2) * 28 + Math.floor(i / 20) * 68, 1);
  if (key) for (let c = 0; c < Math.floor(p.n / 2); c++) s += `<rect x="${6 + (c % 10) * 28}" y="${3 + Math.floor(c / 10) * 68}" width="24" height="58" rx="12" fill="none" stroke="var(--key)" stroke-width="2.5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2.9in" height="1.45in" viewBox="0 0 290 145" role="img" aria-label="Counters" style="display:block">${s}</svg><div>${opts(['even', 'odd'], p.ans, key)}</div>`;
};

defTypes("ns", "Place value, comparing and rounding", [
  { id: "cmprng", label: "Compare numbers, larger ranges", blurb: "Write <, > or = with numbers to 120, to 1,200 and to 100,000.", on: false, gen: nsCmpRng, html: nsCompareHtml },
  { id: "ordrng", label: "Order numbers, larger ranges", blurb: "Order numbers to 1,200, to 100,000 and with six to nine digits.", on: false, gen: nsOrdRng, html: nsOrdRngHtml },
  { id: "numrw12", label: "Read and write numbers to 1,200", blurb: "Standard form, word form and expanded form, 100 to 1,200.", on: false, gen: nsNumrw12, html: nsNumrw3Html },
  { id: "bign", label: "Large numbers to 1,000,000,000", blurb: "Compare, value of a digit, digit in a place and expanded form with six to nine digits.", on: false, gen: nsBign, html: nsBignHtml }
]);
defTypes("ns", "Counting and number lines", [
  { id: "par40", label: "Odd and even to 40", blurb: "Pair the objects, or write an even number as two equal addends.", on: false, gen: nsPar40, html: nsPar40Html }
]);
