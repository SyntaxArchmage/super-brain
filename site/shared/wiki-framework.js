/**
 * WikiEngine — shared rendering framework for super-brain topic wikis.
 *
 * Exposed as a global: topics configure it via WikiEngine.create({...}).
 * Requires a WIKI global (from data.js) to be loaded before calling start().
 */
var WikiEngine = (function () {
  "use strict";

  function create(opts) {
    var wiki = opts.data;
    var wikiCN = opts.dataCN || null;
    var container = opts.container;
    var features = Object.assign(
      { search: true, conceptRail: true, contributions: true, i18n: false },
      opts.features || {}
    );
    var brand = opts.brand || { icon: "SB", text: "Super Brain" };
    var homeUrl = opts.homeUrl || null;
    var labels = Object.assign(
      {
        domains: "Knowledge Domains",
        concepts: "Concepts",
        conceptLayer: "Concept Layer",
        searchPlaceholder: "Search (Ctrl+K)...",
        openArticle: "Navigate to an article to see<br/>its concept layer here.",
        noConcepts: "No concepts defined for this article yet.",
        backToArticle: "\u2190 Back to article",
        searchResults: "Search Results",
        noResults: "No matching content found.",
        noResultsHint: "Try different keywords or a shorter query.",
        matches: "match(es)",
        concept: "Concept",
        contributesTo: "Contributes to",
        contributionsFrom: "Contributions from",
        search: "Search",
        results: "result(s)",
        richConceptNone:
          "Detailed concept content not yet available. This concept will be expanded as the knowledge base grows.",
        examples: "Examples",
        relatedConcepts: "Related concepts",
        appearsIn: "Appears in",
        sources: "Sources",
      },
      opts.labels || {}
    );
    var labelsCN = Object.assign(
      {
        domains: "\u77e5\u8bc6\u9886\u57df",
        concepts: "\u6982\u5ff5",
        conceptLayer: "\u6982\u5ff5\u5c42",
        searchPlaceholder: "\u641c\u7d22 (Ctrl+K)...",
        openArticle:
          "\u6253\u5f00\u4e00\u7bc7\u6587\u7ae0\u4ee5\u67e5\u770b<br/>\u5176\u6982\u5ff5\u5c42\u3002",
        noConcepts:
          "\u672c\u6587\u7ae0\u5c1a\u672a\u5b9a\u4e49\u6982\u5ff5\u3002",
        backToArticle:
          "\u2190 \u8fd4\u56de\u6587\u7ae0",
        searchResults:
          "\u641c\u7d22\u7ed3\u679c",
        noResults:
          "\u672a\u627e\u5230\u5339\u914d\u7684\u5185\u5bb9\u3002",
        noResultsHint:
          "\u5c1d\u8bd5\u4e0d\u540c\u7684\u5173\u952e\u8bcd\u6216\u66f4\u77ed\u7684\u67e5\u8be2\u3002",
        matches: "\u4e2a\u5339\u914d",
        concept: "\u6982\u5ff5",
        contributesTo: "Contributes to",
        contributionsFrom: "Contributions from",
        search: "\u641c\u7d22",
        results: "\u4e2a\u7ed3\u679c",
        richConceptNone:
          "\u8be6\u7ec6\u6982\u5ff5\u5185\u5bb9\u5c1a\u672a\u53ef\u7528\u3002\u968f\u7740\u77e5\u8bc6\u5e93\u7684\u6269\u5c55\uff0c\u6b64\u6982\u5ff5\u5c06\u88ab\u4e30\u5bcc\u3002",
        examples: "\u793a\u4f8b",
        relatedConcepts: "\u76f8\u5173\u6982\u5ff5",
        appearsIn: "\u51fa\u73b0\u5728",
        sources: "\u6765\u6e90",
      },
      opts.labelsCN || {}
    );

    var nav, main, rail;
    var currentPage = "index";
    var lang = features.i18n
      ? localStorage.getItem("sb-lang") || "en"
      : "en";
    var searchIndex = null;
    var onNavigateCb = null;

    function L(key) {
      return lang === "cn" ? labelsCN[key] || labels[key] : labels[key];
    }

    function t(section, id, field) {
      if (lang === "cn" && wikiCN) {
        var cn = wikiCN[section];
        if (cn && cn[id] && cn[id][field] !== undefined) return cn[id][field];
      }
      return wiki[section] && wiki[section][id]
        ? wiki[section][id][field]
        : undefined;
    }

    function tTaxonomy(domainId, childId) {
      if (lang === "cn" && wikiCN && wikiCN.taxonomy) {
        var d = wikiCN.taxonomy.find(function (x) {
          return x.id === domainId;
        });
        if (d) {
          if (!childId) return d.label;
          var c =
            d.children &&
            d.children.find(function (x) {
              return x.id === childId;
            });
          if (c) return c.label;
        }
      }
      var d2 = wiki.taxonomy.find(function (x) {
        return x.id === domainId;
      });
      if (!d2) return "";
      if (!childId) return d2.label;
      var c2 =
        d2.children &&
        d2.children.find(function (x) {
          return x.id === childId;
        });
      return c2 ? c2.label : "";
    }

    function setLang(newLang) {
      lang = newLang;
      localStorage.setItem("sb-lang", lang);
      renderNav();
      renderPage();
      renderRail();
    }

    function navigate(pageId) {
      currentPage = pageId;
      renderNav();
      renderPage();
      renderRail();
      window.scrollTo(0, 0);
      if (onNavigateCb) onNavigateCb(pageId);
    }

    // === Navigation ===
    function renderNav() {
      var expanded = {};
      nav.querySelectorAll(".nav-domain.expanded").forEach(function (el) {
        expanded[el.dataset.domain] = true;
      });
      wiki.taxonomy.forEach(function (domain) {
        if (
          domain.children.some(function (c) {
            return c.id === currentPage;
          })
        ) {
          expanded[domain.id] = true;
        }
      });

      var html = "";

      if (homeUrl) {
        html +=
          '<a class="nav-home-link" href="' + homeUrl + '">' +
          '<span class="nav-home-arrow">\u2190</span> Super Brain</a>';
      }

      html +=
        '<div class="nav-brand" id="nav-home">' +
        '<div class="nav-brand-icon">' +
        brand.icon +
        "</div>" +
        '<div class="nav-brand-text">' +
        brand.text +
        "</div></div>";

      if (features.i18n) {
        html +=
          '<div class="nav-lang-toggle">' +
          '<button class="lang-btn' +
          (lang === "en" ? " active" : "") +
          '" data-lang="en">EN</button>' +
          '<button class="lang-btn' +
          (lang === "cn" ? " active" : "") +
          '" data-lang="cn">\u4e2d\u6587</button></div>';
      }

      if (features.search) {
        html +=
          '<input type="search" class="nav-search" placeholder="' +
          L("searchPlaceholder") +
          '" id="nav-search-input" />';
      }

      html +=
        '<div class="nav-section-label">' +
        L("domains") +
        "</div>" +
        '<ul class="nav-tree">';

      wiki.taxonomy.forEach(function (domain) {
        var isExpanded = expanded[domain.id];
        html += "<li>";
        html +=
          '<div class="nav-domain' +
          (isExpanded ? " expanded" : "") +
          '" data-domain="' +
          domain.id +
          '">';
        html +=
          '<span class="chevron">\u25b8</span>' + tTaxonomy(domain.id);
        html += "</div>";
        html +=
          '<ul class="nav-children' + (isExpanded ? " open" : "") + '">';
        domain.children.forEach(function (child) {
          var active = child.id === currentPage ? " active" : "";
          html +=
            '<li><a class="nav-page' +
            active +
            '" data-page="' +
            child.id +
            '">' +
            tTaxonomy(domain.id, child.id) +
            "</a></li>";
        });
        html += "</ul></li>";
      });
      html += "</ul>";
      nav.innerHTML = html;

      document.getElementById("nav-home").addEventListener("click", function () {
        navigate("index");
      });

      if (features.i18n) {
        nav.querySelectorAll(".lang-btn").forEach(function (btn) {
          btn.addEventListener("click", function () {
            setLang(btn.dataset.lang);
          });
        });
      }

      nav.querySelectorAll(".nav-domain").forEach(function (el) {
        el.addEventListener("click", function () {
          el.classList.toggle("expanded");
          el.nextElementSibling.classList.toggle("open");
        });
      });
      nav.querySelectorAll(".nav-page").forEach(function (el) {
        el.addEventListener("click", function () {
          navigate(el.dataset.page);
        });
      });

      if (features.search) {
        var searchInput = document.getElementById("nav-search-input");
        searchInput.addEventListener("input", function (e) {
          var q = e.target.value.toLowerCase();
          nav.querySelectorAll(".nav-page").forEach(function (el) {
            var match = el.textContent.toLowerCase().includes(q);
            el.style.display = match || !q ? "" : "none";
          });
          if (q) {
            nav
              .querySelectorAll(".nav-children")
              .forEach(function (el) {
                el.classList.add("open");
              });
            nav.querySelectorAll(".nav-domain").forEach(function (el) {
              el.classList.add("expanded");
            });
          }
          if (e.target.value.trim()) {
            showSearchResults(e.target.value);
          } else {
            renderPage();
            renderRail();
          }
        });
        searchInput.addEventListener("keydown", function (e) {
          if (e.key === "Escape") {
            searchInput.value = "";
            searchInput.blur();
            renderPage();
            renderRail();
          }
        });
      }
    }

    // === Page rendering ===
    function renderPage() {
      var page = wiki.pages[currentPage];
      if (!page) {
        main.innerHTML =
          '<p style="color:var(--c-text-tertiary)">Page not found.</p>';
        return;
      }
      if (page.type === "index") {
        renderIndex(page);
      } else {
        renderArticle(page);
      }
    }

    function renderIndex(page) {
      var title = t("pages", "index", "title") || page.title;
      var subtitle = t("pages", "index", "subtitle") || page.subtitle;
      var html =
        '<div class="index-hero">' +
        '<h1 class="article-title">' +
        title +
        "</h1>" +
        '<p class="article-subtitle">' +
        subtitle +
        "</p></div>";

      wiki.taxonomy.forEach(function (domain) {
        var domainPages = domain.children.filter(function (c) {
          return wiki.pages[c.id];
        });
        if (domainPages.length === 0) return;

        html +=
          '<div class="index-section-label">' +
          tTaxonomy(domain.id) +
          "</div>";
        html += '<div class="index-grid">';
        domainPages.forEach(function (child) {
          var p = wiki.pages[child.id];
          var pTitle = t("pages", child.id, "title") || p.title;
          var pSubtitle = t("pages", child.id, "subtitle") || p.subtitle;
          html +=
            '<div class="index-card" data-page="' +
            child.id +
            '">' +
            '<div class="index-card-title">' +
            pTitle +
            "</div>" +
            '<div class="index-card-desc">' +
            pSubtitle +
            "</div></div>";
        });
        html += "</div>";
      });
      main.innerHTML = html;

      main.querySelectorAll(".index-card").forEach(function (el) {
        el.addEventListener("click", function () {
          navigate(el.dataset.page);
        });
      });
    }

    function renderArticle(page) {
      var pageId = currentPage;
      var title = t("pages", pageId, "title") || page.title;
      var subtitle = t("pages", pageId, "subtitle") || page.subtitle;
      var body = t("pages", pageId, "body") || page.body;
      var html = "";

      if (page.domain) {
        html +=
          '<div class="article-breadcrumb">' +
          '<span class="bc-domain">' +
          page.domain +
          "</span>" +
          '<span class="bc-sep">/</span>' +
          '<span class="bc-current">' +
          title +
          "</span></div>";
      }

      html +=
        '<h1 class="article-title">' +
        title +
        "</h1>" +
        '<p class="article-subtitle">' +
        subtitle +
        "</p>";

      if (page.meta) {
        html += '<div class="article-meta">';
        page.meta.forEach(function (m) {
          html += '<div class="meta-item">';
          if (m.dot)
            html +=
              '<span class="meta-dot" style="background:' +
              m.dot +
              '"></span>';
          html += m.text + "</div>";
        });
        html += "</div>";
      }

      html += '<div class="article-body">' + body + "</div>";

      if (features.contributions && page.contributions && page.contributions.length > 0) {
        html += '<div class="article-contributions">';
        html += "<h2>" + L("contributesTo") + "</h2>";
        page.contributions.forEach(function (c) {
          var target = wiki.pages[c.target];
          var label = target ? target.title : c.target;
          html +=
            '<div class="contribution-card" data-page="' +
            c.target +
            '">' +
            '<div class="contribution-source">' +
            label +
            "</div>" +
            '<div class="contribution-text">' +
            c.text +
            "</div></div>";
        });
        html += "</div>";
      }

      if (features.contributions) {
        var incoming = [];
        Object.keys(wiki.pages).forEach(function (id) {
          var p = wiki.pages[id];
          if (p.contributions) {
            p.contributions.forEach(function (c) {
              if (c.target === currentPage) {
                incoming.push({ source: id, text: c.text, label: p.title });
              }
            });
          }
        });
        if (incoming.length > 0) {
          html += '<div class="article-contributions">';
          html += "<h2>" + L("contributionsFrom") + "</h2>";
          incoming.forEach(function (c) {
            html +=
              '<div class="contribution-card" data-page="' +
              c.source +
              '">' +
              '<div class="contribution-source">' +
              c.label +
              "</div>" +
              '<div class="contribution-text">' +
              c.text +
              "</div></div>";
          });
          html += "</div>";
        }
      }

      main.innerHTML = html;
      main.querySelectorAll(".contribution-card").forEach(function (el) {
        el.addEventListener("click", function () {
          navigate(el.dataset.page);
        });
      });
    }

    // === Concept Rail ===
    function renderRail() {
      if (!features.conceptRail) return;
      var page = wiki.pages[currentPage];

      if (!page || page.type === "index") {
        rail.innerHTML =
          '<div class="rail-header">' +
          L("concepts") +
          "</div>" +
          '<div class="rail-empty">' +
          L("openArticle") +
          "</div>";
        return;
      }

      if (!page.concepts || page.concepts.length === 0) {
        rail.innerHTML =
          '<div class="rail-header">' +
          L("concepts") +
          "</div>" +
          '<div class="rail-empty">' +
          L("noConcepts") +
          "</div>";
        return;
      }

      var pageTitle = t("pages", currentPage, "title") || page.title;
      var html =
        '<div class="rail-header">' +
        L("conceptLayer") +
        " &mdash; " +
        pageTitle +
        "</div>";

      page.concepts.forEach(function (c) {
        var cId = c.name.toLowerCase();
        var cIdDash = cId.replace(/\s+/g, "-");
        var cName =
          t("concepts", cId, "name") ||
          t("concepts", cIdDash, "name") ||
          c.name;
        var cRole =
          t("concepts", cId, "role") ||
          t("concepts", cIdDash, "role") ||
          c.role;
        var cSummary =
          t("concepts", cId, "summary") ||
          t("concepts", cIdDash, "summary") ||
          c.summary;
        html +=
          '<div class="concept-card" data-concept="' +
          c.name.toLowerCase() +
          '">' +
          '<div class="concept-card-header">' +
          '<span class="concept-name">' +
          cName +
          "</span>" +
          '<span class="concept-role">' +
          cRole +
          "</span></div>" +
          '<div class="concept-summary">' +
          cSummary +
          "</div></div>";
      });

      if (page.domain) {
        html += '<dl class="rail-page-meta">';
        html += "<dt>Domain</dt><dd>" + page.domain + "</dd>";
        if (page.contributions) {
          html +=
            "<dt>Outgoing links</dt><dd>" +
            page.contributions.length +
            " pages</dd>";
        }
        html += "</dl>";
      }

      rail.innerHTML = html;

      rail.querySelectorAll(".concept-card").forEach(function (card) {
        card.style.cursor = "pointer";
        card.addEventListener("click", function () {
          var name = card.dataset.concept;
          var concept = page.concepts.find(function (c) {
            return c.name.toLowerCase() === name;
          });
          if (concept) showFullReplace(concept);
        });
      });

      highlightKeywords(page.concepts);
    }

    // === Concept full-replace view ===
    function showFullReplace(concept) {
      var savedScroll = window.scrollY;
      var cId = concept.name.toLowerCase();
      var cIdDash = cId.replace(/\s+/g, "-");

      var richConcept = wiki.concepts
        ? wiki.concepts[cId] || wiki.concepts[cIdDash]
        : null;

      var cName =
        t("concepts", cId, "name") ||
        t("concepts", cIdDash, "name") ||
        concept.name;
      var cRole =
        t("concepts", cId, "role") ||
        t("concepts", cIdDash, "role") ||
        concept.role;

      var bodyHTML = "";
      if (richConcept) {
        var def =
          t("concepts", cId, "definition") ||
          t("concepts", cIdDash, "definition") ||
          richConcept.definition;
        var examples =
          t("concepts", cId, "examples") ||
          t("concepts", cIdDash, "examples") ||
          richConcept.examples;
        bodyHTML += '<p class="cfr-definition">' + def + "</p>";

        if (examples) {
          bodyHTML +=
            '<hr class="cfr-divider"><h3>' +
            L("examples") +
            "</h3>" +
            '<div class="cfr-examples">' +
            examples +
            "</div>";
        }

        if (richConcept.related && richConcept.related.length > 0) {
          bodyHTML +=
            '<hr class="cfr-divider"><h3>' +
            L("relatedConcepts") +
            "</h3><p>" +
            richConcept.related
              .map(function (r) {
                return '<span class="cfr-related-tag">' + r + "</span>";
              })
              .join(" ") +
            "</p>";
        }

        if (richConcept.usedIn && richConcept.usedIn.length > 0) {
          bodyHTML +=
            '<hr class="cfr-divider"><h3>' +
            L("appearsIn") +
            "</h3><ul>";
          richConcept.usedIn.forEach(function (pid) {
            var pg = wiki.pages[pid];
            if (pg) {
              var pTitle = t("pages", pid, "title") || pg.title;
              bodyHTML +=
                '<li><a class="cfr-page-link" data-page="' +
                pid +
                '">' +
                pTitle +
                "</a></li>";
            }
          });
          bodyHTML += "</ul>";
        }

        if (richConcept.sources && richConcept.sources.length > 0) {
          bodyHTML +=
            '<hr class="cfr-divider"><h3>' +
            L("sources") +
            '</h3><ul class="cfr-sources">';
          richConcept.sources.forEach(function (s) {
            bodyHTML +=
              '<li><a href="' +
              s.url +
              '" target="_blank" rel="noopener">' +
              s.label +
              "</a></li>";
          });
          bodyHTML += "</ul>";
        }
      } else {
        var summary =
          t("concepts", cId, "summary") ||
          t("concepts", cIdDash, "summary") ||
          concept.summary;
        bodyHTML +=
          '<p class="cfr-definition">' +
          summary +
          "</p>" +
          '<hr class="cfr-divider">' +
          '<p style="color:var(--c-text-tertiary);font-style:italic;">' +
          L("richConceptNone") +
          "</p>";
      }

      main.innerHTML =
        '<div class="concept-full-replace">' +
        '<div class="cfr-back" id="cfr-back">' +
        L("backToArticle") +
        "</div>" +
        '<div class="cfr-name">' +
        cName +
        "</div>" +
        '<div class="cfr-role">' +
        cRole +
        "</div>" +
        '<div class="cfr-body">' +
        bodyHTML +
        "</div></div>";

      main.style.background = "#f0fdf4";
      window.scrollTo(0, 0);

      function goBack() {
        main.style.background = "";
        renderPage();
        renderRail();
        requestAnimationFrame(function () {
          window.scrollTo(0, savedScroll);
        });
      }

      main.querySelector("#cfr-back").addEventListener("click", goBack);
      main.querySelectorAll(".cfr-page-link").forEach(function (link) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          main.style.background = "";
          navigate(link.dataset.page);
        });
      });
      document.addEventListener("keydown", function esc(e) {
        if (e.key === "Escape") {
          goBack();
          document.removeEventListener("keydown", esc);
        }
      });
    }

    // === Keyword highlighting + connection lines ===
    function highlightKeywords(concepts) {
      var body = main.querySelector(".article-body");
      if (!body) return;

      var conceptNames = concepts.map(function (c) {
        return c.name;
      });

      var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          var parent = node.parentElement;
          if (parent.closest("pre, code, .concept-keyword"))
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });

      var textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);

      var pattern = new RegExp(
        "\\b(" +
          conceptNames
            .map(function (n) {
              return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            })
            .join("|") +
          ")\\b",
        "gi"
      );

      textNodes.forEach(function (node) {
        if (!pattern.test(node.textContent)) return;
        pattern.lastIndex = 0;

        var frag = document.createDocumentFragment();
        var lastIdx = 0;
        var match;

        while ((match = pattern.exec(node.textContent)) !== null) {
          if (match.index > lastIdx) {
            frag.appendChild(
              document.createTextNode(
                node.textContent.slice(lastIdx, match.index)
              )
            );
          }
          var span = document.createElement("span");
          span.className = "concept-keyword";
          span.textContent = match[0];
          span.dataset.concept = match[0].toLowerCase();
          frag.appendChild(span);
          lastIdx = pattern.lastIndex;
        }
        if (lastIdx < node.textContent.length) {
          frag.appendChild(
            document.createTextNode(node.textContent.slice(lastIdx))
          );
        }
        node.parentNode.replaceChild(frag, node);
      });

      var getCards = function () {
        return rail.querySelectorAll(".concept-card");
      };

      function promoteCard(name) {
        var cards = getCards();
        cards.forEach(function (card) {
          card.classList.remove("highlight", "promoting");
        });
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          if (card.dataset.concept === name) {
            card.classList.add("highlight", "promoting");
            var header = rail.querySelector(".rail-header");
            if (header && header.nextSibling !== card) {
              setTimeout(function () {
                header.after(card);
                card.scrollIntoView({ block: "nearest", behavior: "smooth" });
              }, 450);
            }
            setTimeout(function () {
              card.classList.remove("promoting");
            }, 1000);
            break;
          }
        }
      }

      // SVG overlay for connection lines
      var svgOverlay = document.querySelector(".connection-overlay");
      if (!svgOverlay) {
        svgOverlay = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svgOverlay.classList.add("connection-overlay");
        document.body.appendChild(svgOverlay);
      }

      function drawConnection(kwEl, cardEl) {
        clearConnections();
        if (!kwEl || !cardEl) return;
        var kwRect = kwEl.getBoundingClientRect();
        var cardRect = cardEl.getBoundingClientRect();
        var x1 = kwRect.right + 4;
        var y1 = kwRect.top + kwRect.height / 2;
        var x2 = cardRect.left - 4;
        var y2 = cardRect.top + cardRect.height / 2;
        var midX = (x1 + x2) / 2;

        var path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        path.setAttribute(
          "d",
          "M " +
            x1 +
            " " +
            y1 +
            " L " +
            midX +
            " " +
            y1 +
            " L " +
            midX +
            " " +
            y2 +
            " L " +
            x2 +
            " " +
            y2
        );
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "rgba(59, 130, 246, 0.55)");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("stroke-dasharray", "6 3");
        path.style.filter = "drop-shadow(0 0 3px rgba(59, 130, 246, 0.25))";
        svgOverlay.appendChild(path);

        [
          { cx: x1, cy: y1 },
          { cx: x2, cy: y2 },
        ].forEach(function (pt) {
          var dot = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
          );
          dot.setAttribute("cx", pt.cx);
          dot.setAttribute("cy", pt.cy);
          dot.setAttribute("r", "3");
          svgOverlay.appendChild(dot);
        });
      }

      function clearConnections() {
        while (svgOverlay.firstChild)
          svgOverlay.removeChild(svgOverlay.firstChild);
      }

      main.querySelectorAll(".concept-keyword").forEach(function (kw) {
        kw.addEventListener("click", function () {
          var name = kw.dataset.concept;
          promoteCard(name);
          setTimeout(function () {
            var card = rail.querySelector(
              '.concept-card[data-concept="' + name + '"]'
            );
            drawConnection(kw, card);
          }, 300);
        });
        kw.addEventListener("mouseenter", function () {
          var name = kw.dataset.concept;
          var card = rail.querySelector(
            '.concept-card[data-concept="' + name + '"]'
          );
          if (card) {
            card.classList.add("highlight");
            drawConnection(kw, card);
          }
        });
        kw.addEventListener("mouseleave", function () {
          getCards().forEach(function (card) {
            card.classList.remove("highlight");
          });
          clearConnections();
        });
      });

      getCards().forEach(function (card) {
        card.addEventListener("mouseenter", function () {
          var name = card.dataset.concept;
          card.classList.add("highlight");
          var keywords = main.querySelectorAll(
            '.concept-keyword[data-concept="' + name + '"]'
          );
          keywords.forEach(function (kw) {
            kw.style.background = "#dbeafe";
          });
          if (keywords.length > 0) drawConnection(keywords[0], card);
        });
        card.addEventListener("mouseleave", function () {
          card.classList.remove("highlight");
          main.querySelectorAll(".concept-keyword").forEach(function (kw) {
            kw.style.background = "";
          });
          clearConnections();
        });
      });
    }

    // === Full-text search ===
    function buildSearchIndex() {
      var index = [];
      Object.keys(wiki.pages).forEach(function (id) {
        var page = wiki.pages[id];
        if (page.type === "index") return;
        var title = t("pages", id, "title") || page.title;
        var subtitle = t("pages", id, "subtitle") || page.subtitle || "";
        var bodyText = t("pages", id, "body") || page.body || "";
        var plainBody = bodyText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
        index.push({
          type: "page",
          id: id,
          title: title,
          text: title + " " + subtitle + " " + plainBody,
          subtitle: subtitle,
          domain: page.domain || "",
        });
      });
      if (wiki.concepts) {
        Object.keys(wiki.concepts).forEach(function (id) {
          var concept = wiki.concepts[id];
          var name = t("concepts", id, "name") || concept.name;
          var summary = t("concepts", id, "summary") || concept.summary || "";
          var definition =
            t("concepts", id, "definition") || concept.definition || "";
          var plainDef = definition
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ");
          index.push({
            type: "concept",
            id: id,
            title: name,
            text: name + " " + summary + " " + plainDef,
            subtitle: summary,
            pageLinks: concept.usedIn || [],
          });
        });
      }
      return index;
    }

    function searchQuery(query, index) {
      if (!query.trim()) return [];
      var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      var results = [];
      index.forEach(function (entry) {
        var text = entry.text.toLowerCase();
        var score = 0;
        var allMatch = true;
        terms.forEach(function (term) {
          var titleLower = entry.title.toLowerCase();
          if (titleLower === term) score += 100;
          else if (titleLower.includes(term)) score += 50;
          else if (text.includes(term)) score += 10;
          else if (term.length > 3 && fuzzyMatch(text, term)) score += 5;
          else allMatch = false;
        });
        if (allMatch && score > 0) results.push(Object.assign({}, entry, { score: score }));
      });
      results.sort(function (a, b) {
        return b.score - a.score;
      });
      return results.slice(0, 20);
    }

    function fuzzyMatch(text, term) {
      for (var i = 0; i <= text.length - term.length; i++) {
        var diffs = 0;
        for (var j = 0; j < term.length; j++) {
          if (text[i + j] !== term[j]) diffs++;
          if (diffs > 1) break;
        }
        if (diffs <= 1) return true;
      }
      return false;
    }

    function getSnippet(text, query, maxLen) {
      maxLen = maxLen || 120;
      var plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      var lower = plain.toLowerCase();
      var bestPos = 0;
      for (var i = 0; i < terms.length; i++) {
        var idx = lower.indexOf(terms[i]);
        if (idx !== -1) {
          bestPos = idx;
          break;
        }
      }
      var start = Math.max(0, bestPos - 30);
      var end = Math.min(plain.length, start + maxLen);
      var snippet = plain.slice(start, end).trim();
      if (start > 0) snippet = "..." + snippet;
      if (end < plain.length) snippet += "...";
      terms.forEach(function (term) {
        var regex = new RegExp(
          "(" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")",
          "gi"
        );
        snippet = snippet.replace(regex, "<mark>$1</mark>");
      });
      return snippet;
    }

    function showSearchResults(query) {
      if (!searchIndex) searchIndex = buildSearchIndex();
      if (!query.trim()) {
        renderPage();
        renderRail();
        return;
      }
      var results = searchQuery(query, searchIndex);

      if (features.conceptRail) {
        rail.innerHTML =
          '<div class="rail-header">' +
          L("search") +
          "</div>" +
          '<div class="rail-empty">' +
          results.length +
          " " +
          L("results") +
          "</div>";
      }

      if (results.length === 0) {
        main.innerHTML =
          '<div class="search-results-page">' +
          '<h1 class="article-title">' +
          L("searchResults") +
          "</h1>" +
          '<p class="search-query-label">"' +
          escapeHtml(query) +
          '"</p>' +
          '<div class="search-no-results"><p>' +
          L("noResults") +
          "</p>" +
          '<p style="color:var(--c-text-tertiary);font-size:0.875rem;">' +
          L("noResultsHint") +
          "</p></div></div>";
        return;
      }

      var html =
        '<div class="search-results-page">' +
        '<h1 class="article-title">' +
        L("searchResults") +
        "</h1>" +
        '<p class="search-query-label">"' +
        escapeHtml(query) +
        '" &mdash; ' +
        results.length +
        " " +
        L("matches") +
        "</p>" +
        '<div class="search-results-list">';

      results.forEach(function (r) {
        var icon = r.type === "page" ? "\ud83d\udcc4" : "\ud83d\udca1";
        var snippet = getSnippet(r.text, query, 200);
        var meta = r.type === "page" ? r.domain : L("concept");
        html +=
          '<div class="search-result-card" data-type="' +
          r.type +
          '" data-id="' +
          r.id +
          '">' +
          '<div class="search-result-card-header">' +
          '<span class="search-result-icon">' +
          icon +
          "</span>" +
          '<span class="search-result-title">' +
          r.title +
          "</span>" +
          '<span class="search-result-badge">' +
          meta +
          "</span></div>" +
          '<div class="search-result-body">' +
          snippet +
          "</div></div>";
      });

      html += "</div></div>";
      main.innerHTML = html;

      main.querySelectorAll(".search-result-card").forEach(function (el) {
        el.addEventListener("click", function () {
          var type = el.dataset.type;
          var id = el.dataset.id;
          document.getElementById("nav-search-input").value = "";
          if (type === "page") {
            navigate(id);
          } else {
            var concept = wiki.concepts && wiki.concepts[id];
            if (concept && concept.usedIn && concept.usedIn.length > 0) {
              navigate(concept.usedIn[0]);
            }
          }
        });
      });
    }

    function escapeHtml(str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    // === Public API ===
    return {
      navigate: navigate,
      onNavigate: function (cb) {
        onNavigateCb = cb;
      },
      start: function () {
        nav = container.querySelector(".taxonomy-nav") || document.getElementById("taxonomy-nav");
        main = container.querySelector(".article-area") || document.getElementById("article-area");
        rail = container.querySelector(".concept-rail") || document.getElementById("concept-rail");

        // Ctrl+K shortcut
        document.addEventListener("keydown", function (e) {
          if ((e.ctrlKey || e.metaKey) && e.key === "k") {
            e.preventDefault();
            var input = document.getElementById("nav-search-input");
            if (input) {
              input.focus();
              input.select();
            }
          }
        });

        navigate("index");
      },
      getCurrentPage: function () {
        return currentPage;
      },
      getData: function () {
        return wiki;
      },
    };
  }

  return { create: create };
})();
