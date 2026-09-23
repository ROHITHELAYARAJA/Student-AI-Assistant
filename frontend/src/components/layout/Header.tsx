import React from 'react';
import {
  Sparkles,
  StickyNote,
  History,
  Maximize2,
  Minimize2,
  MousePointerClick
} from 'lucide-react';

interface HeaderProps {
  notesCount: number;
  historyCount: number;
  onOpenNotes: () => void;
  onOpenHistory: () => void;
  isBackendOnline: boolean;
  isCompactMode: boolean;
  onToggleCompactMode: () => void;
  onCaptureSelection: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  notesCount,
  historyCount,
  onOpenNotes,
  onOpenHistory,
  isBackendOnline,
  isCompactMode,
  onToggleCompactMode,
  onCaptureSelection
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'rgba(255, 225, 226, 0.94)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1.5px solid var(--color-border)',
        padding: isCompactMode ? '10px 14px' : '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        transition: 'all var(--transition-normal)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: isCompactMode ? '34px' : '40px',
            height: isCompactMode ? '34px' : '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.35)',
            flexShrink: 0
          }}
        >
          <Sparkles size={isCompactMode ? 18 : 22} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span
              className="font-headline"
              style={{
                fontSize: isCompactMode ? '18px' : '22px',
                color: 'var(--color-text)',
                lineHeight: 1
              }}
            >
              Study Assistant
            </span>
            <span
              className="font-editorial-italic"
              style={{
                fontSize: isCompactMode ? '13px' : '15px',
                color: 'var(--color-primary)',
                fontWeight: 600
              }}
            >
              Space Grotesk + DM Sans
            </span>
            <span
              className="font-technical-spec"
              style={{
                padding: '1px 6px',
                borderRadius: '999px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-border)',
                lineHeight: 1.4
              }}
            >
              Side Panel
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '3px'
            }}
          >
            <span
              className="font-body"
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                fontWeight: 500
              }}
            >
              Minimalist Clean UI
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-text-faint)' }}>•</span>
            <span
              className="font-editorial-italic"
              style={{
                fontSize: '11px',
                color: 'var(--color-accent)'
              }}
            >
              100 Operators • Bedrock Active
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={onCaptureSelection}
          title="Capture highlighted text from active page"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: '11px',
            fontWeight: 700
          }}
        >
          <MousePointerClick size={13} color="var(--color-primary)" />
          <span>Grab Web Text</span>
        </button>

        <button
          onClick={onToggleCompactMode}
          title={isCompactMode ? 'Expand to Full Studio' : 'Compact Side Panel View'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isCompactMode ? 'var(--color-primary)' : 'var(--color-surface)',
            color: isCompactMode ? '#FFFFFF' : 'var(--color-text)',
            border: '1px solid var(--color-border)',
            fontSize: '11px',
            fontWeight: 700
          }}
        >
          {isCompactMode ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          <span>{isCompactMode ? 'Full View' : 'Side Panel'}</span>
        </button>

        <button
          onClick={onOpenHistory}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <History size={14} color="var(--color-primary)" />
          <span>History</span>
          {historyCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '999px'
              }}
            >
              {historyCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenNotes}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <StickyNote size={14} color="var(--color-primary)" />
          <span>Notes</span>
          {notesCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 800,
                padding: '1px 6px',
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
