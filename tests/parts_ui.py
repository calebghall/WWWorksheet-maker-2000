"""Parts panel: add the settings on a tab as a part, label, resize, reorder, edit, update, delete, reload, and return to simple sections.
Run: python3 tests/parts_ui.py   (needs playwright + chromium)"""
import os, sys
from playwright.sync_api import sync_playwright
URL = os.environ.get('CLIP_URL') or 'file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'WWWorksheet-maker-2000.html')
CLIP = """()=>[...document.querySelectorAll('.sheet')].map(s=>[...s.querySelectorAll('.ac,.prob')].filter(c=>c.scrollWidth>c.clientWidth+1||c.scrollHeight>c.clientHeight+1).length).reduce((a,b)=>a+b,0)"""
bad = []
def check(c, m):
    if not c: bad.append(m); print('FAIL', m)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1400, 'height': 1500})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(400)
    parts = lambda: pg.evaluate("()=>JSON.parse(localStorage.getItem('wwwm2000.v1')).parts")
    rows = lambda: pg.evaluate("()=>[...document.querySelectorAll('#partsList li')].map(li=>li.querySelector('.pl').textContent+':'+(li.querySelector('input').value||li.querySelector('input').placeholder))")
    # two Multiplication and Division parts with different digit sizes
    pg.check('input[name="module"][value="muldiv"]', force=True)
    pg.check('input[name="md_mode"][value="digits"]', force=True); pg.uncheck('input[name="md_ops"][value="div"]', force=True)
    pg.check('input[name="md_da"][value="4"]', force=True); pg.check('input[name="md_db"][value="1"]', force=True)
    pg.select_option('#partN', '5'); pg.fill('#partLabel', 'Big'); pg.click('#partAdd'); pg.wait_for_timeout(200)
    check(pg.evaluate("()=>document.querySelector('input[name=module]:checked').value") == 'combo', 'adding returns to Combined')
    r = rows(); check(len(r) == 4 and r[-1] == 'D:Big', 'first add keeps the sections and adds the part ' + str(r))
    pg.check('input[name="module"][value="muldiv"]', force=True)
    pg.check('input[name="md_da"][value="2"]', force=True); pg.check('input[name="md_db"][value="2"]', force=True)
    pg.select_option('#partN', '10'); pg.fill('#partLabel', 'Small'); pg.click('#partAdd'); pg.wait_for_timeout(200)
    p_ = parts(); check(len(p_) == 5 and p_[3]['md']['da'] == 4 and p_[4]['md']['da'] == 2 and p_[3]['n'] == 5 and p_[4]['n'] == 10, 'two muldiv parts keep their own settings')
    check(pg.evaluate(CLIP) == 0, 'clipped')
    # rename, resize, reorder
    pg.fill('#partsList li:nth-child(4) input[type=text]', 'Four by one'); pg.select_option('#partsList li:nth-child(4) select', '15')
    p_ = parts(); check(p_[3]['label'] == 'Four by one' and p_[3]['n'] == 15, 'rename and resize saved')
    pg.click('#partsList li:nth-child(5) [data-part-act=up]'); pg.wait_for_timeout(100)
    check(rows()[3].endswith('Small') and rows()[4].endswith('Four by one'), 'move up ' + str(rows()))
    t = pg.text_content('#sheets'); check('Four by one' in t and 'Part E' in t, 'sheet shows labels and letters')
    # edit: tab opens with the part's settings; update writes them back
    pg.click('#partsList li:nth-child(4) [data-part-act=edit]'); pg.wait_for_timeout(150)
    check(pg.evaluate("()=>document.querySelector('input[name=module]:checked').value") == 'muldiv' and pg.is_checked('input[name="md_da"][value="2"]'), 'edit loads the part settings')
    check(pg.is_visible('#partUpdate') and not pg.is_visible('#partAdd'), 'update controls shown')
    pg.check('input[name="md_da"][value="3"]', force=True); pg.click('#partUpdate'); pg.wait_for_timeout(150)
    p_ = parts(); check(p_[3]['md']['da'] == 3 and p_[3]['label'] == 'Small' and p_[3]['n'] == 10, 'update keeps label and size, changes settings')
    pg.check('input[name="module"][value="muldiv"]', force=True); pg.click('#partsAdd >> text=Add as a part'); pg.wait_for_timeout(100)
    pg.click('#partsList li:nth-child(6) [data-part-act=del]'); pg.wait_for_timeout(100)
    check(len(parts()) == 5, 'delete')
    # persistence and clearing
    pg.reload(); pg.wait_for_timeout(400)
    check(len(parts()) == 5 and rows()[3].endswith('Small'), 'parts survive reload')
    check(pg.evaluate(CLIP) == 0, 'clipped after reload')
    pg.click('#partsClear'); pg.wait_for_timeout(150)
    check(parts() is None and pg.is_visible('#comboRows'), 'back to simple sections')
    # a standard with parts, then edit one of its parts
    pg.evaluate("document.getElementById('stdBox').open = true"); pg.fill('#stdQ', '5.NBT.B.7'); pg.click('[data-std="5.NBT.B.7"]'); pg.wait_for_timeout(150)
    check(len(parts()) == 2, 'preset parts')
    pg.click('#partsList li:nth-child(1) [data-part-act=edit]'); pg.wait_for_timeout(100)
    check(pg.evaluate("()=>document.querySelector('input[name=module]:checked').value") == 'fdp', 'preset part edit opens fdp')
    pg.click('#partCancel'); pg.wait_for_timeout(100)
    check(len(parts()) == 2 and pg.evaluate("()=>document.querySelector('input[name=module]:checked').value") == 'combo', 'cancel')
    # the limit
    for i in range(12):
        pg.check('input[name="module"][value="ns"]', force=True)
        if pg.is_enabled('#partAdd'): pg.click('#partAdd')
    check(len(parts()) == 12, 'limit of 12 parts ' + str(len(parts())))
    check(not errs, 'page errors ' + str(errs))
    b.close()
print('parts ui issues', bad)
sys.exit(1 if bad else 0)
