import { existsSync, statSync } from "fs";
import { join, resolve } from "path";

/**
 * Walk up from `start` until we find a directory that looks like a
 * super-brain repo (has site/topics/ or site/data.js).
 */
export function findRepoRoot(start) {
  let dir = resolve(start || process.cwd());
  const root = resolve("/");
  while (true) {
    if (looksLikeSuperBrain(dir)) return dir;
    const parent = resolve(dir, "..");
    if (parent === dir || dir === root) break;
    dir = parent;
  }
  return null;
}

function looksLikeSuperBrain(dir) {
  return (
    existsSync(join(dir, "site", "topics")) ||
    existsSync(join(dir, "site", "data.js"))
  );
}

/**
 * Detect layout: multi-topic (site/topics/*) or single (site/data.js).
 */
export function detectLayout(repoRoot) {
  const topicsDir = join(repoRoot, "site", "topics");
  if (existsSync(topicsDir) && statSync(topicsDir).isDirectory()) {
    return "multi";
  }
  if (existsSync(join(repoRoot, "site", "data.js"))) {
    return "single";
  }
  return null;
}
