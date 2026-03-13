import { useMemo } from 'react';
import { Assistant } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface AssistantMeetingTrackerProps {
  assistant: Assistant;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function AssistantMeetingTracker({ assistant }: AssistantMeetingTrackerProps) {
  const { state } = useApp();

  // Get current week boundaries (Mon–Sun)
  const { weekStart, weekEnd } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { weekStart: start, weekEnd: end };
  }, []);

  // All meetings this week
  const thisWeekMeetings = useMemo(() =>
    state.calendarEvents
      .filter((e) => {
        const d = new Date(e.startTime);
        return d >= weekStart && d <= weekEnd;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [state.calendarEvents, weekStart, weekEnd]
  );

  const now = new Date();
  const pastMeetings = thisWeekMeetings.filter((e) => new Date(e.endTime) < now);
  const upcomingMeetings = thisWeekMeetings.filter((e) => new Date(e.endTime) >= now);

  // Meetings the assistant should have managed/attended
  // For the MVP, we consider all meetings as ones the assistant should be tracking
  const missedCount = assistant.expectedMeetingIds.filter((id) =>
    pastMeetings.some((m) => m.id === id)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          This Week: {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500">{thisWeekMeetings.length} total meetings</span>
          <span className="text-gray-500">{pastMeetings.length} completed</span>
          {missedCount > 0 && (
            <span className="text-red-600 font-medium">{missedCount} missed</span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Review the week's meetings to track {assistant.name}'s performance. Did they prepare materials on time? Send follow-ups? Handle scheduling well?
      </p>

      {/* Past meetings */}
      {pastMeetings.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Completed
          </h4>
          <div className="space-y-2">
            {pastMeetings.map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{event.title}</p>
                  <p className="text-xs text-gray-400">
                    {formatDayLabel(new Date(event.startTime))} · {formatTime(event.startTime)}–{formatTime(event.endTime)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gray-400">{event.attendees.length} attendees</span>
                  {event.attendees.some((a) => a.isExternal) && (
                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">External</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming meetings */}
      {upcomingMeetings.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Upcoming
          </h4>
          <div className="space-y-2">
            {upcomingMeetings.map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatDayLabel(new Date(event.startTime))} · {formatTime(event.startTime)}–{formatTime(event.endTime)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gray-400">{event.attendees.length} attendees</span>
                  {event.attendees.some((a) => a.isExternal) && (
                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">External</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {thisWeekMeetings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No meetings this week</p>
          <p className="text-sm mt-1">Calendar events will appear when you load a case</p>
        </div>
      )}
    </div>
  );
}
