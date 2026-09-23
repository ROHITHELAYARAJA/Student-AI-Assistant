export interface ClientValidationResult {
  valid: boolean;
  cleanTopic: string;
  reason?: string;
  requestedQuestionCount?: number;
}

export function validateClientStudyPrompt(input: string): ClientValidationResult {
  if (!input || typeof input !== 'string') {
    return {
      valid: false,
      cleanTopic: '',
      reason: 'Please enter a study topic, syllabus concept, or question.'
    };
  }

  const trimmed = input.trim();
  if (trimmed.length < 2) {
    return {
      valid: false,
      cleanTopic: '',
      reason: 'Your study query is too short. Please provide at least 2 characters (e.g., "Python Async", "Linear Algebra", "10 Quiz on DSA").'
    };
  }

  const lower = trimmed.toLowerCase();

  // 1. Detect keyboard rows and sequence smashes (ANY length)
  const keyboardMashes = [
    'asdfgh', 'sdfghj', 'dfghjk', 'fghjkl', 'asdf',
    'qwerty', 'wertyu', 'ertyui', 'rtyuio', 'tyuiop',
    'zxcvbn', 'xcvbnm', 'lkjhgf', 'poiuyt', 'mnbvcx',
    '123456', '234567', '345678', '456789', '987654', '876543',
    '!@#$%', '@#$%^', '#$%^&', '$%^&*', '%^&*('
  ];
  for (const mash of keyboardMashes) {
    if (lower.includes(mash)) {
      return {
        valid: false,
        cleanTopic: '',
        reason: 'Input contains random keyboard patterns or key sequences. Please enter a legitimate study topic or question.'
      };
    }
  }

  // 2. Check for repeated characters (e.g., "aaaaa", "zzzzzz")
  if (/(.)\1{4,}/i.test(trimmed)) {
    return {
      valid: false,
      cleanTopic: '',
      reason: 'Input contains excessive repeated characters. Please enter a clear study topic or question.'
    };
  }

  // 3. Check for symbol / punctuation overload
  const symbols = trimmed.replace(/[a-zA-Z0-9\s]/g, '');
  if (symbols.length > 4 && symbols.length / trimmed.length > 0.2) {
    return {
      valid: false,
      cleanTopic: '',
      reason: 'Input contains excessive punctuation or symbols. Please enter a text-based study topic.'
    };
  }

  // 4. Check for smashed tokens without spaces that mix letters, numbers, and symbols (e.g., "asdfghjkl123456789!@#$%^")
  const words = trimmed.split(/\s+/);
  const knownAcronyms = new Set([
    'html', 'http', 'https', 'css', 'sql', 'nosql', 'xml', 'json', 'jwt',
    'sdk', 'api', 'jvm', 'cpu', 'gpu', 'ram', 'rom', 'dns', 'tcp', 'udp',
    'ip', 'ssh', 'ssl', 'tls', 'ai', 'ml', 'nlp', 'llm', 'dsa', 'dbms',
    'os', 'oop', 'fp', 'aws', 'gcp', 'npm', 'git', 'ci', 'cd', 'ui', 'ux',
    'cryptography', 'crypt', 'sync', 'async', 'rhythm', 'glyph', 'lynx', 'myth', 'psalm'
  ]);

  for (const word of words) {
    const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase();
    if (!cleanWord) continue;

    if (cleanWord.length > 12 && /[a-z]/i.test(cleanWord) && /[0-9]/.test(cleanWord) && !/^([a-z]+[0-9]+|[0-9]+[a-z]+)$/i.test(cleanWord)) {
      return {
        valid: false,
        cleanTopic: '',
        reason: 'Input appears to be a random string of numbers and letters. Please enter a readable study topic.'
      };
    }

    const lettersOnly = cleanWord.replace(/[^a-z]/g, '');
    if (lettersOnly.length >= 6 && !knownAcronyms.has(lettersOnly)) {
      const vowels = (lettersOnly.match(/[aeiouy]/g) || []).length;
      if (vowels === 0 || (vowels / lettersOnly.length < 0.12 && lettersOnly.length >= 8)) {
        return {
          valid: false,
          cleanTopic: '',
          reason: 'Input contains unreadable consonant sequences. Please enter a valid academic subject or question.'
        };
      }
    }
  }

  // 5. Parse requested question count if present
  let requestedQuestionCount: number | undefined;
  const countMatch = trimmed.match(/(?:^|\b)(\d+)\s*(?:quiz|questions?|mcqs?|cards?|problems?)(?:\b|$)/i);
  if (countMatch && countMatch[1]) {
    const parsed = parseInt(countMatch[1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      requestedQuestionCount = Math.min(Math.max(parsed, 1), 25);
    }
  }

  let clean = trimmed
    .replace(/^(?:please\s+)?(?:can you\s+)?(?:explain|teach me|tell me about|how to learn|what is|create a study pack for|generate\s+\d*\s*(?:quiz|questions?|study pack|roadmap|notes|flashcards)?\s*(?:for|on|about)?)\s+/i, '')
    .replace(/[?!.]+$/, '')
    .trim();

  if (!clean || clean.length < 2) {
    clean = trimmed;
  }

  return {
    valid: true,
    cleanTopic: clean,
    requestedQuestionCount
  };
}
