import React, { useState } from 'react';
import { ListOrdered, CheckCircle2, Bookmark, Lightbulb } from 'lucide-react';
import { KeypointItem } from '../../types/study.js';

interface KeypointsCardProps {
  keypoints: KeypointItem[];
  title: string;
}

export const KeypointsCard: React.FC<KeypointsCardProps> = ({ keypoints, title }) => {
  const [checkedPoints, setCheckedPoints] = useState<Set<number>>(new Set());

  const togglePoint = (id: number) => {
    setCheckedPoints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
          paddingBottom: '12px',
          borderBottom: '1.5px solid var(--color-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ListOrdered size={20} color="var(--color-primary)" />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
            {title || 'Essential Key Takeaways & Exam Points'}
          </h3>
        </div>

        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--color-accent)',
            backgroundColor: 'rgba(255, 225, 226, 0.7)',
            padding: '4px 10px',
            borderRadius: '999px',
            border: '1px solid var(--color-border)'
          }}
        >
          {checkedPoints.size} / {keypoints.length} Reviewed
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {keypoints.map((item) => {
          const isDone = checkedPoints.has(item.id);

          let priorityBg = 'rgba(225, 29, 72, 0.1)';
          let priorityColor = 'var(--color-primary)';
          if (item.priority === 'HIGH') {
            priorityBg = 'rgba(225, 29, 72, 0.15)';
            priorityColor = 'var(--color-primary)';
          } else if (item.priority === 'LOW') {
            priorityBg = 'rgba(16, 185, 129, 0.15)';
            priorityColor = '#059669';
          }

          return (
            <div
              key={item.id}
              onClick={() => togglePoint(item.id)}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                padding: '16px 18px',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: isDone ? '#10B981' : 'rgba(255, 225, 226, 0.8)',
                      color: isDone ? '#FFFFFF' : 'var(--color-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {isDone ? <CheckCircle2 size={15} /> : item.id}
                  </div>

                  <p
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-text)',
                      margin: 0,
                      lineHeight: 1.5,
                      textDecoration: isDone ? 'line-through' : 'none',
                      opacity: isDone ? 0.65 : 1
                    }}
                  >
                    {item.point}
                  </p>
                </div>

                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: priorityBg,
                    color: priorityColor,
                    flexShrink: 0
                  }}
                >
                  {item.priority}
                </span>
              </div>

              {item.examTip && (
                <div
                  style={{
                    marginTop: '10px',
                    marginLeft: '34px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255, 225, 226, 0.4)',
                    fontSize: '11px',
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Lightbulb size={13} color="var(--color-primary)" />
                  <span>
                    <strong>Exam Tip: </strong>
                    {item.examTip}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
