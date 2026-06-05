import { existsSync, statSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { homedir } from "os";

const CONFIG_DIR = join(homedir(), ".config", "super-brain");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

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

/**
 * Read persisted config.
 */
export function readConfig() {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

/**
 * Write persisted config.
 */
export function writeConfig(config) {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n");
}

/**
 * Get the remote URL from --remote flag, config, or env.
 * Returns null if not configured (local mode).
 */
export function getRemoteUrl(opts) {
  if (opts?.remote && typeof opts.remote === "string") return opts.remote;
  if (process.env.SB_REMOTE_URL) return process.env.SB_REMOTE_URL;
  const config = readConfig();
  if (config.remoteUrl) return config.remoteUrl;
  return null;
}
