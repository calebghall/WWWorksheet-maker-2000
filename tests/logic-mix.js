/* Mixed Practice: every problem placed once, rows fit the width, pages fit the height, deterministic, and denser than the uniform grid. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];let runs=0;
const MODS=['addsub','muldiv','fdp','ns','tm'];
for(const paper of ['letter','a4'])for(const per of [12,20,30])for(const pages of [1,2,3])for(const clock of [false,true])for(const fmt of ['vertical','horizontal'])for(const seed of ['AAA','BBB','CCC']){
  const st=SP.defaults();Object.assign(st,{module:'mix',paper,arPerPage:per,pages,seed});
  st.tm.types.clock=clock;st.as.format=fmt;st.md.format=fmt;st.mix.mods={addsub:true,muldiv:true,fdp:true,ns:true,tm:true};
  const L=SP.mixLayout(st);runs++;
  const P=vm.runInContext('PAPER',ctx)[paper],cw=P.w-1.1,bodyH=P.h-2.25,tag=[paper,per,pages,clock,fmt,seed].join('/');
  const seen=new Set();
  for(const pg of L.pages){let h=0;pg.rows.forEach((r,k)=>{
    h+=(k?0.1:0)+r.h;let cols=0;r.idx.forEach((i,j)=>{seen.add(i);cols+=r.span[j];if(L.sizes[i].h>r.h+1e-9)bad.push(tag+' row height');
      const sw=r.span[j]*((cw-11*0.15)/12)+(r.span[j]-1)*0.15;if(sw<L.sizes[i].w-0.02-1e-9&&r.span[j]<12)bad.push(tag+' cell narrower than need');});
    if(cols>12)bad.push(tag+' row spans '+cols);});
    if(h>bodyH+1e-6&&pg.rows.length>1)bad.push(tag+' page height '+h);}
  if(seen.size!==per*pages||L.items.length!==per*pages)bad.push(tag+' count '+seen.size);
  const again=SP.mixLayout(st);if(JSON.stringify(again.pages)!==JSON.stringify(L.pages))bad.push(tag+' nondeterministic');
  const out=SP.renderAll(st);if(/NaN|undefined/.test(out))bad.push(tag+' junk');
}
/* density: for every single topic, flow never needs more pages than the uniform grid, and is strictly better for the cell-based topics */
const rep=[];
for(const mod of MODS)for(const fmt of ['vertical','horizontal']){
  if(!/addsub|muldiv/.test(mod)&&fmt==='vertical')continue;
  const st=SP.defaults();Object.assign(st,{module:mod,arPerPage:30,pages:1,seed:'AAA'});st.as.format=fmt;st.md.format=fmt;st.tm.types.clock=true;
  const g=SP.arLayout(st,SP.generateSet(st),mod),gridPages=Math.ceil(30/g.total);
  const m=SP.defaults();Object.assign(m,{module:'mix',arPerPage:30,pages:1,seed:'AAA'});m.as.format=fmt;m.md.format=fmt;m.tm.types.clock=true;
  m.mix.mods={addsub:false,muldiv:false,fdp:false,ns:false,tm:false};m.mix.mods[mod]=true;
  const L=SP.mixLayout(m);rep.push(mod+'/'+fmt[0]+' grid '+gridPages+' flow '+L.pages.length);
  if(L.pages.length>gridPages)bad.push(mod+' '+fmt+' flow uses more pages than grid');
  if(['fdp','ns','tm'].includes(mod)&&L.pages.length>=gridPages)bad.push(mod+' no density gain');
}
console.log('runs',runs,'| pages for 30 problems:',rep.join(', '),'| issues',[...new Set(bad)].slice(0,10),bad.length);
if(bad.length)process.exit(1);
