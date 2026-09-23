import React, { useState, useEffect } from 'react';
import { router } from '../../services/router.js';
import { BlastMascot } from './BlastMascot.js';
import { getStudyPack, fetchStudyPack, saveStudyPack } from '../../services/turboApi.js';
import { TurboStudyPack, TurboRoadmapMilestone, TurboRoadmapStage } from '../../types/turbo.js';
import {
  Check,
  Lock,
  Star,
  Settings,
  Sparkles,
  BookOpen,
  FileText,
  Award,
  Layers,
  Headphones,
  FolderGit2,
  X,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Loader2
} from 'lucide-react';

interface LearnRoadmapViewProps {
  noteId?: string;
  topicTitle?: string;
  onOpenUpgrade?: () => void;
  onOpenEmma?: () => void;
}

export const LearnRoadmapView: React.FC<LearnRoadmapViewProps> = ({
  noteId = 'current',
  topicTitle = 'How to learn Java',
  onOpenUpgrade,
  onOpenEmma
}) => {
  const [studyPack, setStudyPack] = useState<TurboStudyPack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<{
    stageIndex: number;
    milestoneIndex: number;
    milestone: TurboRoadmapMilestone;
  } | null>(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

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
  const stages: TurboRoadmapStage[] = studyPack?.roadmap?.stages || [
    {
      id: 'stage-1',
      stageName: 'Stage 1: Core Fundamentals',
      description: 'Foundational syntax, execution models, and core mechanics.',
      progressPercent: 33,
      milestones: [
        {
          id: 'm-1',
          title: `Getting Started with ${activeTitle}`,
          duration: '45 mins',
          completed: true,
          keyConcepts: ['Syntax', 'Environment', 'Primitives'],
          tasks: ['Understand main program structure', 'Write first working script']
        },
        {
          id: 'm-2',
          title: 'Memory Management & Control Flow',
          duration: '1 hr',
          completed: false,
          keyConcepts: ['Stack & Heap', 'Conditionals', 'Loops'],
          tasks: ['Trace pointer references', 'Implement defensive assertions']
        }
      ]
    },
    {
      id: 'stage-2',
      stageName: 'Stage 2: Applied Architecture & Patterns',
      description: 'Intermediate paradigms, data modeling, and performance tuning.',
      progressPercent: 0,
      milestones: [
        {
          id: 'm-3',
          title: 'Data Structures & Object Modeling',
          duration: '1.5 hrs',
          completed: false,
          keyConcepts: ['Classes', 'Interfaces', 'Generics'],
          tasks: ['Model domain hierarchy', 'Benchmark collection lookups']
        },
        {
          id: 'm-4',
          title: 'Error Handling & Concurrency Essentials',
          duration: '2 hrs',
          completed: false,
          keyConcepts: ['Exceptions', 'Threads', 'Safety'],
          tasks: ['Write unit tests for edge cases', 'Prevent race conditions']
        }
      ]
    }
  ];

  const handleMilestoneClick = (stageIndex: number, milestoneIndex: number, milestone: TurboRoadmapMilestone) => {
    setSelectedMilestone({ stageIndex, milestoneIndex, milestone });
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
  };

  const handleCompleteMilestone = () => {
    if (!studyPack || !selectedMilestone) return;
    const updated = { ...studyPack };
    const target = updated.roadmap.stages[selectedMilestone.stageIndex]?.milestones[selectedMilestone.milestoneIndex];
    if (target) {
      target.completed = true;
    }
    setStudyPack(updated);
    saveStudyPack(updated);
    setSelectedMilestone(null);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col font-body select-none">
      {/* Top Header */}
      <header className="h-14 px-6 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.navigate('/dashboard')}>
            <img
              src="/blast-logo.png"
              alt="Blast AI"
              className="w-7 h-7 rounded-lg object-contain shadow-sm shadow-orange-500/30 bg-[#181824] p-0.5 border border-orange-500/20"
            />
            <span className="font-headline font-bold text-sm tracking-tight flex items-center gap-1">
              <span>blast</span>
              <span className="text-[#FF5E00]">ai</span>
            </span>
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

          <button
            onClick={() => router.navigate('/signup')}
            className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-purple-500/30"
          >
            S
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-20 bg-[var(--color-bg)] border-r border-[var(--color-border)] flex flex-col items-center py-6 space-y-6 shrink-0">
          <button
            onClick={() => router.navigate(`/notes/${noteId}`)}
            className="flex flex-col items-center gap-1.5 text-purple-400 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">Learn</span>
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
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover)] flex items-center justify-center">
              <Award size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Quiz</span>
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

        {/* Roadmap Stages & Milestones */}
        <main className="flex-1 overflow-y-auto px-8 py-10 flex flex-col items-center">
          <div className="max-w-2xl w-full space-y-8">
            {/* Header Card */}
            <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-purple-400 font-bold mb-1">
                    <span>⚡ ACTIVE STUDY ROADMAP</span>
                  </div>
                  <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
                    {activeTitle}
                  </h1>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
                    Interactive step-by-step mastery curriculum with milestones, verification tasks, and active recall.
                  </p>
                </div>
                <BlastMascot size="md" state={selectedMilestone ? 'excited' : 'idle'} />
              </div>

              {isLoading && (
                <div className="mt-4 flex items-center gap-2 text-xs text-purple-400">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Synthesizing roadmap checkpoints with Bedrock AI...</span>
                </div>
              )}
            </div>

            {/* Stages Flow */}
            <div className="space-y-6">
              {stages.map((stage, stageIdx) => (
                <div key={stage.id || stageIdx} className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="font-headline font-bold text-sm text-[var(--color-text)]">
                      {stage.stageName}
                    </h2>
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      {stage.milestones.filter((m) => m.completed).length} / {stage.milestones.length} completed
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {stage.milestones.map((m, mIdx) => {
                      const isCompleted = m.completed;
                      const isNext = !isCompleted && (mIdx === 0 || stage.milestones[mIdx - 1]?.completed);

                      return (
                        <div
                          key={m.id || mIdx}
                          onClick={() => handleMilestoneClick(stageIdx, mIdx, m)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                            isCompleted
                              ? 'bg-purple-950/10 border-purple-500/30 hover:border-purple-500/50'
                              : isNext
                              ? 'bg-[var(--color-surface)] border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 ring-1 ring-purple-500/30'
                              : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-subtle)] opacity-75'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-105 ${
                                isCompleted
                                  ? 'bg-emerald-500 text-black'
                                  : isNext
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-[var(--color-bg-alt)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                              }`}
                            >
                              {isCompleted ? <Check size={16} /> : mIdx + 1}
                            </div>

                            <div>
                              <h3 className="font-headline font-bold text-xs text-[var(--color-text)] group-hover:text-purple-400 transition-colors">
                                {m.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--color-text-muted)]">
                                <span>⏱ {m.duration || '30 mins'}</span>
                                {m.keyConcepts && m.keyConcepts.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-purple-400 font-medium">
                                      {m.keyConcepts.slice(0, 3).join(', ')}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Mastered
                              </span>
                            ) : isNext ? (
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-600 text-white flex items-center gap-1 shadow-sm">
                                <span>Start</span>
                                <ArrowRight size={10} />
                              </span>
                            ) : (
                              <Lock size={14} className="text-zinc-500 mr-2" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Interactive Step Milestone Player Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  Milestone Checkpoint
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {selectedMilestone.milestone.duration}
                </span>
              </div>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <h2 className="font-headline font-bold text-lg text-[var(--color-text)]">
                {selectedMilestone.milestone.title}
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Complete the study tasks and comprehension question below to verify recall.
              </p>
            </div>

            {/* Key Concepts */}
            {selectedMilestone.milestone.keyConcepts && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Key Concepts
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMilestone.milestone.keyConcepts.map((concept, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-xs text-purple-300 font-medium"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks / Verification Checklist */}
            {selectedMilestone.milestone.tasks && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  Action Checklist
                </div>
                <div className="space-y-1.5 text-xs text-[var(--color-text)]">
                  {selectedMilestone.milestone.tasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
                      <CheckCircle2 size={14} className="text-purple-400 shrink-0 mt-0.5" />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Comprehension Check */}
            <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <HelpCircle size={14} />
                <span>Comprehension Check</span>
              </div>
              <p className="text-xs text-[var(--color-text)]">
                Which best describes the primary objective of this milestone?
              </p>

              <div className="space-y-1.5">
                {['Master core invariants and execution guarantees', 'Skip error cases and rely on default behavior'].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedQuizAnswer(i);
                      setQuizSubmitted(true);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs border transition-all ${
                      selectedQuizAnswer === i
                        ? i === 0
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                          : 'bg-rose-500/20 border-rose-500 text-rose-200'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-purple-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {quizSubmitted && (
                <div className="text-[11px] text-emerald-400 font-medium">
                  {selectedQuizAnswer === 0 ? '✓ Correct! You are ready to mark this completed.' : '⚠ Re-read the key concepts above.'}
                </div>
              )}
            </div>

            <button
              onClick={handleCompleteMilestone}
              className="w-full py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all"
            >
              Mark Milestone Complete (+25 XP)
            </button>
          </div>
        </div>
      )}

      {/* Floating Ask Emma AI Button */}
      <button
        onClick={onOpenEmma || (() => router.navigate(`/notes/${noteId}/editor`))}
        className="fixed right-6 bottom-8 py-2 px-3.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl text-xs font-bold text-[var(--color-text)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all z-40"
      >
        <BlastMascot size="xs" state="speaking" />
        <span>Ask Blast AI</span>
      </button>
    </div>
  );
};
export default LearnRoadmapView;
