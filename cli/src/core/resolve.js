import { findRepoRoot, getRemoteUrl } from "./config.js";
import { loadAllTopics, loadAllTopicsRemote } from "./loader.js";

/**
 * Resolve topics from local repo or remote URL.
 * Prefers --remote flag, then SB_REMOTE_URL env, then config, then local.
 */
export async function resolveTopics(opts) {
  const remoteUrl = getRemoteUrl(opts);
  if (remoteUrl) {
    return loadAllTopicsRemote(remoteUrl);
  }
  const root = findRepoRoot();
  if (!root) {
    throw new Error(
      "Could not find a super-brain repo locally.\n" +
      "Either run from inside the repo, or use --remote <url> to fetch from GitHub Pages.\n" +
      'Example: sb search "MLIR" --remote https://syntaxarchmage.github.io/super-brain/'
    );
  }
  return loadAllTopics(root);
}
