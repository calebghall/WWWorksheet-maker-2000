"""Build from src/. Usage: python3 build.py [--target site]
Resolves <!--@include path--> lines (relative to src/) recursively, then writes either
WWWorksheet-maker-2000.html (single file, coins embedded; the default) or
dist/ for GitHub Pages (index.html, assets/coins/*.jpg, .nojekyll) with --target site."""
import re, os, sys, shutil

root = os.path.dirname(os.path.abspath(__file__)) + '/'
site = '--target' in sys.argv and sys.argv[sys.argv.index('--target') + 1] == 'site'
HEAD = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'


def inc(m):
    return open(root + 'src/' + m.group(1), encoding='utf-8').read().rstrip('\n')


src = open(root + 'src/index.html', encoding='utf-8').read()
if site:
    src = src.replace('js/modules/coin-images.js', 'js/modules/coin-paths.js')   # coins as files, not embedded
src = re.sub(r'<!--@include (\S+?)-->', inc, src)
page = HEAD + src + '\n</html>\n'

if site:
    out = root + 'dist/'
    shutil.rmtree(out, ignore_errors=True)
    os.makedirs(out)
    open(out + 'index.html', 'w', encoding='utf-8').write(page)
    shutil.copytree(root + 'assets/coins', out + 'assets/coins')
    open(out + '.nojekyll', 'w').close()
    print('built site', len(page))
else:
    open(root + 'WWWorksheet-maker-2000-.html', 'w', encoding='utf-8').write(page)
    print('built', len(page))