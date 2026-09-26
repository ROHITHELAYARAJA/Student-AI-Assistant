/** Helper functions for detecting greetings, conversational queries, and notebook generation intent. */

export function isGreeting(message: string): boolean {
  const text = message.trim().toLowerCase().replace(/[!.?,👋\s]+$/gu, '');
  if (/^(hi+|hey+|hello+|howdy|greetings|namaste|vanakkam|வணக்கம்|नमस्ते)(\s+(there|blast|ai|blast\s+ai))?$/i.test(text)) {
    return true;
  }
  if (/^(blast|blast\s+ai)$/i.test(text)) return true;
  if (/^(who\s+are\s+you|what\s+can\s+you\s+do|help)/i.test(text)) return true;
  return false;
}

export function isNotebookIntent(message: string): boolean {
  const text = message.trim().toLowerCase();
  return /\b(create|make|generate|build|start)\s+(a\s+)?(study\s+)?(notebook|set|pack|nodes?|notes|flashcards|quiz)\b/i.test(text) ||
    /^(study\s+|notes\s+on\s+|generate\s+nodes?\s+)(.+)/i.test(text);
}

export function welcomeReply(message: string): string | null {
  const text = message.trim().toLowerCase().replace(/[!.?,👋\s]+$/gu, '');
  if (/^(hi+|hey+|hello+|howdy|greetings|namaste|vanakkam|வணக்கம்|नमस्ते)(\s+(there|blast|ai|blast\s+ai))?$/i.test(text) || /^(blast|blast\s+ai)$/i.test(text)) {
    return 'Hey! I’m Blast AI, your personal study assistant. What would you like to learn today? Tell me a topic—like **Flask commands**, Python web development, or Data Structures—or bring a file, recording, or YouTube link. We can chat about it, or I can generate a complete study notebook with notes, flashcards, and quizzes.';
  }
  if (/^(thanks|thank you|thankyou|thanks a lot|thank you so much)$/i.test(text)) {
    return 'You’re welcome! Ready to explore another idea, or practise what you’ve learned?';
  }
  return null;
}
