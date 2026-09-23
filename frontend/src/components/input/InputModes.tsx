import React, { useState, useRef } from 'react';
import { Type, Mic, MicOff, Upload, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import { InputMode } from '../../types/study.js';

interface InputModesProps {
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  content: string;
  onContentChange: (val: string) => void;
}

export const InputModes: React.FC<InputModesProps> = ({
  inputMode,
  onInputModeChange,
  content,
  onContentChange
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startVoiceRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        onContentChange(content ? `${content} ${transcript}` : transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        onContentChange(text);
      }
    };
    reader.readAsText(file);
  };

  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        transition: 'all var(--transition-normal)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: '10px 20px',
          backgroundColor: 'rgba(255, 225, 226, 0.35)'
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onInputModeChange('text')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: inputMode === 'text' ? 'var(--color-primary)' : 'transparent',
              color: inputMode === 'text' ? '#FFFFFF' : 'var(--color-text)',
              fontSize: '12px',
              fontWeight: 700,
              transition: 'all var(--transition-fast)'
            }}
          >
            <Type size={14} />
            <span>Type / Paste</span>
          </button>

          <button
            onClick={() => onInputModeChange('voice')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: inputMode === 'voice' ? 'var(--color-primary)' : 'transparent',
              color: inputMode === 'voice' ? '#FFFFFF' : 'var(--color-text)',
              fontSize: '12px',
              fontWeight: 700,
              transition: 'all var(--transition-fast)'
            }}
          >
            <Mic size={14} />
            <span>Live Speech</span>
          </button>

          <button
            onClick={() => onInputModeChange('file')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: inputMode === 'file' ? 'var(--color-primary)' : 'transparent',
              color: inputMode === 'file' ? '#FFFFFF' : 'var(--color-text)',
              fontSize: '12px',
              fontWeight: 700,
              transition: 'all var(--transition-fast)'
            }}
          >
            <Upload size={14} />
            <span>File Extract</span>
          </button>
        </div>

        {content && (
          <button
            onClick={() => {
              onContentChange('');
              setUploadedFileName(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-accent)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Trash2 size={13} />
            Clear
          </button>
        )}
      </div>

      <div style={{ padding: '16px 20px' }}>
        {inputMode === 'voice' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 0',
              gap: '16px'
            }}
          >
            <div style={{ position: 'relative' }}>
              <button
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: isRecording ? 'var(--color-primary)' : 'var(--color-surface)',
                  border: '2px solid var(--color-primary)',
                  color: isRecording ? '#FFFFFF' : 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isRecording
                    ? '0 0 28px rgba(225, 29, 72, 0.6)'
                    : 'var(--shadow-md)',
                  transition: 'all var(--transition-normal)'
                }}
              >
                {isRecording ? <MicOff size={30} /> : <Mic size={30} />}
              </button>
            </div>

            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
              {isRecording
                ? 'Listening to speech... Click to conclude dictation'
                : 'Click mic icon to dictate speech in real-time'}
            </p>

            {isRecording && (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '24px' }}>
                {[30, 60, 90, 45, 80, 50, 70, 40].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: '4px',
                      height: `${h}%`,
                      backgroundColor: 'var(--color-primary)',
                      borderRadius: '2px',
                      animation: 'pulse-ring 1s ease-in-out infinite',
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {inputMode === 'file' && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '28px',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 225, 226, 0.25)',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'all var(--transition-fast)'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--color-border)';
              const file = e.dataTransfer.files?.[0];
              if (file) {
                setUploadedFileName(file.name);
                const reader = new FileReader();
                reader.onload = (event) => {
                  const text = event.target?.result as string;
                  if (text) onContentChange(text);
                };
                reader.readAsText(file);
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json,.csv,.py,.java,.ts,.js,.cpp,.c"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto',
                color: 'var(--color-primary)'
              }}
            >
              <Upload size={22} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
              {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Drop files here or click to browse'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Supports TXT, Markdown, CSV, Source Code files
            </p>
          </div>
        )}

        <textarea
          placeholder="Paste syllabus text, exam question, raw lecture notes, or code snippet..."
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          rows={5}
          style={{
            width: '100%',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            fontSize: '14px',
            color: 'var(--color-text)',
            backgroundColor: 'var(--color-bg-alt)',
            resize: 'vertical',
            lineHeight: 1.6
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            fontWeight: 500
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            <span>{charCount} characters</span>
            <span>{wordCount} words</span>
            {uploadedFileName && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)' }}>
                <CheckCircle2 size={13} /> {uploadedFileName}
              </span>
            )}
          </div>
          <span>Ready to execute any of the 100 features below</span>
        </div>
      </div>
    </div>
  );
};
