import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import vm from "vm";
import { detectLayout } from "./config.js";

/**
 * Load all topic data from the super-brain repo (local filesystem).
 * Returns an array of { id, meta, wiki } objects.
 */
export function loadAllTopics(repoRoot) {
  const layout = detectLayout(repoRoot);
  if (layout === "multi") return loadMultiTopics(repoRoot);
  if (layout === "single") return loadSingleTopic(repoRoot);
  throw new Error("Could not detect super-brain layout in " + repoRoot);
}

/**
 * Load all topic data from a remote GitHub Pages URL.
 * Fetches topic-registry.json, then each topic's data.js.
 */
export async function loadAllTopicsRemote(baseUrl) {
  const url = baseUrl.replace(/\/+$/, "");
  const registryRes = await fetch(`${url}/topic-registry.json`);
  if (!registryRes.ok) {
    throw new Error(`Failed to fetch topic registry from ${url}/topic-registry.json (${registryRes.status})`);
  }
  const registry = await registryRes.json();

  const allTopicMetas = [];
  if (Array.isArray(registry)) {
    allTopicMetas.push(...registry);
  } else if (registry.categories) {
    for (const cat of registry.categories) {
      if (cat.topics) allTopicMetas.push(...cat.topics);
    }
  }

  const topics = [];
  const fetches = allTopicMetas.map(async (meta) => {
    const topicPath = meta.path?.replace(/\/+$/, "") || `topics/${meta.id}`;
    const dataUrl = `${url}/${topicPath}/data.js`;
    try {
      const res = await fetch(dataUrl);
      if (!res.ok) return;
      const code = await res.text();
      const wiki = evalDataJsCode(code, dataUrl);
      if (!wiki) return;
      topics.push({ id: meta.id, meta, wiki });
    } catch { /* skip failed topics */ }
  });

  await Promise.all(fetches);
  return topics;
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

    const code = readFileSync(dataPath, "utf-8");
    const wiki = evalDataJsCode(code, dataPath);
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
  const code = readFileSync(dataPath, "utf-8");
  const wiki = evalDataJsCode(code, dataPath);
  if (!wiki) return [];
  return [{ id: "default", meta: { id: "default", title: "Super Brain" }, wiki }];
}

function evalDataJsCode(code, source) {
  const wrapped = code + "\n;WIKI;";
  const ctx = vm.createContext({});
  try {
    const script = new vm.Script(wrapped, { filename: source || "data.js" });
    return script.runInContext(ctx) || null;
  } catch {
    return null;
  }
}
