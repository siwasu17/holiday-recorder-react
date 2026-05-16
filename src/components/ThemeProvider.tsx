import React, { ReactNode } from 'react'
import { useTheme } from '../hooks/useTheme'
import { ThemeContext } from '../context/ThemeContext'

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const themeState = useTheme()

  return <ThemeContext.Provider value={themeState}>{children}</ThemeContext.Provider>
}
