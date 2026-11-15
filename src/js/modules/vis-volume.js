/* ---------- Shapes, Measures and Data: volume ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   vcubes: count unit cubes in a drawn prism, and what a volume in unit cubes means. vlwh: volume of a rectangular prism from its edges
   (l × w × h and B × h) and in real-world problems. vcomp: volume of two prisms joined, by adding.
   Prisms are drawn in oblique view: the front face l by h, the depth w drawn up and to the right, with unit-cube grid lines on all three visible faces. */

/* A prism l by w by h cubes. Front bottom-left corner at (x0, yb), cube edge s. Returns the svg shapes and the right and top extents. */
function vPrism(l, w, h, s, x0, yb, grid) {
  const dx = Math.round(s * 0.45), dy = Math.round(s * 0.45), yt = yb - h * s, xr = x0 + l * s, f = n => n.toFixed(1);
  const poly = (pts, fill) => `<polygon points="${pts.map(q => f(q[0]) + ',' + f(q[1])).join(' ')}" fill="${fill}" stroke="${VINK}" stroke-width="2" stroke-linejoin="round"/>`;
  let o = poly([[x0, yt], [xr, yt], [xr + w * dx, yt - w * dy], [x0 + w * dx, yt - w * dy]], VFILL[3]) + poly([[x0, yt], [xr, yt], [xr, yb], [x0, yb]], VFILL[0]) + poly([[xr, yt], [xr + w * dx, yt - w * dy], [xr + w * dx, yb - w * dy], [xr, yb]], VFILL[2]);
  if (grid) {
    let t = '';
    for (let i = 1; i < l; i++) t += `M${f(x0 + i * s)} ${f(yt)}V${f(yb)}M${f(x0 + i * s)} ${f(yt)}L${f(x0 + i * s + w * dx)} ${f(yt - w * dy)}`;
    for (let j = 1; j < h; j++) t += `M${f(x0)} ${f(yt + j * s)}H${f(xr)}M${f(xr)} ${f(yt + j * s)}L${f(xr + w * dx)} ${f(yt + j * s - w * dy)}`;
    for (let k = 1; k < w; k++) t += `M${f(x0 + k * dx)} ${f(yt - k * dy)}H${f(xr + k * dx)}M${f(xr + k * dx)} ${f(yt - k * dy)}V${f(yb - k * dy)}`;
    o += `<path d="${t}" stroke="${VINK}" stroke-width="0.9" fill="none"/>`;
  }
  return { svg: o, dx, dy, right: xr + w * dx, top: yt - w * dy };
}

/* cube edge so that a figure l wide, w deep and h tall fits in about 255 by 150 units */
const vvS = (l, w, h) => Math.max(9, Math.min(24, Math.floor(255 / (l + 0.45 * w)), Math.floor(150 / (h + 0.45 * w))));

const V_VUNITS = [['cubic units', 'unit'], ['cubic centimeters', 'cm'], ['cubic inches', 'in'], ['cubic feet', 'ft']];
const V_VIMPROV = ['blocks', 'crackers', 'sugar cubes', 'dice'];

/* a single prism with edge labels; returns { svg, win, hin } */
function vvFig(l, w, h, labs, grid) {
  const s = vvS(l, w, h), dx = Math.round(s * 0.45), x0 = 42, yb = h * s + w * dx + 8, pr = vPrism(l, w, h, s, x0, yb, grid);
  let o = pr.svg;
  if (labs) {
    o += vtxt(x0 + l * s / 2, yb + 16, labs.l, { b: 1, s: 13 }) + vtxt(x0 - 6, yb - h * s / 2 + 5, labs.h, { b: 1, s: 13, a: 'end' }) + vtxt(x0 + l * s + w * dx / 2 + 8, yb - w * dx / 2 + 14, labs.w, { b: 1, s: 13, a: 'start' });
  }
  const W = Math.max(pr.right + 52, 130), H = yb + 24;
  return { svg: o, W, H };
}

/* count the unit cubes in a prism, and what a volume in cubes means.
   L1 prisms up to 12 cubes in unit cubes, L2 up to 45 with real units, L3 up to 120 with improvised units and the unit-cube ideas. */
function vVcubes(rng, L) {
  const variant = pick(rng, L === 1 ? ['count', 'count', 'one'] : ['count', 'count', 'unit', 'one']);
  const u = L === 1 ? V_VUNITS[0] : pick(rng, V_VUNITS);
  if (variant === 'one') {
    const un = pick(rng, V_VUNITS.slice(1)), text = `A cube with edges of 1 ${un[1]} is a unit cube. How many cubic ${un[1] === 'cm' ? 'centimeters' : un[1] === 'in' ? 'inches' : 'feet'} is its volume?`;
    return vtext('vcubes', 'Volume of a unit cube.', { variant, text, ans: '1', unit: `cubic ${un[1] === 'cm' ? 'centimeter' : un[1] === 'in' ? 'inch' : 'foot'}`, sig: `vo${un[1]}`, }, 21, 1.1 + Math.ceil(text.length / 34) * 1.45 + 1.7 + 0.6, true);
  }
  if (variant === 'unit') {
    const n = ri(rng, 6, 60), o = shuffle(rng, [`${n} cubic units`, `${n} square units`, `${n} units`]);
    return vtext('vcubes', 'Volume from unit cubes.', { variant, n, opts: o, ans: `${n} cubic units`, text: `A solid is packed with ${n} unit cubes, with no gaps or overlaps. What is its volume?`, sig: `vu${n}${o.join('')}` }, 21, g3eh([75], g3optLen(o), 0), true);
  }
  const mx = L === 1 ? [3, 2, 2] : L === 2 ? [5, 3, 3] : [6, 4, 5];
  let l, w, h; do { l = ri(rng, 2, mx[0]); w = ri(rng, 1, mx[1]); h = ri(rng, 1, mx[2]); } while ((l * w * h < 4) || (L === 1 && l * w * h > 12));
  const unit = L === 3 && rng() < 0.4 ? pick(rng, V_VIMPROV) : u[0], fig = vvFig(l, w, h, null, true);
  return vp('vcubes', 'Count the cubes.', { variant, l, w, h, unit, ans: String(l * w * h), svg: fig.svg, sw: fig.W, sh: fig.H, sig: `vc${l}${w}${h}${unit}` }, Math.max(fig.W / 100, 1.3), fig.H / 100, 3.8, 0);
}

function vVcubesHtml(p, key, x) {
  if (p.variant === 'one') return `<div class="wt">${esc(p.text)}</div><div>${x(p.ans, 2.4)} ${p.unit}</div>`;
  if (p.variant === 'unit') return `<div class="wt">${esc(p.text)}</div><div>${vopts(p.opts, p.ans, key)}</div>`;
  const short = { 'cubic centimeters': 'cm', 'cubic inches': 'in', 'cubic feet': 'ft' }[p.unit], u = p.unit === 'cubic units' ? 'Each cube is 1 unit cube.' : short ? `Each cube is 1 ${short} on each edge.` : `The figure is packed with ${p.unit}.`;
  return vsvg(p.sw / 100, p.sh / 100, p.svg, `Prism made of ${p.l * p.w * p.h} cubes`) + `<div style="font-size:.85em">${esc(u)}</div><div>Volume: ${x(p.ans, 2.8)} ${p.unit}</div>`;
}

/* volume of one prism. edges: V = l × w × h; bh: V = B × h; assoc: group the three factors two ways; word: real-world problems.
   L1 edges to 5, L2 adds bh and edges to 9, L3 adds word problems and edges to 12. */
const V_VTHING = [['fish tank', 'inches', 'in'], ['box', 'centimeters', 'cm'], ['storage bin', 'feet', 'ft'], ['sandbox', 'feet', 'ft'], ['planter', 'inches', 'in'], ['pool', 'feet', 'ft']];

function vVlwh(rng, L) {
  const variant = pick(rng, L === 1 ? ['edges', 'edges', 'assoc'] : L === 2 ? ['edges', 'bh', 'assoc'] : ['edges', 'bh', 'word', 'word']), mx = L === 1 ? 5 : L === 2 ? 9 : 12;
  const l = ri(rng, 2, mx), w = ri(rng, 2, Math.min(mx, 8)), h = ri(rng, 2, Math.min(mx, 9)), V = l * w * h;
  if (variant === 'word') {
    const [thing, un, sh] = pick(rng, V_VTHING), text = `A ${thing} is ${l} ${un} long, ${w} ${un} wide and ${h} ${un} tall. What is its volume in cubic ${un}?`;
    return vtext('vlwh', 'Volume in a real-world problem.', { variant, l, w, h, unit: `cubic ${un}`, text, eq: `${l} × ${w} × ${h}`, ans: cnum(V), sig: `vw${l}.${w}.${h}${thing}` }, 21, 1.1 + Math.ceil(text.length / 34) * 1.45 + 1.6 + 1.7 + 0.6, true);
  }
  const un = pick(rng, V_VUNITS.slice(1)), labs = { l: `${l} ${un[1]}`, w: `${w} ${un[1]}`, h: `${h} ${un[1]}` }, fig = vvFig(l, w, h, labs, variant !== 'bh');
  const sh = un[1] === 'cm' ? 'cubic cm' : `cubic ${un[1] === 'in' ? 'in' : 'ft'}`;
  return vp('vlwh', variant === 'bh' ? 'Find the volume with B × h.' : variant === 'assoc' ? 'Find the volume two ways.' : 'Find the volume.', { variant, l, w, h, B: l * w, unit: sh, ans: cnum(V), svg: fig.svg, sw: fig.W, sh: fig.H, sig: `vl${variant}${l}.${w}.${h}${un[1]}` }, Math.max(fig.W / 100, 1.3), fig.H / 100, variant === 'edges' ? 3.2 : 4.8, 0);
}

function vVlwhHtml(p, key, x) {
  if (p.variant === 'word') return `<div class="wt">${esc(p.text)}</div><div>Equation: <span class="blank" style="min-width:9em">${key ? esc(p.eq) : '&nbsp;'}</span></div><div>Answer: ${x(p.ans, 3.6)} ${p.unit}</div>`;
  const fig = vsvg(p.sw / 100, p.sh / 100, p.svg, `Rectangular prism ${p.l} by ${p.w} by ${p.h}`);
  if (p.variant === 'bh') return `${fig}<div>B = ${p.B} square units</div><div>V = B × h = ${p.B} × ${p.h} = ${x(p.ans, 3)} ${p.unit}</div>`;
  if (p.variant === 'assoc') return `${fig}<div>(${p.l} × ${p.w}) × ${p.h} = ${x(String(p.B), 2.4)} × ${p.h} = ${x(p.ans, 3)} ${p.unit}</div>`;
  return `${fig}<div>V = l × w × h = ${x(p.ans, 3)} ${p.unit}</div>`;
}

/* two prisms of the same depth joined side by side. Add the volumes of the two parts.
   L1 edges to 4, L2 to 5, L3 to 6 with the parts' heights differing by more. */
function vVcomp(rng, L) {
  const mx = L === 1 ? 4 : L === 2 ? 5 : 6;
  let l1, l2, w, h1, h2;
  do { l1 = ri(rng, 2, mx); l2 = ri(rng, 2, mx); w = ri(rng, 2, Math.min(4, mx)); h1 = ri(rng, 2, mx); h2 = ri(rng, 1, mx); } while (h1 === h2);
  const un = pick(rng, V_VUNITS.slice(1)), u = un[1], s = Math.max(9, Math.min(22, Math.floor(255 / (l1 + l2 + 0.45 * w)), Math.floor(150 / (Math.max(h1, h2) + 0.45 * w)))), dx = Math.round(s * 0.45);
  const x0 = 42, yb = Math.max(h1, h2) * s + w * dx + 8, A = vPrism(l1, w, h1, s, x0, yb, true), B = vPrism(l2, w, h2, s, x0 + l1 * s, yb, true);
  let o = A.svg + B.svg;
  const tag = (cx, cy, t) => `<rect x="${(cx - 10).toFixed(1)}" y="${(cy - 12).toFixed(1)}" width="20" height="20" rx="4" fill="#fff" stroke="${VINK}" stroke-width="1.5"/>` + vtxt(cx, cy + 4, t, { b: 1, s: 15 });
  o += tag(x0 + l1 * s / 2, yb - h1 * s / 2, 'A') + tag(x0 + l1 * s + l2 * s / 2, yb - h2 * s / 2, 'B');
  o += vtxt(x0 + l1 * s / 2, yb + 16, `${l1} ${u}`, { b: 1, s: 12 }) + vtxt(x0 + l1 * s + l2 * s / 2, yb + 16, `${l2} ${u}`, { b: 1, s: 12 });
  o += vtxt(x0 - 6, yb - h1 * s / 2 + 5, `${h1} ${u}`, { b: 1, s: 12, a: 'end' }) + vtxt(B.right + 6, yb - h2 * s / 2 - w * dx / 2 + 5, `${h2} ${u}`, { b: 1, s: 12, a: 'start' });
  o += vtxt(B.right + 6, yb - w * dx / 2 + 16, `${w} ${u}`, { b: 1, s: 12, a: 'start' });
  const W = B.right + 58, H = yb + 24, VA = l1 * w * h1, VB = l2 * w * h2, sh = u === 'cm' ? 'cubic cm' : `cubic ${u}`;
  return vp('vcomp', 'Add the volumes of the two parts.', { l1, l2, w, h1, h2, VA, VB, unit: sh, ans: cnum(VA + VB), svg: o, sw: W, sh: H, sig: `vm${l1}.${l2}.${w}.${h1}.${h2}${u}` }, W / 100, H / 100, 4.8, 0);
}

function vVcompHtml(p, key, x) {
  return vsvg(p.sw / 100, p.sh / 100, p.svg, `Two joined prisms, A ${p.l1} by ${p.w} by ${p.h1} and B ${p.l2} by ${p.w} by ${p.h2}`)
    + `<div>A: ${x(cnum(p.VA), 2.8)} + B: ${x(cnum(p.VB), 2.8)}</div><div>Volume: ${x(p.ans, 3)} ${p.unit}</div>`;
}

defTypes("vis", "Volume", [
  { id: "vcubes", label: "Volume with unit cubes", blurb: "Count unit cubes in a prism, and what a volume in unit cubes means.", on: false, gen: vVcubes, html: vVcubesHtml },
  { id: "vlwh", label: "Volume of a rectangular prism", blurb: "l × w × h and B × h, grouping the factors, and real-world problems.", on: false, gen: vVlwh, html: vVlwhHtml },
  { id: "vcomp", label: "Volume of joined prisms", blurb: "Add the volumes of two prisms that make one solid.", on: false, gen: vVcomp, html: vVcompHtml }
]);
