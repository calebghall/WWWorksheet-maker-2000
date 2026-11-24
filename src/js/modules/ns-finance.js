/* ---------- Number Sense: financial literacy ----------
   Texas TEKS strand "personal financial literacy" (kindergarten to grade 5). Two kinds of problem, both text cells:
   - pick: a short situation and two to five printed choices; the answer key circles one (Circle ... questions);
   - calc: a short story with a number sentence line and an answer blank (whole dollars only).
   Within a type, a higher level is a harder version of the same topic (more choices, more steps, bigger numbers). A pick problem keeps
   `opts` in the printed order and its `sig` names the whole text and the options, so shuffled options never repeat visually.
   A calc problem keeps `kind` and `nums` so tests/logic-finance.js can recompute the answer on its own. */

const fm = n => '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const flOther = (rng, n) => pick(rng, NS_NAMES.filter(x => x !== n));
const flSome = (rng, arr, k) => shuffle(rng, arr).slice(0, k);

/* Layout hints: options stack one per line when they are long. */
const flStack = o => o.join('').length > 44 || o.some(s => s.length > 24);
const flPick = (type, prompt, text, opts, ans) => {
  const stack = flStack(opts), lines = Math.ceil(text.length * 0.62 / 20);
  const optLines = stack ? opts.reduce((a, s) => a + Math.ceil(s.length * 0.62 / 19), 0) : 1;
  return { mod: 'ns', type, prompt, text, opts, ans, stack, wide: true, sig: `${type}|${text}|${opts.join('/')}`, ew: 21, eh: 1.1 + lines * 1.45 + optLines * 1.5 + (stack ? opts.length * 0.3 : 0) + 0.5 };
};
const flCalc = (type, kind, nums, text, eq, ans, extra) => Object.assign({ mod: 'ns', type, prompt: 'Read and solve.', kind, nums, text, eq, ans: String(ans), wide: true, sig: `${type}|${text}`, ew: 21, eh: nsWordEh(text) }, extra);
const flc = t => String(t).replace(/\d{4,}/g, d => d.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
const flHtml = (p, key, x) => p.opts
  ? `<div class="wt">${esc(p.text)}</div>` + (p.stack ? p.opts.map(o => `<div>${opts([esc(o)], esc(p.ans), key)}</div>`).join('') : `<div>${opts(p.opts.map(esc), esc(p.ans), key)}</div>`)
  : `<div class="wt">${esc(p.text)}</div><div>Number sentence: <span class="blank" style="min-width:9em">${key ? esc(flc(p.eq)) : '&nbsp;'}</span></div><div>Answer: ${p.pre || ''}${p.pre ? ' ' : ''}${x(flc(p.ans), 3.6)}${p.unit ? ' ' + esc(p.unit) : ''}</div>`;

/* Income. L1 income or gift, L2 which is a way to earn income, L3 what income means. */
const FL_EARN = [(n, a) => `${n} walks a neighbor's dog and is paid ${fm(a)}.`, (n, a) => `${n} sells lemonade at a stand and makes ${fm(a)}.`, (n, a) => `${n} rakes leaves for a neighbor and earns ${fm(a)}.`,
  (n, a) => `${n} washes cars and is paid ${fm(a)}.`, (n, a) => `${n} helps in a shop on Saturday and is paid ${fm(a)}.`, (n, a) => `${n} waters plants for a neighbor and earns ${fm(a)}.`];
const FL_GIFT = [(n, a) => `${n} gets ${fm(a)} from a grandparent for a birthday.`, (n, a) => `${n} gets ${fm(a)} in a card from an aunt.`, (n, a) => `A friend gives ${n} ${fm(a)} as a present.`,
  (n, a) => `${n} is given ${fm(a)} as a holiday gift.`, (n, a) => `${n} gets ${fm(a)} as a present at a party.`];
const FL_EARN_W = ['Wash cars for pay.', 'Sell lemonade at a stand.', "Walk a neighbor's dog for pay.", 'Mow lawns for pay.', 'Rake leaves for pay.', 'Help in a shop for pay.', "Water a neighbor's plants for pay."];
const FL_GIFT_W = ['Get money in a birthday card.', 'Get a toy as a present.', 'Get a holiday gift of money.', 'Get a gift card from an aunt.', 'Get a present at a party.'];
function flInc(rng, L) {
  const n = pick(rng, NS_NAMES), a = ri(rng, 2, 20);
  if (L === 1) {
    const inc = rng() < 0.5, t = pick(rng, inc ? FL_EARN : FL_GIFT)(n, a);
    return flPick('flinc', 'Circle income or gift.', t, ['income', 'gift'], inc ? 'income' : 'gift');
  }
  if (L === 2) {
    const e = pick(rng, FL_EARN_W), o = shuffle(rng, [e].concat(flSome(rng, FL_GIFT_W, 2)));
    return flPick('flinc', 'Circle the answer.', pick(rng, ['Which is a way to earn income?', 'Which one would give a child income?', 'Which of these is a way to earn money by working?', 'Which choice is a way to get income?']), o, e);
  }
  const d = pick(rng, [[`${n} earns money by doing a job. This money is called ___.`, 'income', ['income', 'a gift', 'a bill']], [`The money in ${n}'s paycheck is called ___.`, 'income', ['income', 'a gift', 'a bill']],
    [`Money that ${n} gets as a present is a ___, not income.`, 'gift', ['gift', 'job', 'paycheck']], [`Which word means the money ${n} earns by working?`, 'income', ['income', 'gift', 'present']]]);
  return flPick('flinc', 'Circle the answer.', d[0], shuffle(rng, d[2]), d[1]);
}

/* Jobs and skills. L1 skill for a job, L2 skills and hours change income (choose), L3 income from pay rates (calculate). */
const FL_JOBS = [['baker', 'baking bread and cakes'], ['teacher', 'explaining new ideas'], ['doctor', 'caring for sick people'], ['mechanic', 'fixing cars and engines'], ['farmer', 'growing crops'],
  ['librarian', 'helping people find books'], ['bus driver', 'driving a bus safely'], ['cashier', 'counting money and giving change'], ['firefighter', 'putting out fires safely'], ['carpenter', 'building with wood']];
function flJob(rng, L) {
  if (L === 1) {
    const j = pick(rng, FL_JOBS), d = flSome(rng, FL_JOBS.filter(x => x !== j), 2);
    return flPick('fljob', 'Circle the skill.', `Which skill does a ${j[0]} need?`, shuffle(rng, [j[1]].concat(d.map(x => x[1]))), j[1]);
  }
  const n = pick(rng, NS_NAMES), m = flOther(rng, n);
  if (L === 2) {
    const kind = pick(rng, ['skill', 'train', 'hours']);
    if (kind === 'skill') return flPick('fljob', 'Circle the answer.', `${n} learns new job skills. ${n} can often earn ___ income.`, shuffle(rng, ['more', 'less', 'the same']), 'more');
    if (kind === 'train') return flPick('fljob', 'Circle the answer.', `${n} learns to fix computers and can be paid more for repair jobs. ${m} has not learned any new skills. Who can likely earn more income from computer repair?`, shuffle(rng, [n, m]), n);
    const r = ri(rng, 5, 14), a = ri(rng, 3, 8); let b = ri(rng, 3, 8); if (b === a) b = a === 8 ? 7 : a + 1;
    return flPick('fljob', 'Circle the answer.', `${n} works ${a} hours at ${fm(r)} an hour. ${m} works ${b} hours at ${fm(r)} an hour. Who earns more income?`, shuffle(rng, [n, m]), a > b ? n : m);
  }
  if (rng() < 0.5) { const r = ri(rng, 5, 14), h = ri(rng, 2, 8); return flCalc('fljob', 'rate', [r, h], pick(rng, [`${n} earns ${fm(r)} an hour and works ${h} hours. How much income does ${n} earn?`, `${n} is paid ${fm(r)} for each hour of work. ${n} works ${h} hours. How much is ${n} paid in all?`, `A job pays ${fm(r)} an hour. How much income does ${n} earn after ${h} hours?`, `${n} works ${h} hours at ${fm(r)} an hour. What is ${n}'s income?`]), `${r} × ${h}`, r * h, { pre: '$' }); }
  const r1 = ri(rng, 6, 12), r2 = r1 + ri(rng, 2, 5), h = ri(rng, 2, 8);
  return flCalc('fljob', 'skill', [r1, r2, h], pick(rng, [`${n} learned a new skill and now earns ${fm(r2)} an hour instead of ${fm(r1)}. How much more income does ${n} earn in ${h} hours?`, `Before training, ${n} was paid ${fm(r1)} an hour. After training, ${n} is paid ${fm(r2)} an hour. How much more does ${n} earn in ${h} hours?`, `With a new skill, ${n}'s pay rises from ${fm(r1)} to ${fm(r2)} an hour. How much more income is that over ${h} hours?`]), `(${r2} − ${r1}) × ${h}`, (r2 - r1) * h, { pre: '$' });
}

/* Wants and needs. L1 want or need, L2 the same when income pays for it, L3 which to buy first with limited income. */
const FL_NEEDS = ['food', 'water', 'a warm coat in winter', 'a place to live', 'medicine when sick', 'clean clothes', 'a bed to sleep in', 'shoes that fit', 'a doctor visit'];
const FL_WANTS = ['a video game', 'a toy robot', 'candy', 'a stuffed animal', 'a movie ticket', 'a sticker book', 'a game console', 'a pool toy', 'a skateboard', 'a toy car', 'a new poster', 'a fancy hat'];
function flWant(rng, L) {
  const n = pick(rng, NS_NAMES), a = ri(rng, 5, 30), need = rng() < 0.5, thing = pick(rng, need ? FL_NEEDS : FL_WANTS), ans = need ? 'need' : 'want';
  if (L === 1) return flPick('flwant', 'Circle want or need.', pick(rng, [`Is ${thing} a want or a need?`, `${n} thinks about ${thing}. Is it a want or a need?`, `Is ${thing} something people must have (a need) or something they would like to have (a want)?`]), ['want', 'need'], ans);
  if (L === 2) return flPick('flwant', 'Circle want or need.', `${n} earns ${fm(a)} walking dogs. ${n} uses the income to pay for ${thing}. Is ${thing} a want or a need?`, ['want', 'need'], ans);
  const nd = pick(rng, FL_NEEDS), ws = flSome(rng, FL_WANTS, rng() < 0.5 ? 1 : 2);
  const stem = pick(rng, [`${n} has ${fm(a)} of income and can buy only one thing. Which should ${n} buy first?`, `${n} has only ${fm(a)} left this month. Which should ${n} buy first?`, `${n} earned ${fm(a)} and must choose carefully. Which should come first?`]);
  return flPick('flwant', 'Circle the answer.', stem, shuffle(rng, [nd].concat(ws)), nd);
}

/* Spend, save, give. L1 spending or saving, L2 adds giving, L3 any money decision: earning, spending, saving, borrowing or giving. */
const FL_SPEND = [(n, a) => `${n} buys a toy with ${fm(a)}.`, (n, a) => `${n} spends ${fm(a)} on a snack.`, (n, a) => `${n} uses ${fm(a)} to buy a game.`, (n, a) => `${n} pays ${fm(a)} for a movie ticket.`];
const FL_SAVE = [(n, a) => `${n} puts ${fm(a)} in a piggy bank for later.`, (n, a) => `${n} keeps ${fm(a)} in a jar instead of buying a toy.`, (n, a) => `${n} puts ${fm(a)} in a savings account.`, (n, a) => `${n} puts ${fm(a)} away to use next month.`];
const FL_GIVE = [(n, a) => `${n} gives ${fm(a)} to a food drive.`, (n, a) => `${n} donates ${fm(a)} to an animal shelter.`, (n, a) => `${n} gives ${fm(a)} to help a neighbor in need.`, (n, a) => `${n} puts ${fm(a)} in a collection for a charity.`];
const FL_EARNS = [(n, a) => `${n} is paid ${fm(a)} for mowing a lawn.`, (n, a) => `${n} earns ${fm(a)} for helping at a store.`];
const FL_BORROW = [(n, a) => `${n} borrows ${fm(a)} from a bank and will pay it back with interest.`, (n, a) => `${n} uses a loan of ${fm(a)} and must pay it back later.`];
function flSave(rng, L) {
  const n = pick(rng, NS_NAMES), a = ri(rng, 2, 25);
  const cats = L === 1 ? [['spending', FL_SPEND], ['saving', FL_SAVE]] : L === 2 ? [['spending', FL_SPEND], ['saving', FL_SAVE], ['giving', FL_GIVE]]
    : [['earning', FL_EARNS], ['spending', FL_SPEND], ['saving', FL_SAVE], ['borrowing', FL_BORROW], ['giving', FL_GIVE]];
  const c = pick(rng, cats);
  return flPick('flsave', 'Circle the answer.', `${pick(rng, c[1])(n, a)} ${L === 1 ? 'Is this spending or saving?' : 'Which kind of money decision is this?'}`, cats.map(x => x[0]), c[0]);
}

/* Saving adds up. L1 the same amount each week, L2 with money already saved, L3 how many weeks to reach a goal. */
const FL_GOALS = ['a bike', 'a new game', 'a class trip', 'a college fund'];
function flGrow(rng, L) {
  const n = pick(rng, NS_NAMES);
  if (L === 1) {
    const a = pick(rng, [1, 2, 3, 5, 10]), k = ri(rng, 2, 6);
    const t = pick(rng, [`${n} saves ${fm(a)} every week. How much will ${n} have saved after ${k} weeks?`, `${n} puts ${fm(a)} in a jar each week. How much is in the jar after ${k} weeks?`,
      `${n} earns ${fm(a)} each week doing chores and saves all of it. How much does ${n} save in ${k} weeks?`, `${n} drops ${fm(a)} into a piggy bank every Friday. How much is in the bank after ${k} Fridays?`,
      `${n} sets aside ${fm(a)} each week for a gift. How much is set aside after ${k} weeks?`, `For ${k} weeks in a row, ${n} saves ${fm(a)} a week. How much has ${n} saved in all?`]);
    return flCalc('flgrow', 'week', [a, k], t, `${a} × ${k}`, a * k, { pre: '$' });
  }
  if (L === 2) {
    const a = pick(rng, [2, 3, 5, 10]), k = ri(rng, 2, 8), s = 5 * ri(rng, 1, 8);
    const t = pick(rng, [`${n} has ${fm(s)} in a jar. ${n} adds ${fm(a)} every week for ${k} weeks. How much is in the jar then?`, `${n} starts with ${fm(s)} in savings and adds ${fm(a)} each week for ${k} weeks. How much does ${n} have then?`,
      `A savings account has ${fm(s)}. ${n} deposits ${fm(a)} every week for ${k} weeks. What is the balance then?`, `${n} has saved ${fm(s)} so far and saves ${fm(a)} more each week. How much will ${n} have after ${k} more weeks?`,
      `The class fund has ${fm(s)}. Each week the class adds ${fm(a)}. How much is in the fund after ${k} weeks?`]);
    return flCalc('flgrow', 'start', [s, a, k], t, `${s} + ${a} × ${k}`, s + a * k, { pre: '$' });
  }
  const a = ri(rng, 2, 10), k = ri(rng, 3, 12), g = a * k, goal = pick(rng, FL_GOALS);
  const t = pick(rng, [`${n} is saving for ${goal}. The goal is ${fm(g)}. ${n} saves ${fm(a)} each week. How many weeks will it take?`, `${n} needs ${fm(g)} for ${goal} and saves ${fm(a)} a week. How many weeks until ${n} has enough?`,
    `To buy ${goal}, ${n} must save ${fm(g)}. Each week ${n} adds ${fm(a)}. How many weeks does ${n} need?`]);
  return flCalc('flgrow', 'goal', [g, a], t, `${g} ÷ ${a}`, k, { unit: 'weeks' });
}

/* Deposits and withdrawals. L1 deposit or withdrawal, L2 new balance after one, L3 after two. */
const FL_DEP = [(n, a) => `${n} puts ${fm(a)} into a bank account.`, (n, a) => `${n} adds ${fm(a)} of birthday money to a savings account.`, (n, a) => `${n} brings ${fm(a)} to the bank to keep it safe.`];
const FL_WDR = [(n, a) => `${n} takes ${fm(a)} out of the bank to buy a gift.`, (n, a) => `${n} takes ${fm(a)} out of a savings account for shoes.`, (n, a) => `${n} gets ${fm(a)} from the bank account to pay for a trip.`];
function flBank(rng, L) {
  const n = pick(rng, NS_NAMES);
  if (L === 1) { const d = rng() < 0.5, a = ri(rng, 3, 40); return flPick('flbank', 'Circle deposit or withdrawal.', pick(rng, d ? FL_DEP : FL_WDR)(n, a), ['deposit', 'withdrawal'], d ? 'deposit' : 'withdrawal'); }
  const b = 5 * ri(rng, 4, 30);
  if (L === 2) {
    const dep = rng() < 0.5, a = dep ? ri(rng, 5, 60) : ri(rng, 5, b - 5);
    const t = pick(rng, [`${n} has ${fm(b)} in a bank account. ${n} makes a ${dep ? 'deposit' : 'withdrawal'} of ${fm(a)}. How much is in the account now?`, `The balance in ${n}'s account is ${fm(b)}. ${n} ${dep ? 'deposits' : 'withdraws'} ${fm(a)}. What is the new balance?`,
      `${n} has ${fm(b)} in savings. ${n} ${dep ? 'adds' : 'takes out'} ${fm(a)}. How much is in savings now?`, `${n}'s account holds ${fm(b)}. After ${n} ${dep ? 'deposits' : 'withdraws'} ${fm(a)}, how much does the account hold?`]);
    return flCalc('flbank', dep ? 'dep' : 'wdr', [b, a], t, `${b} ${dep ? '+' : '−'} ${a}`, dep ? b + a : b - a, { pre: '$' });
  }
  const a = ri(rng, 5, 60), c = ri(rng, 5, b + a - 5), depFirst = rng() < 0.5;
  const text = pick(rng, depFirst ? [`${n} has ${fm(b)} in a bank account. ${n} deposits ${fm(a)} and then withdraws ${fm(c)}. How much is in the account now?`, `The account has ${fm(b)}. ${n} deposits ${fm(a)} on Monday and withdraws ${fm(c)} on Friday. What is the balance after Friday?`,
      `${n} has ${fm(b)} in savings. First ${n} adds ${fm(a)}, then ${n} takes out ${fm(c)}. How much is in savings now?`] : [`${n} has ${fm(b)} in a bank account. ${n} withdraws ${fm(c)} and then deposits ${fm(a)}. How much is in the account now?`,
      `The account has ${fm(b)}. ${n} withdraws ${fm(c)} on Monday and deposits ${fm(a)} on Friday. What is the balance after Friday?`, `${n} has ${fm(b)} in savings. First ${n} takes out ${fm(c)}, then ${n} adds ${fm(a)}. How much is in savings now?`]);
  return flCalc('flbank', 'two', [b, a, c], text, `${b} + ${a} − ${c}`, b + a - c, { pre: '$' });
}

/* Borrowing and lending. L1 borrowing or lending, L2 responsible or not, and benefit or cost of lending, L3 interest. */
const FL_ITEMS = ['bike', 'book', 'ball', 'game', 'ruler', 'pencil'];
const FL_RESP = [(n, a) => `${n} borrows ${fm(a)} and pays it back on the day ${n} promised.`, n => `${n} borrows a book and returns it on time.`, n => `${n} borrows a ball and returns it in good shape.`];
const FL_NORESP = [(n, a) => `${n} borrows ${fm(a)}, spends it all, and does not pay it back.`, n => `${n} borrows a game, loses it, and does not tell anyone.`, n => `${n} borrows a ruler and never returns it.`];
const FL_LEND = [['helps a friend buy lunch', 'benefit'], ['has less money to spend right now', 'cost'], ['may not get the money back', 'cost']];
const FL_BANKLEND = [['earns interest when the loan is paid back', 'benefit'], ['may not get the money back', 'cost'], ['has less money to lend to others while the loan is out', 'cost']];
function flCred(rng, L) {
  const n = pick(rng, NS_NAMES), m = flOther(rng, n), a = ri(rng, 3, 30);
  if (L === 1) {
    const it = pick(rng, FL_ITEMS), b = rng() < 0.5;
    const s = b ? `${n} uses ${m}'s ${it} for a day and will give it back.` : `${n} lets ${m} use ${n}'s ${it} for a day.`;
    return flPick('flcred', 'Circle borrowing or lending.', `${s} Is ${n} borrowing or lending?`, ['borrowing', 'lending'], b ? 'borrowing' : 'lending');
  }
  if (L === 2) {
    if (rng() < 0.65) { const ok = rng() < 0.5; return flPick('flcred', 'Circle the answer.', `${pick(rng, ok ? FL_RESP : FL_NORESP)(n, a)} Is ${n} responsible or not responsible?`, ['responsible', 'not responsible'], ok ? 'responsible' : 'not responsible'); }
    const bank = rng() < 0.4, s = pick(rng, bank ? FL_BANKLEND : FL_LEND);
    const who = bank ? 'A bank lends ' + fm(a * 10) + ' to a family.' : `${n} lends ${fm(a)} to ${m}.`, subj = bank ? 'the bank' : n;
    return flPick('flcred', 'Circle benefit or cost.', `${who} Is it a benefit or a cost that ${subj} ${s[0]}?`, ['benefit', 'cost'], s[1]);
  }
  const p = 10 * ri(rng, 1, 10), i = ri(rng, 1, Math.max(1, Math.floor(p / 5)));
  if (rng() < 0.5) return flCalc('flcred', 'owe', [p, i], pick(rng, [`${n} borrows ${fm(p)} and must pay back ${fm(p + i)}. How much interest does ${n} pay?`, `${n} takes out a loan of ${fm(p)}. The lender says ${n} must repay ${fm(p + i)}. What is the interest?`,
    `A family borrows ${fm(p)} and pays back ${fm(p + i)} in all. How much of that is interest?`]), `${p + i} − ${p}`, i, { pre: '$' });
  return flCalc('flcred', 'back', [p, i], pick(rng, [`${n} borrows ${fm(p)} and pays ${fm(i)} in interest. How much must ${n} pay back in all?`, `${n} borrows ${fm(p)} from a bank. The interest is ${fm(i)}. How much does ${n} pay back in total?`,
    `A loan of ${fm(p)} has ${fm(i)} of interest. How much must be paid back altogether?`]), `${p} + ${i}`, p + i, { pre: '$' });
}

/* Producers and consumers. L1 producer or consumer, L2 cost to produce from two or three supply costs, L3 cost of a batch. */
const FL_PROD = ['bakes bread to sell', 'grows apples on a farm to sell', 'sews shirts to sell', 'makes wooden chairs to sell', 'builds toy cars in a factory to sell'];
const FL_CONS = ['buys a loaf of bread', 'eats an apple', 'buys a new shirt', 'buys a wooden chair', 'plays with a toy car'];
const FL_MAKE = [['lemonade', ['lemons', 'sugar', 'cups'], 'cup of lemonade'], ['muffins', ['flour', 'eggs', 'sugar'], 'muffin'], ['bracelets', ['beads', 'string', 'clasps'], 'bracelet'],
  ['greeting cards', ['paper', 'markers', 'glue'], 'card'], ['popcorn', ['kernels', 'butter', 'bags'], 'bag of popcorn']];
function flMake(rng, L) {
  const n = pick(rng, NS_NAMES);
  if (L === 1) { const pr = rng() < 0.5; return flPick('flmake', 'Circle producer or consumer.', `${n} ${pick(rng, pr ? FL_PROD : FL_CONS)}. Is ${n} a producer or a consumer?`, ['producer', 'consumer'], pr ? 'producer' : 'consumer'); }
  const [prod, sup, one] = pick(rng, FL_MAKE);
  if (L === 2) {
    const k = rng() < 0.5 ? 2 : 3, c = sup.slice(0, k).map(() => ri(rng, 1, 12)), list = sup.slice(0, k).map((s, i) => `${s} ${fm(c[i])}`).join(', ');
    return flCalc('flmake', 'sum', c, `${n} makes ${prod} to sell. Supplies: ${list}. What is the total cost to make the ${prod}?`, c.join(' + '), c.reduce((x, y) => x + y, 0), { pre: '$' });
  }
  const c = ri(rng, 2, 9), k = ri(rng, 3, 9);
  return flCalc('flmake', 'batch', [c, k], `It costs ${fm(c)} to make one ${one}. How much does it cost ${n} to make ${k} of them?`, `${c} × ${k}`, c * k, { pre: '$' });
}

/* Scarcity and price. L1 will the price go up or down, L2 the likely reason for a price change, L3 how much more a scarce item costs. */
const FL_GOODS = ['oranges', 'apples', 'pumpkins', 'strawberries', 'peaches', 'potatoes', 'tomatoes', 'pears', 'blueberries', 'corn', 'melons', 'carrots'];
const FL_FEW = [g => `A storm ruins many ${g}.`, g => `A dry summer leaves fewer ${g} to sell.`, g => `Few ${g} are left in the store.`, g => `A cold spring kills many ${g} before harvest.`, g => `Only a small amount of ${g} can be found this year.`];
const FL_MANY = [g => `A farm grows a very large crop of ${g}.`, g => `Stores have more ${g} than people want to buy.`, g => `There are plenty of ${g} for everyone.`, g => `A perfect summer gives farmers more ${g} than they can sell.`, g => `Trucks bring in a huge load of ${g} to the store.`];
function flScar(rng, L) {
  const g = pick(rng, FL_GOODS), few = rng() < 0.5;
  if (L === 1) return flPick('flscar', 'Circle up or down.', `${pick(rng, few ? FL_FEW : FL_MANY)(g)} The price of ${g} will probably go ___.`, ['up', 'down'], few ? 'up' : 'down');
  if (L === 2) {
    const right = few ? `There are fewer ${g} than before.` : `There are more ${g} than before.`, wrong = few ? [`There are more ${g} than before.`, `Nobody wants ${g} now.`] : [`There are fewer ${g} than before.`, `A storm ruined the crop.`];
    return flPick('flscar', 'Circle the answer.', `The price of ${g} went ${few ? 'up' : 'down'}. Which is the most likely reason?`, shuffle(rng, [right].concat(wrong)), right);
  }
  const a = ri(rng, 2, 9), b = ri(rng, 1, 6);
  return flCalc('flscar', 'diff', [a, b], `A basket of ${g} costs ${fm(a)} when there are many. After a storm there are fewer, and a basket costs ${fm(a + b)}. How much more does a basket cost now?`, `${a + b} − ${a}`, b, { pre: '$' });
}

/* Planned and unplanned spending. L1 planned or unplanned, L2 cost or benefit of a spending choice, L3 money left after buying. */
const FL_PLAN = [n => `${n} saved for a bike and buys it.`, n => `${n} writes a list and buys only the things on it.`, n => `${n} picks out a gift a week ahead and then buys it for a friend's birthday.`, n => `${n} saves each week for new shoes and then buys them.`, n => `${n} saved for a skateboard and buys it.`, n => `${n} writes a list for the store and buys only what is on it.`];
const FL_UNPLAN = [n => `${n} sees candy at the checkout and buys it.`, n => `${n} sees a toy in a window and buys it right away.`, n => `${n} gets a snack at a stand without thinking about it first.`, n => `${n} buys a game after seeing an ad, without a plan.`, n => `${n} grabs a toy on the way out of the store.`, n => `${n} buys a drink at the ball game because it looks good.`];
const FL_THINGS = ['toy', 'snack', 'game', 'book'];
function flSpend(rng, L) {
  const n = pick(rng, NS_NAMES);
  if (L === 1) { const p = rng() < 0.5; return flPick('flspend', 'Circle planned or unplanned.', `${pick(rng, p ? FL_PLAN : FL_UNPLAN)(n)} Is this spending planned or unplanned?`, ['planned', 'unplanned'], p ? 'planned' : 'unplanned'); }
  if (L === 2) {
    const a = ri(rng, 3, 25), it = pick(rng, FL_THINGS), cost = rng() < 0.5;
    const s = cost ? pick(rng, ['has less money left for other things', 'may not have enough for something else later']) : pick(rng, [`gets to enjoy the ${it}`, `gets something ${n} wanted`]);
    return flPick('flspend', 'Circle cost or benefit.', `${n} spends ${fm(a)} on a ${it}. Is it a cost or a benefit that ${n} ${s}?`, ['cost', 'benefit'], cost ? 'cost' : 'benefit');
  }
  const m = ri(rng, 10, 40), c = ri(rng, 3, m - 2), it = pick(rng, FL_THINGS);
  return flCalc('flspend', 'left', [m, c], `${n} has ${fm(m)}. A ${it} costs ${fm(c)}. If ${n} buys it, how much money will ${n} have left?`, `${m} − ${c}`, m - c, { pre: '$' });
}

/* Fixed and variable expenses. L1 classify an expense, L2 classify from amounts, L3 total of the fixed or the variable expenses. */
const FL_FIXED = ['rent', 'a phone plan', 'a car payment', 'internet service', 'health insurance', 'a gym membership'], FL_VAR = ['groceries', 'gas for the car', 'electricity', 'movie tickets', 'restaurant meals', 'clothes'];
const flCap = s => s[0].toUpperCase() + s.slice(1);
function flExp(rng, L) {
  if (L === 1) { const f = rng() < 0.5, n = pick(rng, NS_NAMES); return flPick('flexp', 'Circle fixed or variable.', `${n}'s family pays for ${pick(rng, f ? FL_FIXED : FL_VAR)}. Is this usually a fixed expense or a variable expense?`, ['fixed', 'variable'], f ? 'fixed' : 'variable'); }
  if (L === 2) {
    const f = rng() < 0.5, a = 10 * ri(rng, 4, 60), b = a + 10 * ri(rng, 1, 8), item = flCap(pick(rng, f ? FL_FIXED : FL_VAR));
    const t = f ? `${item}: ${fm(a)} every month.` : `${item}: ${fm(a)} in May and ${fm(b)} in June.`;
    return flPick('flexp', 'Circle fixed or variable.', `${t} Is this a fixed expense or a variable expense?`, ['fixed', 'variable'], f ? 'fixed' : 'variable');
  }
  const askFixed = rng() < 0.5, fx = flSome(rng, FL_FIXED, askFixed ? 2 : 1), vr = flSome(rng, FL_VAR, askFixed ? 1 : 2);
  const rows = fx.map(s => [s, 'fixed', 10 * ri(rng, 5, 60)]).concat(vr.map(s => [s, 'variable', 10 * ri(rng, 3, 40)]));
  const ord = shuffle(rng, rows), want = askFixed ? 'fixed' : 'variable', sel = rows.filter(r => r[1] === want);
  const t = `A family's monthly expenses: ${ord.map(r => `${r[0]} ${fm(r[2])} (${r[1]})`).join(', ')}. What is the total of the ${want} expenses?`;
  return flCalc('flexp', want, rows.map(r => r[2]), t, sel.map(r => r[2]).join(' + '), sel.reduce((a, r) => a + r[2], 0), { pre: '$', rows: rows.map(r => [r[1], r[2]]) });
}

/* Profit. L1 money taken in minus supplies, L2 price times number sold minus supplies, L3 two costs. */
const FL_SELL = [['cups of lemonade', 'lemonade'], ['bracelets', 'bracelets'], ['cookies', 'cookies'], ['cards', 'cards']];
function flProfit(rng, L) {
  const n = pick(rng, NS_NAMES), [items] = pick(rng, FL_SELL);
  if (L === 1) {
    const c = ri(rng, 5, 40), r = c + ri(rng, 5, 50);
    const t = pick(rng, [`${n} sells ${items} and takes in ${fm(r)}. The supplies cost ${fm(c)}. What is ${n}'s profit?`, `${n}'s ${items} stand brought in ${fm(r)}. ${n} spent ${fm(c)} on supplies. How much profit did ${n} make?`,
      `Sales of ${items} were ${fm(r)} and the supplies cost ${fm(c)}. What is the profit?`, `${n} takes in ${fm(r)} selling ${items} and spends ${fm(c)} to make them. What is the profit?`]);
    return flCalc('flprofit', 'basic', [r, c], t, `${r} − ${c}`, r - c, { pre: '$' });
  }
  const k = ri(rng, 4, 20), p = ri(rng, 2, 6);
  if (L === 2) {
    const c = ri(rng, 3, k * p - 5);
    const t = pick(rng, [`${n} sells ${k} ${items} for ${fm(p)} each. The supplies cost ${fm(c)}. What is ${n}'s profit?`, `Each of the ${k} ${items} that ${n} sells costs ${fm(p)}. ${n} spent ${fm(c)} on supplies. What is ${n}'s profit?`,
      `${n} makes ${k} ${items} and sells them all at ${fm(p)} each. Making them cost ${fm(c)}. How much profit does ${n} make?`]);
    return flCalc('flprofit', 'each', [k, p, c], t, `${k} × ${p} − ${c}`, k * p - c, { pre: '$' });
  }
  const c1 = ri(rng, 2, Math.max(2, Math.floor(k * p / 3))), c2 = ri(rng, 2, Math.max(2, Math.floor(k * p / 3)));
  const t = pick(rng, [`${n} sells ${k} ${items} for ${fm(p)} each. The supplies cost ${fm(c1)} and the table rental costs ${fm(c2)}. What is ${n}'s profit?`, `${n} sells ${k} ${items} at ${fm(p)} each. ${n} paid ${fm(c1)} for supplies and ${fm(c2)} for a sign. What is the profit?`,
    `A club sells ${k} ${items} for ${fm(p)} each. Supplies cost ${fm(c1)} and a permit costs ${fm(c2)}. How much profit does the club make?`]);
  return flCalc('flprofit', 'two', [k, p, c1, c2], t, `${k} × ${p} − (${c1} + ${c2})`, k * p - c1 - c2, { pre: '$' });
}

/* Savings options. L1 and L2 an advantage or a disadvantage of one place to keep savings (two or three choices), L3 the best place for a long-term goal. */
const FL_PLACE = {
  'a piggy bank at home': { adv: ['It is easy to reach.', 'It has no fees.'], dis: ['It could be lost or stolen.', 'It does not earn interest.'] },
  'a savings account at a bank': { adv: ['The bank keeps the money safe.', 'It can earn interest.'], dis: ['You may have to go to the bank to get it.', 'Some accounts have rules about taking money out.'] },
  'cash hidden in a drawer': { adv: ['It is easy to reach.', 'It is free to use.'], dis: ['It could be lost or stolen.', 'It does not earn interest.'] }
};
function flOpt(rng, L) {
  const keys = Object.keys(FL_PLACE);
  if (L === 3) {
    const n = pick(rng, NS_NAMES), a = 5 * ri(rng, 4, 40);
    const stem = pick(rng, [`${n} wants to save ${fm(a)} for college.`, `${n}'s family wants to keep ${fm(a)} safe and earn interest.`, `${n} will not need ${fm(a)} for years and wants it to grow.`, `${n} has ${fm(a)} to save for a long-term goal.`]);
    return flPick('flopt', 'Circle the answer.', `${stem} Which place is the best choice?`, shuffle(rng, keys), 'a savings account at a bank');
  }
  const k = pick(rng, keys), adv = rng() < 0.5, P = FL_PLACE[k], right = pick(rng, adv ? P.adv : P.dis);
  const pool = adv ? P.dis : P.adv, o = L === 1 ? [right, pick(rng, pool)] : [right].concat(pool);
  return flPick('flopt', 'Circle the answer.', `Which is ${adv ? 'an advantage' : 'a disadvantage'} of ${k}?`, shuffle(rng, o), right);
}

/* Allowance. L1 find the amount left to share, L2 find any one part, L3 a half, a fourth and the rest. */
function flAllow(rng, L) {
  const n = pick(rng, NS_NAMES);
  if (L === 1) {
    const a = ri(rng, 8, 30), s = ri(rng, 2, Math.floor(a / 2)), v = ri(rng, 1, a - s - 1);
    const t = pick(rng, [`${n} gets ${fm(a)} allowance. ${n} plans to spend ${fm(s)} and save ${fm(v)}. How much is left to share?`, `${n}'s allowance is ${fm(a)}. ${n} will spend ${fm(s)} and save ${fm(v)}. How much can ${n} share with others?`,
      `${n} gets ${fm(a)} each week. ${fm(s)} is for spending and ${fm(v)} is for saving. The rest is for sharing. How much is for sharing?`, `Of a ${fm(a)} allowance, ${n} spends ${fm(s)} and saves ${fm(v)}. How much does ${n} have left to give away?`]);
    return flCalc('flallow', 'share', [a, s, v], t, `${a} − ${s} − ${v}`, a - s - v, { pre: '$' });
  }
  if (L === 2) {
    const a = ri(rng, 10, 40), x = ri(rng, 2, Math.floor(a / 2)), y = ri(rng, 1, a - x - 1), ask = pick(rng, ['share', 'spend', 'save']);
    const known = { share: ['spend', 'save for college'], spend: ['save for college', 'share'], save: ['spend', 'share'] }[ask], lastWord = { share: 'share', spend: 'spend', save: 'save for college' }[ask];
    const t = rng() < 0.5 ? `${n} gets ${fm(a)}. ${n} plans to ${known[0]} ${fm(x)}, ${known[1]} ${fm(y)}, and ${lastWord} the rest. How much will ${n} ${lastWord}?`
      : `Allowance: ${fm(a)}. ${flCap(known[0])}: ${fm(x)}. ${flCap(known[1])}: ${fm(y)}. The rest is to ${lastWord}. How much is that?`;
    return flCalc('flallow', ask, [a, x, y], t, `${a} − ${x} − ${y}`, a - x - y, { pre: '$' });
  }
  const a = 4 * ri(rng, 3, 10), parts = shuffle(rng, ['spend', 'save', 'share']), ask = pick(rng, parts), amt = { [parts[0]]: a / 2, [parts[1]]: a / 4, [parts[2]]: a / 4 };
  const verb = v => v === 'save' ? 'saves' : v === 'share' ? 'shares' : 'spends';
  const t = rng() < 0.5 ? `${n} gets ${fm(a)}. ${n} ${verb(parts[0])} half, ${verb(parts[1])} a fourth, and ${verb(parts[2])} the rest. How much does ${n} ${ask}?`
    : `${n} splits a ${fm(a)} allowance. Half is to ${parts[0]}, a fourth is to ${parts[1]}, and the rest is to ${parts[2]}. How much is to ${ask}?`;
  return flCalc('flallow', 'frac', [a, parts.indexOf(ask)], t, parts.indexOf(ask) === 0 ? `${a} ÷ 2` : `${a} ÷ 4`, amt[ask], { pre: '$' });
}

/* Financial institutions. Two, three or four choices by level. */
function flInst(rng, L) {
  const n = pick(rng, NS_NAMES), a = 5 * ri(rng, 2, 60), k = L + 1, kind = pick(rng, ['safe', 'borrow', 'purpose']);
  if (kind === 'safe') { const o = [['a bank', 1]].concat(flSome(rng, ['a school desk', 'a toy box', 'a pocket', 'a shoe box'], k - 1).map(s => [s, 0])); return flPick('flinst', 'Circle the answer.', `${n} wants a safe place to keep ${fm(a)} for a long time. Where could ${n} put it?`, shuffle(rng, o.map(x => x[0])), 'a bank'); }
  if (kind === 'borrow') { const o = ['a bank'].concat(flSome(rng, ['a grocery store', 'a school', 'a library', 'a pet shop'], k - 1)); return flPick('flinst', 'Circle the answer.', `${n}'s family needs to borrow money to buy a house. Who can lend it to them?`, shuffle(rng, o), 'a bank'); }
  const right = pick(rng, ["It keeps people's money safe.", 'It lends money to people who need it.']), o = [right].concat(flSome(rng, ['It makes toys to sell.', 'It grows food on farms.', 'It teaches children to read.', 'It fixes cars.'], k - 1));
  return flPick('flinst', 'Circle the answer.', 'Which is one purpose of a bank?', shuffle(rng, o), right);
}

/* Taxes. L1 which tax fits a description, L2 which tax fits a situation, L3 total cost with sales tax. */
const FL_TAX = { 'income tax': 'a tax on the money people earn', 'payroll tax': "a tax taken out of a worker's paycheck", 'sales tax': 'a tax added to the price of things people buy', 'property tax': 'a tax paid on land and buildings people own' };
function flTax(rng, L) {
  const names = Object.keys(FL_TAX), n = pick(rng, NS_NAMES);
  if (L === 1) { const t = pick(rng, names); return flPick('fltax', 'Circle the answer.', `Which tax is ${FL_TAX[t]}?`, shuffle(rng, names), t); }
  if (L === 2) {
    const a = ri(rng, 10, 60), sc = pick(rng, [[`${n} buys a ${fm(a)} game. At the register, ${n} pays more than ${fm(a)} because of a tax.`, 'sales tax'], [`${n}'s family owns a house and pays a tax on it every year.`, 'property tax'],
      [`A tax is taken out of ${n}'s parent's paycheck each pay period.`, 'payroll tax'], [`${n}'s parent pays a tax on the money earned from working.`, 'income tax']]);
    return flPick('fltax', 'Circle the answer.', `${sc[0]} Which tax is it?`, shuffle(rng, names), sc[1]);
  }
  const k = ri(rng, 2, 19), item = pick(rng, ['game', 'jacket', 'backpack', 'bike helmet', 'lamp']), kind = pick(rng, ['sales', 'taxamt', 'total2']);
  if (kind === 'taxamt') return flCalc('fltax', 'taxamt', [k], `A ${item} costs ${fm(10 * k)}. The sales tax is ${fm(1)} for every ${fm(10)}. How much sales tax is added?`, `${10 * k} ÷ 10`, k, { pre: '$' });
  if (kind === 'total2') { const p = ri(rng, 10, 80), t = ri(rng, 1, 9); return flCalc('fltax', 'total2', [p, t], `${n} buys a ${item} for ${fm(p)}. The sales tax is ${fm(t)}. How much does ${n} pay in all?`, `${p} + ${t}`, p + t, { pre: '$' }); }
  return flCalc('fltax', 'sales', [k], `A ${item} costs ${fm(10 * k)}. Sales tax adds ${fm(1)} for every ${fm(10)}. What is the total cost with tax?`, `${10 * k} + ${k}`, 11 * k, { pre: '$' });
}

/* Gross and net income. L1 which amount is gross or net, L2 net income after taxes, L3 net income after taxes and one more deduction. */
function flNet(rng, L) {
  const n = pick(rng, NS_NAMES), g = 50 * ri(rng, 4, 30);
  if (L === 1) {
    const x = 10 * ri(rng, 3, Math.floor(g / 20)), t = g - x, gross = rng() < 0.5;
    return flPick('flnet', 'Circle the answer.', `${n} earns ${fm(g)} in a month before taxes. After taxes, ${n} takes home ${fm(t)}. Which amount is ${n}'s ${gross ? 'gross' : 'net'} income?`, shuffle(rng, [fm(g), fm(t)]), gross ? fm(g) : fm(t));
  }
  const x = 10 * ri(rng, 3, Math.floor(g / 20));
  if (L === 2) return flCalc('flnet', 'tax', [g, x], pick(rng, [`${n} earns a gross income of ${fm(g)}. Taxes take ${fm(x)}. What is ${n}'s net income?`, `${n} earns ${fm(g)} before taxes. Taxes take ${fm(x)}. How much does ${n} take home?`,
    `${n}'s gross income is ${fm(g)}. After ${fm(x)} is paid in taxes, what is ${n}'s net income?`, `${n}'s paycheck is ${fm(g)} before taxes. ${fm(x)} is taken out for taxes. What is the net income?`]), `${g} − ${x}`, g - x, { pre: '$' });
  const y = 10 * ri(rng, 2, Math.max(2, Math.floor((g - x) / 20))), ded = pick(rng, ['health insurance', 'a retirement plan', 'union dues', 'a savings plan at work']);
  return flCalc('flnet', 'two', [g, x, y], pick(rng, [`${n} earns a gross income of ${fm(g)}. Taxes take ${fm(x)} and ${ded} takes ${fm(y)}. What is ${n}'s net income?`, `${n} earns ${fm(g)} before anything is taken out. Taxes take ${fm(x)} and ${ded} takes ${fm(y)}. How much does ${n} take home?`,
    `${n}'s gross income is ${fm(g)}. After ${fm(x)} for taxes and ${fm(y)} for ${ded}, what is ${n}'s net income?`]), `${g} − ${x} − ${y}`, g - x - y, { pre: '$' });
}

/* Methods of payment. L1 which method fits a description, L2 an advantage or a disadvantage of a method, L3 the best method for a situation. */
const FL_PAYM = { 'check': 'a written note that tells a bank to pay someone from your account', 'credit card': 'a card that lets you borrow money to buy things now and pay later',
  'debit card': 'a card that takes money straight from your bank account', 'electronic payment': 'sending money with a phone or a website' };
const FL_PADV = { 'check': 'It leaves a written record.', 'credit card': 'You can buy something now and pay later.', 'debit card': 'It uses your own money, so you do not borrow.', 'electronic payment': 'It is quick and easy to use.' };
const FL_PDIS = { 'check': 'It takes time to write and for the bank to process.', 'credit card': 'You may owe interest if you do not pay it all back.', 'debit card': 'You cannot buy things if the account is empty.', 'electronic payment': 'Someone could steal your account information.' };
function flPay(rng, L) {
  const names = Object.keys(FL_PAYM), n = pick(rng, NS_NAMES);
  if (L === 1) { const m = pick(rng, names); return flPick('flpay', 'Circle the answer.', `Which method of payment is ${FL_PAYM[m]}?`, shuffle(rng, names), m); }
  if (L === 2) {
    const m = pick(rng, names), adv = rng() < 0.5, right = (adv ? FL_PADV : FL_PDIS)[m], pool = names.filter(x => x !== m).map(x => (adv ? FL_PDIS : FL_PADV)[x]);
    const wrong = [(adv ? FL_PDIS : FL_PADV)[m]].concat(flSome(rng, pool, 1));
    return flPick('flpay', 'Circle the answer.', `Which is ${adv ? 'an advantage' : 'a disadvantage'} of paying with ${m === 'electronic payment' ? 'an electronic payment' : 'a ' + m}?`, shuffle(rng, [right].concat(wrong)), right);
  }
  const sc = pick(rng, [[`${n} wants to buy groceries with ${n}'s own money and not borrow.`, 'debit card'], [`${n} wants to pay a friend right away using a phone.`, 'electronic payment'],
    [`${n} needs to buy a bike today and pay for it next month.`, 'credit card'], [`${n} wants to mail a payment and keep a written record.`, 'check']]);
  return flPick('flpay', 'Circle the answer.', `${sc[0]} Which method of payment fits best?`, shuffle(rng, names), sc[1]);
}

/* Financial records. L1 which record to keep, L2 which folder, L3 the new balance in a check register. */
const FL_REC = [['to show what it bought at a store', 'a receipt'], ['to show how much money is in the bank account', 'a bank statement'], ['to show money that must be paid by a due date', 'a bill'], ['to write down each check and deposit', 'a check register']];
const FL_FOLD = [['an electric bill that is due next week', 'Bills to pay'], ['a receipt for new shoes', 'Receipts'], ['the monthly bank statement', 'Bank statements'], ['a store receipt for school supplies', 'Receipts'],
  ['a phone bill that is due on the 5th', 'Bills to pay'], ['a statement from the savings account', 'Bank statements'], ['a water bill that is due on Friday', 'Bills to pay'], ['a receipt for a pair of socks', 'Receipts'],
  ['a statement from the checking account', 'Bank statements'], ['a receipt from the grocery store', 'Receipts']];
function flRec(rng, L) {
  const n = pick(rng, NS_NAMES);
  if (L === 1) { const r = pick(rng, FL_REC), o = [r[1]].concat(flSome(rng, FL_REC.filter(x => x !== r).map(x => x[1]), 2)); return flPick('flrec', 'Circle the answer.', `Which record should ${n} keep ${r[0].replace('it bought', n + ' bought')}?`, shuffle(rng, o), r[1]); }
  if (L === 2) { const f = pick(rng, FL_FOLD); return flPick('flrec', 'Circle the answer.', `${n} keeps records in folders. Which folder should hold ${f[0]}?`, ['Bills to pay', 'Receipts', 'Bank statements'], f[1]); }
  const b = 5 * ri(rng, 8, 60), kind = pick(rng, ['chk', 'dep', 'both']);
  if (kind === 'chk') { const c = ri(rng, 5, b - 5); return flCalc('flrec', kind, [b, c], `${n}'s check register shows ${fm(b)}. ${n} writes a check for ${fm(c)}. What is the new balance?`, `${b} − ${c}`, b - c, { pre: '$' }); }
  if (kind === 'dep') { const a = ri(rng, 5, 80); return flCalc('flrec', kind, [b, a], `${n}'s check register shows ${fm(b)}. ${n} makes a deposit of ${fm(a)}. What is the new balance?`, `${b} + ${a}`, b + a, { pre: '$' }); }
  const c = ri(rng, 5, b - 5), a = ri(rng, 5, 80);
  return flCalc('flrec', kind, [b, c, a], `${n}'s check register shows ${fm(b)}. ${n} writes a check for ${fm(c)} and makes a deposit of ${fm(a)}. What is the new balance?`, `${b} − ${c} + ${a}`, b - c + a, { pre: '$' });
}

/* Budgets. L1 find the amount that balances the budget, L2 how much to cut when expenses are more than income, L3 an action that balances a budget. */
const FL_COSTS = ['rent', 'food', 'gas', 'the phone', 'clothes', 'the internet'];
function flBud(rng, L) {
  const n = pick(rng, NS_NAMES);
  if (L === 1) {
    const i = 100 * ri(rng, 5, 30), [x, y] = flSome(rng, FL_COSTS, 2), a = 10 * ri(rng, 5, Math.floor(i / 20)), b = 10 * ri(rng, 3, Math.floor(i / 25));
    const t = pick(rng, [`${n}'s monthly income is ${fm(i)}. Spending on ${x} is ${fm(a)} and on ${y} is ${fm(b)}. ${n} saves the rest. How much does ${n} save to balance the budget?`, `${n} plans a budget with ${fm(i)} of income. ${flCap(x)} costs ${fm(a)} and ${y} costs ${fm(b)}. The rest goes to savings. How much goes to savings?`,
      `A family earns ${fm(i)} a month. They spend ${fm(a)} on ${x} and ${fm(b)} on ${y}. How much is left to balance the budget?`]);
    return flCalc('flbud', 'left', [i, a, b], t, `${i} − ${a} − ${b}`, i - a - b, { pre: '$' });
  }
  if (L === 2) {
    const i = 100 * ri(rng, 5, 25);
    const tot = i + 10 * ri(rng, 2, 15), a = 10 * ri(rng, Math.floor(tot / 40), Math.floor(tot / 25)), b = 10 * ri(rng, Math.floor(tot / 40), Math.floor(tot / 25)), d = tot - a - b;
    const [x, y, z] = flSome(rng, FL_COSTS, 3);
    const t = pick(rng, [`${n}'s monthly income is ${fm(i)}. Spending on ${x} is ${fm(a)}, on ${y} is ${fm(b)}, and on ${z} is ${fm(d)}. How much must ${n} cut so the budget balances?`, `${n} earns ${fm(i)} a month but plans to spend ${fm(a)} on ${x}, ${fm(b)} on ${y}, and ${fm(d)} on ${z}. How much too much is that?`,
      `A family's income is ${fm(i)}. Their spending is ${fm(a)} on ${x}, ${fm(b)} on ${y}, and ${fm(d)} on ${z}. How much must they cut to balance the budget?`]);
    return flCalc('flbud', 'over', [i, a, b, d], t, `(${a} + ${b} + ${d}) − ${i}`, a + b + d - i, { pre: '$' });
  }
  const right = pick(rng, ['Spend less on wants.', 'Earn more income.', 'Cut back on spending that is not needed.', 'Find a way to earn extra money.', 'Skip buying things that are only wants.']), wrong = flSome(rng, ['Spend more on wants.', 'Borrow more money and not pay it back.', 'Ignore the budget.', 'Buy more things that are not needed.'], 2);
  const stem = pick(rng, [`${n}'s expenses are more than ${n}'s income.`, `${n}'s family spends more than it earns each month.`, `${n} spent more than ${n} earned this month.`]);
  return flPick('flbud', 'Circle the answer.', `${stem} Which action could help balance the budget?`, shuffle(rng, [right].concat(wrong)), right);
}

/* ---------- Written formats (no circling) ----------
   Sort: write a letter beside each item (flsortwn, flsortfv, flsortig; level = 4, 6 or 8 items).
   Budget table: fill the blank cells of a small budget (flbtab).
   Complete the sentences: fill blanks from a word bank (flexplain; level = 1, 2 or 3 blanks). */
const FL_SORT_INC = ['Pay for washing cars', 'Money from selling lemonade', 'A paycheck from a job', 'Pay for walking a dog', 'Money for mowing a lawn', 'Pay for raking leaves', 'Wages for helping in a shop', 'Pay for watering plants'];
const FL_SORT_GIFT = ['Money in a birthday card', 'A holiday gift of money', 'A gift card from an aunt', 'Birthday money from a grandparent', 'A present of money from a friend', 'Money given at a graduation party', 'A cash gift from an uncle', 'A wedding gift of money'];
const FL_SORT_FIX = ['rent', 'a phone plan', 'a car payment', 'internet service', 'health insurance', 'a gym membership', 'a monthly bus pass', 'a loan payment'];
const FL_SORT_VAR = ['groceries', 'gas for the car', 'electricity', 'movie tickets', 'restaurant meals', 'clothes', 'a trip to the zoo', 'school snacks'];
function flSort(type, prompt, a, b, ia, ib, rng, L) {
  const n = L === 1 ? 4 : L === 2 ? 6 : 8, k = L === 1 ? 2 : ri(rng, 2, n - 2);
  const rows = shuffle(rng, flSome(rng, ia, k).map(t => [t, a[0]]).concat(flSome(rng, ib, n - k).map(t => [t, b[0]])));
  const cap = t => t[0].toUpperCase() + t.slice(1);
  return { mod: 'ns', type, prompt, items: rows.map(r => cap(r[0])), cats: rows.map(r => r[1]), groups: [a, b], ans: rows.map(r => r[1]).join(' '), wide: true, sig: `${type}|${rows.map(r => r[0]).join('|')}`, ew: 21, eh: 1.1 + n * 1.5 + 1.3 };
}
const flSortWn = (rng, L) => flSort('flsortwn', 'Write N for need or W for want.', ['N', 'need'], ['W', 'want'], FL_NEEDS, FL_WANTS, rng, L);
const flSortFv = (rng, L) => flSort('flsortfv', 'Write F for fixed or V for variable.', ['F', 'fixed'], ['V', 'variable'], FL_SORT_FIX, FL_SORT_VAR, rng, L);
const flSortIg = (rng, L) => flSort('flsortig', 'Write I for income or G for gift.', ['I', 'income'], ['G', 'gift'], FL_SORT_INC, FL_SORT_GIFT, rng, L);

/* Budget table. L1 find the savings, L2 total spending and money left, L3 total spending and the amount over budget, or the missing expense. */
function flBtab(rng, L) {
  const n = pick(rng, NS_NAMES), cost = (lo, hi) => 10 * ri(rng, lo, hi), [x, y, z] = flSome(rng, FL_COSTS, 3).map(flCap);
  if (L === 1) {
    const i = 100 * ri(rng, 5, 25), a = cost(5, Math.floor(i / 20)), b = cost(3, Math.floor(i / 25));
    return flTable('left', [i, a, b], `${n}'s monthly budget. Savings is the money left after spending.`, [['Income', i], [x, a], [y, b], ['Savings', null, i - a - b]]);
  }
  if (L === 2) {
    const i = 100 * ri(rng, 6, 25), a = cost(4, Math.floor(i / 40)), b = cost(4, Math.floor(i / 40)), c = cost(3, Math.floor(i / 50)), t = a + b + c;
    return flTable('tot', [i, a, b, c], `${n}'s monthly budget.`, [['Income', i], [x, a], [y, b], [z, c], ['Total spending', null, t], ['Money left over', null, i - t]]);
  }
  const i = 100 * ri(rng, 6, 20);
  if (rng() < 0.5) {
    const t = i + cost(2, 12), a = cost(Math.floor(t / 40), Math.floor(t / 28)), b = cost(Math.floor(t / 40), Math.floor(t / 28)), c = t - a - b;
    return flTable('over2', [i, a, b, c], `${n}'s monthly budget. Spending is more than income.`, [['Income', i], [x, a], [y, b], [z, c], ['Total spending', null, t], ['Over budget by', null, t - i]]);
  }
  const a = cost(Math.floor(i / 40), Math.floor(i / 28)), b = cost(Math.floor(i / 40), Math.floor(i / 28));
  return flTable('miss', [i, a, b], `${n}'s monthly budget balances. Total spending equals income.`, [['Income', i], [x, a], [y, b], [z, null, i - a - b], ['Total spending', i]]);
}
function flTable(kind, nums, intro, rows) {
  const blanks = rows.filter(r => r[1] === null).map(r => r[2]);
  return { mod: 'ns', type: 'flbtab', prompt: 'Fill in the budget.', kind, nums, intro, tbl: rows, ans: blanks.join(' '), wide: true, sig: `flbtab|${kind}|${intro}|${rows.map(r => r[0] + r[1]).join('|')}`, ew: 21, eh: 1.1 + Math.ceil(intro.length * 0.62 / 20) * 1.45 + rows.length * 1.5 + 0.8 };
}

/* Complete the sentences: each sentence has three key words; the level decides how many are blanked (1, 2 or 3). The word bank adds two wrong words. */
const FL_CLOZE = [
  ['Saving is an {0} to spending. When you spend money, you use it {1}. When you save money, you keep it for {2}.', ['alternative', 'now', 'later'], ['gift', 'bill']],
  ['People who learn more {0} can often earn more {1}. A person who works more {2} can also earn more.', ['skills', 'income', 'hours'], ['gifts', 'taxes']],
  ['When a good is {0}, there is not much of it, so its price usually goes {1}. When there is a lot of it, its price usually goes {2}.', ['scarce', 'up', 'down'], ['free', 'broken']],
  ['People use credit when they cannot {0} what they want or need right now. The {1} must pay the money back to the {2}.', ['afford', 'borrower', 'lender'], ['teacher', 'farmer']],
  ['A savings plan helps a person {0} money for something big, such as {1}. A plan can also help in an {2}.', ['save', 'college', 'emergency'], ['tax', 'paycheck']],
  ['A savings {0} at a bank keeps money {1} and can earn {2}.', ['account', 'safe', 'interest'], ['bill', 'lost']],
  ['Money you {0} is used right away. Money you {1} is kept for later. Money you {2} helps other people.', ['spend', 'save', 'share'], ['owe', 'tax']],
  ["A {0} keeps people's money safe. It can also {1} money to people who need it, and they pay it back with {2}.", ['bank', 'lend', 'interest'], ['store', 'spend']],
  ['Gross income is the pay a person earns {0} taxes. Net income is the pay left {1} taxes are taken out. Net income is {2} than gross income.', ['before', 'after', 'less'], ['during', 'more']],
  ['Good {0} are kept in one place. Keep {1} to show what you bought. Pay each {2} by its due date.', ['records', 'receipts', 'bill'], ['gifts', 'taxes']],
  ['A budget is balanced when income is the {0} as spending. If spending is more than income, a person can spend {1} on wants or earn {2} income.', ['same', 'less', 'more'], ['gift', 'tax']],
  ['A {0} makes goods or services to sell. A {1} buys and uses them. The cost to make something includes the cost of {2}.', ['producer', 'consumer', 'supplies'], ['bank', 'tax']]
];
function flExplain(rng, L) {
  const t = Math.floor(rng() * FL_CLOZE.length), [tpl, words, dis] = FL_CLOZE[t], blank = shuffle(rng, [0, 1, 2]).slice(0, L).sort((a, b) => a - b);
  const bank = shuffle(rng, blank.map(i => words[i]).concat(dis));
  return { mod: 'ns', type: 'flexplain', prompt: 'Use the word bank to finish the sentences.', tpl: t, words, blank, bank, ans: blank.map(i => words[i]).join(' '), wide: true, sig: `flexplain|${t}|${blank}|${bank}`, ew: 21, eh: 1.1 + (Math.ceil(tpl.length * 0.62 / 20) + L) * 1.5 + 1.8 };
}
const flWrittenHtml = (p, key, x) => {
  if (p.items) {
    const rows = p.items.map((t, i) => `<div style="display:flex;gap:.4em;align-items:baseline"><span>${i + 1}.</span><span>${esc(t)}</span>${x(p.cats[i], 1.2)}</div>`).join('');
    return `<div style="display:grid;grid-template-columns:1fr;gap:.2em">${rows}</div>`;
  }
  if (p.tbl) {
    const cs = 'border:1px solid #8d99ad;padding:.02in .08in', rows = p.tbl.map(r => `<tr><td style="${cs}">${esc(r[0])}</td><td style="${cs};text-align:right;white-space:nowrap">${r[1] === null ? '$ ' + x(flc(r[2]), 3) : fm(r[1])}</td></tr>`).join('');
    return `<div class="wt">${esc(p.intro)}</div><table style="border-collapse:collapse;margin-top:.04in">${rows}</table>`;
  }
  const parts = FL_CLOZE[p.tpl][0].split(/\{(\d)\}/);
  const body = parts.map((seg, i) => i % 2 === 0 ? esc(seg) : p.blank.includes(+seg) ? x(p.words[+seg], p.words[+seg].length * 0.6 + 1.4) : esc(p.words[+seg])).join('');
  return `<div class="wt" style="line-height:1.9">${body}</div><div>Word bank: ${p.bank.map(w => `<span class="opt" style="min-width:0;margin:0 .04in;padding:.01in .06in">${esc(w)}</span>`).join('')}</div>`;
};

defTypes("ns", "Financial literacy", [
  { id: "flinc", label: "Income and gifts", blurb: "Income or gift, ways to earn income, what income means.", on: false, gen: flInc, html: flHtml },
  { id: "fljob", label: "Jobs, skills and income", blurb: "Skills for a job, how skills and hours change income, pay rates.", on: false, gen: flJob, html: flHtml },
  { id: "flwant", label: "Wants and needs", blurb: "Want or need, paying with income, choosing between a want and a need.", on: false, gen: flWant, html: flHtml },
  { id: "flsave", label: "Spend, save or give", blurb: "Spending or saving, giving, and any money decision.", on: false, gen: flSave, html: flHtml },
  { id: "flgrow", label: "Saving adds up", blurb: "How saved money grows week by week and how long a goal takes.", on: false, gen: flGrow, html: flHtml },
  { id: "flbank", label: "Deposits and withdrawals", blurb: "Deposit or withdrawal, and the new bank balance.", on: false, gen: flBank, html: flHtml },
  { id: "flcred", label: "Borrowing, lending and interest", blurb: "Borrow or lend, responsible borrowing, benefits and costs, interest.", on: false, gen: flCred, html: flHtml },
  { id: "flmake", label: "Producers, consumers and cost to make", blurb: "Producer or consumer, the cost to make an item.", on: false, gen: flMake, html: flHtml },
  { id: "flscar", label: "Scarcity and price", blurb: "Fewer goods usually cost more, more goods usually cost less.", on: false, gen: flScar, html: flHtml },
  { id: "flspend", label: "Planned and unplanned spending", blurb: "Planned or unplanned, costs and benefits of a choice, money left.", on: false, gen: flSpend, html: flHtml },
  { id: "flexp", label: "Fixed and variable expenses", blurb: "Fixed or variable, and totals of each kind.", on: false, gen: flExp, html: flHtml },
  { id: "flprofit", label: "Profit", blurb: "Money taken in minus the cost of supplies.", on: false, gen: flProfit, html: flHtml },
  { id: "flopt", label: "Savings options", blurb: "Advantages and disadvantages of places to keep savings.", on: false, gen: flOpt, html: flHtml },
  { id: "flallow", label: "Allowance plans", blurb: "Split an allowance among spending, saving and sharing.", on: false, gen: flAllow, html: flHtml },
  { id: "flinst", label: "Banks and what they do", blurb: "Keeping money safe, borrowing and lending.", on: false, gen: flInst, html: flHtml },
  { id: "fltax", label: "Taxes", blurb: "Income, payroll, sales and property tax, and a total with sales tax.", on: false, gen: flTax, html: flHtml },
  { id: "flnet", label: "Gross and net income", blurb: "Gross or net, and net income after taxes and deductions.", on: false, gen: flNet, html: flHtml },
  { id: "flpay", label: "Methods of payment", blurb: "Check, credit card, debit card and electronic payment.", on: false, gen: flPay, html: flHtml },
  { id: "flrec", label: "Financial records", blurb: "Which record to keep, which folder, and a check register balance.", on: false, gen: flRec, html: flHtml },
  { id: "flbud", label: "Balance a budget", blurb: "Find the amount that balances a budget, cut spending, choose an action.", on: false, gen: flBud, html: flHtml },
  { id: "flsortwn", label: "Sort wants and needs", blurb: "Write N or W beside each item (4, 6 or 8 items).", on: false, gen: flSortWn, html: flWrittenHtml },
  { id: "flsortfv", label: "Sort fixed and variable expenses", blurb: "Write F or V beside each expense (4, 6 or 8 items).", on: false, gen: flSortFv, html: flWrittenHtml },
  { id: "flsortig", label: "Sort income and gifts", blurb: "Write I or G beside each way of getting money (4, 6 or 8 items).", on: false, gen: flSortIg, html: flWrittenHtml },
  { id: "flbtab", label: "Fill in a budget table", blurb: "Savings, total spending, money left over, an over-budget amount or a missing expense.", on: false, gen: flBtab, html: flWrittenHtml },
  { id: "flexplain", label: "Complete the sentences", blurb: "Finish sentences about money ideas from a word bank (1, 2 or 3 blanks).", on: false, gen: flExplain, html: flWrittenHtml }
]);
