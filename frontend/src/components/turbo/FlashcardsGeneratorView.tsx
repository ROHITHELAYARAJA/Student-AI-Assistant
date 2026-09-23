import React, { useState } from 'react';
import { router } from '../../services/router.js';
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
  ChevronRight
} from 'lucide-react';

interface FlashcardsGeneratorViewProps {
  noteId?: string;
  topicTitle?: string;
  onOpenUpgrade?: () => void;
}

export const FlashcardsGeneratorView: React.FC<FlashcardsGeneratorViewProps> = ({
  noteId = 'faang-sde',
  topicTitle = 'Roadmap: Resume to FAANG/MAANG SDE',
  onOpenUpgrade
}) => {
  const [selectedCount, setSelectedCount] = useState<number>(20);
  const [instructions, setInstructions] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cardSets = [
    { count: 10, label: 'Quick review' },
    { count: 20, label: 'Standard set', isDefault: true },
    { count: 30, label: 'Comprehensive' },
    { count: 50, label: 'Deep dive' }
  ];

  const generatedCards = [
    {
      id: 1,
      front: 'What is the primary constraint when auditing a resume for a FAANG SDE role?',
      back: 'Quantified impact and high-scale technical depth: highlighting latency reductions, throughput numbers, and measurable business metrics rather than passive task descriptions.'
    },
    {
      id: 2,
      front: 'Why is the two-pointer / sliding-window pattern preferred for subarray problem solving?',
      back: 'It reduces nested iteration from quadratic time O(n²) down to linear time O(n) by maintaining a moving window state.'
    },
    {
      id: 3,
      front: 'When designing a caching layer for a distributed URL shortener, what prevents single point of failure?',
      back: 'Consistent hashing with Redis Sentinel or Redis Cluster, enabling automatic master-replica failover and balanced partition distribution.'
    }
  ];

  const handleGenerate = () => {
    setIsGenerated(true);
    setCurrentIdx(0);
    setIsFlipped(false);
  };

  return (
    <div className="min-h-screen bg-[#111114] text-zinc-100 flex flex-col font-sans select-none">
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

          <button onClick={() => router.navigate(`/notes/${noteId}/quiz`)} className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <Award size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Quiz</span>
          </button>

          <button onClick={() => router.navigate(`/notes/${noteId}/flashcards`)} className="flex flex-col items-center gap-1.5 text-purple-400 group">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <Layers size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">Flashcards</span>
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

        <main className="flex-1 overflow-y-auto px-8 py-14 max-w-2xl mx-auto w-full flex flex-col items-center">
          {!isGenerated ? (
            <div className="w-full space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Welcome to Flashcards
                </h1>
                <p className="text-xs text-zinc-400">
                  Choose how many flashcards to generate from your notes
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {cardSets.map((set) => {
                  const isSelected = selectedCount === set.count;
                  return (
                    <button
                      key={set.count}
                      type="button"
                      onClick={() => setSelectedCount(set.count)}
                      className={`p-4 rounded-2xl border text-center transition-all relative ${
                        isSelected
                          ? 'bg-[#3D2C6A]/30 border-purple-500 text-purple-200 shadow-lg shadow-purple-600/10'
                          : 'bg-[#181822] border-[#262638] text-zinc-400 hover:bg-[#20202E]'
                      }`}
                    >
                      {set.isDefault && (
                        <Sparkles size={11} className="text-purple-400 absolute top-2.5 right-2.5" />
                      )}
                      <div className="text-xl font-bold text-white">{set.count}</div>
                      <div className="text-[11px] text-zinc-400 mt-1">{set.label}</div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Special Instructions (Optional)
                </label>
                <textarea
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Describe what you want your flashcards to focus on, or leave blank to cover the full notes..."
                  className="w-full p-4 rounded-2xl bg-[#16161E] border border-[#262638] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                className="w-full py-3.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98]"
              >
                Generate {selectedCount} Flashcards
              </button>
            </div>
          ) : (
            <div className="w-full space-y-6">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Card {currentIdx + 1} of {generatedCards.length}</span>
                <button
                  onClick={() => setIsGenerated(false)}
                  className="text-purple-400 hover:underline"
                >
                  Configure set
                </button>
              </div>

              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-80 rounded-3xl p-8 bg-[#181824] border border-[#2C2C40] hover:border-purple-500/50 cursor-pointer flex flex-col justify-between shadow-2xl transition-all"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-500 uppercase font-bold tracking-wider">
                  <span>{isFlipped ? 'Answer' : 'Question'}</span>
                  <span className="flex items-center gap-1 text-purple-400 lowercase font-normal">
                    <RotateCw size={12} />
                    <span>flip</span>
                  </span>
                </div>

                <div className="my-auto text-center px-4 text-base md:text-lg font-medium text-white leading-relaxed">
                  {isFlipped ? generatedCards[currentIdx].back : generatedCards[currentIdx].front}
                </div>

                <div className="text-center text-[10px] text-zinc-500">
                  Click anywhere to reveal
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIdx((i) => Math.max(0, i - 1));
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#181824] border border-[#272738] text-xs text-zinc-300 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIdx((i) => (i < generatedCards.length - 1 ? i + 1 : 0));
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-md shadow-purple-600/30"
                >
                  <span>Next Card</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
