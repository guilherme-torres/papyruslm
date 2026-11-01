import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { THEMES, ThemeContext, type Theme } from '@/hooks/use-theme'

const STORAGE_KEY = 'theme'
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

function storedTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY)
    return THEMES.find((theme) => theme === stored) ?? 'system'
}

function applyTheme(theme: Theme) {
    const resolved = theme === 'system' ? (matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light') : theme
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    root.style.colorScheme = resolved
}

interface ThemeProviderProps {
    children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(storedTheme)

    useEffect(() => {
        applyTheme(theme)
        if (theme !== 'system') return
        const media = matchMedia(DARK_MEDIA_QUERY)
        const onChange = () => applyTheme('system')
        media.addEventListener('change', onChange)
        return () => media.removeEventListener('change', onChange)
    }, [theme])

    const value = useMemo(
        () => ({
            theme,
            setTheme: (next: Theme) => {
                localStorage.setItem(STORAGE_KEY, next)
                setThemeState(next)
            },
        }),
        [theme],
    )

    return <ThemeContext value={value}>{children}</ThemeContext>
}
