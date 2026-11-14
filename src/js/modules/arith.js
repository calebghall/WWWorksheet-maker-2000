/* ---------- arithmetic: generators ---------- */
const dgt = (n, i) => Math.floor(n / Math.pow(10, i)) % 10;
/* A carry happens exactly when some column's raw digit sum reaches 10 (the first such column starts it). */
function carries(nums) {
  const L = Math.max(...nums.map(n => String(n).length));
  for (let i = 0; i < L; i++) { let s = 0; for (const n of nums) s += dgt(n, i); if (s >= 10) return true; }
  return false;
}
/* A borrow happens exactly when some column of the minuend is smaller than the same column of the subtrahend. */
function borrows(a, b) {
  const L = String(a).length;
  for (let i = 0; i < L; i++) if (dgt(a, i) < dgt(b, i)) return true;
  return false;
}
const P10 = Math.pow.bind(Math, 10);
/* A random number with exactly d digits. lo2 keeps 1-digit factors and divisors above 1. */
const rdig = (rng, d, lo2) => d === 1 ? ri(rng, lo2 ? 2 : 1, 9) : ri(rng, P10(d - 1), P10(d) - 1);

/* Numbers with the given digit lengths whose columns never add to 10 or more. */
function addNoCarry(rng, lens) {
  const nums = lens.map(() => 0), L = Math.max(...lens);
  for (let i = 0; i < L; i++) {
    const idx = shuffle(rng, lens.map((l, k) => k).filter(k => lens[k] > i));
    const mins = idx.map(k => (i === lens[k] - 1 ? 1 : 0));
    let spare = 9 - mins.reduce((a, b) => a + b, 0);
    idx.forEach((k, j) => { const extra = ri(rng, 0, spare); spare -= extra; nums[k] += (mins[j] + extra) * P10(i); });
  }
  return nums;
}
/* "Within" cap (A.cap): 0 = none. Caps 10, 20 and 30 use every number from 1 up to the limit (digit settings are not used);
   caps 100 and 1000 keep the digit settings but shorten numbers that cannot fit. Sums and minuends never pass the cap. */
const capSmall = A => A.cap > 0 && A.cap <= 30;
const capDigits = (d, cap) => cap ? Math.min(d, String(cap - 1).length) : d;
/* Second number of a problem by the "second number" setting: any (digit setting), a multiple of ten, or one-digit or a multiple of ten. */
function secondNum(rng, A, d) {
  if (A.second === 'mix') return rng() < 0.5 ? ri(rng, 1, 9) : 10 * ri(rng, 1, 9);
  return 10 * ri(rng, 1, d >= 3 ? P10(d - 1) - 1 : 9);
}
/* n whole numbers, each at least 1, adding to s. */
function splitSum(rng, s, n) {
  const cuts = shuffle(rng, Array.from({ length: s - 1 }, (_, i) => i + 1)).slice(0, n - 1).sort((x, y) => x - y), out = [];
  let prev = 0; for (const c of cuts.concat(s)) { out.push(c - prev); prev = c; }
  return shuffle(rng, out);
}
function genAdd(rng, st) {
  const A = st.as, m = A.regroup, n = A.addends, cap = A.cap, ok = nums => (m !== 'none' || !carries(nums)) && (m !== 'required' || carries(nums));
  let nums, g = 0;
  if (capSmall(A)) {
    do { nums = splitSum(rng, ri(rng, n, cap), n); g++; } while (!ok(nums) && g < 400);
    return { type: 'add', nums, ans: nums.reduce((x, y) => x + y, 0) };
  }
  const lens = [A.d1].concat(Array(n - 1).fill(A.d2));
  if (cap) while (lens.reduce((x, d) => x + (d === 1 ? 1 : P10(d - 1)), 0) > cap) { lens[lens.indexOf(Math.max(...lens))]--; }
  const tens = A.second !== 'digits', sum = x => x.reduce((q, r) => q + r, 0);
  if (m === 'none' && !tens && !cap) nums = addNoCarry(rng, lens);
  else {
    /* Build candidates that already have no carries when "never" is set (rejecting random numbers rarely succeeds with four addends),
       then make the later numbers multiples of ten, or one-digit or multiples of ten, if asked. Removing ones never creates a carry. */
    const mk = () => {
      const x = m === 'none' ? addNoCarry(rng, lens) : lens.map(d => rdig(rng, d));
      return tens ? x.map((v, i) => i === 0 ? v : A.second === 'mix' && rng() < 0.5 ? (v % 10 || 1) : 10 * Math.max(1, Math.floor(v / 10))) : x;
    };
    do { nums = mk(); g++; } while (((cap && sum(nums) > cap) || !ok(nums)) && g < 4000);
    if (cap && sum(nums) > cap) nums = lens.map((d, i) => i > 0 && tens ? 10 : (d === 1 ? 1 : P10(d - 1)));   // smallest numbers that fit
  }
  return { type: 'add', nums, ans: sum(nums) };
}
function genSub(rng, st) {
  const A = st.as, m = A.regroup, cap = A.cap, small = capSmall(A), d1 = small ? 1 : capDigits(A.d1, cap), d2 = Math.min(A.d2, d1);
  let a, b, g = 0;
  const bad = () => (m === 'required' && !borrows(a, b)) || (m === 'none' && borrows(a, b));
  if (small) {
    do { a = ri(rng, 2, cap); b = ri(rng, 1, a - 1); g++; } while (bad() && g < 400);
  } else if (d1 === 1) {
    do { b = ri(rng, 1, 9); a = ri(rng, b + 1, 18); g++; } while (bad() && g < 400);
  } else if (A.second !== 'digits') {
    do { b = secondNum(rng, A, d2); a = ri(rng, Math.max(b + 1, P10(d1 - 1)), P10(d1) - 1); g++; } while (bad() && g < 400);
  } else if (m === 'none') {
    do {
      a = 0; b = 0;
      for (let i = 0; i < d1; i++) {
        let ad, bd = 0;
        if (i < d2) { bd = ri(rng, i === d2 - 1 ? 1 : 0, 9); ad = ri(rng, bd, 9); }
        else ad = ri(rng, i === d1 - 1 ? 1 : 0, 9);
        a += ad * P10(i); b += bd * P10(i);
      }
      g++;
    } while (a === b && g < 60);
  } else {
    do {
      a = rdig(rng, d1); b = rdig(rng, d2); if (a < b) { const t = a; a = b; b = t; }
      g++;
    } while ((a === b || bad()) && g < 400);
  }
  return { type: 'sub', a, b, ans: a - b };
}
function genMul(rng, st) {
  const M = st.md;
  let a, b;
  if (M.mode === 'facts') {
    if (M.focus) { a = M.focus; b = ri(rng, 2, 12); } else { a = ri(rng, 2, M.tables); b = ri(rng, 2, M.tables); }
    if (rng() < 0.5) { const t = a; a = b; b = t; }
  } else {
    /* optional second size: one extra draw per problem, and only when it is switched on, so existing sets are unchanged */
    const two = M.alt && rng() < 0.5;
    a = rdig(rng, two ? M.da2 : M.da, true); b = rdig(rng, two ? M.db2 : M.db, true);
  }
  return { type: 'mul', a, b, ans: a * b, pp: M.mode === 'digits' && String(b).length > 1 };
}
function genDiv(rng, st) {
  const M = st.md;
  let d, q;
  if (M.mode === 'facts') {
    if (M.focus) { d = M.focus; q = ri(rng, 2, 12); } else { d = ri(rng, 2, M.tables); q = ri(rng, 2, M.tables); }
  } else {
    const dn = Math.max(M.na, M.nb + 1), loN = P10(dn - 1), hiN = P10(dn) - 1;
    let qLo = 2, qHi = 1, t = 0;
    do {
      d = M.nb === 1 ? ri(rng, 2, 9) : ri(rng, 11, 99);
      qLo = Math.max(2, Math.ceil(loN / d)); qHi = Math.floor((hiN - (M.rem ? d - 1 : 0)) / d); t++;
    } while (qHi < qLo && t < 60);
    q = ri(rng, qLo, Math.max(qLo, qHi));
  }
  const r = M.rem ? ri(rng, 1, d - 1) : 0;
  return { type: 'div', n: d * q + r, d, q, r, rem: !!M.rem };
}
const AGEN = { add: genAdd, sub: genSub, mul: genMul, div: genDiv };

function asig(p) {
  switch (p.type) {
    case 'add': return 'a' + p.nums.slice().sort().join('+');
    case 'sub': return 's' + p.a + '-' + p.b;
    case 'mul': return 'm' + Math.min(p.a, p.b) + 'x' + Math.max(p.a, p.b);
    default: return 'd' + p.n + '/' + p.d;
  }
}
function arithOps(st, mod) {
  const on = mod === 'addsub' ? [st.as.add && 'add', st.as.sub && 'sub'] : [st.md.mul && 'mul', st.md.div && 'div'];
  const ops = on.filter(Boolean);
  return ops.length ? ops : [mod === 'addsub' ? 'add' : 'mul'];
}

/* Generate n problems, cycling through the chosen kinds. Kinds are balanced and shuffled within each chunk (one page). */
function genMixed(rng, ids, n, chunk, one, sigf) {
  const order = shuffle(rng, ids), seen = new Set(), out = [];
  let k = 0;
  for (let start = 0; start < n; start += chunk) {
    const seq = [];
    for (let i = 0, m = Math.min(chunk, n - start); i < m; i++) seq.push(order[k++ % order.length]);
    for (const id of shuffle(rng, seq)) {
      let p, tries = 0;
      do { p = one(id, rng); tries++; } while (seen.has(sigf(p)) && tries < 20);
      seen.add(sigf(p)); out.push(p);
    }
  }
  return out;
}
function genArithN(rng, st, mod, n, chunk) {
  return genMixed(rng, arithOps(st, mod), n, chunk, (id, r) => AGEN[id](r, st), asig);
}

/* ---------- arithmetic: rendering ---------- */
const DGW = 0.72, OPW = 1, ROWH = 1.45;   // em units used by the vertical layouts

/* One cell per digit plus a narrow separator cell after every digit that ends a group of three, so columns stay aligned and thousands commas show. */
function numCells(s, w) {
  let h = '';
  const pad = w - s.length;
  for (let p = 0; p < w; p++) {
    const r = w - 1 - p, ch = p >= pad ? s[p - pad] : '';
    h += `<span class="dg">${ch}</span>`;
    if (r > 0 && r % 3 === 0) h += `<span class="dg cm">${p >= pad ? ',' : ''}</span>`;
  }
  return h;
}
const vrow = (s, w, op, cls) => `<div class="vr${cls ? ' ' + cls : ''}"><span class="vo">${op || ''}</span>${numCells(s, w)}</div>`;
const vans = (s, w, key) => `<div class="vr a"><span class="vo"></span>${key ? numCells(String(s), w) : ''}</div>`;

function hText(p) {
  switch (p.type) {
    case 'add': return p.nums.map(cnum).join(' + ');
    case 'sub': return `${cnum(p.a)} − ${cnum(p.b)}`;
    case 'mul': return `${cnum(p.a)} × ${cnum(p.b)}`;
    default: return `${cnum(p.n)} ÷ ${cnum(p.d)}`;
  }
}
function renderVertical(p, key) {
  if (p.type === 'add') {
    const w = Math.max(String(p.ans).length, ...p.nums.map(x => String(x).length));
    const rows = p.nums.map((x, i) => vrow(String(x), w, i === p.nums.length - 1 ? '+' : '')).join('');
    return `<div class="vp">${rows}<div class="vl"></div>${vans(p.ans, w, key)}</div>`;
  }
  if (p.type === 'sub') {
    const w = String(p.a).length;
    return `<div class="vp">${vrow(String(p.a), w)}${vrow(String(p.b), w, '−')}<div class="vl"></div>${vans(p.ans, w, key)}</div>`;
  }
  if (p.type === 'mul') {
    const ansS = String(p.ans);
    if (p.pp) {
      /* One row of working space per digit of the multiplier. The sum line is drawn on the key only. */
      const bs = String(p.b), parts = [];
      for (let i = 0; i < bs.length; i++) parts.push(String(p.a * Number(bs[bs.length - 1 - i])) + '0'.repeat(i));
      const w = Math.max(ansS.length, String(p.a).length, bs.length, ...parts.map(x => x.length));
      return `<div class="vp">${vrow(String(p.a), w)}${vrow(bs, w, '×')}<div class="vl"></div>${parts.map(x => vans(x, w, key)).join('')}${key ? '<div class="vl"></div>' : ''}${vans(ansS, w, key)}</div>`;
    }
    const w = Math.max(ansS.length, String(p.a).length, String(p.b).length);
    return `<div class="vp">${vrow(String(p.a), w)}${vrow(String(p.b), w, '×')}<div class="vl"></div>${vans(ansS, w, key)}</div>`;
  }
  const qs = key ? cnum(p.q) + (p.rem ? ` R ${cnum(p.r)}` : '') : '&nbsp;';
  return `<div class="ld"><span class="ldq">${qs}</span><span class="ldd">${cnum(p.d)}</span><span class="ldn">${cnum(p.n)}</span></div>`;
}
function renderHorizontal(p, key) {
  const t = hText(p);
  if (p.type === 'div' && p.rem) return `<div class="hp"><span>${t} =</span>${blank(key ? cnum(p.q) : '', 'q')}<span>R</span>${blank(key ? cnum(p.r) : '', 'q')}</div>`;
  const a = p.type === 'div' ? p.q : p.ans;
  return `<div class="hp"><span>${t} =</span>${blank(key ? cnum(a) : '')}</div>`;
}
function renderArithCell(p, n, horiz, key) {
  if (p.mod) return renderModCell(p, n, key);
  return `<div class="ac ${horiz ? 'h' : 'v'}"><span class="an">${n}</span>${horiz ? renderHorizontal(p, key) : renderVertical(p, key)}</div>`;
}

/* Addition/subtraction and multiplication/division share one generator and renderer set. */
REG.addsub = {
  name: 'Addition and Subtraction', counts: [5, 10, 15, 20, 30], n0: 10,
  plan(st, n, seed) { return arithPlan(st, 'addsub', genArithN(rngFrom(seed), st, 'addsub', n, n)); }
};
REG.muldiv = {
  name: 'Multiplication and Division', counts: [5, 10, 15, 20, 30], n0: 10,
  plan(st, n, seed) { return arithPlan(st, 'muldiv', genArithN(rngFrom(seed), st, 'muldiv', n, n)); }
};
