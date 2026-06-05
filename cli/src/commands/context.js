import chalk from "chalk";
import { findRepoRoot } from "../core/config.js";
import { loadAllTopics } from "../core/loader.js";
import { buildIndex, stripHtml } from "../core/indexer.js";

export function registerContext(program) {
  program
    .command("context <subject>")
    .description("Generate a concise knowledge brief for a subject")
    .option("--topic <id>", "Limit to a specific topic")
    .option("--max-tokens <n>", "Approximate max tokens (chars/4)", "500")
    .option("--format <fmt>", "Output format: text, md", "text")
    .action((subject, opts) => {
      const root = findRepoRoot();
      if (!root) {
        console.error("Error: could not find a super-brain repo.");
        process.exit(1);
      }
      const topics = loadAllTopics(root);
      const { index, docs } = buildIndex(topics);

      let results = index.search(subject, {
        ...(opts.topic ? { filter: (r) => docs[r.id]?.topic === opts.topic } : {}),
      });
      results = results.slice(0, 3);

      if (results.length === 0) {
        console.error(`No knowledge found for "${subject}".`);
        process.exit(1);
      }

      const maxChars = parseInt(opts.maxTokens, 10) * 4;
      const isMd = opts.format === "md";
      const lines = [];

      if (isMd) {
        lines.push(`## ${subject} (Knowledge Brief)\n`);
      } else {
        lines.push("");
        lines.push(chalk.white.bold(`  ## ${subject} (Knowledge Brief)`));
        lines.push("");
      }

      let charBudget = maxChars;
      for (const r of results) {
        const doc = docs[r.id];
        if (!doc) continue;
        const body = doc.bodyPlain || doc.subtitle || "";
        const truncated = body.slice(0, Math.max(100, charBudget));
        charBudget -= truncated.length;

        if (isMd) {
          lines.push(`### ${doc.title}`);
          lines.push(truncated + (truncated.length < body.length ? "..." : ""));
          lines.push("");
          if (doc.conceptNames) {
            const concepts = doc.conceptNames.split(" ").filter(Boolean).slice(0, 8);
            if (concepts.length) lines.push("**Concepts:** " + concepts.join(", "));
          }
          lines.push(`*Source: ${doc.topicTitle} / ${doc.title}*\n`);
        } else {
          lines.push("  " + chalk.white.bold(doc.title));
          lines.push("  " + truncated.slice(0, 200) + (truncated.length > 200 ? "..." : ""));
          if (doc.conceptNames) {
            const concepts = doc.conceptNames.split(" ").filter(Boolean).slice(0, 8);
            if (concepts.length) {
              lines.push("  " + chalk.dim("Concepts: ") + chalk.cyan(concepts.join(", ")));
            }
          }
          lines.push(chalk.dim("  Source: " + doc.topicTitle + " / " + doc.title));
          lines.push("");
        }

        if (charBudget <= 0) break;
      }

      console.log(lines.join("\n"));
    });
}
