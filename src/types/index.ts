export interface Supervisee {
  id: string;
  name: string;
  documents: Document[];
  notes: Note[];
  createdAt: Date;
  lastNudgeAt: Date | null;
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
  source: 'nudge' | 'manual';
}

export interface Nudge {
  id: string;
  superviseeId: string;
  supervisee: Supervisee;
  type: 'reflection' | 'coaching';
  content: string;
  status: 'pending' | 'completed' | 'snoozed' | 'dismissed';
  createdAt: Date;
  snoozedUntil?: Date;
}

export interface AppState {
  supervisees: Supervisee[];
  nudges: Nudge[];
  activeNudge: Nudge | null;
  isLoading: boolean;
  demoMode: boolean;
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
  | { type: 'SET_DEMO_MODE'; payload: boolean }
  | { type: 'RESET_DATA' };
