import { Request, Response } from 'express';
import { ALL_OPERATIONS } from '../services/operationsList.js';
import { processStudyRequest } from '../services/aiService.js';
import { StudyRequest } from '../types/index.js';

export async function handleAssist(req: Request, res: Response): Promise<void> {
  try {
    const rawContent = req.body.content || req.body.query || '';
    const trimmedContent = typeof rawContent === 'string' ? rawContent.trim() : '';

    if (!trimmedContent) {
      res.status(400).json({
        error: 'EMPTY_INPUT',
        message: 'No study message or topic entered. Please type a question, topic, or code snippet to analyze.'
      });
      return;
    }

    if (trimmedContent.length < 2) {
      res.status(400).json({
        error: 'INPUT_TOO_SHORT',
        message: 'Input is too short. Please provide at least 2 characters for Emma to analyze.'
      });
      return;
    }

    if (trimmedContent.length > 50000) {
      res.status(400).json({
        error: 'INPUT_TOO_LARGE',
        message: 'Input exceeds the maximum limit of 50,000 characters. Please shorten your content.'
      });
      return;
    }

    const studyReq: StudyRequest = {
      content: trimmedContent,
      operation: req.body.operation || 'summarize',
      researchGoal: req.body.researchGoal,
      programmingLanguage: req.body.programmingLanguage || req.body.ProgrammingLanguage,
      subject: req.body.subject,
      studyTopic: req.body.studyTopic || req.body.topic
    };

    const response = await processStudyRequest(studyReq);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      error: 'PROCESSING_ERROR',
      message: error?.message || 'An unexpected error occurred while analyzing the study request.'
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
