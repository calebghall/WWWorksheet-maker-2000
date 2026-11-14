/* Multiplication with a second size ("Also mix in a second size"): every product has the digit counts of one of the two sizes, both sizes occur,
   switching it off leaves the sets exactly as before, the 4.NBT.B.5 preset uses it, and old saved settings without the new keys still load. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,issues=[];let checked=0;
const len=n=>String(n).length;
const mk=(o,seed)=>{const s=SP.defaults();s.module='muldiv';s.seed=seed;s.perPage=24;s.arPerPage=24;Object.assign(s.md,{mul:true,div:false,mode:'digits'},o);return s;};
/* every problem is one of the two sizes, and both occur */
for(const [da,db,da2,db2] of [[4,1,2,2],[3,1,2,2],[2,1,3,2],[4,2,1,1]]){
  for(let k=0;k<30;k++){const s=mk({da,db,alt:true,da2,db2,format:k%2?'horizontal':'vertical'},'ms'+da+db+da2+db2+k);
    const set=SP.generateSet(s);const probs=(set.problems||set.items||set).flat?(set.problems||set.items||set):[];
    const seen=new Set();
    for(const q of probs){if(q.type!=='mul')continue;checked++;const a=len(q.a),b=len(q.b);
      const one=a===da&&b===db,two=a===da2&&b===db2;
      if(!one&&!two)issues.push(`${da}x${db}/${da2}x${db2}: ${q.a} x ${q.b}`);
      if(q.a*q.b!==q.ans)issues.push('product '+q.a+' '+q.b);
      seen.add(one?'1':'2');}
    if(k<5&&seen.size<2&&probs.length>=12)issues.push(`${da}x${db}/${da2}x${db2} set ${k}: only one size in ${probs.length} problems`);}}
/* off = identical to a state that never had the new keys */
{const a=mk({da:3,db:2},'same1'),b=mk({da:3,db:2},'same1');for(const k of ['alt','da2','db2'])delete b.md[k];
  if(JSON.stringify(SP.generateSet(a))!==JSON.stringify(SP.generateSet(b)))issues.push('alt off changed the set');}
/* the preset */
{const s=SP.defaults();SP.applyStandard(s,'4.NBT.B.5');const M=s.md;
  if(!(M.mode==='digits'&&M.da===4&&M.db===1&&M.alt&&M.da2===2&&M.db2===2&&!M.div))issues.push('preset settings '+JSON.stringify(M));
  const st=SP.STANDARDS.find(x=>x.c==='4.NBT.B.5');if(st.n)issues.push('preset still carries a partial note');}
console.log('multiplication sizes checked',checked,'problems; issues',JSON.stringify(issues.slice(0,10)));
process.exit(issues.length?1:0);
