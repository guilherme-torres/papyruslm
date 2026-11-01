import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme, type Theme } from '@/hooks/use-theme'

const THEME_OPTIONS = [
    { value: 'light', labelKey: 'theme.light', icon: SunIcon },
    { value: 'dark', labelKey: 'theme.dark', icon: MoonIcon },
    { value: 'system', labelKey: 'theme.system', icon: MonitorIcon },
] as const

export function ModeToggle() {
    const { t } = useTranslation()
    const { theme, setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={t('theme.toggle')} />}>
                <SunIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <MoonIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto">
                <DropdownMenuRadioGroup value={theme} onValueChange={(value: Theme) => setTheme(value)}>
                    {THEME_OPTIONS.map(({ value, labelKey, icon: Icon }) => (
                        <DropdownMenuRadioItem key={value} value={value}>
                            <Icon />
                            {t(labelKey)}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
