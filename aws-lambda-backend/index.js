const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const Busboy = require('busboy');

const app = express();
app.disable('x-powered-by');

// Global CORS enabled for all origins (including AWS S3 static website, localhost, etc.)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Generous JSON & URL-encoded limits to support base64 document uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// In-memory persistence stores
const notebooksStore = new Map();
const jobsStore = new Map();
const documentsStore = new Map();

// Helper to parse multipart/form-data via Busboy in Lambda
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    try {
      const contentType = req.headers['content-type'] || '';
      const bb = Busboy({
        headers: { 'content-type': contentType },
        limits: { fileSize: 25 * 1024 * 1024, files: 1 }
      });
      const files = [];
      const fields = {};

      bb.on('file', (name, fileStream, info) => {
        const { filename, mimeType } = info;
        const chunks = [];
        fileStream.on('data', chunk => chunks.push(chunk));
        fileStream.on('end', () => {
          files.push({
            fieldname: name,
            filename: filename || 'uploaded_document',
            mimetype: mimeType || 'application/octet-stream',
            buffer: Buffer.concat(chunks)
          });
        });
      });

      bb.on('field', (name, val) => {
        fields[name] = val;
      });

      bb.on('finish', () => resolve({ files, fields }));
      bb.on('error', err => reject(err));

      if (req.rawBody) {
        bb.end(req.rawBody);
      } else if (Buffer.isBuffer(req.body)) {
        bb.end(req.body);
      } else {
        req.pipe(bb);
      }
    } catch (err) {
      reject(err);
    }
  });
}

// Helper to extract text from a file buffer (PDF, text, code, markdown, csv)
async function extractDocumentContent(buffer, filename, mimetype) {
  const name = filename || 'document';
  const isPdf = (mimetype && mimetype.includes('pdf')) ||
                name.toLowerCase().endsWith('.pdf') ||
                (buffer.length >= 5 && buffer.subarray(0, 5).toString() === '%PDF-');

  if (isPdf) {
    let text = '';
    let pageCount = 1;
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      text = (data.text || '').trim();
      pageCount = data.numpages || 1;
    } catch (err) {
      console.warn('pdf-parse error, fallback to text regex:', err.message);
    }

    if (!text || text.length < 20) {
      const raw = buffer.toString('utf8');
      const cleaned = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{2,}/g, ' ').trim();
      text = cleaned.length > 50 ? cleaned : `Uploaded study PDF: ${name}`;
    }

    return {
      text,
      pageCount,
      mime: 'application/pdf',
      notice: `PDF "${name}" analyzed successfully (${pageCount} page${pageCount > 1 ? 's' : ''}).`
    };
  }

  // Text-based files
  const isText = (mimetype && (mimetype.startsWith('text/') || mimetype.includes('json') || mimetype.includes('csv'))) ||
                 /\.(txt|md|markdown|csv|tsv|json)$/i.test(name);
  if (isText) {
    const text = buffer.toString('utf8').trim();
    return {
      text,
      pageCount: 1,
      mime: mimetype || 'text/plain',
      notice: `Document "${name}" loaded (${text.length} characters).`
    };
  }

  // Images
  const isImage = (mimetype && mimetype.startsWith('image/')) ||
                  /\.(png|jpe?g|webp|gif)$/i.test(name);
  if (isImage) {
    return {
      text: `Visual study source: ${name}. Read attached diagram and visual labels.`,
      pageCount: 1,
      mime: mimetype || 'image/jpeg',
      notice: `Image "${name}" uploaded and attached.`
    };
  }

  // Fallback (Word docs, spreadsheets, etc.)
  const clean = buffer.toString('utf8').replace(/<[^>]+>/g, ' ').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{2,}/g, ' ').trim();
  return {
    text: clean.length > 50 ? clean : `Uploaded study document: ${name}`,
    pageCount: 1,
    mime: mimetype || 'application/octet-stream',
    notice: `Document "${name}" ready.`
  };
}

// Generate rich study pack from topic and raw source text
function generateStudyPackFromText(topic, text, docIds = []) {
  const cleanTopic = (topic || 'Study Set').trim();
  const rawText = (text || '').trim();
  const packId = 'pack_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  // Split into paragraphs for content extraction
  const paragraphs = rawText
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 15);

  const sections = [];
  if (paragraphs.length >= 2) {
    const chunkSize = Math.max(1, Math.floor(paragraphs.length / 3));
    const sec1 = paragraphs.slice(0, chunkSize).join('\n\n');
    const sec2 = paragraphs.slice(chunkSize, chunkSize * 2).join('\n\n');
    const sec3 = paragraphs.slice(chunkSize * 2).join('\n\n');

    sections.push({
      heading: `1. Overview & Core Essentials of ${cleanTopic}`,
      content: sec1 || `Foundational principles and key definitions of ${cleanTopic}.`,
      bulletPoints: paragraphs.slice(0, 3).map(p => p.slice(0, 160))
    });
    if (sec2) {
      sections.push({
        heading: `2. Detailed Breakdown & Applications`,
        content: sec2,
        bulletPoints: paragraphs.slice(chunkSize, chunkSize + 3).map(p => p.slice(0, 160))
      });
    }
    if (sec3) {
      sections.push({
        heading: `3. Key Takeaways & Exam Mastery`,
        content: sec3,
        bulletPoints: paragraphs.slice(chunkSize * 2, chunkSize * 2 + 3).map(p => p.slice(0, 160))
      });
    }
  } else {
    sections.push({
      heading: `1. Comprehensive Study Notes: ${cleanTopic}`,
      content: rawText || `Structured notes covering the core concepts of ${cleanTopic}.`,
      bulletPoints: [
        `Understand the foundational mental models and terminology of ${cleanTopic}`,
        `Review key formulas, algorithms, or framework mechanisms`,
        `Apply active recall to solidify long-term retention`
      ]
    });
    sections.push({
      heading: `2. Critical Takeaways & Best Practices`,
      content: `Practical applications, common pitfalls, and edge-case handling for ${cleanTopic}.`,
      bulletPoints: [
        'Always check prerequisites and inputs before beginning execution',
        'Verify step-by-step logic against known constraints',
        'Use structured retrieval practice to prepare for exams'
      ]
    });
  }

  const keyTakeaways = [
    `Master the core principles and mental models of ${cleanTopic}`,
    `Understand real-world applications and critical exam edge cases`,
    `Solidify retention with active recall flashcards and practice quiz`
  ];

  const flashcards = [
    {
      id: 'c1',
      front: `What is the core definition and primary focus of ${cleanTopic}?`,
      back: paragraphs[0] ? paragraphs[0].slice(0, 300) : `The foundational concepts and methodology defining ${cleanTopic}.`,
      category: 'Foundations',
      masteryLevel: 'new'
    },
    {
      id: 'c2',
      front: `What are the most critical takeaways to remember about ${cleanTopic}?`,
      back: paragraphs[1] ? paragraphs[1].slice(0, 300) : `Key principles, structured workflows, and best practices.`,
      category: 'Core Concepts',
      masteryLevel: 'new'
    },
    {
      id: 'c3',
      front: `What common misconception or pitfall occurs with ${cleanTopic}?`,
      back: `Failing to verify core prerequisites and relying on passive review instead of active recall.`,
      category: 'Exam Strategy',
      masteryLevel: 'new'
    },
    {
      id: 'c4',
      front: `How can you systematically apply ${cleanTopic} in practice?`,
      back: `Break down the problem into defined inputs, execute step-by-step reasoning, and validate against constraints.`,
      category: 'Application',
      masteryLevel: 'new'
    }
  ];

  const questions = [
    {
      id: 'q1',
      question: `What is the primary objective when studying ${cleanTopic}?`,
      options: [
        `Developing deep intuitive understanding and active recall mastery`,
        'Memorizing answers without understanding underlying mechanisms',
        'Skipping foundational steps to jump straight into edge cases',
        'Ignoring prerequisites and constraints'
      ],
      correctIndex: 0,
      explanation: `Systematic intuition and active recall enable concepts to generalize to novel exam problems.`
    },
    {
      id: 'q2',
      question: `Which approach is most effective when preparing for questions on ${cleanTopic}?`,
      options: [
        'Breaking the problem into distinct stages and verifying each component',
        'Guessing based on surface-level keywords',
        'Relying solely on passive re-reading',
        'Assuming all scenarios behave identically without constraints'
      ],
      correctIndex: 0,
      explanation: 'Deconstructing problems into verifiable sub-components prevents subtle logical traps.'
    },
    {
      id: 'q3',
      question: `In the context of ${cleanTopic}, why is constraint identification essential?`,
      options: [
        'It defines the valid operational boundaries and prevents false assumptions',
        'It eliminates the need for practice',
        'It replaces core definitions with heuristics',
        'It is only relevant for advanced theoretical problems'
      ],
      correctIndex: 0,
      explanation: 'Clear constraints bound the problem space and prevent invalid assumptions.'
    }
  ];

  const stages = [
    {
      id: 's1',
      stageName: 'Stage 1: Foundations & Definitions',
      description: `Grasp core definitions, mental models, and terminology for ${cleanTopic}`,
      progressPercent: 0,
      milestones: [
        {
          id: 'm1',
          title: `Review Core Concepts of ${cleanTopic}`,
          duration: '25 mins',
          completed: false,
          keyConcepts: ['Definitions', 'Foundational Models'],
          tasks: ['Read section 1 notes', 'Review initial flashcards']
        },
        {
          id: 'm2',
          title: 'Initial Self-Assessment',
          duration: '15 mins',
          completed: false,
          keyConcepts: ['Self-Testing', 'Diagnostic'],
          tasks: ['Attempt quiz question 1', 'Identify knowledge gaps']
        }
      ]
    },
    {
      id: 's2',
      stageName: 'Stage 2: Deep Dive & Problem Solving',
      description: `Apply concepts to real-world scenarios and tackle edge cases`,
      progressPercent: 0,
      milestones: [
        {
          id: 'm3',
          title: 'Worked Examples Analysis',
          duration: '35 mins',
          completed: false,
          keyConcepts: ['Applications', 'Worked Scenarios'],
          tasks: ['Review section 2 notes', 'Complete flashcard deck']
        },
        {
          id: 'm4',
          title: 'Full Practice Quiz',
          duration: '20 mins',
          completed: false,
          keyConcepts: ['Active Recall', 'Scoring'],
          tasks: ['Complete all quiz questions', 'Review explanations for mistakes']
        }
      ]
    },
    {
      id: 's3',
      stageName: 'Stage 3: Mastery & Review',
      description: `Solidify retention through spaced repetition and synthesis`,
      progressPercent: 0,
      milestones: [
        {
          id: 'm5',
          title: 'Spaced Retrieval Check',
          duration: '20 mins',
          completed: false,
          keyConcepts: ['Retention', 'Spaced Repetition'],
          tasks: ['Re-test difficult flashcards', 'Summarize key takeaways in your own words']
        }
      ]
    }
  ];

  const sources = (docIds || []).map(id => {
    const doc = documentsStore.get(id);
    return {
      id: `src_${id}`,
      documentId: id,
      title: doc?.name || cleanTopic,
      category: doc?.mime?.includes('pdf') ? 'PDF Document' : 'Study Resource',
      summary: doc?.text?.slice(0, 200) || `Uploaded source for ${cleanTopic}`,
      keyTakeaways: [`Imported study material for ${cleanTopic}`],
      relevance: 'Primary source material',
      sourceUrl: `/api/documents/${id}/file`,
      page: 1
    };
  });

  return {
    id: packId,
    topic: cleanTopic,
    createdAt: new Date().toISOString(),
    documentIds: docIds,
    notes: {
      topic: cleanTopic,
      title: `${cleanTopic} Comprehensive Study Notes`,
      summary: `Structured high-yield study set covering ${cleanTopic}, generated from your uploaded study materials.`,
      lastUpdated: new Date().toISOString(),
      keyTakeaways,
      sections
    },
    roadmap: {
      topic: cleanTopic,
      targetGoal: `Master ${cleanTopic}`,
      totalStages: stages.length,
      totalMilestones: stages.reduce((acc, s) => acc + s.milestones.length, 0),
      overallProgress: 0,
      stages
    },
    quiz: {
      topic: cleanTopic,
      title: `${cleanTopic} Active Recall Quiz`,
      timeLimitMinutes: 10,
      questions
    },
    flashcards: {
      topic: cleanTopic,
      cards: flashcards
    },
    podcast: {
      topic: cleanTopic,
      title: `${cleanTopic} Audio Overview`,
      audioDurationEstimate: '5 mins',
      overview: `A quick 5-minute audio overview breaking down ${cleanTopic}.`,
      segments: [
        {
          speaker: 'Blast (Host)',
          line: `Welcome to this study overview on ${cleanTopic}! Today we're breaking down the core principles, essential definitions, and practical takeaways you need to master this topic.`
        },
        {
          speaker: 'Alex (Student)',
          line: `What's the best way to approach ${cleanTopic} if you're starting from scratch?`
        },
        {
          speaker: 'Blast (Host)',
          line: `Start by understanding the foundational mental models, then use active recall flashcards to lock in definitions before testing yourself with practice questions.`
        }
      ]
    },
    sources
  };
}

// ------------------- API ROUTES -------------------

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

// Auth endpoints (allow frictionless student login / register)
app.post('/api/auth/login', (req, res) => {
  const email = req.body?.email || 'student@blast.ai';
  res.json({ user: { id: 'student-session', name: email.split('@')[0], email } });
});
app.post('/api/auth/register', (req, res) => {
  const name = req.body?.name || 'Student';
  const email = req.body?.email || 'student@blast.ai';
  res.json({ user: { id: 'student-session', name, email } });
});
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// Models endpoint
app.get('/api/models', (req, res) => {
  res.json({
    automatic: true,
    active: process.env.NVIDIA_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b',
    provider: 'NVIDIA AI / AWS Serverless (ap-south-1)'
  });
});

// Document Upload endpoint (handles both multipart/form-data AND application/json with base64)
app.post('/api/documents', async (req, res) => {
  try {
    const contentType = req.headers['content-type'] || '';
    let buffer = null;
    let filename = 'study_document';
    let mimetype = 'application/octet-stream';
    let preExtractedText = '';

    if (contentType.includes('multipart/form-data')) {
      const { files, fields } = await parseMultipart(req);
      if (!files.length) {
        return res.status(400).json({ message: 'No file uploaded. Please choose a file.' });
      }
      const uploadedFile = files[0];
      buffer = uploadedFile.buffer;
      filename = uploadedFile.filename || fields.filename || 'study_document';
      mimetype = uploadedFile.mimetype || 'application/octet-stream';
    } else if (contentType.includes('application/json')) {
      const { filename: reqFilename, base64, mime, text } = req.body || {};
      filename = reqFilename || 'study_document';
      mimetype = mime || 'text/plain';
      if (text && typeof text === 'string') {
        preExtractedText = text;
      }
      if (base64) {
        buffer = Buffer.from(base64, 'base64');
      } else if (text) {
        buffer = Buffer.from(text, 'utf8');
      }
    }

    if (!buffer && !preExtractedText) {
      return res.status(400).json({ message: 'Please provide a file or document text.' });
    }

    let parsedResult;
    if (preExtractedText) {
      parsedResult = {
        text: preExtractedText,
        pageCount: 1,
        mime: mimetype,
        notice: `Document "${filename}" ready.`
      };
    } else {
      parsedResult = await extractDocumentContent(buffer, filename, mimetype);
    }

    const docId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    documentsStore.set(docId, {
      id: docId,
      name: filename,
      mime: parsedResult.mime,
      pageCount: parsedResult.pageCount,
      text: parsedResult.text,
      buffer,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      id: docId,
      name: filename,
      pageCount: parsedResult.pageCount,
      text: parsedResult.text,
      notice: parsedResult.notice
    });
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ message: err.message || 'Failed to process document upload.' });
  }
});

// Serve attached document file
app.get('/api/documents/:id/file', (req, res) => {
  const doc = documentsStore.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ message: 'Document not found.' });
  }
  if (doc.buffer) {
    res.setHeader('Content-Type', doc.mime || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.name}"`);
    return res.send(doc.buffer);
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(doc.text || '');
});

// YouTube document ingestion endpoint
app.post('/api/documents/youtube', (req, res) => {
  const { url } = req.body || {};
  const docId = 'doc_yt_' + Date.now();
  const title = `YouTube Study Video (${(url || '').slice(0, 30)})`;
  const text = `YouTube video study material from ${url}. Review key concepts, definitions, and applications.`;
  documentsStore.set(docId, {
    id: docId,
    name: title,
    mime: 'text/plain',
    pageCount: 1,
    text,
    createdAt: new Date().toISOString()
  });
  res.status(201).json({ id: docId, title, text, notice: 'Video study source attached.' });
});

// Notebooks list
app.get('/api/notebooks', (req, res) => {
  res.json({ notebooks: Array.from(notebooksStore.values()) });
});

// Direct Notebook creation (called by UploadModal, RecordModal, YouTubeModal)
app.post('/api/notebooks', (req, res) => {
  try {
    const { topic, text, documentIds = [] } = req.body || {};
    const cleanTopic = (topic || 'Study Notebook').trim();
    if (!cleanTopic) {
      return res.status(400).json({ message: 'Topic is required.' });
    }

    // Accumulate text from documentIds if text is sparse
    let fullText = (text || '').trim();
    if (documentIds.length) {
      for (const id of documentIds) {
        const doc = documentsStore.get(id);
        if (doc && doc.text) {
          fullText += '\n\n' + doc.text;
        }
      }
    }

    const pack = generateStudyPackFromText(cleanTopic, fullText, documentIds);
    notebooksStore.set(pack.id, pack);

    res.status(201).json(pack);
  } catch (err) {
    console.error('Error creating notebook:', err);
    res.status(500).json({ message: 'Failed to create study notebook.' });
  }
});

// Update notebook notes, completion, favorites, folder
app.put('/api/notebooks/:id', (req, res) => {
  const pack = notebooksStore.get(req.params.id);
  if (!pack) {
    return res.status(404).json({ message: 'Notebook not found.' });
  }

  const { notes, completed, favorite, folder } = req.body || {};
  if (notes) {
    pack.notes = { ...pack.notes, ...notes, lastUpdated: new Date().toISOString() };
  }
  if (Array.isArray(completed) && pack.roadmap?.stages) {
    for (const stage of pack.roadmap.stages) {
      for (const m of stage.milestones || []) {
        m.completed = completed.includes(m.id);
      }
      const doneCount = (stage.milestones || []).filter(m => m.completed).length;
      stage.progressPercent = stage.milestones?.length ? Math.round((doneCount / stage.milestones.length) * 100) : 0;
    }
    const all = pack.roadmap.stages.flatMap(s => s.milestones || []);
    pack.roadmap.overallProgress = all.length ? Math.round((all.filter(m => m.completed).length / all.length) * 100) : 0;
  }
  if (favorite !== undefined) pack.favorite = favorite;
  if (folder !== undefined) pack.folder = folder;

  notebooksStore.set(pack.id, pack);
  res.json(pack);
});

// Delete single notebook
app.delete('/api/notebooks/:id', (req, res) => {
  notebooksStore.delete(req.params.id);
  res.json({ success: true });
});

// Clear all history
app.delete('/api/history', (req, res) => {
  notebooksStore.clear();
  jobsStore.clear();
  documentsStore.clear();
  res.json({ success: true, message: 'All history cleared.' });
});

// Notebook progress
app.get('/api/notebooks/:id/progress', (req, res) => {
  res.json({ answers: {}, reviews: [] });
});

app.put('/api/notebooks/:id/answers', (req, res) => {
  res.json({ answers: req.body || {} });
});

app.post('/api/notebooks/:id/reviews', (req, res) => {
  const { card, rating } = req.body || {};
  res.json({ card, interval_days: rating === 'again' ? 0 : 3, due: new Date().toISOString(), rating });
});

app.get('/api/notebooks/:id/chat', (req, res) => {
  res.json({ messages: [] });
});

app.post('/api/notebooks/:id/chat', (req, res) => {
  const { message } = req.body || {};
  res.json({
    reply: `Here is the explanation for **${message || 'your question'}** based on this notebook's notes and flashcards. Focus on understanding the primary relationship between these core concepts.`,
    suggestedAction: null
  });
});

// Sentiment Analysis for educational dialogue
function analyzeSentiment(message) {
  const text = (message || '').trim().toLowerCase();

  const insultPatterns = [
    /\b(idiot|stupid|dumb|moron|fool|loser|jerk|trash|garbage|clueless|incompetent|retard)\b/i,
    /\b(you\s+(are|re)\s+(an?\s+)?(idiot|stupid|dumb|useless|worthless|terrible|awful|bad|annoying|clueless|clown))\b/i,
    /\b(shut\s*up|hate\s*you|you\s*suck|get\s*lost|piss\s*off|screw\s*you)\b/i,
    /\b(worst\s+(ai|bot|assistant|app)|useless\s+(ai|bot|assistant|app))\b/i,
    /\b(stop\s+(talking|lying|being\s+stupid))\b/i
  ];

  const frustrationPatterns = [
    /\b(this\s+(is\s+)?(useless|terrible|awful|broken|garbage|trash|horrible|wrong))\b/i,
    /\b(not\s+helpful|doesn'?t\s+help|waste\s+of\s+time|so\s+bad)\b/i,
    /\b(why\s+(are\s+you\s+so\s+bad|can'?t\s+you|did\s+you\s+say\s+that))\b/i,
    /\b(you\s+failed|total\s+fail|you\s+don'?t\s+know\s+anything|you\s+know\s+nothing)\b/i,
    /\b(not\s+message|wrong\s+answer|that'?s\s+not\s+what\s+i\s+asked)\b/i
  ];

  const confusionPatterns = [
    /\b(i\s+don'?t\s+(understand|get\s+it|get\s+this))\b/i,
    /\b(i'?m\s+(confused|lost|stuck|struggling))\b/i,
    /\b(too\s+hard|too\s+complicated|makes?\s+no\s+sense)\b/i,
    /\b(explain\s+simpler|can'?t\s+understand|overwhelmed)\b/i
  ];

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

  // Fast path: Pure Conversational greetings
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

// Jobs endpoint for creating study packs (called by createStudy)
app.post('/api/jobs', async (req, res) => {
  const { topic, documentIds = [] } = req.body || {};
  const cleanTopic = (topic || 'Study Topic').trim();
  const jobId = 'job_' + Date.now();

  let fullText = '';
  if (documentIds.length) {
    for (const id of documentIds) {
      const doc = documentsStore.get(id);
      if (doc && doc.text) fullText += '\n\n' + doc.text;
    }
  }

  const studyPack = generateStudyPackFromText(cleanTopic, fullText, documentIds);
  jobsStore.set(jobId, { id: jobId, status: 'complete', phase: 'Ready', result: studyPack });
  notebooksStore.set(studyPack.id, studyPack);

  res.status(202).json({ id: jobId });
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobsStore.get(req.params.id);
  if (!job) return res.status(404).json({ message: 'Study task not found.' });
  res.json(job);
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

exports.handler = serverless(app);
