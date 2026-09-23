import React, { useState } from 'react';
import { Sigma, Copy, Check, Calculator } from 'lucide-react';
import { FormulaItem } from '../../types/study.js';

interface FormulaCardProps {
  formulas: FormulaItem[];
  title: string;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({ formulas, title }) => {
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const handleCopy = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '18px'
        }}
      >
        <Sigma size={22} color="var(--color-primary)" />
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
          {title || 'Formulation & Mathematical Derivations'}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {formulas.map((item, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              padding: '22px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}
            >
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-accent)', margin: 0 }}>
                {item.name}
              </h4>

              <button
                onClick={() => handleCopy(item.formula)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 225, 226, 0.5)',
                  border: '1px solid var(--color-border)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-text)'
                }}
              >
                {copiedFormula === item.formula ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                {copiedFormula === item.formula ? 'Copied' : 'Copy Formula'}
              </button>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-bg-alt)',
                border: '1.5px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--color-text)',
                fontFamily: 'var(--font-code)',
                letterSpacing: '0.04em',
                marginBottom: '16px'
              }}
            >
              {item.formula}
            </div>

            {item.variables && item.variables.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h5
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginBottom: '8px'
                  }}
                >
                  Variable Definitions
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {item.variables.map((v, vIdx) => (
                    <div
                      key={vIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(255, 225, 226, 0.3)',
                        fontSize: '12px'
                      }}
                    >
                      <strong style={{ fontFamily: 'var(--font-code)', color: 'var(--color-primary)' }}>
                        {v.symbol}:
                      </strong>
                      <span style={{ color: 'var(--color-text)' }}>{v.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {item.example && (
              <div
                style={{
                  borderTop: '1px dashed var(--color-border-subtle)',
                  paddingTop: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Calculator size={15} color="var(--color-primary)" />
                  <strong style={{ fontSize: '13px', color: 'var(--color-text)' }}>
                    Sample Solved Derivation
                  </strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 6px 0' }}>
                  {item.example}
                </p>
                {item.calculationStep && (
                  <pre
                    style={{
                      backgroundColor: 'rgba(81, 0, 0, 0.04)',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-code)',
                      color: 'var(--color-accent)',
                      whiteSpace: 'pre-wrap',
                      margin: 0
                    }}
                  >
                    {item.calculationStep}
                  </pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
