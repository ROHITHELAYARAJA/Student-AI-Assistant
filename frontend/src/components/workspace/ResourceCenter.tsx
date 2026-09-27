import React, { useState, useRef } from 'react';
import {
  Upload, FileText, FileSpreadsheet, FileCode, CheckCircle2,
  Sparkles, ExternalLink, Trash2, Loader2, ArrowRight, BookOpen,
  Layers, HelpCircle, Compass, Headphones, File
} from 'lucide-react';
import { TurboStudyPack } from '../../types/turbo';
import { request, uploadDocumentFile, createStudy, StudySettings } from '../../services/studyApi';
import { SourceViewer } from './SourceViewer';

interface ResourceCenterProps {
  pack: TurboStudyPack;
  save: (p: TurboStudyPack) => Promise<void>;
  notify: (s: string) => void;
  onStudyPackUpdated?: (newPack: TurboStudyPack) => void;
  onNavigateTab: (tab: 'learn' | 'notes' | 'cards' | 'quiz' | 'audio') => void;
}

export const ResourceCenter: React.FC<ResourceCenterProps> = ({
  pack,
  save,
  notify,
  onStudyPackUpdated,
  onNavigateTab
}) => {
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Attached document IDs
  const docIds = pack.documentIds || [];

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setUploading(true);
    try {
      const doc = await uploadDocumentFile(file);

      // Add document ID to this notebook
      const updatedDocIds = [...new Set([...docIds, doc.id])];
      const updatedPack: TurboStudyPack = {
        ...pack,
        documentIds: updatedDocIds,
        sources: [
          ...pack.sources,
          {
            id: `src_${Date.now()}`,
            documentId: doc.id,
            title: file.name,
            summary: doc.text?.slice(0, 300) || 'Uploaded study document',
            excerpt: doc.text?.slice(0, 300) || '',
            category: file.name.endsWith('.pdf') ? 'PDF Document' : file.name.match(/\.(xlsx?|csv)$/i) ? 'Spreadsheet Data' : 'Study Resource',
            keyTakeaways: [],
            relevance: 'Uploaded resource source material',
            sourceUrl: `/api/documents/${doc.id}/file`,
            page: 1
          }
        ]
      };

      await save(updatedPack);
      if (onStudyPackUpdated) onStudyPackUpdated(updatedPack);
      notify(`"${file.name}" uploaded and attached to this study pack.`);
    } catch (err: any) {
      notify('Failed to upload file: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateFromResources = async () => {
    if (docIds.length === 0) {
      notify('Please upload at least one resource document first.');
      return;
    }

    setGenerating(true);
    setGenerationPhase('Analyzing resource documents...');
    try {
      const settings: StudySettings = { questionCount: 5, cardCount: 8, difficulty: 'beginner', language: 'English' };
      const newPack = await createStudy(
        `Synthesize study materials from resources for: ${pack.topic}`,
        docIds,
        settings,
        phase => setGenerationPhase(phase)
      );

      if (onStudyPackUpdated) onStudyPackUpdated(newPack);
      notify('Complete study pack successfully generated from your resources!');
      onNavigateTab('notes');
    } catch (err: any) {
      notify('Generation error: ' + (err.message || 'Failed to generate study pack'));
    } finally {
      setGenerating(false);
    }
  };

  const getFileIcon = (title: string) => {
    if (/\.pdf$/i.test(title)) return <FileText size={20} color="#f87171" />;
    if (/\.(xlsx?|csv)$/i.test(title)) return <FileSpreadsheet size={20} color="#34d399" />;
    if (/\.(docx?)$/i.test(title)) return <FileText size={20} color="#60a5fa" />;
    return <FileCode size={20} color="#c084fc" />;
  };

  return (
    <div className="resource-center-container" style={{ maxWidth: '980px', margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#a78bfa', textTransform: 'uppercase' }}>
          RESOURCE HUB
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: '6px 0 8px 0' }}>
          Study Resources & Source Materials
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, lineHeight: 1.5 }}>
          Upload your PDFs, Word documents, Excel sheets, and lecture notes. Blast AI uses these documents to generate your notes, flashcards, roadmap, and quiz.
        </p>
      </div>

      {/* Upload Drag & Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging ? '2px dashed #8b5cf6' : '1px dashed rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          background: isDragging ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255, 255, 255, 0.02)',
          padding: '36px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '32px',
          transition: 'all 0.2s ease'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,image/*"
          style={{ display: 'none' }}
          onChange={e => handleFileUpload(e.target.files)}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a78bfa'
            }}
          >
            {uploading ? <Loader2 size={24} className="spin" /> : <Upload size={24} />}
          </div>

          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: '0 0 4px 0' }}>
              {uploading ? 'Processing & Analyzing Document…' : 'Drop your resources here or click to browse'}
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.45)', margin: 0 }}>
              Supports PDF, Word (.docx), Excel (.xlsx, .csv), Markdown, TXT, and Images (up to 15MB)
            </p>
          </div>

          {/* Format Chips */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '3px 8px', borderRadius: '6px' }}>PDF</span>
            <span style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '3px 8px', borderRadius: '6px' }}>DOC / DOCX</span>
            <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '3px 8px', borderRadius: '6px' }}>EXCEL / CSV</span>
            <span style={{ fontSize: '11px', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', padding: '3px 8px', borderRadius: '6px' }}>TEXT & NOTES</span>
          </div>
        </div>
      </div>

      {/* Generator Banner if resources are attached */}
      {docIds.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(30, 27, 58, 0.7) 0%, rgba(20, 22, 33, 0.9) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#a78bfa" />
              <span>AI Study Pack Generator</span>
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
              Generate complete notes, flashcards, knowledge quiz, and learning roadmap grounded directly in your uploaded files.
            </p>
          </div>

          <button
            type="button"
            disabled={generating}
            onClick={handleGenerateFromResources}
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 22px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: generating ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)'
            }}
          >
            {generating ? (
              <>
                <Loader2 size={15} className="spin" />
                <span>{generationPhase || 'Generating...'}</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Generate from Resources</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      )}

      {/* Attached Resources List */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 16px 0' }}>
          Attached Resources ({pack.sources.length})
        </h2>

        {pack.sources.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <BookOpen size={32} color="rgba(255,255,255,0.25)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '15px', color: '#ffffff', margin: '0 0 6px 0' }}>No resources attached yet</h4>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Upload class slides, PDFs, or homework problems above to build your study pack.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pack.sources.map((src, i) => (
              <div
                key={src.id || i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '14px',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {getFileIcon(src.title)}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#f3f4f6', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {src.title.replace(/Verified /g, '')}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
                      <span>{src.category}</span>
                      <span>•</span>
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={11} /> Ready
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {src.sourceUrl && (
                    <a
                      href={src.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.75)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none'
                      }}
                    >
                      <ExternalLink size={13} />
                      <span>View File</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Embedded Document Viewer if available */}
      {docIds.length > 0 && (
        <div style={{ marginTop: '36px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '14px' }}>
            Resource Preview
          </h3>
          <SourceViewer pack={pack} />
        </div>
      )}
    </div>
  );
};
