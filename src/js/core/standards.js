/* ---------- Worksheet recipes (presets), keyed by canonical id; frameworks map their standards to them through crosswalks ----------
   Each preset configures one module. Fields:
     id canonical recipe id (<strand>.<skill-slug>, never renamed; a replaced id stays as an alias)   t  short worksheet title
     m  module id                n  note when the generator only partly matches the standard
   Module settings: as/md = addsub/muldiv settings objects; fd/ns/tm = { types: [ids], level }; area = { types: [ids], level }.
   A recipe that bundles skills is { id, t, m: 'parts', view: 'combo', parts: [...] }: each part is { m, n, label?, <settings> }
   with the settings shaped as above, so a part is a single-module preset plus a problem count (see parts.js).
   Which standards use a recipe is in standards/<fw>.crosswalk.json (embedded as standards-xw.js); a standard with no crosswalk target is a Gap (see notes/coverage). */
const STD_GRADES = { K: 'Kindergarten', 1: 'Grade 1', 2: 'Grade 2', 3: 'Grade 3', 4: 'Grade 4', 5: 'Grade 5' };
const STD_GRADE_IDS = ['K', '1', '2', '3', '4', '5'];
const AS = (d1, d2, extra) => Object.assign({ add: true, sub: true, d1, d2, addends: 2, regroup: 'any', format: 'vertical', cap: 0, second: 'digits' }, extra || {});
const MD = o => Object.assign({ mul: true, div: true, mode: 'facts', tables: 10, focus: 0, rem: false, da: 2, db: 1, alt: false, da2: 2, db2: 2, na: 3, nb: 1, format: 'vertical' }, o);
const STANDARDS = [
  { id: 'num.count-fives-tens', t: 'Count by fives and tens', m: 'num', num: { types: ['ns.kseq'], level: 1 } },
  { id: 'num.count-on-from-any-number', t: 'Count on from any number', m: 'num', num: { types: ['ns.cfwd'], level: 1 } },
  { id: 'num.write-numbers-0-20-show-quantities', t: 'Write numbers 0 to 20 and show quantities', m: 'num', num: { types: ['vis.cnt'], level: 3 } },
  { id: 'oa.repeating-patterns-core', t: 'Repeating patterns and the core', m: 'oa', oa: { types: ['vis.pat', 'vis.patmake'], level: 3 } },
  { id: 'num.count-tell-how-many', t: 'Count to tell how many', m: 'num', num: { types: ['vis.cnt', 'vis.cntn'], level: 2 } },
  { id: 'num.count-up-20-in-lines-arrays-circles', t: 'Count up to 20 in lines, arrays and circles', m: 'num', num: { types: ['vis.cnt'], level: 2 } },
  { id: 'num.show-addition-subtraction-pictures', t: 'Show addition and subtraction with pictures', m: 'num', num: { types: ['vis.picop', 'vis.showop'], level: 2 } },
  { id: 'addsub.add-subtract-within-10', t: 'Add and subtract within 10', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 10 }) },
  { id: 'oa.decompose-numbers-10', t: 'Decompose numbers to 10', m: 'oa', oa: { types: ['ns.bond', 'ns.bondp'], level: 1 } },
  { id: 'oa.make-ten', t: 'Make ten', m: 'oa', oa: { types: ['ns.bond', 'ns.bondp'], level: 2 } },
  { id: 'addsub.addition-subtraction-fluency-within-10', t: 'Addition and subtraction fluency within 10', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 10 }) },
  { id: 'oa.compose-decompose-11-19', t: 'Compose and decompose 11 to 19', m: 'oa', oa: { types: ['ns.bond', 'ns.bondp'], level: 3 } },
  { id: 'meas.compare-length-height-weight', t: 'Compare length, height and weight', m: 'meas', meas: { types: ['vis.cmpm', 'vis.mattr'], level: 2 } },
  { id: 'meas.directly-compare-two-objects', t: 'Directly compare two objects', m: 'meas', meas: { types: ['vis.cmpm'], level: 1 } },
  { id: 'time.identify-coins-their-values', t: 'Identify coins and their values', m: 'time', time: { types: ['vis.coin'], level: 2 } },
  { id: 'meas.sort-compare-groups', t: 'Sort and compare groups', m: 'meas', meas: { types: ['vis.sort'], level: 2 } },
  { id: 'geom.position-words', t: 'Position words', m: 'geom', geom: { types: ['vis.pos', 'vis.pos2'], level: 2 } },
  { id: 'geom.name-shapes-in-any-orientation-size', t: 'Name shapes in any orientation or size', m: 'geom', geom: { types: ['vis.shname', 'vis.shall'], level: 1 } },
  { id: 'geom.flat-shapes-solids', t: 'Flat shapes and solids', m: 'geom', geom: { types: ['vis.solid'], level: 1 } },
  { id: 'geom.compare-flat-shapes-solids', t: 'Compare flat shapes and solids', m: 'geom', geom: { types: ['vis.solid', 'vis.shcmp'], level: 2 } },
  { id: 'geom.draw-shapes', t: 'Draw shapes', m: 'geom', geom: { types: ['vis.shdraw', 'vis.shbuild'], level: 1 } },
  { id: 'geom.shapes-inside-figure', t: 'Shapes inside a figure', m: 'geom', geom: { types: ['vis.comp', 'vis.split'], level: 1 } },
  { id: 'num.add-subtract-word-problems-within-20', t: 'Add and subtract word problems within 20', m: 'num', num: { types: ['ns.wadd'], level: 1 } },
  { id: 'addsub.add-three-numbers', t: 'Add three numbers', m: 'addsub', as: AS(1, 1, { sub: false, addends: 3, format: 'horizontal', cap: 20 }) },
  { id: 'oa.properties-addition', t: 'Properties of addition', m: 'oa', oa: { types: ['ns.prop', 'ns.substr'], level: 1 } },
  { id: 'oa.subtraction-unknown-addend', t: 'Subtraction as an unknown addend', m: 'oa', oa: { types: ['ns.rel'], level: 1 } },
  { id: 'addsub.add-subtract-within-20', t: 'Add and subtract within 20', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 20 }) },
  { id: 'addsub.addition-subtraction-fluency-within-20', t: 'Addition and subtraction fluency within 20', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 20 }) },
  { id: 'oa.meaning-equal-sign', t: 'Meaning of the equal sign', m: 'oa', oa: { types: ['ns.equal'], level: 2 } },
  { id: 'oa.unknown-number-in-equation-within-20', t: 'Unknown number in an equation within 20', m: 'oa', oa: { types: ['ns.eqn'], level: 1 } },
  { id: 'num.count-on-back', t: 'Count on and back', m: 'num', num: { types: ['ns.cfwd', 'ns.numrw'], level: 3 } },
  { id: 'num.counting-patterns', t: 'Counting patterns', m: 'num', num: { types: ['ns.skip'], level: 1 } },
  { id: 'num.tens-ones', t: 'Tens and ones', m: 'num', num: { types: ['ns.tens'], level: 3 } },
  { id: 'num.compare-two-groups', t: 'Compare two groups of objects', m: 'num', num: { types: ['vis.cmpg'], level: 2 } },
  { id: 'num.compare-numerals-words', t: 'Compare numerals to 10 in words', m: 'num', num: { types: ['ns.cmpw'], level: 2 } },
  { id: 'num.read-write-numbers-1000', t: 'Read and write numbers to 1000', m: 'num', num: { types: ['ns.numrw3'], level: 2 } },
  { id: 'num.compare-numbers', t: 'Compare numbers', m: 'num', num: { types: ['ns.cmp2'], level: 2 } },
  { id: 'addsub.add-two-digit-one-digit-number', t: 'Add a two-digit and a one-digit number', m: 'addsub', as: AS(2, 1, { sub: false, format: 'horizontal', cap: 100, second: 'mix' }) },
  { id: 'num.10-more-10-less', t: '10 more and 10 less', m: 'num', num: { types: ['ns.more', 'ns.moreexp'], level: 1 } },
  { id: 'oa.subtract-multiples-10', t: 'Subtract multiples of 10', m: 'oa', oa: { types: ['ns.sub10'], level: 1 } },
  { id: 'meas.order-three-objects-length', t: 'Order three objects by length', m: 'meas', meas: { types: ['vis.ord3'], level: 3 } },
  { id: 'meas.measure-non-standard-units', t: 'Measure with non-standard units', m: 'meas', meas: { types: ['vis.munit'], level: 1 } },
  { id: 'time.tell-time-hour-half-hour', t: 'Tell time to the hour and half hour', m: 'time', time: { types: ['tm.clock', 'tm.dclock'], level: 1 } },
  { id: 'time.count-coins-under-one-dollar', t: 'Count coins under one dollar', m: 'time', time: { types: ['tm.like', 'tm.cpic', 'tm.coins'], level: 1 } },
  { id: 'meas.tally-charts-pictographs-bar-graphs', t: 'Tally charts, pictographs and bar graphs', m: 'meas', meas: { types: ['vis.tally', 'vis.pict', 'vis.bar'], level: 2 } },
  { id: 'geom.defining-attributes-shapes', t: 'Defining attributes of shapes', m: 'geom', geom: { types: ['vis.shall', 'vis.shname', 'vis.shdraw'], level: 2 } },
  { id: 'geom.shapes-that-make-figure', t: 'Shapes that make a figure', m: 'geom', geom: { types: ['vis.comp', 'vis.split'], level: 2 } },
  { id: 'frac.halves-fourths', t: 'Halves and fourths', m: 'frac', frac: { types: ['vis.part', 'vis.partw'], level: 1 } },
  { id: 'num.add-subtract-word-problems-within-100', t: 'Add and subtract word problems within 100', m: 'num', num: { types: ['ns.wadd'], level: 2 } },
  { id: 'addsub.fluently-add-subtract-within-30', t: 'Fluently add and subtract within 30', m: 'addsub', as: AS(1, 1, { format: 'horizontal', cap: 30 }) },
  { id: 'num.odd-even', t: 'Odd and even', m: 'num', num: { types: ['ns.par20'], level: 2 } },
  { id: 'num.arrays-repeated-addition', t: 'Arrays and repeated addition', m: 'num', num: { types: ['vis.array'], level: 2 } },
  { id: 'oa.patterns-in-hundreds-addition-charts', t: 'Patterns in hundreds and addition charts', m: 'oa', oa: { types: ['vis.addchart', 'vis.chartcircle', 'vis.chartwhy', 'ns.addcmp', 'ns.claim', 'ns.parsum'], level: 2 } },
  { id: 'num.place-value-hundreds', t: 'Place value to hundreds', m: 'num', num: { types: ['ns.place'], level: 1 } },
  { id: 'num.counting-patterns-2', t: 'Counting patterns', m: 'num', num: { types: ['ns.skip', 'ns.cseq'], level: 1 } },
  { id: 'num.compare-three-digit-numbers', t: 'Compare three-digit numbers', m: 'num', num: { types: ['ns.compare'], level: 1 } },
  { id: 'addsub.add-subtract-within-100', t: 'Add and subtract within 100', m: 'addsub', as: AS(2, 2, { cap: 100 }) },
  { id: 'addsub.add-two-digit-numbers', t: 'Add two-digit numbers', m: 'addsub', as: AS(2, 2, { sub: false, addends: 4 }) },
  { id: 'addsub.add-subtract-within-1000', t: 'Add and subtract within 1000', m: 'addsub', as: AS(3, 3, { cap: 1000 }) },
  { id: 'num.mentally-add-subtract-10-100', t: 'Mentally add or subtract 10 or 100', m: 'num', num: { types: ['ns.more'], level: 2 } },
  { id: 'meas.measure-length-ruler', t: 'Measure length with a ruler', m: 'meas', meas: { types: ['vis.ruler', 'vis.mtool'], level: 2 } },
  { id: 'meas.measure-two-different-units', t: 'Measure with two different units', m: 'meas', meas: { types: ['vis.mtwo', 'vis.mrule2'], level: 2 } },
  { id: 'meas.estimate-lengths', t: 'Estimate lengths', m: 'meas', meas: { types: ['vis.mest'], level: 2 } },
  { id: 'meas.how-much-longer', t: 'How much longer', m: 'meas', meas: { types: ['vis.mdiff'], level: 2 } },
  { id: 'num.add-subtract-lengths-within-100', t: 'Add and subtract lengths within 100', m: 'num', num: { types: ['ns.wlen'], level: 2 } },
  { id: 'num.number-line-sums-differences', t: 'Number line sums and differences', m: 'num', num: { types: ['vis.nline'], level: 3 } },
  { id: 'time.tell-time-five-minutes', t: 'Tell time to five minutes', m: 'time', time: { types: ['tm.clock', 'tm.dclock', 'tm.ampm'], level: 2 } },
  { id: 'time.coins-under-one-dollar', t: 'Coins under one dollar', m: 'time', time: { types: ['tm.cpic', 'tm.madd', 'tm.change', 'tm.cstory'], level: 2 } },
  { id: 'meas.line-plots', t: 'Line plots', m: 'meas', meas: { types: ['vis.lplot'], level: 3 } },
  { id: 'meas.draw-pictographs-bar-graphs', t: 'Draw pictographs and bar graphs', m: 'meas', meas: { types: ['vis.pict4', 'vis.bar4'], level: 3 } },
  { id: 'geom.name-draw-polygons', t: 'Name and draw polygons', m: 'geom', geom: { types: ['vis.shname', 'vis.shall', 'vis.shdraw'], level: 3 } },
  { id: 'geom.count-unit-squares-in-rectangle', t: 'Count unit squares in a rectangle', m: 'geom', geom: { types: ['vis.acount'], level: 1 } },
  { id: 'frac.equal-shares', t: 'Equal shares', m: 'frac', frac: { types: ['vis.part', 'vis.pdraw'], level: 3 } },
  { id: 'num.multiply-divide-word-problems', t: 'Multiply and divide word problems', m: 'num', num: { types: ['ns.wmul'], level: 2 } },
  { id: 'oa.unknown-number-in-multiplication', t: 'Unknown number in a multiplication or division equation', m: 'oa', oa: { types: ['ns.eqn'], level: 3 } },
  { id: 'oa.properties-multiplication', t: 'Properties of multiplication', m: 'oa', oa: { types: ['ns.prop'], level: 3 } },
  { id: 'oa.division-unknown-factor', t: 'Division as an unknown factor', m: 'oa', oa: { types: ['ns.rel'], level: 2 } },
  { id: 'muldiv.multiply-divide-within-100', t: 'Multiply and divide within 100', m: 'muldiv', md: MD({ tables: 10 }) },
  { id: 'num.two-step-word-problems', t: 'Two-step word problems', m: 'num', num: { types: ['ns.wmul', 'ns.west'], level: 3 } },
  { id: 'num.round-nearest-10-100', t: 'Round to the nearest 10 or 100', m: 'num', num: { types: ['ns.rnd3'], level: 3 } },
  { id: 'addsub.add-subtract-within-1000-2', t: 'Add and subtract within 1000', m: 'addsub', as: AS(3, 3, { cap: 1000 }) },
  { id: 'oa.multiply-multiples-10', t: 'Multiply by multiples of 10', m: 'oa', oa: { types: ['ns.mul10'], level: 1 } },
  { id: 'num.read-write-numbers', t: 'Read and write numbers', m: 'num', num: { types: ['ns.place'], level: 2 } },
  { id: 'frac.equivalent-fractions-comparing', t: 'Equivalent fractions and comparing fractions', m: 'frac', frac: { types: ['fdp.equiv', 'fdp.cmp'], level: 1 } },
  { id: 'time.time-minute-elapsed-time', t: 'Time to the minute and elapsed time', m: 'time', time: { types: ['tm.clock', 'tm.elapsed'], level: 3 } },
  { id: 'geom.measure-area-counting-unit-squares', t: 'Measure area by counting unit squares', m: 'geom', geom: { types: ['vis.acount'], level: 2 } },
  { id: 'geom.area-rectangles', t: 'Area of rectangles', m: 'geom', geom: { types: ['vis.amult', 'vis.alsh'], level: 2 } },
  { id: 'geom.perimeter', t: 'Perimeter', m: 'geom', geom: { types: ['ns.perim'], level: 3 } },
  { id: 'num.interpret-factors-products', t: 'Interpret factors and products', m: 'num', num: { types: ['vis.mfac'], level: 2 } },
  { id: 'num.interpret-dividend-divisor-quotient', t: 'Interpret dividend, divisor and quotient', m: 'num', num: { types: ['vis.dint'], level: 2 } },
  { id: 'oa.patterns-in-multiplication-chart', t: 'Patterns in the multiplication chart', m: 'oa', oa: { types: ['vis.mchart'], level: 3 } },
  { id: 'frac.fractions-parts-whole', t: 'Fractions as parts of a whole', m: 'frac', frac: { types: ['vis.fmodel'], level: 2 } },
  { id: 'frac.fractions-on-number-line', t: 'Fractions on a number line', m: 'frac', frac: { types: ['vis.fline'], level: 2 } },
  { id: 'meas.mass-liquid-volume', t: 'Mass and liquid volume', m: 'meas', meas: { types: ['vis.mvol'], level: 2 } },
  { id: 'meas.scaled-pictographs-bar-graphs', t: 'Scaled pictographs and bar graphs', m: 'meas', meas: { types: ['vis.pictg', 'vis.barg'], level: 3 } },
  { id: 'meas.measure-halves-fourths-line-plots', t: 'Measure to halves and fourths; line plots', m: 'meas', meas: { types: ['vis.rulq', 'vis.lplotq'], level: 2 } },
  { id: 'geom.area-concepts', t: 'Area concepts', m: 'geom', geom: { types: ['vis.acon'], level: 2 } },
  { id: 'geom.quadrilateral-categories', t: 'Quadrilateral categories', m: 'geom', geom: { types: ['vis.gcat'], level: 2 } },
  { id: 'frac.equal-areas-unit-fractions', t: 'Equal areas and unit fractions', m: 'frac', frac: { types: ['vis.gpart'], level: 2 } },
  { id: 'geom.it-polygon', t: 'Is it a polygon?', m: 'geom', geom: { types: ['vis.gpoly'], level: 2 } },
  { id: 'oa.multiplicative-comparison-statements', t: 'Multiplicative comparison statements', m: 'oa', oa: { types: ['ns.mcomp'], level: 2 } },
  { id: 'num.multiplicative-comparison-word', t: 'Multiplicative comparison word problems', m: 'num', num: { types: ['ns.wcmp'], level: 2 } },
  { id: 'num.multi-step-word-problems', t: 'Multi-step word problems', m: 'num', num: { types: ['ns.wstep'], level: 2 } },
  { id: 'num.factors-multiples-prime-composite', t: 'Factors, multiples, prime and composite', m: 'num', num: { types: ['ns.fact', 'ns.facmodel'], level: 2 } },
  { id: 'oa.number-shape-patterns', t: 'Number and shape patterns', m: 'oa', oa: { types: ['ns.rulepat'], level: 2 } },
  { id: 'num.place-value', t: 'Place value', m: 'num', num: { types: ['ns.place', 'ns.tenx'], level: 2 } },
  { id: 'num.read-write-multi-digit-numbers', t: 'Read and write multi-digit numbers', m: 'num', num: { types: ['ns.placew'], level: 3 } },
  { id: 'num.round-multi-digit-numbers', t: 'Round multi-digit numbers', m: 'num', num: { types: ['ns.roundw'], level: 3 } },
  { id: 'addsub.add-subtract-within-1-000-000', t: 'Add and subtract within 1,000,000', m: 'addsub', as: AS(6, 6, { cap: 1000000 }) },
  { id: 'multi.multiply-four-digits-one-digit-two', t: 'Multiply four digits by one digit and two digits by two digits', m: 'parts', view: 'combo', parts: [
    { m: 'muldiv', n: 10, label: 'Four digits by one digit', md: MD({ div: false, mode: 'digits', da: 4, db: 1 }) },
    { m: 'muldiv', n: 10, label: 'Two digits by two digits', md: MD({ div: false, mode: 'digits', da: 2, db: 2 }) }] },
  { id: 'muldiv.divide-remainders', t: 'Divide with remainders', m: 'muldiv', md: MD({ mul: false, mode: 'digits', na: 4, nb: 1, rem: true }) },
  { id: 'frac.equivalent-fractions', t: 'Equivalent fractions', m: 'frac', frac: { types: ['fdp.equiv'], level: 2 } },
  { id: 'frac.compare-fractions', t: 'Compare fractions', m: 'frac', frac: { types: ['fdp.cmp'], level: 3 } },
  { id: 'frac.add-subtract-fractions-like', t: 'Add and subtract fractions with like denominators', m: 'frac', frac: { types: ['fdp.fadd'], level: 1 } },
  { id: 'frac.multiply-whole-number-fraction', t: 'Multiply a whole number by a fraction', m: 'frac', frac: { types: ['fdp.fmul'], level: 1 } },
  { id: 'frac.tenths-hundredths', t: 'Tenths and hundredths', m: 'frac', frac: { types: ['ns.f100'], level: 3 } },
  { id: 'frac.fractions-decimals', t: 'Fractions and decimals', m: 'frac', frac: { types: ['ns.fdec'], level: 3 } },
  { id: 'num.compare-decimals', t: 'Compare decimals', m: 'num', num: { types: ['ns.compare'], level: 3 } },
  { id: 'meas.convert-measurement-units', t: 'Convert measurement units', m: 'meas', meas: { types: ['ns.convm'], level: 2 } },
  { id: 'num.measurement-word-problems', t: 'Measurement word problems', m: 'num', num: { types: ['ns.mword'], level: 3 } },
  { id: 'geom.area-perimeter-rectangles', t: 'Area and perimeter of rectangles', m: 'geom', geom: { types: ['ns.rectf'], level: 2 } },
  { id: 'meas.line-plots-fractional-units', t: 'Line plots with fractional units', m: 'meas', meas: { types: ['ns.lineplot'], level: 2 } },
  { id: 'geom.angles-parts-circle', t: 'Angles and parts of a circle', m: 'geom', geom: { types: ['vis.angc', 'vis.gfig'], level: 2 } },
  { id: 'geom.measure-draw-angles-protractor', t: 'Measure and draw angles with a protractor', m: 'geom', geom: { types: ['vis.protr'], level: 3 } },
  { id: 'geom.angle-measure-additive', t: 'Angle measure is additive', m: 'geom', geom: { types: ['vis.angadd'], level: 2 } },
  { id: 'geom.points-lines-segments-rays-angles', t: 'Points, lines, segments, rays and angles', m: 'geom', geom: { types: ['vis.gfig'], level: 3 } },
  { id: 'geom.classify-figures-parallel-sides-angles', t: 'Classify figures by parallel sides and angles', m: 'geom', geom: { types: ['vis.gclass'], level: 2 } },
  { id: 'geom.lines-symmetry', t: 'Lines of symmetry', m: 'geom', geom: { types: ['vis.gsym'], level: 2 } },
  { id: 'frac.ten-times-one-tenth', t: 'Ten times and one tenth', m: 'frac', frac: { types: ['ns.tenxd'], level: 2 } },
  { id: 'frac.powers-10', t: 'Powers of 10', m: 'frac', frac: { types: ['ns.pow10'], level: 2 } },
  { id: 'multi.read-write-compare-decimals', t: 'Read, write and compare decimals', m: 'parts', view: 'combo', parts: [
    { m: 'frac', n: 10, label: 'Read and write decimals', frac: { types: ['ns.decrw'], level: 3 } },
    { m: 'num', n: 10, label: 'Compare decimals', num: { types: ['ns.compare'], level: 3 } }] },
  { id: 'frac.round-decimals', t: 'Round decimals', m: 'frac', frac: { types: ['ns.rnddec'], level: 3 } },
  { id: 'muldiv.multiply-up-three-digits-four-digits', t: 'Multiply up to three digits by four digits', m: 'muldiv', md: MD({ div: false, mode: 'digits', da: 4, db: 3 }) },
  { id: 'muldiv.divide-four-digit-numbers-two-digit', t: 'Divide four-digit numbers by two-digit numbers', m: 'muldiv', md: MD({ mul: false, mode: 'digits', na: 4, nb: 2, rem: true }) },
  { id: 'multi.add-subtract-multiply-divide-decimals', t: 'Add, subtract, multiply and divide decimals', m: 'parts', view: 'combo', parts: [
    { m: 'frac', n: 5, label: 'Add, subtract and multiply decimals', frac: { types: ['fdp.decadd', 'fdp.decmul'], level: 3 } },
    { m: 'frac', n: 5, label: 'Divide by a decimal and check by estimating', frac: { types: ['ns.decrsn'], level: 3 } }] },
  { id: 'oa.evaluate-expressions-grouping-symbols', t: 'Evaluate expressions with grouping symbols', m: 'oa', oa: { types: ['ns.exeval'], level: 2 } },
  { id: 'oa.write-interpret-expressions', t: 'Write and interpret expressions', m: 'oa', oa: { types: ['ns.exwrite'], level: 2 } },
  { id: 'oa.two-patterns-from-two-rules', t: 'Two patterns from two rules', m: 'oa', oa: { types: ['ns.rule2', 'ns.rule2g'], level: 2 } },
  { id: 'frac.add-subtract-fractions-mixed-numbers', t: 'Add and subtract fractions and mixed numbers', m: 'frac', frac: { types: ['ns.fadd5'], level: 3 } },
  { id: 'frac.fraction-addition-subtraction-problems', t: 'Fraction addition and subtraction problems', m: 'frac', frac: { types: ['ns.fctx'], level: 2 } },
  { id: 'frac.fraction-division', t: 'A fraction is a division', m: 'frac', frac: { types: ['ns.fdiv5'], level: 3 } },
  { id: 'frac.multiply-fractions', t: 'Multiply fractions', m: 'frac', frac: { types: ['ns.fmul5'], level: 2 } },
  { id: 'frac.multiplication-scaling', t: 'Multiplication as scaling', m: 'frac', frac: { types: ['ns.fscale'], level: 3 } },
  { id: 'frac.fraction-multiplication-problems', t: 'Fraction multiplication problems', m: 'frac', frac: { types: ['ns.fword6'], level: 3 } },
  { id: 'frac.divide-unit-fractions', t: 'Divide unit fractions', m: 'frac', frac: { types: ['ns.fdiv7'], level: 3 } },
  { id: 'meas.convert-units-decimals-fractions', t: 'Convert units, decimals and fractions', m: 'meas', meas: { types: ['ns.conv5'], level: 3 } },
  { id: 'meas.line-plots-operations', t: 'Line plots and operations', m: 'meas', meas: { types: ['ns.lplot5'], level: 3 } },
  { id: 'geom.volume-unit-cubes', t: 'Volume and unit cubes', m: 'geom', geom: { types: ['vis.vcubes'], level: 2 } },
  { id: 'geom.measure-volume-counting-unit-cubes', t: 'Measure volume by counting unit cubes', m: 'geom', geom: { types: ['vis.vcubes'], level: 3 } },
  { id: 'geom.volume-rectangular-prisms', t: 'Volume of rectangular prisms', m: 'geom', geom: { types: ['vis.vlwh', 'vis.vcomp'], level: 3 } },
  { id: 'geom.graph-name-points-in-first-quadrant', t: 'Graph and name points in the first quadrant', m: 'geom', geom: { types: ['vis.cplane'], level: 2 } },
  { id: 'geom.graph-real-world-problems', t: 'Graph real-world problems', m: 'geom', geom: { types: ['vis.cpword'], level: 3 } },
  { id: 'geom.hierarchy-two-dimensional-figures', t: 'Hierarchy of two-dimensional figures', m: 'geom', geom: { types: ['vis.ghier'], level: 3 } }
];
const STD_BY_ID = {}; STANDARDS.forEach(s => { STD_BY_ID[s.id] = s; });
/* Framework data is in STD_FW (framework.js); fw defaults to the default framework. A framework that is not loaded yet has no rows. */
const stdGrade = (code, fw) => ((STD_FW[fw || FRAMEWORK.id] || {}).grade || {})[code];
const stdRow = (code, fw) => ((STD_FW[fw || FRAMEWORK.id] || {}).xw || {})[code] || null;
const STD_RANK = { supported: 0, partial: 1, gap: 2 };
/* The preset a standard builds, or null for a Gap. One target is that preset; several targets build a Combined worksheet with one part
   per target (a target that is itself a parts preset is flattened). */
function stdPreset(code, fw) {
  const x = stdRow(code, fw), ps = x && x.to ? x.to.map(i => STD_BY_ID[i]).filter(Boolean) : [];
  if (!ps.length) return null;
  if (ps.length === 1) return ps[0];
  const parts = [];
  for (const p of ps) {
    if (p.m === 'parts') p.parts.forEach(q => parts.push(JSON.parse(JSON.stringify(q))));
    else { const k = PART_KEY[p.m]; parts.push({ m: p.m, n: REG[p.m].n0, label: p.t, [k]: JSON.parse(JSON.stringify(p[k])) }); }
  }
  return { id: code, t: x.t || ps.map(p => p.t).join(' and '), m: 'parts', view: 'combo', parts };
}
/* { preset, status, note } for a standard: the effective status is the worst of the declared status and the statuses of the targets. */
function stdInfo(code, fw) {
  const x = stdRow(code, fw);
  if (!x) return { preset: null, status: 'gap', note: '' };
  let status = x.status, note = x.note || x.need || '';
  for (const i of x.to || []) {
    const p = STD_BY_ID[i];
    if (p && p.n && STD_RANK[status] < STD_RANK.partial) status = 'partial';
    if (p && p.n && !note) note = p.n;
  }
  return { preset: stdPreset(code, fw), status, note };
}
/* The presets of one grade of a framework, in preset-file order (so the all-standards worksheet keeps its section order); presets built from several targets come last. */
const stdPos = p => { const i = STANDARDS.indexOf(p); return i < 0 ? STANDARDS.length : i; };
const stdList = (g, fw) => ((STD_FW[fw || FRAMEWORK.id] || {}).list || []).filter(r => r[3] === String(g)).map(r => stdPreset(r[0], fw)).filter(Boolean).sort((a, b) => stdPos(a) - stdPos(b));
const stdMap = (ids, all) => { const o = {}; all.forEach(id => { o[id] = ids.includes(id); }); return o; };

/* Applies a preset to a settings object in place: sets the module and the module's settings, leaves everything else (paper, pages, seed) alone. */
function applyStandard(st, code) {
  const s = stdPreset(code, st.std.f);
  if (!s) return st;
  if (s.m === 'parts') {
    /* Bundled skills: the parts carry their own settings, so the module panels are left as they are. */
    st.module = s.view || 'combo';
    st.parts = normParts(JSON.parse(JSON.stringify(s.parts)));
    st.titles[st.module] = `${code} ${s.t}`;
    return st;
  }
  st.module = s.m;
  st.parts = null;
  applyModSettings(st, s);
  st.titles[s.m] = `${code} ${s.t}`;
  return st;
}

/* Sections for a set of standards (one framework): a section for every standard, in preset-file order. Each keeps the standard's own module,
   settings and level, is labeled with its code and has the smallest problem count its module allows. Standards that share a preset share one
   section (all their codes in the label); a standard that bundles skills gives one section per skill. A standard without a preset is skipped.
   "All standards for this grade" is this function over every standard of the grade. */
function standardParts(codes, fw) {
  const f = fw || FRAMEWORK.id, by = new Map();
  for (const c of codes) {
    const pr = stdPreset(c, f); if (!pr) continue;
    if (!by.has(pr.id)) by.set(pr.id, { pr, codes: [] });
    by.get(pr.id).codes.push(c);
  }
  const out = [];
  for (const { pr, codes: cs } of [...by.values()].sort((a, b) => stdPos(a.pr) - stdPos(b.pr))) {
    const parts = pr.m === 'parts' ? pr.parts : [{ m: pr.m, label: pr.t, [PART_KEY[pr.m]]: pr[PART_KEY[pr.m]] }];
    for (const p of parts) {
      const q = JSON.parse(JSON.stringify(p));
      q.n = REG[q.m].counts[0];
      q.label = (cs.join(', ') + ' ' + (q.label || pr.t)).slice(0, 60);
      out.push(q);
    }
  }
  return out;
}
const gradeStandardParts = (g, fw) => standardParts(((STD_FW[fw || FRAMEWORK.id] || {}).list || []).filter(r => r[3] === String(g)).map(r => r[0]), fw);
/* A Combined Worksheet from chosen standards. Returns false when none has a preset or the sections would exceed the part limit. */
function applyStandardSet(st, codes) {
  const raw = standardParts(codes, st.std.f);
  if (!raw.length || raw.length > PART_MAX) return false;
  const parts = normParts(raw);
  if (!parts) return false;
  st.module = 'combo'; st.parts = parts;
  st.titles.combo = codes.length === 1 ? codes[0] : `${codes.length} standards`;
  st.std.c = '';
  return true;
}
function applyGradeStandards(st, g) {
  const parts = normParts(gradeStandardParts(g, st.std.f));
  if (!parts) return false;
  st.module = 'combo'; st.parts = parts;
  st.titles.combo = `${STD_GRADES[g]}: all standards`;
  st.std.c = '';
  return true;
}
