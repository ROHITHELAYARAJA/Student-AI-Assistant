import React, { useState } from 'react';
import { TurboLesson, TurboQuestion } from '../../types/turbo.js';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpenCheck
} from 'lucide-react';
import { BlastMascot } from './BlastMascot.js';

interface LearnPlayerProps {
  lesson: TurboLesson | null;
  isLoading: boolean;
  onExplainInChat: (question: TurboQuestion, studentAnswer: string, isCorrect: boolean) => void;
  onRestartLesson: () => void;
}

export const LearnPlayer: React.FC<LearnPlayerProps> = ({
  lesson,
  isLoading,
  onExplainInChat,
  onRestartLesson
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillInput, setFillInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin mb-4" />
        <h3 className="text-white font-semibold text-sm">Generating Active Learning Lesson...</h3>
        <p className="text-zinc-400 text-xs mt-1">Emma is building interactive questions with instant explanations.</p>
      </div>
    );
  }

  if (!lesson || !lesson.questions || lesson.questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="p-4 rounded-2xl bg-[#1A1A28] border border-[#2D2D42] mb-4">
          <BookOpenCheck size={32} className="text-purple-400" />
        </div>
        <h3 className="text-white font-semibold text-base">No Lesson Available</h3>
        <p className="text-zinc-400 text-xs mt-1 max-w-sm">
          Please select a study topic or upload documents to start practicing.
        </p>
      </div>
    );
  }

  const currentQ = lesson.questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + (isAnswered ? 1 : 0)) / lesson.questions.length) * 100);

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    const correct = opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore((s) => s + 1);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#8B5CF6', '#10B981', '#6366F1']
      });
    }
  };

  const handleFillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !fillInput.trim()) return;

    const correct =
      fillInput.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase() ||
      currentQ.correctAnswer.toLowerCase().includes(fillInput.trim().toLowerCase());

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore((s) => s + 1);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#8B5CF6', '#10B981', '#6366F1']
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < lesson.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setFillInput('');
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setCompleted(true);
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setFillInput('');
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setCompleted(false);
    onRestartLesson();
  };

  if (completed) {
    const accuracy = Math.round((score / lesson.questions.length) * 100);
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-xl mx-auto w-full text-center">
        <div className="p-8 rounded-3xl bg-[#14141E] border border-[#2A2A3E] shadow-2xl w-full space-y-6">
          <div className="w-24 h-24 mx-auto flex items-center justify-center">
            <BlastMascot size="lg" state="success" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Lesson Completed!</h2>
            <p className="text-zinc-400 text-xs mt-1">
              Outstanding work mastering {lesson.topic}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-[#1A1A28] border border-[#28283C]">
              <div className="text-[11px] text-zinc-400 uppercase font-semibold">Score</div>
              <div className="text-2xl font-extrabold text-white mt-1">
                {score} / {lesson.questions.length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#1A1A28] border border-[#28283C]">
              <div className="text-[11px] text-zinc-400 uppercase font-semibold">Mastery</div>
              <div className="text-2xl font-extrabold text-purple-400 mt-1">{accuracy}%</div>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
          >
            <RotateCcw size={14} />
            <span>Practice Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Question {currentIndex + 1}</span>
            <span className="text-zinc-400">of {lesson.questions.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              {currentQ.conceptTag}
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

      <div className="p-6 rounded-2xl bg-[#13131C] border border-[#252538] shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-wide leading-relaxed">
            {currentQ.question}
          </h2>
        </div>

        {currentQ.type === 'multiple_choice' && currentQ.options && (
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isChosen = selectedOption === option;
              const isThisCorrect = option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

              let btnStyle = 'bg-[#181826] border-[#2A2A3E] text-zinc-200 hover:border-purple-500/50 hover:bg-[#1E1E30]';

              if (isAnswered) {
                if (isThisCorrect) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200';
                } else if (isChosen && !isThisCorrect) {
                  btnStyle = 'bg-rose-500/20 border-rose-500/60 text-rose-200';
                } else {
                  btnStyle = 'bg-[#151520] border-[#202030] text-zinc-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full p-4 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#222234] flex items-center justify-center text-[11px] font-bold text-zinc-400 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isAnswered && isThisCorrect && (
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && isChosen && !isThisCorrect && (
                    <XCircle size={18} className="text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {currentQ.type === 'fill_in_the_blank' && (
          <form onSubmit={handleFillSubmit} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                disabled={isAnswered}
                value={fillInput}
                onChange={(e) => setFillInput(e.target.value)}
                placeholder="Type your answer here..."
                className="flex-1 px-4 py-3 rounded-xl bg-[#181826] border border-[#2B2B40] text-white text-xs focus:outline-none focus:border-purple-500 transition-all placeholder:text-zinc-600"
              />
              {!isAnswered && (
                <button
                  type="submit"
                  disabled={!fillInput.trim()}
                  className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs disabled:opacity-50 transition-all"
                >
                  Submit
                </button>
              )}
            </div>

            {isAnswered && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span>
                  Correct Answer: <strong className="text-white">{currentQ.correctAnswer}</strong>
                </span>
              </div>
            )}
          </form>
        )}

        {isAnswered && (
          <div className="pt-4 border-t border-[#26263A] space-y-4">
            <div className="p-4 rounded-xl bg-[#1A1A28] border border-[#2E2E44] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                <HelpCircle size={14} />
                <span>Concept Explanation</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{currentQ.explanation}</p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() =>
                  onExplainInChat(
                    currentQ,
                    selectedOption || fillInput,
                    isCorrect
                  )
                }
                className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 font-medium py-1 px-2 rounded-lg hover:bg-purple-500/10 transition-colors"
              >
                <Sparkles size={14} />
                <span>Ask Emma to Explain in Chat</span>
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-zinc-400">
        Turbo AI Active Practice • Mastered with Bedrock AI
      </div>
    </div>
  );
};
