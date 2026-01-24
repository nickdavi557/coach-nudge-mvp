import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { getInitials } from '../../utils/helpers';
import { Supervisee, Track } from '../../types';

function SuperviseeLink({ supervisee, isActive }: { supervisee: Supervisee; isActive: boolean }) {
  return (
    <Link
      to={`/supervisee/${supervisee.id}`}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-red-50 text-bain-red'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isActive
            ? 'bg-bain-red text-white'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {getInitials(supervisee.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{supervisee.name}</p>
        <p className="text-xs text-gray-500">
          {supervisee.notes.length} notes
        </p>
      </div>
    </Link>
  );
}

function TrackSection({ track, label, supervisees, currentPath }: {
  track: Track;
  label: string;
  supervisees: Supervisee[];
  currentPath: string;
}) {
  if (supervisees.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 px-3 mb-2">
        <span className={`text-xs font-semibold uppercase tracking-wider ${
          track === 'GC' ? 'text-blue-600' : 'text-purple-600'
        }`}>
          {label}
        </span>
        <span className="text-xs text-gray-400">({supervisees.length})</span>
      </div>
      <div className="space-y-1">
        {supervisees.map((supervisee) => (
          <SuperviseeLink
            key={supervisee.id}
            supervisee={supervisee}
            isActive={currentPath === `/supervisee/${supervisee.id}`}
          />
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { state } = useApp();
  const location = useLocation();

  const gcSupervisees = state.supervisees.filter((s) => s.track === 'GC');
  const aisSupervisees = state.supervisees.filter((s) => s.track === 'AIS');

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/'
              ? 'bg-bain-red text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="font-medium">Dashboard</span>
        </Link>
      </div>

      {state.caseCode ? (
        <nav className="px-4 pb-4">
          <TrackSection
            track="GC"
            label="GC"
            supervisees={gcSupervisees}
            currentPath={location.pathname}
          />
          <TrackSection
            track="AIS"
            label="AIS"
            supervisees={aisSupervisees}
            currentPath={location.pathname}
          />

          {state.supervisees.length === 0 && (
            <p className="text-sm text-gray-500 px-3 py-2">No team members loaded</p>
          )}
        </nav>
      ) : (
        <div className="px-4">
          <p className="text-sm text-gray-500 px-3 py-2">
            Enter a case code to see your team
          </p>
        </div>
      )}
    </aside>
  );
}
