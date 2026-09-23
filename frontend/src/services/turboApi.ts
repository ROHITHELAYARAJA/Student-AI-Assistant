import {
  TurboRoadmap,
  TurboLesson,
  TurboNotes,
  TurboFlashcardDeck,
  TurboQuiz,
  TurboPodcastScript,
  IngestedDocument,
  DocumentChunk
} from '../types/turbo.js';

const API_BASE_URL = 'http://localhost:5000';

export async function fetchRoadmap(topic: string, examDate?: string): Promise<TurboRoadmap> {
  const res = await fetch(`${API_BASE_URL}/api/turbo/generate-roadmap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, examDate })
  });
  if (!res.ok) {
    throw new Error('Failed to generate study roadmap');
  }
  return res.json();
}

export async function fetchLesson(topic: string): Promise<TurboLesson> {
  const res = await fetch(`${API_BASE_URL}/api/turbo/generate-lesson`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic })
  });
  if (!res.ok) {
    throw new Error('Failed to generate interactive lesson');
  }
  return res.json();
}

export async function fetchNotes(topic: string): Promise<TurboNotes> {
  const res = await fetch(`${API_BASE_URL}/api/turbo/generate-notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic })
  });
  if (!res.ok) {
    throw new Error('Failed to generate high-yield notes');
  }
  return res.json();
}

export async function fetchFlashcards(topic: string): Promise<TurboFlashcardDeck> {
  const res = await fetch(`${API_BASE_URL}/api/turbo/generate-flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic })
  });
  if (!res.ok) {
    throw new Error('Failed to generate flashcard deck');
  }
  return res.json();
}

export async function fetchQuiz(topic: string): Promise<TurboQuiz> {
  const res = await fetch(`${API_BASE_URL}/api/turbo/generate-quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic })
  });
  if (!res.ok) {
    throw new Error('Failed to generate assessment quiz');
  }
  return res.json();
}

export async function fetchPodcast(topic: string): Promise<TurboPodcastScript> {
  const res = await fetch(`${API_BASE_URL}/api/turbo/generate-podcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic })
  });
  if (!res.ok) {
    throw new Error('Failed to generate podcast audio script');
  }
  return res.json();
}

export async function ingestDocument(
  title: string,
  content: string,
  sourceType: 'text' | 'pdf' | 'slides' | 'notes' = 'notes'
): Promise<{ success: boolean; document: IngestedDocument; totalChunks: number }> {
  const res = await fetch(`${API_BASE_URL}/api/rag/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, sourceType })
  });
  if (!res.ok) {
    throw new Error('Failed to ingest document into RAG engine');
  }
  return res.json();
}

export async function fetchDocuments(): Promise<IngestedDocument[]> {
  const res = await fetch(`${API_BASE_URL}/api/rag/documents`);
  if (!res.ok) {
    throw new Error('Failed to list RAG documents');
  }
  const data = await res.json();
  return data.documents || [];
}

export async function queryRag(query: string, topK: number = 4): Promise<DocumentChunk[]> {
  const res = await fetch(`${API_BASE_URL}/api/rag/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topK })
  });
  if (!res.ok) {
    throw new Error('Failed to query RAG index');
  }
  const data = await res.json();
  return data.results || [];
}

export async function deleteDocument(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/api/rag/documents/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error('Failed to delete document');
  }
  const data = await res.json();
  return data.success;
}
