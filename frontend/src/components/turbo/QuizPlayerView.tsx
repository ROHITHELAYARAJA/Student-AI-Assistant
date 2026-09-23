import React, { useState } from 'react';
import { router } from '../../services/router.js';
import {
  Trophy,
  Tag,
  Settings,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  FileText,
  Award,
  Layers,
  Headphones,
  FolderGit2
} from 'lucide-react';

interface QuizPlayerViewProps {
  noteId?: string;
  topicTitle?: string;
  onOpenUpgrade?: () => void;
  onOpenEmma?: () => void;
}

export const QuizPlayerView: React.FC<QuizPlayerViewProps> = ({
  noteId = 'faang-sde',
  topicTitle = 'Roadmap: Resume to FAANG/MAANG SDE',
  onOpenUpgrade,
  onOpenEmma
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const questions = [
    {
      id: 1,
      tag: 'Resume and Profile Optimization',
      question: 'In a high-traffic URL shortener service, which caching strategy best balances low latency with horizontal scalability?',
      options: [
        { key: 'A', text: 'Cache query results in the relational database itself' },
        { key: 'B', text: 'Do not employ any caching layer' },
        { key: 'C', text: 'Use an in memory cache like Caffeine inside each service instance' },
        { key: 'D', text: 'Use a distributed cache such as Redis' }
      ],
      correctKey: 'D',
      hint: 'Think about multiple application servers sharing an invalidated cache without cache inconsistency.'
    },
    {
      id: 2,
      tag: 'System Design Scaling',
      question: 'What is the primary benefit of using consistent hashing in distributed caching clusters?',
      options: [
        { key: 'A', text: 'It completely eliminates network latency' },
        { key: 'B', text: 'Minimizes key redistribution when nodes are added or removed' },
        { key: 'C', text: 'Guarantees ACID transactions across all partitions' },
        { key: 'D', text: 'Encrypts all data at rest automatically' }
      ],
      correctKey: 'B',
      hint: 'When a cache node fails, how many keys need to be remapped?'
    }
  ];

  const currentQ = questions[currentQIndex] || questions[0];

  return (
    <div className="min-h-screen bg-[#111114] text-zinc-100 flex flex-col font-sans select-none relative">
      <header className="h-14 px-6 flex items-center justify-between border-b border-[#1E1E28] bg-[#111114] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.navigate('/dashboard')}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
            </svg>
            <span className="font-bold text-white text-base tracking-tight">turbo ai</span>
          </div>

          <div className="h-4 w-[1px] bg-[#2A2A3A]" />

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <button onClick={() => router.navigate('/dashboard')} className="hover:text-white transition-colors flex items-center gap-1">
              <span>🏠</span>
              <span>Home</span>
            </button>
            <span>›</span>
            <button onClick={() => router.navigate(`/notes/${noteId}`)} className="text-zinc-200 font-medium truncate max-w-md hover:underline">
              {topicTitle}
            </button>
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

          <button
            onClick={() => router.navigate('/signup')}
            className="w-8 h-8 rounded-full bg-[#582CD6] text-white font-bold text-xs flex items-center justify-center ring-2 ring-[#2F2450]"
          >
            E
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-20 bg-[#111114] border-r border-[#1E1E28] flex flex-col items-center py-6 space-y-6 shrink-0">
          <button onClick={() => router.navigate(`/notes/${noteId}`)} className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Learn</span>
          </button>

          <button onClick={() => router.navigate(`/notes/${noteId}/editor`)} className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <FileText size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Notes</span>
          </button>

          <button onClick={() => router.navigate(`/notes/${noteId}/quiz`)} className="flex flex-col items-center gap-1.5 text-purple-400 group">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <Award size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">Quiz</span>
          </button>

          <button onClick={() => router.navigate(`/notes/${noteId}/flashcards`)} className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <Layers size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Flashcards</span>
          </button>

          <button onClick={() => router.navigate(`/notes/${noteId}/podcast`)} className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <Headphones size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Podcast</span>
          </button>

          <button onClick={() => router.navigate(`/notes/${noteId}/source`)} className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <FolderGit2 size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Source</span>
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto px-8 py-10 max-w-3xl mx-auto w-full space-y-6">
          <div className="flex items-center gap-3">
            <Trophy size={18} className="text-amber-400" />
            <div className="flex-1 h-1.5 bg-[#20202E] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-zinc-400">
              {currentQIndex} / 25
            </span>
          </div>

          <div className="p-8 rounded-3xl bg-[#16161E] border border-[#252534] shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 text-xs font-bold text-zinc-200 bg-[#20202C] px-3 py-1.5 rounded-xl border border-[#2B2B3E]">
                  <span>Question {currentQ.id}</span>
                  <span>⌄</span>
                </button>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#231E18] border border-[#3E2F20] text-amber-300 text-xs font-semibold">
                  <Tag size={12} />
                  <span>{currentQ.tag}</span>
                </div>
              </div>

              <button className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
                <Settings size={13} />
                <span>Quiz Settings</span>
              </button>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-white leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOption === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedOption(opt.key)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-purple-900/20 border-purple-500 text-purple-200 shadow-md shadow-purple-500/10'
                        : 'bg-[#1C1C28] border-[#2A2A3C] text-zinc-300 hover:bg-[#222232] hover:border-[#383850]'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-[#262638] text-zinc-400'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span className="leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {showHint && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <Lightbulb size={16} className="shrink-0 mt-0.5" />
                <span>{currentQ.hint}</span>
              </div>
            )}

            <button
              onClick={() => setShowHint(!showHint)}
              className="w-full py-3 rounded-2xl bg-[#5B4896]/30 hover:bg-[#5B4896]/50 border border-purple-500/40 text-purple-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Lightbulb size={14} />
              <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            </button>

            <div className="pt-2 flex items-center justify-between">
              <button
                disabled={currentQIndex === 0}
                onClick={() => {
                  setCurrentQIndex((i) => Math.max(0, i - 1));
                  setSelectedOption(null);
                  setShowHint(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>

              <button
                onClick={() => {
                  if (currentQIndex < questions.length - 1) {
                    setCurrentQIndex((i) => i + 1);
                    setSelectedOption(null);
                    setShowHint(false);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </main>
      </div>

      <button
        onClick={onOpenEmma || (() => router.navigate(`/notes/${noteId}/editor`))}
        className="fixed right-6 bottom-8 py-2 px-3.5 rounded-full bg-[#181824] border border-[#2D2D44] shadow-xl text-xs font-bold text-white flex items-center gap-2 hover:bg-[#222234] hover:scale-105 active:scale-95 transition-all z-40"
      >
        <img src="/emma-expressions/teaching.png" alt="Mascot" className="w-5 h-5 rounded-full object-cover" />
        <span>Ask Emma AI</span>
      </button>
    </div>
  );
};
