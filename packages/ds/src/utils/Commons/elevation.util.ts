import { CUSTOM_BOX_SHADOW_REGEX } from '../../consts'
import type { TColor, THSLA } from "../../types"
import { convertToUnit, HSVtoHSL, isParsableColor, normalize, parseColor, RGBtoHSV, roundTo } from "../../utils"

/**
 * Whether a string is a free-form custom `box-shadow` value (not an
 * origam-native rung name, not a Material 0..24 number) that should be
 * emitted verbatim as an inline `box-shadow` declaration. Mirrors
 * `isCustomBorderRadius` (`rounded.util.ts`) — same permissive,
 * signal-based detection instead of a strict grammar parser.
 *
 * @param value …
 */
export function isCustomBoxShadow (value: string): boolean {
    return CUSTOM_BOX_SHADOW_REGEX.test(value.trim())
}

/**
 * @deprecated Since v0.4 — replaced by the `--origam-shadow-{xs|sm|md|lg|xl}`
 *   design tokens generated from `tokens/primitive.json`. The new
 *   `useElevation` composable emits `box-shadow: var(--origam-shadow-…)`
 *   directly, which lets the theme system control shadow appearance per
 *   light / dark / brand-x variant.
 *
 *   Will be removed in v3.0.0. Migrate by:
 *     - removing any direct `formatElevationStyle(level, bgColor)` call,
 *     - or by switching to `@include ds-elevation('md')` from the SCSS
 *       helpers shipped in `src/assets/scss/_helpers.scss`.
 *
 *   Kept as-is for the duration of the migration window so consumers who
 *   imported it directly do not break at upgrade time.
 */
export function formatElevationStyle (elevation: number = 0, bgColor?: TColor) {
    const blurRadius = roundTo(normalize(elevation * .04, 0, 1, 0, 16), 1);
    const offsetX = roundTo(normalize(elevation * .04, 0, 1, 0, 8), 1);
    const offsetY = roundTo(normalize(elevation * .04, 0, 1, 0, 16), 1);
    const opacity = roundTo(normalize(elevation * .04, 0, 1, 0.5, 0.25), 2);
    let color: THSLA = {h: 0, s: 0, l: 0}

    if (typeof bgColor === 'string' && isParsableColor(bgColor)) {
        color = HSVtoHSL(RGBtoHSV(parseColor(bgColor)))
    }

    return `box-shadow: ${convertToUnit(offsetX)} ${convertToUnit(offsetY)} ${convertToUnit(blurRadius)} hsl(${convertToUnit(color.h, 'deg')} ${convertToUnit(color.s * 100, '%')} ${convertToUnit(color.l * 100, '%')} / ${opacity.toFixed(2)})`
}
