(function () {
  var engine = WikiEngine.create({
    data: WIKI,
    brand: { icon: "AI", text: "AI Inference Infrastructure" },
    homeUrl: "../../",
    features: { search: true, contributions: true }
  });
  engine.start();
})();
