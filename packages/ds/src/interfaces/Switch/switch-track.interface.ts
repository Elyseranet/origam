import type {
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ICommonsComponentSlots,
    IElevationProps,
    IRoundedProps
} from '../../interfaces'

/**
 * Props for `<OrigamSwitchTrack>` — the rounded "rail" sitting behind the
 * Switch thumb. The track owns its own visual surface (background, border,
 * inset variant, error state, rounded/elevation identity) and exposes slots
 * for content shown on the `true` (left) and `false` (right) sides of the
 * rail.
 *
 * Color contract — strict channel separation:
 *  • `bgColor` paints the rail (the box behind the thumb).
 *  • `color`   is the foreground intent inherited from the parent
 *              SelectionControl (it paints the thumb via `currentColor`,
 *              not the track) — exposed here so the slot content can
 *              react to it (e.g. an icon inside `track.true`).
 *
 * `border` / `rounded` / `elevation` (props-first, lot 4 theming fix):
 * previously declared on `ISwitchProps` (inherited from the Commons
 * interfaces) but never consumed anywhere — `OrigamSwitch.vue` accepted
 * the props without a TS error yet silently dropped them, and the track
 * (the actual visible rail) didn't even have them in its own interface.
 * A theme could set `'origam-switch': { border: true, rounded: 'lg' }`
 * and nothing would render differently. Declared here now because the
 * track is the element that owns the visual surface these props target —
 * `OrigamSwitch` forwards its own values down via `filterProps`.
 */
export interface ISwitchTrackProps extends ICommonsComponentProps, IColorProps, IBgColorProps, IBorderProps, IRoundedProps, IElevationProps {
    /** Whether the switch is currently ON. Drives the `--dirty` modifier. */
    modelValue?: boolean
    /** Validation state forwarded from the surrounding `<OrigamInput>`. */
    isValid?: boolean | null
    /** Disabled state — applies the muted token + cursor. */
    disabled?: boolean
    /** Readonly state — keeps appearance interactive but blocks input. */
    readonly?: boolean
    /**
     * Error state — overrides the rail with the danger token. Same type
     * as the Commons `IValidationProps.error` (`string | boolean` — a
     * string is an error message, truthy either way) so a parent
     * forwarding its own validation surface (OrigamSwitch) stays
     * type-compatible. Consumed by truthiness only.
     */
    error?: string | boolean
    /** Inset (Material) variant — taller, fully-rounded rail. */
    inset?: boolean
}

export interface ISwitchTrackEmits extends ICommonsComponentEmits {
    (e: 'click', event: MouseEvent): void
}

/**
 * Slot payload — `model` and `isValid` are forwarded so the consumer can
 * render contextual content (a checkmark on ON, an `x` on OFF, …).
 */
export interface ISwitchTrackSlotsProps {
    model: boolean
    isValid: boolean | null
}

export interface ISwitchTrackSlots extends ICommonsComponentSlots {
    'track.true'?: (props: ISwitchTrackSlotsProps) => any
    'track.false'?: (props: ISwitchTrackSlotsProps) => any
    /**
     * Free-form overlay rendered inside the track AFTER the
     * `track.true` / `track.false` half-labels. Used by `OrigamSwitch`
     * to host a linear progress bar when `loading={ type: 'line' }`,
     * but consumers can put any absolute-positioned decoration here
     * (gradient sweep, sparkles, …) without subclassing the track.
     */
    overlay?: (props: ISwitchTrackSlotsProps) => any
}
