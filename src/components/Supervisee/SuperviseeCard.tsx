import { Link } from 'react-router-dom';
import { Supervisee } from '../../types';
import { getInitials, formatRelativeTime } from '../../utils/helpers';

interface SuperviseeCardProps {
  supervisee: Supervisee;
}

export function SuperviseeCard({ supervisee }: SuperviseeCardProps) {
  const lastActivity = supervisee.notes.length > 0
    ? supervisee.notes[supervisee.notes.length - 1].createdAt
    : supervisee.createdAt;

  return (
    <Link
      to={`/supervisee/${supervisee.id}`}
      className="card hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-bain-red rounded-full flex items-center justify-center text-white font-semibold">
          {getInitials(supervisee.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{supervisee.name}</h3>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              supervisee.track === 'GC'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
            }`}>
              {supervisee.track}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {supervisee.notes.length} notes · {supervisee.documents.length} documents
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Last activity: {formatRelativeTime(lastActivity)}
          </p>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
