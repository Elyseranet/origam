import type { TControlsSource } from '../Commons/controls.type'

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
