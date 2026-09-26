/** Helper functions for detecting notebook/study generation intent. */

export function isNotebookIntent(message: string): boolean {
  const text = message.trim().toLowerCase();
  return /\b(create|make|generate|build|start)\s+(a\s+)?(study\s+)?(notebook|set|pack|nodes?|notes|flashcards|quiz|plan|roadmap)\b/i.test(text) ||
    /^(study\s+|notes\s+on\s+|generate\s+nodes?\s+|quiz\s+on\s+|flashcards\s+for\s+|study\s+plan\s+for\s+)(.+)/i.test(text);
}
