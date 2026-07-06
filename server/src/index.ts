import express from 'express';
import { z } from 'zod';
import { config } from './config.js';
import { createIndexRecords, readData } from './data.js';
import { SemanticIndex } from './semantic-index.js';

const QuerySchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, 'Question is required')
    .max(
      config.queryMaxLength,
      `Question cannot exceed ${config.queryMaxLength} characters`
    )
});

async function start(): Promise<void> {
  const dataModel = readData();
  const indexRecords = createIndexRecords(dataModel);
  const semanticIndex = await SemanticIndex.create(indexRecords);

  console.info(
    `Indexed ${semanticIndex.size} questions from ${dataModel.length} answers`
  );

  const app = express();

  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, response) => {
    response.json({
      status: 'ready',
      answers: dataModel.length,
      questions: semanticIndex.size
    });
  });

  app.post('/api/query', async (request, response) => {
    const validation = QuerySchema.safeParse(request.body);

    if (!validation.success) {
      response.status(400).json({
        error: z.prettifyError(validation.error)
      });

      return;
    }

    try {
      const results = await semanticIndex.search(validation.data.question);
      const bestMatch = results[0];

      if (bestMatch && bestMatch.score >= config.matchThreshold) {
        response.json({
          matched: true,
          answer: bestMatch.answer
        });

        return;
      }

      const suggestions = Array.from(
        new Set(results.map(result => result.question))
      ).slice(0, config.suggestionCount);

      response.json({
        matched: false,
        message: 'I could not find a reliable answer.',
        suggestions
      });
    } catch (error) {
      console.error('Semantic query failed:', error);

      response.status(502).json({
        error: 'The semantic search service is unavailable.'
      });
    }
  });

  app.listen(config.port, '0.0.0.0', () => {
    console.info(`API listening on port ${config.port}`);
  });
}

start().catch(error => {
  console.error('API startup failed', error);
  process.exit(1);
});
