import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { getInitials, formatDate } from '../../utils/helpers';
import { NotesSection } from '../Notes/NotesSection';
import { SynthesisSection } from '../Synthesis/SynthesisSection';
import { DocumentUpload } from './DocumentUpload';
import { useState } from 'react';

export function SuperviseeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch, triggerReflectionNudge, triggerCoachingNudge, deleteDocument } = useApp();
  const [activeTab, setActiveTab] = useState<'notes' | 'documents' | 'synthesis'>('notes');
  const [isGeneratingCoaching, setIsGeneratingCoaching] = useState(false);

  const supervisee = state.supervisees.find((s) => s.id === id);

  if (!supervisee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Supervisee not found</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${supervisee.name}? This cannot be undone.`)) {
      dispatch({ type: 'DELETE_SUPERVISEE', payload: supervisee.id });
      navigate('/');
    }
  };

  const handleTriggerReflection = () => {
    triggerReflectionNudge(supervisee);
  };

  const handleTriggerCoaching = async () => {
    setIsGeneratingCoaching(true);
    try {
      const { generateCoachingNudge } = await import('../../services/gemini');
      const content = await generateCoachingNudge(supervisee);
      triggerCoachingNudge(supervisee, content);
    } catch (error) {
      console.error('Failed to generate coaching nudge:', error);
      alert('Failed to generate coaching nudge. Please check your API key.');
    } finally {
      setIsGeneratingCoaching(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-bain-red rounded-full flex items-center justify-center text-white text-xl font-semibold">
            {getInitials(supervisee.name)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{supervisee.name}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                supervisee.track === 'GC'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
{supervisee.track}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Added {formatDate(supervisee.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerReflection}
            className="btn-secondary text-sm"
            title="Trigger a reflection nudge"
          >
            Reflection Nudge
          </button>
          <button
            onClick={handleTriggerCoaching}
            disabled={isGeneratingCoaching}
            className="btn-primary text-sm"
            title="Generate AI coaching suggestion"
          >
            {isGeneratingCoaching ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              'Coaching Nudge'
            )}
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete supervisee"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {(['notes', 'documents', 'synthesis'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-bain-red text-bain-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'notes' && ` (${supervisee.notes.length})`}
              {tab === 'documents' && ` (${supervisee.documents.length})`}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'notes' && <NotesSection supervisee={supervisee} />}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <DocumentUpload superviseeId={supervisee.id} />

          {supervisee.documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No documents yet</p>
              <p className="text-sm mt-1">Add coaching preferences or background info</p>
            </div>
          ) : (
            <div className="space-y-3">
              {supervisee.documents.map((doc) => (
                <div key={doc.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{doc.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteDocument(supervisee.id, doc.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">{doc.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'synthesis' && <SynthesisSection supervisee={supervisee} />}
    </div>
  );
}
