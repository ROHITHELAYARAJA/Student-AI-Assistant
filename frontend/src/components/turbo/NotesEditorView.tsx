import React, { useState, useEffect, useRef } from 'react';
import { router } from '../../services/router.js';
import { BlastMascot } from './BlastMascot.js';
import { getStudyPack, fetchStudyPack, saveStudyPack, getSavedStudyPacks } from '../../services/turboApi.js';
import { TurboStudyPack, TurboNotes } from '../../types/turbo.js';
import {
  BookOpen,
  FileText,
  Award,
  Layers,
  Headphones,
  FolderGit2,
  Sparkles,
  Share2,
  Bold,
  Italic,
  Underline,
  Sigma,
  Eye,
  Edit3,
  ArrowUp,
  X,
  Code2,
  CheckCircle2,
  Download,
  Loader2,
  Save,
  Check
} from 'lucide-react';

interface NotesEditorViewProps {
  noteId?: string;
  topicTitle?: string;
  onOpenUpgrade?: () => void;
}

export const NotesEditorView: React.FC<NotesEditorViewProps> = ({
  noteId = 'current',
  topicTitle,
  onOpenUpgrade
}) => {
  const [studyPack, setStudyPack] = useState<TurboStudyPack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState(15);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const [editorMode, setEditorMode] = useState<'interactive' | 'markdown'>('interactive');
  const [isSaved, setIsSaved] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([]);

  // Editable document state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSummary, setNoteSummary] = useState('');
  const [takeaways, setTakeaways] = useState<string[]>([]);
  const [sections, setSections] = useState<Array<{
    heading: string;
    content: string;
    bulletPoints?: string[];
    codeSnippet?: { language: string; code: string };
    formulas?: string[];
  }>>([]);
  const [rawMarkdown, setRawMarkdown] = useState('');

  const activeInputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const rawTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    let pack = getStudyPack(noteId);
    if (!pack && topicTitle) {
      pack = getStudyPack(topicTitle);
    }
    if (!pack) {
      const allPacks = getSavedStudyPacks();
      if (allPacks.length > 0) {
        pack = allPacks[0];
      }
    }

    if (pack) {
      setStudyPack(pack);
      syncNoteData(pack.notes, pack.topic);
    } else if (topicTitle) {
      setIsLoading(true);
      fetchStudyPack(topicTitle)
        .then((newPack) => {
          setStudyPack(newPack);
          syncNoteData(newPack.notes, newPack.topic);
        })
        .catch((err) => console.error('Failed to load study pack:', err))
        .finally(() => setIsLoading(false));
    }
  }, [noteId, topicTitle]);

  const syncNoteData = (notes: TurboNotes, topicFallback: string) => {
    const title = notes?.title || `Mastery Notes: ${topicFallback}`;
    const summary = notes?.summary || `Structured comprehensive study guide and key takeaways for ${topicFallback}.`;
    const tways = notes?.keyTakeaways || [
      'Master core runtime semantics and structural invariants.',
      'Understand boundary edge-cases and error handling.',
      'Analyze asymptotic space and time tradeoffs.'
    ];
    const secs = notes?.sections || [
      {
        heading: '1. Architecture & Execution Foundations',
        content: `When learning ${topicFallback}, building an accurate mental model is crucial. Start by understanding how code gets transformed into execution instructions.`,
        bulletPoints: [
          'Memory lifecycle: Stack vs Heap allocation dynamics',
          'Execution pipeline: Compilation, interpretation, and runtime optimizations',
          'Scope rules and variable lifetime guarantees'
        ],
        codeSnippet: {
          language: 'typescript',
          code: `// Core idiom demonstration\nexport function solveCore(): void {\n  console.log("Mastering ${topicFallback} with Blast AI!");\n}`
        }
      }
    ];

    setNoteTitle(title);
    setNoteSummary(summary);
    setTakeaways(tways);
    setSections(secs);

    // Build raw markdown
    const md = `# ${title}\n\n${summary}\n\n## Key Takeaways\n${tways.map(t => `- ${t}`).join('\n')}\n\n` +
      secs.map(s => `## ${s.heading}\n\n${s.content}\n\n${s.bulletPoints ? s.bulletPoints.map(b => `* ${b}`).join('\n') : ''}\n\n${s.codeSnippet ? '```' + s.codeSnippet.language + '\n' + s.codeSnippet.code + '\n```' : ''}`).join('\n\n');
    setRawMarkdown(md);
  };

  const handleSaveNotes = () => {
    if (!studyPack) return;
    const updatedNotes: TurboNotes = {
      topic: studyPack.topic,
      title: noteTitle,
      lastUpdated: 'Just now',
      summary: noteSummary,
      keyTakeaways: takeaways,
      sections: sections
    };
    const updatedPack: TurboStudyPack = {
      ...studyPack,
      notes: updatedNotes
    };
    setStudyPack(updatedPack);
    saveStudyPack(updatedPack);
    setIsSaved(true);
  };

  // Formatting actions that work on the currently active input or raw markdown textarea
  const applyFormatting = (formatType: 'bold' | 'italic' | 'underline' | 'formula' | 'code') => {
    setIsSaved(false);

    if (editorMode === 'markdown' && rawTextareaRef.current) {
      const el = rawTextareaRef.current;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const val = el.value;
      const selected = val.substring(start, end);

      let replacement = '';
      if (formatType === 'bold') replacement = `**${selected || 'Bold text'}**`;
      if (formatType === 'italic') replacement = `*${selected || 'Italic text'}*`;
      if (formatType === 'underline') replacement = `<u>${selected || 'Underlined text'}</u>`;
      if (formatType === 'formula') replacement = `\n$$ \\sum_{i=1}^n x_i = \\mu $$\n`;
      if (formatType === 'code') replacement = `\n\`\`\`typescript\n// Code snippet\nconst optimal = true;\n\`\`\`\n`;

      const newVal = val.substring(0, start) + replacement + val.substring(end);
      setRawMarkdown(newVal);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + replacement.length, start + replacement.length);
      }, 0);
      return;
    }

    // Interactive mode: insert into current active element or append to active section
    const activeEl = activeInputRef.current;
    if (activeEl) {
      const start = activeEl.selectionStart || 0;
      const end = activeEl.selectionEnd || 0;
      const val = activeEl.value;
      const selected = val.substring(start, end);

      let replacement = '';
      if (formatType === 'bold') replacement = `**${selected || 'Bold text'}**`;
      if (formatType === 'italic') replacement = `*${selected || 'Italic text'}*`;
      if (formatType === 'underline') replacement = `<u>${selected || 'Underlined text'}</u>`;
      if (formatType === 'formula') replacement = ` $$ \\sum_{i=1}^n x_i $$ `;
      if (formatType === 'code') replacement = ` \`${selected || 'codeSnippet()'}\` `;

      const newVal = val.substring(0, start) + replacement + val.substring(end);
      activeEl.value = newVal;
      // Trigger onChange
      const evt = new Event('input', { bubbles: true });
      activeEl.dispatchEvent(evt);
    } else {
      // If no input active, add formula or code snippet to the first section
      if (sections.length > 0) {
        const updated = [...sections];
        if (formatType === 'formula') {
          updated[0].formulas = [...(updated[0].formulas || []), 'E = mc^2 \\quad \\text{Invariant}'];
        } else if (formatType === 'code') {
          updated[0].codeSnippet = {
            language: 'typescript',
            code: '// Formatted Code Block\nfunction verifyState(): boolean {\n  return true;\n}'
          };
        } else if (formatType === 'bold') {
          updated[0].content += ' **Important Invariant**';
        } else if (formatType === 'italic') {
          updated[0].content += ' *Key emphasis*';
        } else if (formatType === 'underline') {
          updated[0].content += ' <u>Underlined note</u>';
        }
        setSections(updated);
      }
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    const userText = chatPrompt.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatPrompt('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Here is the high-yield breakdown for "${userText}": In ${studyPack?.topic || 'this subject'}, always prioritize fundamental execution boundaries, examine edge-case invariant conditions, and reinforce key concepts through active recall!`
        }
      ]);
    }, 450);
  };

  const handleExport = () => {
    const textContent = `${noteTitle}\n\nSummary:\n${noteSummary}\n\nKey Takeaways:\n${takeaways.map(t => `- ${t}`).join('\n')}\n\n${sections.map(s => `${s.heading}\n${s.content}\n${s.bulletPoints?.map(b => `* ${b}`).join('\n') || ''}`).join('\n\n')}`;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(studyPack?.topic || 'study').replace(/[^a-z0-9]/gi, '_')}_notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeTopic = studyPack?.topic || topicTitle || 'Active Study Subject';

  return (
    <div className="min-h-screen bg-[var(--color-bg,#0C0C11)] text-[var(--color-text,#F4F4F6)] flex flex-col font-body select-none">
      {/* Top Header */}
      <header className="h-14 px-5 flex items-center justify-between border-b border-[var(--color-border,#272738)] bg-[var(--color-bg,#0C0C11)]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.navigate('/dashboard')}>
            <img
              src="/blast-logo.png"
              alt="Blast AI"
              className="w-7 h-7 rounded-lg object-contain shadow-sm shadow-orange-500/30 bg-[#181824] p-0.5 border border-orange-500/20"
            />
            <span className="font-headline font-bold text-sm tracking-tight flex items-center gap-1">
              <span>blast</span>
              <span className="text-[#FF5E00]">ai</span>
            </span>
          </div>
          <span className="text-zinc-600">/</span>
          <span className="text-xs text-[var(--color-text-muted,#A1A1AA)] truncate max-w-[200px] md:max-w-xs font-medium">
            {activeTopic}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Status Button */}
          <button
            onClick={handleSaveNotes}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isSaved
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-[#FF5E00]/20 border-[#FF5E00]/40 text-[#FF5E00] hover:bg-[#FF5E00]/30'
            }`}
            title="Save notes to local storage"
          >
            {isSaved ? <Check size={13} /> : <Save size={13} />}
            <span>{isSaved ? 'Saved' : 'Save Changes'}</span>
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="p-1.5 rounded-xl border border-[var(--color-border,#272738)] hover:bg-[var(--color-surface-hover,#1E1E2C)] text-[var(--color-text-muted,#A1A1AA)] hover:text-white transition-colors"
            title="Export Notes as TXT"
          >
            <Download size={14} />
          </button>

          {/* Mode Switcher */}
          <button
            onClick={() => setEditorMode(editorMode === 'interactive' ? 'markdown' : 'interactive')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--color-border,#272738)] hover:bg-[var(--color-surface-hover,#1E1E2C)] text-xs text-[var(--color-text-muted,#A1A1AA)] hover:text-white transition-colors"
            title="Toggle between Interactive Document and Markdown Editor"
          >
            {editorMode === 'interactive' ? <Edit3 size={13} /> : <Eye size={13} />}
            <span className="text-[11px] font-medium">{editorMode === 'interactive' ? 'Markdown' : 'Interactive'}</span>
          </button>

          {/* Upgrade */}
          <button
            onClick={onOpenUpgrade}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-headline font-bold text-xs shadow-md shadow-orange-500/20 hover:scale-105 transition-all"
          >
            <Sparkles size={13} className="fill-black" />
            <span>Upgrade</span>
          </button>
        </div>
      </header>

      {/* Editor Formatting Ribbon */}
      <div className="h-11 px-5 border-b border-[var(--color-border,#272738)] bg-[var(--color-bg,#0C0C11)] flex items-center justify-between text-xs text-[var(--color-text-muted,#A1A1AA)] shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1">
          {/* Bold */}
          <button
            onClick={() => {
              setIsBoldActive(!isBoldActive);
              applyFormatting('bold');
            }}
            className={`p-1.5 rounded-lg hover:bg-[var(--color-surface-hover,#1E1E2C)] transition-colors ${
              isBoldActive ? 'bg-[#FF5E00]/20 text-[#FF5E00] font-bold' : ''
            }`}
            title="Bold (**text**)"
          >
            <Bold size={14} />
          </button>

          {/* Italic */}
          <button
            onClick={() => {
              setIsItalicActive(!isItalicActive);
              applyFormatting('italic');
            }}
            className={`p-1.5 rounded-lg hover:bg-[var(--color-surface-hover,#1E1E2C)] transition-colors ${
              isItalicActive ? 'bg-[#FF5E00]/20 text-[#FF5E00]' : ''
            }`}
            title="Italic (*text*)"
          >
            <Italic size={14} />
          </button>

          {/* Underline */}
          <button
            onClick={() => {
              setIsUnderlineActive(!isUnderlineActive);
              applyFormatting('underline');
            }}
            className={`p-1.5 rounded-lg hover:bg-[var(--color-surface-hover,#1E1E2C)] transition-colors ${
              isUnderlineActive ? 'bg-[#FF5E00]/20 text-[#FF5E00]' : ''
            }`}
            title="Underline (<u>text</u>)"
          >
            <Underline size={14} />
          </button>

          <div className="h-4 w-[1px] bg-[var(--color-border,#272738)] mx-1" />

          {/* LaTeX Formula */}
          <button
            onClick={() => applyFormatting('formula')}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover,#1E1E2C)] hover:text-[#FF5E00] transition-colors"
            title="Insert Math Formula ($$ \Sigma $$)"
          >
            <Sigma size={14} />
          </button>

          {/* Code Block */}
          <button
            onClick={() => applyFormatting('code')}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover,#1E1E2C)] hover:text-[#FF5E00] transition-colors"
            title="Insert Code Snippet (</>)"
          >
            <Code2 size={14} />
          </button>

          <div className="h-4 w-[1px] bg-[var(--color-border,#272738)] mx-1" />

          {/* Font Size Adjuster */}
          <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted,#A1A1AA)] font-mono">
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 1))}
              className="px-1.5 py-0.5 rounded hover:bg-[var(--color-surface-hover,#1E1E2C)] hover:text-white"
              title="Decrease font size"
            >
              -
            </button>
            <span className="w-5 text-center text-white font-bold">{fontSize}</span>
            <button
              onClick={() => setFontSize(Math.min(26, fontSize + 1))}
              className="px-1.5 py-0.5 rounded hover:bg-[var(--color-surface-hover,#1E1E2C)] hover:text-white"
              title="Increase font size"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              isChatOpen
                ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                : 'bg-[var(--color-surface,#181822)] border-[var(--color-border,#272738)] text-[var(--color-text-muted,#A1A1AA)] hover:text-white'
            }`}
          >
            <BlastMascot size="xs" state="listening" />
            <span>AI Study Copilot</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-20 bg-[var(--color-bg,#0C0C11)] border-r border-[var(--color-border,#272738)] flex flex-col items-center py-6 space-y-6 shrink-0">
          <button
            onClick={() => router.navigate(studyPack ? `/notes/${studyPack.id}` : '/notes/learn')}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted,#A1A1AA)] hover:text-white transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover,#1E1E2C)] flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Learn</span>
          </button>

          <button
            onClick={() => router.navigate(studyPack ? `/notes/${studyPack.id}/editor` : '/notes/editor')}
            className="flex flex-col items-center gap-1.5 text-[#FF5E00] group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#FF5E00]/20 border border-[#FF5E00]/40 flex items-center justify-center">
              <FileText size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">Notes</span>
          </button>

          <button
            onClick={() => router.navigate(studyPack ? `/notes/${studyPack.id}/quiz` : '/notes/quiz')}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted,#A1A1AA)] hover:text-white transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover,#1E1E2C)] flex items-center justify-center">
              <Award size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Quiz</span>
          </button>

          <button
            onClick={() => router.navigate(studyPack ? `/notes/${studyPack.id}/flashcards` : '/notes/flashcards')}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted,#A1A1AA)] hover:text-white transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover,#1E1E2C)] flex items-center justify-center">
              <Layers size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Flashcards</span>
          </button>

          <button
            onClick={() => router.navigate(studyPack ? `/notes/${studyPack.id}/podcast` : '/notes/podcast')}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted,#A1A1AA)] hover:text-white transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover,#1E1E2C)] flex items-center justify-center">
              <Headphones size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Podcast</span>
          </button>

          <button
            onClick={() => router.navigate(studyPack ? `/notes/${studyPack.id}/sources` : '/notes/sources')}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted,#A1A1AA)] hover:text-white transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover,#1E1E2C)] flex items-center justify-center">
              <FolderGit2 size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Sources</span>
          </button>
        </aside>

        {/* Notes Document Main Area */}
        <main
          className="flex-1 overflow-y-auto px-6 md:px-12 py-10 max-w-3xl mx-auto w-full space-y-8 select-text"
          style={{ fontSize: `${fontSize}px` }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Loader2 size={24} className="text-[#FF5E00] animate-spin mb-3" />
              <p className="text-xs text-[var(--color-text-muted,#A1A1AA)]">
                Blast AI is analyzing and generating high-yield study notes with formulas and code snippets...
              </p>
            </div>
          ) : editorMode === 'markdown' ? (
            /* Raw Markdown Editing Mode */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted,#A1A1AA)]">
                <span className="font-mono text-[#FF5E00]">Markdown Editor Active</span>
                <span>Select text and use toolbar (B, I, U, Math, Code) to format</span>
              </div>
              <textarea
                ref={rawTextareaRef}
                value={rawMarkdown}
                onChange={(e) => {
                  setRawMarkdown(e.target.value);
                  setIsSaved(false);
                }}
                className="w-full h-[650px] p-4 bg-[var(--color-surface,#181822)] border border-[var(--color-border,#272738)] rounded-2xl font-mono text-xs text-[var(--color-text,#F4F4F6)] leading-relaxed focus:outline-none focus:border-[#FF5E00]"
                placeholder="Write or edit notes in markdown..."
              />
            </div>
          ) : (
            /* Interactive Editable Document Mode */
            <>
              {/* Note Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#FF5E00] font-bold">
                  <span>📑 BLAST AI EDITORIAL NOTES</span>
                  <span>•</span>
                  <span className="text-[var(--color-text-muted,#A1A1AA)] font-normal">Editable Mode</span>
                </div>

                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => {
                    setNoteTitle(e.target.value);
                    setIsSaved(false);
                  }}
                  onFocus={(e) => (activeInputRef.current = e.target as any)}
                  className="font-headline text-2xl md:text-3xl font-extrabold text-[var(--color-text,#F4F4F6)] tracking-tight w-full bg-transparent border-b border-transparent hover:border-[var(--color-border,#272738)] focus:border-[#FF5E00] outline-none transition-colors"
                  placeholder="Note Title"
                />

                <textarea
                  rows={2}
                  value={noteSummary}
                  onChange={(e) => {
                    setNoteSummary(e.target.value);
                    setIsSaved(false);
                  }}
                  onFocus={(e) => (activeInputRef.current = e.target)}
                  className="text-xs text-[var(--color-text-muted,#A1A1AA)] leading-relaxed w-full bg-transparent border border-transparent hover:border-[var(--color-border,#272738)] focus:border-[#FF5E00] rounded-lg p-1.5 outline-none resize-none transition-colors"
                  placeholder="Executive summary..."
                />
              </div>

              {/* Key Takeaways Callout */}
              {takeaways.length > 0 && (
                <div className="p-5 rounded-2xl bg-orange-950/20 border border-orange-500/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                    <Sparkles size={14} />
                    <span>Executive Takeaways</span>
                  </div>
                  <div className="space-y-2">
                    {takeaways.map((takeaway, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-1" />
                        <input
                          type="text"
                          value={takeaway}
                          onChange={(e) => {
                            const updated = [...takeaways];
                            updated[i] = e.target.value;
                            setTakeaways(updated);
                            setIsSaved(false);
                          }}
                          onFocus={(e) => (activeInputRef.current = e.target as any)}
                          className="flex-1 bg-transparent text-xs text-[var(--color-text,#F4F4F6)] border-b border-transparent hover:border-orange-500/20 focus:border-[#FF5E00] outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Sections */}
              <div className="space-y-8">
                {sections.map((sec, secIdx) => (
                  <div key={secIdx} className="space-y-3 pt-6 border-t border-[var(--color-border,#272738)]">
                    <input
                      type="text"
                      value={sec.heading}
                      onChange={(e) => {
                        const updated = [...sections];
                        updated[secIdx].heading = e.target.value;
                        setSections(updated);
                        setIsSaved(false);
                      }}
                      onFocus={(e) => (activeInputRef.current = e.target as any)}
                      className="font-headline font-bold text-lg text-[var(--color-text,#F4F4F6)] w-full bg-transparent border-b border-transparent hover:border-[var(--color-border,#272738)] focus:border-[#FF5E00] outline-none"
                    />

                    <textarea
                      rows={3}
                      value={sec.content}
                      onChange={(e) => {
                        const updated = [...sections];
                        updated[secIdx].content = e.target.value;
                        setSections(updated);
                        setIsSaved(false);
                      }}
                      onFocus={(e) => (activeInputRef.current = e.target)}
                      className="text-xs text-[var(--color-text,#F4F4F6)] leading-relaxed w-full bg-transparent border border-transparent hover:border-[var(--color-border,#272738)] focus:border-[#FF5E00] rounded-lg p-2 outline-none resize-none"
                    />

                    {/* Bullet Points */}
                    {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                      <div className="space-y-1.5 pl-3">
                        {sec.bulletPoints.map((point, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2">
                            <span className="text-[#FF5E00] text-xs">•</span>
                            <input
                              type="text"
                              value={point}
                              onChange={(e) => {
                                const updated = [...sections];
                                if (updated[secIdx].bulletPoints) {
                                  updated[secIdx].bulletPoints![pIdx] = e.target.value;
                                  setSections(updated);
                                  setIsSaved(false);
                                }
                              }}
                              onFocus={(e) => (activeInputRef.current = e.target as any)}
                              className="flex-1 bg-transparent text-xs text-[var(--color-text-muted,#A1A1AA)] border-b border-transparent hover:border-[var(--color-border,#272738)] focus:border-[#FF5E00] outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Code Snippet */}
                    {sec.codeSnippet && (
                      <div className="rounded-xl overflow-hidden border border-[var(--color-border,#272738)] bg-[var(--color-surface,#181822)]">
                        <div className="px-3 py-1.5 bg-[var(--color-surface-hover,#1E1E2C)] border-b border-[var(--color-border,#272738)] flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted,#A1A1AA)]">
                          <span>{sec.codeSnippet.language || 'code'}</span>
                          <span className="text-[10px] text-[#FF5E00]">Turbo Syntax</span>
                        </div>
                        <textarea
                          rows={4}
                          value={sec.codeSnippet.code}
                          onChange={(e) => {
                            const updated = [...sections];
                            if (updated[secIdx].codeSnippet) {
                              updated[secIdx].codeSnippet!.code = e.target.value;
                              setSections(updated);
                              setIsSaved(false);
                            }
                          }}
                          onFocus={(e) => (activeInputRef.current = e.target)}
                          className="w-full p-3 text-xs font-mono text-emerald-400 bg-transparent outline-none resize-none leading-relaxed"
                        />
                      </div>
                    )}

                    {/* LaTeX Formulas */}
                    {sec.formulas && sec.formulas.length > 0 && (
                      <div className="p-3 rounded-xl bg-[var(--color-surface,#181822)] border border-[var(--color-border,#272738)] space-y-1">
                        <div className="text-[10px] text-[#FF5E00] font-bold uppercase tracking-wider">
                          Math Formulation
                        </div>
                        {sec.formulas.map((form, fIdx) => (
                          <div key={fIdx} className="font-mono text-xs text-amber-300 py-0.5">
                            $$ {form} $$
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </main>

        {/* Right Drawer: AI Study Tutor */}
        {isChatOpen && (
          <aside className="w-80 bg-[var(--color-surface,#181822)] border-l border-[var(--color-border,#272738)] flex flex-col shrink-0">
            <div className="p-3 border-b border-[var(--color-border,#272738)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BlastMascot size="xs" state="speaking" />
                <span className="font-headline font-bold text-xs text-[var(--color-text,#F4F4F6)]">
                  Blast AI Copilot
                </span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-zinc-500 hover:text-white p-1">
                <X size={14} />
              </button>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="grid grid-cols-3 gap-1.5 p-2.5 border-b border-[var(--color-border,#272738)] bg-[var(--color-bg,#0C0C11)]">
              <button
                onClick={() => router.navigate(studyPack ? `/notes/${studyPack.id}/quiz` : '/notes/quiz')}
                className="p-2 rounded-xl bg-[var(--color-surface,#181822)] hover:bg-[var(--color-surface-hover,#1E1E2C)] border border-[var(--color-border,#272738)] text-center transition-all"
              >
                <Award size={14} className="text-[#FF5E00] mx-auto mb-1" />
                <div className="text-[10px] font-bold text-[var(--color-text,#F4F4F6)]">Quiz</div>
              </button>

              <button
                onClick={() => router.navigate(studyPack ? `/notes/${studyPack.id}/podcast` : '/notes/podcast')}
                className="p-2 rounded-xl bg-[var(--color-surface,#181822)] hover:bg-[var(--color-surface-hover,#1E1E2C)] border border-[var(--color-border,#272738)] text-center transition-all"
              >
                <Headphones size={14} className="text-sky-400 mx-auto mb-1" />
                <div className="text-[10px] font-bold text-[var(--color-text,#F4F4F6)]">Podcast</div>
              </button>

              <button
                onClick={() => router.navigate(studyPack ? `/notes/${studyPack.id}/flashcards` : '/notes/flashcards')}
                className="p-2 rounded-xl bg-[var(--color-surface,#181822)] hover:bg-[var(--color-surface-hover,#1E1E2C)] border border-[var(--color-border,#272738)] text-center transition-all"
              >
                <Layers size={14} className="text-emerald-400 mx-auto mb-1" />
                <div className="text-[10px] font-bold text-[var(--color-text,#F4F4F6)]">Cards</div>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-center pt-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/20 border border-orange-500/40 p-1 flex items-center justify-center mb-2">
                  <BlastMascot size="sm" state="greeting" />
                </div>
                <h3 className="font-headline text-xs font-bold text-[var(--color-text,#F4F4F6)]">Hey, I&apos;m Blast!</h3>
                <p className="text-[11px] text-[var(--color-text-muted,#A1A1AA)] mt-1 max-w-xs mx-auto">
                  Ask me anything about {activeTopic}!
                </p>
              </div>

              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#FF5E00] text-white ml-auto max-w-[85%]'
                      : 'bg-[var(--color-surface-hover,#1E1E2C)] text-[var(--color-text,#F4F4F6)] border border-[var(--color-border,#272738)]'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-[var(--color-border,#272738)] bg-[var(--color-bg,#0C0C11)]">
              <div className="p-2 rounded-2xl bg-[var(--color-surface,#181822)] border border-[var(--color-border,#272738)] flex items-center gap-2">
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder="Ask a question about this note..."
                  className="flex-1 bg-transparent text-xs text-[var(--color-text,#F4F4F6)] placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatPrompt.trim()}
                  className="w-6 h-6 rounded-full bg-[#FF5E00] hover:bg-orange-600 text-white flex items-center justify-center transition-all disabled:opacity-40"
                >
                  <ArrowUp size={12} />
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
};

export default NotesEditorView;
