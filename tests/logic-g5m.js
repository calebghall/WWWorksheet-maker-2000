/* Grade 5 measurement types (unit conversion, line plots with operations, volume): answers and drawings recomputed from each problem's own fields. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];let n=0;
const num=s=>Number(String(s).replace(/,/g,'')),close=(a,b)=>Math.abs(a-b)<1e-6;
const g=(a,b)=>b?g(b,a%b):Math.abs(a);
const FAC={'km>m':1000,'m>cm':100,'cm>mm':10,'kg>g':1000,'g>mg':1000,'L>mL':1000,'yd>ft':3,'ft>in':12,'lb>oz':16,'gal>qt':4,'qt>pt':2,'pt>c':2,'hr>min':60,'min>s':60,'day>hr':24,'dollar>cents':100};
const strip=s=>s.replace(/<[^>]*>/g,'');
const polys=s=>(s.match(/<polygon/g)||[]).length, moves=s=>(s.match(/M/g)||[]).length;
/* grid segments drawn for an l by w by h prism: two per interior line on each of the three directions */
const gridMoves=(l,w,h)=>2*((l-1)+(h-1)+(w-1));
function check(p,id,L){
  n++;const e=m=>bad.push(`${id} L${L}: ${m} ${JSON.stringify(p).slice(0,170)}`);
  if(!p.sig||!p.prompt||!(((p.win>0&&p.hin>0)||(p.ew>0&&p.eh>0))))e('shape');
  switch(id){
  case 'conv5':
    if(p.kind==='one'){const f=FAC[p.big+'>'+p.small];if(!f||f!==p.f)e('factor');
      const v=p.frac?p.frac[0]+p.frac[1]/p.frac[2]:num(p.shown.replace('$',''));
      if(!close(v*f,num(p.ans))||!Number.isInteger(num(p.ans)))e('value '+v*f);
      if(p.frac&&(p.frac[1]<1||p.frac[1]>=p.frac[2]||g(p.frac[1],p.frac[2])!==1))e('fraction');
      if(L===1&&(p.frac&&p.system!=='c'&&p.system!=='t'||p.system==='money'))e('L1 range');}
    else{const eq=p.eq.replace(/,/g,''),r=Function('"use strict";return ('+eq.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-')+')')();
      if(!close(r,num(p.ans)))e('multi '+r);if(L<3)e('multi below L3');
      const t=strip(p.html),toks=eq.replace(/\d+\/\d+/g,'').match(/\d+(?:\.\d+)?/g)||[];
      for(const k of toks)if(![12,60,100,1000].includes(Number(k))&&!t.includes(k))e('missing number '+k);}
    break;
  case 'lplot5':{
    const N=p.counts.reduce((a,b)=>a+b,0),sumK=p.counts.reduce((a,c,i)=>a+c*i,0);
    if(p.counts.length!==p.den+1||N!==p.N||N<4||N>9||p.counts.some(c=>c>3))e('counts');
    if((p.svgFull.match(/class="px"/g)||[]).length!==N||(p.svgBlank.match(/class="px"/g)||[]).length!==0)e('marks');
    if(p.kind==='make'){const k=p.list.slice().sort((a,b)=>a-b),want=[];p.counts.forEach((c,i)=>{for(let j=0;j<c;j++)want.push(i);});if(k.join()!==want.join())e('list');}
    else{const vals=[];p.counts.forEach((c,i)=>{for(let j=0;j<c;j++)vals.push(i);});
      const val=p.kind==='total'?[sumK,p.den]:p.kind==='diff'?[Math.max(...vals)-Math.min(...vals),p.den]:[sumK,p.den*N];
      const got=[p.ans.w*p.ans.d+p.ans.n,p.ans.d];if(got[0]*val[1]!==val[0]*got[1])e('answer');
      if(p.ans.n&&(g(p.ans.n,p.ans.d)!==1||p.ans.n>=p.ans.d))e('simplest');
      if(p.kind==='level'&&(p.ans.d>16||N<3||N>8||L<3))e('level');if(p.kind==='diff'&&L<2)e('diff L1');}
    if(L===1&&p.den>4)e('L1 den');break;}
  case 'vcubes':
    if(p.variant==='count'){if(num(p.ans)!==p.l*p.w*p.h)e('count');if(polys(p.svg)!==3||moves(p.svg)!==gridMoves(p.l,p.w,p.h))e('drawing '+moves(p.svg));
      if(L===1&&p.l*p.w*p.h>12)e('L1 size');if(L===2&&p.l*p.w*p.h>45)e('L2 size');}
    else if(p.variant==='unit'){if(!p.opts.includes(p.ans)||p.ans!==`${p.n} cubic units`||new Set(p.opts).size!==3)e('unit');}
    else if(p.ans!=='1')e('one');
    break;
  case 'vlwh':
    if(p.variant==='word'){if(num(p.ans)!==p.l*p.w*p.h||!strip(p.text).includes(`${p.l} `)||L<3)e('word');}
    else{if(num(p.ans)!==p.l*p.w*p.h||p.B!==p.l*p.w)e('value');
      if(polys(p.svg)!==3)e('polys');if(p.variant!=='bh'&&moves(p.svg)!==gridMoves(p.l,p.w,p.h))e('grid '+moves(p.svg));
      if(p.variant==='bh'&&L<2)e('bh L1');if(L===1&&Math.max(p.l,p.w,p.h)>5)e('L1 edges');}
    break;
  case 'vcomp':{
    if(p.VA!==p.l1*p.w*p.h1||p.VB!==p.l2*p.w*p.h2||num(p.ans)!==p.VA+p.VB)e('volume');
    if(p.h1===p.h2)e('same height');if(polys(p.svg)!==6||moves(p.svg)!==gridMoves(p.l1,p.w,p.h1)+gridMoves(p.l2,p.w,p.h2))e('drawing '+polys(p.svg)+' '+moves(p.svg));
    break;}
  }
}
for(const [id,gen] of [['conv5','NGEN'],['lplot5','NGEN'],['vcubes','VGEN'],['vlwh','VGEN'],['vcomp','VGEN']])for(const L of [1,2,3]){
  const rng=SP.rngFrom('g5m'+id+L);
  for(let i=0;i<1500;i++){const p=SP[gen][id](rng,L);if(p.type!==id){bad.push(id+' wrong type '+p.type);break;}check(p,id,L);}
}
console.log('g5 measurement problems checked',n,'; issues',bad.length?bad.slice(0,20):[],bad.length);
process.exit(bad.length?1:0);
