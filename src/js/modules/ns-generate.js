/* ---------- Number Sense: generate instead of read ----------
   gen1   write a number that fits a rule: one more or one less to 20 (K.2F), greater or less than a number to 120 (1.2D),
          to 1,200 and between two numbers (2.2C). Greater, less and between have many right answers, so the key shows one example.
   story  write a story for a number sentence, then solve it: within 20 (1.3F), within 100, within 1,000 (2.4D).
          The key shows one sample story; any story that fits the sentence is correct. */

const NG_ITEMS = ['stickers', 'marbles', 'books', 'pencils', 'cards', 'shells', 'stamps', 'beads'];

function nsGen1(rng, L) {
  let kind, n, m = 0, ans, prompt;
  if (L === 1) {
    kind = rng() < 0.5 ? 'more' : 'less';
    n = kind === 'more' ? ri(rng, 1, 19) : ri(rng, 2, 20);
    ans = kind === 'more' ? n + 1 : n - 1;
    prompt = rng() < 0.5 ? `What is one ${kind} than ${n}?` : `One ${kind} than ${n} is`;
  } else {
    const hi = L === 2 ? 120 : 1200, lo = L === 2 ? 10 : 100, k = rng();
    kind = L === 3 && k < 0.34 ? 'between' : k < 0.67 ? 'greater' : 'less';
    if (kind === 'between') {
      n = ri(rng, lo, hi - 60); m = n + ri(rng, 30, 60);
      ans = ri(rng, n + 1, m - 1); prompt = `Write a number between ${cnum(n)} and ${cnum(m)}.`;
    } else if (kind === 'greater') {
      n = ri(rng, lo, hi - 10); ans = ri(rng, n + 1, Math.min(hi, n + (L === 2 ? 25 : 150))); prompt = `Write a number greater than ${cnum(n)}.`;
    } else {
      n = ri(rng, lo + 10, hi); ans = ri(rng, Math.max(1, n - (L === 2 ? 25 : 150)), n - 1); prompt = `Write a number less than ${cnum(n)}.`;
    }
  }
  return { mod: 'ns', type: 'gen1', prompt, kind, n, m, ans, sig: `g1${kind}${n}${m}`, ew: 15, eh: 2.4 };
}
const nsGen1Html = (p, key, x) => {
  const vary = p.kind !== 'more' && p.kind !== 'less';
  return `<div>Answer: ${x(cnum(p.ans), 3)}${vary && key ? ' <span style="color:var(--key);font-size:.85em">(answers vary)</span>' : ''}</div>`;
};

function nsStory(rng, L) {
  const hi = L === 1 ? 20 : L === 2 ? 100 : 1000, form = pick(rng, L === 1 ? ['add', 'sub'] : ['add', 'sub', 'miss']);
  const nm = pick(rng, NS_NAMES), it = pick(rng, NG_ITEMS), t = ri(rng, 0, 2);
  let a, b, c, sentence, ans, sample;
  if (form === 'add' || form === 'miss') {
    const lo = L === 1 ? 2 : L === 2 ? 11 : 101;
    a = ri(rng, lo, hi - lo); b = ri(rng, lo, hi - a); c = a + b;
    if (form === 'add') {
      sentence = `${cnum(a)} + ${cnum(b)} = ?`; ans = c;
      sample = [`${nm} has ${cnum(a)} ${it}. A friend gives ${nm} ${cnum(b)} more. How many ${it} does ${nm} have now?`,
        `There are ${cnum(a)} ${it} in a box and ${cnum(b)} ${it} on a shelf. How many ${it} are there in all?`,
        `${nm} finds ${cnum(a)} ${it} on Monday and ${cnum(b)} ${it} on Tuesday. How many ${it} does ${nm} find in all?`][t];
    } else {
      sentence = `? + ${cnum(b)} = ${cnum(c)}`; ans = a;
      sample = [`${nm} has some ${it}. A friend gives ${nm} ${cnum(b)} more. Now ${nm} has ${cnum(c)}. How many ${it} did ${nm} have at first?`,
        `A box holds some ${it}. ${cnum(b)} more are put in. Now there are ${cnum(c)}. How many were in the box at first?`,
        `${nm} had some ${it} and then found ${cnum(b)} more. Now ${nm} has ${cnum(c)}. How many did ${nm} start with?`][t];
    }
  } else {
    const lo = L === 1 ? 2 : L === 2 ? 11 : 101;
    a = ri(rng, lo * 2, hi); b = ri(rng, lo, a - lo); c = a - b; sentence = `${cnum(a)} − ${cnum(b)} = ?`; ans = c;
    sample = [`${nm} has ${cnum(a)} ${it}. ${nm} gives away ${cnum(b)}. How many ${it} does ${nm} have left?`,
      `There are ${cnum(a)} ${it} in a bag. ${cnum(b)} ${it} are taken out. How many ${it} are left in the bag?`,
      `${nm} has ${cnum(a)} ${it} and loses ${cnum(b)} of them. How many ${it} does ${nm} have now?`][t];
  }
  return { mod: 'ns', type: 'story', prompt: 'Write a story for the number sentence. Then solve.', sentence, form, a, b, c, ans, sample, sig: `st${form}${a}${b}`, ew: 22, eh: 1.1 + 1.2 + 2 * 1.5 + 1.3 + (L === 3 ? 0.4 : 0) };
}
const nsStoryHtml = (p, key, x) => {
  const ln = `<div style="border-bottom:1.5px solid currentColor;height:1.45em;margin-top:.15em">&nbsp;</div>`;
  const body = key ? `<div style="color:var(--key);font-size:.85em;white-space:normal">Sample story: ${esc(p.sample)}</div>` : ln + ln;
  return `<div style="font-weight:600;white-space:nowrap">${esc(p.sentence)}</div>${body}<div>Answer: ${x(cnum(p.ans), 3)}</div>`;
};

defTypes("ns", "Counting and number lines", [
  { id: "gen1", label: "Write a number that fits", blurb: "One more or one less to 20, greater than or less than a number to 120 and to 1,200, and between two numbers.", on: false, gen: nsGen1, html: nsGen1Html }
]);
defTypes("ns", "Word problems", [
  { id: "story", label: "Write a story for a number sentence", blurb: "Write a story that fits an addition or subtraction sentence within 20, 100 or 1,000, then solve it.", on: false, gen: nsStory, html: nsStoryHtml }
]);
