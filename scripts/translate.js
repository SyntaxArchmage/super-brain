#!/usr/bin/env node
/**
 * Translates data.js (EN) → data-cn.js (CN) using Google Translate (free, no API key).
 * Only re-translates fields whose content hash has changed.
 *
 * Usage:
 *   node translate.js                          # legacy: site/data.js
 *   node translate.js site/topics/foo/data.js  # multi-topic: specific topic
 *   node translate.js --dry-run
 *
 * Zero API keys required. Uses Google's free translation endpoint directly.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

// Accept optional positional arg for the data.js path (multi-topic support)
const positionalArgs = process.argv.slice(2).filter(a => !a.startsWith("--"));
const DATA_PATH = positionalArgs.length > 0
  ? resolve(REPO_ROOT, positionalArgs[0])
  : resolve(REPO_ROOT, "site/data.js");
const DATA_CN_PATH = resolve(dirname(DATA_PATH), "data-cn.js");
const HASH_PATH = resolve(__dirname, ".translate-hashes.json");

const DRY_RUN = process.argv.includes("--dry-run");

function md5(str) {
  return createHash("md5").update(str).digest("hex");
}

function loadWiki() {
  const src = readFileSync(DATA_PATH, "utf-8");
  const fn = new Function(src + "\n; return WIKI;");
  return fn();
}

function loadExistingCN() {
  if (!existsSync(DATA_CN_PATH)) return { pages: {}, concepts: {}, taxonomy: [] };
  const src = readFileSync(DATA_CN_PATH, "utf-8");
  const fn = new Function(src + "\n; return WIKI_CN;");
  try { return fn(); } catch { return { pages: {}, concepts: {}, taxonomy: [] }; }
}

function loadHashes() {
  if (!existsSync(HASH_PATH)) return {};
  try { return JSON.parse(readFileSync(HASH_PATH, "utf-8")); } catch { return {}; }
}

function saveHashes(hashes) {
  writeFileSync(HASH_PATH, JSON.stringify(hashes, null, 2));
}

function extractTranslatableFields(wiki) {
  const fields = [];

  for (const domain of wiki.taxonomy) {
    fields.push({ key: `taxonomy.${domain.id}.label`, value: domain.label });
    for (const child of domain.children) {
      fields.push({ key: `taxonomy.${domain.id}.${child.id}.label`, value: child.label });
    }
  }

  for (const [id, page] of Object.entries(wiki.pages)) {
    if (page.title) fields.push({ key: `pages.${id}.title`, value: page.title });
    if (page.subtitle) fields.push({ key: `pages.${id}.subtitle`, value: page.subtitle });
    if (page.body) fields.push({ key: `pages.${id}.body`, value: page.body });
  }

  if (wiki.concepts) {
    for (const [id, concept] of Object.entries(wiki.concepts)) {
      if (concept.name) fields.push({ key: `concepts.${id}.name`, value: concept.name });
      if (concept.role) fields.push({ key: `concepts.${id}.role`, value: concept.role });
      if (concept.summary) fields.push({ key: `concepts.${id}.summary`, value: concept.summary });
      if (concept.definition) fields.push({ key: `concepts.${id}.definition`, value: concept.definition });
      if (concept.examples) fields.push({ key: `concepts.${id}.examples`, value: concept.examples });
    }
  }

  return fields;
}

function findChangedFields(fields, hashes) {
  const changed = [];
  for (const f of fields) {
    const hash = md5(f.value);
    if (hashes[f.key] !== hash) {
      changed.push({ ...f, hash });
    }
  }
  return changed;
}

/**
 * Translate text using Google Translate's free endpoint.
 * Splits long text into chunks to avoid URL length limits.
 */
async function googleTranslate(text, from = "en", to = "zh-CN") {
  if (!text.trim()) return text;

  const MAX_CHUNK = 4500;
  if (text.length <= MAX_CHUNK) {
    return await googleTranslateChunk(text, from, to);
  }

  // Split on sentence boundaries or HTML tags for long texts
  const chunks = splitIntoChunks(text, MAX_CHUNK);
  const results = [];
  for (const chunk of chunks) {
    results.push(await googleTranslateChunk(chunk, from, to));
    await sleep(300);
  }
  return results.join("");
}

function splitIntoChunks(text, maxLen) {
  const chunks = [];
  let remaining = text;

  while (remaining.length > maxLen) {
    let splitAt = remaining.lastIndexOf(">", maxLen);
    if (splitAt === -1 || splitAt < maxLen * 0.3) {
      splitAt = remaining.lastIndexOf(". ", maxLen);
    }
    if (splitAt === -1 || splitAt < maxLen * 0.3) {
      splitAt = remaining.lastIndexOf(" ", maxLen);
    }
    if (splitAt === -1) splitAt = maxLen;
    else splitAt += 1;

    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function googleTranslateChunk(text, from, to) {
  const url = "https://translate.googleapis.com/translate_a/single?" +
    new URLSearchParams({
      client: "gtx",
      sl: from,
      tl: to,
      dt: "t",
      q: text
    }).toString();

  const resp = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  if (!resp.ok) {
    console.warn(`    Google Translate returned ${resp.status}, keeping original`);
    return text;
  }

  const data = await resp.json();
  // Response format: [[["translated","original",...],...],...}
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data[0].map(segment => segment[0]).join("");
  }
  return text;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function translateBatch(fields) {
  const results = [];

  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    console.log(`  [${i + 1}/${fields.length}] ${f.key} (${f.value.length} chars)...`);

    const translated = await googleTranslate(f.value);
    results.push({ key: f.key, hash: f.hash, translated });

    // Rate limit: 500ms between requests
    if (i < fields.length - 1) {
      await sleep(500);
    }
  }

  return results;
}

function buildCNObject(wiki, translations) {
  const existing = loadExistingCN();
  const cn = {
    taxonomy: existing.taxonomy || [],
    pages: { ...existing.pages },
    concepts: { ...existing.concepts }
  };

  const txMap = {};
  for (const t of translations) { txMap[t.key] = t.translated; }

  const taxonomyCN = [];
  for (const domain of wiki.taxonomy) {
    const domainCN = {
      id: domain.id,
      label: txMap[`taxonomy.${domain.id}.label`] || existing.taxonomy?.find(d => d.id === domain.id)?.label || domain.label,
      children: []
    };
    for (const child of domain.children) {
      domainCN.children.push({
        id: child.id,
        label: txMap[`taxonomy.${domain.id}.${child.id}.label`] ||
          existing.taxonomy?.find(d => d.id === domain.id)?.children?.find(c => c.id === child.id)?.label ||
          child.label,
        type: child.type
      });
    }
    taxonomyCN.push(domainCN);
  }
  cn.taxonomy = taxonomyCN;

  for (const [id, page] of Object.entries(wiki.pages)) {
    if (!cn.pages[id]) cn.pages[id] = {};
    if (txMap[`pages.${id}.title`]) cn.pages[id].title = txMap[`pages.${id}.title`];
    if (txMap[`pages.${id}.subtitle`]) cn.pages[id].subtitle = txMap[`pages.${id}.subtitle`];
    if (txMap[`pages.${id}.body`]) cn.pages[id].body = txMap[`pages.${id}.body`];
  }

  if (wiki.concepts) {
    for (const [id, concept] of Object.entries(wiki.concepts)) {
      if (!cn.concepts[id]) cn.concepts[id] = {};
      if (txMap[`concepts.${id}.name`]) cn.concepts[id].name = txMap[`concepts.${id}.name`];
      if (txMap[`concepts.${id}.role`]) cn.concepts[id].role = txMap[`concepts.${id}.role`];
      if (txMap[`concepts.${id}.summary`]) cn.concepts[id].summary = txMap[`concepts.${id}.summary`];
      if (txMap[`concepts.${id}.definition`]) cn.concepts[id].definition = txMap[`concepts.${id}.definition`];
      if (txMap[`concepts.${id}.examples`]) cn.concepts[id].examples = txMap[`concepts.${id}.examples`];
    }
  }

  return cn;
}

function serializeCN(cn) {
  let out = "const WIKI_CN = ";
  out += JSON.stringify(cn, null, 2);
  out += ";\n";
  return out;
}

async function main() {
  console.log("Loading data.js...");
  const wiki = loadWiki();
  const hashes = loadHashes();

  console.log("Extracting translatable fields...");
  const fields = extractTranslatableFields(wiki);
  console.log(`  Found ${fields.length} translatable fields.`);

  const changed = findChangedFields(fields, hashes);
  console.log(`  ${changed.length} field(s) need translation.`);

  if (changed.length === 0) {
    console.log("Nothing to translate — data-cn.js is up to date.");
    return;
  }

  if (DRY_RUN) {
    console.log("\n[DRY RUN] Would translate these fields:");
    for (const f of changed) {
      console.log(`  - ${f.key} (${f.value.length} chars)`);
    }
    return;
  }

  console.log("\nTranslating via Google Translate (free, no API key)...");
  const translations = await translateBatch(changed);

  console.log("\nBuilding data-cn.js...");
  const cn = buildCNObject(wiki, translations);
  const output = serializeCN(cn);
  writeFileSync(DATA_CN_PATH, output, "utf-8");
  console.log(`  Written to ${DATA_CN_PATH} (${output.length} bytes)`);

  for (const t of translations) {
    if (t.translated) hashes[t.key] = t.hash;
  }
  saveHashes(hashes);
  console.log("Done.");
}

main().catch(err => {
  console.error("Translation failed:", err.message);
  process.exit(1);
});
