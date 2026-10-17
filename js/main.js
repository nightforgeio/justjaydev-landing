// main.js — cinematic scroll, i18n, terminal, copy.
(function () {
  'use strict';

  // ---- i18n ----
  var i18n = {
    en: {
      name: 'JAY',
      q1: 'They call it\nimpossible.',
      q2: 'I call it\ninevitable.',
      r1: 'Builder', r2: 'Developer', r3: 'Gamer',
      rnote: 'Self-taught. Learns in public. Builds from scratch.',
      ptitle: 'Shipped',
      p1: 'Builder brand. Projects, plugins, tools.',
      p2: 'Bilingual food-shop PWA. 89 tests. Admin panel.',
      p3: 'This page. Built on Android.',
      p4: 'IGL · Jersey 07 · Site soon.',
      clabel: 'Say hello',
      copy: 'tap to copy',
      copied: 'copied ✓',
      footer: 'Built on Android · Hosted on GitHub Pages · © 2026'
    },
    hi: {
      name: 'जय',
      q1: 'लोग इसे नामुमकिन\nकहते हैं।',
      q2: 'मैं इसे अटल\नकहता हूँ।',
      r1: 'बिल्डर', r2: 'डेवलपर', r3: 'गेमर',
      rnote: 'स्व-सिख। खुलेआम सीखता है। शून्य से बनाता है।',
      ptitle: 'शिप्ड',
      p1: 'बिल्डर ब्रांड। प्रोजेक्ट्स, प्लगिन्स, टूल्स।',
      p2: 'द्विभाषी फूड-शॉप PWA। 89 टेस्ट। एडमिन पैनल।',
      p3: 'यह पेज। एंड्रॉइड पर बनाया।',
      p4: 'IGL · जर्सी 07 · साइट जल्द।',
      clabel: 'नमस्ते कहो',
      copy: 'कॉपी करें',
      copied: 'कॉपी हो गया ✓',
      footer: 'एंड्रॉइड पर बनाया · GitHub Pages पर होस्ट · © 2026'
    }
  };
  var lang = localStorage.getItem('jjd-lang') || 'en';

  function applyLang() {
    document.documentElement.lang = lang;
    var d = i18n[lang] || i18n.en;
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      if (d[key] !== undefined) {
        if (key === 'q1' || key === 'q2') {
          els[i].innerHTML = d[key].replace(/\n/g, '<br>');
        } else {
          els[i].textContent = d[key];
        }
      }
    }
    var btn = document.querySelector('.lang-toggle');
    if (btn) btn.textContent = lang === 'en' ? 'हिन्दी' : 'EN';
  }

  // lang toggle button
  var langBtn = document.createElement('button');
  langBtn.className = 'lang-toggle';
  langBtn.type = 'button';
  langBtn.setAttribute('aria-label', 'Switch language');
  langBtn.addEventListener('click', function () {
    lang = lang === 'en' ? 'hi' : 'en';
    localStorage.setItem('jjd-lang', lang);
    applyLang();
  });
  document.body.appendChild(langBtn);
  applyLang();

  // ---- scroll reveal ----
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.mega, .sub, .statement, .roles-list, .role-note, .section-head, .proj-list, .terminal, .contact-label, .contact-email, .copy-hint');
  if (!reduce && 'IntersectionObserver' in window) {
    targets.forEach(function (el) { el.classList.add('fade-in'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(function (el) { io.observe(el); });
  }

  // ---- terminal ----
  var termBody = document.getElementById('term-body');
  var termInput = document.getElementById('term-input');

  var commands = {
    help: 'Commands:\n  help      this list\n  whoami    about me\n  projects  what I built\n  contact   how to reach me\n  skills    what I work with\n  clear     clear screen',
    whoami: 'Jay · @JustJayDev\nSelf-taught developer. Learns in public.\nBuilds from scratch. Ships what others call impossible.',
    projects: 'NightForge      github.com/nightforgeio\nshop-template   nightforgeio.github.io/shop-template\nthis site       nightforgeio.github.io/justjaydev-landing',
    contact: 'Email: jaykumar.c2010@gmail.com',
    skills: 'Python · JavaScript · HTML · CSS · Bash · Git\nPWAs · Shell automation · GitHub Pages',
    clear: '__CLEAR__'
  };

  function termPrint(text, cls) {
    var p = document.createElement('p');
    p.className = 'term-line ' + (cls || 'term-out');
    p.textContent = text;
    termBody.appendChild(p);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function runCmd(raw) {
    var cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    termPrint(cmd, 'term-echo');
    if (cmd === 'clear') {
      termBody.innerHTML = '';
      return;
    }
    var out = commands[cmd];
    if (out) {
      var lines = out.split('\n');
      lines.forEach(function (l) { termPrint(l); });
    } else {
      termPrint('command not found: ' + cmd + '. Type help.', 'term-out');
    }
  }

  if (termInput) {
    termInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        runCmd(termInput.value);
        termInput.value = '';
      }
    });
  }

  // ---- copy email ----
  var copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = 'jaykumar.c2010@gmail.com';
      function done() { copyBtn.textContent = i18n[lang].copied; }
      if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, done);
      else done();
    });
  }

  // ---- SW ----
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
