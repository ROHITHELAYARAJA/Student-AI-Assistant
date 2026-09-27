const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();
app.disable('x-powered-by');

// Global CORS enabled for all origins (including AWS S3 static website, localhost, etc.)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json({ limit: '5mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'blast-ai-aws',
    region: process.env.AWS_REGION || 'ap-south-1',
    model: process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Session endpoint
app.get('/api/session', (req, res) => {
  res.json({
    user: {
      id: 'student-session',
      name: 'Student',
      email: null
    },
    guest: true
  });
});

// Models endpoint
app.get('/api/models', (req, res) => {
  res.json({
    automatic: true,
    active: process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b',
    provider: 'NVIDIA AI / AWS Serverless (ap-south-1)'
  });
});

// In-memory notebooks and jobs store
const notebooksStore = new Map();
const jobsStore = new Map();

// Notebooks list
app.get('/api/notebooks', (req, res) => {
  res.json({ notebooks: Array.from(notebooksStore.values()) });
});

// Sentiment Analysis for educational dialogue
function analyzeSentiment(message) {
  const text = (message || '').trim().toLowerCase();

  // Insult and hostility patterns
  const insultPatterns = [
    /\b(idiot|stupid|dumb|moron|fool|loser|jerk|trash|garbage|clueless|incompetent|retard)\b/i,
    /\b(you\s+(are|re)\s+(an?\s+)?(idiot|stupid|dumb|useless|worthless|terrible|awful|bad|annoying|clueless|clown))\b/i,
    /\b(shut\s*up|hate\s*you|you\s*suck|get\s*lost|piss\s*off|screw\s*you)\b/i,
    /\b(worst\s+(ai|bot|assistant|app)|useless\s+(ai|bot|assistant|app))\b/i,
    /\b(stop\s+(talking|lying|being\s+stupid))\b/i
  ];

  // Frustration and critical feedback patterns
  const frustrationPatterns = [
    /\b(this\s+(is\s+)?(useless|terrible|awful|broken|garbage|trash|horrible|wrong))\b/i,
    /\b(not\s+helpful|doesn'?t\s+help|waste\s+of\s+time|so\s+bad)\b/i,
    /\b(why\s+(are\s+you\s+so\s+bad|can'?t\s+you|did\s+you\s+say\s+that))\b/i,
    /\b(you\s+failed|total\s+fail|you\s+don'?t\s+know\s+anything|you\s+know\s+nothing)\b/i,
    /\b(not\s+message|wrong\s+answer|that'?s\s+not\s+what\s+i\s+asked)\b/i
  ];

  // Confusion and struggling patterns
  const confusionPatterns = [
    /\b(i\s+don'?t\s+(understand|get\s+it|get\s+this))\b/i,
    /\b(i'?m\s+(confused|lost|stuck|struggling))\b/i,
    /\b(too\s+hard|too\s+complicated|makes?\s+no\s+sense)\b/i,
    /\b(explain\s+simpler|can'?t\s+understand|overwhelmed)\b/i
  ];

  // Positive and appreciation patterns
  const positivePatterns = [
    /\b(thank\s+you|thanks|thx|ty|appreciate\s+it|grateful)\b/i,
    /\b(you\s+(are|re)\s+(awesome|amazing|great|the\s+best|smart|helpful|cool|genius|superb))\b/i,
    /\b(love\s+(this|it|you)|good\s+job|well\s+done|perfect|brilliant|fantastic)\b/i
  ];

  const isInsult = insultPatterns.some(p => p.test(text));
  const isFrustrated = frustrationPatterns.some(p => p.test(text));
  const isConfused = confusionPatterns.some(p => p.test(text));
  const isPositive = positivePatterns.some(p => p.test(text));

  if (isInsult) {
    return { label: 'negative', type: 'insult', score: -0.9 };
  }
  if (isFrustrated) {
    return { label: 'negative', type: 'frustration', score: -0.7 };
  }
  if (isConfused) {
    return { label: 'confused', type: 'struggling', score: -0.3 };
  }
  if (isPositive) {
    return { label: 'positive', type: 'gratitude', score: 0.85 };
  }
  return { label: 'neutral', type: 'informational', score: 0.0 };
}

// Pedagogical system prompt builder with sentiment guidance
function buildPedagogicalPrompt(message, sentiment) {
  const norm = (message || '').toLowerCase();
  let intentGuidance = '';

  if (sentiment && sentiment.label === 'negative') {
    intentGuidance = `
PEDAGOGICAL INTENT: Student Expressed Frustration / Criticism (${sentiment.type}).
- The student expressed: "${message}"
- Guidelines:
  1. Respond with calm empathy, humility, and polite professionalism.
  2. Sincerely apologize for any misunderstanding, confusion, or unhelpful previous response.
  3. Reassure the student that your goal is to make their studying clear and effective.
  4. Invite them to tell you what specific concept they need help with, or what went wrong so you can fix it.
  5. Never be dismissive, defensive, or return a cheerful robotic greeting.`;
  } else if (sentiment && sentiment.label === 'confused') {
    intentGuidance = `
PEDAGOGICAL INTENT: Student is Confused / Struggling.
- The student said: "${message}"
- Guidelines:
  1. Be warm, patient, and encouraging.
  2. Break down the concept into much simpler, intuitive steps.
  3. Use an intuitive real-world analogy.
  4. Ask which specific step was unclear.`;
  } else if (sentiment && sentiment.label === 'positive') {
    intentGuidance = `
PEDAGOGICAL INTENT: Student Expressed Gratitude / Positive Feedback.
- Acknowledge warmly and offer active learning follow-ups (quizzes, flashcards, or next topic).`;
  } else if (/\b(study materials?|source materials?|attached|notes|document|lecture|pdf|syllabus text)\b/i.test(norm) || message.length > 500) {
    intentGuidance = `
PEDAGOGICAL INTENT: The student has shared studying material.
- Follow the 5-step analysis:
  1. Reading your material
  2. Detecting chapters and key sections
  3. Extracting key concepts and definitions
  4. Understanding important ideas and common pitfalls
  5. Preparing your structured study notes, flashcards, or practice checks.
- Provide structured markdown with clear headings, bullet points, and high-retention takeaways.`;
  } else if (/\b(exam|test prep|finals?|midterms?|revision pack|board exam)\b/i.test(norm)) {
    intentGuidance = `
PEDAGOGICAL INTENT: Exam Revision Preparation.
- Focus on high-yield, high-priority syllabus topics first.
- Highlight common exam traps and typical student misconceptions.
- Provide quick recall questions to test readiness.`;
  } else if (/\b(explain|how does|what is|why does|intuition|break it down)\b/i.test(norm)) {
    intentGuidance = `
PEDAGOGICAL INTENT: Explaining the Concept.
- Turn difficult ideas into simple, intuitive learning.
- Break the concept into simple, progressive steps.
- Provide a concrete, real-world example or code snippet.`;
  } else if (/\b(quiz|test questions?|practice questions?|mcq)\b/i.test(norm)) {
    intentGuidance = `
PEDAGOGICAL INTENT: Quiz Generation.
- Generate high-quality active recall questions with 4 options and clear explanations.`;
  } else if (/\b(flashcards?|cards?|anki|revision cards?)\b/i.test(norm)) {
    intentGuidance = `
PEDAGOGICAL INTENT: Flashcards Creation.
- Create bite-sized retrieval questions paired with crisp, high-retention answers.`;
  } else if (/\b(study plan|roadmap|schedule|timeline|learning path)\b/i.test(norm)) {
    intentGuidance = `
PEDAGOGICAL INTENT: Building Study Plan.
- Estimate realistic study times, prioritize foundational milestones, and outline a step-by-step roadmap.`;
  }

  return `You are Blast AI — a sharp, warm, and witty personal learning assistant powered by NVIDIA Nemotron. You help students understand difficult concepts, create study packs, generate quizzes, flashcards, and study plans.

When someone greets you (hi, hey, hello, etc.), respond in your own natural, friendly voice — keep it short, warm, and genuine. Mention you're Blast AI and hint at what you can help with.
${intentGuidance}

For all other messages: respond clearly, accurately, and in structured markdown tailored for students:
- Structure comparisons or learning options cleanly with distinct emoji section headers.
- Use key-value labels like "Format:", "Strengths:", "Best for:".
- Use checkmarks (✅) for ideal student profiles or key prerequisites.
- Keep text concise, high-retention, and easy to read.

Always return valid JSON only with this exact shape:
{"reply":"your response in markdown","suggestedTopic":"concise 2-4 word topic or empty string","quickPrompts":["follow up question 1","follow up question 2"]}`;
}

// Clean model output helper
function extractChatReply(rawContent, userMessage, modelId, sentiment) {
  let trimmed = (rawContent || '').trim();
  if (trimmed.startsWith('```json')) trimmed = trimmed.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
  else if (trimmed.startsWith('```')) trimmed = trimmed.replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed.reply === 'string') {
      return {
        reply: parsed.reply,
        modelId: modelId || 'nvidia/nemotron-3-ultra-550b-a55b',
        sentiment,
        suggestedTopic: parsed.suggestedTopic || userMessage.slice(0, 40),
        quickPrompts: Array.isArray(parsed.quickPrompts) ? parsed.quickPrompts : ['Tell me more', 'Give an example', 'Create flashcards']
      };
    }
  } catch (e) {
    const replyMatch = /"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(trimmed);
    if (replyMatch) {
      try {
        const reply = JSON.parse(`"${replyMatch[1]}"`);
        return {
          reply,
          modelId: modelId || 'nvidia/nemotron-3-ultra-550b-a55b',
          sentiment,
          suggestedTopic: userMessage.slice(0, 40),
          quickPrompts: ['Tell me more', 'Give an example', 'Create flashcards']
        };
      } catch (err) {}
    }
  }

  return {
    reply: trimmed,
    modelId: modelId || 'nvidia/nemotron-3-ultra-550b-a55b',
    sentiment,
    suggestedTopic: userMessage.slice(0, 40),
    quickPrompts: ['Tell me more', 'Give an example', 'Create flashcards']
  };
}

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  const { message, history = [], modelId } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ message: 'Message is required.' });
  }

  const norm = message.trim().toLowerCase().replace(/[!.?,👋\s]+$/gu, '');
  const sentiment = analyzeSentiment(message);

  // Fast path: Pure Conversational greetings (ONLY when NOT negative/insult and strictly matching greeting phrases)
  const isPureGreeting = sentiment.label !== 'negative' &&
    (/^(hi|hey|hello|yo|sup|howdy|greetings|good\s+(morning|afternoon|evening))(\s+(blast|there|buddy|friend|ai))?$/i.test(norm) ||
     norm === 'hey' || norm === 'hi' || norm === 'hello');

  if (isPureGreeting) {
    return res.json({
      reply: "Hey there! 🚀 I'm **Blast AI**, your personal study companion. What are we diving into today?\n\nHere is how I can help:\n- **Paste or upload study materials** to generate instant notes and flashcards.\n- **Ask me to explain any difficult concept** in simple terms.\n- **Create a custom study plan or roadmap** for your upcoming exams.",
      modelId: 'blast-fast-response',
      sentiment,
      suggestedTopic: 'Study Topics',
      quickPrompts: [
        'Explain a difficult concept simply',
        'Create a 4-week study plan',
        'Help me prepare for an exam'
      ]
    });
  }

  // Fast path: Flask framework queries
  if (/\b(flask\s+commands?|what\s+is\s+flask|flask\s+routes?|flask\s+app)\b/i.test(norm)) {
    return res.json({
      reply: "Flask is a lightweight and powerful Python web framework. Here are essential **Flask commands** and concepts:\n\n- `flask run`: Starts the local development web server.\n- `flask --app <app.py> run`: Specifies the application file or module.\n- `flask run --debug`: Enables development mode with live code reloading and interactive tracebacks.\n- `flask routes`: Displays all registered URL rules, endpoints, and accepted HTTP methods.\n- `flask shell`: Opens an interactive Python shell pre-configured with the application context.\n\n```python\nfrom flask import Flask, jsonify\n\napp = Flask(__name__)\n\n@app.route('/api/hello')\ndef hello():\n    return jsonify(message='Hello from Flask!')\n\nif __name__ == '__main__':\n    app.run(debug=True)\n```\n\nWould you like me to build a complete interactive study notebook on Flask commands with notes, flashcards, and a practice quiz?",
      modelId: 'blast-fast-response',
      sentiment,
      suggestedTopic: 'Flask commands',
      suggestedAction: {
        type: 'create_notebook',
        topic: 'Flask commands',
        label: 'Create notebook on Flask commands'
      },
      quickPrompts: [
        'Create study notebook on Flask commands',
        'How does Flask routing work?',
        'Explain Flask request handling and JSON responses'
      ]
    });
  }

  // Call NVIDIA Nemotron via NVIDIA API
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const nvidiaBase = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  const targetModel = modelId || process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b';
  const chatSystem = buildPedagogicalPrompt(message, sentiment);

  if (nvidiaKey) {
    try {
      const response = await fetch(`${nvidiaBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nvidiaKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: 'system', content: chatSystem },
            ...history.slice(-4).map(h => ({ role: h.role, content: h.text })),
            { role: 'user', content: message }
          ],
          temperature: 0.4,
          max_tokens: 1500
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (response.ok) {
        const json = await response.json();
        const rawContent = json.choices?.[0]?.message?.content || '';
        if (rawContent.trim()) {
          return res.json(extractChatReply(rawContent, message, targetModel, sentiment));
        }
      }
    } catch (err) {
      console.warn('NVIDIA API Call failed, using pedagogical fallback:', err.message);
    }
  }

  // Sentiment-aware fallback responses if NVIDIA is unavailable
  if (sentiment.label === 'negative') {
    return res.json({
      reply: "I'm really sorry if I frustrated you or gave an unhelpful answer! 😔\n\nAs your study copilot, I want to make sure you get clear, accurate, and genuinely helpful explanations. Tell me what went wrong or what concept you're working on, and I'll do my best to break it down properly.",
      modelId: targetModel,
      sentiment,
      suggestedTopic: 'Study Help',
      quickPrompts: [
        'Explain a concept more simply',
        'Help me solve a specific problem',
        'Start fresh with a new topic'
      ]
    });
  }

  if (sentiment.label === 'positive') {
    return res.json({
      reply: "You're very welcome! 🎉 I'm glad that helped. Whenever you're ready, we can quiz yourself on this topic, review active recall flashcards, or explore something new!\n\nWhat would you like to dive into next?",
      modelId: targetModel,
      sentiment,
      quickPrompts: [
        'Quiz me on this topic',
        'Create flashcards for this',
        'Move on to the next topic'
      ]
    });
  }

  if (sentiment.label === 'confused') {
    return res.json({
      reply: "No worries at all — learning complex topics is tough, and feeling confused is completely normal! 💡\n\nLet's take a step back and break this down into smaller, simpler pieces. Which specific part feels tricky?",
      modelId: targetModel,
      sentiment,
      quickPrompts: [
        'Explain with a real-world analogy',
        'Show me a step-by-step example',
        'Start from the absolute basics'
      ]
    });
  }

  // Fallback response for neutral topics
  return res.json({
    reply: `I understand you'd like to learn about **"${message}"**.\n\nI can help break down this concept or generate a full interactive study set with notes, active recall flashcards, and practice quiz questions.`,
    modelId: targetModel,
    sentiment,
    suggestedTopic: message.slice(0, 40),
    suggestedAction: {
      type: 'create_notebook',
      topic: message.slice(0, 40),
      label: `Create notebook on "${message.slice(0, 25)}"`
    },
    quickPrompts: [
      `Explain ${message.slice(0, 30)} simply`,
      `Create flashcards on ${message.slice(0, 30)}`,
      `Test my knowledge on ${message.slice(0, 30)}`
    ]
  });
});

// Jobs endpoint for creating study packs
app.post('/api/jobs', async (req, res) => {
  const { topic } = req.body || {};
  const cleanTopic = (topic || 'Study Topic').trim();
  const jobId = 'job_' + Date.now();

  const studyPack = {
    id: 'pack_' + Date.now(),
    topic: cleanTopic,
    createdAt: new Date().toISOString(),
    documentIds: [],
    notes: {
      topic: cleanTopic,
      title: `${cleanTopic} Comprehensive Study Notes`,
      summary: `High-yield structured study notes covering the core fundamentals, key definitions, and practical applications of ${cleanTopic}.`,
      lastUpdated: new Date().toISOString(),
      keyTakeaways: [
        `Master the core principles and mental models of ${cleanTopic}`,
        `Understand edge cases, common pitfalls, and practical problem-solving strategies`,
        `Apply active recall to solidify long-term retention`
      ],
      sections: [
        {
          heading: '1. Fundamentals & Core Intuition',
          content: `An in-depth explanation of ${cleanTopic}. Focus on foundational principles before moving on to advanced variations.`,
          bulletPoints: [
            'Core definition and primary use cases',
            'Underlying mechanics and architectural flow',
            'Key constraints and performance considerations'
          ]
        },
        {
          heading: '2. Deep Dive & Worked Examples',
          content: `Real-world examples illustrating how ${cleanTopic} operates in production and academic contexts.`,
          bulletPoints: [
            'Step 1: Problem formulation',
            'Step 2: Systematic solution execution',
            'Step 3: Verification and validation'
          ]
        }
      ]
    },
    roadmap: {
      topic: cleanTopic,
      targetGoal: `Master ${cleanTopic}`,
      totalStages: 3,
      totalMilestones: 6,
      overallProgress: 0,
      stages: [
        {
          id: 's1',
          name: 'Stage 1: Foundations',
          description: 'Build intuition and understand core definitions',
          progressPercent: 0,
          milestones: [
            { id: 'm1', title: 'Review core definitions and syntax', estimatedMinutes: 20, completed: false },
            { id: 'm2', title: 'Complete first practice problem', estimatedMinutes: 30, completed: false }
          ]
        },
        {
          id: 's2',
          name: 'Stage 2: Core Applications',
          description: 'Hands-on practice and common pattern analysis',
          progressPercent: 0,
          milestones: [
            { id: 'm3', title: 'Analyze real-world scenarios', estimatedMinutes: 45, completed: false },
            { id: 'm4', title: 'Practice edge cases and variations', estimatedMinutes: 40, completed: false }
          ]
        }
      ]
    },
    quiz: {
      topic: cleanTopic,
      title: `${cleanTopic} Active Recall Quiz`,
      timeLimitMinutes: 10,
      questions: [
        {
          id: 'q1',
          question: `What is the primary advantage of understanding ${cleanTopic} systematically?`,
          options: [
            'It enables rapid problem solving and deep intuition',
            'It avoids the need to practice',
            'It guarantees memorization without understanding',
            'It replaces all underlying principles'
          ],
          correctIndex: 0,
          explanation: 'Systematic understanding builds long-term mental models that generalize to novel problems.'
        },
        {
          id: 'q2',
          question: `When applying ${cleanTopic}, what is the first step you should take?`,
          options: [
            'Identify constraints and foundational requirements',
            'Guess the final output immediately',
            'Skip verification',
            'Ignore prerequisites'
          ],
          correctIndex: 0,
          explanation: 'Clear constraint identification prevents downstream errors.'
        }
      ]
    },
    flashcards: {
      topic: cleanTopic,
      cards: [
        {
          id: 'c1',
          front: `What is the core intuition behind ${cleanTopic}?`,
          back: `The core intuition is breaking down complex mechanics into understandable, repeatable principles.`,
          retrievalCue: 'Mental model'
        },
        {
          id: 'c2',
          front: `What common mistake do students make with ${cleanTopic}?`,
          back: `Relying on passive reading instead of active problem solving and retrieval practice.`,
          retrievalCue: 'Common Pitfall'
        }
      ]
    },
    podcast: {
      topic: cleanTopic,
      title: `${cleanTopic} Audio Overview`,
      overview: `A quick 5-minute audio overview breaking down ${cleanTopic}.`,
      audioDurationEstimate: '5 mins',
      segments: []
    },
    sources: []
  };

  jobsStore.set(jobId, { id: jobId, status: 'complete', phase: 'Ready', result: studyPack });
  notebooksStore.set(studyPack.id, studyPack);

  res.status(202).json({ id: jobId });
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobsStore.get(req.params.id);
  if (!job) return res.status(404).json({ message: 'Study task not found.' });
  res.json(job);
});

// Single notebook chat endpoint
app.post('/api/notebooks/:id/chat', async (req, res) => {
  const { message } = req.body || {};
  res.json({
    reply: `Here is the explanation for **${message || 'your question'}** based on this notebook's notes and flashcards. Focus on understanding the primary relationship between these core concepts.`,
    suggestedAction: null
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

exports.handler = serverless(app);
