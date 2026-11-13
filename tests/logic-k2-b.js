/* K-2 Number Sense additions (src/js/modules/ns-k2.js, drawing space in ns-ext.js word problems). Answers recomputed from each problem's own fields. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,E=x=>vm.runInContext(x,ctx),bad=[];let n=0;
const NGEN=E('NGEN'),numWord=E('numWord');
const tv=t=>t.map(s=>typeof s==='object'?s.u:s).join('');
const unk=t=>t.filter(s=>typeof s==='object').map(s=>+s.u);
function chk(p,id,L){n++;const e=m=>bad.push(`${id} L${L}: ${m} ${JSON.stringify(p).slice(0,140)}`);
  if(!p.sig||!p.prompt||p.prompt.length>42||!(p.win>0&&p.hin>0||p.ew>0&&p.eh>0))e('shape');if(p.win>3.4)e('wide '+p.win);
  switch(id){
  case 'kseq':case 'cseq':{const v=p.terms.map(Number),d=v[1]-v[0];if(v.some((x,i)=>i&&x-v[i-1]!==d))e('step');if(v.some(x=>x<0||x>(id==='kseq'?100:1000)))e('range');
    if(id==='kseq'&&![1,5,10,-1].includes(d))e('kseq step');if(id==='cseq'&&![5,10,100,-5,-10,-100].includes(d))e('cseq step');if(id==='kseq'&&d===-1&&v[0]>10)e('back>10');if(id==='cseq'&&d<0&&L===1)e('back at L1');
    if(p.idx.length!==2||p.idx.some(i=>i<1||i>5))e('idx');break;}
  case 'numrw':{if(p.n<1||p.n>(L===1?20:L===2?99:120))e('range');if(p.variant==='w2n'){if(numWord(+p.ans)!==p.word||+p.ans!==p.n)e('w2n');}
    else if(p.variant==='n2w'){if(p.ans!==numWord(p.n))e('n2w');}else if(p.variant==='to'){if(p.t*10+p.o!==p.n)e('to');}else if(p.ans!==String(p.n))e('blocks');
    if(/-?\bundefined|NaN/.test(numWord(p.n)))e('word');break;}
  case 'bondp':{const t=tv(p.tok),u=unk(p.tok),m=t.match(/^(\d*)(\d+) \+ (\d+) = (\d+)$/)||t.match(/^(\d+) \+ (\d+) = (\d+)$/);const nums=t.match(/\d+/g).map(Number);
    if(nums[0]+nums[1]!==nums[2])e('sum '+t);if(L===1&&(nums[2]>10||nums[0]<1||nums[1]<1))e('L1');if(L===2&&nums[2]!==10)e('L2');if(L===3&&(nums[2]<11||nums[2]>19||nums[0]!==10))e('L3');
    if(!/<circle/.test(p.svg))e('no counters');break;}
  case 'substr':{const t=tv(p.tok),u=unk(p.tok),a=+t.match(/(\d+) − (\d+)/)[1],b=+t.match(/(\d+) − (\d+)/)[2],r=a-b;if(a>20||r<0)e('range');
    if(p.kind==='add'){if(u[0]!==r||u[1]!==r||b+r!==a)e('add');}else if(p.kind==='ten'){const tt=a-10;if(a<11||b<=tt||u[0]!==10||u[1]!==r||10-(b-tt)!==r)e('ten');}else{const exp=Array.from({length:b},(_,i)=>a-1-i).concat([r]);if(u.join()!==exp.join())e('back');}break;}
  case 'cmp2':{const a=+p.a,b=+p.b;if(a<10||b<10||a>99||b>99||p.ans!==(a<b?'<':a>b?'>':'='))e('cmp');if(L===1&&Math.floor(a/10)===Math.floor(b/10))e('L1 tens');if(a===b&&L<3)e('equal');break;}
  case 'par20':if(p.type==='parity'){if(+p.n<1||+p.n>20||p.ans!==(+p.n%2?'odd':'even'))e('parity');}else if(p.variant==='eq'){const u=unk(p.tok);if(p.n%2||p.n>20||u[0]*2!==p.n||u[1]!==u[0])e('eq');}else if(p.n<2||p.n>20||p.ans!==(p.n%2?'odd':'even'))e('pic');break;
  case 'moreexp':if(String(p.more?p.base+10:p.base-10)!==p.ans||p.base<10||+p.ans>99||+p.ans<10)e('more');break;
  }}
for(const L of [1,2,3])for(const id of ['kseq','cseq','numrw','bondp','substr','cmp2','par20','moreexp'])for(let i=0;i<800;i++)chk(NGEN[id](SP.rngFrom('N'+i+id),L),id,L);
for(const L of [1,2,3]){const s=SP.defaults();s.module='ns';s.seed='K2';s.pages=3;s.arPerPage=12;s.ns.level=L;for(const k of Object.keys(s.ns.types))s.ns.types[k]=true;
  for(const key of [false,true]){s.key=key;const out=SP.renderAll(s);if(/NaN|undefined|null|\[object/.test(out))bad.push('junk render L'+L);const a=(out.match(/<svg/g)||[]).length,b=(out.match(/<\/svg>/g)||[]).length;if(a!==b)bad.push('svg balance');}}
/* word problems carry drawing space; standards-driven caps */
for(const id of ['wadd','wlen'])for(let i=0;i<200;i++){const p=NGEN[id](SP.rngFrom('W'+i),1+i%3);n++;if(!p.draw)bad.push('no draw space '+id);if(p.eq.includes('?'))bad.push('? in eq '+id);}
for(const [id,mx] of [['skip',120]])for(let i=0;i<400;i++){const p=NGEN[id](SP.rngFrom('S'+i),1);if(p.terms.some(t=>+t>mx))bad.push('skip L1 beyond 120');}
console.log('k2-b problems checked',n,'; issues',[...new Set(bad)].slice(0,12),bad.length);process.exit(bad.length?1:0);
