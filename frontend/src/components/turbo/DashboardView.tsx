import React, { useState, useEffect } from 'react';
import { router } from '../../services/router.js';
import { BlastMascot, BlastMascotState } from './BlastMascot.js';
import { getSavedStudyPacks, fetchStudyPack, saveStudyPack } from '../../services/turboApi.js';
import { TurboStudyPack } from '../../types/turbo.js';
import {
  Mic,
  Upload,
  Youtube,
  ArrowUp,
  FolderPlus,
  Sparkles,
  Sun,
  Moon,
  Loader2,
  BookOpen,
  Compass,
  FileText,
  Award,
  Layers,
  Headphones,
  FolderGit2,
  Flame,
  Clock,
  Trash2,
  Plus
} from 'lucide-react';

interface DashboardViewProps {
  userName?: string;
  onStartNewLesson: (prompt: string) => void;
  onOpenUpgrade?: () => void;
  onOpenEmma?: () => void;
  onOpenBlast?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName = 'Student',
  onStartNewLesson,
  onOpenUpgrade,
  onOpenEmma,
  onOpenBlast
}) => {
  const openBlastHandler = onOpenBlast || onOpenEmma;
  const [prompt, setPrompt] = useState('');
  const [studyPacks, setStudyPacks] = useState<TurboStudyPack[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeGeneratingTopic, setActiveGeneratingTopic] = useState('');
  const [mascotState, setMascotState] = useState<BlastMascotState>('greeting');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('blast_theme') as 'dark' | 'light') || 'dark';
  });

  // Switch from greeting to idle after entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setMascotState('idle');
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('blast_theme', theme);
  }, [theme]);

  // Load saved packs or seed with high-yield default courses
  useEffect(() => {
    const existing = getSavedStudyPacks();
    if (existing.length > 0) {
      setStudyPacks(existing);
    } else {
      // Default high-yield learning modules by default
      const defaultPacks: TurboStudyPack[] = [
        {
          id: 'java-mastery',
          topic: 'How to learn Java from scratch',
          createdAt: new Date().toISOString(),
          roadmap: {
            topic: 'How to learn Java from scratch',
            targetGoal: 'Master Java OOP, Collections, JVM & Spring Boot',
            totalStages: 3,
            totalMilestones: 6,
            overallProgress: 25,
            stages: [
              {
                id: 's-1',
                stageName: 'Stage 1: Core Syntax & JVM Architecture',
                description: 'Memory model, compilation, primitives and classes.',
                progressPercent: 50,
                milestones: [
                  {
                    id: 'm-1',
                    title: 'Java Fundamentals & Main Class Structure',
                    duration: '45 mins',
                    completed: true,
                    keyConcepts: ['JVM', 'Bytecode', 'Classloader'],
                    tasks: ['Configure JDK', 'Compile and run first class']
                  },
                  {
                    id: 'm-2',
                    title: 'Memory Allocation: Stack vs Heap',
                    duration: '1 hr',
                    completed: false,
                    keyConcepts: ['Garbage Collection', 'References', 'Pointers'],
                    tasks: ['Trace object allocations', 'Inspect memory overhead']
                  }
                ]
              }
            ]
          },
          notes: {
            topic: 'How to learn Java from scratch',
            title: 'Mastery Notes: Java Core & Applied Systems',
            lastUpdated: 'Today',
            summary: 'Comprehensive guide covering Java language fundamentals, JVM mechanics, OOP abstractions, and enterprise concurrency.',
            keyTakeaways: [
              'Understand the distinction between compilation into bytecode and JIT execution.',
              'Master OOP pillars: Encapsulation, Polymorphism, Inheritance, and Abstraction.',
              'Use Collections framework (List, Map, Set) with appropriate asymptotic bounds.'
            ],
            sections: [
              {
                heading: '1. The JVM Execution Model',
                content: 'Java source code (.java) compiles into portable bytecode (.class) which executes on the Java Virtual Machine using Just-In-Time (JIT) compilation.',
                bulletPoints: [
                  'Stack memory stores local variables and method invocations',
                  'Heap memory stores all instantiated objects',
                  'Garbage Collector reclaims unreachable heap objects'
                ],
                codeSnippet: {
                  language: 'java',
                  code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Blast AI Java Engine Active!");\n    }\n}'
                }
              }
            ]
          },
          quiz: {
            topic: 'How to learn Java from scratch',
            title: 'Java Architecture & Core Assessment',
            timeLimitMinutes: 15,
            questions: [
              {
                id: 'q-1',
                question: 'Which component is responsible for executing Java bytecode and translating it into native machine code at runtime?',
                options: [
                  'The Java Development Kit (JDK) compiler',
                  'The JVM with the Just-In-Time (JIT) compiler',
                  'The operating system kernel directly',
                  'The text editor runtime'
                ],
                correctIndex: 1,
                explanation: 'The JVM parses bytecode and optimizes hot code paths directly into machine code via the JIT compiler.'
              },
              {
                id: 'q-2',
                question: 'Where are dynamic object instances stored during Java program execution?',
                options: [
                  'In the execution stack memory',
                  'In the globally managed Heap memory',
                  'Inside the CPU instruction cache only',
                  'On the local hard drive storage'
                ],
                correctIndex: 1,
                explanation: 'All object instances in Java reside in the Heap memory and are managed by the Garbage Collector.'
              }
            ]
          },
          flashcards: {
            topic: 'How to learn Java from scratch',
            cards: [
              {
                id: 'c-1',
                front: 'What does "Write Once, Run Anywhere" mean in Java?',
                back: 'Java source compiles to standardized bytecode (.class) that executes on any operating system with a compatible JVM.',
                category: 'Architecture',
                masteryLevel: 'mastered'
              },
              {
                id: 'c-2',
                front: 'What is the time complexity of looking up a key in a java.util.HashMap?',
                back: 'Amortized O(1) constant time, assuming a uniform hash distribution without excessive hash collisions.',
                category: 'Collections',
                masteryLevel: 'learning'
              }
            ]
          },
          podcast: {
            topic: 'How to learn Java from scratch',
            title: 'Blast Audio Deep Dive: Mastering Java from Scratch',
            audioDurationEstimate: '3 mins',
            overview: 'Blast and Alex break down JVM architecture, memory allocation, and the fastest path to building production services.',
            segments: [
              {
                speaker: 'Blast (Host)',
                line: 'Welcome to Blast AI Audio Sessions! Today we are dissecting Java—from core memory models to production architecture.'
              },
              {
                speaker: 'Alex (Student)',
                line: 'Hey Blast! Java syntax looks intimidating with all the verbose boilerplate. Where should I focus first?'
              },
              {
                speaker: 'Blast (Host)',
                line: 'Focus on understanding Stack versus Heap memory! Once you visualize how references point to heap objects, the rest of OOP becomes crystal clear.'
              }
            ]
          },
          sources: [
            {
              id: 'java-core-docs',
              title: 'Java Platform Standard Edition Official Documentation',
              category: 'Official Reference Manual',
              summary: 'Definitive API specifications for the Java base libraries, memory model, and JVM specification.',
              keyTakeaways: ['Runtime semantics', 'Core collections', 'Thread synchronization'],
              relevance: 'Primary foundation reference',
              sourceUrl: 'https://docs.oracle.com/en/java/'
            }
          ]
        },
        {
          id: 'ml-foundations',
          topic: 'Machine Learning & Neural Networks',
          createdAt: new Date().toISOString(),
          roadmap: {
            topic: 'Machine Learning & Neural Networks',
            targetGoal: 'Master Supervised Learning, Backpropagation & Transformers',
            totalStages: 3,
            totalMilestones: 6,
            overallProgress: 15,
            stages: [
              {
                id: 's-1',
                stageName: 'Stage 1: Mathematical Foundations & Linear Models',
                description: 'Linear regression, loss surfaces, and gradient descent.',
                progressPercent: 30,
                milestones: [
                  {
                    id: 'm-1',
                    title: 'Loss Functions & Gradient Descent Optimization',
                    duration: '1 hr',
                    completed: true,
                    keyConcepts: ['MSE', 'Learning Rate', 'Backprop'],
                    tasks: ['Derive gradient vectors', 'Implement stochastic gradient descent']
                  }
                ]
              }
            ]
          },
          notes: {
            topic: 'Machine Learning & Neural Networks',
            title: 'High-Yield Notes: Machine Learning & Deep Learning',
            lastUpdated: 'Today',
            summary: 'Essential formulations, backpropagation mechanics, attention layers, and model evaluation protocols.',
            keyTakeaways: [
              'Gradient descent iteratively adjusts weight parameters by computing loss gradients with the chain rule.',
              'Overfitting is mitigated using L1/L2 regularization, dropout, and cross-validation splits.',
              'Self-attention scales with O(N^2) in sequence length, enabling parallelized sequence modeling.'
            ],
            sections: [
              {
                heading: '1. Gradient Descent Formulation',
                content: 'Parameters are updated in the opposite direction of the gradient of the objective function.',
                formulas: ['w_{t+1} = w_t - \\eta \\nabla_w \\mathcal{L}(w_t)']
              }
            ]
          },
          quiz: {
            topic: 'Machine Learning & Neural Networks',
            title: 'Deep Learning & Neural Network Assessment',
            timeLimitMinutes: 15,
            questions: [
              {
                id: 'q-1',
                question: 'What is the primary purpose of an activation function in a neural network?',
                options: [
                  'To normalize input batch sizes',
                  'To introduce non-linearity so the network can model complex non-linear functions',
                  'To speed up CPU clock cycles',
                  'To automatically label training data'
                ],
                correctIndex: 1,
                explanation: 'Without non-linear activations, stacking multiple layers would simply collapse into a single linear transformation.'
              }
            ]
          },
          flashcards: {
            topic: 'Machine Learning & Neural Networks',
            cards: [
              {
                id: 'c-1',
                front: 'What is the Vanishing Gradient problem in deep networks?',
                back: 'During backpropagation, multiplying many small gradients (< 1) causes gradients in early layers to shrink toward zero, halting learning.',
                category: 'Optimization',
                masteryLevel: 'learning'
              }
            ]
          },
          podcast: {
            topic: 'Machine Learning & Neural Networks',
            title: 'Blast Audio Deep Dive: Demystifying Neural Networks',
            audioDurationEstimate: '3 mins',
            overview: 'Blast and Alex break down loss gradients, backpropagation, and transformer architectures.',
            segments: [
              {
                speaker: 'Blast (Host)',
                line: 'Welcome back to Blast AI! Today we are demystifying how neural networks actually learn from raw data.'
              }
            ]
          },
          sources: []
        }
      ];

      setStudyPacks(defaultPacks);
      defaultPacks.forEach((p) => saveStudyPack(p));
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (e.target.value.trim().length > 0) {
      setMascotState('listening');
    } else {
      setMascotState('idle');
    }
  };

  const handleGenerate = async (topicToGenerate: string) => {
    const clean = topicToGenerate.trim();
    if (!clean) return;

    try {
      setIsGenerating(true);
      setActiveGeneratingTopic(clean);
      setMascotState('thinking');

      setTimeout(() => {
        setMascotState('processing');
      }, 800);

      const pack = await fetchStudyPack(clean);
      setStudyPacks(getSavedStudyPacks());
      setMascotState('success');
      onStartNewLesson(clean);

      setTimeout(() => {
        router.navigate(`/notes/${pack.id}`);
      }, 600);
    } catch (err) {
      console.error('Error generating study pack:', err);
      setMascotState('error');
      onStartNewLesson(clean);
      setTimeout(() => {
        router.navigate('/notes/learn');
      }, 800);
    } finally {
      setIsGenerating(false);
      setActiveGeneratingTopic('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    const text = prompt.trim();
    setPrompt('');
    handleGenerate(text);
  };

  const handleRecordToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setPrompt('Live recorded lecture: Algorithms, Data Flow, and Concurrency');
      setMascotState('listening');
    } else {
      setMascotState('idle');
    }
  };

  const handleDeletePack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = studyPacks.filter((p) => p.id !== id);
    setStudyPacks(updated);
    localStorage.setItem('turbo_study_packs_v1', JSON.stringify(updated));
  };

  const latestPack = studyPacks.length > 0 ? studyPacks[0] : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col font-body select-none transition-colors duration-200">
      {/* Top Header */}
      <header className="h-16 px-6 md:px-8 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => router.navigate('/dashboard')}
        >
          {/* Blast AI Official Flame Emblem Logo */}
          <img
            src="/blast-logo.png"
            alt="Blast AI Logo"
            className="w-8 h-8 rounded-xl object-contain shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform bg-[#181824] p-1 border border-orange-500/20"
          />
          <span className="font-headline font-bold text-lg tracking-tight flex items-center gap-1">
            <span>blast</span>
            <span className="text-[#FF5E00]">ai</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={onOpenUpgrade}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            <Sparkles size={13} className="fill-black" />
            <span>Upgrade</span>
          </button>

          <button
            onClick={() => router.navigate('/signup')}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF5E00] to-[#E11D48] text-white font-bold text-xs flex items-center justify-center ring-2 ring-orange-500/30 hover:ring-orange-400 transition-all"
            title="Profile / Sign In"
          >
            {userName ? userName[0].toUpperCase() : 'S'}
          </button>
        </div>
      </header>

      {/* Main Layout with Left Study Navigation Sidebar */}
      <div className="flex-1 flex overflow-visible">
        {/* Left Study Sidebar (As Highlighted in Red on Screenshot) */}
        <aside className="w-64 bg-[var(--color-bg)] border-r border-[var(--color-border)] p-4 hidden md:flex flex-col justify-between shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-bold text-[var(--color-text-faint)] uppercase tracking-wider px-3 mb-2">
                Study Modules
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => router.navigate(latestPack ? `/notes/${latestPack.id}` : '/notes/learn')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors group"
                >
                  <BookOpen size={16} className="text-[#FF5E00] group-hover:scale-110 transition-transform" />
                  <span>Learn Roadmap</span>
                </button>

                <button
                  onClick={() => router.navigate(latestPack ? `/notes/${latestPack.id}/editor` : '/notes/editor')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors group"
                >
                  <FileText size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
                  <span>Smart Notes</span>
                </button>

                <button
                  onClick={() => router.navigate(latestPack ? `/notes/${latestPack.id}/quiz` : '/notes/quiz')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors group"
                >
                  <Award size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Interactive Quiz</span>
                </button>

                <button
                  onClick={() => router.navigate(latestPack ? `/notes/${latestPack.id}/flashcards` : '/notes/flashcards')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors group"
                >
                  <Layers size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>3D Flashcards</span>
                </button>

                <button
                  onClick={() => router.navigate(latestPack ? `/notes/${latestPack.id}/podcast` : '/notes/podcast')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors group"
                >
                  <Headphones size={16} className="text-sky-400 group-hover:scale-110 transition-transform" />
                  <span>Audio Podcast</span>
                </button>

                <button
                  onClick={() => router.navigate(latestPack ? `/notes/${latestPack.id}/sources` : '/notes/sources')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors group"
                >
                  <FolderGit2 size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>Sources & References</span>
                </button>
              </div>
            </div>

            {/* Courses / Subjects */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] font-bold text-[var(--color-text-faint)] uppercase tracking-wider">
                  Active Subjects
                </span>
                <span className="text-[10px] text-[var(--color-text-faint)] font-mono">
                  {studyPacks.length}
                </span>
              </div>

              <div className="space-y-1">
                {studyPacks.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onStartNewLesson(p.topic);
                      router.navigate(`/notes/${p.id}`);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--color-surface-hover)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] truncate flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#FF5E00]" />
                    <span className="truncate">{p.topic}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Assistant Banner Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FF5E00]/10 via-[#FFAA00]/5 to-transparent border border-[#FF5E00]/20 space-y-2">
            <div className="flex items-center gap-2">
              <BlastMascot size="xs" state={mascotState} />
              <div className="text-xs font-bold text-[var(--color-text)]">Blast AI Copilot</div>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
              Living study assistant ready to explain concepts, generate quizzes, and quiz your recall.
            </p>
          </div>
        </aside>

        {/* Main Scrolling Dashboard Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 flex flex-col items-center overflow-visible">
          {/* Animated Mascot & Hero Heading */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FF5E00] via-[#FFAA00] to-[#E11D48] p-1 flex items-center justify-center shadow-2xl shadow-orange-500/25">
                <div className="w-full h-full rounded-3xl bg-[var(--color-surface)] flex items-center justify-center overflow-hidden">
                  <BlastMascot size="lg" state={mascotState} />
                </div>
              </div>
              <div className="absolute -top-2 -right-3 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md flex items-center gap-1 text-[11px]">
                <span>🔥</span>
                <span>⚡</span>
              </div>
            </div>

            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight">
              What do you want to learn?
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-text-muted)] mt-1.5 max-w-md">
              Enter any topic, lecture, or syllabus to instantly generate structured roadmaps, smart notes, quizzes, 3D flashcards, and podcasts.
            </p>
          </div>

          {/* Input Card */}
          <div className="w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="text-[11px] text-[var(--color-text-muted)] px-2 font-medium flex items-center justify-between">
              <span>Tip: Type any topic (e.g. &ldquo;How to learn Java&rdquo;) or press Record</span>
              <span className="text-[10px] text-[#FF5E00] font-mono font-bold">AWS Bedrock AI</span>
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <textarea
                rows={3}
                value={prompt}
                onChange={handleInputChange}
                disabled={isGenerating}
                placeholder="Paste lecture notes, enter a course topic, or drop a concept link..."
                className="w-full px-3 py-2 bg-transparent text-sm text-[var(--color-text)] placeholder:text-zinc-500 focus:outline-none resize-none disabled:opacity-50"
              />

              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRecordToggle}
                    disabled={isGenerating}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isRecording
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                        : 'bg-[var(--color-bg-alt)] hover:bg-[var(--color-surface-hover)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    <Mic size={13} className={isRecording ? 'text-rose-400' : 'text-amber-400'} />
                    <span>{isRecording ? 'Recording...' : 'Record'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => {
                      const text = window.prompt('Paste or enter notes to process:');
                      if (text && text.trim()) handleGenerate(text.trim());
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-bg-alt)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-semibold transition-all"
                  >
                    <Upload size={13} className="text-indigo-400" />
                    <span>Upload</span>
                  </button>

                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={() => {
                      const url = window.prompt('Enter YouTube video or lecture URL:');
                      if (url && url.trim()) handleGenerate(`YouTube Lecture: ${url.trim()}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-bg-alt)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-semibold transition-all"
                  >
                    <Youtube size={13} className="text-red-400" />
                    <span>YouTube</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--color-text-faint)] font-mono px-2 py-0.5 rounded bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
                    /
                  </span>
                  <button
                    type="submit"
                    disabled={!prompt.trim() || isGenerating}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF5E00] to-[#FFAA00] hover:from-[#FF4500] hover:to-[#FF8800] text-white flex items-center justify-center transition-all disabled:opacity-40 shadow-md shadow-orange-500/30"
                  >
                    {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <ArrowUp size={16} />}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Loading Indicator with Mascot */}
          {isGenerating && (
            <div className="w-full max-w-2xl mt-4 p-4 rounded-2xl bg-orange-950/20 border border-orange-500/30 flex items-center gap-3 animate-pulse">
              <BlastMascot size="sm" state="processing" />
              <div className="flex-1">
                <p className="text-xs font-bold text-orange-300">
                  Blast AI is synthesizing your study pack for &ldquo;{activeGeneratingTopic}&rdquo;...
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Generating custom roadmap milestones, notes with code & formulas, quizzes, 3D flashcards, and dual-voice podcast.
                </p>
              </div>
              <Loader2 size={16} className="text-orange-400 animate-spin" />
            </div>
          )}

          {/* Jump Back In Card */}
          {latestPack && !isGenerating && (
            <div className="w-full max-w-2xl mt-4">
              <button
                onClick={() => {
                  onStartNewLesson(latestPack.topic);
                  router.navigate(`/notes/${latestPack.id}`);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-orange-500/30 hover:border-orange-500/50 flex items-center justify-between text-xs transition-all group shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">🔥</span>
                  <span className="font-headline font-semibold text-[var(--color-text)]">
                    {latestPack.topic}
                  </span>
                  <span className="text-[var(--color-text-faint)]">•</span>
                  <span className="text-[var(--color-text-muted)]">
                    {latestPack.roadmap?.stages?.length || 3} Stages • {latestPack.quiz?.questions?.length || 5} Questions
                  </span>
                </div>
                <span className="text-[#FF5E00] group-hover:text-orange-400 font-bold flex items-center gap-1">
                  <span>Resume Learning</span>
                  <span>→</span>
                </span>
              </button>
            </div>
          )}

          {/* Course Modules Section */}
          <section className="w-full max-w-2xl mt-10 space-y-3 pb-16">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-base font-bold tracking-wide">
                Available Courses & Study Packs
              </h2>
              <span className="text-xs text-[var(--color-text-muted)]">
                {studyPacks.length} subjects ready
              </span>
            </div>

            <div className="space-y-2.5">
              {studyPacks.map((pack) => (
                <div
                  key={pack.id}
                  onClick={() => {
                    onStartNewLesson(pack.topic);
                    router.navigate(`/notes/${pack.id}`);
                  }}
                  className="p-4 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-orange-500/40 flex items-center justify-between cursor-pointer transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-[#FF5E00]">
                      <BookOpen size={18} />
                    </div>

                    <div>
                      <h3 className="font-headline font-bold text-xs text-[var(--color-text)] group-hover:text-[#FF5E00] transition-colors">
                        {pack.topic}
                      </h3>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 flex items-center gap-2">
                        <span>Roadmap ready</span>
                        <span>•</span>
                        <span>{pack.flashcards?.cards?.length || 8} Flashcards</span>
                        <span>•</span>
                        <span>{pack.quiz?.questions?.length || 5} Quiz Qs</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeletePack(pack.id, e)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete study pack"
                    >
                      <Trash2 size={13} />
                    </button>
                    <span className="text-[#FF5E00] text-xs font-bold px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                      Open →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Floating Ask Blast AI Button */}
      <button
        onClick={openBlastHandler || (() => router.navigate('/notes/learn'))}
        className="fixed right-6 bottom-8 py-2 px-4 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl text-xs font-bold text-[var(--color-text)] flex items-center gap-2.5 hover:bg-[var(--color-surface-hover)] hover:scale-105 active:scale-95 transition-all z-40"
      >
        <BlastMascot size="xs" state="speaking" />
        <span>Ask Blast AI</span>
      </button>
    </div>
  );
};
export default DashboardView;
