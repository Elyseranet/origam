/**
 * `kind` attribute of a WebVTT `<track>` element exposed by
 * `<OrigamVideo>`'s caption switcher. Mirrors the four values the
 * toolbar cares about — see `TVideoTrackKind` for the full rationale
 * (the fifth spec value, `'metadata'`, is intentionally out of scope).
 */
export enum VIDEO_TRACK_KIND {
    CAPTIONS = 'captions',
    SUBTITLES = 'subtitles',
    DESCRIPTIONS = 'descriptions',
    CHAPTERS = 'chapters'
}
