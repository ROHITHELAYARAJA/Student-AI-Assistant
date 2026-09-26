import { OperationMeta, StructuredAiResponse, StudyRequest } from '../types/study.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchOperations(): Promise<OperationMeta[]> {
  try {
    const res = await fetch(`${API_BASE}/operations`);
    if (res.ok) {
      const data = await res.json();
      return data.operations || [];
    }
  } catch (error) {
    console.error('Operations fetch failed, using fallback list');
  }
  return [];
}

export async function requestAiAssistance(req: StudyRequest): Promise<StructuredAiResponse> {
  const res = await fetch(`${API_BASE}/assist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Server failed to process study query.');
  }

  return res.json();
}
