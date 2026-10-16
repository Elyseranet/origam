import type { I18N_LOCALE_CODES } from '~/consts/i18n-codes.const'

/** One of the site's supported locale codes ('en' | 'fr'), derived from I18N_LOCALE_CODES. */
export type TLocaleCode = typeof I18N_LOCALE_CODES[number]

/** Signature of `useT().t`, for pure utils that receive the translator as an argument. */
export type TTranslate = (key: string, fallback?: string, named?: Record<string, unknown>) => string
