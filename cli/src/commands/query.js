import { findRepoRoot } from "../core/config.js";
import { loadAllTopics } from "../core/loader.js";
import { formatConcept } from "../core/formatter.js";

export function registerQuery(program) {
  program
    .command("query <concept>")
    .description("Look up a specific concept by name")
    .option("--topic <id>", "Limit to a specific topic")
    .option("--format <fmt>", "Output format: text, json", "text")
    .action((conceptName, opts) => {
      const root = findRepoRoot();
      if (!root) {
        console.error("Error: could not find a super-brain repo.");
        process.exit(1);
      }
      const topics = loadAllTopics(root);
      const needle = conceptName.toLowerCase();
      let found = null;
      let topicTitle = "";

      for (const topic of topics) {
        if (opts.topic && topic.id !== opts.topic) continue;
        if (!topic.wiki.concepts) continue;

        for (const [cId, concept] of Object.entries(topic.wiki.concepts)) {
          if (cId === needle || (concept.name && concept.name.toLowerCase() === needle)) {
            found = concept;
            topicTitle = topic.meta.title || topic.id;
            break;
          }
        }
        if (found) break;
      }

      if (!found) {
        // Fall back: search in page-level concepts arrays
        for (const topic of topics) {
          if (opts.topic && topic.id !== opts.topic) continue;
          for (const page of Object.values(topic.wiki.pages || {})) {
            if (!page.concepts) continue;
            const match = page.concepts.find(
              (c) => c.name.toLowerCase() === needle
            );
            if (match) {
              found = { name: match.name, summary: match.summary, role: match.role };
              topicTitle = topic.meta.title || topic.id;
              break;
            }
          }
          if (found) break;
        }
      }

      if (!found) {
        console.error(`Concept "${conceptName}" not found.`);
        process.exit(1);
      }

      console.log(formatConcept(found, topicTitle, opts.format));
    });
}
