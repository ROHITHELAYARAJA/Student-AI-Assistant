import React, { useState } from 'react';
import { TurboStudyPack } from '../../types/turbo';

export function NotesEditor({ pack, save, close, notify }: {
  pack: TurboStudyPack; save: (pack: TurboStudyPack) => Promise<void>;
  close: () => void; notify: (message: string) => void;
}) {
  const [notes, setNotes] = useState(() => JSON.parse(JSON.stringify(pack.notes)) as TurboStudyPack['notes']);
  const [saving, setSaving] = useState(false);
  function section(index: number, changes: Partial<typeof notes.sections[number]>) {
    setNotes(previous => ({ ...previous, sections: previous.sections.map((item, i) => i === index ? { ...item, ...changes } : item) }));
  }
  return <form className="structured-note-editor" onSubmit={async event => {
    event.preventDefault(); if (saving) return; setSaving(true);
    try { await save({ ...pack, notes: { ...notes, lastUpdated: new Date().toISOString() } }); notify('Your edits are saved.'); close(); }
    catch { notify('Could not save your edits. Your draft is still here.'); }
    finally { setSaving(false); }
  }}>
    <label>Title<input required maxLength={200} value={notes.title} onChange={e => setNotes({ ...notes, title: e.target.value })} /></label>
    <label>Overview<textarea maxLength={20000} value={notes.summary} onChange={e => setNotes({ ...notes, summary: e.target.value })} /></label>
    {notes.sections.map((item, index) => <fieldset key={index} disabled={saving}>
      <legend>Section {index + 1}</legend>
      <label>Heading<input maxLength={500} value={item.heading} onChange={e => section(index, { heading: e.target.value })} /></label>
      <label>Notes<textarea className="section-content" maxLength={600000} value={item.content} onChange={e => section(index, { content: e.target.value })} /></label>
      {item.bulletPoints?.map((point, i) => <label key={i}>Key point {i + 1}<textarea maxLength={4000} value={point} onChange={e => section(index, { bulletPoints: item.bulletPoints!.map((value, j) => i === j ? e.target.value : value) })} /></label>)}
      {item.formulas?.map((formula, i) => <label key={i}>Formula {i + 1}<input maxLength={4000} value={formula} onChange={e => section(index, { formulas: item.formulas!.map((value, j) => i === j ? e.target.value : value) })} /></label>)}
      {item.codeSnippet && <label>Code<textarea maxLength={30000} value={item.codeSnippet.code} onChange={e => section(index, { codeSnippet: { ...item.codeSnippet!, code: e.target.value } })} /></label>}
    </fieldset>)}
    <div className="editor-actions"><button className="dark-button" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button><button type="button" className="subtle-button" disabled={saving} onClick={close}>Discard changes</button></div>
  </form>;
}
