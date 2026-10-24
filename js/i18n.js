// i18n.js — JSON-driven bilingual support (EN/HI).
// All strings live in the locale objects below. data-i18n attributes
// in HTML map to keys. render.js also uses t() for dynamic content.
(function () {
  "use strict";

  var locales = {
    en: {
      "nav.projects": "Projects",
      "nav.shiplog": "Ship Log",
      "nav.skills": "Skills",
      "nav.links": "Links",
      "hero.eyebrow": "Builder · Developer · Gamer",
      "hero.quote":
        "They call it impossible. I call it inevitable. Because an emperor's will cannot be denied.",
      "hero.cta1": "See my work",
      "hero.cta2": "Links",
      "hero.share": "Share",
      "status.label": "Currently building",
      "buildon.label": "Built on",
      "github.label": "GitHub",
      "github.repos": "repos",
      "github.stars": "stars",
      "github.lastPush": "last push",
      "projects.title": "Projects",
      "shiplog.title": "Ship Log",
      "skills.title": "Skills",
      "links.title": "Links",
      "footer.built": "Built on Android with Operit · Hosted on GitHub Pages",
      "project.visit": "Visit →",
      "project.soon": "Coming soon",
      "link.add": "Add link",
      "link.copy": "Tap to copy",
      "link.copied": "Copied ✓",
    },
    hi: {
      "nav.projects": "प्रोजेक्ट्स",
      "nav.shiplog": "शिप लॉग",
      "nav.skills": "स्किल्स",
      "nav.links": "लिंक्स",
      "hero.eyebrow": "बिल्डर · डेवलपर · गेमर",
      "hero.quote":
        "लोग इसे नामुमकिन कहते हैं। मैं इसे अटल कहता हूँ। क्योंकि एक सम्राट की इच्छा को रोका नहीं जा सकता।",
      "hero.cta1": "मेरा काम देखें",
      "hero.cta2": "लिंक्स",
      "hero.share": "शेयर करें",
      "status.label": "अभी बना रहा हूँ",
      "buildon.label": "बनाया गया",
      "github.label": "GitHub",
      "github.repos": "रेपो",
      "github.stars": "स्टार्स",
      "github.lastPush": "आखिरी पुश",
      "projects.title": "प्रोजेक्ट्स",
      "shiplog.title": "शिप लॉग",
      "skills.title": "स्किल्स",
      "links.title": "लिंक्स",
      "footer.built": "Android पर Operit से बनाया · GitHub Pages पर होस्ट",
      "project.visit": "देखें →",
      "project.soon": "जल्द आ रहा है",
      "link.add": "लिंक जोड़ें",
      "link.copy": "कॉपी करने के लिए टैप करें",
      "link.copied": "कॉपी हो गया ✓",
    },
  };

  var current = localStorage.getItem("jjd-lang") || "en";

  function t(key) {
    return (
      (locales[current] && locales[current][key]) || locales.en[key] || key
    );
  }

  function apply() {
    document.documentElement.lang = current;
    var els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute("data-i18n");
      var val = t(key);
      if (val !== key) els[i].textContent = val;
    }
    // Update lang toggle button text
    var btn = document.getElementById("lang-toggle");
    if (btn) btn.textContent = current === "en" ? "हिन्दी" : "EN";
    // Re-render data-driven sections
    if (window.__renderAll) window.__renderAll();
  }

  function toggle() {
    current = current === "en" ? "hi" : "en";
    localStorage.setItem("jjd-lang", current);
    apply();
    document.dispatchEvent(
      new CustomEvent("langchange", { detail: { lang: current } }),
    );
  }

  // Expose
  window.i18n = {
    t: t,
    get lang() {
      return current;
    },
    toggle: toggle,
    apply: apply,
  };

  // Init
  var btn = document.getElementById("lang-toggle");
  if (btn) btn.addEventListener("click", toggle);
  apply();
})();
