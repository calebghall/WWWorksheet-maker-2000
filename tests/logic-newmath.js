/* vis.fpart (2.3B/2.3C), vis.ptable (3.5E), vis.scatter (5.9B): answers recomputed from each problem's own visible fields. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];let n=0;
const G=SP.VGEN||SP.NGEN;
const gen=(id,seed,L)=>{const f=(SP.VGEN&&SP.VGEN[id])||(SP.GEN&&SP.GEN['vis.'+id]);return f(SP.rngFrom(seed),L)};
const NAMES={2:'halves',3:'thirds',4:'fourths',6:'sixths',8:'eighths'};
const e=(m,p)=>bad.push(m+' '+JSON.stringify(p).slice(0,160));
for(const L of [1,2,3])for(let i=0;i<400;i++){
 for(const id of ['fpart','ptable','scatter','ftable','stem']){const p=gen(id,'NM'+i+id,L);n++;
  if(!p||p.type!==id||!p.sig||!p.ans){e('shape '+id,p);continue}
  if(id==='fpart'){const d=p.dens;
   if(p.kind==='one'&&(+p.ans!==d[0]||!p.prompt.includes(NAMES[d[0]])))e('one',p);
   if(p.kind==='many'){const w=+p.prompt.match(/make (\d) wholes/)[1];if(d.length!==w||new Set(d).size!==1||+p.ans!==w*d[0]||!p.prompt.includes(NAMES[d[0]]))e('many',p)}
   if(p.kind==='cmp'){const big=/larger|largest/.test(p.prompt),t=big?Math.min(...d):Math.max(...d);if(new Set(d).size!==d.length||d[p.opts.indexOf(p.ans)]!==t||p.opts.length!==d.length)e('cmp',p)}}
  if(id==='ptable'){const f=v=>p.mult?v*p.k:v+p.k;if(p.ins.some((v,j)=>p.outs[j]!==f(v)))e('rule',p);if(new Set(p.ins).size!==p.ins.length||p.ins.some((v,j)=>j&&v<=p.ins[j-1]))e('inputs',p);
   const vals=p.blanks.map(b=>b[0]?p.outs[b[1]]:p.ins[b[1]]);if(vals.join(' ')!==p.ans||new Set(p.blanks.map(b=>b[1])).size!==p.blanks.length)e('blanks',p);
   if(!p.ctx[0].includes(String(p.k)))e('ctx k',p)}
  if(id==='ftable'){const t=p.cnt.reduce((a,b)=>a+b,0);
   if(p.mode==='count'){const f=p.cats.map(c=>p.data.filter(d=>d===c).length);if(f.join()!==p.cnt.join()||p.ans!==f.join(' ')+' '+t||p.data.length!==t||p.cnt.some(v=>v<1))e('count',p)}
   if(p.mode==='read'){if(p.ans!==t+' '+(Math.max(...p.cnt)-Math.min(...p.cnt))||p.cnt[p.hi]!==Math.max(...p.cnt)||p.cnt[p.lo]!==Math.min(...p.cnt)||new Set(p.cnt).size!==p.cnt.length)e('read',p)}
   if(p.mode==='sum2'&&(+p.ans!==p.cnt[p.a]+p.cnt[p.b]||new Set([p.a,p.b,p.c]).size!==3))e('sum2',p);
   if(p.mode==='more2'&&(+p.ans!==p.cnt[p.a]+p.cnt[p.b]-p.cnt[p.c]||+p.ans<=0))e('more2',p);
   if(p.mode!=='count'&&p.cats.length!==(L===1?3:4))e('cats',p)}
  if(id==='stem'){const v=p.vals,sd=v.slice().sort((a,b)=>a-b);
   if(p.rows.some(r=>!r[1].length||r[1].some(l=>l<0||l>9)))e('empty stem',p);
   if(p.rows.flatMap(r=>r[1].map(l=>r[0]*10+l)).join()!==sd.join())e('rows vs values',p);
   if(p.mode==='read'&&p.ans!==v.length+' '+sd[sd.length-1])e('read',p);
   if(p.mode==='make'&&(p.ans!==p.rows.map(r=>r[1].join(' ')).join(' / ')||new Set(v).size!==v.length))e('make',p);
   if(p.mode==='solve'){let a;if(p.kind==='range')a=sd[sd.length-1]-sd[0];else if(p.kind==='least')a=v.filter(k=>k>=p.t).length;else{const f={};v.forEach(k=>f[k]=(f[k]||0)+1);const m=Math.max(...Object.values(f));const md=Object.keys(f).filter(k=>f[k]===m);a=md.length===1?+md[0]:-1}
    if(String(a)!==p.ans)e('solve '+p.kind+' '+a,p)}}
  if(id==='scatter'){const xs=p.pts.map(q=>q.x);if(new Set(xs).size!==xs.length||p.pts.some(q=>q.x<1||q.x>p.N||q.y<1||q.y>p.N))e('range',p);
   if(p.kind==='read'&&(!p.pts.some(q=>q.x===p.q.x&&String(q.y)===p.ans)))e('read',p);
   if(p.kind==='trend'){const ys=p.pts.map(q=>q.y);let ok=true;for(let j=1;j<ys.length;j++)if(p.dir==='up'?ys[j]<ys[j-1]:ys[j]>ys[j-1])ok=false;if(!ok||(p.dir==='up'?'go up':'go down')!==p.ans||ys[0]===ys[ys.length-1])e('trend',p)}}}}
for(const id of ['fpart','ptable','scatter','ftable','stem']){const d=SP.defaults();const k=Object.keys(d.vis.types).find(x=>x===id);if(!k||d.vis.types[id]!==false)bad.push('default '+id);
 for(const L of [1,2,3]){const sg=new Set();for(let i=0;i<300;i++)sg.add(gen(id,'V'+i+id,L).sig);if(sg.size<12)bad.push(`variety ${id} L${L} ${sg.size}`);
  const s=SP.defaults();s.module='vis';s.seed='R'+id;s.pages=2;s.vis.level=L;for(const t of Object.keys(s.vis.types))s.vis.types[t]=t===id;
  for(const key of [false,true]){s.key=key;const out=SP.renderAll(s);if(/NaN|undefined|\[object/.test(out))bad.push(`junk ${id} L${L} key${key}`)}}}
console.log('newmath problems checked',n,'; issues',[...new Set(bad)].slice(0,8),bad.length);process.exit(bad.length?1:0);
