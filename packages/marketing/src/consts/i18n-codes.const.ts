/**
 * i18n-codes.const.ts — pure, filesystem-free list of supported locale codes.
 *
 * Split out of i18n.const.ts on purpose: i18n.const.ts performs `readdirSync`
 * calls at module-evaluation time (to build the full `LocaleObject[]` consumed
 * by nuxt.config.ts, resolving `src/assets/locales/<code>` relative to its own
 * `import.meta.url`). That module is documented as build-time-only — safe from
 * nuxt.config.ts (a Node context with direct access to the source tree), but
 * NOT safe to import from Nitro server code: once bundled into the server
 * output, `import.meta.url` no longer points at `src/consts/`, so the same
 * relative `readdirSync` calls would resolve to the wrong directory (or throw)
 * in production.
 *
 * This file has zero side effects, so both `i18n.const.ts` (build-time
 * enrichment) and `server/utils/reference-locale.ts` (request-time query-param
 * validation) can import ONLY this array without re-declaring the list of
 * supported locales anywhere.
 */
export const I18N_LOCALE_CODES = ['en', 'fr'] as const
