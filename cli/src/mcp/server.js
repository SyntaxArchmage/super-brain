import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { findRepoRoot } from "../core/config.js";
import { loadAllTopics } from "../core/loader.js";
import { buildIndex, stripHtml } from "../core/indexer.js";

let _topics = null;
let _searchData = null;

function getTopics(repoRoot) {
  if (!_topics) _topics = loadAllTopics(repoRoot);
  return _topics;
}

function getSearchData(repoRoot) {
  if (!_searchData) _searchData = buildIndex(getTopics(repoRoot));
  return _searchData;
}

export async function startMcpServer(repoRoot) {
  const root = repoRoot || findRepoRoot();
  if (!root) {
    process.stderr.write("Error: could not find super-brain repo.\n");
    process.exit(1);
  }

  const server = new McpServer({
    name: "super-brain",
    version: "0.1.0",
  });

  server.tool(
    "sb_search",
    "Search the user's personal knowledge base for articles and concepts",
    {
      query: z.string().describe("Search query"),
      topic: z.string().optional().describe("Limit to a specific topic ID"),
      limit: z.number().optional().default(5).describe("Max results"),
    },
    async ({ query, topic, limit }) => {
      const { index, docs } = getSearchData(root);
      let results = index.search(query, {
        ...(topic ? { filter: (r) => docs[r.id]?.topic === topic } : {}),
      });
      results = results.slice(0, limit || 5);

      const formatted = results.map((r) => {
        const doc = docs[r.id];
        const snippet = (doc.bodyPlain || doc.subtitle || "").slice(0, 300);
        return {
          topic: doc.topicTitle,
          title: doc.title,
          type: doc.type,
          score: Math.round(r.score),
          snippet,
          concepts: doc.conceptNames ? doc.conceptNames.split(" ").filter(Boolean).slice(0, 8) : [],
        };
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ query, results: formatted, totalResults: formatted.length }, null, 2),
        }],
      };
    }
  );

  server.tool(
    "sb_concept",
    "Look up a specific concept in the user's knowledge base",
    {
      name: z.string().describe("Concept name to look up"),
      topic: z.string().optional().describe("Limit to a specific topic"),
    },
    async ({ name, topic: topicFilter }) => {
      const topics = getTopics(root);
      const needle = name.toLowerCase();
      let found = null;
      let topicTitle = "";

      for (const t of topics) {
        if (topicFilter && t.id !== topicFilter) continue;
        if (!t.wiki.concepts) continue;
        for (const [cId, concept] of Object.entries(t.wiki.concepts)) {
          if (cId === needle || (concept.name && concept.name.toLowerCase() === needle)) {
            found = { ...concept };
            if (found.definition) found.definition = stripHtml(found.definition);
            if (found.examples) found.examples = stripHtml(found.examples);
            topicTitle = t.meta.title || t.id;
            break;
          }
        }
        if (found) break;
      }

      if (!found) {
        return { content: [{ type: "text", text: `Concept "${name}" not found in the knowledge base.` }] };
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ topic: topicTitle, concept: found }, null, 2),
        }],
      };
    }
  );

  server.tool(
    "sb_context",
    "Generate a concise knowledge brief from the user's research, optimized for inclusion in prompts",
    {
      subject: z.string().describe("Subject to generate context for"),
      topic: z.string().optional().describe("Limit to a specific topic ID"),
      maxTokens: z.number().optional().default(500).describe("Approximate max tokens"),
    },
    async ({ subject, topic, maxTokens }) => {
      const { index, docs } = getSearchData(root);
      let results = index.search(subject, {
        ...(topic ? { filter: (r) => docs[r.id]?.topic === topic } : {}),
      });
      results = results.slice(0, 3);

      if (results.length === 0) {
        return { content: [{ type: "text", text: `No knowledge found for "${subject}".` }] };
      }

      const maxChars = (maxTokens || 500) * 4;
      let charBudget = maxChars;
      const sections = [];

      for (const r of results) {
        const doc = docs[r.id];
        if (!doc) continue;
        const body = doc.bodyPlain || doc.subtitle || "";
        const truncated = body.slice(0, Math.max(100, charBudget));
        charBudget -= truncated.length;

        sections.push({
          title: doc.title,
          source: `${doc.topicTitle} / ${doc.title}`,
          content: truncated + (truncated.length < body.length ? "..." : ""),
          concepts: doc.conceptNames ? doc.conceptNames.split(" ").filter(Boolean).slice(0, 8) : [],
        });

        if (charBudget <= 0) break;
      }

      const brief = `## ${subject} (Knowledge Brief)\n\n` +
        sections.map((s) =>
          `### ${s.title}\n${s.content}\n\nConcepts: ${s.concepts.join(", ")}\nSource: ${s.source}`
        ).join("\n\n");

      return { content: [{ type: "text", text: brief }] };
    }
  );

  server.tool(
    "sb_compare",
    "Compare two concepts using the user's accumulated research notes",
    {
      a: z.string().describe("First concept or term"),
      b: z.string().describe("Second concept or term"),
    },
    async ({ a, b }) => {
      const topics = getTopics(root);
      const find = (name) => {
        const needle = name.toLowerCase();
        for (const t of topics) {
          if (!t.wiki.concepts) continue;
          for (const [cId, concept] of Object.entries(t.wiki.concepts)) {
            if (cId === needle || (concept.name && concept.name.toLowerCase() === needle)) {
              const c = { ...concept };
              if (c.definition) c.definition = stripHtml(c.definition);
              if (c.examples) c.examples = stripHtml(c.examples);
              c._topic = t.meta.title || t.id;
              return c;
            }
          }
        }
        return null;
      };

      const cA = find(a);
      const cB = find(b);

      if (!cA && !cB) {
        return { content: [{ type: "text", text: `Neither "${a}" nor "${b}" found in the knowledge base.` }] };
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            comparison: { a: cA || { name: a, note: "not found" }, b: cB || { name: b, note: "not found" } },
          }, null, 2),
        }],
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
