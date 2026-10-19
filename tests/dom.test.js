// dom.test.js — v12 services-site assertions.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/root/lint-tools/node_modules/jsdom');

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) pass++;
  else { fail++; console.error('FAIL: ' + msg); }
}
function section(name) { console.log('  · ' + name); }

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

const dom = new JSDOM(html, { url: 'https://nightforgeio.github.io/justjaydev-landing/' });
const doc = dom.window.document;

// ---------------------------------------------------------------
section('structure');
assert(doc.querySelectorAll('section').length === 9, '9 sections (hero + 7 ids + terminal egg)');
['work', 'services', 'why', 'process', 'about', 'faq', 'contact'].forEach(function (id) {
  assert(doc.getElementById(id), 'section #' + id + ' exists');
});
assert(doc.querySelector('header.nav'), 'sticky nav exists');
assert(doc.querySelector('main#top'), 'main landmark');
assert(doc.querySelector('footer'), 'footer exists');

// ---------------------------------------------------------------
section('i18n parity (EN vs HI)');
const enKeys = new Set();
doc.querySelectorAll('[data-i18n]').forEach(function (el) { enKeys.add(el.getAttribute('data-i18n')); });
doc.querySelectorAll('[data-i18n-html]').forEach(function (el) { enKeys.add(el.getAttribute('data-i18n-html')); });

const hiBlock = js.match(/var HI = \{([\s\S]*?)\n  \};/);
assert(hiBlock, 'HI dictionary found');
const hiKeys = new Set();
if (hiBlock) {
  const re = /(?:^|,)\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/g;
  let m;
  while ((m = re.exec(hiBlock[1])) !== null) hiKeys.add(m[1]);
}
const missing = [];
enKeys.forEach(function (k) { if (!hiKeys.has(k)) missing.push(k); });
assert(missing.length === 0, 'every data-i18n key has Hindi: missing [' + missing.join(', ') + ']');

// terminal strings must be localised too
['termHelp', 'termWhoami', 'termServices', 'termProjects', 'termContact', 'termSudo', 'termHire', 'termNotFound', 'termTryHelp']
  .forEach(function (k) { assert(hiKeys.has(k), 'HI terminal string: ' + k); });

// ---------------------------------------------------------------
section('terminal');
assert(doc.getElementById('termIn'), 'terminal input');
assert(doc.getElementById('termBody'), 'terminal body');
assert(doc.querySelector('#termBody[aria-live]'), 'terminal aria-live');
assert(!/var CMD\s*=/.test(js), 'hardcoded CMD object removed (now i18n)');
assert(/function cmdFor/.test(js), 'cmdFor() lookup exists');
assert(doc.querySelectorAll('.term-hint button').length >= 5, '5+ quick-command buttons');
assert(/ArrowUp/.test(js) && /ArrowDown/.test(js), 'command history navigation');

// ---------------------------------------------------------------
section('reduced motion + no-JS safety');
assert(/prefers-reduced-motion:reduce/.test(css), 'CSS honours prefers-reduced-motion');
assert(/prefers-reduced-motion: reduce/.test(js), 'JS honours prefers-reduced-motion');
assert(/<noscript><style>/.test(html), 'noscript fallback present');
assert(/\.rv\{opacity:1!important/.test(html), 'noscript makes .rv visible');
assert(/\.js \.rv\{/.test(css), 'reveal guarded behind .js class');

// ---------------------------------------------------------------
section('strike-on-scroll (was a fixed timer)');
assert(!/animation:strike/.test(css), 'old hard-timed strike animation removed');
assert(/\.hero-h\.in \.strike::after\{transform:scaleX\(1\)\}/.test(css), 'strike driven by .in class');
assert(/querySelector\('\.hero-h'\)/.test(js), 'JS hooks the hero heading');
assert(doc.querySelector('.hero-h'), 'hero heading has .hero-h class');

// ---------------------------------------------------------------
section('contact form');
['cName', 'cBiz', 'cSite', 'cMsg'].forEach(function (id) {
  assert(doc.getElementById(id), 'form field #' + id);
});
assert(doc.getElementById('needChips'), 'need chips group');
assert(doc.querySelectorAll('#needChips .chip').length === 5, '5 need chips');
assert(doc.querySelectorAll('#needChips .chip[aria-pressed]').length === 5, 'chips expose aria-pressed');
assert(doc.getElementById('sent'), 'sent confirmation panel');
assert(/aria-live="polite"/.test(html), 'form status announced');
assert(doc.getElementById('sendNote'), 'channel note element (used by JS)');
assert(/errName/.test(js) && /errBiz/.test(js), 'validation errors localised');

// ---------------------------------------------------------------
section('a11y');
assert(doc.querySelector('.skip'), 'skip link');
assert(doc.querySelector('.skip').getAttribute('href') === '#work', 'skip targets #work');
assert(doc.getElementById('burger').getAttribute('aria-expanded') === 'false', 'burger aria-expanded');
assert(doc.getElementById('burger').getAttribute('aria-controls') === 'mmenu', 'burger aria-controls');
assert(doc.querySelector('.links[aria-label]'), 'nav labelled');
assert(/aria-label="Quick contact"/.test(html), 'mobile bar labelled');
assert(/<details class="q">/.test(html), 'FAQ uses native details/summary');
assert(doc.querySelector('.q summary'), 'FAQ summary present');
assert(/focus-visible/.test(css), 'focus-visible styling');

// ---------------------------------------------------------------
section('assets externalised (was 241KB inline)');
assert(html.indexOf('base64') === -1, 'zero base64 blobs in HTML');
assert(css.indexOf('base64,') === -1 || css.match(/base64,/g).length <= 1, 'no font blobs in CSS (svg grain allowed)');
assert(html.includes('css/style.css'), 'stylesheet external');
assert(html.includes('js/main.js'), 'script external');
assert(/url\("\.\.\/fonts\/space-grotesk-var\.woff2"\)/.test(css), 'Space Grotesk external ref');
assert(/url\("\.\.\/fonts\/jetbrains-mono-var\.woff2"\)/.test(css), 'JetBrains Mono external ref');
assert(html.includes('assets/jay.webp'), 'avatar external ref');

// ---------------------------------------------------------------
section('PWA (claim is now true)');
assert(doc.querySelector('link[rel="manifest"]'), 'manifest linked');
assert(/serviceWorker/.test(js) && /navigator\.serviceWorker\.register/.test(js), 'SW registered in js/main.js');
assert(/CACHE = 'jj-v12-[0-9a-f]{8}'/.test(sw), 'SW cache name is content-derived (jj-v12-<hash>)');
assert(!/CACHE = 'jj-v\d+'/.test(sw), 'SW cache name is not a hand-maintained version string');
assert(sw.includes('./index.html') && sw.includes('./assets/jay.webp'), 'SW precache list populated');
assert(manifest.icons.length >= 2, 'manifest has icons');
assert(manifest.icons.some(function (i) { return i.purpose === 'maskable'; }), 'maskable icon declared');
assert(manifest.shortcuts && manifest.shortcuts.length === 2, '2 app shortcuts');
assert(manifest.theme_color === '#000000', 'manifest theme matches site');

// ---------------------------------------------------------------
section('SEO');
assert(doc.querySelector('meta[name="description"]').content.length > 50, 'description not stub');
assert(html.includes('assets/share.jpg'), 'og:image');
assert(html.includes('og:image:width'), 'og:image dimensions');
assert(doc.querySelector('meta[property="og:locale"]'), 'og locale');
assert(/application\/ld\+json/.test(html), 'structured data');
assert(/"@type":"Person"/.test(html), 'Person schema');
assert(doc.querySelector('link[rel="canonical"]'), 'canonical');
assert(/lang="en"/.test(html), 'html lang set');

// ---------------------------------------------------------------
section('CSS integrity');
assert(/\.rv\{opacity:0/.test(css), 'reveal initial state');
assert((css.match(/details\.q p\{/g) || []).length === 2, 'details.q p: base + one responsive override');
const open = (css.match(/\{/g) || []).length;
const close = (css.match(/\}/g) || []).length;
assert(open === close, 'braces balanced (' + open + '/' + close + ')');

// Every font file that ships must be reachable from a real @font-face rule.
// v12 regression: noto-sans-devanagari.woff2 was precached and 120KB heavy but
// had no @font-face, so Hindi silently fell back to a system font.
const fontFiles = fs.readdirSync(path.join(root, 'fonts'));
fontFiles.forEach(function (f) {
  assert(css.indexOf('fonts/' + f) !== -1, '@font-face present for fonts/' + f);
});
assert(
  /font-family:\s*"Noto Sans Devanagari"/.test(css),
  'Devanagari family declared (Hindi must not fall back to system font)'
);
assert(
  /html\[lang="hi"\]\s+body\{font-family:var\(--font-hi\)\}/.test(css),
  'Hindi language switch actually swaps the font stack'
);

// Dead CSS: keyframes that nothing animates.
const kf = css.match(/@keyframes\s+([A-Za-z-]+)/g) || [];
kf.forEach(function (m) {
  const name = m.replace(/@keyframes\s+/, '');
  const used = new RegExp('animation(-name)?:[^;}]*' + name).test(css);
  assert(used, '@keyframes ' + name + ' is actually used');
});

// No selector declared twice at the SAME level. Responsive overrides inside
// @media are intentional; duplicates in the top-level cascade are not (that was
// the v12 append-block mistake: a second :focus-visible and .lang at the end).
function duplicateSelectors(source) {
  // Blank out @media blocks so only the top-level cascade is compared.
  const flat = source.replace(/@media[^{]+\{/g, '@media{').replace(/@media\{[\s\S]*?\n\}/g, '');
  const standalone = {};
  const dupes = [];
  (flat.match(/[^{}]+\{/g) || []).forEach(function (chunk) {
    const sel = chunk.replace(/\{$/, '').trim();
    // A selector appearing in a group ("h1,h2,h3") and again on its own ("h2")
    // is a normal, intentional pattern. Only a repeated *standalone* rule is a bug.
    if (!sel || sel.indexOf(',') !== -1 || sel.charAt(0) === '@' || sel.indexOf('%') !== -1) return;
    if (standalone[sel]) { if (dupes.indexOf(sel) === -1) dupes.push(sel); } else standalone[sel] = 1;
  });
  return dupes;
}
const dupes = duplicateSelectors(css);
assert(dupes.length === 0, 'no duplicate standalone selectors: [' + dupes.join(' | ') + ']');
assert(duplicateSelectors('a{color:red}a{color:blue}').length === 1, 'duplicate-selector detector is not a no-op');
assert(duplicateSelectors('a{color:red}@media (max-width:1px){\na{color:blue}\n}').length === 0, 'responsive overrides are not flagged');

// ---------------------------------------------------------------
console.log('');
console.log('  ' + pass + ' passed / ' + fail + ' failed');
process.exit(fail ? 1 : 0);