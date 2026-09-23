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
  Play,
  Pause,
  RotateCcw,
  Volume2
} from 'lucide-react';

interface PodcastLectureViewProps {
  noteId?: string;
  topicTitle?: string;
  onOpenUpgrade?: () => void;
  onOpenEmma?: () => void;
}

export const PodcastLectureView: React.FC<PodcastLectureViewProps> = ({
  noteId = 'faang-sde',
  topicTitle = 'Roadmap: Resume to FAANG/MAANG SDE',
  onOpenUpgrade,
  onOpenEmma
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(0);

  const script = [
    {
      speaker: 'Emma (Host)',
      text: 'Welcome to Turbo AI Audio Sessions! Today we are dissecting the exact transition roadmap from college projects to FAANG SDE standards. Alex, ready to dig in?'
    },
    {
      speaker: 'Alex (Student)',
      text: 'Hey Emma! Excited for this. A lot of students have Spring Boot and React projects, but still struggle to pass screening rounds. What is the biggest missing link?'
    },
    {
      speaker: 'Emma (Host)',
      text: 'It comes down to two words: Quantified Impact. Instead of writing "built a REST service", you need to demonstrate "reduced API p99 latency by 35% through Redis caching and index tuning".'
    },
    {
      speaker: 'Alex (Student)',
      text: 'That is huge! And what about LeetCode? How many questions are really needed?'
    },
    {
      speaker: 'Emma (Host)',
      text: 'Quality beats raw quantity! Master the core patterns first—two pointers, sliding window, topological sort, and dynamic programming—around 150 well-understood problems.'
    }
  ];

  // Speech playback support
  const handleTogglePlay = () => {
    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playSegment(activeSpeaker);
    }
  };

  const playSegment = (index: number) => {
    if (index >= script.length) {
      setIsPlaying(false);
      setActiveSpeaker(0);
      return;
    }
    setActiveSpeaker(index);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const item = script[index];
      const utter = new SpeechSynthesisUtterance(item.text);
      utter.rate = 1.05;
      utter.pitch = item.speaker.includes('Emma') ? 1.15 : 0.95;
      utter.onend = () => {
        if (index + 1 < script.length) {
          playSegment(index + 1);
        } else {
          setIsPlaying(false);
          setActiveSpeaker(0);
        }
      };
      utter.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utter);
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

          <button onClick={() => router.navigate(`/notes/${noteId}/podcast`)} className="flex flex-col items-center gap-1.5 text-purple-400 group">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <Headphones size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">Podcast</span>
          </button>

          <button onClick={() => router.navigate(`/notes/${noteId}/source`)} className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200">
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <FolderGit2 size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Source</span>
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto px-8 py-10 max-w-2xl mx-auto w-full space-y-6">
          <div className="p-6 rounded-3xl bg-[#161622] border border-[#27273C] flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Headphones size={28} className="text-purple-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Audio Lecture • 4 Mins
                </span>
                <h1 className="text-lg font-bold text-white mt-1.5">
                  Turbo Audio Breakdown: Resume to FAANG SDE
                </h1>
              </div>
            </div>

            <button
              onClick={handleTogglePlay}
              className="p-3.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-600/30 transition-all active:scale-[0.96]"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Episode Script & Audio Nodes</h2>
            {script.map((seg, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setActiveSpeaker(idx);
                  if (isPlaying) {
                    playSegment(idx);
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeSpeaker === idx
                    ? 'bg-[#1C1828] border-purple-500/60 shadow-md shadow-purple-500/5'
                    : 'bg-[#151520] border-[#222232] hover:bg-[#1A1A26]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-xs font-bold ${seg.speaker.includes('Emma') ? 'text-purple-300' : 'text-cyan-300'}`}>
                    {seg.speaker}
                  </span>
                  {activeSpeaker === idx && isPlaying && (
                    <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 px-1.5 rounded animate-pulse">
                      Playing
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-normal">{seg.text}</p>
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
