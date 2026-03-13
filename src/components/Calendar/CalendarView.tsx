import { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { CalendarEvent } from '../../types';
import { CalendarEventCard } from './CalendarEventCard';
import { CalendarNudgeBanner } from './CalendarNudgeBanner';
import { TestNudgePanel } from './TestNudgePanel';

type ViewMode = 'week' | 'list';

function getWeekDays(baseDate: Date): Date[] {
  const start = new Date(baseDate);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

function isTomorrow(d: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(d, tomorrow);
}

function isPast(d: Date): boolean {
  return d < new Date();
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function CalendarView() {
  const { state, getMatchedOpportunities } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [weekOffset, setWeekOffset] = useState(0);

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDays = useMemo(() => getWeekDays(baseDate), [baseDate]);

  // Enrich events with matched opportunities
  const enrichedEvents = useMemo(() =>
    state.calendarEvents.map((event) => ({
      ...event,
      matchedOpportunities: getMatchedOpportunities(event),
    })),
    [state.calendarEvents, getMatchedOpportunities]
  );

  // Events that need attention (tomorrow's events with matched opportunities)
  const nudgeableEvents = useMemo(() =>
    enrichedEvents.filter((e) =>
      isTomorrow(new Date(e.startTime)) && e.matchedOpportunities.length > 0
    ),
    [enrichedEvents]
  );

  // Past events with supervisees that haven't been debriefed
  const debriefableEvents = useMemo(() =>
    enrichedEvents.filter((e) => {
      const eventTime = new Date(e.endTime);
      if (!isPast(eventTime)) return false;
      const hasSupervisees = e.attendees.some((a) => a.superviseeId);
      if (!hasSupervisees) return false;
      const hasExternalAttendees = e.attendees.some((a) => a.isExternal);
      if (!hasExternalAttendees) return false;
      // Check if already debriefed
      const superviseeAttendees = e.attendees.filter((a) => a.superviseeId);
      const allDebriefed = superviseeAttendees.every((a) =>
        state.meetingDebriefs.some(
          (d) => d.calendarEventId === e.id && d.superviseeId === a.superviseeId
        )
      );
      return !allDebriefed;
    }),
    [enrichedEvents, state.meetingDebriefs]
  );

  const eventsForDay = (day: Date): CalendarEvent[] =>
    enrichedEvents
      .filter((e) => isSameDay(new Date(e.startTime), day))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const upcomingEvents = useMemo(() =>
    enrichedEvents
      .filter((e) => new Date(e.startTime) >= new Date())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [enrichedEvents]
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upcoming meetings with coaching opportunities highlighted
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              viewMode === 'week'
                ? 'bg-bain-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-bain-red text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Test panel for simulating nudges */}
      <TestNudgePanel events={enrichedEvents} />

      {/* Nudge banners */}
      {nudgeableEvents.length > 0 && (
        <div className="mb-6 space-y-3">
          {nudgeableEvents.map((event) => (
            <CalendarNudgeBanner key={event.id} event={event} type="pre-meeting" />
          ))}
        </div>
      )}

      {debriefableEvents.length > 0 && (
        <div className="mb-6 space-y-3">
          {debriefableEvents.map((event) => (
            <CalendarNudgeBanner key={`debrief-${event.id}`} event={event} type="post-meeting" />
          ))}
        </div>
      )}

      {viewMode === 'week' ? (
        <div>
          {/* Week navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-gray-900">
                {MONTH_LABELS[weekDays[0].getMonth()]} {weekDays[0].getDate()} – {MONTH_LABELS[weekDays[6].getMonth()]} {weekDays[6].getDate()}, {weekDays[6].getFullYear()}
              </span>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="text-xs text-bain-red hover:underline"
                >
                  Today
                </button>
              )}
            </div>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day columns */}
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map((day, i) => {
              const dayEvents = eventsForDay(day);
              const today = isToday(day);
              return (
                <div key={i} className={`min-h-[200px] ${today ? 'ring-2 ring-bain-red ring-opacity-30 rounded-lg' : ''}`}>
                  <div className={`text-center py-2 rounded-t-lg ${today ? 'bg-bain-red text-white' : 'bg-gray-50 text-gray-600'}`}>
                    <div className="text-xs font-medium">{DAY_LABELS[i]}</div>
                    <div className="text-lg font-bold">{day.getDate()}</div>
                  </div>
                  <div className="space-y-2 p-1 mt-1">
                    {dayEvents.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No events</p>
                    ) : (
                      dayEvents.map((event) => (
                        <CalendarEventCard key={event.id} event={event} compact />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No upcoming events</p>
              <p className="text-sm mt-1">Calendar events will appear when you load a case</p>
            </div>
          ) : (
            upcomingEvents.map((event) => (
              <CalendarEventCard key={event.id} event={event} compact={false} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
