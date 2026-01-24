import { useApp } from '../../contexts/AppContext';

export function Header() {
  const { state } = useApp();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-bain-red rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CN</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">CoachNudge</h1>
        </div>

        <div className="flex items-center gap-4">
          {state.demoMode && (
            <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded">
              Demo Mode
            </span>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
