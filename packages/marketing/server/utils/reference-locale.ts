/**
 * reference-locale.ts — locale query-param resolution shared by every
 * /api/reference/** handler (ADR #325, task 3).
 *
 * `resolveLocale(rawLocale)` validates a raw `?locale=` value against the
 * site's known locale codes (src/consts/i18n-codes.const.ts — the same list
 * @nuxtjs/i18n is configured with, cf. src/consts/i18n.const.ts) and falls
 * back to the default locale for anything missing, malformed, or unknown.
 *
 * Design choices:
 *   - Pure function (no H3Event / h3 dependency) — takes the already-read
 *     query value so it stays trivially unit-testable and has zero coupling
 *     to the request object shape.
 *   - NEVER throws. An invalid or unrecognised locale is a soft-fallback,
 *     not a 4xx: the ADR is explicit that missing/garbage `?locale=` must not
 *     break the request, only degrade to the default locale.
 *   - Import paths to src/consts + src/types use relative paths from
 *     server/utils/, same convention as reference-mappers.ts — the `~` alias
 *     resolves to the Nuxt project root in server context, not to src/.
 */

import { I18N_LOCALE_CODES } from '../../src/consts/i18n-codes.const'
import { MARKETING_DEFAULTS } from '../../src/consts/marketing.const'
import type { TLocaleCode } from '../../src/types/i18n.type'

const KNOWN_LOCALES: ReadonlySet<string> = new Set(I18N_LOCALE_CODES)

/** The site's default locale — reused from MARKETING_DEFAULTS, never re-hardcoded. */
export const DEFAULT_LOCALE: TLocaleCode = MARKETING_DEFAULTS.defaultLocale as TLocaleCode

/**
 * Resolves a raw `?locale=` query value to a known TLocaleCode.
 * Anything that isn't a string, or isn't one of I18N_LOCALE_CODES, silently
 * degrades to DEFAULT_LOCALE — it never throws.
 */
export function resolveLocale (rawLocale: unknown): TLocaleCode {
    if (typeof rawLocale !== 'string') return DEFAULT_LOCALE
    return KNOWN_LOCALES.has(rawLocale) ? (rawLocale as TLocaleCode) : DEFAULT_LOCALE
}
