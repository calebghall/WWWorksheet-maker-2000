/* ---------- Shapes, Measures and Data: coins ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

/* ----- ,: coins. The artwork (V_COIN, vcoin) lives in coins.js. ----- */
const VCOIN_GAP = 10, VCOIN_PAD = 6;

function vcoinRow(order) {
  let x = VCOIN_PAD; const at = order.map(k => { const d = V_COIN[k].d; const c = x + d / 2; x += d + VCOIN_GAP; return c; });
  return { at, w: x - VCOIN_GAP + VCOIN_PAD, h: 100 };
}

function visCoin(rng, L) {
  const names = Object.keys(V_COIN);
  if (L === 3) { const k = pick(rng, names); return vp('coin', 'Name the coin and write its value.', { variant: 'id', coin: k, ans: k, val: V_COIN[k].v, sig: `ci${k}` }, 2.4, 1.0, 3.4, 12); }
  const order = shuffle(rng, names), k = pick(rng, names), byVal = L === 2, row = vcoinRow(order);
  return vp('coin', byVal ? `Circle the coin worth ${V_COIN[k].v}¢.` : `Circle the ${k}.`, { variant: byVal ? 'value' : 'name', order, coin: k, ans: String(order.indexOf(k)), sig: `cf${byVal}${order}${k}` }, row.w / 100, 1.0, 1.9);
}

function visCoinHtml(p, key, x) {
  if (p.variant === 'id') return vsvg(2.4, 1.0, vcoin(p.coin, 120, 50), 'A coin') + `<div>${x(p.coin, 4.4)} ${x(p.val, 2)}¢</div>`;
  const row = vcoinRow(p.order);
  let o = p.order.map((k, i) => vcoin(k, row.at[i], 50)).join('');
  if (key) { const r = V_COIN[p.order[+p.ans]].d / 2 + 5; o += `<circle cx="${row.at[+p.ans]}" cy="50" r="${r}" fill="none" stroke="var(--key)" stroke-width="3"/>`; }
  return vsvg(row.w / 100, 1.0, o, 'Four coins');
}

defTypes("vis", "Coins", [
  { id: "coin", label: "Coins", blurb: "Identify a penny, nickel, dime or quarter and its value.", on: false, gen: visCoin, html: visCoinHtml }
]);
