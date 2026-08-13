import type { TDirection } from '../Commons/direction.type'

/**
 * Layout axis for `<OrigamMediaScrubber>`. Horizontal is the default,
 * matches the YouTube timeline shape; vertical is the volume / level
 * meter shape (top = max, bottom = min).
 *
 * Mirrors the global `TDirection` so the scrubber plays nicely with the
 * rest of the design system's direction props.
 */
export type TMediaScrubberOrientation = TDirection
