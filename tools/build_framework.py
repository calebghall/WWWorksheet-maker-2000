#!/usr/bin/env python3
"""Build the two layers for a framework from CSP-normalized rows.
usage: build_framework.py <fw-id> <csp rows.json> <outdir> [--saved standards.json]
 <outdir>/<fw>.json              imported layer: rows from CSP, refreshable
 <outdir>/<fw>.annotations.json  hand-kept layer: examples, notes, table refs (never overwritten)
With --saved, examples and notes found in the saved rows seed the annotation layer.
Rows whose saved text is damaged get status 'retype' (saved text kept as an aid)."""
# Attribution: the input JSON format and the normalized records come from the Common Standards Project
# (https://commonstandardsproject.com, D2L Corporation), licensed CC BY 3.0 US
# (http://creativecommons.org/licenses/by/3.0/us/). The Kentucky Academic Standards text itself is public record;
# the attribution applies to the CSP data format only.
import json, os, re, sys, datetime
fw, cspp, outdir, *rest = sys.argv[1:]
saved = json.load(open(rest[rest.index('--saved') + 1], encoding='utf-8')) if '--saved' in rest else {}
src = json.load(open(cspp, encoding='utf-8'))
rows = {c: v for c, v in src['rows'].items() if not v['practice']}
ORDER = ['K', '1', '2', '3', '4', '5']
DMG = re.compile(r'[\U0001D400-\U0001D7FF]| {3,}|\d\.[A-Z]{1,3}\.[A-Z]\.\d+\.?[a-z]\b')
# lost operands: operator next to operator or punctuation, an operator right after "example,", runs of stray digits
LOST = re.compile(r'[=+×÷<>]\s*(?:[=+×÷<>.,)]|$)|(?:example,|\(|,)\s*(?:[=+×÷<>]|\.(?!\.))|\b\d(?: \d){1,}\b')
MARK = re.compile(r'(?:^|\s)(For example|Examples?:|NOTE:|\(See Table)')
def sortkey(c):
    v = rows[c]; return (ORDER.index(v['grade']), list(rows).index(c))
codes = sorted(rows, key=sortkey)
imp, ann = {}, {}
for c in codes:
    v = rows[c]
    imp[c] = {'grade': v['grade'], 'domain': v['domain'], 'clusterCode': v['clusterCode'], 'cluster': v['cluster'],
              'text': v['text'], 'components': v['components'], 'guid': v['guid'], 'asn': v['asn']}
    s = saved.get(c)
    if not s: continue
    t = s['text']; m = MARK.search(t)
    if not m: continue
    tail = t[m.start(1):].strip()
    bad = bool(DMG.search(t) or LOST.search(tail))
    ann[c] = {'guid': v['guid'], 'status': 'retype' if bad else 'ok',
              'kinds': sorted({k for k, p in (('example', r'For example|Examples?:'), ('note', r'NOTE:'), ('table', r'See Table')) if re.search(p, tail)}),
              'text': None if bad else re.sub(r'\s+', ' ', tail),
              'savedRaw': re.sub(r'\s+', ' ', tail) if bad else None}
# validation
errs = []
for c, v in imp.items():
    for f in ('grade', 'text', 'cluster', 'guid'):
        if not v.get(f): errs.append(f'{c}: empty {f}')
    if v['grade'] not in ORDER: errs.append(f'{c}: grade {v["grade"]}')
    if not re.match(r'^(?:[A-Z]{2}\.)?' + re.escape(v['grade']) + r'\.', c): errs.append(f'{c}: code/grade mismatch')
if len(set(v['guid'] for v in imp.values())) != len(imp): errs.append('duplicate guid')
if errs: sys.exit('\n'.join(errs))
meta = dict(src['meta'], framework=fw, imported=str(datetime.date.today()),
            csp_note='license field empty in CSP for this set; confirm reuse terms with the publisher' if not src['meta'].get('license') else None)
os.makedirs(outdir, exist_ok=True)
json.dump({'meta': meta, 'rows': imp}, open(f'{outdir}/{fw}.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
json.dump(ann, open(f'{outdir}/{fw}.annotations.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print(fw, len(imp), 'rows;', len(ann), 'annotations;', sum(a['status'] == 'retype' for a in ann.values()), 'to retype')
