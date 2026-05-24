(function () {
  const nav = document.getElementById("taxonomy-nav");
  const main = document.getElementById("article-area");
  const rail = document.getElementById("concept-rail");

  let currentPage = "index";
  let lang = localStorage.getItem("sb-lang") || "en";

  // Translation helper — returns CN override if available, otherwise EN original
  function t(section, id, field) {
    if (lang === "cn" && typeof WIKI_CN !== "undefined") {
      const cnSection = WIKI_CN[section];
      if (cnSection && cnSection[id] && cnSection[id][field] !== undefined) {
        return cnSection[id][field];
      }
    }
    return WIKI[section]?.[id]?.[field];
  }

  function tTaxonomy(domainId, childId) {
    if (lang === "cn" && typeof WIKI_CN !== "undefined" && WIKI_CN.taxonomy) {
      const d = WIKI_CN.taxonomy.find(x => x.id === domainId);
      if (d) {
        if (!childId) return d.label;
        const c = d.children?.find(x => x.id === childId);
        if (c) return c.label;
      }
    }
    const d = WIKI.taxonomy.find(x => x.id === domainId);
    if (!d) return "";
    if (!childId) return d.label;
    return d.children?.find(x => x.id === childId)?.label || "";
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
      <div class="nav-lang-toggle">
        <button class="lang-btn${lang === 'en' ? ' active' : ''}" data-lang="en">EN</button>
        <button class="lang-btn${lang === 'cn' ? ' active' : ''}" data-lang="cn">中文</button>
      </div>
      <input type="search" class="nav-search" placeholder="${lang === 'cn' ? '搜索 (Ctrl+K)...' : 'Search (Ctrl+K)...'}" id="nav-search-input" />
      <div class="nav-section-label">${lang === 'cn' ? '知识领域' : 'Knowledge Domains'}</div>
      <ul class="nav-tree">`;

    for (const domain of WIKI.taxonomy) {
      const isExpanded = expanded[domain.id];
      html += `<li>`;
      html += `<div class="nav-domain${isExpanded ? " expanded" : ""}" data-domain="${domain.id}">`;
      html += `<span class="chevron">▸</span>${tTaxonomy(domain.id)}`;
      html += `</div>`;
      html += `<ul class="nav-children${isExpanded ? " open" : ""}">`;
      for (const child of domain.children) {
        const active = child.id === currentPage ? " active" : "";
        html += `<li><a class="nav-page${active}" data-page="${child.id}">${tTaxonomy(domain.id, child.id)}</a></li>`;
      }
      html += `</ul></li>`;
    }
    html += `</ul>`;
    nav.innerHTML = html;

    document.getElementById("nav-home").addEventListener("click", () => navigate("index"));
    nav.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
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
      // Filter nav items
      nav.querySelectorAll(".nav-page").forEach((el) => {
        const match = el.textContent.toLowerCase().includes(q);
        el.style.display = match || !q ? "" : "none";
      });
      if (q) {
        nav.querySelectorAll(".nav-children").forEach((el) => el.classList.add("open"));
        nav.querySelectorAll(".nav-domain").forEach((el) => el.classList.add("expanded"));
      }
      // Full-text search: show results in main area
      if (e.target.value.trim()) {
        showSearchResults(e.target.value);
      } else {
        renderPage();
        renderRail();
      }
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        searchInput.blur();
        renderPage();
        renderRail();
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
    const title = t("pages", "index", "title") || page.title;
    const subtitle = t("pages", "index", "subtitle") || page.subtitle;
    let html = `<div class="index-hero">`;
    html += `<h1 class="article-title">${title}</h1>`;
    html += `<p class="article-subtitle">${subtitle}</p>`;
    html += `</div>`;

    for (const domain of WIKI.taxonomy) {
      const domainPages = domain.children.filter((c) => WIKI.pages[c.id]);
      if (domainPages.length === 0) continue;

      html += `<div class="index-section-label">${tTaxonomy(domain.id)}</div>`;
      html += `<div class="index-grid">`;
      for (const child of domainPages) {
        const p = WIKI.pages[child.id];
        const pTitle = t("pages", child.id, "title") || p.title;
        const pSubtitle = t("pages", child.id, "subtitle") || p.subtitle;
        html += `<div class="index-card" data-page="${child.id}">`;
        html += `<div class="index-card-title">${pTitle}</div>`;
        html += `<div class="index-card-desc">${pSubtitle}</div>`;
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
    const pageId = currentPage;
    const title = t("pages", pageId, "title") || page.title;
    const subtitle = t("pages", pageId, "subtitle") || page.subtitle;
    const body = t("pages", pageId, "body") || page.body;
    let html = "";

    if (page.domain) {
      html += `<div class="article-breadcrumb">`;
      html += `<span class="bc-domain">${page.domain}</span>`;
      html += `<span class="bc-sep">/</span>`;
      html += `<span class="bc-current">${title}</span>`;
      html += `</div>`;
    }

    html += `<h1 class="article-title">${title}</h1>`;
    html += `<p class="article-subtitle">${subtitle}</p>`;

    if (page.meta) {
      html += `<div class="article-meta">`;
      for (const m of page.meta) {
        html += `<div class="meta-item">`;
        if (m.dot) html += `<span class="meta-dot" style="background:${m.dot}"></span>`;
        html += `${m.text}</div>`;
      }
      html += `</div>`;
    }

    html += `<div class="article-body">${body}</div>`;

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
        <div class="rail-header">${lang === 'cn' ? '概念' : 'Concepts'}</div>
        <div class="rail-empty">${lang === 'cn' ? '打开一篇文章以查看<br/>其概念层。' : 'Navigate to an article to see<br/>its concept layer here.'}</div>`;
      return;
    }

    if (!page.concepts || page.concepts.length === 0) {
      rail.innerHTML = `
        <div class="rail-header">${lang === 'cn' ? '概念' : 'Concepts'}</div>
        <div class="rail-empty">${lang === 'cn' ? '本文章尚未定义概念。' : 'No concepts defined for this article yet.'}</div>`;
      return;
    }

    const pageTitle = t("pages", currentPage, "title") || page.title;
    let html = `<div class="rail-header">${lang === 'cn' ? '概念层' : 'Concept Layer'} &mdash; ${pageTitle}</div>`;

    for (const c of page.concepts) {
      const cId = c.name.toLowerCase();
      const cName = t("concepts", cId, "name") || t("concepts", cId.replace(/\s+/g, "-"), "name") || c.name;
      const cRole = t("concepts", cId, "role") || t("concepts", cId.replace(/\s+/g, "-"), "role") || c.role;
      const cSummary = t("concepts", cId, "summary") || t("concepts", cId.replace(/\s+/g, "-"), "summary") || c.summary;
      html += `<div class="concept-card" data-concept="${c.name.toLowerCase()}">`;
      html += `<div class="concept-card-header">`;
      html += `<span class="concept-name">${cName}</span>`;
      html += `<span class="concept-role">${cRole}</span>`;
      html += `</div>`;
      html += `<div class="concept-summary">${cSummary}</div>`;
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

    const cId = concept.name.toLowerCase();
    const cIdDash = cId.replace(/\s+/g, "-");

    // Look up rich concept data
    const richConcept = WIKI.concepts
      ? WIKI.concepts[cId] || WIKI.concepts[cIdDash]
      : null;

    const cName = t("concepts", cId, "name") || t("concepts", cIdDash, "name") || concept.name;
    const cRole = t("concepts", cId, "role") || t("concepts", cIdDash, "role") || concept.role;

    let bodyHTML = "";
    if (richConcept) {
      const def = t("concepts", cId, "definition") || t("concepts", cIdDash, "definition") || richConcept.definition;
      const examples = t("concepts", cId, "examples") || t("concepts", cIdDash, "examples") || richConcept.examples;
      bodyHTML += `<p class="cfr-definition">${def}</p>`;

      if (examples) {
        bodyHTML += `<hr class="cfr-divider"><h3>${lang === 'cn' ? '示例' : 'Examples'}</h3>`;
        bodyHTML += `<div class="cfr-examples">${examples}</div>`;
      }

      if (richConcept.related && richConcept.related.length > 0) {
        bodyHTML += `<hr class="cfr-divider"><h3>${lang === 'cn' ? '相关概念' : 'Related concepts'}</h3>`;
        bodyHTML += `<p>${richConcept.related.map((r) => `<span class="cfr-related-tag">${r}</span>`).join(" ")}</p>`;
      }

      if (richConcept.usedIn && richConcept.usedIn.length > 0) {
        bodyHTML += `<hr class="cfr-divider"><h3>${lang === 'cn' ? '出现在' : 'Appears in'}</h3>`;
        bodyHTML += `<ul>`;
        for (const pid of richConcept.usedIn) {
          const page = WIKI.pages[pid];
          if (page) {
            const pTitle = t("pages", pid, "title") || page.title;
            bodyHTML += `<li><a class="cfr-page-link" data-page="${pid}">${pTitle}</a></li>`;
          }
        }
        bodyHTML += `</ul>`;
      }

      if (richConcept.sources && richConcept.sources.length > 0) {
        bodyHTML += `<hr class="cfr-divider"><h3>${lang === 'cn' ? '来源' : 'Sources'}</h3>`;
        bodyHTML += `<ul class="cfr-sources">`;
        for (const s of richConcept.sources) {
          bodyHTML += `<li><a href="${s.url}" target="_blank" rel="noopener">${s.label}</a></li>`;
        }
        bodyHTML += `</ul>`;
      }
    } else {
      const summary = t("concepts", cId, "summary") || t("concepts", cIdDash, "summary") || concept.summary;
      bodyHTML += `<p class="cfr-definition">${summary}</p>`;
      bodyHTML += `<hr class="cfr-divider">`;
      bodyHTML += `<p style="color:var(--c-text-tertiary);font-style:italic;">${lang === 'cn' ? '详细概念内容尚未可用。随着知识库的扩展，此概念将被丰富。' : 'Detailed concept content not yet available. This concept will be expanded as the knowledge base grows.'}</p>`;
    }

    main.innerHTML = `
      <div class="concept-full-replace">
        <div class="cfr-back" id="cfr-back">${lang === 'cn' ? '← 返回文章' : '← Back to article'}</div>
        <div class="cfr-name">${cName}</div>
        <div class="cfr-role">${cRole}</div>
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

  // === Full-text Search Engine ===

  function buildSearchIndex() {
    const index = [];

    for (const [id, page] of Object.entries(WIKI.pages)) {
      if (page.type === "index") continue;
      const title = t("pages", id, "title") || page.title;
      const subtitle = t("pages", id, "subtitle") || page.subtitle || "";
      const body = t("pages", id, "body") || page.body || "";
      const plainBody = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

      index.push({
        type: "page",
        id: id,
        title: title,
        text: `${title} ${subtitle} ${plainBody}`,
        subtitle: subtitle,
        domain: page.domain || ""
      });
    }

    if (WIKI.concepts) {
      for (const [id, concept] of Object.entries(WIKI.concepts)) {
        const name = t("concepts", id, "name") || concept.name;
        const summary = t("concepts", id, "summary") || concept.summary || "";
        const definition = t("concepts", id, "definition") || concept.definition || "";
        const plainDef = definition.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

        index.push({
          type: "concept",
          id: id,
          title: name,
          text: `${name} ${summary} ${plainDef}`,
          subtitle: summary,
          pageLinks: concept.usedIn || []
        });
      }
    }

    return index;
  }

  function searchQuery(query, index) {
    if (!query.trim()) return [];
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const results = [];

    for (const entry of index) {
      const text = entry.text.toLowerCase();
      let score = 0;
      let allMatch = true;

      for (const term of terms) {
        const titleLower = entry.title.toLowerCase();
        if (titleLower === term) {
          score += 100;
        } else if (titleLower.includes(term)) {
          score += 50;
        } else if (text.includes(term)) {
          score += 10;
        } else {
          // Fuzzy: allow 1 character difference for terms > 3 chars
          if (term.length > 3 && fuzzyMatch(text, term)) {
            score += 5;
          } else {
            allMatch = false;
          }
        }
      }

      if (allMatch && score > 0) {
        results.push({ ...entry, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 20);
  }

  function fuzzyMatch(text, term) {
    for (let i = 0; i <= text.length - term.length; i++) {
      let diffs = 0;
      for (let j = 0; j < term.length; j++) {
        if (text[i + j] !== term[j]) diffs++;
        if (diffs > 1) break;
      }
      if (diffs <= 1) return true;
    }
    return false;
  }

  function getSnippet(text, query, maxLen = 120) {
    const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const lower = plain.toLowerCase();

    let bestPos = 0;
    for (const term of terms) {
      const idx = lower.indexOf(term);
      if (idx !== -1) { bestPos = idx; break; }
    }

    const start = Math.max(0, bestPos - 30);
    const end = Math.min(plain.length, start + maxLen);
    let snippet = plain.slice(start, end).trim();
    if (start > 0) snippet = "..." + snippet;
    if (end < plain.length) snippet += "...";

    // Highlight matching terms in snippet
    for (const term of terms) {
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
      snippet = snippet.replace(regex, "<mark>$1</mark>");
    }

    return snippet;
  }

  let searchIndex = null;

  function initSearch() {
    searchIndex = buildSearchIndex();
  }

  function showSearchResults(query) {
    if (!searchIndex) initSearch();
    if (!query.trim()) { renderPage(); renderRail(); return; }

    const results = searchQuery(query, searchIndex);

    // Clear the concept rail during search
    rail.innerHTML = `
      <div class="rail-header">${lang === 'cn' ? '搜索' : 'Search'}</div>
      <div class="rail-empty">${results.length} ${lang === 'cn' ? '个结果' : 'result(s)'}</div>`;

    if (results.length === 0) {
      main.innerHTML = `
        <div class="search-results-page">
          <h1 class="article-title">${lang === 'cn' ? '搜索结果' : 'Search Results'}</h1>
          <p class="search-query-label">"${escapeHtml(query)}"</p>
          <div class="search-no-results">
            <p>${lang === 'cn' ? '未找到匹配的内容。' : 'No matching content found.'}</p>
            <p style="color:var(--c-text-tertiary);font-size:0.875rem;">${lang === 'cn' ? '尝试不同的关键词或更短的查询。' : 'Try different keywords or a shorter query.'}</p>
          </div>
        </div>`;
      return;
    }

    let html = `<div class="search-results-page">`;
    html += `<h1 class="article-title">${lang === 'cn' ? '搜索结果' : 'Search Results'}</h1>`;
    html += `<p class="search-query-label">"${escapeHtml(query)}" &mdash; ${results.length} ${lang === 'cn' ? '个匹配' : 'match(es)'}</p>`;
    html += `<div class="search-results-list">`;

    for (const r of results) {
      const icon = r.type === "page" ? "📄" : "💡";
      const snippet = getSnippet(r.text, query, 200);
      const meta = r.type === "page" ? r.domain : (lang === 'cn' ? '概念' : 'Concept');
      html += `<div class="search-result-card" data-type="${r.type}" data-id="${r.id}">`;
      html += `<div class="search-result-card-header">`;
      html += `<span class="search-result-icon">${icon}</span>`;
      html += `<span class="search-result-title">${r.title}</span>`;
      html += `<span class="search-result-badge">${meta}</span>`;
      html += `</div>`;
      html += `<div class="search-result-body">${snippet}</div>`;
      html += `</div>`;
    }

    html += `</div></div>`;
    main.innerHTML = html;

    main.querySelectorAll(".search-result-card").forEach((el) => {
      el.addEventListener("click", () => {
        const type = el.dataset.type;
        const id = el.dataset.id;
        document.getElementById("nav-search-input").value = "";
        if (type === "page") {
          navigate(id);
        } else {
          const concept = WIKI.concepts?.[id];
          if (concept?.usedIn?.length > 0) {
            navigate(concept.usedIn[0]);
          }
        }
      });
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Global keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      const input = document.getElementById("nav-search-input");
      if (input) { input.focus(); input.select(); }
    }
  });

  // === Init ===
  navigate("index");
})();
