import React, { useState, useRef } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Table, List, ListOrdered,
  Share2, Sparkles, Paperclip, ArrowUp, HelpCircle, Headphones, Layers,
  Pencil, Check, Copy, Plus, Minus, Code, ChevronDown, CheckCircle2, CornerDownLeft
} from 'lucide-react';
import { TurboStudyPack } from '../../types/turbo';
import { BlastMascot } from './BlastMascot';
import { sendChat } from '../../services/studyApi';

interface TurboNotesViewProps {
  pack: TurboStudyPack;
  save: (p: TurboStudyPack) => Promise<void>;
  notify: (s: string) => void;
  onNavigateTab: (tab: 'cards' | 'quiz' | 'audio' | 'sources' | 'learn') => void;
}

export const TurboNotesView: React.FC<TurboNotesViewProps> = ({
  pack,
  save,
  notify,
  onNavigateTab
}) => {
  // Toolbar state
  const [fontFamily, setFontFamily] = useState('Clarka');
  const [fontSize, setFontSize] = useState(14);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Copilot state
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotChat, setCopilotChat] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Editable note state
  const [notesData, setNotesData] = useState(() => JSON.parse(JSON.stringify(pack.notes)));

  const handleSaveNotes = async () => {
    try {
      const updated = {
        ...pack,
        notes: {
          ...notesData,
          lastUpdated: new Date().toISOString()
        }
      };
      await save(updated);
      setIsEditing(false);
      notify('Notes saved successfully.');
    } catch {
      notify('Could not save notes. Storage may be full.');
    }
  };

  const handleCopilotSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = copilotPrompt.trim();
    if (!query || copilotLoading) return;

    const userMessage = { role: 'user' as const, text: query };
    const nextChat = [...copilotChat, userMessage];
    setCopilotChat(nextChat);
    setCopilotPrompt('');
    setCopilotLoading(true);

    try {
      const contextPrompt = `You are Blast AI, tutor for this note: "${pack.topic}". Answer clearly and concisely with bold bullet points:\n\nStudent question: ${query}\n\nNote Summary: ${pack.notes.summary}`;
      const res = await sendChat(contextPrompt, nextChat.slice(0, -1));
      setCopilotChat([...nextChat, { role: 'assistant', text: res.reply || 'Here is the summary of the key concept...' }]);
      setTimeout(() => chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err: any) {
      setCopilotChat([...nextChat, { role: 'assistant', text: 'I had trouble answering that right now. Please try again.' }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  return (
    <div className="turbo-notes-view" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '85vh', background: 'var(--notes-page-bg, #f7f7f2)' }}>
      {/* Top Rich Text Editing Toolbar matching Turbo AI Image 3 */}
      <header
        className="turbo-editor-toolbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 20px',
          background: 'var(--notes-toolbar-bg, #ffffff)',
          borderBottom: '1px solid var(--notes-toolbar-border, #e2e8f0)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)'
        }}
      >
        {/* Left Title / Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '320px', overflow: 'hidden' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--notes-heading, #0f172a)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {pack.topic}
          </span>
        </div>

        {/* Center Formatting Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Font Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={fontFamily}
              onChange={e => setFontFamily(e.target.value)}
              style={{
                background: 'var(--notes-input-bg, #ffffff)',
                border: '1px solid var(--notes-input-border, #cbd5e1)',
                borderRadius: '8px',
                color: 'var(--notes-input-text, #0f172a)',
                fontSize: '12px',
                padding: '4px 24px 4px 10px',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Clarka">Clarka</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="Inter">Inter</option>
              <option value="JetBrains Mono">Mono</option>
              <option value="Georgia">Serif</option>
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: '8px', pointerEvents: 'none', color: 'var(--notes-toolbar-btn, #475569)' }} />
          </div>

          {/* Font Size - 14 + */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--notes-input-bg, #ffffff)', border: '1px solid var(--notes-input-border, #cbd5e1)', borderRadius: '8px', padding: '2px 4px' }}>
            <button
              type="button"
              onClick={() => setFontSize(prev => Math.max(11, prev - 1))}
              style={{ background: 'none', border: 'none', color: 'var(--notes-toolbar-btn, #334155)', cursor: 'pointer', padding: '2px 6px', fontSize: '12px' }}
            >
              <Minus size={11} />
            </button>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--notes-heading, #0f172a)', padding: '0 4px', minWidth: '18px', textAlign: 'center' }}>
              {fontSize}
            </span>
            <button
              type="button"
              onClick={() => setFontSize(prev => Math.min(24, prev + 1))}
              style={{ background: 'none', border: 'none', color: 'var(--notes-toolbar-btn, #334155)', cursor: 'pointer', padding: '2px 6px', fontSize: '12px' }}
            >
              <Plus size={11} />
            </button>
          </div>

          <div style={{ width: '1px', height: '18px', background: 'var(--notes-toolbar-border, #e2e8f0)', margin: '0 4px' }} />

          {/* Formatting Buttons: B, I, U, S */}
          <button
            type="button"
            onClick={() => setIsBold(!isBold)}
            style={{
              background: isBold ? 'rgba(124, 58, 237, 0.15)' : 'none',
              border: 'none',
              color: isBold ? '#7c3aed' : 'var(--notes-toolbar-btn, #475569)',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer'
            }}
            title="Bold"
          >
            <Bold size={13} />
          </button>

          <button
            type="button"
            onClick={() => setIsItalic(!isItalic)}
            style={{
              background: isItalic ? 'rgba(124, 58, 237, 0.15)' : 'none',
              border: 'none',
              color: isItalic ? '#7c3aed' : 'var(--notes-toolbar-btn, #475569)',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer'
            }}
            title="Italic"
          >
            <Italic size={13} />
          </button>

          <button
            type="button"
            onClick={() => setIsUnderline(!isUnderline)}
            style={{
              background: isUnderline ? 'rgba(124, 58, 237, 0.15)' : 'none',
              border: 'none',
              color: isUnderline ? '#7c3aed' : 'var(--notes-toolbar-btn, #475569)',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer'
            }}
            title="Underline"
          >
            <Underline size={13} />
          </button>

          <button
            type="button"
            onClick={() => setIsStrike(!isStrike)}
            style={{
              background: isStrike ? 'rgba(124, 58, 237, 0.15)' : 'none',
              border: 'none',
              color: isStrike ? '#7c3aed' : 'var(--notes-toolbar-btn, #475569)',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer'
            }}
            title="Strikethrough"
          >
            <Strikethrough size={13} />
          </button>

          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--notes-toolbar-btn, #475569)', borderRadius: '6px', padding: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
            title="Text Color"
          >
            A
          </button>

          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--notes-toolbar-btn, #475569)', borderRadius: '6px', padding: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}
            title="Formula"
          >
            Σ
          </button>

          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--notes-toolbar-btn, #475569)', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
            title="Table"
          >
            <Table size={13} />
          </button>

          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--notes-toolbar-btn, #475569)', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
            title="Bullet List"
          >
            <List size={13} />
          </button>

          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--notes-toolbar-btn, #475569)', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
            title="Numbered List"
          >
            <ListOrdered size={13} />
          </button>
        </div>

        {/* Right Action Controls: Share & Edit/Save */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                notify('Notebook link copied to clipboard!');
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--notes-toolbar-btn, #475569)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              padding: '6px 12px',
              borderRadius: '8px'
            }}
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (isEditing) handleSaveNotes();
              else setIsEditing(true);
            }}
            style={{
              background: isEditing ? '#10b981' : 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            {isEditing ? (
              <>
                <Check size={14} />
                <span>Save</span>
              </>
            ) : (
              <>
                <Pencil size={13} />
                <span>Edit Notes</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Split Screen Layout matching Image 3 */}
      <div
        className="turbo-split-workspace"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(400px, 1.4fr) minmax(360px, 1fr)',
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {/* Left Pane: Structured Note Document (~60%) */}
        <div
          className="turbo-note-document"
          style={{
            padding: '36px 48px',
            overflowY: 'auto',
            background: 'var(--notes-doc-bg, #ffffff)',
            borderRight: '1px solid var(--notes-doc-border, #e2e8f0)',
            fontFamily: fontFamily === 'JetBrains Mono' ? 'monospace' : fontFamily === 'Georgia' ? 'Georgia, serif' : 'var(--font-sans, "Plus Jakarta Sans", sans-serif)',
            fontSize: `${fontSize}px`,
            lineHeight: 1.65,
            color: 'var(--notes-text, #1e293b)'
          }}
        >
          {/* Note Document Title matching Image 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '24px' }}>📑</span>
            <h1
              style={{
                fontSize: `${fontSize * 1.5}px`,
                fontWeight: 700,
                color: 'var(--notes-heading, #0f172a)',
                margin: 0,
                letterSpacing: '-0.02em'
              }}
            >
              {notesData.title || pack.topic}
            </h1>
          </div>

          {/* Crisp 1-2 sentence orientation summary */}
          <p
            style={{
              fontSize: `${fontSize * 0.95}px`,
              color: 'var(--notes-text-muted, #475569)',
              marginBottom: '32px',
              lineHeight: 1.5
            }}
          >
            {notesData.summary}
          </p>

          {/* Section List matching Image 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {notesData.sections.map((sec: any, sIdx: number) => (
              <section
                key={sIdx}
                style={{
                  borderTop: sIdx > 0 ? '1px solid var(--notes-doc-border, #e2e8f0)' : 'none',
                  paddingTop: sIdx > 0 ? '24px' : '0'
                }}
              >
                {/* Heading with badge/icon */}
                <h2
                  style={{
                    fontSize: `${fontSize * 1.2}px`,
                    fontWeight: 600,
                    color: 'var(--notes-heading, #0f172a)',
                    margin: '0 0 12px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{sec.heading}</span>
                </h2>

                {/* Optional short intro sentence */}
                {sec.content && (
                  <p style={{ margin: '0 0 14px 0', color: 'var(--notes-text, #334155)', fontSize: `${fontSize}px` }}>
                    {sec.content}
                  </p>
                )}

                {/* Structured high-yield bullet points with bold prefixes */}
                {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sec.bulletPoints.map((bp: string, bIdx: number) => {
                      const split = bp.split(/:\s*(.+)/);
                      const prefix = split.length > 1 ? split[0] : '';
                      const rest = split.length > 1 ? split[1] : bp;

                      return (
                        <li
                          key={bIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            lineHeight: 1.55
                          }}
                        >
                          {/* Colorful bullet indicator */}
                          <span
                            style={{
                              display: 'inline-block',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: bIdx % 3 === 0 ? '#38bdf8' : bIdx % 3 === 1 ? '#a855f7' : '#34d399',
                              marginTop: '8px',
                              flexShrink: 0
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            {prefix ? (
                              <>
                                <strong style={{ color: 'var(--notes-heading, #0f172a)', fontWeight: 650 }}>{prefix}:</strong>{' '}
                                <span style={{ color: 'var(--notes-text, #334155)' }}>{rest}</span>
                              </>
                            ) : (
                              <span style={{ color: 'var(--notes-text, #334155)' }}>{bp}</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Code Snippets */}
                {sec.codeSnippet && sec.codeSnippet.code && (
                  <div
                    style={{
                      background: 'var(--notes-code-bg, #f8fafc)',
                      border: '1px solid var(--notes-code-border, #e2e8f0)',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      margin: '12px 0',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', color: 'var(--notes-text-muted, #64748b)' }}>
                      <span>{sec.codeSnippet.language || 'code'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(sec.codeSnippet.code);
                            notify('Code snippet copied!');
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--notes-text-muted, #64748b)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Copy size={12} />
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace', color: 'var(--chat-code-text, #581c87)', overflowX: 'auto' }}>
                      <code>{sec.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>

        {/* Right Pane: Blast AI Copilot & Study Hub (~40%) matching Image 3 */}
        <div
          className="turbo-copilot-pane"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'var(--notes-copilot-bg, #fafafa)',
            borderLeft: '1px solid var(--notes-doc-border, #e2e8f0)',
            overflow: 'hidden'
          }}
        >
          {/* Top Quick-Action Tool Cards matching Image 3 */}
          <div
            style={{
              padding: '20px 24px 16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              borderBottom: '1px solid var(--notes-doc-border, #e2e8f0)'
            }}
          >
            {/* Quizzes Tool Card */}
            <div
              onClick={() => onNavigateTab('quiz')}
              style={{
                background: 'var(--notes-card-bg, #ffffff)',
                border: '1px solid var(--notes-card-border, #e2e8f0)',
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={14} color="#7c3aed" />
                  <span style={{ fontSize: '12px', fontWeight: 650, color: 'var(--notes-heading, #0f172a)' }}>Quizzes</span>
                </div>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#059669',
                    background: 'rgba(16, 185, 129, 0.15)',
                    padding: '2px 5px',
                    borderRadius: '6px'
                  }}
                >
                  Popular
                </span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--notes-text-muted, #64748b)' }}>
                Test your knowledge
              </span>
            </div>

            {/* Podcast Tool Card */}
            <div
              onClick={() => onNavigateTab('audio')}
              style={{
                background: 'var(--notes-card-bg, #ffffff)',
                border: '1px solid var(--notes-card-border, #e2e8f0)',
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Headphones size={14} color="#0284c7" />
                <span style={{ fontSize: '12px', fontWeight: 650, color: 'var(--notes-heading, #0f172a)' }}>Podcast</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--notes-text-muted, #64748b)' }}>
                Listen and learn
              </span>
            </div>

            {/* Flashcards Tool Card */}
            <div
              onClick={() => onNavigateTab('cards')}
              style={{
                background: 'var(--notes-card-bg, #ffffff)',
                border: '1px solid var(--notes-card-border, #e2e8f0)',
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} color="#d97706" />
                <span style={{ fontSize: '12px', fontWeight: 650, color: 'var(--notes-heading, #0f172a)' }}>Flashcards</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--notes-text-muted, #64748b)' }}>
                Active recall drill
              </span>
            </div>
          </div>

          {/* Chat / Interaction Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: copilotChat.length === 0 ? 'center' : 'flex-start'
            }}
          >
            {copilotChat.length === 0 ? (
              /* Center Mascot Greeting matching Image 3 */
              <div style={{ textAlign: 'center', maxWidth: '340px', margin: '0 auto' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                  <BlastMascot pose="reading" size="medium" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--notes-heading, #0f172a)', margin: '0 0 8px 0' }}>
                  Hey, I'm Blast
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--notes-text-muted, #64748b)', margin: 0, lineHeight: 1.5 }}>
                  I can work with you on your doc and answer any questions!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {copilotChat.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '88%',
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' : 'var(--notes-chat-bot-bg, #ffffff)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--notes-chat-bot-border, #e2e8f0)',
                      borderRadius: '14px',
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: msg.role === 'user' ? '#ffffff' : 'var(--notes-chat-bot-text, #1e293b)',
                      lineHeight: 1.55,
                      boxShadow: msg.role === 'user' ? '0 2px 8px rgba(124, 58, 237, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    {msg.text}
                  </div>
                ))}
                {copilotLoading && (
                  <div style={{ alignSelf: 'flex-start', color: 'var(--notes-text-muted, #64748b)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={12} className="spin" color="#7c3aed" />
                    <span>Blast is analyzing your notes...</span>
                  </div>
                )}
                <div ref={chatScrollRef} />
              </div>
            )}
          </div>

          {/* Contextual Chat Composer matching Image 3 */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--notes-doc-border, #e2e8f0)',
              background: 'var(--notes-toolbar-bg, #ffffff)'
            }}
          >
            <form
              onSubmit={handleCopilotSend}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--notes-input-bg, #ffffff)',
                border: '1px solid var(--notes-input-border, #cbd5e1)',
                borderRadius: '16px',
                padding: '6px 12px 6px 14px',
                gap: '10px'
              }}
            >
              <button
                type="button"
                onClick={() => onNavigateTab('sources')}
                style={{ background: 'none', border: 'none', color: 'var(--notes-toolbar-btn, #64748b)', cursor: 'pointer', padding: 0 }}
                title="Attach Resources"
              >
                <Paperclip size={16} />
              </button>

              <input
                type="text"
                value={copilotPrompt}
                onChange={e => setCopilotPrompt(e.target.value)}
                placeholder="Type a question here or type '@' to reference documents..."
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: 'var(--notes-input-text, #0f172a)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />

              <button
                type="submit"
                disabled={!copilotPrompt.trim() || copilotLoading}
                style={{
                  background: copilotPrompt.trim() ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' : 'rgba(124, 58, 237, 0.15)',
                  color: copilotPrompt.trim() ? '#ffffff' : 'var(--notes-text-muted, #94a3b8)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: copilotPrompt.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Sparkles size={13} />
                <span>Talk to Blast</span>
                <ArrowUp size={12} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
