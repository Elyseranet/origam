/*********************************************************
 * PLAYGROUND_SCENE_ERROR
 *
 * @description
 * The short codes the standalone host writes to
 * `document.documentElement.dataset.playgroundError` when a scene handed over
 * from outside (URL) cannot be shown. Part of the external-driving contract
 * (#1441): a driver reads the code, never the visible message.
 ********************************************************/
export enum PLAYGROUND_SCENE_ERROR {
    /** `scene` / `props` / `slot` is not valid base64url, or not valid UTF-8 / JSON. */
    DECODE_FAILED = 'decode_failed',
    /** The decoded value is not an `IPlaygroundScene` (or `props` is not a JSON object). */
    INVALID_SCENE = 'invalid_scene',
    /** `scene.version` is not the `SCENE_VERSION` this build reads. */
    VERSION_MISMATCH = 'version_mismatch',
    /** A `componentName` / `component` tag the catalogue does not carry. */
    UNKNOWN_COMPONENT = 'unknown_component',
    /** The scene was accepted but an instance threw while rendering. */
    RENDER_FAILED = 'render_failed',
    /** Nothing rendered within the readiness budget. */
    RENDER_TIMEOUT = 'render_timeout'
}
