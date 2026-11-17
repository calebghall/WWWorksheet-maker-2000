function generateSet(st) {
  if (st.module === 'mix') return mixItems(st).map(it => it.p);
  if (isStrand(st.module)) return genStrandN(rngFrom(st.seed), st, st.module, st.arPerPage * st.pages, st.arPerPage);
  if (st.module === 'fdp') return genFdpN(rngFrom(st.seed), st, st.arPerPage * st.pages, st.arPerPage);
  if (st.module === 'tm') return genTmN(rngFrom(st.seed), st, st.arPerPage * st.pages, st.arPerPage);
  if (st.module === 'vis') return genVisN(rngFrom(st.seed), st, st.arPerPage * st.pages, st.arPerPage);
  if (st.module === 'ns') return genNsN(rngFrom(st.seed), st, st.arPerPage * st.pages, st.arPerPage);
  if (st.module === 'addsub' || st.module === 'muldiv') return genArithN(rngFrom(st.seed), st, st.module, st.arPerPage * st.pages, st.arPerPage);
  return genAreaN(rngFrom(st.seed), st, st.perPage * st.pages, st.perPage);
}

function renderAll(st) {
  if (st.module === 'combo') return renderCombo(st);
  if (st.module === 'mix') return renderMix(st);
  if (CELL_MODS.includes(st.module)) return renderArithAll(st);
  const G = geom(st.paper, st.perPage), probs = generateSet(st);
  const base = { U: UNITS[st.unit], shade: st.shade, figW: G.boxW - 0.32 };
  let out = '';
  for (let i = 0; i < st.pages; i++) out += renderAreaSheet(st, probs.slice(i * st.perPage, (i + 1) * st.perPage), i, false, G, base);
  if (st.key) for (let i = 0; i < st.pages; i++) out += renderAreaSheet(st, probs.slice(i * st.perPage, (i + 1) * st.perPage), i, true, G, base);
  META.problems = st.perPage * st.pages; META.pages = st.pages; META.note = '';
  return out;
}

