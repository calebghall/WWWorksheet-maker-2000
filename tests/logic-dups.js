/* Duplicate problems. Two checks, both on the built page:
   1. A problem's sig must change whenever what is drawn changes, and only then: two problems with the same question and drawing but different sigs
      defeat the repeat filter (the "How long is a door?" twice bug).
   2. With default settings, a worksheet of up to 36 problems never repeats a problem.
   Types with a small pool (listed in generators.md) can still repeat when a sheet asks for more problems than the pool holds; that is not tested here. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,R=SP.REG,K={fdp:'fd',ns:'ns',tm:'tm',vis:'vis'},bad=[];
const look=(pl,p)=>(p.prompt||'')+'|'+pl.cell(p,1,false);
let checked=0;
/* 1. same drawing must mean same sig; every single type, three levels, several seeds */
for(const mod of Object.keys(K)){const k=K[mod],types=Object.keys(SP.defaults()[k].types);
  for(const t of types)for(const L of [1,2,3]){
    const seen=new Map();
    for(let s=0;s<12;s++){const st=SP.defaults();st.module=mod;st[k].level=L;for(const x of types)st[k].types[x]=x===t;
      for(const p of R[mod].plan(st,30,'T'+s).probs){const key=look(R[mod].plan(st,1,'T'+s),p).replace(/id="cn?\d+\w*"/g,'');checked++;
        const q=seen.get(key);if(q!==undefined&&q!==p.sig&&bad.length<12)bad.push(`${mod}.${t} L${L}: same drawing, different sig: ${q} vs ${p.sig}`);seen.set(key,p.sig);}}
  }}
/* 2. default settings, every module, 12 to 36 problems, many seeds: no repeats */
for(const mod of ['addsub','muldiv','fdp','ns','tm','vis'])for(const n of [12,24,36])for(let s=0;s<60;s++){
  const st=SP.defaults();st.module=mod;const pl=R[mod].plan(st,n,'D'+s),seen=new Set();
  for(const p of pl.probs){const key=look(pl,p).replace(/id="cn?\d+\w*"/g,'');if(seen.has(key)){if(bad.length<12)bad.push(`${mod} n=${n} seed D${s}: repeated problem "${p.prompt}"`);break;}seen.add(key);}
}
console.log(`dups: ${checked} problems compared; issues`,bad.slice(0,12),bad.length);
process.exit(bad.length?1:0);
