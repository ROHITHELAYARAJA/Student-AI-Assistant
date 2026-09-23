import { Request, Response } from 'express';
import { ALL_OPERATIONS } from '../services/operationsList.js';
import { processStudyRequest } from '../services/aiService.js';
import { StudyRequest } from '../types/index.js';

export async function handleAssist(req: Request, res: Response): Promise<void> {
  try {
    const studyReq: StudyRequest = {
      content: req.body.content || '',
      operation: req.body.operation || 'summarize',
      researchGoal: req.body.researchGoal,
      programmingLanguage: req.body.programmingLanguage || req.body.ProgrammingLanguage,
      subject: req.body.subject,
      studyTopic: req.body.studyTopic
    };

    const response = await processStudyRequest(studyReq);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to process request',
      message: error?.message || 'Unknown processing error'
    });
  }
}

export function handleGetOperations(_req: Request, res: Response): void {
  res.json({
    total: ALL_OPERATIONS.length,
    operations: ALL_OPERATIONS
  });
}

export function handleHealth(_req: Request, res: Response): void {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
}
