/**
 * Controls rendering strategy for `<OrigamVideo>`.
 *
 * - `'custom'` (default): the component paints its own toolbar with
 *   play/pause, scrubber, volume, captions, PIP and fullscreen buttons.
 *   The `<video>` element is rendered WITHOUT the native `controls`
 *   attribute so the two UIs do not stack.
 * - `'native'`: the `<video>` element receives the native `controls`
 *   attribute and the browser paints its own toolbar. No custom UI is
 *   rendered. Useful when the consumer needs the platform-specific
 *   accessibility shortcuts (e.g. AirPlay button on Safari) or when
 *   rendering inside a Tauri shell that talks to native players.
 * - `'none'`: neither the custom nor the native toolbar is rendered.
 *   The consumer drives playback programmatically through the
 *   `#controls` slot or the exposed composable methods.
 */
export type TVideoControls = 'custom' | 'native' | 'none'
