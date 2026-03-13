import { useState } from 'react';
import { AssistantImprovementArea, DEFAULT_ASSISTANT_IMPROVEMENT_AREAS } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface AssistantImprovementEditorProps {
  assistantId: string;
  areas: AssistantImprovementArea[];
}

export function AssistantImprovementEditor({ assistantId, areas }: AssistantImprovementEditorProps) {
  const { updateAssistantImprovementAreas } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  const availableDefaults = DEFAULT_ASSISTANT_IMPROVEMENT_AREAS.filter(
    (d) => !areas.some((a) => a.id === d.id)
  );

  const handleAddDefault = (area: AssistantImprovementArea) => {
    updateAssistantImprovementAreas(assistantId, [...areas, area]);
  };

  const handleRemove = (areaId: string) => {
    updateAssistantImprovementAreas(
      assistantId,
      areas.filter((a) => a.id !== areaId)
    );
  };

  const handleAddCustom = () => {
    if (!customLabel.trim()) return;
    const newArea: AssistantImprovementArea = {
      id: `custom-${crypto.randomUUID()}`,
      label: customLabel.trim(),
      description: customDescription.trim() || customLabel.trim(),
    };
    updateAssistantImprovementAreas(assistantId, [...areas, newArea]);
    setCustomLabel('');
    setCustomDescription('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Improvement Areas
        </h3>
        <span className="text-xs text-gray-400">{areas.length} tracked</span>
      </div>

      {areas.length === 0 ? (
        <p className="text-sm text-gray-500 py-2">
          No improvement areas set. Add some to track this assistant's growth.
        </p>
      ) : (
        <div className="space-y-2">
          {areas.map((area) => (
            <div
              key={area.id}
              className="group flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3"
            >
              <svg className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-teal-800">{area.label}</p>
                <p className="text-xs text-teal-600 mt-0.5">{area.description}</p>
              </div>
              <button
                onClick={() => handleRemove(area.id)}
                className="opacity-0 group-hover:opacity-100 text-teal-400 hover:text-red-500 transition-all"
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {availableDefaults.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-1.5">
            {availableDefaults.map((area) => (
              <button
                key={area.id}
                onClick={() => handleAddDefault(area)}
                className="text-xs px-2 py-1 rounded border border-dashed border-gray-300 text-gray-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                title={area.description}
              >
                + {area.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isAdding ? (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Improvement area name"
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
          className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add custom improvement area
        </button>
      )}
    </div>
  );
}
