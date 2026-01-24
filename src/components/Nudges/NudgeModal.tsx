import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getInitials } from '../../utils/helpers';

export function NudgeModal() {
  const { state, completeNudge, snoozeNudge, dismissNudge } = useApp();
  const [response, setResponse] = useState('');

  const nudge = state.activeNudge;
  if (!nudge) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeNudge(nudge, response.trim() || undefined);
    setResponse('');
  };

  const handleSnooze = () => {
    snoozeNudge(nudge);
    setResponse('');
  };

  const handleDismiss = () => {
    dismissNudge(nudge);
    setResponse('');
  };

  const isReflection = nudge.type === 'reflection';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-bain-red rounded-full flex items-center justify-center text-white font-medium">
              {getInitials(nudge.supervisee.name)}
            </div>
            <div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  isReflection
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {isReflection ? 'Reflection Nudge' : 'Coaching Nudge'}
              </span>
              <p className="text-sm text-gray-600 mt-0.5">{nudge.supervisee.name}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-800">{nudge.content}</p>
          </div>

          {isReflection ? (
            <form onSubmit={handleSubmit}>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="textarea mb-4"
                rows={4}
                placeholder="Share your observations about this supervisee..."
                autoFocus
              />
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSnooze}
                    className="btn-ghost text-sm"
                  >
                    Snooze
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="btn-ghost text-sm text-gray-400 hover:text-gray-600"
                  >
                    Dismiss
                  </button>
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!response.trim()}
                >
                  Save Note
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between">
              <div className="flex gap-2">
                <button onClick={handleSnooze} className="btn-ghost text-sm">
                  Snooze
                </button>
                <button
                  onClick={handleDismiss}
                  className="btn-ghost text-sm text-gray-400 hover:text-gray-600"
                >
                  Dismiss
                </button>
              </div>
              <button
                onClick={() => completeNudge(nudge)}
                className="btn-primary"
              >
                Mark Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
