/**
 * Locale hint for `<OrigamBlockquote>` decorative quote marks. Only
 * relevant for `variant="quoted"` — the other variants ignore the prop.
 *
 * - `'fr'`   — French guillemets : « … »
 * - `'en'`   — Curly double quotes: “ … ”
 * - `'es'`   — Spanish angular quotes: « … » (same glyphs as fr,
 *              kept distinct so future tweaks — e.g. spanish prefers
 *              corner marks ｢ ｣ in some fonts — can branch cleanly).
 * - `'de'`   — German low-9 / high-6 pair: „ … “
 * - `'auto'` — honour the consumer-provided `lang` attribute on the
 *              element OR `<html lang>` if none. Falls back to `'en'`
 *              when no locale is reachable.
 *
 * Resolution lives in `src/consts/Blockquote/blockquote.const.ts`
 * (`QUOTE_MARKS_BY_LANG`).
 */
export type TBlockquoteLang =
    | 'fr'
    | 'en'
    | 'es'
    | 'de'
    | 'auto'
