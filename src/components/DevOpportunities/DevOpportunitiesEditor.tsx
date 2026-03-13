import { useState } from 'react';
import { DevelopmentOpportunity, DEFAULT_DEVELOPMENT_OPPORTUNITIES } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface DevOpportunitiesEditorProps {
  superviseeId: string;
  opportunities: DevelopmentOpportunity[];
}

export function DevOpportunitiesEditor({ superviseeId, opportunities }: DevOpportunitiesEditorProps) {
  const { updateSuperviseeDevOpps } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  const availableDefaults = DEFAULT_DEVELOPMENT_OPPORTUNITIES.filter(
    (d) => !opportunities.some((o) => o.id === d.id)
  );

  const handleAddDefault = (opp: DevelopmentOpportunity) => {
    updateSuperviseeDevOpps(superviseeId, [...opportunities, opp]);
  };

  const handleRemove = (oppId: string) => {
    updateSuperviseeDevOpps(
      superviseeId,
      opportunities.filter((o) => o.id !== oppId)
    );
  };

  const handleAddCustom = () => {
    if (!customLabel.trim()) return;
    const newOpp: DevelopmentOpportunity = {
      id: `custom-${crypto.randomUUID()}`,
      label: customLabel.trim(),
      description: customDescription.trim() || customLabel.trim(),
    };
    updateSuperviseeDevOpps(superviseeId, [...opportunities, newOpp]);
    setCustomLabel('');
    setCustomDescription('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Development Opportunities
        </h3>
        <span className="text-xs text-gray-400">{opportunities.length} active</span>
      </div>

      {/* Current opportunities */}
      {opportunities.length === 0 ? (
        <p className="text-sm text-gray-500 py-2">
          No development opportunities set. Add some to enable calendar-based coaching nudges.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="group flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5"
            >
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-amber-800">{opp.label}</span>
              <button
                onClick={() => handleRemove(opp.id)}
                className="ml-1 opacity-0 group-hover:opacity-100 text-amber-400 hover:text-red-500 transition-all"
                title="Remove"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick-add from defaults */}
      {availableDefaults.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-1.5">
            {availableDefaults.map((opp) => (
              <button
                key={opp.id}
                onClick={() => handleAddDefault(opp)}
                className="text-xs px-2 py-1 rounded border border-dashed border-gray-300 text-gray-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                title={opp.description}
              >
                + {opp.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom opportunity */}
      {isAdding ? (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Opportunity name"
            className="input text-sm"
            autoFocus
          />
          <input
            type="text"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="Brief description (optional)"
            className="input text-sm"
          />
          <div className="flex gap-2">
            <button onClick={handleAddCustom} className="btn-primary text-sm" disabled={!customLabel.trim()}>
              Add
            </button>
            <button onClick={() => { setIsAdding(false); setCustomLabel(''); setCustomDescription(''); }} className="btn-secondary text-sm">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="text-sm text-bain-red hover:text-red-700 font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add custom opportunity
        </button>
      )}
    </div>
  );
}
