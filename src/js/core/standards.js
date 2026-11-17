/* ---------- Standards presets for the framework named in framework.js (currently Tennessee, from the Instructional Focus Documents) ----------
   Each preset configures one module. Fields:
     c  standard code            t  short worksheet title
     m  module id                n  note when the generator only partly matches the standard
   Module settings: as/md = addsub/muldiv settings objects; fd/ns/tm = { types: [ids], level }; area = { types: [ids], level }.
   A standard that bundles skills is { c, t, m: 'parts', view: 'combo', parts: [...] }: each part is { m, n, label?, <settings> }
   with the settings shaped as above, so a part is a single-module preset plus a problem count (see parts.js).
   Standards not listed here have no matching generator (see standards-coverage.md). */
const STD_GRADES = { K: 'Kindergarten', 1: 'Grade 1', 2: 'Grade 2', 3: 'Grade 3', 4: 'Grade 4', 5: 'Grade 5' };
const STD_GRADE_IDS = ['K', '1', '2', '3', '4', '5'];
const AS = (d1, d2, extra) => Object.assign({ add: true, sub: true, d1, d2, addends: 2, regroup: 'any', format: 'vertical', cap: 0, second: 'digits' }, extra || {});
const MD = o => Object.assign({ mul: true, div: true, mode: 'facts', tables: 10, focus: 0, rem: false, da: 2, db: 1, alt: false, da2: 2, db2: 2, na: 3, nb: 1, format: 'vertical' }, o);
const STANDARDS = [
  { c: 'K.CC.A.1', t: 'Count by fives and tens', m: 'num', num: { types: ['ns.kseq'], level: 1 } },
  { c: 'K.CC.A.2', t: 'Count on from any number', m: 'num', num: { types: ['ns.cfwd'], level: 1 } },
  { c: 'K.CC.A.3', t: 'Write numbers 0 to 20 and show quantities', m: 'num', num: { types: ['vis.cnt'], level: 3 } },
  { c: 'K.CC.A.4', t: 'Repeating patterns and the core', m: 'oa', oa: { types: ['vis.pat', 'vis.patmake'], level: 3 } },
  { c: 'K.CC.B.5', t: 'Count to tell how many', m: 'num', num: { types: ['vis.cnt', 'vis.cntn'], level: 2 } },
  { c: 'K.CC.B.6', t: 'Count up to 20 in lines, arrays and circles', m: 'num', num: { types: ['vis.cnt'], level: 2 } },
  { c: 'K.OA.A.1', t: 'Show addition and subtraction with pictures', m: 'num', num: { types: ['vis.picop', 'vis.showop'], level: 2 } },
  { c: 'K.OA.A.2', t: 'Add and subtract within 10', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 10 }) },
  { c: 'K.OA.A.3', t: 'Decompose numbers to 10', m: 'oa', oa: { types: ['ns.bond', 'ns.bondp'], level: 1 } },
  { c: 'K.OA.A.4', t: 'Make ten', m: 'oa', oa: { types: ['ns.bond', 'ns.bondp'], level: 2 } },
  { c: 'K.OA.A.5', t: 'Addition and subtraction fluency within 10', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 10 }) },
  { c: 'K.NBT.A.1', t: 'Compose and decompose 11 to 19', m: 'oa', oa: { types: ['ns.bond', 'ns.bondp'], level: 3 } },
  { c: 'K.MD.A.1', t: 'Compare length, height and weight', m: 'meas', meas: { types: ['vis.cmpm', 'vis.mattr'], level: 2 } },
  { c: 'K.MD.A.2', t: 'Directly compare two objects', m: 'meas', meas: { types: ['vis.cmpm'], level: 1 } },
  { c: 'K.MD.B.3', t: 'Identify coins and their values', m: 'time', time: { types: ['vis.coin'], level: 2 } },
  { c: 'K.MD.C.4', t: 'Sort and compare groups', m: 'meas', meas: { types: ['vis.sort'], level: 2 } },
  { c: 'K.G.A.1', t: 'Position words', m: 'geom', geom: { types: ['vis.pos', 'vis.pos2'], level: 2 } },
  { c: 'K.G.A.2', t: 'Name shapes in any orientation or size', m: 'geom', geom: { types: ['vis.shname', 'vis.shall'], level: 1 } },
  { c: 'K.G.A.3', t: 'Flat shapes and solids', m: 'geom', geom: { types: ['vis.solid'], level: 1 } },
  { c: 'K.G.B.4', t: 'Compare flat shapes and solids', m: 'geom', geom: { types: ['vis.solid', 'vis.shcmp'], level: 2 } },
  { c: 'K.G.B.5', t: 'Draw shapes', m: 'geom', geom: { types: ['vis.shdraw', 'vis.shbuild'], level: 1 } },
  { c: 'K.G.B.6', t: 'Shapes inside a figure', m: 'geom', geom: { types: ['vis.comp', 'vis.split'], level: 1 } },
  { c: '1.OA.A.1', t: 'Add and subtract word problems within 20', m: 'num', num: { types: ['ns.wadd'], level: 1 } },
  { c: '1.OA.A.2', t: 'Add three numbers', m: 'addsub', as: AS(1, 1, { sub: false, addends: 3, format: 'horizontal', cap: 20 }) },
  { c: '1.OA.B.3', t: 'Properties of addition', m: 'oa', oa: { types: ['ns.prop', 'ns.substr'], level: 1 } },
  { c: '1.OA.B.4', t: 'Subtraction as an unknown addend', m: 'oa', oa: { types: ['ns.rel'], level: 1 } },
  { c: '1.OA.C.5', t: 'Add and subtract within 20', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 20 }) },
  { c: '1.OA.C.6', t: 'Addition and subtraction fluency within 20', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 20 }) },
  { c: '1.OA.D.7', t: 'Meaning of the equal sign', m: 'oa', oa: { types: ['ns.equal'], level: 2 } },
  { c: '1.OA.D.8', t: 'Unknown number in an equation within 20', m: 'oa', oa: { types: ['ns.eqn'], level: 1 } },
  { c: '1.NBT.A.1', t: 'Count on and back', m: 'num', num: { types: ['ns.cfwd', 'ns.numrw'], level: 3 } },
  { c: '1.NBT.A.2', t: 'Counting patterns', m: 'num', num: { types: ['ns.skip'], level: 1 } },
  { c: '1.NBT.B.3', t: 'Tens and ones', m: 'num', num: { types: ['ns.tens'], level: 3 } },
  { c: '1.NBT.B.4', t: 'Compare numbers', m: 'num', num: { types: ['ns.cmp2'], level: 2 } },
  { c: '1.NBT.C.5', t: 'Add a two-digit and a one-digit number', m: 'addsub', as: AS(2, 1, { sub: false, format: 'horizontal', cap: 100, second: 'mix' }) },
  { c: '1.NBT.C.6', t: '10 more and 10 less', m: 'num', num: { types: ['ns.more', 'ns.moreexp'], level: 1 } },
  { c: '1.NBT.C.7', t: 'Subtract multiples of 10', m: 'oa', oa: { types: ['ns.sub10'], level: 1 } },
  { c: '1.MD.A.1', t: 'Order three objects by length', m: 'meas', meas: { types: ['vis.ord3'], level: 3 } },
  { c: '1.MD.A.2', t: 'Measure with non-standard units', m: 'meas', meas: { types: ['vis.munit'], level: 1 } },
  { c: '1.MD.B.3', t: 'Tell time to the hour and half hour', m: 'time', time: { types: ['tm.clock', 'tm.dclock'], level: 1 } },
  { c: '1.MD.B.4', t: 'Count coins under one dollar', m: 'time', time: { types: ['tm.like', 'tm.cpic', 'tm.coins'], level: 1 } },
  { c: '1.MD.C.5', t: 'Tally charts, pictographs and bar graphs', m: 'meas', meas: { types: ['vis.tally', 'vis.pict', 'vis.bar'], level: 2 } },
  { c: '1.G.A.1', t: 'Defining attributes of shapes', m: 'geom', geom: { types: ['vis.shall', 'vis.shname', 'vis.shdraw'], level: 2 } },
  { c: '1.G.A.2', t: 'Shapes that make a figure', m: 'geom', geom: { types: ['vis.comp', 'vis.split'], level: 2 } },
  { c: '1.G.A.3', t: 'Halves and fourths', m: 'frac', frac: { types: ['vis.part', 'vis.partw'], level: 1 } },
  { c: '2.OA.A.1', t: 'Add and subtract word problems within 100', m: 'num', num: { types: ['ns.wadd'], level: 2 } },
  { c: '2.OA.B.2', t: 'Fluently add and subtract within 30', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 30 }) },
  { c: '2.OA.C.3', t: 'Odd and even', m: 'num', num: { types: ['ns.par20'], level: 2 } },
  { c: '2.OA.C.4', t: 'Arrays and repeated addition', m: 'num', num: { types: ['vis.array'], level: 2 } },
  { c: '2.OA.D.5', t: 'Patterns in hundreds and addition charts', m: 'oa', oa: { types: ['vis.chart', 'vis.chartwhy'], level: 3 } },
  { c: '2.NBT.A.1', t: 'Place value to hundreds', m: 'num', num: { types: ['ns.place'], level: 1 } },
  { c: '2.NBT.A.2', t: 'Counting patterns', m: 'num', num: { types: ['ns.skip', 'ns.cseq'], level: 1 } },
  { c: '2.NBT.A.4', t: 'Compare three-digit numbers', m: 'num', num: { types: ['ns.compare'], level: 1 } },
  { c: '2.NBT.B.5', t: 'Add and subtract within 100', m: 'addsub', as: AS(2, 2, { cap: 100 }) },
  { c: '2.NBT.B.6', t: 'Add two-digit numbers', m: 'addsub', as: AS(2, 2, { sub: false, addends: 4 }) },
  { c: '2.NBT.B.7', t: 'Add and subtract within 1000', m: 'addsub', as: AS(3, 3, { cap: 1000 }) },
  { c: '2.NBT.B.8', t: 'Mentally add or subtract 10 or 100', m: 'num', num: { types: ['ns.more'], level: 2 } },
  { c: '2.MD.A.1', t: 'Measure length with a ruler', m: 'meas', meas: { types: ['vis.ruler', 'vis.mtool'], level: 2 } },
  { c: '2.MD.A.2', t: 'Measure with two different units', m: 'meas', meas: { types: ['vis.mtwo', 'vis.mrule2'], level: 2 } },
  { c: '2.MD.A.3', t: 'Estimate lengths', m: 'meas', meas: { types: ['vis.mest'], level: 2 } },
  { c: '2.MD.A.4', t: 'How much longer', m: 'meas', meas: { types: ['vis.mdiff'], level: 2 } },
  { c: '2.MD.B.5', t: 'Add and subtract lengths within 100', m: 'num', num: { types: ['ns.wlen'], level: 2 } },
  { c: '2.MD.B.6', t: 'Number line sums and differences', m: 'num', num: { types: ['vis.nline'], level: 3 } },
  { c: '2.MD.C.7', t: 'Tell time to five minutes', m: 'time', time: { types: ['tm.clock', 'tm.dclock', 'tm.ampm'], level: 2 } },
  { c: '2.MD.C.8', t: 'Coins under one dollar', m: 'time', time: { types: ['tm.cpic', 'tm.madd', 'tm.change', 'tm.cstory'], level: 2 } },
  { c: '2.MD.D.9', t: 'Line plots', m: 'meas', meas: { types: ['vis.lplot'], level: 3 } },
  { c: '2.MD.D.10', t: 'Draw pictographs and bar graphs', m: 'meas', meas: { types: ['vis.pict4', 'vis.bar4'], level: 3 } },
  { c: '2.G.A.1', t: 'Name and draw polygons', m: 'geom', geom: { types: ['vis.shname', 'vis.shall', 'vis.shdraw'], level: 3 } },
  { c: '2.G.A.2', t: 'Count unit squares in a rectangle', m: 'geom', geom: { types: ['vis.acount'], level: 1 } },
  { c: '2.G.A.3', t: 'Equal shares', m: 'frac', frac: { types: ['vis.part', 'vis.pdraw'], level: 3 } },
  { c: '3.OA.A.3', t: 'Multiply and divide word problems', m: 'num', num: { types: ['ns.wmul'], level: 2 } },
  { c: '3.OA.A.4', t: 'Unknown number in a multiplication or division equation', m: 'oa', oa: { types: ['ns.eqn'], level: 3 } },
  { c: '3.OA.B.5', t: 'Properties of multiplication', m: 'oa', oa: { types: ['ns.prop'], level: 3 } },
  { c: '3.OA.B.6', t: 'Division as an unknown factor', m: 'oa', oa: { types: ['ns.rel'], level: 2 } },
  { c: '3.OA.C.7', t: 'Multiply and divide within 100', m: 'muldiv', md: MD({ tables: 10 }) },
  { c: '3.OA.D.8', t: 'Two-step word problems', m: 'num', num: { types: ['ns.wmul', 'ns.west'], level: 3 } },
  { c: '3.NBT.A.1', t: 'Round to the nearest 10 or 100', m: 'num', num: { types: ['ns.rnd3'], level: 3 } },
  { c: '3.NBT.A.2', t: 'Add and subtract within 1000', m: 'addsub', as: AS(3, 3, { cap: 1000 }) },
  { c: '3.NBT.A.3', t: 'Multiply by multiples of 10', m: 'oa', oa: { types: ['ns.mul10'], level: 1 } },
  { c: '3.NBT.A.4', t: 'Read and write numbers', m: 'num', num: { types: ['ns.place'], level: 2 } },
  { c: '3.NF.A.3', t: 'Equivalent fractions and comparing fractions', m: 'frac', frac: { types: ['fdp.equiv', 'fdp.cmp'], level: 1 } },
  { c: '3.MD.A.1', t: 'Time to the minute and elapsed time', m: 'time', time: { types: ['tm.clock', 'tm.elapsed'], level: 3 } },
  { c: '3.MD.C.6', t: 'Measure area by counting unit squares', m: 'geom', geom: { types: ['vis.acount'], level: 2 } },
  { c: '3.MD.C.7', t: 'Area of rectangles', m: 'geom', geom: { types: ['vis.amult', 'vis.alsh'], level: 2 } },
  { c: '3.MD.D.8', t: 'Perimeter', m: 'geom', geom: { types: ['ns.perim'], level: 3 } },
  { c: '3.OA.A.1', t: 'Interpret factors and products', m: 'num', num: { types: ['vis.mfac'], level: 2 } },
  { c: '3.OA.A.2', t: 'Interpret dividend, divisor and quotient', m: 'num', num: { types: ['vis.dint'], level: 2 } },
  { c: '3.OA.D.9', t: 'Patterns in the multiplication chart', m: 'oa', oa: { types: ['vis.mchart'], level: 3 } },
  { c: '3.NF.A.1', t: 'Fractions as parts of a whole', m: 'frac', frac: { types: ['vis.fmodel'], level: 2 } },
  { c: '3.NF.A.2', t: 'Fractions on a number line', m: 'frac', frac: { types: ['vis.fline'], level: 2 } },
  { c: '3.MD.A.2', t: 'Mass and liquid volume', m: 'meas', meas: { types: ['vis.mvol'], level: 2 } },
  { c: '3.MD.B.3', t: 'Scaled pictographs and bar graphs', m: 'meas', meas: { types: ['vis.pictg', 'vis.barg'], level: 3 } },
  { c: '3.MD.B.4', t: 'Measure to halves and fourths; line plots', m: 'meas', meas: { types: ['vis.rulq', 'vis.lplotq'], level: 2 } },
  { c: '3.MD.C.5', t: 'Area concepts', m: 'geom', geom: { types: ['vis.acon'], level: 2 } },
  { c: '3.G.A.1', t: 'Quadrilateral categories', m: 'geom', geom: { types: ['vis.gcat'], level: 2 } },
  { c: '3.G.A.2', t: 'Equal areas and unit fractions', m: 'frac', frac: { types: ['vis.gpart'], level: 2 } },
  { c: '3.G.A.3', t: 'Is it a polygon?', m: 'geom', geom: { types: ['vis.gpoly'], level: 2 } },
  { c: '4.OA.A.1', t: 'Multiplicative comparison statements', m: 'oa', oa: { types: ['ns.mcomp'], level: 2 } },
  { c: '4.OA.A.2', t: 'Multiplicative comparison word problems', m: 'num', num: { types: ['ns.wcmp'], level: 2 } },
  { c: '4.OA.A.3', t: 'Multi-step word problems', m: 'num', num: { types: ['ns.wstep'], level: 2 } },
  { c: '4.OA.B.4', t: 'Factors, multiples, prime and composite', m: 'num', num: { types: ['ns.fact', 'ns.facmodel'], level: 2 } },
  { c: '4.OA.C.5', t: 'Number and shape patterns', m: 'oa', oa: { types: ['ns.rulepat'], level: 2 } },
  { c: '4.NBT.A.1', t: 'Place value', m: 'num', num: { types: ['ns.place', 'ns.tenx'], level: 2 } },
  { c: '4.NBT.A.2', t: 'Read and write multi-digit numbers', m: 'num', num: { types: ['ns.placew'], level: 3 } },
  { c: '4.NBT.A.3', t: 'Round multi-digit numbers', m: 'num', num: { types: ['ns.roundw'], level: 3 } },
  { c: '4.NBT.B.4', t: 'Add and subtract within 1,000,000', m: 'addsub', as: AS(6, 6, { cap: 1000000 }) },
  { c: '4.NBT.B.5', t: 'Multiply four digits by one digit and two digits by two digits', m: 'parts', view: 'combo', parts: [
    { m: 'muldiv', n: 10, label: 'Four digits by one digit', md: MD({ div: false, mode: 'digits', da: 4, db: 1 }) },
    { m: 'muldiv', n: 10, label: 'Two digits by two digits', md: MD({ div: false, mode: 'digits', da: 2, db: 2 }) }] },
  { c: '4.NBT.B.6', t: 'Divide with remainders', m: 'muldiv', md: MD({ mul: false, mode: 'digits', na: 4, nb: 1, rem: true }) },
  { c: '4.NF.A.1', t: 'Equivalent fractions', m: 'frac', frac: { types: ['fdp.equiv'], level: 2 } },
  { c: '4.NF.A.2', t: 'Compare fractions', m: 'frac', frac: { types: ['fdp.cmp'], level: 3 } },
  { c: '4.NF.B.3', t: 'Add and subtract fractions with like denominators', m: 'frac', frac: { types: ['fdp.fadd'], level: 1 } },
  { c: '4.NF.B.4', t: 'Multiply a whole number by a fraction', m: 'frac', frac: { types: ['fdp.fmul'], level: 1 } },
  { c: '4.NF.C.5', t: 'Tenths and hundredths', m: 'frac', frac: { types: ['ns.f100'], level: 3 } },
  { c: '4.NF.C.6', t: 'Fractions and decimals', m: 'frac', frac: { types: ['ns.fdec'], level: 3 } },
  { c: '4.NF.C.7', t: 'Compare decimals', m: 'num', num: { types: ['ns.compare'], level: 3 } },
  { c: '4.MD.A.1', t: 'Convert measurement units', m: 'meas', meas: { types: ['ns.convm'], level: 2 } },
  { c: '4.MD.A.2', t: 'Measurement word problems', m: 'num', num: { types: ['ns.mword'], level: 3 } },
  { c: '4.MD.A.3', t: 'Area and perimeter of rectangles', m: 'geom', geom: { types: ['ns.rectf'], level: 2 } },
  { c: '4.MD.B.4', t: 'Line plots with fractional units', m: 'meas', meas: { types: ['ns.lineplot'], level: 2 } },
  { c: '4.MD.C.5', t: 'Angles and parts of a circle', m: 'geom', geom: { types: ['vis.angc', 'vis.gfig'], level: 2 } },
  { c: '4.MD.C.6', t: 'Measure and draw angles with a protractor', m: 'geom', geom: { types: ['vis.protr'], level: 3 } },
  { c: '4.MD.C.7', t: 'Angle measure is additive', m: 'geom', geom: { types: ['vis.angadd'], level: 2 } },
  { c: '4.G.A.1', t: 'Points, lines, segments, rays and angles', m: 'geom', geom: { types: ['vis.gfig'], level: 3 } },
  { c: '4.G.A.2', t: 'Classify figures by parallel sides and angles', m: 'geom', geom: { types: ['vis.gclass'], level: 2 } },
  { c: '4.G.A.3', t: 'Lines of symmetry', m: 'geom', geom: { types: ['vis.gsym'], level: 2 } },
  { c: '5.NBT.A.1', t: 'Ten times and one tenth', m: 'frac', frac: { types: ['ns.tenxd'], level: 2 } },
  { c: '5.NBT.A.2', t: 'Powers of 10', m: 'frac', frac: { types: ['ns.pow10'], level: 2 } },
  { c: '5.NBT.A.3', t: 'Read, write and compare decimals', m: 'parts', view: 'combo', parts: [
    { m: 'frac', n: 10, label: 'Read and write decimals', frac: { types: ['ns.decrw'], level: 3 } },
    { m: 'num', n: 10, label: 'Compare decimals', num: { types: ['ns.compare'], level: 3 } }] },
  { c: '5.NBT.A.4', t: 'Round decimals', m: 'frac', frac: { types: ['ns.rnddec'], level: 3 } },
  { c: '5.NBT.B.5', t: 'Multiply up to three digits by four digits', m: 'muldiv', md: MD({ div: false, mode: 'digits', da: 4, db: 3 }) },
  { c: '5.NBT.B.6', t: 'Divide four-digit numbers by two-digit numbers', m: 'muldiv', md: MD({ mul: false, mode: 'digits', na: 4, nb: 2, rem: true }) },
  { c: '5.NBT.B.7', t: 'Add, subtract, multiply and divide decimals', m: 'parts', view: 'combo', parts: [
    { m: 'frac', n: 5, label: 'Add, subtract and multiply decimals', frac: { types: ['fdp.decadd', 'fdp.decmul'], level: 3 } },
    { m: 'frac', n: 5, label: 'Divide by a decimal and check by estimating', frac: { types: ['ns.decrsn'], level: 3 } }] },
  { c: '5.OA.A.1', t: 'Evaluate expressions with grouping symbols', m: 'oa', oa: { types: ['ns.exeval'], level: 2 } },
  { c: '5.OA.A.2', t: 'Write and interpret expressions', m: 'oa', oa: { types: ['ns.exwrite'], level: 2 } },
  { c: '5.OA.B.3', t: 'Two patterns from two rules', m: 'oa', oa: { types: ['ns.rule2', 'ns.rule2g'], level: 2 } },
  { c: '5.NF.A.1', t: 'Add and subtract fractions and mixed numbers', m: 'frac', frac: { types: ['ns.fadd5'], level: 3 } },
  { c: '5.NF.A.2', t: 'Fraction addition and subtraction problems', m: 'frac', frac: { types: ['ns.fctx'], level: 2 } },
  { c: '5.NF.B.3', t: 'A fraction is a division', m: 'frac', frac: { types: ['ns.fdiv5'], level: 3 } },
  { c: '5.NF.B.4', t: 'Multiply fractions', m: 'frac', frac: { types: ['ns.fmul5'], level: 2 } },
  { c: '5.NF.B.5', t: 'Multiplication as scaling', m: 'frac', frac: { types: ['ns.fscale'], level: 3 } },
  { c: '5.NF.B.6', t: 'Fraction multiplication problems', m: 'frac', frac: { types: ['ns.fword6'], level: 3 } },
  { c: '5.NF.B.7', t: 'Divide unit fractions', m: 'frac', frac: { types: ['ns.fdiv7'], level: 3 } },
  { c: '5.MD.A.1', t: 'Convert units, decimals and fractions', m: 'meas', meas: { types: ['ns.conv5'], level: 3 } },
  { c: '5.MD.B.2', t: 'Line plots and operations', m: 'meas', meas: { types: ['ns.lplot5'], level: 3 } },
  { c: '5.MD.C.3', t: 'Volume and unit cubes', m: 'geom', geom: { types: ['vis.vcubes'], level: 2 } },
  { c: '5.MD.C.4', t: 'Measure volume by counting unit cubes', m: 'geom', geom: { types: ['vis.vcubes'], level: 3 } },
  { c: '5.MD.C.5', t: 'Volume of rectangular prisms', m: 'geom', geom: { types: ['vis.vlwh', 'vis.vcomp'], level: 3 } },
  { c: '5.G.A.1', t: 'Graph and name points in the first quadrant', m: 'geom', geom: { types: ['vis.cplane'], level: 2 } },
  { c: '5.G.A.2', t: 'Graph real-world problems', m: 'geom', geom: { types: ['vis.cpword'], level: 3 } },
  { c: '5.G.B.3', t: 'Hierarchy of two-dimensional figures', m: 'geom', geom: { types: ['vis.ghier'], level: 3 } }
];
const STD_BY_CODE = {}; STANDARDS.forEach(s => { STD_BY_CODE[s.c] = s; });
const stdGrade = c => c.split('.')[0];
const stdList = g => STANDARDS.filter(s => stdGrade(s.c) === String(g));
const stdMap = (ids, all) => { const o = {}; all.forEach(id => { o[id] = ids.includes(id); }); return o; };

/* Applies a preset to a settings object in place: sets the module and the module's settings, leaves everything else (paper, pages, seed) alone. */
function applyStandard(st, code) {
  const s = STD_BY_CODE[code];
  if (!s) return st;
  if (s.m === 'parts') {
    /* Bundled skills: the parts carry their own settings, so the module panels are left as they are. */
    st.module = s.view || 'combo';
    st.parts = normParts(JSON.parse(JSON.stringify(s.parts)));
    st.titles[st.module] = `${s.c} ${s.t}`;
    return st;
  }
  st.module = s.m;
  st.parts = null;
  applyModSettings(st, s);
  st.titles[s.m] = `${s.c} ${s.t}`;
  return st;
}

/* "All standards for this grade": one Combined Worksheet in sections. Each kind of skill is a section of its own, so the problems in a section
   are similar in size: Add and Subtract and Multiply and Divide (the hardest preset of the grade each), then one section per strand module
   and problem family, holding every preset type of that family with the average level and a size that follows the number of types.
   Returns the parts, or [] for a grade with no presets. */
function gradeStandardParts(g) {
  const groups = {}, hard = {};
  const take = (m, s) => {
    if (!isStrand(m)) { hard[m] = { m, [PART_KEY[m]]: s }; return; }
    for (const t of s.types) {
      const key = m + '|' + TYPE_HOME[t][1], a = groups[key] || (groups[key] = { m, fam: TYPE_HOME[t][1], types: [], levels: [] });
      if (!a.types.includes(t)) { a.types.push(t); a.levels.push(s.level); }
    }
  };
  for (const s of stdList(g)) {
    if (s.m === 'parts') s.parts.forEach(p => take(p.m, p[p.m])); else take(s.m, s[s.m]);
  }
  const nearest = (counts, want) => counts.reduce((a, c) => Math.abs(c - want) < Math.abs(a - want) ? c : a);
  const out = ['addsub', 'muldiv'].filter(m => hard[m]).map(m => Object.assign({ n: nearest(REG[m].counts, 10), label: '' }, JSON.parse(JSON.stringify(hard[m]))));
  for (const m of STRAND_IDS) for (const a of Object.values(groups).filter(x => x.m === m)) {
    out.push({ m, n: nearest(REG[m].counts, a.types.length), label: a.fam, [m]: { types: a.types, level: Math.round(a.levels.reduce((x, y) => x + y, 0) / a.levels.length) } });
  }
  return out;
}
function applyGradeStandards(st, g) {
  const parts = normParts(gradeStandardParts(g));
  if (!parts) return false;
  st.module = 'combo'; st.parts = parts;
  st.titles.combo = `${STD_GRADES[g]}: all standards`;
  st.std.c = '';
  return true;
}
