import express from 'express';
import { readData, createIndexRecords } from './data.js';

const dataModel = readData();
const indexRecords = createIndexRecords(dataModel);

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.get('/api/health', (req, res) => {
  res.send('service healty');
});

app.listen(port, '0.0.0.0', () => {
  console.info('API listening on port ${port}')
});