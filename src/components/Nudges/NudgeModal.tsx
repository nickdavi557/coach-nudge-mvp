import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getInitials } from '../../utils/helpers';

export function NudgeModal() {
  const { state, completeNudge, snoozeNudge, dismissNudge } = useApp();
  const [response, setResponse] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const nudge = state.activeNudge;
  if (!nudge) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeNudge(nudge, response.trim() || undefined);
    setResponse('');
    setIsExpanded(false);
  };

  const handleSnooze = () => {
    snoozeNudge(nudge);
    setResponse('');
    setIsExpanded(false);
  };

  const handleDismiss = () => {
    dismissNudge(nudge);
    setResponse('');
    setIsExpanded(false);
  };

  const isReflection = nudge.type === 'reflection';

  // Collapsed minimal view
  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
              isReflection ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {getInitials(nudge.supervisee.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {nudge.supervisee.name}
              </p>
              <p className="text-xs text-gray-500">
                {isReflection ? 'Reflection nudge' : 'Coaching suggestion'}
              </p>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              isReflection ? 'bg-blue-500' : 'bg-green-500'
            }`} />
          </div>
        </div>
      </div>
    );
  }

  // Expanded view
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${
              isReflection ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {getInitials(nudge.supervisee.name)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{nudge.supervisee.name}</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-sm text-gray-700 mb-3">{nudge.content}</p>

          {isReflection ? (
            <form onSubmit={handleSubmit}>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Quick observation..."
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handleSnooze}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                  >
                    Later
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                  >
                    Skip
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!response.trim()}
                  className="text-xs font-medium bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  onClick={handleSnooze}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  Later
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                >
                  Skip
                </button>
              </div>
              <button
                onClick={() => completeNudge(nudge)}
                className="text-xs font-medium bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
