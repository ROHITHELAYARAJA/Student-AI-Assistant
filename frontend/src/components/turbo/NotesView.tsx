import React, { useState } from 'react';
import { TurboNotes } from '../../types/turbo.js';
import {
  FileText,
  Copy,
  Check,
  Download,
  Sparkles,
  Lightbulb,
  Hash
} from 'lucide-react';

interface NotesViewProps {
  notes: TurboNotes | null;
  isLoading: boolean;
  onOpenEmmaWithPrompt: (prompt: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  isLoading,
  onOpenEmmaWithPrompt
}) => {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin mb-4" />
        <h3 className="text-white font-semibold text-sm">Generating High-Yield Notes...</h3>
        <p className="text-zinc-400 text-xs mt-1">Emma is extracting key principles, formulas, and high-probability exam concepts.</p>
      </div>
    );
  }

  if (!notes) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="p-4 rounded-2xl bg-[#1A1A28] border border-[#2D2D42] mb-4">
          <FileText size={32} className="text-purple-400" />
        </div>
        <h3 className="text-white font-semibold text-base">No Notes Available</h3>
        <p className="text-zinc-400 text-xs mt-1 max-w-sm">
          Select or enter a study topic above to generate structured academic notes.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    let fullText = `# ${notes.title}\n\n${notes.summary}\n\n## Key Takeaways\n`;
    notes.keyTakeaways.forEach((t) => {
      fullText += `- ${t}\n`;
    });
    notes.sections.forEach((s) => {
      fullText += `\n## ${s.heading}\n${s.content}\n`;
      if (s.bulletPoints) {
        s.bulletPoints.forEach((bp) => {
          fullText += `* ${bp}\n`;
        });
      }
    });
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let fullText = `# ${notes.title}\n\n${notes.summary}\n\n## Key Takeaways\n`;
    notes.keyTakeaways.forEach((t) => {
      fullText += `- ${t}\n`;
    });
    notes.sections.forEach((s) => {
      fullText += `\n## ${s.heading}\n${s.content}\n`;
      if (s.bulletPoints) {
        s.bulletPoints.forEach((bp) => {
          fullText += `* ${bp}\n`;
        });
      }
    });
    const blob = new Blob([fullText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notes.topic.replace(/\s+/g, '_')}_notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-6">
      <div className="p-6 rounded-2xl bg-[#14141E] border border-[#252538] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            Turbo AI Smart Notes
          </span>
          <h1 className="text-xl font-bold text-white mt-1.5">{notes.title}</h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">{notes.summary}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1C2C] hover:bg-[#25253A] border border-[#2E2E44] text-xs text-zinc-300 font-medium transition-all"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C1C2C] hover:bg-[#25253A] border border-[#2E2E44] text-xs text-zinc-300 font-medium transition-all"
          >
            <Download size={13} />
            <span>Export MD</span>
          </button>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-500/30 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
          <Lightbulb size={15} />
          <span>Core Takeaways & High-Yield Summary</span>
        </div>
        <ul className="space-y-2">
          {notes.keyTakeaways.map((takeaway, idx) => (
            <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-6">
        {notes.sections.map((section, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-[#12121A] border border-[#232332] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#20202E] pb-3">
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Hash size={14} className="text-purple-400" />
                <span>{section.heading}</span>
              </h2>

              <button
                onClick={() =>
                  onOpenEmmaWithPrompt(
                    `Hi Emma, in the notes for ${notes.topic}, could you explain more deeply this section: "${section.heading}"?`
                  )
                }
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <Sparkles size={12} />
                <span>Ask Emma about this</span>
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">{section.content}</p>

            {section.bulletPoints && section.bulletPoints.length > 0 && (
              <div className="p-4 rounded-xl bg-[#171722] border border-[#232334] space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Key Mechanics & Invariants
                </div>
                <ul className="space-y-1.5">
                  {section.bulletPoints.map((bp, bpIdx) => (
                    <li key={bpIdx} className="text-xs text-zinc-300 flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {section.formulas && section.formulas.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#1A1829] border border-purple-500/20 font-mono text-xs text-purple-200">
                <div className="text-[10px] text-purple-400 uppercase font-sans font-bold tracking-wider mb-1">
                  Key Formula / Theorem
                </div>
                {section.formulas.map((form, fIdx) => (
                  <div key={fIdx}>{form}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
