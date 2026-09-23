import React, { useState } from 'react';
import {
  Search,
  Loader2,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { OperationCategory, OperationMeta } from '../../types/study.js';

interface FeatureGridProps {
  operations: OperationMeta[];
  selectedCategory: OperationCategory;
  onExecuteOperation: (op: OperationMeta) => void;
  executingOpId: string | null;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
  operations,
  selectedCategory,
  onExecuteOperation,
  executingOpId
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = operations.filter((op) => {
    const matchesCat = op.category === selectedCategory;
    const matchesSearch =
      op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.id.toLowerCase().includes(searchQuery.toLowerCase());
    return searchQuery ? matchesSearch : matchesCat;
  });

  return (
    <div style={{ marginTop: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
            {searchQuery ? `Search Results (${filtered.length})` : `${selectedCategory} Operators`}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Click any operator to synthesize structured dynamic components
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            width: '280px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Search size={15} color="var(--color-accent)" />
          <input
            type="text"
            placeholder="Search across all 100 features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '13px',
              color: 'var(--color-text)',
              width: '100%'
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px'
        }}
      >
        {filtered.map((op) => {
          const isBusy = executingOpId === op.id;

          return (
            <div
              key={op.id}
              onClick={() => !executingOpId && onExecuteOperation(op)}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                padding: '16px',
                cursor: executingOpId ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-normal)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!executingOpId) {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(225, 29, 72, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!executingOpId) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(255, 225, 226, 0.65)',
                      color: 'var(--color-accent)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    {op.outputComponent}
                  </span>

                  {isBusy ? (
                    <Loader2 size={16} color="var(--color-primary)" className="animate-spin" />
                  ) : (
                    <Zap size={14} color="var(--color-primary)" />
                  )}
                </div>

                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    margin: '0 0 6px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {op.name}
                </h3>

                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.45,
                    margin: 0
                  }}
                >
                  {op.description}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  marginTop: '14px',
                  paddingTop: '8px',
                  borderTop: '1px dashed var(--color-border-subtle)'
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isBusy ? 'Synthesizing...' : 'Generate'}
                  {!isBusy && <ArrowRight size={13} />}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
