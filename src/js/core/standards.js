/* ---------- Tennessee standards presets (from the Instructional Focus Documents, K-4) ----------
   Each preset configures one module. Fields:
     c  standard code            t  short worksheet title
     m  module id                n  note when the generator only partly matches the standard
   Module settings: as/md = addsub/muldiv settings objects; fd/ns/tm = { types: [ids], level }; area = { types: [ids], level }.
   Standards not listed here have no matching generator (see standards-coverage.md). */
const STD_GRADES = { K: 'Kindergarten', 1: 'Grade 1', 2: 'Grade 2', 3: 'Grade 3', 4: 'Grade 4', 5: 'Grade 5' };
const STD_GRADE_IDS = ['K', '1', '2', '3', '4', '5'];
const AS = (d1, d2, extra) => Object.assign({ add: true, sub: true, d1, d2, addends: 2, regroup: 'any', format: 'vertical', cap: 0, second: 'digits' }, extra || {});
const MD = o => Object.assign({ mul: true, div: true, mode: 'facts', tables: 10, focus: 0, rem: false, da: 2, db: 1, na: 3, nb: 1, format: 'vertical' }, o);
const STANDARDS = [
  { c: 'K.CC.A.1', t: 'Count by fives and tens', m: 'ns', ns: { types: ['kseq'], level: 1 } },
  { c: 'K.CC.A.2', t: 'Count on from any number', m: 'ns', ns: { types: ['cfwd'], level: 1 } },
  { c: 'K.CC.A.3', t: 'Write numbers 0 to 20 and show quantities', m: 'vis', vis: { types: ['cnt'], level: 3 } },
  { c: 'K.CC.A.4', t: 'Repeating patterns and the core', m: 'vis', vis: { types: ['pat', 'patmake'], level: 3 } },
  { c: 'K.CC.B.5', t: 'Count to tell how many', m: 'vis', vis: { types: ['cnt', 'cntn'], level: 2 } },
  { c: 'K.CC.B.6', t: 'Count up to 20 in lines, arrays and circles', m: 'vis', vis: { types: ['cnt'], level: 2 } },
  { c: 'K.OA.A.1', t: 'Show addition and subtraction with pictures', m: 'vis', vis: { types: ['picop', 'showop'], level: 2 } },
  { c: 'K.OA.A.2', t: 'Add and subtract within 10', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 10 }) },
  { c: 'K.OA.A.3', t: 'Decompose numbers to 10', m: 'ns', ns: { types: ['bond', 'bondp'], level: 1 } },
  { c: 'K.OA.A.4', t: 'Make ten', m: 'ns', ns: { types: ['bond', 'bondp'], level: 2 } },
  { c: 'K.OA.A.5', t: 'Addition and subtraction fluency within 10', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 10 }) },
  { c: 'K.NBT.A.1', t: 'Compose and decompose 11 to 19', m: 'ns', ns: { types: ['bond', 'bondp'], level: 3 } },
  { c: 'K.MD.A.1', t: 'Compare length, height and weight', m: 'vis', vis: { types: ['cmpm', 'mattr'], level: 2 } },
  { c: 'K.MD.A.2', t: 'Directly compare two objects', m: 'vis', vis: { types: ['cmpm'], level: 1 } },
  { c: 'K.MD.B.3', t: 'Identify coins and their values', m: 'vis', vis: { types: ['coin'], level: 2 } },
  { c: 'K.MD.C.4', t: 'Sort and compare groups', m: 'vis', vis: { types: ['sort'], level: 2 } },
  { c: 'K.G.A.1', t: 'Position words', m: 'vis', vis: { types: ['pos', 'pos2'], level: 2 } },
  { c: 'K.G.A.2', t: 'Name shapes in any orientation or size', m: 'vis', vis: { types: ['shname', 'shall'], level: 1 } },
  { c: 'K.G.A.3', t: 'Flat shapes and solids', m: 'vis', vis: { types: ['solid'], level: 1 } },
  { c: 'K.G.B.4', t: 'Compare flat shapes and solids', m: 'vis', vis: { types: ['solid', 'shcmp'], level: 2 } },
  { c: 'K.G.B.5', t: 'Draw shapes', m: 'vis', vis: { types: ['shdraw', 'shbuild'], level: 1 } },
  { c: 'K.G.B.6', t: 'Shapes inside a figure', m: 'vis', vis: { types: ['comp', 'split'], level: 1 } },
  { c: '1.OA.A.1', t: 'Add and subtract word problems within 20', m: 'ns', ns: { types: ['wadd'], level: 1 } },
  { c: '1.OA.A.2', t: 'Add three numbers', m: 'addsub', as: AS(1, 1, { sub: false, addends: 3, format: 'horizontal', cap: 20 }) },
  { c: '1.OA.B.3', t: 'Properties of addition', m: 'ns', ns: { types: ['prop', 'substr'], level: 1 } },
  { c: '1.OA.B.4', t: 'Subtraction as an unknown addend', m: 'ns', ns: { types: ['rel'], level: 1 } },
  { c: '1.OA.C.5', t: 'Add and subtract within 20', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 20 }) },
  { c: '1.OA.C.6', t: 'Addition and subtraction fluency within 20', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 20 }) },
  { c: '1.OA.D.7', t: 'Meaning of the equal sign', m: 'ns', ns: { types: ['equal'], level: 2 } },
  { c: '1.OA.D.8', t: 'Unknown number in an equation within 20', m: 'ns', ns: { types: ['eqn'], level: 1 } },
  { c: '1.NBT.A.1', t: 'Count on and back', m: 'ns', ns: { types: ['cfwd', 'numrw'], level: 3 } },
  { c: '1.NBT.A.2', t: 'Counting patterns', m: 'ns', ns: { types: ['skip'], level: 1 } },
  { c: '1.NBT.B.3', t: 'Tens and ones', m: 'ns', ns: { types: ['tens'], level: 3 } },
  { c: '1.NBT.B.4', t: 'Compare numbers', m: 'ns', ns: { types: ['cmp2'], level: 2 } },
  { c: '1.NBT.C.5', t: 'Add a two-digit and a one-digit number', m: 'addsub', as: AS(2, 1, { sub: false, format: 'horizontal', cap: 100, second: 'mix' }) },
  { c: '1.NBT.C.6', t: '10 more and 10 less', m: 'ns', ns: { types: ['more', 'moreexp'], level: 1 } },
  { c: '1.NBT.C.7', t: 'Subtract multiples of 10', m: 'ns', ns: { types: ['sub10'], level: 1 } },
  { c: '1.MD.A.1', t: 'Order three objects by length', m: 'vis', vis: { types: ['ord3'], level: 3 } },
  { c: '1.MD.A.2', t: 'Measure with non-standard units', m: 'vis', vis: { types: ['munit'], level: 1 } },
  { c: '1.MD.B.3', t: 'Tell time to the hour and half hour', m: 'tm', tm: { types: ['clock', 'dclock'], level: 1 } },
  { c: '1.MD.B.4', t: 'Count coins under one dollar', m: 'tm', tm: { types: ['like', 'cpic', 'coins'], level: 1 } },
  { c: '1.MD.C.5', t: 'Tally charts, pictographs and bar graphs', m: 'vis', vis: { types: ['tally', 'pict', 'bar'], level: 2 } },
  { c: '1.G.A.1', t: 'Defining attributes of shapes', m: 'vis', vis: { types: ['shall', 'shname', 'shdraw'], level: 2 } },
  { c: '1.G.A.2', t: 'Shapes that make a figure', m: 'vis', vis: { types: ['comp', 'split'], level: 2 } },
  { c: '1.G.A.3', t: 'Halves and fourths', m: 'vis', vis: { types: ['part', 'partw'], level: 1 } },
  { c: '2.OA.A.1', t: 'Add and subtract word problems within 100', m: 'ns', ns: { types: ['wadd'], level: 2 } },
  { c: '2.OA.B.2', t: 'Fluently add and subtract within 30', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 30 }) },
  { c: '2.OA.C.3', t: 'Odd and even', m: 'ns', ns: { types: ['par20'], level: 2 } },
  { c: '2.OA.C.4', t: 'Arrays and repeated addition', m: 'vis', vis: { types: ['array'], level: 2 } },
  { c: '2.OA.D.5', t: 'Patterns in hundreds and addition charts', m: 'vis', vis: { types: ['chart', 'chartwhy'], level: 3 } },
  { c: '2.NBT.A.1', t: 'Place value to hundreds', m: 'ns', ns: { types: ['place'], level: 1 } },
  { c: '2.NBT.A.2', t: 'Counting patterns', m: 'ns', ns: { types: ['skip', 'cseq'], level: 1 } },
  { c: '2.NBT.A.4', t: 'Compare three-digit numbers', m: 'ns', ns: { types: ['compare'], level: 1 } },
  { c: '2.NBT.B.5', t: 'Add and subtract within 100', m: 'addsub', as: AS(2, 2, { cap: 100 }) },
  { c: '2.NBT.B.6', t: 'Add two-digit numbers', m: 'addsub', as: AS(2, 2, { sub: false, addends: 4 }) },
  { c: '2.NBT.B.7', t: 'Add and subtract within 1000', m: 'addsub', as: AS(3, 3, { cap: 1000 }) },
  { c: '2.NBT.B.8', t: 'Mentally add or subtract 10 or 100', m: 'ns', ns: { types: ['more'], level: 2 } },
  { c: '2.MD.A.1', t: 'Measure length with a ruler', m: 'vis', vis: { types: ['ruler', 'mtool'], level: 2 } },
  { c: '2.MD.A.2', t: 'Measure with two different units', m: 'vis', vis: { types: ['mtwo', 'mrule2'], level: 2 } },
  { c: '2.MD.A.3', t: 'Estimate lengths', m: 'vis', vis: { types: ['mest'], level: 2 } },
  { c: '2.MD.A.4', t: 'How much longer', m: 'vis', vis: { types: ['mdiff'], level: 2 } },
  { c: '2.MD.B.5', t: 'Add and subtract lengths within 100', m: 'ns', ns: { types: ['wlen'], level: 2 } },
  { c: '2.MD.B.6', t: 'Number line sums and differences', m: 'vis', vis: { types: ['nline'], level: 3 } },
  { c: '2.MD.C.7', t: 'Tell time to five minutes', m: 'tm', tm: { types: ['clock', 'dclock', 'ampm'], level: 2 } },
  { c: '2.MD.C.8', t: 'Coins under one dollar', m: 'tm', tm: { types: ['cpic', 'madd', 'change', 'cstory'], level: 2 } },
  { c: '2.MD.D.9', t: 'Line plots', m: 'vis', vis: { types: ['lplot'], level: 3 } },
  { c: '2.MD.D.10', t: 'Draw pictographs and bar graphs', m: 'vis', vis: { types: ['pict4', 'bar4'], level: 3 } },
  { c: '2.G.A.1', t: 'Name and draw polygons', m: 'vis', vis: { types: ['shname', 'shall', 'shdraw'], level: 3 } },
  { c: '2.G.A.2', t: 'Count unit squares in a rectangle', m: 'area', area: { types: ['count'], level: 1 } },
  { c: '2.G.A.3', t: 'Equal shares', m: 'vis', vis: { types: ['part', 'pdraw'], level: 3 } },
  { c: '3.OA.A.3', t: 'Multiply and divide word problems', m: 'ns', ns: { types: ['wmul'], level: 2 } },
  { c: '3.OA.A.4', t: 'Unknown number in a multiplication or division equation', m: 'ns', ns: { types: ['eqn'], level: 3 } },
  { c: '3.OA.B.5', t: 'Properties of multiplication', m: 'ns', ns: { types: ['prop'], level: 3 } },
  { c: '3.OA.B.6', t: 'Division as an unknown factor', m: 'ns', ns: { types: ['rel'], level: 2 } },
  { c: '3.OA.C.7', t: 'Multiply and divide within 100', m: 'muldiv', md: MD({ tables: 10 }) },
  { c: '3.OA.D.8', t: 'Two-step word problems', m: 'ns', ns: { types: ['wmul', 'west'], level: 3 } },
  { c: '3.NBT.A.1', t: 'Round to the nearest 10 or 100', m: 'ns', ns: { types: ['rnd3'], level: 3 } },
  { c: '3.NBT.A.2', t: 'Add and subtract within 1000', m: 'addsub', as: AS(3, 3, { cap: 1000 }) },
  { c: '3.NBT.A.3', t: 'Multiply by multiples of 10', m: 'ns', ns: { types: ['mul10'], level: 1 } },
  { c: '3.NBT.A.4', t: 'Read and write numbers', m: 'ns', ns: { types: ['place'], level: 2 } },
  { c: '3.NF.A.3', t: 'Equivalent fractions and comparing fractions', m: 'fdp', fd: { types: ['equiv', 'cmp'], level: 1 } },
  { c: '3.MD.A.1', t: 'Time to the minute and elapsed time', m: 'tm', tm: { types: ['clock', 'elapsed'], level: 3 } },
  { c: '3.MD.C.6', t: 'Measure area by counting unit squares', m: 'area', area: { types: ['count'], level: 2 } },
  { c: '3.MD.C.7', t: 'Area of rectangles', m: 'area', area: { types: ['mult', 'lsh'], level: 2 } },
  { c: '3.MD.D.8', t: 'Perimeter', m: 'ns', ns: { types: ['perim'], level: 3 } },
  { c: '3.OA.A.1', t: 'Interpret factors and products', m: 'vis', vis: { types: ['mfac'], level: 2 } },
  { c: '3.OA.A.2', t: 'Interpret dividend, divisor and quotient', m: 'vis', vis: { types: ['dint'], level: 2 } },
  { c: '3.OA.D.9', t: 'Patterns in the multiplication chart', m: 'vis', vis: { types: ['mchart'], level: 3 } },
  { c: '3.NF.A.1', t: 'Fractions as parts of a whole', m: 'vis', vis: { types: ['fmodel'], level: 2 } },
  { c: '3.NF.A.2', t: 'Fractions on a number line', m: 'vis', vis: { types: ['fline'], level: 2 } },
  { c: '3.MD.A.2', t: 'Mass and liquid volume', m: 'vis', vis: { types: ['mvol'], level: 2 } },
  { c: '3.MD.B.3', t: 'Scaled pictographs and bar graphs', m: 'vis', vis: { types: ['pictg', 'barg'], level: 3 } },
  { c: '3.MD.B.4', t: 'Measure to halves and fourths; line plots', m: 'vis', vis: { types: ['rulq', 'lplotq'], level: 2 } },
  { c: '3.MD.C.5', t: 'Area concepts', m: 'vis', vis: { types: ['acon'], level: 2 } },
  { c: '3.G.A.1', t: 'Quadrilateral categories', m: 'vis', vis: { types: ['gcat'], level: 2 } },
  { c: '3.G.A.2', t: 'Equal areas and unit fractions', m: 'vis', vis: { types: ['gpart'], level: 2 } },
  { c: '3.G.A.3', t: 'Is it a polygon?', m: 'vis', vis: { types: ['gpoly'], level: 2 } },
  { c: '4.OA.A.1', t: 'Multiplicative comparison statements', m: 'ns', ns: { types: ['mcomp'], level: 2 } },
  { c: '4.OA.A.2', t: 'Multiplicative comparison word problems', m: 'ns', ns: { types: ['wcmp'], level: 2 } },
  { c: '4.OA.A.3', t: 'Multi-step word problems', m: 'ns', ns: { types: ['wstep'], level: 2 } },
  { c: '4.OA.B.4', t: 'Factors, multiples, prime and composite', m: 'ns', ns: { types: ['fact'], level: 2 }, n: 'Factor pairs are written as equations; models are not generated.' },
  { c: '4.OA.C.5', t: 'Number patterns', m: 'ns', ns: { types: ['skip'], level: 2 }, n: 'Patterns are skip counting; rule-based and shape patterns are not generated.' },
  { c: '4.NBT.A.1', t: 'Place value', m: 'ns', ns: { types: ['place'], level: 2 }, n: 'The ten-times relationship between places is not generated.' },
  { c: '4.NBT.A.2', t: 'Read and write multi-digit numbers', m: 'ns', ns: { types: ['place'], level: 3 }, n: 'Level 3 mixes in decimals.' },
  { c: '4.NBT.A.3', t: 'Round multi-digit numbers', m: 'ns', ns: { types: ['round'], level: 3 }, n: 'Rounds to thousands and ten thousands; level 3 also mixes in decimals.' },
  { c: '4.NBT.B.4', t: 'Add and subtract multi-digit numbers', m: 'addsub', as: AS(4, 4), n: 'Limited to four digits; the standard goes to 1,000,000.' },
  { c: '4.NBT.B.5', t: 'Multiply up to four digits by one digit', m: 'muldiv', md: MD({ div: false, mode: 'digits', da: 4, db: 1 }), n: 'Two-digit by two-digit problems: set both factors to 2 digits.' },
  { c: '4.NBT.B.6', t: 'Divide with remainders', m: 'muldiv', md: MD({ mul: false, mode: 'digits', na: 4, nb: 1, rem: true }) },
  { c: '4.NF.A.1', t: 'Equivalent fractions', m: 'fdp', fd: { types: ['equiv'], level: 2 } },
  { c: '4.NF.A.2', t: 'Compare fractions', m: 'fdp', fd: { types: ['cmp'], level: 3 } },
  { c: '4.NF.B.3', t: 'Add and subtract fractions with like denominators', m: 'fdp', fd: { types: ['fadd'], level: 1 } },
  { c: '4.NF.B.4', t: 'Multiply a whole number by a fraction', m: 'fdp', fd: { types: ['fmul'], level: 1 } },
  { c: '4.NF.C.5', t: 'Tenths and hundredths', m: 'ns', ns: { types: ['f100'], level: 3 } },
  { c: '4.NF.C.6', t: 'Fractions and decimals', m: 'fdp', fd: { types: ['conv'], level: 1 }, n: 'Conversions include percents; denominators are not limited to 10 and 100.' },
  { c: '4.NF.C.7', t: 'Compare decimals', m: 'ns', ns: { types: ['compare'], level: 3 } },
  { c: '4.MD.A.1', t: 'Convert units of time', m: 'tm', tm: { types: ['conv'], level: 2 }, n: 'Time units only; length, volume and mass are not generated.' },
  { c: '4.MD.A.3', t: 'Area of rectangles', m: 'area', area: { types: ['mult'], level: 3 }, n: 'Perimeter and unknown-side problems are not generated.' }
];
const STD_BY_CODE = {}; STANDARDS.forEach(s => { STD_BY_CODE[s.c] = s; });
const stdGrade = c => c.split('.')[0];
const stdList = g => STANDARDS.filter(s => stdGrade(s.c) === String(g));
const stdMap = (ids, all) => { const o = {}; all.forEach(id => { o[id] = ids.includes(id); }); return o; };

/* Applies a preset to a settings object in place: sets the module and the module's settings, leaves everything else (paper, pages, seed) alone. */
function applyStandard(st, code) {
  const s = STD_BY_CODE[code];
  if (!s) return st;
  st.module = s.m;
  if (s.m === 'addsub') st.as = Object.assign({}, s.as);
  else if (s.m === 'muldiv') st.md = Object.assign({}, s.md);
  else if (s.m === 'fdp') st.fd = { types: stdMap(s.fd.types, FD_TYPES), level: s.fd.level };
  else if (s.m === 'ns') st.ns = { types: stdMap(s.ns.types, NS_TYPES), level: s.ns.level };
  else if (s.m === 'vis') st.vis = { types: stdMap(s.vis.types, VIS_TYPES), level: s.vis.level };
  else if (s.m === 'tm') st.tm = { types: stdMap(s.tm.types, Object.keys(TGEN)), level: s.tm.level };
  else if (s.m === 'area') { st.types = stdMap(s.area.types, TYPE_IDS); st.level = s.area.level; }
  st.titles[s.m] = `${s.c} ${s.t}`;
  return st;
}
