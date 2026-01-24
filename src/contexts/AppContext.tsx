import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { AppState, AppAction, Supervisee, Note, Document, Nudge, NudgeSchedule } from '../types';
import * as storage from '../services/storage';
import { getCaseTeam } from '../data/caseData';

const initialState: AppState = {
  caseCode: null,
  caseName: null,
  supervisees: [],
  nudges: [],
  activeNudge: null,
  isLoading: false,
  schedules: [],
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

      // Update nudge status
      const updatedNudges = state.nudges.map((n) =>
        n.id === nudge.id ? { ...n, status: 'completed' as const } : n
      );

      // Add note to supervisee and update lastNudgeAt
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
      const { caseCode, caseName, supervisees } = action.payload;
      storage.saveSupervisees(supervisees);
      storage.saveCaseInfo(caseCode, caseName);
      return {
        ...state,
        caseCode,
        caseName,
        supervisees,
        nudges: [],
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
      let newSchedules: NudgeSchedule[];
      if (existingIndex >= 0) {
        newSchedules = state.schedules.map((s, i) =>
          i === existingIndex ? action.payload : s
        );
      } else {
        newSchedules = [...state.schedules, action.payload];
      }
      storage.saveSchedules(newSchedules);
      return { ...state, schedules: newSchedules };
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
  addNote: (superviseeId: string, content: string, source: 'nudge' | 'manual') => void;
  updateNote: (superviseeId: string, note: Note) => void;
  deleteNote: (superviseeId: string, noteId: string) => void;
  addDocument: (superviseeId: string, document: Document) => void;
  deleteDocument: (superviseeId: string, documentId: string) => void;
  triggerReflectionNudge: (supervisee: Supervisee) => void;
  triggerCoachingNudge: (supervisee: Supervisee, content: string) => void;
  completeNudge: (nudge: Nudge, response?: string) => void;
  snoozeNudge: (nudge: Nudge) => void;
  dismissNudge: (nudge: Nudge) => void;
  updateSchedule: (schedule: NudgeSchedule) => void;
  getScheduleForSupervisee: (superviseeId: string) => NudgeSchedule;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const caseInfo = storage.getCaseInfo();
    const supervisees = storage.getSupervisees();
    const nudges = storage.getNudges();
    const schedules = storage.getSchedules();

    if (caseInfo) {
      dispatch({
        type: 'LOAD_CASE',
        payload: {
          caseCode: caseInfo.caseCode,
          caseName: caseInfo.caseName,
          supervisees
        }
      });
    }
    dispatch({ type: 'SET_NUDGES', payload: nudges });
    dispatch({ type: 'SET_SCHEDULES', payload: schedules });
  }, []);

  const loadCase = (caseCode: string): boolean => {
    const caseTeam = getCaseTeam(caseCode);
    if (!caseTeam) {
      return false;
    }
    dispatch({
      type: 'LOAD_CASE',
      payload: {
        caseCode: caseTeam.caseCode,
        caseName: caseTeam.caseName,
        supervisees: caseTeam.supervisees,
      },
    });
    return true;
  };

  const leaveCase = () => {
    dispatch({ type: 'RESET_DATA' });
  };

  const addNote = (superviseeId: string, content: string, source: 'nudge' | 'manual') => {
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

  const completeNudge = useCallback((nudge: Nudge, response?: string) => {
    if (response && nudge.type === 'reflection') {
      // Use atomic action that handles both nudge completion and note creation
      const note: Note = {
        id: crypto.randomUUID(),
        content: response,
        createdAt: new Date(),
        source: 'nudge',
      };
      dispatch({ type: 'COMPLETE_NUDGE_WITH_NOTE', payload: { nudge, note } });
    } else {
      // Just complete the nudge without adding a note
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
        completeNudge,
        snoozeNudge,
        dismissNudge,
        updateSchedule,
        getScheduleForSupervisee,
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
