/** Helper functions for detecting notebook/study generation intent. */

export function isNotebookIntent(message: string): boolean {
  const text = message.trim().toLowerCase();
  return /\b(create|make|generate|build|start)\s+(a\s+)?(study\s+)?(notebook|set|pack|nodes?|notes|flashcards|quiz|plan|roadmap)\b/i.test(text) ||
    /^(study\s+|notes\s+on\s+|generate\s+nodes?\s+|quiz\s+on\s+|flashcards\s+for\s+|study\s+plan\s+for\s+)(.+)/i.test(text);
}

export function shouldShowStudyWizard(userQuery: string, suggestedAction?: any): boolean {
  if (!userQuery) return false;
  const clean = userQuery.trim().toLowerCase().replace(/[!?.,]+/g, '');
  // Simple greetings or casual talk: NEVER show the wizard or roadmap
  if (/^(hi|hello|hey|yo|sup|good\s*(morning|afternoon|evening|night)|howdy|hola|thanks|thank\s*you|ok|okay|cool|bye|who\s*are\s*you|what's\s*up)$/i.test(clean)) {
    return false;
  }
  // Explicit notebook/study request
  if (isNotebookIntent(userQuery)) return true;
  // If backend specifically suggested creating a notebook
  if (suggestedAction?.type === 'create_notebook') return true;
  // If user asks how to learn, study, compare, or roadmap a subject
  if (/\b(how\s+to\s+learn|study|roadmap|syllabus|curriculum|dsa|neetcode|striver|kunal|guide|prepare|exam|master|tutorial|concepts?|vs|which\s+is\s+better|compare)\b/i.test(clean)) {
    return true;
  }
  return false;
}

