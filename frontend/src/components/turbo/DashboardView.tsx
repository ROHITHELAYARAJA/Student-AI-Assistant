import React, { useState, useEffect } from 'react';
import { router } from '../../services/router.js';
import { TurboMascot } from './TurboMascot.js';
import { getSavedStudyPacks, fetchStudyPack } from '../../services/turboApi.js';
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
  HelpCircle,
  Layers,
  Radio,
  Clock,
  Trash2
} from 'lucide-react';

interface DashboardViewProps {
  userName?: string;
  onStartNewLesson: (prompt: string) => void;
  onOpenUpgrade?: () => void;
  onOpenEmma?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName = 'Sarthak',
  onStartNewLesson,
  onOpenUpgrade,
  onOpenEmma
}) => {
  const [prompt, setPrompt] = useState('');
  const [studyPacks, setStudyPacks] = useState<TurboStudyPack[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeGeneratingTopic, setActiveGeneratingTopic] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('turbo_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('turbo_theme', theme);
  }, [theme]);

  useEffect(() => {
    setStudyPacks(getSavedStudyPacks());
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleGenerate = async (topicToGenerate: string) => {
    const clean = topicToGenerate.trim();
    if (!clean) return;

    try {
      setIsGenerating(true);
      setActiveGeneratingTopic(clean);
      const pack = await fetchStudyPack(clean);
      setStudyPacks(getSavedStudyPacks());
      onStartNewLesson(clean);
      router.navigate(`/notes/${pack.id}`);
    } catch (err) {
      console.error('Error generating study pack:', err);
      // Fallback: still navigate
      onStartNewLesson(clean);
      router.navigate('/notes/learn');
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
    }
  };

  const handleDeletePack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = studyPacks.filter((p) => p.id !== id);
    setStudyPacks(updated);
    localStorage.setItem('turbo_study_packs_v1', JSON.stringify(updated));
  };

  const latestPack = studyPacks.length > 0 ? studyPacks[0] : null;

  const exampleTopics = [
    'How to learn Java from scratch',
    'Machine Learning & Neural Networks',
    'System Design & Microservices Architecture',
    'Operating Systems & Concurrency',
    'Data Structures & Graph Algorithms'
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col font-body select-none transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="h-16 px-6 md:px-8 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md sticky top-0 z-30">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => router.navigate('/dashboard')}
        >
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
            </svg>
          </div>
          <span className="font-headline font-bold text-lg tracking-tight">turbo ai</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle (Dark / Light) */}
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
            className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-purple-500/30 hover:ring-purple-400 transition-all"
            title="Profile / Sign In"
          >
            {userName ? userName[0].toUpperCase() : 'S'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 flex flex-col items-center">
        {/* Mascot & Heading */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-800 p-1 flex items-center justify-center shadow-xl shadow-purple-600/25">
              <TurboMascot size="lg" expression={isGenerating ? 'thinking' : 'reading'} />
            </div>
            <div className="absolute -top-2 -right-4 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md flex items-center gap-1 text-[11px]">
              <span>⚡</span>
              <span>📚</span>
            </div>
          </div>

          <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight">
            What do you want to learn?
          </h1>
          <p className="text-xs md:text-sm text-[var(--color-text-muted)] mt-1.5 max-w-md">
            Enter any topic or lecture to instantly generate structured roadmaps, notes, interactive quizzes, flashcards, and audio podcasts.
          </p>
        </div>

        {/* Input Card */}
        <div className="w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4 shadow-2xl space-y-3">
          <div className="text-[11px] text-[var(--color-text-muted)] px-2 font-medium flex items-center justify-between">
            <span>Tip: Type any topic (e.g. &ldquo;How to learn Java&rdquo;) or press Record</span>
            <span className="text-[10px] text-purple-400 font-mono">Bedrock AI Ready</span>
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
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
                  className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-all disabled:opacity-40 shadow-md shadow-purple-600/30"
                >
                  {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <ArrowUp size={16} />}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Loading Overlay / Progress Indicator */}
        {isGenerating && (
          <div className="w-full max-w-2xl mt-4 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center gap-3 animate-pulse">
            <TurboMascot size="sm" expression="thinking" />
            <div className="flex-1">
              <p className="text-xs font-bold text-purple-300">
                Turbo AI is generating your study pack for &ldquo;{activeGeneratingTopic}&rdquo;...
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Synthesizing roadmap milestones, notes with LaTeX & code, 3D flashcards, quiz questions, and podcast dialogue.
              </p>
            </div>
            <Loader2 size={16} className="text-purple-400 animate-spin" />
          </div>
        )}

        {/* Jump Back In Card (Only if user has a real saved pack) */}
        {latestPack && !isGenerating && (
          <div className="w-full max-w-2xl mt-4">
            <button
              onClick={() => {
                onStartNewLesson(latestPack.topic);
                router.navigate(`/notes/${latestPack.id}`);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-purple-500/30 hover:border-purple-500/50 flex items-center justify-between text-xs transition-all group shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🚀</span>
                <span className="font-headline font-semibold text-[var(--color-text)]">
                  {latestPack.topic}
                </span>
                <span className="text-[var(--color-text-faint)]">•</span>
                <span className="text-[var(--color-text-muted)]">
                  {latestPack.roadmap?.stages?.length || 3} Stages • {latestPack.quiz?.questions?.length || 5} Questions
                </span>
              </div>
              <span className="text-purple-400 group-hover:text-purple-300 font-bold flex items-center gap-1">
                <span>Jump back in</span>
                <span>→</span>
              </span>
            </button>
          </div>
        )}

        {/* Lessons List or Clean Empty State */}
        <section className="w-full max-w-2xl mt-10 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-base font-bold tracking-wide">
              {studyPacks.length > 0 ? 'Your Lessons & Study Packs' : 'Explore & Get Started'}
            </h2>
            {studyPacks.length > 0 && (
              <span className="text-xs text-[var(--color-text-muted)]">
                {studyPacks.length} {studyPacks.length === 1 ? 'lesson' : 'lessons'}
              </span>
            )}
          </div>

          {studyPacks.length === 0 ? (
            /* Clean Authentic Empty State */
            <div className="p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col items-center text-center space-y-4 shadow-sm">
              <TurboMascot size="lg" expression="reading" />
              <div>
                <h3 className="font-headline font-bold text-sm text-[var(--color-text)]">
                  Nothing here yet
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm">
                  Your generated lessons, roadmaps, and folders will show up here as you create them. Try one of these popular study paths:
                </p>
              </div>

              {/* Example Topic Pills */}
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {exampleTopics.map((topicItem) => (
                  <button
                    key={topicItem}
                    disabled={isGenerating}
                    onClick={() => handleGenerate(topicItem)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-bg-alt)] hover:bg-purple-900/20 border border-[var(--color-border)] hover:border-purple-500/40 text-[var(--color-text-muted)] hover:text-purple-300 transition-all flex items-center gap-1.5"
                  >
                    <span>✨</span>
                    <span>{topicItem}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Real User Saved Lessons */
            <div className="space-y-2">
              {studyPacks.map((pack) => (
                <div
                  key={pack.id}
                  onClick={() => {
                    onStartNewLesson(pack.topic);
                    router.navigate(`/notes/${pack.id}`);
                  }}
                  className="p-4 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-purple-500/40 flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <BookOpen size={18} />
                    </div>

                    <div>
                      <h3 className="font-headline font-bold text-xs text-[var(--color-text)] group-hover:text-purple-400 transition-colors">
                        {pack.topic}
                      </h3>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 flex items-center gap-2">
                        <span>Created {new Date(pack.createdAt).toLocaleDateString()}</span>
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
                    <span className="text-purple-400 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                      Open →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Ask Emma AI Button */}
      <button
        onClick={onOpenEmma || (() => router.navigate('/notes/learn'))}
        className="fixed right-6 bottom-8 py-2 px-4 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl text-xs font-bold text-[var(--color-text)] flex items-center gap-2.5 hover:bg-[var(--color-surface-hover)] hover:scale-105 active:scale-95 transition-all z-40"
      >
        <TurboMascot size="xs" expression="teaching" />
        <span>Ask Emma AI</span>
      </button>
    </div>
  );
};
export default DashboardView;
