import React, { useState } from 'react';
import {
  X,
  Trash2,
  Download,
  Printer,
  Search,
  BookOpen,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { NoteItem } from '../../types/study.js';

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notes: NoteItem[];
  onDeleteNote: (id: string) => void;
  onClearAllNotes: () => void;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  isOpen,
  onClose,
  notes,
  onDeleteNote,
  onClearAllNotes
}) => {
  const [search, setSearch] = useState('');
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);

  if (!isOpen) return null;

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.category.toLowerCase().includes(search.toLowerCase())
  );

  const activeNote = selectedNote || filteredNotes[0] || null;

  const handleExportAll = () => {
    const combined = notes
      .map(
        (n) =>
          `# ${n.title}\nCategory: ${n.category} | Created: ${n.createdAt}\n\n${n.content}\n\n---\n`
      )
      .join('\n');
    const blob = new Blob([combined], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Study_Notebook_Export_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
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
          maxWidth: '820px',
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
            padding: '18px 24px',
            borderBottom: '1.5px solid var(--color-border)',
            backgroundColor: 'rgba(255, 225, 226, 0.5)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={22} color="var(--color-primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              Saved Study Notebook ({notes.length})
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {notes.length > 0 && (
              <>
                <button
                  onClick={handleExportAll}
                  title="Export All to Markdown"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--color-text)'
                  }}
                >
                  <Download size={13} /> Export All
                </button>

                <button
                  onClick={handlePrint}
                  title="Print Notebook"
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                >
                  <Printer size={14} />
                </button>

                <button
                  onClick={onClearAllNotes}
                  title="Clear All Notes"
                  style={{
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-primary)'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div
            style={{
              width: '280px',
              borderRight: '1px solid var(--color-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--color-bg-alt)'
            }}
          >
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <Search size={14} color="var(--color-accent)" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: 'none', backgroundColor: 'transparent', fontSize: '12px', width: '100%' }}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
              {filteredNotes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                  No notebook items found. Click "Save to Notes" on any generated study result!
                </div>
              ) : (
                filteredNotes.map((note) => {
                  const isSelected = activeNote?.id === note.id;
                  return (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'var(--color-surface)' : 'transparent',
                        border: isSelected ? '1.5px solid var(--color-primary)' : '1.5px solid transparent',
                        marginBottom: '6px',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            color: 'var(--color-primary)'
                          }}
                        >
                          {note.componentType}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                          {note.createdAt}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: 'var(--color-text)',
                          marginTop: '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {note.title}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: 'var(--color-surface)' }}>
            {activeNote ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--color-border-subtle)'
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: 'var(--color-primary)',
                        textTransform: 'uppercase'
                      }}
                    >
                      {activeNote.category}
                    </span>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)', margin: '4px 0 0 0' }}>
                      {activeNote.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => onDeleteNote(activeNote.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#EF4444',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    <Trash2 size={13} /> Delete Note
                  </button>
                </div>

                <div
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: 'var(--color-text)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  {activeNote.content}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
                Select an entry from the sidebar to inspect details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
