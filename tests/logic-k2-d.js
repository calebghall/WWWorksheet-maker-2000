/* K-2 Shapes, Measures and Data additions (src/js/modules/vis-k2.js). Answers recomputed from each problem's own fields. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,E=x=>vm.runInContext(x,ctx),bad=[];let n=0;
const K2=E('VIS_K2'),V_SIDES=E('V_SIDES'),V_EQ=E('V_EQSIDES'),V_ATTR=E('V_ATTR'),V_ATTRW=E('V_ATTRW'),V_MT=E('V_MT'),V_SPLITS=E('V_SPLITS'),V_PM=E('V_PM');
const sum=a=>a.reduce((x,y)=>x+y,0);
function chk(p,id,L){n++;const e=m=>bad.push(`${id} L${L}: ${m} ${JSON.stringify(p).slice(0,150)}`);
  if(!p.sig||!p.prompt||p.prompt.length>42||!((p.win>0&&p.hin>0)||(p.ew>0&&p.eh>0)))e('shape');if(p.win>3.4)e('wide '+p.win);
  switch(id){
  case 'patmake':{const core=V_PM[p.name];if(p.seq.length!==8||p.tk.length!==new Set(core).size||p.seq.some((t,i)=>t!==p.tk[core[i%core.length]]))e('seq');if(p.ans!==p.seq.join(''))e('ans');if(L===1&&p.name!=='AB')e('L1');break;}
  case 'cntn':if(p.n<3||p.n>20||(L===3?p.n<11:p.n>10)||p.ans!==String(p.n))e('cntn');break;
  case 'showop':{const m=p.prompt.match(/(\d+) (\+|−) (\d+)/),a=+m[1],b=+m[3];if(a!==p.a||b!==p.b||(m[2]==='+')!==(p.op==='add'))e('prompt');const r=p.op==='add'?a+b:a-b;if(String(r)!==p.ans||r<0||Math.max(a,r)>(L===1?5:10)||r<1&&p.op==='add')e('showop');if(p.op==='sub'&&b>=a)e('sub');break;}
  case 'mattr':if(p.variant==='clue'){if(V_ATTR[p.ans]!==p.text)e('clue');}else if(!V_ATTRW.some(r=>r[0]===p.text&&r[1]===p.ans))e('word');break;
  case 'pos2':{const want=/in front of/.test(p.prompt)?'front':/behind/.test(p.prompt)?'behind':'beside';if(p.order[+p.ans]!==want||new Set(p.order).size!==3)e('pos2');break;}
  case 'shcmp':if(p.variant==='counts'){if(p.n!==V_SIDES[p.shape]||p.ans!==`${p.n} ${p.n}`)e('counts');}else if(p.variant==='equal'){if(V_EQ[p.shape]!==p.ans)e('equal');}else if(p.list[+p.ans]!=='cube'||p.list.filter(k=>k==='cube').length!==1||new Set(p.list).size!==3)e('roll');break;
  case 'shbuild':if(p.n!==V_SIDES[p.shape]||p.ans!==`${p.n} ${p.shape}`||(p.n===4&&p.shape!=='square'))e('shbuild');if(L===1&&p.n>4)e('L1');break;
  case 'split':{const k=V_SPLITS.find(s=>s.id===p.id);if(!k||k.L>L||p.lines!==k.lines||p.n!==k.n||p.cuts.length!==p.lines)e('split');if(!p.prompt.includes(`${p.lines} line`)||!p.prompt.includes(`${p.n} ${p.piece}`))e('prompt');
    if(p.cuts.some(c=>c.some(v=>!isFinite(v))))e('cut nan');break;}
  case 'partw':{if(p.kind==='shade'){if(p.n!==4||p.fills.length!==+p.ans||!/(quarter|2 fourths)/.test(p.prompt)||(p.ans==='2')!==/2 fourths/.test(p.prompt))e('shade');}else if(p.kind==='whole'){if(p.ans!==String(p.n)||![2,4].includes(p.n))e('whole');}else if(p.ans!==(p.n===2?'half':'quarter')||!p.opts.includes(p.ans))e('name');break;}
  case 'pdraw':if(![2,3,4].includes(p.n)||(L===1&&p.n===3)||!p.prompt.includes({2:'halves',3:'thirds',4:'fourths'}[p.n])||p.ans!==String(p.n))e('pdraw');break;
  case 'mtool':{const r=V_MT.find(q=>q[0]===p.text);if(!r||r[1]!==p.ans||!p.opts.includes(p.ans)||new Set(p.opts).size!==3)e('mtool');if(p.ans!=='measuring tape'&&p.opts.includes('measuring tape'))e('ambiguous tape');if(p.ans==='ruler'&&p.opts.includes('ruler')&&p.opts.some(o=>!['ruler','yardstick','meter stick'].includes(o)))e('ruler opts');break;}
  case 'mrule2':if(p.n<2||p.n>9||p.cm!==Math.round(p.n*2.54)||p.ans!==`${p.n} ${p.cm}`||Math.abs(p.n*2.54-p.cm)>0.4)e('mrule2');break;
  case 'pict4':case 'bar4':{const t=sum(p.cnt),hi=Math.max(...p.cnt),lo=Math.min(...p.cnt);if(p.cats.length!==4||p.cnt.length!==4||new Set(p.cnt).size!==4||p.tot!==t||p.diff!==hi-lo||p.cnt[p.hi]!==hi||p.cnt[p.lo]!==lo)e('data');
    if(id==='pict4'){if(p.cnt.some(c=>c%p.step)||Math.max(...p.cnt)/p.step>6||![1,2,5,10].includes(p.step))e('pict');}else if(hi>9||lo<1)e('bar');
    if(p.ans!==(p.make?p.cnt.join(' '):`${t} ${hi-lo}`))e('ans');break;}
  case 'chartwhy':{const m={comm:'any order',zero:'adding 0',plus1:'adding 1'};if(p.ans!==m[p.kind])e('why');if(p.kind==='comm'){const[a,b]=p.cells;if(a[0]!==b[1]||a[1]!==b[0]||a[0]===a[1])e('comm cells');}
    if(p.kind==='zero'&&(p.r0!==0||p.cells.some(c=>c[0]!==0)))e('zero');if(p.kind==='plus1'){const[a,b]=p.cells;if(a[0]!==b[0]||b[1]!==a[1]+1||b[1]>3)e('plus1');}break;}
  }}
for(const L of [1,2,3])for(const id of K2)for(let i=0;i<600;i++)chk(SP.VGEN[id](SP.rngFrom('Z'+i+id),L),id,L);
for(const L of [1,2,3]){const s=SP.defaults();s.module='vis';s.seed='K2';s.pages=3;s.arPerPage=12;s.vis.level=L;for(const k of Object.keys(s.vis.types))s.vis.types[k]=K2.includes(k);
  for(const key of [false,true]){s.key=key;const out=SP.renderAll(s);if(/NaN|undefined|null|\[object/.test(out))bad.push('junk render L'+L+' key'+key);const a=(out.match(/<svg/g)||[]).length,b=(out.match(/<\/svg>/g)||[]).length;if(a!==b||!a)bad.push('svg balance L'+L);}
  if(JSON.stringify(SP.generateSet(s))!==JSON.stringify(SP.generateSet(s)))bad.push('nondet');}
const poolMin={patmake:3,cntn:8,showop:8,mattr:3,pos2:6,shcmp:6,shbuild:4,split:4,partw:6,pdraw:4,mtool:10,mrule2:8,pict4:8,bar4:8,chartwhy:6};
for(const id of K2)for(const L of [1,2,3]){const sg=new Set();for(let i=0;i<150;i++)sg.add(SP.VGEN[id](SP.rngFrom('D'+i+id),L).sig);if(sg.size<(poolMin[id]||4)&&!(L===1&&id==='pdraw'&&sg.size>=4))bad.push(`low variety ${id} L${L} ${sg.size}`);}
console.log('k2-d problems checked',n,'; issues',[...new Set(bad)].slice(0,12),bad.length);process.exit(bad.length?1:0);
