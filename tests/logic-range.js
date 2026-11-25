/* Larger-range number types (ns-range.js): every answer recomputed from the numbers the problem shows. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];let n=0;
const IDS=['cmprng','ordrng','numrw12','bign','par40'];
const num=s=>Number(String(s).replace(/,/g,''));
const PL=['ones','tens','hundreds','thousands','ten thousands','hundred thousands','millions','ten millions','hundred millions'];
const ONES='zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' '),TENS='_ _ twenty thirty forty fifty sixty seventy eighty ninety'.split(' ');
const w99=k=>k<20?ONES[k]:TENS[Math.floor(k/10)]+(k%10?'-'+ONES[k%10]:'');
const w999=k=>(k>=100?ONES[Math.floor(k/100)]+' hundred'+(k%100?' ':''):'')+(k%100?w99(k%100):'');
const words=k=>k>=1000?'one thousand'+(k%1000?' '+w999(k%1000):''):w999(k);
const digitsOf=h=>h.replace(/<\/?u>/g,'').replace(/,/g,'');
function chk(p,id,L){n++;const e=m=>bad.push(`${id} L${L}: ${m} ${JSON.stringify(p).slice(0,200)}`);
 if(!p||!p.sig||!(p.ew>0&&p.eh>0)&&p.type!=='par40'&&!p.win)return e('shape');
 if(/NaN|undefined|\[object/.test(JSON.stringify(p)))e('junk');
 if(id==='cmprng'||(id==='bign'&&p.type==='compare')){const a=num(p.a),b=num(p.b),s=a<b?'<':a>b?'>':'=';if(s!==p.ans)e('sign');
  const lim=id==='bign'?[1e5,1e9]:[[10,120],[100,1200],[10000,100000]][L-1];if(id==='cmprng'&&(a<lim[0]||a>lim[1]||b<lim[0]||b>lim[1]))e('range');
  if(id==='bign'){const d=L===1?[6,7]:L===2?[8,8]:[9,10];if(String(a).length<d[0]||String(a).length>d[1])e('digits');}}
 if(id==='ordrng'){const v=p.shown.map(num),asc=/least to greatest/.test(p.prompt),s=v.slice().sort((x,y)=>asc?x-y:y-x).map(k=>k.toLocaleString('en-US').replace(/^(\d{1,3})$/,'$1'));
  if(new Set(v).size!==v.length||p.ans.map(num).join()!==s.map(num).join())e('order');if(v.length!==(L===1?3:4))e('count');
  const lim=[[100,1200],[10000,100000],[1e5,1e9]][L-1];if(v.some(k=>k<lim[0]||k>lim[1]))e('range');
  if(L===3&&new Set(v.map(k=>String(k).length)).size!==1)e('digit counts differ');}
 if(id==='numrw12'){const k=p.n;if(k<100||k>1200)e('range');
  if(p.variant==='w2n'&&(p.word!==words(k)||num(p.ans)!==k))e('w2n');
  if(p.variant==='n2w'&&p.ans!==words(k))e('n2w');
  if(p.variant==='e2s'||p.variant==='s2e'){const parts=(p.variant==='e2s'?p.exp:p.ans).split(' + ').map(num);if(parts.reduce((a,b)=>a+b,0)!==k||parts.some(t=>t<=0)||parts.join()!==parts.slice().sort((a,b)=>b-a).join())e('expanded');if(p.variant==='e2s'&&num(p.ans)!==k)e('e2s ans');}
  if(L===1&&(k>999||k%10===0||Math.floor(k/10)%10===0))e('L1 shape');}
 if(id==='bign'&&p.type==='place'){const ds=digitsOf(p.shown.replace(/<u>(\d)<\/u>/,'[$1]'));
  if(p.variant==='expand'){const ints=digitsOf(p.shown),parts=p.expd.split(' + ').map(num);if(parts.reduce((a,b)=>a+b,0)!==num(ints))e('expand sum');if(parts.length>4)e('terms');}
  else{const m=p.shown.replace(/,/g,'').match(/^(\d*)(?:<u>(\d)<\/u>)?(\d*)$/);const full=digitsOf(p.shown),d=full.length;
   if(p.variant==='digit'){if(!m||m[2]===undefined)return e('no underline');const pos=m[1].length,val=Number(m[2])*Math.pow(10,d-1-pos);if(num(p.ans)!==val||val===0)e('digit value');}
   else{const pl=p.prompt.match(/in the (.+) place/)[1],k=PL.indexOf(pl);if(k<0||k>=d||String(full[d-1-k])!==p.ans||p.ans==='0')e('which digit');}}}
 if(id==='par40'){if(p.type==='parity'){const k=Number(p.n);if(k<11||k>40||p.ans!==(k%2?'odd':'even'))e('parity');}
  else if(p.variant==='eq'){const k=p.n;if(k<22||k>40||k%2)e('eq n');}
  else if(p.variant==='pic40'){if(p.n<21||p.n>40||p.ans!==(p.n%2?'odd':'even'))e('pic');}
  else e('variant');}
}
for(const L of [1,2,3])for(const id of IDS)for(let i=0;i<600;i++)chk(SP.NGEN[id](SP.rngFrom('RG'+i+id),L),id,L);
const dflt=SP.defaults();
for(const id of IDS){if(dflt.ns.types[id]!==false)bad.push('default on '+id);
 for(const L of [1,2,3]){const sg=new Set();for(let i=0;i<400;i++)sg.add(SP.NGEN[id](SP.rngFrom('RV'+i+id),L).sig);if(sg.size<12)bad.push(`variety ${id} L${L} ${sg.size}`);
  const s=SP.defaults();s.module='ns';s.seed='R7'+id;s.pages=2;s.arPerPage=12;s.ns.level=L;for(const k of Object.keys(s.ns.types))s.ns.types[k]=k===id;
  for(const key of [false,true]){s.key=key;const out=SP.renderAll(s);if(/NaN|undefined|null|\[object/.test(out))bad.push(`junk render ${id} L${L} key${key}`);}}}
console.log('range problems checked',n,'; issues',[...new Set(bad)].slice(0,10),bad.length);process.exit(bad.length?1:0);
