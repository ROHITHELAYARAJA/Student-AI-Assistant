import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Square, Play, Pause, Sparkles, ArrowRight, Volume2, AlertCircle, FileText } from 'lucide-react';
import { TurboStudyPack } from '../../types/turbo';
import { request } from '../../services/studyApi';

interface RecordModalProps {
  onClose: () => void;
  onNotebookCreated: (pack: TurboStudyPack) => void;
  onToast: (msg: string) => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  onClose,
  onNotebookCreated,
  onToast
}) => {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [title, setTitle] = useState(() => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `Lecture · ${today}`;
  });
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Timer effect
  useEffect(() => {
    if (recording && !paused) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording, paused]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  function formatTime(totalSec: number) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function startRecording() {
    setError('');
    const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Speech) {
      setError('Live speech recognition is not supported in this browser. You can type or paste your lecture notes directly into the transcript area below.');
      setRecording(true);
      return;
    }

    try {
      const rec = new Speech();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (e: any) => {
        let full = '';
        for (let i = 0; i < e.results.length; i++) {
          full += e.results[i][0].transcript + ' ';
        }
        if (full.trim()) {
          setTranscription(full.trim());
        }
      };

      rec.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          setError(`Microphone notice: ${e.error || 'Please allow microphone access in your browser.'}`);
        }
      };

      rec.onend = () => {
        if (recording && !paused) {
          try { rec.start(); } catch {}
        }
      };

      recognitionRef.current = rec;
      rec.start();
      setRecording(true);
      setPaused(false);
      onToast('Recording lecture… Speak clearly into your mic.');
    } catch (err: any) {
      setError('Could not access microphone: ' + err.message);
    }
  }

  function togglePause() {
    if (paused) {
      setPaused(false);
      try { recognitionRef.current?.start(); } catch {}
      onToast('Resumed recording.');
    } else {
      setPaused(true);
      try { recognitionRef.current?.stop(); } catch {}
      onToast('Paused recording.');
    }
  }

  function stopRecording() {
    setRecording(false);
    setPaused(false);
    try { recognitionRef.current?.stop(); } catch {}
    onToast('Recording stopped. Review your notes and generate your notebook!');
  }

  async function handleCreateNotebook() {
    const topic = title.trim();
    const text = transcription.trim();
    if (!topic || !text) {
      setError('Please provide a lecture title and record or type some lecture notes.');
      return;
    }

    setCreating(true);
    setError('');
    try {
      const pack = await request<TurboStudyPack>('/notebooks', {
        method: 'POST',
        body: JSON.stringify({
          topic,
          text,
          documentIds: []
        })
      });
      onNotebookCreated(pack);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to create notebook.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(7, 8, 12, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="record-studio-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-title"
        style={{
          width: '100%',
          maxWidth: '580px',
          background: '#131318',
          border: '1px solid #282836',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 24px 70px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          color: '#f0f0f5',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: recording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(147, 51, 234, 0.18)',
                border: recording ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(147, 51, 234, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: recording ? '#ef4444' : '#c084fc'
              }}
            >
              <Mic size={22} />
            </div>
            <div>
              <h2 id="record-title" style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                Live Audio & Lecture Studio
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#9090a2' }}>
                Capture lectures or voice thoughts — Blast generates notes in real time.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close recording modal"
            style={{
              background: '#1d1d26',
              border: '1px solid #2f2f3d',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9090a2',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Visualizer & Timer Area */}
        <div
          style={{
            background: '#181820',
            border: '1px solid #252533',
            borderRadius: '18px',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center'
          }}
        >
          {/* Status badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: recording ? (paused ? '#eab308' : '#ef4444') : '#6b7280',
                boxShadow: recording && !paused ? '0 0 10px #ef4444' : 'none',
                display: 'inline-block'
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: recording ? (paused ? '#fde047' : '#f87171') : '#9ca3af' }}>
              {recording ? (paused ? 'RECORDING PAUSED' : 'LIVE RECORDING IN PROGRESS') : 'READY TO RECORD'}
            </span>
          </div>

          {/* Time display */}
          <div
            style={{
              fontSize: '44px',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', monospace",
              color: recording && !paused ? '#ffffff' : '#9ca3af',
              letterSpacing: '2px'
            }}
          >
            {formatTime(seconds)}
          </div>

          {/* Animated sound wave bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '36px' }}>
            {[0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.7].map((height, i) => (
              <div
                key={i}
                style={{
                  width: '6px',
                  borderRadius: '3px',
                  background: recording && !paused
                    ? 'linear-gradient(180deg, #c084fc 0%, #7e22ce 100%)'
                    : '#2b2b3a',
                  height: recording && !paused ? `${height * 32}px` : '6px',
                  transition: 'height 0.2s ease',
                  animation: recording && !paused ? `pulseWave 1.2s infinite ease-in-out ${i * 0.15}s` : 'none'
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
            {!recording ? (
              <button
                type="button"
                onClick={startRecording}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '12px 28px',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                }}
              >
                <Mic size={18} />
                <span>Start Recording</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={togglePause}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#232330',
                    border: '1px solid #36364a',
                    borderRadius: '24px',
                    padding: '10px 20px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {paused ? <Play size={16} /> : <Pause size={16} />}
                  <span>{paused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(239, 68, 68, 0.18)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '24px',
                    padding: '10px 22px',
                    color: '#f87171',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Square size={16} fill="currentColor" />
                  <span>Done Recording</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#b0b0c2', marginBottom: '6px' }}>
              Lecture / Notebook Title
            </label>
            <input
              type="text"
              value={title}
              maxLength={120}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Advanced Operating Systems · Lecture 4"
              style={{
                width: '100%',
                background: '#191922',
                border: '1px solid #2d2d3e',
                borderRadius: '12px',
                padding: '11px 14px',
                color: '#ffffff',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#b0b0c2' }}>
                Live Transcribed Speech
              </label>
              <span style={{ fontSize: '12px', color: '#7a7a8e' }}>
                {transcription ? `${transcription.split(/\s+/).filter(Boolean).length} words` : 'Waiting for voice…'}
              </span>
            </div>
            <textarea
              rows={4}
              value={transcription}
              onChange={e => setTranscription(e.target.value)}
              placeholder="Spoken words will automatically appear here as you speak. You can also edit or paste notes directly…"
              style={{
                width: '100%',
                background: '#191922',
                border: '1px solid #2d2d3e',
                borderRadius: '12px',
                padding: '12px 14px',
                color: '#ffffff',
                fontSize: '13.5px',
                lineHeight: 1.5,
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '13px' }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #2b2b3a',
              borderRadius: '12px',
              padding: '10px 18px',
              color: '#a0a0b2',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateNotebook}
            disabled={creating || !transcription.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: transcription.trim()
                ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
                : '#252533',
              border: 'none',
              borderRadius: '12px',
              padding: '11px 22px',
              color: transcription.trim() ? '#ffffff' : '#6b7280',
              fontSize: '14px',
              fontWeight: 600,
              cursor: transcription.trim() ? 'pointer' : 'not-allowed',
              boxShadow: transcription.trim() ? '0 4px 16px rgba(109, 40, 217, 0.4)' : 'none'
            }}
          >
            <Sparkles size={16} />
            <span>{creating ? 'Creating Study Notebook…' : 'Generate Study Notebook'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
