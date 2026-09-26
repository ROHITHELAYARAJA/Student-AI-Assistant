import { BlastMascot } from './BlastMascot';
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Mic, Youtube, ArrowUp, ArrowUpRight, ArrowRight, ArrowLeft, Plus, Search, Home, Star, BookOpen, FileText, Layers, Headphones, X, ChevronRight, Download, Upload, Sparkles, CheckCircle2, HelpCircle, Loader2, Compass } from 'lucide-react';
import { router, RouteState } from '../../services/router';
import { TurboStudyPack } from '../../types/turbo';
import { request, createStudy, followStudy, saveRemote, StudySettings, sendChat } from '../../services/studyApi';
import { StudyTools, StudyTab, progress, readLocal } from './StudyTools';
import './workspace.css';
import './astra-layout.css';
import './astra-theme.css';
import { isNotebookIntent } from './welcome';
import { RichMarkdown } from '../turbo/RichMarkdown';
import { UserProfile, getStoredProfile, logInUser, logOutUser } from '../../services/auth';
import { UserProfileMenu } from './UserProfileMenu';
import { SettingsModal } from './SettingsModal';
import { UpgradeModal } from './UpgradeModal';
import { RecordModal } from './RecordModal';
import { UploadModal } from './UploadModal';
import { YouTubeModal } from './YouTubeModal';
import ModernLoginSignup from '../ui/modern-login-signup';
import ThinkingState from '../ui/thinking';

type Page = 'home' | 'library' | 'favorites';
const tabs: { id: StudyTab; label: string; icon: typeof BookOpen; suffix: string }[] = [
  { id: 'chat', label: 'Ask Blast', icon: Sparkles, suffix: '/chat' },
  { id: 'learn', label: 'Learn', icon: Compass, suffix: '' },
  { id: 'notes', label: 'Notes', icon: FileText, suffix: '/editor' },
  { id: 'cards', label: 'Flashcards', icon: Layers, suffix: '/flashcards' },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle, suffix: '/quiz' },
  { id: 'audio', label: 'Listen', icon: Headphones, suffix: '/podcast' },
  { id: 'sources', label: 'Sources', icon: BookOpen, suffix: '/source' }
];

export function StudyWorkspace() {
  const [session, setSession] = useState<any>(null);
  const settings: StudySettings = { questionCount: 5, cardCount: 8, difficulty: 'beginner', language: 'English' };
  const [conversation, setConversation] = useState<{
    role: 'user' | 'assistant';
    text: string;
    suggestedAction?: { type: 'create_notebook'; topic: string; label: string };
    quickPrompts?: string[];
    studyPack?: TurboStudyPack;
    isStreaming?: boolean;
    thoughtTime?: number;
    thoughtTopic?: string;
  }[]>([]);
  const streamTimerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);
  const [connectionError, setConnectionError] = useState('');
  const [generationPhase, setGenerationPhase] = useState('Getting started');
  const [planningMode, setPlanningMode] = useState(false);
  const [documentIds, setDocumentIds] = useState<string[]>([]);
  const [attachedImage, setAttachedImage] = useState<{ id?: string; previewUrl: string; name: string } | null>(null);
  const [folder, setFolder] = useState('');
  const [route, setRoute] = useState<RouteState>(router.getState());
  const [page, setPage] = useState<Page>('home');
  const [packs, setPacks] = useState<TurboStudyPack[]>([]);
  const booted = useRef(false);
  const [favorites, setFavorites] = useState<string[]>(() => readLocal('blast_favorites', []));
  const [query, setQuery] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState<'record' | 'upload' | 'youtube' | 'settings' | 'upgrade' | 'auth' | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredProfile());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('blast_theme') as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [name, setName] = useState<string>(() => userProfile.name || readLocal('blast_display_name', 'Student'));
  const [filter, setFilter] = useState<'all' | 'progress' | 'completed'>('all');
  const [sort, setSort] = useState('recent');
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();

  const active = route.noteId ? packs.find(p => p.id === route.noteId) : undefined;
  const studyTab: StudyTab = ({ notes_chat: 'chat', notes_editor: 'notes', notes_flashcards: 'cards', notes_quiz: 'quiz', notes_podcast: 'audio', notes_source: 'sources' } as Record<string, StudyTab>)[route.routeName] || 'learn';
  const inStudy = !!route.noteId;
  const allPacks = packs;
  const visiblePacks = allPacks
    .filter(p => (page !== 'favorites' || favorites.includes(p.id)) && p.topic.toLowerCase().includes(query.toLowerCase()) && (!folder || p.folder === folder) && (filter === 'all' || (filter === 'completed' ? progress(p) === 100 : progress(p) < 100)))
    .sort((a, b) => sort === 'name' ? a.topic.localeCompare(b.topic) : b.createdAt.localeCompare(a.createdAt));

  async function refreshWorkspace() {
    try {
      const current = await request('/session');
      setSession(current);
      setConnectionError('');
      const data = await request('/notebooks');
      const loaded = (data.notebooks || []) as TurboStudyPack[];
      setPacks(loaded);
      setFavorites(loaded.filter(p => p.favorite).map(p => p.id));
      try { localStorage.removeItem('blast_example'); } catch {}
    } catch (e: any) {
      setConnectionError(e.message);
      setSession(null);
    }
  }

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    void refreshWorkspace();
    const job = sessionStorage.getItem('blast_active_job');
    if (job) {
      setGenerating(true);
      followStudy(job, setGenerationPhase).then(pack => {
        setPacks(prev => [pack, ...prev.filter(p => p.id !== pack.id)]);
        openPack(pack, 'notes');
      }).catch(e => setError(e.message)).finally(() => setGenerating(false));
    }
  }, []);

  useEffect(() => router.subscribe(next => {
    setRoute(next);
    window.scrollTo({ top: 0 });
  }), []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem('blast_theme', theme); } catch {}
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  function goHome(next: Page = 'home') {
    setConversation([]);
    setError('');
    setPage(next);
    setQuery('');
    setFilter('all');
    setFolder('');
    router.navigate('/dashboard');
  }

  function openPack(pack: TurboStudyPack, tab: StudyTab = 'learn') {
    router.navigate(`/notes/${pack.id}${tabs.find(t => t.id === tab)?.suffix || ''}`);
  }

  async function persist(pack: TurboStudyPack) {
    const saved = await saveRemote(pack);
    setPacks(prev => [saved, ...prev.filter(p => p.id !== saved.id)]);
  }

  async function toggleFavorite(id: string) {
    const p = allPacks.find(p => p.id === id);
    if (!p) return;
    const favorite = !favorites.includes(id);
    try {
      await persist({ ...p, favorite });
      setFavorites(prev => favorite ? [...prev, id] : prev.filter(x => x !== id));
    } catch (e: any) {
      setToast(e.message);
    }
  }

  async function clearAllHistory() {
    try {
      await request('/history', { method: 'DELETE' });
      setPacks([]);
      setFavorites([]);
      setDocumentIds([]);
      setAttachedImage(null);
      try {
        localStorage.removeItem('blast_favorites');
        localStorage.removeItem('blast_example');
      } catch {}
      setToast('All history and collections cleared. You have a fresh slate.');
      setModal(null);
    } catch (err: any) {
      setToast('Could not clear history: ' + err.message);
    }
  }

  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const previewUrl = URL.createObjectURL(file);
        setAttachedImage({ previewUrl, name: 'Pasted Screenshot' });
        setToast('Uploading pasted image…');
        try {
          const body = new FormData();
          body.append('file', file, 'pasted-image.png');
          const doc = await request<any>('/documents', { method: 'POST', body });
          setDocumentIds(prev => [...prev, doc.id]);
          setAttachedImage({ id: doc.id, previewUrl, name: 'Pasted Screenshot' });
          setToast('Image attached! Ask Blast anything about this image.');
        } catch (err: any) {
          setToast('Could not process image: ' + err.message);
        }
        break;
      }
    }
  }

  function removeAttachedImage() {
    if (attachedImage?.id) {
      setDocumentIds(prev => prev.filter(id => id !== attachedImage.id));
    }
    setAttachedImage(null);
  }

  async function createNotebookForTopic(topic: string, title?: string) {
    const raw = topic.trim();
    if (!raw || generating) return;
    setPlanningMode(true);
    setGenerating(true);
    setError('');
    setGenerationPhase('Planning your study pack');
    try {
      const ids = title ? active?.documentIds || [] : documentIds;
      const pack = await createStudy(ids.length ? 'Create a study set for ' + (title || raw) : raw, ids, settings, setGenerationPhase);
      setPacks(prev => [pack, ...prev.filter(p => p.id !== pack.id)]);
      setPrompt('');
      setAttachedImage(null);
      
      // Provide an interactive Study Pack Component with direct links to notes, flashcards, quiz, podcast, and plan
      setConversation(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `I've created your study pack on **${pack.topic}**! You can open notes, flashcards, or take a practice quiz below:`,
          studyPack: pack
        }
      ]);
      setToast('Your study notebook is ready.');
    } catch (e: any) {
      setError(e.message || 'Study generation is temporarily unavailable. Please try again.');
    } finally {
      setGenerating(false);
      setPlanningMode(false);
    }
  }

  async function generate(topic: string, title?: string) {
    const raw = topic.trim() || (attachedImage ? 'Explain and analyze this attached image, summarizing its core concepts, formulas, and diagrams.' : '');
    if (!raw || generating) return;

    if (title || isNotebookIntent(raw) || (documentIds.length > 0 && isNotebookIntent(raw))) {
      await createNotebookForTopic(raw, title);
      return;
    }

    if (raw.length < 2 && !attachedImage) {
      setError('Tell me a little more about what you’d like to learn.');
      return;
    }

    const currentHistory = conversation.map(c => ({ role: c.role, text: c.text }));
    setConversation(prev => [...prev, { role: 'user', text: raw }]);
    setPrompt('');
    setPlanningMode(false);
    setGenerating(true);
    setError('');
    setGenerationPhase('Thinking');
    const startTime = Date.now();

    try {
      const chatRes = await sendChat(raw, currentHistory);
      const elapsedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      setGenerating(false);

      // Start word-by-word streaming typewriter effect (like ChatGPT, Gemini & Claude)
      const replyText = chatRes.reply || '';
      const tokens = replyText.match(/(\s+|\S+)/g) || [replyText];

      // Append initial streaming assistant message
      setConversation(prev => [
        ...prev,
        {
          role: 'assistant',
          text: '',
          isStreaming: true,
          thoughtTime: elapsedSec,
          thoughtTopic: raw
        }
      ]);

      // Progressive typewriter streaming
      await new Promise<void>(resolve => {
        let currentIdx = 0;
        const tokensPerTick = tokens.length > 500 ? 3 : tokens.length > 200 ? 2 : 1;
        const tickInterval = 20;

        if (streamTimerRef.current) clearInterval(streamTimerRef.current);

        streamTimerRef.current = setInterval(() => {
          currentIdx += tokensPerTick;
          if (currentIdx >= tokens.length) {
            currentIdx = tokens.length;
            clearInterval(streamTimerRef.current);
            streamTimerRef.current = null;

            setConversation(prev => {
              const copy = [...prev];
              const lastIdx = copy.length - 1;
              if (lastIdx >= 0 && copy[lastIdx].role === 'assistant') {
                copy[lastIdx] = {
                  ...copy[lastIdx],
                  text: replyText,
                  isStreaming: false,
                  suggestedAction: chatRes.suggestedAction,
                  quickPrompts: chatRes.quickPrompts
                };
              }
              return copy;
            });
            resolve();
          } else {
            const partial = tokens.slice(0, currentIdx).join('');
            setConversation(prev => {
              const copy = [...prev];
              const lastIdx = copy.length - 1;
              if (lastIdx >= 0 && copy[lastIdx].role === 'assistant') {
                copy[lastIdx] = {
                  ...copy[lastIdx],
                  text: partial,
                  isStreaming: true
                };
              }
              return copy;
            });
          }
        }, tickInterval);
      });
    } catch (e: any) {
      setError('Could not reach Blast AI right now. Please try again shortly.');
      setGenerating(false);
    }
  }

  function exportNotes(pack: TurboStudyPack) {
    const content = `# ${pack.notes.title}\n\n${pack.notes.summary}\n\n${pack.notes.sections.map(s => `## ${s.heading}\n\n${s.content}\n${(s.bulletPoints || []).map(b => `- ${b}`).join('\n')}\n${(s.formulas || []).join('\n')}\n${s.codeSnippet ? '\n```' + s.codeSnippet.language + '\n' + s.codeSnippet.code + '\n```' : ''}`).join('\n\n')}`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.topic.replace(/[^a-z0-9]/gi, '-').slice(0, 70)}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const motionProps = reducedMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

  const composer = (
    <form
      className={`topic-composer ${generating ? 'busy' : ''}`}
      onSubmit={e => {
        e.preventDefault();
        generate(prompt);
      }}
    >
      <label className="sr-only" htmlFor="study-topic">
        What would you like to learn?
      </label>

      {/* Pasted image chip */}
      {attachedImage && (
        <div className="composer-pasted-chip">
          <img src={attachedImage.previewUrl} alt="Attached" />
          <div className="chip-info">
            <strong>{attachedImage.name}</strong>
            <small>{attachedImage.id ? 'Attached & analyzed' : 'Uploading image…'}</small>
          </div>
          <button
            type="button"
            onClick={removeAttachedImage}
            aria-label="Remove attached image"
            title="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <textarea
        id="study-topic"
        ref={promptRef}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onPaste={handlePaste}
        disabled={generating}
        maxLength={4000}
        placeholder={
          conversation.length
            ? 'Ask Blast a question, or paste an image (Ctrl+V)…'
            : 'Ask Blast to explain a concept, quiz your knowledge, or paste an image (Ctrl+V)…'
        }
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            generate(prompt);
          }
        }}
      />
      <div className="composer-toolbar">
        <button
          type="button"
          className="attachment-button"
          onClick={() => setModal('record')}
        >
          <Mic size={17} />
          Record
        </button>
        <button
          type="button"
          className="attachment-button"
          onClick={() => setModal('upload')}
        >
          <Upload size={17} />
          Upload
        </button>
        <button
          type="button"
          className="attachment-button"
          onClick={() => setModal('youtube')}
        >
          <Youtube size={17} />
          YouTube
        </button>
        <button
          className="send-button"
          aria-label="Send message"
          disabled={generating || (!prompt.trim() && !attachedImage)}
        >
          {generating ? <Loader2 className="spin" size={21} /> : <ArrowUp size={23} />}
        </button>
      </div>
    </form>
  );

  return (
    <div className={`studio astra-studio ${inStudy ? 'lesson-mode' : 'home-mode'} ${conversation.length && !inStudy ? 'conversation-mode' : ''} ${theme === 'dark' ? 'dark' : ''}`} data-theme={theme}>
      <header className="astra-header">
        <button className="astra-brand" onClick={() => goHome()} aria-label="Blast AI home">
          <BlastMascot size="avatar" decorative />
          <strong>blast ai</strong>
        </button>
        {inStudy && (
          <div className="astra-breadcrumb">
            <button onClick={() => goHome()}><Home size={16} />Home</button>
            <ChevronRight size={14} />
            <span>{active?.topic || 'Lesson'}</span>
          </div>
        )}
        <div className="astra-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button className="text-button" onClick={() => goHome('library')}>My lessons</button>
          <UserProfileMenu
            profile={userProfile}
            onOpenSettings={() => setModal('settings')}
            onOpenUpgrade={() => setModal('upgrade')}
            onOpenSignIn={() => setModal('auth')}
            onLogOut={() => {
              const updated = logOutUser();
              setUserProfile(updated);
              setName('');
              setToast('Logged out successfully.');
            }}
            currentTheme={theme === 'dark' ? 'Dark' : 'Light'}
            onToggleTheme={() => {
              const next = theme === 'dark' ? 'light' : 'dark';
              setTheme(next);
              try { localStorage.setItem('blast_theme', next); } catch {}
              setToast(`Switched to ${next} theme.`);
            }}
          />
        </div>
      </header>

      {inStudy && (
        <aside className="lesson-rail">
          <nav aria-label="Study tools">
            {tabs.map(t => (
              <button
                key={t.id}
                className={studyTab === t.id ? 'active' : ''}
                aria-current={studyTab === t.id ? 'page' : undefined}
                onClick={() => active && openPack(active, t.id)}
              >
                <t.icon size={23} />
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        </aside>
      )}

      <div className="studio-main">
        <main className="studio-content">
          {!inStudy && conversation.length > 0 ? (
            <div className="welcome-conversation">
              <button className="back-link" onClick={() => goHome()}>
                <ArrowLeft size={17} />Back
              </button>
              <div className="welcome-messages" aria-live="polite">
                {conversation.map((m, i) => (
                  <div key={i} className={m.role === 'user' ? 'welcome-user' : 'welcome-assistant'}>
                    {m.role === 'assistant' && (
                      <span className="reply-spark">
                        <BlastMascot size="small" decorative />
                      </span>
                    )}
                    <div className="welcome-message-body">
                      {m.role === 'assistant' ? (
                        <div className="assistant-rich-text">
                          {m.thoughtTime ? (
                            <div className="thought-summary-badge" title="Reasoning trace">
                              <Sparkles size={13} />
                              <span>Thought for {m.thoughtTime}s</span>
                            </div>
                          ) : null}
                          <RichMarkdown content={m.text} isStreaming={m.isStreaming} />
                        </div>
                      ) : (
                        <p>{m.text}</p>
                      )}
                      {m.studyPack && (
                        <div
                          className="study-pack-card"
                          style={{
                            marginTop: '16px',
                            padding: '18px 20px',
                            borderRadius: '20px',
                            background: 'var(--canvas, #f1f2f3)',
                            border: '1.5px solid var(--line, #e2e4e8)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            maxWidth: '560px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: 'var(--purple, #6650b5)',
                                color: '#ffffff',
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0
                              }}>
                                <BookOpen size={20} />
                              </div>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '15.5px', fontWeight: 650, color: 'var(--ink, #1f2124)' }}>
                                  {m.studyPack.topic}
                                </h4>
                                <span style={{ fontSize: '12px', color: 'var(--ink-2, #62656b)' }}>
                                  {m.studyPack.notes.sections.length} Notes · {m.studyPack.flashcards.cards.length} Cards · {m.studyPack.quiz.questions.length} Quiz Qs
                                </span>
                              </div>
                            </div>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 650,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              padding: '3px 8px',
                              borderRadius: '8px',
                              background: 'var(--green, #189a4d)',
                              color: '#ffffff'
                            }}>
                              Ready
                            </span>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                            gap: '8px',
                            marginTop: '4px'
                          }}>
                            <button
                              type="button"
                              onClick={() => openPack(m.studyPack!, 'notes')}
                              className="study-tab-link-btn"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '9px 12px',
                                borderRadius: '12px',
                                background: 'var(--surface, #ffffff)',
                                border: '1px solid var(--line, #e2e4e8)',
                                color: 'var(--ink, #1f2124)',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <FileText size={15} color="var(--purple, #6650b5)" />
                              <span>Open Notes</span>
                              <ArrowRight size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openPack(m.studyPack!, 'cards')}
                              className="study-tab-link-btn"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '9px 12px',
                                borderRadius: '12px',
                                background: 'var(--surface, #ffffff)',
                                border: '1px solid var(--line, #e2e4e8)',
                                color: 'var(--ink, #1f2124)',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Layers size={15} color="var(--accent, #0285ff)" />
                              <span>Flashcards</span>
                              <ArrowRight size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openPack(m.studyPack!, 'quiz')}
                              className="study-tab-link-btn"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '9px 12px',
                                borderRadius: '12px',
                                background: 'var(--surface, #ffffff)',
                                border: '1px solid var(--line, #e2e4e8)',
                                color: 'var(--ink, #1f2124)',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <HelpCircle size={15} color="var(--orange, #ef720c)" />
                              <span>Start Quiz</span>
                              <ArrowRight size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openPack(m.studyPack!, 'audio')}
                              className="study-tab-link-btn"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '9px 12px',
                                borderRadius: '12px',
                                background: 'var(--surface, #ffffff)',
                                border: '1px solid var(--line, #e2e4e8)',
                                color: 'var(--ink, #1f2124)',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Headphones size={15} color="var(--green, #189a4d)" />
                              <span>Listen Recap</span>
                              <ArrowRight size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openPack(m.studyPack!, 'learn')}
                              className="study-tab-link-btn"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '9px 12px',
                                borderRadius: '12px',
                                background: 'var(--surface, #ffffff)',
                                border: '1px solid var(--line, #e2e4e8)',
                                color: 'var(--ink, #1f2124)',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Compass size={15} color="var(--purple, #6650b5)" />
                              <span>View Plan</span>
                              <ArrowRight size={13} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                            </button>
                          </div>
                        </div>
                      )}
                      {m.suggestedAction && (
                        <div className="suggested-action-box" style={{ marginTop: '14px' }}>
                          <button
                            type="button"
                            className="dark-button create-node-action"
                            onClick={() => createNotebookForTopic(m.suggestedAction!.topic)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '14px', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}
                          >
                            <Sparkles size={16} />
                            <span>{m.suggestedAction.label}</span>
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      )}
                      {m.quickPrompts && m.quickPrompts.length > 0 && (
                        <div className="quick-prompts-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                          {m.quickPrompts.map((qp, qi) => (
                            <button
                              key={qi}
                              type="button"
                              className="subtle-button quick-prompt-pill"
                              onClick={() => isNotebookIntent(qp) ? createNotebookForTopic(qp) : generate(qp)}
                              style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer' }}
                            >
                              {qp}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {generating && planningMode && (
                  <div className="welcome-assistant blast-thinking-container" role="status">
                    <div className="thinking-bubble">
                      <div className="thinking-header-row">
                        <BlastMascot pose="working" size="small" decorative />
                        <div className="thinking-title-text">
                          <span>AI Blast is planning study pack</span>
                          <span className="thinking-dots-anim" aria-label="...">
                            <span className="dot-1">.</span>
                            <span className="dot-2">.</span>
                            <span className="dot-3">.</span>
                          </span>
                        </div>
                      </div>
                      <div className="thinking-starter-wrapper">
                        <ThinkingState
                          variant="Steps"
                          phase={generationPhase}
                          topic={conversation.filter(m => m.role === 'user').slice(-1)[0]?.text}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {generating && !planningMode && (
                  <div className="welcome-assistant blast-thinking-container" role="status">
                    <div className="thinking-bubble">
                      <div className="thinking-header-row">
                        <BlastMascot pose="reading" size="small" decorative />
                        <div className="thinking-title-text">
                          <span>AI Blast is thinking</span>
                          <span className="thinking-dots-anim" aria-label="...">
                            <span className="dot-1">.</span>
                            <span className="dot-2">.</span>
                            <span className="dot-3">.</span>
                          </span>
                        </div>
                      </div>
                      <div className="thinking-starter-wrapper">
                        <ThinkingState
                          variant="Reasoning"
                          topic={conversation.filter(m => m.role === 'user').slice(-1)[0]?.text}
                          phase="Analyzing concepts and formulating answer"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
                {error && (
                  <div className="conversation-error" role="alert">
                    <p>{error}</p>
                    <button
                      className="text-button"
                      onClick={() => {
                        const last = conversation.filter(m => m.role === 'user').slice(-1)[0];
                        if (last) {
                          setPrompt(last.text);
                          setError('');
                          promptRef.current?.focus();
                        }
                      }}
                    >
                      Edit and try again
                    </button>
                  </div>
                )}
              </div>
              <div className="conversation-input">{composer}</div>
            </div>
          ) : !inStudy ? (
            <motion.div key={page} {...motionProps}>
              {page === 'home' ? (
                <section className="astra-welcome">
                  <div className="astra-start">
                    <h1>Make room for<br /><em>your next idea.</em></h1>
                    <p className="astra-intro">
                      Bring your curiosity. Turn a question, a document, or a lecture into something you understand.
                    </p>
                    {composer}
                    {generating && (
                      <div className="blast-thinking-card" style={{ marginTop: '20px', padding: '16px 20px', borderRadius: '18px', background: 'var(--canvas, #f1f2f3)', border: '1px solid var(--line, #e2e4e8)' }}>
                        <ThinkingState variant="Steps" phase={generationPhase} />
                      </div>
                    )}
                    {error && <p className="conversation-error" role="alert">{error}</p>}
                    <div className="prompt-starters">
                      <span>Try a starting point</span>
                      {['Explain a difficult concept', 'Help me prepare for an exam', 'Create a study plan'].map(text => (
                        <button
                          key={text}
                          onClick={() => {
                            setPrompt(text);
                            promptRef.current?.focus();
                          }}
                        >
                          {text}<ArrowUpRight size={13} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <aside className="astra-focus">
                    <div className="focus-heading">
                      <span>THE LEARNING STUDIO</span>
                      <Sparkles size={19} />
                    </div>
                    <div className="focus-companion">
                      <BlastMascot pose="reading" size="hero" />
                    </div>
                    <h2>A little focus.<br />A lasting difference.</h2>
                    <p>One place to understand, practise, and make it stick.</p>
                    <div className="study-methods">
                      <span><FileText size={18} /><strong>Understand</strong><small>Notes with context</small></span>
                      <span><Layers size={18} /><strong>Remember</strong><small>Active recall</small></span>
                      <span><Headphones size={18} /><strong>Revisit</strong><small>Listen and reflect</small></span>
                    </div>
                    {packs.length > 0 && (
                      <button className="resume-lesson" onClick={() => openPack(packs[0])}>
                        <span className="resume-caption">PICK UP WHERE YOU LEFT OFF</span>
                        <strong>{packs[0].topic}</strong>
                        <span>Continue learning <ArrowRight size={16} /></span>
                      </button>
                    )}
                  </aside>
                </section>
              ) : (
                <div className="page-heading">
                  <h1>{page === 'favorites' ? 'Your favorites' : 'Your lessons'}</h1>
                  <button className="subtle-button" onClick={() => goHome()}>
                    New lesson <Plus size={16} />
                  </button>
                </div>
              )}

              <section className="library-section">
                <div className="section-heading">
                  <h2>
                    {page === 'favorites' ? 'Your favorites' : page === 'home' ? 'Your collection' : 'All lessons'}
                    <span className="count-badge">{visiblePacks.length}</span>
                  </h2>
                  {page === 'home' ? (
                    <button className="text-button" onClick={() => goHome('library')}>
                      View library <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button className="subtle-button" onClick={() => setModal('upload')}>
                      <Plus size={15} /> Add notes
                    </button>
                  )}
                </div>

                <div className={`library-toolbar ${page === 'home' ? 'home-library-toolbar' : ''}`}>
                  <div className="filter-tabs" aria-label="Filter notebooks">
                    {(['all', 'progress', 'completed'] as const).map(f => (
                      <button
                        key={f}
                        aria-pressed={filter === f}
                        className={filter === f ? 'active' : ''}
                        onClick={() => setFilter(f)}
                      >
                        {f === 'all' ? 'All notebooks' : f === 'progress' ? 'In progress' : 'Completed'}
                      </button>
                    ))}
                  </div>
                  <div className="library-tools">
                    <select aria-label="Filter by folder" value={folder} onChange={e => setFolder(e.target.value)}>
                      <option value="">All folders</option>
                      {[...new Set(packs.map(p => p.folder).filter(Boolean))].map(f => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                    <label className="library-search">
                      <Search size={15} />
                      <input
                        ref={searchRef}
                        aria-label="Search notebooks"
                        placeholder="Search notebooks"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                      />
                    </label>
                    <select aria-label="Sort notebooks" value={sort} onChange={e => setSort(e.target.value)}>
                      <option value="recent">Recent first</option>
                      <option value="name">A–Z</option>
                    </select>
                  </div>
                </div>

                <div className="notebook-grid astra-lesson-list">
                  {visiblePacks.map((p, index) => (
                    <motion.article {...motionProps} key={p.id} className="notebook-card">
                      <div className="notebook-card-top">
                        <span className={`notebook-icon tone-${index % 3}`}>
                          <BookOpen size={21} />
                        </span>
                        <button
                          className={`favorite-button ${favorites.includes(p.id) ? 'is-favorite' : ''}`}
                          onClick={() => toggleFavorite(p.id)}
                          aria-label={`${favorites.includes(p.id) ? 'Unfavorite' : 'Favorite'} ${p.topic}`}
                          aria-pressed={favorites.includes(p.id)}
                        >
                          <Star size={17} fill={favorites.includes(p.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <button className="notebook-open" onClick={() => openPack(p)}>
                        <h3>{p.topic}</h3>
                        <p>{p.notes.summary || 'A fresh space for your next discovery.'}</p>
                      </button>
                      <div className="notebook-meta">
                        <span><FileText size={12} />{p.notes.sections.length} sections</span>
                        <span><Layers size={12} />{p.flashcards.cards.length} cards</span>
                      </div>
                      <div className="card-progress">
                        <span style={{ width: `${progress(p)}%` }} />
                      </div>
                      <div className="notebook-footer">
                        <span>{progress(p) ? `${progress(p)}% explored` : 'Ready when you are'}</span>
                        <button aria-label={`Open ${p.topic}`} onClick={() => openPack(p)}>
                          <ArrowUpRight size={17} />
                        </button>
                      </div>
                    </motion.article>
                  ))}
                  {!query && page !== 'favorites' && filter === 'all' && (
                    <button className="new-card" onClick={() => setModal('upload')}>
                      <span><Plus size={23} /></span>
                      <strong>Room for your next idea</strong>
                      <p>Add your notes and make<br />something of them.</p>
                    </button>
                  )}
                </div>

                {visiblePacks.length === 0 && (
                  <div className="empty-state">
                    <BookOpen size={36} />
                    <h3>{page === 'favorites' ? 'Your favorites start here' : 'No study notebooks yet'}</h3>
                    <p>
                      {page === 'favorites'
                        ? 'Tap the star on a notebook to keep it close.'
                        : 'Your collection is fresh and clean. Ask Blast anything above, record a lecture, or import notes to create your first notebook.'}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button className="subtle-button" onClick={() => setModal('record')}><Mic size={14} /> Record Lecture</button>
                      <button className="subtle-button" onClick={() => setModal('upload')}><Upload size={14} /> Upload Notes</button>
                      <button className="subtle-button" onClick={() => setModal('youtube')}><Youtube size={14} /> YouTube Video</button>
                    </div>
                  </div>
                )}
              </section>

              {connectionError && (
                <p className="connection-note">
                  Your saved lessons couldn’t be loaded. <button onClick={() => refreshWorkspace()}>Reconnect</button>
                </p>
              )}
            </motion.div>
          ) : !active ? (
            <div className="empty-state">
              <BookOpen size={32} />
              <h1>Notebook not found</h1>
              <p>This notebook isn’t saved on this device.</p>
              <button className="dark-button" onClick={() => goHome()}>
                Back to your workspace
              </button>
            </div>
          ) : (
            <motion.div key={active.id} {...motionProps}>
              <button className="back-link" onClick={() => goHome('library')}>
                <ArrowLeft size={15} />Back to library
              </button>
              <div className="study-heading">
                <div className="lesson-cat">
                  <BlastMascot pose={progress(active) === 100 ? "graduate" : "explorer"} size="small" decorative />
                </div>
                <div>
                  <p className="eyebrow">YOUR STUDY NOTEBOOK</p>
                  <h1>{active.topic}</h1>
                  <p>Your interactive study workspace</p>
                </div>
                <div className="notebook-actions">
                  <input
                    aria-label="Notebook folder"
                    placeholder="Add to folder…"
                    value={active.folder || ''}
                    maxLength={60}
                    onChange={e => setPacks(prev => prev.map(p => p.id === active.id ? { ...p, folder: e.target.value } : p))}
                    onBlur={() => { persist(active).catch(e => setToast(e.message)); }}
                  />
                  <button className="subtle-button" onClick={() => exportNotes(active)}>
                    <Download size={16} />Export notes
                  </button>
                </div>
              </div>

              <nav className="study-tabs duplicate-study-tabs" aria-label="Study tools">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    className={studyTab === t.id ? 'active' : ''}
                    aria-current={studyTab === t.id ? 'page' : undefined}
                    onClick={() => openPack(active, t.id)}
                  >
                    <t.icon size={17} />{t.label}
                  </button>
                ))}
              </nav>

              {studyTab === 'learn' && active.roadmap.stages.length > 0 && (
                <div className="lesson-continue">
                  <button className="dark-button" onClick={() => openPack(active, 'notes')}>
                    Continue <ArrowRight size={20} />
                  </button>
                  <div>
                    <small>UP NEXT</small>
                    <strong>
                      {active.roadmap.stages.flatMap(s => s.milestones).find(m => !m.completed)?.title || 'Review what you’ve learned'}
                    </strong>
                  </div>
                  <span>{progress(active)}% complete</span>
                </div>
              )}

              <motion.section key={`${active.id}-${studyTab}`} {...motionProps} className="study-panel">
                <StudyTools key={`${active.id}-${studyTab}`} pack={active} tab={studyTab} save={persist} notify={setToast} />
                {!active.roadmap.stages.length && studyTab !== 'sources' && (
                  <div className="generate-tools">
                    <button
                      className="dark-button"
                      disabled={generating}
                      onClick={() => {
                        const text = active.notes.sections.map(s => s.content).join('\n');
                        if (!active.documentIds?.length && text.length > 12000) {
                          setError('For now, generate activities from a notebook with fewer than 12,000 characters. Your full notes are still saved.');
                          return;
                        }
                        generate(`Create study materials from these notes: ${text}`, active.topic);
                      }}
                    >
                      {generating ? <Loader2 className="spin" size={16} /> : <Sparkles size={16} />}
                      Generate study activities
                    </button>
                    {error && <p className="inline-error" role="alert">{error}</p>}
                  </div>
                )}
              </motion.section>

              <div className="bottom-note">
                <BookOpen size={14} />
                <span>Learning is a journey. Make this space your own.</span>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="studio-toast" role="status">
            <CheckCircle2 size={17} />{toast}
            <button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      {modal === 'settings' && (
        <SettingsModal
          profile={userProfile}
          onClose={() => setModal(null)}
          onUpdateProfile={(updated) => {
            setUserProfile(updated);
            setName(updated.name);
            setToast('Profile updated');
          }}
          onOpenUpgrade={() => setModal('upgrade')}
          onOpenLibrary={() => {
            setModal(null);
            goHome('library');
          }}
          onOpenDraftUploads={() => {
            setModal('upload');
            setToast('Upload study materials');
          }}
          onClearAllHistory={clearAllHistory}
          onLogOut={() => {
            const updated = logOutUser();
            setUserProfile(updated);
            setName('');
            setModal(null);
            setToast('Logged out successfully.');
          }}
        />
      )}

      {/* Upgrade Modal */}
      {modal === 'upgrade' && (
        <UpgradeModal
          profile={userProfile}
          onClose={() => setModal(null)}
          onPlanUpgraded={(updated) => {
            setUserProfile(updated);
            setToast('Welcome to Blast AI Pro!');
          }}
        />
      )}

      {/* Modern Login/Signup Modal */}
      {modal === 'auth' && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(5, 5, 8, 0.88)',
            backdropFilter: 'blur(8px)',
            overflowY: 'auto'
          }}
        >
          <ModernLoginSignup
            onSuccess={(user) => {
              const updated = logInUser(user?.name, user?.email);
              setUserProfile(updated);
              setName(updated.name);
              setModal(null);
              setToast(`Welcome back, ${updated.name}!`);
            }}
            onCancel={() => setModal(null)}
          />
        </div>
      )}

      {/* Dedicated Record Studio Modal */}
      {modal === 'record' && (
        <RecordModal
          onClose={() => setModal(null)}
          onNotebookCreated={(pack) => {
            setPacks(prev => [pack, ...prev]);
            openPack(pack, 'notes');
            setToast('Lecture recorded and study notebook created!');
          }}
          onToast={setToast}
        />
      )}

      {/* Dedicated Upload Studio Modal */}
      {modal === 'upload' && (
        <UploadModal
          onClose={() => setModal(null)}
          onNotebookCreated={(pack) => {
            setPacks(prev => [pack, ...prev]);
            openPack(pack, 'notes');
            setToast('Study notebook created from upload!');
          }}
          onToast={setToast}
        />
      )}

      {/* Dedicated YouTube Studio Modal */}
      {modal === 'youtube' && (
        <YouTubeModal
          onClose={() => setModal(null)}
          onNotebookCreated={(pack) => {
            setPacks(prev => [pack, ...prev]);
            openPack(pack, 'notes');
            setToast('Study notebook created from YouTube video!');
          }}
          onToast={setToast}
        />
      )}
    </div>
  );
}
