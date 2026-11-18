import { I18N_LOCALE_CODES } from './i18n-codes.const'
import { MARKETING_DEFAULTS } from './marketing.const'
import type { TLocaleCode } from '../types/i18n.type'

export const KNOWN_LOCALES: ReadonlySet<string> = new Set(I18N_LOCALE_CODES)

/** The site's default locale — reused from MARKETING_DEFAULTS, never re-hardcoded. */
export const DEFAULT_LOCALE: TLocaleCode = MARKETING_DEFAULTS.defaultLocale as TLocaleCode
