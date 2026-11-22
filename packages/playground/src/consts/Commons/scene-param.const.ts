/*********************************************************
 * External scene contract (#1441)
 *
 * @description
 * The URL parameters and `<html>` data attributes through which a driver
 * (a headless browser, the MCP server) hands a scene to the standalone host
 * and learns when it is rendered. Documented in the README, section
 * "Pilotage externe" — renaming one breaks every driver.
 ********************************************************/
export const SCENE_PARAM = 'scene'
export const COMPONENT_PARAM = 'component'
export const PROPS_PARAM = 'props'
export const SLOT_PARAM = 'slot'

/** Set to `"true"` on `<html>` once the scene is rendered and stable. */
export const READY_DATASET_KEY = 'playgroundReady'

/** Set to a `PLAYGROUND_SCENE_ERROR` code on `<html>` when the scene cannot be shown. */
export const ERROR_DATASET_KEY = 'playgroundError'

/** Stamped on the root element of every rendered instance, value = instance id. */
export const PLAYGROUND_INSTANCE_ATTRIBUTE = 'data-playground-instance'

/** Quiet time with no DOM mutation before the scene counts as stable. */
export const READY_QUIET_MS = 150

/** Upper bound on waiting for a first render before `render_timeout`. */
export const READY_TIMEOUT_MS = 15000
