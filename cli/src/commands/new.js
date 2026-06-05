import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { findRepoRoot } from "../core/config.js";

export function registerNew(program) {
  program
    .command("new <topic-id>")
    .description("Scaffold a new research topic")
    .option("--title <title>", "Human-readable title")
    .action((topicId, opts) => {
      const root = findRepoRoot();
      if (!root) {
        console.error("Error: could not find a super-brain repo.");
        process.exit(1);
      }

      const dir = join(root, "site", "topics", topicId);
      if (existsSync(dir)) {
        console.error(`Topic "${topicId}" already exists at ${dir}`);
        process.exit(1);
      }

      const title = opts.title || topicId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      mkdirSync(dir, { recursive: true });

      writeFileSync(join(dir, "topic-meta.json"), JSON.stringify({
        id: topicId,
        title,
        subtitle: `Research notes on ${title}`,
        icon: title.slice(0, 2).toUpperCase(),
        color: "#1d4ed8",
        status: "draft",
        translate: false,
        updated: new Date().toISOString().slice(0, 10),
        path: `topics/${topicId}/`,
      }, null, 2) + "\n");

      writeFileSync(join(dir, "data.js"), `const WIKI = {
  taxonomy: [
    {
      id: "main",
      label: "${title}",
      children: [
        { id: "overview", label: "Overview", type: "article" }
      ]
    }
  ],

  pages: {
    index: {
      title: "${title}",
      subtitle: "Research notes on ${title}.",
      type: "index"
    },

    overview: {
      title: "Overview",
      subtitle: "Introduction to ${title}.",
      domain: "${title}",
      type: "article",
      body: \`
<h2>About</h2>
<p>Start writing your research notes here.</p>
\`,
      concepts: []
    }
  },

  concepts: {}
};
`);

      writeFileSync(join(dir, "app.js"), `(function () {
  var engine = WikiEngine.create({
    data: WIKI,
    brand: { icon: "${title.slice(0, 2).toUpperCase()}", text: "${title}" },
    homeUrl: "../../",
    features: { search: true, contributions: true }
  });
  engine.start();
})();
`);

      writeFileSync(join(dir, "index.html"), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Super Brain</title>
  <link rel="stylesheet" href="../../shared/wiki-styles.css" />
</head>
<body>
  <div class="wiki-shell">
    <nav class="taxonomy-nav" id="taxonomy-nav"></nav>
    <main class="article-area" id="article-area"></main>
    <aside class="concept-rail" id="concept-rail"></aside>
  </div>
  <script src="../../shared/wiki-framework.js"><\/script>
  <script src="./data.js"><\/script>
  <script src="./app.js"><\/script>
</body>
</html>
`);

      console.log(chalk.green("✓") + ` Created topic "${title}" at ${dir}/`);
      console.log(chalk.dim("  Files: index.html, data.js, app.js, topic-meta.json"));
      console.log(chalk.dim("  Edit data.js to add your content, then register in topic-registry.json."));
    });
}
