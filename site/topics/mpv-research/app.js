(function () {
  var engine = WikiEngine.create({
    data: WIKI,
    container: document.getElementById("wiki-shell"),
    homeUrl: "../../",
    brand: { icon: "MPV", text: "MPV 调研" },
    features: {
      search: false,
      conceptRail: true,
      contributions: true,
      i18n: false,
    },
    labels: {
      domains: "调研维度",
      concepts: "概念卡片",
      conceptLayer: "概念层",
      searchPlaceholder: "搜索...",
      openArticle: "打开一篇调研文章，<br/>右侧会显示相关概念解释。",
      noConcepts: "本文章尚未定义概念。",
      backToArticle: "← 返回文章",
      examples: "示例与应用",
      relatedConcepts: "相关概念",
      appearsIn: "出现在",
      sources: "来源",
    },
  });

  engine.onNavigate(function (pageId) {
    updateScorerContent();
    if (pageId === "recommendation") setTimeout(injectRadarSection, 60);
  });

  engine.start();

  /* === Floating Car Scorer (domain-specific) === */
  var SCORER_CARS = [
    { id: "zeekr009", name: "极氪009" },
    { id: "denza_d9", name: "腾势D9" },
    { id: "xpeng_x9", name: "小鹏X9" },
    { id: "li_mega", name: "理想MEGA" },
    { id: "voyah", name: "岚图梦想家" },
    { id: "xinghai", name: "星海V9" },
    { id: "buick_gl8", name: "别克GL8" },
    { id: "hycan_v09", name: "合创V09" },
    { id: "yizhen", name: "翼真L380" },
    { id: "trumpchi", name: "传祺E9" },
  ];

  var SCORER_DIMS = {
    battery:          { label: "动力电池",       short: "电池" },
    chassis:          { label: "底盘与悬架",     short: "底盘" },
    adas:             { label: "智能驾驶",       short: "智驾" },
    seating:          { label: "座椅与空间",     short: "空间" },
    "motion-sick":    { label: "防晕车技术",     short: "防晕" },
    "crash-safety":   { label: "碰撞与车身安全", short: "安全" },
    "smart-cockpit":  { label: "车机与影音",     short: "座舱" },
    "range-charging": { label: "续航与补能",     short: "续航" },
    performance:      { label: "动力性能",       short: "动力" },
    "price-value":    { label: "价格与性价比",   short: "性价" },
    "charging-service":{ label: "充电服务",      short: "充电" },
    "repair-network": { label: "维修点覆盖",     short: "维修" },
    "maintenance-cost":{ label: "保养维修报价",  short: "保养" },
    warranty:         { label: "质保年限",       short: "质保" },
  };

  var STORAGE_KEY = "mpv-scorer-data";
  function loadScores()  { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch(e) { return {}; } }
  function saveScores(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
  function getScore(carId, dimId) { var d = loadScores(); return d[carId] && d[carId][dimId] ? d[carId][dimId] : 0; }
  function setScore(carId, dimId, val) { var d = loadScores(); if (!d[carId]) d[carId] = {}; d[carId][dimId] = val; saveScores(d); }

  var scorerBarEl = null;
  var scorerCollapsed = true;

  function buildScorerBar() {
    if (scorerBarEl) scorerBarEl.remove();
    scorerBarEl = document.createElement("div");
    scorerBarEl.className = "scorer-bar" + (scorerCollapsed ? " collapsed" : "");
    document.body.appendChild(scorerBarEl);
    updateScorerContent();
  }

  function updateScorerContent() {
    if (!scorerBarEl) return;
    var dimId = engine.getCurrentPage();
    var dim = SCORER_DIMS[dimId];
    var isArticle = !!dim;
    var isSummary = engine.getCurrentPage() === "recommendation";
    var scoredCount = Object.values(loadScores()).filter(function(c) { return c && Object.values(c).some(function(v) { return v > 0; }); }).length;
    var badge = scoredCount > 0 ? " (" + scoredCount + ")" : "";
    var html = '<button class="scorer-toggle" id="scorer-toggle">' + (scorerCollapsed ? "⭐ 选车打分器" + badge : "▾ 收起") + "</button>";

    if (isArticle) {
      html += '<div class="scorer-header"><span class="scorer-dim-label">📊 为「' + dim.label + '」维度打分</span>';
      html += '<span class="scorer-dim-hint">点击星星给每辆车评分 (1-5分)</span>';
      html += '<button class="scorer-reset" id="scorer-reset-dim">清除本维度</button></div>';
      html += '<div class="scorer-grid">';
      SCORER_CARS.forEach(function(car) {
        var score = getScore(car.id, dimId);
        html += '<div class="scorer-car"><div class="scorer-car-name">' + car.name + '</div>';
        html += '<div class="scorer-stars" data-car="' + car.id + '" data-dim="' + dimId + '">';
        for (var i = 1; i <= 5; i++) html += '<span class="scorer-star' + (i <= score ? " filled" : "") + '" data-val="' + i + '">★</span>';
        html += '</div><div class="scorer-score-val">' + (score ? score + "/5" : "") + '</div></div>';
      });
      html += '</div>';
    } else if (isSummary) {
      html += '<div class="scorer-header"><span class="scorer-dim-label">📊 综合评分总览</span>';
      html += '<span class="scorer-dim-hint">查看下方雷达图对比</span>';
      html += '<button class="scorer-reset" id="scorer-reset-all">清除所有评分</button></div>';
      html += '<div class="scorer-grid">';
      var allScores = loadScores();
      SCORER_CARS.forEach(function(car) {
        var scores = allScores[car.id] || {};
        var dims = Object.keys(scores).filter(function(k) { return scores[k] > 0; });
        var avg = dims.length ? (dims.reduce(function(s,k) { return s + scores[k]; }, 0) / dims.length).toFixed(1) : "-";
        html += '<div class="scorer-car"><div class="scorer-car-name">' + car.name + '</div>';
        html += '<div class="scorer-score-val" style="font-size:.8rem;font-weight:600;color:var(--c-accent)">' + avg + '</div>';
        html += '<div class="scorer-score-val">' + dims.length + '/' + Object.keys(SCORER_DIMS).length + '维度</div></div>';
      });
      html += '</div>';
    } else {
      html += '<div class="scorer-header"><span class="scorer-dim-label">📊 我的选车打分器</span>';
      html += '<span class="scorer-dim-hint">进入调研文章后可为每辆车打分</span></div>';
      var total = SCORER_CARS.filter(function(c) { var s = loadScores()[c.id]; return s && Object.values(s).some(function(v) { return v > 0; }); }).length;
      html += '<div class="scorer-grid" style="justify-content:center;padding:16px">';
      html += '<div style="text-align:center;font-size:.8rem;color:var(--c-text-secondary)">已为 <strong>' + total + '</strong>/' + SCORER_CARS.length + ' 辆车打过分</div></div>';
    }

    scorerBarEl.innerHTML = html;
    scorerBarEl.className = "scorer-bar" + (scorerCollapsed ? " collapsed" : "");

    scorerBarEl.querySelector("#scorer-toggle").addEventListener("click", function() { scorerCollapsed = !scorerCollapsed; updateScorerContent(); });

    scorerBarEl.querySelectorAll(".scorer-stars").forEach(function(group) {
      var stars = group.querySelectorAll(".scorer-star");
      group.addEventListener("mouseleave", function() {
        var current = getScore(group.dataset.car, group.dataset.dim);
        stars.forEach(function(s, i) { s.classList.toggle("filled", i < current); });
      });
      stars.forEach(function(star) {
        star.addEventListener("mouseenter", function() {
          var hv = parseInt(star.dataset.val);
          stars.forEach(function(s, i) { s.classList.toggle("filled", i < hv); });
        });
        star.addEventListener("click", function() {
          var carId = group.dataset.car, dm = group.dataset.dim, val = parseInt(star.dataset.val);
          var cur = getScore(carId, dm);
          setScore(carId, dm, val === cur ? 0 : val);
          star.classList.add("just-clicked");
          setTimeout(function() { star.classList.remove("just-clicked"); }, 250);
          updateScorerContent();
          if (engine.getCurrentPage() === "recommendation") renderRadarCharts();
        });
      });
    });

    var resetDim = scorerBarEl.querySelector("#scorer-reset-dim");
    if (resetDim) resetDim.addEventListener("click", function() {
      var d = loadScores();
      SCORER_CARS.forEach(function(car) { if (d[car.id]) delete d[car.id][dimId]; });
      saveScores(d);
      updateScorerContent();
    });

    var resetAll = scorerBarEl.querySelector("#scorer-reset-all");
    if (resetAll) resetAll.addEventListener("click", function() {
      if (confirm("确定清除所有打分数据？")) {
        localStorage.removeItem(STORAGE_KEY);
        updateScorerContent();
        if (engine.getCurrentPage() === "recommendation") renderRadarCharts();
      }
    });
  }

  function renderRadarCharts() {
    var container = document.getElementById("user-radar-section");
    if (!container) return;
    var allScores = loadScores();
    var hasAny = SCORER_CARS.some(function(c) { var s = allScores[c.id]; return s && Object.values(s).some(function(v) { return v > 0; }); });
    if (!hasAny) {
      container.innerHTML = '<div class="scorer-no-data"><p style="font-size:2rem;margin-bottom:8px;opacity:.4">⭐</p><p>你还没有打过分</p><p style="margin-top:6px;font-size:.78rem">浏览各维度调研文章时，点击底部「选车打分器」为每辆车评分。<br>评分完成后，这里将展示你的个性化选车雷达图。</p></div>';
      return;
    }
    var dimKeys = Object.keys(SCORER_DIMS);
    var dimLabels = dimKeys.map(function(k) { return SCORER_DIMS[k].short; });
    var colors = ["#1d4ed8","#dc2626","#059669","#d97706","#7c3aed","#0891b2","#be185d","#065f46","#9333ea","#c2410c"];
    var carsWithScores = SCORER_CARS.filter(function(c) { var s = allScores[c.id]; return s && Object.values(s).some(function(v) { return v > 0; }); });

    var html = '<div class="radar-container">';
    html += '<div class="radar-card"><h3>我的选车雷达图</h3><canvas id="radar-canvas" width="400" height="400"></canvas>';
    html += '<div class="radar-legend">';
    carsWithScores.forEach(function(car, i) { html += '<div class="radar-legend-item"><span class="radar-legend-dot" style="background:' + colors[i % colors.length] + '"></span>' + car.name + '</div>'; });
    html += '</div></div>';

    html += '<div class="radar-card" style="min-width:280px;max-width:420px;flex:1"><h3>评分明细</h3>';
    html += '<table style="font-size:.75rem;border-collapse:collapse;width:100%;font-family:var(--font-ui)">';
    html += '<tr style="background:var(--c-surface-alt)"><th style="text-align:left;padding:6px 10px;border-bottom:2px solid var(--c-border);font-size:.7rem;color:var(--c-text-secondary)">维度</th>';
    carsWithScores.forEach(function(c) { html += '<th style="padding:6px 6px;border-bottom:2px solid var(--c-border);font-size:.65rem;color:var(--c-text-secondary)">' + c.name + '</th>'; });
    html += '</tr>';
    dimKeys.forEach(function(dk, rowIdx) {
      var bg = rowIdx % 2 === 0 ? "" : "background:var(--c-surface-alt)";
      html += '<tr style="' + bg + '"><td style="padding:5px 10px;font-size:.72rem;font-weight:500">' + SCORER_DIMS[dk].short + '</td>';
      carsWithScores.forEach(function(c) {
        var v = getScore(c.id, dk);
        html += '<td style="text-align:center;padding:5px 4px;font-size:.6rem;color:' + (v ? "var(--c-text)" : "var(--c-text-tertiary)") + '">' + (v ? v : "-") + '</td>';
      });
      html += '</tr>';
    });
    var avgRow = carsWithScores.map(function(c) { var s = allScores[c.id] || {}; var vals = dimKeys.map(function(k) { return s[k] || 0; }).filter(function(v) { return v > 0; }); return vals.length ? (vals.reduce(function(a,b) { return a+b; }, 0) / vals.length).toFixed(1) : "-"; });
    html += '<tr style="font-weight:700;border-top:2px solid var(--c-border);background:var(--c-accent-soft)"><td style="padding:6px 10px;color:var(--c-accent)">均分</td>';
    avgRow.forEach(function(a) { html += '<td style="text-align:center;padding:6px 6px;color:var(--c-accent);font-size:.8rem">' + a + '</td>'; });
    html += '</tr></table></div></div>';
    container.innerHTML = html;

    var canvas = document.getElementById("radar-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var cx = 200, cy = 200, maxR = 150, n = dimKeys.length;
    var angleStep = (2 * Math.PI) / n, startAngle = -Math.PI / 2;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = 400 * dpr; canvas.height = 400 * dpr;
    canvas.style.width = "400px"; canvas.style.height = "400px";
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, 400, 400);

    ctx.fillStyle = "#fafafa";
    ctx.beginPath();
    for (var i = 0; i <= n; i++) { var a = startAngle + i * angleStep; i === 0 ? ctx.moveTo(cx + maxR * Math.cos(a), cy + maxR * Math.sin(a)) : ctx.lineTo(cx + maxR * Math.cos(a), cy + maxR * Math.sin(a)); }
    ctx.fill();

    for (var ring = 1; ring <= 5; ring++) {
      var r = (ring / 5) * maxR;
      ctx.beginPath();
      for (var i2 = 0; i2 <= n; i2++) { var a2 = startAngle + i2 * angleStep; var x = cx + r * Math.cos(a2), y = cy + r * Math.sin(a2); i2 === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.strokeStyle = ring === 5 ? "#c4c8cc" : "#e8eaed"; ctx.lineWidth = ring === 5 ? 1.5 : 0.7; ctx.stroke();
    }

    for (var j = 0; j < n; j++) {
      var angle = startAngle + j * angleStep;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
      ctx.strokeStyle = "#e8eaed"; ctx.lineWidth = 0.7; ctx.stroke();
      var lx = cx + (maxR + 20) * Math.cos(angle), ly = cy + (maxR + 20) * Math.sin(angle);
      ctx.font = "bold 11px Inter, system-ui, sans-serif"; ctx.fillStyle = "#4a4a4a"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(dimLabels[j], lx, ly);
    }

    carsWithScores.forEach(function(car, ci) {
      var scores = allScores[car.id] || {};
      var color = colors[ci % colors.length];
      ctx.beginPath();
      dimKeys.forEach(function(dk, idx) {
        var val = scores[dk] || 0, rv = (val / 5) * maxR;
        var ag = startAngle + idx * angleStep;
        idx === 0 ? ctx.moveTo(cx + rv * Math.cos(ag), cy + rv * Math.sin(ag)) : ctx.lineTo(cx + rv * Math.cos(ag), cy + rv * Math.sin(ag));
      });
      ctx.closePath(); ctx.fillStyle = color + "18"; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();

      dimKeys.forEach(function(dk, idx) {
        var val = scores[dk] || 0; if (!val) return;
        var rv = (val / 5) * maxR, ag = startAngle + idx * angleStep;
        var px = cx + rv * Math.cos(ag), py = cy + rv * Math.sin(ag);
        ctx.beginPath(); ctx.arc(px, py, 4, 0, 2 * Math.PI); ctx.fillStyle = "#fff"; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, 4, 0, 2 * Math.PI); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, 2, 0, 2 * Math.PI); ctx.fillStyle = color; ctx.fill();
      });
    });
  }

  function injectRadarSection() {
    if (!document.getElementById("user-radar-section")) {
      var body = document.querySelector(".article-body");
      if (body) {
        var heading = document.createElement("h2");
        heading.textContent = "📊 我的选车雷达图";
        heading.style.cssText = "font-size:1.3rem;margin-bottom:16px;padding-top:16px;border-top:2px solid var(--c-border)";
        var section = document.createElement("div");
        section.id = "user-radar-section";
        section.style.marginTop = "4px";
        body.insertBefore(section, body.firstChild);
        body.insertBefore(heading, body.firstChild);
        renderRadarCharts();
      }
    }
  }

  buildScorerBar();
})();
