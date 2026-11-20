"""Standards frameworks in a browser: a framework that is not embedded loads from its content-hashed file on first pick, a blocked file
shows a message, the framework picker appears with more than one framework, and a picked framework is saved in the settings.
Builds site variants into dist/ (the normal site build follows in run_tests.sh) and uses a temporary framework `zz`.
Run: python3 tests/frameworks_ui.py   (needs playwright + chromium)"""
import glob, json, os, subprocess, sys
from playwright.sync_api import sync_playwright
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + '/'
bad = []
def check(c, m):
    if not c: bad.append(m); print('FAIL', m)
def build(*a): subprocess.run([sys.executable, root + 'build.py', '--target', 'site', *a], check=True, stdout=subprocess.DEVNULL, cwd=root)
def url(): return 'file://' + os.path.abspath(root + 'dist/index.html')
def row(code, text): return {'grade': 'K', 'domain': 'Test', 'clusterCode': 'ZZ.K.A', 'cluster': 'A. Test cluster.', 'text': text, 'components': [], 'guid': code, 'asn': code}
ZZ = [root + 'standards/zz.json', root + 'standards/zz.crosswalk.json']
def state(pg): return pg.evaluate("JSON.parse(localStorage.getItem('wwwm2000.v1')||'{}').std")
def fresh(pg, u):
    pg.goto(u); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(500)
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    def page():
        pg = b.new_page(viewport={'width': 1400, 'height': 1200}); pg.on('pageerror', lambda e: errs.append(str(e))); return pg
    try:
        # 1. the default framework is not embedded: it loads from its file, one framework means no picker
        build('--embed', 'none')
        files = glob.glob(root + 'dist/standards/tn.*.js'); check(len(files) == 1, 'one hashed tn file ' + str(files))
        pg = page(); fresh(pg, url())
        pg.evaluate("document.querySelector('#stdBox').open=true")
        check(pg.evaluate("document.querySelectorAll('#stdList .std').length") > 3, 'lazy tn list renders')
        check(not pg.evaluate("document.querySelector('#stdFwRow').hidden"), 'picker shows tn and ky')
        pg.click('#stdList .std[data-std]:not([disabled])'); pg.wait_for_timeout(200)
        s = state(pg); check(s and s['f'] == 'tn' and s['c'], 'picked standard saved with its framework ' + str(s))
        # Kentucky loads on first pick and builds a worksheet titled with its own code
        pg.select_option('#stdFwSel', 'ky'); pg.wait_for_timeout(500)
        codes = pg.evaluate("[...document.querySelectorAll('#stdList .std[data-std]')].map(e=>e.dataset.std)")
        check(len(codes) > 10 and all(c.startswith('KY.K.') for c in codes), 'ky kindergarten list ' + str(codes[:3]))
        gaps = pg.evaluate("[...document.querySelectorAll('#stdList .std[disabled]')].map(e=>e.dataset.std)")
        check(gaps == [] and 'KY.K.CC.6' in codes and 'KY.K.CC.7' in codes, 'ky kindergarten has no disabled gap rows ' + str(gaps))
        pg.click('#stdList .std[data-std="KY.K.G.1"]'); pg.wait_for_timeout(300)
        s = state(pg); check(s == {'f': 'ky', 'g': 'K', 'c': 'KY.K.G.1'}, 'ky pick saved ' + str(s))
        check('KY.K.G.1' in pg.evaluate("document.querySelector('#sheets').innerText"), 'worksheet title prints the ky code')
        # the single-file build lists one framework: no picker
        pg2 = page(); pg2.goto('file://' + os.path.abspath(root + 'WWWorksheet-maker-2000.html')); pg2.wait_for_timeout(300)
        check(pg2.evaluate("document.querySelector('#stdFwRow').hidden") and pg2.evaluate("STD_MANIFEST.length") == 1, 'single-file build has no picker')
        # 2. the file is blocked: a message, no crash
        os.rename(files[0], files[0] + '.off')
        try:
            pg = page(); fresh(pg, url()); pg.evaluate("document.querySelector('#stdBox').open=true")
            check('Could not load' in pg.inner_text('#stdList'), 'blocked file shows a message: ' + pg.inner_text('#stdList')[:80])
        finally: os.rename(files[0] + '.off', files[0])
        # 3. two frameworks: tn embedded, zz loaded on first pick
        json.dump({'meta': {'title': 'Zed Standards', 'valid': '2030', 'framework': 'zz'}, 'rows': {'ZZ.K.1': row('ZZ.K.1', 'Count to 20.'), 'ZZ.K.2': row('ZZ.K.2', 'Prove a theorem.')}}, open(ZZ[0], 'w'))
        tn = json.load(open(root + 'standards/tn.crosswalk.json'))['rows']['K.CC.A.1']['to']
        json.dump({'framework': 'zz', 'name': 'Zed', 'rows': {'ZZ.K.1': {'to': tn, 'status': 'supported'}, 'ZZ.K.2': {'status': 'gap', 'need': 'a theorem prover'}}}, open(ZZ[1], 'w'))
        build()
        zf = glob.glob(root + 'dist/standards/zz.*.js'); check(len(zf) == 1 and not glob.glob(root + 'dist/standards/tn.*.js'), 'zz is a file, tn stays embedded ' + str(zf))
        pg = page(); fresh(pg, url()); pg.evaluate("document.querySelector('#stdBox').open=true")
        check(not pg.evaluate("document.querySelector('#stdFwRow').hidden"), 'picker shows with two frameworks')
        check(pg.evaluate("[...document.querySelectorAll('#stdFwSel option')].map(o=>o.value).join()") == 'tn,ky,zz', 'picker lists tn first')
        check(pg.evaluate("typeof STD_FW.zz") == 'undefined', 'zz not loaded before the pick')
        pg.select_option('#stdFwSel', 'zz'); pg.wait_for_timeout(500)
        check(pg.evaluate("typeof STD_FW.zz") == 'object', 'zz loaded after the pick')
        codes = pg.evaluate("[...document.querySelectorAll('#stdList .std[data-std]')].map(e=>e.dataset.std)")
        check(codes == ['ZZ.K.1', 'ZZ.K.2'], 'zz list ' + str(codes))
        check(pg.evaluate("document.querySelector('#stdList .std[data-std=\"ZZ.K.2\"]').disabled"), 'gap standard is disabled')
        pg.click('#stdList .std[data-std="ZZ.K.1"]'); pg.wait_for_timeout(300)
        s = state(pg); check(s == {'f': 'zz', 'g': 'K', 'c': 'ZZ.K.1'}, 'zz pick saved ' + str(s))
        check(pg.evaluate("document.querySelector('#sheets').innerText").count('ZZ.K.1') >= 1, 'worksheet title prints the zz code')
        pg.reload(); pg.wait_for_timeout(500)
        check(state(pg)['f'] == 'zz' and state(pg)['c'] == 'ZZ.K.1', 'reload keeps the pick ' + str(state(pg)))
        pg.evaluate("document.querySelector('#stdBox').open=true")
        pg.select_option('#stdFwSel', 'tn'); pg.wait_for_timeout(200)
        check(state(pg) == {'f': 'tn', 'g': 'K', 'c': ''}, 'switching framework clears the pick ' + str(state(pg)))
    finally:
        for f in ZZ:
            if os.path.exists(f): os.remove(f)
    check(not errs, 'page errors ' + str(errs[:3]))
    b.close()
print('frameworks ui; issues', bad, len(bad)); sys.exit(1 if bad else 0)
