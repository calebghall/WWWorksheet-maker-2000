#!/usr/bin/env bash
# Build, then run every check. Exit status is non-zero on any failure.
set -e
PY=python3; "$PY" -c "" 2>/dev/null || PY=python
cd "$(dirname "$0")/.."
"$PY" build.py
node tests/logic-arith.js | tail -1
node tests/logic-fdp-ns.js | head -1
node tests/logic-tm.js | tail -1
node tests/logic-mix.js
node tests/logic-gap.js
node tests/logic-standards.js
node tests/logic-crosswalk.js
node tests/logic-vis.js
node tests/logic-grey.js
node tests/logic-dups.js
node tests/logic-k2-a.js
node tests/logic-k2-b.js
node tests/logic-k2-c.js
node tests/logic-k2-d.js
node tests/logic-g3.js
node tests/logic-g5.js
node tests/logic-g5f.js
node tests/logic-g5m.js
node tests/logic-g5g.js
node tests/logic-ns-extra.js
node tests/logic-commas.js
node tests/logic-bugreport.js
node tests/logic-mulsizes.js
node tests/logic-setcodes.js
node tests/logic-parts.js
node tests/logic-typemap.js
node tests/logic-strands.js
"$PY" tests/clip.py
"$PY" tests/parts_ui.py
"$PY" tests/types_ui.py
"$PY" build.py --target site --embed none
"$PY" tests/frameworks_ui.py
"$PY" build.py --target site
node tests/site-check.js
DIST_URL=$("$PY" -c 'import pathlib; print(pathlib.Path("dist/index.html").resolve().as_uri())')
CLIP_URL="$DIST_URL" "$PY" tests/clip.py | tail -1
CLIP_URL="$DIST_URL" "$PY" tests/parts_ui.py
CLIP_URL="$DIST_URL" "$PY" tests/types_ui.py
"$PY" build.py
echo "ALL CHECKS PASSED"
