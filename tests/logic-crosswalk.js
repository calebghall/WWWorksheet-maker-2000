/* Crosswalk checks: every framework row has a crosswalk entry, every target id exists, status rules hold, and the lookups
   (stdPreset, stdInfo) behave, including a multi-target row (a Combined worksheet) and the worst-of status rule. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];
/* every framework, not only the embedded ones: the build tool writes each one's payload file, which registers itself */
require('child_process').execFileSync(process.env.PYTHON||(process.platform==='win32'?'python':'python3'),[path.join(root,'tools','build_fw.py')],{stdio:'ignore'});
const dist=path.join(root,'standards','dist');
for(const f of fs.readdirSync(dist).filter(f=>f.endsWith('.js')))vm.runInContext(fs.readFileSync(path.join(dist,f),'utf8'),ctx);
let rows=0;
for(const file of fs.readdirSync(path.join(root,'standards')).filter(f=>f.endsWith('.crosswalk.json'))){
  const fw=file.split('.')[0],xw=JSON.parse(fs.readFileSync(path.join(root,'standards',file),'utf8')),std=JSON.parse(fs.readFileSync(path.join(root,'standards',fw+'.json'),'utf8')).rows;
  if(xw.framework!==fw)bad.push(fw+' framework field');
  if(!xw.name)bad.push(fw+' crosswalk needs a name');
  const D=SP.STD_FW[fw];  /* only frameworks embedded in this build are registered */
  if(D&&JSON.stringify(D.xw)!==JSON.stringify(xw.rows))bad.push(fw+' embedded crosswalk is stale (run python3 build.py)');
  if(D&&(D.list.length!==Object.keys(std).length||D.list.some(r=>r[3]!==std[r[0]].grade)))bad.push(fw+' embedded list differs from standards/'+fw+'.json');
  for(const c of Object.keys(std)){rows++;
    const r=xw.rows[c];if(!r){bad.push(fw+' '+c+' no crosswalk row');continue;}
    if(!['supported','partial','gap'].includes(r.status))bad.push(c+' status '+r.status);
    if(r.status==='gap'&&(r.to||!r.need))bad.push(c+' gap needs a need and no to');
    if(r.status==='partial'&&!r.note)bad.push(c+' partial needs a note');
    if(r.status!=='gap'){if(!r.to||!r.to.length)bad.push(c+' needs to');for(const i of r.to||[])if(!SP.STD_BY_ID[i])bad.push(c+' unknown id '+i);}
    const info=SP.stdInfo(c,fw);
    if((r.status==='gap')!==(info.preset===null))bad.push(c+' preset/gap mismatch');
  }
  for(const c of Object.keys(xw.rows))if(!std[c])bad.push(fw+' '+c+' is not a standard of the framework');
}
/* Tennessee is the default framework: the 153 presets map one to one, in order of the presets, with no gap rows. */
const tn=SP.STD_FW.tn.xw,single=Object.values(tn).filter(r=>r.to);
if(single.length!==153||single.some(r=>r.to.length!==1))bad.push('tn should have 153 single-target rows');
if(new Set(single.map(r=>r.to[0])).size!==153)bad.push('tn targets should be 153 distinct ids');
if(Object.values(tn).filter(r=>r.status==='gap').length!==0)bad.push('tn should have no gap rows');
/* lookups, on a temporary framework so the data files stay untouched */
SP.STD_FW.zz={list:[],grade:{},xw:{A:{to:['addsub.add-subtract-within-10','multi.read-write-compare-decimals'],status:'supported'},B:{to:['num.count-fives-tens'],status:'supported'},C:{status:'gap',need:'x'},D:{to:['frac.equivalent-fractions'],status:'partial',note:'note d'}}};
const multi=SP.stdPreset('A','zz');
if(!multi||multi.m!=='parts'||multi.parts.length!==1+SP.STD_BY_ID['multi.read-write-compare-decimals'].parts.length)bad.push('multi-target preset should flatten into one part per target part');
if(SP.stdPreset('C','zz')!==null)bad.push('gap row has a preset');
if(SP.stdInfo('D','zz').status!=='partial'||SP.stdInfo('D','zz').note!=='note d')bad.push('declared partial');
/* a multi-target row builds and renders a Combined worksheet titled with the framework's own code */
try{const st=SP.defaults();st.seed='Q';st.pages=2;st.std.f='zz';SP.applyStandard(st,'A');
  if(st.module!=='combo'||!st.parts||st.parts.length!==multi.parts.length)bad.push('multi-target applyStandard');
  if(!String(st.titles.combo).startsWith('A '))bad.push('title should start with the framework code, got '+st.titles.combo);
  const out=SP.renderAll(st);if(!out||!out.includes('sheet'))bad.push('multi-target render');
}catch(e){bad.push('multi-target threw '+e.message);}
delete SP.STD_FW.zz;
console.log('crosswalk rows',rows,'issues',bad.length?bad:[]);
process.exit(bad.length?1:0);
