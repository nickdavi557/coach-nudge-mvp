import { useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { getNudgeFrequency } from '../utils/helpers';

export function useNudgeScheduler(demoSpeed = false) {
  const { state, triggerReflectionNudge } = useApp();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (state.supervisees.length === 0) return;

    const scheduleNextNudge = () => {
      const frequency = getNudgeFrequency(state.supervisees.length);

      // In demo mode, nudge every 30 seconds; otherwise calculate based on frequency per week
      const intervalMs = demoSpeed
        ? 30 * 1000
        : (7 * 24 * 60 * 60 * 1000) / frequency;

      // Find the supervisee who hasn't been nudged recently
      const sortedByLastNudge = [...state.supervisees].sort((a, b) => {
        const aTime = a.lastNudgeAt ? new Date(a.lastNudgeAt).getTime() : 0;
        const bTime = b.lastNudgeAt ? new Date(b.lastNudgeAt).getTime() : 0;
        return aTime - bTime;
      });

      timerRef.current = window.setTimeout(() => {
        const supervisee = sortedByLastNudge[0];
        if (supervisee && !state.activeNudge) {
          triggerReflectionNudge(supervisee);
        }
        scheduleNextNudge();
      }, intervalMs);
    };

    if (demoSpeed) {
      scheduleNextNudge();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state.supervisees.length, demoSpeed, state.activeNudge, triggerReflectionNudge, state.supervisees]);

  return null;
}
