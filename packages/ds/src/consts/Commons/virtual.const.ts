export const UP = -1
export const DOWN = 1

export const BUFFER_PX = 100

/**
 * Item height (px) assumed by `estimateLast()` when neither the
 * `itemHeight` prop nor a measured row is available yet — it only has to
 * be small enough that the first paint over-renders rather than
 * under-renders, since a too-large guess shows a single item then jumps.
 */
export const VIRTUAL_FALLBACK_ITEM_HEIGHT_PX = 16

/**
 * Idle gap (ms) between two scroll events above which the next event is
 * treated as the START of a new scroll sequence: the velocity is reset to
 * a plain direction sign and `markerOffset` is re-measured (a reflow we
 * deliberately pay only once per sequence).
 */
export const VIRTUAL_SCROLL_SEQUENCE_MS = 500

/** Default animation duration (ms) for `scrollToIndex` when neither the
 *  per-call options nor the `scrollDuration` prop provide one. */
export const VIRTUAL_SCROLL_DURATION_MS = 300

/** Default easing name forwarded to `useGoTo` — see `goTo.util.ts`'s
 *  `patterns` map for the available names. */
export const VIRTUAL_SCROLL_EASING = 'easeInOutCubic'