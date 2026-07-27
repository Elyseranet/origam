export const SEARCH_SHORTCUT = '⌘K'

/** Minimum GitHub star count before the appbar star button is worth showing —
 *  a low/zero count reads as low traction, so hide it until it's meaningful. */
export const GITHUB_STARS_MIN_DISPLAY = 1000

/** Fallback star count used until /api/github-stars resolves (or on error). */
export const GITHUB_STARS_FALLBACK = 0
