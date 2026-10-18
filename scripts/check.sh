#!/usr/bin/env bash
# check.sh — v11.1 cinematic verification
set -o pipefail
cd "$(dirname "$0")/.."

PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  ✓ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  ✗ $1"; }

echo '═══ justjaydev-landing v11.1 — check suite ═══'

# 1. JS syntax
echo '── JS syntax ──'
for f in js/main.js sw.js; do
  if node --check "$f" 2>/dev/null; then ok "$f"; else bad "$f syntax error"; fi
done

# 2. DOM tests
echo '── DOM tests ──'
if node tests/dom.test.js 2>/dev/null; then ok "dom.test.js (all pass)"; else bad "dom.test.js has failures"; fi

# 3. CSS exists
echo '── CSS ──'
if [ -s css/style.css ]; then ok "style.css ($(wc -c < css/style.css) bytes)"; else bad "style.css missing"; fi

# 4. Fonts
echo '── Fonts ──'
for f in fonts/space-grotesk-var.woff2 fonts/jetbrains-mono-var.woff2 fonts/noto-sans-devanagari.woff2; do
  if [ -s "$f" ]; then ok "$f"; else bad "$f missing"; fi
done

# 5. Weight budget
echo '── Weight budget ──'
CODE_BYTES=$(cat index.html 404.html css/style.css js/main.js sw.js manifest.json 2>/dev/null | wc -c)
CODE_KB=$((CODE_BYTES / 1024))
if [ "$CODE_KB" -le 50 ]; then ok "code weight: ${CODE_KB}KB (budget: 50KB)"; else bad "code weight: ${CODE_KB}KB exceeds 50KB"; fi

# 6. Anti-slop
echo '── Anti-slop ──'
if grep -q 'bento\|tile-\|card3d\|palette-overlay' index.html; then bad 'old cruft found'; else ok 'no old cruft'; fi
if grep -q 'background-clip: text' css/style.css; then bad 'gradient text clip'; else ok 'no gradient-text clip'; fi

# 7. Assets
echo '── Assets ──'
if [ -s assets/share.jpg ]; then ok "share.png ($(wc -c < assets/share.jpg) bytes)"; else bad "share.png missing"; fi
if [ -s assets/jay.webp ]; then ok "jay.webp"; else bad "jay.webp missing"; fi

echo ''
echo "═══ RESULT: $PASS passed / $FAIL failed ═══"
exit $FAIL
