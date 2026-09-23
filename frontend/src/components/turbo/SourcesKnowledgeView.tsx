import React, { useState } from 'react';
import { router } from '../../services/router.js';
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
  Search
} from 'lucide-react';

import { ingestDocument } from '../../services/turboApi.js';

interface SourcesKnowledgeViewProps {
  noteId?: string;
  topicTitle?: string;
  onOpenUpgrade?: () => void;
  onOpenEmma?: () => void;
}

export const SourcesKnowledgeView: React.FC<SourcesKnowledgeViewProps> = ({
  noteId = 'faang-sde',
  topicTitle = 'Roadmap: Resume to FAANG/MAANG SDE',
  onOpenUpgrade,
  onOpenEmma
}) => {
  const [sources, setSources] = useState([
    {
      id: 'doc-1',
      title: 'FAANG Resume Audit Benchmark Standards',
      type: 'PDF',
      size: '2.4 MB',
      chunks: 8,
      date: 'Sep 2026'
    },
    {
      id: 'doc-2',
      title: 'LeetCode Pattern Frequency Breakdown',
      type: 'Notes',
      size: '420 KB',
      chunks: 12,
      date: 'Sep 2026'
    }
  ]);
  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;
    const title = titleInput.trim();
    const content = contentInput.trim();
    const newDocId = `doc-${Date.now()}`;

    setSources((prev) => [
      {
        id: newDocId,
        title,
        type: 'Notes',
        size: `${Math.max(1, Math.round(content.length / 1024))} KB`,
        chunks: Math.max(1, Math.round(content.length / 300)),
        date: 'Today'
      },
      ...prev
    ]);
    setTitleInput('');
    setContentInput('');

    try {
      await ingestDocument(title, content, 'notes');
    } catch {
      // Graceful local offline support
    }
  };

  return (
    <div className="min-h-screen bg-[#111114] text-zinc-100 flex flex-col font-sans select-none">
      <header className="h-14 px-6 flex items-center justify-between border-b border-[#1E1E28] bg-[#111114] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.navigate('/dashboard')}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
            </svg>
            <span className="font-bold text-white text-base tracking-tight">turbo ai</span>
          </div>

          <div className="h-4 w-[1px] bg-[#2A2A3A]" />

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <button onClick={() => router.navigate('/dashboard')} className="hover:text-white transition-colors flex items-center gap-1">
              <span>🏠</span>
              <span>Home</span>
            </button>
            <span>›</span>
            <button onClick={() => router.navigate(`/notes/${noteId}`)} className="text-zinc-200 font-medium truncate max-w-md hover:underline">
              {topicTitle}
            </button>
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

          <button
            onClick={() => router.navigate('/signup')}
            className="w-8 h-8 rounded-full bg-[#582CD6] text-white font-bold text-xs flex items-center justify-center ring-2 ring-[#2F2450]"
          >
            E
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-20 bg-[#111114] border-r border-[#1E1E28] flex flex-col items-center py-6 space-y-6 shrink-0">
          <button onClick={() => router.navigate(`/notes/${noteId}`)} className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Learn</span>
          </button>

          <button onClick={() => router.navigate(`/notes/${noteId}/editor`)} className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <FileText size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Notes</span>
          </button>

          <button onClick={() => router.navigate(`/notes/${noteId}/quiz`)} className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <Award size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Quiz</span>
          </button>

          <button onClick={() => router.navigate(`/notes/${noteId}/flashcards`)} className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <Layers size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Flashcards</span>
          </button>

          <button onClick={() => router.navigate(`/notes/${noteId}/podcast`)} className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <Headphones size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Podcast</span>
          </button>

          <button onClick={() => router.navigate(`/notes/${noteId}/source`)} className="flex flex-col items-center gap-1.5 text-purple-400 group">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <FolderGit2 size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">Source</span>
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto px-8 py-10 max-w-3xl mx-auto w-full space-y-8">
          <div className="p-6 rounded-3xl bg-[#161622] border border-[#27273C] flex items-center justify-between shadow-2xl">
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Grounding Engine
              </span>
              <h1 className="text-xl font-bold text-white mt-1.5">RAG Sources & Attached Documents</h1>
              <p className="text-xs text-zinc-400 mt-1">
                Documents powering the quiz questions, smart notes, and tutor responses for this roadmap.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-[#1E1E2E] border border-[#2B2B3E] text-center shrink-0">
              <div className="text-xl font-bold text-purple-400">{sources.length}</div>
              <div className="text-[10px] text-zinc-400">Sources</div>
            </div>
          </div>

          <form onSubmit={handleAdd} className="p-6 rounded-3xl bg-[#151520] border border-[#252538] space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Upload size={14} className="text-purple-400" />
              <span>Attach New Study Document</span>
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Document Title (e.g. Chapter 5 Slides, Interview Prep Notes)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1C28] border border-[#2B2B40] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
              />

              <textarea
                rows={3}
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                placeholder="Paste extracted text, syllabus notes, or cheat-sheet summary..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1C28] border border-[#2B2B40] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 resize-none"
              />

              <button
                type="submit"
                disabled={!titleInput.trim()}
                className="w-full py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 disabled:opacity-40"
              >
                Add Document Source
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Documents</h2>
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-4 rounded-2xl bg-[#161622] border border-[#262638] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                    {src.type}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">{src.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                      <span>{src.size}</span>
                      <span>•</span>
                      <span>{src.chunks} Semantic Chunks</span>
                      <span>•</span>
                      <span>{src.date}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSources((prev) => prev.filter((s) => s.id !== src.id))}
                  className="text-zinc-500 hover:text-rose-400 p-2 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>

      <button
        onClick={onOpenEmma || (() => router.navigate(`/notes/${noteId}/editor`))}
        className="fixed right-6 bottom-8 py-2 px-3.5 rounded-full bg-[#181824] border border-[#2D2D44] shadow-xl text-xs font-bold text-white flex items-center gap-2 hover:bg-[#222234] hover:scale-105 active:scale-95 transition-all z-40"
      >
        <img src="/emma-expressions/teaching.png" alt="Mascot" className="w-5 h-5 rounded-full object-cover" />
        <span>Ask Emma AI</span>
      </button>
    </div>
  );
};
