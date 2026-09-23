import React, { useState } from 'react';
import { CalendarDays, Clock, CheckCircle2, Circle, Lightbulb } from 'lucide-react';
import { TimelineDay } from '../../types/study.js';

interface StudyPlanTimelineProps {
  timeline: TimelineDay[];
  title: string;
}

export const StudyPlanTimeline: React.FC<StudyPlanTimelineProps> = ({ timeline, title }) => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  let totalTasks = 0;
  timeline.forEach((day) => {
    totalTasks += day.tasks.length;
  });

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks.size / totalTasks) * 100) : 0;

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto' }}>
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
            <CalendarDays size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
              {title}
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
            Interactive structured milestone schedule
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent)' }}>
            Progress: {completedTasks.size} / {totalTasks} ({progressPercent}%)
          </div>
          <div
            style={{
              width: '120px',
              height: '6px',
              backgroundColor: 'rgba(255, 122, 148, 0.3)',
              borderRadius: '999px',
              marginTop: '4px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: 'var(--color-primary)',
                transition: 'width var(--transition-normal)'
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {timeline.map((day) => (
          <div
            key={day.day}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  Day {day.day}
                </span>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                  {day.title}
                </h4>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--color-text-muted)'
                }}
              >
                <Clock size={13} />
                <span>{day.duration || '90 mins'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {day.tasks.map((task, tIdx) => {
                const taskId = `${day.day}-${tIdx}`;
                const isDone = completedTasks.has(taskId);

                return (
                  <div
                    key={tIdx}
                    onClick={() => toggleTask(taskId)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--color-bg-alt)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <Circle size={16} color="var(--color-border)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <span
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-text)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        opacity: isDone ? 0.7 : 1
                      }}
                    >
                      {task}
                    </span>
                  </div>
                );
              })}
            </div>

            {day.tips && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 225, 226, 0.45)',
                  fontSize: '12px',
                  color: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Lightbulb size={14} color="var(--color-primary)" />
                <span>{day.tips}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
