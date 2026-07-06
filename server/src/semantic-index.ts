import type { IndexRecord } from './data.js';
import { embedTexts } from './ollama.js';
import { cosineSimilarity } from './similarity.js';

type EmbeddedRecord = IndexRecord & {
  embedding: number[];
};

export type SemanticMatch = IndexRecord & {
  score: number;
};

export class SemanticIndex {
  private constructor(private readonly records: EmbeddedRecord[]) {}

  static async create(records: IndexRecord[]): Promise<SemanticIndex> {
    if (records.length === 0)
      throw new Error('Cannot create an empty semantic index');

    const embeddings = await embedTexts(
      records.map(record => `search_document: ${record.question}`)
    );

    const embeddedRecords = records.map((record, i) => {
      const embedding = embeddings[i];

      if (!embedding)
        throw new Error(`Missing embedding for question "${record.question}"`);

      return {
        ...record,
        embedding
      };
    });

    return new SemanticIndex(embeddedRecords);
  }

  async search(query: string): Promise<SemanticMatch[]> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) return [];

    const [queryEmbedding] = await embedTexts([
      `search_query: ${normalizedQuery}`
    ]);

    if (!queryEmbedding)
      throw new Error('Ollama did not return a query embedding');

    return this.records
      .map(({ embedding, ...record }) => ({
        ...record,
        score: cosineSimilarity(queryEmbedding, embedding)
      }))
      .sort((left, right) => right.score - left.score);
  }

  get size(): number {
    return this.records.length;
  }
}
