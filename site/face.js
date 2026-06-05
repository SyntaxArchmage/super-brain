(function () {
  "use strict";

  var mainEl = document.getElementById("face-main");

  // Load the topic registry and render cards.
  // Works with both HTTP server (fetch) and file:// (inline fallback).
  function loadRegistry() {
    if (typeof fetch !== "undefined" && location.protocol !== "file:") {
      fetch("./topic-registry.json")
        .then(function (r) { return r.json(); })
        .then(render)
        .catch(function () { renderFallback(); });
    } else {
      renderFallback();
    }
  }

  function renderFallback() {
    // file:// can't fetch JSON — render a minimal message with direct links
    mainEl.innerHTML =
      '<div class="face-loading">' +
      "Serve with an HTTP server to see the full Face Page.<br/>" +
      'Or navigate directly: ' +
      '<a href="topics/compiler-research/">Compiler Research</a> · ' +
      '<a href="topics/mpv-research/">MPV Research</a>' +
      "</div>";
  }

  function render(data) {
    // Support both old flat array and new categorized format
    var categories;
    if (Array.isArray(data)) {
      categories = [{ id: "all", label: "All Topics", topics: data }];
    } else if (data && data.categories) {
      categories = data.categories;
    } else {
      mainEl.innerHTML = '<div class="face-loading">No topics found.</div>';
      return;
    }

    var html = "";
    categories.forEach(function (cat) {
      if (!cat.topics || cat.topics.length === 0) return;
      html += '<div class="face-category">';
      html += '<div class="face-category-label">' + cat.label + '</div>';
      html += '<div class="face-grid">';
      cat.topics.forEach(function (topic) {
        html +=
          '<a class="topic-card" href="' + topic.path + '">' +
            '<div class="topic-card-header">' +
              '<div class="topic-card-icon" style="background:' + (topic.color || "#1d4ed8") + '">' +
                topic.icon +
              '</div>' +
              '<div>' +
                '<div class="topic-card-title">' + topic.title + '</div>' +
                '<div class="topic-card-status ' + topic.status + '">' + topic.status + '</div>' +
              '</div>' +
            '</div>' +
            '<div class="topic-card-desc">' + topic.subtitle + '</div>' +
            '<div class="topic-card-stats">' +
              '<div class="topic-stat"><span class="topic-stat-num">' + (topic.articles || 0) + '</span> articles</div>' +
              '<div class="topic-stat"><span class="topic-stat-num">' + (topic.concepts || 0) + '</span> concepts</div>' +
              '<div class="topic-stat">Updated ' + (topic.updated || "\u2014") + '</div>' +
            '</div>' +
            '<div class="topic-card-arrow">\u203a</div>' +
          '</a>';
      });
      html += '</div></div>';
    });
    mainEl.innerHTML = html;

    // Cards are native <a> tags — no JS click handler needed
  }

  loadRegistry();
})();
