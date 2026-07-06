import express from 'express';
import { config } from './config.js';
import { readData, createIndexRecords } from './data.js';
import { embedTexts } from './ollama.js';

async function start(): Promise<void> {
  const dataModel = readData();
  const indexRecords = createIndexRecords(dataModel);

  console.info(
    `Loaded ${dataModel.length} answers and ${indexRecords.length} questions`
  );

  const embeddings = await embedTexts(
    indexRecords.map(record => `search_document: ${record.question}`)
  );

  console.info(`Created ${embeddings.length} embeddings`);

  const app = express();
  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    response.json({
      status: 'ready',
      answers: dataModel.length,
      questions: indexRecords.length
    });
  });

  app.listen(config.port, '0.0.0.0', () => {
    console.info(`API listening on port ${config.port}`);
  });
}

start().catch((error: unknown) => {
  console.error('API startup failed:', error);
  process.exit(1);
});

// const dataModel = readData();
// const indexRecords = createIndexRecords(dataModel);

// const app = express();
// const port = Number(process.env.PORT ?? 3000);

// app.get('/api/health', (req, res) => {
//   res.send('service healty');
// });

// app.listen(port, '0.0.0.0', () => {
//   console.info('API listening on port ${port}')
// });
