// extras.js — share button, SW registration, PWA install, year, scroll progress.
(function () {
  "use strict";

  // ---- Year ----
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Web Share ----
  var shareBtn = document.getElementById("share-btn");
  if (shareBtn && navigator.share) {
    shareBtn.hidden = false;
    shareBtn.addEventListener("click", function () {
      navigator
        .share({ title: document.title, url: location.href })
        .catch(function () {});
    });
  }

  // ---- Service Worker ----
  if (
    "serviceWorker" in navigator &&
    (location.protocol === "https:" || location.hostname === "localhost")
  ) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }

  // ---- PWA install prompt ----
  var deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    // Show a subtle install chip in the nav
    var nav = document.querySelector(".nav");
    if (nav && !document.getElementById("install-chip")) {
      var chip = document.createElement("button");
      chip.id = "install-chip";
      chip.className = "lang-btn";
      chip.textContent = "⬇ Install";
      chip.style.minHeight = "36px";
      chip.addEventListener("click", function () {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () {
          deferredPrompt = null;
          chip.remove();
        });
      });
      nav.appendChild(chip);
    }
  });

  // ---- Scroll progress bar ----
  var bar = document.createElement("div");
  bar.style.cssText =
    "position:fixed;top:0;left:0;height:2px;background:var(--c-accent);z-index:99;width:0;transition:width 80ms linear;pointer-events:none";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
        ticking = false;
      });
    },
    { passive: true },
  );
})();
