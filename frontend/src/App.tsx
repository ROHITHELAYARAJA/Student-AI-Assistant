import React, { useState, useEffect, useRef } from 'react';
import { ParticleBackground } from './components/ui/ParticleBackground.js';
import { Header } from './components/layout/Header.js';
import { DynamicOutputRenderer } from './components/ai-output/DynamicOutputRenderer.js';
import { NotesDrawer } from './components/layout/NotesDrawer.js';
import { HistoryDrawer } from './components/layout/HistoryDrawer.js';
import { Toast } from './components/ui/Toast.js';
import { EmmaAvatar } from './components/ui/EmmaAvatar.js';
import {
  ChatMessage,
  StructuredAiResponse,
  NoteItem,
  HistoryItem,
  EmmaExpression
} from './types/study.js';
import { requestAiAssistance } from './services/api.js';
import {
  Send,
  Sparkles,
  User,
  Layers,
  Award,
  Code2,
  GitCompare,
  CalendarDays,
  Sigma,
  GitFork,
  BookOpen,
  Mic,
  MicOff,
  Globe,
  Loader2,
  Trash2,
  Heart
} from 'lucide-react';

interface QuickTool {
  id: string;
  name: string;
  expression: EmmaExpression;
  icon: React.ReactNode;
  promptPrefix: string;
}

const QUICK_TOOLS: QuickTool[] = [
  { id: 'auto', name: 'Auto Detect', expression: 'thinking', icon: <Sparkles size={13} />, promptPrefix: '' },
  { id: 'flashcards', name: 'Flashcards', expression: 'reading', icon: <Layers size={13} />, promptPrefix: 'Generate 10 interactive study flashcards for: ' },
  { id: 'quiz', name: 'Quiz Me', expression: 'teaching', icon: <Award size={13} />, promptPrefix: 'Generate an interactive multiple-choice quiz with explanations on: ' },
  { id: 'code', name: 'Code Studio', expression: 'coding', icon: <Code2 size={13} />, promptPrefix: 'Write clean, optimal code with explanation and Big-O complexity for: ' },
  { id: 'mindmap', name: 'Mind Map', expression: 'teaching', icon: <GitFork size={13} />, promptPrefix: 'Build a comprehensive mind map and concept tree for: ' },
  { id: 'compare', name: 'Compare', expression: 'reading', icon: <GitCompare size={13} />, promptPrefix: 'Do a deep side-by-side comparison across all key dimensions for: ' },
  { id: 'formulas', name: 'Formulas', expression: 'teaching', icon: <Sigma size={13} />, promptPrefix: 'List and explain key formulas, variables, and examples for: ' },
  { id: 'study_plan', name: '7-Day Plan', expression: 'reading', icon: <CalendarDays size={13} />, promptPrefix: 'Create an intensive 7-day milestone study plan for: ' },
  { id: 'notes', name: 'Study Notes', expression: 'reading', icon: <BookOpen size={13} />, promptPrefix: 'Create structured, high-yield academic study notes on: ' }
];

export const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('emma_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'welcome',
        sender: 'emma',
        expression: 'waving',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "Hi! I'm Emma, your personal AI study & coding companion 🎓. Ask me anything, paste notes or code, or click one of the interactive tools below!"
      }
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTabSnippet, setActiveTabSnippet] = useState<string>('');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentExpression, setCurrentExpression] = useState<EmmaExpression>('waving');
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('emma_study_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('emma_study_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem('emma_chat_messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('emma_study_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('emma_study_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((res) => {
        if (res.ok) setIsBackendOnline(true);
      })
      .catch(() => setIsBackendOnline(false));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleCapturePageText = async () => {
    try {
      const winChrome = (window as any).chrome;
      if (winChrome && winChrome.tabs && winChrome.scripting) {
        const [tab] = await winChrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
          const results = await winChrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => window.getSelection()?.toString() || document.body.innerText.slice(0, 1500)
          });
          const text = results[0]?.result?.trim();
          if (text) {
            setActiveTabSnippet(text);
            setCurrentExpression('reading');
            showToast('Captured text from active browser tab');
            return;
          }
        }
      }

      const winSel = window.getSelection()?.toString().trim();
      if (winSel) {
        setActiveTabSnippet(winSel);
        setCurrentExpression('reading');
        showToast('Captured selected text');
      } else {
        showToast('Please highlight text on the web page first');
      }
    } catch (err) {
      showToast('Could not grab page text');
    }
  };

  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Speech Recognition not supported in this browser');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery((prev) => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const determineEmmaExpression = (operation: string, componentType: string): EmmaExpression => {
    if (componentType === 'code' || operation.includes('code') || operation.includes('debug')) {
      return 'coding';
    }
    if (componentType === 'quiz' || componentType === 'formula' || componentType === 'mindmap') {
      return 'teaching';
    }
    if (componentType === 'flashcards' || componentType === 'timeline' || componentType === 'article') {
      return 'reading';
    }
    return 'teaching';
  };

  const handleSendMessage = async (customPrompt?: string, customTool?: string) => {
    const queryToSend = (customPrompt ?? inputQuery).trim();
    if (!queryToSend && !activeTabSnippet) {
      showToast('Please enter a study topic, question, or paste code before sending.');
      textareaRef.current?.focus();
      return;
    }

    if (queryToSend.length < 2 && !activeTabSnippet) {
      showToast('Input is too short. Please provide at least 2 characters.');
      textareaRef.current?.focus();
      return;
    }

    const opToUse = customTool ?? selectedTool;
    const finalContent = activeTabSnippet
      ? `${queryToSend}\n\n[Context from active page]:\n${activeTabSnippet}`
      : queryToSend;

    const userMessage: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: queryToSend || 'Analyze captured page snippet',
      operation: opToUse
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setActiveTabSnippet('');
    setIsGenerating(true);
    setCurrentExpression('thinking');

    try {
      let resolvedOp = opToUse;
      if (resolvedOp === 'auto') {
        const lower = queryToSend.toLowerCase();
        if (lower.includes('flashcard') || lower.includes('card')) resolvedOp = 'flashcards';
        else if (lower.includes('quiz') || lower.includes('test me') || lower.includes('mcq')) resolvedOp = 'quiz';
        else if (lower.includes('code') || lower.includes('algorithm') || lower.includes('python') || lower.includes('function') || lower.includes('debug')) resolvedOp = 'code';
        else if (lower.includes('mindmap') || lower.includes('mind map') || lower.includes('concept map')) resolvedOp = 'mindmap';
        else if (lower.includes('compare') || lower.includes('difference between') || lower.includes('vs')) resolvedOp = 'compare';
        else if (lower.includes('formula') || lower.includes('math') || lower.includes('derive')) resolvedOp = 'formulas';
        else if (lower.includes('plan') || lower.includes('schedule') || lower.includes('roadmap')) resolvedOp = 'study_plan';
        else resolvedOp = 'notes';
      }

      const response = await requestAiAssistance({
        content: finalContent,
        operation: resolvedOp,
        studyTopic: queryToSend.slice(0, 80)
      });

      const replyExpression = determineEmmaExpression(resolvedOp, response.componentType);
      setCurrentExpression(replyExpression);

      const emmaMessage: ChatMessage = {
        id: 'emma_' + Date.now(),
        sender: 'emma',
        expression: replyExpression,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Here is your structured solution for "${response.title}":`,
        operation: resolvedOp,
        response
      };

      setMessages((prev) => [...prev, emmaMessage]);

      const historyItem: HistoryItem = {
        id: 'hist_' + Date.now(),
        timestamp: new Date().toISOString(),
        operation: resolvedOp,
        operationName: response.title,
        category: 'Study',
        topic: response.title,
        contentSnippet: queryToSend.slice(0, 100),
        response
      };
      setHistory((prev) => [historyItem, ...prev.slice(0, 49)]);
    } catch (err: any) {
      const errorDetail =
        err?.response?.data?.message ||
        err?.message ||
        'I ran into an issue connecting to the AI backend. Please verify http://localhost:5000 is active.';

      const errorMessage: ChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'emma',
        expression: 'thinking',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `⚠️ ${errorDetail}`
      };
      setMessages((prev) => [...prev, errorMessage]);
      setCurrentExpression('waving');
      showToast(errorDetail);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToNotes = (response: StructuredAiResponse) => {
    const newNote: NoteItem = {
      id: 'note_' + Date.now(),
      title: response.title,
      content: response.rawMarkdown,
      category: response.operation,
      createdAt: new Date().toLocaleDateString(),
      componentType: response.componentType
    };
    setNotes((prev) => [newNote, ...prev]);
    setCurrentExpression('loving');
    showToast(`Saved "${response.title}" to Notes ❤️`);
  };

  const handleClearChat = () => {
    if (confirm('Start a fresh study chat session with Emma?')) {
      const initial: ChatMessage[] = [
        {
          id: 'welcome',
          sender: 'emma',
          expression: 'waving',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: "Fresh chat started! What topic or code would you like to master today? 🎓"
        }
      ];
      setMessages(initial);
      setCurrentExpression('waving');
      localStorage.setItem('emma_chat_messages', JSON.stringify(initial));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <ParticleBackground />

      <Header
        notesCount={notes.length}
        historyCount={history.length}
        onOpenNotes={() => setIsNotesOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onClearChat={handleClearChat}
        onCaptureSelection={handleCapturePageText}
        isBackendOnline={isBackendOnline}
      />

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          position: 'relative',
          zIndex: 10
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
                flexDirection: isUser ? 'row-reverse' : 'row',
                maxWidth: '100%'
              }}
            >
              {isUser ? (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                    flexShrink: 0
                  }}
                >
                  <User size={16} color="#FFFFFF" />
                </div>
              ) : (
                <EmmaAvatar
                  expression={msg.expression || 'reading'}
                  size={32}
                />
              )}

              <div
                style={{
                  maxWidth: isUser ? '85%' : '94%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    fontSize: '11px',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                    {isUser ? 'You' : 'Emma'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.response && (
                    <span
                      style={{
                        padding: '1px 5px',
                        borderRadius: '999px',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-accent)',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      {msg.response.metadata.model.includes('Bedrock') || msg.response.metadata.model.includes('Claude')
                        ? 'Claude 3.5'
                        : 'Emma AI'}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    padding: isUser ? '8px 12px' : '10px 12px',
                    borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                    backgroundColor: isUser ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: isUser ? '#FFFFFF' : 'var(--color-text)',
                    boxShadow: isUser
                      ? '0 2px 6px rgba(225, 29, 72, 0.2)'
                      : '0 2px 8px rgba(81, 0, 0, 0.05)',
                    border: isUser ? 'none' : '1px solid var(--color-border)',
                    fontSize: '13px',
                    lineHeight: 1.45,
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.text && (
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                  )}

                  {msg.response && (
                    <div style={{ marginTop: '8px' }}>
                      <DynamicOutputRenderer
                        response={msg.response}
                        onSaveToNotes={handleSaveToNotes}
                        isSavedInNotes={notes.some((n) => n.title === msg.response?.title)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <EmmaAvatar
              expression="thinking"
              size={32}
              isPulsing={true}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <Loader2 size={14} className="spinner" color="var(--color-primary)" />
              <span>Emma is thinking & structuring your solution...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <footer
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 30,
          backgroundColor: 'rgba(255, 225, 226, 0.96)',
          backdropFilter: 'blur(16px)',
          borderTop: '1.5px solid var(--color-border)',
          padding: '8px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          boxShadow: '0 -2px 8px rgba(81, 0, 0, 0.03)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none'
          }}
        >
          {QUICK_TOOLS.map((tool) => {
            const isSelected = selectedTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setSelectedTool(tool.id);
                  setCurrentExpression(tool.expression);
                  if (tool.promptPrefix && !inputQuery) {
                    setInputQuery(tool.promptPrefix);
                    textareaRef.current?.focus();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isSelected ? '#FFFFFF' : 'var(--color-text)',
                  border: isSelected ? 'none' : '1px solid var(--color-border)',
                  fontSize: '11px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {tool.icon}
                <span>{tool.name}</span>
              </button>
            );
          })}
        </div>

        {activeTabSnippet && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(225, 29, 72, 0.08)',
              border: '1px solid var(--color-border)',
              fontSize: '11px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden' }}>
              <Globe size={11} color="var(--color-primary)" />
              <span style={{ fontWeight: 700 }}>Attached Page Snippet:</span>
              <span style={{ color: 'var(--color-text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {activeTabSnippet.slice(0, 45)}...
              </span>
            </div>
            <button
              onClick={() => setActiveTabSnippet('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: '2px'
              }}
              title="Remove snippet"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '14px',
            border: '1.5px solid var(--color-border)',
            padding: '5px 8px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <button
            onClick={handleCapturePageText}
            title="Grab text from active browser tab"
            style={{
              padding: '5px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Globe size={15} />
          </button>

          <button
            onClick={handleToggleVoice}
            title={isListening ? 'Listening...' : 'Voice Dictation'}
            style={{
              padding: '5px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: isListening ? 'var(--color-primary)' : 'transparent',
              color: isListening ? '#FFFFFF' : 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          <textarea
            ref={textareaRef}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Emma anything, paste notes or code... (Enter to send)"
            rows={1}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              resize: 'none',
              backgroundColor: 'transparent',
              fontFamily: 'var(--font-body)',
              fontSize: '12.5px',
              color: 'var(--color-text)',
              maxHeight: '90px',
              lineHeight: 1.4,
              padding: '3px 0'
            }}
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={(!inputQuery.trim() && !activeTabSnippet) || isGenerating}
            title="Send to Emma"
            style={{
              padding: '7px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor:
                (!inputQuery.trim() && !activeTabSnippet) || isGenerating
                  ? 'var(--color-border)'
                  : 'var(--color-primary)',
              color: '#FFFFFF',
              cursor:
                (!inputQuery.trim() && !activeTabSnippet) || isGenerating
                  ? 'not-allowed'
                  : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background var(--transition-fast)'
            }}
          >
            {isGenerating ? (
              <Loader2 size={15} className="spinner" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>
      </footer>

      <NotesDrawer
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        notes={notes}
        onDeleteNote={(id) => {
          setNotes((prev) => prev.filter((n) => n.id !== id));
          showToast('Note deleted');
        }}
        onClearAllNotes={() => {
          setNotes([]);
          showToast('All notes cleared');
        }}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={(item) => {
          const restoredExpression = determineEmmaExpression(item.operation, item.response.componentType);
          const restoredMsg: ChatMessage = {
            id: 'hist_restored_' + Date.now(),
            sender: 'emma',
            expression: restoredExpression,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `Restored previous output for "${item.operationName}":`,
            operation: item.operation,
            response: item.response
          };
          setMessages((prev) => [...prev, restoredMsg]);
          setCurrentExpression(restoredExpression);
          setIsHistoryOpen(false);
          showToast(`Restored "${item.operationName}" into chat`);
        }}
        onDeleteHistoryItem={(id) => {
          setHistory((prev) => prev.filter((h) => h.id !== id));
          showToast('History entry removed');
        }}
        onClearAllHistory={() => {
          setHistory([]);
          showToast('History cleared');
        }}
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
