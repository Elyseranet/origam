/*********************************************************
 * WATERMARK_DEFAULT_GAP_PX and other WATERMARK_DEFAULT_* constants
 *
 * @description
 * Default tile geometry — chosen to roughly match the spacing of
 * confidential-document watermarks in print previews (one glyph every
 * ~12 cm at standard zoom).
 *
 * @description
 * Mirrored verbatim inside the SFC `withDefaults(defineProps<…>())`
 * blocks of `<OrigamWatermark>` per the CLAUDE.md "inline literals
 * only" rule — these constants exist for downstream consumers
 * (composable users, docs, tests) so they can reference the canonical
 * default value instead of magic-stringing it.
 ********************************************************/
export const WATERMARK_DEFAULT_GAP_PX = 120
export const WATERMARK_DEFAULT_FONT_SIZE_PX = 16
export const WATERMARK_DEFAULT_OPACITY = 0.1
export const WATERMARK_DEFAULT_ANGLE_DEG = -30
export const WATERMARK_DEFAULT_COLOR = 'currentColor'
export const WATERMARK_DEFAULT_FONT_FAMILY = 'inherit'
export const WATERMARK_DEFAULT_FONT_WEIGHT: number | string = 400
export const WATERMARK_DEFAULT_Z_INDEX = 1
export const WATERMARK_DEFAULT_POINTER_EVENTS: 'none' | 'auto' = 'none'

/*********************************************************
 * WATERMARK_MIN_FONT_SIZE_PX / WATERMARK_MIN_IMAGE_SIZE_PX
 *
 * @description
 * Floors applied when building the repeating pattern tile.
 *
 * @description
 * `MIN_FONT_SIZE_PX` guards the tile geometry: `gap + fontSize` must
 * stay strictly positive, otherwise a `fontSize: 0` collapses the tile
 * to `gap × gap` and, with `gap: 0` too, to a zero-sized SVG the
 * browser refuses to paint.
 *
 * @description
 * `MIN_IMAGE_SIZE_PX` is the smallest an image glyph is drawn at — a
 * logo scaled down to a text-sized box is unreadable, so an image
 * watermark never renders below this even when `fontSize` is lower.
 ********************************************************/
export const WATERMARK_MIN_FONT_SIZE_PX = 1
export const WATERMARK_MIN_IMAGE_SIZE_PX = 16

/*********************************************************
 * WATERMARK_DATA_ATTR
 *
 * @description
 * Marker attribute applied to every layer created via
 * `install()` / `<OrigamWatermark>`. Used by the anti-tamper
 * MutationObserver to detect "is this MY layer that just got removed?"
 * and re-inject it.
 ********************************************************/
export const WATERMARK_DATA_ATTR = 'data-origam-watermark'
