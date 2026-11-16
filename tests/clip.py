"""Layout sweep: no clipped cells for fdp/ns across levels, per-page counts and seeds; combined 5-module sheet; reload persistence.
Run: python3 tests/clip.py   (needs playwright + chromium)"""
import os, sys
from playwright.sync_api import sync_playwright
URL = os.environ.get('CLIP_URL') or 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'WWWorksheet-maker-2000.html')
CLIP = """()=>[...document.querySelectorAll('.sheet')].map(s=>[...s.querySelectorAll('.ac,.prob')].filter(c=>c.scrollWidth>c.clientWidth+1||c.scrollHeight>c.clientHeight+1).length).reduce((a,b)=>a+b,0)"""
WHICH = """()=>[...document.querySelectorAll('.sheet .ac,.sheet .prob')].filter(c=>c.scrollWidth>c.clientWidth+1||c.scrollHeight>c.clientHeight+1).map(c=>[c.scrollWidth,c.clientWidth,c.scrollHeight,c.clientHeight,c.innerText.replace(/\\n/g,' | ').slice(0,120)])"""
bad = 0
SETR = "([n,v])=>{const i=document.querySelector(`input[name=\"${n}\"][value=\"${v}\"]`);i.checked=true;i.dispatchEvent(new Event('input',{bubbles:true}));}"
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1400, 'height': 1500})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("window.addEventListener('error', e => { window.__errs = (window.__errs||[]).concat(e.message); });")
    pg.goto(URL); pg.wait_for_timeout(500)
    for mod, pre in [('fdp', 'fd'), ('ns', 'ns'), ('tm', 'tm'), ('vis', 'vis')]:
        pg.check(f'input[name="module"][value="{mod}"]', force=True)
        pg.check('input[name="pages"][value="3"]', force=True)
        if mod in ('tm', 'ns', 'vis'):
            for i in pg.query_selector_all(f'input[name="{pre}_type"]'):
                if not i.is_checked(): i.check(force=True)
        for lvl in '123':
            pg.check(f'input[name="{pre}_level"][value="{lvl}"]', force=True)
            for per in ['30', '20', '12']:
                pg.check(f'input[name="arPerPage"][value="{per}"]', force=True)
                for seed in ['AAAAAA', 'BBBBBB', 'CCCCCC']:
                    pg.fill('#seed', seed); pg.wait_for_timeout(60)
                    c = pg.evaluate(CLIP)
                    if c: bad += 1; print('CLIPPED', mod, lvl, per, seed, c)
    pg.check('input[name="module"][value="mix"]', force=True)
    for i in pg.query_selector_all('input[name="mix_mod"]'):
        if not i.is_checked(): i.check(force=True)
    pg.check('input[name="module"][value="tm"]', force=True)
    pg.check('input[name="tm_type"][value="clock"]', force=True)
    pg.check('input[name="module"][value="mix"]', force=True)
    for fmt in ['vertical', 'horizontal']:
        for name in ['as_format', 'md_format']:
            pg.evaluate(SETR, [name, fmt])
        for lvl in '123':
            for name in ['fd_level', 'ns_level', 'tm_level']:
                pg.evaluate(SETR, [name, lvl])
            for per in ['30', '20', '12']:
                pg.check(f'input[name="arPerPage"][value="{per}"]', force=True)
                for pages in ['1', '3']:
                    pg.check(f'input[name="pages"][value="{pages}"]', force=True)
                    for seed in ['AAAAAA', 'BBBBBB', 'CCCCCC', 'DDDDDD', 'EEEEEE', 'FFFFFF']:
                        pg.fill('#seed', seed); pg.wait_for_timeout(40)
                        c = pg.evaluate(CLIP)
                        if c: bad += 1; print('CLIPPED mix', fmt, lvl, per, pages, seed, c, pg.evaluate(WHICH))
    print('mix |', pg.inner_text('#summary'))
    pg.check('input[name="module"][value="combo"]', force=True)
    for i in pg.query_selector_all('input[name="combo_on"]'):
        if not i.is_checked(): i.check(force=True)
    pg.wait_for_timeout(300)
    c = pg.evaluate(CLIP); bad += bool(c); print('combo clipped', c, '|', pg.inner_text('#summary'), pg.evaluate(WHICH) if c else '')
    # standards that bundle skills: parts in a Combined sheet, seeds and both papers, parts list, reload, back to simple sections
    pg.evaluate("document.getElementById('stdBox').open = true")
    for code in ['5.NBT.B.7', '4.NBT.B.5']:
        for paper in ['letter', 'a4']:
            pg.check(f'input[name="paper"][value="{paper}"]', force=True)
            pg.fill('#stdQ', code); pg.wait_for_timeout(60); pg.click(f'[data-std="{code}"]'); pg.wait_for_timeout(200)
            if pg.evaluate("()=>document.getElementById('partsBox').hidden"): bad += 1; print('parts list hidden', code)
            for seed in ['AAAAAA', 'BBBBBB', 'CCCCCC', 'DDDDDD']:
                pg.fill('#seed', seed); pg.wait_for_timeout(80)
                c = pg.evaluate(CLIP)
                if c: bad += 1; print('CLIPPED parts', code, paper, seed, c, pg.evaluate(WHICH))
        print('parts', code, '|', pg.inner_text('#summary'), '|', pg.evaluate("()=>document.getElementById('partsList').children.length"), 'parts')
    pg.reload(); pg.wait_for_timeout(500)
    if pg.evaluate("()=>document.getElementById('partsBox').hidden") or pg.evaluate("()=>document.querySelectorAll('.sec-h').length") < 2: bad += 1; print('parts lost after reload')
    pg.evaluate("document.getElementById('stdBox').open = true"); pg.click('#partsClear'); pg.wait_for_timeout(200)
    if not pg.evaluate("()=>document.getElementById('partsBox').hidden"): bad += 1; print('parts list still shown after clear')
    # Mixed Practice from parts: weighted parts with their own settings (state written to storage, then reloaded)
    MIXPARTS = """([fmt, lvl, per, pages, seed])=>{
      const st = JSON.parse(localStorage.getItem('wwwm2000.v1')); st.module = 'mix'; st.seed = seed; st.arPerPage = +per; st.pages = +pages;
      const md = (da, db) => ({ mul: true, div: false, mode: 'digits', tables: 10, focus: 0, rem: false, da, db, alt: false, da2: 2, db2: 2, na: 3, nb: 1, format: fmt });
      st.parts = [{ m: 'muldiv', n: 10, label: 'a', md: md(4, 1) }, { m: 'muldiv', n: 5, label: 'b', md: md(2, 2) },
        { m: 'fdp', n: 5, fd: { types: ['decadd', 'decmul', 'conv'], level: +lvl } }, { m: 'ns', n: 5, ns: { types: ['decrsn', 'place', 'round'], level: +lvl } },
        { m: 'addsub', n: 5, as: { add: true, sub: true, d1: 3, d2: 3, addends: 2, regroup: 'any', format: fmt, cap: 0, second: 'digits' } }];
      localStorage.setItem('wwwm2000.v1', JSON.stringify(st)); }"""
    for fmt in ['vertical', 'horizontal']:
        for lvl in '123':
            for per in ['30', '20']:
                for pages in ['1', '2']:
                    for seed in ['AAAAAA', 'BBBBBB', 'CCCCCC']:
                        pg.evaluate(MIXPARTS, [fmt, lvl, per, pages, seed]); pg.reload(); pg.wait_for_timeout(120)
                        c = pg.evaluate(CLIP)
                        if c: bad += 1; print('CLIPPED mix parts', fmt, lvl, per, pages, seed, c, pg.evaluate(WHICH))
    print('mix parts |', pg.inner_text('#summary'), '| list hidden:', pg.evaluate("()=>document.getElementById('mixPartsBox').hidden"))
    if pg.evaluate("()=>document.getElementById('mixPartsBox').hidden"): bad += 1; print('mix parts list hidden')
    pg.evaluate("document.getElementById('mixPartsClear').click()"); pg.wait_for_timeout(200)
    if not pg.evaluate("()=>document.getElementById('mixPartsBox').hidden"): bad += 1; print('mix parts still shown after clear')
    pg.reload(); pg.wait_for_timeout(500); print('after reload |', pg.inner_text('#summary'))
    errs += pg.evaluate('window.__errs||[]')
    print('page errors', errs, '| clipped configs', bad)
    b.close()
sys.exit(1 if (bad or errs) else 0)
