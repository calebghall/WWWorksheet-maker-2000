# How the problem generators work

One or two lines per generator. For where code lives and how to add one, see `CLAUDE.md`.

## How every generator works

- A sheet is a pure function of its settings and its set code: the same code gives the same worksheet and answer key.
- Each generator draws random values within the chosen level (1 Easy, 2 Medium, 3 Hard) and returns a problem with a `sig`, a string naming everything that is visible in the problem. The sheet builder throws away any problem whose `sig` it already holds, so repeats are filtered.
- A `sig` must change when what is printed changes, and must not change when it does not (for example, shuffled answer options or an unseen rotation). `tests/logic-dups.js` checks this for every type at every level.
- The filter makes up to 60 attempts per problem in Shapes, Measures and Data and 20 attempts per problem elsewhere. When a type has fewer different problems than the sheet needs, the remaining problems repeat. Types with a small pool are marked **Small pool** below, with the number of different problems at levels 1 / 2 / 3. With the default settings, sheets of up to 36 problems never repeat.
- To get more variety from a small-pool type, turn on more types in the same module, or use Mixed Practice.

## Addition and Subtraction (`addsub`, `arith.js`)

- Picks operands with the chosen digit counts and number of addends, with regrouping always, never or either; vertical or horizontal layout.
- Repeats are filtered on the operands and operation.

## Multiplication and Division (`muldiv`, `arith.js`)

- Facts mode draws factors from the chosen tables (or one table); multi-digit mode uses the chosen digit counts. Division facts pick a divisor and quotient, so the dividend comes out even; remainders appear only when allowed.
- Repeats are filtered on the operands and operation.

## Area (module `area`, `area.js`)

- **Count the squares** (`count`): Find the area of a shape by counting unit squares.
- **Side lengths** (`mult`): Multiply length by width to find the area.
- **Draw a rectangle** (`draw`): Draw a rectangle that has a given area.
- **Compare two shapes** (`cmp`): Decide which shape covers more squares.
- **L-shaped figures** (`lsh`): Split an L-shape into two rectangles.

## Fractions, Decimals and Percents (`fdp`, `fdp.js`)

- **Simplify fractions** (`simp`): Write a fraction in lowest terms. **Small pool:** 22 / 108 / 315.
- **Equivalent fractions** (`equiv`): Fill in the missing numerator or denominator.
- **Add and subtract fractions** (`fadd`): Like and unlike denominators.
- **Multiply and divide fractions** (`fmul`): Fraction of a number, products and quotients.
- **Add and subtract decimals** (`decadd`): Stacked with the decimal points lined up.
- **Multiply and divide decimals** (`decmul`): Whole-number factors, decimal factors, powers of ten.
- **Convert fractions, decimals, percents** (`conv`): Six conversions between the three forms. **Small pool:** 44 / 114 / 611.
- **Percent of a number** (`pct`): Such as 25% of 80.

## Number Sense (`ns`, `ns.js`)

Types are registered in the `ns-*.js` family files (`defTypes`, `core/types.js`); the list below is generated from the registry.

### Place value, comparing and rounding (`ns-place.js`)

- **Place value** (`place`): Underlined digit, digit in a place, expanded and standard form.
- **Compare numbers** (`compare`): Write <, > or = between two numbers.
- **Compare two-digit numbers** (`cmp2`): Write <, > or = between numbers 10 to 99.
- **Order numbers** (`order`): Least to greatest or greatest to least.
- **Rounding** (`round`): Whole numbers and decimals.
- **Round to 10 or 100** (`rnd3`): Plain problems and number lines.
- **Estimation** (`est`): Round each number, then add, subtract or multiply.
- **Read and write numbers** (`numrw`): Number words, tens and ones, and base-ten blocks, to 120.
- **Read and write numbers to 1000** (`numrw3`): Standard form, word form and expanded form, 100 to 1,000.
- **Compare numerals to 10 in words** (`cmpw`): Is one numeral greater than, less than or equal to another? Numerals 0 to 10.
- **Mentally add or subtract 10 or 100** (`more`): 10 more or less, 100 more or less.
- **10 more or less, explained** (`moreexp`): Write the number and say how you know.
- **Tens and ones** (`tens`): Write a number as tens and ones.
- **Tenths and hundredths** (`f100`): Rename tenths as hundredths and add. **Small pool:** 9 / 296 / 305.

### Counting and number lines (`ns-counting.js`)

- **Skip counting and patterns** (`skip`): Fill in the missing numbers.
- **Count on or back** (`cfwd`): Count from any number, back from 20, or by 1, 2, 5 to 120.
- **Count to 100** (`kseq`): Count by ones and tens, or back from 10.
- **Count to 1000** (`cseq`): Count by 5s, 10s and 100s.
- **Even and odd** (`parity`): Circle even or odd, or pick out numbers in a list.
- **Odd and even to 20** (`par20`): Pair the objects, or write an even number as two equal addends.
- **Number lines** (`line`): Read the number the arrow shows. **Small pool:** 9 / 36 / 36.

### Equations, properties and facts (`ns-equations.js`)

- **Number bonds** (`bond`): Decompose to 10, make ten, teen numbers as ten and ones. **Small pool:** 88 / 18 / 18.
- **Number bonds with pictures** (`bondp`): Two-color counters and ten-frames.
- **Unknown in an equation** (`eqn`): Find the missing number in any position.
- **Equal sign** (`equal`): True or false equations and balancing both sides.
- **Properties of operations** (`prop`): Commutative, associative and distributive.
- **Compare sums without adding** (`addcmp`): Same or greater: swapped addends (L1), regrouped three-addend sums (L2), two-digit numbers (L3).
- **Test a claim about sums** (`claim`): Yes or no, then show a test: swapping addends, adding 1 or 2, a chart row, odd and even sums (L2 up).
- **Odd and even after adding** (`parsum`): Odd or even after adding 1 or 2 (L1), with the number unknown (L2), or for a sum of two-digit numbers (L3).
- **Related facts** (`rel`): Subtraction as unknown addend, division as unknown factor.
- **Subtraction strategies** (`substr`): Think addition, make a ten, count back.
- **Subtract tens** (`sub10`): Subtract a multiple of 10 from a two-digit number.
- **Multiply by multiples of 10** (`mul10`): One digit times 10 to 90.
- **Multiplicative comparison** (`mcomp`): "__ times as many as" statements.

### Factors and multiples (`ns-factors.js`)

- **Factors and multiples** (`fact`): Factor pairs, multiples, prime or composite.

### Perimeter (`ns-measure.js`)

- **Perimeter** (`perim`): From side lengths, an unknown side, or same perimeter and same area.

### Word problems (`ns-words.js`)

- **Add and subtract word problems** (`wadd`): Add to, take from, put together, compare; unknown in any position.
- **Length word problems** (`wlen`): Add and subtract lengths within 100.
- **Multiply and divide word problems** (`wmul`): Equal groups, arrays, comparison, multi-step.
- **Comparison word problems** (`wcmp`): "Times as many" stories.
- **Multi-step word problems** (`wstep`): Remainders and more than one operation.
- **Estimate and solve** (`west`): Two-step stories: round to the nearest ten, then solve.

## Time and Money (`tm`, `tm.js`)

- **Count the money** (`coins`): Add up coins and bills.
- **Add and subtract money** (`madd`): Cents or dollars and cents.
- **Making change** (`change`): Cost and amount paid, find the change. **Small pool:** 19 / 272 / 2622.
- **Read the clock** (`clock`): Analog clock face, write the time. Off by default because clocks are tall and reduce problems per page. **Small pool:** 24 / 144 / 717.
- **Elapsed time** (`elapsed`): Start and end time, find the time that passes.
- **Time conversions** (`conv`): Seconds, minutes, hours, days and weeks. **Small pool:** 24 / 117 / 997.

## Shapes, Measures and Data (`vis`, `vis.js`)

Types are registered in the `vis-*.js` family files (`defTypes`, `core/types.js`); the list below is generated from the registry.

### Counting and arrays (`vis-counting.js`)

- **Counting pictures** (`cnt`): Count objects, draw a number of objects, write number words.
- **Count and label** (`cntn`): Write a number under each object as you count.
- **Picture equations** (`picop`): Addition and subtraction shown with objects. **Small pool:** 20 / 90 / 90.
- **Draw to show** (`showop`): Draw and write an addition or subtraction.
- **Arrays** (`array`): Rows and columns as repeated addition. **Small pool:** 6 / 16 / 16.
- **Factors and products** (`mfac`): Groups of objects as multiplication; what each number tells.
- **Dividend, divisor, quotient** (`dint`): Name the parts of a division; sharing and grouping.

### Patterns and charts (`vis-patterns.js`)

- **Repeating patterns** (`pat`): What comes next, and how long is the core. **Small pool:** 36 / 144 / 168.
- **Make a pattern** (`patmake`): Draw your own AB, AAB, ABB or ABC pattern.
- **Number charts** (`chart`): Hundreds chart and addition chart patterns.
- **Why the chart pattern works** (`chartwhy`): Two shaded cells in an addition chart. Fill in how much more the second number is (1 to 3, in a row or a column), or, for two mirrored cells, a free response on three lines (at most one such problem per worksheet, shared with `mchart`). In the 2.OA.D.5 preset.
- **Multiplication chart patterns** (`mchart`): Fill the chart, even and odd products, one more group, and one free-response "why are the shaded numbers the same?" per worksheet.
- **Finish the addition chart** (`addchart`): Fill 6 / 8 / 10 blanks in a 5 by 5 addition chart; L2 starts both headers at the same number, L3 at different numbers.
- **Circle even or odd sums** (`chartcircle`): Circle every even or every odd sum in a full 5 by 5 addition chart.

### Coins (`vis-money.js`)

- **Coins** (`coin`): Identify a penny, nickel, dime or quarter and its value. **Small pool:** 96 / 96 / 4.

### Measuring (`vis-measure.js`)

- **Compare objects** (`cmpm`): Longer, taller, heavier.
- **Order three objects** (`ord3`): Order by length, and compare through a third object.
- **Measure with unit tiles** (`munit`): Cubes and paper clips.
- **Measure with a ruler** (`ruler`): Inches and centimeters. **Small pool:** 50 / 90 / 538.
- **Two units** (`mtwo`): Measure with small and big tiles. **Small pool:** 10 / 10 / 10.
- **How much longer** (`mdiff`): Two bars on a ruler.
- **Estimate length** (`mest`): Pick the sensible unit. **Small pool:** 36 / 36 / 36.
- **Measurable attributes** (`mattr`): Length, height or weight: name the attribute.
- **Choose a measuring tool** (`mtool`): Ruler, yardstick, meter stick or measuring tape.
- **Inches and centimeters** (`mrule2`): Measure one object with two units.
- **Ruler: halves and fourths** (`rulq`): Measure or draw to the quarter inch.
- **Mass and liquid volume** (`mvol`): Dial scales, beakers, units, benchmarks, word problems.

### Number lines (`vis-numberline.js`)

- **Number line jumps** (`nline`): Add and subtract on a number line. Either the start is marked and the student draws the jump and writes the answer, or the jump is drawn and the student writes the equation. The student copy never shows where a given equation's jump lands.
- **Fractions on a number line** (`fline`): Read and mark fractions; length of one part.

### Data displays (`vis-data.js`)

- **Sort and compare** (`sort`): Count two groups and say which has more.
- **Compare two groups** (`cmpg`): Count two groups of objects: greater than, less than or equal to.
- **Tally chart** (`tally`): Read a tally chart.
- **Pictograph** (`pict`): Read, or draw from a table.
- **Bar graph** (`bar`): Read, or draw from a table.
- **Line plot** (`lplot`): Read, or make from measurements.
- **Pictograph, four categories** (`pict4`): Symbols worth 1, 2, 5 or 10.
- **Bar graph, four categories** (`bar4`): Scale of one; read or draw.
- **Scaled pictograph** (`pictg`): Symbols worth 2, 5 or 10, with half symbols.
- **Scaled bar graph** (`barg`): Scales of 2, 5 or 10; one- and two-step questions.
- **Line plot: halves and fourths** (`lplotq`): Read or make a line plot of measurements.

### Shapes and solids (`vis-shapes.js`)

- **Name shapes** (`shname`): Names, sides and corners.
- **Circle all of a shape** (`shall`): Shapes of different sizes and turns.
- **Draw a shape** (`shdraw`): Draw a named shape or one with given sides. **Small pool:** 5 / 8 / 8.
- **Flat and solid** (`solid`): Flat shapes versus solids. **Small pool:** 9 / 45 / 45.
- **Positions** (`pos`): Above, below, between. **Small pool:** 26 / 26 / 26.
- **Position words, more** (`pos2`): In front of, behind, beside, next to.
- **Compare shapes** (`shcmp`): Sides and corners, equal sides, solids that cannot roll.
- **Shapes from sticks** (`shbuild`): Count the sticks and name the shape.
- **Composite figures** (`comp`): Count squares and triangles in a figure.
- **Cut a figure into shapes** (`split`): Draw lines to make triangles, squares or trapezoids.
- **Quadrilateral categories** (`gcat`): Rectangles, rhombuses, squares and larger groups.
- **Is it a polygon?** (`gpoly`): Choose the polygons among closed, open and curved figures.

### Equal parts and fractions (`vis-fractions.js`)

- **Equal shares** (`part`): Halves, thirds, fourths.
- **Halves and quarters** (`partw`): Name one share, whole as shares, shade quarters.
- **Draw equal shares** (`pdraw`): Draw lines to make halves, thirds or fourths.
- **Equal areas and unit fractions** (`gpart`): Draw equal parts, name the unit fraction.
- **Fraction models** (`fmodel`): Name, shade and count equal parts of a whole.

### Area and perimeter (`vis-area.js`)

- **Area concepts** (`acon`): Compare areas, tiling without gaps, unit squares.
- **Compare rectangles** (`pera`): Same perimeter or same area, which is greater.

## Time and Money additions

- `dclock` draws hands for a digital time or writes it in words; `ampm` picks a.m./p.m. for an event with a fixed time window; `like` counts pictured like coins (under 100¢); `cpic` counts pictured mixed coins (plus bills at Medium and Hard); `cstory` one-step money stories in ¢ or $ (small pool of wordings).

## Added for the Texas gaps

- **Financial literacy** (`ns-finance.js`, 20 types `fl*`, planned module Time and Money, group Financial literacy): income and gifts, jobs and skills, wants and needs, spend/save/give, saving over time, deposits and withdrawals, borrowing and lending, producers and consumers, scarcity and price, planned and unplanned spending, fixed and variable expenses, profit, savings options, allowances, financial institutions, taxes, gross and net income, payment methods, records, budgets. Default off. Pick types hold `opts` and `ans`; calculation types keep `kind` and `nums`, recomputed in `tests/logic-finance.js`.
- **Written formats** (also `ns-finance.js`): `flsortwn`, `flsortfv`, `flsortig` (write a letter beside 4, 6 or 8 items), `flbtab` (fill the blank cells of a budget table: savings, total and left over, over budget, or a missing expense) and `flexplain` (finish sentences from a word bank; level is the number of blanks). Their answers are rechecked in `tests/logic-finance.js`.
- **Order numbers to 120** (`ns.ordsm`, `ns-place.js`).
- **Size and number of fractional parts** (`vis.fpart`, `vis-fractions.js`): L1 larger or smaller part, parts in 1 whole; L2 parts in 2 to 4 wholes; L3 largest or smallest of three.
- **Number pairs in a table** (`vis.ptable`, `vis-patterns.js`): multiplying or adding rules in real-world contexts, blank cells filled.
- **Scatterplots of paired data** (`vis.scatter`, `vis-plane.js`): plot a table, read a value, say how one measure changes as the other goes up.
- The last three are checked in `tests/logic-newmath.js`.

## Other modules

- **Mixed Practice** (`mix.js`) takes problems from the generators above in flow layout; repeats are filtered per generator.
- **Combined Worksheet** (`combo.js`) stacks several modules' sections on one sheet; each section is generated separately.
