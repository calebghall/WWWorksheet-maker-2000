/* Independent verification of the original Shapes, Measures and Data types (every id not in the k2-d, g3 and volume lists (volume is checked in logic-g5m.js)): answers are recomputed from each problem's own fields. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[],E=x=>vm.runInContext(x,ctx);let n=0;
const V_SIDES=E('V_SIDES'),V_POLY=E('V_POLY'),V_COIN=E('V_COIN'),VNUMW=E('VNUMW'),V_EST=E('V_EST');
const K2=['patmake', 'cntn', 'showop', 'mattr', 'pos2', 'shcmp', 'shbuild', 'split', 'partw', 'pdraw', 'mtool', 'mrule2', 'pict4', 'bar4', 'chartwhy', 'addchart', 'chartcircle'].concat(['mfac', 'dint', 'mchart', 'fmodel', 'fline', 'mvol'].concat(['pictg', 'barg', 'rulq', 'lplotq', 'acon', 'gcat', 'gpart', 'gpoly', 'pera', 'vcubes', 'vlwh', 'vcomp', 'cplane', 'cpword', 'angc', 'protr', 'angadd', 'gfig', 'gclass', 'gsym', 'ghier']));const sum=a=>a.reduce((x,y)=>x+y,0);
function check(p,tag,L){
  n++;const e=m=>bad.push(`${tag} L${L} ${p.type}: ${m} ${JSON.stringify(p).slice(0,150)}`);
  if(!p.sig||!p.prompt||!((p.win>=0&&p.hin>=0)||(p.ew>0&&p.eh>0))||p.prompt.length>42)e('shape/prompt');
  if(p.win>3.32)e('too wide '+p.win);if(p.ew>16)e('ew too wide '+p.ew);
  switch(p.type){
  case 'cnt':
    if(p.variant==='word'){if(VNUMW[+p.ans]!==VNUMW[p.n]||p.n<0||p.n>20)e('word');}
    else if(p.variant==='draw'){if(p.pts.length!==p.n||p.n<1||p.n>20)e('draw');}
    else{if(p.pts.length!==p.n||String(p.n)!==p.ans)e('count');if(p.kind==='scatter'&&p.n>10)e('scatter>10');if(L===1&&p.n>10)e('L1>10');if(p.n>20)e('>20');
      const d=[];for(let i=0;i<p.pts.length;i++)for(let j=i+1;j<p.pts.length;j++)d.push(Math.hypot(p.pts[i][0]-p.pts[j][0],p.pts[i][1]-p.pts[j][1]));if(d.length&&Math.min(...d)<p.s*0.6)e('overlap');}
    break;
  case 'pat':{const core={AB:2,AAB:3,ABB:3,ABC:3}[p.name];for(let i=core;i<p.seq.length;i++)if(p.seq[i]!==p.seq[i-core])e('periodic');
    if(p.variant==='core'){if(+p.ans!==core)e('core');}else{if(p.order[+p.ans]!==p.seq[p.seq.length%core])e('next');if(new Set(p.order).size!==3)e('order');}
    if(p.name==='AAB'&&(p.seq[0]!==p.seq[1]||p.seq[1]===p.seq[2]))e('AAB');if(p.name==='ABC'&&new Set(p.seq.slice(0,3)).size!==3)e('ABC');break;}
  case 'picop':if(String(p.op==='add'?p.a+p.b:p.a-p.b)!==p.ans||p.a+(p.op==='add'?p.b:0)>(L===1?5:10)||p.ans<1)e('picop');break;
  case 'coin':if(p.variant==='id'){if(V_COIN[p.coin].v!==p.val)e('val');}else{if(p.order[+p.ans]!==p.coin||new Set(p.order).size!==4)e('find');if(p.variant==='value'&&!p.prompt.includes(V_COIN[p.coin].v+'¢'))e('value prompt');if(p.variant==='name'&&!p.prompt.includes(p.coin))e('name prompt');}break;
  case 'cmpm':{const big=/longer|longest|taller|tallest|heavier/.test(p.prompt),want=big?Math.max(...p.vals):Math.min(...p.vals);if(p.vals[+p.ans]!==want||new Set(p.vals).size!==p.vals.length)e('cmpm');if(p.kind==='heavy'&&p.vals.length!==2)e('balance');break;}
  case 'ord3':if(p.variant==='dir'){const o=[0,1,2].sort((a,b)=>p.vals[a]-p.vals[b]).map(i=>'ABC'[i]).join(' ');if(o!==p.ans||new Set(p.vals).size!==3)e('order');}
    else{const [a,b,c]=p.names,w=p.word;const asks0=p.qtext===`Is ${a} ${w} than ${c}?`,asks1=p.qtext===`Is ${c} ${w} than ${a}?`;if(!(asks0||asks1)||p.ans!==(asks0?'yes':'no'))e('indirect');if(new Set(p.names).size!==3)e('names');}break;
  case 'munit':if(String(p.n)!==p.ans||p.st+p.n>p.strip||p.n<2||(L===1&&p.strip!==p.n)||(L<3&&p.st!==0))e('munit');break;
  case 'ruler':if(String(p.len)!==p.ans||p.st+p.len>p.max||(L<3&&p.st!==0)||p.len<1)e('ruler');break;
  case 'mtwo':if(p.n!==p.m*p.b||p.n>12||p.n<=p.m)e('mtwo');break;
  case 'mdiff':if(String(Math.abs(p.a-p.b))!==p.ans||p.a===p.b||Math.max(p.a,p.b)>p.max)e('mdiff');break;
  case 'mest':{const t=V_EST.find(r=>r[0]===p.thing);if(!t||t[1]!==p.unit||t[2]!==p.v||!p.opts.includes(p.unit)||new Set(p.opts).size!==3)e('mest');break;}
  case 'nline':{const r=p.add?p.a+p.b:p.a-p.b;if(String(r)!==p.ans||r<p.lo||r>p.hi||p.b<=0||(p.tens&&(p.a%10||p.b%10)))e('nline');if(p.kind!=='draw'&&p.kind!=='write')e('nline kind');
    /* the student copy must not show where the jump lands: no drawn jump in 'draw'; in 'write' the three numbers are blanks */
    {const VH=E('VHTML'),sh=VH.nline(p,false,v=>'['+v+']'),kh=VH.nline(p,true,v=>'['+v+']');if(p.kind==='draw'&&(/<path/.test(sh)||!/<path/.test(kh)||!sh.includes(p.a+' '+(p.add?'+':'\u2212')+' '+p.b+' = ['+p.ans+']')))e('nline draw copy');if(p.kind==='write'&&(!/<path/.test(sh)||sh.includes(String(p.a)+' +')||sh.includes('['+p.a+'] ['+(p.add?'+':'\u2212')+'] ['+p.b+'] = ['+p.ans+']')===false))e('nline write copy');}break;}
  case 'sort':{const a=p.items.filter(k=>k===0).length,b=p.items.filter(k=>k===1).length;if(a!==p.a||b!==p.b||a===b||a>10||b>10||p.ans!==(a>b?p.kinds[0]:p.kinds[1]))e('sort');break;}
  case 'tally':case 'pict':case 'bar':{const tot=sum(p.cnt),hi=Math.max(...p.cnt),lo=Math.min(...p.cnt);if(p.tot!==tot||p.diff!==hi-lo||p.cnt[p.hi]!==hi||p.cnt[p.lo]!==lo||new Set(p.cnt).size!==3)e('data');
    if(p.type==='pict'&&p.cnt.some(c=>c%p.step))e('step');if(p.type==='bar'&&Math.max(...p.cnt)>9)e('bar max');if(p.type==='tally'&&Math.max(...p.cnt)>(L===1?6:12))e('tally max');
    if(p.type==='pict'&&Math.max(...p.cnt)/p.step>6)e('too many symbols');break;}
  case 'lplot':{if(p.data.some(v=>v<1||v>8)||p.data.length!==8)e('lplot data');if(!p.make&&String(p.data.filter(v=>v===p.ask).length)!==p.ans)e('lplot count');break;}
  case 'shname':if(p.variant==='k'){if(p.ans!==p.shape||!p.opts.includes(p.shape))e('k');}else if(p.variant==='sides'){if(+p.ans!==V_SIDES[p.shape])e('sides');}else{if(p.ans!==V_POLY[p.shape]||!p.opts.includes(p.ans)||p.opts.length!==2)e('poly');}break;
  case 'shall':{const t=p.target,m=k=>t==='quadrilateral'?V_POLY[k]==='quadrilateral':(L===1?k===t:V_POLY[k]===t);const exp=p.list.map((k,i)=>m(k)?i:-1).filter(i=>i>=0).join(' ');if(exp!==p.ans||!exp)e('shall');break;}
  case 'shdraw':if(p.n&&V_SIDES[p.shape]!==p.n)e('shdraw');if(!p.n&&!p.prompt.toLowerCase().includes(p.shape))e('shdraw name');break;
  case 'solid':if(p.variant==='dim'){const flat=['circle','square','triangle','rectangle','hexagon'].includes(p.kind);if((p.ans==='flat')!==flat||p.solid===flat)e('dim');}
    else{const f={cube:[6,0],cylinder:[2,1],cone:[1,1],sphere:[0,1]},noflat=/no flat/.test(p.prompt),ok=k=>noflat?f[k][0]===0:f[k][1]===0;const hits=p.list.map((k,i)=>ok(k)?i:-1).filter(i=>i>=0);if(hits.length!==1||hits[0]!==+p.ans)e('pick');}break;
  case 'pos':{const t=p.three,ans=+p.ans;let exp;let m;if((m=p.prompt.match(/above the (\w+)\./)))exp=t.indexOf(m[1])-1;else if((m=p.prompt.match(/below the (\w+)\./)))exp=t.indexOf(m[1])+1;else exp=1;if(exp!==ans||new Set(t).size!==3)e('pos');break;}
  case 'part':if(p.kind==='eq'){if(p.ans!==(p.equal?'yes':'no'))e('eq');}else if(p.kind==='name'){if(p.ans!=={2:'halves',3:'thirds',4:'fourths'}[p.n])e('name');}else if(p.fills.join()!=='0')e('shade');if(L===1&&p.n===3)e('thirds at L1');break;
  case 'comp':{const sq=p.cells.filter(c=>c===1).length,tr=2*p.cells.filter(c=>c>=2).length;if(`${sq} ${tr}`!==p.ans||!sq||!tr||p.cells.length!==p.cols*p.rows)e('comp');break;}
  case 'array':if(String(p.r*p.c)!==p.ans||p.r>5||p.c>5||p.r<2||p.c<2)e('array');break;
  case 'chart':{if(p.kind==='add'){const exp=p.blanks.map(b=>(p.r0+Math.floor(b/4))+(p.c0+b%4)).join(' ');if(exp!==p.ans||new Set(p.blanks).size!==3)e('add');}
    else if(p.kind==='hund'){const exp=p.blanks.map(b=>(p.row+Math.floor(b/5))*10+p.col+b%5).join(' ');if(exp!==p.ans||(p.row+3)*10+p.col+4>100)e('hund');}else if(p.ans!=='1 10')e('rule');break;}
  case 'acount':if(p.shape.cells.length!==p.area||p.area<1||p.shape.cells.some(c=>c[0]<0||c[1]<0||c[0]>=p.shape.cols||c[1]>=p.shape.rows))e('acount');break;
  case 'amult':if(p.w*p.h!==p.area||p.w<2)e('amult');break;
  case 'adraw':{const m=p.sample;if(m.w*m.h!==p.area||m.ox<0||m.oy<0||m.ox+m.w>p.cols||m.oy+m.h>p.rows||!p.prompt.includes(String(p.area)))e('adraw');break;}
  case 'acmp':{const A=p.a.shape.cells.length,B=p.b.shape.cells.length;if(A!==p.a.area||B!==p.b.area||p.ans!==(A===B?'S':A>B?'A':'B'))e('acmp');break;}
  case 'alsh':if(p.W*p.H-p.cw*p.ch!==p.area||p.shape.cells.length!==p.area)e('alsh');break;
  case 'cmpg':{const w=p.a>p.b?'greater than':p.a<p.b?'less than':'equal to';if(p.ans!==w||p.a<1||p.b<1||p.a>10||p.b>10||p.kinds[0]===p.kinds[1]||22+32*(Math.max(p.a,p.b)-1)+12>p.win*100)e('cmpg');break;}
  default:e('unexpected');
  }
}
for(const L of [1,2,3]){
  for(let i=0;i<400;i++)for(const id of SP.VIS_TYPES.filter(t=>!K2.includes(t)))check(SP.VGEN[id](SP.rngFrom('V'+i+id),L),'gen',L);
  const s=SP.defaults();s.module='vis';s.seed='Q';s.pages=3;s.arPerPage=12;s.vis.level=L;for(const k of Object.keys(s.vis.types))s.vis.types[k]=!K2.includes(k);
  for(const key of [false,true]){s.key=key;const out=SP.renderAll(s);if(/NaN|undefined|null|\[object/.test(out))bad.push('junk render L'+L+' key'+key);
    const svgs=(out.match(/<svg/g)||[]).length,ends=(out.match(/<\/svg>/g)||[]).length;if(svgs!==ends||!svgs)bad.push('svg balance L'+L);}
  if(JSON.stringify(SP.generateSet(s))!==JSON.stringify(SP.generateSet(s)))bad.push('nondet');
}
for(const id of SP.VIS_TYPES.filter(t=>!K2.includes(t))){for(const L of [1,2,3]){const sigs=new Set();for(let i=0;i<60;i++)sigs.add(SP.VGEN[id](SP.rngFrom('D'+i+id),L).sig);if(sigs.size<Math.min(8,id==='shdraw'?3:id==='array'||id==='coin'?4:8))bad.push(`low variety ${id} L${L} ${sigs.size}`);}}
console.log('vis problems checked',n,'; issues',[...new Set(bad)].slice(0,14),bad.length);
process.exit(bad.length?1:0);
