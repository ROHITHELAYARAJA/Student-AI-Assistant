import React from 'react';
import { TurboTab } from '../../types/turbo.js';
import {
  GraduationCap,
  Map,
  BookOpen,
  FileText,
  Award,
  Layers,
  Headphones,
  FolderGit2,
  Flame,
  Calendar,
  Sparkles
} from 'lucide-react';
import { BlastMascot } from './BlastMascot.js';

interface TurboSidebarProps {
  currentTab: TurboTab;
  onTabChange: (tab: TurboTab) => void;
  activeTopic: string;
  streakCount: number;
  examDate?: string;
  onOpenCreate: () => void;
  onToggleEmma: () => void;
  isEmmaOpen: boolean;
}

export const TurboSidebar: React.FC<TurboSidebarProps> = ({
  currentTab,
  onTabChange,
  activeTopic,
  streakCount,
  examDate = 'In 2 Weeks',
  onOpenCreate,
  onToggleEmma,
  isEmmaOpen
}) => {
  const navItems: Array<{ id: TurboTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'learn', label: 'Learn & Practice', icon: <BookOpen size={18} />, badge: 'Active' },
    { id: 'roadmap', label: 'Study Roadmap', icon: <Map size={18} /> },
    { id: 'notes', label: 'Smart Notes', icon: <FileText size={18} /> },
    { id: 'quiz', label: 'Assessment Quiz', icon: <Award size={18} /> },
    { id: 'flashcards', label: 'Flashcard Studio', icon: <Layers size={18} /> },
    { id: 'podcast', label: 'AI Podcast Lecture', icon: <Headphones size={18} />, badge: 'Audio' },
    { id: 'rag', label: 'Sources & RAG', icon: <FolderGit2 size={18} /> }
  ];

  return (
    <aside className="w-64 bg-[#0F0F14] border-r border-[#22222E] flex flex-col h-screen select-none shrink-0 z-30">
      <div className="p-4 border-b border-[#22222E] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/blast-logo.png"
              alt="Blast AI Logo"
              className="w-10 h-10 rounded-xl object-contain ring-2 ring-orange-500/40 shadow-lg shadow-orange-500/20 bg-[#161622] p-1 border border-orange-500/20"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0F0F14]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-wide text-sm">Blast AI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Blast Study Copilot</p>
          </div>
        </div>
      </div>

      <div className="px-3 pt-3 pb-2">
        <button
          onClick={onOpenCreate}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all active:scale-[0.98]"
        >
          <Sparkles size={14} />
          <span>+ Create New Lesson</span>
        </button>
      </div>

      <div className="px-3 py-1">
        <div className="px-2.5 py-1.5 rounded-lg bg-[#181822] border border-[#272738] flex items-center justify-between text-xs">
          <div className="truncate pr-2">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Active Topic</span>
            <span className="font-medium text-white truncate block text-[11px]">{activeTopic}</span>
          </div>
          <GraduationCap size={16} className="text-purple-400 shrink-0" />
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2 py-1">
          Study Modules
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181824]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-purple-400' : 'text-zinc-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#22222E] space-y-2 bg-[#0C0C10]">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-[#161622] border border-[#252538] flex items-center gap-2">
            <Flame size={16} className="text-orange-400 shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">Streak</div>
              <div className="font-bold text-white text-xs">{streakCount} Days</div>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[#161622] border border-[#252538] flex items-center gap-2">
            <Calendar size={16} className="text-purple-400 shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-400">Next Exam</div>
              <div className="font-bold text-white text-xs truncate">{examDate}</div>
            </div>
          </div>
        </div>

        <button
          onClick={onToggleEmma}
          className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
            isEmmaOpen
              ? 'bg-orange-600/25 border-orange-500/60 text-orange-200'
              : 'bg-[#181826] border-[#2E2E42] text-zinc-300 hover:bg-[#1E1E30]'
          }`}
        >
          <div className="flex items-center gap-2">
            <BlastMascot size="xs" state="idle" />
            <span className="font-medium text-[11px]">Ask Blast Tutor</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>
    </aside>
  );
};
