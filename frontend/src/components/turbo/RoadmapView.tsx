import React, { useState } from 'react';
import { TurboRoadmap } from '../../types/turbo.js';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { BlastMascot } from './BlastMascot.js';

interface RoadmapViewProps {
  roadmap: TurboRoadmap | null;
  isLoading: boolean;
  onStartLesson: () => void;
  onOpenEmmaWithPrompt: (prompt: string) => void;
  onToggleMilestone: (stageId: string, milestoneId: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  roadmap,
  isLoading,
  onStartLesson,
  onOpenEmmaWithPrompt,
  onToggleMilestone
}) => {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin mb-4" />
        <h3 className="text-white font-semibold text-sm">Generating Personalized Roadmap...</h3>
        <p className="text-zinc-400 text-xs mt-1">Emma is analyzing your study topics and structuring your milestone path.</p>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="p-4 rounded-2xl bg-[#1A1A28] border border-[#2D2D42] mb-4">
          <Layers size={32} className="text-purple-400" />
        </div>
        <h3 className="text-white font-semibold text-base">No Roadmap Loaded</h3>
        <p className="text-zinc-400 text-xs mt-1 max-w-sm">
          Select or enter a study topic above to generate a tailored mastery roadmap.
        </p>
      </div>
    );
  }

  const completedCount = roadmap.stages.reduce((acc, stage) => {
    return acc + stage.milestones.filter((m) => m.completed).length;
  }, 0);

  const totalCount = roadmap.stages.reduce((acc, stage) => acc + stage.milestones.length, 0);
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161624] via-[#13131C] to-[#0E0E14] border border-[#2A2A3E] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">
                Turbo Study Plan
              </span>
              <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                <Calendar size={13} className="text-purple-400" />
                <span>Target: {roadmap.examDate || 'Upcoming Exam'}</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{roadmap.topic}</h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">{roadmap.targetGoal}</p>
          </div>

          <div className="flex items-center gap-4 bg-[#1A1A28] border border-[#2D2D42] p-4 rounded-xl shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Mastery Level</div>
              <div className="text-2xl font-black text-purple-400 flex items-center gap-1 justify-end">
                <TrendingUp size={18} />
                <span>{progressPercent}%</span>
              </div>
              <div className="text-[11px] text-zinc-400">{completedCount} of {totalCount} completed</div>
            </div>

            <div className="w-16 h-16 relative flex items-center justify-center">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-purple-500 transition-all duration-700"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <Award size={18} className="text-purple-400 absolute" />
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#26263A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BlastMascot size="xs" state="speaking" />
            <span className="text-xs text-zinc-300">
              Blast's tip: Complete checkpoints consecutively to activate high-retention spaced repetition!
            </span>
          </div>

          <button
            onClick={onStartLesson}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
          >
            <Sparkles size={13} />
            <span>Launch Checkpoint Practice</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {roadmap.stages.map((stage, stageIndex) => {
          const isStageFinished = stage.milestones.every((m) => m.completed);
          return (
            <div
              key={stage.id || `stage-${stageIndex}`}
              className="rounded-2xl bg-[#111118] border border-[#232332] overflow-hidden"
            >
              <div className="p-4 bg-[#161622] border-b border-[#232332] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isStageFinished
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    }`}
                  >
                    {isStageFinished ? <CheckCircle2 size={16} /> : stageIndex + 1}
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-sm tracking-wide">{stage.stageName}</h2>
                    <p className="text-[11px] text-zinc-400">{stage.description}</p>
                  </div>
                </div>

                <div className="text-[11px] font-medium text-zinc-400">
                  {stage.milestones.filter((m) => m.completed).length} / {stage.milestones.length} Tasks
                </div>
              </div>

              <div className="p-4 space-y-3">
                {stage.milestones.map((milestone) => {
                  const isSelected = selectedMilestoneId === milestone.id;
                  return (
                    <div
                      key={milestone.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        milestone.completed
                          ? 'bg-[#151520]/60 border-[#222230] opacity-80'
                          : isSelected
                          ? 'bg-purple-950/20 border-purple-500/50 shadow-md shadow-purple-500/5'
                          : 'bg-[#151522] border-[#262638] hover:border-[#383850]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => onToggleMilestone(stage.id, milestone.id)}
                            className="mt-0.5 text-zinc-500 hover:text-purple-400 transition-colors"
                          >
                            {milestone.completed ? (
                              <CheckCircle2 size={18} className="text-emerald-400 fill-emerald-500/20" />
                            ) : (
                              <Circle size={18} className="text-zinc-600 hover:text-purple-400" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-semibold ${
                                  milestone.completed ? 'line-through text-zinc-400' : 'text-zinc-100'
                                }`}
                              >
                                {milestone.title}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-[#1F1F2E] px-1.5 py-0.5 rounded">
                                <Clock size={11} />
                                <span>{milestone.duration}</span>
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {milestone.keyConcepts.map((concept, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20"
                                >
                                  {concept}
                                </span>
                              ))}
                            </div>

                            {milestone.tasks && milestone.tasks.length > 0 && (
                              <ul className="mt-2.5 space-y-1 pl-4 border-l-2 border-[#28283C]">
                                {milestone.tasks.map((task, tIdx) => (
                                  <li key={tIdx} className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-purple-400" />
                                    <span>{task}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() =>
                              onOpenEmmaWithPrompt(
                                `Hi Emma! Can you explain the key concepts and exam strategies for the milestone "${milestone.title}" in our ${roadmap.topic} study plan?`
                              )
                            }
                            className="p-1.5 rounded-lg bg-[#1F1F30] hover:bg-purple-600/30 text-purple-300 border border-purple-500/20 text-xs transition-colors"
                            title="Ask Emma about this milestone"
                          >
                            <Sparkles size={13} />
                          </button>
                          <button
                            onClick={onStartLesson}
                            className="p-1.5 rounded-lg bg-[#1F1F30] hover:bg-[#28283E] text-zinc-300 text-xs transition-colors"
                            title="Start Practice"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
