// dom.test.js — v11.1 cinematic assertions.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('/root/lint-tools/node_modules/jsdom');

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) pass++;
  else { fail++; console.error('FAIL: ' + msg); }
}

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'https://nightforgeio.github.io/justjaydev-landing/' });
const doc = dom.window.document;

// Structure
assert(doc.querySelectorAll('.screen').length === 7, '7 full-screen sections');
assert(doc.querySelector('.mega'), 'mega name exists');
assert(doc.querySelector('.scroll-cue'), 'scroll cue exists');
assert(doc.querySelector('.statement.accent'), 'accent statement exists');
assert(doc.querySelectorAll('.role').length === 3, '3 roles');
assert(doc.querySelectorAll('.proj').length === 4, '4 projects');
assert(doc.querySelectorAll('.proj-num').length === 4, '4 project index numbers');
assert(doc.querySelector('.terminal'), 'terminal exists');
assert(doc.getElementById('term-input'), 'terminal input exists');
assert(doc.querySelector('.contact-email'), 'contact email exists');

// Tier 1 fixes
assert(doc.querySelector('.skip'), 'skip link exists (a11y)');
assert(doc.querySelector('#term-body[aria-live]'), 'terminal output aria-live');
assert(doc.querySelector('.grain'), 'film grain overlay');
assert(doc.getElementById('progress-bar'), 'scroll progress bar');
assert(doc.getElementById('build-info'), 'build info line in footer');
assert(doc.querySelector('.avatar'), 'avatar image present');

// Meta / SEO
assert(doc.querySelector('meta[name="description"]'), 'meta description');
assert(html.includes('assets/share.jpg'), 'og:image points to share.jpg');
assert(doc.querySelector('meta[name="theme-color"]'), 'theme-color');
assert(doc.querySelector('link[rel="manifest"]'), 'manifest');
assert(doc.querySelector('script[type="application/ld+json"]'), 'structured data');

// Fonts
assert(html.includes('space-grotesk-var.woff2'), 'Space Grotesk');
assert(html.includes('jetbrains-mono-var.woff2'), 'JetBrains Mono');
assert(html.includes('noto-sans-devanagari.woff2'), 'Noto Devanagari');
assert(html.includes('font-display:swap'), 'font-display swap');

// No old cruft
assert(!html.includes('bento'), 'no bento grid');
assert(!html.includes('tile-'), 'no tile classes');
assert(!html.includes('palette'), 'no command palette');
assert(!html.includes('data/projects.json'), 'no data JSON refs');

// i18n
assert(doc.querySelectorAll('[data-i18n]').length >= 12, 'at least 12 data-i18n elements');

// JS checks
const js = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');
assert(js.includes('ArrowUp'), 'terminal history: up arrow');
assert(js.includes('sudo'), 'sudo easter egg');
assert(/log\s*:/.test(js), 'log command in terminal');
assert((js.match(/cmd\s*:/g) || []).length === 2, 'terminal commands in both languages');
assert(js.includes('scrollIntoView'), 'terminal focus scroll-into-view');
assert(js.includes('typeQ2'), 'q2 type-in effect');
assert(js.includes('arrived'), 'mega entrance animation');

// CSS checks
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
assert(css.includes('prefers-reduced-motion'), 'reduced motion guard');
assert(css.includes('::-webkit-scrollbar'), 'styled scrollbar');
assert(css.includes('color-scheme: dark'), 'color-scheme dark');
assert(css.includes('::selection'), 'styled selection');
assert(css.includes('.proj-num'), 'project number styles');
assert(css.includes('feTurbulence'), 'grain uses SVG turbulence');

// SW
const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
assert(sw.includes('jj-v17'), 'SW cache bumped to jj-v17');

console.log('\n' + pass + ' passed / ' + fail + ' failed');
process.exit(fail > 0 ? 1 : 0);
