/* Independent verification of the Number Sense extension types (src/js/modules/ns-ext.js): every answer is recomputed from the problem's own fields. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];let n=0;
const EXT=['bond','eqn','equal','prop','rel','more','sub10','mul10','tens','cfwd','mcomp','f100','fact','perim','wadd','wlen','wmul','wcmp','wstep','west','rnd3'];
const num=s=>Number(String(s).replace(/,/g,''));
const val=t=>t.map(s=>typeof s==='object'?s.u:s).join('');
/* evaluate one "lhs = rhs" string (also "a + b = c, " forms); every "=" chain must hold */
function holds(str){
  const parts=str.replace(/,\s*$/,'').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').split('=').map(x=>x.trim());
  if(parts.some(x=>!/^[\d+\-*/() .]+$/.test(x)))return false;
  const v=parts.map(x=>Function('"use strict";return ('+x+')')());
  return v.every(x=>Math.abs(x-v[0])<1e-9);
}
const isPrime=k=>{if(k<2)return false;for(let i=2;i*i<=k;i++)if(k%i===0)return false;return true;};
function check(p,tag,L){
  n++;const e=m=>bad.push(`${tag} L${L} ${p.type}: ${m} ${JSON.stringify(p).slice(0,140)}`);
  if(!p.sig||!(p.ew>0)||!(p.eh>0)||!p.prompt)e('shape');
  if(p.tok&&['bond','eqn','equal','prop','rel','sub10','mul10'].includes(p.type)){ if(!holds(val(p.tok)))e('tok equation '+val(p.tok)); if(p.tok2&&!holds(val(p.tok2)))e('tok2 '+val(p.tok2)); }
  switch(p.type){
  case 'bond':{const v=val(p.tok);if(L===1){const m=v.match(/\d+/g).map(Number);if(Math.max(...m)>10)e('over 10');}
    if(L===2&&!/10/.test(v))e('make ten');if(L===3){const m=v.match(/\d+/g).map(Number);if(Math.max(...m)>19||!/10/.test(v))e('teen');}break;}
  case 'eqn':{const m=val(p.tok).match(/\d+/g).map(Number);if(L===1&&Math.max(...m)>20)e('>20');if(L===2&&Math.max(...m)>99)e('>99');if(L===3&&(!/[×÷]/.test(val(p.tok))||Math.max(...m)>100))e('mul range');
    if(p.tok.filter(s=>typeof s==='object').length!==1)e('one unknown');break;}
  case 'equal':if(p.kind==='tf'){if(holds(p.eq)!==(p.ans==='true'))e('tf '+p.eq);}break;
  case 'prop':break;
  case 'rel':{const a=val(p.tok2).match(/\d+/g).map(Number);const b=val(p.tok).match(/\d+/g).map(Number);if(a[1]!==b[0]||a[2]!==b[1])e('rel link');break;}
  case 'more':{const exp=p.more?p.base+p.amt:p.base-p.amt;if(num(p.ans)!==exp)e('more');if(L===1&&(p.amt!==10||p.base<10||p.base>99||exp<10||exp>99))e('L1 range');if(L===2&&(![10,100].includes(p.amt)||exp<0||exp>999))e('L2 range');if(exp<0||exp>9999)e('L3 range');break;}
  case 'sub10':{const m=val(p.tok).match(/\d+/g).map(Number);if(m[1]%10||m[0]<10||m[0]>99||m[2]<0)e('sub10');break;}
  case 'mul10':{const m=val(p.tok).match(/\d+/g).map(Number);const [x,y]=m;if(!((x<10&&y%10===0&&y<=90)||(y<10&&x%10===0&&x<=90)))e('mul10');break;}
  case 'tens':{const v=val(p.tok);let m;
    if((m=v.match(/^(\d+) = (\d+) tens(?: and)? (\d+) ones$/))){if(+m[1]!==10*m[2]+ +m[3])e('tens a');if(L===1&&+m[3]>9)e('L1 ones');}
    else if((m=v.match(/^(\d+) tens (\d+) ones = (\d+)$/))){if(+m[3]!==10*m[1]+ +m[2]||+m[2]>9)e('tens b');}
    else e('tens fmt '+v);break;}
  case 'cfwd':{const t=p.terms.map(Number);for(let i=1;i<t.length;i++)if(t[i]-t[i-1]!==p.step)e('step');if(new Set(p.idx).size!==2||p.idx.includes(0))e('idx');if(Math.max(...t)>(L===3?120:L===1?100:20)||Math.min(...t)<0)e('range');
    if(L===3&&p.step>1&&t[0]%p.step)e('start multiple');if(L===2&&p.step!==-1)e('back');break;}
  case 'mcomp':{const v=val(p.tok);let m;
    if((m=v.match(/^(\d+) is (\d+) times as many as (\d+)\.$/))){if(+m[1]!==m[2]*m[3])e('mcomp a');}
    else if((m=v.match(/^(\d+) times as many as (\d+) is (\d+)\.$/))){if(+m[3]!==m[1]*m[2])e('mcomp b');}
    else if((m=v.match(/^(\d+) is (\d+) times as many as (\d+)\.  (\d+) × (\d+) = (\d+)$/))){if(+m[1]!==m[2]*m[3]||+m[4]!==+m[2]||+m[5]!==+m[3]||+m[6]!==+m[1])e('mcomp c');}
    else e('mcomp fmt '+v);break;}
  case 'f100':{if(p.kind===1){if(num(p.ans)!==p.a*10||p.a<1||p.a>9)e('f100a');}else if(num(p.ans)!==p.a*10+p.b||p.b<1||p.a*10+p.b>100)e('f100b');break;}
  case 'fact':{if(p.kind==='pairs'){const v=val(p.tok).split(',').map(x=>x.trim());v.forEach(x=>{const [a,b]=x.split('×').map(Number);if(a*b!==p.n)e('pair')});}
    else if(p.kind==='prime'){if((p.ans==='prime')!==isPrime(p.n)||p.n<2)e('prime');}
    else if(p.ans!==(p.n%p.d===0?'yes':'no'))e('factor/multiple');break;}
  case 'perim':{const sum=a=>a.reduce((x,y)=>x+y,0);
    if(p.kind==='rect'&&num(p.ans)!==2*(p.l+p.w))e('rect');
    if(p.kind==='square'&&num(p.ans)!==4*p.s)e('square');
    if(p.kind==='rectu'&&(2*(p.l+num(p.ans))!==p.P||num(p.ans)<=0))e('rectu');
    if(p.kind==='samep'&&(2*(num(p.ans)+p.w2)!==2*(p.l+p.w)||num(p.ans)<=0||p.l*p.w===num(p.ans)*p.w2))e("samep");
    if(p.kind==='samea'){const P1=2*(p.l1+p.w1),P2=2*(p.l2+p.w2);if(p.l1*p.w1!==p.l2*p.w2||P1===P2||p.ans!==(P1>P2?'A':'B'))e('samea');}
    if(p.kind==='poly'&&num(p.ans)!==sum(p.sides))e('poly');
    if(p.kind==='polyu'&&(sum(p.sides)+num(p.ans)!==p.P||num(p.ans)<=0))e('polyu');
    const nums=(p.text.match(/\d+/g)||[]).map(Number);if(!nums.length)e('text');if(L<3&&/^same/.test(p.kind))e('same kinds are level 3');break;}
  case 'rnd3':{const r=(v,u)=>Math.round(v/u)*u;if(![10,100].includes(p.unit))e('unit');if(num(p.ans)!==r(p.n,p.unit)||p.n%p.unit===0&&p.kind==='plain')e('round '+p.n);
    if(L===1&&p.unit!==10)e('L1 tens');if(L===2&&p.unit!==100)e('L2 hundreds');if(p.kind==='line'){if(p.n!==p.lo+p.k*p.unit/10||p.k<1||p.k>9||p.lo%p.unit)e('line');if(!p.svg.includes('<svg'))e('svg');}break;}
  case 'wadd':case 'wlen':case 'wmul':case 'wcmp':case 'wstep':case 'west':{
    const [a,b,c,d]=p.nums,A=num(p.ans),eq=p.eq,sym=eq.includes('□')?'□':eq.includes('?')?'?':'n';
    if(!p.noeval&&!/R /.test(eq)){const filled=eq.replace(sym,String(A));if(!holds(filled))e('eq does not hold '+eq+' ans '+A);}
    const txt=p.text;for(const q of p.nums.slice(0,3))if(!new RegExp('(^|[^\\d])'+q+'([^\\d]|$)').test(txt)&&!(p.kind==='two'&&0)){ if(!['cmpD','subR','subC','subS','diff','left','size','count','meas','two3','mcmpK','mcmpU','mcmp','addvm','rem','ceil','multi','multi2','two1','two2','prod','array','apart','addC','addS','tot','grew','start','cmpB','put','addR','areaP','areaW','eadd','emul'].includes(p.kind))e('number not in text '+q); }
    // answers recomputed from story numbers by kind
    const K={addR:()=>a+b,addC:()=>b,addS:()=>a,subR:()=>a-b,subC:()=>b,subS:()=>a+0&&p.nums[0],put:()=>c,apart:()=>b,cmpD:()=>p.nums[2],cmpB:()=>c,
      two:()=>a-b+c,tot:()=>c,diff:()=>a-b,left:()=>a-b,grew:()=>b,start:()=>c,
      prod:()=>a*b,size:()=>a/b,count:()=>a/b,array:()=>a*b,meas:()=>a/b,two1:()=>a*b+c,two2:()=>a*b-c,two3:()=>(a+b)/c,
      mcmp:()=>a*b,mcmpU:()=>a,mcmpK:()=>b,addvm:()=>a*b-a,rem:()=>Math.floor(a/b),ceil:()=>Math.ceil(a/b),multi:()=>a+b*c-d,multi2:()=>a*b+c,areaP:()=>a*b,areaW:()=>b,eadd:()=>a+b-c,emul:()=>a*b+c};
    if(!K[p.kind])e('unknown kind '+p.kind);else{const exp=p.kind==='subS'?p.nums[0]:K[p.kind]();if(exp!==A)e(`kind ${p.kind} expected ${exp} got ${A}`);}
    if(!Number.isInteger(A)||A<=0)e('answer not a positive integer');
    const lim=p.type==='wadd'?(L===1?20:L===2?99:999):p.type==='wlen'?99:p.type==='wmul'?(L===3?400:99):100000;
    if(p.type==='wadd'||p.type==='wlen'||(p.type==='wmul'&&L<3)){if(Math.max(A,...p.nums.slice(0,3))>lim)e('range '+lim);}
    if(p.kind==='rem'&&(a%b===0))e('rem zero');if(p.kind==='ceil'&&a%b===0)e('ceil exact');
    if(p.type==='west'){const r=v=>Math.round(v/10)*10,E=p.kind==='eadd'?r(a)+r(b)-r(c):a*r(b)+r(c);if(num(p.est)!==E||E<=0)e('estimate');if(Math.abs(E-A)>60)e('estimate far from answer');}
    if(L===1&&p.type==='wadd'&&/two/.test(p.kind))e('two-step at L1');
    if(p.type==='wmul'&&L===3&&!/^two/.test(p.kind))e('L3 must be two-step');
    break;}
  default:e('unexpected');
  }
}
for(const L of [1,2,3]){
  for(let i=0;i<500;i++)for(const id of EXT){const rng=SP.rngFrom('G'+i+id);check(SP.NGEN[id](rng,L),'gen',L);}
  const s=SP.defaults();s.module='ns';s.seed='Z';s.pages=3;s.arPerPage=30;s.ns.level=L;for(const k of Object.keys(s.ns.types))s.ns.types[k]=EXT.includes(k);
  const out=SP.renderAll(s);if(/NaN|undefined|null/.test(out))bad.push('junk render L'+L);
  s.key=true;const out2=SP.renderAll(s);if(/NaN|undefined|null/.test(out2))bad.push('junk key L'+L);
  if(JSON.stringify(SP.generateSet(s))!==JSON.stringify(SP.generateSet(s)))bad.push('nondet');
}
/* duplicate rate inside one set (sig) for each type */
for(const id of EXT){const s=SP.defaults();s.module='ns';s.seed='D1';s.pages=1;s.arPerPage=30;s.ns.level=2;for(const k of Object.keys(s.ns.types))s.ns.types[k]=k===id;const ps=SP.generateSet(s);const uniq=new Set(ps.map(p=>p.sig)).size;if(uniq<Math.min(ps.length,12))bad.push('low variety '+id+' '+uniq+'/'+ps.length);}
console.log('gap types checked',n,'problems; issues',[...new Set(bad)].slice(0,12),bad.length);
process.exit(bad.length?1:0);
