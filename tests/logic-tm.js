const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];let n=0;
const num=s=>Number(String(s).replace(/[$¢,]/g,''));
const cents=s=>s.includes('$')?Math.round(num(s)*100):num(s);
const SEC={s:1,min:60,h:3600,day:86400,week:604800};
const COIN={b5:500,b1:100,q:25,d:10,n:5,p:1};
const parseT=s=>{const m=s.match(/^(\d+):(\d\d) (AM|PM)$/);return (+m[1]%12+(m[3]==='PM'?12:0))*60+ +m[2];};
function check(p,tag){n++;const e=m=>bad.push(tag+' '+p.type+': '+m);
  switch(p.type){
  case 'coins':{const t=p.items.reduce((a,i)=>a+COIN[i.id]*i.n,0);if(t!==p.total||Math.round(num(p.ans)*(p.unit==="d"?100:1))!==t)e('total '+t+' '+p.ans);
    const txt=p.lines.join(', ');if(p.items.length!==txt.split(', ').length)e('lines');
    if(p.unit==='c'&&t>=100)e('cents>=100');if(p.unit==='d'&&t<100)e('dollars<100');break;}
  case 'madd':{const v=p.expr.split(/ [+−] /).map(cents);const r=p.op==='+'?v.reduce((a,b)=>a+b,0):v[0]-v[1];
    if(r<0||Math.round(num(p.ans)*(p.unit==='d'?100:1))!==r)e('madd '+p.expr+' '+p.ans);if(p.unit==='c'&&(r>=100||v.some(x=>x%5)))e('cents range');break;}
  case 'change':{const r=p.paid-p.cost;if(r<=0||Math.round(num(p.ans)*(p.unit==='d'?100:1))!==r)e('change');if(p.unit==='c'&&p.paid!==100)e('paid');break;}
  case 'clock':{const hh=p.svg.match(/class="hh"[^>]*x2="([\d.]+)" y2="([\d.]+)"/),mh=p.svg.match(/class="mh"[^>]*x2="([\d.]+)" y2="([\d.]+)"/);
    const ang=(m)=>((Math.atan2(+m[1]-50,50-+m[2])*180/Math.PI)+360)%360;
    const m=Math.round(ang(mh)/6)%60,hr=ang(hh)/30,h=Math.floor(hr+1e-6)||12;
    const hExpected=Math.floor((hr-m/60+0.5/60*0+1e-6)+0.5);
    if(`${((Math.round(hr-m/60))%12)||12}:${String(m).padStart(2,'0')}`!==p.ans)e('clock '+p.ans+' got '+m+' '+hr);break;}
  case 'elapsed':{const s=parseT(p.from),en=parseT(p.to);if(en-s!==p.hh*60+p.mm||en<=s)e('elapsed '+p.from+' '+p.to);break;}
  case 'conv':{const t=a=>a.reduce((x,q)=>x+num(q.v)*SEC[q.u],0);if(t(p.from)!==t(p.to))e('conv '+p.lhs);break;}
  }
}
for(const lvl of [1,2,3]){
  for(let i=0;i<600;i++)for(const id of Object.keys(SP.TGEN))check(SP.TGEN[id](SP.rngFrom('K'+i+id),lvl),'L'+lvl);
  const s=SP.defaults();s.module='tm';s.seed='Z';s.pages=3;s.arPerPage=30;s.tm.level=lvl;
  const out=SP.renderAll(s);if(/NaN|undefined|null/.test(out))bad.push('junk '+lvl);
  if(JSON.stringify(SP.generateSet(s))!==JSON.stringify(SP.generateSet(s)))bad.push('nondet');
}
console.log('checked',n,'problems; issues',[...new Set(bad)].slice(0,15),bad.length);
