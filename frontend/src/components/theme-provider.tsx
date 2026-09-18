'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({ theme: 'light', setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) {
      setTheme(stored)
      document.documentElement.className = stored
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
      document.documentElement.className = 'dark'
    }
  }, [])

  const toggleTheme = (t: Theme) => {
    setTheme(t)
    localStorage.setItem('theme', t)
    document.documentElement.className = t
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
