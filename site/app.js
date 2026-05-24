(function () {
  const nav = document.getElementById("taxonomy-nav");
  const main = document.getElementById("article-area");
  const rail = document.getElementById("concept-rail");

  let currentPage = "index";

  function navigate(pageId) {
    currentPage = pageId;
    renderNav();
    renderPage();
    renderRail();
    window.scrollTo(0, 0);
  }

  // === Taxonomy Navigation ===

  function renderNav() {
    const expanded = {};
    nav.querySelectorAll(".nav-domain.expanded").forEach((el) => {
      expanded[el.dataset.domain] = true;
    });
    for (const domain of WIKI.taxonomy) {
      if (domain.children.some((c) => c.id === currentPage)) {
        expanded[domain.id] = true;
      }
    }

    let html = `
      <div class="nav-brand" id="nav-home">
        <div class="nav-brand-icon">SB</div>
        <div class="nav-brand-text">Super Brain</div>
      </div>
      <input type="search" class="nav-search" placeholder="Search pages..." id="nav-search-input" />
      <div class="nav-section-label">Knowledge Domains</div>
      <ul class="nav-tree">`;

    for (const domain of WIKI.taxonomy) {
      const isExpanded = expanded[domain.id];
      html += `<li>`;
      html += `<div class="nav-domain${isExpanded ? " expanded" : ""}" data-domain="${domain.id}">`;
      html += `<span class="chevron">▸</span>${domain.label}`;
      html += `</div>`;
      html += `<ul class="nav-children${isExpanded ? " open" : ""}">`;
      for (const child of domain.children) {
        const active = child.id === currentPage ? " active" : "";
        html += `<li><a class="nav-page${active}" data-page="${child.id}">${child.label}</a></li>`;
      }
      html += `</ul></li>`;
    }
    html += `</ul>`;
    nav.innerHTML = html;

    document.getElementById("nav-home").addEventListener("click", () => navigate("index"));
    nav.querySelectorAll(".nav-domain").forEach((el) => {
      el.addEventListener("click", () => {
        el.classList.toggle("expanded");
        el.nextElementSibling.classList.toggle("open");
      });
    });
    nav.querySelectorAll(".nav-page").forEach((el) => {
      el.addEventListener("click", () => navigate(el.dataset.page));
    });

    const searchInput = document.getElementById("nav-search-input");
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      nav.querySelectorAll(".nav-page").forEach((el) => {
        const match = el.textContent.toLowerCase().includes(q);
        el.style.display = match || !q ? "" : "none";
      });
      if (q) {
        nav.querySelectorAll(".nav-children").forEach((el) => el.classList.add("open"));
        nav.querySelectorAll(".nav-domain").forEach((el) => el.classList.add("expanded"));
      }
    });
  }

  // === Page Rendering ===

  function renderPage() {
    const page = WIKI.pages[currentPage];
    if (!page) {
      main.innerHTML = `<p style="color:var(--c-text-tertiary)">Page not found.</p>`;
      return;
    }
    if (page.type === "index") {
      renderIndex(page);
    } else {
      renderArticle(page);
    }
  }

  function renderIndex(page) {
    let html = `<div class="index-hero">`;
    html += `<h1 class="article-title">${page.title}</h1>`;
    html += `<p class="article-subtitle">${page.subtitle}</p>`;
    html += `</div>`;

    for (const domain of WIKI.taxonomy) {
      const domainPages = domain.children.filter((c) => WIKI.pages[c.id]);
      if (domainPages.length === 0) continue;

      html += `<div class="index-section-label">${domain.label}</div>`;
      html += `<div class="index-grid">`;
      for (const child of domainPages) {
        const p = WIKI.pages[child.id];
        html += `<div class="index-card" data-page="${child.id}">`;
        html += `<div class="index-card-title">${p.title}</div>`;
        html += `<div class="index-card-desc">${p.subtitle}</div>`;
        html += `</div>`;
      }
      html += `</div>`;
    }
    main.innerHTML = html;

    main.querySelectorAll(".index-card").forEach((el) => {
      el.addEventListener("click", () => navigate(el.dataset.page));
    });
  }

  function renderArticle(page) {
    let html = "";

    if (page.domain) {
      html += `<div class="article-breadcrumb">`;
      html += `<span class="bc-domain">${page.domain}</span>`;
      html += `<span class="bc-sep">/</span>`;
      html += `<span class="bc-current">${page.title}</span>`;
      html += `</div>`;
    }

    html += `<h1 class="article-title">${page.title}</h1>`;
    html += `<p class="article-subtitle">${page.subtitle}</p>`;

    if (page.meta) {
      html += `<div class="article-meta">`;
      for (const m of page.meta) {
        html += `<div class="meta-item">`;
        if (m.dot) html += `<span class="meta-dot" style="background:${m.dot}"></span>`;
        html += `${m.text}</div>`;
      }
      html += `</div>`;
    }

    html += `<div class="article-body">${page.body}</div>`;

    // Outgoing contributions
    if (page.contributions && page.contributions.length > 0) {
      html += `<div class="article-contributions">`;
      html += `<h2>Contributes to</h2>`;
      for (const c of page.contributions) {
        const target = WIKI.pages[c.target];
        const label = target ? target.title : c.target;
        html += `<div class="contribution-card" data-page="${c.target}">`;
        html += `<div class="contribution-source">${label}</div>`;
        html += `<div class="contribution-text">${c.text}</div>`;
        html += `</div>`;
      }
      html += `</div>`;
    }

    // Incoming contributions
    const incoming = [];
    for (const [id, p] of Object.entries(WIKI.pages)) {
      if (p.contributions) {
        for (const c of p.contributions) {
          if (c.target === currentPage) {
            incoming.push({ source: id, text: c.text, label: p.title });
          }
        }
      }
    }
    if (incoming.length > 0) {
      html += `<div class="article-contributions">`;
      html += `<h2>Contributions from</h2>`;
      for (const c of incoming) {
        html += `<div class="contribution-card" data-page="${c.source}">`;
        html += `<div class="contribution-source">${c.label}</div>`;
        html += `<div class="contribution-text">${c.text}</div>`;
        html += `</div>`;
      }
      html += `</div>`;
    }

    main.innerHTML = html;
    main.querySelectorAll(".contribution-card").forEach((el) => {
      el.addEventListener("click", () => navigate(el.dataset.page));
    });
  }

  // === Concept Rail ===

  function renderRail() {
    const page = WIKI.pages[currentPage];

    if (!page || page.type === "index") {
      rail.innerHTML = `
        <div class="rail-header">Concepts</div>
        <div class="rail-empty">Navigate to an article to see<br/>its concept layer here.</div>`;
      return;
    }

    if (!page.concepts || page.concepts.length === 0) {
      rail.innerHTML = `
        <div class="rail-header">Concepts</div>
        <div class="rail-empty">No concepts defined for this article yet.</div>`;
      return;
    }

    let html = `<div class="rail-header">Concept Layer &mdash; ${page.title}</div>`;

    for (const c of page.concepts) {
      html += `<div class="concept-card" data-concept="${c.name.toLowerCase()}">`;
      html += `<div class="concept-card-header">`;
      html += `<span class="concept-name">${c.name}</span>`;
      html += `<span class="concept-role">${c.role}</span>`;
      html += `</div>`;
      html += `<div class="concept-summary">${c.summary}</div>`;
      html += `</div>`;
    }

    if (page.domain) {
      html += `<dl class="rail-page-meta">`;
      html += `<dt>Domain</dt><dd>${page.domain}</dd>`;
      if (page.contributions) {
        html += `<dt>Outgoing links</dt><dd>${page.contributions.length} pages</dd>`;
      }
      html += `</dl>`;
    }

    rail.innerHTML = html;

    // Concept card click → expand in Replace mode
    rail.querySelectorAll(".concept-card").forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        const name = card.dataset.concept;
        const concept = page.concepts.find((c) => c.name.toLowerCase() === name);
        if (concept) showFullReplace(concept);
      });
    });

    highlightKeywords(page.concepts);
  }

  function closeExpansions() {
    const placeholder = main.querySelector(".concept-full-replace");
    if (placeholder) navigate(currentPage);
  }

  function showFullReplace(concept) {
    closeExpansions();
    const savedScroll = window.scrollY;

    // Look up rich concept data
    const richConcept = WIKI.concepts
      ? WIKI.concepts[concept.name.toLowerCase()] || WIKI.concepts[concept.name.toLowerCase().replace(/\s+/g, "-")]
      : null;

    let bodyHTML = "";
    if (richConcept) {
      bodyHTML += `<p class="cfr-definition">${richConcept.definition}</p>`;

      if (richConcept.examples) {
        bodyHTML += `<hr class="cfr-divider"><h3>Examples</h3>`;
        bodyHTML += `<div class="cfr-examples">${richConcept.examples}</div>`;
      }

      if (richConcept.related && richConcept.related.length > 0) {
        bodyHTML += `<hr class="cfr-divider"><h3>Related concepts</h3>`;
        bodyHTML += `<p>${richConcept.related.map((r) => `<span class="cfr-related-tag">${r}</span>`).join(" ")}</p>`;
      }

      if (richConcept.usedIn && richConcept.usedIn.length > 0) {
        bodyHTML += `<hr class="cfr-divider"><h3>Appears in</h3>`;
        bodyHTML += `<ul>`;
        for (const pid of richConcept.usedIn) {
          const page = WIKI.pages[pid];
          if (page) bodyHTML += `<li><a class="cfr-page-link" data-page="${pid}">${page.title}</a></li>`;
        }
        bodyHTML += `</ul>`;
      }

      if (richConcept.sources && richConcept.sources.length > 0) {
        bodyHTML += `<hr class="cfr-divider"><h3>Sources</h3>`;
        bodyHTML += `<ul class="cfr-sources">`;
        for (const s of richConcept.sources) {
          bodyHTML += `<li><a href="${s.url}" target="_blank" rel="noopener">${s.label}</a></li>`;
        }
        bodyHTML += `</ul>`;
      }
    } else {
      bodyHTML += `<p class="cfr-definition">${concept.summary}</p>`;
      bodyHTML += `<hr class="cfr-divider">`;
      bodyHTML += `<p style="color:var(--c-text-tertiary);font-style:italic;">Detailed concept content not yet available. This concept will be expanded as the knowledge base grows.</p>`;
    }

    main.innerHTML = `
      <div class="concept-full-replace">
        <div class="cfr-back" id="cfr-back">← Back to article</div>
        <div class="cfr-name">${concept.name}</div>
        <div class="cfr-role">${concept.role}</div>
        <div class="cfr-body">${bodyHTML}</div>
      </div>
    `;

    main.style.background = "#f0fdf4";
    window.scrollTo(0, 0);

    function goBack() {
      main.style.background = "";
      renderPage();
      renderRail();
      requestAnimationFrame(() => window.scrollTo(0, savedScroll));
    }

    main.querySelector("#cfr-back").addEventListener("click", goBack);
    main.querySelectorAll(".cfr-page-link").forEach((link) => {
      link.addEventListener("click", (e) => {
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

  function highlightKeywords(concepts) {
    const body = main.querySelector(".article-body");
    if (!body) return;

    const conceptNames = concepts.map((c) => c.name);

    // Walk text nodes and wrap concept names with highlight spans
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (parent.closest("pre, code, .concept-keyword")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    const pattern = new RegExp(
      `\\b(${conceptNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
      "gi"
    );

    for (const node of textNodes) {
      if (!pattern.test(node.textContent)) continue;
      pattern.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let lastIdx = 0;
      let match;

      while ((match = pattern.exec(node.textContent)) !== null) {
        if (match.index > lastIdx) {
          frag.appendChild(document.createTextNode(node.textContent.slice(lastIdx, match.index)));
        }
        const span = document.createElement("span");
        span.className = "concept-keyword";
        span.textContent = match[0];
        span.dataset.concept = match[0].toLowerCase();
        frag.appendChild(span);
        lastIdx = pattern.lastIndex;
      }
      if (lastIdx < node.textContent.length) {
        frag.appendChild(document.createTextNode(node.textContent.slice(lastIdx)));
      }
      node.parentNode.replaceChild(frag, node);
    }

    // LRU-style reorder: click a keyword → promote its concept card to top
    const railList = rail;
    const getCards = () => rail.querySelectorAll(".concept-card");

    function promoteCard(name) {
      const cards = getCards();
      cards.forEach((card) => card.classList.remove("highlight", "promoting"));
      for (const card of cards) {
        if (card.dataset.concept === name) {
          card.classList.add("highlight", "promoting");
          const header = rail.querySelector(".rail-header");
          if (header && header.nextSibling !== card) {
            setTimeout(() => {
              header.after(card);
              card.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }, 450);
          }
          setTimeout(() => card.classList.remove("promoting"), 1000);
          break;
        }
      }
    }

    // SVG overlay for connection lines
    let svgOverlay = document.querySelector(".connection-overlay");
    if (!svgOverlay) {
      svgOverlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svgOverlay.classList.add("connection-overlay");
      document.body.appendChild(svgOverlay);
    }

    function drawConnection(kwEl, cardEl) {
      clearConnections();
      if (!kwEl || !cardEl) return;

      const kwRect = kwEl.getBoundingClientRect();
      const cardRect = cardEl.getBoundingClientRect();

      const x1 = kwRect.right + 4;
      const y1 = kwRect.top + kwRect.height / 2;
      const x2 = cardRect.left - 4;
      const y2 = cardRect.top + cardRect.height / 2;

      // Draw elbow line (horizontal → vertical → horizontal)
      const midX = (x1 + x2) / 2;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "rgba(59, 130, 246, 0.55)");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("stroke-dasharray", "6 3");
      path.style.filter = "drop-shadow(0 0 3px rgba(59, 130, 246, 0.25))";
      svgOverlay.appendChild(path);

      // Dots at endpoints
      const dot1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot1.setAttribute("cx", x1);
      dot1.setAttribute("cy", y1);
      dot1.setAttribute("r", "3");
      svgOverlay.appendChild(dot1);

      const dot2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot2.setAttribute("cx", x2);
      dot2.setAttribute("cy", y2);
      dot2.setAttribute("r", "3");
      svgOverlay.appendChild(dot2);
    }

    function clearConnections() {
      while (svgOverlay.firstChild) svgOverlay.removeChild(svgOverlay.firstChild);
    }

    // Keyword click → promote + draw line
    main.querySelectorAll(".concept-keyword").forEach((kw) => {
      kw.addEventListener("click", () => {
        const name = kw.dataset.concept;
        promoteCard(name);
        setTimeout(() => {
          const card = rail.querySelector(`.concept-card[data-concept="${name}"]`);
          drawConnection(kw, card);
        }, 300);
      });
      kw.addEventListener("mouseenter", () => {
        const name = kw.dataset.concept;
        const card = rail.querySelector(`.concept-card[data-concept="${name}"]`);
        if (card) {
          card.classList.add("highlight");
          drawConnection(kw, card);
        }
      });
      kw.addEventListener("mouseleave", () => {
        getCards().forEach((card) => card.classList.remove("highlight"));
        clearConnections();
      });
    });

    // Concept card hover → highlight keywords + draw line to first keyword
    getCards().forEach((card) => {
      card.addEventListener("mouseenter", () => {
        const name = card.dataset.concept;
        card.classList.add("highlight");
        const keywords = main.querySelectorAll(`.concept-keyword[data-concept="${name}"]`);
        keywords.forEach((kw) => { kw.style.background = "#dbeafe"; });
        if (keywords.length > 0) drawConnection(keywords[0], card);
      });
      card.addEventListener("mouseleave", () => {
        card.classList.remove("highlight");
        main.querySelectorAll(".concept-keyword").forEach((kw) => {
          kw.style.background = "";
        });
        clearConnections();
      });
    });
  }

  // === Init ===
  navigate("index");
})();
