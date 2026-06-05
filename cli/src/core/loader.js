import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import vm from "vm";
import { detectLayout } from "./config.js";

/**
 * Load all topic data from the super-brain repo.
 * Returns an array of { id, meta, wiki } objects.
 */
export function loadAllTopics(repoRoot) {
  const layout = detectLayout(repoRoot);
  if (layout === "multi") return loadMultiTopics(repoRoot);
  if (layout === "single") return loadSingleTopic(repoRoot);
  throw new Error("Could not detect super-brain layout in " + repoRoot);
}

function loadMultiTopics(repoRoot) {
  const topicsDir = join(repoRoot, "site", "topics");
  const entries = readdirSync(topicsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory());

  const topics = [];
  for (const entry of entries) {
    const dir = join(topicsDir, entry.name);
    const dataPath = join(dir, "data.js");
    if (!existsSync(dataPath)) continue;

    const wiki = evalDataJs(dataPath);
    if (!wiki) continue;

    let meta = null;
    const metaPath = join(dir, "topic-meta.json");
    if (existsSync(metaPath)) {
      try { meta = JSON.parse(readFileSync(metaPath, "utf-8")); } catch { /* skip */ }
    }

    topics.push({
      id: meta?.id || entry.name,
      meta: meta || { id: entry.name, title: entry.name },
      wiki,
    });
  }
  return topics;
}

function loadSingleTopic(repoRoot) {
  const dataPath = join(repoRoot, "site", "data.js");
  const wiki = evalDataJs(dataPath);
  if (!wiki) return [];
  return [{ id: "default", meta: { id: "default", title: "Super Brain" }, wiki }];
}

function evalDataJs(filePath) {
  const code = readFileSync(filePath, "utf-8");
  // data.js uses `const WIKI = {...}` — wrap in a function to capture the value
  const wrapped = code + "\n;WIKI;";
  const ctx = vm.createContext({});
  try {
    const script = new vm.Script(wrapped, { filename: filePath });
    return script.runInContext(ctx) || null;
  } catch {
    return null;
  }
}
