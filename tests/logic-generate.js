/* Generate-or-build types (ns-generate.js, vis-generate.js): every answer recomputed from what the problem shows. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];let n=0;
const IDS=['gen1','story','genset','openline'];
const G=id=>['gen1','story'].includes(id)?SP.NGEN[id]:SP.VGEN[id];
const num=s=>Number(String(s).replace(/,/g,''));
function chk(p,id,L){n++;const e=m=>bad.push(`${id} L${L}: ${m} ${JSON.stringify(p).slice(0,220)}`);
 if(!p||!p.sig)return e('shape');
 if(/NaN|undefined|\[object/.test(JSON.stringify(p)))e('junk');
 if(id==='gen1'){const hi=[20,120,1200][L-1],a=p.ans,k=p.n;
  if(L===1){if(p.kind==='more'?(a!==k+1||k<1||k>19):(a!==k-1||k<2||k>20))e('one more/less');if(!new RegExp('one '+p.kind+' than '+k,'i').test(p.prompt))e('prompt');}
  else{if(a<1||a>hi||k>hi)e('range');
   if(p.kind==='greater'&&!(a>k))e('greater');if(p.kind==='less'&&!(a<k))e('less');if(p.kind==='between'&&!(a>k&&a<p.m&&L===3&&p.m-k>=30))e('between');
   if(!p.prompt.includes(p.kind==='between'?'between':p.kind+' than'))e('prompt kind');}}
 if(id==='story'){const lim=[20,100,1000][L-1],{a,b,c,form}=p;
  if(form==='add'){if(a+b!==p.ans||p.ans>lim)e('add');}
  else if(form==='sub'){if(a-b!==p.ans||a>lim||p.ans<=0)e('sub');}
  else if(form==='miss'){if(L===1||a+b!==c||p.ans!==a||c>lim)e('miss');}else e('form');
  if(!p.sample||!p.sample.includes(String(b>=1000?b:b))&&!p.sample.includes(String(b).replace(/\B(?=(\d{3})+$)/g,',')))e('sample lacks numbers');
  if(form==='miss'&&p.sentence.indexOf('?')!==0)e('sentence');}
 if(id==='genset'){if(p.n<1||p.n>(L===1?10:20)||p.ex<1||p.ex>20)e('size');
  if(p.rel==='more'&&!(p.ex>p.n))e('more');if(p.rel==='fewer'&&!(p.ex<p.n))e('fewer');if(p.rel==='same'&&p.ex!==p.n)e('same');
  if(L===1&&p.rel==='same')e('L1 same');}
 if(id==='openline'){const{lo,hi,mid,n:v}=p;if(!(v>lo&&v<hi)||v===mid)e('range');
  if(L===1&&hi>100)e('L1 range');if(L===3&&hi<100)e('L3 range');
  if(p.variant==='read'){const o=p.opts.map(num);if(new Set(o).size!==3||!o.includes(v)||num(p.ans)!==v)e('opts');
   const s=o.slice().sort((x,y)=>x-y);if(s[1]-s[0]<(hi-lo)*0.15||s[2]-s[1]<(hi-lo)*0.15)e('opts close');}
  else if(p.variant!=='mark'||num(p.ans)!==v)e('variant');}
}
for(const L of [1,2,3])for(const id of IDS)for(let i=0;i<600;i++)chk(G(id)(SP.rngFrom('GN'+i+id),L),id,L);
const dflt=SP.defaults();
for(const id of IDS){
 for(const L of [1,2,3]){const sg=new Set();for(let i=0;i<400;i++)sg.add(G(id)(SP.rngFrom('GV'+i+id),L).sig);if(sg.size<8)bad.push(`variety ${id} L${L} ${sg.size}`);
  const m=['gen1','story'].includes(id)?'ns':'vis',s=SP.defaults();s.module=m;s.seed='G7'+id;s.pages=2;s.arPerPage=12;s[m].level=L;
  for(const key of [false,true]){s.key=key;for(const t of Object.keys(s[m].types))s[m].types[t]=t===id;const out=SP.renderAll(s);if(/NaN|undefined|null|\[object/.test(out))bad.push(`junk render ${id} L${L} key${key}`);}}}
console.log('generate problems checked',n,'; issues',[...new Set(bad)].slice(0,10),bad.length);process.exit(bad.length?1:0);
