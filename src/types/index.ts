export type Track = 'GC' | 'AIS';

export interface DevelopmentOpportunity {
  id: string;
  label: string;
  description: string;
}

export const DEFAULT_DEVELOPMENT_OPPORTUNITIES: DevelopmentOpportunity[] = [
  { id: 'client-communication', label: 'Client Communication', description: 'Speaking with and presenting to clients' },
  { id: 'public-speaking', label: 'Public Speaking', description: 'Presenting to groups or leading workshops' },
  { id: 'stakeholder-management', label: 'Stakeholder Management', description: 'Managing relationships with senior stakeholders' },
  { id: 'leading-workstream', label: 'Leading a Workstream', description: 'Owning and driving a workstream independently' },
  { id: 'data-storytelling', label: 'Data Storytelling', description: 'Translating data insights into compelling narratives' },
  { id: 'executive-presence', label: 'Executive Presence', description: 'Building gravitas and confidence in senior settings' },
  { id: 'team-collaboration', label: 'Team Collaboration', description: 'Working effectively across team boundaries' },
  { id: 'problem-structuring', label: 'Problem Structuring', description: 'Breaking down ambiguous problems into clear frameworks' },
  { id: 'negotiation', label: 'Negotiation', description: 'Navigating difficult conversations and negotiations' },
  { id: 'technical-translation', label: 'Technical Translation', description: 'Explaining technical concepts to non-technical audiences' },
];

export interface Supervisee {
  id: string;
  name: string;
  track: Track;
  documents: Document[];
  notes: Note[];
  developmentOpportunities: DevelopmentOpportunity[];
  createdAt: Date;
  lastNudgeAt: Date | null;
}

export interface CaseTeam {
  caseCode: string;
  caseName: string;
  supervisees: Supervisee[];
}

export interface Document {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  source: 'nudge' | 'manual' | 'meeting-debrief';
}

export interface Nudge {
  id: string;
  superviseeId: string;
  supervisee: Supervisee;
  type: 'reflection' | 'coaching' | 'pre-meeting' | 'post-meeting';
  content: string;
  status: 'pending' | 'completed' | 'snoozed' | 'dismissed';
  createdAt: Date;
  snoozedUntil?: Date;
  calendarEventId?: string;
}

export interface NudgeSchedule {
  superviseeId: string;
  coachingEnabled: boolean;
  coachingDays: string[]; // ['monday', 'wednesday'], etc.
  coachingTime: string; // '09:00', '14:00', etc.
  reflectionEnabled: boolean;
  reflectionDays: string[];
  reflectionTime: string;
}

export interface CalendarAttendee {
  name: string;
  email: string;
  isExternal: boolean;
  superviseeId?: string; // links to a Supervisee if this attendee is one
  assistantId?: string; // links to an Assistant if this attendee is one
}

export type CalendarEventType =
  | 'client-meeting'
  | 'internal-review'
  | 'workshop'
  | 'presentation'
  | 'one-on-one'
  | 'team-standup'
  | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  eventType: CalendarEventType;
  attendees: CalendarAttendee[];
  location?: string;
  matchedOpportunities: MatchedOpportunity[];
}

export interface MatchedOpportunity {
  superviseeId: string;
  superviseeName: string;
  opportunityId: string;
  opportunityLabel: string;
  coachingTip: string;
}

export interface MeetingDebrief {
  id: string;
  calendarEventId: string;
  superviseeId: string;
  feedback: string;
  createdAt: Date;
}

// Executive / Manager Assistants

export interface AssistantImprovementArea {
  id: string;
  label: string;
  description: string;
}

export const DEFAULT_ASSISTANT_IMPROVEMENT_AREAS: AssistantImprovementArea[] = [
  { id: 'scheduling', label: 'Scheduling & Calendar Management', description: 'Proactive scheduling, avoiding conflicts, buffer time between meetings' },
  { id: 'follow-ups', label: 'Follow-up & Reminders', description: 'Tracking action items, sending timely reminders, closing loops' },
  { id: 'communication', label: 'Communication & Gatekeeping', description: 'Triaging requests, clear written communication, managing expectations' },
  { id: 'travel-logistics', label: 'Travel & Logistics', description: 'Booking travel, coordinating logistics, backup plans' },
  { id: 'document-prep', label: 'Document & Meeting Prep', description: 'Pre-reads, agendas, materials ready before meetings' },
  { id: 'prioritization', label: 'Prioritization & Judgment', description: 'Knowing what to escalate vs handle, managing competing priorities' },
  { id: 'confidentiality', label: 'Confidentiality & Discretion', description: 'Handling sensitive information appropriately' },
  { id: 'proactiveness', label: 'Proactiveness', description: 'Anticipating needs before being asked, staying ahead of the calendar' },
];

export interface AssistantNote {
  id: string;
  content: string;
  createdAt: Date;
  source: 'manual' | 'weekly-recap';
  weekLabel?: string; // e.g. "Mar 3–7, 2026"
}

export interface Assistant {
  id: string;
  name: string;
  email: string;
  improvementAreas: AssistantImprovementArea[];
  notes: AssistantNote[];
  expectedMeetingIds: string[]; // calendar event IDs they should attend/manage
  createdAt: Date;
}

export interface WeeklyRecap {
  id: string;
  assistantId: string;
  weekStart: Date;
  weekEnd: Date;
  weekLabel: string;
  missedMeetingIds: string[];
  feedback: string;
  createdAt: Date;
}

export interface AppState {
  caseCode: string | null;
  caseName: string | null;
  supervisees: Supervisee[];
  nudges: Nudge[];
  activeNudge: Nudge | null;
  isLoading: boolean;
  schedules: NudgeSchedule[];
  calendarEvents: CalendarEvent[];
  meetingDebriefs: MeetingDebrief[];
  assistants: Assistant[];
  weeklyRecaps: WeeklyRecap[];
}

export type AppAction =
  | { type: 'SET_SUPERVISEES'; payload: Supervisee[] }
  | { type: 'ADD_SUPERVISEE'; payload: Supervisee }
  | { type: 'UPDATE_SUPERVISEE'; payload: Supervisee }
  | { type: 'DELETE_SUPERVISEE'; payload: string }
  | { type: 'ADD_NOTE'; payload: { superviseeId: string; note: Note } }
  | { type: 'UPDATE_NOTE'; payload: { superviseeId: string; note: Note } }
  | { type: 'DELETE_NOTE'; payload: { superviseeId: string; noteId: string } }
  | { type: 'ADD_DOCUMENT'; payload: { superviseeId: string; document: Document } }
  | { type: 'DELETE_DOCUMENT'; payload: { superviseeId: string; documentId: string } }
  | { type: 'SET_NUDGES'; payload: Nudge[] }
  | { type: 'ADD_NUDGE'; payload: Nudge }
  | { type: 'UPDATE_NUDGE'; payload: Nudge }
  | { type: 'COMPLETE_NUDGE_WITH_NOTE'; payload: { nudge: Nudge; note: Note } }
  | { type: 'SET_ACTIVE_NUDGE'; payload: Nudge | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_CASE'; payload: { caseCode: string; caseName: string; supervisees: Supervisee[]; calendarEvents: CalendarEvent[]; assistants: Assistant[] } }
  | { type: 'RESET_DATA' }
  | { type: 'SET_SCHEDULES'; payload: NudgeSchedule[] }
  | { type: 'UPDATE_SCHEDULE'; payload: NudgeSchedule }
  | { type: 'SET_CALENDAR_EVENTS'; payload: CalendarEvent[] }
  | { type: 'ADD_MEETING_DEBRIEF'; payload: MeetingDebrief }
  | { type: 'SET_ASSISTANTS'; payload: Assistant[] }
  | { type: 'ADD_ASSISTANT'; payload: Assistant }
  | { type: 'UPDATE_ASSISTANT'; payload: Assistant }
  | { type: 'DELETE_ASSISTANT'; payload: string }
  | { type: 'ADD_ASSISTANT_NOTE'; payload: { assistantId: string; note: AssistantNote } }
  | { type: 'DELETE_ASSISTANT_NOTE'; payload: { assistantId: string; noteId: string } }
  | { type: 'ADD_WEEKLY_RECAP'; payload: WeeklyRecap };
