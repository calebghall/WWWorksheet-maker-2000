/* ---------- fractions, decimals and percents ---------- */
function coprime(rng, qLo, qHi) {
  let p, q;
  do { q = ri(rng, qLo, qHi); p = ri(rng, 1, q - 1); } while (gcd(p, q) !== 1);
  return [p, q];
}
function fSimp(rng, L) {
  const [p, q] = coprime(rng, 2, [0, 6, 9, 12][L]), k = ri(rng, 2, [0, 3, 5, 8][L]);
  return { mod: 'fdp', type: 'simp', prompt: 'Simplify.', p, q, k, sig: `simp${p}/${q}x${k}`, ew: frW(k * p, k * q) + 1.6 + 2.2, eh: 4.0 };
}
function fEquiv(rng, L) {
  const [p, q] = coprime(rng, 2, [0, 6, 8, 10][L]), k = ri(rng, 2, [0, 5, 8, 12][L]), hide = rng() < 0.5 ? 'n' : 'd';
  return { mod: 'fdp', type: 'equiv', prompt: 'Fill in the missing number.', p, q, k, hide, sig: `eq${p}/${q}x${k}${hide}`,
    ew: frW(p, q) + frW(p * k, q * k) + 2.6, eh: 4.0 };
}
function fCmp(rng, L) {
  let a, b;
  if (L === 1) {
    if (rng() < 0.5) {
      const d = ri(rng, 3, 12); let x, y;
      do { x = ri(rng, 1, d - 1); y = ri(rng, 1, d - 1); } while (x === y);
      a = [x, d]; b = [y, d];
    } else {
      const n = ri(rng, 1, 4); let x, y;
      do { x = ri(rng, n + 1, 10); y = ri(rng, n + 1, 10); } while (x === y);
      a = [n, x]; b = [n, y];
    }
  } else if (L === 2) {
    const d1 = pick(rng, [2, 3, 4, 5, 6]), k = ri(rng, 2, Math.floor(12 / d1)), d2 = d1 * k;
    a = [ri(rng, 1, d1 - 1), d1]; b = rng() < 0.15 ? [a[0] * k, d2] : [ri(rng, 1, d2 - 1), d2];
    if (rng() < 0.5) { const t = a; a = b; b = t; }
  } else if (rng() < 0.12) {
    const [p, q] = coprime(rng, 2, 6); let k1 = ri(rng, 1, Math.floor(12 / q)), k2 = ri(rng, 1, Math.floor(12 / q));
    if (k1 === k2) k2 = k1 === 1 ? 2 : 1;
    a = [p * k1, q * k1]; b = [p * k2, q * k2];
  } else {
    let d1, d2;
    do { d1 = ri(rng, 2, 12); d2 = ri(rng, 2, 12); } while (d1 === d2);
    a = [ri(rng, 1, d1 - 1), d1]; b = [ri(rng, 1, d2 - 1), d2];
  }
  return { mod: 'fdp', type: 'cmp', prompt: 'Write <, > or =.', a, b, ans: sgn(a[0] * b[1], b[0] * a[1]), sig: `cmp${a}|${b}`,
    ew: frW(a[0], a[1]) + frW(b[0], b[1]) + 3.6, eh: 4.0 };
}
function fAdd(rng, L) {
  const op = rng() < 0.5 ? 'add' : 'sub';
  let a, b, g = 0;
  do {
    if (L === 1) {
      const d = ri(rng, 3, 10);
      if (op === 'add') { const x = ri(rng, 1, d - 2), y = ri(rng, 1, d - 1 - x); a = [x, d]; b = [y, d]; }
      else { const x = ri(rng, 2, d - 1), y = ri(rng, 1, x - 1); a = [x, d]; b = [y, d]; }
    } else if (L === 2) {
      const d1 = pick(rng, [2, 3, 4, 5, 6]), d2 = d1 * ri(rng, 2, Math.floor(12 / d1));
      a = [ri(rng, 1, d1 - 1), d1]; b = [ri(rng, 1, d2 - 1), d2];
      if (rng() < 0.5) { const t = a; a = b; b = t; }
    } else {
      let d1, d2;
      do { d1 = ri(rng, 2, 12); d2 = ri(rng, 2, 12); } while (d1 === d2 || lcm(d1, d2) > 36);
      a = [ri(rng, 1, d1 - 1), d1]; b = [ri(rng, 1, d2 - 1), d2];
    }
    g++;
    if (op === 'sub' && a[0] * b[1] < b[0] * a[1]) { const t = a; a = b; b = t; }
  } while (op === 'sub' && a[0] * b[1] === b[0] * a[1] && g < 50);
  const Lc = lcm(a[1], b[1]), num = a[0] * (Lc / a[1]) + (op === 'add' ? 1 : -1) * b[0] * (Lc / b[1]), ans = mixedOf(num, Lc);
  return { mod: 'fdp', type: 'fadd', prompt: op === 'add' ? 'Add.' : 'Subtract.', op, a, b, ans, sig: `fa${op}${a}|${b}`,
    ew: frW(a[0], a[1]) + frW(b[0], b[1]) + 4.4 + tplW(ans), eh: 4.0 };
}
function fMul(rng, L) {
  if (L === 1) {
    const d = ri(rng, 2, 6), n = ri(rng, 1, d - 1), m = ri(rng, 2, 6), W = d * m, ans = n * m;
    return { mod: 'fdp', type: 'fmulw', prompt: 'Multiply.', n, d, W, ans, sig: `fm1${n}/${d}x${W}`, ew: frW(n, d) + String(W).length * 0.62 + 3.4 + BW, eh: 4.0 };
  }
  const dv = L === 3 && rng() < 0.5;
  let a, b;
  do {
    const dm = L === 2 ? 6 : 9;
    const d1 = ri(rng, 2, dm), d2 = ri(rng, 2, dm);
    a = [ri(rng, 1, d1 - 1), d1]; b = [ri(rng, 1, d2 - 1), d2];
  } while (a[1] === b[1] && a[0] === b[0]);
  const ans = dv ? mixedOf(a[0] * b[1], a[1] * b[0]) : mixedOf(a[0] * b[0], a[1] * b[1]);
  return { mod: 'fdp', type: 'fmul', prompt: dv ? 'Divide. Simplify.' : 'Multiply. Simplify.', dv, a, b, ans, sig: `fm${dv ? 'd' : 'm'}${a}|${b}`,
    ew: frW(a[0], a[1]) + frW(b[0], b[1]) + 4.4 + tplW(ans), eh: 4.0 };
}
function fDecAdd(rng, L) {
  const op = rng() < 0.5 ? 'add' : 'sub';
  let dpa, dpb, ia, ib;
  if (L === 1) { dpa = 1; dpb = 1; ia = ri(rng, 11, 199); ib = ri(rng, 11, 199); }
  else if (L === 2) { dpa = 2; dpb = pick(rng, [1, 2]); ia = ri(rng, 1100, 9999); ib = dpb === 2 ? ri(rng, 110, 9999) : ri(rng, 11, 999); }
  else { dpa = pick(rng, [2, 3]); dpb = pick(rng, [0, 1, 2, 3]); ia = ri(rng, 1000, 99999); ib = dpb === 0 ? ri(rng, 2, 30) : ri(rng, 11, 9999); }
  const S = Math.max(dpa, dpb);
  let A = ia * P10(S - dpa), B = ib * P10(S - dpb);
  if (op === 'sub' && A < B) { const t = ia; ia = ib; ib = t; const u = dpa; dpa = dpb; dpb = u; const v = A; A = B; B = v; }
  if (op === 'sub' && A === B) { ia += 1; A += P10(S - dpa); }
  const r = op === 'add' ? A + B : A - B;
  const sa = dpa ? dstr(ia, dpa) : String(ia), sb = dpb ? dstr(ib, dpb) : String(ib), ans = dstr(r, S);
  const iw = Math.max(sa.split('.')[0].length, sb.split('.')[0].length, ans.split('.')[0].length) + (op === 'add' ? 0 : 0);
  return { mod: 'fdp', type: 'decadd', prompt: op === 'add' ? 'Add.' : 'Subtract.', op, sa, sb, ans, iw, fw: S, sig: `da${op}${sa}|${sb}`,
    ew: (iw + S + 1) * DGW + Math.floor((iw - 1) / 3) * 0.3 + OPW + 1, eh: 1.1 + 3.2 * ROWH };
}
function fDecMul(rng, L) {
  let expr, ans, prompt = 'Multiply.';
  const form = L === 1 ? 'tw' : L === 2 ? pick(rng, ['tw', 'hw', 'p10']) : pick(rng, ['dd', 'dd', 'divw', 'p10']);
  if (form === 'tw') { const ia = ri(rng, 2, L === 1 ? 59 : 99), b = ri(rng, 2, L === 1 ? 9 : 12); expr = `${dstr(ia, 1)} × ${b}`; ans = trimZ(dstr(ia * b, 1)); }
  else if (form === 'hw') { const ia = ri(rng, 11, 499), b = ri(rng, 2, 9); expr = `${dstr(ia, 2)} × ${b}`; ans = trimZ(dstr(ia * b, 2)); }
  else if (form === 'dd') {
    const dpa = 1, dpb = pick(rng, [1, 1, 2]), ia = ri(rng, 2, 39), ib = dpb === 1 ? ri(rng, 2, 19) : ri(rng, 2, 9) * 1;
    expr = `${dstr(ia, dpa)} × ${dstr(ib, dpb)}`; ans = trimZ(dstr(ia * ib, dpa + dpb));
  } else if (form === 'divw') {
    const dp = pick(rng, [1, 2]); let q; do { q = dp === 1 ? ri(rng, 2, 99) : ri(rng, 11, 299); } while (q % 10 === 0);
    const d = ri(rng, 2, 9); prompt = 'Divide.'; expr = `${dstr(q * d, dp)} ÷ ${d}`; ans = trimZ(dstr(q, dp));
  } else {
    const dp = pick(rng, L === 2 ? [0, 1] : [0, 1, 2]), im = dp === 0 ? ri(rng, 2, 99) : dp === 1 ? ri(rng, 11, 999) : ri(rng, 101, 999);
    const k = ri(rng, 1, L === 2 ? 2 : 3), mul = rng() < 0.5, base = dp ? dstr(im, dp) : String(im);
    if (mul) { const dq = dp - k; ans = dq <= 0 ? cnum(im * P10(-dq)) : trimZ(dstr(im, dq)); expr = `${base} × ${cnum(P10(k))}`; }
    else { prompt = 'Divide.'; ans = trimZ(dstr(im, dp + k)); expr = `${base} ÷ ${cnum(P10(k))}`; }
  }
  return { mod: 'fdp', type: 'decmul', prompt, expr, ans, sig: `dm${expr}`, ew: expr.length * 0.62 + 3.4 + BW, eh: 1.1 + 1.6 };
}
function fConv(rng, L) {
  const pm = L === 1 ? pick(rng, [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]) * 10
    : L === 2 ? ri(rng, 1, 19) * 50 : (rng() < 0.2 ? pick(rng, [125, 375, 625, 875]) : ri(rng, 1, 99) * 10);
  const [fn, fd] = red(pm, 1000), dec = trimZ(dstr(pm, 3)), pct = trimZ(dstr(pm, 1));
  const dir = pick(rng, L === 1 ? ['f2d', 'd2p', 'p2d', 'f2p'] : ['f2d', 'd2p', 'p2d', 'f2p', 'd2f', 'p2f']);
  const prompts = { f2d: 'Write as a decimal.', f2p: 'Write as a percent.', d2f: 'Write as a fraction.', d2p: 'Write as a percent.', p2d: 'Write as a decimal.', p2f: 'Write as a fraction.' };
  const toFrac = dir === 'd2f' || dir === 'p2f';
  const lhsW = dir[0] === 'f' ? frW(fn, fd) : (dir[0] === 'd' ? dec.length : pct.length + 1) * 0.62;
  return { mod: 'fdp', type: 'conv', prompt: prompts[dir], dir, fn, fd, dec, pct, ans: { w: 0, n: fn, d: fd }, sig: `cv${dir}${pm}`,
    ew: lhsW + 1.8 + (toFrac ? 2.2 : BW + 2.4), eh: 4.0 };
}
function fPct(rng, L) {
  const pool = L === 1 ? [10, 25, 50, 100] : L === 2 ? [5, 10, 20, 25, 40, 50, 75] : [1, 2, 4, 5, 8, 12, 15, 20, 30, 35, 45, 60, 65, 80, 90];
  const P = pick(rng, pool), base = 100 / gcd(P, 100), cap = L === 1 ? 100 : L === 2 ? 300 : 500;
  let N; do { N = base * ri(rng, 1, Math.max(1, Math.floor(cap / base))); } while (N < 10 && base < 10);
  return { mod: 'fdp', type: 'pct', prompt: 'Find the percent of the number.', P, N, ans: P * N / 100, sig: `pc${P}of${N}`, ew: (`${P}% of ${N} =`.length) * 0.62 + BW + 0.5, eh: 1.1 + 1.6 };
}
const FGEN = { simp: fSimp, equiv: fEquiv, cmp: fCmp, fadd: fAdd, fmul: fMul, decadd: fDecAdd, decmul: fDecMul, conv: fConv, pct: fPct };
const FD_TYPES = Object.keys(FGEN);

function genFdpN(rng, st, n, chunk) {
  const ids = FD_TYPES.filter(id => st.fd.types[id]);
  return genMixed(rng, ids.length ? ids : ['simp'], n, chunk, (id, r) => FGEN[id](r, st.fd.level), p => p.sig);
}
REG.fdp = {
  name: 'Fractions, Decimals and Percents', counts: [5, 10, 15, 20, 30], n0: 10, on0: false,
  plan(st, n, seed) { return arithPlan(st, 'fdp', genFdpN(rngFrom(seed), st, n, n)); }
};
