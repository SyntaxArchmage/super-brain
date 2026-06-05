import { resolveTopics } from "../core/resolve.js";
import { formatTopics } from "../core/formatter.js";

export function registerTopics(program) {
  program
    .command("topics")
    .description("List all research topics with stats")
    .option("--sort <by>", "Sort by: name, updated, articles", "name")
    .option("--format <fmt>", "Output format: text, json", "text")
    .option("--remote <url>", "Fetch from remote URL (GitHub Pages)")
    .action(async (opts) => {
      const topics = await resolveTopics(opts);

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
