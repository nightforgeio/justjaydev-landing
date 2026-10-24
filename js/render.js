// render.js — data-driven rendering. Fetches JSON from /data/ and
// renders projects, ship-log, skills, links, status into the bento grid.
// Re-renders on language change via window.__renderAll.
(function () {
  "use strict";

  var cache = {};

  function lang() {
    return window.i18n ? window.i18n.lang : "en";
  }
  function t(key) {
    return window.i18n ? window.i18n.t(key) : key;
  }
  function pick(obj) {
    if (obj === null || obj === undefined) return "";
    if (typeof obj === "string") return obj;
    return obj[lang()] || obj.en || "";
  }

  function fetchJSON(path) {
    if (cache[path]) return Promise.resolve(cache[path]);
    return fetch(path, { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error(path + " " + r.status);
        return r.json();
      })
      .then(function (data) {
        cache[path] = data;
        return data;
      });
  }

  // ---- Projects ----
  function renderProjects(projects) {
    var grid = document.getElementById("projects-grid");
    if (!grid) return;
    grid.innerHTML = "";
    projects.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "project-card" + (p.status === "soon" ? " dim" : "");
      var tagClass = p.status === "live" ? "tag tag--live" : "tag";
      var html = '<span class="' + tagClass + '">' + pick(p.tag) + "</span>";
      html += "<h3>" + p.name + "</h3>";
      html += "<p>" + pick(p.desc) + "</p>";
      if (p.tech && p.tech.length) {
        html +=
          '<div class="tech-row">' +
          p.tech
            .map(function (x) {
              return '<span class="chip">' + x + "</span>";
            })
            .join("") +
          "</div>";
      }
      if (p.url) {
        html +=
          '<a class="card-link" href="' +
          p.url +
          '" target="_blank" rel="noopener">' +
          t("project.visit") +
          "</a>";
      } else {
        html +=
          '<span class="card-link" style="opacity:.5;cursor:default">' +
          t("project.soon") +
          "</span>";
      }
      card.innerHTML = html;
      grid.appendChild(card);
    });
  }

  // ---- Ship Log ----
  function renderShiplog(entries) {
    var list = document.getElementById("shiplog-list");
    if (!list) return;
    list.innerHTML = "";
    entries.forEach(function (e) {
      var row = document.createElement("div");
      row.className = "shiplog-entry";
      row.innerHTML =
        '<span class="shiplog-date">' +
        e.date +
        "</span>" +
        '<div class="shiplog-body"><h4>' +
        e.title +
        ' <span class="tag">' +
        e.tag +
        "</span></h4><p>" +
        pick(e.desc) +
        "</p></div>";
      list.appendChild(row);
    });
  }

  // ---- Skills ----
  function renderSkills() {
    var skillsData = [
      {
        title: { en: "Languages", hi: "भाषाएँ" },
        items: ["Python", "HTML", "CSS", "JavaScript", "Bash"],
      },
      {
        title: { en: "What I build", hi: "मैं क्या बनाता हूँ" },
        items: [
          "Websites",
          "PWAs",
          "Python tools",
          "Shell automation",
          "Static sites",
        ],
      },
      {
        title: { en: "Tools", hi: "टूल्स" },
        items: ["JSON", "Markdown", "Git", "GitHub Pages"],
      },
      {
        title: { en: "Outside code", hi: "कोड के बाहर" },
        items: ["eSports", "Football", "Gaming"],
      },
    ];
    var container = document.getElementById("skills-list");
    if (!container) return;
    container.innerHTML = "";
    skillsData.forEach(function (g) {
      var div = document.createElement("div");
      div.className = "skills-group";
      div.innerHTML =
        "<h4>" +
        pick(g.title) +
        '</h4><div class="chips">' +
        g.items
          .map(function (x) {
            return '<span class="chip">' + x + "</span>";
          })
          .join("") +
        "</div>";
      container.appendChild(div);
    });
  }

  // ---- Links ----
  function renderLinks(links) {
    var grid = document.getElementById("links-grid");
    if (!grid) return;
    grid.innerHTML = "";
    links.forEach(function (l) {
      if (l.placeholder) {
        var span = document.createElement("span");
        span.className = "link-btn is-placeholder";
        span.innerHTML =
          "<span>" +
          pick(l.label) +
          "</span><small>" +
          t("link.add") +
          "</small>";
        grid.appendChild(span);
      } else {
        var a = document.createElement("a");
        a.className = "link-btn";
        a.href = l.url;
        if (l.url.indexOf("mailto:") !== 0) {
          a.target = "_blank";
          a.rel = "noopener";
        }
        a.innerHTML =
          "<span>" +
          pick(l.label) +
          "</span><small>" +
          (l.sub || "") +
          "</small>";
        grid.appendChild(a);
      }
    });
    // Copy button for email
    var emailLink = links.find(function (l) {
      return l.id === "email";
    });
    if (emailLink) {
      var copyBtn = document.createElement("button");
      copyBtn.className = "link-btn";
      copyBtn.type = "button";
      copyBtn.setAttribute("data-copy", emailLink.sub);
      copyBtn.innerHTML =
        "<span>" +
        t("link.copy") +
        "</span><small>" +
        emailLink.sub +
        "</small>";
      copyBtn.addEventListener("click", function () {
        var small = copyBtn.querySelector("small");
        var done = function () {
          if (small) small.textContent = t("link.copied");
        };
        if (navigator.clipboard)
          navigator.clipboard.writeText(emailLink.sub).then(done, done);
        else done();
      });
      grid.appendChild(copyBtn);
    }
  }

  // ---- Status ----
  function renderStatus(status) {
    var textEl = document.getElementById("status-text");
    var dateEl = document.getElementById("status-date");
    if (textEl) textEl.textContent = pick(status.building);
    if (dateEl) dateEl.textContent = status.updated;
  }

  // ---- GitHub stats (live from API) ----
  function renderGitHub() {
    fetch("https://api.github.com/users/nightforgeio/repos?per_page=100")
      .then(function (r) {
        return r.ok ? r.json() : Promise.reject(r.status);
      })
      .then(function (repos) {
        var el = document.getElementById("gh-repos");
        var starsEl = document.getElementById("gh-stars");
        var pushEl = document.getElementById("gh-push");
        if (el) el.textContent = repos.length;
        if (starsEl)
          starsEl.textContent = repos.reduce(function (s, r) {
            return s + (r.stargazers_count || 0);
          }, 0);
        if (pushEl) {
          var latest = repos.reduce(function (max, r) {
            return r.pushed_at > max ? r.pushed_at : max;
          }, "");
          pushEl.textContent = latest ? latest.slice(0, 10) : "—";
        }
      })
      .catch(function () {
        // Rate-limited or offline — show graceful fallback
        var el = document.getElementById("gh-repos");
        if (el) el.textContent = "—";
      });
  }

  // ---- Master render ----
  function renderAll() {
    fetchJSON("data/projects.json")
      .then(renderProjects)
      .catch(function () {});
    fetchJSON("data/shiplog.json")
      .then(renderShiplog)
      .catch(function () {});
    fetchJSON("data/links.json")
      .then(renderLinks)
      .catch(function () {});
    fetchJSON("data/status.json")
      .then(renderStatus)
      .catch(function () {});
    renderSkills();
  }

  window.__renderAll = renderAll;
  renderAll();
  renderGitHub();
})();
