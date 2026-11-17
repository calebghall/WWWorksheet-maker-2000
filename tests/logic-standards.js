const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];
const std=JSON.parse(fs.readFileSync(path.join(__dirname,'standards.json'),'utf8'));
const seen=new Set();
/* Checks the problems of one module configuration against the preset (or part) that set it. */
function checkUnit(code,m,spec,st,p,fix){
  if(!p.length)bad.push(code+' no problems');
  if(m==='addsub'){const A=st.as,cap=A.cap||0,L=n=>String(n).length,small=cap&&cap<=30,dl=d=>cap?Math.min(d,L(cap-1)):d,sum=q=>q.nums.reduce((x,y)=>x+y,0);
    const ok=p.every(q=>q.type==='sub'
      ?((small?(q.a<=cap&&q.b>=1):(A.d1===1&&!cap?q.a<=18:L(q.a)<=dl(A.d1)))&&(small||L(q.b)<=A.d2)&&q.a-q.b===q.ans&&q.ans>=0&&(!cap||q.a<=cap))
      :(q.nums.length<=A.addends&&sum(q)===q.ans&&(!cap||q.ans<=cap)&&(small||(L(q.nums[0])<=dl(A.d1)&&q.nums.slice(1).every(n=>L(n)<=Math.max(A.d2,A.second==='digits'?0:2))))));
    if(!ok)bad.push(code+' digit range or cap');}
  if(m==='muldiv'&&st.md.mode==='digits'){const ok=p.every(q=>q.type==='div'?(q.d<10**st.md.nb&&q.n<10**st.md.na&&q.q*q.d+q.r===q.n):((q.a<10**st.md.da&&q.b<10**st.md.db||st.md.alt&&q.a<10**st.md.da2&&q.b<10**st.md.db2)&&q.a*q.b===q.ans));if(!ok)bad.push(code+' digit range');}
  const types=spec[m==='addsub'||m==='muldiv'?null:m];
  if(types&&types.types){const allowed=new Set(types.types.map(r=>r.replace(/^[a-z]+\./,'')));if(allowed.has('cmp2'))allowed.add('compare');if(allowed.has('par20'))allowed.add('parity');if(allowed.has('placew'))allowed.add('place');if(allowed.has('roundw'))allowed.add('round');const got=new Set(p.map(q=>q.type));
    for(const t of got)if(!allowed.has(t)&&!(code==='4.NF.B.4'&&t==='fmulw'))bad.push(code+' unexpected type '+t);}
}
for(const s of SP.STANDARDS){
  if(seen.has(s.c))bad.push('duplicate '+s.c);seen.add(s.c);
  if(!std[s.c])bad.push('unknown code '+s.c);
  for(const seed of ['A','B','C']){
    const st=SP.defaults();st.seed=seed;st.pages=2;SP.applyStandard(st,s.c);
    const want=s.m==='parts'?(s.view||'combo'):s.m;
    if(st.module!==want)bad.push(s.c+' module');
    try{
      const out=SP.renderAll(st);
      if(!out||!out.includes('sheet'))bad.push(s.c+' empty render');
      if(s.m==='parts'){
        if(!Array.isArray(st.parts)||st.parts.length<2)bad.push(s.c+' parts missing');
        if(want==='combo'){const secs=SP.comboSections(st);
          if(secs.length!==s.parts.length)bad.push(s.c+' sections '+secs.length);
          secs.forEach((sec,i)=>{const part=s.parts[i],ps=SP.partState(st,part);checkUnit(s.c+' part '+sec.letter,part.m,part,ps,sec.plan.probs);});}
      }else if(s.m!=='area')checkUnit(s.c,s.m,s,st,SP.generateSet(st));
    }catch(e){bad.push(s.c+' threw '+e.message);}
  }
}
/* All standards for a grade: a Combined Worksheet whose sections cover every preset type of the grade. */
for(const g of ['K','1','2','3','4','5']){
  for(const seed of ['A','B','C']){
    const st=SP.defaults();st.seed=seed;st.pages=2;
    if(!SP.applyGradeStandards(st,g)){bad.push('grade '+g+' no parts');continue;}
    if(st.module!=='combo'||!st.parts||st.parts.length<2||st.parts.length>16)bad.push('grade '+g+' parts '+(st.parts&&st.parts.length));
    const want=new Set();for(const s of SP.STANDARDS)if(s.c.split('.')[0]===g)for(const p of (s.m==='parts'?s.parts:[s]))if(p.m!=='addsub'&&p.m!=='muldiv')p[p.m].types.forEach(t=>want.add(p.m+'|'+t));
    const have=new Set();for(const p of st.parts)if(p.m!=='addsub'&&p.m!=='muldiv'){const t=p[p.m].types;(Array.isArray(t)?t:Object.keys(t).filter(k=>t[k])).forEach(x=>have.add(p.m+'|'+x));}
    for(const k of want)if(!have.has(k))bad.push('grade '+g+' misses '+k);
    try{const out=SP.renderAll(st);if(!out||!out.includes('sheet'))bad.push('grade '+g+' empty render');SP.comboSections(st).forEach(sec=>{if(!sec.plan.probs.length)bad.push('grade '+g+' empty section '+sec.letter);});}catch(e){bad.push('grade '+g+' threw '+e.message);}
  }
}
// digit-limits spot checks
console.log('standards presets',SP.STANDARDS.length,'issues',bad.length?bad:[]);
process.exit(bad.length?1:0);
