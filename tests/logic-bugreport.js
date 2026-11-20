/* Bug report link: the pre-filled GitHub issue URL carries the set code and settings, decodes back to the same settings, stays under 6,000 characters for every module (including the largest, Combined), and matches the fields of .github/ISSUE_TEMPLATE/bug.yml. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,issues=[],tpl=fs.readFileSync(path.join(__dirname,'..','.github','ISSUE_TEMPLATE','bug.yml'),'utf8');
const ids=[...tpl.matchAll(/^\s+id: (\w+)/gm)].map(m=>m[1]);
let n=0,longest=0;
for(const mod of ['area','addsub','muldiv','fdp','ns','tm','vis','mix','combo']){
  const s=SP.defaults();s.module=mod;s.seed='ABC123';
  const LINK='https://example.org/app/#s='+'A1b2-C3d4_'.repeat(150);
  const u=new URL(SP.bugReportUrl(s,'TestAgent/1.0',LINK));n++;longest=Math.max(longest,u.href.length);
  const p=u.searchParams;
  if(u.href.length>6000)issues.push(mod+' url too long '+u.href.length);
  if(p.get('template')!=='bug.yml')issues.push(mod+' template');
  if(p.get('set_code')!=='ABC123'||!p.get('title').includes('ABC123'))issues.push(mod+' set code');
  for(const k of ['set_code','settings','browser','share_link','problem'])if(!ids.includes(k))issues.push('template lacks field '+k);
  if(p.get('share_link')!==LINK)issues.push(mod+' share link missing or changed');
  if(!new URL(SP.bugReportUrl(s,'a')).searchParams.has('share_link')||new URL(SP.bugReportUrl(s,'a')).searchParams.get('share_link')!=='')issues.push(mod+' no-link report');
  let back;try{back=JSON.parse(p.get('settings'));}catch(e){issues.push(mod+' settings not JSON');continue;}
  if(back.module!==mod||back.seed!=='ABC123')issues.push(mod+' settings lost module or seed');
  for(const M of ['num','oa','frac','time','meas','geom','fd','ns','tm','vis'])if(back[M]&&Array.isArray(back[M].types)){const m={};for(const k of Object.keys(s[M].types))m[k]=back[M].types.includes(k);back[M].types=m;}
  if(Array.isArray(back.types)){const m={};for(const k of Object.keys(s.types))m[k]=back.types.includes(k);back.types=m;}
  if(JSON.stringify(Object.assign({},s,{titles:undefined}))!==JSON.stringify(Object.assign({},back,{titles:undefined})))issues.push(mod+' settings do not round trip');
}
/* an oversized state falls back to the basics */
const big=SP.defaults();big.seed='ZZZ';big.title='x'.repeat(9000);
const bu=new URL(SP.bugReportUrl(big,'a','https://example.org/#s=abc'));if(bu.href.length>6000||JSON.parse(bu.searchParams.get('settings')).seed!=='ZZZ'||bu.searchParams.get('share_link')!=='https://example.org/#s=abc')issues.push('fallback keeps seed and link');
console.log('bug report url',n,'modules; longest',longest,'chars; issues',JSON.stringify(issues));
process.exit(issues.length?1:0);
