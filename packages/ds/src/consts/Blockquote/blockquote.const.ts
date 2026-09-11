import type { TBlockquoteAlign, TBlockquoteLang, TBlockquoteVariant } from '../../types'

/**
 * Closed list of valid `variant` values for `<OrigamBlockquote>`.
 * Exposed so stories / consumers can iterate the matrix without
 * re-typing the literals.
 */
export const BLOCKQUOTE_VARIANTS: ReadonlyArray<TBlockquoteVariant> = [
    'default',
    'elegant',
    'quoted',
    'minimal',
    'pull'
]

/**
 * Closed list of valid `lang` values.
 */
export const BLOCKQUOTE_LANGS: ReadonlyArray<TBlockquoteLang> = [
    'auto',
    'fr',
    'en',
    'es',
    'de'
]

/**
 * Closed list of valid `align` values.
 */
export const BLOCKQUOTE_ALIGNS: ReadonlyArray<TBlockquoteAlign> = [
    'left',
    'center',
    'right'
]

/**
 * Locale → decorative quote glyphs pair (open + close).
 *
 * The `'auto'` entry is filled at runtime by inspecting
 * `document.documentElement.lang`; if that yields nothing, the
 * component falls back to the `'en'` pair. The map is intentionally a
 * plain object (not an enum) so consumers can extend it via a defaults
 * provider in the future without touching the type.
 */
export const QUOTE_MARKS_BY_LANG: Record<Exclude<TBlockquoteLang, 'auto'>, { open: string, close: string }> = {
    fr: { open: '« ', close: ' »' },
    en: { open: '“', close: '”' },
    es: { open: '« ', close: ' »' },
    de: { open: '„', close: '“' }
}

/**
 * Default prop values for `<OrigamBlockquote>`. Centralised so
 * consumers can reference them when authoring their own wrappers.
 */
export const BLOCKQUOTE_DEFAULTS = {
    variant: 'default' as TBlockquoteVariant,
    lang: 'auto' as TBlockquoteLang,
    tag: 'blockquote'
} as const
