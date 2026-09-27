import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

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
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.99 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`ai-planning-card ${className}`}
      style={{
        background: 'var(--plan-card-bg, #ffffff)',
        borderRadius: '18px',
        padding: '20px 22px',
        boxShadow: 'var(--plan-card-shadow, 0 12px 32px rgba(102, 80, 181, 0.12))',
        border: '1px solid var(--plan-card-border, #d8cfec)',
        backdropFilter: 'blur(20px)',
        maxWidth: '480px',
        width: '100%',
        margin: '0',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* Eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <Sparkles size={12} style={{ color: 'var(--plan-badge, #7c3aed)' }} />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: 'var(--plan-badge, #7c3aed)'
          }}
        >
          AI Study Planning
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 650,
          color: 'var(--plan-title, #0f172a)',
          letterSpacing: '-0.015em',
          margin: '0 0 4px 0',
          lineHeight: 1.35
        }}
      >
        {config.title}
      </h3>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '13px',
          color: 'var(--plan-subtitle, #475569)',
          margin: '0 0 16px 0',
          lineHeight: 1.5
        }}
      >
        {config.subtitle}
      </p>

      {/* Stepper Vertical Chain */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxWidth: '380px' }}>
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
                gap: '14px',
                position: 'relative',
                minHeight: isLast ? '28px' : '38px'
              }}
            >
              {/* Connector line to next node */}
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '22px',
                    width: '2px',
                    height: '18px',
                    background: isDone ? 'var(--plan-connector-done, #7c3aed)' : 'var(--plan-connector-pending, #e2e8f0)',
                    transition: 'background 0.3s ease',
                    zIndex: 1
                  }}
                />
              )}

              {/* Indicator Circle */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 2,
                  transition: 'all 0.3s ease',
                  ...(isDone
                    ? {
                        background: 'rgba(124, 58, 237, 0.15)',
                        border: '1.5px solid var(--plan-indicator-active, #7c3aed)',
                        color: 'var(--plan-indicator-active, #7c3aed)'
                      }
                    : isActive
                    ? {
                        background: 'rgba(124, 58, 237, 0.15)',
                        border: '2px solid var(--plan-indicator-active, #7c3aed)',
                        boxShadow: '0 0 12px rgba(124, 58, 237, 0.3)'
                      }
                    : {
                        background: 'transparent',
                        border: '1.5px solid var(--plan-connector-pending, #cbd5e1)'
                      })
                }}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isActive ? (
                  <div
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: 'var(--plan-indicator-active, #7c3aed)',
                      animation: 'pulse 1.8s infinite'
                    }}
                  />
                ) : null}
              </div>

              {/* Step Label */}
              <span
                style={{
                  fontSize: '13.5px',
                  lineHeight: 1.4,
                  transition: 'color 0.25s ease, font-weight 0.25s ease',
                  ...(isDone
                    ? {
                        color: 'var(--plan-step-done, #334155)',
                        fontWeight: 500
                      }
                    : isActive
                    ? {
                        color: 'var(--plan-step-active, #0f172a)',
                        fontWeight: 650
                      }
                    : {
                        color: 'var(--plan-step-pending, #94a3b8)',
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
