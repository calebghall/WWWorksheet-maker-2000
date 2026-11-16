"""Multi-topic section cards & live part drawer: add sections, mix sibling topics inside a section card, edit in drawer with live preview, keep standalone settings untouched, reorder, delete, reload.
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
    st_get = lambda: pg.evaluate("()=>JSON.parse(localStorage.getItem('wwwm2000.v1'))")
    parts = lambda: st_get()['parts']
    cards = lambda: pg.evaluate("()=>[...document.querySelectorAll('#partsList .sec-card')].map(c=>c.querySelector('.pl').textContent+':'+(c.querySelector('input[name=secLabel]').value||c.querySelector('input[name=secLabel]').placeholder))")

    # Switch to Multi-topic and add two muldiv sections
    pg.check('input[name="wkMode"][value="multi"]', force=True); pg.wait_for_timeout(150)
    check(len(cards()) == 3, 'multi starts with 3 section cards ' + str(cards()))
    pg.select_option('#addPartMod', 'muldiv'); pg.click('#partAdd'); pg.wait_for_timeout(100)
    pg.select_option('#addPartMod', 'muldiv'); pg.click('#partAdd'); pg.wait_for_timeout(100)
    check(len(parts()) == 5 and len(cards()) == 5, 'added two muldiv sections')

    # Edit Part D in drawer: multi-topic sheet stays live on the right!
    pg.click('#partsList .sec-card:nth-child(4) [data-part-act=edit]'); pg.wait_for_timeout(150)
    check(pg.is_visible('#partDrawer') and not pg.is_visible('#panelMain') and not pg.is_visible('#multiBox'), 'drawer opens cleanly')
    pg.fill('#editPartLabel', 'Big'); pg.select_option('#editPartN', '5')
    pg.check('input[name="md_mode"][value="digits"]', force=True); pg.uncheck('input[name="md_ops"][value="div"]', force=True)
    pg.check('input[name="md_da"][value="4"]', force=True); pg.check('input[name="md_db"][value="1"]', force=True)
    pg.wait_for_timeout(150)
    sheet_txt = pg.text_content('#sheets')
    check('Part A' in sheet_txt and 'Big' in sheet_txt and 'Part E' in sheet_txt, 'multi-topic preview stays live while editing in drawer')
    pg.click('#partDone'); pg.wait_for_timeout(150)
    check(pg.is_visible('#multiBox') and not pg.is_visible('#partDrawer'), 'drawer closes back to multi-topic list')

    # Edit Part E in drawer
    pg.click('#partsList .sec-card:nth-child(5) [data-part-act=edit]'); pg.wait_for_timeout(150)
    pg.fill('#editPartLabel', 'Small'); pg.select_option('#editPartN', '10')
    pg.check('input[name="md_mode"][value="digits"]', force=True); pg.uncheck('input[name="md_ops"][value="div"]', force=True)
    pg.check('input[name="md_da"][value="2"]', force=True); pg.check('input[name="md_db"][value="2"]', force=True)
    pg.click('#partDone'); pg.wait_for_timeout(150)

    p_ = parts()
    check(p_[3]['md']['da'] == 4 and p_[4]['md']['da'] == 2 and p_[3]['n'] == 5 and p_[4]['n'] == 10, 'two muldiv parts keep their own settings')
    check(st_get()['md']['mode'] == 'facts', 'standalone muldiv settings untouched by part drawer')
    check(pg.evaluate(CLIP) == 0, 'clipped')

    # Rename, resize, reorder section cards
    pg.fill('#partsList .sec-card:nth-child(4) input[name=secLabel]', 'Four by one')
    pg.select_option('#partsList .sec-card:nth-child(4) select[name=partRowN]', '15')
    p_ = parts(); check(p_[3]['label'] == 'Four by one' and p_[3]['n'] == 15, 'rename and resize saved')
    pg.click('#partsList .sec-card:nth-child(5) [data-sec-act=up]'); pg.wait_for_timeout(100)
    check(cards()[3] == 'Part D:Small' and cards()[4] == 'Part E:Four by one', 'move card up ' + str(cards()))
    t = pg.text_content('#sheets'); check('Four by one' in t and 'Part E' in t, 'sheet shows labels and letters')

    # Re-open drawer on moved Part D (Small), change da to 3
    pg.click('#partsList .sec-card:nth-child(4) [data-part-act=edit]'); pg.wait_for_timeout(100)
    check(pg.is_checked('input[name="md_da"][value="2"]'), 'drawer loads moved part settings')
    pg.check('input[name="md_da"][value="3"]', force=True); pg.click('#partDone'); pg.wait_for_timeout(100)
    p_ = parts(); check(p_[3]['md']['da'] == 3 and p_[3]['label'] == 'Small' and p_[3]['n'] == 10, 'live edit keeps label and size')

    # Hybrid sheet: mix another topic directly inside Part B (Addition and Subtraction + Time and Money) alongside Area Squares (Part A)
    pg.click('#partsList .sec-card:nth-child(2) [data-sec-open]'); pg.wait_for_timeout(100)
    pg.click('#partsList .sec-card:nth-child(2) [data-sec-pick="tm"]'); pg.wait_for_timeout(200)
    check(len(parts()) == 6 and len(cards()) == 5, 'mixing into Part B keeps 5 section cards with 6 parts ' + str(cards()))
    check(cards()[1] == 'Part B:Mixed Practice', 'mixed card defaults to Mixed Practice title')
    check(pg.evaluate("()=>document.querySelectorAll('#partsList .sec-card:nth-child(2) .trow').length") == 2, 'Part B shows both equal sibling topics')
    check(pg.evaluate(CLIP) == 0, 'clipped in hybrid mix+sections')
    # Move mixed Part B card up above Part A (Area Squares) and verify both topics move together
    pg.click('#partsList .sec-card:nth-child(2) [data-sec-act=up]'); pg.wait_for_timeout(150)
    check(cards()[0] == 'Part A:Mixed Practice' and cards()[1] == 'Part B:Area Squares', 'whole mixed card moves together ' + str(cards()))
    # Remove the first topic from the mixed card; the remaining topic keeps Part A
    pg.click('#partsList .sec-card:nth-child(1) .trow:nth-child(1) [data-part-act=del]'); pg.wait_for_timeout(150)
    check(len(parts()) == 5 and len(cards()) == 5 and parts()[0].get('mix') is None, 'removing first mixed topic promotes sibling cleanly')

    # Switch to Mixed together and back to In sections
    pg.check('input[name="multi_view"][value="mix"]', force=True); pg.wait_for_timeout(200)
    check(st_get()['module'] == 'mix', 'multi_view mix sets module mix')
    check('%' in pg.text_content('#partsList') and 'Sections only' in pg.text_content('#partsList'), 'mix view shows % shares and Sections only tag for area')
    check(pg.evaluate(CLIP) == 0, 'clipped in mix view')
    pg.check('input[name="multi_view"][value="combo"]', force=True); pg.wait_for_timeout(150)

    # Persistence across reload
    pg.reload(); pg.wait_for_timeout(400)
    check(len(parts()) == 5 and cards()[3] == 'Part D:Small', 'parts survive reload')
    check(pg.evaluate(CLIP) == 0, 'clipped after reload')

    # Standard preset with parts, then edit Part A in drawer
    pg.evaluate("document.getElementById('stdBox').open = true"); pg.fill('#stdQ', '5.NBT.B.7'); pg.click('[data-std="5.NBT.B.7"]'); pg.wait_for_timeout(150)
    check(len(parts()) == 2 and pg.is_checked('input[name="wkMode"][value="multi"]'), 'preset parts open Multi-topic')
    pg.click('#partsList .sec-card:nth-child(1) [data-part-act=edit]'); pg.wait_for_timeout(100)
    check(pg.is_visible('#partDrawer') and pg.is_visible('fieldset[data-mod="fdp"]'), 'preset part drawer opens fdp')
    pg.click('#partDone'); pg.wait_for_timeout(100)
    check(len(parts()) == 2 and pg.is_visible('#multiBox'), 'done returns to multi-topic')

    # Limit of 12 parts
    for _ in range(12):
        if pg.is_enabled('#partAdd'): pg.click('#partAdd')
    check(len(parts()) == 12 and not pg.is_enabled('#partAdd'), 'limit of 12 parts ' + str(len(parts())))
    check(not errs, 'page errors ' + str(errs))
    b.close()
print('parts ui issues', bad)
sys.exit(1 if bad else 0)
