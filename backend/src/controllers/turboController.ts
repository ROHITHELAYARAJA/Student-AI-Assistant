import { Request, Response } from 'express';
import { ragEngine } from '../services/ragEngine.js';
import {
  generateRoadmap,
  generateLesson,
  generateNotes,
  generateFlashcards,
  generateQuiz,
  generatePodcastScript,
  generateStudyPack,
  generateSources,
  validateStudyPrompt
} from '../services/turboService.js';

export async function handleGenerateStudyPack(req: Request, res: Response): Promise<void> {
  try {
    const rawInput = req.body.topic || req.body.content || '';
    const validation = validateStudyPrompt(rawInput);
    if (!validation.valid) {
      res.status(400).json({
        error: 'INVALID_STUDY_PROMPT',
        message: validation.reason
      });
      return;
    }

    const questionCount = req.body.questionCount || validation.requestedQuestionCount || 5;
    const modelId = req.body.modelId || req.body.model;
    const studyPack = await generateStudyPack(validation.cleanTopic, { questionCount, modelId });
    res.json(studyPack);
  } catch (error: any) {
    res.status(500).json({ error: 'STUDY_PACK_GENERATION_FAILED', message: error?.message });
  }
}

export async function handleGenerateRoadmap(req: Request, res: Response): Promise<void> {
  try {
    const rawInput = req.body.topic || req.body.content || '';
    const validation = validateStudyPrompt(rawInput);
    if (!validation.valid) {
      res.status(400).json({
        error: 'INVALID_STUDY_PROMPT',
        message: validation.reason
      });
      return;
    }

    const examDate = req.body.examDate;
    const roadmap = await generateRoadmap(validation.cleanTopic, examDate);
    res.json(roadmap);
  } catch (error: any) {
    res.status(500).json({ error: 'ROADMAP_GENERATION_FAILED', message: error?.message });
  }
}

export async function handleGenerateLesson(req: Request, res: Response): Promise<void> {
  try {
    const rawInput = req.body.topic || req.body.content || '';
    const validation = validateStudyPrompt(rawInput);
    if (!validation.valid) {
      res.status(400).json({
        error: 'INVALID_STUDY_PROMPT',
        message: validation.reason
      });
      return;
    }

    const lesson = await generateLesson(validation.cleanTopic);
    res.json(lesson);
  } catch (error: any) {
    res.status(500).json({ error: 'LESSON_GENERATION_FAILED', message: error?.message });
  }
}

export async function handleGenerateNotes(req: Request, res: Response): Promise<void> {
  try {
    const rawInput = req.body.topic || req.body.content || '';
    const validation = validateStudyPrompt(rawInput);
    if (!validation.valid) {
      res.status(400).json({
        error: 'INVALID_STUDY_PROMPT',
        message: validation.reason
      });
      return;
    }

    const notes = await generateNotes(validation.cleanTopic);
    res.json(notes);
  } catch (error: any) {
    res.status(500).json({ error: 'NOTES_GENERATION_FAILED', message: error?.message });
  }
}

export async function handleGenerateFlashcards(req: Request, res: Response): Promise<void> {
  try {
    const rawInput = req.body.topic || req.body.content || '';
    const validation = validateStudyPrompt(rawInput);
    if (!validation.valid) {
      res.status(400).json({
        error: 'INVALID_STUDY_PROMPT',
        message: validation.reason
      });
      return;
    }

    const deck = await generateFlashcards(validation.cleanTopic);
    res.json(deck);
  } catch (error: any) {
    res.status(500).json({ error: 'FLASHCARDS_GENERATION_FAILED', message: error?.message });
  }
}

export async function handleGenerateQuiz(req: Request, res: Response): Promise<void> {
  try {
    const rawInput = req.body.topic || req.body.content || '';
    const validation = validateStudyPrompt(rawInput);
    if (!validation.valid) {
      res.status(400).json({
        error: 'INVALID_STUDY_PROMPT',
        message: validation.reason
      });
      return;
    }

    const questionCount = req.body.questionCount || validation.requestedQuestionCount || 5;
    const modelId = req.body.modelId || req.body.model;
    const quiz = await generateQuiz(validation.cleanTopic, questionCount, modelId);
    res.json(quiz);
  } catch (error: any) {
    res.status(500).json({ error: 'QUIZ_GENERATION_FAILED', message: error?.message });
  }
}

export async function handleGeneratePodcast(req: Request, res: Response): Promise<void> {
  try {
    const rawInput = req.body.topic || req.body.content || '';
    const validation = validateStudyPrompt(rawInput);
    if (!validation.valid) {
      res.status(400).json({
        error: 'INVALID_STUDY_PROMPT',
        message: validation.reason
      });
      return;
    }

    const modelId = req.body.modelId || req.body.model;
    const podcast = await generatePodcastScript(validation.cleanTopic, modelId);
    res.json(podcast);
  } catch (error: any) {
    res.status(500).json({ error: 'PODCAST_GENERATION_FAILED', message: error?.message });
  }
}

export function handleRagIngest(req: Request, res: Response): void {
  try {
    const title = (req.body.title || 'Uploaded Document').trim();
    const content = (req.body.content || '').trim();
    const sourceType = req.body.sourceType || 'notes';

    if (!content) {
      res.status(400).json({ error: 'EMPTY_CONTENT', message: 'Document content is required for RAG ingestion.' });
      return;
    }

    const doc = ragEngine.ingestDocument(title, content, sourceType);
    res.json({
      success: true,
      document: doc,
      totalChunks: doc.chunks.length,
      totalDocuments: ragEngine.getAllDocuments().length
    });
  } catch (error: any) {
    res.status(500).json({ error: 'RAG_INGESTION_FAILED', message: error?.message });
  }
}

export function handleRagList(_req: Request, res: Response): void {
  try {
    const docs = ragEngine.getAllDocuments();
    res.json({
      documents: docs,
      count: docs.length
    });
  } catch (error: any) {
    res.status(500).json({ error: 'RAG_LIST_FAILED', message: error?.message });
  }
}

export function handleRagQuery(req: Request, res: Response): void {
  try {
    const query = (req.body.query || req.body.content || '').trim();
    const topK = typeof req.body.topK === 'number' ? req.body.topK : 4;

    if (!query) {
      res.status(400).json({ error: 'EMPTY_QUERY', message: 'Query string is required for RAG search.' });
      return;
    }

    const results = ragEngine.search(query, topK);
    res.json({
      query,
      results,
      matchCount: results.length
    });
  } catch (error: any) {
    res.status(500).json({ error: 'RAG_QUERY_FAILED', message: error?.message });
  }
}

export function handleRagDelete(req: Request, res: Response): void {
  try {
    const id = req.params.id;
    const deleted = ragEngine.deleteDocument(id);
    res.json({ success: deleted });
  } catch (error: any) {
    res.status(500).json({ error: 'RAG_DELETE_FAILED', message: error?.message });
  }
}
