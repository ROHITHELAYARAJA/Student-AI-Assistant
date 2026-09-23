import React from 'react';
import { Copy, Check } from 'lucide-react';

interface RichMarkdownProps {
  content: string;
  className?: string;
}

export const RichMarkdown: React.FC<RichMarkdownProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  // Parse lines into structured blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let blockKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced Code Block Detection
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        const codeText = codeBuffer.join('\n');
        const currentIndex = blockKey++;
        elements.push(
          <div
            key={`code-${currentIndex}`}
            className="my-3 rounded-xl overflow-hidden border border-[var(--color-border)] bg-zinc-950 text-zinc-100 shadow-md text-xs font-mono"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400">
              <span className="font-semibold uppercase tracking-wider">{codeLanguage || 'code'}</span>
              <button
                onClick={() => copyToClipboard(codeText, currentIndex)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                {copiedIndex === currentIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
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
        // Start of code block
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

    // Empty lines
    if (!line.trim()) {
      elements.push(<div key={`spacer-${i}`} className="h-2" />);
      continue;
    }

    // Headings
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-xs font-bold uppercase tracking-wider text-orange-500 mt-3 mb-1">
          {formatInline(line.replace('#### ', ''))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-bold text-[var(--color-text)] mt-3.5 mb-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
          <span>{formatInline(line.replace('### ', ''))}</span>
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-base font-black text-[var(--color-text)] mt-4 mb-2 pb-1 border-b border-[var(--color-border)]">
          {formatInline(line.replace('## ', ''))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-lg font-black text-[var(--color-text)] mt-4 mb-2">
          {formatInline(line.replace('# ', ''))}
        </h1>
      );
      continue;
    }

    // Bullet lists
    if (/^\s*([•*-]|\d+\.)\s+/.test(line)) {
      const match = line.match(/^\s*([•*-]|\d+\.)\s+(.*)$/);
      if (match) {
        const bulletSymbol = match[1];
        const textContent = match[2];
        const isNumeric = /^\d+\./.test(bulletSymbol);

        elements.push(
          <div key={`li-${i}`} className="flex items-start gap-2.5 my-1 ml-1 text-sm leading-relaxed">
            {isNumeric ? (
              <span className="text-orange-500 font-bold shrink-0 text-xs mt-0.5">{bulletSymbol}</span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-2"></span>
            )}
            <div className="flex-1">{formatInline(textContent)}</div>
          </div>
        );
        continue;
      }
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-sm leading-relaxed text-[var(--color-text)]">
        {formatInline(line)}
      </p>
    );
  }

  return <div className={`font-sans leading-relaxed ${className}`}>{elements}</div>;
};

// Formats inline bold, italic, and code snippets
function formatInline(text: string): React.ReactNode[] {
  // Regex to match code `...`, bold **...**, and italics *...*
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;

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
          className="px-1.5 py-0.5 mx-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono text-xs border border-orange-500/20"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${match.index}`} className="font-bold text-[var(--color-text)]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`i-${match.index}`} className="italic text-[var(--color-text-secondary)]">
          {token.slice(1, -1)}
        </em>
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
