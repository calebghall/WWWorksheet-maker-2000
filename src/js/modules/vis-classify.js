/* ---------- Shapes, Measures and Data: classifying two-dimensional figures ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   gclass: parallel sides, right angles and kinds of triangles in a drawn figure. gsym: lines of symmetry. ghier: a hierarchy of quadrilaterals
   (every square is a rectangle, and what is true of a category is true of its subcategories).
   Figures are lists of points around a center at (0, 0) in svg units; a figure is drawn turned by rot degrees and optionally mirrored. */

const GC_W = 240, GC_H = 170, GC_CX = 120, GC_CY = 85;

/* par: pairs of parallel sides; ra: number of right angles */
const GC_FIG = {
  rectangle: { pts: [[-65, -38], [65, -38], [65, 38], [-65, 38]], par: 2, ra: 4 },
  square: { pts: [[-48, -48], [48, -48], [48, 48], [-48, 48]], par: 2, ra: 4 },
  parallelogram: { pts: [[-45, -40], [75, -40], [45, 40], [-75, 40]], par: 2, ra: 0 },
  rhombus: { pts: [[0, -52], [34, 0], [0, 52], [-34, 0]], par: 2, ra: 0 },
  trapezoid: { pts: [[-30, -40], [40, -40], [75, 40], [-75, 40]], par: 1, ra: 0 },
  rtrap: { pts: [[-60, -40], [30, -40], [60, 40], [-60, 40]], par: 1, ra: 2 },
  kite: { pts: [[0, -55], [35, -5], [0, 50], [-35, -5]], par: 0, ra: 0 },
  pentagon: { pts: vreg(5, 0, 0, 62, 0), par: 0, ra: 0 },
  hexagon: { pts: vreg(6, 0, 0, 62, 0), par: 3, ra: 0 },
  acute: { pts: [[0, -52], [60, 45], [-60, 45]], par: 0, ra: 0, tri: 'acute' },
  right: { pts: [[-50, -40], [-50, 40], [60, 40]], par: 0, ra: 1, tri: 'right' },
  obtuse: { pts: [[-70, 40], [70, 40], [0, 0]], par: 0, ra: 0, tri: 'obtuse' }
};

/* the figure as drawn, as a sorted list of rounded corners: two turns or flips that look the same give the same text (so the repeat filter sees them as one problem) */
function gcCanon(pts, rot, mir) {
  const a = rot * Math.PI / 180;
  return pts.map(q => { const x = (mir ? -1 : 1) * q[0]; return Math.round(x * Math.cos(a) - q[1] * Math.sin(a)) + ',' + Math.round(x * Math.sin(a) + q[1] * Math.cos(a)); }).sort().join(';');
}
const gcHash = t => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h.toString(36); };

function gcDraw(f, rot, mir, extra) {
  const m = mir ? -1 : 1, pts = f.pts.map(q => [af1(GC_CX + m * q[0]), af1(GC_CY + q[1])]);
  return `<g transform="rotate(${rot} ${GC_CX} ${GC_CY})">${vpoly(pts.map(q => [+q[0], +q[1]]), VFILL[0], 0, 0, 0)}${extra || ''}</g>`;
}

function vGclass(rng, L) {
  const figs = L === 1 ? ['rectangle', 'square', 'parallelogram', 'rhombus', 'trapezoid'] : L === 2 ? ['rectangle', 'square', 'parallelogram', 'rhombus', 'trapezoid', 'rtrap', 'kite', 'acute', 'right', 'obtuse'] : Object.keys(GC_FIG);
  const kinds = L === 1 ? ['par'] : ['par', 'ra', 'tri'];
  const kind = pick(rng, kinds), name = pick(rng, kind === 'tri' ? ['acute', 'right', 'obtuse'] : kind === 'par' ? figs.filter(k => !GC_FIG[k].tri) : figs);
  const f = GC_FIG[name], rot = pick(rng, [0, 90, 180, 270]), mir = pick(rng, [false, true]);
  const base = { kind, name, rot, mir, svg: gcDraw(f, rot, mir) }, sg = `gc${kind}${name}${gcHash(gcCanon(f.pts, rot, mir))}`;
  if (kind === 'tri') return vp('gclass', 'Classify the triangle by its angles.', Object.assign(base, { ans: f.tri, opts: ['acute', 'right', 'obtuse'], sig: sg }), 3.3, GC_H / 100 + 0.85, 0, 0);
  if (kind === 'par') return vp('gclass', 'How many pairs of parallel sides?', Object.assign(base, { ans: String(f.par), sig: sg }), 3.3, GC_H / 100 + 0.55, 0, 0);
  return vp('gclass', 'How many right angles?', Object.assign(base, { ans: String(f.ra), sig: sg }), 3.3, GC_H / 100 + 0.55, 0, 0);
}
function vGclassHtml(p, key, x) {
  const fig = vsvg(GC_W / 100, GC_H / 100, p.svg, 'A two-dimensional figure');
  if (p.kind === 'tri') return `${fig}<div style="white-space:normal;width:3.3in">${vopts(p.opts, p.ans, key)}</div>`;
  return `${fig}<div>${x(p.ans, 1.6)} ${p.kind === 'par' ? 'pairs' : 'right angles'}</div>`;
}

/* ---------- lines of symmetry ---------- */
/* axes: directions in degrees (counterclockwise from the right) of the lines of symmetry through the center */
const GS_FIG = {
  square: { pts: GC_FIG.square.pts, axes: [0, 90, 45, 135] },
  rectangle: { pts: GC_FIG.rectangle.pts, axes: [0, 90] },
  triangle: { pts: vreg(3, 0, 0, 62, 0), axes: [90, 30, 150] },
  isosceles: { pts: [[0, -55], [38, 45], [-38, 45]], axes: [90] },
  rhombus: { pts: GC_FIG.rhombus.pts, axes: [0, 90] },
  parallelogram: { pts: GC_FIG.parallelogram.pts, axes: [] },
  kite: { pts: GC_FIG.kite.pts, axes: [90] },
  trapezoid: { pts: [[-35, -35], [35, -35], [70, 35], [-70, 35]], axes: [90] },
  pentagon: { pts: vreg(5, 0, 0, 62, 0), axes: [90, 162, 54, 126, 18] },
  hexagon: { pts: vreg(6, 0, 0, 62, 0), axes: [90, 30, 150, 0, 60, 120] }
};
const GS_NAME = { square: 'square', rectangle: 'rectangle', triangle: 'equilateral triangle', isosceles: 'isosceles triangle', rhombus: 'rhombus', parallelogram: 'parallelogram', kite: 'kite', trapezoid: 'isosceles trapezoid', pentagon: 'regular pentagon', hexagon: 'regular hexagon' };

function gsLine(f, deg, c, dash) {
  const r = Math.max(...f.pts.map(q => Math.hypot(q[0], q[1]))) + 12, a = aPt(GC_CX, GC_CY, r, deg), b = aPt(GC_CX, GC_CY, r, deg + 180);
  return `<line x1="${af1(a[0])}" y1="${af1(a[1])}" x2="${af1(b[0])}" y2="${af1(b[1])}" stroke="${c}" stroke-width="2.2" stroke-dasharray="${dash ? '7 5' : '0'}" stroke-linecap="round"/>`;
}
function gsSvg(name, rot, mir, lines, c, dash) {
  const f = GS_FIG[name], m = mir ? -1 : 1, pts = f.pts.map(q => [GC_CX + m * q[0], GC_CY + q[1]]);
  return `<g transform="rotate(${rot} ${GC_CX} ${GC_CY})">${vpoly(pts, VFILL[0], 0, 0, 0)}${lines.map(d => gsLine(f, m * d, c, dash)).join('')}</g>`;
}

function vGsym(rng, L) {
  const figs = L === 1 ? ['square', 'rectangle', 'triangle', 'isosceles'] : L === 2 ? ['square', 'rectangle', 'triangle', 'isosceles', 'rhombus', 'kite', 'trapezoid', 'parallelogram'] : Object.keys(GS_FIG);
  const kind = pick(rng, L === 1 ? ['count', 'count', 'is'] : ['count', 'is', 'draw']), name = pick(rng, kind === 'draw' ? figs.filter(k => GS_FIG[k].axes.length) : figs), f = GS_FIG[name], rot = pick(rng, [0, 90, 180, 270]), mir = pick(rng, [false, true]);
  const nm = GS_NAME[name], sg = `gs${kind}${name}${gcHash(gcCanon(f.pts, rot, mir))}`;
  if (kind === 'count') return vp('gsym', `Lines of symmetry: ${nm}.`, { kind, name, rot, mir, n: f.axes.length, ans: String(f.axes.length), svg: gsSvg(name, rot, mir, [], VINK, false), svgKey: gsSvg(name, rot, mir, f.axes, VKEY, true), sig: sg }, 3.3, GC_H / 100 + 0.55, 0, 0);
  if (kind === 'draw') return vp('gsym', `Draw all lines of symmetry: ${nm}.`, { kind, name, rot, mir, n: f.axes.length, ans: String(f.axes.length), svg: gsSvg(name, rot, mir, [], VINK, false), svgKey: gsSvg(name, rot, mir, f.axes, VKEY, true), sig: sg }, 3.3, GC_H / 100 + 0.2, 0, 0);
  const far = d => f.axes.every(a => { const t = Math.abs(((d - a) % 180 + 180) % 180); return Math.min(t, 180 - t) >= 10; }), bad = Array.from({ length: 35 }, (_, i) => 5 * i + 5).filter(far), yes = f.axes.length > 0 && ri(rng, 0, 1) === 1;
  const d = yes ? pick(rng, f.axes) : pick(rng, bad);
  return vp('gsym', 'Is the dashed line a line of symmetry?', { kind, name, rot, mir, d, ans: yes ? 'yes' : 'no', svg: gsSvg(name, rot, mir, [d], VINK, true), sig: `${sg}${((Math.round((mir ? -d : d) - rot) % 180) + 180) % 180}` }, 3.3, GC_H / 100 + 0.55, 0, 0);
}
function vGsymHtml(p, key, x) {
  const fig = vsvg(GC_W / 100, GC_H / 100, key && p.svgKey ? p.svgKey : p.svg, 'A figure');
  if (p.kind === 'draw') return fig;
  if (p.kind === 'is') return `${fig}<div>${vopts(['yes', 'no'], p.ans, key)}</div>`;
  return `${fig}<div>${x(p.ans, 1.6)} lines of symmetry</div>`;
}

/* ---------- a hierarchy of quadrilaterals ---------- */
/* what each category is also called (always true of every figure in it) */
const GH_UP = { square: ['rectangle', 'rhombus', 'parallelogram', 'quadrilateral'], rectangle: ['parallelogram', 'quadrilateral'], rhombus: ['parallelogram', 'quadrilateral'], parallelogram: ['quadrilateral'], quadrilateral: [] };
const GH_PL = { square: 'squares', rectangle: 'rectangles', rhombus: 'rhombuses', parallelogram: 'parallelograms', quadrilateral: 'quadrilaterals' };
const GH_NAMES = Object.keys(GH_UP);
/* properties: true of every figure in the listed categories (each list is closed under "is a kind of") */
const GH_PROP = [['four right angles', ['rectangle', 'square']], ['four equal sides', ['rhombus', 'square']], ['two pairs of parallel sides', ['parallelogram', 'rectangle', 'rhombus', 'square']], ['four sides', GH_NAMES]];

function vGhier(rng, L) {
  const kind = pick(rng, L === 1 ? ['tf', 'tf', 'choose'] : L === 2 ? ['tf', 'choose', 'prop'] : ['tf', 'choose', 'prop', 'inh', 'inh']);
  if (kind === 'tf') {
    const want = ri(rng, 0, 1) === 1, pairs = [];
    GH_NAMES.forEach(s => GH_NAMES.forEach(t => { if (s !== t && (GH_UP[s].includes(t) === want)) pairs.push([s, t]); }));
    const [s, t] = pick(rng, pairs), text = `True or false: All ${GH_PL[s]} are ${GH_PL[t]}.`;
    return vtext('ghier', 'Kinds of quadrilaterals.', { kind, s, t, text, opts: ['true', 'false'], ans: want ? 'true' : 'false', sig: `gh${kind}${s}${t}` }, 21, g3eh([text.length], 8, 0.8), true);
  }
  if (kind === 'choose') {
    const s = pick(rng, GH_NAMES.filter(k => GH_UP[k].length)), a = pick(rng, GH_UP[s]), pool = GH_NAMES.filter(k => k !== s && !GH_UP[s].includes(k)).concat(['triangle', 'pentagon', 'hexagon']);
    const opts = shuffle(rng, [a].concat(shuffle(rng, pool).slice(0, 3))), text = `Every ${s} is also a ...`;
    return vtext('ghier', 'Name a bigger group.', { kind, s, text, opts, ans: a, sig: `gh${kind}${s}${opts.join('')}` }, 21, g3eh([text.length], g3optLen(opts)), true);
  }
  if (kind === 'prop') {
    const want = ri(rng, 0, 1) === 1, [pr, cats] = pick(rng, GH_PROP.filter(q => want || q[1].length < GH_NAMES.length)), s = pick(rng, GH_NAMES.filter(k => cats.includes(k) === want)), text = `True or false: All ${GH_PL[s]} have ${pr}.`;
    return vtext('ghier', 'Properties of figures.', { kind, s, pr, text, opts: ['true', 'false'], ans: cats.includes(s) ? 'true' : 'false', sig: `gh${kind}${s}${pr}` }, 21, g3eh([text.length], 8, 0.8), true);
  }
  const cand = [];
  GH_PROP.forEach(([pr, cats]) => cats.forEach(s => { GH_NAMES.forEach(t => { if (t !== s && (GH_UP[t].includes(s) || GH_UP[s].includes(t))) cand.push([pr, s, t, cats.includes(t)]); }); }));
  const [pr, s, t, yes] = pick(rng, cand), text = `Every ${s} has ${pr}. Does every ${t} have ${pr}?`;
  return vtext('ghier', 'Properties and subcategories.', { kind, pr, s, t, text, opts: ['yes', 'no'], ans: yes ? 'yes' : 'no', sig: `gh${kind}${pr}${s}${t}` }, 21, g3eh([text.length], 6, 0.8), true);
}
function vGhierHtml(p, key, x) { return `<div class="wt">${esc(p.text)}</div><div>${vopts(p.opts, p.ans, key)}</div>`; }

defTypes("vis", "Classifying figures", [
  { id: "gclass", label: "Classify figures: parallel sides and right angles", blurb: "Count parallel sides and right angles in a figure and classify triangles by their angles.", on: false, gen: vGclass, html: vGclassHtml },
  { id: "gsym", label: "Lines of symmetry", blurb: "Count, check and draw lines of symmetry.", on: false, gen: vGsym, html: vGsymHtml },
  { id: "ghier", label: "Hierarchy of quadrilaterals", blurb: "Decide how kinds of quadrilaterals belong inside one another.", on: false, gen: vGhier, html: vGhierHtml }
]);
