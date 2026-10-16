// dom.test.js — jsdom assertions for v10 bento layout.
// Run: node tests/dom.test.js
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/root/lint-tools/node_modules/jsdom');

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + msg); }
}

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'https://nightforgeio.github.io/justjaydev-landing/', runScripts: 'outside-only' });
const doc = dom.window.document;

// ---- Structure ----
assert(doc.querySelector('.topbar'), 'topbar exists');
assert(doc.querySelector('.bento'), 'bento grid exists');
assert(doc.querySelector('.tile-hero'), 'hero tile exists');
assert(doc.querySelector('.tile-status'), 'status tile exists');
assert(doc.querySelector('.tile-buildon'), 'built-on tile exists');
assert(doc.querySelector('.tile-github'), 'github tile exists');
assert(doc.querySelector('.tile-projects'), 'projects tile exists');
assert(doc.querySelector('.tile-shiplog'), 'shiplog tile exists');
assert(doc.querySelector('.tile-skills'), 'skills tile exists');
assert(doc.querySelector('.tile-links'), 'links tile exists');

// ---- Nav ----
assert(doc.querySelector('.nav'), 'desktop nav exists');
assert(doc.querySelector('.bottom-nav'), 'mobile bottom nav exists');
assert(doc.querySelectorAll('.bottom-nav a').length >= 4, 'bottom nav has >= 4 items');

// ---- Hero ----
assert(doc.querySelector('.hero-avatar'), 'hero avatar exists');
assert(doc.querySelector('.hero-name.scramble'), 'hero name has scramble class');
assert(doc.querySelector('.hero-quote'), 'hero quote exists');
assert(doc.querySelectorAll('.hero-cta .btn').length >= 2, 'hero has >= 2 CTA buttons');

// ---- i18n ----
assert(doc.querySelectorAll('[data-i18n]').length >= 15, 'at least 15 data-i18n elements');

// ---- Command palette ----
assert(doc.getElementById('palette-overlay'), 'palette overlay exists');
assert(doc.getElementById('palette-input'), 'palette input exists');
assert(doc.getElementById('palette-trigger'), 'palette trigger button exists');

// ---- Meta / SEO ----
assert(doc.querySelector('meta[name="description"]'), 'meta description exists');
assert(doc.querySelector('meta[property="og:image"]'), 'og:image exists');
assert(doc.querySelector('meta[name="theme-color"]'), 'theme-color exists');
assert(doc.querySelector('link[rel="manifest"]'), 'manifest link exists');
assert(doc.querySelector('script[type="application/ld+json"]'), 'structured data exists');

// ---- Fonts ----
assert(html.includes('space-grotesk-var.woff2'), 'Space Grotesk font referenced');
assert(html.includes('jetbrains-mono-var.woff2'), 'JetBrains Mono font referenced');
assert(html.includes('noto-sans-devanagari.woff2'), 'Noto Devanagari font referenced');
assert(html.includes('font-display: swap'), 'font-display swap used');

// ---- CSS architecture ----
assert(doc.querySelector('link[href="css/tokens.css"]'), 'tokens.css linked');
assert(doc.querySelector('link[href="css/base.css"]'), 'base.css linked');
assert(doc.querySelector('link[href="css/layout.css"]'), 'layout.css linked');
assert(doc.querySelector('link[href="css/components.css"]'), 'components.css linked');
assert(doc.querySelector('link[href="css/sections.css"]'), 'sections.css linked');

// ---- No old cruft ----
assert(!html.includes('card3d'), 'no old card3d class');
assert(!html.includes('tilt-wrap'), 'no old tilt-wrap');
assert(!html.includes('orb o1'), 'no old orb elements');
assert(!html.includes('style.css?v='), 'no old monolithic style.css');

// ---- Accessibility ----
assert(doc.querySelector('.skip'), 'skip link exists');
assert(doc.querySelector('noscript'), 'noscript fallback exists');
assert(doc.querySelector('[aria-label="Mobile navigation"]'), 'bottom nav has aria-label');

// ---- Scripts ----
assert(doc.querySelector('script[src="js/i18n.js"]'), 'i18n.js loaded');
assert(doc.querySelector('script[src="js/render.js"]'), 'render.js loaded');
assert(doc.querySelector('script[src="js/motion.js"]'), 'motion.js loaded');
assert(doc.querySelector('script[src="js/palette.js"]'), 'palette.js loaded');
assert(doc.querySelector('script[src="js/extras.js"]'), 'extras.js loaded');

// ---- Data files exist ----
['data/projects.json', 'data/links.json', 'data/shiplog.json', 'data/status.json'].forEach(f => {
  assert(fs.existsSync(path.join(__dirname, '..', f)), f + ' exists');
});

// ---- i18n parity ----
const i18nSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'i18n.js'), 'utf8');
// Count keys by matching lines like: 'nav.projects': ...
const keyPattern = /^[ 	]*'[a-z]+.[a-zA-Z0-9]+'[ 	]*:/gm;
const enSection = i18nSrc.slice(i18nSrc.indexOf('en: {'), i18nSrc.indexOf('hi: {'));
const hiSection = i18nSrc.slice(i18nSrc.indexOf('hi: {'), i18nSrc.indexOf('var current'));
const enCount = (enSection.match(keyPattern) || []).length;
const hiCount = (hiSection.match(keyPattern) || []).length;
assert(enCount === hiCount, 'i18n parity: en=' + enCount + ' hi=' + hiCount);
assert(enCount >= 25, 'i18n has >= 25 keys (got ' + enCount + ')');

console.log('\n' + pass + ' passed / ' + fail + ' failed');
process.exit(fail > 0 ? 1 : 0);
