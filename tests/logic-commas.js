/* Thousands commas: every worksheet renders each whole number of 1,000 or more with commas (1,234, 12,345, 123,456, 1,000,000).
   Renders every module, type and level, strips the markup, and reports any run of 4 or more digits without commas.
   Vertical layouts put one digit per box with a narrow comma box between groups; those rows are joined and checked too. Years are not generated. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=new Map();let sheets=0;
/* markup removed: inline underline tags join (the digits stay one number); every other tag separates; the footer (title, set name, page numbers) is not worksheet content */
const text=h=>h.replace(/<style[\s\S]*?<\/style>/g,' ').replace(/<\/?u>/g,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&emsp;|&ensp;|&thinsp;/g,' ').replace(/&[a-z]+;/g,' ').replace(/World Wide Worksheet Maker 2000\s*·\s*Set\s+\S+(\s*Page\s+\d+\s+of\s+\d+)?/g,' ').replace(/Name\s+Date/g,' ');
/* vertical rows: the digit cells of one row are joined so a number written one digit per box is read as one number (it must carry its commas too) */
const rows=h=>[...h.matchAll(/<div class="vr[^"]*">([\s\S]*?)<\/div>/g)].map(m=>' '+m[1].replace(/<[^>]+>/g,'')+' ').join(' ');
/* a run of 4+ digits that is not part of a comma-grouped number and not the fraction digits of a decimal */
const RAW=/(?<![\d,.])\d{4,}(?![\d])/g, BADGROUP=/(?<![\d,])\d{1,3}(?:,\d{3})*,\d{1,2}(?!\d)|(?<![\d,])\d{4,},\d{3}/g;
function scan(label,s){
  for(const key of [false,true]){s.key=key;s.pages=2;const out=SP.renderAll(s);sheets++;const t=text(out)+' '+rows(out);
    for(const m of t.matchAll(RAW)){const k=label+' raw';if(!bad.has(k))bad.set(k,[]);if(bad.get(k).length<3)bad.get(k).push(t.slice(Math.max(0,m.index-30),m.index+m[0].length+10).replace(/\s+/g,' '));}
    for(const m of t.matchAll(BADGROUP)){const k=label+' group';if(!bad.has(k))bad.set(k,[]);if(bad.get(k).length<3)bad.get(k).push(t.slice(Math.max(0,m.index-30),m.index+m[0].length+10).replace(/\s+/g,' '));}}}
const base=(mod,seed)=>{const s=SP.defaults();s.module=mod;s.seed=seed;s.arPerPage=24;s.perPage=24;return s;};
/* addition and subtraction up to six digits, horizontal and vertical, with and without the 1,000,000 limit */
for(const fmt of ['horizontal','vertical'])for(const [d1,d2] of [[4,4],[5,3],[6,6]])for(const cap of [0,1000000]){const s=base('addsub','cm'+fmt+d1+d2+cap);Object.assign(s.as,{d1,d2,cap,format:fmt});scan(`addsub ${fmt} ${d1}/${d2} cap${cap}`,s);}
/* multiplication and division: digit mode with large factors, long division with big dividends, remainders */
for(const fmt of ['horizontal','vertical'])for(const [da,db,na,nb,rem] of [[4,1,4,1,false],[3,2,3,2,false],[3,3,4,2,true],[2,2,4,1,true]]){const s=base('muldiv','cmm'+fmt+da+db+na+nb);Object.assign(s.md,{mode:'digits',da,db,na,nb,rem,format:fmt});scan(`muldiv ${fmt} ${da}x${db} div${na}/${nb} rem${rem}`,s);}
/* every type of the other modules at every level */
for(const [mod,reg,lv]of [['ns','ns','level'],['fdp','fd','level'],['vis','vis','level'],['tm','tm','level']]){const ids=Object.keys(SP.defaults()[reg].types);
  for(const id of ids)for(const L of [1,2,3]){const s=base(mod,'cm'+mod+id+L);s[reg].level=L;for(const k of ids)s[reg].types[k]=k===id;scan(`${mod}:${id} L${L}`,s);}}
const issues=[...bad.entries()].map(([k,v])=>k+' :: '+v.join(' | '));
console.log('comma scan',sheets,'sheets;',issues.length,'findings');
for(const i of issues.slice(0,60))console.log(i);
process.exit(issues.length?1:0);
