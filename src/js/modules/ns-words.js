/* ---------- Number Sense: word problems ----------
   Generators take (rng, level) and return a problem with `sig` and size hints; cell bodies are (p, key, x) functions.
   The types are registered at the bottom with defTypes (id, label, blurb, default, generator, cell body). */

const NS_NAMES = ['Ava', 'Ben', 'Cora', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana', 'Ivan', 'Jo', 'Kai', 'Lena', 'Max', 'Nia', 'Omar', 'Pia'];

const NS_THINGS = ['stickers', 'marbles', 'books', 'apples', 'pencils', 'cards', 'shells', 'stamps', 'beads', 'coins'];

/* Word problems.
   wadd , wlen: add to / take from / put together / compare, unknown in any position. L1 within 20, L2 within 100 with two-step, L3 within 1000.
   wmul: equal groups, arrays, measurement; L1 one-step within 100, L2 two-step, L3 comparison and multi-step. */
const wordProb = (type, kind, nums, text, eq, ans, unit, extra) => Object.assign({ mod: 'ns', type, prompt: 'Read and solve.', kind, nums, text, eq: type === 'wadd' || type === 'wlen' ? eq.replace(/\?/g, '□') : eq, ans: String(ans), unit, wide: true,
  draw: type === 'wadd' || type === 'wlen',   // room to draw, and a box for the unknown
  sig: type + kind + nums.join('.') + text.length, ew: 21, eh: 1.1 + Math.ceil(text.length / 36) * 1.45 + 1.6 + 1.7 + 0.6 + (type === 'wadd' || type === 'wlen' ? 3.4 : 0) }, extra || {});

function nsxWadd(rng, L) {
  const sym = L === 3 ? 'n' : '□', mx = L === 1 ? 20 : L === 2 ? 99 : 999, lo = L === 1 ? 2 : L === 2 ? 11 : 101;
  const nm = pick(rng, NS_NAMES), nm2 = pick(rng, NS_NAMES.filter(x => x !== nm)), th = pick(rng, NS_THINGS);
  const kinds = L === 1 ? ['addR', 'addC', 'addS', 'subR', 'subC', 'subS', 'put', 'apart', 'cmpD', 'cmpB'] : ['addR', 'addC', 'addS', 'subR', 'subC', 'subS', 'put', 'apart', 'cmpD', 'cmpB', 'two', 'two'];
  const kind = pick(rng, kinds), sum = () => { const c = ri(rng, lo + 1, mx), a = ri(rng, Math.min(lo, c - 1), c - 1); return [a, c - a, c]; };
  const [a, b, c] = sum();
  switch (kind) {
    case 'addR': return wordProb('wadd', kind, [a, b, c], `${nm} had ${a} ${th}. Then ${nm} got ${b} more. How many ${th} does ${nm} have now?`, `${a} + ${b} = ${sym}`, c, th);
    case 'addC': return wordProb('wadd', kind, [a, b, c], `${nm} had ${a} ${th}. Then ${nm} got some more. Now ${nm} has ${c} ${th}. How many did ${nm} get?`, `${a} + ${sym} = ${c}`, b, th);
    case 'addS': return wordProb('wadd', kind, [a, b, c], `${nm} had some ${th}. Then ${nm} got ${b} more. Now ${nm} has ${c} ${th}. How many did ${nm} have at first?`, `${sym} + ${b} = ${c}`, a, th);
    case 'subR': return wordProb('wadd', kind, [c, b, a], `${nm} had ${c} ${th}. ${nm} gave ${b} to ${nm2}. How many ${th} does ${nm} have left?`, `${c} − ${b} = ${sym}`, a, th);
    case 'subC': return wordProb('wadd', kind, [c, b, a], `${nm} had ${c} ${th}. ${nm} gave some to ${nm2}. Now ${nm} has ${a} ${th}. How many did ${nm} give away?`, `${c} − ${sym} = ${a}`, b, th);
    case 'subS': return wordProb('wadd', kind, [c, b, a], `${nm} had some ${th}. ${nm} gave ${b} to ${nm2}. Now ${nm} has ${a} left. How many did ${nm} have at first?`, `${sym} − ${b} = ${a}`, c, th);
    case 'put': return wordProb('wadd', kind, [a, b, c], `${nm} has ${a} red ${th} and ${b} blue ${th}. How many ${th} does ${nm} have in all?`, `${a} + ${b} = ${sym}`, c, th);
    case 'apart': return wordProb('wadd', kind, [a, b, c], `${nm} has ${c} ${th}. ${a} of them are red and the rest are blue. How many are blue?`, `${a} + ${sym} = ${c}`, b, th);
    case 'cmpD': return wordProb('wadd', kind, [c, a, b], `${nm} has ${c} ${th}. ${nm2} has ${a} ${th}. How many more ${th} does ${nm} have than ${nm2}?`, `${c} − ${a} = ${sym}`, b, th);
    case 'cmpB': return wordProb('wadd', kind, [a, b, c], `${nm} has ${a} ${th}. ${nm2} has ${b} more ${th} than ${nm}. How many ${th} does ${nm2} have?`, `${a} + ${b} = ${sym}`, c, th);
    default: {
      const a2 = ri(rng, lo, mx - 1), b2 = ri(rng, 1, Math.min(a2 - 1, mx - a2)), c2 = ri(rng, 1, mx - a2 + b2 > 1 ? Math.min(mx - a2 + b2, 40) : 1), res = a2 - b2 + c2;
      return wordProb('wadd', 'two', [a2, b2, c2], `${nm} had ${a2} ${th}. ${nm} gave ${b2} to ${nm2}, then found ${c2} more. How many ${th} does ${nm} have now?`, `${a2} − ${b2} + ${c2} = ${sym}`, res, th);
    }
  }
}

/* add and subtract lengths within 100, unknown in any position. */
function nsxWlen(rng) {
  const unit = pick(rng, ['inches', 'feet', 'centimeters', 'meters']), nm = pick(rng, NS_NAMES), c = ri(rng, 12, 99), a = ri(rng, 5, c - 4), b = c - a, kind = pick(rng, ['tot', 'diff', 'left', 'grew', 'start']);
  switch (kind) {
    case 'tot': return wordProb('wlen', kind, [a, b, c], `${nm} has one ribbon that is ${a} ${unit} long and another that is ${b} ${unit} long. How long are the two ribbons together?`, `${a} + ${b} = ?`, c, unit);
    case 'diff': return wordProb('wlen', kind, [c, a, b], `A rope is ${c} ${unit} long. A shorter rope is ${a} ${unit} long. How much longer is the first rope?`, `${c} − ${a} = ?`, b, unit);
    case 'left': return wordProb('wlen', kind, [c, a, b], `A board is ${c} ${unit} long. ${nm} cuts off ${a} ${unit}. How long is the piece that is left?`, `${c} − ${a} = ?`, b, unit);
    case 'grew': return wordProb('wlen', kind, [a, b, c], `A plant was ${a} ${unit} tall. It grew some more and is now ${c} ${unit} tall. How much did it grow?`, `${a} + ? = ${c}`, b, unit);
    default: return wordProb('wlen', kind, [a, b, c], `${nm} cut ${b} ${unit} off a string. The string that is left is ${a} ${unit} long. How long was the string at first?`, `? − ${b} = ${a}`, c, unit);
  }
}

/* Multiply and divide stories. L1, L2 one-step, L3 two-step: equal groups, arrays, measurement, area. */
function nsxWmul(rng, L) {
  const sym = L === 1 ? '?' : 'n', nm = pick(rng, NS_NAMES), th = pick(rng, NS_THINGS), nm2 = pick(rng, NS_NAMES.filter(x => x !== nm));
  const g = ri(rng, 2, 9), k = ri(rng, 2, Math.min(9, Math.floor(99 / g))), t = g * k;
  const kind = pick(rng, L === 3 ? ['two1', 'two2', 'two3'] : ['prod', 'size', 'count', 'array', 'meas', 'areaP', 'areaW']);
  switch (kind) {
    case 'prod': return wordProb('wmul', kind, [g, k, t], `${nm} has ${g} bags. Each bag has ${k} ${th}. How many ${th} does ${nm} have in all?`, `${g} × ${k} = ${sym}`, t, th);
    case 'size': return wordProb('wmul', kind, [t, g, k], `${nm} shares ${t} ${th} equally among ${g} friends. How many ${th} does each friend get?`, `${t} ÷ ${g} = ${sym}`, k, th);
    case 'count': return wordProb('wmul', kind, [t, k, g], `${nm} has ${t} ${th}. ${nm} puts ${k} ${th} in each box. How many boxes does ${nm} fill?`, `${sym} × ${k} = ${t}`, g, 'boxes');
    case 'array': return wordProb('wmul', kind, [g, k, t], `A garden has ${g} rows of plants with ${k} plants in each row. How many plants are in the garden?`, `${g} × ${k} = ${sym}`, t, 'plants');
    case 'meas': return wordProb('wmul', kind, [t, k, g], `A rope is ${t} feet long. ${nm} cuts it into pieces that are ${k} feet long. How many pieces are there?`, `${t} ÷ ${k} = ${sym}`, g, 'pieces');
    case 'areaP': { const u = pick(rng, ['feet', 'meters', 'inches', 'centimeters']); return wordProb('wmul', kind, [g, k, t], `A rectangle is ${g} ${u} long and ${k} ${u} wide. What is its area in square ${u}?`, `${g} × ${k} = ${sym}`, t, `square ${u}`); }
    case 'areaW': { const u = pick(rng, ['feet', 'meters', 'inches', 'centimeters']); return wordProb('wmul', kind, [g, k, t], `A rectangle has an area of ${t} square ${u}. It is ${g} ${u} long. How wide is it?`, `${g} × ${sym} = ${t}`, k, u); }
    case 'two1': { const x = ri(rng, 2, Math.floor(80 / g)); return wordProb('wmul', kind, [g, k, x], `${nm} buys ${g} packs of ${th} with ${k} in each pack, and ${x} more ${th} alone. How many ${th} does ${nm} buy in all?`, `(${g} × ${k}) + ${x} = ${sym}`, g * k + x, th); }
    case 'two2': { const take = ri(rng, 1, t - 1); return wordProb('wmul', kind, [g, k, take], `${nm} has ${g} boxes with ${k} ${th} in each box. ${nm} gives away ${take} ${th}. How many ${th} are left?`, `(${g} × ${k}) − ${take} = ${sym}`, t - take, th); }
    default: { const s2 = ri(rng, 2, 5), x = s2 * ri(rng, 2, 9), y = s2 * ri(rng, 1, 9); return wordProb('wmul', 'two3', [x, y, s2], `${nm} has ${x} ${th} and ${nm2} has ${y} ${th}. They put all of them into ${s2} equal groups. How many ${th} are in each group?`, `(${x} + ${y}) ÷ ${s2} = ${sym}`, (x + y) / s2, th); }
  }
}

/* multiplicative comparison, and telling it apart from additive comparison. */
function nsxWcmp(rng) {
  const nm = pick(rng, NS_NAMES), nm2 = pick(rng, NS_NAMES.filter(x => x !== nm)), th = pick(rng, NS_THINGS), a = ri(rng, 3, 12), m = ri(rng, 2, 9), kind = pick(rng, ['mcmp', 'mcmpU', 'mcmpK', 'addvm']);
  switch (kind) {
    case 'mcmp': return wordProb('wcmp', kind, [a, m, a * m], `${nm} has ${a} ${th}. ${nm2} has ${m} times as many ${th} as ${nm}. How many ${th} does ${nm2} have?`, `${a} × ${m} = n`, a * m, th);
    case 'mcmpU': return wordProb('wcmp', kind, [a, m, a * m], `${nm2} has ${a * m} ${th}. That is ${m} times as many as ${nm} has. How many ${th} does ${nm} have?`, `${a * m} ÷ ${m} = n`, a, th);
    case 'mcmpK': return wordProb('wcmp', kind, [a, m, a * m], `${nm} has ${a} ${th}. ${nm2} has ${a * m} ${th}. How many times as many ${th} does ${nm2} have as ${nm}?`, `${a * m} ÷ ${a} = n`, m, 'times');
    default: return wordProb('wcmp', kind, [a, m, a * m - a], `A pen costs $${a}. A marker costs ${m} times as much as the pen. How many more dollars does the marker cost than the pen?`, `(${a} × ${m}) − ${a} = n`, a * m - a, 'dollars');
  }
}

/* multi-step problems, including remainders that must be interpreted. */
function nsxWstep(rng) {
  const nm = pick(rng, NS_NAMES), nm2 = pick(rng, NS_NAMES.filter(x => x !== nm)), th = pick(rng, NS_THINGS), kind = pick(rng, ['rem', 'ceil', 'multi', 'multi2']);
  const d = ri(rng, 3, 9), q = ri(rng, 4, 12), r = ri(rng, 1, d - 1), n = d * q + r;
  switch (kind) {
    case 'rem': return wordProb('wstep', kind, [n, d, q, r], `${nm} has ${n} ${th} and puts ${d} in each box. How many full boxes does ${nm} make?`, `${n} ÷ ${d} = ${q} R ${r}, so n = ${q}`, q, 'boxes', { noeval: true });
    case 'ceil': return wordProb('wstep', kind, [n, d, q + 1, r], `A van holds ${d} students. ${n} students need a ride. How many vans are needed?`, `${n} ÷ ${d} = ${q} R ${r}, so n = ${q + 1}`, q + 1, 'vans', { noeval: true });
    case 'multi2': { const g = ri(rng, 3, 9), p = ri(rng, 12, 45), x = ri(rng, 20, 99); return wordProb('wstep', kind, [g, p, x], `${nm} buys ${g} shirts for $${p} each and a hat for $${x}. How many dollars does ${nm} spend in all?`, `(${g} × ${p}) + ${x} = n`, g * p + x, 'dollars'); }
    default: { const a = ri(rng, 12, 60), b = ri(rng, 2, 9), c = ri(rng, 2, 9), e = ri(rng, 10, a + b * c - 1); return wordProb('wstep', 'multi', [a, b, c, e], `${nm} has ${a} ${th}. ${nm2} gives ${nm} ${b} bags with ${c} ${th} in each bag. Then ${nm} gives away ${e} ${th}. How many ${th} does ${nm} have now?`, `${a} + (${b} × ${c}) − ${e} = n`, a + b * c - e, th); }
  }
}

/* estimate by rounding to the nearest ten, then solve a two-step problem and compare. */
const rnd10 = v => Math.round(v / 10) * 10;

function nsxWest(rng) {
  const nm = pick(rng, NS_NAMES), nm2 = pick(rng, NS_NAMES.filter(x => x !== nm)), th = pick(rng, NS_THINGS);
  let p;
  if (rng() < 0.5) {
    const a = ri(rng, 21, 99), b = ri(rng, 21, 99), c = ri(rng, 11, a + b - 20), est = rnd10(a) + rnd10(b) - rnd10(c);
    p = wordProb('west', 'eadd', [a, b, c], `${nm} had ${a} ${th}. ${nm} got ${b} more. Then ${nm} gave ${c} to ${nm2}. How many ${th} does ${nm} have now?`, `${a} + ${b} − ${c} = n`, a + b - c, th, { est: String(est) });
  } else {
    const g = ri(rng, 2, 9), k = ri(rng, 12, 49), x = ri(rng, 11, 99), est = g * rnd10(k) + rnd10(x);
    p = wordProb('west', 'emul', [g, k, x], `${nm} buys ${g} boxes with ${k} ${th} in each box. ${nm} also has ${x} ${th} already. How many ${th} does ${nm} have in all?`, `(${g} × ${k}) + ${x} = n`, g * k + x, th, { est: String(est) });
  }
  p.prompt = 'Estimate, then solve. Is your answer reasonable?'; p.eh += 1.7; p.sig += 'E';
  return p;
}

const nsWaddHtml = (p, key, x) => wordCell(p, key, x);

const nsWlenHtml = (p, key, x) => wordCell(p, key, x);

const nsWmulHtml = (p, key, x) => wordCell(p, key, x);

const nsWcmpHtml = (p, key, x) => wordCell(p, key, x);

const nsWstepHtml = (p, key, x) => wordCell(p, key, x);

const nsWestHtml = (p, key, x) => wordCell(p, key, x);

/* Measurement word problems with whole numbers: length, mass, liquid volume, time and money.
   L1 one step, L2 two steps in one unit, L3 conversions, elapsed time and money. */
const NS_MW = [['cm', 'ribbon', 'spool'], ['m', 'rope', 'coil'], ['g', 'flour', 'bag'], ['kg', 'rice', 'sack'], ['mL', 'juice', 'jar'], ['L', 'water', 'tank']];
const NS_MW_CONV = [['m', 'cm', 100, 'rope'], ['km', 'm', 1000, 'trail'], ['kg', 'g', 1000, 'flour'], ['L', 'mL', 1000, 'juice'], ['ft', 'in', 12, 'string'], ['yd', 'ft', 3, 'fabric'], ['lb', 'oz', 16, 'cheese'], ['gal', 'qt', 4, 'milk']];

function nsxMword(rng, L) {
  const kind = pick(rng, L === 1 ? ['add', 'sub', 'mul'] : L === 2 ? ['two', 'two', 'sub', 'mul'] : ['conv', 'conv', 'money', 'time']), nm = pick(rng, NS_NAMES);
  const [u, stuff, cont] = pick(rng, NS_MW), top = L === 1 ? 90 : 400;
  let text, eq, ans, sg;
  if (kind === 'add') { const a = ri(rng, 12, top), b = ri(rng, 12, top); text = `${nm} measures ${a} ${u} of ${stuff}. Later ${nm} measures ${b} ${u} more. How many ${u} in all?`; eq = `${a} + ${b}`; ans = a + b; sg = `${a}+${b}${u}`; }
  else if (kind === 'sub') { const b = ri(rng, 12, top), a = b + ri(rng, 12, top); text = `${nm} has ${a} ${u} of ${stuff} and uses ${b} ${u}. How many ${u} are left?`; eq = `${a} − ${b}`; ans = a - b; sg = `${a}-${b}${u}`; }
  else if (kind === 'mul') { const a = ri(rng, 6, L === 1 ? 25 : 90), n = ri(rng, 3, 9); text = `Each ${cont} holds ${a} ${u} of ${stuff}. How many ${u} of ${stuff} are in ${n} ${cont}s?`; eq = `${n} × ${a}`; ans = n * a; sg = `${n}x${a}${u}`; }
  else if (kind === 'two') { const a = ri(rng, 8, 60), n = ri(rng, 3, 8), b = ri(rng, 5, a * n - 5); text = `Each ${cont} holds ${a} ${u} of ${stuff}. ${nm} fills ${n} ${cont}s and then uses ${b} ${u}. How many ${u} are left?`; eq = `${n} × ${a} − ${b}`; ans = n * a - b; sg = `${n}x${a}-${b}${u}`; }
  else if (kind === 'conv') { const [big, small, f, st2] = pick(rng, NS_MW_CONV), a = ri(rng, 2, 9), b = f === 1000 ? 50 * ri(rng, 1, 19) : ri(rng, 1, Math.min(f - 1, 60)); text = `${nm} has ${a} ${big} of ${st2} and uses ${b} ${small}. How many ${small} are left?`; eq = `${a} × ${f} − ${b}`; ans = a * f - b; sg = `${a}${big}-${b}${small}`; }
  else if (kind === 'money') { const a = ri(rng, 2, 9), b = ri(rng, 3, 15), n = ri(rng, 2, 6), m = ri(rng, 2, 5); text = `A pen costs $${a} and a notebook costs $${b}. ${nm} buys ${n} pens and ${m} notebooks. How many dollars is the total?`; eq = `${n} × ${a} + ${m} × ${b}`; ans = n * a + m * b; sg = `$${n}x${a}+${m}x${b}`; }
  else {
    /* start 1:00 to 8:55 plus up to 2 h 30 min ends by 11:25, so the clock never wraps past 12 */
    const h = ri(rng, 1, 8), mm = 5 * ri(rng, 0, 11), dur = 5 * ri(rng, 6, 30), tot = h * 60 + mm + dur, h2 = Math.floor(tot / 60), m2 = tot % 60, f2 = (hh, m3) => `${hh}:${String(m3).padStart(2, '0')}`;
    text = `A movie starts at ${f2(h, mm)} and ends at ${f2(h2, m2)}. How many minutes long is the movie?`; ans = dur; sg = `t${h}${mm}${dur}`;
    eq = `${f2(h2, m2)} − ${f2(h, mm)}`;
  }
  return { mod: 'ns', type: 'mword', prompt: 'Solve. Write an equation.', kind, eq, ans: String(ans), text, wide: true, sig: `mw${kind}${sg}${kind === 'add' || kind === 'sub' || kind === 'mul' || kind === 'two' ? stuff : ''}`, ew: 21, eh: nsWordEh(text) };
}

const nsMwordHtml = (p, key, x) => wordCell(p, key, x);

defTypes("ns", "Word problems", [
  { id: "wadd", label: "Add and subtract word problems", blurb: "Add to, take from, put together, compare; unknown in any position.", on: false, gen: nsxWadd, html: nsWaddHtml },
  { id: "wlen", label: "Length word problems", blurb: "Add and subtract lengths within 100.", on: false, gen: nsxWlen, html: nsWlenHtml },
  { id: "wmul", label: "Multiply and divide word problems", blurb: "Equal groups, arrays, comparison, multi-step.", on: false, gen: nsxWmul, html: nsWmulHtml },
  { id: "wcmp", label: "Comparison word problems", blurb: "\"Times as many\" stories.", on: false, gen: nsxWcmp, html: nsWcmpHtml },
  { id: "wstep", label: "Multi-step word problems", blurb: "Remainders and more than one operation.", on: false, gen: nsxWstep, html: nsWstepHtml },
  { id: "west", label: "Estimate and solve", blurb: "Two-step stories: round to the nearest ten, then solve.", on: false, gen: nsxWest, html: nsWestHtml },
{ id: "mword", label: "Measurement word problems", blurb: "One- and two-step problems with length, mass, volume, time and money.", on: false, gen: nsxMword, html: nsMwordHtml }
]);
