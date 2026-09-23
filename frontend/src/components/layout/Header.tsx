import React from 'react';
import {
  StickyNote,
  History,
  RotateCcw,
  Globe
} from 'lucide-react';

interface HeaderProps {
  notesCount: number;
  historyCount: number;
  onOpenNotes: () => void;
  onOpenHistory: () => void;
  onClearChat: () => void;
  onCaptureSelection: () => void;
  isBackendOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  notesCount,
  historyCount,
  onOpenNotes,
  onOpenHistory,
  onClearChat,
  onCaptureSelection,
  isBackendOnline
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'rgba(255, 225, 226, 0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1.5px solid var(--color-border)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        boxShadow: '0 2px 8px rgba(81, 0, 0, 0.04)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            position: 'relative',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid var(--color-primary)',
            boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)',
            flexShrink: 0,
            backgroundColor: '#FFFFFF'
          }}
        >
          <img
            src="./emma-logo.jpg"
            alt="Emma AI"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              backgroundColor: isBackendOnline ? '#10B981' : '#F59E0B',
              border: '1.5px solid #FFFFFF'
            }}
            title={isBackendOnline ? 'Emma is online' : 'Local fallback engine'}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              className="font-headline"
              style={{
                fontSize: '17px',
                color: 'var(--color-text)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                fontWeight: 700
              }}
            >
              Emma
            </span>
            <span
              className="font-technical-spec"
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '999px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-border)',
                fontWeight: 700
              }}
            >
              AI Study Assistant
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginTop: '2px'
            }}
          >
            <span
              className="font-body"
              style={{
                fontSize: '10.5px',
                color: 'var(--color-text-muted)'
              }}
            >
              Claude 3.5 & Bedrock • Space Grotesk + DM Sans
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={onCaptureSelection}
          title="Grab text from active browser tab"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 9px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Globe size={12} color="var(--color-primary)" />
          <span>Grab Tab</span>
        </button>

        <button
          onClick={onOpenHistory}
          title="Browse session history"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 9px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <History size={12} color="var(--color-primary)" />
          <span>History</span>
          {historyCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 800,
                padding: '0 5px',
                borderRadius: '999px'
              }}
            >
              {historyCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenNotes}
          title="Open study notes drawer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 9px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <StickyNote size={12} color="var(--color-primary)" />
          <span>Notes</span>
          {notesCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 800,
                padding: '0 5px',
                borderRadius: '999px'
              }}
            >
              {notesCount}
            </span>
          )}
        </button>

        <button
          onClick={onClearChat}
          title="Start a new chat session"
          style={{
            padding: '5px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </header>
  );
};
