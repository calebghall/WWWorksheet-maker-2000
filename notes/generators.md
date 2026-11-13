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

## Number Sense (`ns`, `ns.js` and `ns-ext.js`)

- **Place value** (`place`): Underlined digit, digit in a place, expanded and standard form.
- **Order numbers** (`order`): Least to greatest or greatest to least.
- **Rounding** (`round`): Whole numbers and decimals.
- **Skip counting and patterns** (`skip`): Fill in the missing numbers.
- **Even and odd** (`parity`): Circle even or odd, or pick out numbers in a list.
- **Number lines** (`line`): Read the number the arrow shows. **Small pool:** 9 / 36 / 36.
- **Estimation** (`est`): Round each number, then add, subtract or multiply.
- **Number bonds** (`bond`): Decompose to 10, make ten, teen numbers as ten and ones. **Small pool:** 88 / 18 / 18.
- **Unknown in an equation** (`eqn`): Find the missing number in any position.
- **Equal sign** (`equal`): True or false equations and balancing both sides.
- **Properties of operations** (`prop`): Commutative, associative and distributive.
- **Related facts** (`rel`): Subtraction as unknown addend, division as unknown factor.
- **Mentally add or subtract 10 or 100** (`more`): 10 more or less, 100 more or less.
- **Subtract tens** (`sub10`): Subtract a multiple of 10 from a two-digit number.
- **Multiply by multiples of 10** (`mul10`): One digit times 10 to 90.
- **Tens and ones** (`tens`): Write a number as tens and ones.
- **Count on or back** (`cfwd`): Count from any number, back from 20, or by 1, 2, 5 to 120.
- **Multiplicative comparison** (`mcomp`): "__ times as many as" statements.
- **Tenths and hundredths** (`f100`): Rename tenths as hundredths and add. **Small pool:** 9 / 296 / 305.
- **Factors and multiples** (`fact`): Factor pairs, multiples, prime or composite.
- **Perimeter** (`perim`): From side lengths, an unknown side, or same perimeter and same area.
- **Add and subtract word problems** (`wadd`): Add to, take from, put together, compare; unknown in any position.
- **Length word problems** (`wlen`): Add and subtract lengths within 100.
- **Multiply and divide word problems** (`wmul`): Equal groups, arrays, area, comparison, multi-step.
- **Comparison word problems** (`wcmp`): "Times as many" stories.
- **Multi-step word problems** (`wstep`): Remainders and more than one operation.
- **Estimate and solve** (`west`): Two-step stories: round to the nearest ten, then solve.
- **Round to 10 or 100** (`rnd3`): Plain problems and number lines.

## Time and Money (`tm`, `tm.js`)

- **Count the money** (`coins`): Add up coins and bills.
- **Add and subtract money** (`madd`): Cents or dollars and cents.
- **Making change** (`change`): Cost and amount paid, find the change. **Small pool:** 19 / 272 / 2622.
- **Read the clock** (`clock`): Analog clock face, write the time. Off by default because clocks are tall and reduce problems per page. **Small pool:** 24 / 144 / 717.
- **Elapsed time** (`elapsed`): Start and end time, find the time that passes.
- **Time conversions** (`conv`): Seconds, minutes, hours, days and weeks. **Small pool:** 24 / 117 / 997.

## Shapes, Measures and Data (`vis`, `vis-a.js` and `vis-b.js`)

- **Counting pictures** (`cnt`): Count objects, draw a number of objects, write number words.
- **Repeating patterns** (`pat`): What comes next, and how long is the core. **Small pool:** 36 / 144 / 168.
- **Picture equations** (`picop`): Addition and subtraction shown with objects. **Small pool:** 20 / 90 / 90.
- **Coins** (`coin`): Identify a penny, nickel, dime or quarter and its value. **Small pool:** 96 / 96 / 4.
- **Compare objects** (`cmpm`): Longer, taller, heavier.
- **Order three objects** (`ord3`): Order by length, and compare through a third object.
- **Measure with unit tiles** (`munit`): Cubes and paper clips.
- **Measure with a ruler** (`ruler`): Inches and centimeters. **Small pool:** 50 / 90 / 538.
- **Two units** (`mtwo`): Measure with small and big tiles. **Small pool:** 10 / 10 / 10.
- **How much longer** (`mdiff`): Two bars on a ruler.
- **Estimate length** (`mest`): Pick the sensible unit. **Small pool:** 36 / 36 / 36.
- **Number line jumps** (`nline`): Add and subtract on a number line.
- **Sort and compare** (`sort`): Count two groups and say which has more.
- **Tally chart** (`tally`): Read a tally chart.
- **Pictograph** (`pict`): Read, or draw from a table.
- **Bar graph** (`bar`): Read, or draw from a table.
- **Line plot** (`lplot`): Read, or make from measurements.
- **Name shapes** (`shname`): Names, sides and corners.
- **Circle all of a shape** (`shall`): Shapes of different sizes and turns.
- **Draw a shape** (`shdraw`): Draw a named shape or one with given sides. **Small pool:** 5 / 8 / 8.
- **Flat and solid** (`solid`): Flat shapes versus solids. **Small pool:** 9 / 45 / 45.
- **Positions** (`pos`): Above, below, between. **Small pool:** 26 / 26 / 26.
- **Equal shares** (`part`): Halves, thirds, fourths.
- **Composite figures** (`comp`): Count squares and triangles in a figure.
- **Arrays** (`array`): Rows and columns as repeated addition. **Small pool:** 6 / 16 / 16.
- **Number charts** (`chart`): Hundreds chart and addition chart patterns.

## Kindergarten to Grade 2 additions

- **Time and Money** (`tm.js`): `dclock` draws hands for a digital time or writes it in words; `ampm` picks a.m./p.m. for an event with a fixed time window; `like` counts pictured like coins (under 100¢); `cpic` counts pictured mixed coins (plus bills at Medium and Hard); `cstory` one-step money stories in ¢ or $ (small pool of wordings).
- **Number Sense** (`ns-k2.js`): `kseq` count by 1s, 5s, 10s to 100; `cseq` by 5s, 10s, 100s to 1000; `numrw` number words, tens and ones, base-ten blocks to 120; `bondp` bonds with counters and ten-frames; `substr` subtraction strategies; `cmp2` two-digit comparison; `par20` odd/even with pairs; `moreexp` 10 more or less with an explanation line. Addition and subtraction have caps (`as.cap`), a fourth addend and tens-only second numbers. Word problems for add/subtract and length carry a drawing box and a box for the unknown.
- **Shapes, Measures and Data** (`vis-k2.js`): `patmake`, `cntn`, `showop`, `mattr`, `pos2`, `shcmp`, `shbuild`, `split` (small pool), `partw`, `pdraw`, `mtool`, `mrule2`, `pict4`, `bar4`, `chartwhy`. Tests: `logic-k2-a` to `logic-k2-d`.

## Other modules

- **Mixed Practice** (`mix.js`) takes problems from the generators above in flow layout; repeats are filtered per generator.
- **Combined Worksheet** (`combo.js`) stacks several modules' sections on one sheet; each section is generated separately.
