import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface FormattedArticleProps {
  article: {
    sections: Array<{ heading: string; body: string; highlights?: string[] }>;
  };
  title: string;
}

export const FormattedArticle: React.FC<FormattedArticleProps> = ({ article, title }) => {
  return (
    <article style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '1.5px solid var(--color-border)'
        }}
      >
        <BookOpen size={22} color="var(--color-primary)" />
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)' }}>
          {title}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {article.sections.map((sec, idx) => (
          <section
            key={idx}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              padding: '22px 24px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h4
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--color-accent)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '16px',
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: '3px',
                  display: 'inline-block'
                }}
              />
              {sec.heading}
            </h4>

            <div
              style={{
                fontSize: '14px',
                lineHeight: 1.7,
                color: 'var(--color-text)',
                whiteSpace: 'pre-line'
              }}
            >
              {sec.body}
            </div>

            {sec.highlights && sec.highlights.length > 0 && (
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px dashed var(--color-border-subtle)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                {sec.highlights.map((h, hIdx) => (
                  <span
                    key={hIdx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: 'rgba(255, 225, 226, 0.65)',
                      color: 'var(--color-accent)',
                      border: '1px solid var(--color-border)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    <Sparkles size={11} color="var(--color-primary)" />
                    {h}
                  </span>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </article>
  );
};
