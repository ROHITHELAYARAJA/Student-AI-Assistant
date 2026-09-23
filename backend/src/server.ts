import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleAssist, handleGetOperations, handleHealth } from './controllers/assistController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.get('/api/health', handleHealth);
app.get('/api/operations', handleGetOperations);
app.post('/api/assist', handleAssist);

app.listen(PORT, () => {
  process.stdout.write(`Student AI Assistant backend server running on http://localhost:${PORT}\n`);
});

export default app;
