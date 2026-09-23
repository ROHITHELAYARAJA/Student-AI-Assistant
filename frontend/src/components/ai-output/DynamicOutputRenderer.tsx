import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  StickyNote,
  Download,
  Code2,
  Eye,
  Clock,
  Sparkles
} from 'lucide-react';
import { StructuredAiResponse } from '../../types/study.js';
import { FlashcardDeck } from './FlashcardDeck.js';
import { InteractiveQuiz } from './InteractiveQuiz.js';
import { CodeStudio } from './CodeStudio.js';
import { ComparisonMatrix } from './ComparisonMatrix.js';
import { StudyPlanTimeline } from './StudyPlanTimeline.js';
import { FormulaCard } from './FormulaCard.js';
import { MindmapTree } from './MindmapTree.js';
import { KeypointsCard } from './KeypointsCard.js';
import { FormattedArticle } from './FormattedArticle.js';

interface DynamicOutputRendererProps {
  response: StructuredAiResponse;
  onSaveToNotes: (response: StructuredAiResponse) => void;
  isSavedInNotes?: boolean;
}

export const DynamicOutputRenderer: React.FC<DynamicOutputRendererProps> = ({
  response,
  onSaveToNotes,
  isSavedInNotes = false
}) => {
  const [viewMode, setViewMode] = useState<'component' | 'markdown'>('component');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(response.rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis not supported by this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(response.rawMarkdown.slice(0, 1200));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([response.rawMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${response.operation}_study_notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderComponentView = () => {
    switch (response.componentType) {
      case 'flashcards':
        return (
          <FlashcardDeck
            cards={response.data.flashcards || []}
            title={response.title}
          />
        );
      case 'quiz':
        return (
          <InteractiveQuiz
            questions={response.data.quiz || []}
            title={response.title}
          />
        );
      case 'code':
        return (
          <CodeStudio
            codeData={
              response.data.code || {
                language: 'typescript',
                code: response.rawMarkdown,
                explanation: 'Compiled source logic.'
              }
            }
            title={response.title}
          />
        );
      case 'matrix':
        return (
          <ComparisonMatrix
            comparison={
              response.data.comparison || {
                entityA: 'Approach 1',
                entityB: 'Approach 2',
                rows: [],
                verdict: ''
              }
            }
            title={response.title}
          />
        );
      case 'timeline':
        return (
          <StudyPlanTimeline
            timeline={response.data.timeline || []}
            title={response.title}
          />
        );
      case 'formula':
        return (
          <FormulaCard
            formulas={response.data.formulas || []}
            title={response.title}
          />
        );
      case 'mindmap':
        return (
          <MindmapTree
            node={response.data.mindmap || { id: 'r', label: response.title }}
            title={response.title}
          />
        );
      case 'keypoints':
        return (
          <KeypointsCard
            keypoints={response.data.keypoints || []}
            title={response.title}
          />
        );
      case 'article':
      default:
        return (
          <FormattedArticle
            article={
              response.data.article || {
                sections: [{ heading: response.title, body: response.rawMarkdown }]
              }
            }
            title={response.title}
          />
        );
    }
  };

  return (
    <section
      style={{
        marginTop: '28px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '2px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1.5px solid var(--color-border)',
          backgroundColor: 'rgba(255, 225, 226, 0.45)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF'
            }}
          >
            {response.componentType} Component
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <Clock size={13} />
            <span>{response.metadata.processingTimeMs}ms • {response.metadata.model}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              padding: '2px',
              marginRight: '6px'
            }}
          >
            <button
              onClick={() => setViewMode('component')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: viewMode === 'component' ? 'var(--color-primary)' : 'transparent',
                color: viewMode === 'component' ? '#FFFFFF' : 'var(--color-text)'
              }}
            >
              <Eye size={13} /> Interactive
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: viewMode === 'markdown' ? 'var(--color-primary)' : 'transparent',
                color: viewMode === 'markdown' ? '#FFFFFF' : 'var(--color-text)'
              }}
            >
              <Code2 size={13} /> Raw MD
            </button>
          </div>

          <button
            onClick={handleToggleSpeech}
            title={isSpeaking ? 'Stop Reading' : 'Read Aloud'}
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: isSpeaking ? 'var(--color-primary)' : 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: isSpeaking ? '#FFFFFF' : 'var(--color-text)'
            }}
          >
            {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button
            onClick={handleCopy}
            title="Copy Markdown"
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)'
            }}
          >
            {copied ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
          </button>

          <button
            onClick={handleDownload}
            title="Download Notes"
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)'
            }}
          >
            <Download size={15} />
          </button>

          <button
            onClick={() => onSaveToNotes(response)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isSavedInNotes ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-primary)',
              color: isSavedInNotes ? '#059669' : '#FFFFFF',
              border: isSavedInNotes ? '1.5px solid #10B981' : 'none',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: isSavedInNotes ? 'none' : 'var(--shadow-sm)'
            }}
          >
            <StickyNote size={14} />
            {isSavedInNotes ? 'Saved in Notes' : 'Save to Notes'}
          </button>
        </div>
      </div>

      <div style={{ padding: '28px 24px' }}>
        {viewMode === 'component' ? (
          renderComponentView()
        ) : (
          <pre
            style={{
              backgroundColor: 'var(--color-bg-alt)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              fontFamily: 'var(--font-code)',
              fontSize: '13px',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              color: 'var(--color-text)',
              maxHeight: '520px',
              overflowY: 'auto'
            }}
          >
            {response.rawMarkdown}
          </pre>
        )}
      </div>
    </section>
  );
};
