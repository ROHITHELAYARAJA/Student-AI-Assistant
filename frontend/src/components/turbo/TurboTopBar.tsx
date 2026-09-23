import React from 'react';
import {
  Sparkles,
  Search,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  FolderGit2
} from 'lucide-react';

interface TurboTopBarProps {
  activeTopic: string;
  onOpenTopicModal: () => void;
  onRefreshData: () => void;
  isLoading: boolean;
  onToggleEmma?: () => void;
  isEmmaOpen?: boolean;
  onToggleBlast?: () => void;
  isBlastOpen?: boolean;
  ragDocCount: number;
}

export const TurboTopBar: React.FC<TurboTopBarProps> = ({
  activeTopic,
  onOpenTopicModal,
  onRefreshData,
  isLoading,
  onToggleEmma,
  isEmmaOpen = false,
  onToggleBlast,
  isBlastOpen,
  ragDocCount
}) => {
  const toggleHandler = onToggleBlast || onToggleEmma || (() => {});
  const openState = isBlastOpen !== undefined ? isBlastOpen : isEmmaOpen;
  return (
    <header className="h-14 bg-[#0F0F14]/90 backdrop-blur-md border-b border-[#22222E] px-6 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenTopicModal}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#181824] hover:bg-[#202030] border border-[#2B2B3E] text-xs transition-all text-white group"
        >
          <Search size={14} className="text-zinc-400 group-hover:text-purple-400 transition-colors" />
          <span className="font-semibold text-zinc-200">{activeTopic}</span>
          <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
            Switch
          </span>
        </button>

        <button
          onClick={onRefreshData}
          disabled={isLoading}
          title="Regenerate or refresh current module"
          className="p-1.5 rounded-lg bg-[#181824] hover:bg-[#222234] border border-[#2B2B3E] text-zinc-400 hover:text-zinc-200 text-xs transition-all disabled:opacity-50"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin text-purple-400' : ''} />
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
          <ShieldCheck size={13} />
          <span>Bedrock ML Grounded</span>
        </div>

        {ragDocCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-400 font-medium">
            <FolderGit2 size={13} />
            <span>{ragDocCount} RAG Sources Active</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenTopicModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1A1A28] hover:bg-[#222236] border border-[#2F2F44] text-xs text-zinc-300 font-medium transition-all"
        >
          <Sparkles size={13} className="text-purple-400" />
          <span>Upload Slides / PDF</span>
        </button>

        <button
          onClick={toggleHandler}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            openState
              ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-600/30'
              : 'bg-[#181826] hover:bg-[#222236] border-[#303046] text-orange-300'
          }`}
        >
          <MessageSquare size={13} />
          <span>Ask Blast AI</span>
        </button>
      </div>
    </header>
  );
};
