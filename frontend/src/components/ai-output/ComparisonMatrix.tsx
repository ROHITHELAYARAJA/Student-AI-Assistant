import React from 'react';
import { Columns, Award, Check } from 'lucide-react';
import { ComparisonRow } from '../../types/study.js';

interface ComparisonMatrixProps {
  comparison: {
    entityA: string;
    entityB: string;
    rows: ComparisonRow[];
    verdict: string;
  };
  title: string;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ comparison, title }) => {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}
      >
        <Columns size={20} color="var(--color-primary)" />
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
          {title || `${comparison.entityA} vs ${comparison.entityB}`}
        </h3>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--color-border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255, 225, 226, 0.65)' }}>
              <th
                style={{
                  padding: '12px 16px',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: 'var(--color-accent)',
                  textTransform: 'uppercase',
                  borderBottom: '1.5px solid var(--color-border)'
                }}
              >
                Evaluation Dimension
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: 'var(--color-text)',
                  borderBottom: '1.5px solid var(--color-border)',
                  borderLeft: '1px solid var(--color-border-subtle)'
                }}
              >
                {comparison.entityA}
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: 'var(--color-text)',
                  borderBottom: '1.5px solid var(--color-border)',
                  borderLeft: '1px solid var(--color-border-subtle)'
                }}
              >
                {comparison.entityB}
              </th>
              <th
                style={{
                  padding: '12px 16px',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: 'var(--color-primary)',
                  textTransform: 'uppercase',
                  borderBottom: '1.5px solid var(--color-border)',
                  borderLeft: '1px solid var(--color-border-subtle)'
                }}
              >
                Analysis Verdict
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor: idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg-alt)',
                  borderBottom: '1px solid var(--color-border-subtle)'
                }}
              >
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--color-accent)'
                  }}
                >
                  {row.aspect}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: 'var(--color-text)',
                    borderLeft: '1px solid var(--color-border-subtle)'
                  }}
                >
                  {row.itemA}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: 'var(--color-text)',
                    borderLeft: '1px solid var(--color-border-subtle)'
                  }}
                >
                  {row.itemB}
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-primary)',
                    borderLeft: '1px solid var(--color-border-subtle)'
                  }}
                >
                  {row.verdict}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {comparison.verdict && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface)',
            border: '2px solid var(--color-primary)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <Award size={22} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: 'var(--color-text)',
                margin: '0 0 4px 0'
              }}
            >
              Architectural Conclusion
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--color-text)', margin: 0, lineHeight: 1.55 }}>
              {comparison.verdict}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
