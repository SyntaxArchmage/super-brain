import { resolveTopics } from "../core/resolve.js";
import { buildIndex } from "../core/indexer.js";
import { formatSearchResults } from "../core/formatter.js";

export function registerSearch(program) {
  program
    .command("search <query>")
    .description("Full-text search across all topics")
    .option("--topic <id>", "Limit to a specific topic")
    .option("--type <type>", "Filter by type: page or concept")
    .option("--format <fmt>", "Output format: text, json, md", "text")
    .option("--limit <n>", "Max results", "10")
    .option("--remote <url>", "Fetch from remote URL (GitHub Pages)")
    .action(async (query, opts) => {
      const t0 = Date.now();
      const topics = await resolveTopics(opts);
      const { index, docs } = buildIndex(topics);

      let results = index.search(query, {
        ...(opts.topic ? { filter: (r) => docs[r.id]?.topic === opts.topic } : {}),
      });

      if (opts.type) {
        results = results.filter((r) => docs[r.id]?.type === opts.type);
      }

      results = results.slice(0, parseInt(opts.limit, 10));

      const enriched = results.map((r) => ({ ...docs[r.id], score: r.score }));
      const elapsed = Date.now() - t0;
      console.log(formatSearchResults(enriched, query, opts.format, elapsed));
    });
}
