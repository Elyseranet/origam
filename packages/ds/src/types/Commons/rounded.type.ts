import { ROUNDED, ROUNDED_TOKEN } from '../../enums/Commons/rounded.enum'

/**
 * Every value the `rounded` prop accepts.
 *
 * Two scales, deliberately kept distinct (see `rounded.enum.ts`):
 *   - `ROUNDED` — the component scale, naming an intent (`shaped`, `large`);
 *   - `ROUNDED_TOKEN` — the radius rungs (`md`, `full`), resolved to the
 *     generated utility classes.
 *
 * The token scale was already honoured at runtime but was missing from this
 * type, so `rounded="full"` — the only way to get a circle — failed to
 * type-check and never surfaced in autocompletion.
 */
export type TRounded = `${ROUNDED}` | `${ROUNDED_TOKEN}`

/**
 * Standalone name for the token-rung half of `TRounded` — the
 * abbreviated `none | xs | sm | md | lg | xl | full` vocabulary.
 *
 * Beyond radius, this abbreviated vocabulary is also the DS's generic
 * "how big is this thing" naming convention (mirrors `TDirection`'s
 * role for axis words): other component-scoped size scales that use
 * the same abbreviations — not the same CSS property, just the same
 * string vocabulary — derive their subset from this type instead of
 * redeclaring the strings (e.g. `TGridGapSize`, `TEmptyStateSize`).
 */
export type TRoundedToken = `${ROUNDED_TOKEN}`
