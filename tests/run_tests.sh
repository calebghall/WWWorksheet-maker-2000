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
node tests/logic-vis.js
node tests/logic-grey.js
node tests/logic-dups.js
node tests/logic-k2-a.js
node tests/logic-k2-b.js
node tests/logic-k2-c.js
node tests/logic-k2-d.js
node tests/logic-g3.js
node tests/logic-ns-extra.js
"$PY" tests/clip.py
"$PY" build.py --target site
node tests/site-check.js
CLIP_URL="file://$PWD/dist/index.html" "$PY" tests/clip.py | tail -1
"$PY" build.py
echo "ALL CHECKS PASSED"
