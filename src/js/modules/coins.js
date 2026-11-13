/* ---------- coin artwork (used by the Shapes, Measures and Data coin type) ----------
   Coins are United States Mint photos (public domain), downsized and embedded as JPEG data (coin-images.js, made by tools/make_coin_images.py):
   penny = Lincoln, nickel = Jefferson, dime = Roosevelt, quarter = Washington. Each coin has a color copy and a greyscale copy; CSS shows
   one or the other (greyscale print option). Coins are drawn at COIN_SCALE of real size (100 units per inch), so a dime is smaller than a penny
   and a quarter is the largest. The images are defined once per page by coinDefs() and drawn with <use>, so repeated coins add no weight. */
const COIN_SCALE = 0.85;
const COIN_PX = 256;
const V_COIN = {
  penny:   { v: 1,  d: Math.round(19.05 * 3.937 * COIN_SCALE * 10) / 10 },
  nickel:  { v: 5,  d: Math.round(21.21 * 3.937 * COIN_SCALE * 10) / 10 },
  dime:    { v: 10, d: Math.round(17.91 * 3.937 * COIN_SCALE * 10) / 10 },
  quarter: { v: 25, d: Math.round(24.26 * 3.937 * COIN_SCALE * 10) / 10 }
};
/* Hidden SVG holding the coin images; put it once at the start of the sheets. */
function coinDefs() {
  return '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>'
    + Object.keys(COIN_IMG).map(k => ['c', 'g'].map(m => `<image id="ci-${k}-${m}" width="${COIN_PX}" height="${COIN_PX}" href="${COIN_IMG[k][m]}"/>`).join('')).join('') + '</defs></svg>';
}
/* One coin centered at (cx, cy). */
function vcoin(k, cx, cy) {
  const r = V_COIN[k].d / 2, t = `translate(${(cx - r).toFixed(1)} ${(cy - r).toFixed(1)}) scale(${(2 * r / COIN_PX).toFixed(4)})`;
  return `<g class="cc"><use href="#ci-${k}-c" transform="${t}"/></g><g class="cg"><use href="#ci-${k}-g" transform="${t}"/></g>`
    + `<circle cx="${cx}" cy="${cy}" r="${r - 0.5}" fill="none" stroke="var(--ink)" stroke-width="1"/>`;
}
