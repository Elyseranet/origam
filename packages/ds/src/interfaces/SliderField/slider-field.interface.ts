import type {
    IBorderProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDensityProps,
    IDirectionProps,
    IElevationProps,
    IFocusEmits,
    IFocusProps,
    IInputProps,
    IMarginProps,
    IPaddingProps,
    IRippleProps,
    IRoundedProps,
    ISliderFieldTrackProps
} from '../../interfaces'

import type {
    TAlways,
    TSize,
    TSliderFieldMode
} from '../../types'

export interface ISliderFieldProps extends ICommonsComponentProps, IDensityProps, IColorProps, IInputProps, IFocusProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IElevationProps, IRippleProps, IDirectionProps {
    disabled?: boolean
    required?: boolean
    label?: string
    error?: boolean
    readonly?: boolean
    max?: number | string
    min?: number | string
    step?: number | string
    /**
     * Visual props forwarded to the track sub-component (rail / fill / ticks).
     * Color / size / rounded only — pointer math is owned by the native
     * `<input type="range">`.
     */
    trackProps?: ISliderFieldTrackProps
    reverse?: boolean
    modelValue?: number | string | Array<number> | Array<string>
    range?: boolean

    showTicks?: TAlways
    ticks?: Array<number> | Record<string, string>
    tickSize?: TSize | number
    /**
     * Compact "inset" style — the draggable thumb sits **inside** the
     * track (smaller, no overflow). Mirrors `OrigamSwitch`'s `inset`
     * flag. Useful in tight contexts like a volume tooltip or a compact
     * form row.
     *
     * @default false
     */
    inset?: boolean

    /**
     * Usage mode of the slider. Renamed from `variant` (ADR-005, Q4) — it
     * switches between three structurally different renders, not only
     * paint, so it stayed a discriminant prop instead of joining the
     * props-preset model.
     *
     * - `'field'`  → default, wraps the slider in `<origam-input>` chrome
     *               (label, messages, prepend/append). Use for form-grade
     *               sliders (e.g. settings panels, ColorPicker HSL slider).
     * - `'timer'`  → bare wrapper without `<origam-input>`. Hairline rail
     *               (2 px at rest, 4 px on hover/focus), thumb hidden
     *               until hover/focus/scrub. Use for media-scrubber-style
     *               UI (video timeline, volume slider).
     * - `'audio'`  → same as `timer`, plus a waveform background painted
     *               from `peaks`. Use for `OrigamAudio` waveform scrubbing.
     *
     * @default 'field'
     */
    mode?: TSliderFieldMode

    /**
     * Secondary fill rendered from `min` to `buffered`, layered behind
     * the active fill at reduced opacity. Mirrors a video player's
     * "loaded ranges" indicator. Has no effect when undefined.
     */
    buffered?: number

    /**
     * Hide the thumb at rest and only reveal it on container `:hover`,
     * `:focus-within`, or during a drag. CSS-only — no JS state.
     *
     * For `mode='timer'` and `mode='audio'`, this is effectively
     * always on (forced via the mode's class). For `mode='field'`,
     * the consumer must opt in explicitly.
     *
     * @default false
     */
    showThumbOnHoverOnly?: boolean

    /**
     * Render a small floating tooltip above the rail showing the value
     * under the cursor. The cursor X position is forwarded as a CSS
     * variable updated in a single RAF-throttled `pointermove` handler.
     *
     * @default false
     */
    showHoverTooltip?: boolean

    /**
     * Formatter applied to the hover tooltip text. Receives the value
     * under the cursor (clamped to `[min, max]`).
     *
     * @default (value: number) => String(value)
     */
    formatHoverTooltip?: (value: number) => string

    /**
     * Waveform peaks in the range `[0, 1]`. When set with
     * `mode='audio'`, peaks are painted as vertical bars BEHIND the
     * track via inline SVG: bars left of the thumb use the active color,
     * bars right use a 35 %-mixed fade. No effect for other modes.
     */
    peaks?: ReadonlyArray<number>
}

/** Emits fired by `<OrigamSliderField>` — v-model + focus + drag lifecycle
 *  (`start` fires on pointerdown of a thumb, `end` on pointerup). */
export interface ISliderFieldEmits extends ICommonsComponentEmits, IFocusEmits {
    (e: 'start', value: number | string | Array<number> | Array<string>): void
    (e: 'end', value: number | string | Array<number> | Array<string>): void
}
