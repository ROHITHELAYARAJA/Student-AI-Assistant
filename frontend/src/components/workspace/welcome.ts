/** Helper functions for detecting greetings, conversational queries, and notebook generation intent. */

export function isGreeting(message: string): boolean {
  const text = message.trim().toLowerCase().replace(/[!.?,👋\s]+$/gu, '');
  if (/^(hi+|hey+|hello+|howdy|greetings|namaste|vanakkam|வணக்கம்|नमस्ते)(\s+(there|are\s+you\s+there|blast|ai|blast\s+ai))?$/i.test(text)) {
    return true;
  }
  if (/^(are\s+you\s+there|you\s+there|hello\s+there|hey\s+there)$/i.test(text)) return true;
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
  if (/^(hi+|hey+|hello+|howdy|greetings|namaste|vanakkam|வணக்கம்|नमस्ते)(\s+(there|are\s+you\s+there|blast|ai|blast\s+ai))?$/i.test(text) ||
      /^(are\s+you\s+there|you\s+there|blast|blast\s+ai)$/i.test(text)) {
    return 'Hey! I’m Blast AI, your personal study companion powered by **NVIDIA Nemotron Ultra**. What would you like to explore today? Tell me a topic—like **Flask commands**, Python, or Data Structures—or paste notes, a YouTube link, or an image (Ctrl+V). We can chat about it, or I can generate a complete interactive study notebook with notes, flashcards, and quizzes!';
  }
  if (/^(thanks|thank you|thankyou|thanks a lot|thank you so much)$/i.test(text)) {
    return 'You’re welcome! Ready to explore another idea, or practise what you’ve learned?';
  }
  return null;
}
