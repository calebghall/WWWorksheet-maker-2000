function defaults() {
  const combo = {}; for (const id of Object.keys(REG)) combo[id] = { on: REG[id].on0 !== false, n: REG[id].n0 };
  return {
    module: 'area',
    titles: { area: 'Area Squares', addsub: 'Addition and Subtraction', muldiv: 'Multiplication and Division', fdp: 'Fractions, Decimals and Percents', ns: 'Number Sense', tm: 'Time and Money', vis: 'Shapes, Measures and Data', mix: 'Mixed Practice', combo: 'Math Practice' },
    types: { count: true, mult: true, draw: true, cmp: true, lsh: false }, level: 2, perPage: 6, unit: 'units', shade: true,
    arPerPage: 20,
    as: { add: true, sub: true, d1: 2, d2: 2, addends: 2, regroup: 'any', format: 'vertical', cap: 0, second: 'digits' },
    md: { mul: true, div: true, mode: 'facts', tables: 10, focus: 0, rem: false, da: 2, db: 1, alt: false, da2: 2, db2: 2, na: 3, nb: 1, format: 'vertical' },
    fd: { types: { simp: true, equiv: true, cmp: true, fadd: true, fmul: false, decadd: true, decmul: false, conv: true, pct: true }, level: 2 },
    ns: { types: typeDefaults('ns'), level: 2 },
    vis: { types: typeDefaults('vis'), level: 2 },
    tm: { types: { coins: true, madd: true, change: true, clock: false, elapsed: true, conv: true, dclock: false, ampm: false, like: false, cpic: false, cstory: false }, level: 2 },
    mix: { mods: { addsub: true, muldiv: true, fdp: false, ns: true, tm: true } },
    combo,
    std: { g: 'K', c: '' },
    parts: null,
    pages: 1, paper: 'letter', nameLine: true, key: true, grey: false, seed: newSeed()
  };
}
/* Pre-filled GitHub issue for the current worksheet: set code, module and every setting needed to rebuild the same problems.
   Opens the issue form (.github/ISSUE_TEMPLATE/bug.yml); the person reviews and submits it. Falls back to the basics if the URL would be too long. */
const ISSUES_URL = 'https://github.com/calebghall/WWWorksheet-maker-2000/issues/new';
function bugReportUrl(st, agent) {
  const mod = (typeof MODULES !== 'undefined' && MODULES[st.module]) ? MODULES[st.module].name : st.module;
  const full = Object.assign({}, st); delete full.titles;
  const q = settings => ISSUES_URL + '?' + [['template', 'bug.yml'], ['title', `Problem with ${mod} worksheet (set ${st.seed})`], ['set_code', st.seed], ['settings', settings], ['browser', agent || '']]
    .map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
  const url = q(JSON.stringify(full));
  if (url.length <= 6000) return url;
  const withParts = q(JSON.stringify({ module: st.module, seed: st.seed, level: st.level, std: st.std, parts: st.parts, combo: st.combo }));
  return withParts.length <= 6000 ? withParts : q(JSON.stringify({ module: st.module, seed: st.seed, level: st.level, std: st.std }));
}
globalThis.__SP = { bugReportUrl, FGEN, NGEN, generateSet, renderAll, defaults, rngFrom, LEVELS, UNITS, TYPE_IDS, geom, svg, carries, borrows, arLayout, needSize, REG, META, comboSections, comboPages, genArithN, genAreaN, TGEN, flowPack, mixLayout, mixItems, STANDARDS, applyStandard, stdList, VGEN, VIS_TYPES, genVisN, partsOf, makePart, normPart, normParts, partState, captureSettings, applyModSettings };

/*==DOM==*/
const $ = s => document.querySelector(s);
const STORE = 'wwwm2000.v1';
const form = $('#form'), sheetsEl = $('#sheets'), stageEl = $('#stage');
/* The Number Sense and Shapes, Measures and Data checkboxes are built from the type registry (core/types.js), grouped by family. */
function buildTypePanels() {
  for (const mod of ['ns', 'vis']) {
    const host = document.querySelector(`[data-types="${mod}"]`); if (!host) continue;
    const groups = [];
    for (const d of TYPE_DEFS[mod]) { let g = groups.find(h => h.family === d.family); if (!g) groups.push(g = { family: d.family, defs: [] }); g.defs.push(d); }
    host.innerHTML = groups.map(g => `<div class="tgroup"><div class="tgroup-h">${g.family}</div>${g.defs.map(d => `<label class="chk"><input type="checkbox" name="${mod}_type" value="${d.id}"><b>${d.label}</b><small>${d.blurb}</small></label>`).join('')}</div>`).join('');
  }
}
buildTypePanels();

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
  out.perPage = inEnum(+out.perPage, [4, 6, 8], 6);
  out.arPerPage = inEnum(+out.arPerPage, [12, 20, 30], 20);
  out.pages = inEnum(+out.pages, [1, 2, 3], 1);
  out.paper = inEnum(out.paper, Object.keys(PAPER), 'letter');
  clampMod(out);
  for (const id of Object.keys(REG)) { const c = out.combo[id]; c.on = !!c.on; c.n = inEnum(+c.n, REG[id].counts, REG[id].n0); }
  if (!Object.values(out.combo).some(c => c.on)) out.combo[Object.keys(REG)[0]].on = true;
  out.parts = normParts(s.parts);
  out.grey = !!out.grey;
  if (!out.seed) out.seed = newSeed();
  return out;
}
let state;
try { state = normalize(JSON.parse(localStorage.getItem(STORE) || 'null')); } catch (e) { state = normalize(null); }

const SINGLE_MODS = Object.keys(MODULES).filter(id => id !== 'combo' && id !== 'mix');
$('#mods').innerHTML = SINGLE_MODS.map(id => `<label class="mod"><input type="radio" name="module" value="${id}"><b>${esc(MODULES[id].name)}</b><small>${esc(MODULES[id].blurb)}</small></label>`).join('');
$('#addPartMod').innerHTML = SINGLE_MODS.map(id => `<option value="${id}">${esc(MODULES[id].name)}</option>`).join('');
$('#addPartMod').value = 'addsub';
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
  const badge = p => !p ? ['gap', 'Not yet'] : p.n ? ['part', 'Partial'] : ['ok', ''];
  $('#stdList').innerHTML = rows.length ? rows.map(r => {
    const p = STD_BY_CODE[r[0]], b = badge(p), on = r[0] === state.std.c;
    const left = `<span class="sl"><span class="sc">${r[0]}</span>${b[1] ? `<span class="sb">${b[1]}</span>` : ''}</span>`;
    return `<button type="button" class="std ${b[0]}${on ? ' on' : ''}" data-std="${r[0]}"${p ? '' : ' disabled'}${on ? ' aria-pressed="true"' : ''}>${left}<span class="st">${esc(r[1])}</span></button>`;
  }).join('') : '<p class="note">No standards match.</p>';
}
function writeStd() {
  $('#stdGrades').innerHTML = STD_GRADE_IDS.map(id => `<label><input type="radio" name="stdGrade" value="${id}"${state.std.g === id ? ' checked' : ''}><span title="${STD_GRADES[id]}">${id}</span></label>`).join('');
  $('#stdFw').textContent = FRAMEWORK.name;
  writeStdList();
  const s = STD_BY_CODE[state.std.c];
  $('#stdCur').textContent = s ? s.c : '';
  $('#stdNote').textContent = s ? `${s.c}: ${s.n ? 'Partial match. ' + s.n : 'The settings match this standard.'}` : 'Pick a standard to set the module, problem types and level. "Not yet" standards need a problem type this maker does not have.';
}
let lastSingleMod = (state.module === 'combo' || state.module === 'mix') ? 'area' : state.module;
let lastMultiMod = state.module === 'mix' ? 'mix' : 'combo';
let editIdx = null;
function ensureMultiParts() {
  if (state.parts && state.parts.length) return;
  if (state.module === 'mix') {
    const ms = MIX_MODS.filter(id => state.mix.mods[id]);
    state.parts = (ms.length ? ms : ['addsub']).map(m => makePart(state, m, REG[m].n0));
  } else {
    const ps = partsOf(state);
    state.parts = (ps.length ? ps : [makePart(state, lastSingleMod)]).map(p => makePart(state, p.m, p.n));
  }
}
if (state.module === 'combo' || state.module === 'mix') ensureMultiParts();

function editingPart() {
  if (editIdx === null || !state.parts || !state.parts[editIdx]) { editIdx = null; return null; }
  return state.parts[editIdx];
}

function writeForm() {
  writeStd();
  const ep = editingPart(), fsState = ep ? partState(state, ep) : state;
  const isMulti = state.module === 'combo' || state.module === 'mix';
  setRadio('wkMode', isMulti ? 'multi' : 'single');
  setRadio('module', isMulti ? lastSingleMod : state.module);
  setRadio('multi_view', state.module === 'mix' ? 'mix' : 'combo');
  setChecks('type', fsState.types); setRadio('level', fsState.level); $('#unit').value = fsState.unit;
  setChecks('as_ops', { add: fsState.as.add, sub: fsState.as.sub });
  setRadio('as_d1', fsState.as.d1); setRadio('as_d2', fsState.as.d2); setRadio('as_addends', fsState.as.addends); setRadio('as_regroup', fsState.as.regroup); setRadio('as_format', fsState.as.format); setRadio('as_cap', fsState.as.cap); setRadio('as_second', fsState.as.second);
  setChecks('md_ops', { mul: fsState.md.mul, div: fsState.md.div });
  form.elements.md_rem.checked = !!fsState.md.rem;
  setRadio('md_mode', fsState.md.mode); setRadio('md_da', fsState.md.da); setRadio('md_db', fsState.md.db); form.elements.md_alt.checked = !!fsState.md.alt; setRadio('md_da2', fsState.md.da2); setRadio('md_db2', fsState.md.db2); setRadio('md_na', fsState.md.na); setRadio('md_nb', fsState.md.nb);
  $('#md_tables').value = String(fsState.md.tables); $('#md_focus').value = String(fsState.md.focus); setRadio('md_format', fsState.md.format);
  setChecks('fd_type', fsState.fd.types); setRadio('fd_level', fsState.fd.level);
  setChecks('ns_type', fsState.ns.types); setRadio('ns_level', fsState.ns.level);
  setChecks('tm_type', fsState.tm.types); setRadio('tm_level', fsState.tm.level);
  setChecks('vis_type', fsState.vis.types); setRadio('vis_level', fsState.vis.level);
  setRadio('perPage', state.perPage); setRadio('arPerPage', state.arPerPage); setRadio('pages', state.pages); setRadio('paper', state.paper);
  for (const n of ['nameLine', 'shade', 'key', 'grey']) form.elements[n].checked = !!state[n];
  form.elements.seed.value = state.seed;
  syncModuleUI();
}

function writeParts() {
  const parts = state.parts || [], isMix = state.module === 'mix';
  const mixSum = isMix ? parts.filter(p => MIX_MODS.includes(p.m)).reduce((a, p) => a + p.n, 0) : 0;
  const canMix = parts.some(p => MIX_MODS.includes(p.m));
  const mixR = form.querySelector('input[name="multi_view"][value="mix"]');
  if (mixR) mixR.disabled = !canMix;
  const heading = $('#partsHeading');
  if (heading) heading.textContent = isMix ? 'Topics & shares' : 'Sections';
  $('#partsList').innerHTML = parts.map((p, i) => {
    const L = String.fromCharCode(65 + i), mixable = MIX_MODS.includes(p.m);
    const badge = isMix ? (mixable && mixSum ? `${Math.round(100 * p.n / mixSum)}%` : '—') : L;
    const sel = `<select name="partRowN" aria-label="${isMix ? 'Share weight' : 'Problems'} for part ${L}">${REG[p.m].counts.map(n => `<option value="${n}"${n === p.n ? ' selected' : ''}>${isMix ? `Share ${n}` : `${n} problems`}</option>`).join('')}</select>`;
    const btn = (act, txt, label, dis) => `<button type="button" class="btn ghost sm" data-part-act="${act}" aria-label="${label} part ${L}"${dis ? ' disabled' : ''}>${txt}</button>`;
    const sub = `${esc(REG[p.m].name)}${isMix && !mixable ? ' · <em>Sections only</em>' : ''}`;
    return `<li class="pr" data-i="${i}"><span class="pl">${badge}</span><div class="pr-f"><input type="text" name="partRowLabel" maxlength="60" value="${esc(p.label || '')}" placeholder="${esc(REG[p.m].name)}" aria-label="Label of part ${L}"><div class="pr-sub">${sub}</div>${sel}<span class="pr-b">${btn('edit', 'Settings', 'Settings for')}${btn('up', '↑', 'Move up', i === 0)}${btn('down', '↓', 'Move down', i === parts.length - 1)}${btn('del', '×', 'Delete', parts.length <= 1)}</span></div></li>`;
  }).join('');
  $('#partAdd').disabled = parts.length >= PART_MAX;
  const hasBlocked = isMix && parts.some(p => !MIX_MODS.includes(p.m));
  $('#multiNote').textContent = !canMix
    ? 'Area Squares and Shapes, Measures and Data only print in sections.'
    : isMix
      ? 'Problems are shuffled together and packed by size. Each topic\'s Share controls how much of the sheet it gets.' + (hasBlocked ? ' Topics marked "Sections only" stay out until you switch back to In sections.' : '')
      : 'Each part prints as a lettered section (Part A, Part B, ...) with its own settings.';
  const ep = editingPart();
  if (ep) {
    const L = String.fromCharCode(65 + editIdx);
    $('#partDrawerTag').textContent = `${isMix ? 'Editing' : `Part ${L}`} · ${REG[ep.m].name}`;
    if (document.activeElement !== $('#editPartLabel')) $('#editPartLabel').value = ep.label || '';
    $('#editPartNLbl').textContent = isMix ? 'Share' : 'Problems';
    $('#editPartN').innerHTML = REG[ep.m].counts.map(n => `<option value="${n}"${n === ep.n ? ' selected' : ''}>${isMix ? `Share ${n}` : `${n} problems`}</option>`).join('');
    $('#editPartN').value = String(ep.n);
  }
}

function syncModuleUI() {
  const ep = editingPart(), fsState = ep ? partState(state, ep) : state;
  const activeMod = ep ? ep.m : state.module;
  const isMulti = state.module === 'combo' || state.module === 'mix';
  $('#panelMain').hidden = !!ep;
  $('#partDrawer').hidden = !ep;
  document.querySelectorAll('[data-chrome]').forEach(el => { el.hidden = !!ep; });
  $('#mods').hidden = isMulti;
  form.elements.title.value = state.titles[state.module];
  document.querySelectorAll('[data-mod]').forEach(el => { el.hidden = !el.dataset.mod.split(' ').includes(activeMod); });
  form.querySelectorAll('.mod').forEach(l => l.classList.toggle('on', l.querySelector('input').checked));
  const M = fsState.md, A = fsState.as, digits = M.mode === 'digits';
  form.querySelectorAll('[data-md]').forEach(el => {
    const k = el.dataset.md;
    el.hidden = !(k === 'facts' ? !digits : k === 'mul' ? digits && M.mul : k === 'alt' ? digits && M.mul && M.alt : digits && M.div);
  });
  const adds = A.add;
  $('#asAddends').classList.toggle('dis', !adds);
  form.querySelectorAll('input[name="as_addends"]').forEach(i => { i.disabled = !adds; });
  $('#md_tables').disabled = !!M.focus;
  writeParts();
  $('#levelNote').textContent = LEVELS[fsState.level].note;
  $('#fdNote').textContent = FD_NOTES[fsState.fd.level];
  $('#nsNote').textContent = NS_NOTES[fsState.ns.level];
  $('#tmNote').textContent = TM_NOTES[fsState.tm.level];
  $('#visNote').textContent = VIS_NOTES[fsState.vis.level];
  $('#asNote').textContent = A.cap && A.cap <= 30
    ? `Within ${A.cap}: every number from 1 to ${A.cap} is used, so the digit settings do not apply.`
    : A.cap ? `Within ${A.cap}: sums and starting numbers never pass ${A.cap}; numbers are shortened when they cannot fit.`
    : A.sub && A.d2 > A.d1 ? 'In subtraction the second number keeps at most as many digits as the first.'
    : (A.d1 === 1 && A.sub ? 'One-digit subtraction stays within 18.' : 'Always and never refer to carrying in addition and borrowing in subtraction.');
  const parts = [];
  if (digits) {
    if (M.mul) parts.push(M.alt ? `Multiplication: ${dWord(M.da)} by ${dWord(M.db)}, or ${dWord(M.da2)} by ${dWord(M.db2)}.` : `Multiplication: ${dWord(M.da)} by ${dWord(M.db)}.`);
    if (M.div) parts.push(`Division: ${dWord(Math.max(M.na, M.nb + 1))} by ${dWord(M.nb)}.`);
    if (M.div) parts.push('The dividend needs at least one more digit than the divisor.');
  } else parts.push('Facts from the times tables. Division answers are whole numbers.');
  $('#mdNote').textContent = parts.join(' ');
}

function readModFields(target, changed) {
  target.types = ensureOne(checksOf('type'), changed, 'type', 'count');
  target.level = +val('level') || target.level;
  target.unit = $('#unit').value;
  const ao = ensureOne(checksOf('as_ops'), changed, 'as_ops', 'add');
  target.as = { add: !!ao.add, sub: !!ao.sub, d1: +val('as_d1') || target.as.d1, d2: +val('as_d2') || target.as.d2, addends: +val('as_addends') || target.as.addends, regroup: val('as_regroup') || target.as.regroup, format: val('as_format') || target.as.format, cap: +val('as_cap') || 0, second: val('as_second') || target.as.second };
  const mo = ensureOne(checksOf('md_ops'), changed, 'md_ops', 'mul');
  target.md = { mul: !!mo.mul, div: !!mo.div, rem: form.elements.md_rem.checked, mode: val('md_mode') || target.md.mode,
    da: +val('md_da') || target.md.da, db: +val('md_db') || target.md.db, alt: form.elements.md_alt.checked, da2: +val('md_da2') || target.md.da2, db2: +val('md_db2') || target.md.db2, na: +val('md_na') || target.md.na, nb: +val('md_nb') || target.md.nb,
    tables: +$('#md_tables').value, focus: +$('#md_focus').value, format: val('md_format') || target.md.format };
  target.fd = { types: ensureOne(checksOf('fd_type'), changed, 'fd_type', 'simp'), level: +val('fd_level') || target.fd.level };
  target.ns = { types: ensureOne(checksOf('ns_type'), changed, 'ns_type', 'place'), level: +val('ns_level') || target.ns.level };
  target.tm = { types: ensureOne(checksOf('tm_type'), changed, 'tm_type', 'coins'), level: +val('tm_level') || target.tm.level };
  target.vis = { types: ensureOne(checksOf('vis_type'), changed, 'vis_type', 'cnt'), level: +val('vis_level') || target.vis.level };
}

function readForm(changed) {
  const ep = editingPart();
  if (ep) {
    const tmp = partState(state, ep);
    readModFields(tmp, changed);
    Object.assign(ep, captureSettings(tmp, ep.m));
    return;
  }
  readModFields(state, changed);
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
  if (nm === 'addPartMod') return;
  if (nm === 'wkMode') {
    editIdx = null;
    if (e.target.value === 'multi') {
      ensureMultiParts();
      state.module = (lastMultiMod === 'mix' && state.parts.some(p => MIX_MODS.includes(p.m))) ? 'mix' : 'combo';
    } else {
      if (state.module === 'combo' || state.module === 'mix') lastMultiMod = state.module;
      state.module = lastSingleMod;
    }
    if (state.std.c) state.std.c = '';
    save(); writeForm(); render(); return;
  }
  if (nm === 'module') {
    editIdx = null;
    state.module = val('module') || state.module;
    lastSingleMod = state.module;
    if (state.std.c) state.std.c = '';
    save(); writeForm(); render(); return;
  }
  if (nm === 'multi_view') {
    editIdx = null;
    const v = val('multi_view');
    if (v === 'mix' && !(state.parts || []).some(p => MIX_MODS.includes(p.m))) { writeForm(); return; }
    state.module = lastMultiMod = v || 'combo';
    if (state.std.c) state.std.c = '';
    save(); writeForm(); render(); return;
  }
  if (nm === 'editPartLabel' || nm === 'editPartN') {
    const ep = editingPart(); if (!ep) return;
    if (nm === 'editPartLabel') ep.label = e.target.value.slice(0, 60);
    else ep.n = inEnum(+e.target.value, REG[ep.m].counts, REG[ep.m].n0);
    if (state.std.c) { state.std.c = ''; writeStd(); }
    save(); render(); return;
  }
  if (nm === 'partRowLabel' || nm === 'partRowN') {
    const li = e.target.closest('[data-i]'), p = li && (state.parts || [])[+li.dataset.i];
    if (!p) return;
    if (nm === 'partRowLabel') p.label = e.target.value.slice(0, 60); else p.n = inEnum(+e.target.value, REG[p.m].counts, REG[p.m].n0);
    if (state.std.c) { state.std.c = ''; writeStd(); }
    save(); if (state.module === 'mix' && nm === 'partRowN') writeParts(); render(); return;
  }
  if (nm === 'stdGrade') { state.std.g = e.target.value; stdQuery = ''; $('#stdQ').value = ''; save(); writeStdList(); return; }
  if (nm === 'stdQ') { stdQuery = e.target.value; writeStdList(); return; }
  if (CLEARS_STD.test(nm) && state.std.c) { state.std.c = ''; writeStd(); }
  readForm(e.target); syncModuleUI(); save(); render();
});

function partAction(e) {
  const ab = e.target.closest('[data-part-act], #partAdd, #partDone'); if (!ab) return false;
  const parts = (state.parts || []).slice(), after = () => { if (state.std.c) state.std.c = ''; save(); writeForm(); render(); };
  if (ab.id === 'partDone') { editIdx = null; writeForm(); form.closest('.panel').scrollTop = 0; return true; }
  if (ab.id === 'partAdd') {
    if (parts.length >= PART_MAX) return true;
    const m = $('#addPartMod').value;
    state.parts = parts.concat(makePart(state, m, REG[m].n0));
    after(); return true;
  }
  const i = +ab.closest('[data-i]').dataset.i, act = ab.dataset.partAct;
  if (!parts[i]) return true;
  if (act === 'up' && i > 0) [parts[i - 1], parts[i]] = [parts[i], parts[i - 1]];
  else if (act === 'down' && i < parts.length - 1) [parts[i + 1], parts[i]] = [parts[i], parts[i + 1]];
  else if (act === 'del' && parts.length > 1) parts.splice(i, 1);
  else if (act === 'edit') { editIdx = i; writeForm(); form.closest('.panel').scrollTop = 0; return true; }
  if (act !== 'edit') editIdx = null;
  state.parts = parts;
  if (state.module === 'mix' && !parts.some(p => MIX_MODS.includes(p.m))) state.module = lastMultiMod = 'combo';
  after(); return true;
}

form.addEventListener('click', e => {
  if (partAction(e)) return;
  const r = e.target.closest('[data-std]');
  if (r && !r.disabled) {
    editIdx = null;
    state.std = { g: stdGrade(r.dataset.std), c: r.dataset.std };
    applyStandard(state, state.std.c);
    if (state.module === 'combo' || state.module === 'mix') lastMultiMod = state.module;
    else lastSingleMod = state.module;
    save(); writeForm(); render(); return;
  }
});
form.elements.seed.addEventListener('blur', () => { form.elements.seed.value = state.seed; });
const reportBtn = $('#reportBug');
if (reportBtn) reportBtn.addEventListener('click', () => window.open(bugReportUrl(state, navigator.userAgent), '_blank', 'noopener'));
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
