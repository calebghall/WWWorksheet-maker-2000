/* Grade 5 number and operations types (decimals, powers of ten, expressions, two-rule patterns): answers recomputed from each problem's own fields. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];let n=0;
const IDS=['tenxd','pow10','decrw','rnddec','decrsn','exeval','exwrite','rule2'];
const num=s=>Number(String(s).replace(/,/g,'')),close=(a,b)=>Math.abs(a-b)<1e-9;
/* independent evaluator: JS arithmetic on the string with symbols translated */
const ev=s=>Function('"use strict";return ('+s.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/[[]/g,'(').replace(/\]/g,')')+')')();
/* checks that every subtraction stays non-negative and every division is exact (exval's rule): re-evaluate piecewise */
const words=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
const w99=k=>k<20?words[k]:tens[Math.floor(k/10)]+(k%10?'-'+words[k%10]:'');
const w999=k=>k<100?w99(k):words[Math.floor(k/100)]+' hundred'+(k%100?' '+w99(k%100):'');
function check(p,id,L){
  n++;const e=m=>bad.push(`${id} L${L}: ${m} ${JSON.stringify(p).slice(0,160)}`);
  if(!p.sig||!p.prompt||!(((p.win>0&&p.hin>0)||(p.ew>0&&p.eh>0))))e('shape');
  switch(id){
  case 'tenxd':
    if(p.kind==='dig'){const t=(p.shown.match(/<u>(\d)<\/u>/g)||[]).map(x=>x[3]);if(t.length!==2||t[0]!==t[1]||t[0]==='0')e('digits');if(p.ans!==(p.dir==='left'?'10':'1/10'))e('dig ans');if(L===1&&(p.dir!=='left'||/\./.test(p.shown)))e('L1');}
    else{const a=num(p.a),r=num(p.ans);if(!close(r,p.kind==='x10'?a*10:a/10))e('x10');}break;
  case 'pow10':
    if(p.kind==='val'){if(num(p.ans)!==Math.pow(10,p.k))e('val');}
    else{const a=num(p.a),r=num(p.ans);if(!close(r,p.kind==='mulp'?a*Math.pow(10,p.k):a/Math.pow(10,p.k)))e('mul/div');if(L===1&&/\./.test(p.a))e('L1 decimal');}break;
  case 'decrw':{
    const v=num(p.std),dp=(p.std.split('.')[1]||'').length;if(dp<1||dp>3||(L===1&&dp>2)||(L>=2&&dp<2))e('dp');
    if(p.kind==='exp'||p.kind==='std'){
      const val=p.expd.split(' + ').map(t=>{const m=t.match(/^\((\d) × (?:(\d[\d,]*)|1\/(\d[\d,]*))\)$/);if(!m)return NaN;return +m[1]*(m[2]?num(m[2]):1/num(m[3]));}).reduce((a,b)=>a+b,0);
      if(!close(val,v))e('expanded value '+val+' vs '+v);}
    if(p.kind==='w2s'||p.kind==='s2w'){
      const [i,f]=p.std.split('.'),iv=num(i),place=['tenth','hundredth','thousandth'][f.length-1],fv=Number(f);
      const exp=(iv?w999(iv)+' and ':'')+w999(fv)+' '+place+(fv===1?'':'s');
      if(p.word!==exp)e('words '+exp);}
    break;}
  case 'rnddec':{
    const sh=num(p.shown),ans=num(p.ans),m=p.prompt.match(/nearest (whole number|tenth|hundredth)/);if(!m)e('prompt');
    const q=['whole number','tenth','hundredth'].indexOf(m&&m[1]),u=Math.pow(10,-q),exp=Math.floor(sh/u+0.5+1e-9)*u;
    if(!close(ans,exp))e('round '+exp);
    const dpShown=(p.shown.split('.')[1]||'').length;if(dpShown<=q)e('already at place');
    if(p.kind==='line'){if(dpShown!==q+1||!p.svg.includes('<svg'))e('line');}
    if(L===1&&q===2)e('L1 hundredth');if(L===2&&q===2)e('L2 hundredth');break;}
  case 'decrsn':
    if(p.kind==='wdiv'){const[a,b]=p.expr.split(' ÷ ').map(num);if(!Number.isInteger(a)||!/\./.test(p.expr.split(' ÷ ')[1])||!close(num(p.ans),a/b)||!Number.isInteger(num(p.ans)))e('wdiv');}
    else{const[lhs,shown]=p.expr.split(' = '),A=lhs.split(/ [+−×] /).map(num),op=lhs.match(/[+−×]/)[0],r=ev(lhs),R=Math.round,est=op==='+'?R(A[0])+R(A[1]):op==='−'?R(A[0])-R(A[1]):R(A[0])*R(A[1]);
      if(num(p.est)!==est)e('estimate');if((p.ans==='yes')!==close(num(shown),r))e('reasonable flag');if(p.ans==='no'&&close(num(shown),r))e('same');
      if(op==='×'&&((lhs.split(' × ')[0].split('.')[1]||'').length+(lhs.split(' × ')[1].split('.')[1]||'').length>3&&p.ans==='yes'))e('product beyond thousandths');
      if(!(est>=0))e('neg');}
    break;
  case 'exeval':{const r=ev(p.expr);if(!Number.isInteger(r)||r<1||num(p.ans)!==r)e('value '+r);
    if(L===1&&/[[\]]/.test(p.expr))e('L1 brackets');if(L===3&&!/[[]/.test(p.expr))e('L3 needs brackets');
    /* every sub-division exact and no negative sub-results: evaluate each parenthesised group */
    const groups=p.expr.match(/\([^()[\]]*\)/g)||[];for(const g of groups){const v=ev(g);if(!Number.isInteger(v)||v<0)e('group '+g);}break;}
  case 'exwrite':
    if(p.kind==='write'){const r=ev(p.ans);if(!Number.isInteger(r)||r<0)e('value');
      const nums=p.text.match(/\d+/g).map(Number),ex=p.ans.match(/\d+/g).map(Number);if(nums.slice().sort().join()!==ex.slice().sort().join())e('numbers');}
    else if(p.kind==='times'){if(p.ans!==String(p.k)||!p.text.includes(`${p.k} ×`))e('times');if(/\d{4}/.test(p.text.replace(/\d,\d{3}/g,'')))e('commas');}
    else{const f=o=>num(o.split(' ×')[0]);if(f(p.ans)!==Math.max(p.k1,p.k2)||!p.opts.includes(p.ans))e('which');}break;
  case 'rule2':{const dif=(s,d,st)=>s.every((v,i)=>v===st+d*i);
    if(!dif(p.A,p.dA,p.aS)||!dif(p.B,p.dB,p.bS)||p.A.length!==5)e('seq');
    if(p.mult){if(p.aS||p.bS||!p.A.every((a,i)=>p.B[i]===a*p.rel))e('mult');}else{if(L<3||!p.A.every((a,i)=>p.B[i]===a+p.rel))e('add');}
    if(p.kind==='relate'&&p.ans!==String(p.rel))e('rel');
    if(p.kind==='pairs'&&p.ans!==p.A.slice(0,4).map((a,i)=>`(${a}, ${p.B[i]})`).join(', '))e('pairs');
    if(p.kind==='terms'&&(!p.tokA||!p.tokB))e('tok');break;}
  }
}
for(const id of IDS)for(const L of [1,2,3]){
  const rng=SP.rngFrom('g5'+id+L);
  for(let i=0;i<1500;i++){const p=SP.NGEN[id](rng,L);if(p.type!==id){bad.push(id+' wrong type '+p.type);break;}check(p,id,L);}
}
console.log('g5 problems checked',n,'; issues',bad.length?bad.slice(0,20):[],bad.length);
process.exit(bad.length?1:0);
