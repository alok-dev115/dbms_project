import { createContext, useContext, useMemo, useState } from 'react'

const AppContext = createContext(null)

const LS_FILTERS = 're_filters'
const LS_THEME = 're_theme'

export function AppProvider({ children }) {
  const [propertyFilters, setPropertyFilters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_FILTERS) || '{}')
    } catch {
      return {}
    }
  })
  const [theme, setTheme] = useState(() => localStorage.getItem(LS_THEME) || 'light')

  const persistFilters = (next) => {
    setPropertyFilters(next)
    localStorage.setItem(LS_FILTERS, JSON.stringify(next))
  }

  const toggleTheme = () => {
    const n = theme === 'dark' ? 'light' : 'dark'
    setTheme(n)
    localStorage.setItem(LS_THEME, n)
    document.documentElement.setAttribute('data-bs-theme', n)
  }

  const value = useMemo(
    () => ({
      propertyFilters,
      setPropertyFilters: persistFilters,
      theme,
      toggleTheme,
    }),
    [propertyFilters, theme],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
