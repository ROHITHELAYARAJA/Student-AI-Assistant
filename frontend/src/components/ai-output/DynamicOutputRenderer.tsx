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
  Clock
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
        marginTop: '8px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1.5px solid var(--color-border)',
        boxShadow: '0 2px 8px rgba(81, 0, 0, 0.05)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'rgba(255, 225, 226, 0.5)',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF'
            }}
          >
            {response.componentType}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            <Clock size={11} />
            <span>
              {(response.metadata.processingTimeMs / 1000).toFixed(1)}s •{' '}
              {response.metadata.model.includes('Bedrock') || response.metadata.model.includes('Claude')
                ? 'Claude 3.5'
                : 'Emma Core'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              padding: '1px'
            }}
          >
            <button
              onClick={() => setViewMode('component')}
              title="Interactive Visual Component"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: viewMode === 'component' ? 'var(--color-primary)' : 'transparent',
                color: viewMode === 'component' ? '#FFFFFF' : 'var(--color-text)',
                cursor: 'pointer'
              }}
            >
              <Eye size={11} /> Visual
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              title="Raw Markdown"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: viewMode === 'markdown' ? 'var(--color-primary)' : 'transparent',
                color: viewMode === 'markdown' ? '#FFFFFF' : 'var(--color-text)',
                cursor: 'pointer'
              }}
            >
              <Code2 size={11} /> Raw
            </button>
          </div>

          <button
            onClick={handleToggleSpeech}
            title={isSpeaking ? 'Stop Reading' : 'Read Aloud'}
            style={{
              padding: '5px',
              borderRadius: '50%',
              backgroundColor: isSpeaking ? 'var(--color-primary)' : 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: isSpeaking ? '#FFFFFF' : 'var(--color-text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>

          <button
            onClick={handleCopy}
            title="Copy Markdown"
            style={{
              padding: '5px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
          </button>

          <button
            onClick={handleDownload}
            title="Download Notes"
            style={{
              padding: '5px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Download size={12} />
          </button>

          <button
            onClick={() => onSaveToNotes(response)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isSavedInNotes ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-primary)',
              color: isSavedInNotes ? '#059669' : '#FFFFFF',
              border: isSavedInNotes ? '1.5px solid #10B981' : 'none',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <StickyNote size={11} />
            {isSavedInNotes ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 10px' }}>
        {viewMode === 'component' ? (
          renderComponentView()
        ) : (
          <pre
            style={{
              backgroundColor: 'var(--color-bg-alt)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              fontFamily: 'var(--font-code)',
              fontSize: '12px',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              color: 'var(--color-text)',
              maxHeight: '360px',
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
