import OrigamBlockquote from '../../components/Blockquote/OrigamBlockquote.vue'

import { BLOCKQUOTE_LANG, BLOCKQUOTE_VARIANT } from '../../enums/Blockquote/blockquote.enum'
import { TEXT_ALIGN } from '../../enums/Commons/align.enum'

export type TOrigamBlockquote = InstanceType<typeof OrigamBlockquote>

/**
 * Horizontal alignment of the citation body. `pull` variant defaults to
 * `'center'`; every other variant defaults to `'left'`.
 */
export type TBlockquoteAlign = `${TEXT_ALIGN}`

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
export type TBlockquoteLang = `${BLOCKQUOTE_LANG}`

/**
 * Visual variants for `<OrigamBlockquote>`. Each variant is a self
 * contained typographic treatment; consumers do not mix them — pick the
 * one that fits the surrounding content density.
 *
 * - `default`  — left accent bar + comfortable padding-inline. Neutral
 *                rhythm, fits most prose contexts.
 * - `elegant`  — serif face, italic, more breathing room. Editorial
 *                long-form content (essays, articles).
 * - `quoted`   — large decorative open/close marks (locale-aware,
 *                see `TBlockquoteLang`). Marketing pages, hero quotes.
 * - `minimal`  — bare italic + small indent. Inline citations inside
 *                technical docs where the visual must stay quiet.
 * - `pull`     — pull quote: large body type, centred, extracted out of
 *                the flow. Use sparingly — one per article max.
 */
export type TBlockquoteVariant = `${BLOCKQUOTE_VARIANT}`
