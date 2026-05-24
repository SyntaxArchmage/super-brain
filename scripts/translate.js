#!/usr/bin/env node
/**
 * Translates data.js (EN) → data-cn.js (CN) using Google Translate (free, no API key).
 * Only re-translates fields whose content hash has changed.
 *
 * Usage:
 *   node translate.js
 *   node translate.js --dry-run
 *
 * Zero API keys required. Uses Google Translate via @yxw007/translate.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_DIR = resolve(__dirname, "../site");
const DATA_PATH = resolve(SITE_DIR, "data.js");
const DATA_CN_PATH = resolve(SITE_DIR, "data-cn.js");
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
 * Strip HTML tags for translation, then restore them.
 * For fields containing HTML (body, examples), we translate text content only.
 */
function stripHtmlForTranslation(html) {
  const tokens = [];
  let idx = 0;
  const regex = /(<[^>]+>|<\/[^>]+>)/g;
  let match;
  let lastEnd = 0;

  while ((match = regex.exec(html)) !== null) {
    if (match.index > lastEnd) {
      tokens.push({ type: "text", value: html.slice(lastEnd, match.index) });
    }
    tokens.push({ type: "tag", value: match[0] });
    lastEnd = regex.lastIndex;
  }
  if (lastEnd < html.length) {
    tokens.push({ type: "text", value: html.slice(lastEnd) });
  }

  return tokens;
}

async function translateText(text, translator) {
  if (!text.trim()) return text;
  // Preserve leading/trailing whitespace
  const leadingWs = text.match(/^(\s*)/)[0];
  const trailingWs = text.match(/(\s*)$/)[0];
  const trimmed = text.trim();
  if (!trimmed) return text;

  try {
    const result = await translator.translate(trimmed, { from: "en", to: "zh" });
    if (typeof result === "string") return leadingWs + result + trailingWs;
    if (Array.isArray(result)) return leadingWs + result[0] + trailingWs;
    return text;
  } catch {
    return text;
  }
}

async function translateHtml(html, translator) {
  const tokens = stripHtmlForTranslation(html);
  const results = [];

  for (const token of tokens) {
    if (token.type === "tag") {
      results.push(token.value);
    } else {
      // Skip code content inside <pre> or <code>
      const lastTag = results.join("").match(/<(pre|code)[^>]*>(?!.*<\/\1>)/is);
      if (lastTag) {
        results.push(token.value);
      } else {
        results.push(await translateText(token.value, translator));
      }
    }
  }

  return results.join("");
}

async function translateField(field, translator) {
  const isHtml = field.value.includes("<") && (
    field.key.endsWith(".body") ||
    field.key.endsWith(".examples") ||
    field.key.endsWith(".definition")
  );

  if (isHtml) {
    return await translateHtml(field.value, translator);
  }
  return await translateText(field.value, translator);
}

async function translateBatch(fields) {
  const { translator, engines } = await import("@yxw007/translate");
  translator.addEngine(engines.google);

  const results = [];

  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    console.log(`  [${i + 1}/${fields.length}] ${f.key} (${f.value.length} chars)...`);

    const translated = await translateField(f, translator);
    results.push({ key: f.key, hash: f.hash, translated });

    // Small delay to avoid rate limiting
    if (i < fields.length - 1) {
      await new Promise(r => setTimeout(r, 200));
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
