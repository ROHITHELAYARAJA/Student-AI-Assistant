import React, { useState, useEffect, useRef } from 'react';
import { requestAiAssistance } from '../../services/api.js';
import {
  X,
  Send,
  RotateCcw,
  User
} from 'lucide-react';
import { BlastMascot, MascotState } from './BlastMascot.js';

interface ChatEntry {
  id: string;
  sender: 'user' | 'blast';
  text: string;
  mascotState?: MascotState;
  timestamp: string;
}

interface EmmaTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTopic: string;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
}

export const EmmaTutorDrawer: React.FC<EmmaTutorDrawerProps> = ({
  isOpen,
  onClose,
  activeTopic,
  externalPrompt,
  onClearExternalPrompt
}) => {
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      id: 'welcome',
      sender: 'blast',
      text: `Hi! I'm Blast, your Blast AI study copilot. We're currently studying "${activeTopic}". Ask me anything—from concept breakdowns to exam mnemonics!`,
      mascotState: 'greeting',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [mascotState, setMascotState] = useState<MascotState>('greeting');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMascotState('greeting');
      const timer = setTimeout(() => setMascotState('idle'), 2200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (externalPrompt && externalPrompt.trim()) {
      handleSendPrompt(externalPrompt.trim());
      if (onClearExternalPrompt) {
        onClearExternalPrompt();
      }
    }
  }, [externalPrompt]);

  const handleSendPrompt = async (text: string) => {
    if (!text.trim()) {
      setErrorMessage('Please type a study question or prompt for Emma.');
      return;
    }

    setErrorMessage(null);
    const userMsg: ChatEntry = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setMascotState('thinking');

    try {
      const response = await requestAiAssistance({
        content: text,
        operation: 'explain',
        studyTopic: activeTopic
      });

      let replyText = '';
      if (response.summary && response.summary.trim()) {
        replyText = response.summary;
      }
      if (response.data && response.data.keypoints && response.data.keypoints.length > 0) {
        const kpList = response.data.keypoints.map((k) => `• ${k.point}`).join('\n');
        replyText = replyText ? `${replyText}\n\n${kpList}` : kpList;
      }
      if (response.data && response.data.article && response.data.article.sections.length > 0) {
        const artText = response.data.article.sections.map((s) => `${s.heading}:\n${s.body}`).join('\n\n');
        replyText = replyText ? `${replyText}\n\n${artText}` : artText;
      }
      if (!replyText && response.rawMarkdown) {
        replyText = response.rawMarkdown;
      }
      if (!replyText) {
        replyText = `Here is what you need to know about ${activeTopic}: Focus on maintaining strong fundamental boundaries, evaluating edge-case trade-offs, and memorizing the primary invariant constraints!`;
      }

      const blastMsg: ChatEntry = {
        id: `b-${Date.now()}`,
        sender: 'blast',
        text: replyText,
        mascotState: 'speaking',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, blastMsg]);
      setMascotState('speaking');
      setTimeout(() => setMascotState('happy'), 2200);
      setTimeout(() => setMascotState('idle'), 4200);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to connect to Blast AI tutor.');
      setMascotState('error');
      setTimeout(() => setMascotState('idle'), 2500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleSendPrompt(inputText.trim());
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-96 bg-[#101017] border-l border-[#242436] shadow-2xl flex flex-col z-50">
      <div className="p-4 border-b border-[#242436] flex items-center justify-between bg-[#141420]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BlastMascot size="sm" state={mascotState} />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#101017]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-xs tracking-wide">Blast AI Study Copilot</h3>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase">
                Active
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Context: {activeTopic}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setMessages([
                {
                  id: 'reset',
                  sender: 'blast',
                  text: `Chat cleared! How can I help you master ${activeTopic} today?`,
                  mascotState: 'greeting',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
              setMascotState('greeting');
              setTimeout(() => setMascotState('idle'), 2000);
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#1C1C2C] transition-colors"
            title="Clear Chat"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-[#1C1C2C] transition-colors"
            title="Close Drawer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-[#202030] bg-[#0E0E16] flex gap-1.5 overflow-x-auto text-[11px]">
        {[
          'Summarize in 3 bullets',
          'Give me an exam mnemonic',
          'Explain the edge-case traps',
          'Generate 2 flashcards'
        ].map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(pill)}
            className="px-2.5 py-1 rounded-full bg-[#181826] hover:bg-orange-600/20 text-zinc-300 hover:text-orange-300 border border-[#26263A] whitespace-nowrap transition-all"
          >
            {pill}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isBlast = msg.sender === 'blast';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isBlast ? 'items-start' : 'items-end flex-row-reverse'}`}
            >
              {isBlast ? (
                <div className="shrink-0 mt-0.5">
                  <BlastMascot size="xs" state={msg.mascotState || 'idle'} />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-orange-600/30 border border-orange-500/40 flex items-center justify-center text-orange-300 shrink-0">
                  <User size={13} />
                </div>
              )}

              <div
                className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed space-y-1 ${
                  isBlast
                    ? 'bg-[#181826] border border-[#27273C] text-zinc-200 rounded-tl-sm'
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-tr-sm shadow-md shadow-orange-600/20'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[9px] ${
                    isBlast ? 'text-zinc-500 text-right' : 'text-orange-200 text-right'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 items-start">
            <div className="shrink-0 mt-0.5">
              <BlastMascot size="xs" state="processing" />
            </div>
            <div className="p-3 rounded-2xl bg-[#181826] border border-[#27273C] text-xs text-zinc-400 rounded-tl-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
              <span>Blast AI is analyzing with Bedrock RAG...</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-[#242436] bg-[#12121D] space-y-2">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (mascotState === 'idle') {
                setMascotState('listening');
              }
            }}
            placeholder={`Ask Blast AI about ${activeTopic}...`}
            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#181826] border border-[#2A2A40] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-40 transition-all shadow-md shadow-orange-600/30"
          >
            <Send size={13} />
          </button>
        </div>
      </form>
    </aside>
  );
};
