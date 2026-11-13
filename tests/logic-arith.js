const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const parts=html.split('<script>')[1].split('</script>')[0];
const js=parts.split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];let n=0;const D=()=>SP.defaults();
const len=x=>String(x).length;
// add/sub with every digit mixture
for(const d1 of [1,2,3,4])for(const d2 of [1,2,3,4])for(const regroup of ['any','required','none'])for(const addends of [2,3])for(const format of ['vertical','horizontal'])for(let i=0;i<5;i++){
  const s=D();Object.assign(s,{module:'addsub',seed:'S'+i,pages:2,arPerPage:30});Object.assign(s.as,{d1,d2,regroup,addends,format,add:true,sub:true});
  for(const p of SP.generateSet(s)){n++;
    if(p.type==='add'){if(p.ans!==p.nums.reduce((a,b)=>a+b,0))bad.push('addans');
      if(len(p.nums[0])!==d1)bad.push('add d1 '+d1+' '+p.nums);
      if(p.nums.slice(1).some(x=>len(x)!==d2))bad.push('add d2');
      if(p.nums.length!==addends)bad.push('addends');
      if(regroup==='required'&&!SP.carries(p.nums))bad.push('req carry');if(regroup==='none'&&SP.carries(p.nums))bad.push('none carry '+p.nums);}
    else{const e2=Math.min(d2,d1);if(p.ans!==p.a-p.b||p.ans<0)bad.push('subans');
      if(!(d1===1&&p.a<=18)&&len(p.a)!==d1)bad.push('sub d1 '+d1+' '+p.a);
      if(len(p.b)!==e2)bad.push('sub d2 '+e2+' '+p.b+' d1 '+d1);
      if(regroup==='required'&&!SP.borrows(p.a,p.b))bad.push('req borrow '+p.a+' '+p.b);if(regroup==='none'&&SP.borrows(p.a,p.b))bad.push('none borrow '+p.a+' '+p.b);}
  }
}
// mul digits incl 3x3, div digits
for(const da of [1,2,3,4])for(const db of [1,2,3])for(const rem of [false,true])for(let i=0;i<6;i++){
  const s=D();Object.assign(s,{module:'muldiv',seed:'M'+i,pages:1,arPerPage:30});Object.assign(s.md,{mode:'digits',da,db,rem,mul:true,div:false});
  for(const p of SP.generateSet(s)){n++;if(p.ans!==p.a*p.b||len(p.a)!==da||len(p.b)!==db)bad.push('mul '+da+'x'+db);if(p.pp!==(db>1))bad.push('pp');}
}
for(const na of [2,3,4,5])for(const nb of [1,2])for(const rem of [false,true])for(let i=0;i<8;i++){
  const s=D();Object.assign(s,{module:'muldiv',seed:'V'+i,pages:2,arPerPage:30});Object.assign(s.md,{mode:'digits',na,nb,rem,mul:false,div:true});
  const dn=Math.max(na,nb+1);
  for(const p of SP.generateSet(s)){n++;if(p.n!==p.d*p.q+p.r||p.r<0||p.r>=p.d)bad.push('div');if(len(p.d)!==nb)bad.push('div nb');
    if(rem!==(p.r>0))bad.push('rem');if(len(p.n)!==dn)bad.push('div n digits '+na+'/'+nb+' got '+p.n);}
}
// facts still ok
{const s=D();s.module='muldiv';s.pages=2;s.arPerPage=30;Object.assign(s.md,{mode:'facts',tables:12});for(const p of SP.generateSet(s)){n++;if(p.type==='mul'&&(p.ans!==p.a*p.b||p.pp))bad.push('fact')}}
// no sum line in worksheet for 2-digit mult; present in key
{const s=D();Object.assign(s,{module:'muldiv',seed:'Q',key:true,arPerPage:12});Object.assign(s.md,{mode:'digits',da:2,db:2,mul:true,div:false});
 const out=SP.renderAll(s);const pg=out.split('<article');const ws=pg[1],key=pg[2];
 const vls=h=>(h.match(/class="vl"/g)||[]).length;
 console.log('lines per 2x2 problem: worksheet',vls(ws)/12,'key',vls(key)/12);}
// 3x3 vertical layout: all problems must fit, lowering per-page count when needed
for(const per of [30,20,12]){const s=D();Object.assign(s,{module:'muldiv',seed:'T',arPerPage:per,pages:1});Object.assign(s.md,{mode:'digits',da:3,db:3,mul:true,div:false});
 const probs=SP.generateSet(s),lay=SP.arLayout(s,probs);console.log('3x3 requested',per,'-> total',lay.total,'cols',lay.cols,'fs',lay.fs,'fits',lay.fits);if(!lay.fits)bad.push('3x3 nofit '+per);}
// all layouts fit for every size combo (vertical)
for(const [d1,d2] of [[4,4],[4,3],[3,2]]){const s=D();Object.assign(s,{module:'addsub',seed:'L',arPerPage:30});Object.assign(s.as,{d1,d2,addends:3});const lay=SP.arLayout(s,SP.generateSet(s));if(!lay.fits)bad.push('as nofit '+d1+d2)}
// combined worksheet
for(const paper of ['letter','a4'])for(let i=0;i<30;i++){
  const s=D();Object.assign(s,{module:'combo',seed:'C'+i,paper});
  for(const id of Object.keys(s.combo)){s.combo[id].on=(i+id.length)%3!==0||id==='area';s.combo[id].n=SP.REG[id].counts[i%SP.REG[id].counts.length];}
  Object.assign(s.md,{mode:'digits',da:3,db:3});
  const html=SP.renderAll(s),m=SP.META,secs=SP.comboSections(s),pgs=SP.comboPages(s,secs);
  const exp=secs.reduce((a,x)=>a+x.plan.probs.length,0);
  if(exp!==m.problems)bad.push('combo count');
  // numbering continuous and each problem shown once on worksheet pages
  const ws=html.split('<article').slice(1,1+pgs.length).join('');
  const nums=[...ws.matchAll(/class="(?:p-num|an)">(\d+)</g)].map(x=>+x[1]).sort((a,b)=>a-b);
  if(nums.length!==exp||nums.some((v,k)=>v!==k+1))bad.push('combo numbering '+nums.length+'/'+exp);
  // heights fit
  const bodyH=SP.REG&&(paper==='letter'?11:11.69)-2.22;
  for(const pg of pgs)if(pg.h>bodyH+1e-6&&pg.parts.length>1)bad.push('page overfull '+pg.h.toFixed(2)+'>'+bodyH.toFixed(2));
  if((html.match(/class="sheet"/g)||[]).length!==pgs.length*2)bad.push('sheet count');
  if(/NaN|undefined|null/.test(html))bad.push('combo junk');
}
console.log('checked',n,'problems; issues',[...new Set(bad)]);
