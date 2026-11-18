/* Share links: encode/decode round trip (through normalize), the link stays short, corrupt links are rejected. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','WWWorksheet-maker-2000.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0].split('/*==DOM==*/')[0];
const ctx={Math,console,globalThis:null,btoa,atob,Response,CompressionStream,DecompressionStream,TextEncoder,TextDecoder,Uint8Array};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);
/* the share code and normalize sit below the DOM marker; they use no DOM */
const part=html.split('<script>')[1].split('</script>')[0],i=part.indexOf('/* Saved standards settings'),j=part.indexOf('\nlet state;');
vm.runInContext(part.slice(i,j)+';globalThis.__SH={encodeShare,decodeShare,normalize};',ctx);
const SP=Object.assign({},ctx.__SP,ctx.__SH),bad=[];
(async()=>{
  const sts=[SP.defaults()];
  let st=SP.defaults();st.seed='ABC123';st.module='muldiv';st.pages=3;sts.push(st);
  st=SP.defaults();st.seed='Q';SP.applyStandard(st,'4.NBT.B.5');sts.push(st);
  st=SP.defaults();st.seed='Z';st.std.f='tn';SP.applyGradeStandards(st,'3');sts.push(st);
  for(const [i,s] of sts.entries()){
    const code=await SP.encodeShare(s),back=await SP.decodeShare(code);
    if(JSON.stringify(back)!==JSON.stringify(SP.normalize(JSON.parse(JSON.stringify(s)))))bad.push('round trip '+i);
    if(!/^v1\.[\w-]+$/.test(code))bad.push('format '+i);
    console.log('share',i,code.length,'chars');
  }
  if((await SP.encodeShare(sts[0])).length>200)bad.push('default link is long');
  for(const c of ['','v2.abc','v1.','v1.!!!','v1.AAAA'])try{await SP.decodeShare(c);bad.push('accepted '+c);}catch(e){}
  console.log('share links; issues',bad);process.exit(bad.length?1:0);
})();
