/*********************************************************
 * ORIGAM_SHADOW_RUNGS
 *
 * @description
 * Origam-native shadow rungs accepted as a string `elevation` prop
 * on every component that consumes the `useElevation` composable.
 * Matches the token rungs under `--origam-shadow-{rung}` in
 * `src/assets/css/tokens/origam-utilities.css`.
 *
 * @description
 * Lookup is identity (rung name == token suffix). Numeric inputs
 * still flow through `elevationToToken` separately.
 ********************************************************/
export const ORIGAM_SHADOW_RUNGS: ReadonlySet<string> = new Set([
    'none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'
])

/*********************************************************
 * UTILITY_SHADOW_RUNGS
 *
 * @description
 * Subset of shadow rungs for which a global utility class exists in
 * `src/assets/css/tokens/origam-utilities.css` (Phase 1 manifest).
 * `2xl` and `3xl` are not emitted as utilities — they take the
 * inline-style path instead.
 *
 * @description
 * ⚠️ This comment used to say they « fall back » to that path. The word
 * was reassuring for nothing: the inline path emitted a BARE
 * `var(--origam-shadow---2xl)`, and no sheet declares that token, so the
 * repli led to an unresolvable reference rather than to a value (#813).
 * The declaration then lost at computed-value time — and since it had
 * ALREADY won the cascade, it did not cede to the component's own rule,
 * it ERASED it. See {@link SHADOW_RUNG_FALLBACK}.
 ********************************************************/
export const UTILITY_SHADOW_RUNGS: ReadonlySet<string> = new Set([
    'none', 'xs', 'sm', 'md', 'lg', 'xl'
])

/*********************************************************
 * SHADOW_RUNG_FALLBACK
 *
 * @description
 * Second argument of the `var()` emitted by `useElevation`, for the rungs
 * `ORIGAM_SHADOW_RUNGS` accepts but NO sheet declares. Keyed by rung; a
 * rung absent from this map is emitted as a bare `var()` because its token
 * genuinely exists.
 *
 * @description
 * ⛔ #813 — `2xl` and `3xl` are accepted by the prop and declared nowhere.
 * Measured in Chromium: a component rule `rgba(0,0,0,.9) 0 1px 2px`
 * computed `none` once `elevation="2xl"` was passed. The unresolvable
 * reference does not merely fail to paint, it DESTROYS the shadow the
 * component already had.
 *
 * @description
 * The fallback targets `xl`, the top declared rung. Consequence, and it is
 * deliberate: **`2xl` and `3xl` render exactly like `xl`** — they stop
 * erasing, they do not become two extra rungs. Declaring real `2xl` / `3xl`
 * tokens is a DESIGN decision, not a bug fix: the ladder has no derivable
 * progression (`md` is a different family — a 1px ring plus a soft shadow)
 * and `xl` is already the top of the Material 0..24 scale this DS maps
 * (`MATERIAL_ELEVATION_TOP_RUNG`). There is no rung above to borrow from.
 * The day those tokens are declared, this fallback goes inert on its own —
 * nothing here has to be undone.
 *
 * @description
 * ⚠️ The fallback MUST be a real shadow. `var(--origam-shadow---2xl, none)`
 * was measured too: the declaration becomes valid but computes `none`,
 * i.e. visually identical to the defect. A `none` fallback fixes nothing.
 *
 * @description
 * Mirrors the intent of `UTILITY_RADIUS_FALLBACK` (`spacing.const.ts`),
 * which is why `useRounded` never had this defect. It deliberately does NOT
 * mirror its SHAPE: that map gives every rung a hard literal (`md: '8px'`),
 * which for a 3-layer box-shadow would mean copying the token values into
 * TypeScript — duplication plus guaranteed drift the first time a designer
 * retunes `xl`. A var-to-var fallback carries no value at all.
 ********************************************************/
export const SHADOW_RUNG_FALLBACK: Readonly<Record<string, string>> = {
    '2xl': 'var(--origam-shadow---xl)',
    '3xl': 'var(--origam-shadow---xl)'
}

/*********************************************************
 * MATERIAL_ELEVATION_LADDER
 *
 * @description
 * Bucketisation of a numeric Material-style elevation (`0..24`) onto the
 * 6-token origam shadow ladder. Read in order: the first entry whose
 * `maxLevel` is `>=` the requested level wins; anything above the last
 * entry falls through to `MATERIAL_ELEVATION_TOP_RUNG`.
 *
 * @description
 * Buckets are intentionally chunky — the Material 25-step ladder
 * collapses into a 6-token visual ladder. Tuned against the existing
 * usage in OrigamCard / OrigamBadge / OrigamChip.
 ********************************************************/
export const MATERIAL_ELEVATION_LADDER: ReadonlyArray<{ maxLevel: number, rung: string }> = [
    {maxLevel: 0, rung: 'none'},
    {maxLevel: 1, rung: 'xs'},
    {maxLevel: 3, rung: 'sm'},
    {maxLevel: 8, rung: 'md'},
    {maxLevel: 16, rung: 'lg'}
]

/*********************************************************
 * MATERIAL_ELEVATION_TOP_RUNG
 *
 * @description
 * Rung used for any level above the last `MATERIAL_ELEVATION_LADDER` bucket.
 ********************************************************/
export const MATERIAL_ELEVATION_TOP_RUNG = 'xl'

/*********************************************************
 * ELEVATION_LEGACY_BG_COLOR
 *
 * @description
 * Historical default of the (deprecated, ignored) `bgColor` parameter of
 * `useElevation`. Any other value triggers the deprecation warning.
 ********************************************************/
export const ELEVATION_LEGACY_BG_COLOR = 'rgb(0,0,0)'

/*********************************************************
 * ELEVATED_CLASS_SUFFIX
 *
 * @description
 * BEM modifier appended to the component name when an elevation is set.
 ********************************************************/
export const ELEVATED_CLASS_SUFFIX = '--elevated'

/*********************************************************
 * SHADOW_UTILITY_CLASS_PREFIX
 *
 * @description
 * Root of the global shadow utility classes emitted by `useElevation`
 * (`.origam--shadow-md`, …). Declared in
 * `src/assets/css/tokens/origam-utilities.css`.
 ********************************************************/
export const SHADOW_UTILITY_CLASS_PREFIX = 'origam--shadow-'

/*********************************************************
 * SHADOW_TOKEN_PREFIX
 *
 * @description
 * Root of the shadow design tokens (`--origam-shadow---md`, …) read by
 * the inline-style path of `useElevation`.
 ********************************************************/
export const SHADOW_TOKEN_PREFIX = '--origam-shadow---'

/*********************************************************
 * ELEVATION_BG_COLOR_DEPRECATION_WARNING
 *
 * @description
 * Emitted once when a consumer still passes the deprecated `bgColor`
 * parameter to `useElevation`.
 ********************************************************/
export const ELEVATION_BG_COLOR_DEPRECATION_WARNING =
    '[origam] useElevation: the `bgColor` parameter is deprecated and ignored. '
    + 'Shadows now resolve from the design tokens (`--origam-shadow-*`) and switch with the active theme. '
    + 'The parameter will be removed in v3.0.0.'

/*********************************************************
 * CUSTOM_BOX_SHADOW_REGEX
 *
 * @description
 * Detects a free-form custom `box-shadow` value that is neither an
 * origam-native rung name (`ORIGAM_SHADOW_RUNGS`) nor a Material 0..24
 * number — e.g. `'0 4px 12px rgba(0,0,0,.24)'`, a `var(--origam-shadow---card)`
 * / `calc(...)` reference, multiple comma-separated shadow layers, or an
 * `inset` shadow.
 *
 * @description
 * Mirrors `CUSTOM_BORDER_RADIUS_REGEX` (`rounded.const.ts`): deliberately
 * permissive, not a full box-shadow grammar validator. It only checks that
 * the string carries at least one signal a real `box-shadow` value would
 * have — a CSS function call (`var(`, `calc(`, `clamp(`, `rgb(`, `rgba(`,
 * `hsl(`, `hsla(`, `hwb(`, `color-mix(`, …), a hex color, a CSS length with
 * a unit, or the `inset` keyword. Anything that matches none of these is
 * treated as not-a-shadow and falls through to the existing (silent-drop)
 * behaviour — no regression for genuinely invalid input.
 *
 * @description
 * Example matches: `'0 4px 12px rgba(0,0,0,.24)'`, `'var(--origam-shadow---card)'`,
 * `'inset 0 0 0 2px #fff'`, `'0 1px 2px #000, 0 2px 8px #000'`.
 ********************************************************/
export const CUSTOM_BOX_SHADOW_REGEX = /(?:var|calc|clamp|min|max|env|rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color-mix)\(|#[0-9a-f]{3,8}\b|[\d.]+(?:px|pt|pc|in|cm|mm|q|em|rem|ex|ch|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|%)|\binset\b/i
