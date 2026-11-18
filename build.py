"""Build from src/. Usage: python3 build.py [--target site] [--embed tn,ky|none]
Resolves <!--@include path--> lines (relative to src/) recursively, then writes either
WWWorksheet-maker-2000.html (single file, coins embedded; the default) or
dist/ for GitHub Pages (index.html, assets/coins/*.jpg, standards/<fw>.<hash>.js, .nojekyll) with --target site.
--embed lists the standards frameworks registered inside the page (default tn). The site build ships every other framework as a
content-hashed file the page loads on first pick; the single-file build lists only the embedded ones."""
import re, os, sys, shutil

root = os.path.dirname(os.path.abspath(__file__)) + '/'
site = '--target' in sys.argv and sys.argv[sys.argv.index('--target') + 1] == 'site'
HEAD = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'


def inc(m):
    return open(root + 'src/' + m.group(1), encoding='utf-8').read().rstrip('\n')


sys.path.insert(0, root + 'tools')
import build_fw
fws = build_fw.load()
embed = (sys.argv[sys.argv.index('--embed') + 1] if '--embed' in sys.argv else 'tn')
embed = [] if embed == 'none' else embed.split(',')
if not site and (not embed or set(embed) - set(fws)): sys.exit('--embed: the single-file build needs known frameworks, got ' + str(embed))
files = build_fw.write_dist(fws) if site else {}
files = {f: p for f, p in files.items() if f not in embed}
src = open(root + 'src/index.html', encoding='utf-8').read()
if site:
    src = src.replace('js/modules/coin-images.js', 'js/modules/coin-paths.js')   # coins as files, not embedded
src = src.replace('<!--@standards-->', build_fw.inline(fws, embed, files))
src = re.sub(r'<!--@include (\S+?)-->', inc, src)
page = HEAD + src + '\n</html>\n'

if site:
    out = root + 'dist/'
    shutil.rmtree(out, ignore_errors=True)
    os.makedirs(out)
    open(out + 'index.html', 'w', encoding='utf-8').write(page)
    shutil.copytree(root + 'assets/coins', out + 'assets/coins')
    os.makedirs(out + 'standards')
    for f in files.values(): shutil.copy(root + f.replace('standards/', 'standards/dist/'), out + f)
    open(out + '.nojekyll', 'w').close()
    print('built site', len(page))
else:
    open(root + 'WWWorksheet-maker-2000.html', 'w', encoding='utf-8').write(page)
    print('built', len(page))