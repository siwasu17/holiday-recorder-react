import React, { useState } from 'react'
import TimeTracker from './views/TimeTracker'
import ActivityStats from './views/ActivityStats'
import './index.css'
import './App.css'

type ViewName = 'TimeTracker' | 'ActivityStats'

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewName>('TimeTracker')

  const renderView = () => {
    switch (currentView) {
      case 'TimeTracker':
        return <TimeTracker />
      case 'ActivityStats':
        return <ActivityStats />
      default:
        return <TimeTracker />
    }
  }

  return (
    <div id="app-shell">
      <header className="app-header">
        <nav className="app-nav">
          <button
            onClick={() => setCurrentView('TimeTracker')}
            className={currentView === 'TimeTracker' ? 'active' : ''}
          >
            トラッカー
          </button>
          <button
            onClick={() => setCurrentView('ActivityStats')}
            className={currentView === 'ActivityStats' ? 'active' : ''}
          >
            統計
          </button>
        </nav>
      </header>

      <main className="app-main">
        {renderView()}
      </main>
    </div>
  )
}

export default App
