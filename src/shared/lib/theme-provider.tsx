import { create } from 'zustand'
import { createContext, useContext, type ReactNode } from 'react'
import { Platform } from 'react-native'

export type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  isDark: boolean
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  isDark: false,
  toggleTheme: () => {
    const newMode = get().mode === 'light' ? 'dark' : 'light'
    set({ mode: newMode, isDark: newMode === 'dark' })
    if (Platform.OS === 'web') {
      if (newMode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  },
  setTheme: (mode: ThemeMode) => {
    set({ mode, isDark: mode === 'dark' })
    if (Platform.OS === 'web') {
      if (mode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  },
}))

const ThemeContext = createContext<ThemeState | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={useThemeStore()}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}