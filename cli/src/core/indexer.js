import MiniSearch from "minisearch";

/**
 * Build a MiniSearch index from loaded topics.
 * Each document is either a page or a concept.
 */
export function buildIndex(topics) {
  const index = new MiniSearch({
    fields: ["title", "subtitle", "bodyPlain", "conceptNames"],
    storeFields: ["title", "subtitle", "topic", "topicTitle", "pageId", "type", "domain"],
    searchOptions: {
      boost: { title: 3, conceptNames: 2, subtitle: 1.5 },
      fuzzy: 0.2,
      prefix: true,
    },
    tokenize: cjkAwareTokenize,
  });

  let docId = 0;
  const docs = [];

  for (const topic of topics) {
    const { wiki, id: topicId, meta } = topic;
    if (!wiki.pages) continue;

    for (const [pageId, page] of Object.entries(wiki.pages)) {
      if (page.type === "index") continue;
      const bodyPlain = stripHtml(page.body || "");
      const conceptNames = (page.concepts || []).map((c) => c.name).join(" ");

      docs.push({
        id: docId++,
        type: "page",
        pageId,
        topic: topicId,
        topicTitle: meta.title || topicId,
        title: page.title || pageId,
        subtitle: page.subtitle || "",
        bodyPlain,
        conceptNames,
        domain: page.domain || "",
      });
    }

    if (wiki.concepts) {
      for (const [cId, concept] of Object.entries(wiki.concepts)) {
        const defPlain = stripHtml(concept.definition || "");
        docs.push({
          id: docId++,
          type: "concept",
          pageId: cId,
          topic: topicId,
          topicTitle: meta.title || topicId,
          title: concept.name || cId,
          subtitle: concept.summary || "",
          bodyPlain: defPlain,
          conceptNames: (concept.related || []).join(" "),
          domain: "",
        });
      }
    }
  }

  index.addAll(docs);
  return { index, docs };
}

export function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * CJK-aware tokenizer: splits on whitespace for Latin, adds unigram/bigram
 * for CJK characters so Chinese text is searchable.
 */
function cjkAwareTokenize(text) {
  if (!text) return [];
  const tokens = [];
  const CJK = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/;
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);

  for (const word of words) {
    if (CJK.test(word)) {
      const chars = [...word].filter((c) => CJK.test(c));
      tokens.push(...chars);
      for (let i = 0; i < chars.length - 1; i++) {
        tokens.push(chars[i] + chars[i + 1]);
      }
      const latin = word.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g, " ")
        .split(/\s+/).filter(Boolean);
      tokens.push(...latin);
    } else {
      tokens.push(word);
    }
  }
  return tokens;
}
