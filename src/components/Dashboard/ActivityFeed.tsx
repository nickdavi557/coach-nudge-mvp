import { useApp } from '../../contexts/AppContext';
import { formatRelativeTime, getInitials } from '../../utils/helpers';
import { Link } from 'react-router-dom';

interface Activity {
  id: string;
  type: 'note' | 'nudge' | 'supervisee';
  message: string;
  superviseeId: string;
  superviseeName: string;
  timestamp: Date;
}

export function ActivityFeed() {
  const { state } = useApp();

  // Build activity list from notes and nudges
  const activities: Activity[] = [];

  state.supervisees.forEach((supervisee) => {
    supervisee.notes.forEach((note) => {
      activities.push({
        id: `note-${note.id}`,
        type: 'note',
        message:
          note.source === 'nudge'
            ? `Added note from nudge: "${note.content.slice(0, 50)}${note.content.length > 50 ? '...' : ''}"`
            : `Added note: "${note.content.slice(0, 50)}${note.content.length > 50 ? '...' : ''}"`,
        superviseeId: supervisee.id,
        superviseeName: supervisee.name,
        timestamp: new Date(note.createdAt),
      });
    });
  });

  state.nudges
    .filter((n) => n.status === 'completed')
    .forEach((nudge) => {
      activities.push({
        id: `nudge-${nudge.id}`,
        type: 'nudge',
        message: `Completed ${nudge.type} nudge`,
        superviseeId: nudge.superviseeId,
        superviseeName: nudge.supervisee.name,
        timestamp: new Date(nudge.createdAt),
      });
    });

  // Sort by timestamp, most recent first
  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const recentActivities = activities.slice(0, 10);

  if (recentActivities.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {recentActivities.map((activity) => (
          <Link
            key={activity.id}
            to={`/supervisee/${activity.superviseeId}`}
            className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium flex-shrink-0">
              {getInitials(activity.superviseeName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {activity.superviseeName} · {formatRelativeTime(activity.timestamp)}
              </p>
            </div>
            <div className="flex-shrink-0">
              {activity.type === 'note' && (
                <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                  Note
                </span>
              )}
              {activity.type === 'nudge' && (
                <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                  Nudge
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
