/* ---------- Number Sense: shared helpers (digits, equation tokens, word-problem builder) ----------
   Helpers shared by more than one family file. Included before the family files. */

const U = v => ({ u: String(v) });

const tokVal = t => t.map(s => typeof s === 'object' ? s.u : s).join('');

const tokW = t => t.reduce((a, s) => a + (typeof s === 'object' ? Math.max(s.u.length * 0.62 + 1.2, 2.6) : String(s).length * 0.6), 0);

const tokHtml = (t, key, x) => t.map(s => typeof s === 'object' ? x(s.u, Math.max(s.u.length * 0.62 + 1.2, 2.6)) : esc(s)).join('');

const tokProb = (type, prompt, tok, extra) => Object.assign({ mod: 'ns', type, prompt, tok, sig: type + tokVal(tok) + (extra && extra.sigx || ''), ew: tokW(tok) + 1, eh: 1.1 + 1.6 }, extra);

/* Cell bodies for the new types (called from modHtml). */
const wordCell = (p, key, x) => `<div class="wt">${esc(p.text)}</div>${p.draw ? '<div class="dbox"></div>' : ''}${p.est !== undefined ? `<div>Estimate (nearest ten): ${x(p.est, 3.6)}</div>` : ''}<div>Equation: <span class="blank" style="min-width:9em">${key ? esc(p.eq) : '&nbsp;'}</span></div><div>Answer: ${x(p.ans, 3.6)}${p.unit ? ' ' + esc(p.unit) : ''}</div>`;

const opts = (a, ans, key) => a.map(o => `<span class="opt${key && ans === o ? ' on' : ''}">${o}</span>`).join('');

/*: number bonds with counters. L1 two colors within 10, L2 a ten-frame (make ten), L3 teen numbers on two ten-frames. */
const nkDot = (cx, cy, c) => `<circle cx="${cx}" cy="${cy}" r="11" fill="var(--c${c})" stroke="var(--ink)" stroke-width="1.5"/>`;

const rdigits = (rng, n, zeros) => {
  const a = [ri(rng, 1, 9)];
  for (let i = 1; i < n; i++) a.push(zeros && rng() < 0.2 ? 0 : ri(rng, 1, 9));
  return a;
};

function lineSvg(lo, hi, div, k, dp = 2) {
  const W = 270, x0 = 20, x1 = 250, y = 32, xs = i => x0 + (x1 - x0) * i / div, f = v => trimZ(dstr(v, dp)).replace(/^\d+/, m => cnum(Number(m)));
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

/* Word-problem size hint: one line holds about 20em / 0.62 characters. */
const nsWordEh = text => 1.1 + Math.ceil(text.length * 0.62 / 20) * 1.45 + 1.7 + 0.6;
