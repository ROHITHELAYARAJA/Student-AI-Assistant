import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Upload
} from 'lucide-react';

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (topic: string, examDate: string, sourceText?: string) => Promise<void>;
  isLoading: boolean;
}

export const CreateTopicModal: React.FC<CreateTopicModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  isLoading
}) => {
  const [topic, setTopic] = useState('');
  const [examTimeline, setExamTimeline] = useState('In 2 Weeks');
  const [sourceText, setSourceText] = useState('');
  const [activeTab, setActiveTab] = useState<'topic' | 'paste'>('topic');

  if (!isOpen) return null;

  const quickTopics = [
    'Graph Algorithms & Dynamic Programming',
    'Distributed Systems & Consensus',
    'Neural Networks & Transformers',
    'Operating System Kernel & Memory',
    'Biochemistry & Cellular Respiration',
    'Macroeconomics & Monetary Policy'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    await onCreate(topic.trim(), examTimeline, sourceText.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121A] border border-[#252538] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#20202E] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Create New Study Module</h2>
              <p className="text-[11px] text-zinc-400">Turbo AI will generate your roadmap, notes, quiz, & flashcards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-[#1A1A28] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex border-b border-[#20202E] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('topic')}
            className={`flex-1 py-2 font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'topic'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen size={13} />
            <span>Topic / Subject</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2 font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'paste'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload size={13} />
            <span>Drop Slides / Paste Notes</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
              What are you studying?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Graph Algorithms & Dijkstra, Machine Learning..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#171724] border border-[#2B2B40] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          {activeTab === 'topic' && (
            <div>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-2">
                Popular Quick Picks
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickTopics.map((qt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(qt)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#181826] hover:bg-purple-600/20 text-zinc-300 hover:text-purple-300 border border-[#27273C] transition-all text-left"
                  >
                    {qt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
                Lecture Notes, Slides, or Syllabus Text
              </label>
              <textarea
                rows={4}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste text directly from your lecture slides, syllabus, or course notes..."
                className="w-full px-3 py-2 rounded-xl bg-[#171724] border border-[#2B2B40] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5 flex items-center gap-1.5">
              <Calendar size={13} className="text-purple-400" />
              <span>When is your upcoming exam?</span>
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {['Tomorrow', 'This Week', 'In 2 Weeks', 'In 1 Month'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setExamTimeline(time)}
                  className={`py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
                    examTimeline === time
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                      : 'bg-[#181826] border-[#27273C] text-zinc-400 hover:bg-[#1E1E30]'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              <Sparkles size={14} />
              <span>{isLoading ? 'Generating Full Turbo Suite...' : 'Generate Turbo AI Platform'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
