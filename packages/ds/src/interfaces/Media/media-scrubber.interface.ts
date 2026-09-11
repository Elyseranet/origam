import type {
    IColorProps,
    ICommonsComponentProps,
    IRoundedProps
} from '../../interfaces'

import type { TMediaScrubberOrientation } from '../../types'

/**
 * Props for `<OrigamMediaScrubber>` — a headless, media-agnostic
 * value-on-a-track widget. Owns NO state: the parent controls
 * `modelValue` and listens to `update:modelValue` / `change` / `drag*`
 * / `hover` events. Used internally by `<OrigamVideo>` (and soon
 * `<OrigamAudio>`) for the timeline AND the volume slider — both share
 * the exact same drag / keyboard / ARIA pipeline; only the orientation
 * and the `buffered` channel differ.
 *
 * Defaults are inlined inside `withDefaults` (cf. CLAUDE.md
 * `withDefaults` rule) — this interface only types the public API.
 */
export interface IMediaScrubberProps extends ICommonsComponentProps, IColorProps, IRoundedProps {
    /**
     * Current value, between `min` and `max`. Supports `v-model`.
     * The component never mutates this directly — every change is
     * surfaced via `update:modelValue` so the parent stays the
     * single source of truth.
     */
    modelValue: number
    /**
     * Lower bound of the value range.
     *
     * @default 0
     */
    min?: number
    /**
     * Upper bound of the value range. Required to compute the thumb
     * position. Passing `0` (or any value `<= min`) freezes the
     * scrubber at the start.
     */
    max: number
    /**
     * Discrete step. `0` (default) means continuous — pointer events
     * emit the raw float; positive values snap each emission to the
     * nearest multiple.
     *
     * @default 0
     */
    step?: number
    /**
     * Optional buffered position (typically the end of the browser's
     * media buffer). Renders the `__buffer` bar from `min` up to
     * `buffered`. Pass `undefined` to hide the bar entirely.
     */
    buffered?: number
    /**
     * Layout axis. Horizontal = YouTube timeline shape, Vertical =
     * volume / level meter shape (top of track = `max`,
     * bottom of track = `min`).
     *
     * @default 'horizontal'
     */
    orientation?: TMediaScrubberOrientation
    /**
     * Disables pointer + keyboard interaction. The element drops out
     * of the tab order (`tabindex="-1"`) and pointer events become
     * no-ops; styling stays untouched so consumers can paint their
     * own disabled state via `:has(.origam-media-scrubber--disabled)`
     * or similar.
     *
     * @default false
     */
    disabled?: boolean
    /**
     * Hides the thumb at rest and reveals it on hover / focus / drag —
     * the YouTube pattern. When `false`, the thumb is always visible.
     *
     * @default false
     */
    showThumbOnHoverOnly?: boolean
    /**
     * Shows a tooltip above the cursor (horizontal only) reflecting
     * the hovered value. Content can be overridden via the `#tooltip`
     * slot.
     *
     * @default false
     */
    showHoverTooltip?: boolean
    /**
     * Formatter for the default hover tooltip label. Receives the
     * hovered value, returns the string to render.
     *
     * @default value => String(value)
     */
    formatHoverTooltip?: (value: number) => string
    /**
     * Accessibility label — read by screen readers when the
     * scrubber gains focus. Always pass a translated string here.
     * Declared optional to allow Volar to map the kebab-case `:aria-label`
     * attribute from parent templates without a required-prop error.
     */
    ariaLabel?: string
    /**
     * Optional human-readable representation of the current value
     * (e.g. `"1:23"` for a timestamp, `"45 %"` for a volume).
     * Mapped to `aria-valuetext`.
     */
    ariaValueText?: string
    /**
     * Optional `data-cy` test selector forwarded by the parent
     * (`OrigamMediaController`, `OrigamMediaVolumeControl`) as a
     * camelCase Vue prop. Passed through `$attrs` to the host element.
     */
    dataCy?: string
}

/**
 * Emits for `<OrigamMediaScrubber>`.
 */
export interface IMediaScrubberEmits {
    /** Live value update — fires during drag, keyboard, and click. */
    (e: 'update:modelValue', value: number): void
    /** Commit event — fires on pointerup / pointercancel after a drag. */
    (e: 'change', value: number): void
    /** Drag has started (pointerdown captured). */
    (e: 'dragstart'): void
    /** Drag has ended (pointerup / pointercancel). */
    (e: 'dragend'): void
    /** Hover position — fires with the hovered value on pointermove,
     *  and with `null` on pointerleave (cursor left the track). */
    (e: 'hover', value: number | null): void
}

/**
 * Slot signatures for `<OrigamMediaScrubber>`.
 */
export interface IMediaScrubberSlots {
    /**
     * Hover-tooltip body. Receives the hovered value. Only rendered
     * when `showHoverTooltip=true` AND the cursor sits over the
     * track (horizontal orientation).
     */
    tooltip?: (bindings: { value: number }) => any
}
