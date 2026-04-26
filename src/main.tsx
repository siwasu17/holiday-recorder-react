import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { migrateFromLocalStorage } from './db/migration'

// データの移行をバックグラウンドで開始
migrateFromLocalStorage()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
