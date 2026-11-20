"""Standards panel in a browser: full standard text under the list, and multi-select into one Combined Worksheet.
Run: python3 tests/std_ui.py   (needs playwright + chromium)"""
import os, sys, json
from playwright.sync_api import sync_playwright
URL = os.environ.get('CLIP_URL') or 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'WWWorksheet-maker-2000.html')
bad = []
def check(c, m):
    if not c: bad.append(m); print('FAIL', m)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1400, 'height': 1500})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(400)
    pg.evaluate("document.getElementById('stdBox').open = true"); pg.wait_for_timeout(100)
    state = lambda: pg.evaluate("()=>JSON.parse(localStorage.getItem('wwwm2000.v1'))")
    # full text: shown for the standard under the pointer, and the row title carries it
    check(pg.is_hidden('#stdDetail'), 'no detail before a standard is picked or hovered')
    pg.check('#stdGrades input[value="3"]', force=True); pg.wait_for_timeout(120)
    first = pg.query_selector('#stdList .std[data-std]:not([disabled])'); code = first.get_attribute('data-std')
    first.hover(); pg.wait_for_timeout(100)
    full = pg.evaluate("()=>document.querySelector('#stdDetail').textContent"); short = first.query_selector('.st').inner_text()
    check(pg.is_visible('#stdDetail') and code in full, 'detail names the hovered standard ' + full[:60])
    check(len(full) >= len(short) and short.rstrip('.').rstrip() [:30] in full, 'detail holds the full text ' + full[:80])
    longest = pg.evaluate("()=>[...document.querySelectorAll('#stdList .std[data-std]')].map(e=>[e.dataset.std,e.title.length,e.querySelector('.st').textContent.length]).sort((a,b)=>b[1]-a[1])[0]")
    check(longest[1] > 110 and longest[1] > longest[2], 'a long standard shows more than its one-line focus ' + str(longest))
    pg.fill('#stdQ', ''); 
    check(pg.evaluate("()=>document.querySelector('#stdList .std').hasAttribute('data-std-all')"), 'All standards for this grade is the first row')
    # multi-select
    check(pg.is_hidden('#stdBuild'), 'build button hidden before select mode')
    pg.click('#stdMulti'); pg.wait_for_timeout(100)
    check(pg.get_attribute('#stdMulti', 'aria-pressed') == 'true' and pg.query_selector('#stdList [data-std-all]') is None, 'select mode on, all-entry hidden')
    check(pg.is_disabled('#stdBuild'), 'build disabled with nothing selected')
    codes = pg.evaluate("()=>[...document.querySelectorAll('#stdList .std[data-std]:not([disabled])')].slice(0,3).map(e=>e.dataset.std)")
    for c in codes: pg.click(f'#stdList [data-std="{c}"]'); pg.wait_for_timeout(60)
    check(state()['module'] != 'combo', 'ticking does not build a worksheet')
    check('3 selected' in pg.inner_text('#stdSelN'), 'count shown ' + pg.inner_text('#stdSelN'))
    # selection survives a grade change; a second grade adds to it
    pg.check('#stdGrades input[value="4"]', force=True); pg.wait_for_timeout(120)
    c4 = pg.evaluate("()=>document.querySelector('#stdList .std[data-std]:not([disabled])').dataset.std")
    pg.click(f'#stdList [data-std="{c4}"]'); pg.wait_for_timeout(60)
    check('4 selected' in pg.inner_text('#stdSelN'), 'selection kept across grades ' + pg.inner_text('#stdSelN'))
    pg.click(f'#stdList [data-std="{c4}"]'); pg.wait_for_timeout(60)
    check('3 selected' in pg.inner_text('#stdSelN'), 'click again unticks')
    # no select-all in select mode; ticking every standard of the grade gives the same sections as "All standards for this grade"
    check(pg.query_selector('#stdList [data-std-selall]') is None and pg.query_selector('#stdList [data-std-all]') is None, 'select mode has no whole-grade row')
    pg.check('#stdGrades input[value="2"]', force=True); pg.wait_for_timeout(120)
    grade_codes = pg.evaluate("()=>[...document.querySelectorAll('#stdList .std[data-std]:not([disabled])')].map(e=>e.dataset.std)")
    for c in grade_codes: pg.click(f'#stdList [data-std="{c}"]')
    pg.click('#stdBuild'); pg.wait_for_timeout(300)
    multi = [q['label'] for q in state()['parts']]
    gp = pg.evaluate("()=>gradeStandardParts('2','tn').map(q=>q.label)")
    check(all(l in multi for l in gp) and len(gp) > 10, 'ticked sections cover the grade sheet ' + str(len(gp)) + ' vs ' + str(len(multi)))
    check(pg.evaluate("()=>getComputedStyle(document.getElementById('stdBuild')).color") != pg.evaluate("()=>getComputedStyle(document.getElementById('stdBuild')).backgroundColor"), 'build button text differs from its background')
    for c in grade_codes: pg.click(f'#stdList [data-std="{c}"]')
    check('3 selected' in pg.inner_text('#stdSelN'), 'unticking a grade leaves the earlier picks ' + pg.inner_text('#stdSelN'))
    check('Tick standards, then' in pg.inner_text('#stdNote'), 'status line explains select mode')
    for c in codes: pg.click(f'#stdList [data-std="{c}"]') if pg.query_selector(f'#stdList [data-std="{c}"]') else None
    pg.click('#stdBuild'); pg.wait_for_timeout(300)
    st = state()
    labels = ' | '.join(p['label'] for p in st['parts'])
    check(st['module'] == 'combo' and len(st['parts']) >= 3 and all(c in labels for c in codes), 'built one section per selected standard ' + labels[:200])
    check(pg.evaluate("()=>document.querySelectorAll('.sec-h').length") >= 3, 'sections render')
    # a framework change clears the selection (select mode is still on after the build)
    check('selected' in pg.inner_text('#stdSelN'), 'selection kept after building ' + pg.inner_text('#stdSelN'))
    if pg.evaluate("()=>!document.getElementById('stdFwRow').hidden"):
        pg.select_option('#stdFwSel', 'ky'); pg.wait_for_timeout(600)
        check('Tick standards' in pg.inner_text('#stdSelN'), 'framework change clears selection ' + pg.inner_text('#stdSelN'))
    # too many sections: select every standard of a grade plus more until over the limit is impossible for one grade, so check the limit text path
    n = pg.evaluate("()=>standardParts([...Array(1)].map(()=>'x'),'tn').length")
    check(n == 0, 'unknown code gives no sections')
    # every standard of two grades together: more than the old limit of 32 sections, builds and renders
    if pg.is_visible('#stdClear'): pg.click('#stdClear'); pg.wait_for_timeout(80)
    for g in ('2', '3'):
        pg.check(f'#stdGrades input[value="{g}"]', force=True); pg.wait_for_timeout(120); [pg.click(f'#stdList [data-std="{c}"]') for c in pg.evaluate("()=>[...document.querySelectorAll('#stdList .std[data-std]:not([disabled])')].map(e=>e.dataset.std)")]; pg.wait_for_timeout(100)
    check(pg.is_enabled('#stdBuild') and 'too many' not in pg.inner_text('#stdSelN'), 'two whole grades can be built ' + pg.inner_text('#stdSelN'))
    import time; t0 = time.time(); pg.click('#stdBuild'); pg.wait_for_selector('.sheet'); pg.wait_for_timeout(300)
    two = state(); check(two['module'] == 'combo' and len(two['parts']) > 32 and pg.evaluate("document.querySelectorAll('.sheet').length") >= 8, 'two-grade worksheet ' + str(len(two['parts'])) + ' sections')
    check(time.time() - t0 < 15, 'two-grade build renders in time ' + str(round(time.time() - t0, 1)))
    if pg.is_visible('#stdClear'): pg.click('#stdClear'); pg.wait_for_timeout(80)
    for c in codes: pass
    # bug report: opens the issue form with the same address the Share link button builds, and the new Problem number field exists in the template
    pg.evaluate("window.__opened = []; window.open = (u) => { window.__opened.push(String(u)); return null; }")
    pg.click('#reportBug'); pg.wait_for_timeout(400)
    opened = [u for u in pg.evaluate("window.__opened") if 'issues/new' in u]
    link = pg.evaluate("async () => location.href.split('#')[0] + '#s=' + await encodeShare(state)")
    from urllib.parse import urlparse, parse_qs
    q = parse_qs(urlparse(opened[0]).query) if opened else {}
    check(opened and q.get('share_link', [''])[0] == link and '#s=' in link, 'bug report carries the share link ' + str(q.get('share_link'))[:80])
    check(os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.github', 'ISSUE_TEMPLATE', 'bug.yml')) and 'id: problem' in open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.github', 'ISSUE_TEMPLATE', 'bug.yml')).read(), 'template has the Problem number field')
    check(not errs, 'page errors ' + str(errs))
    b.close()
print('std ui issues', bad)
sys.exit(1 if bad else 0)
