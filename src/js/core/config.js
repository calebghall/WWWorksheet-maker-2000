/* ===== World Wide Worksheet Maker 2000: pure logic (no DOM) ===== */
const PAPER = { letter: { w: 8.5, h: 11, name: 'Letter' }, a4: { w: 8.27, h: 11.69, name: 'A4' } };
const MODULES = {
  mix: { name: 'Mixed Practice', blurb: 'Problems from several topics mixed together and packed onto each page.' },
  combo: { name: 'Combined Worksheet', blurb: 'Sections from several modules on one sheet.' },
  area: { name: 'Area Squares', blurb: 'Count, measure and draw area on grids.' },
  addsub: { name: 'Addition and Subtraction', blurb: 'Mix digit sizes, with carrying and borrowing control.' },
  muldiv: { name: 'Multiplication and Division', blurb: 'Facts, multi-digit up to 3 by 3, and long division.' },
  fdp: { name: 'Fractions, Decimals and Percents', blurb: 'Simplify, compare, add, convert and take percents.' },
  ns: { name: 'Number Sense', blurb: 'Place value, rounding, ordering, patterns and number lines.' },
  tm: { name: 'Time and Money', blurb: 'Coins, change, clocks, elapsed time and conversions.' },
  vis: { name: 'Shapes, Measures and Data', blurb: 'Counting pictures, patterns, shapes, rulers, graphs and arrays.' },
};

const UNITS = {
  units: { name: 'Square units', len: 'units', area: 'square units', intro: 'Each square is 1 square unit.' },
  cm: { name: 'Square centimeters (cm²)', len: 'cm', area: 'cm²', intro: 'Each square is 1 cm by 1 cm, so it has an area of 1 cm².' },
  in: { name: 'Square inches (in²)', len: 'in', area: 'in²', intro: 'Each square is 1 inch by 1 inch, so it has an area of 1 in².' },
  ft: { name: 'Square feet (ft²)', len: 'ft', area: 'ft²', intro: 'Each square is 1 foot by 1 foot, so it has an area of 1 ft².' },
  m: { name: 'Square meters (m²)', len: 'm', area: 'm²', intro: 'Each square is 1 meter by 1 meter, so it has an area of 1 m².' }
};

const TYPE_IDS = ['count', 'mult', 'draw', 'cmp', 'lsh'];

const LEVELS = {
  1: { name: 'Easy', note: 'Areas up to 25 squares. Every figure sits on a grid.',
       rect: { min: 1, max: 5, area: 20 }, poly: { minN: 4, maxN: 12, cols: 5, rows: 4 }, mult: { min: 2, max: 5, grid: true },
       draw: { cols: 6, rows: 5, maxArea: 16 }, lsh: { min: 3, max: 5, labels: false }, cmp: { min: 1, max: 4 } },
  2: { name: 'Medium', note: 'Areas up to 64 squares. Every figure sits on a grid.',
       rect: { min: 2, max: 7, area: 36 }, poly: { minN: 8, maxN: 20, cols: 7, rows: 5 }, mult: { min: 3, max: 8, grid: true },
       draw: { cols: 8, rows: 6, maxArea: 30 }, lsh: { min: 4, max: 7, labels: false }, cmp: { min: 2, max: 6 } },
  3: { name: 'Hard', note: 'Areas up to 144 squares. Side-length and L-shape problems show measurements instead of grids.',
       rect: { min: 3, max: 10, area: 60 }, poly: { minN: 12, maxN: 28, cols: 8, rows: 6 }, mult: { min: 4, max: 12, grid: false },
       draw: { cols: 10, rows: 7, maxArea: 48 }, lsh: { min: 5, max: 10, labels: true }, cmp: { min: 2, max: 8 } }
};

