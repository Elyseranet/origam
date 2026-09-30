/*********************************************************
 * OPACITY_RUNG_VARS
 *
 * @description
 * The 0..100 percent rungs of the primitive opacity ladder, mapped to the
 * `var()` expression `useOpacity` emits for each. Keys are the rung names
 * as they appear in the token suffix and in the utility class.
 *
 * @description
 * ⛔ WRITTEN AS WHOLE LITERAL STRINGS ON PURPOSE, not assembled from a
 * prefix plus the key. `token-var-channels` scans `.ts` sources for the
 * literal text `var(--origam-…)` to decide whether a declared token is
 * read by anybody; a name concatenated at runtime
 * (`var(${PREFIX}${rung})`) matches nothing, so every rung here would be
 * reported DORMANT and the guard would redden. That is the same blind
 * spot #813 shipped through and #823 exists to close — see the
 * `SHADOW_TOKEN_PREFIX` banner in `elevation.const.ts` for the version of
 * this trap that already cost the repo a release.
 *
 * @description
 * Each reference carries a literal fallback, the shape CLAUDE.md names as
 * the one to copy (`useRounded`'s `var(--origam-radius---md, 8px)`). The
 * ladder is declared in `primitive.css` / `_primitive.scss`, so the
 * fallback is inert today; it stops the declaration from being destroyed
 * outright should a consumer ship the component CSS without the token
 * sheet.
 ********************************************************/
export const OPACITY_RUNG_VARS: Readonly<Record<string, string>> = {
    '0': 'var(--origam-opacity---0, 0)',
    '12': 'var(--origam-opacity---12, 0.12)',
    '26': 'var(--origam-opacity---26, 0.26)',
    '32': 'var(--origam-opacity---32, 0.32)',
    '50': 'var(--origam-opacity---50, 0.5)',
    '60': 'var(--origam-opacity---60, 0.6)',
    '70': 'var(--origam-opacity---70, 0.7)',
    '87': 'var(--origam-opacity---87, 0.87)',
    '100': 'var(--origam-opacity---100, 1)'
}

/*********************************************************
 * OPACITY_UTILITY_CLASS_PREFIX
 *
 * @description
 * Root of the global opacity utility classes emitted by `useOpacity`
 * (`.origam--opacity-70`, ...). Declared in
 * `src/assets/css/tokens/origam-utilities.css`.
 ********************************************************/
export const OPACITY_UTILITY_CLASS_PREFIX = 'origam--opacity-'

/*********************************************************
 * OPACITY_FRACTION_CEILING
 *
 * @description
 * Boundary between the two numeric readings of `TOpacity`. A value at or
 * below it is a CSS fraction; above it, a 0..100 percentage.
 *
 * @description
 * Named rather than inlined so the one place that decides `opacity={1}`
 * means "opaque" and not "1 %" is greppable — see {@link TOpacity} for
 * why that call was made.
 ********************************************************/
export const OPACITY_FRACTION_CEILING = 1

/*********************************************************
 * OPACITY_PERCENT_SCALE
 *
 * @description
 * Divisor turning a percent-scale `opacity` into the CSS fraction it
 * denotes, for the values that name no token rung (`42` -> `0.42`).
 ********************************************************/
export const OPACITY_PERCENT_SCALE = 100
