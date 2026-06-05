import chalk from "chalk";
import { findRepoRoot } from "../core/config.js";
import { loadAllTopics } from "../core/loader.js";
import { stripHtml } from "../core/indexer.js";

export function registerCompare(program) {
  program
    .command("compare <a> <b>")
    .description("Side-by-side comparison of two concepts")
    .option("--format <fmt>", "Output format: text, json, md", "text")
    .action((a, b, opts) => {
      const root = findRepoRoot();
      if (!root) {
        console.error("Error: could not find a super-brain repo.");
        process.exit(1);
      }
      const topics = loadAllTopics(root);
      const cA = findConcept(topics, a);
      const cB = findConcept(topics, b);

      if (!cA) { console.error(`Concept "${a}" not found.`); process.exit(1); }
      if (!cB) { console.error(`Concept "${b}" not found.`); process.exit(1); }

      if (opts.format === "json") {
        console.log(JSON.stringify({ a: cA, b: cB }, null, 2));
        return;
      }

      const W = 36;
      const divider = "─".repeat(W);
      console.log("");
      console.log("  ┌" + divider + "┬" + divider + "┐");
      console.log("  │" + padCenter(cA.name, W) + "│" + padCenter(cB.name, W) + "│");
      console.log("  ├" + divider + "┼" + divider + "┤");

      const defA = wrap(stripHtml(cA.definition || cA.summary || "—"), W - 2);
      const defB = wrap(stripHtml(cB.definition || cB.summary || "—"), W - 2);
      const maxDef = Math.max(defA.length, defB.length);
      for (let i = 0; i < maxDef; i++) {
        console.log("  │ " + pad(defA[i] || "", W - 2) + " │ " + pad(defB[i] || "", W - 2) + " │");
      }

      console.log("  ├" + divider + "┼" + divider + "┤");
      const usedA = "Used in: " + (cA.usedIn || []).join(", ").slice(0, W - 12) || "—";
      const usedB = "Used in: " + (cB.usedIn || []).join(", ").slice(0, W - 12) || "—";
      console.log("  │ " + pad(usedA, W - 2) + " │ " + pad(usedB, W - 2) + " │");
      console.log("  └" + divider + "┴" + divider + "┘");

      const relA = new Set(cA.related || []);
      const relB = new Set(cB.related || []);
      const common = [...relA].filter((x) => relB.has(x));
      if (common.length) {
        console.log("");
        console.log(chalk.dim("  Shared related concepts: ") + chalk.cyan(common.join(", ")));
      }
      console.log("");
    });
}

function findConcept(topics, name) {
  const needle = name.toLowerCase();
  for (const topic of topics) {
    if (!topic.wiki.concepts) continue;
    for (const [cId, concept] of Object.entries(topic.wiki.concepts)) {
      if (cId === needle || (concept.name && concept.name.toLowerCase() === needle)) {
        return concept;
      }
    }
  }
  return null;
}

function pad(str, len) {
  return str.length >= len ? str.slice(0, len) : str + " ".repeat(len - str.length);
}

function padCenter(str, len) {
  if (str.length >= len) return str.slice(0, len);
  const left = Math.floor((len - str.length) / 2);
  return " ".repeat(left) + str + " ".repeat(len - str.length - left);
}

function wrap(text, width) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (line.length + word.length + 1 > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + " " + word : word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : ["—"];
}
