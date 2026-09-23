import React, { useState } from 'react';
import { TurboFlashcardDeck } from '../../types/turbo.js';
import {
  Layers,
  RotateCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface FlashcardsViewProps {
  deck: TurboFlashcardDeck | null;
  isLoading: boolean;
  onOpenEmmaWithPrompt: (prompt: string) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  deck,
  isLoading,
  onOpenEmmaWithPrompt
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin mb-4" />
        <h3 className="text-white font-semibold text-sm">Generating Spaced Repetition Flashcards...</h3>
        <p className="text-zinc-400 text-xs mt-1">Emma is isolating atomic memory concepts for rapid recall.</p>
      </div>
    );
  }

  if (!deck || !deck.cards || deck.cards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="p-4 rounded-2xl bg-[#1A1A28] border border-[#2D2D42] mb-4">
          <Layers size={32} className="text-purple-400" />
        </div>
        <h3 className="text-white font-semibold text-base">No Flashcards Available</h3>
        <p className="text-zinc-400 text-xs mt-1 max-w-sm">
          Select or enter a study topic above to generate memory cards.
        </p>
      </div>
    );
  }

  const currentCard = deck.cards[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / deck.cards.length) * 100);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev < deck.cards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : deck.cards.length - 1));
  };

  const markMastered = (cardId: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.add(cardId);
      return next;
    });
    handleNext();
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full flex flex-col justify-between space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Card {currentIdx + 1}</span>
            <span className="text-zinc-400">of {deck.cards.length}</span>
            {masteredIds.has(currentCard.id) && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold">
                <CheckCircle2 size={11} /> Mastered
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentIdx(Math.floor(Math.random() * deck.cards.length));
              }}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Shuffle size={12} />
              <span>Shuffle</span>
            </button>
            <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              {currentCard.category}
            </span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-[#1F1F2C] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 cursor-pointer select-none perspective-1000 group relative"
      >
        <div
          className={`w-full h-full rounded-3xl p-8 border transition-all duration-500 shadow-2xl flex flex-col justify-between ${
            isFlipped
              ? 'bg-gradient-to-br from-[#1C182E] to-[#12101E] border-purple-500/40 text-purple-100 shadow-purple-900/10'
              : 'bg-gradient-to-br from-[#14141E] to-[#0E0E16] border-[#252538] text-white hover:border-[#383850]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="uppercase font-bold tracking-wider text-[10px]">
              {isFlipped ? 'Answer / Solution' : 'Prompt / Concept'}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-purple-400">
              <RotateCw size={12} />
              <span>Click to flip</span>
            </span>
          </div>

          <div className="my-auto text-center px-4">
            <h2 className="text-lg md:text-xl font-semibold leading-relaxed">
              {isFlipped ? currentCard.back : currentCard.front}
            </h2>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#26263A] text-[11px] text-zinc-400">
            <span>{deck.topic}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenEmmaWithPrompt(
                  `Hi Emma, could you explain the concept on this flashcard more thoroughly? Concept: "${currentCard.front}"`
                );
              }}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <Sparkles size={12} />
              <span>Explain with Emma</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-center text-[11px] text-zinc-400">
          How well do you know this concept?
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleNext()}
            className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
          >
            Again <span className="text-[10px] opacity-70 block font-normal">1m</span>
          </button>
          <button
            onClick={() => handleNext()}
            className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all"
          >
            Hard <span className="text-[10px] opacity-70 block font-normal">10m</span>
          </button>
          <button
            onClick={() => handleNext()}
            className="py-2.5 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all"
          >
            Good <span className="text-[10px] opacity-70 block font-normal">1d</span>
          </button>
          <button
            onClick={() => markMastered(currentCard.id)}
            className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all"
          >
            Easy <span className="text-[10px] opacity-70 block font-normal">4d</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#161622] hover:bg-[#202030] border border-[#252538] text-xs text-zinc-300 transition-all"
        >
          <ChevronLeft size={14} />
          <span>Previous</span>
        </button>

        <span className="text-xs text-zinc-400">
          {masteredIds.size} of {deck.cards.length} cards mastered
        </span>

        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#161622] hover:bg-[#202030] border border-[#252538] text-xs text-zinc-300 transition-all"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
