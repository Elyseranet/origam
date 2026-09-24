import type { IOptions } from '@origam/interfaces'

/**
 * Choices for the `border` prop. The composable accepts a single
 * value that may encode width / style / color / direction:
 *
 *   • boolean `true`           → utility `thin`
 *   • utility keywords         → `'none' | 'thin' | 'thick'`
 *   • directional keywords     → `'top' | 'right' | 'bottom' | 'left' | 'block' | 'inline'`
 *   • free-form CSS string     → `'4px dashed red'`, `'2px solid var(--origam-color__action--primary---bg)'`, …
 *   • raw number (px width)    → `2`
 *
 * Width, style, color and position can all be routed through this one
 * prop via the free-form strings below. Standalone `borderColor` /
 * `borderStyle` props also exist (see `borderStyleList`) for components
 * that need to override only the colour or the style — handy for the
 * outlined Btn variant whose width is theme-driven.
 */
export const borderList: Array<IOptions<boolean | number | string | undefined>> = [
    // ── Off / boolean ───────────────────────────────────────────
    { label: 'No Border', value: false },
    { label: 'Border (legacy boolean → thin)', value: true },

    // ── Utility widths ──────────────────────────────────────────
    // ⛔ #730 — les largeurs annoncées ici doivent rester collées à
    // `BORDER_KEYWORD_WIDTH` (consts/Commons/border.const.ts), seul endroit
    // qui décide à quel échelon de `--origam-border__width---*` chaque
    // mot-clé renvoie. L'échelle ne compte que quatre échelons — 0px / thin
    // 1px / 2px / 4px — et aucun ne vaut 3px : `thick` pointe sur l'échelon
    // `2`, mesuré à 2px dans le navigateur. Le libellé annonçait 3px, ce qui
    // faisait passer un rendu correct pour un défaut de composant.
    { label: 'Width — thin (utility, 1px)', value: 'thin' },
    { label: 'Width — thick (utility, 2px)', value: 'thick' },

    // ── Numeric widths ──────────────────────────────────────────
    { label: 'Width — 4px', value: 4 },
    { label: 'Width — 8px', value: 8 },

    // ── Style variants (free-form CSS) ──────────────────────────
    { label: 'Style — 2px dashed', value: '2px dashed' },
    { label: 'Style — 2px dotted', value: '2px dotted' },
    { label: 'Style — 3px double', value: '3px double' },
    { label: 'Style — 4px groove', value: '4px groove' },

    // ── Color variants (free-form CSS) ──────────────────────────
    { label: 'Color — 2px solid primary', value: '2px solid var(--origam-color__action--primary---bg)' },
    { label: 'Color — 2px solid success', value: '2px solid var(--origam-color__feedback--success---bg)' },
    { label: 'Color — 2px solid danger',  value: '2px solid var(--origam-color__feedback--danger---bg)' },
    { label: 'Color — 3px dashed orange', value: '3px dashed #ff8a00' },

    // ── Position keywords ───────────────────────────────────────
    { label: 'Position — top',    value: 'top' },
    { label: 'Position — right',  value: 'right' },
    { label: 'Position — bottom', value: 'bottom' },
    { label: 'Position — left',   value: 'left' },
    { label: 'Position — block (top + bottom)',  value: 'block' },
    { label: 'Position — inline (left + right)', value: 'inline' },
]

/**
 * Choices for the standalone `borderStyle` prop (CSS `border-style`
 * line-style keywords). Consumed alongside `borderColor` when a
 * component needs to tweak only the style without re-stating the
 * shorthand.
 */
export const borderStyleList: Array<IOptions<string>> = [
    { label: 'solid', value: 'solid' },
    { label: 'dashed', value: 'dashed' },
    { label: 'dotted', value: 'dotted' },
    { label: 'double', value: 'double' },
    { label: 'groove', value: 'groove' },
    { label: 'ridge', value: 'ridge' },
]
