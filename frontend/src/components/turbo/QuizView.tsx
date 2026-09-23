import React, { useState } from 'react';
import { TurboQuiz } from '../../types/turbo.js';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface QuizViewProps {
  quiz: TurboQuiz | null;
  isLoading: boolean;
  onOpenEmmaWithPrompt: (prompt: string) => void;
  onRetakeQuiz: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  quiz,
  isLoading,
  onOpenEmmaWithPrompt,
  onRetakeQuiz
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin mb-4" />
        <h3 className="text-white font-semibold text-sm">Building Assessment Quiz...</h3>
        <p className="text-zinc-400 text-xs mt-1">Emma is assembling exam-level questions to evaluate your mastery.</p>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="p-4 rounded-2xl bg-[#1A1A28] border border-[#2D2D42] mb-4">
          <Award size={32} className="text-purple-400" />
        </div>
        <h3 className="text-white font-semibold text-base">No Quiz Available</h3>
        <p className="text-zinc-400 text-xs mt-1 max-w-sm">
          Please select a study topic or ingest materials to start testing your knowledge.
        </p>
      </div>
    );
  }

  const handleSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIdx
    }));
  };

  const handleFinish = () => {
    setIsSubmitted(true);
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    if (correctCount / quiz.questions.length >= 0.7) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 }
      });
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setUserAnswers({});
    setIsSubmitted(false);
    onRetakeQuiz();
  };

  const currentQ = quiz.questions[currentIdx];
  const answeredCount = Object.keys(userAnswers).length;

  if (isSubmitted) {
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    const percent = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = percent >= 70;

    return (
      <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full space-y-6">
        <div className="p-8 rounded-3xl bg-[#13131C] border border-[#252538] text-center shadow-xl space-y-4">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border ${
              passed
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}
          >
            <Award size={32} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">
              {passed ? 'Exam Readiness Verified!' : 'Practice Needed'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              You scored {correctCount} out of {quiz.questions.length} questions correctly ({percent}%).
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-[#1E1E2E] hover:bg-[#28283C] text-zinc-200 font-medium text-xs flex items-center gap-2 border border-[#303046] transition-all"
            >
              <RotateCcw size={14} />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={() =>
                onOpenEmmaWithPrompt(
                  `Hi Emma, I just finished the quiz on ${quiz.topic} with a score of ${percent}%. Can you review where students usually make mistakes in this topic and help me improve?`
                )
              }
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
            >
              <Sparkles size={14} />
              <span>Review with Emma</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Detailed Answers & Explanations</h2>
          {quiz.questions.map((q, idx) => {
            const userChoice = userAnswers[idx];
            const isQCorrect = userChoice === q.correctIndex;
            return (
              <div
                key={q.id || idx}
                className={`p-5 rounded-2xl border space-y-3 ${
                  isQCorrect
                    ? 'bg-[#12161A] border-emerald-500/30'
                    : 'bg-[#181318] border-rose-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400">Q{idx + 1}.</span>
                    <span className="text-xs font-semibold text-white">{q.question}</span>
                  </div>
                  {isQCorrect ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-rose-400 shrink-0" />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#181824] border border-[#252538]">
                    <span className="text-[10px] text-zinc-400 block">Your Answer:</span>
                    <span className={isQCorrect ? 'text-emerald-300 font-medium' : 'text-rose-300 font-medium'}>
                      {userChoice !== undefined ? q.options[userChoice] : 'Not answered'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#181824] border border-[#252538]">
                    <span className="text-[10px] text-zinc-400 block">Correct Answer:</span>
                    <span className="text-emerald-300 font-medium">{q.options[q.correctIndex]}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#1A1A28] border border-[#29293E] text-xs text-zinc-300 flex items-start gap-2">
                  <HelpCircle size={14} className="text-purple-400 shrink-0 mt-0.5" />
                  <span>{q.explanation}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full flex flex-col justify-between space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{quiz.title}</span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-400">
            <span>{answeredCount} of {quiz.questions.length} answered</span>
          </div>
        </div>

        <div className="flex gap-2">
          {quiz.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentIdx === idx
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : userAnswers[idx] !== undefined
                  ? 'bg-[#232338] text-purple-300'
                  : 'bg-[#161622] text-zinc-500 hover:bg-[#1E1E2E]'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#13131C] border border-[#242436] shadow-xl space-y-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
            Question {currentIdx + 1} of {quiz.questions.length}
          </span>
          <h2 className="text-base font-semibold text-white mt-1 leading-relaxed">
            {currentQ.question}
          </h2>
        </div>

        <div className="space-y-3">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = userAnswers[currentIdx] === optIdx;
            return (
              <button
                key={optIdx}
                onClick={() => handleSelect(optIdx)}
                className={`w-full p-4 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-sm shadow-purple-500/10'
                    : 'bg-[#181826] border-[#2A2A3E] text-zinc-300 hover:bg-[#1F1F30]'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    isSelected ? 'bg-purple-500 text-white' : 'bg-[#242436] text-zinc-400'
                  }`}
                >
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-[#232334] flex items-center justify-between">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            className="px-4 py-2 rounded-xl bg-[#181826] hover:bg-[#202032] border border-[#28283C] text-xs text-zinc-300 font-medium disabled:opacity-40 transition-all"
          >
            Previous
          </button>

          {currentIdx < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => Math.min(quiz.questions.length - 1, i + 1))}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
            >
              <span>Next</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={answeredCount === 0}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-md shadow-emerald-600/30 disabled:opacity-40 transition-all"
            >
              Submit & Review
            </button>
          )}
        </div>
      </div>

      <div className="text-center text-[11px] text-zinc-400">
        Turbo AI Assessment • Calibrated for Exam Success
      </div>
    </div>
  );
};
