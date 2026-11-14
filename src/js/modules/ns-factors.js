/* ---------- Number Sense: factors and multiples ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

/* factors, multiples, primes. */
const NS_PRIMES = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]);

function nsxFact(rng, L) {
  const mx = L === 1 ? 50 : 100, kind = pick(rng, ['isf', 'mult', 'prime', 'pairs']);
  if (kind === 'pairs') {
    let n, f; let g = 0;
    do { n = ri(rng, 12, L === 1 ? 36 : 100); f = []; for (let i = 1; i * i <= n; i++) if (n % i === 0) f.push(i); } while (g++ < 200 && f.length < 3);
    const tok = [`1 × ${n},  `, `${f[1]} × `, U(n / f[1]), ',  ', `${f[2]} × `, U(n / f[2])];
    return tokProb('fact', `Complete the factor pairs for ${n}:`, tok, { kind: 'pairs', n, sigx: 'p' });
  }
  if (kind === 'prime') {
    const n = ri(rng, 2, mx), pr = NS_PRIMES.has(n);
    return { mod: 'ns', type: 'fact', prompt: 'Circle prime or composite:', kind: 'prime', n, ans: pr ? 'prime' : 'composite', sig: `fp${n}`, ew: 15, eh: 1.1 + 1.8 };
  }
  const d = ri(rng, 2, 9), n = rng() < 0.5 ? d * ri(rng, 2, Math.floor(mx / d)) : ri(rng, 12, mx);
  const yes = kind === 'isf' ? n % d === 0 : n % d === 0;
  return { mod: 'ns', type: 'fact', prompt: kind === 'isf' ? `Is ${d} a factor of ${n}?` : `Is ${n} a multiple of ${d}?`, kind, n, d, ans: yes ? 'yes' : 'no', sig: `f${kind}${n}.${d}`, ew: 15, eh: 1.1 + 1.8 };
}

const nsFactHtml = (p, key, x) => p.kind === 'pairs' ? tokHtml(p.tok, key, x) : p.kind === 'prime' ? `${p.n}&emsp;${opts(['prime', 'composite'], p.ans, key)}` : opts(['yes', 'no'], p.ans, key);

/* Factor pairs shown as arrays: read the factor pair from an array, or draw an array for a number. */
function nsFacArray(r, c) {
  const sp = 14, W = c * sp + 14, H = r * sp + 10;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${(W / 100).toFixed(2)}in" height="${(H / 100).toFixed(2)}in" viewBox="0 0 ${W} ${H}" role="img" aria-label="Array with ${r} rows of ${c}">`;
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) s += `<circle cx="${10 + j * sp}" cy="${8 + i * sp}" r="4.6" fill="var(--c1)" stroke="var(--ink)" stroke-width="1.2"/>`;
  return { svg: s + '</svg>', W, H };
}

function nsxFacModel(rng, L) {
  const kind = L === 1 ? 'read' : pick(rng, ['read', 'draw']), r = ri(rng, 2, L === 1 ? 6 : 8), c = ri(rng, r === 2 ? 3 : 2, L === 1 ? 8 : 10), n = r * c;
  if (kind === 'read') {
    const g = nsFacArray(r, c);
    return { mod: 'ns', type: 'facmodel', prompt: 'Write the factor pair the array shows:', kind, r, c, n, svg: g.svg, tok: [U(r), ' × ', U(c), ` = ${n}`], ans: `${r} ${c}`, sig: `fm${r}x${c}`, win: Math.max(1.8, g.W / 100), hin: g.H / 100 + 0.45, ew: 14, eh: 1 };
  }
  return { mod: 'ns', type: 'facmodel', prompt: `Draw an array for ${n}. Write the factor pair.`, kind, r, c, n, ans: `${r} × ${c}`, sig: `fmd${n}`, ew: 17, eh: 1.1 + 3.8 + 1.7 };
}

const nsFacModelHtml = (p, key, x) => p.kind === 'read' ? `${p.svg}<div>${tokHtml(p.tok, key, x)}</div>` : `<div class="dbox"></div><div>${p.n} = ${x(p.ans, 5.4)}</div>`;

defTypes("ns", "Factors and multiples", [
  { id: "fact", label: "Factors and multiples", blurb: "Factor pairs, multiples, prime or composite.", on: false, gen: nsxFact, html: nsFactHtml },
{ id: "facmodel", label: "Factor pairs with arrays", blurb: "Read a factor pair from an array or draw one.", on: false, gen: nsxFacModel, html: nsFacModelHtml }
]);
