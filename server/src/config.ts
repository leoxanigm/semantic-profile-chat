function numberFromEnv(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);

  if (!Number.isFinite(value) || Number.isNaN(value))
    throw new Error(`${name} must be a valid number`);

  return value;
}

export const config = {
  port: numberFromEnv('PORT', 3000),
  ollamaUrl: (process.env.OLLAMA_URL ?? 'http://localhost:11434')
    .replace(/\/+$/, ''),
  embeddingModel: process.env.EMBEDDING_MODEL ?? 'nomic-embed-text',
  matchThreshold: numberFromEnv('MATCH_THRESHOLD', 0.6),
  queryMaxLength: numberFromEnv('QUERY_MAX_LENGTH', 500),
  suggestionCount: numberFromEnv('SUGGESTION_COUNT', 3)
};
