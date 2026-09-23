import React from 'react';
import { Target, Code, GraduationCap } from 'lucide-react';

interface ContextSelectorsProps {
  subject: string;
  onSubjectChange: (val: string) => void;
  studyTopic: string;
  onStudyTopicChange: (val: string) => void;
  programmingLanguage: string;
  onProgrammingLanguageChange: (val: string) => void;
  showLanguageSelector: boolean;
}

const PROGRAMMING_LANGUAGES = [
  'TypeScript',
  'JavaScript',
  'Python',
  'Java',
  'C++',
  'Go',
  'Rust',
  'SQL',
  'Kotlin',
  'Swift'
];

export const ContextSelectors: React.FC<ContextSelectorsProps> = ({
  subject,
  onSubjectChange,
  studyTopic,
  onStudyTopicChange,
  programmingLanguage,
  onProgrammingLanguageChange,
  showLanguageSelector
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: showLanguageSelector
          ? 'repeat(auto-fit, minmax(220px, 1fr))'
          : 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '12px',
        margin: '16px 0'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 16px',
          backgroundColor: 'var(--color-surface)',
          border: '1.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <GraduationCap size={18} color="var(--color-primary)" />
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              letterSpacing: '0.04em'
            }}
          >
            Subject / Domain
          </label>
          <input
            type="text"
            placeholder="e.g. Computer Science, Organic Chemistry, Calculus"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginTop: '2px'
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 16px',
          backgroundColor: 'var(--color-surface)',
          border: '1.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <Target size={18} color="var(--color-primary)" />
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              letterSpacing: '0.04em'
            }}
          >
            Topic / Target Goal
          </label>
          <input
            type="text"
            placeholder="e.g. Binary Search Tree, Mitosis, Fourier Transform"
            value={studyTopic}
            onChange={(e) => onStudyTopicChange(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginTop: '2px'
            }}
          />
        </div>
      </div>

      {showLanguageSelector && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            backgroundColor: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Code size={18} color="var(--color-primary)" />
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                letterSpacing: '0.04em'
              }}
            >
              Target Language
            </label>
            <select
              value={programmingLanguage}
              onChange={(e) => onProgrammingLanguageChange(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text)',
                marginTop: '2px',
                cursor: 'pointer'
              }}
            >
              {PROGRAMMING_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
