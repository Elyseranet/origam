/**
 * Controls rendering strategy for a media-playing component.
 *
 * - `CUSTOM` — the component paints its own toolbar UI. The underlying
 *   native element is rendered WITHOUT the native `controls` attribute
 *   so the two UIs do not stack.
 * - `NATIVE` — the native element receives the browser's own
 *   `controls` attribute / UI. No custom UI is rendered. Useful when
 *   the platform's own accessibility shortcuts matter more than a
 *   unified visual identity.
 * - `NONE` — neither UI is rendered; the consumer drives playback
 *   programmatically (slot / exposed composable methods).
 */
export enum CONTROLS_SOURCE {
    CUSTOM = 'custom',
    NATIVE = 'native',
    NONE = 'none'
}
