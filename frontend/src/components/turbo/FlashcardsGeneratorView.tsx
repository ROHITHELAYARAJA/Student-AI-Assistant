import React, { useState, useEffect } from 'react';
import { router } from '../../services/router.js';
import { BlastMascot, MascotState } from './BlastMascot.js';
import { GlowingFireLogo } from './GlowingFireLogo.js';
import { getStudyPack, fetchStudyPack } from '../../services/turboApi.js';
import { TurboStudyPack, TurboFlashcard } from '../../types/turbo.js';
import {
  Sparkles,
  BookOpen,
  FileText,
  Award,
  Layers,
  Headphones,
  FolderGit2,
  RotateCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Brain,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';

interface FlashcardsGeneratorViewProps {
  noteId?: string;
  topicTitle?: string;
  onOpenUpgrade?: () => void;
  onOpenEmma?: () => void;
  onOpenBlast?: () => void;
}

export const FlashcardsGeneratorView: React.FC<FlashcardsGeneratorViewProps> = ({
  noteId = 'current',
  topicTitle = 'How to learn Java',
  onOpenUpgrade,
  onOpenEmma,
  onOpenBlast
}) => {
  const openBlastHandler = onOpenBlast || onOpenEmma;
  const [studyPack, setStudyPack] = useState<TurboStudyPack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [memoryScore, setMemoryScore] = useState(85);

  const [mascotState, setMascotState] = useState<MascotState>('idle');

  useEffect(() => {
    const existing = getStudyPack(noteId) || getStudyPack(topicTitle);
    if (existing) {
      setStudyPack(existing);
    } else {
      setIsLoading(true);
      fetchStudyPack(topicTitle)
        .then((pack) => setStudyPack(pack))
        .catch((err) => console.error('Failed to load study pack:', err))
        .finally(() => setIsLoading(false));
    }
  }, [noteId, topicTitle]);

  const activeTitle = studyPack?.topic || topicTitle;

  const cards: TurboFlashcard[] = studyPack?.flashcards?.cards || [
    {
      id: 'c-1',
      front: `What is the core execution model in ${activeTitle}?`,
      back: `Code is compiled into platform-neutral bytecode and executed via runtime compilation (JIT/AOT) with automatic memory management.`,
      category: 'Runtime Architecture',
      masteryLevel: 'learning'
    },
    {
      id: 'c-2',
      front: `What is the difference between Stack and Heap memory for ${activeTitle}?`,
      back: `Stack stores primitive variables and method call stack frames (fast, thread-isolated). Heap stores dynamic objects and reference data (globally shared, managed by Garbage Collection).`,
      category: 'Memory Management',
      masteryLevel: 'mastered'
    },
    {
      id: 'c-3',
      front: `How do you avoid concurrency race conditions in ${activeTitle}?`,
      back: `By utilizing thread-safe primitives, atomic variables (CAS operations), synchronized locks, and immutable data structures.`,
      category: 'Concurrency',
      masteryLevel: 'new'
    },
    {
      id: 'c-4',
      front: `What is the optimal collection type for fast key lookups in ${activeTitle}?`,
      back: `Hash Table / HashMap with hash code bucketing, which gives amortized O(1) lookup, insert, and deletion complexity.`,
      category: 'Data Structures',
      masteryLevel: 'learning'
    }
  ];

  const currentCard = cards[currentIdx] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleRateCard = (rating: 'hard' | 'good' | 'easy') => {
    if (rating === 'easy') {
      setMemoryScore((prev) => Math.min(100, prev + 2));
      setMascotState('success');
      setTimeout(() => setMascotState('idle'), 2400);
    } else if (rating === 'hard') {
      setMemoryScore((prev) => Math.max(40, prev - 3));
      setMascotState('error');
      setTimeout(() => setMascotState('idle'), 2000);
    } else {
      setMascotState('happy');
      setTimeout(() => setMascotState('idle'), 1800);
    }
    handleNext();
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col font-body select-none">
      {/* Top Header */}
      <header className="h-14 px-6 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.navigate('/dashboard')}>
            <GlowingFireLogo size={28} showGlow={true} />
            <span className="font-headline font-black text-sm tracking-tight text-white flex items-center gap-1">
              blast <span className="text-orange-500">ai</span>
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[var(--color-border)]" />

          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <button onClick={() => router.navigate('/dashboard')} className="hover:text-[var(--color-text)] transition-colors flex items-center gap-1">
              <span>🏠</span>
              <span>Home</span>
            </button>
            <span>›</span>
            <span className="text-[var(--color-text)] font-medium truncate max-w-md">{activeTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenUpgrade}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            <Sparkles size={13} className="fill-black" />
            <span>Upgrade</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-20 bg-[var(--color-bg)] border-r border-[var(--color-border)] flex flex-col items-center py-6 space-y-6 shrink-0">
          <button
            onClick={() => router.navigate(`/notes/${noteId}`)}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover)] flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Learn</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/editor`)}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover)] flex items-center justify-center">
              <FileText size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Notes</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/quiz`)}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover)] flex items-center justify-center">
              <Award size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Quiz</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/flashcards`)}
            className="flex flex-col items-center gap-1.5 text-purple-400 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <Layers size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">Flashcards</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/podcast`)}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover)] flex items-center justify-center">
              <Headphones size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Podcast</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/sources`)}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover)] flex items-center justify-center">
              <FolderGit2 size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Sources</span>
          </button>
        </aside>

        {/* Flashcards View */}
        <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 flex flex-col items-center">
          <div className="max-w-xl w-full space-y-6">
            {/* Top Memory Score Indicator */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <BlastMascot size="sm" state={mascotState} />
                </div>
                <div>
                  <div className="font-headline font-bold text-xs text-[var(--color-text)]">
                    Memory Score: {memoryScore}%
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    Card {currentIdx + 1} of {cards.length} • Active Recall Mode
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Spaced Repetition
              </span>
            </div>

            {/* 3D Flashcard Flip Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-80 rounded-3xl cursor-pointer perspective-1000 relative group transition-transform active:scale-[0.99]"
            >
              <div
                className={`w-full h-full rounded-3xl p-8 border transition-all duration-500 shadow-2xl flex flex-col justify-between ${
                  isFlipped
                    ? 'bg-purple-950/20 border-purple-500/40 shadow-purple-500/10'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-purple-500/40'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                    {currentCard.category || 'Core Concept'}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 font-medium">
                    <RotateCw size={12} />
                    <span>{isFlipped ? 'Answer' : 'Tap to flip'}</span>
                  </span>
                </div>

                {/* Card Content */}
                <div className="my-auto text-center px-4">
                  {isFlipped ? (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        Key Answer & Explanation
                      </div>
                      <p className="font-headline text-base md:text-lg text-[var(--color-text)] leading-relaxed">
                        {currentCard.back}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                        Concept Question
                      </div>
                      <h2 className="font-headline font-bold text-xl md:text-2xl text-[var(--color-text)] leading-snug">
                        {currentCard.front}
                      </h2>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="text-center text-[11px] text-[var(--color-text-muted)]">
                  {isFlipped ? 'Rate your recall below' : 'Click anywhere on card to reveal explanation'}
                </div>
              </div>
            </div>

            {/* Spaced Repetition Rating Buttons */}
            {isFlipped ? (
              <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-200">
                <button
                  onClick={() => handleRateCard('hard')}
                  className="py-3 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs transition-all flex flex-col items-center gap-1"
                >
                  <span>Hard</span>
                  <span className="text-[10px] text-rose-400/80 font-normal">Review soon</span>
                </button>

                <button
                  onClick={() => handleRateCard('good')}
                  className="py-3 px-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs transition-all flex flex-col items-center gap-1"
                >
                  <span>Good</span>
                  <span className="text-[10px] text-purple-400/80 font-normal">Normal delay</span>
                </button>

                <button
                  onClick={() => handleRateCard('easy')}
                  className="py-3 px-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-all flex flex-col items-center gap-1"
                >
                  <span>Easy</span>
                  <span className="text-[10px] text-emerald-400/80 font-normal">Mastered (+2%)</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2">
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all"
                >
                  <span>Next Card</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Ask Blast AI Button */}
      <button
        onClick={openBlastHandler || (() => router.navigate(`/notes/${noteId}/editor`))}
        className="fixed right-6 bottom-8 py-2 px-4 rounded-full bg-[var(--color-surface)] border border-orange-500/30 shadow-xl text-xs font-bold text-[var(--color-text)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all z-40 group"
      >
        <BlastMascot size="xs" state={mascotState} />
        <span className="group-hover:text-orange-400 transition-colors">Ask Blast AI</span>
      </button>
    </div>
  );
};
export default FlashcardsGeneratorView;
