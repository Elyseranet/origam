import type { IColorProps } from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'

/**
 * Props for `<OrigamMediaVolumeControl>` — the mute / unmute button
 * AND the YouTube-style vertical scrubber tooltip that opens on
 * hover above it.
 *
 * Owns:
 *  - the off/low/medium/high icon swap (driven by `volume` + `muted`),
 *  - the resolvedVolume collapse (slider sits at 0 when muted=true so
 *    the user can drag-up to unmute in a single gesture),
 *  - the tooltip percentage formatter.
 *
 * Does NOT own the underlying `methods.toggleMute()` /
 * `methods.setVolume()` calls — emits `update:muted` and
 * `update:volume` so the parent stays the source of truth for
 * media-side mutations.
 *
 * ## Design surface (#429)
 *
 * The component shipped with NO visual prop and NO declared token, so a
 * theme could reach it neither through `IOrigamTheme.components` (nothing
 * to name) nor through `IOrigamTheme.vars` (nothing declared) — only a
 * raw CSS override worked, which inverts the DS's props-first rule.
 *
 * It now extends the four Commons surfaces that carry real meaning for a
 * round icon button, each consumed by its own composable rather than a
 * hand-rolled parser:
 *
 *  - {@link IColorProps}   → `useTextColor`  — the icon / `currentColor`
 *    channel. The hover wash and the scrubber inside the tooltip are both
 *    `color-mix(… currentColor …)`, so `color` repaints the whole widget.
 *  - {@link IRoundedProps} → `useRounded`    — corner radius, `full` by
 *    default (the historic hardcoded `50%`).
 *  - {@link ISizeProps}    → `useSize`       — the button box, five rungs
 *    plus the free-form escape hatch (`size="28px"`, `size={28}`).
 *  - {@link IDensityProps} → `useDensity`    — a ±8px offset ON TOP of the
 *    size rung, same grammar as `OrigamBtn` / `OrigamSelectionControl`, so
 *    a controller row can tighten every control at once.
 *
 * Everything else is themeable through the `--origam-media-volume-control*`
 * tokens declared in `assets/css/tokens/{light,dark}.css`.
 */
export interface IMediaVolumeControlProps extends ICommonsComponentProps, IColorProps, IRoundedProps, ISizeProps, IDensityProps {
    /**
     * Linear volume in `[0, 1]`. Typically `state.volume.value`.
     * Required.
     */
    volume: number
    /**
     * Whether the media is muted. When `true`, the slider collapses
     * to 0 (resolvedVolume rule) and the icon becomes VOLUME_OFF.
     * Required.
     */
    muted: boolean
    /**
     * `aria-label` rendered on the toggle button when the media is
     * NOT muted (clicking will mute). Already-translated. Required.
     */
    muteLabel: string
    /**
     * `aria-label` rendered on the toggle button when the media IS
     * muted (clicking will unmute). Already-translated. Required.
     */
    unmuteLabel: string
    /**
     * `aria-label` rendered on the vertical scrubber inside the
     * tooltip. Already-translated. Required.
     */
    volumeLabel: string
    /**
     * Optional `data-cy` prefix used on the toggle button. The
     * tooltip wrapper + scrubber expose their own selectors via
     * convention (`${dataCy}-wrapper`, `${dataCy}-scrubber`).
     *
     * @default 'origam-media-volume-control'
     */
    dataCy?: string
}

/**
 * Emits surfaced by `<OrigamMediaVolumeControl>`. The atom does NOT
 * call `methods.*` directly; the parent owns the media-side
 * mutations.
 */
export interface IMediaVolumeControlEmits {
    /** The mute toggle button was clicked. Payload is the proposed
     *  new muted state (i.e. `!muted`). */
    (e: 'update:muted', muted: boolean): void
    /** The vertical scrubber moved. Payload is the new linear
     *  volume in `[0, 1]`. The parent must call `setVolume()` AND
     *  toggle mute as appropriate (rising from 0 → unmute, falling
     *  to 0 → mute). */
    (e: 'update:volume', volume: number): void
}

/*********************************************************
 * IMediaVolumeControlSlots
 *
 * @description
 * Slot signatures for `<OrigamMediaVolumeControl>` — none. The button
 * icon, tooltip and scrubber are entirely driven by props.
 ********************************************************/
export interface IMediaVolumeControlSlots {}
