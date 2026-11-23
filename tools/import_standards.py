#!/usr/bin/env python3
"""Normalize CSP standard-set JSON files into framework rows.
usage: import_standards.py <fw-id> <out.json> <csp.json> [<csp.json> ...]
Row: {code: {grade, cluster, text, guid, asn, label}}; leaf standards only."""
# Attribution: the input JSON format and the normalized records come from the Common Standards Project
# (https://commonstandardsproject.com, D2L Corporation), licensed CC BY 3.0 US
# (http://creativecommons.org/licenses/by/3.0/us/). The Kentucky Academic Standards text itself is public record;
# the attribution applies to the CSP data format only.
import json, re, sys

GRADE = re.compile(r'grade-(k|\d+)\.json$', re.I)

def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)['data']

STD = re.compile(r'^(KY\.)?(K|\d)\.[A-Z]{1,3}\.([A-Z]\.)?\d+$')
# TEKS-style notation (Texas): <grade>.<knowledge-and-skills number>[.<expectation letter>], e.g. 3.2 and 3.2.A.
# Number 1 of every grade is the process standards (kept as practice rows); the code is written the TEKS way, 3.2A.
TEKS = re.compile(r'^(K|\d)\.(\d+)(?:\.([A-Z]))?$')

def rows_from(path):
    d = load(path)
    g = GRADE.search(path).group(1).upper().lstrip('0') or '0'
    s = d['standards']
    kids = {}
    for v in s.values():
        kids.setdefault(v.get('parentId'), []).append(v)
    out = {}
    dom, ks = '', None  # TEKS: current strand heading (depth 0) and knowledge-and-skills statement (the cluster)
    for v in sorted(s.values(), key=lambda x: x['position']):
        code = v.get('statementNotation')
        if v.get('depth') == 0 and not v.get('parentId'): dom = v['description'].strip().rstrip('.')
        m = TEKS.match(code or '')
        if m and v.get('depth') != 0:
            n, letter = m.group(2), m.group(3)
            if not letter:
                ks = {'code': f'{m.group(1)}.{n}', 'text': v['description'].strip()}
                continue
            practice = n == '1'
            c = f'{m.group(1)}.{n}{letter}'
            if practice: c = f'{g}:{c}'
            out[c] = {'practice': practice, 'grade': g, 'cluster': ks['text'] if ks else '', 'clusterCode': ks['code'] if ks else '',
                'domain': dom, 'text': v['description'].strip(), 'components': [], 'guid': v['id'], 'asn': v.get('asnIdentifier', '')}
            continue
        if not code: continue
        practice = not re.match(r'^(KY\.)?(K|\d)\.', code)
        if not practice and not STD.match(code):
            continue  # sub-bullet (.a, .b ...) folded into its parent below
        if practice: code = f'{g}:{code}'  # MP.*, LS.* repeat in every grade
        cl = {}
        for a in reversed(v.get('ancestorIds', [])):
            if s.get(a, {}).get('statementLabel') == 'Cluster':
                cl = s[a]; break
        dom = s.get(cl.get('parentId'), {}).get('description', '')
        comps = [c['description'].strip() for c in sorted(kids.get(v['id'], []), key=lambda x: x['position'])]
        out[code] = {'practice': practice, 'grade': g, 'cluster': cl.get('description', ''),
            'clusterCode': cl.get('statementNotation', ''), 'domain': dom, 'text': v['description'].strip(),
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
