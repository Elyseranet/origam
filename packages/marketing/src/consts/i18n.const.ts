import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { LocaleObject } from '@nuxtjs/i18n'

import { I18N_LOCALE_CODES } from './i18n-codes.const'
import type { TLocaleCode } from '../types/i18n.type'

// Locale messages are split one file per top-level namespace (cf.
// scripts/split-locales.mjs) so 7+ devs can write translations in parallel
// without conflicting on a single monolithic en.json / fr.json. Each entry
// is resolved relative to <restructureDir>/<langDir>
// (src/assets/locales/) and merged at runtime by @nuxtjs/i18n — every
// fragment file keeps its namespace as an explicit top-level key
// (e.g. `{ "nav": { ... } }`), which is required for the merge to nest
// correctly (see dist/runtime/shared/messages.js: deepCopy per file).
//
// The fragment list is discovered from the filesystem rather than hardcoded:
// a hardcoded array turns this file into a shared edit point that every
// namespace ticket has to touch, which is exactly the merge conflict the
// split was meant to remove. Dropping `en/<ns>.json` in place is enough to
// register a namespace. Same discovery strategy as scripts/i18n-check.mjs.
//
// Node-only API: this module is imported solely by nuxt.config.ts (build
// time). It must never be imported from client code.
const LOCALES_DIR = fileURLToPath(new URL('../assets/locales', import.meta.url))

function localeFiles (code: string): string[] {
    return readdirSync(join(LOCALES_DIR, code))
        .filter((file) => file.endsWith('.json'))
        .sort()
        .map((file) => `${code}/${file}`)
}

/** Display metadata per locale code — I18N_LOCALE_CODES stays the single list of valid codes. */
const LOCALE_META: Record<TLocaleCode, { language: string; name: string }> = {
    en: { language: 'en-US', name: 'English' },
    fr: { language: 'fr-FR', name: 'Français' }
}

// NOTE: `fr` currently has fewer fragments than `en` — the `admin` namespace
// has no French translation yet (pre-existing i18n gap, not introduced by the
// split). `pnpm -F @origam/marketing i18n:check` reports it as a parity
// warning.
export const I18N_LOCALES: LocaleObject[] = I18N_LOCALE_CODES.map((code) => ({
    code,
    language: LOCALE_META[code].language,
    name: LOCALE_META[code].name,
    files: localeFiles(code)
}))

export const I18N_COOKIE_KEY = 'origam_locale'
