import * as z from 'zod';
import { config } from './config.js';

const EmbedResponseSchema = z.object({
  embeddings: z.array(z.array(z.number()))
});

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const response = await fetch(`${config.ollamaUrl}/api/embed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.embeddingModel,
      input: texts
    }),
    signal: AbortSignal.timeout(60_000)
  });

  if (!response.ok) {
    const details = await response.text();

    throw new Error(
      `Ollama embedding request failed with ${response.status}: ${details}`
    );
  }

  const result = EmbedResponseSchema.safeParse(await response.json());

  if (!result.success) {
    throw new Error(
      `Ollama returned an invalid response: ${z.prettifyError(result.error)}`
    );
  }

  if (result.data.embeddings.length !== texts.length) {
    throw new Error(
      `Expected ${texts.length} embeddings, received ${result.data.embeddings.length}`
    );
  }

  return result.data.embeddings;
}
