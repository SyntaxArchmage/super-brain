import { findRepoRoot } from "../core/config.js";
import { loadAllTopics } from "../core/loader.js";
import { formatTopics } from "../core/formatter.js";

export function registerTopics(program) {
  program
    .command("topics")
    .description("List all research topics with stats")
    .option("--sort <by>", "Sort by: name, updated, articles", "name")
    .option("--format <fmt>", "Output format: text, json", "text")
    .action((opts) => {
      const root = findRepoRoot();
      if (!root) {
        console.error("Error: could not find a super-brain repo.");
        process.exit(1);
      }
      const topics = loadAllTopics(root);

      if (opts.sort === "updated") {
        topics.sort((a, b) => (b.meta.updated || "").localeCompare(a.meta.updated || ""));
      } else if (opts.sort === "articles") {
        const count = (t) => Object.values(t.wiki.pages || {}).filter((p) => p.type !== "index").length;
        topics.sort((a, b) => count(b) - count(a));
      } else {
        topics.sort((a, b) => (a.meta.title || a.id).localeCompare(b.meta.title || b.id));
      }

      console.log(formatTopics(topics, opts.format));
    });
}
