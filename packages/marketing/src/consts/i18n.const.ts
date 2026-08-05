import type { LocaleObject } from '@nuxtjs/i18n'

// Locale messages are single monolithic files per language, resolved
// relative to <restructureDir>/<langDir> (src/assets/locales/) and loaded
// by @nuxtjs/i18n. Both locales are at parity (1336 leaf keys each) — no
// namespace split, no discovery step needed.
export const I18N_LOCALES: LocaleObject[] = [
    {
        code: 'en',
        language: 'en-US',
        name: 'English',
        file: 'en.json'
    },
    {
        code: 'fr',
        language: 'fr-FR',
        name: 'Français',
        file: 'fr.json'
    }
]

export const I18N_COOKIE_KEY = 'origam_locale'
