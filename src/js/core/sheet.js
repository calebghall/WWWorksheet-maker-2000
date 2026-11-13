/* ---------- shared sheet shell ---------- */
function sheetShell(st, key, pageIdx, sub, body) {
  const P = PAPER[st.paper];
  const title = esc((st.titles && st.titles[st.module]) || MODULES[st.module].name);
  const name = (!key && st.nameLine) ? '<div class="sh-name"><div>Name<i></i></div><div>Date<i></i></div></div>' : '';
  return `<article class="sheet" style="--pw:${P.w}in;--ph:${P.h}in">`
    + `<header class="sh-head"><div class="sh-title"><h2>${title}${key ? '<span class="badge-key">ANSWER KEY</span>' : ''}</h2><p>${esc(key ? 'Answers are shown in red.' : sub)}</p></div>${name}</header>`
    + body
    + `<footer class="sh-foot"><span>World Wide Worksheet Maker 2000 · Set ${esc(st.seed)}</span><span>${key ? 'Answer key · ' : ''}Page ${pageIdx + 1} of ${st.pages}</span></footer></article>`;
}

