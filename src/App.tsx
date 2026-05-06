import { useState } from 'react'
import TimeTracker from './views/TimeTracker'
import ActivityStats from './views/ActivityStats'
import { useThemeContext } from './hooks/useThemeContext'
import './index.css'

type ViewName = 'TimeTracker' | 'ActivityStats'

const App = () => {
  const [currentView, setCurrentView] = useState<ViewName>('TimeTracker')
  const { theme, setTheme } = useThemeContext()

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

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️'
      case 'dark':
        return '🌙'
      case 'system':
        return '💻'
    }
  }

  return (
    <div id="app-shell">
      <header className="bg-surface border-border-main h-header sticky top-0 z-20 box-border flex items-center justify-between border-b px-4 py-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <div className="w-10"></div>
        <nav className="flex justify-center gap-2.5">
          <button onClick={() => setCurrentView('TimeTracker')} className={getButtonClass('TimeTracker')}>
            記録
          </button>
          <button onClick={() => setCurrentView('ActivityStats')} className={getButtonClass('ActivityStats')}>
            統計
          </button>
        </nav>
        <button
          onClick={toggleTheme}
          className="bg-accent-soft border-border-main flex h-8 w-10 items-center justify-center rounded-lg border text-sm shadow-sm transition-colors hover:opacity-80"
          title={`テーマ切り替え (現在: ${theme})`}
        >
          {getThemeIcon()}
        </button>
      </header>

      <main className="app-main">{renderView()}</main>
    </div>
  )
}

export default App
