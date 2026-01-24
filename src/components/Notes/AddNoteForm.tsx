import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

interface AddNoteFormProps {
  superviseeId: string;
}

export function AddNoteForm({ superviseeId }: AddNoteFormProps) {
  const { addNote } = useApp();
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addNote(superviseeId, content.trim(), 'manual');
    setContent('');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full card text-left text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add a note...</span>
        </div>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="textarea"
        rows={3}
        placeholder="What did you observe? Any wins, challenges, or patterns?"
        autoFocus
      />
      <div className="flex justify-end gap-2 mt-3">
        <button
          type="button"
          onClick={() => {
            setContent('');
            setIsExpanded(false);
          }}
          className="btn-ghost text-sm"
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary text-sm" disabled={!content.trim()}>
          Add Note
        </button>
      </div>
    </form>
  );
}
