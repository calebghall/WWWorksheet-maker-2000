"""Per-type clip sweep: every problem type alone in a combined sheet (12 per page). Default: levels 1 and 3, one seed. FULL=1 for all levels and four seeds.
Run: python3 tests/clip_types.py [type-regex]"""
import os,re,json,sys
from playwright.sync_api import sync_playwright
URL=os.environ.get('CLIP_URL') or 'file://'+os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','WWWorksheet-maker-2000.html')
tm=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','src/js/core/typemeta.js')).read()
types=re.findall(r'"([a-z0-9]+\.[a-z0-9]+)": \["(\w+)"',tm)
W="""()=>[...document.querySelectorAll('.sheet .ac,.sheet .prob')].filter(c=>c.scrollWidth>c.clientWidth+1||c.scrollHeight>c.clientHeight+1).map(c=>[c.scrollWidth,c.clientWidth,c.scrollHeight,c.clientHeight,c.innerText.slice(0,50).replace(/\\n/g,' | ')])"""
S="""([t,m,l,seed,per])=>{const st=JSON.parse(localStorage.getItem('wwwm2000.v1')||'{}');st.module='combo';st.wkMode='multi';st.seed=seed;st.arPerPage=per;st.pages=1;
 st.parts=[{m,n:12,label:t,[m]:{types:[t],level:l}}];localStorage.setItem('wwwm2000.v1',JSON.stringify(st));}"""
bad={}
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':1500}); pg.goto(URL); pg.wait_for_timeout(400)
    for t,m in types:
        if len(sys.argv)>1 and not re.search(sys.argv[1],t): continue
        for l in ((1,2,3) if os.environ.get('FULL') else (1,3)):
            for seed in (('AAAAAA','BBBBBB','CCCCCC','DDDDDD') if os.environ.get('FULL') else ('CCCCCC',)):
                for per in (12,):
                    pg.evaluate(S,[t,m,l,seed,per]); pg.reload(); pg.wait_for_timeout(60)
                    w=pg.evaluate(W)
                    if w:
                        bad.setdefault(t,[]).append((l,seed,w[0]))
                        if len(bad[t])==1 and os.environ.get('DIAG'): print(t,pg.evaluate("""()=>{const c=[...document.querySelectorAll('.sheet .ac,.sheet .prob')].find(c=>c.scrollWidth>c.clientWidth+1||c.scrollHeight>c.clientHeight+1);const r=c.getBoundingClientRect();return [...c.querySelectorAll('*')].filter(e=>{const q=e.getBoundingClientRect();return q.right>r.right+1||q.bottom>r.bottom+1}).slice(0,4).map(e=>[e.tagName,e.className&&e.className.baseVal!==undefined?'':e.className,Math.round(e.getBoundingClientRect().right-r.right),Math.round(e.getBoundingClientRect().bottom-r.bottom),(e.textContent||'').slice(0,25)])}""")) 
    for t,v in bad.items():
        for e in v: print(t,e)
    print('types',len(types),'clipped types',len(bad)); b.close()
sys.exit(1 if bad else 0)
