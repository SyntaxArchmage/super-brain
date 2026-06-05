/**
 * Build a RAG prompt from search results and user question.
 */
export function buildRagPrompt(question, contextDocs) {
  const contextBlock = contextDocs.map((doc, i) => {
    const body = (doc.bodyPlain || doc.subtitle || "").slice(0, 800);
    const concepts = doc.conceptNames
      ? doc.conceptNames.split(" ").filter(Boolean).slice(0, 6).join(", ")
      : "";
    return (
      `[Source ${i + 1}: ${doc.topicTitle} / ${doc.title}]\n` +
      body +
      (concepts ? `\nKey concepts: ${concepts}` : "")
    );
  }).join("\n\n---\n\n");

  return {
    system: `You are a knowledgeable assistant with access to the user's personal knowledge base (Super-Brain). Answer questions based ONLY on the provided context. If the context doesn't contain enough information, say so. Always cite source articles by name.`,
    user: `Context from my knowledge base:\n\n${contextBlock}\n\n---\n\nQuestion: ${question}`,
  };
}
