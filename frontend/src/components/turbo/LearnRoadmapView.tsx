import React from 'react';
import { router } from '../../services/router.js';
import {
  Check,
  Lock,
  Star,
  Settings,
  Sparkles,
  BookOpen,
  FileText,
  Award,
  Layers,
  Headphones,
  FolderGit2
} from 'lucide-react';

interface LearnRoadmapViewProps {
  noteId?: string;
  topicTitle?: string;
  onOpenUpgrade?: () => void;
  onOpenEmma?: () => void;
}

export const LearnRoadmapView: React.FC<LearnRoadmapViewProps> = ({
  noteId = 'faang-sde',
  topicTitle = 'Roadmap: Resume to FAANG/MAANG SDE',
  onOpenUpgrade,
  onOpenEmma
}) => {
  const contents = [
    { id: 1, title: 'Getting Started', status: 'completed' },
    { id: 2, title: 'Where you stand: auditing the resume against the FAANG bar', status: 'current', pages: '6 pages' },
    { id: 3, title: 'DSA mastery plan: patterns first, Java as your weapon', status: 'locked' },
    { id: 4, title: 'System design and LLD fundamentals for freshers', status: 'locked' },
    { id: 5, title: 'CS fundamentals that decide screening rounds', status: 'locked' },
    { id: 6, title: 'Checkpoint', status: 'checkpoint' },
    { id: 7, title: 'Upgrading projects from portfolio pieces to interview ammunition', status: 'locked' }
  ];

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
            <span className="text-zinc-200 font-medium truncate max-w-md">{topicTitle}</span>
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
          <button
            onClick={() => router.navigate(`/notes/${noteId}`)}
            className="flex flex-col items-center gap-1.5 text-purple-400 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">Learn</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/editor`)}
            className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <FileText size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Notes</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/quiz`)}
            className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <Award size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Quiz</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/flashcards`)}
            className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <Layers size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Flashcards</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/podcast`)}
            className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <Headphones size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Podcast</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/source`)}
            className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <FolderGit2 size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Source</span>
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto px-8 py-10 max-w-3xl mx-auto w-full space-y-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1C1C2C] to-[#12121E] border border-[#2D2D44] p-3 flex items-center justify-center shrink-0 shadow-xl">
              <svg className="w-16 h-16 text-cyan-400" viewBox="0 0 64 64" fill="none">
                <path d="M32 4L56 18V46L32 60L8 46V18L32 4Z" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
                <path d="M32 4L56 18L32 32L8 18L32 4Z" fill="#0EA5E9" fillOpacity="0.4" />
                <line x1="32" y1="32" x2="32" y2="60" stroke="#38BDF8" strokeWidth="2" />
                <line x1="16" y1="24" x2="16" y2="38" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 2" />
                <line x1="48" y1="24" x2="48" y2="38" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 2" />
              </svg>
            </div>

            <div className="space-y-3 flex-1">
              <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
                {topicTitle}
              </h1>

              <div className="flex items-center gap-3">
                <div className="w-48 h-1.5 bg-[#20202E] rounded-full overflow-hidden">
                  <div className="w-[9%] h-full bg-[#8B5CF6] rounded-full" />
                </div>
                <span className="text-xs font-semibold text-zinc-400">9%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.navigate(`/notes/${noteId}/editor`)}
              className="px-8 py-3 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98]"
            >
              Continue
            </button>

            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">UP NEXT</div>
              <div className="text-xs font-medium text-zinc-300">
                Where you stand: auditing the resume against the FAANG bar
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#1E1E28]">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-wide">Contents</h2>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span>1 of 11 complete</span>
                <Settings size={14} className="text-zinc-500" />
              </div>
            </div>

            <div className="space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-[2px] before:bg-[#222232]">
              {contents.map((item) => {
                if (item.status === 'completed') {
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#151520] border border-[#202030] relative z-10">
                      <div className="flex items-center gap-3.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold">
                          <Check size={16} strokeWidth={3} />
                        </div>
                        <span className="font-semibold text-xs text-white">{item.title}</span>
                      </div>
                      <Check size={16} className="text-emerald-400 mr-2" />
                    </div>
                  );
                }

                if (item.status === 'current') {
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1C1828] border border-purple-500/50 shadow-md shadow-purple-500/5 relative z-10">
                      <div className="flex items-center gap-3.5">
                        <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center text-white font-bold text-xs">
                          {item.id}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-white">{item.title}</div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">{item.pages}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => router.navigate(`/notes/${noteId}/editor`)}
                        className="px-4 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs transition-all shadow-sm"
                      >
                        Start
                      </button>
                    </div>
                  );
                }

                if (item.status === 'checkpoint') {
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#14141E] border border-[#20202E] relative z-10 opacity-70">
                      <div className="flex items-center gap-3.5">
                        <div className="w-7 h-7 rounded-full bg-[#20202E] text-amber-400 flex items-center justify-center">
                          <Star size={14} className="fill-amber-400" />
                        </div>
                        <span className="font-medium text-xs text-zinc-300">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-500 text-xs mr-2">
                        <span>Checkpoint</span>
                        <Lock size={12} />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#14141E] border border-[#20202E] relative z-10 opacity-70">
                    <div className="flex items-center gap-3.5">
                      <div className="w-7 h-7 rounded-full bg-[#1C1C28] text-zinc-500 flex items-center justify-center font-bold text-xs">
                        {item.id}
                      </div>
                      <span className="font-medium text-xs text-zinc-300">{item.title}</span>
                    </div>
                    <Lock size={13} className="text-zinc-600 mr-2" />
                  </div>
                );
              })}
            </div>
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
