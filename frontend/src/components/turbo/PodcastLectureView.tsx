import React, { useState, useEffect } from 'react';
import { router } from '../../services/router.js';
import { TurboMascot } from './TurboMascot.js';
import { getStudyPack, fetchStudyPack } from '../../services/turboApi.js';
import { TurboStudyPack, TurboPodcastSegment } from '../../types/turbo.js';
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
  Volume2,
  Mic,
  Radio,
  Loader2
} from 'lucide-react';

interface PodcastLectureViewProps {
  noteId?: string;
  topicTitle?: string;
  onOpenUpgrade?: () => void;
  onOpenEmma?: () => void;
}

export const PodcastLectureView: React.FC<PodcastLectureViewProps> = ({
  noteId = 'current',
  topicTitle = 'How to learn Java',
  onOpenUpgrade,
  onOpenEmma
}) => {
  const [studyPack, setStudyPack] = useState<TurboStudyPack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(0);

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

  const segments: TurboPodcastSegment[] = studyPack?.podcast?.segments || [
    {
      speaker: 'Emma (Host)',
      line: `Welcome to Turbo AI Audio Sessions! Today we are doing a high-yield deep dive into ${activeTitle}. Alex, are you ready to unpack this?`
    },
    {
      speaker: 'Alex (Student)',
      line: `Hey Emma! Definitely. Honestly, starting out with ${activeTitle} can feel overwhelming with all the syntax rules and documentation. Where should a beginner focus first?`
    },
    {
      speaker: 'Emma (Host)',
      line: `Always start with the core execution model! When you understand how memory is allocated on the stack versus the heap, everything else clicks into place.`
    },
    {
      speaker: 'Alex (Student)',
      line: `That makes a ton of sense. And what about exam questions or technical interviews? What are the biggest trap questions?`
    },
    {
      speaker: 'Emma (Host)',
      line: `Edge cases! Test writers love testing off-by-one errors, null reference behavior, and thread-safety invariants under high concurrency.`
    },
    {
      speaker: 'Alex (Student)',
      line: `Awesome tip. So review the roadmap checkpoints and flashcards before taking the practice quiz.`
    },
    {
      speaker: 'Emma (Host)',
      line: `Exactly! Keep practicing active recall and you will ace your upcoming tests. Let's get learning!`
    }
  ];

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playSegment = (idx: number) => {
    if (idx >= segments.length) {
      setIsPlaying(false);
      setActiveSegmentIdx(0);
      return;
    }

    setActiveSegmentIdx(idx);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const seg = segments[idx];
      const utterance = new SpeechSynthesisUtterance(seg.line);

      // Distinguish voices slightly
      if (seg.speaker.includes('Emma')) {
        utterance.pitch = 1.15;
        utterance.rate = 1.05;
      } else {
        utterance.pitch = 0.95;
        utterance.rate = 1.0;
      }

      utterance.onend = () => {
        if (idx + 1 < segments.length) {
          playSegment(idx + 1);
        } else {
          setIsPlaying(false);
          setActiveSegmentIdx(0);
        }
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playSegment(activeSegmentIdx);
    }
  };

  const handleRestart = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setActiveSegmentIdx(0);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col font-body select-none">
      {/* Top Header */}
      <header className="h-14 px-6 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.navigate('/dashboard')}>
            <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
              ⚡
            </div>
            <span className="font-headline font-bold text-sm tracking-tight">turbo ai</span>
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
            className="flex flex-col items-center gap-1.5 text-purple-400 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <Headphones size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">Podcast</span>
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

        {/* Podcast Player View */}
        <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 flex flex-col items-center">
          <div className="max-w-2xl w-full space-y-6">
            {/* Player Banner */}
            <div className="p-6 md:p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl relative overflow-hidden space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-purple-400 font-bold mb-1.5">
                    <Radio size={14} className={isPlaying ? 'text-rose-400 animate-pulse' : 'text-purple-400'} />
                    <span>TURBO AI AUDIO PODCAST • DUAL-VOICE</span>
                  </div>
                  <h1 className="font-headline text-2xl font-extrabold text-[var(--color-text)] tracking-tight">
                    {studyPack?.podcast?.title || `Deep Dive: ${activeTitle}`}
                  </h1>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed max-w-lg">
                    {studyPack?.podcast?.overview || `Emma and Alex dissect core principles, interview pitfalls, and practical study takeaways for ${activeTitle}.`}
                  </p>
                </div>
                <TurboMascot size="md" expression={isPlaying ? 'celebrating' : 'reading'} />
              </div>

              {/* Animated Waveform Simulation */}
              <div className="flex items-center justify-center gap-1.5 h-10 py-2">
                {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 35, 75, 55, 85, 40].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-200 ${
                      isPlaying
                        ? 'bg-gradient-to-t from-purple-600 to-indigo-400 animate-pulse'
                        : 'bg-[var(--color-border)]'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(20, (h * (i % 2 === 0 ? 1 : 0.7)))}%` : '20%'
                    }}
                  />
                ))}
              </div>

              {/* Audio Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTogglePlay}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-white" />}
                    <span>{isPlaying ? 'Pause Episode' : 'Play Audio Session'}</span>
                  </button>

                  <button
                    onClick={handleRestart}
                    className="p-2.5 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-zinc-400 hover:text-[var(--color-text)] transition-colors"
                    title="Restart from beginning"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <Volume2 size={15} className="text-purple-400" />
                  <span>Segment {activeSegmentIdx + 1} of {segments.length}</span>
                </div>
              </div>
            </div>

            {/* Transcript Flow */}
            <div className="space-y-3">
              <h2 className="font-headline font-bold text-sm text-[var(--color-text)] px-1">
                Episode Transcript
              </h2>

              <div className="space-y-3">
                {segments.map((seg, idx) => {
                  const isCurrent = activeSegmentIdx === idx;
                  const isEmma = seg.speaker.includes('Emma');

                  return (
                    <div
                      key={idx}
                      onClick={() => playSegment(idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-purple-950/20 border-purple-500 shadow-md ring-1 ring-purple-500/30'
                          : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-subtle)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <TurboMascot size="xs" expression={isEmma ? 'teaching' : 'thinking'} />
                          <span
                            className={`font-headline font-bold text-xs ${
                              isEmma ? 'text-purple-400' : 'text-indigo-400'
                            }`}
                          >
                            {seg.speaker}
                          </span>
                        </div>

                        {isCurrent && isPlaying && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
                            Speaking
                          </span>
                        )}
                      </div>

                      <p className="text-xs md:text-sm text-[var(--color-text)] leading-relaxed pl-7">
                        {seg.line}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Ask Emma AI Button */}
      <button
        onClick={onOpenEmma || (() => router.navigate(`/notes/${noteId}/editor`))}
        className="fixed right-6 bottom-8 py-2 px-3.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl text-xs font-bold text-[var(--color-text)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all z-40"
      >
        <TurboMascot size="xs" expression="teaching" />
        <span>Ask Emma AI</span>
      </button>
    </div>
  );
};
export default PodcastLectureView;
