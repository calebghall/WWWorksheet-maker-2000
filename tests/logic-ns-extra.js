/* Number Sense types added to ns-place, ns-counting, ns-factors, ns-measure and ns-words (placew, roundw, fdec, tenx, rulepat, facmodel, convm, rectf, mword, lineplot) and six-digit addition and subtraction: answers recomputed from each problem's own fields. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,E=x=>vm.runInContext(x,ctx),bad=[];let n=0;
const TYPES=['placew','roundw','fdec','tenx','rulepat','facmodel','convm','rectf','mword','lineplot'];
const num=s=>Number(String(s).replace(/,/g,'')),cn=v=>v>=1000?String(v).replace(/\B(?=(\d{3})+(?!\d))/g,','):String(v);
const ev=e=>Function('"use strict";return ('+e.replace(/,/g,'').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-')+')')();
const PL=['ones','tens','hundreds','thousands','ten thousands','hundred thousands'],UN={ten:10,hundred:100,thousand:1000,'ten thousand':10000,'hundred thousand':100000};
const RULE=(op,d)=>({add:(v)=>v+d,sub:(v)=>v-d,mul:(v)=>v*d}[op]);
const parseRule=t=>{const m=t.match(/^(add|subtract|multiply by) (\d+)$/);return m?[m[1]==='add'?'add':m[1]==='subtract'?'sub':'mul',+m[2]]:null;};
const seqOf=(op,d,a0,k)=>{const s=[a0];for(let i=1;i<k;i++)s.push(RULE(op,d)(s[i-1]));return s;};
function chk(p,id,L){n++;const e=m=>bad.push(`${id} L${L}: ${m} ${JSON.stringify(p).slice(0,170)}`);
 if(!p.sig||!p.prompt||!((p.win>0&&p.hin>0)||(p.ew>0&&p.eh>0)))e('shape');
 switch(id){
 case 'placew':{if(p.type!=='place')e('type');if([p.shown,p.ans,p.std,p.expd].some(v=>/\./.test(String(v||''))))e('decimal');
  const digits=(p.shown||'').replace(/<\/?u>/g,'').replace(/,/g,'');if(digits.length>6)e('too long');
  if(p.variant==='expand'){if(p.expd.split(' + ').map(num).reduce((a,b)=>a+b,0)!==num(digits))e('expand');}
  else if(p.variant==='standard'){if(p.expd.split(' + ').map(num).reduce((a,b)=>a+b,0)!==num(p.std))e('standard');}
  else if(p.variant==='digit'){const idx=p.shown.split('<u>')[0].replace(/,/g,'').length;if(p.ans!==cn(+digits[idx]*Math.pow(10,digits.length-1-idx)))e('digit value');}
  else{const pl=p.prompt.replace('Digit in the ','').replace(' place:','');if(p.ans!==digits[digits.length-1-PL.indexOf(pl)])e('which');}
  break;}
 case 'roundw':{if(p.type!=='round')e('type');const name=p.prompt.replace('Round to the nearest ','').replace(':',''),u=UN[name],v=num(p.shown);
  if(!u||v%u===0||v>999999||v<=u||p.ans!==cn(Math.floor((v+u/2)/u)*u))e('round');
  if(L===1&&u>100||L===2&&u>1000||L===3&&u<100)e('level');break;}
 case 'fdec':{const dp=p.den===10?1:2;if(![10,100].includes(p.den))e('den');if(Math.round(parseFloat(p.dec)*p.den)!==p.m||p.dec.split('.')[1].length!==dp)e('dec');
  if(p.kind==='f2d'||p.kind==='line'){if(p.ans!==p.dec)e('ans');}else if(p.ans!==String(p.m))e('d2f');
  if(p.den===100&&p.m%10===0)e('trailing zero');
  if(p.kind==='line'){const lab=[...p.svg.matchAll(/<text class="lab"[^>]*>([^<]+)<\/text>/g)].map(m=>parseFloat(m[1])),ax=+p.svg.match(/d="M([\d.]+) 4V19"/)[1],k=(ax-20)/23;
   if(Math.abs(lab[0]+(lab[1]-lab[0])*k/10-parseFloat(p.dec))>1e-9||!Number.isInteger(Math.round(k*1e6)/1e6)||k<1||k>9)e('line');if(p.den===10&&(lab[0]!==0||lab[1]!==1))e('tenths line');if(p.den===100&&Math.abs(lab[1]-lab[0]-0.1)>1e-9)e('hundredths line');}
  break;}
 case 'tenx':{if(p.kind==='dig'){const u=p.shown.match(/<u>(\d)<\/u>/g)||[];if(u.length!==2||u[0]!==u[1]||!/<\/u>,?<u>/.test(p.shown)||p.ans!=='10'||/<u>0<\/u>/.test(p.shown))e('dig');}
  else if(p.kind==='x10'){if(p.ans!==cn(p.a*10)||p.a*10>1000000)e('x10');}
  else if(p.a%10||p.ans!==cn(p.a/10)||p.a>=1000000)e('div10');break;}
 case 'rulepat':{if(p.kind==='next'){const m=p.prompt.match(/^Rule: (.+)\. Start at (\d+)\.$/),r=parseRule(m[1]),s=seqOf(r[0],r[1],+m[2],5),us=p.tok.filter(t=>typeof t==='object').map(t=>+t.u);
   if(us.join()!==s.slice(1).join()||s.some(v=>v<0))e('next');}
  else if(p.kind==='rule'){const r=parseRule(p.ans);if(!r||seqOf(r[0],r[1],p.seq[0],5).join()!==p.seq.join()||!p.opts.includes(p.ans)||p.opts.length!==3||new Set(p.opts).size!==3)e('rule');
   for(const o of p.opts)if(o!==p.ans){const q=parseRule(o);if(!q||seqOf(q[0],q[1],p.seq[0],5).join()===p.seq.join())e('distractor fits');}}
  else if(p.kind==='feat'){const m=p.prompt.match(/^Rule: add (\d+)\. Start at (\d+)\./),s=seqOf('add',+m[1],+m[2],5),ev2=s.filter(v=>v%2===0).length;
   if(p.seq.join()!==s.join()||p.ans!==(ev2===5?'all even':ev2===0?'all odd':'even and odd'))e('feat');}
  else{const d=p.counts[1]-p.counts[0];if(p.counts[2]-p.counts[1]!==d||p.prompt!==`Rule: add ${d} squares each time.`||p.ans!==String(p.counts[0]+4*d)||(p.svg.match(/<rect/g)||[]).length!==p.counts.reduce((a,b)=>a+b,0))e('shape pattern');}
  break;}
 case 'facmodel':{if(p.n!==p.r*p.c||p.r<2||p.c<2)e('product');
  if(p.kind==='read'){if((p.svg.match(/<circle/g)||[]).length!==p.n||p.tok.filter(t=>typeof t==='object').map(t=>+t.u).join()!==[p.r,p.c].join())e('read');}
  else if(p.ans!==`${p.r} × ${p.c}`||!p.prompt.includes(String(p.n)))e('draw');break;}
 case 'convm':{const row=E('NS_CONV').find(r=>r[0]===p.big&&r[1]===p.small);if(!row){e('pair');break;}const f=row[2];
  if(p.kind==='one'){if(p.ans!==cn(p.n*f)||p.n<2)e('one');}else if(p.ans!==cn(p.a*f+p.b)||p.b<1||p.b>=f)e('mix');
  if(p.kind==='mix'&&L!==3)e('mix level');break;}
 case 'rectf':{const A=p.l*p.w,P=2*(p.l+p.w);if(p.l<=p.w||p.w<2)e('sides');if(ev(p.eq)!==+p.ans)e('eq');
  if(p.kind==='area'&&+p.ans!==A)e('area');if(p.kind==='perim'&&+p.ans!==P)e('perim');
  if(p.kind==='unkA'&&(!p.text.includes(`area of ${A} `)||![p.l,p.w].includes(+p.ans)))e('unkA');if(p.kind==='unkP'&&(!p.text.includes(`perimeter of ${P} `)||![p.l,p.w].includes(+p.ans)))e('unkP');
  if(!Number.isInteger(+p.ans)||+p.ans<=0)e('ans');if(L===1&&(p.kind==='unkA'||p.kind==='unkP'))e('level');break;}
 case 'lineplot':{const c=p.counts,den=p.den,tot=c.reduce((a,b)=>a+b,0),sum=(a,b)=>c.slice(a,b).reduce((x,y)=>x+y,0);
  if(c.length!==den+1||![2,4,8].includes(den)||c.some(v=>v<0||v>4)||tot<6||tot>14)e('data');
  if((p.svg.match(/class="px"/g)||[]).length!==tot)e('marks');
  if(L===1&&den===8||L>1&&den===2)e('den level');
  const nz=c.map((v,i)=>v>0?i:-1).filter(i=>i>=0);if(nz.length<Math.min(3,den+1))e('spread');
  if(p.kind==='count'){if(p.ans!==String(c[p.k])||c[p.k]<1)e('count');}
  else if(p.kind==='more'){if(p.ans!==String(sum(p.k+1)||0)||sum(p.k+1)<1||p.k<1)e('more');}
  else if(p.kind==='diff'){if(L===1||p.ans!==String(nz[nz.length-1]-nz[0]))e('diff');}
  else{if(L!==3||c[p.k]<2||p.num!==c[p.k]*p.k||p.ans!==p.num+'/'+den)e('total');}
  if(!/<span class="fr">|exactly|than|units|end to end/.test(p.q))e('question');break;}
 case 'mword':{const a=num(p.ans);if(!Number.isInteger(a)||a<=0)e('ans');
  if(p.kind==='time'){const m=p.text.match(/starts at (\d+):(\d\d) and ends at (\d+):(\d\d)/);if(!m||(+m[3]*60+ +m[4])-(+m[1]*60+ +m[2])!==a)e('time');}
  else if(ev(p.eq)!==a)e('eq');
  if(p.kind==='two'&&!/ are left\?$/.test(p.text))e('two text');
  if(L===1&&!['add','sub','mul'].includes(p.kind)||L===2&&!['two','sub','mul'].includes(p.kind)||L===3&&!['conv','money','time'].includes(p.kind))e('level');break;}
 }}
for(const L of [1,2,3])for(const id of TYPES)for(let i=0;i<600;i++)chk(SP.NGEN[id](SP.rngFrom('TYPES'+i+id),L),id,L);
/* every type renders in a worksheet, with and without the key, and the default is off */
const dflt=SP.defaults();for(const id of TYPES)if(dflt.ns.types[id]!==false)bad.push('default on '+id);
for(const id of TYPES)for(const L of [1,2,3]){const s=SP.defaults();s.module='ns';s.seed='R4'+id;s.pages=2;s.arPerPage=12;s.ns.level=L;for(const k of Object.keys(s.ns.types))s.ns.types[k]=k===id;
 for(const key of [false,true]){s.key=key;const out=SP.renderAll(s);if(/NaN|undefined|null|\[object/.test(out))bad.push(`junk render ${id} L${L} key${key}`);const a=(out.match(/<svg/g)||[]).length,b=(out.match(/<\/svg>/g)||[]).length;if(a!==b)bad.push(`svg balance ${id} L${L}`);}}
/* variety: enough distinct problems for one sheet at every level */
for(const id of TYPES)for(const L of [1,2,3]){const sg=new Set();for(let i=0;i<200;i++)sg.add(SP.NGEN[id](SP.rngFrom('V'+i+id),L).sig);if(sg.size<12)bad.push(`low variety ${id} L${L} ${sg.size}`);}
/* five- and six-digit addition and subtraction, and the 1,000,000 limit */
const len=v=>String(v).length;
for(const [d1,d2] of [[5,5],[6,6],[6,4],[5,3]])for(const cap of [0,1000000])for(let i=0;i<30;i++){const s=SP.defaults();Object.assign(s,{module:'addsub',seed:'S'+i+d1+d2,pages:2,arPerPage:30});Object.assign(s.as,{d1,d2,cap,add:true,sub:true});
 for(const p of SP.generateSet(s)){n++;
  if(p.type==='add'){if(p.nums.reduce((a,b)=>a+b,0)!==p.ans||len(p.nums[0])!==d1||(cap&&p.ans>cap))bad.push(`add ${d1}/${d2}/${cap} ${p.nums}`);}
  else if(p.a-p.b!==p.ans||p.ans<0||len(p.a)!==d1||len(p.b)>d2||(cap&&p.a>cap))bad.push(`sub ${d1}/${d2}/${cap} ${p.a} ${p.b}`);}
 const out=SP.renderAll(s);if(/NaN|undefined/.test(out))bad.push('junk addsub render');}
console.log('ns-extra problems checked',n,'; issues',[...new Set(bad)].slice(0,14),bad.length);process.exit(bad.length?1:0);
