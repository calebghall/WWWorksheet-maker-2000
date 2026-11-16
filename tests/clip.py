"""Layout sweep: no clipped cells for fdp/ns across levels, per-page counts and seeds; combined 7-module sheet; reload persistence.
Run: python3 tests/clip.py   (needs playwright + chromium)"""
import os, sys
from playwright.sync_api import sync_playwright
URL = os.environ.get('CLIP_URL') or 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'WWWorksheet-maker-2000.html')
CLIP = """()=>[...document.querySelectorAll('.sheet')].map(s=>[...s.querySelectorAll('.ac,.prob')].filter(c=>c.scrollWidth>c.clientWidth+1||c.scrollHeight>c.clientHeight+1).length).reduce((a,b)=>a+b,0)"""
WHICH = """()=>[...document.querySelectorAll('.sheet .ac,.sheet .prob')].filter(c=>c.scrollWidth>c.clientWidth+1||c.scrollHeight>c.clientHeight+1).map(c=>[c.scrollWidth,c.clientWidth,c.scrollHeight,c.clientHeight,c.innerText.replace(/\\n/g,' | ').slice(0,120)])"""
bad = 0
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1400, 'height': 1500})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script("window.addEventListener('error', e => { window.__errs = (window.__errs||[]).concat(e.message); });")
    pg.goto(URL); pg.wait_for_timeout(500)
    pg.check('input[name="wkMode"][value="single"]', force=True)
    for mod, pre in [('fdp', 'fd'), ('ns', 'ns'), ('tm', 'tm'), ('vis', 'vis')]:
        pg.check(f'input[name="module"][value="{mod}"]', force=True)
        pg.check('input[name="pages"][value="3"]', force=True)
        if mod in ('tm', 'ns', 'vis'):
            pg.evaluate("document.querySelectorAll('details.tgroup').forEach(d => { d.open = true; })")
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
    # Mixed together across all 5 mixable topics (including tm clocks)
    MIX5 = """([fmt, lvl, per, pages, seed])=>{
      const st = JSON.parse(localStorage.getItem('wwwm2000.v1')); st.module = 'mix'; st.seed = seed; st.arPerPage = +per; st.pages = +pages;
      st.parts = [
        { m: 'addsub', n: 10, as: { add: true, sub: true, d1: 2, d2: 2, addends: 2, regroup: 'any', format: fmt, cap: 0, second: 'digits' } },
        { m: 'muldiv', n: 10, md: { mul: true, div: true, mode: 'facts', tables: 10, focus: 0, rem: false, da: 2, db: 1, alt: false, da2: 2, db2: 2, na: 3, nb: 1, format: fmt } },
        { m: 'fdp', n: 10, fd: { types: ['simp', 'equiv', 'cmp', 'fadd', 'decadd', 'conv', 'pct'], level: +lvl } },
        { m: 'ns', n: 10, ns: { types: ['place', 'compare', 'order', 'round', 'skip', 'line', 'est'], level: +lvl } },
        { m: 'tm', n: 10, tm: { types: ['coins', 'madd', 'change', 'clock', 'elapsed', 'conv'], level: +lvl } }
      ];
      localStorage.setItem('wwwm2000.v1', JSON.stringify(st)); }"""
    for fmt in ['vertical', 'horizontal']:
        for lvl in '123':
            for per in ['30', '20', '12']:
                for pages in ['1', '3']:
                    for seed in ['AAAAAA', 'BBBBBB', 'CCCCCC', 'DDDDDD', 'EEEEEE', 'FFFFFF']:
                        pg.evaluate(MIX5, [fmt, lvl, per, pages, seed]); pg.reload(); pg.wait_for_timeout(80)
                        c = pg.evaluate(CLIP)
                        if c: bad += 1; print('CLIPPED mix', fmt, lvl, per, pages, seed, c, pg.evaluate(WHICH))
    print('mix |', pg.inner_text('#summary'))
    # Combined sheet with all 7 modules added via the Multi-topic builder
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(400)
    pg.check('input[name="wkMode"][value="multi"]', force=True)
    pg.check('input[name="multi_view"][value="combo"]', force=True)
    for m in ['fdp', 'ns', 'tm', 'vis']:
        pg.select_option('#addPartMod', m); pg.click('#partAdd'); pg.wait_for_timeout(60)
    pg.wait_for_timeout(300)
    c = pg.evaluate(CLIP); bad += bool(c); print('combo clipped', c, '|', pg.inner_text('#summary'), pg.evaluate(WHICH) if c else '')
    # standards that bundle skills: parts in Multi-topic In sections, seeds and both papers, reload
    pg.evaluate("document.getElementById('stdBox').open = true")
    for code in ['5.NBT.B.7', '4.NBT.B.5']:
        for paper in ['letter', 'a4']:
            pg.check(f'input[name="paper"][value="{paper}"]', force=True)
            pg.fill('#stdQ', code); pg.wait_for_timeout(60); pg.click(f'[data-std="{code}"]'); pg.wait_for_timeout(200)
            if not pg.is_checked('input[name="wkMode"][value="multi"]') or not pg.is_checked('input[name="multi_view"][value="combo"]'):
                bad += 1; print('multi view not active', code)
            for seed in ['AAAAAA', 'BBBBBB', 'CCCCCC', 'DDDDDD']:
                pg.fill('#seed', seed); pg.wait_for_timeout(80)
                c = pg.evaluate(CLIP)
                if c: bad += 1; print('CLIPPED parts', code, paper, seed, c, pg.evaluate(WHICH))
        print('parts', code, '|', pg.inner_text('#summary'), '|', pg.evaluate("()=>document.getElementById('partsList').children.length"), 'parts')
    pg.reload(); pg.wait_for_timeout(500)
    if not pg.is_checked('input[name="wkMode"][value="multi"]') or pg.evaluate("()=>document.querySelectorAll('.sec-h').length") < 2:
        bad += 1; print('parts lost after reload')
    # Mixed Practice from weighted parts with their own settings (state written to storage, then reloaded)
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
    print('mix parts |', pg.inner_text('#summary'), '| multi_view mix:', pg.is_checked('input[name="multi_view"][value="mix"]'))
    if not pg.is_checked('input[name="multi_view"][value="mix"]'): bad += 1; print('mix view not active')
    pg.check('input[name="wkMode"][value="single"]', force=True); pg.wait_for_timeout(150)
    if pg.is_visible('#multiBox'): bad += 1; print('multiBox still shown in single mode')
    pg.reload(); pg.wait_for_timeout(500); print('after reload |', pg.inner_text('#summary'))
    errs += pg.evaluate('window.__errs||[]')
    print('page errors', errs, '| clipped configs', bad)
    b.close()
sys.exit(1 if (bad or errs) else 0)
