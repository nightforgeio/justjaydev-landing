// palette.js — Ctrl+K command palette. Terminal-styled fuzzy nav.
(function () {
  "use strict";
  var overlay = document.getElementById("palette-overlay");
  var input = document.getElementById("palette-input");
  var results = document.getElementById("palette-results");
  var trigger = document.getElementById("palette-trigger");
  if (!overlay || !input || !results) return;

  var items = [
    { label: "Projects", href: "#projects", kw: "work builds repos" },
    { label: "Ship Log", href: "#shiplog", kw: "history releases changelog" },
    { label: "Skills", href: "#skills", kw: "languages tools tech" },
    { label: "Links", href: "#links", kw: "github youtube email contact" },
    {
      label: "Toggle language / भाषा बदलें",
      action: "lang",
      kw: "hindi english hi en",
    },
    { label: "Share this page", action: "share", kw: "copy url" },
  ];

  var activeIdx = 0;

  function open() {
    overlay.classList.add("open");
    input.value = "";
    render("");
    input.focus();
  }
  function close() {
    overlay.classList.remove("open");
  }

  function render(query) {
    var q = query.toLowerCase();
    results.innerHTML = "";
    var filtered = items.filter(function (it) {
      return (
        !q ||
        it.label.toLowerCase().indexOf(q) !== -1 ||
        (it.kw && it.kw.indexOf(q) !== -1)
      );
    });
    activeIdx = 0;
    filtered.forEach(function (it, i) {
      var div = document.createElement("div");
      div.className = "palette-item" + (i === 0 ? " active" : "");
      div.textContent = it.label;
      div.addEventListener("click", function () {
        go(it);
      });
      results.appendChild(div);
    });
  }

  function go(it) {
    close();
    if (it.action === "lang" && window.i18n) window.i18n.toggle();
    else if (it.action === "share" && navigator.share)
      navigator
        .share({ title: document.title, url: location.href })
        .catch(function () {});
    else if (it.href)
      document.querySelector(it.href).scrollIntoView({ behavior: "smooth" });
  }

  input.addEventListener("input", function () {
    render(input.value);
  });
  input.addEventListener("keydown", function (e) {
    var els = results.querySelectorAll(".palette-item");
    if (e.key === "ArrowDown") {
      activeIdx = Math.min(activeIdx + 1, els.length - 1);
      update(els);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      activeIdx = Math.max(activeIdx - 1, 0);
      update(els);
      e.preventDefault();
    } else if (e.key === "Enter" && els[activeIdx]) {
      els[activeIdx].click();
    } else if (e.key === "Escape") close();
  });

  function update(els) {
    els.forEach(function (el, i) {
      el.classList.toggle("active", i === activeIdx);
    });
  }

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
  });
  if (trigger) trigger.addEventListener("click", open);
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      open();
    }
  });
})();
