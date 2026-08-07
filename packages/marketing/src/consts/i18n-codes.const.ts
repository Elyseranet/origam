/**
 * i18n-codes.const.ts — the list of supported locale codes, and nothing else.
 *
 * Kept separate from `i18n.const.ts` so that Nitro server code can validate a
 * `?locale=` query param without importing anything else: `i18n.const.ts`
 * pulls the `LocaleObject` type from `@nuxtjs/i18n` and is written for the
 * build-time context (it is consumed by `nuxt.config.ts`). Importing it from a
 * request handler would drag that module into the server bundle for the sake
 * of two strings.
 *
 * This file has zero imports and zero side effects, so both
 * `i18n.const.ts` (build-time enrichment with display metadata) and
 * `server/utils/reference-locale.ts` (request-time validation) can depend on
 * it without either re-declaring the list.
 *
 * Adding a locale: add the code here, then give it a row in `LOCALE_META`
 * (`i18n.const.ts`) and ship `src/assets/locales/<code>.json`.
 */
export const I18N_LOCALE_CODES = ['en', 'fr'] as const
