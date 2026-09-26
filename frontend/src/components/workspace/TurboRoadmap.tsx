import React, { useState } from 'react';
import { Check, CheckCircle2, Lock, Star, Trophy, ArrowRight, Settings, Compass, Sparkles, Play } from 'lucide-react';
import { TurboStudyPack } from '../../types/turbo';

interface TurboRoadmapProps {
  pack: TurboStudyPack;
  onToggleMilestone: (stageIndex: number, milestoneIndex: number) => Promise<void>;
  onNavigateToNotes: (sectionIndex?: number) => void;
  onNavigateToQuiz: () => void;
  notify?: (msg: string) => void;
}

interface FlatNode {
  type: 'milestone' | 'checkpoint' | 'final-quiz';
  stageIndex: number;
  milestoneIndex: number;
  id: string;
  stepNumber: number;
  title: string;
  subtitle?: string;
  duration?: string;
  pages?: number;
  completed: boolean;
  isCurrent: boolean;
  isLocked: boolean;
}

export const TurboRoadmap: React.FC<TurboRoadmapProps> = ({
  pack,
  onToggleMilestone,
  onNavigateToNotes,
  onNavigateToQuiz,
  notify
}) => {
  const stages = pack.roadmap?.stages || [];
  
  // Flatten milestones into a sequenced linear curriculum with checkpoints
  const flatNodes: FlatNode[] = [];
  let stepCounter = 1;
  let hasFoundCurrent = false;

  stages.forEach((stage, sIdx) => {
    stage.milestones.forEach((m, mIdx) => {
      const isCompleted = !!m.completed;
      const isCurrent = !isCompleted && !hasFoundCurrent;
      if (isCurrent) hasFoundCurrent = true;
      const isLocked = !isCompleted && !isCurrent;

      flatNodes.push({
        type: 'milestone',
        stageIndex: sIdx,
        milestoneIndex: mIdx,
        id: m.id || `m_${sIdx}_${mIdx}`,
        stepNumber: stepCounter++,
        title: m.title,
        subtitle: m.tasks?.[0] || 'Core concepts and structured pattern drills',
        duration: m.duration || '15 min',
        pages: Math.max(3, Math.min(8, (m.keyConcepts?.length || 2) * 2)),
        completed: isCompleted,
        isCurrent,
        isLocked
      });
    });

    // Insert an intermediate Checkpoint star if there are multiple stages
    if (sIdx < stages.length - 1 && stage.milestones.length > 0) {
      const allPrevCompleted = stage.milestones.every(m => m.completed);
      flatNodes.push({
        type: 'checkpoint',
        stageIndex: sIdx,
        milestoneIndex: -1,
        id: `cp_${sIdx}`,
        stepNumber: stepCounter++,
        title: `Checkpoint: ${stage.stageName.replace(/^Stage \d+:\s*/i, '')}`,
        completed: allPrevCompleted,
        isCurrent: false,
        isLocked: !allPrevCompleted
      });
    }
  });

  // Final Quiz node at the end
  const allMilestonesCompleted = flatNodes.filter(n => n.type === 'milestone').every(n => n.completed);
  flatNodes.push({
    type: 'final-quiz',
    stageIndex: -1,
    milestoneIndex: -1,
    id: 'final_quiz_node',
    stepNumber: stepCounter,
    title: 'Final Quiz & Concept Mastery',
    completed: false,
    isCurrent: allMilestonesCompleted,
    isLocked: !allMilestonesCompleted
  });

  // Calculate overall stats
  const milestoneNodes = flatNodes.filter(n => n.type === 'milestone');
  const completedCount = milestoneNodes.filter(n => n.completed).length;
  const totalCount = milestoneNodes.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Active or Up Next node
  const activeNode = flatNodes.find(n => n.isCurrent) || flatNodes.find(n => !n.completed) || flatNodes[0];

  const handleNodeClick = (node: FlatNode) => {
    if (node.type === 'final-quiz') {
      onNavigateToQuiz();
      return;
    }
    if (node.type === 'checkpoint') {
      onNavigateToQuiz();
      return;
    }
    if (node.completed || node.isCurrent) {
      onNavigateToNotes(node.milestoneIndex);
    } else {
      // Toggle or inform user
      onToggleMilestone(node.stageIndex, node.milestoneIndex);
    }
  };

  return (
    <div className="turbo-roadmap-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Top Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '28px' }}>
        <span style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>Home</span>
        <span>›</span>
        <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
          Roadmap: {pack.topic}
        </span>
      </div>

      {/* Hero 3D Card matching Turbo AI Image 2 */}
      <div
        className="turbo-roadmap-hero"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          background: 'linear-gradient(135deg, rgba(20, 22, 33, 0.8) 0%, rgba(13, 14, 21, 0.95) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          borderRadius: '20px',
          padding: '28px 36px',
          marginBottom: '36px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Glow ambient background */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* 3D Server Platform Illustration */}
        <div style={{ flexShrink: 0, width: '130px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Isometric Platform */}
            <polygon points="60,15 110,40 60,65 10,40" fill="#1b2138" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" />
            <polygon points="10,40 60,65 60,78 10,53" fill="#111627" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.3" />
            <polygon points="110,40 60,65 60,78 110,53" fill="#161c31" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.3" />
            
            {/* Server Rack 1 (Isometric Box) */}
            <g transform="translate(38, 12)">
              <polygon points="22,0 44,11 22,22 0,11" fill="#4f46e5" fillOpacity="0.8" stroke="#818cf8" strokeWidth="1" />
              <polygon points="0,11 22,22 22,50 0,39" fill="#312e81" stroke="#6366f1" strokeWidth="1" />
              <polygon points="44,11 22,22 22,50 44,39" fill="#3730a3" stroke="#6366f1" strokeWidth="1" />
              {/* Server rack LEDs */}
              <circle cx="6" cy="20" r="1.5" fill="#38bdf8" />
              <circle cx="12" cy="23" r="1.5" fill="#38bdf8" />
              <circle cx="6" cy="29" r="1.5" fill="#34d399" />
              <circle cx="12" cy="32" r="1.5" fill="#38bdf8" />
              <circle cx="6" cy="38" r="1.5" fill="#c084fc" />
              <circle cx="12" cy="41" r="1.5" fill="#38bdf8" />
            </g>
            {/* Server Rack Side Modules */}
            <g transform="translate(18, 26)">
              <polygon points="14,0 28,7 14,14 0,7" fill="#2563eb" fillOpacity="0.7" stroke="#60a5fa" strokeWidth="0.8" />
              <polygon points="0,7 14,14 14,32 0,25" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="0.8" />
              <polygon points="28,7 14,14 14,32 28,25" fill="#1d4ed8" stroke="#3b82f6" strokeWidth="0.8" />
              <circle cx="4" cy="14" r="1" fill="#38bdf8" />
              <circle cx="4" cy="20" r="1" fill="#34d399" />
            </g>
            <g transform="translate(68, 28)">
              <polygon points="14,0 28,7 14,14 0,7" fill="#7c3aed" fillOpacity="0.7" stroke="#a78bfa" strokeWidth="0.8" />
              <polygon points="0,7 14,14 14,30 0,23" fill="#4c1d95" stroke="#8b5cf6" strokeWidth="0.8" />
              <polygon points="28,7 14,14 14,30 28,23" fill="#5b21b6" stroke="#8b5cf6" strokeWidth="0.8" />
              <circle cx="22" cy="16" r="1" fill="#38bdf8" />
              <circle cx="22" cy="22" r="1" fill="#a855f7" />
            </g>
          </svg>
        </div>

        {/* Hero Details */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f3f4f6', margin: '0 0 14px 0', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            Roadmap: {pack.topic}
          </h1>

          {/* Progress Bar with Percentage */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <div
              style={{
                flex: 1,
                maxWidth: '340px',
                height: '7px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${Math.max(5, progressPercent)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%)',
                  borderRadius: '8px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
              {progressPercent}%
            </span>
          </div>

          {/* Continue Button + Up Next Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <button
              type="button"
              onClick={() => {
                if (activeNode) handleNodeClick(activeNode);
                else onNavigateToNotes();
              }}
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <span>{completedCount === 0 ? 'Start Learning' : 'Continue'}</span>
            </button>

            {activeNode && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
                  UP NEXT
                </span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeNode.title}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contents Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', padding: '0 4px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f3f4f6', margin: 0 }}>
          Contents
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
          <span>{completedCount} of {totalCount} complete</span>
          <button
            type="button"
            aria-label="Roadmap settings"
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      {/* Vertical Spine Timeline matching Image 2 */}
      <div className="turbo-timeline-list" style={{ position: 'relative', paddingLeft: '28px' }}>
        {/* Continuous Vertical Spine Line */}
        <div
          style={{
            position: 'absolute',
            left: '42px',
            top: '24px',
            bottom: '40px',
            width: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            zIndex: 1
          }}
        />

        {flatNodes.map((node) => {
          const isCheck = node.completed;
          const isActive = node.isCurrent;

          if (node.type === 'checkpoint') {
            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  margin: '18px 0',
                  cursor: 'pointer'
                }}
              >
                {/* Node circle: Star */}
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: isCheck ? '#10b981' : '#1e2230',
                    border: '2px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCheck ? '#ffffff' : 'rgba(255,255,255,0.5)',
                    flexShrink: 0
                  }}
                >
                  <Star size={14} fill={isCheck ? 'currentColor' : 'none'} />
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                    {node.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                    <span>Checkpoint</span>
                    <Lock size={12} />
                  </div>
                </div>
              </div>
            );
          }

          if (node.type === 'final-quiz') {
            return (
              <div
                key={node.id}
                onClick={() => onNavigateToQuiz()}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  margin: '20px 0',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: isCheck ? '#10b981' : '#1e2230',
                    border: '2px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCheck ? '#ffffff' : 'rgba(255,255,255,0.5)',
                    flexShrink: 0
                  }}
                >
                  <Star size={14} fill="currentColor" />
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                    Final Quiz
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                    <span>Checkpoint</span>
                    <Lock size={12} />
                  </div>
                </div>
              </div>
            );
          }

          // Active node: Expanded card with 'Start' button matching Image 2
          if (isActive) {
            return (
              <div
                key={node.id}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  margin: '18px 0'
                }}
              >
                {/* Active node number badge: Purple Circle */}
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    boxShadow: '0 0 12px rgba(139, 92, 246, 0.5)',
                    flexShrink: 0
                  }}
                >
                  {node.stepNumber}
                </div>

                {/* Expanded Card matching Image 2 */}
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(32, 35, 48, 0.85)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div style={{ paddingRight: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: '0 0 4px 0' }}>
                      {node.title}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)' }}>
                      {node.pages || 6} pages · {node.duration || '15 min'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateToNotes(node.milestoneIndex)}
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                    }}
                  >
                    Start
                  </button>
                </div>
              </div>
            );
          }

          // Completed Node matching Image 2 (Green checkmark)
          if (isCheck) {
            return (
              <div
                key={node.id}
                onClick={() => onToggleMilestone(node.stageIndex, node.milestoneIndex)}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  margin: '18px 0',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  <Check size={16} strokeWidth={2.5} />
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#f3f4f6' }}>
                    {node.title}
                  </span>
                  <Check size={16} color="#10b981" strokeWidth={2.5} />
                </div>
              </div>
            );
          }

          // Locked / Upcoming Node matching Image 2
          return (
            <div
              key={node.id}
              onClick={() => onToggleMilestone(node.stageIndex, node.milestoneIndex)}
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                margin: '18px 0',
                cursor: 'pointer',
                opacity: 0.7
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: '#181b24',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255, 255, 255, 0.45)',
                  fontWeight: 500,
                  fontSize: '12px',
                  flexShrink: 0
                }}
              >
                {node.stepNumber}
              </div>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.65)' }}>
                  {node.title}
                </span>
                <Lock size={13} color="rgba(255, 255, 255, 0.3)" />
              </div>
            </div>
          );
        })}

        {/* Footer Trophy matching Image 2 */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginTop: '28px',
            paddingTop: '8px'
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#161922',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.4)',
              flexShrink: 0
            }}
          >
            <Trophy size={14} />
          </div>

          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
            Finish every section to complete the lesson
          </span>
        </div>
      </div>
    </div>
  );
};
