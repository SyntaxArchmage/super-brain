import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { join, extname } from "path";
import chalk from "chalk";
import { findRepoRoot } from "../core/config.js";

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

export function registerServe(program) {
  program
    .command("serve")
    .description("Start a local preview server")
    .option("--topic <id>", "Serve only one topic")
    .option("--port <n>", "Port number", "8090")
    .action((opts) => {
      const root = findRepoRoot();
      if (!root) {
        console.error("Error: could not find a super-brain repo.");
        process.exit(1);
      }

      const siteDir = opts.topic
        ? join(root, "site", "topics", opts.topic)
        : join(root, "site");

      if (!existsSync(siteDir)) {
        console.error(`Directory not found: ${siteDir}`);
        process.exit(1);
      }

      const port = parseInt(opts.port, 10);
      const server = createServer((req, res) => {
        let url = decodeURIComponent(req.url.split("?")[0]);
        let filePath = join(siteDir, url);

        if (statSync(filePath, { throwIfNoEntry: false })?.isDirectory()) {
          filePath = join(filePath, "index.html");
        }

        if (!existsSync(filePath)) {
          // For topic-only mode, also check the root site/ for shared assets
          if (opts.topic) {
            const altPath = join(root, "site", url);
            if (existsSync(altPath)) {
              filePath = altPath;
            }
          }
        }

        if (!existsSync(filePath)) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }

        const ext = extname(filePath);
        const mime = MIME[ext] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": mime });
        res.end(readFileSync(filePath));
      });

      server.listen(port, () => {
        console.log(chalk.green("✓") + ` Serving at ${chalk.cyan(`http://localhost:${port}/`)}`);
        if (opts.topic) {
          console.log(chalk.dim(`  Topic: ${opts.topic}`));
        }
        console.log(chalk.dim("  Press Ctrl+C to stop."));
      });
    });
}
