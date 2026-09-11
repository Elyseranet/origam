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
export type TVideoTrackKind = 'captions' | 'subtitles' | 'descriptions' | 'chapters'
