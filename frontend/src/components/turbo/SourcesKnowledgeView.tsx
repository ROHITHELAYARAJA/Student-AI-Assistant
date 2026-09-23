import React, { useState, useEffect } from 'react';
import { router } from '../../services/router.js';
import { BlastMascot } from './BlastMascot.js';
import { getStudyPack, fetchStudyPack } from '../../services/turboApi.js';
import { TurboStudyPack, TurboSourceItem } from '../../types/turbo.js';
import {
  Sparkles,
  BookOpen,
  FileText,
  Award,
  Layers,
  Headphones,
  FolderGit2,
  Upload,
  Plus,
  Trash2,
  Search,
  ExternalLink,
  CheckCircle2,
  FileCode,
  Loader2
} from 'lucide-react';

interface SourcesKnowledgeViewProps {
  noteId?: string;
  topicTitle?: string;
  onOpenUpgrade?: () => void;
  onOpenEmma?: () => void;
}

export const SourcesKnowledgeView: React.FC<SourcesKnowledgeViewProps> = ({
  noteId = 'current',
  topicTitle = 'How to learn Java',
  onOpenUpgrade,
  onOpenEmma
}) => {
  const [studyPack, setStudyPack] = useState<TurboStudyPack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sourcesList, setSourcesList] = useState<TurboSourceItem[]>([]);
  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const existing = getStudyPack(noteId) || getStudyPack(topicTitle);
    if (existing) {
      setStudyPack(existing);
      setSourcesList(existing.sources || []);
    } else {
      setIsLoading(true);
      fetchStudyPack(topicTitle)
        .then((pack) => {
          setStudyPack(pack);
          setSourcesList(pack.sources || []);
        })
        .catch((err) => console.error('Failed to load study pack:', err))
        .finally(() => setIsLoading(false));
    }
  }, [noteId, topicTitle]);

  const activeTitle = studyPack?.topic || topicTitle;

  const defaultSources: TurboSourceItem[] = [
    {
      id: 'src-core',
      title: `${activeTitle} — Official Documentation & Architecture Reference`,
      category: 'Core Reference Manual',
      summary: `High-yield syllabus covering runtime mechanics, standard libraries, and memory execution guarantees.`,
      keyTakeaways: [
        'Fundamental primitives and memory lifecycle models',
        'Idiomatic patterns and standard library conventions',
        'Common boundary pitfalls and anti-patterns'
      ],
      relevance: 'Essential foundation for mastering concepts and exam prep',
      sourceUrl: 'https://docs.oracle.com/en/'
    },
    {
      id: 'src-patterns',
      title: `${activeTitle} — Problem Patterns & Interview Archetypes`,
      category: 'Exam / Problem Set Guide',
      summary: `Detailed taxonomy of common exam questions, time/space trade-offs, and verification rubrics.`,
      keyTakeaways: [
        'Frequent problem classifications and step-by-step algorithms',
        'Space/time trade-off matrices',
        'Verification checklist before submission'
      ],
      relevance: 'Crucial for exams and technical assessments'
    }
  ];

  const displaySources = sourcesList.length > 0 ? sourcesList : defaultSources;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    const newSource: TurboSourceItem = {
      id: `src-${Date.now()}`,
      title: titleInput.trim(),
      category: 'User Added Note',
      summary: contentInput.trim() || 'Custom user notes and reference material.',
      keyTakeaways: ['User provided knowledge source'],
      relevance: 'Custom study reference'
    };

    setSourcesList([newSource, ...sourcesList]);
    setTitleInput('');
    setContentInput('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setSourcesList(sourcesList.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col font-body select-none">
      {/* Top Header */}
      <header className="h-14 px-6 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.navigate('/dashboard')}>
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-orange-500/20 overflow-hidden">
              <img src="/blast-mascot.png" alt="Blast AI" className="w-full h-full object-cover" />
            </div>
            <span className="font-headline font-black text-sm tracking-tight text-white flex items-center gap-1">
              blast <span className="text-orange-500">ai</span>
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

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenUpgrade}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            <Sparkles size={13} className="fill-black" />
            <span>Upgrade</span>
          </button>
        </div>
      </header>

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
            className="flex flex-col items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[var(--color-surface-hover)] flex items-center justify-center">
              <FileText size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Notes</span>
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
            className="flex flex-col items-center gap-1.5 text-purple-400 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <FolderGit2 size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">Sources</span>
          </button>
        </aside>

        {/* Sources Content View */}
        <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 flex flex-col items-center">
          <div className="max-w-2xl w-full space-y-6">
            {/* Header Card */}
            <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  Knowledge Index
                </span>
                <h1 className="font-headline text-2xl font-extrabold text-[var(--color-text)] tracking-tight mt-1">
                  Sources & Grounding References
                </h1>
                <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed max-w-md">
                  Reference cheat sheets and curated background materials used to synthesize your roadmap, notes, and quiz for {activeTitle}.
                </p>
              </div>

              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all shrink-0"
              >
                <Plus size={13} />
                <span>Add Source</span>
              </button>
            </div>

            {/* Add Custom Source Form */}
            {isAdding && (
              <form onSubmit={handleAddCustom} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-purple-500/40 shadow-lg space-y-3 animate-in fade-in duration-150">
                <h3 className="font-headline font-bold text-xs text-[var(--color-text)]">
                  Add Custom Note or Reference
                </h3>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Source title (e.g. Chapter 4 Lecture Notes)..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                />
                <textarea
                  rows={3}
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  placeholder="Paste summaries, cheat sheets, or key definitions..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-xs text-[var(--color-text)] placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm"
                  >
                    Save Source
                  </button>
                </div>
              </form>
            )}

            {/* Sources List */}
            <div className="space-y-3">
              {displaySources.map((src) => (
                <div
                  key={src.id}
                  className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-purple-500/30 shadow-sm space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {src.category}
                      </span>
                      <h2 className="font-headline font-bold text-sm text-[var(--color-text)]">
                        {src.title}
                      </h2>
                    </div>

                    <button
                      onClick={() => handleDelete(src.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Remove source"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {src.summary}
                  </p>

                  {src.keyTakeaways && src.keyTakeaways.length > 0 && (
                    <div className="p-3 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)] space-y-1">
                      <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                        Key Coverage
                      </div>
                      <ul className="space-y-1 text-xs text-[var(--color-text)]">
                        {src.keyTakeaways.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-1">
                    <span>Relevance: {src.relevance}</span>
                    {src.sourceUrl && (
                      <a
                        href={src.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                      >
                        <span>Official Docs</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Floating Ask Blast AI Button */}
      <button
        onClick={onOpenEmma || (() => router.navigate(`/notes/${noteId}/editor`))}
        className="fixed right-6 bottom-8 py-2 px-4 rounded-full bg-[var(--color-surface)] border border-orange-500/30 shadow-xl text-xs font-bold text-[var(--color-text)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all z-40 group"
      >
        <BlastMascot size="xs" state="idle" />
        <span className="group-hover:text-orange-400 transition-colors">Ask Blast AI</span>
      </button>
    </div>
  );
};
export default SourcesKnowledgeView;
