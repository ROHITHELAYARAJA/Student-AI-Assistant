import React, { useState, useEffect } from 'react';
import { router } from '../../services/router.js';
import { TurboMascot } from './TurboMascot.js';
import { getStudyPack, fetchStudyPack } from '../../services/turboApi.js';
import { TurboStudyPack, TurboQuizItem } from '../../types/turbo.js';
import {
  Trophy,
  Tag,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  FileText,
  Award,
  Layers,
  Headphones,
  FolderGit2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2
} from 'lucide-react';

interface QuizPlayerViewProps {
  noteId?: string;
  topicTitle?: string;
  onOpenUpgrade?: () => void;
  onOpenEmma?: () => void;
}

export const QuizPlayerView: React.FC<QuizPlayerViewProps> = ({
  noteId = 'current',
  topicTitle = 'How to learn Java',
  onOpenUpgrade,
  onOpenEmma
}) => {
  const [studyPack, setStudyPack] = useState<TurboStudyPack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showHint, setShowHint] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

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

  const questions: TurboQuizItem[] = studyPack?.quiz?.questions || [
    {
      id: 'q-1',
      question: `What is the primary memory management guarantee in ${activeTitle}?`,
      options: [
        'Manual pointer arithmetic without bounds checking',
        'Automatic memory lifecycle management and boundary enforcement',
        'Direct operating system kernel memory swapping',
        'Uninitialized heap access by default'
      ],
      correctIndex: 1,
      explanation: 'Modern platforms employ automated garbage collection and runtime bounds safety to prevent undefined memory corruption.'
    },
    {
      id: 'q-2',
      question: `When designing high-throughput applications in ${activeTitle}, which paradigm minimizes latency bottlenecks?`,
      options: [
        'Single-threaded blocking synchronous I/O loops',
        'Asynchronous event-driven loops or efficient thread pools with non-blocking buffers',
        'Polling databases continuously without caching',
        'Executing all compute operations on the user UI thread'
      ],
      correctIndex: 1,
      explanation: 'Asynchronous event loops and non-blocking worker pools prevent execution thread exhaustion under heavy concurrency.'
    },
    {
      id: 'q-3',
      question: `Which data structure achieves amortized O(1) key-value lookup for ${activeTitle}?`,
      options: [
        'Balanced Binary Search Tree',
        'Unsorted Linked List',
        'Hash Map / Hash Table with bucket collision resolution',
        'Linear Array Scan'
      ],
      correctIndex: 2,
      explanation: 'Hash tables hash keys into bucket arrays, giving average constant time lookups assuming a uniform hash distribution.'
    }
  ];

  const currentQ = questions[currentQIndex] || questions[0];
  const hasAnswered = selectedAnswers[currentQIndex] !== undefined;
  const chosenIndex = selectedAnswers[currentQIndex];
  const isCorrect = hasAnswered && chosenIndex === currentQ.correctIndex;

  const handleSelectOption = (idx: number) => {
    if (hasAnswered) return;
    const updated = { ...selectedAnswers, [currentQIndex]: idx };
    setSelectedAnswers(updated);
    if (idx === currentQ.correctIndex) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setShowHint(false);
    }
  };

  const handlePrev = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex((prev) => prev - 1);
      setShowHint(false);
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setShowHint(false);
    setQuizScore(0);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col font-body select-none">
      {/* Top Header */}
      <header className="h-14 px-6 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.navigate('/dashboard')}>
            <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
              ⚡
            </div>
            <span className="font-headline font-bold text-sm tracking-tight">turbo ai</span>
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
            className="flex flex-col items-center gap-1.5 text-purple-400 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <Award size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">Quiz</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/flashcards`)}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover)] flex items-center justify-center">
              <Layers size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Flashcards</span>
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

        {/* Quiz Question Card */}
        <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 flex flex-col items-center">
          <div className="max-w-2xl w-full space-y-6">
            {/* Top Score & Progress Meter */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Trophy size={18} />
                </div>
                <div>
                  <div className="font-headline font-bold text-xs text-[var(--color-text)]">
                    Score: {quizScore} / {answeredCount}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    Question {currentQIndex + 1} of {questions.length}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-28 h-2 bg-[var(--color-bg-alt)] rounded-full overflow-hidden border border-[var(--color-border)]">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <button
                  onClick={handleRestart}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  title="Restart Quiz"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Question Box */}
            <div className="p-6 md:p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                  Question {currentQIndex + 1}
                </span>

                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <Lightbulb size={13} />
                  <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                </button>
              </div>

              {showHint && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 animate-in fade-in duration-150">
                  💡 Hint: Review the high-yield principles covered in your notes and roadmap milestones for {activeTitle}.
                </div>
              )}

              <h2 className="font-headline font-bold text-lg md:text-xl text-[var(--color-text)] leading-snug">
                {currentQ.question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = chosenIndex === optIdx;
                  const isThisCorrect = optIdx === currentQ.correctIndex;
                  const letter = String.fromCharCode(65 + optIdx);

                  let btnStyle = 'bg-[var(--color-bg-alt)] border-[var(--color-border)] text-[var(--color-text)] hover:border-purple-400';
                  if (hasAnswered) {
                    if (isThisCorrect) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-sm shadow-emerald-500/10';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                    } else {
                      btnStyle = 'bg-[var(--color-bg-alt)] border-[var(--color-border)] text-[var(--color-text-faint)] opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${btnStyle}`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {hasAnswered && isThisCorrect ? (
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        ) : hasAnswered && isSelected ? (
                          <XCircle size={14} className="text-rose-400" />
                        ) : (
                          letter
                        )}
                      </div>
                      <span className="text-xs md:text-sm font-medium leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Card */}
              {hasAnswered && (
                <div
                  className={`p-4 rounded-2xl border space-y-1.5 animate-in fade-in duration-200 ${
                    isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="font-headline font-bold text-xs flex items-center gap-1.5">
                    {isCorrect ? '✓ Spot on!' : '✕ Not quite'}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Bottom Next/Prev Pagination */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <button
                  onClick={handlePrev}
                  disabled={currentQIndex === 0}
                  className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentQIndex === questions.length - 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all disabled:opacity-40"
                >
                  <span>Next Question</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Ask Emma AI Button */}
      <button
        onClick={onOpenEmma || (() => router.navigate(`/notes/${noteId}/editor`))}
        className="fixed right-6 bottom-8 py-2 px-3.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl text-xs font-bold text-[var(--color-text)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all z-40"
      >
        <TurboMascot size="xs" expression="teaching" />
        <span>Ask Emma AI</span>
      </button>
    </div>
  );
};
export default QuizPlayerView;
