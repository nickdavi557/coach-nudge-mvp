import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { NudgeSchedule, Supervisee } from '../../types';
import { generateCoachingNudge, generateReflectionPrompt } from '../../services/gemini';

const DAYS = [
  { value: 'monday', label: 'M' },
  { value: 'tuesday', label: 'T' },
  { value: 'wednesday', label: 'W' },
  { value: 'thursday', label: 'Th' },
  { value: 'friday', label: 'F' },
];

const TIMES = [
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
];

interface DaySelectorProps {
  selectedDays: string[];
  onChange: (days: string[]) => void;
  disabled?: boolean;
  color: 'red' | 'blue';
}

function DaySelector({ selectedDays, onChange, disabled, color }: DaySelectorProps) {
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  const baseClasses = 'w-8 h-8 rounded-full text-xs font-medium transition-colors';
  const activeClasses = color === 'red'
    ? 'bg-bain-red text-white'
    : 'bg-blue-600 text-white';
  const inactiveClasses = disabled
    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer';

  return (
    <div className="flex gap-1">
      {DAYS.map((day) => (
        <button
          key={day.value}
          type="button"
          onClick={() => !disabled && toggleDay(day.value)}
          disabled={disabled}
          className={`${baseClasses} ${
            selectedDays.includes(day.value) ? activeClasses : inactiveClasses
          }`}
          title={day.value.charAt(0).toUpperCase() + day.value.slice(1)}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}

interface ScheduleRowProps {
  supervisee: Supervisee;
  schedule: NudgeSchedule;
  onScheduleChange: (schedule: NudgeSchedule) => void;
  onTriggerCoaching: () => void;
  onTriggerReflection: () => void;
  isLoading: { coaching: boolean; reflection: boolean };
}

function ScheduleRow({
  supervisee,
  schedule,
  onScheduleChange,
  onTriggerCoaching,
  onTriggerReflection,
  isLoading,
}: ScheduleRowProps) {
  const updateField = (field: keyof NudgeSchedule, value: string | boolean | string[]) => {
    onScheduleChange({ ...schedule, [field]: value });
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-4 px-4">
        <div className="font-medium text-gray-900">{supervisee.name}</div>
        <div className="text-sm text-gray-500">{supervisee.track}</div>
      </td>

      {/* Coaching Nudge Settings */}
      <td className="py-4 px-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={schedule.coachingEnabled}
            onChange={(e) => updateField('coachingEnabled', e.target.checked)}
            className="w-4 h-4 text-bain-red rounded border-gray-300 focus:ring-bain-red"
          />
          <span className="text-sm text-gray-600">On</span>
        </label>
      </td>
      <td className="py-4 px-4">
        <DaySelector
          selectedDays={schedule.coachingDays}
          onChange={(days) => updateField('coachingDays', days)}
          disabled={!schedule.coachingEnabled}
          color="red"
        />
      </td>
      <td className="py-4 px-4">
        <select
          value={schedule.coachingTime}
          onChange={(e) => updateField('coachingTime', e.target.value)}
          disabled={!schedule.coachingEnabled}
          className="text-sm border border-gray-300 rounded-md px-2 py-1 disabled:bg-gray-100 disabled:text-gray-400"
        >
          {TIMES.map((time) => (
            <option key={time.value} value={time.value}>
              {time.label}
            </option>
          ))}
        </select>
      </td>
      <td className="py-4 px-4">
        <button
          onClick={onTriggerCoaching}
          disabled={isLoading.coaching}
          className="text-sm px-3 py-1.5 bg-bain-red text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {isLoading.coaching ? (
            <>
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>...</span>
            </>
          ) : (
            'Trigger'
          )}
        </button>
      </td>

      {/* Reflection Nudge Settings */}
      <td className="py-4 px-4 border-l border-gray-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={schedule.reflectionEnabled}
            onChange={(e) => updateField('reflectionEnabled', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">On</span>
        </label>
      </td>
      <td className="py-4 px-4">
        <DaySelector
          selectedDays={schedule.reflectionDays}
          onChange={(days) => updateField('reflectionDays', days)}
          disabled={!schedule.reflectionEnabled}
          color="blue"
        />
      </td>
      <td className="py-4 px-4">
        <select
          value={schedule.reflectionTime}
          onChange={(e) => updateField('reflectionTime', e.target.value)}
          disabled={!schedule.reflectionEnabled}
          className="text-sm border border-gray-300 rounded-md px-2 py-1 disabled:bg-gray-100 disabled:text-gray-400"
        >
          {TIMES.map((time) => (
            <option key={time.value} value={time.value}>
              {time.label}
            </option>
          ))}
        </select>
      </td>
      <td className="py-4 px-4">
        <button
          onClick={onTriggerReflection}
          disabled={isLoading.reflection}
          className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {isLoading.reflection ? (
            <>
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>...</span>
            </>
          ) : (
            'Trigger'
          )}
        </button>
      </td>
    </tr>
  );
}

export function NudgeSettings() {
  const { state, updateSchedule, getScheduleForSupervisee, triggerCoachingNudge, triggerReflectionNudge } = useApp();
  const [loadingStates, setLoadingStates] = useState<Record<string, { coaching: boolean; reflection: boolean }>>({});

  if (!state.caseCode) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Enter a case code to configure nudge settings.</p>
      </div>
    );
  }

  const handleTriggerCoaching = async (supervisee: Supervisee) => {
    setLoadingStates((prev) => ({
      ...prev,
      [supervisee.id]: { ...prev[supervisee.id], coaching: true },
    }));

    try {
      const content = await generateCoachingNudge(supervisee);
      triggerCoachingNudge(supervisee, content);
    } catch (error) {
      console.error('Failed to generate coaching nudge:', error);
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [supervisee.id]: { ...prev[supervisee.id], coaching: false },
      }));
    }
  };

  const handleTriggerReflection = async (supervisee: Supervisee) => {
    setLoadingStates((prev) => ({
      ...prev,
      [supervisee.id]: { ...prev[supervisee.id], reflection: true },
    }));

    try {
      await generateReflectionPrompt(supervisee);
      triggerReflectionNudge(supervisee);
    } catch (error) {
      console.error('Failed to generate reflection nudge:', error);
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [supervisee.id]: { ...prev[supervisee.id], reflection: false },
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nudge Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure when you want to receive coaching and reflection nudges for each team member.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900">
                  Team Member
                </th>
                <th colSpan={4} className="py-3 px-4 text-center text-sm font-semibold text-bain-red border-l border-gray-200">
                  Coaching Nudge
                </th>
                <th colSpan={4} className="py-3 px-4 text-center text-sm font-semibold text-blue-600 border-l border-gray-200">
                  Reflection Nudge
                </th>
              </tr>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-4"></th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Days
                </th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Demo
                </th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase border-l border-gray-200">
                  Status
                </th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Days
                </th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Demo
                </th>
              </tr>
            </thead>
            <tbody>
              {state.supervisees.map((supervisee) => (
                <ScheduleRow
                  key={supervisee.id}
                  supervisee={supervisee}
                  schedule={getScheduleForSupervisee(supervisee.id)}
                  onScheduleChange={updateSchedule}
                  onTriggerCoaching={() => handleTriggerCoaching(supervisee)}
                  onTriggerReflection={() => handleTriggerReflection(supervisee)}
                  isLoading={loadingStates[supervisee.id] || { coaching: false, reflection: false }}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">About Nudge Scheduling</h3>
        <p className="text-sm text-blue-800">
          In a production version, nudges would be automatically triggered at the scheduled times on selected days.
          For this demo, use the "Trigger" buttons to manually send nudges and see how they work.
        </p>
      </div>
    </div>
  );
}
