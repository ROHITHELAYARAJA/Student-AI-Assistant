import React, { useState } from 'react';
import {
  Copy,
  Check,
  Table as TableIcon,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Lightbulb,
  Target
} from 'lucide-react';

interface GeneratedWebPageProps {
  content: string;
  topic?: string;
  isStreaming?: boolean;
  className?: string;
}

export function cleanModelOutput(raw: string): string {
  if (!raw) return '';
  let text = raw.trim();

  // 1. Unwrap code-fenced JSON ```json { "reply": ... }
  if (text.startsWith('```json') && text.endsWith('```')) {
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  // 2. Unwrap raw JSON envelope {"reply": "..."}
  if (text.startsWith('{') && (text.includes('"reply"') || text.includes("'reply'"))) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && typeof parsed.reply === 'string') {
        text = parsed.reply;
      }
    } catch {
      // Resilient regex extraction for JSON with unescaped newlines or truncated syntax
      const match = text.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/)
        || text.match(/"reply"\s*:\s*"(.*?)(?:"\s*,\s*"(?:suggestedTopic|quickPrompts)"|"\s*\}\s*$)/s)
        || text.match(/"reply"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"[^"]+"\s*:|"\s*\}$)/)
        || text.match(/"reply"\s*:\s*"([\s\S]*)/);
      if (match && match[1]) {
        let extracted = match[1];
        extracted = extracted.replace(/"\s*\}\s*$/, '').replace(/"\s*,\s*$/, '');
        text = extracted;
      }
    }
  }

  // 3. Unescape escaped control characters (\n, \r, \t, \") if newlines are escaped
  if (text.includes('\\n')) {
    text = text
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"');
  }

  // 4. Strip any dangling {"reply": prefix or "} suffix
  text = text
    .replace(/^\s*\{\s*"reply"\s*:\s*"/, '')
    .replace(/"\s*\}\s*$/, '')
    .trim();

  return text;
}

export const GeneratedWebPage: React.FC<GeneratedWebPageProps> = ({
  content,
  isStreaming = false,
  className = ''
}) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const copyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 1800);
  };

  // Clean raw model output (defensively unpacks any JSON string)
  const cleanContent = cleanModelOutput(content);
  const lines = cleanContent.split('\n');
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

    // 3. Horizontal Divider (--- or ***)
    if (/^\s*[-*_]{3,}\s*$/.test(line)) {
      renderedElements.push(<div key={`div-${i}`} className="blast-divider" />);
      continue;
    }

    // 4. Roadmap Hero Banner Detection (e.g. 🗓️ 2-Month DSA Roadmap (Interview-Ready))
    const roadmapHeroMatch = line.match(/^\s*(?:###?\s*)?🗓️\s*([0-9]+-(?:Month|Week|Day)\s+.*Roadmap.*)$/i)
      || line.match(/^\s*(?:###?\s*)?([0-9]+-(?:Month|Week|Day)\s+.*Roadmap.*\(Interview-Ready\).*)$/i);
    if (roadmapHeroMatch) {
      renderedElements.push(
        <div key={`roadmap-hero-${i}`} className="blast-roadmap-hero">
          <div className="blast-roadmap-hero-top">
            <span className="blast-roadmap-hero-badge">
              <Calendar size={13} className="text-purple-300" />
              <span>AI Study Curriculum</span>
            </span>
            <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 700, letterSpacing: '0.05em' }}>
              INTERVIEW PREP
            </span>
          </div>
          <h2 className="blast-roadmap-hero-title">
            {formatInline(roadmapHeroMatch[1].replace(/^[🗓️\s]+/, ''))}
          </h2>
          <p className="blast-roadmap-hero-sub">
            Structured week-by-week pattern progression, practice problem targets, and revision checkpoints.
          </p>
        </div>
      );
      continue;
    }

    // 5. Callouts (Pro tip:, Must-do:, Tip:, Note:)
    const calloutMatch = line.match(/^\s*(?:[•\-*]\s*)?(Pro tip|Must-do|Tip|Note|Important|Recommendation):\s*(.*)$/i);
    if (calloutMatch) {
      const type = calloutMatch[1].toLowerCase();
      const isMustDo = type === 'must-do';
      const isProTip = type === 'pro tip' || type === 'tip';
      const cardClass = isMustDo ? 'blast-callout-must' : 'blast-callout-pro';

      renderedElements.push(
        <div key={`callout-${i}`} className={`blast-callout-card ${cardClass}`}>
          <div className="blast-callout-icon">
            {isMustDo ? <CheckCircle2 size={18} /> : <Lightbulb size={18} />}
          </div>
          <div style={{ flex: 1 }}>
            <span className="blast-callout-tag">
              {calloutMatch[1].toUpperCase()}:
            </span>
            <span>{formatInline(calloutMatch[2])}</span>
          </div>
        </div>
      );
      continue;
    }

    // 6. Markdown Table detection
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

      const isRoadmapTable = headers.some(h => /week|month|phase/i.test(h));
      const isRoutineTable = headers.some(h => /time|hour|schedule|activity/i.test(h));
      const tableTitle = isRoadmapTable ? 'Weekly Milestones & Practice Targets'
        : isRoutineTable ? 'Daily Study Routine & Allocation'
        : 'Summary Comparison Matrix';
      const badgeText = isRoadmapTable ? 'ROADMAP GRID'
        : isRoutineTable ? 'SCHEDULE'
        : 'INTERACTIVE GRID';

      const tableKey = blockKey++;
      renderedElements.push(
        <div key={`matrix-${tableKey}`} className="blast-matrix-card">
          <div className="blast-matrix-topbar">
            <span className="blast-matrix-badge">
              {isRoadmapTable ? (
                <Calendar size={14} className="text-purple-400" />
              ) : isRoutineTable ? (
                <Clock size={14} className="text-purple-400" />
              ) : (
                <TableIcon size={14} className="text-purple-400" />
              )}
              {tableTitle}
            </span>
            <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 600, letterSpacing: '0.04em' }}>
              {badgeText}
            </span>
          </div>
          <div className="blast-matrix-scroll-wrapper">
            <table className="blast-matrix-table">
              <thead>
                <tr>
                  {headers.map((h, hi) => {
                    let colWidth = 'auto';
                    if (headers.length === 4) {
                      if (hi === 0) colWidth = '12%';
                      else if (hi === 1) colWidth = '24%';
                      else if (hi === 2) colWidth = '40%';
                      else if (hi === 3) colWidth = '24%';
                    } else if (headers.length === 2) {
                      colWidth = hi === 0 ? '30%' : '70%';
                    }
                    return (
                      <th
                        key={hi}
                        style={{
                          width: colWidth,
                          textAlign: 'left'
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
                      const headerName = (headers[ci] || '').toLowerCase();
                      const isWeekCol = /week|step|no/i.test(headerName) && /^[0-9]+$/.test(cell.trim());
                      const isTargetCol = /target|practice|goal/i.test(headerName) && /(easy|medium|hard|mock)/i.test(cell);
                      const isPickCol = headerName.includes('pick') || headerName.includes('recommend');

                      return (
                        <td key={ci} style={{ textAlign: 'left' }}>
                          {isWeekCol ? (
                            <span className="blast-week-badge">{cell.trim()}</span>
                          ) : isTargetCol ? (
                            <span className="blast-target-badge">
                              <Target size={12} className="text-purple-300 shrink-0" />
                              <span>{cell.trim()}</span>
                            </span>
                          ) : isPickCol ? (
                            renderPickBadge(cell)
                          ) : (
                            formatInline(cell)
                          )}
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

    // 7. Verdict detection (e.g. 🧠 Verdict:, **Verdict:**, etc.)
    const verdictMatch = line.match(/^\s*(?:###?\s*)?(?:🧠\s*)?(?:\*\*)?Verdict(?:\*\*)?:?\s*(.*)$/i);
    const emojiSecMatch = line.match(/^\s*(?:###?\s*)?([\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]\u{FE0F}?)\s*(.+)$/u);

    if (verdictMatch || (emojiSecMatch && (emojiSecMatch[1].includes('🧠') || emojiSecMatch[2].toLowerCase().includes('verdict')))) {
      const titleText = verdictMatch ? 'Final Verdict & Learning Strategy' : (emojiSecMatch ? emojiSecMatch[2] : 'Final Verdict');
      const inlineVerdictText = (verdictMatch ? verdictMatch[1] : '').replace(/^>\s*/, '').trim();

      const verdictLines: string[] = [];
      if (inlineVerdictText) {
        verdictLines.push(inlineVerdictText);
      }

      let k = i + 1;
      while (
        k < lines.length &&
        !lines[k].trim().startsWith('#') &&
        !lines[k].trim().startsWith('---') &&
        !lines[k].trim().startsWith('***') &&
        !lines[k].match(/^\s*(?:[•\-*]\s*)?(?:Pro tip|Must-do|Tip|Note|Important):/i) &&
        !lines[k].match(/^\s*(?:###?\s*)?[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/u) &&
        !lines[k].startsWith('```') &&
        !lines[k].includes('|')
      ) {
        const trimmedK = lines[k].trim().replace(/^>\s*/, '');
        if (trimmedK && trimmedK !== '--') {
          verdictLines.push(trimmedK);
        }
        k++;
      }

      renderedElements.push(
        <div key={`verdict-${i}`} className="blast-verdict-card">
          <div className="blast-verdict-header">
            <span className="blast-entity-icon" style={{ width: '34px', height: '34px', fontSize: '18px' }}>
              🧠
            </span>
            <h3 className="blast-verdict-title">{formatInline(titleText)}</h3>
          </div>
          <div className="blast-verdict-body">
            {verdictLines.map((vl, vli) => {
              const isBullet = /^[•\-*]\s*/.test(vl);
              const cleanVl = vl.replace(/^[•\-*]\s*/, '').replace(/^>\s*/, '');
              return (
                <div key={vli} style={{ margin: '8px 0', display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                  {isBullet ? (
                    <span style={{ color: 'var(--chat-bullet, #7c3aed)', fontWeight: 800, fontSize: '16px', lineHeight: 1 }}>•</span>
                  ) : null}
                  <div style={{ flex: 1, color: 'var(--chat-text, #1e293b)' }}>{formatInline(cleanVl)}</div>
                </div>
              );
            })}
          </div>
        </div>
      );

      if (k > i + 1) {
        i = k - 1;
      }
      continue;
    }

    // 8. General Emoji Section Header
    if (emojiSecMatch) {
      const emoji = emojiSecMatch[1];
      const titleText = emojiSecMatch[2];
      renderedElements.push(
        <div key={`sec-head-${i}`} className="blast-entity-header" style={{ marginTop: '22px' }}>
          <span className="blast-entity-icon">{emoji}</span>
          <h3 className="blast-entity-title" style={{ color: 'var(--chat-heading, #0f172a)' }}>{formatInline(titleText)}</h3>
        </div>
      );
      continue;
    }

    // 9. Key-Value Badges (e.g. Format: ..., Strengths: ..., Best for: ...)
    const kvMatch = line.match(/^\s*(Format|Strengths|Best for|Verdict|Ideal combo|Prerequisites|Target language):\s*(.*)$/i);
    if (kvMatch) {
      const label = kvMatch[1];
      const val = kvMatch[2];
      const isBestFor = label.toLowerCase() === 'best for';

      if (isBestFor) {
        renderedElements.push(
          <div key={`bestfor-${i}`} className="blast-bestfor-banner">
            <strong style={{ color: 'var(--chat-bullet, #7c3aed)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em', marginRight: '8px' }}>
              🎯 BEST FOR:
            </strong>
            <span style={{ color: 'var(--chat-text, #1e293b)' }}>{formatInline(val)}</span>
          </div>
        );
      } else {
        renderedElements.push(
          <div key={`kv-${i}`} className="blast-kv-row">
            <span className="blast-kv-label">{label}</span>
            <div className="blast-kv-val" style={{ color: 'var(--chat-text, #1e293b)' }}>{formatInline(val)}</div>
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
          <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div style={{ flex: 1, color: 'var(--chat-text-bold, #09090b)', fontWeight: 550 }}>
            {formatInline(checkMatch[1])}
          </div>
        </div>
      );
      continue;
    }

    // 7. Regular Headings
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${i}`} style={{ fontSize: '18px', fontWeight: 700, color: 'var(--chat-heading, #0f172a)', margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--chat-bullet, #7c3aed)' }} />
          {formatInline(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2 key={`h2-${i}`} style={{ fontSize: '20px', fontWeight: 800, color: 'var(--chat-heading, #0f172a)', margin: '24px 0 12px', borderBottom: '1px solid var(--chat-heading-border, #e2e8f0)', paddingBottom: '6px' }}>
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
              <span style={{ color: 'var(--chat-bullet, #7c3aed)', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>{symbol}</span>
            ) : (
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--chat-bullet, #7c3aed)', flexShrink: 0, marginTop: '9px' }} />
            )}
            <div style={{ flex: 1, color: 'var(--chat-text, #1e293b)' }}>{formatInline(text)}</div>
          </div>
        );
        continue;
      }
    }

    // 8b. Single schedule/table rows with pipes (e.g. | Wed | Chain rule & implicit | 2 hrs | ...)
    if (line.trim().startsWith('|') && line.includes('|')) {
      const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        const dayBadge = cells[0];
        const topic = cells[1];
        const duration = cells.length >= 3 ? cells[2] : '';
        const details = cells.length >= 4 ? cells.slice(3).join(' • ') : '';

        renderedElements.push(
          <div
            key={`sched-${i}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '10px 14px',
              margin: '8px 0',
              borderRadius: '12px',
              background: 'var(--chat-code-bg, #f3e8ff)',
              border: '1px solid var(--chat-code-border, #d8b4fe)',
              color: 'var(--chat-text, #1e293b)'
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3px 9px',
                borderRadius: '6px',
                background: 'var(--chat-bullet, #7c3aed)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '1px'
              }}
            >
              {dayBadge}
            </span>
            <div style={{ flex: 1, fontSize: '14px', lineHeight: 1.55 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong style={{ color: 'var(--chat-text-bold, #09090b)', fontWeight: 650 }}>{formatInline(topic)}</strong>
                {duration && (
                  <span style={{ fontSize: '11.5px', color: 'var(--chat-text-muted, #475569)', fontWeight: 500, background: 'rgba(0,0,0,0.05)', padding: '1px 6px', borderRadius: '4px' }}>
                    {duration}
                  </span>
                )}
              </div>
              {details && (
                <div style={{ marginTop: '4px', color: 'var(--chat-text, #1e293b)', fontSize: '13.5px' }}>
                  {formatInline(details)}
                </div>
              )}
            </div>
          </div>
        );
        continue;
      }
    }

    // 9. Standard paragraphs
    renderedElements.push(
      <p key={`p-${i}`} className="blast-hero-intro" style={{ margin: '8px 0', color: 'var(--chat-text, #1e293b)' }}>
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
          background: 'var(--chat-bullet, #7c3aed)',
          borderRadius: '2px',
          verticalAlign: 'middle',
          animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      />
    );
  }

  return (
    <div className={`blast-structured-response ${className}`} style={{ color: 'var(--chat-text, #1e293b)' }}>
      {renderedElements}
    </div>
  );
};

// Formats pick column cell with glowing badges
function renderPickBadge(text: string): React.ReactNode {
  const clean = text.replace(/^[✅\s]+/, '').trim();
  const lower = clean.toLowerCase();

  if (lower.includes('striver')) {
    return (
      <span className="blast-pick-badge blast-pick-striver">
        <CheckCircle2 size={13} className="text-purple-500 dark:text-purple-300" />
        <span>Striver</span>
      </span>
    );
  }
  if (lower.includes('kunal')) {
    return (
      <span className="blast-pick-badge blast-pick-kunal">
        <CheckCircle2 size={13} className="text-emerald-500 dark:text-emerald-300" />
        <span>Kunal</span>
      </span>
    );
  }
  return (
    <span className="blast-pick-badge blast-pick-generic">
      <CheckCircle2 size={13} className="text-cyan-500 dark:text-cyan-300" />
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
            background: 'var(--chat-code-bg, #f3e8ff)',
            color: 'var(--chat-code-text, #581c87)',
            fontFamily: 'monospace',
            fontSize: '12.5px',
            border: '1px solid var(--chat-code-border, #d8b4fe)'
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${match.index}`} style={{ fontWeight: 700, color: 'var(--chat-text-bold, #09090b)' }}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`i-${match.index}`} style={{ fontStyle: 'italic', color: 'var(--chat-text-muted, #475569)' }}>
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
            color: 'var(--chat-link, #6b21a8)',
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
