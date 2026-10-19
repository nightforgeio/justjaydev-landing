#!/usr/bin/env bash
# stamp-sw.sh — derive the service-worker cache name from file contents.
#
# WHY THIS EXISTS
# sw.js serves static assets cache-first. Once a returning visitor has
# style.css in cache, they keep it until the cache NAME changes. A
# hand-maintained version string is therefore a correctness bug: edit the CSS,
# forget to bump the string, and every returning visitor is pinned to the old
# file forever. That happened during v12 — the Devanagari @font-face shipped
# but was never delivered to anyone who had already visited.
#
# So the name is no longer maintained by hand. It is a hash of the exact bytes
# we ship, plus the precache list itself. Change a shipped file, or add a file
# to the precache list, and the name changes automatically.
#
# sw.js is deliberately NOT hashed (it contains the hash — circular). Browsers
# re-fetch sw.js on every navigation and byte-compare it, so that is safe.
set -u
cd "$(dirname "$0")/.." || exit 1

SHIPPED="index.html css/style.css js/main.js manifest.json"
for f in fonts/*.woff2 \
         assets/jay.webp assets/icon-32.png assets/icon-512.png \
         assets/apple-touch-icon.png assets/share.jpg; do
  [ -f "$f" ] && SHIPPED="$SHIPPED $f"
 done

# the precache list, without the CACHE line (which would be circular)
LIST=$(sed -n '/^var STATIC = \[/,/^\];/p' sw.js)

HASH=$( { cat $SHIPPED; printf '%s' "$LIST"; } | sha256sum | cut -c1-8)
NAME="jj-v12-$HASH"

if grep -q "^var CACHE = '$NAME';" sw.js 2>/dev/null; then
  echo "up to date: $NAME"
  exit 0
fi

# --check: report drift without writing (used by scripts/check.sh in CI)
if [ "${1:-}" = '--check' ]; then
  CUR=$(sed -n "s/^var CACHE = '\(.*\)';$/\1/p" sw.js)
  echo "DRIFT: sw.js says '$CUR' but shipped bytes hash to '$NAME'" >&2
  echo "       run: bash scripts/stamp-sw.sh" >&2
  exit 1
fi

OLD=$(sed -n "s/^var CACHE = '\(.*\)';$/\1/p" sw.js)
sed -i "s|^var CACHE = '[^']*';|var CACHE = '$NAME';|" sw.js
sed -i "s|^// sw.js — v12 services site\. Cache .*|// sw.js — v12 services site. Cache $NAME (content-derived; do not hand-edit).|" sw.js
echo "stamped: $OLD -> $NAME"
