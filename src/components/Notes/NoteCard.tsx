import { useState } from 'react';
import { Note } from '../../types';
import { formatRelativeTime } from '../../utils/helpers';
import { useApp } from '../../contexts/AppContext';

interface NoteCardProps {
  note: Note;
  superviseeId: string;
}

export function NoteCard({ note, superviseeId }: NoteCardProps) {
  const { updateNote, deleteNote } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    if (!editContent.trim()) return;
    updateNote(superviseeId, { ...note, content: editContent.trim() });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Delete this note?')) {
      deleteNote(superviseeId, note.id);
    }
  };

  return (
    <div className="card group">
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="textarea"
            rows={3}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button onClick={handleCancel} className="btn-ghost text-sm">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary text-sm">
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {formatRelativeTime(note.createdAt)}
              </span>
              {note.source === 'nudge' && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-bain-red/10 text-bain-red rounded">
                  From Nudge
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Edit note"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Delete note"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-gray-700 mt-2 whitespace-pre-wrap">{note.content}</p>
        </>
      )}
    </div>
  );
}
