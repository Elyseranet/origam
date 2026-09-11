/**
 * Velocity threshold (in **pixels per millisecond**) above which the
 * release is treated as a "fast flick" — `useSheetSwipe` then snaps
 * one step in the direction of motion regardless of how close the
 * current offset is to any specific snap point. Anything slower
 * falls back to nearest-by-distance snapping.
 *
 * 0.5 px/ms ≈ a 200 px swipe in 400 ms, which feels right for a
 * deliberate up/down flick on a phone.
 */
export const SHEET_FAST_FLICK_THRESHOLD = 0.5
