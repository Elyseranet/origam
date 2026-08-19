import OrigamVideo from '../../components/Video/OrigamVideo.vue'
import { VIDEO_TRACK_KIND } from '../../enums/Video/video.enum'
import type { TControlsSource } from '../Commons/controls.type'

export type TOrigamVideo = InstanceType<typeof OrigamVideo>

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
 *
 * Full range of the Commons `TControlsSource` (see
 * `Commons/controls.type.ts`) — mirrors `TAudioControls`, which is the
 * `custom | native` subset (Audio has no `none`).
 */
export type TVideoControls = TControlsSource

/**
 * `kind` attribute of a WebVTT `<track>` element. We expose the four
 * values that are useful in a player UI — `'metadata'` is left out
 * because it is invisible by design and meant for programmatic
 * consumption only (out of scope for the default toolbar's caption
 * switcher).
 *
 * See https://html.spec.whatwg.org/multipage/media.html#attr-track-kind
 * for the full list of legal values.
 */
export type TVideoTrackKind = `${VIDEO_TRACK_KIND}`
