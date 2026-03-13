import { useState } from 'react';
import { CalendarEvent } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface CalendarNudgeBannerProps {
  event: CalendarEvent;
  type: 'pre-meeting' | 'post-meeting';
}

export function CalendarNudgeBanner({ event, type }: CalendarNudgeBannerProps) {
  const { state, triggerPreMeetingNudge, triggerPostMeetingNudge } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);

  const superviseeAttendees = event.attendees.filter((a) => a.superviseeId);
  const undebriefedSupervisees = superviseeAttendees.filter((a) =>
    !state.meetingDebriefs.some(
      (d) => d.calendarEventId === event.id && d.superviseeId === a.superviseeId
    )
  );

  if (type === 'pre-meeting') {
    const handlePrepare = async (superviseeId: string) => {
      const supervisee = state.supervisees.find((s) => s.id === superviseeId);
      if (!supervisee) return;

      setIsGenerating(true);
      try {
        const matches = event.matchedOpportunities.filter(
          (m) => m.superviseeId === superviseeId
        );
        const tips = matches.map((m) => `- **${m.opportunityLabel}**: ${m.coachingTip}`).join('\n');

        let content = `**Upcoming: ${event.title}**\n\n`;
        content += `${supervisee.name} has development opportunities relevant to this meeting:\n\n`;
        content += tips;
        content += `\n\nTake a moment to think about how you can create space for ${supervisee.name} to practice these skills during the meeting.`;

        // Try to get AI-generated prep advice
        try {
          const { generatePreMeetingCoaching } = await import('../../services/gemini');
          const aiContent = await generatePreMeetingCoaching(supervisee, event, matches);
          if (aiContent) {
            content = aiContent;
          }
        } catch {
          // Fallback content is fine
        }

        triggerPreMeetingNudge(supervisee, event, content);
      } finally {
        setIsGenerating(false);
      }
    };

    return (
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 rounded-full p-2 flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800">
              Tomorrow: {event.title}
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              This meeting has coaching opportunities for your supervisees. Prepare now to make the most of it.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {superviseeAttendees.map((attendee) => {
                const matches = event.matchedOpportunities.filter(
                  (m) => m.superviseeId === attendee.superviseeId
                );
                if (matches.length === 0) return null;
                return (
                  <button
                    key={attendee.superviseeId}
                    onClick={() => handlePrepare(attendee.superviseeId!)}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-800 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                    Prep for {attendee.name}
                    <span className="text-xs bg-amber-300 px-1.5 py-0.5 rounded">
                      {matches.length} opp{matches.length > 1 ? 's' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Post-meeting debrief banner
  return (
    <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-800">
            Debrief: {event.title}
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            This meeting has ended. How did your supervisees do? Take a moment to capture your observations.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {undebriefedSupervisees.map((attendee) => {
              const supervisee = state.supervisees.find(
                (s) => s.id === attendee.superviseeId
              );
              if (!supervisee) return null;
              return (
                <button
                  key={attendee.superviseeId}
                  onClick={() => triggerPostMeetingNudge(supervisee, event)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Debrief on {attendee.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
