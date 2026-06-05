import chalk from "chalk";
import { resolveTopics } from "../core/resolve.js";
import { buildIndex } from "../core/indexer.js";
import { buildRagPrompt } from "../llm/prompts.js";
import { chat, detectProvider } from "../llm/provider.js";

export function registerAsk(program) {
  program
    .command("ask <question>")
    .description("Ask a question using your knowledge base as context (requires LLM API key)")
    .option("--model <model>", "LLM model to use")
    .option("--topic <id>", "Limit context to a specific topic")
    .option("--provider <name>", "Force provider: openai, anthropic, ollama")
    .option("--remote <url>", "Fetch from remote URL (GitHub Pages)")
    .action(async (question, opts) => {
      const provider = opts.provider || detectProvider();
      if (!provider) {
        console.error(
          chalk.red("No LLM provider configured.") + "\n\n" +
          "Set one of these environment variables:\n" +
          chalk.dim("  OPENAI_API_KEY     — for OpenAI (gpt-4o, gpt-4o-mini, etc.)\n") +
          chalk.dim("  ANTHROPIC_API_KEY  — for Anthropic (claude-sonnet, etc.)\n") +
          chalk.dim("  OLLAMA_HOST        — for local Ollama (default: http://localhost:11434)\n") +
          "\n" +
          chalk.dim("All other sb commands work fully offline without an API key.")
        );
        process.exit(1);
      }

      console.log(chalk.dim(`  Searching knowledge base...`));
      const topics = await resolveTopics(opts);
      const { index, docs } = buildIndex(topics);

      let results = index.search(question, {
        ...(opts.topic ? { filter: (r) => docs[r.id]?.topic === opts.topic } : {}),
      });
      results = results.slice(0, 5);

      if (results.length === 0) {
        console.error("No relevant context found in your knowledge base for this question.");
        process.exit(1);
      }

      const contextDocs = results.map((r) => docs[r.id]);
      const { system, user } = buildRagPrompt(question, contextDocs);

      console.log(chalk.dim(`  Found ${results.length} sources. Asking ${provider}...`));

      try {
        const answer = await chat(system, user, {
          provider: opts.provider || undefined,
          model: opts.model || undefined,
        });

        console.log("");
        console.log(chalk.white.bold("  Based on your Super-Brain knowledge base:"));
        console.log("");
        for (const line of answer.split("\n")) {
          console.log("  " + line);
        }
        console.log("");
        console.log(chalk.dim("  Sources:"));
        for (const doc of contextDocs) {
          console.log(chalk.dim(`    • ${doc.topicTitle} / ${doc.title}`));
        }
        console.log("");
      } catch (err) {
        console.error(chalk.red("LLM error: ") + err.message);
        process.exit(1);
      }
    });
}
