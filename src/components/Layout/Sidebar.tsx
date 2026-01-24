import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { getInitials } from '../../utils/helpers';
import { useState } from 'react';
import { AddSuperviseeModal } from '../Supervisee/AddSuperviseeModal';

export function Sidebar() {
  const { state } = useApp();
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              location.pathname === '/'
                ? 'bg-bain-red text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="font-medium">Dashboard</span>
          </Link>
        </div>

        <div className="px-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Supervisees
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Add supervisee"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {state.supervisees.length === 0 ? (
            <p className="text-sm text-gray-500 px-3 py-2">No supervisees yet</p>
          ) : (
            state.supervisees.map((supervisee) => {
              const isActive = location.pathname === `/supervisee/${supervisee.id}`;
              return (
                <Link
                  key={supervisee.id}
                  to={`/supervisee/${supervisee.id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-50 text-bain-red'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isActive
                        ? 'bg-bain-red text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {getInitials(supervisee.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{supervisee.name}</p>
                    <p className="text-xs text-gray-500">
                      {supervisee.notes.length} notes
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Supervisee
          </button>
        </div>
      </aside>

      {showAddModal && (
        <AddSuperviseeModal onClose={() => setShowAddModal(false)} />
      )}
    </>
  );
}
