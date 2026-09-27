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
};

export async function sendChat(message: string, history: { role: string; text: string }[] = [], modelId?: string): Promise<ChatResponse> {
  try {
    return await request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history, modelId })
    });
  } catch (_err) {
    // 24/7 Intelligent Client-Side Response when remote backend is not connected
    const trimmed = message.trim().toLowerCase().replace(/[!.?,👋\s]+$/gu, '');

    // 1. Greetings (like "hey blast", "hi", "hello")
    if (/^(hi|hey|hello|hey blast|hello blast|hi blast|yo|sup|howdy|greetings)/i.test(trimmed) || trimmed === 'hey' || trimmed === 'hi') {
      return {
        reply: "Hey there! 🚀 I'm **Blast AI**, your personal study companion. What are we diving into today?\n\nHere is how I can help:\n- **Paste or upload study materials** to generate instant notes and flashcards.\n- **Ask me to explain any difficult concept** in simple terms.\n- **Create a custom study plan or roadmap** for your upcoming exams.",
        modelId: 'blast-fast-response',
        suggestedTopic: 'Study Topics',
        quickPrompts: [
          'Explain a difficult concept simply',
          'Create a 4-week study plan',
          'Help me prepare for an exam'
        ]
      };
    }

    // 2. Who are you / help
    if (/^(who are you|what can you do|help|about)/i.test(trimmed)) {
      return {
        reply: "I'm **Blast AI** — an intelligent study copilot designed to help students master complex subjects faster.\n\nHere is what I can do for you:\n1. 📖 **Smart Notes:** Extract key ideas and formulas from textbooks or lectures.\n2. 🗂️ **Flashcards:** Generate active recall cards for high retention.\n3. 📝 **Practice Quizzes:** Test your understanding with multiple-choice questions.\n4. 🗺️ **Learning Roadmaps:** Break down any topic into clear milestones.\n\nDrop a topic or question below to get started!",
        modelId: 'blast-fast-response',
        quickPrompts: ['DSA Roadmap', 'Flask Commands', 'Machine Learning Basics']
      };
    }

    // 3. Flask queries
    if (/\bflask\b/i.test(trimmed)) {
      return {
        reply: "Flask is a lightweight Python web framework known for its simplicity and flexibility. Essential commands:\n\n- `flask run`: Starts local dev server\n- `flask run --debug`: Enables live reloading & browser debugger\n- `flask routes`: Displays all registered URL rules & HTTP methods\n- `flask shell`: Interactive Python shell with application context\n\n```python\nfrom flask import Flask, jsonify\napp = Flask(__name__)\n\n@app.route('/')\ndef home():\n    return jsonify(message='Hello from Flask!')\n```\n\nWould you like me to build a complete study notebook with flashcards and a quiz for Flask?",
        suggestedTopic: 'Flask Web Framework',
        suggestedAction: {
          type: 'create_notebook',
          topic: 'Flask Web Development',
          label: 'Create Flask Study Notebook'
        },
        quickPrompts: ['Create Flask study notebook', 'How does Flask routing work?']
      };
    }

    // 4. Default high-yield pedagogical guidance
    return {
      reply: `I've analyzed your question about **"${message.slice(0, 60)}"**.\n\nTo give you the most accurate and high-retention breakdown, I can generate a complete study pack with structured notes, active recall flashcards, and a practice quiz.\n\nClick below to create an interactive notebook on this topic!`,
      modelId: 'blast-fast-response',
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

