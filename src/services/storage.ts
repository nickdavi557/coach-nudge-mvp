import { Supervisee, Nudge, NudgeSchedule, CalendarEvent, MeetingDebrief, Assistant, WeeklyRecap } from '../types';

const STORAGE_KEYS = {
  SUPERVISEES: 'coachnudge_supervisees',
  NUDGES: 'coachnudge_nudges',
  CASE_INFO: 'coachnudge_case_info',
  SCHEDULES: 'coachnudge_schedules',
  CALENDAR_EVENTS: 'coachnudge_calendar_events',
  MEETING_DEBRIEFS: 'coachnudge_meeting_debriefs',
  ASSISTANTS: 'coachnudge_assistants',
  WEEKLY_RECAPS: 'coachnudge_weekly_recaps',
};

// Supervisees
export const getSupervisees = (): Supervisee[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SUPERVISEES);
  if (!data) return [];
  const supervisees = JSON.parse(data);
  return supervisees.map((s: Supervisee) => ({
    ...s,
    createdAt: new Date(s.createdAt),
    lastNudgeAt: s.lastNudgeAt ? new Date(s.lastNudgeAt) : null,
    developmentOpportunities: s.developmentOpportunities || [],
    documents: s.documents.map((d) => ({
      ...d,
      uploadedAt: new Date(d.uploadedAt),
    })),
    notes: s.notes.map((n) => ({
      ...n,
      createdAt: new Date(n.createdAt),
    })),
  }));
};

export const saveSupervisees = (supervisees: Supervisee[]): void => {
  localStorage.setItem(STORAGE_KEYS.SUPERVISEES, JSON.stringify(supervisees));
};

// Nudges
export const getNudges = (): Nudge[] => {
  const data = localStorage.getItem(STORAGE_KEYS.NUDGES);
  if (!data) return [];
  const nudges = JSON.parse(data);
  return nudges.map((n: Nudge) => ({
    ...n,
    createdAt: new Date(n.createdAt),
    snoozedUntil: n.snoozedUntil ? new Date(n.snoozedUntil) : undefined,
  }));
};

export const saveNudges = (nudges: Nudge[]): void => {
  localStorage.setItem(STORAGE_KEYS.NUDGES, JSON.stringify(nudges));
};

// Case Info
export const getCaseInfo = (): { caseCode: string; caseName: string } | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CASE_INFO);
  if (!data) return null;
  return JSON.parse(data);
};

export const saveCaseInfo = (caseCode: string, caseName: string): void => {
  localStorage.setItem(STORAGE_KEYS.CASE_INFO, JSON.stringify({ caseCode, caseName }));
};

// Schedules
export const getSchedules = (): NudgeSchedule[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
  if (!data) return [];
  return JSON.parse(data);
};

export const saveSchedules = (schedules: NudgeSchedule[]): void => {
  localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
};

// Calendar Events
export const getCalendarEvents = (): CalendarEvent[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS);
  if (!data) return [];
  const events = JSON.parse(data);
  return events.map((e: CalendarEvent) => ({
    ...e,
    startTime: new Date(e.startTime),
    endTime: new Date(e.endTime),
  }));
};

export const saveCalendarEvents = (events: CalendarEvent[]): void => {
  localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(events));
};

// Meeting Debriefs
export const getMeetingDebriefs = (): MeetingDebrief[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MEETING_DEBRIEFS);
  if (!data) return [];
  const debriefs = JSON.parse(data);
  return debriefs.map((d: MeetingDebrief) => ({
    ...d,
    createdAt: new Date(d.createdAt),
  }));
};

export const saveMeetingDebriefs = (debriefs: MeetingDebrief[]): void => {
  localStorage.setItem(STORAGE_KEYS.MEETING_DEBRIEFS, JSON.stringify(debriefs));
};

// Assistants
export const getAssistants = (): Assistant[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ASSISTANTS);
  if (!data) return [];
  const assistants = JSON.parse(data);
  return assistants.map((a: Assistant) => ({
    ...a,
    createdAt: new Date(a.createdAt),
    improvementAreas: a.improvementAreas || [],
    notes: (a.notes || []).map((n) => ({
      ...n,
      createdAt: new Date(n.createdAt),
    })),
  }));
};

export const saveAssistants = (assistants: Assistant[]): void => {
  localStorage.setItem(STORAGE_KEYS.ASSISTANTS, JSON.stringify(assistants));
};

// Weekly Recaps
export const getWeeklyRecaps = (): WeeklyRecap[] => {
  const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_RECAPS);
  if (!data) return [];
  const recaps = JSON.parse(data);
  return recaps.map((r: WeeklyRecap) => ({
    ...r,
    weekStart: new Date(r.weekStart),
    weekEnd: new Date(r.weekEnd),
    createdAt: new Date(r.createdAt),
  }));
};

export const saveWeeklyRecaps = (recaps: WeeklyRecap[]): void => {
  localStorage.setItem(STORAGE_KEYS.WEEKLY_RECAPS, JSON.stringify(recaps));
};

// Clear all data
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};
