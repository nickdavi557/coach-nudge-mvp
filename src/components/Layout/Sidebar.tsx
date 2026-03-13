import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { getInitials } from '../../utils/helpers';
import { Supervisee, Track, Assistant } from '../../types';

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
          {supervisee.developmentOpportunities.length} dev opps · {supervisee.notes.length} notes
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

function AssistantLink({ assistant, isActive }: { assistant: Assistant; isActive: boolean }) {
  return (
    <Link
      to={`/assistant/${assistant.id}`}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-teal-50 text-teal-700'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isActive
            ? 'bg-teal-600 text-white'
            : 'bg-teal-100 text-teal-600'
        }`}
      >
        {getInitials(assistant.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{assistant.name}</p>
        <p className="text-xs text-gray-500">
          {assistant.notes.length} notes · {assistant.improvementAreas.length} areas
        </p>
      </div>
    </Link>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  badge?: number;
}

function NavItem({ to, icon, label, isActive, badge }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-bain-red text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="font-medium flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
          isActive ? 'bg-white text-bain-red' : 'bg-amber-100 text-amber-700'
        }`}>
          {badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const { state, getMatchedOpportunities } = useApp();
  const location = useLocation();

  const gcSupervisees = state.supervisees.filter((s) => s.track === 'GC');
  const aisSupervisees = state.supervisees.filter((s) => s.track === 'AIS');

  // Count nudgeable events (tomorrow's events with matched opportunities)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nudgeableCount = state.calendarEvents.filter((e) => {
    const eventDate = new Date(e.startTime);
    return eventDate.toDateString() === tomorrow.toDateString()
      && getMatchedOpportunities(e).length > 0;
  }).length;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-1">
        <NavItem
          to="/"
          isActive={location.pathname === '/'}
          label="Dashboard"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        />
        <NavItem
          to="/calendar"
          isActive={location.pathname === '/calendar'}
          label="Calendar"
          badge={nudgeableCount}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <NavItem
          to="/settings"
          isActive={location.pathname === '/settings'}
          label="Nudge Settings"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
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

          {/* Assistants section */}
          {state.assistants.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 px-3 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                  Assistants
                </span>
                <span className="text-xs text-gray-400">({state.assistants.length})</span>
              </div>
              <div className="space-y-1">
                {state.assistants.map((assistant) => (
                  <AssistantLink
                    key={assistant.id}
                    assistant={assistant}
                    isActive={location.pathname === `/assistant/${assistant.id}`}
                  />
                ))}
              </div>
            </div>
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
