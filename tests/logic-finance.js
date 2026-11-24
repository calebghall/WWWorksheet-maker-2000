/* Financial literacy types (ns-finance.js): every answer recomputed or looked up from the problem's own fields and from tables kept here, not from the generator. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
const SP=ctx.__SP,bad=[];let n=0;
const IDS='flinc fljob flwant flsave flgrow flbank flcred flmake flscar flspend flexp flprofit flopt flallow flinst fltax flnet flpay flrec flbud'.split(' ');
const ev=e=>Function('"use strict";return ('+e.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-')+')')();
const sum=a=>a.reduce((x,y)=>x+y,0);
/* answer for each calc problem, from nums/rows */
const CALC={
 fljob:{rate:p=>p.nums[0]*p.nums[1],skill:p=>(p.nums[1]-p.nums[0])*p.nums[2]},
 flgrow:{week:p=>p.nums[0]*p.nums[1],start:p=>p.nums[0]+p.nums[1]*p.nums[2],goal:p=>p.nums[0]/p.nums[1]},
 flbank:{dep:p=>p.nums[0]+p.nums[1],wdr:p=>p.nums[0]-p.nums[1],two:p=>p.nums[0]+p.nums[1]-p.nums[2]},
 flcred:{owe:p=>p.nums[1],back:p=>p.nums[0]+p.nums[1]},
 flmake:{sum:p=>sum(p.nums),batch:p=>p.nums[0]*p.nums[1]},
 flscar:{diff:p=>p.nums[1]},
 flspend:{left:p=>p.nums[0]-p.nums[1]},
 flexp:{fixed:p=>sum(p.rows.filter(r=>r[0]==='fixed').map(r=>r[1])),variable:p=>sum(p.rows.filter(r=>r[0]==='variable').map(r=>r[1]))},
 flprofit:{basic:p=>p.nums[0]-p.nums[1],each:p=>p.nums[0]*p.nums[1]-p.nums[2],two:p=>p.nums[0]*p.nums[1]-p.nums[2]-p.nums[3]},
 flallow:{share:p=>p.nums[0]-p.nums[1]-p.nums[2],spend:p=>p.nums[0]-p.nums[1]-p.nums[2],save:p=>p.nums[0]-p.nums[1]-p.nums[2],frac:p=>p.nums[1]===0?p.nums[0]/2:p.nums[0]/4},
 fltax:{sales:p=>11*p.nums[0],taxamt:p=>p.nums[0],total2:p=>p.nums[0]+p.nums[1]},
 flnet:{tax:p=>p.nums[0]-p.nums[1],two:p=>p.nums[0]-p.nums[1]-p.nums[2]},
 flrec:{chk:p=>p.nums[0]-p.nums[1],dep:p=>p.nums[0]+p.nums[1],both:p=>p.nums[0]-p.nums[1]+p.nums[2]},
 flbud:{left:p=>p.nums[0]-p.nums[1]-p.nums[2],over:p=>p.nums[1]+p.nums[2]+p.nums[3]-p.nums[0]}
};
/* words that decide a pick answer, kept here separately */
const has=(t,...w)=>w.some(x=>t.includes(x));
const PICK={
 flinc:(p,L)=>L===1?(has(p.text,'is paid','makes','earns')?'income':'gift'):null,
 flwant:(p,L)=>L<3?(has(p.text,'food','water','a warm coat','a place to live','medicine','clean clothes','a bed','shoes that fit','a doctor visit')?'need':'want'):null,
 flsave:(p,L)=>{const t=p.text;return has(t,'borrows','loan')?'borrowing':has(t,'gives','donates','collection for a charity')?'giving':has(t,'is paid','earns')?'earning':has(t,'piggy bank','jar','savings account','away to use')?'saving':'spending';},
 flbank:p=>has(p.text,'puts','adds','brings')?'deposit':'withdrawal',
 flcred:(p,L)=>L===1?(has(p.text,"uses ")&&has(p.text,"will give it back")?'borrowing':'lending'):null,
 flmake:(p,L)=>L===1?(has(p.text,'to sell')?'producer':'consumer'):null,
 flscar:(p,L)=>L===1?(has(p.text,'storm ruins','fewer','Few ','kills many','small amount')?'up':'down'):null,
 flspend:(p,L)=>L===1?(has(p.text,'saved for','writes a list','a week ahead','saves each week')?'planned':'unplanned'):null,
 flexp:(p,L)=>L<3?(has(p.text,'rent','phone plan','car payment','internet service','health insurance','gym membership','every month')?'fixed':'variable'):null,
 fltax:(p,L)=>L===2?(has(p.text,'register')?'sales tax':has(p.text,'house')?'property tax':has(p.text,'paycheck')?'payroll tax':'income tax'):L===1?(has(p.text,'on the money people earn')?'income tax':has(p.text,"worker's paycheck")?'payroll tax':has(p.text,'price of things')?'sales tax':'property tax'):null,
 flpay:(p,L)=>L===1?(has(p.text,'written note')?'check':has(p.text,'borrow money')?'credit card':has(p.text,'straight from')?'debit card':'electronic payment'):L===3?(has(p.text,'groceries')?'debit card':has(p.text,'phone')?'electronic payment':has(p.text,'next month')?'credit card':'check'):null,
 flrec:(p,L)=>L===2?(has(p.text,'bill')?'Bills to pay':has(p.text,'statement')?'Bank statements':'Receipts'):L===1?(has(p.text,'bought at a store')?'a receipt':has(p.text,'money is in the bank')?'a bank statement':has(p.text,'due date')?'a bill':'a check register'):null,
 flinst:()=>null, flopt:(p,L)=>L===3?'a savings account at a bank':null, fljob:()=>null, flbud:()=>null
};
const ADV={'a piggy bank at home':['It is easy to reach.','It has no fees.'],'a savings account at a bank':['The bank keeps the money safe.','It can earn interest.'],'cash hidden in a drawer':['It is easy to reach.','It is free to use.']};
const DIS={'a piggy bank at home':['It could be lost or stolen.','It does not earn interest.'],'a savings account at a bank':['You may have to go to the bank to get it.','Some accounts have rules about taking money out.'],'cash hidden in a drawer':['It could be lost or stolen.','It does not earn interest.']};
const PADV={'a check':'It leaves a written record.','a credit card':'You can buy something now and pay later.','a debit card':'It uses your own money, so you do not borrow.','an electronic payment':'It is quick and easy to use.'};
const PDIS={'a check':'It takes time to write and for the bank to process.','a credit card':'You may owe interest if you do not pay it all back.','a debit card':'You cannot buy things if the account is empty.','an electronic payment':'Someone could steal your account information.'};
function chk(p,id,L){n++;const e=m=>bad.push(`${id} L${L}: ${m} ${JSON.stringify(p).slice(0,200)}`);
 if(p.type!==id||!p.sig||!p.prompt||!p.text||!(p.ew>0&&p.eh>0))return e('shape');
 if(/NaN|undefined|null|\[object/.test(p.text+(p.opts||[]).join()))e('junk');
 if(p.opts){
  if(p.opts.length<2||p.opts.length>5||new Set(p.opts).size!==p.opts.length)e('options');
  if(p.opts.filter(o=>o===p.ans).length!==1)e('answer not exactly once');
  const exp=PICK[id]&&PICK[id](p,L);if(exp&&exp!==p.ans)e(`expected ${exp}`);
  if(id==='flcred'&&L===2&&/responsible/.test(p.text)){const ok=/pays it back on the day|returns it on time|returns it in good shape/.test(p.text);if((ok?'responsible':'not responsible')!==p.ans)e('responsible');}
  if(id==='flcred'&&L===2&&/benefit or a cost/.test(p.text)){const ben=/helps a friend buy lunch|earns interest/.test(p.text);if((ben?'benefit':'cost')!==p.ans)e('benefit or cost');}
  if(id==='flspend'&&L===2){const ben=/gets to enjoy|gets something/.test(p.text);if((ben?'benefit':'cost')!==p.ans)e('cost or benefit');}
  if(id==='flscar'&&L===2){const up=/went up/.test(p.text);if(!(up?/fewer .* than before/:/more .* than before/).test(p.ans))e('reason');}
  if(id==='fljob'&&L===1){const J={baker:'baking bread and cakes',teacher:'explaining new ideas',doctor:'caring for sick people',mechanic:'fixing cars and engines',farmer:'growing crops',librarian:'helping people find books','bus driver':'driving a bus safely',cashier:'counting money and giving change',firefighter:'putting out fires safely',carpenter:'building with wood'};const j=p.text.match(/does a (.+) need/)[1];if(J[j]!==p.ans)e('job skill');}
  if(id==='fljob'&&L===2&&/hours/.test(p.text)){const m=p.text.match(/^(\w+) works (\d+) hours.*?\. (\w+) works (\d+) hours/);if(!m||(+m[2]>+m[4]?m[1]:m[3])!==p.ans)e('hours');}
  if(id==='fljob'&&L===2&&/learns to fix computers/.test(p.text)&&p.ans!==p.text.split(' ')[0])e('trained worker');
  if(id==='fljob'&&L===2&&/learns new job skills/.test(p.text)&&p.ans!=='more')e('skills more');
  if(id==='flinc'&&L===2&&(!/for pay\.|stand\./.test(p.ans)))e('earn way');
  if(id==='flinc'&&L===3){const t=p.text;const exp=/present is a ___/.test(t)?'gift':'income';if(exp!==p.ans)e('income word');}
  if(id==='flwant'&&L===3){const needs=['food','water','a warm coat in winter','a place to live','medicine when sick','clean clothes','a bed to sleep in','shoes that fit','a doctor visit'];if(!needs.includes(p.ans)||p.opts.filter(o=>needs.includes(o)).length!==1)e('need first');}
  if(id==='flopt'&&L<3){const m=p.text.match(/Which is (an advantage|a disadvantage) of (.+)\?/),k=m[2],adv=m[1]==='an advantage';if(!(adv?ADV:DIS)[k].includes(p.ans))e('option side');for(const o of p.opts)if(o!==p.ans&&!(adv?DIS:ADV)[k].includes(o))e('option distractor');}
  if(id==='flpay'&&L===2){const m=p.text.match(/Which is (an advantage|a disadvantage) of paying with (.+)\?/),k=m[2],adv=m[1]==='an advantage';if((adv?PADV:PDIS)[k]!==p.ans)e('payment side');for(const o of p.opts)if(o!==p.ans&&!Object.values(adv?PDIS:PADV).includes(o))e('payment distractor');}
  if(id==='flinst'){const t=p.text;if(/safe place/.test(t)&&p.ans!=='a bank')e('safe');if(/borrow money to buy a house/.test(t)&&p.ans!=='a bank')e('borrow');if(/purpose of a bank/.test(t)&&!/keeps people's money safe|lends money to people/.test(p.ans))e('purpose');if(p.opts.length!==L+1)e('option count');}
  if(id==='flnet'&&L===1){const m=p.text.match(/earns (\$[\d,]+) .* takes home (\$[\d,]+)\. Which amount is \w+'s (gross|net)/);if(!m||(m[3]==='gross'?m[1]:m[2])!==p.ans||+m[1].slice(1).replace(/,/g,'')<=+m[2].slice(1).replace(/,/g,''))e('gross net');}
  if(id==='flbud'&&L===3&&!/^(Spend less on wants|Earn more income|Cut back on spending that is not needed|Find a way to earn extra money|Skip buying things that are only wants)\.$/.test(p.ans))e('action');
  if(id==='flsave'&&p.opts.length!==(L===1?2:L===2?3:5))e('save options');
  if(id==='flcred'&&L===1&&p.opts.join()!=='borrowing,lending')e('credit opts');
 }else{
  const f=CALC[id]&&CALC[id][p.kind];if(!f)return e('no recompute for '+p.kind);
  const a=f(p);if(String(a)!==p.ans||!Number.isInteger(a)||a<=0||a>5000)e(`answer ${a}`);
  let q;try{q=ev(p.eq)}catch(x){q=NaN}if(q!==a)e(`number sentence ${p.eq} = ${q}`);
  if(p.nums.some(v=>!Number.isInteger(v)||v<0))e('nums');
  if(p.pre!=='$'&&p.unit!=='weeks')e('unit');
 }
}
for(const L of [1,2,3])for(const id of IDS)for(let i=0;i<500;i++)chk(SP.NGEN[id](SP.rngFrom('FL'+i+id),L),id,L);
/* every type renders, with and without the key; the default is off */
const dflt=SP.defaults();for(const id of IDS)if(dflt.ns.types[id]!==false)bad.push('default on '+id);
for(const id of IDS)for(const L of [1,2,3]){const s=SP.defaults();s.module='ns';s.seed='R5'+id;s.pages=2;s.arPerPage=12;s.ns.level=L;for(const k of Object.keys(s.ns.types))s.ns.types[k]=k===id;
 for(const key of [false,true]){s.key=key;const out=SP.renderAll(s);if(/NaN|undefined|null|\[object/.test(out))bad.push(`junk render ${id} L${L} key${key}`);if(key&&!/class="opt on"|class="blank"[^>]*>[^&<]/.test(out))bad.push(`no answer shown ${id} L${L}`);}}

/* written formats: sort, budget table, complete the sentences. Category lists and key words are kept here separately from the generator. */
const NEW='flsortwn flsortfv flsortig flbtab flexplain'.split(' ');
const NEEDS2=['food','water','a warm coat in winter','a place to live','medicine when sick','clean clothes','a bed to sleep in','shoes that fit','a doctor visit'];
const WANTS2=['a video game','a toy robot','candy','a stuffed animal','a movie ticket','a sticker book','a game console','a pool toy','a skateboard','a toy car','a new poster','a fancy hat'];
const FIXED2=['rent','a phone plan','a car payment','internet service','health insurance','a gym membership','a monthly bus pass','a loan payment'];
const VAR2=['groceries','gas for the car','electricity','movie tickets','restaurant meals','clothes','a trip to the zoo','school snacks'];
const INC2=/^(Pay for|Money from selling|A paycheck|Money for mowing|Wages)/, GIFT2=/(birthday|holiday|gift|present|graduation|wedding)/i;
const SORT={flsortwn:[NEEDS2,WANTS2,'N','W'],flsortfv:[FIXED2,VAR2,'F','V']};
const CLOZE=[['alternative','now','later'],['skills','income','hours'],['scarce','up','down'],['afford','borrower','lender'],['save','college','emergency'],['account','safe','interest'],['spend','save','share'],['bank','lend','interest'],['before','after','less'],['records','receipts','bill'],['same','less','more'],['producer','consumer','supplies']];
function chkNew(p,id,L){n++;const e=m=>bad.push(`${id} L${L}: ${m} ${JSON.stringify(p).slice(0,200)}`);
 if(p.type!==id||!p.sig||!p.ans||!(p.ew>0&&p.eh>0))return e('shape');
 if(/NaN|undefined|\[object/.test(JSON.stringify(p)))e('junk');
 if(id==='flsortwn'||id==='flsortfv'||id==='flsortig'){
  const N=L===1?4:L===2?6:8;if(p.items.length!==N||new Set(p.items.map(t=>t.toLowerCase())).size!==N)return e('items');
  const ls=p.ans.split(' ');if(ls.length!==N||ls.join()!==p.cats.join())e('ans');
  const c1=ls.filter(v=>v===ls[0]).length;if(L===1?(new Set(ls).size!==2||c1!==2):new Set(ls).size!==2)e('both groups');
  p.items.forEach((t,i)=>{let exp;if(id==='flsortig')exp=INC2.test(t)&&!GIFT2.test(t.replace(/^Pay for|^Wages/,''))?'I':'G';else{const [A,B,a,b]=SORT[id];const low=t.toLowerCase();exp=A.includes(low)?a:B.includes(low)?b:'?'}
   if(exp!==ls[i])e('category '+t)});}
 if(id==='flbtab'){const r=p.tbl,v=i=>r[i][1]!==null?r[i][1]:r[i][2],N=p.nums;let exp;
  if(p.kind==='left')exp=[N[0]-N[1]-N[2]];else if(p.kind==='tot'){const t=N[1]+N[2]+N[3];exp=[t,N[0]-t]}else if(p.kind==='over2'){const t=N[1]+N[2]+N[3];exp=[t,t-N[0]]}else if(p.kind==='miss')exp=[N[0]-N[1]-N[2]];else return e('kind');
  if(exp.join(' ')!==p.ans||exp.some(a=>!(a>0)))e('answer '+exp);
  if(p.kind==='over2'&&!(N[1]+N[2]+N[3]>N[0]))e('not over');if((p.kind==='tot'||p.kind==='left')&&exp[exp.length-1]<=0)e('negative left');
  if(p.kind==='miss'&&r[r.length-1][1]!==N[0])e('miss total');if(r.filter(x=>x[1]===null).length!==exp.length)e('blank count');}
 if(id==='flexplain'){const w=CLOZE[p.tpl];if(!w||w.join()!==p.words.join())return e('template');if(p.blank.length!==L||new Set(p.blank).size!==L)e('blanks');
  if(p.ans!==p.blank.map(i=>w[i]).join(' '))e('ans');if(p.bank.length!==L+2||new Set(p.bank).size!==L+2||p.blank.some(i=>!p.bank.includes(w[i])))e('bank');
  if(p.bank.filter(b=>w.includes(b)&&!p.blank.map(i=>w[i]).includes(b)).length)e('unblanked word in bank');}
}
for(const L of [1,2,3])for(const id of NEW)for(let i=0;i<500;i++)chkNew(SP.NGEN[id](SP.rngFrom('FN'+i+id),L),id,L);
for(const id of NEW)for(const L of [1,2,3]){const sg=new Set();for(let i=0;i<400;i++)sg.add(SP.NGEN[id](SP.rngFrom('NV'+i+id),L).sig);if(sg.size<12)bad.push(`low variety ${id} L${L} ${sg.size}`);
 if(dflt.ns.types[id]!==false)bad.push('default on '+id);
 const s=SP.defaults();s.module='ns';s.seed='R6'+id;s.pages=2;s.arPerPage=12;s.ns.level=L;for(const k of Object.keys(s.ns.types))s.ns.types[k]=k===id;
 for(const key of [false,true]){s.key=key;const out=SP.renderAll(s);if(/NaN|undefined|null|\[object/.test(out))bad.push(`junk render ${id} L${L} key${key}`);}}
/* variety: enough distinct problems for one sheet at every level */
for(const id of IDS)for(const L of [1,2,3]){const sg=new Set();for(let i=0;i<300;i++)sg.add(SP.NGEN[id](SP.rngFrom('V'+i+id),L).sig);if(sg.size<12)bad.push(`low variety ${id} L${L} ${sg.size}`);}
const g={};for(const b of bad){const k=b.replace(/ \{.*/,'').replace(/[0-9]+/g,'#');g[k]=(g[k]||0)+1}console.log('finance problems checked',n,g,bad.length);console.log(bad.filter(b=>/variety|answer/.test(b)).slice(0,4).join('\n').slice(0,600));process.exit(bad.length?1:0);
