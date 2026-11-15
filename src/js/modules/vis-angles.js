/* ---------- Shapes, Measures and Data: angles, protractors, points, lines and rays ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   angc: an angle as a fraction of a circle and as a count of one-degree angles. protr: measure an angle with a protractor and draw an angle of a given measure.
   angadd: angle measure is additive (a whole angle split into parts). gfig: name points, lines, segments and rays, name kinds of angles, and draw them.
   Angles are measured counterclockwise in degrees from the positive x direction; svg y runs downward, so aPt flips it. */

const aPt = (cx, cy, r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy - r * Math.sin(deg * Math.PI / 180)];
const af1 = n => n.toFixed(1);

/* arc of radius r from angle d1 to d2 (counterclockwise when d2 > d1) */
function aArc(cx, cy, r, d1, d2, c, w) {
  const a = aPt(cx, cy, r, d1), b = aPt(cx, cy, r, d2);
  return `<path d="M${af1(a[0])} ${af1(a[1])}A${r} ${r} 0 ${Math.abs(d2 - d1) > 180 ? 1 : 0} ${d2 > d1 ? 0 : 1} ${af1(b[0])} ${af1(b[1])}" fill="none" stroke="${c || VINK}" stroke-width="${w || 2}"/>`;
}

/* small filled arrowhead at (x, y) pointing in direction deg */
function aHead(x, y, deg, c) {
  const p1 = aPt(x, y, 11, deg + 180 - 22), p2 = aPt(x, y, 11, deg + 180 + 22);
  return `<polygon points="${af1(x)},${af1(y)} ${af1(p1[0])},${af1(p1[1])} ${af1(p2[0])},${af1(p2[1])}" fill="${c || VINK}" stroke="${c || VINK}" stroke-width="1" stroke-linejoin="round"/>`;
}

/* ---------- protractor ---------- */
const PR_W = 290, PR_H = 152, PR_CX = 145, PR_CY = 140, PR_R = 125;

/* A protractor with its center at the vertex. base 'R' puts the baseline ray on the right (read the outer scale), 'L' on the left (read the inner scale).
   The second ray is at deg degrees from the baseline ray; draw is 'both' (read), 'base' (only the baseline ray) or 'key' (baseline in ink, the answer ray in the key color). */
function protrSvg(base, deg, mode) {
  const cx = PR_CX, cy = PR_CY, R = PR_R;
  let o = `<path d="M${cx - R} ${cy}A${R} ${R} 0 0 1 ${cx + R} ${cy}Z" fill="none" stroke="${VINK}" stroke-width="1.6"/>`;
  o += vline(cx - R, cy, cx + R, cy, VINK, 1.2);
  let t = '';
  for (let d = 0; d <= 180; d++) {
    const len = d % 10 === 0 ? 13 : d % 5 === 0 ? 9 : 5, a = aPt(cx, cy, R, d), b = aPt(cx, cy, R - len, d);
    t += `M${af1(a[0])} ${af1(a[1])}L${af1(b[0])} ${af1(b[1])}`;
  }
  o += `<path d="${t}" stroke="${VINK}" stroke-width="0.8" fill="none"/>`;
  for (let d = 0; d <= 180; d += 10) {
    const e = d % 180 === 0 ? -8 : 0, a = aPt(cx, cy, R + (e ? 14 : 10), d), b = aPt(cx, cy, R - 24, d);
    o += vtxt(af1(a[0]), af1(a[1] + 3.5 + e), String(d), { s: 9.5 }) + vtxt(af1(b[0]), af1(b[1] + 3 + e), String(180 - d), { s: 8.5 });
  }
  o += `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${VINK}"/>`;
  const bdir = base === 'R' ? 0 : 180, sdir = base === 'R' ? deg : 180 - deg, e = aPt(cx, cy, R + 4, bdir), f = aPt(cx, cy, R + 4, sdir);
  o += vline(cx, cy, e[0], e[1], VINK, 2.4);
  if (mode === 'both') o += vline(cx, cy, f[0], f[1], VINK, 2.4);
  if (mode === 'key') o += vline(cx, cy, f[0], f[1], VKEY, 2.6);
  return o;
}

function vProtr(rng, L) {
  const kind = pick(rng, L === 1 ? ['read', 'read', 'draw'] : ['read', 'draw']), base = L === 1 ? 'R' : pick(rng, ['R', 'L']);
  let deg = L === 1 ? 10 * ri(rng, 2, 16) : L === 2 ? 5 * ri(rng, 3, 33) : ri(rng, 15, 165);
  if (L === 3 && ri(rng, 0, 2) === 0) deg = 5 * Math.round(deg / 5);
  return vp('protr', kind === 'read' ? 'Measure the angle.' : 'Draw the angle.', { kind, base, deg, ans: String(deg), sig: `pr${kind}${deg}${base}` }, PR_W / 100, PR_H / 100 + (kind === 'draw' ? 0.35 : 0) + 0.5, 0, 0);
}
function vProtrHtml(p, key, x) {
  const fig = vsvg(PR_W / 100, PR_H / 100, protrSvg(p.base, p.deg, p.kind === 'read' ? 'both' : key ? 'key' : 'base'), 'Protractor');
  if (p.kind === 'read') return `${fig}<div>Angle = ${x(p.ans, 2)}°</div>`;
  return `<div>Draw an angle of ${p.deg}°.</div>${fig}`;
}

/* ---------- angle measure is additive ---------- */
const AA_LET = 'ABCD';

/* figure for a whole angle split into parts (degrees). unk: index of the unknown part, or 'total'. Returns { svg, W, H }. */
function angAddFig(parts, unk, key) {
  const n = parts.length, total = parts.reduce((a, b) => a + b, 0), ang = [0];
  parts.forEach(q => ang.push(ang[ang.length - 1] + q));
  const els = [], pts = [[-14, 16]];
  const P = (r, d) => { const q = aPt(0, 0, r, d); pts.push(q); return q; };
  const lab = (q, txt, isKey) => vtxt(af1(q[0]), af1(q[1] + 4), txt, { s: 12, b: true, c: isKey ? VKEY : VINK });
  ang.forEach((d, i) => { const mid = i > 0 && i < n, e = P(mid ? 84 : 112, d), t = P(mid ? 103 : 126, d); els.push(vline(0, 0, e[0], e[1], VINK, 2.2)); els.push(vtxt(af1(t[0]), af1(t[1] + 4), AA_LET[i], { b: true })); });
  els.push(vtxt(-14, 16, 'O', { b: true }));
  parts.forEach((q, i) => { els.push(aArc(0, 0, 44, ang[i], ang[i + 1], VINK, 1.5)); const m = P(72, (ang[i] + ang[i + 1]) / 2); els.push(i === unk ? lab(m, key ? String(q) : '?', key) : lab(m, q + '°')); });
  els.push(aArc(0, 0, 94, 0, total, VINK, 1.5));
  const tm = P(122, total / 2);
  els.push(unk === 'total' ? lab(tm, key ? String(total) : '?', key) : lab(tm, total + '°'));
  const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]), mnx = Math.min(...xs) - 16, mny = Math.min(...ys) - 14, W = Math.round(Math.max(...xs) + 16 - mnx), H = Math.round(Math.max(...ys) + 16 - mny);
  return { svg: `<g transform="translate(${af1(-mnx)} ${af1(-mny)})">${els.join('')}</g>`, W, H };
}

function vAngadd(rng, L) {
  const kind = pick(rng, L === 1 ? ['sum', 'sum', 'part'] : L === 2 ? ['sum', 'part'] : ['sum', 'part', 'three']), st = L === 1 ? 10 : 5, lo = L === 1 ? 20 : 20;
  const parts = Array.from({ length: kind === 'three' ? 3 : 2 }, () => st * ri(rng, lo / st, (L === 1 ? 70 : 60) / st));
  const total = parts.reduce((a, b) => a + b, 0), unk = kind === 'sum' || kind === 'three' ? 'total' : ri(rng, 0, 1);
  const T = `angle AO${AA_LET[parts.length]}`, pn = i => `angle ${AA_LET[i]}O${AA_LET[i + 1]}`;
  let text, ans;
  if (unk === 'total') { text = parts.map((q, i) => `${pn(i)} = ${q}°`).join(', ').replace(/, ([^,]*)$/, parts.length === 2 ? ' and $1' : ', and $1') + `. What is the measure of ${T}?`; ans = total; }
  else { const k = 1 - unk; text = `${T} = ${total}°. ${pn(k)} = ${parts[k]}°. What is the measure of ${pn(unk)}?`; ans = parts[unk]; }
  const g = angAddFig(parts, unk, false);
  return vp('angadd', 'Add angle measures.', { kind, parts, unk, total, text, ans: String(ans), tgt: unk === 'total' ? T : pn(unk), sw: g.W, sh: g.H, sig: `aa${parts.join('-')}${unk}` }, Math.max(g.W / 100, 2.9), g.H / 100 + vwrapH(text, 2.9) + 0.75, 0, 0);
}
function vAngaddHtml(p, key, x) {
  const g = angAddFig(p.parts, p.unk, key);
  return `${vsvg(p.sw / 100, p.sh / 100, g.svg, 'An angle split into parts')}${vwrap(p.text, 2.9)}<div>${p.tgt} = ${x(p.ans, 2)}°</div>`;
}

/* ---------- angles and circles ---------- */
function circleWedges(d, k) {
  const cx = 70, cy = 70, R = 58;
  let o = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${VINK}" stroke-width="2"/>`;
  if (k) { const a = aPt(cx, cy, R, 90), b = aPt(cx, cy, R, 90 - 360 * k / d); o += `<path d="M${cx} ${cy}L${af1(a[0])} ${af1(a[1])}A${R} ${R} 0 ${k / d > .5 ? 1 : 0} 1 ${af1(b[0])} ${af1(b[1])}Z" fill="${VFILL[0]}" stroke="none"/>`; }
  for (let i = 0; i < d; i++) { const a = aPt(cx, cy, R, 90 - 360 * i / d); o += vline(cx, cy, af1(a[0]), af1(a[1]), VINK, 1.6); }
  return o + `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${VINK}"/>`;
}

function vAngc(rng, L) {
  const kind = pick(rng, L === 1 ? ['frac', 'ones'] : ['frac', 'frac', 'ones', 'tellnum']);
  if (kind === 'frac') {
    const d = pick(rng, L === 1 ? [2, 4] : L === 2 ? [3, 4, 6, 8, 10] : [5, 6, 8, 9, 10, 12]), k = L === 1 ? 1 : ri(rng, 1, Math.min(3, d - 1)), deg = 360 * k / d;
    return vp('angc', 'Angles in a circle.', { kind, d, k, deg, ans: String(deg), text: `A circle is cut into ${d} equal parts at the center. ${k === 1 ? 'One part is' : k + ' parts are'} shaded. What is the angle of the shaded part?`, sig: `ac${kind}${d}${k}` }, 2.9, 1.4 + vwrapH(`A circle is cut into ${d} equal parts at the center. ${k === 1 ? 'One part is' : k + ' parts are'} shaded. What is the angle of the shaded part?`, 2.9) + 0.6, 0, 0);
  }
  const n = L === 1 ? 10 * ri(rng, 2, 9) : L === 2 ? 5 * ri(rng, 4, 30) : ri(rng, 31, 179);
  if (kind === 'ones') return vtext('angc', 'One-degree angles.', { kind, n, ans: String(n), text: `An angle is made of ${n} one-degree angles with no gaps or overlaps. What is the measure of the angle?`, sig: `ac${kind}${n}` }, 21, g3eh([`An angle is made of ${n} one-degree angles with no gaps or overlaps. What is the measure of the angle?`.length], 0, 1.7), true);
  const d = pick(rng, [2, 3, 4, 5, 6, 8, 9, 10, 12]), nm = { 2: 'half', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 8: 'eighth', 9: 'ninth', 10: 'tenth', 12: 'twelfth' }[d];
  return vtext('angc', 'Degrees in a circle.', { kind, d, ans: String(360 / d), text: `A circle has 360 one-degree angles at its center. An angle turns through one ${nm} of the circle. How many degrees is the angle?`, sig: `ac${kind}${d}` }, 21, g3eh([136], 0, 1.7), true);
}
function vAngcHtml(p, key, x) {
  if (p.kind === 'frac') return `${vsvg(1.4, 1.4, circleWedges(p.d, p.k), 'A circle cut into equal parts')}${vwrap(p.text, 2.9)}<div>Angle = ${x(p.ans, 2.2)}°</div>`;
  return `<div class="wt">${esc(p.text)}</div><div>Angle = ${x(p.ans, 2.2)}°</div>`;
}

/* ---------- points, lines, rays and kinds of angles ---------- */
const GF_W = 240, GF_H = 150, GF_CX = 120, GF_CY = 75;
const GF_ANG = { acute: [30, 40, 50, 60, 70, 80], right: [90], obtuse: [100, 110, 120, 135, 150, 160], straight: [180], reflex: [200, 225, 250, 270, 300] };

/* a figure of the given kind drawn in color c; t is the direction (degrees) it is turned by, th the angle measure */
function gShape(kind, c, t, th) {
  const cx = GF_CX, cy = GF_CY, ends = (r1, r2) => [aPt(cx, cy, r1, t + 180), aPt(cx, cy, r2, t)];
  if (kind === 'point') return `<circle cx="${cx}" cy="${cy}" r="4.5" fill="${c}"/>${vtxt(cx, cy - 12, 'P', { b: true, c })}`;
  if (kind === 'line') { const [a, b] = ends(100, 100); return vline(af1(a[0]), af1(a[1]), af1(b[0]), af1(b[1]), c, 2.2) + aHead(b[0], b[1], t, c) + aHead(a[0], a[1], t + 180, c); }
  if (kind === 'segment') { const [a, b] = ends(80, 80); return vline(af1(a[0]), af1(a[1]), af1(b[0]), af1(b[1]), c, 2.2) + `<circle cx="${af1(a[0])}" cy="${af1(a[1])}" r="4.5" fill="${c}"/><circle cx="${af1(b[0])}" cy="${af1(b[1])}" r="4.5" fill="${c}"/>`; }
  if (kind === 'ray') { const [a, b] = ends(80, 100); return vline(af1(a[0]), af1(a[1]), af1(b[0]), af1(b[1]), c, 2.2) + `<circle cx="${af1(a[0])}" cy="${af1(a[1])}" r="4.5" fill="${c}"/>` + aHead(b[0], b[1], t, c); }
  const v = [cx, cy], e1 = aPt(cx, cy, 66, t), e2 = aPt(cx, cy, 66, t + th);
  let o = vline(v[0], v[1], af1(e1[0]), af1(e1[1]), c, 2.2) + vline(v[0], v[1], af1(e2[0]), af1(e2[1]), c, 2.2) + `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${c}"/>`;
  if (th === 90) { const a = aPt(cx, cy, 15, t), b = aPt(cx, cy, 15, t + 90), m = [a[0] + b[0] - cx, a[1] + b[1] - cy]; o += `<path d="M${af1(a[0])} ${af1(a[1])}L${af1(m[0])} ${af1(m[1])}L${af1(b[0])} ${af1(b[1])}" fill="none" stroke="${c}" stroke-width="1.6"/>`; }
  else o += aArc(cx, cy, th > 180 ? 28 : 24, t, t + th, c, 1.6);
  return o;
}

/* two lines: parallel, perpendicular or intersecting at a slant */
function gLines(kind, t, slant) {
  const cx = GF_CX, cy = GF_CY, seg = (p, d, r) => { const a = aPt(p[0], p[1], r, d), b = aPt(p[0], p[1], r, d + 180); return vline(af1(a[0]), af1(a[1]), af1(b[0]), af1(b[1]), VINK, 2.2) + aHead(a[0], a[1], d, VINK) + aHead(b[0], b[1], d + 180, VINK); };
  if (kind === 'parallel') { const n = aPt(cx, cy, 24, t + 90), m = aPt(cx, cy, 24, t - 90); return seg(n, t, 80) + seg(m, t, 80); }
  const d2 = kind === 'perpendicular' ? t + 90 : t + slant;
  let o = seg([cx, cy], t, 85) + seg([cx, cy], d2, 62);
  if (kind === 'perpendicular') { const a = aPt(cx, cy, 15, t), b = aPt(cx, cy, 15, t + 90), m = [a[0] + b[0] - cx, a[1] + b[1] - cy]; o += `<path d="M${af1(a[0])} ${af1(a[1])}L${af1(m[0])} ${af1(m[1])}L${af1(b[0])} ${af1(b[1])}" fill="none" stroke="${VINK}" stroke-width="1.6"/>`; }
  return o;
}

const GF_NAMES = { point: 'a point', line: 'a line', segment: 'a line segment', ray: 'a ray', acute: 'an acute angle', right: 'a right angle', obtuse: 'an obtuse angle', straight: 'a straight angle', reflex: 'a reflex angle' };
const GF_FIG = ['point', 'line', 'line segment', 'ray'], GF_LINES = ['parallel', 'perpendicular', 'intersecting'];

function vGfig(rng, L) {
  const kinds = L === 1 ? ['name', 'angtype'] : L === 2 ? ['name', 'angtype', 'lines', 'draw'] : ['name', 'angtype', 'lines', 'draw', 'draw'], kind = pick(rng, kinds);
  const angs = L === 1 ? ['acute', 'right', 'obtuse'] : L === 2 ? ['acute', 'right', 'obtuse', 'straight'] : ['acute', 'right', 'obtuse', 'straight', 'reflex'];
  const t = pick(rng, [0, 15, 30, -15, -30, 160, 195]);
  if (kind === 'name') { const w = pick(rng, ['point', 'line', 'segment', 'ray']), ans = w === 'segment' ? 'line segment' : w;
    return vp('gfig', 'What is the figure?', { kind, w, t, ans, opts: GF_FIG, svg: gShape(w, VINK, t, 0), sig: `gn${w}${w === 'point' ? '' : w === 'ray' ? t : ((t % 180) + 180) % 180}` }, 3.3, GF_H / 100 + 0.85, 0, 0); }
  if (kind === 'angtype') { const w = pick(rng, angs), th = pick(rng, GF_ANG[w]);
    return vp('gfig', 'What kind of angle?', { kind, w, t, th, ans: w, opts: angs, svg: gShape(w, VINK, t, th), sig: `ga${w}${th}${t}` }, 3.3, GF_H / 100 + 0.85, 0, 0); }
  if (kind === 'lines') { const w = pick(rng, GF_LINES), slant = pick(rng, [35, 50, 130, 145]);
    return vp('gfig', 'How are the two lines related?', { kind, w, t, slant, ans: w, opts: GF_LINES, svg: gLines(w, t, slant), sig: `gl${w}${((t % 180) + 180) % 180}${w === 'intersecting' ? slant : ''}` }, 3.3, GF_H / 100 + 0.85, 0, 0); }
  const w = pick(rng, L === 2 ? ['segment', 'ray', 'line', 'acute', 'right', 'obtuse'] : ['segment', 'ray', 'line', 'acute', 'right', 'obtuse', 'straight', 'reflex']), th = (GF_ANG[w] || [0])[ri(rng, 0, (GF_ANG[w] || [0]).length - 1)];
  const frame = `<rect x="4" y="4" width="${GF_W - 8}" height="${GF_H - 8}" rx="6" fill="none" stroke="${VINK}" stroke-width="1.2" stroke-dasharray="5 4" opacity=".55"/>`;
  return vp('gfig', `Draw ${GF_NAMES[w]}.`, { kind, w, t, th, ans: w, svg: frame, svgKey: frame + gShape(w, VKEY, t, th), sig: `gd${w}` }, GF_W / 100, GF_H / 100 + 0.2, 0, 0);
}
function vGfigHtml(p, key, x) {
  if (p.kind === 'draw') return vsvg(GF_W / 100, GF_H / 100, key ? p.svgKey : p.svg, 'Space to draw');
  return `${vsvg(GF_W / 100, GF_H / 100, p.svg, 'Figure')}<div style="white-space:normal;width:3.3in">${vopts(p.opts, p.ans, key)}</div>`;
}

defTypes("vis", "Angles, lines and figures", [
  { id: "angc", label: "Angles and circles", blurb: "An angle as a part of a circle; one-degree angles.", on: false, gen: vAngc, html: vAngcHtml },
  { id: "protr", label: "Measure and draw angles", blurb: "Read a protractor and draw an angle of a given measure.", on: false, gen: vProtr, html: vProtrHtml },
  { id: "angadd", label: "Add angle measures", blurb: "Join angles or split one into parts to find an unknown measure.", on: false, gen: vAngadd, html: vAngaddHtml },
  { id: "gfig", label: "Points, lines, rays and angles", blurb: "Name and draw points, lines, segments, rays and kinds of angles.", on: false, gen: vGfig, html: vGfigHtml }
]);
