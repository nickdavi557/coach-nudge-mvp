import { Supervisee, Nudge } from '../types';

const STORAGE_KEYS = {
  SUPERVISEES: 'coachnudge_supervisees',
  NUDGES: 'coachnudge_nudges',
  SETTINGS: 'coachnudge_settings',
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

export const addSupervisee = (supervisee: Supervisee): void => {
  const supervisees = getSupervisees();
  supervisees.push(supervisee);
  saveSupervisees(supervisees);
};

export const updateSupervisee = (supervisee: Supervisee): void => {
  const supervisees = getSupervisees();
  const index = supervisees.findIndex((s) => s.id === supervisee.id);
  if (index !== -1) {
    supervisees[index] = supervisee;
    saveSupervisees(supervisees);
  }
};

export const deleteSupervisee = (id: string): void => {
  const supervisees = getSupervisees();
  const filtered = supervisees.filter((s) => s.id !== id);
  saveSupervisees(filtered);
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

export const addNudge = (nudge: Nudge): void => {
  const nudges = getNudges();
  nudges.push(nudge);
  saveNudges(nudges);
};

export const updateNudge = (nudge: Nudge): void => {
  const nudges = getNudges();
  const index = nudges.findIndex((n) => n.id === nudge.id);
  if (index !== -1) {
    nudges[index] = nudge;
    saveNudges(nudges);
  }
};

// Clear all data
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.SUPERVISEES);
  localStorage.removeItem(STORAGE_KEYS.NUDGES);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
};
