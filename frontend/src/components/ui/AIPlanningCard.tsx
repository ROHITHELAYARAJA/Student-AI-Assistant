import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type PlanningIntent =
  | 'document'
  | 'search'
  | 'research'
  | 'notes'
  | 'study_plan'
  | 'explain'
  | 'quiz'
  | 'flashcards'
  | 'exam'
  | 'verify';

export interface PlanningConfig {
  id: PlanningIntent;
  title: string;
  subtitle: string;
  steps: string[];
}

export const PLANNING_PRESETS: Record<PlanningIntent, PlanningConfig> = {
  document: {
    id: 'document',
    title: 'Understanding your document',
    subtitle: 'Usually takes a few seconds.',
    steps: [
      'Reading your material',
      'Detecting chapters and sections',
      'Extracting key concepts',
      'Understanding important ideas',
      'Preparing your study workspace'
    ]
  },
  search: {
    id: 'search',
    title: 'Searching for answers',
    subtitle: 'Finding the most relevant information.',
    steps: [
      'Understanding your question',
      'Searching your materials',
      'Looking for related topics',
      'Ranking the best matches',
      'Preparing your answer'
    ]
  },
  research: {
    id: 'research',
    title: 'Researching your topic',
    subtitle: 'Exploring reliable information.',
    steps: [
      'Understanding your topic',
      'Identifying key questions',
      'Finding relevant sources',
      'Comparing useful information',
      'Building your research summary'
    ]
  },
  notes: {
    id: 'notes',
    title: 'Creating your notes',
    subtitle: 'Organizing the important ideas.',
    steps: [
      'Reading the source material',
      'Finding the main points',
      'Grouping related concepts',
      'Structuring clean notes',
      'Finalizing your notes'
    ]
  },
  study_plan: {
    id: 'study_plan',
    title: 'Building your study plan',
    subtitle: 'Creating a clear path forward.',
    steps: [
      'Understanding your goal',
      'Checking deadlines and priorities',
      'Estimating study time',
      'Organizing your schedule',
      'Finalizing your plan'
    ]
  },
  explain: {
    id: 'explain',
    title: 'Explaining the concept',
    subtitle: 'Turning difficult ideas into simple learning.',
    steps: [
      'Understanding the concept',
      'Identifying difficult parts',
      'Breaking it into simple steps',
      'Choosing clear examples',
      'Preparing your explanation'
    ]
  },
  quiz: {
    id: 'quiz',
    title: 'Generating your quiz',
    subtitle: 'Creating practice questions for active recall.',
    steps: [
      'Reading the material',
      'Identifying testable ideas',
      'Writing question prompts',
      'Preparing answer options',
      'Finalizing your quiz'
    ]
  },
  flashcards: {
    id: 'flashcards',
    title: 'Creating your flashcards',
    subtitle: 'Turning lessons into quick revision cards.',
    steps: [
      'Reading the key content',
      'Extracting important facts',
      'Pairing questions and answers',
      'Organizing revision cards',
      'Finalizing your flashcards'
    ]
  },
  exam: {
    id: 'exam',
    title: 'Preparing your exam revision',
    subtitle: 'Focusing on the most important topics first.',
    steps: [
      'Reviewing your syllabus',
      'Finding high-priority topics',
      'Identifying weak areas',
      'Organizing revision tasks',
      'Preparing your revision pack'
    ]
  },
  verify: {
    id: 'verify',
    title: 'Checking and verifying your answer',
    subtitle: 'Making sure everything is accurate.',
    steps: [
      'Reading your answer',
      'Checking against the source',
      'Verifying important facts',
      'Finding missing details',
      'Preparing the final result'
    ]
  }
};

/**
 * Detects whether a prompt requires the heavy 5-step AI Planning Card.
 * Planning is strictly reserved for study generation tasks:
 * - Documents, PDFs, or images uploaded
 * - Explicit study artifacts requested (quiz, flashcards, notes, study plan, exam prep)
 * All normal conversational messages, greetings, simple questions, and chit-chat get a fast, direct answer without planning.
 */
export function isStudyTaskIntent(
  text: string,
  context?: { hasDocuments?: boolean; hasImages?: boolean; isNotebook?: boolean }
): boolean {
  if (context?.hasDocuments || context?.hasImages || context?.isNotebook) return true;
  const t = text.trim().toLowerCase();
  if (!t) return false;

  const studyKeywords = [
    'create notes', 'generate notes', 'make notes', 'study notes', 'summarize notes',
    'flashcard', 'flashcards', 'quiz', 'practice questions', 'mcq', 'practice test',
    'study plan', 'study roadmap', 'learning roadmap', 'learning path', 'study schedule',
    'exam prep', 'exam revision', 'finals prep', 'midterm prep',
    'study material', 'study materials', 'attached document', 'textbook',
    'create notebook', 'generate notebook', 'build a study', 'make a study'
  ];
  return studyKeywords.some(kw => t.includes(kw));
}

export function isConversationalMessage(
  text: string,
  context?: { hasDocuments?: boolean; hasImages?: boolean; isNotebook?: boolean }
): boolean {
  return !isStudyTaskIntent(text, context);
}

/**
 * Intelligent prompt and context analyzer to detect which planning model applies
 */
export function analyzePlanningIntent(
  prompt: string,
  context?: { hasDocuments?: boolean; hasImages?: boolean; isNotebook?: boolean }
): PlanningIntent {
  const p = prompt.toLowerCase();

  // 1. If study materials or documents are attached
  if (context?.hasDocuments || context?.hasImages || /\b(study material|source material|attached document|pdf|notes file|textbook)\b/i.test(p)) {
    if (/\b(quiz|test|questions?|mcq)\b/i.test(p)) return 'quiz';
    if (/\b(flashcards?|cards?|anki|revision cards?)\b/i.test(p)) return 'flashcards';
    if (/\b(notes?|summarize|summary|breakdown)\b/i.test(p)) return 'notes';
    return 'document';
  }

  // 2. Exam revision & syllabus prep
  if (/\b(exam|test prep|finals?|midterms?|syllabus|revision pack|board exam)\b/i.test(p)) {
    return 'exam';
  }

  // 3. Quiz & knowledge checks
  if (/\b(quiz|test questions?|practice questions?|mcq|knowledge check|trivia)\b/i.test(p)) {
    return 'quiz';
  }

  // 4. Flashcards & quick revision cards
  if (/\b(flashcards?|cards?|anki|revision cards?|retrieval practice)\b/i.test(p)) {
    return 'flashcards';
  }

  // 5. Notes creation & structured summary
  if (/\b(create notes|make notes|summarize notes|cheat sheet|bullet points notes|lecture notes)\b/i.test(p)) {
    return 'notes';
  }

  // 6. Study plan & Roadmap schedule
  if (/\b(study plan|roadmap|schedule|timeline|learning path|study guide|curriculum)\b/i.test(p)) {
    return 'study_plan';
  }

  // 7. Verify & check answer / work
  if (/\b(check (my )?(answer|work|code|solution)|is this (correct|right)|grade (my|this)|verify)\b/i.test(p)) {
    return 'verify';
  }

  // 8. Research topic & deep exploration
  if (/\b(research|deep dive|explore topic|literature|background on|investigate)\b/i.test(p)) {
    return 'research';
  }

  // 9. Searching for specific answers
  if (/\b(where in|search for|find in|what does the document say|according to)\b/i.test(p) || p.startsWith('who ') || p.startsWith('where ') || p.startsWith('when ')) {
    return 'search';
  }

  // 10. Explaining concepts (default conversational education)
  if (/\b(explain|how does|what is|why does|intuition|break it down|walk me through|clarify)\b/i.test(p)) {
    return 'explain';
  }

  // Default fallback based on notebook context
  if (context?.isNotebook) {
    return 'notes';
  }
  return 'explain';
}

export interface AIPlanningCardProps {
  intent?: PlanningIntent;
  prompt?: string;
  context?: { hasDocuments?: boolean; hasImages?: boolean; isNotebook?: boolean };
  currentStep?: number; // 0 to 5
  className?: string;
  isComplete?: boolean;
}

export function AIPlanningCard({
  intent,
  prompt = '',
  context,
  currentStep: controlledStep,
  className = '',
  isComplete = false
}: AIPlanningCardProps) {
  const selectedIntent = intent || analyzePlanningIntent(prompt, context);
  const config = PLANNING_PRESETS[selectedIntent] || PLANNING_PRESETS.document;

  // Auto-progress simulated steps if not controlled externally
  const [internalStep, setInternalStep] = useState(0);

  useEffect(() => {
    if (controlledStep !== undefined) return;
    setInternalStep(0);
    const intervals = [1200, 1600, 2000, 2400];
    let step = 0;
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    intervals.forEach((delay, idx) => {
      const t = setTimeout(() => {
        step = idx + 1;
        setInternalStep(step);
      }, delay * (idx + 1) * 0.7);
      timers.push(t);
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [selectedIntent, controlledStep]);

  const activeStep = isComplete ? 5 : (controlledStep !== undefined ? controlledStep : internalStep);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`ai-planning-card ${className}`}
      style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '36px 38px',
        boxShadow: '0 20px 45px -12px rgba(15, 23, 42, 0.08), 0 4px 16px -2px rgba(15, 23, 42, 0.04)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        maxWidth: '460px',
        width: '100%',
        margin: '0 auto',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Title */}
      <h3
        style={{
          fontSize: '25px',
          fontWeight: 700,
          color: '#0f172a',
          textAlign: 'center',
          letterSpacing: '-0.025em',
          margin: '0 0 6px 0',
          lineHeight: 1.25
        }}
      >
        {config.title}
      </h3>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '14.5px',
          color: '#64748b',
          textAlign: 'center',
          margin: '0 0 32px 0',
          lineHeight: 1.5
        }}
      >
        {config.subtitle}
      </p>

      {/* Stepper Vertical Chain */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxWidth: '340px', margin: '0 auto' }}>
        {config.steps.map((stepName, idx) => {
          const isDone = activeStep > idx;
          const isActive = activeStep === idx;
          const isPending = activeStep < idx;
          const isLast = idx === config.steps.length - 1;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                position: 'relative',
                minHeight: isLast ? '32px' : '48px'
              }}
            >
              {/* Connector line to next node */}
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    left: '13px',
                    top: '26px',
                    width: '2px',
                    height: '24px',
                    background: isDone ? '#10b981' : '#e2e8f0',
                    transition: 'background 0.3s ease',
                    zIndex: 1
                  }}
                />
              )}

              {/* Indicator Circle */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 2,
                  transition: 'all 0.3s ease',
                  ...(isDone
                    ? {
                        background: '#10b981',
                        border: 'none',
                        color: '#ffffff'
                      }
                    : isActive
                    ? {
                        background: '#ffffff',
                        border: '2.5px solid #2563eb',
                        boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.12)'
                      }
                    : {
                        background: '#ffffff',
                        border: '2px solid #cbd5e1'
                      })
                }}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isActive ? (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#2563eb',
                      animation: 'pulse 1.8s infinite'
                    }}
                  />
                ) : null}
              </div>

              {/* Step Label */}
              <span
                style={{
                  fontSize: '15px',
                  lineHeight: 1.4,
                  transition: 'color 0.25s ease, font-weight 0.25s ease',
                  ...(isDone
                    ? {
                        color: '#1e293b',
                        fontWeight: 500
                      }
                    : isActive
                    ? {
                        color: '#0f172a',
                        fontWeight: 700
                      }
                    : {
                        color: '#94a3b8',
                        fontWeight: 400
                      })
                }}
              >
                {stepName}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default AIPlanningCard;
