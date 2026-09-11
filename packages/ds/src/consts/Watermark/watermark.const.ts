/**
 * Default tile geometry — chosen to roughly match the spacing of
 * confidential-document watermarks in print previews (one glyph every
 * ~12 cm at standard zoom).
 *
 * Mirrored verbatim inside the SFC `withDefaults(defineProps<…>())`
 * blocks of `<OrigamWatermark>` per the CLAUDE.md "inline literals
 * only" rule — these constants exist for downstream consumers
 * (composable users, docs, tests) so they can reference the canonical
 * default value instead of magic-stringing it.
 */
export const WATERMARK_DEFAULT_GAP_PX = 120
export const WATERMARK_DEFAULT_FONT_SIZE_PX = 16
export const WATERMARK_DEFAULT_OPACITY = 0.1
export const WATERMARK_DEFAULT_ANGLE_DEG = -30
export const WATERMARK_DEFAULT_COLOR = 'currentColor'
export const WATERMARK_DEFAULT_FONT_FAMILY = 'inherit'
export const WATERMARK_DEFAULT_FONT_WEIGHT: number | string = 400
export const WATERMARK_DEFAULT_Z_INDEX = 1
export const WATERMARK_DEFAULT_POINTER_EVENTS: 'none' | 'auto' = 'none'

/**
 * Marker attribute applied to every layer created via
 * `install()` / `<OrigamWatermark>`. Used by the anti-tamper
 * MutationObserver to detect "is this MY layer that just got removed?"
 * and re-inject it.
 */
export const WATERMARK_DATA_ATTR = 'data-origam-watermark'
