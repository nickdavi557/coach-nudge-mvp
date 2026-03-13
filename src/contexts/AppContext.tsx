import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import {
  AppState, AppAction, Supervisee, Note, Document, Nudge, NudgeSchedule,
  CalendarEvent, MeetingDebrief, DevelopmentOpportunity, MatchedOpportunity,
  AssistantNote, AssistantImprovementArea, WeeklyRecap,
} from '../types';
import * as storage from '../services/storage';
import { getCaseTeam, getCaseCalendarEvents, getCaseAssistants } from '../data/caseData';

const initialState: AppState = {
  caseCode: null,
  caseName: null,
  supervisees: [],
  nudges: [],
  activeNudge: null,
  isLoading: false,
  schedules: [],
  calendarEvents: [],
  meetingDebriefs: [],
  assistants: [],
  weeklyRecaps: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SUPERVISEES':
      return { ...state, supervisees: action.payload };

    case 'ADD_SUPERVISEE': {
      const newSupervisees = [...state.supervisees, action.payload];
      storage.saveSupervisees(newSupervisees);
      return { ...state, supervisees: newSupervisees };
    }

    case 'UPDATE_SUPERVISEE': {
      const updatedSupervisees = state.supervisees.map((s) =>
        s.id === action.payload.id ? action.payload : s
      );
      storage.saveSupervisees(updatedSupervisees);
      return { ...state, supervisees: updatedSupervisees };
    }

    case 'DELETE_SUPERVISEE': {
      const filteredSupervisees = state.supervisees.filter((s) => s.id !== action.payload);
      storage.saveSupervisees(filteredSupervisees);
      return { ...state, supervisees: filteredSupervisees };
    }

    case 'ADD_NOTE': {
      const superviseeWithNote = state.supervisees.map((s) =>
        s.id === action.payload.superviseeId
          ? { ...s, notes: [...s.notes, action.payload.note] }
          : s
      );
      storage.saveSupervisees(superviseeWithNote);
      return { ...state, supervisees: superviseeWithNote };
    }

    case 'UPDATE_NOTE': {
      const superviseeWithUpdatedNote = state.supervisees.map((s) =>
        s.id === action.payload.superviseeId
          ? {
              ...s,
              notes: s.notes.map((n) =>
                n.id === action.payload.note.id ? action.payload.note : n
              ),
            }
          : s
      );
      storage.saveSupervisees(superviseeWithUpdatedNote);
      return { ...state, supervisees: superviseeWithUpdatedNote };
    }

    case 'DELETE_NOTE': {
      const superviseeWithDeletedNote = state.supervisees.map((s) =>
        s.id === action.payload.superviseeId
          ? { ...s, notes: s.notes.filter((n) => n.id !== action.payload.noteId) }
          : s
      );
      storage.saveSupervisees(superviseeWithDeletedNote);
      return { ...state, supervisees: superviseeWithDeletedNote };
    }

    case 'ADD_DOCUMENT': {
      const superviseeWithDoc = state.supervisees.map((s) =>
        s.id === action.payload.superviseeId
          ? { ...s, documents: [...s.documents, action.payload.document] }
          : s
      );
      storage.saveSupervisees(superviseeWithDoc);
      return { ...state, supervisees: superviseeWithDoc };
    }

    case 'DELETE_DOCUMENT': {
      const superviseeWithDeletedDoc = state.supervisees.map((s) =>
        s.id === action.payload.superviseeId
          ? { ...s, documents: s.documents.filter((d) => d.id !== action.payload.documentId) }
          : s
      );
      storage.saveSupervisees(superviseeWithDeletedDoc);
      return { ...state, supervisees: superviseeWithDeletedDoc };
    }

    case 'SET_NUDGES':
      return { ...state, nudges: action.payload };

    case 'ADD_NUDGE': {
      const newNudges = [...state.nudges, action.payload];
      storage.saveNudges(newNudges);
      return { ...state, nudges: newNudges };
    }

    case 'UPDATE_NUDGE': {
      const updatedNudges = state.nudges.map((n) =>
        n.id === action.payload.id ? action.payload : n
      );
      storage.saveNudges(updatedNudges);
      return { ...state, nudges: updatedNudges };
    }

    case 'COMPLETE_NUDGE_WITH_NOTE': {
      const { nudge, note } = action.payload;

      const updatedNudges = state.nudges.map((n) =>
        n.id === nudge.id ? { ...n, status: 'completed' as const } : n
      );

      const updatedSupervisees = state.supervisees.map((s) =>
        s.id === nudge.superviseeId
          ? { ...s, notes: [...s.notes, note], lastNudgeAt: new Date() }
          : s
      );

      storage.saveNudges(updatedNudges);
      storage.saveSupervisees(updatedSupervisees);

      return {
        ...state,
        nudges: updatedNudges,
        supervisees: updatedSupervisees,
        activeNudge: null,
      };
    }

    case 'SET_ACTIVE_NUDGE':
      return { ...state, activeNudge: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_CASE': {
      const { caseCode, caseName, supervisees, calendarEvents, assistants } = action.payload;
      storage.saveSupervisees(supervisees);
      storage.saveCaseInfo(caseCode, caseName);
      storage.saveCalendarEvents(calendarEvents);
      storage.saveAssistants(assistants);
      return {
        ...state,
        caseCode,
        caseName,
        supervisees,
        calendarEvents,
        assistants,
        nudges: [],
        meetingDebriefs: [],
        weeklyRecaps: [],
      };
    }

    case 'RESET_DATA':
      storage.clearAllData();
      return { ...initialState };

    case 'SET_SCHEDULES':
      return { ...state, schedules: action.payload };

    case 'UPDATE_SCHEDULE': {
      const existingIndex = state.schedules.findIndex(
        (s) => s.superviseeId === action.payload.superviseeId
      );
      const newSchedules = existingIndex >= 0
        ? state.schedules.map((s, i) => i === existingIndex ? action.payload : s)
        : [...state.schedules, action.payload];
      storage.saveSchedules(newSchedules);
      return { ...state, schedules: newSchedules };
    }

    case 'SET_CALENDAR_EVENTS': {
      storage.saveCalendarEvents(action.payload);
      return { ...state, calendarEvents: action.payload };
    }

    case 'ADD_MEETING_DEBRIEF': {
      const newDebriefs = [...state.meetingDebriefs, action.payload];
      storage.saveMeetingDebriefs(newDebriefs);
      return { ...state, meetingDebriefs: newDebriefs };
    }

    case 'SET_ASSISTANTS':
      return { ...state, assistants: action.payload };

    case 'ADD_ASSISTANT': {
      const newAssistants = [...state.assistants, action.payload];
      storage.saveAssistants(newAssistants);
      return { ...state, assistants: newAssistants };
    }

    case 'UPDATE_ASSISTANT': {
      const updatedAssistants = state.assistants.map((a) =>
        a.id === action.payload.id ? action.payload : a
      );
      storage.saveAssistants(updatedAssistants);
      return { ...state, assistants: updatedAssistants };
    }

    case 'DELETE_ASSISTANT': {
      const filteredAssistants = state.assistants.filter((a) => a.id !== action.payload);
      storage.saveAssistants(filteredAssistants);
      return { ...state, assistants: filteredAssistants };
    }

    case 'ADD_ASSISTANT_NOTE': {
      const assistantsWithNote = state.assistants.map((a) =>
        a.id === action.payload.assistantId
          ? { ...a, notes: [...a.notes, action.payload.note] }
          : a
      );
      storage.saveAssistants(assistantsWithNote);
      return { ...state, assistants: assistantsWithNote };
    }

    case 'DELETE_ASSISTANT_NOTE': {
      const assistantsWithDeletedNote = state.assistants.map((a) =>
        a.id === action.payload.assistantId
          ? { ...a, notes: a.notes.filter((n) => n.id !== action.payload.noteId) }
          : a
      );
      storage.saveAssistants(assistantsWithDeletedNote);
      return { ...state, assistants: assistantsWithDeletedNote };
    }

    case 'ADD_WEEKLY_RECAP': {
      const newRecaps = [...state.weeklyRecaps, action.payload];
      storage.saveWeeklyRecaps(newRecaps);
      return { ...state, weeklyRecaps: newRecaps };
    }

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  loadCase: (caseCode: string) => boolean;
  leaveCase: () => void;
  addNote: (superviseeId: string, content: string, source: 'nudge' | 'manual' | 'meeting-debrief') => void;
  updateNote: (superviseeId: string, note: Note) => void;
  deleteNote: (superviseeId: string, noteId: string) => void;
  addDocument: (superviseeId: string, document: Document) => void;
  deleteDocument: (superviseeId: string, documentId: string) => void;
  triggerReflectionNudge: (supervisee: Supervisee) => void;
  triggerCoachingNudge: (supervisee: Supervisee, content: string) => void;
  triggerPreMeetingNudge: (supervisee: Supervisee, event: CalendarEvent, content: string) => void;
  triggerPostMeetingNudge: (supervisee: Supervisee, event: CalendarEvent) => void;
  completeNudge: (nudge: Nudge, response?: string) => void;
  snoozeNudge: (nudge: Nudge) => void;
  dismissNudge: (nudge: Nudge) => void;
  updateSchedule: (schedule: NudgeSchedule) => void;
  getScheduleForSupervisee: (superviseeId: string) => NudgeSchedule;
  updateSuperviseeDevOpps: (superviseeId: string, opportunities: DevelopmentOpportunity[]) => void;
  addMeetingDebrief: (calendarEventId: string, superviseeId: string, feedback: string) => void;
  getMatchedOpportunities: (event: CalendarEvent) => MatchedOpportunity[];
  addAssistantNote: (assistantId: string, content: string, source: 'manual' | 'weekly-recap', weekLabel?: string) => void;
  deleteAssistantNote: (assistantId: string, noteId: string) => void;
  updateAssistantImprovementAreas: (assistantId: string, areas: AssistantImprovementArea[]) => void;
  submitWeeklyRecap: (assistantId: string, weekStart: Date, weekEnd: Date, missedMeetingIds: string[], feedback: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const caseInfo = storage.getCaseInfo();
    const supervisees = storage.getSupervisees();
    const nudges = storage.getNudges();
    const schedules = storage.getSchedules();
    const calendarEvents = storage.getCalendarEvents();
    const meetingDebriefs = storage.getMeetingDebriefs();
    const assistants = storage.getAssistants();
    const weeklyRecaps = storage.getWeeklyRecaps();

    if (caseInfo) {
      dispatch({
        type: 'LOAD_CASE',
        payload: {
          caseCode: caseInfo.caseCode,
          caseName: caseInfo.caseName,
          supervisees,
          calendarEvents,
          assistants,
        }
      });
    }
    if (weeklyRecaps.length > 0) {
      weeklyRecaps.forEach((r) => dispatch({ type: 'ADD_WEEKLY_RECAP', payload: r }));
    }
    dispatch({ type: 'SET_NUDGES', payload: nudges });
    dispatch({ type: 'SET_SCHEDULES', payload: schedules });
    if (meetingDebriefs.length > 0) {
      meetingDebriefs.forEach((d) => dispatch({ type: 'ADD_MEETING_DEBRIEF', payload: d }));
    }
  }, []);

  const loadCase = (caseCode: string): boolean => {
    const caseTeam = getCaseTeam(caseCode);
    if (!caseTeam) {
      return false;
    }
    const calendarEvents = getCaseCalendarEvents(caseCode);
    const assistants = getCaseAssistants(caseCode);
    dispatch({
      type: 'LOAD_CASE',
      payload: {
        caseCode: caseTeam.caseCode,
        caseName: caseTeam.caseName,
        supervisees: caseTeam.supervisees,
        calendarEvents,
        assistants,
      },
    });
    return true;
  };

  const leaveCase = () => {
    dispatch({ type: 'RESET_DATA' });
  };

  const addNote = (superviseeId: string, content: string, source: 'nudge' | 'manual' | 'meeting-debrief') => {
    const note: Note = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date(),
      source,
    };
    dispatch({ type: 'ADD_NOTE', payload: { superviseeId, note } });
  };

  const updateNote = (superviseeId: string, note: Note) => {
    dispatch({ type: 'UPDATE_NOTE', payload: { superviseeId, note } });
  };

  const deleteNote = (superviseeId: string, noteId: string) => {
    dispatch({ type: 'DELETE_NOTE', payload: { superviseeId, noteId } });
  };

  const addDocument = (superviseeId: string, document: Document) => {
    dispatch({ type: 'ADD_DOCUMENT', payload: { superviseeId, document } });
  };

  const deleteDocument = (superviseeId: string, documentId: string) => {
    dispatch({ type: 'DELETE_DOCUMENT', payload: { superviseeId, documentId } });
  };

  const triggerReflectionNudge = (supervisee: Supervisee) => {
    const nudge: Nudge = {
      id: crypto.randomUUID(),
      superviseeId: supervisee.id,
      supervisee,
      type: 'reflection',
      content: `How has ${supervisee.name} been performing lately? Any recent observations?`,
      status: 'pending',
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_NUDGE', payload: nudge });
    dispatch({ type: 'SET_ACTIVE_NUDGE', payload: nudge });
  };

  const triggerCoachingNudge = (supervisee: Supervisee, content: string) => {
    const nudge: Nudge = {
      id: crypto.randomUUID(),
      superviseeId: supervisee.id,
      supervisee,
      type: 'coaching',
      content,
      status: 'pending',
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_NUDGE', payload: nudge });
    dispatch({ type: 'SET_ACTIVE_NUDGE', payload: nudge });
  };

  const triggerPreMeetingNudge = (supervisee: Supervisee, event: CalendarEvent, content: string) => {
    const nudge: Nudge = {
      id: crypto.randomUUID(),
      superviseeId: supervisee.id,
      supervisee,
      type: 'pre-meeting',
      content,
      status: 'pending',
      createdAt: new Date(),
      calendarEventId: event.id,
    };
    dispatch({ type: 'ADD_NUDGE', payload: nudge });
    dispatch({ type: 'SET_ACTIVE_NUDGE', payload: nudge });
  };

  const triggerPostMeetingNudge = (supervisee: Supervisee, event: CalendarEvent) => {
    const nudge: Nudge = {
      id: crypto.randomUUID(),
      superviseeId: supervisee.id,
      supervisee,
      type: 'post-meeting',
      content: `"${event.title}" has ended. How did ${supervisee.name} do? Any observations on their development areas?`,
      status: 'pending',
      createdAt: new Date(),
      calendarEventId: event.id,
    };
    dispatch({ type: 'ADD_NUDGE', payload: nudge });
    dispatch({ type: 'SET_ACTIVE_NUDGE', payload: nudge });
  };

  const completeNudge = useCallback((nudge: Nudge, response?: string) => {
    if (response && (nudge.type === 'reflection' || nudge.type === 'post-meeting')) {
      const source = nudge.type === 'post-meeting' ? 'meeting-debrief' as const : 'nudge' as const;
      const note: Note = {
        id: crypto.randomUUID(),
        content: response,
        createdAt: new Date(),
        source,
      };
      dispatch({ type: 'COMPLETE_NUDGE_WITH_NOTE', payload: { nudge, note } });

      if (nudge.type === 'post-meeting' && nudge.calendarEventId) {
        const debrief: MeetingDebrief = {
          id: crypto.randomUUID(),
          calendarEventId: nudge.calendarEventId,
          superviseeId: nudge.superviseeId,
          feedback: response,
          createdAt: new Date(),
        };
        dispatch({ type: 'ADD_MEETING_DEBRIEF', payload: debrief });
      }
    } else {
      const updatedNudge = { ...nudge, status: 'completed' as const };
      dispatch({ type: 'UPDATE_NUDGE', payload: updatedNudge });
      dispatch({ type: 'SET_ACTIVE_NUDGE', payload: null });
    }
  }, []);

  const snoozeNudge = (nudge: Nudge) => {
    const snoozedUntil = new Date();
    snoozedUntil.setHours(snoozedUntil.getHours() + 4);
    const updatedNudge = { ...nudge, status: 'snoozed' as const, snoozedUntil };
    dispatch({ type: 'UPDATE_NUDGE', payload: updatedNudge });
    dispatch({ type: 'SET_ACTIVE_NUDGE', payload: null });
  };

  const dismissNudge = (nudge: Nudge) => {
    const updatedNudge = { ...nudge, status: 'dismissed' as const };
    dispatch({ type: 'UPDATE_NUDGE', payload: updatedNudge });
    dispatch({ type: 'SET_ACTIVE_NUDGE', payload: null });
  };

  const updateSchedule = (schedule: NudgeSchedule) => {
    dispatch({ type: 'UPDATE_SCHEDULE', payload: schedule });
  };

  const getScheduleForSupervisee = useCallback((superviseeId: string): NudgeSchedule => {
    const existing = state.schedules.find((s) => s.superviseeId === superviseeId);
    if (existing) return existing;
    return {
      superviseeId,
      coachingEnabled: true,
      coachingDays: ['monday'],
      coachingTime: '09:00',
      reflectionEnabled: true,
      reflectionDays: ['friday'],
      reflectionTime: '16:00',
    };
  }, [state.schedules]);

  const updateSuperviseeDevOpps = (superviseeId: string, opportunities: DevelopmentOpportunity[]) => {
    const supervisee = state.supervisees.find((s) => s.id === superviseeId);
    if (!supervisee) return;
    dispatch({
      type: 'UPDATE_SUPERVISEE',
      payload: { ...supervisee, developmentOpportunities: opportunities },
    });
  };

  const addMeetingDebrief = (calendarEventId: string, superviseeId: string, feedback: string) => {
    const debrief: MeetingDebrief = {
      id: crypto.randomUUID(),
      calendarEventId,
      superviseeId,
      feedback,
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_MEETING_DEBRIEF', payload: debrief });
    addNote(superviseeId, `[Meeting Debrief] ${feedback}`, 'meeting-debrief');
  };

  const addAssistantNote = (assistantId: string, content: string, source: 'manual' | 'weekly-recap', weekLabel?: string) => {
    const note: AssistantNote = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date(),
      source,
      weekLabel,
    };
    dispatch({ type: 'ADD_ASSISTANT_NOTE', payload: { assistantId, note } });
  };

  const deleteAssistantNote = (assistantId: string, noteId: string) => {
    dispatch({ type: 'DELETE_ASSISTANT_NOTE', payload: { assistantId, noteId } });
  };

  const updateAssistantImprovementAreas = (assistantId: string, areas: AssistantImprovementArea[]) => {
    const assistant = state.assistants.find((a) => a.id === assistantId);
    if (!assistant) return;
    dispatch({
      type: 'UPDATE_ASSISTANT',
      payload: { ...assistant, improvementAreas: areas },
    });
  };

  const submitWeeklyRecap = (assistantId: string, weekStart: Date, weekEnd: Date, missedMeetingIds: string[], feedback: string) => {
    const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    const recap: WeeklyRecap = {
      id: crypto.randomUUID(),
      assistantId,
      weekStart,
      weekEnd,
      weekLabel,
      missedMeetingIds,
      feedback,
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_WEEKLY_RECAP', payload: recap });
    addAssistantNote(assistantId, `[Weekly Recap – ${weekLabel}] ${feedback}${missedMeetingIds.length > 0 ? ` (${missedMeetingIds.length} missed meeting${missedMeetingIds.length > 1 ? 's' : ''})` : ''}`, 'weekly-recap', weekLabel);
  };

  const getMatchedOpportunities = useCallback((event: CalendarEvent): MatchedOpportunity[] => {
    const hasExternalAttendees = event.attendees.some((a) => a.isExternal);
    const superviseeAttendees = event.attendees.filter((a) => a.superviseeId);

    if (superviseeAttendees.length === 0) return [];

    const matches: MatchedOpportunity[] = [];

    for (const attendee of superviseeAttendees) {
      const supervisee = state.supervisees.find((s) => s.id === attendee.superviseeId);
      if (!supervisee) continue;

      for (const opp of supervisee.developmentOpportunities) {
        let isMatch = false;
        let tip = '';

        // Rule-based matching
        if (hasExternalAttendees && opp.id === 'client-communication') {
          isMatch = true;
          tip = `This meeting has external clients. Great opportunity for ${supervisee.name} to practice client communication skills.`;
        } else if (hasExternalAttendees && opp.id === 'stakeholder-management') {
          isMatch = true;
          tip = `External stakeholders present — coach ${supervisee.name} on relationship management before the meeting.`;
        } else if (event.eventType === 'presentation' && opp.id === 'public-speaking') {
          isMatch = true;
          tip = `${supervisee.name} will be presenting — help them prepare their delivery and anticipate tough questions.`;
        } else if (event.eventType === 'presentation' && opp.id === 'data-storytelling') {
          isMatch = true;
          tip = `Presentation setting is ideal for ${supervisee.name} to practice translating data into a compelling narrative.`;
        } else if (event.eventType === 'workshop' && opp.id === 'public-speaking') {
          isMatch = true;
          tip = `Workshop format lets ${supervisee.name} practice facilitation and public speaking in an interactive setting.`;
        } else if (hasExternalAttendees && opp.id === 'executive-presence') {
          isMatch = true;
          tip = `Client-facing meeting — encourage ${supervisee.name} to project confidence and own their contributions.`;
        } else if (hasExternalAttendees && opp.id === 'technical-translation') {
          isMatch = true;
          tip = `External attendees may be non-technical. Coach ${supervisee.name} on simplifying their explanations.`;
        } else if (event.eventType === 'client-meeting' && opp.id === 'negotiation') {
          isMatch = true;
          tip = `Client meeting context — good chance for ${supervisee.name} to observe or practice negotiation dynamics.`;
        } else if (event.eventType === 'workshop' && opp.id === 'team-collaboration') {
          isMatch = true;
          tip = `Workshop involves cross-team interaction — ${supervisee.name} can practice collaborative problem-solving.`;
        } else if (hasExternalAttendees && opp.id === 'problem-structuring') {
          isMatch = true;
          tip = `Client setting with ambiguity — encourage ${supervisee.name} to practice structuring the problem before diving in.`;
        }

        if (isMatch) {
          matches.push({
            superviseeId: supervisee.id,
            superviseeName: supervisee.name,
            opportunityId: opp.id,
            opportunityLabel: opp.label,
            coachingTip: tip,
          });
        }
      }
    }

    return matches;
  }, [state.supervisees]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        loadCase,
        leaveCase,
        addNote,
        updateNote,
        deleteNote,
        addDocument,
        deleteDocument,
        triggerReflectionNudge,
        triggerCoachingNudge,
        triggerPreMeetingNudge,
        triggerPostMeetingNudge,
        completeNudge,
        snoozeNudge,
        dismissNudge,
        updateSchedule,
        getScheduleForSupervisee,
        updateSuperviseeDevOpps,
        addMeetingDebrief,
        getMatchedOpportunities,
        addAssistantNote,
        deleteAssistantNote,
        updateAssistantImprovementAreas,
        submitWeeklyRecap,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
