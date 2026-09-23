import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { QuizQuestion } from '../../types/study.js';

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  title: string;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ questions, title }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleGradeQuiz = () => {
    setSubmitted(true);
    let correctCount = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    if (correctCount >= Math.ceil(questions.length * 0.7)) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
  };

  let totalScore = 0;
  if (submitted) {
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        totalScore++;
      }
    });
  }

  const answeredCount = Object.keys(userAnswers).length;
  const isAllAnswered = answeredCount === questions.length;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '1.5px solid var(--color-border)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
              {title}
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
            {questions.length} Diagnostic Multiple-Choice Questions
          </p>
        </div>

        {submitted ? (
          <div
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface)',
              border: '2px solid var(--color-primary)',
              fontWeight: 800,
              fontSize: '14px',
              color: 'var(--color-accent)'
            }}
          >
            Score: {totalScore} / {questions.length} (
            {Math.round((totalScore / questions.length) * 100)}%)
          </div>
        ) : (
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-accent)',
              backgroundColor: 'rgba(255, 225, 226, 0.7)',
              padding: '4px 12px',
              borderRadius: '999px',
              border: '1px solid var(--color-border)'
            }}
          >
            Answered {answeredCount} of {questions.length}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {questions.map((q, qIndex) => {
          const selectedOption = userAnswers[q.id];
          const isAnswered = selectedOption !== undefined;

          return (
            <div
              key={q.id}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h4
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '14px',
                  display: 'flex',
                  gap: '8px'
                }}
              >
                <span
                  style={{
                    backgroundColor: 'rgba(255, 225, 226, 0.9)',
                    color: 'var(--color-accent)',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    flexShrink: 0
                  }}
                >
                  {qIndex + 1}
                </span>
                {q.question}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {q.options.map((opt, optIndex) => {
                  const isSelected = selectedOption === optIndex;
                  const isCorrect = q.correctIndex === optIndex;

                  let borderColor = 'var(--color-border-subtle)';
                  let bgColor = 'var(--color-surface)';
                  let textColor = 'var(--color-text)';

                  if (submitted) {
                    if (isCorrect) {
                      borderColor = '#10B981';
                      bgColor = 'rgba(16, 185, 129, 0.12)';
                      textColor = '#065F46';
                    } else if (isSelected && !isCorrect) {
                      borderColor = '#EF4444';
                      bgColor = 'rgba(239, 68, 68, 0.12)';
                      textColor = '#991B1B';
                    }
                  } else if (isSelected) {
                    borderColor = 'var(--color-primary)';
                    bgColor = 'rgba(225, 29, 72, 0.08)';
                  }

                  return (
                    <div
                      key={optIndex}
                      onClick={() => handleSelectOption(q.id, optIndex)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1.5px solid ${borderColor}`,
                        backgroundColor: bgColor,
                        color: textColor,
                        fontSize: '13px',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: submitted ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: `1.5px solid ${borderColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                            color: isSelected ? '#FFFFFF' : 'inherit'
                          }}
                        >
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {submitted && isCorrect && <CheckCircle2 size={16} color="#10B981" />}
                      {submitted && isSelected && !isCorrect && <XCircle size={16} color="#EF4444" />}
                    </div>
                  );
                })}
              </div>

              {submitted && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(255, 225, 226, 0.45)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: 'var(--color-text)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    borderLeft: '3px solid var(--color-primary)'
                  }}
                >
                  <AlertCircle size={15} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--color-accent)' }}>Explanation: </strong>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          marginTop: '28px'
        }}
      >
        {!submitted ? (
          <button
            onClick={handleGradeQuiz}
            disabled={!isAllAnswered}
            style={{
              padding: '12px 32px',
              borderRadius: 'var(--radius-full)',
              background: isAllAnswered
                ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
                : '#DDD',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              cursor: isAllAnswered ? 'pointer' : 'not-allowed',
              boxShadow: isAllAnswered ? 'var(--shadow-md)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Submit & Grade Quiz
          </button>
        ) : (
          <button
            onClick={handleResetQuiz}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface)',
              border: '1.5px solid var(--color-primary)',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: '13px'
            }}
          >
            <RotateCcw size={15} /> Retake Test
          </button>
        )}
      </div>
    </div>
  );
};
