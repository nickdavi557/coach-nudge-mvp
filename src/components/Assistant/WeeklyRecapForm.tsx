import { useState, useMemo } from 'react';
import { Assistant } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { formatDate } from '../../utils/helpers';

interface WeeklyRecapFormProps {
  assistant: Assistant;
}

export function WeeklyRecapForm({ assistant }: WeeklyRecapFormProps) {
  const { state, submitWeeklyRecap } = useApp();
  const [feedback, setFeedback] = useState('');
  const [missedMeetingIds, setMissedMeetingIds] = useState<string[]>([]);

  // Current week boundaries
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

  // Past meetings this week
  const pastMeetingsThisWeek = useMemo(() =>
    state.calendarEvents
      .filter((e) => {
        const d = new Date(e.startTime);
        return d >= weekStart && d <= weekEnd && new Date(e.endTime) < new Date();
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [state.calendarEvents, weekStart, weekEnd]
  );

  // Existing recaps for this assistant
  const existingRecaps = state.weeklyRecaps
    .filter((r) => r.assistantId === assistant.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Check if already submitted this week
  const alreadySubmittedThisWeek = existingRecaps.some((r) => {
    const recapStart = new Date(r.weekStart);
    return recapStart.toDateString() === weekStart.toDateString();
  });

  const toggleMissedMeeting = (meetingId: string) => {
    setMissedMeetingIds((prev) =>
      prev.includes(meetingId)
        ? prev.filter((id) => id !== meetingId)
        : [...prev, meetingId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    submitWeeklyRecap(assistant.id, weekStart, weekEnd, missedMeetingIds, feedback.trim());
    setFeedback('');
    setMissedMeetingIds([]);
  };

  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="space-y-6">
      {/* Submit new recap */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-1">
          Weekly Recap: {weekLabel}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          How did {assistant.name} perform this week? Flag any missed meetings and provide overall feedback.
        </p>

        {alreadySubmittedThisWeek ? (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-700">
            You've already submitted a recap for this week. Check the history below.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Missed meetings selector */}
            {pastMeetingsThisWeek.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Were any meetings missed or poorly handled?
                </label>
                <div className="space-y-2">
                  {pastMeetingsThisWeek.map((event) => {
                    const isMissed = missedMeetingIds.includes(event.id);
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => toggleMissedMeeting(event.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg border text-left transition-colors ${
                          isMissed
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isMissed ? 'border-red-500 bg-red-500' : 'border-gray-300'
                        }`}>
                          {isMissed && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isMissed ? 'text-red-700' : 'text-gray-700'}`}>
                            {event.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'short' })} ·{' '}
                            {new Date(event.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {missedMeetingIds.length > 0 && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {missedMeetingIds.length} meeting{missedMeetingIds.length > 1 ? 's' : ''} flagged
                  </p>
                )}
              </div>
            )}

            {/* Feedback */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Overall feedback for the week
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={`How did ${assistant.name} do overall? What went well? What could improve?`}
                className="input w-full"
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={!feedback.trim()}
              className="btn-primary text-sm"
            >
              Submit Weekly Recap
            </button>
          </form>
        )}
      </div>

      {/* Past recaps */}
      {existingRecaps.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Recap History
          </h3>
          <div className="space-y-3">
            {existingRecaps.map((recap) => (
              <div key={recap.id} className="card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-teal-700">{recap.weekLabel}</span>
                  <span className="text-xs text-gray-400">{formatDate(recap.createdAt)}</span>
                  {recap.missedMeetingIds.length > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                      {recap.missedMeetingIds.length} missed
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700">{recap.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
