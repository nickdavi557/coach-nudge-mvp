import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { createDemoSupervisee, createSecondDemoSupervisee } from '../../data/demoData';
import { generateCoachingNudge } from '../../services/gemini';

export function DemoControls() {
  const { state, dispatch, triggerReflectionNudge, triggerCoachingNudge } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLoadDemoData = () => {
    // Clear existing data first
    dispatch({ type: 'RESET_DATA' });

    // Add demo supervisees
    const nickChen = createDemoSupervisee();
    const sarahPark = createSecondDemoSupervisee();

    dispatch({ type: 'ADD_SUPERVISEE', payload: nickChen });
    dispatch({ type: 'ADD_SUPERVISEE', payload: sarahPark });
    dispatch({ type: 'SET_DEMO_MODE', payload: true });

    setIsOpen(false);
  };

  const handleTriggerReflection = () => {
    if (state.supervisees.length === 0) {
      alert('Add a supervisee first');
      return;
    }
    triggerReflectionNudge(state.supervisees[0]);
    setIsOpen(false);
  };

  const handleTriggerCoaching = async () => {
    if (state.supervisees.length === 0) {
      alert('Add a supervisee first');
      return;
    }

    setIsGenerating(true);
    try {
      const content = await generateCoachingNudge(state.supervisees[0]);
      triggerCoachingNudge(state.supervisees[0], content);
    } catch (error) {
      console.error('Failed to generate coaching nudge:', error);
      // Use fallback content
      triggerCoachingNudge(
        state.supervisees[0],
        `Consider scheduling a brief check-in with ${state.supervisees[0].name} to discuss their recent work on the market sizing slide and explore how they're feeling about their contributions in team meetings.`
      );
    } finally {
      setIsGenerating(false);
      setIsOpen(false);
    }
  };

  const handleResetData = () => {
    if (confirm('This will clear all data. Are you sure?')) {
      dispatch({ type: 'RESET_DATA' });
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary text-sm flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Demo
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              <p className="text-xs font-medium text-gray-500 px-2 py-1">
                Demo Controls
              </p>

              <button
                onClick={handleLoadDemoData}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Load Demo Data
              </button>

              <hr className="my-1 border-gray-100" />

              <button
                onClick={handleTriggerReflection}
                disabled={state.supervisees.length === 0}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Trigger Reflection Nudge
              </button>

              <button
                onClick={handleTriggerCoaching}
                disabled={state.supervisees.length === 0 || isGenerating}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {isGenerating ? 'Generating...' : 'Trigger Coaching Nudge'}
              </button>

              <hr className="my-1 border-gray-100" />

              <button
                onClick={handleResetData}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Reset All Data
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
