import React, { useState, useEffect } from 'react';
import { X, Youtube, Sparkles, ArrowRight, Loader2, AlertCircle, ExternalLink, Clipboard, Check } from 'lucide-react';
import { TurboStudyPack } from '../../types/turbo';
import { request } from '../../services/studyApi';

interface YouTubeModalProps {
  onClose: () => void;
  onNotebookCreated: (pack: TurboStudyPack) => void;
  onToast: (msg: string) => void;
}

export const YouTubeModal: React.FC<YouTubeModalProps> = ({
  onClose,
  onNotebookCreated,
  onToast
}) => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [pasted, setPasted] = useState(false);

  // Extract YouTube Video ID
  function extractVideoId(inputUrl: string): string | null {
    try {
      const trimmed = inputUrl.trim();
      if (!trimmed) return null;
      // Patterns: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/v/ID
      const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = trimmed.match(regExp);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const id = extractVideoId(url);
    setVideoId(id);
    if (id && !title) {
      setTitle(`YouTube Study Lesson (${id})`);
    }
  }, [url]);

  async function handlePasteClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
      }
    } catch {
      onToast('Could not access clipboard. Please paste manually (Ctrl+V).');
    }
  }

  async function handleImport() {
    if (!videoId) {
      setError('Please provide a valid YouTube watch URL.');
      return;
    }

    setFetching(true);
    setError('');
    try {
      onToast('Retrieving video transcript…');
      const doc = await request<any>('/documents/youtube', {
        method: 'POST',
        body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}` })
      });

      const packTitle = title.trim() || doc.title || `YouTube Lesson · ${videoId}`;
      onToast('Generating study pack from transcript…');

      const pack = await request<TurboStudyPack>('/notebooks', {
        method: 'POST',
        body: JSON.stringify({
          topic: packTitle,
          text: doc.text,
          documentIds: [doc.id]
        })
      });

      onNotebookCreated(pack);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Could not retrieve transcript. The video might not have public captions enabled.');
    } finally {
      setFetching(false);
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
        className="youtube-studio-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="youtube-title"
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
                background: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f87171'
              }}
            >
              <Youtube size={24} />
            </div>
            <div>
              <h2 id="youtube-title" style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                Learn from YouTube
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#9090a2' }}>
                Extract lecture transcripts & generate complete notes, cards, and quizzes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close YouTube modal"
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

        {/* URL Input Row with Auto-Paste */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#b0b0c2', marginBottom: '6px' }}>
            YouTube Video Link
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=… or https://youtu.be/…"
                style={{
                  width: '100%',
                  background: '#191922',
                  border: '1px solid #2d2d3e',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  paddingLeft: '38px',
                  color: '#ffffff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <Youtube
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#ef4444'
                }}
              />
            </div>
            <button
              type="button"
              onClick={handlePasteClipboard}
              style={{
                background: '#20202c',
                border: '1px solid #2e2e42',
                borderRadius: '12px',
                padding: '0 14px',
                color: pasted ? '#22c55e' : '#c4b5fd',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {pasted ? <Check size={15} /> : <Clipboard size={15} />}
              <span>{pasted ? 'Pasted!' : 'Paste Link'}</span>
            </button>
          </div>
        </div>

        {/* Live Video Preview Card */}
        {videoId ? (
          <div
            style={{
              background: '#181822',
              border: '1px solid #2e2e42',
              borderRadius: '16px',
              padding: '14px',
              display: 'flex',
              gap: '16px',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '140px',
                height: '84px',
                borderRadius: '10px',
                overflow: 'hidden',
                background: '#09090d',
                flexShrink: 0
              }}
            >
              <img
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt="Video Thumbnail"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '24px',
                    background: '#ef4444',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}
                >
                  <Youtube size={16} fill="white" />
                </div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    letterSpacing: '0.5px'
                  }}
                >
                  YOUTUBE VIDEO
                </span>
                <span style={{ fontSize: '12px', color: '#8e8e9c' }}>ID: {videoId}</span>
              </div>
              <strong style={{ fontSize: '14px', color: '#ffffff', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {title || 'Ready to fetch transcript'}
              </strong>
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '12px',
                  color: '#a855f7',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px'
                }}
              >
                <span>View on YouTube</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#16161e',
              border: '1px dashed #282838',
              borderRadius: '16px',
              padding: '24px 20px',
              textAlign: 'center',
              color: '#808096'
            }}
          >
            <p style={{ margin: 0, fontSize: '13.5px' }}>
              Paste a YouTube lecture link above to preview video and import its transcript.
            </p>
            <small style={{ display: 'block', marginTop: '4px', color: '#5e5e72', fontSize: '11.5px' }}>
              Works with lectures, tutorials, podcasts, and talks with English or auto captions.
            </small>
          </div>
        )}

        {/* Notebook Title */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#b0b0c2', marginBottom: '6px' }}>
            Notebook Title
          </label>
          <input
            type="text"
            value={title}
            maxLength={120}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. MIT 18.06 Linear Algebra · Lecture 1"
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
            onClick={handleImport}
            disabled={fetching || !videoId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: (!fetching && videoId)
                ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                : '#252533',
              border: 'none',
              borderRadius: '12px',
              padding: '11px 22px',
              color: (!fetching && videoId) ? '#ffffff' : '#6b7280',
              fontSize: '14px',
              fontWeight: 600,
              cursor: (!fetching && videoId) ? 'pointer' : 'not-allowed',
              boxShadow: (!fetching && videoId) ? '0 4px 16px rgba(239, 68, 68, 0.4)' : 'none'
            }}
          >
            {fetching ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
            <span>{fetching ? 'Fetching Transcript…' : 'Create Study Notebook'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
