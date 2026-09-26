import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Download,
  Table as TableIcon,
  CheckCircle2,
  Compass,
  GraduationCap,
  Brain,
  Lightbulb,
  FileCode,
  Laptop,
  Maximize2,
  X,
  Layers
} from 'lucide-react';

interface GeneratedWebPageProps {
  content: string;
  topic?: string;
  isStreaming?: boolean;
  className?: string;
}

export const GeneratedWebPage: React.FC<GeneratedWebPageProps> = ({
  content,
  topic,
  isStreaming = false,
  className = ''
}) => {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  // Extract clean title from topic or first heading or content
  const pageTitle = React.useMemo(() => {
    if (topic && topic.trim()) return topic;
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1].trim();
    const h2Match = content.match(/^##\s+(.+)$/m);
    if (h2Match) return h2Match[1].trim();
    const firstLine = content.split('\n').find(l => l.trim().length > 0) || '';
    if (firstLine.includes('Striver') && firstLine.includes('Kunal')) {
      return 'DSA Learning Roadmap: Striver vs Kunal Kushwaha';
    }
    if (firstLine.length < 60) {
      return firstLine.replace(/^[#*•\s]+/, '').trim() || 'Blast AI Generated Study Guide';
    }
    return 'Blast AI Interactive Study Document';
  }, [content, topic]);

  // Generates standalone, self-contained HTML page
  const generateStandaloneHtml = React.useCallback(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(pageTitle)} - Blast AI</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0b0914;
      color: #f1edf7;
      line-height: 1.7;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }
    .page-container {
      width: 100%;
      max-width: 900px;
      background: linear-gradient(180deg, #16112a 0%, #0d0b18 100%);
      border: 1.5px solid rgba(168, 85, 247, 0.35);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 24px 60px rgba(0,0,0,0.8), 0 0 40px rgba(147, 51, 234, 0.2);
    }
    .page-header {
      padding: 24px 30px;
      background: rgba(17, 13, 32, 0.95);
      border-bottom: 1.5px solid rgba(168, 85, 247, 0.25);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 5px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #c084fc;
      background: rgba(147, 51, 234, 0.16);
      border: 1px solid rgba(168, 85, 247, 0.35);
    }
    .page-title {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin: 20px 30px 10px;
      letter-spacing: -0.02em;
    }
    .content-body {
      padding: 20px 30px 40px;
    }
    .matrix-card {
      margin: 24px 0;
      border-radius: 18px;
      overflow: hidden;
      background: rgba(18, 14, 34, 0.9);
      border: 1.5px solid rgba(168, 85, 247, 0.3);
    }
    .matrix-title {
      padding: 13px 20px;
      background: linear-gradient(90deg, rgba(88, 28, 135, 0.5) 0%, rgba(30, 27, 75, 0.5) 100%);
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #e9d5ff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      padding: 14px 18px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #d8b4fe;
      background: rgba(30, 24, 52, 0.95);
      border-bottom: 1.5px solid rgba(168, 85, 247, 0.28);
    }
    td {
      padding: 14px 18px;
      font-size: 14px;
      color: #e2e0ea;
      border-bottom: 1px solid rgba(168, 85, 247, 0.12);
      vertical-align: middle;
    }
    tr:hover { background: rgba(168, 85, 247, 0.08); }
    .badge-pick {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12.5px;
      font-weight: 750;
    }
    .striver { background: rgba(147, 51, 234, 0.25); border: 1px solid rgba(168, 85, 247, 0.5); color: #f3e8ff; }
    .kunal { background: rgba(16, 185, 129, 0.22); border: 1px solid rgba(52, 211, 153, 0.5); color: #a7f3d0; }
    .verdict-card {
      margin: 24px 0;
      background: linear-gradient(135deg, rgba(88, 28, 135, 0.26) 0%, rgba(20, 16, 38, 0.85) 100%);
      border: 1.5px solid rgba(168, 85, 247, 0.42);
      border-left: 5px solid #a855f7;
      border-radius: 18px;
      padding: 22px 24px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #7e7594;
      border-top: 1px solid rgba(168, 85, 247, 0.15);
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="page-header">
      <div class="badge">⚡ Blast AI • Generated Study Document</div>
      <div style="font-size: 12px; color: #a19ab4;">Interactive Web Page</div>
    </div>
    <h1 class="page-title">${escapeHtml(pageTitle)}</h1>
    <div class="content-body">
      ${markdownToHtml(content)}
    </div>
    <div class="footer">Generated automatically by Blast AI Engine • Nemotron Multi-modal</div>
  </div>
</body>
</html>`;
  }, [content, pageTitle]);

  const copyFullHtml = () => {
    const fullHtml = generateStandaloneHtml();
    navigator.clipboard.writeText(fullHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const downloadHtmlFile = () => {
    const fullHtml = generateStandaloneHtml();
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-study-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 1800);
  };

  // Parse sections
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inCode = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let blockKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Code blocks
    if (line.trim().startsWith('```')) {
      if (inCode) {
        const codeText = codeBuffer.join('\n');
        const currKey = blockKey++;
        renderedElements.push(
          <div key={`code-${currKey}`} className="blast-code-window">
            <div className="blast-code-topbar">
              <div className="blast-code-dots">
                <span className="blast-code-dot bg-red-500/80" />
                <span className="blast-code-dot bg-amber-500/80" />
                <span className="blast-code-dot bg-emerald-500/80" />
                <span className="blast-code-lang ml-2">{codeLang || 'CODE'}</span>
              </div>
              <button
                type="button"
                onClick={() => copyCode(codeText, currKey)}
                className="blast-action-btn"
                style={{ padding: '3px 9px', fontSize: '11px' }}
              >
                {copiedCodeIdx === currKey ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre style={{ padding: '16px', overflowX: 'auto', fontSize: '13px', lineHeight: 1.6, color: '#f3f4f6', fontFamily: 'monospace' }}>
              <code>{codeText}</code>
            </pre>
          </div>
        );
        inCode = false;
        codeBuffer = [];
        codeLang = '';
      } else {
        inCode = true;
        codeLang = line.trim().replace(/^```/, '').trim();
        codeBuffer = [];
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    // 2. Empty line
    if (!line.trim()) {
      renderedElements.push(<div key={`sp-${i}`} style={{ height: '8px' }} />);
      continue;
    }

    // 3. Markdown Table detection
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(lines[i + 1])) {
      const headerLine = line;
      const delimiterLine = lines[i + 1];
      const tableDataLines: string[] = [];

      let j = i + 2;
      while (j < lines.length && lines[j].includes('|') && lines[j].trim().length > 0) {
        tableDataLines.push(lines[j]);
        j++;
      }

      const headers = headerLine
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(h => h.trim());

      const rows = tableDataLines.map(rowLine => {
        return rowLine
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map(c => c.trim());
      });

      const tableKey = blockKey++;
      renderedElements.push(
        <div key={`matrix-${tableKey}`} className="blast-matrix-card">
          <div className="blast-matrix-topbar">
            <span className="blast-matrix-badge">
              <TableIcon size={14} className="text-purple-400" />
              Summary Comparison Matrix
            </span>
            <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 600, letterSpacing: '0.04em' }}>
              INTERACTIVE GRID
            </span>
          </div>
          <div className="blast-matrix-scroll-wrapper">
            <table className="blast-matrix-table">
              <thead>
                <tr>
                  {headers.map((h, hi) => {
                    const isPickCol = h.toLowerCase().includes('pick') || h.toLowerCase().includes('recommend');
                    const isGoalCol = h.toLowerCase().includes('goal') || h.toLowerCase().includes('criteria');
                    return (
                      <th
                        key={hi}
                        style={{
                          width: isGoalCol ? '38%' : isPickCol ? '24%' : '38%',
                          textAlign: isPickCol ? 'left' : 'left'
                        }}
                      >
                        {formatInline(h)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => {
                      const isPickCol = headers[ci] && (headers[ci].toLowerCase().includes('pick') || headers[ci].toLowerCase().includes('recommend'));
                      return (
                        <td key={ci} style={{ textAlign: isPickCol ? 'left' : 'left' }}>
                          {isPickCol ? renderPickBadge(cell) : formatInline(cell)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      i = j - 1;
      continue;
    }

    // 4. Section headers with emoji (e.g. 🧭 Striver..., 🎓 Kunal..., 🧠 Verdict)
    const emojiSecMatch = line.match(/^\s*(?:###?\s*)?([🧭🎓🧠💡📌🚀⭐🎯🔥🏆📚])\s+(.+)$/);
    if (emojiSecMatch) {
      const emoji = emojiSecMatch[1];
      const titleText = emojiSecMatch[2];
      const isVerdict = emoji === '🧠' || titleText.toLowerCase().includes('verdict');

      if (isVerdict) {
        // Collect following lines until empty or next section for the verdict body
        const verdictLines: string[] = [];
        let k = i + 1;
        while (k < lines.length && !lines[k].match(/^\s*(?:###?\s*)?[🧭🎓🧠💡📌🚀⭐🎯🔥🏆📚]\s+/) && !lines[k].startsWith('```') && !lines[k].includes('|')) {
          if (lines[k].trim()) {
            verdictLines.push(lines[k]);
          }
          k++;
        }

        renderedElements.push(
          <div key={`verdict-${i}`} className="blast-verdict-card">
            <div className="blast-verdict-header">
              <span className="blast-entity-icon" style={{ width: '32px', height: '32px', fontSize: '16px' }}>
                🧠
              </span>
              <h3 className="blast-verdict-title">{formatInline(titleText)}</h3>
            </div>
            <div className="blast-verdict-body">
              {verdictLines.length > 0 ? (
                verdictLines.map((vl, vli) => (
                  <p key={vli} style={{ margin: '6px 0' }}>
                    {formatInline(vl)}
                  </p>
                ))
              ) : (
                <p>{formatInline(titleText)}</p>
              )}
            </div>
          </div>
        );

        if (verdictLines.length > 0) {
          i = k - 1;
        }
        continue;
      }

      // Other emoji headers (like 🧭 Striver, 🎓 Kunal)
      renderedElements.push(
        <div key={`sec-head-${i}`} className="blast-entity-header" style={{ marginTop: '22px' }}>
          <span className="blast-entity-icon">{emoji}</span>
          <h3 className="blast-entity-title">{formatInline(titleText)}</h3>
        </div>
      );
      continue;
    }

    // 5. Key-Value Badges (e.g. Format: ..., Strengths: ..., Best for: ...)
    const kvMatch = line.match(/^\s*(Format|Strengths|Best for|Verdict|Ideal combo|Prerequisites|Target language):\s*(.*)$/i);
    if (kvMatch) {
      const label = kvMatch[1];
      const val = kvMatch[2];
      const isBestFor = label.toLowerCase() === 'best for';

      if (isBestFor) {
        renderedElements.push(
          <div key={`bestfor-${i}`} className="blast-bestfor-banner">
            <strong style={{ color: '#d8b4fe', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em', marginRight: '8px' }}>
              🎯 BEST FOR:
            </strong>
            <span>{formatInline(val)}</span>
          </div>
        );
      } else {
        renderedElements.push(
          <div key={`kv-${i}`} className="blast-kv-row">
            <span className="blast-kv-label">{label}</span>
            <div className="blast-kv-val">{formatInline(val)}</div>
          </div>
        );
      }
      continue;
    }

    // 6. Checkmark list item (✅ ...)
    const checkMatch = line.match(/^\s*✅\s*(.*)$/);
    if (checkMatch) {
      renderedElements.push(
        <div key={`chk-${i}`} className="blast-check-card">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div style={{ flex: 1, color: '#f1f5f9', fontWeight: 500 }}>
            {formatInline(checkMatch[1])}
          </div>
        </div>
      );
      continue;
    }

    // 7. Regular Headings
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${i}`} style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7' }} />
          {formatInline(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2 key={`h2-${i}`} style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: '24px 0 12px', borderBottom: '1px solid rgba(168,85,247,0.2)', paddingBottom: '6px' }}>
          {formatInline(line.replace('## ', ''))}
        </h2>
      );
      continue;
    }

    // 8. Bullet & Numbered list items
    if (/^\s*([•*-]|\d+\.)\s+/.test(line)) {
      const match = line.match(/^\s*([•*-]|\d+\.)\s+(.*)$/);
      if (match) {
        const symbol = match[1];
        const text = match[2];
        const isNum = /^\d+\./.test(symbol);
        renderedElements.push(
          <div key={`li-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '6px 0 6px 4px', fontSize: '14.5px', lineHeight: 1.6 }}>
            {isNum ? (
              <span style={{ color: '#c084fc', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>{symbol}</span>
            ) : (
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#a855f7', flexShrink: 0, marginTop: '9px' }} />
            )}
            <div style={{ flex: 1, color: '#ded9ed' }}>{formatInline(text)}</div>
          </div>
        );
        continue;
      }
    }

    // 9. Standard paragraphs
    renderedElements.push(
      <p key={`p-${i}`} className="blast-hero-intro" style={{ margin: '8px 0' }}>
        {formatInline(line)}
      </p>
    );
  }

  // Blinking cursor if streaming
  if (isStreaming) {
    renderedElements.push(
      <span
        key="streaming-cursor"
        style={{
          display: 'inline-block',
          width: '8px',
          height: '18px',
          marginLeft: '4px',
          background: '#a855f7',
          borderRadius: '2px',
          verticalAlign: 'middle',
          animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      />
    );
  }

  return (
    <>
      <div className={`blast-webpage-canvas ${className}`}>
        {/* Top Header Bar */}
        <div className="blast-webpage-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="blast-webpage-badge">
              <Sparkles size={12} className="text-purple-400" />
              Blast AI • Generated Web Page
            </span>
            <span className="blast-webpage-meta">
              <Laptop size={13} />
              Interactive Component
            </span>
          </div>
          <div className="blast-webpage-actions">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="blast-action-btn"
              title="View full standalone interactive web page"
            >
              <Maximize2 size={13} />
              <span>Open Web Page</span>
            </button>
            <button
              type="button"
              onClick={copyFullHtml}
              className={`blast-action-btn ${copiedHtml ? 'active' : ''}`}
              title="Copy complete standalone HTML with CSS"
            >
              {copiedHtml ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedHtml ? 'Copied HTML' : 'Copy HTML'}</span>
            </button>
            <button
              type="button"
              onClick={downloadHtmlFile}
              className="blast-action-btn"
              title="Download as HTML file"
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="blast-webpage-body">
          {renderedElements}
        </div>
      </div>

      {/* Fullscreen Standalone Web Page Modal */}
      {isModalOpen && (
        <div className="blast-fullscreen-modal" onClick={() => setIsModalOpen(false)}>
          <div className="blast-modal-container" onClick={e => e.stopPropagation()}>
            <div className="blast-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="blast-webpage-badge">
                  <Sparkles size={12} />
                  Standalone Web Page View
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                  {pageTitle}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={downloadHtmlFile}
                  className="blast-action-btn"
                >
                  <Download size={13} />
                  <span>Download HTML</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="blast-modal-content">
              <div style={{ maxWidth: '820px', margin: '0 auto' }}>
                {renderedElements}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Formats pick column cell with glowing badges
function renderPickBadge(text: string): React.ReactNode {
  const clean = text.replace(/^[✅\s]+/, '').trim();
  const lower = clean.toLowerCase();

  if (lower.includes('striver')) {
    return (
      <span className="blast-pick-badge blast-pick-striver">
        <CheckCircle2 size={13} className="text-purple-300" />
        <span>Striver</span>
      </span>
    );
  }
  if (lower.includes('kunal')) {
    return (
      <span className="blast-pick-badge blast-pick-kunal">
        <CheckCircle2 size={13} className="text-emerald-300" />
        <span>Kunal</span>
      </span>
    );
  }
  return (
    <span className="blast-pick-badge blast-pick-generic">
      <CheckCircle2 size={13} className="text-cyan-300" />
      <span>{clean}</span>
    </span>
  );
}

// Inline formatting (bold, italic, code, links)
function formatInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[([^\]]+)\]\(([^)]+)\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`c-${match.index}`}
          style={{
            padding: '2px 6px',
            margin: '0 2px',
            borderRadius: '5px',
            background: 'rgba(147, 51, 234, 0.18)',
            color: '#d8b4fe',
            fontFamily: 'monospace',
            fontSize: '12.5px',
            border: '1px solid rgba(168, 85, 247, 0.3)'
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${match.index}`} style={{ fontWeight: 700, color: '#ffffff' }}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`i-${match.index}`} style={{ fontStyle: 'italic', color: '#e9d5ff' }}>
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('[') && match[2] && match[3]) {
      parts.push(
        <a
          key={`a-${match.index}`}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#c084fc',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            fontWeight: 600
          }}
        >
          {match[2]}
        </a>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// Markdown to standalone HTML converter for export
function markdownToHtml(md: string): string {
  let html = md;
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre style="background:#09090b;padding:16px;border-radius:12px;border:1px solid rgba(168,85,247,0.3);overflow-x:auto;color:#f3f4f6;margin:16px 0;"><code>${escapeHtml(code.trim())}</code></pre>`;
  });
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size:18px;font-weight:700;color:#fff;margin:18px 0 8px;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size:20px;font-weight:800;color:#fff;margin:22px 0 10px;border-bottom:1px solid rgba(168,85,247,0.2);padding-bottom:6px;">$1</h2>');
  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff;">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em style="color:#e9d5ff;">$1</em>');
  // Tables
  const lines = html.split('\n');
  const outLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(lines[i + 1])) {
      const headers = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(h => h.trim());
      const dataLines: string[] = [];
      let j = i + 2;
      while (j < lines.length && lines[j].includes('|') && lines[j].trim().length > 0) {
        dataLines.push(lines[j]);
        j++;
      }
      let tableHtml = '<div class="matrix-card"><div class="matrix-title">📊 SUMMARY COMPARISON MATRIX</div><table><thead><tr>';
      headers.forEach(h => { tableHtml += `<th>${h}</th>`; });
      tableHtml += '</tr></thead><tbody>';
      dataLines.forEach(dl => {
        const cells = dl.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
        tableHtml += '<tr>';
        cells.forEach(c => {
          let cellHtml = c;
          if (c.includes('Striver')) {
            cellHtml = `<span class="badge-pick striver">✅ Striver</span>`;
          } else if (c.includes('Kunal')) {
            cellHtml = `<span class="badge-pick kunal">✅ Kunal</span>`;
          }
          tableHtml += `<td>${cellHtml}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table></div>';
      outLines.push(tableHtml);
      i = j - 1;
      continue;
    }
    // Checkmarks
    if (line.match(/^\s*✅\s*(.*)$/)) {
      outLines.push(`<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);border-radius:10px;margin:6px 0;color:#a7f3d0;">✅ ${line.replace(/^\s*✅\s*/, '')}</div>`);
      continue;
    }
    outLines.push(line ? `<p style="margin:8px 0;color:#ded8ec;">${line}</p>` : '');
  }
  return outLines.join('\n');
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, m => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

export default GeneratedWebPage;
