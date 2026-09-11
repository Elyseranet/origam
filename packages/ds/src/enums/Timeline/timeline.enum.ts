/**
 * Which side of the track `<OrigamTimelineItem>` content renders on.
 * `ALTERNATING` flips left/right per item index (even → start, odd →
 * end) — see `contentSide` in `OrigamTimelineItem.vue`.
 */
export enum TIMELINE_SIDE {
    START = 'start',
    END = 'end',
    ALTERNATING = 'alternating'
}
