/* Greyscale print and coin artwork: the grey palette must keep categories apart, and coins must be recognisable without color.
   Reads the built page, so run it after build.py. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const E=x=>vm.runInContext(x,ctx),bad=[];
/* ---- palette ---- */
const block=html.match(/\.sheets\.grey\s*\{([^}]*)\}/);
if(!block)bad.push('no .sheets.grey rule');
const vars={};if(block)for(const m of block[1].matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,6})/gi)){let h=m[2].slice(1);if(h.length===3)h=h.split('').map(c=>c+c).join('');vars[m[1]]=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
const lum=v=>Math.round(.299*v[0]+.587*v[1]+.114*v[2]);
const L=k=>vars[k]?lum(vars[k]):NaN;
for(const k of Object.keys(vars))if(vars[k].some((c,i,a)=>Math.abs(c-a[0])>2))bad.push(`grey var --${k} is not neutral`);
const cats=['c0','c1','c2','c3'];
for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)if(Math.abs(L(cats[i])-L(cats[j]))<30)bad.push(`categories ${cats[i]}/${cats[j]} too close: ${L(cats[i])} vs ${L(cats[j])}`);
if(Math.abs(L('ink')-L('key'))<40)bad.push('answer key grey too close to ink');
if(L('key')>120)bad.push('answer key grey too light to read');
for(const k of cats)if(255-L(k)<15)bad.push(`${k} indistinguishable from white paper`);
/* ---- the color palette must differ from the grey one for every token the grey rule overrides (so nothing is skipped) ---- */
const root=html.match(/:root\s*\{[^}]*--c0:[^}]*\}/);
for(const k of Object.keys(vars))if(!new RegExp('--'+k+':').test(root?root[0]:''))bad.push(`--${k} overridden for grey but not defined in :root`);
/* ---- no categorical hex left in the drawing code ---- */
for(const f of fs.readdirSync(path.join(__dirname,'..','src','js','modules')).filter(n=>/^vis.*\.js$/.test(n))){const s=fs.readFileSync(path.join(__dirname,'..','src','js','modules',f),'utf8');
  for(const bad1 of ['#f4b6bf','#b9d5f2','#c6e5b8','#fbe3a1','#8fb4de','#cfd3d9'])if(s.includes(bad1))bad.push(`${f} still has hard-coded ${bad1}`);}
/* ---- coins: embedded Mint images, color and greyscale copies, real size order ---- */
const V_COIN=E('V_COIN'),IMG=E('COIN_IMG'),names=Object.keys(V_COIN);
const dia=k=>V_COIN[k].d;
if(!(dia('dime')<dia('penny')&&dia('penny')<dia('nickel')&&dia('nickel')<dia('quarter')))bad.push('coin sizes are not in real order dime < penny < nickel < quarter');
const defs=E('coinDefs()'),seen=new Set();
for(const k of names){
  for(const m of ['c','g']){
    const u=IMG[k]&&IMG[k][m];
    if(!u||!u.startsWith('data:image/jpeg;base64,'))bad.push(`${k}: missing ${m} image`);
    else{if(seen.has(u))bad.push(`${k}: ${m} image duplicates another`);seen.add(u);if(u.length>30000)bad.push(`${k}: ${m} image over 22 KB, downsize it`);}
    if(!defs.includes(`id="ci-${k}-${m}"`))bad.push(`coinDefs lacks ci-${k}-${m}`);
  }
  const svg=E(`vcoin('${k}',50,50)`);
  if(!svg.includes(`#ci-${k}-c`)||!svg.includes(`#ci-${k}-g`))bad.push(`${k}: vcoin does not reference both copies`);
  if(svg.length>600)bad.push(`${k}: vcoin markup embeds image data instead of referencing it`);
}
if(!/\.sheets:not\(\.grey\)\s*\.cg,\s*\.sheets\.grey\s*\.cc\s*\{\s*display:\s*none/.test(html))bad.push('no CSS rule that swaps color and grey coin copies');
console.log(`greyscale/coins checked ${Object.keys(vars).length} grey tokens, ${names.length} coins; luminance c0..c3 ${cats.map(L).join(',')} key ${L('key')}; issues`,bad.slice(0,10),bad.length);
process.exit(bad.length?1:0);
