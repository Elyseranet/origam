import type { TVideoTrackKind } from '../../types'

/**
 * A single `<track>` declaration attached to the `<video>` element.
 * Mirrors the HTML attributes of the native element 1:1 so consumers
 * don't have to learn a new shape — pass the same dictionary they'd
 * pass to a vanilla `<video>` markup.
 *
 * The component renders one `<track>` per item, and the custom captions
 * toggle picks the first item whose `default` is true; the user can
 * then cycle through the others via the in-toolbar dropdown.
 */
export interface IVideoTrack {
    /**
     * `kind` of the track. `'captions'` is the default — used by the
     * built-in captions switcher. `'subtitles'` is treated the same way
     * for switching purposes; `'descriptions'` and `'chapters'` are
     * declared but not surfaced in the default toolbar (consumers
     * needing those expose their own `#controls` slot).
     */
    kind: TVideoTrackKind
    /**
     * URL of the WebVTT file. Same-origin or CORS-enabled, otherwise
     * the browser silently rejects the track.
     */
    src: string
    /**
     * BCP-47 language tag — `'en'`, `'fr'`, `'pt-BR'`, … Drives the
     * language label shown in the captions switcher and is exposed to
     * assistive technology via the underlying `<track srclang>`.
     */
    srclang: string
    /**
     * Human-readable label shown in the switcher (`"English"`,
     * `"Français"`, …). Defaults to the uppercased `srclang` when
     * omitted.
     */
    label?: string
    /**
     * Marks this track as the one to enable on load. At most one track
     * per kind should be flagged — if multiple are passed, the first
     * one wins.
     */
    default?: boolean
}

/**
 * A single `<source>` entry when the consumer passes multiple media
 * URLs (typically one `mp4` + one `webm` so the browser picks whichever
 * codec it can decode).
 */
export interface IVideoSource {
    /** Absolute or root-relative URL to the media file. */
    src: string
    /**
     * MIME type — `"video/mp4"`, `"video/webm"`, `"application/vnd.apple.mpegurl"`
     * for HLS, etc. Optional but recommended: it lets the browser skip
     * sources it can't decode without a network round-trip.
     */
    type?: string
    /**
     * Quality identifier used to group multiple sources of the same
     * content at different resolutions / bitrates (e.g. `"1080p"`,
     * `"720p"`, `"480p"`, `"4K"`, `"auto"`).
     *
     * When ≥ 2 sources expose distinct `quality` values, OrigamVideo
     * shows a "Quality" entry in the settings (cog) menu and lets the
     * user swap between them. The currently-playing source is then
     * matched on `quality` rather than on codec.
     */
    quality?: string
    /**
     * Optional human-readable label override for the quality switcher
     * menu. Defaults to the `quality` value when not provided. Use
     * this for cases like `quality: "auto"` rendered as `"Auto (720p)"`.
     */
    label?: string
}
