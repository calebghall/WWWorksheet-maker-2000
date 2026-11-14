const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];
const std=JSON.parse(fs.readFileSync(path.join(__dirname,'standards.json'),'utf8'));
const seen=new Set();
for(const s of SP.STANDARDS){
  if(seen.has(s.c))bad.push('duplicate '+s.c);seen.add(s.c);
  if(!std[s.c])bad.push('unknown code '+s.c);
  for(const seed of ['A','B','C']){
    const st=SP.defaults();st.seed=seed;st.pages=2;SP.applyStandard(st,s.c);
    if(st.module!==s.m)bad.push(s.c+' module');
    try{
      const out=SP.renderAll(st);
      if(!out||!out.includes('sheet'))bad.push(s.c+' empty render');
      if(s.m!=='area'){const p=SP.generateSet(st);if(!p.length)bad.push(s.c+' no problems');
        if(s.m==='addsub'){const A=st.as,cap=A.cap||0,L=n=>String(n).length,small=cap&&cap<=30,dl=d=>cap?Math.min(d,L(cap-1)):d,sum=q=>q.nums.reduce((x,y)=>x+y,0);
          const ok=p.every(q=>q.type==='sub'
            ?((small?(q.a<=cap&&q.b>=1):(A.d1===1&&!cap?q.a<=18:L(q.a)<=dl(A.d1)))&&(small||L(q.b)<=A.d2)&&q.a-q.b===q.ans&&q.ans>=0&&(!cap||q.a<=cap))
            :(q.nums.length<=A.addends&&sum(q)===q.ans&&(!cap||q.ans<=cap)&&(small||(L(q.nums[0])<=dl(A.d1)&&q.nums.slice(1).every(n=>L(n)<=Math.max(A.d2,A.second==='digits'?0:2))))));
          if(!ok)bad.push(s.c+' digit range or cap');}
        if(s.m==='muldiv'&&st.md.mode==='digits'){const ok=p.every(q=>q.type==='div'?(q.d<10**st.md.nb&&q.n<10**st.md.na&&q.q*q.d+q.r===q.n):(q.a<10**st.md.da&&q.b<10**st.md.db&&q.a*q.b===q.ans));if(!ok)bad.push(s.c+' digit range');}
        const types=s[s.m==='addsub'||s.m==='muldiv'?null:s.m];
        if(types&&types.types){const allowed=new Set(types.types);if(allowed.has('cmp2'))allowed.add('compare');if(allowed.has('par20'))allowed.add('parity');if(allowed.has('placew'))allowed.add('place');if(allowed.has('roundw'))allowed.add('round');const got=new Set(p.map(q=>q.type));
          for(const t of got)if(!allowed.has(t)&&!(s.c==='4.NF.B.4'&&t==='fmulw'))bad.push(s.c+' unexpected type '+t);}
      }
    }catch(e){bad.push(s.c+' threw '+e.message);}
  }
}
// digit-limits spot checks
console.log('standards presets',SP.STANDARDS.length,'issues',bad.length?bad:[]);
process.exit(bad.length?1:0);
