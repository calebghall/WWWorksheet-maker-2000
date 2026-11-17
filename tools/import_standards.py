#!/usr/bin/env python3
"""Normalize CSP standard-set JSON files into framework rows.
usage: import_standards.py <fw-id> <out.json> <csp.json> [<csp.json> ...]
Row: {code: {grade, cluster, text, guid, asn, label}}; leaf standards only."""
import json, re, sys

GRADE = re.compile(r'grade-(k|\d+)\.json$', re.I)

def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)['data']

STD = re.compile(r'^(KY\.)?(K|\d)\.[A-Z]{1,3}\.([A-Z]\.)?\d+$')

def rows_from(path):
    d = load(path)
    g = GRADE.search(path).group(1).upper().lstrip('0') or '0'
    s = d['standards']
    kids = {}
    for v in s.values():
        kids.setdefault(v.get('parentId'), []).append(v)
    out = {}
    for v in sorted(s.values(), key=lambda x: x['position']):
        code = v.get('statementNotation')
        if not code: continue
        practice = not re.match(r'^(KY\.)?(K|\d)\.', code)
        if not practice and not STD.match(code):
            continue  # sub-bullet (.a, .b ...) folded into its parent below
        if practice: code = f'{g}:{code}'  # MP.*, LS.* repeat in every grade
        cl = {}
        for a in reversed(v.get('ancestorIds', [])):
            if s.get(a, {}).get('statementLabel') == 'Cluster':
                cl = s[a]; break
        comps = [c['description'].strip() for c in sorted(kids.get(v['id'], []), key=lambda x: x['position'])]
        out[code] = {'practice': practice, 'grade': g, 'cluster': cl.get('description', ''),
            'clusterCode': cl.get('statementNotation', ''), 'text': v['description'].strip(),
            'components': comps, 'guid': v['id'], 'asn': v.get('asnIdentifier', '')}
    meta = {k: d['document'].get(k) for k in ('title', 'valid', 'publicationStatus', 'sourceURL')}
    meta['license'] = d.get('license')
    return out, meta

if __name__ == '__main__':
    fw, outp, *paths = sys.argv[1:]
    rows, metas = {}, []
    for p in paths:
        r, m = rows_from(p)
        dup = set(r) & set(rows)
        if dup: sys.exit(f'duplicate codes {sorted(dup)} in {p}')
        rows.update(r); metas.append(m)
    json.dump({'framework': fw, 'meta': metas[0], 'rows': rows}, open(outp, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(fw, len(rows), 'rows')
