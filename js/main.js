// main.js — v11.1 cinematic: i18n, entrance, type-in, terminal, progress.
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ================= i18n =================
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
      footer: 'Built on Android · Hosted on GitHub Pages · © 2026',
      cmd: {
        help: 'Commands:\n  help      this list\n  whoami    about me\n  projects  what I built\n  log       ship log\n  skills    what I work with\n  contact   how to reach me\n  clear     clear screen',
        whoami: 'Jay · @JustJayDev\nSelf-taught developer. Learns in public.\nBuilds from scratch. Ships what others call impossible.',
        projects: '01 NightForge      github.com/nightforgeio\n02 shop-template   nightforgeio.github.io/shop-template\n03 this site       nightforgeio.github.io/justjaydev-landing',
        log: '2026-10-15  shop-template v1        PWA\n2026-10-12  justjaydev-landing v9   SITE\n2026-10-01  lint pipeline           TOOLING\n2026-09-20  NightForge brand        BRAND',
        skills: 'Python · JavaScript · HTML · CSS · Bash · Git\nPWAs · Shell automation · GitHub Pages',
        contact: 'Email: jaykumar.c2010@gmail.com',
        notfound: 'command not found: %CMD%. Type help.',
        sudo: 'nice try. you are not in the sudoers file.\nthis incident will be reported. 😏'
      }
    },
    hi: {
      name: 'जय',
      q1: 'लोग इसे नामुमकिन\नकहते हैं।',
      q2: 'मैं इसे अटल\नकहता हूँ।',
      r1: 'बिल्डर', r2: 'डेवलपर', r3: 'गेमर',
      rnote: 'स्वयं सीखा। खुलेआम सीखता है। शून्य से बनाता है।',
      ptitle: 'शिप किया',
      p1: 'बिल्डर ब्रांड। प्रोजेक्ट्स, प्लगइन्स, टूल्स।',
      p2: 'द्विभाषी फूड-शॉप PWA। 89 टेस्ट। एडमिन पैनल।',
      p3: 'यह पेज। एंड्रॉइड पर बनाया।',
      p4: 'IGL · जर्सी 07 · साइट जल्द।',
      clabel: 'नमस्ते कहो',
      copy: 'कॉपी करें',
      copied: 'कॉपी हो गया ✓',
      footer: 'एंड्रॉइड पर बनाया · GitHub Pages पर होस्ट · © 2026',
      cmd: {
        help: 'कमांड:\n  help      यह सूची\n  whoami    मेरे बारे में\n  projects  मैंने क्या बनाया\n  log       शिप लॉग\n  skills    मेरे टूल्स\n  contact   संपर्क\n  clear     स्क्रीन साफ करें',
        whoami: 'जय · @JustJayDev\nस्वयं सीखा डेवलपर। खुलेआम सीखता है।\nशून्य से बनाता है। जो नामुमकिन है, वह शिप करता है।',
        projects: '01 NightForge      github.com/nightforgeio\n02 shop-template   nightforgeio.github.io/shop-template\n03 यह साइट        nightforgeio.github.io/justjaydev-landing',
        log: '2026-10-15  shop-template v1        PWA\n2026-10-12  justjaydev-landing v9   SITE\n2026-10-01  लिंट पाइपलाइन          TOOLING\n2026-09-20  NightForge ब्रांड        BRAND',
        skills: 'Python · JavaScript · HTML · CSS · Bash · Git\nPWA · शेल ऑटोमेशन · GitHub Pages',
        contact: 'ईमेल: jaykumar.c2010@gmail.com',
        notfound: 'कमांड नहीं मिला: %CMD%। help लिखें।',
        sudo: 'अच्छी कोशिश। आप सूडर्स फाइल में नहीं हैं।नयह घटना दर्ज की जाएगी। 😏'
      }
    }
  };
  var lang = localStorage.getItem('jjd-lang') || 'en';
  function L() { return i18n[lang] || i18n.en; }

  function applyLang() {
    document.documentElement.lang = lang;
    var d = L();
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      if (d[key] === undefined) continue;
      if (key === 'q1') {
        els[i].innerHTML = d[key].replace(/\n/g, '<br>');
      } else if (key === 'q2') {
        if (!els[i].getAttribute('data-typed')) {
          els[i].innerHTML = d[key].replace(/\n/g, '<br>');
        }
      } else {
        els[i].textContent = d[key];
      }
    }
    var btn = document.querySelector('.lang-toggle');
    if (btn) btn.textContent = lang === 'en' ? 'हिन्दी' : 'EN';
  }

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

  // ================= scroll progress =================
  var progress = document.getElementById('progress-bar');
  if (progress) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
        ticking = false;
      });
    }, { passive: true });
  }

  // ================= hero entrance =================
  var mega = document.querySelector('.mega');
  if (mega) {
    if (reduce) { mega.classList.add('arrived'); }
    else { setTimeout(function () { mega.classList.add('arrived'); }, 120); }
  }

  // ================= q2 type-in =================
  var q2 = document.getElementById('q2-text');
  var q2Done = false;
  function typeQ2() {
    if (q2Done || !q2) return;
    q2Done = true;
    q2.setAttribute('data-typed', '1');
    var lines = L().q2.split('\n');
    if (reduce) { q2.innerHTML = lines.join('<br>'); return; }
    q2.innerHTML = '';
    var li = 0, ci = 0;
    var cur = document.createElement('span');
    q2.appendChild(cur);
    (function tick() {
      if (li >= lines.length) return;
      var line = lines[li];
      if (ci < line.length) {
        cur.textContent += line[ci];
        ci++;
        setTimeout(tick, 45);
      } else {
        li++;
        ci = 0;
        if (li < lines.length) {
          q2.appendChild(document.createElement('br'));
          cur = document.createElement('span');
          q2.appendChild(cur);
          setTimeout(tick, 200);
        }
      }
    })();
  }

  // ================= scroll reveal =================
  var targets = document.querySelectorAll('.sub, .statement, .roles-list, .role-note, .section-head, .proj-list, .terminal, .contact-label, .contact-email, .copy-hint');
  if (!reduce && 'IntersectionObserver' in window) {
    targets.forEach(function (el) { el.classList.add('fade-in'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target === q2) typeQ2();
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    targets.forEach(function (el) { io.observe(el); });
    if (q2) io.observe(q2);
  } else if (q2) {
    q2.innerHTML = L().q2.replace(/\n/g, '<br>');
    q2.setAttribute('data-typed', '1');
  }

  // ================= terminal =================
  var termBody = document.getElementById('term-body');
  var termInput = document.getElementById('term-input');
  var history = [];
  var histIdx = -1;

  function termPrint(text, cls) {
    String(text).split('\n').forEach(function (l) {
      var p = document.createElement('p');
      p.className = 'term-line ' + (cls || 'term-out');
      p.textContent = l;
      termBody.appendChild(p);
    });
    termBody.scrollTop = termBody.scrollHeight;
  }

  function runCmd(raw) {
    var cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    termPrint(cmd, 'term-echo');
    if (cmd === 'clear') { termBody.innerHTML = ''; return; }
    if (cmd === 'sudo' || cmd.indexOf('sudo ') === 0) { termPrint(L().cmd.sudo); return; }
    var out = L().cmd[cmd];
    if (out) termPrint(out);
    else termPrint(L().cmd.notfound.replace('%CMD%', cmd));
  }

  if (termInput) {
    termInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var v = termInput.value;
        if (v.trim()) { history.push(v); histIdx = history.length; }
        runCmd(v);
        termInput.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx > 0) { histIdx--; termInput.value = history[histIdx] || ''; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx < history.length - 1) { histIdx++; termInput.value = history[histIdx] || ''; }
        else { histIdx = history.length; termInput.value = ''; }
      }
    });
    termInput.addEventListener('focus', function () {
      setTimeout(function () {
        termInput.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      }, 300);
    });
  }

  // ================= copy email =================
  var copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = 'jaykumar.c2010@gmail.com';
      function done() { copyBtn.textContent = L().copied; }
      if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, done);
      else done();
    });
  }

  // ================= build line =================
  var buildInfo = document.getElementById('build-info');
  if (buildInfo) buildInfo.textContent = 'commit 506ca94 · built on android · v11.1';

  // ================= SW =================
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
