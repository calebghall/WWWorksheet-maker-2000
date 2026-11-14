/* ===== Fractions, decimals and percents; number sense ===== */
const CELL_MODS = ['addsub', 'muldiv', 'fdp', 'ns', 'tm', 'vis'];
const modFormat = (st, mod) => mod === 'addsub' ? st.as.format : mod === 'muldiv' ? st.md.format : 'horizontal';

const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const lcm = (a, b) => a / gcd(a, b) * b;
const red = (n, d) => { const g = gcd(n, d) || 1; return [n / g, d / g]; };
/* Improper fraction to a whole part plus a reduced proper fraction. */
const mixedOf = (n, d) => { const [a, b] = red(n, d), w = Math.floor(a / b), r = a - w * b; return { w, n: r, d: r ? b : 1 }; };
const cnum = n => n >= 1000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : String(n);
/* Decimal string from an integer mantissa m with dp decimal places. */
const dstr = (m, dp) => {
  let s = String(Math.abs(m));
  if (dp > 0) { s = s.padStart(dp + 1, '0'); s = s.slice(0, s.length - dp) + '.' + s.slice(s.length - dp); }
  return s;
};
const trimZ = s => s.indexOf('.') >= 0 ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
const rndTo = (n, unit) => Math.floor((n + unit / 2) / unit) * unit;
const sgn = (a, b) => a < b ? '<' : a > b ? '>' : '=';

const frH = (n, d) => `<span class="fr"><i>${n}</i><i>${d}</i></span>`;
const frBox = (n, d, hide, key) => {
  const box = v => `<i class="bx">${key ? `<b class="ak">${v}</b>` : '&nbsp;'}</i>`;
  return hide === 'n' ? `<span class="fr">${box(n)}<i>${d}</i></span>` : `<span class="fr"><i>${n}</i>${box(d)}</span>`;
};
/* Answer slot for a fraction or mixed number: an empty template on the worksheet, the red value on the key. */
function ansTpl(a, key) {
  if (key) return `<span class="ak">${a.w ? `<span class="mw">${a.w}</span>` : ''}${a.n || !a.w ? frH(a.n, a.d) : ''}</span>`;
  return `${a.w ? '<span class="mw bl">&nbsp;</span>' : ''}${a.n || !a.w ? '<span class="fr tp"><i>&nbsp;</i><i>&nbsp;</i></span>' : ''}`;
}
const frW = (n, d) => Math.max(String(n).length, String(d).length) * 0.62 + 0.7;
const tplW = a => (a.w ? 1.9 : 0) + (a.n || !a.w ? 2.6 : 0);
const BW = 3.2;   // width in em of an answer blank


/* ---------- drawing ---------- */
const ablank = (v, key, w) => `<span class="blank" style="min-width:${(w || 2.8).toFixed(1)}em">${key ? esc(v) : '&nbsp;'}</span>`;
function dcells(s, iw, fw, dot) {
  const parts = s.split('.'), i = parts[0], f = parts[1] || '', hasDot = s.indexOf('.') >= 0 || dot;
  let h = '';
  const pad = iw - i.length;
  for (let p = 0; p < iw; p++) {
    const r = iw - 1 - p, shown = p >= pad;
    h += `<span class="dg">${shown ? i[p - pad] : ''}</span>`;
    if (r > 0 && r % 3 === 0) h += `<span class="dg cm">${shown ? ',' : ''}</span>`;
  }
  if (fw > 0) h += `<span class="dg pt${s === '' && dot ? ' k0' : ''}">${hasDot ? '.' : ''}</span>`;
  for (const ch of f) h += `<span class="dg">${ch}</span>`;
  for (let k = f.length; k < fw; k++) h += '<span class="dg"></span>';
  return h;
}
function modHtml(p, key) {
  const x = (v, w) => ablank(v, key, w);
  if (p.mod === 'tm') return tmHtml(p, key);
  if (p.mod === 'fdp') {
    switch (p.type) {
      case 'simp': return `${frH(p.k * p.p, p.k * p.q)} = ${ansTpl({ w: 0, n: p.p, d: p.q }, key)}`;
      case 'equiv': return `${frH(p.p, p.q)} = ${p.hide === 'n' ? frBox(p.p * p.k, p.q * p.k, 'n', key) : frBox(p.p * p.k, p.q * p.k, 'd', key)}`;
      case 'cmp': return `${frH(p.a[0], p.a[1])}<span class="cb">${key ? esc(p.ans) : '&nbsp;'}</span>${frH(p.b[0], p.b[1])}`;
      case 'fadd': return `${frH(p.a[0], p.a[1])} ${p.op === 'add' ? '+' : '−'} ${frH(p.b[0], p.b[1])} = ${ansTpl(p.ans, key)}`;
      case 'fmulw': return `${frH(p.n, p.d)} × ${p.W} = ${x(p.ans, BW)}`;
      case 'fmul': return `${frH(p.a[0], p.a[1])} ${p.dv ? '÷' : '×'} ${frH(p.b[0], p.b[1])} = ${ansTpl(p.ans, key)}`;
      case 'decadd': {
        const rows = `<div class="vr"><span class="vo"></span>${dcells(p.sa, p.iw, p.fw)}</div><div class="vr"><span class="vo">${p.op === 'add' ? '+' : '−'}</span>${dcells(p.sb, p.iw, p.fw)}</div>`
          + `<div class="vl"></div><div class="vr a"><span class="vo"></span>${dcells(key ? p.ans : '', p.iw, p.fw, true)}</div>`;
        return `<div class="vp">${rows}</div>`;
      }
      case 'decmul': return `${p.expr} = ${x(p.ans, BW)}`;
      case 'pct': return `${p.P}% of ${p.N} = ${x(p.ans, BW)}`;
      default: {
        const lhs = { f2d: frH(p.fn, p.fd), f2p: frH(p.fn, p.fd), d2f: p.dec, d2p: p.dec, p2d: `${p.pct}%`, p2f: `${p.pct}%` }[p.dir];
        const rhs = { f2d: `${x(p.dec, 3)} <span class="sm">decimal</span>`, f2p: `${x(p.pct, 2.6)} %`, d2f: ansTpl(p.ans, key), d2p: `${x(p.pct, 2.6)} %`, p2d: `${x(p.dec, 3)} <span class="sm">decimal</span>`, p2f: ansTpl(p.ans, key) }[p.dir];
        return `${lhs} = ${rhs}`;
      }
    }
  }
  if (p.mod === 'vis') return visHtml(p, key, x);
  return NHTML[p.type](p, key, x);
}
function renderModCell(p, n, key) {
  const head = esc(p.prompt) + (p.type === 'line' ? ` ${ablank(p.ans, key, 3.2)}` : '');
  return `<div class="ac q"><span class="an">${n}</span><div class="qp">${head}</div><div class="qb${p.wide ? ' wq' : ''}">${modHtml(p, key)}</div></div>`;
}
function modNeed(p, fs) {
  const f = fs / 72;
  if (p.win) return [Math.max(p.win, (p.bw || 0) * f, p.prompt.length * 0.4 * f) + 0.3, p.hfs ? p.hin - 0.1 + 0.33 + p.hfs * f : p.hin + 0.5];   // hfs: the number line's height grows with the type size
  return [Math.max(p.ew, p.prompt.length * 0.4) * f + 0.3, p.eh * f + 0.45];
}

