/* Standards frameworks. FRAMEWORK.id is the default one (what a first-time visitor sees). Each framework's data is one payload
   { name, source, list: [[code, focus, cluster, grade]], xw: { code: crosswalk row } } built by tools/build_fw.py from standards/<fw>.json
   and standards/<fw>.crosswalk.json. The frameworks named in the build's --embed list (default tn) are registered in the page;
   the others are listed in STD_MANIFEST with a content-hashed file that stdLoad() adds as a script on first pick. */
const FRAMEWORK = { id: 'tn' };
const STD_FW = {};
function stdRegister(id, d) {
  d.grade = {};
  d.list.forEach(r => { d.grade[r[0]] = r[3]; });
  STD_FW[id] = d;
}
const stdFwName = id => ((typeof STD_MANIFEST !== 'undefined' ? STD_MANIFEST : []).find(m => m.id === id) || {}).name || id;
const STD_LOADS = {};
/* Loads a framework that is not embedded: resolves when it is registered, rejects when its file cannot be loaded. */
function stdLoad(id) {
  if (STD_FW[id]) return Promise.resolve();
  const m = STD_MANIFEST.find(x => x.id === id);
  if (!m || !m.file) return Promise.reject(new Error('unknown framework ' + id));
  if (!STD_LOADS[id]) STD_LOADS[id] = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = m.file;
    s.onload = () => (STD_FW[id] ? res() : rej(new Error('empty ' + m.file)));
    s.onerror = () => { delete STD_LOADS[id]; s.remove(); rej(new Error('cannot load ' + m.file)); };
    document.head.appendChild(s);
  });
  return STD_LOADS[id];
}
