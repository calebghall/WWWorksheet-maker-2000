/* Grade 5 fraction operation types: every answer recomputed with exact fraction arithmetic from the problem's own fields. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];let n=0;
const IDS=['fadd5','fctx','fdiv5','fmul5','fscale','fword6','fdiv7'];
const g=(a,b)=>b?g(b,a%b):Math.abs(a);
/* fractions as [num, den], always reduced */
const F=(a,b)=>{const k=g(a,b)||1;return [a/k,b/k];};
const add=(x,y)=>F(x[0]*y[1]+y[0]*x[1],x[1]*y[1]),sub=(x,y)=>F(x[0]*y[1]-y[0]*x[1],x[1]*y[1]),mul=(x,y)=>F(x[0]*y[0],x[1]*y[1]),div=(x,y)=>F(x[0]*y[1],x[1]*y[0]);
const eq=(x,y)=>x[0]===y[0]&&x[1]===y[1];
const mixed=a=>F(a[0]*a[2]+a[1],a[2]);          // [w,n,d] -> fraction
const ansF=a=>F(a.w*a.d+a.n,a.d);               // {w,n,d} -> fraction
const simplest=a=>(a.n===0&&a.d===1)||(a.n>0&&a.n<a.d&&g(a.n,a.d)===1);
const lcm=(a,b)=>a/g(a,b)*b;
function check(p,id,L){
  n++;const e=m=>bad.push(`${id} L${L}: ${m} ${JSON.stringify(p).slice(0,170)}`);
  if(!p.sig||!p.prompt||!(((p.win>0&&p.hin>0)||(p.ew>0&&p.eh>0))))e('shape');
  if(p.ans&&typeof p.ans==='object'&&!Array.isArray(p.ans)&&!simplest(p.ans)&&!['fdiv5','fscale'].includes(id))e('not simplest');
  switch(id){
  case 'fadd5':{const A=mixed(p.a),B=mixed(p.b),r=p.op==='add'?add(A,B):sub(A,B);
    if(!eq(ansF(p.ans),r)||r[0]<=0)e('value');if(!simplest(p.ans))e('simplest');
    const[d1,d2]=[p.a[2],p.b[2]];if(d1===d2)e('like');
    if(L===1&&(d1%d2&&d2%d1||p.a[0]||p.b[0]))e('L1');if(L===2&&(!(d1%d2&&d2%d1)||p.a[0]||p.b[0]))e('L2');if(L===3&&(!p.a[0]||!p.b[0]))e('L3 mixed');
    if(p.a[1]<1||p.a[1]>=d1||p.b[1]<1||p.b[1]>=d2)e('proper');break;}
  case 'fctx':{
    if(p.kind==='check'){const A=mixed(p.a),B=mixed(p.b),right=add(A,B),shown=ansF(p.shown);if((p.ans==='reasonable')!==eq(shown,right))e('reasonable flag');
      if(p.ans==='not reasonable'&&!eq(shown,F(p.a[1]+p.b[1],p.a[2]+p.b[2])))e('mediant');if(!eq(ansF(p.right),right))e('right');}
    else{const A=mixed(p.a),B=mixed(p.b),r=p.kind==='add'?add(A,B):sub(A,B);if(!eq(ansF(p.ans),r)||r[0]<=0)e('value');
      const half=Math.round(2*r[0]/r[1]);if(!eq(ansF(p.est),F(half,2))&&!(half===0&&p.est.w===0&&p.est.n===0))e('estimate');
      if(L===3&&(!p.a[0]||!p.b[0]))e('L3 mixed');if(L<3&&(p.a[0]||p.b[0]))e('L<3 mixed');}
    break;}
  case 'fdiv5':{if(!eq(ansF(p.ans),F(p.a,p.b)))e('value');
    if(p.kind==='eq'){if(L===1&&(p.ans.w!==0||p.ans.n!==p.a||p.ans.d!==p.b||p.a>=p.b))e('L1');if(L===2&&(p.ans.w<1||!simplest(p.ans)))e('L2');}
    else{if(p.between[0]!==Math.floor(p.a/p.b)||p.between[1]!==p.between[0]+1)e('between');if(!p.text.includes(String(p.a))||!p.text.includes(String(p.b)))e('text');if(!simplest(p.ans))e('simplest');}break;}
  case 'fmul5':{
    if(p.kind==='whole'){if(!eq(ansF(p.ans),mul(F(p.n,p.d),F(p.W,1))))e('whole');if(!simplest(p.ans))e('simplest');}
    else if(p.kind==='frac'||p.kind==='area'||p.kind==='model'){if(!eq(ansF(p.ans),mul(F(p.n1,p.d1),F(p.n2,p.d2))))e('frac');if(!simplest(p.ans))e('simplest');
      if(p.kind==='model'){const shaded=(p.svg.match(/fill="var\(--c0\)"/g)||[]).length;if(shaded!==p.n1*p.n2)e('shaded cells '+shaded);}
      if(L===1)e('L1 kind');}
    else if(p.kind==='interp'){if(p.q%p.d||Number(p.ans)!==p.n*p.q/p.d||p.n<2||p.n>=p.d)e('interp');}
    break;}
  case 'fscale':
    if(p.kind==='eq1'){if(p.ans.n!==p.k||p.ans.d!==p.k)e('eq1');}
    else{const f=mixed(p.f),rel=f[0]>f[1]?'greater than':f[0]<f[1]?'less than':'equal to';if(p.ans!==rel||!p.opts.includes(rel))e('rel '+rel);
      if(L===1&&p.f[2]>1&&p.f[1]>=p.f[2])e('L1 range');}
    break;
  case 'fword6':{
    if(p.kind==='part'){const m=p.eq.match(/^(\d+)\/(\d+) × (\d+)$/);if(!m||!eq(ansF(p.ans),mul(F(+m[1],+m[2]),F(+m[3],1)))||p.ans.n!==0)e('part');}
    else{if(!eq(ansF(p.ans),mul(mixed(p.a),mixed(p.b))))e('product');if(!simplest(p.ans))e('simplest');if(L===3&&!p.a[0])e('L3 mixed');}
    break;}
  case 'fdiv7':{
    const unit=F(1,p.d);
    if(p.kind==='uw'||p.kind==='rel'||p.kind==='ctxuw'){if(!eq(ansF(p.ans),div(unit,F(p.W,1))))e('uw');}
    else if(p.kind==='wu'||p.kind==='ctxwu'){if(!eq(ansF(p.ans),div(F(p.W,1),unit)))e('wu');}
    else if(p.kind==='ctxwn'){const r=div(F(p.W,1),F(p.n,p.d));if(r[1]!==1||!eq(ansF(p.ans),r)||g(p.n,p.d)!==1||p.n<2)e('wn');if(L<3)e('L3 only');}
    if(L===1&&!['uw','wu'].includes(p.kind))e('L1 kind');
    break;}
  }
}
for(const id of IDS)for(const L of [1,2,3]){
  const rng=SP.rngFrom('g5f'+id+L);
  for(let i=0;i<1500;i++){const p=SP.NGEN[id](rng,L);if(p.type!==id){bad.push(id+' wrong type '+p.type);break;}check(p,id,L);}
}
console.log('g5 fractions problems checked',n,'; issues',bad.length?bad.slice(0,20):[],bad.length);
process.exit(bad.length?1:0);
