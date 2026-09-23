import React, { useState } from 'react';
import { Palette, ChevronDown, ChevronUp } from 'lucide-react';

export const DesignTokensBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const colors = [
    { label: 'Background', hex: '#FFE1E2', rgb: '255.225.226', cmyk: '0.12.11.0', bg: '#FFE1E2', fg: '#510000' },
    { label: 'Text', hex: '#510000', rgb: '81.0.0', cmyk: '0.100.100.68', bg: '#510000', fg: '#FFFFFF' },
    { label: 'Primary', hex: '#E11D48', rgb: '225.29.72', cmyk: '0.87.68.12', bg: '#E11D48', fg: '#FFFFFF' },
    { label: 'Accent', hex: '#9C0000', rgb: '156.0.0', cmyk: '0.100.100.39', bg: '#9C0000', fg: '#FFFFFF' },
    { label: 'Surface', hex: '#FFFFFF', rgb: '255.255.255', cmyk: '0.0.0.0', bg: '#FFFFFF', fg: '#510000' },
    { label: 'Border', hex: '#FF7A94', rgb: '255.122.148', cmyk: '0.52.42.0', bg: '#FF7A94', fg: '#510000' }
  ];

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
        borderBottom: '1px solid var(--color-border-subtle)',
        padding: '6px 20px',
        fontSize: '11px',
        transition: 'all var(--transition-normal)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={13} color="var(--color-primary)" />
          <span style={{ fontWeight: 800, color: 'var(--color-text)' }}>
            Font Combo:
          </span>
          <span
            style={{
              padding: '2px 10px',
              borderRadius: '999px',
              backgroundColor: 'rgba(81, 0, 0, 0.08)',
              color: 'var(--color-accent)',
              fontWeight: 700,
              fontFamily: 'var(--font-headline)'
            }}
          >
            Space Grotesk
          </span>
          <span style={{ color: 'var(--color-text-faint)', fontWeight: 700 }}>+</span>
          <span
            style={{
              padding: '2px 10px',
              borderRadius: '999px',
              backgroundColor: 'rgba(81, 0, 0, 0.08)',
              color: 'var(--color-text)',
              fontWeight: 600,
              fontFamily: 'var(--font-body)'
            }}
          >
            DM Sans
          </span>
          <span className="font-editorial-italic" style={{ color: 'var(--color-primary)' }}>
            (Clean Minimalist Studio)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {colors.map((c) => (
              <span
                key={c.label}
                title={`${c.label}: ${c.hex}`}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: c.bg,
                  border: '1px solid rgba(81,0,0,0.15)',
                  display: 'inline-block'
                }}
              />
            ))}
          </div>
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </div>

      {isExpanded && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '8px',
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px dashed var(--color-border-subtle)'
          }}
        >
          {colors.map((c) => (
            <div
              key={c.label}
              style={{
                backgroundColor: c.bg,
                color: c.fg,
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(81,0,0,0.15)'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '11px' }}>{c.label}</div>
              <div className="font-technical-spec" style={{ fontSize: '9px', opacity: 0.85 }}>
                {c.hex} • {c.rgb}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
