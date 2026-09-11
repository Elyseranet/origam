import { HSLtoRGB, HSVtoRGB } from '../../utils'

export const CSS_COLOR_REGEX = /^(?<fn>(?:rgb|hsl)a?)\((?<values>.+)\)/

/**
 * The 148 CSS named colors plus the special CSS-wide keywords
 * (`transparent`, `currentColor`, `inherit`, `initial`, `unset`,
 * `revert`). Used by `isCssColor` so consumers can pass `'red'` /
 * `'white'` / `'transparent'` directly without going through hex/rgb.
 */
export const CSS_NAMED_COLORS = new Set([
    'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure',
    'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood',
    'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan',
    'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki',
    'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon',
    'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet',
    'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue',
    'firebrick', 'floralwhite', 'forestgreen', 'fuchsia',
    'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey',
    'honeydew', 'hotpink',
    'indianred', 'indigo', 'ivory',
    'khaki',
    'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
    'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon',
    'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue', 'lightyellow',
    'lime', 'limegreen', 'linen',
    'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple',
    'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred',
    'midnightblue', 'mintcream', 'mistyrose', 'moccasin',
    'navajowhite', 'navy',
    'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid',
    'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff',
    'peru', 'pink', 'plum', 'powderblue', 'purple',
    'rebeccapurple', 'red', 'rosybrown', 'royalblue',
    'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue',
    'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue',
    'tan', 'teal', 'thistle', 'tomato', 'turquoise',
    'violet',
    'wheat', 'white', 'whitesmoke',
    'yellow', 'yellowgreen',
    // CSS-wide keywords
    'currentcolor', 'transparent', 'inherit', 'initial', 'unset', 'revert',
])

export const COLOR_MAPPERS = {
    rgb: (r: number, g: number, b: number, a?: number) => ({r, g, b, a}),
    rgba: (r: number, g: number, b: number, a?: number) => ({r, g, b, a}),
    hsl: (h: number, s: number, l: number, a?: number) => HSLtoRGB({h, s, l, a}),
    hsla: (h: number, s: number, l: number, a?: number) => HSLtoRGB({h, s, l, a}),
    hsv: (h: number, s: number, v: number, a?: number) => HSVtoRGB({h, s, v, a}),
    hsva: (h: number, s: number, v: number, a?: number) => HSVtoRGB({h, s, v, a})
}

export const SRGB_FORWARD_MATRIX = [
    [3.2406, -1.5372, -0.4986],
    [-0.9689, 1.8758, 0.0415],
    [0.0557, -0.2040, 1.0570]
]
export const SRGB_REVERSE_MATRIX = [
    [0.4124, 0.3576, 0.1805],
    [0.2126, 0.7152, 0.0722],
    [0.0193, 0.1192, 0.9505]
]
export const SRGB_FORWARD_TRANSFORM = (C: number): number => (
    C <= 0.0031308
        ? C * 12.92
        : 1.055 * C ** (1 / 2.4) - 0.055
)
export const SRGB_REVERSE_TRANSFORM = (C: number): number => (
    C <= 0.04045
        ? C / 12.92
        : ((C + 0.055) / 1.055) ** 2.4
)
export const COLOR_DELTA = 0.20689655172413793 // 6÷29
export const CIELAB_FORWARD_TRANSFORM = (t: number): number => (
    t > COLOR_DELTA ** 3
        ? Math.cbrt(t)
        : (t / (3 * COLOR_DELTA ** 2)) + 4 / 29
)
export const CIELAB_REVERSE_TRANSFORM = (t: number): number => (
    t > COLOR_DELTA
        ? t ** 3
        : (3 * COLOR_DELTA ** 2) * (t - 4 / 29)
)
export const MAIN_TRC = 2.4

// ── Intent runtime detection ────────────────────────────────────────────────
// Runtime set of every semantic intent recognised by `useColorEffect` /
// `useColor`. Keep this in sync with the `TIntent` type — adding a new
// intent there must also add the literal here, otherwise the type guard
// `isIntent` will reject it at runtime.
export const COLOR_INTENTS: ReadonlySet<string> = new Set([
    'neutral', 'primary', 'secondary', 'ghost',
    'success', 'warning', 'danger', 'info'
])

// Subset of `COLOR_INTENTS` for which a global utility class ships in
// `src/assets/css/tokens/origam-utilities.css` (Phase 1 manifest).
//
// `ghost` is intentionally excluded — the design system does not ship
// `.origam--bg-ghost` because the intent is meant to be a transparent
// surface that adopts the parent's color, which can't be expressed by
// a single utility class. Falls back to the inline-style path.
export const COLOR_UTILITY_INTENTS: ReadonlySet<string> = new Set([
    'neutral', 'primary', 'secondary',
    'success', 'warning', 'danger', 'info'
])

// ── State darken progression (cross-component) ──────────────────────────────
// Hover / active states derive from the rest-state bgColor by mixing
// with black. The percentages below are the math-fallback values used
// when a designer-tuned `bgHover` / `bgActive` token is missing.
export const COLOR_HOVER_MIX_PCT = 20
export const COLOR_ACTIVE_MIX_PCT = 30

export const RCO = 0.2126729
export const GCO = 0.7151522
export const BCO = 0.0721750

export const NORM_BG = 0.55
export const REV_BG = 0.62
export const NORM_TXT = 0.58
export const REV_TXT = 0.57

export const BLK_THRS = 0.03
export const BLK_CLMP = 1.45
export const COLOR_DELTA_Y_MIN = 0.0005
export const SCALE_B_O_W = 1.25
export const SCALE_W_O_B = 1.25
export const LO_CON_THRESH = 0.078
export const LO_CON_FACTOR = 12.82051282051282
export const LO_CON_OFFSET = 0.06
export const LO_CLIP = 0.001
