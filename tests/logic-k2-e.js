/* Number Sense types cmpw (compare numerals to 10) and numrw3 (read and write numbers to 1000): answers recomputed from each problem's own fields. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,E=x=>vm.runInContext(x,ctx),bad=[];let n=0;
const NGEN=E('NGEN'),NHTML=E('NHTML');
/* independent word parser, not the generator's own word builder */
const ONES={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19};
const TENS={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
function parse(s){let t=0,cur=0;for(const w of s.split(/[\s-]+/)){if(w in ONES)cur+=ONES[w];else if(w in TENS)cur+=TENS[w];else if(w==='hundred')cur*=100;else if(w==='thousand'){cur*=1000;}else return NaN;}return t+cur;}
const num=s=>+String(s).replace(/,/g,'');
function chk(p,id,L){n++;const e=m=>bad.push(`${id} L${L}: ${m} ${JSON.stringify(p).slice(0,140)}`);
  if(!p.sig||!p.prompt||p.prompt.length>42||!(p.ew>0&&p.eh>0))e('shape');
  if(id==='cmpw'){const w=p.a>p.b?'greater than':p.a<p.b?'less than':'equal to';if(p.ans!==w)e('answer');if(p.a<0||p.b<0||p.a>10||p.b>10||!Number.isInteger(p.a)||!Number.isInteger(p.b))e('range');
    if(L===1&&(p.a===p.b||p.a<1||p.a>5||p.b<1||p.b>5))e('L1');}
  else{const n0=p.n;if(n0<100||n0>1000)e('range');if(L<3&&(n0===1000||n0%10===0||Math.floor(n0/10)%10===0))e('zero digits below L3');
    if(p.variant==='w2n'){if(parse(p.word)!==n0||num(p.ans)!==n0)e('w2n');}
    else if(p.variant==='n2w'){if(parse(p.ans)!==n0)e('n2w');}
    else if(p.variant==='e2s'){const t=p.exp.split(' + ').map(Number);if(t.reduce((a,b)=>a+b,0)!==n0||num(p.ans)!==n0)e('e2s');if(p.exp.includes('0 +')&&/(^|\+ )0( |$)/.test(p.exp))e('zero term');}
    else if(p.variant==='s2e'){const t=p.ans.replace(/,/g,'').split(' + ').map(Number);if(t.reduce((a,b)=>a+b,0)!==n0||t.some(v=>!(v>0)))e('s2e');}
    else e('variant');
    if(L===1&&(p.variant==='e2s'||p.variant==='s2e'))e('expanded form at L1');}
  const h=NHTML[id]?NHTML[id](p,true,(v)=>String(v)):'';if(!h||h.includes('undefined'))e('html');
}
for(const id of ['cmpw','numrw3'])for(const L of [1,2,3])for(let i=0;i<800;i++)chk(NGEN[id](SP.rngFrom('E'+i+id),L),id,L);
/* the standard presets build worksheets that contain the new types */
for(const [code,type] of [['K.CC.C.7','cmpg'],['K.CC.C.8','cmpw'],['2.NBT.A.3','numrw3']]){n++;
  const pr=SP.stdPreset(code,'tn');if(!pr||!JSON.stringify(pr).includes(type))bad.push('preset '+code+' lacks '+type);}
/* Kentucky is not embedded in the default build: its crosswalk file must point at the same presets */
const kx=JSON.parse(fs.readFileSync(path.join(__dirname,'..','standards','ky.crosswalk.json'),'utf8')).rows;
for(const [code,id] of [['KY.K.CC.6','num.compare-two-groups'],['KY.K.CC.7','num.compare-numerals-words'],['KY.2.NBT.3','num.read-write-numbers-1000']]){n++;
  if(!kx[code]||kx[code].status!=='supported'||kx[code].to[0]!==id)bad.push('ky '+code+' not mapped to '+id);}
console.log('k2-e problems checked',n,'; issues',[...new Set(bad)].slice(0,12),bad.length);process.exit(bad.length?1:0);
