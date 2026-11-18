/* Addition and Subtraction caps ("within") and the second-number setting, checked against the rules, not against the generator. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,R=SP.REG,bad=[];let n=0;
const carry=nums=>{const L=Math.max(...nums.map(x=>String(x).length));for(let i=0;i<L;i++){let s=0;for(const x of nums)s+=Math.floor(x/10**i)%10;if(s>=10)return true;}return false;};
const borrow=(a,b)=>{for(let i=0;i<String(a).length;i++)if(Math.floor(a/10**i)%10<Math.floor(b/10**i)%10)return true;return false;};
for(const cap of [0,10,20,30,100,1000])for(const addends of [2,3,4])for(const second of ['digits','tens','mix'])for(const regroup of ['any','required','none'])for(const [d1,d2] of [[1,1],[2,1],[2,2],[3,3]]){
  const st=SP.defaults();st.module='addsub';Object.assign(st.as,{cap,addends,second,regroup,d1,d2,format:'horizontal'});
  const pl=R.addsub.plan(st,12,`K${cap}${addends}${second}${regroup}${d1}${d2}`);
  for(const q of pl.probs){n++;const tag=`cap${cap} add${addends} ${second} ${regroup} d${d1}/${d2}`;
    if(q.type==='add'){
      const sum=q.nums.reduce((x,y)=>x+y,0);
      if(sum!==q.ans)bad.push(tag+' wrong add answer');
      if(q.nums.length!==addends)bad.push(tag+' wrong addend count '+q.nums.length);
      if(cap&&sum>cap)bad.push(tag+` sum ${sum} over cap`);
      if(q.nums.some(x=>x<1))bad.push(tag+' addend below 1');
      if(regroup==='none'&&carry(q.nums)&&!(cap&&cap<=30&&false))bad.push(tag+' carries but regroup never: '+q.nums);
      if(regroup==='required'&&!carry(q.nums)&&!cap&&!(second==='tens'&&d1===1))bad.push(tag+' no carry but regroup always: '+q.nums);
      if(second==='tens'&&!(cap&&cap<=30)&&d1>1&&q.nums.slice(1).some(x=>x%10))bad.push(tag+' second not a multiple of 10: '+q.nums);
      if(second==='mix'&&!(cap&&cap<=30)&&d1>1&&q.nums.slice(1).some(x=>x>9&&x%10))bad.push(tag+' second not 1-digit or multiple of 10: '+q.nums);
    }else{
      if(q.a-q.b!==q.ans)bad.push(tag+' wrong subtract answer');
      if(q.ans<0||q.b<1)bad.push(tag+' bad subtraction '+q.a+'-'+q.b);
      if(cap&&q.a>cap)bad.push(tag+` minuend ${q.a} over cap`);
      if(regroup==='none'&&borrow(q.a,q.b))bad.push(tag+' borrows but regroup never: '+q.a+'-'+q.b);
    }
    if(bad.length>12)break;}
}
/* presets: every K-2 addsub standard now has no note and uses a cap that matches its title */
const want={'K.OA.A.2':10,'K.OA.A.5':10,'1.OA.A.2':20,'1.OA.C.5':20,'1.OA.C.6':20,'1.NBT.C.5':100,'2.OA.B.2':30,'2.NBT.B.5':100,'2.NBT.B.7':1000};
for(const code of Object.keys(vm.runInContext("STD_XW",ctx).tn)){const s=vm.runInContext("stdPreset",ctx)(code);if(!s)continue;if(want[code]!==undefined){if(s.n)bad.push(code+' still has a note');if(s.as.cap!==want[code])bad.push(`${code} cap ${s.as.cap}, expected ${want[code]}`);}if(code==='2.NBT.B.6'&&(s.as.addends!==4||s.n))bad.push('2.NBT.B.6 should allow four addends with no note');}
console.log(`k2-a: ${n} problems checked; issues`,bad.slice(0,12),bad.length);
process.exit(bad.length?1:0);
