import { INLINE } from '../Commons/anchor.enum'

/**
 * Side of the audio surface where the album cover is painted relative
 * to the controller / metadata column. Consumed by `<OrigamAudio>` to
 * flip the flex direction of the layout row.
 *
 * Mirrors `INLINE` (see `Commons/anchor.enum.ts`) 1:1 — both name the
 * same physical inline-axis pair (`left` / `right`). Kept as its own
 * exported symbol for backward compatibility with the public API
 * (`COVER_POSITION.LEFT`), but re-exports `INLINE` rather than
 * redeclaring its values.
 */
export { INLINE as COVER_POSITION }
