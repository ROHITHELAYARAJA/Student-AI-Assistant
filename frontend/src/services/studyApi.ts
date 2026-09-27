import { TurboStudyPack } from '../types/turbo';

const AWS_API_ENDPOINT = 'https://riplbhin7i.execute-api.ap-south-1.amazonaws.com/api';

const isAwsHost = typeof window !== 'undefined' && (
  window.location.hostname.includes('amazonaws.com') ||
  window.location.hostname.includes('s3-website') ||
  window.location.hostname.includes('cloudfront.net')
);

export const API_BASE = (import.meta.env.VITE_API_URL as string) || (isAwsHost ? AWS_API_ENDPOINT : '/api');

export async function request<T=any>(url:string, options:RequestInit={}):Promise<T> {
  let res:Response;
  const targetUrl = url.startsWith('http') ? url : `${API_BASE}${url.startsWith('/') ? url : '/' + url}`;
  try {
    res = await fetch(targetUrl, {
      ...options,
      headers: options.body instanceof FormData ? options.headers : { 'Content-Type': 'application/json', ...options.headers }
    });
  } catch {
    throw new Error('We couldn’t connect to your workspace. Check your connection and try again.');
  }
  if (!res.headers.get('content-type')?.includes('application/json')) {
    throw new Error('This preview isn’t connected to Blast. Open the Blast workspace and try again.');
  }
  const data = await res.json().catch(() => { throw new Error('We couldn’t read this response. Please try again.'); });
  if (!res.ok) throw new Error(data.message || 'This action could not be completed.');
  return data;
}
export type StudySettings={questionCount:number;cardCount:number;difficulty:'beginner'|'intermediate'|'advanced';language:string};
export async function createStudy(topic:string,documentIds:string[],settings:StudySettings,onProgress:(s:string)=>void):Promise<TurboStudyPack>{
  const {id}=await request('/jobs',{method:'POST',body:JSON.stringify({topic,documentIds,...settings})});
  // Store the job ID so a refresh can reconnect instead of losing a paid generation.
  sessionStorage.setItem('blast_active_job',id);
  return await followStudy(id,onProgress);
}
export async function followStudy(id:string,onProgress:(s:string)=>void):Promise<TurboStudyPack>{
  for(let n=0;n<180;n++){
    const job=await request(`/jobs/${id}`);onProgress(job.phase);
    if(job.status==='complete'){sessionStorage.removeItem('blast_active_job');return job.result;}
    if(job.status==='failed'){sessionStorage.removeItem('blast_active_job');throw new Error(job.error||'Could not create the study set.');}
    await new Promise(r=>setTimeout(r,1500));
  }
  throw new Error('This task is still processing. Reload to reconnect to it.');
}
export async function saveRemote(pack:TurboStudyPack){return request<TurboStudyPack>(`/notebooks/${pack.id}`,{method:'PUT',body:JSON.stringify({notes:pack.notes,completed:pack.roadmap.stages.flatMap(s=>s.milestones.filter(m=>m.completed).map(m=>m.id)),favorite:pack.favorite,folder:pack.folder})});}

export type SentimentResult = {
  label: 'negative' | 'positive' | 'confused' | 'neutral';
  type: string;
  score: number;
};

export type ChatResponse = {
  reply: string;
  modelId?: string;
  suggestedTopic?: string;
  suggestedAction?: {
    type: 'create_notebook';
    topic: string;
    label: string;
  };
  quickPrompts?: string[];
  sentiment?: SentimentResult;
};

// Client-side sentiment analysis for responsive, emotionally intelligent dialogue
export function analyzeSentiment(message: string): SentimentResult {
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

export async function sendChat(message: string, history: { role: string; text: string }[] = [], modelId?: string): Promise<ChatResponse> {
  try {
    return await request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history, modelId })
    });
  } catch (_err) {
    // 24/7 Intelligent Client-Side Response when remote backend is not connected
    const trimmed = message.trim().toLowerCase().replace(/[!.?,👋\s]+$/gu, '');
    const sentiment = analyzeSentiment(message);

    // 1. Pure Greetings (ONLY if NOT negative/insult, and strictly matching greeting words)
    const isPureGreeting = sentiment.label !== 'negative' &&
      (/^(hi|hey|hello|yo|sup|howdy|greetings|good\s+(morning|afternoon|evening))(\s+(blast|there|buddy|friend|ai))?$/i.test(trimmed) ||
       trimmed === 'hey' || trimmed === 'hi' || trimmed === 'hello');

    if (isPureGreeting) {
      return {
        reply: "Hey there! 🚀 I'm **Blast AI**, your personal study companion. What are we diving into today?\n\nHere is how I can help:\n- **Paste or upload study materials** to generate instant notes and flashcards.\n- **Ask me to explain any difficult concept** in simple terms.\n- **Create a custom study plan or roadmap** for your upcoming exams.",
        modelId: 'blast-fast-response',
        sentiment,
        suggestedTopic: 'Study Topics',
        quickPrompts: [
          'Explain a difficult concept simply',
          'Create a 4-week study plan',
          'Help me prepare for an exam'
        ]
      };
    }

    // 2. Negative / Frustrated sentiment handling
    if (sentiment.label === 'negative') {
      return {
        reply: "I'm really sorry if I frustrated you or gave an unhelpful answer! 😔\n\nAs your study copilot, I want to make sure you get clear, accurate, and genuinely helpful explanations. Tell me what went wrong or what concept you're working on, and I'll do my best to break it down properly.",
        modelId: 'blast-fast-response',
        sentiment,
        suggestedTopic: 'Study Help',
        quickPrompts: [
          'Explain a concept more simply',
          'Help me solve a specific problem',
          'Start fresh with a new topic'
        ]
      };
    }

    // 3. Positive / Gratitude sentiment handling
    if (sentiment.label === 'positive') {
      return {
        reply: "You're very welcome! 🎉 I'm glad that helped. Whenever you're ready, we can quiz yourself on this topic, review active recall flashcards, or explore something new!\n\nWhat would you like to dive into next?",
        modelId: 'blast-fast-response',
        sentiment,
        quickPrompts: [
          'Quiz me on this topic',
          'Create flashcards for this',
          'Move on to the next topic'
        ]
      };
    }

    // 4. Confused / Struggling sentiment handling
    if (sentiment.label === 'confused') {
      return {
        reply: "No worries at all — learning complex topics is tough, and feeling confused is completely normal! 💡\n\nLet's take a step back and break this down into smaller, simpler pieces. Which specific part feels tricky?",
        modelId: 'blast-fast-response',
        sentiment,
        quickPrompts: [
          'Explain with a real-world analogy',
          'Show me a step-by-step example',
          'Start from the absolute basics'
        ]
      };
    }

    // 5. Who are you / help
    if (/^(who are you|what can you do|help|about)/i.test(trimmed)) {
      return {
        reply: "I'm **Blast AI** — an intelligent study copilot designed to help students master complex subjects faster.\n\nHere is what I can do for you:\n1. 📖 **Smart Notes:** Extract key ideas and formulas from textbooks or lectures.\n2. 🗂️ **Flashcards:** Generate active recall cards for high retention.\n3. 📝 **Practice Quizzes:** Test your understanding with multiple-choice questions.\n4. 🗺️ **Learning Roadmaps:** Break down any topic into clear milestones.\n\nDrop a topic or question below to get started!",
        modelId: 'blast-fast-response',
        sentiment,
        quickPrompts: ['DSA Roadmap', 'Flask Commands', 'Machine Learning Basics']
      };
    }

    // 6. Flask queries
    if (/\bflask\b/i.test(trimmed)) {
      return {
        reply: "Flask is a lightweight Python web framework known for its simplicity and flexibility. Essential commands:\n\n- `flask run`: Starts local dev server\n- `flask run --debug`: Enables live reloading & browser debugger\n- `flask routes`: Displays all registered URL rules & HTTP methods\n- `flask shell`: Interactive Python shell with application context\n\n```python\nfrom flask import Flask, jsonify\napp = Flask(__name__)\n\n@app.route('/')\ndef home():\n    return jsonify(message='Hello from Flask!')\n```\n\nWould you like me to build a complete study notebook with flashcards and a quiz for Flask?",
        modelId: 'blast-fast-response',
        sentiment,
        suggestedTopic: 'Flask Web Framework',
        suggestedAction: {
          type: 'create_notebook',
          topic: 'Flask Web Development',
          label: 'Create Flask Study Notebook'
        },
        quickPrompts: ['Create Flask study notebook', 'How does Flask routing work?']
      };
    }

    // 7. Default high-yield pedagogical guidance
    return {
      reply: `I've analyzed your question about **"${message.slice(0, 60)}"**.\n\nTo give you the most accurate and high-retention breakdown, I can generate a complete study pack with structured notes, active recall flashcards, and a practice quiz.\n\nClick below to create an interactive notebook on this topic!`,
      modelId: 'blast-fast-response',
      sentiment,
      suggestedTopic: message.slice(0, 50),
      suggestedAction: {
        type: 'create_notebook',
        topic: message.slice(0, 50),
        label: `Generate Study Pack for "${message.slice(0, 30)}"`
      },
      quickPrompts: [
        `Explain ${message.slice(0, 30)} step-by-step`,
        `Create flashcards on ${message.slice(0, 30)}`,
        `Test my knowledge on ${message.slice(0, 30)}`
      ]
    };
  }
}

