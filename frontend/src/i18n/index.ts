import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from '@/i18n/locales/en.json'
import ptBR from '@/i18n/locales/pt-BR.json'

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en'] as const

export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export const defaultNS = 'translation'

export const resources = {
    'pt-BR': { translation: ptBR },
    en: { translation: en },
} as const

i18n.on('languageChanged', (language) => {
    document.documentElement.lang = language
})

void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        defaultNS,
        fallbackLng: 'pt-BR',
        supportedLngs: SUPPORTED_LANGUAGES,
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            convertDetectedLanguage: (language) => (language.toLowerCase().startsWith('en') ? 'en' : 'pt-BR'),
        },
    })

export { i18n }
