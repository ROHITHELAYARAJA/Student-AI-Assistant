import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleAssist, handleGetOperations, handleHealth } from './controllers/assistController.js';
import {
  handleGenerateRoadmap,
  handleGenerateLesson,
  handleGenerateNotes,
  handleGenerateFlashcards,
  handleGenerateQuiz,
  handleGeneratePodcast,
  handleGenerateStudyPack,
  handleTurboChat,
  handleRagIngest,
  handleRagList,
  handleRagQuery,
  handleRagDelete
} from './controllers/turboController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.get('/api/health', handleHealth);
app.get('/api/operations', handleGetOperations);
app.post('/api/assist', handleAssist);

app.post('/api/turbo/chat', handleTurboChat);
app.post('/api/turbo/generate-study-pack', handleGenerateStudyPack);
app.post('/api/turbo/generate-roadmap', handleGenerateRoadmap);
app.post('/api/turbo/generate-lesson', handleGenerateLesson);
app.post('/api/turbo/generate-notes', handleGenerateNotes);
app.post('/api/turbo/generate-flashcards', handleGenerateFlashcards);
app.post('/api/turbo/generate-quiz', handleGenerateQuiz);
app.post('/api/turbo/generate-podcast', handleGeneratePodcast);

app.post('/api/rag/ingest', handleRagIngest);
app.get('/api/rag/documents', handleRagList);
app.post('/api/rag/query', handleRagQuery);
app.delete('/api/rag/documents/:id', handleRagDelete);

app.listen(PORT, () => {
  process.stdout.write(`Turbo AI Study Assistant backend server running on http://localhost:${PORT}\n`);
});

export default app;
