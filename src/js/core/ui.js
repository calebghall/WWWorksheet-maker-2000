function defaults() {
  const combo = {}; for (const id of Object.keys(REG)) combo[id] = { on: REG[id].on0 !== false, n: REG[id].n0 };
  return {
    module: 'area',
    titles: { area: 'Area Squares', addsub: 'Addition and Subtraction', muldiv: 'Multiplication and Division', fdp: 'Fractions, Decimals and Percents', ns: 'Number Sense', tm: 'Time and Money', vis: 'Shapes, Measures and Data', mix: 'Mixed Practice', combo: 'Math Practice' },
    types: { count: true, mult: true, draw: true, cmp: true, lsh: false }, level: 2, perPage: 6, unit: 'units', shade: true,
    arPerPage: 20,
    as: { add: true, sub: true, d1: 2, d2: 2, addends: 2, regroup: 'any', format: 'vertical', cap: 0, second: 'digits' },
    md: { mul: true, div: true, mode: 'facts', tables: 10, focus: 0, rem: false, da: 2, db: 1, na: 3, nb: 1, format: 'vertical' },
    fd: { types: { simp: true, equiv: true, cmp: true, fadd: true, fmul: false, decadd: true, decmul: false, conv: true, pct: true }, level: 2 },
    ns: { types: { place: true, compare: true, order: true, round: true, skip: true, parity: false, line: true, est: true, bond: false, eqn: false, equal: false, prop: false, rel: false, more: false, sub10: false, mul10: false, tens: false, cfwd: false, mcomp: false, f100: false, fact: false, perim: false, wadd: false, wlen: false, wmul: false, wcmp: false, wstep: false, kseq: false, cseq: false, numrw: false, bondp: false, substr: false, cmp2: false, par20: false, moreexp: false }, level: 2 },
    vis: { types: { cnt: true, pat: true, picop: false, coin: false, cmpm: false, ord3: false, munit: false, ruler: true, mtwo: false, mdiff: false, mest: false, nline: false, sort: true, tally: false, pict: false, bar: false, lplot: false, shname: true, shall: true, shdraw: false, solid: false, pos: false, part: false, comp: false, array: false, chart: false, patmake: false, cntn: false, showop: false, mattr: false, pos2: false, shcmp: false, shbuild: false, split: false, partw: false, pdraw: false, mtool: false, mrule2: false, pict4: false, bar4: false, chartwhy: false, mfac: false, dint: false, mchart: false, fmodel: false, fline: false, mvol: false, pictg: false, barg: false, rulq: false, lplotq: false, acon: false, gcat: false, gpart: false, gpoly: false, pera: false }, level: 2 },
    tm: { types: { coins: true, madd: true, change: true, clock: false, elapsed: true, conv: true, dclock: false, ampm: false, like: false, cpic: false, cstory: false }, level: 2 },
    mix: { mods: { addsub: true, muldiv: true, fdp: false, ns: true, tm: true } },
    combo,
    std: { g: 'K', c: '' },
    pages: 1, paper: 'letter', nameLine: true, key: true, grey: false, seed: newSeed()
  };
}
globalThis.__SP = { FGEN, NGEN, generateSet, renderAll, defaults, rngFrom, LEVELS, UNITS, TYPE_IDS, geom, svg, carries, borrows, arLayout, needSize, REG, META, comboSections, comboPages, genArithN, genAreaN, TGEN, flowPack, mixLayout, mixItems, STANDARDS, applyStandard, stdList, VGEN, VIS_TYPES, genVisN };

/*==DOM==*/
const $ = s => document.querySelector(s);
const STORE = 'wwwm2000.v1';
const form = $('#form'), sheetsEl = $('#sheets'), stageEl = $('#stage');
const inEnum = (v, list, d) => list.includes(v) ? v : d;

function normalize(s) {
  const d = defaults();
  s = s && typeof s === 'object' ? s : {};
  const combo = {};
  for (const id of Object.keys(REG)) combo[id] = Object.assign(d.combo[id], (s.combo || {})[id] || {});
  const out = Object.assign(d, s, {
    titles: Object.assign(d.titles, s.titles || {}),
    std: { g: inEnum(String((s.std || {}).g), STD_GRADE_IDS, 'K'), c: STD_BY_CODE[(s.std || {}).c] ? s.std.c : '' },
    types: Object.assign(d.types, s.types || {}),
    as: Object.assign(d.as, s.as || {}),
    md: Object.assign(d.md, s.md || {}),
    fd: Object.assign(d.fd, s.fd || {}, { types: Object.assign(d.fd.types, (s.fd || {}).types || {}) }),
    ns: Object.assign(d.ns, s.ns || {}, { types: Object.assign(d.ns.types, (s.ns || {}).types || {}) }),
    tm: Object.assign(d.tm, s.tm || {}, { types: Object.assign(d.tm.types, (s.tm || {}).types || {}) }),
    vis: Object.assign(d.vis, s.vis || {}, { types: Object.assign(d.vis.types, (s.vis || {}).types || {}) }),
    mix: { mods: Object.assign(d.mix.mods, (s.mix || {}).mods || {}) },
    combo
  });
  out.module = inEnum(out.module, Object.keys(MODULES), 'area');
  out.level = inEnum(+out.level, [1, 2, 3], 2);
  out.perPage = inEnum(+out.perPage, [4, 6, 8], 6);
  out.arPerPage = inEnum(+out.arPerPage, [12, 20, 30], 20);
  out.pages = inEnum(+out.pages, [1, 2, 3], 1);
  out.paper = inEnum(out.paper, Object.keys(PAPER), 'letter');
  out.unit = inEnum(out.unit, Object.keys(UNITS), 'units');
  out.as.d1 = inEnum(+out.as.d1, [1, 2, 3, 4], 2);
  out.as.d2 = inEnum(+out.as.d2, [1, 2, 3, 4], 2);
  out.as.addends = inEnum(+out.as.addends, [2, 3, 4], 2);
  out.as.cap = inEnum(+out.as.cap, [0, 10, 20, 30, 100, 1000], 0);
  out.as.second = inEnum(out.as.second, ['digits', 'tens', 'mix'], 'digits');
  out.as.regroup = inEnum(out.as.regroup, ['any', 'required', 'none'], 'any');
  out.as.format = inEnum(out.as.format, ['vertical', 'horizontal'], 'vertical');
  out.md.mode = inEnum(out.md.mode, ['facts', 'digits'], 'facts');
  out.md.da = inEnum(+out.md.da, [1, 2, 3, 4], 2);
  out.md.db = inEnum(+out.md.db, [1, 2, 3], 1);
  out.md.na = inEnum(+out.md.na, [2, 3, 4, 5], 3);
  out.md.nb = inEnum(+out.md.nb, [1, 2], 1);
  out.md.tables = inEnum(+out.md.tables, [5, 9, 10, 12], 10);
  out.md.focus = inEnum(+out.md.focus, [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 0);
  out.md.format = inEnum(out.md.format, ['vertical', 'horizontal'], 'vertical');
  out.fd.level = inEnum(+out.fd.level, [1, 2, 3], 2);
  out.ns.level = inEnum(+out.ns.level, [1, 2, 3], 2);
  out.tm.level = inEnum(+out.tm.level, [1, 2, 3], 2);
  out.vis.level = inEnum(+out.vis.level, [1, 2, 3], 2);
  if (!Object.values(out.vis.types).some(Boolean)) out.vis.types.cnt = true;
  if (!Object.values(out.fd.types).some(Boolean)) out.fd.types.simp = true;
  if (!Object.values(out.ns.types).some(Boolean)) out.ns.types.place = true;
  if (!Object.values(out.mix.mods).some(Boolean)) out.mix.mods.addsub = true;
  if (!Object.values(out.tm.types).some(Boolean)) out.tm.types.coins = true;
  for (const id of Object.keys(REG)) { const c = out.combo[id]; c.on = !!c.on; c.n = inEnum(+c.n, REG[id].counts, REG[id].n0); }
  if (!Object.values(out.combo).some(c => c.on)) out.combo[Object.keys(REG)[0]].on = true;
  if (!out.as.add && !out.as.sub) out.as.add = true;
  if (!out.md.mul && !out.md.div) out.md.mul = true;
  if (!Object.values(out.types).some(Boolean)) out.types.count = true;
  out.grey = !!out.grey;
  if (!out.seed) out.seed = newSeed();
  return out;
}
let state;
try { state = normalize(JSON.parse(localStorage.getItem(STORE) || 'null')); } catch (e) { state = normalize(null); }

$('#mods').innerHTML = Object.keys(MODULES).map(id => `<label class="mod"><input type="radio" name="module" value="${id}"><b>${esc(MODULES[id].name)}</b><small>${esc(MODULES[id].blurb)}</small></label>`).join('');
$('#comboRows').innerHTML = Object.keys(REG).map(id => `<div class="crow"><label class="chk"><input type="checkbox" name="combo_on" value="${id}"><b>${esc(REG[id].name)}</b></label>`
  + `<select name="combo_n" data-id="${id}" aria-label="Problems in ${esc(REG[id].name)}">${REG[id].counts.map(n => `<option value="${n}">${n} problems</option>`).join('')}</select>`
  + `<button type="button" class="btn ghost sm" data-goto="${id}">Settings</button></div>`).join('');
$('#mixRows').innerHTML = MIX_MODS.map(id => `<div class="crow"><label class="chk"><input type="checkbox" name="mix_mod" value="${id}"><b>${esc(MODULES[id].name)}</b></label><button type="button" class="btn ghost sm" data-goto="${id}">Settings</button></div>`).join('');
$('#unit').innerHTML = Object.keys(UNITS).map(k => `<option value="${k}">${UNITS[k].name}</option>`).join('');
$('#md_focus').innerHTML = '<option value="0">All tables in the range</option>' + [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => `<option value="${n}">The ${n}s table</option>`).join('');

const val = n => { const c = form.querySelector(`input[name="${n}"]:checked`); return c ? c.value : null; };
const checksOf = n => { const o = {}; form.querySelectorAll(`input[name="${n}"]`).forEach(i => { o[i.value] = i.checked; }); return o; };
const setRadio = (n, v) => form.querySelectorAll(`input[name="${n}"]`).forEach(i => { i.checked = String(v) === i.value; });
const setChecks = (n, o) => form.querySelectorAll(`input[name="${n}"]`).forEach(i => { i.checked = !!o[i.value]; });
function ensureOne(obj, changed, name, fallback) {
  if (Object.values(obj).some(Boolean)) return obj;
  if (changed && changed.name === name) { changed.checked = true; obj[changed.value] = true; } else obj[fallback] = true;
  return obj;
}
const dWord = n => `${n}-digit`;
const TM_NOTES = {
  1: 'Coins under one dollar, sums to 99¢, change from $1, clocks on the hour and half hour, and whole-number conversions.',
  2: 'Dollar bills with coins, amounts to $10, change from $5 or $10, clocks to 5 minutes, and elapsed time to 5 minutes.',
  3: 'Amounts to $100, change from $10, $20 or $50, clocks to the minute, elapsed time across noon, and compound conversions.'
};
const FD_NOTES = {
  1: 'Fractions with denominators to 12, like denominators for addition, tenths in decimals, and common percents.',
  2: 'Unlike denominators where one divides the other, hundredths, and percents in steps of 5.',
  3: 'Any denominators to 12, mixed-number answers, decimal products and quotients, and any whole percent.'
};
const VIS_NOTES = {
  1: 'Counts to 10, two choices, within 5 for picture equations, rulers to 6, graphs with one picture per item.',
  2: 'Counts to 20, three choices, within 10 for picture equations, rulers to 10, symbols worth 2.',
  3: 'Mixes counting, drawing and number words; rulers to 12 with objects that do not start at 0; draw graphs and line plots.'
};
const NS_NOTES = {
  1: 'Numbers to 999, rounding to tens, skip counting by 2, 5 and 10, and number lines to 10.',
  2: 'Numbers to 99,999, rounding to tens, hundreds and thousands, and number lines by 2, 5 and 10.',
  3: 'Numbers to 999,999 and decimals to thousandths, number lines in tenths, and estimating sums, differences and products.'
};

let stdQuery = '';
function writeStdList() {
  const q = stdQuery.trim().toLowerCase();
  const rows = STD_ALL.filter(r => q ? (r[0] + ' ' + r[1] + ' ' + r[2]).toLowerCase().includes(q) : stdGrade(r[0]) === state.std.g);
  const badge = p => !p ? ['gap', 'Not yet'] : p.n ? ['part', 'Partial'] : ['ok', 'Ready'];
  $('#stdList').innerHTML = rows.length ? rows.map(r => {
    const p = STD_BY_CODE[r[0]], b = badge(p), on = r[0] === state.std.c;
    return `<button type="button" class="std ${b[0]}${on ? ' on' : ''}" data-std="${r[0]}"${p ? '' : ' disabled'}${on ? ' aria-pressed="true"' : ''}><span class="sc">${r[0]}</span><span class="st">${esc(r[1])}</span><span class="sb">${b[1]}</span></button>`;
  }).join('') : '<p class="note">No standards match.</p>';
}
function writeStd() {
  $('#stdGrades').innerHTML = STD_GRADE_IDS.map(id => `<label><input type="radio" name="stdGrade" value="${id}"${state.std.g === id ? ' checked' : ''}><span title="${STD_GRADES[id]}">${id}</span></label>`).join('');
  writeStdList();
  const s = STD_BY_CODE[state.std.c];
  $('#stdCur').textContent = s ? s.c : '';
  $('#stdNote').textContent = s ? `${s.c}: ${s.n ? 'Partial match. ' + s.n : 'The settings match this standard.'}` : 'Pick a standard to set the module, problem types and level. "Not yet" standards need a problem type this maker does not have.';
}
function writeForm() {
  writeStd();
  setRadio('module', state.module);
  setChecks('type', state.types); setRadio('level', state.level); $('#unit').value = state.unit;
  setChecks('as_ops', { add: state.as.add, sub: state.as.sub });
  setRadio('as_d1', state.as.d1); setRadio('as_d2', state.as.d2); setRadio('as_addends', state.as.addends); setRadio('as_regroup', state.as.regroup); setRadio('as_format', state.as.format); setRadio('as_cap', state.as.cap); setRadio('as_second', state.as.second);
  setChecks('md_ops', { mul: state.md.mul, div: state.md.div });
  form.elements.md_rem.checked = !!state.md.rem;
  setRadio('md_mode', state.md.mode); setRadio('md_da', state.md.da); setRadio('md_db', state.md.db); setRadio('md_na', state.md.na); setRadio('md_nb', state.md.nb);
  $('#md_tables').value = String(state.md.tables); $('#md_focus').value = String(state.md.focus); setRadio('md_format', state.md.format);
  setChecks('fd_type', state.fd.types); setRadio('fd_level', state.fd.level);
  setChecks('ns_type', state.ns.types); setRadio('ns_level', state.ns.level);
  setChecks('tm_type', state.tm.types); setRadio('tm_level', state.tm.level);
  setChecks('vis_type', state.vis.types); setRadio('vis_level', state.vis.level);
  setChecks('mix_mod', state.mix.mods);
  const on = {}; for (const id of Object.keys(REG)) on[id] = state.combo[id].on;
  setChecks('combo_on', on);
  form.querySelectorAll('select[name="combo_n"]').forEach(s => { s.value = String(state.combo[s.dataset.id].n); });
  setRadio('perPage', state.perPage); setRadio('arPerPage', state.arPerPage); setRadio('pages', state.pages); setRadio('paper', state.paper);
  for (const n of ['nameLine', 'shade', 'key', 'grey']) form.elements[n].checked = !!state[n];
  form.elements.seed.value = state.seed;
  syncModuleUI();
}
function syncModuleUI() {
  form.elements.title.value = state.titles[state.module];
  document.querySelectorAll('[data-mod]').forEach(el => { el.hidden = !el.dataset.mod.split(' ').includes(state.module); });
  form.querySelectorAll('.mod').forEach(l => l.classList.toggle('on', l.querySelector('input').checked));
  const M = state.md, A = state.as, digits = M.mode === 'digits';
  form.querySelectorAll('[data-md]').forEach(el => {
    const k = el.dataset.md;
    el.hidden = !(k === 'facts' ? !digits : k === 'mul' ? digits && M.mul : digits && M.div);
  });
  const adds = A.add;
  $('#asAddends').classList.toggle('dis', !adds);
  form.querySelectorAll('input[name="as_addends"]').forEach(i => { i.disabled = !adds; });
  $('#md_tables').disabled = !!M.focus;
  form.querySelectorAll('select[name="combo_n"]').forEach(s => { s.disabled = !state.combo[s.dataset.id].on; });
  $('#levelNote').textContent = LEVELS[state.level].note;
  $('#fdNote').textContent = FD_NOTES[state.fd.level];
  $('#nsNote').textContent = NS_NOTES[state.ns.level];
  $('#tmNote').textContent = TM_NOTES[state.tm.level];
  $('#visNote').textContent = VIS_NOTES[state.vis.level];
  $('#asNote').textContent = A.cap && A.cap <= 30
    ? `Within ${A.cap}: every number from 1 to ${A.cap} is used, so the digit settings do not apply.`
    : A.cap ? `Within ${A.cap}: sums and starting numbers never pass ${A.cap}; numbers are shortened when they cannot fit.`
    : A.sub && A.d2 > A.d1 ? 'In subtraction the second number keeps at most as many digits as the first.'
    : (A.d1 === 1 && A.sub ? 'One-digit subtraction stays within 18.' : 'Always and never refer to carrying in addition and borrowing in subtraction.');
  const parts = [];
  if (digits) {
    if (M.mul) parts.push(`Multiplication: ${dWord(M.da)} by ${dWord(M.db)}.`);
    if (M.div) parts.push(`Division: ${dWord(Math.max(M.na, M.nb + 1))} by ${dWord(M.nb)}.`);
    if (M.div) parts.push('The dividend needs at least one more digit than the divisor.');
  } else parts.push('Facts from the times tables. Division answers are whole numbers.');
  $('#mdNote').textContent = parts.join(' ');
}
function readForm(changed) {
  if (changed && changed.name === 'module') { state.module = val('module') || state.module; return; }
  state.types = ensureOne(checksOf('type'), changed, 'type', 'count');
  state.level = +val('level') || state.level;
  state.unit = $('#unit').value;
  const ao = ensureOne(checksOf('as_ops'), changed, 'as_ops', 'add');
  state.as = { add: !!ao.add, sub: !!ao.sub, d1: +val('as_d1') || state.as.d1, d2: +val('as_d2') || state.as.d2, addends: +val('as_addends') || state.as.addends, regroup: val('as_regroup') || state.as.regroup, format: val('as_format') || state.as.format, cap: +val('as_cap') || 0, second: val('as_second') || state.as.second };
  const mo = ensureOne(checksOf('md_ops'), changed, 'md_ops', 'mul');
  state.md = { mul: !!mo.mul, div: !!mo.div, rem: form.elements.md_rem.checked, mode: val('md_mode') || state.md.mode,
    da: +val('md_da') || state.md.da, db: +val('md_db') || state.md.db, na: +val('md_na') || state.md.na, nb: +val('md_nb') || state.md.nb,
    tables: +$('#md_tables').value, focus: +$('#md_focus').value, format: val('md_format') || state.md.format };
  state.fd = { types: ensureOne(checksOf('fd_type'), changed, 'fd_type', 'simp'), level: +val('fd_level') || state.fd.level };
  state.ns = { types: ensureOne(checksOf('ns_type'), changed, 'ns_type', 'place'), level: +val('ns_level') || state.ns.level };
  state.tm = { types: ensureOne(checksOf('tm_type'), changed, 'tm_type', 'coins'), level: +val('tm_level') || state.tm.level };
  state.vis = { types: ensureOne(checksOf('vis_type'), changed, 'vis_type', 'cnt'), level: +val('vis_level') || state.vis.level };
  state.mix = { mods: ensureOne(checksOf('mix_mod'), changed, 'mix_mod', 'addsub') };
  const co = ensureOne(checksOf('combo_on'), changed, 'combo_on', Object.keys(REG)[0]);
  for (const id of Object.keys(REG)) state.combo[id].on = !!co[id];
  form.querySelectorAll('select[name="combo_n"]').forEach(s => { state.combo[s.dataset.id].n = +s.value; });
  state.perPage = +val('perPage') || state.perPage;
  state.arPerPage = +val('arPerPage') || state.arPerPage;
  state.pages = +val('pages') || state.pages;
  state.paper = val('paper') || state.paper;
  for (const n of ['nameLine', 'shade', 'key', 'grey']) state[n] = form.elements[n].checked;
  state.titles[state.module] = form.elements.title.value;
  const sd = form.elements.seed.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (sd) state.seed = sd;
}
function fit() {
  const w = PAPER[state.paper].w * 96, avail = stageEl.clientWidth;
  sheetsEl.style.setProperty('--zoom', Math.min(1, avail / w).toFixed(4));
}
function render() {
  $('#pageRule').textContent = `@page{size:${PAPER[state.paper].w}in ${PAPER[state.paper].h}in;margin:0}`;
  sheetsEl.classList.toggle('grey', !!state.grey);
  sheetsEl.innerHTML = coinDefs() + renderAll(state);
  $('#summary').textContent = [MODULES[state.module].name, `${META.problems} problems`, `${META.pages} page${META.pages === 1 ? '' : 's'}`, PAPER[state.paper].name,
    state.key ? 'answer key included' : '', META.note].filter(Boolean).join(' · ');
  fit();
}
function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* ignore */ } }

form.addEventListener('submit', e => e.preventDefault());
const CLEARS_STD = /^(module|type|level|as_|md_|fd_|ns_|tm_|vis_)/;
form.addEventListener('input', e => {
  const nm = e.target.name || '';
  if (nm === 'stdGrade') { state.std.g = e.target.value; stdQuery = ''; $('#stdQ').value = ''; save(); writeStdList(); return; }
  if (nm === 'stdQ') { stdQuery = e.target.value; writeStdList(); return; }
  if (CLEARS_STD.test(nm) && state.std.c) { state.std.c = ''; writeStd(); }
  readForm(e.target); syncModuleUI(); save(); render(); });
form.addEventListener('click', e => {
  const r = e.target.closest('[data-std]');
  if (r && !r.disabled) { state.std = { g: stdGrade(r.dataset.std), c: r.dataset.std }; applyStandard(state, state.std.c); save(); writeForm(); render(); return; }
  const b = e.target.closest('[data-goto]'); if (!b) return;
  state.module = b.dataset.goto; save(); writeForm(); render();
});
form.elements.seed.addEventListener('blur', () => { form.elements.seed.value = state.seed; });
$('#newSet').addEventListener('click', () => { state.seed = newSeed(); form.elements.seed.value = state.seed; save(); render(); });
const printBtn = document.getElementById('printBtn');
/* Coins loaded from files (site build) must be in the browser cache before printing; embedded coins resolve at once. */
if (printBtn) printBtn.addEventListener('click', () => {
  const urls = Object.values(COIN_IMG).reduce((a, o) => a.concat([o.c, o.g]), []).filter(s => !s.startsWith('data:'));
  Promise.all(urls.map(s => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = s; }))).then(() => window.print());
});
/* Defer to the next frame: fit() changes the zoom, which resizes the stage inside the observer callback and raises "ResizeObserver loop completed with undelivered notifications". */
if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => requestAnimationFrame(fit)).observe(stageEl);

writeForm();
render();

/* Theme: light, dark or disco. Stored per browser; falls back to the system setting. */
const THEME_KEY = 'wm2000-theme';
function setTheme(t, keep) {
  document.documentElement.setAttribute('data-theme', t);
  document.querySelectorAll('[data-theme-set]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.themeSet === t)));
  if (keep) { try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* ignore */ } }
}
(function () {
  let t = null;
  try { t = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
  if (!['light', 'dark', 'disco'].includes(t)) t = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  setTheme(t, false);
  const box = document.getElementById('themes');
  if (box) box.addEventListener('click', e => { const b = e.target.closest('[data-theme-set]'); if (b) setTheme(b.dataset.themeSet, true); });
})();

/* Easter egg: typing 2319 as the set code plays a short emergency animation. */
let emgEl = null;
function emergency() {
  if (emgEl) return;
  emgEl = document.createElement('div');
  emgEl.className = 'emg'; emgEl.setAttribute('role', 'alert');
  emgEl.innerHTML = '<div class="stripe top"></div><div class="stripe bot"></div><div class="box"><div class="big">EMERGENCY</div><div class="sub">CODE 2319</div></div>';
  const done = () => { if (emgEl) { emgEl.remove(); emgEl = null; } };
  emgEl.addEventListener('click', done);
  emgEl.addEventListener('animationend', e => { if (e.animationName === 'emgOut') done(); });
  document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { done(); document.removeEventListener('keydown', esc); } });
  document.body.appendChild(emgEl);
  setTimeout(done, 3400);
}
form.elements.seed.addEventListener('input', e => { if (e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') === '2319') emergency(); });
