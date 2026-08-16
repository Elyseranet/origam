export enum ALIGN {
    START = 'start',
    END = 'end',
    CENTER = 'center',
    BASELINE = 'baseline',
    STRETCH = 'stretch'
}

/**
 * PHYSICAL text alignment (`text-align`), as opposed to the LOGICAL box
 * alignment above (`ALIGN` = start/end/…). The two vocabularies are not
 * interchangeable: `text-align` has no `start`/`end`/`stretch` rungs in
 * the DS surface, and box alignment has no `left`/`right`.
 *
 * Consumed by `<OrigamBlockquote>` (full set) and `<OrigamEmptyState>`
 * (`left` / `center` only — see `TEmptyStateAlign`).
 */
export enum TEXT_ALIGN {
    LEFT = 'left',
    CENTER = 'center',
    RIGHT = 'right'
}
