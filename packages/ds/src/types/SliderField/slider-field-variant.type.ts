import { SLIDER_FIELD_VARIANT } from '../../enums'

/**
 * Visual variant of `<OrigamSliderField>`. Drives the rendering path:
 * - `'field'`  → wrapped in `<origam-input>` (label, messages, …).
 * - `'timer'`  → bare wrapper, sober video-scrubber look.
 * - `'audio'`  → bare wrapper + waveform background painted from `peaks`.
 *
 * Default is `'field'` (no behavioural break vs. Phase 1).
 */
export type TSliderFieldVariant = `${SLIDER_FIELD_VARIANT}`
