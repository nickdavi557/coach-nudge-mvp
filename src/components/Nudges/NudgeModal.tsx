import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getInitials } from '../../utils/helpers';

const NUDGE_CONFIG = {
  reflection: { color: 'blue', label: 'Reflection nudge', hasInput: true },
  coaching: { color: 'green', label: 'Coaching suggestion', hasInput: false },
  'pre-meeting': { color: 'amber', label: 'Meeting prep', hasInput: false },
  'post-meeting': { color: 'indigo', label: 'Meeting debrief', hasInput: true },
} as const;

const COLOR_CLASSES = {
  blue: { bg: 'bg-blue-500', ring: 'focus:ring-blue-500', btn: 'bg-blue-500 hover:bg-blue-600' },
  green: { bg: 'bg-green-500', ring: 'focus:ring-green-500', btn: 'bg-green-500 hover:bg-green-600' },
  amber: { bg: 'bg-amber-500', ring: 'focus:ring-amber-500', btn: 'bg-amber-500 hover:bg-amber-600' },
  indigo: { bg: 'bg-indigo-500', ring: 'focus:ring-indigo-500', btn: 'bg-indigo-500 hover:bg-indigo-600' },
} as const;

export function NudgeModal() {
  const { state, completeNudge, snoozeNudge, dismissNudge } = useApp();
  const [response, setResponse] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const nudge = state.activeNudge;
  if (!nudge) return null;

  const config = NUDGE_CONFIG[nudge.type];
  const colors = COLOR_CLASSES[config.color];

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

  // Collapsed minimal view
  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50" style={{ animation: 'demo-banner-in 0.3s ease-out' }}>
        <div
          data-nudge-toast
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${colors.bg}`}>
              {getInitials(nudge.supervisee.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {nudge.supervisee.name}
              </p>
              <p className="text-xs text-gray-500">{config.label}</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${colors.bg}`} />
          </div>
        </div>
      </div>
    );
  }

  // Determine if content has markdown-like formatting
  const isRichContent = nudge.content.includes('**') || nudge.content.includes('\n');

  // Expanded view
  return (
    <div className="fixed bottom-4 right-4 z-50" data-nudge-expanded style={{ animation: 'demo-banner-in 0.2s ease-out' }}>
      <div className={`bg-white rounded-xl shadow-xl border border-gray-200 ${config.hasInput ? 'w-96' : 'w-80'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${colors.bg}`}>
              {getInitials(nudge.supervisee.name)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{nudge.supervisee.name}</p>
              <p className="text-xs text-gray-500">{config.label}</p>
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
          {isRichContent ? (
            <div className="text-sm text-gray-700 mb-3 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {nudge.content.split('\n').map((line, i) => {
                // Simple bold rendering
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <p key={i} className={line === '' ? 'h-2' : 'mb-1'}>
                    {parts.map((part, j) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={j}>{part.slice(2, -2)}</strong>
                        : part
                    )}
                  </p>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-700 mb-3">{nudge.content}</p>
          )}

          {config.hasInput ? (
            <form onSubmit={handleSubmit}>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${colors.ring} focus:border-transparent resize-none`}
                rows={3}
                placeholder={nudge.type === 'post-meeting'
                  ? 'How did it go? Any observations...'
                  : 'Quick observation...'
                }
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
                  className={`text-xs font-medium ${colors.btn} disabled:bg-gray-200 disabled:text-gray-400 text-white px-3 py-1.5 rounded-lg transition-colors`}
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
                className={`text-xs font-medium ${colors.btn} text-white px-3 py-1.5 rounded-lg transition-colors`}
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
