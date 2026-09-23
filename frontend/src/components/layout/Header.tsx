import React from 'react';
import { BookOpen, Sparkles, StickyNote, Activity } from 'lucide-react';

interface HeaderProps {
  notesCount: number;
  onOpenNotes: () => void;
  isBackendOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  notesCount,
  onOpenNotes,
  isBackendOnline
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'rgba(255, 225, 226, 0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1.5px solid var(--color-border)',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all var(--transition-normal)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(225, 29, 72, 0.35)'
          }}
        >
          <Sparkles size={24} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: 'var(--color-text)',
                margin: 0,
                letterSpacing: '-0.03em'
              }}
            >
              Plein <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Study Assistant</span>
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '999px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-border)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              v2.0 Turbo
            </span>
          </div>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              margin: '2px 0 0 0',
              fontWeight: 500
            }}
          >
            Space Grotesk Engine • 100 AI Academic & Coding Operators
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border-subtle)',
            fontSize: '12px',
            fontWeight: 600,
            color: isBackendOnline ? 'var(--color-accent)' : '#888'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isBackendOnline ? 'var(--color-primary)' : '#999',
              display: 'inline-block'
            }}
          />
          <Activity size={14} />
          {isBackendOnline ? 'Neural Core Active' : 'Offline Generator'}
        </div>

        <button
          onClick={onOpenNotes}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all var(--transition-fast)',
            boxShadow: 'var(--shadow-sm)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <StickyNote size={16} color="var(--color-primary)" />
          <span>Notebook</span>
          {notesCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '999px'
              }}
            >
              {notesCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
