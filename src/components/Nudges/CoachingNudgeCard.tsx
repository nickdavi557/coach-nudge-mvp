import { Nudge } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { getInitials, formatRelativeTime } from '../../utils/helpers';

interface CoachingNudgeCardProps {
  nudge: Nudge;
}

export function CoachingNudgeCard({ nudge }: CoachingNudgeCardProps) {
  const { completeNudge, snoozeNudge, dismissNudge } = useApp();

  return (
    <div className="card border-l-4 border-l-green-500">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-sm font-medium">
          {getInitials(nudge.supervisee.name)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-green-700">
              Coaching Suggestion
            </span>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(nudge.createdAt)}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">
            {nudge.supervisee.name}
          </p>
          <p className="text-sm text-gray-600">{nudge.content}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => completeNudge(nudge)}
              className="text-xs font-medium text-green-700 hover:text-green-800"
            >
              Mark Done
            </button>
            <button
              onClick={() => snoozeNudge(nudge)}
              className="text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              Snooze
            </button>
            <button
              onClick={() => dismissNudge(nudge)}
              className="text-xs font-medium text-gray-400 hover:text-gray-600"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
