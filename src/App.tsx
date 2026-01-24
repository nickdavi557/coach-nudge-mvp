import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Layout/Header'
import { Sidebar } from './components/Layout/Sidebar'
import { Dashboard } from './components/Dashboard/Dashboard'
import { SuperviseeDetail } from './components/Supervisee/SuperviseeDetail'
import { NudgeModal } from './components/Nudges/NudgeModal'
import { useApp } from './contexts/AppContext'

function App() {
  const { state } = useApp()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64 mt-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/supervisee/:id" element={<SuperviseeDetail />} />
          </Routes>
        </main>
      </div>
      {state.activeNudge && <NudgeModal />}
    </div>
  )
}

export default App
