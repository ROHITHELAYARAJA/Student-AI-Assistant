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
    speaker: 'Emma (Host)' | 'Alex (Student)';
    line: string;
  }>;
}

async function callBedrock(prompt: string): Promise<string> {
  const bedrockToken =
    process.env.AWS_BEARER_TOKEN_BEDROCK ||
    process.env.BEDROCK_API_KEY ||
    '';
  const bedrockRegion = process.env.AWS_REGION || 'us-east-1';

  if (!bedrockToken) {
    return '';
  }

  const bedrockModels = [
    'meta.llama3-70b-instruct-v1:0',
    'meta.llama3-8b-instruct-v1:0',
    'amazon.nova-lite-v1:0',
    'amazon.nova-micro-v1:0'
  ];

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

  const prompt = `You are Emma, an expert Turbo AI study planner. Generate an intensive, structured mastery roadmap for the topic: "${topic}".${contextText}
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
            tasks: ['Take diagnostic checkpoint quiz', 'Clarify weak points with Emma']
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
            tasks: ['Complete final 10-question evaluation quiz', 'Review mistakes with Emma']
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

  const prompt = `You are Emma, the Turbo AI study tutor. Generate an interactive practice study lesson on the topic: "${topic}".${contextText}
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

  const prompt = `You are Emma, the Turbo AI high-yield academic note creator. Generate structured, crystal-clear study notes for the topic: "${topic}".${contextText}
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

  const prompt = `You are Emma, the Turbo AI spaced-repetition flashcard generator. Create 8 high-impact study flashcards for: "${topic}".${contextText}
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

export async function generateQuiz(topic: string): Promise<TurboQuiz> {
  const retrievedChunks = ragEngine.search(topic, 3);
  let contextText = '';
  if (retrievedChunks.length > 0) {
    contextText = `\nRAG Document Reference:\n${retrievedChunks.map((c) => c.content).join('\n---\n')}`;
  }

  const prompt = `You are Emma, the Turbo AI assessment examiner. Generate a 5-question mastery quiz for: "${topic}".${contextText}
Return ONLY valid raw JSON matching this schema:
{
  "topic": "${topic}",
  "title": "Mastery Assessment: ${topic}",
  "timeLimitMinutes": 10,
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
Pure JSON only. No markdown fences.`;

  const aiText = await callBedrock(prompt);
  if (aiText) {
    const parsed = extractJsonBlock(aiText);
    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed;
    }
  }

  return {
    topic,
    title: `Diagnostic Evaluation: ${topic}`,
    timeLimitMinutes: 8,
    questions: [
      {
        id: 'quiz-q-1',
        question: `Under standard assumptions, which principle best explains the behavior of ${topic}?`,
        options: [
          'Non-deterministic state fluctuation without boundaries',
          'Deterministic equilibrium governed by conservation laws',
          'Arbitrary thread preemption across all memory cells',
          'Static compile-time constant folding exclusively'
        ],
        correctIndex: 1,
        explanation: 'The system achieves predictable stability through strict conservation invariants and bounded state transitions.'
      },
      {
        id: 'quiz-q-2',
        question: `When scaling ${topic} across large datasets, what is the most effective optimization technique?`,
        options: [
          'Spatial partitioning and memoization of subproblems',
          'Sequential linear scanning without indexing',
          'Randomized exponential backoff on all memory reads',
          'Disabling all runtime assertions and garbage collection'
        ],
        correctIndex: 0,
        explanation: 'Spatial partitioning combined with intelligent caching dramatically minimizes redundant work and cache thrashing.'
      },
      {
        id: 'quiz-q-3',
        question: `What distinguishes an optimal implementation of ${topic} from a naive one?`,
        options: [
          'Use of longer identifier names in the source code',
          'Minimal asymptotic overhead and resilience to adversarial inputs',
          'Strict avoidance of any asynchronous execution',
          'Exclusive reliance on floating-point arithmetic'
        ],
        correctIndex: 1,
        explanation: 'Optimal implementations are characterized by tight Big-O bounds and robust guards against degenerative worst-case inputs.'
      },
      {
        id: 'quiz-q-4',
        question: `If an unexpected anomaly occurs in ${topic}, what is the first diagnostic verification step?`,
        options: [
          'Reinstall the operating system immediately',
          'Audit boundary invariants and input precondition constraints',
          'Double all timeout constants indiscriminately',
          'Convert all variables to globally scoped pointers'
        ],
        correctIndex: 1,
        explanation: 'Boundary violations and invalid preconditions account for the overwhelming majority of behavioral anomalies.'
      }
    ]
  };
}

export async function generatePodcastScript(topic: string): Promise<TurboPodcastScript> {
  const retrievedChunks = ragEngine.search(topic, 3);
  let contextText = '';
  if (retrievedChunks.length > 0) {
    contextText = `\nRAG Document Reference:\n${retrievedChunks.map((c) => c.content).join('\n---\n')}`;
  }

  const prompt = `You are Emma, the energetic and brilliant AI study host. Generate an engaging, conversational 2-speaker podcast breakdown for: "${topic}".${contextText}
The speakers are "Emma (Host)" (sharp, encouraging, explains key analogies) and "Alex (Student)" (asks the exact questions a student struggles with).
Return ONLY valid raw JSON matching this schema:
{
  "topic": "${topic}",
  "title": "Turbo Deep-Dive: Decoding ${topic}",
  "audioDurationEstimate": "4 mins",
  "overview": "A fast, punchy conversational audio overview breaking down the core concepts of ${topic} for effortless listening on the go.",
  "segments": [
    {
      "speaker": "Emma (Host)",
      "line": "Welcome back to Turbo AI Study Beats! Today we're tackling something students always ask about: ${topic}. Alex, ready to break it down?"
    },
    {
      "speaker": "Alex (Student)",
      "line": "Hey Emma! Yes, absolutely. Honestly, when I first saw ${topic}, it seemed overwhelming. Where do we even start?"
    }
  ]
}
Include 6 to 10 alternating lines highlighting the big ideas and memorable analogies. Pure JSON only.`;

  const aiText = await callBedrock(prompt);
  if (aiText) {
    const parsed = extractJsonBlock(aiText);
    if (parsed && Array.isArray(parsed.segments) && parsed.segments.length > 0) {
      return parsed;
    }
  }

  return {
    topic,
    title: `Turbo Audio Deep Dive: ${topic}`,
    audioDurationEstimate: '3 mins',
    overview: `A crisp conversational podcast episode breaking down ${topic} with Emma and Alex. Perfect for commute review!`,
    segments: [
      {
        speaker: 'Emma (Host)',
        line: `Welcome to Turbo AI Audio Sessions! Today we are tackling ${topic}—breaking down the essential principles into crystal-clear concepts.`
      },
      {
        speaker: 'Alex (Student)',
        line: `Hey Emma! Glad to be here. Honestly, ${topic} feels intimidating with all the terminology. What's the main mental model?`
      },
      {
        speaker: 'Emma (Host)',
        line: `Think of it like a finely tuned engine. At its core, it's all about balancing throughput with strict boundary constraints so nothing breaks under pressure.`
      },
      {
        speaker: 'Alex (Student)',
        line: `That makes a lot of sense! But what about on exams? What is the single biggest trap test-writers love to include?`
      },
      {
        speaker: 'Emma (Host)',
        line: `They love testing the edge cases! People assume the best-case speed applies everywhere, but when the input distribution is skewed, performance can degrade rapidly.`
      },
      {
        speaker: 'Alex (Student)',
        line: `So always check whether the input guarantees balance before picking an answer. That's a great takeaway.`
      },
      {
        speaker: 'Emma (Host)',
        line: `Exactly! Keep practicing with your flashcards and roadmap checkpoints, and you'll dominate your upcoming exam. You've got this!`
      }
    ]
  };
}
