import React, { useState } from 'react';
import { IngestedDocument, DocumentChunk } from '../../types/turbo.js';
import {
  FolderGit2,
  Upload,
  Plus,
  Trash2,
  Search,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';

interface RagSourcesViewProps {
  documents: IngestedDocument[];
  isLoading: boolean;
  onIngest: (title: string, content: string, sourceType: 'text' | 'pdf' | 'slides' | 'notes') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onQueryRag: (query: string) => Promise<DocumentChunk[]>;
}

export const RagSourcesView: React.FC<RagSourcesViewProps> = ({
  documents,
  isLoading,
  onIngest,
  onDelete,
  onQueryRag
}) => {
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [sourceType, setSourceType] = useState<'text' | 'pdf' | 'slides' | 'notes'>('notes');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DocumentChunk[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    try {
      setIsSubmitting(true);
      await onIngest(docTitle.trim(), docContent.trim(), sourceType);
      setDocTitle('');
      setDocContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const results = await onQueryRag(searchQuery.trim());
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const totalChunks = documents.reduce((acc, d) => acc + d.chunks.length, 0);

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="p-6 rounded-2xl bg-[#14141E] border border-[#252538] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            ML RAG Retrieval Engine
          </span>
          <h1 className="text-xl font-bold text-white mt-1.5">Study Material Knowledge Base</h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Upload slides, textbook chapters, or lecture notes. Our ML engine automatically chunks, indexes, and grounds your roadmap, quizzes, and tutor answers in your actual syllabus.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-[#181824] border border-[#26263A] text-right">
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Indexed Sources</div>
            <div className="text-lg font-bold text-white">{documents.length} Docs</div>
          </div>
          <div className="p-3 rounded-xl bg-[#181824] border border-[#26263A] text-right">
            <div className="text-[10px] text-zinc-400 uppercase font-semibold">Semantic Chunks</div>
            <div className="text-lg font-bold text-purple-400">{totalChunks} Chunks</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#12121A] border border-[#232332] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Upload size={14} className="text-purple-400" />
            <span>Ingest Study Material</span>
          </div>

          <form onSubmit={handleIngest} className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                Document / Chapter Title
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Chapter 4 - Graph Algorithms & Dijkstra"
                className="w-full px-3 py-2 rounded-xl bg-[#171724] border border-[#28283C] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1">Source Format</label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {(['notes', 'slides', 'pdf', 'text'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSourceType(type)}
                    className={`py-1.5 rounded-lg font-medium text-[11px] uppercase border transition-all ${
                      sourceType === type
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                        : 'bg-[#181826] border-[#262638] text-zinc-400 hover:bg-[#1E1E30]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                Content / Extracted Text
              </label>
              <textarea
                rows={6}
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder="Paste lecture transcript, textbook section, summary notes, or syllabus content..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#171724] border border-[#28283C] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !docTitle.trim() || !docContent.trim()}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              <Plus size={14} />
              <span>{isSubmitting ? 'Chunking & Indexing...' : 'Index with RAG Engine'}</span>
            </button>
          </form>
        </div>

        <div className="p-6 rounded-2xl bg-[#12121A] border border-[#232332] space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Search size={14} className="text-purple-400" />
              <span>RAG Semantic Search Tester</span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Test how the RAG model retrieves the most relevant semantic chunks from your uploaded materials given any study query or test question.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask or search your documents..."
                className="flex-1 px-3 py-2 rounded-xl bg-[#171724] border border-[#28283C] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2 rounded-xl bg-[#222234] hover:bg-purple-600 text-white font-medium text-xs transition-all disabled:opacity-50"
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </form>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {searchResults.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#151520] border border-[#20202E] text-center text-[11px] text-zinc-500">
                  Search query results will appear here with relevance scores.
                </div>
              ) : (
                searchResults.map((res) => (
                  <div
                    key={res.id}
                    className="p-3 rounded-xl bg-[#161622] border border-purple-500/30 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-purple-300">{res.title}</span>
                      <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                        Score: {res.score}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-[11px] line-clamp-3">{res.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
            <Sparkles size={12} className="text-orange-400" />
            <span>Retrieved passages are automatically injected into Blast's prompts.</span>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#12121A] border border-[#232332] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <FolderGit2 size={14} className="text-purple-400" />
            <span>Ingested Documents ({documents.length})</span>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 bg-[#161622] rounded-xl border border-[#20202E]">
            No documents uploaded yet. Add lecture slides, notes, or articles above to build your private study index.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-[#161622] border border-[#252538] flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-xs text-white tracking-wide">{doc.title}</h3>
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                      title="Delete document"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-400">
                    <span className="uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {doc.sourceType}
                    </span>
                    <span>{doc.chunks.length} Chunks</span>
                    <span>•</span>
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400 line-clamp-2 bg-[#1A1A28] p-2 rounded-lg border border-[#242436]">
                  {doc.rawContent}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
