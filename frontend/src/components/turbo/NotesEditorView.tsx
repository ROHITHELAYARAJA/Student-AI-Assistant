import React, { useState } from 'react';
import { router } from '../../services/router.js';
import {
  BookOpen,
  FileText,
  Award,
  Layers,
  Headphones,
  FolderGit2,
  Sparkles,
  Share2,
  Clock,
  Bold,
  Italic,
  Underline,
  Sigma,
  Table,
  AlignLeft,
  List,
  Eye,
  Paperclip,
  Mic,
  ArrowUp,
  X
} from 'lucide-react';

interface NotesEditorViewProps {
  noteId?: string;
  topicTitle?: string;
  onOpenUpgrade?: () => void;
}

export const NotesEditorView: React.FC<NotesEditorViewProps> = ({
  noteId = 'faang-sde',
  topicTitle = 'Roadmap: Resume to FAANG/MAANG SDE',
  onOpenUpgrade
}) => {
  const [fontSize, setFontSize] = useState(24);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontFamily, setFontFamily] = useState('Clarika');
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    const userText = chatPrompt.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatPrompt('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Here is the high-yield breakdown for "${userText}": Focus on mastering two-pointer sliding window patterns, evaluating horizontal scaling bottlenecks with Redis, and quantifying achievements on your resume with exact metrics!`
        }
      ]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#111114] text-zinc-100 flex flex-col font-sans select-none">
      <header className="h-14 px-5 flex items-center justify-between border-b border-[#1E1E28] bg-[#111114] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.navigate('/dashboard')}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
            </svg>
            <span className="font-bold text-white text-base tracking-tight">turbo ai</span>
          </div>

          <div className="h-4 w-[1px] bg-[#2A2A3A]" />

          <span className="text-xs text-zinc-300 font-medium truncate max-w-xs">{topicTitle}</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 bg-[#181822] border border-[#272738] px-2 py-1 rounded-xl text-xs">
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="bg-transparent text-zinc-300 font-medium text-xs focus:outline-none cursor-pointer pr-1"
          >
            <option value="Clarika" className="bg-[#181822]">Clarika</option>
            <option value="Inter" className="bg-[#181822]">Inter</option>
            <option value="Fira Code" className="bg-[#181822]">Fira Code</option>
          </select>

          <div className="h-3 w-[1px] bg-[#2A2A3A] mx-1" />

          <button
            onClick={() => setFontSize((s) => Math.max(14, s - 2))}
            className="w-5 h-5 rounded hover:bg-[#252538] flex items-center justify-center text-zinc-400"
          >
            -
          </button>
          <span className="w-5 text-center font-semibold text-zinc-200">{fontSize}</span>
          <button
            onClick={() => setFontSize((s) => Math.min(36, s + 2))}
            className="w-5 h-5 rounded hover:bg-[#252538] flex items-center justify-center text-zinc-400"
          >
            +
          </button>

          <div className="h-3 w-[1px] bg-[#2A2A3A] mx-1" />

          <button
            onClick={() => setIsBold(!isBold)}
            className={`w-6 h-6 rounded flex items-center justify-center ${
              isBold ? 'bg-[#7C3AED] text-white' : 'text-zinc-400 hover:bg-[#252538]'
            }`}
          >
            <Bold size={13} />
          </button>

          <button
            onClick={() => setIsItalic(!isItalic)}
            className={`w-6 h-6 rounded flex items-center justify-center ${
              isItalic ? 'bg-[#7C3AED] text-white' : 'text-zinc-400 hover:bg-[#252538]'
            }`}
          >
            <Italic size={13} />
          </button>

          <button
            onClick={() => setIsUnderline(!isUnderline)}
            className={`w-6 h-6 rounded flex items-center justify-center ${
              isUnderline ? 'bg-[#7C3AED] text-white' : 'text-zinc-400 hover:bg-[#252538]'
            }`}
          >
            <Underline size={13} />
          </button>

          <div className="h-3 w-[1px] bg-[#2A2A3A] mx-1" />

          <button className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:bg-[#252538]">
            <Sigma size={13} />
          </button>

          <button className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:bg-[#252538]">
            <Table size={13} />
          </button>

          <button className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:bg-[#252538]">
            <AlignLeft size={13} />
          </button>

          <button className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:bg-[#252538]">
            <List size={13} />
          </button>

          <button className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:bg-[#252538]">
            <Eye size={13} />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Version History">
            <Clock size={16} />
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 text-xs font-semibold transition-all">
            <Share2 size={13} />
            <span>Share</span>
          </button>

          <button
            onClick={onOpenUpgrade}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
          >
            <Sparkles size={13} className="fill-black" />
            <span>Upgrade</span>
          </button>

          <button
            onClick={() => router.navigate('/signup')}
            className="w-8 h-8 rounded-full bg-[#582CD6] text-white font-bold text-xs flex items-center justify-center ring-2 ring-[#2F2450]"
          >
            E
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-20 bg-[#111114] border-r border-[#1E1E28] flex flex-col items-center py-6 space-y-6 shrink-0">
          <button
            onClick={() => router.navigate(`/notes/${noteId}`)}
            className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Learn</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/editor`)}
            className="flex flex-col items-center gap-1.5 text-purple-400 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <FileText size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">Notes</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/quiz`)}
            className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <Award size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Quiz</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/flashcards`)}
            className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <Layers size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Flashcards</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/podcast`)}
            className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <Headphones size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Podcast</span>
          </button>

          <button
            onClick={() => router.navigate(`/notes/${noteId}/source`)}
            className="flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl hover:bg-[#1E1E2C] flex items-center justify-center">
              <FolderGit2 size={18} />
            </div>
            <span className="text-[10px] font-medium tracking-tight">Source</span>
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto px-10 py-10 max-w-3xl mx-auto w-full space-y-8 select-text">
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
              <span>📑</span>
              <span>{topicTitle}</span>
            </h1>

            <p className="text-xs text-zinc-300 leading-relaxed font-normal">
              You already have production-grade Java Spring Boot services, a React freelance portfolio, and AI-assistant work. The roadmap below pinpoints where those assets meet the FAANG SDE bar and how to bridge every remaining gap so you can move from a strong campus candidate to a hireable intern or full-time engineer.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#1E1E28]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Where you stand: auditing the resume against the FAANG bar</span>
              <span>🚦</span>
            </h2>

            <ul className="space-y-2 text-xs text-zinc-300 pl-4 list-disc">
              <li>
                <strong className="text-purple-300">Strengths to keep</strong> – Spring Boot REST APIs, layered architecture, Hibernate/JDBC experience, end-to-end project delivery, AI-assistant integration, solid CGPA (8.0 / 10).
              </li>
              <li>
                <strong className="text-purple-300">Visible gaps</strong> – limited <span className="text-cyan-300 font-semibold underline underline-offset-2">DSA depth</span> (no competitive-programming record), no large-scale <span className="text-cyan-300 font-semibold underline underline-offset-2">system-design</span> exposure, few internship or open-source contributions, and modest <span className="text-cyan-300 font-semibold underline underline-offset-2">quantified impact</span> on projects.
              </li>
              <li>
                <strong className="text-purple-300">FAANG-ready numeric targets</strong> &rarr; 150 LeetCode medium-hard solves, 1-2 high-traffic design case studies, at least one <span className="text-cyan-300 font-semibold underline underline-offset-2">intern or open source</span> PR in a major repo, and resume bullets with measurable outcomes (e.g., <em>reduced API latency by 30%</em>).
              </li>
            </ul>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#1E1E28]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>DSA mastery plan: patterns first, Java as your weapon</span>
              <span>⚔️</span>
            </h2>

            <ul className="space-y-2 text-xs text-zinc-300 pl-4 list-disc">
              <li>
                <strong className="text-purple-300">Month 1-2:</strong> Master core patterns – arrays/two-pointers, sliding window, hashing. Solve ~ 25 problems each; focus on O(n) vs O(n²) trade-offs.
              </li>
              <li>
                <strong className="text-purple-300">Month 3-4:</strong> Advance to linked lists, stacks/queues, trees (BST, AVL). Target ~ 20 medium-hard problems; write helper functions like ListNode reverse(ListNode head).
              </li>
              <li>
                <strong className="text-purple-300">Month 5-6:</strong> Graph traversal (BFS/DFS), recursion/backtracking, greedy, DP, heaps. Aim &gt; 30 mixed-difficulty problems; practice <span className="text-purple-300 font-semibold underline underline-offset-2">time-boxed</span> mock sessions (45 min).
              </li>
              <li>
                <strong className="text-purple-300">Practice regime:</strong> Daily 1h on LeetCode, weekend 2h timed mock on HackerRank; maintain a spreadsheet of problem, pattern, and runtime analysis.
              </li>
            </ul>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#1E1E28]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>System design and LLD fundamentals for freshers</span>
              <span>🏗️</span>
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Focus on fundamental distributed building blocks: horizontal vs vertical scaling, load balancing with Nginx, caching layers using Redis, database partitioning (sharding), and relational vs document database selection.
            </p>
          </div>
        </main>

        {isChatOpen && (
          <aside className="w-80 bg-[#14141C] border-l border-[#222232] flex flex-col justify-between shrink-0 shadow-2xl">
            <div className="p-4 border-b border-[#222232] flex items-center justify-between">
              <span className="font-bold text-xs text-white">Chat</span>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-3 grid grid-cols-2 gap-2 border-b border-[#222232]">
              <button
                onClick={() => router.navigate(`/notes/${noteId}/quiz`)}
                className="p-2.5 rounded-xl bg-[#1C1828] hover:bg-[#252036] border border-purple-500/30 text-left transition-all col-span-2 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-purple-300">Quizzes</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                      Popular
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Test your knowledge</div>
                </div>
                <Award size={15} className="text-purple-400" />
              </button>

              <button
                onClick={() => router.navigate(`/notes/${noteId}/podcast`)}
                className="p-2.5 rounded-xl bg-[#181822] hover:bg-[#20202E] border border-[#272738] text-left transition-all"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-200">
                  <Headphones size={13} className="text-purple-400" />
                  <span>Podcast</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Listen on the go</div>
              </button>

              <button
                onClick={() => router.navigate(`/notes/${noteId}/flashcards`)}
                className="p-2.5 rounded-xl bg-[#181822] hover:bg-[#20202E] border border-[#272738] text-left transition-all"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-200">
                  <Layers size={13} className="text-purple-400" />
                  <span>Flashcards</span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Active recall</div>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center pt-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 border border-purple-500/40 p-1 flex items-center justify-center mb-2">
                  <img
                    src="/emma-expressions/teaching.png"
                    alt="Turbo"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-bold text-white">Hey, I'm Turbo</h3>
                <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                  I can work with you on your doc and answer any questions!
                </p>
              </div>

              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white ml-auto max-w-[85%]'
                      : 'bg-[#1C1C28] text-zinc-200 border border-[#2A2A3E]'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-[#222232] bg-[#14141C]">
              <div className="p-2.5 rounded-2xl bg-[#1C1C28] border border-[#2B2B40] space-y-2">
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder="Type a question here or type '@' to reference documents..."
                  className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <button type="button" className="p-1 hover:text-zinc-300">
                      <Paperclip size={13} />
                    </button>
                    <button type="button" className="p-1 hover:text-zinc-300">
                      <Mic size={13} />
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!chatPrompt.trim()}
                    className="w-6 h-6 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center transition-all disabled:opacity-40"
                  >
                    <ArrowUp size={13} />
                  </button>
                </div>
              </div>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
};
