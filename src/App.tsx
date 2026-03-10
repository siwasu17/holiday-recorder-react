import React, { useState } from 'react'
import TimeTracker from './views/TimeTracker'
import ActivityStats from './views/ActivityStats'
import './index.css'

type ViewName = 'TimeTracker' | 'ActivityStats'

const App = () => {
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

  const getButtonClass = (viewName: ViewName) => {
    const isActive = currentView === viewName
    const base =
      'px-[16px] py-[8px] border rounded-[20px] bg-none text-[0.6rem] font-medium cursor-pointer transition-all duration-300'
    const activeClass = 'bg-accent-soft border-border-main text-text-main font-semibold'
    const inactiveClass = 'border-transparent text-text-sub hover:text-text-main'

    return `${base} ${isActive ? activeClass : inactiveClass}`
  }

  return (
    <div id="app-shell">
      <header className="bg-surface border-border-main h-header sticky top-0 z-20 box-border flex items-center justify-center border-b p-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <nav className="flex justify-center gap-2.5">
          <button onClick={() => setCurrentView('TimeTracker')} className={getButtonClass('TimeTracker')}>
            トラッカー
          </button>
          <button onClick={() => setCurrentView('ActivityStats')} className={getButtonClass('ActivityStats')}>
            統計
          </button>
        </nav>
      </header>

      <main className="app-main">{renderView()}</main>
    </div>
  )
}

export default App
