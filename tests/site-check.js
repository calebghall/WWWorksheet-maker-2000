/* Site build (python3 build.py --target site): coins load from relative files, nothing embedded, every file exists and stays small. */
const fs=require('fs'),path=require('path');
const dist=path.join(__dirname,'..','dist'),html=fs.readFileSync(path.join(dist,'index.html'),'utf8'),bad=[];
if(/data:image\/jpeg/.test(html))bad.push('site page still embeds image data');
if(!/id="printBtn"/.test(html))bad.push('no print button');
for(const k of ['penny','nickel','dime','quarter'])for(const s of ['','-grey']){
  const f=`assets/coins/${k}${s}.jpg`;if(!html.includes(`'${f}'`))bad.push('page does not reference '+f);
  const p=path.join(dist,f);if(!fs.existsSync(p))bad.push('missing '+f);else if(fs.statSync(p).size>22000)bad.push(f+' over 22 KB');}
if(/(href|src)=["']\//.test(html)||/'\/assets/.test(html))bad.push('absolute path breaks project sites');
if(!fs.existsSync(path.join(dist,'.nojekyll')))bad.push('no .nojekyll');
/* every framework file the manifest names ships next to the page by a relative path; the default build embeds tn */
const man=JSON.parse(html.match(/const STD_MANIFEST = (.*);/)[1]);
if(!man.some(m=>m.id==='tn'&&!m.file))bad.push('tn should be embedded');
for(const m of man)if(m.file&&(m.file.startsWith('/')||!fs.existsSync(path.join(dist,m.file))))bad.push('framework file missing or absolute: '+m.file);
console.log('site build: html',html.length,'bytes; issues',bad,bad.length);process.exit(bad.length?1:0);
