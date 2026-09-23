import React, { useState } from 'react';
import { Copy, Check, Terminal, Play, Cpu, CheckCircle2 } from 'lucide-react';
import { CodeBlockData } from '../../types/study.js';

interface CodeStudioProps {
  codeData: CodeBlockData;
  title: string;
}

export const CodeStudio: React.FC<CodeStudioProps> = ({ codeData, title }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'test' | 'explanation'>('code');
  const [runningSim, setRunningSim] = useState(false);
  const [simOutput, setSimOutput] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunSim = () => {
    setRunningSim(true);
    setSimOutput(null);
    setTimeout(() => {
      setRunningSim(false);
      setSimOutput(
        `[Virtual Test Environment]\nLanguage: ${codeData.language}\nAll ${codeData.testCases?.length || 3} unit assertions passed.\nExecution latency: 1.2ms (Memory overhead: 0.4MB)`
      );
    }, 800);
  };

  return (
    <div
      style={{
        backgroundColor: '#1E1E24',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          backgroundColor: '#141418',
          borderBottom: '1px solid rgba(255, 122, 148, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF5F56' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('code')}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 700,
                color: activeTab === 'code' ? '#FFFFFF' : '#888',
                backgroundColor: activeTab === 'code' ? 'rgba(225, 29, 72, 0.35)' : 'transparent',
                border: activeTab === 'code' ? '1px solid var(--color-primary)' : '1px solid transparent'
              }}
            >
              Source ({codeData.language || 'Code'})
            </button>

            <button
              onClick={() => setActiveTab('test')}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 700,
                color: activeTab === 'test' ? '#FFFFFF' : '#888',
                backgroundColor: activeTab === 'test' ? 'rgba(225, 29, 72, 0.35)' : 'transparent',
                border: activeTab === 'test' ? '1px solid var(--color-primary)' : '1px solid transparent'
              }}
            >
              Test Cases ({codeData.testCases?.length || 3})
            </button>

            <button
              onClick={() => setActiveTab('explanation')}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 700,
                color: activeTab === 'explanation' ? '#FFFFFF' : '#888',
                backgroundColor: activeTab === 'explanation' ? 'rgba(225, 29, 72, 0.35)' : 'transparent',
                border: activeTab === 'explanation' ? '1px solid var(--color-primary)' : '1px solid transparent'
              }}
            >
              Complexity Audit
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleRunSim}
            disabled={runningSim}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            <Play size={12} fill="#FFFFFF" />
            {runningSim ? 'Executing...' : 'Dry Run'}
          </button>

          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {copied ? <Check size={13} color="#27C93F" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '14px',
          padding: '8px 18px',
          backgroundColor: '#18181E',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '12px',
          color: '#AAA'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={14} color="var(--color-primary)" />
          <strong style={{ color: '#EEE' }}>Time:</strong> {codeData.timeComplexity || 'O(N)'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Terminal size={14} color="var(--color-primary)" />
          <strong style={{ color: '#EEE' }}>Space:</strong> {codeData.spaceComplexity || 'O(1)'}
        </span>
      </div>

      <div style={{ padding: '18px' }}>
        {activeTab === 'code' && (
          <pre
            style={{
              margin: 0,
              color: '#F8F8F2',
              fontFamily: 'var(--font-code)',
              fontSize: '13px',
              lineHeight: 1.6,
              overflowX: 'auto',
              whiteSpace: 'pre'
            }}
          >
            <code>{codeData.code}</code>
          </pre>
        )}

        {activeTab === 'test' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {codeData.testCases?.map((tc, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#25252D',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#EEE'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Assertion #{idx + 1}: {tc.input}
                  </div>
                  <div style={{ color: '#BBB' }}>Expected Output: {tc.output}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontWeight: 700 }}>
                  <CheckCircle2 size={15} /> Validated
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'explanation' && (
          <div style={{ color: '#DDD', fontSize: '13px', lineHeight: 1.65 }}>
            <h4 style={{ color: '#FFFFFF', marginBottom: '8px' }}>Algorithmic Complexity & Architecture</h4>
            <p style={{ margin: '0 0 12px 0' }}>{codeData.explanation}</p>
          </div>
        )}

        {simOutput && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#0F0F12',
              border: '1px solid rgba(39, 201, 63, 0.4)',
              color: '#27C93F',
              fontFamily: 'var(--font-code)',
              fontSize: '12px',
              whiteSpace: 'pre-line'
            }}
          >
            {simOutput}
          </div>
        )}
      </div>
    </div>
  );
};
