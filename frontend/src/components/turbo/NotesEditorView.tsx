import React, { useState, useEffect } from 'react';
import { router } from '../../services/router.js';
import { BlastMascot } from './BlastMascot.js';
import { getStudyPack, fetchStudyPack } from '../../services/turboApi.js';
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
  Clock,
  Bold,
  Italic,
  Underline,
  Sigma,
  Table,
  AlignLeft,
  List,
  Eye,
  Paperclip,
  Mic,
  ArrowUp,
  X,
  Code2,
  CheckCircle2,
  Download,
  Loader2
} from 'lucide-react';

interface NotesEditorViewProps {
  noteId?: string;
  topicTitle?: string;
  onOpenUpgrade?: () => void;
}

export const NotesEditorView: React.FC<NotesEditorViewProps> = ({
  noteId = 'current',
  topicTitle = 'How to learn Java',
  onOpenUpgrade
}) => {
  const [studyPack, setStudyPack] = useState<TurboStudyPack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState(15);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([]);

  useEffect(() => {
    const existing = getStudyPack(noteId) || getStudyPack(topicTitle);
    if (existing) {
      setStudyPack(existing);
    } else {
      setIsLoading(true);
      fetchStudyPack(topicTitle)
        .then((pack) => setStudyPack(pack))
        .catch((err) => console.error('Failed to load study pack:', err))
        .finally(() => setIsLoading(false));
    }
  }, [noteId, topicTitle]);

  const activeTitle = studyPack?.topic || topicTitle;

  const notes: TurboNotes = studyPack?.notes || {
    topic: activeTitle,
    title: `Mastery Notes: ${activeTitle}`,
    lastUpdated: 'Just now',
    summary: `Structured comprehensive study guide and key takeaways for ${activeTitle}. Generated with Bedrock AI inference.`,
    keyTakeaways: [
      'Master core concepts, runtime semantics, and structural invariants.',
      'Understand typical boundary edge cases and failure modes.',
      'Apply idiomatic patterns and benchmark time/space tradeoffs.'
    ],
    sections: [
      {
        heading: '1. Architecture & Execution Foundations',
        content: `When learning ${activeTitle}, building an accurate mental model is crucial. Start by understanding how code gets transformed into execution instructions and how system memory is allocated.`,
        bulletPoints: [
          'Memory lifecycle: Stack vs Heap allocation dynamics',
          'Execution pipeline: Compilation, interpretation, and runtime optimizations',
          'Scope rules and variable lifetime guarantees'
        ],
        codeSnippet: {
          language: 'java',
          code: `// Core idiom demonstration\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println("Mastering ${activeTitle} with Turbo AI!");\n    }\n}`
        }
      },
      {
        heading: '2. High-Yield Patterns & Problem Archetypes',
        content: `Examinations and technical evaluations prioritize understanding trade-offs. Rather than memorizing solutions, master the general pattern templates.`,
        bulletPoints: [
          'Linear vs non-linear traversal strategies',
          'Defensive verification and error boundaries',
          'Balancing readability with algorithmic efficiency'
        ],
        formulas: ['T(n) = O(n \\log n) \\quad \\text{amortized overhead}', 'S(n) = O(1) \\quad \\text{in-place auxiliary}']
      }
    ]
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
          text: `Here is the high-yield study breakdown for "${userText}": Focus on mastering core runtime semantics for ${activeTitle}, verifying edge-case conditions, and practicing active recall on your flashcard deck!`
        }
      ]);
    }, 500);
  };

  const handleExport = () => {
    const textContent = `${notes.title}\n\nSummary:\n${notes.summary}\n\nKey Takeaways:\n${notes.keyTakeaways.map(t => `- ${t}`).join('\n')}\n\n${notes.sections.map(s => `${s.heading}\n${s.content}\n${s.bulletPoints?.map(b => `* ${b}`).join('\n') || ''}`).join('\n\n')}`;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTitle.replace(/[^a-z0-9]/gi, '_')}_notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col font-body select-none">
      {/* Top Header */}
      <header className="h-14 px-5 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md shrink-0">
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

          <div className="h-4 w-[1px] bg-[var(--color-border)]" />

          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <button onClick={() => router.navigate('/dashboard')} className="hover:text-[var(--color-text)] transition-colors flex items-center gap-1">
              <span>🏠</span>
              <span>Home</span>
            </button>
            <span>›</span>
            <span className="text-[var(--color-text)] font-medium truncate max-w-md">{activeTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all"
            title="Download Notes"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={onOpenUpgrade}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            <Sparkles size={13} className="fill-black" />
            <span>Upgrade</span>
          </button>
        </div>
      </header>

      {/* Editor Formatting Ribbon */}
      <div className="h-11 px-5 border-b border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-between text-xs text-[var(--color-text-muted)] shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsBold(!isBold)}
            className={`p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors ${
              isBold ? 'bg-purple-600/20 text-purple-400 font-bold' : ''
            }`}
            title="Bold"
          >
            <Bold size={14} />
          </button>

          <button
            onClick={() => setIsItalic(!isItalic)}
            className={`p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors ${
              isItalic ? 'bg-purple-600/20 text-purple-400' : ''
            }`}
            title="Italic"
          >
            <Italic size={14} />
          </button>

          <button
            onClick={() => setIsUnderline(!isUnderline)}
            className={`p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors ${
              isUnderline ? 'bg-purple-600/20 text-purple-400' : ''
            }`}
            title="Underline"
          >
            <Underline size={14} />
          </button>

          <div className="h-4 w-[1px] bg-[var(--color-border)] mx-1" />

          <button className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors" title="Formula">
            <Sigma size={14} />
          </button>

          <button className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors" title="Code snippet">
            <Code2 size={14} />
          </button>

          <div className="h-4 w-[1px] bg-[var(--color-border)] mx-1" />

          <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] font-mono">
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 1))}
              className="px-1.5 py-0.5 rounded hover:bg-[var(--color-surface-hover)]"
            >
              -
            </button>
            <span className="w-5 text-center">{fontSize}</span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 1))}
              className="px-1.5 py-0.5 rounded hover:bg-[var(--color-surface-hover)]"
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
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <BlastMascot size="xs" state="listening" />
            <span>AI Side Tutor</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-20 bg-[var(--color-bg)] border-r border-[var(--color-border)] flex flex-col items-center py-6 space-y-6 shrink-0">
          <button
            onClick={() => router.navigate(`/notes/${noteId}`)}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover)] flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Learn</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/editor`)}
            className="flex flex-col items-center gap-1.5 text-purple-400 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <FileText size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">Notes</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/quiz`)}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover)] flex items-center justify-center">
              <Award size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Quiz</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/flashcards`)}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover)] flex items-center justify-center">
              <Layers size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Flashcards</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/podcast`)}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover)] flex items-center justify-center">
              <Headphones size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Podcast</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/sources`)}
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover)] flex items-center justify-center">
              <FolderGit2 size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Sources</span>
          </button>
        </aside>

        {/* Notes Document */}
        <main
          className="flex-1 overflow-y-auto px-8 md:px-12 py-10 max-w-3xl mx-auto w-full space-y-8 select-text"
          style={{ fontSize: `${fontSize}px` }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Loader2 size={24} className="text-purple-400 animate-spin mb-3" />
              <p className="text-xs text-[var(--color-text-muted)]">
                Turbo AI is generating high-yield study notes with diagrams and code snippets...
              </p>
            </div>
          ) : (
            <>
              {/* Note Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-purple-400 font-bold">
                  <span>📑 BLAST AI EDITORIAL NOTES</span>
                  <span>•</span>
                  <span className="text-[var(--color-text-muted)] font-normal">{notes.lastUpdated}</span>
                </div>
                <h1 className="font-headline text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
                  {notes.title || activeTitle}
                </h1>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {notes.summary}
                </p>
              </div>

              {/* Key Takeaways Callout */}
              {notes.keyTakeaways && notes.keyTakeaways.length > 0 && (
                <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                    <Sparkles size={14} />
                    <span>Executive Takeaways</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[var(--color-text)]">
                    {notes.keyTakeaways.map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Document Sections */}
              <div className="space-y-8">
                {notes.sections?.map((sec, secIdx) => (
                  <div key={secIdx} className="space-y-3 pt-6 border-t border-[var(--color-border)]">
                    <h2 className="font-headline font-bold text-lg text-[var(--color-text)]">
                      {sec.heading}
                    </h2>
                    <p className="text-xs text-[var(--color-text)] leading-relaxed">
                      {sec.content}
                    </p>

                    {/* Bullet Points */}
                    {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                      <ul className="space-y-1.5 text-xs text-[var(--color-text-muted)] pl-4 list-disc">
                        {sec.bulletPoints.map((point, pIdx) => (
                          <li key={pIdx} className="leading-relaxed">
                            {point}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Code Snippet */}
                    {sec.codeSnippet && (
                      <div className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-alt)]">
                        <div className="px-3 py-1.5 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between text-[11px] font-mono text-[var(--color-text-muted)]">
                          <span>{sec.codeSnippet.language || 'code'}</span>
                          <span className="text-[10px] text-purple-400">Turbo Syntax</span>
                        </div>
                        <pre className="p-3 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                          <code>{sec.codeSnippet.code}</code>
                        </pre>
                      </div>
                    )}

                    {/* LaTeX Formulas */}
                    {sec.formulas && sec.formulas.length > 0 && (
                      <div className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
                        <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
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
          <aside className="w-80 bg-[var(--color-surface)] border-l border-[var(--color-border)] flex flex-col shrink-0">
            <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BlastMascot size="xs" state="speaking" />
                <span className="font-headline font-bold text-xs text-[var(--color-text)]">
                  Blast AI Copilot
                </span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-zinc-500 hover:text-white p-1">
                <X size={14} />
              </button>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="grid grid-cols-3 gap-1.5 p-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <button
                onClick={() => router.navigate(`/notes/${noteId}/quiz`)}
                className="p-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-center transition-all"
              >
                <Award size={14} className="text-purple-400 mx-auto mb-1" />
                <div className="text-[10px] font-bold text-[var(--color-text)]">Quiz</div>
              </button>

              <button
                onClick={() => router.navigate(`/notes/${noteId}/podcast`)}
                className="p-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-center transition-all"
              >
                <Headphones size={14} className="text-purple-400 mx-auto mb-1" />
                <div className="text-[10px] font-bold text-[var(--color-text)]">Podcast</div>
              </button>

              <button
                onClick={() => router.navigate(`/notes/${noteId}/flashcards`)}
                className="p-2 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-center transition-all"
              >
                <Layers size={14} className="text-purple-400 mx-auto mb-1" />
                <div className="text-[10px] font-bold text-[var(--color-text)]">Cards</div>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="text-center pt-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/20 border border-orange-500/40 p-1 flex items-center justify-center mb-2">
                  <BlastMascot size="sm" state="greeting" />
                </div>
                <h3 className="font-headline text-xs font-bold text-[var(--color-text)]">Hey, I&apos;m Blast!</h3>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1 max-w-xs mx-auto">
                  Ask me anything about {activeTitle}!
                </p>
              </div>

              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white ml-auto max-w-[85%]'
                      : 'bg-[var(--color-bg-alt)] text-[var(--color-text)] border border-[var(--color-border)]'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
              <div className="p-2 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center gap-2">
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder="Ask a question about this note..."
                  className="flex-1 bg-transparent text-xs text-[var(--color-text)] placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatPrompt.trim()}
                  className="w-6 h-6 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-all disabled:opacity-40"
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
