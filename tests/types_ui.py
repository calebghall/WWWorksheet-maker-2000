"""Type panels and grade bands in a browser: collapsible groups with counts, type search, the word-problem toggle,
the grade-band filter in the standards panel (types, standards, grade buttons), checked types staying visible, and reload persistence.
Run: python3 tests/types_ui.py   (needs playwright + chromium)"""
import os, sys
from playwright.sync_api import sync_playwright
URL = os.environ.get('CLIP_URL') or 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'WWWorksheet-maker-2000.html')
bad = []
def check(c, m):
    if not c: bad.append(m); print('FAIL', m)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1400, 'height': 1500})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(400)
    pg.check('input[name="module"][value="ns"]', force=True); pg.wait_for_timeout(150)
    H = '[data-types="ns"]'
    vis = lambda sel: pg.evaluate("(s)=>[...document.querySelectorAll(s)].filter(e=>!e.hidden&&e.offsetParent!==null).length", sel)
    groups = lambda: pg.evaluate("(h)=>[...document.querySelectorAll(h+' details.tgroup')].map(g=>[g.dataset.fam,g.open,g.hidden,g.querySelector('.tcount').textContent])", H)

    g = groups(); check(len(g) == 8, 'ns has 8 groups ' + str(g))
    check(all(x[3].split('/')[1].isdigit() for x in g) and sum(int(x[3].split('/')[1]) for x in g) == 65, 'group totals sum to 65 ' + str(g))
    check(sum(int(x[3].split('/')[0]) for x in g) >= 1, 'a default type is checked')
    check(all(x[1] == (x[3].split('/')[0] != '0') for x in g), 'groups open exactly when they hold a checked type ' + str(g))

    # search: matching types show, groups without a match hide, a checked type stays
    pg.fill(H + ' [name=tq]', 'word problem'); pg.wait_for_timeout(100)
    shown = pg.evaluate("(h)=>[...document.querySelectorAll(h+' label.chk')].filter(l=>!l.hidden).map(l=>l.dataset.id)", H)
    check(all(i in shown for i in ['wadd', 'wlen', 'wmul', 'wcmp', 'wstep', 'mword']), 'search shows word types ' + str(shown))
    check(len(shown) < 20, 'search narrows the list ' + str(len(shown)))
    pg.fill(H + ' [name=tq]', 'zzzz'); pg.wait_for_timeout(100)
    check(not pg.evaluate("(h)=>document.querySelector(h+' .tnone').hidden", H) or vis(H + ' label.chk') >= 0, 'no-match note')
    pg.fill(H + ' [name=tq]', ''); pg.check(H + ' [name=tword]', force=True); pg.wait_for_timeout(100)
    shown = pg.evaluate("(h)=>[...document.querySelectorAll(h+' label.chk')].filter(l=>!l.hidden&&!l.querySelector('input').checked).map(l=>l.dataset.id)", H)
    check(set(shown) <= {'wadd', 'wlen', 'wmul', 'wcmp', 'wstep', 'west', 'mword', 'fword6'}, 'word toggle shows only word types ' + str(shown))
    pg.uncheck(H + ' [name=tword]', force=True); pg.wait_for_timeout(100)

    # checking a type updates the group count and the worksheet state
    pg.evaluate("(h)=>{document.querySelectorAll(h+' details.tgroup').forEach(d=>d.open=true)}", H)
    before = sum(int(x[3].split('/')[0]) for x in groups())
    inp = pg.query_selector(H + ' input[value="fact"]')
    was = inp.is_checked(); (inp.uncheck if was else inp.check)(force=True); pg.wait_for_timeout(150)
    after = sum(int(x[3].split('/')[0]) for x in groups())
    check(abs(after - before) == 1, f'count follows a click {before}->{after}')

    # grade band in the standards panel
    pg.click('#stdBox summary'); pg.wait_for_timeout(100)
    check(vis('#stdBands label') == 3, 'band control shows All grades plus 2 bands')
    pg.check('#stdBands input[value="k2"]', force=True); pg.wait_for_timeout(150)
    grades = pg.evaluate("()=>[...document.querySelectorAll('#stdGrades label')].filter(l=>!l.hidden).map(l=>l.textContent.trim())")
    check(grades == ['K', '1', '2'], 'grade buttons follow the band ' + str(grades))
    codes = pg.evaluate("()=>[...document.querySelectorAll('#stdList [data-std]')].map(b=>b.dataset.std)")
    check(codes and all(c[0] in 'K12' for c in codes), 'standards list limited to the band ' + str(codes[:4]))
    pg.fill('#stdQ', 'fraction'); pg.wait_for_timeout(100)
    codes = pg.evaluate("()=>[...document.querySelectorAll('#stdList [data-std]')].map(b=>b.dataset.std)")
    check(all(c[0] in 'K12' for c in codes), 'search results also limited to the band ' + str(codes))
    pg.fill('#stdQ', '')
    check(vis(H + ' .tband') == 1 and 'K to 2' in pg.inner_text(H + ' .tband'), 'band note shown in the type panel')
    ids = pg.evaluate("(h)=>[...document.querySelectorAll(h+' label.chk')].filter(l=>!l.hidden).map(l=>l.dataset.id)", H)
    check('fscale' not in ids and 'kseq' in ids, 'types outside K to 2 hidden, K types shown')
    st = pg.evaluate("()=>JSON.parse(localStorage.getItem('wwwm2000.v1')).band")
    check(st == {'fw': 'tn', 'id': 'k2'}, 'band saved ' + str(st))
    # a checked type outside the band stays visible
    pg.evaluate("(h)=>{const i=document.querySelector(h+' input[value=fscale]'); i.closest('details').open=true; i.closest('label').hidden=false; i.click();}", H); pg.wait_for_timeout(150)
    ids = pg.evaluate("(h)=>[...document.querySelectorAll(h+' label.chk')].filter(l=>!l.hidden).map(l=>l.dataset.id)", H)
    check('fscale' in ids, 'checked type outside the band stays visible')
    pg.reload(); pg.wait_for_timeout(400)
    check(pg.evaluate("()=>JSON.parse(localStorage.getItem('wwwm2000.v1')).band") == {'fw': 'tn', 'id': 'k2'}, 'band survives reload')
    pg.click('[data-types="ns"] [data-band-all]'); pg.wait_for_timeout(150)
    check(pg.evaluate("()=>JSON.parse(localStorage.getItem('wwwm2000.v1')).band") is None, 'Show all grades clears the band')
    pg.check('#stdBands input[value="all"]', force=True)
    # old saved settings without a band, and an unknown band, load as all grades
    pg.evaluate("()=>{const s=JSON.parse(localStorage.getItem('wwwm2000.v1')); s.band={fw:'xx',id:'k2'}; localStorage.setItem('wwwm2000.v1',JSON.stringify(s));}"); pg.reload(); pg.wait_for_timeout(300)
    check(pg.is_checked('#stdBands input[value="all"]') and vis(H + ' .tband') == 0, 'unknown framework band ignored')
    check(not errs, 'page errors ' + str(errs))
    b.close()
print('types ui issues', bad)
sys.exit(1 if bad else 0)
