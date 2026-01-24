import { Supervisee } from '../../types';
import { NoteCard } from './NoteCard';
import { AddNoteForm } from './AddNoteForm';

interface NotesSectionProps {
  supervisee: Supervisee;
}

export function NotesSection({ supervisee }: NotesSectionProps) {
  const sortedNotes = [...supervisee.notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <AddNoteForm superviseeId={supervisee.id} />

      {sortedNotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No notes yet</p>
          <p className="text-sm mt-1">
            Add observations, feedback, or coaching moments
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map((note) => (
            <NoteCard key={note.id} note={note} superviseeId={supervisee.id} />
          ))}
        </div>
      )}
    </div>
  );
}
