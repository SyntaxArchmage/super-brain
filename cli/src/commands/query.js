import { resolveTopics } from "../core/resolve.js";
import { formatConcept } from "../core/formatter.js";

export function registerQuery(program) {
  program
    .command("query <concept>")
    .description("Look up a specific concept by name")
    .option("--topic <id>", "Limit to a specific topic")
    .option("--format <fmt>", "Output format: text, json", "text")
    .option("--remote <url>", "Fetch from remote URL (GitHub Pages)")
    .action(async (conceptName, opts) => {
      const topics = await resolveTopics(opts);
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
