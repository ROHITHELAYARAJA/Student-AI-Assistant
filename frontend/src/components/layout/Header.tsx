import React from 'react';
import {
  StickyNote,
  History,
  RotateCcw,
  Globe
} from 'lucide-react';
import { EmmaAvatar } from '../ui/EmmaAvatar.js';

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
        borderBottom: '1px solid var(--color-border)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        boxShadow: '0 2px 8px rgba(81, 0, 0, 0.03)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <EmmaAvatar
          useOfficialLogo={true}
          size={38}
          showStatus={true}
          isOnline={isBackendOnline}
        />

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
              style={{
                fontSize: '10px',
                padding: '1px 7px',
                borderRadius: '999px',
                backgroundColor: 'rgba(225, 29, 72, 0.08)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border)',
                fontWeight: 700,
                letterSpacing: '0.02em'
              }}
            >
              AI Study Companion
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
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isBackendOnline ? '#10B981' : '#F59E0B'
              }}
            />
            <span
              className="font-body"
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                fontWeight: 500
              }}
            >
              {isBackendOnline ? 'Online • Ready to assist' : 'Local Engine Active'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={onCaptureSelection}
          title="Capture highlighted text from your current webpage"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
        >
          <Globe size={12} color="var(--color-primary)" />
          <span>Grab Tab</span>
        </button>

        <button
          onClick={onOpenHistory}
          title="View past study sessions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
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
          title="View saved study notes"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
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
          title="New Chat Session"
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
          <RotateCcw size={13} />
        </button>
      </div>
    </header>
  );
};
