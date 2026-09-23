import React, { useState, useEffect, useRef } from 'react';
import { router } from '../../services/router.js';
import { BlastMascot, BlastMascotState } from './BlastMascot.js';
import { GlowingFireLogo } from './GlowingFireLogo.js';
import { RichMarkdown } from './RichMarkdown.js';
import {
  getSavedStudyPacks,
  deleteStudyPack,
  fetchTurboChat,
  TurboChatResponse
} from '../../services/turboApi.js';
import { TurboStudyPack } from '../../types/turbo.js';
import {
  AiPromptInput,
  AiModelSelection,
  AiPromptSendStatus,
  DEFAULT_AI_MODELS
} from '../ui/ai-prompt-input.js';
import { VoicePoweredOrb } from '../ui/voice-powered-orb.js';
import { Button } from '../ui/button.js';
import {
  Mic,
  MicOff,
  Sun,
  Moon,
  Loader2,
  BookOpen,
  FileText,
  Award,
  Layers,
  Headphones,
  Trash2,
  X,
  AlertTriangle,
  Zap,
  ArrowRight,
  Sparkles,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'blast';
  text: string;
  timestamp: string;
  modelUsed?: string;
  latencyMs?: number;
  studyPack?: TurboStudyPack | null;
  isStudyTopic?: boolean;
}

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
  const [studyPacks, setStudyPacks] = useState<TurboStudyPack[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [mascotState, setMascotState] = useState<BlastMascotState>('greeting');
  const [promptStatus, setPromptStatus] = useState<AiPromptSendStatus>('idle');
  const [promptValue, setPromptValue] = useState('');
  const [modelSelection, setModelSelection] = useState<AiModelSelection>({
    id: DEFAULT_AI_MODELS[0].id,
    effort: 'high',
    context: '200K',
    fast: true,
    thinking: true
  });

  // Voice Interaction Modal with VoicePoweredOrb
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isOrbRecording, setIsOrbRecording] = useState(false);
  const [orbVoiceDetected, setOrbVoiceDetected] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('blast_theme') as 'dark' | 'light') || 'dark';
  });

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Switch from greeting to idle after entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setMascotState('idle');
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('blast_theme', theme);
  }, [theme]);

  // Load saved packs created strictly by user requests (filtered, no "hii" or broken packs)
  useEffect(() => {
    refreshPacks();
  }, []);

  useEffect(() => {
    if (chatMessages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isGenerating]);

  const refreshPacks = () => {
    const existing = getSavedStudyPacks();
    setStudyPacks(existing);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleDeletePack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteStudyPack(id);
    refreshPacks();
  };

  const handleClearChat = () => {
    setChatMessages([]);
    setGenerationError(null);
    setMascotState('idle');
  };

  const handleSendMessage = async (userPrompt: string, selection?: AiModelSelection) => {
    const clean = userPrompt.trim();
    if (!clean || isGenerating) return;

    setGenerationError(null);
    setIsGenerating(true);
    setPromptStatus('loading');
    setMascotState('thinking');

    const activeModelId = selection?.id || modelSelection.id;
    const modelMeta = DEFAULT_AI_MODELS.find((m) => m.id === activeModelId);
    const modelLabel = modelMeta?.label || 'Claude 3 Haiku';

    // Append user message immediately
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: clean,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setPromptValue('');

    const startTime = Date.now();

    try {
      const response: TurboChatResponse = await fetchTurboChat(
        clean,
        activeModelId,
        chatMessages.map((m) => ({ sender: m.sender, text: m.text }))
      );

      const elapsed = Date.now() - startTime;
      setPromptStatus('success');
      setMascotState('success');

      // Append Blast's AI reply
      const blastMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'blast',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: modelLabel,
        latencyMs: elapsed,
        studyPack: response.studyPack,
        isStudyTopic: response.isStudyTopic
      };

      setChatMessages((prev) => [...prev, blastMsg]);
      refreshPacks();

      if (response.isStudyTopic && response.topic) {
        onStartNewLesson(response.topic);
      }

      setTimeout(() => {
        setPromptStatus('idle');
        setMascotState('idle');
      }, 1200);
    } catch (err: any) {
      console.error('Error in chat response:', err);
      const errMsg = err?.message || 'Could not process query. Please check your prompt.';
      setGenerationError(errMsg);
      setPromptStatus('idle');
      setMascotState('error');

      const errorReply: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'blast',
        text: `⚠️ **Unable to complete request**: ${errMsg}\n\nPlease try asking a clear study topic or question (e.g., *"10 quiz questions on Operating Systems"*, *"Explain Balanced Binary Search Trees"*, or *"How does Dijkstra's Algorithm work?"*).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: modelLabel,
        isStudyTopic: false
      };
      setChatMessages((prev) => [...prev, errorReply]);

      setTimeout(() => {
        setMascotState('idle');
      }, 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const activeModelMeta = DEFAULT_AI_MODELS.find((m) => m.id === modelSelection.id) || DEFAULT_AI_MODELS[0];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Navbar */}
      <header className="border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg)]/90 backdrop-blur-md z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            onClick={() => router.navigate('/dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#161622] border border-orange-500/30 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <GlowingFireLogo size={28} showGlow={true} />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-purple-600 bg-clip-text text-transparent">
              blast ai
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 ml-4 px-2.5 py-1 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            AWS Bedrock Engine
          </div>
        </div>

        <div className="flex items-center gap-3">
          {chatMessages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-card)] text-xs font-semibold text-[var(--color-text-secondary)] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Topic
            </button>
          )}

          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-card)] text-xs font-semibold text-[var(--color-text-secondary)] transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-orange-500" />
            Voice Orb
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {onOpenUpgrade && (
            <button
              onClick={onOpenUpgrade}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:opacity-95 transition-opacity"
            >
              Pro
            </button>
          )}

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
            {userName.charAt(0)}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {chatMessages.length === 0 ? (
          /* Initial Hero Landing View */
          <div className="flex-1 flex flex-col items-center justify-center my-auto py-8">
            <div className="relative mb-5 flex flex-col items-center">
              <GlowingFireLogo size="xl" showGlow={true} />
              <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs text-orange-500 font-bold shadow-sm">
                <span>🔥</span>
                <span>Blast Realtime Neural Engine</span>
              </div>
            </div>

            <div className="text-center max-w-xl mb-7">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-text)] mb-3">
                What do you want to learn?
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
                Ask any question or study topic. Blast will reply in chat, explain the concept, and build your tailored curriculum roadmap, quiz, notes, flashcards, and podcast.
              </p>
            </div>

            {/* Error Notification */}
            {generationError && (
              <div className="w-full max-w-2xl mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-sm text-red-500 dark:text-red-400">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold mb-0.5">Study Topic Validation</div>
                  <div className="text-xs leading-relaxed opacity-90">{generationError}</div>
                </div>
                <button
                  onClick={() => setGenerationError(null)}
                  className="p-1 hover:bg-red-500/20 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Hero Prompt Input Composer */}
            <div className="w-full max-w-2xl mb-6">
              <AiPromptInput
                value={promptValue}
                onChange={setPromptValue}
                onSubmit={(val, sel) => handleSendMessage(val, sel)}
                models={DEFAULT_AI_MODELS}
                modelSelection={modelSelection}
                onModelSelectionChange={setModelSelection}
                status={promptStatus}
                placeholderInterval={3200}
                placeholders={[
                  "Ask Blast anything (e.g. '10 quiz questions on Operating Systems Deadlocks')...",
                  "Explain Machine Learning Gradient Descent...",
                  "How does balanced AVL Tree rotation work?",
                  "Generate study notes on Python Concurrency...",
                  "Write 5 quiz questions on Quantum Computing..."
                ]}
                showToolbar={true}
                showModelSelector={true}
                showActions={true}
                onVoiceChange={(active) => {
                  if (active) setIsVoiceModalOpen(true);
                }}
              />
            </div>

            {/* Prompt Starter Suggestions */}
            <div className="w-full max-w-2xl flex flex-wrap items-center justify-center gap-2 mb-10 text-xs">
              <span className="text-[var(--color-text-secondary)] font-medium mr-1">Try asking:</span>
              {[
                "10 quiz questions on Operating Systems Deadlocks",
                "Machine Learning Gradient Descent & Backpropagation",
                "Data Structures: Balanced AVL Trees",
                "Python Concurrency & Asyncio Event Loops"
              ].map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleSendMessage(topic)}
                  className="px-3 py-1.5 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] hover:border-orange-500/50 hover:bg-orange-500/5 text-[var(--color-text)] font-medium transition-all"
                >
                  {topic}
                </button>
              ))}
            </div>

            {/* Saved Dynamic Study Packs */}
            {studyPacks.length > 0 && (
              <div className="w-full max-w-2xl pt-4 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-[var(--color-text)]">
                    Your Dynamic Study Packs
                  </h2>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {studyPacks.length} subject{studyPacks.length === 1 ? '' : 's'} created
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {studyPacks.map((pack) => (
                    <div
                      key={pack.id}
                      onClick={() => router.navigate(`/notes/${pack.id}`)}
                      className="p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] hover:border-orange-500/40 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-[var(--color-text)] truncate group-hover:text-orange-500 transition-colors">
                            {pack.topic}
                          </div>
                          <div className="text-[10px] text-[var(--color-text-secondary)] truncate">
                            {pack.quiz?.questions?.length || 5} Quiz Qs • {pack.flashcards?.cards?.length || 6} Cards
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => handleDeletePack(pack.id, e)}
                          title="Delete pack"
                          className="p-1 rounded-md text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--color-text-secondary)] group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Active Chat Workspace */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto space-y-5 pb-6">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'blast' && (
                    <div className="w-9 h-9 rounded-2xl bg-[#161622] border border-orange-500/30 p-0.5 shadow-md shadow-orange-500/20 shrink-0 flex items-center justify-center overflow-hidden">
                      <GlowingFireLogo size={26} showGlow={true} />
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none ml-10 font-medium'
                        : 'bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] rounded-tl-none mr-2 sm:mr-10'
                    }`}
                  >
                    {/* Message Header info for AI */}
                    {msg.sender === 'blast' && (
                      <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[var(--color-border)] text-[11px] text-[var(--color-text-secondary)]">
                        <div className="flex items-center gap-1.5 font-semibold text-orange-500">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Blast AI</span>
                          {msg.modelUsed && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 font-normal text-[var(--color-text-secondary)]">
                              {msg.modelUsed}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {msg.latencyMs && (
                            <span className="text-[10px] opacity-75">
                              {(msg.latencyMs / 1000).toFixed(1)}s
                            </span>
                          )}
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>
                    )}

                    {/* Formatted Message Body */}
                    {msg.sender === 'blast' ? (
                      <RichMarkdown content={msg.text} />
                    ) : (
                      <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {msg.text}
                      </div>
                    )}

                    {/* Structured Learning Suite for Study Topics */}
                    {msg.studyPack && (
                      <div className="mt-5 pt-4 border-t border-[var(--color-border)]">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Generated Learning Path & Study Materials
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                          {/* 1. Roadmap Card */}
                          <div
                            onClick={() => router.navigate(`/notes/${msg.studyPack!.id}`)}
                            className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-orange-500/50 cursor-pointer transition-all hover:shadow-sm group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)]">
                                <BookOpen className="w-4 h-4 text-orange-500" />
                                <span>Mastery Roadmap</span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 font-semibold">
                                {msg.studyPack.roadmap.stages.length} Stages
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                              {msg.studyPack.roadmap.stages[0]?.description || 'Step-by-step curriculum milestones'}
                            </p>
                            <div className="text-[11px] text-orange-500 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Start Learning Path</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>

                          {/* 2. Quiz Card */}
                          <div
                            onClick={() => router.navigate(`/notes/${msg.studyPack!.id}/quiz`)}
                            className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-purple-500/50 cursor-pointer transition-all hover:shadow-sm group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)]">
                                <Award className="w-4 h-4 text-purple-500" />
                                <span>Assessment Quiz</span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 font-semibold">
                                {msg.studyPack.quiz.questions.length} Questions
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                              {msg.studyPack.quiz.title || 'Dynamic MCQ challenge testing core invariants'}
                            </p>
                            <div className="text-[11px] text-purple-500 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Take Quiz Challenge</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>

                          {/* 3. Notes Card */}
                          <div
                            onClick={() => router.navigate(`/notes/${msg.studyPack!.id}/editor`)}
                            className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-blue-500/50 cursor-pointer transition-all hover:shadow-sm group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)]">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <span>High-Yield Notes</span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-semibold">
                                Studio Ready
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                              {msg.studyPack.notes.summary || 'Comprehensive theory, key takeaways & formulas'}
                            </p>
                            <div className="text-[11px] text-blue-500 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Open Notes in Studio</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>

                          {/* 4. Flashcards Card */}
                          <div
                            onClick={() => router.navigate(`/notes/${msg.studyPack!.id}/flashcards`)}
                            className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-amber-500/50 cursor-pointer transition-all hover:shadow-sm group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)]">
                                <Layers className="w-4 h-4 text-amber-500" />
                                <span>3D Flashcards</span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold">
                                {msg.studyPack.flashcards.cards.length} Cards
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                              Active recall deck formatted for spaced repetition and rapid retention
                            </p>
                            <div className="text-[11px] text-amber-500 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Practice Flashcards</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>

                          {/* 5. Podcast Card */}
                          <div
                            onClick={() => router.navigate(`/notes/${msg.studyPack!.id}/podcast`)}
                            className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-rose-500/50 cursor-pointer transition-all hover:shadow-sm group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)]">
                                <Headphones className="w-4 h-4 text-rose-500" />
                                <span>Audio Podcast</span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 font-semibold">
                                {msg.studyPack.podcast.audioDurationEstimate || '5-7 mins'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                              2-speaker interactive dialogue between Blast (host) and Alex (student)
                            </p>
                            <div className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Listen to Lecture</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>

                          {/* 6. Sources Card */}
                          <div
                            onClick={() => router.navigate(`/notes/${msg.studyPack!.id}/source`)}
                            className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-emerald-500/50 cursor-pointer transition-all hover:shadow-sm group"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text)]">
                                <ExternalLink className="w-4 h-4 text-emerald-500" />
                                <span>Google & Web Sources</span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold">
                                {msg.studyPack.sources?.length || 4} Sources
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                              Google Search, Google Scholar, Wikipedia reference, and YouTube video tutorials
                            </p>
                            <div className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Explore Sources</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Generating / Loading Indicator */}
              {isGenerating && (
                <div className="flex gap-3 sm:gap-4 justify-start items-center">
                  <div className="w-9 h-9 rounded-2xl bg-[#161622] border border-orange-500/30 p-0.5 shadow-md shadow-orange-500/20 shrink-0 flex items-center justify-center overflow-hidden">
                    <GlowingFireLogo size={26} showGlow={true} />
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] flex items-center gap-2.5 shadow-sm">
                    <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                    <span>
                      Blast is synthesizing response with <strong>{activeModelMeta.label}</strong>...
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Pinned Bottom Chat Input */}
            <div className="sticky bottom-0 pt-2 pb-3 bg-[var(--color-bg)]/95 backdrop-blur-md">
              <AiPromptInput
                value={promptValue}
                onChange={setPromptValue}
                onSubmit={(val, sel) => handleSendMessage(val, sel)}
                models={DEFAULT_AI_MODELS}
                modelSelection={modelSelection}
                onModelSelectionChange={setModelSelection}
                status={promptStatus}
                placeholderInterval={3200}
                placeholders={[
                  "Ask a follow up question or enter a new study topic...",
                  "Request a 10-question quiz or practice test...",
                  "Ask for code examples or deeper formula breakdowns..."
                ]}
                showToolbar={true}
                showModelSelector={true}
                showActions={true}
                onVoiceChange={(active) => {
                  if (active) setIsVoiceModalOpen(true);
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Voice Mode Modal with WebGL VoicePoweredOrb */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[var(--color-card)] border border-[var(--color-border)] p-6 sm:p-8 flex flex-col items-center shadow-2xl">
            <button
              onClick={() => {
                setIsVoiceModalOpen(false);
                setIsOrbRecording(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[var(--color-text)] flex items-center justify-center gap-2">
                <GlowingFireLogo size={22} showGlow={true} />
                Blast Voice Mode
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Powered by WebGL GLSL shader & real-time audio analysis
              </p>
            </div>

            {/* Shader Orb Display */}
            <div className="w-64 h-64 sm:w-72 sm:h-72 relative mb-6 rounded-2xl overflow-hidden shadow-inner bg-black/10">
              <VoicePoweredOrb
                enableVoiceControl={isOrbRecording}
                onVoiceDetected={setOrbVoiceDetected}
                className="w-full h-full"
                hue={28}
                voiceSensitivity={1.8}
              />
            </div>

            {/* Recording Controls */}
            <div className="flex flex-col items-center gap-3 w-full">
              <Button
                onClick={() => setIsOrbRecording(!isOrbRecording)}
                variant={isOrbRecording ? "destructive" : "default"}
                size="lg"
                className="w-full max-w-xs font-semibold shadow-lg"
              >
                {isOrbRecording ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Voice Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Voice Listening
                  </>
                )}
              </Button>

              <p className="text-[11px] text-[var(--color-text-secondary)] text-center max-w-xs leading-relaxed">
                {isOrbRecording
                  ? orbVoiceDetected
                    ? "Voice detected! The orb reacts dynamically to your speech."
                    : "Listening... speak into your microphone."
                  : "Click Start to enable your microphone and converse with Blast."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
