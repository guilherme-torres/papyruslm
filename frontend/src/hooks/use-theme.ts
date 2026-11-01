import { createContext, useContext } from 'react'

export const THEMES = ['light', 'dark', 'system'] as const

export type Theme = (typeof THEMES)[number]

export interface ThemeState {
    theme: Theme
    setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeState | null>(null)

export function useTheme(): ThemeState {
    const context = useContext(ThemeContext)
    if (!context) throw new Error('useTheme must be used within a ThemeProvider')
    return context
}
