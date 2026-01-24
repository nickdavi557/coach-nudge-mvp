import { useApp } from '../../contexts/AppContext';
import { SuperviseeCard } from './SuperviseeCard';

export function SuperviseeList() {
  const { state } = useApp();

  if (state.supervisees.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">Your Supervisees</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {state.supervisees.map((supervisee) => (
          <SuperviseeCard key={supervisee.id} supervisee={supervisee} />
        ))}
      </div>
    </div>
  );
}
