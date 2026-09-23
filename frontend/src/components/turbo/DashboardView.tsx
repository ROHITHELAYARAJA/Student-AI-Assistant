import React, { useState, useEffect } from 'react';
import { router } from '../../services/router.js';
import { BlastMascot, BlastMascotState } from './BlastMascot.js';
import { BlastMascotCard } from './BlastMascotCard.js';
import { ToolExecutionTrace } from './ToolExecutionTrace.js';
import { PluginsModal } from './PluginsModal.js';
import { getSavedStudyPacks, fetchStudyPack, saveStudyPack } from '../../services/turboApi.js';
import { TurboStudyPack } from '../../types/turbo.js';
import { validateClientStudyPrompt } from '../../utils/validation.js';
import {
  AiPromptInput,
  AiModelSelection,
  AiPromptSendStatus,
  DEFAULT_AI_MODELS
} from '../ui/ai-prompt-input.js';
import {
  Sparkles,
  Sun,
  Moon,
  Loader2,
  BookOpen,
  FileText,
  Award,
  Layers,
  Headphones,
  FolderGit2,
  Trash2,
  X,
  AlertTriangle,
  Zap,
  ArrowRight,
  Puzzle
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
  const [studyPacks, setStudyPacks] = useState<TurboStudyPack[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeGeneratingTopic, setActiveGeneratingTopic] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
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

  // Plugins & Connectors Modal State
  const [isPluginsModalOpen, setIsPluginsModalOpen] = useState(false);

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

  // Load saved packs created strictly by user requests (no static mock defaults)
  useEffect(() => {
    const existing = getSavedStudyPacks();
    setStudyPacks(existing);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleGenerate = async (topicToGenerate: string, selection?: AiModelSelection) => {
    const clean = topicToGenerate.trim();
    if (!clean) return;

    // Strict client-side validation: reject random keys, symbols, or gibberish immediately
    const clientVal = validateClientStudyPrompt(clean);
    if (!clientVal.valid) {
      setGenerationError(clientVal.reason || 'Input is not recognized as a valid study topic. Please enter a valid academic subject, syllabus concept, or question.');
      setIsGenerating(false);
      setPromptStatus('idle');
      setMascotState('error');
      return;
    }

    setGenerationError(null);
    setIsGenerating(true);
    setPromptStatus('loading');
    setActiveGeneratingTopic(clean);
    setMascotState('thinking');
    const startTime = Date.now();

    try {
      // Parse question count if prompt specifies e.g. "10 quiz"
      const countMatch = clean.match(/(?:^|\b)(\d+)\s*(?:quiz|questions?|mcqs?|cards?|problems?)(?:\b|$)/i);
      const requestedCount = clientVal.requestedQuestionCount || (countMatch ? parseInt(countMatch[1], 10) : undefined);

      const pack = await fetchStudyPack(clean, {
        questionCount: requestedCount,
        modelId: selection?.id || modelSelection.id
      });

      const elapsed = Date.now() - startTime;
      setLastLatencyMs(elapsed);
      setPromptStatus('success');
      setMascotState('success');
      setStudyPacks(getSavedStudyPacks());
      onStartNewLesson(clean);

      setTimeout(() => {
        setPromptStatus('idle');
        setPromptValue('');
        router.navigate(`/notes/${pack.id}`);
      }, 700);
    } catch (err: any) {
      console.error('Error generating study pack:', err);
      setGenerationError(err?.message || 'Could not generate study pack for this input.');
      setPromptStatus('idle');
      setMascotState('error');
    } finally {
      setIsGenerating(false);
      setActiveGeneratingTopic('');
    }
  };

  const handleDeletePack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = studyPacks.filter((p) => p.id !== id);
    setStudyPacks(updated);
    localStorage.setItem('turbo_study_packs_v1', JSON.stringify(updated));
  };

  const latestPack = studyPacks.length > 0 ? studyPacks[0] : null;
  const currentModelLabel = DEFAULT_AI_MODELS.find(m => m.id === modelSelection.id)?.label || 'Claude 3 Haiku';

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
          {/* Active Model Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-muted)]">
            <Zap size={13} className="text-[#FF5E00]" />
            <span className="font-medium text-[var(--color-text)]">{currentModelLabel}</span>
            {lastLatencyMs && (
              <span className="text-[10px] text-emerald-400 font-mono">
                ({(lastLatencyMs / 1000).toFixed(1)}s)
              </span>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Plugins & Connectors Manager */}
          <button
            onClick={() => setIsPluginsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-[#FF5E00] text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            title="Manage Connected Plugins & App Tools"
          >
            <Puzzle size={14} />
            <span className="hidden sm:inline">Plugins</span>
          </button>

          {/* Upgrade Button */}
          <button
            onClick={onOpenUpgrade}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-headline font-bold text-xs shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles size={13} className="fill-black" />
            <span>Upgrade</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-visible">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-[var(--color-border)] bg-[var(--color-bg)] hidden lg:flex flex-col justify-between p-4 shrink-0">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] font-bold text-[var(--color-text-faint)] uppercase tracking-wider">
                  Turbo Study Modes
                </span>
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
                  <span>Google & Web Sources</span>
                </button>
              </div>
            </div>

            {/* Courses / Subjects Created By User */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] font-bold text-[var(--color-text-faint)] uppercase tracking-wider">
                  Generated Subjects
                </span>
                <span className="text-[10px] text-[var(--color-text-faint)] font-mono">
                  {studyPacks.length}
                </span>
              </div>

              {studyPacks.length === 0 ? (
                <div className="px-3 py-3 rounded-xl border border-dashed border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] text-center">
                  No packs created yet. Type any subject above to generate!
                </div>
              ) : (
                <div className="space-y-1">
                  {studyPacks.slice(0, 5).map((p) => (
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
              )}
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
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-10 flex flex-col items-center overflow-visible">
          {/* Animated Mascot Card (GSAP + SVG as in Image 1) */}
          <div className="mb-6 flex flex-col items-center text-center">
            <BlastMascotCard
              state={mascotState}
              className="mb-4"
              onClick={() => {
                setMascotState('excited');
                setTimeout(() => setMascotState('idle'), 2000);
              }}
            />

            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight">
              What do you want to learn?
            </h1>
            <p className="text-xs md:text-sm text-[var(--color-text-muted)] mt-1.5 max-w-lg leading-relaxed">
              Enter any syllabus concept, question, or exam topic to dynamically generate structured roadmaps, smart notes, quizzes, flashcards, and podcasts via AWS Bedrock models.
            </p>
          </div>

          {/* Validation / Edge-case Error Alert */}
          {generationError && (
            <div className="w-full max-w-2xl mb-4 p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/40 flex items-start gap-3 text-xs text-rose-300">
              <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold">Input Error:</div>
                <div className="mt-0.5">{generationError}</div>
              </div>
              <button onClick={() => setGenerationError(null)} className="text-rose-400 hover:text-white p-0.5">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Premium AiPromptInput Composer Component with 5 Models */}
          <div className="w-full max-w-2xl">
            <AiPromptInput
              value={promptValue}
              onChange={setPromptValue}
              onSubmit={(text, selection) => handleGenerate(text, selection)}
              modelSelection={modelSelection}
              onModelSelectionChange={setModelSelection}
              status={promptStatus}
              disabled={isGenerating}
              onUploadFile={() => {
                const text = window.prompt('Paste notes or syllabus text to analyze:');
                if (text && text.trim()) handleGenerate(text.trim());
              }}
              onSkills={() => setIsPluginsModalOpen(true)}
              onConnectors={() => setIsPluginsModalOpen(true)}
            />
          </div>

          {/* Tools & Plugins Execution Trace Component (matching Image 3) */}
          <div className="w-full max-w-2xl mt-4">
            <ToolExecutionTrace defaultExpanded={true} />
          </div>

          {/* Quick Prompt Starters (Active Only - No Default Hardcoded Packs) */}
          <div className="w-full max-w-2xl mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] text-[var(--color-text-faint)] font-medium">Try asking:</span>
            {[
              '10 quiz questions on Operating Systems Deadlocks',
              'Machine Learning Gradient Descent & Backpropagation',
              'Data Structures: Balanced AVL Trees',
              'Python Concurrency & Asyncio Event Loops'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setPromptValue(suggestion);
                  handleGenerate(suggestion);
                }}
                disabled={isGenerating}
                className="px-2.5 py-1 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-orange-500/40 text-[11px] text-[var(--color-text-muted)] hover:text-white transition-all flex items-center gap-1 group"
              >
                <span>{suggestion}</span>
                <ArrowRight size={10} className="text-[#FF5E00] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Loading Indicator with Mascot */}
          {isGenerating && (
            <div className="w-full max-w-2xl mt-6 p-4 rounded-2xl bg-orange-950/20 border border-orange-500/30 flex items-center gap-3 animate-pulse">
              <BlastMascot size="sm" state="processing" />
              <div className="flex-1">
                <p className="text-xs font-bold text-orange-300">
                  Blast AI is synthesizing your study pack for &ldquo;{activeGeneratingTopic}&rdquo;...
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Invoking AWS Bedrock ({currentModelLabel}) to construct your custom roadmap, editable notes, diagnostic quiz, 3D cards, and podcast.
                </p>
              </div>
              <Loader2 size={16} className="text-orange-400 animate-spin" />
            </div>
          )}

          {/* Jump Back In Card (if user has created packs) */}
          {latestPack && !isGenerating && (
            <div className="w-full max-w-2xl mt-6">
              <button
                onClick={() => {
                  onStartNewLesson(latestPack.topic);
                  router.navigate(`/notes/${latestPack.id}`);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-orange-500/30 hover:border-orange-500/50 flex items-center justify-between text-xs transition-all group shadow-md"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="text-base">🔥</span>
                  <span className="font-headline font-semibold text-[var(--color-text)] truncate">
                    {latestPack.topic}
                  </span>
                  <span className="text-[var(--color-text-faint)]">•</span>
                  <span className="text-[var(--color-text-muted)] shrink-0">
                    {latestPack.quiz?.questions?.length || 5} Quiz Qs • {latestPack.flashcards?.cards?.length || 6} Cards
                  </span>
                </div>
                <span className="text-[#FF5E00] group-hover:text-orange-400 font-bold flex items-center gap-1 shrink-0 ml-2">
                  <span>Resume Learning</span>
                  <span>→</span>
                </span>
              </button>
            </div>
          )}

          {/* User's Created Study Packs Section */}
          {studyPacks.length > 0 && (
            <section className="w-full max-w-2xl mt-10 space-y-3 pb-16">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-base font-bold tracking-wide">
                  Your Dynamic Study Packs
                </h2>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {studyPacks.length} subjects created
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
                    <div className="flex items-center gap-3.5 truncate">
                      <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-[#FF5E00] shrink-0">
                        <BookOpen size={18} />
                      </div>

                      <div className="truncate">
                        <h3 className="font-headline font-bold text-xs text-[var(--color-text)] group-hover:text-[#FF5E00] transition-colors truncate">
                          {pack.topic}
                        </h3>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 flex items-center gap-2">
                          <span>Roadmap ready</span>
                          <span>•</span>
                          <span>{pack.quiz?.questions?.length || 5} Quiz Qs</span>
                          <span>•</span>
                          <span>{pack.flashcards?.cards?.length || 6} Cards</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
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
          )}
        </main>
      </div>

      {/* Plugins & Connectors Manager Modal */}
      <PluginsModal
        isOpen={isPluginsModalOpen}
        onClose={() => setIsPluginsModalOpen(false)}
      />

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
