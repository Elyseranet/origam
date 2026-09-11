import type { ICommonsComponentProps } from '../../interfaces'

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
 */
export interface IMediaVolumeControlProps extends ICommonsComponentProps {
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
