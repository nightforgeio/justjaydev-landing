#!/usr/bin/env bash
# check.sh — v12 services-site verification
set -o pipefail
cd "$(dirname "$0")/.."
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  ✓ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  ✗ $1"; }

echo '═══ justjaydev-landing v12 — check suite ═══'

# 1. JS syntax
echo '── JS syntax ──'
for f in js/main.js sw.js; do
  if node --check "$f" 2>/dev/null; then ok "$f"; else bad "$f syntax error"; fi
done

# 2. DOM tests
echo '── DOM tests ──'
if node tests/dom.test.js 2>/dev/null; then ok "dom.test.js (all pass)"; else bad "dom.test.js has failures"; fi

# 3. JSON validity
echo '── JSON ──'
if node -e "JSON.parse(require('fs').readFileSync('manifest.json','utf8'))" 2>/dev/null; then ok "manifest.json valid"; else bad "manifest.json invalid"; fi

# 4. CSS
echo '── CSS ──'
if [ -s css/style.css ]; then ok "style.css ($(wc -c < css/style.css) bytes)"; else bad "style.css missing"; fi
if [ "$(tr -cd '{' < css/style.css | wc -c)" = "$(tr -cd '}' < css/style.css | wc -c)" ]; then ok "braces balanced"; else bad "brace mismatch"; fi

# 5. Zero-inline-assets invariant (the whole point of v12)
echo '── No inline assets ──'
if grep -q 'base64' index.html; then bad "base64 found in index.html"; else ok "index.html has no base64"; fi

# 6. Fonts
echo '── Fonts ──'
for f in fonts/space-grotesk-var.woff2 fonts/jetbrains-mono-var.woff2 fonts/noto-sans-devanagari.woff2; do
  if [ -s "$f" ]; then ok "$f"; else bad "$f missing"; fi
done

# 7. Assets
echo '── Assets ──'
for f in assets/jay.webp assets/share.jpg assets/icon-32.png assets/icon-512.png; do
  if [ -s "$f" ]; then ok "$f ($(wc -c < "$f") bytes)"; else bad "$f missing"; fi
done

# 8. Weight budget (gzip = what actually ships over the wire)
echo '── Weight budget ──'
GZ=$(cat index.html 404.html css/style.css js/main.js sw.js manifest.json | gzip -c | wc -c)
GZ_KB=$((GZ / 1024))
if [ "$GZ_KB" -le 40 ]; then ok "gzip code weight: ${GZ_KB}KB (budget: 40KB)"; else bad "gzip weight: ${GZ_KB}KB exceeds 40KB"; fi
HTML_KB=$(( $(wc -c < index.html) / 1024 ))
if [ "$HTML_KB" -le 40 ]; then ok "index.html raw: ${HTML_KB}KB"; else bad "index.html raw: ${HTML_KB}KB too heavy"; fi

# 9. i18n coverage floor
echo '── i18n ──'
KEYS=$(grep -o 'data-i18n[a-z-]*="[^"]*"' index.html | wc -l)
if [ "$KEYS" -ge 100 ]; then ok "$KEYS localized elements"; else bad "only $KEYS localized elements"; fi
HI_KEYS=$(node -e "
const js=require('fs').readFileSync('js/main.js','utf8');
const b=js.match(/var HI = \{([\s\S]*?)\n  \};/);
console.log(b? (b[1].match(/[A-Za-z_][A-Za-z0-9_]*\s*:/g)||[]).length : 0);
" 2>/dev/null)
if [ "$HI_KEYS" -ge 100 ]; then ok "$HI_KEYS Hindi strings"; else bad "only $HI_KEYS Hindi strings"; fi

# 10. PWA
echo '── PWA ──'
SW_NAME=$(sed -n "s/^var CACHE = '\(.*\)';$/\1/p" sw.js)
if [ -n "$SW_NAME" ]; then ok "SW cache $SW_NAME"; else bad "SW cache name unreadable"; fi
if bash scripts/stamp-sw.sh --check >/dev/null 2>&1; then
  ok "SW cache name matches shipped bytes"
else
  bad "SW cache name DRIFTED from shipped bytes (run: bash scripts/stamp-sw.sh)"
fi
if grep -q 'navigator.serviceWorker.register' js/main.js; then ok "SW registered"; else bad "SW not registered"; fi
if grep -q 'manifest.json' index.html; then ok "manifest linked"; else bad "manifest not linked"; fi

# 11. a11y invariants
echo '── a11y ──'
grep -q 'class="skip"' index.html && ok "skip link" || bad "skip link missing"
grep -q 'aria-live' index.html && ok "aria-live regions" || bad "no aria-live"
grep -q 'prefers-reduced-motion:reduce' css/style.css && ok "reduced-motion CSS guard" || bad "no reduced-motion guard"
# every shipped font file must have a matching @font-face (v12 regression guard)
for f in fonts/*.woff2; do
  b=$(basename "$f")
  if grep -q "fonts/$b" css/style.css; then ok "font-face declared: $b"; else bad "$b shipped but never declared"; fi
done
grep -q '<noscript><style>' index.html && ok "noscript fallback" || bad "no noscript fallback"

# 12. Anti-slop
echo '── Anti-slop ──'
if grep -q 'background-clip: text' css/style.css; then bad 'gradient text clip'; else ok 'no gradient-text clip'; fi
if grep -q 'bento\|tile-\|card3d' index.html; then bad 'old cruft found'; else ok 'no old cruft'; fi
if grep -qE 'TODO:|FIXME:|XXX:' index.html; then bad 'unfinished marker in shipped HTML'; else ok 'no unfinished markers'; fi

echo ''
echo "═══ RESULT: $PASS passed / $FAIL failed ═══"
exit $FAIL