/* Shapes, Measures and Data types with drawn graphs, models and area concepts (the id list below): answers recomputed from each problem's own fields. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,E=x=>vm.runInContext(x,ctx),bad=[];let n=0;const G3=['mfac', 'dint', 'mchart', 'fmodel', 'fline', 'mvol'].concat(['pictg', 'barg', 'rulq', 'lplotq', 'acon', 'gcat', 'gpart', 'gpoly', 'pera']),sum=a=>a.reduce((x,y)=>x+y,0);
function chk(p,id,L){n++;const e=m=>bad.push(`${id} L${L}: ${m} ${JSON.stringify(p).slice(0,140)}`);
 if(!p.sig||!p.prompt||p.prompt.length>42||!((p.win>0&&p.hin>0)||(p.ew>0&&p.eh>0)))e('shape');if(p.win>3.4)e('wide');
 switch(id){
 case 'mfac':if(p.variant==='pic'){if(p.ans!==`${p.a} ${p.b} ${p.a*p.b}`)e('pic');}else if(p.variant==='name'){if(p.ans!==String(p.a*p.b)||!p.opts.includes(p.ans)||new Set(p.opts).size!==3)e('name');}else if(p.ans!==['groups','in each group','in all'][p.role]||[p.a,p.b,p.a*p.b][p.role]!==p.num||p.a===p.b)e('mean');break;
 case 'dint':if(p.n!==p.d*p.q)e('div');if(p.variant==='name'){if(p.ans!==String([p.n,p.d,p.q][['dividend','divisor','quotient'].indexOf(p.ask)])||new Set(p.opts).size!==3)e('name');}else if(p.ans!==String(p.q))e('ans');break;
 case 'mchart':{if(p.kind==='fill'){if(p.ans!==p.blanks.map(b=>(p.r0+Math.floor(b/4))*(p.c0+b%4)).join(' ')||p.blanks.length!==3)e('fill');}
  else if(p.kind==='comm'){const[a,b]=p.cells;if(a[0]!==b[1]||a[1]!==b[0]||a[0]===a[1]||p.r0!==p.c0)e('comm');}
  else if(p.kind==='row'){const i=p.cells[0][0],r=p.r0+i,prods=[0,1,2,3].map(j=>r*(p.c0+j)),ok={'even':v=>v%2===0,'odd':v=>v%2===1,'0 or 5':v=>[0,5].includes(v%10),'0 or 2':v=>[0,2].includes(v%10),'0':v=>v%10===0,'5':v=>v%10===5};
   if(!prods.every(ok[p.ans])||prods.every(ok[p.opts.find(o=>o!==p.ans)])||r!==p.f||p.r0+3>10||p.c0+3>10)e('row');}
  else{const[a,b]=p.cells;if(b[0]!==a[0]+1||b[1]!==a[1]||p.ans!==String(p.c0+a[1])||(p.r0+b[0])*p.c-(p.r0+a[0])*p.c!==p.c)e('plus');}break;}
 case 'fmodel':case 'fline':{const[nu,de]=p.ans.split('/').map(Number);if(id==='fmodel'){if(de!==p.n||nu!==p.k||nu<1||nu>=de)e('fmodel');}else if(de!==p.b||nu!==p.k||nu>=p.top*de||(p.top===2&&nu===de))e('fline');break;}
 case 'mvol':if(p.variant==='dial'||p.variant==='beaker'){if(p.ans!==String(p.i*p.step)||p.i<1||p.i>=p.N)e('read');}
  else if(p.variant==='word'){const f={add:p.a+p.b,sub:p.a-p.b,mul:p.a*p.b,div:p.a/p.b}[p.op];if(String(f)!==p.ans||!Number.isInteger(f)||f<=0||!p.text.includes(String(p.a)))e('word');}
  else if(p.variant==='bench'){if(p.ans!==String(p.n*p.per))e('bench');}else{const u=E('G3_UNITS').find(r=>r[2]===p.thing);if(!u||u[1]!==p.ans||!p.opts.includes(p.ans))e('unit');}break;
 case 'pictg':case 'barg':{const t=sum(p.cnt),hi=Math.max(...p.cnt),lo=Math.min(...p.cnt);if(new Set(p.cnt).size!==p.cnt.length||p.tot!==t||p.diff!==hi-lo||p.cnt[p.hi]!==hi||p.cnt[p.lo]!==lo)e('data');
  if(p.cnt.some(v=>v%p.g))e('granularity');if(id==='pictg'&&Math.max(...p.cnt)/p.step>6)e('too many');if(id==='barg'&&Math.max(...p.cnt)>7*p.step)e('bar max');
  if(p.two&&(p.two.ans!==p.cnt[p.two.a]+p.cnt[p.two.b]-p.cnt[p.two.c]||p.two.ans<=0))e('two');if(p.ans!==(p.make?p.cnt.join(' '):`${t} ${hi-lo}`))e('ans');break;}
 case 'rulq':if(p.den===2&&p.q%2)e('halves');if(p.q<1||p.q>20)e('range');break;
 case 'lplotq':{if(p.data.length!==8||p.data.some(v=>v<4||v>16||(p.den===2&&v%2)))e('data');if(!p.make&&p.qk==='count'&&p.ans!==String(p.data.filter(v=>v===p.ask).length))e('count');break;}
 case 'acon':if(p.variant==='which'){const a=p.A.length,b=p.B.length;if(p.ans!==(a>b?'A':b>a?'B':'same'))e('which');if(new Set(p.A.map(String)).size!==a)e('dup cells');}else if(p.variant==='tile'){if(p.ans!==p.first||p.at>=p.w*p.h)e('tile');}else if(p.ans!==String(p.n))e('defn');break;
 case 'gcat':{const SH=E('G3_SH');if(p.variant==='is'){if(p.ans!==(SH[p.shape].includes(p.cat)?'yes':'no'))e('is');}else if(p.variant==='both'){const k=E('G3_BOTH').find(b=>b.q===p.q);if(p.list.filter(k.t).length!==1||!k.t(p.list[+p.ans]))e('both');}else if(new Set(p.list).size!==3||p.list.every(s=>SH[s].includes('rect'))||p.list.every(s=>SH[s].includes('rhom')))e('group');break;}
 case 'gpart':if(p.variant==='draw'){if(p.ans!==`1/${p.n}`||![2,3,4,6,8].includes(p.n))e('draw');}else if(p.variant==='same'){if(p.ans!==`1/${p.n}`||p.A===p.B)e('same');}else if(p.ans!==p.first)e('eqpick');break;
 case 'gpoly':{const poly=E('g3IsPoly');if(p.variant==='one'){if(p.ans!==(poly(p.id)?'yes':'no'))e('one');}else if(p.ans!==p.ids.map((d,i)=>poly(d)?i:-1).filter(i=>i>=0).join(' ')||!p.ans||p.ids.length!==5||new Set(p.ids).size!==5)e('set');break;}
 case 'pera':{const per=r=>2*(r[0]+r[1]),ar=r=>r[0]*r[1],f=p.kind==='perim'?ar:per,g=p.kind==='perim'?per:ar;if(g(p.a)!==g(p.b)||f(p.a)===f(p.b)||p.ans!==(f(p.a)>f(p.b)?'A':'B')||p.a[0]>11||p.b[0]>11)e('pera');break;}
 }}
for(const L of [1,2,3])for(const id of G3)for(let i=0;i<500;i++)chk(SP.VGEN[id](SP.rngFrom('G'+i+id),L),id,L);
for(const L of [1,2,3]){const s=SP.defaults();s.module='vis';s.seed='G3';s.pages=3;s.arPerPage=12;s.vis.level=L;for(const k of Object.keys(s.vis.types))s.vis.types[k]=G3.includes(k);
 for(const key of [false,true]){s.key=key;const out=SP.renderAll(s);if(/NaN|undefined|null|\[object/.test(out))bad.push('junk render L'+L+' key'+key);const a=(out.match(/<svg/g)||[]).length,b=(out.match(/<\/svg>/g)||[]).length;if(a!==b||!a)bad.push('svg balance L'+L);}}
for(const id of G3)for(const L of [1,2,3]){const sg=new Set();for(let i=0;i<150;i++)sg.add(SP.VGEN[id](SP.rngFrom('D'+i+id),L).sig);if(sg.size<4)bad.push(`low variety ${id} L${L} ${sg.size}`);}
console.log('g3 problems checked',n,'; issues',[...new Set(bad)].slice(0,12),bad.length);process.exit(bad.length?1:0);
