const fs=require('fs'),vm=require('vm'),path=require('path'),cp=require('child_process');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];
/* every framework, not only the embedded ones: the build tool writes each one's payload file, which registers itself */
cp.execFileSync(process.env.PYTHON||(process.platform==='win32'?'python':'python3'),[path.join(__dirname,'..','tools','build_fw.py')],{stdio:'ignore'});
const dist=path.join(__dirname,'..','standards','dist');
for(const f of fs.readdirSync(dist).filter(f=>f.endsWith('.js')))vm.runInContext(fs.readFileSync(path.join(dist,f),'utf8'),ctx);
let std;
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
  if(types&&types.types){const allowed=new Set(types.types.map(r=>r.replace(/^[a-z]+\./,'')));if(allowed.has('cmp2'))allowed.add('compare');if(allowed.has('par20'))allowed.add('parity');if(allowed.has('placew'))allowed.add('place');if(allowed.has('roundw'))allowed.add('round');if(allowed.has('cmprng'))allowed.add('compare');if(allowed.has('ordrng'))allowed.add('order');if(allowed.has('numrw12'))allowed.add('numrw3');if(allowed.has('par40')){allowed.add('parity');allowed.add('par20');}if(allowed.has('bign')){allowed.add('compare');allowed.add('place');}const got=new Set(p.map(q=>q.type));
    for(const t of got)if(!allowed.has(t)&&!(spec.id==='frac.multiply-whole-number-fraction'&&t==='fmulw'))bad.push(code+' unexpected type '+t);}
}
const used=new Set();
for(const s of SP.STANDARDS){if(seen.has(s.id))bad.push('duplicate preset id '+s.id);seen.add(s.id);if(!/^[a-z]+\.[a-z0-9-]+$/.test(s.id))bad.push('bad preset id '+s.id);}
for(const fw of Object.keys(SP.STD_FW)){const XW=SP.STD_FW[fw].xw;std=JSON.parse(fs.readFileSync(path.join(__dirname,'..','standards',fw+'.json'),'utf8')).rows;
for(const code of Object.keys(XW)){const s=SP.stdPreset(code,fw),x=XW[code];
  if(!std[code])bad.push('unknown code '+code);
  if(!s){if(x.status!=='gap')bad.push(code+' has no preset but is '+x.status);continue;}
  x.to.forEach(i=>used.add(i));
  for(const seed of ['A','B','C']){
    const st=SP.defaults();st.seed=seed;st.pages=2;st.std.f=fw;SP.applyStandard(st,code);
    const want=s.m==='parts'?(s.view||'combo'):s.m;
    if(st.module!==want)bad.push(code+' module');
    try{
      const out=SP.renderAll(st);
      if(!out||!out.includes('sheet'))bad.push(code+' empty render');
      if(s.m==='parts'){
        if(!Array.isArray(st.parts)||st.parts.length<2)bad.push(code+' parts missing');
        if(want==='combo'){const secs=SP.comboSections(st);
          if(secs.length!==s.parts.length)bad.push(code+' sections '+secs.length);
          secs.forEach((sec,i)=>{const part=s.parts[i],ps=SP.partState(st,part);checkUnit(code+' part '+sec.letter,part.m,part,ps,sec.plan.probs);});}
      }else if(s.m!=='area')checkUnit(code,s.m,s,st,SP.generateSet(st));
    }catch(e){bad.push(code+' threw '+e.message);}
  }
}
for(const code of Object.keys(std))if(!XW[code])bad.push('no crosswalk row for '+code);
}
for(const s of SP.STANDARDS)if(!used.has(s.id))bad.push('preset '+s.id+' is used by no standard');
const XW=SP.STD_FW.tn.xw;
/* All standards for a grade: a Combined Worksheet with a section for every standard of the grade (found by its code in the label),
   running the standard's own module, types and level. */
for(const g of ['K','1','2','3','4','5']){
  for(const seed of ['A','B','C']){
    const st=SP.defaults();st.seed=seed;st.pages=2;
    if(!SP.applyGradeStandards(st,g)){bad.push('grade '+g+' no parts');continue;}
    if(st.module!=='combo'||!st.parts||st.parts.length<2||st.parts.length>64)bad.push('grade '+g+' parts '+(st.parts&&st.parts.length));
    const want=new Set();for(const c of Object.keys(XW))if(c.split('.')[0]===g&&SP.stdPreset(c)){const s=SP.stdPreset(c);for(const p of (s.m==='parts'?s.parts:[s]))if(p.m!=='addsub'&&p.m!=='muldiv')p[p.m].types.forEach(t=>want.add(p.m+'|'+t));}
    const have=new Set();for(const p of st.parts)if(p.m!=='addsub'&&p.m!=='muldiv'){const t=p[p.m].types;(Array.isArray(t)?t:Object.keys(t).filter(k=>t[k])).forEach(x=>have.add(p.m+'|'+x));}
    for(const k of want)if(!have.has(k))bad.push('grade '+g+' misses '+k);
    const norm=v=>{const t=v.types;return JSON.stringify([(Array.isArray(t)?t:Object.keys(t).filter(k=>t[k])).slice().sort(),v.level]);};
    for(const c of Object.keys(XW))if(c.split('.')[0]===g&&SP.stdPreset(c)){
      const sp=SP.stdPreset(c),exp=(sp.m==='parts'?sp.parts:[sp]),mine=st.parts.filter(p=>p.label.split(' ')[0].split(',').length&&p.label.includes(c));
      if(mine.length!==exp.length){bad.push('grade '+g+' '+c+' has '+mine.length+' sections, wants '+exp.length);continue;}
      exp.forEach((e,i)=>{const q=mine[i];if(q.m!==e.m)bad.push('grade '+g+' '+c+' module '+q.m);else if(e.m!=='addsub'&&e.m!=='muldiv'){if(norm(q[q.m])!==norm(e[e.m]))bad.push('grade '+g+' '+c+' settings differ');}else{const A=e.as||e.md,B=q.as||q.md;for(const k of Object.keys(A))if(JSON.stringify(A[k])!==JSON.stringify(B[k]))bad.push('grade '+g+' '+c+' '+e.m+' setting '+k);}});
    }
    try{const out=SP.renderAll(st);if(!out||!out.includes('sheet'))bad.push('grade '+g+' empty render');SP.comboSections(st).forEach(sec=>{if(!sec.plan.probs.length)bad.push('grade '+g+' empty section '+sec.letter);});}catch(e){bad.push('grade '+g+' threw '+e.message);}
  }
}
/* A chosen set of standards: one section per standard, in preset order, skipping a code with no preset; the title counts them. */
{
  const codes=['3.OA.A.1','3.NBT.A.2','K.CC.A.3','NOPE'].filter(c=>XW[c]||c==='NOPE'),parts=SP.standardParts(codes,'tn');
  const want=codes.filter(c=>XW[c]&&SP.stdPreset(c));
  if(parts.length<want.length)bad.push('standardParts sections '+parts.length+' < '+want.length);
  for(const c of want)if(!parts.some(p=>p.label.includes(c)))bad.push('standardParts misses '+c);
  const st=SP.defaults();st.std.f='tn';
  if(!SP.applyStandardSet(st,want)||st.module!=='combo'||st.parts.length!==parts.length||!/standards/.test(st.titles.combo))bad.push('applyStandardSet');
  if(SP.applyStandardSet(SP.defaults(),['NOPE'])!==false)bad.push('applyStandardSet accepts no preset');
  const st2=SP.defaults();st2.std.f='tn';if(!SP.applyStandardSet(st2,[want[0]])||st2.titles.combo!==want[0])bad.push('single title');
  try{if(!SP.renderAll(st).includes('sheet'))bad.push('chosen set render');}catch(e){bad.push('chosen set threw '+e.message);}
}
// digit-limits spot checks
console.log('standards presets',SP.STANDARDS.length,'crosswalk rows',Object.keys(SP.STD_FW).map(f=>f+' '+Object.keys(SP.STD_FW[f].xw).length).join(', '),'issues',bad.length?bad:[]);
process.exit(bad.length?1:0);
