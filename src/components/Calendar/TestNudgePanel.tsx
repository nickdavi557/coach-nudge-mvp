import { useState } from 'react';
import { CalendarEvent } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface TestNudgePanelProps {
  events: CalendarEvent[];
}

function formatEventLabel(event: CalendarEvent): string {
  const date = new Date(event.startTime);
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dayStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return `${event.title} (${dayStr} ${timeStr})`;
}

export function TestNudgePanel({ events }: TestNudgePanelProps) {
  const { state, triggerPreMeetingNudge, triggerPostMeetingNudge, getMatchedOpportunities } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Events that have at least one supervisee attendee
  const eventsWithSupervisees = events.filter((e) =>
    e.attendees.some((a) => a.superviseeId)
  );

  // Events with coaching opportunities (for pre-meeting)
  const coachableEvents = eventsWithSupervisees.filter((e) =>
    getMatchedOpportunities(e).length > 0
  );

  // Events with external attendees + supervisees (for post-meeting)
  const debriefableEvents = eventsWithSupervisees.filter((e) =>
    e.attendees.some((a) => a.isExternal)
  );

  const handleTestPreMeeting = async (event: CalendarEvent) => {
    const matches = getMatchedOpportunities(event);
    if (matches.length === 0) return;

    // Pick the first supervisee with a match
    const firstMatch = matches[0];
    const supervisee = state.supervisees.find((s) => s.id === firstMatch.superviseeId);
    if (!supervisee) return;

    setIsGenerating(true);
    try {
      const superviseeMatches = matches.filter((m) => m.superviseeId === supervisee.id);
      const tips = superviseeMatches.map((m) => `- **${m.opportunityLabel}**: ${m.coachingTip}`).join('\n');

      let content = `**Upcoming: ${event.title}**\n\n`;
      content += `${supervisee.name} has development opportunities relevant to this meeting:\n\n`;
      content += tips;
      content += `\n\nTake a moment to think about how you can create space for ${supervisee.name} to practice these skills during the meeting.`;

      try {
        const { generatePreMeetingCoaching } = await import('../../services/gemini');
        const aiContent = await generatePreMeetingCoaching(supervisee, event, superviseeMatches);
        if (aiContent) content = aiContent;
      } catch {
        // Fallback is fine
      }

      triggerPreMeetingNudge(supervisee, event, content);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestPostMeeting = (event: CalendarEvent) => {
    const superviseeAttendee = event.attendees.find((a) => a.superviseeId);
    if (!superviseeAttendee) return;

    const supervisee = state.supervisees.find((s) => s.id === superviseeAttendee.superviseeId);
    if (!supervisee) return;

    triggerPostMeetingNudge(supervisee, event);
  };

  if (!state.caseCode) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        Test Nudge Triggers
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <p className="text-xs text-gray-500">
            Simulate nudges as if meetings are happening. Pre-meeting nudges use AI coaching tips based on matched development opportunities. Post-meeting nudges ask for freeform debrief feedback.
          </p>

          {/* Pre-meeting test triggers */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Pre-Meeting Nudge (coaching prep)
            </h4>
            {coachableEvents.length === 0 ? (
              <p className="text-xs text-gray-400">No events with matched coaching opportunities</p>
            ) : (
              <div className="space-y-2">
                {coachableEvents.map((event) => {
                  const matches = getMatchedOpportunities(event);
                  const superviseeNames = [...new Set(matches.map((m) => m.superviseeName))];
                  return (
                    <button
                      key={`pre-${event.id}`}
                      onClick={() => handleTestPreMeeting(event)}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors text-left disabled:opacity-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formatEventLabel(event)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {superviseeNames.join(', ')} — {matches.length} matched opp{matches.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="flex-shrink-0 ml-3 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                        {isGenerating ? 'Generating...' : 'Test Pre-Meeting'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Post-meeting test triggers */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Post-Meeting Nudge (debrief)
            </h4>
            {debriefableEvents.length === 0 ? (
              <p className="text-xs text-gray-400">No events with supervisees and external attendees</p>
            ) : (
              <div className="space-y-2">
                {debriefableEvents.map((event) => {
                  const superviseeAttendees = event.attendees.filter((a) => a.superviseeId);
                  return (
                    <button
                      key={`post-${event.id}`}
                      onClick={() => handleTestPostMeeting(event)}
                      className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formatEventLabel(event)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {superviseeAttendees.map((a) => a.name).join(', ')}
                        </p>
                      </div>
                      <span className="flex-shrink-0 ml-3 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                        Test Post-Meeting
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
