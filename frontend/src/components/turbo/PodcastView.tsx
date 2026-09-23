import React, { useState, useEffect, useRef } from 'react';
import { TurboPodcastScript } from '../../types/turbo.js';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sparkles,
  User,
  Clock
} from 'lucide-react';
import { BlastMascot } from './BlastMascot.js';

interface PodcastViewProps {
  podcast: TurboPodcastScript | null;
  isLoading: boolean;
  onOpenEmmaWithPrompt: (prompt: string) => void;
}

export const PodcastView: React.FC<PodcastViewProps> = ({
  podcast,
  isLoading,
  onOpenEmmaWithPrompt
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speakLine = (index: number) => {
    if (!podcast || !podcast.segments[index] || !synthRef.current) return;
    synthRef.current.cancel();

    const segment = podcast.segments[index];
    const utterance = new SpeechSynthesisUtterance(segment.line);
    utterance.rate = playbackSpeed;

    const voices = synthRef.current.getVoices();
    if (segment.speaker.includes('Emma')) {
      const femaleVoice = voices.find((v) => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female') || v.name.includes('Zira'));
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = 1.1;
    } else {
      const maleVoice = voices.find((v) => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google UK English Male'));
      if (maleVoice) utterance.voice = maleVoice;
      utterance.pitch = 0.95;
    }

    utterance.onend = () => {
      if (index < podcast.segments.length - 1) {
        setCurrentLineIdx(index + 1);
        speakLine(index + 1);
      } else {
        setIsPlaying(false);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handlePlayToggle = () => {
    if (!synthRef.current) return;
    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakLine(currentLineIdx);
    }
  };

  const handleRestart = () => {
    if (synthRef.current) synthRef.current.cancel();
    setCurrentLineIdx(0);
    setIsPlaying(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin mb-4" />
        <h3 className="text-white font-semibold text-sm">Producing AI Audio Lecture...</h3>
        <p className="text-zinc-400 text-xs mt-1">Emma and Alex are writing the conversational study breakdown script.</p>
      </div>
    );
  }

  if (!podcast || !podcast.segments || podcast.segments.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="p-4 rounded-2xl bg-[#1A1A28] border border-[#2D2D42] mb-4">
          <Headphones size={32} className="text-purple-400" />
        </div>
        <h3 className="text-white font-semibold text-base">No Audio Lecture Available</h3>
        <p className="text-zinc-400 text-xs mt-1 max-w-sm">
          Select or enter a study topic above to generate a conversational podcast episode.
        </p>
      </div>
    );
  }

  const progressPercent = Math.round(((currentLineIdx + 1) / podcast.segments.length) * 100);

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full space-y-6">
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#161626] to-[#0E0E18] border border-[#28283C] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 p-1">
              <BlastMascot size="md" state={isPlaying ? 'speaking' : 'listening'} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Blast Audio Session
                </span>
                <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <Clock size={12} />
                  <span>{podcast.audioDurationEstimate}</span>
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-wide">{podcast.title}</h1>
              <p className="text-xs text-zinc-400 mt-0.5">{podcast.overview}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRestart}
              className="p-3 rounded-2xl bg-[#1C1C2C] hover:bg-[#25253A] border border-[#2E2E44] text-zinc-400 hover:text-zinc-200 transition-all"
              title="Restart Audio"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={handlePlayToggle}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'Pause Episode' : 'Play Episode'}</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#242436] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Volume2 size={16} className={isPlaying ? 'text-purple-400 animate-pulse' : 'text-zinc-500'} />
            <div className="flex items-center gap-1">
              {[4, 8, 14, 6, 12, 16, 9, 5].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all ${
                    isPlaying ? 'bg-purple-400 animate-pulse' : 'bg-zinc-700'
                  }`}
                  style={{ height: isPlaying ? `${h * 1.5}px` : '4px' }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">Speed:</span>
            {[1, 1.25, 1.5].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-all ${
                  playbackSpeed === spd
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#1C1C2A] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-1 bg-[#1F1F2E] mt-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Synchronized Transcript</h2>
        {podcast.segments.map((seg, idx) => {
          const isCurrent = currentLineIdx === idx;
          const isEmma = seg.speaker.includes('Emma');

          return (
            <div
              key={idx}
              onClick={() => {
                setCurrentLineIdx(idx);
                if (isPlaying) speakLine(idx);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-purple-950/20 border-purple-500/50 shadow-md shadow-purple-500/5'
                  : 'bg-[#13131C] border-[#222232] hover:border-[#303046]'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                {isEmma ? (
                  <BlastMascot size="xs" state={isCurrent && isPlaying ? 'speaking' : 'idle'} />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <User size={12} />
                  </div>
                )}
                <span
                  className={`text-xs font-bold ${
                    isEmma ? 'text-purple-300' : 'text-indigo-300'
                  }`}
                >
                  {seg.speaker}
                </span>

                {isCurrent && isPlaying && (
                  <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded font-semibold animate-pulse">
                    Speaking
                  </span>
                )}
              </div>

              <p
                className={`text-xs leading-relaxed ${
                  isCurrent ? 'text-white font-medium' : 'text-zinc-300'
                }`}
              >
                {seg.line}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
