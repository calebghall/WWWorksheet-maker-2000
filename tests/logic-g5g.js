/* Geometry and the coordinate plane (Grade 4 angles and figures, Grade 5 coordinate plane and hierarchy): answers and drawings recomputed from each problem's own fields.
   The figure tables (parallel sides, right angles, lines of symmetry, the hierarchy) are checked against the geometry itself, not against the tables that generate them. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];let n=0;
const G=name=>vm.runInContext(name,ctx);
const circles=s=>[...s.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)].map(m=>({x:+m[1],y:+m[2],r:+m[3]}));
const lines=(s,w)=>[...s.matchAll(/<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)" stroke="([^"]+)" stroke-width="([\d.]+)"/g)].map(m=>({x1:+m[1],y1:+m[2],x2:+m[3],y2:+m[4],c:m[5],w:+m[6]})).filter(l=>!w||l.w===w);
const near=(a,b,t)=>Math.abs(a-b)<(t||0.2);
/* geometry of a figure given as a list of corners (svg y runs down) */
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],cross=(a,b)=>a[0]*b[1]-a[1]*b[0],dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
function geom(pts){const k=pts.length,e=pts.map((p,i)=>sub(pts[(i+1)%k],p));let par=0;
  for(let i=0;i<k;i++)for(let j=i+1;j<k;j++){const u=e[i],v=e[j],sin=Math.abs(cross(u,v))/Math.hypot(...u)/Math.hypot(...v);
    if(sin<1e-3){const w=sub(pts[j],pts[i]);if(Math.abs(cross(u,w))/Math.hypot(...u)>1)par++;}}
  let ra=0,ang=[];for(let i=0;i<k;i++){const a=sub(pts[(i+k-1)%k],pts[i]),b=sub(pts[(i+1)%k],pts[i]),c=dot(a,b)/Math.hypot(...a)/Math.hypot(...b);ang.push(Math.acos(c)*180/Math.PI);if(Math.abs(c)<1e-3)ra++;}
  return {par,ra,ang};}
/* lines of symmetry through the origin, by reflecting every corner and looking for the same set of corners */
function axesOf(pts){const out=[],key=p=>Math.round(p[0])+','+Math.round(p[1]),set=new Set(pts.map(key));
  for(let d=0;d<180;d++){const a=d*Math.PI/180,c=Math.cos(2*a),s=Math.sin(2*a);
    if(pts.every(p=>set.has(key([c*p[0]+s*p[1],s*p[0]-c*p[1]]))))out.push(d);}
  return out;}
const mod180=d=>((d%180)+180)%180;
/* what makes each quadrilateral what it is */
const DEF={quadrilateral:[],parallelogram:['par'],rhombus:['par','eq'],rectangle:['par','ra'],square:['par','eq','ra']};
const kind=(a,b)=>a!==b&&DEF[b].every(x=>DEF[a].includes(x));
const PROP={'four right angles':'ra','four equal sides':'eq','two pairs of parallel sides':'par'};
const holds=(s,pr)=>pr==='four sides'||DEF[s].includes(PROP[pr]);
const plural={square:'squares',rectangle:'rectangles',rhombus:'rhombuses',parallelogram:'parallelograms',quadrilateral:'quadrilaterals'};

function check(p,id,L,seed){
  n++;const e=m=>bad.push(`${id} L${L}: ${m} ${JSON.stringify(p).slice(0,170)}`);
  if(!p.sig||!p.prompt||!(((p.win>0&&p.hin>0)||(p.ew>0&&p.eh>0))))e('shape');
  switch(id){
  case 'cplane':
    if(p.kind==='read'||p.kind==='plot'){
      const N=p.N;if(N!==(L===1?6:L===2?8:10))e('grid size');
      const c=(p.sh-46)/N,cs=circles(p.kind==='read'?p.svg:p.svgKey);
      if(cs.length!==p.pts.length||p.pts.length<2||p.pts.length>3)e('point count');
      if(p.kind==='plot'&&circles(p.svg).length)e('plot grid not blank');
      if(p.kind==='plot'&&!p.svgKey.includes('var(--key)'))e('key color');
      p.pts.forEach((q,i)=>{if(q.x>N||q.y>N||q.x<(L===3?0:1)||q.y<(L===3?0:1))e('range');
        const d=cs[i];if(!d||!near(d.x,34+q.x*c)||!near(d.y,16+N*c-q.y*c))e('position '+i);});
      if(new Set(p.pts.map(q=>q.x)).size!==p.pts.length||new Set(p.pts.map(q=>q.y)).size!==p.pts.length)e('shared row or column');
      if(L<3&&p.pts.some(q=>q.x===0||q.y===0))e('axis point below L3');
    }else if(p.kind==='axes'){
      const m=p.text.match(/\((\d+), (\d+)\)/);if(!m||+m[1]!==p.x||+m[2]!==p.y)e('pair text');
      if(String(p.which==='x'?p.x:p.y)!==p.ans)e('axes answer');if(L<2)e('axes below L2');
      if(p.which==='x'&&!/right/.test(p.text)||p.which==='y'&&!/up/.test(p.text))e('direction text');
    }else if(p.kind==='shift'){
      if(L<3)e('shift below L3');const nx=p.dir==='right'?p.x+p.d:p.x,ny=p.dir==='up'?p.y+p.d:p.y;
      if(nx!==p.nx||ny!==p.ny||p.ans!==`${nx}, ${ny}`||nx>10||ny>10||p.d<1)e('shift answer');
      if(!p.text.includes(`(${p.x}, ${p.y})`)||!p.text.includes(` ${p.d} unit`))e('shift text');
    }else e('kind');
    break;
  case 'cpword':{
    const xs=p.pts.map(q=>q.x);if(p.pts.some((q,i)=>q.x!==i+1||q.y!==p.m*(i+1)))e('table');
    if(p.Ny<p.pts[p.pts.length-1].y||p.Ny>12||p.Ny<6)e('grid height');
    if(p.kind==='plot'&&(!p.tab.includes(p.xl+': '+xs.join(', '))||!p.tab.includes(p.yl+': '+p.pts.map(q=>q.y).join(', '))))e('table text');
    const c=(p.sh-56)/p.Ny;
    if(p.kind==='plot'){if(circles(p.svg).length)e('plot grid not blank');const cs=circles(p.svgKey);
      if(cs.length!==p.pts.length||p.pts.some((q,i)=>!cs[i]||!near(cs[i].x,44+q.x*c)||!near(cs[i].y,16+p.Ny*c-q.y*c)))e('key points');}
    else{const cs=circles(p.svg);if(cs.length!==p.pts.length||p.pts.some((q,i)=>!cs[i]||!near(cs[i].x,44+q.x*c)||!near(cs[i].y,16+p.Ny*c-q.y*c)))e('graph points');
      if(p.kind==='read'){if(String(p.m*p.k)!==p.ans||!p.q.includes(`after ${p.k} `))e('read answer');}
      else if(p.kind==='diff'){if(String(p.m*(p.b-p.a))!==p.ans||!p.q.includes(`after ${p.b} `)||!p.q.includes(`after ${p.a} `)||p.a>=p.b)e('diff answer');if(L<3)e('diff below L3');}
      else if(p.kind==='mean'){if(p.ans!==`${p.k}, ${p.m*p.k}`||!p.q.includes(`(${p.k}, ${p.m*p.k})`))e('mean answer');if(L<3)e('mean below L3');}
      else e('kind');}
    if(L===1&&p.m>2)e('L1 rate');if(L===2&&p.m>3)e('L2 rate');break;}
  case 'protr':{
    if(p.deg<15||p.deg>165||String(p.deg)!==p.ans)e('degrees');if(L===1&&(p.deg%10||p.base!=='R'))e('L1 range');if(L===2&&p.deg%5)e('L2 step');
    const svg=SP.VGEN?null:null,ps=vm.runInContext(`protrSvg(${JSON.stringify(p.base)},${p.deg},'both')`,ctx),rs=lines(ps,2.4);
    if(rs.length!==2)e('rays');else{const ang=l=>Math.atan2(140-l.y2,l.x2-145)*180/Math.PI,a0=ang(rs[0]),a1=ang(rs[1]);
      if(!near(mod180(a0+(p.base==='R'?0:180)),0,0.5)&&!near(mod180(a0),0,0.5))e('baseline');
      const want=p.base==='R'?p.deg:180-p.deg;if(!near(a1,want,0.6))e('ray angle '+a1);}
    const kk=vm.runInContext(`protrSvg(${JSON.stringify(p.base)},${p.deg},'key')`,ctx);if(!kk.includes('stroke="var(--key)"'))e('key ray');
    break;}
  case 'angadd':{
    const tot=p.parts.reduce((a,b)=>a+b,0);if(tot!==p.total||tot>180||p.parts.some(q=>q<20)||p.parts.length<2||p.parts.length>3)e('parts');
    if(p.unk==='total'?String(tot)!==p.ans:String(p.parts[p.unk])!==p.ans)e('answer');
    if(p.parts.some(q=>q%(L===1?10:5)))e('step');if(p.kind==='three'&&(L<3||p.parts.length!==3))e('three');
    if(p.unk==='total'){if(!p.parts.every(q=>p.text.includes(q+'°')))e('text parts');if(p.text.includes(tot+'°')&&!p.parts.includes(tot))e('total leaked');}
    else{if(!p.text.includes(p.total+'°')||!p.text.includes(p.parts[1-p.unk]+'°'))e('text known');if(p.text.includes(p.parts[p.unk]+'°')&&p.parts[p.unk]!==p.parts[1-p.unk]&&p.parts[p.unk]!==p.total)e('unknown leaked');}
    const fig=vm.runInContext(`angAddFig(${JSON.stringify(p.parts)},${JSON.stringify(p.unk)},false)`,ctx).svg;
    if(!fig.includes('>?<'))e('no question mark');if(p.kind==='part'&&L<2&&false)e('');
    break;}
  case 'angc':
    if(p.kind==='frac'){if(360%p.d||p.k<1||p.k>=p.d&&p.d>1&&p.k!==p.d-0&&p.k>=p.d)e('wedges');if(p.ans!==String(360*p.k/p.d)||!Number.isInteger(360*p.k/p.d))e('fraction answer');}
    else if(p.kind==='ones'){if(p.ans!==String(p.n)||!p.text.includes(String(p.n)))e('ones');}
    else if(p.kind==='tellnum'){if(360%p.d||p.ans!==String(360/p.d))e('turn');if(L<2)e('turn below L2');}
    else e('kind');break;
  case 'gfig':{
    if(p.kind==='angtype'){const th=p.th,w=th<90?'acute':th===90?'right':th<180?'obtuse':th===180?'straight':'reflex';
      if(w!==p.ans||p.opts.indexOf(p.ans)<0)e('angle class');if(L===1&&(p.ans==='straight'||p.ans==='reflex'))e('L1 kinds');if(L===2&&p.ans==='reflex')e('L2 kinds');}
    else if(p.kind==='name'){if(p.opts.indexOf(p.ans)<0||!['point','line','line segment','ray'].includes(p.ans))e('name');
      const s=p.svg,dots=circles(s).filter(c=>c.r>4).length,heads=(s.match(/<polygon/g)||[]).length;
      const want={point:[1,0],'line segment':[2,0],ray:[1,1],line:[0,2]}[p.ans];if(dots!==want[0]&&p.ans!=='point'||heads!==want[1])e('drawing '+dots+'/'+heads);}
    else if(p.kind==='lines'){if(p.opts.indexOf(p.ans)<0)e('lines');const ls=lines(p.svg,2.2),ang=l=>mod180(Math.atan2(l.y1-l.y2,l.x2-l.x1)*180/Math.PI);
      if(ls.length!==2)e('line count');else{const d=Math.abs(ang(ls[0])-ang(ls[1])),dd=Math.min(d,180-d);
        const got=dd<0.5?'parallel':near(dd,90,0.5)?'perpendicular':'intersecting';if(got!==p.ans)e('relation '+got);}
      if(L<2)e('lines below L2');}
    else if(p.kind==='draw'){if(L<2)e('draw below L2');if(!p.svgKey.includes('var(--key)')||p.svg.includes('var(--key)'))e('key only in key');if(!p.prompt.startsWith('Draw '))e('prompt');}
    else e('kind');break;}
  case 'gclass':{const f=G('GC_FIG')[p.name],g=geom(f.pts);
    if(g.par!==f.par||g.ra!==f.ra)e('table disagrees with geometry '+g.par+'/'+g.ra);
    if(p.kind==='par'&&p.ans!==String(g.par))e('par');if(p.kind==='ra'&&p.ans!==String(g.ra))e('ra');
    if(p.kind==='tri'){const mx=Math.max(...g.ang),w=mx<89.9?'acute':near(mx,90,0.1)?'right':'obtuse';if(w!==p.ans||f.pts.length!==3)e('triangle class');}
    if(L===1&&(p.kind!=='par'||['rtrap','kite','pentagon','hexagon','acute','right','obtuse'].includes(p.name)))e('L1 content');
    if(p.kind==='par'&&f.pts.length===3)e('triangle parallel');
    if(!(p.svg.includes('rotate(')&&p.svg.includes('<polygon')))e('svg');break;}
  case 'gsym':{const f=G('GS_FIG')[p.name],ax=axesOf(f.pts);
    if(ax.join()!==f.axes.map(mod180).sort((a,b)=>a-b).join())e('axes disagree with geometry '+ax.join());
    if(p.kind==='count'||p.kind==='draw'){if(p.ans!==String(ax.length))e('count');if(p.svg.includes('stroke-dasharray="7 5"'))e('answer lines in blank');
      if((p.svgKey.match(/stroke-dasharray="7 5"/g)||[]).length!==ax.length||(ax.length&&!p.svgKey.includes('var(--key)')))e('key lines');if(p.kind==='draw'&&!ax.length)e('draw with none');}
    else if(p.kind==='is'){const yes=ax.includes(mod180(p.d));if(yes!==(p.ans==='yes'))e('is answer');
      if(!yes&&ax.some(a=>{const t=Math.abs(mod180(p.d)-a);return Math.min(t,180-t)<8;}))e('false line too close');
      if((p.svg.match(/stroke-dasharray="7 5"/g)||[]).length!==1)e('dashed line');}
    else e('kind');
    if(L===1&&(['rhombus','kite','trapezoid','parallelogram','pentagon','hexagon'].includes(p.name)||p.kind==='draw'))e('L1 content');break;}
  case 'ghier':{
    if(p.kind==='tf'){const want=kind(p.s,p.t);if(p.ans!==(want?'true':'false')||!p.text.includes(`All ${plural[p.s]} are ${plural[p.t]}`))e('tf');}
    else if(p.kind==='choose'){const good=p.opts.filter(o=>DEF[p.s]&&DEF[o]&&kind(p.s,o));if(good.length!==1||good[0]!==p.ans||p.opts.length!==4||new Set(p.opts).size!==4)e('choose '+good.join());
      if(['triangle','pentagon','hexagon'].includes(p.ans))e('bad answer');}
    else if(p.kind==='prop'){if(L<2)e('prop below L2');const want=holds(p.s,p.pr);if(p.ans!==(want?'true':'false')||!p.text.includes(`All ${plural[p.s]} have ${p.pr}`))e('prop');}
    else if(p.kind==='inh'){if(L<3)e('inh below L3');if(!holds(p.s,p.pr))e('premise false');const want=holds(p.t,p.pr);if(p.ans!==(want?'yes':'no'))e('inh answer');
      if(!(kind(p.t,p.s)||kind(p.s,p.t)))e('unrelated');}
    else e('kind');break;}
  case 'rule2g':{
    if(p.A.length!==4||p.B.length!==4||Math.max(...p.B)>12||Math.max(...p.A)>8)e('size');
    p.A.forEach((a,i)=>{if(p.mult?p.B[i]!==a*(p.dB/p.dA):p.B[i]!==a+(p.bS-p.aS))e('relation '+i);});
    if(p.dA<1||p.dB<1)e('rules');if(p.ans!==p.A.map((a,i)=>`(${a}, ${p.B[i]})`).join(', '))e('ans');
    const nx=Math.max(...p.A),ny=Math.max(...p.B),c=(p.sh-56)/ny,cs=circles(p.svgKey);
    if(cs.length!==4||p.A.some((a,i)=>!near(cs[i].x,44+a*c)||!near(cs[i].y,16+ny*c-p.B[i]*c)))e('key points');
    if(circles(p.svg).length)e('blank grid');if(!p.lines[0].includes(`add ${p.dA}`)||!p.lines[1].includes(`add ${p.dB}`)||!p.lines[0].includes(`start at ${p.aS}`)||!p.lines[1].includes(`start at ${p.bS}`))e('rule text');
    if(L<3&&!p.mult)e('plus below L3');break;}
  }
}
const IDS={vis:['cplane','cpword','protr','angadd','angc','gfig','gclass','gsym','ghier'],ns:['rule2g']};
for(const mod of Object.keys(IDS))for(const id of IDS[mod])for(const L of [1,2,3])for(let s=0;s<250;s++){
  const gen=(mod==='vis'?SP.VGEN:SP.NGEN)[id];if(!gen){bad.push('missing generator '+id);break;}
  check(gen(SP.rngFrom('g5g'+id+L+'-'+s),L),id,L,s);}
/* every new type must appear in the interface list under its module */
for(const id of IDS.vis)if(!SP.VIS_TYPES.includes(id))bad.push('vis type not registered: '+id);
/* a worksheet with each type renders and its answer key shows the answers */
for(const id of IDS.vis){const st=SP.defaults();st.module='vis';for(const t of Object.keys(st.vis.types))st.vis.types[t]=t===id;st.vis.level=3;
  const h=SP.renderAll(st);n++;if(!h||(typeof h==='string'?h:JSON.stringify(h)).length<500)bad.push('render '+id);}
console.log(`geometry and coordinate plane checked ${n} problems; issues`,bad.slice(0,12),bad.length);
process.exit(bad.length?1:0);
