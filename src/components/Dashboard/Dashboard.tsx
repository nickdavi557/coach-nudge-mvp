import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { QuickStats } from './QuickStats';
import { ActivityFeed } from './ActivityFeed';
import { SuperviseeList } from '../Supervisee/SuperviseeList';

export function Dashboard() {
  const { state, loadCase, leaveCase } = useApp();
  const [caseCodeInput, setCaseCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLoadCase = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!caseCodeInput.trim()) {
      setError('Please enter a case code');
      return;
    }

    const success = loadCase(caseCodeInput.trim());
    if (!success) {
      setError('Invalid case code. Try "DEMO-2024" for a demo.');
    }
  };

  // No case loaded - show case code entry
  if (!state.caseCode) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-bain-red rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">CN</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to CoachNudge</h1>
          <p className="text-gray-500 mt-2">
            Enter your case code to load your team
          </p>
        </div>

        <form onSubmit={handleLoadCase} className="card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Case Code
          </label>
          <input
            type="text"
            value={caseCodeInput}
            onChange={(e) => {
              setCaseCodeInput(e.target.value.toUpperCase());
              setError(null);
            }}
            className="input mb-3"
            placeholder="e.g., DEMO-2024"
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}
          <button type="submit" className="btn-primary w-full">
            Load Case Team
          </button>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Don't have a case code?{' '}
              <button
                type="button"
                onClick={() => {
                  setCaseCodeInput('DEMO-2024');
                }}
                className="text-bain-red hover:underline"
              >
                Try the demo
              </button>
            </p>
          </div>
        </form>
      </div>
    );
  }

  // Case loaded - show dashboard
  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
              {state.caseCode}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{state.caseName}</h1>
          <p className="text-gray-500 mt-1">
            Manage your supervisees and coaching insights
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Leave this case? Your notes will be saved.')) {
              leaveCase();
            }
          }}
          className="btn-secondary text-sm"
        >
          Switch Case
        </button>
      </div>

      <QuickStats />

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <SuperviseeList />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
