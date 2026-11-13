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

defTypes("ns", "Factors and multiples", [
  { id: "fact", label: "Factors and multiples", blurb: "Factor pairs, multiples, prime or composite.", on: false, gen: nsxFact, html: nsFactHtml }
]);
