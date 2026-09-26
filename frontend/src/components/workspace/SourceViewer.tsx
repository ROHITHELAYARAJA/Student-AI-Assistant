import React, { useState } from 'react';
import { TurboStudyPack } from '../../types/turbo';

export function SourceViewer({ pack }: { pack: TurboStudyPack }) {
  const documents = [...new Set(pack.documentIds || [])];
  const [selected, setSelected] = useState(documents[0] || '');
  if (!documents.length) return null;
  const documentId = documents.includes(selected) ? selected : documents[0];
  const url = `/api/documents/${encodeURIComponent(documentId)}/file`;
  return <section className="original-source">
    <div className="source-viewer-toolbar"><label>Source <select value={documentId} onChange={e => setSelected(e.target.value)}>
      {documents.map((id, i) => <option key={id} value={id}>{pack.sources.find(source => source.documentId === id)?.title || `Document ${i + 1}`}</option>)}
    </select></label><a href={url} target="_blank" rel="noopener noreferrer">Open original</a></div>
    <iframe key={documentId} title="Original study material" src={url} />
    <p className="source-viewer-help">If the preview does not appear, choose Open original to read your source.</p>
  </section>;
}
