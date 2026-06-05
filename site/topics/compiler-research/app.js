(function () {
  var engine = WikiEngine.create({
    data: WIKI,
    dataCN: typeof WIKI_CN !== "undefined" ? WIKI_CN : null,
    container: document.getElementById("wiki-shell"),
    brand: { icon: "SB", text: "Super Brain" },
    features: {
      search: true,
      conceptRail: true,
      contributions: true,
      i18n: true,
    },
  });

  engine.start();
})();
