import { findRepoRoot } from "../core/config.js";
import { loadAllTopics } from "../core/loader.js";
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
    .action((query, opts) => {
      const root = findRepoRoot();
      if (!root) {
        console.error("Error: could not find a super-brain repo. Run from inside the repo or set SB_ROOT.");
        process.exit(1);
      }
      const t0 = Date.now();
      const topics = loadAllTopics(root);
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
