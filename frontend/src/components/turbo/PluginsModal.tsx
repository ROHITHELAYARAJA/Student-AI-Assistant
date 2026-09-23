import React, { useState } from 'react';
import { X, Check, Power, ExternalLink, Puzzle, Shield } from 'lucide-react';
import { AppIcons } from './ToolExecutionTrace';

export interface PluginItem {
  id: 'gmail' | 'calendar' | 'executor' | 'handoff' | 'scholar';
  name: string;
  category: string;
  description: string;
  connected: boolean;
  active: boolean;
  permissions: string[];
}

export const INITIAL_PLUGINS: PluginItem[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'Productivity & Sharing',
    description: 'Directly email high-yield study digests, flashcards, and quiz results to your study group or personal inbox.',
    connected: true,
    active: true,
    permissions: ['Send study summaries', 'Draft flashcard exports']
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    category: 'Spaced Repetition & Schedules',
    description: 'Automatically schedule spaced-repetition revision blocks, study sessions, and exam reminder alerts.',
    connected: true,
    active: true,
    permissions: ['Create calendar events', 'Set reminder alerts']
  },
  {
    id: 'executor',
    name: 'Code Sandbox Executor',
    category: 'Coding & Analysis',
    description: 'Run Python, JavaScript, and TypeScript algorithms in an isolated sandbox to verify time and space complexity.',
    connected: true,
    active: true,
    permissions: ['Execute code sandbox', 'Measure runtime stats']
  },
  {
    id: 'handoff',
    name: 'Scheduling Handoff Assistant',
    category: 'Autonomous Agents',
    description: 'Delegates complex curriculum pacing, revision workload balancing, and multi-day study plans to specialized agents.',
    connected: true,
    active: true,
    permissions: ['Delegate subtasks', 'Curriculum balancing']
  },
  {
    id: 'scholar',
    name: 'Google Scholar & Research',
    category: 'Academic Grounding',
    description: 'Retrieves peer-reviewed papers, textbook excerpts, and verified citations directly into your study pack.',
    connected: true,
    active: true,
    permissions: ['Academic search query', 'Citation formatting']
  }
];

export interface PluginsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PluginsModal: React.FC<PluginsModalProps> = ({ isOpen, onClose }) => {
  const [plugins, setPlugins] = useState<PluginItem[]>(INITIAL_PLUGINS);

  if (!isOpen) return null;

  const togglePlugin = (id: string) => {
    setPlugins(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextConnected = !p.connected;
          return { ...p, connected: nextConnected, active: nextConnected };
        }
        return p;
      })
    );
  };

  const connectedCount = plugins.filter(p => p.connected).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12131A] border border-[#222533] rounded-3xl p-6 max-w-xl w-full flex flex-col space-y-5 shadow-2xl relative text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-[#FF5E00]">
              <Puzzle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Blast Plugins & Connectors</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {connectedCount} active
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Connect your favorite apps and allow Blast AI to automate study tasks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Plugin List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {plugins.map(plugin => {
            const IconComp = AppIcons[plugin.id] || AppIcons.executor;

            return (
              <div
                key={plugin.id}
                className="p-3.5 rounded-2xl bg-[#181A24] border border-[#262A3B] hover:border-zinc-700 transition-all flex items-start gap-3.5"
              >
                {/* Plugin App Icon */}
                <div className="pt-0.5 shrink-0">
                  <IconComp size={34} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-zinc-100">{plugin.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{plugin.category}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    {plugin.description}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    {plugin.permissions.map((perm, i) => (
                      <span key={i} className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                        <Shield size={10} className="text-zinc-400" />
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connect Toggle Button */}
                <button
                  type="button"
                  onClick={() => togglePlugin(plugin.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                    plugin.connected
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                      : 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {plugin.connected ? (
                    <>
                      <Check size={13} />
                      Connected
                    </>
                  ) : (
                    <>
                      <Power size={13} />
                      Connect
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-[#222533] flex items-center justify-between text-xs text-zinc-500">
          <span>Plugins execute securely in sandbox environment.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold hover:scale-105 active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PluginsModal;
