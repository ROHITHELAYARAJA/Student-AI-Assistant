import React, { useState } from 'react';
import { router } from '../../services/router.js';
import {
  Mic,
  Upload,
  Youtube,
  ArrowUp,
  FolderPlus,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface LessonCardData {
  id: string;
  title: string;
  openedAgo: string;
  progressPercent: number;
  chapter: string;
}

interface DashboardViewProps {
  userName?: string;
  onStartNewLesson: (prompt: string) => void;
  onOpenUpgrade?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName = 'Sarthak',
  onStartNewLesson,
  onOpenUpgrade
}) => {
  const [prompt, setPrompt] = useState('');
  const [lessons, setLessons] = useState<LessonCardData[]>([
    {
      id: 'faang-sde',
      title: 'Roadmap: Resume to FAANG/MAANG SDE',
      openedAgo: 'Opened 20 days ago',
      progressPercent: 9,
      chapter: 'Ch. 2'
    },
    {
      id: 'dsa-mastery',
      title: 'Graph Algorithms & Dynamic Programming',
      openedAgo: 'Opened 2 days ago',
      progressPercent: 45,
      chapter: 'Ch. 4'
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onStartNewLesson(prompt.trim());
    setPrompt('');
  };

  const handleRecordToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setPrompt('Live lecture transcription in progress: Graph Theory and Dijkstra...');
    }
  };

  const handleAddFolder = () => {
    const title = window.prompt('Enter new folder name:');
    if (title && title.trim()) {
      setLessons((prev) => [
        {
          id: `folder-${Date.now()}`,
          title: title.trim(),
          openedAgo: 'Just now',
          progressPercent: 0,
          chapter: 'Ch. 1'
        },
        ...prev
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-[#111114] text-zinc-100 flex flex-col font-sans select-none">
      <header className="h-16 px-8 flex items-center justify-between border-b border-[#1E1E28]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.navigate('/dashboard')}>
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
          </svg>
          <span className="font-bold text-white text-base tracking-tight">turbo ai</span>
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
            className="w-8 h-8 rounded-full bg-[#582CD6] text-white font-bold text-xs flex items-center justify-center ring-2 ring-[#2F2450] hover:ring-purple-400 transition-all"
            title="Profile / Sign In"
          >
            {userName ? userName[0].toUpperCase() : 'E'}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-sky-500 p-1 flex items-center justify-center shadow-xl shadow-purple-600/30">
              <img
                src="/emma-expressions/reading.png"
                alt="Turbo Mascot"
                className="w-full h-full rounded-xl object-cover bg-[#161622]"
              />
            </div>
            <div className="absolute -top-3 -right-6 p-1.5 rounded-xl bg-[#232336] border border-[#383850] shadow-lg flex items-center gap-1 text-[10px] text-zinc-300">
              <span>📚</span>
              <span>💡</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight text-center">
            What do you want to learn?
          </h1>
        </div>

        <div className="w-full max-w-2xl bg-[#181822] border border-[#272738] rounded-3xl p-4 shadow-2xl space-y-3">
          <div className="text-[11px] text-zinc-400 px-2 font-medium">
            Tip: Press Record to capture your lecture live
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Paste text, enter a study topic, or drop a syllabus link..."
              className="w-full px-3 py-2 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none resize-none"
            />

            <div className="flex items-center justify-between pt-2 border-t border-[#232334]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRecordToggle}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isRecording
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                      : 'bg-[#20202E] hover:bg-[#28283C] border-[#2C2C3E] text-zinc-300'
                  }`}
                >
                  <Mic size={13} className={isRecording ? 'text-rose-400' : 'text-amber-400'} />
                  <span>{isRecording ? 'Recording...' : 'Record'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const text = window.prompt('Paste or enter notes to upload:');
                    if (text) onStartNewLesson(text);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#20202E] hover:bg-[#28283C] border border-[#2C2C3E] text-zinc-300 text-xs font-semibold transition-all"
                >
                  <Upload size={13} className="text-indigo-400" />
                  <span>Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const url = window.prompt('Enter YouTube lecture URL:');
                    if (url) onStartNewLesson(`YouTube Lecture: ${url}`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#20202E] hover:bg-[#28283C] border border-[#2C2C3E] text-zinc-300 text-xs font-semibold transition-all"
                >
                  <Youtube size={13} className="text-red-400" />
                  <span>YouTube</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-mono px-2 py-0.5 rounded bg-[#222232] border border-[#2B2B3E]">
                  /
                </span>
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="w-8 h-8 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-[#7C3AED]"
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="w-full max-w-2xl mt-4">
          <button
            onClick={() => router.navigate('/notes/faang-sde')}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#1C1826] hover:bg-[#252036] border border-[#34274A] flex items-center justify-between text-xs transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span>🥥</span>
              <span className="font-semibold text-zinc-200">
                Roadmap: Resume to FAANG/MAANG SDE
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400">Ch. 2</span>
            </div>
            <span className="text-purple-400 group-hover:text-purple-300 font-medium flex items-center gap-1">
              <span>Jump back in</span>
              <span>→</span>
            </span>
          </button>
        </div>

        <section className="w-full max-w-2xl mt-10 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-wide">Lessons</h2>
            <button
              onClick={handleAddFolder}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <FolderPlus size={14} />
              <span>New folder</span>
            </button>
          </div>

          <div className="space-y-2">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => router.navigate(`/notes/${lesson.id}`)}
                className="p-4 rounded-2xl bg-[#181822] hover:bg-[#1E1E2C] border border-[#262638] hover:border-[#383850] flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                      <line x1="6" y1="6" x2="6.01" y2="6" />
                      <line x1="6" y1="18" x2="6.01" y2="18" />
                    </svg>
                  </div>

                  <div>
                    <h3 className="font-semibold text-xs text-white group-hover:text-purple-300 transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{lesson.openedAgo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#202030] border border-[#2F2F44] flex items-center justify-center text-[11px] font-bold text-purple-400">
                    {lesson.chapter.replace('Ch. ', '')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
