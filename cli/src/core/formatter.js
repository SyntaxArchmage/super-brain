import chalk from "chalk";

export function formatSearchResults(results, query, format, timingMs) {
  if (format === "json") {
    return JSON.stringify({
      query,
      results: results.map((r) => ({
        topic: r.topic,
        topicTitle: r.topicTitle,
        page: r.pageId,
        title: r.title,
        type: r.type,
        snippet: getSnippet(r.bodyPlain || r.subtitle, query),
        score: Math.round(r.score),
        concepts: r.conceptNames ? r.conceptNames.split(" ").filter(Boolean) : [],
      })),
      meta: { totalResults: results.length, timeMs: timingMs },
    }, null, 2);
  }

  if (results.length === 0) {
    return chalk.dim("No results for ") + chalk.white(`"${query}"`) + chalk.dim(".");
  }

  const lines = [];
  for (const r of results) {
    lines.push("");
    lines.push(
      "  " + chalk.dim(r.topicTitle + " / " + r.domain) +
      (r.type === "concept" ? chalk.cyan(" [concept]") : "")
    );
    lines.push("  " + chalk.white.bold("── " + r.title + " ──"));
    const snippet = getSnippet(r.bodyPlain || r.subtitle, query, 200);
    if (snippet) lines.push("  " + snippet);
    if (r.conceptNames) {
      const concepts = r.conceptNames.split(" ").filter(Boolean).slice(0, 5);
      if (concepts.length) {
        lines.push("  " + chalk.dim("Concepts: ") + chalk.cyan(concepts.join(" · ")));
      }
    }
    lines.push("  " + chalk.dim("Score: " + Math.round(r.score)));
  }
  lines.push("");
  const topicSet = new Set(results.map((r) => r.topic));
  lines.push(
    chalk.dim(`${results.length} results across ${topicSet.size} topic(s) (${(timingMs / 1000).toFixed(2)}s)`)
  );
  return lines.join("\n");
}

export function formatConcept(concept, topicTitle, format) {
  if (format === "json") return JSON.stringify(concept, null, 2);

  const lines = [];
  lines.push("");
  lines.push("  " + chalk.white.bold("── " + (concept.name || "?") + " ──"));
  if (concept.role) lines.push("  " + chalk.dim("(" + concept.role + ")"));
  lines.push("  " + chalk.dim("Topic: " + topicTitle));
  lines.push("");
  if (concept.definition) {
    lines.push("  " + stripHtmlSimple(concept.definition));
  } else if (concept.summary) {
    lines.push("  " + concept.summary);
  }
  if (concept.examples) {
    lines.push("");
    lines.push("  " + chalk.yellow.bold("Examples:"));
    lines.push("  " + stripHtmlSimple(concept.examples));
  }
  if (concept.related && concept.related.length) {
    lines.push("");
    lines.push("  " + chalk.dim("Related: ") + chalk.cyan(concept.related.join(" · ")));
  }
  if (concept.usedIn && concept.usedIn.length) {
    lines.push("  " + chalk.dim("Appears in: ") + concept.usedIn.join(", "));
  }
  if (concept.sources && concept.sources.length) {
    lines.push("");
    lines.push("  " + chalk.dim("Sources:"));
    for (const s of concept.sources) {
      lines.push("    • " + s.label + (s.url ? chalk.dim(" — " + s.url) : ""));
    }
  }
  return lines.join("\n");
}

export function formatTopics(topics, format) {
  if (format === "json") {
    return JSON.stringify(topics.map((t) => ({
      id: t.id,
      title: t.meta.title,
      status: t.meta.status || "active",
      articles: countPages(t.wiki),
      concepts: countConcepts(t.wiki),
      updated: t.meta.updated || "—",
    })), null, 2);
  }

  const lines = [];
  lines.push("");
  lines.push(
    "  " +
    chalk.dim(pad("Topic", 22) + pad("Articles", 10) + pad("Concepts", 10) + pad("Updated", 13) + "Status")
  );
  lines.push("  " + chalk.dim("─".repeat(65)));
  for (const t of topics) {
    const arts = countPages(t.wiki);
    const cons = countConcepts(t.wiki);
    lines.push(
      "  " +
      pad(t.meta.title || t.id, 22) +
      pad(String(arts), 10) +
      pad(String(cons), 10) +
      pad(t.meta.updated || "—", 13) +
      (t.meta.status || "active")
    );
  }
  const totalArts = topics.reduce((s, t) => s + countPages(t.wiki), 0);
  const totalCons = topics.reduce((s, t) => s + countConcepts(t.wiki), 0);
  lines.push("");
  lines.push(chalk.dim(`  ${topics.length} topics · ${totalArts} articles · ${totalCons} concepts`));
  return lines.join("\n");
}

function countPages(wiki) {
  if (!wiki.pages) return 0;
  return Object.values(wiki.pages).filter((p) => p.type !== "index").length;
}

function countConcepts(wiki) {
  if (!wiki.concepts) return 0;
  return Object.keys(wiki.concepts).length;
}

function pad(str, len) {
  return str.length >= len ? str.slice(0, len - 1) + " " : str + " ".repeat(len - str.length);
}

function stripHtmlSimple(html) {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getSnippet(text, query, maxLen = 160) {
  if (!text) return "";
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const lower = text.toLowerCase();
  let bestPos = 0;
  for (const term of terms) {
    const idx = lower.indexOf(term);
    if (idx !== -1) { bestPos = idx; break; }
  }
  const start = Math.max(0, bestPos - 40);
  const end = Math.min(text.length, start + maxLen);
  let snippet = text.slice(start, end).trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet += "...";
  return snippet;
}
