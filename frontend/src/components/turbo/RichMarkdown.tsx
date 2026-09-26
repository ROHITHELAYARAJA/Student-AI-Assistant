import React from 'react';
import { Copy, Check, CheckCircle2, Sparkles, Table as TableIcon, HelpCircle } from 'lucide-react';

interface RichMarkdownProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
}

export const RichMarkdown: React.FC<RichMarkdownProps> = ({ content, className = '', isStreaming = false }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let blockKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Fenced Code Block Detection
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        const codeText = codeBuffer.join('\n');
        const currentIndex = blockKey++;
        elements.push(
          <div
            key={`code-${currentIndex}`}
            className="my-3.5 rounded-xl overflow-hidden border border-zinc-700/60 dark:border-zinc-700/60 bg-zinc-950 text-zinc-100 shadow-lg text-xs font-mono"
          >
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-[11px] text-zinc-400">
              <span className="font-semibold uppercase tracking-wider text-purple-400">{codeLanguage || 'code'}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(codeText, currentIndex)}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                {copiedIndex === currentIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLanguage = '';
      } else {
        inCodeBlock = true;
        codeLanguage = line.trim().replace(/^```/, '').trim();
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // 2. Empty lines
    if (!line.trim()) {
      elements.push(<div key={`spacer-${i}`} className="h-2" />);
      continue;
    }

    // 3. Horizontal Rule / Divider (---, ***, ___)
    if (/^\s*(---|---\s*|\*\*\*|___)\s*$/.test(line)) {
      elements.push(
        <div key={`hr-${i}`} className="my-5 flex items-center gap-3" role="separator">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-purple-500/35 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/35 via-transparent to-transparent" />
        </div>
      );
      continue;
    }

    // 4. Markdown Table Detection
    // Check if current line contains '|' and line i+1 is a table divider like |---|---|
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(lines[i + 1])) {
      const headerLine = line;
      const delimiterLine = lines[i + 1];
      const tableDataLines: string[] = [];

      let j = i + 2;
      while (j < lines.length && lines[j].includes('|') && lines[j].trim().length > 0) {
        tableDataLines.push(lines[j]);
        j++;
      }

      // Parse headers
      const headers = headerLine
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(h => h.trim());

      // Parse alignments
      const alignments = delimiterLine
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(d => {
          const trimmed = d.trim();
          if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
          if (trimmed.endsWith(':')) return 'right';
          return 'left';
        });

      // Parse data rows
      const rows = tableDataLines.map(rowLine => {
        return rowLine
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map(c => c.trim());
      });

      const tableKey = blockKey++;
      elements.push(
        <div
          key={`table-${tableKey}`}
          className="my-5 overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-900/80 shadow-xl backdrop-blur-md"
        >
          <div className="px-4 py-2 bg-gradient-to-r from-purple-950/60 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between text-[11.5px] font-semibold text-purple-300 tracking-wider uppercase">
            <span className="flex items-center gap-1.5">
              <TableIcon className="w-3.5 h-3.5 text-purple-400" />
              Summary Comparison
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-800/60 border-b border-zinc-700/60">
                  {headers.map((h, hi) => (
                    <th
                      key={hi}
                      className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-purple-200"
                      style={{ textAlign: (alignments[hi] as any) || 'left' }}
                    >
                      {formatInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {rows.map((row, ri) => {
                  const isSingleCell = row.length === 1 && headers.length > 1;
                  return (
                    <tr
                      key={ri}
                      className={`hover:bg-purple-500/[0.05] transition-colors ${
                        isSingleCell ? 'bg-purple-950/20 font-medium' : ''
                      }`}
                    >
                      {isSingleCell ? (
                        <td
                          colSpan={headers.length}
                          className="px-4 py-3 text-[13.5px] text-purple-200 leading-relaxed italic"
                        >
                          {formatInline(row[0])}
                        </td>
                      ) : (
                        row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="px-4 py-3 text-[14px] text-zinc-200 leading-relaxed align-top"
                            style={{ textAlign: (alignments[ci] as any) || 'left' }}
                          >
                            {formatInline(cell)}
                          </td>
                        ))
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );

      // Advance i to after table
      i = j - 1;
      continue;
    }

    // 5. Checkmark List Items (e.g. ✅ You already know basics...)
    const checkMatch = line.match(/^\s*✅\s*(.*)$/);
    if (checkMatch) {
      elements.push(
        <div
          key={`check-${i}`}
          className="my-1.5 flex items-start gap-2.5 px-3 py-2 rounded-xl bg-emerald-950/25 border border-emerald-500/25 text-emerald-100 text-[14px] leading-relaxed shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-zinc-100 font-medium">
            {formatInline(checkMatch[1])}
          </div>
        </div>
      );
      continue;
    }

    // 6. Section Header with Emoji (e.g. 🧭 Striver (Raj Vikramaditya) – A-Z DSA Sheet, 🎓 Kunal Kushwaha..., 🧠 Verdict?)
    const emojiHeaderMatch = line.match(/^\s*(?:###?\s*)?([🧭🎓🧠💡📌🚀⭐🎯🔥🏆📚💡])\s+(.+)$/);
    if (emojiHeaderMatch) {
      const emoji = emojiHeaderMatch[1];
      const title = emojiHeaderMatch[2];
      const isVerdict = emoji === '🧠' || title.toLowerCase().includes('verdict');

      elements.push(
        <div
          key={`sec-header-${i}`}
          className={`mt-6 mb-3 flex items-center gap-2.5 pb-2 ${
            isVerdict
              ? 'border-b-2 border-purple-500/50 bg-gradient-to-r from-purple-500/10 to-transparent p-2.5 rounded-lg'
              : 'border-b border-purple-500/20'
          }`}
        >
          <span className="text-xl p-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 shrink-0">
            {emoji}
          </span>
          <h3 className="text-[17px] font-bold text-white tracking-tight">
            {formatInline(title)}
          </h3>
        </div>
      );
      continue;
    }

    // 7. Key-Value Badges (e.g. Format: ..., Strengths: ..., Best for: ...)
    const kvMatch = line.match(/^\s*(Format|Strengths|Best for|Verdict|Ideal combo|Key features|Prerequisites|Duration|Difficulty):\s*(.*)$/i);
    if (kvMatch) {
      const keyLabel = kvMatch[1];
      const valText = kvMatch[2];

      elements.push(
        <div key={`kv-${i}`} className="my-2 flex items-start gap-2.5 text-[14.5px] leading-relaxed">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11.5px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 shrink-0 mt-0.5">
            {keyLabel}
          </span>
          <div className="flex-1 text-zinc-200">
            {valText ? formatInline(valText) : null}
          </div>
        </div>
      );
      continue;
    }

    // 8. Blockquotes (> ...)
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 pl-3.5 py-2 border-l-3 border-purple-500 bg-purple-500/[0.05] rounded-r-xl text-sm italic text-zinc-300 leading-relaxed"
        >
          {formatInline(line.replace(/^>\s*/, ''))}
        </blockquote>
      );
      continue;
    }

    // 9. Markdown Headings
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-xs font-bold uppercase tracking-wider text-purple-400 mt-4 mb-1.5">
          {formatInline(line.replace('#### ', ''))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-[16px] font-bold text-white mt-4 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          <span>{formatInline(line.replace('### ', ''))}</span>
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-[18px] font-bold text-white mt-5 mb-2.5 pb-1 border-b border-zinc-700/60">
          {formatInline(line.replace('## ', ''))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-[20px] font-extrabold text-white mt-5 mb-3">
          {formatInline(line.replace('# ', ''))}
        </h1>
      );
      continue;
    }

    // 10. Bullet & Numbered lists
    if (/^\s*([•*-]|\d+\.)\s+/.test(line)) {
      const match = line.match(/^\s*([•*-]|\d+\.)\s+(.*)$/);
      if (match) {
        const bulletSymbol = match[1];
        const textContent = match[2];
        const isNumeric = /^\d+\./.test(bulletSymbol);

        elements.push(
          <div key={`li-${i}`} className="flex items-start gap-2.5 my-1 ml-1 text-[14.5px] leading-relaxed">
            {isNumeric ? (
              <span className="text-purple-400 font-bold shrink-0 text-xs mt-0.5">{bulletSymbol}</span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-2"></span>
            )}
            <div className="flex-1 text-zinc-200">{formatInline(textContent)}</div>
          </div>
        );
        continue;
      }
    }

    // 11. Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-[15px] leading-relaxed text-zinc-200">
        {formatInline(line)}
      </p>
    );
  }

  // If currently streaming, show blinking cursor at the very end
  if (isStreaming) {
    elements.push(
      <span
        key="streaming-cursor"
        className="inline-block w-2 h-4.5 ml-1 bg-purple-400 rounded-sm animate-pulse align-middle shadow-[0_0_8px_rgba(168,85,247,0.7)]"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`font-sans leading-relaxed text-zinc-200 select-text ${className}`}
      style={{
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {elements}
    </div>
  );
};

// Formats inline bold, italic, code, and links
function formatInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Matches code `...`, bold **...**, italics *...*, links [text](url)
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
          className="px-1.5 py-0.5 mx-0.5 rounded bg-purple-950/70 text-purple-300 font-mono text-[12.5px] border border-purple-500/30"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${match.index}`} className="font-bold text-white tracking-tight">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`i-${match.index}`} className="italic text-purple-200">
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
          className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors font-medium"
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

export default RichMarkdown;
