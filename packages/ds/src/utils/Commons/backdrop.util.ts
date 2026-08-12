import { CUSTOM_BACKDROP_FILTER_REGEX } from '../../consts'

/**
 * Whether a string is a free-form custom `backdrop-filter` value (not an
 * origam-native blur rung name, not a bare CSS length) that should be
 * emitted verbatim as an inline `backdrop-filter` declaration. Mirrors
 * `isCustomBoxShadow` (`elevation.util.ts`) — same permissive, signal-based
 * detection instead of a strict `<filter-function-list>` grammar parser.
 *
 * @param value a candidate `backdrop-filter` value, e.g.
 *   `'blur(8px) saturate(1.4)'`, `'var(--my-filter)'`.
 */
export function isCustomBackdropFilter (value: string): boolean {
    return CUSTOM_BACKDROP_FILTER_REGEX.test(value.trim())
}
