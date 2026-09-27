import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Zap, 
  GraduationCap, 
  Flame, 
  Headphones, 
  Check, 
  Settings2,
  X
} from 'lucide-react';
import { StudySettings } from '../../services/studyApi';

interface StudyNotebookWizardProps {
  defaultTopic: string;
  onGenerate: (topic: string, settings: Partial<StudySettings>) => void;
  isGenerating?: boolean;
}

export function StudyNotebookWizard({
  defaultTopic,
  onGenerate,
  isGenerating = false,
}: StudyNotebookWizardProps) {
  // Step 0: prompt, Step 1: depth, Step 2: focus, Step 3: difficulty, Step 4: verify
  const [step, setStep] = useState<'prompt' | 'q1_depth' | 'q2_focus' | 'q3_difficulty' | 'verify' | 'dismissed'>('prompt');
  const [topic, setTopic] = useState(defaultTopic || 'DSA Study Guide');
  const [isEditingTopic, setIsEditingTopic] = useState(false);

  // Question 1: Depth (Pages / Cards / Questions)
  const [depthOption, setDepthOption] = useState<{
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    sections: string;
    cardCount: number;
    questionCount: number;
  }>({
    id: 'standard',
    title: 'Comprehensive Study Pack',
    subtitle: '6-8 structured sections · 10 Flashcards · 5 Quiz Questions',
    badge: 'Recommended',
    sections: '6-8 sections',
    cardCount: 10,
    questionCount: 5,
  });

  // Question 2: Specific Additions & Key Focus
  const [focusOption, setFocusOption] = useState<{
    id: string;
    title: string;
    subtitle: string;
    badge?: string;
  }>({
    id: 'interview_patterns',
    title: 'Interview & Problem-Solving Patterns',
    subtitle: 'High-yield patterns, algorithmic paradigms, and interview tips',
    badge: 'Popular',
  });

  // Question 3: Challenge Level / Difficulty
  const [difficultyOption, setDifficultyOption] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  if (step === 'dismissed') {
    return (
      <div className="mt-3 flex items-center justify-start">
        <button
          type="button"
          onClick={() => setStep('prompt')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 transition-all cursor-pointer"
        >
          <BookOpen size={13} />
          <span>Create Study Notebook for this topic</span>
        </button>
      </div>
    );
  }

  const depthChoices = [
    {
      id: 'quick',
      icon: Zap,
      title: 'Quick Revision & Cheat Sheet',
      subtitle: '3-4 concise sections · 5 Flashcards · 3 Quiz Qs',
      badge: 'Fast (~3m)',
      sections: '3-4 sections',
      cardCount: 5,
      questionCount: 3,
    },
    {
      id: 'standard',
      icon: Sparkles,
      title: 'Comprehensive Study Pack',
      subtitle: '6-8 structured sections · 10 Flashcards · 5 Quiz Qs',
      badge: 'Recommended',
      sections: '6-8 sections',
      cardCount: 10,
      questionCount: 5,
    },
    {
      id: 'master',
      icon: GraduationCap,
      title: 'Exam Cram & Master Curriculum',
      subtitle: '10+ in-depth sections · 16 Flashcards · 10 Quiz Qs',
      badge: 'Deep Dive',
      sections: '10+ sections',
      cardCount: 16,
      questionCount: 10,
    },
  ];

  const focusChoices = [
    {
      id: 'foundations',
      icon: BookOpen,
      title: 'Core Concepts & Clear Explanations',
      subtitle: 'Intuitive analogies, foundational proofs, and zero jargon',
    },
    {
      id: 'interview_patterns',
      icon: Flame,
      title: 'Interview & Problem-Solving Patterns',
      subtitle: 'High-yield patterns, common pitfalls, and code solutions',
      badge: 'Top Pick',
    },
    {
      id: 'all_in_one_audio',
      icon: Headphones,
      title: 'Full Study Suite + Audio Podcast',
      subtitle: 'Complete notes, flashcards, quiz, and 2-host audio recap',
      badge: 'Multimodal',
    },
  ];

  const difficultyChoices: {
    id: 'beginner' | 'intermediate' | 'advanced';
    title: string;
    subtitle: string;
    badge: string;
  }[] = [
    {
      id: 'beginner',
      title: 'Beginner Friendly',
      subtitle: 'Step-by-step guidance, gentle learning curve, clear terminology',
      badge: 'Foundations',
    },
    {
      id: 'intermediate',
      title: 'Intermediate / Interview Ready',
      subtitle: 'Standard college & tech interview benchmarks, practical rigor',
      badge: 'Standard',
    },
    {
      id: 'advanced',
      title: 'Advanced Mastery',
      subtitle: 'Deep edge cases, complexity analysis, and challenging questions',
      badge: 'Challenging',
    },
  ];

  const handleSubmit = () => {
    const enrichedTopic = `${topic.trim()} - Focus: ${focusOption.title}`;
    onGenerate(enrichedTopic, {
      cardCount: depthOption.cardCount,
      questionCount: depthOption.questionCount,
      difficulty: difficultyOption,
      language: 'English',
    });
  };

  return (
    <div className="study-wizard-container">
      <AnimatePresence mode="wait">
        {/* =========================================================================
            STATE 0: INITIAL QUESTION PROMPT
            "Can I create a notebook for you for studying purposes?"
           ========================================================================= */}
        {step === 'prompt' && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="study-wizard-card"
          >
            <div className="wizard-header">
              <div className="wizard-header-main">
                <div className="wizard-icon-box">
                  <BookOpen size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="wizard-eyebrow">Blast Study Suite</span>
                    <span className="wizard-pill-ready">
                      <Sparkles size={11} />
                      Ready
                    </span>
                  </div>
                  <h4 className="wizard-title">
                    Can I create a notebook for you for studying purposes?
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('dismissed')}
                className="wizard-dismiss-btn"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>

            <p className="wizard-body-text">
              Transform this discussion into a full interactive study set with <strong>structured notes</strong>, <strong>active recall flashcards</strong>, <strong>practice quiz</strong>, and an <strong>audio podcast recap</strong>.
            </p>

            <div className="wizard-actions">
              <button
                type="button"
                onClick={() => setStep('q1_depth')}
                className="wizard-btn-primary"
              >
                <Sparkles size={14} />
                <span>Yes, Customize My Notebook</span>
                <ArrowRight size={13} />
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isGenerating}
                className="wizard-btn-secondary"
              >
                <Zap size={14} style={{ color: '#c4adfc' }} />
                <span>Quick 1-Click Build</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            QUESTION 1: HOW MANY PAGES & QUIZ CARDS IN THE NOTES? (3 CHOICES)
           ========================================================================= */}
        {step === 'q1_depth' && (
          <motion.div
            key="q1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="study-wizard-card"
          >
            <div className="wizard-stepper-bar">
              <div className="wizard-step-indicator">
                <span className="wizard-step-num">1</span>
                <span>Question 1 of 3 · Pages & Cards</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('prompt')}
                className="wizard-btn-back"
              >
                <ArrowLeft size={13} /> Back
              </button>
            </div>

            <h4 className="wizard-question-title">
              How many pages & quiz cards in your notes?
            </h4>
            <p className="wizard-question-sub">
              Choose the depth and volume of material for your study pack:
            </p>

            <div className="wizard-choice-list">
              {depthChoices.map((choice) => {
                const isSelected = depthOption.id === choice.id;
                const Icon = choice.icon;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => {
                      setDepthOption(choice);
                      setStep('q2_focus');
                    }}
                    className={`wizard-choice-btn ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="wizard-choice-left">
                      <div className="wizard-choice-icon-wrap">
                        <Icon size={17} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="wizard-choice-label">{choice.title}</span>
                          <span className="wizard-choice-badge">{choice.badge}</span>
                        </div>
                        <p className="wizard-choice-desc">{choice.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight size={15} className="wizard-choice-arrow" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            QUESTION 2: WHAT ARE THE THINGS THAT NEED TO BE ADDED? (3 CHOICES)
           ========================================================================= */}
        {step === 'q2_focus' && (
          <motion.div
            key="q2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="study-wizard-card"
          >
            <div className="wizard-stepper-bar">
              <div className="wizard-step-indicator">
                <span className="wizard-step-num">2</span>
                <span>Question 2 of 3 · What to Add</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('q1_depth')}
                className="wizard-btn-back"
              >
                <ArrowLeft size={13} /> Back
              </button>
            </div>

            <h4 className="wizard-question-title">
              What are the specific things that need to be added?
            </h4>
            <p className="wizard-question-sub">
              Select the primary angle and components Blast should prioritize:
            </p>

            <div className="wizard-choice-list">
              {focusChoices.map((choice) => {
                const isSelected = focusOption.id === choice.id;
                const Icon = choice.icon;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => {
                      setFocusOption(choice);
                      setStep('q3_difficulty');
                    }}
                    className={`wizard-choice-btn ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="wizard-choice-left">
                      <div className="wizard-choice-icon-wrap">
                        <Icon size={17} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="wizard-choice-label">{choice.title}</span>
                          {choice.badge && (
                            <span className="wizard-choice-badge emerald">{choice.badge}</span>
                          )}
                        </div>
                        <p className="wizard-choice-desc">{choice.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight size={15} className="wizard-choice-arrow" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            QUESTION 3: DIFFICULTY / CHALLENGE LEVEL (3 CHOICES)
           ========================================================================= */}
        {step === 'q3_difficulty' && (
          <motion.div
            key="q3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="study-wizard-card"
          >
            <div className="wizard-stepper-bar">
              <div className="wizard-step-indicator">
                <span className="wizard-step-num">3</span>
                <span>Question 3 of 3 · Challenge Level</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('q2_focus')}
                className="wizard-btn-back"
              >
                <ArrowLeft size={13} /> Back
              </button>
            </div>

            <h4 className="wizard-question-title">
              Select your target challenge level:
            </h4>
            <p className="wizard-question-sub">
              Calibrates the practice quiz rigor and active-recall flashcard depth:
            </p>

            <div className="wizard-choice-list">
              {difficultyChoices.map((choice) => {
                const isSelected = difficultyOption === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => {
                      setDifficultyOption(choice.id);
                      setStep('verify');
                    }}
                    className={`wizard-choice-btn ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="wizard-choice-left">
                      <div className="wizard-choice-icon-wrap">
                        <GraduationCap size={17} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="wizard-choice-label">{choice.title}</span>
                          <span className="wizard-choice-badge">{choice.badge}</span>
                        </div>
                        <p className="wizard-choice-desc">{choice.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight size={15} className="wizard-choice-arrow" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            STATE 4: VERIFICATION & SUMMARY BEFORE SUBMISSION
            "Verify the questions and the answer... after that click Submit."
           ========================================================================= */}
        {step === 'verify' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="study-wizard-card"
          >
            <div className="wizard-stepper-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} style={{ color: '#34d399' }} />
                <span className="wizard-step-indicator" style={{ color: '#e9d5ff' }}>
                  Verify Study Specification
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep('q3_difficulty')}
                className="wizard-btn-back"
              >
                <ArrowLeft size={13} /> Edit Answers
              </button>
            </div>

            <h4 className="wizard-question-title" style={{ fontSize: '17px' }}>
              Verify questions and answers before generating
            </h4>
            <p className="wizard-question-sub">
              Review your study pack configuration below, then click Submit to build your notebook:
            </p>

            {/* Verification Table */}
            <div className="wizard-verify-card">
              <div className="wizard-verify-row">
                <span className="wizard-verify-label">Notebook Topic:</span>
                {isEditingTopic ? (
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onBlur={() => setIsEditingTopic(false)}
                    autoFocus
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#1e1b2e',
                      border: '1px solid #a855f7',
                      color: '#ffffff',
                      fontSize: '12px',
                      maxWidth: '260px',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="wizard-verify-val">{topic}</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingTopic(true)}
                      style={{
                        fontSize: '11px',
                        color: '#c084fc',
                        background: 'transparent',
                        border: 'none',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      edit
                    </button>
                  </div>
                )}
              </div>

              <div className="wizard-verify-row">
                <span className="wizard-verify-label">Pages & Notes Depth:</span>
                <span className="wizard-choice-badge" style={{ margin: 0 }}>
                  {depthOption.title} ({depthOption.sections})
                </span>
              </div>

              <div className="wizard-verify-row">
                <span className="wizard-verify-label">Cards & Practice Quiz:</span>
                <span className="wizard-choice-badge emerald" style={{ margin: 0 }}>
                  {depthOption.cardCount} Flashcards · {depthOption.questionCount} Quiz Questions
                </span>
              </div>

              <div className="wizard-verify-row">
                <span className="wizard-verify-label">Things Added:</span>
                <span className="wizard-verify-val">{focusOption.title}</span>
              </div>

              <div className="wizard-verify-row">
                <span className="wizard-verify-label">Challenge Level:</span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 750,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: 'rgba(245, 158, 11, 0.16)',
                    color: '#fcd34d',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  {difficultyOption}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={() => setStep('q1_depth')}
                className="wizard-btn-secondary"
              >
                Change Options
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isGenerating}
                className="wizard-btn-primary"
                style={{ padding: '11px 24px', fontSize: '13.5px' }}
              >
                <Sparkles size={16} />
                <span>Submit & Create Notebook</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StudyNotebookWizard;
