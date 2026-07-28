import type { LocaleObject } from '@nuxtjs/i18n'

// Locale messages are split one file per top-level namespace (cf.
// scripts/split-locales.mjs) so 7+ devs can write translations in parallel
// without conflicting on a single monolithic en.json / fr.json. Each entry
// below is resolved relative to <restructureDir>/<langDir>
// (src/assets/locales/) and merged at runtime by @nuxtjs/i18n — every
// fragment file keeps its namespace as an explicit top-level key
// (e.g. `{ "nav": { ... } }`), which is required for the merge to nest
// correctly (see dist/runtime/shared/messages.js: deepCopy per file).
//
// NOTE: `fr` intentionally has one fewer fragment than `en` — the `admin`
// namespace has no French translation yet (tracked as an existing i18n gap,
// not introduced by this split). `pnpm -F @origam/marketing i18n:check`
// reports this as a parity warning.
const EN_NAMESPACES = [
    'a11y',
    'admin',
    'brand',
    'changelog',
    'chrome',
    'components',
    'footer',
    'home',
    'installation',
    'nav',
    'roadmap',
    'theming',
    'why_origam'
]

const FR_NAMESPACES = [
    'a11y',
    'brand',
    'changelog',
    'chrome',
    'components',
    'footer',
    'home',
    'installation',
    'nav',
    'roadmap',
    'theming',
    'why_origam'
]

export const I18N_LOCALES: LocaleObject[] = [
    {
        code: 'en',
        language: 'en-US',
        name: 'English',
        files: EN_NAMESPACES.map((ns) => `en/${ns}.json`)
    },
    {
        code: 'fr',
        language: 'fr-FR',
        name: 'Français',
        files: FR_NAMESPACES.map((ns) => `fr/${ns}.json`)
    }
]

export const I18N_COOKIE_KEY = 'origam_locale'
