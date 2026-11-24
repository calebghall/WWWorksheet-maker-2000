function defaults() {
  const combo = {}; for (const id of Object.keys(REG)) combo[id] = { on: REG[id].on0 !== false, n: REG[id].n0 };
  return {
    module: 'area',
    titles: { area: 'Area Squares', addsub: 'Addition and Subtraction', muldiv: 'Multiplication and Division', fdp: 'Fractions, Decimals and Percents', ns: 'Number Sense', tm: 'Time and Money', vis: 'Shapes, Measures and Data', mix: 'Mixed Practice', combo: 'Math Practice', num: 'Number Sense', oa: 'Operations and Algebraic Thinking', frac: 'Fractions, Decimals and Percents', time: 'Time and Money', meas: 'Measurement and Data', geom: 'Geometry, Area and Volume' },
    types: { count: true, mult: true, draw: true, cmp: true, lsh: false }, level: 2, perPage: 6, unit: 'units', shade: true,
    arPerPage: 20,
    as: { add: true, sub: true, d1: 2, d2: 2, addends: 2, regroup: 'any', format: 'vertical', cap: 0, second: 'digits' },
    md: { mul: true, div: true, mode: 'facts', tables: 10, focus: 0, rem: false, da: 2, db: 1, alt: false, da2: 2, db2: 2, na: 3, nb: 1, format: 'vertical' },
    fd: { types: { simp: true, equiv: true, cmp: true, fadd: true, fmul: false, decadd: true, decmul: false, conv: true, pct: true }, level: 2 },
    ns: { types: typeDefaults('ns'), level: 2 },
    vis: { types: typeDefaults('vis'), level: 2 },
    tm: { types: { coins: true, madd: true, change: true, clock: false, elapsed: true, conv: true, dclock: false, ampm: false, like: false, cpic: false, cstory: false }, level: 2 },
    mix: { mods: { addsub: true, muldiv: true, fdp: false, ns: true, tm: true } },
    num: strandDefaults('num'), oa: strandDefaults('oa'), frac: strandDefaults('frac'), time: strandDefaults('time'), meas: strandDefaults('meas'),
    geom: Object.assign(strandDefaults('geom'), { unit: 'units', shade: true }),
    combo,
    std: { f: FRAMEWORK.id, g: 'K', c: '' },
    parts: null,
    pages: 1, paper: 'letter', nameLine: true, key: true, grey: false, seed: newSeed()
  };
}
/* Pre-filled GitHub issue for the current worksheet: set code, module and every setting needed to rebuild the same problems.
   Opens the issue form (.github/ISSUE_TEMPLATE/bug.yml); the person reviews and submits it. Falls back to the basics if the URL would be too long. */
const ISSUES_URL = 'https://github.com/calebghall/WWWorksheet-maker-2000/issues/new';
/* Saved type lists are { id: bool } maps; the bug report sends the checked ids only, so both forms load. */
function mergeTypes(base, t) { return Array.isArray(t) ? stdMap(t, Object.keys(base)) : Object.assign(base, t || {}); }
const checkedIds = o => Object.keys(o).filter(k => o[k]);
function bugReportUrl(st, agent, link) {
  const mod = (typeof MODULES !== 'undefined' && MODULES[st.module]) ? MODULES[st.module].name : st.module;
  const full = Object.assign({}, st); delete full.titles;
  /* The type lists are long; send only the checked ids (normalize reads either form). */
  for (const M of STRAND_IDS.concat(['fd', 'ns', 'tm', 'vis'])) full[M] = Object.assign({}, st[M], { types: checkedIds(st[M].types) });
  full.types = checkedIds(st.types);
  /* `link` is the same address the Share link button copies; it rebuilds the whole worksheet, so it stays in every version of the report. */
  const q = settings => ISSUES_URL + '?' + [['template', 'bug.yml'], ['title', `Problem with ${mod} worksheet (set ${st.seed})`], ['set_code', st.seed], ['share_link', link || ''], ['settings', settings], ['browser', agent || '']]
    .map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
  const url = q(JSON.stringify(full));
  if (url.length <= 6000) return url;
  const withParts = q(JSON.stringify({ module: st.module, seed: st.seed, level: st.level, std: st.std, parts: st.parts, combo: st.combo }));
  return withParts.length <= 6000 ? withParts : q(JSON.stringify({ module: st.module, seed: st.seed, level: st.level, std: st.std }));
}
globalThis.__SP = { applyGradeStandards, gradeStandardParts, standardParts, applyStandardSet, bugReportUrl, FGEN, NGEN, generateSet, renderAll, defaults, rngFrom, LEVELS, UNITS, TYPE_IDS, geom, svg, carries, borrows, arLayout, needSize, REG, META, comboSections, comboPages, genArithN, genAreaN, TGEN, flowPack, mixLayout, mixItems, STANDARDS, applyStandard, stdList, stdPreset, stdInfo, stdLoad, STD_FW, STD_MANIFEST, STD_BY_ID, VGEN, VIS_TYPES, genVisN, partsOf, makePart, normPart, normParts, partState, captureSettings, applyModSettings, TYPE_DEFS, TYPE_HOME, STRAND_IDS, STRAND_REFS, STRAND_META, STRAND_GROUPS, genStrandN, migrateLegacyState, migrateParts, partMixable, strandsFromLegacy, genNsN, genVisN, genFdpN, genTmN, mixItems, typeTags, FRAMEWORK };

/*==DOM==*/
const $ = s => document.querySelector(s);
const STORE = 'wwwm2000.v1';
const form = $('#form'), sheetsEl = $('#sheets'), stageEl = $('#stage');
/* The Number Sense and Shapes, Measures and Data checkboxes are built from the type registry (core/types.js), grouped by family.
   Each family is a collapsible group that shows how many of its types are checked. A search box and a "Word problems only" toggle filter the
   types. A checked type is never hidden by a filter. */
const GROUPS_KEY = 'wwwm2000.groups';
let openGroups = {};
try { openGroups = JSON.parse(localStorage.getItem(GROUPS_KEY)) || {}; } catch (e) { openGroups = {}; }
function saveOpenGroups() { try { localStorage.setItem(GROUPS_KEY, JSON.stringify(openGroups)); } catch (e) { /* ignore */ } }
const TYPE_PANEL_MODS = ['ns', 'vis'].concat(STRAND_IDS);
/* The strand modules' panels (problem types, difficulty, and the grid-area options for geometry) are built here; the type lists are filled in by buildTypePanels. */
function buildStrandPanels() {
  const host = document.querySelector('#strandPanels'); if (!host) return;
  host.innerHTML = STRAND_IDS.map(M => `<fieldset data-mod="${M}"><legend>Problem types</legend><div data-types="${M}"></div></fieldset>
    <fieldset data-mod="${M}"><legend>Difficulty</legend><div class="seg" role="radiogroup" aria-label="Difficulty">${[1, 2, 3].map(L => `<label><input type="radio" name="${M}_level" value="${L}"><span>${['Easy', 'Medium', 'Hard'][L - 1]}</span></label>`).join('')}</div>
    <p class="note">Difficulty sets the number sizes and the number of steps in each type.</p></fieldset>`).join('')
    + `<fieldset data-mod="geom"><legend>Area on grids</legend><label class="tword" style="display:flex;margin-bottom:6px">Units <select id="geom_unit" name="geom_unit" aria-label="Units" style="margin-left:8px">${Object.keys(UNITS).map(k => `<option value="${k}">${UNITS[k].name}</option>`).join('')}</select></label>
    <label class="tword"><input type="checkbox" name="geom_shade"> Shade the squares</label><p class="note">For the Area on grids types.</p></fieldset>`;
}
buildStrandPanels();
function buildTypePanels() {
  for (const mod of TYPE_PANEL_MODS) {
    const host = document.querySelector(`[data-types="${mod}"]`); if (!host) continue;
    const groups = [];
    if (isStrand(mod)) for (const g of STRAND_GROUPS[mod]) groups.push(g);
    else for (const d of TYPE_DEFS[mod]) { let g = groups.find(h => h.family === d.family); if (!g) groups.push(g = { family: d.family, defs: [] }); g.defs.push(d); }
    const lbl = d => `<label class="chk" data-origin="${d.origin || mod}" data-id="${d.origin ? refId(d.id) : d.id}" data-q="${esc((d.label + ' ' + d.blurb + ' ' + d.id).toLowerCase())}"${(d.tags || typeTags(mod, d)).includes('word') ? ' data-word="1"' : ''}><input type="checkbox" name="${mod}_type" value="${d.id}"><b>${d.label}</b><small>${d.blurb}</small></label>`;
    host.innerHTML = `<div class="tfilter"><input type="search" name="tq" class="stdq" placeholder="Search types" aria-label="Search problem types"><label class="tword"><input type="checkbox" name="tword"> Word problems only</label></div>`
      + groups.map(g => `<details class="tgroup" data-fam="${esc(g.family)}" data-total="${g.defs.length}"><summary class="tgroup-h"><span>${g.family}</span><span class="tcount"></span></summary>${g.defs.map(lbl).join('')}</details>`).join('')
      + '<p class="note tnone" hidden>No problem types match.</p>';
  }
}
/* Applies the filters and updates every group's count. openChecked opens groups that hold a checked type (after a preset or a reload). */
function refreshTypePanels(openChecked) {
  for (const mod of TYPE_PANEL_MODS) {
    const host = document.querySelector(`[data-types="${mod}"]`); if (!host) continue;
    const q = host.querySelector('[name=tq]').value.trim().toLowerCase(), wordOnly = host.querySelector('[name=tword]').checked;
    const filtering = !!(q || wordOnly);
    let shown = 0;
    host.querySelectorAll('details.tgroup').forEach(g => {
      const labels = [...g.querySelectorAll('label.chk')];
      const checked = labels.filter(l => l.querySelector('input').checked).length;
      let vis = 0;
      for (const l of labels) {
        const on = l.querySelector('input').checked || ((!q || l.dataset.q.includes(q)) && (!wordOnly || l.dataset.word));
        l.hidden = !on; if (on) vis++;
      }
      g.hidden = vis === 0; shown += vis;
      g.querySelector('.tcount').textContent = `${checked}/${g.dataset.total}`;
      const key = mod + '|' + g.dataset.fam;
      if (!g.dataset.init) { g.dataset.init = '1'; g.dataset.auto = '1'; g.open = checked > 0 || !!openGroups[key]; g.dataset.auto = ''; }
      else if (openChecked && checked > 0 && !g.open) { g.dataset.auto = '1'; g.open = true; g.dataset.auto = ''; }
      if ((q || wordOnly) && vis > 0 && !g.open) { g.dataset.auto = '1'; g.open = true; g.dataset.auto = ''; }
    });
    host.querySelector('.tnone').hidden = shown > 0;
  }
}
buildTypePanels();

/* Saved standards settings: the framework (a known id, else the default), the grade, and the standard code (kept without a check while its framework is still loading). */
function stdNorm(x) {
  x = x || {};
  const f = STD_MANIFEST.some(m => m.id === x.f) ? x.f : FRAMEWORK.id, c = typeof x.c === 'string' ? x.c : '';
  return { f, g: inEnum(String(x.g), STD_GRADE_IDS, 'K'), c: STD_FW[f] && !stdPreset(c, f) ? '' : c };
}
function normalize(s) {
  const d = defaults();
  s = s && typeof s === 'object' ? s : {};
  const combo = {};
  for (const id of Object.keys(REG)) combo[id] = Object.assign(d.combo[id], (s.combo || {})[id] || {});
  const out = Object.assign(d, s, {
    titles: Object.assign(d.titles, s.titles || {}),
    std: stdNorm(s.std),
    types: mergeTypes(d.types, s.types),
    as: Object.assign(d.as, s.as || {}),
    md: Object.assign(d.md, s.md || {}),
    fd: Object.assign(d.fd, s.fd || {}, { types: mergeTypes(d.fd.types, (s.fd || {}).types) }),
    ns: Object.assign(d.ns, s.ns || {}, { types: mergeTypes(d.ns.types, (s.ns || {}).types) }),
    tm: Object.assign(d.tm, s.tm || {}, { types: mergeTypes(d.tm.types, (s.tm || {}).types) }),
    vis: Object.assign(d.vis, s.vis || {}, { types: mergeTypes(d.vis.types, (s.vis || {}).types) }),
    mix: { mods: Object.assign(d.mix.mods, (s.mix || {}).mods || {}) },
    combo
  });
  for (const M of STRAND_IDS) {
    const t = (s[M] || {}).types;
    out[M] = Object.assign(d[M], s[M] || {}, { types: mergeTypes(d[M].types, t) });
  }
  out.module = inEnum(out.module, Object.keys(MODULES), 'area');
  out.perPage = inEnum(+out.perPage, [4, 6, 8], 6);
  out.arPerPage = inEnum(+out.arPerPage, [12, 20, 30], 20);
  out.pages = inEnum(+out.pages, [1, 2, 3], 1);
  out.paper = inEnum(out.paper, Object.keys(PAPER), 'letter');
  clampMod(out);
  delete out.band;
  for (const id of Object.keys(REG)) { const c = out.combo[id]; c.on = !!c.on; c.n = inEnum(+c.n, REG[id].counts, REG[id].n0); }
  if (!Object.values(out.combo).some(c => c.on)) out.combo[Object.keys(REG)[0]].on = true;
  out.parts = normParts(s.parts);
  migrateLegacyState(out);
  if (out.parts) out.parts = migrateParts(out, out.parts);
  out.grey = !!out.grey;
  if (!out.seed) out.seed = newSeed();
  return out;
}
/* Share link: 'v1.' + base64url(deflate(JSON of the settings that differ from the defaults, seed included)). Decoding goes through normalize(). */
const b64u = u => btoa(String.fromCharCode(...u)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const zip = async (u, S) => new Uint8Array(await new Response(new Response(u).body.pipeThrough(new S('deflate'))).arrayBuffer());
async function encodeShare(st) {
  const d = defaults(), out = {};
  for (const k of Object.keys(st)) if (k === 'seed' || JSON.stringify(st[k]) !== JSON.stringify(d[k])) out[k] = st[k];
  return 'v1.' + b64u(await zip(new TextEncoder().encode(JSON.stringify(out)), CompressionStream));
}
async function decodeShare(code) {
  if (!/^v1\.[\w-]+$/.test(code)) throw new Error('not a v1 share code');
  return normalize(JSON.parse(new TextDecoder().decode(await zip(unb64u(code.slice(3)), DecompressionStream))));
}
let state;
try { state = normalize(JSON.parse(localStorage.getItem(STORE) || 'null')); } catch (e) { state = normalize(null); }

const SINGLE_MODS = Object.keys(MODULES).filter(id => id !== 'combo' && id !== 'mix' && !MODULES[id].legacy);
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
const stdFailed = {};
/* The picked framework's data, or null while it loads (stdLoad adds the file of a framework that is not embedded; a failure is shown in the list). */
function stdData() {
  const f = state.std.f;
  if (STD_FW[f]) return STD_FW[f];
  if (!stdFailed[f]) stdLoad(f).then(() => { writeStd(); }, () => { stdFailed[f] = true; writeStd(); });
  return null;
}
let stdPick = false, stdSel = [], stdSelFw = '', stdFocus = '';
const stdFull = (c, f) => { const D = STD_FW[f]; const r = D && D.list.find(x => x[0] === c); return r || null; };
function writeStdDetail() {
  const c = stdFocus || (stdPick ? '' : state.std.c), r = c && stdFull(c, state.std.f), el = $('#stdDetail');
  el.hidden = !r;
  if (r) el.innerHTML = `<span class="dc">${esc(r[0])}</span><span class="dk">${esc(r[2])}</span>${esc(r[4] || r[1])}`;
}
function writeStdBar() {
  const n = stdSel.length, parts = n ? standardParts(stdSel, state.std.f).length : 0;
  $('#stdMulti').setAttribute('aria-pressed', String(stdPick)); $('#stdMulti').textContent = stdPick ? 'Done selecting' : 'Select several';
  $('#stdClear').hidden = !stdPick || !n; $('#stdBuild').hidden = !stdPick;
  $('#stdBuild').disabled = !n || parts > PART_MAX;
  $('#stdBuild').textContent = n ? `Build worksheet (${n})` : 'Build worksheet';
  $('#stdSelN').textContent = !stdPick ? '' : !n ? 'Tick standards to combine them.' : parts > PART_MAX ? `${n} selected: too many sections (${parts}, limit ${PART_MAX}).` : `${n} selected, ${parts} section${parts === 1 ? '' : 's'}.`;
}
function writeStdList() {
  const q = stdQuery.trim().toLowerCase(), f = state.std.f, D = stdData();
  if (stdSelFw !== f) { stdSel = []; stdSelFw = f; }
  if (!D) { $('#stdList').innerHTML = `<p class="note">${stdFailed[f] ? `Could not load the ${esc(stdFwName(f))} standards. Check the connection and reload the page.` : `Loading the ${esc(stdFwName(f))} standards...`}</p>`; return; }
  const rows = D.list.filter(r => (q ? (r[0] + ' ' + r[1] + ' ' + r[2] + ' ' + (r[4] || '')).toLowerCase().includes(q) : r[3] === state.std.g));
  const badge = i => i.status === 'gap' ? ['gap', 'Not yet'] : i.status === 'partial' ? ['part', 'Partial'] : ['ok', ''];
  const allRow = !q && !stdPick && rows.length ? `<button type="button" class="std all" data-std-all="${state.std.g}"><span class="sl"><span class="sc">All</span></span><span class="st">All standards for this grade</span></button>` : '';
  $('#stdList').innerHTML = rows.length ? allRow + rows.map(r => {
    const p = stdPreset(r[0], f), b = badge(stdInfo(r[0], f)), picked = stdSel.includes(r[0]), on = stdPick ? picked : r[0] === state.std.c;
    const left = `<span class="sl"><span class="sc">${stdPick ? `<span class="box" aria-hidden="true">${picked ? '\u2611' : '\u2610'}</span>` : ''}${r[0]}</span>${b[1] ? `<span class="sb">${b[1]}</span>` : ''}</span>`;
    return `<button type="button" class="std ${b[0]}${on ? ' on' : ''}" data-std="${r[0]}"${p ? '' : ' disabled'}${on ? ' aria-pressed="true"' : ''} title="${esc(r[4] || r[1])}">${left}<span class="st">${esc(r[1])}</span></button>`;
  }).join('') : '<p class="note">No standards match.</p>';
  writeStdBar(); writeStdDetail();
}
function writeStd() {
  $('#stdGrades').innerHTML = STD_GRADE_IDS.map(id => `<label><input type="radio" name="stdGrade" value="${id}"${state.std.g === id ? ' checked' : ''}><span title="${STD_GRADES[id]}">${id}</span></label>`).join('');
  $('#stdFw').textContent = stdFwName(state.std.f);
  $('#stdFwRow').hidden = STD_MANIFEST.length < 2;
  $('#stdFwSel').innerHTML = STD_MANIFEST.map(m => `<option value="${m.id}"${m.id === state.std.f ? ' selected' : ''}>${esc(m.name)}</option>`).join('');
  writeStdList();
  const s = state.std.c ? stdInfo(state.std.c, state.std.f) : null;
  $('#stdCur').textContent = s && s.preset ? state.std.c : '';
  $('#stdNote').textContent = stdPick ? 'Tick standards, then Build worksheet: each one becomes its own section.' : s && s.preset ? `${state.std.c}: ${s.status === 'partial' ? 'Partial match. ' + s.note : 'The settings match this standard.'}` : 'Pick a standard to set the module, problem types and level. "Not yet" standards need a problem type this maker does not have.';
}
let lastSingleMod = (state.module === 'combo' || state.module === 'mix') ? 'geom' : state.module;
let lastMultiMod = state.module === 'mix' ? 'mix' : 'combo';
let editIdx = null;
let addCardIdx = null;
function ensureMultiParts() {
  if (state.parts && state.parts.length) return;
  if (state.module === 'mix') {
    const ms = MIX_MODS.filter(id => state.mix.mods[id]);
    state.parts = migrateParts(state, (ms.length ? ms : ['addsub']).map(m => makePart(state, m, REG[m].n0)));
  } else {
    const ps = partsOf(state);
    state.parts = migrateParts(state, (ps.length ? ps : [makePart(state, lastSingleMod)]).map(p => makePart(state, p.m, p.n)));
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
  for (const M of STRAND_IDS) { setChecks(M + '_type', fsState[M].types); setRadio(M + '_level', fsState[M].level); }
  $('#geom_unit').value = fsState.geom.unit; form.elements.geom_shade.checked = !!fsState.geom.shade;
  setRadio('perPage', state.perPage); setRadio('arPerPage', state.arPerPage); setRadio('pages', state.pages); setRadio('paper', state.paper);
  for (const n of ['nameLine', 'shade', 'key', 'grey']) form.elements[n].checked = !!state[n];
  form.elements.seed.value = state.seed;
  syncModuleUI();
  refreshTypePanels(true);
}

function cleanPartMix(parts) {
  parts.forEach((p, idx) => {
    if (idx === 0 || !partMixable(state, p) || !partMixable(state, parts[idx - 1])) delete p.mix;
  });
}

function groupPartCards(parts) {
  cleanPartMix(parts);
  const cards = [];
  for (let i = 0; i < parts.length; i++) {
    const start = i, items = [{ p: parts[i], i }];
    while (i + 1 < parts.length && parts[i + 1].mix && partMixable(state, parts[i]) && partMixable(state, parts[i + 1])) {
      i++;
      items.push({ p: parts[i], i });
    }
    cards.push({ start, end: i, items, mixable: partMixable(state, items[0].p) });
  }
  return cards;
}

function writeParts() {
  const parts = state.parts || [], isMix = state.module === 'mix';
  const cards = groupPartCards(parts);
  const mixSum = isMix ? parts.filter(p => partMixable(state, p)).reduce((a, p) => a + p.n, 0) : 0;
  const canMix = parts.some(p => partMixable(state, p));
  const mixR = form.querySelector('input[name="multi_view"][value="mix"]');
  if (mixR) mixR.disabled = !canMix;
  const heading = $('#partsHeading');
  if (heading) heading.textContent = isMix ? 'Topics & shares' : 'Sections';
  const btn = (attr, txt, label, dis) => `<button type="button" class="btn ghost sm" ${attr} aria-label="${label}"${dis ? ' disabled' : ''}>${txt}</button>`;

  if (isMix) {
    $('#partsList').innerHTML = parts.map((p, i) => {
      const mixable = partMixable(state, p);
      const badge = mixable && mixSum ? `${Math.round(100 * p.n / mixSum)}%` : '—';
      const sel = `<select name="partRowN" aria-label="Share weight for ${esc(REG[p.m].name)}">${REG[p.m].counts.map(n => `<option value="${n}"${n === p.n ? ' selected' : ''}>Share ${n}</option>`).join('')}</select>`;
      const sub = `${esc(REG[p.m].name)}${!mixable ? ' · <em>Sections only</em>' : ''}`;
      return `<li class="pr" data-i="${i}"><span class="pl">${badge}</span><div class="pr-f"><input type="text" name="partRowLabel" maxlength="60" value="${esc(p.label || '')}" placeholder="${esc(REG[p.m].name)}" aria-label="Label of item ${i + 1}"><div class="pr-sub">${sub}</div>${sel}<span class="pr-b">${btn('data-part-act="edit"', 'Settings', 'Settings for ' + REG[p.m].name)}${btn('data-part-act="up"', '↑', 'Move up', i === 0)}${btn('data-part-act="down"', '↓', 'Move down', i === parts.length - 1)}${btn('data-part-act="del"', '×', 'Delete', parts.length <= 1)}</span></div></li>`;
    }).join('');
  } else {
    if (addCardIdx !== null && (!cards[addCardIdx] || !cards[addCardIdx].mixable || parts.length >= PART_MAX)) addCardIdx = null;
    $('#partsList').innerHTML = cards.map((card, ci) => {
      const L = String.fromCharCode(65 + ci), lead = card.items[0].p, mixed = card.items.length > 1;
      const ph = mixed ? 'Mixed Practice' : REG[lead.m].name;
      const head = `<div class="sec-top"><span class="pl">Part ${L}</span><input type="text" name="secLabel" data-sec-start="${card.start}" maxlength="60" value="${esc(lead.label || '')}" placeholder="${esc(ph)}" aria-label="Title of Part ${L}"><span class="pr-b">${btn('data-sec-act="up"', '↑', `Move Part ${L} up`, ci === 0)}${btn('data-sec-act="down"', '↓', `Move Part ${L} down`, ci === cards.length - 1)}${btn('data-sec-act="del"', '×', `Delete Part ${L}`, cards.length <= 1)}</span></div>`;
      const rows = card.items.map(({ p, i }) => {
        const sel = `<select name="partRowN" data-i="${i}" aria-label="Problems for ${esc(REG[p.m].name)} in Part ${L}">${REG[p.m].counts.map(n => `<option value="${n}"${n === p.n ? ' selected' : ''}>${n} problems</option>`).join('')}</select>`;
        const rm = mixed ? btn('data-part-act="del"', '×', `Remove ${REG[p.m].name} from Part ${L}`) : '';
        return `<div class="trow" data-i="${i}"><span class="trow-name">${esc(REG[p.m].name)}</span>${sel}<span class="pr-b">${btn('data-part-act="edit"', 'Settings', `Settings for ${REG[p.m].name}`)}${rm}</span></div>`;
      }).join('');
      let addMix = '';
      if (card.mixable && parts.length < PART_MAX) {
        addMix = addCardIdx === ci
          ? `<div class="sec-add"><div class="sec-pick-h"><span>Add a topic to Part ${L}:</span>${btn('data-sec-pick-cancel="1"', 'Cancel', 'Cancel')}</div><div class="sec-pick">${MIX_MODS.map(id => btn(`data-sec-pick="${id}"`, esc(MODULES[id].name), `Add ${MODULES[id].name} to Part ${L}`)).join('')}</div></div>`
          : `<div class="sec-add">${btn('data-sec-open="1"', '+ Add more to section', `Add more topics to Part ${L}`)}</div>`;
      }
      return `<li class="sec-card" data-c="${ci}">${head}<div class="sec-topics">${rows}</div>${addMix}</li>`;
    }).join('');
  }

  $('#partAdd').disabled = parts.length >= PART_MAX;
  const hasBlocked = isMix && parts.some(p => !partMixable(state, p));
  $('#multiNote').textContent = !canMix
    ? 'Area Squares and Shapes, Measures and Data only print in sections.'
    : isMix
      ? 'Problems are shuffled together and packed by size. Each topic\'s Share controls how much of the sheet it gets.' + (hasBlocked ? ' Topics marked "Sections only" stay out until you switch back to In sections.' : '')
      : 'Each card is a lettered section (Part A, Part B, ...). Mix multiple topics inside one card, or add a new section below.';
  const ep = editingPart();
  if (ep) {
    const card = cards.find(c => editIdx >= c.start && editIdx <= c.end);
    const L = card ? String.fromCharCode(65 + cards.indexOf(card)) : String.fromCharCode(65 + editIdx);
    const inMixedCard = !isMix && card && card.items.length > 1;
    $('#partDrawerTag').textContent = `${isMix ? 'Editing' : `Part ${L}`} · ${REG[ep.m].name}`;
    const lblWrap = $('#editPartLabel').closest('.part-f');
    if (lblWrap) lblWrap.hidden = !!inMixedCard;
    if (!inMixedCard && document.activeElement !== $('#editPartLabel')) $('#editPartLabel').value = ep.label || '';
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
  for (const M of STRAND_IDS) target[M] = { types: ensureOne(checksOf(M + '_type'), changed, M + '_type', STRAND_META[M].def), level: +val(M + '_level') || target[M].level };
  target.geom.unit = $('#geom_unit').value; target.geom.shade = form.elements.geom_shade.checked;
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
const CLEARS_STD = /^(module|type|level|as_|md_|fd_|ns_|tm_|vis_|num_|oa_|frac_|time_|meas_|geom_)/;
form.addEventListener('input', e => {
  const nm = e.target.name || '';
  if (nm === 'addPartMod' || nm === 'secAddMod') return;
  if (nm === 'wkMode') {
    editIdx = null;
    if (e.target.value === 'multi') {
      ensureMultiParts();
      state.module = (lastMultiMod === 'mix' && state.parts.some(p => partMixable(state, p))) ? 'mix' : 'combo';
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
    if (v === 'mix' && !(state.parts || []).some(p => partMixable(state, p))) { writeForm(); return; }
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
  if (nm === 'secLabel') {
    const p = (state.parts || [])[+e.target.dataset.secStart];
    if (!p) return;
    p.label = e.target.value.slice(0, 60);
    if (state.std.c) { state.std.c = ''; writeStd(); }
    save(); render(); return;
  }
  if (nm === 'partRowLabel' || nm === 'partRowN') {
    const el = e.target.closest('[data-i]'), p = el && (state.parts || [])[+el.dataset.i];
    if (!p) return;
    if (nm === 'partRowLabel') p.label = e.target.value.slice(0, 60); else p.n = inEnum(+e.target.value, REG[p.m].counts, REG[p.m].n0);
    if (state.std.c) { state.std.c = ''; writeStd(); }
    save(); if (state.module === 'mix' && nm === 'partRowN') writeParts(); render(); return;
  }
  if (nm === 'tq' || nm === 'tword') { refreshTypePanels(); return; }
  if (nm === 'stdFwSel') { state.std = { f: e.target.value, g: state.std.g, c: '' }; stdQuery = ''; $('#stdQ').value = ''; save(); writeStd(); return; }
  if (nm === 'stdGrade') { state.std.g = e.target.value; stdQuery = ''; $('#stdQ').value = ''; save(); writeStdList(); return; }
  if (nm === 'stdQ') { stdQuery = e.target.value; writeStdList(); return; }
  if (CLEARS_STD.test(nm) && state.std.c) { state.std.c = ''; writeStd(); }
  readForm(e.target); syncModuleUI(); save(); refreshTypePanels(); render();
});

function partAction(e) {
  const ab = e.target.closest('[data-sec-open], [data-sec-pick], [data-sec-pick-cancel], [data-sec-act], [data-part-act], #partAdd, #partDone'); if (!ab) return false;
  const parts = (state.parts || []).slice(), after = () => { if (state.std.c) state.std.c = ''; save(); writeForm(); render(); };
  if (ab.id === 'partDone') { editIdx = null; writeForm(); form.closest('.panel').scrollTop = 0; return true; }
  if (ab.dataset.secOpen) { addCardIdx = +ab.closest('[data-c]').dataset.c; writeParts(); return true; }
  if (ab.dataset.secPickCancel) { addCardIdx = null; writeParts(); return true; }
  if (ab.dataset.secPick) {
    if (parts.length >= PART_MAX) return true;
    const cards = groupPartCards(parts), ci = +ab.closest('[data-c]').dataset.c, card = cards[ci];
    addCardIdx = null;
    if (!card || !card.mixable) { writeParts(); return true; }
    const m = ab.dataset.secPick;
    const np = makePart(state, m, REG[m].n0); np.mix = true;
    parts.splice(card.end + 1, 0, np);
    state.parts = parts; after(); return true;
  }
  addCardIdx = null;
  if (ab.id === 'partAdd') {
    if (parts.length >= PART_MAX) return true;
    const m = $('#addPartMod').value;
    state.parts = parts.concat(makePart(state, m, REG[m].n0));
    after(); return true;
  }
  if (ab.dataset.secAct) {
    const cards = groupPartCards(parts), ci = +ab.closest('[data-c]').dataset.c, act = ab.dataset.secAct;
    const slices = cards.map(c => parts.slice(c.start, c.end + 1));
    if (!slices[ci]) return true;
    if (act === 'up' && ci > 0) [slices[ci - 1], slices[ci]] = [slices[ci], slices[ci - 1]];
    else if (act === 'down' && ci < slices.length - 1) [slices[ci + 1], slices[ci]] = [slices[ci], slices[ci + 1]];
    else if (act === 'del' && slices.length > 1) slices.splice(ci, 1);
    editIdx = null;
    state.parts = [].concat(...slices);
    cleanPartMix(state.parts);
    after(); return true;
  }
  const i = +ab.closest('[data-i]').dataset.i, act = ab.dataset.partAct;
  if (!parts[i]) return true;
  if (act === 'edit') { editIdx = i; writeForm(); form.closest('.panel').scrollTop = 0; return true; }
  if (act === 'up' && i > 0) [parts[i - 1], parts[i]] = [parts[i], parts[i - 1]];
  else if (act === 'down' && i < parts.length - 1) [parts[i + 1], parts[i]] = [parts[i], parts[i + 1]];
  else if (act === 'del' && parts.length > 1) {
    if (parts[i + 1] && parts[i + 1].mix && !parts[i].mix) {
      if (parts[i].label && !parts[i + 1].label) parts[i + 1].label = parts[i].label;
      delete parts[i + 1].mix;
    }
    parts.splice(i, 1);
  }
  editIdx = null;
  cleanPartMix(parts);
  state.parts = parts;
  if (state.module === 'mix' && !parts.some(p => partMixable(state, p))) state.module = lastMultiMod = 'combo';
  after(); return true;
}

form.addEventListener('click', e => {
  if (partAction(e)) return;
  if (e.target.closest('#stdMulti')) { stdPick = !stdPick; stdFocus = ''; writeStd(); return; }
  if (e.target.closest('#stdClear')) { stdSel = []; writeStdList(); return; }
  if (e.target.closest('#stdBuild')) {
    if (stdSel.length && applyStandardSet(state, stdSel.slice())) { editIdx = null; lastMultiMod = 'combo'; save(); writeForm(); render(); }
    return;
  }
  const ra = e.target.closest('[data-std-all]');
  if (ra && applyGradeStandards(state, ra.dataset.stdAll)) { editIdx = null; lastMultiMod = 'combo'; save(); writeForm(); render(); return; }
  const r = e.target.closest('[data-std]');
  if (r && !r.disabled && stdPick) {
    const c = r.dataset.std; stdSel = stdSel.includes(c) ? stdSel.filter(x => x !== c) : stdSel.concat(c);
    stdFocus = c; writeStdList(); return;
  }
  if (r && !r.disabled) {
    editIdx = null;
    state.std = { f: state.std.f, g: stdGrade(r.dataset.std, state.std.f), c: r.dataset.std };
    applyStandard(state, state.std.c);
    if (state.module === 'combo' || state.module === 'mix') lastMultiMod = state.module;
    else lastSingleMod = state.module;
    save(); writeForm(); render(); return;
  }
});
/* The full text of the standard under the pointer or focus; back to the picked standard when it leaves. */
const stdListEl = $('#stdList');
const stdHover = e => { const r = e.target.closest && e.target.closest('[data-std]'); if (r && r.dataset.std !== stdFocus) { stdFocus = r.dataset.std; writeStdDetail(); } };
stdListEl.addEventListener('mouseover', stdHover); stdListEl.addEventListener('focusin', stdHover);
stdListEl.addEventListener('mouseleave', () => { if (stdFocus) { stdFocus = ''; writeStdDetail(); } });
/* Remember which type groups the person opened (toggle does not bubble, so listen in the capture phase). */
form.addEventListener('toggle', e => {
  const g = e.target; if (!g.matches || !g.matches('details.tgroup') || g.dataset.auto) return;
  const host = g.closest('[data-types]'), key = host.dataset.types + '|' + g.dataset.fam;
  if (g.open) openGroups[key] = true; else delete openGroups[key];
  saveOpenGroups();
}, true);
form.elements.seed.addEventListener('blur', () => { form.elements.seed.value = state.seed; });
const reportBtn = $('#reportBug');
if (reportBtn) reportBtn.addEventListener('click', async () => {
  let link = ''; try { link = location.href.split('#')[0] + '#s=' + await encodeShare(state); } catch (e) { /* the report still carries the set code and settings */ }
  window.open(bugReportUrl(state, navigator.userAgent, link), '_blank', 'noopener');
});
$('#newSet').addEventListener('click', () => { state.seed = newSeed(); form.elements.seed.value = state.seed; save(); render(); });
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) shareBtn.addEventListener('click', async () => {
  const link = location.href.split('#')[0] + '#s=' + await encodeShare(state);
  try { await navigator.clipboard.writeText(link); shareBtn.textContent = 'Link copied'; } catch (e) { prompt('Copy this link', link); }
  setTimeout(() => { shareBtn.textContent = 'Share link'; }, 1800);
});
/* Privacy and acknowledgements dialogs; "Delete saved data" removes every key this site stores (settings, open groups, theme) and reloads without a share link. */
document.querySelectorAll('[data-dlg]').forEach(b => b.addEventListener('click', () => { const d = document.getElementById(b.dataset.dlg); if (d && d.showModal) d.showModal(); }));
const wipeBtn = document.getElementById('wipeData');
if (wipeBtn) wipeBtn.addEventListener('click', () => {
  if (!confirm('Delete the settings this site saved in your browser? The page will reload with the defaults.')) return;
  try { [STORE, GROUPS_KEY, THEME_KEY].forEach(k => localStorage.removeItem(k)); } catch (e) { /* ignore */ }
  location.replace(location.href.split('#')[0]);
});
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
/* A shared link (#s=...) replaces the saved settings; a bad one keeps them. */
if (location.hash.startsWith('#s=')) {
  decodeShare(decodeURIComponent(location.hash.slice(3))).then(s => { state = s; save(); writeForm(); render(); }, () => { alert('This share link could not be read. The saved settings were kept.'); })
    .finally(() => history.replaceState(null, '', location.pathname + location.search));
}

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
