import { useEffect } from 'react'
import { Routes, Route, useSearchParams } from 'react-router-dom'
import { Header } from './components/Layout/Header'
import { Sidebar } from './components/Layout/Sidebar'
import { Dashboard } from './components/Dashboard/Dashboard'
import { SuperviseeDetail } from './components/Supervisee/SuperviseeDetail'
import { AssistantDetail } from './components/Assistant/AssistantDetail'
import { NudgeSettings } from './components/Settings/NudgeSettings'
import { CalendarView } from './components/Calendar/CalendarView'
import { NudgeModal } from './components/Nudges/NudgeModal'
import { DemoRunner } from './components/Demo/DemoRunner'
import { useApp } from './contexts/AppContext'

function App() {
  const {
    state, loadCase,
    triggerReflectionNudge, triggerPreMeetingNudge, triggerPostMeetingNudge,
    getMatchedOpportunities,
  } = useApp()
  const [searchParams] = useSearchParams()
  const isDemoMode = searchParams.get('demo') === 'true'
  const isPlaywrightMode = searchParams.get('pw') === 'true'

  // Expose context to Playwright/demo when in demo mode
  useEffect(() => {
    if (!isDemoMode && !isPlaywrightMode) return
    ;(window as any).__demo = {
      state,
      loadCase,
      triggerReflectionNudge,
      triggerPreMeetingNudge,
      triggerPostMeetingNudge,
      getMatchedOpportunities,
    }
    return () => { delete (window as any).__demo }
  }, [isDemoMode, isPlaywrightMode, state, loadCase, triggerReflectionNudge, triggerPreMeetingNudge, triggerPostMeetingNudge, getMatchedOpportunities])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64 mt-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/supervisee/:id" element={<SuperviseeDetail />} />
            <Route path="/assistant/:id" element={<AssistantDetail />} />
            <Route path="/settings" element={<NudgeSettings />} />
          </Routes>
        </main>
      </div>
      {state.activeNudge && <NudgeModal />}
      {isDemoMode && <DemoRunner />}
    </div>
  )
}

export default App
