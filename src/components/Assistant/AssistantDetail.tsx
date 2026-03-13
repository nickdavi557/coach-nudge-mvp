import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { getInitials, formatDate } from '../../utils/helpers';
import { AssistantNotesSection } from './AssistantNotesSection';
import { AssistantImprovementEditor } from './AssistantImprovementEditor';
import { WeeklyRecapForm } from './WeeklyRecapForm';
import { AssistantMeetingTracker } from './AssistantMeetingTracker';
import { useState } from 'react';

export function AssistantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'notes' | 'improvement' | 'meetings' | 'recap'>('notes');

  const assistant = state.assistants.find((a) => a.id === id);

  if (!assistant) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Assistant not found</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove ${assistant.name}? This cannot be undone.`)) {
      dispatch({ type: 'DELETE_ASSISTANT', payload: assistant.id });
      navigate('/');
    }
  };

  // Count meetings this week involving this assistant
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const thisWeekMeetings = state.calendarEvents.filter((e) => {
    const eventDate = new Date(e.startTime);
    return eventDate >= weekStart && eventDate <= weekEnd;
  });

  const recapsForAssistant = state.weeklyRecaps.filter((r) => r.assistantId === assistant.id);

  const tabs = [
    { key: 'notes' as const, label: 'Notes', count: assistant.notes.length },
    { key: 'improvement' as const, label: 'Improvement Areas', count: assistant.improvementAreas.length },
    { key: 'meetings' as const, label: 'Meeting Tracker', count: thisWeekMeetings.length },
    { key: 'recap' as const, label: 'Weekly Recap', count: recapsForAssistant.length },
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
            {getInitials(assistant.name)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{assistant.name}</h1>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-teal-100 text-teal-700">
                Assistant
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {assistant.email} · Added {formatDate(assistant.createdAt)}
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
          title="Remove assistant"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'notes' && <AssistantNotesSection assistant={assistant} />}
      {activeTab === 'improvement' && (
        <AssistantImprovementEditor
          assistantId={assistant.id}
          areas={assistant.improvementAreas}
        />
      )}
      {activeTab === 'meetings' && <AssistantMeetingTracker assistant={assistant} />}
      {activeTab === 'recap' && <WeeklyRecapForm assistant={assistant} />}
    </div>
  );
}
