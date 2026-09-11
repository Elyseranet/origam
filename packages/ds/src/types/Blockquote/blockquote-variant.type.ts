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
export type TBlockquoteVariant =
    | 'default'
    | 'elegant'
    | 'quoted'
    | 'minimal'
    | 'pull'
