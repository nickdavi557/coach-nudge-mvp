import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { QuickStats } from './QuickStats';
import { ActivityFeed } from './ActivityFeed';
import { SuperviseeList } from '../Supervisee/SuperviseeList';
import { DemoControls } from '../Demo/DemoControls';
import { AddSuperviseeModal } from '../Supervisee/AddSuperviseeModal';

export function Dashboard() {
  const { state } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const isEmpty = state.supervisees.length === 0;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Manage your supervisees and coaching insights
          </p>
        </div>
        <DemoControls />
      </div>

      {isEmpty ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to CoachNudge
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Start by adding your first supervisee. You can add their coaching
            preferences and begin capturing observations.
          </p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            Add Your First Supervisee
          </button>
        </div>
      ) : (
        <>
          <QuickStats />
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <SuperviseeList />
            </div>
            <div>
              <ActivityFeed />
            </div>
          </div>
        </>
      )}

      {showAddModal && (
        <AddSuperviseeModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
