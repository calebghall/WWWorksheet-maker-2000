#!/usr/bin/env python3
"""Framework data for the app: standards/<fw>.json + standards/<fw>.crosswalk.json -> one payload per framework
  { name, source, list: [[code, focus, cluster, grade]], xw: { code: crosswalk row } }.
build.py embeds the payloads of the ids in --embed (default: tn) as stdRegister('<fw>', {...}) calls and, for every other
framework, writes standards/dist/<fw>.<hash>.js (same call; the content hash in the name busts the cache) that the page
loads on first pick. Crosswalk row: { "to": [preset ids], "status": "supported" | "partial" | "gap", "note": (partial), "need": (gap) };
a gap row has no `to`. Checks: every standard has a row, statuses valid, partial has a note, gap has a need, every `to` id exists in
src/js/core/standards.js, every row is a standard of the framework.

Attribution: the standards data format comes from the Common Standards Project (https://commonstandardsproject.com, D2L Corporation),
CC BY 3.0 US (http://creativecommons.org/licenses/by/3.0/us/). The standards text itself is public record."""
import glob, hashlib, json, os, re, sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
GRADES = ('K', '1', '2', '3', '4', '5')


def default_id():
    return re.search(r"id: '(\w+)'", open(root + 'src/js/core/framework.js', encoding='utf-8').read()).group(1)


def clean(t):
    t = re.sub(r'^(\d+\s+)+(?=[A-Z])', '', t, count=1)
    t = re.sub(r' \( or or \)', '', t, count=1)
    if re.match(r'[a-z]', t): t = re.sub(r'^[^.]*\.\s+', '', t, count=1)
    return re.split(r'\s+\d\.[A-Z]+\.[A-Z]\.\d+\.[a-z]', t)[0]


def short(t):
    t = re.sub(r'\s+', ' ', t)
    t = re.sub('[^\x00-\x7F‘-”×÷–]', '', t).strip()
    return re.sub(r'\s+\S*$', '', t[:107]) + '...' if len(t) > 110 else t


def load():
    """{fw: payload}, checked. Exits with the list of problems."""
    ids = set(re.findall(r"\{ id: '([^']+)'", open(root + 'src/js/core/standards.js', encoding='utf-8').read()))
    out, errs = {}, []
    for path in sorted(glob.glob(root + 'standards/*.crosswalk.json')):
        fw = os.path.basename(path).split('.')[0]
        xw = json.load(open(path, encoding='utf-8'))
        data = json.load(open(root + f'standards/{fw}.json', encoding='utf-8'))
        rows, meta = data['rows'], data['meta']
        if xw.get('framework') != fw: errs.append(f'{fw}: framework field {xw.get("framework")}')
        if not xw.get('name'): errs.append(f'{fw}: crosswalk needs a name')
        for code, r in rows.items():
            if code not in xw['rows']: errs.append(f'{fw} {code}: no crosswalk row')
            if r['grade'] not in GRADES: errs.append(f'{fw} {code}: grade {r["grade"]}')
        for code, r in xw['rows'].items():
            if code not in rows: errs.append(f'{fw} {code}: not a standard of the framework')
            st = r.get('status'); to = r.get('to') or []
            if st not in ('supported', 'partial', 'gap'): errs.append(f'{fw} {code}: status {st}')
            if st == 'gap' and (to or not r.get('need')): errs.append(f'{fw} {code}: a gap row has a need and no to')
            if st != 'gap' and not to: errs.append(f'{fw} {code}: needs to')
            if st == 'partial' and not r.get('note'): errs.append(f'{fw} {code}: partial needs a note')
            for i in to:
                if i not in ids: errs.append(f'{fw} {code}: unknown preset id {i}')
        out[fw] = {
            'name': xw['name'],
            'source': f"{meta['title']} ({meta['valid']}), imported from the Common Standards Project",
            'list': [[c, short(clean(r['text'])), re.sub(r'^[A-Z]\. ', '', r['cluster']), r['grade']] for c, r in rows.items()],
            'xw': xw['rows']}
    if errs: sys.exit('\n'.join(errs))
    return out


def dump(d):
    return json.dumps(d, separators=(',', ':'), ensure_ascii=False)


def write_dist(fws):
    """Writes standards/dist/<fw>.<hash>.js for every framework; returns {fw: 'standards/<fw>.<hash>.js'}."""
    d = root + 'standards/dist/'
    os.makedirs(d, exist_ok=True)
    for f in glob.glob(d + '*.js'): os.remove(f)
    files = {}
    for fw, p in fws.items():
        body = f"stdRegister('{fw}',{dump(p)});\n"
        name = f"{fw}.{hashlib.sha1(body.encode('utf-8')).hexdigest()[:8]}.js"
        open(d + name, 'w', encoding='utf-8').write(body)
        files[fw] = 'standards/' + name
    return files


def inline(fws, embed, files):
    """The script text for the page: embedded frameworks registered in place, and STD_MANIFEST (default first).
    `files` maps the frameworks that are not embedded to their file (or is empty: the manifest then lists the embedded ones only)."""
    first = default_id()
    ids = sorted((f for f in fws if f in embed or f in files), key=lambda f: (f != first, f))
    manifest = [{'id': f, 'name': fws[f]['name'], 'file': None if f in embed else files[f]} for f in ids]
    return ''.join(f"stdRegister('{f}',{dump(fws[f])});\n" for f in ids if f in embed) + 'const STD_MANIFEST = ' + dump(manifest) + ';'


if __name__ == '__main__':
    fws = load()
    print({f: len(p['xw']) for f, p in fws.items()}, write_dist(fws))
