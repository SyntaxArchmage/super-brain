#!/usr/bin/env node
/**
 * Translates data.js (EN) → data-cn.js (CN) using an LLM API.
 * Only re-translates fields whose content hash has changed.
 *
 * Usage:
 *   TRANSLATE_API_KEY=sk-... node translate.js
 *   node translate.js --dry-run
 *
 * Env vars:
 *   TRANSLATE_API_KEY  — OpenAI API key (required unless --dry-run)
 *   TRANSLATE_MODEL    — model name (default: gpt-4o-mini)
 *   TRANSLATE_BASE_URL — custom API base URL (optional, for compatible providers)
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
const MODEL = process.env.TRANSLATE_MODEL || "gpt-4o-mini";
const API_KEY = process.env.TRANSLATE_API_KEY;
const BASE_URL = process.env.TRANSLATE_BASE_URL || undefined;

if (!DRY_RUN && !API_KEY) {
  console.error("Error: TRANSLATE_API_KEY env var is required (or use --dry-run)");
  process.exit(1);
}

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

const SYSTEM_PROMPT = `You are a professional technical translator for a personal knowledge wiki about compilers, AI infrastructure, high-performance computing, and programming language theory.

Rules:
- Translate English to natural, idiomatic Simplified Chinese suitable for a Chinese software engineer audience.
- Preserve ALL HTML tags, attributes, code blocks (<pre>, <code>), and their contents EXACTLY unchanged.
- Preserve technical terms that are universally used in English: MLIR, LLVM, SSA, IR, TensorFlow, XLA, HLO, CUDA, GPU, CPU, API, etc.
- For terms that have well-known Chinese translations, use them: compiler=编译器, optimization=优化, abstraction=抽象, etc.
- Keep proper nouns (project names, people names) unchanged.
- Output ONLY the translated text, no explanations or markdown wrappers.`;

async function translateBatch(fields) {
  const baseURL = BASE_URL || "https://api.openai.com/v1";
  const results = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < fields.length; i += BATCH_SIZE) {
    const batch = fields.slice(i, i + BATCH_SIZE);
    const prompt = batch.map((f, idx) =>
      `--- FIELD ${idx + 1} [${f.key}] ---\n${f.value}`
    ).join("\n\n");

    const userMsg = `Translate each field below to Simplified Chinese. Return the translations in the same order, separated by the same "--- FIELD N [key] ---" delimiters. Keep code blocks and HTML tags unchanged.\n\n${prompt}`;

    console.log(`  Translating batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(fields.length / BATCH_SIZE)} (${batch.length} fields)...`);

    const resp = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg }
        ],
        temperature: 0.3,
        max_tokens: 16000
      })
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      throw new Error(`API request failed (${resp.status}): ${errBody}`);
    }

    const data = await resp.json();
    const text = data.choices[0].message.content;
    const parts = text.split(/---\s*FIELD\s+\d+\s*\[.*?\]\s*---/).filter(s => s.trim());

    for (let j = 0; j < batch.length; j++) {
      results.push({
        key: batch[j].key,
        hash: batch[j].hash,
        translated: (parts[j] || "").trim()
      });
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

  // Rebuild taxonomy translations
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
  console.log("🔍 Loading data.js...");
  const wiki = loadWiki();
  const hashes = loadHashes();

  console.log("📝 Extracting translatable fields...");
  const fields = extractTranslatableFields(wiki);
  console.log(`   Found ${fields.length} translatable fields.`);

  const changed = findChangedFields(fields, hashes);
  console.log(`   ${changed.length} field(s) need translation.`);

  if (changed.length === 0) {
    console.log("✅ Nothing to translate — data-cn.js is up to date.");
    return;
  }

  if (DRY_RUN) {
    console.log("\n[DRY RUN] Would translate these fields:");
    for (const f of changed) {
      console.log(`  - ${f.key} (${f.value.length} chars)`);
    }
    return;
  }

  console.log("\n🌐 Translating via LLM...");
  const translations = await translateBatch(changed);

  console.log("\n📦 Building data-cn.js...");
  const cn = buildCNObject(wiki, translations);
  const output = serializeCN(cn);
  writeFileSync(DATA_CN_PATH, output, "utf-8");
  console.log(`   Written to ${DATA_CN_PATH} (${output.length} bytes)`);

  // Update hashes
  for (const t of translations) {
    if (t.translated) hashes[t.key] = t.hash;
  }
  saveHashes(hashes);
  console.log("✅ Done.");
}

main().catch(err => {
  console.error("Translation failed:", err.message);
  process.exit(1);
});
