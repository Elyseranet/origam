import type { LocaleObject } from '@nuxtjs/i18n'

import type { TLocaleCode } from '../types/i18n.type'

import { I18N_LOCALE_CODES } from './i18n-codes.const'

/**
 * Display metadata per locale code. `I18N_LOCALE_CODES` stays the single
 * list of valid codes — adding a locale means adding it there and giving it
 * a row here; nothing else in the app enumerates locales.
 */
const LOCALE_META: Record<TLocaleCode, { language: string, name: string }> = {
    en: { language: 'en-US', name: 'English' },
    fr: { language: 'fr-FR', name: 'Français' }
}

/**
 * Locale messages are one monolithic file per language, resolved relative to
 * `<restructureDir>/<langDir>` (`src/assets/locales/`) and loaded by
 * `@nuxtjs/i18n`. Both locales are at parity — no namespace split, no
 * filesystem discovery step.
 */
export const I18N_LOCALES: LocaleObject[] = I18N_LOCALE_CODES.map((code) => ({
    code,
    language: LOCALE_META[code].language,
    name: LOCALE_META[code].name,
    file: `${ code }.json`
}))

export const I18N_COOKIE_KEY = 'origam_locale'
