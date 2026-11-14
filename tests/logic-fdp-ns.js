const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const parts=html.split('<script>')[1].split('</script>')[0];
const js=parts.split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];let n=0;
const eq=(a,b)=>Math.abs(a-b)<1e-9;
const num=s=>Number(String(s).replace(/,/g,''));
const val=(w,nn,d)=>w+nn/d;
const gcd=(a,b)=>b?gcd(b,a%b):a;
const sgn=(a,b)=>a<b?'<':a>b?'>':'=';
const mk=(mod,lvl)=>{const s=SP.defaults();s.module=mod;s.seed='Z';s.pages=3;s.arPerPage=30;s[mod==='fdp'?'fd':'ns'].level=lvl;return s;};
function check(p,tag){n++;const e=m=>bad.push(tag+' '+p.type+': '+m);
  switch(p.type){
  case 'simp':if(gcd(p.p,p.q)!==1||p.k<2)e('reduce');break;
  case 'equiv':if(p.p*p.q*0!==0||gcd(p.p,p.q)!==1)e('equiv');break;
  case 'cmp':{const a=p.a[0]/p.a[1],b=p.b[0]/p.b[1];if(p.ans!==(Math.abs(a-b)<1e-12?'=':a<b?'<':'>'))e('cmp');if(p.a.some(x=>!(x>0))||p.b.some(x=>!(x>0)))e('zero');break;}
  case 'fadd':{const a=p.a[0]/p.a[1],b=p.b[0]/p.b[1],r=p.op==='add'?a+b:a-b;if(!eq(val(p.ans.w,p.ans.n,p.ans.d),r)||r<=0)e('fadd '+r);if(p.ans.n&&gcd(p.ans.n,p.ans.d)!==1)e('unreduced');if(p.ans.n>=p.ans.d)e('improper');if(p.a[0]>=p.a[1]&&0)e('x');break;}
  case 'fmulw':if(!eq(p.n/p.d*p.W,p.ans)||!Number.isInteger(p.ans))e('fmulw');break;
  case 'fmul':{const a=p.a[0]/p.a[1],b=p.b[0]/p.b[1],r=p.dv?a/b:a*b;if(!eq(val(p.ans.w,p.ans.n,p.ans.d),r))e('fmul');if(p.ans.n&&gcd(p.ans.n,p.ans.d)!==1)e('unreduced');break;}
  case 'decadd':{const a=parseFloat(p.sa),b=parseFloat(p.sb),r=parseFloat(p.ans);if(!eq(r,p.op==='add'?a+b:a-b)||r<0)e('decadd '+p.sa+p.op+p.sb+'='+p.ans);if(p.fw<(p.sa.split('.')[1]||'').length)e('fw');break;}
  case 'decmul':{const m=p.expr.replace(/,/g,'').match(/^([\d.]+) ([×÷]) (\d+)$/)||p.expr.replace(/,/g,'').match(/^([\d.]+) ([×÷]) ([\d.]+)$/);const a=parseFloat(m[1]),b=parseFloat(m[3]),r=m[2]==='×'?a*b:a/b;if(!eq(r,parseFloat(p.ans.replace(/,/g,''))))e('decmul '+p.expr+'='+p.ans);if(/\.\d*0$/.test(p.ans))e('trailing zero '+p.ans);break;}
  case 'conv':{const pc=parseFloat(p.pct);if(!eq(parseFloat(p.dec),pc/100)||!eq(p.fn/p.fd,pc/100)||gcd(p.fn,p.fd)!==1)e('conv');break;}
  case 'pct':if(!eq(p.P*p.N/100,p.ans)||!Number.isInteger(p.ans))e('pct');break;
  case 'place':{
    if(p.variant==='expand'){const sum=p.expd.split(' + ').reduce((a,t)=>a+num(t),0);const std=num(p.shown.replace(/<[^>]+>/g,''));if(sum!==std)e('expand');}
    else if(p.variant==='standard'){const sum=p.expd.split(' + ').reduce((a,t)=>a+num(t),0);if(sum!==num(p.std))e('standard');}
    else if(p.variant==='digit'){const s=p.shown.replace(/,/g,'');const i=s.indexOf('<u>');const d=+s[i+3];const before=s.slice(0,i),rest=s.slice(i+8);let v;
      if(before.includes('.'))v=d*Math.pow(10,-(before.split('.')[1].length+1));else v=d*Math.pow(10,rest.split('.')[0].length);
      if(!eq(v,num(p.ans))||d===0)e('digit '+p.shown+' -> '+p.ans);}
    else{const names=['ones','tens','hundreds','thousands','ten thousands','hundred thousands'],dn=['tenths','hundredths','thousandths'];
      const w=p.prompt.match(/Digit in the (.+) place/)[1],s=p.shown.replace(/,/g,'');const [I,D='']=s.split('.');
      const dig=names.includes(w)?I[I.length-1-names.indexOf(w)]:D[dn.indexOf(w)];if(dig!==p.ans||p.ans==='0')e('which '+p.shown+' '+w+' '+p.ans);}
    break;}
  case 'compare':if(p.ans!==sgn(num(p.a),num(p.b)))e('compare');break;
  case 'order':{const v=p.ans.map(num),asc=/least to greatest/.test(p.prompt);for(let i=1;i<v.length;i++)if(asc?v[i]<=v[i-1]:v[i]>=v[i-1])e('order');if(p.shown.map(num).slice().sort((a,b)=>a-b).join()!==v.slice().sort((a,b)=>a-b).join())e('order set');break;}
  case 'round':{const m=p.prompt.match(/nearest (.+):/)[1];const u={ten:10,hundred:100,thousand:1000,'ten thousand':10000,'hundred thousand':100000,'whole number':1,tenth:.1,hundredth:.01}[m];const x=num(p.shown);const r=Math.floor(x/u+0.5+1e-9)*u;if(!eq(r,num(p.ans)))e('round '+p.shown+' '+m+' '+p.ans);break;}
  case 'skip':{const v=p.terms.map(num);const st=v[1]-v[0];for(let i=1;i<v.length;i++)if(!eq(v[i]-v[i-1],st))e('skip');if(new Set(p.idx).size!==2||p.idx.includes(0))e('skip idx');if(v.some(x=>x<0))e('neg');break;}
  case 'parity':if(p.single){if(p.ans!==(num(p.n)%2?'odd':'even'))e('par');}else{const want=/odd/.test(p.prompt)?1:0;p.list.forEach((x,i)=>{if(p.on[i]!==(num(x)%2===want))e('par set')});if(!p.on.some(Boolean))e('par none');}break;
  case 'line':{const lab=p.svg.match(/from ([\d.]+) to ([\d.]+)/);const lo=+lab[1],hi=+lab[2];const ax=+p.svg.match(/<path d="M([\d.]+) 4V19"/)[1];const k=Math.round((ax-20)*10/230);const v=lo+k*(hi-lo)/10;if(!eq(v,num(p.ans))||k<1||k>9)e('line '+lo+'-'+hi+' k'+k+' '+p.ans);break;}
  case 'est':{const m=p.expr.match(/^([\d,]+) ([+−×]) ([\d,]+)$/);const u={ten:10,hundred:100,thousand:1000}[p.prompt.match(/nearest (\w+):/)[1]];const r=x=>Math.floor(x/u+0.5)*u;const a=r(num(m[1])),b=r(num(m[3]));const e2=m[2]==='+'?a+b:m[2]==='−'?a-b:a*b;if(e2!==num(p.ans)||e2<0)e('est');break;}
  }
}
for(const lvl of [1,2,3]){
  for(const [mod,G,key] of [['fdp',SP.FGEN,'fd'],['ns',SP.NGEN,'ns']]){
    for(let i=0;i<400;i++)for(const id of Object.keys(G)){const rng=SP.rngFrom('K'+i+id);check(G[id](rng,lvl),mod+lvl);}
    const s=mk(mod,lvl);const out=SP.renderAll(s);if(/NaN|undefined|null/.test(out))bad.push('junk '+mod+lvl);
    const s2=mk(mod,lvl);s2.pages=2;if(JSON.stringify(SP.generateSet(s2))!==JSON.stringify(SP.generateSet(s2)))bad.push('nondet');
  }
}
console.log('checked',n,'problems; issues',[...new Set(bad)].slice(0,15),bad.length);
{const s=mk('fdp',2);const out=SP.renderAll(s);const m=out.match(/.{60}(NaN|undefined|null).{40}/);console.log(m&&m[0]);}
