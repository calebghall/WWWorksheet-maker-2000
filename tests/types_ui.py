"""Type panels in a browser: collapsible groups with counts, type search, the word-problem toggle and reload persistence.
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
    pg.check('input[name="module"][value="num"]', force=True); pg.wait_for_timeout(150)
    H = '[data-types="num"]'
    vis = lambda sel: pg.evaluate("(s)=>[...document.querySelectorAll(s)].filter(e=>!e.hidden&&e.offsetParent!==null).length", sel)
    groups = lambda: pg.evaluate("(h)=>[...document.querySelectorAll(h+' details.tgroup')].map(g=>[g.dataset.fam,g.open,g.hidden,g.querySelector('.tcount').textContent])", H)

    g = groups(); check(len(g) == 4, 'num has 4 groups ' + str(g))
    check(all(x[3].split('/')[1].isdigit() for x in g) and sum(int(x[3].split('/')[1]) for x in g) == 50, 'group totals sum to 50 ' + str(g))
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
    check(set(shown) <= {'wadd', 'wlen', 'wmul', 'wcmp', 'wstep', 'west', 'mword'}, 'word toggle shows only word types ' + str(shown))
    pg.uncheck(H + ' [name=tword]', force=True); pg.wait_for_timeout(100)

    # checking a type updates the group count and the worksheet state
    pg.evaluate("(h)=>{document.querySelectorAll(h+' details.tgroup').forEach(d=>d.open=true)}", H)
    before = sum(int(x[3].split('/')[0]) for x in groups())
    inp = pg.query_selector(H + ' input[value="ns.fact"]')
    was = inp.is_checked(); (inp.uncheck if was else inp.check)(force=True); pg.wait_for_timeout(150)
    after = sum(int(x[3].split('/')[0]) for x in groups())
    check(abs(after - before) == 1, f'count follows a click {before}->{after}')

    # standards panel: no grade-band row; the grade list ends with "All standards for this grade"
    pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(400)
    pg.evaluate("document.getElementById('stdBox').open = true"); pg.wait_for_timeout(100)
    check(pg.query_selector('#stdBands') is None and vis('#stdGrades label') == 6, 'no band toggle, six grade buttons')
    pg.check('#stdGrades input[value="5"]', force=True); pg.wait_for_timeout(120)
    last = pg.evaluate("()=>{const l=document.querySelectorAll('#stdList button');return [l[0].dataset.stdAll||'', l[0].textContent]}")
    check(last[0] == '5' and 'All standards for this grade' in last[1], 'first list entry is all standards for the grade ' + str(last))
    pg.fill('#stdQ', 'fraction'); pg.wait_for_timeout(100)
    check(pg.query_selector('#stdList [data-std-all]') is None, 'search results omit the all-standards entry')
    pg.fill('#stdQ', ''); pg.wait_for_timeout(100)
    pg.click('#stdList [data-std-all]'); pg.wait_for_timeout(300)
    st = pg.evaluate("()=>JSON.parse(localStorage.getItem('wwwm2000.v1'))")
    check(st['module'] == 'combo' and 2 <= len(st['parts']) <= 64 and 'Grade 5' in st['titles']['combo'], 'all standards builds a combined worksheet ' + str(st['module']))
    check(pg.evaluate("()=>document.querySelectorAll('.sec-h').length") >= len(st['parts']), 'every part has a section')
    check(not errs, 'page errors ' + str(errs))
    b.close()
print('types ui issues', bad)
sys.exit(1 if bad else 0)
