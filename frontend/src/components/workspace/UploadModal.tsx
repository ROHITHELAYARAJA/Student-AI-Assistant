import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { TurboStudyPack } from '../../types/turbo';
import { request } from '../../services/studyApi';

interface UploadModalProps {
  onClose: () => void;
  onNotebookCreated: (pack: TurboStudyPack) => void;
  onToast: (msg: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  onClose,
  onNotebookCreated,
  onToast
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function formatBytes(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  async function handleFileSelected(selectedFile?: File) {
    if (!selectedFile) return;
    setError('');
    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
    setUploading(true);

    try {
      const body = new FormData();
      body.append('file', selectedFile);
      const doc = await request<any>('/documents', { method: 'POST', body });
      setDocId(doc.id);
      setExtractedText(doc.text || '');
      setNotes(doc.text?.slice(0, 1500) || '');
      onToast(doc.notice || 'Document uploaded and analyzed successfully.');
    } catch (e: any) {
      setError(e.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerate() {
    const topic = title.trim();
    const textContent = (notes.trim() || extractedText.trim());
    if (!topic) {
      setError('Please provide a title for this notebook.');
      return;
    }
    if (!docId && !textContent) {
      setError('Please upload a file or paste your study material.');
      return;
    }

    setCreating(true);
    setError('');
    try {
      const pack = await request<TurboStudyPack>('/notebooks', {
        method: 'POST',
        body: JSON.stringify({
          topic,
          text: textContent || `Uploaded study source: ${topic}`,
          documentIds: docId ? [docId] : []
        })
      });
      onNotebookCreated(pack);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed to generate study notebook.');
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
        className="upload-studio-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-title"
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
                background: 'rgba(59, 130, 246, 0.18)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa'
              }}
            >
              <Upload size={22} />
            </div>
            <div>
              <h2 id="upload-title" style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                Upload Study Materials
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#9090a2' }}>
                Import textbooks, notes, slides or diagrams into a structured study set.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close upload modal"
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

        {/* Hidden Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.png,.jpg,.jpeg,application/pdf,text/plain,text/markdown,image/png,image/jpeg"
          hidden
          onChange={e => {
            handleFileSelected(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        {/* Dropzone */}
        {!file ? (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              handleFileSelected(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: isDragging ? '2px dashed #8b5cf6' : '2px dashed #2d2d3e',
              background: isDragging ? 'rgba(139, 92, 246, 0.08)' : '#171720',
              borderRadius: '18px',
              padding: '36px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#232332',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c084fc'
              }}
            >
              <Upload size={24} />
            </div>
            <div>
              <strong style={{ fontSize: '15px', color: '#ffffff', display: 'block' }}>
                Drag and drop your document here
              </strong>
              <span style={{ fontSize: '13px', color: '#88889b', marginTop: '4px', display: 'block' }}>
                or click to browse from your device
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '6px' }}>
              {['PDF (with diagrams)', 'TXT', 'Markdown', 'PNG', 'JPEG'].map(badge => (
                <span
                  key={badge}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: '#20202c',
                    color: '#a0a0b6',
                    border: '1px solid #2e2e40'
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
            <small style={{ fontSize: '11px', color: '#66667a' }}>Files up to 10 MB supported</small>
          </div>
        ) : (
          /* File Attached Card */
          <div
            style={{
              background: '#181822',
              border: '1px solid #2b2b3d',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc',
                  flexShrink: 0
                }}
              >
                {file.type.startsWith('image/') ? <ImageIcon size={22} /> : <FileText size={22} />}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <strong style={{ fontSize: '14px', color: '#ffffff', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {file.name}
                </strong>
                <span style={{ fontSize: '12px', color: '#88889b' }}>
                  {formatBytes(file.size)} · {uploading ? 'Analyzing document…' : 'Parsed & ready'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {uploading ? (
                <Loader2 size={18} className="spin" style={{ color: '#c084fc' }} />
              ) : (
                <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
              )}
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setDocId(null);
                  setExtractedText('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#717182',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#b0b0c2', marginBottom: '6px' }}>
              Notebook Title
            </label>
            <input
              type="text"
              value={title}
              maxLength={120}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Molecular Biology · Chapter 4"
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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#b0b0c2', marginBottom: '6px' }}>
              Notes / Extracted Text Preview
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Paste supplementary notes, syllabus objectives, or review extracted text…"
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
            onClick={handleGenerate}
            disabled={uploading || creating || !title.trim() || (!file && !notes.trim())}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: (!uploading && !creating && title.trim() && (file || notes.trim()))
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : '#252533',
              border: 'none',
              borderRadius: '12px',
              padding: '11px 22px',
              color: (!uploading && !creating && title.trim() && (file || notes.trim())) ? '#ffffff' : '#6b7280',
              fontSize: '14px',
              fontWeight: 600,
              cursor: (!uploading && !creating && title.trim() && (file || notes.trim())) ? 'pointer' : 'not-allowed',
              boxShadow: (!uploading && !creating && title.trim() && (file || notes.trim())) ? '0 4px 16px rgba(37, 99, 235, 0.4)' : 'none'
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
