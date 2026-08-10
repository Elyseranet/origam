import type { I18N_LOCALE_CODES } from '~/consts/i18n-codes.const'

/** One of the site's supported locale codes ('en' | 'fr'), derived from I18N_LOCALE_CODES. */
export type TLocaleCode = typeof I18N_LOCALE_CODES[number]
