import OrigamAudio from '../../components/Audio/OrigamAudio.vue'
import { AUDIO_LOOP_MODE, AUDIO_VARIANT } from '../../enums/Audio/audio.enum'
import type { TControlsSource } from '../Commons/controls.type'
import type { TInline } from '../Commons/anchor.type'

export type TOrigamAudio = InstanceType<typeof OrigamAudio>

/**
 * Controls rendering strategy for `<OrigamAudio>`.
 *
 * - `'custom'` (default): the component paints `<OrigamMediaController>`
 *   on top of the `<audio>` element. The `<audio>` is rendered WITHOUT
 *   the native `controls` attribute so the two UIs do not stack.
 * - `'native'`: the `<audio>` element receives the native `controls`
 *   attribute and the browser paints its own bar. No custom UI is
 *   rendered. Useful when the platform's accessibility shortcuts
 *   matter more than a unified visual identity.
 *
 * `custom | native` subset of the Commons `TControlsSource` (see
 * `Commons/controls.type.ts`) — Audio has no `'none'` variant, unlike
 * `TVideoControls`.
 */
export type TAudioControls = Exclude<TControlsSource, 'none'>

/**
 * String-typed equivalent of {@link AUDIO_LOOP_MODE}.
 */
export type TAudioLoopMode = `${AUDIO_LOOP_MODE}`

/**
 * String-typed equivalent of {@link AUDIO_VARIANT}. Lets callers pass
 * literal `'normal' | 'minimal'` strings on the SFC prop API while the
 * runtime still recognises the enum members.
 */
export type TAudioVariant = `${AUDIO_VARIANT}`

/**
 * String-typed equivalent of {@link COVER_POSITION}, which itself
 * mirrors {@link INLINE} (see `Commons/anchor.enum.ts`). Drives the
 * `coverPosition` prop of `<OrigamAudio>`.
 */
export type TCoverPosition = TInline
