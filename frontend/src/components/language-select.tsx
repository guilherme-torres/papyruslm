import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SUPPORTED_LANGUAGES, type Language } from '@/i18n'

const LANGUAGE_NAMES: Record<Language, string> = {
    'pt-BR': 'Português',
    en: 'English',
}

const LANGUAGE_ITEMS = SUPPORTED_LANGUAGES.map((language) => ({ value: language, label: LANGUAGE_NAMES[language] }))

export function LanguageSelect() {
    const { t, i18n } = useTranslation()
    const current = SUPPORTED_LANGUAGES.find((language) => language === i18n.resolvedLanguage) ?? 'pt-BR'

    return (
        <Select
            items={LANGUAGE_ITEMS}
            value={current}
            onValueChange={(language: Language | null) => {
                if (language) void i18n.changeLanguage(language)
            }}
        >
            <SelectTrigger size="sm" aria-label={t('header.language')}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
                {LANGUAGE_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                        {item.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
