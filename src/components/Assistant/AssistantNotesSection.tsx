import { useState } from 'react';
import { Assistant } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { formatDate } from '../../utils/helpers';

interface AssistantNotesSectionProps {
  assistant: Assistant;
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  manual: { label: 'Manual', color: 'bg-gray-100 text-gray-600' },
  'weekly-recap': { label: 'Weekly Recap', color: 'bg-teal-100 text-teal-700' },
};

export function AssistantNotesSection({ assistant }: AssistantNotesSectionProps) {
  const { addAssistantNote, deleteAssistantNote } = useApp();
  const [newNote, setNewNote] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addAssistantNote(assistant.id, newNote.trim(), 'manual');
    setNewNote('');
  };

  const sortedNotes = [...assistant.notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this assistant's performance..."
          className="input flex-1"
        />
        <button type="submit" className="btn-primary text-sm" disabled={!newNote.trim()}>
          Add Note
        </button>
      </form>

      {sortedNotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No notes yet</p>
          <p className="text-sm mt-1">Track performance observations, missed items, and wins</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map((note) => {
            const sourceConfig = SOURCE_LABELS[note.source] || SOURCE_LABELS.manual;
            return (
              <div key={note.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${sourceConfig.color}`}>
                        {sourceConfig.label}
                      </span>
                      {note.weekLabel && (
                        <span className="text-xs text-gray-400">
                          Week of {note.weekLabel}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{note.content}</p>
                  </div>
                  <button
                    onClick={() => deleteAssistantNote(assistant.id, note.id)}
                    className="p-1 text-gray-400 hover:text-red-600 ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
