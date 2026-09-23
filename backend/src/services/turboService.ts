import { ragEngine, DocumentChunk } from './ragEngine.js';

export interface TurboRoadmapMilestone {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  keyConcepts: string[];
  tasks: string[];
}

export interface TurboRoadmapStage {
  id: string;
  stageName: string;
  description: string;
  progressPercent: number;
  milestones: TurboRoadmapMilestone[];
}

export interface TurboRoadmap {
  topic: string;
  examDate?: string;
  targetGoal: string;
  totalStages: number;
  totalMilestones: number;
  overallProgress: number;
  stages: TurboRoadmapStage[];
}

export interface TurboQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'fill_in_the_blank';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  conceptTag: string;
}

export interface TurboLesson {
  id: string;
  title: string;
  topic: string;
  estimatedMinutes: number;
  summary: string;
  questions: TurboQuestion[];
}

export interface TurboNotes {
  topic: string;
  title: string;
  lastUpdated: string;
  summary: string;
  keyTakeaways: string[];
  sections: Array<{
    heading: string;
    content: string;
    bulletPoints?: string[];
    codeSnippet?: {
      language: string;
      code: string;
    };
    formulas?: string[];
  }>;
}

export interface TurboFlashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  masteryLevel: 'new' | 'learning' | 'mastered';
}

export interface TurboFlashcardDeck {
  topic: string;
  cards: TurboFlashcard[];
}

export interface TurboQuizItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TurboQuiz {
  topic: string;
  title: string;
  timeLimitMinutes: number;
  questions: TurboQuizItem[];
}

export interface TurboPodcastScript {
  topic: string;
  title: string;
  audioDurationEstimate: string;
  overview: string;
  segments: Array<{
    speaker: 'Blast (Host)' | 'Alex (Student)';
    line: string;
  }>;
}

export interface TurboSourceItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  keyTakeaways: string[];
  relevance: string;
  sourceUrl?: string;
}

export interface TurboStudyPack {
  id: string;
  topic: string;
  createdAt: string;
  roadmap: TurboRoadmap;
  notes: TurboNotes;
  quiz: TurboQuiz;
  flashcards: TurboFlashcardDeck;
  podcast: TurboPodcastScript;
  sources: TurboSourceItem[];
}

export interface PromptValidationResult {
  valid: boolean;
  cleanTopic: string;
  reason?: string;
  requestedQuestionCount?: number;
}

export function validateStudyPrompt(input: string): PromptValidationResult {
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

  // Check for pure symbols / punctuation
  const alphanumericCount = (trimmed.match(/[a-zA-Z0-9]/g) || []).length;
  if (alphanumericCount < 2 || alphanumericCount / trimmed.length < 0.25) {
    return {
      valid: false,
      cleanTopic: '',
      reason: 'Input contains mostly non-text characters or symbols. Please enter a valid study topic.'
    };
  }

  // Check for keyboard smashes / repeated single chars (e.g. "aaaaaa", "asdfghjk", "qwerty")
  if (/(.)\1{5,}/i.test(trimmed)) {
    return {
      valid: false,
      cleanTopic: '',
      reason: 'Input contains excessive repeated characters. Please enter a clear study topic or question.'
    };
  }
  const keyboardMashes = ['asdfgh', 'qwerty', 'zxcvbn', 'lkjhgf', 'poiuyt'];
  const lower = trimmed.toLowerCase();
  for (const mash of keyboardMashes) {
    if (lower.includes(mash) && trimmed.length < 15) {
      return {
        valid: false,
        cleanTopic: '',
        reason: 'Input appears to be random keyboard keys. Please enter a valid topic to generate study materials.'
      };
    }
  }

  // Parse requested question count if present (e.g., "10 quiz", "generate 10 questions on React", "15 mcqs")
  let requestedQuestionCount: number | undefined;
  const countMatch = trimmed.match(/(?:^|\b)(\d+)\s*(?:quiz|questions?|mcqs?|cards?|problems?)(?:\b|$)/i);
  if (countMatch && countMatch[1]) {
    const parsed = parseInt(countMatch[1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      requestedQuestionCount = Math.min(Math.max(parsed, 1), 25);
    }
  }

  // Clean the topic name from conversational wrappers
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

async function callBedrock(prompt: string, preferredModel?: string): Promise<string> {
  const bedrockToken =
    process.env.AWS_BEARER_TOKEN_BEDROCK ||
    process.env.BEDROCK_API_KEY ||
    '';
  const bedrockRegion = process.env.AWS_REGION || 'us-east-1';

  if (!bedrockToken) {
    return '';
  }

  const defaultModels = [
    'anthropic.claude-3-haiku-20240307-v1:0',
    'meta.llama3-70b-instruct-v1:0',
    'meta.llama3-8b-instruct-v1:0',
    'amazon.nova-lite-v1:0',
    'amazon.nova-micro-v1:0'
  ];

  let bedrockModels = defaultModels;
  if (preferredModel && defaultModels.includes(preferredModel)) {
    bedrockModels = [preferredModel, ...defaultModels.filter(m => m !== preferredModel)];
  }

  for (const modelId of bedrockModels) {
    try {
      const url = `https://bedrock-runtime.${bedrockRegion}.amazonaws.com/model/${encodeURIComponent(modelId)}/converse`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bedrockToken}`
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: [{ text: prompt }] }],
          inferenceConfig: {
            maxTokens: 2500,
            temperature: 0.2
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const text = json?.output?.message?.content?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch {
      continue;
    }
  }

  return '';
}

function extractJsonBlock(rawText: string): any {
  try {
    const cleaned = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*$/gi, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const substr = rawText.substring(firstBrace, lastBrace + 1);
        return JSON.parse(substr);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function generateRoadmap(topic: string, examDate?: string): Promise<TurboRoadmap> {
  const retrievedChunks = ragEngine.search(topic, 3);
  let contextText = '';
  if (retrievedChunks.length > 0) {
    contextText = `\nSource Material Context:\n${retrievedChunks.map((c) => c.content).join('\n---\n')}`;
  }

  const prompt = `You are Blast, an expert Blast AI study planner. Generate an intensive, structured mastery roadmap for the topic: "${topic}".${contextText}
Return ONLY valid raw JSON matching this TypeScript schema:
{
  "topic": "${topic}",
  "examDate": "${examDate || 'In 2 Weeks'}",
  "targetGoal": "100% Exam Mastery & Conceptual Dominance",
  "totalStages": 4,
  "totalMilestones": 8,
  "overallProgress": 15,
  "stages": [
    {
      "id": "stage-1",
      "stageName": "Stage 1: Core Foundations",
      "description": "Essential terminology, foundational laws, and initial concepts",
      "progressPercent": 60,
      "milestones": [
        {
          "id": "m-1",
          "title": "Fundamental Concepts & Definitions",
          "duration": "45 mins",
          "completed": true,
          "keyConcepts": ["Base Axioms", "Standard Notations"],
          "tasks": ["Read introductory briefing", "Review terminology flashcards"]
        },
        {
          "id": "m-2",
          "title": "Architectural Breakdown",
          "duration": "60 mins",
          "completed": false,
          "keyConcepts": ["Structural Flow", "Data Schemas"],
          "tasks": ["Trace pipeline flow", "Complete checkpoint practice"]
        }
      ]
    },
    {
      "id": "stage-2",
      "stageName": "Stage 2: Deep Mechanics & Logic",
      "description": "Advanced dynamics, mathematical formulas, and algorithmic pathways",
      "progressPercent": 0,
      "milestones": [
        {
          "id": "m-3",
          "title": "Algorithmic Precision & Optimization",
          "duration": "90 mins",
          "completed": false,
          "keyConcepts": ["Complexity Analysis", "In-depth Logic"],
          "tasks": ["Solve benchmark equations", "Analyze edge-case scenarios"]
        }
      ]
    }
  ]
}
Make sure all text directly relates to "${topic}". No markdown formatting or extra commentary outside the JSON block.`;

  const aiText = await callBedrock(prompt);
  if (aiText) {
    const parsed = extractJsonBlock(aiText);
    if (parsed && Array.isArray(parsed.stages) && parsed.stages.length > 0) {
      return parsed;
    }
  }

  return {
    topic,
    examDate: examDate || 'Upcoming Exam',
    targetGoal: `Comprehensive Mastery of ${topic}`,
    totalStages: 3,
    totalMilestones: 6,
    overallProgress: 20,
    stages: [
      {
        id: 'stage-1',
        stageName: 'Stage 1: Fundamentals & Vocabulary',
        description: `Establish bedrock mental models and terminology for ${topic}`,
        progressPercent: 50,
        milestones: [
          {
            id: 'm-1',
            title: `Introduction & Key Definitions of ${topic}`,
            duration: '35 mins',
            completed: true,
            keyConcepts: ['Core Terminology', 'Primary Principles'],
            tasks: ['Review high-yield flashcard deck', 'Skim chapter summaries']
          },
          {
            id: 'm-2',
            title: 'Foundational Systems & Working Rules',
            duration: '50 mins',
            completed: false,
            keyConcepts: ['System Boundaries', 'Fundamental Equations'],
            tasks: ['Solve 5 warm-up multiple choice items', 'Draw mental model diagram']
          }
        ]
      },
      {
        id: 'stage-2',
        stageName: 'Stage 2: Core Mechanics & Deep Dive',
        description: `Explore interconnected mechanisms, problem patterns, and edge cases in ${topic}`,
        progressPercent: 0,
        milestones: [
          {
            id: 'm-3',
            title: 'Deep Mechanical Interactions',
            duration: '60 mins',
            completed: false,
            keyConcepts: ['Step-by-step Execution', 'Variable Sensitivity'],
            tasks: ['Analyze case studies', 'Complete Interactive Practice Lesson']
          },
          {
            id: 'm-4',
            title: 'Common Pitfalls & Exam Edge Cases',
            duration: '45 mins',
            completed: false,
            keyConcepts: ['Tricky Distractors', 'Boundary Conditions'],
            tasks: ['Take diagnostic checkpoint quiz', 'Clarify weak points with Blast']
          }
        ]
      },
      {
        id: 'stage-3',
        stageName: 'Stage 3: High-Yield Practice & Exam Readiness',
        description: `Timed practice, full mock questions, and rapid recall drills`,
        progressPercent: 0,
        milestones: [
          {
            id: 'm-5',
            title: 'Speed Recall & Flashcard Mastery',
            duration: '40 mins',
            completed: false,
            keyConcepts: ['Rapid Identification', 'Instant Retrieval'],
            tasks: ['Drill 20 spaced repetition flashcards', 'Audio overview listening']
          },
          {
            id: 'm-6',
            title: 'Timed Assessment Challenge',
            duration: '45 mins',
            completed: false,
            keyConcepts: ['Test Conditions', 'Confidence Calibration'],
            tasks: ['Complete final 10-question evaluation quiz', 'Review mistakes with Blast']
          }
        ]
      }
    ]
  };
}

export async function generateLesson(topic: string): Promise<TurboLesson> {
  const retrievedChunks = ragEngine.search(topic, 3);
  let contextText = '';
  if (retrievedChunks.length > 0) {
    contextText = `\nRAG Document Reference Chunks:\n${retrievedChunks.map((c) => c.content).join('\n---\n')}`;
  }

  const prompt = `You are Blast, the Blast AI study tutor. Generate an interactive practice study lesson on the topic: "${topic}".${contextText}
Create 5 engaging, high-yield questions (mix of multiple_choice and fill_in_the_blank) with realistic options, correct answer, and an in-depth explanatory breakdown.
Return ONLY valid raw JSON matching this TypeScript schema:
{
  "id": "lesson-${Date.now()}",
  "title": "Interactive Mastery: ${topic}",
  "topic": "${topic}",
  "estimatedMinutes": 15,
  "summary": "Master core concepts, active recall questions, and common exam traps.",
  "questions": [
    {
      "id": "q-1",
      "question": "What is the primary defining characteristic of ${topic}?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Clear explanation of why this option is definitively correct.",
      "conceptTag": "Core Definition"
    },
    {
      "id": "q-2",
      "question": "Complete the statement: In ${topic}, the main constraint is ______.",
      "type": "fill_in_the_blank",
      "correctAnswer": "ExactKeyWord",
      "explanation": "Detailed rationale describing the mechanism.",
      "conceptTag": "Critical Properties"
    }
  ]
}
Make sure all content is deeply tailored to "${topic}". No markdown codeblocks or outer text.`;

  const aiText = await callBedrock(prompt);
  if (aiText) {
    const parsed = extractJsonBlock(aiText);
    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed;
    }
  }

  return {
    id: `lesson-${Date.now()}`,
    title: `Active Recall & Practice: ${topic}`,
    topic,
    estimatedMinutes: 12,
    summary: `Interactive lesson designed to drill essential principles, identify tricky traps, and solidify long-term retention of ${topic}.`,
    questions: [
      {
        id: 'q-1',
        question: `Which of the following represents the foundational rule in ${topic}?`,
        type: 'multiple_choice',
        options: [
          `Conservation of state and bounded variance in ${topic}`,
          `Linear degradation without state recovery`,
          `Unchecked unbounded computational divergence`,
          `Arbitrary stochastic reconfiguration`
        ],
        correctAnswer: `Conservation of state and bounded variance in ${topic}`,
        explanation: `In ${topic}, maintaining strict state boundaries and controlled variance is foundational to preventing drift and guaranteeing predictable system behavior.`,
        conceptTag: 'System Invariants'
      },
      {
        id: 'q-2',
        question: `When optimizing performance for ${topic}, what is typically the primary bottleneck?`,
        type: 'multiple_choice',
        options: [
          'High memory latency and redundant recalculations',
          'Excessive static variable declarations',
          'Unused CSS stylesheet tags',
          'Terminal font rasterization speed'
        ],
        correctAnswer: 'High memory latency and redundant recalculations',
        explanation: 'Redundant operations and cache misses dominate computational overhead across non-trivial workloads in this domain.',
        conceptTag: 'Optimization & Efficiency'
      },
      {
        id: 'q-3',
        question: `Fill in the blank: The primary objective when analyzing ${topic} is to maximize ______ while minimizing overhead.`,
        type: 'fill_in_the_blank',
        correctAnswer: 'throughput',
        explanation: 'Balancing maximum system throughput against resource latency constitutes the classic trade-off frontier.',
        conceptTag: 'Trade-off Analysis'
      },
      {
        id: 'q-4',
        question: `Which scenario triggers the worst-case time complexity in ${topic}?`,
        type: 'multiple_choice',
        options: [
          'Unbalanced input structures resulting in degenerate traversal',
          'Pre-sorted inputs utilizing uniform distributions',
          'Concurrent read operations with caching enabled',
          'Zero-length parameter arrays'
        ],
        correctAnswer: 'Unbalanced input structures resulting in degenerate traversal',
        explanation: 'Skewed or adversarial distributions degrade logarithmic efficiency into linear or quadratic bounds.',
        conceptTag: 'Edge Case Traps'
      }
    ]
  };
}

export async function generateNotes(topic: string): Promise<TurboNotes> {
  const retrievedChunks = ragEngine.search(topic, 4);
  let contextText = '';
  if (retrievedChunks.length > 0) {
    contextText = `\nContext Sources from Uploaded Material:\n${retrievedChunks.map((c) => c.content).join('\n---\n')}`;
  }

  const prompt = `You are Blast, the Blast AI high-yield academic note creator. Generate structured, crystal-clear study notes for the topic: "${topic}".${contextText}
Return ONLY valid raw JSON matching this schema:
{
  "topic": "${topic}",
  "title": "Comprehensive Study Notes: ${topic}",
  "lastUpdated": "${new Date().toLocaleDateString()}",
  "summary": "A concise executive summary synthesizing all core paradigms of ${topic}.",
  "keyTakeaways": [
    "Key takeaway 1",
    "Key takeaway 2",
    "Key takeaway 3",
    "Key takeaway 4"
  ],
  "sections": [
    {
      "heading": "1. Core Principles & Architecture",
      "content": "Detailed explanatory paragraphs clarifying the foundational structure.",
      "bulletPoints": ["Point A", "Point B", "Point C"],
      "formulas": ["Equation or formal expression if applicable"]
    },
    {
      "heading": "2. High-Yield Mechanisms & Proofs",
      "content": "Deep dive into exact workings, transformations, and rules.",
      "bulletPoints": ["Mechanism 1", "Mechanism 2"]
    },
    {
      "heading": "3. Exam Traps & Real-World Application",
      "content": "Specific pitfalls test-makers use and practical trade-offs.",
      "bulletPoints": ["Trap 1", "Trap 2"]
    }
  ]
}
No markdown backticks outside JSON. Strictly pure JSON.`;

  const aiText = await callBedrock(prompt);
  if (aiText) {
    const parsed = extractJsonBlock(aiText);
    if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
      return parsed;
    }
  }

  return {
    topic,
    title: `High-Yield Academic Notes: ${topic}`,
    lastUpdated: new Date().toLocaleDateString(),
    summary: `A structured synthesis of ${topic} designed for rapid review, conceptual clarity, and maximum exam recall.`,
    keyTakeaways: [
      `Foundational axioms govern every transformation and behavior in ${topic}.`,
      `Optimal performance requires balancing throughput against boundary constraints.`,
      `Always watch for degenerative edge cases during complexity evaluations.`,
      `Spaced repetition of core formulas drastically boosts retention during exams.`
    ],
    sections: [
      {
        heading: `1. Foundational Architecture of ${topic}`,
        content: `${topic} operates on structured invariants that dictate how components interact and maintain equilibrium under variable inputs. Mastering these basic boundaries prevents elementary mistakes in complex problem sets.`,
        bulletPoints: [
          'State consistency across all discrete transformations',
          'Deterministic boundary conditions and valid input domains',
          'Minimal memory footprint through structural sharing'
        ],
        formulas: ['Cost = O(n log n) average traversal bound']
      },
      {
        heading: `2. Critical Mechanics & Core Transformations`,
        content: `When analyzing multi-phase processes within ${topic}, trace intermediate states methodically. Ensure that edge conditions (empty sets, maximum capacities, inverse relationships) are accounted for before finalizing solutions.`,
        bulletPoints: [
          'Phase separation ensures clean modular abstraction',
          'Feedback loops must incorporate dampening factors to prevent oscillation',
          'Cache warming dramatically lowers tail latencies'
        ]
      },
      {
        heading: `3. Exam Traps & High-Probability Questions`,
        content: `Exams frequently present distractor scenarios where a superficially intuitive answer ignores second-order dependencies. Always evaluate systemic constraints prior to selecting your solution.`,
        bulletPoints: [
          'Do not confuse average-case performance with worst-case guarantees',
          'Verify assumptions regarding data ordering and immutability',
          'Remember to check unit scaling and dimensional consistency'
        ]
      }
    ]
  };
}

export async function generateFlashcards(topic: string): Promise<TurboFlashcardDeck> {
  const retrievedChunks = ragEngine.search(topic, 3);
  let contextText = '';
  if (retrievedChunks.length > 0) {
    contextText = `\nRAG Document Reference:\n${retrievedChunks.map((c) => c.content).join('\n---\n')}`;
  }

  const prompt = `You are Blast, the Blast AI spaced-repetition flashcard generator. Create 8 high-impact study flashcards for: "${topic}".${contextText}
Return ONLY valid raw JSON matching this schema:
{
  "topic": "${topic}",
  "cards": [
    {
      "id": "card-1",
      "front": "Concise, probing concept question on ${topic}",
      "back": "Clear, bulleted or direct answer explaining the core fact.",
      "category": "Foundations",
      "masteryLevel": "new"
    }
  ]
}
Make sure cards test key distinctions, equations, definitions, and common mistakes. Pure JSON only.`;

  const aiText = await callBedrock(prompt);
  if (aiText) {
    const parsed = extractJsonBlock(aiText);
    if (parsed && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
      return parsed;
    }
  }

  return {
    topic,
    cards: [
      {
        id: 'card-1',
        front: `What is the core purpose and definition of ${topic}?`,
        back: `A systematic paradigm engineered to model, manage, and optimize complex processes under deterministic constraints.`,
        category: 'Definitions',
        masteryLevel: 'new'
      },
      {
        id: 'card-2',
        front: `What is the primary trade-off when tuning ${topic}?`,
        back: `Latency versus throughput: maximizing raw speed often increases memory pressure and complexity.`,
        category: 'Trade-offs',
        masteryLevel: 'new'
      },
      {
        id: 'card-3',
        front: `How does worst-case time complexity manifest in ${topic}?`,
        back: `When input distributions become severely unbalanced, forcing recursive operations into linear execution O(n).`,
        category: 'Complexity',
        masteryLevel: 'new'
      },
      {
        id: 'card-4',
        front: `Name two critical invariants that must remain true during state transitions.`,
        back: `1. Data integrity and conservation of system invariants.\n2. Bounded propagation of errors across subsystem boundaries.`,
        category: 'Invariants',
        masteryLevel: 'new'
      },
      {
        id: 'card-5',
        front: `What common trap do examiners use when testing ${topic}?`,
        back: `Assuming constant time performance O(1) by omitting hidden re-allocation or hashing collision penalties.`,
        category: 'Exam Traps',
        masteryLevel: 'new'
      },
      {
        id: 'card-6',
        front: `What is the ideal mitigation for edge-case failures in ${topic}?`,
        back: `Pre-condition assertion checks and defensive boundary clamps to intercept anomalies early.`,
        category: 'Defensive Design',
        masteryLevel: 'new'
      }
    ]
  };
}

export async function generateQuiz(
  topic: string,
  questionCount: number = 5,
  modelId?: string
): Promise<TurboQuiz> {
  const targetCount = questionCount > 0 ? questionCount : 5;
  const retrievedChunks = ragEngine.search(topic, 3);
  let contextText = '';
  if (retrievedChunks.length > 0) {
    contextText = `\nRAG Document Reference:\n${retrievedChunks.map((c) => c.content).join('\n---\n')}`;
  }

  const prompt = `You are Blast, the Blast AI assessment examiner. Generate a ${targetCount}-question mastery quiz for: "${topic}".${contextText}
Return ONLY valid raw JSON matching this schema:
{
  "topic": "${topic}",
  "title": "Mastery Assessment: ${topic}",
  "timeLimitMinutes": ${Math.ceil(targetCount * 1.8)},
  "questions": [
    {
      "id": "quiz-q-1",
      "question": "Clear problem stem relating directly to ${topic}?",
      "options": ["Distractor A", "Correct Answer B", "Distractor C", "Distractor D"],
      "correctIndex": 1,
      "explanation": "Detailed breakdown proving why Option B is correct and others fail."
    }
  ]
}
Generate exactly ${targetCount} unique, high-yield questions testing core principles, invariants, edge cases, and performance tradeoffs. Pure JSON only. No markdown fences.`;

  const aiText = await callBedrock(prompt, modelId);
  if (aiText) {
    const parsed = extractJsonBlock(aiText);
    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed;
    }
  }

  // Dynamic fallback generator matching targetCount exactly
  const questions: TurboQuizItem[] = [];
  const archetypes = [
    {
      q: `Under standard architecture and execution models, what primary invariant governs ${topic}?`,
      opts: [
        'Unbounded state mutation across arbitrary threads',
        'Deterministic equilibrium governed by conservation laws and boundary invariants',
        'Stochastic loss of state across function returns',
        'Arbitrary compile-time constant elimination'
      ],
      correct: 1,
      exp: `In ${topic}, predictable behavior and correctness rely fundamentally on strict conservation laws and bounded state invariants.`
    },
    {
      q: `When optimizing time and space performance for ${topic}, what is typically the primary bottleneck?`,
      opts: [
        'Memory cache invalidation and redundant re-computations',
        'Excessive function comment overhead',
        'Terminal display buffer refresh rate',
        'CSS stylesheet loading order'
      ],
      correct: 0,
      exp: 'Redundant operations and cache thrashing constitute the primary asymptotic latency overhead in production systems.'
    },
    {
      q: `What distinguishes an optimal, production-grade approach to ${topic} from a naive prototype?`,
      opts: [
        'Relying entirely on global variables',
        'Asymptotic efficiency guarantees, robust input sanitization, and defensive error boundaries',
        'Avoiding all testing and static analysis',
        'Hardcoding fixed buffer sizes without checks'
      ],
      correct: 1,
      exp: 'Robust implementations provide strict Big-O guarantees and defensive boundary assertions against adversarial inputs.'
    },
    {
      q: `Which scenario triggers the worst-case degenerative behavior in ${topic}?`,
      opts: [
        'Uniformly balanced data distributions',
        'Adversarial skewed inputs causing recursive tree or pipeline degradation',
        'Strictly typed immutable parameter structures',
        'Pre-warmed memory cache hierarchies'
      ],
      correct: 1,
      exp: 'Degenerative distributions degrade sub-linear operations into linear or quadratic latency.'
    },
    {
      q: `How should edge-case anomalies and boundary errors be handled when implementing ${topic}?`,
      opts: [
        'Silently ignore errors and continue execution',
        'Pre-condition verification, defensive clamp guards, and immediate deterministic isolation',
        'Trigger random system restarts',
        'Disable all exceptions at runtime'
      ],
      correct: 1,
      exp: 'Defensive validation intercepts invalid state transitions before corrupting dependent subsystems.'
    },
    {
      q: `In examination evaluations, what common trap is frequently set regarding ${topic}?`,
      opts: [
        'Assuming best-case O(1) amortized performance applies unconditionally in the presence of collisions or resize penalties',
        'Assuming code must be compiled twice',
        'Believing variables take up memory',
        'Using descriptive function names'
      ],
      correct: 0,
      exp: 'Examiners frequently test whether candidates remember hidden resize or collision overhead.'
    },
    {
      q: `What is the primary trade-off when tuning latency versus throughput in ${topic}?`,
      opts: [
        'Higher throughput often requires batching, which can increase individual item latency',
        'Throughput and latency are always identical metrics',
        'Optimizing throughput permanently eliminates memory footprint',
        'Latency has no relationship with processing queues'
      ],
      correct: 0,
      exp: 'Batching amortizes per-item fixed overhead but naturally incurs queuing wait times for individual transactions.'
    },
    {
      q: `Which data abstraction or design pattern is most idiomatic when structuring ${topic}?`,
      opts: [
        'Monolithic global state pools',
        'Modular separation of concerns with well-defined interface contracts',
        'Unconstrained cyclic dependency loops',
        'Duplicated redundant data models'
      ],
      correct: 1,
      exp: 'Interface segregation and modular boundaries maximize maintainability and testability.'
    },
    {
      q: `When benchmarking implementations of ${topic}, which metric provides the most accurate assessment of tail latency?`,
      opts: [
        'Average (mean) latency alone',
        '99th percentile (p99) latency distribution under sustained load',
        'Initial cold-start boot time exclusively',
        'Lines of code divided by file size'
      ],
      correct: 1,
      exp: 'High percentile metrics (p99/p99.9) reveal outliers and GC/queuing pauses masked by simple arithmetic averages.'
    },
    {
      q: `What is the recommended best practice for verifying correctness in ${topic}?`,
      opts: [
        'Property-based fuzzing and rigorous automated regression test suites covering boundary edges',
        'Visual inspection of the code without executing it',
        'Only testing the happy path once manually',
        'Deleting failing unit tests'
      ],
      correct: 0,
      exp: 'Automated property testing exposes unexpected boundary conditions and ensures continuous regression resistance.'
    }
  ];

  for (let i = 0; i < targetCount; i++) {
    const arch = archetypes[i % archetypes.length];
    questions.push({
      id: `quiz-q-${i + 1}`,
      question: arch.q,
      options: arch.opts,
      correctIndex: arch.correct,
      explanation: arch.exp
    });
  }

  return {
    topic,
    title: `Mastery Assessment: ${topic} (${targetCount} Questions)`,
    timeLimitMinutes: Math.ceil(targetCount * 1.8),
    questions
  };
}

export async function generatePodcastScript(topic: string, modelId?: string): Promise<TurboPodcastScript> {
  const retrievedChunks = ragEngine.search(topic, 3);
  let contextText = '';
  if (retrievedChunks.length > 0) {
    contextText = `\nRAG Document Reference:\n${retrievedChunks.map((c) => c.content).join('\n---\n')}`;
  }

  const prompt = `You are Blast, the energetic and brilliant AI study host. Generate an engaging, conversational 2-speaker podcast breakdown for: "${topic}".${contextText}
The speakers are "Blast (Host)" (sharp, encouraging, explains key analogies) and "Alex (Student)" (asks the exact questions a student struggles with).
Return ONLY valid raw JSON matching this schema:
{
  "topic": "${topic}",
  "title": "Blast Deep-Dive: Decoding ${topic}",
  "audioDurationEstimate": "4 mins",
  "overview": "A fast, punchy conversational audio overview breaking down the core concepts of ${topic} for effortless listening on the go.",
  "segments": [
    {
      "speaker": "Blast (Host)",
      "line": "Welcome back to Blast AI Study Beats! Today we're tackling something students always ask about: ${topic}. Alex, ready to break it down?"
    },
    {
      "speaker": "Alex (Student)",
      "line": "Hey Blast! Yes, absolutely. Honestly, when I first saw ${topic}, it seemed overwhelming. Where do we even start?"
    }
  ]
}
Include 6 to 10 alternating lines highlighting the big ideas and memorable analogies. Pure JSON only.`;

  const aiText = await callBedrock(prompt, modelId);
  if (aiText) {
    const parsed = extractJsonBlock(aiText);
    if (parsed && Array.isArray(parsed.segments) && parsed.segments.length > 0) {
      return parsed;
    }
  }

  return {
    topic,
    title: `Blast Audio Deep Dive: ${topic}`,
    audioDurationEstimate: '3 mins',
    overview: `A crisp conversational podcast episode breaking down ${topic} with Blast and Alex. Perfect for commute review!`,
    segments: [
      {
        speaker: 'Blast (Host)',
        line: `Welcome to Blast AI Audio Sessions! Today we are tackling ${topic}—breaking down the essential principles into crystal-clear concepts.`
      },
      {
        speaker: 'Alex (Student)',
        line: `Hey Blast! Glad to be here. Honestly, ${topic} feels intimidating with all the terminology. What's the main mental model?`
      },
      {
        speaker: 'Blast (Host)',
        line: `Think of it like a finely tuned engine. At its core, it's all about balancing throughput with strict boundary constraints so nothing breaks under pressure.`
      },
      {
        speaker: 'Alex (Student)',
        line: `That makes a lot of sense! But what about on exams? What is the single biggest trap test-writers love to include?`
      },
      {
        speaker: 'Blast (Host)',
        line: `They love testing the edge cases! People assume the best-case speed applies everywhere, but when the input distribution is skewed, performance can degrade rapidly.`
      },
      {
        speaker: 'Alex (Student)',
        line: `So always check whether the input guarantees balance before picking an answer. That's a great takeaway.`
      },
      {
        speaker: 'Blast (Host)',
        line: `Exactly! Keep practicing with your flashcards and roadmap checkpoints, and you'll dominate your upcoming exam. You've got this!`
      }
    ]
  };
}

export async function generateSources(topic: string): Promise<TurboSourceItem[]> {
  const cleanTopic = topic.trim();
  const slug = cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const encoded = encodeURIComponent(cleanTopic);
  
  return [
    {
      id: `${slug}-google-search`,
      title: `${cleanTopic} — Verified Google Search & Academic Index`,
      category: 'Curated Google & Web Resources',
      summary: `Live search query aggregating official specifications, university lecture notes, and top tutorials for ${cleanTopic}.`,
      keyTakeaways: [
        `Google Search Query: "${cleanTopic} tutorials documentation"`,
        'Includes official documentation, community benchmarks, and architecture guides',
        'Direct link to explore live academic search results'
      ],
      relevance: 'Essential starting point for up-to-date documentation and research papers',
      sourceUrl: `https://www.google.com/search?q=${encoded}+documentation+tutorial`
    },
    {
      id: `${slug}-google-scholar`,
      title: `${cleanTopic} — Google Scholar & Research Literature`,
      category: 'Academic Research Papers',
      summary: `Scholarly citations, theoretical foundations, and formal research literature detailing core paradigms of ${cleanTopic}.`,
      keyTakeaways: [
        'Peer-reviewed citations and formal algorithmic proofs',
        'Theoretical limits, time/space asymptotic bounds, and system guarantees',
        'Foundational papers from leading computer science and academic conferences'
      ],
      relevance: 'Deep theoretical grounding and authoritative research benchmarks',
      sourceUrl: `https://scholar.google.com/scholar?q=${encoded}`
    },
    {
      id: `${slug}-core-cheatsheet`,
      title: `${cleanTopic} — High-Yield Core Concepts & Syntax Reference`,
      category: 'Quick Reference Guide',
      summary: `High-yield reference covering essential definitions, patterns, time/space complexity, and architecture paradigms for ${cleanTopic}.`,
      keyTakeaways: [
        'Fundamental primitives and memory execution models',
        'Standard idiomatic patterns and conventions',
        'Common boundary pitfalls and anti-patterns'
      ],
      relevance: 'Primary foundation reference for mastery and review',
      sourceUrl: `https://en.wikipedia.org/wiki/Special:Search?search=${encoded}`
    },
    {
      id: `${slug}-video-lectures`,
      title: `${cleanTopic} — Video Explanations & Lecture Demonstrations`,
      category: 'Visual & Audio Lectures',
      summary: `Step-by-step visual walkthroughs, conference talks, and interactive coding sessions illustrating ${cleanTopic}.`,
      keyTakeaways: [
        'Curated video playlists breaking down complex ideas into visual intuition',
        'Live system implementations and profiling demonstrations',
        'Audio-visual reinforcement for accelerated retention'
      ],
      relevance: 'Ideal for multimodal learners and visual conceptualization',
      sourceUrl: `https://www.youtube.com/results?search_query=${encoded}+course+tutorial`
    }
  ];
}

export async function generateStudyPack(
  topic: string,
  options?: { questionCount?: number; modelId?: string }
): Promise<TurboStudyPack> {
  const cleanTopic = topic.trim();
  const packId = `pack-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const qCount = options?.questionCount && options.questionCount > 0 ? options.questionCount : 5;
  const modelId = options?.modelId;

  // Run generation for all 5 study modules concurrently
  const [roadmap, notes, quiz, flashcards, podcast, sources] = await Promise.all([
    generateRoadmap(cleanTopic, undefined),
    generateNotes(cleanTopic),
    generateQuiz(cleanTopic, qCount, modelId),
    generateFlashcards(cleanTopic),
    generatePodcastScript(cleanTopic, modelId),
    generateSources(cleanTopic)
  ]);

  return {
    id: packId,
    topic: cleanTopic,
    createdAt: new Date().toISOString(),
    roadmap,
    notes,
    quiz,
    flashcards,
    podcast,
    sources
  };
}
