// motion.js — signature motion layer for v10.
// One scramble-decode, staggered reveal, subtle parallax.
// Everything gated behind prefers-reduced-motion.
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  // ---- Scramble-decode for hero name ----
  var CHARS = '!<>-_\/[]{}=+*^?#01';
  function scramble(el) {
    var target = el.getAttribute('data-text') || el.textContent;
    if (reduce || !target) { el.textContent = target; return; }
    var frame = 0;
    var total = target.length * 4 + 8;
    el.setAttribute('aria-label', target);
    (function tick() {
      var out = '';
      for (var i = 0; i < target.length; i++) {
        if (frame / 4 > i + 2) out += target[i];
        else if (frame / 4 > i) out += CHARS[Math.floor(Math.random() * CHARS.length)];
        else out += '\u00a0';
      }
      el.textContent = out;
      frame++;
      if (frame <= total) requestAnimationFrame(tick);
      else el.textContent = target;
    })();
  }

  var heroName = document.querySelector('.scramble');
  if (heroName) {
    // Delay slightly so the tile entrance finishes first
    setTimeout(function () { scramble(heroName); }, 300);
  }

  // ---- Scroll reveal with stagger ----
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 60 + 'ms';
      io.observe(el);
    });
  }

  // ---- Active section marker (nav + bottom-nav) ----
  var sections = ['hero', 'projects', 'shiplog', 'skills', 'links'];
  var navLinks = document.querySelectorAll('.nav a, .bottom-nav a');
  if ('IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          var match = a.getAttribute('href') === '#' + e.target.id;
          if (match) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) secIO.observe(el);
    });
  }

  // ---- Subtle parallax on hero glow (desktop only) ----
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduce) {
    var hero = document.querySelector('.tile-hero');
    if (hero) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        hero.style.setProperty('--gx', (50 + x * 12) + '%');
        hero.style.setProperty('--gy', (30 + y * 12) + '%');
      }, { passive: true });
      hero.addEventListener('pointerleave', function () {
        hero.style.removeProperty('--gx');
        hero.style.removeProperty('--gy');
      });
    }
  }

  // ---- Konami code easter egg ----
  var seq = [38,38,40,40,37,39,37,39,66,65];
  var pos = 0;
  document.addEventListener('keydown', function (e) {
    if (e.keyCode === seq[pos]) {
      pos++;
      if (pos === seq.length) {
        pos = 0;
        root.style.transition = 'filter .4s';
        root.style.filter = 'hue-rotate(90deg) saturate(1.4)';
        setTimeout(function () { root.style.filter = ''; }, 1200);
      }
    } else {
      pos = 0;
    }
  });
})();
