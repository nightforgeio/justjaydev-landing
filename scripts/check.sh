#!/usr/bin/env bash
# check.sh — v10 verification pipeline
set -o pipefail
cd "$(dirname "$0")/.."

PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  ✓ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  ✗ $1"; }

echo '═══ justjaydev-landing v10 — check suite ═══'

# 1. JS syntax
echo '── JS syntax ──'
for f in js/i18n.js js/render.js js/motion.js js/palette.js js/extras.js sw.js; do
  if node --check "$f" 2>/dev/null; then ok "$f"; else bad "$f syntax error"; fi
done

# 2. JSON validity
echo '── JSON ──'
for f in manifest.json data/projects.json data/links.json data/shiplog.json data/status.json; do
  if python3 -c "import json; json.load(open('$f'))" 2>/dev/null; then ok "$f"; else bad "$f invalid"; fi
done

# 3. DOM tests
echo '── DOM tests ──'
if node tests/dom.test.js 2>/dev/null; then ok "dom.test.js (all pass)"; else bad "dom.test.js has failures"; fi

# 4. CSS files exist and are non-empty
echo '── CSS architecture ──'
for f in css/tokens.css css/base.css css/layout.css css/components.css css/sections.css; do
  if [ -s "$f" ]; then ok "$f ($(wc -c < "$f") bytes)"; else bad "$f missing or empty"; fi
done

# 5. Fonts exist
echo '── Fonts ──'
for f in fonts/space-grotesk-var.woff2 fonts/jetbrains-mono-var.woff2 fonts/noto-sans-devanagari.woff2; do
  if [ -s "$f" ]; then ok "$f"; else bad "$f missing"; fi
done

# 6. Weight budget (code only, excl images/fonts/assets)
echo '── Weight budget ──'
CODE_BYTES=$(cat index.html 404.html css/*.css js/*.js sw.js manifest.json 2>/dev/null | wc -c)
CODE_KB=$((CODE_BYTES / 1024))
if [ "$CODE_KB" -le 120 ]; then ok "code weight: ${CODE_KB}KB (budget: 120KB)"; else bad "code weight: ${CODE_KB}KB exceeds 120KB budget"; fi

# 7. Anti-slop: no gradient-text on all headings, no generic card3d, no spinning cubes
echo '── Anti-slop ──'
if grep -q 'card3d\|tilt-wrap\|orb o1\|spinRing\|spin3d' index.html; then bad 'old v9 cruft found in index.html'; else ok 'no v9 cruft in index.html'; fi
if grep -q 'background-clip: text' css/sections.css css/layout.css; then bad 'gradient text clip in new CSS'; else ok 'no gradient-text clip'; fi

echo ''
echo "═══ RESULT: $PASS passed / $FAIL failed ═══"
exit $FAIL
