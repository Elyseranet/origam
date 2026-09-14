/**
 * Visual variants of `<OrigamSliderField>`.
 *
 * - `FIELD` (default) — current behaviour with the full `<origam-input>`
 *                       chrome (label + messages + prepend/append).
 *                       Used by `OrigamColorPickerPreview`, settings panels,
 *                       any form-grade slider.
 * - `TIMER`            — bare wrapper (no `<origam-input>`), sober
 *                       video-scrubber look: hairline rail (2 px at rest,
 *                       4 px on hover/focus), thumb hidden until hover.
 *                       Used by `OrigamMediaController` for the timeline
 *                       scrubber + volume slider (Phase 4 migration).
 * - `AUDIO`            — same as `TIMER`, plus a waveform background
 *                       painted from the `peaks` prop. Used by
 *                       `OrigamAudio` (Phase 3) for its waveform scrubber.
 */
export enum SLIDER_FIELD_VARIANT {
    FIELD = 'field',
    TIMER = 'timer',
    AUDIO = 'audio'
}
