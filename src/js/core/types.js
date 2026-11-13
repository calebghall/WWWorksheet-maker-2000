/* ---------- problem type registry ----------
   Number Sense (ns) and Shapes, Measures and Data (vis) problem types register themselves from their family files with defTypes.
   One entry per type: { id, label, blurb, on, gen(rng, level), html(problem, isKey, answerBox) }.
   Everything else is derived from the registry: the generator tables (NGEN, VGEN), the cell bodies (NHTML, VHTML), the id lists (NS_TYPES, VIS_TYPES),
   the default checkbox state (typeDefaults) and the checkbox panels (buildTypePanels in ui.js).
   A type whose generator returns another type's problems (for example cmp2 returns compare problems) registers without html. */
const TYPE_DEFS = { ns: [], vis: [] };
const NGEN = {}, NHTML = {}, NS_TYPES = [], VGEN = {}, VHTML = {}, VIS_TYPES = [];
const TYPE_TABLES = { ns: { gen: NGEN, html: NHTML, ids: NS_TYPES }, vis: { gen: VGEN, html: VHTML, ids: VIS_TYPES } };
function defTypes(mod, family, defs) {
  const t = TYPE_TABLES[mod];
  for (const d of defs) {
    TYPE_DEFS[mod].push(Object.assign({ family, on: false }, d));
    t.gen[d.id] = d.gen; if (d.html) t.html[d.id] = d.html; t.ids.push(d.id);
  }
}
const typeDefaults = mod => Object.fromEntries(TYPE_DEFS[mod].map(d => [d.id, !!d.on]));
