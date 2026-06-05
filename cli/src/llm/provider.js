/**
 * LLM provider abstraction — supports OpenAI, Anthropic, and Ollama.
 * Uses native fetch (Node 18+) to avoid extra SDK dependencies.
 */

export function detectProvider() {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OLLAMA_HOST || process.env.OLLAMA_MODEL) return "ollama";
  return null;
}

export async function chat(system, user, opts = {}) {
  const provider = opts.provider || detectProvider();
  if (!provider) {
    throw new Error(
      "No LLM provider configured. Set one of:\n" +
      "  OPENAI_API_KEY     — for OpenAI (gpt-4o, gpt-4o-mini, etc.)\n" +
      "  ANTHROPIC_API_KEY  — for Anthropic (claude-sonnet, etc.)\n" +
      "  OLLAMA_HOST        — for local Ollama (default: http://localhost:11434)"
    );
  }

  switch (provider) {
    case "openai": return chatOpenAI(system, user, opts);
    case "anthropic": return chatAnthropic(system, user, opts);
    case "ollama": return chatOllama(system, user, opts);
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}

async function chatOpenAI(system, user, opts) {
  const model = opts.model || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${body}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function chatAnthropic(system, user, opts) {
  const model = opts.model || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system,
      messages: [{ role: "user", content: user }],
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${body}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function chatOllama(system, user, opts) {
  const host = process.env.OLLAMA_HOST || "http://localhost:11434";
  const model = opts.model || process.env.OLLAMA_MODEL || "llama3.2";
  const res = await fetch(`${host}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      stream: false,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ollama API error (${res.status}): ${body}`);
  }
  const data = await res.json();
  return data.message?.content || "";
}
