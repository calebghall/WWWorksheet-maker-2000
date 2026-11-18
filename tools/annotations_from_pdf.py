#!/usr/bin/env python3
"""Extract example, NOTE and table-reference text per standard from the Tennessee standards PDF text.
usage: annotations_from_pdf.py <pdf.txt> <tn.annotations.json> <out.json> [--apply --rows tn.json]
Compares the extraction with entries whose status is 'ok' (parser check), and with --apply fills the
'retype' entries from the PDF text (status becomes 'ok', savedRaw cleared). Writes <out.json>."""
import json, re, sys
txt, annp, outp, *flags = sys.argv[1:]
CODE = re.compile(r'^(K|\d)\.[A-Z]{1,3}\.[A-Z]\.\d+\b')
STOP = re.compile(r'^\s*([A-Z]\. |Revised |Cluster Headings|[A-Z][A-Za-z ,]+\([A-Z]{2,3}\)\s*$|Mathematics \|)')
SUB = re.compile(r'^([a-z])\. ')
MARK = re.compile(r'(For example|Examples?:|NOTE:|\(See Table)')
L = open(txt, encoding='utf-8').read().split('\n')
idx = [i for i, l in enumerate(L) if CODE.match(l)]
def extract(i, j):
    seg, cur = {'': []}, ''
    for l in L[i:j]:
        if not l.strip() or STOP.match(l): break
        m = SUB.match(l)
        if m: cur = m.group(1); seg[cur] = []
        seg[cur].append(l.strip())
    out = []
    for k, ls in seg.items():
        s = re.sub(r'\s+', ' ', ' '.join(ls))
        s = re.sub(r'(\w)- (\w)', lambda m: m.group(0), s)
        m = MARK.search(s)
        if m: out.append((k, s[m.start():].strip()))
    return out
res = {}
for n, i in enumerate(idx):
    c = CODE.match(L[i]).group(0)
    e = extract(i, idx[n + 1] if n + 1 < len(idx) else len(L))
    if e: res[c] = ' '.join((f'({k}) ' if k else '') + t for k, t in e)
ann = json.load(open(annp, encoding='utf-8'))
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
okc = [c for c, v in ann.items() if v['status'] == 'ok']
bad = [c for c in okc if norm(res.get(c, '')) != norm(ann[c]['text'])]
print(f'parser check: {len(okc) - len(bad)} of {len(okc)} ok entries match the PDF; differ: {bad}')
extra = sorted(set(res) - set(ann)); print('PDF has examples for codes with no annotation:', extra)
if '--apply' in flags:
    for c, v in ann.items():
        if v['status'] == 'retype':
            if c not in res: print('NOT FOUND in PDF', c); continue
            v.update(text=res[c], status='ok', savedRaw=None, source='retyped from the Tennessee standards PDF')
    if '--rows' in flags:   # codes in the framework whose PDF text has examples but that have no entry yet
        rows = json.load(open(flags[flags.index('--rows') + 1], encoding='utf-8'))['rows']
        for c in extra:
            if c in rows:
                t = res[c]
                ann[c] = {'guid': rows[c]['guid'], 'status': 'ok', 'kinds': sorted({k for k, p in (('example', r'For example|Examples?:'), ('note', r'NOTE:'), ('table', r'See Table')) if re.search(p, t)}),
                          'text': t, 'savedRaw': None, 'source': 'taken from the Tennessee standards PDF'}
                print('added', c, t[:70])
json.dump(ann, open(outp, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
