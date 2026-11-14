---
type: Software
title: World Wide Worksheet Maker 2000
resource: https://claude.ai/artifact/WHMQDgFJr1zC9U8D2fNsND
generated:
  by: claude/sonnet-5.5
  at: 2026-11-09T02:32:00Z
tags:
  - education
  - mathematics
  - worksheet-generator
  - printable
  - elementary
  - html-app
---

# World Wide Worksheet Maker 2000

Single-page web app that generates printable elementary math worksheets with matching answer keys. It runs entirely in the browser from one HTML file with no external libraries. Only web fonts load from a network.

## Modules

| Module id | Name | Purpose |
|---|---|---|
| `area` | Area Squares | Count, measure and draw area on unit-square grids. |
| `addsub` | Addition and Subtraction | Stacked or across problems with independent digit counts and carrying and borrowing control. |
| `muldiv` | Multiplication and Division | Times-table facts and multi-digit problems up to 3 by 3, with long division and remainders. |
| `fdp` | Fractions, Decimals and Percents | Simplify, compare, add, multiply, convert and take percents. |
| `ns` | Number Sense | Place value, rounding, ordering, patterns, number lines and estimation. |
| `vis` | Shapes, Measures and Data | Drawn problems: counting pictures, patterns, coins, measuring with tiles and rulers, number line jumps, sorting, tally charts, pictographs, bar graphs, line plots, shape names and drawing, solids, partitions, arrays and charts. |
| `tm` | Time and Money | Count coins, add and subtract money, make change, read clocks, elapsed time and time conversions. |
| `mix` | Mixed Practice | Problems from several topics (addition/subtraction, multiplication/division, fractions/decimals/percents, number sense, time and money) interspersed on the same sheet and packed by size. |
| `combo` | Combined Worksheet | Sections from any of the modules above on one sheet. |

## Area Squares

- Exercise types: count the squares, side lengths (length times width), draw a rectangle of a given area, compare two shapes, L-shaped figures.
- Difficulty: easy (areas up to 25), medium (up to 64), hard (up to 144). Hard mode shows measurements instead of grids for side-length and L-shape problems.
- Units: square units, cm², in², ft², m².
- Layout: 4, 6 or 8 problems per page. Shading of squares can be turned off to save ink.

## Addition and Subtraction

- Operations: addition, subtraction, or both mixed.
- Digits: the first and second number each take 1 to 4 digits, for example 3-digit plus 2-digit. In subtraction the second number has at most as many digits as the first. One-digit subtraction stays within 18.
- Numbers to add: 2 or 3.
- Carrying and borrowing: any, always, or never.
- Format: vertical (stacked) or horizontal.

## Multiplication and Division

- Operations: multiplication, division, or both.
- Facts mode: times tables 2 to 5, 2 to 9, 2 to 10 or 2 to 12, with an option to focus on one table (2 to 12). Division answers are whole numbers.
- Multi-digit mode:
  - Multiplication: first factor 1 to 4 digits, second factor 1 to 3 digits, which includes 3 by 3.
  - Division: dividend 2 to 5 digits, divisor 1 or 2 digits. The dividend always has at least one more digit than the divisor.
- Remainders: optional, written as a quotient and a remainder (R).
- Format: vertical or horizontal. Vertical division draws the long-division bracket.
- Vertical multiplication with a multi-digit multiplier leaves one blank working row per multiplier digit. The worksheet shows only the line under the multiplier. The answer key adds the sum line under the partial products.

## Tennessee standards

- A Tennessee standard panel (grade, then standard) sets the module, problem types, level and title for 119 of the 150 K to 5 standards (Grade 5 is listed in `standards-coverage.md` but has no presets yet). Partial matches show what differs. `standards-coverage.md` lists every standard and its status.

## Fractions, Decimals and Percents

- Problem types, each switchable: simplify a fraction, equivalent fractions, compare (<, >, =), add and subtract fractions, multiply fractions (off by default), add and subtract decimals (stacked), multiply decimals (off by default), convert between fractions, decimals and percents, and percent of a number.
- Levels: 1 (halves, fourths, tenths, small whole-number percents), 2, 3 (larger denominators, mixed denominators, harder percents).
- Fractions are typeset with stacked numerators and denominators. Answer boxes are drawn as blank templates on the worksheet and filled in red on the key.
- Format: cell-based, 12, 20 or 30 per page.

## Number Sense

- Problem types, each switchable: place value, compare numbers, order numbers, rounding, skip counting and patterns, odd and even (off by default), number lines, estimation.
- Standards-driven types, all off by default (the Tennessee standard panel switches on the right one): number bonds, unknown number in an equation, equal sign (true/false), properties of operations, related facts, mentally add or subtract 10 or 100, subtract tens, multiply by multiples of 10, tens and ones, count on or back, multiplicative comparison, tenths and hundredths, factors and multiples, perimeter (including same-perimeter and same-area rectangles), rounding to 10 or 100 with number lines, estimate-and-solve stories, and word problems (add/subtract, lengths, multiply/divide with area contexts, multiplicative comparison, multi-step). Word problems have an equation line and an answer line, and use wide cells (about two per row).
- Levels: 1 to 3, scaling number size and difficulty.
- Format: cell-based, 12, 20 or 30 per page.

## Shapes, Measures and Data

- 26 drawn problem types, each switchable: counting pictures, repeating patterns, picture equations, coins, compare objects, order three objects, unit tiles, ruler, two units, how much longer, estimate length, number line jumps, sort and compare, tally chart, pictograph, bar graph, line plot, name shapes, circle all of a shape, draw a shape, solids, position, equal parts, composing shapes, arrays, and hundred and addition charts.
- Levels: 1 to 3 (Kindergarten, Grade 1, Grade 2 content). The Tennessee standard panel selects the types for each Kindergarten to Grade 2 standard.
- Format: cell-based, up to 12 per page where the drawings fit (6 with all types on). Answer key shows answers in red on the drawings.

## Time and Money

- Problem types, each switchable: count coins and bills, add and subtract money, making change, read an analog clock, elapsed time, and time conversions (seconds, minutes, hours, days, weeks). Clock reading is off by default because clock faces are tall and reduce the problems that fit per page.
- Levels: 1 (amounts under $1 in cents, change from $1, clocks on the hour and half hour, whole-number conversions), 2 (bills with coins, amounts to $10, change from $5 or $10, clocks to 5 minutes), 3 (amounts to $100, change from $10, $20 or $50, clocks to the minute, elapsed time across noon, compound conversions).
- Format: cell-based, 12, 20 or 30 per page.

## Mixed Practice

- Choose any combination of topics; each topic uses the settings from its own tab (levels, problem types, vertical or horizontal format).
- Flow layout: each problem takes only the columns it needs on a 12-column grid, so edges line up from row to row. Problems of similar height share a row, rows are shuffled across the page, so topics stay interspersed while pages fill more densely than a uniform grid. For example, 30 fraction/decimal problems need 1 page instead of 3, and 30 time and money problems with clocks need 2 pages instead of 8.
- Type size is the largest (10 to 14 pt) at which the requested problems fit the requested pages; if they cannot, extra pages are added. Fewer pages are used when everything fits sooner.

## Combined Worksheet

- Mixed Practice is available as a section (10, 15, 20 or 30 problems). It uses the topics checked on its own tab and packs its rows by height, so it can share a page with other sections.

- Each module is a section labeled Part A, Part B and so on, with its own problem count: 2, 4, 6 or 8 for area, and 5, 10, 15, 20 or 30 for the other modules. Fractions/decimals/percents, number sense and time and money start switched off in a fresh combined sheet.
- Each section uses the settings saved on its own module tab. A Settings button on each section row jumps to that tab.
- Problems are numbered continuously across the sheet.
- Sections are packed onto pages in order. A section that does not fit continues on the next page, labeled "(continued)". Page count is automatic.

## Shared options

- Problems per page: 4, 6 or 8 for area, 12, 20 or 30 for arithmetic. When problems are too large for the chosen count, the layout lowers it (to 8, 6 or 4) and says so in the summary line.
- Pages: 1 to 3 for single-module worksheets.
- Paper: Letter or A4.
- Title, optional name and date lines.
- Answer key: printed after the worksheet pages, answers in red, marked ANSWER KEY.
- Set code: a six-character code printed in each page footer. The same code and settings always regenerate the same problems, so a key can be matched to its worksheet. The New problems button creates a fresh code.

## Behavior notes

- Settings persist per browser in `localStorage` under the key `wwwm2000.v1`. The app works with storage unavailable.
- Printing uses the browser print command with an `@page` rule matching the chosen paper size. The published artifact page cannot open a print dialog, so a standalone copy includes a Print button.
- Light and dark themes follow the viewer. Sheets always print on white.

## Files

| File | Role |
|---|---|
| `worksheet-maker-2000.html` | Built version published as the artifact page. |
| `worksheet-maker-2000-printable.html` | Built standalone copy with a working Print button. |
| `src/` | Source: `index.html` template, `css/`, `html/` (settings panel fragments), `js/core/` (shared engine) and `js/modules/` (one file per module family). |
| `build.py` | Inlines `src/` into the two HTML files. |
| `tests/` | `run_tests.sh` plus logic checks and a layout sweep. |
| `CLAUDE.md` | Architecture map and checklists for working on the project. |

## Extending

For a new problem type inside Number Sense or Shapes, Measures and Data, add it to a family file and register it with `defTypes` (`CLAUDE.md`, "Adding a problem type"). For a new module, copy `src/js/modules/_template.js`, register the module with `REG.<id> = { name, counts, n0, plan(st, n, seed) }`, add its fieldsets in `src/html/`, and wire it into `MODULES`, `defaults()`, `readForm()` and `generateSet`. `CLAUDE.md` lists every touch point. The combined worksheet picks the module up automatically.

## Verification

Generator checks covered about 90,000 problems (including 20,400 fraction, decimal, percent and number-sense problems whose answers were recomputed independently) across every digit mixture, carrying and borrowing setting, multiplication size including 3 by 3, division size, remainder setting and combined-worksheet configuration. Answers, digit counts, numbering and page fit all matched their settings. Layouts were checked in screenshots on Letter and A4 with no clipped content. Printing on paper was not tested.

## Greyscale print and coins

- Greyscale print (sheet options): a black and white copy. Colored shapes, pictograph rows, bars, solids and coins become clearly different shades of grey; the answer key turns dark grey. The preview shows the same greys that print.
- Coins are United States Mint photos (public domain), downsized and embedded: Lincoln penny, Jefferson nickel, Roosevelt dime, Washington quarter, each with its real inscriptions. They are drawn at true relative size (dime smallest, quarter largest). Greyscale print switches to greyscale copies in which the penny is darker than the silver coins.

## Repeated problems

- Worksheets avoid repeating a problem. A few types have a small pool of different problems (for example number lines at Easy, drawing a shape, and measuring with two units), so a long sheet of only that type repeats; turn on more types to avoid this. `generators.md` has a one-line description of every generator and marks the small-pool types.
