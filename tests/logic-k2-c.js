/* K-2 Time and Money additions (src/js/modules/tm.js): digital time, a.m./p.m., like and mixed pictured coins, money word problems. Answers recomputed from each problem's own fields. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,E=x=>vm.runInContext(x,ctx),bad=[];let n=0;
const TGEN=E('TGEN'),V=E('TM_COIN_V'),CN=E('TM_COIN'),EV=E('TM_EVENTS'),words=E('tmWords');
const val={penny:1,nickel:5,dime:10,quarter:25};
const money=(c,u)=>u==='c'?String(c):(c/100).toFixed(2);
function chk(p,L,tag){n++;const e=m=>bad.push(`${tag} L${L} ${p.type}: ${m} ${JSON.stringify(p).slice(0,140)}`);
  if(!p.sig||!p.prompt||p.prompt.length>42||!(p.win>0&&p.hin>0||p.ew>0&&p.eh>0))e('shape');
  if(p.win>3.4)e('too wide '+p.win);
  switch(p.type){
  case 'dclock':if(p.h<1||p.h>12||p.m%(L===1?30:5))e('time');if(p.variant==='words'){if(p.ans!==words(p.h,p.m))e('words');if(!/^(\d+ o'clock|quarter (past|to) \d+|half past \d+|\d+ minutes (past|to) \d+)$/.test(p.ans))e('words fmt');
      if(/to (\d+)$/.test(p.ans)&&+RegExp.$1!==(p.h%12)+1)e('to hour');}else if(p.ans!==`${p.h}:${String(p.m).padStart(2,'0')}`)e('digital');break;
  case 'ampm':{const m=p.txt.match(/^(.+) at (\d+):(\d\d)$/);if(!m){e('txt');break;}const ev=EV.find(r=>r[0].toLowerCase()===m[1].toLowerCase()),h=+m[2],mm=+m[3];if(!ev){e('event');break;}
    const ok=['a.m.','p.m.'].filter(ap=>{const t=((h%12)+(ap==='p.m.'?12:0))*60+mm;return t>=ev[1]&&t<=ev[2];});if(ok.length!==1||ok[0]!==p.ans)e('ampm '+ok);break;}
  case 'like':{if(new Set(p.list).size!==1||p.list.length<2||p.list.length>8)e('list');if(p.total!==p.list.length*val[p.list[0]]||p.total>=100||p.ans!==String(p.total))e('total');if(L===1&&p.list[0]==='quarter')e('L1 quarter');break;}
  case 'cpic':{const c=p.list.reduce((a,k)=>a+val[k],0),b=(p.billTxt.match(/(\d+) \$5 bill/)?+RegExp.$1*500:0)+(p.billTxt.match(/(\d+) \$1 bill/)?+RegExp.$1*100:0);
    if(p.total!==c+b||p.ans!==money(p.total,p.unit))e('total');if(p.list.length>8||p.list.length<3)e('count');if(L===1&&(p.total>=100||p.billTxt))e('L1');if(p.unit==='c'&&p.total>=100)e('unit');
    if(p.list.some((k,i)=>i&&val[k]>val[p.list[i-1]]))e('order');break;}
  case 'cstory':{const t=p.text,A=s=>{const m=s.match(/(\$(\d+\.\d\d)|(\d+)¢)/);return m[2]?Math.round(m[2]*100):+m[3];},all=[...t.matchAll(/\$(\d+)\.(\d\d)|(\d+)¢/g)].map(m=>m[3]?+m[3]:+m[1]*100+ +m[2]);
    if(/\$\d/.test(t)!==(p.unit==='d')&&p.kind!=='enough')e('unit sym');
    let exp;if(p.kind==='left')exp=all[0]-all[1];else if(p.kind==='more'||p.kind==='total')exp=all[0]+all[1];else if(p.kind==='need')exp=all[1]-all[0];
    else{const m=t.match(/has (\d+) dimes? and (\d+) nickels?\./),d=t.match(/has (\d+) \$1 bills? and (\d+) quarters?\./),have=m?10*m[1]+5*m[2]:100*d[1]+25*d[2],cost=all[all.length-1];exp=have>=cost?'yes':'no';if(have===cost)e('tie');
      if(p.ans!==exp)e('enough');break;}
    if(p.ans!==money(exp,p.unit)||exp<=0||(p.unit==='c'&&exp>=100))e('answer '+exp);break;}
  }}
for(const L of [1,2,3])for(const id of ['dclock','ampm','like','cpic','cstory'])for(let i=0;i<600;i++)chk(TGEN[id](SP.rngFrom('K'+i+id),L),'gen',L);
for(const L of [1,2,3]){const s=SP.defaults();s.module='tm';s.seed='K2';s.pages=3;s.arPerPage=12;s.tm.level=L;for(const k of Object.keys(s.tm.types))s.tm.types[k]=true;
  for(const key of [false,true]){s.key=key;const out=SP.renderAll(s);if(/NaN|undefined|null|\[object/.test(out))bad.push('junk render L'+L);const a=(out.match(/<svg/g)||[]).length,b=(out.match(/<\/svg>/g)||[]).length;if(a!==b)bad.push('svg balance');}}
for(const id of ['dclock','ampm','like','cpic','cstory'])for(const L of [1,2]){const sg=new Set();for(let i=0;i<80;i++)sg.add(TGEN[id](SP.rngFrom('D'+i+id),L).sig);if(sg.size<(id==='like'&&L===1?8:12))bad.push(`low variety ${id} L${L} ${sg.size}`);}
console.log('k2-c problems checked',n,'; issues',[...new Set(bad)].slice(0,12),bad.length);process.exit(bad.length?1:0);
