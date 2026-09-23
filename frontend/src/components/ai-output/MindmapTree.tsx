import React, { useState } from 'react';
import { Network, ChevronRight, ChevronDown, Circle } from 'lucide-react';
import { MindmapNode } from '../../types/study.js';

interface MindmapTreeProps {
  node: MindmapNode;
  title: string;
}

export const MindmapTree: React.FC<MindmapTreeProps> = ({ node, title }) => {
  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '18px'
        }}
      >
        <Network size={20} color="var(--color-primary)" />
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
          {title || 'Conceptual Mind Map & Hierarchy'}
        </h3>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--color-border)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 800,
            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
            marginBottom: '20px'
          }}
        >
          {node.label}
        </div>

        <div style={{ paddingLeft: '14px', borderLeft: '2px dashed var(--color-border)' }}>
          {node.children?.map((child) => (
            <MindmapBranch key={child.id} node={child} />
          ))}
        </div>
      </div>
    </div>
  );
};

const MindmapBranch: React.FC<{ node: MindmapNode }> = ({ node }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ margin: '14px 0' }}>
      <div
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: hasChildren ? 'pointer' : 'default'
        }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown size={16} color="var(--color-primary)" />
          ) : (
            <ChevronRight size={16} color="var(--color-primary)" />
          )
        ) : (
          <Circle size={8} fill="var(--color-accent)" color="transparent" style={{ marginLeft: '4px' }} />
        )}

        <div
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-bg-alt)',
            border: '1px solid var(--color-border)',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--color-text)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {node.label}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div
          style={{
            paddingLeft: '22px',
            marginLeft: '8px',
            borderLeft: '1.5px solid var(--color-border-subtle)',
            marginTop: '8px'
          }}
        >
          {node.children?.map((sub) => (
            <div
              key={sub.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '8px 0',
                fontSize: '12px',
                color: 'var(--color-text-muted)'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)'
                }}
              />
              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{sub.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
