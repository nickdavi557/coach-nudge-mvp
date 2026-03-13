import { useState } from 'react';
import { CalendarEvent } from '../../types';

const EVENT_TYPE_COLORS: Record<string, string> = {
  'client-meeting': 'bg-blue-100 text-blue-700 border-blue-200',
  'presentation': 'bg-purple-100 text-purple-700 border-purple-200',
  'workshop': 'bg-green-100 text-green-700 border-green-200',
  'internal-review': 'bg-gray-100 text-gray-600 border-gray-200',
  'one-on-one': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'team-standup': 'bg-gray-100 text-gray-500 border-gray-200',
  'other': 'bg-gray-100 text-gray-600 border-gray-200',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  'client-meeting': 'Client Meeting',
  'presentation': 'Presentation',
  'workshop': 'Workshop',
  'internal-review': 'Internal Review',
  'one-on-one': '1:1',
  'team-standup': 'Standup',
  'other': 'Other',
};

const EVENT_TYPE_DOTS: Record<string, string> = {
  'client-meeting': 'bg-blue-500',
  'presentation': 'bg-purple-500',
  'workshop': 'bg-green-500',
  'internal-review': 'bg-gray-400',
  'one-on-one': 'bg-yellow-500',
  'team-standup': 'bg-gray-400',
  'other': 'bg-gray-400',
};

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateLabel(date: Date): string {
  const now = new Date();
  const eventDate = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (eventDate.toDateString() === now.toDateString()) return 'Today';
  if (eventDate.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

interface CalendarEventCardProps {
  event: CalendarEvent;
  compact: boolean;
}

export function CalendarEventCard({ event, compact }: CalendarEventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMatches = event.matchedOpportunities.length > 0;
  const isPast = new Date(event.endTime) < new Date();

  if (compact) {
    return (
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full text-left p-2 rounded-lg border transition-all ${
          hasMatches
            ? 'border-amber-300 bg-amber-50 hover:bg-amber-100'
            : isPast
              ? 'border-gray-200 bg-gray-50 opacity-60'
              : 'border-gray-200 bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex items-start gap-1.5">
          <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${EVENT_TYPE_DOTS[event.eventType]}`} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-900 truncate">{event.title}</p>
            <p className="text-xs text-gray-500">{formatTime(event.startTime)}</p>
            {hasMatches && (
              <div className="flex items-center gap-1 mt-1">
                <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-amber-600 font-medium">
                  {event.matchedOpportunities.length} coaching opp{event.matchedOpportunities.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
            <p className="text-gray-600 mb-1">{event.description}</p>
            {event.location && (
              <p className="text-gray-400">{event.location}</p>
            )}
            <div className="mt-1.5">
              {event.attendees.map((a, i) => (
                <span key={i} className={`inline-block mr-1 mb-1 px-1.5 py-0.5 rounded text-xs ${
                  a.isExternal ? 'bg-blue-50 text-blue-600' : a.superviseeId ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {a.name}
                </span>
              ))}
            </div>
            {hasMatches && (
              <div className="mt-2 space-y-1">
                {event.matchedOpportunities.map((m, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-200 rounded p-1.5">
                    <p className="font-medium text-amber-700">{m.superviseeName}: {m.opportunityLabel}</p>
                    <p className="text-amber-600 mt-0.5">{m.coachingTip}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </button>
    );
  }

  // Full card view (list mode)
  return (
    <div className={`card ${hasMatches ? 'ring-2 ring-amber-300 ring-opacity-50' : ''} ${isPast ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${EVENT_TYPE_COLORS[event.eventType]}`}>
              {EVENT_TYPE_LABELS[event.eventType]}
            </span>
            <span className="text-xs text-gray-400">
              {formatDateLabel(event.startTime)}
            </span>
            {hasMatches && (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                </svg>
                Coaching Opportunity
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
        </div>
        <div className="text-right text-sm text-gray-500 ml-4 flex-shrink-0">
          <p className="font-medium">{formatTime(event.startTime)}</p>
          <p>{formatTime(event.endTime)}</p>
          {event.location && (
            <p className="text-xs text-gray-400 mt-1">{event.location}</p>
          )}
        </div>
      </div>

      {/* Attendees */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {event.attendees.map((attendee, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              attendee.isExternal
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : attendee.superviseeId
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
            }`}
          >
            {attendee.superviseeId && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            )}
            {attendee.isExternal && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            )}
            {attendee.name}
          </span>
        ))}
      </div>

      {/* Matched opportunities */}
      {hasMatches && (
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Development Opportunities Matched
          </h4>
          {event.matchedOpportunities.map((match, i) => (
            <div key={i} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-amber-800">{match.superviseeName}</span>
                <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                  {match.opportunityLabel}
                </span>
              </div>
              <p className="text-sm text-amber-700">{match.coachingTip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
