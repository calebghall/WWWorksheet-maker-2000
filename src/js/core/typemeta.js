/* ---------- type metadata: planned home, tags and grade ranges ----------
   TYPE_HOME maps every problem type, as "<module today>.<id>", to the module and group it moves to in the regrouped layout
   (notes/roadmap.md, Phase 5.2). Keys carry the old module because ids repeat across modules (cmp, conv).
   It covers the registry types (ns, vis) and the types that are hard-coded in the fdp, tm and area panels.
   Nothing reads it to render a worksheet yet; tests/logic-typemap.js checks it against the registry.
   Tags: "word" marks word problems, wherever they live. Grade ranges come from the presets: a type's range is the lowest and highest
   grade of the standards whose presets use it (kindergarten is 0). A type no preset uses has no range and is never filtered out. */
const TYPE_HOME = {
  "vis.cnt": ["ns", "Counting and number lines"],
  "vis.cntn": ["ns", "Counting and number lines"],
  "vis.picop": ["ns", "Counting and number lines"],
  "vis.showop": ["ns", "Counting and number lines"],
  "vis.array": ["ns", "Counting and number lines"],
  "vis.mfac": ["ns", "Counting and number lines"],
  "vis.dint": ["ns", "Counting and number lines"],
  "ns.cfwd": ["ns", "Counting and number lines"],
  "ns.kseq": ["ns", "Counting and number lines"],
  "ns.cseq": ["ns", "Counting and number lines"],
  "ns.skip": ["ns", "Counting and number lines"],
  "ns.parity": ["ns", "Counting and number lines"],
  "ns.par20": ["ns", "Counting and number lines"],
  "ns.line": ["ns", "Counting and number lines"],
  "vis.nline": ["ns", "Counting and number lines"],
  "ns.place": ["ns", "Place value, comparing and rounding"],
  "ns.placew": ["ns", "Place value, comparing and rounding"],
  "ns.tens": ["ns", "Place value, comparing and rounding"],
  "ns.numrw": ["ns", "Place value, comparing and rounding"],
  "ns.more": ["ns", "Place value, comparing and rounding"],
  "ns.moreexp": ["ns", "Place value, comparing and rounding"],
  "ns.tenx": ["ns", "Place value, comparing and rounding"],
  "ns.compare": ["ns", "Place value, comparing and rounding"],
  "ns.cmp2": ["ns", "Place value, comparing and rounding"],
  "ns.order": ["ns", "Place value, comparing and rounding"],
  "ns.round": ["ns", "Place value, comparing and rounding"],
  "ns.roundw": ["ns", "Place value, comparing and rounding"],
  "ns.rnd3": ["ns", "Place value, comparing and rounding"],
  "ns.est": ["ns", "Place value, comparing and rounding"],
  "ns.fact": ["ns", "Factors and multiples"],
  "ns.facmodel": ["ns", "Factors and multiples"],
  "ns.wadd": ["ns", "Word problems"],
  "ns.wlen": ["ns", "Word problems"],
  "ns.wmul": ["ns", "Word problems"],
  "ns.wcmp": ["ns", "Word problems"],
  "ns.wstep": ["ns", "Word problems"],
  "ns.west": ["ns", "Word problems"],
  "ns.mword": ["ns", "Word problems"],
  "ns.bond": ["oa", "Bonds, equations and properties"],
  "ns.bondp": ["oa", "Bonds, equations and properties"],
  "ns.eqn": ["oa", "Bonds, equations and properties"],
  "ns.equal": ["oa", "Bonds, equations and properties"],
  "ns.prop": ["oa", "Bonds, equations and properties"],
  "ns.rel": ["oa", "Bonds, equations and properties"],
  "ns.substr": ["oa", "Bonds, equations and properties"],
  "ns.sub10": ["oa", "Bonds, equations and properties"],
  "ns.mul10": ["oa", "Bonds, equations and properties"],
  "ns.mcomp": ["oa", "Bonds, equations and properties"],
  "ns.exeval": ["oa", "Order of operations and expressions"],
  "ns.exwrite": ["oa", "Order of operations and expressions"],
  "vis.pat": ["oa", "Patterns and charts"],
  "vis.patmake": ["oa", "Patterns and charts"],
  "vis.chart": ["oa", "Patterns and charts"],
  "vis.chartwhy": ["oa", "Patterns and charts"],
  "vis.mchart": ["oa", "Patterns and charts"],
  "ns.rulepat": ["oa", "Patterns and charts"],
  "ns.rule2": ["oa", "Patterns and charts"],
  "ns.rule2g": ["oa", "Patterns and charts"],
  "vis.part": ["fdp", "Visual models and number lines"],
  "vis.partw": ["fdp", "Visual models and number lines"],
  "vis.pdraw": ["fdp", "Visual models and number lines"],
  "vis.gpart": ["fdp", "Visual models and number lines"],
  "vis.fmodel": ["fdp", "Visual models and number lines"],
  "vis.fline": ["fdp", "Visual models and number lines"],
  "fdp.simp": ["fdp", "Compare, simplify and equivalence"],
  "fdp.equiv": ["fdp", "Compare, simplify and equivalence"],
  "fdp.cmp": ["fdp", "Compare, simplify and equivalence"],
  "ns.f100": ["fdp", "Compare, simplify and equivalence"],
  "ns.fdec": ["fdp", "Compare, simplify and equivalence"],
  "fdp.fadd": ["fdp", "Fraction operations"],
  "fdp.fmul": ["fdp", "Fraction operations"],
  "ns.fadd5": ["fdp", "Fraction operations"],
  "ns.fctx": ["fdp", "Fraction operations"],
  "ns.fdiv5": ["fdp", "Fraction operations"],
  "ns.fmul5": ["fdp", "Fraction operations"],
  "ns.fscale": ["fdp", "Fraction operations"],
  "ns.fword6": ["fdp", "Fraction operations"],
  "ns.fdiv7": ["fdp", "Fraction operations"],
  "fdp.decadd": ["fdp", "Decimals, powers of 10 and percents"],
  "fdp.decmul": ["fdp", "Decimals, powers of 10 and percents"],
  "ns.tenxd": ["fdp", "Decimals, powers of 10 and percents"],
  "ns.pow10": ["fdp", "Decimals, powers of 10 and percents"],
  "ns.decrw": ["fdp", "Decimals, powers of 10 and percents"],
  "ns.rnddec": ["fdp", "Decimals, powers of 10 and percents"],
  "ns.decrsn": ["fdp", "Decimals, powers of 10 and percents"],
  "fdp.conv": ["fdp", "Decimals, powers of 10 and percents"],
  "fdp.pct": ["fdp", "Decimals, powers of 10 and percents"],
  "vis.coin": ["tm", "Time and money"],
  "tm.like": ["tm", "Time and money"],
  "tm.cpic": ["tm", "Time and money"],
  "tm.coins": ["tm", "Time and money"],
  "tm.madd": ["tm", "Time and money"],
  "tm.change": ["tm", "Time and money"],
  "tm.cstory": ["tm", "Time and money"],
  "tm.clock": ["tm", "Time and money"],
  "tm.dclock": ["tm", "Time and money"],
  "tm.ampm": ["tm", "Time and money"],
  "tm.elapsed": ["tm", "Time and money"],
  "tm.conv": ["tm", "Time and money"],
  "vis.cmpm": ["meas", "Measuring and tools"],
  "vis.ord3": ["meas", "Measuring and tools"],
  "vis.munit": ["meas", "Measuring and tools"],
  "vis.ruler": ["meas", "Measuring and tools"],
  "vis.mtwo": ["meas", "Measuring and tools"],
  "vis.mdiff": ["meas", "Measuring and tools"],
  "vis.mest": ["meas", "Measuring and tools"],
  "vis.mattr": ["meas", "Measuring and tools"],
  "vis.mtool": ["meas", "Measuring and tools"],
  "vis.mrule2": ["meas", "Measuring and tools"],
  "vis.rulq": ["meas", "Measuring and tools"],
  "vis.mvol": ["meas", "Measuring and tools"],
  "ns.convm": ["meas", "Unit conversions"],
  "ns.conv5": ["meas", "Unit conversions"],
  "vis.sort": ["meas", "Graphs and line plots"],
  "vis.tally": ["meas", "Graphs and line plots"],
  "vis.pict": ["meas", "Graphs and line plots"],
  "vis.bar": ["meas", "Graphs and line plots"],
  "vis.pict4": ["meas", "Graphs and line plots"],
  "vis.bar4": ["meas", "Graphs and line plots"],
  "vis.pictg": ["meas", "Graphs and line plots"],
  "vis.barg": ["meas", "Graphs and line plots"],
  "vis.lplot": ["meas", "Graphs and line plots"],
  "vis.lplotq": ["meas", "Graphs and line plots"],
  "ns.lineplot": ["meas", "Graphs and line plots"],
  "ns.lplot5": ["meas", "Graphs and line plots"],
  "vis.shname": ["geom", "Shapes, solids and symmetry"],
  "vis.shall": ["geom", "Shapes, solids and symmetry"],
  "vis.shdraw": ["geom", "Shapes, solids and symmetry"],
  "vis.solid": ["geom", "Shapes, solids and symmetry"],
  "vis.pos": ["geom", "Shapes, solids and symmetry"],
  "vis.pos2": ["geom", "Shapes, solids and symmetry"],
  "vis.shcmp": ["geom", "Shapes, solids and symmetry"],
  "vis.shbuild": ["geom", "Shapes, solids and symmetry"],
  "vis.comp": ["geom", "Shapes, solids and symmetry"],
  "vis.split": ["geom", "Shapes, solids and symmetry"],
  "vis.gcat": ["geom", "Shapes, solids and symmetry"],
  "vis.gpoly": ["geom", "Shapes, solids and symmetry"],
  "vis.gclass": ["geom", "Shapes, solids and symmetry"],
  "vis.gsym": ["geom", "Shapes, solids and symmetry"],
  "vis.ghier": ["geom", "Shapes, solids and symmetry"],
  "vis.gfig": ["geom", "Lines and angles"],
  "vis.angc": ["geom", "Lines and angles"],
  "vis.protr": ["geom", "Lines and angles"],
  "vis.angadd": ["geom", "Lines and angles"],
  "area.count": ["geom", "Area and perimeter"],
  "area.mult": ["geom", "Area and perimeter"],
  "area.draw": ["geom", "Area and perimeter"],
  "area.cmp": ["geom", "Area and perimeter"],
  "area.lsh": ["geom", "Area and perimeter"],
  "vis.acon": ["geom", "Area and perimeter"],
  "vis.pera": ["geom", "Area and perimeter"],
  "ns.perim": ["geom", "Area and perimeter"],
  "ns.rectf": ["geom", "Area and perimeter"],
  "vis.vcubes": ["geom", "Space and coordinates"],
  "vis.vlwh": ["geom", "Space and coordinates"],
  "vis.vcomp": ["geom", "Space and coordinates"],
  "vis.cplane": ["geom", "Space and coordinates"],
  "vis.cpword": ["geom", "Space and coordinates"]
};
const WORD_IDS = ['wadd', 'wlen', 'wmul', 'wcmp', 'wstep', 'west', 'mword', 'fword6', 'cstory'];
function typeTags(mod, d) {
  const t = (d.tags || []).slice();
  if ((WORD_IDS.includes(d.id) || /word problem/i.test(d.label || '')) && !t.includes('word')) t.push('word');
  return t;
}
const gradeNum = c => { const g = String(c).split('.')[0]; return g === 'K' ? 0 : +g; };
let TYPE_GRADES_CACHE = null;
/* { "<module>.<id>": [lo, hi] } from every preset and every part of a bundled preset. */
function typeGradeRanges() {
  if (TYPE_GRADES_CACHE) return TYPE_GRADES_CACHE;
  const out = {};
  const add = (m, s, g) => { const ty = s && s.types; if (!ty) return; for (const id of ty) { const k = m + '.' + id, r = out[k]; if (!r) out[k] = [g, g]; else { r[0] = Math.min(r[0], g); r[1] = Math.max(r[1], g); } } };
  for (const s of STANDARDS) {
    const g = gradeNum(s.c);
    if (s.m === 'parts') for (const p of s.parts) add(p.m, p[p.m], g); else add(s.m, s[s.m], g);
  }
  return (TYPE_GRADES_CACHE = out);
}
/* Grade bands: the framework's own divisions of the grades (framework.js). Without bands, one band per grade. */
function frameworkBands() {
  if (FRAMEWORK.bands && FRAMEWORK.bands.length) return FRAMEWORK.bands;
  return STD_GRADE_IDS.map(id => ({ id, label: id, grades: [id === 'K' ? 0 : +id] }));
}
const bandById = id => frameworkBands().find(b => b.id === id) || null;
/* A type shows in a band when its grade range overlaps the band; a type with no range, or no band chosen, always shows. */
function typeInBand(mod, id, band) {
  if (!band) return true;
  const r = typeGradeRanges()[mod + '.' + id];
  if (!r) return true;
  return band.grades.some(g => g >= r[0] && g <= r[1]);
}
/* A standard shows in a band when its grade is one of the band's grades. */
const stdInBand = (code, band) => !band || band.grades.includes(gradeNum(code));
