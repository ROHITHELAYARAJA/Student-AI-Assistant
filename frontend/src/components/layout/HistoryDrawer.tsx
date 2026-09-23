import React, { useState } from 'react';
import {
  X,
  History,
  Trash2,
  Download,
  Search,
  ArrowRight,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';
import { HistoryItem } from '../../types/study.js';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onDeleteHistoryItem,
  onClearAllHistory
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = history.filter(
    (h) =>
      h.topic.toLowerCase().includes(search.toLowerCase()) ||
      h.operationName.toLowerCase().includes(search.toLowerCase()) ||
      h.category.toLowerCase().includes(search.toLowerCase()) ||
      h.contentSnippet.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportHistory = () => {
    const jsonStr = JSON.stringify(history, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Study_History_Log_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(81, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'all var(--transition-normal)'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          backgroundColor: 'var(--color-surface)',
          borderLeft: '2px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(81, 0, 0, 0.2)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1.5px solid var(--color-border)',
            backgroundColor: 'rgba(255, 225, 226, 0.5)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              Session History ({history.length})
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {history.length > 0 && (
              <>
                <button
                  onClick={handleExportHistory}
                  title="Export History JSON"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-text)'
                  }}
                >
                  <Download size={12} /> Export
                </button>

                <button
                  onClick={onClearAllHistory}
                  title="Clear All History"
                  style={{
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  <Trash2 size={12} /> Clear
                </button>
              </>
            )}

            <button
              onClick={onClose}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text)'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-alt)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-full)'
            }}
          >
            <Search size={14} color="var(--color-accent)" />
            <input
              type="text"
              placeholder="Search previous operations or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', backgroundColor: 'transparent', fontSize: '12px', width: '100%' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
              <History size={36} color="var(--color-border)" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                No prior study history found
              </p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>
                Every generated study module will automatically be recorded here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(255, 225, 226, 0.7)',
                        color: 'var(--color-primary)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      {item.operationName}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> {item.timestamp}
                      </span>
                      <button
                        onClick={() => onDeleteHistoryItem(item.id)}
                        style={{ color: '#EF4444', padding: '2px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text)', margin: '4px 0' }}>
                    {item.topic}
                  </h4>

                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      margin: '0 0 10px 0',
                      lineHeight: 1.45,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.contentSnippet}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onSelectHistoryItem(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(225, 29, 72, 0.08)'
                      }}
                    >
                      <span>Restore Session</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
